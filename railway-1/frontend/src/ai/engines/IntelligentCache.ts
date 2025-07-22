/**
 * Enhanced Intelligent Cache for AI-BOS Frontend
 *
 * Features:
 * - Multi-tiered caching strategy
 * - Enhanced predictive warming with pattern recognition
 * - Size-aware eviction policies
 * - Compression support
 * - Better metrics and monitoring
 * - Type-safe interfaces
 * - Production-ready optimizations
 */

export type CacheEntryType = 'ai-response' | 'model' | 'prediction' | 'metadata' | 'computation';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  type: CacheEntryType;
  size: number;
  priority: number;
  compressed?: boolean;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface CacheConfig {
  maxSize: number;
  maxEntries: number;
  defaultTTL: number;
  enablePredictiveCaching: boolean;
  enableCompression: boolean;
  compressionThreshold: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'hybrid';
  warmingThreshold: number;
  warmingLookbackWindow: number;
  warmConcurrently: boolean;
  staleWhileRevalidate: number;
  enableMetrics: boolean;
  metricsIntervalMs: number;
  cleanupIntervalMs: number;
  warmingIntervalMs: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  averageAccessCount: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  evictionCount: number;
  compressionRatio: number;
  warmingPredictions: number;
  memoryUsage: number;
  performanceScore: number;
}

export interface CacheHooks {
  beforeGet?: (key: string) => void | Promise<void>;
  afterGet?: (key: string, hit: boolean) => void | Promise<void>;
  beforeSet?: (key: string, value: any) => void | Promise<void>;
  afterSet?: (key: string) => void | Promise<void>;
  beforeDelete?: (key: string) => void | Promise<void>;
  afterDelete?: (key: string) => void | Promise<void>;
  beforeEvict?: (entries: CacheEntry[]) => void | Promise<void>;
  afterEvict?: (entries: CacheEntry[]) => void | Promise<void>;
  onError?: (error: Error, operation: string) => void | Promise<void>;
}

