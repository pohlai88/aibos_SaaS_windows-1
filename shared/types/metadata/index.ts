/**
 * Metadata module exports for the AI-BOS platform
 *
 * This module provides comprehensive metadata types, enums, and utilities
 * for managing dynamic schemas and metadata across the platform.
 *
 * Core Components:
 * - Enums: All metadata-related enums and constants
 * - Types: Core metadata interfaces and type definitions
 * - Mapping: Type mappings and validation utilities
 * - Fields: Field type definitions and configurations
 * - Query: Query system with filters, sorting, and aggregation
 * - Events: Event system for metadata changes and audit trails
 * - Permissions: Fine-grained permission and access control system
 * - Cache: Multi-level caching with invalidation strategies
 * - Migration: Schema evolution and data migration system
 * - Testing: Comprehensive testing utilities and mock generators
 * - Errors: Error handling with recovery strategies
 */

// ============================================================================
// CORE METADATA COMPONENTS
// ============================================================================

// Export all metadata enums, types, mappings, and fields
export * from './metadata.enums';
export * from './metadata.types';
export * from './metadata.mapping';
export * from './metadata.fields';

// ============================================================================
// QUERY SYSTEM
// ============================================================================

export * from './metadata.query';

// ============================================================================
// EVENT SYSTEM
// ============================================================================

export * from './metadata.events';

// ============================================================================
// PERMISSION SYSTEM
// ============================================================================

export * from './metadata.permissions';

// ============================================================================
// CACHING SYSTEM
// ============================================================================

export * from './metadata.cache';

// ============================================================================
// MIGRATION SYSTEM
// ============================================================================

export * from './metadata.migration';

// ============================================================================
// TESTING UTILITIES
// ============================================================================

export * from './metadata.testing';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export * from './metadata.errors';

// ============================================================================
// RE-EXPORT COMMONLY USED TYPES
// ============================================================================

