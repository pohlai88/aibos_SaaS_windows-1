import { z } from 'zod';
import { UUID, ISODate, UserID, TenantID } from '../primitives';
import { 
  MetadataMigrationType,
  MetadataMigrationTypes,
  MetadataMigrationStatus,
  MetadataMigrationStatuses,
  MetadataMigrationStrategy,
  MetadataMigrationStrategies
} from './metadata.enums';
import { 
  MetadataSchema, 
  MetadataField, 
  MetadataEntity,
  MetadataConstraint
} from './metadata.types';

// ============================================================================
// MIGRATION ENUMS
// ============================================================================

export const MetadataMigrationDirection = {
  UP: 'up',
  DOWN: 'down'
} as const;

export type MetadataMigrationDirection = typeof MetadataMigrationDirection[keyof typeof MetadataMigrationDirection];

export const MetadataMigrationPhase = {
  VALIDATION: 'validation',
  BACKUP: 'backup',
  MIGRATION: 'migration',
  VERIFICATION: 'verification',
  CLEANUP: 'cleanup'
} as const;

export type MetadataMigrationPhase = typeof MetadataMigrationPhase[keyof typeof MetadataMigrationPhase];

export const MetadataMigrationRollbackStrategy = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  SEMI_AUTOMATIC: 'semi_automatic',
  NONE: 'none'
} as const;

export type MetadataMigrationRollbackStrategy = typeof MetadataMigrationRollbackStrategy[keyof typeof MetadataMigrationRollbackStrategy];

// ============================================================================
// MIGRATION INTERFACES
// ============================================================================

export interface MetadataMigration {
  id: UUID;
  name: string;
  description?: string;
  version: string;
  type: MetadataMigrationType;
  direction: MetadataMigrationDirection;
  
  // Schema changes
  schemaChanges?: {
    added?: MetadataField[];
    modified?: Array<{
      field: MetadataField;
      changes: Record<string, any>;
    }>;
    removed?: UUID[];
    reordered?: Array<{
      fieldId: UUID;
      oldOrder: number;
      newOrder: number;
    }>;
  };
  
  // Data transformations
  dataTransformations?: Array<{
    field: string;
    operation: 'transform' | 'migrate' | 'clean' | 'validate';
    script: string;
    options?: Record<string, any>;
  }>;
  
  // Dependencies
  dependencies?: {
    migrations?: string[];
    schemas?: UUID[];
    constraints?: UUID[];
  };
  
  // Configuration
  config: {
    strategy: MetadataMigrationStrategy;
    rollbackStrategy: MetadataMigrationRollbackStrategy;
    timeout: number;
    batchSize: number;
    parallel: boolean;
    dryRun: boolean;
    backup: boolean;
    verification: boolean;
  };
  
  // Scripts
  upScript: string;
  downScript?: string;
  verificationScript?: string;
  
  // Metadata
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
  priority: number;
}

export interface MetadataMigrationExecution {
  id: UUID;
  migrationId: UUID;
  version: string;
  status: MetadataMigrationStatus;
  direction: MetadataMigrationDirection;
  
  // Execution details
  startedAt: ISODate;
  completedAt?: ISODate;
  duration?: number;
  
  // Progress tracking
  progress: {
    phase: MetadataMigrationPhase;
    current: number;
    total: number;
    percentage: number;
  };
  
  // Results
  results: {
    success: boolean;
    recordsProcessed: number;
    recordsSkipped: number;
    recordsFailed: number;
    errors: Array<{
      code: string;
      message: string;
      details?: Record<string, any>;
    }>;
    warnings: Array<{
      code: string;
      message: string;
      details?: Record<string, any>;
    }>;
  };
  
  // Rollback information
  rollback?: {
    attempted: boolean;
    successful: boolean;
    rollbackAt?: ISODate;
    rollbackDuration?: number;
    rollbackErrors?: Array<{
      code: string;
      message: string;
      details?: Record<string, any>;
    }>;
  };
  
