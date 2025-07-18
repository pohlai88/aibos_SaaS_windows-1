/**
 * AI-BOS Shared Library Performance Tests
 *
 * This test suite validates performance requirements and identifies
 * performance regressions in the shared library components.
 */

import { performance } from 'perf_hooks';
import { MemoryCache, RedisCache, MultiLevelCache } from '../../lib/cache';
import { DatabaseManager, DatabaseUtils } from '../../lib/database';
import { SecurityManager } from '../../lib/security';
import { isUUID, isEmail, isValidURL } from '../../types/primitives';
import type { createMetadataField,
  MetadataFieldType,
  MetadataValidationRule,
 } from '../../types/metadata';

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

const PERFORMANCE_THRESHOLDS = {
  // Operations per second
  PRIMITIVE_VALIDATION: 1000000, // 1M ops/sec
  CACHE_OPERATIONS: 500000, // 500K ops/sec
  DATABASE_QUERIES: 1000, // 1K ops/sec
  METADATA_OPERATIONS: 10000, // 10K ops/sec
  SECURITY_OPERATIONS: 50000, // 50K ops/sec

  // Response times (milliseconds)
  CACHE_GET: 1, // 1ms
  CACHE_SET: 5, // 5ms
  DATABASE_QUERY: 50, // 50ms
  METADATA_CREATION: 10, // 10ms
  SECURITY_HASH: 5, // 5ms

  // Memory usage (bytes)
  MAX_MEMORY_INCREASE: 10 * 1024 * 1024, // 10MB
  CACHE_MEMORY_PER_ENTRY: 1024, // 1KB per entry
} as const;

// ============================================================================
// PERFORMANCE TEST UTILITIES
// ============================================================================

function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  iterations: number = 10000,
): Promise<{
  name: string;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
  memoryUsage?: number;
}> {
  return new Promise(async (resolve) => {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    // Warmup
    for (let i = 0; i < Math.min(1000, iterations / 10); i++) {
      await fn();
    }

    // Actual measurement
    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const operationsPerSecond = 1000 / averageTime;
    const memoryUsage = endMemory - startMemory;

    resolve({
      name,
      totalTime,
      averageTime,
      operationsPerSecond,
      memoryUsage,
    });
  });
}

function formatPerformanceResult(result: {
  name: string;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
  memoryUsage?: number;
}): string {
  const timeStr =
    result.averageTime < 1
      ? `${(result.averageTime * 1000).toFixed(2)}μs`
      : `${result.averageTime.toFixed(2)}ms`;

  const opsStr =
    result.operationsPerSecond >= 1000000
      ? `${(result.operationsPerSecond / 1000000).toFixed(2)}M`
      : result.operationsPerSecond >= 1000
        ? `${(result.operationsPerSecond / 1000).toFixed(2)}K`
        : result.operationsPerSecond.toFixed(2);

  const memoryStr = result.memoryUsage
    ? ` (Memory: ${(result.memoryUsage / 1024).toFixed(2)}KB)`
    : '';

  return `${result.name}: ${timeStr} (${opsStr} ops/sec)${memoryStr}`;
}

// ============================================================================
// PERFORMANCE TEST SUITES
// ============================================================================

