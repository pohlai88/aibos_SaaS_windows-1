// AdminDepartment Module Validation Schemas
// Comprehensive validation using Zod for type safety and data integrity

import { z } from 'zod';

// Base schemas
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Department Schemas
export const DepartmentStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'archived'
]);

export const DepartmentTypeSchema = z.enum([
  'executive',
  'management',
  'operations',
  'support',
  'technical',
  'sales',
  'marketing',
  'finance',
  'hr',
  'it',
  'legal',
  'compliance',
  'custom'
]);

export const DepartmentLocationSchema = z.object({
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().length(2),
  postal_code: z.string().min(1).max(20),
  timezone: z.string().min(1).max(50),
  office_number: z.string().max(20).optional(),
  floor: z.string().max(10).optional(),
  building: z.string().max(100).optional(),
});

export const DepartmentContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1).max(20),
  fax: z.string().max(20).optional(),
  website: z.string().url().optional(),
  emergency_contact: z.string().max(20).optional(),
});

export const DayScheduleSchema = z.object({
  is_working_day: z.boolean(),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  break_start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  break_end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

export const WorkingHoursSchema = z.object({
  monday: DayScheduleSchema,
  tuesday: DayScheduleSchema,
  wednesday: DayScheduleSchema,
  thursday: DayScheduleSchema,
  friday: DayScheduleSchema,
  saturday: DayScheduleSchema,
  sunday: DayScheduleSchema,
});

export const HolidaySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['public', 'company', 'department']),
  is_paid: z.boolean(),
  description: z.string().max(500).optional(),
});

export const PolicyTypeSchema = z.enum([
  'attendance',
  'leave',
  'dress_code',
  'security',
  'confidentiality',
  'social_media',
  'expense',
  'travel',
  'custom'
]);

export const DepartmentPolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  type: PolicyTypeSchema,
  content: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  effective_date: z.string().datetime(),
  expiry_date: z.string().datetime().optional(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const DepartmentPermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  resource: z.string().min(1).max(100),
  action: z.string().min(1).max(50),
  conditions: z.record(z.any()).optional(),
  is_active: z.boolean(),
});

export const IntegrationTypeSchema = z.enum([
  'slack',
  'teams',
  'zoom',
  'google_workspace',
  'microsoft_365',
  'jira',
  'trello',
  'asana',
  'custom'
]);

export const DepartmentIntegrationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: IntegrationTypeSchema,
  config: z.record(z.any()),
  is_active: z.boolean(),
  last_sync: z.string().datetime().optional(),
  status: z.enum(['connected', 'disconnected', 'error']),
});

export const DepartmentSettingsSchema = z.object({
  allow_remote_work: z.boolean(),
  max_remote_days: z.number().int().min(0).max(7),
  working_hours: WorkingHoursSchema,
  holidays: z.array(HolidaySchema),
  policies: z.array(DepartmentPolicySchema),
  permissions: z.array(DepartmentPermissionSchema),
  integrations: z.array(DepartmentIntegrationSchema),
});

export const DepartmentSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_-]+$/),
  description: z.string().max(500),
  parent_department_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  status: DepartmentStatusSchema,
  type: DepartmentTypeSchema,
  level: z.number().int().min(0),
  max_employees: z.number().int().min(1),
  current_employees: z.number().int().min(0),
  budget: z.number().min(0),
  currency: z.string().length(3),
  location: DepartmentLocationSchema,
  contact_info: DepartmentContactSchema,
  settings: DepartmentSettingsSchema,
  created_by: z.string().uuid(),
});

// Team Schemas
export const TeamTypeSchema = z.enum([
  'project',
  'functional',
  'cross_functional',
  'virtual',
  'temporary',
  'permanent'
]);

export const TeamStatusSchema = z.enum([
  'active',
  'inactive',
  'forming',
  'storming',
  'norming',
  'performing',
  'adjourning'
]);

export const TeamRoleSchema = z.enum([
  'leader',
  'member',
  'specialist',
  'consultant',
  'mentor',
  'trainee'
]);

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  role: TeamRoleSchema,
  join_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  is_active: z.boolean(),
  skills: z.array(z.string()),
  performance_rating: z.number().min(0).max(5).optional(),
  notes: z.string().max(1000).optional(),
});

export const TeamSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  department_id: z.string().uuid(),
  team_lead_id: z.string().uuid().optional(),
  type: TeamTypeSchema,
  status: TeamStatusSchema,
  max_members: z.number().int().min(1),
  current_members: z.number().int().min(0),
  skills_required: z.array(z.string()),
  projects: z.array(z.string()),
  created_by: z.string().uuid(),
});