  // Context
  context: {
    tenantId: TenantID;
    executedBy: UserID;
    environment: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  };
}

export interface MetadataMigrationPlan {
  id: UUID;
  name: string;
  description?: string;
  
  // Migration sequence
  migrations: Array<{
    migration: MetadataMigration;
    order: number;
    dependencies: string[];
    estimatedDuration: number;
    risk: 'low' | 'medium' | 'high';
  }>;
  
  // Execution strategy
  strategy: {
    parallel: boolean;
    maxConcurrent: number;
    rollbackOnFailure: boolean;
    continueOnError: boolean;
    validationOnly: boolean;
  };
  
  // Scheduling
  schedule?: {
    startAt: ISODate;
    endAt?: ISODate;
    timeWindow: {
      start: string; // HH:MM
      end: string;   // HH:MM
      timezone: string;
    };
  };
  
  // Notifications
  notifications?: {
    onStart: string[];
    onComplete: string[];
    onError: string[];
    onRollback: string[];
  };
  
  // Metadata
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
}

export interface MetadataMigrationBackup {
  id: UUID;
  migrationId: UUID;
  executionId: UUID;
  
  // Backup details
  type: 'full' | 'incremental' | 'schema_only';
  location: string;
  size: number;
  checksum: string;
  
  // Backup data
  data: {
    schemas: MetadataSchema[];
    entities: MetadataEntity[];
    constraints: MetadataConstraint[];
    metadata?: Record<string, any>;
  };
  
  // Metadata
  createdAt: ISODate;
  createdBy: UserID;
  expiresAt?: ISODate;
  isCompressed: boolean;
  isEncrypted: boolean;
}

// ============================================================================
// MIGRATION VALIDATION
// ============================================================================

export interface MetadataMigrationValidation {
  id: UUID;
  migrationId: UUID;
  
  // Validation results
  isValid: boolean;
  errors: Array<{
    code: string;
    message: string;
    field?: string;
    severity: 'error' | 'warning' | 'info';
    details?: Record<string, any>;
  }>;
  
  // Schema validation
  schemaValidation: {
    isValid: boolean;
    conflicts: Array<{
      field: string;
      conflict: string;
      resolution?: string;
    }>;
    missingDependencies: string[];
    circularDependencies: string[];
  };
  
  // Data validation
  dataValidation: {
    isValid: boolean;
    affectedRecords: number;
    potentialIssues: Array<{
      type: string;
      count: number;
      description: string;
    }>;
  };
  
  // Performance validation
  performanceValidation: {
    estimatedDuration: number;
    estimatedMemoryUsage: number;
    estimatedDiskUsage: number;
    bottlenecks: string[];
    recommendations: string[];
  };
  
  // Metadata
  validatedAt: ISODate;
  validatedBy: UserID;
}

// ============================================================================
// MIGRATION MANAGER
// ============================================================================

export interface MetadataMigrationManager {
  // Migration CRUD
  createMigration(migration: Omit<MetadataMigration, 'id' | 'createdAt'>): Promise<MetadataMigration>;
  updateMigration(id: UUID, updates: Partial<MetadataMigration>): Promise<MetadataMigration>;
  deleteMigration(id: UUID): Promise<void>;
  getMigration(id: UUID): Promise<MetadataMigration | null>;
  listMigrations(filter?: {
    tenantId?: TenantID;
    type?: MetadataMigrationType;
    status?: MetadataMigrationStatus;
    version?: string;
  }): Promise<MetadataMigration[]>;
  
  // Migration execution
  executeMigration(migrationId: UUID, options?: {
    direction?: MetadataMigrationDirection;
    dryRun?: boolean;
    force?: boolean;
    context?: Record<string, any>;
  }): Promise<MetadataMigrationExecution>;
  
  executeMigrationPlan(planId: UUID, options?: {
    dryRun?: boolean;
    force?: boolean;
    context?: Record<string, any>;
  }): Promise<MetadataMigrationExecution[]>;
  
