// Costing System Constants - Enterprise Grade Configuration
// Centralized constants for consistent behavior across the costing module

// Cost Center Types
export const COST_CENTER_TYPES = {
  PRODUCTION: 'production',
  SERVICE: 'service',
  SUPPORT: 'support',
  ADMINISTRATIVE: 'administrative',
  SALES: 'sales',
  RESEARCH: 'research',
} as const;

export const COST_CENTER_TYPE_LABELS = {
  [COST_CENTER_TYPES.PRODUCTION]: 'Production',
  [COST_CENTER_TYPES.SERVICE]: 'Service',
  [COST_CENTER_TYPES.SUPPORT]: 'Support',
  [COST_CENTER_TYPES.ADMINISTRATIVE]: 'Administrative',
  [COST_CENTER_TYPES.SALES]: 'Sales',
  [COST_CENTER_TYPES.RESEARCH]: 'Research',
} as const;

export const COST_CENTER_TYPE_COLORS = {
  [COST_CENTER_TYPES.PRODUCTION]: 'blue',
  [COST_CENTER_TYPES.SERVICE]: 'green',
  [COST_CENTER_TYPES.SUPPORT]: 'yellow',
  [COST_CENTER_TYPES.ADMINISTRATIVE]: 'gray',
  [COST_CENTER_TYPES.SALES]: 'purple',
  [COST_CENTER_TYPES.RESEARCH]: 'orange',
} as const;

// Cost Categories
export const COST_CATEGORIES = {
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  OVERHEAD: 'overhead',
  FIXED: 'fixed',
  VARIABLE: 'variable',
} as const;

export const COST_CATEGORY_LABELS = {
  [COST_CATEGORIES.DIRECT]: 'Direct',
  [COST_CATEGORIES.INDIRECT]: 'Indirect',
  [COST_CATEGORIES.OVERHEAD]: 'Overhead',
  [COST_CATEGORIES.FIXED]: 'Fixed',
  [COST_CATEGORIES.VARIABLE]: 'Variable',
} as const;

export const COST_CATEGORY_COLORS = {
  [COST_CATEGORIES.DIRECT]: 'green',
  [COST_CATEGORIES.INDIRECT]: 'yellow',
  [COST_CATEGORIES.OVERHEAD]: 'red',
  [COST_CATEGORIES.FIXED]: 'blue',
  [COST_CATEGORIES.VARIABLE]: 'orange',
} as const;

// Allocation Methods
export const ALLOCATION_METHODS = {
  DIRECT: 'direct',
  STEP_DOWN: 'step_down',
  RECIPROCAL: 'reciprocal',
  ACTIVITY_BASED: 'activity_based',
} as const;

export const ALLOCATION_METHOD_LABELS = {
  [ALLOCATION_METHODS.DIRECT]: 'Direct',
  [ALLOCATION_METHODS.STEP_DOWN]: 'Step Down',
  [ALLOCATION_METHODS.RECIPROCAL]: 'Reciprocal',
  [ALLOCATION_METHODS.ACTIVITY_BASED]: 'Activity Based',
} as const;

// Allocation Basis
export const ALLOCATION_BASIS = {
  HEADCOUNT: 'headcount',
  SQUARE_FOOTAGE: 'square_footage',
  MACHINE_HOURS: 'machine_hours',
  LABOR_HOURS: 'labor_hours',
  REVENUE: 'revenue',
  CUSTOM: 'custom',
} as const;

export const ALLOCATION_BASIS_LABELS = {
  [ALLOCATION_BASIS.HEADCOUNT]: 'Headcount',
  [ALLOCATION_BASIS.SQUARE_FOOTAGE]: 'Square Footage',
  [ALLOCATION_BASIS.MACHINE_HOURS]: 'Machine Hours',
  [ALLOCATION_BASIS.LABOR_HOURS]: 'Labor Hours',
  [ALLOCATION_BASIS.REVENUE]: 'Revenue',
  [ALLOCATION_BASIS.CUSTOM]: 'Custom',
} as const;

// Budget Periods
export const BUDGET_PERIODS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
} as const;

export const BUDGET_PERIOD_LABELS = {
  [BUDGET_PERIODS.MONTHLY]: 'Monthly',
  [BUDGET_PERIODS.QUARTERLY]: 'Quarterly',
  [BUDGET_PERIODS.ANNUAL]: 'Annual',
} as const;

