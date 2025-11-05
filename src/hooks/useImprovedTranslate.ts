import { useState, useCallback, useRef } from 'react';
import { CVData } from '../types/cv';

interface TranslationProgress {
  current: number;
  total: number;
  percentage: number;
  cached?: boolean;
}

interface UseTranslateReturn {
  translateStream: (
    targetLang: string,
    data: CVData,
    onPartial: (text: string) => void,
    onDone: (result: CVData) => void,
    onError?: (error: Error) => void
  ) => () => void;
  isTranslating: boolean;
  progress: TranslationProgress;
  error: string | null;
  cancel: () => void;
}

const API_BASE_URL = 'http://localhost:4000';
const STREAM_TIMEOUT = 120000; // 2 minutes max for translation

export function useImprovedTranslate(): UseTranslateReturn {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress>({
    current: 0,
    total: 0,
    percentage: 0
  });
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTranslating(false);
    setError(null);
    setProgress({ current: 0, total: 0, percentage: 0 });
  }, []);

  const translateStream = useCallback((
    targetLang: string,
    data: CVData,
    onPartial: (text: string) => void,
    onDone: (result: CVData) => void,
    onError?: (error: Error) => void
  ): (() => void) => {
    // Reset state
    setError(null);
    setIsTranslating(true);
    setProgress({ current: 0, total: 0, percentage: 0 });

    // Create abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      const timeoutError = new Error('Translation timeout - please try again');
      setError(timeoutError.message);
      cancel();
      onError?.(timeoutError);
    }, STREAM_TIMEOUT);

    let accumulatedText = '';
    let isCancelled = false;

    const processStream = async () => {
      try {
        console.log(`🚀 Starting stream translation to ${targetLang}`);

        const response = await fetch(`${API_BASE_URL}/api/translate-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ targetLang, data }),
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body received');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          if (isCancelled) {
            console.log('❌ Translation cancelled by user');
            break;
          }

          const { value, done } = await reader.read();
          
          if (done) {
            console.log('✅ Stream complete');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            // Parse SSE format
            if (line.startsWith('event: ')) {
              const eventLines = line.split('\n');
              const eventType = eventLines[0].replace('event: ', '').trim();
              const dataLine = eventLines.find(l => l.startsWith('data: '));
              
              if (!dataLine) continue;

              const data = JSON.parse(dataLine.replace('data: ', ''));

              switch (eventType) {
                case 'start':
                  console.log(`📦 Starting translation: ${data.chunks} chunks`);
                  setProgress({
                    current: 0,
                    total: data.chunks,
                    percentage: 0,
                    cached: data.cached
                  });
                  
                  if (data.cached) {
                    console.log('✅ Using cached translation');
                  }
                  break;

                case 'chunk':
                  accumulatedText += data.text;
                  onPartial(accumulatedText);
                  
                  setProgress(prev => ({
                    ...prev,
                    current: prev.current + 1,
                    percentage: data.progress || Math.round(((prev.current + 1) / prev.total) * 100)
                  }));
                  
                  console.log(`📥 Chunk ${data.index} received (${data.progress}%)`);
                  break;

                case 'done':
                  console.log('✅ Translation complete');
                  
                  // Clear timeout
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }

                  try {
                    // Parse the accumulated text
                    const result = JSON.parse(accumulatedText);
                    setProgress({ current: 1, total: 1, percentage: 100 });
                    onDone(result);
                  } catch (parseError) {
                    console.error('❌ Failed to parse final JSON:', parseError);
                    throw new Error('Invalid translation response - please try again');
                  }
                  break;

                case 'error':
                  throw new Error(data.error || 'Translation failed');
              }
            }
          }
        }

      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Translation cancelled');
          return;
        }

        console.error('❌ Translation error:', err);
        
        let errorMessage = 'Translation failed';
        
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server - please check if the server is running';
        } else if (err.message.includes('429')) {
          errorMessage = 'API rate limit exceeded - please wait a minute and try again';
        } else if (err.message.includes('quota')) {
          errorMessage = 'API quota exceeded - please check your Gemini API key or wait until quota resets';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Translation timed out - your CV might be too large. Try again or contact support';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      } finally {
        if (!isCancelled) {
          setIsTranslating(false);
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    processStream();

    // Return cancel function
    return () => {
      isCancelled = true;
      cancel();
    };
  }, [cancel]);

  return {
    translateStream,
    isTranslating,
    progress,
    error,
    cancel
  };
}