  // Migration status
  getMigrationStatus(migrationId: UUID): Promise<MetadataMigrationStatus>;
  getExecutionHistory(migrationId: UUID): Promise<MetadataMigrationExecution[]>;
  
  // Rollback
  rollbackMigration(migrationId: UUID, options?: {
    force?: boolean;
    context?: Record<string, any>;
  }): Promise<MetadataMigrationExecution>;
  
  // Validation
  validateMigration(migrationId: UUID): Promise<MetadataMigrationValidation>;
  validateMigrationPlan(planId: UUID): Promise<MetadataMigrationValidation[]>;
  
  // Backup and restore
  createBackup(migrationId: UUID, executionId: UUID): Promise<MetadataMigrationBackup>;
  restoreFromBackup(backupId: UUID): Promise<void>;
  listBackups(migrationId?: UUID): Promise<MetadataMigrationBackup[]>;
  
  // Version management
  getCurrentVersion(): Promise<string>;
  getVersionHistory(): Promise<Array<{
    version: string;
    appliedAt: ISODate;
    migrationId: UUID;
  }>>;
  
  // Dependency management
  resolveDependencies(migrationId: UUID): Promise<{
    dependencies: MetadataMigration[];
    dependents: MetadataMigration[];
    conflicts: string[];
  }>;
  
  // Utilities
  generateMigrationScript(schemaChanges: any): Promise<string>;
  estimateMigrationImpact(migrationId: UUID): Promise<{
    affectedRecords: number;
    estimatedDuration: number;
    risks: string[];
  }>;
}

// ============================================================================
// MIGRATION EXECUTOR
// ============================================================================

export interface MetadataMigrationExecutor {
  // Execution
  execute(migration: MetadataMigration, context: Record<string, any>): Promise<MetadataMigrationExecution>;
  rollback(execution: MetadataMigrationExecution): Promise<MetadataMigrationExecution>;
  
  // Validation
  validate(migration: MetadataMigration): Promise<MetadataMigrationValidation>;
  validateExecution(execution: MetadataMigrationExecution): Promise<boolean>;
  
  // Backup
  createBackup(migration: MetadataMigration, execution: MetadataMigrationExecution): Promise<MetadataMigrationBackup>;
  restoreBackup(backup: MetadataMigrationBackup): Promise<void>;
  
  // Utilities
  estimateDuration(migration: MetadataMigration): Promise<number>;
  checkDependencies(migration: MetadataMigration): Promise<{
    satisfied: boolean;
    missing: string[];
  }>;
}

// ============================================================================
// MIGRATION VALIDATION
// ============================================================================

export const MetadataMigrationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  type: z.nativeEnum(MetadataMigrationTypes),
  direction: z.nativeEnum(MetadataMigrationDirection),
  schemaChanges: z.object({
    added: z.array(z.any()).optional(),
    modified: z.array(z.object({
      field: z.any(),
      changes: z.record(z.any())
    })).optional(),
    removed: z.array(z.string().uuid()).optional(),
    reordered: z.array(z.object({
      fieldId: z.string().uuid(),
      oldOrder: z.number().int(),
      newOrder: z.number().int()
    })).optional()
  }).optional(),
  dataTransformations: z.array(z.object({
    field: z.string(),
    operation: z.enum(['transform', 'migrate', 'clean', 'validate']),
    script: z.string(),
    options: z.record(z.any()).optional()
  })).optional(),
  dependencies: z.object({
    migrations: z.array(z.string()).optional(),
    schemas: z.array(z.string().uuid()).optional(),
    constraints: z.array(z.string().uuid()).optional()
  }).optional(),
  config: z.object({
    strategy: z.nativeEnum(MetadataMigrationStrategies),
    rollbackStrategy: z.nativeEnum(MetadataMigrationRollbackStrategy),
    timeout: z.number().positive(),
    batchSize: z.number().positive(),
    parallel: z.boolean(),
    dryRun: z.boolean(),
    backup: z.boolean(),
    verification: z.boolean()
  }),
  upScript: z.string(),
  downScript: z.string().optional(),
  verificationScript: z.string().optional(),
  tenantId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  isActive: z.boolean(),
  priority: z.number().int().min(0)
});

