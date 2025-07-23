/**
 * AI-BOS State Manager
 *
 * Core kernel-level global state management system with reactive capabilities.
 * Handles application state, tenant isolation, and state synchronization.
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { EventEmitter } from 'events';
import { Logger } from '../monitoring/Logger';
import { SecurityPolicy } from '../security/SecurityPolicy';

// ===== TYPES & INTERFACES =====

export interface StateValue<T = any> {
  value: T;
  version: number;
  lastModified: Date;
  modifiedBy: string;
  tenantId?: string;
  metadata: StateMetadata;
}

export interface StateMetadata {
  description?: string;
  tags?: string[];
  isPersistent: boolean;
  isPublic: boolean;
  isReadOnly: boolean;
  ttl?: number; // Time to live in milliseconds
  encryption?: EncryptionConfig;
}

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyId: string;
  iv?: string;
}

export interface StateSubscription {
  id: string;
  key: string;
  tenantId?: string;
  callback: StateCallback;
  filter?: StateFilter;
  isActive: boolean;
  createdAt: Date;
}

export interface StateFilter {
  valueType?: string;
  tags?: string[];
  modifiedAfter?: Date;
  modifiedBy?: string;
}

export interface StateCallback<T = any> {
  (newValue: T, oldValue: T | undefined, metadata: StateChangeMetadata): void;
}

export interface StateChangeMetadata {
  key: string;
  tenantId?: string;
  version: number;
  timestamp: Date;
  modifiedBy: string;
  changeType: 'set' | 'update' | 'delete';
}

export interface StateHistory<T = any> {
  key: string;
  tenantId?: string;
  value: T;
  version: number;
  timestamp: Date;
  modifiedBy: string;
  changeType: 'set' | 'update' | 'delete';
  metadata: StateMetadata;
}

export interface StateMetrics {
  totalStates: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  stateChangesPerSecond: number;
  averageStateSize: number;
  memoryUsage: number;
  errorRate: number;
}

export enum StateChangeType {
  SET = 'set',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum StateAccessLevel {
  PUBLIC = 'public',
  TENANT = 'tenant',
  PRIVATE = 'private',
}

// ===== MAIN STATE MANAGER CLASS =====

export class StateManager extends EventEmitter {
  private static instance: StateManager;
  private stateStore: Map<string, StateValue> = new Map();
  private subscriptions: Map<string, StateSubscription> = new Map();
  private stateHistory: StateHistory[] = [];
  private logger: Logger;
  private securityPolicy: SecurityPolicy;
  private metrics: StateMetrics = {
    totalStates: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    stateChangesPerSecond: 0,
    averageStateSize: 0,
    memoryUsage: 0,
    errorRate: 0,
  };
  private changeCount = 0;
  private lastChangeTime = Date.now();

  private constructor() {
    super();
    this.logger = new Logger('StateManager');
    this.securityPolicy = new SecurityPolicy();
    this.startMetricsCollection();
    this.startCleanupProcess();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  // ===== CORE STATE OPERATIONS =====

  /**
   * Set a state value
   */
  public async setState<T>(
    key: string,
    value: T,
    options: {
      tenantId?: string;
      modifiedBy: string;
      metadata?: Partial<StateMetadata>;
    },
  ): Promise<boolean> {
    try {
      // Validate access
      const accessCheck = await this.securityPolicy.checkStateAccess(
        options.modifiedBy,
        key,
        'write',
        options.tenantId,
      );

      if (!accessCheck.allowed) {
        this.logger.warn('State access denied', {
          key,
          tenantId: options.tenantId,
          modifiedBy: options.modifiedBy,
          reason: accessCheck.reason,
        });
        return false;
      }

      const stateKey = this.getStateKey(key, options.tenantId);
      const existingState = this.stateStore.get(stateKey);
      const version = existingState ? existingState.version + 1 : 1;

      const stateValue: StateValue<T> = {
        value,
        version,
        lastModified: new Date(),
        modifiedBy: options.modifiedBy,
        tenantId: options.tenantId,
        metadata: {
          description: options.metadata?.description,
          tags: options.metadata?.tags || [],
          isPersistent: options.metadata?.isPersistent ?? true,
          isPublic: options.metadata?.isPublic ?? false,
          isReadOnly: options.metadata?.isReadOnly ?? false,
          ttl: options.metadata?.ttl,
          encryption: options.metadata?.encryption,
        },
      };

      // Encrypt if needed
      if (stateValue.metadata.encryption) {
        stateValue.value = await this.encryptValue(value, stateValue.metadata.encryption);
      }

      // Store state
      this.stateStore.set(stateKey, stateValue);

      // Add to history
      this.addToHistory(
        key,
        options.tenantId,
        value,
        version,
        options.modifiedBy,
        StateChangeType.SET,
        stateValue.metadata,
      );

      // Notify subscribers
      this.notifySubscribers(key, options.tenantId, value, existingState?.value, {
        key,
        tenantId: options.tenantId,
        version,
        timestamp: stateValue.lastModified,
        modifiedBy: options.modifiedBy,
        changeType: StateChangeType.SET,
      });

      // Update metrics
      this.updateMetrics('set');

      // Emit event
      this.emit('stateChanged', {
        key,
        tenantId: options.tenantId,
        value,
        version,
        modifiedBy: options.modifiedBy,
        changeType: StateChangeType.SET,
      });

      this.logger.info('State set successfully', {
        key,
        tenantId: options.tenantId,
        version,
        modifiedBy: options.modifiedBy,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to set state', {
        error: error.message,
        key,
        tenantId: options.tenantId,
      });
      this.updateMetrics('error');
      return false;
    }
  }

  /**
   * Get a state value
   */
  public async getState<T>(
    key: string,
    options: {
      tenantId?: string;
      requestedBy: string;
      defaultValue?: T;
    },
  ): Promise<T | undefined> {
    try {
      // Validate access
      const accessCheck = await this.securityPolicy.checkStateAccess(
        options.requestedBy,
        key,
        'read',
        options.tenantId,
      );

      if (!accessCheck.allowed) {
        this.logger.warn('State access denied', {
          key,
          tenantId: options.tenantId,
          requestedBy: options.requestedBy,
          reason: accessCheck.reason,
        });
        return options.defaultValue;
      }

      const stateKey = this.getStateKey(key, options.tenantId);
      const stateValue = this.stateStore.get(stateKey) as StateValue<T> | undefined;

      if (!stateValue) {
        return options.defaultValue;
      }

      // Check if expired
      if (stateValue.metadata.ttl && this.isExpired(stateValue)) {
        this.logger.debug('State expired, removing', { key, tenantId: options.tenantId });
        await this.deleteState(key, { tenantId: options.tenantId, deletedBy: options.requestedBy });
        return options.defaultValue;
      }

      // Decrypt if needed
      let value = stateValue.value;
      if (stateValue.metadata.encryption) {
        value = await this.decryptValue(value, stateValue.metadata.encryption);
      }

      // Update last accessed
      stateValue.lastModified = new Date();
      this.stateStore.set(stateKey, stateValue);

      this.logger.debug('State retrieved successfully', {
        key,
        tenantId: options.tenantId,
        version: stateValue.version,
      });

      return value;
    } catch (error) {
      this.logger.error('Failed to get state', {
        error: error.message,
        key,
        tenantId: options.tenantId,
      });
      this.updateMetrics('error');
      return options.defaultValue;
    }
  }

  /**
   * Update a state value
   */
  public async updateState<T>(
    key: string,
    updater: (currentValue: T | undefined) => T,
    options: {
      tenantId?: string;
      modifiedBy: string;
    },
  ): Promise<boolean> {
    try {
      const currentValue = await this.getState<T>(key, {
        tenantId: options.tenantId,
        requestedBy: options.modifiedBy,
      });

      const newValue = updater(currentValue);
      return await this.setState(key, newValue, {
        tenantId: options.tenantId,
        modifiedBy: options.modifiedBy,
      });
    } catch (error) {
      this.logger.error('Failed to update state', {
        error: error.message,
        key,
        tenantId: options.tenantId,
      });
      return false;
    }
  }

  /**
   * Delete a state value
   */
  public async deleteState(
    key: string,
    options: {
      tenantId?: string;
      deletedBy: string;
    },
  ): Promise<boolean> {
    try {
      // Validate access
      const accessCheck = await this.securityPolicy.checkStateAccess(
        options.deletedBy,
        key,
        'delete',
        options.tenantId,
      );

      if (!accessCheck.allowed) {
        this.logger.warn('State deletion denied', {
          key,
          tenantId: options.tenantId,
          deletedBy: options.deletedBy,
          reason: accessCheck.reason,
        });
        return false;
      }

      const stateKey = this.getStateKey(key, options.tenantId);
      const existingState = this.stateStore.get(stateKey);

      if (!existingState) {
        return true; // Already deleted
      }

      // Remove from store
      this.stateStore.delete(stateKey);

      // Add to history
      this.addToHistory(
        key,
        options.tenantId,
        undefined,
        existingState.version + 1,
        options.deletedBy,
        StateChangeType.DELETE,
        existingState.metadata,
      );

      // Notify subscribers
      this.notifySubscribers(key, options.tenantId, undefined, existingState.value, {
        key,
        tenantId: options.tenantId,
        version: existingState.version + 1,
        timestamp: new Date(),
        modifiedBy: options.deletedBy,
        changeType: StateChangeType.DELETE,
      });

      // Update metrics
      this.updateMetrics('delete');

      // Emit event
      this.emit('stateDeleted', {
        key,
        tenantId: options.tenantId,
        deletedBy: options.deletedBy,
      });

      this.logger.info('State deleted successfully', {
        key,
        tenantId: options.tenantId,
        deletedBy: options.deletedBy,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to delete state', {
        error: error.message,
        key,
        tenantId: options.tenantId,
      });
      this.updateMetrics('error');
      return false;
    }
  }

  // ===== SUBSCRIPTION MANAGEMENT =====

  /**
   * Subscribe to state changes
   */
  public subscribeToState<T>(
    key: string,
    callback: StateCallback<T>,
    options: {
      tenantId?: string;
      subscriberId: string;
      filter?: StateFilter;
    },
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: StateSubscription = {
      id: subscriptionId,
      key,
      tenantId: options.tenantId,
      callback: callback as StateCallback,
      filter: options.filter,
      isActive: true,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.updateMetrics('subscription');

    this.logger.info('State subscription created', {
      subscriptionId,
      key,
      tenantId: options.tenantId,
      subscriberId: options.subscriberId,
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from state changes
   */
  public unsubscribeFromState(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    subscription.isActive = false;
    this.subscriptions.delete(subscriptionId);

    this.logger.info('State subscription removed', {
      subscriptionId,
      key: subscription.key,
      tenantId: subscription.tenantId,
    });

    return true;
  }

  // ===== UTILITY METHODS =====

  /**
   * Get all states for a tenant
   */
  public getTenantStates(tenantId: string): Map<string, StateValue> {
    const tenantStates = new Map<string, StateValue>();

    for (const [key, value] of this.stateStore.entries()) {
      if (value.tenantId === tenantId) {
        const cleanKey = this.getCleanKey(key, tenantId);
        tenantStates.set(cleanKey, value);
      }
    }

    return tenantStates;
  }

  /**
   * Get state history
   */
  public getStateHistory(
    key: string,
    options: {
      tenantId?: string;
      limit?: number;
      since?: Date;
    } = {},
  ): StateHistory[] {
    const stateKey = this.getStateKey(key, options.tenantId);
    const history = this.stateHistory.filter(
      (h) => h.key === key && h.tenantId === options.tenantId,
    );

    if (options.since) {
      return history.filter((h) => h.timestamp >= options.since!);
    }

    if (options.limit) {
      return history.slice(-options.limit);
    }

    return history;
  }

  /**
   * Get state metrics
   */
  public getMetrics(): StateMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detailed metrics for monitoring and debugging
   */
  public getDetailedMetrics(): {
    metrics: StateMetrics;
    performanceMetrics: Record<string, any>;
    errorMetrics: Record<string, any>;
  } {
    return {
      metrics: this.metrics,
      performanceMetrics: {
        averageResponseTime: this.calculateAverageResponseTime(),
        throughput: this.calculateThroughput(),
        memoryEfficiency: this.calculateMemoryEfficiency(),
      },
      errorMetrics: {
        totalErrors: this.metrics.errorRate,
        errorRate: this.calculateErrorRate(),
        lastError: this.getLastError(),
      },
    };
  }

  /**
   * Clear expired states
   */
  public async clearExpiredStates(): Promise<number> {
    let clearedCount = 0;
    const now = new Date();

    for (const [key, state] of this.stateStore.entries()) {
      if (state.metadata.ttl && this.isExpired(state)) {
        const cleanKey = this.getCleanKey(key, state.tenantId);
        await this.deleteState(cleanKey, {
          tenantId: state.tenantId,
          deletedBy: 'system',
        });
        clearedCount++;
      }
    }

    this.logger.info('Expired states cleared', { clearedCount });
    return clearedCount;
  }

  /**
   * Export state for backup
   */
  public exportState(tenantId?: string): Record<string, StateValue> {
    const exportData: Record<string, StateValue> = {};

    for (const [key, value] of this.stateStore.entries()) {
      if (!tenantId || value.tenantId === tenantId) {
        const cleanKey = this.getCleanKey(key, value.tenantId);
        exportData[cleanKey] = value;
      }
    }

    return exportData;
  }

  /**
   * Import state from backup
   */
  public async importState(
    stateData: Record<string, StateValue>,
    options: {
      tenantId?: string;
      importedBy: string;
      overwrite?: boolean;
    },
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const [key, stateValue] of Object.entries(stateData)) {
      try {
        const existingState = this.stateStore.get(this.getStateKey(key, options.tenantId));

        if (existingState && !options.overwrite) {
          failed++;
          continue;
        }

        const result = await this.setState(key, stateValue.value, {
          tenantId: options.tenantId || stateValue.tenantId,
          modifiedBy: options.importedBy,
          metadata: stateValue.metadata || undefined,
        });

        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        this.logger.error('Failed to import state', {
          error: error.message,
          key,
          tenantId: options.tenantId,
        });
      }
    }

    this.logger.info('State import completed', { success, failed });
    return { success, failed };
  }

  // ===== PRIVATE HELPER METHODS =====

  private getStateKey(key: string, tenantId?: string): string {
    return tenantId ? `${tenantId}:${key}` : `global:${key}`;
  }

  private getCleanKey(stateKey: string, tenantId?: string): string {
    const prefix = tenantId ? `${tenantId}:` : 'global:';
    return stateKey.replace(prefix, '');
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isExpired(state: StateValue): boolean {
    if (!state.metadata.ttl) return false;
    const now = new Date();
    const expiryTime = new Date(state.lastModified.getTime() + state.metadata.ttl);
    return now > expiryTime;
  }

  private addToHistory(
    key: string,
    tenantId: string | undefined,
    value: any,
    version: number,
    modifiedBy: string,
    changeType: StateChangeType,
    metadata: StateMetadata,
  ): void {
    const historyEntry: StateHistory = {
      key,
      tenantId,
      value,
      version,
      timestamp: new Date(),
      modifiedBy,
      changeType,
      metadata,
    };

    this.stateHistory.push(historyEntry);

    // Keep only last 1000 history entries
    if (this.stateHistory.length > 1000) {
      this.stateHistory = this.stateHistory.slice(-1000);
    }
  }

  private notifySubscribers(
    key: string,
    tenantId: string | undefined,
    newValue: any,
    oldValue: any,
    metadata: StateChangeMetadata,
  ): void {
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.isActive) continue;
      if (subscription.key !== key) continue;
      if (subscription.tenantId !== tenantId) continue;

      // Apply filter if specified
      if (subscription.filter) {
        if (!this.matchesFilter(newValue, subscription.filter)) continue;
      }

      try {
        subscription.callback(newValue, oldValue, metadata);
      } catch (error) {
        this.logger.error('Subscription callback error', {
          error: error.message,
          subscriptionId: subscription.id,
          key,
        });
      }
    }
  }

  private matchesFilter(value: any, filter: StateFilter): boolean {
    if (filter.valueType && typeof value !== filter.valueType) {
      return false;
    }

    if (filter.modifiedAfter && new Date() < filter.modifiedAfter) {
      return false;
    }

    // Add more filter logic as needed
    return true;
  }

  private async encryptValue(value: any, encryption: EncryptionConfig): Promise<any> {
    // Implement encryption logic
    // For now, return as-is
    return value;
  }

  private async decryptValue(value: any, encryption: EncryptionConfig): Promise<any> {
    // Implement decryption logic
    // For now, return as-is
    return value;
  }

  private updateMetrics(operation: 'set' | 'get' | 'delete' | 'subscription' | 'error'): void {
    this.changeCount++;
    const now = Date.now();
    const timeDiff = now - this.lastChangeTime;

    if (timeDiff > 0) {
      this.metrics.stateChangesPerSecond = this.changeCount / (timeDiff / 1000);
    }

    if (operation === 'error') {
      this.metrics.errorRate = this.metrics.errorRate * 0.9 + 0.1;
    }

    this.metrics.totalStates = this.stateStore.size;
    this.metrics.totalSubscriptions = this.subscriptions.size;
    this.metrics.activeSubscriptions = Array.from(this.subscriptions.values()).filter(
      (s) => s.isActive,
    ).length;

    // Calculate average state size
    let totalSize = 0;
    for (const state of this.stateStore.values()) {
      totalSize += JSON.stringify(state.value).length;
    }
    this.metrics.averageStateSize = this.stateStore.size > 0 ? totalSize / this.stateStore.size : 0;

    // Estimate memory usage
    this.metrics.memoryUsage = process.memoryUsage().heapUsed;
  }

  private startMetricsCollection(): void {
    // Update metrics every 5 seconds
    setInterval(() => {
      this.updateMetrics('get');
    }, 5000);
  }

  private startCleanupProcess(): void {
    // Clear expired states every minute
    setInterval(() => {
      this.clearExpiredStates();
    }, 60 * 1000);
  }
}

// ===== EXPORTS =====

export default StateManager;
