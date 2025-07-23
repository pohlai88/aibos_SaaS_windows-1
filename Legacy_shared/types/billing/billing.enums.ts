/**
 * System subscription plans with detailed metadata
 */
export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

/**
 * Billing intervals with conversion utilities
 */
export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Plan feature flags and limitations
 */
export enum PlanFeature {
  MULTI_TEAM = 'multi-team',
  ADVANCED_ANALYTICS = 'advanced-analytics',
  PRIORITY_SUPPORT = 'priority-support',
  API_ACCESS = 'api-access',
}

/**
 * Detailed metadata for each subscription plan
 */
export interface PlanMetadata {
  displayName: string;
  description: string;
  basePrice: number;
  features: PlanFeature[];
  limits: {
    seats?: number;
    storageGB?: number;
    apiCalls?: number;
  };
  upgradeableTo: SubscriptionPlan[];
}

export const PlanMetadataMap: Record<SubscriptionPlan, PlanMetadata> = {
  [SubscriptionPlan.FREE]: {
    displayName: 'Free Tier',
    description: 'Basic access with limited features',
    basePrice: 0,
    features: [PlanFeature.API_ACCESS],
    limits: {
      seats: 1,
      storageGB: 5,
      apiCalls: 1000,
    },
    upgradeableTo: [SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE],
  },
  [SubscriptionPlan.PRO]: {
    displayName: 'Professional',
    description: 'For power users and small teams',
    basePrice: 15,
    features: [PlanFeature.API_ACCESS, PlanFeature.ADVANCED_ANALYTICS],
    limits: {
      seats: 5,
      storageGB: 50,
      apiCalls: 10000,
    },
    upgradeableTo: [SubscriptionPlan.ENTERPRISE],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    displayName: 'Enterprise',
    description: 'Unlimited access for organizations',
    basePrice: 50,
    features: Object.values(PlanFeature),
    limits: {
      seats: Infinity,
      storageGB: Infinity,
      apiCalls: Infinity,
    },
    upgradeableTo: [],
  },
};

/**
 * Utility types for billing operations
 */
export type BillingCycle = {
  interval: BillingInterval;
  startDate: Date;
  endDate: Date;
};

export type PlanPrice = {
  amount: number;
  currency: string;
  interval: BillingInterval;
};

/**
 * Gets metadata for a specific plan
 */
export function getPlanMetadata(plan: SubscriptionPlan): PlanMetadata {
  return PlanMetadataMap[plan];
}

/**
 * Checks if a plan includes a specific feature
 */
export function planHasFeature(plan: SubscriptionPlan, feature: PlanFeature): boolean {
  return PlanMetadataMap[plan].features.includes(feature);
}

/**
 * Calculates renewal date based on billing interval
 */
export function calculateRenewalDate(interval: BillingInterval, fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  if (interval === BillingInterval.YEARLY) {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
}
