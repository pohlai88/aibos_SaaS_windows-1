/**
 * Enterprise Database Types
 */

export interface DatabaseConfig {
  url: string;
  key: string;
  schema?: string;
  poolSize?: number;
  timeout?: number;
  retries?: number;
  ssl?: boolean;
  debug?: boolean;
}

export interface ModuleSchema {
  version: string;
  tables: TableDefinition[];
  migrations: Migration[];
  permissions: Permission[];
  dependencies?: string[];
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
  constraints?: ConstraintDefinition[];
  rls?: boolean; // Row Level Security
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  default?: any;
  unique?: boolean;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

export interface Migration {
  version: string;
  description: string;
  up: string; // SQL for migration
  down: string; // SQL for rollback
  dependencies?: string[];
}

export interface Permission {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  condition?: string; // RLS condition
}

export interface DatabaseMetrics {
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    activeConnections: number;
    registeredModules: number;
  };
  modules: {
    total: number;
    active: number;
    failed: number;
  };
  connections: {
    total: number;
    active: number;
    idle: number;
  };
  timestamp: string;
}