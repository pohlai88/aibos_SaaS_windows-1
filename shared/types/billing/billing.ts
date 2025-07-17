import { z } from 'zod';
import { UUID, ISODate } from '../primitives';
import {
  SubscriptionPlan,
  BillingInterval,
  PlanFeature,
  BillingCycle,
  PlanPrice,
} from './billing.enums';

/**
 * Core billing types
 */

/**
 * Subscription interface representing an active subscription
 */
export interface Subscription {
  id: UUID;
  tenantId: UUID;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodStart: ISODate;
  currentPeriodEnd: ISODate;
  billingInterval: BillingInterval;
  amount: number;
  currency: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: ISODate;
  trialStart?: ISODate;
  trialEnd?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/**
 * Invoice interface for billing records
 */
export interface Invoice {
  id: UUID;
  subscriptionId: UUID;
  tenantId: UUID;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  amountPaid: number;
  amountDue: number;
  periodStart: ISODate;
  periodEnd: ISODate;
  dueDate: ISODate;
  paidAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/**
 * Payment method interface
 */
export interface PaymentMethod {
  id: UUID;
  tenantId: UUID;
  type: 'card' | 'bank_account' | 'paypal';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/**
 * Usage tracking interface
 */
export interface Usage {
  id: UUID;
  tenantId: UUID;
  period: string; // YYYY-MM format
  metric: 'api_calls' | 'storage_gb' | 'seats';
  usage: number;
  limit: number;
  overage: number;
  createdAt: ISODate;
}

/**
 * Billing address interface
 */
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isCommercial: boolean;
}

/**
 * Tax information interface
 */
export interface TaxInfo {
  id: UUID;
  tenantId: UUID;
  type: 'vat' | 'gst' | 'tax_id';
  number: string;
  country: string;
  isValid: boolean;
  verifiedAt?: ISODate;
  createdAt: ISODate;
}

/**
 * Plan upgrade/downgrade request
 */
export interface PlanChangeRequest {
  tenantId: UUID;
  currentPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  effectiveDate: 'immediate' | 'end_of_period';
  reason?: string;
  requestedBy: UUID;
  createdAt: ISODate;
}

/**
 * Billing settings for a tenant
 */
export interface BillingSettings {
  tenantId: UUID;
  autoRenew: boolean;
  paymentMethodId?: UUID;
  billingAddress?: BillingAddress;
  taxInfo?: TaxInfo;
  invoiceSettings: {
    sendInvoices: boolean;
    invoiceEmail: string;
    invoicePrefix: string;
  };
  createdAt: ISODate;
  updatedAt: ISODate;
}

/**
 * Billing API response types
 */

/**
 * Get subscription response
 */
export interface GetSubscriptionResponse {
  subscription: Subscription;
  usage: {
    apiCalls: Usage;
    storage: Usage;
    seats: Usage;
  };
  nextBillingDate: ISODate;
  canUpgrade: boolean;
  canDowngrade: boolean;
}

/**
 * Get billing history response
 */
export interface GetBillingHistoryResponse {
  invoices: Invoice[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Create subscription request
 */
export interface CreateSubscriptionRequest {
  tenantId: UUID;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  paymentMethodId?: UUID;
  trialDays?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Update subscription request
 */
export interface UpdateSubscriptionRequest {
  plan?: SubscriptionPlan;
  billingInterval?: BillingInterval;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Utility functions for billing operations
 */

/**
 * Check if a subscription is active
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Check if a subscription is in trial
 */
export function isSubscriptionTrialing(subscription: Subscription): boolean {
  return subscription.status === 'trialing';
}

/**
 * Check if a subscription is past due
 */
export function isSubscriptionPastDue(subscription: Subscription): boolean {
  return subscription.status === 'past_due';
}

/**
 * Calculate days until next billing
 */
export function daysUntilNextBilling(subscription: Subscription): number {
  const now = new Date();
  const nextBilling = new Date(subscription.currentPeriodEnd);
  const diffTime = nextBilling.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if usage is within limits
 */
export function isUsageWithinLimit(usage: Usage): boolean {
  return usage.usage <= usage.limit;
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(usage: Usage): number {
  return (usage.usage / usage.limit) * 100;
}

/**
 * Get overage amount
 */
export function getOverageAmount(usage: Usage): number {
  return Math.max(0, usage.usage - usage.limit);
}
