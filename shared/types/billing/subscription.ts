import { SubscriptionPlan, BillingInterval } from './billing.enums';
import type { Currency } from './currency.enums';
import { CurrencyUtils, Money } from './currency.enums';
import type { UUID, ISODate } from '../primitives';
import type { ApiResponse, PaginatedResponse  } from '../api';

/**
 * Subscription status lifecycle
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  EXPIRED = 'expired',
}

/**
 * Detailed subscription interface with payment metadata
 */
export interface Subscription {
  subscription_id: UUID;
  tenant_id: UUID;
  external_id?: string; // Payment processor ID (e.g., Stripe subscription ID)
  plan: SubscriptionPlan;
  interval: BillingInterval;
  price: number;
  currency: Currency;
  status: SubscriptionStatus;
  start_date: ISODate;
  end_date?: ISODate;
  trial_end_date?: ISODate;
  current_period_start: ISODate;
  current_period_end: ISODate;
  cancel_at_period_end?: boolean;
  payment_method_id?: UUID;
  invoice_settings?: {
    default_payment_method?: UUID;
    billing_thresholds?: {
      amount_gte?: number;
    };
  };
  metadata?: Record<string, string>;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * Subscription creation payload
 */
export interface CreateSubscriptionPayload {
  tenant_id: UUID;
  plan: SubscriptionPlan;
  interval: BillingInterval;
  payment_method_id?: UUID;
  trial_period_days?: number;
  coupon_code?: string;
  metadata?: Record<string, string>;
}

/**
 * Subscription update payload
 */
export interface UpdateSubscriptionPayload {
  plan?: SubscriptionPlan;
  interval?: BillingInterval;
  payment_method_id?: UUID;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Subscription invoice information
 */
export interface SubscriptionInvoice {
  invoice_id: UUID;
  subscription_id: UUID;
  tenant_id: UUID;
  amount_due: number;
  currency: Currency;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  period_start: ISODate;
  period_end: ISODate;
  due_date: ISODate;
  paid_at?: ISODate;
  pdf_url?: string;
  invoice_number: string;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * Subscription usage tracking
 */
export interface SubscriptionUsage {
  usage_id: UUID;
  subscription_id: UUID;
  tenant_id: UUID;
  metric: 'api_calls' | 'storage_gb' | 'seats' | 'custom';
  usage: number;
  limit: number;
  overage: number;
  period: string; // YYYY-MM format
  created_at: ISODate;
}

/**
 * Subscription plan change request
 */
export interface PlanChangeRequest {
  request_id: UUID;
  subscription_id: UUID;
  tenant_id: UUID;
  current_plan: SubscriptionPlan;
  new_plan: SubscriptionPlan;
  effective_date: 'immediate' | 'end_of_period';
  reason?: string;
  requested_by: UUID;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: ISODate;
  processed_at?: ISODate;
}

/**
 * Enhanced utility functions for subscriptions
 */
export class SubscriptionUtils {
  /**
   * Checks if subscription is currently active
   */
  static isActive(subscription: Subscription): boolean {
    return [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.TRIALING,
      SubscriptionStatus.PAST_DUE,
    ].includes(subscription.status);
  }

