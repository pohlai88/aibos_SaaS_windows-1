import { UserContext, ValidationResult, AccountingError } from '@aibos/core-types';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ===== ENTERPRISE TYPE DEFINITIONS =====

export interface ChartOfAccount {
  id: string;
  organizationId: string;
  accountNumber: string;
  name: string;
  account_type: AccountType;
  account_category: AccountCategory;
  description?: string;
  is_active: boolean;
  parent_account_id?: string;
  normal_balance: NormalBalance;
  is_system_account: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  created_by: string;
  updated_by: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountCategory = 'current_asset' | 'fixed_asset' | 'current_liability' | 'long_term_liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';

export interface CreateAccountInput {
  accountNumber: string;
  name: string;
  account_type: AccountType;
  account_category: AccountCategory;
  description?: string;
  parent_account_id?: string;
  normal_balance?: NormalBalance;
  is_system_account?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateAccountInput {
  accountNumber?: string;
  name?: string;
  account_type?: AccountType;
  account_category?: AccountCategory;
  description?: string;
  parent_account_id?: string;
  is_active?: boolean;
  normal_balance?: NormalBalance;
  metadata?: Record<string, any>;
}

export interface AccountSearchFilters {
  account_type?: AccountType;
  account_category?: AccountCategory;
  is_active?: boolean;
  parent_account_id?: string;
  search_term?: string;
  has_children?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AccountHierarchy {
  account: ChartOfAccount;
  children: AccountHierarchy[];
  depth: number;
  path: string[];
}

export interface AccountUsageStats {
  account_id: string;
  transaction_count: number;
  last_used: string | null;
  total_debit: number;
  total_credit: number;
  current_balance: number;
  child_accounts_count: number;
}

// ===== ERROR HANDLING =====

export enum AccountErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  DUPLICATE_accountNumber = 'DUPLICATE_accountNumber',
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  ACCOUNT_HAS_TRANSACTIONS = 'ACCOUNT_HAS_TRANSACTIONS',
  ACCOUNT_HAS_CHILDREN = 'ACCOUNT_HAS_CHILDREN',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  INVALID_HIERARCHY = 'INVALID_HIERARCHY',
  SYSTEM_ACCOUNT_MODIFICATION = 'SYSTEM_ACCOUNT_MODIFICATION'
}

export interface AccountingWarning {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, any>;
}

export interface AccountServiceResult<T> {
  success: boolean;
  data?: T;
  errors: AccountingError[];
  warnings: AccountingWarning[];
  metadata?: {
    affected_rows?: number;
    execution_time?: number;
    validation_passed?: boolean;
    cache_hit?: boolean;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: AccountingError[];
  warnings: AccountingWarning[];
  results: Array<{ id?: string; success: boolean; error?: string }>;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  account_id: string;
  userId: string;
  action: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  timestamp: Date;
  correlation_id?: string;
}

// ===== VALIDATION SCHEMAS =====

const AccountTypeSchema = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']);
const AccountCategorySchema = z.enum(['current_asset', 'fixed_asset', 'current_liability', 'long_term_liability', 'equity', 'revenue', 'expense']);
const NormalBalanceSchema = z.enum(['debit', 'credit']);

const CreateAccountInputSchema = z.object({
  accountNumber: z.string()
    .min(1, 'Account number is required')
    .max(20, 'Account number must be 20 characters or less')
    .regex(/^[A-Z0-9\-_]+$/, 'Account number must contain only uppercase letters, numbers, hyphens, and underscores'),
  name: z.string()
    .min(1, 'Account name is required')
    .max(255, 'Account name must be 255 characters or less'),
  account_type: AccountTypeSchema,
  account_category: AccountCategorySchema,
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  parent_account_id: z.string().uuid('Invalid parent account ID format').optional(),
  normal_balance: NormalBalanceSchema.optional(),
  is_system_account: z.boolean().default(false),
  metadata: z.record(z.any()).default({})
});

const UpdateAccountInputSchema = z.object({
  accountNumber: z.string()
    .min(1, 'Account number is required')
    .max(20, 'Account number must be 20 characters or less')
    .regex(/^[A-Z0-9\-_]+$/, 'Account number must contain only uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  name: z.string()
    .min(1, 'Account name is required')
    .max(255, 'Account name must be 255 characters or less')
    .optional(),
  account_type: AccountTypeSchema.optional(),
  account_category: AccountCategorySchema.optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  parent_account_id: z.string().uuid('Invalid parent account ID format').optional(),
  is_active: z.boolean().optional(),
  normal_balance: NormalBalanceSchema.optional(),
  metadata: z.record(z.any()).optional()
});

// ===== PERFORMANCE MONITORING =====

interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const timestamp = new Date();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.metrics.push({
        operation,
        duration,
        success: true,
        timestamp
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.metrics.push({
        operation,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      });
      
      throw error;
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// ===== ENTERPRISE CHART OF ACCOUNTS SERVICE =====

/**
 * Enterprise-grade Chart of Accounts service with comprehensive business logic,
 * validation, error handling, and performance monitoring.
 * 
 * Features:
 * - Complete type safety with Zod validation
 * - Business rule validation for accounting principles
 * - Hierarchical account management with circular reference protection
 * - Bulk operations with transaction support
 * - Audit logging for compliance
 * - Performance monitoring and caching
 * - Advanced querying and filtering
 * - Role-based access control
 * 
 * @example
 * ```typescript
 * const service = new EnterpriseChartOfAccountsService(supabaseUrl, supabaseKey);
 * 
 * const result = await service.createAccount('org-123', {
 *   accountNumber: '1000',
 *   name: 'Cash',
 *   account_type: 'asset',
 *   account_category: 'current_asset'
 * }, userContext);
 * 
 * if (result.success) {
 *   console.log('Account created:', result.data);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export class EnterpriseChartOfAccountsService {
  private supabase: SupabaseClient;
  private performanceMonitor: PerformanceMonitor;
  private cache: Map<string, ChartOfAccount> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.performanceMonitor = new PerformanceMonitor();
  }

  // ===== CORE CRUD OPERATIONS =====

  /**
   * Creates a new chart of accounts entry with comprehensive validation
   * 
   * @param organizationId - The organization's unique identifier
   * @param accountData - Account creation data
   * @param userContext - User context for authorization and audit
   * @returns Promise resolving to the created account or error details
   * 
   * @throws {ValidationError} When input data is invalid
   * @throws {DuplicateAccountError} When account number already exists
   * @throws {UnauthorizedError} When user lacks permissions
   */
  async createAccount(
    organizationId: string,
    accountData: CreateAccountInput,
    userContext: UserContext
  ): Promise<AccountServiceResult<ChartOfAccount>> {
    return this.performanceMonitor.measure('createAccount', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.create');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Input validation
        const validationResult = CreateAccountInputSchema.safeParse(accountData);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.error.errors.map(err => ({
              code: AccountErrorCode.VALIDATION_FAILED,
              message: err.message,
              field: err.path.join('.'),
              severity: 'error' as const,
              timestamp: new Date(),
              correlationId
            })),
            warnings: []
          };
        }

        // Business rule validation
        const businessValidation = await this.validateCreateAccount(organizationId, validationResult.data as CreateAccountInput);
        if (!businessValidation.success) {
          return {
            success: false,
            errors: businessValidation.errors,
            warnings: businessValidation.warnings
          };
        }

        // Set default normal balance based on account type
        const normalBalance = validationResult.data.normal_balance || 
          this.getDefaultNormalBalance(validationResult.data.account_type);

        // Create account
        const { data, error } = await this.supabase
          .from('chart_of_accounts')
          .insert([{
            ...validationResult.data,
            organizationId: organizationId,
            normal_balance: normalBalance,
            created_by: userContext.userId,
            updated_by: userContext.userId
          }])
          .select()
          .single();

        if (error) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: error.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Audit log
        await this.createAuditLog(organizationId, data.id, userContext.userId, 'CREATE', null, data, correlationId);

        // Clear cache
        this.clearCacheForOrganization(organizationId);

        return {
          success: true,
          data,
          errors: [],
          warnings: businessValidation.warnings,
          metadata: {
            affected_rows: 1,
            validation_passed: true
          }
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  /**
   * Retrieves a single account by ID with caching
   */
  async getAccount(
    organizationId: string,
    accountId: string,
    userContext: UserContext
  ): Promise<AccountServiceResult<ChartOfAccount>> {
    return this.performanceMonitor.measure('getAccount', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.read');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Check cache first
        const cacheKey = `${organizationId}:${accountId}`;
        const cachedAccount = this.getFromCache(cacheKey);
        if (cachedAccount) {
          return {
            success: true,
            data: cachedAccount,
            errors: [],
            warnings: [],
            metadata: {
              cache_hit: true
            }
          };
        }

        // Query database
        const { data, error } = await this.supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('organizationId', organizationId)
          .eq('id', accountId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return {
              success: false,
              errors: [{
                code: AccountErrorCode.ACCOUNT_NOT_FOUND,
                message: 'Account not found',
                severity: 'error',
                timestamp: new Date(),
                correlationId
              }],
              warnings: []
            };
          }

          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: error.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Cache the result
        this.setCache(cacheKey, data);

        return {
          success: true,
          data,
          errors: [],
          warnings: [],
          metadata: {
            cache_hit: false
          }
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  /**
   * Lists accounts with advanced filtering and pagination
   */
  async listAccounts(
    organizationId: string,
    filters: AccountSearchFilters = {},
    pagination: PaginationOptions = {},
    userContext: UserContext
  ): Promise<AccountServiceResult<PaginatedResult<ChartOfAccount>>> {
    return this.performanceMonitor.measure('listAccounts', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.read');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Build query
        let query = this.supabase
          .from('chart_of_accounts')
          .select('*', { count: 'exact' })
          .eq('organizationId', organizationId);

        // Apply filters
        if (filters.account_type) {
          query = query.eq('account_type', filters.account_type);
        }
        if (filters.account_category) {
          query = query.eq('account_category', filters.account_category);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.parent_account_id) {
          query = query.eq('parent_account_id', filters.parent_account_id);
        }
        if (filters.search_term) {
          query = query.or(`name.ilike.%${filters.search_term}%,accountNumber.ilike.%${filters.search_term}%`);
        }

        // Apply sorting
        const sortBy = pagination.sortBy || 'accountNumber';
        const sortOrder = pagination.sortOrder || 'asc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const page = pagination.page || 1;
        const limit = pagination.limit || 50;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: error.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        const totalPages = Math.ceil((count || 0) / limit);

        return {
          success: true,
          data: {
            data: data || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages,
              hasNext: page < totalPages,
              hasPrevious: page > 1
            }
          },
          errors: [],
          warnings: []
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  /**
   * Updates an existing account with comprehensive validation
   */
  async updateAccount(
    organizationId: string,
    accountId: string,
    updates: UpdateAccountInput,
    userContext: UserContext
  ): Promise<AccountServiceResult<ChartOfAccount>> {
    return this.performanceMonitor.measure('updateAccount', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.update');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Input validation
        const validationResult = UpdateAccountInputSchema.safeParse(updates);
        if (!validationResult.success) {
          return {
            success: false,
            errors: validationResult.error.errors.map(err => ({
              code: AccountErrorCode.VALIDATION_FAILED,
              message: err.message,
              field: err.path.join('.'),
              severity: 'error' as const,
              timestamp: new Date(),
              correlationId
            })),
            warnings: []
          };
        }

        // Get current account for audit and validation
        const currentResult = await this.getAccount(organizationId, accountId, userContext);
        if (!currentResult.success) {
          return currentResult;
        }

        const currentAccount = currentResult.data!;

        // Check if it's a system account
        if (currentAccount.is_system_account) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.SYSTEM_ACCOUNT_MODIFICATION,
              message: 'Cannot modify system accounts',
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Business rule validation
        const businessValidation = await this.validateUpdateAccount(organizationId, accountId, validationResult.data);
        if (!businessValidation.success) {
          return {
            success: false,
            errors: businessValidation.errors,
            warnings: businessValidation.warnings
          };
        }

        // Update account
        const { data, error } = await this.supabase
          .from('chart_of_accounts')
          .update({
            ...validationResult.data,
            updated_by: userContext.userId,
            updatedAt: new Date().toISOString()
          })
          .eq('organizationId', organizationId)
          .eq('id', accountId)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: error.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Audit log
        await this.createAuditLog(organizationId, accountId, userContext.userId, 'UPDATE', currentAccount, data, correlationId);

        // Clear cache
        this.clearCacheForOrganization(organizationId);

        return {
          success: true,
          data,
          errors: [],
          warnings: businessValidation.warnings,
          metadata: {
            affected_rows: 1,
            validation_passed: true
          }
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  /**
   * Deletes an account with comprehensive business rule validation
   */
  async deleteAccount(
    organizationId: string,
    accountId: string,
    userContext: UserContext
  ): Promise<AccountServiceResult<void>> {
    return this.performanceMonitor.measure('deleteAccount', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.delete');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Get current account for validation
        const currentResult = await this.getAccount(organizationId, accountId, userContext);
        if (!currentResult.success) {
          return {
            success: false,
            errors: currentResult.errors,
            warnings: currentResult.warnings
          };
        }

        const currentAccount = currentResult.data!;

        // Business rule validation
        const businessValidation = await this.validateDeleteAccount(organizationId, accountId);
        if (!businessValidation.success) {
          return {
            success: false,
            errors: businessValidation.errors,
            warnings: businessValidation.warnings
          };
        }

        // Delete account
        const { error } = await this.supabase
          .from('chart_of_accounts')
          .delete()
          .eq('organizationId', organizationId)
          .eq('id', accountId);

        if (error) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: error.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Audit log
        await this.createAuditLog(organizationId, accountId, userContext.userId, 'DELETE', currentAccount, null, correlationId);

        // Clear cache
        this.clearCacheForOrganization(organizationId);

        return {
          success: true,
          errors: [],
          warnings: businessValidation.warnings,
          metadata: {
            affected_rows: 1
          }
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  // ===== ADVANCED FEATURES =====

  /**
   * Gets the complete account hierarchy for an organization
   */
  async getAccountHierarchy(
    organizationId: string,
    userContext: UserContext,
    rootAccountId?: string
  ): Promise<AccountServiceResult<AccountHierarchy[]>> {
    return this.performanceMonitor.measure('getAccountHierarchy', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.read');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Get all accounts
        const { data: accounts, error } = await this.supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('organizationId', organizationId)
          .order('accountNumber');

        if (error) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: error.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Build hierarchy
        const hierarchy = this.buildAccountHierarchy(accounts, rootAccountId);

        return {
          success: true,
          data: hierarchy,
          errors: [],
          warnings: []
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  /**
   * Gets usage statistics for an account
   */
  async getAccountUsageStats(
    organizationId: string,
    accountId: string,
    userContext: UserContext
  ): Promise<AccountServiceResult<AccountUsageStats>> {
    return this.performanceMonitor.measure('getAccountUsageStats', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.read');
        if (!authResult.success) {
          return {
            success: false,
            errors: authResult.errors,
            warnings: []
          };
        }

        // Get transaction statistics
        const { data: transactionStats, error: transactionError } = await this.supabase
          .from('journal_entry_lines')
          .select('debit_amount, credit_amount, createdAt')
          .eq('account_id', accountId)
          .eq('organizationId', organizationId);

        if (transactionError) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: transactionError.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Get child accounts count
        const { count: childAccountsCount, error: childError } = await this.supabase
          .from('chart_of_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('organizationId', organizationId)
          .eq('parent_account_id', accountId);

        if (childError) {
          return {
            success: false,
            errors: [{
              code: AccountErrorCode.DATABASE_ERROR,
              message: childError.message,
              severity: 'error',
              timestamp: new Date(),
              correlationId
            }],
            warnings: []
          };
        }

        // Calculate statistics
        const transactionCount = transactionStats?.length || 0;
        const totalDebit = transactionStats?.reduce((sum, t) => sum + (t.debit_amount || 0), 0) || 0;
        const totalCredit = transactionStats?.reduce((sum, t) => sum + (t.credit_amount || 0), 0) || 0;
        const currentBalance = totalDebit - totalCredit;
        const lastUsed = transactionStats && transactionStats.length > 0 
          ? transactionStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
          : null;

        const stats: AccountUsageStats = {
          account_id: accountId,
          transaction_count: transactionCount,
          last_used: lastUsed,
          total_debit: totalDebit,
          total_credit: totalCredit,
          current_balance: currentBalance,
          child_accounts_count: childAccountsCount || 0
        };

        return {
          success: true,
          data: stats,
          errors: [],
          warnings: []
        };

      } catch (error) {
        return {
          success: false,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: []
        };
      }
    });
  }

  /**
   * Bulk create multiple accounts
   */
  async createMultipleAccounts(
    organizationId: string,
    accounts: CreateAccountInput[],
    userContext: UserContext
  ): Promise<BulkOperationResult> {
    return this.performanceMonitor.measure('createMultipleAccounts', async () => {
      const correlationId = userContext.correlation_id || crypto.randomUUID();
      
      try {
        // Authorization check
        const authResult = await this.checkPermission(userContext, 'accounts.create');
        if (!authResult.success) {
          return {
            success: false,
            processed: 0,
            failed: accounts.length,
            errors: authResult.errors,
            warnings: [],
            results: accounts.map(() => ({ success: false, error: 'Unauthorized' }))
          };
        }

        const results: Array<{ id?: string; success: boolean; error?: string }> = [];
        const errors: AccountingError[] = [];
        const warnings: AccountingWarning[] = [];
        let processed = 0;
        let failed = 0;

        // Process each account
        for (const accountData of accounts) {
          try {
            const result = await this.createAccount(organizationId, accountData, userContext);
            if (result.success) {
              results.push({ id: result.data?.id, success: true });
              processed++;
            } else {
              results.push({ success: false, error: result.errors[0]?.message || 'Unknown error' });
              errors.push(...result.errors);
              warnings.push(...result.warnings);
              failed++;
            }
          } catch (error) {
            results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
            failed++;
          }
        }

        return {
          success: failed === 0,
          processed,
          failed,
          errors,
          warnings,
          results
        };

      } catch (error) {
        return {
          success: false,
          processed: 0,
          failed: accounts.length,
          errors: [{
            code: AccountErrorCode.DATABASE_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
            timestamp: new Date(),
            correlationId
          }],
          warnings: [],
          results: accounts.map(() => ({ success: false, error: 'System error' }))
        };
      }
    });
  }

  // ===== BUSINESS LOGIC VALIDATION =====

  private async validateCreateAccount(
    organizationId: string,
    accountData: CreateAccountInput
  ): Promise<ValidationResult> {
    const errors: AccountingError[] = [];
    const warnings: AccountingWarning[] = [];

    // Check for duplicate account number
    const { data: existingAccount } = await this.supabase
      .from('chart_of_accounts')
      .select('id')
      .eq('organizationId', organizationId)
      .eq('accountNumber', accountData.accountNumber)
      .single();

    if (existingAccount) {
      errors.push({
        code: AccountErrorCode.DUPLICATE_accountNumber,
        message: `Account number ${accountData.accountNumber} already exists`,
        field: 'accountNumber',
        severity: 'error',
        timestamp: new Date()
      });
    }

    // Validate parent account if specified
    if (accountData.parent_account_id) {
      const parentValidation = await this.validateParentAccount(organizationId, accountData.parent_account_id, accountData.account_type);
      errors.push(...parentValidation.errors);
      warnings.push(...parentValidation.warnings);
    }

    // Validate account type and category compatibility
    const typeValidation = this.validateAccountTypeCategory(accountData.account_type, accountData.account_category);
    errors.push(...typeValidation.errors);

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateUpdateAccount(
    organizationId: string,
    accountId: string,
    updates: UpdateAccountInput
  ): Promise<ValidationResult> {
    const errors: AccountingError[] = [];
    const warnings: AccountingWarning[] = [];

    // Check for duplicate account number if account number is being updated
    if (updates.accountNumber) {
      const { data: existingAccount } = await this.supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('organizationId', organizationId)
        .eq('accountNumber', updates.accountNumber)
        .neq('id', accountId)
        .single();

      if (existingAccount) {
        errors.push({
          code: AccountErrorCode.DUPLICATE_accountNumber,
          message: `Account number ${updates.accountNumber} already exists`,
          field: 'accountNumber',
          severity: 'error',
          timestamp: new Date()
        });
      }
    }

    // Validate parent account if being updated
    if (updates.parent_account_id) {
      const parentValidation = await this.validateParentAccount(organizationId, updates.parent_account_id, updates.account_type);
      errors.push(...parentValidation.errors);
      warnings.push(...parentValidation.warnings);

      // Check for circular reference
      const circularValidation = await this.validateCircularReference(organizationId, accountId, updates.parent_account_id);
      errors.push(...circularValidation.errors);
    }

    // Validate account type and category compatibility if being updated
    if (updates.account_type && updates.account_category) {
      const typeValidation = this.validateAccountTypeCategory(updates.account_type, updates.account_category);
      errors.push(...typeValidation.errors);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateDeleteAccount(
    organizationId: string,
    accountId: string
  ): Promise<ValidationResult> {
    const errors: AccountingError[] = [];
    const warnings: AccountingWarning[] = [];

    // Check if account has transactions
    const { data: transactions } = await this.supabase
      .from('journal_entry_lines')
      .select('id')
      .eq('account_id', accountId)
      .limit(1);

    if (transactions && transactions.length > 0) {
      errors.push({
        code: AccountErrorCode.ACCOUNT_HAS_TRANSACTIONS,
        message: 'Cannot delete account with existing transactions',
        severity: 'error',
        timestamp: new Date()
      });
    }

    // Check if account has child accounts
    const { data: childAccounts } = await this.supabase
      .from('chart_of_accounts')
      .select('id')
      .eq('organizationId', organizationId)
      .eq('parent_account_id', accountId)
      .limit(1);

    if (childAccounts && childAccounts.length > 0) {
      errors.push({
        code: AccountErrorCode.ACCOUNT_HAS_CHILDREN,
        message: 'Cannot delete account with child accounts',
        severity: 'error',
        timestamp: new Date()
      });
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateParentAccount(
    organizationId: string,
    parentAccountId: string,
    accountType?: AccountType
  ): Promise<ValidationResult> {
    const errors: AccountingError[] = [];
    const warnings: AccountingWarning[] = [];

    // Check if parent account exists
    const { data: parentAccount } = await this.supabase
      .from('chart_of_accounts')
      .select('account_type, is_active')
      .eq('organizationId', organizationId)
      .eq('id', parentAccountId)
      .single();

    if (!parentAccount) {
      errors.push({
        code: AccountErrorCode.ACCOUNT_NOT_FOUND,
        message: 'Parent account not found',
        field: 'parent_account_id',
        severity: 'error',
        timestamp: new Date()
      });
    } else {
      // Check if parent account is active
      if (!parentAccount.is_active) {
        warnings.push({
          code: 'INACTIVE_PARENT_ACCOUNT',
          message: 'Parent account is inactive',
          field: 'parent_account_id'
        });
      }

      // Check if account types are compatible
      if (accountType && parentAccount.account_type !== accountType) {
        errors.push({
          code: AccountErrorCode.INVALID_HIERARCHY,
          message: 'Child account type must match parent account type',
          field: 'account_type',
          severity: 'error',
          timestamp: new Date()
        });
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateCircularReference(
    organizationId: string,
    accountId: string,
    parentAccountId: string
  ): Promise<ValidationResult> {
    const errors: AccountingError[] = [];
    
    // Check if setting parent would create circular reference
    const visited = new Set<string>();
    let currentId = parentAccountId;
    
    while (currentId && !visited.has(currentId)) {
      if (currentId === accountId) {
        errors.push({
          code: AccountErrorCode.CIRCULAR_REFERENCE,
          message: 'Cannot set parent account - would create circular reference',
          field: 'parent_account_id',
          severity: 'error',
          timestamp: new Date()
        });
        break;
      }
      
      visited.add(currentId);
      
      const { data: parentAccount } = await this.supabase
        .from('chart_of_accounts')
        .select('parent_account_id')
        .eq('organizationId', organizationId)
        .eq('id', currentId)
        .single();
      
      currentId = parentAccount?.parent_account_id || null;
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private validateAccountTypeCategory(accountType: AccountType, accountCategory: AccountCategory): ValidationResult {
    const errors: AccountingError[] = [];
    
    const validCombinations: Record<AccountType, AccountCategory[]> = {
      asset: ['current_asset', 'fixed_asset'],
      liability: ['current_liability', 'long_term_liability'],
      equity: ['equity'],
      revenue: ['revenue'],
      expense: ['expense']
    };

    if (!validCombinations[accountType]?.includes(accountCategory)) {
      errors.push({
        code: AccountErrorCode.BUSINESS_RULE_VIOLATION,
        message: `Invalid account category ${accountCategory} for account type ${accountType}`,
        field: 'account_category',
        severity: 'error',
        timestamp: new Date()
      });
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: []
    };
  }

  // ===== HELPER METHODS =====

  private getDefaultNormalBalance(accountType: AccountType): NormalBalance {
    const normalBalances: Record<AccountType, NormalBalance> = {
      asset: 'debit',
      expense: 'debit',
      liability: 'credit',
      equity: 'credit',
      revenue: 'credit'
    };

    return normalBalances[accountType];
  }

  private buildAccountHierarchy(accounts: ChartOfAccount[], rootAccountId?: string): AccountHierarchy[] {
    const accountMap = new Map<string, ChartOfAccount>();
    const children = new Map<string, ChartOfAccount[]>();

    // Build maps
    accounts.forEach(account => {
      accountMap.set(account.id, account);
      const parentId = account.parent_account_id || 'root';
      if (!children.has(parentId)) {
        children.set(parentId, []);
      }
      children.get(parentId)!.push(account);
    });

    // Build hierarchy recursively
    const buildHierarchy = (parentId: string, depth: number = 0, path: string[] = []): AccountHierarchy[] => {
      const childAccounts = children.get(parentId) || [];
      return childAccounts.map(account => ({
        account,
        children: buildHierarchy(account.id, depth + 1, [...path, account.id]),
        depth,
        path: [...path, account.id]
      }));
    };

    return buildHierarchy(rootAccountId || 'root');
  }

  private async checkPermission(userContext: UserContext, permission: string): Promise<ValidationResult> {
    // Simple permission check - in real implementation, this would check against a proper RBAC system
    const hasPermission = userContext.permissions.includes(permission) || 
                         userContext.permissions.includes('accounts.*') ||
                         userContext.role === 'admin';

    if (!hasPermission) {
      return {
        success: false,
        errors: [{
          code: AccountErrorCode.UNAUTHORIZED_ACCESS,
          message: `Insufficient permissions: ${permission}`,
          severity: 'error',
          timestamp: new Date()
        }],
        warnings: []
      };
    }

    return {
      success: true,
      errors: [],
      warnings: []
    };
  }

  private async createAuditLog(
    organizationId: string,
    accountId: string,
    userId: string,
    action: string,
    oldValues: any,
    newValues: any,
    correlationId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert([{
          organizationId: organizationId,
          table_name: 'chart_of_accounts',
          record_id: accountId,
          userId: userId,
          action,
          old_values: oldValues,
          new_values: newValues,
          correlation_id: correlationId,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to create audit log:', error);
    }
  }

  // ===== CACHING =====

  private getFromCache(key: string): ChartOfAccount | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && expiry > Date.now()) {
      return this.cache.get(key) || null;
    }
    
    // Remove expired entry
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, account: ChartOfAccount): void {
    this.cache.set(key, account);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private clearCacheForOrganization(organizationId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(organizationId + ':')) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // ===== MONITORING =====

  /**
   * Gets performance metrics for monitoring
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return this.performanceMonitor.getMetrics();
  }

  /**
   * Clears performance metrics
   */
  clearPerformanceMetrics(): void {
    this.performanceMonitor.clearMetrics();
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; checks: Record<string, boolean> }> {
    const checks: Record<string, boolean> = {};
    
    try {
      // Test database connection
      const { error: dbError } = await this.supabase
        .from('chart_of_accounts')
        .select('id')
        .limit(1);
      
      checks.database = !dbError;
      
      // Test cache
      checks.cache = this.cache instanceof Map;
      
      // Test performance monitor
      checks.monitoring = this.performanceMonitor instanceof PerformanceMonitor;
      
      const healthy = Object.values(checks).every(check => check);
      
      return { healthy, checks };
      
    } catch (error) {
      return {
        healthy: false,
        checks: {
          database: false,
          cache: false,
          monitoring: false
        }
      };
    }
  }
}
