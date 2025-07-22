// ==================== AI-BOS USAGE METRICS ENGINE ====================
// Enterprise Analytics & Business Impact Measurement
// Steve Jobs Philosophy: "Measure what matters. Because what gets measured gets improved."

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Download, Star,
  Clock, Target, Zap, Activity, Eye, Filter,
  Calendar, ArrowUp, ArrowDown, Minus, Play,
  Pause, RefreshCw, Maximize, Minimize
} from 'lucide-react';

// ==================== TYPES ====================
interface ModuleMetrics {
  id: string;
  name: string;
  publisher: string;
  category: string;
  installs: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    trend: 'up' | 'down' | 'stable';
  };
  usage: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: number;
    retentionRate: number;
    engagementScore: number;
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    crashRate: number;
    satisfactionScore: number;
  };
  business: {
    revenue: number;
    costSavings: number;
    productivityGain: number;
    timeToValue: number;
    roi: number;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    positiveReviews: number;
    negativeReviews: number;
  };
  lastUpdated: Date;
}

interface TenantMetrics {
  id: string;
  name: string;
  modules: {
    total: number;
    active: number;
    popular: string[];
  };
  usage: {
    totalUsers: number;
    activeUsers: number;
    averageModulesPerUser: number;
    mostUsedModules: string[];
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    uptime: number;
  };
  business: {
    totalValue: number;
    costSavings: number;
    productivityGain: number;
  };
}

interface AnalyticsState {
  modules: ModuleMetrics[];
  tenants: TenantMetrics[];
  selectedModule: ModuleMetrics | null;
  selectedTenant: TenantMetrics | null;
  timeRange: '1d' | '7d' | '30d' | '90d' | '1y';
  viewMode: 'modules' | 'tenants' | 'comparison';
  filters: {
    category: string[];
    publisher: string[];
    rating: number;
    installs: string;
  };
  loading: boolean;
  error: string | null;
}

// ==================== SAMPLE DATA ====================
const SAMPLE_MODULE_METRICS: ModuleMetrics[] = [
  {
    id: 'crm-contacts-pro',
    name: 'CRM Contacts Pro',
    publisher: 'AI-BOS Team',
    category: 'CRM',
    installs: {
      total: 8920,
      daily: 45,
      weekly: 320,
      monthly: 1280,
      trend: 'up'
    },
    usage: {
      dailyActiveUsers: 6540,
      monthlyActiveUsers: 8200,
      averageSessionTime: 25.5,
      retentionRate: 87.3,
      engagementScore: 8.7
    },
    performance: {
      averageLoadTime: 1.2,
      errorRate: 0.3,
      crashRate: 0.1,
      satisfactionScore: 4.8
    },
    business: {
      revenue: 267600,
      costSavings: 125000,
      productivityGain: 35.2,
      timeToValue: 2.5,
      roi: 314
    },
    reviews: {
      averageRating: 4.8,
      totalReviews: 127,
      positiveReviews: 118,
      negativeReviews: 9
    },
    lastUpdated: new Date()
  },
  {
    id: 'ai-chat-assistant',
    name: 'AI Chat Assistant',
    publisher: 'Neural Labs',
    category: 'AI',
    installs: {
      total: 5430,
      daily: 67,
      weekly: 480,
      monthly: 1920,
      trend: 'up'
    },
    usage: {
      dailyActiveUsers: 4120,
      monthlyActiveUsers: 4980,
      averageSessionTime: 18.3,
      retentionRate: 92.1,
      engagementScore: 9.1
    },
    performance: {
      averageLoadTime: 0.8,
      errorRate: 0.5,
      crashRate: 0.2,
      satisfactionScore: 4.6
    },
    business: {
      revenue: 0,
      costSavings: 89000,
      productivityGain: 28.7,
      timeToValue: 1.8,
      roi: 245
    },
    reviews: {
      averageRating: 4.6,
      totalReviews: 89,
      positiveReviews: 82,
      negativeReviews: 7
    },
    lastUpdated: new Date()
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    publisher: 'DataViz Pro',
    category: 'Analytics',
    installs: {
      total: 15670,
      daily: 23,
      weekly: 165,
      monthly: 660,
      trend: 'stable'
    },
    usage: {
      dailyActiveUsers: 12340,
      monthlyActiveUsers: 14560,
      averageSessionTime: 42.1,
      retentionRate: 94.5,
      engagementScore: 9.3
    },
    performance: {
      averageLoadTime: 2.1,
      errorRate: 0.2,
      crashRate: 0.05,
      satisfactionScore: 4.9
    },
    business: {
      revenue: 783500,
      costSavings: 234000,
      productivityGain: 41.8,
      timeToValue: 3.2,
      roi: 335
    },
    reviews: {
      averageRating: 4.9,
      totalReviews: 203,
      positiveReviews: 198,
      negativeReviews: 5
    },
    lastUpdated: new Date()
  }
];

