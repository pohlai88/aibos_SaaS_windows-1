/**
 * Enterprise-Grade Manifest Validator
 * Verifies runtime integrity and module availability
 */

import fs from 'fs';
import path from 'path';
import { log } from './Logger';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  modules: {
    name: string;
    exists: boolean;
    path: string;
  }[];
  files: {
    name: string;
    exists: boolean;
    path: string;
  }[];
}

export class ManifestValidator {
  private static instance: ManifestValidator;
  private manifestPath: string;
  private basePath: string;

  private constructor() {
    this.manifestPath = path.join(__dirname, '../runtime.manifest.json');
    this.basePath = path.join(__dirname, '..');
  }

  static getInstance(): ManifestValidator {
    if (!ManifestValidator.instance) {
      ManifestValidator.instance = new ManifestValidator();
    }
    return ManifestValidator.instance;
  }

  /**
   * Validate runtime integrity
   */
  async validateRuntime(): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      modules: [],
      files: []
    };

    try {
      // Load manifest
      const manifest = this.loadManifest();
      if (!manifest) {
        result.valid = false;
        result.errors.push('Runtime manifest not found');
        return result;
      }

      // Validate modules
      await this.validateModules(manifest, result);

      // Validate core files
      await this.validateCoreFiles(manifest, result);

      // Validate endpoints (basic check)
      this.validateEndpoints(manifest, result);

      // Update validation timestamp
      this.updateValidationTimestamp();

      log.info('Runtime validation completed', {
        module: 'validator',
        action: 'validate',
        valid: result.valid,
        errors: result.errors.length,
        warnings: result.warnings.length
      });

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      log.error('Runtime validation failed', error as Error, {
        module: 'validator',
        action: 'validate'
      });
    }

    return result;
  }

  /**
   * Load runtime manifest
   */
  private loadManifest(): any {
    try {
      const content = fs.readFileSync(this.manifestPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      log.error('Failed to load runtime manifest', error as Error, {
        module: 'validator',
        action: 'load-manifest'
      });
      return null;
    }
  }

  /**
   * Validate modules
   */
  private async validateModules(manifest: any, result: ValidationResult): Promise<void> {
    const modules = manifest.modules || [];

    for (const moduleName of modules) {
      const modulePath = path.join(this.basePath, moduleName);
      const exists = fs.existsSync(modulePath);

      result.modules.push({
        name: moduleName,
        exists,
        path: modulePath
      });

      if (!exists) {
        result.valid = false;
        result.errors.push(`Module not found: ${moduleName}`);
      } else {
        // Check if module has index file
        const indexFiles = ['index.ts', 'index.js'];
        const hasIndex = indexFiles.some(file =>
          fs.existsSync(path.join(modulePath, file))
        );

        if (!hasIndex) {
          result.warnings.push(`Module ${moduleName} has no index file`);
        }
      }
    }
  }

  /**
   * Validate core files
   */
  private async validateCoreFiles(manifest: any, result: ValidationResult): Promise<void> {
    const coreFiles = manifest.coreFiles || [];

    for (const fileName of coreFiles) {
      const filePath = path.join(this.basePath, fileName);
      const exists = fs.existsSync(filePath);

      result.files.push({
        name: fileName,
        exists,
        path: filePath
      });

      if (!exists) {
        result.valid = false;
        result.errors.push(`Core file not found: ${fileName}`);
      } else {
        // Check file size (basic integrity check)
        try {
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            result.warnings.push(`Core file is empty: ${fileName}`);
          }
        } catch (error) {
          result.warnings.push(`Cannot stat file: ${fileName}`);
        }
      }
    }
  }

  /**
   * Validate endpoints (basic check)
   */
  private validateEndpoints(manifest: any, result: ValidationResult): void {
    const endpoints = manifest.endpoints || [];

    if (endpoints.length === 0) {
      result.warnings.push('No endpoints defined in manifest');
    } else {
      // Check for critical endpoints
      const criticalEndpoints = ['/healthz', '/readyz'];
      for (const endpoint of criticalEndpoints) {
        if (!endpoints.includes(endpoint)) {
          result.warnings.push(`Critical endpoint missing: ${endpoint}`);
        }
      }
    }
  }

  /**
   * Update validation timestamp
   */
  private updateValidationTimestamp(): void {
    try {
      const manifest = this.loadManifest();
      if (manifest) {
        manifest.lastValidated = new Date().toISOString();
        fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
      }
    } catch (error) {
      log.warn('Failed to update validation timestamp', {
        module: 'validator',
        action: 'update-timestamp',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get validation status
   */
  getValidationStatus(): { lastValidated: string; version: string } | null {
    try {
      const manifest = this.loadManifest();
      if (manifest) {
        return {
          lastValidated: manifest.lastValidated || 'Never',
          version: manifest.version || 'Unknown'
        };
      }
    } catch (error) {
      log.error('Failed to get validation status', error as Error, {
        module: 'validator',
        action: 'get-status'
      });
    }
    return null;
  }

  /**
   * Check if runtime is valid
   */
  async isRuntimeValid(): Promise<boolean> {
    const result = await this.validateRuntime();
    return result.valid;
  }
}

// Export singleton instance
export const manifestValidator = ManifestValidator.getInstance();
