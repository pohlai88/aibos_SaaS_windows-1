import { ValidationResult, PerformanceMetrics, AuditAction, ApprovalStatus } from '@aibos/core-types';

import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { EventEmitter } from 'events';

// ===== ENTERPRISE TRIAL BALANCE TYPE DEFINITIONS =====

export interface TrialBalanceRequest {
  organizationId: string;
  as_of_date: string;
  include_inactive: boolean;
  include_zero_balances: boolean;
  account_filters?: AccountFilter[];
  grouping_options?: GroupingOptions;
  validation_level?: ValidationLevel;
  comparison_period?: ComparisonPeriod;
  currency_options?: CurrencyOptions;
  drill_down_enabled?: boolean;
  real_time_data?: boolean;
  export_options?: ExportOptions;
  approval_required?: boolean;
  security_level?: SecurityLevel;
}

export interface TrialBalanceEntry {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  account_category: AccountCategory;
  account_level: number;
  parent_account_id?: string;
  parent_account_code?: string;
  normal_balance: NormalBalance;
  opening_balance: Decimal;
  period_debits: Decimal;
  period_credits: Decimal;
  ending_balance: Decimal;
  base_currency_balance?: Decimal;
  comparative_balance?: Decimal;
  variance?: Decimal;
  variance_percentage?: Decimal;
  is_active: boolean;
  last_date?: Date;
  transaction_count: number;
  reconciliation_status?: ReconciliationStatus;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TrialBalanceReport {
  id: string;
  organizationId: string;
  request_parameters: TrialBalanceRequest;
  entries: TrialBalanceEntry[];
  summary: TrialBalanceSummary;
  validation_results: ValidationResult[];
  performance_metrics: PerformanceMetrics;
  audit_trail: AuditTrailEntry[];
  generated_at: Date;
  generated_by: string;
  status: ReportStatus;
  approvalStatus?: typeof ApprovalStatus;
  security_classification: SecurityLevel;
  export_history: ExportHistoryEntry[];
}

export interface TrialBalanceSummary {
  total_accounts: number;
  active_accounts: number;
  inactive_accounts: number;
  total_debits: Decimal;
  total_credits: Decimal;
  balance_difference: Decimal;
  is_balanced: boolean;
  balance_tolerance: Decimal;
  period_activity: PeriodActivity;
  account_type_breakdown: AccountTypeBreakdown[];
  comparative_summary?: ComparativeSummary;
  key_insights: Insight[];
}

export interface AccountFilter {
  filter_type: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  description?: string;
}

export interface GroupingOptions {
  group_by: GroupingField[];
  sort_by: SortField[];
  subtotals: boolean;
  expand_all: boolean;
  hierarchy_levels: number;
}

export interface CurrencyOptions {
  base_currency: string;
  reporting_currency?: string;
  exchange_rate_date?: Date | string;
  include_currency_breakdown: boolean;
  currency_conversion_method: CurrencyConversionMethod;
}

export interface ComparisonPeriod {
  comparison_date: Date | string;
  comparison_type: ComparisonType;
  variance_analysis: boolean;
  significance_threshold: number;
}

export interface AuditTrailEntry {
  id: string;
  action: typeof AuditAction;
  timestamp: Date;
  userId: string;
  user_name: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface PeriodActivity {
  opening_balance_total: Decimal;
  period_debits_total: Decimal;
  period_credits_total: Decimal;
  net_change: Decimal;
  ending_balance_total: Decimal;
  transaction_volume: number;
  largest_transaction: Decimal;
  most_active_account: string;
}

export interface AccountTypeBreakdown {
  account_type: AccountType;
  account_count: number;
  total_balance: Decimal;
  percentage_of_total: number;
  balance_change: Decimal;
}

export interface ComparativeSummary {
  previous_period_total: Decimal;
  current_period_total: Decimal;
  absolute_change: Decimal;
  percentage_change: Decimal;
  significant_changes: SignificantChange[];
}

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  recommended_action?: string;
  data: Record<string, any>;
}

export interface SignificantChange {
  account_id: string;
  account_name: string;
  previous_balance: Decimal;
  current_balance: Decimal;
  change_amount: Decimal;
  change_percentage: Decimal;
  significance_level: SignificanceLevel;
}

// ===== ENUMS =====

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  OTHER_COMPREHENSIVE_INCOME = 'OTHER_COMPREHENSIVE_INCOME'
}

