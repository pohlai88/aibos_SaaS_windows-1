// Expense Service - Enterprise Grade API Integration
// Comprehensive service for expense management with caching, error handling, and business logic

import { toast } from 'react-hot-toast';
import { 
  expenseClaimSchema, 
  expenseItemSchema, 
  expenseCategorySchema, 
  expensePolicySchema,
  expenseReceiptSchema,
  expenseApprovalSchema,
  expenseBudgetSchema,
  safeValidateExpenseClaim,
  safeValidateExpenseItem,
  safeValidateExpenseCategory,
  safeValidateExpensePolicy,
  safeValidateExpenseReceipt,
  safeValidateExpenseApproval,
  safeValidateExpenseBudget,
  validateExpensePolicyCompliance,
  validateBudgetCompliance
} from '../validation/expense';

import { 
  EXPENSE_API_ENDPOINTS, 
  CACHE_KEYS, 
  CACHE_TTL, 
  EXPENSE_ERROR_CODES,
  EXPENSE_SUCCESS_MESSAGES,
  EXPENSE_WARNING_MESSAGES,
  EXPENSE_INFO_MESSAGES
} from '../constants/expense';

import type {
  ExpenseClaim,
  ExpenseItem,
  ExpenseCategory,
  ExpensePolicy,
  ExpenseReceipt,
  ExpenseApproval,
  ExpenseBudget,
  ExpenseReport,
  ExpenseAnalytics,
  ExpenseReimbursement,
  ExpenseFilters,
  ExpenseClaimResponse,
  ExpenseClaimsResponse,
  ExpenseNotification
} from '../types/expense';

// Cache management
class ExpenseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = CACHE_TTL.MEDIUM): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl * 1000;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// API client with error handling
class ExpenseAPIClient {
  private baseURL: string;
  private cache: ExpenseCache;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.cache = new ExpenseCache();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    if (useCache) {
      const cached = this.cache.get(endpoint);
      if (cached) return cached;
    }

    const data = await this.request<T>(endpoint);
    
    if (useCache) {
      this.cache.set(endpoint, data);
    }

    return data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Invalidate related cache
    this.cache.invalidatePattern(endpoint.split('/')[1]);
    
    return result;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    // Invalidate related cache
    this.cache.invalidatePattern(endpoint.split('/')[1]);
    
    return result;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'DELETE',
    });

    // Invalidate related cache
    this.cache.invalidatePattern(endpoint.split('/')[1]);
    
    return result;
  }
}

// Main expense service
export class ExpenseService {
  private api: ExpenseAPIClient;
  private cache: ExpenseCache;

  constructor() {
    this.api = new ExpenseAPIClient();
    this.cache = new ExpenseCache();
  }

  // Expense Claims
  async createExpenseClaim(claimData: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    try {
      // Validate input
      const validation = safeValidateExpenseClaim(claimData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.post<ExpenseClaimResponse>(
        EXPENSE_API_ENDPOINTS.CLAIMS,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create expense claim');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.CLAIM_CREATED);
      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense claim');
      throw error;
    }
  }

  async getExpenseClaims(filters: ExpenseFilters = {}): Promise<ExpenseClaim[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const endpoint = `${EXPENSE_API_ENDPOINTS.CLAIMS}?${queryParams.toString()}`;
      const response = await this.api.get<ExpenseClaimsResponse>(endpoint);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense claims');
      }

      return response.data || [];
    } catch (error) {
      toast.error('Failed to fetch expense claims');
      throw error;
    }
  }

  async getExpenseClaim(id: string): Promise<ExpenseClaim> {
    try {
      const response = await this.api.get<ExpenseClaimResponse>(
        `${EXPENSE_API_ENDPOINTS.CLAIMS}/${id}`
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense claim');
      }

      return response.data!;
    } catch (error) {
      toast.error('Failed to fetch expense claim');
      throw error;
    }
  }

