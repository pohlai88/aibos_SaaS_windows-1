import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';

export interface ResourceLimits {
  cpu: {
    maxUsage: number; // Percentage (0-100)
    burstLimit: number; // Percentage for short bursts
    throttleThreshold: number; // Percentage to start throttling
  };
  memory: {
    maxUsage: number; // MB
    softLimit: number; // MB
    hardLimit: number; // MB
  };
  api: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
  };
  database: {
    maxConnections: number;
    maxQueryTime: number; // seconds
    maxResultSize: number; // MB
  };
  storage: {
    maxDiskUsage: number; // MB
    maxFileSize: number; // MB
    maxFiles: number;
  };
}

export interface ModulePerformance {
  moduleId: string;
  tenantId: string;
  version: string;
  timestamp: string;
  metrics: {
    cpu: {
      usage: number; // Percentage
      load: number; // System load
      throttled: boolean;
    };
    memory: {
      used: number; // MB
      peak: number; // MB
      limit: number; // MB
      exceeded: boolean;
    };
    api: {
      requestsPerSecond: number;
      requestsPerMinute: number;
      requestsPerHour: number;
      throttled: boolean;
      responseTime: number; // ms
    };
    database: {
      connections: number;
      activeQueries: number;
      slowQueries: number;
      throttled: boolean;
    };
    storage: {
      used: number; // MB
      files: number;
      exceeded: boolean;
    };
  };
  violations: PerformanceViolation[];
  status: 'normal' | 'warning' | 'critical' | 'throttled' | 'suspended';
}

export interface PerformanceViolation {
  id: string;
  type: 'cpu' | 'memory' | 'api' | 'database' | 'storage';
  severity: 'warning' | 'critical' | 'blocking';
  message: string;
  timestamp: string;
  value: number;
  limit: number;
  action: 'throttled' | 'suspended' | 'alerted' | 'none';
}

export interface ThrottleRule {
  id: string;
  moduleId: string;
  tenantId?: string; // null for global rules
  type: 'cpu' | 'memory' | 'api' | 'database' | 'storage';
  condition: 'exceeds' | 'below' | 'equals';
  threshold: number;
  action: 'throttle' | 'suspend' | 'alert' | 'restart';
  duration: number; // seconds
  cooldown: number; // seconds
  enabled: boolean;
}

