import { vi, expect, beforeEach, afterEach } from 'vitest';
import { createTestUser, createTestTenant, createTestEvent } from './utils';

// Enterprise test utilities for advanced scenarios

/**
 * Performance testing utilities
 */
export class PerformanceTester {
  private measurements: Array<{ name: string; duration: number; timestamp: number }> = [];

  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    this.measurements.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    return result;
  }

  async measureSync<T>(name: string, fn: () => T): Promise<T> {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    this.measurements.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    return result;
  }

  getMeasurements() {
    return [...this.measurements];
  }

  getAverageDuration(name: string): number {
    const measurements = this.measurements.filter((m) => m.name === name);
    if (measurements.length === 0) return 0;

    const total = measurements.reduce((sum, m) => sum + m.duration, 0);
    return total / measurements.length;
  }

  clear() {
    this.measurements.length = 0;
  }
}

/**
 * Load testing utilities
 */
export class LoadTester {
  async runConcurrent<T>(
    count: number,
    fn: () => Promise<T>,
    options: { delay?: number; maxConcurrency?: number } = {},
  ): Promise<T[]> {
    const { delay = 0, maxConcurrency = 10 } = options;
    const results: T[] = [];
    const chunks = this.chunkArray(
      Array.from({ length: count }, (_, i) => i),
      maxConcurrency,
    );

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (_, index) => {
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay * index));
        }
        return await fn();
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Security testing utilities
 */
export class SecurityTester {
  private maliciousInputs = [
    '<script>alert("xss")</script>',
    '"; DROP TABLE users; --',
    '../../../etc/passwd',
    '${7*7}',
    '{{7*7}}',
    '{{config}}',
    '{{request}}',
    '{{session}}',
    '{{cookies}}',
    '{{headers}}',
    '{{params}}',
    '{{query}}',
    '{{body}}',
    '{{files}}',
    '{{method}}',
    '{{url}}',
    '{{path}}',
    '{{host}}',
    '{{port}}',
    '{{protocol}}',
    '{{user_agent}}',
    '{{ip}}',
    '{{remote_addr}}',
    '{{request.environ}}',
    '{{request.environ.HTTP_HOST}}',
    '{{request.environ.HTTP_USER_AGENT}}',
    '{{request.environ.HTTP_REFERER}}',
    '{{request.environ.HTTP_COOKIE}}',
    '{{request.environ.HTTP_ACCEPT}}',
    '{{request.environ.HTTP_ACCEPT_LANGUAGE}}',
    '{{request.environ.HTTP_ACCEPT_ENCODING}}',
    '{{request.environ.HTTP_CONNECTION}}',
    '{{request.environ.HTTP_UPGRADE_INSECURE_REQUESTS}}',
    '{{request.environ.HTTP_CACHE_CONTROL}}',
    '{{request.environ.HTTP_PRAGMA}}',
    '{{request.environ.HTTP_EXPECT}}',
    '{{request.environ.HTTP_TRANSFER_ENCODING}}',
    '{{request.environ.HTTP_CONTENT_LENGTH}}',
    '{{request.environ.HTTP_CONTENT_TYPE}}',
    '{{request.environ.HTTP_CONTENT_ENCODING}}',
    '{{request.environ.HTTP_CONTENT_LANGUAGE}}',
    '{{request.environ.HTTP_CONTENT_LOCATION}}',
    '{{request.environ.HTTP_CONTENT_MD5}}',
    '{{request.environ.HTTP_CONTENT_RANGE}}',
    '{{request.environ.HTTP_CONTENT_DISPOSITION}}',
    '{{request.environ.HTTP_CONTENT_SECURITY_POLICY}}',
    '{{request.environ.HTTP_CONTENT_SECURITY_POLICY_REPORT_ONLY}}',
    '{{request.environ.HTTP_X_FORWARDED_FOR}}',
    '{{request.environ.HTTP_X_FORWARDED_HOST}}',
    '{{request.environ.HTTP_X_FORWARDED_PROTO}}',
    '{{request.environ.HTTP_X_FORWARDED_PORT}}',
    '{{request.environ.HTTP_X_FORWARDED_SERVER}}',
    '{{request.environ.HTTP_X_FORWARDED_URI}}',
    '{{request.environ.HTTP_X_FORWARDED_FOR_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_HOST_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_PROTO_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_PORT_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_SERVER_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_URI_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_FOR_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_HOST_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_PROTO_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_PORT_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_SERVER_ORIGINAL}}',
    '{{request.environ.HTTP_X_FORWARDED_URI_ORIGINAL}}',
  ];

