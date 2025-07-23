/**
 * AI-BOS Error Handling Types
 *
 * World-class error handling system with comprehensive error types,
 * error codes, and error management utilities.
 */

// ==================== ERROR SEVERITY LEVELS ====================

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ==================== ERROR CATEGORIES ====================

export enum ErrorCategory {
  // System Errors
  SYSTEM = 'system',
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',

  // Application Errors
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  INTEGRATION = 'integration',
  EXTERNAL_SERVICE = 'external_service',

  // User Errors
  USER_INPUT = 'user_input',
  USER_PERMISSION = 'user_permission',
  USER_SESSION = 'user_session',

  // AI/ML Errors
  AI_MODEL = 'ai_model',
  AI_PROCESSING = 'ai_processing',
  AI_TRAINING = 'ai_training',

  // Performance Errors
  PERFORMANCE = 'performance',
  MEMORY = 'memory',
  TIMEOUT = 'timeout',

  // Security Errors
  SECURITY = 'security',
  ENCRYPTION = 'encryption',
  SANITIZATION = 'sanitization'
}

// ==================== ERROR CODES ====================

export enum ErrorCode {
  // System Errors (1000-1999)
  SYSTEM_INITIALIZATION_FAILED = 1000,
  SYSTEM_SHUTDOWN_FAILED = 1001,
  SYSTEM_CONFIGURATION_INVALID = 1002,
  SYSTEM_RESOURCE_UNAVAILABLE = 1003,
  SYSTEM_MAINTENANCE_MODE = 1004,

  // Network Errors (2000-2999)
  NETWORK_CONNECTION_FAILED = 2000,
  NETWORK_TIMEOUT = 2001,
  NETWORK_UNREACHABLE = 2002,
  NETWORK_RATE_LIMITED = 2003,
  NETWORK_DNS_FAILURE = 2004,

  // Database Errors (3000-3999)
  DATABASE_CONNECTION_FAILED = 3000,
  DATABASE_QUERY_FAILED = 3001,
  DATABASE_TRANSACTION_FAILED = 3002,
  DATABASE_CONSTRAINT_VIOLATION = 3003,
  DATABASE_DEADLOCK = 3004,
  DATABASE_MIGRATION_FAILED = 3005,

  // Authentication Errors (4000-4999)
  AUTH_INVALID_CREDENTIALS = 4000,
  AUTH_TOKEN_EXPIRED = 4001,
  AUTH_TOKEN_INVALID = 4002,
  AUTH_TOKEN_MISSING = 4003,
  AUTH_SESSION_EXPIRED = 4004,
  AUTH_ACCOUNT_LOCKED = 4005,
  AUTH_ACCOUNT_DISABLED = 4006,
  AUTH_MFA_REQUIRED = 4007,
  AUTH_MFA_INVALID = 4008,

  // Authorization Errors (5000-5999)
  AUTHZ_INSUFFICIENT_PERMISSIONS = 5000,
  AUTHZ_RESOURCE_ACCESS_DENIED = 5001,
  AUTHZ_ROLE_REQUIRED = 5002,
  AUTHZ_OPERATION_NOT_ALLOWED = 5003,

  // Validation Errors (6000-6999)
  VALIDATION_REQUIRED_FIELD_MISSING = 6000,
  VALIDATION_INVALID_FORMAT = 6001,
  VALIDATION_VALUE_TOO_LONG = 6002,
  VALIDATION_VALUE_TOO_SHORT = 6003,
  VALIDATION_VALUE_OUT_OF_RANGE = 6004,
  VALIDATION_INVALID_EMAIL = 6005,
  VALIDATION_INVALID_URL = 6006,
  VALIDATION_INVALID_PHONE = 6007,
  VALIDATION_INVALID_DATE = 6008,
  VALIDATION_INVALID_JSON = 6009,

