/**
 * Standard API error codes for consistent error handling
 * 
 * Categories:
 * - AUTH_*: Authentication/authorization errors
 * - USER_*: User-related errors
 * - TENANT_*: Tenant/organization errors
 * - VALIDATION_*: Input validation errors
 * - SYSTEM_*: Server/technical errors
 * - BUSINESS_*: Domain-specific errors
 */
export enum ApiErrorCode {
  // Authentication errors (4xx)
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID",
  AUTH_INSUFFICIENT_PERMISSIONS = "AUTH_INSUFFICIENT_PERMISSIONS",
  AUTH_MFA_REQUIRED = "AUTH_MFA_REQUIRED",
  AUTH_MFA_INVALID = "AUTH_MFA_INVALID",
  AUTH_SESSION_EXPIRED = "AUTH_SESSION_EXPIRED",
  AUTH_DEVICE_NOT_TRUSTED = "AUTH_DEVICE_NOT_TRUSTED",
  AUTH_LOCATION_BLOCKED = "AUTH_LOCATION_BLOCKED",
  AUTH_RATE_LIMIT_EXCEEDED = "AUTH_RATE_LIMIT_EXCEEDED",
  
  // User errors (4xx)
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ACCOUNT_LOCKED = "USER_ACCOUNT_LOCKED",
  USER_ACCOUNT_DISABLED = "USER_ACCOUNT_DISABLED",
  USER_EMAIL_NOT_VERIFIED = "USER_EMAIL_NOT_VERIFIED",
  USER_EMAIL_ALREADY_EXISTS = "USER_EMAIL_ALREADY_EXISTS",
  USER_PHONE_ALREADY_EXISTS = "USER_PHONE_ALREADY_EXISTS",
  USER_PASSWORD_TOO_WEAK = "USER_PASSWORD_TOO_WEAK",
  USER_PROFILE_INCOMPLETE = "USER_PROFILE_INCOMPLETE",
  
  // Tenant errors (4xx)
  TENANT_SUSPENDED = "TENANT_SUSPENDED",
  TENANT_NOT_FOUND = "TENANT_NOT_FOUND",
  TENANT_LICENSE_EXPIRED = "TENANT_LICENSE_EXPIRED",
  TENANT_QUOTA_EXCEEDED = "TENANT_QUOTA_EXCEEDED",
  TENANT_BILLING_OVERDUE = "TENANT_BILLING_OVERDUE",
  TENANT_MAINTENANCE_MODE = "TENANT_MAINTENANCE_MODE",
  
  // Validation errors (4xx)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT_FORMAT = "INVALID_INPUT_FORMAT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
  INVALID_PHONE_FORMAT = "INVALID_PHONE_FORMAT",
  INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT",
  INVALID_UUID_FORMAT = "INVALID_UUID_FORMAT",
  
  // System/technical errors (5xx)
  SERVER_ERROR = "SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  MAINTENANCE_MODE = "MAINTENANCE_MODE",
  
  // Business/domain errors
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  CONFLICT = "CONFLICT",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  INSUFFICIENT_QUOTA = "INSUFFICIENT_QUOTA",
  PAYMENT_REQUIRED = "PAYMENT_REQUIRED"
}

/**
 * Extended error metadata
 */
export interface ApiErrorMetadata {
  /**
   * Field-specific validation errors (for VALIDATION_ERROR)
   */
  fields?: Record<string, string[]>;
  
  /**
   * Recommended HTTP status code
   */
  httpStatus?: number;
  
  /**
   * Whether the error can be retried
   */
  retryable?: boolean;
  
  /**
   * Additional context for debugging
   */
  context?: Record<string, unknown>;
  
  /**
   * Documentation URL for this error
   */
  docsUrl?: string;
  
  /**
   * Error severity level
   */
  severity?: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Suggested retry delay in seconds
   */
  retryAfter?: number;
  
  /**
   * Error correlation ID for tracing
   */
  correlationId?: string;
  
  /**
   * User-friendly suggestions for resolution
   */
  suggestions?: string[];
}

/**
 * Standard API error response structure
 */
export interface ApiError {
  /**
   * Machine-readable error code
   */
  code: ApiErrorCode;
  
  /**
   * Human-readable error message
   */
  message: string;
  
  /**
   * Additional error metadata
   */
  meta?: ApiErrorMetadata;
  
  /**
   * When the error occurred (ISO timestamp)
   */
  timestamp?: string;
  
  /**
   * Request ID for correlation
   */
  requestId?: string;
}

/**
 * Helper type for error responses
 */
export type ApiErrorResponse<T extends ApiError = ApiError> = {
  success: false;
  error: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    [key: string]: unknown;
  };
};

/**
 * Error categories for grouping and handling
 */
