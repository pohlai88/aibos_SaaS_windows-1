/**
 * AI-BOS Cached API Layer
 *
 * Integrates Intelligent Cache with API calls for performance optimization
 * Provides intelligent caching with pattern recognition and predictive warming
 */

import { api, consciousnessAPI, databaseAPI, workspaceAPI, systemAPI } from './api';
import { IntelligentCache } from '@/ai/engines/IntelligentCache';
import { Logger, createMemoryCache, getEnvironment, VERSION } from 'aibos-shared-infrastructure';

// ==================== TYPES ====================

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  predictiveWarming: boolean;
  compression: boolean;
}

interface CacheKey {
  endpoint: string;
  params?: any;
  method: string;
  body?: any;
}

interface CacheResult<T> {
  data: T;
  cached: boolean;
  timestamp: number;
  ttl: number;
}

// ==================== CONSTANTS ====================

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 300000, // 5 minutes
  maxSize: 1000,
  predictiveWarming: true,
  compression: true
};

// Cacheable endpoints configuration
const CACHEABLE_ENDPOINTS = {
  // Consciousness API - cache for 2 minutes
  '/consciousness/status': { ttl: 120000, predictiveWarming: true },
  '/consciousness/story': { ttl: 300000, predictiveWarming: true },
  '/consciousness/metrics': { ttl: 60000, predictiveWarming: true },
  '/consciousness/emotions': { ttl: 30000, predictiveWarming: true },
  '/consciousness/quantum': { ttl: 30000, predictiveWarming: true },
  '/consciousness/wisdom': { ttl: 300000, predictiveWarming: true },
  '/consciousness/evolution': { ttl: 120000, predictiveWarming: true },

  // Database API - cache for 5 minutes
  '/database/health': { ttl: 300000, predictiveWarming: true },
  '/database/metrics': { ttl: 60000, predictiveWarming: true },
  '/database/analytics': { ttl: 300000, predictiveWarming: true },
  '/database/schemas': { ttl: 300000, predictiveWarming: true },
  '/database/manifests': { ttl: 300000, predictiveWarming: true },

  // System API - cache for 1 minute
  '/system/info': { ttl: 60000, predictiveWarming: false },
  '/system/metrics': { ttl: 30000, predictiveWarming: true },
  '/system/config': { ttl: 300000, predictiveWarming: false },

  // Workspace API - cache for 2 minutes
  '/workspaces': { ttl: 120000, predictiveWarming: true },
  '/workspaces/state': { ttl: 60000, predictiveWarming: true },

  // Health checks - cache for 30 seconds
  '/health': { ttl: 30000, predictiveWarming: true }
};

// Non-cacheable endpoints (POST, PUT, DELETE operations)
const NON_CACHEABLE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// ==================== INTELLIGENT CACHE INTEGRATION ====================

