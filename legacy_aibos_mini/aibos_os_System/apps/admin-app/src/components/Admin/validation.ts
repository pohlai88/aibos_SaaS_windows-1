// AdminConfig Module Validation Schemas
// Comprehensive validation using Zod for type safety and data integrity

import { z } from 'zod';

// Base schemas
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User Management Schemas
export const AdminRoleSchema = z.enum([
  'super_admin',
  'system_admin',
  'organization_admin',
  'compliance_admin',
  'security_admin',
  'user_admin',
  'read_only'
]);

export const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'terminated',
  'pending_approval'
]);

export const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  resource: z.string().min(1).max(100),
  action: z.string().min(1).max(50),
  conditions: z.record(z.any()).optional(),
});

export const AdminUserSchema = BaseEntitySchema.extend({
  email: z.string().email(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  role: AdminRoleSchema,
  status: UserStatusSchema,
  permissions: z.array(PermissionSchema),
  last_login: z.string().datetime().optional(),
  organization_id: z.string().uuid(),
  mfa_enabled: z.boolean(),
  login_attempts: z.number().int().min(0).max(10),
  locked_until: z.string().datetime().optional(),
});

// Module Management Schemas
export const ModuleStatusSchema = z.enum([
  'enabled',
  'disabled',
  'beta',
  'deprecated',
  'maintenance'
]);

export const ModuleCategorySchema = z.enum([
  'Core',
  'HR',
  'Finance',
  'Compliance',
  'Security',
  'Analytics',
  'Automation',
  'Integration',
  'Support'
]);

export const ModuleConfigSchema = z.object({
  settings: z.record(z.any()),
  features: z.array(z.string()),
  limits: z.record(z.number()),
  customizations: z.record(z.any()),
});

export const ModuleHealthSchema = z.object({
  status: z.enum(['healthy', 'warning', 'critical', 'unknown']),
  uptime: z.number().min(0).max(100),
  response_time: z.number().min(0),
  error_rate: z.number().min(0).max(100),
  last_check: z.string().datetime(),
  issues: z.array(z.object({
    id: z.string().uuid(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    timestamp: z.string().datetime(),
    resolved: z.boolean(),
  })),
});

export const SystemModuleSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  icon: z.string().min(1).max(10),
  status: ModuleStatusSchema,
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  category: ModuleCategorySchema,
  dependencies: z.array(z.string()),
  lastUpdated: z.string().datetime(),
  config: ModuleConfigSchema,
  permissions: z.array(PermissionSchema),
  health: ModuleHealthSchema,
  usage: z.object({
    active_users: z.number().int().min(0),
    total_requests: z.number().int().min(0),
    storage_used: z.number().int().min(0),
    api_calls: z.number().int().min(0),
    last_activity: z.string().datetime(),
  }),
});

// Security Schemas
export const SecurityCategorySchema = z.enum([
  'Authentication',
  'Access Control',
  'Network Security',
  'Data Protection',
  'Audit & Logging',
  'Incident Response'
]);

export const SecurityRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  condition: z.string(),
  action: z.string(),
  priority: z.number().int().min(1).max(100),
  enabled: z.boolean(),
});

export const SecurityPolicyConfigSchema = z.object({
  settings: z.record(z.any()),
  rules: z.array(SecurityRuleSchema),
  exceptions: z.array(z.object({
    id: z.string().uuid(),
    description: z.string(),
    user_id: z.string().uuid().optional(),
    ip_address: z.string().ip().optional(),
    time_range: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
    reason: z.string(),
  })),
});

export const SecurityPolicySchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  status: z.enum(['enabled', 'disabled']),
  category: SecurityCategorySchema,
  lastUpdated: z.string().datetime(),
  config: SecurityPolicyConfigSchema,
  enforcement_level: z.enum(['strict', 'moderate', 'flexible']),
});

// Notification Schemas
export const NotificationTypeSchema = z.enum([
  'info',
  'success',
  'warning',
  'error',
  'critical'
]);

export const NotificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
]);

export const NotificationTargetTypeSchema = z.enum([
  'global',
  'user',
  'group',
  'role',
  'organization'
]);