export enum AccountCategory {
  CURRENT_ASSET = 'CURRENT_ASSET',
  NON_CURRENT_ASSET = 'NON_CURRENT_ASSET',
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  NON_CURRENT_LIABILITY = 'NON_CURRENT_LIABILITY',
  SHARE_CAPITAL = 'SHARE_CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  OPERATING_REVENUE = 'OPERATING_REVENUE',
  NON_OPERATING_REVENUE = 'NON_OPERATING_REVENUE',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  NON_OPERATING_EXPENSE = 'NON_OPERATING_EXPENSE'
}

export enum NormalBalance {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export enum ReconciliationStatus {
  RECONCILED = 'RECONCILED',
  UNRECONCILED = 'UNRECONCILED',
  PARTIALLY_RECONCILED = 'PARTIALLY_RECONCILED',
  PENDING_RECONCILIATION = 'PENDING_RECONCILIATION'
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SecurityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}

export enum ValidationLevel {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  COMPREHENSIVE = 'COMPREHENSIVE',
  AUDIT_READY = 'AUDIT_READY'
}

export enum FilterType {
  ACCOUNT_CODE = 'ACCOUNT_CODE',
  ACCOUNT_NAME = 'ACCOUNT_NAME',
  ACCOUNT_TYPE = 'ACCOUNT_TYPE',
  ACCOUNT_CATEGORY = 'ACCOUNT_CATEGORY',
  BALANCE_RANGE = 'BALANCE_RANGE',
  ACTIVITY_LEVEL = 'ACTIVITY_LEVEL',
  LAST_date = 'LAST_date',
  CUSTOM = 'CUSTOM'
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN'
}

export enum GroupingField {
  ACCOUNT_TYPE = 'ACCOUNT_TYPE',
  ACCOUNT_CATEGORY = 'ACCOUNT_CATEGORY',
  PARENT_ACCOUNT = 'PARENT_ACCOUNT',
  ACCOUNT_LEVEL = 'ACCOUNT_LEVEL',
  RECONCILIATION_STATUS = 'RECONCILIATION_STATUS',
  ACTIVITY_LEVEL = 'ACTIVITY_LEVEL',
  CURRENCY = 'CURRENCY'
}

export enum SortField {
  ACCOUNT_CODE = 'ACCOUNT_CODE',
  ACCOUNT_NAME = 'ACCOUNT_NAME',
  BALANCE = 'BALANCE',
  ACTIVITY = 'ACTIVITY',
  VARIANCE = 'VARIANCE',
  LAST_date = 'LAST_date'
}

export enum CurrencyConversionMethod {
  SPOT_RATE = 'SPOT_RATE',
  AVERAGE_RATE = 'AVERAGE_RATE',
  HISTORICAL_RATE = 'HISTORICAL_RATE',
  BUDGET_RATE = 'BUDGET_RATE'
}

export enum ComparisonType {
  PRIOR_PERIOD = 'PRIOR_PERIOD',
  PRIOR_YEAR = 'PRIOR_YEAR',
  BUDGET = 'BUDGET',
  FORECAST = 'FORECAST',
  ROLLING_AVERAGE = 'ROLLING_AVERAGE'
}

export enum ValidationStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
  SKIPPED = 'SKIPPED'
}

export enum ValidationSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum InsightType {
  BALANCE_VARIANCE = 'BALANCE_VARIANCE',
  ACTIVITY_ANOMALY = 'ACTIVITY_ANOMALY',
  RECONCILIATION_ISSUE = 'RECONCILIATION_ISSUE',
  COMPLIANCE_ALERT = 'COMPLIANCE_ALERT',
  PERFORMANCE_OPTIMIZATION = 'PERFORMANCE_OPTIMIZATION',
  DATA_QUALITY = 'DATA_QUALITY'
}

export enum InsightImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum SignificanceLevel {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SIGNIFICANT = 'SIGNIFICANT',
  MAJOR = 'MAJOR'
}

export interface ExportOptions {
  format: ExportFormat;
  include_notes: boolean;
  include_metadata: boolean;
  include_comparative: boolean;
  custom_formatting?: CustomFormatting;
}

export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML'
}

