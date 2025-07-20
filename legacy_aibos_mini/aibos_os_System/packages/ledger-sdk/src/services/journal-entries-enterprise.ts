import { UserContext, PerformanceMetrics, AuditAction, ApprovalStatus, AccountingError } from '@aibos/core-types';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { EventEmitter } from 'events';

// ===== ENTERPRISE TYPE DEFINITIONS =====

export interface JournalEntry {
  id: string;
  organizationId: string;
  entry_number: string;
  entry_date: string;
  posting_date: string;
  period_id: string;
  fiscal_year_id: string;
  reference: string;
  description: string;
  entry_type: JournalEntryType;
  source_type: JournalSourceType;
  source_id?: string;
  currency: string;
  exchange_rate: number;
  base_currency_amount: number;
  status: JournalEntryStatus;
  approvalStatus: typeof ApprovalStatus;
  approval_workflow_id?: string;
  batch_id?: string;
  recurring_entry_id?: string;
  reversal_entry_id?: string;
  reversed_entry_id?: string;
  reversal_date?: string;
  reversal_reason?: string;
  posting_sequence: number;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  is_adjusting: boolean;
  is_closing: boolean;
  is_reversal: boolean;
  is_reclassification: boolean;
  tags: string[];
  custom_fields: Record<string, any>;
  attachments: JournalAttachment[];
  approvals: JournalApproval[];
  lines: JournalEntryLine[];
  audit_trail: JournalAuditTrail[];
  created_by: string;
  updated_by?: string;
  posted_by?: string;
  approved_by?: string;
  createdAt: string;
  updatedAt: string;
  posted_at?: string;
  approved_at?: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  line_number: number;
  account_id: string;
  account_code: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  currency: string;
  exchange_rate: number;
  base_currency_debit: number;
  base_currency_credit: number;
  quantity?: number;
  unit_price?: number;
  unit_of_measure?: string;
  project_id?: string;
  department_id?: string;
  cost_center_id?: string;
  location_id?: string;
  job_id?: string;
  customer_id?: string;
  supplierId?: string;
  employee_id?: string;
  asset_id?: string;
  inventory_item_id?: string;
  tax_code_id?: string;
  tax_amount: number;
  reference?: string;
  memo?: string;
  recurring_allocation_id?: string;
  budget_id?: string;
  budget_line_id?: string;
  variance_analysis?: VarianceAnalysis;
  custom_fields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface JournalApproval {
  id: string;
  journal_entry_id: string;
  approval_step: number;
  approver_id: string;
  approver_name: string;
  approvalStatus: typeof ApprovalStatus;
  approval_date?: string;
  comments?: string;
  approval_method: ApprovalMethod;
  delegation_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalAttachment {
  id: string;
  journal_entry_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface JournalAuditTrail {
  id: string;
  journal_entry_id: string;
  action: typeof AuditAction;
  userId: string;
  user_name: string;
  timestamp: string;
  changes: any[];
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

export interface VarianceAnalysis {
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  variance_type: 'favorable' | 'unfavorable';
  explanation?: string;
}

export interface JournalBatch {
  id: string;
  organizationId: string;
  batch_number: string;
  batch_date: string;
  description: string;
  source_type: JournalSourceType;
  total_entries: number;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  status: BatchStatus;
  created_by: string;
  posted_by?: string;
  createdAt: string;
  posted_at?: string;
}

export interface RecurringJournalEntry {
  id: string;
  organizationId: string;
  template_name: string;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  next_execution_date: string;
  last_execution_date?: string;
  execution_count: number;
  max_executions?: number;
  is_active: boolean;
  template_lines: RecurringJournalLine[];
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringJournalLine {
  id: string;
  recurring_entry_id: string;
  line_number: number;
  account_id: string;
  description: string;
  debit_amount_formula?: string;
  credit_amount_formula?: string;
  fixed_debit_amount?: number;
  fixed_credit_amount?: number;
  allocation_method?: AllocationMethod;
  allocation_basis?: string;
  custom_fields: Record<string, any>;
}

export interface JournalTemplate {
  id: string;
  organizationId: string;
  template_name: string;
  description: string;
  entry_type: JournalEntryType;
  is_active: boolean;
  template_lines: JournalTemplateLine[];
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalTemplateLine {
  id: string;
  template_id: string;
  line_number: number;
  account_id: string;
  description: string;
  debit_amount?: number;
  credit_amount?: number;
  is_formula: boolean;
  formula?: string;
  custom_fields: Record<string, any>;
}

// ===== ENUMS =====

export enum JournalEntryStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  POSTED = 'posted',
  REVERSED = 'reversed',
  CANCELLED = 'cancelled'
}

export enum JournalEntryType {
  GENERAL = 'general',
  ADJUSTING = 'adjusting',
  CLOSING = 'closing',
  REVERSING = 'reversing',
  RECLASSIFICATION = 'reclassification',
  ACCRUAL = 'accrual',
  DEFERRAL = 'deferral',
  DEPRECIATION = 'depreciation',
  AMORTIZATION = 'amortization',
  IMPAIRMENT = 'impairment',
  REVALUATION = 'revaluation',
  ALLOCATION = 'allocation',
  CONSOLIDATION = 'consolidation',
  ELIMINATION = 'elimination',
  FOREIGN_EXCHANGE = 'foreign_exchange',
  TAX_PROVISION = 'tax_provision',
  PAYROLL = 'payroll',
  INTERCOMPANY = 'intercompany'
}

export enum JournalSourceType {
  MANUAL = 'manual',
  SYSTEM = 'system',
  INVOICE = 'invoice',
  BILL = 'bill',
  PAYMENT = 'payment',
  PAYROLL = 'payroll',
  BANK_RECONCILIATION = 'bank_reconciliation',
  DEPRECIATION = 'depreciation',
  ACCRUAL = 'accrual',
  ALLOCATION = 'allocation',
  RECURRING = 'recurring',
  IMPORT = 'import',
  API = 'api',
  BATCH = 'batch',
  TEMPLATE = 'template',
  WORKFLOW = 'workflow'
}

export enum ApprovalMethod {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CONDITIONAL = 'conditional',
  DELEGATED = 'delegated'
}

export enum BatchStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  POSTED = 'posted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

export enum AllocationMethod {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount',
  DRIVER_BASED = 'driver_based',
  FORMULA = 'formula'
}

// ===== VALIDATION SCHEMAS =====

const JournalEntrySchema = z.object({
  entry_number: z.string().min(1, 'Entry number is required'),
  entry_date: z.string().min(1, 'Entry date is required'),
  posting_date: z.string().min(1, 'Posting date is required'),
  period_id: z.string().min(1, 'Period ID is required'),
  fiscal_year_id: z.string().min(1, 'Fiscal year ID is required'),
  reference: z.string().min(1, 'Reference is required'),
  description: z.string().min(1, 'Description is required'),
  entry_type: z.nativeEnum(JournalEntryType),
  source_type: z.nativeEnum(JournalSourceType),
  currency: z.string().min(3, 'Currency code is required'),
  exchange_rate: z.number().min(0, 'Exchange rate must be positive'),
  lines: z.array(z.object({
    account_id: z.string().min(1, 'Account ID is required'),
    description: z.string().min(1, 'Line description is required'),
    debit_amount: z.number().min(0, 'Debit amount must be non-negative'),
    credit_amount: z.number().min(0, 'Credit amount must be non-negative')
  })).min(2, 'At least two lines are required')
});

const JournalBatchSchema = z.object({
  batch_number: z.string().min(1, 'Batch number is required'),
  batch_date: z.string().min(1, 'Batch date is required'),
  description: z.string().min(1, 'Description is required'),
  source_type: z.nativeEnum(JournalSourceType),
  entries: z.array(JournalEntrySchema).min(1, 'At least one entry is required')
});

const RecurringJournalSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  description: z.string().min(1, 'Description is required'),
  frequency: z.nativeEnum(RecurringFrequency),
  start_date: z.string().min(1, 'Start date is required'),
  template_lines: z.array(z.object({
    account_id: z.string().min(1, 'Account ID is required'),
    description: z.string().min(1, 'Line description is required')
  })).min(2, 'At least two template lines are required')
});

// ===== PERFORMANCE MONITORING =====

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000;

  startOperation(operationName: string): number {
    return performance.now();
  }

  endOperation(
    operationName: string,
    startTime: number,
    success: boolean,
    errorMessage?: string,
    recordCount?: number
  ): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      operation_name: operationName,
      start_time: startTime,
      end_time: endTime,
      duration,
      success,
      error_message: errorMessage,
      record_count: recordCount,
      memory_usage: this.getMemoryUsage()
    });

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.metrics.length;
  }

  getThroughput(): number {
    if (this.metrics.length === 0) return 0;
    const now = performance.now();
    const oneMinuteAgo = now - 60000; // 1 minute in milliseconds
    const recentMetrics = this.metrics.filter(m => m.end_time > oneMinuteAgo);
    return recentMetrics.length;
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    const errors = this.metrics.filter(m => !m.success).length;
    return (errors / this.metrics.length) * 100;
  }
}

