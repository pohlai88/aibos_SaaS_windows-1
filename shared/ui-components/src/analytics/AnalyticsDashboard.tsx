import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';

export interface Metric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  color?: string;
  icon?: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface AnalyticsDashboardProps {
  className?: string;
  title?: string;
  metrics?: Metric[];
  chartData?: {
    [key: string]: ChartData[];
  };
  refreshInterval?: number;
  enableRealTime?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  isLoading?: boolean;
  error?: string | null;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'grid' | 'list' | 'compact';
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gray: '#6b7280',
};

const CHART_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#ec4899',
  '#6366f1',
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  title = 'Analytics Dashboard',
  metrics = [],
  chartData = {},
  refreshInterval = 30000,
  enableRealTime = true,
  showFilters = true,
  showExport = true,
  onRefresh,
  onExport,
  isLoading = false,
  error = null,
  theme = 'auto',
  layout = 'grid',
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie' | 'radar'>('line');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(enableRealTime);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Initialize selected metrics
  useEffect(() => {
    if (selectedMetrics.length === 0 && metrics.length > 0) {
      setSelectedMetrics(metrics.slice(0, 4).map((m) => m.id));
    }
  }, [metrics, selectedMetrics]);

  const formatValue = (value: number, format?: string, unit?: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${Math.floor(value / 60)}m ${value % 60}s`;
      default:
        return new Intl.NumberFormat('en-US').format(value) + (unit ? ` ${unit}` : '');
    }
  };

  const calculateChange = (
    current: number,
    previous?: number,
  ): { change: number; type: 'increase' | 'decrease' | 'neutral' } => {
    if (!previous || previous === 0) return { change: 0, type: 'neutral' };

    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.abs(change),
      type: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
    };
  };

  const renderMetricCard = (metric: Metric) => {
    const { change, type } = calculateChange(metric.value, metric.previousValue);
    const Icon = metric.icon || BarChart3;

    return (
      <motion.div
        key={metric.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${metric.color ? `bg-${metric.color}-100 text-${metric.color}-600` : 'bg-blue-100 text-blue-600'}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {type !== 'neutral' && (
              <div
                className={`flex items-center space-x-1 text-xs ${
                  type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {type === 'increase' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3 rotate-180" />
                )}
                <span>{change.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(metric.value, metric.format, metric.unit)}
        </div>

        {metric.previousValue && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            vs {formatValue(metric.previousValue, metric.format, metric.unit)} previous period
          </div>
        )}
      </motion.div>
    );
  };

  const renderChart = (data: ChartData[], type: string, title: string) => {
    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                name="Value"
                dataKey="value"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    onExport?.(format);
  };

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ];

  const chartTypes = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'radar', label: 'Radar Chart' },
  ];

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900 min-h-screen ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time analytics and insights for your AI-BOS platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {showFilters && (
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onRefresh?.()}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {showExport && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div
          className={`grid gap-6 mb-8 ${
            layout === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : layout === 'list'
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
          }`}
        >
          {metrics.map(renderMetricCard)}
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {Object.entries(chartData).map(([key, data]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
                >
                  {chartTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {renderChart(data, chartType, key)}
            </motion.div>
          ))}
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold mb-4">Dashboard Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto Refresh</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Enable real-time updates</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Refresh Interval</label>
                    <select
                      value={refreshInterval / 1000}
                      onChange={(e) => {
                        /* Handle interval change */
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
                    >
                      <option value={5}>5 seconds</option>
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Export Data</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportData('csv')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportData('json')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => exportData('pdf')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
