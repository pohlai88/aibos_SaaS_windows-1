#!/usr/bin/env ts-node

/**
 * AI-BOS Shared Library Performance Benchmarking Suite
 *
 * This script provides comprehensive performance testing for all major components
 * of the shared library to ensure optimal performance in production environments.
 */

import { performance } from 'perf_hooks';
import { MemoryCache, RedisCache, MultiLevelCache } from '../lib/cache';
import { DatabaseManager, DatabaseUtils } from '../lib/database';
import { SecurityManager } from '../lib/security';
import { monitoring } from '../lib/monitoring';
import { isUUID, isEmail, isValidURL } from '../types/primitives';

// ============================================================================
// BENCHMARK CONFIGURATION
// ============================================================================

interface BenchmarkConfig {
  iterations: number;
  warmupIterations: number;
  timeout: number;
  enableDetailedLogging: boolean;
  enableMemoryProfiling: boolean;
}

const DEFAULT_CONFIG: BenchmarkConfig = {
  iterations: 10000,
  warmupIterations: 1000,
  timeout: 30000,
  enableDetailedLogging: true,
  enableMemoryProfiling: true,
};

// ============================================================================
// BENCHMARK RESULTS
// ============================================================================

interface BenchmarkResult {
  name: string;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  operationsPerSecond: number;
  memoryUsage?: {
    before: number;
    after: number;
    peak: number;
  };
  success: boolean;
  error?: string;
}

interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalTime: number;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageOpsPerSecond: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getMemoryUsage(): number {
  return process.memoryUsage().heapUsed;
}

function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(2);
}

// ============================================================================
// BENCHMARK RUNNER
// ============================================================================

class BenchmarkRunner {
  private config: BenchmarkConfig;
  private results: BenchmarkSuite[] = [];

