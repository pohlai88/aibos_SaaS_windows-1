/**
 * 🧠 AI-BOS Manifestor Loader
 * Automatic manifest loading and registration system
 */

import { ManifestorEngine, Manifest } from './index';

// ==================== MANIFEST LOADER ====================

export class ManifestLoader {
  private static instance: ManifestLoader;
  private manifestor: ManifestorEngine;
  private loadedManifests: Set<string> = new Set();
  private loadErrors: Array<{ manifest: string; error: string }> = [];

  private constructor() {
    this.manifestor = ManifestorEngine.getInstance();
  }

  static getInstance(): ManifestLoader {
    if (!ManifestLoader.instance) {
      ManifestLoader.instance = new ManifestLoader();
    }
    return ManifestLoader.instance;
  }

  /**
   * Load all manifests from the manifests directory
   */
  async loadAllManifests(): Promise<void> {
    try {
      console.log('🧠 Loading AI-BOS manifests...');

      // Load core manifests first
      await this.loadCoreManifests();

      // Load module manifests
      await this.loadModuleManifests();

      // Load integration manifests
      await this.loadIntegrationManifests();

      // Validate dependencies
      await this.validateDependencies();

      console.log(`✅ Loaded ${this.loadedManifests.size} manifests successfully`);

      if (this.loadErrors.length > 0) {
        console.warn(`⚠️ ${this.loadErrors.length} manifest load errors:`, this.loadErrors);
      }
    } catch (error) {
      console.error('❌ Failed to load manifests:', error);
      throw error;
    }
  }

  /**
   * Load core manifests
   */
  private async loadCoreManifests(): Promise<void> {
    const coreManifests = [
      'app.manifest.json',
      'auth.manifest.json'
    ];

    for (const manifestFile of coreManifests) {
      await this.loadManifest('core', manifestFile);
    }
  }

  /**
   * Load module manifests
   */
  private async loadModuleManifests(): Promise<void> {
    const moduleManifests = [
      'ai-engine.manifest.json',
      'consciousness.manifest.json',
      'security.manifest.json',
      'security-advanced.manifest.json',
      'performance.manifest.json',
      'analytics.manifest.json',
      'collaboration.manifest.json',
      'collaboration-advanced.manifest.json',
      'realtime.manifest.json',
      'websocket.manifest.json',
      'billing.manifest.json',
      'user-management.manifest.json',
      'team-management.manifest.json',
      'workflow-automation.manifest.json',
      'monitoring.manifest.json'
    ];

    for (const manifestFile of moduleManifests) {
      await this.loadManifest('modules', manifestFile);
    }
  }

  /**
   * Load integration manifests
   */
  private async loadIntegrationManifests(): Promise<void> {
    const integrationManifests = [
      'supabase.manifest.json',
      'vercel.manifest.json',
      'railway.manifest.json',
      'ollama.manifest.json',
      'tensorflow.manifest.json'
    ];

    for (const manifestFile of integrationManifests) {
      await this.loadManifest('integrations', manifestFile);
    }
  }

  /**
   * Load a single manifest file
   */
  private async loadManifest(category: string, filename: string): Promise<void> {
    try {
      const manifestPath = `/src/manifests/${category}/${filename}`;

      // Dynamic import of manifest file
      const manifestModule = await import(`../../manifests/${category}/${filename}`);
      const manifest: Manifest = manifestModule.default || manifestModule;

      if (!manifest || !manifest.id) {
        throw new Error(`Invalid manifest structure in ${filename}`);
      }

      // Register manifest with Manifestor Engine
      this.manifestor.register(manifest);
      this.loadedManifests.add(manifest.id);

      console.log(`✅ Loaded manifest: ${manifest.id} (${manifest.version})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.loadErrors.push({ manifest: filename, error: errorMessage });
      console.warn(`⚠️ Failed to load manifest ${filename}:`, errorMessage);
    }
  }

  /**
   * Validate manifest dependencies
   */
  private async validateDependencies(): Promise<void> {
    const enabledModules = this.manifestor.getEnabledModules();
    const dependencyErrors: string[] = [];

    for (const moduleId of enabledModules) {
      const manifest = this.manifestor.getConfig(moduleId);
      const dependencies = manifest.dependencies || [];

      for (const dependency of dependencies) {
        if (!this.loadedManifests.has(dependency)) {
          dependencyErrors.push(`Module ${moduleId} depends on ${dependency} which is not loaded`);
        }
      }
    }

    if (dependencyErrors.length > 0) {
      console.warn('⚠️ Dependency validation errors:', dependencyErrors);
    }
  }

  /**
   * Get loaded manifests
   */
  getLoadedManifests(): string[] {
    return Array.from(this.loadedManifests);
  }

  /**
   * Get load errors
   */
  getLoadErrors(): Array<{ manifest: string; error: string }> {
    return [...this.loadErrors];
  }

  /**
   * Reload all manifests
   */
  async reloadManifests(): Promise<void> {
    this.loadedManifests.clear();
    this.loadErrors = [];
    this.manifestor.reset();
    await this.loadAllManifests();
  }

  /**
   * Load specific manifest by ID
   */
  async loadManifestById(manifestId: string): Promise<Manifest | null> {
    try {
      // Try to find manifest in different categories
      const categories = ['core', 'modules', 'integrations'];

      for (const category of categories) {
        try {
          const manifestModule = await import(`../../manifests/${category}/${manifestId}.manifest.json`);
          const manifest: Manifest = manifestModule.default || manifestModule;

          if (manifest && manifest.id === manifestId) {
            this.manifestor.register(manifest);
            this.loadedManifests.add(manifest.id);
            return manifest;
          }
        } catch (error) {
          // Continue to next category
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to load manifest ${manifestId}:`, error);
      return null;
    }
  }
}

