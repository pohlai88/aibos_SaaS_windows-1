// ==================== AI-BOS WEBHOOK NOTIFICATION SYSTEM ====================
// Event-Driven Webhook Notifications for Real-Time Updates
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';

// ==================== CORE TYPES ====================
export type WebhookEvent =
  | 'version_created' | 'version_updated' | 'version_approved' | 'version_deployed' | 'version_rolled_back'
  | 'manifest_created' | 'manifest_submitted' | 'manifest_approved' | 'manifest_rejected' | 'manifest_deployed'
  | 'migration_started' | 'migration_completed' | 'migration_failed' | 'migration_rolled_back'
  | 'audit_event' | 'security_alert' | 'compliance_violation' | 'performance_alert';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  lastError?: string;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: Date;
  data: any;
  metadata: WebhookMetadata;
  signature?: string;
}

export interface WebhookMetadata {
  source: string;
  version: string;
  requestId: string;
  userId?: string;
  tenantId?: string;
  organizationId?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  url: string;
  payload: WebhookPayload;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface WebhookStats {
  totalWebhooks: number;
  activeWebhooks: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  averageResponseTime: number;
  eventsByType: Record<WebhookEvent, number>;
}

// ==================== WEBHOOK MANAGER ====================
export class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private eventQueue: WebhookPayload[] = [];
  private isProcessing = false;
  private retryDelays = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff

  constructor() {
    console.log('🔔 AI-BOS Webhook Manager: Initialized');
    this.startProcessing();
  }

  /**
   * Register a new webhook
   */
  async registerWebhook(config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt' | 'successCount' | 'failureCount'>): Promise<WebhookConfig> {
    const webhook: WebhookConfig = {
      ...config,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      successCount: 0,
      failureCount: 0
    };

    this.webhooks.set(webhook.id, webhook);

    console.log(`✅ Webhook registered: ${webhook.name} (${webhook.url})`);

    return webhook;
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig | null> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const updatedWebhook: WebhookConfig = {
      ...webhook,
      ...updates,
      updatedAt: new Date()
    };

    this.webhooks.set(id, updatedWebhook);

    console.log(`✅ Webhook updated: ${updatedWebhook.name}`);

    return updatedWebhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<boolean> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      return false;
    }

    this.webhooks.delete(id);

    console.log(`✅ Webhook deleted: ${webhook.name}`);

