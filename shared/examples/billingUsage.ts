import {
  SubscriptionPlan,
  BillingInterval,
  PlanFeature,
  getPlanMetadata,
  planHasFeature,
  calculateRenewalDate,
} from '../types/billing/billing.enums';
import {
  Subscription,
  isSubscriptionActive,
  daysUntilNextBilling,
  getUsagePercentage,
} from '../types/billing/billing';
import {
  validatePlanUpgrade,
  validateBillingInterval,
  validateUsage,
} from '../validation/billing.schema';

/**
 * Example 1: Basic plan metadata usage
 */
export function examplePlanMetadata() {
  console.log('=== Plan Metadata Examples ===');

  // Get metadata for each plan
  Object.values(SubscriptionPlan).forEach((plan) => {
    const metadata = getPlanMetadata(plan);
    console.log(`${plan}: ${metadata.displayName} - $${metadata.basePrice}/month`);
    console.log(`  Features: ${metadata.features.join(', ')}`);
    console.log(`  Limits: ${JSON.stringify(metadata.limits)}`);
  });
}

/**
 * Example 2: Feature checking
 */
export function exampleFeatureChecking() {
  console.log('=== Feature Checking Examples ===');

  const plans = [SubscriptionPlan.FREE, SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE];
  const features = Object.values(PlanFeature);

  console.log('Feature availability by plan:');
  features.forEach((feature) => {
    console.log(`\n${feature}:`);
    plans.forEach((plan) => {
      const hasFeature = planHasFeature(plan, feature);
      console.log(`  ${plan}: ${hasFeature ? '✓' : '✗'}`);
    });
  });
}

/**
 * Example 3: Billing calculations
 */
export function exampleBillingCalculations() {
  console.log('=== Billing Calculations ===');

  const startDate = new Date('2024-01-15');

  // Calculate renewal dates for different intervals
  Object.values(BillingInterval).forEach((interval) => {
    const renewalDate = calculateRenewalDate(interval, startDate);
    console.log(`${interval} renewal: ${renewalDate.toDateString()}`);
  });
}

/**
 * Example 4: Subscription status checking
 */
export function exampleSubscriptionStatus() {
  console.log('=== Subscription Status Examples ===');

  const subscriptions: Subscription[] = [
    {
      id: 'sub-1',
      tenantId: 'tenant-1',
      plan: SubscriptionPlan.PRO,
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      billingInterval: BillingInterval.MONTHLY,
      amount: 15,
      currency: 'USD',
      cancelAtPeriodEnd: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'sub-2',
      tenantId: 'tenant-2',
      plan: SubscriptionPlan.FREE,
      status: 'trialing',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-01-15T00:00:00Z',
      billingInterval: BillingInterval.MONTHLY,
      amount: 0,
      currency: 'USD',
      cancelAtPeriodEnd: false,
      trialStart: '2024-01-01T00:00:00Z',
      trialEnd: '2024-01-15T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  subscriptions.forEach((sub) => {
    console.log(`\nSubscription ${sub.id}:`);
    console.log(`  Active: ${isSubscriptionActive(sub)}`);
    console.log(`  Days until billing: ${daysUntilNextBilling(sub)}`);
    console.log(`  Plan: ${sub.plan}`);
    console.log(`  Status: ${sub.status}`);
  });
}

/**
 * Example 5: Usage validation
 */
export function exampleUsageValidation() {
  console.log('=== Usage Validation Examples ===');

  const usageScenarios = [
    {
      plan: SubscriptionPlan.FREE,
      usage: { seats: 2, storageGB: 3, apiCalls: 500 },
    },
    {
      plan: SubscriptionPlan.PRO,
      usage: { seats: 7, storageGB: 60, apiCalls: 12000 },
    },
    {
      plan: SubscriptionPlan.ENTERPRISE,
      usage: { seats: 100, storageGB: 1000, apiCalls: 100000 },
    },
  ];

  usageScenarios.forEach((scenario) => {
    const validation = validateUsage(scenario.plan, scenario.usage);
    console.log(`\n${scenario.plan} plan usage validation:`);
    if (validation.isValid) {
      console.log('  ✓ Usage within limits');
    } else {
      console.log('  ✗ Usage exceeds limits:');
      validation.errors.forEach((error) => console.log(`    - ${error}`));
    }
  });
}

/**
 * Example 6: Plan upgrade validation
 */
export function examplePlanUpgradeValidation() {
  console.log('=== Plan Upgrade Validation ===');

  const upgradeScenarios = [
    { from: SubscriptionPlan.FREE, to: SubscriptionPlan.PRO },
    { from: SubscriptionPlan.PRO, to: SubscriptionPlan.ENTERPRISE },
    { from: SubscriptionPlan.ENTERPRISE, to: SubscriptionPlan.PRO }, // Downgrade
    { from: SubscriptionPlan.FREE, to: SubscriptionPlan.FREE }, // Same plan
  ];

  upgradeScenarios.forEach((scenario) => {
    const validation = validatePlanUpgrade(scenario.from, scenario.to);
    console.log(
      `${scenario.from} → ${scenario.to}: ${validation.isValid ? '✓ Valid' : '✗ Invalid'}`,
    );
    if (!validation.isValid) {
      console.log(`  Error: ${validation.error}`);
    }
  });
}

/**
 * Example 7: Billing interval validation
 */
export function exampleBillingIntervalValidation() {
  console.log('=== Billing Interval Validation ===');

  const intervalScenarios = [
    { plan: SubscriptionPlan.FREE, interval: BillingInterval.MONTHLY },
    { plan: SubscriptionPlan.FREE, interval: BillingInterval.YEARLY },
    { plan: SubscriptionPlan.PRO, interval: BillingInterval.MONTHLY },
    { plan: SubscriptionPlan.PRO, interval: BillingInterval.YEARLY },
  ];

  intervalScenarios.forEach((scenario) => {
    const validation = validateBillingInterval(scenario.plan, scenario.interval);
    console.log(
      `${scenario.plan} + ${scenario.interval}: ${validation.isValid ? '✓ Valid' : '✗ Invalid'}`,
    );
    if (!validation.isValid) {
      console.log(`  Error: ${validation.error}`);
    }
  });
}

/**
 * Example 8: Usage percentage calculation
 */
export function exampleUsagePercentage() {
  console.log('=== Usage Percentage Examples ===');

  const usageExamples = [
    { usage: 800, limit: 1000, metric: 'api_calls' },
    { usage: 50, limit: 50, metric: 'storage_gb' },
    { usage: 3, limit: 5, metric: 'seats' },
  ];

  usageExamples.forEach((example) => {
    const percentage = getUsagePercentage({
      id: 'usage-1',
      tenantId: 'tenant-1',
      period: '2024-01',
      metric: example.metric as any,
      usage: example.usage,
      limit: example.limit,
      overage: Math.max(0, example.usage - example.limit),
      createdAt: '2024-01-01T00:00:00Z',
    });

    console.log(`${example.metric}: ${example.usage}/${example.limit} = ${percentage.toFixed(1)}%`);
  });
}

/**
 * Run all examples
 */
export function runAllBillingExamples() {
  examplePlanMetadata();
  exampleFeatureChecking();
  exampleBillingCalculations();
  exampleSubscriptionStatus();
  exampleUsageValidation();
  examplePlanUpgradeValidation();
  exampleBillingIntervalValidation();
  exampleUsagePercentage();
}
