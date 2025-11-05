import { CVData } from '../types/cv';

const TRANSLATION_CACHE_KEY = 'cv-translations-cache';
const CACHE_VERSION = '1.0';

interface TranslationCacheEntry {
  data: CVData;
  timestamp: number;
  language: string;
  version: string;
}

interface TranslationCache {
  [key: string]: TranslationCacheEntry;
}

class TranslationService {
  private cache: TranslationCache = {};
  private maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.loadCache();
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
        this.cleanExpiredEntries();
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
      this.cache = {};
    }
  }

  private saveCache(): void {
    try {
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    let cleaned = false;

    for (const key in this.cache) {
      if (now - this.cache[key].timestamp > this.maxAge || this.cache[key].version !== CACHE_VERSION) {
        delete this.cache[key];
        cleaned = true;
      }
    }

    if (cleaned) {
      this.saveCache();
    }
  }

  private generateCacheKey(data: CVData, targetLang: string): string {
    const dataStr = JSON.stringify(data);
    const hash = this.simpleHash(dataStr);
    return `${targetLang}:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  getCached(data: CVData, targetLang: string): CVData | null {
    const key = this.generateCacheKey(data, targetLang);
    const entry = this.cache[key];

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.maxAge) {
      delete this.cache[key];
      this.saveCache();
      return null;
    }

    console.log(`Using cached translation for ${targetLang}`);
    return entry.data;
  }

  setCached(data: CVData, targetLang: string, translatedData: CVData): void {
    const key = this.generateCacheKey(data, targetLang);
    this.cache[key] = {
      data: translatedData,
      timestamp: Date.now(),
      language: targetLang,
      version: CACHE_VERSION
    };
    this.saveCache();
    console.log(`Cached translation for ${targetLang}`);
  }

  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(TRANSLATION_CACHE_KEY);
    console.log('Translation cache cleared');
  }

  getCacheStats(): { count: number; languages: string[]; size: number } {
    const languages = new Set<string>();
    for (const key in this.cache) {
      languages.add(this.cache[key].language);
    }

    const size = new Blob([JSON.stringify(this.cache)]).size;

    return {
      count: Object.keys(this.cache).length,
      languages: Array.from(languages),
      size
    };
  }
}

export const translationService = new TranslationService();
