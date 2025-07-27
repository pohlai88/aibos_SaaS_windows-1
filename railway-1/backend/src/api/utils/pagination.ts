// ==================== AI-BOS API PAGINATION & FILTERING ====================
// Enhanced Pagination, Filtering, and Sorting Utilities
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import { z } from 'zod';

// ==================== CORE TYPES ====================
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: SortOption[];
  filter?: FilterOption[];
  search?: string;
  include?: string[];
  exclude?: string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  | 'regex' | 'exists' | 'between' | 'dateRange';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
  meta: {
    sort: SortOption[];
    filter: FilterOption[];
    search?: string;
    processingTime: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    total?: number;
    processingTime?: number;
    requestId?: string;
  };
}

// ==================== VALIDATION SCHEMAS ====================
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  filter: z.record(z.string()).optional(),
  search: z.string().optional(),
  include: z.string().optional(),
  exclude: z.string().optional()
});

export const SortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc')
});

export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum([
    'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
    'in', 'nin', 'contains', 'startsWith', 'endsWith',
    'regex', 'exists', 'between', 'dateRange'
  ]),
  value: z.any()
});

// ==================== PAGINATION UTILITIES ====================
export class PaginationUtils {
  /**
   * Parse pagination options from query parameters
   */
  static parsePaginationOptions(query: any): PaginationOptions {
    const parsed = PaginationSchema.parse(query);

    const result: PaginationOptions = {
      page: parsed.page,
      limit: parsed.limit,
      sort: this.parseSortOptions(parsed.sort),
      filter: this.parseFilterOptions(parsed.filter)
    };

    if (parsed.search !== undefined) {
      result.search = parsed.search;
    }
    if (parsed.include !== undefined) {
      result.include = parsed.include.split(',');
    }
    if (parsed.exclude !== undefined) {
      result.exclude = parsed.exclude.split(',');
    }

    return result;
  }

  /**
   * Parse sort options from string
   */
  static parseSortOptions(sortString?: string): SortOption[] {
    if (!sortString) return [];

    return sortString.split(',').map(sort => {
      const [field, direction] = sort.split(':');
      return {
        field: field?.trim() || '',
        direction: (direction?.toLowerCase() as 'asc' | 'desc') || 'asc'
      };
    });
  }

  /**
   * Parse filter options from object
   */
  static parseFilterOptions(filterObj?: Record<string, any>): FilterOption[] {
    if (!filterObj) return [];

    const filters: FilterOption[] = [];

    for (const [key, value] of Object.entries(filterObj)) {
      if (typeof value === 'object' && value !== null) {
        // Complex filter: { field: { operator: value } }
        for (const [operator, operatorValue] of Object.entries(value)) {
          filters.push({
            field: key,
            operator: operator as FilterOperator,
            value: operatorValue
          });
        }
      } else {
        // Simple filter: { field: value } (defaults to 'eq')
        filters.push({
          field: key,
          operator: 'eq',
          value: value
        });
      }
    }

    return filters;
  }

