/**
 * Enterprise-grade metadata enums for the AI-BOS platform
 * 
 * This module provides comprehensive enums for metadata field types,
 * validation rules, and metadata management operations.
 */

// ============================================================================
// METADATA FIELD TYPES
// ============================================================================

/**
 * Core metadata field types supported by the system
 * 
 * @example
 * ```ts
 * const fieldType: MetadataFieldType = MetadataFieldType.STRING;
 * ```
 * 
 * @remarks
 * - STRING: Text values with length constraints and pattern validation
 * - NUMBER: Numeric values (integer or float) with range validation
 * - BOOLEAN: True/false values with logical operations
 * - INTEGER: Whole numbers with precision and range constraints
 * - FLOAT: Floating-point numbers with precision control
 * - DECIMAL: Precise decimal numbers for financial calculations
 * - DATE: Date-only values (without time) with calendar support
 * - DATETIME: Date with time values and timezone handling
 * - TIME: Time-only values with format and range validation
 * - TIMESTAMP: Unix timestamps for precise time tracking
 * - DURATION: Time duration values with unit conversion
 * - ENUM: Predefined set of string values with selection constraints
 * - JSON: Structured JSON data with schema validation
 * - ARRAY: List of values with item type and count constraints
 * - OBJECT: Object structures with property validation
 * - RELATION: Reference to another entity with relationship types
 * - REFERENCE: Simple reference to another entity
 * - FOREIGN_KEY: Database foreign key with referential integrity
 * - EMAIL: Email addresses with domain and format validation
 * - URL: Web URLs with protocol and format validation
 * - PHONE: Phone numbers with country code and format support
 * - UUID: Universally unique identifiers with version validation
 * - IP_ADDRESS: IP addresses with version and range validation
 * - GEO_LOCATION: Geographic coordinates with map integration
 * - CURRENCY: Monetary values with currency and locale support
 * - PERCENTAGE: Percentage values with range and precision control
 * - BINARY: Binary data with size and encoding constraints
 * - BASE64: Base64 encoded data with validation
 * - BLOB: Binary large objects for file storage
 * - TEXT: Long text content with multiline support
 * - RICH_TEXT: Rich text with formatting and WYSIWYG editor
 * - MARKDOWN: Markdown content with preview and syntax highlighting
 * - HTML: HTML content with sanitization and validation
 * - FILE: File uploads with type and size constraints
 * - IMAGE: Image uploads with dimension and format validation
 * - DOCUMENT: Document uploads with format and security validation
 * - VIDEO: Video uploads with format and quality constraints
 * - AUDIO: Audio uploads with format and quality constraints
 * - CUSTOM: Custom field types with user-defined validation
 * - COMPUTED: Computed values with expression-based calculation
 * - VIRTUAL: Virtual properties with getter/setter methods
 */
export const MetadataFieldType = {
  // Basic types
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  INTEGER: "integer",
  FLOAT: "float",
  DECIMAL: "decimal",
  
  // Date and time types
  DATE: "date",
  DATETIME: "datetime",
  TIME: "time",
  TIMESTAMP: "timestamp",
  DURATION: "duration",
  
  // Complex types
  ENUM: "enum",
  JSON: "json",
  ARRAY: "array",
  OBJECT: "object",
  
  // Reference types
  RELATION: "relation",
  REFERENCE: "reference",
  FOREIGN_KEY: "foreign_key",
  
  // Specialized types
  EMAIL: "email",
  URL: "url",
  PHONE: "phone",
  UUID: "uuid",
  IP_ADDRESS: "ip_address",
  GEO_LOCATION: "geo_location",
  CURRENCY: "currency",
  PERCENTAGE: "percentage",
  
  // Binary types
  BINARY: "binary",
  BASE64: "base64",
  BLOB: "blob",
  
  // Text types
  TEXT: "text",
  RICH_TEXT: "rich_text",
  MARKDOWN: "markdown",
  HTML: "html",
  
  // File types
  FILE: "file",
  IMAGE: "image",
  DOCUMENT: "document",
  VIDEO: "video",
  AUDIO: "audio",
  
  // Custom types
  CUSTOM: "custom",
  COMPUTED: "computed",
  VIRTUAL: "virtual",
} as const;

