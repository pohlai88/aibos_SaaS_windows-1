/**
 * Analytics UI Components
 * 
 * Advanced data visualization and real-time analytics components for AI-BOS platform.
 * Provides comprehensive analytics dashboards, charts, and metrics visualization.
 */

// Main Components
export { AnalyticsDashboard } from './AnalyticsDashboard';

// Types
export type { 
  Metric, 
  ChartData, 
  AnalyticsDashboardProps 
} from './AnalyticsDashboard';

// Component Registry Entry
export const ANALYTICS_COMPONENTS = {
  AnalyticsDashboard: 'analytics/AnalyticsDashboard'
} as const;

// Default Configuration
export const DEFAULT_ANALYTICS_CONFIG = {
  refreshInterval: 30000,
  enableRealTime: true,
  showFilters: true,
  showExport: true,
  theme: 'auto',
  layout: 'grid'
} as const;

// Utility Functions
export const formatMetricValue = (value: number, format?: string, unit?: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      return `${Math.floor(value / 60)}m ${value % 60}s`;
    case 'bytes':
      return formatBytes(value);
    default:
      return new Intl.NumberFormat('en-US').format(value) + (unit ? ` ${unit}` : '');
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getTrendIcon = (change: number): 'up' | 'down' | 'stable' => {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
};

export const getTrendColor = (change: number): string => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

// Chart Utilities
export const generateChartData = (data: any[], xKey: string, yKey: string): ChartData[] => {
  return data.map(item => ({
    name: item[xKey],
    value: item[yKey]
  }));
};

export const aggregateData = (data: any[], groupBy: string, aggregateBy: string, operation: 'sum' | 'avg' | 'count' | 'max' | 'min'): ChartData[] => {
  const grouped = data.reduce((acc, item) => {
    const key = item[groupBy];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item[aggregateBy]);
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, values]) => {
    let value: number;
    const numValues = values as number[];
    
    switch (operation) {
      case 'sum':
        value = numValues.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        value = numValues.reduce((a, b) => a + b, 0) / numValues.length;
        break;
      case 'count':
        value = numValues.length;
        break;
      case 'max':
        value = Math.max(...numValues);
        break;
      case 'min':
        value = Math.min(...numValues);
        break;
      default:
        value = 0;
    }

    return { name, value };
  });
};

// Time Series Utilities
export const generateTimeSeriesData = (
  startDate: Date,
  endDate: Date,
  interval: 'hour' | 'day' | 'week' | 'month',
  data: any[]
): ChartData[] => {
  const result: ChartData[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const key = formatTimeKey(current, interval);
    const matchingData = data.filter(item => {
      const itemDate = new Date(item.timestamp || item.date);
      return formatTimeKey(itemDate, interval) === key;
    });

    const value = matchingData.reduce((sum, item) => sum + (item.value || 0), 0);
    result.push({ name: key, value });

    // Increment date
    switch (interval) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return result;
};

const formatTimeKey = (date: Date, interval: string): string => {
  switch (interval) {
    case 'hour':
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week ${Math.ceil(date.getDate() / 7)}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
};

// Export Utilities
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any[], filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Color Utilities
export const CHART_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16'
];

export const getColorForIndex = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const generateColorPalette = (count: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(getColorForIndex(i));
  }
  return colors;
};

// Performance Utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
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