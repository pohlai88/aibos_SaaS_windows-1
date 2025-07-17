/**
 * AI-BOS Manifest System
 *
 * Enterprise-grade manifest validation, processing, and lifecycle management
 * for the AI-BOS micro-app platform.
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { monitoring } from './monitoring';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Manifest field definition
 */
export interface ManifestField {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  validation?: FieldValidation[];
  description?: string;
  pii?: boolean;
  encrypted?: boolean;
  indexed?: boolean;
}

/**
 * Field validation rule
 */
export interface FieldValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean;
}

/**
 * Entity definition in manifest
 */
export interface ManifestEntity {
  name: string;
  fields: ManifestField[];
  indexes?: EntityIndex[];
  constraints?: EntityConstraint[];
  description?: string;
  version?: string;
}

/**
 * Entity index definition
 */
export interface EntityIndex {
  name: string;
  fields: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique?: boolean;
  partial?: string;
}

/**
 * Entity constraint definition
 */
export interface EntityConstraint {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'check' | 'unique';
  fields?: string[];
  reference?: {
    table: string;
    field: string;
  };
  expression?: string;
}

/**
 * Event definition in manifest
 */
export interface ManifestEvent {
  name: string;
  payload: Record<string, any>;
  description?: string;
  version?: string;
  deprecated?: boolean;
}

/**
 * UI component definition
 */
export interface ManifestUIComponent {
  name: string;
  type: 'button' | 'form' | 'table' | 'chart' | 'modal' | 'custom';
  props?: Record<string, any>;
  events?: string[];
  triggers?: string[];
  description?: string;
}

/**
 * Permission definition
 */
export interface ManifestPermission {
  name: string;
  description: string;
  resources: string[];
  actions: string[];
  conditions?: Record<string, any>;
}

/**
 * App manifest structure
 */
export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;

  // Core definitions
  entities: ManifestEntity[];
  events: ManifestEvent[];
  uiComponents: ManifestUIComponent[];
  permissions: ManifestPermission[];

  // Configuration
  settings?: Record<string, any>;
  dependencies?: string[];
  requirements?: {
    minAibosVersion?: string;
    maxAibosVersion?: string;
    features?: string[];
  };

  // Metadata
  tags?: string[];
  categories?: string[];
  icon?: string;
  screenshots?: string[];

  // Lifecycle
  status: 'draft' | 'published' | 'deprecated' | 'archived';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;

  // Compliance
  compliance?: {
    gdpr?: boolean;
    soc2?: boolean;
    hipaa?: boolean;
    dataRetention?: number;
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  };

  // Security
  security?: {
    encryptionLevel?: 'none' | 'standard' | 'high';
    auditTrail?: boolean;
    accessControl?: 'role-based' | 'attribute-based' | 'policy-based';
  };
}

/**
 * Manifest validation result
 */
export interface ManifestValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  compliance: ComplianceCheck[];
  security: SecurityCheck[];
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  suggestion?: string;
}

/**
 * Compliance check result
 */
export interface ComplianceCheck {
  standard: string;
  compliant: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Security check result
 */
export interface SecurityCheck {
  aspect: string;
  secure: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Manifest installation result
 */
export interface ManifestInstallResult {
  success: boolean;
  manifestId: string;
  installedAt: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Manifest configuration
 */
export interface ManifestConfig {
  enableValidation: boolean;
  enableCompliance: boolean;
  enableSecurity: boolean;
  strictMode: boolean;
  allowDeprecated: boolean;
  maxManifestSize: number;
  maxEntities: number;
  maxEvents: number;
  maxUIComponents: number;
}

// ============================================================================
// MANIFEST VALIDATOR
// ============================================================================

/**
 * Manifest validator with comprehensive validation rules
 */
export class ManifestValidator {
  private config: ManifestConfig;
  private schemas: Map<string, z.ZodSchema> = new Map();

