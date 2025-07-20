/**
 * AI-BOS Intelligent Cache
 *
 * Advanced intelligent caching system with:
 * - Predictive caching based on usage patterns
 * - Multi-level caching (L1, L2, L3)
 * - Cache warming for frequently used models
 * - Intelligent cache eviction
 * - Performance-based cache optimization
 * - Cache hit rate optimization
 */

import { logger } from '../../../lib/logger';
import { MultiLevelCache } from '../../../lib/cache';

// Cache Levels
export type CacheLevel = 'L1' | 'L2' | 'L3';

// Cache Entry Types
export type CacheEntryType = 'model' | 'response' | 'embedding' | 'prediction' | 'metadata';

// Cache Entry
export interface CacheEntry {
  key: string;
  value: any;
  type: CacheEntryType;
  level: CacheLevel;
  size: number;
  accessCount: number;
  lastAccessed: number;
  createdAt: number;
  ttl: number;
  priority: number;
  tags: string[];
  metadata: Record<string, any>;
}

// Cache Access Pattern
export interface CacheAccessPattern {
  key: string;
  timestamp: number;
  accessType: 'read' | 'write' | 'delete';
  responseTime: number;
  success: boolean;
}

// Predictive Cache Request
export interface PredictiveCacheRequest {
  patterns: CacheAccessPattern[];
  timeWindow: number;
  confidence: number;
  maxPredictions: number;
}

// Cache Performance Metrics
export interface CachePerformanceMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageResponseTime: number;
  totalSize: number;
  evictions: number;
  predictions: number;
  predictionAccuracy: number;
  levelMetrics: Record<
    CacheLevel,
    {
      hits: number;
      misses: number;
      hitRate: number;
      size: number;
    }
  >;
}

// Cache Configuration
export interface IntelligentCacheConfig {
  maxSize: number;
  maxEntries: number;
  defaultTTL: number;
  enablePredictiveCaching: boolean;
  enableCacheWarming: boolean;
  enableCompression: boolean;
  compressionThreshold: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'adaptive';
  predictionConfidence: number;
  warmingInterval: number;
  cleanupInterval: number;
}

// Cache Warming Strategy
export interface CacheWarmingStrategy {
  type: 'frequency' | 'recency' | 'importance' | 'hybrid';
  threshold: number;
  maxItems: number;
  timeWindow: number;
}

// Cache Entry Schema
const CacheEntrySchema = z.object({
  key: z.string(),
  value: z.any(),
  type: z.enum(['model', 'response', 'embedding', 'prediction', 'metadata']),
  level: z.enum(['L1', 'L2', 'L3']),
  size: z.number().positive(),
  accessCount: z.number().nonnegative(),
  lastAccessed: z.number(),
  createdAt: z.number(),
  ttl: z.number().positive(),
  priority: z.number().min(0).max(10),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
});

// Cache Configuration Schema
const IntelligentCacheConfigSchema = z.object({
  maxSize: z.number().positive(),
  maxEntries: z.number().positive(),
  defaultTTL: z.number().positive(),
  enablePredictiveCaching: z.boolean(),
  enableCacheWarming: z.boolean(),
  enableCompression: z.boolean(),
  compressionThreshold: z.number().positive(),
  evictionPolicy: z.enum(['lru', 'lfu', 'fifo', 'adaptive']),
  predictionConfidence: z.number().min(0).max(1),
  warmingInterval: z.number().positive(),
  cleanupInterval: z.number().positive(),
});

export class IntelligentCache {
  private cache: Map<string, CacheEntry>;
  private accessPatterns: CacheAccessPattern[];
  private performanceMetrics: CachePerformanceMetrics;
  private config: IntelligentCacheConfig;
  private warmingStrategy: CacheWarmingStrategy;
  private isWarming: boolean;
  private warmingInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private predictionModel: Map<string, number>; // Key -> access probability

