/**
 * Enterprise-grade metadata type mapping system for the AI-BOS platform
 *
 * This module provides comprehensive type mappings between metadata field types
 * and actual TypeScript types, along with type guards and utility functions.
 */

import {
  MetadataFieldType,
  MetadataValidationRule,
  MetadataOperation,
  MetadataStatus,
  MetadataSource,
  MetadataCategory,
} from './metadata.enums';
import {
  UUID,
  Email,
  URL,
  PhoneNumber,
  IPAddress,
  HexColor,
  Base64,
  JWT,
  SHA256,
  MD5,
  JsonValue,
  JsonObject,
  JsonArray,
  ISODate,
  UnixTimestamp,
  UnixTimestampMs,
  Port,
  SemVer,
  Percentage,
  CurrencyAmount,
  Integer,
  Float,
  Domain,
  FileExtension,
  MimeType,
  TimeZone,
  Locale,
  HttpMethod,
  HttpStatus,
  ContentType,
} from '../primitives';

// ============================================================================
// TYPE MAPPING DEFINITIONS
// ============================================================================

/**
 * Type mapping from enum to actual TypeScript types
 * Maps all MetadataFieldType values to their corresponding TypeScript types
 */
export type MetadataFieldTypeMap = {
  // Basic types
  [MetadataFieldType.STRING]: string;
  [MetadataFieldType.NUMBER]: number;
  [MetadataFieldType.BOOLEAN]: boolean;
  [MetadataFieldType.INTEGER]: Integer;
  [MetadataFieldType.FLOAT]: Float;
  [MetadataFieldType.DECIMAL]: number;

  // Date and time types
  [MetadataFieldType.DATE]: Date;
  [MetadataFieldType.DATETIME]: Date;
  [MetadataFieldType.TIME]: string;
  [MetadataFieldType.TIMESTAMP]: UnixTimestamp;
  [MetadataFieldType.DURATION]: number;

  // Complex types
  [MetadataFieldType.ENUM]: string;
  [MetadataFieldType.JSON]: JsonValue;
  [MetadataFieldType.ARRAY]: unknown[];
  [MetadataFieldType.OBJECT]: JsonObject;

  // Reference types
  [MetadataFieldType.RELATION]: UUID;
  [MetadataFieldType.REFERENCE]: UUID;
  [MetadataFieldType.FOREIGN_KEY]: UUID;

  // Specialized types
  [MetadataFieldType.EMAIL]: Email;
  [MetadataFieldType.URL]: URL;
  [MetadataFieldType.PHONE]: PhoneNumber;
  [MetadataFieldType.UUID]: UUID;
  [MetadataFieldType.IP_ADDRESS]: IPAddress;
  [MetadataFieldType.GEO_LOCATION]: { latitude: number; longitude: number };
  [MetadataFieldType.CURRENCY]: CurrencyAmount;
  [MetadataFieldType.PERCENTAGE]: Percentage;

  // Binary types
  [MetadataFieldType.BINARY]: Uint8Array;
  [MetadataFieldType.BASE64]: Base64;
  [MetadataFieldType.BLOB]: Blob;

  // Text types
  [MetadataFieldType.TEXT]: string;
  [MetadataFieldType.RICH_TEXT]: string;
  [MetadataFieldType.MARKDOWN]: string;
  [MetadataFieldType.HTML]: string;

  // File types
  [MetadataFieldType.FILE]: File;
  [MetadataFieldType.IMAGE]: File;
  [MetadataFieldType.DOCUMENT]: File;
  [MetadataFieldType.VIDEO]: File;
  [MetadataFieldType.AUDIO]: File;

  // Custom types
  [MetadataFieldType.CUSTOM]: unknown;
  [MetadataFieldType.COMPUTED]: unknown;
  [MetadataFieldType.VIRTUAL]: unknown;
};

/**
 * Utility type to get the TypeScript type from a MetadataFieldType
 * Provides compile-time type safety when working with field types
 */
export type FieldTypeToTS<T extends MetadataFieldType> = MetadataFieldTypeMap[T];

/**
 * Reverse mapping from TypeScript types to MetadataFieldType
 * Useful for type inference and validation
 */
export type TSToFieldType<T> = {
  [K in MetadataFieldType]: FieldTypeToTS<K> extends T ? K : never;
}[MetadataFieldType];

// ============================================================================
// VALIDATION RULE TYPE MAPPING
// ============================================================================

