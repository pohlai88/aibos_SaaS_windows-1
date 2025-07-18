import { z } from 'zod';
import { SubscriptionPlan, BillingInterval } from './billing.enums';
import type { Currency } from './currency.enums';

/**
 * Feature interface for structured feature definitions
 */
export interface Feature {
  id: string;
  name: string;
  description?: string;
  tooltip?: string;
  icon?: string;
  isHighlighted?: boolean;
}

/**
 * Schema for Feature objects
 */
export const FeatureSchema = z.object({
  id: z.string().min(1).describe('Unique identifier for the feature'),
  name: z.string().min(1).describe('Display name of the feature'),
  description: z.string().optional().describe('Detailed description of the feature'),
  tooltip: z.string().optional().describe('Short tooltip text for UI display'),
  icon: z.string().optional().describe('Icon identifier or URL for the feature'),
  isHighlighted: z.boolean().optional().describe('Whether this feature should be highlighted'),
});

/**
 * Schema for individual pricing table entries
 */
export const PricingTableEntrySchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan).describe('The subscription plan type'),
  interval: z.nativeEnum(BillingInterval).describe('Billing frequency'),
  price: z
    .number()
    .positive()
    .refine((val) => val % 0.01 === 0, 'Price must have at most 2 decimal places')
    .describe('Price amount'),
  currency: z.nativeEnum(Currency).describe('Currency for pricing'),
  features: z
    .array(FeatureSchema)
    .nonempty('At least one feature must be specified')
    .describe('List of features included in this plan'),
  // Metadata fields
  isPopular: z.boolean().optional().describe('Whether this plan is highlighted as popular'),
  isActive: z.boolean().default(true).describe('Whether this plan is currently available'),
  displayOrder: z.number().int().nonnegative().describe('Order for display in pricing table'),
  // Additional metadata
  description: z.string().optional().describe('Optional description of the plan'),
  maxUsers: z.number().int().positive().optional().describe('Maximum number of users allowed'),
  storageGB: z.number().positive().optional().describe('Storage limit in GB'),
  apiCalls: z.number().int().positive().optional().describe('API call limit per month'),
  // Calculated fields
  monthlyEquivalent: z
    .number()
    .positive()
    .optional()
    .describe('Monthly equivalent price for annual plans'),
  savingsPercentage: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Savings percentage compared to monthly billing'),
});

/**
 * Schema for complete pricing table
 */
export const PricingTableSchema = z
  .array(PricingTableEntrySchema)
  .min(1, 'Pricing table must contain at least one entry')
  .refine((entries) => {
    // Ensure no duplicate plan-interval combinations
    const combinations = entries.map((e) => `${e.plan}-${e.interval}`);
    return new Set(combinations).size === combinations.length;
  }, 'Duplicate plan-interval combinations are not allowed')
  .refine((entries) => {
    // Ensure display orders are unique
    const orders = entries.map((e) => e.displayOrder);
    return new Set(orders).size === orders.length;
  }, 'Display orders must be unique');

/**
 * Schema for pricing table with versioning
 */
export const PricingTableV1Schema = PricingTableSchema.extend({
  _schema_version: z.literal(1).default(1),
  lastUpdated: z.string().datetime().optional(),
});

// Type exports
export type PricingTableEntry = z.infer<typeof PricingTableEntrySchema>;
export type PricingTable = z.infer<typeof PricingTableSchema>;
export type PricingTableV1 = z.infer<typeof PricingTableV1Schema>;

// Filter types
export type ActivePricingTable = Array<PricingTableEntry & { isActive: true }>;

export type PopularPricingTableEntry = PricingTableEntry & { isPopular: true };

// Grouped types
export type PricingTableByPlan = Record<SubscriptionPlan, PricingTableEntry[]>;
export type PricingTableByInterval = Record<BillingInterval, PricingTable>;

// Utility functions
export function validatePricingTable(data: unknown): PricingTable {
  return PricingTableSchema.parse(data);
}

