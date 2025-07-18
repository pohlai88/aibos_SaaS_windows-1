/**
 * Enterprise-grade metadata types for the AI-BOS platform
 *
 * This module provides comprehensive type definitions for metadata
 * management, including schemas, fields, validation rules, and operations.
 */

import type { MetadataFieldType,
  MetadataValidationRule,
  MetadataOperation,
  MetadataPermission,
  MetadataStatus,
  MetadataSource,
  MetadataCategory,
  MetadataEncryptionLevel,
  MetadataCompressionType,
  MetadataIndexType,
  MetadataCacheStrategy,
  MetadataVersioningStrategy,
  MetadataAuditEvent,
  MetadataErrorType,
 } from './metadata.enums';
import type { UUID, Email, ISODate, JsonObject, JsonValue } from '../primitives';

// ============================================================================
// CORE METADATA TYPES
// ============================================================================

/**
 * Base metadata interface with common properties
 */
export interface BaseMetadata {
  id: UUID;
  name: string;
  description?: string;
  version: string;
  status: MetadataStatus;
  source: MetadataSource;
  category: MetadataCategory;
  createdAt: ISODate;
  updatedAt: ISODate;
  createdBy: UUID;
  updatedBy: UUID;
  tenantId?: UUID;
  tags?: string[];
  metadata?: JsonObject;
}

/**
 * Metadata field definition
 */
export interface MetadataField extends Partial<BaseMetadata> {
  type?: MetadataFieldType; // Made optional for inheritance
  key: string;
  displayName: string;
  isRequired: boolean;
  isUnique: boolean;
  isIndexed: boolean;
  isSearchable: boolean;
  defaultValue?: JsonValue;
  validationRules?: MetadataValidationRule[];
  constraints?: FieldConstraints;
  options?: FieldOptions;
  computed?: ComputedFieldConfig;
  relation?: RelationConfig;
  encryption?: EncryptionConfig;
  compression?: CompressionConfig;
  indexing?: IndexingConfig;
  caching?: CachingConfig;
}

/**
 * Metadata schema definition
 */
export interface MetadataSchema extends Partial<BaseMetadata> {
  fields: MetadataField[];
  primaryKey: string;
  indexes?: SchemaIndex[];
  constraints?: SchemaConstraint[];
  triggers?: SchemaTrigger[];
  views?: SchemaView[];
  permissions?: SchemaPermission[];
  audit?: AuditConfig;
  versioning?: VersioningConfig;
  migration?: MigrationConfig;
}

// ============================================================================
// FIELD CONFIGURATION TYPES
// ============================================================================

/**
 * Field constraints configuration
 */
export interface FieldConstraints {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  enum?: string[];
  format?: string;
  precision?: number;
  scale?: number;
  timezone?: string;
  locale?: string;
  currency?: string;
  unit?: string;
  custom?: JsonObject;
}

/**
 * Field options configuration
 */
export interface FieldOptions {
  isReadOnly?: boolean;
  isHidden?: boolean;
  isDeprecated?: boolean;
  isExperimental?: boolean;
  isInternal?: boolean;
  isSensitive?: boolean;
  isComputed?: boolean;
  isVirtual?: boolean;
  isTransient?: boolean;
  isNullable?: boolean;
  isOptional?: boolean;
  isImmutable?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  isFilterable?: boolean;
  isExportable?: boolean;
  isImportable?: boolean;
  isAuditable?: boolean;
  isVersioned?: boolean;
  isEncrypted?: boolean;
  isCompressed?: boolean;
  isIndexed?: boolean;
  isCached?: boolean;
  displayOrder?: number;
  displayFormat?: string;
  displayWidth?: number;
  displayHeight?: number;
  displayType?: string;
  displayOptions?: JsonObject;
  validationMessage?: string;
  helpText?: string;
  placeholder?: string;
  tooltip?: string;
  examples?: string[];
  documentation?: string;
  deprecationNotice?: string;
  migrationPath?: string;
  custom?: JsonObject;
}

/**
 * Computed field configuration
 */
