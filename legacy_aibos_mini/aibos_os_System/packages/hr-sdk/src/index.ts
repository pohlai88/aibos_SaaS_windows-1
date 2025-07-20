// HR SDK - exports all HR-related services

// Export HR services
export * from './services/shrm-service';

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
  CacheEntry,
  ServiceResponse
} from '@aibos/core-types'; 