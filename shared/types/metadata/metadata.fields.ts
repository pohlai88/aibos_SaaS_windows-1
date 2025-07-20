/**
 * Enterprise-grade metadata field types for the AI-BOS platform
 *
 * This module provides comprehensive field type definitions with discriminated unions,
 * ensuring type safety and proper field-specific configurations.
 */

import { MetadataStatus, MetadataSource, MetadataCategory } from './metadata.enums';
import type { MetadataFieldType, MetadataValidationRule } from './metadata.enums';
import type {
  UUID,
  JsonValue,
  JsonObject,
  Percentage,
  CurrencyAmount,
  Integer,
  Float,
} from '../primitives';
import type { ISODate } from '../primitives';
import type { FieldTypeToTS } from './metadata.mapping';

// ============================================================================
// BASE FIELD INTERFACES
// ============================================================================

/**
 * Base metadata field interface with common properties
 */
export interface BaseMetadataField {
  id: UUID;
  type: MetadataFieldType;
  key: string;
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  validationRules?: MetadataValidationRule[];
  status: MetadataStatus;
  source: MetadataSource;
  category: MetadataCategory;
  createdAt: ISODate;
  updatedAt: ISODate;
  createdBy: UUID;
  updatedBy: UUID;
  tenantId?: UUID;
  tags?: string[];
  metadata?: JsonObject;
}

/**
 * Base field with common configuration options
 */
export interface BaseFieldConfig {
  isReadOnly?: boolean;
  isHidden?: boolean;
  isDeprecated?: boolean;
  isSensitive?: boolean;
  isComputed?: boolean;
  isVirtual?: boolean;
  isTransient?: boolean;
  isNullable?: boolean;
  isOptional?: boolean;
  isImmutable?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  isFilterable?: boolean;
  isExportable?: boolean;
  isImportable?: boolean;
  isAuditable?: boolean;
  isVersioned?: boolean;
  isEncrypted?: boolean;
  isCompressed?: boolean;
  isIndexed?: boolean;
  isCached?: boolean;
  displayOrder?: number;
  displayFormat?: string;
  displayWidth?: number;
  displayHeight?: number;
  displayType?: string;
  displayOptions?: JsonObject;
  validationMessage?: string;
  helpText?: string;
  placeholder?: string;
  tooltip?: string;
  examples?: string[];
  documentation?: string;
  deprecationNotice?: string;
  migrationPath?: string;
  custom?: JsonObject;
}

// ============================================================================
// STRING FIELD TYPES
// ============================================================================

/**
 * String field with string-specific configuration
 */
export interface StringMetadataField extends BaseMetadataField {
  type: MetadataFieldType.STRING;
  defaultValue?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
  };
  config?: BaseFieldConfig & {
    multiline?: boolean;
    password?: boolean;
    autocomplete?: boolean;
    spellcheck?: boolean;
    caseSensitive?: boolean;
    trimWhitespace?: boolean;
  };
}

/**
 * Text field for long text content
 */
export interface TextMetadataField extends BaseMetadataField {
  type: MetadataFieldType.TEXT;
  defaultValue?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  config?: BaseFieldConfig & {
    multiline?: boolean;
    spellcheck?: boolean;
    wordWrap?: boolean;
    lineNumbers?: boolean;
    syntaxHighlighting?: string;
  };
}

/**
 * Rich text field with formatting capabilities
 */
export interface RichTextMetadataField extends BaseMetadataField {
  type: MetadataFieldType.RICH_TEXT;
  defaultValue?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    allowedTags?: string[];
    forbiddenTags?: string[];
  };
  config?: BaseFieldConfig & {
    editorType?: 'wysiwyg' | 'markdown' | 'html';
    toolbar?: string[];
    plugins?: string[];
    maxImageSize?: number;
    allowedFileTypes?: string[];
  };
}

/**
 * Markdown field for markdown content
 */
export interface MarkdownMetadataField extends BaseMetadataField {
  type: MetadataFieldType.MARKDOWN;
  defaultValue?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
  };
  config?: BaseFieldConfig & {
    preview?: boolean;
    livePreview?: boolean;
    syntaxHighlighting?: boolean;
    extensions?: string[];
  };
}

/**
 * HTML field for HTML content
 */
