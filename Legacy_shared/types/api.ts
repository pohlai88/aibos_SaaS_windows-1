/**
 * Standard API response structure
 * @template T - Type of the successful response data
 * @template E - Type of the error details (defaults to ApiError)
 */
export interface ApiResponse<T = unknown, E extends ApiError = ApiError> {
  /**
   * Whether the request was successful
   */
  success: boolean;

  /**
   * Response data (present when success = true)
   */
  data?: T;

  /**
   * Error details (present when success = false)
   */
  error?: E;

  /**
   * Optional human-readable message
   */
  message?: string;

  /**
   * Response metadata
   */
  meta?: ApiMeta;
}

/**
 * Standard API error structure
 */
export interface ApiError {
  /**
   * Machine-readable error code
   */
  code: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Additional error details
   */
  details?: unknown;

  /**
   * Optional validation errors
   */
  validation?: Record<string, string[]>;

  /**
   * Optional error context for debugging
   */
  context?: Record<string, unknown>;

  /**
   * Optional error timestamp
   */
  timestamp?: string;
}

/**
 * API response metadata
 */
export interface ApiMeta {
  /**
   * API version
   */
  version: string;

  /**
   * Timestamp of the response
   */
  timestamp: string;

  /**
   * Request ID for tracing
   */
  requestId?: string;

  /**
   * Processing time in milliseconds
   */
  processingTime?: number;

  /**
   * Pagination information (for list responses)
   */
  pagination?: PaginationInfo;

  /**
   * Rate limiting information
   */
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
  };

  /**
   * Cache information
   */
  cache?: {
    cached: boolean;
    ttl?: number;
    etag?: string;
  };

  /**
   * Additional metadata
   */
  [key: string]: unknown;
}

/**
 * Standardized pagination information
 */
export interface PaginationInfo {
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-based index) */
  page: number;
  /** Number of items per page */
  perPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
  /** Optional cursor for cursor-based pagination */
  nextCursor?: string | null;
  /** Optional cursor for previous page */
  prevCursor?: string | null;
  /** Optional links for HATEOAS-style APIs */
  links?: {
    self?: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

/**
 * Standardized paginated API response structure
 * @template T - Type of the data items in the response
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination information */
  pagination: PaginationInfo;
}

/**
 * Paginated API response that extends the standard ApiResponse
 * @template T - Type of the items in the list
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & {
    pagination: PaginationInfo;
  };
}

/**
 * Standard pagination request parameters
 */
export interface PaginationParams {
  /** Page number (1-based index) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Enhanced pagination parameters with filtering
 */
export interface PaginationQueryParams extends PaginationParams {
  /** Search query */
  search?: string;
  /** Filter by status */
  status?: string;
  /** Filter by date range */
  dateFrom?: string;
  dateTo?: string;
  /** Additional filters */
  filters?: Record<string, unknown>;
  /** Include related data */
  include?: string[];
  /** Select specific fields */
  select?: string[];
}

/**
 * Enhanced common error codes
 */
export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'method_not_allowed'
  | 'conflict'
  | 'validation_error'
  | 'rate_limited'
  | 'server_error'
  | 'service_unavailable'
  | 'gateway_timeout'
  | 'payload_too_large'
  | 'unsupported_media_type'
  | 'too_many_requests'
  | 'internal_server_error'
  | 'not_implemented'
  | 'bad_gateway'
  | 'maintenance_mode';

/**
 * Standardized error response
 */
export interface StandardApiError extends ApiError {
  code: ApiErrorCode;
  details?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

/**
 * Empty success response
 */
export interface EmptyApiResponse extends ApiResponse<void> {
  data?: never;
}

/**
 * Success response with data
 */
export interface SuccessApiResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
  error?: never;
}

/**
 * Error response
 */
export interface ErrorApiResponse<E extends ApiError = ApiError> extends ApiResponse<never, E> {
  success: false;
  data?: never;
  error: E;
}

// Utility types for better type safety
export type ApiResponseType<T> = SuccessApiResponse<T> | ErrorApiResponse;

export type PaginatedResponseType<T> = PaginatedApiResponse<T> | ErrorApiResponse;

// Type guards
export const isSuccessResponse = <T>(
  response: ApiResponse<T>,
): response is SuccessApiResponse<T> => {
  return response.success === true && response.data !== undefined;
};

export const isErrorResponse = <T, E extends ApiError = ApiError>(
  response: ApiResponse<T, E>,
): response is ErrorApiResponse<E> => {
  return response.success === false && response.error !== undefined;
};

export const isPaginatedResponse = <T>(
  response: ApiResponse<T[]>,
): response is PaginatedApiResponse<T> => {
  return isSuccessResponse(response) && response.meta?.pagination !== undefined;
};

/**
 * Type guard for standalone PaginatedResponse (without ApiResponse wrapper)
 */
export function isStandalonePaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return (
    response &&
    Array.isArray(response.data) &&
    response.pagination &&
    typeof response.pagination.total === 'number' &&
    typeof response.pagination.page === 'number' &&
    typeof response.pagination.perPage === 'number'
  );
}

