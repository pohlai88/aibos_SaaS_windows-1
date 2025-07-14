/**
 * Tenant lifecycle statuses
 * @enum {string}
 */
export enum TenantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending", // Added for onboarding flows
}

/**
 * Available subscription tiers
 * @enum {string}
 */
export enum SubscriptionPlan {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
  TRIAL = "trial", // Added for temporary access
}

/**
 * Standardized tax identifier types
 */
export enum TaxIdType {
  VAT = "VAT",
  GST = "GST",
  SST = "SST", 
  EIN = "EIN",
  TIN = "TIN",
  CIF = "CIF",
  RFC = "RFC",
  BRN = "BRN",
  ABN = "ABN",
  PAN = "PAN",
  NIF = "NIF",
  CUIT = "CUIT",
  CPF = "CPF",
  CNPJ = "CNPJ",
  OTHER = "OTHER"
}

// Utility types for type-safe usage
export type TenantStatusType = `${TenantStatus}`;
export type SubscriptionPlanType = `${SubscriptionPlan}`;

/**
 * Hierarchy of subscription plans (higher number = more features)
 */
export const SubscriptionPlanHierarchy: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.TRIAL]: 1,
  [SubscriptionPlan.PRO]: 2,
  [SubscriptionPlan.ENTERPRISE]: 3,
} as const; 