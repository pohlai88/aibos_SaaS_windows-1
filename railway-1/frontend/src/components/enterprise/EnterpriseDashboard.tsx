'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { DashboardCard } from './DashboardCard';
import { StatusPill } from './StatusPill';
import { AIAssistant } from './AIAssistant';

interface DashboardProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableRealtime?: boolean;
}

export const EnterpriseDashboard: React.FC<DashboardProps> = ({
  tenantId,
  userId,
  enableAI = true,
  enableRealtime = true
}) => {
  const { metrics, status, error, lastUpdated, refetch, clearError } = useDashboardMetrics();

  // 🧠 AI Context-Aware Suggestions
  const aiSuggestions = useMemo(() => {
    if (!metrics || !enableAI) return [];

    const suggestions = [];

    // NPS Alert
    if (metrics.npsScore < 30) {
      suggestions.push({
        message: "NPS has dropped significantly. Consider launching a customer feedback survey.",
        actionLabel: "Create Survey",
        type: 'critical' as const
      });
    }

    // Churn Alert
    if (metrics.churnRate > 5) {
      suggestions.push({
        message: "Churn rate is above industry average. Review customer success metrics.",
        actionLabel: "View Analytics",
        type: 'warning' as const
      });
    }

    // Server Health Alert
    if (metrics.serverHealth === 'critical') {
      suggestions.push({
        message: "Server health is critical. Immediate attention required.",
        actionLabel: "View Status",
        type: 'critical' as const
      });
    }

    // Success Celebration
    if (metrics.mrr > 100000 && metrics.activeUsers > 1000) {
      suggestions.push({
        message: "Excellent growth! Your platform is performing exceptionally well.",
        actionLabel: "View Report",
        type: 'success' as const
      });
    }

    return suggestions;
  }, [metrics, enableAI]);

  // 🧠 AI Context for Intelligent Analysis
  const aiContext = useMemo(() => ({
    metrics: metrics,
    userBehavior: {
      recentQueries: [
        "How to increase MRR?",
        "Why is churn rate high?",
        "System performance issues",
        "User engagement declining"
      ]
    },
    systemStatus: {
      uptime: metrics?.systemMetrics?.uptime,
      responseTime: metrics?.systemMetrics?.avgResponse,
      health: metrics?.serverHealth
    },
    recentActions: [
      "Dashboard refresh",
      "Metrics analysis",
      "System check"
    ]
  }), [metrics]);

  // 🎨 Loading State (Steve Jobs: "Delight in the details")
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-gray-600 dark:text-gray-400 text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // 🚨 Error State (Graceful degradation)
  if (status === 'error' && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connection Issue</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={refetch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={clearError}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🎯 Main Dashboard (Steve Jobs: "Make the interface disappear")
  return (
    <div className="flex h-screen font-['Inter',sans-serif] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* 🎨 Elegant Sidebar */}
      <motion.aside
        className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white font-bold text-sm">AI</span>
            </motion.div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">AI-BOS</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Navigation sections with hover effects */}
            {[
              { title: 'Overview', items: ['Dashboard Home', 'Quick Stats'] },
              { title: 'Product', items: ['Feature Usage', 'Version Tracking', 'Roadmap'] },
              { title: 'Customers', items: ['User Analytics', 'Segmentation'] },
              { title: 'Revenue', items: ['MRR/ARR', 'Subscriptions'] },
              { title: 'Development', items: ['API Metrics', 'Error Tracking'] },
              { title: 'Infrastructure', items: ['Server Health', 'Database Metrics'] },
              { title: 'Support', items: ['Ticket Dashboard'] },
              { title: 'Settings', items: ['User Management'] }
            ].map((section, idx) => (
              <motion.div
                key={section.title}
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                {section.items.map((item, itemIdx) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="w-4 h-4 mr-3 inline-block">
                      {['🏠', '📊', '🚀', '🔖', '🗺️', '👥', '🔬', '💰', '🔄', '🔌', '⚠️', '🖥️', '🗄️', '🎫', '⚙️'][itemIdx] || '📄'}
                    </span>
                    {item}
                  </motion.a>
                ))}
              </motion.div>
            ))}
          </div>
        </nav>
      </motion.aside>

      {/* 🎯 Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 🎨 Elegant Header */}
        <motion.header
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Here&apos;s what&apos;s happening with your AI-BOS platform today.
                              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                  {status === 'refreshing' && (
                    <motion.span
                      className="ml-2 text-blue-600"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      🔄 Refreshing...
                    </motion.span>
                  )}
                </span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {enableAI && (
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🤖 AI Assistant
              </motion.div>
            )}
            <motion.button
              onClick={refetch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={status === 'refreshing'}
            >
              {status === 'refreshing' ? '🔄' : 'Refresh'}
            </motion.button>
            <div className="relative">
              <motion.button
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="w-6 h-6 inline-block">🔔</span>
              </motion.button>
              <motion.span
                className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.header>

        {/* 🎯 Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 🧠 AI-Powered Intelligent Assistant */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Insights</h2>
            <div className="space-y-4">
              <AIAssistant
                context={aiContext}
                enableAI={enableAI}
                autoAnalyze={true}
                type="predictive"
                dismissible={false}
              />

              {/* Show traditional suggestions as fallback */}
              {aiSuggestions.length > 0 && (
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, idx) => (
                    <AIAssistant
                      key={idx}
                      message={suggestion.message}
                      actionLabel={suggestion.actionLabel}
                      type={suggestion.type}
                      onAction={() => console.log(`Action: ${suggestion.actionLabel}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* 📊 Executive Summary Cards */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Executive Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <DashboardCard
                title="MRR"
                value={metrics?.mrr || 0}
                subtitle="Monthly Recurring Revenue"
                trend={{ value: 12.5, isPositive: true }}
                icon="💰"
                prefix="$"
                variant="success"
              />
              <DashboardCard
                title="Active Users"
                value={metrics?.activeUsers || 0}
                subtitle="Monthly Active Users"
                trend={{ value: 8.2, isPositive: true }}
                icon="👥"
                suffix=" users"
                variant="success"
              />
              <DashboardCard
                title="Churn Rate"
                value={metrics?.churnRate || 0}
                subtitle="Monthly Churn"
                trend={{ value: 0.3, isPositive: false }}
                icon="📉"
                suffix="%"
                variant={(metrics?.churnRate || 0) > 5 ? 'critical' : 'warning'}
              />
              <DashboardCard
                title="NPS Score"
                value={metrics?.npsScore || 0}
                subtitle="Net Promoter Score"
                trend={{ value: 5, isPositive: true }}
                icon="⭐"
                variant={(metrics?.npsScore || 0) < 30 ? 'critical' : (metrics?.npsScore || 0) < 50 ? 'warning' : 'success'}
              />
            </div>
          </motion.div>

          {/* 🎯 Status Overview */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusPill
                status={metrics?.serverHealth || 'healthy'}
                label="Server Load"
                description="45% - Normal"
                showPulse={metrics?.serverHealth === 'critical'}
              />
              <StatusPill
                status={(metrics?.criticalBugs || 0) > 0 ? 'warning' : 'healthy'}
                label="Open Bugs"
                description={`${metrics?.criticalBugs || 0} Critical`}
                showPulse={(metrics?.criticalBugs || 0) > 5}
              />
              <StatusPill
                status="info"
                label="Support Tickets"
                description={`${metrics?.openTickets || 0} Unresolved`}
              />
              <StatusPill
                status="healthy"
                label="System Status"
                description="All Systems Operational"
              />
            </div>
          </motion.div>

          {/* 📈 Real-Time Analytics */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Real-Time Analytics</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Metrics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Live performance data</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {metrics?.systemMetrics?.uptime != null ? `${metrics.systemMetrics.uptime}%` : '—'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {metrics?.systemMetrics?.avgResponse != null ? `${metrics.systemMetrics.avgResponse}ms` : '—'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {metrics?.systemMetrics?.requestsPerDay != null ? metrics.systemMetrics.requestsPerDay.toLocaleString() : '—'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Requests/Day</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 🤖 AI-Powered Job Queue */}
          {enableAI && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Job Queue</h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Jobs</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">3 running</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Data Processing', desc: 'Processing user analytics', progress: 75, color: 'bg-green-500' },
                    { name: 'AI Model Training', desc: 'Training recommendation model', progress: 45, color: 'bg-blue-500' },
                    { name: 'Backup Generation', desc: 'Creating system backup', progress: 90, color: 'bg-yellow-500' }
                  ].map((job, idx) => (
                    <motion.div
                      key={job.name}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{job.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{job.desc}</p>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 ${job.color} rounded-full mr-2`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{job.progress}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 📊 Compact Metrics Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <DashboardCard
                title="Uptime"
                value={metrics?.systemMetrics?.uptime || 0}
                suffix="%"
                icon="🖥️"
                compact
                variant="success"
              />
              <DashboardCard
                title="Response"
                value={metrics?.systemMetrics?.avgResponse || 0}
                suffix="ms"
                icon="⚡"
                compact
                variant="info"
              />
              <DashboardCard
                title="Requests"
                value={Math.round((metrics?.systemMetrics?.requestsPerDay || 0) / 1000)}
                suffix="k/day"
                icon="📡"
                compact
                variant="info"
              />
              <DashboardCard
                title="Tickets"
                value={metrics?.openTickets || 0}
                icon="🎫"
                compact
                variant={(metrics?.openTickets || 0) > 10 ? 'warning' : 'success'}
              />
              <DashboardCard
                title="Bugs"
                value={metrics?.criticalBugs || 0}
                icon="🐛"
                compact
                variant={(metrics?.criticalBugs || 0) > 0 ? 'critical' : 'success'}
              />
              <DashboardCard
                title="Health"
                value={metrics?.serverHealth === 'healthy' ? 100 : metrics?.serverHealth === 'warning' ? 75 : 25}
                suffix="%"
                icon="❤️"
                compact
                variant={metrics?.serverHealth === 'healthy' ? 'success' : metrics?.serverHealth === 'warning' ? 'warning' : 'critical'}
              />
            </div>
          </motion.div>

          {/* 🎯 Compact Status Overview */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <StatusPill
                status="healthy"
                label="Database"
                description="Connected"
                size="sm"
                showPulse
              />
              <StatusPill
                status="info"
                label="API Gateway"
                description="Active"
                size="sm"
              />
              <StatusPill
                status="warning"
                label="Cache"
                description="75% capacity"
                size="sm"
                showPulse
              />
              <StatusPill
                status="healthy"
                label="CDN"
                description="Global"
                size="sm"
              />
              <StatusPill
                status="offline"
                label="Backup"
                description="Scheduled"
                size="sm"
              />
              <StatusPill
                status="critical"
                label="Monitoring"
                description="Alert active"
                size="sm"
                showPulse
                onClick={() => console.log('Monitoring clicked')}
              />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