/**
 * Type mapping for validation rule parameters
 * Maps validation rules to their expected parameter types
 */
export type ValidationRuleParamMap = {
  [MetadataValidationRule.REQUIRED]: boolean;
  [MetadataValidationRule.MIN_LENGTH]: number;
  [MetadataValidationRule.MAX_LENGTH]: number;
  [MetadataValidationRule.PATTERN]: string;
  [MetadataValidationRule.EMAIL]: boolean;
  [MetadataValidationRule.URL]: boolean;
  [MetadataValidationRule.UUID]: boolean;
  [MetadataValidationRule.PHONE]: boolean;
  [MetadataValidationRule.MIN_VALUE]: number;
  [MetadataValidationRule.MAX_VALUE]: number;
  [MetadataValidationRule.RANGE]: { min: number; max: number };
  [MetadataValidationRule.POSITIVE]: boolean;
  [MetadataValidationRule.NEGATIVE]: boolean;
  [MetadataValidationRule.INTEGER]: boolean;
  [MetadataValidationRule.DECIMAL_PLACES]: number;
  [MetadataValidationRule.MIN_DATE]: Date;
  [MetadataValidationRule.MAX_DATE]: Date;
  [MetadataValidationRule.DATE_RANGE]: { min: Date; max: Date };
  [MetadataValidationRule.FUTURE_ONLY]: boolean;
  [MetadataValidationRule.PAST_ONLY]: boolean;
  [MetadataValidationRule.MIN_ITEMS]: number;
  [MetadataValidationRule.MAX_ITEMS]: number;
  [MetadataValidationRule.UNIQUE_ITEMS]: boolean;
  [MetadataValidationRule.ITEM_TYPE]: MetadataFieldType;
  [MetadataValidationRule.REQUIRED_PROPERTIES]: string[];
  [MetadataValidationRule.FORBIDDEN_PROPERTIES]: string[];
  [MetadataValidationRule.PROPERTY_TYPES]: Record<string, MetadataFieldType>;
  [MetadataValidationRule.CUSTOM_FUNCTION]: string;
  [MetadataValidationRule.CONDITIONAL]: string;
  [MetadataValidationRule.DEPENDENT]: string[];
  [MetadataValidationRule.UNIQUE]: boolean;
  [MetadataValidationRule.EXISTS]: string;
  [MetadataValidationRule.NOT_EXISTS]: string;
  [MetadataValidationRule.REFERENCE_VALID]: string;
};

/**
 * Utility type to get validation rule parameter type
 */
export type ValidationRuleParam<T extends MetadataValidationRule> = ValidationRuleParamMap[T];

// ============================================================================
// OPERATION TYPE MAPPING
// ============================================================================

/**
 * Type mapping for operation request data
 * Maps operations to their expected request data types
 */
export type OperationDataMap = {
  [MetadataOperation.CREATE]: JsonObject;
  [MetadataOperation.READ]: { id: UUID };
  [MetadataOperation.UPDATE]: JsonObject;
  [MetadataOperation.DELETE]: { id: UUID };
  [MetadataOperation.ADD_FIELD]: { field: JsonObject };
  [MetadataOperation.REMOVE_FIELD]: { fieldId: UUID };
  [MetadataOperation.MODIFY_FIELD]: { fieldId: UUID; changes: JsonObject };
  [MetadataOperation.RENAME_FIELD]: { fieldId: UUID; newName: string };
  [MetadataOperation.CREATE_SCHEMA]: { schema: JsonObject };
  [MetadataOperation.UPDATE_SCHEMA]: { schemaId: UUID; changes: JsonObject };
  [MetadataOperation.DELETE_SCHEMA]: { schemaId: UUID };
  [MetadataOperation.VALIDATE_SCHEMA]: { schemaId: UUID };
  [MetadataOperation.MIGRATE]: { fromVersion: string; toVersion: string };
  [MetadataOperation.ROLLBACK]: { toVersion: string };
  [MetadataOperation.VALIDATE_MIGRATION]: { migrationId: UUID };
  [MetadataOperation.IMPORT]: { data: JsonObject; format: string };
  [MetadataOperation.EXPORT]: { format: string; filters?: JsonObject };
  [MetadataOperation.BACKUP]: { includeData: boolean };
  [MetadataOperation.RESTORE]: { backupId: UUID };
};