  /**
   * Calculates days remaining until subscription ends
   */
  static daysRemaining(subscription: Subscription): number {
    const endDate = subscription.end_date
      ? new Date(subscription.end_date)
      : new Date(subscription.current_period_end);
    return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Formats subscription price with currency using our enhanced currency system
   */
  static formatPrice(subscription: Subscription): string {
    return CurrencyUtils.format(subscription.price, subscription.currency);
  }

  /**
   * Formats subscription price as Money object
   */
  static getPriceAsMoney(subscription: Subscription): Money {
    return {
      amount: subscription.price,
      currency: subscription.currency,
    };
  }

  /**
   * Checks if subscription is in trial period
   */
  static isTrial(subscription: Subscription): boolean {
    return (
      subscription.status === SubscriptionStatus.TRIALING ||
      (subscription.trial_end_date && new Date(subscription.trial_end_date) > new Date())
    );
  }

  /**
   * Checks if subscription is past due
   */
  static isPastDue(subscription: Subscription): boolean {
    return subscription.status === SubscriptionStatus.PAST_DUE;
  }

  /**
   * Checks if subscription is canceled
   */
  static isCanceled(subscription: Subscription): boolean {
    return (
      subscription.status === SubscriptionStatus.CANCELED ||
      subscription.cancel_at_period_end === true
    );
  }

  /**
   * Calculates next billing date
   */
  static getNextBillingDate(subscription: Subscription): Date {
    return new Date(subscription.current_period_end);
  }

  /**
   * Calculates trial days remaining
   */
  static trialDaysRemaining(subscription: Subscription): number | null {
    if (!subscription.trial_end_date) return null;

    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();

    if (trialEnd <= now) return 0;

    return Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets subscription status display text
   */
  static getStatusDisplay(subscription: Subscription): string {
    switch (subscription.status) {
      case SubscriptionStatus.TRIALING:
        return 'Trial';
      case SubscriptionStatus.ACTIVE:
        return 'Active';
      case SubscriptionStatus.PAST_DUE:
        return 'Past Due';
      case SubscriptionStatus.PAUSED:
        return 'Paused';
      case SubscriptionStatus.CANCELED:
        return 'Canceled';
      case SubscriptionStatus.EXPIRED:
        return 'Expired';
      case SubscriptionStatus.UNPAID:
        return 'Unpaid';
      default:
        return 'Unknown';
    }
  }

  /**
   * Checks if subscription can be upgraded
   */
  static canUpgrade(subscription: Subscription): boolean {
    if (!this.isActive(subscription)) return false;

    // Get plan metadata to check upgrade paths
    const { getPlanMetadata } = require('./billing.enums');
    const currentPlanMeta = getPlanMetadata(subscription.plan);

    return currentPlanMeta.upgradeableTo.length > 0;
  }

  /**
   * Gets available upgrade plans
   */
  static getAvailableUpgrades(subscription: Subscription): SubscriptionPlan[] {
    if (!this.canUpgrade(subscription)) return [];

    const { getPlanMetadata } = require('./billing.enums');
    const currentPlanMeta = getPlanMetadata(subscription.plan);

    return currentPlanMeta.upgradeableTo;
  }

  /**
   * Calculates prorated amount for plan change
   */
  static calculateProratedAmount(
    subscription: Subscription,
    newPlan: SubscriptionPlan,
    changeDate: Date = new Date(),
  ): number {
    const { getPlanMetadata } = require('./billing.enums');
    const currentPlanMeta = getPlanMetadata(subscription.plan);
    const newPlanMeta = getPlanMetadata(newPlan);

    const currentPeriodEnd = new Date(subscription.current_period_end);
    const daysRemaining = Math.ceil(
      (currentPeriodEnd.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalDays = Math.ceil(
      (currentPeriodEnd.getTime() - new Date(subscription.current_period_start).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const currentPlanDailyRate = currentPlanMeta.basePrice / totalDays;
    const newPlanDailyRate = newPlanMeta.basePrice / totalDays;

    const currentPlanRemainingValue = currentPlanDailyRate * daysRemaining;
    const newPlanRemainingValue = newPlanDailyRate * daysRemaining;

    return newPlanRemainingValue - currentPlanRemainingValue;
  }

  /**
   * Validates subscription data
   */
  static validateSubscription(subscription: Subscription): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!subscription.subscription_id) errors.push('Subscription ID is required');
    if (!subscription.tenant_id) errors.push('Tenant ID is required');
    if (!subscription.plan) errors.push('Plan is required');
    if (!subscription.interval) errors.push('Billing interval is required');
    if (subscription.price < 0) errors.push('Price cannot be negative');
    if (!subscription.currency) errors.push('Currency is required');
    if (!subscription.status) errors.push('Status is required');

    // Date validation
    if (subscription.start_date && subscription.end_date) {
      const startDate = new Date(subscription.start_date);
      const endDate = new Date(subscription.end_date);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    if (subscription.current_period_start && subscription.current_period_end) {
      const periodStart = new Date(subscription.current_period_start);
      const periodEnd = new Date(subscription.current_period_end);
      if (periodEnd <= periodStart) {
        errors.push('Current period end must be after current period start');
      }
    }

    // Status-specific validation
    if (subscription.status === SubscriptionStatus.TRIALING && !subscription.trial_end_date) {
      warnings.push('Trial subscription should have trial end date');
    }

    if (subscription.status === SubscriptionStatus.CANCELED && !subscription.end_date) {
      warnings.push('Canceled subscription should have end date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Subscription analytics and reporting
 */
export interface SubscriptionAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  canceled_subscriptions: number;
  past_due_subscriptions: number;
  monthly_recurring_revenue: Money;
  annual_recurring_revenue: Money;
  average_subscription_value: Money;
  churn_rate: number;
  trial_conversion_rate: number;
  plan_distribution: Record<SubscriptionPlan, number>;
  currency_distribution: Record<Currency, number>;
}

/**
 * API response types
 */
export type SubscriptionResponse = ApiResponse<Subscription>;
export type SubscriptionListResponse = PaginatedResponse<Subscription>;
export type SubscriptionInvoiceResponse = ApiResponse<SubscriptionInvoice[]>;
export type SubscriptionUsageResponse = ApiResponse<SubscriptionUsage[]>;
export type PlanChangeRequestResponse = ApiResponse<PlanChangeRequest>;
export type SubscriptionAnalyticsResponse = ApiResponse<SubscriptionAnalytics>;

/**
 * Subscription webhook events
 */
export enum SubscriptionEvent {
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELED = 'subscription.canceled',
  SUBSCRIPTION_RENEWED = 'subscription.renewed',
  SUBSCRIPTION_TRIAL_ENDED = 'subscription.trial_ended',
  SUBSCRIPTION_PAST_DUE = 'subscription.past_due',
  INVOICE_CREATED = 'invoice.created',
  INVOICE_PAID = 'invoice.paid',
  INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
}

/**
 * Subscription webhook payload
 */
export interface SubscriptionWebhookPayload {
  event: SubscriptionEvent;
  subscription_id: UUID;
  tenant_id: UUID;
  timestamp: ISODate;
  data: Subscription | SubscriptionInvoice;
  metadata?: Record<string, unknown>;
}

// Example usage:
const subscription: Subscription = {
  subscription_id: 'sub_123',
  tenant_id: 'tenant_456',
  plan: SubscriptionPlan.PRO,
  interval: BillingInterval.MONTHLY,
  price: 29.99,
  currency: Currency.USD,
  status: SubscriptionStatus.ACTIVE,
  start_date: '2023-01-01T00:00:00Z',
  current_period_start: '2023-06-01T00:00:00Z',
  current_period_end: '2023-07-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-06-01T00:00:00Z',
};

// Example usage (remove console.log statements for production):
// SubscriptionUtils.isActive(subscription); // true
// SubscriptionUtils.daysRemaining(subscription); // 15
// SubscriptionUtils.formatPrice(subscription); // "$29.99"
// SubscriptionUtils.canUpgrade(subscription); // true
// SubscriptionUtils.getAvailableUpgrades(subscription); // [SubscriptionPlan.ENTERPRISE]
