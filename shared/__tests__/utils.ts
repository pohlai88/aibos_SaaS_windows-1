import { vi, expect } from 'vitest';

// Test data factories
export const createTestUser = (overrides = {}) => ({
  user_id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  tenant_id: 'tenant-456',
  role: 'user',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestTenant = (overrides = {}) => ({
  tenant_id: 'tenant-456',
  name: 'Test Tenant',
  domain: 'test.example.com',
  status: 'active',
  plan: 'basic',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestEvent = (overrides = {}) => ({
  event_id: 'event-789',
  event_type: 'UserCreated',
  event_data: { userId: 'user-123' },
  tenant_id: 'tenant-456',
  user_id: 'user-123',
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Assertion helpers
export const expectSuccess = (result: any) => {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.error).toBeUndefined();
  return result;
};

export const expectError = (result: any, expectedError?: string) => {
  expect(result).toBeDefined();
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  if (expectedError) {
    expect(result.error).toContain(expectedError);
  }
  return result;
};

export const expectValidationError = (result: any, field?: string) => {
  expect(result).toBeDefined();
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  if (field) {
    expect(result.error).toContain(field);
  }
  return result;
};

// Mock helpers
export const mockSuccessfulDbQuery = (data: any) => ({
  data,
  error: null,
});

export const mockFailedDbQuery = (error: string) => ({
  data: null,
  error: { message: error },
});

export const mockSuccessfulAuth = (user: any, tenant: any) => ({
  success: true,
  data: {
    user,
    tenant,
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  },
});

export const mockFailedAuth = (error: string) => ({
  success: false,
  error,
});

// Performance testing helpers
export const measurePerformance = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start,
  };
};

export const expectPerformance = async (
  fn: () => Promise<any>,
  maxDuration: number
) => {
  const { result, duration } = await measurePerformance(fn);
  expect(duration).toBeLessThan(maxDuration);
  return result;
};

// Async testing helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retry = async (
  fn: () => Promise<any>,
  maxAttempts: number = 3,
  delay: number = 100
) => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      await waitFor(delay * attempt);
    }
  }
};

// Database testing helpers
export const createTestDatabase = () => ({
  users: new Map(),
  tenants: new Map(),
  events: new Map(),
  
  async query(sql: string, params: any[] = []) {
    // Simple in-memory database for testing
    return { rows: [], rowCount: 0 };
  },
  
  async one(sql: string, params: any[] = []) {
    return null;
  },
  
  async many(sql: string, params: any[] = []) {
    return [];
  },
  
  async none(sql: string, params: any[] = []) {
    return null;
  },
  
  async tx(callback: (tx: any) => Promise<any>) {
    return await callback(this);
  },
});

// Event testing helpers
export const createTestEventBus = () => {
  const listeners = new Map<string, Function[]>();
  const events: any[] = [];
  
  return {
    async emit(eventType: string, eventData: any) {
      events.push({ eventType, eventData, timestamp: new Date() });
      const eventListeners = listeners.get(eventType) || [];
      await Promise.all(eventListeners.map(listener => listener(eventData)));
    },
    
    on(eventType: string, listener: Function) {
      if (!listeners.has(eventType)) {
        listeners.set(eventType, []);
      }
      listeners.get(eventType)!.push(listener);
    },
    
    off(eventType: string, listener: Function) {
      const eventListeners = listeners.get(eventType) || [];
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    },
    
    getEvents() {
      return [...events];
    },
    
    clear() {
      listeners.clear();
      events.length = 0;
    },
  };
};

// Security testing helpers
export const createTestSecurityContext = () => ({
  user: createTestUser(),
  tenant: createTestTenant(),
  permissions: ['read', 'write'],
  roles: ['user'],
  sessionId: 'session-123',
  requestId: 'request-456',
});

// Validation testing helpers
export const testValidationSchema = (schema: any, testCases: Array<{
  input: any;
  shouldPass: boolean;
  expectedError?: string;
}>) => {
  testCases.forEach(({ input, shouldPass, expectedError }, index) => {
    if (shouldPass) {
      expect(() => schema.parse(input)).not.toThrow();
    } else {
      if (expectedError) {
        expect(() => schema.parse(input)).toThrow(expectedError);
      } else {
        expect(() => schema.parse(input)).toThrow();
      }
    }
  });
};

// Logger testing helpers
export const createTestLogger = () => {
  const logs: Array<{ level: string; message: string; context?: any }> = [];
  
  return {
    info: (message: string, context?: any) => {
      logs.push({ level: 'info', message, context });
    },
    warn: (message: string, context?: any) => {
      logs.push({ level: 'warn', message, context });
    },
    error: (message: string, context?: any) => {
      logs.push({ level: 'error', message, context });
    },
    debug: (message: string, context?: any) => {
      logs.push({ level: 'debug', message, context });
    },
    trace: (message: string, context?: any) => {
      logs.push({ level: 'trace', message, context });
    },
    getLogs: () => [...logs],
    clear: () => logs.length = 0,
  };
};

// Export all utilities
export default {
  createTestUser,
  createTestTenant,
  createTestEvent,
  expectSuccess,
  expectError,
  expectValidationError,
  mockSuccessfulDbQuery,
  mockFailedDbQuery,
  mockSuccessfulAuth,
  mockFailedAuth,
  measurePerformance,
  expectPerformance,
  waitFor,
  retry,
  createTestDatabase,
  createTestEventBus,
  createTestSecurityContext,
  testValidationSchema,
  createTestLogger,
}; 