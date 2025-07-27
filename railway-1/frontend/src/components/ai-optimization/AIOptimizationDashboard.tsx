import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Eye, Gauge, TrendingUp, Settings, RefreshCw,
  CheckCircle, AlertTriangle, Loader2, AlertCircle, XCircle,
  BarChart3, Activity, Cpu, HardDrive, Accessibility, Palette
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
}

interface AccessibilityScore {
  overall: number;
  violations: Array<{
    id: string;
    type: string;
    message: string;
    impact: string;
  }>;
}

export const AIOptimizationDashboard: React.FC = () => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { manifestor, health, isHealthy } = useManifestor();
  const manifestLoading = false; // TODO: Add loading state to useManifestor
  const manifestError = null; // TODO: Add error state to useManifestor
  const moduleConfig = useModuleConfig('ai-components');
  const isModuleEnabled = useModuleEnabled('ai-components');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('ai-components', 'view', currentUser);
  const canOptimize = usePermission('ai-components', 'ai_optimization', currentUser);
  const canConfigure = usePermission('ai-components', 'configure', currentUser);

  // Get configuration from manifest
  const optimizationConfig = moduleConfig.components?.AIOptimizationDashboard;
  const features = moduleConfig.features;
  const performance = moduleConfig.performance;

  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'accessibility' | 'ui'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const { addNotification } = useAIBOSStore();

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [accessibilityScore, setAccessibilityScore] = useState<AccessibilityScore | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-4">AI Optimization Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-4">AI Optimization Disabled</div>;
  }

  if (!canView) {
    return <div className="text-gray-600 p-4">Access Denied</div>;
  }

  // Check if optimization features are enabled
  const modelOptimizationEnabled = optimizationConfig?.features?.model_optimization;
  const performanceAnalysisEnabled = optimizationConfig?.features?.performance_analysis;
  const resourceManagementEnabled = optimizationConfig?.features?.resource_management;
  const autoScalingEnabled = optimizationConfig?.features?.auto_scaling;
  const costOptimizationEnabled = optimizationConfig?.features?.cost_optimization;

  const fetchOptimizationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const performanceResponse = await fetch('/api/ai-optimization/performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceMetrics(performanceData.data);
      }

      const accessibilityResponse = await fetch('/api/ai-optimization/accessibility');
      if (accessibilityResponse.ok) {
        const accessibilityData = await accessibilityResponse.json();
        setAccessibilityScore(accessibilityData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load optimization data');
      addNotification({
        type: 'error',
        title: 'Optimization Error',
        message: 'Unable to load AI optimization data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleRunOptimization = useCallback(async (type: string) => {
    try {
      const response = await fetch('/api/ai-optimization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Optimization Started',
          message: `${type} optimization is running in the background.`,
          isRead: false
        });
        setTimeout(fetchOptimizationData, 2000);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Optimization Failed',
        message: 'Failed to start optimization process.',
        isRead: false
      });
    }
  }, [addNotification, fetchOptimizationData]);

  useEffect(() => {
    fetchOptimizationData();
  }, [fetchOptimizationData]);

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return 'text-green-600';
    if (value <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccessibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const EmptyState: React.FC<{ icon: React.ComponentType<any>; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading AI optimization data...</p>
    </div>
  );

  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">AI Optimization Hub</h1>
              <p className="text-purple-100 text-sm">Intelligent performance, accessibility & UI optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={autoOptimize}
                onChange={(e) => setAutoOptimize(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-optimize</span>
            </label>
            <button
              onClick={() => handleRunOptimization('full')}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Full Scan
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Gauge },
            { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
            { id: 'ui', label: 'UI Optimization', icon: Palette }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOptimizationData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                        <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.cpuUsage || 0, 80)}`}>
                          {performanceMetrics?.cpuUsage || 0}%
                        </p>
                      </div>
                      <Cpu className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
                        <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.memoryUsage || 0, 80)}`}>
                          {performanceMetrics?.memoryUsage || 0}%
                        </p>
                      </div>
                      <HardDrive className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Load Time</p>
                        <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.loadTime || 0, 3000)}`}>
                          {(performanceMetrics?.loadTime || 0).toFixed(0)}ms
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accessibility</p>
                        <p className={`text-2xl font-bold ${getAccessibilityColor(accessibilityScore?.overall || 0)}`}>
                          {accessibilityScore?.overall || 0}%
                        </p>
                      </div>
                      <Accessibility className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
                  </div>
                  <div className="p-6">
                    <EmptyState
                      icon={Brain}
                      title="No AI Suggestions Yet"
                      description="AI will analyze your application and provide optimization suggestions."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
                  <button
                    onClick={() => handleRunOptimization('performance')}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimize Performance
                  </button>
                </div>

                {performanceMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Resources</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span className={getPerformanceColor(performanceMetrics.cpuUsage, 80)}>
                              {performanceMetrics.cpuUsage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${performanceMetrics.cpuUsage > 80 ? 'bg-red-500' : performanceMetrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${performanceMetrics.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory Usage</span>
                            <span className={getPerformanceColor(performanceMetrics.memoryUsage, 80)}>
                              {performanceMetrics.memoryUsage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${performanceMetrics.memoryUsage > 80 ? 'bg-red-500' : performanceMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${performanceMetrics.memoryUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Application Performance</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Load Time</span>
                          <span className={`font-medium ${getPerformanceColor(performanceMetrics.loadTime, 3000)}`}>
                            {performanceMetrics.loadTime}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Render Time</span>
                          <span className={`font-medium ${getPerformanceColor(performanceMetrics.renderTime, 100)}`}>
                            {performanceMetrics.renderTime}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Gauge}
                    title="No Performance Data"
                    description="Run a performance scan to see detailed metrics."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'accessibility' && (
              <motion.div
                key="accessibility"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility Analysis</h3>
                  <button
                    onClick={() => handleRunOptimization('accessibility')}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Accessibility
                  </button>
                </div>

                {accessibilityScore ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Accessibility Score</h4>
                      <div className="text-center">
                        <div className={`text-6xl font-bold mb-4 ${getAccessibilityColor(accessibilityScore.overall)}`}>
                          {accessibilityScore.overall}%
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {accessibilityScore.overall >= 90 ? 'Excellent accessibility' :
                           accessibilityScore.overall >= 70 ? 'Good accessibility' :
                           'Needs improvement'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Violations</h4>
                      {accessibilityScore.violations.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-green-600 font-medium">No accessibility violations found!</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {accessibilityScore.violations.map((violation) => (
                            <div key={violation.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {violation.type}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {violation.message}
                              </p>
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded">
                                {violation.impact}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Accessibility}
                    title="No Accessibility Data"
                    description="Run an accessibility scan to see detailed analysis."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'ui' && (
              <motion.div
                key="ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UI Optimization</h3>
                  <button
                    onClick={() => handleRunOptimization('ui')}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimize UI
                  </button>
                </div>

                <EmptyState
                  icon={Palette}
                  title="UI Optimization Coming Soon"
                  description="AI will analyze your UI components and suggest optimizations for better performance and user experience."
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
