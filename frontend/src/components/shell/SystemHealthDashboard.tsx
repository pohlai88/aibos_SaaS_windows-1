'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemHealth } from './hooks/useSystemHealth';
import { useSystemCore } from './SystemCore';

interface SystemHealthDashboardProps {
  className?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  className = '',
  isVisible = false,
  onClose
}) => {
  const health = useSystemHealth();
  const { trackEvent } = useSystemCore();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'errors'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'degraded': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'degraded': return '🔄';
      default: return '🔄';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏥</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                System Health Dashboard
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {health.statusMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'performance', label: 'Performance', icon: '⚡' },
            { id: 'errors', label: 'Issues', icon: '🔍' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                trackEvent('health_dashboard_tab_changed', { tab: tab.id });
              }}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Health Score */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      System Health Score
                    </h3>
                    <div className={`text-2xl font-bold ${getStatusColor(health.status)}`}>
                      {health.healthScore}/100
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${
                        health.healthScore >= 90 ? 'bg-green-500' :
                        health.healthScore >= 70 ? 'bg-yellow-500' :
                        health.healthScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${health.healthScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getStatusIcon(health.status)}</div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <p className={`font-semibold ${getStatusColor(health.status)}`}>
                          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">⏱️</div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Boot Time</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(health.bootTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💾</div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Memory</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatBytes(health.memoryUsage * 1024 * 1024)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🕐</div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Session</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {health.sessionAge}m
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues Summary */}
                {(health.hasErrors || health.hasWarnings) && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      Issues Detected
                    </h4>
                    <div className="space-y-1 text-sm">
                      {health.hasErrors && (
                        <p className="text-red-700 dark:text-red-300">
                          ❌ {health.errorCount} error{health.errorCount !== 1 ? 's' : ''}
                        </p>
                      )}
                      {health.hasWarnings && (
                        <p className="text-orange-700 dark:text-orange-300">
                          ⚠️ {health.warningCount} warning{health.warningCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Boot Performance */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Boot Performance
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Boot Time</span>
                        <span className="font-semibold">{formatTime(health.bootTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className={`font-semibold ${
                          health.bootTime < 1000 ? 'text-green-600' :
                          health.bootTime < 2000 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {health.bootTime < 1000 ? 'Excellent' :
                           health.bootTime < 2000 ? 'Good' : 'Slow'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Memory Usage
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Current Usage</span>
                        <span className="font-semibold">{formatBytes(health.memoryUsage * 1024 * 1024)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className={`font-semibold ${
                          health.memoryUsage < 50 ? 'text-green-600' :
                          health.memoryUsage < 100 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {health.memoryUsage < 50 ? 'Optimal' :
                           health.memoryUsage < 100 ? 'Moderate' : 'High'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'errors' && (
              <motion.div
                key="errors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  System Issues
                </h3>

                {!health.hasErrors && !health.hasWarnings ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No issues detected! Your system is running smoothly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {health.hasErrors && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                          Errors ({health.errorCount})
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Critical issues that may affect system functionality
                        </p>
                      </div>
                    )}

                    {health.hasWarnings && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          Warnings ({health.warningCount})
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Non-critical issues that should be addressed
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SystemHealthDashboard;