/**
 * Utility type to get operation data type
 */
export type OperationData<T extends MetadataOperation> = OperationDataMap[T];

// ============================================================================
// STATUS TYPE MAPPING
// ============================================================================

/**
 * Type mapping for status transitions
 * Maps current status to allowed next statuses
 */
export type StatusTransitionMap = {
  [MetadataStatus.DRAFT]: MetadataStatus.ACTIVE | MetadataStatus.INACTIVE;
  [MetadataStatus.ACTIVE]: MetadataStatus.INACTIVE | MetadataStatus.DEPRECATED;
  [MetadataStatus.INACTIVE]: MetadataStatus.ACTIVE | MetadataStatus.ARCHIVED;
  [MetadataStatus.DEPRECATED]: MetadataStatus.ARCHIVED;
  [MetadataStatus.ARCHIVED]: MetadataStatus.ACTIVE;
  [MetadataStatus.VALID]: MetadataStatus.INVALID | MetadataStatus.PENDING_VALIDATION;
  [MetadataStatus.INVALID]: MetadataStatus.VALID | MetadataStatus.VALIDATION_ERROR;
  [MetadataStatus.PENDING_VALIDATION]: MetadataStatus.VALID | MetadataStatus.INVALID;
  [MetadataStatus.VALIDATION_ERROR]: MetadataStatus.PENDING_VALIDATION;
  [MetadataStatus.CURRENT]: MetadataStatus.OUTDATED | MetadataStatus.PENDING_UPDATE;
  [MetadataStatus.OUTDATED]: MetadataStatus.CURRENT | MetadataStatus.MIGRATION_REQUIRED;
  [MetadataStatus.PENDING_UPDATE]: MetadataStatus.CURRENT | MetadataStatus.OUTDATED;
  [MetadataStatus.MIGRATION_REQUIRED]: MetadataStatus.CURRENT;
  [MetadataStatus.SYNCED]: MetadataStatus.OUT_OF_SYNC | MetadataStatus.SYNCING;
  [MetadataStatus.OUT_OF_SYNC]: MetadataStatus.SYNCING;
  [MetadataStatus.SYNCING]: MetadataStatus.SYNCED | MetadataStatus.SYNC_ERROR;
  [MetadataStatus.SYNC_ERROR]: MetadataStatus.SYNCING;
};

/**
 * Utility type to get allowed status transitions
 */
export type AllowedStatusTransition<T extends MetadataStatus> = StatusTransitionMap[T];

// ============================================================================
// TYPE GUARD FUNCTIONS
// ============================================================================

/**
 * Type guard for MetadataFieldType
 */
export function isMetadataFieldType(value: unknown): value is MetadataFieldType {
  return Object.values(MetadataFieldType).includes(value as MetadataFieldType);
}

/**
 * Type guard for MetadataValidationRule
 */
export function isMetadataValidationRule(value: unknown): value is MetadataValidationRule {
  return Object.values(MetadataValidationRule).includes(value as MetadataValidationRule);
}

/**
 * Type guard for MetadataOperation
 */
export function isMetadataOperation(value: unknown): value is MetadataOperation {
  return Object.values(MetadataOperation).includes(value as MetadataOperation);
}

/**
 * Type guard for MetadataStatus
 */
export function isMetadataStatus(value: unknown): value is MetadataStatus {
  return Object.values(MetadataStatus).includes(value as MetadataStatus);
}

/**
 * Type guard for MetadataSource
 */
export function isMetadataSource(value: unknown): value is MetadataSource {
  return Object.values(MetadataSource).includes(value as MetadataSource);
}

/**
 * Type guard for MetadataCategory
 */
export function isMetadataCategory(value: unknown): value is MetadataCategory {
  return Object.values(MetadataCategory).includes(value as MetadataCategory);
}

// ============================================================================
// TYPE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates if a value matches the expected type for a given field type
 */
