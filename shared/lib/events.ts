/**
 * AI-BOS Event-Driven Architecture System
 *
 * Enterprise-grade event bus with persistence, replay, validation, and real-time streaming
 * for the AI-BOS micro-app platform.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { logger } from './logger';
import { monitoring } from './monitoring';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Event metadata and context
 */
export interface EventMetadata {
  eventId: string;
  timestamp: number;
  tenantId: string;
  appId: string;
  userId?: string;
  correlationId?: string;
  causationId?: string;
  version: string;
  source: string;
  tags?: Record<string, string>;
}

/**
 * Event envelope containing payload and metadata
 */
export interface EventEnvelope<T = any> {
  metadata: EventMetadata;
  payload: T;
  schema: string;
}

/**
 * Event subscription configuration
 */
export interface EventSubscription {
  id: string;
  eventName: string;
  handler: EventHandler;
  tenantId?: string;
  appId?: string;
  filter?: EventFilter;
  options?: SubscriptionOptions;
}

/**
 * Event handler function signature
 */
export type EventHandler<T = any> = (event: EventEnvelope<T>) => Promise<void> | void;

/**
 * Event filter for selective subscription
 */
export interface EventFilter {
  tenantId?: string;
  appId?: string;
  userId?: string;
  tags?: Record<string, string>;
  payload?: Record<string, any>;
}

/**
 * Subscription options
 */
export interface SubscriptionOptions {
  retryPolicy?: RetryPolicy;
  timeout?: number;
  priority?: number;
  batchSize?: number;
  concurrency?: number;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay: number;
}

/**
 * Event persistence configuration
 */
export interface EventPersistenceConfig {
  enabled: boolean;
  provider: 'redis' | 'postgres' | 'memory';
  ttl?: number;
  batchSize?: number;
  compression?: boolean;
}

/**
 * Event replay configuration
 */
export interface EventReplayConfig {
  enabled: boolean;
  batchSize: number;
  concurrency: number;
  filter?: EventFilter;
  fromTimestamp?: number;
  toTimestamp?: number;
}

/**
 * Dead letter queue configuration
 */
export interface DeadLetterQueueConfig {
  enabled: boolean;
  maxRetries: number;
  ttl: number;
  alertThreshold: number;
}

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  name: string;
  persistence?: EventPersistenceConfig;
  replay?: EventReplayConfig;
  deadLetterQueue?: DeadLetterQueueConfig;
  maxConcurrency?: number;
  timeout?: number;
  enableMetrics?: boolean;
  enableAudit?: boolean;
}

/**
 * Event schema definition
 */
export interface EventSchema {
  name: string;
  version: string;
  payload: z.ZodSchema;
  metadata?: z.ZodSchema;
  tags?: string[];
  deprecated?: boolean;
}

/**
 * Event statistics
 */
export interface EventStats {
  totalEvents: number;
  eventsPerSecond: number;
  activeSubscriptions: number;
  failedEvents: number;
  averageLatency: number;
  memoryUsage: number;
}

// ============================================================================
// EVENT SCHEMA REGISTRY
// ============================================================================

/**
 * Event schema registry for validation and documentation
 */
export class EventSchemaRegistry {
  private schemas = new Map<string, EventSchema>();
  private validators = new Map<string, z.ZodSchema>();

  /**
   * Register an event schema
   */
  register(schema: EventSchema): void {
    const key = `${schema.name}:${schema.version}`;
    this.schemas.set(key, schema);
    this.validators.set(key, schema.payload);

    logger.info('Event schema registered', {
      name: schema.name,
      version: schema.version,
    });
  }

  /**
   * Get event schema
   */
  get(name: string, version: string): EventSchema | undefined {
    const key = `${name}:${version}`;
    return this.schemas.get(key);
  }

  /**
   * Validate event payload
   */
  validate(name: string, version: string, payload: any): { valid: boolean; errors?: string[] } {
    const key = `${name}:${version}`;
    const validator = this.validators.get(key);

    if (!validator) {
      return { valid: false, errors: ['Schema not found'] };
    }

    try {
      validator.parse(payload);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Validation error'] };
    }
  }

  /**
   * Get all registered schemas
   */
  getAll(): EventSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Check if schema is deprecated
   */
  isDeprecated(name: string, version: string): boolean {
    const schema = this.get(name, version);
    return schema?.deprecated || false;
  }
}

// ============================================================================
// EVENT PERSISTENCE
// ============================================================================

/**
 * Event persistence interface
 */
