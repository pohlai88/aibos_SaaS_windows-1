'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, TrendingUp, TrendingDown, Package, Users,
  Calendar, Download, Settings, RefreshCw, Loader2, AlertCircle,
  CheckCircle, Clock, FileText, BarChart3, Zap
} from 'lucide-react';
import { useAIBOSStore } from '@/lib/store';

// ==================== TYPES ====================

interface BillingMetrics {
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  growthRate: number;
  activeSubscriptions: number;
  totalCustomers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  planName: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'usage';
  nextBillingDate: Date;
  createdAt: Date;
  usage?: {
    [key: string]: number;
  };
}

interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'draft';
  dueDate: Date;
  paidDate?: Date;
  invoiceNumber: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// ==================== BILLING DASHBOARD ====================

export const BillingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'invoices' | 'customers' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAIBOSStore();

  // ==================== REAL DATA STATE ====================
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // ==================== DATA FETCHING ====================
  const fetchBillingData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

              // Fetch billing metrics from our AI-governed database
        const metricsResponse = await fetch('/api/billing/metrics');
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData.data);
        }

        // Fetch subscriptions
        const subscriptionsResponse = await fetch('/api/billing/subscriptions');
        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          setSubscriptions(subscriptionsData.data);
        }

        // Fetch invoices
        const invoicesResponse = await fetch('/api/billing/invoices');
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          setInvoices(invoicesData.data);
        }

        // Fetch payment methods
        const paymentMethodsResponse = await fetch('/api/billing/payment-methods');
        if (paymentMethodsResponse.ok) {
          const paymentMethodsData = await paymentMethodsResponse.json();
          setPaymentMethods(paymentMethodsData.data);
        }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
      addNotification({
        type: 'error',
        title: 'Billing Data Error',
        message: 'Unable to load billing metrics and data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchBillingData();
    setIsRefreshing(false);
    addNotification({
      type: 'success',
      title: 'Billing Dashboard Updated',
      message: 'Latest billing metrics have been refreshed.',
      isRead: false
    });
  }, [fetchBillingData, addNotification]);

  const handleDownloadInvoice = useCallback(async (invoiceId: string) => {
    try {
              // Download invoice from our AI-governed database
        const response = await fetch(`/api/billing/invoices/${invoiceId}/download`);

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoiceId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);

          addNotification({
            type: 'success',
            title: 'Invoice Downloaded',
            message: 'Invoice has been downloaded successfully.',
            isRead: false
          });
        } else {
          throw new Error('Failed to download invoice');
        }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download invoice.',
        isRead: false
      });
    }
  }, [addNotification]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // ==================== UTILITY FUNCTIONS ====================
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'paid': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'canceled': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'past_due': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'failed': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // ==================== EMPTY STATES ====================
  const EmptyState: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void; }
  }> = ({ icon: Icon, title, description, action }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading billing data...</p>
    </div>
  );

  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Billing Dashboard</h1>
              <p className="text-green-100">Revenue and subscription management</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'subscriptions', label: 'Subscriptions', icon: Package },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-[calc(100%-200px)]">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchBillingData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {!metrics ? (
                  <EmptyState
                    icon={BarChart3}
                    title="No Billing Data Available"
                    description="Billing metrics and revenue data will appear here once configured."
                    action={{
                      label: 'Configure Billing',
                      onClick: () => setActiveTab('settings')
                    }}
                  />
                ) : (
                  <>
                    {/* Revenue Overview */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Recurring Revenue</h3>
                          <p className="text-gray-600 dark:text-gray-400">Current period revenue</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(metrics.monthlyRecurringRevenue)}
                          </div>
                          <div className={`flex items-center text-sm ${
                            metrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metrics.growthRate >= 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(metrics.growthRate)}% from last month
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Active Subscriptions', value: metrics.activeSubscriptions, icon: Package, color: 'blue' },
                        { label: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'purple' },
                        { label: 'Churn Rate', value: `${metrics.churnRate}%`, icon: TrendingDown, color: 'red' },
                        { label: 'ARPU', value: formatCurrency(metrics.averageRevenuePerUser), icon: DollarSign, color: 'green' }
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                            </div>
                            <Icon className={`w-8 h-8 text-${color}-500`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                      </div>
                      <div className="p-4">
                        {invoices.length === 0 ? (
                          <EmptyState
                            icon={FileText}
                            title="No Recent Invoices"
                            description="Invoice history will appear here once billing is configured."
                          />
                        ) : (
                          invoices.slice(0, 3).map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {invoice.customerName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {invoice.invoiceNumber} • {invoice.dueDate.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(invoice.amount, invoice.currency)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
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
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Subscriptions</h3>
                  </div>
                  <div className="p-4">
                    {subscriptions.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title="No Active Subscriptions"
                        description="Subscription data will appear here once customers start subscribing."
                      />
                    ) : (
                      subscriptions.map((subscription) => (
                        <div key={subscription.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {subscription.customerName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {subscription.planName} • {subscription.billingCycle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(subscription.amount, subscription.currency)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                              {subscription.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice History</h3>
                  </div>
                  <div className="p-4">
                    {invoices.length === 0 ? (
                      <EmptyState
                        icon={FileText}
                        title="No Invoices"
                        description="Invoice history will appear here once billing is configured."
                      />
                    ) : (
                      invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {invoice.customerName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {invoice.invoiceNumber} • Due: {invoice.dueDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(invoice.amount, invoice.currency)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                            <button
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'customers' && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Overview</h3>
                  </div>
                  <div className="p-4">
                    {subscriptions.length === 0 ? (
                      <EmptyState
                        icon={Users}
                        title="No Customers"
                        description="Customer data will appear here once customers start using the platform."
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics?.totalCustomers || 0}
                          </p>
                          <p className="text-sm text-gray-500">Total Customers</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics?.activeSubscriptions || 0}
                          </p>
                          <p className="text-sm text-gray-500">Active Subscriptions</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics ? formatCurrency(metrics.averageRevenuePerUser) : '$0'}
                          </p>
                          <p className="text-sm text-gray-500">Average Revenue Per User</p>
                        </div>
                      </div>
                    )}
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
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Payment Methods</p>
                        <p className="text-sm text-gray-500">Configure payment processing</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Configure
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Tax Settings</p>
                        <p className="text-sm text-gray-500">Configure tax rates and rules</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Configure
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Invoice Templates</p>
                        <p className="text-sm text-gray-500">Customize invoice appearance</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
