import { z } from 'zod';
import type { UUID, ISODate, UserID, TenantID } from '../primitives';
import { MetadataFieldType } from './metadata.enums';
import type {
  MetadataFieldTypes,
  MetadataOperationType,
  MetadataOperationTypes,
  MetadataValidationRule,
  MetadataValidationRules,
} from './metadata.enums';
import type {
  MetadataEntity,
  MetadataField,
  MetadataValue,
  MetadataSchema,
  MetadataConstraint,
  MetadataQuery,
} from './metadata.types';

// ============================================================================
// TEST ENUMS
// ============================================================================

export const MetadataTestType = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  MIGRATION: 'migration',
} as const;

export type MetadataTestType = (typeof MetadataTestType)[keyof typeof MetadataTestType];

export const MetadataTestStatus = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  PENDING: 'pending',
  RUNNING: 'running',
} as const;

export type MetadataTestStatus = (typeof MetadataTestStatus)[keyof typeof MetadataTestStatus];

export const MetadataTestPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type MetadataTestPriority = (typeof MetadataTestPriority)[keyof typeof MetadataTestPriority];

// ============================================================================
// TEST INTERFACES
// ============================================================================

export interface MetadataTestCase {
  id: UUID;
  name: string;
  description?: string;
  type: MetadataTestType;
  priority: MetadataTestPriority;

  // Test configuration
  config: {
    timeout: number;
    retries: number;
    parallel: boolean;
    isolated: boolean;
    cleanup: boolean;
  };

  // Test data
  setup?: {
    entities?: MetadataEntity[];
    schemas?: MetadataSchema[];
    constraints?: MetadataConstraint[];
    data?: Record<string, any>;
  };

  teardown?: {
    cleanupEntities?: UUID[];
    cleanupSchemas?: UUID[];
    cleanupData?: string[];
  };

  // Test execution
  execute: (context: MetadataTestContext) => Promise<MetadataTestResult>;

  // Metadata
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
  tags?: string[];
}

export interface MetadataTestSuite {
  id: UUID;
  name: string;
  description?: string;

  // Test cases
  testCases: MetadataTestCase[];

  // Suite configuration
  config: {
    parallel: boolean;
    maxConcurrent: number;
    stopOnFailure: boolean;
    timeout: number;
    retries: number;
  };

  // Dependencies
  dependencies?: {
    suites?: UUID[];
    services?: string[];
    databases?: string[];
  };

  // Metadata
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
}

export interface MetadataTestExecution {
  id: UUID;
  testCaseId: UUID;
  testSuiteId?: UUID;

  // Execution details
  status: MetadataTestStatus;
  startedAt: ISODate;
  completedAt?: ISODate;
  duration?: number;

  // Results
  result: {
    success: boolean;
    assertions: number;
    passed: number;
    failed: number;
    errors: Array<{
      code: string;
      message: string;
      stack?: string;
      details?: Record<string, any>;
    }>;
    warnings: Array<{
      code: string;
      message: string;
      details?: Record<string, any>;
    }>;
  };

  // Performance metrics
  performance?: {
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    databaseQueries: number;
  };

  // Context
  context: MetadataTestContext;
}

export interface MetadataTestContext {
  // Test environment
  environment: string;
  tenantId: TenantID;
  userId: UserID;

  // Test data
  testData: Record<string, any>;
  mocks: Record<string, any>;

  // Services
  services: {
    database?: any;
    cache?: any;
    eventBus?: any;
    permissionManager?: any;
  };

  // Utilities
  utils: {
    generateId: () => UUID;
    generateEntity: (type: string, data?: Record<string, any>) => MetadataEntity;
    generateField: (type: MetadataFieldType, config?: Record<string, any>) => MetadataField;
    generateSchema: (name: string, fields?: MetadataField[]) => MetadataSchema;
    generateQuery: (filter?: any) => MetadataQuery;
    assertEntity: (entity: MetadataEntity, expected: Record<string, any>) => void;
    assertField: (field: MetadataField, expected: Record<string, any>) => void;
    assertSchema: (schema: MetadataSchema, expected: Record<string, any>) => void;
  };