export interface HtmlMetadataField extends BaseMetadataField {
  type: MetadataFieldType.HTML;
  defaultValue?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    allowedTags?: string[];
    forbiddenTags?: string[];
    allowedAttributes?: string[];
    forbiddenAttributes?: string[];
  };
  config?: BaseFieldConfig & {
    sanitize?: boolean;
    allowedProtocols?: string[];
    maxImageSize?: number;
  };
}

// ============================================================================
// NUMERIC FIELD TYPES
// ============================================================================

/**
 * Number field for floating-point numbers
 */
export interface NumberMetadataField extends BaseMetadataField {
  type: MetadataFieldType.NUMBER;
  defaultValue?: number;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    precision?: number;
    scale?: number;
    step?: number;
  };
  config?: BaseFieldConfig & {
    format?: 'decimal' | 'scientific' | 'currency' | 'percentage';
    currency?: string;
    locale?: string;
    showSpinner?: boolean;
    allowNegative?: boolean;
  };
}

/**
 * Integer field for whole numbers
 */
export interface IntegerMetadataField extends BaseMetadataField {
  type: MetadataFieldType.INTEGER;
  defaultValue?: Integer;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    step?: number;
  };
  config?: BaseFieldConfig & {
    format?: 'decimal' | 'binary' | 'octal' | 'hex';
    showSpinner?: boolean;
    allowNegative?: boolean;
  };
}

/**
 * Float field for floating-point numbers
 */
export interface FloatMetadataField extends BaseMetadataField {
  type: MetadataFieldType.FLOAT;
  defaultValue?: Float;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    precision?: number;
    scale?: number;
  };
  config?: BaseFieldConfig & {
    format?: 'decimal' | 'scientific';
    precision?: number;
    showSpinner?: boolean;
    allowNegative?: boolean;
  };
}

/**
 * Decimal field for precise decimal numbers
 */
export interface DecimalMetadataField extends BaseMetadataField {
  type: MetadataFieldType.DECIMAL;
  defaultValue?: number;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    precision?: number;
    scale?: number;
  };
  config?: BaseFieldConfig & {
    format?: 'decimal' | 'currency';
    currency?: string;
    locale?: string;
    precision?: number;
  };
}

/**
 * Currency field for monetary values
 */
export interface CurrencyMetadataField extends BaseMetadataField {
  type: MetadataFieldType.CURRENCY;
  defaultValue?: CurrencyAmount;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    precision?: number;
  };
  config?: BaseFieldConfig & {
    currency: string;
    locale?: string;
    format?: 'symbol' | 'code' | 'name';
    showSymbol?: boolean;
    allowNegative?: boolean;
  };
}

/**
 * Percentage field for percentage values
 */
export interface PercentageMetadataField extends BaseMetadataField {
  type: MetadataFieldType.PERCENTAGE;
  defaultValue?: Percentage;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    precision?: number;
  };
  config?: BaseFieldConfig & {
    format?: 'decimal' | 'fraction';
    showSymbol?: boolean;
    precision?: number;
  };
}

// ============================================================================
// DATE AND TIME FIELD TYPES
// ============================================================================

/**
 * Date field for date values
 */
export interface DateMetadataField extends BaseMetadataField {
  type: MetadataFieldType.DATE;
  defaultValue?: Date;
  constraints?: {
    minDate?: Date;
    maxDate?: Date;
    format?: string;
  };
  config?: BaseFieldConfig & {
    format?: string;
    locale?: string;
    timezone?: string;
    showCalendar?: boolean;
    allowFuture?: boolean;
    allowPast?: boolean;
  };
}

/**
 * DateTime field for date and time values
 */
export interface DateTimeMetadataField extends BaseMetadataField {
  type: MetadataFieldType.DATETIME;
  defaultValue?: Date;
  constraints?: {
    minDate?: Date;
    maxDate?: Date;
    format?: string;
  };
  config?: BaseFieldConfig & {
    format?: string;
    locale?: string;
    timezone?: string;
    showCalendar?: boolean;
    showTime?: boolean;
    allowFuture?: boolean;
    allowPast?: boolean;
  };
}

/**
 * Time field for time values
 */
export interface TimeMetadataField extends BaseMetadataField {
  type: MetadataFieldType.TIME;
  defaultValue?: string;
  constraints?: {
    minTime?: string;
    maxTime?: string;
    format?: string;
  };
  config?: BaseFieldConfig & {
    format?: string;
    showSeconds?: boolean;
    showMilliseconds?: boolean;
    step?: number;
  };
}

