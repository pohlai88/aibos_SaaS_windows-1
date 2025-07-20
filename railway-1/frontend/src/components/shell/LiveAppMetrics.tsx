'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface AppMetrics {
  appId: string;
  appName: string;
  cpuUsage: number; // 0-100
  memoryUsage: number; // MB
  memoryPercentage: number; // 0-100
  isActive: boolean;
  windowCount: number;
  lastActivity: Date;
  performance: 'excellent' | 'good' | 'warning' | 'critical';
}

interface LiveAppMetricsProps {
  className?: string;
  onAppSelect?: (appId: string) => void;
  onPerformanceAlert?: (appId: string, issue: string) => void;
}

// ==================== CONSTANTS ====================
const PERFORMANCE_THRESHOLDS = {
  cpu: {
    excellent: 20,
    good: 50,
    warning: 80,
    critical: 95
  },
  memory: {
    excellent: 100, // MB
    good: 300,
    warning: 800,
    critical: 1500
  }
};

const PERFORMANCE_COLORS = {
  excellent: 'text-green-500',
  good: 'text-blue-500',
  warning: 'text-yellow-500',
  critical: 'text-red-500'
};

// ==================== COMPONENTS ====================
interface MetricsCardProps {
  metrics: AppMetrics;
  onSelect: (appId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  metrics,
  onSelect,
  isExpanded,
  onToggleExpand
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCpuColor = (usage: number) => {
    if (usage >= PERFORMANCE_THRESHOLDS.cpu.critical) return 'text-red-500';
    if (usage >= PERFORMANCE_THRESHOLDS.cpu.warning) return 'text-yellow-500';
    if (usage >= PERFORMANCE_THRESHOLDS.cpu.good) return 'text-blue-500';
    return 'text-green-500';
  };

  const getMemoryColor = (usage: number) => {
    if (usage >= PERFORMANCE_THRESHOLDS.memory.critical) return 'text-red-500';
    if (usage >= PERFORMANCE_THRESHOLDS.memory.warning) return 'text-yellow-500';
    if (usage >= PERFORMANCE_THRESHOLDS.memory.good) return 'text-blue-500';
    return 'text-green-500';
  };

  const formatMemory = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
        metrics.isActive ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => onSelect(metrics.appId)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              metrics.performance === 'critical' ? 'bg-red-500' :
              metrics.performance === 'warning' ? 'bg-yellow-500' :
              metrics.performance === 'good' ? 'bg-blue-500' : 'bg-green-500'
            }`} />
            <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {metrics.appName}
            </span>
            {metrics.windowCount > 1 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                {metrics.windowCount}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Expanded Metrics */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="border-t border-gray-200 dark:border-gray-700 p-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-3">
              {/* CPU Usage */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>CPU</span>
                  <span className={getCpuColor(metrics.cpuUsage)}>
                    {metrics.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      getCpuColor(metrics.cpuUsage).replace('text-', 'bg-')
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.cpuUsage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Memory</span>
                  <span className={getMemoryColor(metrics.memoryUsage)}>
                    {formatMemory(metrics.memoryUsage)} ({metrics.memoryPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      getMemoryColor(metrics.memoryUsage).replace('text-', 'bg-')
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.memoryPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Performance Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`capitalize ${
                  PERFORMANCE_COLORS[metrics.performance]
                }`}>
                  {metrics.performance}
                </span>
              </div>

              {/* Last Activity */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Active: {metrics.lastActivity.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const LiveAppMetrics: React.FC<LiveAppMetricsProps> = ({
  className = '',
  onAppSelect,
  onPerformanceAlert
}) => {
  const { trackEvent } = useSystemCore();
  const [metrics, setMetrics] = useState<AppMetrics[]>([]);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  // Simulate live metrics updates
  useEffect(() => {
    const generateMockMetrics = (): AppMetrics[] => [
      {
        appId: 'dashboard',
        appName: 'Dashboard',
        cpuUsage: Math.random() * 30 + 5,
        memoryUsage: Math.random() * 200 + 50,
        memoryPercentage: Math.random() * 15 + 5,
        isActive: true,
        windowCount: 1,
        lastActivity: new Date(),
        performance: 'excellent'
      },
      {
        appId: 'tenants',
        appName: 'Tenant Manager',
        cpuUsage: Math.random() * 40 + 10,
        memoryUsage: Math.random() * 300 + 100,
        memoryPercentage: Math.random() * 20 + 10,
        isActive: false,
        windowCount: 2,
        lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
        performance: 'good'
      },
      {
        appId: 'modules',
        appName: 'Module Registry',
        cpuUsage: Math.random() * 60 + 20,
        memoryUsage: Math.random() * 500 + 200,
        memoryPercentage: Math.random() * 30 + 15,
        isActive: false,
        windowCount: 1,
        lastActivity: new Date(Date.now() - 600000), // 10 minutes ago
        performance: 'warning'
      },
      {
        appId: 'analytics',
        appName: 'Analytics Suite',
        cpuUsage: Math.random() * 80 + 40,
        memoryUsage: Math.random() * 800 + 400,
        memoryPercentage: Math.random() * 50 + 25,
        isActive: false,
        windowCount: 1,
        lastActivity: new Date(Date.now() - 900000), // 15 minutes ago
        performance: 'critical'
      }
    ];

    // Set initial metrics
    setMetrics(generateMockMetrics());

    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(app => ({
        ...app,
        cpuUsage: Math.max(0, Math.min(100, app.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(50, app.memoryUsage + (Math.random() - 0.5) * 50),
        memoryPercentage: Math.max(1, Math.min(100, app.memoryPercentage + (Math.random() - 0.5) * 5)),
        lastActivity: app.isActive ? new Date() : app.lastActivity
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Monitor for performance issues
  useEffect(() => {
    metrics.forEach(app => {
      if (app.cpuUsage >= PERFORMANCE_THRESHOLDS.cpu.critical ||
          app.memoryUsage >= PERFORMANCE_THRESHOLDS.memory.critical) {
        onPerformanceAlert?.(app.appId, `High resource usage detected`);
        trackEvent('performance_alert', {
          appId: app.appId,
          cpuUsage: app.cpuUsage,
          memoryUsage: app.memoryUsage
        });
      }
    });
  }, [metrics, onPerformanceAlert, trackEvent]);

  const handleAppSelect = useCallback((appId: string) => {
    onAppSelect?.(appId);
    trackEvent('metrics_app_selected', { appId });
  }, [onAppSelect, trackEvent]);

  const handleToggleExpand = useCallback((appId: string) => {
    setExpandedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
    trackEvent('metrics_app_expanded', { appId });
  }, [trackEvent]);

  const getTotalSystemUsage = () => {
    const totalCpu = metrics.reduce((sum, app) => sum + app.cpuUsage, 0);
    const totalMemory = metrics.reduce((sum, app) => sum + app.memoryUsage, 0);
    return { cpu: totalCpu, memory: totalMemory };
  };

  const systemUsage = getTotalSystemUsage();

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold text-white">Live App Metrics</h3>
        </div>

        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-white/80 hover:text-white transition-colors"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-xs text-white/80 mb-1">Total CPU</div>
          <div className="text-lg font-semibold text-white">
            {systemUsage.cpu.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-xs text-white/80 mb-1">Total Memory</div>
          <div className="text-lg font-semibold text-white">
            {(systemUsage.memory / 1024).toFixed(1)} GB
          </div>
        </div>
      </div>

      {/* App Metrics */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {metrics.map((app) => (
              <MetricsCard
                key={app.appId}
                metrics={app}
                onSelect={handleAppSelect}
                isExpanded={expandedApps.has(app.appId)}
                onToggleExpand={() => handleToggleExpand(app.appId)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Legend */}
      {isVisible && (
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Excellent</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Good</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Warning</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Critical</span>
              </div>
            </div>
            <span>Updated every 2s</span>
          </div>
        </div>
      )}
    </div>
  );
};
