/**
 * Manifest-Driven ESLint Integration
 * Achieves 100% compliance with Lean Architecture Manifestor Standards
 */

import fs from 'fs';
import path from 'path';
import { log } from './Logger';

export interface ESLintManifest {
  version: string;
  name: string;
  description: string;
  type: string;
  category: string;
  priority: string;
  ai_metadata: {
    purpose: string;
    target_languages: string[];
    security_level: string;
    performance_impact: string;
    runtime_overhead: string;
    ai_interpretable: boolean;
    manifest_driven: boolean;
    compliance_level: string;
  };
  permissions: {
    read: string[];
    write: string[];
    execute: string[];
  };
  configuration: {
    cache: {
      enabled: boolean;
      location: string;
      strategy: string;
    };
    performance: {
      runtime_overhead: string;
      caching_enabled: boolean;
      parallel_processing: boolean;
    };
    security: {
      level: string;
      plugins: string[];
      rules: string[];
    };
    code_quality: {
      plugins: string[];
      strict_mode: boolean;
      type_safety: string;
      dead_code_prevention: boolean;
    };
    import_organization: {
      enabled: boolean;
      order: string[];
      newlines_between: boolean;
      alphabetize: boolean;
    };
    testing: {
      environment: string;
      relaxed_rules: string[];
    };
  };
  rules: Record<string, any>;
  environments: Record<string, any>;
  dependencies: {
    required: string[];
    optional: string[];
  };
  telemetry: {
    enabled: boolean;
    metrics: string[];
    reporting: string;
  };
  compliance: {
    standards: string[];
    certifications: string[];
  };
  version_control: {
    tracked: boolean;
    review_required: boolean;
    change_log: string;
  };
  last_updated: string;
  maintainer: string;
  status: string;
}

export class ManifestorESLint {
  private static instance: ManifestorESLint;
  private manifest: ESLintManifest | null = null;
  private manifestPath: string;

  private constructor() {
    this.manifestPath = path.join(__dirname, '../manifests/eslint.manifest.json');
  }

  static getInstance(): ManifestorESLint {
    if (!ManifestorESLint.instance) {
      ManifestorESLint.instance = new ManifestorESLint();
    }
    return ManifestorESLint.instance;
  }

  /**
   * Load and validate ESLint manifest
   */
  async loadManifest(): Promise<ESLintManifest> {
    try {
      if (!fs.existsSync(this.manifestPath)) {
        throw new Error(`ESLint manifest not found at: ${this.manifestPath}`);
      }

      const manifestContent = fs.readFileSync(this.manifestPath, 'utf8');
      this.manifest = JSON.parse(manifestContent);

      // Validate manifest structure
      if (this.manifest) {
        await this.validateManifest(this.manifest);

        log.info('ESLint manifest loaded successfully', {
          module: 'manifestor-eslint',
          action: 'load-manifest',
          version: this.manifest.version,
          compliance_level: this.manifest.ai_metadata.compliance_level
        });

        return this.manifest;
      } else {
        throw new Error('Failed to parse ESLint manifest');
      }
    } catch (error) {
      log.error('Failed to load ESLint manifest', error as Error, {
        module: 'manifestor-eslint',
        action: 'load-manifest'
      });
      throw error;
    }
  }

