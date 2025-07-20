import { z } from 'zod';
import type {
  MetadataFieldType,
  MetadataFieldTypes,
  MetadataOperationType,
  MetadataOperationTypes,
  MetadataValidationRule,
  MetadataValidationRules,
} from './metadata.enums';
import type {
  MetadataField,
  MetadataEntity,
  MetadataValue,
  MetadataFieldConfig,
  MetadataConstraint,
  MetadataComputedField,
} from './metadata.types';

// ============================================================================
// QUERY OPERATORS
// ============================================================================

export const MetadataQueryOperator = {
  // Comparison operators
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  GREATER_THAN_EQUAL: 'greater_than_equal',
  LESS_THAN: 'less_than',
  LESS_THAN_EQUAL: 'less_than_equal',

  // String operators
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  REGEX: 'regex',
  LIKE: 'like',
  ILIKE: 'ilike',

  // Array operators
  IN: 'in',
  NOT_IN: 'not_in',
  ARRAY_CONTAINS: 'array_contains',
  ARRAY_CONTAINS_ALL: 'array_contains_all',
  ARRAY_CONTAINS_ANY: 'array_contains_any',

  // Null operators
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',

  // Date/Time operators
  BETWEEN: 'between',
  NOT_BETWEEN: 'not_between',
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  THIS_YEAR: 'this_year',

  // Geo operators
  NEAR: 'near',
  WITHIN: 'within',
  INTERSECTS: 'intersects',

  // JSON operators
  JSON_PATH: 'json_path',
  JSON_CONTAINS: 'json_contains',

  // Full-text search
  FULL_TEXT: 'full_text',
  FULL_TEXT_RANKED: 'full_text_ranked',

  // Custom operators
  CUSTOM: 'custom',
} as const;

export type MetadataQueryOperator =
  (typeof MetadataQueryOperator)[keyof typeof MetadataQueryOperator];

// ============================================================================
// QUERY CONDITIONS
// ============================================================================

export interface MetadataQueryCondition {
  field: string;
  operator: MetadataQueryOperator;
  value?: any;
  options?: {
    caseSensitive?: boolean;
    fuzzy?: boolean;
    distance?: number;
    boost?: number;
    customParams?: Record<string, any>;
  };
}

export interface MetadataQueryConditionGroup {
  operator: 'AND' | 'OR' | 'NOT';
  conditions: (MetadataQueryCondition | MetadataQueryConditionGroup)[];
}

export type MetadataQueryFilter = MetadataQueryCondition | MetadataQueryConditionGroup;

// ============================================================================
// SORTING
// ============================================================================

export const MetadataSortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type MetadataSortOrder = (typeof MetadataSortOrder)[keyof typeof MetadataSortOrder];

export interface MetadataSortField {
  field: string;
  order: MetadataSortOrder;
  nullsFirst?: boolean;
  collation?: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface MetadataPagination {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
  cursorField?: string;
}

export interface MetadataPaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

// ============================================================================
// AGGREGATION
// ============================================================================

export const MetadataAggregationType = {
  COUNT: 'count',
  SUM: 'sum',
  AVG: 'avg',
  MIN: 'min',
  MAX: 'max',
  DISTINCT: 'distinct',
  GROUP_BY: 'group_by',
  HISTOGRAM: 'histogram',
  PERCENTILES: 'percentiles',
  STATS: 'stats',
} as const;

export type MetadataAggregationType =
  (typeof MetadataAggregationType)[keyof typeof MetadataAggregationType];

export interface MetadataAggregation {
  type: MetadataAggregationType;
  field?: string;
  alias?: string;
  options?: {
    buckets?: number;
    percentiles?: number[];
    groupByFields?: string[];
    customParams?: Record<string, any>;
  };
}

// ============================================================================
// MAIN QUERY INTERFACE
// ============================================================================

export interface MetadataQuery {
  // Basic query
  filter?: MetadataQueryFilter;
  sort?: MetadataSortField[];
  pagination?: MetadataPagination;

  // Advanced features
  aggregations?: MetadataAggregation[];
  select?: string[];
  exclude?: string[];

  // Performance
  cache?: {
    ttl?: number;
    key?: string;
    invalidateOn?: string[];
  };

  // Options
  options?: {
    explain?: boolean;
    timeout?: number;
    maxResults?: number;
    includeDeleted?: boolean;
    includeArchived?: boolean;
    version?: string;
  };
}

// ============================================================================
// QUERY RESULT
// ============================================================================

export interface MetadataQueryResult<T = any> {
  data: T[];
  pagination: MetadataPaginationResult;
  aggregations?: Record<string, any>;
  metadata?: {
    queryTime: number;
    totalTime: number;
    cached: boolean;
    explain?: any;
  };
}

// ============================================================================
// QUERY BUILDER
// ============================================================================

export class MetadataQueryBuilder {
  private query: MetadataQuery = {};

  constructor() {
    this.query = {};
  }

