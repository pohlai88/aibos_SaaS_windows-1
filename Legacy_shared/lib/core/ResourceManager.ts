/**
 * AI-BOS Resource Manager
 *
 * Core kernel-level resource allocation and quota management system.
 * Handles memory, CPU, storage, and custom resource allocation per tenant.
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { EventEmitter } from 'events';
import { Logger } from '../monitoring/Logger';
import { SecurityPolicy } from '../security/SecurityPolicy';

// ===== TYPES & INTERFACES =====

export interface Resource {
  id: string;
  type: ResourceType;
  tenantId: string;
  allocatedAt: Date;
  lastAccessed: Date;
  metadata: Record<string, any>;
  size?: number;
  priority: ResourcePriority;
}

export interface ResourceQuota {
  tenantId: string;
  resourceType: ResourceType;
  limit: number;
  used: number;
  reserved: number;
  burstLimit?: number;
  burstUsed: number;
  lastReset: Date;
  resetInterval: number; // milliseconds
}

export interface ResourceRequest {
  tenantId: string;
  resourceType: ResourceType;
  size?: number;
  priority: ResourcePriority;
  metadata?: Record<string, any>;
  timeout?: number;
}

export interface ResourceAllocation {
  success: boolean;
  resourceId?: string;
  error?: string;
  quota?: ResourceQuota;
  waitTime?: number;
}

export interface ResourceMetrics {
  totalAllocated: number;
  totalReserved: number;
  utilizationRate: number;
  allocationCount: number;
  releaseCount: number;
  averageAllocationTime: number;
  errorRate: number;
}

export enum ResourceType {
  MEMORY = 'memory',
  CPU = 'cpu',
  STORAGE = 'storage',
  NETWORK = 'network',
  DATABASE_CONNECTION = 'database_connection',
  CACHE = 'cache',
  FILE_HANDLE = 'file_handle',
  CUSTOM = 'custom',
}

export enum ResourcePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  BACKGROUND = 'background',
}

export enum ResourceState {
  AVAILABLE = 'available',
  ALLOCATED = 'allocated',
  RESERVED = 'reserved',
  LOCKED = 'locked',
  ERROR = 'error',
}

// ===== MAIN RESOURCE MANAGER CLASS =====

export class ResourceManager extends EventEmitter {
  private static instance: ResourceManager;
  private resources: Map<string, Resource> = new Map();
  private quotas: Map<string, ResourceQuota> = new Map();
  private resourcePools: Map<ResourceType, ResourcePool> = new Map();
  private allocationQueue: ResourceRequest[] = [];
  private logger: Logger;
  private securityPolicy: SecurityPolicy;
  private metrics: ResourceMetrics = {
    totalAllocated: 0,
    totalReserved: 0,
    utilizationRate: 0,
    allocationCount: 0,
    releaseCount: 0,
    averageAllocationTime: 0,
    errorRate: 0,
  };

  private constructor() {
    super();
    this.logger = new Logger('ResourceManager');
    this.securityPolicy = new SecurityPolicy();
    this.initializeResourcePools();
    this.startMetricsCollection();
  }

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  // ===== INITIALIZATION =====

  private initializeResourcePools(): void {
    Object.values(ResourceType).forEach((type) => {
      this.resourcePools.set(type, new ResourcePool(type));
    });

    this.logger.info('Resource pools initialized', {
      poolCount: this.resourcePools.size,
      poolTypes: Array.from(this.resourcePools.keys()),
    });
  }

  // ===== CORE RESOURCE OPERATIONS =====

  /**
   * Allocate a resource for a tenant
   */
  public async allocateResource(request: ResourceRequest): Promise<ResourceAllocation> {
    const startTime = Date.now();

    try {
      // Validate request
      const validation = this.validateResourceRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Check security policy
      const securityCheck = await this.securityPolicy.checkResourceAccess(
        request.tenantId,
        request.resourceType,
        request.size || 0,
      );

      if (!securityCheck.allowed) {
        this.logger.warn('Resource access denied by security policy', {
          tenantId: request.tenantId,
          resourceType: request.resourceType,
          reason: securityCheck.reason,
        });

        return {
          success: false,
          error: `Access denied: ${securityCheck.reason}`,
        };
      }

      // Check quota
      const quotaCheck = this.checkQuota(request);
      if (!quotaCheck.available) {
        if (request.priority === ResourcePriority.CRITICAL) {
          // Force allocation for critical resources
          this.logger.warn('Forcing critical resource allocation despite quota', {
            tenantId: request.tenantId,
            resourceType: request.resourceType,
          });
        } else {
          // Add to queue for later processing
          this.addToAllocationQueue(request);
          return {
            success: false,
            error: 'Resource quota exceeded, request queued',
            quota: quotaCheck.quota,
            waitTime: this.estimateWaitTime(request),
          };
        }
      }

      // Allocate resource
      const resource = await this.performAllocation(request);
      if (!resource) {
        return {
          success: false,
          error: 'Failed to allocate resource',
        };
      }

      // Update metrics
      const allocationTime = Date.now() - startTime;
      this.updateMetrics('allocation', allocationTime);

      // Emit event
      this.emit('resourceAllocated', {
        resourceId: resource.id,
        tenantId: request.tenantId,
        resourceType: request.resourceType,
        allocationTime,
      });

      this.logger.info('Resource allocated successfully', {
        resourceId: resource.id,
        tenantId: request.tenantId,
        resourceType: request.resourceType,
        allocationTime,
      });

      return {
        success: true,
        resourceId: resource.id,
        quota: this.getQuota(request.tenantId, request.resourceType),
      };
    } catch (error) {
      this.logger.error('Resource allocation failed', {
        error: error.message,
        tenantId: request.tenantId,
        resourceType: request.resourceType,
      });

      this.updateMetrics('error');

      return {
        success: false,
        error: `Allocation failed: ${error.message}`,
      };
    }
  }

  /**
   * Release a resource
   */
  public async releaseResource(resourceId: string, tenantId?: string): Promise<boolean> {
    try {
      const resource = this.resources.get(resourceId);
      if (!resource) {
        this.logger.warn('Attempted to release non-existent resource', { resourceId });
        return false;
      }

      // Security check
      if (tenantId && resource.tenantId !== tenantId) {
        this.logger.warn('Unauthorized resource release attempt', {
          resourceId,
          requestingTenant: tenantId,
          owningTenant: resource.tenantId,
        });
        return false;
      }

      // Release resource
      await this.performRelease(resource);

      // Update metrics
      this.updateMetrics('release');

      // Emit event
      this.emit('resourceReleased', {
        resourceId,
        tenantId: resource.tenantId,
        resourceType: resource.type,
      });

      this.logger.info('Resource released successfully', {
        resourceId,
        tenantId: resource.tenantId,
        resourceType: resource.type,
      });

      return true;
    } catch (error) {
      this.logger.error('Resource release failed', {
        error: error.message,
        resourceId,
      });
      return false;
    }
  }

  /**
   * Reserve a resource for future use
   */
  public async reserveResource(request: ResourceRequest): Promise<ResourceAllocation> {
    try {
      // Check quota for reservation
      const quotaCheck = this.checkQuota(request);
      if (!quotaCheck.available) {
        return {
          success: false,
          error: 'Insufficient quota for reservation',
        };
      }

      // Create reserved resource
      const resource: Resource = {
        id: this.generateResourceId(),
        type: request.resourceType,
        tenantId: request.tenantId,
        allocatedAt: new Date(),
        lastAccessed: new Date(),
        metadata: request.metadata || {},
        size: request.size,
        priority: request.priority,
      };

      // Mark as reserved
      this.resources.set(resource.id, resource);
      this.updateQuota(request.tenantId, request.resourceType, 'reserve', request.size || 1);

      this.logger.info('Resource reserved successfully', {
        resourceId: resource.id,
        tenantId: request.tenantId,
        resourceType: request.resourceType,
      });

      return {
        success: true,
        resourceId: resource.id,
        quota: this.getQuota(request.tenantId, request.resourceType),
      };
    } catch (error) {
      this.logger.error('Resource reservation failed', {
        error: error.message,
        tenantId: request.tenantId,
        resourceType: request.resourceType,
      });

      return {
        success: false,
        error: `Reservation failed: ${error.message}`,
      };
    }
  }

  // ===== QUOTA MANAGEMENT =====

  /**
   * Set quota for a tenant
   */
  public setQuota(
    tenantId: string,
    resourceType: ResourceType,
    quota: Partial<ResourceQuota>,
  ): void {
    const existingQuota = this.quotas.get(this.getQuotaKey(tenantId, resourceType));

    const newQuota: ResourceQuota = {
      tenantId,
      resourceType,
      limit: quota.limit || existingQuota?.limit || 1000,
      used: quota.used || existingQuota?.used || 0,
      reserved: quota.reserved || existingQuota?.reserved || 0,
      burstLimit: quota.burstLimit || existingQuota?.burstLimit,
      burstUsed: quota.burstUsed || existingQuota?.burstUsed || 0,
      lastReset: existingQuota?.lastReset || new Date(),
      resetInterval: quota.resetInterval || existingQuota?.resetInterval || 24 * 60 * 60 * 1000, // 24 hours
    };

    this.quotas.set(this.getQuotaKey(tenantId, resourceType), newQuota);

    this.logger.info('Quota updated', {
      tenantId,
      resourceType,
      limit: newQuota.limit,
      burstLimit: newQuota.burstLimit,
    });
  }

  /**
   * Get quota for a tenant
   */
  public getQuota(tenantId: string, resourceType: ResourceType): ResourceQuota | undefined {
    return this.quotas.get(this.getQuotaKey(tenantId, resourceType));
  }

  /**
   * Check if quota is available
   */
  private checkQuota(request: ResourceRequest): { available: boolean; quota?: ResourceQuota } {
    const quota = this.getQuota(request.tenantId, request.resourceType);
    if (!quota) {
      return { available: true }; // No quota set, allow allocation
    }

    const required = request.size || 1;
    const available = quota.limit - quota.used - quota.reserved;

    // Check burst limit if available
    if (quota.burstLimit && quota.burstUsed < quota.burstLimit) {
      const burstAvailable = quota.burstLimit - quota.burstUsed;
      return {
        available: available + burstAvailable >= required,
        quota,
      };
    }

    return {
      available: available >= required,
      quota,
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Get resource by ID
   */
  public getResource(resourceId: string): Resource | undefined {
    return this.resources.get(resourceId);
  }

  /**
   * Get all resources for a tenant
   */
  public getTenantResources(tenantId: string): Resource[] {
    return Array.from(this.resources.values()).filter((r) => r.tenantId === tenantId);
  }

  /**
   * Get resource metrics
   */
  public getMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }

  /**
   * Cleanup expired resources
   */
  public async cleanupExpiredResources(): Promise<number> {
    const now = new Date();
    const expiredResources: Resource[] = [];

    for (const resource of this.resources.values()) {
      const age = now.getTime() - resource.lastAccessed.getTime();
      const maxAge = this.getMaxResourceAge(resource.type);

      if (age > maxAge) {
        expiredResources.push(resource);
      }
    }

    let cleanedCount = 0;
    for (const resource of expiredResources) {
      if (await this.releaseResource(resource.id)) {
        cleanedCount++;
      }
    }

    this.logger.info('Resource cleanup completed', {
      cleanedCount,
      totalResources: this.resources.size,
    });

    return cleanedCount;
  }

  // ===== PRIVATE HELPER METHODS =====

  private validateResourceRequest(request: ResourceRequest): { valid: boolean; error?: string } {
    if (!request.tenantId) {
      return { valid: false, error: 'Tenant ID is required' };
    }

    if (!request.resourceType) {
      return { valid: false, error: 'Resource type is required' };
    }

    if (request.size && request.size <= 0) {
      return { valid: false, error: 'Resource size must be positive' };
    }

    if (!Object.values(ResourcePriority).includes(request.priority)) {
      return { valid: false, error: 'Invalid resource priority' };
    }

    return { valid: true };
  }

  private async performAllocation(request: ResourceRequest): Promise<Resource | null> {
    const resource: Resource = {
      id: this.generateResourceId(),
      type: request.resourceType,
      tenantId: request.tenantId,
      allocatedAt: new Date(),
      lastAccessed: new Date(),
      metadata: request.metadata || {},
      size: request.size,
      priority: request.priority,
    };

    // Add to resource map
    this.resources.set(resource.id, resource);

    // Update quota
    this.updateQuota(request.tenantId, request.resourceType, 'allocate', request.size || 1);

    return resource;
  }

  private async performRelease(resource: Resource): Promise<void> {
    // Remove from resource map
    this.resources.delete(resource.id);

    // Update quota
    this.updateQuota(resource.tenantId, resource.type, 'release', resource.size || 1);
  }

  private updateQuota(
    tenantId: string,
    resourceType: ResourceType,
    action: 'allocate' | 'release' | 'reserve',
    amount: number,
  ): void {
    const quotaKey = this.getQuotaKey(tenantId, resourceType);
    const quota = this.quotas.get(quotaKey);

    if (quota) {
      switch (action) {
        case 'allocate':
          quota.used += amount;
          break;
        case 'release':
          quota.used = Math.max(0, quota.used - amount);
          break;
        case 'reserve':
          quota.reserved += amount;
          break;
      }

      this.quotas.set(quotaKey, quota);
    }
  }

  private getQuotaKey(tenantId: string, resourceType: ResourceType): string {
    return `${tenantId}:${resourceType}`;
  }

  private generateResourceId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToAllocationQueue(request: ResourceRequest): void {
    this.allocationQueue.push(request);
    this.processAllocationQueue();
  }

  private async processAllocationQueue(): Promise<void> {
    if (this.allocationQueue.length === 0) return;

    const request = this.allocationQueue.shift();
    if (!request) return;

    // Retry allocation
    const result = await this.allocateResource(request);
    if (!result.success) {
      // Re-queue if still failing
      this.allocationQueue.unshift(request);
    }
  }

  private estimateWaitTime(request: ResourceRequest): number {
    // Simple estimation based on queue position and average allocation time
    const queuePosition = this.allocationQueue.length;
    const avgAllocationTime = this.metrics.averageAllocationTime || 100;
    return queuePosition * avgAllocationTime;
  }

  private getMaxResourceAge(resourceType: ResourceType): number {
    const maxAges: Record<ResourceType, number> = {
      [ResourceType.MEMORY]: 30 * 60 * 1000, // 30 minutes
      [ResourceType.CPU]: 5 * 60 * 1000, // 5 minutes
      [ResourceType.STORAGE]: 24 * 60 * 60 * 1000, // 24 hours
      [ResourceType.NETWORK]: 10 * 60 * 1000, // 10 minutes
      [ResourceType.DATABASE_CONNECTION]: 15 * 60 * 1000, // 15 minutes
      [ResourceType.CACHE]: 60 * 60 * 1000, // 1 hour
      [ResourceType.FILE_HANDLE]: 30 * 60 * 1000, // 30 minutes
      [ResourceType.CUSTOM]: 60 * 60 * 1000, // 1 hour
    };

    return maxAges[resourceType] || 60 * 60 * 1000;
  }

  private updateMetrics(operation: 'allocation' | 'release' | 'error', time?: number): void {
    switch (operation) {
      case 'allocation':
        this.metrics.allocationCount++;
        if (time) {
          this.metrics.averageAllocationTime =
            (this.metrics.averageAllocationTime * (this.metrics.allocationCount - 1) + time) /
            this.metrics.allocationCount;
        }
        break;
      case 'release':
        this.metrics.releaseCount++;
        break;
      case 'error':
        this.metrics.errorRate =
          this.metrics.allocationCount > 0
            ? (this.metrics.errorRate * (this.metrics.allocationCount - 1) + 1) /
              this.metrics.allocationCount
            : 1;
        break;
    }

    // Update utilization rate
    this.metrics.totalAllocated = Array.from(this.resources.values()).reduce(
      (sum, r) => sum + (r.size || 1),
      0,
    );

    const totalQuota = Array.from(this.quotas.values()).reduce((sum, q) => sum + q.limit, 0);

    this.metrics.utilizationRate = totalQuota > 0 ? this.metrics.totalAllocated / totalQuota : 0;
  }

  private startMetricsCollection(): void {
    // Cleanup expired resources every 5 minutes
    setInterval(
      () => {
        this.cleanupExpiredResources();
      },
      5 * 60 * 1000,
    );

    // Process allocation queue every second
    setInterval(() => {
      this.processAllocationQueue();
    }, 1000);
  }
}

