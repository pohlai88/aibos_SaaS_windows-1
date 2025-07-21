// ==================== MANIFEST LOADER - STEVE JOBS PHASE 2 ====================
// **"Everyone becomes a creator"** - The foundation that makes app creation accessible to all

import { z } from 'zod';

// ==================== TYPES ====================
export interface AppManifest {
  app_id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  ui: string;
  data_model?: string;
  permissions: string[];
  theme?: 'light' | 'dark' | 'auto';
  entry: string;
  dependencies?: string[];
  metadata?: {
    category: string;
    tags: string[];
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

export interface ManifestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: AppManifest;
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
  };
}

// ==================== SCHEMA VALIDATION ====================
const ManifestSchema = z.object({
  app_id: z.string().min(1, "App ID is required"),
  name: z.string().min(1, "App name is required"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semantic (e.g., 1.0.0)"),
  description: z.string().optional(),
  author: z.string().optional(),
  ui: z.string().min(1, "UI component path is required"),
  data_model: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  entry: z.string().min(1, "Entry point is required"),
  dependencies: z.array(z.string()).optional(),
  metadata: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    icon: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
  }).optional(),
  lifecycle: z.object({
    onMount: z.string().optional(),
    onError: z.string().optional(),
    onDestroy: z.string().optional(),
  }).optional(),
  security: z.object({
    sandboxed: z.boolean().optional(),
    allowedDomains: z.array(z.string()).optional(),
    maxMemory: z.number().optional(),
    timeout: z.number().optional(),
  }).optional(),
});

// ==================== PERMISSION SYSTEM ====================
const VALID_PERMISSIONS = [
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
];

// ==================== MANIFEST LOADER CLASS ====================
export class ManifestLoader {
  private static instance: ManifestLoader;
  private cache = new Map<string, AppManifest>();
  private validationCache = new Map<string, ManifestValidationResult>();

  static getInstance(): ManifestLoader {
    if (!ManifestLoader.instance) {
      ManifestLoader.instance = new ManifestLoader();
    }
    return ManifestLoader.instance;
  }

  // ==================== CORE LOADING METHODS ====================

  /**
   * Load manifest from URL or local path
   * Steve Jobs Philosophy: "Make it simple, make it work"
   */
  async loadManifest(source: string): Promise<ManifestLoadResult> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.cache.has(source)) {
        const cached = this.cache.get(source)!;
        return {
          success: true,
          manifest: cached,
          metadata: {
            loadTime: 0,
            size: JSON.stringify(cached).length,
            integrity: this.generateIntegrity(cached),
            version: cached.version,
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
      const validation = this.validateManifest(manifestData);
      if (!validation.isValid) {
        throw new Error(`Manifest validation failed: ${validation.errors.join(', ')}`);
      }

      const manifest = validation.manifest!;

      // Cache the result
      this.cache.set(source, manifest);

      const loadTime = Date.now() - startTime;

      return {
        success: true,
        manifest,
        metadata: {
          loadTime,
          size: manifestText.length,
          integrity: this.generateIntegrity(manifest),
          version: manifest.version,
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          loadTime: Date.now() - startTime,
          size: 0,
          integrity: '',
          version: '',
        }
      };
    }
  }

  /**
   * Validate manifest against schema and business rules
   * Steve Jobs Philosophy: "Quality is more important than quantity"
   */
  validateManifest(data: any): ManifestValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Schema validation
      const validatedData = ManifestSchema.parse(data);

      // Business rule validation
      this.validateBusinessRules(validatedData, errors, warnings);

      // Security validation
      this.validateSecurity(validatedData, errors, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        manifest: errors.length === 0 ? validatedData : undefined,
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
      };
    }
  }

  /**
   * Validate business rules
   * Steve Jobs Philosophy: "Think different"
   */
  private validateBusinessRules(manifest: AppManifest, errors: string[], warnings: string[]) {
    // Check for duplicate app_id
    if (this.cache.has(manifest.app_id)) {
      warnings.push(`App ID '${manifest.app_id}' already exists in cache`);
    }

    // Validate permissions
    const invalidPermissions = manifest.permissions.filter(p => !VALID_PERMISSIONS.includes(p));
    if (invalidPermissions.length > 0) {
      errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    // Check for required dependencies
    if (manifest.dependencies) {
      const missingDeps = manifest.dependencies.filter(dep => !this.isDependencyAvailable(dep));
      if (missingDeps.length > 0) {
        warnings.push(`Missing dependencies: ${missingDeps.join(', ')}`);
      }
    }

    // Validate version format
    if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }
  }

  /**
   * Validate security settings
   * Steve Jobs Philosophy: "Security by design"
   */
  private validateSecurity(manifest: AppManifest, errors: string[], warnings: string[]) {
    // Check for dangerous permissions
    const dangerousPermissions = ['system.files', 'system.network'];
    const hasDangerousPermissions = manifest.permissions.some(p => dangerousPermissions.includes(p));

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
      validPermissions: VALID_PERMISSIONS.length,
    };
  }
}

// ==================== EXPORT SINGLETON ====================
export const manifestLoader = ManifestLoader.getInstance();

// ==================== EXAMPLE MANIFEST ====================
export const EXAMPLE_MANIFEST: AppManifest = {
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