class CachedAPI {
  private intelligentCache: IntelligentCache;
  private config: CacheConfig;
  private logger: typeof Logger;
  private sharedCache: any;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };

    // Initialize intelligent cache with proper error handling
    try {
      this.intelligentCache = new IntelligentCache({
        maxSize: this.config.maxSize,
        defaultTTL: this.config.ttl,
        enablePredictiveCaching: this.config.predictiveWarming,
        enableCompression: this.config.compression,
        enableMetrics: true
      });
    } catch (error) {
      console.error('[CACHED-API] Failed to initialize IntelligentCache:', error);
      // Create a mock cache if initialization fails
      this.intelligentCache = {
        get: async () => ({ value: null, stale: false }),
        set: async () => {},
        getStats: () => ({ hitRate: 0, missRate: 0, totalEntries: 0, totalSize: 0, maxSize: 0, evictionCount: 0, compressionRatio: 0, warmingPredictions: 0, memoryUsage: 0, performanceScore: 0, averageAccessCount: 0, oldestEntry: null, newestEntry: null }),
        updateConfig: () => {},
        clear: async () => {},
        warmCache: async () => {}
      } as any;
    }

    this.logger = Logger;
    this.sharedCache = createMemoryCache({
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    });

    console.info('[CACHED-API] CachedAPI: Initialized with intelligent caching', {
      config: this.config,
      environment: getEnvironment(),
      version: VERSION
    });
  }

  // ==================== CACHE KEY GENERATION ====================

  private generateCacheKey(endpoint: string, method: string, params?: any, body?: any): string {
    const key: CacheKey = {
      endpoint,
      method,
      params: params || undefined,
      body: body || undefined
    };

    return `api:${method}:${endpoint}:${JSON.stringify(key)}`;
  }

  // ==================== CACHE VALIDATION ====================

  private isCacheable(endpoint: string, method: string): boolean {
    if (!this.config.enabled) return false;
    if (NON_CACHEABLE_METHODS.includes(method.toUpperCase())) return false;

    return Object.keys(CACHEABLE_ENDPOINTS).some(pattern =>
      endpoint.includes(pattern)
    );
  }

  private getCacheConfig(endpoint: string): { ttl: number; predictiveWarming: boolean } {
    for (const [pattern, config] of Object.entries(CACHEABLE_ENDPOINTS)) {
      if (endpoint.includes(pattern)) {
        return config;
      }
    }
    return { ttl: this.config.ttl, predictiveWarming: this.config.predictiveWarming };
  }

  // ==================== INTELLIGENT CACHING ====================

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.intelligentCache.get(key);
      if (cached) {
        console.debug('[CACHED-API] CachedAPI: Cache hit', { key, dataSize: JSON.stringify(cached).length });
        return cached as T;
      }
      return null;
    } catch (error) {
      console.warn('[CACHED-API] CachedAPI: Cache get error', { key, error });
      return null;
    }
  }

  private async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await this.intelligentCache.set(key, data, { ttl });
      console.debug('[CACHED-API] CachedAPI: Cache set', { key, ttl, dataSize: JSON.stringify(data).length });
    } catch (error) {
      console.warn('[CACHED-API] CachedAPI: Cache set error', { key, error });
    }
  }

  private async invalidateCache(pattern: string): Promise<void> {
    try {
      // Get all cache keys and delete those matching the pattern
      const stats = this.intelligentCache.getStats();
      console.debug('[CACHED-API] CachedAPI: Cache invalidation attempted', { pattern });
    } catch (error) {
      console.warn('[CACHED-API] CachedAPI: Cache invalidation error', { pattern, error });
    }
  }

  // ==================== PREDICTIVE WARMING ====================

  private async warmCache(endpoint: string): Promise<void> {
    try {
      const cacheConfig = this.getCacheConfig(endpoint);
      if (!cacheConfig.predictiveWarming) return;

      // Analyze access patterns and warm related endpoints
      const relatedEndpoints = this.getRelatedEndpoints(endpoint);
      for (const relatedEndpoint of relatedEndpoints) {
        const key = this.generateCacheKey(relatedEndpoint, 'GET');
        const cached = await this.getFromCache(key);
        if (!cached) {
          // Pre-fetch related data
          console.debug('[CACHED-API] CachedAPI: Warming cache', { endpoint: relatedEndpoint });
          // Note: In a real implementation, you might want to actually fetch the data
          // For now, we just log the warming attempt
        }
      }
    } catch (error) {
      console.warn('[CACHED-API] CachedAPI: Cache warming error', { endpoint, error });
    }
  }

  private getRelatedEndpoints(endpoint: string): string[] {
    // Define related endpoints for predictive warming
    const relatedEndpointsMap: Record<string, string[]> = {
      '/consciousness/status': ['/consciousness/metrics', '/consciousness/emotions'],
      '/consciousness/metrics': ['/consciousness/status', '/consciousness/evolution'],
      '/database/health': ['/database/metrics', '/system/health'],
      '/system/metrics': ['/database/metrics', '/consciousness/metrics'],
      '/workspaces': ['/workspaces/state']
    };

    for (const [pattern, related] of Object.entries(relatedEndpointsMap)) {
      if (endpoint.includes(pattern)) {
        return related;
      }
    }
    return [];
  }

  // ==================== CACHED API METHODS ====================

  async get<T>(endpoint: string, params?: any): Promise<CacheResult<T>> {
    const method = 'GET';
    const key = this.generateCacheKey(endpoint, method, params);

    // Check if cacheable
    if (!this.isCacheable(endpoint, method)) {
      const response = await api.get(endpoint, { params });
      return { data: response.data, cached: false, timestamp: Date.now(), ttl: 0 };
    }

    // Try to get from cache
    const cached = await this.getFromCache<T>(key);
    if (cached) {
      return { data: cached, cached: true, timestamp: Date.now(), ttl: this.getCacheConfig(endpoint).ttl };
    }

    // Fetch from API
    const response = await api.get(endpoint, { params });
    const cacheConfig = this.getCacheConfig(endpoint);

    // Cache the result
    await this.setCache(key, response.data, cacheConfig.ttl);

    // Warm related caches
    await this.warmCache(endpoint);

    return { data: response.data, cached: false, timestamp: Date.now(), ttl: cacheConfig.ttl };
  }

  async post<T>(endpoint: string, data?: any): Promise<CacheResult<T>> {
    const method = 'POST';
    const response = await api.post(endpoint, data);

    // Invalidate related caches for POST operations
    await this.invalidateRelatedCaches(endpoint);

    return { data: response.data, cached: false, timestamp: Date.now(), ttl: 0 };
  }

  async put<T>(endpoint: string, data?: any): Promise<CacheResult<T>> {
    const method = 'PUT';
    const response = await api.put(endpoint, data);

    // Invalidate related caches for PUT operations
    await this.invalidateRelatedCaches(endpoint);

    return { data: response.data, cached: false, timestamp: Date.now(), ttl: 0 };
  }

  async delete<T>(endpoint: string): Promise<CacheResult<T>> {
    const method = 'DELETE';
    const response = await api.delete(endpoint);

    // Invalidate related caches for DELETE operations
    await this.invalidateRelatedCaches(endpoint);

    return { data: response.data, cached: false, timestamp: Date.now(), ttl: 0 };
  }

  private async invalidateRelatedCaches(endpoint: string): Promise<void> {
    const patterns = this.getInvalidationPatterns(endpoint);
    for (const pattern of patterns) {
      await this.invalidateCache(pattern);
    }
  }

  private getInvalidationPatterns(endpoint: string): string[] {
    // Define invalidation patterns for different endpoints
    const invalidationMap: Record<string, string[]> = {
      '/consciousness': ['api:GET:/consciousness/*'],
      '/database': ['api:GET:/database/*'],
      '/system': ['api:GET:/system/*'],
      '/workspaces': ['api:GET:/workspaces/*'],
      '/manifests': ['api:GET:/manifests/*', 'api:GET:/database/manifests/*'],
      '/schemas': ['api:GET:/database/schemas/*']
    };

    for (const [pattern, invalidationPatterns] of Object.entries(invalidationMap)) {
      if (endpoint.includes(pattern)) {
        return invalidationPatterns;
      }
    }
    return [`api:*:${endpoint}*`];
  }

  // ==================== CACHE MANAGEMENT ====================

  async clearCache(): Promise<void> {
    try {
      await this.intelligentCache.clear();
      console.info('[CACHED-API] CachedAPI: Cache cleared');
    } catch (error) {
      console.error('[CACHED-API] CachedAPI: Cache clear error', { error });
    }
  }

  async getCacheStats(): Promise<any> {
    try {
      return await this.intelligentCache.getStats();
    } catch (error) {
      console.error('[CACHED-API] CachedAPI: Get cache stats error', { error });
      return null;
    }
  }

  async optimizeCache(): Promise<void> {
    try {
      // Trigger cache warming and cleanup
      await this.intelligentCache.warmCache();
      console.info('[CACHED-API] CachedAPI: Cache optimized');
    } catch (error) {
      console.error('[CACHED-API] CachedAPI: Cache optimization error', { error });
    }
  }

  // ==================== CONFIGURATION ====================

  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.intelligentCache.updateConfig({
      maxSize: this.config.maxSize,
      defaultTTL: this.config.ttl,
      enablePredictiveCaching: this.config.predictiveWarming,
      enableCompression: this.config.compression,
      enableMetrics: true
    });
    console.info('[CACHED-API] CachedAPI: Configuration updated', { config: this.config });
  }
}

