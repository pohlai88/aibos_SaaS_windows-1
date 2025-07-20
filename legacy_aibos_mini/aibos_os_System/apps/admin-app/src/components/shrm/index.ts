// SHRM Module - Enterprise Grade Human Resource Management
// Following isolation standards with modular architecture

export { default as SHRMDashboard } from './SHRMDashboard';
export { default as EmployeeForm } from './components/EmployeeForm';
export { default as PayrollCalculator } from './components/PayrollCalculator';
export { default as LeaveRequestForm } from './components/LeaveRequestForm';
export { default as PerformanceReviewForm } from './components/PerformanceReviewForm';
export { default as AttendanceTracker } from './components/AttendanceTracker';
export { default as ContractManager } from './components/ContractManager';
export { default as ComplianceDashboard } from './components/ComplianceDashboard';
export { default as DocumentGenerator } from './components/DocumentGenerator';
export { default as NotificationCenter } from './components/NotificationCenter';

// Reports
export { default as EmployeeReport } from './reports/EmployeeReport';
export { default as PayrollReport } from './reports/PayrollReport';
export { default as LeaveReport } from './reports/LeaveReport';
export { default as PerformanceReport } from './reports/PerformanceReport';
export { default as ComplianceReport } from './reports/ComplianceReport';

// Services
export { SHRMService } from './services/shrm-service';
export { SHRMValidationService } from './services/validation-service';
export { SHRMNotificationService } from './services/notification-service';

// Types
export * from './types';
export * from './validation';

// Constants
export * from './constants'; 