    return true;
  }

  /**
   * Get webhook by ID
   */
  getWebhook(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Get all webhooks
   */
  getAllWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhooks by event
   */
  getWebhooksByEvent(event: WebhookEvent): WebhookConfig[] {
    return Array.from(this.webhooks.values()).filter(webhook =>
      webhook.active && webhook.events.includes(event)
    );
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: WebhookEvent, data: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    const webhooks = this.getWebhooksByEvent(event);

    if (webhooks.length === 0) {
      console.log(`ℹ️ No webhooks registered for event: ${event}`);
      return;
    }

    const payload: WebhookPayload = {
      id: uuidv4(),
      event,
      timestamp: new Date(),
      data,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };

    // Add signature if secret is provided
    for (const webhook of webhooks) {
      if (webhook.secret) {
        payload.signature = this.generateSignature(payload, webhook.secret);
      }

      await this.queueDelivery(webhook, payload);
    }

    console.log(`🔔 Event triggered: ${event} -> ${webhooks.length} webhooks`);
  }

  /**
   * Queue webhook delivery
   */
  private async queueDelivery(webhook: WebhookConfig, payload: WebhookPayload): Promise<void> {
    const delivery: WebhookDelivery = {
      id: uuidv4(),
      webhookId: webhook.id,
      event: payload.event,
      url: webhook.url,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: webhook.retries || 3,
      createdAt: new Date()
    };

    this.deliveries.set(delivery.id, delivery);
    this.eventQueue.push(payload);

    console.log(`📤 Webhook queued: ${webhook.name} -> ${webhook.url}`);
  }

  /**
   * Start processing webhook queue
   */
  private startProcessing(): void {
    setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processQueue();
      }
    }, 1000); // Check every second
  }

  /**
   * Process webhook queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const payload = this.eventQueue.shift();
        if (!payload) continue;

        const deliveries = this.getDeliveriesByPayloadId(payload.id);

        for (const delivery of deliveries) {
          await this.processDelivery(delivery);
        }
      }
    } catch (error) {
      console.error('❌ Webhook queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual delivery
   */
  private async processDelivery(delivery: WebhookDelivery): Promise<void> {
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook || !webhook.active) {
      delivery.status = 'failed';
      delivery.error = 'Webhook not found or inactive';
      return;
    }

    // Check if we should retry
    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = 'failed';
      delivery.error = 'Max retry attempts exceeded';
      this.updateWebhookStats(webhook, false);
      return;
    }

    delivery.attempts++;
    delivery.lastAttempt = new Date();
    delivery.status = 'retrying';

    try {
      const response = await this.sendWebhook(delivery, webhook);

      if (response.status >= 200 && response.status < 300) {
        delivery.status = 'delivered';
        delivery.deliveredAt = new Date();
        delivery.responseStatus = response.status;
        delivery.responseBody = response.data;
        this.updateWebhookStats(webhook, true);

        console.log(`✅ Webhook delivered: ${webhook.name} (${response.status})`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      delivery.responseStatus = error instanceof Error && 'response' in error ?
        (error as any).response?.status : undefined;
      delivery.responseBody = error instanceof Error && 'response' in error ?
        (error as any).response?.data : undefined;

      // Schedule retry
      const retryDelay = this.retryDelays[Math.min(delivery.attempts - 1, this.retryDelays.length - 1)];
      delivery.nextAttempt = new Date(Date.now() + retryDelay);

      console.log(`❌ Webhook delivery failed: ${webhook.name} (attempt ${delivery.attempts}/${delivery.maxAttempts})`);
    }
  }

  /**
   * Send webhook HTTP request
   */
  private async sendWebhook(delivery: WebhookDelivery, webhook: WebhookConfig): Promise<AxiosResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AI-BOS-Webhook/1.0',
      'X-Webhook-Event': delivery.event,
      'X-Webhook-ID': delivery.id,
      'X-Webhook-Timestamp': delivery.payload.timestamp.toISOString(),
      ...webhook.headers
    };

    // Add signature header if secret is provided
    if (webhook.secret && delivery.payload.signature) {
      headers['X-Webhook-Signature'] = delivery.payload.signature;
    }

    return axios.post(webhook.url, delivery.payload, {
      headers,
      timeout: webhook.timeout || 10000,
      validateStatus: () => true // Don't throw on non-2xx status codes
    });
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Update webhook statistics
   */
  private updateWebhookStats(webhook: WebhookConfig, success: boolean): void {
    if (success) {
      webhook.successCount++;
      webhook.lastTriggered = new Date();
    } else {
      webhook.failureCount++;
    }

    webhook.updatedAt = new Date();
  }

  /**
   * Get deliveries by payload ID
   */
  private getDeliveriesByPayloadId(payloadId: string): WebhookDelivery[] {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.payload.id === payloadId
    );
  }

  /**
   * Get delivery by ID
   */
  getDelivery(id: string): WebhookDelivery | undefined {
    return this.deliveries.get(id);
  }

  /**
   * Get all deliveries
   */
  getAllDeliveries(): WebhookDelivery[] {
    return Array.from(this.deliveries.values());
  }

  /**
   * Get deliveries by webhook ID
   */
  getDeliveriesByWebhook(webhookId: string): WebhookDelivery[] {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.webhookId === webhookId
    );
  }

  /**
   * Get webhook statistics
   */
  getStats(): WebhookStats {
    const webhooks = Array.from(this.webhooks.values());
    const deliveries = Array.from(this.deliveries.values());

    const eventsByType: Record<WebhookEvent, number> = {} as Record<WebhookEvent, number>;
    const allEvents: WebhookEvent[] = [
      'version_created', 'version_updated', 'version_approved', 'version_deployed', 'version_rolled_back',
      'manifest_created', 'manifest_submitted', 'manifest_approved', 'manifest_rejected', 'manifest_deployed',
      'migration_started', 'migration_completed', 'migration_failed', 'migration_rolled_back',
      'audit_event', 'security_alert', 'compliance_violation', 'performance_alert'
    ];

    allEvents.forEach(event => {
      eventsByType[event] = deliveries.filter(d => d.event === event).length;
    });

    const successfulDeliveries = deliveries.filter(d => d.status === 'delivered');
    const failedDeliveries = deliveries.filter(d => d.status === 'failed');
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending' || d.status === 'retrying');

    const responseTimes = successfulDeliveries
      .filter(d => d.deliveredAt && d.lastAttempt)
      .map(d => d.deliveredAt!.getTime() - d.lastAttempt!.getTime());

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(w => w.active).length,
      totalDeliveries: deliveries.length,
      successfulDeliveries: successfulDeliveries.length,
      failedDeliveries: failedDeliveries.length,
      pendingDeliveries: pendingDeliveries.length,
      averageResponseTime,
      eventsByType
    };
  }

  /**
   * Retry failed deliveries
   */
  async retryFailedDeliveries(): Promise<number> {
    const failedDeliveries = Array.from(this.deliveries.values()).filter(
      delivery => delivery.status === 'failed' && delivery.attempts < delivery.maxAttempts
    );

    for (const delivery of failedDeliveries) {
      delivery.status = 'pending';
      delivery.nextAttempt = undefined;
      this.eventQueue.push(delivery.payload);
    }

    console.log(`🔄 Retrying ${failedDeliveries.length} failed deliveries`);

    return failedDeliveries.length;
  }

  /**
   * Clean up old deliveries
   */
  async cleanupOldDeliveries(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const oldDeliveries = Array.from(this.deliveries.values()).filter(
      delivery => delivery.createdAt < cutoffDate
    );

    for (const delivery of oldDeliveries) {
      this.deliveries.delete(delivery.id);
    }

    console.log(`🧹 Cleaned up ${oldDeliveries.length} old deliveries`);

    return oldDeliveries.length;
  }

  /**
   * Health check
   */
  healthCheck(): {
    status: string;
    webhooks: number;
    activeWebhooks: number;
    queueLength: number;
    processing: boolean;
    stats: WebhookStats;
  } {
    return {
      status: 'healthy',
      webhooks: this.webhooks.size,
      activeWebhooks: Array.from(this.webhooks.values()).filter(w => w.active).length,
      queueLength: this.eventQueue.length,
      processing: this.isProcessing,
      stats: this.getStats()
    };
  }
}

