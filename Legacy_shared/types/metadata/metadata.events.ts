import { z } from 'zod';
import type { UUID, ISODate, UserID, TenantID } from '../primitives';
import {
  MetadataEventTypes,
  MetadataAuditEventTypes,
  MetadataOperationTypes,
} from './metadata.enums';
import type {
  MetadataEventType,
  MetadataAuditEventType,
  MetadataOperationType,
} from './metadata.enums';
import type {
  MetadataEntity,
  MetadataField,
  MetadataValue,
  MetadataSchema,
  MetadataConstraint,
} from './metadata.types';

// ============================================================================
// BASE EVENT INTERFACES
// ============================================================================

export interface MetadataEventBase {
  id: UUID;
  type?: MetadataEventType; // Made optional for inheritance
  timestamp: ISODate;
  tenantId: TenantID;
  userId: UserID;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface MetadataAuditEventBase extends Partial<MetadataEventBase> {
  type?: MetadataAuditEventType; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  operation: MetadataOperationType;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// ENTITY EVENTS
// ============================================================================

export interface MetadataEntityCreatedEvent extends Partial<MetadataEventBase> {
  type?: 'entity.created'; // Made optional for inheritance
  entity: MetadataEntity;
  schema: MetadataSchema;
}

export interface MetadataEntityUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'entity.updated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  changes: {
    before: Partial<MetadataEntity>;
    after: Partial<MetadataEntity>;
    fields: string[];
  };
  entity: MetadataEntity;
}

export interface MetadataEntityDeletedEvent extends Partial<MetadataEventBase> {
  type?: 'entity.deleted'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
  softDelete: boolean;
}

export interface MetadataEntityRestoredEvent extends Partial<MetadataEventBase> {
  type?: 'entity.restored'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
}

export interface MetadataEntityArchivedEvent extends Partial<MetadataEventBase> {
  type?: 'entity.archived'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
  archiveReason?: string;
}

export interface MetadataEntityUnarchivedEvent extends Partial<MetadataEventBase> {
  type?: 'entity.unarchived'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
}

// ============================================================================
// FIELD EVENTS
// ============================================================================

export interface MetadataFieldCreatedEvent extends Partial<MetadataEventBase> {
  type?: 'field.created'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  field: MetadataField;
}

export interface MetadataFieldUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'field.updated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  changes: {
    before: Partial<MetadataField>;
    after: Partial<MetadataField>;
    fields: string[];
  };
  field: MetadataField;
}

export interface MetadataFieldDeletedEvent extends Partial<MetadataEventBase> {
  type?: 'field.deleted'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  field: MetadataField;
}

export interface MetadataFieldReorderedEvent extends Partial<MetadataEventBase> {
  type?: 'field.reordered'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  changes: Array<{
    fieldId: UUID;
    oldOrder: number;
    newOrder: number;
  }>;
}

// ============================================================================
// VALUE EVENTS
// ============================================================================

export interface MetadataValueCreatedEvent extends Partial<MetadataEventBase> {
  type?: 'value.created'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  value: MetadataValue;
}

export interface MetadataValueUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'value.updated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  changes: {
    before: MetadataValue;
    after: MetadataValue;
  };
  value: MetadataValue;
}

export interface MetadataValueDeletedEvent extends Partial<MetadataEventBase> {
  type?: 'value.deleted'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  value: MetadataValue;
}

export interface MetadataValueBulkUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'value.bulk_updated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  changes: Array<{
    fieldId: UUID;
    before: MetadataValue;
    after: MetadataValue;
  }>;
}

// ============================================================================
// SCHEMA EVENTS
// ============================================================================

export interface MetadataSchemaCreatedEvent extends Partial<MetadataEventBase> {
  type?: 'schema.created'; // Made optional for inheritance
  schema: MetadataSchema;
}

export interface MetadataSchemaUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'schema.updated'; // Made optional for inheritance
  schemaId: UUID;
  changes: {
    before: Partial<MetadataSchema>;
    after: Partial<MetadataSchema>;
    fields: string[];
  };
  schema: MetadataSchema;
}