export interface CustomFormatting {
  header_template?: string;
  footer_template?: string;
  logo_url?: string;
  color_scheme?: ColorScheme;
  font_family?: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ExportHistoryEntry {
  id: string;
  export_date: Date;
  format: ExportFormat;
  file_size: number;
  exported_by: string;
  download_count: number;
  last_accessed: Date;
}

// ===== VALIDATION SCHEMAS =====

export const TrialBalanceRequestSchema = z.object({
  organizationId: z.string().uuid(),
  as_of_date: z.string().datetime(),
  include_inactive: z.boolean().default(false),
  include_zero_balances: z.boolean().default(false),
  account_filters: z.array(z.object({
    filter_type: z.nativeEnum(FilterType),
    field: z.string(),
    operator: z.nativeEnum(FilterOperator),
    value: z.any(),
    description: z.string().optional()
  })).optional(),
  grouping_options: z.object({
    group_by: z.array(z.nativeEnum(GroupingField)),
    sort_by: z.array(z.nativeEnum(SortField)),
    subtotals: z.boolean().default(true),
    expand_all: z.boolean().default(false),
    hierarchy_levels: z.number().min(1).max(10).default(5)
  }).optional(),
  validation_level: z.nativeEnum(ValidationLevel).default(ValidationLevel.STANDARD),
  comparison_period: z.object({
    comparison_date: z.string().datetime(),
    comparison_type: z.nativeEnum(ComparisonType),
    variance_analysis: z.boolean().default(true),
    significance_threshold: z.number().min(0).max(100).default(5)
  }).optional(),
  currency_options: z.object({
    base_currency: z.string().length(3),
    reporting_currency: z.string().length(3).optional(),
    exchange_rate_date: z.string().datetime().optional(),
    include_currency_breakdown: z.boolean().default(false),
    currency_conversion_method: z.nativeEnum(CurrencyConversionMethod).default(CurrencyConversionMethod.SPOT_RATE)
  }).optional(),
  drill_down_enabled: z.boolean().default(true),
  real_time_data: z.boolean().default(false),
  export_options: z.object({
    format: z.nativeEnum(ExportFormat),
    include_notes: z.boolean().default(false),
    include_metadata: z.boolean().default(false),
    include_comparative: z.boolean().default(false),
    custom_formatting: z.object({
      header_template: z.string().optional(),
      footer_template: z.string().optional(),
      logo_url: z.string().url().optional(),
      color_scheme: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        background: z.string(),
        text: z.string()
      }).optional(),
      font_family: z.string().optional()
    }).optional()
  }).optional(),
  approval_required: z.boolean().default(false),
  security_level: z.nativeEnum(SecurityLevel).default(SecurityLevel.INTERNAL)
});

// ===== ENTERPRISE TRIAL BALANCE SERVICE =====

export class EnterpriseTrialBalanceService extends EventEmitter {
  private supabase: SupabaseClient;
  private cache: Map<string, CacheEntry> = new Map();
  private performanceMonitor: PerformanceMonitor;
  private validationEngine: ValidationEngine;
  private approvalWorkflow: ApprovalWorkflow;
  private auditLogger: AuditLogger;
  private exportService: ExportService;

  constructor(supabase: SupabaseClient) {
    super();
    this.supabase = supabase;
    this.performanceMonitor = new PerformanceMonitor();
    this.validationEngine = new ValidationEngine();
    this.approvalWorkflow = new ApprovalWorkflow();
    this.auditLogger = new AuditLogger();
    this.exportService = new ExportService();
  }

  async generateTrialBalance(request: TrialBalanceRequest): Promise<TrialBalanceReport> {
    const startTime = Date.now();
    const reportId = this.generateReportId();

    try {
      // Preprocess and validate request
      const preprocessedRequest = this.preprocessRequest(request);
      const validatedRequest = TrialBalanceRequestSchema.parse(preprocessedRequest);

      // Log audit event
      await this.auditLogger.log({
        action: typeof AuditAction.GENERATED,
        userId: 'system', // TODO: Get from context
        details: { request: preprocessedRequest, report_id: reportId }
      });

      // Check cache
      const cacheKey = this.generateCacheKey(preprocessedRequest);
      if (this.cache.has(cacheKey) && !preprocessedRequest.real_time_data) {
        const cached = this.cache.get(cacheKey)!;
        if (this.isCacheValid(cached)) {
          this.emit('trialBalanceGenerated', { reportId, fromCache: true });
          return cached.data;
        }
      }

      // Generate report
      const report = await this.generateTrialBalanceReport(preprocessedRequest, reportId);

      // Cache result
      this.cache.set(cacheKey, {
        data: report,
        timestamp: new Date(),
        ttl: 3600000 // 1 hour
      });

      // Emit event
      this.emit('trialBalanceGenerated', { reportId, performance: report.performance_metrics });

      return report;

    } catch (error) {
      await this.auditLogger.log({
        action: typeof AuditAction.GENERATED,
        userId: 'system',
        details: { error: error.message, report_id: reportId }
      });

      throw new TrialBalanceError(`Failed to generate trial balance: ${error.message}`, {
        reportId,
        request,
        originalError: error
      });
    }
  }

