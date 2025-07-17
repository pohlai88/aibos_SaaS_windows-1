import { PricingTableEntry } from '../types/billing/pricingTable.schema';
import { SubscriptionPlan, BillingInterval } from '../types/billing/billing.enums';
import { Currency } from '../types/billing/currency.enums';

/**
 * Enhanced metadata for pricing table entries
 */
export interface PricingMetadata {
  description: string;
  mostPopular?: boolean;
  ctaText: string;
  annualDiscount?: number; // percentage discount if paying annually
  showContactButton?: boolean;
  highlightColor?: string;
  badgeText?: string;
}

/**
 * Enhanced pricing table entry with metadata
 */
export interface EnhancedPricingTableEntry extends PricingTableEntry {
  metadata: PricingMetadata;
}

/**
 * Enhanced pricing table with metadata
 */
export type EnhancedPricingTable = EnhancedPricingTableEntry[];

/**
 * Main pricing table data with enhanced metadata
 */
const pricing: EnhancedPricingTable = [
  {
    plan: SubscriptionPlan.FREE,
    interval: BillingInterval.MONTHLY,
    price: 0,
    currency: Currency.USD,
    features: [
      {
        id: 'basic-features',
        name: 'Basic Features',
        description: 'Essential functionality for getting started',
      },
      {
        id: 'limited-usage',
        name: 'Limited Usage',
        description: 'Up to 1,000 API calls per month',
      },
      {
        id: 'community-support',
        name: 'Community Support',
        description: 'Support via community forums',
      },
    ],
    description: 'Perfect for individuals and small projects',
    maxUsers: 1,
    storageGB: 5,
    apiCalls: 1000,
    isActive: true,
    displayOrder: 1,
    metadata: {
      description: 'Start for free with basic features',
      ctaText: 'Sign Up',
      highlightColor: '#64748b',
    },
  },
  {
    plan: SubscriptionPlan.FREE,
    interval: BillingInterval.YEARLY,
    price: 0,
    currency: Currency.USD,
    features: [
      {
        id: 'basic-features',
        name: 'Basic Features',
        description: 'Essential functionality for getting started',
      },
      {
        id: 'limited-usage',
        name: 'Limited Usage',
        description: 'Up to 1,000 API calls per month',
      },
      {
        id: 'community-support',
        name: 'Community Support',
        description: 'Support via community forums',
      },
    ],
    description: 'Perfect for individuals and small projects',
    maxUsers: 1,
    storageGB: 5,
    apiCalls: 1000,
    isActive: true,
    displayOrder: 2,
    metadata: {
      description: 'Start for free with basic features',
      ctaText: 'Sign Up',
      highlightColor: '#64748b',
    },
  },
  {
    plan: SubscriptionPlan.PRO,
    interval: BillingInterval.MONTHLY,
    price: 29.99,
    currency: Currency.USD,
    features: [
      {
        id: 'advanced-features',
        name: 'Advanced Features',
        description: 'Enhanced functionality for power users',
      },
      {
        id: 'priority-support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
      },
      {
        id: 'analytics',
        name: 'Advanced Analytics',
        description: 'Detailed usage analytics and reporting',
      },
      { id: 'multi-team', name: 'Multi-Team Support', description: 'Support for multiple teams' },
      { id: 'data-export', name: 'Data Export', description: 'Export data in multiple formats' },
    ],
    description: 'Ideal for growing teams and businesses',
    maxUsers: 10,
    storageGB: 100,
    apiCalls: 10000,
    isPopular: true,
    isActive: true,
    displayOrder: 3,
    monthlyEquivalent: 29.99,
    metadata: {
      description: 'Professional plan for growing businesses',
      mostPopular: true,
      ctaText: 'Get Started',
      annualDiscount: 17,
      highlightColor: '#6366f1',
      badgeText: 'Most Popular',
    },
  },
  {
    plan: SubscriptionPlan.PRO,
    interval: BillingInterval.YEARLY,
    price: 299.99,
    currency: Currency.USD,
    features: [
      {
        id: 'advanced-features',
        name: 'Advanced Features',
        description: 'Enhanced functionality for power users',
      },
      {
        id: 'priority-support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
      },
      {
        id: 'analytics',
        name: 'Advanced Analytics',
        description: 'Detailed usage analytics and reporting',
      },
      { id: 'multi-team', name: 'Multi-Team Support', description: 'Support for multiple teams' },
      { id: 'data-export', name: 'Data Export', description: 'Export data in multiple formats' },
    ],
    description: 'Ideal for growing teams and businesses',
    maxUsers: 10,
    storageGB: 100,
    apiCalls: 10000,
    isActive: true,
    displayOrder: 4,
    monthlyEquivalent: 24.99,
    savingsPercentage: 17,
    metadata: {
      description: 'Professional plan for growing businesses',
      ctaText: 'Get Started',
      annualDiscount: 17,
      highlightColor: '#6366f1',
    },
  },
  {
    plan: SubscriptionPlan.ENTERPRISE,
    interval: BillingInterval.MONTHLY,
    price: 99.99,
    currency: Currency.USD,
    features: [
      {
        id: 'enterprise-features',
        name: 'Enterprise Features',
        description: 'Complete enterprise solution',
      },
      {
        id: 'dedicated-support',
        name: 'Dedicated Support',
        description: 'Dedicated account manager',
      },
      {
        id: 'custom-integrations',
        name: 'Custom Integrations',
        description: 'Custom integration development',
      },
      { id: 'audit-logs', name: 'Audit Logs', description: 'Comprehensive audit trail' },
      { id: 'sso', name: 'Single Sign-On (SSO)', description: 'Enterprise SSO integration' },
      {
        id: 'advanced-security',
        name: 'Advanced Security',
        description: 'Enterprise-grade security',
      },
      { id: 'custom-branding', name: 'Custom Branding', description: 'White-label solutions' },
    ],
    description: 'Complete solution for large organizations',
    maxUsers: Infinity,
    storageGB: Infinity,
    apiCalls: Infinity,
    isActive: true,
    displayOrder: 5,
    monthlyEquivalent: 99.99,
    metadata: {
      description: 'Custom solutions for large organizations',
      ctaText: 'Contact Sales',
      showContactButton: true,
      highlightColor: '#10b981',
    },
  },
  {
    plan: SubscriptionPlan.ENTERPRISE,
    interval: BillingInterval.YEARLY,
    price: 999.99,
    currency: Currency.USD,
    features: [
      {
        id: 'enterprise-features',
        name: 'Enterprise Features',
        description: 'Complete enterprise solution',
      },
      {
        id: 'dedicated-support',
        name: 'Dedicated Support',
        description: 'Dedicated account manager',
      },
      {
        id: 'custom-integrations',
        name: 'Custom Integrations',
        description: 'Custom integration development',
      },
      { id: 'audit-logs', name: 'Audit Logs', description: 'Comprehensive audit trail' },
      { id: 'sso', name: 'Single Sign-On (SSO)', description: 'Enterprise SSO integration' },
      {
        id: 'advanced-security',
        name: 'Advanced Security',
        description: 'Enterprise-grade security',
      },
      { id: 'custom-branding', name: 'Custom Branding', description: 'White-label solutions' },
    ],
    description: 'Complete solution for large organizations',
    maxUsers: Infinity,
    storageGB: Infinity,
    apiCalls: Infinity,
    isActive: true,
    displayOrder: 6,
    monthlyEquivalent: 83.33,
    savingsPercentage: 17,
    metadata: {
      description: 'Custom solutions for large organizations',
      ctaText: 'Contact Sales',
      showContactButton: true,
      annualDiscount: 17,
      highlightColor: '#10b981',
    },
  },
] as const;

