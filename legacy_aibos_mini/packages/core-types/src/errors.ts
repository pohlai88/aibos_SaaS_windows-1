// Unified error types for all packages

export interface ApiError {
  code: string;
  message: string;
  timestamp: Date;
  correlationId?: string;
}

export interface ValidationError extends ApiError {
  field?: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
  autoCorrectable?: boolean;
  // Legacy field support
  validation_level?: string;
  rule_id?: string;
}

export interface ValidationWarning extends ApiError {
  field?: string;
  severity: 'warning';
  suggestedFix?: string;
}

export interface AccountingError extends ApiError {
  accountCode?: string;
  transactionId?: string;
  ruleId?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AccountingWarning extends ApiError {
  accountCode?: string;
  transactionId?: string;
  ruleId?: string;
  // Legacy field support
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  success?: boolean; // Legacy compatibility
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validatedAt: Date;
  ruleId?: string;
  rule_id?: string; // Legacy compatibility
  ruleName?: string;
  rule_name?: string; // Legacy compatibility
  status?: 'passed' | 'failed' | 'partial';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  suggestedFix?: string;
  autoCorrectable?: boolean;
  validation_level?: string; // Legacy compatibility
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  errors: ApiError[];
  warnings: ValidationWarning[];
  metadata?: {
    timestamp: Date;
    processingTime?: number;
    cacheHit?: boolean;
    [key: string]: any;
  };
}

export interface PerformanceMetrics {
  startTime: Date;
  endTime: Date;
  end_time?: Date; // Legacy compatibility
  duration: number;
  memoryUsage: number;
  cpuUsage?: number;
  cacheHitRate?: number;
  operationName?: string;
  operation_name?: string; // Legacy compatibility
  // Extended metrics for specific services
  calculationTimeMs?: number;
  validationTimeMs?: number;
  validation_time_ms?: number; // Legacy compatibility
  externalApiTimeMs?: number;
  rulesEvaluated?: number;
  generationTimeMs?: number;
  generation_time_ms?: number; // Legacy compatibility
  average_processing_time?: number; // Legacy compatibility
  query_execution_time_ms?: number; // Legacy compatibility
  peak_processing_time?: number; // Legacy compatibility
  overall_status?: string; // Legacy compatibility
}

export const AuditAction = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  APPROVE: 'approve',
  REJECT: 'reject',
  GENERATE: 'generate',
  GENERATED: 'generated', // Legacy compatibility
  CALCULATE: 'calculate',
  VALIDATE: 'validate',
  EXPORT: 'export',
  IMPORT: 'import',
  PUBLISH: 'publish', // Legacy compatibility
  CALCULATION_REQUESTED: 'calculation_requested',
  CALCULATION_COMPLETED: 'calculation_completed',
  AUTO_APPROVED: 'auto_approved'
} as const;

export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  AUTO_APPROVED: 'auto_approved',
  UNDER_REVIEW: 'under_review',
  ESCALATED: 'escalated'
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];
export type ApprovalStatusType = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  hits: number;
  lastAccessed: Date;
} 