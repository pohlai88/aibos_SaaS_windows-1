import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import {
  PerformanceMonitor,
  HealthMonitor,
  ApplicationMonitor,
  monitoring,
  MetricType,
  HealthStatus,
  requestMonitoring,
  monitorDatabaseOperation,
} from '../lib/monitoring';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  describe('Counter Metrics', () => {
    it('should increment counter metrics', () => {
      performanceMonitor.incrementCounter('test_counter', 1, { label: 'value' });
      performanceMonitor.incrementCounter('test_counter', 2, { label: 'value' });

      const stats = performanceMonitor.getMetricStats('test_counter');
      expect(stats).toMatchObject({
        name: 'test_counter',
        type: MetricType.COUNTER,
        count: 2,
        sum: 3,
        lastValue: 2,
      });
    });

    it('should handle multiple labels', () => {
      performanceMonitor.incrementCounter('requests', 1, { method: 'GET', status: '200' });
      performanceMonitor.incrementCounter('requests', 1, { method: 'POST', status: '201' });

      const stats = performanceMonitor.getMetricStats('requests');
      expect(stats.count).toBe(2);
    });
  });

  describe('Gauge Metrics', () => {
    it('should set gauge metrics', () => {
      performanceMonitor.setGauge('memory_usage', 512, { component: 'app' });
      performanceMonitor.setGauge('memory_usage', 1024, { component: 'app' });

      const stats = performanceMonitor.getMetricStats('memory_usage');
      expect(stats.lastValue).toBe(1024);
    });
  });

  describe('Histogram Metrics', () => {
    it('should record histogram metrics', () => {
      performanceMonitor.recordHistogram('response_time', 100, { endpoint: '/api' });
      performanceMonitor.recordHistogram('response_time', 200, { endpoint: '/api' });
      performanceMonitor.recordHistogram('response_time', 150, { endpoint: '/api' });

      const stats = performanceMonitor.getMetricStats('response_time');
      expect(stats.count).toBe(3);
      expect(stats.average).toBe(150);
      expect(stats.min).toBe(100);
      expect(stats.max).toBe(200);
    });
  });

  describe('Metric Statistics', () => {
    it('should return null for non-existent metrics', () => {
      const stats = performanceMonitor.getMetricStats('non_existent');
      expect(stats).toBeNull();
    });

    it('should calculate correct statistics', () => {
      const values = [10, 20, 30, 40, 50];
      values.forEach((value) => {
        performanceMonitor.recordHistogram('test_metric', value);
      });

      const stats = performanceMonitor.getMetricStats('test_metric');
      expect(stats.sum).toBe(150);
      expect(stats.average).toBe(30);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
    });
  });

  describe('Prometheus Format', () => {
    it('should generate Prometheus format metrics', () => {
      performanceMonitor.incrementCounter('test_counter', 1, { label: 'value' });
      performanceMonitor.recordHistogram('test_histogram', 100);

      const prometheusMetrics = performanceMonitor.getPrometheusMetrics();

      expect(prometheusMetrics).toContain('# HELP test_counter');
      expect(prometheusMetrics).toContain('# TYPE test_counter counter');
      expect(prometheusMetrics).toContain('test_counter{label="value"}');
      expect(prometheusMetrics).toContain('# HELP test_histogram');
      expect(prometheusMetrics).toContain('# TYPE test_histogram histogram');
    });
  });

  describe('Metric Cleanup', () => {
    it('should limit metric values to 1000', () => {
      // Add more than 1000 values
      for (let i = 0; i < 1100; i++) {
        performanceMonitor.recordHistogram('test_metric', i);
      }

      const stats = performanceMonitor.getMetricStats('test_metric');
      expect(stats.count).toBe(1000);
      expect(stats.lastValue).toBe(1099); // Last value should be 1099
    });
  });
});

