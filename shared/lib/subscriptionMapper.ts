import { SubscriptionPlan } from "@shared/types/tenant/tenant.enums";

/**
 * Maps API plan strings to strongly-typed SubscriptionPlan enum values
 * @param input Plan string received from API
 * @returns Corresponding SubscriptionPlan enum value
 * @throws {Error} When input doesn't match any known plan
 */
export function mapApiPlanToSubscriptionPlan(input: string): SubscriptionPlan {
  const planMap: Readonly<Record<string, SubscriptionPlan>> = {
    free: SubscriptionPlan.FREE,
    pro: SubscriptionPlan.PRO,
    enterprise: SubscriptionPlan.ENTERPRISE,
    trial: SubscriptionPlan.TRIAL, // Include all enum values
  } as const;

  const normalizedInput = input.toLowerCase();
  const mappedPlan = planMap[normalizedInput];

  if (!mappedPlan) {
    throw new Error(`Invalid subscription plan received: "${input}". 
      Expected one of: ${Object.keys(planMap).join(', ')}`);
  }

  return mappedPlan;
}

/**
 * Type guard for checking if a string is a valid SubscriptionPlan
 */
export function isSubscriptionPlan(value: string): value is SubscriptionPlan {
  return Object.values(SubscriptionPlan).includes(value as SubscriptionPlan);
}

/**
 * Gets the display name for a subscription plan
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  const displayNames: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]: 'Free Tier',
    [SubscriptionPlan.TRIAL]: 'Trial Period',
    [SubscriptionPlan.PRO]: 'Professional',
    [SubscriptionPlan.ENTERPRISE]: 'Enterprise',
  };
  return displayNames[plan];
}

/**
 * Compares two plans based on their hierarchy level
 * @returns Positive if a is higher, negative if b is higher, 0 if equal
 */
export function comparePlans(a: SubscriptionPlan, b: SubscriptionPlan): number {
  const planHierarchy: Record<SubscriptionPlan, number> = {
    [SubscriptionPlan.FREE]: 0,
    [SubscriptionPlan.TRIAL]: 1,
    [SubscriptionPlan.PRO]: 2,
    [SubscriptionPlan.ENTERPRISE]: 3,
  };
  return planHierarchy[a] - planHierarchy[b];
} 