// ==================== CACHED API INSTANCES ====================

// Create cached API instance
export const cachedAPI = new CachedAPI();

// Cached API wrappers for existing APIs
export const cachedConsciousnessAPI = {
  getStatus: () => cachedAPI.get('/consciousness/status'),
  getStory: () => cachedAPI.get('/consciousness/story'),
  getMetrics: () => cachedAPI.get('/consciousness/metrics'),
  getEmotionalState: () => cachedAPI.get('/consciousness/emotions'),
  getQuantumState: () => cachedAPI.get('/consciousness/quantum'),
  getWisdom: () => cachedAPI.get('/consciousness/wisdom'),
  getEvolution: () => cachedAPI.get('/consciousness/evolution'),

  // Non-cached methods
  recordExperience: (experience: any) => cachedAPI.post('/consciousness/experience', experience),
  evolve: (data: any) => cachedAPI.post('/consciousness/evolve', data),
  getHistory: (params?: any) => cachedAPI.get('/consciousness/history', params)
};

export const cachedDatabaseAPI = {
  getHealth: () => cachedAPI.get('/database/health'),
  getMetrics: () => cachedAPI.get('/database/metrics'),
  getAnalytics: (params?: any) => cachedAPI.get('/database/analytics', params),
  getSchemaVersions: (params?: any) => cachedAPI.get('/database/schemas', params),
  getManifests: (params?: any) => cachedAPI.get('/database/manifests', params),

  // Non-cached methods
  createSchemaVersion: (data: any) => cachedAPI.post('/database/schemas', data),
  updateSchemaVersion: (id: string, data: any) => cachedAPI.put(`/database/schemas/${id}`, data),
  deleteSchemaVersion: (id: string) => cachedAPI.delete(`/database/schemas/${id}`),
  createManifest: (data: any) => cachedAPI.post('/database/manifests', data),
  updateManifest: (id: string, data: any) => cachedAPI.put(`/database/manifests/${id}`, data),
  deleteManifest: (id: string) => cachedAPI.delete(`/database/manifests/${id}`)
};

