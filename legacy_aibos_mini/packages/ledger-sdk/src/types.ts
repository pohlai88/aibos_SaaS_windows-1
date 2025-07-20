import { ValidationResult, AccountingError } from '@aibos/core-types';

// Ledger SDK Types
import { 
  ChartOfAccount, 
  JournalEntry, 
  JournalEntryLine,
  GeneralLedger,
  Organization,
  Currency,
  Invoice,
  InvoiceLine,
  Customer,
  Vendor,
  Payment,
  PaymentAllocation
} from '@aibos/database';

// Primary type definition location
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

// Normal Balance Types
export enum NormalBalance {
  DEBIT = 'Debit',
  CREDIT = 'Credit'
}

// Journal Entry Status
export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  VOID = 'void'
}

// Journal Entry Types
export enum JournalEntryType {
  MANUAL = 'manual',
  RECURRING = 'recurring',
  IMPORTED = 'imported',
  ADJUSTMENT = 'adjustment',
  INVOICE = 'invoice',
  BILL = 'bill',
  PAYMENT = 'payment',
  BANK_RECONCILIATION = 'bank_reconciliation'
}

// Invoice Status
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VOID = 'void'
}

// Invoice Types
export enum InvoiceType {
  STANDARD = 'standard',
  RECURRING = 'recurring',
  CREDIT_MEMO = 'credit_memo',
  DEBIT_MEMO = 'debit_memo'
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Bill Status
export enum BillStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  APPROVED = 'approved',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VOID = 'void'
}

// ===== BANK RECONCILIATION TYPES =====

