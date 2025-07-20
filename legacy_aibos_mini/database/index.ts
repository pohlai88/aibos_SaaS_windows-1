/**
 * AI-BOS Enterprise Database Module
 * Single Source of Truth for all database operations
 */

export * from './src/core/AibosDatabaseKernel';
export * from './src/core/ModuleRegistry';
export * from './src/core/SchemaManager';
export * from './src/core/MigrationEngine';
export * from './src/core/ConnectionPool';
export * from './src/types';
export * from './src/utils';

// Main exports
export { AibosDatabaseKernel } from './src/core/AibosDatabaseKernel';
export { createEnterpriseDatabase } from './src/factory';
export type { 
  DatabaseConfig, 
  ModuleSchema, 
  MigrationPlan,
  DatabaseMetrics 
} from './src/types';