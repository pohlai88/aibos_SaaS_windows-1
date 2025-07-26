import { Request, Response, NextFunction } from 'express';

// ==================== MANIFESTOR TYPES ====================

export interface Manifest {
  id: string;
  version: string;
  type: 'core' | 'module' | 'integration';
  enabled: boolean;
  dependencies: string[];
  permissions?: Record<string, string[]>;
  config?: {
    defaults: Record<string, any>;
    overrides?: Record<string, any>;
  };
  lifecycle?: {
    init?: string;
    destroy?: string;
  };
  api?: {
    routes?: string[];
    middleware?: string[];
    validators?: Record<string, any>;
  };
  security?: {
    rateLimit?: number;
    authRequired?: boolean;
    roles?: string[];
    scopes?: string[];
  };
}

export interface User {
  id: string;
  role: string;
  permissions: string[];
  scopes?: string[];
}

export interface ManifestorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  manifests: {
    total: number;
    enabled: number;
    disabled: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errors: string[];
  lastCheck: Date;
}

export interface ManifestorTelemetry {
  requests: number;
  permissions: {
    granted: number;
    denied: number;
    rate: number;
  };
  performance: {
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
  };
  security: {
    authFailures: number;
    rateLimitHits: number;
    suspiciousActivity: number;
  };
}

// ==================== MANIFESTOR ENGINE ====================

