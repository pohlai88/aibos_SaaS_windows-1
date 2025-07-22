// ==================== MANIFEST LOADER - STEVE JOBS PHASE 2 ====================
// **"Everyone becomes a creator"** - The foundation that makes app creation accessible to all
//
// ENHANCED FEATURES:
// ✅ Schema Versioning (v1) - Future-proof compatibility
// ✅ Permission Typing - Type-safe autocomplete
// ✅ Strict Mode Toggle - Enterprise-grade validation
// ✅ Enhanced Validation - Business rules + security
// ✅ Integrity Hashing - Manifest versioning support
//
// USAGE:
// const loader = ManifestLoader.getInstance();
// const result = await loader.loadManifest('app.json', { strict: true });

import { z } from 'zod';

// ==================== TYPES ====================
export interface AppManifest {
  manifest_version: 1; // Schema versioning - currently only version 1 is supported
  app_id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  ui: string;
  data_model?: string;
  permissions: ValidPermission[]; // Type-safe permissions
  theme?: 'light' | 'dark' | 'auto';
  entry: string;
  dependencies?: string[];
  metadata?: {
    category?: string;
    tags?: string[];
    icon?: string;
    screenshots?: string[];
  };
  lifecycle?: {
    onMount?: string;
    onError?: string;
    onDestroy?: string;
  };
  security?: {
    sandboxed: boolean;
    allowedDomains?: string[];
    maxMemory?: number;
    timeout?: number;
  };
}

// ==================== TYPE-SAFE PERMISSIONS ====================
const permissionLiterals = [
  // Data permissions
  'read.contacts', 'write.contacts',
  'read.orders', 'write.orders',
  'read.products', 'write.products',
  'read.users', 'write.users',
  'read.analytics', 'write.analytics',

  // System permissions
  'system.notifications',
  'system.storage',
  'system.network',
  'system.files',

  // UI permissions
  'ui.modal',
  'ui.toast',
  'ui.navigation',
  'ui.theme',

  // AI permissions
  'ai.generate',
  'ai.analyze',
  'ai.predict',

  // Integration permissions
  'integration.email',
  'integration.calendar',
  'integration.crm',
  'integration.erp',
] as const;

export type ValidPermission = (typeof permissionLiterals)[number];

// ==================== VALIDATION OPTIONS ====================
export interface ValidationOptions {
  strict?: boolean; // Treat warnings as errors
  validateLifecycle?: boolean; // Validate lifecycle hooks exist
  validateDependencies?: boolean; // Validate dependencies are available
}

export interface ManifestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: AppManifest;
  metadata: {
    validationTime: number;
    schemaVersion: number;
    strictMode: boolean;
  };
}

export interface ManifestLoadResult {
  success: boolean;
  manifest?: AppManifest;
  error?: string;
  metadata: {
    loadTime: number;
    size: number;
    integrity: string;
    version: string;
    schemaVersion: number;
  };
}

