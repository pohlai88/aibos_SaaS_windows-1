// Expense Management Constants - Enterprise Grade Configuration
// Centralized constants for consistent behavior across the module

// Status constants
export const EXPENSE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export const EXPENSE_STATUS_LABELS = {
  [EXPENSE_STATUS.DRAFT]: 'Draft',
  [EXPENSE_STATUS.SUBMITTED]: 'Submitted',
  [EXPENSE_STATUS.UNDER_REVIEW]: 'Under Review',
  [EXPENSE_STATUS.APPROVED]: 'Approved',
  [EXPENSE_STATUS.REJECTED]: 'Rejected',
  [EXPENSE_STATUS.PAID]: 'Paid',
  [EXPENSE_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const EXPENSE_STATUS_COLORS = {
  [EXPENSE_STATUS.DRAFT]: 'gray',
  [EXPENSE_STATUS.SUBMITTED]: 'blue',
  [EXPENSE_STATUS.UNDER_REVIEW]: 'yellow',
  [EXPENSE_STATUS.APPROVED]: 'green',
  [EXPENSE_STATUS.REJECTED]: 'red',
  [EXPENSE_STATUS.PAID]: 'purple',
  [EXPENSE_STATUS.CANCELLED]: 'gray',
} as const;

// Priority constants
export const EXPENSE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const EXPENSE_PRIORITY_LABELS = {
  [EXPENSE_PRIORITY.LOW]: 'Low',
  [EXPENSE_PRIORITY.MEDIUM]: 'Medium',
  [EXPENSE_PRIORITY.HIGH]: 'High',
  [EXPENSE_PRIORITY.URGENT]: 'Urgent',
} as const;

export const EXPENSE_PRIORITY_COLORS = {
  [EXPENSE_PRIORITY.LOW]: 'gray',
  [EXPENSE_PRIORITY.MEDIUM]: 'blue',
  [EXPENSE_PRIORITY.HIGH]: 'orange',
  [EXPENSE_PRIORITY.URGENT]: 'red',
} as const;

// Currency constants
export const SUPPORTED_CURRENCIES = {
  MYR: 'Malaysian Ringgit',
  USD: 'US Dollar',
  SGD: 'Singapore Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
} as const;

export const DEFAULT_CURRENCY = 'MYR';

// Payment method constants
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CHECK: 'check',
  CREDIT_CARD: 'credit_card',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CHECK]: 'Check',
  [PAYMENT_METHODS.CREDIT_CARD]: 'Credit Card',
} as const;

// Approval level constants
export const APPROVAL_LEVELS = {
  MANAGER: 'manager',
  FINANCE: 'finance',
  DIRECTOR: 'director',
  EXECUTIVE: 'executive',
} as const;

export const APPROVAL_LEVEL_LABELS = {
  [APPROVAL_LEVELS.MANAGER]: 'Manager',
  [APPROVAL_LEVELS.FINANCE]: 'Finance',
  [APPROVAL_LEVELS.DIRECTOR]: 'Director',
  [APPROVAL_LEVELS.EXECUTIVE]: 'Executive',
} as const;

// Approval type constants
export const APPROVAL_TYPES = {
  APPROVE: 'approve',
  REJECT: 'reject',
  REQUEST_CHANGES: 'request_changes',
} as const;

export const APPROVAL_TYPE_LABELS = {
  [APPROVAL_TYPES.APPROVE]: 'Approve',
  [APPROVAL_TYPES.REJECT]: 'Reject',
  [APPROVAL_TYPES.REQUEST_CHANGES]: 'Request Changes',
} as const;

// Budget type constants
export const BUDGET_TYPES = {
  DEPARTMENT: 'department',
  PROJECT: 'project',
  CATEGORY: 'category',
  EMPLOYEE: 'employee',
  COST_CENTER: 'cost_center',
} as const;

export const BUDGET_TYPE_LABELS = {
  [BUDGET_TYPES.DEPARTMENT]: 'Department',
  [BUDGET_TYPES.PROJECT]: 'Project',
  [BUDGET_TYPES.CATEGORY]: 'Category',
  [BUDGET_TYPES.EMPLOYEE]: 'Employee',
  [BUDGET_TYPES.COST_CENTER]: 'Cost Center',
} as const;

// Policy scope constants
export const POLICY_SCOPE = {
  ALL_EMPLOYEES: 'all_employees',
  SPECIFIC_ROLES: 'specific_roles',
  SPECIFIC_DEPARTMENTS: 'specific_departments',
  SPECIFIC_EMPLOYEES: 'specific_employees',
} as const;

