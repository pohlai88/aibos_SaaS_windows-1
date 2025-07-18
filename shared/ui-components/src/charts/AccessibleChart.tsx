import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { cva, type VariantProps  } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Accessibility announcement manager
class AccessibilityAnnouncer {
  private announcementQueue: Array<{
    message: string;
    priority: 'low' | 'medium' | 'high';
    timestamp: number;
  }> = [];
  private isAnnouncing = false;
  private lastAnnouncement = 0;
  private announcementDelay = 2000; // Minimum delay between announcements
  private screenReaderElement: HTMLElement | null = null;

  constructor() {
    this.createScreenReaderElement();
  }

  private createScreenReaderElement() {
    // Create a hidden element for screen reader announcements
    this.screenReaderElement = document.createElement('div');
    this.screenReaderElement.setAttribute('aria-live', 'polite');
    this.screenReaderElement.setAttribute('aria-atomic', 'true');
    this.screenReaderElement.className = 'sr-only';
    this.screenReaderElement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.screenReaderElement);
  }

  announce(message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    const now = Date.now();

    // Add to queue
    this.announcementQueue.push({
      message,
      priority,
      timestamp: now,
    });

    // Process queue
    this.processQueue();
  }

  private processQueue() {
    if (this.isAnnouncing || this.announcementQueue.length === 0) return;

    const now = Date.now();
    if (now - this.lastAnnouncement < this.announcementDelay) return;

    // Get highest priority announcement
    const announcement = this.announcementQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];

    if (!announcement) return;

    // Remove from queue
    this.announcementQueue = this.announcementQueue.filter((a) => a !== announcement);

    // Announce
    this.isAnnouncing = true;
    this.lastAnnouncement = now;

    if (this.screenReaderElement) {
      this.screenReaderElement.textContent = announcement.message;

      // Clear after announcement
      setTimeout(() => {
        if (this.screenReaderElement) {
          this.screenReaderElement.textContent = '';
        }
        this.isAnnouncing = false;
        this.processQueue(); // Process next announcement
      }, 100);
    }
  }

  // Intelligent announcement throttling for real-time updates
  announceRealTimeUpdate(update: {
    type: 'data-point' | 'trend' | 'threshold' | 'summary';
    value: number;
    previousValue?: number;
    change?: number;
    percentage?: number;
    context?: string;
  }) {
    const { type, value, previousValue, change, percentage, context } = update;

    let message = '';
    let priority: 'low' | 'medium' | 'high' = 'low';

    switch (type) {
      case 'data-point':
        message = `${context || 'Data point'} updated to ${value}`;
        priority = 'low';
        break;

      case 'trend':
        if (change && Math.abs(change) > 10) {
          const direction = change > 0 ? 'increased' : 'decreased';
          message = `${context || 'Value'} ${direction} by ${Math.abs(change).toFixed(1)}`;
          priority = 'medium';
        }
        break;

      case 'threshold':
        message = `${context || 'Value'} ${value} has reached threshold`;
        priority = 'high';
        break;

      case 'summary':
        if (percentage && Math.abs(percentage) > 5) {
          const direction = percentage > 0 ? 'up' : 'down';
          message = `${context || 'Chart'} ${direction} ${Math.abs(percentage).toFixed(1)}%`;
          priority = 'medium';
        }
        break;
    }

    if (message) {
      this.announce(message, priority);
    }
  }
}

// Chart data point with accessibility metadata
interface AccessibleDataPoint {
  x: number | string;
  y: number;
  label?: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  threshold?: 'warning' | 'critical' | 'normal';
  announcement?: string;
}

// Accessible chart component
export interface AccessibleChartProps extends VariantProps<typeof chartVariants> {
  data: AccessibleDataPoint[];
  type: 'line' | 'bar' | 'area' | 'scatter';
  title: string;
  description?: string;
  enableRealTime?: boolean;
  realTimeInterval?: number;
  enableAnnouncements?: boolean;
  announcementThrottle?: number;
  className?: string;
  onDataPointClick?: (point: AccessibleDataPoint, index: number) => void;
  onTrendChange?: (trend: 'up' | 'down' | 'stable', change: number) => void;
}