// ==================== WEBHOOK EVENTS ====================
export class WebhookEvents {
  constructor(private webhookManager: WebhookManager) {}

  /**
   * Version created event
   */
  async versionCreated(version: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('version_created', { version }, metadata);
  }

  /**
   * Version updated event
   */
  async versionUpdated(version: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('version_updated', { version }, metadata);
  }

  /**
   * Version approved event
   */
  async versionApproved(version: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('version_approved', { version }, metadata);
  }

  /**
   * Version deployed event
   */
  async versionDeployed(version: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('version_deployed', { version }, metadata);
  }

  /**
   * Version rolled back event
   */
  async versionRolledBack(version: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('version_rolled_back', { version }, metadata);
  }

  /**
   * Manifest created event
   */
  async manifestCreated(manifest: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('manifest_created', { manifest }, metadata);
  }

  /**
   * Manifest submitted event
   */
  async manifestSubmitted(manifest: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('manifest_submitted', { manifest }, metadata);
  }

  /**
   * Manifest approved event
   */
  async manifestApproved(manifest: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('manifest_approved', { manifest }, metadata);
  }

  /**
   * Manifest rejected event
   */
  async manifestRejected(manifest: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('manifest_rejected', { manifest }, metadata);
  }

  /**
   * Manifest deployed event
   */
  async manifestDeployed(manifest: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('manifest_deployed', { manifest }, metadata);
  }

  /**
   * Migration started event
   */
  async migrationStarted(migration: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('migration_started', { migration }, metadata);
  }

  /**
   * Migration completed event
   */
  async migrationCompleted(migration: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('migration_completed', { migration }, metadata);
  }

  /**
   * Migration failed event
   */
  async migrationFailed(migration: any, error: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('migration_failed', { migration, error }, metadata);
  }

  /**
   * Migration rolled back event
   */
  async migrationRolledBack(migration: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('migration_rolled_back', { migration }, metadata);
  }

  /**
   * Audit event
   */
  async auditEvent(audit: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('audit_event', { audit }, metadata);
  }

  /**
   * Security alert event
   */
  async securityAlert(alert: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('security_alert', { alert }, metadata);
  }

  /**
   * Compliance violation event
   */
  async complianceViolation(violation: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('compliance_violation', { violation }, metadata);
  }

  /**
   * Performance alert event
   */
  async performanceAlert(alert: any, metadata: Omit<WebhookMetadata, 'timestamp'>): Promise<void> {
    await this.webhookManager.triggerEvent('performance_alert', { alert }, metadata);
  }
}

// ==================== EXPORT ====================
export default WebhookManager;
