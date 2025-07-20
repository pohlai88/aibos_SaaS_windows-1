// Expense Management Types - Enterprise Grade Type Definitions
// Following isolation standards with comprehensive type safety

// Core Expense Types
export interface ExpenseClaim {
  id: string;
  employee_id: string;
  claim_number: string;
  claim_date: string;
  submission_date: string;
  
  // Basic information
  title: string;
  description?: string;
  total_amount: number;
  currency: string;
  exchange_rate?: number;
  local_amount?: number;
  
  // Status and workflow
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Approval workflow
  submitted_by: string;
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  
  // Payment information
  payment_method?: 'bank_transfer' | 'cash' | 'check' | 'credit_card';
  payment_reference?: string;
  payment_date?: string;
  payment_amount?: number;
  
  // Policy and compliance
  policy_id?: string;
  policy_compliant: boolean;
  compliance_notes?: string;
  
  // Budget and cost center
  cost_center_id?: string;
  project_id?: string;
  budget_code?: string;
  budget_available?: number;
  budget_exceeded?: boolean;
  
  // Metadata
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface ExpenseItem {
  id: string;
  expense_claim_id: string;
  category_id: string;
  
  // Item details
  description: string;
  amount: number;
  currency: string;
  quantity: number;
  unit_price: number;
  
  // Date and location
  expense_date: string;
  location?: string;
  vendor?: string;
  
  // Receipt information
  receipt_id?: string;
  receipt_number?: string;
  receipt_date?: string;
  
  // Tax information
  tax_amount: number;
  tax_rate: number;
  tax_code?: string;
  
  // Policy compliance
  policy_compliant: boolean;
  policy_violations?: string[];
  
  // Approval
  approved_amount?: number;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string;
  
  // Classification
  parent_category_id?: string;
  level: number;
  is_active: boolean;
  
  // Limits and policies
  monthly_limit?: number;
  annual_limit?: number;
  requires_approval: boolean;
  approval_threshold?: number;
  
  // Tax and accounting
  tax_deductible: boolean;
  tax_rate: number;
  gl_account_id?: string;
  
  // Compliance
  requires_receipt: boolean;
  requires_justification: boolean;
  restricted_items?: string[];
  
  // Metadata
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface ExpensePolicy {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  
  // Policy scope
  applies_to: 'all_employees' | 'specific_roles' | 'specific_departments' | 'specific_employees';
  target_roles?: string[];
  target_departments?: string[];
  target_employees?: string[];
  
  // Limits and thresholds
  daily_limit?: number;
  monthly_limit?: number;
  annual_limit?: number;
  per_item_limit?: number;
  
  // Approval requirements
  requires_manager_approval: boolean;
  requires_finance_approval: boolean;
  requires_director_approval: boolean;
  approval_thresholds: {
    manager_threshold?: number;
    finance_threshold?: number;
    director_threshold?: number;
  };
  
  // Receipt requirements
  requires_receipt: boolean;
  receipt_threshold: number;
  requires_original_receipt: boolean;
  
  // Time limits
  submission_deadline_days: number;
  approval_deadline_days: number;
  payment_deadline_days: number;
  
  // Restrictions
  restricted_categories?: string[];
  restricted_vendors?: string[];
  restricted_locations?: string[];
  
  // Status
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface ExpenseReceipt {
  id: string;
  expense_item_id: string;
  employee_id: string;
  
  // File information
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  
  // OCR and extraction
  ocr_processed: boolean;
  ocr_text?: string;
  extracted_data?: {
    vendor_name?: string;
    amount?: number;
    date?: string;
    tax_amount?: number;
    items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;
  };
  
  // Validation
  is_valid: boolean;
  validation_errors?: string[];
  manually_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  
  // Metadata
  upload_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseApproval {
  id: string;
  expense_claim_id: string;
  approver_id: string;
  
  // Approval details
  approval_level: 'manager' | 'finance' | 'director' | 'executive';
  approval_type: 'approve' | 'reject' | 'request_changes';
  
  // Decision
  approved_amount?: number;
  approved_items?: string[];
  rejected_items?: string[];
  comments?: string;
  
  // Conditions and requirements
  conditions?: string[];
  additional_requirements?: string[];
  
  // Timestamps
  requested_at: string;
  responded_at?: string;
  deadline: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'requested_changes' | 'expired';
  
  created_at: string;
  updated_at: string;
}

export interface ExpenseReport {
  id: string;
  organization_id: string;
  report_name: string;
  report_type: 'employee' | 'department' | 'category' | 'vendor' | 'project' | 'custom';
  
  // Report parameters
  date_range: {
    start_date: string;
    end_date: string;
  };
  filters: {
    employees?: string[];
    departments?: string[];
    categories?: string[];
    vendors?: string[];
    projects?: string[];
    statuses?: string[];
    amount_range?: {
      min: number;
      max: number;
    };
  };
  
  // Report data
  summary: {
    total_claims: number;
    total_amount: number;
    approved_amount: number;
    rejected_amount: number;
    pending_amount: number;
    average_processing_time: number;
  };
  
  // Breakdowns
  by_category: Record<string, number>;
  by_department: Record<string, number>;
  by_employee: Record<string, number>;
  by_status: Record<string, number>;
  by_month: Record<string, number>;
  
  // Export information
  export_format: 'pdf' | 'excel' | 'csv' | 'json';
  export_path?: string;
  generated_at: string;
  generated_by: string;
  
  created_at: string;
  updated_at: string;
}

export interface ExpenseBudget {
  id: string;
  organization_id: string;
  budget_name: string;
  budget_type: 'department' | 'project' | 'category' | 'employee' | 'cost_center';
  
  // Budget scope
  target_id: string; // department_id, project_id, etc.
  target_name: string;
  
  // Budget amounts
  monthly_budget: number;
  quarterly_budget: number;
  annual_budget: number;
  currency: string;
  
  // Tracking
  spent_amount: number;
  committed_amount: number;
  available_amount: number;
  
  // Alerts and thresholds
  warning_threshold: number; // percentage
  critical_threshold: number; // percentage
  alerts_enabled: boolean;
  
  // Period
  start_date: string;
  end_date: string;
  is_active: boolean;
  
  // Approval
  requires_approval: boolean;
  approval_threshold: number;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface ExpenseReimbursement {
  id: string;
  expense_claim_id: string;
  employee_id: string;
  
  // Payment details
  payment_method: 'bank_transfer' | 'cash' | 'check' | 'credit_card';
  payment_amount: number;
  payment_currency: string;
  exchange_rate?: number;
  
  // Bank information
  bank_name?: string;
  bank_account_number?: string;
  bank_swift_code?: string;
  bank_routing_number?: string;
  
  // Processing
  processed_by: string;
  processed_at: string;
  payment_date: string;
  payment_reference: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  failure_reason?: string;
  
  // Tax implications
  taxable_amount: number;
  non_taxable_amount: number;
  tax_year: number;
  
  // Audit
  audit_trail: Array<{
    action: string;
    performed_by: string;
    performed_at: string;
    details?: string;
  }>;
  
  created_at: string;
  updated_at: string;
}

export interface ExpenseAnalytics {
  // Employee analytics
  employee_spending: {
    employee_id: string;
    employee_name: string;
    total_spent: number;
    average_per_claim: number;
    claim_count: number;
    approval_rate: number;
    average_processing_time: number;
  }[];
  
  // Category analytics
  category_spending: {
    category_id: string;
    category_name: string;
    total_spent: number;
    claim_count: number;
    average_amount: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  
  // Department analytics
  department_spending: {
    department_id: string;
    department_name: string;
    total_spent: number;
    employee_count: number;
    average_per_employee: number;
    budget_utilization: number;
  }[];
  
  // Time-based analytics
  monthly_trends: {
    month: string;
    total_spent: number;
    claim_count: number;
    average_amount: number;
  }[];
  
  // Policy compliance
  compliance_metrics: {
    total_claims: number;
    compliant_claims: number;
    non_compliant_claims: number;
    compliance_rate: number;
    common_violations: string[];
  };
  
  // Processing metrics
  processing_metrics: {
    average_approval_time: number;
    average_payment_time: number;
    approval_rate: number;
    rejection_rate: number;
    pending_claims: number;
  };
}

// Form Types
export interface ExpenseClaimFormData {
  title: string;
  description?: string;
  expense_date: string;
  currency: string;
  items: Array<{
    category_id: string;
    description: string;
    amount: number;
    quantity: number;
    unit_price: number;
    expense_date: string;
    location?: string;
    vendor?: string;
    receipt_file?: File;
  }>;
  notes?: string;
}

export interface ExpenseApprovalFormData {
  approval_type: 'approve' | 'reject' | 'request_changes';
  approved_amount?: number;
  approved_items?: string[];
  rejected_items?: string[];
  comments?: string;
  conditions?: string[];
  additional_requirements?: string[];
}

// Filter Types
export interface ExpenseFilters {
  employee_id?: string;
  department_id?: string;
  category_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  submitted_by?: string;
  approved_by?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface ExpenseClaimResponse {
  success: boolean;
  data?: ExpenseClaim;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ExpenseClaimsResponse {
  success: boolean;
  data?: ExpenseClaim[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
  timestamp: string;
}

// Notification Types
export interface ExpenseNotification {
  type: 'claim_submitted' | 'claim_approved' | 'claim_rejected' | 'payment_processed' | 'budget_exceeded' | 'policy_violation';
  expense_claim_id: string;
  employee_id: string;
  approver_id?: string;
  amount?: number;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
} 