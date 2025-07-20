/**
 * AI-BOS Database Kernel
 * Core database management system for the AI-BOS ecosystem
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ModuleRegistry } from './ModuleRegistry';
import { SchemaManager } from './SchemaManager';
import { MigrationEngine } from './MigrationEngine';
import { ConnectionPool } from './ConnectionPool';
import { DatabaseConfig, ModuleSchema, DatabaseMetrics } from '../types';
import { Logger } from '../utils/Logger';

export class AibosDatabaseKernel {
  private static instance: AibosDatabaseKernel;
  private client: SupabaseClient;
  private moduleRegistry: ModuleRegistry;
  private schemaManager: SchemaManager;
  private migrationEngine: MigrationEngine;
  private connectionPool: ConnectionPool;
  private logger: Logger;
  private config: DatabaseConfig;
  private isInitialized = false;

  private constructor(config: DatabaseConfig) {
    this.config = config;
    this.logger = new Logger('AibosDatabaseKernel');
    this.initializeKernel();
  }

  /**
   * Singleton pattern - only one database kernel instance
   */
  public static getInstance(config?: DatabaseConfig): AibosDatabaseKernel {
    if (!AibosDatabaseKernel.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      AibosDatabaseKernel.instance = new AibosDatabaseKernel(config);
    }
    return AibosDatabaseKernel.instance;
  }

  /**
   * Initialize the database kernel
   */
  private async initializeKernel(): Promise<void> {
    try {
      this.logger.info('🚀 Initializing AI-BOS Database Kernel...');

      // Initialize Supabase client
      this.client = createClient(this.config.url, this.config.key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
        db: {
          schema: this.config.schema || 'public',
        },
      });

      // Initialize core components
      this.connectionPool = new ConnectionPool(this.client, this.config);
      this.moduleRegistry = new ModuleRegistry(this.client, this.logger);
      this.schemaManager = new SchemaManager(this.client, this.logger);
      this.migrationEngine = new MigrationEngine(this.client, this.logger);

      // Verify database connection
      await this.verifyConnection();

      // Initialize core schema
      await this.initializeCoreSchema();

      this.isInitialized = true;
      this.logger.info('✅ AI-BOS Database Kernel initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Database Kernel:', error);
      throw error;
    }
  }

  /**
   * Verify database connection
   */
  private async verifyConnection(): Promise<void> {
    const { data, error } = await this.client
      .from('organizations')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    this.logger.info('✅ Database connection verified');
  }

  /**
   * Initialize core database schema
   */
  private async initializeCoreSchema(): Promise<void> {
    await this.schemaManager.ensureCoreTablesExist();
    await this.migrationEngine.runPendingMigrations();
  }

  /**
   * Register a module with the database kernel
   */
  public async registerModule(moduleId: string, schema: ModuleSchema): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Database kernel not initialized');
    }

    this.logger.info(`📦 Registering module: ${moduleId}`);
    
    // Validate schema compliance
    await this.schemaManager.validateSchema(schema);
    
    // Register with module registry
    await this.moduleRegistry.registerModule(moduleId, schema);
    
    // Apply schema migrations
    await this.migrationEngine.applyModuleMigrations(moduleId, schema.migrations);
    
    this.logger.info(`✅ Module ${moduleId} registered successfully`);
  }

  /**
   * Get database client for a specific module
   */
  public getModuleClient(moduleId: string): SupabaseClient {
    if (!this.isInitialized) {
      throw new Error('Database kernel not initialized');
    }

    if (!this.moduleRegistry.isModuleRegistered(moduleId)) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    return this.connectionPool.getConnection(moduleId);
  }

  /**
   * Execute query with module context
   */
  public async executeQuery<T>(
    moduleId: string,
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    options?: { retries?: number; timeout?: number }
  ): Promise<{ data: T | null; error: any }> {
    const client = this.getModuleClient(moduleId);
    return this.connectionPool.executeWithRetry(client, queryFn, options);
  }

  /**
   * Execute transaction across multiple modules
   */
  public async executeTransaction<T>(
    operations: Array<{
      moduleId: string;
      operation: (client: SupabaseClient) => Promise<any>;
    }>
  ): Promise<{ data: T | null; error: any }> {
    return this.connectionPool.executeTransaction(operations);
  }

  /**
   * Get database metrics and health status
   */
  public async getMetrics(): Promise<DatabaseMetrics> {
    const health = await this.healthCheck();
    const moduleStats = await this.moduleRegistry.getModuleStats();
    const connectionStats = this.connectionPool.getStats();

    return {
      health,
      modules: moduleStats,
      connections: connectionStats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check for the entire database system
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    activeConnections: number;
    registeredModules: number;
  }> {
    const startTime = Date.now();
    
    try {
      const { error } = await this.client
        .from('system_health')
        .select('status')
        .limit(1);

      const responseTime = Date.now() - startTime;
      const activeConnections = this.connectionPool.getActiveConnectionCount();
      const registeredModules = this.moduleRegistry.getRegisteredModuleCount();

      const status = error 
        ? 'unhealthy' 
        : responseTime > 1000 
        ? 'degraded' 
        : 'healthy';

      return {
        status,
        responseTime,
        activeConnections,
        registeredModules,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        activeConnections: 0,
        registeredModules: 0,
      };
    }
  }

  /**
   * Shutdown the database kernel
   */
  public async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down AI-BOS Database Kernel...');
    
    await this.connectionPool.closeAllConnections();
    this.isInitialized = false;
    
    this.logger.info('✅ Database Kernel shutdown complete');
  }
}