export type MetadataFieldType = typeof MetadataFieldType[keyof typeof MetadataFieldType];

// ============================================================================
// METADATA VALIDATION RULES
// ============================================================================

/**
 * Validation rule types for metadata field validation
 * 
 * @example
 * ```ts
 * const validationRule: MetadataValidationRule = MetadataValidationRule.REQUIRED;
 * ```
 * 
 * @remarks
 * - REQUIRED: Field must have a value (not null, undefined, or empty)
 * - MIN_LENGTH: String must have minimum character length
 * - MAX_LENGTH: String must have maximum character length
 * - PATTERN: String must match regular expression pattern
 * - EMAIL: String must be valid email format
 * - URL: String must be valid URL format
 * - UUID: String must be valid UUID format
 * - PHONE: String must be valid phone number format
 * - MIN_VALUE: Number must be greater than or equal to minimum value
 * - MAX_VALUE: Number must be less than or equal to maximum value
 * - RANGE: Number must be within specified range
 * - POSITIVE: Number must be positive (greater than 0)
 * - NEGATIVE: Number must be negative (less than 0)
 * - INTEGER: Number must be a whole number
 * - DECIMAL_PLACES: Number must have specified decimal precision
 * - MIN_DATE: Date must be after specified minimum date
 * - MAX_DATE: Date must be before specified maximum date
 * - DATE_RANGE: Date must be within specified date range
 * - FUTURE_ONLY: Date must be in the future
 * - PAST_ONLY: Date must be in the past
 * - MIN_ITEMS: Array must have minimum number of items
 * - MAX_ITEMS: Array must have maximum number of items
 * - UNIQUE_ITEMS: Array items must be unique
 * - ITEM_TYPE: Array items must be of specified type
 * - REQUIRED_PROPERTIES: Object must have specified required properties
 * - FORBIDDEN_PROPERTIES: Object must not have specified forbidden properties
 * - PROPERTY_TYPES: Object properties must be of specified types
 * - CUSTOM_FUNCTION: Custom validation function
 * - CONDITIONAL: Conditional validation based on other fields
 * - DEPENDENT: Validation depends on other field values
 * - UNIQUE: Field value must be unique across records
 * - EXISTS: Referenced entity must exist
 * - NOT_EXISTS: Referenced entity must not exist
 * - REFERENCE_VALID: Reference must be valid and accessible
 */
export const MetadataValidationRule = {
  // String validation
  REQUIRED: "required",
  MIN_LENGTH: "min_length",
  MAX_LENGTH: "max_length",
  PATTERN: "pattern",
  EMAIL: "email",
  URL: "url",
  UUID: "uuid",
  PHONE: "phone",
  
  // Numeric validation
  MIN_VALUE: "min_value",
  MAX_VALUE: "max_value",
  RANGE: "range",
  POSITIVE: "positive",
  NEGATIVE: "negative",
  INTEGER: "integer",
  DECIMAL_PLACES: "decimal_places",
  
  // Date validation
  MIN_DATE: "min_date",
  MAX_DATE: "max_date",
  DATE_RANGE: "date_range",
  FUTURE_ONLY: "future_only",
  PAST_ONLY: "past_only",
  
  // Array validation
  MIN_ITEMS: "min_items",
  MAX_ITEMS: "max_items",
  UNIQUE_ITEMS: "unique_items",
  ITEM_TYPE: "item_type",
  
  // Object validation
  REQUIRED_PROPERTIES: "required_properties",
  FORBIDDEN_PROPERTIES: "forbidden_properties",
  PROPERTY_TYPES: "property_types",
  
  // Custom validation
  CUSTOM_FUNCTION: "custom_function",
  CONDITIONAL: "conditional",
  DEPENDENT: "dependent",
  
  // Business logic validation
  UNIQUE: "unique",
  EXISTS: "exists",
  NOT_EXISTS: "not_exists",
  REFERENCE_VALID: "reference_valid",
} as const;