describe('Performance Tests', () => {
  describe('Primitive Type Validation', () => {
    it('should validate UUIDs with high performance', async () => {
      const result = await measurePerformance(
        'UUID Validation',
        () => isUUID('123e4567-e89b-12d3-a456-426614174000'),
        100000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.PRIMITIVE_VALIDATION,
      );
      expect(result.averageTime).toBeLessThan(1); // Less than 1ms
    });

    it('should validate emails with high performance', async () => {
      const result = await measurePerformance(
        'Email Validation',
        () => isEmail('test@example.com'),
        100000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.PRIMITIVE_VALIDATION,
      );
    });

    it('should validate URLs with high performance', async () => {
      const result = await measurePerformance(
        'URL Validation',
        () => isValidURL('https://example.com'),
        100000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.PRIMITIVE_VALIDATION,
      );
    });

    it('should handle invalid inputs efficiently', async () => {
      const result = await measurePerformance(
        'Invalid Input Validation',
        () => {
          isUUID('invalid-uuid');
          isEmail('invalid-email');
          isValidURL('invalid-url');
        },
        100000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.PRIMITIVE_VALIDATION * 0.5,
      );
    });
  });

  describe('Cache Performance', () => {
    let memoryCache: MemoryCache;
    let testData: any;

    beforeEach(() => {
      memoryCache = new MemoryCache({
        defaultTTL: 5 * 60 * 1000,
        maxSize: 10000,
      });

      testData = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        timestamp: Date.now(),
        metadata: {
          role: 'user',
          permissions: ['read', 'write'],
          settings: { theme: 'dark', notifications: true },
        },
      };
    });

    afterEach(() => {
      memoryCache.destroy();
    });

    it('should perform cache set operations efficiently', async () => {
      const result = await measurePerformance(
        'Cache Set Operations',
        () => memoryCache.set(`key-${Math.random()}`, testData),
        10000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(PERFORMANCE_THRESHOLDS.CACHE_OPERATIONS);
      expect(result.averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CACHE_SET);
    });

    it('should perform cache get operations efficiently', async () => {
      // Pre-populate cache
      for (let i = 0; i < 1000; i++) {
        memoryCache.set(`key-${i}`, testData);
      }

      const result = await measurePerformance(
        'Cache Get Operations',
        () => memoryCache.get(`key-${Math.floor(Math.random() * 1000)}`),
        10000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(PERFORMANCE_THRESHOLDS.CACHE_OPERATIONS);
      expect(result.averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CACHE_GET);
    });

    it('should handle cache eviction efficiently', async () => {
      const smallCache = new MemoryCache({ maxSize: 100 });

      const result = await measurePerformance(
        'Cache Eviction',
        () => {
          for (let i = 0; i < 200; i++) {
            smallCache.set(`key-${i}`, testData);
          }
        },
        100,
      );

      console.log(formatPerformanceResult(result));

      expect(result.averageTime).toBeLessThan(100); // Less than 100ms
    });

    it('should maintain memory efficiency', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Add 1000 entries
      for (let i = 0; i < 1000; i++) {
        memoryCache.set(`key-${i}`, testData);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Each entry should use approximately 1KB
      const expectedMemory = 1000 * PERFORMANCE_THRESHOLDS.CACHE_MEMORY_PER_ENTRY;

      expect(memoryIncrease).toBeLessThan(expectedMemory * 2); // Allow 2x overhead
    });
  });

  describe('Database Performance', () => {
    it('should build queries efficiently', async () => {
      const result = await measurePerformance(
        'Query Builder Construction',
        () => {
          DatabaseUtils.table('users')
            .select('id', 'name', 'email', 'created_at')
            .where('active', '=', true)
            .where('role', 'IN', ['user', 'admin'])
            .orderBy('created_at', 'DESC')
            .limit(10)
            .offset(0)
            .build();
        },
        10000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(10000);
      expect(result.averageTime).toBeLessThan(1); // Less than 1ms
    });

    it('should handle complex query building', async () => {
      const result = await measurePerformance(
        'Complex Query Building',
        () => {
          DatabaseUtils.table('orders')
            .select('o.id', 'o.total', 'u.name as user_name')
            .join('users u', 'o.user_id = u.id')
            .where('o.status', '=', 'completed')
            .where('o.created_at', '>=', '2024-01-01')
            .where('o.total', '>', 100)
            .orderBy('o.created_at', 'DESC')
            .groupBy('o.id', 'u.name')
            .having('COUNT(*)', '>', 1)
            .limit(50)
            .build();
        },
        1000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(1000);
    });
  });

  describe('Metadata Operations', () => {
    it('should create metadata fields efficiently', async () => {
      const result = await measurePerformance(
        'Metadata Field Creation',
        () => {
          createMetadataField({
            name: 'test_field',
            type: MetadataFieldType.STRING,
            required: true,
            validation: [
              MetadataValidationRule.MAX_LENGTH(255),
              MetadataValidationRule.PATTERN(/^[a-zA-Z0-9_]+$/),
            ],
            options: {
              defaultValue: 'test',
              description: 'Test field for performance testing',
            },
          });
        },
        10000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.METADATA_OPERATIONS,
      );
      expect(result.averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.METADATA_CREATION);
    });

    it('should handle complex metadata schemas', async () => {
      const result = await measurePerformance(
        'Complex Metadata Schema',
        () => {
          // Create a complex schema with multiple fields
          const fields = [];
          for (let i = 0; i < 10; i++) {
            fields.push(
              createMetadataField({
                name: `field_${i}`,
                type: MetadataFieldType.STRING,
                required: i % 2 === 0,
                validation: [
                  MetadataValidationRule.MAX_LENGTH(100),
                  MetadataValidationRule.MIN_LENGTH(1),
                ],
              }),
            );
          }
          return fields;
        },
        1000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(1000);
    });
  });

  describe('Security Operations', () => {
    let securityManager: SecurityManager;

    beforeEach(() => {
      securityManager = new SecurityManager({
        encryptionLevel: 'AES-256',
        hashAlgorithm: 'SHA-256',
      });
    });

    it('should hash passwords efficiently', async () => {
      const result = await measurePerformance(
        'Password Hashing',
        async () => {
          await securityManager.hash('test-password-123');
        },
        1000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.SECURITY_OPERATIONS,
      );
      expect(result.averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SECURITY_HASH);
    });

    it('should encrypt data efficiently', async () => {
      const testData = 'sensitive-data-to-encrypt-' + Math.random();

      const result = await measurePerformance(
        'Data Encryption',
        async () => {
          await securityManager.encrypt(testData);
        },
        1000,
      );

      console.log(formatPerformanceResult(result));

      expect(result.operationsPerSecond).toBeGreaterThan(1000);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform various operations
      const cache = new MemoryCache();
      const results = [];

      for (let i = 0; i < 1000; i++) {
        const result = await measurePerformance(
          `Operation ${i}`,
          () => {
            cache.set(`key-${i}`, { data: `value-${i}` });
            cache.get(`key-${i}`);
            isUUID('123e4567-e89b-12d3-a456-426614174000');
            isEmail('test@example.com');
          },
          100,
        );
        results.push(result);
      }

      cache.destroy();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_MEMORY_INCREASE);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent cache operations', async () => {
      const cache = new MemoryCache();
      const concurrentOperations = 100;
      const operationsPerThread = 1000;

      const startTime = performance.now();

      const promises = Array.from({ length: concurrentOperations }, async (_, i) => {
        return measurePerformance(
          `Concurrent Cache ${i}`,
          () => {
            cache.set(`key-${i}-${Math.random()}`, { data: `value-${i}` });
            cache.get(`key-${i}-${Math.random()}`);
          },
          operationsPerThread,
        );
      });

      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      const totalOperations = concurrentOperations * operationsPerThread;
      const totalOpsPerSecond = (totalOperations / totalTime) * 1000;

      console.log(`Concurrent operations: ${totalOpsPerSecond.toFixed(2)} ops/sec`);

      expect(totalOpsPerSecond).toBeGreaterThan(100000); // 100K ops/sec total

      cache.destroy();
    });
  });
});

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

describe('Performance Monitoring', () => {
  it('should track performance metrics', () => {
    const metrics: Array<{
      name: string;
      operationsPerSecond: number;
      averageTime: number;
      timestamp: number;
    }> = [];

    // This test ensures we can track performance over time
    const testMetric = {
      name: 'test-operation',
      operationsPerSecond: 1000000,
      averageTime: 0.001,
      timestamp: Date.now(),
    };

    metrics.push(testMetric);

    expect(metrics).toHaveLength(1);
    expect(metrics[0].operationsPerSecond).toBeGreaterThan(0);
    expect(metrics[0].averageTime).toBeGreaterThan(0);
  });
});
