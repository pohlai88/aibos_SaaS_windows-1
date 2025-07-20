/**
 * Event System Tests
 *
 * Comprehensive test suite for the AI-BOS event-driven architecture
 */

import {
  EventBus,
  EventSchemaRegistry,
  DeadLetterQueue,
  MemoryEventPersistence,
  createEventSchema,
  event,
  CommonEventSchemas,
} from '../lib/events';
import type { EventBusConfig, EventEnvelope, EventMetadata } from '../lib/events';
import { z } from 'zod';

describe('Event System', () => {
  let eventBus: EventBus;
  let schemaRegistry: EventSchemaRegistry;
  let deadLetterQueue: DeadLetterQueue;
  let persistence: MemoryEventPersistence;

  beforeEach(() => {
    const config: EventBusConfig = {
      name: 'test-event-bus',
      persistence: {
        enabled: true,
        provider: 'memory',
      },
      deadLetterQueue: {
        enabled: true,
        maxRetries: 3,
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        alertThreshold: 10,
      },
      enableMetrics: true,
      enableAudit: true,
    };

    eventBus = new EventBus(config);
    schemaRegistry = new EventSchemaRegistry();
    deadLetterQueue = new DeadLetterQueue(config.deadLetterQueue!);
    persistence = new MemoryEventPersistence();

    // Register default test schema
    const testSchema = createEventSchema(
      'TestEvent',
      '1.0',
      z.object({
        message: z.string().optional(),
        timestamp: z.number().optional(),
      }),
    );
    eventBus.registerSchema(testSchema);
  });

  afterEach(async () => {
    await eventBus.destroy();
  });

  describe('Event Schema Registry', () => {
    it('should register and retrieve schemas', () => {
      const schema = createEventSchema(
        'TestEvent',
        '1.0',
        z.object({
          message: z.string(),
          timestamp: z.number(),
        }),
      );

      schemaRegistry.register(schema);
      const retrieved = schemaRegistry.get('TestEvent', '1.0');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('TestEvent');
      expect(retrieved?.version).toBe('1.0');
    });

    it('should validate event payloads', () => {
      const schema = createEventSchema(
        'TestEvent',
        '1.0',
        z.object({
          message: z.string(),
          timestamp: z.number(),
        }),
      );

      schemaRegistry.register(schema);

      const validPayload = { message: 'test', timestamp: Date.now() };
      const invalidPayload = { message: 'test' }; // missing timestamp

      const validResult = schemaRegistry.validate('TestEvent', '1.0', validPayload);
      const invalidResult = schemaRegistry.validate('TestEvent', '1.0', invalidPayload);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('timestamp: Required');
    });

    it('should handle unknown schemas', () => {
      const result = schemaRegistry.validate('UnknownEvent', '1.0', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Schema not found');
    });
  });

  describe('Event Bus', () => {
    it('should emit and handle events', async () => {
      const eventName = 'TestEvent';
      const payload = { message: 'Hello World', timestamp: Date.now() };

      let receivedEvent: EventEnvelope | null = null;

      const subscriptionId = eventBus.subscribe(eventName, (event) => {
        receivedEvent = event;
      });

      const eventId = await eventBus.emit(eventName, payload, {
        tenantId: 'test-tenant',
        userId: 'test-user',
      });

      expect(eventId).toBeDefined();
      expect(receivedEvent).toBeDefined();
      expect(receivedEvent?.payload).toEqual(payload);
      expect(receivedEvent?.metadata.tenantId).toBe('test-tenant');
      expect(receivedEvent?.metadata.userId).toBe('test-user');

      eventBus.unsubscribe(subscriptionId);
    });

    it('should handle multiple subscribers', async () => {
      const eventName = 'TestEvent';
      const payload = { message: 'Hello World' };

      const receivedEvents: EventEnvelope[] = [];

      const sub1 = eventBus.subscribe(eventName, (event) => {
        receivedEvents.push(event);
      });

      const sub2 = eventBus.subscribe(eventName, (event) => {
        receivedEvents.push(event);
      });

      await eventBus.emit(eventName, payload);

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0].payload).toEqual(payload);
      expect(receivedEvents[1].payload).toEqual(payload);

      eventBus.unsubscribe(sub1);
      eventBus.unsubscribe(sub2);
    });

    it('should handle event filters', async () => {
      const eventName = 'TestEvent';
      const payload = { message: 'Hello World' };

      let receivedCount = 0;

      // Subscribe with filter
      const subscriptionId = eventBus.subscribe(
        eventName,
        (event) => {
          receivedCount++;
        },
        {
          filter: {
            tenantId: 'specific-tenant',
          },
        },
      );

      // Emit event for different tenant
      await eventBus.emit(eventName, payload, {
        tenantId: 'other-tenant',
      });

      // Emit event for specific tenant
      await eventBus.emit(eventName, payload, {
        tenantId: 'specific-tenant',
      });

      expect(receivedCount).toBe(1);

      eventBus.unsubscribe(subscriptionId);
    });

    it('should handle event validation', async () => {
      const schema = createEventSchema(
        'ValidatedEvent',
        '1.0',
        z.object({
          message: z.string().min(1),
          count: z.number().positive(),
        }),
      );

      eventBus.registerSchema(schema);

      // Valid event
      const validPayload = { message: 'test', count: 5 };
      const validEventId = await eventBus.emit('ValidatedEvent', validPayload);
      expect(validEventId).toBeDefined();

      // Invalid event
      const invalidPayload = { message: '', count: -1 };
      await expect(eventBus.emit('ValidatedEvent', invalidPayload)).rejects.toThrow(
        'Event validation failed',
      );
    });

    it('should provide event statistics', async () => {
      const eventName = 'TestEvent';
      const payload = { message: 'test' };

      // Emit some events
      for (let i = 0; i < 5; i++) {
        await eventBus.emit(eventName, payload);
      }

      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(5);
      expect(stats.activeSubscriptions).toBe(0);
      expect(stats.averageLatency).toBeGreaterThan(0);
    });
  });

  describe('Event Persistence', () => {
    it('should store and retrieve events', async () => {
      const event: EventEnvelope = {
        metadata: {
          eventId: 'test-event-1',
          timestamp: Date.now(),
          tenantId: 'test-tenant',
          appId: 'test-app',
          version: '1.0',
          source: 'test',
        },
        payload: { message: 'test' },
        schema: 'TestEvent:1.0',
      };

      await persistence.store(event);

      const retrieved = await persistence.retrieve('test-event-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.payload).toEqual(event.payload);
    });

    it('should query events with filters', async () => {
      const events = [
        {
          metadata: {
            eventId: 'event-1',
            timestamp: Date.now(),
            tenantId: 'tenant-1',
            appId: 'app-1',
            version: '1.0',
            source: 'test',
          },
          payload: { message: 'test1' },
          schema: 'TestEvent:1.0',
        },
        {
          metadata: {
            eventId: 'event-2',
            timestamp: Date.now(),
            tenantId: 'tenant-2',
            appId: 'app-1',
            version: '1.0',
            source: 'test',
          },
          payload: { message: 'test2' },
          schema: 'TestEvent:1.0',
        },
      ];

      for (const event of events) {
        await persistence.store(event);
      }

      const results = await persistence.query({ tenantId: 'tenant-1' });
      expect(results).toHaveLength(1);
      expect(results[0].metadata.eventId).toBe('event-1');
    });

    it('should cleanup old events', async () => {
      const oldEvent: EventEnvelope = {
        metadata: {
          eventId: 'old-event',
          timestamp: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
          tenantId: 'test-tenant',
          appId: 'test-app',
          version: '1.0',
          source: 'test',
        },
        payload: { message: 'old' },
        schema: 'TestEvent:1.0',
      };

      await persistence.store(oldEvent);

      const deletedCount = await persistence.cleanup(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
      expect(deletedCount).toBe(1);

      const retrieved = await persistence.retrieve('old-event');
      expect(retrieved).toBeNull();
    });
  });

  describe('Dead Letter Queue', () => {
    it('should add failed events to DLQ', async () => {
      const event: EventEnvelope = {
        metadata: {
          eventId: 'failed-event',
          timestamp: Date.now(),
          tenantId: 'test-tenant',
          appId: 'test-app',
          version: '1.0',
          source: 'test',
        },
        payload: { message: 'failed' },
        schema: 'TestEvent:1.0',
      };

      const error = new Error('Processing failed');
      await deadLetterQueue.add(event, error);

      const failedEvents = deadLetterQueue.getFailedEvents();
      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0].eventId).toBe('failed-event');
      expect(failedEvents[0].error.message).toBe('Processing failed');
    });

    it('should retry failed events', async () => {
      const event: EventEnvelope = {
        metadata: {
          eventId: 'retry-event',
          timestamp: Date.now(),
          tenantId: 'test-tenant',
          appId: 'test-app',
          version: '1.0',
          source: 'test',
        },
        payload: { message: 'retry' },
        schema: 'TestEvent:1.0',
      };

      const error = new Error('Processing failed');
      await deadLetterQueue.add(event, error);

      let retryCount = 0;
      const handler = async () => {
        retryCount++;
        if (retryCount < 2) {
          throw new Error('Still failing');
        }
      };

      // First retry should fail
      const firstRetry = await deadLetterQueue.retry('retry-event', handler);
      expect(firstRetry).toBe(false);
      expect(retryCount).toBe(1);

      // Second retry should succeed
      const secondRetry = await deadLetterQueue.retry('retry-event', handler);
      expect(secondRetry).toBe(true);
      expect(retryCount).toBe(2);

      // Event should be removed from DLQ
      const failedEvents = deadLetterQueue.getFailedEvents();
      expect(failedEvents).toHaveLength(0);
    });

    it('should respect max retries', async () => {
      const event: EventEnvelope = {
        metadata: {
          eventId: 'max-retry-event',
          timestamp: Date.now(),
          tenantId: 'test-tenant',
          appId: 'test-app',
          version: '1.0',
          source: 'test',
        },
        payload: { message: 'max-retry' },
        schema: 'TestEvent:1.0',
      };

      const error = new Error('Processing failed');
      await deadLetterQueue.add(event, error);

      const handler = async () => {
        throw new Error('Always failing');
      };

      // Try to retry more than max retries
      for (let i = 0; i < 5; i++) {
        await deadLetterQueue.retry('max-retry-event', handler);
      }

      const failedEvents = deadLetterQueue.getFailedEvents();
      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0].retries).toBeLessThanOrEqual(3); // max retries
    });
  });

  describe('Event Builder', () => {
    it('should build events with fluent API', async () => {
      const payload = { message: 'Hello World' };

      const eventId = await event('TestEvent', payload)
        .tenant('test-tenant')
        .user('test-user')
        .correlation('test-correlation')
        .version('1.0')
        .source('test-source')
        .tag('environment', 'test')
        .emit(eventBus);

      expect(eventId).toBeDefined();

      // Verify event was emitted
      let receivedEvent: EventEnvelope | null = null;
      eventBus.subscribe('TestEvent', (event) => {
        receivedEvent = event;
      });

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent?.metadata.tenantId).toBe('test-tenant');
      expect(receivedEvent?.metadata.userId).toBe('test-user');
      expect(receivedEvent?.metadata.correlationId).toBe('test-correlation');
      expect(receivedEvent?.metadata.version).toBe('1.0');
      expect(receivedEvent?.metadata.source).toBe('test-source');
      expect(receivedEvent?.metadata.tags?.environment).toBe('test');
    });
  });

  describe('Common Event Schemas', () => {
    it('should have valid user event schemas', () => {
      const userCreatedSchema = CommonEventSchemas.UserCreated;
      expect(userCreatedSchema.name).toBe('UserCreated');
      expect(userCreatedSchema.version).toBe('1.0');

      // Test validation
      const validPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        role: 'user',
      };

      const invalidPayload = {
        userId: 'user-123',
        email: 'invalid-email',
        tenantId: 'tenant-123',
        // missing role
      };

      expect(() => userCreatedSchema.payload.parse(validPayload)).not.toThrow();
      expect(() => userCreatedSchema.payload.parse(invalidPayload)).toThrow();
    });

    it('should have valid app event schemas', () => {
      const appInstalledSchema = CommonEventSchemas.AppInstalled;
      expect(appInstalledSchema.name).toBe('AppInstalled');
      expect(appInstalledSchema.version).toBe('1.0');

      const validPayload = {
        appId: 'app-123',
        manifestId: 'manifest-123',
        tenantId: 'tenant-123',
        version: '1.0.0',
      };

      expect(() => appInstalledSchema.payload.parse(validPayload)).not.toThrow();
    });

    it('should have valid entity event schemas', () => {
      const entityCreatedSchema = CommonEventSchemas.EntityCreated;
      expect(entityCreatedSchema.name).toBe('EntityCreated');
      expect(entityCreatedSchema.version).toBe('1.0');

      const validPayload = {
        entityId: 'entity-123',
        entityType: 'User',
        data: { name: 'John Doe' },
        tenantId: 'tenant-123',
      };

      expect(() => entityCreatedSchema.payload.parse(validPayload)).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete event lifecycle', async () => {
      // Register schema
      const schema = createEventSchema(
        'LifecycleEvent',
        '1.0',
        z.object({
          step: z.string(),
          data: z.any(),
        }),
      );
      eventBus.registerSchema(schema);

      // Subscribe to events
      const receivedEvents: EventEnvelope[] = [];
      eventBus.subscribe('LifecycleEvent', (event) => {
        receivedEvents.push(event);
      });

      // Emit events
      await event('LifecycleEvent', { step: 'start', data: { id: 1 } })
        .tenant('test-tenant')
        .user('test-user')
        .emit(eventBus);

      await event('LifecycleEvent', { step: 'process', data: { id: 1, status: 'processing' } })
        .tenant('test-tenant')
        .user('test-user')
        .correlation('test-correlation')
        .emit(eventBus);

      await event('LifecycleEvent', { step: 'complete', data: { id: 1, status: 'completed' } })
        .tenant('test-tenant')
        .user('test-user')
        .correlation('test-correlation')
        .emit(eventBus);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify events
      expect(receivedEvents).toHaveLength(3);
      expect(receivedEvents[0].payload.step).toBe('start');
      expect(receivedEvents[1].payload.step).toBe('process');
      expect(receivedEvents[2].payload.step).toBe('complete');

      // Verify correlation
      expect(receivedEvents[1].metadata.correlationId).toBe('test-correlation');
      expect(receivedEvents[2].metadata.correlationId).toBe('test-correlation');

      // Verify statistics
      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(3);
    });

    it('should handle event persistence and replay', async () => {
      // Configure event bus with persistence
      const config: EventBusConfig = {
        name: 'persistence-test',
        persistence: {
          enabled: true,
          provider: 'memory',
        },
        enableMetrics: false,
      };

      const persistentEventBus = new EventBus(config);

      // Emit events
      await persistentEventBus.emit('TestEvent', { message: 'event1' }, { tenantId: 'tenant-1' });
      await persistentEventBus.emit('TestEvent', { message: 'event2' }, { tenantId: 'tenant-1' });
      await persistentEventBus.emit('TestEvent', { message: 'event3' }, { tenantId: 'tenant-2' });

      // Replay events for specific tenant
      const replayCount = await persistentEventBus.replayEvents({
        enabled: true,
        batchSize: 10,
        concurrency: 1,
        filter: { tenantId: 'tenant-1' },
      });

      expect(replayCount).toBe(2);

      await persistentEventBus.destroy();
    });
  });
});
