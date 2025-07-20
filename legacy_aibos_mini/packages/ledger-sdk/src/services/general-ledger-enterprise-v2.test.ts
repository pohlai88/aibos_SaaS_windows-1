import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnterpriseGeneralLedgerService, GLErrorCode, AccountType, NormalBalance, UserContext } from './general-ledger-enterprise-v2';
import { UserContext } from '@aibos/core-types';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnValue({ data: null, error: null }),
  then: vi.fn().mockResolvedValue({ data: [], error: null })
};

// Mock createClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('EnterpriseGeneralLedgerService', () => {
  let service: EnterpriseGeneralLedgerService;
  let userContext: UserContext;

  beforeEach(() => {
    service = new EnterpriseGeneralLedgerService('test-url', 'test-key');
    userContext = {
      userId: 'user-123',
      organizationId: 'org-123',
      role: 'admin',
      permissions: ['gl.read', 'gl.write', 'gl.admin'],
      session_id: 'session-123'
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccountBalance', () => {
    it('should return account balance successfully', async () => {
      // Mock account validation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'acc-123' },
        error: null
      });

      // Mock account data
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'acc-123',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          currency: 'USD'
        },
        error: null
      });

      // Mock GL entries for balance calculation
      mockSupabase.then.mockResolvedValue({
        data: [
          { debit_amount: 1000, credit_amount: 0 },
          { debit_amount: 0, credit_amount: 200 }
        ],
        error: null
      });

      const result = await service.getAccountBalance('org-123', 'acc-123', userContext);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.account_id).toBe('acc-123');
      expect(result.data?.current_balance).toBe(800); // 1000 - 200
    });

    it('should return permission denied error for unauthorized user', async () => {
      const unauthorizedUser = {
        ...userContext,
        organizationId: 'different-org'
      };

      const result = await service.getAccountBalance('org-123', 'acc-123', unauthorizedUser);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(GLErrorCode.PERMISSION_DENIED);
    });

    it('should return account not found error for non-existent account', async () => {
      // Mock account validation failure
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Account not found' }
      });

      const result = await service.getAccountBalance('org-123', 'non-existent', userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(GLErrorCode.ACCOUNT_NOT_FOUND);
    });

    it('should use cache when available', async () => {
      // First call - should hit database
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'acc-123' },
        error: null
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'acc-123',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          currency: 'USD'
        },
        error: null
      });

      mockSupabase.then.mockResolvedValue({
        data: [{ debit_amount: 1000, credit_amount: 0 }],
        error: null
      });

      const result1 = await service.getAccountBalance('org-123', 'acc-123', userContext);
      expect(result1.success).toBe(true);
      expect(result1.metadata?.cache_hit).toBe(false);

      // Second call - should hit cache
      const result2 = await service.getAccountBalance('org-123', 'acc-123', userContext);
      expect(result2.success).toBe(true);
      expect(result2.metadata?.cache_hit).toBe(true);
    });
  });

  describe('getAccountHistory', () => {
    it('should return account history successfully', async () => {
      // Mock account data
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'acc-123',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET
        },
        error: null
      });

      // Mock GL entries
      mockSupabase.then.mockResolvedValue({
        data: [
          {
            id: 'entry-1',
            account_id: 'acc-123',
            date: '2024-01-01',
            description: 'Opening balance',
            debit_amount: 1000,
            credit_amount: 0,
            journal_entry: {
              entry_number: 'JE001',
              entry_date: '2024-01-01',
              description: 'Opening balance'
            }
          }
        ],
        error: null
      });

      // Mock opening balance entries
      mockSupabase.then.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await service.getAccountHistory('org-123', 'acc-123', {
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      }, userContext);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.entries).toHaveLength(1);
      expect(result.data?.summary.total_transactions).toBe(1);
      expect(result.data?.summary.total_debits).toBe(1000);
    });

    it('should validate query options', async () => {
      const invalidOptions = {
        limit: -1 // Invalid limit
      };

      const result = await service.getAccountHistory('org-123', 'acc-123', invalidOptions, userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(GLErrorCode.VALIDATION_ERROR);
    });

    it('should apply pagination correctly', async () => {
      // Mock account data
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'acc-123',
          account_code: '1000',
          account_name: 'Cash'
        },
        error: null
      });

      // Mock paginated entries
      mockSupabase.range.mockReturnThis();
      mockSupabase.then.mockResolvedValue({
        data: [
          { id: 'entry-1', debit_amount: 100, credit_amount: 0 },
          { id: 'entry-2', debit_amount: 200, credit_amount: 0 }
        ],
        error: null
      });

      const result = await service.getAccountHistory('org-123', 'acc-123', {
        limit: 2,
        offset: 0
      }, userContext);

      expect(result.success).toBe(true);
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('generateGLReport', () => {
    it('should generate GL report successfully', async () => {
      // Mock accounts query
      mockSupabase.then.mockResolvedValueOnce({
        data: [
          {
            id: 'acc-1',
            account_code: '1000',
            account_name: 'Cash',
            account_type: AccountType.ASSET,
            active: true
          },
          {
            id: 'acc-2',
            account_code: '2000',
            account_name: 'Accounts Payable',
            account_type: AccountType.LIABILITY,
            active: true
          }
        ],
        error: null
      });

      // Mock individual account balance calls
      const mockGetAccountBalance = vi.spyOn(service, 'getAccountBalance');
      mockGetAccountBalance.mockResolvedValue({
        success: true,
        data: {
          account_id: 'acc-1',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          opening_balance: 0,
          current_balance: 1000,
          period_debits: 1000,
          period_credits: 0,
          period_balance: 1000,
          ytd_debits: 1000,
          ytd_credits: 0,
          ytd_balance: 1000,
          currency: 'USD',
          base_currency_balance: 1000,
          is_reconciled: true
        },
        errors: [],
        warnings: []
      });

      const result = await service.generateGLReport('org-123', {
        account_types: [AccountType.ASSET, AccountType.LIABILITY]
      }, userContext);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.accounts).toHaveLength(2);
      expect(result.data?.summary_by_type).toHaveLength(2);
      expect(result.data?.totals.total_accounts).toBe(2);
    });

    it('should filter accounts by type', async () => {
      mockSupabase.in.mockReturnThis();
      mockSupabase.then.mockResolvedValueOnce({
        data: [
          {
            id: 'acc-1',
            account_type: AccountType.ASSET
          }
        ],
        error: null
      });

      const mockGetAccountBalance = vi.spyOn(service, 'getAccountBalance');
      mockGetAccountBalance.mockResolvedValue({
        success: true,
        data: {
          account_id: 'acc-1',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          opening_balance: 0,
          current_balance: 1000,
          period_debits: 1000,
          period_credits: 0,
          period_balance: 1000,
          ytd_debits: 1000,
          ytd_credits: 0,
          ytd_balance: 1000,
          currency: 'USD',
          base_currency_balance: 1000,
          is_reconciled: true
        },
        errors: [],
        warnings: []
      });

      const result = await service.generateGLReport('org-123', {
        account_types: [AccountType.ASSET]
      }, userContext);

      expect(result.success).toBe(true);
      expect(mockSupabase.in).toHaveBeenCalledWith('account_type', [AccountType.ASSET]);
    });

    it('should detect balance mismatches', async () => {
      // Mock accounts with unbalanced debits/credits
      mockSupabase.then.mockResolvedValueOnce({
        data: [
          {
            id: 'acc-1',
            account_code: '1000',
            account_name: 'Cash',
            account_type: AccountType.ASSET,
            active: true
          }
        ],
        error: null
      });

      const mockGetAccountBalance = vi.spyOn(service, 'getAccountBalance');
      mockGetAccountBalance.mockResolvedValue({
        success: true,
        data: {
          account_id: 'acc-1',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          opening_balance: 0,
          current_balance: 1000,
          period_debits: 1000,
          period_credits: 500, // Unbalanced
          period_balance: 500,
          ytd_debits: 1000,
          ytd_credits: 500,
          ytd_balance: 500,
          currency: 'USD',
          base_currency_balance: 1000,
          is_reconciled: true
        },
        errors: [],
        warnings: []
      });

      const result = await service.generateGLReport('org-123', {}, userContext);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe(GLErrorCode.BALANCE_MISMATCH);
    });
  });

  describe('Performance and Caching', () => {
    it('should track performance metrics', async () => {
      // Mock successful operation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'acc-123' },
        error: null
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'acc-123',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          currency: 'USD'
        },
        error: null
      });

      mockSupabase.then.mockResolvedValue({
        data: [{ debit_amount: 1000, credit_amount: 0 }],
        error: null
      });

      await service.getAccountBalance('org-123', 'acc-123', userContext);

      const metrics = service.getPerformanceMetrics();
      expect(metrics.total_operations).toBeGreaterThan(0);
      expect(metrics.average_response_time).toBeGreaterThanOrEqual(0);
    });

    it('should provide cache statistics', async () => {
      const cacheStats = service.getCacheStats();
      expect(cacheStats).toBeDefined();
      expect(cacheStats.size).toBeGreaterThanOrEqual(0);
    });

    it('should clear caches successfully', async () => {
      service.clearCaches();
      const cacheStats = service.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when all checks pass', async () => {
      mockSupabase.then.mockResolvedValueOnce({
        data: [{ count: 1 }],
        error: null
      });

      const health = await service.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.checks.database).toBe(true);
      expect(health.checks.cache).toBe(true);
      expect(health.checks.performance).toBe(true);
    });

    it('should return unhealthy status when database check fails', async () => {
      mockSupabase.then.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const health = await service.healthCheck();
      expect(health.status).toBe('unhealthy');
      expect(health.checks.database).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await service.getAccountBalance('org-123', 'acc-123', userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(GLErrorCode.ACCOUNT_NOT_FOUND);
    });

    it('should handle network timeouts', async () => {
      mockSupabase.single.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await service.getAccountBalance('org-123', 'acc-123', userContext);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(GLErrorCode.DATABASE_ERROR);
    });
  });

  describe('Validation', () => {
    it('should validate user permissions', async () => {
      const userWithoutPermissions = {
        ...userContext,
        permissions: [] // No permissions
      };

      const result = await service.getAccountBalance('org-123', 'acc-123', userWithoutPermissions);

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe(GLErrorCode.PERMISSION_DENIED);
    });

    it('should validate organization access', async () => {
      const userFromDifferentOrg = {
        ...userContext,
        organizationId: 'different-org'
      };

      const result = await service.getAccountBalance('org-123', 'acc-123', userFromDifferentOrg);

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe(GLErrorCode.PERMISSION_DENIED);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Mock account validation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'acc-123' },
        error: null
      });

      // Mock account data
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'acc-123',
          account_code: '1000',
          account_name: 'Cash',
          account_type: AccountType.ASSET,
          normal_balance: NormalBalance.DEBIT,
          currency: 'USD'
        },
        error: null
      });

      // Mock balanced entries
      mockSupabase.then.mockResolvedValue({
        data: [
          { debit_amount: 1000, credit_amount: 0 },
          { debit_amount: 0, credit_amount: 1000 }
        ],
        error: null
      });

      const result = await service.getAccountBalance('org-123', 'acc-123', userContext);

      expect(result.success).toBe(true);
      expect(result.data?.current_balance).toBe(0); // Balanced entries
    });
  });
});
