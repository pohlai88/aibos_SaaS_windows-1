/**
 * AI-BOS Entity Management System
 *
 * Enterprise-grade entity CRUD operations, relationships, validation, and real-time sync
 * for the AI-BOS micro-app platform.
 */

import { v4 as uuidv4 } from 'uuid';
import type { EventBus } from './events';
import { EventEnvelope } from './events';
import { logger } from './logger';
import { monitoring } from './monitoring';
import { cache } from './cache';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Entity instance with metadata
 */
export interface EntityInstance<T = any> {
  id: string;
  type: string;
  tenantId: string;
  data: T;
  metadata: EntityMetadata;
  version: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

/**
 * Entity metadata
 */
export interface EntityMetadata {
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  tags?: Record<string, string>;
  audit?: AuditTrail[];
  permissions?: EntityPermission[];
  relationships?: EntityRelationship[];
}

/**
 * Audit trail entry
 */
export interface AuditTrail {
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'restore';
  userId?: string;
  changes?: Record<string, { from: any; to: any }>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Entity permission
 */
export interface EntityPermission {
  userId: string;
  permissions: string[];
  grantedAt: number;
  grantedBy: string;
  expiresAt?: number;
}

/**
 * Entity relationship
 */
export interface EntityRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetEntity: string;
  targetId: string;
  field: string;
  metadata?: Record<string, any>;
}

/**
 * Entity query filter
 */
export interface EntityFilter {
  type?: string;
  tenantId?: string;
  tags?: Record<string, string>;
  data?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: {
    from?: number;
    to?: number;
  };
  updatedAt?: {
    from?: number;
    to?: number;
  };
  deletedAt?: {
    from?: number;
    to?: number;
  } | null;
}

/**
 * Entity query options
 */
export interface EntityQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
  includeMetadata?: boolean;
  includeRelationships?: boolean;
  cache?: boolean;
  timeout?: number;
}

/**
 * Entity query result
 */
export interface EntityQueryResult<T = any> {
  entities: EntityInstance<T>[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

/**
 * Entity operation result
 */
export interface EntityOperationResult<T = any> {
  success: boolean;
  entity?: EntityInstance<T>;
  error?: string;
  warnings?: string[];
  auditTrail?: AuditTrail;
}

/**
 * Entity validation result
 */
export interface EntityValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'critical';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Entity schema definition
 */
export interface EntitySchema {
  name: string;
  fields: EntityField[];
  indexes?: EntityIndex[];
  constraints?: EntityConstraint[];
  validation?: EntityValidation;
  hooks?: EntityHooks;
  permissions?: EntityPermissions;
}

/**
 * Entity field definition
 */
export interface EntityField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'reference';
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  validation?: FieldValidation[];
  description?: string;
  pii?: boolean;
  encrypted?: boolean;
  indexed?: boolean;
  reference?: {
    entity: string;
    field: string;
  };
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
    entity: string;
    field: string;
  };
  expression?: string;
}

/**
 * Entity validation rules
 */
export interface EntityValidation {
  rules?: Record<string, any>;
  custom?: (data: any) => EntityValidationResult;
}

/**
 * Entity lifecycle hooks
 */
export interface EntityHooks {
  beforeCreate?: (data: any, context: EntityContext) => Promise<any>;
  afterCreate?: (entity: EntityInstance, context: EntityContext) => Promise<void>;
  beforeUpdate?: (entity: EntityInstance, changes: any, context: EntityContext) => Promise<any>;
  afterUpdate?: (entity: EntityInstance, context: EntityContext) => Promise<void>;
  beforeDelete?: (entity: EntityInstance, context: EntityContext) => Promise<boolean>;
  afterDelete?: (entity: EntityInstance, context: EntityContext) => Promise<void>;
  beforeRestore?: (entity: EntityInstance, context: EntityContext) => Promise<boolean>;
  afterRestore?: (entity: EntityInstance, context: EntityContext) => Promise<void>;
}

/**
 * Entity permissions configuration
 */
export interface EntityPermissions {
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
  restore?: string[];
  custom?: Record<string, string[]>;
}

/**
 * Entity operation context
 */
export interface EntityContext {
  userId?: string;
  tenantId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Entity manager configuration
 */
export interface EntityManagerConfig {
  enableCaching: boolean;
  enableAudit: boolean;
  enableValidation: boolean;
  enableRelationships: boolean;
  maxQueryLimit: number;
  defaultTimeout: number;
  cacheTTL: number;
  auditRetention: number;
}

// ============================================================================
// ENTITY VALIDATOR
// ============================================================================

/**
 * Entity validator with comprehensive validation rules
 */
export class EntityValidator {
  private schemas: Map<string, EntitySchema> = new Map();

