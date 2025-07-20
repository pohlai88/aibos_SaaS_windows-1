// AdminDepartment Module Types
// Comprehensive type definitions for department and team management

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parent_department_id?: string;
  manager_id?: string;
  organization_id: string;
  status: DepartmentStatus;
  type: DepartmentType;
  level: number;
  max_employees: number;
  current_employees: number;
  budget: number;
  currency: string;
  location: DepartmentLocation;
  contact_info: DepartmentContact;
  settings: DepartmentSettings;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type DepartmentStatus = 'active' | 'inactive' | 'suspended' | 'archived';

export type DepartmentType = 
  | 'executive'
  | 'management'
  | 'operations'
  | 'support'
  | 'technical'
  | 'sales'
  | 'marketing'
  | 'finance'
  | 'hr'
  | 'it'
  | 'legal'
  | 'compliance'
  | 'custom';

export interface DepartmentLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  timezone: string;
  office_number?: string;
  floor?: string;
  building?: string;
}

export interface DepartmentContact {
  email: string;
  phone: string;
  fax?: string;
  website?: string;
  emergency_contact?: string;
}

export interface DepartmentSettings {
  allow_remote_work: boolean;
  max_remote_days: number;
  working_hours: WorkingHours;
  holidays: Holiday[];
  policies: DepartmentPolicy[];
  permissions: DepartmentPermission[];
  integrations: DepartmentIntegration[];
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  is_working_day: boolean;
  start_time?: string; // HH:MM format
  end_time?: string; // HH:MM format
  break_start?: string;
  break_end?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'company' | 'department';
  is_paid: boolean;
  description?: string;
}

export interface DepartmentPolicy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  content: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PolicyType = 
  | 'attendance'
  | 'leave'
  | 'dress_code'
  | 'security'
  | 'confidentiality'
  | 'social_media'
  | 'expense'
  | 'travel'
  | 'custom';

export interface DepartmentPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  is_active: boolean;
}

export interface DepartmentIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, any>;
  is_active: boolean;
  last_sync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export type IntegrationType = 
  | 'slack'
  | 'teams'
  | 'zoom'
  | 'google_workspace'
  | 'microsoft_365'
  | 'jira'
  | 'trello'
  | 'asana'
  | 'custom';