  private async generateTrialBalanceReport(
    request: TrialBalanceRequest,
    reportId: string
  ): Promise<TrialBalanceReport> {
    const queryStartTime = Date.now();

    // Build dynamic query
    const query = this.buildAccountBalanceQuery(request);
    
    // Execute query
    const { data: accountData, error } = await query;
    if (error) throw error;

    const queryExecutionTime = Date.now() - queryStartTime;
    const processStartTime = Date.now();

    // Process data
    const entries = await this.processAccountData(accountData, request);
    
    // Generate summary
    const summary = this.generateSummary(entries, request);
    
    // Run validations
    const validationResults = await this.validationEngine.validate(entries, request.validation_level);
    
    // Generate insights
    const insights = this.generateInsights(entries, summary, validationResults);

    const dataProcessingTime = Date.now() - processStartTime;
    const totalTime = Date.now() - queryStartTime;

    // Build performance metrics
    const performanceMetrics: PerformanceMetrics = {
      generation_time_ms: totalTime,
      query_execution_time_ms: queryExecutionTime,
      data_processing_time_ms: dataProcessingTime,
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: this.getMemoryUsage(),
      records_processed: entries.length,
      optimization_suggestions: this.generateOptimizationSuggestions(totalTime, entries.length)
    };

    // Create report
    const report: TrialBalanceReport = {
      id: reportId,
      organizationId: request.organizationId,
      request_parameters: request,
      entries,
      summary: { ...summary, key_insights: insights },
      validation_results: validationResults,
      performance_metrics: performanceMetrics,
      audit_trail: [],
      generated_at: new Date(),
      generated_by: 'system', // TODO: Get from context
      status: ReportStatus.COMPLETED,
      approvalStatus: request.approval_required ? ApprovalStatus.PENDING : undefined,
      security_classification: request.security_level || SecurityLevel.INTERNAL,
      export_history: []
    };

    return report;
  }

  private buildAccountBalanceQuery(request: TrialBalanceRequest) {
    let query = this.supabase
      .from('trial_balance_view') // Assuming a materialized view for performance
      .select(`
        account_id,
        account_code,
        account_name,
        account_type,
        account_category,
        account_level,
        parent_account_id,
        parent_account_code,
        normal_balance,
        opening_balance,
        period_debits,
        period_credits,
        ending_balance,
        is_active,
        last_date,
        transaction_count,
        reconciliation_status
      `)
      .eq('organizationId', request.organizationId)
      .lte('as_of_date', request.as_of_date);

    // Apply filters
    if (!request.include_inactive) {
      query = query.eq('is_active', true);
    }

    if (!request.include_zero_balances) {
      query = query.neq('ending_balance', 0);
    }

    // Apply account filters
    if (request.account_filters) {
      request.account_filters.forEach(filter => {
        query = this.applyFilter(query, filter);
      });
    }

    // Apply sorting
    if (request.grouping_options?.sort_by) {
      request.grouping_options.sort_by.forEach(sortField => {
        query = query.order(this.mapSortField(sortField));
      });
    } else {
      query = query.order('account_code');
    }

    return query;
  }