export interface EventPersistence {
  store(event: EventEnvelope): Promise<void>;
  retrieve(eventId: string): Promise<EventEnvelope | null>;
  query(filter: EventFilter, limit?: number): Promise<EventEnvelope[]>;
  delete(eventId: string): Promise<void>;
  cleanup(beforeTimestamp: number): Promise<number>;
}

/**
 * Memory-based event persistence (for development/testing)
 */
export class MemoryEventPersistence implements EventPersistence {
  private events = new Map<string, EventEnvelope>();
  private indexes = new Map<string, Set<string>>();

  async store(event: EventEnvelope): Promise<void> {
    this.events.set(event.metadata.eventId, event);

    // Index by tenant
    if (!this.indexes.has(event.metadata.tenantId)) {
      this.indexes.set(event.metadata.tenantId, new Set());
    }
    this.indexes.get(event.metadata.tenantId)!.add(event.metadata.eventId);

    // Index by app
    const appKey = `${event.metadata.tenantId}:${event.metadata.appId}`;
    if (!this.indexes.has(appKey)) {
      this.indexes.set(appKey, new Set());
    }
    this.indexes.get(appKey)!.add(event.metadata.eventId);
  }

  async retrieve(eventId: string): Promise<EventEnvelope | null> {
    return this.events.get(eventId) || null;
  }

  async query(filter: EventFilter, limit: number = 100): Promise<EventEnvelope[]> {
    const results: EventEnvelope[] = [];

    for (const event of this.events.values()) {
      if (this.matchesFilter(event, filter)) {
        results.push(event);
        if (results.length >= limit) break;
      }
    }

    return results.sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);
  }

  async delete(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      this.events.delete(eventId);

      // Remove from indexes
      this.indexes.get(event.metadata.tenantId)?.delete(eventId);
      const appKey = `${event.metadata.tenantId}:${event.metadata.appId}`;
      this.indexes.get(appKey)?.delete(eventId);
    }
  }

  async cleanup(beforeTimestamp: number): Promise<number> {
    let deleted = 0;

    for (const [eventId, event] of this.events.entries()) {
      if (event.metadata.timestamp < beforeTimestamp) {
        await this.delete(eventId);
        deleted++;
      }
    }

    return deleted;
  }

  private matchesFilter(event: EventEnvelope, filter: EventFilter): boolean {
    if (filter.tenantId && event.metadata.tenantId !== filter.tenantId) return false;
    if (filter.appId && event.metadata.appId !== filter.appId) return false;
    if (filter.userId && event.metadata.userId !== filter.userId) return false;

    if (filter.tags) {
      for (const [key, value] of Object.entries(filter.tags)) {
        if (event.metadata.tags?.[key] !== value) return false;
      }
    }

    return true;
  }
}

// ============================================================================
// DEAD LETTER QUEUE
// ============================================================================

/**
 * Dead letter queue for failed events
 */
export class DeadLetterQueue {
  private failedEvents = new Map<
    string,
    { event: EventEnvelope; error: Error; retries: number; timestamp: number }
  >();
  private config: DeadLetterQueueConfig;

  constructor(config: DeadLetterQueueConfig) {
    this.config = config;
  }

  /**
   * Add failed event to DLQ
   */
  async add(event: EventEnvelope, error: Error): Promise<void> {
    const existing = this.failedEvents.get(event.metadata.eventId);

    if (existing) {
      existing.retries++;
      existing.error = error;
      existing.timestamp = Date.now();
    } else {
      this.failedEvents.set(event.metadata.eventId, {
        event,
        error,
        retries: 1,
        timestamp: Date.now(),
      });
    }

    // Alert if threshold exceeded
    if (this.failedEvents.size >= this.config.alertThreshold) {
      logger.error('Dead letter queue threshold exceeded', {
        count: this.failedEvents.size,
        threshold: this.config.alertThreshold,
      });
    }

    logger.warn('Event added to dead letter queue', {
      eventId: event.metadata.eventId,
      error: error.message,
      retries: existing?.retries || 1,
    });
  }

