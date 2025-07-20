import { ValidationResult } from '@aibos/core-types';

// Validation Schemas for Ledger SDK
import { z } from 'zod';
import { AccountType, NormalBalance, JournalEntryStatus, JournalEntryType } from './types';

// Base validation schemas
export const AccountTypeSchema = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']);
export const NormalBalanceSchema = z.nativeEnum(NormalBalance);
export const JournalEntryStatusSchema = z.nativeEnum(JournalEntryStatus);
export const JournalEntryTypeSchema = z.nativeEnum(JournalEntryType);

// Currency validation
export const CurrencyCodeSchema = z.string().length(3).regex(/^[A-Z]{3}$/);
export const ExchangeRateSchema = z.number().positive().max(1000000);

// Amount validation with precision
export const AmountSchema = z.number()
  .min(-999999999999.99)
  .max(999999999999.99)
  .multipleOf(0.01);

// Date validation
export const DateSchema = z.date().or(z.string().datetime());

// Chart of Accounts validation
export const ChartOfAccountSchema = z.object({
  account_code: z.string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9\-_]+$/, 'Account code must contain only uppercase letters, numbers, hyphens, and underscores'),
  account_name: z.string().min(1).max(255),
  account_type: AccountTypeSchema,
  parent_account_id: z.string().uuid().nullable(),
  normal_balance: NormalBalanceSchema,
  description: z.string().max(1000).nullable(),
  is_active: z.boolean().default(true),
  is_system_account: z.boolean().default(false),
  metadata: z.record(z.any()).default({})
});

// Journal Entry Line validation
export const JournalEntryLineSchema = z.object({
  account_id: z.string().uuid(),
  line_number: z.number().int().positive(),
  description: z.string().max(500).nullable(),
  debit_amount: AmountSchema.default(0),
  credit_amount: AmountSchema.default(0),
  class_id: z.string().uuid().nullable(),
  location_id: z.string().uuid().nullable(),
  tax_code: z.string().max(20).nullable(),
  metadata: z.record(z.any()).default({})
}).refine(
  (data) => (data.debit_amount === 0) !== (data.credit_amount === 0),
  {
    message: 'Each line must have either a debit or credit amount, but not both',
    path: ['debit_amount', 'credit_amount']
  }
);

// Journal Entry validation
export const JournalEntrySchema = z.object({
  entry_number: z.string().min(1).max(50),
  entry_date: DateSchema,
  reference: z.string().max(255).nullable(),
  description: z.string().max(1000).nullable(),
  currency: CurrencyCodeSchema.default('USD'),
  exchange_rate: ExchangeRateSchema.default(1),
  status: JournalEntryStatusSchema.default(JournalEntryStatus.DRAFT),
  entry_type: JournalEntryTypeSchema.nullable(),
  lines: z.array(JournalEntryLineSchema).min(2)
}).refine(
  (data) => {
    const totalDebits = data.lines.reduce((sum, line) => sum + line.debit_amount, 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + line.credit_amount, 0);
    return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for rounding differences
  },
  {
    message: 'Journal entry must be balanced (total debits must equal total credits)',
    path: ['lines']
  }
);

// Financial Period validation
export const FinancialPeriodSchema = z.object({
  startDate: DateSchema,
  endDate: DateSchema,
  periodName: z.string().min(1).max(100),
  isClosed: z.boolean().default(false)
}).refine(
  (data) => data.startDate < data.endDate,
  {
    message: 'Start date must be before end date',
    path: ['endDate']
  }
);

// Trial Balance validation
export const TrialBalanceEntrySchema = z.object({
  accountId: z.string().uuid(),
  accountCode: z.string(),
  accountName: z.string(),
  accountType: AccountTypeSchema,
  normalBalance: NormalBalanceSchema,
  openingBalance: AmountSchema,
  debitTotal: AmountSchema,
  creditTotal: AmountSchema,
  closingBalance: AmountSchema,
  currency: CurrencyCodeSchema
});

// Balance Sheet validation
export const FinancialStatementLineSchema = z.object({
  accountId: z.string().uuid(),
  accountCode: z.string(),
  accountName: z.string(),
  amount: AmountSchema,
  percentage: z.number().min(0).max(100),
  level: z.number().int().min(0),
  isSubtotal: z.boolean()
});

