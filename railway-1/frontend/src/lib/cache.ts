/**
 * Multi-Level Cache Utility for AI-BOS Frontend
 *
 * Provides caching functionality for AI engines with multiple levels
 */

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  level: 'memory' | 'session' | 'persistent';
  metadata?: Record<string, any>;
}

export interface CacheConfig {
  memorySize: number;
  sessionSize: number;
  persistentSize: number;
  defaultTTL: number;
}

export class MultiLevelCache {
  private memoryCache = new Map<string, CacheEntry>();
  private sessionCache = new Map<string, CacheEntry>();
  private persistentCache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      memorySize: 1000,
      sessionSize: 500,
      persistentSize: 200,
      defaultTTL: 300000, // 5 minutes
      ...config
    };
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.value as T;
    }

    // Try session cache
    const sessionEntry = this.sessionCache.get(key);
    if (sessionEntry && !this.isExpired(sessionEntry)) {
      // Promote to memory cache
      this.setMemory(key, sessionEntry.value, sessionEntry.ttl);
      return sessionEntry.value as T;
    }

    // Try persistent cache
    const persistentEntry = this.persistentCache.get(key);
    if (persistentEntry && !this.isExpired(persistentEntry)) {
      // Promote to memory cache
      this.setMemory(key, persistentEntry.value, persistentEntry.ttl);
      return persistentEntry.value as T;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl?: number, level: 'memory' | 'session' | 'persistent' = 'memory'): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      level
    };

    switch (level) {
      case 'memory':
        this.setMemory(key, value, ttl);
        break;
      case 'session':
        this.setSession(key, value, ttl);
        break;
      case 'persistent':
        this.setPersistent(key, value, ttl);
        break;
    }
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.sessionCache.delete(key);
    this.persistentCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.sessionCache.clear();
    this.persistentCache.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.memoryCache.has(key) ||
           this.sessionCache.has(key) ||
           this.persistentCache.has(key);
  }

  async size(): Promise<number> {
    return this.memoryCache.size + this.sessionCache.size + this.persistentCache.size;
  }

  async keys(): Promise<string[]> {
    const keys = new Set<string>();

    this.memoryCache.forEach((_, key) => keys.add(key));
    this.sessionCache.forEach((_, key) => keys.add(key));
    this.persistentCache.forEach((_, key) => keys.add(key));

    return Array.from(keys);
  }

  // Private methods
  private setMemory<T>(key: string, value: T, ttl?: number): void {
    this.ensureCacheSize(this.memoryCache, this.config.memorySize);

    this.memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      level: 'memory'
    });
  }

  private setSession<T>(key: string, value: T, ttl?: number): void {
    this.ensureCacheSize(this.sessionCache, this.config.sessionSize);

    this.sessionCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      level: 'session'
    });
  }

  private setPersistent<T>(key: string, value: T, ttl?: number): void {
    this.ensureCacheSize(this.persistentCache, this.config.persistentSize);

    this.persistentCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      level: 'persistent'
    });
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private ensureCacheSize(cache: Map<string, CacheEntry>, maxSize: number): void {
    if (cache.size >= maxSize) {
      // Remove oldest entries
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, Math.floor(maxSize * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => cache.delete(key));
    }
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    const now = Date.now();

    // Clean memory cache
    for (const [key, entry] of Array.from(this.memoryCache.entries())) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean session cache
    for (const [key, entry] of Array.from(this.sessionCache.entries())) {
      if (this.isExpired(entry)) {
        this.sessionCache.delete(key);
      }
    }

    // Clean persistent cache
    for (const [key, entry] of Array.from(this.persistentCache.entries())) {
      if (this.isExpired(entry)) {
        this.persistentCache.delete(key);
      }
    }
  }
}