export interface BankAccount {
  id: string;
  organizationId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  lastReconciliationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankStatement {
  id: string;
  organizationId: string;
  bankAccountId: string;
  statementDate: string;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalFees: number;
  totalInterest: number;
  statementNumber: string;
  importedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  organizationId: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'fee' | 'interest' | 'transfer';
  reference: string;
  category?: string;
  isReconciled: boolean;
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationRule {
  id: string;
  organizationId: string;
  ruleName: string;
  description: string;
  ruleType: 'amount_match' | 'description_match' | 'reference_match' | 'date_match' | 'custom';
  criteria: {
    amountMatch: boolean;
    amountTolerance: number;
    descriptionMatch: boolean;
    descriptionTolerance: number;
    referenceMatch: boolean;
    dateMatch: boolean;
    dateTolerance: number;
    customRules: Record<string, any>;
  };
  actions: ReconciliationAction[];
  priority: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationAction {
  type: 'auto_match' | 'flag_review' | 'categorize' | 'split_transaction' | 'merge_transactions';
  parameters: Record<string, any>;
  conditions: Record<string, any>;
}

export interface ReconciliationMatch {
  id: string;
  organizationId: string;
  bankTransactionId: string;
  journalEntryId: string;
  matchType: 'exact' | 'partial' | 'manual';
  confidence: number;
  matchedAmount: number;
  matchedDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationSession {
  id: string;
  organizationId: string;
  bankAccountId: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationSummary {
  id: string;
  organizationId: string;
  bankAccountId: string;
  reconciliationDate: string;
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  totalAmount: number;
  matchedAmount: number;
  unmatchedAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ===== BILL MANAGEMENT TYPES =====

export interface Bill {
  id: string;
  organizationId: string;
  billNumber: string;
  vendorId: string;
  billDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: BillStatus;
  description?: string;
  reference?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillPayment {
  id: string;
  organizationId: string;
  billId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillFilter {
  vendorId?: string;
  status?: BillStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  isOverdue?: boolean;
}

export interface BillSummary {
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  overdueCount: number;
}

// ===== INTERCOMPANY TYPES =====

export interface IntercompanyEntity {
  id: string;
  organizationId: string;
  entityName: string;
  entityCode: string;
  entityType: 'subsidiary' | 'branch' | 'division' | 'department';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntercompanyElimination {
  id: string;
  organizationId: string;
  eliminationDate: string;
  fromEntityId: string;
  toEntityId: string;
  eliminationAmount: number;
  eliminationType: 'intercompany_sale' | 'intercompany_purchase' | 'intercompany_loan' | 'intercompany_investment';
  status: 'pending' | 'processed' | 'reversed';
  createdAt: string;
  updatedAt: string;
}

export interface IntercompanyConsolidation {
  id: string;
  organizationId: string;
  consolidationDate: string;
  consolidationType: 'full' | 'proportionate' | 'equity';
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netIncome: number;
  status: 'draft' | 'final' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export type IntercompanyStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type IntercompanyType = 'sale' | 'purchase' | 'loan' | 'investment' | 'expense_allocation';

// Financial Period
export interface FinancialPeriod {
  startDate: Date;
  endDate: Date;
  periodName: string;
  isClosed: boolean;
}

// Chart of Accounts Tree Structure
export interface ChartOfAccountsTree extends ChartOfAccount {
  children: ChartOfAccountsTree[];
  level: number;
  path: string[];
}

// Journal Entry with Lines
export interface JournalEntryWithLines extends JournalEntry {
  lines: JournalEntryLine[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

// Invoice with Lines
export interface InvoiceWithLines extends Invoice {
  lines: InvoiceLine[];
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  customer?: Customer;
}

// Bill with Lines
export interface BillWithLines extends Invoice {
  lines: InvoiceLine[];
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  vendor?: Vendor;
}

// Payment with Allocations
export interface PaymentWithAllocations extends Payment {
  allocations: PaymentAllocation[];
  customer?: Customer;
  vendor?: Vendor;
}

// General Ledger Entry
export interface GeneralLedgerEntry extends GeneralLedger {
  account: ChartOfAccount;
  runningBalance: number;
}

// Trial Balance Entry
export interface TrialBalanceEntry {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  currency: string;
}

// Financial Statement Line
export interface FinancialStatementLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  percentage: number;
  level: number;
  isSubtotal: boolean;
}

// Balance Sheet
export interface BalanceSheet {
  asOfDate: Date;
  currency: string;
  assets: FinancialStatementLine[];
  liabilities: FinancialStatementLine[];
  equity: FinancialStatementLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netWorth: number;
}

// Income Statement
export interface IncomeStatement {
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  revenue: FinancialStatementLine[];
  expenses: FinancialStatementLine[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
}

// Cash Flow Statement
export interface CashFlowStatement {
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  operatingActivities: FinancialStatementLine[];
  investingActivities: FinancialStatementLine[];
  financingActivities: FinancialStatementLine[];
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

// Accounting Error

// Validation Result

// Posting Result
export interface PostingResult {
  success: boolean;
  journalEntryId?: string;
  errors: AccountingError[];
  warnings: AccountingError[];
  generalLedgerUpdates: GeneralLedgerEntry[];
}

// Reconciliation Result
export interface ReconciliationResult {
  success: boolean;
  matchedTransactions: number;
  unmatchedTransactions: number;
  journalEntries: JournalEntryWithLines[];
  errors: AccountingError[];
}

// Currency Conversion
export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  source: string;
}

// Multi Currency Transaction
export interface MultiCurrencyTransaction {
  baseCurrency: string;
  transactionCurrency: string;
  exchangeRate: number;
  baseAmount: number;
  transactionAmount: number;
  gainLossAccount?: string;
}

// Audit Trail Entry
export interface AuditTrailEntry {
  id: string;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  userId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Chart of Accounts Import
export interface ChartOfAccountsImport {
  accounts: Omit<ChartOfAccount, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[];
  validationErrors: AccountingError[];
  importResult: {
    created: number;
    updated: number;
    errors: number;
  };
}

// Journal Entry Template
export interface JournalEntryTemplate {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  lines: Omit<JournalEntryLine, 'id' | 'journal_entry_id' | 'created_at'>[];
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endDate?: Date;
    maxOccurrences?: number;
  };
}

// Financial Metrics
export interface FinancialMetrics {
  organizationId: string;
  asOfDate: Date;
  metrics: {
    // Liquidity Ratios
    currentRatio: number;
    quickRatio: number;
    workingCapital: number;
    cashRatio: number;

    // Profitability Ratios
    grossProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;

    // Leverage Ratios
    debtToEquityRatio: number;
    debtToAssetsRatio: number;
    equityRatio: number;

    // Efficiency Ratios
    assetTurnoverRatio: number;
    inventoryTurnoverRatio: number;
    receivablesTurnoverRatio: number;

    // Growth Metrics
    revenueGrowth: number;
    profitGrowth: number;
    assetGrowth: number;

    // Cash Flow Metrics
    operatingCashFlowRatio: number;
    cashFlowCoverageRatio: number;
    freeCashFlow: number;
  };
}

// Export Options
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  includeCharts?: boolean;
  includeNotes?: boolean;
  currency?: string;
  language?: string;
  template?: string;
}

// Report Options
export interface ReportOptions {
  includeComparative?: boolean;
  includeKPIs?: boolean;
  includeNotes?: boolean;
  currency?: string;
  format?: 'detailed' | 'summary' | 'consolidated';
  groupBy?: 'account' | 'category' | 'entity';
  sortBy?: 'amount' | 'name' | 'code' | 'variance';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    accountTypes?: string[];
    minAmount?: number;
    maxAmount?: number;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  };
}

// Comparative Report
export interface ComparativeReport {
  currentPeriod: { startDate: string; endDate: string };
  comparativePeriod: { startDate: string; endDate: string };
  balanceSheetComparison: {
    totalAssets: ComparativeMetric;
    totalLiabilities: ComparativeMetric;
    totalEquity: ComparativeMetric;
    netWorth: ComparativeMetric;
  };
  incomeStatementComparison: {
    totalRevenue: ComparativeMetric;
    totalExpenses: ComparativeMetric;
    netIncome: ComparativeMetric;
  };
  keyVariances: KeyVariance[];
  generatedAt: string;
}

// Comparative Metric
export interface ComparativeMetric {
  current: number;
  comparative: number;
  variance: number;
  variancePercent: number;
}

// Key Variance
export interface KeyVariance {
  metric: string;
  current: number;
  comparative: number;
  variance: number;
  variancePercent: number;
  significance: 'low' | 'medium' | 'high';
}

// Intercompany Transaction
export interface IntercompanyTransaction {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  total: number;
  currency: string;
  fromEntity: string;
  toEntity: string;
  lines: IntercompanyLine[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Intercompany Line
export interface IntercompanyLine {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  entity: string;
}

// Trial Balance Report
export interface TrialBalanceReport {
  trialBalance: TrialBalanceLine[];
  totals: {
    totalDebits: number;
    totalCredits: number;
    totalOpeningBalance: number;
    totalClosingBalance: number;
  };
  asOfDate: string;
  generatedAt: string;
}

// Trial Balance Line
export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  normalBalance: 'debit' | 'credit';
  parentAccountId?: string;
  level: number;
  isActive: boolean;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  currency: string;
  periodStart?: string;
  periodEnd?: string;
}

// Intercompany Report
export interface IntercompanyReport {
  asOfDate: string;
  intercompanyAccounts: any[];
  intercompanyBalances: IntercompanyBalance[];
  totalTransactions: number;
  totalAmount: number;
  generatedAt: string;
}

// Intercompany Balance
export interface IntercompanyBalance {
  id: string;
  organizationId: string;
  fromEntityId: string;
  toEntityId: string;
  asOfDate: string;
  balance: number;
  currency: string;
  fromEntity?: IntercompanyEntity;
  toEntity?: IntercompanyEntity;
}

// Tax Types
export type TaxType = 'sales_tax' | 'vat' | 'gst' | 'income_tax' | 'payroll_tax' | 'property_tax' | 'excise_tax' | 'customs_duty';
export type TaxStatus = 'pending' | 'posted' | 'paid' | 'overdue' | 'cancelled';
export type CalculationMethod = 'percentage' | 'fixed' | 'tiered' | 'compound';
export type RoundingMethod = 'round' | 'floor' | 'ceiling' | 'truncate';
export type FilingFrequency = 'monthly' | 'quarterly' | 'annually' | 'as_required';

// Tax Jurisdiction
export interface TaxJurisdiction {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  country: string;
  stateProvince?: string;
  city?: string;
  postalCode?: string;
  taxAuthority: string;
  filingFrequency: FilingFrequency;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tax Code
export interface TaxCode {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description?: string;
  taxType: TaxType;
  jurisdictionId: string;
  isActive: boolean;
  isCompound: boolean;
  calculationMethod: CalculationMethod;
  roundingMethod: RoundingMethod;
  effectiveDate: string;
  expiryDate?: string;
  jurisdiction?: TaxJurisdiction;
  createdAt: string;
  updatedAt: string;
}

// Tax Rate
export interface TaxRate {
  id: string;
  organizationId: string;
  taxCodeId: string;
  ratePercentage: number;
  effectiveDate: string;
  expiryDate?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Tax Exemption
export interface TaxExemption {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tax Calculation
export interface TaxCalculation {
  id: string;
  organizationId: string;
  taxCodeId: string;
  taxCode?: TaxCode;
  amount: number;
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  calculationMethod: CalculationMethod;
  isTaxInclusive: boolean;
  exemptions: string[];
  location?: {
    country?: string;
    stateProvince?: string;
    city?: string;
    postalCode?: string;
  };
  calculatedAt: string;
}

// Tax Transaction
export interface TaxTransaction {
  id: string;
  organizationId: string;
  transactionType: 'invoice' | 'bill' | 'journal_entry' | 'payment' | 'adjustment';
  transactionId: string;
  taxCodeId: string;
  amount: number;
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  transactionDate: string;
  dueDate?: string;
  status: TaxStatus;
  jurisdictionId: string;
  reference?: string;
  notes?: string;
  taxCode?: TaxCode;
  jurisdiction?: TaxJurisdiction;
  createdAt: string;
  updatedAt: string;
}

// Tax Report
export interface TaxReport {
  id: string;
  organizationId: string;
  jurisdictionId: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  totalTransactions: number;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  taxCodeBreakdown: Array<{
    taxCodeId: string;
    transactionCount: number;
    taxableAmount: number;
    taxAmount: number;
  }>;
  status: 'draft' | 'generated' | 'filed' | 'paid';
}

// Document Types
export type DocumentCategory = 'invoice' | 'bill' | 'receipt' | 'contract' | 'statement' | 'report' | 'certificate' | 'license' | 'other';
export type DocumentStatus = 'active' | 'archived' | 'expired' | 'deleted';
export type PermissionType = 'read' | 'write' | 'delete' | 'admin';

// Document Metadata
export interface DocumentMetadata {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  tags: string[];
  relatedEntityType: string;
  relatedEntityId: string;
  status: DocumentStatus;
  isPublic: boolean;
  expiryDate?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Document Attachment
export interface DocumentAttachment extends DocumentMetadata {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  versions: DocumentVersion[];
}

// Document Version
export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  changeNotes: string;
  createdAt: string;
}

// Document Permission
export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  roleId?: string;
  permissionType: PermissionType;
  grantedBy: string;
  grantedAt: string;
}

// Document Search Result
export interface DocumentSearchResult {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  relatedEntityType: string;
  relatedEntityId: string;
  uploadedBy: string;
  createdAt: string;
  relevanceScore: number;
}

// Recurring Transaction Types
export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type RecurringStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// Recurring Schedule
export interface RecurringSchedule {
  type: ScheduleType;
  config: {
    interval?: number;
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    monthOfYear?: number; // 1-12
    endDate?: string;
    maxOccurrences?: number;
  };
}

// Amount Calculation
export interface AmountCalculation {
  type: 'fixed' | 'formula' | 'percentage';
  value: number | string; // number for fixed/percentage, formula string for formula
  baseAccount?: string;
  description?: string;
}

// Recurring Transaction Line
export interface RecurringTransactionLine {
  id?: string;
  recurringTransactionId?: string;
  accountId: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  lineNumber: number;
  taxRate?: number;
  taxAmount?: number;
}

// Recurring Transaction
export interface RecurringTransaction {
  id: string;
  organizationId: string;
  templateName: string;
  description: string;
  schedule: RecurringSchedule;
  nextExecutionDate: string;
  lastExecutionDate?: string;
  totalExecutions: number;
  maxExecutions?: number;
  status: RecurringStatus;
  amountCalculation: AmountCalculation;
  autoApprove: boolean;
  referenceTemplate?: string;
  lines: RecurringTransactionLine[];
  createdAt: string;
  updatedAt: string;
}

// Recurring Execution
export interface RecurringExecution {
  id: string;
  recurringTransactionId: string;
  executionDate: string;
  journalEntryId?: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  amount: number;
  createdAt: string;
}

// Recurring Template
export interface RecurringTemplate {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  lines: RecurringTransactionLine[];
  schedule: RecurringSchedule;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export type NotificationType = 
  | 'invoice_reminder' 
  | 'bill_reminder' 
  | 'payment_received' 
  | 'payment_due' 
  | 'overdue_notice' 
  | 'reconciliation_complete' 
  | 'tax_due' 
  | 'report_ready' 
  | 'workflow_approval' 
  | 'system_alert';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'unsubscribed';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type EmailTemplateType = 'html' | 'text' | 'markdown';

// Email Template
export interface EmailTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  variables: string[]; // Available template variables
  isActive: boolean;
  notificationType: NotificationType;
  createdAt: string;
  updatedAt: string;
}

// Email Notification
export interface EmailNotification {
  id: string;
  organizationId: string;
  templateId: string;
  template?: EmailTemplate;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Notification Schedule
export interface NotificationSchedule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  notificationType: NotificationType;
  templateId: string;
  scheduleType: 'immediate' | 'scheduled' | 'recurring';
  scheduleConfig: {
    sendTime?: string; // HH:mm format
    timezone?: string;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    daysOfMonth?: number[]; // 1-31
    monthsOfYear?: number[]; // 1-12
    startDate?: string;
    endDate?: string;
    interval?: number; // for recurring notifications
  };
  conditions: NotificationCondition[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification Condition
export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

// Notification Recipient
export interface NotificationRecipient {
  id: string;
  organizationId: string;
  email: string;
  name?: string;
  notificationTypes: NotificationType[];
  isActive: boolean;
  unsubscribeToken: string;
  preferences: {
    emailFrequency: 'immediate' | 'daily' | 'weekly';
    timezone: string;
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Notification Delivery
export interface NotificationDelivery {
  id: string;
  notificationId: string;
  attemptNumber: number;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  smtpResponse?: string;
  createdAt: string;
}

// Notification Statistics
export interface NotificationStatistics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalBounced: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  bounceRate: number;
  byType: Record<NotificationType, {
    sent: number;
    delivered: number;
    failed: number;
    rate: number;
  }>;
  byDate: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

// Email Provider
export interface EmailProvider {
  id: string;
  organizationId: string;
  name: string;
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'custom';
  config: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    apiKey?: string;
    domain?: string;
    region?: string;
    secure?: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
  dailyLimit?: number;
  monthlyLimit?: number;
  createdAt: string;
  updatedAt: string;
}

// Notification Queue
export interface NotificationQueue {
  id: string;
  notificationId: string;
  priority: NotificationPriority;
  scheduledFor: string;
  retryCount: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// Malaysian Tax Types
export enum MalaysianTaxType {
  SST = "SST",
  GST = "GST", 
  VAT = "VAT",
  WHT = "WHT",
  CP204 = "CP204",
  MTD = "MTD",
  SST_EXEMPT = "SST_EXEMPT",
  SST_ZERO_RATED = "SST_ZERO_RATED"
}

// Malaysian Tax Rates (2024)
export const MALAYSIAN_TAX_RATES = {
  SST: 0.10, // 10% Sales and Service Tax
  CP204: 0.24, // 24% Corporate Tax
  MTD: {
    range1: { min: 0, max: 5000, rate: 0 },
    range2: { min: 5001, max: 20000, rate: 0.01 },
    range3: { min: 20001, max: 35000, rate: 0.03 },
    range4: { min: 35001, max: 50000, rate: 0.08 },
    range5: { min: 50001, max: 70000, rate: 0.14 },
    range6: { min: 70001, max: 100000, rate: 0.21 },
    range7: { min: 100001, max: 400000, rate: 0.24 },
    range8: { min: 400001, max: 600000, rate: 0.245 },
    range9: { min: 600001, max: 2000000, rate: 0.25 },
    range10: { min: 2000001, max: Infinity, rate: 0.26 }
  }
};

// Tax Calculation Interfaces
export interface TaxCalculation {
  id: string;
  organization_id: string;
  tax_type: MalaysianTaxType;
  amount: number;
  calculated_tax: number;
  rate: number;
  period: string;
  created_at: string;
}

export interface SSTTransaction {
  id: string;
  invoice_number: string;
  customer_name: string;
  taxable_amount: number;
  sst_amount: number;
  total_amount: number;
  transaction_date: string;
  sst_registration_number: string;
  is_output_tax: boolean;
  organization_id: string;
}

export interface SSTReturn {
  period: string;
  organization_id: string;
  output_tax: number;
  input_tax: number;
  net_tax_payable: number;
  due_date: string;
  is_submitted: boolean;
  submitted_at: string | null;
}

export interface MTDCalculation {
  employee_id: string;
  employee_name: string;
  monthly_income: number;
  cumulative_income: number;
  tax_rate: number;
  mtd_amount: number;
  cumulative_mtd: number;
  month: string;
  organization_id: string;
}

export interface CP204Schedule {
  id: string;
  organization_id: string;
  year: number;
  estimated_tax: number;
  monthly_installment: number;
  payment_schedule: CP204Payment[];
  created_at: string;
}

export interface CP204Payment {
  month: number;
  due_date: string;
  amount: number;
  is_paid: boolean;
  payment_date?: string;
}

export interface TaxProvision {
  id: string;
  organization_id: string;
  period: string;
  current_tax: number;
  deferred_tax_asset: number;
  deferred_tax_liability: number;
  total_tax_expense: number;
  mfrs_112_compliance: boolean;
  created_at: string;
}

export interface DeferredTaxCalculation {
  temporary_differences: TemporaryDifference[];
  tax_base: number;
  carrying_amount: number;
  deferred_tax_asset: number;
  deferred_tax_liability: number;
}

export interface TemporaryDifference {
  account_id: string;
  account_name: string;
  carrying_amount: number;
  tax_base: number;
  temporary_difference: number;
  tax_rate: number;
  deferred_tax: number;
  type: 'asset' | 'liability';
}

export interface TaxValidationError {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  account_id: string | null;
  transaction_id: string | null;
}

export interface TaxReport {
  id: string;
  organization_id: string;
  period: string;
  report_type: 'SST' | 'MTD' | 'CP204' | 'MFRS112' | 'COMPREHENSIVE';
  generated_at: string;
  data: any;
  compliance_status: 'compliant' | 'non_compliant';
  validation_errors: TaxValidationError[];
}

// KPMG Doorkeeper Types
export interface DoorkeeperValidation {
  id: string;
  transaction_id: string;
  validation_type: DoorkeeperValidationType;
  kpmg_standard: KPMGStandard;
  validation_status: ValidationStatus;
  risk_level: RiskLevel;
  compliance_score: number;
  audit_notes: string[];
  recommendations: string[];
  kpmg_reference: string;
  validated_at: string;
  validated_by: string;
  created_at: string;
}

export enum DoorkeeperValidationType {
  TRANSACTION_ENTRY = 'transaction_entry',
  JOURNAL_POSTING = 'journal_posting',
  ACCOUNT_RECONCILIATION = 'account_reconciliation',
  FINANCIAL_STATEMENT = 'financial_statement',
  TAX_CALCULATION = 'tax_calculation',
  REVENUE_RECOGNITION = 'revenue_recognition',
  EXPENSE_ALLOCATION = 'expense_allocation',
  INTERCOMPANY_TRANSACTION = 'intercompany_transaction',
  RELATED_PARTY_TRANSACTION = 'related_party_transaction',
  ASSET_VALUATION = 'asset_valuation',
  LIABILITY_MEASUREMENT = 'liability_measurement',
  DISCLOSURE_REQUIREMENT = 'disclosure_requirement'
}

export enum KPMGStandard {
  AUDIT_QUALITY = 'audit_quality',
  FINANCIAL_REPORTING = 'financial_reporting',
  INTERNAL_CONTROLS = 'internal_controls',
  RISK_MANAGEMENT = 'risk_management',
  COMPLIANCE_FRAMEWORK = 'compliance_framework',
  GOVERNANCE = 'governance',
  ETHICS = 'ethics',
  SUSTAINABILITY = 'sustainability'
}

export enum ValidationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  WARNING = 'warning',
  REQUIRES_REVIEW = 'requires_review',
  PENDING = 'pending'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface KPMGAuditChecklist {
  id: string;
  checklist_name: string;
  kpmg_standard: KPMGStandard;
  checklist_items: AuditChecklistItem[];
  risk_weighting: number;
  is_mandatory: boolean;
  created_at: string;
}

export interface AuditChecklistItem {
  id: string;
  item_code: string;
  description: string;
  kpmg_requirement: string;
  validation_logic: string;
  risk_level: RiskLevel;
  is_critical: boolean;
  evidence_required: string[];
  sample_size_requirement?: number;
}

export interface DoorkeeperReport {
  id: string;
  organization_id: string;
  report_period: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  overall_compliance_score: number;
  risk_assessment: RiskAssessment;
  audit_readiness_score: number;
  kpmg_standards_coverage: KPMGStandardCoverage[];
  critical_issues: CriticalIssue[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}

export interface RiskAssessment {
  overall_risk_level: RiskLevel;
  risk_factors: RiskFactor[];
  risk_score: number;
  risk_trend: 'improving' | 'stable' | 'deteriorating';
}

export interface RiskFactor {
  factor_name: string;
  risk_level: RiskLevel;
  impact_score: number;
  likelihood_score: number;
  mitigation_actions: string[];
}

export interface KPMGStandardCoverage {
  standard: KPMGStandard;
  coverage_percentage: number;
  compliance_score: number;
  validation_count: number;
  issues_count: number;
}

export interface CriticalIssue {
  id: string;
  issue_type: string;
  description: string;
  risk_level: RiskLevel;
  affected_areas: string[];
  kpmg_impact: string;
  recommended_actions: string[];
  deadline: string;
  assigned_to: string;
}

export interface DoorkeeperSettings {
  organization_id: string;
  auto_validation_enabled: boolean;
  critical_issue_alerts: boolean;
  kpmg_standards_enabled: KPMGStandard[];
  risk_thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  notification_settings: {
    email_alerts: boolean;
    dashboard_alerts: boolean;
    sms_alerts: boolean;
  };
  audit_trail_retention_days: number;
}

// Metadata Registry Types
export enum DataType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  SHORT_DATE = 'short_date',
  LONG_DATE = 'long_date',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DROPDOWN = 'dropdown',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  JSON = 'json',
  ARRAY = 'array',
  FILE = 'file',
  IMAGE = 'image'
}

export enum MetadataStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

export enum Domain {
  ACCOUNTING = 'accounting',
  FINANCE = 'finance',
  TAX = 'tax',
  COMPLIANCE = 'compliance',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  EMPLOYEE = 'employee',
  INVENTORY = 'inventory',
  PROJECT = 'project',
  REPORTING = 'reporting',
  AUDIT = 'audit',
  GENERAL = 'general'
}

export enum SecurityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export interface MetadataField {
  id: string;
  field_name: string;
  data_type: DataType;
  description: string;
  domain: Domain;
  is_custom: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  match_confidence: number;
  status: MetadataStatus;
  security_level: SecurityLevel;
  is_pii: boolean;
  is_sensitive: boolean;
  is_financial: boolean;
  validation_rules?: string;
  default_value?: string;
  allowed_values?: string[];
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  usage_count: number;
  last_used_at?: string;
  version: number;
  tags: string[];
  synonyms: string[];
  business_owner: string;
  technical_owner: string;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface LocalMetadataField {
  id: string;
  field_name: string;
  data_type: DataType;
  description: string;
  mapped_to?: string;
  is_mapped: boolean;
  created_by: string;
  created_at: string;
  organization_id: string;
  table_name: string;
  column_name: string;
  usage_count: number;
  last_used_at?: string;
  confidence_score?: number;
  suggested_mappings: string[];
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface MetadataSuggestion {
  field: MetadataField;
  confidence: number;
  match_type: 'exact' | 'fuzzy' | 'semantic' | 'synonym';
  reasoning: string;
  usage_stats: {
    total_usage: number;
    recent_usage: number;
    organizations_using: number;
  };
}

export interface MetadataUsage {
  id: string;
  field_id: string;
  organization_id: string;
  table_name: string;
  column_name: string;
  usage_count: number;
  last_used_at: string;
  created_at: string;
}

export interface MetadataChangeLog {
  id: string;
  field_id: string;
  change_type: 'created' | 'updated' | 'deprecated' | 'mapped' | 'approved';
  old_value?: any;
  new_value?: any;
  changed_by: string;
  changed_at: string;
  reason?: string;
  impact_assessment?: string;
}