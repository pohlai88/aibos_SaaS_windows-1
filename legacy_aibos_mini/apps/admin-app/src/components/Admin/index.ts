// AdminConfig Module Exports
// Central export file for all admin components and utilities

// Main Components
export { AdminConfigPage } from './AdminConfigPage';
export { default as AdminSidebar } from './AdminSidebar';

// Services
export { adminSDK } from './admin-sdk';
export { workflowService } from './services/WorkflowService';
export { cacheService } from './services/CacheService';

// Utilities
export { AdminUtils } from './enhanced-utils';

// Types
export type {
  AdminUser,
  SystemModule,
  SecurityPolicy,
  Notification,
  AuditLog,
  SystemStats,
  AdminAction,
  WorkflowDefinition,
  BackupConfig,
  SystemAlert,
  AdminRole,
  UserStatus,
  Permission,
  ModuleStatus,
  ModuleCategory,
  NotificationType,
  NotificationPriority,
  NotificationTargetType,
  SecurityCategory,
  SystemSetting,
  Organization,
  WorkflowInstance,
  WorkflowParticipant,
  WorkflowHistoryItem,
  WorkflowTrigger,
  CacheEntry,
  CacheStatistics,
  CacheConfig,
} from './types';

// Validation Schemas
export { AdminConfigSchemas } from './validation';

// Section Components
export { default as SystemOverview } from './sections/SystemOverview';
export { default as UserManagement } from './sections/UserManagement';
export { default as ModuleManagement } from './sections/ModuleManagement';
export { default as ComplianceSettings } from './sections/ComplianceSettings';
export { default as SecuritySettings } from './sections/SecuritySettings';
export { default as AuditLogs } from './sections/AuditLogs';
export { default as SystemSettings } from './sections/SystemSettings';
export { default as NotificationManagement } from './sections/NotificationManagement';
export { default as SkillsManagement } from './sections/SkillsManagement';
export { default as QuickAddSection } from './sections/QuickAddSection';
export { default as OpportunitiesManagement } from './sections/OpportunitiesManagement';
export { default as DailyTipSection } from './sections/DailyTipSection'; 