export type MetadataValidationRule = typeof MetadataValidationRule[keyof typeof MetadataValidationRule];

// ============================================================================
// METADATA OPERATIONS
// ============================================================================

/**
 * Metadata operations for CRUD and schema management
 * 
 * @example
 * ```ts
 * const operation: MetadataOperation = MetadataOperation.CREATE;
 * ```
 * 
 * @remarks
 * - CREATE: Create new metadata record
 * - READ: Read existing metadata record
 * - UPDATE: Update existing metadata record
 * - DELETE: Delete metadata record
 * - ADD_FIELD: Add new field to schema
 * - REMOVE_FIELD: Remove field from schema
 * - MODIFY_FIELD: Modify existing field configuration
 * - RENAME_FIELD: Rename field while preserving data
 * - CREATE_SCHEMA: Create new metadata schema
 * - UPDATE_SCHEMA: Update existing schema configuration
 * - DELETE_SCHEMA: Delete schema and all associated data
 * - VALIDATE_SCHEMA: Validate schema configuration
 * - MIGRATE: Migrate schema to new version
 * - ROLLBACK: Rollback schema to previous version
 * - VALIDATE_MIGRATION: Validate migration configuration
 * - IMPORT: Import metadata from external source
 * - EXPORT: Export metadata to external format
 * - BACKUP: Create backup of metadata
 * - RESTORE: Restore metadata from backup
 */
export const MetadataOperation = {
  // CRUD operations
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  
  // Field operations
  ADD_FIELD: "add_field",
  REMOVE_FIELD: "remove_field",
  MODIFY_FIELD: "modify_field",
  RENAME_FIELD: "rename_field",
  
  // Schema operations
  CREATE_SCHEMA: "create_schema",
  UPDATE_SCHEMA: "update_schema",
  DELETE_SCHEMA: "delete_schema",
  VALIDATE_SCHEMA: "validate_schema",
  
  // Migration operations
  MIGRATE: "migrate",
  ROLLBACK: "rollback",
  VALIDATE_MIGRATION: "validate_migration",
  
  // Import/Export operations
  IMPORT: "import",
  EXPORT: "export",
  BACKUP: "backup",
  RESTORE: "restore",
} as const;

export type MetadataOperation = typeof MetadataOperation[keyof typeof MetadataOperation];

// ============================================================================
// METADATA PERMISSIONS
// ============================================================================

/**
 * Metadata permissions for access control and security
 * 
 * @example
 * ```ts
 * const permission: MetadataPermission = MetadataPermission.VIEW_SCHEMA;
 * ```
 * 
 * @remarks
 * - VIEW_SCHEMA: View schema definition and configuration
 * - CREATE_SCHEMA: Create new metadata schemas
 * - MODIFY_SCHEMA: Modify existing schema configuration
 * - DELETE_SCHEMA: Delete schemas and associated data
 * - VIEW_FIELDS: View field definitions and configurations
 * - CREATE_FIELDS: Create new fields in schemas
 * - MODIFY_FIELDS: Modify existing field configurations
 * - DELETE_FIELDS: Remove fields from schemas
 * - VIEW_DATA: View metadata records and values
 * - CREATE_DATA: Create new metadata records
 * - MODIFY_DATA: Update existing metadata records
 * - DELETE_DATA: Delete metadata records
 * - VIEW_VALIDATION: View validation rules and configurations
 * - CREATE_VALIDATION: Create new validation rules
 * - MODIFY_VALIDATION: Modify existing validation rules
 * - DELETE_VALIDATION: Remove validation rules
 * - MANAGE_METADATA: Full metadata management permissions
 * - MANAGE_PERMISSIONS: Manage user permissions and roles
 * - MANAGE_VERSIONS: Manage schema versions and migrations
 */
