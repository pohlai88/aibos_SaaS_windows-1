import { z } from 'zod';
import { UUID, ISODate, UserID, TenantID } from '../primitives';
import { 
  MetadataEventType,
  MetadataEventTypes,
  MetadataAuditEventType,
  MetadataAuditEventTypes,
  MetadataOperationType,
  MetadataOperationTypes
} from './metadata.enums';
import { 
  MetadataEntity, 
  MetadataField, 
  MetadataValue,
  MetadataSchema,
  MetadataConstraint
} from './metadata.types';

// ============================================================================
// BASE EVENT INTERFACES
// ============================================================================

export interface MetadataEventBase {
  id: UUID;
  type: MetadataEventType;
  timestamp: ISODate;
  tenantId: TenantID;
  userId: UserID;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface MetadataAuditEventBase extends MetadataEventBase {
  type: MetadataAuditEventType;
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

export interface MetadataEntityCreatedEvent extends MetadataEventBase {
  type: 'entity.created';
  entity: MetadataEntity;
  schema: MetadataSchema;
}

export interface MetadataEntityUpdatedEvent extends MetadataEventBase {
  type: 'entity.updated';
  entityId: UUID;
  entityType: string;
  changes: {
    before: Partial<MetadataEntity>;
    after: Partial<MetadataEntity>;
    fields: string[];
  };
  entity: MetadataEntity;
}

export interface MetadataEntityDeletedEvent extends MetadataEventBase {
  type: 'entity.deleted';
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
  softDelete: boolean;
}

export interface MetadataEntityRestoredEvent extends MetadataEventBase {
  type: 'entity.restored';
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
}

export interface MetadataEntityArchivedEvent extends MetadataEventBase {
  type: 'entity.archived';
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
  archiveReason?: string;
}

export interface MetadataEntityUnarchivedEvent extends MetadataEventBase {
  type: 'entity.unarchived';
  entityId: UUID;
  entityType: string;
  entity: MetadataEntity;
}

// ============================================================================
// FIELD EVENTS
// ============================================================================

export interface MetadataFieldCreatedEvent extends MetadataEventBase {
  type: 'field.created';
  entityId: UUID;
  entityType: string;
  field: MetadataField;
}

export interface MetadataFieldUpdatedEvent extends MetadataEventBase {
  type: 'field.updated';
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

export interface MetadataFieldDeletedEvent extends MetadataEventBase {
  type: 'field.deleted';
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  field: MetadataField;
}

export interface MetadataFieldReorderedEvent extends MetadataEventBase {
  type: 'field.reordered';
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

export interface MetadataValueCreatedEvent extends MetadataEventBase {
  type: 'value.created';
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  value: MetadataValue;
}

export interface MetadataValueUpdatedEvent extends MetadataEventBase {
  type: 'value.updated';
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  changes: {
    before: MetadataValue;
    after: MetadataValue;
  };
  value: MetadataValue;
}

export interface MetadataValueDeletedEvent extends MetadataEventBase {
  type: 'value.deleted';
  entityId: UUID;
  entityType: string;
  fieldId: UUID;
  value: MetadataValue;
}

export interface MetadataValueBulkUpdatedEvent extends MetadataEventBase {
  type: 'value.bulk_updated';
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

export interface MetadataSchemaCreatedEvent extends MetadataEventBase {
  type: 'schema.created';
  schema: MetadataSchema;
}

export interface MetadataSchemaUpdatedEvent extends MetadataEventBase {
  type: 'schema.updated';
  schemaId: UUID;
  changes: {
    before: Partial<MetadataSchema>;
    after: Partial<MetadataSchema>;
    fields: string[];
  };
  schema: MetadataSchema;
}

export interface MetadataSchemaDeletedEvent extends MetadataEventBase {
  type: 'schema.deleted';
  schemaId: UUID;
  schema: MetadataSchema;
}

export interface MetadataSchemaVersionedEvent extends MetadataEventBase {
  type: 'schema.versioned';
  schemaId: UUID;
  oldVersion: string;
  newVersion: string;
  schema: MetadataSchema;
  migrationScript?: string;
}

// ============================================================================
// CONSTRAINT EVENTS
// ============================================================================

export interface MetadataConstraintCreatedEvent extends MetadataEventBase {
  type: 'constraint.created';
  entityId: UUID;
  entityType: string;
  constraint: MetadataConstraint;
}

export interface MetadataConstraintUpdatedEvent extends MetadataEventBase {
  type: 'constraint.updated';
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

export interface MetadataConstraintDeletedEvent extends MetadataEventBase {
  type: 'constraint.deleted';
  entityId: UUID;
  entityType: string;
  constraintId: UUID;
  constraint: MetadataConstraint;
}

export interface MetadataConstraintViolatedEvent extends MetadataEventBase {
  type: 'constraint.violated';
  entityId: UUID;
  entityType: string;
  constraintId: UUID;
  constraint: MetadataConstraint;
  violation: {
    field: string;
    value: any;
    expected: any;
    message: string;
  };
}

// ============================================================================
// VALIDATION EVENTS
// ============================================================================

export interface MetadataValidationFailedEvent extends MetadataEventBase {
  type: 'validation.failed';
  entityId: UUID;
  entityType: string;
  fieldId?: UUID;
  errors: Array<{
    field: string;
    value: any;
    rule: string;
    message: string;
    code: string;
  }>;
}

export interface MetadataValidationPassedEvent extends MetadataEventBase {
  type: 'validation.passed';
  entityId: UUID;
  entityType: string;
  fieldId?: UUID;
  validatedAt: ISODate;
}

// ============================================================================
// CACHE EVENTS
// ============================================================================

export interface MetadataCacheInvalidatedEvent extends MetadataEventBase {
  type: 'cache.invalidated';
  cacheKey: string;
  reason: 'manual' | 'ttl' | 'dependency' | 'schema_change';
  dependencies?: string[];
}

export interface MetadataCacheUpdatedEvent extends MetadataEventBase {
  type: 'cache.updated';
  cacheKey: string;
  ttl: number;
  size: number;
}

export interface MetadataCacheMissedEvent extends MetadataEventBase {
  type: 'cache.missed';
  cacheKey: string;
  reason: 'not_found' | 'expired' | 'invalidated';
}

// ============================================================================
// INDEXING EVENTS
// ============================================================================

export interface MetadataIndexCreatedEvent extends MetadataEventBase {
  type: 'index.created';
  entityId: UUID;
  entityType: string;
  indexName: string;
  fields: string[];
  indexType: string;
}

export interface MetadataIndexUpdatedEvent extends MetadataEventBase {
  type: 'index.updated';
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

export interface MetadataIndexDeletedEvent extends MetadataEventBase {
  type: 'index.deleted';
  entityId: UUID;
  entityType: string;
  indexName: string;
}

export interface MetadataIndexRebuiltEvent extends MetadataEventBase {
  type: 'index.rebuilt';
  entityId: UUID;
  entityType: string;
  indexName: string;
  recordsProcessed: number;
  duration: number;
}

// ============================================================================
// SEARCH EVENTS
// ============================================================================

export interface MetadataSearchPerformedEvent extends MetadataEventBase {
  type: 'search.performed';
  query: string;
  filters: Record<string, any>;
  results: number;
  duration: number;
  cacheHit: boolean;
}

export interface MetadataSearchSuggestionEvent extends MetadataEventBase {
  type: 'search.suggestion';
  query: string;
  suggestions: string[];
  selected?: string;
}

// ============================================================================
// BULK OPERATION EVENTS
// ============================================================================

export interface MetadataBulkOperationStartedEvent extends MetadataEventBase {
  type: 'bulk.started';
  operation: MetadataOperationType;
  entityType: string;
  totalItems: number;
  batchSize: number;
  options: Record<string, any>;
}

export interface MetadataBulkOperationProgressEvent extends MetadataEventBase {
  type: 'bulk.progress';
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

export interface MetadataBulkOperationCompletedEvent extends MetadataEventBase {
  type: 'bulk.completed';
  operation: MetadataOperationType;
  entityType: string;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  duration: number;
  summary: Record<string, any>;
}

export interface MetadataBulkOperationFailedEvent extends MetadataEventBase {
  type: 'bulk.failed';
  operation: MetadataOperationType;
  entityType: string;
  error: string;
  processed: number;
  failed: number;
}

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

export interface MetadataSystemMaintenanceEvent extends MetadataEventBase {
  type: 'system.maintenance';
  maintenanceType: 'backup' | 'cleanup' | 'optimization' | 'migration';
  status: 'started' | 'completed' | 'failed';
  details: Record<string, any>;
  duration?: number;
}

export interface MetadataSystemErrorEvent extends MetadataEventBase {
  type: 'system.error';
  error: {
    code: string;
    message: string;
    stack?: string;
    context: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

export interface MetadataSystemWarningEvent extends MetadataEventBase {
  type: 'system.warning';
  warning: {
    code: string;
    message: string;
    context: Record<string, any>;
  };
  action?: string;
}

// ============================================================================
// CUSTOM EVENTS
// ============================================================================

export interface MetadataCustomEvent extends MetadataEventBase {
  type: 'custom';
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
  getEvents(filter: MetadataEventFilter, options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'timestamp' | 'id';
    order?: 'asc' | 'desc';
  }): Promise<MetadataEvent[]>;
  getEventStream(filter: MetadataEventFilter, options?: {
    batchSize?: number;
    timeout?: number;
  }): AsyncIterable<MetadataEvent[]>;
  getEventCount(filter: MetadataEventFilter): Promise<number>;
  deleteEvents(filter: MetadataEventFilter): Promise<number>;
  compactEvents(beforeDate: ISODate): Promise<number>;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface MetadataAuditTrail {
  record(event: MetadataAuditEvent): Promise<void>;
  getAuditTrail(entityId: UUID, options?: {
    startDate?: ISODate;
    endDate?: ISODate;
    operations?: MetadataOperationType[];
    limit?: number;
    offset?: number;
  }): Promise<MetadataAuditEvent[]>;
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
  metadata: z.record(z.any()).optional()
});

export const MetadataAuditEventSchema = MetadataEventSchema.extend({
  type: z.nativeEnum(MetadataAuditEventTypes),
  entityId: z.string().uuid(),
  entityType: z.string(),
  operation: z.nativeEnum(MetadataOperationTypes),
  changes: z.object({
    before: z.record(z.any()).optional(),
    after: z.record(z.any()).optional(),
    fields: z.array(z.string()).optional()
  }).optional(),
  reason: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional()
});

// ============================================================================
// EVENT UTILITIES
// ============================================================================

export class MetadataEventUtils {
  /**
   * Creates a new metadata event with required fields
   */
  static createEvent<T extends MetadataEvent>(
    type: T['type'],
    tenantId: TenantID,
    userId: UserID,
    data: Omit<T, keyof MetadataEventBase>
  ): T {
    return {
      id: crypto.randomUUID() as UUID,
      type,
      timestamp: new Date().toISOString() as ISODate,
      tenantId,
      userId,
      ...data
    } as T;
  }

  /**
   * Creates an audit event
   */
  static createAuditEvent<T extends MetadataAuditEvent>(
    type: T['type'],
    tenantId: TenantID,
    userId: UserID,
    entityId: UUID,
    entityType: string,
    operation: MetadataOperationType,
    data: Omit<T, keyof MetadataAuditEventBase>
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
      ...data
    } as T;
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
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Filters events based on criteria
   */
  static filterEvents(events: MetadataEvent[], filter: MetadataEventFilter): MetadataEvent[] {
    return events.filter(event => {
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
    return events.reduce((groups, event) => {
      if (!groups[event.type]) {
        groups[event.type] = [];
      }
      groups[event.type].push(event);
      return groups;
    }, {} as Record<MetadataEventType, MetadataEvent[]>);
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

    events.forEach(event => {
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
        end: endDate!
      }
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
  MetadataAuditTrail
};

export {
  MetadataEventSchema,
  MetadataAuditEventSchema,
  MetadataEventUtils
}; 