export const NotificationTemplateSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  title_template: z.string().min(1).max(200),
  message_template: z.string().min(1).max(1000),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  target_type: NotificationTargetTypeSchema,
  is_active: z.boolean(),
  variables: z.array(z.string()),
});

export const NotificationSchema = BaseEntitySchema.extend({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  target_type: NotificationTargetTypeSchema,
  target_ids: z.array(z.string().uuid()),
  sent_by: z.string().uuid(),
  sent_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  read_by: z.array(z.string().uuid()),
  status: z.enum(['sent', 'delivered', 'read', 'expired']),
});

// System Settings Schemas
export const SystemSettingSchema = BaseEntitySchema.extend({
  category: z.string().min(1).max(50),
  key: z.string().min(1).max(100),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'json', 'array']),
  description: z.string().max(500),
  is_encrypted: z.boolean(),
  is_required: z.boolean(),
  validation_rules: z.array(z.string()).optional(),
  updated_by: z.string().uuid(),
});

// Organization Schemas
export const BrandingConfigSchema = z.object({
  logo_url: z.string().url().optional(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i),
  company_name: z.string().min(1).max(100),
  custom_css: z.string().optional(),
});

export const OrganizationSettingsSchema = z.object({
  branding: BrandingConfigSchema,
  features: z.object({
    enabled_modules: z.array(z.string()),
    custom_features: z.record(z.boolean()),
    experimental_features: z.record(z.boolean()),
  }),
  limits: z.object({
    max_users: z.number().int().min(1),
    max_storage: z.number().int().min(1),
    max_api_calls: z.number().int().min(1),
    retention_period: z.number().int().min(1),
  }),
  integrations: z.object({
    active_integrations: z.array(z.string()),
    webhook_urls: z.record(z.string().url()),
    api_keys: z.record(z.string()),
  }),
});

export const OrganizationSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  domain: z.string().min(1).max(100),
  country: z.string().length(2),
  timezone: z.string().min(1).max(50),
  currency: z.string().length(3),
  compliance_requirements: z.array(z.string()),
  settings: OrganizationSettingsSchema,
  status: z.enum(['active', 'suspended', 'terminated']),
});

// Audit Log Schemas
export const AuditLogSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  action: z.string().min(1).max(100),
  resource: z.string().min(1).max(100),
  resource_id: z.string().uuid().optional(),
  details: z.record(z.any()),
  ip_address: z.string().ip(),
  user_agent: z.string().max(500),
  timestamp: z.string().datetime(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['success', 'failure', 'pending']),
});

// Workflow Schemas
export const WorkflowTriggerSchema = z.object({
  type: z.enum(['manual', 'automatic', 'scheduled']),
  event: z.string().optional(),
  conditions: z.record(z.any()).optional(),
  schedule: z.string().optional(),
});

export const WorkflowStepSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['action', 'approval', 'notification', 'condition']),
  config: z.record(z.any()),
  order: z.number().int().min(1),
  required: z.boolean(),
  timeout: z.number().int().min(1).optional(),
});

export const WorkflowDefinitionSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  trigger: WorkflowTriggerSchema,
  steps: z.array(WorkflowStepSchema),
  status: z.enum(['active', 'inactive', 'draft']),
});

// Backup Schemas
export const BackupConfigSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  type: z.enum(['full', 'incremental', 'differential']),
  schedule: z.string().regex(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/),
  retention_days: z.number().int().min(1).max(3650),
  storage_location: z.string().min(1).max(500),
  encryption_enabled: z.boolean(),
  compression_enabled: z.boolean(),
  last_backup: z.string().datetime().optional(),
  next_backup: z.string().datetime().optional(),
  status: z.enum(['active', 'inactive', 'failed']),
});

// Form Validation Schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  role: AdminRoleSchema,
  organization_id: z.string().uuid(),
  permissions: z.array(z.string().uuid()).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.string().uuid(),
  status: UserStatusSchema.optional(),
});

export const CreateModuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  icon: z.string().min(1).max(10),
  category: ModuleCategorySchema,
  dependencies: z.array(z.string()).optional(),
  config: ModuleConfigSchema.optional(),
});

