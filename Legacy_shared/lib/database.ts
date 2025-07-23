import { logger } from './logger';
import { monitoring } from './monitoring';
import { memoryCache } from './cache';

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  queryTimeout: number;
  enableQueryCache: boolean;
  enableConnectionPooling: boolean;
}

/**
 * Query options
 */
export interface QueryOptions {
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Query result with metadata
 */
export interface QueryResult<T = any> {
  data: T;
  rowCount: number;
  executionTime: number;
  cached: boolean;
  timestamp: number;
}

/**
 * Connection pool statistics
 */
export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
  connectionErrors: number;
  queryErrors: number;
}

/**
 * Database connection wrapper
 */
export class DatabaseConnection {
  private client: any;
  private config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    try {
      // Dynamic import to avoid requiring pg in non-database environments
      const { Client } = await import('pg');

      this.client = new Client({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: this.config.connectionTimeout,
        query_timeout: this.config.queryTimeout,
      });

      await this.client.connect();
      this.isConnected = true;

      logger.info('Database connection established', {
        host: this.config.host,
        database: this.config.database,
      });
    } catch (error) {
      logger.error('Database connection failed', { error });
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Execute a query
   */
  async query<T = any>(
    text: string,
    params?: any[],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const startTime = Date.now();
    const cacheKey = options?.cache ? this.generateCacheKey(text, params) : null;

    try {
      // Try to get from cache first
      if (cacheKey && options?.cache) {
        const cached = memoryCache.get<QueryResult<T>>(cacheKey);
        if (cached) {
          return {
            ...cached,
            cached: true,
            timestamp: Date.now(),
          };
        }
      }

      // Execute query
      const result = await this.client.query(text, params);
      const executionTime = Date.now() - startTime;

      const queryResult: QueryResult<T> = {
        data: result.rows as T,
        rowCount: result.rowCount,
        executionTime,
        cached: false,
        timestamp: Date.now(),
      };

      // Cache result if enabled
      if (cacheKey && options?.cache) {
        memoryCache.set(cacheKey, queryResult, options.cacheTTL);
      }

      // Record metrics
      monitoring.recordDatabaseOperation('QUERY', 'custom', executionTime, true);

      return queryResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      monitoring.recordDatabaseOperation('QUERY', 'custom', executionTime, false);

      logger.error('Database query failed', {
        query: text,
        params,
        error: error.message,
        executionTime,
      });

      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const startTime = Date.now();

    try {
      await this.client.query('BEGIN');
      const result = await callback(this.client);
      await this.client.query('COMMIT');

      const executionTime = Date.now() - startTime;
      monitoring.recordDatabaseOperation('TRANSACTION', 'custom', executionTime, true);

      return result;
    } catch (error) {
      await this.client.query('ROLLBACK');

      const executionTime = Date.now() - startTime;
      monitoring.recordDatabaseOperation('TRANSACTION', 'custom', executionTime, false);

      logger.error('Database transaction failed', { error });
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.isConnected = false;
      logger.info('Database connection closed');
    }
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(text: string, params?: any[]): string {
    return `db:query:${text}:${params ? JSON.stringify(params) : '[]'}`;
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

/**
 * Connection pool implementation
 */
export class ConnectionPool {
  private pool: any;
  private config: DatabaseConfig;
  private stats: PoolStats;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      maxConnections: config.maxConnections,
      connectionErrors: 0,
      queryErrors: 0,
    };

    this.initializePool();
    this.startHealthCheck();
  }

  /**
   * Initialize connection pool
   */
  private async initializePool(): Promise<void> {
    try {
      const { Pool } = await import('pg');

      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: this.config.maxConnections,
        min: this.config.minConnections,
        connectionTimeoutMillis: this.config.connectionTimeout,
        idleTimeoutMillis: this.config.idleTimeout,
        query_timeout: this.config.queryTimeout,
      });

      // Set up event listeners
      this.pool.on('connect', () => {
        this.stats.totalConnections++;
        logger.debug('Database connection created');
      });

      this.pool.on('acquire', () => {
        this.stats.activeConnections++;
        this.stats.idleConnections = Math.max(0, this.stats.idleConnections - 1);
      });

      this.pool.on('release', () => {
        this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);
        this.stats.idleConnections++;
      });

      this.pool.on('error', (err: Error) => {
        this.stats.connectionErrors++;
        logger.error('Database pool error', { error: err.message });
      });

      logger.info('Database connection pool initialized', {
        maxConnections: this.config.maxConnections,
        minConnections: this.config.minConnections,
      });
    } catch (error) {
      logger.error('Failed to initialize database pool', { error });
      throw error;
    }
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<any> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      this.stats.connectionErrors++;
      logger.error('Failed to get database connection', { error });
      throw error;
    }
  }

  /**
   * Execute a query using the pool
   */
  async query<T = any>(
    text: string,
    params?: any[],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const cacheKey = options?.cache ? this.generateCacheKey(text, params) : null;

    try {
      // Try to get from cache first
      if (cacheKey && options?.cache) {
        const cached = memoryCache.get<QueryResult<T>>(cacheKey);
        if (cached) {
          return {
            ...cached,
            cached: true,
            timestamp: Date.now(),
          };
        }
      }

      // Execute query
      const result = await this.pool.query(text, params);
      const executionTime = Date.now() - startTime;

      const queryResult: QueryResult<T> = {
        data: result.rows as T,
        rowCount: result.rowCount,
        executionTime,
        cached: false,
        timestamp: Date.now(),
      };

      // Cache result if enabled
      if (cacheKey && options?.cache) {
        memoryCache.set(cacheKey, queryResult, options.cacheTTL);
      }

      // Record metrics
      monitoring.recordDatabaseOperation('QUERY', 'pool', executionTime, true);

      return queryResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.stats.queryErrors++;
      monitoring.recordDatabaseOperation('QUERY', 'pool', executionTime, false);

      logger.error('Database query failed', {
        query: text,
        params,
        error: error.message,
        executionTime,
      });

      throw error;
    }
  }

  /**
   * Execute a transaction using the pool
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.getConnection();
    const startTime = Date.now();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');

      const executionTime = Date.now() - startTime;
      monitoring.recordDatabaseOperation('TRANSACTION', 'pool', executionTime, true);

      return result;
    } catch (error) {
      await client.query('ROLLBACK');

      const executionTime = Date.now() - startTime;
      monitoring.recordDatabaseOperation('TRANSACTION', 'pool', executionTime, false);

      logger.error('Database transaction failed', { error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    return { ...this.stats };
  }

  /**
   * Start health check timer
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.healthCheck();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform health check
   */
  private async healthCheck(): Promise<void> {
    try {
      await this.query('SELECT 1');
      logger.debug('Database health check passed');
    } catch (error) {
      logger.error('Database health check failed', { error });
    }
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(text: string, params?: any[]): string {
    return `db:pool:query:${text}:${params ? JSON.stringify(params) : '[]'}`;
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection pool closed');
    }
  }
}

