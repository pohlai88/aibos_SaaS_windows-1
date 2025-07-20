// AdminConfig Module Types
// Comprehensive type definitions for the admin configuration system

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  status: UserStatus;
  permissions: Permission[];
  last_login?: string;
  created_at: string;
  organization_id: string;
  mfa_enabled: boolean;
  login_attempts: number;
  locked_until?: string;
}

export type AdminRole = 
  | 'super_admin'
  | 'system_admin' 
  | 'organization_admin'
  | 'compliance_admin'
  | 'security_admin'
  | 'user_admin'
  | 'read_only';

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'terminated'
  | 'pending_approval';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ModuleStatus;
  version: string;
  category: ModuleCategory;
  dependencies: string[];
  lastUpdated: string;
  config: ModuleConfig;
  permissions: Permission[];
  health: ModuleHealth;
  usage: ModuleUsage;
}

export type ModuleStatus = 'enabled' | 'disabled' | 'beta' | 'deprecated' | 'maintenance';

export type ModuleCategory = 
  | 'Core'
  | 'HR'
  | 'Finance'
  | 'Compliance'
  | 'Security'
  | 'Analytics'
  | 'Automation'
  | 'Integration'
  | 'Support';

export interface ModuleConfig {
  settings: Record<string, any>;
  features: string[];
  limits: Record<string, number>;
  customizations: Record<string, any>;
}

export interface ModuleHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  response_time: number;
  error_rate: number;
  last_check: string;
  issues: HealthIssue[];
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ModuleUsage {
  active_users: number;
  total_requests: number;
  storage_used: number;
  api_calls: number;
  last_activity: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  systemHealth: SystemHealth;
  lastBackup: string;
  storageUsed: number;
  storageLimit: number;
  performance: PerformanceMetrics;
  security: SecurityMetrics;
  compliance: ComplianceMetrics;
}

export interface SystemHealth {
  overall: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
  response_time: number;
  error_rate: number;
  active_modules: number;
  total_modules: number;
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_throughput: number;
  database_connections: number;
  cache_hit_rate: number;
}

export interface SecurityMetrics {
  security_score: number;
  active_threats: number;
  failed_logins: number;
  suspicious_activities: number;
  last_security_scan: string;
  vulnerabilities: SecurityVulnerability[];
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_component: string;
  discovered: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface ComplianceMetrics {
  compliance_score: number;
  pending_audits: number;
  regulatory_requirements: ComplianceRequirement[];
  last_compliance_check: string;
  next_audit_date: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  country: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  due_date: string;
  description: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  category: SecurityCategory;
  lastUpdated: string;
  config: SecurityPolicyConfig;
  enforcement_level: 'strict' | 'moderate' | 'flexible';
}

export type SecurityCategory = 
  | 'Authentication'
  | 'Access Control'
  | 'Network Security'
  | 'Data Protection'
  | 'Audit & Logging'
  | 'Incident Response';

export interface SecurityPolicyConfig {
  settings: Record<string, any>;
  rules: SecurityRule[];
  exceptions: SecurityException[];
}

export interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

export interface SecurityException {
  id: string;
  description: string;
  user_id?: string;
  ip_address?: string;
  time_range?: {
    start: string;
    end: string;
  };
  reason: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  type: NotificationType;
  priority: NotificationPriority;
  target_type: NotificationTargetType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variables: string[];
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'critical';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationTargetType = 'global' | 'user' | 'group' | 'role' | 'organization';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  target_type: NotificationTargetType;
  target_ids: string[];
  sent_by: string;
  sent_at: string;
  expires_at?: string;
  read_by: string[];
  status: 'sent' | 'delivered' | 'read' | 'expired';
}

export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  is_encrypted: boolean;
  is_required: boolean;
  validation_rules?: string[];
  updated_at: string;
  updated_by: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  country: string;
  timezone: string;
  currency: string;
  compliance_requirements: string[];
  settings: OrganizationSettings;
  status: 'active' | 'suspended' | 'terminated';
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  branding: BrandingConfig;
  features: FeatureConfig;
  limits: LimitConfig;
  integrations: IntegrationConfig;
}

export interface BrandingConfig {
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  custom_css?: string;
}

export interface FeatureConfig {
  enabled_modules: string[];
  custom_features: Record<string, boolean>;
  experimental_features: Record<string, boolean>;
}

export interface LimitConfig {
  max_users: number;
  max_storage: number;
  max_api_calls: number;
  retention_period: number;
}

export interface IntegrationConfig {
  active_integrations: string[];
  webhook_urls: Record<string, string>;
  api_keys: Record<string, string>;
}

export interface AdminAction {
  id: string;
  type: AdminActionType;
  user_id: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

export type AdminActionType = 
  | 'user_creation'
  | 'user_deletion'
  | 'role_assignment'
  | 'module_enable'
  | 'module_disable'
  | 'security_policy_change'
  | 'compliance_override'
  | 'system_backup'
  | 'system_restore'
  | 'bulk_operation'
  | 'notification_sent';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface WorkflowTrigger {
  type: 'manual' | 'automatic' | 'scheduled';
  event?: string;
  conditions?: Record<string, any>;
  schedule?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'approval' | 'notification' | 'condition';
  config: Record<string, any>;
  order: number;
  required: boolean;
  timeout?: number;
}

export interface BackupConfig {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: string;
  retention_days: number;
  storage_location: string;
  encryption_enabled: boolean;
  compression_enabled: boolean;
  last_backup?: string;
  next_backup?: string;
  status: 'active' | 'inactive' | 'failed';
}

export interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'compliance' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affected_components: string[];
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

// API Response Types
export interface AdminApiResponse<T> {
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

// Form Types
export interface AdminFormData {
  [key: string]: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Event Types
export interface AdminEvent {
  type: string;
  payload: any;
  timestamp: string;
  user_id?: string;
}

// Configuration Types
export interface AdminConfig {
  features: AdminFeatures;
  security: AdminSecurity;
  compliance: AdminCompliance;
  performance: AdminPerformance;
  notifications: AdminNotifications;
}

export interface AdminFeatures {
  bulk_operations: boolean;
  advanced_search: boolean;
  custom_workflows: boolean;
  api_access: boolean;
  audit_logs: boolean;
  backup_management: boolean;
}

export interface AdminSecurity {
  mfa_required: boolean;
  session_timeout: number;
  password_policy: PasswordPolicy;
  ip_whitelist: string[];
  encryption_level: 'standard' | 'enhanced' | 'enterprise';
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special: boolean;
  expiration_days: number;
  prevent_reuse: number;
}

export interface AdminCompliance {
  audit_trail: boolean;
  data_retention: number;
  gdpr_compliance: boolean;
  sea_regulations: string[];
  reporting_frequency: string;
}

export interface AdminPerformance {
  cache_enabled: boolean;
  cache_ttl: number;
  pagination_limit: number;
  search_timeout: number;
  bulk_operation_limit: number;
}

export interface AdminNotifications {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  webhook_enabled: boolean;
  notification_retention: number;
} 