import { z } from 'zod';
import { UUID, ISODate, UserID, TenantID } from '../primitives';
import {
  MetadataErrorType,
  MetadataErrorTypes,
  MetadataErrorSeverity,
  MetadataErrorSeverities,
} from './metadata.enums';

// ============================================================================
// ERROR ENUMS
// ============================================================================

export const MetadataErrorCategory = {
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  INTEGRITY: 'integrity',
  PERFORMANCE: 'performance',
  NETWORK: 'network',
  DATABASE: 'database',
  CACHE: 'cache',
  SYSTEM: 'system',
  SECURITY: 'security',
  MIGRATION: 'migration',
  CUSTOM: 'custom',
} as const;

export type MetadataErrorCategory =
  (typeof MetadataErrorCategory)[keyof typeof MetadataErrorCategory];

export const MetadataErrorRecoveryStrategy = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  DEGRADE: 'degrade',
  CIRCUIT_BREAKER: 'circuit_breaker',
  ROLLBACK: 'rollback',
  MANUAL_INTERVENTION: 'manual_intervention',
  IGNORE: 'ignore',
} as const;

export type MetadataErrorRecoveryStrategy =
  (typeof MetadataErrorRecoveryStrategy)[keyof typeof MetadataErrorRecoveryStrategy];

export const MetadataErrorContext = {
  REQUEST: 'request',
  RESPONSE: 'response',
  DATABASE: 'database',
  CACHE: 'cache',
  EVENT: 'event',
  MIGRATION: 'migration',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  SYSTEM: 'system',
} as const;

export type MetadataErrorContext = (typeof MetadataErrorContext)[keyof typeof MetadataErrorContext];

// ============================================================================
// ERROR INTERFACES
// ============================================================================

export interface MetadataError {
  id: UUID;
  type: MetadataErrorType;
  category: MetadataErrorCategory;
  severity: MetadataErrorSeverity;

  // Error details
  code: string;
  message: string;
  description?: string;

  // Context information
  context: MetadataErrorContext;
  resource?: {
    type: string;
    id?: UUID;
    name?: string;
  };

  // Error data
  data?: {
    field?: string;
    value?: any;
    expected?: any;
    actual?: any;
    constraints?: Record<string, any>;
    validation?: Record<string, any>;
  };

  // Stack trace and debugging
  stack?: string;
  cause?: Error;

  // Recovery information
  recovery: {
    strategy: MetadataErrorRecoveryStrategy;
    retryCount?: number;
    maxRetries?: number;
    retryDelay?: number;
    fallbackValue?: any;
    manualSteps?: string[];
  };

  // Metadata
  tenantId: TenantID;
  userId?: UserID;
  sessionId?: string;
  correlationId?: string;
  timestamp: ISODate;
  metadata?: Record<string, any>;
}

export interface MetadataErrorReport {
  id: UUID;
  errorId: UUID;

  // Report details
  title: string;
  summary: string;
  details: string;

  // Impact assessment
  impact: {
    severity: MetadataErrorSeverity;
    affectedUsers: number;
    affectedResources: number;
    downtime: number;
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
  };

  // Root cause analysis
  rootCause: {
    primary: string;
    secondary?: string[];
    contributingFactors: string[];
  };

  // Resolution
  resolution: {
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: UserID;
    assignedAt?: ISODate;
    resolvedAt?: ISODate;
    resolutionSteps: string[];
    verificationSteps: string[];
  };

  // Prevention
  prevention: {
    recommendations: string[];
    monitoringRules: string[];
    alertingRules: string[];
  };

  // Metadata
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
}

export interface MetadataErrorHandler {
  // Error handling
  handle(error: Error | MetadataError, context?: Record<string, any>): Promise<MetadataError>;
  handleAsync<T>(operation: () => Promise<T>, context?: Record<string, any>): Promise<T>;

  // Error recovery
  recover(error: MetadataError): Promise<{
    success: boolean;
    result?: any;
    newError?: MetadataError;
  }>;

  // Error reporting
  report(error: MetadataError): Promise<MetadataErrorReport>;