  testMaliciousInputs(fn: (input: string) => any, options: { shouldThrow?: boolean } = {}) {
    const { shouldThrow = true } = options;

    this.maliciousInputs.forEach((input, index) => {
      it(`should handle malicious input ${index + 1}: ${input.substring(0, 50)}...`, () => {
        if (shouldThrow) {
          expect(() => fn(input)).toThrow();
        } else {
          expect(() => fn(input)).not.toThrow();
        }
      });
    });
  }

  testSQLInjection(fn: (input: string) => any) {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "' OR 1=1 --",
      "' OR 'x'='x",
      "'; EXEC xp_cmdshell('dir'); --",
      "' UNION SELECT username, password FROM users --",
      "'; WAITFOR DELAY '00:00:05'; --",
      "' AND (SELECT COUNT(*) FROM users) > 0 --",
    ];

    sqlInjectionAttempts.forEach((attempt, index) => {
      it(`should prevent SQL injection ${index + 1}`, () => {
        expect(() => fn(attempt)).toThrow();
      });
    });
  }

  testXSS(fn: (input: string) => any) {
    const xssAttempts = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(\'xss\')">',
      '<svg onload="alert(\'xss\')">',
      '<iframe src="javascript:alert(\'xss\')">',
      '<object data="javascript:alert(\'xss\')">',
      '<embed src="javascript:alert(\'xss\')">',
      '<link rel="stylesheet" href="javascript:alert(\'xss\')">',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(\'xss\')">',
      '<body onload="alert(\'xss\')">',
      '<div onmouseover="alert(\'xss\')">',
    ];

    xssAttempts.forEach((attempt, index) => {
      it(`should prevent XSS ${index + 1}`, () => {
        const result = fn(attempt);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('onerror=');
        expect(result).not.toContain('onload=');
        expect(result).not.toContain('javascript:');
      });
    });
  }
}

/**
 * Data validation testing utilities
 */
export class ValidationTester {
  testBoundaryConditions(
    fn: (input: any) => any,
    testCases: Array<{
      input: any;
      shouldPass: boolean;
      description: string;
    }>,
  ) {
    testCases.forEach(({ input, shouldPass, description }) => {
      it(`should handle boundary condition: ${description}`, () => {
        if (shouldPass) {
          expect(() => fn(input)).not.toThrow();
        } else {
          expect(() => fn(input)).toThrow();
        }
      });
    });
  }

  testEdgeCases(fn: (input: any) => any) {
    const edgeCases = [
      null,
      undefined,
      '',
      '   ',
      0,
      -1,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      Infinity,
      -Infinity,
      NaN,
      [],
      {},
      new Date(),
      new Date('invalid'),
      new Error(),
      new Promise(() => {}),
      Symbol(),
      BigInt(0),
    ];

    edgeCases.forEach((edgeCase, index) => {
      it(`should handle edge case ${index + 1}: ${typeof edgeCase}`, () => {
        expect(() => fn(edgeCase)).not.toThrow();
      });
    });
  }
}

/**
 * Memory testing utilities
 */
export class MemoryTester {
  private initialMemory: number = 0;

  startTracking() {
    this.initialMemory = process.memoryUsage().heapUsed;
  }

  endTracking() {
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryUsed = finalMemory - this.initialMemory;

    // Log memory usage (in MB)
    console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);

    return memoryUsed;
  }

  testMemoryLeak(fn: () => void, iterations: number = 1000) {
    this.startTracking();

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const memoryUsed = this.endTracking();

    // If memory usage is more than 10MB, it might be a leak
    const memoryMB = memoryUsed / 1024 / 1024;
    expect(memoryMB).toBeLessThan(10);
  }
}

/**
 * Concurrency testing utilities
 */
export class ConcurrencyTester {
  async testRaceConditions(fn: () => Promise<any>, concurrentCalls: number = 10) {
    const promises = Array.from({ length: concurrentCalls }, () => fn());
    const results = await Promise.all(promises);

    // All results should be consistent
    const firstResult = results[0];
    results.forEach((result, index) => {
      expect(result).toEqual(firstResult);
    });

    return results;
  }

  async testDeadlocks(fn: () => Promise<any>, timeout: number = 5000) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Deadlock detected')), timeout);
    });

    const resultPromise = fn();

    await Promise.race([resultPromise, timeoutPromise]);
  }
}

// Export all utilities
export const performanceTester = new PerformanceTester();
export const loadTester = new LoadTester();
export const securityTester = new SecurityTester();
export const validationTester = new ValidationTester();
export const memoryTester = new MemoryTester();
export const concurrencyTester = new ConcurrencyTester();

// Global setup for enterprise testing
beforeEach(() => {
  performanceTester.clear();
});

afterEach(() => {
  // Clean up any global state
  vi.clearAllMocks();
});
