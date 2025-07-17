/**
 * Enterprise-grade primitive types for the AI-BOS platform
 *
 * This module provides strongly-typed primitives with validation,
 * ensuring type safety across the entire application stack.
 */

// ============================================================================
// STRING PRIMITIVES
// ============================================================================

/**
 * A universally unique identifier (UUID) following RFC 4122
 * @example "123e4567-e89b-12d3-a456-426614174000"
 */
export type UUID = string;

/**
 * A valid email address string
 * @example "user@example.com"
 */
export type Email = string;

// Branded types for additional type safety
interface UUIDBrand {
  readonly __uuid: unique symbol;
}
export type BrandedUUID = string & UUIDBrand;

interface EmailBrand {
  readonly __email: unique symbol;
}
export type BrandedEmail = string & EmailBrand;

/**
 * ISO 8601 date string format
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ
 */
export type ISODate = `${number}-${string}-${string}T${string}:${string}:${string}.${string}Z`;

/**
 * URL with protocol validation
 * Supports http, https, ws, wss protocols
 */
export type URL = `http://${string}` | `https://${string}` | `ws://${string}` | `wss://${string}`;

/**
 * Hex color code with validation
 * Format: #RRGGBB or #RRGGBBAA
 */
export type HexColor = `#${string}`;

/**
 * Base64 encoded string
 * Supports standard and URL-safe base64
 */
export type Base64 = string;

/**
 * JWT token format
 * Three parts separated by dots
 */
export type JWT = `${string}.${string}.${string}`;

/**
 * SHA-256 hash (64 characters)
 */
export type SHA256 = `${string}`;

/**
 * MD5 hash (32 characters)
 */
export type MD5 = `${string}`;

/**
 * Phone number with international format
 * Format: +[country code][number]
 */
export type PhoneNumber = `+${string}`;

/**
 * IP address (IPv4 or IPv6)
 */
export type IPAddress = string;

/**
 * Domain name
 * Format: example.com or sub.example.com
 */
export type Domain = string;

/**
 * File extension
 * Format: .ext
 */
export type FileExtension = `.${string}`;

/**
 * MIME type
 * Format: type/subtype
 */
export type MimeType = `${string}/${string}`;

// ============================================================================
// NUMERIC PRIMITIVES
// ============================================================================

/**
 * Integer type (whole numbers)
 */
export type Integer = number;

/**
 * Float type (decimal numbers)
 */
export type Float = number;

/**
 * Percentage value (0-100)
 */
export type Percentage = number;

/**
 * Currency amount in smallest unit (cents, satoshis, etc.)
 */
export type CurrencyAmount = number;

/**
 * Unix timestamp in seconds
 */
export type UnixTimestamp = number;

/**
 * Unix timestamp in milliseconds
 */
export type UnixTimestampMs = number;

/**
 * Port number (1-65535)
 */
export type Port = number;

/**
 * Version number components
 */
export type VersionMajor = number;
export type VersionMinor = number;
export type VersionPatch = number;

/**
 * Semantic version string
 * Format: major.minor.patch[-prerelease][+build]
 */
export type SemVer = `${VersionMajor}.${VersionMinor}.${VersionPatch}${string}`;

// ============================================================================
// JSON PRIMITIVES
// ============================================================================

/**
 * JSON primitive values
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON value (recursive)
 */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * JSON object
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * JSON array
 */
export type JsonArray = JsonValue[];

// ============================================================================
// ENUMERATED PRIMITIVES
// ============================================================================

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP status codes
 */
export type HttpStatus =
  | 100
  | 101
  | 102
  | 103
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 308
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 510
  | 511;

/**
 * Content types
 */
export type ContentType =
  | 'application/json'
  | 'application/xml'
  | 'text/plain'
  | 'text/html'
  | 'text/css'
  | 'text/javascript'
  | 'application/javascript'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/svg+xml'
  | 'application/pdf'
  | 'multipart/form-data';

/**
 * Time zones (IANA format)
 */
export type TimeZone =
  | 'UTC'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'Europe/London'
  | 'Europe/Paris'
  | 'Asia/Tokyo'
  | 'Asia/Shanghai'
  | 'Australia/Sydney';

/**
 * Locale codes (ISO 639-1 + ISO 3166-1)
 */
export type Locale =
  | 'en-US'
  | 'en-GB'
  | 'en-CA'
  | 'en-AU'
  | 'es-ES'
  | 'es-MX'
  | 'fr-FR'
  | 'fr-CA'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'pt-PT'
  | 'ja-JP'
  | 'ko-KR'
  | 'zh-CN'
  | 'zh-TW'
  | 'ru-RU'
  | 'ar-SA'
  | 'hi-IN';

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract the type of a promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract the type of an array element
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Extract the type of a function's return value
 */
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Extract the type of a function's parameters
 */
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Branded type for additional type safety
 */