export const MetadataPermission = {
  // Schema permissions
  VIEW_SCHEMA: "view_schema",
  CREATE_SCHEMA: "create_schema",
  MODIFY_SCHEMA: "modify_schema",
  DELETE_SCHEMA: "delete_schema",
  
  // Field permissions
  VIEW_FIELDS: "view_fields",
  CREATE_FIELDS: "create_fields",
  MODIFY_FIELDS: "modify_fields",
  DELETE_FIELDS: "delete_fields",
  
  // Data permissions
  VIEW_DATA: "view_data",
  CREATE_DATA: "create_data",
  MODIFY_DATA: "modify_data",
  DELETE_DATA: "delete_data",
  
  // Validation permissions
  VIEW_VALIDATION: "view_validation",
  CREATE_VALIDATION: "create_validation",
  MODIFY_VALIDATION: "modify_validation",
  DELETE_VALIDATION: "delete_validation",
  
  // Admin permissions
  MANAGE_METADATA: "manage_metadata",
  MANAGE_PERMISSIONS: "manage_permissions",
  MANAGE_VERSIONS: "manage_versions",
} as const;

export type MetadataPermission = typeof MetadataPermission[keyof typeof MetadataPermission];

// ============================================================================
// METADATA STATUS
// ============================================================================

/**
 * Metadata status for lifecycle and workflow management
 * 
 * @example
 * ```ts
 * const status: MetadataStatus = MetadataStatus.ACTIVE;
 * ```
 * 
 * @remarks
 * - DRAFT: Initial draft state, not yet active
 * - ACTIVE: Currently active and in use
 * - INACTIVE: Temporarily disabled but preserved
 * - DEPRECATED: Marked for removal, still functional
 * - ARCHIVED: Permanently stored but not accessible
 * - VALID: Passed validation checks
 * - INVALID: Failed validation checks
 * - PENDING_VALIDATION: Awaiting validation
 * - VALIDATION_ERROR: Error occurred during validation
 * - CURRENT: Latest version in use
 * - OUTDATED: Newer version available
 * - PENDING_UPDATE: Update in progress
 * - MIGRATION_REQUIRED: Schema migration needed
 * - SYNCED: Synchronized with external systems
 * - OUT_OF_SYNC: Not synchronized with external systems
 * - SYNCING: Synchronization in progress
 * - SYNC_ERROR: Error occurred during synchronization
 */
export const MetadataStatus = {
  // Lifecycle status
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
  DEPRECATED: "deprecated",
  ARCHIVED: "archived",
  
  // Validation status
  VALID: "valid",
  INVALID: "invalid",
  PENDING_VALIDATION: "pending_validation",
  VALIDATION_ERROR: "validation_error",
  
  // Version status
  CURRENT: "current",
  OUTDATED: "outdated",
  PENDING_UPDATE: "pending_update",
  MIGRATION_REQUIRED: "migration_required",
  
  // Sync status
  SYNCED: "synced",
  OUT_OF_SYNC: "out_of_sync",
  SYNCING: "syncing",
  SYNC_ERROR: "sync_error",
} as const;

export type MetadataStatus = typeof MetadataStatus[keyof typeof MetadataStatus];

// ============================================================================
// METADATA SOURCES
// ============================================================================

/**
 * Metadata sources for tracking origin and ownership
 * 
 * @example
 * ```ts
 * const source: MetadataSource = MetadataSource.USER_DEFINED;
 * ```
 * 
 * @remarks
 * - SYSTEM: Built-in system metadata
 * - BUILT_IN: Pre-configured system defaults
 * - DEFAULT: Default values and configurations
 * - USER_DEFINED: Created by end users
 * - CUSTOM: Custom implementations and extensions
 * - TEMPLATE: Based on predefined templates
 * - IMPORTED: Imported from external sources
 * - API: Created via API integration
 * - INTEGRATION: Generated by system integrations
 * - PLUGIN: Created by third-party plugins
 * - COMPUTED: Automatically computed values
 * - DERIVED: Derived from other metadata
 * - INFERRED: Automatically inferred from data
 * - AUTO_GENERATED: System-generated metadata
 */
export const MetadataSource = {
  // System sources
  SYSTEM: "system",
  BUILT_IN: "built_in",
  DEFAULT: "default",
  
  // User sources
  USER_DEFINED: "user_defined",
  CUSTOM: "custom",
  TEMPLATE: "template",
  
  // External sources
  IMPORTED: "imported",
  API: "api",
  INTEGRATION: "integration",
  PLUGIN: "plugin",
  
  // Generated sources
  COMPUTED: "computed",
  DERIVED: "derived",
  INFERRED: "inferred",
  AUTO_GENERATED: "auto_generated",
} as const;

