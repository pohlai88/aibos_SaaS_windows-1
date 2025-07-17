import { z } from 'zod';
import { UUID, ISODate, TenantID } from '../primitives';
import {
  MetadataCacheType,
  MetadataCacheTypes,
  MetadataCacheStrategy,
  MetadataCacheStrategies,
} from './metadata.enums';
import {
  MetadataEntity,
  MetadataField,
  MetadataSchema,
  MetadataValue,
  MetadataQuery,
} from './metadata.types';

// ============================================================================
// CACHE ENUMS
// ============================================================================

export const MetadataCacheLevel = {
  L1: 'l1', // Memory cache (fastest)
  L2: 'l2', // Distributed cache (Redis, Memcached)
  L3: 'l3', // Persistent cache (database, file system)
} as const;

export type MetadataCacheLevel = (typeof MetadataCacheLevel)[keyof typeof MetadataCacheLevel];

export const MetadataCacheStatus = {
  HIT: 'hit',
  MISS: 'miss',
  STALE: 'stale',
  EXPIRED: 'expired',
  INVALIDATED: 'invalidated',
} as const;

export type MetadataCacheStatus = (typeof MetadataCacheStatus)[keyof typeof MetadataCacheStatus];

export const MetadataCacheEvictionPolicy = {
  LRU: 'lru', // Least Recently Used
  LFU: 'lfu', // Least Frequently Used
  FIFO: 'fifo', // First In, First Out
  TTL: 'ttl', // Time To Live
  RANDOM: 'random', // Random eviction
  CUSTOM: 'custom', // Custom eviction logic
} as const;

export type MetadataCacheEvictionPolicy =
  (typeof MetadataCacheEvictionPolicy)[keyof typeof MetadataCacheEvictionPolicy];

// ============================================================================
// CACHE INTERFACES
// ============================================================================

export interface MetadataCacheEntry<T = any> {
  key: string;
  value: T;
  metadata: {
    createdAt: ISODate;
    updatedAt: ISODate;
    accessedAt: ISODate;
    accessCount: number;
    size: number;
    ttl?: number;
    expiresAt?: ISODate;
    tags?: string[];
    version?: string;
    checksum?: string;
  };
}

export interface MetadataCacheConfig {
  // Basic configuration
  name: string;
  type: MetadataCacheType;
  level: MetadataCacheLevel;
  strategy: MetadataCacheStrategy;

  // Capacity and limits
  maxSize: number; // in bytes
  maxEntries: number;
  maxMemoryUsage: number; // percentage

  // TTL configuration
  defaultTtl: number; // in seconds
  maxTtl: number;
  minTtl: number;

  // Eviction configuration
  evictionPolicy: MetadataCacheEvictionPolicy;
  evictionThreshold: number; // percentage
  cleanupInterval: number; // in seconds

  // Performance configuration
  compression: boolean;
  serialization: 'json' | 'binary' | 'custom';
  async: boolean;

  // Advanced configuration
  clustering: boolean;
  replication: boolean;
  persistence: boolean;
  encryption: boolean;

  // Monitoring
  metrics: boolean;
  logging: boolean;

  // Custom options
  options?: Record<string, any>;
}

export interface MetadataCacheStats {
  // Basic stats
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;

  // Memory stats
  currentSize: number;
  maxSize: number;
  memoryUsage: number;
  entryCount: number;
  maxEntries: number;

  // Performance stats
  averageResponseTime: number;
  slowestResponseTime: number;
  fastestResponseTime: number;

  // Eviction stats
  evictions: number;
  evictionRate: number;

  // Error stats
  errors: number;
  errorRate: number;

  // Timestamps
  lastReset: ISODate;
  lastCleanup: ISODate;
}

export interface MetadataCacheMetrics {
  // Request metrics
  requests: {
    total: number;
    hits: number;
    misses: number;
    errors: number;
  };