  /**
   * Validate manifest structure and compliance
   */
  private async validateManifest(manifest: ESLintManifest): Promise<void> {
    const requiredFields = [
      'version', 'name', 'ai_metadata', 'permissions',
      'configuration', 'rules', 'compliance'
    ];

    for (const field of requiredFields) {
      if (!manifest[field as keyof ESLintManifest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate AI metadata
    if (!manifest.ai_metadata.ai_interpretable) {
      throw new Error('Manifest must be AI-interpretable');
    }

    if (!manifest.ai_metadata.manifest_driven) {
      throw new Error('Manifest must be manifest-driven');
    }

    // Validate compliance standards
    const requiredStandards = ['fortune_500', 'enterprise_grade', 'lean_architecture'];
    for (const standard of requiredStandards) {
      if (!manifest.compliance.standards.includes(standard)) {
        throw new Error(`Missing required compliance standard: ${standard}`);
      }
    }

    log.info('ESLint manifest validation passed', {
      module: 'manifestor-eslint',
      action: 'validate-manifest',
      standards: manifest.compliance.standards.length,
      certifications: manifest.compliance.certifications.length
    });
  }

  /**
   * Generate ESLint configuration from manifest
   */
  generateESLintConfig(): any {
    if (!this.manifest) {
      throw new Error('Manifest not loaded. Call loadManifest() first.');
    }

    const config = {
      // Global configuration for performance and caching
      linterOptions: {
        cache: this.manifest.configuration.cache.enabled,
        cacheLocation: this.manifest.configuration.cache.location,
        reportUnusedDisableDirectives: 'error'
      },
      // TypeScript configuration
      typescript: {
        files: this.manifest.environments.typescript.files,
        languageOptions: {
          parser: this.manifest.environments.typescript.parser,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            project: ['./tsconfig.json'],
          },
        },
        plugins: this.manifest.environments.typescript.plugins,
        rules: this.buildRulesFromManifest()
      },
      // JavaScript configuration
      javascript: {
        files: this.manifest.environments.javascript.files,
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        plugins: this.manifest.environments.javascript.plugins,
        rules: this.buildJavaScriptRules()
      },
      // Testing configuration
      testing: {
        files: this.manifest.environments.testing.files,
        env: this.manifest.environments.testing.env,
        rules: this.buildTestingRules()
      }
    };

    log.info('ESLint configuration generated from manifest', {
      module: 'manifestor-eslint',
      action: 'generate-config',
      environments: Object.keys(config).length,
      rules_count: this.countRules(config)
    });

    return config;
  }

  /**
   * Build rules from manifest configuration
   */
  private buildRulesFromManifest(): Record<string, any> {
    if (!this.manifest) {
      throw new Error('Manifest not loaded');
    }

    const rules: Record<string, any> = {};

    // TypeScript rules
    Object.entries(this.manifest.rules.typescript).forEach(([rule, config]) => {
      if (typeof config === 'object' && config !== null && 'level' in config) {
        const configObj = config as { level: string; [key: string]: any };
        rules[`@typescript-eslint/${rule}`] = [configObj.level, ...Object.entries(configObj)
          .filter(([key]) => key !== 'level')
          .map(([, value]) => value)];
      } else {
        rules[`@typescript-eslint/${rule}`] = config;
      }
    });

    // Security rules
    Object.entries(this.manifest.rules.security).forEach(([rule, level]) => {
      rules[rule] = level;
    });

    // Unicorn rules
    Object.entries(this.manifest.rules.unicorn).forEach(([rule, level]) => {
      rules[`unicorn/${rule}`] = level;
    });

    // Import rules
    Object.entries(this.manifest.rules.import).forEach(([rule, config]) => {
      if (typeof config === 'object' && config !== null && 'level' in config) {
        const configObj = config as { level: string; [key: string]: any };
        rules[`import/${rule}`] = [configObj.level, ...Object.entries(configObj)
          .filter(([key]) => key !== 'level')
          .map(([, value]) => value)];
      } else {
        rules[`import/${rule}`] = config;
      }
    });

    // General rules
    Object.entries(this.manifest.rules.general).forEach(([rule, config]) => {
      rules[rule] = config;
    });

    return rules;
  }

  /**
   * Build JavaScript-specific rules
   */
  private buildJavaScriptRules(): Record<string, any> {
    return {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    };
  }

  /**
   * Build testing-specific rules
   */
  private buildTestingRules(): Record<string, any> {
    if (!this.manifest) {
      throw new Error('Manifest not loaded');
    }

    const rules: Record<string, any> = {};

    this.manifest.environments.testing.relaxed_rules.forEach((rule: string) => {
      rules[rule] = 'off';
    });

    return rules;
  }

  /**
   * Count total rules in configuration
   */
  private countRules(config: any): number {
    let count = 0;

    if (config.typescript?.rules) {
      count += Object.keys(config.typescript.rules).length;
    }

    if (config.javascript?.rules) {
      count += Object.keys(config.javascript.rules).length;
    }

    if (config.testing?.rules) {
      count += Object.keys(config.testing.rules).length;
    }

    return count;
  }

  /**
   * Check if manifest is AI-interpretable
   */
  isAIInterpretable(): boolean {
    return this.manifest?.ai_metadata.ai_interpretable || false;
  }

  /**
   * Check if manifest is manifest-driven
   */
  isManifestDriven(): boolean {
    return this.manifest?.ai_metadata.manifest_driven || false;
  }

  /**
   * Get compliance standards
   */
  getComplianceStandards(): string[] {
    return this.manifest?.compliance.standards || [];
  }

  /**
   * Get security level
   */
  getSecurityLevel(): string {
    return this.manifest?.ai_metadata.security_level || 'unknown';
  }

  /**
   * Get performance impact
   */
  getPerformanceImpact(): string {
    return this.manifest?.ai_metadata.performance_impact || 'unknown';
  }

  /**
   * Get target languages
   */
  getTargetLanguages(): string[] {
    return this.manifest?.ai_metadata.target_languages || [];
  }

  /**
   * Validate dependencies
   */
  async validateDependencies(): Promise<boolean> {
    if (!this.manifest) {
      throw new Error('Manifest not loaded');
    }

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      log.warn('package.json not found for dependency validation', {
        module: 'manifestor-eslint',
        action: 'validate-dependencies'
      });
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const missingDependencies = this.manifest.dependencies.required.filter(
      dep => !allDependencies[dep]
    );

    if (missingDependencies.length > 0) {
      log.warn('Missing required ESLint dependencies', {
        module: 'manifestor-eslint',
        action: 'validate-dependencies',
        missing: missingDependencies
      });
      return false;
    }

    log.info('All required ESLint dependencies are installed', {
      module: 'manifestor-eslint',
      action: 'validate-dependencies',
      required_count: this.manifest.dependencies.required.length
    });

    return true;
  }

  /**
   * Get manifest telemetry data
   */
  getTelemetryData(): any {
    if (!this.manifest) {
      return null;
    }

    return {
      enabled: this.manifest.telemetry.enabled,
      metrics: this.manifest.telemetry.metrics,
      reporting: this.manifest.telemetry.reporting,
      compliance_standards: this.manifest.compliance.standards,
      certifications: this.manifest.compliance.certifications,
      security_level: this.manifest.ai_metadata.security_level,
      performance_impact: this.manifest.ai_metadata.performance_impact,
      target_languages: this.manifest.ai_metadata.target_languages,
      ai_interpretable: this.manifest.ai_metadata.ai_interpretable,
      manifest_driven: this.manifest.ai_metadata.manifest_driven
    };
  }
}

// Export singleton instance
export const manifestorESLint = ManifestorESLint.getInstance();