export function validateFieldTypeValue<T extends MetadataFieldType>(
  fieldType: T,
  value: unknown,
): value is FieldTypeToTS<T> {
  switch (fieldType) {
    case MetadataFieldType.STRING:
    case MetadataFieldType.TEXT:
    case MetadataFieldType.RICH_TEXT:
    case MetadataFieldType.MARKDOWN:
    case MetadataFieldType.HTML:
      return typeof value === 'string';

    case MetadataFieldType.NUMBER:
    case MetadataFieldType.FLOAT:
    case MetadataFieldType.DECIMAL:
      return typeof value === 'number' && !isNaN(value);

    case MetadataFieldType.INTEGER:
      return Number.isInteger(value);

    case MetadataFieldType.BOOLEAN:
      return typeof value === 'boolean';

    case MetadataFieldType.DATE:
    case MetadataFieldType.DATETIME:
      return value instanceof Date;

    case MetadataFieldType.TIME:
      return typeof value === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(value);

    case MetadataFieldType.TIMESTAMP:
      return typeof value === 'number' && value > 0;

    case MetadataFieldType.DURATION:
      return typeof value === 'number' && value >= 0;

    case MetadataFieldType.ENUM:
      return typeof value === 'string';

    case MetadataFieldType.JSON:
      return value !== undefined && value !== null;

    case MetadataFieldType.ARRAY:
      return Array.isArray(value);

    case MetadataFieldType.OBJECT:
      return typeof value === 'object' && value !== null && !Array.isArray(value);

    case MetadataFieldType.RELATION:
    case MetadataFieldType.REFERENCE:
    case MetadataFieldType.FOREIGN_KEY:
    case MetadataFieldType.UUID:
      return (
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
      );

    case MetadataFieldType.EMAIL:
      return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    case MetadataFieldType.URL:
      return typeof value === 'string' && /^https?:\/\/.+/.test(value);

    case MetadataFieldType.PHONE:
      return typeof value === 'string' && /^\+[\d\s\-\(\)]+$/.test(value);

    case MetadataFieldType.IP_ADDRESS:
      return (
        typeof value === 'string' &&
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
          value,
        )
      );

    case MetadataFieldType.GEO_LOCATION:
      return (
        typeof value === 'object' &&
        value !== null &&
        'latitude' in value &&
        'longitude' in value &&
        typeof (value as any).latitude === 'number' &&
        typeof (value as any).longitude === 'number'
      );

    case MetadataFieldType.CURRENCY:
      return typeof value === 'number' && value >= 0;

    case MetadataFieldType.PERCENTAGE:
      return typeof value === 'number' && value >= 0 && value <= 100;

    case MetadataFieldType.BINARY:
      return value instanceof Uint8Array;

    case MetadataFieldType.BASE64:
      return typeof value === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(value);

    case MetadataFieldType.BLOB:
      return value instanceof Blob;

    case MetadataFieldType.FILE:
    case MetadataFieldType.IMAGE:
    case MetadataFieldType.DOCUMENT:
    case MetadataFieldType.VIDEO:
    case MetadataFieldType.AUDIO:
      return value instanceof File;

    case MetadataFieldType.CUSTOM:
    case MetadataFieldType.COMPUTED:
    case MetadataFieldType.VIRTUAL:
      return true; // Custom types can be anything

    default:
      return false;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the default value for a given field type
 */
export function getDefaultValueForFieldType<T extends MetadataFieldType>(
  fieldType: T,
): FieldTypeToTS<T> {
  switch (fieldType) {
    case MetadataFieldType.STRING:
    case MetadataFieldType.TEXT:
    case MetadataFieldType.RICH_TEXT:
    case MetadataFieldType.MARKDOWN:
    case MetadataFieldType.HTML:
    case MetadataFieldType.EMAIL:
    case MetadataFieldType.URL:
    case MetadataFieldType.PHONE:
    case MetadataFieldType.IP_ADDRESS:
    case MetadataFieldType.BASE64:
    case MetadataFieldType.TIME:
    case MetadataFieldType.ENUM:
      return '' as FieldTypeToTS<T>;

    case MetadataFieldType.NUMBER:
    case MetadataFieldType.INTEGER:
    case MetadataFieldType.FLOAT:
    case MetadataFieldType.DECIMAL:
    case MetadataFieldType.CURRENCY:
    case MetadataFieldType.PERCENTAGE:
    case MetadataFieldType.DURATION:
      return 0 as FieldTypeToTS<T>;

    case MetadataFieldType.BOOLEAN:
      return false as FieldTypeToTS<T>;

    case MetadataFieldType.DATE:
    case MetadataFieldType.DATETIME:
      return new Date() as FieldTypeToTS<T>;

    case MetadataFieldType.TIMESTAMP:
      return Date.now() as FieldTypeToTS<T>;

    case MetadataFieldType.JSON:
      return null as FieldTypeToTS<T>;

    case MetadataFieldType.ARRAY:
      return [] as FieldTypeToTS<T>;

    case MetadataFieldType.OBJECT:
      return {} as FieldTypeToTS<T>;

    case MetadataFieldType.GEO_LOCATION:
      return { latitude: 0, longitude: 0 } as FieldTypeToTS<T>;

    case MetadataFieldType.BINARY:
      return new Uint8Array() as FieldTypeToTS<T>;

    case MetadataFieldType.RELATION:
    case MetadataFieldType.REFERENCE:
    case MetadataFieldType.FOREIGN_KEY:
    case MetadataFieldType.UUID:
      return '' as FieldTypeToTS<T>;

    case MetadataFieldType.BLOB:
    case MetadataFieldType.FILE:
    case MetadataFieldType.IMAGE:
    case MetadataFieldType.DOCUMENT:
    case MetadataFieldType.VIDEO:
    case MetadataFieldType.AUDIO:
      return null as FieldTypeToTS<T>;

    case MetadataFieldType.CUSTOM:
    case MetadataFieldType.COMPUTED:
    case MetadataFieldType.VIRTUAL:
      return null as FieldTypeToTS<T>;

    default:
      return null as FieldTypeToTS<T>;
  }
}

/**
 * Converts a value to the specified field type
 */
export function convertValueToFieldType<T extends MetadataFieldType>(
  value: unknown,
  fieldType: T,
): FieldTypeToTS<T> | null {
  try {
    switch (fieldType) {
      case MetadataFieldType.STRING:
      case MetadataFieldType.TEXT:
      case MetadataFieldType.RICH_TEXT:
      case MetadataFieldType.MARKDOWN:
      case MetadataFieldType.HTML:
        return String(value) as FieldTypeToTS<T>;

      case MetadataFieldType.NUMBER:
      case MetadataFieldType.FLOAT:
      case MetadataFieldType.DECIMAL:
        const num = Number(value);
        return isNaN(num) ? null : (num as FieldTypeToTS<T>);

      case MetadataFieldType.INTEGER:
        const int = parseInt(String(value), 10);
        return isNaN(int) ? null : (int as FieldTypeToTS<T>);

      case MetadataFieldType.BOOLEAN:
        if (typeof value === 'boolean') return value as FieldTypeToTS<T>;
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          return (lower === 'true' || lower === '1' || lower === 'yes') as FieldTypeToTS<T>;
        }
        if (typeof value === 'number') return (value !== 0) as FieldTypeToTS<T>;
        return false as FieldTypeToTS<T>;

      case MetadataFieldType.DATE:
      case MetadataFieldType.DATETIME:
        if (value instanceof Date) return value as FieldTypeToTS<T>;
        if (typeof value === 'string' || typeof value === 'number') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : (date as FieldTypeToTS<T>);
        }
        return null;

      case MetadataFieldType.TIMESTAMP:
        if (typeof value === 'number') return value as FieldTypeToTS<T>;
        if (typeof value === 'string') {
          const timestamp = parseInt(value, 10);
          return isNaN(timestamp) ? null : (timestamp as FieldTypeToTS<T>);
        }
        if (value instanceof Date) return value.getTime() as FieldTypeToTS<T>;
        return null;

      case MetadataFieldType.JSON:
        if (typeof value === 'string') {
          try {
            return JSON.parse(value) as FieldTypeToTS<T>;
          } catch {
            return null;
          }
        }
        return value as FieldTypeToTS<T>;

      case MetadataFieldType.ARRAY:
        if (Array.isArray(value)) return value as FieldTypeToTS<T>;
        return [value] as FieldTypeToTS<T>;

      case MetadataFieldType.OBJECT:
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return value as FieldTypeToTS<T>;
        }
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return typeof parsed === 'object' && parsed !== null
              ? (parsed as FieldTypeToTS<T>)
              : null;
          } catch {
            return null;
          }
        }
        return null;

      default:
        return value as FieldTypeToTS<T>;
    }
  } catch {
    return null;
  }
}