  // Error monitoring
  monitor(error: MetadataError): Promise<void>;
  alert(error: MetadataError): Promise<void>;
}

export interface MetadataErrorRecoveryManager {
  // Recovery strategies
  retry<T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      delay?: number;
      backoff?: 'fixed' | 'exponential' | 'jitter';
      condition?: (error: Error) => boolean;
    },
  ): Promise<T>;

  fallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T>;

  circuitBreaker<T>(
    operation: () => Promise<T>,
    options?: {
      failureThreshold?: number;
      recoveryTimeout?: number;
      halfOpenMaxCalls?: number;
    },
  ): Promise<T>;

  degrade<T>(operation: () => Promise<T>, degradedOperation: () => Promise<T>): Promise<T>;

  // Recovery monitoring
  getRecoveryStats(): Promise<{
    totalRecoveries: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    averageRecoveryTime: number;
    recoveryRate: number;
  }>;
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

export interface MetadataValidationError extends MetadataError {
  type: 'validation_error';
  category: 'validation';
  data: {
    field: string;
    value: any;
    expected: any;
    actual: any;
    validation: {
      rule: string;
      params: Record<string, any>;
      message: string;
    };
  };
}

export interface MetadataPermissionError extends MetadataError {
  type: 'permission_error';
  category: 'permission';
  data: {
    resource: string;
    operation: string;
    requiredPermissions: string[];
    userPermissions: string[];
    missingPermissions: string[];
  };
}

export interface MetadataNotFoundError extends MetadataError {
  type: 'not_found_error';
  category: 'not_found';
  data: {
    resource: string;
    id?: UUID;
    searchCriteria?: Record<string, any>;
  };
}

export interface MetadataConflictError extends MetadataError {
  type: 'conflict_error';
  category: 'conflict';
  data: {
    resource: string;
    conflictingField: string;
    conflictingValue: any;
    existingValue: any;
    resolution?: string;
  };
}

export interface MetadataIntegrityError extends MetadataError {
  type: 'integrity_error';
  category: 'integrity';
  data: {
    constraint: string;
    violatedFields: string[];
    relatedResources: Array<{
      type: string;
      id: UUID;
    }>;
  };
}

export interface MetadataPerformanceError extends MetadataError {
  type: 'performance_error';
  category: 'performance';
  data: {
    operation: string;
    duration: number;
    threshold: number;
    metrics: {
      memoryUsage: number;
      cpuUsage: number;
      databaseQueries: number;
      cacheHits: number;
      cacheMisses: number;
    };
  };
}

export interface MetadataDatabaseError extends MetadataError {
  type: 'database_error';
  category: 'database';
  data: {
    operation: string;
    query?: string;
    params?: Record<string, any>;
    databaseError: {
      code: string;
      message: string;
      details?: Record<string, any>;
    };
  };
}

export interface MetadataCacheError extends MetadataError {
  type: 'cache_error';
  category: 'cache';
  data: {
    operation: string;
    key: string;
    cacheType: string;
    cacheError: {
      code: string;
      message: string;
      details?: Record<string, any>;
    };
  };
}

export interface MetadataMigrationError extends MetadataError {
  type: 'migration_error';
  category: 'migration';
  data: {
    migrationId: UUID;
    version: string;
    phase: string;
    affectedRecords: number;
    migrationError: {
      code: string;
      message: string;
      details?: Record<string, any>;
    };
  };
}

// ============================================================================
// ERROR VALIDATION
// ============================================================================