// Activity Types
export const ACTIVITY_TYPES = {
  UNIT_LEVEL: 'unit_level',
  BATCH_LEVEL: 'batch_level',
  PRODUCT_LEVEL: 'product_level',
  FACILITY_LEVEL: 'facility_level',
} as const;

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.UNIT_LEVEL]: 'Unit Level',
  [ACTIVITY_TYPES.BATCH_LEVEL]: 'Batch Level',
  [ACTIVITY_TYPES.PRODUCT_LEVEL]: 'Product Level',
  [ACTIVITY_TYPES.FACILITY_LEVEL]: 'Facility Level',
} as const;

export const ACTIVITY_TYPE_COLORS = {
  [ACTIVITY_TYPES.UNIT_LEVEL]: 'blue',
  [ACTIVITY_TYPES.BATCH_LEVEL]: 'green',
  [ACTIVITY_TYPES.PRODUCT_LEVEL]: 'yellow',
  [ACTIVITY_TYPES.FACILITY_LEVEL]: 'red',
} as const;

// Activity Categories
export const ACTIVITY_CATEGORIES = {
  PRODUCTION: 'production',
  SETUP: 'setup',
  MAINTENANCE: 'maintenance',
  QUALITY: 'quality',
  LOGISTICS: 'logistics',
  ADMINISTRATION: 'administration',
} as const;

export const ACTIVITY_CATEGORY_LABELS = {
  [ACTIVITY_CATEGORIES.PRODUCTION]: 'Production',
  [ACTIVITY_CATEGORIES.SETUP]: 'Setup',
  [ACTIVITY_CATEGORIES.MAINTENANCE]: 'Maintenance',
  [ACTIVITY_CATEGORIES.QUALITY]: 'Quality',
  [ACTIVITY_CATEGORIES.LOGISTICS]: 'Logistics',
  [ACTIVITY_CATEGORIES.ADMINISTRATION]: 'Administration',
} as const;

// Cost Driver Types
export const COST_DRIVER_TYPES = {
  VOLUME: 'volume',
  TIME: 'time',
  COMPLEXITY: 'complexity',
  CUSTOM: 'custom',
} as const;

export const COST_DRIVER_TYPE_LABELS = {
  [COST_DRIVER_TYPES.VOLUME]: 'Volume',
  [COST_DRIVER_TYPES.TIME]: 'Time',
  [COST_DRIVER_TYPES.COMPLEXITY]: 'Complexity',
  [COST_DRIVER_TYPES.CUSTOM]: 'Custom',
} as const;

// Process Types
export const PROCESS_TYPES = {
  CONTINUOUS: 'continuous',
  BATCH: 'batch',
  JOB_ORDER: 'job_order',
} as const;

export const PROCESS_TYPE_LABELS = {
  [PROCESS_TYPES.CONTINUOUS]: 'Continuous',
  [PROCESS_TYPES.BATCH]: 'Batch',
  [PROCESS_TYPES.JOB_ORDER]: 'Job Order',
} as const;

// Process Status
export const PROCESS_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
} as const;

export const PROCESS_STATUS_LABELS = {
  [PROCESS_STATUS.IN_PROGRESS]: 'In Progress',
  [PROCESS_STATUS.COMPLETED]: 'Completed',
  [PROCESS_STATUS.CLOSED]: 'Closed',
} as const;

export const PROCESS_STATUS_COLORS = {
  [PROCESS_STATUS.IN_PROGRESS]: 'yellow',
  [PROCESS_STATUS.COMPLETED]: 'green',
  [PROCESS_STATUS.CLOSED]: 'gray',
} as const;

// Variance Types
export const VARIANCE_TYPES = {
  MATERIALS: 'materials',
  LABOR: 'labor',
  OVERHEAD: 'overhead',
  EFFICIENCY: 'efficiency',
  VOLUME: 'volume',
  PRICE: 'price',
  MIX: 'mix',
} as const;

export const VARIANCE_TYPE_LABELS = {
  [VARIANCE_TYPES.MATERIALS]: 'Materials',
  [VARIANCE_TYPES.LABOR]: 'Labor',
  [VARIANCE_TYPES.OVERHEAD]: 'Overhead',
  [VARIANCE_TYPES.EFFICIENCY]: 'Efficiency',
  [VARIANCE_TYPES.VOLUME]: 'Volume',
  [VARIANCE_TYPES.PRICE]: 'Price',
  [VARIANCE_TYPES.MIX]: 'Mix',
} as const;