// ============================================================================
// TYPE COERCION UTILITIES
// ============================================================================

/**
 * Coerces a value to the specified field type with enhanced error handling
 * This is a more focused and efficient version of convertValueToFieldType
 */
export function coerceToType<T extends MetadataFieldType>(
  value: unknown,
  type: T,
): FieldTypeToTS<T> | null {
  try {
    switch (type) {
      case MetadataFieldType.STRING:
      case MetadataFieldType.TEXT:
      case MetadataFieldType.RICH_TEXT:
      case MetadataFieldType.MARKDOWN:
      case MetadataFieldType.HTML:
      case MetadataFieldType.TIME:
      case MetadataFieldType.ENUM:
        return String(value) as FieldTypeToTS<T>;

      case MetadataFieldType.NUMBER:
      case MetadataFieldType.FLOAT:
      case MetadataFieldType.DECIMAL:
        const num = Number(value);
        return isNaN(num) ? null : (num as FieldTypeToTS<T>);

      case MetadataFieldType.INTEGER:
        const int = parseInt(String(value), 10);
        return isNaN(int) ? null : (int as FieldTypeToTS<T>);

      case MetadataFieldType.BOOLEAN:
        return !!value as FieldTypeToTS<T>;

      case MetadataFieldType.DATE:
      case MetadataFieldType.DATETIME:
        const date = new Date(value as string);
        return isNaN(date.getTime()) ? null : (date as FieldTypeToTS<T>);

      case MetadataFieldType.TIMESTAMP:
        if (typeof value === 'number') return value as FieldTypeToTS<T>;
        if (typeof value === 'string') {
          const timestamp = parseInt(value, 10);
          return isNaN(timestamp) ? null : (timestamp as FieldTypeToTS<T>);
        }
        if (value instanceof Date) return value.getTime() as FieldTypeToTS<T>;
        return null;

      case MetadataFieldType.DURATION:
        const duration = Number(value);
        return isNaN(duration) || duration < 0 ? null : (duration as FieldTypeToTS<T>);

      case MetadataFieldType.JSON:
        try {
          return typeof value === 'string'
            ? (JSON.parse(value) as FieldTypeToTS<T>)
            : (value as FieldTypeToTS<T>);
        } catch {
          return null;
        }

      case MetadataFieldType.ARRAY:
        return Array.isArray(value) ? (value as FieldTypeToTS<T>) : ([value] as FieldTypeToTS<T>);

      case MetadataFieldType.OBJECT:
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return value as FieldTypeToTS<T>;
        }
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return typeof parsed === 'object' && parsed !== null
              ? (parsed as FieldTypeToTS<T>)
              : null;
          } catch {
            return null;
          }
        }
        return null;

      case MetadataFieldType.RELATION:
      case MetadataFieldType.REFERENCE:
      case MetadataFieldType.FOREIGN_KEY:
      case MetadataFieldType.UUID:
        const uuid = String(value);
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
          ? (uuid as FieldTypeToTS<T>)
          : null;

      case MetadataFieldType.EMAIL:
        const email = String(value);
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (email as FieldTypeToTS<T>) : null;

      case MetadataFieldType.URL:
        const url = String(value);
        return /^https?:\/\/.+/.test(url) ? (url as FieldTypeToTS<T>) : null;

      case MetadataFieldType.PHONE:
        const phone = String(value);
        return /^\+[\d\s\-\(\)]+$/.test(phone) ? (phone as FieldTypeToTS<T>) : null;

      case MetadataFieldType.IP_ADDRESS:
        const ip = String(value);
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
          ip,
        )
          ? (ip as FieldTypeToTS<T>)
          : null;

      case MetadataFieldType.GEO_LOCATION:
        if (
          typeof value === 'object' &&
          value !== null &&
          'latitude' in value &&
          'longitude' in value
        ) {
          const geo = value as { latitude: number; longitude: number };
          return geo.latitude >= -90 &&
            geo.latitude <= 90 &&
            geo.longitude >= -180 &&
            geo.longitude <= 180
            ? (geo as FieldTypeToTS<T>)
            : null;
        }
        return null;

      case MetadataFieldType.CURRENCY:
        const currency = Number(value);
        return isNaN(currency) || currency < 0 ? null : (currency as FieldTypeToTS<T>);

      case MetadataFieldType.PERCENTAGE:
        const percentage = Number(value);
        return isNaN(percentage) || percentage < 0 || percentage > 100
          ? null
          : (percentage as FieldTypeToTS<T>);

      case MetadataFieldType.BINARY:
        if (value instanceof Uint8Array) return value as FieldTypeToTS<T>;
        if (typeof value === 'string') {
          try {
            return new Uint8Array(Buffer.from(value, 'base64')) as FieldTypeToTS<T>;
          } catch {
            return null;
          }
        }
        return null;

      case MetadataFieldType.BASE64:
        const base64 = String(value);
        return /^[A-Za-z0-9+/]*={0,2}$/.test(base64) ? (base64 as FieldTypeToTS<T>) : null;

      case MetadataFieldType.BLOB:
        if (value instanceof Blob) return value as FieldTypeToTS<T>;
        return null;

      case MetadataFieldType.FILE:
      case MetadataFieldType.IMAGE:
      case MetadataFieldType.DOCUMENT:
      case MetadataFieldType.VIDEO:
      case MetadataFieldType.AUDIO:
        if (value instanceof File) return value as FieldTypeToTS<T>;
        return null;

      case MetadataFieldType.CUSTOM:
      case MetadataFieldType.COMPUTED:
      case MetadataFieldType.VIRTUAL:
        return value as FieldTypeToTS<T>;

      default:
        return value as FieldTypeToTS<T>;
    }
  } catch {
    return null;
  }
}