/**
 * Utility function to validate the pricing table
 */
function validatePricingTable(table: EnhancedPricingTable): EnhancedPricingTable {
  // Check for multiple popular plans
  const popularPlans = table.filter((p) => p.isPopular);
  if (popularPlans.length > 1) {
    console.warn('Multiple popular plans detected - consider having only one highlighted plan');
  }

  // Check for duplicate plan-interval combinations
  const combinations = table.map((p) => `${p.plan}-${p.interval}`);
  const uniqueCombinations = new Set(combinations);
  if (combinations.length !== uniqueCombinations.size) {
    throw new Error('Duplicate plan-interval combinations found');
  }

  // Check for valid display orders
  const orders = table.map((p) => p.displayOrder);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    throw new Error('Duplicate display orders found');
  }

  // Validate metadata
  table.forEach((entry) => {
    if (!entry.metadata.description || !entry.metadata.ctaText) {
      throw new Error(`Missing required metadata for ${entry.plan}-${entry.interval}`);
    }
  });

  return table;
}

/**
 * The complete pricing table for all available subscription plans
 *
 * This export contains the validated pricing table with all plan tiers (FREE, PRO, ENTERPRISE)
 * and billing intervals (MONTHLY, YEARLY). Each entry includes comprehensive metadata
 * for UI rendering, feature lists, and pricing information.
 *
 * @example
 * // Get all active monthly plans
 * const monthlyPlans = validatedPricing.filter(p =>
 *   p.interval === BillingInterval.MONTHLY && p.isActive
 * );
 *
 * @example
 * // Get the popular plan
 * const popularPlan = validatedPricing.find(p => p.isPopular);
 *
 * @example
 * // Get all plans for a specific tier
 * const proPlans = validatedPricing.filter(p => p.plan === SubscriptionPlan.PRO);
 *
 * @example
 * // Get plans with savings (yearly plans)
 * const savingsPlans = validatedPricing.filter(p => p.savingsPercentage && p.savingsPercentage > 0);
 *
 * @example
 * // Access enhanced metadata
 * const plan = validatedPricing[0];
 * console.log(plan.metadata.ctaText); // "Sign Up"
 * console.log(plan.metadata.highlightColor); // "#64748b"
 *
 * @type {EnhancedPricingTable}
 * @readonly
 */