/**
 * Type guard for legacy pagination format (direct pagination properties)
 */
export function isLegacyPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return (
    response &&
    Array.isArray(response.data) &&
    typeof response.total === 'number' &&
    typeof response.page === 'number' &&
    typeof response.pageSize === 'number'
  );
}

// Helper functions for creating responses
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  meta?: Partial<ApiMeta>,
): SuccessApiResponse<T> => ({
  success: true,
  data,
  message,
  meta: {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createErrorResponse = <E extends ApiError = StandardApiError>(
  error: E,
  message?: string,
  meta?: Partial<ApiMeta>,
): ErrorApiResponse<E> => ({
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
});

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationInfo,
  message?: string,
  meta?: Partial<ApiMeta>,
): PaginatedApiResponse<T> => ({
  success: true,
  data,
  message,
  meta: {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    pagination,
    ...meta,
  },
});

// Pagination utility functions
export const createPaginationInfo = (
  total: number,
  page: number,
  perPage: number,
  nextCursor?: string | null,
  prevCursor?: string | null,
  links?: PaginationInfo['links'],
): PaginationInfo => {
  const totalPages = Math.ceil(total / perPage);
  return {
    total,
    page,
    perPage,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextCursor,
    prevCursor,
    links,
  };
};

export const validatePaginationParams = (params: PaginationParams): PaginationParams => {
  return {
    page: Math.max(1, params.page || 1),
    pageSize: Math.min(100, Math.max(1, params.pageSize || 20)),
    cursor: params.cursor,
  };
};

export const calculatePaginationOffset = (page: number, pageSize: number): number => {
  return (page - 1) * pageSize;
};

export const hasNextPage = (pagination: PaginationInfo): boolean => {
  return pagination.hasNext;
};

export const hasPrevPage = (pagination: PaginationInfo): boolean => {
  return pagination.hasPrev;
};

export const getPageInfo = (pagination: PaginationInfo) => {
  return {
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    totalItems: pagination.total,
    itemsPerPage: pagination.perPage,
    hasNext: pagination.hasNext,
    hasPrev: pagination.hasPrev,
  };
};

/**
 * Calculate total number of pages
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Calculate the starting index for a page (0-based)
 */
export function calculatePageStartIndex(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Calculate the ending index for a page (0-based, exclusive)
 */
export function calculatePageEndIndex(page: number, pageSize: number): number {
  return page * pageSize;
}

/**
 * Check if a page number is valid
 */
export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= totalPages;
}

/**
 * Get the range of items for a specific page
 */
export function getPageRange(page: number, pageSize: number, total: number) {
  const startIndex = calculatePageStartIndex(page, pageSize);
  const endIndex = Math.min(calculatePageEndIndex(page, pageSize), total);
  const itemCount = endIndex - startIndex;

  return {
    startIndex,
    endIndex,
    itemCount,
    isEmpty: itemCount === 0,
    isFull: itemCount === pageSize,
  };
}

/**
 * Generate page numbers for pagination UI
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5,
) {
  const pages: number[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - halfVisible);
  const end = Math.min(totalPages, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return {
    pages,
    hasGapBefore: start > 1,
    hasGapAfter: end < totalPages,
    showFirst: start > 1,
    showLast: end < totalPages,
  };
}
