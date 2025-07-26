/**
 * AI-BOS Shared Package Manifestor Engine
 *
 * Provides manifest-driven functionality for the shared NPM package.
 * This engine allows components and utilities to be configured and
 * controlled through manifests, enabling dynamic behavior and
 * feature toggling across the entire AI-BOS ecosystem.
 */

// ==================== MANIFESTOR TYPES ====================

export interface SharedManifest {
  id: string;
  version: string;
  type: 'component' | 'utility' | 'system' | 'integration';
  enabled: boolean;
  dependencies: string[];
  permissions?: Record<string, string[]>;
  config?: {
    defaults: Record<string, any>;
    overrides?: Record<string, any>;
  };
  features?: {
    [key: string]: boolean;
  };
  design?: {
    theme?: 'light' | 'dark' | 'auto';
    variant?: 'default' | 'compact' | 'spacious';
    animations?: boolean;
    accessibility?: boolean;
  };
  performance?: {
    lazy?: boolean;
    cache?: boolean;
    optimize?: boolean;
    bundle?: boolean;
  };
  security?: {
    validate?: boolean;
    sanitize?: boolean;
    encrypt?: boolean;
    audit?: boolean;
  };
}

export interface SharedUser {
  id: string;
  role: string;
  permissions: string[];
  preferences?: Record<string, any>;
}

export interface SharedManifestorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  manifests: {
    total: number;
    enabled: number;
    disabled: number;
  };
  components: {
    total: number;
    loaded: number;
    cached: number;
  };
  performance: {
    loadTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  errors: string[];
  lastCheck: Date;
}

export interface SharedManifestorTelemetry {
  requests: number;
  components: {
    rendered: number;
    cached: number;
    errors: number;
  };
  performance: {
    avgLoadTime: number;
    maxLoadTime: number;
    minLoadTime: number;
  };
  features: {
    enabled: number;
    disabled: number;
    toggled: number;
  };
}

// ==================== SHARED MANIFESTOR ENGINE ====================