// Employee Schemas
export const DepartmentEmployeeSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  position: z.string().min(1).max(100),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  is_active: z.boolean(),
  reporting_to: z.string().uuid().optional(),
  level: z.number().int().min(1),
  salary_grade: z.string().min(1).max(20),
  performance_rating: z.number().min(0).max(5).optional(),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  notes: z.string().max(1000).optional(),
});

// Budget Schemas
export const BudgetCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  allocated: z.number().min(0),
  spent: z.number().min(0),
  remaining: z.number(),
  description: z.string().max(500).optional(),
});

export const DepartmentBudgetSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  fiscal_year: z.string().regex(/^\d{4}$/),
  total_budget: z.number().min(0),
  allocated_budget: z.number().min(0),
  spent_budget: z.number().min(0),
  remaining_budget: z.number(),
  currency: z.string().length(3),
  categories: z.array(BudgetCategorySchema),
});

// Report Schemas
export const ReportTypeSchema = z.enum([
  'headcount',
  'budget',
  'performance',
  'attendance',
  'productivity',
  'turnover',
  'skills_gap',
  'custom'
]);

export const DepartmentReportSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  report_type: ReportTypeSchema,
  period: z.string().min(1).max(50),
  data: z.record(z.any()),
  generated_at: z.string().datetime(),
  generated_by: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const DepartmentMetricSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  metric_name: z.string().min(1).max(100),
  metric_value: z.number(),
  metric_unit: z.string().min(1).max(20),
  target_value: z.number().optional(),
  period: z.string().min(1).max(50),
  trend: z.enum(['up', 'down', 'stable']),
  calculated_at: z.string().datetime(),
});

// Goal Schemas
export const GoalTypeSchema = z.enum([
  'financial',
  'operational',
  'customer',
  'learning',
  'process',
  'custom'
]);

export const GoalStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'on_track',
  'at_risk',
  'completed',
  'cancelled'
]);

export const DepartmentGoalSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  type: GoalTypeSchema,
  target_value: z.number(),
  current_value: z.number(),
  unit: z.string().min(1).max(20),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: GoalStatusSchema,
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigned_to: z.string().uuid().optional(),
  progress_percentage: z.number().min(0).max(100),
});

// Communication Schemas
export const AnnouncementTypeSchema = z.enum([
  'general',
  'policy',
  'event',
  'achievement',
  'reminder',
  'emergency'
]);

export const DepartmentAnnouncementSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  type: AnnouncementTypeSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  is_published: z.boolean(),
  publish_date: z.string().datetime(),
  expiry_date: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  read_by: z.array(z.string().uuid()),
});

export const EventTypeSchema = z.enum([
  'meeting',
  'training',
  'celebration',
  'workshop',
  'presentation',
  'team_building',
  'custom'
]);

export const DepartmentEventSchema = BaseEntitySchema.extend({
  department_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  type: EventTypeSchema,
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  location: z.string().min(1).max(200),
  is_all_day: z.boolean(),
  attendees: z.array(z.string().uuid()),
  organizer: z.string().uuid(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
});

// Form Validation Schemas
export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100, 'Department name must be less than 100 characters'),
  code: z.string().min(1, 'Department code is required').max(20, 'Department code must be less than 20 characters').regex(/^[A-Z0-9_-]+$/, 'Department code must contain only uppercase letters, numbers, hyphens, and underscores'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  parent_department_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
  type: DepartmentTypeSchema,
  max_employees: z.number().int().min(1, 'Maximum employees must be at least 1'),
  budget: z.number().min(0, 'Budget cannot be negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  location: DepartmentLocationSchema,
  contact_info: DepartmentContactSchema,
  settings: DepartmentSettingsSchema.partial(),
});

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial().extend({
  id: z.string().uuid('Invalid department ID'),
  status: DepartmentStatusSchema.optional(),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  department_id: z.string().uuid('Invalid department ID'),
  team_lead_id: z.string().uuid().optional(),
  type: TeamTypeSchema,
  max_members: z.number().int().min(1, 'Maximum members must be at least 1'),
  skills_required: z.array(z.string()).min(1, 'At least one skill is required'),
  projects: z.array(z.string()),
});

export const UpdateTeamSchema = CreateTeamSchema.partial().extend({
  id: z.string().uuid('Invalid team ID'),
  status: TeamStatusSchema.optional(),
});

export const AddTeamMemberSchema = z.object({
  team_id: z.string().uuid('Invalid team ID'),
  employee_id: z.string().uuid('Invalid employee ID'),
  role: TeamRoleSchema,
  skills: z.array(z.string()),
  notes: z.string().max(1000).optional(),
});

export const UpdateTeamMemberSchema = AddTeamMemberSchema.partial().extend({
  id: z.string().uuid('Invalid team member ID'),
  is_active: z.boolean().optional(),
  performance_rating: z.number().min(0).max(5).optional(),
});