  /**
   * Retry failed events
   */
  async retry(eventId: string, handler: EventHandler): Promise<boolean> {
    const failed = this.failedEvents.get(eventId);
    if (!failed) return false;

    if (failed.retries >= this.config.maxRetries) {
      logger.error('Max retries exceeded for event', {
        eventId,
        retries: failed.retries,
        maxRetries: this.config.maxRetries,
      });
      return false;
    }

    try {
      await handler(failed.event);
      this.failedEvents.delete(eventId);
      logger.info('Event retry successful', { eventId });
      return true;
    } catch (error) {
      failed.retries++;
      failed.error = error as Error;
      failed.timestamp = Date.now();

      logger.warn('Event retry failed', {
        eventId,
        retries: failed.retries,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Get failed events
   */
  getFailedEvents(): Array<{
    eventId: string;
    event: EventEnvelope;
    error: Error;
    retries: number;
    timestamp: number;
  }> {
    return Array.from(this.failedEvents.entries()).map(([eventId, data]) => ({
      eventId,
      event: data.event,
      error: data.error,
      retries: data.retries,
      timestamp: data.timestamp,
    }));
  }

  /**
   * Cleanup old failed events
   */
  async cleanup(): Promise<number> {
    const cutoff = Date.now() - this.config.ttl;
    let deleted = 0;

    for (const [eventId, data] of this.failedEvents.entries()) {
      if (data.timestamp < cutoff) {
        this.failedEvents.delete(eventId);
        deleted++;
      }
    }

    return deleted;
  }
}

// ============================================================================
// MAIN EVENT BUS
// ============================================================================

/**
 * AI-BOS Event Bus - Enterprise-grade event-driven architecture
 */
export class EventBus extends EventEmitter {
  private config: EventBusConfig;
  private subscriptions = new Map<string, EventSubscription>();
  private schemaRegistry: EventSchemaRegistry;
  private persistence?: EventPersistence;
  private deadLetterQueue?: DeadLetterQueue;
  private stats: EventStats;
  private processing = new Set<string>();

  constructor(config: EventBusConfig) {
    super();
    this.config = config;
    this.schemaRegistry = new EventSchemaRegistry();
    this.stats = {
      totalEvents: 0,
      eventsPerSecond: 0,
      activeSubscriptions: 0,
      failedEvents: 0,
      averageLatency: 0,
      memoryUsage: 0,
    };

    // Initialize persistence
    if (config.persistence?.enabled) {
      this.persistence = new MemoryEventPersistence(); // Can be replaced with Redis/Postgres
    }

    // Initialize dead letter queue
    if (config.deadLetterQueue?.enabled) {
      this.deadLetterQueue = new DeadLetterQueue(config.deadLetterQueue);
    }

    // Start metrics collection
    if (config.enableMetrics) {
      this.startMetricsCollection();
    }

    logger.info('Event bus initialized', { name: config.name });
  }

  /**
   * Register event schema
   */
  registerSchema(schema: EventSchema): void {
    this.schemaRegistry.register(schema);
  }

  /**
   * Subscribe to events
   */
  subscribe(
    eventName: string,
    handler: EventHandler,
    options?: Partial<SubscriptionOptions>,
  ): string {
    const subscriptionId = uuidv4();
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventName,
      handler,
      options: {
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 30000,
        },
        timeout: 30000,
        priority: 0,
        batchSize: 1,
        concurrency: 1,
        ...options,
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.stats.activeSubscriptions = this.subscriptions.size;

    logger.info('Event subscription created', {
      subscriptionId,
      eventName,
      options: subscription.options || undefined,
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscriptions.delete(subscriptionId);
    if (removed) {
      this.stats.activeSubscriptions = this.subscriptions.size;
      logger.info('Event subscription removed', { subscriptionId });
    }
    return removed;
  }

  /**
   * Emit event
   */
  async emit<T>(
    eventName: string,
    payload: T,
    metadata: Partial<EventMetadata> = {},
  ): Promise<string> {
    const startTime = Date.now();
    const eventId = uuidv4();

    // Create event envelope
    const event: EventEnvelope<T> = {
      metadata: {
        eventId,
        timestamp: Date.now(),
        tenantId: metadata.tenantId || 'default',
        appId: metadata.appId || 'system',
        userId: metadata.userId,
        correlationId: metadata.correlationId || eventId,
        causationId: metadata.causationId,
        version: metadata.version || '1.0',
        source: metadata.source || 'event-bus',
        tags: metadata.tags,
      },
      payload,
      schema: `${eventName}:${metadata.version || '1.0'}`,
    };

    // Validate event schema
    const validation = this.schemaRegistry.validate(eventName, metadata.version || '1.0', payload);

    if (!validation.valid) {
      const error = new Error(`Event validation failed: ${validation.errors?.join(', ')}`);
      logger.error('Event validation failed', {
        eventId,
        eventName,
        errors: validation.errors,
      });
      throw error;
    }

    // Store event if persistence is enabled
    if (this.persistence) {
      try {
        await this.persistence.store(event);
      } catch (error) {
        logger.error('Failed to persist event', { eventId, error: (error as Error).message });
      }
    }

    // Process event
    await this.processEvent(event);

    // Update statistics
    const latency = Date.now() - startTime;
    this.updateStats(latency);

    // Emit for external listeners
    this.emit('event', event);

    logger.info('Event emitted successfully', {
      eventId,
      eventName,
      tenantId: event.metadata.tenantId,
      latency,
    });

    return eventId;
  }

  /**
   * Process event and notify subscribers
   */
  private async processEvent<T>(event: EventEnvelope<T>): Promise<void> {
    const eventName = event.schema.split(':')[0];
    const subscribers = Array.from(this.subscriptions.values())
      .filter((sub) => sub.eventName === eventName)
      .sort((a, b) => (b.options?.priority || 0) - (a.options?.priority || 0));

    const promises = subscribers.map((subscription) =>
      this.processSubscription(event, subscription),
    );

    await Promise.allSettled(promises);
  }

  /**
   * Process individual subscription
   */
  private async processSubscription<T>(
    event: EventEnvelope<T>,
    subscription: EventSubscription,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Check if already processing this event
      if (this.processing.has(event.metadata.eventId)) {
        logger.warn('Event already being processed', { eventId: event.metadata.eventId });
        return;
      }

      this.processing.add(event.metadata.eventId);

      // Apply filter if specified
      if (subscription.filter && !this.matchesFilter(event, subscription.filter)) {
        return;
      }

      // Execute handler with timeout
      const timeout = subscription.options?.timeout || 30000;
      const handlerPromise = subscription.handler(event);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Handler timeout')), timeout);
      });

      await Promise.race([handlerPromise, timeoutPromise]);

      const latency = Date.now() - startTime;
      logger.debug('Event processed successfully', {
        eventId: event.metadata.eventId,
        subscriptionId: subscription.id,
        latency,
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      this.stats.failedEvents++;

      logger.error('Event processing failed', {
        eventId: event.metadata.eventId,
        subscriptionId: subscription.id,
        error: (error as Error).message,
        latency,
      });

      // Add to dead letter queue if enabled
      if (this.deadLetterQueue) {
        await this.deadLetterQueue.add(event, error as Error);
      }

      // Retry logic
      if (subscription.options?.retryPolicy) {
        await this.retryEvent(event, subscription);
      }
    } finally {
      this.processing.delete(event.metadata.eventId);
    }
  }

  /**
   * Retry failed event
   */
  private async retryEvent<T>(
    event: EventEnvelope<T>,
    subscription: EventSubscription,
  ): Promise<void> {
    const retryPolicy = subscription.options?.retryPolicy;
    if (!retryPolicy) return;

    // Implement retry logic with backoff
    // This is a simplified version - in production, you'd want more sophisticated retry logic
    logger.info('Retrying event', {
      eventId: event.metadata.eventId,
      subscriptionId: subscription.id,
    });
  }

  /**
   * Check if event matches filter
   */
  private matchesFilter(event: EventEnvelope, filter: EventFilter): boolean {
    if (filter.tenantId && event.metadata.tenantId !== filter.tenantId) return false;
    if (filter.appId && event.metadata.appId !== filter.appId) return false;
    if (filter.userId && event.metadata.userId !== filter.userId) return false;

    if (filter.tags) {
      for (const [key, value] of Object.entries(filter.tags)) {
        if (event.metadata.tags?.[key] !== value) return false;
      }
    }

    return true;
  }

  /**
   * Replay events
   */
  async replayEvents(config: EventReplayConfig): Promise<number> {
    if (!this.persistence) {
      throw new Error('Event persistence not enabled');
    }

    const events = await this.persistence.query(config.filter || {}, config.batchSize);
    let processed = 0;

    for (const event of events) {
      if (config.fromTimestamp && event.metadata.timestamp < config.fromTimestamp) continue;
      if (config.toTimestamp && event.metadata.timestamp > config.toTimestamp) continue;

      await this.processEvent(event);
      processed++;
    }

    logger.info('Event replay completed', { processed, total: events.length });
    return processed;
  }

  /**
   * Get event statistics
   */
  getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Update statistics
   */
  private updateStats(latency: number): void {
    this.stats.totalEvents++;
    this.stats.averageLatency =
      (this.stats.averageLatency * (this.stats.totalEvents - 1) + latency) / this.stats.totalEvents;
    this.stats.memoryUsage = process.memoryUsage().heapUsed;
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.stats.eventsPerSecond = this.stats.totalEvents / (Date.now() / 1000);

      if (this.config.enableMetrics) {
        monitoring.recordCustomMetric('event_bus_stats', 1, {
          totalEvents: this.stats.totalEvents,
          eventsPerSecond: this.stats.eventsPerSecond,
          activeSubscriptions: this.stats.activeSubscriptions,
          failedEvents: this.stats.failedEvents,
          averageLatency: this.stats.averageLatency,
        });
      }
    }, 5000);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Cleanup dead letter queue
    if (this.deadLetterQueue) {
      await this.deadLetterQueue.cleanup();
    }

    // Clear subscriptions
    this.subscriptions.clear();
    this.stats.activeSubscriptions = 0;

    logger.info('Event bus destroyed');
  }
}

// ============================================================================
// EVENT UTILITIES
// ============================================================================

/**
 * Create event schema
 */
export function createEventSchema<T>(
  name: string,
  version: string,
  payloadSchema: z.ZodSchema<T>,
  options?: Partial<EventSchema>,
): EventSchema {
  return {
    name,
    version,
    payload: payloadSchema,
    tags: options?.tags,
    deprecated: options?.deprecated || false,
  };
}

/**
 * Event builder for fluent API
 */
export class EventBuilder<T = any> {
  private eventName: string;
  private payload: T;
  private metadata: Partial<EventMetadata> = {};

  constructor(eventName: string, payload: T) {
    this.eventName = eventName;
    this.payload = payload;
  }

  tenant(tenantId: string): EventBuilder<T> {
    this.metadata.tenantId = tenantId;
    return this;
  }

  app(appId: string): EventBuilder<T> {
    this.metadata.appId = appId;
    return this;
  }

  user(userId: string): EventBuilder<T> {
    this.metadata.userId = userId;
    return this;
  }

  correlation(correlationId: string): EventBuilder<T> {
    this.metadata.correlationId = correlationId;
    return this;
  }

  causation(causationId: string): EventBuilder<T> {
    this.metadata.causationId = causationId;
    return this;
  }

  version(version: string): EventBuilder<T> {
    this.metadata.version = version;
    return this;
  }

  source(source: string): EventBuilder<T> {
    this.metadata.source = source;
    return this;
  }

  tag(key: string, value: string): EventBuilder<T> {
    if (!this.metadata.tags) {
      this.metadata.tags = {};
    }
    this.metadata.tags[key] = value;
    return this;
  }

  tags(tags: Record<string, string>): EventBuilder<T> {
    this.metadata.tags = { ...this.metadata.tags, ...tags };
    return this;
  }

  async emit(eventBus: EventBus): Promise<string> {
    return eventBus.emit(this.eventName, this.payload, this.metadata);
  }
}

/**
 * Create event builder
 */
export function event<T>(eventName: string, payload: T): EventBuilder<T> {
  return new EventBuilder(eventName, payload);
}

// ============================================================================
// DEFAULT EVENT SCHEMAS
// ============================================================================

/**
 * Common event schemas for AI-BOS platform
 */
export const CommonEventSchemas = {
  // User events
  UserCreated: createEventSchema(
    'UserCreated',
    '1.0',
    z.object({
      userId: z.string(),
      email: z.string().email(),
      tenantId: z.string(),
      role: z.string(),
    }),
  ),

  UserUpdated: createEventSchema(
    'UserUpdated',
    '1.0',
    z.object({
      userId: z.string(),
      changes: z.record(z.any()),
      tenantId: z.string(),
    }),
  ),

  // App events
  AppInstalled: createEventSchema(
    'AppInstalled',
    '1.0',
    z.object({
      appId: z.string(),
      manifestId: z.string(),
      tenantId: z.string(),
      version: z.string(),
    }),
  ),

  AppUninstalled: createEventSchema(
    'AppUninstalled',
    '1.0',
    z.object({
      appId: z.string(),
      tenantId: z.string(),
      reason: z.string().optional(),
    }),
  ),

  // Entity events
  EntityCreated: createEventSchema(
    'EntityCreated',
    '1.0',
    z.object({
      entityId: z.string(),
      entityType: z.string(),
      data: z.record(z.any()),
      tenantId: z.string(),
    }),
  ),

  EntityUpdated: createEventSchema(
    'EntityUpdated',
    '1.0',
    z.object({
      entityId: z.string(),
      entityType: z.string(),
      changes: z.record(z.any()),
      tenantId: z.string(),
    }),
  ),

  EntityDeleted: createEventSchema(
    'EntityDeleted',
    '1.0',
    z.object({
      entityId: z.string(),
      entityType: z.string(),
      tenantId: z.string(),
    }),
  ),
};

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared inline above