export const BalanceSheetSchema = z.object({
  asOfDate: DateSchema,
  currency: CurrencyCodeSchema,
  assets: z.array(FinancialStatementLineSchema),
  liabilities: z.array(FinancialStatementLineSchema),
  equity: z.array(FinancialStatementLineSchema),
  totalAssets: AmountSchema,
  totalLiabilities: AmountSchema,
  totalEquity: AmountSchema,
  netWorth: AmountSchema
}).refine(
  (data) => Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01,
  {
    message: 'Balance sheet must balance (Assets = Liabilities + Equity)',
    path: ['totalAssets', 'totalLiabilities', 'totalEquity']
  }
);

// Income Statement validation
export const IncomeStatementSchema = z.object({
  periodStart: DateSchema,
  periodEnd: DateSchema,
  currency: CurrencyCodeSchema,
  revenue: z.array(FinancialStatementLineSchema),
  expenses: z.array(FinancialStatementLineSchema),
  totalRevenue: AmountSchema,
  totalExpenses: AmountSchema,
  netIncome: AmountSchema,
  grossProfit: AmountSchema,
  operatingIncome: AmountSchema
}).refine(
  (data) => data.periodStart < data.periodEnd,
  {
    message: 'Period start must be before period end',
    path: ['periodEnd']
  }
);

// Currency Conversion validation
export const CurrencyConversionSchema = z.object({
  fromCurrency: CurrencyCodeSchema,
  toCurrency: CurrencyCodeSchema,
  rate: ExchangeRateSchema,
  effectiveDate: DateSchema,
  source: z.string().max(100)
}).refine(
  (data) => data.fromCurrency !== data.toCurrency,
  {
    message: 'From and to currencies must be different',
    path: ['toCurrency']
  }
);

// Multi-currency Transaction validation
export const MultiCurrencyTransactionSchema = z.object({
  baseCurrency: CurrencyCodeSchema,
  transactionCurrency: CurrencyCodeSchema,
  exchangeRate: ExchangeRateSchema,
  baseAmount: AmountSchema,
  transactionAmount: AmountSchema,
  gainLossAccount: z.string().uuid().nullable()
}).refine(
  (data) => {
    const calculatedBaseAmount = data.transactionAmount * data.exchangeRate;
    return Math.abs(calculatedBaseAmount - data.baseAmount) < 0.01;
  },
  {
    message: 'Base amount must equal transaction amount multiplied by exchange rate',
    path: ['baseAmount']
  }
);

// Report Options validation
export const ReportOptionsSchema = z.object({
  organizationId: z.string().uuid(),
  dateRange: z.object({
    startDate: DateSchema,
    endDate: DateSchema
  }),
  currency: CurrencyCodeSchema,
  includeComparatives: z.boolean().default(false),
  comparativePeriod: z.object({
    startDate: DateSchema,
    endDate: DateSchema
  }).nullable(),
  grouping: z.object({
    byAccount: z.boolean().default(false),
    byClass: z.boolean().default(false),
    byLocation: z.boolean().default(false)
  }).default({}),
  filters: z.object({
    accountTypes: z.array(AccountTypeSchema).optional(),
    accountIds: z.array(z.string().uuid()).optional(),
    classIds: z.array(z.string().uuid()).optional(),
    locationIds: z.array(z.string().uuid()).optional()
  }).optional()
}).refine(
  (data) => data.dateRange.startDate < data.dateRange.endDate,
  {
    message: 'Date range start must be before end',
    path: ['dateRange']
  }
);

// Export Options validation
export const ExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv', 'json']),
  dateRange: z.object({
    startDate: DateSchema,
    endDate: DateSchema
  }).optional(),
  includeDetails: z.boolean().default(false),
  currency: CurrencyCodeSchema.optional(),
  language: z.string().length(2).optional()
});

// Journal Entry Template validation
export const JournalEntryTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  organizationId: z.string().uuid(),
  lines: z.array(z.object({
    account_id: z.string().uuid(),
    line_number: z.number().int().positive(),
    description: z.string().max(500).nullable(),
    debit_amount: z.number().default(0),
    credit_amount: z.number().default(0),
    class_id: z.string().uuid().nullable(),
    location_id: z.string().uuid().nullable(),
    tax_code: z.string().max(50).nullable(),
    metadata: z.record(z.any()).default({})
  })).min(2),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    interval: z.number().int().positive(),
    endDate: DateSchema.optional(),
    maxOccurrences: z.number().int().positive().optional()
  }).optional()
});

