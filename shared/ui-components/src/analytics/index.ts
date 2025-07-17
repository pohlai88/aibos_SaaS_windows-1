/**
 * Analytics UI Components
 *
 * Advanced data visualization and real-time analytics components for AI-BOS platform.
 * Provides comprehensive analytics dashboards, charts, and metrics visualization.
 */

// Analytics Components
// Advanced data visualization and real-time metrics

export { AnalyticsDashboard } from './AnalyticsDashboard';

// Re-export types
export type { AnalyticsDashboardProps } from './AnalyticsDashboard';

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'percentage' | 'currency' | 'duration';
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: string[];
  groupBy?: string;
  segmentBy?: string;
}

// Utility functions for chart data generation
export const generateChartData = (data: any[], xKey: string, yKey: string): ChartData[] => {
  return data.map((item) => ({
    name: item[xKey],
    value: item[yKey],
  }));
};

export const aggregateData = (
  data: any[],
  groupBy: string,
  aggregateBy: string,
  operation: 'sum' | 'avg' | 'count' | 'max' | 'min',
): ChartData[] => {
  const grouped = data.reduce(
    (acc, item) => {
      const key = item[groupBy];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item[aggregateBy]);
      return acc;
    },
    {} as Record<string, number[]>,
  );

  return Object.entries(grouped).map(([name, values]) => {
    let value: number;
    const numValues = values as number[];

    switch (operation) {
      case 'sum':
        value = numValues.reduce((sum: number, val: number) => sum + (val || 0), 0);
        break;
      case 'avg':
        value =
          numValues.reduce((sum: number, val: number) => sum + (val || 0), 0) / numValues.length;
        break;
      case 'count':
        value = numValues.length;
        break;
      case 'max':
        value = Math.max(...numValues.map((val) => val || 0));
        break;
      case 'min':
        value = Math.min(...numValues.map((val) => val || 0));
        break;
      default:
        value = 0;
    }
    return { name, value };
  });
};

export const formatMetricValue = (value: number, format: AnalyticsMetric['format']): string => {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'duration':
      return `${Math.floor(value / 60)}m ${Math.floor(value % 60)}s`;
    default:
      return value.toLocaleString();
  }
};

export const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  if (previous === 0) return 'stable';
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
};

export const generateTimeSeriesData = (
  data: any[],
  timeKey: string,
  valueKey: string,
  interval: 'hour' | 'day' | 'week' | 'month' = 'day',
): ChartData[] => {
  return data.map((item) => ({
    name: new Date(item[timeKey]).toLocaleDateString(),
    value: item[valueKey],
  }));
};

// Component Registry Entry
export const ANALYTICS_REGISTRY = {
  AnalyticsDashboard: () => import('./AnalyticsDashboard'),
} as const;

// Utility Functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

// Chart color utilities
export const CHART_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6366F1',
];

export const getChartColor = (index: number): string => {
  const color = CHART_COLORS[index % CHART_COLORS.length];
  return color || CHART_COLORS[0];
};

// Data processing utilities
export const calculateMovingAverage = (data: number[], window: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const values = data.slice(start, i + 1);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    result.push(average);
  }
  return result;
};

export const calculatePercentile = (data: number[], percentile: number): number => {
  const sorted = [...data].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
};

export const detectAnomalies = (data: number[], threshold: number = 2): number[] => {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return data
    .map((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      return zScore > threshold ? index : -1;
    })
    .filter((index) => index !== -1);
};

// Performance monitoring utilities
export const measurePerformance = <T>(fn: () => T): { result: T; duration: number } => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Validation Utilities
export const validateChartData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Data array cannot be empty');
    return { isValid: false, errors };
  }

  data.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item at index ${index} must be an object`);
      return;
    }

    if (!item.hasOwnProperty('name') || !item.hasOwnProperty('value')) {
      errors.push(`Item at index ${index} must have 'name' and 'value' properties`);
      return;
    }

    if (typeof item.value !== 'number' || isNaN(item.value)) {
      errors.push(`Item at index ${index} must have a numeric 'value' property`);
    }
  });

  return { isValid: errors.length === 0, errors };
};