  // Business Logic Errors (7000-7999)
  BUSINESS_ENTITY_NOT_FOUND = 7000,
  BUSINESS_ENTITY_ALREADY_EXISTS = 7001,
  BUSINESS_INVALID_STATE = 7002,
  BUSINESS_OPERATION_NOT_ALLOWED = 7003,
  BUSINESS_QUOTA_EXCEEDED = 7004,
  BUSINESS_LIMIT_REACHED = 7005,

  // Integration Errors (8000-8999)
  INTEGRATION_API_FAILED = 8000,
  INTEGRATION_WEBHOOK_FAILED = 8001,
  INTEGRATION_OAUTH_FAILED = 8002,
  INTEGRATION_WEBHOOK_TIMEOUT = 8003,
  INTEGRATION_RATE_LIMITED = 8004,

  // External Service Errors (9000-9999)
  EXTERNAL_SERVICE_UNAVAILABLE = 9000,
  EXTERNAL_SERVICE_TIMEOUT = 9001,
  EXTERNAL_SERVICE_ERROR = 9002,
  EXTERNAL_SERVICE_AUTH_FAILED = 9003,
  EXTERNAL_SERVICE_RATE_LIMITED = 9004,

  // User Input Errors (10000-10999)
  USER_INPUT_INVALID = 10000,
  USER_INPUT_TOO_LARGE = 10001,
  USER_INPUT_UNSUPPORTED_FORMAT = 10002,
  USER_INPUT_MALICIOUS = 10003,

  // AI/ML Errors (11000-11999)
  AI_MODEL_LOAD_FAILED = 11000,
  AI_MODEL_PREDICTION_FAILED = 11001,
  AI_MODEL_TRAINING_FAILED = 11002,
  AI_MODEL_INVALID_INPUT = 11003,
  AI_MODEL_OUT_OF_MEMORY = 11004,
  AI_PROCESSING_TIMEOUT = 11005,
  AI_PROCESSING_QUEUE_FULL = 11006,

  // Performance Errors (12000-12999)
  PERFORMANCE_TIMEOUT = 12000,
  PERFORMANCE_MEMORY_EXHAUSTED = 12001,
  PERFORMANCE_CPU_OVERLOAD = 12002,
  PERFORMANCE_DISK_FULL = 12003,
  PERFORMANCE_CONCURRENT_LIMIT = 12004,

  // Security Errors (13000-13999)
  SECURITY_CSRF_TOKEN_INVALID = 13000,
  SECURITY_XSS_DETECTED = 13001,
  SECURITY_SQL_INJECTION_DETECTED = 13002,
  SECURITY_RATE_LIMIT_EXCEEDED = 13003,
  SECURITY_IP_BLOCKED = 13004,
  SECURITY_SIGNATURE_INVALID = 13005,
  SECURITY_ENCRYPTION_FAILED = 13006,
  SECURITY_DECRYPTION_FAILED = 13007
}

// ==================== ERROR INTERFACES ====================