// Financial Metrics validation
export const FinancialMetricsSchema = z.object({
  organizationId: z.string().uuid(),
  asOfDate: DateSchema,
  metrics: z.object({
    totalAssets: AmountSchema,
    totalLiabilities: AmountSchema,
    totalEquity: AmountSchema,
    currentRatio: z.number().min(0),
    quickRatio: z.number().min(0),
    debtToEquityRatio: z.number().min(0),
    returnOnAssets: z.number(),
    returnOnEquity: z.number(),
    grossProfitMargin: z.number().min(-100).max(100),
    netProfitMargin: z.number().min(-100).max(100),
    workingCapital: AmountSchema,
    cashFlow: AmountSchema
  })
});

// Validation functions
export const validateChartOfAccount = (data: unknown) => {
  return ChartOfAccountSchema.safeParse(data);
};

export const validateJournalEntry = (data: unknown) => {
  return JournalEntrySchema.safeParse(data);
};

export const validateJournalEntryLine = (data: unknown) => {
  return JournalEntryLineSchema.safeParse(data);
};

export const validateTrialBalance = (data: unknown) => {
  return z.array(TrialBalanceEntrySchema).safeParse(data);
};

export const validateBalanceSheet = (data: unknown) => {
  return BalanceSheetSchema.safeParse(data);
};

export const validateIncomeStatement = (data: unknown) => {
  return IncomeStatementSchema.safeParse(data);
};

export const validateCurrencyConversion = (data: unknown) => {
  return CurrencyConversionSchema.safeParse(data);
};

export const validateMultiCurrencyTransaction = (data: unknown) => {
  return MultiCurrencyTransactionSchema.safeParse(data);
};

export const validateReportOptions = (data: unknown) => {
  return ReportOptionsSchema.safeParse(data);
};

export const validateExportOptions = (data: unknown) => {
  return ExportOptionsSchema.safeParse(data);
};

export const validateJournalEntryTemplate = (data: unknown) => {
  return JournalEntryTemplateSchema.safeParse(data);
};

export const validateFinancialMetrics = (data: unknown) => {
  return FinancialMetricsSchema.safeParse(data);
};

// Journal Entry Validation
export const journalEntrySchema = z.object({
  entry_number: z.string().min(1, 'Entry number is required'),
  entry_date: z.string().min(1, 'Entry date is required'),
  reference: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  exchange_rate: z.number().positive('Exchange rate must be positive').default(1),
  entry_type: z.enum(['manual', 'recurring', 'imported', 'adjustment', 'invoice', 'bill', 'payment', 'bank_reconciliation']).default('manual'),
  lines: z.array(z.object({
    account_id: z.string().uuid('Invalid account ID'),
    line_number: z.number().int().positive('Line number must be positive'),
    description: z.string().optional(),
    debit_amount: z.number().min(0, 'Debit amount must be non-negative'),
    credit_amount: z.number().min(0, 'Credit amount must be non-negative'),
    class_id: z.string().uuid('Invalid class ID').optional(),
    location_id: z.string().uuid('Invalid location ID').optional(),
    tax_code: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })).min(2, 'At least 2 lines required for double-entry').refine(
    (lines) => {
      const totalDebits = lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredits = lines.reduce((sum, line) => sum + line.credit_amount, 0);
      return Math.abs(totalDebits - totalCredits) < 0.01;
    },
    {
      message: 'Total debits must equal total credits',
      path: ['lines']
    }
  )
});

// Journal Entry Line Validation
export const journalEntryLineSchema = z.object({
  account_id: z.string().uuid('Invalid account ID'),
  line_number: z.number().int().positive('Line number must be positive'),
  description: z.string().optional(),
  debit_amount: z.number().min(0, 'Debit amount must be non-negative'),
  credit_amount: z.number().min(0, 'Credit amount must be non-negative'),
  class_id: z.string().uuid('Invalid class ID').optional(),
  location_id: z.string().uuid('Invalid location ID').optional(),
  tax_code: z.string().optional(),
  metadata: z.record(z.any()).optional()
}).refine(
  (data) => data.debit_amount === 0 || data.credit_amount === 0,
  {
    message: 'Line must have either debit or credit amount, not both',
    path: ['debit_amount']
  }
);