export const MetadataMigrationExecutionSchema = z.object({
  id: z.string().uuid(),
  migrationId: z.string().uuid(),
  version: z.string(),
  status: z.nativeEnum(MetadataMigrationStatuses),
  direction: z.nativeEnum(MetadataMigrationDirection),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().nonnegative().optional(),
  progress: z.object({
    phase: z.nativeEnum(MetadataMigrationPhase),
    current: z.number().nonnegative(),
    total: z.number().nonnegative(),
    percentage: z.number().min(0).max(100)
  }),
  results: z.object({
    success: z.boolean(),
    recordsProcessed: z.number().nonnegative(),
    recordsSkipped: z.number().nonnegative(),
    recordsFailed: z.number().nonnegative(),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional()
    })),
    warnings: z.array(z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional()
    }))
  }),
  rollback: z.object({
    attempted: z.boolean(),
    successful: z.boolean(),
    rollbackAt: z.string().datetime().optional(),
    rollbackDuration: z.number().nonnegative().optional(),
    rollbackErrors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional()
    })).optional()
  }).optional(),
  context: z.object({
    tenantId: z.string().uuid(),
    executedBy: z.string().uuid(),
    environment: z.string(),
    sessionId: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })
});

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

export class MetadataMigrationUtils {
  /**
   * Creates a new migration with default values
   */
  static createMigration(
    name: string,
    version: string,
    type: MetadataMigrationType,
    tenantId: TenantID,
    createdBy: UserID,
    options?: Partial<MetadataMigration>
  ): MetadataMigration {
    return {
      id: crypto.randomUUID() as UUID,
      name,
      version,
      type,
      direction: MetadataMigrationDirection.UP,
      config: {
        strategy: MetadataMigrationStrategy.SAFE,
        rollbackStrategy: MetadataMigrationRollbackStrategy.AUTOMATIC,
        timeout: 3600, // 1 hour
        batchSize: 1000,
        parallel: false,
        dryRun: false,
        backup: true,
        verification: true
      },
      upScript: '',
      tenantId,
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      priority: 0,
      ...options
    };
  }

  /**
   * Validates a migration against the schema
   */
  static validateMigration(migration: MetadataMigration): { valid: boolean; errors?: string[] } {
    try {
      MetadataMigrationSchema.parse(migration);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Compares two versions
   */
  static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      
      if (v1 < v2) return -1;
      if (v1 > v2) return 1;
    }
    
    return 0;
  }

