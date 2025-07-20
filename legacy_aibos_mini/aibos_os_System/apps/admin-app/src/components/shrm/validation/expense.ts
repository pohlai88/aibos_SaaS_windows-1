// Expense Validation - Enterprise Grade Input Validation
// Using Zod for comprehensive type-safe validation

import { z } from 'zod';

// Base validation schemas
export const currencySchema = z.enum(['MYR', 'USD', 'SGD', 'EUR', 'GBP']);
export const statusSchema = z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid', 'cancelled']);
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const paymentMethodSchema = z.enum(['bank_transfer', 'cash', 'check', 'credit_card']);

// Expense Claim validation schema
export const expenseClaimSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  total_amount: z.number().positive('Total amount must be positive').max(1000000, 'Amount too high'),
  currency: currencySchema,
  exchange_rate: z.number().positive().optional(),
  local_amount: z.number().positive().optional(),
  
  // Status and workflow
  status: statusSchema.default('draft'),
  priority: prioritySchema.default('medium'),
  
  // Approval workflow
  submitted_by: z.string().uuid('Invalid submitter ID'),
  submitted_at: z.string().datetime('Invalid submission date'),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  rejected_by: z.string().uuid().optional(),
  rejected_at: z.string().datetime().optional(),
  rejection_reason: z.string().optional(),
  
  // Payment information
  payment_method: paymentMethodSchema.optional(),
  payment_reference: z.string().optional(),
  payment_date: z.string().datetime().optional(),
  payment_amount: z.number().positive().optional(),
  
  // Policy and compliance
  policy_id: z.string().uuid().optional(),
  policy_compliant: z.boolean().default(true),
  compliance_notes: z.string().optional(),
  
  // Budget and cost center
  cost_center_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  budget_code: z.string().optional(),
  budget_available: z.number().optional(),
  budget_exceeded: z.boolean().default(false),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// Expense Item validation schema
export const expenseItemSchema = z.object({
  expense_claim_id: z.string().uuid('Invalid expense claim ID'),
  category_id: z.string().uuid('Invalid category ID'),
  
  // Item details
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  amount: z.number().positive('Amount must be positive').max(100000, 'Amount too high'),
  currency: currencySchema,
  quantity: z.number().positive('Quantity must be positive').max(1000, 'Quantity too high'),
  unit_price: z.number().positive('Unit price must be positive').max(10000, 'Unit price too high'),
  
  // Date and location
  expense_date: z.string().datetime('Invalid expense date'),
  location: z.string().optional(),
  vendor: z.string().optional(),
  
  // Receipt information
  receipt_id: z.string().uuid().optional(),
  receipt_number: z.string().optional(),
  receipt_date: z.string().datetime().optional(),
  
  // Tax information
  tax_amount: z.number().min(0, 'Tax amount cannot be negative').default(0),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').default(0),
  tax_code: z.string().optional(),
  
  // Policy compliance
  policy_compliant: z.boolean().default(true),
  policy_violations: z.array(z.string()).default([]),
  
  // Approval
  approved_amount: z.number().positive().optional(),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  rejection_reason: z.string().optional(),
});

// Expense Category validation schema
export const expenseCategorySchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  code: z.string().min(1, 'Category code is required').max(20, 'Category code too long'),
  description: z.string().optional(),
  
  // Classification
  parent_category_id: z.string().uuid().optional(),
  level: z.number().int().min(0).max(10, 'Level must be between 0 and 10'),
  is_active: z.boolean().default(true),
  
  // Limits and policies
  monthly_limit: z.number().positive().optional(),
  annual_limit: z.number().positive().optional(),
  requires_approval: z.boolean().default(false),
  approval_threshold: z.number().positive().optional(),
  
  // Tax and accounting
  tax_deductible: z.boolean().default(true),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').default(0),
  gl_account_id: z.string().uuid().optional(),
  
  // Compliance
  requires_receipt: z.boolean().default(true),
  requires_justification: z.boolean().default(false),
  restricted_items: z.array(z.string()).default([]),
  
  // Metadata
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