  async updateExpenseClaim(id: string, claimData: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    try {
      // Validate input
      const validation = safeValidateExpenseClaim(claimData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.put<ExpenseClaimResponse>(
        `${EXPENSE_API_ENDPOINTS.CLAIMS}/${id}`,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to update expense claim');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.CLAIM_UPDATED);
      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update expense claim');
      throw error;
    }
  }

  async deleteExpenseClaim(id: string): Promise<void> {
    try {
      await this.api.delete(`${EXPENSE_API_ENDPOINTS.CLAIMS}/${id}`);
      toast.success('Expense claim deleted successfully');
    } catch (error) {
      toast.error('Failed to delete expense claim');
      throw error;
    }
  }

  async submitExpenseClaim(id: string): Promise<ExpenseClaim> {
    try {
      const response = await this.api.post<ExpenseClaimResponse>(
        `${EXPENSE_API_ENDPOINTS.CLAIMS}/${id}/submit`,
        {}
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit expense claim');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.CLAIM_SUBMITTED);
      return response.data!;
    } catch (error) {
      toast.error('Failed to submit expense claim');
      throw error;
    }
  }

  // Expense Items
  async createExpenseItem(itemData: Partial<ExpenseItem>): Promise<ExpenseItem> {
    try {
      const validation = safeValidateExpenseItem(itemData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.post<{ success: boolean; data?: ExpenseItem; error?: string }>(
        EXPENSE_API_ENDPOINTS.ITEMS,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create expense item');
      }

      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense item');
      throw error;
    }
  }

  async getExpenseItems(claimId: string): Promise<ExpenseItem[]> {
    try {
      const response = await this.api.get<{ success: boolean; data?: ExpenseItem[]; error?: string }>(
        `${EXPENSE_API_ENDPOINTS.ITEMS}?expense_claim_id=${claimId}`
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense items');
      }

      return response.data || [];
    } catch (error) {
      toast.error('Failed to fetch expense items');
      throw error;
    }
  }

  // Expense Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      const cacheKey = CACHE_KEYS.EXPENSE_CATEGORIES;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const response = await this.api.get<{ success: boolean; data?: ExpenseCategory[]; error?: string }>(
        EXPENSE_API_ENDPOINTS.CATEGORIES
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense categories');
      }

      const categories = response.data || [];
      this.cache.set(cacheKey, categories, CACHE_TTL.LONG);
      return categories;
    } catch (error) {
      toast.error('Failed to fetch expense categories');
      throw error;
    }
  }

  async createExpenseCategory(categoryData: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    try {
      const validation = safeValidateExpenseCategory(categoryData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.post<{ success: boolean; data?: ExpenseCategory; error?: string }>(
        EXPENSE_API_ENDPOINTS.CATEGORIES,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create expense category');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.CATEGORY_CREATED);
      this.cache.delete(CACHE_KEYS.EXPENSE_CATEGORIES);
      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense category');
      throw error;
    }
  }

  // Expense Policies
  async getExpensePolicies(): Promise<ExpensePolicy[]> {
    try {
      const cacheKey = CACHE_KEYS.EXPENSE_POLICIES;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const response = await this.api.get<{ success: boolean; data?: ExpensePolicy[]; error?: string }>(
        EXPENSE_API_ENDPOINTS.POLICIES
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense policies');
      }

      const policies = response.data || [];
      this.cache.set(cacheKey, policies, CACHE_TTL.LONG);
      return policies;
    } catch (error) {
      toast.error('Failed to fetch expense policies');
      throw error;
    }
  }

  async createExpensePolicy(policyData: Partial<ExpensePolicy>): Promise<ExpensePolicy> {
    try {
      const validation = safeValidateExpensePolicy(policyData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.post<{ success: boolean; data?: ExpensePolicy; error?: string }>(
        EXPENSE_API_ENDPOINTS.POLICIES,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create expense policy');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.POLICY_CREATED);
      this.cache.delete(CACHE_KEYS.EXPENSE_POLICIES);
      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense policy');
      throw error;
    }
  }

  // Expense Receipts
  async uploadReceipt(receiptData: Partial<ExpenseReceipt>, file: File): Promise<ExpenseReceipt> {
    try {
      const validation = safeValidateExpenseReceipt(receiptData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify(validation.data));

      const response = await fetch(`${this.api['baseURL']}${EXPENSE_API_ENDPOINTS.UPLOADS}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload receipt');
      throw error;
    }
  }

  async processOCR(receiptId: string): Promise<Partial<ExpenseReceipt>> {
    try {
      const response = await this.api.post<{ success: boolean; data?: Partial<ExpenseReceipt>; error?: string }>(
        `${EXPENSE_API_ENDPOINTS.OCR}/${receiptId}`,
        {}
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to process OCR');
      }

      return response.data || {};
    } catch (error) {
      toast.error('Failed to process OCR');
      throw error;
    }
  }

  async validateReceipt(receiptId: string): Promise<boolean> {
    try {
      const response = await this.api.post<{ success: boolean; data?: boolean; error?: string }>(
        `${EXPENSE_API_ENDPOINTS.RECEIPTS}/${receiptId}/validate`,
        {}
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to validate receipt');
      }

      return response.data || false;
    } catch (error) {
      toast.error('Failed to validate receipt');
      throw error;
    }
  }

  // Expense Approvals
  async createExpenseApproval(approvalData: Partial<ExpenseApproval>): Promise<ExpenseApproval> {
    try {
      const validation = safeValidateExpenseApproval(approvalData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.post<{ success: boolean; data?: ExpenseApproval; error?: string }>(
        EXPENSE_API_ENDPOINTS.APPROVALS,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create expense approval');
      }

      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense approval');
      throw error;
    }
  }

  async getExpenseApprovals(claimId: string): Promise<ExpenseApproval[]> {
    try {
      const response = await this.api.get<{ success: boolean; data?: ExpenseApproval[]; error?: string }>(
        `${EXPENSE_API_ENDPOINTS.APPROVALS}?expense_claim_id=${claimId}`
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense approvals');
      }

      return response.data || [];
    } catch (error) {
      toast.error('Failed to fetch expense approvals');
      throw error;
    }
  }

  // Expense Budgets
  async getExpenseBudgets(): Promise<ExpenseBudget[]> {
    try {
      const cacheKey = CACHE_KEYS.EXPENSE_BUDGETS;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const response = await this.api.get<{ success: boolean; data?: ExpenseBudget[]; error?: string }>(
        EXPENSE_API_ENDPOINTS.BUDGETS
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense budgets');
      }

      const budgets = response.data || [];
      this.cache.set(cacheKey, budgets, CACHE_TTL.MEDIUM);
      return budgets;
    } catch (error) {
      toast.error('Failed to fetch expense budgets');
      throw error;
    }
  }

  async createExpenseBudget(budgetData: Partial<ExpenseBudget>): Promise<ExpenseBudget> {
    try {
      const validation = safeValidateExpenseBudget(budgetData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const response = await this.api.post<{ success: boolean; data?: ExpenseBudget; error?: string }>(
        EXPENSE_API_ENDPOINTS.BUDGETS,
        validation.data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create expense budget');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.BUDGET_CREATED);
      this.cache.delete(CACHE_KEYS.EXPENSE_BUDGETS);
      return response.data!;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense budget');
      throw error;
    }
  }

  // Expense Reports
  async generateExpenseReport(reportData: Partial<ExpenseReport>): Promise<ExpenseReport> {
    try {
      const response = await this.api.post<{ success: boolean; data?: ExpenseReport; error?: string }>(
        EXPENSE_API_ENDPOINTS.REPORTS,
        reportData
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate expense report');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.REPORT_GENERATED);
      return response.data!;
    } catch (error) {
      toast.error('Failed to generate expense report');
      throw error;
    }
  }

  async getExpenseAnalytics(filters: ExpenseFilters = {}): Promise<ExpenseAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const endpoint = `${EXPENSE_API_ENDPOINTS.ANALYTICS}?${queryParams.toString()}`;
      const response = await this.api.get<{ success: boolean; data?: ExpenseAnalytics; error?: string }>(endpoint);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch expense analytics');
      }

      return response.data!;
    } catch (error) {
      toast.error('Failed to fetch expense analytics');
      throw error;
    }
  }

  // Expense Reimbursements
  async processReimbursement(reimbursementData: Partial<ExpenseReimbursement>): Promise<ExpenseReimbursement> {
    try {
      const response = await this.api.post<{ success: boolean; data?: ExpenseReimbursement; error?: string }>(
        EXPENSE_API_ENDPOINTS.REIMBURSEMENTS,
        reimbursementData
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to process reimbursement');
      }

      toast.success(EXPENSE_SUCCESS_MESSAGES.PAYMENT_PROCESSED);
      return response.data!;
    } catch (error) {
      toast.error('Failed to process reimbursement');
      throw error;
    }
  }

  // Business Logic Validation
  async validateExpenseClaim(claim: ExpenseClaim): Promise<{
    compliant: boolean;
    violations: string[];
    warnings: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];

    try {
      // Get applicable policies
      const policies = await this.getExpensePolicies();
      const applicablePolicy = policies.find(policy => 
        policy.is_active && 
        new Date() >= new Date(policy.effective_date) &&
        (!policy.expiry_date || new Date() <= new Date(policy.expiry_date))
      );

      if (applicablePolicy) {
        const compliance = validateExpensePolicyCompliance(claim, applicablePolicy);
        if (!compliance.compliant) {
          violations.push(...compliance.violations);
        }
      }

      // Check budget compliance
      const budgets = await this.getExpenseBudgets();
      const applicableBudget = budgets.find(budget => 
        budget.is_active && 
        budget.target_id === claim.employee_id
      );

      if (applicableBudget) {
        const budgetCompliance = validateBudgetCompliance(claim, applicableBudget);
        if (budgetCompliance.exceeded) {
          violations.push(`Budget exceeded: ${claim.total_amount} > ${applicableBudget.available_amount}`);
        } else if (budgetCompliance.available < applicableBudget.warning_threshold) {
          warnings.push(EXPENSE_WARNING_MESSAGES.BUDGET_APPROACHING_LIMIT);
        }
      }

      // Check for duplicate claims
      const existingClaims = await this.getExpenseClaims({
        employee_id: claim.employee_id,
        date_from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      });

      const potentialDuplicates = existingClaims.filter(existing => 
        existing.id !== claim.id &&
        Math.abs(existing.total_amount - claim.total_amount) < 1 &&
        existing.status !== 'cancelled'
      );

      if (potentialDuplicates.length > 0) {
        warnings.push(EXPENSE_WARNING_MESSAGES.DUPLICATE_DETECTED);
      }

      return {
        compliant: violations.length === 0,
        violations,
        warnings
      };
    } catch (error) {
      console.error('Validation error:', error);
      violations.push('Validation failed due to system error');
      return {
        compliant: false,
        violations,
        warnings
      };
    }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern: string): void {
    this.cache.invalidatePattern(pattern);
  }
}

// Export singleton instance
export const expenseService = new ExpenseService(); 