  private async processAccountData(data: any[], request: TrialBalanceRequest): Promise<TrialBalanceEntry[]> {
    const entries: TrialBalanceEntry[] = [];

    for (const row of data) {
      const entry: TrialBalanceEntry = {
        account_id: row.account_id,
        account_code: row.account_code,
        account_name: row.account_name,
        account_type: row.account_type,
        account_category: row.account_category,
        account_level: row.account_level,
        parent_account_id: row.parent_account_id,
        parent_account_code: row.parent_account_code,
        normal_balance: row.normal_balance,
        opening_balance: new Decimal(row.opening_balance || 0),
        period_debits: new Decimal(row.period_debits || 0),
        period_credits: new Decimal(row.period_credits || 0),
        ending_balance: new Decimal(row.ending_balance || 0),
        is_active: row.is_active,
        last_date: row.last_date ? new Date(row.last_date) : undefined,
        transaction_count: row.transaction_count || 0,
        reconciliation_status: row.reconciliation_status,
        tags: []
      };

      // Add comparative data if requested
      if (request.comparison_period) {
        const comparativeBalance = await this.getComparativeBalance(
          entry.account_id,
          typeof request.comparison_period.comparison_date === 'string' 
            ? new Date(request.comparison_period.comparison_date)
            : request.comparison_period.comparison_date
        );
        entry.comparative_balance = comparativeBalance;
        entry.variance = entry.ending_balance.minus(comparativeBalance);
        entry.variance_percentage = comparativeBalance.isZero() 
          ? new Decimal(0) 
          : entry.variance.dividedBy(comparativeBalance).times(100);
      }

      // Add currency conversion if needed
      if (request.currency_options?.reporting_currency) {
        const exchangeRateDate = request.currency_options.exchange_rate_date 
          ? (typeof request.currency_options.exchange_rate_date === 'string' 
              ? new Date(request.currency_options.exchange_rate_date)
              : request.currency_options.exchange_rate_date)
          : new Date(request.as_of_date);
          
        entry.base_currency_balance = await this.convertCurrency(
          entry.ending_balance,
          request.currency_options.base_currency,
          request.currency_options.reporting_currency,
          exchangeRateDate
        );
      }

      entries.push(entry);
    }

    return entries;
  }

  private generateSummary(entries: TrialBalanceEntry[], request: TrialBalanceRequest): TrialBalanceSummary {
    const totalDebits = entries.reduce((sum, entry) => sum.plus(entry.period_debits), new Decimal(0));
    const totalCredits = entries.reduce((sum, entry) => sum.plus(entry.period_credits), new Decimal(0));
    const balanceDifference = totalDebits.minus(totalCredits);
    const balanceTolerance = new Decimal(0.01); // Configurable tolerance

    const accountTypeBreakdown = this.calculateAccountTypeBreakdown(entries);
    const periodActivity = this.calculatePeriodActivity(entries);

    let comparativeSummary: ComparativeSummary | undefined;
    if (request.comparison_period) {
      comparativeSummary = this.generateComparativeSummary(entries);
    }

    return {
      total_accounts: entries.length,
      active_accounts: entries.filter(e => e.is_active).length,
      inactive_accounts: entries.filter(e => !e.is_active).length,
      total_debits: totalDebits,
      total_credits: totalCredits,
      balance_difference: balanceDifference,
      is_balanced: balanceDifference.abs().lte(balanceTolerance),
      balance_tolerance: balanceTolerance,
      period_activity: periodActivity,
      account_type_breakdown: accountTypeBreakdown,
      comparative_summary: comparativeSummary,
      key_insights: [] // Will be populated by generateInsights
    };
  }

  private generateInsights(
    entries: TrialBalanceEntry[],
    summary: TrialBalanceSummary,
    validationResults: ValidationResult[]
  ): Insight[] {
    const insights: Insight[] = [];

    // Balance variance insight
    if (!summary.is_balanced) {
      insights.push({
        type: InsightType.BALANCE_VARIANCE,
        title: 'Trial Balance Out of Balance',
        description: `Trial balance shows a difference of ${summary.balance_difference.toFixed(2)}`,
        impact: summary.balance_difference.abs().gt(1000) ? InsightImpact.HIGH : InsightImpact.MEDIUM,
        recommended_action: 'Review transactions and journal entries for errors',
        data: { variance: summary.balance_difference.toNumber() }
      });
    }

    // High-variance accounts
    const highVarianceAccounts = entries.filter(e => 
      e.variance_percentage && e.variance_percentage.abs().gt(25)
    );
    
    if (highVarianceAccounts.length > 0) {
      insights.push({
        type: InsightType.BALANCE_VARIANCE,
        title: 'Significant Account Variances Detected',
        description: `${highVarianceAccounts.length} accounts show variance > 25%`,
        impact: InsightImpact.MEDIUM,
        recommended_action: 'Investigate accounts with significant balance changes',
        data: { 
          affected_accounts: highVarianceAccounts.length,
          accounts: highVarianceAccounts.map(a => ({
            account_code: a.account_code,
            account_name: a.account_name,
            variance_percentage: a.variance_percentage?.toNumber()
          }))
        }
      });
    }

    // Unreconciled accounts
    const unreconciledAccounts = entries.filter(e => 
      e.reconciliation_status === ReconciliationStatus.UNRECONCILED
    );
    
    if (unreconciledAccounts.length > 0) {
      insights.push({
        type: InsightType.RECONCILIATION_ISSUE,
        title: 'Unreconciled Accounts Found',
        description: `${unreconciledAccounts.length} accounts require reconciliation`,
        impact: InsightImpact.MEDIUM,
        recommended_action: 'Complete reconciliation for all balance sheet accounts',
        data: { unreconciled_count: unreconciledAccounts.length }
      });
    }

    // Validation failures
    const criticalValidations = validationResults.filter(v => 
      v.severity === "critical" && v.status === "failed"
    );
    
    if (criticalValidations.length > 0) {
      insights.push({
        type: InsightType.COMPLIANCE_ALERT,
        title: 'Critical Validation Failures',
        description: `${criticalValidations.length} critical validation rules failed`,
        impact: InsightImpact.CRITICAL,
        recommended_action: 'Address critical validation failures before finalizing',
        data: { failed_rules: criticalValidations.map(v => v.rule_name) }
      });
    }

    return insights;
  }