  /**
   * Checks if a version is valid
   */
  static isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Increments a version number
   */
  static incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const parts = version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`;
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`;
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
      default:
        return version;
    }
  }

  /**
   * Generates a migration script from schema changes
   */
  static generateMigrationScript(schemaChanges: any): string {
    let script = '';
    
    if (schemaChanges.added) {
      script += '// Add new fields\n';
      schemaChanges.added.forEach((field: any) => {
        script += `ADD_FIELD('${field.name}', '${field.type}', ${JSON.stringify(field.config)});\n`;
      });
    }
    
    if (schemaChanges.modified) {
      script += '// Modify existing fields\n';
      schemaChanges.modified.forEach((change: any) => {
        script += `MODIFY_FIELD('${change.field.name}', ${JSON.stringify(change.changes)});\n`;
      });
    }
    
    if (schemaChanges.removed) {
      script += '// Remove fields\n';
      schemaChanges.removed.forEach((fieldId: string) => {
        script += `REMOVE_FIELD('${fieldId}');\n`;
      });
    }
    
    return script;
  }

  /**
   * Estimates the impact of a migration
   */
  static estimateMigrationImpact(migration: MetadataMigration): {
    affectedRecords: number;
    estimatedDuration: number;
    risks: string[];
  } {
    let affectedRecords = 0;
    let estimatedDuration = 0;
    const risks: string[] = [];
    
    // Estimate based on migration type
    switch (migration.type) {
      case 'schema_change':
        affectedRecords = 1000; // Conservative estimate
        estimatedDuration = 300; // 5 minutes
        break;
      case 'data_migration':
        affectedRecords = 10000; // Conservative estimate
        estimatedDuration = 1800; // 30 minutes
        risks.push('Data loss risk');
        break;
      case 'bulk_operation':
        affectedRecords = 100000; // Conservative estimate
        estimatedDuration = 3600; // 1 hour
        risks.push('High resource usage');
        risks.push('Potential downtime');
        break;
      case 'system_upgrade':
        affectedRecords = 0;
        estimatedDuration = 600; // 10 minutes
        risks.push('System downtime');
        break;
    }
    
    // Adjust based on configuration
    if (migration.config.parallel) {
      estimatedDuration = Math.max(estimatedDuration * 0.5, 60); // 50% faster, minimum 1 minute
    }
    
    if (migration.config.batchSize > 1000) {
      estimatedDuration = Math.max(estimatedDuration * 0.8, 60); // 20% faster
    }
    
    return {
      affectedRecords,
      estimatedDuration,
      risks
    };
  }

  /**
   * Creates a backup strategy for a migration
   */
  static createBackupStrategy(migration: MetadataMigration): {
    type: 'full' | 'incremental' | 'schema_only';
    location: string;
    compression: boolean;
    encryption: boolean;
  } {
    const isHighRisk = migration.type === 'data_migration' || migration.type === 'bulk_operation';
    
    return {
      type: isHighRisk ? 'full' : 'incremental',
      location: `backups/migrations/${migration.id}`,
      compression: true,
      encryption: isHighRisk
    };
  }

  /**
   * Validates migration dependencies
   */
  static validateDependencies(
    migration: MetadataMigration,
    existingMigrations: MetadataMigration[]
  ): {
    satisfied: boolean;
    missing: string[];
    conflicts: string[];
  } {
    const missing: string[] = [];
    const conflicts: string[] = [];
    
    if (migration.dependencies?.migrations) {
      migration.dependencies.migrations.forEach(depVersion => {
        const depMigration = existingMigrations.find(m => m.version === depVersion);
        if (!depMigration) {
          missing.push(depVersion);
        } else if (!depMigration.isActive) {
          conflicts.push(`Dependency ${depVersion} is not active`);
        }
      });
    }
    
    return {
      satisfied: missing.length === 0 && conflicts.length === 0,
      missing,
      conflicts
    };
  }

  /**
   * Creates a rollback plan
   */
  static createRollbackPlan(migration: MetadataMigration): {
    canRollback: boolean;
    rollbackSteps: string[];
    risks: string[];
  } {
    const canRollback = !!migration.downScript;
    const rollbackSteps: string[] = [];
    const risks: string[] = [];
    
    if (canRollback) {
      rollbackSteps.push('Execute down script');
      
      if (migration.schemaChanges?.added) {
        rollbackSteps.push('Remove added fields');
        risks.push('Data loss for added fields');
      }
      
      if (migration.schemaChanges?.modified) {
        rollbackSteps.push('Revert field modifications');
        risks.push('Data corruption for modified fields');
      }
      
      if (migration.dataTransformations) {
        rollbackSteps.push('Revert data transformations');
        risks.push('Data inconsistency');
      }
    } else {
      risks.push('No rollback script available');
    }
    
    return {
      canRollback,
      rollbackSteps,
      risks
    };
  }

  /**
   * Formats migration execution results
   */
  static formatExecutionResults(execution: MetadataMigrationExecution): Record<string, string> {
    return {
      'Status': execution.status,
      'Duration': execution.duration ? `${execution.duration}s` : 'N/A',
      'Records Processed': execution.results.recordsProcessed.toString(),
      'Records Skipped': execution.results.recordsSkipped.toString(),
      'Records Failed': execution.results.recordsFailed.toString(),
      'Success Rate': `${((execution.results.recordsProcessed - execution.results.recordsFailed) / execution.results.recordsProcessed * 100).toFixed(2)}%`,
      'Errors': execution.results.errors.length.toString(),
      'Warnings': execution.results.warnings.length.toString()
    };
  }

  /**
   * Creates a migration plan from multiple migrations
   */
  static createMigrationPlan(
    migrations: MetadataMigration[],
    tenantId: TenantID,
    createdBy: UserID,
    options?: Partial<MetadataMigrationPlan>
  ): MetadataMigrationPlan {
    // Sort migrations by version
    const sortedMigrations = migrations.sort((a, b) => 
      this.compareVersions(a.version, b.version)
    );
    
    const planMigrations = sortedMigrations.map((migration, index) => ({
      migration,
      order: index + 1,
      dependencies: migration.dependencies?.migrations || [],
      estimatedDuration: this.estimateMigrationImpact(migration).estimatedDuration,
      risk: this.assessMigrationRisk(migration)
    }));
    
    return {
      id: crypto.randomUUID() as UUID,
      name: `Migration Plan ${new Date().toISOString().split('T')[0]}`,
      migrations: planMigrations,
      strategy: {
        parallel: false,
        maxConcurrent: 1,
        rollbackOnFailure: true,
        continueOnError: false,
        validationOnly: false
      },
      tenantId,
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      ...options
    };
  }

  /**
   * Assesses the risk level of a migration
   */
  static assessMigrationRisk(migration: MetadataMigration): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // Type-based risk
    switch (migration.type) {
      case 'schema_change':
        riskScore += 1;
        break;
      case 'data_migration':
        riskScore += 3;
        break;
      case 'bulk_operation':
        riskScore += 4;
        break;
      case 'system_upgrade':
        riskScore += 2;
        break;
    }
    
    // Configuration-based risk
    if (!migration.config.backup) riskScore += 2;
    if (!migration.downScript) riskScore += 2;
    if (migration.config.parallel) riskScore += 1;
    if (migration.config.batchSize > 10000) riskScore += 1;
    
    // Dependencies-based risk
    if (migration.dependencies?.migrations?.length) riskScore += 1;
    
    if (riskScore <= 2) return 'low';
    if (riskScore <= 4) return 'medium';
    return 'high';
  }

  /**
   * Generates a migration report
   */
  static generateMigrationReport(execution: MetadataMigrationExecution): string {
    const results = this.formatExecutionResults(execution);
    
    let report = `# Migration Execution Report\n\n`;
    report += `**Migration ID:** ${execution.migrationId}\n`;
    report += `**Version:** ${execution.version}\n`;
    report += `**Status:** ${execution.status}\n`;
    report += `**Started:** ${execution.startedAt}\n`;
    report += `**Completed:** ${execution.completedAt || 'N/A'}\n\n`;
    
    report += `## Results\n\n`;
    Object.entries(results).forEach(([key, value]) => {
      report += `- **${key}:** ${value}\n`;
    });
    
    if (execution.results.errors.length > 0) {
      report += `\n## Errors\n\n`;
      execution.results.errors.forEach(error => {
        report += `- **${error.code}:** ${error.message}\n`;
      });
    }
    
    if (execution.results.warnings.length > 0) {
      report += `\n## Warnings\n\n`;
      execution.results.warnings.forEach(warning => {
        report += `- **${warning.code}:** ${warning.message}\n`;
      });
    }
    
    return report;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  MetadataMigration,
  MetadataMigrationExecution,
  MetadataMigrationPlan,
  MetadataMigrationBackup,
  MetadataMigrationValidation,
  MetadataMigrationManager,
  MetadataMigrationExecutor
};

export {
  MetadataMigrationDirection,
  MetadataMigrationPhase,
  MetadataMigrationRollbackStrategy,
  MetadataMigrationSchema,
  MetadataMigrationExecutionSchema,
  MetadataMigrationUtils
}; 