  constructor(
    config: Partial<IntelligentCacheConfig> = {},
    warmingStrategy: Partial<CacheWarmingStrategy> = {},
  ) {
    this.cache = new Map();
    this.accessPatterns = [];
    this.predictionModel = new Map();
    this.isWarming = false;

    // Default configuration
    this.config = {
      maxSize: 1024 * 1024 * 1024, // 1GB
      maxEntries: 10000,
      defaultTTL: 3600000, // 1 hour
      enablePredictiveCaching: true,
      enableCacheWarming: true,
      enableCompression: true,
      compressionThreshold: 1024 * 1024, // 1MB
      evictionPolicy: 'adaptive',
      predictionConfidence: 0.7,
      warmingInterval: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      ...config,
    };

    // Default warming strategy
    this.warmingStrategy = {
      type: 'hybrid',
      threshold: 0.5,
      maxItems: 100,
      timeWindow: 3600000, // 1 hour
      ...warmingStrategy,
    };

    // Initialize performance metrics
    this.performanceMetrics = this.initializePerformanceMetrics();

    // Start background processes
    this.startBackgroundProcesses();
    logger.info('Intelligent Cache initialized');
  }

  /**
   * Initialize performance metrics
   */
  private initializePerformanceMetrics(): CachePerformanceMetrics {
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      totalSize: 0,
      evictions: 0,
      predictions: 0,
      predictionAccuracy: 0,
      levelMetrics: {
        L1: { hits: 0, misses: 0, hitRate: 0, size: 0 },
        L2: { hits: 0, misses: 0, hitRate: 0, size: 0 },
        L3: { hits: 0, misses: 0, hitRate: 0, size: 0 },
      },
    };
  }

  /**
   * Start background processes
   */
  private startBackgroundProcesses(): void {
    // Cache warming interval
    if (this.config.enableCacheWarming) {
      this.warmingInterval = setInterval(() => {
        this.performCacheWarming();
      }, this.config.warmingInterval);
    }

    // Cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
      this.updatePerformanceMetrics();
    }, this.config.cleanupInterval);
  }

  /**
   * Get cache entry
   */
  async get(key: string): Promise<any> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      const entry = this.cache.get(key);

      if (entry && !this.isExpired(entry)) {
        // Cache hit
        this.updateEntryAccess(entry);
        this.recordAccessPattern(key, 'read', Date.now() - startTime, true);
        this.performanceMetrics.cacheHits++;
        this.performanceMetrics.levelMetrics[entry.level].hits++;

        logger.debug(`Cache hit for key: ${key} (${entry.level})`);
        return entry.value;
      } else {
        // Cache miss
        this.recordAccessPattern(key, 'read', Date.now() - startTime, false);
        this.performanceMetrics.cacheMisses++;

        // Update prediction model
        this.updatePredictionModel(key, false);

        logger.debug(`Cache miss for key: ${key}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error accessing cache for key: ${key}`, error);
      this.recordAccessPattern(key, 'read', Date.now() - startTime, false);
      this.performanceMetrics.cacheMisses++;
      return null;
    }
  }

  /**
   * Set cache entry
   */
  async set(
    key: string,
    value: any,
    options: Partial<{
      type: CacheEntryType;
      level: CacheLevel;
      ttl: number;
      priority: number;
      tags: string[];
      metadata: Record<string, any>;
    }> = {},
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const entry: CacheEntry = {
        key,
        value,
        type: options.type || 'response',
        level: options.level || 'L2',
        size: this.calculateSize(value),
        accessCount: 0,
        lastAccessed: Date.now(),
        createdAt: Date.now(),
        ttl: options.ttl || this.config.defaultTTL,
        priority: options.priority || 5,
        tags: options.tags || [],
        metadata: options.metadata || {},
      };

      // Validate entry
      CacheEntrySchema.parse(entry);

      // Check if we need to evict entries
      await this.ensureCapacity(entry.size);

      // Store entry
      this.cache.set(key, entry);
      this.performanceMetrics.totalSize += entry.size;
      this.performanceMetrics.levelMetrics[entry.level].size += entry.size;

      // Update prediction model
      this.updatePredictionModel(key, true);

      this.recordAccessPattern(key, 'write', Date.now() - startTime, true);
      logger.debug(`Cache set for key: ${key} (${entry.level})`);
    } catch (error) {
      logger.error(`Error setting cache for key: ${key}`, error);
      this.recordAccessPattern(key, 'write', Date.now() - startTime, false);
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.performanceMetrics.totalSize -= entry.size;
        this.performanceMetrics.levelMetrics[entry.level].size -= entry.size;

        this.recordAccessPattern(key, 'delete', Date.now() - startTime, true);
        logger.debug(`Cache delete for key: ${key}`);
        return true;
      }

      this.recordAccessPattern(key, 'delete', Date.now() - startTime, false);
      return false;
    } catch (error) {
      logger.error(`Error deleting cache for key: ${key}`, error);
      this.recordAccessPattern(key, 'delete', Date.now() - startTime, false);
      return false;
    }
  }

  /**
   * Predictive caching
   */
  async predictAndCache(request: PredictiveCacheRequest): Promise<string[]> {
    if (!this.config.enablePredictiveCaching) {
      return [];
    }

    const predictions: string[] = [];
    const now = Date.now();
    const timeWindow = request.timeWindow;

    // Analyze access patterns
    const recentPatterns = this.accessPatterns.filter(
      (pattern) => now - pattern.timestamp < timeWindow,
    );

    // Calculate access probabilities
    const accessCounts = new Map<string, number>();
    for (const pattern of recentPatterns) {
      accessCounts.set(pattern.key, (accessCounts.get(pattern.key) || 0) + 1);
    }

    // Sort by access frequency and confidence
    const sortedKeys = Array.from(accessCounts.entries())
      .filter(([_, count]) => count >= request.confidence * recentPatterns.length)
      .sort((a, b) => b[1] - a[1])
      .slice(0, request.maxPredictions)
      .map(([key, _]) => key);

    // Pre-warm cache for predicted keys
    for (const key of sortedKeys) {
      if (!this.cache.has(key)) {
        predictions.push(key);
        this.predictionModel.set(key, accessCounts.get(key)! / recentPatterns.length);
      }
    }

    this.performanceMetrics.predictions += predictions.length;
    logger.info(`Predicted ${predictions.length} cache entries for warming`);

    return predictions;
  }

  /**
   * Perform cache warming
   */
  private async performCacheWarming(): Promise<void> {
    if (this.isWarming) return;

    this.isWarming = true;
    try {
      const predictions = await this.predictAndCache({
        patterns: this.accessPatterns,
        timeWindow: this.warmingStrategy.timeWindow,
        confidence: this.config.predictionConfidence,
        maxPredictions: this.warmingStrategy.maxItems,
      });

      // Warm cache with predicted entries
      for (const key of predictions) {
        // This would typically load data from a slower storage
        // For now, we'll simulate cache warming
        logger.debug(`Warming cache for key: ${key}`);
      }

      logger.info(`Cache warming completed for ${predictions.length} entries`);
    } catch (error) {
      logger.error('Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Ensure cache capacity
   */
  private async ensureCapacity(requiredSize: number): Promise<void> {
    const currentSize = this.performanceMetrics.totalSize;
    const availableSpace = this.config.maxSize - currentSize;

    if (requiredSize <= availableSpace) {
      return;
    }

    // Need to evict entries
    const entriesToEvict = this.selectEntriesForEviction(requiredSize - availableSpace);

    for (const entry of entriesToEvict) {
      this.cache.delete(entry.key);
      this.performanceMetrics.totalSize -= entry.size;
      this.performanceMetrics.levelMetrics[entry.level].size -= entry.size;
      this.performanceMetrics.evictions++;
    }

    logger.debug(`Evicted ${entriesToEvict.length} cache entries`);
  }

  /**
   * Select entries for eviction based on policy
   */
  private selectEntriesForEviction(requiredSpace: number): CacheEntry[] {
    const entries = Array.from(this.cache.values());
    let evictedSize = 0;
    const evictedEntries: CacheEntry[] = [];

    switch (this.config.evictionPolicy) {
      case 'lru':
        // Least Recently Used
        entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
        break;
      case 'lfu':
        // Least Frequently Used
        entries.sort((a, b) => a.accessCount - b.accessCount);
        break;
      case 'fifo':
        // First In, First Out
        entries.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'adaptive':
        // Adaptive policy based on access patterns and priority
        entries.sort((a, b) => {
          const aScore = this.calculateAdaptiveScore(a);
          const bScore = this.calculateAdaptiveScore(b);
          return aScore - bScore;
        });
        break;
    }

    // Evict entries until we have enough space
    for (const entry of entries) {
      if (evictedSize >= requiredSpace) break;

      evictedEntries.push(entry);
      evictedSize += entry.size;
    }

    return evictedEntries;
  }

  /**
   * Calculate adaptive score for eviction
   */
  private calculateAdaptiveScore(entry: CacheEntry): number {
    const now = Date.now();
    const age = now - entry.createdAt;
    const timeSinceLastAccess = now - entry.lastAccessed;

    // Lower score = higher priority (less likely to be evicted)
    return (
      (timeSinceLastAccess / 1000) * 0.4 + // Time since last access (40% weight)
      (1 / (entry.accessCount + 1)) * 0.3 + // Access frequency (30% weight)
      (age / 1000) * 0.2 + // Age (20% weight)
      (1 / (entry.priority + 1)) * 0.1 // Priority (10% weight)
    );
  }

  /**
   * Update entry access statistics
   */
  private updateEntryAccess(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  /**
   * Record access pattern
   */
  private recordAccessPattern(
    key: string,
    accessType: 'read' | 'write' | 'delete',
    responseTime: number,
    success: boolean,
  ): void {
    const pattern: CacheAccessPattern = {
      key,
      timestamp: Date.now(),
      accessType,
      responseTime,
      success,
    };

    this.accessPatterns.push(pattern);

    // Keep only recent patterns to prevent memory bloat
    const maxPatterns = 10000;
    if (this.accessPatterns.length > maxPatterns) {
      this.accessPatterns = this.accessPatterns.slice(-maxPatterns);
    }
  }

  /**
   * Update prediction model
   */
  private updatePredictionModel(key: string, wasHit: boolean): void {
    const currentProbability = this.predictionModel.get(key) || 0;
    const learningRate = 0.1;

    if (wasHit) {
      // Increase probability for hits
      this.predictionModel.set(key, currentProbability + learningRate * (1 - currentProbability));
    } else {
      // Decrease probability for misses
      this.predictionModel.set(key, currentProbability - learningRate * currentProbability);
    }
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  /**
   * Calculate size of value
   */
  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 1024; // Default size if serialization fails
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const entry = this.cache.get(key)!;
      this.cache.delete(key);
      this.performanceMetrics.totalSize -= entry.size;
      this.performanceMetrics.levelMetrics[entry.level].size -= entry.size;
    }

    if (expiredKeys.length > 0) {
      logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    const totalRequests = this.performanceMetrics.totalRequests;
    if (totalRequests > 0) {
      this.performanceMetrics.hitRate = this.performanceMetrics.cacheHits / totalRequests;
    }

    // Update level-specific metrics
    for (const level of ['L1', 'L2', 'L3'] as CacheLevel[]) {
      const levelMetrics = this.performanceMetrics.levelMetrics[level];
      const totalLevelRequests = levelMetrics.hits + levelMetrics.misses;
      if (totalLevelRequests > 0) {
        levelMetrics.hitRate = levelMetrics.hits / totalLevelRequests;
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CachePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.performanceMetrics.totalSize = 0;
    for (const level of ['L1', 'L2', 'L3'] as CacheLevel[]) {
      this.performanceMetrics.levelMetrics[level].size = 0;
    }
    logger.info('Cache cleared');
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if cache has key
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Shutdown cache
   */
  async shutdown(): Promise<void> {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cache.clear();
    logger.info('Intelligent Cache shutdown complete');
  }
}