  /**
   * Apply pagination to data array
   */
  static paginateData<T>(
    data: T[],
    options: PaginationOptions
  ): PaginationResult<T> {
    const startTime = Date.now();

    // Apply search
    let filteredData = this.applySearch(data, options.search);

    // Apply filters
    filteredData = this.applyFilters(filteredData, options.filter || []);

    // Apply sorting
    filteredData = this.applySorting(filteredData, options.sort || []);

    // Calculate pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;

    // Apply pagination
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Apply field inclusion/exclusion
    const finalData = this.applyFieldSelection(paginatedData, options.include, options.exclude);

    const processingTime = Date.now() - startTime;

    return {
      data: finalData,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
        hasNext: options.page < totalPages,
        hasPrev: options.page > 1,
        ...(options.page < totalPages ? { nextPage: options.page + 1 } : {}),
        ...(options.page > 1 ? { prevPage: options.page - 1 } : {})
      },
      meta: {
        sort: options.sort || [],
        filter: options.filter || [],
        processingTime,
        ...(options.search !== undefined ? { search: options.search } : {})
      }
    };
  }

  /**
   * Apply search to data
   */
  private static applySearch<T>(data: T[], search?: string): T[] {
    if (!search) return data;

    const searchLower = search.toLowerCase();
    return data.filter(item => {
      const itemString = JSON.stringify(item).toLowerCase();
      return itemString.includes(searchLower);
    });
  }

  /**
   * Apply filters to data
   */
  private static applyFilters<T>(data: T[], filters: FilterOption[]): T[] {
    if (filters.length === 0) return data;

    return data.filter(item => {
      return filters.every(filter => {
        const value = this.getNestedValue(item, filter.field);
        return this.evaluateFilter(value, filter);
      });
    });
  }

  /**
   * Apply sorting to data
   */
  private static applySorting<T>(data: T[], sorts: SortOption[]): T[] {
    if (sorts.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const sort of sorts) {
        const valueA = this.getNestedValue(a, sort.field);
        const valueB = this.getNestedValue(b, sort.field);

        const comparison = this.compareValues(valueA, valueB);
        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Apply field selection (include/exclude)
   */
  private static applyFieldSelection<T>(
    data: T[],
    include?: string[],
    exclude?: string[]
  ): T[] {
    if (!include && !exclude) return data;

    return data.map(item => {
      if (typeof item !== 'object' || item === null) return item;

      const result: any = {};

      if (include) {
        // Include only specified fields
        for (const field of include) {
          const value = this.getNestedValue(item, field);
          if (value !== undefined) {
            this.setNestedValue(result, field, value);
          }
        }
      } else {
        // Exclude specified fields
        const itemKeys = this.getAllKeys(item);
        for (const key of itemKeys) {
          if (!exclude!.includes(key)) {
            const value = this.getNestedValue(item, key);
            this.setNestedValue(result, key, value);
          }
        }
      }

      return result;
    });
  }

  /**
   * Get nested value from object
   */
  private static getNestedValue(obj: any, path: string): any {
          return path.split('.').reduce((current, pathPart) => {
      return current && current[pathPart] !== undefined ? current[pathPart] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object
   */
  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
          const target = keys.reduce((current, pathPart) => {
      if (!current[pathPart]) current[pathPart] = {};
      return current[pathPart];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Get all keys from object (including nested)
   */
  private static getAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys.push(...this.getAllKeys(obj[key], fullKey));
        }
      }
    }

    return keys;
  }

  /**
   * Evaluate filter condition
   */
  private static evaluateFilter(value: any, filter: FilterOption): boolean {
    switch (filter.operator) {
      case 'eq':
        return value === filter.value;
      case 'ne':
        return value !== filter.value;
      case 'gt':
        return value > filter.value;
      case 'gte':
        return value >= filter.value;
      case 'lt':
        return value < filter.value;
      case 'lte':
        return value <= filter.value;
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      case 'nin':
        return Array.isArray(filter.value) && !filter.value.includes(value);
      case 'contains':
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
      case 'endsWith':
        return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
      case 'regex':
        try {
          const regex = new RegExp(filter.value, 'i');
          return regex.test(String(value));
        } catch {
          return false;
        }
      case 'exists':
        return filter.value ? value !== undefined : value === undefined;
      case 'between':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          return value >= filter.value[0] && value <= filter.value[1];
        }
        return false;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const date = new Date(value);
          const start = new Date(filter.value[0]);
          const end = new Date(filter.value[1]);
          return date >= start && date <= end;
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Compare values for sorting
   */
  private static compareValues(a: any, b: any): number {
    if (a === b) return 0;
    if (a === undefined || a === null) return 1;
    if (b === undefined || b === null) return -1;

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Convert to strings for comparison
    return String(a).localeCompare(String(b));
  }

  /**
   * Generate pagination links
   */
  static generatePaginationLinks(
    baseUrl: string,
    page: number,
    totalPages: number,
    limit: number,
    queryParams: Record<string, any> = {}
  ): {
    first: string;
    last: string;
    next?: string;
    prev?: string;
  } {
    const params = new URLSearchParams(queryParams);
    params.set('limit', limit.toString());

    const first = `${baseUrl}?${params.toString()}&page=1`;
    const last = `${baseUrl}?${params.toString()}&page=${totalPages}`;

    const links: any = { first, last };

    if (page < totalPages) {
      params.set('page', (page + 1).toString());
      links.next = `${baseUrl}?${params.toString()}`;
    }

    if (page > 1) {
      params.set('page', (page - 1).toString());
      links.prev = `${baseUrl}?${params.toString()}`;
    }

    return links;
  }

  /**
   * Create standardized API response
   */
  static createApiResponse<T>(
    data: T,
    pagination?: {
      page: number;
      total: number;
      processingTime: number;
    },
    requestId?: string
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      data
    };

    if (pagination) {
      response.meta = {
        page: pagination.page,
        total: pagination.total,
        processingTime: pagination.processingTime,
        ...(requestId !== undefined ? { requestId } : {})
      };
    } else if (requestId !== undefined) {
      response.meta = { requestId };
    }

    return response;
  }

  /**
   * Create error response
   */
  static createErrorResponse(
    code: string,
    message: string,
    details?: any,
    requestId?: string
  ): ApiResponse<never> {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code,
        message,
        details
      }
    };

    if (requestId !== undefined) {
      response.meta = { requestId };
    }

    return response;
  }
}

