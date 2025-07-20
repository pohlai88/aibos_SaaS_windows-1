// SHRM Validation - Enterprise Grade Input Validation
// Using Zod for comprehensive type-safe validation

import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
export const dateSchema = z.string().datetime('Invalid date format');
export const currencySchema = z.enum(['MYR', 'USD', 'SGD', 'EUR', 'GBP']);
export const statusSchema = z.enum(['active', 'inactive', 'terminated', 'probation', 'contract']);

// Employee validation schema
export const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  position: z.string().min(1, 'Position is required').max(100, 'Position too long'),
  department: z.string().min(1, 'Department is required').max(100, 'Department too long'),
  employment_status: statusSchema,
  hire_date: dateSchema,
  termination_date: dateSchema.optional(),
  salary: z.number().positive('Salary must be positive').max(1000000, 'Salary too high'),
  currency: currencySchema,
  manager_id: z.string().uuid().optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
  
  // Enhanced fields for SEA compliance
  employee_id: z.string().optional(),
  national_id: z.string().optional(),
  passport_number: z.string().optional(),
  nationality: z.string().optional(),
  date_of_birth: dateSchema.optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  
  // Address information
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  
  // Emergency contact
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: phoneSchema.optional(),
  emergency_contact_relationship: z.string().optional(),
  
  // Bank details for payroll
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_swift_code: z.string().optional(),
  
  // Tax information
  tax_id: z.string().optional(),
  tax_exemption_status: z.boolean().default(false),
  
  // Benefits and allowances
  benefits: z.record(z.any()).default({}),
  allowances: z.record(z.any()).default({}),
  
  // Performance and reviews
  performance_rating: z.number().min(0).max(5).optional(),
  last_review_date: dateSchema.optional(),
  next_review_date: dateSchema.optional(),
  
  // Leave management
  annual_leave_balance: z.number().min(0).default(0),
  sick_leave_balance: z.number().min(0).default(0),
  other_leave_balance: z.number().min(0).default(0),
  
  // Compliance and documentation
  documents: z.array(z.any()).default([]),
  certifications: z.array(z.any()).default([]),
  training_records: z.array(z.any()).default([]),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// Payroll validation schema
export const payrollSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  pay_period_start: dateSchema,
  pay_period_end: dateSchema,
  pay_date: dateSchema,
  
  // Basic pay
  basic_salary: z.number().positive('Basic salary must be positive'),
  gross_pay: z.number().positive('Gross pay must be positive'),
  net_pay: z.number().positive('Net pay must be positive'),
  currency: currencySchema,
  
  // Allowances
  allowances: z.record(z.any()).default({}),
  allowance_total: z.number().min(0).default(0),
  
  // Deductions
  deductions: z.record(z.any()).default({}),
  deduction_total: z.number().min(0).default(0),
  
  // Tax calculations
  tax_amount: z.number().min(0).default(0),
  social_security_amount: z.number().min(0).default(0),
  other_taxes: z.number().min(0).default(0),
  
  // Overtime and bonuses
  overtime_hours: z.number().min(0).default(0),
  overtime_rate: z.number().min(0).default(0),
  overtime_amount: z.number().min(0).default(0),
  bonus_amount: z.number().min(0).default(0),
  
  // Leave and absences
  leave_days: z.number().min(0).default(0),
  absence_days: z.number().min(0).default(0),
  leave_deduction: z.number().min(0).default(0),
  
  // Status and processing
  status: z.enum(['pending', 'processed', 'paid', 'cancelled']).default('pending'),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_reference: z.string().optional(),
  
  // Compliance
  tax_year: z.number().int().positive('Tax year must be positive'),
  tax_period: z.string().optional(),
  compliance_verified: z.boolean().default(false),
  
  // Metadata
  notes: z.string().optional(),
});

// Leave request validation schema
export const leaveRequestSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  leave_type: z.enum(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other']),
  start_date: dateSchema,
  end_date: dateSchema,
  days_requested: z.number().int().positive('Days requested must be positive'),
  reason: z.string().optional(),
  
  // Approval workflow
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  requested_by: z.string().uuid('Invalid requester ID'),
  approved_by: z.string().uuid().optional(),
  approved_at: dateSchema.optional(),
  rejection_reason: z.string().optional(),
  
  // Documentation
  supporting_documents: z.array(z.any()).default([]),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

// Performance review validation schema
export const performanceReviewSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  review_period_start: dateSchema,
  review_period_end: dateSchema,
  review_date: dateSchema,
  
  // Review details
  reviewer_id: z.string().uuid('Invalid reviewer ID'),
  review_type: z.enum(['probation', 'annual', 'promotion', 'special']),
  
  // Performance ratings
  overall_rating: z.number().min(0).max(5).optional(),
  technical_skills: z.number().min(0).max(5).optional(),
  communication: z.number().min(0).max(5).optional(),
  teamwork: z.number().min(0).max(5).optional(),
  leadership: z.number().min(0).max(5).optional(),
  problem_solving: z.number().min(0).max(5).optional(),
  
  // Review content
  achievements: z.string().optional(),
  areas_for_improvement: z.string().optional(),
  goals: z.string().optional(),
  comments: z.string().optional(),
  
  // Outcomes
  salary_increase: z.number().min(0).default(0),
  promotion_position: z.string().optional(),
  next_review_date: dateSchema.optional(),
  
  // Status
  status: z.enum(['draft', 'submitted', 'approved', 'completed']).default('draft'),
});