export type MetadataSource = typeof MetadataSource[keyof typeof MetadataSource];

// ============================================================================
// METADATA CATEGORIES
// ============================================================================

/**
 * Metadata categories for organization and classification
 * 
 * @example
 * ```ts
 * const category: MetadataCategory = MetadataCategory.BUSINESS;
 * ```
 * 
 * @remarks
 * - CORE: Essential system metadata
 * - SYSTEM: System-level configurations and settings
 * - USER: User-specific metadata and preferences
 * - BUSINESS: Business logic and domain-specific metadata
 * - FINANCIAL: Financial data and calculations
 * - OPERATIONAL: Operational and process metadata
 * - ANALYTICAL: Analytics and reporting metadata
 * - TECHNICAL: Technical implementation details
 * - SECURITY: Security and access control metadata
 * - PERFORMANCE: Performance monitoring and optimization
 * - MONITORING: System monitoring and alerting
 * - CONTENT: Content management and media metadata
 * - MEDIA: Media files and assets
 * - DOCUMENT: Document management and processing
 * - ASSET: Digital assets and resources
 * - RELATIONSHIP: Entity relationships and connections
 * - HIERARCHY: Hierarchical data structures
 * - NETWORK: Network and connectivity metadata
 * - GRAPH: Graph-based data relationships
 */
export const MetadataCategory = {
  // Core categories
  CORE: "core",
  SYSTEM: "system",
  USER: "user",
  
  // Business categories
  BUSINESS: "business",
  FINANCIAL: "financial",
  OPERATIONAL: "operational",
  ANALYTICAL: "analytical",
  
  // Technical categories
  TECHNICAL: "technical",
  SECURITY: "security",
  PERFORMANCE: "performance",
  MONITORING: "monitoring",
  
  // Content categories
  CONTENT: "content",
  MEDIA: "media",
  DOCUMENT: "document",
  ASSET: "asset",
  
  // Relationship categories
  RELATIONSHIP: "relationship",
  HIERARCHY: "hierarchy",
  NETWORK: "network",
  GRAPH: "graph",
} as const;

export type MetadataCategory = typeof MetadataCategory[keyof typeof MetadataCategory];

// ============================================================================
// METADATA ENCRYPTION
// ============================================================================

/**
 * Metadata encryption levels for data security
 * 
 * @example
 * ```ts
 * const encryptionLevel: MetadataEncryptionLevel = MetadataEncryptionLevel.STANDARD;
 * ```
 * 
 * @remarks
 * - NONE: No encryption applied
 * - BASIC: Basic encryption (AES-128)
 * - STANDARD: Standard encryption (AES-256)
 * - HIGH: High security encryption (AES-256-GCM)
 * - ENTERPRISE: Enterprise-grade encryption with key rotation
 * - MILITARY: Military-grade encryption (FIPS 140-2 compliant)
 */
export const MetadataEncryptionLevel = {
  NONE: "none",
  BASIC: "basic",
  STANDARD: "standard",
  HIGH: "high",
  ENTERPRISE: "enterprise",
  MILITARY: "military",
} as const;

export type MetadataEncryptionLevel = typeof MetadataEncryptionLevel[keyof typeof MetadataEncryptionLevel];

// ============================================================================
// METADATA COMPRESSION
// ============================================================================

/**
 * Enum representing metadata compression types
 */
export enum MetadataCompressionType {
  NONE = "none",
  GZIP = "gzip",
  BROTLI = "brotli",
  LZ4 = "lz4",
  ZSTD = "zstd",
  CUSTOM = "custom",
}

// ============================================================================
// METADATA INDEXING
// ============================================================================

/**
 * Enum representing metadata indexing types
 */
