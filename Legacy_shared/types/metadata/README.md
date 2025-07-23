# Metadata Management System

A comprehensive, enterprise-grade metadata management system with strong TypeScript typing, runtime validation, and extensible features for the AI-BOS platform.

## 🏗️ Architecture Overview

The metadata system is built with a modular, extensible architecture that provides:

- **Type Safety**: Full TypeScript support with branded types and runtime validation
- **Scalability**: Designed to handle millions of metadata entities and complex queries
- **Security**: Fine-grained permissions and field-level security
- **Performance**: Multi-level caching and optimized query execution
- **Reliability**: Comprehensive error handling and recovery strategies
- **Observability**: Full audit trails and event-driven architecture

## 📦 Core Components

### 1. **Enums & Types** (`metadata.enums.ts`, `metadata.types.ts`)

Foundation enums and type definitions for all metadata operations.

```typescript
import { MetadataFieldType, MetadataEntity, MetadataSchema } from './metadata';

// Field types
const fieldType: MetadataFieldType = 'string';
const entity: MetadataEntity = {
  /* ... */
};
const schema: MetadataSchema = {
  /* ... */
};
```

### 2. **Type Mapping** (`metadata.mapping.ts`)

Type-safe mappings between metadata field types and TypeScript types.

```typescript
import { MetadataTypeMapper } from './metadata';

// Get TypeScript type for a field
type StringFieldType = MetadataTypeMapper['string']; // string

// Validate field value
const isValid = MetadataTypeMapper.validate('string', 'test'); // true
```

### 3. **Field Definitions** (`metadata.fields.ts`)

Comprehensive field type definitions with constraints and validation.

```typescript
import { MetadataField, MetadataFieldBuilder } from './metadata';

const field = new MetadataFieldBuilder()
  .name('email')
  .type('email')
  .required()
  .unique()
  .build();
```

### 4. **Query System** (`metadata.query.ts`)

Powerful query system with filters, sorting, pagination, and aggregation.

```typescript
import { MetadataQueryBuilder, MetadataQueryOperator } from './metadata';

const query = new MetadataQueryBuilder()
  .where('status', MetadataQueryOperator.EQUALS, 'active')
  .where('createdAt', MetadataQueryOperator.GREATER_THAN, '2024-01-01')
  .orderBy('name', 'asc')
  .limit(50)
  .build();
```

### 5. **Event System** (`metadata.events.ts`)

Event-driven architecture for metadata changes and audit trails.

```typescript
import { MetadataEventUtils, MetadataEventType } from './metadata';

const event = MetadataEventUtils.createEvent(
  'entity.created',
  tenantId,
  userId,
  { entity, schema },
);
```

### 6. **Permission System** (`metadata.permissions.ts`)

Fine-grained access control with role-based and field-level permissions.

```typescript
import { MetadataPermissionUtils, MetadataPermissionScope } from './metadata';

const permission = MetadataPermissionUtils.createPermission(
  'Read Users',
  'read',
  MetadataPermissionScope.ENTITY_TYPE,
  'user',
  ['read'],
  tenantId,
  userId,
);
```

### 7. **Caching System** (`metadata.cache.ts`)

Multi-level caching with intelligent invalidation strategies.

```typescript
import { MetadataCacheUtils, MetadataCacheLevel } from './metadata';

const cacheKey = MetadataCacheUtils.generateEntityKey('user', userId, tenantId);
const entry = MetadataCacheUtils.createEntry(cacheKey, userData, { ttl: 3600 });
```

### 8. **Migration System** (`metadata.migration.ts`)

Schema evolution and data migration with rollback support.

```typescript
import { MetadataMigrationUtils, MetadataMigrationType } from './metadata';

const migration = MetadataMigrationUtils.createMigration(
  'Add Email Field',
  '1.1.0',
  MetadataMigrationType.SCHEMA_CHANGE,
  tenantId,
  userId,
);
```

### 9. **Testing Utilities** (`metadata.testing.ts`)

Comprehensive testing framework with mock generators and assertions.

```typescript
import { MetadataTestUtils, MetadataTestType } from './metadata';

const testCase = MetadataTestUtils.createTestCase(
  'Test User Creation',
  MetadataTestType.UNIT,
  'high',
  async (context) => {
    const user = context.utils.generateEntity('user');
    // Test logic...
    return { success: true };
  },
  userId,
);
```

### 10. **Error Handling** (`metadata.errors.ts`)

Robust error handling with recovery strategies and detailed reporting.

```typescript
import { MetadataErrorUtils, MetadataErrorCategory } from './metadata';

const error = MetadataErrorUtils.createError(
  'validation_error',
  MetadataErrorCategory.VALIDATION,
  'medium',
  'INVALID_EMAIL',
  'Invalid email format',
  tenantId,
);
```

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import {
  createMetadataSystemConfig,
  validateMetadataSystemConfig,
  MetadataEntity,
  MetadataField,
  MetadataSchema,
} from './metadata';