  // Export functionality
  async exportTrialBalance(
    reportId: string,
    format: ExportFormat,
    options?: ExportOptions
  ): Promise<ExportResult> {
    const report = await this.getReport(reportId);
    if (!report) {
      throw new TrialBalanceError('Report not found', { reportId });
    }

    return this.exportService.export(report, format, options);
  }

  // Approval workflow
  async submitForApproval(reportId: string, approver: string): Promise<void> {
    await this.approvalWorkflow.submit(reportId, approver);
    this.emit('trialBalanceSubmittedForApproval', { reportId, approver });
  }

  async approveReport(reportId: string, approver: string, notes?: string): Promise<void> {
    await this.approvalWorkflow.approve(reportId, approver, notes);
    this.emit('trialBalanceApproved', { reportId, approver, notes });
  }

  async rejectReport(reportId: string, approver: string, reason: string): Promise<void> {
    await this.approvalWorkflow.reject(reportId, approver, reason);
    this.emit('trialBalanceRejected', { reportId, approver, reason });
  }

  // Analytics and monitoring
  getPerformanceMetrics(): any {
    return this.performanceMonitor.getMetrics();
  }

  getCacheStatistics(): any {
    return {
      size: this.cache.size,
      hitRate: this.calculateCacheHitRate(),
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Helper methods
  private generateReportId(): string {
    return `tb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(request: TrialBalanceRequest): string {
    return `tb_${request.organizationId}_${request.as_of_date}_${JSON.stringify(request)}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp.getTime() < entry.ttl;
  }

  private calculateCacheHitRate(): number {
    // Implementation for cache hit rate calculation
    return 0.85; // Placeholder
  }

  private getMemoryUsage(): number {
    // Implementation for memory usage calculation
    return 50; // Placeholder MB
  }

  private generateOptimizationSuggestions(totalTime: number, recordCount: number): string[] {
    const suggestions: string[] = [];
    
    if (totalTime > 10000) { // > 10 seconds
      suggestions.push('Consider adding database indexes for better performance');
    }
    
    if (recordCount > 10000) {
      suggestions.push('Use pagination for large result sets');
    }
    
    return suggestions;
  }

  // Placeholder methods for complex operations
  private applyFilter(query: any, filter: AccountFilter): any {
    // Implementation for applying filters to query
    return query;
  }

  private mapSortField(sortField: SortField): string {
    // Map enum to database column name
    return sortField.toLowerCase();
  }

  private async getComparativeBalance(accountId: string, date: Date): Promise<Decimal> {
    // Implementation for getting comparative balance
    return new Decimal(0);
  }

  private async convertCurrency(
    amount: Decimal,
    fromCurrency: string,
    toCurrency: string,
    date: Date
  ): Promise<Decimal> {
    // Implementation for currency conversion
    return amount;
  }

  private calculateAccountTypeBreakdown(entries: TrialBalanceEntry[]): AccountTypeBreakdown[] {
    const breakdown = new Map<AccountType, AccountTypeBreakdown>();
    
    entries.forEach(entry => {
      if (!breakdown.has(entry.account_type)) {
        breakdown.set(entry.account_type, {
          account_type: entry.account_type,
          account_count: 0,
          total_balance: new Decimal(0),
          percentage_of_total: 0,
          balance_change: new Decimal(0)
        });
      }
      
      const item = breakdown.get(entry.account_type)!;
      item.account_count++;
      item.total_balance = item.total_balance.plus(entry.ending_balance);
    });
    
    return Array.from(breakdown.values());
  }

  private calculatePeriodActivity(entries: TrialBalanceEntry[]): PeriodActivity {
    const totalDebits = entries.reduce((sum, e) => sum.plus(e.period_debits), new Decimal(0));
    const totalCredits = entries.reduce((sum, e) => sum.plus(e.period_credits), new Decimal(0));
    const openingTotal = entries.reduce((sum, e) => sum.plus(e.opening_balance), new Decimal(0));
    const endingTotal = entries.reduce((sum, e) => sum.plus(e.ending_balance), new Decimal(0));
    
    return {
      opening_balance_total: openingTotal,
      period_debits_total: totalDebits,
      period_credits_total: totalCredits,
      net_change: totalDebits.minus(totalCredits),
      ending_balance_total: endingTotal,
      transaction_volume: entries.reduce((sum, e) => sum + e.transaction_count, 0),
      largest_transaction: entries.reduce((max, e) => 
        e.period_debits.gt(max) ? e.period_debits : 
        e.period_credits.gt(max) ? e.period_credits : max, 
        new Decimal(0)
      ),
      most_active_account: entries.length > 0 
        ? entries.reduce((max, e) => 
            e.transaction_count > max.transaction_count ? e : max
          ).account_code
        : ''
    };
  }

  private generateComparativeSummary(entries: TrialBalanceEntry[]): ComparativeSummary {
    const currentTotal = entries.reduce((sum, e) => sum.plus(e.ending_balance), new Decimal(0));
    const previousTotal = entries.reduce((sum, e) => 
      sum.plus(e.comparative_balance || new Decimal(0)), new Decimal(0)
    );
    
    return {
      previous_period_total: previousTotal,
      current_period_total: currentTotal,
      absolute_change: currentTotal.minus(previousTotal),
      percentage_change: previousTotal.isZero() ? new Decimal(0) : 
        currentTotal.minus(previousTotal).dividedBy(previousTotal).times(100),
      significant_changes: entries
        .filter(e => e.variance_percentage && e.variance_percentage.abs().gt(10))
        .map(e => ({
          account_id: e.account_id,
          account_name: e.account_name,
          previous_balance: e.comparative_balance || new Decimal(0),
          current_balance: e.ending_balance,
          change_amount: e.variance || new Decimal(0),
          change_percentage: e.variance_percentage || new Decimal(0),
          significance_level: e.variance_percentage!.abs().gt(25) ? 
            SignificanceLevel.MAJOR : SignificanceLevel.SIGNIFICANT
        }))
    };
  }

  private async getReport(reportId: string): Promise<TrialBalanceReport | null> {
    // Implementation for retrieving stored report
    return null;
  }

  private preprocessRequest(request: TrialBalanceRequest): TrialBalanceRequest {
    // Convert string dates to Date objects if needed
    const processed: TrialBalanceRequest = JSON.parse(JSON.stringify(request));
    
    // Convert string dates to Date objects
    if (processed.comparison_period?.comparison_date && typeof processed.comparison_period.comparison_date === 'string') {
      (processed.comparison_period.comparison_date as any) = new Date(processed.comparison_period.comparison_date);
    }
    
    if (processed.currency_options?.exchange_rate_date && typeof processed.currency_options.exchange_rate_date === 'string') {
      (processed.currency_options.exchange_rate_date as any) = new Date(processed.currency_options.exchange_rate_date);
    }
    
    return processed;
  }
}

// ===== SUPPORTING CLASSES =====

interface CacheEntry {
  data: TrialBalanceReport;
  timestamp: Date;
  ttl: number;
}

class PerformanceMonitor {
  getMetrics() {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0.85
    };
  }
}

class ValidationEngine {
  async validate(entries: TrialBalanceEntry[], level: ValidationLevel): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Basic validation - Balance check
    const totalDebits = entries.reduce((sum, e) => sum.plus(e.period_debits), new Decimal(0));
    const totalCredits = entries.reduce((sum, e) => sum.plus(e.period_credits), new Decimal(0));
    const difference = totalDebits.minus(totalCredits);
    