export const POLICY_SCOPE_LABELS = {
  [POLICY_SCOPE.ALL_EMPLOYEES]: 'All Employees',
  [POLICY_SCOPE.SPECIFIC_ROLES]: 'Specific Roles',
  [POLICY_SCOPE.SPECIFIC_DEPARTMENTS]: 'Specific Departments',
  [POLICY_SCOPE.SPECIFIC_EMPLOYEES]: 'Specific Employees',
} as const;

// Report type constants
export const REPORT_TYPES = {
  EMPLOYEE: 'employee',
  DEPARTMENT: 'department',
  CATEGORY: 'category',
  VENDOR: 'vendor',
  PROJECT: 'project',
  CUSTOM: 'custom',
} as const;

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.EMPLOYEE]: 'Employee Report',
  [REPORT_TYPES.DEPARTMENT]: 'Department Report',
  [REPORT_TYPES.CATEGORY]: 'Category Report',
  [REPORT_TYPES.VENDOR]: 'Vendor Report',
  [REPORT_TYPES.PROJECT]: 'Project Report',
  [REPORT_TYPES.CUSTOM]: 'Custom Report',
} as const;

// Export format constants
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
} as const;

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.PDF]: 'PDF',
  [EXPORT_FORMATS.EXCEL]: 'Excel',
  [EXPORT_FORMATS.CSV]: 'CSV',
  [EXPORT_FORMATS.JSON]: 'JSON',
} as const;

// Notification type constants
export const EXPENSE_NOTIFICATION_TYPES = {
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
  PAYMENT_PROCESSED: 'payment_processed',
  BUDGET_EXCEEDED: 'budget_exceeded',
  POLICY_VIOLATION: 'policy_violation',
} as const;

export const EXPENSE_NOTIFICATION_LABELS = {
  [EXPENSE_NOTIFICATION_TYPES.CLAIM_SUBMITTED]: 'Claim Submitted',
  [EXPENSE_NOTIFICATION_TYPES.CLAIM_APPROVED]: 'Claim Approved',
  [EXPENSE_NOTIFICATION_TYPES.CLAIM_REJECTED]: 'Claim Rejected',
  [EXPENSE_NOTIFICATION_TYPES.PAYMENT_PROCESSED]: 'Payment Processed',
  [EXPENSE_NOTIFICATION_TYPES.BUDGET_EXCEEDED]: 'Budget Exceeded',
  [EXPENSE_NOTIFICATION_TYPES.POLICY_VIOLATION]: 'Policy Violation',
} as const;

// File upload constants
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_CLAIM: 20,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
} as const;

// Validation constants
export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  NOTES_MAX_LENGTH: 1000,
  COMMENTS_MAX_LENGTH: 500,
  VENDOR_MAX_LENGTH: 100,
  LOCATION_MAX_LENGTH: 100,
  CATEGORY_NAME_MAX_LENGTH: 100,
  CATEGORY_CODE_MAX_LENGTH: 20,
  POLICY_NAME_MAX_LENGTH: 200,
  BUDGET_NAME_MAX_LENGTH: 200,
  MAX_ITEMS_PER_CLAIM: 50,
  MAX_TAGS_PER_CLAIM: 10,
  MAX_CONDITIONS_PER_APPROVAL: 10,
  MAX_REQUIREMENTS_PER_APPROVAL: 10,
} as const;

// Amount limits
export const AMOUNT_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
  MAX_ITEM_AMOUNT: 100000,
  MAX_UNIT_PRICE: 10000,
  MAX_QUANTITY: 1000,
  MAX_TAX_RATE: 100,
  MIN_TAX_RATE: 0,
} as const;