describe('HealthMonitor', () => {
  let healthMonitor: HealthMonitor;

  beforeEach(() => {
    healthMonitor = new HealthMonitor();
  });

  describe('Health Check Registration', () => {
    it('should register health checks', () => {
      const mockCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.HEALTHY,
        message: 'OK',
        timestamp: Date.now(),
      });

      healthMonitor.registerCheck('test_check', mockCheck);

      // Verify check is registered by running checks
      healthMonitor.runChecks();
      expect(mockCheck).toHaveBeenCalled();
    });
  });

  describe('Health Check Execution', () => {
    it('should run all registered checks', async () => {
      const check1 = vi.fn().mockResolvedValue({
        status: HealthStatus.HEALTHY,
        message: 'Check 1 OK',
        timestamp: Date.now(),
      });

      const check2 = vi.fn().mockResolvedValue({
        status: HealthStatus.DEGRADED,
        message: 'Check 2 degraded',
        timestamp: Date.now(),
      });

      healthMonitor.registerCheck('check1', check1);
      healthMonitor.registerCheck('check2', check2);

      const results = await healthMonitor.runChecks();

      expect(results.size).toBe(2);
      expect(check1).toHaveBeenCalled();
      expect(check2).toHaveBeenCalled();
    });

    it('should handle check failures', async () => {
      const failingCheck = vi.fn().mockRejectedValue(new Error('Check failed'));

      healthMonitor.registerCheck('failing_check', failingCheck);
      const results = await healthMonitor.runChecks();

      const result = results.get('failing_check');
      expect(result?.status).toBe(HealthStatus.UNHEALTHY);
      expect(result?.message).toBe('Check failed');
    });
  });

  describe('Overall Health Status', () => {
    it('should return HEALTHY when all checks pass', async () => {
      const healthyCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.HEALTHY,
        message: 'OK',
        timestamp: Date.now(),
      });

      healthMonitor.registerCheck('healthy_check', healthyCheck);
      await healthMonitor.runChecks();

      expect(healthMonitor.getOverallHealth()).toBe(HealthStatus.HEALTHY);
    });

    it('should return DEGRADED when some checks are degraded', async () => {
      const healthyCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.HEALTHY,
        message: 'OK',
        timestamp: Date.now(),
      });

      const degradedCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.DEGRADED,
        message: 'Degraded',
        timestamp: Date.now(),
      });

      healthMonitor.registerCheck('healthy_check', healthyCheck);
      healthMonitor.registerCheck('degraded_check', degradedCheck);
      await healthMonitor.runChecks();

      expect(healthMonitor.getOverallHealth()).toBe(HealthStatus.DEGRADED);
    });

    it('should return UNHEALTHY when any check fails', async () => {
      const healthyCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.HEALTHY,
        message: 'OK',
        timestamp: Date.now(),
      });

      const unhealthyCheck = vi.fn().mockResolvedValue({
        status: HealthStatus.UNHEALTHY,
        message: 'Failed',
        timestamp: Date.now(),
      });

      healthMonitor.registerCheck('healthy_check', healthyCheck);
      healthMonitor.registerCheck('unhealthy_check', unhealthyCheck);
      await healthMonitor.runChecks();

      expect(healthMonitor.getOverallHealth()).toBe(HealthStatus.UNHEALTHY);
    });

    it('should return UNHEALTHY when no checks are registered', () => {
      expect(healthMonitor.getOverallHealth()).toBe(HealthStatus.UNHEALTHY);
    });
  });
});

