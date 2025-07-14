import { logger } from './logger';

/**
 * Metric types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

/**
 * Metric labels
 */
export interface MetricLabels {
  [key: string]: string | number;
}

/**
 * Metric value
 */
export interface MetricValue {
  value: number;
  timestamp: number;
  labels: MetricLabels;
}

/**
 * Metric definition
 */
export interface Metric {
  name: string;
  type: MetricType;
  description: string;
  labels: string[];
  values: MetricValue[];
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  private startTime: number = Date.now();

  /**
   * Record a counter metric
   */
  incrementCounter(name: string, value: number = 1, labels: MetricLabels = {}): void {
    this.recordMetric(name, MetricType.COUNTER, value, labels);
  }

  /**
   * Record a gauge metric
   */
  setGauge(name: string, value: number, labels: MetricLabels = {}): void {
    this.recordMetric(name, MetricType.GAUGE, value, labels);
  }

  /**
   * Record a histogram metric
   */
  recordHistogram(name: string, value: number, labels: MetricLabels = {}): void {
    this.recordMetric(name, MetricType.HISTOGRAM, value, labels);
  }

  /**
   * Record a summary metric
   */
  recordSummary(name: string, value: number, labels: MetricLabels = {}): void {
    this.recordMetric(name, MetricType.SUMMARY, value, labels);
  }

