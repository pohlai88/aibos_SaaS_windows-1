// Core accounting types shared across all accounting services

export interface UserContext {
  userId: string;
  orgId: string;
  fiscalYear: number;
  permissions: string[];
  timezone?: string;
  currency?: string;
}

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
};

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: number;
  operationCount: number;
  errorCount: number;
  successRate: number;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface AccountingError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  errors?: AccountingError[];
  warnings?: ValidationWarning[];
  metadata?: {
    page?: number;
    total?: number;
    limit?: number;
    timestamp: number;
  };
} 