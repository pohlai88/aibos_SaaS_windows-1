import { SubscriptionPlan, BillingInterval } from "../types/billing/billing.enums";
import { Currency } from "../types/billing/currency.enums";
import { Feature, PricingTableEntry } from "../types/billing/pricingTable.schema";

/**
 * Predefined features available across all plans
 */
export const PREDEFINED_FEATURES: Record<string, Feature> = {
  // Core Features
  'api-access': {
    id: 'api-access',
    name: 'API Access',
    description: 'Full REST API access with comprehensive endpoints',
    tooltip: 'Unlimited API calls with rate limiting',
    icon: 'api-icon',
    isHighlighted: true
  },
  'analytics': {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed usage analytics and reporting',
    tooltip: 'Real-time insights and custom reports',
    icon: 'chart-icon',
    isHighlighted: true
  },
  'multi-team': {
    id: 'multi-team',
    name: 'Multi-Team Support',
    description: 'Support for multiple teams and organizations',
    tooltip: 'Team management and collaboration features',
    icon: 'team-icon'
  },
  'priority-support': {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    tooltip: 'Dedicated support team with SLA guarantees',
    icon: 'support-icon',
    isHighlighted: true
  },
  'custom-integrations': {
    id: 'custom-integrations',
    name: 'Custom Integrations',
    description: 'Custom integration development and support',
    tooltip: 'White-label solutions and custom development',
    icon: 'integration-icon'
  },
  'data-export': {
    id: 'data-export',
    name: 'Data Export',
    description: 'Export data in multiple formats',
    tooltip: 'CSV, JSON, and API data export capabilities',
    icon: 'export-icon'
  },
  'audit-logs': {
    id: 'audit-logs',
    name: 'Audit Logs',
    description: 'Comprehensive audit trail and logging',
    tooltip: 'Complete activity tracking and compliance logs',
    icon: 'audit-icon'
  },
  'sso': {
    id: 'sso',
    name: 'Single Sign-On (SSO)',
    description: 'Enterprise SSO integration',
    tooltip: 'SAML, OAuth, and LDAP integration',
    icon: 'sso-icon'
  },
  'advanced-security': {
    id: 'advanced-security',
    name: 'Advanced Security',
    description: 'Enterprise-grade security features',
    tooltip: '2FA, encryption, and security compliance',
    icon: 'security-icon'
  },
  'custom-branding': {
    id: 'custom-branding',
    name: 'Custom Branding',
    description: 'White-label and custom branding options',
    tooltip: 'Remove our branding and use your own',
    icon: 'branding-icon'
  }
};

/**
 * Plan feature configurations
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  [SubscriptionPlan.FREE]: [
    'api-access'
  ],
  [SubscriptionPlan.PRO]: [
    'api-access',
    'analytics',
    'multi-team',
    'data-export'
  ],
  [SubscriptionPlan.ENTERPRISE]: [
    'api-access',
    'analytics',
    'multi-team',
    'priority-support',
    'custom-integrations',
    'data-export',
    'audit-logs',
    'sso',
    'advanced-security',
    'custom-branding'
  ]
};

/**
 * Default pricing configuration
 */
export const DEFAULT_PRICING: Record<SubscriptionPlan, Record<BillingInterval, number>> = {
  [SubscriptionPlan.FREE]: {
    [BillingInterval.MONTHLY]: 0,
    [BillingInterval.YEARLY]: 0
  },
  [SubscriptionPlan.PRO]: {
    [BillingInterval.MONTHLY]: 29.99,
    [BillingInterval.YEARLY]: 299.99
  },
  [SubscriptionPlan.ENTERPRISE]: {
    [BillingInterval.MONTHLY]: 99.99,
    [BillingInterval.YEARLY]: 999.99
  }
};

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, {
  maxUsers: number;
  storageGB: number;
  apiCalls: number;
}> = {
  [SubscriptionPlan.FREE]: {
    maxUsers: 1,
    storageGB: 5,
    apiCalls: 1000
  },
  [SubscriptionPlan.PRO]: {
    maxUsers: 10,
    storageGB: 100,
    apiCalls: 10000
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxUsers: Infinity,
    storageGB: Infinity,
    apiCalls: Infinity
  }
};

/**
 * Plan descriptions
 */
export const PLAN_DESCRIPTIONS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: 'Perfect for individuals and small projects',
  [SubscriptionPlan.PRO]: 'Ideal for growing teams and businesses',
  [SubscriptionPlan.ENTERPRISE]: 'Complete solution for large organizations'
};

/**
 * Plan display metadata for UI rendering
 */
export interface PlanDisplayMetadata {
  name: string;
  description: string;
  color: string;
  icon: string;
  badge?: string;
}