// ===== RESOURCE POOL CLASS =====

class ResourcePool {
  private type: ResourceType;
  private available: number;
  private total: number;
  private reserved: number;

  constructor(type: ResourceType) {
    this.type = type;
    this.total = this.getDefaultPoolSize(type);
    this.available = this.total;
    this.reserved = 0;
  }

  private getDefaultPoolSize(type: ResourceType): number {
    const sizes: Record<ResourceType, number> = {
      [ResourceType.MEMORY]: 1024 * 1024 * 1024, // 1GB
      [ResourceType.CPU]: 100, // 100 CPU units
      [ResourceType.STORAGE]: 10 * 1024 * 1024 * 1024, // 10GB
      [ResourceType.NETWORK]: 1000, // 1000 connections
      [ResourceType.DATABASE_CONNECTION]: 100, // 100 connections
      [ResourceType.CACHE]: 100 * 1024 * 1024, // 100MB
      [ResourceType.FILE_HANDLE]: 1000, // 1000 handles
      [ResourceType.CUSTOM]: 1000, // 1000 units
    };

    return sizes[type] || 1000;
  }

  public allocate(size: number): boolean {
    if (this.available >= size) {
      this.available -= size;
      return true;
    }
    return false;
  }

  public release(size: number): void {
    this.available = Math.min(this.total, this.available + size);
  }

  public getUtilization(): number {
    return (this.total - this.available) / this.total;
  }
}

// ===== EXPORTS =====

export default ResourceManager;