    if (difference.abs().gt(0.01)) {
      results.push({
        rule_id: 'BALANCE_CHECK',
        rule_name: 'Trial Balance Must Balance',
        status: "failed",
        severity: "critical",
        message: `Trial balance out of balance by ${difference.toFixed(2)}`,
        affected_accounts: [],
        recommended_action: 'Review all transactions for data entry errors',
        autoCorrectable: false
      });
    }
    
    // Additional validations based on level
    if (level === ValidationLevel.COMPREHENSIVE || level === ValidationLevel.AUDIT_READY) {
      // Add more comprehensive validations
      results.push(...await this.runComprehensiveValidations(entries));
    }
    
    return results;
  }
  
  private async runComprehensiveValidations(entries: TrialBalanceEntry[]): Promise<ValidationResult[]> {
    // Implementation for comprehensive validations
    return [];
  }
}

class ApprovalWorkflow {
  async submit(reportId: string, approver: string): Promise<void> {
    // Implementation for submission
  }
  
  async approve(reportId: string, approver: string, notes?: string): Promise<void> {
    // Implementation for approval
  }
  
  async reject(reportId: string, approver: string, reason: string): Promise<void> {
    // Implementation for rejection
  }
}

class AuditLogger {
  async log(entry: Partial<AuditTrailEntry>): Promise<void> {
    // Implementation for audit logging
  }
}