/**
 * Coerces multiple values to their respective field types
 */
export function coerceMultipleToTypes<T extends Record<string, MetadataFieldType>>(
  values: Record<string, unknown>,
  types: T,
): { [K in keyof T]: FieldTypeToTS<T[K]> | null } {
  const result = {} as { [K in keyof T]: FieldTypeToTS<T[K]> | null };

  for (const [key, type] of Object.entries(types)) {
    result[key as keyof T] = coerceToType(values[key], type);
  }

  return result;
}

/**
 * Coerces a value to the specified field type with fallback
 */
export function coerceToTypeWithFallback<T extends MetadataFieldType>(
  value: unknown,
  type: T,
  fallback: FieldTypeToTS<T>,
): FieldTypeToTS<T> {
  const coerced = coerceToType(value, type);
  return coerced !== null ? coerced : fallback;
}

/**
 * Coerces a value to the specified field type with validation
 */
export function coerceToTypeWithValidation<T extends MetadataFieldType>(
  value: unknown,
  type: T,
  validator?: (value: FieldTypeToTS<T>) => boolean,
): FieldTypeToTS<T> | null {
  const coerced = coerceToType(value, type);
  if (coerced === null) return null;

  if (validator && !validator(coerced)) {
    return null;
  }

  return coerced;
}