export interface MetadataSchemaDeletedEvent extends Partial<MetadataEventBase> {
  type?: 'schema.deleted'; // Made optional for inheritance
  schemaId: UUID;
  schema: MetadataSchema;
}

export interface MetadataSchemaVersionedEvent extends Partial<MetadataEventBase> {
  type?: 'schema.versioned'; // Made optional for inheritance
  schemaId: UUID;
  oldVersion: string;
  newVersion: string;
  schema: MetadataSchema;
  migrationScript?: string;
}

// ============================================================================
// CONSTRAINT EVENTS
// ============================================================================

export interface MetadataConstraintCreatedEvent extends Partial<MetadataEventBase> {
  type?: 'constraint.created'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  constraint: MetadataConstraint;
}

export interface MetadataConstraintUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'constraint.updated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  constraintId: UUID;
  changes: {
    before: Partial<MetadataConstraint>;
    after: Partial<MetadataConstraint>;
    fields: string[];
  };
  constraint: MetadataConstraint;
}

export interface MetadataConstraintDeletedEvent extends Partial<MetadataEventBase> {
  type?: 'constraint.deleted'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  constraintId: UUID;
  constraint: MetadataConstraint;
}

export interface MetadataConstraintViolatedEvent extends Partial<MetadataEventBase> {
  type?: 'constraint.violated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  constraintId: UUID;
  constraint: MetadataConstraint;
  violation: {
    field: string;
    value: any;
    expected: any;
    message?: string; // Made optional for inheritance
  };
}

// ============================================================================
// VALIDATION EVENTS
// ============================================================================

export interface MetadataValidationFailedEvent extends Partial<MetadataEventBase> {
  type?: 'validation.failed'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId?: UUID;
  errors: Array<{
    field: string;
    value: any;
    rule: string;
    message?: string; // Made optional for inheritance
    code?: string; // Made optional for inheritance
  }>;
}

export interface MetadataValidationPassedEvent extends Partial<MetadataEventBase> {
  type?: 'validation.passed'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  fieldId?: UUID;
  validatedAt: ISODate;
}

// ============================================================================
// CACHE EVENTS
// ============================================================================

export interface MetadataCacheInvalidatedEvent extends Partial<MetadataEventBase> {
  type?: 'cache.invalidated'; // Made optional for inheritance
  cacheKey: string;
  reason: 'manual' | 'ttl' | 'dependency' | 'schema_change';
  dependencies?: string[];
}

export interface MetadataCacheUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'cache.updated'; // Made optional for inheritance
  cacheKey: string;
  ttl: number;
  size: number;
}

export interface MetadataCacheMissedEvent extends Partial<MetadataEventBase> {
  type?: 'cache.missed'; // Made optional for inheritance
  cacheKey: string;
  reason: 'not_found' | 'expired' | 'invalidated';
}

// ============================================================================
// INDEXING EVENTS
// ============================================================================

export interface MetadataIndexCreatedEvent extends Partial<MetadataEventBase> {
  type?: 'index.created'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  indexName: string;
  fields: string[];
  indexType: string;
}

export interface MetadataIndexUpdatedEvent extends Partial<MetadataEventBase> {
  type?: 'index.updated'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  indexName: string;
  changes: {
    before: Partial<{
      fields: string[];
      indexType: string;
    }>;
    after: Partial<{
      fields: string[];
      indexType: string;
    }>;
  };
}

export interface MetadataIndexDeletedEvent extends Partial<MetadataEventBase> {
  type?: 'index.deleted'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  indexName: string;
}

export interface MetadataIndexRebuiltEvent extends Partial<MetadataEventBase> {
  type?: 'index.rebuilt'; // Made optional for inheritance
  entityId: UUID;
  entityType: string;
  indexName: string;
  recordsProcessed: number;
  duration: number;
}