// ==================== MANIFEST VALIDATOR ====================

export class ManifestValidator {
  /**
   * Validate manifest structure
   */
  static validateManifest(manifest: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!manifest.id) errors.push('Missing required field: id');
    if (!manifest.version) errors.push('Missing required field: version');
    if (!manifest.type) errors.push('Missing required field: type');
    if (typeof manifest.enabled !== 'boolean') errors.push('Missing required field: enabled');

    // Type validation
    if (!['core', 'module', 'integration'].includes(manifest.type)) {
      errors.push('Invalid type: must be core, module, or integration');
    }

    // Version format validation
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      errors.push('Invalid version format: must be semantic version (x.y.z)');
    }

    // Dependencies validation
    if (manifest.dependencies && !Array.isArray(manifest.dependencies)) {
      errors.push('Dependencies must be an array');
    }

    // Permissions validation
    if (manifest.permissions && typeof manifest.permissions !== 'object') {
      errors.push('Permissions must be an object');
    }

    // Config validation
    if (manifest.config && typeof manifest.config !== 'object') {
      errors.push('Config must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate manifest dependencies
   */
  static validateDependencies(manifest: Manifest, loadedManifests: Set<string>): string[] {
    const errors: string[] = [];
    const dependencies = manifest.dependencies || [];

    for (const dependency of dependencies) {
      if (!loadedManifests.has(dependency)) {
        errors.push(`Dependency ${dependency} is not loaded`);
      }
    }

    return errors;
  }

  /**
   * Validate manifest permissions
   */
  static validatePermissions(manifest: Manifest): string[] {
    const errors: string[] = [];
    const permissions = manifest.permissions || {};

    for (const [action, roles] of Object.entries(permissions)) {
      if (!Array.isArray(roles)) {
        errors.push(`Permissions for action ${action} must be an array`);
        continue;
      }

      for (const role of roles) {
        if (typeof role !== 'string') {
          errors.push(`Role in action ${action} must be a string`);
        }
      }
    }

    return errors;
  }
}

// ==================== MANIFEST UTILITIES ====================

export class ManifestUtils {
  /**
   * Get manifest by ID
   */
  static getManifestById(manifestId: string): Manifest | null {
    const manifestor = ManifestorEngine.getInstance();
    const config = manifestor.getConfig(manifestId);
    return config ? { id: manifestId, ...config } : null;
  }

  /**
   * Get all enabled manifests
   */
  static getEnabledManifests(): Manifest[] {
    const manifestor = ManifestorEngine.getInstance();
    const enabledModules = manifestor.getEnabledModules();

    return enabledModules.map(moduleId => {
      const config = manifestor.getConfig(moduleId);
      return { id: moduleId, ...config };
    });
  }

  /**
   * Get manifests by type
   */
  static getManifestsByType(type: 'core' | 'module' | 'integration'): Manifest[] {
    const allManifests = this.getEnabledManifests();
    return allManifests.filter(manifest => manifest.type === type);
  }

  /**
   * Get manifests by category
   */
  static getManifestsByCategory(category: string): Manifest[] {
    const allManifests = this.getEnabledManifests();
    return allManifests.filter(manifest =>
      manifest.metadata?.category === category
    );
  }

  /**
   * Check if manifest has feature
   */
  static hasFeature(manifestId: string, feature: string): boolean {
    const manifest = this.getManifestById(manifestId);
    return manifest?.config?.defaults?.features?.[feature] || false;
  }

  /**
   * Get manifest configuration value
   */
  static getConfigValue(manifestId: string, path: string): any {
    const manifest = this.getManifestById(manifestId);
    if (!manifest) return null;

    const keys = path.split('.');
    let value = manifest.config?.defaults;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return value;
  }
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Load all manifests
 */
export async function loadManifests(): Promise<void> {
  const loader = ManifestLoader.getInstance();
  await loader.loadAllManifests();
}

/**
 * Get manifest loader instance
 */
export function getManifestLoader(): ManifestLoader {
  return ManifestLoader.getInstance();
}

/**
 * Validate manifest
 */
export function validateManifest(manifest: any): { isValid: boolean; errors: string[] } {
  return ManifestValidator.validateManifest(manifest);
}

/**
 * Get manifest utilities
 */
export function getManifestUtils(): typeof ManifestUtils {
  return ManifestUtils;
}