export const UpdateModuleSchema = CreateModuleSchema.partial().extend({
  id: z.string().uuid(),
  status: ModuleStatusSchema.optional(),
});

export const CreateNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  target_type: NotificationTargetTypeSchema,
  target_ids: z.array(z.string().uuid()),
  expires_at: z.string().datetime().optional(),
});

export const CreateSecurityPolicySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: SecurityCategorySchema,
  enforcement_level: z.enum(['strict', 'moderate', 'flexible']),
  config: SecurityPolicyConfigSchema.optional(),
});

export const UpdateSecurityPolicySchema = CreateSecurityPolicySchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['enabled', 'disabled']).optional(),
});

// Search and Filter Schemas
export const UserSearchSchema = z.object({
  query: z.string().optional(),
  role: AdminRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  organization_id: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const ModuleSearchSchema = z.object({
  query: z.string().optional(),
  category: ModuleCategorySchema.optional(),
  status: ModuleStatusSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const AuditLogSearchSchema = z.object({
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['success', 'failure', 'pending']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Bulk Operation Schemas
export const BulkUserOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'suspend', 'delete', 'change_role']),
  user_ids: z.array(z.string().uuid()).min(1).max(100),
  parameters: z.record(z.any()).optional(),
});

export const BulkModuleOperationSchema = z.object({
  operation: z.enum(['enable', 'disable', 'update', 'delete']),
  module_ids: z.array(z.string().uuid()).min(1).max(50),
  parameters: z.record(z.any()).optional(),
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

// Validation Functions
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character');
  
  return { valid: errors.length === 0, errors };
};

export const validateIpAddress = (ip: string): boolean => {
  return z.string().ip().safeParse(ip).success;
};

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

// Custom Validation Functions
export const validateCronExpression = (cron: string): boolean => {
  const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
  return cronRegex.test(cron);
};

export const validateHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const validateVersion = (version: string): boolean => {
  return /^\d+\.\d+\.\d+$/.test(version);
};

// Export all schemas
export const AdminConfigSchemas = {
  // Base schemas
  BaseEntity: BaseEntitySchema,
  
  // User schemas
  AdminRole: AdminRoleSchema,
  UserStatus: UserStatusSchema,
  Permission: PermissionSchema,
  AdminUser: AdminUserSchema,
  CreateUser: CreateUserSchema,
  UpdateUser: UpdateUserSchema,
  
  // Module schemas
  ModuleStatus: ModuleStatusSchema,
  ModuleCategory: ModuleCategorySchema,
  ModuleConfig: ModuleConfigSchema,
  ModuleHealth: ModuleHealthSchema,
  SystemModule: SystemModuleSchema,
  CreateModule: CreateModuleSchema,
  UpdateModule: UpdateModuleSchema,
  
  // Security schemas
  SecurityCategory: SecurityCategorySchema,
  SecurityRule: SecurityRuleSchema,
  SecurityPolicyConfig: SecurityPolicyConfigSchema,
  SecurityPolicy: SecurityPolicySchema,
  CreateSecurityPolicy: CreateSecurityPolicySchema,
  UpdateSecurityPolicy: UpdateSecurityPolicySchema,
  
  // Notification schemas
  NotificationType: NotificationTypeSchema,
  NotificationPriority: NotificationPrioritySchema,
  NotificationTargetType: NotificationTargetTypeSchema,
  NotificationTemplate: NotificationTemplateSchema,
  Notification: NotificationSchema,
  CreateNotification: CreateNotificationSchema,
  
  // System schemas
  SystemSetting: SystemSettingSchema,
  Organization: OrganizationSchema,
  AuditLog: AuditLogSchema,
  WorkflowDefinition: WorkflowDefinitionSchema,
  BackupConfig: BackupConfigSchema,
  
  // Search schemas
  UserSearch: UserSearchSchema,
  ModuleSearch: ModuleSearchSchema,
  AuditLogSearch: AuditLogSearchSchema,
  
  // Bulk operation schemas
  BulkUserOperation: BulkUserOperationSchema,
  BulkModuleOperation: BulkModuleOperationSchema,
  
  // API schemas
  Pagination: PaginationSchema,
  ApiResponse: ApiResponseSchema,
} as const; 