export const validatedPricing = validatePricingTable(pricing);

/**
 * Utility functions for enhanced pricing table
 */
export function getPopularPlan(table: EnhancedPricingTable): EnhancedPricingTableEntry | undefined {
  return table.find((entry) => entry.isPopular);
}

export function getPlanByMetadata(
  table: EnhancedPricingTable,
  plan: SubscriptionPlan,
  interval: BillingInterval,
): EnhancedPricingTableEntry | undefined {
  return table.find((entry) => entry.plan === plan && entry.interval === interval);
}

export function getPlansWithContactButton(
  table: EnhancedPricingTable,
): EnhancedPricingTableEntry[] {
  return table.filter((entry) => entry.metadata.showContactButton);
}

export function getPlansWithDiscount(table: EnhancedPricingTable): EnhancedPricingTableEntry[] {
  return table.filter(
    (entry) => entry.metadata.annualDiscount && entry.metadata.annualDiscount > 0,
  );
}

export function getMostPopularPlan(
  table: EnhancedPricingTable,
): EnhancedPricingTableEntry | undefined {
  return table.find((entry) => entry.metadata.mostPopular);
}

/**
 * Get all plans for a specific tier
 */
export function getPlanByTier(tier: SubscriptionPlan): EnhancedPricingTableEntry[] {
  return validatedPricing.filter((p) => p.plan === tier);
}

/**
 * Get the popular plan from validated pricing
 */
export function getPopularPlan(): EnhancedPricingTableEntry | undefined {
  return validatedPricing.find((p) => p.isPopular);
}

/**
 * Calculate monthly equivalent for any plan
 */
export function getMonthlyEquivalent(plan: EnhancedPricingTableEntry): number {
  if (plan.interval === BillingInterval.MONTHLY) return plan.price;
  return plan.price / 12;
}

/**
 * Get plans by interval
 */
export function getPlansByInterval(interval: BillingInterval): EnhancedPricingTableEntry[] {
  return validatedPricing.filter((p) => p.interval === interval);
}

/**
 * Get monthly plans only
 */
export function getMonthlyPlans(): EnhancedPricingTableEntry[] {
  return getPlansByInterval(BillingInterval.MONTHLY);
}

/**
 * Get yearly plans only
 */
export function getYearlyPlans(): EnhancedPricingTableEntry[] {
  return getPlansByInterval(BillingInterval.YEARLY);
}

/**
 * Compare monthly vs yearly plans for the same tier
 */
export function comparePlansByTier(tier: SubscriptionPlan): {
  monthly?: EnhancedPricingTableEntry;
  yearly?: EnhancedPricingTableEntry;
  savings?: number;
} {
  const plans = getPlanByTier(tier);
  const monthly = plans.find((p) => p.interval === BillingInterval.MONTHLY);
  const yearly = plans.find((p) => p.interval === BillingInterval.YEARLY);

  let savings: number | undefined;
  if (monthly && yearly) {
    savings = ((monthly.price * 12 - yearly.price) / (monthly.price * 12)) * 100;
  }

  return { monthly, yearly, savings };
}

/**
 * Get all active plans
 */
export function getActivePlans(): EnhancedPricingTableEntry[] {
  return validatedPricing.filter((p) => p.isActive !== false);
}

/**
 * Get plans with savings (yearly plans)
 */
export function getPlansWithSavings(): EnhancedPricingTableEntry[] {
  return validatedPricing.filter((p) => p.savingsPercentage && p.savingsPercentage > 0);
}