export interface SandboxConfig {
  id: string;
  moduleId: string;
  tenantId: string;
  version: string;
  isolationLevel: 'light' | 'medium' | 'strict' | 'custom';
  resourceLimits: ResourceLimits;
  throttleRules: ThrottleRule[];
  monitoring: {
    enabled: boolean;
    interval: number; // seconds
    alertThreshold: number; // percentage
  };
  autoScaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceAlert {
  id: string;
  moduleId: string;
  tenantId: string;
  type: 'warning' | 'critical' | 'blocking';
  message: string;
  metrics: any;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export class PerformanceIsolationService extends EventEmitter {
  private redis: Redis;
  private supabase: any;
  private readonly METRICS_CACHE_TTL = 300; // 5 minutes
  private readonly THROTTLE_CACHE_TTL = 60; // 1 minute
  private workers: Map<string, Worker> = new Map();
  private sandboxes: Map<string, SandboxConfig> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(redisUrl: string, supabaseUrl: string, supabaseKey: string) {
    super();
    this.redis = new Redis(redisUrl);
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a sandbox for a module instance
   */
  async createSandbox(
    moduleId: string,
    tenantId: string,
    version: string,
    isolationLevel: 'light' | 'medium' | 'strict' | 'custom' = 'medium',
    customLimits?: Partial<ResourceLimits>
  ): Promise<string> {
    const sandboxId = `sandbox_${moduleId}_${tenantId}_${version}`;
    
    // Get default limits based on isolation level
    const defaultLimits = this.getDefaultLimits(isolationLevel);
    const resourceLimits = { ...defaultLimits, ...customLimits };
    
    // Get default throttle rules
    const throttleRules = this.getDefaultThrottleRules(moduleId, tenantId);
    
    const sandbox: SandboxConfig = {
      id: sandboxId,
      moduleId,
      tenantId,
      version,
      isolationLevel,
      resourceLimits,
      throttleRules,
      monitoring: {
        enabled: true,
        interval: 30,
        alertThreshold: 80
      },
      autoScaling: {
        enabled: false,
        minInstances: 1,
        maxInstances: 3,
        scaleUpThreshold: 70,
        scaleDownThreshold: 30
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { error } = await this.supabase
      .from('module_sandboxes')
      .insert(sandbox);

    if (error) throw error;

    // Store in memory for quick access
    this.sandboxes.set(sandboxId, sandbox);

    // Start monitoring
    await this.startMonitoring(sandboxId);

    // Create worker thread for isolation
    await this.createIsolatedWorker(sandboxId, moduleId, tenantId, version);

    return sandboxId;
  }

  /**
   * Get current performance metrics for a module
   */
  async getPerformanceMetrics(
    moduleId: string,
    tenantId: string,
    version: string
  ): Promise<ModulePerformance | null> {
    const sandboxId = `sandbox_${moduleId}_${tenantId}_${version}`;
    
    // Try cache first
    const cached = await this.redis.get(`performance_metrics:${sandboxId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get real-time metrics
    const metrics = await this.collectPerformanceMetrics(sandboxId);
    
    // Check for violations
    const violations = await this.checkViolations(sandboxId, metrics);
    
    // Determine status
    const status = this.determineStatus(metrics, violations);
    
    const performance: ModulePerformance = {
      moduleId,
      tenantId,
      version,
      timestamp: new Date().toISOString(),
      metrics,
      violations,
      status
    };

    // Cache the metrics
    await this.redis.setex(
      `performance_metrics:${sandboxId}`,
      this.METRICS_CACHE_TTL,
      JSON.stringify(performance)
    );

    return performance;
  }

  /**
   * Apply throttling to a module
   */
  async applyThrottling(
    moduleId: string,
    tenantId: string,
    version: string,
    type: 'cpu' | 'memory' | 'api' | 'database' | 'storage',
    level: 'light' | 'medium' | 'strict'
  ): Promise<void> {
    const sandboxId = `sandbox_${moduleId}_${tenantId}_${version}`;
    const throttleKey = `throttle:${sandboxId}:${type}`;
    
    const throttleConfig = this.getThrottleConfig(level);
    
    // Set throttle in Redis
    await this.redis.setex(
      throttleKey,
      throttleConfig.duration,
      JSON.stringify(throttleConfig)
    );

    // Apply throttling based on type
    switch (type) {
      case 'cpu':
        await this.throttleCPU(sandboxId, throttleConfig);
        break;
      case 'api':
        await this.throttleAPI(sandboxId, throttleConfig);
        break;
      case 'database':
        await this.throttleDatabase(sandboxId, throttleConfig);
        break;
      case 'memory':
        await this.throttleMemory(sandboxId, throttleConfig);
        break;
      case 'storage':
        await this.throttleStorage(sandboxId, throttleConfig);
        break;
    }

    // Emit throttling event
    this.emit('throttled', {
      sandboxId,
      moduleId,
      tenantId,
      type,
      level,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Suspend a module due to performance issues
   */
  async suspendModule(
    moduleId: string,
    tenantId: string,
    version: string,
    reason: string
  ): Promise<void> {
    const sandboxId = `sandbox_${moduleId}_${tenantId}_${version}`;
    
    // Stop the worker
    const worker = this.workers.get(sandboxId);
    if (worker) {
      worker.terminate();
      this.workers.delete(sandboxId);
    }

    // Stop monitoring
    await this.stopMonitoring(sandboxId);

    // Update sandbox status
    await this.updateSandboxStatus(sandboxId, 'suspended', reason);

    // Create alert
    await this.createPerformanceAlert(
      moduleId,
      tenantId,
      'blocking',
      `Module suspended: ${reason}`
    );

    // Emit suspension event
    this.emit('suspended', {
      sandboxId,
      moduleId,
      tenantId,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Resume a suspended module
   */
  async resumeModule(
    moduleId: string,
    tenantId: string,
    version: string
  ): Promise<void> {
    const sandboxId = `sandbox_${moduleId}_${tenantId}_${version}`;
    
    // Recreate worker
    await this.createIsolatedWorker(sandboxId, moduleId, tenantId, version);

    // Restart monitoring
    await this.startMonitoring(sandboxId);

    // Update sandbox status
    await this.updateSandboxStatus(sandboxId, 'active', 'Module resumed');

    // Emit resume event
    this.emit('resumed', {
      sandboxId,
      moduleId,
      tenantId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update resource limits for a sandbox
   */
  async updateResourceLimits(
    moduleId: string,
    tenantId: string,
    version: string,
    limits: Partial<ResourceLimits>
  ): Promise<void> {
    const sandboxId = `sandbox_${moduleId}_${tenantId}_${version}`;
    
    const { error } = await this.supabase
      .from('module_sandboxes')
      .update({
        resource_limits: limits,
        updated_at: new Date().toISOString()
      })
      .eq('id', sandboxId);

    if (error) throw error;

    // Update in-memory cache
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      sandbox.resourceLimits = { ...sandbox.resourceLimits, ...limits };
      sandbox.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Add a throttle rule
   */
  async addThrottleRule(rule: Omit<ThrottleRule, 'id'>): Promise<string> {
    const ruleId = `rule_${rule.moduleId}_${rule.type}_${Date.now()}`;
    
    const { error } = await this.supabase
      .from('throttle_rules')
      .insert({
        id: ruleId,
        ...rule
      });

    if (error) throw error;

    return ruleId;
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(
    moduleId?: string,
    tenantId?: string,
    status?: 'active' | 'acknowledged' | 'resolved'
  ): Promise<PerformanceAlert[]> {
    let query = this.supabase
      .from('performance_alerts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (moduleId) query = query.eq('module_id', moduleId);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Acknowledge a performance alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    const { error } = await this.supabase
      .from('performance_alerts')
      .update({
        acknowledged: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  /**
   * Get sandbox statistics
   */
  async getSandboxStatistics(): Promise<{
    total: number;
    active: number;
    suspended: number;
    throttled: number;
    averageCPU: number;
    averageMemory: number;
  }> {
    const { data, error } = await this.supabase
      .from('module_sandboxes')
      .select('*');

    if (error) throw error;

    const sandboxes = data || [];
    const total = sandboxes.length;
    const active = sandboxes.filter(s => s.status === 'active').length;
    const suspended = sandboxes.filter(s => s.status === 'suspended').length;
    const throttled = sandboxes.filter(s => s.status === 'throttled').length;

    // Calculate averages (this would be more sophisticated in practice)
    const averageCPU = 0; // Would calculate from metrics
    const averageMemory = 0; // Would calculate from metrics

    return {
      total,
      active,
      suspended,
      throttled,
      averageCPU,
      averageMemory
    };
  }

  // Private helper methods

  private getDefaultLimits(isolationLevel: string): ResourceLimits {
    switch (isolationLevel) {
      case 'light':
        return {
          cpu: { maxUsage: 50, burstLimit: 80, throttleThreshold: 40 },
          memory: { maxUsage: 512, softLimit: 256, hardLimit: 1024 },
          api: { requestsPerSecond: 100, requestsPerMinute: 5000, requestsPerHour: 100000, burstLimit: 200 },
          database: { maxConnections: 10, maxQueryTime: 30, maxResultSize: 100 },
          storage: { maxDiskUsage: 1024, maxFileSize: 50, maxFiles: 1000 }
        };
      case 'medium':
        return {
          cpu: { maxUsage: 30, burstLimit: 60, throttleThreshold: 25 },
          memory: { maxUsage: 256, softLimit: 128, hardLimit: 512 },
          api: { requestsPerSecond: 50, requestsPerMinute: 2500, requestsPerHour: 50000, burstLimit: 100 },
          database: { maxConnections: 5, maxQueryTime: 15, maxResultSize: 50 },
          storage: { maxDiskUsage: 512, maxFileSize: 25, maxFiles: 500 }
        };
      case 'strict':
        return {
          cpu: { maxUsage: 15, burstLimit: 30, throttleThreshold: 12 },
          memory: { maxUsage: 128, softLimit: 64, hardLimit: 256 },
          api: { requestsPerSecond: 20, requestsPerMinute: 1000, requestsPerHour: 20000, burstLimit: 40 },
          database: { maxConnections: 2, maxQueryTime: 10, maxResultSize: 25 },
          storage: { maxDiskUsage: 256, maxFileSize: 10, maxFiles: 250 }
        };
      default:
        return this.getDefaultLimits('medium');
    }
  }

  private getDefaultThrottleRules(moduleId: string, tenantId: string): ThrottleRule[] {
    return [
      {
        id: `rule_${moduleId}_cpu_1`,
        moduleId,
        tenantId,
        type: 'cpu',
        condition: 'exceeds',
        threshold: 80,
        action: 'throttle',
        duration: 300,
        cooldown: 60,
        enabled: true
      },
      {
        id: `rule_${moduleId}_memory_1`,
        moduleId,
        tenantId,
        type: 'memory',
        condition: 'exceeds',
        threshold: 90,
        action: 'suspend',
        duration: 60,
        cooldown: 300,
        enabled: true
      },
      {
        id: `rule_${moduleId}_api_1`,
        moduleId,
        tenantId,
        type: 'api',
        condition: 'exceeds',
        threshold: 100,
        action: 'throttle',
        duration: 60,
        cooldown: 30,
        enabled: true
      }
    ];
  }

  private getThrottleConfig(level: string): any {
    switch (level) {
      case 'light':
        return { duration: 60, rate: 0.8 };
      case 'medium':
        return { duration: 300, rate: 0.5 };
      case 'strict':
        return { duration: 600, rate: 0.2 };
      default:
        return { duration: 300, rate: 0.5 };
    }
  }

  private async startMonitoring(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.monitoring.enabled) return;

    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectPerformanceMetrics(sandboxId);
        const violations = await this.checkViolations(sandboxId, metrics);
        
        // Apply throttle rules
        for (const rule of sandbox.throttleRules) {
          if (rule.enabled && this.shouldApplyRule(rule, metrics)) {
            await this.applyThrottling(
              sandbox.moduleId,
              sandbox.tenantId,
              sandbox.version,
              rule.type,
              'medium'
            );
          }
        }

        // Check for critical violations
        const criticalViolations = violations.filter(v => v.severity === 'critical');
        if (criticalViolations.length > 0) {
          await this.suspendModule(
            sandbox.moduleId,
            sandbox.tenantId,
            sandbox.version,
            `Critical performance violation: ${criticalViolations[0].message}`
          );
        }

      } catch (error) {
        console.error(`Monitoring error for ${sandboxId}:`, error);
      }
    }, sandbox.monitoring.interval * 1000);

    this.monitoringIntervals.set(sandboxId, interval);
  }

  private async stopMonitoring(sandboxId: string): Promise<void> {
    const interval = this.monitoringIntervals.get(sandboxId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(sandboxId);
    }
  }

  private async createIsolatedWorker(
    sandboxId: string,
    moduleId: string,
    tenantId: string,
    version: string
  ): Promise<void> {
    // Create worker thread for isolation
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      
      // Set resource limits
      process.setMaxListeners(0);
      
      // Handle messages from main thread
      parentPort.on('message', (message) => {
        // Process module requests here
        parentPort.postMessage({ type: 'response', data: 'processed' });
      });
    `, { eval: true });

    this.workers.set(sandboxId, worker);
  }

  private async collectPerformanceMetrics(sandboxId: string): Promise<any> {
    // This would collect real metrics from the system
    // For now, return mock data
    return {
      cpu: {
        usage: Math.random() * 100,
        load: Math.random() * 10,
        throttled: false
      },
      memory: {
        used: Math.random() * 512,
        peak: Math.random() * 1024,
        limit: 512,
        exceeded: false
      },
      api: {
        requestsPerSecond: Math.random() * 100,
        requestsPerMinute: Math.random() * 5000,
        requestsPerHour: Math.random() * 100000,
        throttled: false,
        responseTime: Math.random() * 1000
      },
      database: {
        connections: Math.random() * 10,
        activeQueries: Math.random() * 5,
        slowQueries: Math.random() * 2,
        throttled: false
      },
      storage: {
        used: Math.random() * 1024,
        files: Math.random() * 1000,
        exceeded: false
      }
    };
  }

  private async checkViolations(sandboxId: string, metrics: any): Promise<PerformanceViolation[]> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) return [];

    const violations: PerformanceViolation[] = [];

    // Check CPU violations
    if (metrics.cpu.usage > sandbox.resourceLimits.cpu.maxUsage) {
      violations.push({
        id: `violation_${sandboxId}_cpu_${Date.now()}`,
        type: 'cpu',
        severity: metrics.cpu.usage > 90 ? 'critical' : 'warning',
        message: `CPU usage ${metrics.cpu.usage.toFixed(1)}% exceeds limit ${sandbox.resourceLimits.cpu.maxUsage}%`,
        timestamp: new Date().toISOString(),
        value: metrics.cpu.usage,
        limit: sandbox.resourceLimits.cpu.maxUsage,
        action: metrics.cpu.usage > 90 ? 'suspended' : 'throttled'
      });
    }

    // Check memory violations
    if (metrics.memory.used > sandbox.resourceLimits.memory.maxUsage) {
      violations.push({
        id: `violation_${sandboxId}_memory_${Date.now()}`,
        type: 'memory',
        severity: 'critical',
        message: `Memory usage ${metrics.memory.used.toFixed(1)}MB exceeds limit ${sandbox.resourceLimits.memory.maxUsage}MB`,
        timestamp: new Date().toISOString(),
        value: metrics.memory.used,
        limit: sandbox.resourceLimits.memory.maxUsage,
        action: 'suspended'
      });
    }

    // Check API violations
    if (metrics.api.requestsPerSecond > sandbox.resourceLimits.api.requestsPerSecond) {
      violations.push({
        id: `violation_${sandboxId}_api_${Date.now()}`,
        type: 'api',
        severity: 'warning',
        message: `API requests ${metrics.api.requestsPerSecond}/s exceeds limit ${sandbox.resourceLimits.api.requestsPerSecond}/s`,
        timestamp: new Date().toISOString(),
        value: metrics.api.requestsPerSecond,
        limit: sandbox.resourceLimits.api.requestsPerSecond,
        action: 'throttled'
      });
    }

    return violations;
  }

  private determineStatus(metrics: any, violations: PerformanceViolation[]): string {
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const warningViolations = violations.filter(v => v.severity === 'warning');

    if (criticalViolations.length > 0) return 'critical';
    if (warningViolations.length > 0) return 'warning';
    if (metrics.cpu.throttled || metrics.api.throttled) return 'throttled';
    return 'normal';
  }

  private shouldApplyRule(rule: ThrottleRule, metrics: any): boolean {
    const value = this.getMetricValue(rule.type, metrics);
    
    switch (rule.condition) {
      case 'exceeds':
        return value > rule.threshold;
      case 'below':
        return value < rule.threshold;
      case 'equals':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  private getMetricValue(type: string, metrics: any): number {
    switch (type) {
      case 'cpu':
        return metrics.cpu.usage;
      case 'memory':
        return metrics.memory.used;
      case 'api':
        return metrics.api.requestsPerSecond;
      case 'database':
        return metrics.database.connections;
      case 'storage':
        return metrics.storage.used;
      default:
        return 0;
    }
  }

  private async throttleCPU(sandboxId: string, config: any): Promise<void> {
    // Implementation for CPU throttling
  }

  private async throttleAPI(sandboxId: string, config: any): Promise<void> {
    // Implementation for API throttling
  }

  private async throttleDatabase(sandboxId: string, config: any): Promise<void> {
    // Implementation for database throttling
  }

  private async throttleMemory(sandboxId: string, config: any): Promise<void> {
    // Implementation for memory throttling
  }

  private async throttleStorage(sandboxId: string, config: any): Promise<void> {
    // Implementation for storage throttling
  }

  private async updateSandboxStatus(sandboxId: string, status: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('module_sandboxes')
      .update({
        status,
        status_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', sandboxId);

    if (error) throw error;
  }

  private async createPerformanceAlert(
    moduleId: string,
    tenantId: string,
    type: string,
    message: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('performance_alerts')
      .insert({
        module_id: moduleId,
        tenant_id: tenantId,
        type,
        message,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false
      });

    if (error) throw error;
  }
} 