  /**
   * Record a metric
   */
  private recordMetric(name: string, type: MetricType, value: number, labels: MetricLabels): void {
    const metric = this.metrics.get(name) || {
      name,
      type,
      description: '',
      labels: Object.keys(labels),
      values: []
    };

    metric.values.push({
      value,
      timestamp: Date.now(),
      labels
    });

    // Keep only last 1000 values per metric
    if (metric.values.length > 1000) {
      metric.values = metric.values.slice(-1000);
    }

    this.metrics.set(name, metric);
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string): any {
    const metric = this.metrics.get(name);
    if (!metric || metric.values.length === 0) {
      return null;
    }

    const values = metric.values.map(v => v.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      name,
      type: metric.type,
      count: values.length,
      sum,
      average: avg,
      min,
      max,
      lastValue: values[values.length - 1],
      lastUpdate: metric.values[metric.values.length - 1].timestamp
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];
    
    for (const metric of this.metrics.values()) {
      // Add metric description
      lines.push(`# HELP ${metric.name} ${metric.description || metric.name}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      
      // Add metric values
      for (const value of metric.values.slice(-10)) { // Last 10 values
        const labelStr = Object.entries(value.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',');
        
        const labels = labelStr ? `{${labelStr}}` : '';
        lines.push(`${metric.name}${labels} ${value.value} ${value.timestamp}`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }
}

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  timestamp: number;
  details?: any;
}

/**
 * Health check function
 */
export type HealthCheckFunction = () => Promise<HealthCheckResult> | HealthCheckResult;

/**
 * Health monitoring
 */
export class HealthMonitor {
  private checks: Map<string, HealthCheckFunction> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();

  /**
   * Register a health check
   */
  registerCheck(name: string, check: HealthCheckFunction): void {
    this.checks.set(name, check);
  }

  /**
   * Run all health checks
   */
  async runChecks(): Promise<Map<string, HealthCheckResult>> {
    const promises = Array.from(this.checks.entries()).map(async ([name, check]) => {
      try {
        const result = await check();
        this.results.set(name, result);
        return [name, result] as [string, HealthCheckResult];
      } catch (error) {
        const result: HealthCheckResult = {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          details: { error: error instanceof Error ? error.stack : error }
        };
        this.results.set(name, result);
        return [name, result] as [string, HealthCheckResult];
      }
    });

    await Promise.all(promises);
    return this.results;
  }

  /**
   * Get overall health status
   */
  getOverallHealth(): HealthStatus {
    if (this.results.size === 0) {
      return HealthStatus.UNHEALTHY;
    }

    const statuses = Array.from(this.results.values()).map(r => r.status);
    
    if (statuses.some(s => s === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }
    
    if (statuses.some(s => s === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }
    
    return HealthStatus.HEALTHY;
  }

  /**
   * Get health check results
   */
  getResults(): Map<string, HealthCheckResult> {
    return new Map(this.results);
  }
}

/**
 * Application monitoring
 */
export class ApplicationMonitor {
  private performance: PerformanceMonitor;
  private health: HealthMonitor;
  private uptime: number = Date.now();

  constructor() {
    this.performance = new PerformanceMonitor();
    this.health = new HealthMonitor();
    
    // Register default health checks
    this.registerDefaultHealthChecks();
  }

  /**
   * Register default health checks
   */
  private registerDefaultHealthChecks(): void {
    // Memory usage check
    this.health.registerCheck('memory', () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

      let status = HealthStatus.HEALTHY;
      let message = 'Memory usage normal';

      if (heapUsagePercent > 90) {
        status = HealthStatus.UNHEALTHY;
        message = 'Memory usage critical';
      } else if (heapUsagePercent > 80) {
        status = HealthStatus.DEGRADED;
        message = 'Memory usage high';
      }

      return {
        status,
        message,
        timestamp: Date.now(),
        details: {
          heapUsed: `${heapUsedMB.toFixed(2)} MB`,
          heapTotal: `${heapTotalMB.toFixed(2)} MB`,
          heapUsage: `${heapUsagePercent.toFixed(2)}%`,
          rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`
        }
      };
    });

    // CPU usage check
    this.health.registerCheck('cpu', () => {
      const cpuUsage = process.cpuUsage();
      const totalCPU = cpuUsage.user + cpuUsage.system;
      
      // This is a simplified check - in production, you'd want more sophisticated CPU monitoring
      return {
        status: HealthStatus.HEALTHY,
        message: 'CPU usage normal',
        timestamp: Date.now(),
        details: {
          user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
          system: `${(cpuUsage.system / 1000).toFixed(2)} ms`,
          total: `${(totalCPU / 1000).toFixed(2)} ms`
        }
      };
    });

    // Uptime check
    this.health.registerCheck('uptime', () => {
      const uptimeMs = Date.now() - this.uptime;
      const uptimeHours = uptimeMs / (1000 * 60 * 60);
      
      return {
        status: HealthStatus.HEALTHY,
        message: 'Application running',
        timestamp: Date.now(),
        details: {
          uptime: `${uptimeHours.toFixed(2)} hours`,
          uptimeMs
        }
      };
    });
  }

  /**
   * Record API request
   */
  recordApiRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.performance.incrementCounter('api_requests_total', 1, {
      method,
      path,
      status: statusCode.toString()
    });

    this.performance.recordHistogram('api_request_duration_ms', duration, {
      method,
      path
    });

    if (statusCode >= 400) {
      this.performance.incrementCounter('api_errors_total', 1, {
        method,
        path,
        status: statusCode.toString()
      });
    }
  }

  /**
   * Record database operation
   */
  recordDatabaseOperation(operation: string, table: string, duration: number, success: boolean): void {
    this.performance.incrementCounter('database_operations_total', 1, {
      operation,
      table,
      success: success.toString()
    });

    this.performance.recordHistogram('database_operation_duration_ms', duration, {
      operation,
      table
    });

    if (!success) {
      this.performance.incrementCounter('database_errors_total', 1, {
        operation,
        table
      });
    }
  }

  /**
   * Record business event
   */
  recordBusinessEvent(event: string, tenantId?: string, userId?: string): void {
    this.performance.incrementCounter('business_events_total', 1, {
      event,
      tenantId: tenantId || 'unknown',
      userId: userId || 'unknown'
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMonitor {
    return this.performance;
  }

  /**
   * Get health monitor
   */
  getHealthMonitor(): HealthMonitor {
    return this.health;
  }

  /**
   * Get application status
   */
  async getStatus(): Promise<{
    status: HealthStatus;
    uptime: number;
    performance: any;
    health: Map<string, HealthCheckResult>;
  }> {
    await this.health.runChecks();
    
    return {
      status: this.health.getOverallHealth(),
      uptime: Date.now() - this.uptime,
      performance: {
        metrics: this.performance.getAllMetrics().length,
        requests: this.performance.getMetricStats('api_requests_total'),
        errors: this.performance.getMetricStats('api_errors_total')
      },
      health: this.health.getResults()
    };
  }

  /**
   * Get metrics endpoint data
   */
  getMetricsEndpoint(): string {
    return this.performance.getPrometheusMetrics();
  }

  /**
   * Get health endpoint data
   */
  async getHealthEndpoint(): Promise<{
    status: HealthStatus;
    timestamp: number;
    uptime: number;
    checks: Record<string, HealthCheckResult>;
  }> {
    await this.health.runChecks();
    
    return {
      status: this.health.getOverallHealth(),
      timestamp: Date.now(),
      uptime: Date.now() - this.uptime,
      checks: Object.fromEntries(this.health.getResults())
    };
  }
}

/**
 * Global monitoring instance
 */
export const monitoring = new ApplicationMonitor();

/**
 * Express middleware for request monitoring
 */
export function requestMonitoring() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Override res.end to record metrics
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      monitoring.recordApiRequest(
        req.method,
        req.path,
        res.statusCode,
        duration
      );

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Database monitoring wrapper
 */
export function monitorDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return fn()
    .then(result => {
      const duration = Date.now() - startTime;
      monitoring.recordDatabaseOperation(operation, table, duration, true);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      monitoring.recordDatabaseOperation(operation, table, duration, false);
      throw error;
    });
} 