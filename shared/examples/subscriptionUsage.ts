import { 
  Subscription, 
  SubscriptionStatus, 
  SubscriptionUtils,
  SubscriptionInvoice,
  SubscriptionUsage,
  PlanChangeRequest,
  SubscriptionAnalytics,
  SubscriptionEvent
} from '../types/billing/subscription';
import { 
  SubscriptionPlan, 
  BillingInterval, 
  Currency 
} from '../types/billing/subscription';
import { CurrencyUtils } from '../types/billing/currency.enums';

/**
 * Example 1: Basic Subscription Operations
 */
export function exampleBasicSubscriptionOperations() {
  console.log('=== Basic Subscription Operations ===');
  
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

  console.log(`Is Active: ${SubscriptionUtils.isActive(subscription)}`);
  console.log(`Days Remaining: ${SubscriptionUtils.daysRemaining(subscription)}`);
  console.log(`Formatted Price: ${SubscriptionUtils.formatPrice(subscription)}`);
  console.log(`Status Display: ${SubscriptionUtils.getStatusDisplay(subscription)}`);
  console.log(`Next Billing: ${SubscriptionUtils.getNextBillingDate(subscription).toDateString()}`);
}

/**
 * Example 2: Trial Subscription
 */
export function exampleTrialSubscription() {
  console.log('=== Trial Subscription ===');
  
  const trialSubscription: Subscription = {
    subscription_id: 'sub_trial_123',
    tenant_id: 'tenant_456',
    plan: SubscriptionPlan.PRO,
    interval: BillingInterval.MONTHLY,
    price: 29.99,
    currency: Currency.USD,
    status: SubscriptionStatus.TRIALING,
    start_date: '2023-06-01T00:00:00Z',
    trial_end_date: '2023-06-15T00:00:00Z',
    current_period_start: '2023-06-01T00:00:00Z',
    current_period_end: '2023-07-01T00:00:00Z',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z',
  };

  console.log(`Is Trial: ${SubscriptionUtils.isTrial(trialSubscription)}`);
  console.log(`Trial Days Remaining: ${SubscriptionUtils.trialDaysRemaining(trialSubscription)}`);
  console.log(`Status Display: ${SubscriptionUtils.getStatusDisplay(trialSubscription)}`);
}

/**
 * Example 3: Southeast Asian Currency Subscriptions
 */
export function exampleSoutheastAsianSubscriptions() {
  console.log('=== Southeast Asian Currency Subscriptions ===');
  
  const seaSubscriptions: Subscription[] = [
    {
      subscription_id: 'sub_myr_123',
      tenant_id: 'tenant_my',
      plan: SubscriptionPlan.PRO,
      interval: BillingInterval.MONTHLY,
      price: 125.00,
      currency: Currency.MYR,
      status: SubscriptionStatus.ACTIVE,
      start_date: '2023-01-01T00:00:00Z',
      current_period_start: '2023-06-01T00:00:00Z',
      current_period_end: '2023-07-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z',
    },
    {
      subscription_id: 'sub_thb_456',
      tenant_id: 'tenant_th',
      plan: SubscriptionPlan.ENTERPRISE,
      interval: BillingInterval.YEARLY,
      price: 18000.00,
      currency: Currency.THB,
      status: SubscriptionStatus.ACTIVE,
      start_date: '2023-01-01T00:00:00Z',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: '2024-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      subscription_id: 'sub_sgd_789',
      tenant_id: 'tenant_sg',
      plan: SubscriptionPlan.PRO,
      interval: BillingInterval.MONTHLY,
      price: 40.50,
      currency: Currency.SGD,
      status: SubscriptionStatus.ACTIVE,
      start_date: '2023-01-01T00:00:00Z',
      current_period_start: '2023-06-01T00:00:00Z',
      current_period_end: '2023-07-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z',
    }
  ];

  seaSubscriptions.forEach(sub => {
    console.log(`\n${sub.currency} Subscription:`);
    console.log(`  Plan: ${sub.plan}`);
    console.log(`  Price: ${SubscriptionUtils.formatPrice(sub)}`);
    console.log(`  Interval: ${sub.interval}`);
    console.log(`  Status: ${SubscriptionUtils.getStatusDisplay(sub)}`);
  });
}

/**
 * Example 4: Subscription Upgrade/Downgrade
 */
