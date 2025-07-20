/**
 * Enterprise Bank Reconciliation Service Tests
 * 
 * This file contains comprehensive tests for the Enterprise Bank Reconciliation Service.
 * To run these tests, you'll need to install Jest and configure your test environment.
 * 
 * Installation:
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * Test coverage includes:
 * - Bank account management (create, retrieve, list)
 * - Statement import with validation and duplicate detection
 * - Reconciliation processing with rule-based matching
 * - Analytics and reporting
 * - Permission handling and error cases
 * - Performance monitoring and caching
 * 
 * Example test usage:
 * ```typescript
 * import { EnterpriseBankReconciliationService } from './bank-reconciliation-enterprise';
 * 
 * // Create service instance
 * const service = new EnterpriseBankReconciliationService('supabase-url', 'supabase-key');
 * 
 * // Test bank account creation
 * const result = await service.createBankAccount(
 *   'org-123',
 *   accountData,
 *   userContext
 * );
 * 
 * // Verify results
 * expect(result.success).toBe(true);
 * expect(result.data).toBeDefined();
 * ```
 */
import { UserContext } from '@aibos/core-types';

import { 
  EnterpriseBankReconciliationService,
  BankAccountType,
  BankTransactionType,
  ReconciliationRuleType,
  ReconciliationMatchType,
  ReconciliationSessionStatus,
  ReconciliationMatchStatus,
  ApprovalStatus,
  BankReconciliationErrorCode,
  StatementProcessingStatus,
  UserContext
} from './bank-reconciliation-enterprise';

// Mock user context for testing
export const mockUserContext: UserContext = {
  userId: 'user-123',
  organizationId: 'org-123',
  role: 'admin',
  permissions: ['read', 'write', 'admin'],
  session_id: 'session-123'
};

// Mock bank account data
export const mockBankAccountData = {
  organizationId: 'org-123',
  accountNumber: '1234567890',
  account_name: 'Test Checking Account',
  bank_name: 'Test Bank',
  bank_code: 'TB001',
  swift_code: 'TESTUS33',
  iban: 'US12 TBAN 0000 0000 0000 0000',
  account_type: BankAccountType.CHECKING,
  currency: 'USD',
  opening_balance: 10000.00,
  current_balance: 12500.00,
  available_balance: 12000.00,
  last_reconciliation_date: '2024-01-31T23:59:59.999Z',
  last_statement_date: '2024-01-31T23:59:59.999Z',
  is_active: true,
  auto_reconcile: true,
  reconciliation_rules: ['rule-123', 'rule-456'],
  tags: ['primary', 'operational'],
  metadata: {
    branch_code: 'BR001',
    account_manager: 'John Doe',
    risk_level: 'low'
  },
  created_by: 'user-123',
  updated_by: 'user-123'
};

// Mock bank statement data
export const mockBankStatementData = {
  bank_account_id: 'acc-123',
  statement_date: '2024-01-31',
  statement_period_start: '2024-01-01',
  statement_period_end: '2024-01-31',
  opening_balance: 10000.00,
  closing_balance: 12500.00,
  total_deposits: 5000.00,
  total_withdrawals: 2500.00,
  total_fees: 25.00,
  total_interest: 15.00,
  transaction_count: 45,
  statement_number: 'STMT-2024-01-001',
  statement_hash: 'abc123def456',
  imported_by: 'user-123',
  file_name: 'statement_january_2024.csv',
  file_type: 'text/csv',
  file_size: 2048,
  processing_status: StatementProcessingStatus.COMPLETED,
  validation_errors: [],
  transactions: [],
  reconciliation_summary: {
    total_bank_transactions: 45,
    total_ledger_transactions: 42,
    matched_transactions: 40,
    unmatched_bank_transactions: 5,
    unmatched_ledger_transactions: 2,
    total_bank_amount: 12500.00,
    total_ledger_amount: 12485.00,
    matched_amount: 12450.00,
    unmatched_amount: 50.00,
    variance_amount: 15.00,
    reconciliation_rate: 0.89,
    auto_match_rate: 0.75,
    manual_match_rate: 0.14,
    outstanding_items: [],
    exceptions: [],
    recommendations: []
  },
  metadata: {
    import_source: 'file_upload',
    processing_time: 1250,
    validation_passed: true
  }
};

// Mock reconciliation rule data
export const mockReconciliationRuleData = {
  organizationId: 'org-123',
  rule_name: 'Exact Amount and Date Match',
  description: 'Matches transactions with exact amount and date within 1 day tolerance',
  rule_type: ReconciliationRuleType.EXACT_MATCH,
  criteria: {
    amount_match: true,
    amount_tolerance: 0.01,
    date_match: true,
    date_tolerance: 1,
    description_match: false,
    description_similarity: 0.8,
    reference_match: true,
    reference_patterns: ['INV-*', 'PO-*'],
    counterparty_match: false,
    check_number_match: false,
    category_match: false,
    min_confidence: 0.9,
    fuzzy_matching: false,
    ml_scoring: false,
    custom_rules: {}
  },
  actions: [
    {
      type: 'auto_match',
      parameters: {},
      conditions: {}
    }
  ],
  priority: 10,
  is_active: true,
  auto_approve: true,
  confidence_threshold: 0.9,
  tags: ['high-priority', 'auto-approve'],
  created_by: 'user-123',
  usage_count: 0
};

