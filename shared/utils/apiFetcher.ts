import type { ApiResponse,
  PaginatedResponse,
  PaginatedApiResponse,
  ApiError as ApiErrorType,
  StandardApiError,
  PaginationParams,
  PaginationQueryParams,
 } from '../types/api';
import type { ApiErrorCode  } from '../types/api.errors';
import type { CommonErrors  } from '../types/api.errors';

/**
 * API Error class for handling API-specific errors
 */
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;
  public retryable: boolean;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: any,
    retryable: boolean = false,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
    this.name = 'ApiError';
  }

  /**
   * Check if this is a retryable error
   */
  isRetryable(): boolean {
    return this.retryable || this.status >= 500;
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.status === 422 || this.code === 'VALIDATION_ERROR';
  }
}

/**
 * API Fetcher configuration
 */
export interface ApiFetcherConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onError?: (error: ApiError) => void;
  onRequest?: (url: string, options: RequestInit) => void;
  onResponse?: (response: Response) => void;
}

/**
 * Enhanced API fetcher with proper error handling and type safety
 * @template T - Expected response data type
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param config - Fetcher configuration
 * @returns Promise with typed API response
 * @throws {ApiError} When the request fails or returns an error status
 */
export async function apiFetcher<T>(
  url: string,
  options: RequestInit = {},
  config: ApiFetcherConfig = {},
): Promise<ApiResponse<T>> {
  const {
    baseUrl = '',
    defaultHeaders = {},
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    onError,
    onRequest,
    onResponse,
  } = config;

  const fullUrl = baseUrl + url;
  let lastError: ApiError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Prepare request
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;

      // Notify request start
      onRequest?.(fullUrl, requestOptions);

      // Make request
      const res = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      // Notify response received
      onResponse?.(res);

      // Parse response
      let json: any;
      try {
        json = await res.json();
      } catch (parseError) {
        throw new ApiError('Invalid JSON response', res.status, 'PARSE_ERROR', {
          originalError: parseError,
        });
      }

      // Handle error responses
      if (!res.ok) {
        const error = createApiErrorFromResponse(res, json);
        lastError = error;

        // Don't retry on client errors (4xx) unless specifically configured
        if (res.status < 500 && !error.isRetryable()) {
          onError?.(error);
          throw error;
        }

        // Retry on server errors or retryable errors
        if (attempt < retries && error.isRetryable()) {
          await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }

        onError?.(error);
        throw error;
      }

      // Validate response structure
      if (!isValidApiResponse(json)) {
        throw new ApiError('Invalid API response structure', res.status, 'INVALID_RESPONSE', json);
      }

      return json;
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;
      } else if (error instanceof Error) {
        lastError = new ApiError(error.message, 500, 'NETWORK_ERROR', { originalError: error });
      } else {
        lastError = new ApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR', {
          originalError: error,
        });
      }

      // Don't retry on network errors if we've exhausted retries
      if (attempt >= retries) {
        onError?.(lastError);
        throw lastError;
      }

      // Wait before retrying
      await delay(retryDelay * Math.pow(2, attempt));
    }
  }

  throw lastError!;
}

/**
 * Specialized fetcher for paginated endpoints
 * @template T - Expected item type in the paginated response
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param config - Fetcher configuration
 * @returns Promise with typed paginated API response
 */
export async function paginatedFetcher<T>(
  url: string,
  options: RequestInit = {},
  config: ApiFetcherConfig = {},
): Promise<PaginatedApiResponse<T>> {
  const response = await apiFetcher<PaginatedApiResponse<T>>(url, options, config);

  if (!isPaginatedResponse(response)) {
    throw new ApiError(
      'Response is not a valid paginated response',
      500,
      'INVALID_PAGINATED_RESPONSE',
      response,
    );
  }

  return response;
}

/**
 * Create API error from HTTP response
 */
function createApiErrorFromResponse(res: Response, json: any): ApiError {
  const status = res.status;
  const message = json.message || json.error?.message || getDefaultErrorMessage(status);
  const code = json.error?.code || getDefaultErrorCode(status);
  const details = json.error?.details || json.error;
  const retryable = json.error?.meta?.retryable || status >= 500;

  return new ApiError(message, status, code, details, retryable);
}

/**
 * Get default error message for HTTP status
 */
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Validation Error',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return messages[status] || 'API request failed';
}

/**
 * Get default error code for HTTP status
 */
function getDefaultErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: ApiErrorCode.BAD_REQUEST,
    401: ApiErrorCode.UNAUTHORIZED,
    403: ApiErrorCode.FORBIDDEN,
    404: ApiErrorCode.NOT_FOUND,
    422: ApiErrorCode.VALIDATION_ERROR,
    429: ApiErrorCode.RATE_LIMITED,
    500: ApiErrorCode.SERVER_ERROR,
    502: ApiErrorCode.BAD_GATEWAY,
    503: ApiErrorCode.SERVICE_UNAVAILABLE,
    504: ApiErrorCode.GATEWAY_TIMEOUT,
  };

  return codes[status] || ApiErrorCode.SERVER_ERROR;
}

/**
 * Validate API response structure
 */
function isValidApiResponse(response: any): response is ApiResponse<any> {
  return (
    response &&
    typeof response.success === 'boolean' &&
    (response.success ? response.data !== undefined : response.error !== undefined)
  );
}

/**
 * Check if response is paginated
 */
function isPaginatedResponse<T>(response: ApiResponse<T[]>): response is PaginatedApiResponse<T> {
  return (
    response.success && Array.isArray(response.data) && response.meta?.pagination !== undefined
  );
}

/**
 * Utility function to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create URL with query parameters
 */
export function createApiUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, unknown>,
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  return url.toString();
}

/**
 * Create paginated URL with pagination parameters
 */
export function createPaginatedUrl(
  baseUrl: string,
  path: string,
  pagination: PaginationParams,
  additionalParams?: Record<string, unknown>,
): string {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    cursor: pagination.cursor,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
    ...additionalParams,
  };

  return createApiUrl(baseUrl, path, params);
}

/**
 * Default API fetcher instance with common configuration
 */
export const defaultApiFetcher = {
  get: <T>(url: string, config?: ApiFetcherConfig) => apiFetcher<T>(url, { method: 'GET' }, config),

  post: <T>(url: string, data?: unknown, config?: ApiFetcherConfig) =>
    apiFetcher<T>(
      url,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : null,
      },
      config,
    ),

  put: <T>(url: string, data?: unknown, config?: ApiFetcherConfig) =>
    apiFetcher<T>(
      url,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : null,
      },
      config,
    ),

  patch: <T>(url: string, data?: unknown, config?: ApiFetcherConfig) =>
    apiFetcher<T>(
      url,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : null,
      },
      config,
    ),

  delete: <T>(url: string, config?: ApiFetcherConfig) =>
    apiFetcher<T>(url, { method: 'DELETE' }, config),

  paginated: <T>(url: string, config?: ApiFetcherConfig) =>
    paginatedFetcher<T>(url, { method: 'GET' }, config),
};
