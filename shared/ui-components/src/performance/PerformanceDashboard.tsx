/**
 * AI-BOS Performance Dashboard
 * 
 * Real-time performance monitoring with charts, metrics,
 * and optimization suggestions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Cpu, 
  Memory, 
  HardDrive, 
  Network, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock
} from 'lucide-react';

// Performance metrics types
export interface PerformanceMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    swap: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  disk: {
    read: number;
    write: number;
    iops: number;
  };
  application: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
  };
}

// Performance alert types
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

// Performance optimization suggestion
export interface OptimizationSuggestion {
  id: string;
  category: 'cpu' | 'memory' | 'network' | 'disk' | 'application';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  action: string;
  priority: number;
}

// Dashboard props
interface PerformanceDashboardProps {
  refreshInterval?: number;
  showAlerts?: boolean;
  showSuggestions?: boolean;
  maxDataPoints?: number;
  thresholds?: {
    cpu: number;
    memory: number;
    responseTime: number;
    errorRate: number;
  };
}

export function PerformanceDashboard({
  refreshInterval = 5000,
  showAlerts = true,
  showSuggestions = true,
  maxDataPoints = 100,
  thresholds = {
    cpu: 80,
    memory: 85,
    responseTime: 1000,
    errorRate: 5
  }
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data generator for demonstration
  const generateMockMetrics = useCallback((): PerformanceMetrics => {
    const now = Date.now();
    return {
      timestamp: now,
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        temperature: 45 + Math.random() * 20
      },
      memory: {
        used: 6 + Math.random() * 4,
        total: 16,
        available: 16 - (6 + Math.random() * 4),
        swap: Math.random() * 2
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 500000,
        connections: 50 + Math.random() * 100
      },
      disk: {
        read: Math.random() * 100,
        write: Math.random() * 50,
        iops: Math.random() * 1000
      },
      application: {
        responseTime: 100 + Math.random() * 500,
        throughput: 1000 + Math.random() * 2000,
        errorRate: Math.random() * 10,
        activeConnections: 100 + Math.random() * 200
      }
    };
  }, []);

  // Fetch performance metrics
  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would fetch from your monitoring API
      const newMetrics = generateMockMetrics();
      
      setMetrics(prev => {
        const updated = [...prev, newMetrics];
        return updated.slice(-maxDataPoints);
      });

      // Check for alerts
      checkAlerts(newMetrics);
      
      // Generate optimization suggestions
      generateSuggestions(newMetrics);
      
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockMetrics, maxDataPoints]);

  // Check for performance alerts
  const checkAlerts = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    
    if (metrics.cpu.usage > thresholds.cpu) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        message: `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`,
        metric: 'cpu',
        value: metrics.cpu.usage,
        threshold: thresholds.cpu,
        timestamp: Date.now(),
        resolved: false
      });
    }
    
    if (metrics.memory.used / metrics.memory.total * 100 > thresholds.memory) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        message: `High memory usage: ${((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%`,
        metric: 'memory',
        value: (metrics.memory.used / metrics.memory.total) * 100,
        threshold: thresholds.memory,
        timestamp: Date.now(),
        resolved: false
      });
    }
    
    if (metrics.application.responseTime > thresholds.responseTime) {
      newAlerts.push({
        id: `response-${Date.now()}`,
        type: 'error',
        message: `Slow response time: ${metrics.application.responseTime.toFixed(0)}ms`,
        metric: 'responseTime',
        value: metrics.application.responseTime,
        threshold: thresholds.responseTime,
        timestamp: Date.now(),
        resolved: false
      });
    }
    
    if (metrics.application.errorRate > thresholds.errorRate) {
      newAlerts.push({
        id: `error-${Date.now()}`,
        type: 'error',
        message: `High error rate: ${metrics.application.errorRate.toFixed(1)}%`,
        metric: 'errorRate',
        value: metrics.application.errorRate,
        threshold: thresholds.errorRate,
        timestamp: Date.now(),
        resolved: false
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }
  }, [thresholds]);

  // Generate optimization suggestions
  const generateSuggestions = useCallback((metrics: PerformanceMetrics) => {
    const newSuggestions: OptimizationSuggestion[] = [];
    
    // CPU suggestions
    if (metrics.cpu.usage > 70) {
      newSuggestions.push({
        id: 'cpu-optimization',
        category: 'cpu',
        title: 'Optimize CPU Usage',
        description: 'Consider implementing caching or optimizing database queries',
        impact: 'high',
        effort: 'medium',
        action: 'Review and optimize database queries',
        priority: 1
      });
    }
    
    // Memory suggestions
    if (metrics.memory.used / metrics.memory.total > 0.8) {
      newSuggestions.push({
        id: 'memory-optimization',
        category: 'memory',
        title: 'Memory Optimization',
        description: 'Consider implementing memory pooling or garbage collection optimization',
        impact: 'high',
        effort: 'high',
        action: 'Implement memory pooling',
        priority: 2
      });
    }
    
    // Response time suggestions
    if (metrics.application.responseTime > 500) {
      newSuggestions.push({
        id: 'response-optimization',
        category: 'application',
        title: 'Response Time Optimization',
        description: 'Consider implementing caching or CDN for static assets',
        impact: 'medium',
        effort: 'low',
        action: 'Implement Redis caching',
        priority: 3
      });
    }
    
    setSuggestions(newSuggestions);
  }, []);

  // Start monitoring
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval]);

  // Get current metrics
  const currentMetrics = metrics[metrics.length - 1];
  
  // Prepare chart data
  const chartData = metrics.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    cpu: m.cpu.usage,
    memory: (m.memory.used / m.memory.total) * 100,
    responseTime: m.application.responseTime,
    throughput: m.application.throughput,
    errorRate: m.application.errorRate
  }));

  // Memory usage data for pie chart
  const memoryData = currentMetrics ? [
    { name: 'Used', value: currentMetrics.memory.used, color: '#3B82F6' },
    { name: 'Available', value: currentMetrics.memory.available, color: '#10B981' },
    { name: 'Swap', value: currentMetrics.memory.swap, color: '#F59E0B' }
  ] : [];

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <Activity className="dashboard-icon" />
          Performance Dashboard
        </h2>
        <div className="dashboard-controls">
          <button 
            className="refresh-button"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="CPU Usage"
          value={`${currentMetrics?.cpu.usage.toFixed(1)}%`}
          icon={<Cpu />}
          trend={currentMetrics?.cpu.usage > 70 ? 'up' : 'down'}
          color={currentMetrics?.cpu.usage > 80 ? 'error' : 'success'}
        />
        <MetricCard
          title="Memory Usage"
          value={`${currentMetrics ? ((currentMetrics.memory.used / currentMetrics.memory.total) * 100).toFixed(1) : 0}%`}
          icon={<Memory />}
          trend={currentMetrics && (currentMetrics.memory.used / currentMetrics.memory.total) > 0.8 ? 'up' : 'down'}
          color={currentMetrics && (currentMetrics.memory.used / currentMetrics.memory.total) > 0.85 ? 'error' : 'success'}
        />
        <MetricCard
          title="Response Time"
          value={`${currentMetrics?.application.responseTime.toFixed(0)}ms`}
          icon={<Clock />}
          trend={currentMetrics?.application.responseTime > 500 ? 'up' : 'down'}
          color={currentMetrics?.application.responseTime > 1000 ? 'error' : 'success'}
        />
        <MetricCard
          title="Throughput"
          value={`${currentMetrics?.application.throughput.toFixed(0)} req/s`}
          icon={<TrendingUp />}
          trend="up"
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#10B981" name="Memory %" />
              <Line type="monotone" dataKey="responseTime" stroke="#F59E0B" name="Response Time (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Memory Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={memoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}GB`}
              >
                {memoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="alerts-section">
          <h3>
            <AlertTriangle className="alert-icon" />
            Performance Alerts
          </h3>
          <div className="alerts-list">
            <AnimatePresence>
              {alerts.slice(0, 5).map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`alert-item alert-${alert.type}`}
                >
                  <div className="alert-content">
                    <span className="alert-message">{alert.message}</span>
                    <span className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>
            <Zap className="suggestion-icon" />
            Optimization Suggestions
          </h3>
          <div className="suggestions-list">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item">
                <div className="suggestion-header">
                  <h4>{suggestion.title}</h4>
                  <div className="suggestion-meta">
                    <span className={`impact impact-${suggestion.impact}`}>
                      {suggestion.impact} impact
                    </span>
                    <span className={`effort effort-${suggestion.effort}`}>
                      {suggestion.effort} effort
                    </span>
                  </div>
                </div>
                <p className="suggestion-description">{suggestion.description}</p>
                <div className="suggestion-action">
                  <strong>Action:</strong> {suggestion.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Metric card component
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  color: 'success' | 'warning' | 'error';
}

function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
  return (
    <motion.div
      className={`metric-card metric-${color}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <div className="metric-trend">
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-value">{value}</div>
      </div>
    </motion.div>
  );
} 