/**
 * Timestamp field for Unix timestamps
 */
export interface TimestampMetadataField extends BaseMetadataField {
  type: MetadataFieldType.TIMESTAMP;
  defaultValue?: number;
  constraints?: {
    minValue?: number;
    maxValue?: number;
  };
  config?: BaseFieldConfig & {
    format?: 'seconds' | 'milliseconds';
    timezone?: string;
    displayFormat?: string;
  };
}

/**
 * Duration field for time durations
 */
export interface DurationMetadataField extends BaseMetadataField {
  type: MetadataFieldType.DURATION;
  defaultValue?: number;
  constraints?: {
    minValue?: number;
    maxValue?: number;
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
  };
  config?: BaseFieldConfig & {
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
    displayFormat?: string;
    allowNegative?: boolean;
  };
}

// ============================================================================
// SPECIALIZED FIELD TYPES
// ============================================================================

/**
 * Email field for email addresses
 */
export interface EmailMetadataField extends BaseMetadataField {
  type: MetadataFieldType.EMAIL;
  defaultValue?: string;
  constraints?: {
    pattern?: string;
    domain?: string[];
    forbiddenDomains?: string[];
  };
  config?: BaseFieldConfig & {
    autocomplete?: boolean;
    validateOnBlur?: boolean;
    showSuggestions?: boolean;
  };
}

/**
 * URL field for web addresses
 */
export interface UrlMetadataField extends BaseMetadataField {
  type: MetadataFieldType.URL;
  defaultValue?: string;
  constraints?: {
    pattern?: string;
    allowedProtocols?: string[];
    forbiddenProtocols?: string[];
  };
  config?: BaseFieldConfig & {
    validateOnBlur?: boolean;
    showPreview?: boolean;
    openInNewTab?: boolean;
  };
}

/**
 * Phone field for phone numbers
 */
export interface PhoneMetadataField extends BaseMetadataField {
  type: MetadataFieldType.PHONE;
  defaultValue?: string;
  constraints?: {
    pattern?: string;
    countryCode?: string;
  };
  config?: BaseFieldConfig & {
    format?: string;
    countryCode?: string;
    showCountrySelector?: boolean;
    validateOnBlur?: boolean;
  };
}

/**
 * UUID field for unique identifiers
 */
export interface UuidMetadataField extends BaseMetadataField {
  type: MetadataFieldType.UUID;
  defaultValue?: string;
  constraints?: {
    version?: 'v1' | 'v4' | 'v5';
  };
  config?: BaseFieldConfig & {
    autoGenerate?: boolean;
    version?: 'v1' | 'v4' | 'v5';
    namespace?: string;
  };
}

/**
 * IP Address field for IP addresses
 */
export interface IpAddressMetadataField extends BaseMetadataField {
  type: MetadataFieldType.IP_ADDRESS;
  defaultValue?: string;
  constraints?: {
    version?: 'v4' | 'v6';
    allowedRanges?: string[];
    forbiddenRanges?: string[];
  };
  config?: BaseFieldConfig & {
    version?: 'v4' | 'v6';
    validateOnBlur?: boolean;
  };
}

/**
 * Geo Location field for geographical coordinates
 */
export interface GeoLocationMetadataField extends BaseMetadataField {
  type: MetadataFieldType.GEO_LOCATION;
  defaultValue?: { latitude: number; longitude: number };
  constraints?: {
    minLatitude?: number;
    maxLatitude?: number;
    minLongitude?: number;
    maxLongitude?: number;
    precision?: number;
  };
  config?: BaseFieldConfig & {
    mapProvider?: 'google' | 'openstreetmap' | 'mapbox';
    showMap?: boolean;
    allowReverseGeocoding?: boolean;
    precision?: number;
  };
}

// ============================================================================
// ENUMERATION FIELD TYPES
// ============================================================================

/**
 * Enum field for predefined options
 */
export interface EnumMetadataField extends BaseMetadataField {
  type: MetadataFieldType.ENUM;
  options: string[];
  defaultValue?: string;
  constraints?: {
    allowMultiple?: boolean;
    allowCustom?: boolean;
    maxSelections?: number;
  };
  config?: BaseFieldConfig & {
    displayType?: 'select' | 'radio' | 'checkbox' | 'buttons';
    allowMultiple?: boolean;
    allowCustom?: boolean;
    searchable?: boolean;
    sortable?: boolean;
    groupable?: boolean;
  };
}

