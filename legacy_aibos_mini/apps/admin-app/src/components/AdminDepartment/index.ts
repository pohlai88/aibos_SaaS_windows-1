// AdminDepartment Module Exports
// Central export file for all department management components and utilities

// Main Components
export { AdminDepartmentPage } from './AdminDepartmentPage';

// Services
export { departmentSDK } from './department-sdk';

// Types
export type {
  Department,
  Team,
  DepartmentEmployee,
  DepartmentBudget,
  DepartmentReport,
  DepartmentGoal,
  DepartmentAnnouncement,
  DepartmentEvent,
  DepartmentStatistics,
  DepartmentStatus,
  DepartmentType,
  DepartmentLocation,
  DepartmentContact,
  WorkingHours,
  DaySchedule,
  Holiday,
  DepartmentPolicy,
  PolicyType,
  DepartmentPermission,
  DepartmentIntegration,
  IntegrationType,
  DepartmentSettings,
  TeamType,
  TeamStatus,
  TeamRole,
  TeamMember,
  BudgetCategory,
  ReportType,
  DepartmentMetric,
  GoalType,
  GoalStatus,
  AnnouncementType,
  EventType,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  DepartmentSearchParams,
  TeamSearchParams,
  DepartmentApiResponse,
  PaginationInfo,
  DepartmentPerformance,
} from './types';

// Validation Schemas
export { AdminDepartmentSchemas } from './validation'; 