  // Metadata
  metadata?: Record<string, any>;
}

export interface MetadataTestResult {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Array<{
    code: string;
    message: string;
    details?: Record<string, any>;
  }>;
  performance?: {
    duration: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// ============================================================================
// MOCK GENERATORS
// ============================================================================

export interface MetadataMockGenerator {
  // Entity mocks
  generateEntity(
    type: string,
    options?: {
      id?: UUID;
      tenantId?: TenantID;
      userId?: UserID;
      data?: Record<string, any>;
      fields?: MetadataField[];
    },
  ): MetadataEntity;

  generateEntityBatch(
    type: string,
    count: number,
    options?: {
      tenantId?: TenantID;
      userId?: UserID;
      data?: Record<string, any>;
    },
  ): MetadataEntity[];

  // Field mocks
  generateField(
    type: MetadataFieldType,
    options?: {
      id?: UUID;
      name?: string;
      config?: Record<string, any>;
      constraints?: MetadataConstraint[];
    },
  ): MetadataField;

  generateFieldBatch(
    types: MetadataFieldType[],
    options?: {
      names?: string[];
      configs?: Record<string, any>[];
    },
  ): MetadataField[];

  // Schema mocks
  generateSchema(
    name: string,
    options?: {
      id?: UUID;
      fields?: MetadataField[];
      constraints?: MetadataConstraint[];
      config?: Record<string, any>;
    },
  ): MetadataSchema;

  generateSchemaBatch(
    names: string[],
    options?: {
      fieldCounts?: number[];
      includeConstraints?: boolean;
    },
  ): MetadataSchema[];

  // Value mocks
  generateValue(
    field: MetadataField,
    options?: {
      valid?: boolean;
      constraints?: Record<string, any>;
    },
  ): MetadataValue;

  generateValueBatch(
    fields: MetadataField[],
    options?: {
      valid?: boolean;
      constraints?: Record<string, any>[];
    },
  ): MetadataValue[];

  // Query mocks
  generateQuery(options?: {
    filter?: any;
    sort?: any;
    pagination?: any;
    aggregations?: any;
  }): MetadataQuery;

  // Constraint mocks
  generateConstraint(
    type: string,
    options?: {
      id?: UUID;
      fieldId?: UUID;
      config?: Record<string, any>;
    },
  ): MetadataConstraint;

  generateConstraintBatch(
    types: string[],
    options?: {
      fieldIds?: UUID[];
      configs?: Record<string, any>[];
    },
  ): MetadataConstraint[];
}

// ============================================================================
// TEST HELPERS
// ============================================================================

export interface MetadataTestHelper {
  // Setup and teardown
  setupTestEnvironment(options?: {
    database?: boolean;
    cache?: boolean;
    eventBus?: boolean;
    permissions?: boolean;
  }): Promise<MetadataTestContext>;

  teardownTestEnvironment(context: MetadataTestContext): Promise<void>;

  // Data management
  seedTestData(data: Record<string, any>): Promise<void>;
  cleanupTestData(patterns: string[]): Promise<void>;

  // Assertions
  assertEntityExists(entityId: UUID, expected?: Record<string, any>): Promise<void>;
  assertEntityNotExists(entityId: UUID): Promise<void>;
  assertFieldExists(fieldId: UUID, expected?: Record<string, any>): Promise<void>;
  assertSchemaExists(schemaId: UUID, expected?: Record<string, any>): Promise<void>;
  assertQueryReturns(query: MetadataQuery, expectedCount: number): Promise<void>;
  assertPermissionGranted(
    userId: UserID,
    resource: string,
    operation: MetadataOperationType,
  ): Promise<void>;
  assertPermissionDenied(
    userId: UserID,
    resource: string,
    operation: MetadataOperationType,
  ): Promise<void>;

  // Performance testing
  measurePerformance<T>(
    operation: () => Promise<T>,
    options?: {
      iterations?: number;
      timeout?: number;
    },
  ): Promise<{
    result: T;
    duration: number;
    memoryUsage: number;
    cpuUsage: number;
  }>;

  // Load testing
  generateLoad(
    operations: Array<() => Promise<any>>,
    options?: {
      concurrency?: number;
      duration?: number;
      rampUp?: number;
    },
  ): Promise<{
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageResponseTime: number;
    throughput: number;
  }>;

  // Security testing
  testSecurityVulnerabilities(options?: {
    sqlInjection?: boolean;
    xss?: boolean;
    csrf?: boolean;
    authorization?: boolean;
  }): Promise<{
    vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
  }>;
}

// ============================================================================
// TEST VALIDATION
// ============================================================================

export const MetadataTestCaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(MetadataTestType),
  priority: z.nativeEnum(MetadataTestPriority),
  config: z.object({
    timeout: z.number().positive(),
    retries: z.number().nonnegative(),
    parallel: z.boolean(),
    isolated: z.boolean(),
    cleanup: z.boolean(),
  }),
  setup: z
    .object({
      entities: z.array(z.any()).optional(),
      schemas: z.array(z.any()).optional(),
      constraints: z.array(z.any()).optional(),
      data: z.record(z.any()).optional(),
    })
    .optional(),
  teardown: z
    .object({
      cleanupEntities: z.array(z.string().uuid()).optional(),
      cleanupSchemas: z.array(z.string().uuid()).optional(),
      cleanupData: z.array(z.string()).optional(),
    })
    .optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  isActive: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export const MetadataTestExecutionSchema = z.object({
  id: z.string().uuid(),
  testCaseId: z.string().uuid(),
  testSuiteId: z.string().uuid().optional(),
  status: z.nativeEnum(MetadataTestStatus),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().nonnegative().optional(),
  result: z.object({
    success: z.boolean(),
    assertions: z.number().nonnegative(),
    passed: z.number().nonnegative(),
    failed: z.number().nonnegative(),
    errors: z.array(
      z.object({
        code: z.string(),
        message: z.string(),
        stack: z.string().optional(),
        details: z.record(z.any()).optional(),
      }),
    ),
    warnings: z.array(
      z.object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.any()).optional(),
      }),
    ),
  }),
  performance: z
    .object({
      memoryUsage: z.number().nonnegative(),
      cpuUsage: z.number().nonnegative(),
      networkRequests: z.number().nonnegative(),
      databaseQueries: z.number().nonnegative(),
    })
    .optional(),
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

export class MetadataTestUtils {
  /**
   * Creates a test case with default values
   */
  static createTestCase(
    name: string,
    type: MetadataTestType,
    priority: MetadataTestPriority,
    execute: (context: MetadataTestContext) => Promise<MetadataTestResult>,
    createdBy: UserID,
    options?: Partial<MetadataTestCase>,
  ): MetadataTestCase {
    return {
      id: crypto.randomUUID() as UUID,
      name,
      type,
      priority,
      config: {
        timeout: 30000, // 30 seconds
        retries: 0,
        parallel: false,
        isolated: true,
        cleanup: true,
      },
      execute,
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      ...options,
    };
  }