// ============================================================================
// SEARCH EVENTS
// ============================================================================

export interface MetadataSearchPerformedEvent extends Partial<MetadataEventBase> {
  type?: 'search.performed'; // Made optional for inheritance
  query: string;
  filters: Record<string, any>;
  results: number;
  duration: number;
  cacheHit: boolean;
}

export interface MetadataSearchSuggestionEvent extends Partial<MetadataEventBase> {
  type?: 'search.suggestion'; // Made optional for inheritance
  query: string;
  suggestions: string[];
  selected?: string;
}

// ============================================================================
// BULK OPERATION EVENTS
// ============================================================================

export interface MetadataBulkOperationStartedEvent extends Partial<MetadataEventBase> {
  type?: 'bulk.started'; // Made optional for inheritance
  operation: MetadataOperationType;
  entityType: string;
  totalItems: number;
  batchSize: number;
  options: Record<string, any>;
}

export interface MetadataBulkOperationProgressEvent extends Partial<MetadataEventBase> {
  type?: 'bulk.progress'; // Made optional for inheritance
  operation: MetadataOperationType;
  entityType: string;
  processed: number;
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    item: any;
    error: string;
  }>;
}

export interface MetadataBulkOperationCompletedEvent extends Partial<MetadataEventBase> {
  type?: 'bulk.completed'; // Made optional for inheritance
  operation: MetadataOperationType;
  entityType: string;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  duration: number;
  summary: Record<string, any>;
}

export interface MetadataBulkOperationFailedEvent extends Partial<MetadataEventBase> {
  type?: 'bulk.failed'; // Made optional for inheritance
  operation: MetadataOperationType;
  entityType: string;
  error: string;
  processed: number;
  failed: number;
}

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

export interface MetadataSystemMaintenanceEvent extends Partial<MetadataEventBase> {
  type?: 'system.maintenance'; // Made optional for inheritance
  maintenanceType: 'backup' | 'cleanup' | 'optimization' | 'migration';
  status: 'started' | 'completed' | 'failed';
  details: Record<string, any>;
  duration?: number;
}

