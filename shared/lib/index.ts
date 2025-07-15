/**
 * AI-BOS Shared Library - Main Exports
 * 
 * Enterprise-grade shared components for the AI-BOS micro-app platform.
 */

// ============================================================================
// CORE SYSTEMS
// ============================================================================

// Event-Driven Architecture
export {
  EventBus,
  EventSchemaRegistry,
  DeadLetterQueue,
  MemoryEventPersistence,
  createEventSchema,
  event,
  EventBuilder,
  CommonEventSchemas
} from './events';

export type {
  EventEnvelope,
  EventMetadata,
  EventSubscription,
  EventHandler,
  EventFilter,
  SubscriptionOptions,
  RetryPolicy,
  EventPersistenceConfig,
  EventReplayConfig,
  DeadLetterQueueConfig,
  EventBusConfig,
  EventSchema,
  EventStats
} from './events';

// Manifest System
export {
  ManifestValidator,
  ManifestProcessor,
  ManifestBuilder,
  createManifest,
  createEntity
} from './manifests';

export type {
  AppManifest,
  ManifestEntity,
  ManifestField,
  ManifestEvent,
  ManifestUIComponent,
  ManifestPermission,
  ManifestValidationResult,
  ManifestInstallResult,
  ManifestConfig,
  ValidationError as ManifestValidationError,
  ValidationWarning as ManifestValidationWarning,
  ComplianceCheck,
  SecurityCheck,
  FieldValidation,
  EntityIndex,
  EntityConstraint
} from './manifests';

// Entity Management System
export {
  EntityManager,
  EntityValidator,
  createEntityFilter
} from './entities';

export type {
  EntityInstance,
  EntityMetadata,
  EntityFilter,
  EntityQueryOptions,
  EntityQueryResult,
  EntityOperationResult,
  EntityValidationResult,
  EntitySchema,
  EntityField,
  EntityIndex as EntitySchemaIndex,
  EntityConstraint as EntitySchemaConstraint,
  EntityValidation,
  EntityHooks,
  EntityPermissions,
  EntityContext,
  EntityManagerConfig,
  AuditTrail,
  EntityPermission,
  EntityRelationship,
  ValidationError as EntityValidationError,
  ValidationWarning as EntityValidationWarning
} from './entities';

// ============================================================================
// EXISTING SYSTEMS
// ============================================================================

// Core utilities
export { logger } from './logger';
export { monitoring } from './monitoring';
export { cache } from './cache';
export { database } from './database';
export { queue } from './queue';
export { security } from './security';

// Billing and subscription
export { billingRenderer } from './billingRenderer';
export { stripeProductMap } from './stripeProductMap';
export { subscriptionMapper } from './subscriptionMapper';
export { userRoleMapper } from './userRoleMapper';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export common types for convenience
export type {
  // Event types
  EventEnvelope,
  EventMetadata,
  EventHandler,
  
  // Manifest types
  AppManifest,
  ManifestEntity,
  ManifestEvent,
  
  // Entity types
  EntityInstance,
  EntityMetadata,
  EntityFilter,
  EntityOperationResult,
  
  // Common types
  ValidationError,
  ValidationWarning
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize all core systems with default configuration
 */
export function initializeAibosSystems(config?: {
  events?: {
    enablePersistence?: boolean;
    enableMetrics?: boolean;
    enableAudit?: boolean;
  };
  manifests?: {
    enableValidation?: boolean;
    enableCompliance?: boolean;
    enableSecurity?: boolean;
  };
  entities?: {
    enableCaching?: boolean;
    enableAudit?: boolean;
    enableValidation?: boolean;
  };
}) {
  const defaultConfig = {
    events: {
      enablePersistence: true,
      enableMetrics: true,
      enableAudit: true,
      ...config?.events
    },
    manifests: {
      enableValidation: true,
      enableCompliance: true,
      enableSecurity: true,
      ...config?.manifests
    },
    entities: {
      enableCaching: true,
      enableAudit: true,
      enableValidation: true,
      ...config?.entities
    }
  };

  // Initialize event bus
  const eventBus = new EventBus({
    name: 'aibos-event-bus',
    persistence: {
      enabled: defaultConfig.events.enablePersistence,
      provider: 'memory'
    },
    enableMetrics: defaultConfig.events.enableMetrics,
    enableAudit: defaultConfig.events.enableAudit
  });

  // Initialize manifest validator
  const manifestValidator = new ManifestValidator({
    enableValidation: defaultConfig.manifests.enableValidation,
    enableCompliance: defaultConfig.manifests.enableCompliance,
    enableSecurity: defaultConfig.manifests.enableSecurity,
    strictMode: true,
    allowDeprecated: false,
    maxManifestSize: 1024 * 1024, // 1MB
    maxEntities: 100,
    maxEvents: 50,
    maxUIComponents: 50
  });

  // Initialize manifest processor
  const manifestProcessor = new ManifestProcessor(manifestValidator);

  // Initialize entity validator
  const entityValidator = new EntityValidator();

  // Initialize entity manager
  const entityManager = new EntityManager({
    enableCaching: defaultConfig.entities.enableCaching,
    enableAudit: defaultConfig.entities.enableAudit,
    enableValidation: defaultConfig.entities.enableValidation,
    enableRelationships: true,
    maxQueryLimit: 1000,
    defaultTimeout: 30000,
    cacheTTL: 300, // 5 minutes
    auditRetention: 365 * 24 * 60 * 60 * 1000 // 1 year
  }, entityValidator, eventBus);

  // Register common event schemas
  Object.values(CommonEventSchemas).forEach(schema => {
    eventBus.registerSchema(schema);
  });

  return {
    eventBus,
    manifestValidator,
    manifestProcessor,
    entityValidator,
    entityManager
  };
}

/**
 * Create a complete AI-BOS application setup
 */
export function createAibosApp(name: string, version: string) {
  const systems = initializeAibosSystems();
  
  // Create default manifest
  const manifest = createManifest()
    .name(name)
    .version(version)
    .description(`AI-BOS application: ${name}`)
    .compliance({
      gdpr: true,
      soc2: true,
      dataRetention: 365 * 24 * 60 * 60 * 1000, // 1 year
      dataClassification: 'internal'
    })
    .security({
      encryptionLevel: 'standard',
      auditTrail: true,
      accessControl: 'role-based'
    })
    .build();

  return {
    ...systems,
    manifest
  };
}

/**
 * Export version information
 */
export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  toString: () => '1.0.0'
};

/**
 * Export library information
 */
export const LIBRARY_INFO = {
  name: 'AI-BOS Shared Library',
  version: VERSION.toString(),
  description: 'Enterprise-grade shared components for the AI-BOS micro-app platform',
  features: [
    'Event-Driven Architecture',
    'Manifest System',
    'Entity Management',
    'Billing & Subscriptions',
    'Security & Monitoring',
    'Caching & Performance',
    'Audit & Compliance'
  ]
}; 