// ===== INTELLIGENT CACHING =====

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class IntelligentCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheSize = 1000;
  private hitCount = 0;
  private missCount = 0;

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = now;
    this.hitCount++;
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats(): any {
    const totalRequests = this.hitCount + this.missCount;
    return {
      cache_size: this.cache.size,
      hit_count: this.hitCount,
      miss_count: this.missCount,
      hit_rate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      memory_usage: this.cache.size * 1024 // Rough estimate
    };
  }
}

// ===== USER CONTEXT & PERMISSIONS =====

export interface JournalPermissions {
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_post: boolean;
  can_reverse: boolean;
  can_approve: boolean;
  can_view_all: boolean;
  can_export: boolean;
  max_amount_limit?: number;
  restricted_accounts: string[];
  restricted_departments: string[];
  restricted_cost_centers: string[];
}

// ===== SEARCH & FILTER INTERFACES =====

export interface JournalEntryFilter {
  status?: JournalEntryStatus[];
  entry_type?: JournalEntryType[];
  source_type?: JournalSourceType[];
  date_from?: string;
  date_to?: string;
  posting_date_from?: string;
  posting_date_to?: string;
  period_id?: string;
  fiscal_year_id?: string;
  account_ids?: string[];
  department_ids?: string[];
  cost_center_ids?: string[];
  project_ids?: string[];
  customer_ids?: string[];
  supplierIds?: string[];
  amount_from?: number;
  amount_to?: number;
  currency?: string;
  tags?: string[];
  search?: string;
  created_by?: string;
  posted_by?: string;
  approved_by?: string;
  batch_id?: string;
  has_attachments?: boolean;
  is_adjusting?: boolean;
  is_closing?: boolean;
  is_reversal?: boolean;
  custom_fields?: Record<string, any>;
}