  // Performance metrics
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowestQueries: Array<{
      key: string;
      responseTime: number;
      timestamp: ISODate;
    }>;
  };

  // Memory metrics
  memory: {
    currentUsage: number;
    peakUsage: number;
    fragmentation: number;
    evictions: number;
  };

  // Business metrics
  business: {
    mostAccessedKeys: Array<{
      key: string;
      accessCount: number;
      lastAccessed: ISODate;
    }>;
    cacheEfficiency: number;
    costSavings: number;
  };
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

export interface MetadataCacheOperation {
  id: UUID;
  type: 'get' | 'set' | 'delete' | 'clear' | 'invalidate';
  key: string;
  timestamp: ISODate;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MetadataCacheInvalidationRule {
  id: UUID;
  name: string;
  description?: string;

  // Pattern matching
  pattern: string; // regex pattern for keys
  tags?: string[];

  // Conditions
  conditions?: {
    timeBased?: {
      schedule?: string;
      validFrom?: ISODate;
      validTo?: ISODate;
    };
    dataBased?: {
      field?: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    };
    dependencyBased?: {
      dependencies: string[];
      cascade: boolean;
    };
  };

  // Actions
  actions: {
    invalidate: boolean;
    update?: Record<string, any>;
    notify?: string[];
  };

  // Metadata
  tenantId: TenantID;
  createdBy: string;
  createdAt: ISODate;
  isActive: boolean;
  priority: number;
}

export interface MetadataCacheDependency {
  id: UUID;
  key: string;
  dependencies: string[];
  type: 'strong' | 'weak' | 'conditional';
  cascade: boolean;
  tenantId: TenantID;
  createdAt: ISODate;
  isActive: boolean;
}

// ============================================================================
// CACHE PROVIDERS
// ============================================================================

export interface MetadataCacheProvider {
  // Basic operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: MetadataCacheSetOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;

  // Batch operations
  getMany<T>(keys: string[]): Promise<Record<string, T | null>>;
  setMany<T>(
    entries: Array<{ key: string; value: T; options?: MetadataCacheSetOptions }>,
  ): Promise<void>;
  deleteMany(keys: string[]): Promise<number>;

  // Advanced operations
  exists(key: string): Promise<boolean>;
  touch(key: string): Promise<void>;
  increment(key: string, value?: number): Promise<number>;
  decrement(key: string, value?: number): Promise<number>;

  // Query operations
  keys(pattern?: string): Promise<string[]>;
  values<T>(pattern?: string): Promise<T[]>;
  entries<T>(pattern?: string): Promise<Array<{ key: string; value: T }>>;

  // Statistics
  stats(): Promise<MetadataCacheStats>;
  metrics(): Promise<MetadataCacheMetrics>;