/**
 * Database manager for handling multiple connections
 */
export class DatabaseManager {
  private connections: Map<string, DatabaseConnection> = new Map();
  private pools: Map<string, ConnectionPool> = new Map();
  private configs: Map<string, DatabaseConfig> = new Map();

  /**
   * Register a database configuration
   */
  registerDatabase(name: string, config: DatabaseConfig): void {
    this.configs.set(name, config);
    logger.info(`Database configuration registered: ${name}`);
  }

  /**
   * Get a database connection
   */
  async getConnection(name: string): Promise<DatabaseConnection> {
    let connection = this.connections.get(name);

    if (!connection) {
      const config = this.configs.get(name);
      if (!config) {
        throw new Error(`Database configuration not found: ${name}`);
      }

      connection = new DatabaseConnection(config);
      await connection.connect();
      this.connections.set(name, connection);
    }

    return connection;
  }

  /**
   * Get a connection pool
   */
  getPool(name: string): ConnectionPool {
    let pool = this.pools.get(name);

    if (!pool) {
      const config = this.configs.get(name);
      if (!config) {
        throw new Error(`Database configuration not found: ${name}`);
      }

      pool = new ConnectionPool(config);
      this.pools.set(name, pool);
    }

    return pool;
  }

  /**
   * Execute query on specific database
   */
  async query<T = any>(
    databaseName: string,
    text: string,
    params?: any[],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const pool = this.getPool(databaseName);
    return await pool.query<T>(text, params, options);
  }

  /**
   * Execute transaction on specific database
   */
  async transaction<T>(databaseName: string, callback: (client: any) => Promise<T>): Promise<T> {
    const pool = this.getPool(databaseName);
    return await pool.transaction(callback);
  }

  /**
   * Get all database statistics
   */
  getAllStats(): { connections: Map<string, boolean>; pools: Map<string, PoolStats> } {
    const connectionStats = new Map<string, boolean>();
    const poolStats = new Map<string, PoolStats>();

    for (const [name, connection] of this.connections.entries()) {
      connectionStats.set(name, connection.connected);
    }

    for (const [name, pool] of this.pools.entries()) {
      poolStats.set(name, pool.getStats());
    }

    return { connections: connectionStats, pools: poolStats };
  }

  /**
   * Close all connections and pools
   */
  async closeAll(): Promise<void> {
    // Close all connections
    for (const [name, connection] of this.connections.entries()) {
      await connection.disconnect();
      logger.info(`Database connection closed: ${name}`);
    }
    this.connections.clear();

    // Close all pools
    for (const [name, pool] of this.pools.entries()) {
      await pool.close();
      logger.info(`Database pool closed: ${name}`);
    }
    this.pools.clear();
  }
}

/**
 * Query builder for type-safe database operations
 */
export class QueryBuilder {
  private table: string;
  private selectFields: string[] = ['*'];
  private whereConditions: Array<{ field: string; operator: string; value: any }> = [];
  private orderBy: Array<{ field: string; direction: 'ASC' | 'DESC' }> = [];
  private limitValue?: number;
  private offsetValue?: number;

  constructor(table: string) {
    this.table = table;
  }