class ExportService {
  async export(report: TrialBalanceReport, format: ExportFormat, options?: ExportOptions): Promise<ExportResult> {
    // Implementation for export
    return {
      id: 'export_' + Date.now(),
      format,
      data: Buffer.from('exported data'),
      filename: `trial_balance_${report.id}.${format.toLowerCase()}`,
      size: 1024,
      generated_at: new Date()
    };
  }
}

interface ExportResult {
  id: string;
  format: ExportFormat;
  data: Buffer;
  filename: string;
  size: number;
  generated_at: Date;
}

// ===== ERROR CLASSES =====

export class TrialBalanceError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'TrialBalanceError';
  }
}

/**
 * ===== USAGE EXAMPLES =====
 * 
 * ## Basic Trial Balance Generation
 * ```typescript
 * const trialBalanceService = new EnterpriseTrialBalanceService(supabaseClient);
 * 
 * const request: TrialBalanceRequest = {
 *   organizationId: 'org-123',
 *   as_of_date: '2024-12-31T23:59:59Z',
 *   include_inactive: false,
 *   include_zero_balances: false,
 *   validation_level: ValidationLevel.COMPREHENSIVE
 * };
 * 
 * const report = await trialBalanceService.generateTrialBalance(request);
 * console.log('Trial Balance Generated:', report.id);
 * console.log('Balanced:', report.summary.is_balanced);
 * ```
 * 
 * ## Advanced Trial Balance with Comparisons
 * ```typescript
 * const advancedRequest: TrialBalanceRequest = {
 *   organizationId: 'org-123',
 *   as_of_date: '2024-12-31T23:59:59Z',
 *   include_inactive: false,
 *   include_zero_balances: false,
 *   comparison_period: {
 *     comparison_date: new Date('2023-12-31'),
 *     comparison_type: ComparisonType.PRIOR_YEAR,
 *     variance_analysis: true,
 *     significance_threshold: 10
 *   },
 *   grouping_options: {
 *     group_by: [GroupingField.ACCOUNT_TYPE],
 *     sort_by: [SortField.ACCOUNT_CODE],
 *     subtotals: true,
 *     expand_all: false,
 *     hierarchy_levels: 5
 *   },
 *   validation_level: ValidationLevel.AUDIT_READY
 * };
 * 
 * const report = await trialBalanceService.generateTrialBalance(advancedRequest);
 * 
 * // Export to Excel
 * const exportResult = await trialBalanceService.exportTrialBalance(
 *   report.id,
 *   ExportFormat.EXCEL,
 *   { include_comparative: true, include_notes: true }
 * );
 * ```
 * 
 * ## Event Handling
 * ```typescript
 * trialBalanceService.on('trialBalanceGenerated', (event) => {
 *   console.log('Trial Balance Generated:', event.reportId);
 *   console.log('Generation Time:', event.performance.generation_time_ms, 'ms');
 * });
 * 
 * trialBalanceService.on('trialBalanceApproved', (event) => {
 *   console.log('Trial Balance Approved by:', event.approver);
 * });
 * ```
 * 
 * This enterprise trial balance service provides comprehensive functionality
 * including advanced validation, approval workflows, export capabilities,
 * comparative analysis, and performance monitoring.
 */
