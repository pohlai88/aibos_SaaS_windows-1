import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';

  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
});

// Global test utilities
export const createMockRequest = (overrides = {}) => ({
  method: 'GET',
  url: '/api/test',
  headers: {
    'user-agent': 'test-agent',
    'content-type': 'application/json',
  },
  body: {},
  query: {},
  params: {},
  ip: '127.0.0.1',
  ...overrides,
});

export const createMockResponse = (overrides = {}) => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    getHeader: vi.fn(),
    ...overrides,
  };

  // Mock Express response methods
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  res.end.mockReturnValue(res);
  res.setHeader.mockReturnValue(res);

  return res;
};

export const createMockNext = () => vi.fn();

// Mock database connection
export const mockDb = {
  query: vi.fn(),
  one: vi.fn(),
  many: vi.fn(),
  none: vi.fn(),
  result: vi.fn(),
  tx: vi.fn(),
};

// Mock Redis client
export const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
  exists: vi.fn(),
  incr: vi.fn(),
  decr: vi.fn(),
  hget: vi.fn(),
  hset: vi.fn(),
  hdel: vi.fn(),
  hgetall: vi.fn(),
  lpush: vi.fn(),
  rpop: vi.fn(),
  llen: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
  zrem: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  quit: vi.fn(),
};

// Mock Supabase client
export const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      createSignedUrl: vi.fn(),
      getPublicUrl: vi.fn(),
    }),
  },
  realtime: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockReturnThis(),
    }),
  },
};

// Mock JWT
export const mockJwt = {
  sign: vi.fn(),
  verify: vi.fn(),
  decode: vi.fn(),
};

// Mock bcrypt
export const mockBcrypt = {
  hash: vi.fn(),
  compare: vi.fn(),
  genSalt: vi.fn(),
};

// Mock crypto
export const mockCrypto = {
  randomBytes: vi.fn(),
  randomUUID: vi.fn(),
  createHash: vi.fn(),
  createHmac: vi.fn(),
};

// Mock timers
export const mockTimers = {
  setTimeout: vi.fn(),
  setInterval: vi.fn(),
  clearTimeout: vi.fn(),
  clearInterval: vi.fn(),
};

// Mock fetch
export const mockFetch = vi.fn();

// Mock WebSocket
export const mockWebSocket = {
  WebSocket: vi.fn(),
  Server: vi.fn(),
};

// Global mocks
global.fetch = mockFetch;
global.WebSocket = mockWebSocket.WebSocket as any;

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  LOG_LEVEL: 'error',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'test-secret-key',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
};

// Export test utilities
export * from './utils';