class SharedManifestorEngine {
  private manifests: Map<string, SharedManifest> = new Map();
  private cache: Map<string, any> = new Map();
  private health: SharedManifestorHealth;
  private telemetry: SharedManifestorTelemetry;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.health = {
      status: 'healthy',
      manifests: { total: 0, enabled: 0, disabled: 0 },
      components: { total: 0, loaded: 0, cached: 0 },
      performance: { loadTime: 0, memoryUsage: 0, cacheHitRate: 0 },
      errors: [],
      lastCheck: new Date()
    };
    this.telemetry = {
      requests: 0,
      components: { rendered: 0, cached: 0, errors: 0 },
      performance: { avgLoadTime: 0, maxLoadTime: 0, minLoadTime: 0 },
      features: { enabled: 0, disabled: 0, toggled: 0 }
    };
  }

  // ==================== CORE METHODS ====================

  register(manifest: SharedManifest): void {
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

      console.log(`✅ Registered shared manifest: ${manifest.id} v${manifest.version}`);
    } catch (error) {
      console.error(`❌ Failed to register shared manifest ${manifest.id}:`, error);
      throw error;
    }
  }

  can(user: SharedUser, action: string, resource: string): boolean {
    try {
      this.telemetry.requests++;

      // Check if user has explicit permission
      if (user.permissions.includes(`${resource}:${action}`)) {
        return true;
      }

      // Check manifest-based permissions
      const manifest = this.manifests.get(resource);
      if (!manifest || !manifest.enabled) {
        return false;
      }

      const allowedRoles = manifest.permissions?.[action] || [];
      if (allowedRoles.includes(user.role) || allowedRoles.includes('*')) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Shared permission check failed:', error);
      return false;
    }
  }

  getConfig(manifestId: string, key?: string): any {
    const cacheKey = `config:${manifestId}:${key || 'all'}`;

    if (this.cache.has(cacheKey)) {
      this.health.performance.cacheHitRate =
        (this.health.performance.cacheHitRate + 1) / 2;
      return this.cache.get(cacheKey);
    }

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

  isFeatureEnabled(manifestId: string, feature: string): boolean {
    const manifest = this.manifests.get(manifestId);
    return manifest?.features?.[feature] || false;
  }

  getDesignConfig(manifestId: string): any {
    const manifest = this.manifests.get(manifestId);
    return manifest?.design || {};
  }

  getPerformanceConfig(manifestId: string): any {
    const manifest = this.manifests.get(manifestId);
    return manifest?.performance || {};
  }

  getSecurityConfig(manifestId: string): any {
    const manifest = this.manifests.get(manifestId);
    return manifest?.security || {};
  }

  // ==================== VALIDATION ====================

  validate(manifest: SharedManifest): void {
    if (!manifest.id || !manifest.version || !manifest.type) {
      throw new Error('Shared manifest must have id, version, and type');
    }

    if (!['component', 'utility', 'system', 'integration'].includes(manifest.type)) {
      throw new Error('Shared manifest type must be component, utility, system, or integration');
    }

    if (!Array.isArray(manifest.dependencies)) {
      throw new Error('Shared manifest dependencies must be an array');
    }
  }

  // ==================== HEALTH & MONITORING ====================

  healthCheck(): SharedManifestorHealth {
    const now = new Date();
    this.health.lastCheck = now;

    // Update manifest stats
    const manifests = Array.from(this.manifests.values());
    this.health.manifests.total = manifests.length;
    this.health.manifests.enabled = manifests.filter(m => m.enabled).length;
    this.health.manifests.disabled = manifests.filter(m => !m.enabled).length;

    // Update component stats
    const components = manifests.filter(m => m.type === 'component');
    this.health.components.total = components.length;
    this.health.components.loaded = components.filter(m => m.enabled).length;
    this.health.components.cached = this.cache.size;

    // Update performance stats
    const totalRequests = this.telemetry.requests;
    this.health.performance.loadTime = totalRequests > 0 ?
      this.telemetry.performance.avgLoadTime : 0;

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

  getTelemetry(): SharedManifestorTelemetry {
    return { ...this.telemetry };
  }

  // ==================== UTILITY METHODS ====================

  clearCache(): void {
    this.cache.clear();
    this.health.components.cached = 0;
  }

  reset(): void {
    this.manifests.clear();
    this.cache.clear();
    this.telemetry = {
      requests: 0,
      components: { rendered: 0, cached: 0, errors: 0 },
      performance: { avgLoadTime: 0, maxLoadTime: 0, minLoadTime: 0 },
      features: { enabled: 0, disabled: 0, toggled: 0 }
    };
    this.updateHealth();
  }

  private updateHealth(): void {
    const manifests = Array.from(this.manifests.values());
    this.health.manifests.total = manifests.length;
    this.health.manifests.enabled = manifests.filter(m => m.enabled).length;
    this.health.manifests.disabled = manifests.filter(m => !m.enabled).length;
  }

  // ==================== CONVENIENCE METHODS ====================

  trackComponentRender(componentId: string): void {
    this.telemetry.components.rendered++;
  }

  trackComponentCache(componentId: string): void {
    this.telemetry.components.cached++;
  }

  trackComponentError(componentId: string): void {
    this.telemetry.components.errors++;
  }

  trackFeatureToggle(manifestId: string, feature: string, enabled: boolean): void {
    this.telemetry.features.toggled++;
    if (enabled) {
      this.telemetry.features.enabled++;
    } else {
      this.telemetry.features.disabled++;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

export const SharedManifestor = new SharedManifestorEngine();

// ==================== CONVENIENCE FUNCTIONS ====================

export const can = (user: SharedUser, action: string, resource: string): boolean => {
  return SharedManifestor.can(user, action, resource);
};

export const getConfig = (manifestId: string, key?: string): any => {
  return SharedManifestor.getConfig(manifestId, key);
};

export const isEnabled = (manifestId: string): boolean => {
  return SharedManifestor.isEnabled(manifestId);
};

export const isFeatureEnabled = (manifestId: string, feature: string): boolean => {
  return SharedManifestor.isFeatureEnabled(manifestId, feature);
};

export const register = (manifest: SharedManifest): void => {
  SharedManifestor.register(manifest);
};

export const trackComponentRender = (componentId: string): void => {
  SharedManifestor.trackComponentRender(componentId);
};

export const trackComponentCache = (componentId: string): void => {
  SharedManifestor.trackComponentCache(componentId);
};

export const trackComponentError = (componentId: string): void => {
  SharedManifestor.trackComponentError(componentId);
};

export const trackFeatureToggle = (manifestId: string, feature: string, enabled: boolean): void => {
  SharedManifestor.trackFeatureToggle(manifestId, feature, enabled);
};