export interface Team {
  id: string;
  name: string;
  description: string;
  department_id: string;
  team_lead_id?: string;
  type: TeamType;
  status: TeamStatus;
  max_members: number;
  current_members: number;
  skills_required: string[];
  projects: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type TeamType = 
  | 'project'
  | 'functional'
  | 'cross_functional'
  | 'virtual'
  | 'temporary'
  | 'permanent';

export type TeamStatus = 'active' | 'inactive' | 'forming' | 'storming' | 'norming' | 'performing' | 'adjourning';

export interface TeamMember {
  id: string;
  team_id: string;
  employee_id: string;
  role: TeamRole;
  join_date: string;
  end_date?: string;
  is_active: boolean;
  skills: string[];
  performance_rating?: number;
  notes?: string;
}

export type TeamRole = 
  | 'leader'
  | 'member'
  | 'specialist'
  | 'consultant'
  | 'mentor'
  | 'trainee';

export interface DepartmentEmployee {
  id: string;
  department_id: string;
  employee_id: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  reporting_to?: string;
  level: number;
  salary_grade: string;
  performance_rating?: number;
  skills: string[];
  certifications: string[];
  notes?: string;
}

export interface DepartmentBudget {
  id: string;
  department_id: string;
  fiscal_year: string;
  total_budget: number;
  allocated_budget: number;
  spent_budget: number;
  remaining_budget: number;
  currency: string;
  categories: BudgetCategory[];
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  description?: string;
}

export interface DepartmentReport {
  id: string;
  department_id: string;
  report_type: ReportType;
  period: string;
  data: Record<string, any>;
  generated_at: string;
  generated_by: string;
  status: 'draft' | 'published' | 'archived';
}

export type ReportType = 
  | 'headcount'
  | 'budget'
  | 'performance'
  | 'attendance'
  | 'productivity'
  | 'turnover'
  | 'skills_gap'
  | 'custom';

export interface DepartmentMetric {
  id: string;
  department_id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  target_value?: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
  calculated_at: string;
}

export interface DepartmentGoal {
  id: string;
  department_id: string;
  title: string;
  description: string;
  type: GoalType;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  status: GoalStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export type GoalType = 
  | 'financial'
  | 'operational'
  | 'customer'
  | 'learning'
  | 'process'
  | 'custom';

export type GoalStatus = 
  | 'not_started'
  | 'in_progress'
  | 'on_track'
  | 'at_risk'
  | 'completed'
  | 'cancelled';

export interface DepartmentAnnouncement {
  id: string;
  department_id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_published: boolean;
  publish_date: string;
  expiry_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  read_by: string[];
}

export type AnnouncementType = 
  | 'general'
  | 'policy'
  | 'event'
  | 'achievement'
  | 'reminder'
  | 'emergency';

export interface DepartmentEvent {
  id: string;
  department_id: string;
  title: string;
  description: string;
  type: EventType;
  start_date: string;
  end_date: string;
  location: string;
  is_all_day: boolean;
  attendees: string[];
  organizer: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export type EventType = 
  | 'meeting'
  | 'training'
  | 'celebration'
  | 'workshop'
  | 'presentation'
  | 'team_building'
  | 'custom';

// Form Types
export interface CreateDepartmentSchema {
  name: string;
  code: string;
  description: string;
  parent_department_id?: string;
  manager_id?: string;
  organization_id: string;
  type: DepartmentType;
  max_employees: number;
  budget: number;
  currency: string;
  location: DepartmentLocation;
  contact_info: DepartmentContact;
  settings: Partial<DepartmentSettings>;
}

export interface UpdateDepartmentSchema extends Partial<CreateDepartmentSchema> {
  id: string;
  status?: DepartmentStatus;
}

export interface CreateTeamSchema {
  name: string;
  description: string;
  department_id: string;
  team_lead_id?: string;
  type: TeamType;
  max_members: number;
  skills_required: string[];
  projects: string[];
}

export interface UpdateTeamSchema extends Partial<CreateTeamSchema> {
  id: string;
  status?: TeamStatus;
}

// Search and Filter Types
export interface DepartmentSearchParams {
  query?: string;
  type?: DepartmentType;
  status?: DepartmentStatus;
  organization_id?: string;
  parent_department_id?: string;
  manager_id?: string;
  page?: number;
  limit?: number;
}

export interface TeamSearchParams {
  query?: string;
  department_id?: string;
  type?: TeamType;
  status?: TeamStatus;
  team_lead_id?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface DepartmentApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Statistics Types
export interface DepartmentStatistics {
  total_departments: number;
  active_departments: number;
  total_employees: number;
  average_employees_per_dept: number;
  total_teams: number;
  average_teams_per_dept: number;
  budget_utilization: number;
  headcount_growth: number;
  turnover_rate: number;
  top_performing_depts: DepartmentPerformance[];
}

export interface DepartmentPerformance {
  department_id: string;
  department_name: string;
  performance_score: number;
  metrics: DepartmentMetric[];
  goals: DepartmentGoal[];
}

// Export all types
export const AdminDepartmentTypes = {
  // Base types
  Department,
  DepartmentStatus,
  DepartmentType,
  DepartmentLocation,
  DepartmentContact,
  DepartmentSettings,
  WorkingHours,
  DaySchedule,
  Holiday,
  DepartmentPolicy,
  PolicyType,
  DepartmentPermission,
  DepartmentIntegration,
  IntegrationType,
  
  // Team types
  Team,
  TeamType,
  TeamStatus,
  TeamMember,
  TeamRole,
  
  // Employee types
  DepartmentEmployee,
  
  // Budget types
  DepartmentBudget,
  BudgetCategory,
  
  // Report types
  DepartmentReport,
  ReportType,
  DepartmentMetric,
  
  // Goal types
  DepartmentGoal,
  GoalType,
  GoalStatus,
  
  // Communication types
  DepartmentAnnouncement,
  AnnouncementType,
  DepartmentEvent,
  EventType,
  
  // Form types
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  
  // Search types
  DepartmentSearchParams,
  TeamSearchParams,
  
  // API types
  DepartmentApiResponse,
  PaginationInfo,
  
  // Statistics types
  DepartmentStatistics,
  DepartmentPerformance,
} as const; 