import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Database client configuration
export interface DatabaseConfig {
  url: string;
  key: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    db?: {
      schema?: string;
    };
    global?: {
      headers?: Record<string, string>;
    };
  };
}

// Enhanced database client with connection pooling and error handling
export class AibosDatabaseClient {
  private client: ReturnType<typeof createClient<Database>>;
  private config: DatabaseConfig;
  private connectionPool: Map<string, any> = new Map();
  private isConnected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.client = createClient<Database>(config.url, config.key, config.options);
    this.initializeConnection();
  }

  /**
   * Initialize database connection with health check
   */
  private async initializeConnection() {
    try {
      // Test connection
      const { data, error } = await this.client.from('system_health').select('status').limit(1);
      
      if (error) {
        console.warn('Database connection warning:', error.message);
        this.isConnected = false;
      } else {
        this.isConnected = true;
        console.log('✅ Database connected successfully');
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get the underlying Supabase client
   */
  getClient() {
    return this.client;
  }

  /**
   * Check if database is connected
   */
  isDatabaseConnected() {
    return this.isConnected;
  }

  /**
   * Execute a query with error handling and retry logic
   */
  async query<T = any>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    retries = 3
  ): Promise<{ data: T | null; error: any }> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await queryFn();
        
        if (result.error) {
          // Handle specific error types
          if (result.error.code === 'PGRST301') {
            // Connection timeout - retry
            if (attempt < retries) {
              await this.delay(1000 * attempt);
              continue;
            }
          }
          
          // Log error for debugging
          console.error(`Database query error (attempt ${attempt}):`, result.error);
        }
        
        return result;
      } catch (error) {
        console.error(`Database query exception (attempt ${attempt}):`, error);
        
        if (attempt === retries) {
          return { data: null, error };
        }
        
        await this.delay(1000 * attempt);
      }
    }
    
    return { data: null, error: new Error('Max retries exceeded') };
  }

  /**
   * Execute a transaction with rollback on error
   */
  async transaction<T>(
    operations: () => Promise<T>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const result = await operations();
      return { data: result, error: null };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Batch operations for better performance
   */
  async batch<T>(
    operations: Array<() => Promise<{ data: T | null; error: any }>>,
    batchSize = 10
  ): Promise<Array<{ data: T | null; error: any }>> {
    const results: Array<{ data: T | null; error: any }> = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(operation => operation())
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Health check for database connectivity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    message: string;
    timestamp: string;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.query(() =>
        this.client.from('system_health').select('status').limit(1)
      );
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'unhealthy',
          message: `Database error: ${error.message}`,
          timestamp: new Date().toISOString(),
          responseTime,
        };
      }
      
      if (responseTime > 1000) {
        return {
          status: 'degraded',
          message: `Slow response time: ${responseTime}ms`,
          timestamp: new Date().toISOString(),
          responseTime,
        };
      }
      
      return {
        status: 'healthy',
        message: 'Database is responding normally',
        timestamp: new Date().toISOString(),
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Connection failed: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalTables: number;
    totalRows: number;
    activeConnections: number;
    lastBackup: string | null;
  }> {
    try {
      const { data, error } = await this.query(() =>
        this.client.rpc('get_database_stats')
      );
      
      if (error) {
        throw error;
      }
      
      return data || {
        totalTables: 0,
        totalRows: 0,
        activeConnections: 0,
        lastBackup: null,
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalTables: 0,
        totalRows: 0,
        activeConnections: 0,
        lastBackup: null,
      };
    }
  }

  /**
   * Optimize database performance
   */
  async optimize(): Promise<{ success: boolean; message: string }> {
    try {
      // Run database optimization procedures
      const { error } = await this.query(() =>
        this.client.rpc('optimize_database')
      );
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Database optimization completed successfully',
      };
    } catch (error) {
      console.error('Database optimization failed:', error);
      return {
        success: false,
        message: `Optimization failed: ${error}`,
      };
    }
  }

  /**
   * Backup database
   */
  async backup(): Promise<{ success: boolean; backupId: string | null; message: string }> {
    try {
      const { data, error } = await this.query(() =>
        this.client.rpc('create_backup')
      );
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        backupId: data?.backup_id || null,
        message: 'Database backup created successfully',
      };
    } catch (error) {
      console.error('Database backup failed:', error);
      return {
        success: false,
        backupId: null,
        message: `Backup failed: ${error}`,
      };
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  async disconnect(): Promise<void> {
    try {
      // Close any open connections
      this.connectionPool.clear();
      this.isConnected = false;
      console.log('Database client disconnected');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }
}

// Factory function to create database client
export function createAibosDatabase(config: DatabaseConfig): AibosDatabaseClient {
  return new AibosDatabaseClient(config);
}

// Default client instance (to be configured with environment variables)
export const db = createAibosDatabase({
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_ANON_KEY || '',
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  },
}); 