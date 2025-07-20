// SHRM Validation Service - Enterprise Grade Validation Logic
// Following isolation standards with comprehensive validation

import { 
  employeeSchema, 
  payrollSchema, 
  leaveRequestSchema, 
  performanceReviewSchema,
  departmentSchema,
  positionSchema,
  attendanceSchema,
  employmentContractSchema,
  statutoryReportSchema,
  notificationSchema,
  safeValidateEmployee,
  safeValidatePayroll,
  safeValidateLeaveRequest
} from '../validation';
import { 
  ERROR_MESSAGES,
  VALIDATION,
  CURRENCIES,
  EMPLOYMENT_STATUS,
  LEAVE_TYPES,
  PAYROLL_STATUS
} from '../constants';
import type { 
  Employee, 
  PayrollRecord, 
  LeaveRequest, 
  PerformanceReview,
  Department,
  Position,
  AttendanceRecord,
  EmploymentContract,
  StatutoryReport,
  Notification
} from '../types';

export class SHRMValidationService {
  
  // Employee Validation
  static validateEmployee(data: unknown): { success: boolean; data?: Employee; error?: string } {
    return safeValidateEmployee(data);
  }

  static validateEmployeeForm(data: Partial<Employee>): { success: boolean; data?: Employee; error?: string } {
    // Additional business logic validation
    const validation = safeValidateEmployee(data);
    
    if (!validation.success) {
      return validation;
    }

    // Business rule validations
    const businessValidation = this.validateEmployeeBusinessRules(data);
    if (!businessValidation.success) {
      return businessValidation;
    }

    return validation;
  }