export interface BaseError {
  id: string;
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ValidationError extends BaseError {
  category: ErrorCategory.VALIDATION;
  field?: string;
  value?: any;
  constraints?: string[];
}

export interface AuthenticationError extends BaseError {
  category: ErrorCategory.AUTHENTICATION;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthorizationError extends BaseError {
  category: ErrorCategory.AUTHORIZATION;
  userId?: string;
  resource?: string;
  action?: string;
  requiredPermissions?: string[];
}

export interface NetworkError extends BaseError {
  category: ErrorCategory.NETWORK;
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  retryCount?: number;
}

export interface DatabaseError extends BaseError {
  category: ErrorCategory.DATABASE;
  table?: string;
  operation?: string;
  query?: string;
  constraint?: string;
}

export interface AIError extends BaseError {
  category: ErrorCategory.AI_MODEL | ErrorCategory.AI_PROCESSING;
  modelId?: string;
  inputData?: any;
  processingTime?: number;
  modelVersion?: string;
}

export interface SecurityError extends BaseError {
  category: ErrorCategory.SECURITY;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  threatType?: string;
  riskScore?: number;
}

export interface PerformanceError extends BaseError {
  category: ErrorCategory.PERFORMANCE;
  operation?: string;
  duration?: number;
  resourceUsage?: {
    memory?: number;
    cpu?: number;
    disk?: number;
  };
}

// ==================== ERROR CONTEXT INTERFACES ====================

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  environment?: string;
  version?: string;
  timestamp: Date;
}

export interface ErrorMetadata {
  tags?: string[];
  labels?: Record<string, string>;
  metrics?: Record<string, number>;
  breadcrumbs?: Array<{
    message: string;
    data?: any;
    timestamp: Date;
  }>;
  user?: {
    id?: string;
    email?: string;
    role?: string;
    permissions?: string[];
  };
  system?: {
    version?: string;
    environment?: string;
    region?: string;
    instance?: string;
  };
}

// ==================== ERROR RESPONSE INTERFACES ====================

export interface ErrorResponse {
  success: false;
  error: {
    id: string;
    code: ErrorCode;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    details?: string;
    timestamp: Date;
    context?: ErrorContext;
    metadata?: ErrorMetadata;
  };
  requestId?: string;
  correlationId?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: ValidationError & {
    field?: string;
    value?: any;
    constraints?: string[];
    context?: ErrorContext;
  };
}

// ==================== ERROR HANDLER INTERFACES ====================

export interface ErrorHandler {
  handle(error: BaseError, context?: ErrorContext): Promise<void>;
  shouldHandle(error: BaseError): boolean;
  getPriority(): number;
}

export interface ErrorReporter {
  report(error: BaseError, context?: ErrorContext): Promise<void>;
  reportBatch(errors: BaseError[], context?: ErrorContext): Promise<void>;
}

export interface ErrorFormatter {
  format(error: BaseError, context?: ErrorContext): string;
  formatForUser(error: BaseError): string;
  formatForLog(error: BaseError, context?: ErrorContext): string;
}

// ==================== ERROR UTILITY TYPES ====================

export type ErrorWithContext<T extends BaseError = BaseError> = T & {
  context?: ErrorContext;
  metadata?: ErrorMetadata;
};

export type ErrorHandlerFunction = (error: BaseError, context?: ErrorContext) => Promise<void> | void;

export type ErrorFilterFunction = (error: BaseError) => boolean;

export type ErrorTransformFunction = (error: BaseError) => BaseError;

// ==================== ERROR CONSTANTS ====================

export const ERROR_CONSTANTS = {
  MAX_ERROR_MESSAGE_LENGTH: 500,
  MAX_ERROR_DETAILS_LENGTH: 2000,
  MAX_CONTEXT_SIZE: 10000,
  MAX_METADATA_SIZE: 5000,
  MAX_BREADCRUMBS: 50,
  ERROR_ID_PREFIX: 'err_',
  CORRELATION_ID_PREFIX: 'corr_',
  REQUEST_ID_PREFIX: 'req_'
} as const;

// ==================== ERROR UTILITY FUNCTIONS ====================

export const createErrorId = (): string => {
  return `${ERROR_CONSTANTS.ERROR_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createCorrelationId = (): string => {
  return `${ERROR_CONSTANTS.CORRELATION_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createRequestId = (): string => {
  return `${ERROR_CONSTANTS.REQUEST_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isErrorSeverity = (severity: string): severity is ErrorSeverity => {
  return Object.values(ErrorSeverity).includes(severity as ErrorSeverity);
};

export const isErrorCategory = (category: string): category is ErrorCategory => {
  return Object.values(ErrorCategory).includes(category as ErrorCategory);
};

export const isErrorCode = (code: number): code is ErrorCode => {
  return Object.values(ErrorCode).includes(code as ErrorCode);
};
