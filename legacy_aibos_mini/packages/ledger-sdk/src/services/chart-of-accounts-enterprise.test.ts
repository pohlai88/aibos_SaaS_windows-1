import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { UserContext } from '@aibos/core-types';
import { 
  EnterpriseChartOfAccountsService, 
  AccountType, 
  AccountCategory, 
  CreateAccountInput,
  UserContext,
  AccountErrorCode
} from './chart-of-accounts-enterprise';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

describe('EnterpriseChartOfAccountsService', () => {
  let service: EnterpriseChartOfAccountsService;
  let mockSupabase: any;
  let userContext: UserContext;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis()
    };

    (createClient as any).mockReturnValue(mockSupabase);

    service = new EnterpriseChartOfAccountsService(
      'https://test.supabase.co',
      'test-key'
    );

    userContext = {
      userId: 'user-123',
      organizationId: 'org-123',
      permissions: ['accounts.*'],
      role: 'admin',
      correlation_id: 'test-correlation'
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create account with valid data', async () => {
      const accountData: CreateAccountInput = {
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        description: 'Main cash account'
      };

      const mockCreatedAccount = {
        id: 'account-123',
        organizationId: 'org-123',
        ...accountData,
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      // Mock database responses
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null }); // No duplicate check
      mockSupabase.single.mockResolvedValueOnce({ data: mockCreatedAccount, error: null }); // Insert result
      mockSupabase.insert.mockResolvedValueOnce({ data: [mockCreatedAccount], error: null }); // Audit log

      const result = await service.createAccount('org-123', accountData, userContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedAccount);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          ...accountData,
          organizationId: 'org-123',
          normal_balance: 'debit',
          created_by: 'user-123',
          updated_by: 'user-123'
        })
      ]);
    });

    it('should reject duplicate account numbers', async () => {
      const accountData: CreateAccountInput = {
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset'
      };

      // Mock existing account
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'existing-account' }, 
        error: null 
      });

      const result = await service.createAccount('org-123', accountData, userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.DUPLICATE_accountNumber);
      expect(result.errors[0].message).toContain('1000');
    });

    it('should validate account type and category compatibility', async () => {
      const accountData: CreateAccountInput = {
        accountNumber: '1000',
        name: 'Invalid Account',
        account_type: 'asset',
        account_category: 'revenue' // Invalid combination
      };

      // Mock no duplicate
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      const result = await service.createAccount('org-123', accountData, userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.BUSINESS_RULE_VIOLATION);
      expect(result.errors[0].message).toContain('Invalid account category');
    });

    it('should handle unauthorized access', async () => {
      const unauthorizedContext: UserContext = {
        userId: 'user-123',
        organizationId: 'org-123',
        permissions: ['accounts.read'], // No create permission
        role: 'viewer'
      };

      const accountData: CreateAccountInput = {
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset'
      };

      const result = await service.createAccount('org-123', accountData, unauthorizedContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.UNAUTHORIZED_ACCESS);
    });

    it('should set correct normal balance for different account types', async () => {
      const testCases = [
        { accountType: 'asset' as AccountType, expectedBalance: 'debit' },
        { accountType: 'expense' as AccountType, expectedBalance: 'debit' },
        { accountType: 'liability' as AccountType, expectedBalance: 'credit' },
        { accountType: 'equity' as AccountType, expectedBalance: 'credit' },
        { accountType: 'revenue' as AccountType, expectedBalance: 'credit' }
      ];

      for (const testCase of testCases) {
        const accountData: CreateAccountInput = {
          accountNumber: `${testCase.accountType}-001`,
          name: `Test ${testCase.accountType}`,
          account_type: testCase.accountType,
          account_category: testCase.accountType === 'asset' ? 'current_asset' : 
                           testCase.accountType === 'liability' ? 'current_liability' : 
                           testCase.accountType as AccountCategory
        };

        const mockCreatedAccount = {
          id: `account-${testCase.accountType}`,
          organizationId: 'org-123',
          ...accountData,
          normal_balance: testCase.expectedBalance,
          is_active: true,
          is_system_account: false,
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          created_by: 'user-123',
          updated_by: 'user-123'
        };

        // Mock database responses
        mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
        mockSupabase.single.mockResolvedValueOnce({ data: mockCreatedAccount, error: null });
        mockSupabase.insert.mockResolvedValueOnce({ data: [mockCreatedAccount], error: null });

        const result = await service.createAccount('org-123', accountData, userContext);

        expect(result.success).toBe(true);
        expect(result.data?.normal_balance).toBe(testCase.expectedBalance);
      }
    });
  });

  describe('getAccount', () => {
    it('should retrieve account successfully', async () => {
      const mockAccount = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockAccount, error: null });

      const result = await service.getAccount('org-123', 'account-123', userContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAccount);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for non-existent account', async () => {
      mockSupabase.single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows returned' } 
      });

      const result = await service.getAccount('org-123', 'non-existent', userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.ACCOUNT_NOT_FOUND);
    });

    it('should use cache for repeated requests', async () => {
      const mockAccount = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockAccount, error: null });

      // First call - should hit database
      const result1 = await service.getAccount('org-123', 'account-123', userContext);
      expect(result1.success).toBe(true);
      expect(result1.metadata?.cache_hit).toBe(false);

      // Second call - should hit cache
      const result2 = await service.getAccount('org-123', 'account-123', userContext);
      expect(result2.success).toBe(true);
      expect(result2.metadata?.cache_hit).toBe(true);

      // Should only call database once
      expect(mockSupabase.single).toHaveBeenCalledTimes(1);
    });
  });

  describe('listAccounts', () => {
    it('should list accounts with pagination', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          organizationId: 'org-123',
          accountNumber: '1000',
          name: 'Cash',
          account_type: 'asset',
          account_category: 'current_asset',
          normal_balance: 'debit',
          is_active: true,
          is_system_account: false,
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          created_by: 'user-123',
          updated_by: 'user-123'
        },
        {
          id: 'account-2',
          organizationId: 'org-123',
          accountNumber: '2000',
          name: 'Accounts Receivable',
          account_type: 'asset',
          account_category: 'current_asset',
          normal_balance: 'debit',
          is_active: true,
          is_system_account: false,
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          created_by: 'user-123',
          updated_by: 'user-123'
        }
      ];

      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: mockAccounts, error: null, count: 2 })
      });

      const result = await service.listAccounts(
        'org-123',
        { account_type: 'asset' },
        { page: 1, limit: 10 },
        userContext
      );

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(2);
      expect(result.data?.pagination.total).toBe(2);
      expect(result.data?.pagination.page).toBe(1);
      expect(result.data?.pagination.limit).toBe(10);
    });

    it('should apply search filters', async () => {
      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      });

      await service.listAccounts(
        'org-123',
        { 
          account_type: 'asset',
          is_active: true,
          search_term: 'cash'
        },
        {},
        userContext
      );

      expect(mockSupabase.eq).toHaveBeenCalledWith('account_type', 'asset');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockSupabase.or).toHaveBeenCalledWith('name.ilike.%cash%,accountNumber.ilike.%cash%');
    });
  });

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const updates = {
        name: 'Updated Cash Account',
        description: 'Updated description'
      };

      const existingAccount = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      const updatedAccount = { ...existingAccount, ...updates };

      // Mock getAccount for validation
      mockSupabase.single.mockResolvedValueOnce({ data: existingAccount, error: null });
      // Mock update
      mockSupabase.single.mockResolvedValueOnce({ data: updatedAccount, error: null });
      // Mock audit log
      mockSupabase.insert.mockResolvedValueOnce({ data: [{}], error: null });

      const result = await service.updateAccount('org-123', 'account-123', updates, userContext);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Cash Account');
      expect(result.data?.description).toBe('Updated description');
    });

    it('should prevent modification of system accounts', async () => {
      const updates = {
        name: 'Updated System Account'
      };

      const systemAccount = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'System Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: true, // System account
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'system',
        updated_by: 'system'
      };

      // Mock getAccount
      mockSupabase.single.mockResolvedValueOnce({ data: systemAccount, error: null });

      const result = await service.updateAccount('org-123', 'account-123', updates, userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.SYSTEM_ACCOUNT_MODIFICATION);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const account = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      // Mock getAccount
      mockSupabase.single.mockResolvedValueOnce({ data: account, error: null });
      // Mock transaction check
      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [], error: null })
      });
      // Mock child accounts check
      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [], error: null })
      });
      // Mock delete
      mockSupabase.delete.mockResolvedValueOnce({ error: null });
      // Mock audit log
      mockSupabase.insert.mockResolvedValueOnce({ data: [{}], error: null });

      const result = await service.deleteAccount('org-123', 'account-123', userContext);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should prevent deletion of accounts with transactions', async () => {
      const account = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      // Mock getAccount
      mockSupabase.single.mockResolvedValueOnce({ data: account, error: null });
      // Mock transaction check - has transactions
      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [{ id: 'transaction-1' }], error: null })
      });

      const result = await service.deleteAccount('org-123', 'account-123', userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.ACCOUNT_HAS_TRANSACTIONS);
    });

    it('should prevent deletion of accounts with child accounts', async () => {
      const account = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      // Mock getAccount
      mockSupabase.single.mockResolvedValueOnce({ data: account, error: null });
      // Mock transaction check - no transactions
      mockSupabase.select.mockReturnValueOnce({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [], error: null })
      });
      // Mock child accounts check - has children
      mockSupabase.select.mockReturnValueOnce({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [{ id: 'child-1' }], error: null })
      });

      const result = await service.deleteAccount('org-123', 'account-123', userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(AccountErrorCode.ACCOUNT_HAS_CHILDREN);
    });
  });

  describe('getAccountUsageStats', () => {
    it('should calculate usage statistics correctly', async () => {
      const mockTransactions = [
        { debit_amount: 100, credit_amount: 0, createdAt: '2023-01-01T00:00:00Z' },
        { debit_amount: 0, credit_amount: 50, createdAt: '2023-01-02T00:00:00Z' },
        { debit_amount: 25, credit_amount: 0, createdAt: '2023-01-03T00:00:00Z' }
      ];

      // Mock transactions query
      mockSupabase.select.mockReturnValueOnce({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: mockTransactions, error: null })
      });

      // Mock child accounts count
      mockSupabase.select.mockReturnValueOnce({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ count: 2, error: null })
      });

      const result = await service.getAccountUsageStats('org-123', 'account-123', userContext);

      expect(result.success).toBe(true);
      expect(result.data?.transaction_count).toBe(3);
      expect(result.data?.total_debit).toBe(125);
      expect(result.data?.total_credit).toBe(50);
      expect(result.data?.current_balance).toBe(75);
      expect(result.data?.child_accounts_count).toBe(2);
      expect(result.data?.last_used).toBe('2023-01-03T00:00:00Z');
    });
  });

  describe('createMultipleAccounts', () => {
    it('should create multiple accounts successfully', async () => {
      const accounts: CreateAccountInput[] = [
        {
          accountNumber: '1000',
          name: 'Cash',
          account_type: 'asset',
          account_category: 'current_asset'
        },
        {
          accountNumber: '2000',
          name: 'Accounts Receivable',
          account_type: 'asset',
          account_category: 'current_asset'
        }
      ];

      // Mock successful creation for both accounts
      accounts.forEach((account, index) => {
        const mockAccount = {
          id: `account-${index + 1}`,
          organizationId: 'org-123',
          ...account,
          normal_balance: 'debit',
          is_active: true,
          is_system_account: false,
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          created_by: 'user-123',
          updated_by: 'user-123'
        };

        // Mock duplicate check
        mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
        // Mock insert
        mockSupabase.single.mockResolvedValueOnce({ data: mockAccount, error: null });
        // Mock audit log
        mockSupabase.insert.mockResolvedValueOnce({ data: [{}], error: null });
      });

      const result = await service.createMultipleAccounts('org-123', accounts, userContext);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
    });

    it('should handle partial failures', async () => {
      const accounts: CreateAccountInput[] = [
        {
          accountNumber: '1000',
          name: 'Cash',
          account_type: 'asset',
          account_category: 'current_asset'
        },
        {
          accountNumber: '1000', // Duplicate account number
          name: 'Duplicate',
          account_type: 'asset',
          account_category: 'current_asset'
        }
      ];

      // First account succeeds
      const mockAccount1 = {
        id: 'account-1',
        organizationId: 'org-123',
        ...accounts[0],
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      // Mock first account creation
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
      mockSupabase.single.mockResolvedValueOnce({ data: mockAccount1, error: null });
      mockSupabase.insert.mockResolvedValueOnce({ data: [{}], error: null });

      // Second account fails due to duplicate
      mockSupabase.single.mockResolvedValueOnce({ data: { id: 'existing' }, error: null });

      const result = await service.createMultipleAccounts('org-123', accounts, userContext);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
    });
  });

  describe('performance monitoring', () => {
    it('should track performance metrics', async () => {
      const mockAccount = {
        id: 'account-123',
        organizationId: 'org-123',
        accountNumber: '1000',
        name: 'Cash',
        account_type: 'asset',
        account_category: 'current_asset',
        normal_balance: 'debit',
        is_active: true,
        is_system_account: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: 'user-123',
        updated_by: 'user-123'
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockAccount, error: null });

      await service.getAccount('org-123', 'account-123', userContext);

      const metrics = service.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].operation).toBe('getAccount');
      expect(metrics[0].success).toBe(true);
      expect(metrics[0].duration).toBeGreaterThan(0);
    });
  });

  describe('health check', () => {
    it('should return healthy status', async () => {
      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: [], error: null })
      });

      const health = await service.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.checks.database).toBe(true);
      expect(health.checks.cache).toBe(true);
      expect(health.checks.monitoring).toBe(true);
    });

    it('should return unhealthy status on database error', async () => {
      mockSupabase.select.mockReturnValue({
        ...mockSupabase,
        then: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      });

      const health = await service.healthCheck();

      expect(health.healthy).toBe(false);
      expect(health.checks.database).toBe(false);
    });
  });
});