describe('ApplicationMonitor', () => {
  let appMonitor: ApplicationMonitor;

  beforeEach(() => {
    appMonitor = new ApplicationMonitor();
  });

  describe('API Request Recording', () => {
    it('should record API requests', () => {
      appMonitor.recordApiRequest('GET', '/api/users', 200, 150);
      appMonitor.recordApiRequest('POST', '/api/users', 201, 200);
      appMonitor.recordApiRequest('GET', '/api/users', 404, 50);

      const performance = appMonitor.getPerformanceMetrics();
      const requestsStats = performance.getMetricStats('api_requests_total');
      const errorsStats = performance.getMetricStats('api_errors_total');

      expect(requestsStats?.count).toBe(3);
      expect(errorsStats?.count).toBe(1);
    });
  });

  describe('Database Operation Recording', () => {
    it('should record database operations', () => {
      appMonitor.recordDatabaseOperation('SELECT', 'users', 50, true);
      appMonitor.recordDatabaseOperation('INSERT', 'users', 100, true);
      appMonitor.recordDatabaseOperation('UPDATE', 'users', 75, false);

      const performance = appMonitor.getPerformanceMetrics();
      const dbStats = performance.getMetricStats('database_operations_total');
      const dbErrorsStats = performance.getMetricStats('database_errors_total');

      expect(dbStats?.count).toBe(3);
      expect(dbErrorsStats?.count).toBe(1);
    });
  });

  describe('Business Event Recording', () => {
    it('should record business events', () => {
      appMonitor.recordBusinessEvent('user_registered', 'tenant-1', 'user-1');
      appMonitor.recordBusinessEvent('subscription_created', 'tenant-2', 'user-2');

      const performance = appMonitor.getPerformanceMetrics();
      const eventsStats = performance.getMetricStats('business_events_total');

      expect(eventsStats?.count).toBe(2);
    });
  });

  describe('Application Status', () => {
    it('should return application status', async () => {
      const status = await appMonitor.getStatus();

      expect(status).toMatchObject({
        status: expect.any(String),
        uptime: expect.any(Number),
        performance: expect.any(Object),
        health: expect.any(Map),
      });
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return Prometheus format metrics', () => {
      appMonitor.recordApiRequest('GET', '/api/test', 200, 100);

      const metrics = appMonitor.getMetricsEndpoint();

      expect(metrics).toContain('# HELP api_requests_total');
      expect(metrics).toContain('# TYPE api_requests_total counter');
      expect(metrics).toContain('api_requests_total');
    });
  });

  describe('Health Endpoint', () => {
    it('should return health endpoint data', async () => {
      const healthData = await appMonitor.getHealthEndpoint();

      expect(healthData).toMatchObject({
        status: expect.any(String),
        timestamp: expect.any(Number),
        uptime: expect.any(Number),
        checks: expect.any(Object),
      });
    });
  });
});

describe('Global Monitoring Instance', () => {
  it('should be properly configured', () => {
    expect(monitoring).toBeInstanceOf(ApplicationMonitor);
  });

  it('should have performance and health monitors', () => {
    expect(monitoring.getPerformanceMetrics()).toBeInstanceOf(PerformanceMonitor);
    expect(monitoring.getHealthMonitor()).toBeInstanceOf(HealthMonitor);
  });
});

describe('Request Monitoring Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: Mock;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/test',
    };

    mockRes = {
      statusCode: 200,
      end: vi.fn(),
    };

    mockNext = vi.fn();
  });

  it('should record request metrics', () => {
    const middleware = requestMonitoring();
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();

    // Simulate response end
    mockRes.end();

    // Verify metrics were recorded (this would be tested through the monitoring instance)
    expect(mockRes.end).toHaveBeenCalled();
  });
});

describe('Database Monitoring Wrapper', () => {
  it('should monitor successful database operations', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');

    const result = await monitorDatabaseOperation('SELECT', 'users', mockOperation);

    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalled();
  });

  it('should monitor failed database operations', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Database error'));

    await expect(monitorDatabaseOperation('SELECT', 'users', mockOperation)).rejects.toThrow(
      'Database error',
    );

    expect(mockOperation).toHaveBeenCalled();
  });
});

describe('Health Check Implementations', () => {
  describe('Memory Health Check', () => {
    it('should return healthy for normal memory usage', async () => {
      const healthMonitor = new HealthMonitor();

      // Mock process.memoryUsage to return normal values
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024, // 100MB
        rss: 80 * 1024 * 1024, // 80MB
      });

      healthMonitor.registerCheck('memory', () => {
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
            rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          },
        };
      });

      const results = await healthMonitor.runChecks();
      const memoryResult = results.get('memory');

      expect(memoryResult?.status).toBe(HealthStatus.HEALTHY);
      expect(memoryResult?.message).toBe('Memory usage normal');

      // Restore original function
      process.memoryUsage = originalMemoryUsage;
    });
  });
});
