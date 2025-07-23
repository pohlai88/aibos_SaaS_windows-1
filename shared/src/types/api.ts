/**
 * AI-BOS API Types
 *
 * API-related TypeScript types.
 */

export interface ApiRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