export interface JournalEntrySummary {
  total_entries: number;
  total_debits: number;
  total_credits: number;
  balance_difference: number;
  by_status: Record<JournalEntryStatus, { count: number; amount: number }>;
  by_type: Record<JournalEntryType, { count: number; amount: number }>;
  by_source: Record<JournalSourceType, { count: number; amount: number }>;
  by_currency: Record<string, { count: number; amount: number }>;
  by_period: Record<string, { count: number; amount: number }>;
  top_accounts: Array<{
    account_id: string;
    account_code: string;
    account_name: string;
    debit_amount: number;
    credit_amount: number;
    net_amount: number;
  }>;
  variance_analysis: {
    total_variance: number;
    favorable_variance: number;
    unfavorable_variance: number;
    variance_percentage: number;
  };
}

export interface JournalAnalytics {
  period_comparison: {
    current_period: {
      total_entries: number;
      totalAmount: number;
      avg_entry_amount: number;
    };
    previous_period: {
      total_entries: number;
      totalAmount: number;
      avg_entry_amount: number;
    };
    growth_rate: number;
    variance_analysis: VarianceAnalysis;
  };
  trend_analysis: {
    monthly_trends: Array<{
      month: string;
      entry_count: number;
      totalAmount: number;
      avg_amount: number;
    }>;
    seasonal_patterns: any;
    anomaly_detection: Array<{
      date: string;
      entry_id: string;
      anomaly_type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  performance_metrics: {
    posting_frequency: Record<string, number>;
    approval_turnaround: {
      avg_hours: number;
      min_hours: number;
      max_hours: number;
    };
    error_rates: {
      validation_errors: number;
      posting_errors: number;
      reversal_rate: number;
    };
    user_productivity: Array<{
      userId: string;
      user_name: string;
      entries_created: number;
      entries_posted: number;
      avg_processing_time: number;
    }>;
  };
  compliance_metrics: {
    segregation_of_duties: {
      violations: number;
      percentage: number;
    };
    approval_compliance: {
      compliant_entries: number;
      non_compliant_entries: number;
      compliance_rate: number;
    };
    audit_trail_completeness: {
      complete_trails: number;
      incomplete_trails: number;
      completeness_rate: number;
    };
  };
}

// ===== RESPONSE INTERFACES =====

export interface JournalEntryResponse {
  success: boolean;
  entry?: JournalEntry;
  errors: AccountingError[];
  warnings: AccountingError[];
  performance_metrics?: PerformanceMetrics;
}

export interface JournalBatchResponse {
  success: boolean;
  batch?: JournalBatch;
  processed_entries: number;
  failed_entries: number;
  errors: AccountingError[];
  warnings: AccountingError[];
  performance_metrics?: PerformanceMetrics;
}

export interface JournalListResponse {
  entries: JournalEntry[];
  total: number;
  page: number;
  limit: number;
  summary: JournalEntrySummary;
  performance_metrics?: PerformanceMetrics;
}

// ===== PART 1 COMPLETE =====
// This completes Part 1: Core Types & Infrastructure
// Next: Part 2 - Main Service Class & Core Methods
