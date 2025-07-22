// ==================== AI-BOS REVENUE ENGINE ====================
// The Economic Heartbeat of the Digital Civilization
// Steve Jobs Philosophy: "The best way to predict the future is to invent it."

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, TrendingUp, Users, Package,
  Zap, Shield, BarChart3, Calendar, Clock, Star,
  ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle,
  Settings, RefreshCw, Download, Upload, Target
} from 'lucide-react';

// ==================== TYPES ====================
interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  billingCycle: 'monthly' | 'yearly' | 'usage';
  features: string[];
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
    aiInferences: number;
  };
  popular?: boolean;
}

interface Subscription {
  id: string;
  tenantId: string;
  tierId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  usage: {
    users: number;
    storage: number;
    apiCalls: number;
    aiInferences: number;
  };
  billing: {
    amount: number;
    currency: string;
    nextBillingDate: Date;
    paymentMethod: string;
  };
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  growthRate: number;
  churnRate: number;
  ltv: number;
  cac: number;
  activeSubscriptions: number;
  totalRevenue: number;
  averageRevenuePerUser: number;
}

interface BillingEvent {
  id: string;
  tenantId: string;
  type: 'subscription_created' | 'subscription_updated' | 'payment_succeeded' | 'payment_failed' | 'usage_charge';
  amount: number;
  currency: string;
  description: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface AIAgentBilling {
  agentId: string;
  tenantId: string;
  model: string;
  tokensUsed: number;
  cost: number;
  timestamp: Date;
  inferenceType: 'text' | 'image' | 'code' | 'analysis';
}

// ==================== PRICING TIERS ====================
const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Up to 5 users',
      '10GB storage',
      '1,000 API calls/month',
      '100 AI inferences/month',
      'Basic support'
    ],
    limits: {
      users: 5,
      storage: 10,
      apiCalls: 1000,
      aiInferences: 100
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Up to 25 users',
      '100GB storage',
      '10,000 API calls/month',
      '1,000 AI inferences/month',
      'Priority support',
      'Advanced analytics'
    ],
    limits: {
      users: 25,
      storage: 100,
      apiCalls: 10000,
      aiInferences: 1000
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Unlimited users',
      '1TB storage',
      '100,000 API calls/month',
      '10,000 AI inferences/month',
      '24/7 support',
      'Custom integrations',
      'SLA guarantee'
    ],
    limits: {
      users: -1, // Unlimited
      storage: 1000,
      apiCalls: 100000,
      aiInferences: 10000
    }
  },
  {
    id: 'usage-based',
    name: 'Pay-as-you-go',
    price: 0,
    currency: 'USD',
    billingCycle: 'usage',
    features: [
      'Pay only for what you use',
      'No monthly commitment',
      'Scalable pricing',
      'Real-time billing'
    ],
    limits: {
      users: -1,
      storage: -1,
      apiCalls: -1,
      aiInferences: -1
    }
  }
];