// ============================================================================
// COMPLEX FIELD TYPES
// ============================================================================

/**
 * JSON field for JSON data
 */
export interface JsonMetadataField extends BaseMetadataField {
  type: MetadataFieldType.JSON;
  defaultValue?: JsonValue;
  constraints?: {
    schema?: JsonObject;
    maxDepth?: number;
    maxSize?: number;
  };
  config?: BaseFieldConfig & {
    editorType?: 'tree' | 'code' | 'form';
    syntaxHighlighting?: boolean;
    validateSchema?: boolean;
    prettyPrint?: boolean;
  };
}

/**
 * Array field for array data
 */
export interface ArrayMetadataField extends BaseMetadataField {
  type: MetadataFieldType.ARRAY;
  defaultValue?: unknown[];
  constraints?: {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    itemType?: MetadataFieldType;
  };
  config?: BaseFieldConfig & {
    displayType?: 'list' | 'grid' | 'table';
    allowAdd?: boolean;
    allowRemove?: boolean;
    allowReorder?: boolean;
    allowDuplicate?: boolean;
  };
}

/**
 * Object field for object data
 */
export interface ObjectMetadataField extends BaseMetadataField {
  type: MetadataFieldType.OBJECT;
  defaultValue?: JsonObject;
  constraints?: {
    requiredProperties?: string[];
    forbiddenProperties?: string[];
    propertyTypes?: Record<string, MetadataFieldType>;
  };
  config?: BaseFieldConfig & {
    displayType?: 'form' | 'tree' | 'code';
    collapsible?: boolean;
    allowAddProperties?: boolean;
    allowRemoveProperties?: boolean;
  };
}

// ============================================================================
// REFERENCE FIELD TYPES
// ============================================================================

/**
 * Relation field for entity relationships
 */
export interface RelationMetadataField extends BaseMetadataField {
  type: MetadataFieldType.RELATION;
  defaultValue?: UUID;
  constraints?: {
    targetSchema: string;
    targetField: string;
    relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  };
  config?: BaseFieldConfig & {
    displayType?: 'select' | 'autocomplete' | 'modal';
    searchable?: boolean;
    allowCreate?: boolean;
    allowEdit?: boolean;
    cascadeDelete?: boolean;
  };
}

/**
 * Reference field for entity references
 */
export interface ReferenceMetadataField extends BaseMetadataField {
  type: MetadataFieldType.REFERENCE;
  defaultValue?: UUID;
  constraints?: {
    targetSchema: string;
    targetField: string;
  };
  config?: BaseFieldConfig & {
    displayType?: 'select' | 'autocomplete' | 'modal';
    searchable?: boolean;
    allowCreate?: boolean;
    allowEdit?: boolean;
  };
}

/**
 * Foreign Key field for database foreign keys
 */
export interface ForeignKeyMetadataField extends BaseMetadataField {
  type: MetadataFieldType.FOREIGN_KEY;
  defaultValue?: UUID;
  constraints?: {
    targetTable: string;
    targetColumn: string;
    onDelete: 'cascade' | 'set-null' | 'restrict' | 'no-action';
    onUpdate: 'cascade' | 'set-null' | 'restrict' | 'no-action';
  };
  config?: BaseFieldConfig & {
    displayType?: 'select' | 'autocomplete';
    searchable?: boolean;
    allowCreate?: boolean;
  };
}

// ============================================================================
// FILE AND BINARY FIELD TYPES
// ============================================================================

/**
 * File field for file uploads
 */
export interface FileMetadataField extends BaseMetadataField {
  type: MetadataFieldType.FILE;
  defaultValue?: File;
  constraints?: {
    maxSize?: number;
    allowedTypes?: string[];
    forbiddenTypes?: string[];
    maxFiles?: number;
  };
  config?: BaseFieldConfig & {
    uploadType?: 'single' | 'multiple';
    dragAndDrop?: boolean;
    progressBar?: boolean;
    preview?: boolean;
    allowDelete?: boolean;
  };
}

/**
 * Image field for image uploads
 */
export interface ImageMetadataField extends BaseMetadataField {
  type: MetadataFieldType.IMAGE;
  defaultValue?: File;
  constraints?: {
    maxSize?: number;
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  };
  config?: BaseFieldConfig & {
    crop?: boolean;
    resize?: boolean;
    thumbnail?: boolean;
    preview?: boolean;
    altText?: boolean;
  };
}