  /**
   * Creates a test suite with default values
   */
  static createTestSuite(
    name: string,
    testCases: MetadataTestCase[],
    createdBy: UserID,
    options?: Partial<MetadataTestSuite>,
  ): MetadataTestSuite {
    return {
      id: crypto.randomUUID() as UUID,
      name,
      testCases,
      config: {
        parallel: false,
        maxConcurrent: 1,
        stopOnFailure: true,
        timeout: 300000, // 5 minutes
        retries: 0,
      },
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      ...options,
    };
  }

  /**
   * Validates a test case against the schema
   */
  static validateTestCase(testCase: MetadataTestCase): { valid: boolean; errors?: string[] } {
    try {
      MetadataTestCaseSchema.parse(testCase);
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
   * Generates a mock entity
   */
  static generateMockEntity(
    type: string,
    options?: {
      id?: UUID;
      tenantId?: TenantID;
      userId?: UserID;
      data?: Record<string, any>;
      fields?: MetadataField[];
    },
  ): MetadataEntity {
    return {
      id: options?.id || (crypto.randomUUID() as UUID),
      type,
      name: `Test ${type} ${Math.random().toString(36).substr(2, 9)}`,
      description: `Test ${type} description`,
      fields: options?.fields || [],
      values: {},
      schema: {
        id: crypto.randomUUID() as UUID,
        name: `${type} Schema`,
        fields: [],
        version: '1.0.0',
        tenantId: options?.tenantId || (crypto.randomUUID() as TenantID),
        createdBy: options?.userId || (crypto.randomUUID() as UserID),
        createdAt: new Date().toISOString() as ISODate,
        isActive: true,
      },
      tenantId: options?.tenantId || (crypto.randomUUID() as TenantID),
      createdBy: options?.userId || (crypto.randomUUID() as UserID),
      createdAt: new Date().toISOString() as ISODate,
      updatedBy: options?.userId || (crypto.randomUUID() as UserID),
      updatedAt: new Date().toISOString() as ISODate,
      isActive: true,
      isDeleted: false,
      isArchived: false,
      metadata: options?.data || {},
      version: '1.0.0',
    };
  }

  /**
   * Generates a mock field
   */
  static generateMockField(
    type: MetadataFieldType,
    options?: {
      id?: UUID;
      name?: string;
      config?: Record<string, any>;
      constraints?: MetadataConstraint[];
    },
  ): MetadataField {
    return {
      id: options?.id || (crypto.randomUUID() as UUID),
      name: options?.name || `test_field_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description: `Test ${type} field`,
      config: options?.config || {},
      constraints: options?.constraints || [],
      isRequired: false,
      isUnique: false,
      isIndexed: false,
      isSearchable: false,
      isSortable: false,
      isFilterable: false,
      isComputed: false,
      isVirtual: false,
      order: 0,
      tenantId: crypto.randomUUID() as TenantID,
      createdBy: crypto.randomUUID() as UserID,
      createdAt: new Date().toISOString() as ISODate,
      updatedBy: crypto.randomUUID() as UserID,
      updatedAt: new Date().toISOString() as ISODate,
      isActive: true,
      metadata: {},
    };
  }

  /**
   * Generates a mock schema
   */
  static generateMockSchema(
    name: string,
    options?: {
      id?: UUID;
      fields?: MetadataField[];
      constraints?: MetadataConstraint[];
      config?: Record<string, any>;
    },
  ): MetadataSchema {
    return {
      id: options?.id || (crypto.randomUUID() as UUID),
      name,
      description: `Test schema for ${name}`,
      fields: options?.fields || [],
      constraints: options?.constraints || [],
      config: options?.config || {},
      version: '1.0.0',
      tenantId: crypto.randomUUID() as TenantID,
      createdBy: crypto.randomUUID() as UserID,
      createdAt: new Date().toISOString() as ISODate,
      updatedBy: crypto.randomUUID() as UserID,
      updatedAt: new Date().toISOString() as ISODate,
      isActive: true,
      metadata: {},
    };
  }

  /**
   * Generates a mock value for a field
   */
  static generateMockValue(
    field: MetadataField,
    options?: {
      valid?: boolean;
      constraints?: Record<string, any>;
    },
  ): MetadataValue {
    const valid = options?.valid !== false;

    let value: any;

    switch (field.type) {
      case 'string':
        value = valid ? `test_string_${Math.random().toString(36).substr(2, 9)}` : '';
        break;
      case 'number':
        value = valid ? Math.floor(Math.random() * 1000) : 'invalid_number';
        break;
      case 'boolean':
        value = valid ? Math.random() > 0.5 : 'invalid_boolean';
        break;
      case 'date':
        value = valid ? new Date().toISOString() : 'invalid_date';
        break;
      case 'email':
        value = valid
          ? `test${Math.random().toString(36).substr(2, 9)}@example.com`
          : 'invalid_email';
        break;
      case 'url':
        value = valid
          ? `https://example.com/${Math.random().toString(36).substr(2, 9)}`
          : 'invalid_url';
        break;
      case 'uuid':
        value = valid ? crypto.randomUUID() : 'invalid_uuid';
        break;
      case 'json':
        value = valid ? { test: 'data', number: 123 } : 'invalid_json';
        break;
      case 'array':
        value = valid ? ['item1', 'item2', 'item3'] : 'invalid_array';
        break;
      default:
        value = `test_value_${Math.random().toString(36).substr(2, 9)}`;
    }

    return {
      id: crypto.randomUUID() as UUID,
      fieldId: field.id,
      value,
      metadata: {
        generated: true,
        valid,
        timestamp: new Date().toISOString(),
      },
      tenantId: crypto.randomUUID() as TenantID,
      createdBy: crypto.randomUUID() as UserID,
      createdAt: new Date().toISOString() as ISODate,
      updatedBy: crypto.randomUUID() as UserID,
      updatedAt: new Date().toISOString() as ISODate,
      isActive: true,
    };
  }

  /**
   * Generates a mock query
   */
  static generateMockQuery(options?: {
    filter?: any;
    sort?: any;
    pagination?: any;
    aggregations?: any;
  }): MetadataQuery {
    return {
      filter: options?.filter || {
        field: 'name',
        operator: 'contains',
        value: 'test',
      },
      sort: options?.sort || [
        {
          field: 'createdAt',
          order: 'desc',
        },
      ],
      pagination: options?.pagination || {
        page: 1,
        limit: 10,
      },
      aggregations: options?.aggregations || [],
      select: ['id', 'name', 'createdAt'],
      exclude: ['metadata'],
      cache: {
        ttl: 300,
        key: `test_query_${Math.random().toString(36).substr(2, 9)}`,
      },
      options: {
        explain: false,
        timeout: 5000,
        maxResults: 1000,
        includeDeleted: false,
        includeArchived: false,
      },
    };
  }

  /**
   * Creates a test context with default values
   */
  static createTestContext(
    environment: string,
    tenantId: TenantID,
    userId: UserID,
    options?: Partial<MetadataTestContext>,
  ): MetadataTestContext {
    return {
      environment,
      tenantId,
      userId,
      testData: {},
      mocks: {},
      services: {},
      utils: {
        generateId: () => crypto.randomUUID() as UUID,
        generateEntity: this.generateMockEntity,
        generateField: this.generateMockField,
        generateSchema: this.generateMockSchema,
        generateQuery: this.generateMockQuery,
        assertEntity: (entity: MetadataEntity, expected: Record<string, any>) => {
          Object.entries(expected).forEach(([key, value]) => {
            if (entity[key as keyof MetadataEntity] !== value) {
              throw new Error(
                `Entity assertion failed: ${key} expected ${value}, got ${entity[key as keyof MetadataEntity]}`,
              );
            }
          });
        },
        assertField: (field: MetadataField, expected: Record<string, any>) => {
          Object.entries(expected).forEach(([key, value]) => {
            if (field[key as keyof MetadataField] !== value) {
              throw new Error(
                `Field assertion failed: ${key} expected ${value}, got ${field[key as keyof MetadataField]}`,
              );
            }
          });
        },
        assertSchema: (schema: MetadataSchema, expected: Record<string, any>) => {
          Object.entries(expected).forEach(([key, value]) => {
            if (schema[key as keyof MetadataSchema] !== value) {
              throw new Error(
                `Schema assertion failed: ${key} expected ${value}, got ${schema[key as keyof MetadataSchema]}`,
              );
            }
          });
        },
      },
      metadata: {},
      ...options,
    };
  }

  /**
   * Runs a test case
   */
  static async runTestCase(
    testCase: MetadataTestCase,
    context: MetadataTestContext,
  ): Promise<MetadataTestExecution> {
    const execution: MetadataTestExecution = {
      id: crypto.randomUUID() as UUID,
      testCaseId: testCase.id,
      status: MetadataTestStatus.RUNNING,
      startedAt: new Date().toISOString() as ISODate,
      result: {
        success: false,
        assertions: 0,
        passed: 0,
        failed: 0,
        errors: [],
        warnings: [],
      },
      context,
    };

    try {
      // Setup
      if (testCase.setup) {
        // Apply setup data
        Object.assign(context.testData, testCase.setup.data || {});
      }

      // Execute test
      const startTime = Date.now();
      const result = await testCase.execute(context);
      const duration = Date.now() - startTime;

      // Update execution
      execution.status = result.success ? MetadataTestStatus.PASSED : MetadataTestStatus.FAILED;
      execution.completedAt = new Date().toISOString() as ISODate;
      execution.duration = duration;
      execution.result = {
        success: result.success,
        assertions: result.data?.assertions || 0,
        passed: result.success ? result.data?.assertions || 0 : 0,
        failed: result.success ? 0 : result.data?.assertions || 1,
        errors: result.errors || [],
        warnings: result.warnings || [],
      };

      // Teardown
      if (testCase.teardown) {
        // Cleanup test data
        // This would be implemented based on the actual cleanup logic
      }
    } catch (error) {
      execution.status = MetadataTestStatus.FAILED;
      execution.completedAt = new Date().toISOString() as ISODate;
      execution.duration = Date.now() - new Date(execution.startedAt).getTime();
      execution.result.errors.push({
        code: 'TEST_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return execution;
  }

  /**
   * Runs a test suite
   */
  static async runTestSuite(
    testSuite: MetadataTestSuite,
    context: MetadataTestContext,
  ): Promise<MetadataTestExecution[]> {
    const executions: MetadataTestExecution[] = [];

    if (testSuite.config.parallel) {
      // Run tests in parallel
      const chunks = this.chunkArray(testSuite.testCases, testSuite.config.maxConcurrent);

      for (const chunk of chunks) {
        const chunkExecutions = await Promise.all(
          chunk.map((testCase) => this.runTestCase(testCase, context)),
        );
        executions.push(...chunkExecutions);

        // Check if we should stop on failure
        if (testSuite.config.stopOnFailure && chunkExecutions.some((e) => !e.result.success)) {
          break;
        }
      }
    } else {
      // Run tests sequentially
      for (const testCase of testSuite.testCases) {
        const execution = await this.runTestCase(testCase, context);
        executions.push(execution);

        // Check if we should stop on failure
        if (testSuite.config.stopOnFailure && !execution.result.success) {
          break;
        }
      }
    }

    return executions;
  }

  /**
   * Generates a test report
   */
  static generateTestReport(executions: MetadataTestExecution[]): string {
    const total = executions.length;
    const passed = executions.filter((e) => e.result.success).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    let report = `# Test Execution Report\n\n`;
    report += `**Total Tests:** ${total}\n`;
    report += `**Passed:** ${passed}\n`;
    report += `**Failed:** ${failed}\n`;
    report += `**Success Rate:** ${successRate.toFixed(2)}%\n\n`;

    if (failed > 0) {
      report += `## Failed Tests\n\n`;
      executions
        .filter((e) => !e.result.success)
        .forEach((execution) => {
          report += `### ${execution.testCaseId}\n`;
          report += `- **Duration:** ${execution.duration}ms\n`;
          report += `- **Errors:** ${execution.result.errors.length}\n`;
          execution.result.errors.forEach((error) => {
            report += `  - ${error.code}: ${error.message}\n`;
          });
          report += `\n`;
        });
    }

    return report;
  }

  /**
   * Utility function to chunk an array
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static randomSortOrder() {
    return ['asc', 'desc'][Math.floor(Math.random() * 2)] as 'asc' | 'desc';
  }

  static randomFieldType(): MetadataFieldType {
    const types = Object.values(MetadataFieldType);
    return types[Math.floor(Math.random() * types.length)];
  }
}

// All exports are already defined above as individual exports