export interface ComputedFieldConfig {
  expression: string;
  language: 'javascript' | 'sql' | 'formula' | 'custom';
  dependencies: string[];
  isAsync: boolean;
  cacheDuration?: number;
  errorHandling?: 'strict' | 'lenient' | 'custom';
  validation?: string;
  documentation?: string;
}

/**
 * Relation configuration
 */
export interface RelationConfig {
  targetSchema: string;
  targetField: string;
  type?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'; // Made optional for inheritance
  cascade: 'none' | 'cascade' | 'set-null' | 'restrict';
  onDelete: 'cascade' | 'set-null' | 'restrict' | 'no-action';
  onUpdate: 'cascade' | 'set-null' | 'restrict' | 'no-action';
  foreignKey?: string;
  joinTable?: string;
  joinColumn?: string;
  inverseField?: string;
  lazy?: boolean;
  eager?: boolean;
  fetch?: 'select' | 'join' | 'subselect';
}

// ============================================================================
// SCHEMA CONFIGURATION TYPES
// ============================================================================

/**
 * Schema index configuration
 */
export interface SchemaIndex {
  name: string;
  fields: string[];
  type?: MetadataIndexType; // Made optional for inheritance
  isUnique: boolean;
  isPartial: boolean;
  where?: string;
  include?: string[];
  exclude?: string[];
  options?: JsonObject;
}

/**
 * Schema constraint configuration
 */
export interface SchemaConstraint {
  name: string;
  type?: 'check' | 'unique' | 'foreign-key' | 'not-null' | 'default'; // Made optional for inheritance
  fields?: string[];
  expression?: string;
  reference?: {
    table: string;
    field: string;
  };
  options?: JsonObject;
}

/**
 * Schema trigger configuration
 */
export interface SchemaTrigger {
  name: string;
  event: 'insert' | 'update' | 'delete' | 'truncate';
  timing: 'before' | 'after' | 'instead-of';
  function: string;
  condition?: string;
  options?: JsonObject;
}

/**
 * Schema view configuration
 */
export interface SchemaView {
  name: string;
  query: string;
  isMaterialized: boolean;
  refreshStrategy?: 'manual' | 'automatic' | 'incremental';
  refreshInterval?: number;
  options?: JsonObject;
}

/**
 * Schema permission configuration
 */
export interface SchemaPermission {
  role: string;
  permissions: MetadataPermission[];
  conditions?: string;
  fields?: string[];
  options?: JsonObject;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  level: MetadataEncryptionLevel;
  algorithm?: string;
  keyId?: string;
  keyRotation?: number;
  options?: JsonObject;
}

/**
 * Compression configuration
 */
export interface CompressionConfig {
  type?: MetadataCompressionType; // Made optional for inheritance
  level?: number;
  threshold?: number;
  options?: JsonObject;
}

/**
 * Indexing configuration
 */
export interface IndexingConfig {
  type?: MetadataIndexType; // Made optional for inheritance
  isUnique: boolean;
  isPartial: boolean;
  where?: string;
  include?: string[];
  exclude?: string[];
  options?: JsonObject;
}

/**
 * Caching configuration
 */
export interface CachingConfig {
  strategy: MetadataCacheStrategy;
  duration?: number;
  key?: string;
  tags?: string[];
  options?: JsonObject;
}

/**
 * Audit configuration
 */
export interface AuditConfig {
  enabled: boolean;
  events: MetadataAuditEvent[];
  fields?: string[];
  retention?: number;
  storage?: 'database' | 'file' | 'external';
  options?: JsonObject;
}

/**
 * Versioning configuration
 */
export interface VersioningConfig {
  strategy: MetadataVersioningStrategy;
  enabled: boolean;
  maxVersions?: number;
  retention?: number;
  autoCleanup?: boolean;
  options?: JsonObject;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  enabled: boolean;
  autoMigrate: boolean;
  validateBeforeMigrate: boolean;
  backupBeforeMigrate: boolean;
  rollbackOnError: boolean;
  timeout?: number;
  options?: JsonObject;
}