// Search and Filter Schemas
export const DepartmentSearchSchema = z.object({
  query: z.string().optional(),
  type: DepartmentTypeSchema.optional(),
  status: DepartmentStatusSchema.optional(),
  organization_id: z.string().uuid().optional(),
  parent_department_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const TeamSearchSchema = z.object({
  query: z.string().optional(),
  department_id: z.string().uuid().optional(),
  type: TeamTypeSchema.optional(),
  status: TeamStatusSchema.optional(),
  team_lead_id: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// API Response Schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  total_pages: z.number().int().min(0),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    pagination: PaginationSchema.optional(),
  });

// Statistics Schemas
export const DepartmentPerformanceSchema = z.object({
  department_id: z.string().uuid(),
  department_name: z.string(),
  performance_score: z.number().min(0).max(100),
  metrics: z.array(DepartmentMetricSchema),
  goals: z.array(DepartmentGoalSchema),
});

export const DepartmentStatisticsSchema = z.object({
  total_departments: z.number().int().min(0),
  active_departments: z.number().int().min(0),
  total_employees: z.number().int().min(0),
  average_employees_per_dept: z.number().min(0),
  total_teams: z.number().int().min(0),
  average_teams_per_dept: z.number().min(0),
  budget_utilization: z.number().min(0).max(100),
  headcount_growth: z.number(),
  turnover_rate: z.number().min(0).max(100),
  top_performing_depts: z.array(DepartmentPerformanceSchema),
});

// Validation Functions
export const validateDepartmentCode = (code: string): boolean => {
  return /^[A-Z0-9_-]+$/.test(code);
};

export const validateWorkingHours = (hours: any): boolean => {
  try {
    WorkingHoursSchema.parse(hours);
    return true;
  } catch {
    return false;
  }
};

export const validateBudget = (budget: number, currency: string): boolean => {
  return budget >= 0 && currency.length === 3;
};

export const validateTeamSize = (current: number, max: number): boolean => {
  return current >= 0 && max > 0 && current <= max;
};

// Export all schemas
export const AdminDepartmentSchemas = {
  // Base schemas
  BaseEntity: BaseEntitySchema,
  
  // Department schemas
  DepartmentStatus: DepartmentStatusSchema,
  DepartmentType: DepartmentTypeSchema,
  DepartmentLocation: DepartmentLocationSchema,
  DepartmentContact: DepartmentContactSchema,
  DaySchedule: DayScheduleSchema,
  WorkingHours: WorkingHoursSchema,
  Holiday: HolidaySchema,
  PolicyType: PolicyTypeSchema,
  DepartmentPolicy: DepartmentPolicySchema,
  DepartmentPermission: DepartmentPermissionSchema,
  IntegrationType: IntegrationTypeSchema,
  DepartmentIntegration: DepartmentIntegrationSchema,
  DepartmentSettings: DepartmentSettingsSchema,
  Department: DepartmentSchema,
  
  // Team schemas
  TeamType: TeamTypeSchema,
  TeamStatus: TeamStatusSchema,
  TeamRole: TeamRoleSchema,
  TeamMember: TeamMemberSchema,
  Team: TeamSchema,
  
  // Employee schemas
  DepartmentEmployee: DepartmentEmployeeSchema,
  
  // Budget schemas
  BudgetCategory: BudgetCategorySchema,
  DepartmentBudget: DepartmentBudgetSchema,
  
  // Report schemas
  ReportType: ReportTypeSchema,
  DepartmentReport: DepartmentReportSchema,
  DepartmentMetric: DepartmentMetricSchema,
  
  // Goal schemas
  GoalType: GoalTypeSchema,
  GoalStatus: GoalStatusSchema,
  DepartmentGoal: DepartmentGoalSchema,
  
  // Communication schemas
  AnnouncementType: AnnouncementTypeSchema,
  DepartmentAnnouncement: DepartmentAnnouncementSchema,
  EventType: EventTypeSchema,
  DepartmentEvent: DepartmentEventSchema,
  
  // Form schemas
  CreateDepartment: CreateDepartmentSchema,
  UpdateDepartment: UpdateDepartmentSchema,
  CreateTeam: CreateTeamSchema,
  UpdateTeam: UpdateTeamSchema,
  AddTeamMember: AddTeamMemberSchema,
  UpdateTeamMember: UpdateTeamMemberSchema,
  
  // Search schemas
  DepartmentSearch: DepartmentSearchSchema,
  TeamSearch: TeamSearchSchema,
  
  // API schemas
  Pagination: PaginationSchema,
  ApiResponse: ApiResponseSchema,
  
  // Statistics schemas
  DepartmentPerformance: DepartmentPerformanceSchema,
  DepartmentStatistics: DepartmentStatisticsSchema,
} as const; 