  // Filter methods
  where(field: string, operator: MetadataQueryOperator, value?: any, options?: any): this {
    if (!this.query.filter) {
      this.query.filter = { field, operator, value, options };
    } else {
      this.query.filter = {
        operator: 'AND',
        conditions: [this.query.filter, { field, operator, value, options }],
      };
    }
    return this;
  }

  andWhere(field: string, operator: MetadataQueryOperator, value?: any, options?: any): this {
    return this.where(field, operator, value, options);
  }

  orWhere(field: string, operator: MetadataQueryOperator, value?: any, options?: any): this {
    const condition = { field, operator, value, options };
    if (!this.query.filter) {
      this.query.filter = condition;
    } else {
      this.query.filter = {
        operator: 'OR',
        conditions: [this.query.filter, condition],
      };
    }
    return this;
  }

  whereIn(field: string, values: any[]): this {
    return this.where(field, MetadataQueryOperator.IN, values);
  }

  whereNotIn(field: string, values: any[]): this {
    return this.where(field, MetadataQueryOperator.NOT_IN, values);
  }

  whereNull(field: string): this {
    return this.where(field, MetadataQueryOperator.IS_NULL);
  }

  whereNotNull(field: string): this {
    return this.where(field, MetadataQueryOperator.IS_NOT_NULL);
  }

  whereBetween(field: string, min: any, max: any): this {
    return this.where(field, MetadataQueryOperator.BETWEEN, [min, max]);
  }

  whereLike(field: string, pattern: string): this {
    return this.where(field, MetadataQueryOperator.LIKE, pattern);
  }

  whereContains(field: string, value: string): this {
    return this.where(field, MetadataQueryOperator.CONTAINS, value);
  }

  // Sort methods
  orderBy(field: string, order: MetadataSortOrder = MetadataSortOrder.ASC): this {
    if (!this.query.sort) {
      this.query.sort = [];
    }
    this.query.sort.push({ field, order });
    return this;
  }

  orderByDesc(field: string): this {
    return this.orderBy(field, MetadataSortOrder.DESC);
  }

  // Pagination methods
  limit(limit: number): this {
    if (!this.query.pagination) {
      this.query.pagination = {};
    }
    this.query.pagination.limit = limit;
    return this;
  }

  offset(offset: number): this {
    if (!this.query.pagination) {
      this.query.pagination = {};
    }
    this.query.pagination.offset = offset;
    return this;
  }

  page(page: number, limit: number): this {
    if (!this.query.pagination) {
      this.query.pagination = {};
    }
    this.query.pagination.page = page;
    this.query.pagination.limit = limit;
    return this;
  }

  cursor(cursor: string, field?: string): this {
    if (!this.query.pagination) {
      this.query.pagination = {};
    }
    this.query.pagination.cursor = cursor;
    if (field) {
      this.query.pagination.cursorField = field;
    }
    return this;
  }

  // Select methods
  select(fields: string[]): this {
    this.query.select = fields;
    return this;
  }

  exclude(fields: string[]): this {
    this.query.exclude = fields;
    return this;
  }

  // Aggregation methods
  count(field?: string, alias?: string): this {
    if (!this.query.aggregations) {
      this.query.aggregations = [];
    }
    this.query.aggregations.push({
      type: MetadataAggregationType.COUNT,
      field,
      alias: alias || 'count',
    });
    return this;
  }

  sum(field: string, alias?: string): this {
    if (!this.query.aggregations) {
      this.query.aggregations = [];
    }
    this.query.aggregations.push({
      type: MetadataAggregationType.SUM,
      field,
      alias: alias || `sum_${field}`,
    });
    return this;
  }

  avg(field: string, alias?: string): this {
    if (!this.query.aggregations) {
      this.query.aggregations = [];
    }
    this.query.aggregations.push({
      type: MetadataAggregationType.AVG,
      field,
      alias: alias || `avg_${field}`,
    });
    return this;
  }

  groupBy(fields: string[]): this {
    if (!this.query.aggregations) {
      this.query.aggregations = [];
    }
    this.query.aggregations.push({
      type: MetadataAggregationType.GROUP_BY,
      options: { groupByFields: fields },
    });
    return this;
  }

  // Cache methods
  cache(ttl: number, key?: string): this {
    this.query.cache = { ttl, key };
    return this;
  }

  // Options methods
  explain(): this {
    if (!this.query.options) {
      this.query.options = {};
    }
    this.query.options.explain = true;
    return this;
  }

  timeout(ms: number): this {
    if (!this.query.options) {
      this.query.options = {};
    }
    this.query.options.timeout = ms;
    return this;
  }

  includeDeleted(): this {
    if (!this.query.options) {
      this.query.options = {};
    }
    this.query.options.includeDeleted = true;
    return this;
  }

  includeArchived(): this {
    if (!this.query.options) {
      this.query.options = {};
    }
    this.query.options.includeArchived = true;
    return this;
  }

  // Build method
  build(): MetadataQuery {
    return { ...this.query };
  }