export const VARIANCE_TYPE_COLORS = {
  [VARIANCE_TYPES.MATERIALS]: 'blue',
  [VARIANCE_TYPES.LABOR]: 'green',
  [VARIANCE_TYPES.OVERHEAD]: 'red',
  [VARIANCE_TYPES.EFFICIENCY]: 'yellow',
  [VARIANCE_TYPES.VOLUME]: 'purple',
  [VARIANCE_TYPES.PRICE]: 'orange',
  [VARIANCE_TYPES.MIX]: 'pink',
} as const;

// Variance Status
export const VARIANCE_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const VARIANCE_STATUS_LABELS = {
  [VARIANCE_STATUS.OPEN]: 'Open',
  [VARIANCE_STATUS.INVESTIGATING]: 'Investigating',
  [VARIANCE_STATUS.RESOLVED]: 'Resolved',
  [VARIANCE_STATUS.CLOSED]: 'Closed',
} as const;

export const VARIANCE_STATUS_COLORS = {
  [VARIANCE_STATUS.OPEN]: 'red',
  [VARIANCE_STATUS.INVESTIGATING]: 'yellow',
  [VARIANCE_STATUS.RESOLVED]: 'green',
  [VARIANCE_STATUS.CLOSED]: 'gray',
} as const;

// Standard Cost Status
export const STANDARD_COST_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const STANDARD_COST_STATUS_LABELS = {
  [STANDARD_COST_STATUS.DRAFT]: 'Draft',
  [STANDARD_COST_STATUS.PENDING_APPROVAL]: 'Pending Approval',
  [STANDARD_COST_STATUS.APPROVED]: 'Approved',
  [STANDARD_COST_STATUS.REJECTED]: 'Rejected',
} as const;

export const STANDARD_COST_STATUS_COLORS = {
  [STANDARD_COST_STATUS.DRAFT]: 'gray',
  [STANDARD_COST_STATUS.PENDING_APPROVAL]: 'yellow',
  [STANDARD_COST_STATUS.APPROVED]: 'green',
  [STANDARD_COST_STATUS.REJECTED]: 'red',
} as const;

// Overhead Allocation Basis
export const OVERHEAD_ALLOCATION_BASIS = {
  DIRECT_LABOR_HOURS: 'direct_labor_hours',
  DIRECT_LABOR_COST: 'direct_labor_cost',
  MACHINE_HOURS: 'machine_hours',
  ACTIVITY_BASED: 'activity_based',
} as const;

export const OVERHEAD_ALLOCATION_BASIS_LABELS = {
  [OVERHEAD_ALLOCATION_BASIS.DIRECT_LABOR_HOURS]: 'Direct Labor Hours',
  [OVERHEAD_ALLOCATION_BASIS.DIRECT_LABOR_COST]: 'Direct Labor Cost',
  [OVERHEAD_ALLOCATION_BASIS.MACHINE_HOURS]: 'Machine Hours',
  [OVERHEAD_ALLOCATION_BASIS.ACTIVITY_BASED]: 'Activity Based',
} as const;

// Report Types
export const REPORT_TYPES = {
  COST_CENTER: 'cost_center',
  PRODUCT: 'product',
  PROCESS: 'process',
  ACTIVITY: 'activity',
  VARIANCE: 'variance',
  PROFITABILITY: 'profitability',
} as const;

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.COST_CENTER]: 'Cost Center Report',
  [REPORT_TYPES.PRODUCT]: 'Product Report',
  [REPORT_TYPES.PROCESS]: 'Process Report',
  [REPORT_TYPES.ACTIVITY]: 'Activity Report',
  [REPORT_TYPES.VARIANCE]: 'Variance Report',
  [REPORT_TYPES.PROFITABILITY]: 'Profitability Report',
} as const;

// Export Formats
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

