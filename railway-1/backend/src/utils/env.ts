import { z } from 'zod';

// Environment variable schema with proper validation
const envSchema = z.object({
  // Core environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server configuration
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),

  // Database configuration
  DATABASE_URL: z.string().optional(),

  // Supabase configuration
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Redis configuration
  REDIS_URL: z.string().optional(),

  // JWT configuration
  JWT_SECRET: z.string().default('debug-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // CORS configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Security
  HELMET_ENABLED: z.string().transform(val => val === 'true').default('true'),
  COMPRESSION_ENABLED: z.string().transform(val => val === 'true').default('true'),

  // Monitoring
  ENABLE_TELEMETRY: z.string().transform(val => val === 'true').default('true'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),

  // Debug configuration
  DEBUG: z.string().optional(),
  DEBUG_LEVEL: z.string().default('debug'),
  DEBUG_SQL: z.string().transform(val => val === 'true').default('false'),
  DEBUG_API: z.string().transform(val => val === 'true').default('false'),
  DEBUG_MEMORY: z.string().transform(val => val === 'true').default('false'),
  DEBUG_PERFORMANCE: z.string().transform(val => val === 'true').default('false'),

  // AI Database configuration
  DEBUG_AI_DATABASE: z.string().transform(val => val === 'true').default('false'),
  DEBUG_OLLAMA: z.string().transform(val => val === 'true').default('false'),
  DEBUG_SCHEMA: z.string().transform(val => val === 'true').default('false'),

  // Consciousness Engine configuration
  DEBUG_CONSCIOUSNESS: z.string().transform(val => val === 'true').default('false'),
  DEBUG_QUANTUM: z.string().transform(val => val === 'true').default('false'),

  // WebSocket configuration
  DEBUG_WEBSOCKET: z.string().transform(val => val === 'true').default('false'),
  DEBUG_REALTIME: z.string().transform(val => val === 'true').default('false'),

  // Instance configuration
  INSTANCE_ID: z.string().optional(),

  // Frontend URL
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
};

// Export validated environment
export const env = parseEnv();

// Type-safe environment access
export const getEnv = <K extends keyof typeof env>(key: K): typeof env[K] => {
  return env[key];
};

// Environment validation helpers
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Debug helpers
export const isDebugEnabled = (feature: string) => {
  const debugEnv = env.DEBUG || '';
  return debugEnv.includes('*') || debugEnv.includes(feature);
};

export const getDebugLevel = () => env.DEBUG_LEVEL;

// Database helpers
export const hasDatabase = () => !!env.DATABASE_URL;
export const hasSupabase = () => !!(env.SUPABASE_URL && env.SUPABASE_KEY);
export const hasRedis = () => !!env.REDIS_URL;

// Security helpers
export const getCorsOrigins = (): string[] => {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  return [env.CORS_ORIGIN];
};

// Validation helpers
export const validateRequiredEnv = (required: (keyof typeof env)[]) => {
  const missing: string[] = [];

  required.forEach(key => {
    if (!env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  hasDatabase: hasDatabase(),
  hasSupabase: hasSupabase(),
  hasRedis: hasRedis(),
  debugLevel: env.DEBUG_LEVEL,
  debugFeatures: {
    sql: env.DEBUG_SQL,
    api: env.DEBUG_API,
    memory: env.DEBUG_MEMORY,
    performance: env.DEBUG_PERFORMANCE,
  }
});
