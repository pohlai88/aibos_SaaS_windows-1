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
  redisUrl?: string; // Redis connection URL
  redisOptions?: any; // Redis connection options
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
 * Memory-based cache implementation
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
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

/**
 * Redis cache implementation
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

    if (config.redisUrl) {
      this.connect();
    }
  }

  /**
   * Connect to Redis
   */
  private async connect(): Promise<void> {
    try {
      // Dynamic import to avoid requiring redis in non-Redis environments
      const { createClient } = await import('redis');

      this.redis = createClient({
        url: this.config.redisUrl,
        ...this.config.redisOptions,
      });

      this.redis.on('error', (err: Error) => {
        logger.error('Redis connection error', { error: err.message });
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      this.isConnected = false;
    }
  }

  /**
   * Set a value in Redis cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping set operation');
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      const ttlSeconds = Math.floor((ttl || this.config.defaultTTL) / 1000);

      await this.redis.setEx(key, ttlSeconds, serialized);
      this.stats.sets++;
    } catch (error) {
      logger.error('Redis set operation failed', { key, error });
    }
  }

  /**
   * Get a value from Redis cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, returning null');
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    try {
      const value = await this.redis.get(key);

      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      return JSON.parse(value);
    } catch (error) {
      logger.error('Redis get operation failed', { key, error });
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Delete a key from Redis cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.del(key);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      logger.error('Redis delete operation failed', { key, error });
      return false;
    }
  }

  /**
   * Clear all keys (use with caution)
   */
  async clear(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.flushDb();
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error('Redis clear operation failed', { error });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }
}

/**
 * Multi-level cache implementation
 */
export class MultiLevelCache {
  private l1Cache: MemoryCache;
  private l2Cache: RedisCache | null = null;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.l1Cache = new MemoryCache({
      defaultTTL: Math.min(config.defaultTTL, 60 * 1000), // L1 cache shorter TTL
      maxSize: Math.min(config.maxSize, 100), // L1 cache smaller size
      ...config,
    });

    if (config.redisUrl) {
      this.l2Cache = new RedisCache(config);
    }
  }

  /**
   * Set value in both cache levels
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in L1 cache
    this.l1Cache.set(key, value, ttl);

    // Set in L2 cache if available
    if (this.l2Cache) {
      await this.l2Cache.set(key, value, ttl);
    }
  }

  /**
   * Get value from cache (L1 first, then L2)
   */
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
        // Populate L1 cache with L2 value
        this.l1Cache.set(key, l2Value);
        return l2Value;
      }
    }

    return null;
  }

  /**
   * Delete from both cache levels
   */
  async delete(key: string): Promise<boolean> {
    const l1Deleted = this.l1Cache.delete(key);
    const l2Deleted = this.l2Cache ? await this.l2Cache.delete(key) : false;
    return l1Deleted || l2Deleted;
  }

  /**
   * Clear both cache levels
   */
  async clear(): Promise<void> {
    this.l1Cache.clear();
    if (this.l2Cache) {
      await this.l2Cache.clear();
    }
  }

  /**
   * Get combined statistics
   */
  getStats(): { l1: CacheStats; l2: CacheStats | null } {
    return {
      l1: this.l1Cache.getStats(),
      l2: this.l2Cache ? this.l2Cache.getStats() : null,
    };
  }

  /**
   * Destroy cache and cleanup resources
   */
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
      const key = keyGenerator
        ? keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };
  };
}

/**
 * Global cache instances
 */
export const memoryCache = new MemoryCache();
export const multiLevelCache = new MultiLevelCache({
  defaultTTL: 5 * 60 * 1000,
  maxSize: 1000,
  cleanupInterval: 60 * 1000,
  enableStats: true,
  redisUrl: process.env.REDIS_URL,
});

/**
 * Cache utilities
 */
export class CacheUtils {
  /**
   * Generate cache key from function and arguments
   */
  static generateKey(prefix: string, ...args: any[]): string {
    return `${prefix}:${args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(':')}`;
  }

  /**
   * Cache function result
   */
  static async cached<T>(
    cache: MemoryCache | RedisCache | MultiLevelCache,
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await cache.set(key, result, ttl);
    return result;
  }

  /**
   * Batch cache operations
   */
  static async batchGet<T>(
    cache: MemoryCache | RedisCache | MultiLevelCache,
    keys: string[],
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    for (const key of keys) {
      const value = await cache.get<T>(key);
      if (value !== null) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Batch set operations
   */
  static async batchSet<T>(
    cache: MemoryCache | RedisCache | MultiLevelCache,
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<void> {
    for (const { key, value, ttl } of entries) {
      await cache.set(key, value, ttl);
    }
  }
}