// Job Status
export const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.PENDING]: 'Pending',
  [JOB_STATUS.RUNNING]: 'Running',
  [JOB_STATUS.COMPLETED]: 'Completed',
  [JOB_STATUS.FAILED]: 'Failed',
  [JOB_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const JOB_STATUS_COLORS = {
  [JOB_STATUS.PENDING]: 'gray',
  [JOB_STATUS.RUNNING]: 'blue',
  [JOB_STATUS.COMPLETED]: 'green',
  [JOB_STATUS.FAILED]: 'red',
  [JOB_STATUS.CANCELLED]: 'yellow',
} as const;

// Notification Types
export const COSTING_NOTIFICATION_TYPES = {
  VARIANCE_ALERT: 'variance_alert',
  ALLOCATION_COMPLETE: 'allocation_complete',
  STANDARD_COST_UPDATE: 'standard_cost_update',
  PROCESS_COMPLETE: 'process_complete',
  BUDGET_EXCEEDED: 'budget_exceeded',
} as const;

export const COSTING_NOTIFICATION_LABELS = {
  [COSTING_NOTIFICATION_TYPES.VARIANCE_ALERT]: 'Variance Alert',
  [COSTING_NOTIFICATION_TYPES.ALLOCATION_COMPLETE]: 'Allocation Complete',
  [COSTING_NOTIFICATION_TYPES.STANDARD_COST_UPDATE]: 'Standard Cost Update',
  [COSTING_NOTIFICATION_TYPES.PROCESS_COMPLETE]: 'Process Complete',
  [COSTING_NOTIFICATION_TYPES.BUDGET_EXCEEDED]: 'Budget Exceeded',
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  CODE_MAX_LENGTH: 20,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  FORMULA_MAX_LENGTH: 1000,
  ERROR_MESSAGE_MAX_LENGTH: 200,
  MAX_CONDITIONS_PER_RULE: 10,
  MAX_VALIDATION_RULES_PER_RULE: 10,
  MAX_PERCENTAGES_PER_RULE: 20,
  MAX_ACTIVITIES_PER_STANDARD_COST: 50,
  MAX_OPERATIONS_PER_STANDARD_COST: 20,
  MAX_MATERIALS_PER_STANDARD_COST: 100,
} as const;

// Amount Limits
export const AMOUNT_LIMITS = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999.99,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  MIN_RATE: 0,
  MAX_RATE: 999999.99,
  MIN_HOURS: 0,
  MAX_HOURS: 8760, // 24 hours * 365 days
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 999999999,
  MIN_COMPLETION_PERCENTAGE: 0,
  MAX_COMPLETION_PERCENTAGE: 100,
} as const;

