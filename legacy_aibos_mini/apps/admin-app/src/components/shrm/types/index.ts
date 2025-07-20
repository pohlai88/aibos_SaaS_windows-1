// SHRM Types - Enterprise Grade Type Definitions
// Following isolation standards with comprehensive type safety

// Core Employee Types
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'probation' | 'contract';
  hire_date: string;
  termination_date?: string;
  salary: number;
  currency: string;
  manager_id?: string;
  organization_id: string;
  
  // Enhanced fields for SEA compliance
  employee_id?: string;
  national_id?: string;
  passport_number?: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  
  // Address information
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Bank details for payroll
  bank_name?: string;
  bank_account_number?: string;
  bank_swift_code?: string;
  
  // Tax information
  tax_id?: string;
  tax_exemption_status: boolean;
  
  // Benefits and allowances
  benefits: Record<string, any>;
  allowances: Record<string, any>;
  
  // Performance and reviews
  performance_rating?: number;
  last_review_date?: string;
  next_review_date?: string;
  
  // Leave management
  annual_leave_balance: number;
  sick_leave_balance: number;
  other_leave_balance: number;
  
  // Compliance and documentation
  documents: any[];
  certifications: any[];
  training_records: any[];
  
  // Metadata
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Payroll Types
export interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  
  // Basic pay
  basic_salary: number;
  gross_pay: number;
  net_pay: number;
  currency: string;
  
  // Allowances
  allowances: Record<string, any>;
  allowance_total: number;
  
  // Deductions
  deductions: Record<string, any>;
  deduction_total: number;
  
  // Tax calculations
  tax_amount: number;
  social_security_amount: number;
  other_taxes: number;
  
  // Overtime and bonuses
  overtime_hours: number;
  overtime_rate: number;
  overtime_amount: number;
  bonus_amount: number;
  
  // Leave and absences
  leave_days: number;
  absence_days: number;
  leave_deduction: number;
  
  // Status and processing
  status: 'pending' | 'processed' | 'paid' | 'cancelled';
  payment_method: string;
  payment_reference?: string;
  
  // Compliance
  tax_year: number;
  tax_period?: string;
  compliance_verified: boolean;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  processed_by?: string;
  processed_at?: string;
}

// Leave Management Types
export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  
  // Approval workflow
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  // Documentation
  supporting_documents: any[];
  
  created_at: string;
  updated_at: string;
}

// Performance Management Types
export interface PerformanceReview {
  id: string;
  employee_id: string;
  review_period_start: string;
  review_period_end: string;
  review_date: string;
  
  // Review details
  reviewer_id: string;
  review_type: 'probation' | 'annual' | 'promotion' | 'special';
  
  // Performance ratings
  overall_rating?: number;
  technical_skills?: number;
  communication?: number;
  teamwork?: number;
  leadership?: number;
  problem_solving?: number;
  
  // Review content
  achievements?: string;
  areas_for_improvement?: string;
  goals?: string;
  comments?: string;
  
  // Outcomes
  salary_increase: number;
  promotion_position?: string;
  next_review_date?: string;
  
  // Status
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  
  created_at: string;
  updated_at: string;
}

// Department and Position Types
export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  manager_id?: string;
  organization_id: string;
  
  // Budget and planning
  budget?: number;
  currency: string;
  headcount_limit?: number;
  current_headcount: number;
  
  // Location and contact
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Status
  status: 'active' | 'inactive' | 'planned';
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface Position {
  id: string;
  title: string;
  department_id?: string;
  organization_id: string;
  
  // Job details
  job_description?: string;
  requirements?: string;
  responsibilities?: string;
  
  // Compensation
  salary_min?: number;
  salary_max?: number;
  currency: string;
  benefits: Record<string, any>;
  
  // Classification
  level?: number;
  category?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance';
  
  // Status
  status: 'active' | 'inactive' | 'closed';
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in_time?: string;
  clock_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  total_hours: number;
  overtime_hours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  location?: string;
  device_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Contract Management Types
export interface EmploymentContract {
  id: string;
  employee_id: string;
  contract_number: string;
  contract_type: 'permanent' | 'fixed_term' | 'probation' | 'contractor' | 'intern';
  start_date: string;
  end_date?: string;
  probation_period_months: number;
  probation_end_date?: string;
  notice_period_days: number;
  salary: number;
  currency: string;
  benefits: Record<string, any>;
  terms_conditions: string;
  status: 'active' | 'expired' | 'terminated' | 'probation';
  signed_by_employee: boolean;
  signed_by_employer: boolean;
  signed_date?: string;
  created_at: string;
  updated_at: string;
}

// Compliance Types
export interface StatutoryReport {
  id: string;
  organization_id: string;
  report_type: 'EPF' | 'SOCSO' | 'EIS' | 'PCB' | 'CP204' | 'CP500' | 'EA_FORM' | 'OTHER';
  reporting_period: string;
  due_date: string;
  submission_date?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  file_path?: string;
  amount: number;
  currency: string;
  employee_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  recipient_id: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  title: string;
  message: string;
  category: 'payroll' | 'leave' | 'performance' | 'compliance' | 'system' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Document Types
export interface DocumentTemplate {
  id: string;
  organization_id: string;
  name: string;
  category: 'employment_contract' | 'offer_letter' | 'termination_letter' | 'warning_letter' | 'certificate' | 'other';
  template_content: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  employee_id: string;
  template_id: string;
  document_type: string;
  file_path: string;
  file_size: number;
  status: 'draft' | 'generated' | 'signed' | 'archived';
  signed_by_employee: boolean;
  signed_by_employer: boolean;
  signature_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

// Statistics Types
export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  turnoverRate: number;
  averageSalary: number;
  departments: number;
  byDepartment: Record<string, number>;
  byStatus: Record<string, number>;
  byPosition: Record<string, number>;
}

export interface PayrollStats {
  totalPayroll: number;
  averageSalary: number;
  totalTaxPaid: number;
  totalBenefits: number;
  byMonth: Record<string, number>;
  byDepartment: Record<string, number>;
}

// Form Types
export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'probation' | 'contract';
  hire_date: string;
  salary: number;
  currency: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_name?: string;
  bank_account_number?: string;
  tax_id?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface EmployeeFilters {
  searchTerm?: string;
  department?: string;
  status?: string;
  position?: string;
  organization_id?: string;
  page?: number;
  limit?: number;
}

export interface PayrollFilters {
  employee_id?: string;
  pay_period_start?: string;
  pay_period_end?: string;
  status?: string;
  organization_id?: string;
  page?: number;
  limit?: number;
}

export interface LeaveFilters {
  employee_id?: string;
  status?: string;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
} 