// Expense Policy validation schema
export const expensePolicySchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  name: z.string().min(1, 'Policy name is required').max(200, 'Policy name too long'),
  description: z.string().optional(),
  
  // Policy scope
  applies_to: z.enum(['all_employees', 'specific_roles', 'specific_departments', 'specific_employees']),
  target_roles: z.array(z.string()).optional(),
  target_departments: z.array(z.string().uuid()).optional(),
  target_employees: z.array(z.string().uuid()).optional(),
  
  // Limits and thresholds
  daily_limit: z.number().positive().optional(),
  monthly_limit: z.number().positive().optional(),
  annual_limit: z.number().positive().optional(),
  per_item_limit: z.number().positive().optional(),
  
  // Approval requirements
  requires_manager_approval: z.boolean().default(true),
  requires_finance_approval: z.boolean().default(false),
  requires_director_approval: z.boolean().default(false),
  approval_thresholds: z.object({
    manager_threshold: z.number().positive().optional(),
    finance_threshold: z.number().positive().optional(),
    director_threshold: z.number().positive().optional(),
  }).default({}),
  
  // Receipt requirements
  requires_receipt: z.boolean().default(true),
  receipt_threshold: z.number().min(0).default(0),
  requires_original_receipt: z.boolean().default(false),
  
  // Time limits
  submission_deadline_days: z.number().int().min(1).max(365, 'Submission deadline must be between 1 and 365 days').default(30),
  approval_deadline_days: z.number().int().min(1).max(30, 'Approval deadline must be between 1 and 30 days').default(7),
  payment_deadline_days: z.number().int().min(1).max(30, 'Payment deadline must be between 1 and 30 days').default(14),
  
  // Restrictions
  restricted_categories: z.array(z.string().uuid()).default([]),
  restricted_vendors: z.array(z.string()).default([]),
  restricted_locations: z.array(z.string()).default([]),
  
  // Status
  is_active: z.boolean().default(true),
  effective_date: z.string().datetime('Invalid effective date'),
  expiry_date: z.string().datetime().optional(),
});

// Expense Receipt validation schema
export const expenseReceiptSchema = z.object({
  expense_item_id: z.string().uuid('Invalid expense item ID'),
  employee_id: z.string().uuid('Invalid employee ID'),
  
  // File information
  file_name: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  file_path: z.string().min(1, 'File path is required'),
  file_size: z.number().positive('File size must be positive').max(10 * 1024 * 1024, 'File size too large (max 10MB)'),
  file_type: z.string().min(1, 'File type is required'),
  mime_type: z.string().min(1, 'MIME type is required'),
  
  // OCR and extraction
  ocr_processed: z.boolean().default(false),
  ocr_text: z.string().optional(),
  extracted_data: z.object({
    vendor_name: z.string().optional(),
    amount: z.number().positive().optional(),
    date: z.string().datetime().optional(),
    tax_amount: z.number().min(0).optional(),
    items: z.array(z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unit_price: z.number().positive(),
      total: z.number().positive(),
    })).optional(),
  }).optional(),
  
  // Validation
  is_valid: z.boolean().default(true),
  validation_errors: z.array(z.string()).default([]),
  manually_verified: z.boolean().default(false),
  verified_by: z.string().uuid().optional(),
  verified_at: z.string().datetime().optional(),
  
  // Metadata
  upload_date: z.string().datetime('Invalid upload date'),
});