export enum MetadataIndexType {
  NONE = "none",
  BTREE = "btree",
  HASH = "hash",
  FULLTEXT = "fulltext",
  SPATIAL = "spatial",
  COMPOSITE = "composite",
  UNIQUE = "unique",
  PARTIAL = "partial",
}

// ============================================================================
// METADATA CACHING
// ============================================================================

/**
 * Enum representing metadata caching strategies
 */
export enum MetadataCacheStrategy {
  NONE = "none",
  MEMORY = "memory",
  REDIS = "redis",
  DATABASE = "database",
  CDN = "cdn",
  HYBRID = "hybrid",
}

// ============================================================================
// METADATA VERSIONING
// ============================================================================

/**
 * Enum representing metadata versioning strategies
 */
export enum MetadataVersioningStrategy {
  NONE = "none",
  TIMESTAMP = "timestamp",
  SEQUENTIAL = "sequential",
  SEMANTIC = "semantic",
  BRANCHED = "branched",
  IMMUTABLE = "immutable",
}

// ============================================================================
// METADATA AUDIT
// ============================================================================

/**
 * Enum representing metadata audit events
 */
export enum MetadataAuditEvent {
  // CRUD events
  CREATED = "created",
  READ = "read",
  UPDATED = "updated",
  DELETED = "deleted",
  
  // Schema events
  SCHEMA_CREATED = "schema_created",
  SCHEMA_UPDATED = "schema_updated",
  SCHEMA_DELETED = "schema_deleted",
  
  // Field events
  FIELD_ADDED = "field_added",
  FIELD_MODIFIED = "field_modified",
  FIELD_REMOVED = "field_removed",
  
  // Validation events
  VALIDATION_PASSED = "validation_passed",
  VALIDATION_FAILED = "validation_failed",
  VALIDATION_RULE_ADDED = "validation_rule_added",
  VALIDATION_RULE_REMOVED = "validation_rule_removed",
  
  // Permission events
  PERMISSION_GRANTED = "permission_granted",
  PERMISSION_REVOKED = "permission_revoked",
  ROLE_ASSIGNED = "role_assigned",
  ROLE_REMOVED = "role_removed",
  
  // Migration events
  MIGRATION_STARTED = "migration_started",
  MIGRATION_COMPLETED = "migration_completed",
  MIGRATION_FAILED = "migration_failed",
  ROLLBACK_STARTED = "rollback_started",
  ROLLBACK_COMPLETED = "rollback_completed",
}

// ============================================================================
// METADATA ERROR TYPES
// ============================================================================

/**
 * Enum representing metadata error types
 */
export enum MetadataErrorType {
  // Validation errors
  VALIDATION_ERROR = "validation_error",
  REQUIRED_FIELD_MISSING = "required_field_missing",
  INVALID_FIELD_TYPE = "invalid_field_type",
  FIELD_VALUE_OUT_OF_RANGE = "field_value_out_of_range",
  FIELD_PATTERN_MISMATCH = "field_pattern_mismatch",
  
  // Schema errors
  SCHEMA_ERROR = "schema_error",
  SCHEMA_NOT_FOUND = "schema_not_found",
  SCHEMA_ALREADY_EXISTS = "schema_already_exists",
  SCHEMA_INVALID = "schema_invalid",
  
  // Permission errors
  PERMISSION_ERROR = "permission_error",
  INSUFFICIENT_PERMISSIONS = "insufficient_permissions",
  ACCESS_DENIED = "access_denied",
  UNAUTHORIZED = "unauthorized",
  
  // Data errors
  DATA_ERROR = "data_error",
  DATA_NOT_FOUND = "data_not_found",
  DATA_ALREADY_EXISTS = "data_already_exists",
  DATA_CORRUPTED = "data_corrupted",
  
  // System errors
  SYSTEM_ERROR = "system_error",
  DATABASE_ERROR = "database_error",
  NETWORK_ERROR = "network_error",
  TIMEOUT_ERROR = "timeout_error",
  
  // Migration errors
  MIGRATION_ERROR = "migration_error",
  MIGRATION_FAILED = "migration_failed",
  ROLLBACK_FAILED = "rollback_failed",
  VERSION_CONFLICT = "version_conflict",
} 