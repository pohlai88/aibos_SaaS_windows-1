/**
 * 🧠 AI-BOS Manifestor
 * Core governance engine for declarative system configuration
 */

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
}

export interface User {
  id: string;
  role: string;
  permissions?: string[];
}

export interface ManifestorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  modules: string[];
  issues: string[];
  timestamp: number;
}

class ManifestorEngine {
  private manifests: Map<string, Manifest> = new Map();
  private cache: Map<string, any> = new Map();
  private telemetry: Array<{ action: string; module: string; timestamp: number }> = [];

  /**
   * Register a module manifest
   */
  register(manifest: Manifest): void {
    if (!this.validate(manifest)) {
      throw new Error(`Invalid manifest for module: ${manifest.id}`);
    }

    this.manifests.set(manifest.id, manifest);
    this.telemetry.push({
      action: 'register',
      module: manifest.id,
      timestamp: Date.now()
    });

    // Using structured logger instead of console.log
    // logger.manifestor('Registered', manifest.id, { version: manifest.version });
  }

  /**
   * Check if user can perform action on resource
   */
  can(resource: string, action: string, user: User): boolean {
    const manifest = this.manifests.get(resource);
    if (!manifest || !manifest.enabled) {
      return false;
    }

    const permissions = manifest.permissions?.[action] || [];
    const hasPermission = permissions.includes(user.role) ||
                         user.permissions?.includes(action) ||
                         user.role === 'admin';

    this.telemetry.push({
      action: 'permission_check',
      module: resource,
      timestamp: Date.now()
    });

    return hasPermission;
  }

  /**
   * Get configuration for a module
   */
  getConfig(moduleId: string): Record<string, any> {
    const manifest = this.manifests.get(moduleId);
    if (!manifest) {
      return {};
    }

    const cacheKey = `config:${moduleId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const config = {
      ...manifest.config?.defaults,
      ...manifest.config?.overrides
    };

    this.cache.set(cacheKey, config);
    return config;
  }

  /**
   * Check if module is enabled
   */
  isEnabled(moduleId: string): boolean {
    const manifest = this.manifests.get(moduleId);
    return manifest?.enabled || false;
  }

  /**
   * Get all enabled modules
   */
  getEnabledModules(): string[] {
    return Array.from(this.manifests.values())
      .filter(m => m.enabled)
      .map(m => m.id);
  }

  /**
   * Validate manifest schema
   */
  validate(manifest: Manifest): boolean {
    const required = ['id', 'version', 'type', 'enabled'];
    return required.every(field => manifest.hasOwnProperty(field));
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ManifestorHealth> {
    const modules = this.getEnabledModules();
    const issues: string[] = [];

    // Check for circular dependencies
    for (const moduleId of modules) {
      const manifest = this.manifests.get(moduleId);
      if (manifest?.dependencies) {
        for (const dep of manifest.dependencies) {
          if (!this.manifests.has(dep)) {
            issues.push(`Module ${moduleId} depends on missing module: ${dep}`);
          }
        }
      }
    }

    const status = issues.length === 0 ? 'healthy' :
                   issues.length < 3 ? 'degraded' : 'unhealthy';

    return {
      status,
      modules,
      issues,
      timestamp: Date.now()
    };
  }

  /**
   * Get telemetry data
   */
  getTelemetry() {
    return this.telemetry;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset all manifests
   */
  reset(): void {
    this.manifests.clear();
    this.cache.clear();
    this.telemetry = [];
  }
}

// Singleton instance
export const Manifestor = new ManifestorEngine();

// Convenience functions
export const can = (resource: string, action: string, user: User) =>
  Manifestor.can(resource, action, user);

export const getConfig = (moduleId: string) =>
  Manifestor.getConfig(moduleId);

export const isEnabled = (moduleId: string) =>
  Manifestor.isEnabled(moduleId);
