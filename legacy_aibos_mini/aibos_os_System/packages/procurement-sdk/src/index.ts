// Procurement SDK - exports all procurement-related services

// Export shared types (consolidated)
export * from './types';

// Export service classes only (types are in ./types)
export { RFQManagementService } from './services/rfq-management-service';
export { SupplierPortalService } from './services/supplier-portal-service';
export { CatalogManagementService } from './services/catalog-management-service';
export { SpendAnalyticsService } from './services/spend-analytics-service';

// Re-export core types for convenience
export type {
  UserContext,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PerformanceMetrics,
  AuditAction,
  ApprovalStatus,
  AccountingError,
  CacheEntry,
  ServiceResponse
} from '@aibos/core-types'; 