  /**
   * Register entity schema
   */
  registerSchema(schema: EntitySchema): void {
    this.schemas.set(schema.name, schema);
    logger.info('Entity schema registered', { name: schema.name });
  }

  /**
   * Validate entity data
   */
  validate(entityType: string, data: any, context: EntityContext): EntityValidationResult {
    const schema = this.schemas.get(entityType);
    if (!schema) {
      return {
        valid: false,
        errors: [
          {
            field: 'type',
            message: `Unknown entity type: ${entityType}`,
            code: 'UNKNOWN_ENTITY_TYPE',
            severity: 'error',
          },
        ],
        warnings: [],
      };
    }

    const result: EntityValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Validate required fields
    for (const field of schema.fields) {
      if (field.required && (data[field.name] === undefined || data[field.name] === null)) {
        result.errors.push({
          field: field.name,
          message: `Field '${field.name}' is required`,
          code: 'REQUIRED_FIELD_MISSING',
          severity: 'error',
        });
        result.valid = false;
      }
    }

    // Validate field types and constraints
    for (const field of schema.fields) {
      if (data[field.name] !== undefined && data[field.name] !== null) {
        const fieldValidation = this.validateField(field, data[field.name], data);
        result.errors.push(...fieldValidation.errors);
        result.warnings.push(...fieldValidation.warnings);
      }
    }

    // Run custom validation
    if (schema.validation?.custom) {
      try {
        const customResult = schema.validation.custom(data);
        result.errors.push(...customResult.errors);
        result.warnings.push(...customResult.warnings);
        result.valid = result.valid && customResult.valid;
      } catch (error) {
        result.errors.push({
          field: 'custom',
          message: `Custom validation failed: ${(error as Error).message}`,
          code: 'CUSTOM_VALIDATION_ERROR',
          severity: 'error',
        });
        result.valid = false;
      }
    }

    return result;
  }

  /**
   * Validate individual field
   */
  private validateField(field: EntityField, value: any, data: any): EntityValidationResult {
    const result: EntityValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Type validation
    const typeValid = this.validateFieldType(field.type, value);
    if (!typeValid) {
      result.errors.push({
        field: field.name,
        message: `Field '${field.name}' must be of type '${field.type}'`,
        code: 'INVALID_FIELD_TYPE',
        severity: 'error',
      });
      result.valid = false;
    }

    // Custom validation rules
    if (field.validation) {
      for (const rule of field.validation) {
        const ruleResult = this.validateFieldRule(field, rule, value, data);
        if (!ruleResult.valid) {
          result.errors.push(...ruleResult.errors);
          result.warnings.push(...ruleResult.warnings);
          result.valid = false;
        }
      }
    }

    return result;
  }

  /**
   * Validate field type
   */
  private validateFieldType(type: string, value: any): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case 'object':
        return typeof value === 'object' && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'reference':
        return typeof value === 'string' || typeof value === 'number';
      default:
        return true;
    }
  }

  /**
   * Validate field rule
   */
  private validateFieldRule(
    field: EntityField,
    rule: any,
    value: any,
    data: any,
  ): EntityValidationResult {
    const result: EntityValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    switch (rule.type) {
      case 'min':
        if (typeof value === 'string' && value.length < rule.value) {
          result.errors.push({
            field: field.name,
            message: `Field '${field.name}' must be at least ${rule.value} characters long`,
            code: 'MIN_LENGTH_VIOLATION',
            severity: 'error',
          });
          result.valid = false;
        }
        break;

      case 'max':
        if (typeof value === 'string' && value.length > rule.value) {
          result.errors.push({
            field: field.name,
            message: `Field '${field.name}' must be at most ${rule.value} characters long`,
            code: 'MAX_LENGTH_VIOLATION',
            severity: 'error',
          });
          result.valid = false;
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          result.errors.push({
            field: field.name,
            message: `Field '${field.name}' does not match required pattern`,
            code: 'PATTERN_VIOLATION',
            severity: 'error',
          });
          result.valid = false;
        }
        break;

      case 'email':
        if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          result.errors.push({
            field: field.name,
            message: `Field '${field.name}' must be a valid email address`,
            code: 'INVALID_EMAIL',
            severity: 'error',
          });
          result.valid = false;
        }
        break;

      case 'url':
        if (typeof value === 'string' && !/^https?:\/\/.+/.test(value)) {
          result.errors.push({
            field: field.name,
            message: `Field '${field.name}' must be a valid URL`,
            code: 'INVALID_URL',
            severity: 'error',
          });
          result.valid = false;
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          result.errors.push({
            field: field.name,
            message: rule.message || `Field '${field.name}' failed custom validation`,
            code: 'CUSTOM_VALIDATION_FAILED',
            severity: 'error',
          });
          result.valid = false;
        }
        break;
    }

    return result;
  }

  /**
   * Get entity schema
   */
  getSchema(entityType: string): EntitySchema | undefined {
    return this.schemas.get(entityType);
  }

  /**
   * Get all schemas
   */
  getAllSchemas(): EntitySchema[] {
    return Array.from(this.schemas.values());
  }
}

