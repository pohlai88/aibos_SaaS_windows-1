'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap, Users, Eye, Download, Upload } from 'lucide-react';

// ==================== TYPES ====================
interface AppTelemetryProps {
  appId: string;
  tenantId: string;
  userId: string;
  enableRealTimeTracking?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableUserBehaviorTracking?: boolean;
  enableCrashReporting?: boolean;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  onUserBehaviorInsight?: (insight: UserBehaviorInsight) => void;
  onCrashReport?: (report: CrashReport) => void;
}

interface TelemetryMetrics {
  performance: {
    renderTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    bundleSize: number;
    loadTime: number;
  };
  usage: {
    sessions: number;
    activeUsers: number;
    pageViews: number;
    interactions: number;
    errors: number;
    crashes: number;
  };
  behavior: {
    averageSessionDuration: number;
    mostUsedFeatures: string[];
    userJourney: UserAction[];
    conversionRate: number;
    retentionRate: number;
  };
  technical: {
    browser: string;
    device: string;
    os: string;
    screenResolution: string;
    networkType: string;
    timezone: string;
  };
}

interface PerformanceAlert {
  id: string;
  timestamp: Date;
  type: 'slow_render' | 'high_memory' | 'network_timeout' | 'bundle_size' | 'cpu_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  context: Record<string, any>;
}

interface UserBehaviorInsight {
  id: string;
  timestamp: Date;
  type: 'feature_usage' | 'user_journey' | 'conversion' | 'retention' | 'engagement';
  insight: string;
  confidence: number;
  recommendations: string[];
  data: Record<string, any>;
}

