// SHRM Constants - Enterprise Grade Configuration
// Following isolation standards with comprehensive constants

// Employment Status Constants
export const EMPLOYMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
  PROBATION: 'probation',
  CONTRACT: 'contract',
} as const;

export const EMPLOYMENT_STATUS_LABELS = {
  [EMPLOYMENT_STATUS.ACTIVE]: 'Active',
  [EMPLOYMENT_STATUS.INACTIVE]: 'Inactive',
  [EMPLOYMENT_STATUS.TERMINATED]: 'Terminated',
  [EMPLOYMENT_STATUS.PROBATION]: 'Probation',
  [EMPLOYMENT_STATUS.CONTRACT]: 'Contract',
} as const;

// Leave Types Constants
export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  UNPAID: 'unpaid',
  OTHER: 'other',
} as const;

export const LEAVE_TYPE_LABELS = {
  [LEAVE_TYPES.ANNUAL]: 'Annual Leave',
  [LEAVE_TYPES.SICK]: 'Sick Leave',
  [LEAVE_TYPES.MATERNITY]: 'Maternity Leave',
  [LEAVE_TYPES.PATERNITY]: 'Paternity Leave',
  [LEAVE_TYPES.UNPAID]: 'Unpaid Leave',
  [LEAVE_TYPES.OTHER]: 'Other Leave',
} as const;

// Leave Status Constants
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export const LEAVE_STATUS_LABELS = {
  [LEAVE_STATUS.PENDING]: 'Pending',
  [LEAVE_STATUS.APPROVED]: 'Approved',
  [LEAVE_STATUS.REJECTED]: 'Rejected',
  [LEAVE_STATUS.CANCELLED]: 'Cancelled',
} as const;

// Payroll Status Constants
export const PAYROLL_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export const PAYROLL_STATUS_LABELS = {
  [PAYROLL_STATUS.PENDING]: 'Pending',
  [PAYROLL_STATUS.PROCESSED]: 'Processed',
  [PAYROLL_STATUS.PAID]: 'Paid',
  [PAYROLL_STATUS.CANCELLED]: 'Cancelled',
} as const;

// Performance Review Types
export const REVIEW_TYPES = {
  PROBATION: 'probation',
  ANNUAL: 'annual',
  PROMOTION: 'promotion',
  SPECIAL: 'special',
} as const;

export const REVIEW_TYPE_LABELS = {
  [REVIEW_TYPES.PROBATION]: 'Probation Review',
  [REVIEW_TYPES.ANNUAL]: 'Annual Review',
  [REVIEW_TYPES.PROMOTION]: 'Promotion Review',
  [REVIEW_TYPES.SPECIAL]: 'Special Review',
} as const;

// Review Status Constants
export const REVIEW_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  COMPLETED: 'completed',
} as const;

export const REVIEW_STATUS_LABELS = {
  [REVIEW_STATUS.DRAFT]: 'Draft',
  [REVIEW_STATUS.SUBMITTED]: 'Submitted',
  [REVIEW_STATUS.APPROVED]: 'Approved',
  [REVIEW_STATUS.COMPLETED]: 'Completed',
} as const;

// Attendance Status Constants
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
} as const;

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Present',
  [ATTENDANCE_STATUS.ABSENT]: 'Absent',
  [ATTENDANCE_STATUS.LATE]: 'Late',
  [ATTENDANCE_STATUS.HALF_DAY]: 'Half Day',
  [ATTENDANCE_STATUS.LEAVE]: 'Leave',
} as const;

// Contract Types
export const CONTRACT_TYPES = {
  PERMANENT: 'permanent',
  FIXED_TERM: 'fixed_term',
  PROBATION: 'probation',
  CONTRACTOR: 'contractor',
  INTERN: 'intern',
} as const;

export const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPES.PERMANENT]: 'Permanent',
  [CONTRACT_TYPES.FIXED_TERM]: 'Fixed Term',
  [CONTRACT_TYPES.PROBATION]: 'Probation',
  [CONTRACT_TYPES.CONTRACTOR]: 'Contractor',
  [CONTRACT_TYPES.INTERN]: 'Intern',
} as const;

// Contract Status Constants
export const CONTRACT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  PROBATION: 'probation',
} as const;

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.ACTIVE]: 'Active',
  [CONTRACT_STATUS.EXPIRED]: 'Expired',
  [CONTRACT_STATUS.TERMINATED]: 'Terminated',
  [CONTRACT_STATUS.PROBATION]: 'Probation',
} as const;

