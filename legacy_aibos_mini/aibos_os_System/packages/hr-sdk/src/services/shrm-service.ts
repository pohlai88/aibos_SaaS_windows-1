import { createClient, SupabaseClient } from '@supabase/supabase-js';

// SHRM Types
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

// Enhanced SHRM Types for critical missing features
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

export interface BankTransferFile {
  id: string;
  organization_id: string;
  bank_name: string;
  file_format: 'CIMB' | 'MAYBANK' | 'PUBLIC_BANK' | 'RHB' | 'HONG_LEONG' | 'CUSTOM';
  pay_period_start: string;
  pay_period_end: string;
  total_amount: number;
  employee_count: number;
  file_path?: string;
  status: 'generated' | 'uploaded' | 'processed' | 'failed';
  processing_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

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

export interface LeaveEncashment {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'other';
  days_encashed: number;
  rate_per_day: number;
  total_amount: number;
  currency: string;
  encashment_date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TerminationRecord {
  id: string;
  employee_id: string;
  termination_type: 'resignation' | 'dismissal' | 'retirement' | 'end_of_contract' | 'redundancy';
  termination_date: string;
  last_working_date: string;
  notice_period_served: number;
  severance_pay: number;
  currency: string;
  reason: string;
  exit_interview_conducted: boolean;
  exit_interview_date?: string;
  clearance_completed: boolean;
  clearance_date?: string;
  status: 'pending' | 'approved' | 'completed';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class SHRMService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ========================================
  // EMPLOYEE MANAGEMENT
  // ========================================

  /**
   * Get all employees with optional filters
   */
  async getEmployees(filters?: {
    searchTerm?: string;
    department?: string;
    status?: string;
    position?: string;
    organization_id?: string;
  }): Promise<Employee[]> {
    try {
      let query = this.supabase
        .from('employees')
        .select('*')
        .order('last_name');

      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id);
      }
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('employment_status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      let employees = data || [];

      // Apply search filter if provided
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        employees = employees.filter(emp => 
          emp.first_name.toLowerCase().includes(searchTerm) ||
          emp.last_name.toLowerCase().includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm) ||
          emp.position.toLowerCase().includes(searchTerm)
        );
      }

      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await this.supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    try {
      // Validate required fields
      if (!employeeData.first_name || !employeeData.last_name || !employeeData.email) {
        throw new Error('First name, last name, and email are required');
      }

      // Set default values
      const employee: Employee = {
        id: crypto.randomUUID(),
        first_name: employeeData.first_name!,
        last_name: employeeData.last_name!,
        email: employeeData.email!,
        phone: employeeData.phone,
        position: employeeData.position || 'Employee',
        department: employeeData.department || 'General',
        employment_status: employeeData.employment_status || 'active',
        hire_date: employeeData.hire_date || new Date().toISOString().split('T')[0],
        termination_date: employeeData.termination_date,
        salary: employeeData.salary || 0,
        currency: employeeData.currency || 'USD',
        manager_id: employeeData.manager_id,
        organization_id: employeeData.organization_id!,
        
        // Enhanced fields
        employee_id: employeeData.employee_id,
        national_id: employeeData.national_id,
        passport_number: employeeData.passport_number,
        nationality: employeeData.nationality,
        date_of_birth: employeeData.date_of_birth,
        gender: employeeData.gender,
        marital_status: employeeData.marital_status,
        
        // Address
        address_line1: employeeData.address_line1,
        address_line2: employeeData.address_line2,
        city: employeeData.city,
        state: employeeData.state,
        postal_code: employeeData.postal_code,
        country: employeeData.country,
        
        // Emergency contact
        emergency_contact_name: employeeData.emergency_contact_name,
        emergency_contact_phone: employeeData.emergency_contact_phone,
        emergency_contact_relationship: employeeData.emergency_contact_relationship,
        
        // Bank details
        bank_name: employeeData.bank_name,
        bank_account_number: employeeData.bank_account_number,
        bank_swift_code: employeeData.bank_swift_code,
        
        // Tax information
        tax_id: employeeData.tax_id,
        tax_exemption_status: employeeData.tax_exemption_status || false,
        
        // Benefits and allowances
        benefits: employeeData.benefits || {},
        allowances: employeeData.allowances || {},
        
        // Performance
        performance_rating: employeeData.performance_rating,
        last_review_date: employeeData.last_review_date,
        next_review_date: employeeData.next_review_date,
        
        // Leave management
        annual_leave_balance: employeeData.annual_leave_balance || 0,
        sick_leave_balance: employeeData.sick_leave_balance || 0,
        other_leave_balance: employeeData.other_leave_balance || 0,
        
        // Compliance
        documents: employeeData.documents || [],
        certifications: employeeData.certifications || [],
        training_records: employeeData.training_records || [],
        
        // Metadata
        tags: employeeData.tags || [],
        notes: employeeData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: employeeData.created_by!,
        updated_by: employeeData.updated_by
      };

      const { data, error } = await this.supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
    try {
      const { data, error } = await this.supabase
        .from('employees')
        .update({
          ...employeeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(organization_id?: string): Promise<EmployeeStats> {
    try {
      let query = this.supabase.from('employees').select('*');
      
      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      const { data: employees, error } = await query;
      if (error) throw error;

      const empList = employees || [];

      // Calculate basic stats
      const totalEmployees = empList.length;
      const activeEmployees = empList.filter(emp => emp.employment_status === 'active').length;
      
      // Calculate new hires (last 30 days)
      const newHires = empList.filter(emp => {
        const hireDate = new Date(emp.hire_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return hireDate > thirtyDaysAgo;
      }).length;

      // Calculate average salary
      const avgSalary = empList.length > 0 
        ? empList.reduce((sum, emp) => sum + (emp.salary || 0), 0) / empList.length 
        : 0;

      // Calculate unique departments
      const departments = new Set(empList.map(emp => emp.department)).size;

      // Group by department
      const byDepartment: Record<string, number> = {};
      empList.forEach(emp => {
        byDepartment[emp.department] = (byDepartment[emp.department] || 0) + 1;
      });

      // Group by status
      const byStatus: Record<string, number> = {};
      empList.forEach(emp => {
        byStatus[emp.employment_status] = (byStatus[emp.employment_status] || 0) + 1;
      });

      // Group by position
      const byPosition: Record<string, number> = {};
      empList.forEach(emp => {
        byPosition[emp.position] = (byPosition[emp.position] || 0) + 1;
      });

      return {
        totalEmployees,
        activeEmployees,
        newHires,
        turnoverRate: 2.5, // Mock data - should be calculated from historical data
        averageSalary: avgSalary,
        departments,
        byDepartment,
        byStatus,
        byPosition
      };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw error;
    }
  }

  /**
   * Get departments list
   */
  async getDepartments(organization_id?: string): Promise<Department[]> {
    try {
      let query = this.supabase.from('departments').select('*').order('name');
      
      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  /**
   * Get positions list
   */
  async getPositions(organization_id?: string): Promise<Position[]> {
    try {
      let query = this.supabase.from('positions').select('*').order('title');
      
      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  // ========================================
  // PAYROLL MANAGEMENT
  // ========================================

  /**
   * Get payroll records
   */
  async getPayrollRecords(filters?: {
    employee_id?: string;
    pay_period_start?: string;
    pay_period_end?: string;
    status?: string;
    organization_id?: string;
  }): Promise<PayrollRecord[]> {
    try {
      let query = this.supabase
        .from('payroll_records')
        .select('*')
        .order('pay_period_start', { ascending: false });

      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.pay_period_start) {
        query = query.gte('pay_period_start', filters.pay_period_start);
      }
      if (filters?.pay_period_end) {
        query = query.lte('pay_period_end', filters.pay_period_end);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      throw error;
    }
  }

  /**
   * Calculate payroll for employee
   */
  async calculatePayroll(employeeId: string, payPeriodStart: string, payPeriodEnd: string): Promise<PayrollRecord> {
    try {
      // Get employee details
      const employee = await this.getEmployeeById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Basic salary calculation
      const basicSalary = employee.salary;
      
      // Calculate allowances
      const allowances = employee.allowances || {};
      const allowanceTotal = Object.values(allowances).reduce((sum: number, value: any) => sum + (value.amount || 0), 0);
      
      // Calculate deductions
      const deductions = employee.benefits || {};
      const deductionTotal = Object.values(deductions).reduce((sum: number, value: any) => sum + (value.amount || 0), 0);
      
      // Calculate taxes (simplified - should integrate with tax service)
      const taxAmount = basicSalary * 0.15; // 15% tax rate
      const socialSecurityAmount = basicSalary * 0.05; // 5% social security
      const otherTaxes = 0;
      
      // Calculate gross and net pay
      const grossPay = basicSalary + allowanceTotal;
      const netPay = grossPay - deductionTotal - taxAmount - socialSecurityAmount - otherTaxes;
      
      // Create payroll record
      const payrollRecord: PayrollRecord = {
        id: crypto.randomUUID(),
        employee_id: employeeId,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        pay_date: payPeriodEnd,
        
        // Basic pay
        basic_salary: basicSalary,
        gross_pay: grossPay,
        net_pay: netPay,
        currency: employee.currency,
        
        // Allowances
        allowances,
        allowance_total: allowanceTotal,
        
        // Deductions
        deductions,
        deduction_total: deductionTotal,
        
        // Tax calculations
        tax_amount: taxAmount,
        social_security_amount: socialSecurityAmount,
        other_taxes: otherTaxes,
        
        // Overtime and bonuses
        overtime_hours: 0,
        overtime_rate: 0,
        overtime_amount: 0,
        bonus_amount: 0,
        
        // Leave and absences
        leave_days: 0,
        absence_days: 0,
        leave_deduction: 0,
        
        // Status and processing
        status: 'pending',
        payment_method: 'bank_transfer',
        payment_reference: undefined,
        
        // Compliance
        tax_year: new Date().getFullYear(),
        tax_period: undefined,
        compliance_verified: false,
        
        // Metadata
        notes: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: employee.created_by,
        processed_by: undefined,
        processed_at: undefined
      };

      const { data, error } = await this.supabase
        .from('payroll_records')
        .insert(payrollRecord)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  }

  /**
   * Get payroll statistics
   */
  async getPayrollStats(organization_id?: string): Promise<PayrollStats> {
    try {
      const { data: payrollRecords, error } = await this.supabase
        .from('payroll_records')
        .select('*');

      if (error) throw error;

      const records = payrollRecords || [];

      // Calculate basic stats
      const totalPayroll = records.reduce((sum, record) => sum + record.gross_pay, 0);
      const averageSalary = records.length > 0 ? totalPayroll / records.length : 0;
      const totalTaxPaid = records.reduce((sum, record) => sum + record.tax_amount, 0);
      const totalBenefits = records.reduce((sum, record) => sum + record.allowance_total, 0);

      // Group by month
      const byMonth: Record<string, number> = {};
      records.forEach(record => {
        const month = record.pay_period_start.substring(0, 7); // YYYY-MM
        byMonth[month] = (byMonth[month] || 0) + record.gross_pay;
      });

      // Group by department (would need to join with employees table)
      const byDepartment: Record<string, number> = {};

      return {
        totalPayroll,
        averageSalary,
        totalTaxPaid,
        totalBenefits,
        byMonth,
        byDepartment
      };
    } catch (error) {
      console.error('Error fetching payroll stats:', error);
      throw error;
    }
  }

  // ========================================
  // LEAVE MANAGEMENT
  // ========================================

  /**
   * Get leave requests
   */
  async getLeaveRequests(filters?: {
    employee_id?: string;
    status?: string;
    leave_type?: string;
  }): Promise<LeaveRequest[]> {
    try {
      let query = this.supabase
        .from('leave_requests')
        .select('*')
        .order('start_date', { ascending: false });

      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.leave_type) {
        query = query.eq('leave_type', filters.leave_type);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  /**
   * Create leave request
   */
  async createLeaveRequest(leaveData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    try {
      const leaveRequest: LeaveRequest = {
        id: crypto.randomUUID(),
        employee_id: leaveData.employee_id!,
        leave_type: leaveData.leave_type!,
        start_date: leaveData.start_date!,
        end_date: leaveData.end_date!,
        days_requested: leaveData.days_requested!,
        reason: leaveData.reason,
        
        // Approval workflow
        status: 'pending',
        requested_by: leaveData.requested_by!,
        approved_by: leaveData.approved_by,
        approved_at: leaveData.approved_at,
        rejection_reason: leaveData.rejection_reason,
        
        // Documentation
        supporting_documents: leaveData.supporting_documents || [],
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('leave_requests')
        .insert(leaveRequest)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  }

  /**
   * Approve/reject leave request
   */
  async updateLeaveRequestStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    approvedBy: string,
    rejectionReason?: string
  ): Promise<LeaveRequest> {
    try {
      const updateData: Partial<LeaveRequest> = {
        status,
        approved_by: approvedBy,
        approved_at: status === 'approved' ? new Date().toISOString() : undefined,
        rejection_reason: status === 'rejected' ? rejectionReason : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating leave request status:', error);
      throw error;
    }
  }

  // ========================================
  // PERFORMANCE MANAGEMENT
  // ========================================

  /**
   * Get performance reviews
   */
  async getPerformanceReviews(filters?: {
    employee_id?: string;
    reviewer_id?: string;
    status?: string;
  }): Promise<PerformanceReview[]> {
    try {
      let query = this.supabase
        .from('performance_reviews')
        .select('*')
        .order('review_date', { ascending: false });

      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters?.reviewer_id) {
        query = query.eq('reviewer_id', filters.reviewer_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      throw error;
    }
  }

  /**
   * Create performance review
   */
  async createPerformanceReview(reviewData: Partial<PerformanceReview>): Promise<PerformanceReview> {
    try {
      const performanceReview: PerformanceReview = {
        id: crypto.randomUUID(),
        employee_id: reviewData.employee_id!,
        review_period_start: reviewData.review_period_start!,
        review_period_end: reviewData.review_period_end!,
        review_date: reviewData.review_date!,
        
        // Review details
        reviewer_id: reviewData.reviewer_id!,
        review_type: reviewData.review_type!,
        
        // Performance ratings
        overall_rating: reviewData.overall_rating,
        technical_skills: reviewData.technical_skills,
        communication: reviewData.communication,
        teamwork: reviewData.teamwork,
        leadership: reviewData.leadership,
        problem_solving: reviewData.problem_solving,
        
        // Review content
        achievements: reviewData.achievements,
        areas_for_improvement: reviewData.areas_for_improvement,
        goals: reviewData.goals,
        comments: reviewData.comments,
        
        // Outcomes
        salary_increase: reviewData.salary_increase || 0,
        promotion_position: reviewData.promotion_position,
        next_review_date: reviewData.next_review_date,
        
        // Status
        status: 'draft',
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('performance_reviews')
        .insert(performanceReview)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating performance review:', error);
      throw error;
    }
  }

  // ===== ATTENDANCE MANAGEMENT =====
  
  async getAttendanceRecords(filters?: {
    employee_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    organization_id?: string;
  }): Promise<AttendanceRecord[]> {
    let query = this.supabase
      .from('attendance_records')
      .select(`
        *,
        employees!inner(organization_id)
      `);

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.start_date) {
      query = query.gte('date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('date', filters.end_date);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.organization_id) {
      query = query.eq('employees.organization_id', filters.organization_id);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw new Error(`Failed to fetch attendance records: ${error.message}`);
    return data || [];
  }

  async createAttendanceRecord(attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .insert([attendanceData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create attendance record: ${error.message}`);
    return data;
  }

  async updateAttendanceRecord(id: string, attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .update(attendanceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update attendance record: ${error.message}`);
    return data;
  }

  async clockIn(employeeId: string, location?: string, deviceId?: string): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if attendance record already exists for today
    const existingRecord = await this.getAttendanceRecords({
      employee_id: employeeId,
      start_date: today,
      end_date: today
    });

    if (existingRecord.length > 0) {
      throw new Error('Attendance record already exists for today');
    }

    return this.createAttendanceRecord({
      employee_id: employeeId,
      date: today,
      clock_in_time: now,
      total_hours: 0,
      overtime_hours: 0,
      status: 'present',
      location,
      device_id: deviceId
    });
  }

  async clockOut(employeeId: string): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const attendanceRecords = await this.getAttendanceRecords({
      employee_id: employeeId,
      start_date: today,
      end_date: today
    });

    if (attendanceRecords.length === 0) {
      throw new Error('No attendance record found for today');
    }

    const record = attendanceRecords[0];
    const clockInTime = new Date(record.clock_in_time!);
    const clockOutTime = new Date(now);
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, totalHours - 8); // Assuming 8-hour workday

    return this.updateAttendanceRecord(record.id, {
      clock_out_time: now,
      total_hours: totalHours,
      overtime_hours: overtimeHours
    });
  }

  // ===== EMPLOYMENT CONTRACTS =====

  async getEmploymentContracts(filters?: {
    employee_id?: string;
    status?: string;
    organization_id?: string;
  }): Promise<EmploymentContract[]> {
    let query = this.supabase
      .from('employment_contracts')
      .select(`
        *,
        employees!inner(organization_id)
      `);

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.organization_id) {
      query = query.eq('employees.organization_id', filters.organization_id);
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch employment contracts: ${error.message}`);
    return data || [];
  }

  async createEmploymentContract(contractData: Partial<EmploymentContract>): Promise<EmploymentContract> {
    // Generate contract number
    const contractNumber = `CON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const contractWithNumber = {
      ...contractData,
      contract_number: contractNumber,
      status: 'active'
    };

    const { data, error } = await this.supabase
      .from('employment_contracts')
      .insert([contractWithNumber])
      .select()
      .single();

    if (error) throw new Error(`Failed to create employment contract: ${error.message}`);
    return data;
  }

  async updateEmploymentContract(id: string, contractData: Partial<EmploymentContract>): Promise<EmploymentContract> {
    const { data, error } = await this.supabase
      .from('employment_contracts')
      .update(contractData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update employment contract: ${error.message}`);
    return data;
  }

  async terminateContract(contractId: string, terminationDate: string, reason: string): Promise<EmploymentContract> {
    return this.updateEmploymentContract(contractId, {
      status: 'terminated',
      end_date: terminationDate
    });
  }

  // ===== STATUTORY REPORTING =====

  async getStatutoryReports(filters?: {
    organization_id?: string;
    report_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<StatutoryReport[]> {
    let query = this.supabase
      .from('statutory_reports')
      .select('*');

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }
    if (filters?.report_type) {
      query = query.eq('report_type', filters.report_type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.start_date) {
      query = query.gte('reporting_period', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('reporting_period', filters.end_date);
    }

    const { data, error } = await query.order('reporting_period', { ascending: false });

    if (error) throw new Error(`Failed to fetch statutory reports: ${error.message}`);
    return data || [];
  }

  async createStatutoryReport(reportData: Partial<StatutoryReport>): Promise<StatutoryReport> {
    const { data, error } = await this.supabase
      .from('statutory_reports')
      .insert([reportData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create statutory report: ${error.message}`);
    return data;
  }

  async generateEPFReport(organizationId: string, reportingPeriod: string): Promise<StatutoryReport> {
    // Get all active employees for the organization
    const employees = await this.getEmployees({ organization_id: organizationId });
    const activeEmployees = employees.filter(emp => emp.employment_status === 'active');
    
    // Calculate EPF contributions (employer: 12%, employee: 11% for Malaysia)
    const totalEPFAmount = activeEmployees.reduce((total, emp) => {
      const monthlySalary = emp.salary;
      const employerContribution = monthlySalary * 0.12;
      const employeeContribution = monthlySalary * 0.11;
      return total + employerContribution + employeeContribution;
    }, 0);

    return this.createStatutoryReport({
      organization_id: organizationId,
      report_type: 'EPF',
      reporting_period: reportingPeriod,
      due_date: this.calculateEPFDueDate(reportingPeriod),
      status: 'pending',
      amount: totalEPFAmount,
      currency: 'MYR',
      employee_count: activeEmployees.length
    });
  }

  async generateSOCSOReport(organizationId: string, reportingPeriod: string): Promise<StatutoryReport> {
    const employees = await this.getEmployees({ organization_id: organizationId });
    const activeEmployees = employees.filter(emp => emp.employment_status === 'active');
    
    // Calculate SOCSO contributions (employer: 1.25%, employee: 0.5% for Malaysia)
    const totalSOCSOAmount = activeEmployees.reduce((total, emp) => {
      const monthlySalary = emp.salary;
      const employerContribution = monthlySalary * 0.0125;
      const employeeContribution = monthlySalary * 0.005;
      return total + employerContribution + employeeContribution;
    }, 0);

    return this.createStatutoryReport({
      organization_id: organizationId,
      report_type: 'SOCSO',
      reporting_period: reportingPeriod,
      due_date: this.calculateSOCSODueDate(reportingPeriod),
      status: 'pending',
      amount: totalSOCSOAmount,
      currency: 'MYR',
      employee_count: activeEmployees.length
    });
  }

  private calculateEPFDueDate(reportingPeriod: string): string {
    // EPF is due by the 15th of the following month
    const date = new Date(reportingPeriod);
    date.setMonth(date.getMonth() + 1);
    date.setDate(15);
    return date.toISOString().split('T')[0];
  }

  private calculateSOCSODueDate(reportingPeriod: string): string {
    // SOCSO is due by the 15th of the following month
    const date = new Date(reportingPeriod);
    date.setMonth(date.getMonth() + 1);
    date.setDate(15);
    return date.toISOString().split('T')[0];
  }

  // ===== BANK TRANSFER FILES =====

  async getBankTransferFiles(filters?: {
    organization_id?: string;
    bank_name?: string;
    status?: string;
  }): Promise<BankTransferFile[]> {
    let query = this.supabase
      .from('bank_transfer_files')
      .select('*');

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }
    if (filters?.bank_name) {
      query = query.eq('bank_name', filters.bank_name);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch bank transfer files: ${error.message}`);
    return data || [];
  }

  async generateBankTransferFile(
    organizationId: string,
    bankName: string,
    fileFormat: string,
    payPeriodStart: string,
    payPeriodEnd: string
  ): Promise<BankTransferFile> {
    // Get payroll records for the period
    const payrollRecords = await this.getPayrollRecords({
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      organization_id: organizationId,
      status: 'processed'
    });

    const totalAmount = payrollRecords.reduce((sum, record) => sum + record.net_pay, 0);
    const employeeCount = payrollRecords.length;

    // Generate file content based on bank format
    const fileContent = this.generateBankFileContent(bankName, fileFormat, payrollRecords);
    const filePath = `bank_files/${organizationId}/${bankName}_${payPeriodStart}_${payPeriodEnd}.txt`;

    const { data, error } = await this.supabase
      .from('bank_transfer_files')
      .insert([{
        organization_id: organizationId,
        bank_name: bankName,
        file_format: fileFormat,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        total_amount: totalAmount,
        employee_count: employeeCount,
        file_path: filePath,
        status: 'generated'
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to generate bank transfer file: ${error.message}`);
    return data;
  }

  private generateBankFileContent(bankName: string, format: string, payrollRecords: PayrollRecord[]): string {
    // Generate bank-specific file format
    switch (format) {
      case 'CIMB':
        return this.generateCIMBFormat(payrollRecords);
      case 'MAYBANK':
        return this.generateMaybankFormat(payrollRecords);
      case 'PUBLIC_BANK':
        return this.generatePublicBankFormat(payrollRecords);
      default:
        return this.generateGenericFormat(payrollRecords);
    }
  }

  private generateCIMBFormat(payrollRecords: PayrollRecord[]): string {
    // CIMB format: Account Number|Account Name|Amount|Reference
    return payrollRecords.map(record => {
      const employee = record as any; // Assuming employee data is available
      return `${employee.bank_account_number}|${employee.first_name} ${employee.last_name}|${record.net_pay}|PAYROLL-${record.pay_period_start}`;
    }).join('\n');
  }

  private generateMaybankFormat(payrollRecords: PayrollRecord[]): string {
    // Maybank format: Account Number,Account Name,Amount,Reference
    return payrollRecords.map(record => {
      const employee = record as any;
      return `${employee.bank_account_number},${employee.first_name} ${employee.last_name},${record.net_pay},PAYROLL-${record.pay_period_start}`;
    }).join('\n');
  }

  private generatePublicBankFormat(payrollRecords: PayrollRecord[]): string {
    // Public Bank format: Account Number\tAccount Name\tAmount\tReference
    return payrollRecords.map(record => {
      const employee = record as any;
      return `${employee.bank_account_number}\t${employee.first_name} ${employee.last_name}\t${record.net_pay}\tPAYROLL-${record.pay_period_start}`;
    }).join('\n');
  }

  private generateGenericFormat(payrollRecords: PayrollRecord[]): string {
    // Generic CSV format
    return payrollRecords.map(record => {
      const employee = record as any;
      return `${employee.bank_account_number},${employee.first_name} ${employee.last_name},${record.net_pay},PAYROLL-${record.pay_period_start}`;
    }).join('\n');
  }

  // ===== NOTIFICATIONS =====

  async getNotifications(filters?: {
    recipient_id?: string;
    type?: string;
    status?: string;
    category?: string;
  }): Promise<Notification[]> {
    let query = this.supabase
      .from('notifications')
      .select('*');

    if (filters?.recipient_id) {
      query = query.eq('recipient_id', filters.recipient_id);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
    return data || [];
  }

  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return data;
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
    return data;
  }

  async sendPayrollNotification(employeeId: string, payrollRecord: PayrollRecord): Promise<Notification> {
    return this.createNotification({
      recipient_id: employeeId,
      type: 'email',
      title: 'Payroll Processed',
      message: `Your payroll for ${payrollRecord.pay_period_start} to ${payrollRecord.pay_period_end} has been processed. Net pay: ${payrollRecord.currency} ${payrollRecord.net_pay}`,
      category: 'payroll',
      priority: 'medium',
      status: 'pending',
      metadata: { payroll_record_id: payrollRecord.id }
    });
  }

  async sendLeaveApprovalNotification(employeeId: string, leaveRequest: LeaveRequest): Promise<Notification> {
    return this.createNotification({
      recipient_id: employeeId,
      type: 'in_app',
      title: 'Leave Request Update',
      message: `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been ${leaveRequest.status}.`,
      category: 'leave',
      priority: 'medium',
      status: 'pending',
      metadata: { leave_request_id: leaveRequest.id }
    });
  }

  // ===== DOCUMENT MANAGEMENT =====

  async getDocumentTemplates(filters?: {
    organization_id?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<DocumentTemplate[]> {
    let query = this.supabase
      .from('document_templates')
      .select('*');

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch document templates: ${error.message}`);
    return data || [];
  }

  async createDocumentTemplate(templateData: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await this.supabase
      .from('document_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create document template: ${error.message}`);
    return data;
  }

  async generateDocument(
    employeeId: string,
    templateId: string,
    variables: Record<string, any>
  ): Promise<GeneratedDocument> {
    // Get template
    const templates = await this.getDocumentTemplates({ is_active: true });
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Get employee data
    const employee = await this.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Generate document content by replacing variables
    let content = template.template_content;
    const allVariables = { ...variables, ...employee };
    
    template.variables.forEach(variable => {
      const value = allVariables[variable] || '';
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    // Save generated document
    const filePath = `documents/${employeeId}/${template.category}_${Date.now()}.pdf`;
    
    const { data, error } = await this.supabase
      .from('generated_documents')
      .insert([{
        employee_id: employeeId,
        template_id: templateId,
        document_type: template.category,
        file_path: filePath,
        file_size: content.length,
        status: 'generated'
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to generate document: ${error.message}`);
    return data;
  }

  // ===== LEAVE ENCASHMENT =====

  async getLeaveEncashments(filters?: {
    employee_id?: string;
    status?: string;
    organization_id?: string;
  }): Promise<LeaveEncashment[]> {
    let query = this.supabase
      .from('leave_encashments')
      .select(`
        *,
        employees!inner(organization_id)
      `);

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.organization_id) {
      query = query.eq('employees.organization_id', filters.organization_id);
    }

    const { data, error } = await query.order('encashment_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch leave encashments: ${error.message}`);
    return data || [];
  }

  async createLeaveEncashment(encashmentData: Partial<LeaveEncashment>): Promise<LeaveEncashment> {
    const { data, error } = await this.supabase
      .from('leave_encashments')
      .insert([encashmentData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create leave encashment: ${error.message}`);
    return data;
  }

  async approveLeaveEncashment(encashmentId: string, approvedBy: string): Promise<LeaveEncashment> {
    const { data, error } = await this.supabase
      .from('leave_encashments')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', encashmentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve leave encashment: ${error.message}`);
    return data;
  }

  // ===== TERMINATION MANAGEMENT =====

  async getTerminationRecords(filters?: {
    employee_id?: string;
    status?: string;
    organization_id?: string;
  }): Promise<TerminationRecord[]> {
    let query = this.supabase
      .from('termination_records')
      .select(`
        *,
        employees!inner(organization_id)
      `);

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.organization_id) {
      query = query.eq('employees.organization_id', filters.organization_id);
    }

    const { data, error } = await query.order('termination_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch termination records: ${error.message}`);
    return data || [];
  }

  async createTerminationRecord(terminationData: Partial<TerminationRecord>): Promise<TerminationRecord> {
    const { data, error } = await this.supabase
      .from('termination_records')
      .insert([terminationData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create termination record: ${error.message}`);
    return data;
  }

  async processTermination(
    employeeId: string,
    terminationType: 'resignation' | 'dismissal' | 'retirement' | 'end_of_contract' | 'redundancy',
    terminationDate: string,
    reason: string,
    severancePay: number
  ): Promise<TerminationRecord> {
    // Create termination record
    const terminationRecord = await this.createTerminationRecord({
      employee_id: employeeId,
      termination_type: terminationType,
      termination_date: terminationDate,
      last_working_date: terminationDate,
      reason,
      severance_pay: severancePay,
      currency: 'MYR',
      status: 'pending'
    });

    // Update employee status
    await this.updateEmployee(employeeId, {
      employment_status: 'terminated',
      termination_date: terminationDate
    });

    // Send notification
    await this.createNotification({
      recipient_id: employeeId,
      type: 'email',
      title: 'Termination Notice',
      message: `Your employment has been terminated effective ${terminationDate}. Please contact HR for exit procedures.`,
      category: 'system',
      priority: 'high',
      status: 'pending'
    });

    return terminationRecord;
  }

  // ===== ENHANCED STATISTICS =====

  async getAttendanceStats(organizationId?: string): Promise<{
    totalAttendance: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    averageHours: number;
    totalOvertime: number;
    byMonth: Record<string, number>;
  }> {
    const attendanceRecords = await this.getAttendanceRecords({ organization_id: organizationId });
    
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    
    const totalHours = attendanceRecords.reduce((sum, r) => sum + r.total_hours, 0);
    const averageHours = totalAttendance > 0 ? totalHours / totalAttendance : 0;
    
    const totalOvertime = attendanceRecords.reduce((sum, r) => sum + r.overtime_hours, 0);
    
    // Group by month
    const byMonth: Record<string, number> = {};
    attendanceRecords.forEach(record => {
      const month = record.date.substring(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    return {
      totalAttendance,
      presentCount,
      absentCount,
      lateCount,
      averageHours,
      totalOvertime,
      byMonth
    };
  }

  async getContractStats(organizationId?: string): Promise<{
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    probationContracts: number;
    byType: Record<string, number>;
  }> {
    const contracts = await this.getEmploymentContracts({ organization_id: organizationId });
    
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const expiringContracts = contracts.filter(c => {
      if (!c.end_date) return false;
      const endDate = new Date(c.end_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return endDate <= thirtyDaysFromNow;
    }).length;
    const probationContracts = contracts.filter(c => c.status === 'probation').length;
    
    const byType: Record<string, number> = {};
    contracts.forEach(contract => {
      byType[contract.contract_type] = (byType[contract.contract_type] || 0) + 1;
    });

    return {
      totalContracts,
      activeContracts,
      expiringContracts,
      probationContracts,
      byType
    };
  }

  async getComplianceStats(organizationId?: string): Promise<{
    totalReports: number;
    pendingReports: number;
    overdueReports: number;
    byType: Record<string, number>;
  }> {
    const reports = await this.getStatutoryReports({ organization_id: organizationId });
    
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const overdueReports = reports.filter(r => {
      if (r.status !== 'pending') return false;
      const dueDate = new Date(r.due_date);
      return dueDate < new Date();
    }).length;
    
    const byType: Record<string, number> = {};
    reports.forEach(report => {
      byType[report.report_type] = (byType[report.report_type] || 0) + 1;
    });

    return {
      totalReports,
      pendingReports,
      overdueReports,
      byType
    };
  }

  // ===== UTILITY METHODS =====

  async getUpcomingDeadlines(organizationId?: string): Promise<{
    expiringContracts: EmploymentContract[];
    overdueReports: StatutoryReport[];
    pendingApprovals: LeaveRequest[];
  }> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const contracts = await this.getEmploymentContracts({ organization_id: organizationId });
    const expiringContracts = contracts.filter(c => {
      if (!c.end_date) return false;
      return new Date(c.end_date) <= thirtyDaysFromNow;
    });

    const reports = await this.getStatutoryReports({ organization_id: organizationId });
    const overdueReports = reports.filter(r => {
      if (r.status !== 'pending') return false;
      return new Date(r.due_date) < new Date();
    });

    const leaveRequests = await this.getLeaveRequests({ status: 'pending' });
    const pendingApprovals = leaveRequests.filter(lr => {
      // Filter for requests that need approval (you might need to check approver logic)
      return true;
    });

    return {
      expiringContracts,
      overdueReports,
      pendingApprovals
    };
  }

  async sendBulkNotifications(
    recipientIds: string[],
    title: string,
    message: string,
    category: string,
    type: string = 'in_app'
  ): Promise<Notification[]> {
    const notifications = recipientIds.map(recipientId => ({
      recipient_id: recipientId,
      type,
      title,
      message,
      category,
      priority: 'medium',
      status: 'pending',
      metadata: {}
    }));

    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw new Error(`Failed to send bulk notifications: ${error.message}`);
    return data || [];
  }
}

export default SHRMService; 