  constructor(config: ManifestConfig) {
    this.config = config;
    this.initializeSchemas();
  }

  /**
   * Initialize validation schemas
   */
  private initializeSchemas(): void {
    // Field validation schema
    const fieldValidationSchema = z.object({
      type: z.enum(['required', 'min', 'max', 'pattern', 'email', 'url', 'custom']),
      value: z.any().optional(),
      message: z.string().optional(),
      validator: z.function().optional(),
    });

    // Field schema
    const fieldSchema = z.object({
      name: z.string().min(1).max(100),
      type: z.string().min(1),
      required: z.boolean().optional(),
      unique: z.boolean().optional(),
      defaultValue: z.any().optional(),
      validation: z.array(fieldValidationSchema).optional(),
      description: z.string().optional(),
      pii: z.boolean().optional(),
      encrypted: z.boolean().optional(),
      indexed: z.boolean().optional(),
    });

    // Entity index schema
    const entityIndexSchema = z.object({
      name: z.string().min(1),
      fields: z.array(z.string()).min(1),
      type: z.enum(['btree', 'hash', 'gin', 'gist']),
      unique: z.boolean().optional(),
      partial: z.string().optional(),
    });

    // Entity constraint schema
    const entityConstraintSchema = z.object({
      name: z.string().min(1),
      type: z.enum(['primary_key', 'foreign_key', 'check', 'unique']),
      fields: z.array(z.string()).optional(),
      reference: z
        .object({
          table: z.string(),
          field: z.string(),
        })
        .optional(),
      expression: z.string().optional(),
    });

    // Entity schema
    const entitySchema = z.object({
      name: z.string().min(1).max(100),
      fields: z.array(fieldSchema).min(1),
      indexes: z.array(entityIndexSchema).optional(),
      constraints: z.array(entityConstraintSchema).optional(),
      description: z.string().optional(),
      version: z.string().optional(),
    });

    // Event schema
    const eventSchema = z.object({
      name: z.string().min(1).max(100),
      payload: z.record(z.any()),
      description: z.string().optional(),
      version: z.string().optional(),
      deprecated: z.boolean().optional(),
    });

    // UI component schema
    const uiComponentSchema = z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['button', 'form', 'table', 'chart', 'modal', 'custom']),
      props: z.record(z.any()).optional(),
      events: z.array(z.string()).optional(),
      triggers: z.array(z.string()).optional(),
      description: z.string().optional(),
    });