// ==================== QUERY BUILDER ====================
export class QueryBuilder {
  private conditions: string[] = [];
  private params: any[] = [];
  private sortFields: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  /**
   * Add where condition
   */
  where(field: string, operator: string, value: any): QueryBuilder {
    const paramIndex = this.params.length + 1;
    this.conditions.push(`${field} ${operator} $${paramIndex}`);
    this.params.push(value);
    return this;
  }

  /**
   * Add where in condition
   */
  whereIn(field: string, values: any[]): QueryBuilder {
    if (values.length === 0) return this;

    const placeholders = values.map((_, index) => `$${this.params.length + index + 1}`).join(',');
    this.conditions.push(`${field} IN (${placeholders})`);
    this.params.push(...values);
    return this;
  }

  /**
   * Add where like condition
   */
  whereLike(field: string, value: string): QueryBuilder {
    return this.where(field, 'ILIKE', `%${value}%`);
  }

  /**
   * Add order by
   */
  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.sortFields.push(`${field} ${direction}`);
    return this;
  }

  /**
   * Add limit
   */
  limit(value: number): QueryBuilder {
    this.limitValue = value;
    return this;
  }

  /**
   * Add offset
   */
  offset(value: number): QueryBuilder {
    this.offsetValue = value;
    return this;
  }

  /**
   * Build WHERE clause
   */
  buildWhere(): string {
    return this.conditions.length > 0 ? `WHERE ${this.conditions.join(' AND ')}` : '';
  }

  /**
   * Build ORDER BY clause
   */
  buildOrderBy(): string {
    return this.sortFields.length > 0 ? `ORDER BY ${this.sortFields.join(', ')}` : '';
  }

  /**
   * Build LIMIT clause
   */
  buildLimit(): string {
    return this.limitValue ? `LIMIT ${this.limitValue}` : '';
  }

  /**
   * Build OFFSET clause
   */
  buildOffset(): string {
    return this.offsetValue ? `OFFSET ${this.offsetValue}` : '';
  }

  /**
   * Build complete query
   */
  build(): { query: string; params: any[] } {
    const clauses = [
      this.buildWhere(),
      this.buildOrderBy(),
      this.buildLimit(),
      this.buildOffset()
    ].filter(clause => clause.length > 0);

    return {
      query: clauses.join(' '),
      params: this.params
    };
  }

  /**
   * Get parameters
   */
  getParams(): any[] {
    return this.params;
  }

  /**
   * Reset builder
   */
  reset(): QueryBuilder {
    this.conditions = [];
    this.params = [];
    this.sortFields = [];
    this.limitValue = 0;
    this.offsetValue = 0;
    return this;
  }
}

// ==================== EXPORT ====================
export default PaginationUtils;
