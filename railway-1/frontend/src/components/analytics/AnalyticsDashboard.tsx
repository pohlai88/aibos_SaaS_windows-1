import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart, Activity, Download, Filter, Calendar,
  Loader2, AlertCircle, XCircle, CheckCircle, Plus, Settings, RefreshCw,
  Users, DollarSign, Shield, Globe, Zap, Eye, BarChart, LineChart, PieChart as PieChartIcon,
  Brain, Target, TrendingDown, AlertTriangle, Lightbulb, Sparkles
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';
import { PredictiveAnalyticsEngine } from '@/ai/engines/PredictiveAnalyticsEngine';
import { XAISystem } from '@/lib/xai-system';
import { HybridIntelligenceSystem } from '@/lib/hybrid-intelligence';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';
import {
  designTokens,
  SecurityValidation,
  RateLimiter,
  Logger,
  createMemoryCache,
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
} from 'aibos-shared-infrastructure';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  category: string;
  timestamp: Date;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface Report {
  id: string;
  name: string;
  type: 'performance' | 'user' | 'revenue' | 'security' | 'custom';
  description: string;
  createdAt: Date;
  lastRun: Date;
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  isActive: boolean;
  data: any;
}

interface AnalyticsFilter {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  categories: string[];
  metrics: string[];
}

// ==================== PREDICTIVE ANALYTICS TYPES ====================

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: '1h' | '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
  trend: 'up' | 'down' | 'stable';
  reasoning: string;
  factors: string[];
  risk: 'low' | 'medium' | 'high';
  recommendations: string[];
  xaiExplanation?: any;
  hybridReasoning?: any;
}

interface Anomaly {
  id: string;
  metric: string;
  detectedValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  impact: string;
  recommendations: string[];
}

interface TrendAnalysis {
  id: string;
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  strength: number; // 0-1
  duration: string;
  seasonality: boolean;
  patterns: string[];
  forecast: number[];
  confidence: number;
}