    // Permission schema
    const permissionSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string(),
      resources: z.array(z.string()).min(1),
      actions: z.array(z.string()).min(1),
      conditions: z.record(z.any()).optional(),
    });

    // Main manifest schema
    const manifestSchema = z.object({
      id: z.string().min(1).max(100),
      name: z.string().min(1).max(200),
      version: z.string().min(1),
      description: z.string().optional(),
      author: z.string().optional(),
      license: z.string().optional(),
      homepage: z.string().url().optional(),
      repository: z.string().url().optional(),

      entities: z.array(entitySchema).min(0).max(this.config.maxEntities),
      events: z.array(eventSchema).min(0).max(this.config.maxEvents),
      uiComponents: z.array(uiComponentSchema).min(0).max(this.config.maxUIComponents),
      permissions: z.array(permissionSchema).min(0),

      settings: z.record(z.any()).optional(),
      dependencies: z.array(z.string()).optional(),
      requirements: z
        .object({
          minAibosVersion: z.string().optional(),
          maxAibosVersion: z.string().optional(),
          features: z.array(z.string()).optional(),
        })
        .optional(),

      tags: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      icon: z.string().optional(),
      screenshots: z.array(z.string()).optional(),

      status: z.enum(['draft', 'published', 'deprecated', 'archived']),
      createdAt: z.number(),
      updatedAt: z.number(),
      publishedAt: z.number().optional(),

      compliance: z
        .object({
          gdpr: z.boolean().optional(),
          soc2: z.boolean().optional(),
          hipaa: z.boolean().optional(),
          dataRetention: z.number().optional(),
          dataClassification: z
            .enum(['public', 'internal', 'confidential', 'restricted'])
            .optional(),
        })
        .optional(),

      security: z
        .object({
          encryptionLevel: z.enum(['none', 'standard', 'high']).optional(),
          auditTrail: z.boolean().optional(),
          accessControl: z.enum(['role-based', 'attribute-based', 'policy-based']).optional(),
        })
        .optional(),
    });

    this.schemas.set('manifest', manifestSchema);
    this.schemas.set('entity', entitySchema);
    this.schemas.set('event', eventSchema);
    this.schemas.set('uiComponent', uiComponentSchema);
    this.schemas.set('permission', permissionSchema);
  }

  /**
   * Validate manifest
   */
  validate(manifest: AppManifest): ManifestValidationResult {
    const result: ManifestValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      compliance: [],
      security: [],
    };

    try {
      // Basic schema validation
      const schema = this.schemas.get('manifest');
      if (schema) {
        schema.parse(manifest);
      }

      // Custom validation rules
      this.validateManifestStructure(manifest, result);
      this.validateEntityRelationships(manifest, result);
      this.validateEventConsistency(manifest, result);
      this.validateNamingConventions(manifest, result);

      // Compliance checks
      if (this.config.enableCompliance) {
        this.checkCompliance(manifest, result);
      }

      // Security checks
      if (this.config.enableSecurity) {
        this.checkSecurity(manifest, result);
      }

      // Performance checks
      this.checkPerformance(manifest, result);

      result.valid = result.errors.length === 0;
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors.push(
          ...error.errors.map((err) => ({
            code: 'SCHEMA_VALIDATION_ERROR',
            message: err.message,
            path: err.path.join('.'),
            severity: 'error' as const,
          })),
        );
      } else {
        result.errors.push({
          code: 'VALIDATION_ERROR',
          message: (error as Error).message,
          path: 'manifest',
          severity: 'error' as const,
        });
      }
      result.valid = false;
    }

    return result;
  }

  /**
   * Validate manifest structure
   */
  private validateManifestStructure(manifest: AppManifest, result: ManifestValidationResult): void {
    // Check manifest size
    const manifestSize = JSON.stringify(manifest).length;
    if (manifestSize > this.config.maxManifestSize) {
      result.errors.push({
        code: 'MANIFEST_TOO_LARGE',
        message: `Manifest size (${manifestSize} bytes) exceeds maximum allowed size (${this.config.maxManifestSize} bytes)`,
        path: 'manifest',
        severity: 'error',
      });
    }

    // Check for duplicate entity names
    const entityNames = manifest.entities.map((e) => e.name);
    const duplicateEntities = entityNames.filter(
      (name, index) => entityNames.indexOf(name) !== index,
    );
    if (duplicateEntities.length > 0) {
      result.errors.push({
        code: 'DUPLICATE_ENTITY_NAMES',
        message: `Duplicate entity names found: ${duplicateEntities.join(', ')}`,
        path: 'entities',
        severity: 'error',
      });
    }

    // Check for duplicate event names
    const eventNames = manifest.events.map((e) => e.name);
    const duplicateEvents = eventNames.filter((name, index) => eventNames.indexOf(name) !== index);
    if (duplicateEvents.length > 0) {
      result.errors.push({
        code: 'DUPLICATE_EVENT_NAMES',
        message: `Duplicate event names found: ${duplicateEvents.join(', ')}`,
        path: 'events',
        severity: 'error',
      });
    }
  }

  /**
   * Validate entity relationships
   */
  private validateEntityRelationships(
    manifest: AppManifest,
    result: ManifestValidationResult,
  ): void {
    const entityNames = new Set(manifest.entities.map((e) => e.name));

    for (const entity of manifest.entities) {
      for (const constraint of entity.constraints || []) {
        if (constraint.type === 'foreign_key' && constraint.reference) {
          if (!entityNames.has(constraint.reference.table)) {
            result.errors.push({
              code: 'INVALID_FOREIGN_KEY',
              message: `Foreign key references non-existent entity: ${constraint.reference.table}`,
              path: `entities.${entity.name}.constraints.${constraint.name}`,
              severity: 'error',
            });
          }
        }
      }
    }
  }

  /**
   * Validate event consistency
   */
  private validateEventConsistency(manifest: AppManifest, result: ManifestValidationResult): void {
    const entityNames = new Set(manifest.entities.map((e) => e.name));

    for (const event of manifest.events) {
      // Check if event payload references valid entities
      for (const [key, value] of Object.entries(event.payload)) {
        if (typeof value === 'string' && value.includes('Entity') && !entityNames.has(value)) {
          result.warnings.push({
            code: 'POTENTIAL_INVALID_ENTITY_REFERENCE',
            message: `Event payload may reference invalid entity: ${value}`,
            path: `events.${event.name}.payload.${key}`,
          });
        }
      }
    }
  }

  /**
   * Validate naming conventions
   */
  private validateNamingConventions(manifest: AppManifest, result: ManifestValidationResult): void {
    // Check entity naming
    for (const entity of manifest.entities) {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
        result.warnings.push({
          code: 'ENTITY_NAMING_CONVENTION',
          message: `Entity name should follow PascalCase convention: ${entity.name}`,
          path: `entities.${entity.name}.name`,
        });
      }
    }

    // Check event naming
    for (const event of manifest.events) {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(event.name)) {
        result.warnings.push({
          code: 'EVENT_NAMING_CONVENTION',
          message: `Event name should follow PascalCase convention: ${event.name}`,
          path: `events.${event.name}.name`,
        });
      }
    }
  }

  /**
   * Check compliance requirements
   */
  private checkCompliance(manifest: AppManifest, result: ManifestValidationResult): void {
    // GDPR compliance
    if (manifest.compliance?.gdpr) {
      const gdprCheck: ComplianceCheck = {
        standard: 'GDPR',
        compliant: true,
        issues: [],
        recommendations: [],
      };

      // Check for PII fields
      const piiFields = manifest.entities.flatMap((e) =>
        e.fields.filter((f) => f.pii).map((f) => `${e.name}.${f.name}`),
      );

      if (piiFields.length > 0) {
        gdprCheck.recommendations.push(
          `PII fields detected: ${piiFields.join(', ')}. Ensure proper data protection measures.`,
        );
      }

      // Check data retention
      if (!manifest.compliance.dataRetention) {
        gdprCheck.issues.push('Data retention policy not specified');
        gdprCheck.compliant = false;
      }

      result.compliance.push(gdprCheck);
    }

    // SOC2 compliance
    if (manifest.compliance?.soc2) {
      const soc2Check: ComplianceCheck = {
        standard: 'SOC2',
        compliant: true,
        issues: [],
        recommendations: [],
      };

      // Check audit trail
      if (!manifest.security?.auditTrail) {
        soc2Check.issues.push('Audit trail not enabled');
        soc2Check.compliant = false;
      }

      // Check access control
      if (!manifest.security?.accessControl) {
        soc2Check.issues.push('Access control not specified');
        soc2Check.compliant = false;
      }

      result.compliance.push(soc2Check);
    }
  }

  /**
   * Check security requirements
   */
  private checkSecurity(manifest: AppManifest, result: ManifestValidationResult): void {
    const securityCheck: SecurityCheck = {
      aspect: 'General Security',
      secure: true,
      issues: [],
      recommendations: [],
    };

    // Check encryption for sensitive data
    const sensitiveFields = manifest.entities.flatMap((e) =>
      e.fields.filter((f) => f.pii || f.encrypted).map((f) => `${e.name}.${f.name}`),
    );

    if (sensitiveFields.length > 0 && manifest.security?.encryptionLevel === 'none') {
      securityCheck.issues.push('Sensitive fields detected but encryption not enabled');
      securityCheck.secure = false;
    }

    // Check permissions
    if (manifest.permissions.length === 0) {
      securityCheck.warnings.push('No permissions defined - consider implementing access control');
    }

    result.security.push(securityCheck);
  }

  /**
   * Check performance considerations
   */
  private checkPerformance(manifest: AppManifest, result: ManifestValidationResult): void {
    // Check for missing indexes on frequently queried fields
    for (const entity of manifest.entities) {
      const uniqueFields = entity.fields.filter((f) => f.unique);
      const indexedFields = entity.indexes?.flatMap((i) => i.fields) || [];

      for (const field of uniqueFields) {
        if (!indexedFields.includes(field.name)) {
          result.warnings.push({
            code: 'MISSING_INDEX',
            message: `Unique field '${field.name}' in entity '${entity.name}' should be indexed for performance`,
            path: `entities.${entity.name}.fields.${field.name}`,
          });
        }
      }
    }
  }
}

