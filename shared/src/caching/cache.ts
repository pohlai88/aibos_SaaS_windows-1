/**
 * AI-BOS Caching System
 *
 * World-class caching system with multiple strategies and backends.
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  namespace?: string; // Cache namespace
}

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

/**
 * Memory Cache Backend - In-memory caching
 */
export class MemoryCacheBackend implements CacheBackend {
  private cache = new Map<string, CacheItem>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    item.hits++;
    this.cache.set(key, item);

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };

    this.cache.set(key, item);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    let lowestHits = Infinity;

    for (const [key, item] of this.cache.entries()) {
      const age = Date.now() - item.timestamp;
      if (age > oldestTime || (age === oldestTime && item.hits < lowestHits)) {
        oldestKey = key;
        oldestTime = age;
        lowestHits = item.hits;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

/**
 * Local Storage Cache Backend - Browser-based caching
 */
export class LocalStorageCacheBackend implements CacheBackend {
  private namespace: string;

  constructor(namespace: string = 'aibos-cache') {
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.getKey(key));
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);

      // Check if expired
      if (Date.now() > item.timestamp + item.ttl) {
        localStorage.removeItem(this.getKey(key));
        return null;
      }

      // Update hit count
      item.hits++;
      localStorage.setItem(this.getKey(key), JSON.stringify(item));

      return item.value;
    } catch (error) {
      console.error('Failed to get from localStorage cache:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const item: CacheItem<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl,
        hits: 0
      };

      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set localStorage cache:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.namespace + ':')) {
        localStorage.removeItem(key);
      }
    }
  }

  async has(key: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  async keys(): Promise<string[]> {
    if (typeof window === 'undefined') return [];

    const keys: string[] = [];
    const storageKeys = Object.keys(localStorage);

    for (const key of storageKeys) {
      if (key.startsWith(this.namespace + ':')) {
        keys.push(key.replace(this.namespace + ':', ''));
      }
    }

    return keys;
  }

  async size(): Promise<number> {
    return (await this.keys()).length;
  }
}

/**
 * Redis Cache Backend - Server-side Redis caching
 */
export class RedisCacheBackend implements CacheBackend {
  private redis: any;
  private namespace: string;

  constructor(redisClient: any, namespace: string = 'aibos-cache') {
    this.redis = redisClient;
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to get from Redis cache:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(this.getKey(key), Math.floor(ttl / 1000), serialized);
    } catch (error) {
      console.error('Failed to set Redis cache:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
    } catch (error) {
      console.error('Failed to delete from Redis cache:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.namespace}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Failed to clear Redis cache:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return await this.redis.exists(this.getKey(key)) === 1;
    } catch (error) {
      console.error('Failed to check Redis cache:', error);
      return false;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const keys = await this.redis.keys(`${this.namespace}:*`);
      return keys.map((key: string) => key.replace(this.namespace + ':', ''));
    } catch (error) {
      console.error('Failed to get Redis cache keys:', error);
      return [];
    }
  }

  async size(): Promise<number> {
    return (await this.keys()).length;
  }
}

/**
 * Cache Manager - High-level cache interface
 */
export class CacheManager {
  private backend: CacheBackend;
  private options: CacheOptions;

  constructor(backend: CacheBackend, options: CacheOptions = {}) {
    this.backend = backend;
    this.options = {
      ttl: 300000, // 5 minutes default
      maxSize: 1000,
      namespace: 'aibos',
      ...options
    };
  }

  async get<T>(key: string): Promise<T | null> {
    return this.backend.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const finalTtl = ttl || this.options.ttl || 300000;
    return this.backend.set(key, value, finalTtl);
  }

  async delete(key: string): Promise<void> {
    return this.backend.delete(key);
  }

  async clear(): Promise<void> {
    return this.backend.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.backend.has(key);
  }

  async keys(): Promise<string[]> {
    return this.backend.keys();
  }

  async size(): Promise<number> {
    return this.backend.size();
  }

  // Convenience methods
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));

    for (const key of matchingKeys) {
      await this.delete(key);
    }
  }
}

// Factory functions
export const createMemoryCache = (options: CacheOptions = {}): CacheManager => {
  const backend = new MemoryCacheBackend(options.maxSize);
  return new CacheManager(backend, options);
};

export const createLocalStorageCache = (options: CacheOptions = {}): CacheManager => {
  const backend = new LocalStorageCacheBackend(options.namespace);
  return new CacheManager(backend, options);
};

export const createRedisCache = (redisClient: any, options: CacheOptions = {}): CacheManager => {
  const backend = new RedisCacheBackend(redisClient, options.namespace);
  return new CacheManager(backend, options);
};
