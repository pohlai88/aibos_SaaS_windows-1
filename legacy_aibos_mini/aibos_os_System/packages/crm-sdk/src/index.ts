// CRM SDK - exports all CRM-related services

// Export CRM services
export * from './services/customer-service';
export * from './services/crm-lead-service';
export * from './services/crm-pipeline-service';
export * from './services/crm-activity-service';
export * from './services/crm-marketing-service';
export * from './services/crm-analytics-service';

// Re-export core types for convenience
export type {
  UserContext,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PerformanceMetrics,
  AuditAction,
  ApprovalStatus,
  AccountingError,
  CacheEntry
} from '@aibos/core-types'; 