// ============================================================================
// MANIFEST PROCESSOR
// ============================================================================

/**
 * Manifest processor for installation and lifecycle management
 */
export class ManifestProcessor {
  private validator: ManifestValidator;
  private installedManifests = new Map<string, AppManifest>();

  constructor(validator: ManifestValidator) {
    this.validator = validator;
  }

  /**
   * Install manifest
   */
  async install(manifest: AppManifest): Promise<ManifestInstallResult> {
    const result: ManifestInstallResult = {
      success: false,
      manifestId: manifest.id,
      installedAt: Date.now(),
    };

    try {
      // Validate manifest
      const validation = this.validator.validate(manifest);
      if (!validation.valid) {
        result.errors = validation.errors.map((e) => `${e.path}: ${e.message}`);
        return result;
      }

      // Check for conflicts
      const conflicts = this.checkConflicts(manifest);
      if (conflicts.length > 0) {
        result.errors = conflicts;
        return result;
      }

      // Install manifest
      this.installedManifests.set(manifest.id, {
        ...manifest,
        status: 'published',
        publishedAt: Date.now(),
      });

      result.success = true;
      result.warnings = validation.warnings.map((w) => `${w.path}: ${w.message}`);

      logger.info('Manifest installed successfully', {
        manifestId: manifest.id,
        name: manifest.name,
        version: manifest.version,
      });
    } catch (error) {
      result.errors = [(error as Error).message];
      logger.error('Manifest installation failed', {
        manifestId: manifest.id,
        error: (error as Error).message,
      });
    }

    return result;
  }