// Expense Approval validation schema
export const expenseApprovalSchema = z.object({
  expense_claim_id: z.string().uuid('Invalid expense claim ID'),
  approver_id: z.string().uuid('Invalid approver ID'),
  
  // Approval details
  approval_level: z.enum(['manager', 'finance', 'director', 'executive']),
  approval_type: z.enum(['approve', 'reject', 'request_changes']),
  
  // Decision
  approved_amount: z.number().positive().optional(),
  approved_items: z.array(z.string().uuid()).default([]),
  rejected_items: z.array(z.string().uuid()).default([]),
  comments: z.string().optional(),
  
  // Conditions and requirements
  conditions: z.array(z.string()).default([]),
  additional_requirements: z.array(z.string()).default([]),
  
  // Timestamps
  requested_at: z.string().datetime('Invalid request date'),
  responded_at: z.string().datetime().optional(),
  deadline: z.string().datetime('Invalid deadline'),
  
  // Status
  status: z.enum(['pending', 'approved', 'rejected', 'requested_changes', 'expired']).default('pending'),
});

// Expense Budget validation schema
export const expenseBudgetSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  budget_name: z.string().min(1, 'Budget name is required').max(200, 'Budget name too long'),
  budget_type: z.enum(['department', 'project', 'category', 'employee', 'cost_center']),
  
  // Budget scope
  target_id: z.string().min(1, 'Target ID is required'),
  target_name: z.string().min(1, 'Target name is required').max(200, 'Target name too long'),
  
  // Budget amounts
  monthly_budget: z.number().positive('Monthly budget must be positive'),
  quarterly_budget: z.number().positive('Quarterly budget must be positive'),
  annual_budget: z.number().positive('Annual budget must be positive'),
  currency: currencySchema,
  
  // Tracking
  spent_amount: z.number().min(0, 'Spent amount cannot be negative').default(0),
  committed_amount: z.number().min(0, 'Committed amount cannot be negative').default(0),
  available_amount: z.number().min(0, 'Available amount cannot be negative').default(0),
  
  // Alerts and thresholds
  warning_threshold: z.number().min(0).max(100, 'Warning threshold must be between 0 and 100').default(80),
  critical_threshold: z.number().min(0).max(100, 'Critical threshold must be between 0 and 100').default(95),
  alerts_enabled: z.boolean().default(true),
  
  // Period
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  is_active: z.boolean().default(true),
  
  // Approval
  requires_approval: z.boolean().default(false),
  approval_threshold: z.number().positive().optional(),
});

// Form validation schemas
export const expenseClaimFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  expense_date: z.string().datetime('Invalid expense date'),
  currency: currencySchema,
  items: z.array(z.object({
    category_id: z.string().uuid('Invalid category ID'),
    description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
    amount: z.number().positive('Amount must be positive').max(100000, 'Amount too high'),
    quantity: z.number().positive('Quantity must be positive').max(1000, 'Quantity too high'),
    unit_price: z.number().positive('Unit price must be positive').max(10000, 'Unit price too high'),
    expense_date: z.string().datetime('Invalid expense date'),
    location: z.string().optional(),
    vendor: z.string().optional(),
    receipt_file: z.instanceof(File).optional(),
  })).min(1, 'At least one expense item is required').max(50, 'Too many expense items'),
  notes: z.string().optional(),
}).refine((data) => {
  // Validate that total amount matches sum of items
  const totalAmount = data.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
  return totalAmount > 0;
}, {
  message: 'Total amount must be greater than 0',
  path: ['items'],
});

export const expenseApprovalFormSchema = z.object({
  approval_type: z.enum(['approve', 'reject', 'request_changes']),
  approved_amount: z.number().positive().optional(),
  approved_items: z.array(z.string().uuid()).default([]),
  rejected_items: z.array(z.string().uuid()).default([]),
  comments: z.string().optional(),
  conditions: z.array(z.string()).default([]),
  additional_requirements: z.array(z.string()).default([]),
}).refine((data) => {
  // Validate that if approving, approved_amount is provided
  if (data.approval_type === 'approve' && !data.approved_amount) {
    return false;
  }
  return true;
}, {
  message: 'Approved amount is required when approving',
  path: ['approved_amount'],
});

