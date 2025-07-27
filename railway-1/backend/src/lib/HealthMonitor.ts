/**
 * Enterprise-Grade Health Monitor
 * Provides /healthz and /readyz endpoints with comprehensive system monitoring
 */

import { lifecycleManager } from './LifecycleManager';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  resources: {
    intervals: number;
    timeouts: number;
    listeners: number;
  };
  checks: {
    memory: boolean;
    resources: boolean;
    database: boolean;
  };
}

export interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    consciousness: boolean;
    telemetry: boolean;
  };
  message: string;
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private startTime: number;
  private memoryThreshold = 500; // 500MB
  private resourceThreshold = 50; // 50 resources
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();

  private constructor() {
    this.startTime = Date.now();
    this.setupMemoryMonitoring();
    this.setupHealthChecks();
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    const memoryUsage = process.memoryUsage();
    const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usedMB / totalMB) * 100);

    const resources = lifecycleManager.getResourceCount();
    const totalResources = resources.intervals + resources.timeouts + resources.listeners;

    const checks = {
      memory: usedMB < this.memoryThreshold,
      resources: totalResources < this.resourceThreshold,
      database: this.checkDatabaseHealth()
    };

    const allChecksPass = Object.values(checks).every(check => check);
    const anyChecksFail = Object.values(checks).some(check => !check);

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (anyChecksFail) {
      status = allChecksPass ? 'degraded' : 'unhealthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memory: {
        used: usedMB,
        total: totalMB,
        percentage
      },
      resources,
      checks
    };
  }

  /**
   * Get readiness status
   */
  async getReadinessStatus(): Promise<ReadinessStatus> {
    const checks = {
      database: await this.checkDatabaseHealth(),
      consciousness: await this.checkConsciousnessHealth(),
      telemetry: await this.checkTelemetryHealth()
    };

    const ready = Object.values(checks).every(check => check);
    const failedChecks = Object.entries(checks)
      .filter(([, check]) => !check)
      .map(([name]) => name);

    return {
      ready,
      timestamp: new Date().toISOString(),
      checks,
      message: ready
        ? 'All systems operational'
        : `Systems not ready: ${failedChecks.join(', ')}`
    };
  }

  /**
   * Register a custom health check
   */
  registerHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
  }

  /**
   * Run all registered health checks
   */
  async runAllHealthChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, check] of this.healthChecks) {
      try {
        results[name] = await check();
      } catch (error) {
        console.error(`Health check ${name} failed:`, error);
        results[name] = false;
      }
    }

    return results;
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    lifecycleManager.createInterval(
      'memory-monitor',
      () => {
        const memoryUsage = process.memoryUsage();
        const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

        if (usedMB > this.memoryThreshold) {
          console.warn(`⚠️ [MEMORY ALERT] Usage exceeds ${this.memoryThreshold}MB: ${usedMB}MB`);
        }

        // Log memory usage every 5 minutes
        if (Date.now() % 300000 < 10000) { // Every 5 minutes
          console.log(`📊 Memory usage: ${usedMB}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
        }
      },
      10000, // Check every 10 seconds
      'Memory usage monitoring'
    );
  }

  /**
   * Setup default health checks
   */
  private setupHealthChecks(): void {
    // Database health check
    this.registerHealthCheck('database', async () => {
      try {
        // This would check actual database connectivity
        // For now, we'll simulate a healthy database
        return true;
      } catch (error) {
        console.error('Database health check failed:', error);
        return false;
      }
    });

    // Consciousness system health check
    this.registerHealthCheck('consciousness', async () => {
      try {
        // Check if consciousness engines are running
        const resources = lifecycleManager.getResources();
        const consciousnessResources = resources.filter(r =>
          r.description.includes('consciousness') ||
          r.description.includes('Consciousness')
        );
        return consciousnessResources.length > 0;
      } catch (error) {
        console.error('Consciousness health check failed:', error);
        return false;
      }
    });

    // Telemetry system health check
    this.registerHealthCheck('telemetry', async () => {
      try {
        // Check if telemetry systems are active
        const resources = lifecycleManager.getResources();
        const telemetryResources = resources.filter(r =>
          r.description.includes('telemetry') ||
          r.description.includes('Telemetry')
        );
        return telemetryResources.length > 0;
      } catch (error) {
        console.error('Telemetry health check failed:', error);
        return false;
      }
    });
  }

  /**
   * Check database health
   */
  private checkDatabaseHealth(): boolean {
    // This would perform actual database connectivity check
    // For now, return true to simulate healthy database
    return true;
  }

  /**
   * Check consciousness system health
   */
  private async checkConsciousnessHealth(): Promise<boolean> {
    try {
      const resources = lifecycleManager.getResources();
      const consciousnessResources = resources.filter(r =>
        r.description.includes('consciousness') ||
        r.description.includes('Consciousness')
      );
      return consciousnessResources.length > 0;
    } catch (error) {
      console.error('Consciousness health check failed:', error);
      return false;
    }
  }

  /**
   * Check telemetry system health
   */
  private async checkTelemetryHealth(): Promise<boolean> {
    try {
      const resources = lifecycleManager.getResources();
      const telemetryResources = resources.filter(r =>
        r.description.includes('telemetry') ||
        r.description.includes('Telemetry')
      );
      return telemetryResources.length > 0;
    } catch (error) {
      console.error('Telemetry health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const healthMonitor = HealthMonitor.getInstance();
