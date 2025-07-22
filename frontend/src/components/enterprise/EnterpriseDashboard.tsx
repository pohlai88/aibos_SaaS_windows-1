'use client';

import React, { useState, useEffect } from 'react';

interface DashboardMetrics {
  activeUsers: number;
  mrr: number;
  churnRate: number;
  npsScore: number;
  serverHealth: 'healthy' | 'warning' | 'critical';
  openTickets: number;
  criticalBugs: number;
}

interface DashboardProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableRealtime?: boolean;
}

// Simple SelfHealingProvider component
const SelfHealingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const EnterpriseDashboard: React.FC<DashboardProps> = ({
  tenantId,
  userId,
  enableAI = true,
  enableRealtime = true
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeUsers: 4215,
    mrr: 12450,
    churnRate: 2.8,
    npsScore: 42,
    serverHealth: 'healthy',
    openTickets: 12,
    criticalBugs: 3
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initialization
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Enterprise Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SelfHealingProvider>
      <div className="flex h-screen font-['Inter',sans-serif] bg-gray-50 text-gray-800">
        {/* Enterprise Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-lg font-bold text-gray-800">AI-BOS</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {/* Overview Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Overview
                </h3>
                <a href="#dashboard" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🏠</span>
                  Dashboard Home
                </a>
                <a href="#quick-stats" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">📊</span>
                  Quick Stats
                </a>
              </div>

              {/* Product Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Product
                </h3>
                <a href="#feature-usage" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🚀</span>
                  Feature Usage
                </a>
                <a href="#version-tracking" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🔖</span>
                  Version Tracking
                </a>
                <a href="#roadmap" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🗺️</span>
                  Roadmap
                </a>
              </div>

              {/* Customers Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Customers
                </h3>
                <a href="#user-analytics" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">👥</span>
                  User Analytics
                </a>
                <a href="#segmentation" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🔬</span>
                  Segmentation
                </a>
              </div>

              {/* Revenue Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Revenue
                </h3>
                <a href="#mrr-arr" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">💰</span>
                  MRR/ARR
                </a>
                <a href="#subscriptions" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🔄</span>
                  Subscriptions
                </a>
              </div>

              {/* Development Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Development
                </h3>
                <a href="#api-metrics" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🔌</span>
                  API Metrics
                </a>
                <a href="#error-tracking" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">⚠️</span>
                  Error Tracking
                </a>
              </div>

              {/* Infrastructure Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Infrastructure
                </h3>
                <a href="#server-health" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🖥️</span>
                  Server Health
                </a>
                <a href="#database-metrics" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🗄️</span>
                  Database Metrics
                </a>
              </div>

              {/* Support Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Support
                </h3>
                <a href="#ticket-dashboard" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">🎫</span>
                  Ticket Dashboard
                </a>
              </div>

              {/* Settings Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Settings
                </h3>
                <a href="#user-management" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                  <span className="w-4 h-4 mr-3 inline-block">⚙️</span>
                  User Management
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back! Here&apos;s what&apos;s happening with your AI-BOS platform today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {enableAI && (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  🤖 AI Assistant
                </div>
              )}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Quick Action
              </button>
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <span className="w-6 h-6 inline-block">🔔</span>
                </button>
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Executive Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">MRR</p>
                    <span className="text-green-600 text-sm font-semibold">+12.5%</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${metrics.mrr.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <span className="text-green-600 text-sm font-semibold">+8.2%</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{metrics.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly Active Users</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                    <span className="text-red-600 text-sm font-semibold">+0.3%</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{metrics.churnRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly Churn</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">NPS Score</p>
                    <span className="text-green-600 text-sm font-semibold">+5</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{metrics.npsScore}</p>
                  <p className="text-xs text-gray-500 mt-1">Net Promoter Score</p>
                </div>
              </div>
            </div>

            {/* Quick Status Row */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      metrics.serverHealth === 'healthy' ? 'bg-green-500' :
                      metrics.serverHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Server Load</p>
                      <p className="text-xs text-gray-500">45% - Normal</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Open Bugs</p>
                      <p className="text-xs text-gray-500">{metrics.criticalBugs} Critical</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Support Tickets</p>
                      <p className="text-xs text-gray-500">{metrics.openTickets} Unresolved</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">System Status</p>
                      <p className="text-xs text-gray-500">All Systems Operational</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Powered Job Queue */}
            {enableAI && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Job Queue</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Active Jobs</h3>
                    <span className="text-sm text-gray-500">3 running</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">Data Processing</p>
                        <p className="text-sm text-gray-500">Processing user analytics</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">AI Model Training</p>
                        <p className="text-sm text-gray-500">Training recommendation model</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">Backup Generation</p>
                        <p className="text-sm text-gray-500">Creating system backup</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">90%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Analytics</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">System Metrics</h3>
                  <p className="text-sm text-gray-500">Live performance data</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">99.9%</p>
                      <p className="text-sm text-gray-500">Uptime</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">45ms</p>
                      <p className="text-sm text-gray-500">Avg Response</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">1.2M</p>
                      <p className="text-sm text-gray-500">Requests/Day</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SelfHealingProvider>
  );
};

export default EnterpriseDashboard;
