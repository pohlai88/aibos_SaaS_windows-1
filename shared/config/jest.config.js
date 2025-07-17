module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/examples/**',
    '!**/scripts/**',
    '!**/config/**',
    '!**/rollup.config.js',
    '!**/jest.config.js',
    '!**/jest.setup.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(zod|redis|pg)/)'],
  testTimeout: 30000,
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  detectOpenHandles: true,
  forceExit: true,
  verbose: true,
  // Performance testing configuration
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
      testPathIgnorePatterns: [
        '**/performance.test.ts',
        '**/integration.test.ts',
        '**/e2e.test.ts',
      ],
    },
    {
      displayName: 'performance',
      testMatch: ['**/performance.test.ts', '**/*.performance.test.ts'],
      testTimeout: 60000,
      maxWorkers: 1,
    },
    {
      displayName: 'integration',
      testMatch: ['**/integration.test.ts', '**/*.integration.test.ts'],
      testTimeout: 60000,
      maxWorkers: 2,
    },
  ],
  // Custom reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './coverage',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'AI-BOS Shared Library Test Report',
      },
    ],
  ],
  // Performance monitoring
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Snapshot testing
  snapshotSerializers: [],
  // Watch mode configuration
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  // Custom test patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/', '/examples/', '/scripts/'],
  // Performance benchmarks
  setupFiles: ['<rootDir>/config/jest.setup.js'],
  // Custom matchers
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
};
