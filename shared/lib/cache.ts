import { logger } from './logger';

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  defaultTTL: number; // Default time to live in milliseconds
  maxSize: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
  enableStats: boolean; // Enable cache statistics
  redisUrl?: string; // Redis connection URL (server-side only)
  redisOptions?: any; // Redis connection options (server-side only)
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  hitRate: number;
}

/**
 * Cache key generator
 */
export type CacheKeyGenerator = (...args: any[]) => string;

/**
 * Memory-based cache implementation (Browser-safe)
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60 * 1000, // 1 minute
      enableStats: true,
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };

    this.startCleanup();
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    this.updateHitRate();
    return entry.value;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    if (typeof window !== 'undefined') {
      // Browser environment - use setInterval
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval) as any;
    } else {
      // Node.js environment - use NodeJS.Timeout
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }
    this.stats.size = this.cache.size;
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      if (typeof window !== 'undefined') {
        clearInterval(this.cleanupTimer as any);
      } else {
        clearInterval(this.cleanupTimer);
      }
    }
    this.clear();
  }
}

/**
 * Browser-safe cache implementation
 * Uses only memory cache for browser environments
 */
export class BrowserSafeCache {
  private memoryCache: MemoryCache;

  constructor(config: Partial<CacheConfig> = {}) {
    this.memoryCache = new MemoryCache(config);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.memoryCache.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.memoryCache.get<T>(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  getStats(): CacheStats {
    return this.memoryCache.getStats();
  }

  async destroy(): Promise<void> {
    this.memoryCache.destroy();
  }
}

/**
 * Server-side Redis cache (only available in Node.js)
 */
export class RedisCache {
  private redis: any;
  private config: CacheConfig;
  private stats: CacheStats;
  private isConnected: boolean = false;

  constructor(config: CacheConfig) {
    this.config = config;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };

    // Only initialize Redis in server environment
    if (typeof window === 'undefined' && config.redisUrl) {
      this.connect();
    }
  }

  private async connect(): Promise<void> {
    try {
      // Dynamic import to avoid browser issues
      const { createClient } = await import('redis');
      this.redis = createClient({
        url: this.config.redisUrl,
        ...this.config.redisOptions,
      });

      await this.redis.connect();
      this.isConnected = true;
      logger.info('Redis cache connected');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.redis.set(key, JSON.stringify(value), 'PX', ttl || this.config.defaultTTL);
      this.stats.sets++;
      this.stats.size++;
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.redis.get(key);
      if (value) {
        this.stats.hits++;
        this.updateHitRate();
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }
    } catch (error) {
      logger.error('Redis get error:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.redis.del(key);
      if (result > 0) {
        this.stats.deletes++;
        this.stats.size--;
      }
      return result > 0;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.redis.flushdb();
      this.stats.size = 0;
    } catch (error) {
      logger.error('Redis clear error:', error);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected && this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }
}

/**
 * Multi-level cache (Memory + Redis)
 */
export class MultiLevelCache {
  private l1Cache: MemoryCache;
  private l2Cache: RedisCache | null = null;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.l1Cache = new MemoryCache(config);

    // Only create Redis cache in server environment
    if (typeof window === 'undefined' && config.redisUrl) {
      this.l2Cache = new RedisCache(config);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in L1 cache
    this.l1Cache.set(key, value, ttl);

    // Set in L2 cache if available
    if (this.l2Cache) {
      await this.l2Cache.set(key, value, ttl);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    const l1Value = this.l1Cache.get<T>(key);
    if (l1Value !== null) {
      return l1Value;
    }

    // Try L2 cache if available
    if (this.l2Cache) {
      const l2Value = await this.l2Cache.get<T>(key);
      if (l2Value !== null) {
        // Populate L1 cache
        this.l1Cache.set(key, l2Value);
        return l2Value;
      }
    }

    return null;
  }

  async delete(key: string): Promise<boolean> {
    const l1Deleted = this.l1Cache.delete(key);
    const l2Deleted = this.l2Cache ? await this.l2Cache.delete(key) : false;
    return l1Deleted || l2Deleted;
  }

  async clear(): Promise<void> {
    this.l1Cache.clear();
    if (this.l2Cache) {
      await this.l2Cache.clear();
    }
  }

  getStats(): { l1: CacheStats; l2: CacheStats | null } {
    return {
      l1: this.l1Cache.getStats(),
      l2: this.l2Cache ? this.l2Cache.getStats() : null,
    };
  }

  async destroy(): Promise<void> {
    this.l1Cache.destroy();
    if (this.l2Cache) {
      await this.l2Cache.disconnect();
    }
  }
}

/**
 * Cache decorator for methods
 */
export function Cached(ttl?: number, keyGenerator?: CacheKeyGenerator) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new MemoryCache();

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`;

      let result = cache.get(key);
      if (result === null) {
        result = await method.apply(this, args);
        cache.set(key, result, ttl);
      }

      return result;
    };
  };
}

/**
 * Cache utilities
 */
export class CacheUtils {
  /**
   * Generate cache key
   */
  static generateKey(prefix: string, ...args: any[]): string {
    return `${prefix}:${args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(':')}`;
  }

  /**
   * Cached function wrapper
   */
  static async cached<T>(
    cache: MemoryCache | RedisCache | MultiLevelCache,
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let result = await cache.get<T>(key);
    if (result === null) {
      result = await fn();
      await cache.set(key, result, ttl);
    }
    return result;
  }

  /**
   * Batch get from cache
   */
  static async batchGet<T>(
    cache: MemoryCache | RedisCache | MultiLevelCache,
    keys: string[],
  ): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = await cache.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * Batch set to cache
   */
  static async batchSet<T>(
    cache: MemoryCache | RedisCache | MultiLevelCache,
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<void> {
    for (const entry of entries) {
      await cache.set(entry.key, entry.value, entry.ttl);
    }
  }
}

// Export default cache instance for browser environments
export const defaultCache = typeof window !== 'undefined'
  ? new BrowserSafeCache()
  : new MemoryCache();

// Export cache types
export type { CacheEntry, CacheConfig, CacheStats, CacheKeyGenerator };