// ============================================================================
// TYPE CONSTANTS
// ============================================================================

/**
 * Constants for common field type groupings
 */
export const FIELD_TYPE_GROUPS = {
  STRING_TYPES: [
    MetadataFieldType.STRING,
    MetadataFieldType.TEXT,
    MetadataFieldType.RICH_TEXT,
    MetadataFieldType.MARKDOWN,
    MetadataFieldType.HTML,
    MetadataFieldType.EMAIL,
    MetadataFieldType.URL,
    MetadataFieldType.PHONE,
    MetadataFieldType.IP_ADDRESS,
    MetadataFieldType.BASE64,
    MetadataFieldType.TIME,
    MetadataFieldType.ENUM,
  ] as const,

  NUMERIC_TYPES: [
    MetadataFieldType.NUMBER,
    MetadataFieldType.INTEGER,
    MetadataFieldType.FLOAT,
    MetadataFieldType.DECIMAL,
    MetadataFieldType.CURRENCY,
    MetadataFieldType.PERCENTAGE,
    MetadataFieldType.DURATION,
    MetadataFieldType.TIMESTAMP,
  ] as const,

  DATE_TYPES: [MetadataFieldType.DATE, MetadataFieldType.DATETIME] as const,

  REFERENCE_TYPES: [
    MetadataFieldType.RELATION,
    MetadataFieldType.REFERENCE,
    MetadataFieldType.FOREIGN_KEY,
    MetadataFieldType.UUID,
  ] as const,

  FILE_TYPES: [
    MetadataFieldType.FILE,
    MetadataFieldType.IMAGE,
    MetadataFieldType.DOCUMENT,
    MetadataFieldType.VIDEO,
    MetadataFieldType.AUDIO,
    MetadataFieldType.BLOB,
  ] as const,

  COMPLEX_TYPES: [
    MetadataFieldType.JSON,
    MetadataFieldType.ARRAY,
    MetadataFieldType.OBJECT,
    MetadataFieldType.GEO_LOCATION,
  ] as const,
} as const;