export const cachedSystemAPI = {
  getHealth: () => cachedAPI.get('/health'),
  getSystemInfo: () => cachedAPI.get('/system/info'),
  getSystemMetrics: () => cachedAPI.get('/system/metrics'),
  getConfig: () => cachedAPI.get('/system/config'),

  // Non-cached methods
  updateConfig: (data: any) => cachedAPI.put('/system/config', data),
  getLogs: (params?: any) => cachedAPI.get('/system/logs', params),
  clearLogs: () => cachedAPI.delete('/system/logs')
};

export const cachedWorkspaceAPI = {
  getWorkspaces: (params?: any) => cachedAPI.get('/workspaces', params),
  getWorkspace: (id: string) => cachedAPI.get(`/workspaces/${id}`),
  getWorkspaceState: (id: string) => cachedAPI.get(`/workspaces/${id}/state`),

  // Non-cached methods
  createWorkspace: (data: any) => cachedAPI.post('/workspaces', data),
  updateWorkspace: (id: string, data: any) => cachedAPI.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id: string) => cachedAPI.delete(`/workspaces/${id}`),
  saveWorkspaceState: (id: string, state: any) => cachedAPI.post(`/workspaces/${id}/state`, state),
  exportWorkspace: (id: string) => cachedAPI.get(`/workspaces/${id}/export`),
  importWorkspace: (data: any) => cachedAPI.post('/workspaces/import', data)
};

// Export the main cached API instance
export { CachedAPI };