  /**
   * Uninstall manifest
   */
  async uninstall(manifestId: string): Promise<boolean> {
    const manifest = this.installedManifests.get(manifestId);
    if (!manifest) {
      return false;
    }

    this.installedManifests.delete(manifestId);

    logger.info('Manifest uninstalled', {
      manifestId,
      name: manifest.name,
    });

    return true;
  }

  /**
   * Update manifest
   */
  async update(manifest: AppManifest): Promise<ManifestInstallResult> {
    // Uninstall existing version
    await this.uninstall(manifest.id);

    // Install new version
    return this.install(manifest);
  }

  /**
   * Get installed manifest
   */
  getInstalled(manifestId: string): AppManifest | undefined {
    return this.installedManifests.get(manifestId);
  }

  /**
   * Get all installed manifests
   */
  getAllInstalled(): AppManifest[] {
    return Array.from(this.installedManifests.values());
  }

  /**
   * Check for conflicts with existing manifests
   */
  private checkConflicts(manifest: AppManifest): string[] {
    const conflicts: string[] = [];

    for (const installed of this.installedManifests.values()) {
      // Check for entity name conflicts
      const installedEntityNames = new Set(installed.entities.map((e) => e.name));
      const newEntityNames = new Set(manifest.entities.map((e) => e.name));

      for (const entityName of newEntityNames) {
        if (installedEntityNames.has(entityName)) {
          conflicts.push(`Entity name conflict: ${entityName} already exists in ${installed.name}`);
        }
      }

      // Check for event name conflicts
      const installedEventNames = new Set(installed.events.map((e) => e.name));
      const newEventNames = new Set(manifest.events.map((e) => e.name));

      for (const eventName of newEventNames) {
        if (installedEventNames.has(eventName)) {
          conflicts.push(`Event name conflict: ${eventName} already exists in ${installed.name}`);
        }
      }
    }

    return conflicts;
  }
}