  /**
   * Select specific fields
   */
  select(...fields: string[]): QueryBuilder {
    this.selectFields = fields.length > 0 ? fields : ['*'];
    return this;
  }

  /**
   * Add where condition
   */
  where(field: string, operator: string, value: any): QueryBuilder {
    this.whereConditions.push({ field, operator, value });
    return this;
  }

  /**
   * Add where equals condition
   */
  whereEq(field: string, value: any): QueryBuilder {
    return this.where(field, '=', value);
  }

  /**
   * Add where in condition
   */
  whereIn(field: string, values: any[]): QueryBuilder {
    return this.where(field, 'IN', values);
  }

  /**
   * Add order by clause
   */
  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderBy.push({ field, direction });
    return this;
  }

  /**
   * Add limit clause
   */
  limit(value: number): QueryBuilder {
    this.limitValue = value;
    return this;
  }

  /**
   * Add offset clause
   */
  offset(value: number): QueryBuilder {
    this.offsetValue = value;
    return this;
  }

  /**
   * Build the SQL query
   */
  build(): { text: string; params: any[] } {
    const params: any[] = [];
    let paramIndex = 1;

    // Build SELECT clause
    const selectClause = this.selectFields.join(', ');

    // Build WHERE clause
    let whereClause = '';
    if (this.whereConditions.length > 0) {
      const conditions = this.whereConditions.map((condition) => {
        if (condition.operator === 'IN') {
          const placeholders = condition.value.map(() => `$${paramIndex++}`).join(', ');
          params.push(...condition.value);
          return `${condition.field} IN (${placeholders})`;
        } else {
          params.push(condition.value);
          return `${condition.field} ${condition.operator} $${paramIndex++}`;
        }
      });
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    let orderByClause = '';
    if (this.orderBy.length > 0) {
      const orders = this.orderBy.map((order) => `${order.field} ${order.direction}`);
      orderByClause = `ORDER BY ${orders.join(', ')}`;
    }

    // Build LIMIT and OFFSET clauses
    let limitClause = '';
    if (this.limitValue !== undefined) {
      limitClause = `LIMIT ${this.limitValue}`;
    }

    let offsetClause = '';
    if (this.offsetValue !== undefined) {
      offsetClause = `OFFSET ${this.offsetValue}`;
    }

    // Combine all clauses
    const text = `
      SELECT ${selectClause}
      FROM ${this.table}
      ${whereClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `
      .trim()
      .replace(/\s+/g, ' ');

    return { text, params };
  }
}

/**
 * Global database manager instance
 */
export const databaseManager = new DatabaseManager();

/**
 * Database utilities
 */
export class DatabaseUtils {
  /**
   * Create a query builder
   */
  static table(tableName: string): QueryBuilder {
    return new QueryBuilder(tableName);
  }

  /**
   * Execute a simple select query
   */
  static async select<T = any>(
    databaseName: string,
    table: string,
    fields: string[] = ['*'],
    conditions: Record<string, any> = {},
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const queryBuilder = new QueryBuilder(table).select(...fields);

    for (const [field, value] of Object.entries(conditions)) {
      queryBuilder.whereEq(field, value);
    }

    const { text, params } = queryBuilder.build();
    return await databaseManager.query<T>(databaseName, text, params, options);
  }

  /**
   * Execute a simple insert query
   */
  static async insert<T = any>(
    databaseName: string,
    table: string,
    data: Record<string, any>,
    returning: string[] = ['*'],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const returningClause = returning.join(', ');

    const text = `
      INSERT INTO ${table} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returningClause}
    `
      .trim()
      .replace(/\s+/g, ' ');

    return await databaseManager.query<T>(databaseName, text, values, options);
  }

  /**
   * Execute a simple update query
   */
  static async update<T = any>(
    databaseName: string,
    table: string,
    data: Record<string, any>,
    conditions: Record<string, any>,
    returning: string[] = ['*'],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const setFields = Object.keys(data);
    const setValues = Object.values(data);
    const whereFields = Object.keys(conditions);
    const whereValues = Object.values(conditions);

    const setClause = setFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const whereClause = whereFields
      .map((field, index) => `${field} = $${setValues.length + index + 1}`)
      .join(' AND ');
    const returningClause = returning.join(', ');

    const text = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING ${returningClause}
    `
      .trim()
      .replace(/\s+/g, ' ');

    const params = [...setValues, ...whereValues];
    return await databaseManager.query<T>(databaseName, text, params, options);
  }

  /**
   * Execute a simple delete query
   */
  static async delete<T = any>(
    databaseName: string,
    table: string,
    conditions: Record<string, any>,
    returning: string[] = ['*'],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const whereFields = Object.keys(conditions);
    const whereValues = Object.values(conditions);
    const whereClause = whereFields.map((field, index) => `${field} = $${index + 1}`).join(' AND ');
    const returningClause = returning.join(', ');

    const text = `
      DELETE FROM ${table}
      WHERE ${whereClause}
      RETURNING ${returningClause}
    `
      .trim()
      .replace(/\s+/g, ' ');

    return await databaseManager.query<T>(databaseName, text, whereValues, options);
  }
}