/**
 * Binary field for binary data
 */
export interface BinaryMetadataField extends BaseMetadataField {
  type: MetadataFieldType.BINARY;
  defaultValue?: Uint8Array;
  constraints?: {
    maxSize?: number;
    encoding?: string;
  };
  config?: BaseFieldConfig & {
    encoding?: string;
    download?: boolean;
    preview?: boolean;
  };
}

/**
 * Base64 field for base64 encoded data
 */
export interface Base64MetadataField extends BaseMetadataField {
  type: MetadataFieldType.BASE64;
  defaultValue?: string;
  constraints?: {
    maxSize?: number;
    encoding?: string;
  };
  config?: BaseFieldConfig & {
    encoding?: string;
    download?: boolean;
    preview?: boolean;
  };
}

// ============================================================================
// CUSTOM FIELD TYPES
// ============================================================================

/**
 * Custom field for custom implementations
 */
export interface CustomMetadataField extends BaseMetadataField {
  type: MetadataFieldType.CUSTOM;
  defaultValue?: unknown;
  constraints?: {
    customValidation?: string;
    customRules?: JsonObject;
  };
  config?: BaseFieldConfig & {
    customRenderer?: string;
    customValidator?: string;
    customConfig?: JsonObject;
  };
}

/**
 * Computed field for computed values
 */
export interface ComputedMetadataField extends BaseMetadataField {
  type: MetadataFieldType.COMPUTED;
  defaultValue?: unknown;
  constraints?: {
    expression: string;
    dependencies: string[];
    language: 'javascript' | 'sql' | 'formula';
  };
  config?: BaseFieldConfig & {
    cacheDuration?: number;
    updateOnChange?: boolean;
    errorHandling?: 'strict' | 'lenient';
  };
}

/**
 * Virtual field for virtual properties
 */
export interface VirtualMetadataField extends BaseMetadataField {
  type: MetadataFieldType.VIRTUAL;
  defaultValue?: unknown;
  constraints?: {
    getter?: string;
    setter?: string;
  };
  config?: BaseFieldConfig & {
    persistent?: boolean;
    serializable?: boolean;
  };
}

// ============================================================================
// UNION TYPE
// ============================================================================

/**
 * Union type for all metadata field types
 */
export type MetadataField =
  | StringMetadataField
  | TextMetadataField
  | RichTextMetadataField
  | MarkdownMetadataField
  | HtmlMetadataField
  | NumberMetadataField
  | IntegerMetadataField
  | FloatMetadataField
  | DecimalMetadataField
  | CurrencyMetadataField
  | PercentageMetadataField
  | DateMetadataField
  | DateTimeMetadataField
  | TimeMetadataField
  | TimestampMetadataField
  | DurationMetadataField
  | EmailMetadataField
  | UrlMetadataField
  | PhoneMetadataField
  | UuidMetadataField
  | IpAddressMetadataField
  | GeoLocationMetadataField
  | EnumMetadataField
  | JsonMetadataField
  | ArrayMetadataField
  | ObjectMetadataField
  | RelationMetadataField
  | ReferenceMetadataField
  | ForeignKeyMetadataField
  | FileMetadataField
  | ImageMetadataField
  | BinaryMetadataField
  | Base64MetadataField
  | CustomMetadataField
  | ComputedMetadataField
  | VirtualMetadataField;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard to check if a field is a specific type
 */
export type FieldTypeGuard<T extends MetadataFieldType> = MetadataField extends { type: T }
  ? MetadataField & { type: T }
  : never;

/**
 * Extract field type from MetadataField union
 */
export type ExtractFieldType<T extends MetadataFieldType> = MetadataField extends { type: T }
  ? MetadataField & { type: T }
  : never;

/**
 * Type-safe field creation helper
 */
export function createMetadataField<T extends MetadataFieldType>(
  type: T,
  config: Omit<
    ExtractFieldType<T>,
    'type' | 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
  >,
): ExtractFieldType<T> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  return {
    id,
    type,
    createdAt: now,
    updatedAt: now,
    createdBy: 'system' as UUID,
    updatedBy: 'system' as UUID,
    status: MetadataStatus.DRAFT,
    source: MetadataSource.SYSTEM,
    category: MetadataCategory.CORE,
    ...config,
  } as ExtractFieldType<T>;
}