export const ErrorCategories = {
  AUTH: [
    ApiErrorCode.AUTH_INVALID_CREDENTIALS,
    ApiErrorCode.AUTH_TOKEN_EXPIRED,
    ApiErrorCode.AUTH_TOKEN_INVALID,
    ApiErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
    ApiErrorCode.AUTH_MFA_REQUIRED,
    ApiErrorCode.AUTH_MFA_INVALID,
    ApiErrorCode.AUTH_SESSION_EXPIRED,
    ApiErrorCode.AUTH_DEVICE_NOT_TRUSTED,
    ApiErrorCode.AUTH_LOCATION_BLOCKED,
    ApiErrorCode.AUTH_RATE_LIMIT_EXCEEDED
  ],
  USER: [
    ApiErrorCode.USER_NOT_FOUND,
    ApiErrorCode.USER_ACCOUNT_LOCKED,
    ApiErrorCode.USER_ACCOUNT_DISABLED,
    ApiErrorCode.USER_EMAIL_NOT_VERIFIED,
    ApiErrorCode.USER_EMAIL_ALREADY_EXISTS,
    ApiErrorCode.USER_PHONE_ALREADY_EXISTS,
    ApiErrorCode.USER_PASSWORD_TOO_WEAK,
    ApiErrorCode.USER_PROFILE_INCOMPLETE
  ],
  TENANT: [
    ApiErrorCode.TENANT_SUSPENDED,
    ApiErrorCode.TENANT_NOT_FOUND,
    ApiErrorCode.TENANT_LICENSE_EXPIRED,
    ApiErrorCode.TENANT_QUOTA_EXCEEDED,
    ApiErrorCode.TENANT_BILLING_OVERDUE,
    ApiErrorCode.TENANT_MAINTENANCE_MODE
  ],
  VALIDATION: [
    ApiErrorCode.VALIDATION_ERROR,
    ApiErrorCode.INVALID_INPUT_FORMAT,
    ApiErrorCode.MISSING_REQUIRED_FIELD,
    ApiErrorCode.INVALID_EMAIL_FORMAT,
    ApiErrorCode.INVALID_PHONE_FORMAT,
    ApiErrorCode.INVALID_DATE_FORMAT,
    ApiErrorCode.INVALID_UUID_FORMAT
  ],
  SYSTEM: [
    ApiErrorCode.SERVER_ERROR,
    ApiErrorCode.DATABASE_ERROR,
    ApiErrorCode.EXTERNAL_SERVICE_ERROR,
    ApiErrorCode.GATEWAY_TIMEOUT,
    ApiErrorCode.SERVICE_UNAVAILABLE,
    ApiErrorCode.MAINTENANCE_MODE
  ],
  BUSINESS: [
    ApiErrorCode.BUSINESS_RULE_VIOLATION,
    ApiErrorCode.CONFLICT,
    ApiErrorCode.RESOURCE_NOT_FOUND,
    ApiErrorCode.OPERATION_NOT_ALLOWED,
    ApiErrorCode.INSUFFICIENT_QUOTA,
    ApiErrorCode.PAYMENT_REQUIRED
  ]
} as const;

// Predefined common errors for easy reuse
export const CommonErrors = {
  InvalidCredentials: (meta?: ApiErrorMetadata): ApiError => ({
    code: ApiErrorCode.AUTH_INVALID_CREDENTIALS,
    message: "Invalid email or password",
    meta: { 
      httpStatus: 401,
      severity: 'medium',
      ...meta 
    }
  }),
  
  ValidationError: (fields: Record<string, string[]>): ApiError => ({
    code: ApiErrorCode.VALIDATION_ERROR,
    message: "Validation failed",
    meta: {
      fields,
      httpStatus: 422,
      severity: 'low',
      suggestions: ['Please check the input fields and try again']
    }
  }),
  
  ServerError: (meta?: ApiErrorMetadata): ApiError => ({
    code: ApiErrorCode.SERVER_ERROR,
    message: "Internal server error",
    meta: {
      httpStatus: 500,
      retryable: true,
      severity: 'high',
      suggestions: ['Please try again later', 'Contact support if the problem persists'],
      ...meta
    }
  }),
  
  NotFound: (resource: string, meta?: ApiErrorMetadata): ApiError => ({
    code: ApiErrorCode.RESOURCE_NOT_FOUND,
    message: `${resource} not found`,
    meta: {
      httpStatus: 404,
      severity: 'low',
      ...meta
    }
  }),
  
  Unauthorized: (meta?: ApiErrorMetadata): ApiError => ({
    code: ApiErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
    message: "You don't have permission to perform this action",
    meta: {
      httpStatus: 403,
      severity: 'medium',
      ...meta
    }
  }),
  
  RateLimited: (retryAfter?: number, meta?: ApiErrorMetadata): ApiError => ({
    code: ApiErrorCode.AUTH_RATE_LIMIT_EXCEEDED,
    message: "Too many requests. Please try again later.",
    meta: {
      httpStatus: 429,
      retryable: true,
      retryAfter,
      severity: 'medium',
      suggestions: ['Please wait before making another request'],
      ...meta
    }
  })
};

// Type guard for checking error codes
export function isApiError(error: unknown, code?: ApiErrorCode): error is ApiError {
  return typeof error === 'object' && 
         error !== null && 
         'code' in error && 
         (code === undefined || (error as ApiError).code === code);
}

// Utility functions for error handling
export function getErrorCategory(code: ApiErrorCode): keyof typeof ErrorCategories {
  for (const [category, codes] of Object.entries(ErrorCategories)) {
    if (codes.includes(code)) {
      return category as keyof typeof ErrorCategories;
    }
  }
  return 'SYSTEM';
}

export function isRetryableError(error: ApiError): boolean {
  return error.meta?.retryable === true;
}

export function getHttpStatus(error: ApiError): number {
  return error.meta?.httpStatus || 500;
}

export function getErrorSeverity(error: ApiError): ApiErrorMetadata['severity'] {
  return error.meta?.severity || 'medium';
}

export function createErrorResponse(
  error: ApiError,
  requestId?: string,
  version: string = '1.0.0'
): ApiErrorResponse {
  return {
    success: false,
    error: {
      ...error,
      timestamp: error.timestamp || new Date().toISOString(),
      requestId: requestId || error.requestId
    },
    meta: {
      timestamp: new Date().toISOString(),
      version
    }
  };
} 