// Employment Types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern',
  FREELANCE: 'freelance',
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  [EMPLOYMENT_TYPES.FULL_TIME]: 'Full Time',
  [EMPLOYMENT_TYPES.PART_TIME]: 'Part Time',
  [EMPLOYMENT_TYPES.CONTRACT]: 'Contract',
  [EMPLOYMENT_TYPES.INTERN]: 'Intern',
  [EMPLOYMENT_TYPES.FREELANCE]: 'Freelance',
} as const;

// Statutory Report Types
export const STATUTORY_REPORT_TYPES = {
  EPF: 'EPF',
  SOCSO: 'SOCSO',
  EIS: 'EIS',
  PCB: 'PCB',
  CP204: 'CP204',
  CP500: 'CP500',
  EA_FORM: 'EA_FORM',
  OTHER: 'OTHER',
} as const;

export const STATUTORY_REPORT_LABELS = {
  [STATUTORY_REPORT_TYPES.EPF]: 'EPF (Employees Provident Fund)',
  [STATUTORY_REPORT_TYPES.SOCSO]: 'SOCSO (Social Security Organization)',
  [STATUTORY_REPORT_TYPES.EIS]: 'EIS (Employment Insurance System)',
  [STATUTORY_REPORT_TYPES.PCB]: 'PCB (Monthly Tax Deduction)',
  [STATUTORY_REPORT_TYPES.CP204]: 'CP204 (Estimated Tax Payable)',
  [STATUTORY_REPORT_TYPES.CP500]: 'CP500 (Tax Installment)',
  [STATUTORY_REPORT_TYPES.EA_FORM]: 'EA Form (Employment Income)',
  [STATUTORY_REPORT_TYPES.OTHER]: 'Other Reports',
} as const;

// Report Status Constants
export const REPORT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: 'Pending',
  [REPORT_STATUS.SUBMITTED]: 'Submitted',
  [REPORT_STATUS.APPROVED]: 'Approved',
  [REPORT_STATUS.REJECTED]: 'Rejected',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.EMAIL]: 'Email',
  [NOTIFICATION_TYPES.SMS]: 'SMS',
  [NOTIFICATION_TYPES.PUSH]: 'Push Notification',
  [NOTIFICATION_TYPES.IN_APP]: 'In-App Notification',
} as const;

// Notification Categories
export const NOTIFICATION_CATEGORIES = {
  PAYROLL: 'payroll',
  LEAVE: 'leave',
  PERFORMANCE: 'performance',
  COMPLIANCE: 'compliance',
  SYSTEM: 'system',
  OTHER: 'other',
} as const;

export const NOTIFICATION_CATEGORY_LABELS = {
  [NOTIFICATION_CATEGORIES.PAYROLL]: 'Payroll',
  [NOTIFICATION_CATEGORIES.LEAVE]: 'Leave',
  [NOTIFICATION_CATEGORIES.PERFORMANCE]: 'Performance',
  [NOTIFICATION_CATEGORIES.COMPLIANCE]: 'Compliance',
  [NOTIFICATION_CATEGORIES.SYSTEM]: 'System',
  [NOTIFICATION_CATEGORIES.OTHER]: 'Other',
} as const;

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NOTIFICATION_PRIORITY_LABELS = {
  [NOTIFICATION_PRIORITY.LOW]: 'Low',
  [NOTIFICATION_PRIORITY.MEDIUM]: 'Medium',
  [NOTIFICATION_PRIORITY.HIGH]: 'High',
  [NOTIFICATION_PRIORITY.URGENT]: 'Urgent',
} as const;

// Notification Status
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  READ: 'read',
} as const;

export const NOTIFICATION_STATUS_LABELS = {
  [NOTIFICATION_STATUS.PENDING]: 'Pending',
  [NOTIFICATION_STATUS.SENT]: 'Sent',
  [NOTIFICATION_STATUS.DELIVERED]: 'Delivered',
  [NOTIFICATION_STATUS.FAILED]: 'Failed',
  [NOTIFICATION_STATUS.READ]: 'Read',
} as const;

// Document Categories
export const DOCUMENT_CATEGORIES = {
  EMPLOYMENT_CONTRACT: 'employment_contract',
  OFFER_LETTER: 'offer_letter',
  TERMINATION_LETTER: 'termination_letter',
  WARNING_LETTER: 'warning_letter',
  CERTIFICATE: 'certificate',
  OTHER: 'other',
} as const;

export const DOCUMENT_CATEGORY_LABELS = {
  [DOCUMENT_CATEGORIES.EMPLOYMENT_CONTRACT]: 'Employment Contract',
  [DOCUMENT_CATEGORIES.OFFER_LETTER]: 'Offer Letter',
  [DOCUMENT_CATEGORIES.TERMINATION_LETTER]: 'Termination Letter',
  [DOCUMENT_CATEGORIES.WARNING_LETTER]: 'Warning Letter',
  [DOCUMENT_CATEGORIES.CERTIFICATE]: 'Certificate',
  [DOCUMENT_CATEGORIES.OTHER]: 'Other',
} as const;

