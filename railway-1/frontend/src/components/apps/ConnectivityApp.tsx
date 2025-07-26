'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi, Server, Database, Brain, Activity, Zap,
  RefreshCw, Settings, BarChart3, AlertTriangle
} from 'lucide-react';
import ConnectivityTest from '../connectivity/ConnectivityTest';
import ConnectivityStatus from '../connectivity/ConnectivityStatus';

// ==================== CONNECTIVITY APP ====================

const ConnectivityApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'settings'>('overview');
  const [showDetails, setShowDetails] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'detailed', label: 'Detailed Test', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">System Connectivity</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitor AI-BOS service connections and performance
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Quick Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Backend API</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">Connected</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Database</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Connected</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <Brain className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Consciousness</h3>
                    <p className="text-sm text-pink-600 dark:text-pink-400">Active</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Connectivity Test */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Service Status</h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              <ConnectivityTest showDetails={showDetails} />
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">45ms</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">99.9%</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Active Connections</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">12</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Consciousness Level</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">87%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="p-6">
            <ConnectivityTest showDetails={true} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Connection Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-refresh</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically check connection status every 30 seconds
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Detailed logging</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Log detailed connection information for debugging
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Show notifications when services go offline
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">API Endpoints</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Backend API:</span>
                  <span className="font-mono">https://aibos-railay-1-production.up.railway.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Database:</span>
                  <span className="font-mono">Supabase (AI-governed)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Consciousness:</span>
                  <span className="font-mono">Local Engine</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectivityApp;
