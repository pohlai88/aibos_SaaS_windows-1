import { SubscriptionPlan, BillingInterval } from "../types/billing/billing.enums";

/**
 * Centralized mapping of Stripe product IDs to internal SubscriptionPlan values.
 * This is the single source of truth (SSOT) for product mapping.
 */
const STRIPE_PRODUCT_MAP: Record<string, SubscriptionPlan> = {
  prod_free: SubscriptionPlan.FREE,
  prod_pro: SubscriptionPlan.PRO,
  prod_enterprise: SubscriptionPlan.ENTERPRISE,
  // Add future products here
};

/**
 * Maps Stripe product IDs to internal SubscriptionPlan values
 * @param stripeProductId - The Stripe product ID (e.g., 'prod_free')
 * @returns The corresponding SubscriptionPlan
 * @throws {Error} When an unknown Stripe product ID is provided
 */
export function mapStripePlan(stripeProductId: string): SubscriptionPlan {
  const plan = STRIPE_PRODUCT_MAP[stripeProductId];
  if (!plan) {
    throw new Error(`Unknown Stripe product ID: ${stripeProductId}`);
  }
  return plan;
}

/**
 * Reverse mapping: get Stripe product ID from SubscriptionPlan
 */
export function getStripeProductId(plan: SubscriptionPlan): string {
  const entry = Object.entries(STRIPE_PRODUCT_MAP).find(([, value]) => value === plan);
  if (!entry) {
    throw new Error(`No Stripe product ID mapped for plan: ${plan}`);
  }
  return entry[0];
}

/**
 * Type-safe version that returns undefined instead of throwing
 */
export function tryGetStripeProductId(plan: SubscriptionPlan): string | undefined {
  return Object.entries(STRIPE_PRODUCT_MAP).find(([, value]) => value === plan)?.[0];
}

/**
 * Stripe interval mapping
 */
const STRIPE_INTERVAL_MAP = {
  month: BillingInterval.MONTHLY,
  year: BillingInterval.YEARLY,
} as const;

export function mapStripeInterval(stripeInterval: string): BillingInterval {
  const interval = STRIPE_INTERVAL_MAP[stripeInterval as keyof typeof STRIPE_INTERVAL_MAP];
  if (!interval) {
    throw new Error(`Unknown Stripe interval: ${stripeInterval}`);
  }
  return interval;
}

/**
 * For TypeScript exhaustiveness checking
 */
export function assertNeverPlan(plan: never): never {
  throw new Error(`Unhandled subscription plan: ${plan}`);
}

// Export the map for testing purposes
export const TESTING_ONLY = {
  getStripeProductMap: () => ({ ...STRIPE_PRODUCT_MAP }),
  getStripeIntervalMap: () => ({ ...STRIPE_INTERVAL_MAP }),
}; 