// Time limits
export const TIME_LIMITS = {
  MAX_SUBMISSION_DAYS: 365,
  MIN_SUBMISSION_DAYS: 1,
  MAX_APPROVAL_DAYS: 30,
  MIN_APPROVAL_DAYS: 1,
  MAX_PAYMENT_DAYS: 30,
  MIN_PAYMENT_DAYS: 1,
  MAX_BUDGET_LEVEL: 10,
  MIN_BUDGET_LEVEL: 0,
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Cache constants
export const CACHE_KEYS = {
  EXPENSE_CATEGORIES: 'expense_categories',
  EXPENSE_POLICIES: 'expense_policies',
  EXPENSE_BUDGETS: 'expense_budgets',
  EMPLOYEE_EXPENSES: 'employee_expenses',
  DEPARTMENT_EXPENSES: 'department_expenses',
  EXPENSE_REPORTS: 'expense_reports',
  EXPENSE_ANALYTICS: 'expense_analytics',
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

// Error codes
export const EXPENSE_ERROR_CODES = {
  VALIDATION_ERROR: 'EXPENSE_VALIDATION_ERROR',
  POLICY_VIOLATION: 'EXPENSE_POLICY_VIOLATION',
  BUDGET_EXCEEDED: 'EXPENSE_BUDGET_EXCEEDED',
  APPROVAL_REQUIRED: 'EXPENSE_APPROVAL_REQUIRED',
  RECEIPT_REQUIRED: 'EXPENSE_RECEIPT_REQUIRED',
  DEADLINE_EXCEEDED: 'EXPENSE_DEADLINE_EXCEEDED',
  INSUFFICIENT_PERMISSIONS: 'EXPENSE_INSUFFICIENT_PERMISSIONS',
  DUPLICATE_CLAIM: 'EXPENSE_DUPLICATE_CLAIM',
  INVALID_AMOUNT: 'EXPENSE_INVALID_AMOUNT',
  INVALID_CATEGORY: 'EXPENSE_INVALID_CATEGORY',
  INVALID_POLICY: 'EXPENSE_INVALID_POLICY',
  INVALID_BUDGET: 'EXPENSE_INVALID_BUDGET',
  FILE_UPLOAD_ERROR: 'EXPENSE_FILE_UPLOAD_ERROR',
  OCR_PROCESSING_ERROR: 'EXPENSE_OCR_PROCESSING_ERROR',
  PAYMENT_PROCESSING_ERROR: 'EXPENSE_PAYMENT_PROCESSING_ERROR',
} as const;

// Success messages
export const EXPENSE_SUCCESS_MESSAGES = {
  CLAIM_CREATED: 'Expense claim created successfully',
  CLAIM_UPDATED: 'Expense claim updated successfully',
  CLAIM_SUBMITTED: 'Expense claim submitted successfully',
  CLAIM_APPROVED: 'Expense claim approved successfully',
  CLAIM_REJECTED: 'Expense claim rejected successfully',
  CLAIM_CANCELLED: 'Expense claim cancelled successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  RECEIPT_UPLOADED: 'Receipt uploaded successfully',
  RECEIPT_VALIDATED: 'Receipt validated successfully',
  POLICY_CREATED: 'Expense policy created successfully',
  POLICY_UPDATED: 'Expense policy updated successfully',
  BUDGET_CREATED: 'Budget created successfully',
  BUDGET_UPDATED: 'Budget updated successfully',
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  REPORT_GENERATED: 'Report generated successfully',
  EXPORT_COMPLETED: 'Export completed successfully',
} as const;

// Warning messages
export const EXPENSE_WARNING_MESSAGES = {
  BUDGET_APPROACHING_LIMIT: 'Budget is approaching limit',
  POLICY_VIOLATION_DETECTED: 'Policy violation detected',
  RECEIPT_MISSING: 'Receipt is missing for this amount',
  DEADLINE_APPROACHING: 'Submission deadline is approaching',
  DUPLICATE_DETECTED: 'Potential duplicate expense detected',
  AMOUNT_HIGH: 'Amount is higher than usual',
  FREQUENT_SUBMISSIONS: 'Frequent submissions detected',
} as const;

// Info messages
export const EXPENSE_INFO_MESSAGES = {
  CLAIM_UNDER_REVIEW: 'Your claim is under review',
  APPROVAL_PENDING: 'Approval is pending',
  PAYMENT_SCHEDULED: 'Payment has been scheduled',
  RECEIPT_PROCESSING: 'Receipt is being processed',
  OCR_COMPLETED: 'OCR processing completed',
  BUDGET_UPDATED: 'Budget has been updated',
  POLICY_UPDATED: 'Policy has been updated',
} as const;

// Default values
export const DEFAULT_VALUES = {
  CURRENCY: DEFAULT_CURRENCY,
  STATUS: EXPENSE_STATUS.DRAFT,
  PRIORITY: EXPENSE_PRIORITY.MEDIUM,
  TAX_RATE: 0,
  QUANTITY: 1,
  UNIT_PRICE: 0,
  TAX_AMOUNT: 0,
  POLICY_COMPLIANT: true,
  REQUIRES_APPROVAL: false,
  REQUIRES_RECEIPT: true,
  IS_ACTIVE: true,
  ALERTS_ENABLED: true,
  MANUALLY_VERIFIED: false,
  OCR_PROCESSED: false,
  IS_VALID: true,
} as const;

// API endpoints
export const EXPENSE_API_ENDPOINTS = {
  CLAIMS: '/api/expenses/claims',
  ITEMS: '/api/expenses/items',
  CATEGORIES: '/api/expenses/categories',
  POLICIES: '/api/expenses/policies',
  RECEIPTS: '/api/expenses/receipts',
  APPROVALS: '/api/expenses/approvals',
  BUDGETS: '/api/expenses/budgets',
  REPORTS: '/api/expenses/reports',
  ANALYTICS: '/api/expenses/analytics',
  REIMBURSEMENTS: '/api/expenses/reimbursements',
  EXPORTS: '/api/expenses/exports',
  UPLOADS: '/api/expenses/uploads',
  OCR: '/api/expenses/ocr',
} as const;

// Permission constants
export const EXPENSE_PERMISSIONS = {
  VIEW_CLAIMS: 'expenses:view_claims',
  CREATE_CLAIMS: 'expenses:create_claims',
  UPDATE_CLAIMS: 'expenses:update_claims',
  DELETE_CLAIMS: 'expenses:delete_claims',
  SUBMIT_CLAIMS: 'expenses:submit_claims',
  APPROVE_CLAIMS: 'expenses:approve_claims',
  REJECT_CLAIMS: 'expenses:reject_claims',
  PROCESS_PAYMENTS: 'expenses:process_payments',
  VIEW_CATEGORIES: 'expenses:view_categories',
  MANAGE_CATEGORIES: 'expenses:manage_categories',
  VIEW_POLICIES: 'expenses:view_policies',
  MANAGE_POLICIES: 'expenses:manage_policies',
  VIEW_BUDGETS: 'expenses:view_budgets',
  MANAGE_BUDGETS: 'expenses:manage_budgets',
  VIEW_REPORTS: 'expenses:view_reports',
  GENERATE_REPORTS: 'expenses:generate_reports',
  EXPORT_DATA: 'expenses:export_data',
  VIEW_ANALYTICS: 'expenses:view_analytics',
  MANAGE_SETTINGS: 'expenses:manage_settings',
} as const;

// Role constants
export const EXPENSE_ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  FINANCE: 'finance',
  DIRECTOR: 'director',
  ADMIN: 'admin',
} as const;

// Feature flags
export const EXPENSE_FEATURES = {
  OCR_PROCESSING: 'expense_ocr_processing',
  AUTOMATIC_APPROVAL: 'expense_automatic_approval',
  BUDGET_ALERTS: 'expense_budget_alerts',
  POLICY_ENFORCEMENT: 'expense_policy_enforcement',
  ANALYTICS_DASHBOARD: 'expense_analytics_dashboard',
  MOBILE_APP: 'expense_mobile_app',
  INTEGRATION_ACCOUNTING: 'expense_integration_accounting',
  INTEGRATION_PAYROLL: 'expense_integration_payroll',
  MULTI_CURRENCY: 'expense_multi_currency',
  ADVANCED_REPORTING: 'expense_advanced_reporting',
} as const;

// Audit action constants
export const EXPENSE_AUDIT_ACTIONS = {
  CLAIM_CREATED: 'expense_claim_created',
  CLAIM_UPDATED: 'expense_claim_updated',
  CLAIM_SUBMITTED: 'expense_claim_submitted',
  CLAIM_APPROVED: 'expense_claim_approved',
  CLAIM_REJECTED: 'expense_claim_rejected',
  CLAIM_CANCELLED: 'expense_claim_cancelled',
  PAYMENT_PROCESSED: 'expense_payment_processed',
  RECEIPT_UPLOADED: 'expense_receipt_uploaded',
  RECEIPT_VALIDATED: 'expense_receipt_validated',
  POLICY_CREATED: 'expense_policy_created',
  POLICY_UPDATED: 'expense_policy_updated',
  BUDGET_CREATED: 'expense_budget_created',
  BUDGET_UPDATED: 'expense_budget_updated',
  CATEGORY_CREATED: 'expense_category_created',
  CATEGORY_UPDATED: 'expense_category_updated',
  REPORT_GENERATED: 'expense_report_generated',
  DATA_EXPORTED: 'expense_data_exported',
} as const; 