export const AnalyticsDashboard: React.FC = () => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('analytics');
  const isModuleEnabled = useModuleEnabled('analytics');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('analytics', 'view', currentUser);
  const canExport = usePermission('analytics', 'export', currentUser);
  const canConfigure = usePermission('analytics', 'configure', currentUser);
  const canRealTime = usePermission('analytics', 'real_time', currentUser);
  const canHistorical = usePermission('analytics', 'historical', currentUser);
  const canPredictive = usePermission('analytics', 'predictive', currentUser);
  const canCustomReports = usePermission('analytics', 'custom_reports', currentUser);
  const canDataVisualization = usePermission('analytics', 'data_visualization', currentUser);
  const canInsights = usePermission('analytics', 'insights', currentUser);
  const canAlerts = usePermission('analytics', 'alerts', currentUser);
  const canScheduling = usePermission('analytics', 'scheduling', currentUser);
  const canSharing = usePermission('analytics', 'sharing', currentUser);

  // Get configuration from manifest
  const refreshInterval = moduleConfig.refreshInterval || 30000;
  const maxDataPoints = moduleConfig.maxDataPoints || 1000;
  const retentionPeriod = moduleConfig.retentionPeriod || 90;
  const chartTypes = moduleConfig.chartTypes || ['line', 'bar', 'pie', 'area', 'scatter', 'heatmap'];
  const timeRanges = moduleConfig.timeRanges || ['1h', '24h', '7d', '30d', '90d', '1y'];
  const availableMetrics = moduleConfig.metrics || ['users', 'sessions', 'pageviews', 'conversions', 'revenue', 'performance'];
  const features = moduleConfig.features || {};
  const uiConfig = moduleConfig.ui || {};
  const performanceConfig = moduleConfig.performance || {};
  const dataConfig = moduleConfig.data || {};
  const exportConfig = moduleConfig.export || {};
  const alertsConfig = moduleConfig.alerts || {};

  // ==================== COMPONENT STATE ====================
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'charts' | 'exports' | 'predictions'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const { addNotification } = useAIBOSStore();

  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [chartData, setChartData] = useState<{ [key: string]: ChartData }>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: 'month',
    categories: [],
    metrics: []
  });

  // ==================== PREDICTIVE ANALYTICS STATE ====================
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionTimeframe, setPredictionTimeframe] = useState<'1d' | '1w' | '1m' | '3m'>('1w');

  // ==================== REVOLUTIONARY AI SYSTEMS ====================
  const predictiveEngine = new PredictiveAnalyticsEngine();
  const xaiSystem = XAISystem.getInstance();
  const hybridIntelligence = HybridIntelligenceSystem.getInstance();

  // Initialize shared infrastructure
  const sharedCache = createMemoryCache({ maxSize: 1000, ttl: 300000 });
  const sharedLogger = Logger;
  const sharedSecurity = SecurityValidation;
  const sharedRateLimiter = RateLimiter;

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch analytics data from API with manifest-driven configuration
      const [metricsResponse, chartsResponse, reportsResponse] = await Promise.all([
        fetch(`/api/analytics/metrics?range=${selectedDateRange}&maxDataPoints=${maxDataPoints}&retentionPeriod=${retentionPeriod}`),
        fetch(`/api/analytics/charts?range=${selectedDateRange}&chartTypes=${chartTypes.join(',')}&maxDataPoints=${maxDataPoints}`),
        fetch(`/api/analytics/reports?retentionPeriod=${retentionPeriod}`)
      ]);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      if (chartsResponse.ok) {
        const chartsData = await chartsResponse.json();
        setChartData(chartsData.data);
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      addNotification({
        type: 'error',
        title: 'Analytics Error',
        message: 'Unable to load analytics data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateRange, addNotification]);

  // ==================== PREDICTIVE ANALYTICS FUNCTIONS ====================

  const generatePredictions = useCallback(async () => {
    if (metrics.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data Available',
        message: 'Please load analytics data before generating predictions.',
        isRead: false
      });
      return;
    }

    setIsPredicting(true);
    try {
      // Prepare data for prediction
      const predictionData = metrics.map(metric => ({
        metric: metric.name,
        values: [metric.value],
        timestamps: [metric.timestamp],
        category: metric.category
      }));

      // Generate predictions using Predictive Analytics Engine
      const predictions = await Promise.all(
        predictionData.map(async (data) => {
          try {
            // Generate prediction using the process method
            const predictionResponse = await predictiveEngine.process({
              task: 'time-series-forecasting',
              data: data.values.map((value, index) => ({
                timestamp: new Date(Date.now() - (data.values.length - index - 1) * 24 * 60 * 60 * 1000),
                value: value
              })),
              options: {
                confidence: 0.8,
                maxResults: 1
              }
            });

            const prediction = predictionResponse.result;

            // Get XAI explanation
            const xaiExplanation = await xaiSystem.explainPredictiveDecision(
              'predictive_analytics',
              data,
              prediction,
              { timeframe: predictionTimeframe, metric: data.metric }
            );

            // Get Hybrid Intelligence reasoning
            const hybridDecision = await hybridIntelligence.processPredictiveDecision(
              'predictive_analytics',
              data,
              prediction,
              { timeframe: predictionTimeframe, metric: data.metric }
            );

            return {
              id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              metric: data.metric,
              currentValue: data.values[0],
              predictedValue: prediction.predictedValue,
              confidence: prediction.confidence,
              timeframe: predictionTimeframe,
              trend: prediction.trend,
              reasoning: prediction.reasoning,
              factors: prediction.factors || [],
              risk: prediction.risk || 'medium',
              recommendations: prediction.recommendations || [],
              xaiExplanation,
              hybridReasoning: hybridDecision.reasoning
            } as Prediction;
          } catch (error) {
            console.error(`Failed to generate prediction for ${data.metric}:`, error);
            return null;
          }
        })
      );

      // Filter out failed predictions
      const validPredictions = predictions.filter(p => p !== null) as Prediction[];
      setPredictions(validPredictions);

      // Generate anomalies
      const anomalies = await generateAnomalies(metrics);
      setAnomalies(anomalies);

      // Generate trend analysis
      const trends = await generateTrendAnalysis(metrics);
      setTrendAnalysis(trends);

      addNotification({
        type: 'success',
        title: 'Predictions Generated',
        message: `Generated ${validPredictions.length} predictions with ${predictionTimeframe} timeframe.`,
        isRead: false
      });

      // Log success
      sharedLogger.info();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate predictions';
      setError(errorMessage);

      addNotification({
        type: 'error',
        title: 'Prediction Error',
        message: errorMessage,
        isRead: false
      });

      // Log error
      sharedLogger.error();
    } finally {
      setIsPredicting(false);
    }
  }, [metrics, predictionTimeframe, predictiveEngine, xaiSystem, hybridIntelligence, addNotification, sharedLogger]);

  const generateAnomalies = useCallback(async (metricsData: AnalyticsMetric[]): Promise<Anomaly[]> => {
    try {
      const anomalies: Anomaly[] = [];

      for (const metric of metricsData) {
        try {
          // Detect anomalies using Predictive Analytics Engine
          const anomalyResponse = await predictiveEngine.process({
            task: 'anomaly-detection',
            data: [{
              timestamp: metric.timestamp,
              value: metric.value
            }],
            options: {
              confidence: 0.8
            }
          });

          const anomalyResult = anomalyResponse.result;
          if (anomalyResult.anomalies && anomalyResult.anomalies.length > 0) {
            const anomaly = anomalyResult.anomalies[0];
            anomalies.push({
              id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              metric: metric.name,
              detectedValue: metric.value,
              expectedValue: metric.value * (1 + (anomaly.score || 0)),
              deviation: (anomaly.score || 0) * 100,
              severity: anomaly.severity,
              timestamp: metric.timestamp,
              description: `Anomaly detected in ${metric.name}`,
              impact: `Deviation of ${Math.abs((anomaly.score || 0) * 100).toFixed(2)}% from expected value`,
              recommendations: []
            });
          }
        } catch (error) {
          console.error(`Failed to detect anomalies for ${metric.name}:`, error);
        }
      }

      return anomalies;
    } catch (error) {
      console.error('Failed to generate anomalies:', error);
      return [];
    }
  }, [predictiveEngine]);

  const generateTrendAnalysis = useCallback(async (metricsData: AnalyticsMetric[]): Promise<TrendAnalysis[]> => {
    try {
      const trends: TrendAnalysis[] = [];

      for (const metric of metricsData) {
        try {
          // Analyze trends using Predictive Analytics Engine
          const trendResponse = await predictiveEngine.process({
            task: 'trend-analysis',
            data: [{
              timestamp: metric.timestamp,
              value: metric.value
            }],
            options: {
              confidence: 0.8
            }
          });

          const trendResult = trendResponse.result;
          trends.push({
            id: `trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            metric: metric.name,
            trend: trendResult.trend === 'seasonal' ? 'cyclical' : trendResult.trend,
            strength: trendResult.strength,
            duration: '1 month',
            seasonality: trendResult.seasonality?.detected || false,
            patterns: [],
            forecast: [],
            confidence: trendResult.confidence
          });
        } catch (error) {
          console.error(`Failed to analyze trends for ${metric.name}:`, error);
        }
      }

      return trends;
    } catch (error) {
      console.error('Failed to generate trend analysis:', error);
      return [];
    }
  }, [predictiveEngine]);

  // Removed duplicate fetchAnalyticsData function - using the one above

  const generateReport = useCallback(async (reportType: string, filters: any) => {
    try {
      const response = await fetch('/api/analytics/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, filters })
      });

      if (response.ok) {
        const result = await response.json();
        addNotification({
          type: 'success',
          title: 'Report Generated',
          message: 'Analytics report generated successfully.',
          isRead: false
        });
        return result.data;
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Report Error',
        message: 'Failed to generate analytics report.',
        isRead: false
      });
    }
  }, [addNotification]);

  const exportData = useCallback(async (format: 'csv' | 'pdf' | 'excel', data: any) => {
    if (!canExport) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to export analytics data.',
        isRead: false
      });
      return;
    }

    if (!exportConfig.formats?.includes(format)) {
      addNotification({
        type: 'error',
        title: 'Export Format Not Supported',
        message: `Export format ${format} is not supported in the current configuration.`,
        isRead: false
      });
      return;
    }

    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, data })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        addNotification({
          type: 'success',
          title: 'Export Complete',
          message: `Data exported as ${format.toUpperCase()} successfully.`,
          isRead: false
        });
      } else {
        throw new Error('Failed to export data');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Export Error',
        message: 'Failed to export analytics data.',
        isRead: false
      });
    }
  }, [addNotification]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Manifest-driven auto-refresh
  useEffect(() => {
    if (!features.realTimeAnalytics) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchAnalyticsData, refreshInterval, features.realTimeAnalytics]);

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'global': return <Globe className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricColor = (category: string) => {
    switch (category) {
      case 'users': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'revenue': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'security': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'performance': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'global': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="w-4 h-4" />;
      case 'decrease': return <TrendingUp className="w-4 h-4 transform rotate-180" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
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
      <p className="text-gray-500 dark:text-gray-400">Loading analytics data...</p>
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

  const ChartPlaceholder: React.FC<{ type: string; title: string }> = ({ type, title }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          {type === 'bar' && <BarChart className="w-4 h-4 text-gray-400" />}
          {type === 'line' && <LineChart className="w-4 h-4 text-gray-400" />}
          {type === 'pie' && <PieChartIcon className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            {type === 'bar' && <BarChart className="w-8 h-8 text-gray-400" />}
            {type === 'line' && <LineChart className="w-8 h-8 text-gray-400" />}
            {type === 'pie' && <PieChartIcon className="w-8 h-8 text-gray-400" />}
          </div>
          <p className="text-gray-500 dark:text-gray-400">Chart data will appear here</p>
        </div>
      </div>
    </div>
  );

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading Manifestor...</p>
        </div>
      </div>
    );
  }

  if (manifestError) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manifestor Error</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{manifestError}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isModuleEnabled) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Module Disabled</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The Analytics module is currently disabled. Please contact your administrator to enable this feature.</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Admin
          </button>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have permission to view the Analytics Dashboard. Please contact your administrator for access.</p>
          <button
            onClick={() => window.location.href = '/support'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Analytics & Reporting</h1>
              <p className="text-blue-100 text-sm">Manifest-driven data insights & performance metrics</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-blue-100">
                {features.realTimeAnalytics && (
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Real-time
                  </span>
                )}
                {features.predictiveAnalytics && (
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    Predictive
                  </span>
                )}
                {features.customReports && (
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Custom Reports
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  v{moduleConfig.version || '1.0.0'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            {canRealTime && (
              <button
                onClick={fetchAnalyticsData}
                className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity, permission: canView },
            { id: 'reports', label: 'Reports', icon: BarChart3, permission: canCustomReports },
            { id: 'charts', label: 'Charts', icon: PieChart, permission: canDataVisualization },
            { id: 'exports', label: 'Exports', icon: Download, permission: canExport }
          ].filter(tab => tab.permission).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
          <ErrorState message={error} onRetry={fetchAnalyticsData} />
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
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${getMetricColor(metric.category)}`}>
                          {getMetricIcon(metric.category)}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getChangeIcon(metric.changeType)}
                          <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {metric.name}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(metric.value)}{metric.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartPlaceholder type="line" title="User Growth Trend" />
                  <ChartPlaceholder type="bar" title="Revenue by Category" />
                  <ChartPlaceholder type="pie" title="Traffic Sources" />
                  <ChartPlaceholder type="line" title="Performance Metrics" />
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Reports</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generateReport('performance', filters)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Report
                    </button>
                  </div>
                </div>

                {reports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {report.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {report.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Type: {report.type}</span>
                              <span>Schedule: {report.schedule}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {report.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Created: {formatDate(report.createdAt)}</span>
                          <span>Last run: {formatDate(report.lastRun)}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <button
                            onClick={() => generateReport(report.type, { reportId: report.id })}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Run Now
                          </button>
                          <button
                            onClick={() => exportData('pdf', report.data)}
                            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="No Reports Available"
                    description="Generate your first analytics report to get started."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'charts' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Visualizations</h3>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartPlaceholder type="line" title="User Engagement Over Time" />
                  <ChartPlaceholder type="bar" title="Feature Usage Statistics" />
                  <ChartPlaceholder type="pie" title="User Demographics" />
                  <ChartPlaceholder type="line" title="System Performance Trends" />
                  <ChartPlaceholder type="bar" title="Revenue Analytics" />
                  <ChartPlaceholder type="pie" title="Security Incident Types" />
                </div>
              </motion.div>
            )}

            {activeTab === 'exports' && (
              <motion.div
                key="exports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Exports</h3>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Export
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Download className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">User Analytics</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">User behavior and engagement data</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportData('csv', { type: 'users' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportData('pdf', { type: 'users' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => exportData('excel', { type: 'users' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        Excel
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Reports</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Financial performance and billing data</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportData('csv', { type: 'revenue' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportData('pdf', { type: 'revenue' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => exportData('excel', { type: 'revenue' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        Excel
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Security Analytics</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Security incidents and threat data</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportData('csv', { type: 'security' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportData('pdf', { type: 'security' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => exportData('excel', { type: 'security' })}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        Excel
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
