import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Load environment variables
const env = process.env;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts'],
    
    // Dynamic environment-based configuration
    coverage: {
      provider: 'v8',
      enabled: env.CI === 'true' || env.COVERAGE === 'true',
      reporter: env.CI 
        ? ['text', 'lcov', 'html', 'json', 'json-summary']
        : ['text', 'lcov', 'html', 'json'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/__tests__/**',
        '**/__mocks__/**',
        'scripts/',
        'config/',
        'examples/',
        '**/*.d.ts',
        '**/types/**',
        '**/index.ts',
        '**/rollup.config.js',
        '**/vitest.config.ts',
        '**/tsconfig.json',
        '**/package.json',
        '**/README.md',
        '**/.eslintrc*',
        '**/.prettierrc*',
        // Enterprise security exclusions
        '**/secrets/**',
        '**/auth/**',
        '**/certificates/**',
        '**/*.key',
        '**/*.env*',
        '**/__fixtures__/**',
        '**/test-data/**',
        '**/mocks/**',
        '**/stubs/**',
      ],
      thresholds: {
        global: {
          branches: parseInt(env.VITEST_COVERAGE_BRANCHES || '80'),
          functions: parseInt(env.VITEST_COVERAGE_FUNCTIONS || '80'),
          lines: parseInt(env.VITEST_COVERAGE_LINES || '80'),
          statements: parseInt(env.VITEST_COVERAGE_STATEMENTS || '80'),
        },
        './lib/': {
          branches: parseInt(env.VITEST_LIB_COVERAGE_BRANCHES || '85'),
          functions: parseInt(env.VITEST_LIB_COVERAGE_FUNCTIONS || '85'),
          lines: parseInt(env.VITEST_LIB_COVERAGE_LINES || '85'),
          statements: parseInt(env.VITEST_LIB_COVERAGE_STATEMENTS || '85'),
        },
        './types/': {
          branches: parseInt(env.VITEST_TYPES_COVERAGE_BRANCHES || '90'),
          functions: parseInt(env.VITEST_TYPES_COVERAGE_FUNCTIONS || '90'),
          lines: parseInt(env.VITEST_TYPES_COVERAGE_LINES || '90'),
          statements: parseInt(env.VITEST_TYPES_COVERAGE_STATEMENTS || '90'),
        },
      },
      all: true,
      // Visual compliance markers
      watermarks: {
        statements: [50, 80],
        lines: [50, 80],
        branches: [50, 80],
        functions: [50, 80],
      },
    },
    
    include: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      '**/*.d.ts',
      '**/examples/**',
      '**/scripts/**',
      '**/config/**',
      '**/test-data/**',
      '**/mocks/**',
      '**/stubs/**',
    ],
    
    // Performance optimization
    testTimeout: parseInt(env.VITEST_TIMEOUT || '10000'),
    hookTimeout: parseInt(env.VITEST_HOOK_TIMEOUT || '10000'),
    teardownTimeout: parseInt(env.VITEST_TEARDOWN_TIMEOUT || '10000'),
    
    // Advanced parallelization
    pool: env.CI ? 'threads' : 'forks',
    poolOptions: {
      forks: {
        isolate: !env.CI, // Disable in CI for better performance
        singleFork: true,
      },
      threads: {
        useAtomics: true,
        minThreads: 1,
        maxThreads: env.CI ? 4 : 2,
      }
    },
    
    maxConcurrency: parseInt(env.VITEST_MAX_CONCURRENCY || '1'),
    isolate: true,
    passWithNoTests: true,
    silent: false,
    
    // Advanced reporting
    reporters: env.CI 
      ? ['verbose', 'json']
      : ['verbose', 'json'],
    outputFile: {
      json: './coverage/test-results.json',
    },
    
    // Fail-safe mechanisms
    retry: env.CI ? 1 : 0,
    
    // Console output control
    onConsoleLog(log, type) {
      if (type === 'stderr') {
        return false;
      }
      return true;
    },
    
    // Test sequence randomization
    sequence: {
      shuffle: env.CI === 'true' // Randomize in CI
    },
    
    // Cache configuration
    cache: {
      dir: resolve(__dirname, '.vitest-cache'),
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@types': resolve(__dirname, './types'),
      '@lib': resolve(__dirname, './lib'),
      '@utils': resolve(__dirname, './utils'),
      '@validation': resolve(__dirname, './validation'),
      '@metadata': resolve(__dirname, './types/metadata'),
      '@config': resolve(__dirname, './config'),
      '@examples': resolve(__dirname, './examples'),
      '@ai': resolve(__dirname, './ai/src'),
      '@cli': resolve(__dirname, './cli/src'),
      '@collaboration': resolve(__dirname, './collaboration/src'),
      '@compliance': resolve(__dirname, './compliance/src'),
      '@debugging': resolve(__dirname, './debugging/src'),
      '@monitoring': resolve(__dirname, './monitoring/src'),
      '@ui-components': resolve(__dirname, './ui-components/src'),
      '@vscode-extension': resolve(__dirname, './vscode-extension/src'),
      '@components': resolve(__dirname, './ui-components/src'),
      '@hooks': resolve(__dirname, './ui-components/src/hooks'),
      '@primitives': resolve(__dirname, './ui-components/src/primitives'),
      '@theme': resolve(__dirname, './ui-components/src/theme'),
      '@analytics': resolve(__dirname, './ui-components/src/analytics'),
      '@data': resolve(__dirname, './ui-components/src/data'),
      '@forms': resolve(__dirname, './ui-components/src/forms'),
      '@layout': resolve(__dirname, './ui-components/src/layout'),
      '@performance': resolve(__dirname, './ui-components/src/performance'),
      '@search': resolve(__dirname, './ui-components/src/search'),
      '@feedback': resolve(__dirname, './ui-components/src/feedback'),
      '@job-queue': resolve(__dirname, './ui-components/src/job-queue'),
    },
  },
});