export const PLAN_DISPLAY_METADATA: Record<SubscriptionPlan, PlanDisplayMetadata> = {
  [SubscriptionPlan.FREE]: {
    name: "Free",
    description: "Basic features",
    color: "#64748b",
    icon: "free"
  },
  [SubscriptionPlan.PRO]: {
    name: "Pro",
    description: "Advanced features",
    color: "#6366f1",
    icon: "pro"
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: "Enterprise",
    description: "Full features",
    color: "#10b981",
    icon: "enterprise",
    badge: "Popular"
  }
};

/**
 * Creates a complete pricing table entry
 */
export function createPricingTableEntry(
  plan: SubscriptionPlan,
  interval: BillingInterval,
  currency: Currency = Currency.USD,
  customPrice?: number
): PricingTableEntry {
  const price = customPrice ?? DEFAULT_PRICING[plan][interval];
  const features = PLAN_FEATURES[plan].map(featureId => PREDEFINED_FEATURES[featureId]);
  const limits = PLAN_LIMITS[plan];
  
  return {
    plan,
    interval,
    price,
    currency,
    features,
    description: PLAN_DESCRIPTIONS[plan],
    maxUsers: limits.maxUsers,
    storageGB: limits.storageGB,
    apiCalls: limits.apiCalls,
    isActive: true,
    displayOrder: getDisplayOrder(plan, interval),
    isPopular: plan === SubscriptionPlan.PRO && interval === BillingInterval.MONTHLY,
    monthlyEquivalent: interval === BillingInterval.YEARLY ? price / 12 : price,
    savingsPercentage: interval === BillingInterval.YEARLY 
      ? Math.round(((DEFAULT_PRICING[plan][BillingInterval.MONTHLY] * 12 - price) / (DEFAULT_PRICING[plan][BillingInterval.MONTHLY] * 12)) * 100)
      : undefined
  };
}

/**
 * Gets display order for plan-interval combinations
 */
function getDisplayOrder(plan: SubscriptionPlan, interval: BillingInterval): number {
  const planOrder = {
    [SubscriptionPlan.FREE]: 1,
    [SubscriptionPlan.PRO]: 2,
    [SubscriptionPlan.ENTERPRISE]: 3
  };
  
  const intervalOrder = {
    [BillingInterval.MONTHLY]: 0,
    [BillingInterval.YEARLY]: 1
  };
  
  return planOrder[plan] * 10 + intervalOrder[interval];
}

/**
 * Creates a complete pricing table for a specific currency
 */
export function createPricingTable(currency: Currency = Currency.USD): PricingTableEntry[] {
  const plans = Object.values(SubscriptionPlan);
  const intervals = Object.values(BillingInterval);
  
  return plans.flatMap(plan =>
    intervals.map(interval => createPricingTableEntry(plan, interval, currency))
  );
}

/**
 * Gets features for a specific plan
 */
export function getPlanFeatures(plan: SubscriptionPlan): Feature[] {
  return PLAN_FEATURES[plan].map(featureId => PREDEFINED_FEATURES[featureId]);
}

/**
 * Checks if a plan includes a specific feature
 */
export function planHasFeature(plan: SubscriptionPlan, featureId: string): boolean {
  return PLAN_FEATURES[plan].includes(featureId);
}

/**
 * Gets plan limits
 */
export function getPlanLimits(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan];
}

/**
 * Gets plan description
 */
export function getPlanDescription(plan: SubscriptionPlan): string {
  return PLAN_DESCRIPTIONS[plan];
}

/**
 * Gets plan display metadata
 */
export function getPlanDisplayMetadata(plan: SubscriptionPlan): PlanDisplayMetadata {
  return PLAN_DISPLAY_METADATA[plan];
}

/**
 * Gets plan color for UI styling
 */
export function getPlanColor(plan: SubscriptionPlan): string {
  return PLAN_DISPLAY_METADATA[plan].color;
}

/**
 * Gets plan icon identifier
 */
export function getPlanIcon(plan: SubscriptionPlan): string {
  return PLAN_DISPLAY_METADATA[plan].icon;
}

/**
 * Checks if plan has a badge
 */
export function hasPlanBadge(plan: SubscriptionPlan): boolean {
  return !!PLAN_DISPLAY_METADATA[plan].badge;
}

/**
 * Gets plan badge text
 */
export function getPlanBadge(plan: SubscriptionPlan): string | undefined {
  return PLAN_DISPLAY_METADATA[plan].badge;
}

/**
 * Sample pricing table for testing and development
 */