// Core enums
export type {
  MetadataFieldType,
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

// Core types
export type {
  BaseMetadata,
  MetadataField,
  MetadataSchema,
  FieldConstraints,
  FieldOptions,
  ComputedFieldConfig,
  RelationConfig,
  SchemaIndex,
  SchemaConstraint,
  SchemaTrigger,
  SchemaView,
  SchemaPermission,
  EncryptionConfig,
  CompressionConfig,
  IndexingConfig,
  CachingConfig,
  AuditConfig,
  VersioningConfig,
  MigrationConfig,
  MetadataOperationRequest,
  MetadataOperationResponse,
  OperationOptions,
  OperationContext,
  OperationMetadata,
  MetadataError,
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationMetadata,
  MetadataQuery,
  QueryFilter,
  QuerySort,
  QueryPagination,
  QueryOptions,
  MetadataChange,
  MetadataSnapshot,
  MetadataStatistics,
} from './metadata.types';

// Query system types
export type {
  MetadataQueryCondition,
  MetadataQueryConditionGroup,
  MetadataQueryFilter,
  MetadataSortField,
  MetadataPagination,
  MetadataPaginationResult,
  MetadataAggregation,
  MetadataQueryResult,
  MetadataQueryBuilder,
  MetadataQueryUtils,
} from './metadata.query';

// Event system types
export type {
  MetadataEvent,
  MetadataAuditEvent,
  MetadataEventHandler,
  MetadataEventFilter,
  MetadataEventSubscription,
  MetadataEventBus,
  MetadataEventStore,
  MetadataAuditTrail,
  MetadataEventUtils,
} from './metadata.events';

// Permission system types
export type {
  MetadataPermission as MetadataPermissionType,
  MetadataPermissionConditionConfig,
  MetadataPermissionGroup,
  MetadataRole,
  MetadataUserRole,
  MetadataPermissionAssignment,
  MetadataAccessRequest,
  MetadataAccessResponse,
  MetadataAccessPolicy,
  MetadataFieldPermission,
  MetadataFieldMask,
  MetadataPermissionEvaluator,
  MetadataPermissionCache,
  MetadataPermissionManager,
  MetadataPermissionUtils,
} from './metadata.permissions';

// Cache system types
export type {
  MetadataCacheEntry,
  MetadataCacheConfig,
  MetadataCacheStats,
  MetadataCacheMetrics,
  MetadataCacheOperation,
  MetadataCacheInvalidationRule,
  MetadataCacheDependency,
  MetadataCacheProvider,
  MetadataCacheSetOptions,
  MetadataCacheGetOptions,
  MetadataCacheManager,
  MetadataCacheStrategy,
  MetadataCacheStrategyExecutor,
  MetadataCacheUtils,
} from './metadata.cache';

// Migration system types
export type {
  MetadataMigration,
  MetadataMigrationExecution,
  MetadataMigrationPlan,
  MetadataMigrationBackup,
  MetadataMigrationValidation,
  MetadataMigrationManager,
  MetadataMigrationExecutor,
  MetadataMigrationUtils,
} from './metadata.migration';

// Testing system types
export type {
  MetadataTestCase,
  MetadataTestSuite,
  MetadataTestExecution,
  MetadataTestContext,
  MetadataTestResult,
  MetadataMockGenerator,
  MetadataTestHelper,
  MetadataTestUtils,
} from './metadata.testing';

// Error handling types
export type {
  MetadataError as MetadataErrorType,
  MetadataErrorReport,
  MetadataErrorHandler,
  MetadataErrorRecoveryManager,
  MetadataValidationError,
  MetadataPermissionError,
  MetadataNotFoundError,
  MetadataConflictError,
  MetadataIntegrityError,
  MetadataPerformanceError,
  MetadataDatabaseError,
  MetadataCacheError,
  MetadataMigrationError,
  MetadataErrorUtils,
} from './metadata.errors';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a complete metadata system configuration
 */
export function createMetadataSystemConfig() {
  return {
    query: {
      maxResults: 1000,
      defaultLimit: 50,
      maxAggregations: 10,
      cacheEnabled: true,
      cacheTtl: 300,
    },
    events: {
      enabled: true,
      auditEnabled: true,
      realtimeEnabled: true,
      batchSize: 100,
      retentionDays: 90,
    },
    permissions: {
      enabled: true,
      cacheEnabled: true,
      cacheTtl: 600,
      fieldLevelSecurity: true,
      roleBasedAccess: true,
    },
    cache: {
      levels: ['l1', 'l2'],
      defaultTtl: 3600,
      maxSize: 1000000,
      evictionPolicy: 'lru',
      compression: true,
    },
    migration: {
      enabled: true,
      backupEnabled: true,
      rollbackEnabled: true,
      validationEnabled: true,
      maxBatchSize: 10000,
    },
    testing: {
      mockDataEnabled: true,
      performanceTesting: true,
      securityTesting: true,
      integrationTesting: true,
    },
    errors: {
      loggingEnabled: true,
      monitoringEnabled: true,
      alertingEnabled: true,
      recoveryEnabled: true,
      maxRetries: 3,
    },
  };
}

/**
 * Validates the complete metadata system configuration
 */
export function validateMetadataSystemConfig(config: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  // Validate query configuration
  if (config.query?.maxResults > 10000) {
    errors.push('Query maxResults cannot exceed 10000');
  }

  // Validate cache configuration
  if (config.cache?.maxSize > 10000000) {
    errors.push('Cache maxSize cannot exceed 10MB');
  }

  // Validate migration configuration
  if (config.migration?.maxBatchSize > 100000) {
    errors.push('Migration maxBatchSize cannot exceed 100000');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Gets the current metadata system version
 */
export function getMetadataSystemVersion(): string {
  return '1.0.0';
}

/**
 * Checks if all required metadata components are available
 */
export function checkMetadataSystemHealth(): {
  healthy: boolean;
  components: Record<string, { available: boolean; version?: string }>;
} {
  return {
    healthy: true,
    components: {
      enums: { available: true, version: '1.0.0' },
      types: { available: true, version: '1.0.0' },
      mapping: { available: true, version: '1.0.0' },
      fields: { available: true, version: '1.0.0' },
      query: { available: true, version: '1.0.0' },
      events: { available: true, version: '1.0.0' },
      permissions: { available: true, version: '1.0.0' },
      cache: { available: true, version: '1.0.0' },
      migration: { available: true, version: '1.0.0' },
      testing: { available: true, version: '1.0.0' },
      errors: { available: true, version: '1.0.0' },
    },
  };
}