  // Management
  health(): Promise<{ healthy: boolean; details?: Record<string, any> }>;
  cleanup(): Promise<void>;
  reset(): Promise<void>;
}

export interface MetadataCacheSetOptions {
  ttl?: number;
  tags?: string[];
  version?: string;
  compress?: boolean;
  encrypt?: boolean;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface MetadataCacheGetOptions {
  includeMetadata?: boolean;
  updateAccessTime?: boolean;
  fallback?: () => Promise<any>;
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

export interface MetadataCacheManager {
  // Provider management
  registerProvider(
    name: string,
    provider: MetadataCacheProvider,
    config: MetadataCacheConfig,
  ): void;
  getProvider(name: string): MetadataCacheProvider | null;
  listProviders(): string[];

  // Multi-level caching
  get<T>(key: string, options?: MetadataCacheGetOptions): Promise<T | null>;
  set<T>(key: string, value: T, options?: MetadataCacheSetOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;

  // Cache strategies
  getWithStrategy<T>(
    key: string,
    strategy: MetadataCacheStrategy,
    options?: MetadataCacheGetOptions,
  ): Promise<T | null>;
  setWithStrategy<T>(
    key: string,
    value: T,
    strategy: MetadataCacheStrategy,
    options?: MetadataCacheSetOptions,
  ): Promise<void>;

  // Invalidation
  invalidate(pattern: string): Promise<number>;
  invalidateByTags(tags: string[]): Promise<number>;
  invalidateByDependencies(dependencies: string[]): Promise<number>;

  // Dependencies
  addDependency(key: string, dependencies: string[]): Promise<void>;
  removeDependency(key: string): Promise<void>;
  getDependencies(key: string): Promise<string[]>;

  // Monitoring
  getStats(): Promise<Record<string, MetadataCacheStats>>;
  getMetrics(): Promise<Record<string, MetadataCacheMetrics>>;

  // Health checks
  health(): Promise<Record<string, { healthy: boolean; details?: Record<string, any> }>>;
}

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

export interface MetadataCacheStrategy {
  name: string;
  description?: string;

  // Strategy configuration
  levels: MetadataCacheLevel[];
  readPolicy: 'cache_first' | 'cache_only' | 'cache_after' | 'cache_around';
  writePolicy: 'write_through' | 'write_behind' | 'write_around';

  // TTL strategy
  ttlStrategy: {
    type: 'fixed' | 'adaptive' | 'sliding' | 'custom';
    baseTtl: number;
    maxTtl: number;
    minTtl: number;
  };

  // Invalidation strategy
  invalidationStrategy: {
    type: 'time_based' | 'event_based' | 'dependency_based' | 'hybrid';
    rules: MetadataCacheInvalidationRule[];
  };

  // Performance tuning
  performance: {
    compression: boolean;
    serialization: 'json' | 'binary' | 'custom';
    async: boolean;
    batchSize: number;
  };
}

export interface MetadataCacheStrategyExecutor {
  execute<T>(
    operation: 'get' | 'set' | 'delete',
    key: string,
    value?: T,
    options?: MetadataCacheSetOptions,
  ): Promise<T | null>;

  shouldCache(key: string, value: any): boolean;
  shouldInvalidate(key: string, reason: string): boolean;
  getOptimalTtl(key: string, value: any): number;
}

// ============================================================================
// CACHE VALIDATION
// ============================================================================

export const MetadataCacheConfigSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(MetadataCacheTypes),
  level: z.nativeEnum(MetadataCacheLevel),
  strategy: z.nativeEnum(MetadataCacheStrategies),
  maxSize: z.number().positive(),
  maxEntries: z.number().positive(),
  maxMemoryUsage: z.number().min(0).max(100),
  defaultTtl: z.number().positive(),
  maxTtl: z.number().positive(),
  minTtl: z.number().positive(),
  evictionPolicy: z.nativeEnum(MetadataCacheEvictionPolicy),
  evictionThreshold: z.number().min(0).max(100),
  cleanupInterval: z.number().positive(),
  compression: z.boolean(),
  serialization: z.enum(['json', 'binary', 'custom']),
  async: z.boolean(),
  clustering: z.boolean(),
  replication: z.boolean(),
  persistence: z.boolean(),
  encryption: z.boolean(),
  metrics: z.boolean(),
  logging: z.boolean(),
  options: z.record(z.any()).optional(),
});

export const MetadataCacheEntrySchema = z.object({
  key: z.string(),
  value: z.any(),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    accessedAt: z.string().datetime(),
    accessCount: z.number().nonnegative(),
    size: z.number().nonnegative(),
    ttl: z.number().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    checksum: z.string().optional(),
  }),
});

export const MetadataCacheInvalidationRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  pattern: z.string(),
  tags: z.array(z.string()).optional(),
  conditions: z
    .object({
      timeBased: z
        .object({
          schedule: z.string().optional(),
          validFrom: z.string().datetime().optional(),
          validTo: z.string().datetime().optional(),
        })
        .optional(),
      dataBased: z
        .object({
          field: z.string().optional(),
          operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
          value: z.any(),
        })
        .optional(),
      dependencyBased: z
        .object({
          dependencies: z.array(z.string()),
          cascade: z.boolean(),
        })
        .optional(),
    })
    .optional(),
  actions: z.object({
    invalidate: z.boolean(),
    update: z.record(z.any()).optional(),
    notify: z.array(z.string()).optional(),
  }),
  tenantId: z.string().uuid(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
});

