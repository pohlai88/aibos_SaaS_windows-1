import { z } from 'zod';
import { SubscriptionPlan, BillingInterval, PlanFeature } from '../types/billing/billing.enums';
import { ISODate } from '../types/primitives';

/**
 * Billing validation schemas
 */

// Reusable schemas
const ISODateSchema = z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/);
const UUIDSchema = z.string().uuid();

/**
 * Subscription plan schema
 */
export const SubscriptionPlanSchema = z.nativeEnum(SubscriptionPlan);

/**
 * Billing interval schema
 */
export const BillingIntervalSchema = z.nativeEnum(BillingInterval);

/**
 * Plan feature schema
 */
export const PlanFeatureSchema = z.nativeEnum(PlanFeature);

/**
 * Billing address schema
 */
export const BillingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters').optional(),
  country: z.string().length(2, 'Country must be 2 characters'),
  postalCode: z.string().min(1, 'Postal code is required'),
  isCommercial: z.boolean(),
});

/**
 * Payment method schema
 */
export const PaymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_account', 'paypal']),
  brand: z.string().optional(),
  last4: z.string().length(4).optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(new Date().getFullYear()).optional(),
  isDefault: z.boolean().default(false),
});

/**
 * Tax information schema
 */
export const TaxInfoSchema = z.object({
  type: z.enum(['vat', 'gst', 'tax_id']),
  number: z.string().min(1, 'Tax number is required'),
  country: z.string().length(2, 'Country must be 2 characters'),
  isValid: z.boolean().default(false),
});

/**
 * Create subscription request schema
 */
export const CreateSubscriptionSchema = z.object({
  tenantId: UUIDSchema,
  plan: SubscriptionPlanSchema,
  billingInterval: BillingIntervalSchema,
  paymentMethodId: UUIDSchema.optional(),
  trialDays: z.number().min(0).max(30).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update subscription request schema
 */
export const UpdateSubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema.optional(),
  billingInterval: BillingIntervalSchema.optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Plan change request schema
 */
export const PlanChangeRequestSchema = z.object({
  tenantId: UUIDSchema,
  currentPlan: SubscriptionPlanSchema,
  newPlan: SubscriptionPlanSchema,
  billingInterval: BillingIntervalSchema,
  effectiveDate: z.enum(['immediate', 'end_of_period']),
  reason: z.string().max(500).optional(),
  requestedBy: UUIDSchema,
});

/**
 * Billing settings schema
 */
export const BillingSettingsSchema = z.object({
  tenantId: UUIDSchema,
  autoRenew: z.boolean(),
  paymentMethodId: UUIDSchema.optional(),
  billingAddress: BillingAddressSchema.optional(),
  taxInfo: TaxInfoSchema.optional(),
  invoiceSettings: z.object({
    sendInvoices: z.boolean(),
    invoiceEmail: z.string().email('Invalid invoice email'),
    invoicePrefix: z.string().min(1).max(10, 'Invoice prefix too long'),
  }),
});

/**
 * Usage tracking schema
 */
export const UsageSchema = z.object({
  tenantId: UUIDSchema,
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM format'),
  metric: z.enum(['api_calls', 'storage_gb', 'seats']),
  usage: z.number().min(0),
  limit: z.number().min(0),
  overage: z.number().min(0),
});

/**
 * Invoice schema
 */
export const InvoiceSchema = z.object({
  subscriptionId: UUIDSchema,
  tenantId: UUIDSchema,
  number: z.string().min(1, 'Invoice number is required'),
  status: z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  amountPaid: z.number().min(0, 'Amount paid must be non-negative'),
  amountDue: z.number().min(0, 'Amount due must be non-negative'),
  periodStart: ISODateSchema,
  periodEnd: ISODateSchema,
  dueDate: ISODateSchema,
  paidAt: ISODateSchema.optional(),
});

/**
 * Subscription schema
 */
export const SubscriptionSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  plan: SubscriptionPlanSchema,
  status: z.enum(['active', 'canceled', 'past_due', 'trialing', 'unpaid']),
  currentPeriodStart: ISODateSchema,
  currentPeriodEnd: ISODateSchema,
  billingInterval: BillingIntervalSchema,
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  cancelAtPeriodEnd: z.boolean(),
  canceledAt: ISODateSchema.optional(),
  trialStart: ISODateSchema.optional(),
  trialEnd: ISODateSchema.optional(),
  createdAt: ISODateSchema,
  updatedAt: ISODateSchema,
});

/**
 * Validation functions
 */

/**
 * Validate subscription plan upgrade path
 */
export function validatePlanUpgrade(
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
): { isValid: boolean; error?: string } {
  const planHierarchy = {
    [SubscriptionPlan.FREE]: 0,
    [SubscriptionPlan.PRO]: 1,
    [SubscriptionPlan.ENTERPRISE]: 2,
  };

  const currentLevel = planHierarchy[currentPlan];
  const newLevel = planHierarchy[newPlan];

  if (newLevel <= currentLevel) {
    return {
      isValid: false,
      error: `Cannot upgrade from ${currentPlan} to ${newPlan}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate billing interval for plan
 */
export function validateBillingInterval(
  plan: SubscriptionPlan,
  interval: BillingInterval,
): { isValid: boolean; error?: string } {
  // Free plan can only be monthly
  if (plan === SubscriptionPlan.FREE && interval === BillingInterval.YEARLY) {
    return {
      isValid: false,
      error: 'Free plan only supports monthly billing',
    };
  }

  return { isValid: true };
}

/**
 * Validate usage against plan limits
 */
export function validateUsage(
  plan: SubscriptionPlan,
  usage: { seats: number; storageGB: number; apiCalls: number },
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const planMetadata = require('../types/billing/billing.enums').PlanMetadataMap[plan];

  if (planMetadata.limits.seats && usage.seats > planMetadata.limits.seats) {
    errors.push(`Seats usage (${usage.seats}) exceeds plan limit (${planMetadata.limits.seats})`);
  }

  if (planMetadata.limits.storageGB && usage.storageGB > planMetadata.limits.storageGB) {
    errors.push(
      `Storage usage (${usage.storageGB}GB) exceeds plan limit (${planMetadata.limits.storageGB}GB)`,
    );
  }

  if (planMetadata.limits.apiCalls && usage.apiCalls > planMetadata.limits.apiCalls) {
    errors.push(
      `API calls usage (${usage.apiCalls}) exceeds plan limit (${planMetadata.limits.apiCalls})`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