  private static validateEmployeeBusinessRules(data: Partial<Employee>): { success: boolean; error?: string } {
    // Salary validation
    if (data.salary !== undefined) {
      if (data.salary < VALIDATION.MIN_SALARY) {
        return { success: false, error: 'Salary must be greater than 0' };
      }
      if (data.salary > VALIDATION.MAX_SALARY) {
        return { success: false, error: 'Salary exceeds maximum allowed amount' };
      }
    }

    // Email uniqueness (would check database in real implementation)
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, error: ERROR_MESSAGES.INVALID_EMAIL };
      }
    }

    // Phone number validation
    if (data.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(data.phone)) {
        return { success: false, error: ERROR_MESSAGES.INVALID_PHONE };
      }
    }

    // Date validations
    if (data.hire_date && data.termination_date) {
      const hireDate = new Date(data.hire_date);
      const terminationDate = new Date(data.termination_date);
      
      if (terminationDate <= hireDate) {
        return { success: false, error: 'Termination date must be after hire date' };
      }
    }

    // National ID validation (Malaysian format)
    if (data.national_id) {
      const nationalIdRegex = /^\d{6}-\d{2}-\d{4}$/;
      if (!nationalIdRegex.test(data.national_id)) {
        return { success: false, error: 'Invalid national ID format (YYYYMM-DD-XXXX)' };
      }
    }

    return { success: true };
  }

  // Payroll Validation
  static validatePayroll(data: unknown): { success: boolean; data?: PayrollRecord; error?: string } {
    return safeValidatePayroll(data);
  }

  static validatePayrollCalculation(data: Partial<PayrollRecord>): { success: boolean; error?: string } {
    // Validate basic calculations
    if (data.basic_salary !== undefined && data.basic_salary < 0) {
      return { success: false, error: 'Basic salary cannot be negative' };
    }

    if (data.gross_pay !== undefined && data.net_pay !== undefined) {
      if (data.net_pay > data.gross_pay) {
        return { success: false, error: 'Net pay cannot exceed gross pay' };
      }
    }

    // Validate allowances
    if (data.allowances) {
      const allowanceTotal = Object.values(data.allowances).reduce((sum, value) => sum + (Number(value) || 0), 0);
      if (data.allowance_total !== undefined && Math.abs(allowanceTotal - data.allowance_total) > 0.01) {
        return { success: false, error: 'Allowance total calculation mismatch' };
      }
    }

    // Validate deductions
    if (data.deductions) {
      const deductionTotal = Object.values(data.deductions).reduce((sum, value) => sum + (Number(value) || 0), 0);
      if (data.deduction_total !== undefined && Math.abs(deductionTotal - data.deduction_total) > 0.01) {
        return { success: false, error: 'Deduction total calculation mismatch' };
      }
    }

    // Validate overtime
    if (data.overtime_hours !== undefined && data.overtime_rate !== undefined) {
      const calculatedOvertime = data.overtime_hours * data.overtime_rate;
      if (data.overtime_amount !== undefined && Math.abs(calculatedOvertime - data.overtime_amount) > 0.01) {
        return { success: false, error: 'Overtime amount calculation mismatch' };
      }
    }

    return { success: true };
  }

  // Leave Request Validation
  static validateLeaveRequest(data: unknown): { success: boolean; data?: LeaveRequest; error?: string } {
    return safeValidateLeaveRequest(data);
  }

  static validateLeaveRequestBusinessRules(data: Partial<LeaveRequest>): { success: boolean; error?: string } {
    // Date validations
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (endDate < startDate) {
        return { success: false, error: ERROR_MESSAGES.END_DATE_AFTER_START };
      }

      // Check if dates are in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        return { success: false, error: 'Start date cannot be in the past' };
      }
    }

    // Days validation
    if (data.days_requested !== undefined) {
      if (data.days_requested < VALIDATION.MIN_LEAVE_DAYS) {
        return { success: false, error: 'Days requested must be at least 0.5' };
      }
      if (data.days_requested > VALIDATION.MAX_LEAVE_DAYS) {
        return { success: false, error: 'Days requested cannot exceed 365 days' };
      }
    }

    // Leave type specific validations
    if (data.leave_type) {
      switch (data.leave_type) {
        case 'maternity':
          if (data.days_requested && data.days_requested > 90) {
            return { success: false, error: 'Maternity leave cannot exceed 90 days' };
          }
          break;
        case 'paternity':
          if (data.days_requested && data.days_requested > 7) {
            return { success: false, error: 'Paternity leave cannot exceed 7 days' };
          }
          break;
        case 'sick':
          if (data.days_requested && data.days_requested > 60) {
            return { success: false, error: 'Sick leave cannot exceed 60 days' };
          }
          break;
      }
    }

    return { success: true };
  }

  // Performance Review Validation
  static validatePerformanceReview(data: Partial<PerformanceReview>): { success: boolean; error?: string } {
    try {
      performanceReviewSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.overall_rating !== undefined) {
      if (data.overall_rating < VALIDATION.MIN_RATING || data.overall_rating > VALIDATION.MAX_RATING) {
        return { success: false, error: ERROR_MESSAGES.INVALID_RATING };
      }
    }

    // Date validations
    if (data.review_period_start && data.review_period_end) {
      const startDate = new Date(data.review_period_start);
      const endDate = new Date(data.review_period_end);
      
      if (endDate < startDate) {
        return { success: false, error: 'Review period end must be after start' };
      }
    }

    return { success: true };
  }

  // Department Validation
  static validateDepartment(data: Partial<Department>): { success: boolean; error?: string } {
    try {
      departmentSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.budget !== undefined && data.budget < 0) {
      return { success: false, error: 'Department budget cannot be negative' };
    }

    if (data.headcount_limit !== undefined && data.current_headcount !== undefined) {
      if (data.current_headcount > data.headcount_limit) {
        return { success: false, error: 'Current headcount cannot exceed limit' };
      }
    }

    return { success: true };
  }

  // Position Validation
  static validatePosition(data: Partial<Position>): { success: boolean; error?: string } {
    try {
      positionSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.salary_min !== undefined && data.salary_max !== undefined) {
      if (data.salary_min > data.salary_max) {
        return { success: false, error: 'Minimum salary cannot exceed maximum salary' };
      }
    }

    return { success: true };
  }

  // Attendance Validation
  static validateAttendance(data: Partial<AttendanceRecord>): { success: boolean; error?: string } {
    try {
      attendanceSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.total_hours !== undefined) {
      if (data.total_hours < VALIDATION.MIN_HOURS || data.total_hours > VALIDATION.MAX_HOURS) {
        return { success: false, error: 'Total hours must be between 0 and 24' };
      }
    }

    if (data.overtime_hours !== undefined && data.overtime_hours < 0) {
      return { success: false, error: 'Overtime hours cannot be negative' };
    }

    // Time validations
    if (data.clock_in_time && data.clock_out_time) {
      const clockIn = new Date(data.clock_in_time);
      const clockOut = new Date(data.clock_out_time);
      
      if (clockOut <= clockIn) {
        return { success: false, error: 'Clock out time must be after clock in time' };
      }
    }

    return { success: true };
  }

  // Employment Contract Validation
  static validateEmploymentContract(data: Partial<EmploymentContract>): { success: boolean; error?: string } {
    try {
      employmentContractSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (endDate <= startDate) {
        return { success: false, error: 'Contract end date must be after start date' };
      }
    }

    if (data.salary !== undefined && data.salary < 0) {
      return { success: false, error: 'Contract salary cannot be negative' };
    }

    if (data.notice_period_days !== undefined && data.notice_period_days < 0) {
      return { success: false, error: 'Notice period cannot be negative' };
    }

    return { success: true };
  }

  // Statutory Report Validation
  static validateStatutoryReport(data: Partial<StatutoryReport>): { success: boolean; error?: string } {
    try {
      statutoryReportSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.amount !== undefined && data.amount < 0) {
      return { success: false, error: 'Report amount cannot be negative' };
    }

    if (data.employee_count !== undefined && data.employee_count < 0) {
      return { success: false, error: 'Employee count cannot be negative' };
    }

    if (data.due_date && data.submission_date) {
      const dueDate = new Date(data.due_date);
      const submissionDate = new Date(data.submission_date);
      
      if (submissionDate > dueDate) {
        return { success: false, error: 'Submission date cannot be after due date' };
      }
    }

    return { success: true };
  }

  // Notification Validation
  static validateNotification(data: Partial<Notification>): { success: boolean; error?: string } {
    try {
      notificationSchema.parse(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }

    // Business rule validations
    if (data.title && data.title.length > 200) {
      return { success: false, error: 'Notification title too long' };
    }

    if (data.message && data.message.length > 1000) {
      return { success: false, error: 'Notification message too long' };
    }

    if (data.scheduled_at && data.sent_at) {
      const scheduledAt = new Date(data.scheduled_at);
      const sentAt = new Date(data.sent_at);
      
      if (sentAt < scheduledAt) {
        return { success: false, error: 'Sent time cannot be before scheduled time' };
      }
    }

    return { success: true };
  }

  // Bulk Validation
  static validateBulkEmployees(employees: Partial<Employee>[]): {
    valid: Employee[];
    invalid: Array<{ data: Partial<Employee>; error: string }>;
  } {
    const valid: Employee[] = [];
    const invalid: Array<{ data: Partial<Employee>; error: string }> = [];

    employees.forEach((employee) => {
      const validation = this.validateEmployeeForm(employee);
      if (validation.success && validation.data) {
        valid.push(validation.data);
      } else {
        invalid.push({ data: employee, error: validation.error || 'Unknown validation error' });
      }
    });

    return { valid, invalid };
  }

  static validateBulkPayroll(payrollRecords: Partial<PayrollRecord>[]): {
    valid: PayrollRecord[];
    invalid: Array<{ data: Partial<PayrollRecord>; error: string }>;
  } {
    const valid: PayrollRecord[] = [];
    const invalid: Array<{ data: Partial<PayrollRecord>; error: string }> = [];

    payrollRecords.forEach((payroll) => {
      const validation = this.validatePayroll(payroll);
      if (validation.success && validation.data) {
        valid.push(validation.data);
      } else {
        invalid.push({ data: payroll, error: validation.error || 'Unknown validation error' });
      }
    });

    return { valid, invalid };
  }

  // Custom Validation Rules
  static validateEmailUniqueness(email: string, existingEmails: string[]): { success: boolean; error?: string } {
    if (existingEmails.includes(email.toLowerCase())) {
      return { success: false, error: 'Email address already exists' };
    }
    return { success: true };
  }

  static validatePhoneNumber(phone: string): { success: boolean; error?: string } {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return { success: false, error: ERROR_MESSAGES.INVALID_PHONE };
    }
    return { success: true };
  }

  static validateNationalId(nationalId: string): { success: boolean; error?: string } {
    const nationalIdRegex = /^\d{6}-\d{2}-\d{4}$/;
    if (!nationalIdRegex.test(nationalId)) {
      return { success: false, error: 'Invalid national ID format (YYYYMM-DD-XXXX)' };
    }
    return { success: true };
  }

  static validateSalaryRange(salary: number, minSalary?: number, maxSalary?: number): { success: boolean; error?: string } {
    if (minSalary !== undefined && salary < minSalary) {
      return { success: false, error: `Salary must be at least ${minSalary}` };
    }
    if (maxSalary !== undefined && salary > maxSalary) {
      return { success: false, error: `Salary cannot exceed ${maxSalary}` };
    }
    return { success: true };
  }

  static validateDateRange(startDate: string, endDate: string): { success: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return { success: false, error: ERROR_MESSAGES.END_DATE_AFTER_START };
    }
    return { success: true };
  }

  static validateWorkingDays(startDate: string, endDate: string, maxDays: number): { success: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    if (workingDays > maxDays) {
      return { success: false, error: `Requested period exceeds maximum ${maxDays} working days` };
    }
    return { success: true };
  }
} 