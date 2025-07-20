// CacheService
// Redis-like caching service with TTL, eviction policies, and statistics

interface CacheEntry<T = any> {
  key: string;
  value: T;
  created_at: number;
  accessed_at: number;
  access_count: number;
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // For cache invalidation by tags
}

interface CacheStatistics {
  total_entries: number;
  total_size: number;
  hit_count: number;
  miss_count: number;
  hit_rate: number;
  evicted_count: number;
  memory_usage: number;
  average_ttl: number;
}

interface CacheConfig {
  max_size: number; // Maximum number of entries
  max_memory: number; // Maximum memory usage in bytes
  default_ttl: number; // Default TTL in milliseconds
  eviction_policy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  cleanup_interval: number; // Cleanup interval in milliseconds
  enable_statistics: boolean;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private statistics: CacheStatistics;
  private cleanupTimer?: NodeJS.Timeout;
  private accessOrder: string[] = []; // For LRU tracking
  private tagIndex: Map<string, Set<string>> = new Map(); // Tag to keys mapping

  private constructor() {
    this.config = {
      max_size: 1000,
      max_memory: 100 * 1024 * 1024, // 100MB
      default_ttl: 5 * 60 * 1000, // 5 minutes
      eviction_policy: 'lru',
      cleanup_interval: 60 * 1000, // 1 minute
      enable_statistics: true,
    };

    this.statistics = {
      total_entries: 0,
      total_size: 0,
      hit_count: 0,
      miss_count: 0,
      hit_rate: 0,
      evicted_count: 0,
      memory_usage: 0,
      average_ttl: 0,
    };

    this.startCleanupTimer();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Configuration
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart cleanup timer if interval changed
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.startCleanupTimer();
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanup_interval);
  }

  // Core Cache Operations
  set<T>(key: string, value: T, options: {
    ttl?: number;
    tags?: string[];
  } = {}): void {
    try {
      const ttl = options.ttl ?? this.config.default_ttl;
      const tags = options.tags || [];

      // Remove existing entry if it exists
      this.delete(key);

      // Check if we need to evict entries
      if (this.cache.size >= this.config.max_size) {
        this.evict();
      }

      // Create new entry
      const entry: CacheEntry<T> = {
        key,
        value,
        created_at: Date.now(),
        accessed_at: Date.now(),
        access_count: 0,
        ttl,
        tags,
      };

      this.cache.set(key, entry);
      this.accessOrder.push(key);

      // Update tag index
      tags.forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      });

      this.updateStatistics();
    } catch (error) {
      console.error('Error setting cache entry:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.statistics.miss_count++;
        this.updateStatistics();
        return null;
      }

      // Check if entry has expired
      if (entry.ttl && Date.now() - entry.created_at > entry.ttl) {
        this.delete(key);
        this.statistics.miss_count++;
        this.updateStatistics();
        return null;
      }

      // Update access statistics
      entry.accessed_at = Date.now();
      entry.access_count++;

      // Update LRU order
      this.updateAccessOrder(key);

      this.statistics.hit_count++;
      this.updateStatistics();

      return entry.value as T;
    } catch (error) {
      console.error('Error getting cache entry:', error);
      return null;
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (entry.ttl && Date.now() - entry.created_at > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    try {
      const entry = this.cache.get(key);
      if (!entry) return false;

      // Remove from cache
      this.cache.delete(key);

      // Remove from access order
      const orderIndex = this.accessOrder.indexOf(key);
      if (orderIndex > -1) {
        this.accessOrder.splice(orderIndex, 1);
      }

      // Remove from tag index
      if (entry.tags) {
        entry.tags.forEach(tag => {
          const tagSet = this.tagIndex.get(tag);
          if (tagSet) {
            tagSet.delete(key);
            if (tagSet.size === 0) {
              this.tagIndex.delete(tag);
            }
          }
        });
      }

      this.updateStatistics();
      return true;
    } catch (error) {
      console.error('Error deleting cache entry:', error);
      return false;
    }
  }

  clear(): void {
    try {
      this.cache.clear();
      this.accessOrder = [];
      this.tagIndex.clear();
      this.updateStatistics();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Advanced Operations
  getOrSet<T>(key: string, factory: () => T | Promise<T>, options: {
    ttl?: number;
    tags?: string[];
  } = {}): T | Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = factory();
    if (result instanceof Promise) {
      return result.then(value => {
        this.set(key, value, options);
        return value;
      });
    } else {
      this.set(key, result, options);
      return result;
    }
  }

  async getOrSetAsync<T>(key: string, factory: () => Promise<T>, options: {
    ttl?: number;
    tags?: string[];
  } = {}): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  // Tag-based Operations
  invalidateByTag(tag: string): number {
    try {
      const keys = this.tagIndex.get(tag);
      if (!keys) return 0;

      let count = 0;
      keys.forEach(key => {
        if (this.delete(key)) {
          count++;
        }
      });

      this.tagIndex.delete(tag);
      return count;
    } catch (error) {
      console.error('Error invalidating by tag:', error);
      return 0;
    }
  }

  invalidateByTags(tags: string[]): number {
    return tags.reduce((total, tag) => total + this.invalidateByTag(tag), 0);
  }

  getKeysByTag(tag: string): string[] {
    const keys = this.tagIndex.get(tag);
    return keys ? Array.from(keys) : [];
  }

  // Pattern-based Operations
  keys(pattern?: string): string[] {
    try {
      let keys = Array.from(this.cache.keys());

      if (pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        keys = keys.filter(key => regex.test(key));
      }

      return keys;
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  deletePattern(pattern: string): number {
    try {
      const keys = this.keys(pattern);
      return keys.reduce((count, key) => count + (this.delete(key) ? 1 : 0), 0);
    } catch (error) {
      console.error('Error deleting by pattern:', error);
      return 0;
    }
  }

  // Bulk Operations
  mget<T>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key));
  }

  mset<T>(entries: Array<{ key: string; value: T; options?: { ttl?: number; tags?: string[] } }>): void {
    entries.forEach(({ key, value, options }) => {
      this.set(key, value, options || {});
    });
  }

  mdelete(keys: string[]): number {
    return keys.reduce((count, key) => count + (this.delete(key) ? 1 : 0), 0);
  }

  // Statistics and Monitoring
  getStatistics(): CacheStatistics {
    return { ...this.statistics };
  }

  private updateStatistics(): void {
    if (!this.config.enable_statistics) return;

    try {
      const entries = Array.from(this.cache.values());
      const now = Date.now();

      this.statistics.total_entries = this.cache.size;
      this.statistics.total_size = entries.length;

      // Calculate hit rate
      const totalRequests = this.statistics.hit_count + this.statistics.miss_count;
      this.statistics.hit_rate = totalRequests > 0 ? this.statistics.hit_count / totalRequests : 0;

      // Calculate memory usage (rough estimate)
      this.statistics.memory_usage = this.estimateMemoryUsage();

      // Calculate average TTL
      const entriesWithTTL = entries.filter(e => e.ttl);
      this.statistics.average_ttl = entriesWithTTL.length > 0
        ? entriesWithTTL.reduce((sum, e) => sum + (e.ttl || 0), 0) / entriesWithTTL.length
        : 0;
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  private estimateMemoryUsage(): number {
    try {
      let totalSize = 0;
      for (const [key, entry] of this.cache.entries()) {
        // Rough estimation: key + value + metadata
        totalSize += key.length * 2; // UTF-16
        totalSize += JSON.stringify(entry.value).length * 2;
        totalSize += 200; // Metadata overhead
      }
      return totalSize;
    } catch (error) {
      console.error('Error estimating memory usage:', error);
      return 0;
    }
  }

  // Eviction and Cleanup
  private evict(): void {
    try {
      switch (this.config.eviction_policy) {
        case 'lru':
          this.evictLRU();
          break;
        case 'lfu':
          this.evictLFU();
          break;
        case 'fifo':
          this.evictFIFO();
          break;
        case 'ttl':
          this.evictTTL();
          break;
        default:
          this.evictLRU();
      }
    } catch (error) {
      console.error('Error during eviction:', error);
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const keyToEvict = this.accessOrder[0];
    this.delete(keyToEvict);
    this.statistics.evicted_count++;
  }

  private evictLFU(): void {
    let minAccessCount = Infinity;
    let keyToEvict = '';

    for (const [key, entry] of this.cache.entries()) {
      if (entry.access_count < minAccessCount) {
        minAccessCount = entry.access_count;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.statistics.evicted_count++;
    }
  }

  private evictFIFO(): void {
    if (this.accessOrder.length === 0) return;

    const keyToEvict = this.accessOrder[this.accessOrder.length - 1];
    this.delete(keyToEvict);
    this.statistics.evicted_count++;
  }

  private evictTTL(): void {
    let oldestEntry: CacheEntry | null = null;
    let oldestKey = '';

    for (const [key, entry] of this.cache.entries()) {
      if (!oldestEntry || entry.created_at < oldestEntry.created_at) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.statistics.evicted_count++;
    }
  }

  private cleanup(): void {
    try {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (entry.ttl && now - entry.created_at > entry.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.delete(key));
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  // Cache Warming and Preloading
  async warmCache<T>(entries: Array<{
    key: string;
    factory: () => T | Promise<T>;
    options?: { ttl?: number; tags?: string[] };
  }>): Promise<void> {
    try {
      const promises = entries.map(async ({ key, factory, options }) => {
        try {
          const value = await Promise.resolve(factory());
          this.set(key, value, options || {});
        } catch (error) {
          console.error(`Error warming cache for key ${key}:`, error);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error warming cache:', error);
    }
  }

  // Cache Health and Diagnostics
  getHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check memory usage
    if (this.statistics.memory_usage > this.config.max_memory * 0.8) {
      issues.push('High memory usage');
      recommendations.push('Consider increasing max_memory or reducing cache size');
    }

    // Check hit rate
    if (this.statistics.hit_rate < 0.5) {
      issues.push('Low cache hit rate');
      recommendations.push('Review cache keys and TTL settings');
    }

    // Check eviction rate
    if (this.statistics.evicted_count > this.statistics.total_entries * 0.1) {
      issues.push('High eviction rate');
      recommendations.push('Consider increasing cache size or adjusting eviction policy');
    }

    const status = issues.length === 0 ? 'healthy' : issues.length <= 2 ? 'warning' : 'critical';

    return { status, issues, recommendations };
  }

  // Cache Export/Import
  export(): string {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        statistics: this.statistics,
        config: this.config,
        exportTime: new Date().toISOString(),
      };
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error exporting cache:', error);
      return '';
    }
  }

  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      // Clear existing cache
      this.clear();
      
      // Import entries
      if (parsed.entries) {
        parsed.entries.forEach(([key, entry]: [string, CacheEntry]) => {
          this.cache.set(key, entry);
          this.accessOrder.push(key);
          
          // Rebuild tag index
          if (entry.tags) {
            entry.tags.forEach(tag => {
              if (!this.tagIndex.has(tag)) {
                this.tagIndex.set(tag, new Set());
              }
              this.tagIndex.get(tag)!.add(key);
            });
          }
        });
      }
      
      // Import statistics
      if (parsed.statistics) {
        this.statistics = { ...this.statistics, ...parsed.statistics };
      }
      
      this.updateStatistics();
      return true;
    } catch (error) {
      console.error('Error importing cache:', error);
      return false;
    }
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Export types for convenience
export type { CacheEntry, CacheStatistics, CacheConfig }; 