// ============================================================================
// ENTITY MANAGER
// ============================================================================

/**
 * Entity manager for CRUD operations and lifecycle management
 */
export class EntityManager {
  private config: EntityManagerConfig;
  private validator: EntityValidator;
  private eventBus: EventBus;
  private entities = new Map<string, EntityInstance>();
  private schemas = new Map<string, EntitySchema>();

  constructor(config: EntityManagerConfig, validator: EntityValidator, eventBus: EventBus) {
    this.config = config;
    this.validator = validator;
    this.eventBus = eventBus;
  }

  /**
   * Register entity schema
   */
  registerSchema(schema: EntitySchema): void {
    this.schemas.set(schema.name, schema);
    this.validator.registerSchema(schema);
    logger.info('Entity schema registered with manager', { name: schema.name });
  }

  /**
   * Create entity
   */
  async create<T>(
    entityType: string,
    data: T,
    context: EntityContext,
  ): Promise<EntityOperationResult<T>> {
    const startTime = Date.now();

    try {
      // Validate entity type
      const schema = this.schemas.get(entityType);
      if (!schema) {
        return {
          success: false,
          error: `Unknown entity type: ${entityType}`,
        };
      }

      // Validate data
      if (this.config.enableValidation) {
        const validation = this.validator.validate(entityType, data, context);
        if (!validation.valid) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
            warnings: validation.warnings.map((w) => w.message),
          };
        }
      }

      // Run before hook
      let processedData = data;
      if (schema.hooks?.beforeCreate) {
        processedData = await schema.hooks.beforeCreate(data, context);
      }

