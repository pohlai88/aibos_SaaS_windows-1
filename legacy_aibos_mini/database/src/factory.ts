/**
 * Factory for creating enterprise database instances
 */

import { AibosDatabaseKernel } from './core/AibosDatabaseKernel';
import { DatabaseConfig } from './types';

/**
 * Create enterprise database instance
 */
export function createEnterpriseDatabase(config?: DatabaseConfig): AibosDatabaseKernel {
  const defaultConfig: DatabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || '',
    schema: 'public',
    poolSize: 10,
    timeout: 30000,
    retries: 3,
    ssl: true,
    debug: process.env.NODE_ENV === 'development',
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.url || !finalConfig.key) {
    throw new Error('Database URL and key are required');
  }

  return AibosDatabaseKernel.getInstance(finalConfig);
}

// Export singleton instance
export const db = createEnterpriseDatabase();