const chartVariants = cva('w-full border border-border rounded-lg p-4', {
  variants: {
    variant: {
      default: 'bg-background',
      elevated: 'bg-background shadow-lg',
      minimal: 'bg-transparent border-none',
    },
    size: {
      sm: 'h-64',
      md: 'h-80',
      lg: 'h-96',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export const AccessibleChart: React.FC<AccessibleChartProps> = ({
  data,
  type,
  title,
  description,
  enableRealTime = false,
  realTimeInterval = 5000,
  enableAnnouncements = true,
  announcementThrottle = 3000,
  className,
  onDataPointClick,
  onTrendChange,
  variant = 'default',
  size = 'md',
}) => {
  const [currentData, setCurrentData] = useState<AccessibleDataPoint[]>(data);
  const [previousData, setPreviousData] = useState<AccessibleDataPoint[]>(data);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [lastAnnouncement, setLastAnnouncement] = useState(0);
  const announcerRef = useRef<AccessibilityAnnouncer>();
  const chartRef = useRef<HTMLDivElement>(null);

  // Initialize accessibility announcer
  useEffect(() => {
    if (enableAnnouncements) {
      announcerRef.current = new AccessibilityAnnouncer();

      // Initial announcement
      announcerRef.current.announce(`${title} chart loaded with ${data.length} data points`);
    }
  }, [enableAnnouncements, title, data.length]);

  // Real-time data updates with intelligent announcements
  useEffect(() => {
    if (!enableRealTime || !announcerRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // Throttle announcements
      if (now - lastAnnouncement < announcementThrottle) return;

      // Generate new data points
      const newData = currentData.map((point, index) => {
        const change = (Math.random() - 0.5) * 20;
        const newValue = Math.max(0, point.y + change);

        // Determine trend
        const trend: 'up' | 'down' | 'stable' = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

        // Check thresholds
        const threshold: 'warning' | 'critical' | 'normal' =
          newValue > 80 ? 'critical' : newValue > 60 ? 'warning' : 'normal';

        return {
          ...point,
          y: newValue,
          trend,
          threshold,
          announcement: `${point.label || `Point ${index + 1}`} ${trend} to ${newValue.toFixed(1)}`,
        };
      });

      setPreviousData(currentData);
      setCurrentData(newData);
      setLastAnnouncement(now);
      setAnnouncementCount((prev) => prev + 1);

      // Intelligent announcements
      const significantChanges = newData.filter((point, index) => {
        const oldPoint = currentData[index];
        const change = Math.abs(point.y - oldPoint.y);
        return change > 10 || point.threshold !== 'normal';
      });

      if (significantChanges.length > 0) {
        // Announce summary instead of individual points
        const avgChange =
          significantChanges.reduce((sum, point, index) => {
            const oldPoint = currentData[index];
            return sum + (point.y - oldPoint.y);
          }, 0) / significantChanges.length;

        const direction = avgChange > 0 ? 'up' : 'down';
        const percentage = (Math.abs(avgChange) / 100) * 100;

        announcerRef.current?.announceRealTimeUpdate({
          type: 'summary',
          value: avgChange,
          change: avgChange,
          percentage,
          context: title,
        });
      }

      // Notify trend changes
      const overallTrend = newData.reduce(
        (sum, point) => sum + (point.trend === 'up' ? 1 : point.trend === 'down' ? -1 : 0),
        0,
      );
      if (Math.abs(overallTrend) > newData.length * 0.3) {
        const trend: 'up' | 'down' | 'stable' = overallTrend > 0 ? 'up' : 'down';
        onTrendChange?.(trend, overallTrend);
      }
    }, realTimeInterval);

    return () => clearInterval(interval);
  }, [
    enableRealTime,
    realTimeInterval,
    currentData,
    lastAnnouncement,
    announcementThrottle,
    onTrendChange,
    title,
  ]);

  // Generate accessible chart description
  const generateChartDescription = useCallback(() => {
    const totalPoints = currentData.length;
    const avgValue = currentData.reduce((sum, point) => sum + point.y, 0) / totalPoints;
    const maxValue = Math.max(...currentData.map((p) => p.y));
    const minValue = Math.min(...currentData.map((p) => p.y));

    return `${title} chart showing ${totalPoints} data points. Average value is ${avgValue.toFixed(1)}, ranging from ${minValue.toFixed(1)} to ${maxValue.toFixed(1)}.`;
  }, [currentData, title]);

  // Handle data point interaction
  const handleDataPointClick = useCallback(
    (point: AccessibleDataPoint, index: number) => {
      if (announcerRef.current) {
        const announcement =
          point.announcement ||
          `${point.label || `Data point ${index + 1}`} has value ${point.y.toFixed(1)}`;
        announcerRef.current.announce(announcement, 'medium');
      }

      onDataPointClick?.(point, index);
    },
    [onDataPointClick],
  );

  // Generate chart SVG (simplified for demo)
  const renderChart = useCallback(() => {
    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxY = Math.max(...currentData.map((p) => p.y));
    const minY = Math.min(...currentData.map((p) => p.y));
    const yRange = maxY - minY || 1;

    const points = currentData.map((point, index) => {
      const x = padding + (index / (currentData.length - 1)) * chartWidth;
      const y = height - padding - ((point.y - minY) / yRange) * chartHeight;
      return { x, y, point, index };
    });

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title} chart`}
        aria-describedby="chart-description"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Chart area */}
        {type === 'area' && (
          <path
            d={`M ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`}
            fill="url(#chartGradient)"
            aria-hidden="true"
          />
        )}

        {/* Chart line */}
        {type === 'line' && (
          <path
            d={`M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
            stroke="var(--primary)"
            strokeWidth="2"
            fill="none"
            aria-hidden="true"
          />
        )}

        {/* Data points */}
        {points.map(({ x, y, point, index }) => (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r="4"
              fill={
                point.threshold === 'critical'
                  ? 'var(--destructive)'
                  : point.threshold === 'warning'
                    ? 'var(--warning)'
                    : 'var(--primary)'
              }
              stroke="white"
              strokeWidth="2"
              role="button"
              tabIndex={0}
              aria-label={`${point.label || `Data point ${index + 1}`}: ${point.y.toFixed(1)}`}
              onClick={() => handleDataPointClick(point, index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDataPointClick(point, index);
                }
              }}
              className="cursor-pointer hover:r-6 transition-all"
            />

            {/* Trend indicator */}
            {point.trend && (
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                fontSize="12"
                fill={
                  point.trend === 'up'
                    ? 'var(--success)'
                    : point.trend === 'down'
                      ? 'var(--destructive)'
                      : 'var(--muted-foreground)'
                }
                aria-hidden="true"
              >
                {point.trend === 'up' ? '↗' : point.trend === 'down' ? '↘' : '→'}
              </text>
            )}
          </g>
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="var(--border)"
          strokeWidth="1"
          aria-hidden="true"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="var(--border)"
          strokeWidth="1"
          aria-hidden="true"
        />
      </svg>
    );
  }, [currentData, type, title, handleDataPointClick]);

  return (
    <div className={cn(chartVariants({ variant, size }), className)}>
      {/* Chart header with accessibility info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold" id="chart-title">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground" id="chart-description">
            {description}
          </p>
        )}

        {/* Accessibility controls */}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>Announcements: {announcementCount}</span>
          {enableRealTime && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Real-time updates active
            </span>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div
        ref={chartRef}
        className="flex justify-center items-center"
        role="region"
        aria-labelledby="chart-title"
        aria-describedby="chart-description"
      >
        {renderChart()}
      </div>

      {/* Accessibility summary */}
      <div className="mt-4 p-3 bg-muted/20 rounded text-sm">
        <h4 className="font-medium mb-2">Chart Summary</h4>
        <p className="text-muted-foreground">{generateChartDescription()}</p>

        {enableAnnouncements && (
          <div className="mt-2">
            <p className="text-xs">
              Screen reader announcements are enabled. Significant changes will be announced
              automatically.
            </p>
          </div>
        )}
      </div>

      {/* Keyboard navigation instructions */}
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Use Tab to navigate data points, Enter or Space to select.</p>
      </div>
    </div>
  );
};

// Test component
export const AccessibleChartTest: React.FC = () => {
  const [testData, setTestData] = useState<AccessibleDataPoint[]>([
    { x: 1, y: 45, label: 'Jan', description: 'January sales data' },
    { x: 2, y: 52, label: 'Feb', description: 'February sales data' },
    { x: 3, y: 38, label: 'Mar', description: 'March sales data' },
    { x: 4, y: 67, label: 'Apr', description: 'April sales data' },
    { x: 5, y: 73, label: 'May', description: 'May sales data' },
    { x: 6, y: 89, label: 'Jun', description: 'June sales data' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Accessible Chart Test</h2>
        <p className="text-muted-foreground mb-4">
          This chart announces real-time changes to screen readers with intelligent throttling.
        </p>
      </div>

      <AccessibleChart
        data={testData}
        type="line"
        title="Sales Performance"
        description="Monthly sales data with real-time updates and accessibility features"
        enableRealTime={true}
        realTimeInterval={3000}
        enableAnnouncements={true}
        announcementThrottle={2000}
        onDataPointClick={(point, index) => {
          console.log('Data point clicked:', point, index);
        }}
        onTrendChange={(trend, change) => {
          console.log('Trend changed:', trend, change);
        }}
      />
    </div>
  );
};