interface CrashReport {
  id: string;
  timestamp: Date;
  error: {
    message: string;
    stack: string;
    type: string;
    component?: string;
  };
  context: {
    userAgent: string;
    url: string;
    userId: string;
    sessionId: string;
    componentStack?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface UserAction {
  id: string;
  timestamp: Date;
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'api_call';
  target: string;
  data?: Record<string, any>;
  duration?: number;
}

// ==================== APP TELEMETRY COMPONENT ====================
export const AppTelemetry: React.FC<AppTelemetryProps> = ({
  appId,
  tenantId,
  userId,
  enableRealTimeTracking = true,
  enablePerformanceMonitoring = true,
  enableUserBehaviorTracking = true,
  enableCrashReporting = true,
  onPerformanceAlert,
  onUserBehaviorInsight,
  onCrashReport
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    performance: {
      renderTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      bundleSize: 0,
      loadTime: 0
    },
    usage: {
      sessions: 0,
      activeUsers: 0,
      pageViews: 0,
      interactions: 0,
      errors: 0,
      crashes: 0
    },
    behavior: {
      averageSessionDuration: 0,
      mostUsedFeatures: [],
      userJourney: [],
      conversionRate: 0,
      retentionRate: 0
    },
    technical: {
      browser: 'Unknown',
      device: 'Unknown',
      os: 'Unknown',
      screenResolution: 'Unknown',
      networkType: 'Unknown',
      timezone: 'Unknown'
    }
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [insights, setInsights] = useState<UserBehaviorInsight[]>([]);
  const [crashes, setCrashes] = useState<CrashReport[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showBehavior, setShowBehavior] = useState(false);
  const [showCrashes, setShowCrashes] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const trackingRef = useRef<NodeJS.Timeout | null>(null);
  const performanceRef = useRef<NodeJS.Timeout | null>(null);
  const behaviorRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number>(Date.now());

  // ==================== PERFORMANCE MONITORING ====================
  const monitorPerformance = useCallback(() => {
    // Simulate performance metrics
    const newMetrics = {
      renderTime: Math.random() * 100 + 10,
      memoryUsage: Math.random() * 500 + 50,
      cpuUsage: Math.random() * 30 + 5,
      networkLatency: Math.random() * 200 + 20,
      bundleSize: Math.random() * 1000 + 100,
      loadTime: Math.random() * 2000 + 500
    };

    setMetrics(prev => ({
      ...prev,
      performance: newMetrics
    }));

    // Check for performance alerts
    if (newMetrics.renderTime > 50) {
      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        type: 'slow_render',
        severity: newMetrics.renderTime > 100 ? 'critical' : 'high',
        message: `Slow render detected: ${newMetrics.renderTime.toFixed(2)}ms`,
        value: newMetrics.renderTime,
        threshold: 50,
        context: { component: 'AppContainer', timestamp: Date.now() }
      };

      setAlerts(prev => [...prev, alert]);
      onPerformanceAlert?.(alert);
    }

    if (newMetrics.memoryUsage > 300) {
      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'high_memory',
        severity: newMetrics.memoryUsage > 500 ? 'critical' : 'high',
        message: `High memory usage: ${newMetrics.memoryUsage.toFixed(2)}MB`,
        value: newMetrics.memoryUsage,
        threshold: 300,
        context: { component: 'AppContainer', timestamp: Date.now() }
      };

      setAlerts(prev => [...prev, alert]);
      onPerformanceAlert?.(alert);
    }
  }, [onPerformanceAlert]);

  // ==================== USER BEHAVIOR TRACKING ====================
  const trackUserBehavior = useCallback(() => {
    // Simulate user behavior tracking
    const actions: UserAction[] = [
      {
        id: `action-${Date.now()}`,
        timestamp: new Date(),
        type: 'click',
        target: 'button-submit',
        data: { x: 100, y: 200 }
      },
      {
        id: `action-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'input',
        target: 'input-email',
        data: { value: 'user@example.com' }
      }
    ];

    setMetrics(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        userJourney: [...prev.behavior.userJourney, ...actions].slice(-50) // Keep last 50 actions
      }
    }));

    // Generate insights
    if (Math.random() < 0.1) { // 10% chance of insight
      const insight: UserBehaviorInsight = {
        id: `insight-${Date.now()}`,
        timestamp: new Date(),
        type: 'feature_usage',
        insight: 'Users are spending more time on the dashboard than expected',
        confidence: Math.random() * 0.5 + 0.5, // 50-100%
        recommendations: [
          'Consider adding more interactive elements',
          'Optimize dashboard loading performance',
          'Add user onboarding for new features'
        ],
        data: {
          feature: 'dashboard',
          usageTime: Math.random() * 300 + 60,
          userCount: Math.floor(Math.random() * 100) + 10
        }
      };

      setInsights(prev => [...prev, insight]);
      onUserBehaviorInsight?.(insight);
    }
  }, [onUserBehaviorInsight]);

  // ==================== CRASH REPORTING ====================
  const reportCrash = useCallback((error: Error, context?: Record<string, any>) => {
    const crash: CrashReport = {
      id: `crash-${Date.now()}`,
      timestamp: new Date(),
      error: {
        message: error.message,
        stack: error.stack || '',
        type: error.name,
        component: context?.component
      },
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId,
        sessionId: sessionStartTime.current.toString(),
        componentStack: context?.componentStack
      },
      severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium',
      resolved: false
    };

    setCrashes(prev => [...prev, crash]);
    onCrashReport?.(crash);
  }, [userId, onCrashReport]);

  // ==================== TRACKING CONTROL ====================
  const startTracking = useCallback(() => {
    setIsTracking(true);
    sessionStartTime.current = Date.now();

    // Initialize technical metrics
    setMetrics(prev => ({
      ...prev,
      technical: {
        browser: (navigator.userAgent || '').includes('Chrome') ? 'Chrome' :
        (navigator.userAgent || '').includes('Firefox') ? 'Firefox' :
        (navigator.userAgent || '').includes('Safari') ? 'Safari' : 'Other',
        device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        os: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        networkType: 'Unknown', // Would need Network Information API
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }));

    if (enableRealTimeTracking) {
      trackingRef.current = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          usage: {
            ...prev.usage,
            sessions: prev.usage.sessions + 1,
            pageViews: prev.usage.pageViews + Math.floor(Math.random() * 3) + 1,
            interactions: prev.usage.interactions + Math.floor(Math.random() * 10) + 1
          }
        }));
      }, 5000);
    }

    if (enablePerformanceMonitoring) {
      performanceRef.current = setInterval(() => {
        monitorPerformance();
      }, 3000);
    }

    if (enableUserBehaviorTracking) {
      behaviorRef.current = setInterval(() => {
        trackUserBehavior();
      }, 10000);
    }

    // Simulate crash reporting
    if (enableCrashReporting && Math.random() < 0.05) { // 5% chance of crash
      setTimeout(() => {
        reportCrash(new Error('Simulated application error'), {
          component: 'AppContainer',
          componentStack: 'AppContainer > Component > Child'
        });
      }, Math.random() * 30000 + 10000); // 10-40 seconds
    }
  }, [
    enableRealTimeTracking,
    enablePerformanceMonitoring,
    enableUserBehaviorTracking,
    enableCrashReporting,
    monitorPerformance,
    trackUserBehavior,
    reportCrash
  ]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (trackingRef.current) {
      clearInterval(trackingRef.current);
      trackingRef.current = null;
    }

    if (performanceRef.current) {
      clearInterval(performanceRef.current);
      performanceRef.current = null;
    }

    if (behaviorRef.current) {
      clearInterval(behaviorRef.current);
      behaviorRef.current = null;
    }
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (enableRealTimeTracking || enablePerformanceMonitoring || enableUserBehaviorTracking) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [
    enableRealTimeTracking,
    enablePerformanceMonitoring,
    enableUserBehaviorTracking,
    startTracking,
    stopTracking
  ]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">App Telemetry</h2>

          {/* Tracking Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isTracking ? 'Tracking' : 'Stopped'}
            </span>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className={`p-2 rounded ${showPerformance ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowBehavior(!showBehavior)}
              className={`p-2 rounded ${showBehavior ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCrashes(!showCrashes)}
              className={`p-2 rounded ${showCrashes ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>

          {/* Tracking Controls */}
          <div className="flex items-center space-x-2">
            {isTracking ? (
              <button
                onClick={stopTracking}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startTracking}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== METRICS OVERVIEW ==================== */}
        <div className="flex-1 p-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {metrics.performance.renderTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Render Time</div>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {metrics.performance.memoryUsage.toFixed(1)}MB
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</div>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {metrics.usage.activeUsers}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {metrics.usage.interactions}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Interactions</div>
                </div>
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {metrics.usage.errors}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Errors</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {metrics.performance.bundleSize.toFixed(0)}KB
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Bundle Size</div>
                </div>
                <Download className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
            <div className="h-64 flex items-end justify-center space-x-2">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="w-4 bg-blue-500 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Performance Alerts */}
          <AnimatePresence>
            {showPerformance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Alerts</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {alerts.slice(-5).map((alert) => (
                      <div key={alert.id} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400">{alert.type}</div>
                        <div className="text-red-500 dark:text-red-300">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Behavior Insights */}
          <AnimatePresence>
            {showBehavior && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Behavior Insights</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {insights.slice(-5).map((insight) => (
                      <div key={insight.id} className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div className="font-medium text-green-600 dark:text-green-400">{insight.type}</div>
                        <div className="text-green-500 dark:text-green-300">{insight.insight}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crash Reports */}
          <AnimatePresence>
            {showCrashes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crash Reports</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {crashes.slice(-5).map((crash) => (
                      <div key={crash.id} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400">{crash.error.type}</div>
                        <div className="text-red-500 dark:text-red-300">{crash.error.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {crash.timestamp.toLocaleTimeString()} • {crash.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AppTelemetry;
