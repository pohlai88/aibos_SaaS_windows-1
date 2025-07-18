import { z } from 'zod';
import type { UserSchema  } from './user.validation';
import { ApiErrorCode } from '../types/api';

/**
 * API Error validation schema
 */
export const ApiErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  details: z.unknown().optional(),
  validation: z.record(z.array(z.string())).optional(),
  context: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

/**
 * API Metadata validation schema
 */
export const ApiMetaSchema = z
  .object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format'),
    timestamp: z.string().datetime('Invalid timestamp format'),
    requestId: z.string().uuid().optional(),
    processingTime: z.number().positive().optional(),
    pagination: z
      .object({
        total: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        perPage: z.number().int().positive(),
        totalPages: z.number().int().nonnegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      })
      .optional(),
    rateLimit: z
      .object({
        limit: z.number().int().positive(),
        remaining: z.number().int().nonnegative(),
        reset: z.number().int().positive(),
        retryAfter: z.number().int().positive().optional(),
      })
      .optional(),
    cache: z
      .object({
        cached: z.boolean(),
        ttl: z.number().int().positive().optional(),
        etag: z.string().optional(),
      })
      .optional(),
  })
  .passthrough(); // Allow additional metadata fields

/**
 * Generic API Response validation schema
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      success: z.boolean(),
      data: dataSchema.optional(),
      error: ApiErrorSchema.optional(),
      message: z.string().optional(),
      meta: ApiMetaSchema.optional(),
    })
    .refine(
      (data) => {
        if (data.success) {
          return data.data !== undefined && data.error === undefined;
        } else {
          return data.error !== undefined && data.data === undefined;
        }
      },
      {
        message: 'Response must have data on success or error on failure',
        path: ['success'],
      },
    );

/**
 * Standard API Error Response validation schema
 */
export const StandardApiErrorSchema = ApiErrorSchema.extend({
  code: z.enum([
    'bad_request',
    'unauthorized',
    'forbidden',
    'not_found',
    'method_not_allowed',
    'conflict',
    'validation_error',
    'rate_limited',
    'server_error',
    'service_unavailable',
    'gateway_timeout',
    'payload_too_large',
    'unsupported_media_type',
    'too_many_requests',
    'internal_server_error',
    'not_implemented',
    'bad_gateway',
    'maintenance_mode',
  ] as const),
  details: z.record(z.unknown()).optional(),
  context: z.record(z.unknown()).optional(),
});

/**
 * Paginated API Response validation schema
 */
export const PaginatedApiResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  ApiResponseSchema(z.array(itemSchema)).extend({
    meta: ApiMetaSchema.extend({
      pagination: z.object({
        total: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        perPage: z.number().int().positive(),
        totalPages: z.number().int().nonnegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }),
    }),
  });

/**
 * Empty API Response validation schema
 */
export const EmptyApiResponseSchema = ApiResponseSchema(z.void());

// Specific response schemas for common use cases
export const UserApiResponseSchema = ApiResponseSchema(UserSchema);
export const UsersApiResponseSchema = PaginatedApiResponseSchema(UserSchema);

/**
 * Auth-specific error codes for validation
 */
export const AuthErrorCodeSchema = z.enum([
  'invalid_credentials',
  'account_locked',
  'account_disabled',
  'mfa_required',
  'mfa_invalid',
  'mfa_expired',
  'verification_required',
  'verification_expired',
  'verification_invalid',
  'password_too_weak',
  'email_already_exists',
  'phone_already_exists',
  'rate_limit_exceeded',
  'session_expired',
  'device_not_trusted',
  'location_blocked',
  'maintenance_mode',
  'service_unavailable',
] as const);

/**
 * Auth Error Response validation schema
 */
export const AuthErrorResponseSchema = ApiResponseSchema(z.never()).extend({
  error: StandardApiErrorSchema.extend({
    code: AuthErrorCodeSchema,
    remainingAttempts: z.number().int().nonnegative().optional(),
    lockoutDuration: z.number().int().positive().optional(),
    field: z.string().optional(),
    suggestion: z.string().optional(),
    retryAfter: z.number().int().positive().optional(),
    suspiciousActivity: z.boolean().optional(),
    location: z.string().optional(),
  }),
});

// Type exports
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiMeta = z.infer<typeof ApiMetaSchema>;
export type StandardApiError = z.infer<typeof StandardApiErrorSchema>;
export type AuthErrorCode = z.infer<typeof AuthErrorCodeSchema>;

// Validation helper functions
export const validateApiResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  return schema.parse(data);
};

export const validateUserResponse = (data: unknown) => {
  return UserApiResponseSchema.parse(data);
};

export const validateUsersResponse = (data: unknown) => {
  return UsersApiResponseSchema.parse(data);
};

export const validateAuthError = (data: unknown) => {
  return AuthErrorResponseSchema.parse(data);
};

// Utility functions for creating validated responses
export const createValidatedSuccessResponse = <T>(
  schema: z.ZodType<T>,
  data: T,
  message?: string,
  meta?: Partial<z.infer<typeof ApiMetaSchema>>,
) => {
  const response = {
    success: true,
    data,
    message,
    meta: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return validateApiResponse(ApiResponseSchema(schema), response);
};

export const createValidatedErrorResponse = (
  error: StandardApiError,
  message?: string,
  meta?: Partial<z.infer<typeof ApiMetaSchema>>,
) => {
  const response = {
    success: false,
    error: {
      ...error,
      timestamp: error.timestamp || new Date().toISOString(),
    },
    message,
    meta: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return validateApiResponse(ApiResponseSchema(z.never()), response);
};

// Example usage with your original example
export const validateUserExample = () => {
  const exampleResponse = {
    success: true,
    data: {
      user_id: 'abc-123',
      email: 'test@example.com',
      name: 'Jane',
      role: 'ADMIN' as const,
      permissions: ['VIEW_USERS'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-06-01'),
    },
    meta: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const validatedResponse = validateUserResponse(exampleResponse);
    console.log('Valid response:', validatedResponse);
    return validatedResponse;
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
};