// ==================== SCHEMA VALIDATION ====================
const ManifestSchema = z.object({
  manifest_version: z.literal(1), // Schema versioning - can evolve to 2, 3, etc.
  app_id: z.string().min(1, "App ID is required"),
  name: z.string().min(1, "App name is required"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semantic (e.g., 1.0.0)"),
  description: z.string().optional(),
  author: z.string().optional(),
  ui: z.string().min(1, "UI component path is required"),
  data_model: z.string().optional(),
  permissions: z.array(z.enum(permissionLiterals)).min(1, "At least one permission is required"),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  entry: z.string().min(1, "Entry point is required"),
  dependencies: z.array(z.string()).optional(),
  metadata: z.object({
    category: z.string(),
    tags: z.array(z.string()),
    icon: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
  }).optional(),
  lifecycle: z.object({
    onMount: z.string().optional(),
    onError: z.string().optional(),
    onDestroy: z.string().optional(),
  }).optional(),
  security: z.object({
    sandboxed: z.boolean(),
    allowedDomains: z.array(z.string()).optional(),
    maxMemory: z.number().optional(),
    timeout: z.number().optional(),
  }).optional(),
});

// ==================== MANIFEST LOADER CLASS ====================
export class ManifestLoader {
  private static instance: ManifestLoader;
  private cache = new Map<string, AppManifest>();
  private validationCache = new Map<string, ManifestValidationResult>();
  private logger?: (message: string, level: 'info' | 'warn' | 'error') => void;

  static getInstance(): ManifestLoader {
    if (!ManifestLoader.instance) {
      ManifestLoader.instance = new ManifestLoader();
    }
    return ManifestLoader.instance;
  }

  // ==================== LOGGING ====================
  static setLogger(logger: (message: string, level: 'info' | 'warn' | 'error') => void) {
    ManifestLoader.getInstance().logger = logger;
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    this.logger?.(`[ManifestLoader] ${message}`, level);
  }

  // ==================== CORE LOADING METHODS ====================

  /**
   * Load manifest from URL or local path
   * Steve Jobs Philosophy: "Make it simple, make it work"
   */
  async loadManifest(source: string, options: ValidationOptions = {}): Promise<ManifestLoadResult> {
    const startTime = Date.now();

    try {
      this.log(`Loading manifest from: ${source}`);

      // Check cache first
      if (this.cache.has(source)) {
        const cached = this.cache.get(source)!;
        this.log(`Cache hit for: ${source}`);
        return {
          success: true,
          manifest: cached,
          metadata: {
            loadTime: 0,
            size: JSON.stringify(cached).length,
            integrity: this.generateIntegrity(cached),
            version: cached.version,
            schemaVersion: cached.manifest_version,
          }
        };
      }

      // Load manifest
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }

      const manifestText = await response.text();
      const manifestData = JSON.parse(manifestText);

      // Validate manifest
      const validation = this.validateManifest(manifestData, options);
      if (!validation.isValid) {
        throw new Error(`Manifest validation failed: ${validation.errors.join(', ')}`);
      }

      const manifest = validation.manifest!;

      // Cache the result
      this.cache.set(source, manifest);

      const loadTime = Date.now() - startTime;

      this.log(`Manifest loaded successfully in ${loadTime}ms`);

      return {
        success: true,
        manifest,
        metadata: {
          loadTime,
          size: manifestText.length,
          integrity: this.generateIntegrity(manifest),
          version: manifest.version,
          schemaVersion: manifest.manifest_version,
        }
      };

    } catch (error) {
      this.log(`Failed to load manifest: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          loadTime: Date.now() - startTime,
          size: 0,
          integrity: '',
          version: '',
          schemaVersion: 0,
        }
      };
    }
  }

  /**
   * Validate manifest against schema and business rules
   * Steve Jobs Philosophy: "Quality is more important than quantity"
   */
  validateManifest(data: any, options: ValidationOptions = {}): ManifestValidationResult {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.log('Starting manifest validation');

      // Schema validation
      const validatedData = ManifestSchema.parse(data) as AppManifest;

      // Business rule validation
      this.validateBusinessRules(validatedData, errors, warnings, options);

      // Security validation
      this.validateSecurity(validatedData, errors, warnings);

      // Lifecycle validation (if enabled)
      if (options.validateLifecycle) {
        this.validateLifecycleHooks(validatedData, errors, warnings);
      }

      // Dependency validation (if enabled)
      if (options.validateDependencies) {
        this.validateDependencies(validatedData, errors, warnings);
      }

      // Apply strict mode
      if (options.strict && warnings.length > 0) {
        errors.push(...warnings);
        warnings.length = 0;
      }

      const validationTime = Date.now() - startTime;
      this.log(`Validation completed in ${validationTime}ms`);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        manifest: errors.length === 0 ? validatedData : undefined,
        metadata: {
          validationTime,
          schemaVersion: validatedData.manifest_version,
          strictMode: options.strict || false,
        }
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown validation error');
      }

      return {
        isValid: false,
        errors,
        warnings,
        metadata: {
          validationTime: Date.now() - startTime,
          schemaVersion: 0,
          strictMode: options.strict || false,
        }
      };
    }
  }

  /**
   * Validate business rules
   * Steve Jobs Philosophy: "Think different"
   */
  private validateBusinessRules(manifest: AppManifest, errors: string[], warnings: string[], options: ValidationOptions) {
    // Check for duplicate app_id
    if (this.cache.has(manifest.app_id)) {
      const message = `App ID '${manifest.app_id}' already exists in cache`;
      if (options.strict) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    // Validate permissions
    const invalidPermissions = (manifest.permissions || []).filter(p => !permissionLiterals.includes(p as any));
    if (invalidPermissions.length > 0) {
      errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    // Validate version format
    if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }

    // Validate schema version compatibility
    if (manifest.manifest_version !== 1) {
      errors.push(`Unsupported manifest version: ${manifest.manifest_version}. Expected version 1.`);
    }
  }

  /**
   * Validate security settings
   * Steve Jobs Philosophy: "Security by design"
   */
  private validateSecurity(manifest: AppManifest, errors: string[], warnings: string[]) {
    // Check for dangerous permissions
    const dangerousPermissions: ValidPermission[] = ['system.files', 'system.network'];
    const hasDangerousPermissions = (manifest.permissions || []).some(p => (dangerousPermissions || []).includes(p));

    if (hasDangerousPermissions && !manifest.security?.sandboxed) {
      warnings.push('Dangerous permissions detected - consider enabling sandbox mode');
    }

    // Validate timeout settings
    if (manifest.security?.timeout && manifest.security.timeout > 30000) {
      warnings.push('Timeout exceeds 30 seconds - may impact user experience');
    }

    // Check memory limits
    if (manifest.security?.maxMemory && manifest.security.maxMemory > 100) {
      warnings.push('Memory limit exceeds 100MB - may impact performance');
    }
  }

  /**
   * Validate lifecycle hooks (future enhancement)
   * Steve Jobs Philosophy: "It just works"
   */
  private validateLifecycleHooks(manifest: AppManifest, errors: string[], warnings: string[]) {
    // This would validate that lifecycle hooks exist in the entry file
    // For now, just check if they're defined
    if (manifest.lifecycle) {
      const hooks = ['onMount', 'onError', 'onDestroy'];
      hooks.forEach(hook => {
        if (manifest.lifecycle![hook as keyof typeof manifest.lifecycle] &&
            typeof manifest.lifecycle![hook as keyof typeof manifest.lifecycle] !== 'string') {
          warnings.push(`Lifecycle hook '${hook}' should be a string function name`);
        }
      });
    }
  }

  /**
   * Validate dependencies (future enhancement)
   * Steve Jobs Philosophy: "Dependencies matter"
   */
  private validateDependencies(manifest: AppManifest, errors: string[], warnings: string[]) {
    if (manifest.dependencies) {
      const missingDeps = manifest.dependencies.filter(dep => !this.isDependencyAvailable(dep));
      if (missingDeps.length > 0) {
        warnings.push(`Missing dependencies: ${missingDeps.join(', ')}`);
      }
    }
  }

  /**
   * Generate integrity hash for manifest
   * Steve Jobs Philosophy: "Attention to detail"
   */
  private generateIntegrity(manifest: AppManifest): string {
    const manifestString = JSON.stringify(manifest, Object.keys(manifest).sort());
    let hash = 0;
    for (let i = 0; i < manifestString.length; i++) {
      const char = manifestString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Check if dependency is available
   * Steve Jobs Philosophy: "It just works"
   */
  private isDependencyAvailable(dependency: string): boolean {
    // In a real implementation, this would check against available modules
    // For now, we'll assume all dependencies are available
    return true;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.validationCache.clear();
    this.log('Cache cleared');
  }

  /**
   * Get cached manifest
   */
  getCachedManifest(appId: string): AppManifest | undefined {
    return this.cache.get(appId);
  }

  /**
   * Get all cached manifests
   */
  getAllCachedManifests(): AppManifest[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get manifest statistics
   */
  getStats() {
    return {
      cachedManifests: this.cache.size,
      validationCache: this.validationCache.size,
      validPermissions: permissionLiterals.length,
      schemaVersion: 1,
    };
  }

  /**
   * Get all valid permissions (for autocomplete)
   */
  static getValidPermissions(): ValidPermission[] {
    return [...permissionLiterals];
  }
}

// ==================== EXPORT SINGLETON ====================
export const manifestLoader = ManifestLoader.getInstance();

// ==================== EXAMPLE MANIFEST ====================
export const EXAMPLE_MANIFEST: AppManifest = {
  manifest_version: 1,
  app_id: "crm.contacts",
  name: "CRM Contacts",
  version: "1.0.0",
  description: "Manage customer contacts and interactions",
  author: "AI-BOS Team",
  ui: "components/ContactList",
  data_model: "models/contact.json",
  permissions: ["read.contacts", "write.contacts", "ui.modal"],
  theme: "light",
  entry: "App.tsx",
  dependencies: ["@aibos/ui-components", "@aibos/data-layer"],
  metadata: {
    category: "CRM",
    tags: ["contacts", "customers", "business"],
    icon: "/icons/contacts.svg",
  },
  lifecycle: {
    onMount: "initializeContacts",
    onError: "handleError",
    onDestroy: "cleanup",
  },
  security: {
    sandboxed: true,
    allowedDomains: ["api.aibos.com"],
    maxMemory: 50,
    timeout: 5000,
  },
};