// ==================== COMPONENT ====================
export const RevenueEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'billing' | 'analytics' | 'settings'>('overview');
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ==================== STATE ====================
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    mrr: 125000,
    arr: 1500000,
    growthRate: 0.15,
    churnRate: 0.03,
    ltv: 2500,
    cac: 150,
    activeSubscriptions: 1250,
    totalRevenue: 2500000,
    averageRevenuePerUser: 200
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'sub_1',
      tenantId: 'tenant_1',
      tierId: 'professional',
      status: 'active',
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-02-01'),
      cancelAtPeriodEnd: false,
      usage: {
        users: 18,
        storage: 45,
        apiCalls: 7500,
        aiInferences: 800
      },
      billing: {
        amount: 99,
        currency: 'USD',
        nextBillingDate: new Date('2024-02-01'),
        paymentMethod: 'card_visa_1234'
      }
    }
  ]);

  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([
    {
      id: 'evt_1',
      tenantId: 'tenant_1',
      type: 'payment_succeeded',
      amount: 99,
      currency: 'USD',
      description: 'Professional plan - January 2024',
      timestamp: new Date('2024-01-01'),
      metadata: { subscriptionId: 'sub_1' }
    }
  ]);

  const [aiAgentBilling, setAiAgentBilling] = useState<AIAgentBilling[]>([
    {
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      model: 'gpt-4o',
      tokensUsed: 1500,
      cost: 0.045,
      timestamp: new Date(),
      inferenceType: 'text'
    }
  ]);

  // ==================== FUNCTIONS ====================
  const processPayment = useCallback(async (tierId: string) => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (tier) {
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        tenantId: 'current_tenant',
        tierId: tier.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        usage: {
          users: 0,
          storage: 0,
          apiCalls: 0,
          aiInferences: 0
        },
        billing: {
          amount: tier.price,
          currency: tier.currency,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentMethod: 'card_visa_1234'
        }
      };

      setSubscriptions(prev => [...prev, newSubscription]);

      const billingEvent: BillingEvent = {
        id: `evt_${Date.now()}`,
        tenantId: 'current_tenant',
        type: 'subscription_created',
        amount: tier.price,
        currency: tier.currency,
        description: `${tier.name} plan subscription`,
        timestamp: new Date(),
        metadata: { subscriptionId: newSubscription.id }
      };

      setBillingEvents(prev => [...prev, billingEvent]);
    }

    setIsProcessing(false);
    setShowUpgradeModal(false);
  }, []);

  const calculateUsageCost = useCallback((usage: any, tier: PricingTier) => {
    if (tier.billingCycle === 'usage') {
      const baseCost = 0.01; // $0.01 per API call
      const aiCost = 0.0001; // $0.0001 per token
      return (usage.apiCalls * baseCost) + (usage.aiInferences * aiCost);
    }
    return tier.price;
  }, []);

  const getUsagePercentage = useCallback((current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ==================== HEADER ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <DollarSign className="w-8 h-8 mr-3 text-green-500" />
                Revenue Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                The economic heartbeat of the AI-BOS ecosystem
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${metrics.mrr.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Monthly Recurring Revenue</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.activeSubscriptions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Active Subscriptions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== NAVIGATION TABS ==================== */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'subscriptions', label: 'Subscriptions', icon: Package },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ==================== CONTENT AREA ==================== */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* ==================== REVENUE METRICS ==================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      +{Math.round(metrics.growthRate * 100)}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${metrics.mrr.toLocaleString()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Recurring Revenue</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {metrics.activeSubscriptions.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.activeSubscriptions.toLocaleString()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Active Subscriptions</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                      ${metrics.ltv.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${metrics.ltv.toLocaleString()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Customer Lifetime Value</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                      {Math.round(metrics.churnRate * 100)}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(metrics.churnRate * 100)}%
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Churn Rate</p>
                </div>
              </div>

              {/* ==================== PRICING TIERS ==================== */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-500" />
                    Pricing Tiers
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Choose the perfect plan for your needs
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRICING_TIERS.map((tier) => (
                      <div
                        key={tier.id}
                        className={`relative p-6 rounded-lg border-2 transition-all ${
                          tier.popular
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        {tier.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {tier.name}
                          </h3>
                          <div className="mb-4">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              ${tier.price}
                            </span>
                            {tier.billingCycle !== 'usage' && (
                              <span className="text-gray-600 dark:text-gray-400">/{tier.billingCycle}</span>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => {
                            setSelectedTier(tier.id);
                            setShowUpgradeModal(true);
                          }}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            tier.popular
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                          }`}
                        >
                          {tier.billingCycle === 'usage' ? 'Get Started' : 'Choose Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ==================== CURRENT USAGE ==================== */}
              {subscriptions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      Current Usage
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Monitor your resource consumption
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Object.entries(subscriptions[0].usage).map(([key, value]) => {
                        const tier = PRICING_TIERS.find(t => t.id === subscriptions[0].tierId);
                        const limit = tier?.limits[key as keyof typeof tier.limits] || 0;
                        const percentage = getUsagePercentage(value, limit);

                        return (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {value.toLocaleString()}
                                {limit !== -1 && ` / ${limit.toLocaleString()}`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Active Subscriptions
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => {
                      const tier = PRICING_TIERS.find(t => t.id === subscription.tierId);
                      return (
                        <div
                          key={subscription.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {tier?.name} Plan
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ${subscription.billing.amount}/{tier?.billingCycle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {subscription.status}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Next billing: {subscription.billing.nextBillingDate.toLocaleDateString()}
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
                              Manage
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Billing History
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {billingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {event.description}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${event.amount}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {event.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Revenue Analytics
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Key Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ARR</span>
                          <span className="font-medium">${metrics.arr.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Growth Rate</span>
                          <span className="font-medium text-green-600">+{Math.round(metrics.growthRate * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Churn Rate</span>
                          <span className="font-medium text-red-600">{Math.round(metrics.churnRate * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">LTV</span>
                          <span className="font-medium">${metrics.ltv.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">AI Agent Usage</h3>
                      <div className="space-y-3">
                        {aiAgentBilling.map((billing) => (
                          <div key={billing.agentId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{billing.model}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {billing.tokensUsed.toLocaleString()} tokens
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900 dark:text-white">
                                ${billing.cost.toFixed(4)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {billing.inferenceType}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Billing Settings
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Visa ending in 1234</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</div>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Update
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Billing Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Email Invoices</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Receive invoices via email</div>
                          </div>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
                            Configure
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Auto-renewal</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Automatically renew subscriptions</div>
                          </div>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== UPGRADE MODAL ==================== */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upgrade Subscription
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You&apos;re about to upgrade to the {PRICING_TIERS.find(t => t.id === selectedTier)?.name} plan.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => processPayment(selectedTier)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      'Confirm Upgrade'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevenueEngine;
