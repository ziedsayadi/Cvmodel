interface CacheEntry {
  text: string;
  timestamp: number;
}

class TranslationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge = 3600000;

  private getCacheKey(text: string, targetLang: string): string {
    return `${targetLang}:${text.substring(0, 100)}`;
  }

  get(text: string, targetLang: string): string | null {
    const key = this.getCacheKey(text, targetLang);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.text;
  }

  set(text: string, targetLang: string, translatedText: string): void {
    const key = this.getCacheKey(text, targetLang);
    this.cache.set(key, {
      text: translatedText,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const translationCache = new TranslationCache();