export interface MetadataSystemErrorEvent extends Partial<MetadataEventBase> {
  type?: 'system.error'; // Made optional for inheritance
  error: {
    code: string;
    message?: string; // Made optional for inheritance
    stack?: string;
    context: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

export interface MetadataSystemWarningEvent extends Partial<MetadataEventBase> {
  type?: 'system.warning'; // Made optional for inheritance
  warning: {
    code: string;
    message?: string; // Made optional for inheritance
    context: Record<string, any>;
  };
  action?: string;
}

// ============================================================================
// CUSTOM EVENTS
// ============================================================================

export interface MetadataCustomEvent extends Partial<MetadataEventBase> {
  type?: 'custom'; // Made optional for inheritance
  customType: string;
  data: Record<string, any>;
}

// ============================================================================
// UNION TYPES
// ============================================================================

export type MetadataEvent =
  | MetadataEntityCreatedEvent
  | MetadataEntityUpdatedEvent
  | MetadataEntityDeletedEvent
  | MetadataEntityRestoredEvent
  | MetadataEntityArchivedEvent
  | MetadataEntityUnarchivedEvent
  | MetadataFieldCreatedEvent
  | MetadataFieldUpdatedEvent
  | MetadataFieldDeletedEvent
  | MetadataFieldReorderedEvent
  | MetadataValueCreatedEvent
  | MetadataValueUpdatedEvent
  | MetadataValueDeletedEvent
  | MetadataValueBulkUpdatedEvent
  | MetadataSchemaCreatedEvent
  | MetadataSchemaUpdatedEvent
  | MetadataSchemaDeletedEvent
  | MetadataSchemaVersionedEvent
  | MetadataConstraintCreatedEvent
  | MetadataConstraintUpdatedEvent
  | MetadataConstraintDeletedEvent
  | MetadataConstraintViolatedEvent
  | MetadataValidationFailedEvent
  | MetadataValidationPassedEvent
  | MetadataCacheInvalidatedEvent
  | MetadataCacheUpdatedEvent
  | MetadataCacheMissedEvent
  | MetadataIndexCreatedEvent
  | MetadataIndexUpdatedEvent
  | MetadataIndexDeletedEvent
  | MetadataIndexRebuiltEvent
  | MetadataSearchPerformedEvent
  | MetadataSearchSuggestionEvent
  | MetadataBulkOperationStartedEvent
  | MetadataBulkOperationProgressEvent
  | MetadataBulkOperationCompletedEvent
  | MetadataBulkOperationFailedEvent
  | MetadataSystemMaintenanceEvent
  | MetadataSystemErrorEvent
  | MetadataSystemWarningEvent
  | MetadataCustomEvent;

export type MetadataAuditEvent =
  | MetadataEntityCreatedEvent
  | MetadataEntityUpdatedEvent
  | MetadataEntityDeletedEvent
  | MetadataEntityRestoredEvent
  | MetadataEntityArchivedEvent
  | MetadataEntityUnarchivedEvent
  | MetadataFieldCreatedEvent
  | MetadataFieldUpdatedEvent
  | MetadataFieldDeletedEvent
  | MetadataValueCreatedEvent
  | MetadataValueUpdatedEvent
  | MetadataValueDeletedEvent
  | MetadataSchemaCreatedEvent
  | MetadataSchemaUpdatedEvent
  | MetadataSchemaDeletedEvent
  | MetadataSchemaVersionedEvent
  | MetadataConstraintCreatedEvent
  | MetadataConstraintUpdatedEvent
  | MetadataConstraintDeletedEvent;

// ============================================================================
// EVENT HANDLERS
// ============================================================================

export interface MetadataEventHandler<T extends MetadataEvent = MetadataEvent> {
  (event: T): Promise<void> | void;
}

export interface MetadataEventFilter {
  types?: MetadataEventType[];
  entityTypes?: string[];
  entityIds?: UUID[];
  userIds?: UserID[];
  tenantIds?: TenantID[];
  dateRange?: {
    start: ISODate;
    end: ISODate;
  };
  custom?: (event: MetadataEvent) => boolean;
}

export interface MetadataEventSubscription {
  id: UUID;
  filter: MetadataEventFilter;
  handler: MetadataEventHandler;
  options?: {
    batchSize?: number;
    batchTimeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    priority?: 'low' | 'normal' | 'high';
  };
}

// ============================================================================
// EVENT BUS
// ============================================================================

export interface MetadataEventBus {
  publish(event: MetadataEvent): Promise<void>;
  subscribe(subscription: MetadataEventSubscription): Promise<void>;
  unsubscribe(subscriptionId: UUID): Promise<void>;
  getSubscriptions(filter?: MetadataEventFilter): MetadataEventSubscription[];
}

// ============================================================================
// EVENT STORE
// ============================================================================

export interface MetadataEventStore {
  append(event: MetadataEvent): Promise<void>;
  appendBatch(events: MetadataEvent[]): Promise<void>;
  getEvents(
    filter: MetadataEventFilter,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: 'timestamp' | 'id';
      order?: 'asc' | 'desc';
    },
  ): Promise<MetadataEvent[]>;
  getEventStream(
    filter: MetadataEventFilter,
    options?: {
      batchSize?: number;
      timeout?: number;
    },
  ): AsyncIterable<MetadataEvent[]>;
  getEventCount(filter: MetadataEventFilter): Promise<number>;
  deleteEvents(filter: MetadataEventFilter): Promise<number>;
  compactEvents(beforeDate: ISODate): Promise<number>;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface MetadataAuditTrail {
  record(event: MetadataAuditEvent): Promise<void>;
  getAuditTrail(
    entityId: UUID,
    options?: {
      startDate?: ISODate;
      endDate?: ISODate;
      operations?: MetadataOperationType[];
      limit?: number;
      offset?: number;
    },
  ): Promise<MetadataAuditEvent[]>;
  getAuditSummary(entityId: UUID): Promise<{
    totalEvents: number;
    firstEvent: ISODate;
    lastEvent: ISODate;
    operations: Record<MetadataOperationType, number>;
    users: Record<UserID, number>;
  }>;
  exportAuditTrail(entityId: UUID, format: 'json' | 'csv' | 'pdf'): Promise<string>;
}

// ============================================================================
// EVENT VALIDATION
// ============================================================================

export const MetadataEventSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(MetadataEventTypes),
  timestamp: z.string().datetime(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const MetadataAuditEventSchema = MetadataEventSchema.extend({
  type: z.nativeEnum(MetadataAuditEventTypes).optional(),
  entityId: z.string().uuid(),
  entityType: z.string(),
  operation: z.nativeEnum(MetadataOperationTypes),
  changes: z
    .object({
      before: z.record(z.any()).optional(),
      after: z.record(z.any()).optional(),
      fields: z.array(z.string()).optional(),
    })
    .optional(),
  reason: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
}); // Made optional for inheritance

// ============================================================================
// EVENT UTILITIES
// ============================================================================

export class MetadataEventUtils {
  /**
   * Creates a new metadata event with required fields
   */
  static createEvent<T extends MetadataEvent>(
    type?: T['type'],
    tenantId: TenantID,
    userId: UserID,
    data: Omit<T, keyof MetadataEventBase>,
  ): T {
    return {
      id: crypto.randomUUID() as UUID,
      type,
      timestamp: new Date().toISOString() as ISODate,
      tenantId,
      userId,
      ...data,
    } as T; // Made optional for inheritance
  }

  /**
   * Creates an audit event
   */
  static createAuditEvent<T extends MetadataAuditEvent>(
    type?: T['type'],
    tenantId: TenantID,
    userId: UserID,
    entityId: UUID,
    entityType: string,
    operation: MetadataOperationType,
    data: Omit<T, keyof MetadataAuditEventBase>,
  ): T {
    return {
      id: crypto.randomUUID() as UUID,
      type,
      timestamp: new Date().toISOString() as ISODate,
      tenantId,
      userId,
      entityId,
      entityType,
      operation,
      ...data,
    } as T; // Made optional for inheritance
  }

  /**
   * Validates an event against the schema
   */
  static validateEvent(event: MetadataEvent): { valid: boolean; errors?: string[] } {
    try {
      MetadataEventSchema.parse(event);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Filters events based on criteria
   */
  static filterEvents(events: MetadataEvent[], filter: MetadataEventFilter): MetadataEvent[] {
    return events.filter((event) => {
      if (filter.types && !filter.types.includes(event.type)) {
        return false;
      }

      if (filter.tenantIds && !filter.tenantIds.includes(event.tenantId)) {
        return false;
      }

      if (filter.userIds && !filter.userIds.includes(event.userId)) {
        return false;
      }

      if (filter.dateRange) {
        const eventDate = new Date(event.timestamp);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);

        if (eventDate < startDate || eventDate > endDate) {
          return false;
        }
      }

      if (filter.custom && !filter.custom(event)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Groups events by type
   */
  static groupEventsByType(events: MetadataEvent[]): Record<MetadataEventType, MetadataEvent[]> {
    return events.reduce(
      (groups, event) => {
        if (!groups[event.type]) {
          groups[event.type] = [];
        }
        groups[event.type].push(event);
        return groups;
      },
      {} as Record<MetadataEventType, MetadataEvent[]>,
    );
  }

  /**
   * Gets event statistics
   */
  static getEventStats(events: MetadataEvent[]): {
    total: number;
    byType: Record<MetadataEventType, number>;
    byUser: Record<UserID, number>;
    byTenant: Record<TenantID, number>;
    timeRange: { start: ISODate; end: ISODate };
  } {
    const byType: Record<MetadataEventType, number> = {};
    const byUser: Record<UserID, number> = {};
    const byTenant: Record<TenantID, number> = {};
    let startDate: ISODate | null = null;
    let endDate: ISODate | null = null;

    events.forEach((event) => {
      // Count by type
      byType[event.type] = (byType[event.type] || 0) + 1;

      // Count by user
      byUser[event.userId] = (byUser[event.userId] || 0) + 1;

      // Count by tenant
      byTenant[event.tenantId] = (byTenant[event.tenantId] || 0) + 1;

      // Track time range
      const eventDate = new Date(event.timestamp);
      if (!startDate || eventDate < new Date(startDate)) {
        startDate = event.timestamp;
      }
      if (!endDate || eventDate > new Date(endDate)) {
        endDate = event.timestamp;
      }
    });

    return {
      total: events.length,
      byType,
      byUser,
      byTenant,
      timeRange: {
        start: startDate!,
        end: endDate!,
      },
    };
  }

  /**
   * Serializes an event for storage/transmission
   */
  static serializeEvent(event: MetadataEvent): string {
    return JSON.stringify(event);
  }

  /**
   * Deserializes an event from storage/transmission
   */
  static deserializeEvent(data: string): MetadataEvent {
    return JSON.parse(data);
  }

  /**
   * Creates a correlation ID for tracking related events
   */
  static createCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Checks if an event is an audit event
   */
  static isAuditEvent(event: MetadataEvent): event is MetadataAuditEvent {
    return 'entityId' in event && 'entityType' in event && 'operation' in event;
  }

  /**
   * Gets the entity ID from an event (if available)
   */
  static getEntityId(event: MetadataEvent): UUID | null {
    if (this.isAuditEvent(event)) {
      return event.entityId;
    }

    // Check for entityId in custom events
    if ('entityId' in event && typeof event.entityId === 'string') {
      return event.entityId as UUID;
    }

    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  MetadataEventBase,
  MetadataAuditEventBase,
  MetadataEntityCreatedEvent,
  MetadataEntityUpdatedEvent,
  MetadataEntityDeletedEvent,
  MetadataEntityRestoredEvent,
  MetadataEntityArchivedEvent,
  MetadataEntityUnarchivedEvent,
  MetadataFieldCreatedEvent,
  MetadataFieldUpdatedEvent,
  MetadataFieldDeletedEvent,
  MetadataFieldReorderedEvent,
  MetadataValueCreatedEvent,
  MetadataValueUpdatedEvent,
  MetadataValueDeletedEvent,
  MetadataValueBulkUpdatedEvent,
  MetadataSchemaCreatedEvent,
  MetadataSchemaUpdatedEvent,
  MetadataSchemaDeletedEvent,
  MetadataSchemaVersionedEvent,
  MetadataConstraintCreatedEvent,
  MetadataConstraintUpdatedEvent,
  MetadataConstraintDeletedEvent,
  MetadataConstraintViolatedEvent,
  MetadataValidationFailedEvent,
  MetadataValidationPassedEvent,
  MetadataCacheInvalidatedEvent,
  MetadataCacheUpdatedEvent,
  MetadataCacheMissedEvent,
  MetadataIndexCreatedEvent,
  MetadataIndexUpdatedEvent,
  MetadataIndexDeletedEvent,
  MetadataIndexRebuiltEvent,
  MetadataSearchPerformedEvent,
  MetadataSearchSuggestionEvent,
  MetadataBulkOperationStartedEvent,
  MetadataBulkOperationProgressEvent,
  MetadataBulkOperationCompletedEvent,
  MetadataBulkOperationFailedEvent,
  MetadataSystemMaintenanceEvent,
  MetadataSystemErrorEvent,
  MetadataSystemWarningEvent,
  MetadataCustomEvent,
  MetadataEvent,
  MetadataAuditEvent,
  MetadataEventHandler,
  MetadataEventFilter,
  MetadataEventSubscription,
  MetadataEventBus,
  MetadataEventStore,
  MetadataAuditTrail,
};

// All exports are already declared inline above