// ============================================================================
// CACHE UTILITIES
// ============================================================================

export class MetadataCacheUtils {
  /**
   * Generates a cache key from components
   */
  static generateKey(...components: (string | number | boolean)[]): string {
    return components
      .map((component) => String(component).replace(/[^a-zA-Z0-9_-]/g, '_'))
      .join(':');
  }

  /**
   * Generates a cache key for metadata entities
   */
  static generateEntityKey(entityType: string, entityId: UUID, tenantId: TenantID): string {
    return this.generateKey('entity', entityType, entityId, tenantId);
  }

  /**
   * Generates a cache key for metadata fields
   */
  static generateFieldKey(entityId: UUID, fieldId: UUID, tenantId: TenantID): string {
    return this.generateKey('field', entityId, fieldId, tenantId);
  }

  /**
   * Generates a cache key for metadata schemas
   */
  static generateSchemaKey(schemaId: UUID, tenantId: TenantID): string {
    return this.generateKey('schema', schemaId, tenantId);
  }

  /**
   * Generates a cache key for queries
   */
  static generateQueryKey(query: MetadataQuery, tenantId: TenantID): string {
    const queryHash = this.hashQuery(query);
    return this.generateKey('query', queryHash, tenantId);
  }

  /**
   * Creates a hash for a query object
   */
  static hashQuery(query: MetadataQuery): string {
    const queryStr = JSON.stringify(query);
    return Buffer.from(queryStr)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Validates a cache configuration
   */
  static validateConfig(config: MetadataCacheConfig): { valid: boolean; errors?: string[] } {
    try {
      MetadataCacheConfigSchema.parse(config);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Calculates the size of a cache entry
   */
  static calculateEntrySize(entry: MetadataCacheEntry): number {
    const keySize = Buffer.byteLength(entry.key, 'utf8');
    const valueSize = Buffer.byteLength(JSON.stringify(entry.value), 'utf8');
    const metadataSize = Buffer.byteLength(JSON.stringify(entry.metadata), 'utf8');
    return keySize + valueSize + metadataSize;
  }

  /**
   * Checks if a cache entry has expired
   */
  static isExpired(entry: MetadataCacheEntry): boolean {
    if (!entry.metadata.expiresAt) {
      return false;
    }
    return new Date(entry.metadata.expiresAt) < new Date();
  }

  /**
   * Checks if a cache entry is stale
   */
  static isStale(entry: MetadataCacheEntry, staleThreshold: number): boolean {
    const lastAccessed = new Date(entry.metadata.accessedAt);
    const now = new Date();
    const ageInSeconds = (now.getTime() - lastAccessed.getTime()) / 1000;
    return ageInSeconds > staleThreshold;
  }

  /**
   * Updates access metadata for a cache entry
   */
  static updateAccessMetadata(entry: MetadataCacheEntry): MetadataCacheEntry {
    return {
      ...entry,
      metadata: {
        ...entry.metadata,
        accessedAt: new Date().toISOString() as ISODate,
        accessCount: entry.metadata.accessCount + 1,
      },
    };
  }

  /**
   * Creates a cache entry with default metadata
   */
  static createEntry<T>(
    key: string,
    value: T,
    options?: MetadataCacheSetOptions,
  ): MetadataCacheEntry<T> {
    const now = new Date().toISOString() as ISODate;
    const ttl = options?.ttl || 3600; // 1 hour default
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString() as ISODate;

    return {
      key,
      value,
      metadata: {
        createdAt: now,
        updatedAt: now,
        accessedAt: now,
        accessCount: 0,
        size: this.calculateEntrySize({ key, value, metadata: {} as any }),
        ttl,
        expiresAt,
        tags: options?.tags || [],
        version: options?.version,
        checksum: this.generateChecksum(value),
      },
    };
  }

  /**
   * Generates a checksum for a value
   */
  static generateChecksum(value: any): string {
    const valueStr = JSON.stringify(value);
    return Buffer.from(valueStr).toString('base64').substring(0, 16);
  }

  /**
   * Compresses a value if needed
   */
  static compress(value: any): Buffer {
    const valueStr = JSON.stringify(value);
    return Buffer.from(valueStr, 'utf8');
  }

  /**
   * Decompresses a value if needed
   */
  static decompress(data: Buffer): any {
    const valueStr = data.toString('utf8');
    return JSON.parse(valueStr);
  }

  /**
   * Encrypts a value
   */
  static encrypt(value: any, key: string): string {
    // This is a placeholder - in a real implementation, you'd use a proper encryption library
    const valueStr = JSON.stringify(value);
    return Buffer.from(valueStr).toString('base64');
  }

  /**
   * Decrypts a value
   */
  static decrypt(encryptedValue: string, key: string): any {
    // This is a placeholder - in a real implementation, you'd use a proper encryption library
    const valueStr = Buffer.from(encryptedValue, 'base64').toString('utf8');
    return JSON.parse(valueStr);
  }

  /**
   * Matches a key against a pattern
   */
  static matchesPattern(key: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Extracts tags from a cache key
   */
  static extractTags(key: string): string[] {
    const parts = key.split(':');
    return parts.filter((part) => part.startsWith('tag_')).map((part) => part.substring(4));
  }

  /**
   * Adds tags to a cache key
   */
  static addTags(key: string, tags: string[]): string {
    const tagParts = tags.map((tag) => `tag_${tag}`);
    return `${key}:${tagParts.join(':')}`;
  }

  /**
   * Removes tags from a cache key
   */
  static removeTags(key: string): string {
    const parts = key.split(':');
    return parts.filter((part) => !part.startsWith('tag_')).join(':');
  }

  /**
   * Calculates cache hit rate
   */
  static calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  /**
   * Calculates memory usage percentage
   */
  static calculateMemoryUsage(currentSize: number, maxSize: number): number {
    return maxSize > 0 ? (currentSize / maxSize) * 100 : 0;
  }

  /**
   * Formats cache statistics for display
   */
  static formatStats(stats: MetadataCacheStats): Record<string, string> {
    return {
      'Hit Rate': `${stats.hitRate.toFixed(2)}%`,
      'Memory Usage': `${stats.memoryUsage.toFixed(2)}%`,
      'Entry Count': `${stats.entryCount}/${stats.maxEntries}`,
      'Average Response Time': `${stats.averageResponseTime.toFixed(2)}ms`,
      'Eviction Rate': `${stats.evictionRate.toFixed(2)}/min`,
      'Error Rate': `${stats.errorRate.toFixed(2)}%`,
    };
  }

  /**
   * Creates a cache invalidation rule
   */
  static createInvalidationRule(
    name: string,
    pattern: string,
    tenantId: TenantID,
    createdBy: string,
    options?: Partial<MetadataCacheInvalidationRule>,
  ): MetadataCacheInvalidationRule {
    return {
      id: crypto.randomUUID() as UUID,
      name,
      pattern,
      actions: {
        invalidate: true,
      },
      tenantId,
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      priority: 0,
      ...options,
    };
  }

  /**
   * Validates an invalidation rule
   */
  static validateInvalidationRule(rule: MetadataCacheInvalidationRule): {
    valid: boolean;
    errors?: string[];
  } {
    try {
      MetadataCacheInvalidationRuleSchema.parse(rule);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  MetadataCacheEntry,
  MetadataCacheConfig,
  MetadataCacheStats,
  MetadataCacheMetrics,
  MetadataCacheOperation,
  MetadataCacheInvalidationRule,
  MetadataCacheDependency,
  MetadataCacheProvider,
  MetadataCacheSetOptions,
  MetadataCacheGetOptions,
  MetadataCacheManager,
  MetadataCacheStrategy,
  MetadataCacheStrategyExecutor,
};

export {
  MetadataCacheLevel,
  MetadataCacheStatus,
  MetadataCacheEvictionPolicy,
  MetadataCacheConfigSchema,
  MetadataCacheEntrySchema,
  MetadataCacheInvalidationRuleSchema,
  MetadataCacheUtils,
};