// Department validation schema
export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100, 'Department name too long'),
  code: z.string().optional(),
  description: z.string().optional(),
  manager_id: z.string().uuid().optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
  
  // Budget and planning
  budget: z.number().positive().optional(),
  currency: currencySchema,
  headcount_limit: z.number().int().positive().optional(),
  current_headcount: z.number().int().min(0).default(0),
  
  // Location and contact
  location: z.string().optional(),
  contact_email: emailSchema.optional(),
  contact_phone: phoneSchema.optional(),
  
  // Status
  status: z.enum(['active', 'inactive', 'planned']).default('active'),
});

// Position validation schema
export const positionSchema = z.object({
  title: z.string().min(1, 'Position title is required').max(100, 'Position title too long'),
  department_id: z.string().uuid().optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
  
  // Job details
  job_description: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  
  // Compensation
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
  currency: currencySchema,
  benefits: z.record(z.any()).default({}),
  
  // Classification
  level: z.number().int().positive().optional(),
  category: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern', 'freelance']),
  
  // Status
  status: z.enum(['active', 'inactive', 'closed']).default('active'),
}).refine((data) => {
  if (data.salary_min && data.salary_max) {
    return data.salary_max >= data.salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max'],
});

// Attendance validation schema
export const attendanceSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  date: dateSchema,
  clock_in_time: dateSchema.optional(),
  clock_out_time: dateSchema.optional(),
  break_start_time: dateSchema.optional(),
  break_end_time: dateSchema.optional(),
  total_hours: z.number().min(0).max(24, 'Total hours cannot exceed 24'),
  overtime_hours: z.number().min(0).default(0),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'leave']),
  location: z.string().optional(),
  device_id: z.string().optional(),
  notes: z.string().optional(),
});

// Employment contract validation schema
export const employmentContractSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  contract_number: z.string().min(1, 'Contract number is required'),
  contract_type: z.enum(['permanent', 'fixed_term', 'probation', 'contractor', 'intern']),
  start_date: dateSchema,
  end_date: dateSchema.optional(),
  probation_period_months: z.number().int().min(0).default(0),
  probation_end_date: dateSchema.optional(),
  notice_period_days: z.number().int().min(0).default(30),
  salary: z.number().positive('Salary must be positive'),
  currency: currencySchema,
  benefits: z.record(z.any()).default({}),
  terms_conditions: z.string().min(1, 'Terms and conditions are required'),
  status: z.enum(['active', 'expired', 'terminated', 'probation']).default('active'),
  signed_by_employee: z.boolean().default(false),
  signed_by_employer: z.boolean().default(false),
  signed_date: dateSchema.optional(),
});

// Statutory report validation schema
export const statutoryReportSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  report_type: z.enum(['EPF', 'SOCSO', 'EIS', 'PCB', 'CP204', 'CP500', 'EA_FORM', 'OTHER']),
  reporting_period: z.string().min(1, 'Reporting period is required'),
  due_date: dateSchema,
  submission_date: dateSchema.optional(),
  status: z.enum(['pending', 'submitted', 'approved', 'rejected']).default('pending'),
  file_path: z.string().optional(),
  amount: z.number().min(0).default(0),
  currency: currencySchema,
  employee_count: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

// Notification validation schema
export const notificationSchema = z.object({
  recipient_id: z.string().uuid('Invalid recipient ID'),
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  category: z.enum(['payroll', 'leave', 'performance', 'compliance', 'system', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'read']).default('pending'),
  scheduled_at: dateSchema.optional(),
  sent_at: dateSchema.optional(),
  read_at: dateSchema.optional(),
  metadata: z.record(z.any()).default({}),
});

// Filter validation schemas
export const employeeFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  position: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const payrollFiltersSchema = z.object({
  employee_id: z.string().uuid().optional(),
  pay_period_start: dateSchema.optional(),
  pay_period_end: dateSchema.optional(),
  status: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const leaveFiltersSchema = z.object({
  employee_id: z.string().uuid().optional(),
  status: z.string().optional(),
  leave_type: z.string().optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Export all schemas
export const SHRMValidationSchemas = {
  employee: employeeSchema,
  payroll: payrollSchema,
  leaveRequest: leaveRequestSchema,
  performanceReview: performanceReviewSchema,
  department: departmentSchema,
  position: positionSchema,
  attendance: attendanceSchema,
  employmentContract: employmentContractSchema,
  statutoryReport: statutoryReportSchema,
  notification: notificationSchema,
  employeeFilters: employeeFiltersSchema,
  payrollFilters: payrollFiltersSchema,
  leaveFilters: leaveFiltersSchema,
};

// Validation helper functions
export const validateEmployee = (data: unknown) => employeeSchema.parse(data);
export const validatePayroll = (data: unknown) => payrollSchema.parse(data);
export const validateLeaveRequest = (data: unknown) => leaveRequestSchema.parse(data);
export const validatePerformanceReview = (data: unknown) => performanceReviewSchema.parse(data);
export const validateDepartment = (data: unknown) => departmentSchema.parse(data);
export const validatePosition = (data: unknown) => positionSchema.parse(data);
export const validateAttendance = (data: unknown) => attendanceSchema.parse(data);
export const validateEmploymentContract = (data: unknown) => employmentContractSchema.parse(data);
export const validateStatutoryReport = (data: unknown) => statutoryReportSchema.parse(data);
export const validateNotification = (data: unknown) => notificationSchema.parse(data);

// Safe validation functions that return errors instead of throwing
export const safeValidateEmployee = (data: unknown) => {
  try {
    return { success: true, data: employeeSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidatePayroll = (data: unknown) => {
  try {
    return { success: true, data: payrollSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateLeaveRequest = (data: unknown) => {
  try {
    return { success: true, data: leaveRequestSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
}; 