  constructor(config: Partial<BenchmarkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async runBenchmark(
    name: string,
    fn: () => void | Promise<void>,
    iterations?: number,
  ): Promise<BenchmarkResult> {
    const iterCount = iterations || this.config.iterations;
    const times: number[] = [];
    let error: string | undefined;
    let success = true;

    const memoryBefore = this.config.enableMemoryProfiling ? getMemoryUsage() : 0;
    let memoryPeak = memoryBefore;

    try {
      // Warmup
      for (let i = 0; i < this.config.warmupIterations; i++) {
        await fn();
      }

      // Actual benchmark
      for (let i = 0; i < iterCount; i++) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        times.push(end - start);

        if (this.config.enableMemoryProfiling) {
          const currentMemory = getMemoryUsage();
          if (currentMemory > memoryPeak) {
            memoryPeak = currentMemory;
          }
        }
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const memoryAfter = this.config.enableMemoryProfiling ? getMemoryUsage() : 0;

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const operationsPerSecond = 1000 / averageTime;

    return {
      name,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      operationsPerSecond,
      memoryUsage: this.config.enableMemoryProfiling
        ? {
            before: memoryBefore,
            after: memoryAfter,
            peak: memoryPeak,
          }
        : undefined,
      success,
      error,
    };
  }

  async runSuite(
    name: string,
    benchmarks: Array<{ name: string; fn: () => void | Promise<void> }>,
  ): Promise<BenchmarkSuite> {
    console.log(`\n🚀 Running benchmark suite: ${name}`);
    console.log('='.repeat(60));

    const results: BenchmarkResult[] = [];
    const startTime = performance.now();

    for (const benchmark of benchmarks) {
      const result = await this.runBenchmark(benchmark.name, benchmark.fn);
      results.push(result);
      this.logResult(result);
    }

    const totalTime = performance.now() - startTime;
    const passedTests = results.filter((r) => r.success).length;
    const failedTests = results.filter((r) => !r.success).length;
    const averageOpsPerSecond =
      results.reduce((sum, r) => sum + r.operationsPerSecond, 0) / results.length;

    const suite: BenchmarkSuite = {
      name,
      results,
      totalTime,
      summary: {
        totalTests: results.length,
        passedTests,
        failedTests,
        averageOpsPerSecond,
      },
    };

    this.logSuiteSummary(suite);
    this.results.push(suite);
    return suite;
  }

  private logResult(result: BenchmarkResult): void {
    const status = result.success ? '✅' : '❌';
    const timeStr = formatTime(result.averageTime);
    const opsStr = formatNumber(result.operationsPerSecond);

    console.log(`${status} ${result.name}:`);
    console.log(`   Average: ${timeStr} (${opsStr} ops/sec)`);
    console.log(`   Range: ${formatTime(result.minTime)} - ${formatTime(result.maxTime)}`);

    if (result.memoryUsage) {
      const memoryDiff = result.memoryUsage.after - result.memoryUsage.before;
      const memoryStr = formatNumber(memoryDiff);
      console.log(`   Memory: ${memoryStr} bytes`);
    }

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }

  private logSuiteSummary(suite: BenchmarkSuite): void {
    console.log('📊 Suite Summary:');
    console.log(`   Total Tests: ${suite.summary.totalTests}`);
    console.log(`   Passed: ${suite.summary.passedTests}`);
    console.log(`   Failed: ${suite.summary.failedTests}`);
    console.log(`   Average Ops/sec: ${formatNumber(suite.summary.averageOpsPerSecond)}`);
    console.log(`   Total Time: ${formatTime(suite.totalTime)}`);
    console.log('');
  }

  generateReport(): void {
    console.log('\n📈 PERFORMANCE BENCHMARK REPORT');
    console.log('='.repeat(60));

    for (const suite of this.results) {
      console.log(`\n🏆 ${suite.name.toUpperCase()}`);
      console.log('-'.repeat(40));

      const sortedResults = [...suite.results].sort(
        (a, b) => b.operationsPerSecond - a.operationsPerSecond,
      );

      for (const result of sortedResults) {
        const status = result.success ? '✅' : '❌';
        const opsStr = formatNumber(result.operationsPerSecond);
        console.log(`${status} ${result.name}: ${opsStr} ops/sec`);
      }
    }

    // Overall summary
    const allResults = this.results.flatMap((s) => s.results);
    const totalTests = allResults.length;
    const passedTests = allResults.filter((r) => r.success).length;
    const averageOpsPerSecond =
      allResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / allResults.length;

    console.log('\n🎯 OVERALL SUMMARY');
    console.log('-'.repeat(40));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Average Performance: ${formatNumber(averageOpsPerSecond)} ops/sec`);
  }
}

// ============================================================================
// BENCHMARK SUITES
// ============================================================================

async function runPrimitiveTypeBenchmarks(runner: BenchmarkRunner): Promise<void> {
  await runner.runSuite('Primitive Type Validation', [
    {
      name: 'UUID Validation',
      fn: () => isUUID('123e4567-e89b-12d3-a456-426614174000'),
    },
    {
      name: 'Email Validation',
      fn: () => isEmail('test@example.com'),
    },
    {
      name: 'URL Validation',
      fn: () => isValidURL('https://example.com'),
    },
    {
      name: 'Invalid UUID Validation',
      fn: () => isUUID('invalid-uuid'),
    },
    {
      name: 'Invalid Email Validation',
      fn: () => isEmail('invalid-email'),
    },
  ]);
}

async function runCacheBenchmarks(runner: BenchmarkRunner): Promise<void> {
  const memoryCache = new MemoryCache();
  const testData = { id: 1, name: 'test', timestamp: Date.now() };

  await runner.runSuite('Cache Performance', [
    {
      name: 'Memory Cache Set',
      fn: () => memoryCache.set('test-key', testData),
    },
    {
      name: 'Memory Cache Get',
      fn: () => memoryCache.get('test-key'),
    },
    {
      name: 'Memory Cache Has',
      fn: () => memoryCache.has('test-key'),
    },
    {
      name: 'Memory Cache Delete',
      fn: () => memoryCache.delete('test-key'),
    },
  ]);
}

async function runDatabaseBenchmarks(runner: BenchmarkRunner): Promise<void> {
  // Mock database operations for benchmarking
  const mockQuery = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    return { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
  };

  await runner.runSuite('Database Operations', [
    {
      name: 'Mock Query Execution',
      fn: mockQuery,
    },
    {
      name: 'Query Builder Construction',
      fn: () => {
        const builder = DatabaseUtils.table('users')
          .select('id', 'name', 'email')
          .where('active', '=', true)
          .orderBy('created_at', 'DESC')
          .limit(10);
        return builder.build();
      },
    },
  ]);
}

async function runSecurityBenchmarks(runner: BenchmarkRunner): Promise<void> {
  const testData = 'sensitive-data-to-encrypt';

  await runner.runSuite('Security Operations', [
    {
      name: 'Hash Generation',
      fn: () => {
        // Mock hash operation
        return Buffer.from(testData).toString('base64');
      },
    },
    {
      name: 'Encryption Simulation',
      fn: () => {
        // Mock encryption
        return Buffer.from(testData).toString('base64');
      },
    },
  ]);
}

async function runMetadataBenchmarks(runner: BenchmarkRunner): Promise<void> {
  await runner.runSuite('Metadata Operations', [
    {
      name: 'Metadata Field Creation',
      fn: () => {
        // Mock metadata field creation
        return {
          name: 'test_field',
          type: 'string',
          required: true,
          constraints: { maxLength: 255 },
        };
      },
    },
    {
      name: 'Metadata Validation',
      fn: () => {
        // Mock validation
        return { isValid: true, errors: [] };
      },
    },
  ]);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  console.log('🔬 AI-BOS Shared Library Performance Benchmarking');
  console.log('='.repeat(60));

  const runner = new BenchmarkRunner({
    iterations: 10000,
    warmupIterations: 1000,
    enableDetailedLogging: true,
    enableMemoryProfiling: true,
  });

  try {
    // Run all benchmark suites
    await runPrimitiveTypeBenchmarks(runner);
    await runCacheBenchmarks(runner);
    await runDatabaseBenchmarks(runner);
    await runSecurityBenchmarks(runner);
    await runMetadataBenchmarks(runner);

    // Generate final report
    runner.generateReport();

    console.log('\n✅ Benchmarking completed successfully!');
  } catch (error) {
    console.error('\n❌ Benchmarking failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BenchmarkRunner, BenchmarkResult, BenchmarkSuite };
