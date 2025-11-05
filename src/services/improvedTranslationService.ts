import { CVData } from '../types/cv';

const CACHE_VERSION = '2.0';
const CACHE_KEY_PREFIX = 'cv_translation_v2_';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  data: CVData;
  timestamp: number;
  language: string;
  version: string;
  hash: string;
}

interface CacheStats {
  count: number;
  languages: string[];
  size: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

class ImprovedTranslationService {
  private memoryCache: Map<string, CacheEntry> = new Map();

  /**
   * Generate a hash from CV data for cache key
   */
  private generateHash(data: CVData): string {
    const content = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate cache key
   */
  private getCacheKey(data: CVData, targetLang: string): string {
    const hash = this.generateHash(data);
    return `${CACHE_KEY_PREFIX}${targetLang}_${hash}`;
  }

  /**
   * Get cached translation
   */
  getCached(data: CVData, targetLang: string): CVData | null {
    const cacheKey = this.getCacheKey(data, targetLang);

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry) {
      if (this.isValidEntry(memoryEntry)) {
        console.log(`✅ Memory cache hit: ${targetLang}`);
        return memoryEntry.data;
      } else {
        this.memoryCache.delete(cacheKey);
      }
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored);
        
        if (this.isValidEntry(entry)) {
          // Add to memory cache
          this.memoryCache.set(cacheKey, entry);
          console.log(`✅ localStorage cache hit: ${targetLang}`);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(cacheKey);
          console.log(`⏰ Removed expired cache: ${targetLang}`);
        }
      }
    } catch (err) {
      console.error('❌ Cache read error:', err);
    }

    return null;
  }

  /**
   * Save translation to cache
   */
  setCached(data: CVData, targetLang: string, translatedData: CVData): void {
    const cacheKey = this.getCacheKey(data, targetLang);
    const entry: CacheEntry = {
      data: translatedData,
      timestamp: Date.now(),
      language: targetLang,
      version: CACHE_VERSION,
      hash: this.generateHash(data)
    };

    // Save to memory cache
    this.memoryCache.set(cacheKey, entry);

    // Save to localStorage
    try {
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      console.log(`💾 Cached translation: ${targetLang}`);
    } catch (err) {
      console.error('❌ Cache save error:', err);
      // If localStorage is full, try to clear old entries
      this.cleanupOldEntries();
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch {
        console.error('❌ Still failed after cleanup');
      }
    }
  }

  /**
   * Check if cache entry is valid
   */
  private isValidEntry(entry: CacheEntry): boolean {
    // Check version
    if (entry.version !== CACHE_VERSION) {
      return false;
    }

    // Check expiration
    const age = Date.now() - entry.timestamp;
    if (age > MAX_CACHE_AGE) {
      return false;
    }

    return true;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear localStorage
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Cleared ${keys.length} cached translations`);
    } catch (err) {
      console.error('❌ Cache clear error:', err);
    }
  }

  /**
   * Clear cache for specific language
   */
  clearLanguage(targetLang: string): void {
    // Clear from memory
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((entry, key) => {
      if (entry.language === targetLang) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Clear from localStorage
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX) && key.includes(`_${targetLang}_`)) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Cleared ${keys.length} ${targetLang} translations`);
    } catch (err) {
      console.error('❌ Language cache clear error:', err);
    }
  }

  /**
   * Cleanup old cache entries
   */
  private cleanupOldEntries(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            const age = now - entry.timestamp;
            
            // Remove if older than max age
            if (age > MAX_CACHE_AGE) {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 Cleaned up ${keysToRemove.length} old entries`);
    } catch (err) {
      console.error('❌ Cleanup error:', err);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const stats: CacheStats = {
      count: 0,
      languages: [],
      size: 0,
      oldestEntry: null,
      newestEntry: null
    };

    const languageSet = new Set<string>();

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            stats.count++;
            stats.size += stored.length * 2; // Approximate size in bytes

            const entry: CacheEntry = JSON.parse(stored);
            languageSet.add(entry.language);

            if (stats.oldestEntry === null || entry.timestamp < stats.oldestEntry) {
              stats.oldestEntry = entry.timestamp;
            }
            if (stats.newestEntry === null || entry.timestamp > stats.newestEntry) {
              stats.newestEntry = entry.timestamp;
            }
          }
        }
      }

      stats.languages = Array.from(languageSet);
    } catch (err) {
      console.error('❌ Stats error:', err);
    }

    return stats;
  }

  /**
   * Export cache data for debugging
   */
  exportCache(): Record<string, CacheEntry> {
    const exported: Record<string, CacheEntry> = {};

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            exported[key] = JSON.parse(stored);
          }
        }
      }
    } catch (err) {
      console.error('❌ Export error:', err);
    }

    return exported;
  }

  /**
   * Check if cache needs cleanup (size > 5MB)
   */
  needsCleanup(): boolean {
    const stats = this.getCacheStats();
    return stats.size > 5 * 1024 * 1024; // 5MB
  }

  /**
   * Perform automatic maintenance
   */
  performMaintenance(): void {
    console.log('🔧 Performing cache maintenance...');
    
    // Clean up old entries
    this.cleanupOldEntries();
    
    // If still too large, clear everything
    if (this.needsCleanup()) {
      console.log('⚠️ Cache too large, clearing all...');
      this.clearCache();
    }
    
    const stats = this.getCacheStats();
    console.log(`✅ Maintenance complete: ${stats.count} entries, ${(stats.size / 1024).toFixed(2)}KB`);
  }
}

// Singleton instance
export const translationService = new ImprovedTranslationService();

// Perform maintenance on load
if (typeof window !== 'undefined') {
  // Check if we need maintenance on startup
  if (translationService.needsCleanup()) {
    translationService.performMaintenance();
  }
}