// Create system configuration
const config = createMetadataSystemConfig();

// Validate configuration
const validation = validateMetadataSystemConfig(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

### 2. Create a Schema

```typescript
import {
  MetadataSchema,
  MetadataField,
  MetadataFieldBuilder,
} from './metadata';

// Define fields
const fields: MetadataField[] = [
  new MetadataFieldBuilder()
    .name('name')
    .type('string')
    .required()
    .maxLength(100)
    .build(),

  new MetadataFieldBuilder()
    .name('email')
    .type('email')
    .required()
    .unique()
    .build(),

  new MetadataFieldBuilder().name('age').type('number').min(0).max(150).build(),
];

// Create schema
const userSchema: MetadataSchema = {
  id: crypto.randomUUID() as UUID,
  name: 'User',
  fields,
  version: '1.0.0',
  tenantId,
  createdBy: userId,
  createdAt: new Date().toISOString() as ISODate,
  isActive: true,
};
```

### 3. Create an Entity

```typescript
import { MetadataEntity, MetadataValue } from './metadata';

const userEntity: MetadataEntity = {
  id: crypto.randomUUID() as UUID,
  type: 'user',
  name: 'John Doe',
  schema: userSchema,
  fields: userSchema.fields,
  values: {
    name: { value: 'John Doe' } as MetadataValue,
    email: { value: 'john@example.com' } as MetadataValue,
    age: { value: 30 } as MetadataValue,
  },
  tenantId,
  createdBy: userId,
  createdAt: new Date().toISOString() as ISODate,
  isActive: true,
};
```

### 4. Query Entities

```typescript
import { MetadataQueryBuilder, MetadataQueryOperator } from './metadata';

const query = new MetadataQueryBuilder()
  .where('type', MetadataQueryOperator.EQUALS, 'user')
  .where('values.age', MetadataQueryOperator.GREATER_THAN, 25)
  .orderBy('values.name', 'asc')
  .limit(10)
  .build();

// Execute query (implementation depends on your data layer)
const results = await executeQuery(query);
```

### 5. Handle Permissions

```typescript
import { MetadataPermissionUtils, MetadataPermissionScope } from './metadata';

// Check if user can read user entities
const canReadUsers = await permissionEvaluator.evaluate({
  userId,
  tenantId,
  resourceType: 'user',
  operation: 'read',
});

if (!canReadUsers.allowed) {
  throw new Error('Permission denied');
}
```

## 🔧 Advanced Features

### Custom Field Types

```typescript
import { MetadataField, MetadataFieldType } from './metadata';

// Define custom field type
const customField: MetadataField = {
  id: crypto.randomUUID() as UUID,
  name: 'customField',
  type: 'custom' as MetadataFieldType,
  config: {
    customType: 'geolocation',
    validation: {
      latitude: { min: -90, max: 90 },
      longitude: { min: -180, max: 180 },
    },
  },
  // ... other properties
};
```

### Event Handling

```typescript
import { MetadataEventBus, MetadataEventHandler } from './metadata';

// Subscribe to entity creation events
const eventBus: MetadataEventBus = {
  async subscribe(subscription) {
    // Implementation
  },
  async publish(event) {
    // Implementation
  },
};

const handler: MetadataEventHandler = async (event) => {
  if (event.type === 'entity.created') {
    console.log('New entity created:', event.entity);
    // Handle the event
  }
};
```

### Caching Strategies

```typescript
import { MetadataCacheManager, MetadataCacheStrategy } from './metadata';

const cacheManager: MetadataCacheManager = {
  async get(key) {
    // Implementation
  },
  async set(key, value, options) {
    // Implementation
  },
};

// Use cache with strategy
const cachedEntity = await cacheManager.getWithStrategy(
  'entity:user:123',
  'cache_first',
  { ttl: 3600 },
);
```

### Migration Management

```typescript
import { MetadataMigrationManager, MetadataMigrationUtils } from './metadata';

const migrationManager: MetadataMigrationManager = {
  async createMigration(migration) {
    // Implementation
  },
  async executeMigration(migrationId, options) {
    // Implementation
  },
};

// Create and execute migration
const migration = MetadataMigrationUtils.createMigration(
  'Add Phone Field',
  '1.2.0',
  'schema_change',
  tenantId,
  userId,
);

await migrationManager.executeMigration(migration.id);
```

## 🧪 Testing

### Unit Testing

```typescript
import { MetadataTestUtils, MetadataTestType } from './metadata';

const testCase = MetadataTestUtils.createTestCase(
  'Test Field Validation',
  MetadataTestType.UNIT,
  'high',
  async (context) => {
    const field = context.utils.generateField('email');
    const value = context.utils.generateValue(field, { valid: true });

    // Test validation logic
    const isValid = validateFieldValue(field, value);

    return {
      success: isValid,
      data: { field, value, isValid },
    };
  },
  userId,
);
```

### Integration Testing

```typescript
import { MetadataTestHelper } from './metadata';

const testHelper: MetadataTestHelper = {
  async setupTestEnvironment(options) {
    // Setup test database, cache, etc.
    return context;
  },

  async assertEntityExists(entityId, expected) {
    const entity = await getEntity(entityId);
    if (!entity) {
      throw new Error(`Entity ${entityId} not found`);
    }
    // Assert expected properties
  },
};
```

## 🔒 Security

### Permission Management

```typescript
import { MetadataPermissionManager, MetadataRole } from './metadata';

const permissionManager: MetadataPermissionManager = {
  async createRole(role) {
    // Implementation
  },

  async assignRoleToUser(userId, roleId, tenantId, grantedBy) {
    // Implementation
  },
};

// Create admin role
const adminRole: MetadataRole = {
  id: crypto.randomUUID() as UUID,
  name: 'Admin',
  permissions: ['read', 'write', 'delete', 'admin'],
  tenantId,
  createdBy: systemUserId,
  createdAt: new Date().toISOString() as ISODate,
  isActive: true,
  isSystem: true,
  priority: 100,
};
```

### Field-Level Security

```typescript
import { MetadataFieldPermission, MetadataFieldMask } from './metadata';

// Mask sensitive data
const ssnMask: MetadataFieldMask = {
  id: crypto.randomUUID() as UUID,
  fieldId: ssnFieldId,
  maskType: 'partial',
  pattern: '\\d{3}-\\d{2}-',
  replacement: '***-**-',
  tenantId,
  isActive: true,
};
```

## 📊 Monitoring & Observability

### Error Tracking

```typescript
import { MetadataErrorHandler, MetadataErrorUtils } from './metadata';

const errorHandler: MetadataErrorHandler = {
  async handle(error, context) {
    const metadataError = MetadataErrorUtils.createError(
      'validation_error',
      'validation',
      'medium',
      'INVALID_INPUT',
      error.message,
      context.tenantId,
    );

    await this.report(metadataError);
    await this.monitor(metadataError);

    return metadataError;
  },
};
```

### Performance Monitoring

```typescript
import { MetadataCacheStats, MetadataQueryResult } from './metadata';

// Monitor cache performance
const cacheStats: MetadataCacheStats = await cacheProvider.stats();
console.log(`Cache hit rate: ${cacheStats.hitRate}%`);

// Monitor query performance
const queryResult: MetadataQueryResult = await executeQuery(query);
console.log(`Query time: ${queryResult.metadata?.queryTime}ms`);
```

## 🚀 Performance Optimization

### Query Optimization

```typescript
import { MetadataQueryUtils, MetadataQuery } from './metadata';

// Optimize query
const optimizedQuery = MetadataQueryUtils.normalizeQuery(query);

// Use query hints
const queryWithHints: MetadataQuery = {
  ...query,
  options: {
    ...query.options,
    explain: true,
    timeout: 5000,
    maxResults: 1000,
  },
};
```

### Caching Strategies

```typescript
import { MetadataCacheStrategy, MetadataCacheLevel } from './metadata';

const aggressiveCacheStrategy: MetadataCacheStrategy = {
  name: 'aggressive',
  levels: [MetadataCacheLevel.L1, MetadataCacheLevel.L2],
  readPolicy: 'cache_first',
  writePolicy: 'write_through',
  ttlStrategy: {
    type: 'adaptive',
    baseTtl: 3600,
    maxTtl: 86400,
    minTtl: 300,
  },
};
```

## 📚 API Reference

### Core Types

- `MetadataEntity`: Represents a metadata entity
- `MetadataField`: Represents a metadata field
- `MetadataSchema`: Represents a metadata schema
- `MetadataValue`: Represents a field value
- `MetadataQuery`: Represents a query
- `MetadataEvent`: Represents an event
- `MetadataPermission`: Represents a permission
- `MetadataError`: Represents an error

### Utility Classes

- `MetadataQueryBuilder`: Build type-safe queries
- `MetadataFieldBuilder`: Build field definitions
- `MetadataEventUtils`: Event utility functions
- `MetadataPermissionUtils`: Permission utility functions
- `MetadataCacheUtils`: Cache utility functions
- `MetadataMigrationUtils`: Migration utility functions
- `MetadataTestUtils`: Testing utility functions
- `MetadataErrorUtils`: Error utility functions

### Enums

- `MetadataFieldType`: Field type constants
- `MetadataOperationType`: Operation type constants
- `MetadataPermissionType`: Permission type constants
- `MetadataErrorType`: Error type constants
- `MetadataStatus`: Status constants
- `MetadataSource`: Source constants

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all validations pass
5. Follow the established naming conventions

## 📄 License

This metadata system is part of the AI-BOS platform and follows the same licensing terms.

## 🆘 Support

For questions, issues, or contributions, please refer to the main AI-BOS platform documentation and support channels.