const SAMPLE_TENANT_METRICS: TenantMetrics[] = [
  {
    id: 'tenant-001',
    name: 'TechCorp Solutions',
    modules: {
      total: 15,
      active: 12,
      popular: ['crm-contacts-pro', 'analytics-dashboard', 'ai-chat-assistant']
    },
    usage: {
      totalUsers: 250,
      activeUsers: 198,
      averageModulesPerUser: 3.2,
      mostUsedModules: ['crm-contacts-pro', 'analytics-dashboard']
    },
    performance: {
      averageLoadTime: 1.8,
      errorRate: 0.4,
      uptime: 99.7
    },
    business: {
      totalValue: 1250000,
      costSavings: 450000,
      productivityGain: 38.5
    }
  },
  {
    id: 'tenant-002',
    name: 'Innovate Labs',
    modules: {
      total: 8,
      active: 7,
      popular: ['ai-chat-assistant', 'analytics-dashboard']
    },
    usage: {
      totalUsers: 85,
      activeUsers: 72,
      averageModulesPerUser: 2.8,
      mostUsedModules: ['ai-chat-assistant']
    },
    performance: {
      averageLoadTime: 1.2,
      errorRate: 0.3,
      uptime: 99.9
    },
    business: {
      totalValue: 680000,
      costSavings: 234000,
      productivityGain: 42.1
    }
  }
];

// ==================== COMPONENT ====================
export const UsageMetricsEngine: React.FC = () => {
  const [state, setState] = useState<AnalyticsState>({
    modules: SAMPLE_MODULE_METRICS,
    tenants: SAMPLE_TENANT_METRICS,
    selectedModule: null,
    selectedTenant: null,
    timeRange: '30d',
    viewMode: 'modules',
    filters: {
      category: [],
      publisher: [],
      rating: 0,
      installs: ''
    },
    loading: false,
    error: null
  });

  // ==================== ACTIONS ====================
  const refreshMetrics = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));

    // Simulate data refresh
    setTimeout(() => {
      setState(prev => ({ ...prev, loading: false }));
    }, 2000);
  }, []);

  const exportMetrics = useCallback((type: 'modules' | 'tenants' | 'comparison') => {
    console.log(`📊 Exporting ${type} metrics...`);
    // TODO: Implement export functionality
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* ==================== HEADER ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-green-500" />
                Usage Metrics Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Enterprise analytics and business impact measurement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshMetrics}
                disabled={state.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <select
                value={state.timeRange}
                onChange={(e) => setState(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================== VIEW MODE TOGGLE ==================== */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'modules' }))}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.viewMode === 'modules'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Module Analytics
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'tenants' }))}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.viewMode === 'tenants'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tenant Analytics
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'comparison' }))}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.viewMode === 'comparison'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Comparison
              </button>
            </div>
            <button
              onClick={() => exportMetrics(state.viewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ==================== MODULE ANALYTICS ==================== */}
        {state.viewMode === 'modules' && (
          <div className="space-y-8">
            {/* ==================== TOP METRICS CARDS ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Installs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {state.modules.reduce((sum, m) => sum + m.installs.total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {state.modules.reduce((sum, m) => sum + m.usage.dailyActiveUsers, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(state.modules.reduce((sum, m) => sum + m.reviews.averageRating, 0) / state.modules.length).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${state.modules.reduce((sum, m) => sum + m.business.revenue, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== MODULE METRICS TABLE ==================== */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Module Performance</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Detailed metrics for all modules
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Installs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Active Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Business Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {state.modules.map((module) => (
                      <motion.tr
                        key={module.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setState(prev => ({ ...prev, selectedModule: module }))}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {module.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {module.publisher} • {module.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {module.installs.total.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            +{module.installs.daily}/day
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {module.usage.dailyActiveUsers.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {module.usage.retentionRate}% retention
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {module.reviews.averageRating}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              ({module.reviews.totalReviews})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {module.performance.averageLoadTime}s load
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {module.performance.errorRate}% errors
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ${module.business.revenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {module.business.roi}% ROI
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {module.installs.trend === 'up' ? (
                              <ArrowUp className="w-4 h-4 text-green-500" />
                            ) : module.installs.trend === 'down' ? (
                              <ArrowDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TENANT ANALYTICS ==================== */}
        {state.viewMode === 'tenants' && (
          <div className="space-y-8">
            {/* ==================== TENANT METRICS CARDS ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tenants</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {state.tenants.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {state.tenants.reduce((sum, t) => sum + t.usage.activeUsers, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(state.tenants.reduce((sum, t) => sum + t.performance.uptime, 0) / state.tenants.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${state.tenants.reduce((sum, t) => sum + t.business.totalValue, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== TENANT METRICS TABLE ==================== */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tenant Performance</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Detailed metrics for all tenants
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Modules
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Business Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {state.tenants.map((tenant) => (
                      <motion.tr
                        key={tenant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setState(prev => ({ ...prev, selectedTenant: tenant }))}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tenant.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {tenant.modules.active}/{tenant.modules.total} active
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {tenant.usage.averageModulesPerUser} per user
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {tenant.usage.activeUsers}/{tenant.usage.totalUsers} active
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {tenant.performance.uptime}% uptime
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {tenant.performance.averageLoadTime}s avg load
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ${tenant.business.totalValue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {tenant.business.productivityGain}% productivity gain
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageMetricsEngine;