export const MetadataErrorSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(MetadataErrorTypes),
  category: z.nativeEnum(MetadataErrorCategory),
  severity: z.nativeEnum(MetadataErrorSeverities),
  code: z.string().min(1),
  message: z.string().min(1),
  description: z.string().optional(),
  context: z.nativeEnum(MetadataErrorContext),
  resource: z
    .object({
      type: z.string(),
      id: z.string().uuid().optional(),
      name: z.string().optional(),
    })
    .optional(),
  data: z.record(z.any()).optional(),
  stack: z.string().optional(),
  recovery: z.object({
    strategy: z.nativeEnum(MetadataErrorRecoveryStrategy),
    retryCount: z.number().nonnegative().optional(),
    maxRetries: z.number().positive().optional(),
    retryDelay: z.number().positive().optional(),
    fallbackValue: z.any().optional(),
    manualSteps: z.array(z.string()).optional(),
  }),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export const MetadataErrorReportSchema = z.object({
  id: z.string().uuid(),
  errorId: z.string().uuid(),
  title: z.string().min(1),
  summary: z.string().min(1),
  details: z.string().min(1),
  impact: z.object({
    severity: z.nativeEnum(MetadataErrorSeverities),
    affectedUsers: z.number().nonnegative(),
    affectedResources: z.number().nonnegative(),
    downtime: z.number().nonnegative(),
    businessImpact: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  rootCause: z.object({
    primary: z.string().min(1),
    secondary: z.array(z.string()).optional(),
    contributingFactors: z.array(z.string()),
  }),
  resolution: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
    assignedTo: z.string().uuid().optional(),
    assignedAt: z.string().datetime().optional(),
    resolvedAt: z.string().datetime().optional(),
    resolutionSteps: z.array(z.string()),
    verificationSteps: z.array(z.string()),
  }),
  prevention: z.object({
    recommendations: z.array(z.string()),
    monitoringRules: z.array(z.string()),
    alertingRules: z.array(z.string()),
  }),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  isActive: z.boolean(),
});

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export class MetadataErrorUtils {
  /**
   * Creates a metadata error with default values
   */
  static createError(
    type: MetadataErrorType,
    category: MetadataErrorCategory,
    severity: MetadataErrorSeverity,
    code: string,
    message: string,
    tenantId: TenantID,
    options?: Partial<MetadataError>,
  ): MetadataError {
    return {
      id: crypto.randomUUID() as UUID,
      type,
      category,
      severity,
      code,
      message,
      context: MetadataErrorContext.REQUEST,
      recovery: {
        strategy: MetadataErrorRecoveryStrategy.RETRY,
      },
      tenantId,
      timestamp: new Date().toISOString() as ISODate,
      ...options,
    };
  }

  /**
   * Creates a validation error
   */
  static createValidationError(
    field: string,
    value: any,
    expected: any,
    actual: any,
    rule: string,
    params: Record<string, any>,
    message: string,
    tenantId: TenantID,
    options?: Partial<MetadataValidationError>,
  ): MetadataValidationError {
    return {
      id: crypto.randomUUID() as UUID,
      type: 'validation_error',
      category: 'validation',
      severity: 'medium',
      code: 'VALIDATION_ERROR',
      message,
      context: MetadataErrorContext.VALIDATION,
      data: {
        field,
        value,
        expected,
        actual,
        validation: {
          rule,
          params,
          message,
        },
      },
      recovery: {
        strategy: MetadataErrorRecoveryStrategy.FALLBACK,
      },
      tenantId,
      timestamp: new Date().toISOString() as ISODate,
      ...options,
    } as MetadataValidationError;
  }

  /**
   * Creates a permission error
   */
  static createPermissionError(
    resource: string,
    operation: string,
    requiredPermissions: string[],
    userPermissions: string[],
    tenantId: TenantID,
    options?: Partial<MetadataPermissionError>,
  ): MetadataPermissionError {
    const missingPermissions = requiredPermissions.filter((p) => !userPermissions.includes(p));

    return {
      id: crypto.randomUUID() as UUID,
      type: 'permission_error',
      category: 'permission',
      severity: 'high',
      code: 'PERMISSION_DENIED',
      message: `Access denied for operation ${operation} on resource ${resource}`,
      context: MetadataErrorContext.PERMISSION,
      data: {
        resource,
        operation,
        requiredPermissions,
        userPermissions,
        missingPermissions,
      },
      recovery: {
        strategy: MetadataErrorRecoveryStrategy.MANUAL_INTERVENTION,
        manualSteps: [
          'Review user permissions',
          'Grant required permissions',
          'Verify resource access',
        ],
      },
      tenantId,
      timestamp: new Date().toISOString() as ISODate,
      ...options,
    } as MetadataPermissionError;
  }

  /**
   * Creates a not found error
   */
  static createNotFoundError(
    resource: string,
    id?: UUID,
    searchCriteria?: Record<string, any>,
    tenantId?: TenantID,
    options?: Partial<MetadataNotFoundError>,
  ): MetadataNotFoundError {
    return {
      id: crypto.randomUUID() as UUID,
      type: 'not_found_error',
      category: 'not_found',
      severity: 'medium',
      code: 'RESOURCE_NOT_FOUND',
      message: `Resource ${resource} not found`,
      context: MetadataErrorContext.REQUEST,
      data: {
        resource,
        id,
        searchCriteria,
      },
      recovery: {
        strategy: MetadataErrorRecoveryStrategy.FALLBACK,
      },
      tenantId: tenantId || (crypto.randomUUID() as TenantID),
      timestamp: new Date().toISOString() as ISODate,
      ...options,
    } as MetadataNotFoundError;
  }

  /**
   * Creates a conflict error
   */
  static createConflictError(
    resource: string,
    conflictingField: string,
    conflictingValue: any,
    existingValue: any,
    tenantId: TenantID,
    options?: Partial<MetadataConflictError>,
  ): MetadataConflictError {
    return {
      id: crypto.randomUUID() as UUID,
      type: 'conflict_error',
      category: 'conflict',
      severity: 'medium',
      code: 'RESOURCE_CONFLICT',
      message: `Conflict detected for ${resource} field ${conflictingField}`,
      context: MetadataErrorContext.REQUEST,
      data: {
        resource,
        conflictingField,
        conflictingValue,
        existingValue,
      },
      recovery: {
        strategy: MetadataErrorRecoveryStrategy.MANUAL_INTERVENTION,
        manualSteps: ['Review conflicting data', 'Resolve conflict manually', 'Retry operation'],
      },
      tenantId,
      timestamp: new Date().toISOString() as ISODate,
      ...options,
    } as MetadataConflictError;
  }

  /**
   * Creates a performance error
   */
  static createPerformanceError(
    operation: string,
    duration: number,
    threshold: number,
    metrics: Record<string, number>,
    tenantId: TenantID,
    options?: Partial<MetadataPerformanceError>,
  ): MetadataPerformanceError {
    return {
      id: crypto.randomUUID() as UUID,
      type: 'performance_error',
      category: 'performance',
      severity: 'medium',
      code: 'PERFORMANCE_THRESHOLD_EXCEEDED',
      message: `Operation ${operation} exceeded performance threshold`,
      context: MetadataErrorContext.SYSTEM,
      data: {
        operation,
        duration,
        threshold,
        metrics,
      },
      recovery: {
        strategy: MetadataErrorRecoveryStrategy.DEGRADE,
      },
      tenantId,
      timestamp: new Date().toISOString() as ISODate,
      ...options,
    } as MetadataPerformanceError;
  }

  /**
   * Validates an error against the schema
   */
  static validateError(error: MetadataError): { valid: boolean; errors?: string[] } {
    try {
      MetadataErrorSchema.parse(error);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Determines if an error is recoverable
   */
  static isRecoverable(error: MetadataError): boolean {
    const nonRecoverableStrategies = [
      MetadataErrorRecoveryStrategy.MANUAL_INTERVENTION,
      MetadataErrorRecoveryStrategy.IGNORE,
    ];

    return !nonRecoverableStrategies.includes(error.recovery.strategy);
  }

  /**
   * Determines if an error should be retried
   */
  static shouldRetry(error: MetadataError): boolean {
    if (error.recovery.strategy !== MetadataErrorRecoveryStrategy.RETRY) {
      return false;
    }

    const retryCount = error.recovery.retryCount || 0;
    const maxRetries = error.recovery.maxRetries || 3;

    return retryCount < maxRetries;
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  static calculateRetryDelay(error: MetadataError, baseDelay: number = 1000): number {
    const retryCount = error.recovery.retryCount || 0;
    const jitter = Math.random() * 0.1; // 10% jitter

    return Math.min(baseDelay * Math.pow(2, retryCount) * (1 + jitter), 30000); // Max 30 seconds
  }

  /**
   * Formats an error for logging
   */
  static formatForLogging(error: MetadataError): string {
    return `[${error.timestamp}] ${error.severity.toUpperCase()}: ${error.code} - ${error.message} (${error.category})`;
  }

  /**
   * Formats an error for user display
   */
  static formatForUser(error: MetadataError): string {
    // Remove technical details for user-facing messages
    return error.message;
  }

  /**
   * Groups errors by category
   */
  static groupErrorsByCategory(
    errors: MetadataError[],
  ): Record<MetadataErrorCategory, MetadataError[]> {
    return errors.reduce(
      (groups, error) => {
        if (!groups[error.category]) {
          groups[error.category] = [];
        }
        groups[error.category].push(error);
        return groups;
      },
      {} as Record<MetadataErrorCategory, MetadataError[]>,
    );
  }

  /**
   * Gets error statistics
   */
  static getErrorStats(errors: MetadataError[]): {
    total: number;
    byCategory: Record<MetadataErrorCategory, number>;
    bySeverity: Record<MetadataErrorSeverity, number>;
    byType: Record<MetadataErrorType, number>;
    recoverable: number;
    nonRecoverable: number;
  } {
    const byCategory: Record<MetadataErrorCategory, number> = {};
    const bySeverity: Record<MetadataErrorSeverity, number> = {};
    const byType: Record<MetadataErrorType, number> = {};
    let recoverable = 0;
    let nonRecoverable = 0;

    errors.forEach((error) => {
      // Count by category
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;

      // Count by severity
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;

      // Count by type
      byType[error.type] = (byType[error.type] || 0) + 1;

      // Count recoverable vs non-recoverable
      if (this.isRecoverable(error)) {
        recoverable++;
      } else {
        nonRecoverable++;
      }
    });

    return {
      total: errors.length,
      byCategory,
      bySeverity,
      byType,
      recoverable,
      nonRecoverable,
    };
  }

  /**
   * Creates an error report
   */
  static createErrorReport(
    error: MetadataError,
    createdBy: UserID,
    options?: Partial<MetadataErrorReport>,
  ): MetadataErrorReport {
    return {
      id: crypto.randomUUID() as UUID,
      errorId: error.id,
      title: `${error.code}: ${error.message}`,
      summary: `Error occurred in ${error.context} context`,
      details: error.description || error.message,
      impact: {
        severity: error.severity,
        affectedUsers: 1,
        affectedResources: 1,
        downtime: 0,
        businessImpact: this.mapSeverityToBusinessImpact(error.severity),
      },
      rootCause: {
        primary: error.message,
        contributingFactors: [],
      },
      resolution: {
        status: 'open',
        resolutionSteps: [],
        verificationSteps: [],
      },
      prevention: {
        recommendations: [],
        monitoringRules: [],
        alertingRules: [],
      },
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      ...options,
    };
  }

  /**
   * Maps error severity to business impact
   */
  private static mapSeverityToBusinessImpact(
    severity: MetadataErrorSeverity,
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
        return 'high';
      case 'critical':
        return 'critical';
      default:
        return 'medium';
    }
  }

  /**
   * Serializes an error for storage/transmission
   */
  static serializeError(error: MetadataError): string {
    return JSON.stringify(error);
  }

  /**
   * Deserializes an error from storage/transmission
   */
  static deserializeError(data: string): MetadataError {
    return JSON.parse(data);
  }

  /**
   * Creates a correlation ID for error tracking
   */
  static createCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  MetadataError,
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
};

export {
  MetadataErrorCategory,
  MetadataErrorRecoveryStrategy,
  MetadataErrorContext,
  MetadataErrorSchema,
  MetadataErrorReportSchema,
  MetadataErrorUtils,
};
