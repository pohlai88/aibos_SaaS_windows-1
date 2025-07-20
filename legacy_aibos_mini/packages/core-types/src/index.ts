// Core types package - exports all shared types across AIBOS SDKs

// Export all types from each module
export * from './accounting';
export * from './errors';
export * from './business';
export * from './auth';
export * from './crm-types';

// Re-export commonly used types for convenience
export type {
  ApiError, 
  ValidationError, 
  AccountingError, 
  ValidationResult,
  ServiceResponse,
  PerformanceMetrics,
  AuditActionType,
  ApprovalStatusType,
  ValidationWarning,
  CacheEntry
} from './errors';

export type {
  UserContext
} from './business';

export type {
  PurchaseOrder,
  WorkflowStep,
  ComplianceRequirement,
  ContractTerms,
  ProcurementItem
} from './business';

// Re-export constants
export {
  AuditAction,
  ApprovalStatus
} from './errors'; 