export function validatePricingTableEntry(data: unknown): PricingTableEntry {
  return PricingTableEntrySchema.parse(data);
}

/**
 * Creates a pricing table entry with defaults
 */
export function createPricingTableEntry(
  data: z.input<typeof PricingTableEntrySchema>,
): PricingTableEntry {
  return PricingTableEntrySchema.parse({
    isActive: true,
    displayOrder: 0,
    ...data,
  });
}

/**
 * Calculates monthly equivalent price for annual plans
 */
export function calculateMonthlyEquivalent(price: number, interval: BillingInterval): number {
  if (interval === BillingInterval.YEARLY) {
    return price / 12;
  }
  return price;
}

/**
 * Calculates savings percentage for annual vs monthly plans
 */
export function calculateSavingsPercentage(annualPrice: number, monthlyPrice: number): number {
  const annualTotal = monthlyPrice * 12;
  const savings = annualTotal - annualPrice;
  return Math.round((savings / annualTotal) * 100);
}

/**
 * Creates a feature object with validation
 */
export function createFeature(data: z.input<typeof FeatureSchema>): Feature {
  return FeatureSchema.parse(data);
}

/**
 * Gets highlighted features from a pricing entry
 */
export function getHighlightedFeatures(entry: PricingTableEntry): Feature[] {
  return entry.features.filter((feature) => feature.isHighlighted);
}

/**
 * Finds a feature by ID in a pricing entry
 */
export function findFeatureById(entry: PricingTableEntry, featureId: string): Feature | undefined {
  return entry.features.find((feature) => feature.id === featureId);
}

// Pricing table utilities
export function createPricingTable(entries: PricingTableEntry[]): PricingTable {
  return PricingTableSchema.parse(entries);
}

export function getActivePricing(table: PricingTable): ActivePricingTable {
  return table.filter((entry) => entry.isActive !== false) as ActivePricingTable;
}

export function calculateMonthlyEquivalent(entry: PricingTableEntry): number {
  return entry.interval === BillingInterval.YEARLY ? entry.price / 12 : entry.price;
}

export function calculateSavingsPercentage(
  annualEntry: PricingTableEntry,
  monthlyEntry: PricingTableEntry,
): number {
  if (
    annualEntry.interval !== BillingInterval.YEARLY ||
    monthlyEntry.interval !== BillingInterval.MONTHLY ||
    annualEntry.plan !== monthlyEntry.plan
  ) {
    throw new Error('Invalid comparison');
  }
  return ((monthlyEntry.price * 12 - annualEntry.price) / (monthlyEntry.price * 12)) * 100;
}

/**
 * Sorts pricing table entries by display order
 */
export function sortPricingTable(entries: PricingTableEntry[]): PricingTableEntry[] {
  return [...entries].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Filters pricing table to show only active entries
 */
export function getActivePricingTable(entries: PricingTableEntry[]): PricingTableEntry[] {
  return entries.filter((entry) => entry.isActive);
}

/**
 * Gets popular plans from pricing table
 */
export function getPopularPlans(entries: PricingTableEntry[]): PricingTableEntry[] {
  return entries.filter((entry) => entry.isPopular);
}

/**
 * Groups pricing table by plan
 */
export function groupByPlan(
  entries: PricingTableEntry[],
): Record<SubscriptionPlan, PricingTableEntry[]> {
  return entries.reduce(
    (acc, entry) => {
      if (!acc[entry.plan]) {
        acc[entry.plan] = [];
      }
      acc[entry.plan].push(entry);
      return acc;
    },
    {} as Record<SubscriptionPlan, PricingTableEntry[]>,
  );
}

/**
 * Groups pricing table by interval
 */
export function groupByInterval(
  entries: PricingTableEntry[],
): Record<BillingInterval, PricingTableEntry[]> {
  return entries.reduce(
    (acc, entry) => {
      if (!acc[entry.interval]) {
        acc[entry.interval] = [];
      }
      acc[entry.interval].push(entry);
      return acc;
    },
    {} as Record<BillingInterval, PricingTableEntry[]>,
  );
}
