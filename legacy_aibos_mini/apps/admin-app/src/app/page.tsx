import React from 'react';

export default function DashboardPage() {
  return (
    <div className="flex h-screen font-['Inter',sans-serif] bg-gray-50 text-gray-800">
      {/* Sidebar */}
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</h3>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product</h3>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customers</h3>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Revenue</h3>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Development</h3>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Infrastructure</h3>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Support</h3>
              <a href="#ticket-dashboard" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                <span className="w-4 h-4 mr-3 inline-block">🎫</span>
                Ticket Dashboard
              </a>
            </div>
            {/* Settings Section */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Settings</h3>
              <a href="#user-management" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                <span className="w-4 h-4 mr-3 inline-block">⚙️</span>
                User Management
              </a>
            </div>
          </div>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Home</h1>
            <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your SaaS today.</p>
          </div>
          <div className="flex items-center space-x-4">
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
                <p className="text-3xl font-bold text-gray-900">$12,450</p>
                <p className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <span className="text-green-600 text-sm font-semibold">+8.2%</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">4,215</p>
                <p className="text-xs text-gray-500 mt-1">Monthly Active Users</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                  <span className="text-red-600 text-sm font-semibold">+0.3%</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">2.8%</p>
                <p className="text-xs text-gray-500 mt-1">Monthly Churn</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">NPS Score</p>
                  <span className="text-green-600 text-sm font-semibold">+5</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">42</p>
                <p className="text-xs text-gray-500 mt-1">Net Promoter Score</p>
              </div>
            </div>
          </div>
          {/* Quick Status Row */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
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
                    <p className="text-xs text-gray-500">3 Critical</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Support Tickets</p>
                    <p className="text-xs text-gray-500">12 Unresolved</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Deployment</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Product Performance */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Product Performance</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Charts or tables for usage, versions, etc.</p>
            </div>
          </div>
          {/* Customer Insights */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Customer Insights</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Graphs for customer health, segments, etc.</p>
            </div>
          </div>
          {/* Financial Overview */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Financial Overview</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Revenue trends, costs, etc.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 