// Filter validation schemas
export const expenseFiltersSchema = z.object({
  employee_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  status: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  amount_min: z.number().positive().optional(),
  amount_max: z.number().positive().optional(),
  submitted_by: z.string().uuid().optional(),
  approved_by: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
}).refine((data) => {
  // Validate date range
  if (data.date_from && data.date_to) {
    const fromDate = new Date(data.date_from);
    const toDate = new Date(data.date_to);
    return toDate >= fromDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['date_to'],
});

// Export all schemas
export const ExpenseValidationSchemas = {
  expenseClaim: expenseClaimSchema,
  expenseItem: expenseItemSchema,
  expenseCategory: expenseCategorySchema,
  expensePolicy: expensePolicySchema,
  expenseReceipt: expenseReceiptSchema,
  expenseApproval: expenseApprovalSchema,
  expenseBudget: expenseBudgetSchema,
  expenseClaimForm: expenseClaimFormSchema,
  expenseApprovalForm: expenseApprovalFormSchema,
  expenseFilters: expenseFiltersSchema,
};

// Validation helper functions
export const validateExpenseClaim = (data: unknown) => expenseClaimSchema.parse(data);
export const validateExpenseItem = (data: unknown) => expenseItemSchema.parse(data);
export const validateExpenseCategory = (data: unknown) => expenseCategorySchema.parse(data);
export const validateExpensePolicy = (data: unknown) => expensePolicySchema.parse(data);
export const validateExpenseReceipt = (data: unknown) => expenseReceiptSchema.parse(data);
export const validateExpenseApproval = (data: unknown) => expenseApprovalSchema.parse(data);
export const validateExpenseBudget = (data: unknown) => expenseBudgetSchema.parse(data);
export const validateExpenseClaimForm = (data: unknown) => expenseClaimFormSchema.parse(data);
export const validateExpenseApprovalForm = (data: unknown) => expenseApprovalFormSchema.parse(data);

// Safe validation functions that return errors instead of throwing
export const safeValidateExpenseClaim = (data: unknown) => {
  try {
    return { success: true, data: expenseClaimSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateExpenseClaimForm = (data: unknown) => {
  try {
    return { success: true, data: expenseClaimFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateExpenseApprovalForm = (data: unknown) => {
  try {
    return { success: true, data: expenseApprovalFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

// Business rule validation functions
export const validateExpensePolicyCompliance = (
  expenseClaim: any,
  policy: any
): { compliant: boolean; violations: string[] } => {
  const violations: string[] = [];

  // Check amount limits
  if (policy.daily_limit && expenseClaim.total_amount > policy.daily_limit) {
    violations.push(`Daily limit exceeded: ${expenseClaim.total_amount} > ${policy.daily_limit}`);
  }

  if (policy.monthly_limit && expenseClaim.total_amount > policy.monthly_limit) {
    violations.push(`Monthly limit exceeded: ${expenseClaim.total_amount} > ${policy.monthly_limit}`);
  }

  if (policy.annual_limit && expenseClaim.total_amount > policy.annual_limit) {
    violations.push(`Annual limit exceeded: ${expenseClaim.total_amount} > ${policy.annual_limit}`);
  }

  // Check receipt requirements
  if (policy.requires_receipt && expenseClaim.total_amount >= policy.receipt_threshold) {
    const hasReceipts = expenseClaim.items?.some((item: any) => item.receipt_id);
    if (!hasReceipts) {
      violations.push('Receipt required for this amount');
    }
  }

  // Check submission deadline
  const submissionDate = new Date(expenseClaim.submitted_at);
  const expenseDate = new Date(expenseClaim.expense_date);
  const daysDiff = Math.ceil((submissionDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > policy.submission_deadline_days) {
    violations.push(`Submission deadline exceeded: ${daysDiff} days > ${policy.submission_deadline_days} days`);
  }

  return {
    compliant: violations.length === 0,
    violations
  };
};

export const validateBudgetCompliance = (
  expenseClaim: any,
  budget: any
): { compliant: boolean; available: number; exceeded: boolean } => {
  const available = budget.available_amount - expenseClaim.total_amount;
  const exceeded = available < 0;

  return {
    compliant: !exceeded,
    available: Math.max(0, available),
    exceeded
  };
}; 