export class IntelligentCache {
  private cache = new Map<string, CacheEntry>();
  private accessPatterns = new Map<string, { hits: number; accesses: number; lastAccessed: number }>();
  private config: CacheConfig;
  private totalSize = 0;
  private evictionCount = 0;
  private compressionSavings = 0;
  private hooks: CacheHooks = {};
  private cleanupInterval?: NodeJS.Timeout;
  private warmingInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private accessSequence: string[] = [];
  private sequenceWindow = 10;
  private isShuttingDown = false;
  private performanceMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageOperationTime: 0,
    lastOperationTime: 0
  };

  constructor(config: Partial<CacheConfig> = {}, hooks?: CacheHooks) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 1000,
      defaultTTL: 300000, // 5 minutes
      enablePredictiveCaching: true,
      enableCompression: false,
      compressionThreshold: 1024, // 1KB
      evictionPolicy: 'hybrid',
      warmingThreshold: 3,
      warmingLookbackWindow: 60000, // 1 minute
      warmConcurrently: true,
      staleWhileRevalidate: 5000, // 5 seconds
      enableMetrics: true,
      metricsIntervalMs: 10000, // 10 seconds
      cleanupIntervalMs: 60000, // 1 minute
      warmingIntervalMs: 30000, // 30 seconds
      ...config
    };

    if (hooks) {
      this.hooks = hooks;
    }

    // Start periodic maintenance
    this.startMaintenance();
  }

  /**
   * Start maintenance intervals
   */
  private startMaintenance(): void {
    if (this.config.enableMetrics) {
      this.metricsInterval = setInterval(() => this.updateMetrics(), this.config.metricsIntervalMs);
    }

    this.cleanupInterval = setInterval(() => this.cleanup(), this.config.cleanupIntervalMs);
    this.warmingInterval = setInterval(() => this.warmCache(), this.config.warmingIntervalMs);
  }

  /**
   * Get a value from cache with optional stale-while-revalidate
   */
  async get<T>(key: string): Promise<{ value: T | null; stale: boolean }> {
    const startTime = Date.now();

    try {
      await this.hooks.beforeGet?.(key);

      const entry = this.cache.get(key);
      let stale = false;

      if (!entry) {
        this.recordAccessPattern(key, false);
        await this.hooks.afterGet?.(key, false);
        this.recordOperation('get', Date.now() - startTime, false);
        return { value: null, stale: false };
      }

      // Check if expired but can serve stale
      const now = Date.now();
      const isExpired = now - entry.timestamp > entry.ttl;
      const isStaleValid = isExpired && (now - entry.timestamp) < (entry.ttl + this.config.staleWhileRevalidate);

      if (isExpired && !isStaleValid) {
        this.cache.delete(key);
        this.totalSize -= entry.size;
        this.recordAccessPattern(key, false);
        await this.hooks.afterGet?.(key, false);
        this.recordOperation('get', Date.now() - startTime, false);
        return { value: null, stale: false };
      }

      // Update access metrics
      entry.accessCount++;
      entry.lastAccessed = now;
      this.recordAccessPattern(key, true);
      stale = isStaleValid;

      // Decompress if needed
      let value = entry.value;
      if (entry.compressed && this.config.enableCompression) {
        value = await this.decompressValue(value);
      }

      await this.hooks.afterGet?.(key, true);
      this.recordOperation('get', Date.now() - startTime, true);
      return { value: value as T, stale };
    } catch (error) {
      await this.hooks.onError?.(error as Error, 'get');
      this.recordOperation('get', Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Set a value in cache with optional compression
   */
  async set<T>(key: string, value: T, options: {
    ttl?: number;
    type?: CacheEntryType;
    priority?: number;
    size?: number;
    dependencies?: string[];
    noCompress?: boolean;
    metadata?: Record<string, any>;
  } = {}): Promise<void> {
    const startTime = Date.now();

    try {
      await this.hooks.beforeSet?.(key, value);

      let processedValue = value;
      let compressed = false;
      let originalSize = options.size || this.estimateSize(value);
      let finalSize = originalSize;

      // Compress if enabled and meets threshold
      if (this.config.enableCompression &&
          !options.noCompress &&
          originalSize >= this.config.compressionThreshold) {
        try {
          processedValue = await this.compressValue(value);
          finalSize = this.estimateSize(processedValue);
          compressed = true;
          this.compressionSavings += (originalSize - finalSize);
        } catch (e) {
          console.warn(`Compression failed for key ${key}`, e);
        }
      }

      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        timestamp: Date.now(),
        ttl: options.ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        type: options.type || 'ai-response',
        size: finalSize,
        priority: options.priority || 5,
        compressed,
        dependencies: options.dependencies,
        metadata: options.metadata
      };

      // Check if we need to evict entries
      await this.ensureSpace(entry.size);

      // Store the entry
      this.cache.set(key, entry);
      this.totalSize += entry.size;
      this.recordAccessPattern(key, true);

      await this.hooks.afterSet?.(key);
      this.recordOperation('set', Date.now() - startTime, true);
    } catch (error) {
      await this.hooks.onError?.(error as Error, 'set');
      this.recordOperation('set', Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Delete a value from cache and its dependents
   */
  async delete(key: string): Promise<void> {
    const startTime = Date.now();

    try {
      await this.hooks.beforeDelete?.(key);

      const entry = this.cache.get(key);
      if (entry) {
        // Delete dependents
        if (entry.dependencies) {
          for (const depKey of entry.dependencies) {
            await this.delete(depKey);
          }
        }

        this.totalSize -= entry.size;
        this.cache.delete(key);
      }

      await this.hooks.afterDelete?.(key);
      this.recordOperation('delete', Date.now() - startTime, true);
    } catch (error) {
      await this.hooks.onError?.(error as Error, 'delete');
      this.recordOperation('delete', Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.totalSize = 0;
    this.accessPatterns.clear();
    this.accessSequence = [];
    this.evictionCount = 0;
    this.compressionSavings = 0;
    this.performanceMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageOperationTime: 0,
      lastOperationTime: 0
    };
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const hitRate = this.calculateHitRate();
    const totalAccesses = this.calculateTotalAccesses();
    const compressionRatio = this.compressionSavings > 0
      ? this.compressionSavings / (this.totalSize + this.compressionSavings)
      : 0;

    // Calculate performance score (0-100)
    const performanceScore = Math.min(100, Math.max(0,
      (this.performanceMetrics.successfulOperations / Math.max(1, this.performanceMetrics.totalOperations)) * 100
    ));

    return {
      totalEntries: this.cache.size,
      totalSize: this.totalSize,
      maxSize: this.config.maxSize,
      hitRate,
      missRate: 1 - hitRate,
      averageAccessCount: entries.length > 0
        ? entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length
        : 0,
      oldestEntry: entries.length > 0
        ? Math.min(...entries.map(e => e.timestamp))
        : null,
      newestEntry: entries.length > 0
        ? Math.max(...entries.map(e => e.timestamp))
        : null,
      evictionCount: this.evictionCount,
      compressionRatio,
      warmingPredictions: this.predictNextAccess().length,
      memoryUsage: this.totalSize / this.config.maxSize,
      performanceScore
    };
  }

  /**
   * Warm cache based on access patterns and sequences
   */
  async warmCache(): Promise<void> {
    if (!this.config.enablePredictiveCaching || this.isShuttingDown) return;

    try {
      const predictions = this.predictNextAccess();
      const sequencePredictions = this.predictFromSequences();

      const allPredictions = Array.from(new Set([...predictions, ...sequencePredictions]));

      if (this.config.warmConcurrently) {
        await Promise.all(allPredictions.map(key =>
          this.warmKey(key).catch(e => {
            console.warn(`Failed to warm key ${key}`, e);
            this.hooks.onError?.(e as Error, 'warm');
          })
        ));
      } else {
        for (const key of allPredictions) {
          await this.warmKey(key).catch(e => {
            console.warn(`Failed to warm key ${key}`, e);
            this.hooks.onError?.(e as Error, 'warm');
          });
        }
      }
    } catch (error) {
      await this.hooks.onError?.(error as Error, 'warm');
    }
  }

  /**
   * Warm a single key
   */
  private async warmKey(key: string): Promise<void> {
    if (!this.cache.has(key)) {
      await this.set(key, { warmed: true, timestamp: Date.now() }, {
        ttl: this.config.warmingLookbackWindow,
        type: 'metadata',
        priority: 1
      });
    }
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Ensure there's enough space for new entry
   */
  private async ensureSpace(requiredSize: number): Promise<void> {
    const spaceNeeded = this.totalSize + requiredSize - this.config.maxSize;
    if (spaceNeeded <= 0 && this.cache.size < this.config.maxEntries) {
      return;
    }

    // Need to evict entries
    const entriesToEvict = this.selectEntriesToEvict(spaceNeeded);

    await this.hooks.beforeEvict?.(entriesToEvict);

    for (const entry of entriesToEvict) {
      await this.delete(entry.key);
      this.evictionCount++;
    }

    await this.hooks.afterEvict?.(entriesToEvict);
  }

  /**
   * Select entries to evict based on policy and space needed
   */
  private selectEntriesToEvict(spaceNeeded: number): CacheEntry[] {
    const entries = Array.from(this.cache.values());

    // First remove expired entries
    const expiredEntries = entries.filter(e => this.isExpired(e));
    if (expiredEntries.length > 0) {
      return expiredEntries;
    }

    // Then apply eviction policy
    let sortedEntries: CacheEntry[];

    switch (this.config.evictionPolicy) {
      case 'lru':
        sortedEntries = entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
        break;

      case 'lfu':
        sortedEntries = entries.sort((a, b) => a.accessCount - b.accessCount);
        break;

      case 'fifo':
        sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);
        break;

      case 'hybrid':
      default:
        // Hybrid policy combining LRU and LFU
        sortedEntries = entries.sort((a, b) => {
          const scoreA = (a.lastAccessed / 1000) * (1 / (a.accessCount + 1));
          const scoreB = (b.lastAccessed / 1000) * (1 / (b.accessCount + 1));
          return scoreA - scoreB;
        });
        break;
    }

    // Select enough entries to free required space plus 10% buffer
    const targetSpace = spaceNeeded * 1.1;
    let spaceFreed = 0;
    const entriesToEvict: CacheEntry[] = [];

    for (const entry of sortedEntries) {
      if (spaceFreed >= targetSpace) break;
      entriesToEvict.push(entry);
      spaceFreed += entry.size;
    }

    return entriesToEvict;
  }

  /**
   * Record access pattern for predictive caching
   */
  private recordAccessPattern(key: string, hit: boolean): void {
    const now = Date.now();
    const pattern = this.accessPatterns.get(key) || { hits: 0, accesses: 0, lastAccessed: 0 };

    if (hit) {
      pattern.hits++;
    }
    pattern.accesses++;
    pattern.lastAccessed = now;

    this.accessPatterns.set(key, pattern);

    // Track access sequence for sequence-based prediction
    this.accessSequence.push(key);
    if (this.accessSequence.length > this.sequenceWindow) {
      this.accessSequence.shift();
    }
  }

  /**
   * Record operation performance metrics
   */
  private recordOperation(operation: string, duration: number, success: boolean): void {
    this.performanceMetrics.totalOperations++;
    this.performanceMetrics.lastOperationTime = duration;

    if (success) {
      this.performanceMetrics.successfulOperations++;
    } else {
      this.performanceMetrics.failedOperations++;
    }

    // Update average operation time
    const totalTime = this.performanceMetrics.averageOperationTime * (this.performanceMetrics.totalOperations - 1) + duration;
    this.performanceMetrics.averageOperationTime = totalTime / this.performanceMetrics.totalOperations;
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    // This method is called periodically to update metrics
    // In a real implementation, you might want to persist metrics or send them to monitoring
  }

  /**
   * Predict next likely accessed keys based on frequency
   */
  private predictNextAccess(): string[] {
    const now = Date.now();
    const predictions: Array<{ key: string; score: number }> = [];

    for (const [key, pattern] of Array.from(this.accessPatterns.entries())) {
      // Only consider recent activity
      if (now - pattern.lastAccessed > this.config.warmingLookbackWindow) continue;

      const hitRate = pattern.hits / pattern.accesses;
      const frequency = pattern.accesses / (this.config.warmingLookbackWindow / 1000);
      const score = hitRate * frequency;

      if (score >= this.config.warmingThreshold && !this.cache.has(key)) {
        predictions.push({ key, score });
      }
    }

    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => p.key);
  }

  /**
   * Predict next likely accessed keys based on sequence patterns
   */
  private predictFromSequences(): string[] {
    if (this.accessSequence.length < 2) return [];

    const lastKey = this.accessSequence[this.accessSequence.length - 1];
    const predictions: string[] = [];

    // Simple pattern: if A -> B happens often, predict B when A occurs
    for (let i = 0; i < this.accessSequence.length - 1; i++) {
      if (this.accessSequence[i] === lastKey) {
        predictions.push(this.accessSequence[i + 1]);
      }
    }

    return Array.from(new Set(predictions));
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number {
    const totalAccesses = this.calculateTotalAccesses();
    const hits = Array.from(this.accessPatterns.values())
      .reduce((sum, pattern) => sum + pattern.hits, 0);

    return totalAccesses > 0 ? hits / totalAccesses : 0;
  }

  /**
   * Calculate total accesses
   */
  private calculateTotalAccesses(): number {
    return Array.from(this.accessPatterns.values())
      .reduce((sum, pattern) => sum + pattern.accesses, 0);
  }

  /**
   * Estimate size of value
   */
  private estimateSize(value: any): number {
    try {
      if (typeof value === 'string') return value.length;
      if (Buffer.isBuffer(value)) return value.length;
      return JSON.stringify(value).length;
    } catch {
      return 1024; // Default 1KB
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    if (this.isShuttingDown) return;

    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key).catch(e => {
        console.warn(`Failed to delete expired key ${key}`, e);
        this.hooks.onError?.(e as Error, 'cleanup');
      });
    }
  }

  /**
   * Compress value (placeholder - implement actual compression)
   */
  private async compressValue<T>(value: T): Promise<any> {
    // In a real implementation, use something like pako or zlib
    // For now, return the original value
    return value;
  }

  /**
   * Decompress value (placeholder - implement actual decompression)
   */
  private async decompressValue<T>(value: any): Promise<T> {
    // In a real implementation, use something like pako or zlib
    // For now, return the original value
    return value as T;
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart maintenance if intervals changed
    if (newConfig.enableMetrics !== undefined ||
        newConfig.metricsIntervalMs !== undefined ||
        newConfig.cleanupIntervalMs !== undefined ||
        newConfig.warmingIntervalMs !== undefined) {

      this.shutdown();
      this.startMaintenance();
    }
  }

  /**
   * Gracefully shutdown the cache
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // Clear intervals
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = undefined;
    }

    await this.clear();
  }
}

// Export singleton instance with default configuration
export const intelligentCache = new IntelligentCache({
  maxSize: 500 * 1024 * 1024, // 500MB
  enableCompression: true,
  evictionPolicy: 'hybrid',
  enableMetrics: true
});