// Document Status
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  SIGNED: 'signed',
  ARCHIVED: 'archived',
} as const;

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUS.DRAFT]: 'Draft',
  [DOCUMENT_STATUS.GENERATED]: 'Generated',
  [DOCUMENT_STATUS.SIGNED]: 'Signed',
  [DOCUMENT_STATUS.ARCHIVED]: 'Archived',
} as const;

// Currency Constants
export const CURRENCIES = {
  MYR: 'MYR',
  USD: 'USD',
  SGD: 'SGD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export const CURRENCY_LABELS = {
  [CURRENCIES.MYR]: 'Malaysian Ringgit',
  [CURRENCIES.USD]: 'US Dollar',
  [CURRENCIES.SGD]: 'Singapore Dollar',
  [CURRENCIES.EUR]: 'Euro',
  [CURRENCIES.GBP]: 'British Pound',
} as const;

// Gender Constants
export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export const GENDER_LABELS = {
  [GENDERS.MALE]: 'Male',
  [GENDERS.FEMALE]: 'Female',
  [GENDERS.OTHER]: 'Other',
} as const;

// Marital Status Constants
export const MARITAL_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
} as const;

export const MARITAL_STATUS_LABELS = {
  [MARITAL_STATUS.SINGLE]: 'Single',
  [MARITAL_STATUS.MARRIED]: 'Married',
  [MARITAL_STATUS.DIVORCED]: 'Divorced',
  [MARITAL_STATUS.WIDOWED]: 'Widowed',
} as const;

// Department Status
export const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PLANNED: 'planned',
} as const;

export const DEPARTMENT_STATUS_LABELS = {
  [DEPARTMENT_STATUS.ACTIVE]: 'Active',
  [DEPARTMENT_STATUS.INACTIVE]: 'Inactive',
  [DEPARTMENT_STATUS.PLANNED]: 'Planned',
} as const;

// Position Status
export const POSITION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
} as const;

export const POSITION_STATUS_LABELS = {
  [POSITION_STATUS.ACTIVE]: 'Active',
  [POSITION_STATUS.INACTIVE]: 'Inactive',
  [POSITION_STATUS.CLOSED]: 'Closed',
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES: 5,
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_SALARY: 0,
  MAX_SALARY: 1000000,
  MIN_RATING: 0,
  MAX_RATING: 5,
  MIN_LEAVE_DAYS: 0,
  MAX_LEAVE_DAYS: 365,
  MIN_HOURS: 0,
  MAX_HOURS: 24,
} as const;

// API Constants
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Cache Constants
export const CACHE = {
  EMPLOYEE_LIST_TTL: 5 * 60 * 1000, // 5 minutes
  EMPLOYEE_DETAIL_TTL: 10 * 60 * 1000, // 10 minutes
  PAYROLL_DATA_TTL: 2 * 60 * 1000, // 2 minutes
  LEAVE_DATA_TTL: 5 * 60 * 1000, // 5 minutes
  STATS_TTL: 15 * 60 * 1000, // 15 minutes
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_SALARY: 'Salary must be a positive number',
  INVALID_RATING: 'Rating must be between 0 and 5',
  INVALID_LEAVE_DAYS: 'Leave days must be a positive number',
  END_DATE_AFTER_START: 'End date must be after start date',
  MAX_SALARY_EXCEEDED: 'Salary exceeds maximum allowed amount',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
  INVALID_FILE_TYPE: 'File type not allowed',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  EMPLOYEE_CREATED: 'Employee created successfully',
  EMPLOYEE_UPDATED: 'Employee updated successfully',
  EMPLOYEE_DELETED: 'Employee deleted successfully',
  LEAVE_REQUEST_CREATED: 'Leave request created successfully',
  LEAVE_REQUEST_APPROVED: 'Leave request approved successfully',
  LEAVE_REQUEST_REJECTED: 'Leave request rejected successfully',
  PAYROLL_PROCESSED: 'Payroll processed successfully',
  PERFORMANCE_REVIEW_CREATED: 'Performance review created successfully',
  DOCUMENT_GENERATED: 'Document generated successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
} as const;

// Default Values
export const DEFAULTS = {
  CURRENCY: CURRENCIES.MYR,
  EMPLOYMENT_STATUS: EMPLOYMENT_STATUS.ACTIVE,
  LEAVE_BALANCE: 0,
  PERFORMANCE_RATING: 0,
  NOTICE_PERIOD_DAYS: 30,
  PROBATION_PERIOD_MONTHS: 3,
} as const; 