class ManifestorEngine {
  private manifests: Map<string, Manifest> = new Map();
  private cache: Map<string, any> = new Map();
  private health: ManifestorHealth;
  private telemetry: ManifestorTelemetry;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.health = {
      status: 'healthy',
      uptime: 0,
      memory: { used: 0, total: 0, percentage: 0 },
      manifests: { total: 0, enabled: 0, disabled: 0 },
      cache: { hits: 0, misses: 0, hitRate: 0 },
      errors: [],
      lastCheck: new Date()
    };
    this.telemetry = {
      requests: 0,
      permissions: { granted: 0, denied: 0, rate: 0 },
      performance: { avgResponseTime: 0, maxResponseTime: 0, minResponseTime: 0 },
      security: { authFailures: 0, rateLimitHits: 0, suspiciousActivity: 0 }
    };
  }

  // ==================== CORE METHODS ====================

  register(manifest: Manifest): void {
    try {
      // Validate manifest
      this.validate(manifest);

      // Check dependencies
      for (const dep of manifest.dependencies) {
        if (!this.manifests.has(dep)) {
          throw new Error(`Dependency ${dep} not found for manifest ${manifest.id}`);
        }
      }

      this.manifests.set(manifest.id, manifest);
      this.updateHealth();

      console.log(`✅ Registered manifest: ${manifest.id} v${manifest.version}`);
    } catch (error) {
      console.error(`❌ Failed to register manifest ${manifest.id}:`, error);
      throw error;
    }
  }

  can(user: User, action: string, resource: string): boolean {
    try {
      this.telemetry.requests++;

      // Check if user has explicit permission
      if (user.permissions.includes(`${resource}:${action}`)) {
        this.telemetry.permissions.granted++;
        return true;
      }

      // Check manifest-based permissions
      const manifest = this.manifests.get(resource);
      if (!manifest || !manifest.enabled) {
        this.telemetry.permissions.denied++;
        return false;
      }

      const allowedRoles = manifest.permissions?.[action] || [];
      if (allowedRoles.includes(user.role) || allowedRoles.includes('*')) {
        this.telemetry.permissions.granted++;
        return true;
      }

      this.telemetry.permissions.denied++;
      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      this.telemetry.permissions.denied++;
      return false;
    }
  }

  getConfig(manifestId: string, key?: string): any {
    const cacheKey = `config:${manifestId}:${key || 'all'}`;

    if (this.cache.has(cacheKey)) {
      this.health.cache.hits++;
      return this.cache.get(cacheKey);
    }

    this.health.cache.misses++;
    const manifest = this.manifests.get(manifestId);

    if (!manifest) {
      return null;
    }

    const config = manifest.config?.defaults || {};
    const result = key ? config[key] : config;

    this.cache.set(cacheKey, result);
    return result;
  }

  isEnabled(manifestId: string): boolean {
    const manifest = this.manifests.get(manifestId);
    return manifest?.enabled || false;
  }

  getEnabledModules(): string[] {
    return Array.from(this.manifests.values())
      .filter(m => m.enabled && m.type === 'module')
      .map(m => m.id);
  }

  // ==================== VALIDATION ====================

  validate(manifest: Manifest): void {
    if (!manifest.id || !manifest.version || !manifest.type) {
      throw new Error('Manifest must have id, version, and type');
    }

    if (!['core', 'module', 'integration'].includes(manifest.type)) {
      throw new Error('Manifest type must be core, module, or integration');
    }

    if (!Array.isArray(manifest.dependencies)) {
      throw new Error('Manifest dependencies must be an array');
    }
  }

  // ==================== HEALTH & MONITORING ====================

  healthCheck(): ManifestorHealth {
    const now = new Date();
    this.health.uptime = now.getTime() - this.startTime.getTime();
    this.health.lastCheck = now;

    // Update memory usage
    const memUsage = process.memoryUsage();
    this.health.memory.used = memUsage.heapUsed;
    this.health.memory.total = memUsage.heapTotal;
    this.health.memory.percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // Update manifest stats
    const manifests = Array.from(this.manifests.values());
    this.health.manifests.total = manifests.length;
    this.health.manifests.enabled = manifests.filter(m => m.enabled).length;
    this.health.manifests.disabled = manifests.filter(m => !m.enabled).length;

    // Update cache stats
    const totalRequests = this.health.cache.hits + this.health.cache.misses;
    this.health.cache.hitRate = totalRequests > 0 ? this.health.cache.hits / totalRequests : 0;

    // Update permission rate
    const totalPermissions = this.telemetry.permissions.granted + this.telemetry.permissions.denied;
    this.telemetry.permissions.rate = totalPermissions > 0 ? this.telemetry.permissions.granted / totalPermissions : 0;

    // Determine status
    if (this.health.errors.length > 10) {
      this.health.status = 'unhealthy';
    } else if (this.health.errors.length > 5) {
      this.health.status = 'degraded';
    } else {
      this.health.status = 'healthy';
    }

    return this.health;
  }

  getTelemetry(): ManifestorTelemetry {
    return { ...this.telemetry };
  }

  // ==================== UTILITY METHODS ====================

  clearCache(): void {
    this.cache.clear();
    this.health.cache.hits = 0;
    this.health.cache.misses = 0;
    this.health.cache.hitRate = 0;
  }

  reset(): void {
    this.manifests.clear();
    this.cache.clear();
    this.telemetry = {
      requests: 0,
      permissions: { granted: 0, denied: 0, rate: 0 },
      performance: { avgResponseTime: 0, maxResponseTime: 0, minResponseTime: 0 },
      security: { authFailures: 0, rateLimitHits: 0, suspiciousActivity: 0 }
    };
    this.updateHealth();
  }

  private updateHealth(): void {
    const manifests = Array.from(this.manifests.values());
    this.health.manifests.total = manifests.length;
    this.health.manifests.enabled = manifests.filter(m => m.enabled).length;
    this.health.manifests.disabled = manifests.filter(m => !m.enabled).length;
  }

  // ==================== EXPRESS MIDDLEWARE ====================

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      // Add manifestor to request
      (req as any).manifestor = this;

      // Track performance
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.telemetry.performance.avgResponseTime =
          (this.telemetry.performance.avgResponseTime + responseTime) / 2;
        this.telemetry.performance.maxResponseTime =
          Math.max(this.telemetry.performance.maxResponseTime, responseTime);
        this.telemetry.performance.minResponseTime =
          Math.min(this.telemetry.performance.minResponseTime || responseTime, responseTime);
      });

      next();
    };
  }

  // ==================== API ROUTES ====================

  getRoutes() {
    const express = require('express');
    const router = express.Router();

    // GET /api/manifestor/health
    router.get('/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: this.healthCheck()
      });
    });

    // GET /api/manifestor/telemetry
    router.get('/telemetry', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: this.getTelemetry()
      });
    });

    // GET /api/manifestor/manifests
    router.get('/manifests', (req: Request, res: Response) => {
      const manifests = Array.from(this.manifests.values());
      res.json({
        success: true,
        data: manifests,
        count: manifests.length
      });
    });

    // GET /api/manifestor/manifests/:id
    router.get('/manifests/:id', (req: Request, res: Response) => {
      const manifest = this.manifests.get(req.params.id);
      if (!manifest) {
        res.status(404).json({ success: false, error: 'Manifest not found' });
        return;
      }
      res.json({ success: true, data: manifest });
    });

    // POST /api/manifestor/manifests
    router.post('/manifests', (req: Request, res: Response) => {
      try {
        const manifest = req.body as Manifest;
        this.register(manifest);
        res.status(201).json({
          success: true,
          data: manifest,
          message: 'Manifest registered successfully'
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid manifest'
        });
      }
    });

    // POST /api/manifestor/permissions/check
    router.post('/permissions/check', (req: Request, res: Response) => {
      const { user, action, resource } = req.body;
      const hasPermission = this.can(user, action, resource);
      res.json({
        success: true,
        data: { hasPermission, user, action, resource }
      });
    });

    // POST /api/manifestor/cache/clear
    router.post('/cache/clear', (req: Request, res: Response) => {
      this.clearCache();
      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    });

    return router;
  }
}

// ==================== SINGLETON INSTANCE ====================

export const Manifestor = new ManifestorEngine();

// ==================== CONVENIENCE FUNCTIONS ====================

export const can = (user: User, action: string, resource: string): boolean => {
  return Manifestor.can(user, action, resource);
};

export const getConfig = (manifestId: string, key?: string): any => {
  return Manifestor.getConfig(manifestId, key);
};

export const isEnabled = (manifestId: string): boolean => {
  return Manifestor.isEnabled(manifestId);
};

export const register = (manifest: Manifest): void => {
  Manifestor.register(manifest);
};