// Time Limits
export const TIME_LIMITS = {
  MAX_PROCESS_STAGES: 50,
  MIN_PROCESS_STAGES: 1,
  MAX_COST_CENTER_LEVEL: 10,
  MIN_COST_CENTER_LEVEL: 0,
  MAX_PRIORITY: 1000,
  MIN_PRIORITY: 1,
  MAX_EXECUTION_ORDER: 1000,
  MIN_EXECUTION_ORDER: 1,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Cache Keys
export const CACHE_KEYS = {
  COST_CENTERS: 'cost_centers',
  ACTIVITIES: 'activities',
  COST_DRIVERS: 'cost_drivers',
  STANDARD_COSTS: 'standard_costs',
  PROCESS_COSTS: 'process_costs',
  ALLOCATION_RULES: 'allocation_rules',
  VARIANCES: 'variances',
  COSTING_ANALYTICS: 'costing_analytics',
  COSTING_REPORTS: 'costing_reports',
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

// Error Codes
export const COSTING_ERROR_CODES = {
  VALIDATION_ERROR: 'COSTING_VALIDATION_ERROR',
  ALLOCATION_ERROR: 'COSTING_ALLOCATION_ERROR',
  CALCULATION_ERROR: 'COSTING_CALCULATION_ERROR',
  RULE_VIOLATION: 'COSTING_RULE_VIOLATION',
  BUDGET_EXCEEDED: 'COSTING_BUDGET_EXCEEDED',
  INSUFFICIENT_PERMISSIONS: 'COSTING_INSUFFICIENT_PERMISSIONS',
  DUPLICATE_COST_CENTER: 'COSTING_DUPLICATE_COST_CENTER',
  INVALID_FORMULA: 'COSTING_INVALID_FORMULA',
  INVALID_ALLOCATION: 'COSTING_INVALID_ALLOCATION',
  INVALID_STANDARD_COST: 'COSTING_INVALID_STANDARD_COST',
  INVALID_PROCESS_COST: 'COSTING_INVALID_PROCESS_COST',
  INVALID_ACTIVITY: 'COSTING_INVALID_ACTIVITY',
  INVALID_COST_DRIVER: 'COSTING_INVALID_COST_DRIVER',
  ALLOCATION_JOB_FAILED: 'COSTING_ALLOCATION_JOB_FAILED',
  REPORT_GENERATION_FAILED: 'COSTING_REPORT_GENERATION_FAILED',
} as const;

// Success Messages
export const COSTING_SUCCESS_MESSAGES = {
  COST_CENTER_CREATED: 'Cost center created successfully',
  COST_CENTER_UPDATED: 'Cost center updated successfully',
  COST_CENTER_DELETED: 'Cost center deleted successfully',
  ACTIVITY_CREATED: 'Activity created successfully',
  ACTIVITY_UPDATED: 'Activity updated successfully',
  ACTIVITY_DELETED: 'Activity deleted successfully',
  COST_DRIVER_CREATED: 'Cost driver created successfully',
  COST_DRIVER_UPDATED: 'Cost driver updated successfully',
  COST_DRIVER_DELETED: 'Cost driver deleted successfully',
  STANDARD_COST_CREATED: 'Standard cost created successfully',
  STANDARD_COST_UPDATED: 'Standard cost updated successfully',
  STANDARD_COST_APPROVED: 'Standard cost approved successfully',
  PROCESS_COST_CREATED: 'Process cost created successfully',
  PROCESS_COST_UPDATED: 'Process cost updated successfully',
  ALLOCATION_RULE_CREATED: 'Allocation rule created successfully',
  ALLOCATION_RULE_UPDATED: 'Allocation rule updated successfully',
  ALLOCATION_JOB_STARTED: 'Allocation job started successfully',
  ALLOCATION_JOB_COMPLETED: 'Allocation job completed successfully',
  VARIANCE_CREATED: 'Variance created successfully',
  VARIANCE_UPDATED: 'Variance updated successfully',
  REPORT_GENERATED: 'Report generated successfully',
  EXPORT_COMPLETED: 'Export completed successfully',
} as const;

// Warning Messages
export const COSTING_WARNING_MESSAGES = {
  BUDGET_APPROACHING_LIMIT: 'Budget is approaching limit',
  ALLOCATION_PERCENTAGE_NOT_100: 'Allocation percentages do not sum to 100%',
  STANDARD_COST_OUTDATED: 'Standard cost may be outdated',
  PROCESS_COST_INCOMPLETE: 'Process cost calculation is incomplete',
  VARIANCE_THRESHOLD_EXCEEDED: 'Variance threshold exceeded',
  ALLOCATION_RULE_CONFLICT: 'Allocation rule conflict detected',
  COST_CENTER_HIERARCHY_ISSUE: 'Cost center hierarchy issue detected',
  ACTIVITY_DRIVER_MISMATCH: 'Activity driver mismatch detected',
} as const;

// Info Messages
export const COSTING_INFO_MESSAGES = {
  ALLOCATION_IN_PROGRESS: 'Cost allocation is in progress',
  STANDARD_COST_PENDING_APPROVAL: 'Standard cost is pending approval',
  PROCESS_COST_IN_PROGRESS: 'Process cost calculation is in progress',
  VARIANCE_INVESTIGATION_STARTED: 'Variance investigation has started',
  REPORT_GENERATION_STARTED: 'Report generation has started',
  CACHE_REFRESHED: 'Cache has been refreshed',
  DATA_SYNC_COMPLETED: 'Data synchronization completed',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  CURRENCY: 'MYR',
  BUDGET_PERIOD: BUDGET_PERIODS.MONTHLY,
  ALLOCATION_METHOD: ALLOCATION_METHODS.DIRECT,
  ALLOCATION_BASIS: ALLOCATION_BASIS.HEADCOUNT,
  ACTIVITY_TYPE: ACTIVITY_TYPES.UNIT_LEVEL,
  ACTIVITY_CATEGORY: ACTIVITY_CATEGORIES.PRODUCTION,
  COST_DRIVER_TYPE: COST_DRIVER_TYPES.VOLUME,
  PROCESS_TYPE: PROCESS_TYPES.BATCH,
  VARIANCE_TYPE: VARIANCE_TYPES.MATERIALS,
  STANDARD_COST_STATUS: STANDARD_COST_STATUS.DRAFT,
  PROCESS_STATUS: PROCESS_STATUS.IN_PROGRESS,
  VARIANCE_STATUS: VARIANCE_STATUS.OPEN,
  JOB_STATUS: JOB_STATUS.PENDING,
  COST_CENTER_TYPE: COST_CENTER_TYPES.PRODUCTION,
  COST_CATEGORY: COST_CATEGORIES.DIRECT,
  IS_ACTIVE: true,
  IS_PRODUCTION: false,
  IS_SERVICE: false,
  IS_AUTOMATED: false,
  REQUIRES_APPROVAL: false,
  IS_CURRENT: true,
  IS_FAVORABLE: false,
  PRIORITY: 1,
  EXECUTION_ORDER: 1,
  PROGRESS: 0,
  EFFICIENCY_TARGET: 100,
  COMPLETION_PERCENTAGE: 0,
  ALLOCATION_PERCENTAGE: 0,
  STANDARD_RATE: 0,
  LABOR_RATE: 0,
  OVERHEAD_RATE: 0,
  UNIT_COST: 0,
  QUANTITY: 1,
  HOURS: 0,
  DRIVER_QUANTITY: 0,
  DRIVER_RATE: 0,
  BUDGET_AMOUNT: 0,
  LEVEL: 0,
  PROCESS_STAGE: 1,
  TOTAL_STAGES: 1,
  UNITS_STARTED: 0,
  UNITS_COMPLETED: 0,
  UNITS_IN_PROCESS: 0,
  EQUIVALENT_UNITS: 0,
  STANDARD_HOURS: 0,
  ACTUAL_USAGE: 0,
  STANDARD_USAGE: 0,
  VARIANCE: 0,
  VARIANCE_PERCENTAGE: 0,
  PRICE_VARIANCE: 0,
  QUANTITY_VARIANCE: 0,
  EFFICIENCY_VARIANCE: 0,
  VOLUME_VARIANCE: 0,
  MIX_VARIANCE: 0,
  TOTAL_COST: 0,
  TOTAL_STANDARD_COST: 0,
  TOTAL_ACTUAL_COST: 0,
  COSTS_TRANSFERRED_OUT: 0,
  COSTS_TRANSFERRED_IN: 0,
  TOTAL_ALLOCATED: 0,
  EXECUTION_TIME: 0,
} as const;

// API Endpoints
export const COSTING_API_ENDPOINTS = {
  COST_CENTERS: '/api/costing/cost-centers',
  ACTIVITIES: '/api/costing/activities',
  COST_DRIVERS: '/api/costing/cost-drivers',
  STANDARD_COSTS: '/api/costing/standard-costs',
  PROCESS_COSTS: '/api/costing/process-costs',
  ALLOCATION_RULES: '/api/costing/allocation-rules',
  VARIANCES: '/api/costing/variances',
  REPORTS: '/api/costing/reports',
  ANALYTICS: '/api/costing/analytics',
  ALLOCATION_JOBS: '/api/costing/allocation-jobs',
  EXPORTS: '/api/costing/exports',
  CALCULATIONS: '/api/costing/calculations',
} as const;

// Permission Constants
export const COSTING_PERMISSIONS = {
  VIEW_COST_CENTERS: 'costing:view_cost_centers',
  CREATE_COST_CENTERS: 'costing:create_cost_centers',
  UPDATE_COST_CENTERS: 'costing:update_cost_centers',
  DELETE_COST_CENTERS: 'costing:delete_cost_centers',
  VIEW_ACTIVITIES: 'costing:view_activities',
  CREATE_ACTIVITIES: 'costing:create_activities',
  UPDATE_ACTIVITIES: 'costing:update_activities',
  DELETE_ACTIVITIES: 'costing:delete_activities',
  VIEW_COST_DRIVERS: 'costing:view_cost_drivers',
  CREATE_COST_DRIVERS: 'costing:create_cost_drivers',
  UPDATE_COST_DRIVERS: 'costing:update_cost_drivers',
  DELETE_COST_DRIVERS: 'costing:delete_cost_drivers',
  VIEW_STANDARD_COSTS: 'costing:view_standard_costs',
  CREATE_STANDARD_COSTS: 'costing:create_standard_costs',
  UPDATE_STANDARD_COSTS: 'costing:update_standard_costs',
  APPROVE_STANDARD_COSTS: 'costing:approve_standard_costs',
  VIEW_PROCESS_COSTS: 'costing:view_process_costs',
  CREATE_PROCESS_COSTS: 'costing:create_process_costs',
  UPDATE_PROCESS_COSTS: 'costing:update_process_costs',
  VIEW_ALLOCATION_RULES: 'costing:view_allocation_rules',
  CREATE_ALLOCATION_RULES: 'costing:create_allocation_rules',
  UPDATE_ALLOCATION_RULES: 'costing:update_allocation_rules',
  DELETE_ALLOCATION_RULES: 'costing:delete_allocation_rules',
  EXECUTE_ALLOCATIONS: 'costing:execute_allocations',
  VIEW_VARIANCES: 'costing:view_variances',
  CREATE_VARIANCES: 'costing:create_variances',
  UPDATE_VARIANCES: 'costing:update_variances',
  INVESTIGATE_VARIANCES: 'costing:investigate_variances',
  VIEW_REPORTS: 'costing:view_reports',
  GENERATE_REPORTS: 'costing:generate_reports',
  EXPORT_DATA: 'costing:export_data',
  VIEW_ANALYTICS: 'costing:view_analytics',
  MANAGE_SETTINGS: 'costing:manage_settings',
} as const;

// Role Constants
export const COSTING_ROLES = {
  COST_ACCOUNTANT: 'cost_accountant',
  COST_MANAGER: 'cost_manager',
  PRODUCTION_MANAGER: 'production_manager',
  FINANCE_MANAGER: 'finance_manager',
  ADMIN: 'admin',
} as const;

// Feature Flags
export const COSTING_FEATURES = {
  ABC_COSTING: 'costing_abc_costing',
  STANDARD_COSTING: 'costing_standard_costing',
  PROCESS_COSTING: 'costing_process_costing',
  VARIANCE_ANALYSIS: 'costing_variance_analysis',
  ALLOCATION_ENGINE: 'costing_allocation_engine',
  COSTING_DASHBOARD: 'costing_dashboard',
  MOBILE_APP: 'costing_mobile_app',
  INTEGRATION_ERP: 'costing_integration_erp',
  INTEGRATION_MES: 'costing_integration_mes',
  REAL_TIME_COSTING: 'costing_real_time_costing',
  ADVANCED_REPORTING: 'costing_advanced_reporting',
} as const;

// Audit Action Constants
export const COSTING_AUDIT_ACTIONS = {
  COST_CENTER_CREATED: 'costing_cost_center_created',
  COST_CENTER_UPDATED: 'costing_cost_center_updated',
  COST_CENTER_DELETED: 'costing_cost_center_deleted',
  ACTIVITY_CREATED: 'costing_activity_created',
  ACTIVITY_UPDATED: 'costing_activity_updated',
  ACTIVITY_DELETED: 'costing_activity_deleted',
  COST_DRIVER_CREATED: 'costing_cost_driver_created',
  COST_DRIVER_UPDATED: 'costing_cost_driver_updated',
  COST_DRIVER_DELETED: 'costing_cost_driver_deleted',
  STANDARD_COST_CREATED: 'costing_standard_cost_created',
  STANDARD_COST_UPDATED: 'costing_standard_cost_updated',
  STANDARD_COST_APPROVED: 'costing_standard_cost_approved',
  PROCESS_COST_CREATED: 'costing_process_cost_created',
  PROCESS_COST_UPDATED: 'costing_process_cost_updated',
  ALLOCATION_RULE_CREATED: 'costing_allocation_rule_created',
  ALLOCATION_RULE_UPDATED: 'costing_allocation_rule_updated',
  ALLOCATION_RULE_DELETED: 'costing_allocation_rule_deleted',
  ALLOCATION_EXECUTED: 'costing_allocation_executed',
  VARIANCE_CREATED: 'costing_variance_created',
  VARIANCE_UPDATED: 'costing_variance_updated',
  VARIANCE_INVESTIGATED: 'costing_variance_investigated',
  REPORT_GENERATED: 'costing_report_generated',
  DATA_EXPORTED: 'costing_data_exported',
} as const; 