export type Branded<T, B> = T & { __brand: B };

/**
 * Nominal type for type-safe IDs
 */
export type Nominal<T, B> = T & { readonly __nominal: B };

// ============================================================================
// COMMON UTILITY TYPES
// ============================================================================

/**
 * Nullable type - allows null values
 */
export type Nullable<T> = T | null;

/**
 * Optional type - allows undefined values
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type - allows both null and undefined values
 */
export type Maybe<T> = T | null | undefined;

/**
 * Result type for API responses with success/error handling
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Async result type for asynchronous operations
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Pagination result type
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * API response wrapper
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
};

/**
 * Validation error type
 */
export type ValidationError = {
  field: string;
  message: string;
  code: string;
  value?: any;
};

/**
 * Validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type guard for UUID validation
 */
export function isUUID(value: string): value is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Type guard for email validation
 */
export function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Type guard for ISO date validation
 */
export function isISODate(value: string): boolean {
  return !isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

/**
 * Type guard for URL validation
 */
export function isValidURL(value: string): value is URL {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for hex color validation
 */
export function isValidHexColor(value: string): value is HexColor {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexColorRegex.test(value);
}

/**
 * Type guard for JWT validation
 */
export function isValidJWT(value: string): value is JWT {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(value);
}

/**
 * Type guard for percentage validation
 */
export function isValidPercentage(value: number): value is Percentage {
  return value >= 0 && value <= 100;
}

/**
 * Type guard for port number validation
 */
export function isValidPort(value: number): value is Port {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  TEXT: 'text/plain',
  HTML: 'text/html',
  FORM_DATA: 'multipart/form-data',
} as const;

/**
 * Common time zones
 */
export const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  CST: 'Asia/Shanghai',
  AEST: 'Australia/Sydney',
} as const;

/**
 * Common locales
 */
export const LOCALES = {
  EN_US: 'en-US',
  EN_GB: 'en-GB',
  ES_ES: 'es-ES',
  FR_FR: 'fr-FR',
  DE_DE: 'de-DE',
  JA_JP: 'ja-JP',
  ZH_CN: 'zh-CN',
} as const;

// ============================================================================
// VERSION AND METADATA
// ============================================================================

/**
 * Primitives library version
 */
export const PRIMITIVES_VERSION = '1.0.0';

/**
 * Library metadata
 */
export const PRIMITIVES_METADATA = {
  name: '@aibos/shared-primitives',
  version: PRIMITIVES_VERSION,
  description: 'Enterprise-grade primitive types for the AI-BOS platform',
  author: 'AI-BOS Team',
  license: 'MIT',
  repository: 'https://github.com/pohlai88/aibos_SaaS_windows-1',
} as const;

// ============================================================================
// TYPE GUARDS AND VALIDATORS
// ============================================================================

/**
 * Type guard for checking if a value is not null or undefined
 */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Type guard for checking if a value is a Promise
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * Type guard for checking if a value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Type guard for checking if a value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard for checking if a value is a RegExp
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

/**
 * Type guard for checking if a value is a Map
 */
export function isMap<K, V>(value: unknown): value is Map<K, V> {
  return value instanceof Map;
}

/**
 * Type guard for checking if a value is a Set
 */
export function isSet<T>(value: unknown): value is Set<T> {
  return value instanceof Set;
}

/**
 * Type guard for checking if a value is a WeakMap
 */
export function isWeakMap<K extends object, V>(value: unknown): value is WeakMap<K, V> {
  return value instanceof WeakMap;
}

/**
 * Type guard for checking if a value is a WeakSet
 */
export function isWeakSet<T extends object>(value: unknown): value is WeakSet<T> {
  return value instanceof WeakSet;
}

/**
 * Type guard for checking if a value is a Symbol
 */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

/**
 * Type guard for checking if a value is a BigInt
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

/**
 * Type guard for checking if a value is a primitive
 */
export function isPrimitive(
  value: unknown,
): value is string | number | boolean | null | undefined | symbol | bigint {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  );
}

/**
 * Type guard for checking if a value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Type guard for checking if a value is an empty object
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isPlainObject(value) && Object.keys(value).length === 0;
}

/**
 * Type guard for checking if a value is an empty string
 */
export function isEmptyString(value: unknown): value is '' {
  return value === '';
}

/**
 * Type guard for checking if a value is an empty array
 */
export function isEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length === 0;
}

/**
 * Type guard for checking if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for checking if a value is a non-empty object
 */
export function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && Object.keys(value).length > 0;
}