// ============================================================================
// MANIFEST BUILDER
// ============================================================================

/**
 * Fluent manifest builder
 */
export class ManifestBuilder {
  private manifest: Partial<AppManifest> = {
    id: uuidv4(),
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    entities: [],
    events: [],
    uiComponents: [],
    permissions: [],
  };

  /**
   * Set basic information
   */
  name(name: string): ManifestBuilder {
    this.manifest.name = name;
    return this;
  }

  version(version: string): ManifestBuilder {
    this.manifest.version = version;
    return this;
  }

  description(description: string): ManifestBuilder {
    this.manifest.description = description;
    return this;
  }

  author(author: string): ManifestBuilder {
    this.manifest.author = author;
    return this;
  }

  /**
   * Add entity
   */
  addEntity(entity: ManifestEntity): ManifestBuilder {
    this.manifest.entities!.push(entity);
    return this;
  }

  /**
   * Add event
   */
  addEvent(event: ManifestEvent): ManifestBuilder {
    this.manifest.events!.push(event);
    return this;
  }

  /**
   * Add UI component
   */
  addUIComponent(component: ManifestUIComponent): ManifestBuilder {
    this.manifest.uiComponents!.push(component);
    return this;
  }

  /**
   * Add permission
   */
  addPermission(permission: ManifestPermission): ManifestBuilder {
    this.manifest.permissions!.push(permission);
    return this;
  }

  /**
   * Set compliance
   */
  compliance(compliance: AppManifest['compliance']): ManifestBuilder {
    this.manifest.compliance = compliance;
    return this;
  }

  /**
   * Set security
   */
  security(security: AppManifest['security']): ManifestBuilder {
    this.manifest.security = security;
    return this;
  }

  /**
   * Build manifest
   */
  build(): AppManifest {
    if (!this.manifest.name || !this.manifest.version) {
      throw new Error('Manifest must have name and version');
    }

    return this.manifest as AppManifest;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Create manifest builder
 */
export function createManifest(): ManifestBuilder {
  return new ManifestBuilder();
}

/**
 * Create entity builder
 */
export function createEntity(name: string): {
  addField: (field: ManifestField) => any;
  addIndex: (index: EntityIndex) => any;
  addConstraint: (constraint: EntityConstraint) => any;
  build: () => ManifestEntity;
} {
  const entity: ManifestEntity = {
    name,
    fields: [],
    indexes: [],
    constraints: [],
  };

  return {
    addField: (field: ManifestField) => {
      entity.fields.push(field);
      return this;
    },
    addIndex: (index: EntityIndex) => {
      entity.indexes!.push(index);
      return this;
    },
    addConstraint: (constraint: EntityConstraint) => {
      entity.constraints!.push(constraint);
      return this;
    },
    build: () => entity,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ManifestValidator, ManifestProcessor, ManifestBuilder, createManifest, createEntity };

export type {
  AppManifest,
  ManifestEntity,
  ManifestField,
  ManifestEvent,
  ManifestUIComponent,
  ManifestPermission,
  ManifestValidationResult,
  ManifestInstallResult,
  ManifestConfig,
  ValidationError,
  ValidationWarning,
  ComplianceCheck,
  SecurityCheck,
  FieldValidation,
  EntityIndex,
  EntityConstraint,
};