// ============================================================================
// OPERATION TYPES
// ============================================================================

/**
 * Metadata operation request
 */
export interface MetadataOperationRequest {
  operation: MetadataOperation;
  schemaId?: UUID;
  fieldId?: UUID;
  data?: JsonObject;
  options?: OperationOptions;
  context?: OperationContext;
}

/**
 * Metadata operation response
 */
export interface MetadataOperationResponse {
  success: boolean;
  data?: JsonObject;
  error?: MetadataError;
  warnings?: string[];
  metadata?: OperationMetadata;
}

/**
 * Operation options
 */
export interface OperationOptions {
  validate?: boolean;
  audit?: boolean;
  version?: boolean;
  migrate?: boolean;
  backup?: boolean;
  timeout?: number;
  retry?: number;
  custom?: JsonObject;
}

/**
 * Operation context
 */
export interface OperationContext {
  userId: UUID;
  sessionId?: UUID;
  requestId?: UUID;
  tenantId?: UUID;
  environment?: string;
  timestamp: ISODate;
  ipAddress?: string;
  userAgent?: string;
  custom?: JsonObject;
}

/**
 * Operation metadata
 */
export interface OperationMetadata {
  operationId: UUID;
  duration: number;
  timestamp: ISODate;
  version: string;
  checksum?: string;
  custom?: JsonObject;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Metadata error
 */
export interface MetadataError {
  type?: MetadataErrorType; // Made optional for inheritance
  code?: string; // Made optional for inheritance
  message?: string; // Made optional for inheritance
  field?: string;
  value?: JsonValue;
  details?: JsonObject;
  stack?: string;
  timestamp: ISODate;
  context?: JsonObject;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation rule definition
 */
export interface ValidationRule {
  type?: MetadataValidationRule; // Made optional for inheritance
  value?: JsonValue;
  message?: string;
  options?: JsonObject;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: ValidationMetadata;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  rule: MetadataValidationRule;
  message?: string; // Made optional for inheritance
  value?: JsonValue;
  expected?: JsonValue;
  actual?: JsonValue;
  path?: string[];
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message?: string; // Made optional for inheritance
  suggestion?: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Validation metadata
 */
export interface ValidationMetadata {
  duration: number;
  timestamp: ISODate;
  validator: string;
  version: string;
  custom?: JsonObject;
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Metadata query
 */
export interface MetadataQuery {
  schema?: string;
  fields?: string[];
  filters?: QueryFilter[];
  sort?: QuerySort[];
  pagination?: QueryPagination;
  options?: QueryOptions;
}

/**
 * Query filter
 */
export interface QueryFilter {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'like'
    | 'ilike'
    | 'regex'
    | 'exists'
    | 'between';
  value: JsonValue;
  options?: JsonObject;
}

/**
 * Query sort
 */
export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
  nulls?: 'first' | 'last';
}

/**
 * Query pagination
 */
export interface QueryPagination {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Query options
 */
export interface QueryOptions {
  includeDeleted?: boolean;
  includeArchived?: boolean;
  includeMetadata?: boolean;
  cache?: boolean;
  timeout?: number;
  custom?: JsonObject;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Metadata change record
 */
export interface MetadataChange {
  id: UUID;
  schemaId: UUID;
  fieldId?: UUID;
  operation: MetadataOperation;
  previousValue?: JsonValue;
  newValue?: JsonValue;
  timestamp: ISODate;
  userId: UUID;
  metadata?: JsonObject;
}

/**
 * Metadata snapshot
 */
export interface MetadataSnapshot {
  id: UUID;
  schemaId: UUID;
  version: string;
  data: JsonObject;
  timestamp: ISODate;
  checksum: string;
  metadata?: JsonObject;
}

/**
 * Metadata statistics
 */
export interface MetadataStatistics {
  totalSchemas: number;
  totalFields: number;
  activeSchemas: number;
  activeFields: number;
  deprecatedSchemas: number;
  deprecatedFields: number;
  lastUpdated: ISODate;
  custom?: JsonObject;
}