export function exampleSubscriptionUpgrades() {
  console.log('=== Subscription Upgrades ===');
  
  const freeSubscription: Subscription = {
    subscription_id: 'sub_free_123',
    tenant_id: 'tenant_456',
    plan: SubscriptionPlan.FREE,
    interval: BillingInterval.MONTHLY,
    price: 0,
    currency: Currency.USD,
    status: SubscriptionStatus.ACTIVE,
    start_date: '2023-01-01T00:00:00Z',
    current_period_start: '2023-06-01T00:00:00Z',
    current_period_end: '2023-07-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z',
  };

  const proSubscription: Subscription = {
    subscription_id: 'sub_pro_456',
    tenant_id: 'tenant_789',
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

  console.log('Free Plan:');
  console.log(`  Can Upgrade: ${SubscriptionUtils.canUpgrade(freeSubscription)}`);
  console.log(`  Available Upgrades: ${SubscriptionUtils.getAvailableUpgrades(freeSubscription).join(', ')}`);

  console.log('\nPro Plan:');
  console.log(`  Can Upgrade: ${SubscriptionUtils.canUpgrade(proSubscription)}`);
  console.log(`  Available Upgrades: ${SubscriptionUtils.getAvailableUpgrades(proSubscription).join(', ')}`);

  // Calculate prorated amount for upgrade
  const proratedAmount = SubscriptionUtils.calculateProratedAmount(
    proSubscription, 
    SubscriptionPlan.ENTERPRISE
  );
  console.log(`\nProrated amount for upgrade to Enterprise: $${proratedAmount.toFixed(2)}`);
}

/**
 * Example 5: Subscription Invoices
 */
export function exampleSubscriptionInvoices() {
  console.log('=== Subscription Invoices ===');
  
  const invoices: SubscriptionInvoice[] = [
    {
      invoice_id: 'inv_123',
      subscription_id: 'sub_123',
      tenant_id: 'tenant_456',
      amount_due: 29.99,
      currency: Currency.USD,
      status: 'paid',
      period_start: '2023-06-01T00:00:00Z',
      period_end: '2023-07-01T00:00:00Z',
      due_date: '2023-06-01T00:00:00Z',
      paid_at: '2023-06-01T00:00:00Z',
      invoice_number: 'INV-2023-001',
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z',
    },
    {
      invoice_id: 'inv_124',
      subscription_id: 'sub_123',
      tenant_id: 'tenant_456',
      amount_due: 29.99,
      currency: Currency.USD,
      status: 'open',
      period_start: '2023-07-01T00:00:00Z',
      period_end: '2023-08-01T00:00:00Z',
      due_date: '2023-07-01T00:00:00Z',
      invoice_number: 'INV-2023-002',
      created_at: '2023-07-01T00:00:00Z',
      updated_at: '2023-07-01T00:00:00Z',
    }
  ];

  invoices.forEach(invoice => {
    console.log(`\nInvoice ${invoice.invoice_number}:`);
    console.log(`  Amount: ${CurrencyUtils.format(invoice.amount_due, invoice.currency)}`);
    console.log(`  Status: ${invoice.status}`);
    console.log(`  Period: ${new Date(invoice.period_start).toDateString()} - ${new Date(invoice.period_end).toDateString()}`);
    console.log(`  Due Date: ${new Date(invoice.due_date).toDateString()}`);
  });
}

/**
 * Example 6: Subscription Usage Tracking
 */
export function exampleSubscriptionUsage() {
  console.log('=== Subscription Usage Tracking ===');
  
  const usage: SubscriptionUsage[] = [
    {
      usage_id: 'usage_123',
      subscription_id: 'sub_123',
      tenant_id: 'tenant_456',
      metric: 'api_calls',
      usage: 8500,
      limit: 10000,
      overage: 0,
      period: '2023-06',
      created_at: '2023-06-30T23:59:59Z',
    },
    {
      usage_id: 'usage_124',
      subscription_id: 'sub_123',
      tenant_id: 'tenant_456',
      metric: 'storage_gb',
      usage: 35,
      limit: 50,
      overage: 0,
      period: '2023-06',
      created_at: '2023-06-30T23:59:59Z',
    },
    {
      usage_id: 'usage_125',
      subscription_id: 'sub_123',
      tenant_id: 'tenant_456',
      metric: 'seats',
      usage: 3,
      limit: 5,
      overage: 0,
      period: '2023-06',
      created_at: '2023-06-30T23:59:59Z',
    }
  ];

  usage.forEach(u => {
    const percentage = (u.usage / u.limit) * 100;
    console.log(`${u.metric}: ${u.usage}/${u.limit} (${percentage.toFixed(1)}%)`);
    if (u.overage > 0) {
      console.log(`  Overage: ${u.overage}`);
    }
  });
}

/**
 * Example 7: Plan Change Requests
 */
export function examplePlanChangeRequests() {
  console.log('=== Plan Change Requests ===');
  
  const planChangeRequest: PlanChangeRequest = {
    request_id: 'req_123',
    subscription_id: 'sub_123',
    tenant_id: 'tenant_456',
    current_plan: SubscriptionPlan.PRO,
    new_plan: SubscriptionPlan.ENTERPRISE,
    effective_date: 'end_of_period',
    reason: 'Need more features for growing team',
    requested_by: 'user_789',
    status: 'pending',
    created_at: '2023-06-15T10:00:00Z',
  };

  console.log('Plan Change Request:');
  console.log(`  From: ${planChangeRequest.current_plan}`);
  console.log(`  To: ${planChangeRequest.new_plan}`);
  console.log(`  Effective: ${planChangeRequest.effective_date}`);
  console.log(`  Status: ${planChangeRequest.status}`);
  console.log(`  Reason: ${planChangeRequest.reason}`);
}

/**
 * Example 8: Subscription Analytics
 */
export function exampleSubscriptionAnalytics() {
  console.log('=== Subscription Analytics ===');
  
  const analytics: SubscriptionAnalytics = {
    total_subscriptions: 1250,
    active_subscriptions: 1180,
    trial_subscriptions: 45,
    canceled_subscriptions: 25,
    past_due_subscriptions: 15,
    monthly_recurring_revenue: {
      amount: 37500.00,
      currency: Currency.USD
    },
    annual_recurring_revenue: {
      amount: 450000.00,
      currency: Currency.USD
    },
    average_subscription_value: {
      amount: 31.78,
      currency: Currency.USD
    },
    churn_rate: 2.1,
    trial_conversion_rate: 68.5,
    plan_distribution: {
      [SubscriptionPlan.FREE]: 200,
      [SubscriptionPlan.PRO]: 850,
      [SubscriptionPlan.ENTERPRISE]: 200
    },
    currency_distribution: {
      [Currency.USD]: 800,
      [Currency.MYR]: 150,
      [Currency.SGD]: 100,
      [Currency.THB]: 100,
      [Currency.EUR]: 100
    }
  };

  console.log('Subscription Analytics:');
  console.log(`  Total Subscriptions: ${analytics.total_subscriptions}`);
  console.log(`  Active Subscriptions: ${analytics.active_subscriptions}`);
  console.log(`  Trial Subscriptions: ${analytics.trial_subscriptions}`);
  console.log(`  MRR: ${CurrencyUtils.formatMoney(analytics.monthly_recurring_revenue)}`);
  console.log(`  ARR: ${CurrencyUtils.formatMoney(analytics.annual_recurring_revenue)}`);
  console.log(`  Average Value: ${CurrencyUtils.formatMoney(analytics.average_subscription_value)}`);
  console.log(`  Churn Rate: ${analytics.churn_rate}%`);
  console.log(`  Trial Conversion: ${analytics.trial_conversion_rate}%`);

  console.log('\nPlan Distribution:');
  Object.entries(analytics.plan_distribution).forEach(([plan, count]) => {
    console.log(`  ${plan}: ${count}`);
  });

  console.log('\nCurrency Distribution:');
  Object.entries(analytics.currency_distribution).forEach(([currency, count]) => {
    console.log(`  ${currency}: ${count}`);
  });
}

/**
 * Example 9: Subscription Validation
 */
export function exampleSubscriptionValidation() {
  console.log('=== Subscription Validation ===');
  
  const validSubscription: Subscription = {
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

  const invalidSubscription: Subscription = {
    subscription_id: '',
    tenant_id: 'tenant_456',
    plan: SubscriptionPlan.PRO,
    interval: BillingInterval.MONTHLY,
    price: -10,
    currency: Currency.USD,
    status: SubscriptionStatus.TRIALING,
    start_date: '2023-01-01T00:00:00Z',
    current_period_start: '2023-06-01T00:00:00Z',
    current_period_end: '2023-05-01T00:00:00Z', // Invalid: end before start
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z',
  };

  console.log('Valid Subscription:');
  const validResult = SubscriptionUtils.validateSubscription(validSubscription);
  console.log(`  Is Valid: ${validResult.isValid}`);
  if (validResult.errors.length > 0) {
    console.log(`  Errors: ${validResult.errors.join(', ')}`);
  }
  if (validResult.warnings.length > 0) {
    console.log(`  Warnings: ${validResult.warnings.join(', ')}`);
  }

  console.log('\nInvalid Subscription:');
  const invalidResult = SubscriptionUtils.validateSubscription(invalidSubscription);
  console.log(`  Is Valid: ${invalidResult.isValid}`);
  if (invalidResult.errors.length > 0) {
    console.log(`  Errors: ${invalidResult.errors.join(', ')}`);
  }
  if (invalidResult.warnings.length > 0) {
    console.log(`  Warnings: ${invalidResult.warnings.join(', ')}`);
  }
}

/**
 * Example 10: Subscription Webhooks
 */
export function exampleSubscriptionWebhooks() {
  console.log('=== Subscription Webhooks ===');
  
  const webhookEvents = [
    SubscriptionEvent.SUBSCRIPTION_CREATED,
    SubscriptionEvent.SUBSCRIPTION_UPDATED,
    SubscriptionEvent.SUBSCRIPTION_CANCELED,
    SubscriptionEvent.INVOICE_PAID,
    SubscriptionEvent.INVOICE_PAYMENT_FAILED
  ];

  console.log('Supported Webhook Events:');
  webhookEvents.forEach(event => {
    console.log(`  ${event}`);
  });
}

/**
 * Run all subscription examples
 */
export function runAllSubscriptionExamples() {
  exampleBasicSubscriptionOperations();
  exampleTrialSubscription();
  exampleSoutheastAsianSubscriptions();
  exampleSubscriptionUpgrades();
  exampleSubscriptionInvoices();
  exampleSubscriptionUsage();
  examplePlanChangeRequests();
  exampleSubscriptionAnalytics();
  exampleSubscriptionValidation();
  exampleSubscriptionWebhooks();
} 