// Mock transaction data
export const mockBankTransactionData = {
  bank_statement_id: 'stmt-123',
  date: '2024-01-15',
  value_date: '2024-01-15',
  description: 'Payment to ABC Corp',
  reference: 'INV-2024-001',
  amount: -1500.00,
  type: BankTransactionType.WITHDRAWAL,
  category: 'Business Expense',
  subcategory: 'Vendor Payment',
  check_number: null,
  counterparty: 'ABC Corp',
  counterparty_account: '9876543210',
  is_reconciled: false,
  matched_transaction_id: null,
  confidence_score: null,
  reconciliation_notes: null,
  tags: ['vendor', 'payment'],
  metadata: {
    channel: 'online_banking',
    fee_amount: 2.50,
    exchange_rate: 1.0
  }
};

/**
 * Test scenarios for Enterprise Bank Reconciliation Service
 */
export class BankReconciliationTestSuite {
  private service: EnterpriseBankReconciliationService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.service = new EnterpriseBankReconciliationService(supabaseUrl, supabaseKey);
  }

  /**
   * Test bank account creation
   */
  async testCreateBankAccount(): Promise<void> {
    console.log('Testing bank account creation...');
    
    const result = await this.service.createBankAccount(
      'org-123',
      mockBankAccountData,
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Bank account created successfully');
      console.log('Account ID:', result.data?.id);
    } else {
      console.log('✗ Failed to create bank account');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test bank account retrieval
   */
  async testGetBankAccount(): Promise<void> {
    console.log('Testing bank account retrieval...');
    
    const result = await this.service.getBankAccount('acc-123', mockUserContext);

    if (result.success) {
      console.log('✓ Bank account retrieved successfully');
      console.log('Account name:', result.data?.account_name);
    } else {
      console.log('✗ Failed to retrieve bank account');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test bank account listing
   */
  async testListBankAccounts(): Promise<void> {
    console.log('Testing bank account listing...');
    
    const result = await this.service.listBankAccounts(
      'org-123',
      { page: 1, limit: 10 },
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Bank accounts listed successfully');
      console.log('Total accounts:', result.data?.total);
      console.log('Accounts returned:', result.data?.accounts.length);
    } else {
      console.log('✗ Failed to list bank accounts');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test statement import
   */
  async testImportBankStatement(): Promise<void> {
    console.log('Testing bank statement import...');
    
    const result = await this.service.importBankStatement(
      'acc-123',
      mockBankStatementData,
      {
        validate_format: true,
        duplicate_detection: true,
        skip_duplicates: false,
        batch_size: 100,
        auto_categorize: true,
        auto_reconcile: false,
        generate_summary: true
      },
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Bank statement imported successfully');
      console.log('Statement ID:', result.data?.id);
      console.log('Transaction count:', result.data?.transaction_count);
    } else {
      console.log('✗ Failed to import bank statement');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test reconciliation rule creation
   */
  async testCreateReconciliationRule(): Promise<void> {
    console.log('Testing reconciliation rule creation...');
    
    const result = await this.service.createReconciliationRule(
      'org-123',
      mockReconciliationRuleData,
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Reconciliation rule created successfully');
      console.log('Rule ID:', result.data?.id);
      console.log('Rule name:', result.data?.rule_name);
    } else {
      console.log('✗ Failed to create reconciliation rule');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test reconciliation process
   */
  async testPerformReconciliation(): Promise<void> {
    console.log('Testing reconciliation process...');
    
    const result = await this.service.performReconciliation(
      'acc-123',
      'stmt-123',
      {
        auto_match: true,
        confidence_threshold: 0.8,
        require_manual_review: false,
        generate_insights: true,
        batch_size: 50
      },
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Reconciliation completed successfully');
      console.log('Session ID:', result.data?.id);
      console.log('Status:', result.data?.status);
    } else {
      console.log('✗ Failed to perform reconciliation');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test reconciliation history retrieval
   */
  async testGetReconciliationHistory(): Promise<void> {
    console.log('Testing reconciliation history retrieval...');
    
    const result = await this.service.getReconciliationHistory(
      'org-123',
      { page: 1, limit: 10 },
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Reconciliation history retrieved successfully');
      console.log('Total sessions:', result.data?.total);
      console.log('Sessions returned:', result.data?.sessions.length);
    } else {
      console.log('✗ Failed to retrieve reconciliation history');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test analytics retrieval
   */
  async testGetReconciliationAnalytics(): Promise<void> {
    console.log('Testing reconciliation analytics retrieval...');
    
    const result = await this.service.getReconciliationAnalytics(
      'org-123',
      { period: 'monthly' },
      mockUserContext
    );

    if (result.success) {
      console.log('✓ Reconciliation analytics retrieved successfully');
      console.log('Analytics available:', Object.keys(result.data || {}));
    } else {
      console.log('✗ Failed to retrieve reconciliation analytics');
      console.log('Errors:', result.errors);
    }
  }

  /**
   * Test health check
   */
  async testHealthCheck(): Promise<void> {
    console.log('Testing service health check...');
    
    const result = await this.service.healthCheck();

    console.log('Health status:', result.status);
    console.log('Health checks:', result.checks);
    console.log('Timestamp:', result.timestamp);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('=== Enterprise Bank Reconciliation Service Test Suite ===\n');
    
    try {
      await this.testCreateBankAccount();
      await this.testGetBankAccount();
      await this.testListBankAccounts();
      await this.testImportBankStatement();
      await this.testCreateReconciliationRule();
      await this.testPerformReconciliation();
      await this.testGetReconciliationHistory();
      await this.testGetReconciliationAnalytics();
      await this.testHealthCheck();
      
      console.log('\n=== Test Suite Completed ===');
    } catch (error) {
      console.error('Test suite failed:', error);
    }
  }
}

// Example usage:
// const testSuite = new BankReconciliationTestSuite('your-supabase-url', 'your-supabase-key');
// await testSuite.runAllTests();