      // Create entity instance
      const entity: EntityInstance<T> = {
        id: uuidv4(),
        type: entityType,
        tenantId: context.tenantId,
        data: processedData,
        metadata: {
          createdBy: context.userId,
          tags: {},
          audit: [],
          permissions: [],
          relationships: [],
        },
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add audit trail
      if (this.config.enableAudit) {
        entity.metadata.audit!.push({
          timestamp: Date.now(),
          action: 'create',
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }

      // Store entity
      this.entities.set(entity.id, entity);

      // Cache entity
      if (this.config.enableCaching) {
        await cache.set(`entity:${entity.id}`, entity, this.config.cacheTTL);
      }

      // Emit event
      await this.eventBus.emit(
        'EntityCreated',
        {
          entityId: entity.id,
          entityType: entity.type,
          data: entity.data,
          tenantId: entity.tenantId,
        },
        {
          tenantId: context.tenantId,
          userId: context.userId,
          correlationId: entity.id,
        },
      );

      // Run after hook
      if (schema.hooks?.afterCreate) {
        await schema.hooks.afterCreate(entity, context);
      }

      const latency = Date.now() - startTime;
      monitoring.recordCustomMetric('entity_create_latency', latency, {
        entityType,
        tenantId: context.tenantId,
      });

      logger.info('Entity created successfully', {
        entityId: entity.id,
        entityType,
        tenantId: context.tenantId,
        latency,
      });

      return {
        success: true,
        entity,
        auditTrail: entity.metadata.audit?.[0],
      };
    } catch (error) {
      logger.error('Entity creation failed', {
        entityType,
        tenantId: context.tenantId,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get entity by ID
   */
  async get<T>(entityId: string, context: EntityContext): Promise<EntityOperationResult<T>> {
    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cached = await cache.get<EntityInstance<T>>(`entity:${entityId}`);
        if (cached) {
          return { success: true, entity: cached };
        }
      }

      // Get from storage
      const entity = this.entities.get(entityId) as EntityInstance<T>;
      if (!entity) {
        return {
          success: false,
          error: `Entity not found: ${entityId}`,
        };
      }

      // Check permissions
      if (!this.hasPermission(entity, 'read', context)) {
        return {
          success: false,
          error: 'Insufficient permissions to read entity',
        };
      }

      // Cache entity
      if (this.config.enableCaching) {
        await cache.set(`entity:${entityId}`, entity, this.config.cacheTTL);
      }

      return { success: true, entity };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Update entity
   */
  async update<T>(
    entityId: string,
    changes: Partial<T>,
    context: EntityContext,
  ): Promise<EntityOperationResult<T>> {
    const startTime = Date.now();

    try {
      // Get existing entity
      const existing = this.entities.get(entityId) as EntityInstance<T>;
      if (!existing) {
        return {
          success: false,
          error: `Entity not found: ${entityId}`,
        };
      }

      // Check permissions
      if (!this.hasPermission(existing, 'update', context)) {
        return {
          success: false,
          error: 'Insufficient permissions to update entity',
        };
      }

      // Get schema
      const schema = this.schemas.get(existing.type);
      if (!schema) {
        return {
          success: false,
          error: `Schema not found for entity type: ${existing.type}`,
        };
      }

      // Run before hook
      let processedChanges = changes;
      if (schema.hooks?.beforeUpdate) {
        processedChanges = await schema.hooks.beforeUpdate(existing, changes, context);
      }

      // Validate changes
      if (this.config.enableValidation) {
        const updatedData = { ...existing.data, ...processedChanges };
        const validation = this.validator.validate(existing.type, updatedData, context);
        if (!validation.valid) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
            warnings: validation.warnings.map((w) => w.message),
          };
        }
      }

      // Create updated entity
      const updatedEntity: EntityInstance<T> = {
        ...existing,
        data: { ...existing.data, ...processedChanges },
        version: existing.version + 1,
        updatedAt: Date.now(),
        metadata: {
          ...existing.metadata,
          updatedBy: context.userId,
        },
      };

      // Add audit trail
      if (this.config.enableAudit) {
        const auditEntry: AuditTrail = {
          timestamp: Date.now(),
          action: 'update',
          userId: context.userId,
          changes: this.calculateChanges(existing.data, updatedEntity.data),
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        };
        updatedEntity.metadata.audit!.push(auditEntry);
      }

      // Store updated entity
      this.entities.set(entityId, updatedEntity);

      // Update cache
      if (this.config.enableCaching) {
        await cache.set(`entity:${entityId}`, updatedEntity, this.config.cacheTTL);
      }

      // Emit event
      await this.eventBus.emit(
        'EntityUpdated',
        {
          entityId: updatedEntity.id,
          entityType: updatedEntity.type,
          changes: processedChanges,
          tenantId: updatedEntity.tenantId,
        },
        {
          tenantId: context.tenantId,
          userId: context.userId,
          correlationId: entityId,
        },
      );

      // Run after hook
      if (schema.hooks?.afterUpdate) {
        await schema.hooks.afterUpdate(updatedEntity, context);
      }

      const latency = Date.now() - startTime;
      monitoring.recordCustomMetric('entity_update_latency', latency, {
        entityType: existing.type,
        tenantId: context.tenantId,
      });

      logger.info('Entity updated successfully', {
        entityId,
        entityType: existing.type,
        tenantId: context.tenantId,
        latency,
      });

      return {
        success: true,
        entity: updatedEntity,
        auditTrail: updatedEntity.metadata.audit?.[updatedEntity.metadata.audit.length - 1],
      };
    } catch (error) {
      logger.error('Entity update failed', {
        entityId,
        tenantId: context.tenantId,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Delete entity
   */
  async delete(entityId: string, context: EntityContext): Promise<EntityOperationResult> {
    const startTime = Date.now();

    try {
      // Get existing entity
      const existing = this.entities.get(entityId);
      if (!existing) {
        return {
          success: false,
          error: `Entity not found: ${entityId}`,
        };
      }

      // Check permissions
      if (!this.hasPermission(existing, 'delete', context)) {
        return {
          success: false,
          error: 'Insufficient permissions to delete entity',
        };
      }

      // Get schema
      const schema = this.schemas.get(existing.type);
      if (!schema) {
        return {
          success: false,
          error: `Schema not found for entity type: ${existing.type}`,
        };
      }

      // Run before hook
      if (schema.hooks?.beforeDelete) {
        const shouldDelete = await schema.hooks.beforeDelete(existing, context);
        if (!shouldDelete) {
          return {
            success: false,
            error: 'Delete operation cancelled by hook',
          };
        }
      }

      // Soft delete
      const deletedEntity = {
        ...existing,
        deletedAt: Date.now(),
        metadata: {
          ...existing.metadata,
          deletedBy: context.userId,
        },
      };

      // Add audit trail
      if (this.config.enableAudit) {
        const auditEntry: AuditTrail = {
          timestamp: Date.now(),
          action: 'delete',
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        };
        deletedEntity.metadata.audit!.push(auditEntry);
      }

      // Store deleted entity
      this.entities.set(entityId, deletedEntity);

      // Update cache
      if (this.config.enableCaching) {
        await cache.set(`entity:${entityId}`, deletedEntity, this.config.cacheTTL);
      }

      // Emit event
      await this.eventBus.emit(
        'EntityDeleted',
        {
          entityId: deletedEntity.id,
          entityType: deletedEntity.type,
          tenantId: deletedEntity.tenantId,
        },
        {
          tenantId: context.tenantId,
          userId: context.userId,
          correlationId: entityId,
        },
      );

      // Run after hook
      if (schema.hooks?.afterDelete) {
        await schema.hooks.afterDelete(deletedEntity, context);
      }

      const latency = Date.now() - startTime;
      monitoring.recordCustomMetric('entity_delete_latency', latency, {
        entityType: existing.type,
        tenantId: context.tenantId,
      });

      logger.info('Entity deleted successfully', {
        entityId,
        entityType: existing.type,
        tenantId: context.tenantId,
        latency,
      });

      return {
        success: true,
        auditTrail: deletedEntity.metadata.audit?.[deletedEntity.metadata.audit.length - 1],
      };
    } catch (error) {
      logger.error('Entity deletion failed', {
        entityId,
        tenantId: context.tenantId,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Query entities
   */
  async query<T>(
    filter: EntityFilter,
    options: EntityQueryOptions = {},
  ): Promise<EntityQueryResult<T>> {
    const startTime = Date.now();

    try {
      let entities = Array.from(this.entities.values()) as EntityInstance<T>[];

      // Apply filters
      entities = this.applyFilters(entities, filter);

      // Apply sorting
      if (options.sortBy) {
        entities.sort((a, b) => {
          const aValue = this.getNestedValue(a, options.sortBy!);
          const bValue = this.getNestedValue(b, options.sortBy!);

          if (options.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      const total = entities.length;
      const limit = options.limit || this.config.maxQueryLimit;
      const offset = options.offset || 0;

      entities = entities.slice(offset, offset + limit);

      // Remove metadata if not requested
      if (!options.includeMetadata) {
        entities = entities.map((entity) => ({
          ...entity,
          metadata: {
            ...entity.metadata,
            audit: undefined,
            permissions: undefined,
          },
        }));
      }

      const latency = Date.now() - startTime;
      monitoring.recordCustomMetric('entity_query_latency', latency, {
        filterType: Object.keys(filter).join(','),
        resultCount: entities.length,
      });

      return {
        entities,
        total,
        hasMore: offset + limit < total,
        cursor: offset + limit < total ? (offset + limit).toString() : undefined,
      };
    } catch (error) {
      logger.error('Entity query failed', {
        filter,
        options,
        error: (error as Error).message,
      });

      return {
        entities: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Apply filters to entities
   */
  private applyFilters<T>(
    entities: EntityInstance<T>[],
    filter: EntityFilter,
  ): EntityInstance<T>[] {
    return entities.filter((entity) => {
      // Type filter
      if (filter.type && entity.type !== filter.type) return false;

      // Tenant filter
      if (filter.tenantId && entity.tenantId !== filter.tenantId) return false;

      // Tags filter
      if (filter.tags) {
        for (const [key, value] of Object.entries(filter.tags)) {
          if (entity.metadata.tags?.[key] !== value) return false;
        }
      }

      // Data filter
      if (filter.data) {
        for (const [key, value] of Object.entries(filter.data)) {
          if (this.getNestedValue(entity.data, key) !== value) return false;
        }
      }

      // Created by filter
      if (filter.createdBy && entity.metadata.createdBy !== filter.createdBy) return false;

      // Updated by filter
      if (filter.updatedBy && entity.metadata.updatedBy !== filter.updatedBy) return false;

      // Date range filters
      if (filter.createdAt) {
        if (filter.createdAt.from && entity.createdAt < filter.createdAt.from) return false;
        if (filter.createdAt.to && entity.createdAt > filter.createdAt.to) return false;
      }

      if (filter.updatedAt) {
        if (filter.updatedAt.from && entity.updatedAt < filter.updatedAt.from) return false;
        if (filter.updatedAt.to && entity.updatedAt > filter.updatedAt.to) return false;
      }

      if (filter.deletedAt === null) {
        if (entity.deletedAt) return false;
      } else if (filter.deletedAt) {
        if (
          filter.deletedAt.from &&
          (!entity.deletedAt || entity.deletedAt < filter.deletedAt.from)
        )
          return false;
        if (filter.deletedAt.to && (!entity.deletedAt || entity.deletedAt > filter.deletedAt.to))
          return false;
      }

      return true;
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate changes between two objects
   */
  private calculateChanges(oldData: any, newData: any): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};

    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key],
        };
      }
    }

    return changes;
  }

  /**
   * Check entity permissions
   */
  private hasPermission(entity: EntityInstance, action: string, context: EntityContext): boolean {
    // TODO: Implement proper permission checking
    // For now, allow all operations
    return true;
  }

  /**
   * Get entity statistics
   */
  getStats(): {
    totalEntities: number;
    entitiesByType: Record<string, number>;
    entitiesByTenant: Record<string, number>;
  } {
    const stats = {
      totalEntities: this.entities.size,
      entitiesByType: {} as Record<string, number>,
      entitiesByTenant: {} as Record<string, number>,
    };

    for (const entity of this.entities.values()) {
      stats.entitiesByType[entity.type] = (stats.entitiesByType[entity.type] || 0) + 1;
      stats.entitiesByTenant[entity.tenantId] = (stats.entitiesByTenant[entity.tenantId] || 0) + 1;
    }

    return stats;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Create entity filter builder
 */
export function createEntityFilter(): {
  type: (type: string) => any;
  tenant: (tenantId: string) => any;
  tag: (key: string, value: string) => any;
  tags: (tags: Record<string, string>) => any;
  data: (key: string, value: any) => any;
  createdBy: (userId: string) => any;
  updatedBy: (userId: string) => any;
  createdAt: (from?: number, to?: number) => any;
  updatedAt: (from?: number, to?: number) => any;
  deletedAt: (from?: number, to?: number) => any;
  notDeleted: () => any;
  build: () => EntityFilter;
} {
  const filter: EntityFilter = {};

  return {
    type: (type: string) => {
      filter.type = type;
      return this;
    },
    tenant: (tenantId: string) => {
      filter.tenantId = tenantId;
      return this;
    },
    tag: (key: string, value: string) => {
      if (!filter.tags) filter.tags = {};
      filter.tags[key] = value;
      return this;
    },
    tags: (tags: Record<string, string>) => {
      filter.tags = { ...filter.tags, ...tags };
      return this;
    },
    data: (key: string, value: any) => {
      if (!filter.data) filter.data = {};
      filter.data[key] = value;
      return this;
    },
    createdBy: (userId: string) => {
      filter.createdBy = userId;
      return this;
    },
    updatedBy: (userId: string) => {
      filter.updatedBy = userId;
      return this;
    },
    createdAt: (from?: number, to?: number) => {
      filter.createdAt = { from, to };
      return this;
    },
    updatedAt: (from?: number, to?: number) => {
      filter.updatedAt = { from, to };
      return this;
    },
    deletedAt: (from?: number, to?: number) => {
      filter.deletedAt = { from, to };
      return this;
    },
    notDeleted: () => {
      filter.deletedAt = null;
      return this;
    },
    build: () => filter,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already defined above as individual exports

export type {
  EntityInstance,
  EntityMetadata,
  EntityFilter,
  EntityQueryOptions,
  EntityQueryResult,
  EntityOperationResult,
  EntityValidationResult,
  EntitySchema,
  EntityField,
  EntityIndex,
  EntityConstraint,
  EntityValidation,
  EntityHooks,
  EntityPermissions,
  EntityContext,
  EntityManagerConfig,
  AuditTrail,
  EntityPermission,
  EntityRelationship,
  ValidationError,
  ValidationWarning,
};