// Invoice Validation
export const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  customer_id: z.string().uuid('Invalid customer ID'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  exchange_rate: z.number().positive('Exchange rate must be positive').default(1),
  invoice_type: z.enum(['standard', 'recurring', 'credit_memo', 'debit_memo']).default('standard'),
  lines: z.array(z.object({
    line_number: z.number().int().positive('Line number must be positive'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit_price: z.number().min(0, 'Unit price must be non-negative'),
    discount_percent: z.number().min(0).max(100, 'Discount must be between 0 and 100').optional(),
    tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional(),
    account_id: z.string().uuid('Invalid account ID').optional(),
    class_id: z.string().uuid('Invalid class ID').optional(),
    metadata: z.record(z.any()).optional()
  })).min(1, 'At least 1 line required')
});

// Invoice Line Validation
export const invoiceLineSchema = z.object({
  line_number: z.number().int().positive('Line number must be positive'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  discount_percent: z.number().min(0).max(100, 'Discount must be between 0 and 100').optional(),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional(),
  account_id: z.string().uuid('Invalid account ID').optional(),
  class_id: z.string().uuid('Invalid class ID').optional(),
  metadata: z.record(z.any()).optional()
});

// Bill Validation (similar to invoice but for vendors)
export const billSchema = z.object({
  bill_number: z.string().min(1, 'Bill number is required'),
  bill_date: z.string().min(1, 'Bill date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  vendor_id: z.string().uuid('Invalid vendor ID'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  exchange_rate: z.number().positive('Exchange rate must be positive').default(1),
  bill_type: z.enum(['standard', 'recurring', 'credit_memo', 'debit_memo']).default('standard'),
  lines: z.array(z.object({
    line_number: z.number().int().positive('Line number must be positive'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit_price: z.number().min(0, 'Unit price must be non-negative'),
    discount_percent: z.number().min(0).max(100, 'Discount must be between 0 and 100').optional(),
    tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional(),
    account_id: z.string().uuid('Invalid account ID').optional(),
    class_id: z.string().uuid('Invalid class ID').optional(),
    metadata: z.record(z.any()).optional()
  })).min(1, 'At least 1 line required')
});

// Payment Validation
export const paymentSchema = z.object({
  payment_date: z.string().min(1, 'Payment date is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  payment_method: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  vendor_id: z.string().uuid('Invalid vendor ID').optional()
}).refine(
  (data) => data.customer_id || data.vendor_id,
  {
    message: 'Either customer_id or vendor_id must be provided',
    path: ['customer_id']
  }
);

// Customer Validation
export const customerSchema = z.object({
  customer_code: z.string().min(1, 'Customer code is required'),
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
  tax_id: z.string().optional(),
  credit_limit: z.number().min(0, 'Credit limit must be non-negative').optional(),
  payment_terms: z.number().int().positive('Payment terms must be positive').optional(),
  metadata: z.record(z.any()).optional()
});

// Vendor Validation
export const vendorSchema = z.object({
  vendor_code: z.string().min(1, 'Vendor code is required'),
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
  tax_id: z.string().optional(),
  payment_terms: z.number().int().positive('Payment terms must be positive').optional(),
  metadata: z.record(z.any()).optional()
});

// Chart of Accounts Validation
export const chartOfAccountSchema = z.object({
  account_code: z.string().min(1, 'Account code is required'),
  account_name: z.string().min(1, 'Account name is required'),
  account_type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'], {
    errorMap: () => ({ message: 'Invalid account type' })
  }),
  parent_account_id: z.string().uuid('Invalid parent account ID').optional(),
  normal_balance: z.enum(['Debit', 'Credit'], {
    errorMap: () => ({ message: 'Normal balance must be Debit or Credit' })
  }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  is_system_account: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

// Validation Functions (using the existing const functions above)
// These function versions are duplicates and have been removed

// Type for validation result (already defined in types.ts)
//  