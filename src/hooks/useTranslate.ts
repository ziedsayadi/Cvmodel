import { useState } from 'react';
import { CVData } from '../types/cv';
import { rebuildJSON } from '../utils/chunkHelpers';

interface TranslationProgress {
  current: number;
  total: number;
  percentage: number;
}

export const useTranslate = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress>({
    current: 0,
    total: 0,
    percentage: 0
  });
  const [error, setError] = useState<string | null>(null);

  const translateFast = async (targetLang: string, data: CVData): Promise<CVData> => {
    setIsTranslating(true);
    setError(null);
    setProgress({ current: 0, total: 0, percentage: 0 });

    try {
      const response = await fetch('http://localhost:4000/api/translate-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang, data }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const result = await response.json();
      setProgress({ current: 1, total: 1, percentage: 100 });
      return result as CVData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateStream = (
    targetLang: string,
    data: CVData,
    onChunk: (partial: string) => void,
    onComplete: (result: CVData) => void
  ): (() => void) => {
    setIsTranslating(true);
    setError(null);

    let assembledText = '';
    let aborted = false;

    const abortController = new AbortController();

    fetch('http://localhost:4000/api/translate-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLang, data }),
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!aborted) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: start')) {
              const dataLine = line.split('data: ')[1];
              const { chunks } = JSON.parse(dataLine);
              setProgress({ current: 0, total: chunks, percentage: 0 });
            }

            if (line.startsWith('event: chunk')) {
              const dataLine = line.split('data: ')[1];
              const { text, progress: chunkProgress } = JSON.parse(dataLine);

              assembledText += text;
              onChunk(assembledText);

              setProgress(prev => ({
                ...prev,
                current: prev.current + 1,
                percentage: chunkProgress || Math.round(((prev.current + 1) / prev.total) * 100)
              }));
            }

            if (line.startsWith('event: done')) {
              try {
                const result = rebuildJSON(assembledText);
                onComplete(result);
                setProgress({ current: 1, total: 1, percentage: 100 });
              } catch (err: any) {
                setError('Failed to parse translated JSON');
                throw err;
              }
            }

            if (line.startsWith('event: error')) {
              const dataLine = line.split('data: ')[1];
              const { error: errMsg } = JSON.parse(dataLine);
              setError(errMsg);
              throw new Error(errMsg);
            }
          }
        }
      })
      .catch((err) => {
        if (!aborted) {
          setError(err.message);
          console.error('Translation stream error:', err);
        }
      })
      .finally(() => {
        if (!aborted) {
          setIsTranslating(false);
        }
      });

    return () => {
      aborted = true;
      abortController.abort();
      setIsTranslating(false);
    };
  };

  return {
    translateFast,
    translateStream,
    isTranslating,
    progress,
    error,
  };
};