export const SAMPLE_PRICING_TABLE: PricingTableEntry[] = [
  {
    plan: SubscriptionPlan.FREE,
    interval: BillingInterval.MONTHLY,
    price: 0,
    currency: Currency.USD,
    features: [
      { id: "basic-features", name: "Basic Features", description: "Essential functionality for getting started" },
      { id: "limited-usage", name: "Limited Usage", description: "Up to 1,000 API calls per month" },
      { id: "community-support", name: "Community Support", description: "Support via community forums" }
    ],
    description: "Perfect for individuals and small projects",
    maxUsers: 1,
    storageGB: 5,
    apiCalls: 1000,
    isActive: true,
    displayOrder: 1
  },
  {
    plan: SubscriptionPlan.FREE,
    interval: BillingInterval.YEARLY,
    price: 0,
    currency: Currency.USD,
    features: [
      { id: "basic-features", name: "Basic Features", description: "Essential functionality for getting started" },
      { id: "limited-usage", name: "Limited Usage", description: "Up to 1,000 API calls per month" },
      { id: "community-support", name: "Community Support", description: "Support via community forums" }
    ],
    description: "Perfect for individuals and small projects",
    maxUsers: 1,
    storageGB: 5,
    apiCalls: 1000,
    isActive: true,
    displayOrder: 2
  },
  {
    plan: SubscriptionPlan.PRO,
    interval: BillingInterval.MONTHLY,
    price: 29.99,
    currency: Currency.USD,
    features: [
      { id: "advanced-features", name: "Advanced Features", description: "Enhanced functionality for power users" },
      { id: "priority-support", name: "Priority Support", description: "24/7 priority customer support" },
      { id: "analytics", name: "Advanced Analytics", description: "Detailed usage analytics and reporting" },
      { id: "multi-team", name: "Multi-Team Support", description: "Support for multiple teams" },
      { id: "data-export", name: "Data Export", description: "Export data in multiple formats" }
    ],
    description: "Ideal for growing teams and businesses",
    maxUsers: 10,
    storageGB: 100,
    apiCalls: 10000,
    isPopular: true,
    isActive: true,
    displayOrder: 3,
    monthlyEquivalent: 29.99
  },
  {
    plan: SubscriptionPlan.PRO,
    interval: BillingInterval.YEARLY,
    price: 299.99,
    currency: Currency.USD,
    features: [
      { id: "advanced-features", name: "Advanced Features", description: "Enhanced functionality for power users" },
      { id: "priority-support", name: "Priority Support", description: "24/7 priority customer support" },
      { id: "analytics", name: "Advanced Analytics", description: "Detailed usage analytics and reporting" },
      { id: "multi-team", name: "Multi-Team Support", description: "Support for multiple teams" },
      { id: "data-export", name: "Data Export", description: "Export data in multiple formats" }
    ],
    description: "Ideal for growing teams and businesses",
    maxUsers: 10,
    storageGB: 100,
    apiCalls: 10000,
    isActive: true,
    displayOrder: 4,
    monthlyEquivalent: 24.99,
    savingsPercentage: 17
  },
  {
    plan: SubscriptionPlan.ENTERPRISE,
    interval: BillingInterval.MONTHLY,
    price: 99.99,
    currency: Currency.USD,
    features: [
      { id: "enterprise-features", name: "Enterprise Features", description: "Complete enterprise solution" },
      { id: "dedicated-support", name: "Dedicated Support", description: "Dedicated account manager" },
      { id: "custom-integrations", name: "Custom Integrations", description: "Custom integration development" },
      { id: "audit-logs", name: "Audit Logs", description: "Comprehensive audit trail" },
      { id: "sso", name: "Single Sign-On (SSO)", description: "Enterprise SSO integration" },
      { id: "advanced-security", name: "Advanced Security", description: "Enterprise-grade security" },
      { id: "custom-branding", name: "Custom Branding", description: "White-label solutions" }
    ],
    description: "Complete solution for large organizations",
    maxUsers: Infinity,
    storageGB: Infinity,
    apiCalls: Infinity,
    isActive: true,
    displayOrder: 5,
    monthlyEquivalent: 99.99
  },
  {
    plan: SubscriptionPlan.ENTERPRISE,
    interval: BillingInterval.YEARLY,
    price: 999.99,
    currency: Currency.USD,
    features: [
      { id: "enterprise-features", name: "Enterprise Features", description: "Complete enterprise solution" },
      { id: "dedicated-support", name: "Dedicated Support", description: "Dedicated account manager" },
      { id: "custom-integrations", name: "Custom Integrations", description: "Custom integration development" },
      { id: "audit-logs", name: "Audit Logs", description: "Comprehensive audit trail" },
      { id: "sso", name: "Single Sign-On (SSO)", description: "Enterprise SSO integration" },
      { id: "advanced-security", name: "Advanced Security", description: "Enterprise-grade security" },
      { id: "custom-branding", name: "Custom Branding", description: "White-label solutions" }
    ],
    description: "Complete solution for large organizations",
    maxUsers: Infinity,
    storageGB: Infinity,
    apiCalls: Infinity,
    isActive: true,
    displayOrder: 6,
    monthlyEquivalent: 83.33,
    savingsPercentage: 17
  }
]; 