  // Reset method
  reset(): this {
    this.query = {};
    return this;
  }
}

// ============================================================================
// QUERY VALIDATION
// ============================================================================

export const MetadataQuerySchema = z.object({
  filter: z
    .union([
      z.object({
        field: z.string(),
        operator: z.nativeEnum(MetadataQueryOperator),
        value: z.any().optional(),
        options: z.record(z.any()).optional(),
      }),
      z.object({
        operator: z.enum(['AND', 'OR', 'NOT']),
        conditions: z.array(z.lazy(() => MetadataQuerySchema.shape.filter)),
      }),
    ])
    .optional(),

  sort: z
    .array(
      z.object({
        field: z.string(),
        order: z.nativeEnum(MetadataSortOrder),
        nullsFirst: z.boolean().optional(),
        collation: z.string().optional(),
      }),
    )
    .optional(),

  pagination: z
    .object({
      page: z.number().positive().optional(),
      limit: z.number().positive().max(1000).optional(),
      offset: z.number().nonnegative().optional(),
      cursor: z.string().optional(),
      cursorField: z.string().optional(),
    })
    .optional(),

  aggregations: z
    .array(
      z.object({
        type: z.nativeEnum(MetadataAggregationType),
        field: z.string().optional(),
        alias: z.string().optional(),
        options: z.record(z.any()).optional(),
      }),
    )
    .optional(),

  select: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),

  cache: z
    .object({
      ttl: z.number().positive().optional(),
      key: z.string().optional(),
      invalidateOn: z.array(z.string()).optional(),
    })
    .optional(),

  options: z
    .object({
      explain: z.boolean().optional(),
      timeout: z.number().positive().optional(),
      maxResults: z.number().positive().optional(),
      includeDeleted: z.boolean().optional(),
      includeArchived: z.boolean().optional(),
      version: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// QUERY UTILITIES
// ============================================================================

export class MetadataQueryUtils {
  /**
   * Validates a metadata query against the schema
   */
  static validateQuery(query: MetadataQuery): { valid: boolean; errors?: string[] } {
    try {
      MetadataQuerySchema.parse(query);
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
   * Creates a deep copy of a query
   */
  static cloneQuery(query: MetadataQuery): MetadataQuery {
    return JSON.parse(JSON.stringify(query));
  }

  /**
   * Merges two queries (second query takes precedence)
   */
  static mergeQueries(base: MetadataQuery, override: MetadataQuery): MetadataQuery {
    return {
      ...base,
      ...override,
      filter: override.filter || base.filter,
      sort: override.sort || base.sort,
      pagination: override.pagination || base.pagination,
      aggregations: override.aggregations || base.aggregations,
      select: override.select || base.select,
      exclude: override.exclude || base.exclude,
      cache: override.cache || base.cache,
      options: { ...base.options, ...override.options },
    };
  }

  /**
   * Extracts field names from a query filter
   */
  static extractFields(filter: MetadataQueryFilter): string[] {
    const fields: string[] = [];

    const extractFromCondition = (
      condition: MetadataQueryCondition | MetadataQueryConditionGroup,
    ) => {
      if ('field' in condition) {
        fields.push(condition.field);
      } else {
        condition.conditions.forEach(extractFromCondition);
      }
    };

    extractFromCondition(filter);
    return [...new Set(fields)];
  }

  /**
   * Checks if a query has any filters
   */
  static hasFilters(query: MetadataQuery): boolean {
    return !!query.filter;
  }

  /**
   * Checks if a query has sorting
   */
  static hasSorting(query: MetadataQuery): boolean {
    return !!(query.sort && query.sort.length > 0);
  }

  /**
   * Checks if a query has pagination
   */
  static hasPagination(query: MetadataQuery): boolean {
    return !!(
      query.pagination &&
      (query.pagination.page !== undefined ||
        query.pagination.limit !== undefined ||
        query.pagination.offset !== undefined ||
        query.pagination.cursor !== undefined)
    );
  }

  /**
   * Checks if a query has aggregations
   */
  static hasAggregations(query: MetadataQuery): boolean {
    return !!(query.aggregations && query.aggregations.length > 0);
  }

  /**
   * Generates a cache key for a query
   */
  static generateCacheKey(query: MetadataQuery, prefix?: string): string {
    const queryStr = JSON.stringify(query);
    const hash = Buffer.from(queryStr)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '');
    return `${prefix || 'metadata'}:query:${hash}`;
  }

  /**
   * Normalizes a query (removes undefined values, sorts arrays, etc.)
   */
  static normalizeQuery(query: MetadataQuery): MetadataQuery {
    const normalized = { ...query };

    // Remove undefined values
    Object.keys(normalized).forEach((key) => {
      if (normalized[key as keyof MetadataQuery] === undefined) {
        delete normalized[key as keyof MetadataQuery];
      }
    });

    // Sort arrays for consistent cache keys
    if (normalized.sort) {
      normalized.sort.sort((a, b) => a.field.localeCompare(b.field));
    }

    if (normalized.select) {
      normalized.select.sort();
    }

    if (normalized.exclude) {
      normalized.exclude.sort();
    }

    return normalized;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared inline above
