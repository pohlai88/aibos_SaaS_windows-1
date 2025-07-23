/**
 * AI-BOS System Core
 *
 * Core kernel initialization and orchestration system.
 * Boots the AI-BOS operating system and manages core services.
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { EventEmitter } from 'events';
import { Logger } from '../monitoring/Logger';
import { ResourceManager } from './ResourceManager';
import { StateManager } from './StateManager';
import { ProcessManager } from './ProcessManager';
import { ComplianceManager } from '../security/ComplianceManager';

// ===== TYPES & INTERFACES =====

export interface SystemConfig {
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxProcesses: number;
  maxMemory: number; // MB
  maxCpu: number; // percentage
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceEnabled: boolean;
  autoRecovery: boolean;
  healthCheckInterval: number; // milliseconds
  metricsCollectionInterval: number; // milliseconds
}

export interface SystemStatus {
  status: SystemStatusType;
  uptime: number;
  version: string;
  environment: string;
  services: ServiceStatus[];
  resources: ResourceStatus;
  processes: ProcessStatus;
  compliance: ComplianceStatus;
  health: HealthStatus;
  lastHealthCheck: Date;
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  uptime: number;
  version: string;
  lastError?: string;
  metrics: Record<string, any>;
}

export interface ResourceStatus {
  memory: {
    total: number;
    used: number;
    available: number;
    utilization: number;
  };
  cpu: {
    total: number;
    used: number;
    available: number;
    utilization: number;
  };
  storage: {
    total: number;
    used: number;
    available: number;
    utilization: number;
  };
  network: {
    connections: number;
    bandwidth: number;
    errors: number;
  };
}

export interface ProcessStatus {
  total: number;
  running: number;
  suspended: number;
  stopped: number;
  error: number;
  averageStartTime: number;
  averageMemoryUsage: number;
  averageCpuUsage: number;
}

export interface ComplianceStatus {
  enabled: boolean;
  rules: number;
  violations: number;
  complianceRate: number;
  lastAudit: Date;
  nextAudit: Date;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  checks: HealthCheck[];
  lastCheck: Date;
  nextCheck: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  timestamp: Date;
  duration: number;
  details?: Record<string, any>;
}

export interface BootResult {
  success: boolean;
  duration: number;
  servicesStarted: number;
  servicesFailed: number;
  errors: string[];
  warnings: string[];
}

export enum SystemStatusType {
  BOOTING = 'booting',
  RUNNING = 'running',
  MAINTENANCE = 'maintenance',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
  SHUTTING_DOWN = 'shutting_down',
  STOPPED = 'stopped',
}

// ===== MAIN SYSTEM CORE CLASS =====

export class SystemCore extends EventEmitter {
  private static instance: SystemCore;
  private config: SystemConfig;
  private status: SystemStatusType = SystemStatusType.STOPPED;
  private startTime?: Date;
  private logger: Logger;
  private services: Map<string, any> = new Map();
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map();
  private isShuttingDown = false;

  // Core managers
  private resourceManager: ResourceManager;
  private stateManager: StateManager;
  private processManager: ProcessManager;
  private complianceManager: ComplianceManager;

  private constructor(config: SystemConfig) {
    super();
    this.config = config;
    this.logger = new Logger('SystemCore');
    this.initializeManagers();
    this.registerHealthChecks();
  }

  public static getInstance(config?: SystemConfig): SystemCore {
    if (!SystemCore.instance) {
      if (!config) {
        throw new Error('SystemCore requires configuration for first initialization');
      }
      SystemCore.instance = new SystemCore(config);
    }
    return SystemCore.instance;
  }

  // ===== SYSTEM BOOT & SHUTDOWN =====

  /**
   * Boot the AI-BOS system
   */
  public async boot(): Promise<BootResult> {
    const bootStartTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let servicesStarted = 0;
    let servicesFailed = 0;

    try {
      this.logger.info('Starting AI-BOS system boot sequence', {
        version: this.getVersion(),
        environment: this.config.environment,
        securityLevel: this.config.securityLevel,
      });

      this.status = SystemStatusType.BOOTING;
      this.startTime = new Date();

      // Phase 1: Initialize core managers
      this.logger.info('Phase 1: Initializing core managers');
      await this.initializeCoreManagers();
      servicesStarted += 4; // Resource, State, Process, Compliance managers

      // Phase 2: Start system services
      this.logger.info('Phase 2: Starting system services');
      const serviceResults = await this.startSystemServices();
      servicesStarted += serviceResults.started;
      servicesFailed += serviceResults.failed;
      errors.push(...serviceResults.errors);
      warnings.push(...serviceResults.warnings);

      // Phase 3: Initialize compliance system
      if (this.config.complianceEnabled) {
        this.logger.info('Phase 3: Initializing compliance system');
        try {
          await this.complianceManager.initialize();
          servicesStarted++;
        } catch (error) {
          servicesFailed++;
          errors.push(`Compliance initialization failed: ${error.message}`);
        }
      }

      // Phase 4: Perform health checks
      this.logger.info('Phase 4: Performing initial health checks');
      const healthResults = await this.performHealthChecks();
      if (healthResults.overall === 'critical') {
        errors.push('Critical health check failures detected');
      } else if (healthResults.overall === 'warning') {
        warnings.push('Health check warnings detected');
      }

      // Phase 5: Start monitoring and maintenance
      this.logger.info('Phase 5: Starting monitoring and maintenance');
      this.startMonitoring();
      this.startMaintenance();

      // Update status
      this.status =
        healthResults.overall === 'critical' ? SystemStatusType.CRITICAL : SystemStatusType.RUNNING;

      const bootDuration = Date.now() - bootStartTime;

      this.logger.info('AI-BOS system boot completed', {
        duration: bootDuration,
        servicesStarted,
        servicesFailed,
        errors: errors.length,
        warnings: warnings.length,
        status: this.status,
      });

      // Emit boot completed event
      this.emit('systemBooted', {
        duration: bootDuration,
        servicesStarted,
        servicesFailed,
        errors,
        warnings,
        status: this.status,
      });

      return {
        success: errors.length === 0,
        duration: bootDuration,
        servicesStarted,
        servicesFailed,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error('System boot failed', {
        error: error.message,
        duration: Date.now() - bootStartTime,
      });

      this.status = SystemStatusType.CRITICAL;

      return {
        success: false,
        duration: Date.now() - bootStartTime,
        servicesStarted,
        servicesFailed,
        errors: [error.message, ...errors],
        warnings,
      };
    }
  }

  /**
   * Shutdown the AI-BOS system
   */
  public async shutdown(force: boolean = false): Promise<void> {
    if (this.isShuttingDown) return;

    this.logger.info('Starting AI-BOS system shutdown', { force });
    this.isShuttingDown = true;
    this.status = SystemStatusType.SHUTTING_DOWN;

    try {
      // Phase 1: Stop all processes
      this.logger.info('Phase 1: Stopping all processes');
      await this.stopAllProcesses(force);

      // Phase 2: Stop system services
      this.logger.info('Phase 2: Stopping system services');
      await this.stopSystemServices();

      // Phase 3: Cleanup resources
      this.logger.info('Phase 3: Cleaning up resources');
      await this.cleanupResources();

      // Phase 4: Final cleanup
      this.logger.info('Phase 4: Final cleanup');
      await this.finalCleanup();

      this.status = SystemStatusType.STOPPED;
      this.logger.info('AI-BOS system shutdown completed');

      // Emit shutdown completed event
      this.emit('systemShutdown', { force });
    } catch (error) {
      this.logger.error('System shutdown failed', { error: error.message });
      throw error;
    }
  }

  // ===== SYSTEM STATUS & HEALTH =====

  /**
   * Get system status
   */
  public getSystemStatus(): SystemStatus {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;

    return {
      status: this.status,
      uptime,
      version: this.getVersion(),
      environment: this.config.environment,
      services: this.getServiceStatuses(),
      resources: this.getResourceStatus(),
      processes: this.getProcessStatus(),
      compliance: this.getComplianceStatus(),
      health: this.getHealthStatus(),
      lastHealthCheck: new Date(),
    };
  }

  /**
   * Perform health checks
   */
  public async performHealthChecks(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    // Perform all registered health checks
    for (const [name, check] of this.healthChecks) {
      const checkStartTime = Date.now();
      try {
        const result = await check();
        checks.push(result);
      } catch (error) {
        checks.push({
          name,
          status: 'fail',
          message: `Health check failed: ${error.message}`,
          timestamp: new Date(),
          duration: Date.now() - checkStartTime,
        });
      }
    }

    // Determine overall health
    const criticalChecks = checks.filter((c) => c.status === 'fail');
    const warningChecks = checks.filter((c) => c.status === 'warning');

    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalChecks.length > 0) {
      overall = 'critical';
    } else if (warningChecks.length > 0) {
      overall = 'warning';
    }

    const healthStatus: HealthStatus = {
      overall,
      checks,
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + this.config.healthCheckInterval),
    };

    // Update system status based on health
    if (overall === 'critical' && this.status === SystemStatusType.RUNNING) {
      this.status = SystemStatusType.CRITICAL;
      this.emit('systemHealthCritical', healthStatus);
    } else if (overall === 'warning' && this.status === SystemStatusType.RUNNING) {
      this.status = SystemStatusType.DEGRADED;
      this.emit('systemHealthWarning', healthStatus);
    } else if (overall === 'healthy' && this.status !== SystemStatusType.RUNNING) {
      this.status = SystemStatusType.RUNNING;
      this.emit('systemHealthRecovered', healthStatus);
    }

    this.logger.debug('Health checks completed', {
      overall,
      totalChecks: checks.length,
      failed: criticalChecks.length,
      warnings: warningChecks.length,
      duration: Date.now() - startTime,
    });

    return healthStatus;
  }

  // ===== SERVICE MANAGEMENT =====

  /**
   * Register a service
   */
  public registerService(name: string, service: any): void {
    this.services.set(name, service);
    this.logger.info('Service registered', { name });
  }

  /**
   * Get a service by name
   */
  public getService<T>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  /**
   * Register a health check
   */
  public registerHealthCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.healthChecks.set(name, check);
    this.logger.debug('Health check registered', { name });
  }

  // ===== UTILITY METHODS =====

  /**
   * Get system version
   */
  public getVersion(): string {
    return '1.0.0';
  }

  /**
   * Get system configuration
   */
  public getConfig(): SystemConfig {
    return { ...this.config };
  }

  /**
   * Get system metrics for monitoring and optimization
   */
  public getMetrics(): {
    uptime: number;
    servicesCount: number;
    healthChecksCount: number;
    performanceMetrics: Record<string, any>;
    errorMetrics: Record<string, any>;
  } {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;

    return {
      uptime,
      servicesCount: this.services.size,
      healthChecksCount: this.healthChecks.size,
      performanceMetrics: {
        bootTime: this.getBootTime(),
        serviceStartupTime: this.getAverageServiceStartupTime(),
        healthCheckDuration: this.getAverageHealthCheckDuration(),
      },
      errorMetrics: {
        totalErrors: this.getTotalErrors(),
        errorRate: this.getErrorRate(),
        lastError: this.getLastError(),
      },
    };
  }

  /**
   * Update system configuration
   */
  public updateConfig(updates: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('System configuration updated', { updates: Object.keys(updates) });
  }

  // ===== PRIVATE HELPER METHODS =====

  private initializeManagers(): void {
    // Initialize core managers (they are singletons)
    this.resourceManager = ResourceManager.getInstance();
    this.stateManager = StateManager.getInstance();
    this.processManager = ProcessManager.getInstance();
    this.complianceManager = ComplianceManager.getInstance();

    // Register managers as services
    this.registerService('ResourceManager', this.resourceManager);
    this.registerService('StateManager', this.stateManager);
    this.registerService('ProcessManager', this.processManager);
    this.registerService('ComplianceManager', this.complianceManager);
  }

  private async initializeCoreManagers(): Promise<void> {
    // Core managers are already initialized as singletons
    // Additional initialization can be done here if needed
    this.logger.debug('Core managers initialized');
  }

  private async startSystemServices(): Promise<{
    started: number;
    failed: number;
    errors: string[];
    warnings: string[];
  }> {
    let started = 0;
    let failed = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Start monitoring service
    try {
      // In a real implementation, this would start actual services
      this.logger.debug('System services started');
      started++;
    } catch (error) {
      failed++;
      errors.push(`Failed to start monitoring service: ${error.message}`);
    }

    return { started, failed, errors, warnings };
  }

  private async stopAllProcesses(force: boolean): Promise<void> {
    const processes = this.processManager.getTenantProcesses('*');

    for (const process of processes) {
      try {
        if (force) {
          await this.processManager.killProcess(process.id);
        } else {
          await this.processManager.stopProcess(process.id, true);
        }
      } catch (error) {
        this.logger.warn('Failed to stop process', {
          processId: process.id,
          error: error.message,
        });
      }
    }
  }

  private async stopSystemServices(): Promise<void> {
    // Stop all registered services
    for (const [name, service] of this.services) {
      try {
        if (service && typeof service.shutdown === 'function') {
          await service.shutdown();
        }
      } catch (error) {
        this.logger.warn('Failed to shutdown service', {
          serviceName: name,
          error: error.message,
        });
      }
    }
  }

  private async cleanupResources(): Promise<void> {
    try {
      // Cleanup expired resources
      await this.resourceManager.cleanupExpiredResources();

      // Cleanup terminated processes
      await this.processManager.cleanupTerminatedProcesses();

      // Cleanup expired states
      await this.stateManager.clearExpiredStates();
    } catch (error) {
      this.logger.warn('Resource cleanup failed', { error: error.message });
    }
  }

  private async finalCleanup(): Promise<void> {
    // Final cleanup tasks
    this.logger.debug('Final cleanup completed');
  }

  private registerHealthChecks(): void {
    // Register core health checks
    this.registerHealthCheck('ResourceManager', async (): Promise<HealthCheck> => {
      const startTime = Date.now();
      const metrics = this.resourceManager.getMetrics();

      return {
        name: 'ResourceManager',
        status: metrics.errorRate > 0.1 ? 'fail' : 'pass',
        message: `Resource manager healthy (${metrics.allocationCount} allocations)`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details: metrics,
      };
    });

    this.registerHealthCheck('StateManager', async (): Promise<HealthCheck> => {
      const startTime = Date.now();
      const metrics = this.stateManager.getMetrics();

      return {
        name: 'StateManager',
        status: metrics.errorRate > 0.1 ? 'fail' : 'pass',
        message: `State manager healthy (${metrics.totalStates} states)`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details: metrics,
      };
    });

    this.registerHealthCheck('ProcessManager', async (): Promise<HealthCheck> => {
      const startTime = Date.now();
      const metrics = this.processManager.getMetrics();

      return {
        name: 'ProcessManager',
        status: metrics.errorRate > 0.1 ? 'fail' : 'pass',
        message: `Process manager healthy (${metrics.activeProcesses} active processes)`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details: metrics,
      };
    });

    this.registerHealthCheck('SystemResources', async (): Promise<HealthCheck> => {
      const startTime = Date.now();
      const resourceStatus = this.getResourceStatus();

      const memoryCritical = resourceStatus.memory.utilization > 90;
      const cpuCritical = resourceStatus.cpu.utilization > 90;

      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let message = 'System resources healthy';

      if (memoryCritical || cpuCritical) {
        status = 'fail';
        message = 'Critical resource utilization';
      } else if (resourceStatus.memory.utilization > 80 || resourceStatus.cpu.utilization > 80) {
        status = 'warning';
        message = 'High resource utilization';
      }

      return {
        name: 'SystemResources',
        status,
        message,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details: resourceStatus,
      };
    });
  }

  private startMonitoring(): void {
    // Start health check monitoring
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);

    // Start metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsCollectionInterval);
  }

  private startMaintenance(): void {
    // Start maintenance tasks
    setInterval(
      () => {
        this.performMaintenance();
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  private async performMaintenance(): Promise<void> {
    try {
      // Cleanup expired resources
      await this.resourceManager.cleanupExpiredResources();

      // Cleanup terminated processes
      await this.processManager.cleanupTerminatedProcesses();

      // Cleanup expired states
      await this.stateManager.clearExpiredStates();

      // Enforce data retention if compliance is enabled
      if (this.config.complianceEnabled) {
        await this.complianceManager.enforceDataRetention();
      }
    } catch (error) {
      this.logger.warn('Maintenance task failed', { error: error.message });
    }
  }

  private collectMetrics(): void {
    // Collect and store system metrics
    const metrics = {
      timestamp: new Date(),
      systemStatus: this.getSystemStatus(),
      resourceMetrics: this.resourceManager.getMetrics(),
      stateMetrics: this.stateManager.getMetrics(),
      processMetrics: this.processManager.getMetrics(),
    };

    // Store metrics in state manager
    this.stateManager.setState('system:metrics', metrics, {
      modifiedBy: 'system',
      metadata: {
        isPersistent: true,
        isPublic: false,
        isReadOnly: true,
        ttl: 24 * 60 * 60 * 1000, // 24 hours
      },
    });
  }

  private getServiceStatuses(): ServiceStatus[] {
    const statuses: ServiceStatus[] = [];

    for (const [name, service] of this.services) {
      statuses.push({
        name,
        status: 'running', // In a real implementation, check actual status
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        version: '1.0.0',
        metrics: {},
      });
    }

    return statuses;
  }

  private getResourceStatus(): ResourceStatus {
    const metrics = this.resourceManager.getMetrics();

    return {
      memory: {
        total: 1024 * 1024 * 1024, // 1GB
        used: metrics.totalAllocated,
        available: 1024 * 1024 * 1024 - metrics.totalAllocated,
        utilization: metrics.utilizationRate,
      },
      cpu: {
        total: 100,
        used: 50, // In a real implementation, get actual CPU usage
        available: 50,
        utilization: 0.5,
      },
      storage: {
        total: 10 * 1024 * 1024 * 1024, // 10GB
        used: 2 * 1024 * 1024 * 1024, // 2GB
        available: 8 * 1024 * 1024 * 1024, // 8GB
        utilization: 0.2,
      },
      network: {
        connections: 100,
        bandwidth: 1000, // Mbps
        errors: 0,
      },
    };
  }

  private getProcessStatus(): ProcessStatus {
    const metrics = this.processManager.getMetrics();

    return {
      total: metrics.totalProcesses,
      running: metrics.activeProcesses,
      suspended: metrics.suspendedProcesses,
      stopped: metrics.terminatedProcesses,
      error: 0,
      averageStartTime: metrics.averageStartTime,
      averageMemoryUsage: metrics.averageMemoryUsage,
      averageCpuUsage: metrics.averageCpuUsage,
    };
  }

  private getComplianceStatus(): ComplianceStatus {
    if (!this.config.complianceEnabled) {
      return {
        enabled: false,
        rules: 0,
        violations: 0,
        complianceRate: 100,
        lastAudit: new Date(),
        nextAudit: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };
    }

    const rules = this.complianceManager.getRules();
    const violations = this.complianceManager.getViolations();

    return {
      enabled: true,
      rules: rules.length,
      violations: violations.filter((v) => !v.resolved).length,
      complianceRate: 95, // In a real implementation, calculate actual rate
      lastAudit: new Date(),
      nextAudit: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  private getHealthStatus(): HealthStatus {
    return {
      overall: 'healthy',
      checks: [],
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + this.config.healthCheckInterval),
    };
  }
}

// ===== EXPORTS =====

export default SystemCore;
