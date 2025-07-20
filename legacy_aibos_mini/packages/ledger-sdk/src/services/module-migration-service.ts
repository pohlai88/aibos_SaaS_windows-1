import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { MultiVersionService } from './multi-version-service';

export interface ModuleMigration {
  id: string;
  moduleId: string;
  fromVersion: string;
  toVersion: string;
  tenantId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'rolled-back';
  migrationType: 'schema' | 'data' | 'both';
  startTime: string;
  endTime?: string;
  errors?: string[];
  warnings?: string[];
  rollbackData?: any;
  migrationSteps: MigrationStep[];
  customizationsMigrated: number;
  dataRecordsMigrated: number;
  schemaChangesApplied: number;
  backupId?: string;
  rollbackId?: string;
}

export interface MigrationStep {
  id: string;
  name: string;
  type: 'backup' | 'schema' | 'data' | 'customization' | 'validation' | 'cleanup';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  error?: string;
  details?: any;
  rollbackSupported: boolean;
  rollbackData?: any;
}

export interface SchemaMigration {
  id: string;
  moduleId: string;
  version: string;
  migrationFile: string;
  checksum: string;
  upSQL: string;
  downSQL: string;
  dependencies: string[];
  rollbackSupported: boolean;
  validationQueries: string[];
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataMigration {
  id: string;
  moduleId: string;
  fromVersion: string;
  toVersion: string;
  transformationRules: DataTransformationRule[];
  validationRules: DataValidationRule[];
  rollbackStrategy: 'snapshot' | 'incremental' | 'none';
  batchSize: number;
  estimatedRecords: number;
}

export interface DataTransformationRule {
  id: string;
  sourceTable: string;
  targetTable: string;
  transformationType: 'copy' | 'transform' | 'merge' | 'split' | 'custom';
  mapping: Record<string, string>;
  conditions?: string[];
  customLogic?: string;
  validationQueries?: string[];
}

export interface DataValidationRule {
  id: string;
  name: string;
  query: string;
  expectedResult: any;
  severity: 'error' | 'warning' | 'info';
  description: string;
}

export interface MigrationBackup {
  id: string;
  tenantId: string;
  moduleId: string;
  version: string;
  backupType: 'full' | 'incremental' | 'schema-only';
  backupData: any;
  metadata: {
    tables: string[];
    recordCounts: Record<string, number>;
    customizations: any[];
    schemaVersion: string;
  };
  createdAt: string;
  expiresAt: string;
  size: number;
}

export interface RollbackPoint {
  id: string;
  tenantId: string;
  moduleId: string;
  version: string;
  rollbackData: any;
  migrationId: string;
  createdAt: string;
  expiresAt: string;
  description: string;
}

export class ModuleMigrationService {
  private redis: Redis;
  private supabase: any;
  private multiVersionService: MultiVersionService;
  private readonly MIGRATION_CACHE_TTL = 1800; // 30 minutes
  private readonly BACKUP_CACHE_TTL = 3600; // 1 hour

  constructor(
    redisUrl: string,
    supabaseUrl: string,
    supabaseKey: string,
    multiVersionService: MultiVersionService
  ) {
    this.redis = new Redis(redisUrl);
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.multiVersionService = multiVersionService;
  }

  /**
   * Register a schema migration for a module version
   */
  async registerSchemaMigration(migration: Omit<SchemaMigration, 'id'>): Promise<string> {
    const id = `schema_${migration.moduleId}_${migration.version}_${Date.now()}`;
    
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .insert({
        id,
        ...migration
      })
      .select()
      .single();

    if (error) throw error;

    // Cache the migration
    await this.redis.setex(
      `schema_migration:${id}`,
      this.MIGRATION_CACHE_TTL,
      JSON.stringify(data)
    );

    return id;
  }

  /**
   * Register a data migration for a module version
   */
  async registerDataMigration(migration: Omit<DataMigration, 'id'>): Promise<string> {
    const id = `data_${migration.moduleId}_${migration.fromVersion}_${migration.toVersion}`;
    
    const { data, error } = await this.supabase
      .from('data_migrations')
      .insert({
        id,
        ...migration
      })
      .select()
      .single();

    if (error) throw error;

    // Cache the migration
    await this.redis.setex(
      `data_migration:${id}`,
      this.MIGRATION_CACHE_TTL,
      JSON.stringify(data)
    );

    return id;
  }

  /**
   * Create a backup before migration
   */
  async createMigrationBackup(
    tenantId: string,
    moduleId: string,
    version: string,
    backupType: 'full' | 'incremental' | 'schema-only' = 'full'
  ): Promise<string> {
    const backupId = `backup_${tenantId}_${moduleId}_${Date.now()}`;
    
    // Get current data
    const backupData = await this.extractTenantData(tenantId, moduleId, backupType);
    
    // Get customizations
    const customizations = await this.getTenantCustomizations(tenantId, moduleId);
    
    // Get schema information
    const schemaInfo = await this.getModuleSchema(moduleId, version);
    
    const backup: MigrationBackup = {
      id: backupId,
      tenantId,
      moduleId,
      version,
      backupType,
      backupData,
      metadata: {
        tables: Object.keys(backupData),
        recordCounts: this.calculateRecordCounts(backupData),
        customizations,
        schemaVersion: version
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      size: JSON.stringify(backupData).length
    };

    const { error } = await this.supabase
      .from('migration_backups')
      .insert(backup);

    if (error) throw error;

    // Cache the backup
    await this.redis.setex(
      `migration_backup:${backupId}`,
      this.BACKUP_CACHE_TTL,
      JSON.stringify(backup)
    );

    return backupId;
  }

  /**
   * Execute a complete module migration for a tenant
   */
  async executeModuleMigration(
    tenantId: string,
    moduleId: string,
    fromVersion: string,
    toVersion: string,
    options: {
      preserveCustomizations?: boolean;
      rollbackOnFailure?: boolean;
      validateOnly?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<ModuleMigration> {
    const migrationId = `migration_${tenantId}_${moduleId}_${Date.now()}`;
    
    // Create migration record
    const migration: ModuleMigration = {
      id: migrationId,
      moduleId,
      fromVersion,
      toVersion,
      tenantId,
      status: 'pending',
      migrationType: 'both',
      startTime: new Date().toISOString(),
      migrationSteps: [],
      customizationsMigrated: 0,
      dataRecordsMigrated: 0,
      schemaChangesApplied: 0
    };

    // Store migration record
    const { error } = await this.supabase
      .from('module_migrations')
      .insert(migration);

    if (error) throw error;

    try {
      // Execute migration steps
      await this.executeMigrationSteps(migration, options);
      
      // Update migration status
      await this.updateMigrationStatus(migrationId, 'completed', new Date().toISOString());
      
      return await this.getMigration(migrationId);
      
    } catch (error) {
      // Update migration status with error
      await this.updateMigrationStatus(
        migrationId,
        'failed',
        new Date().toISOString(),
        [error instanceof Error ? error.message : 'Unknown error']
      );
      
      // Rollback if configured
      if (options.rollbackOnFailure) {
        await this.rollbackMigration(migrationId);
      }
      
      throw error;
    }
  }

  /**
   * Rollback a failed migration
   */
  async rollbackMigration(migrationId: string): Promise<ModuleMigration> {
    const migration = await this.getMigration(migrationId);
    if (!migration) {
      throw new Error('Migration not found');
    }

    // Create rollback point
    const rollbackPoint = await this.createRollbackPoint(
      migration.tenantId,
      migration.moduleId,
      migration.fromVersion,
      migrationId,
      'Automatic rollback from failed migration'
    );

    try {
      // Execute rollback steps in reverse order
      await this.executeRollbackSteps(migration);
      
      // Update migration status
      await this.updateMigrationStatus(migrationId, 'rolled-back', new Date().toISOString());
      
      // Update rollback point reference
      await this.updateMigrationRollbackId(migrationId, rollbackPoint.id);
      
      return await this.getMigration(migrationId);
      
    } catch (error) {
      // If rollback fails, mark as failed
      await this.updateMigrationStatus(
        migrationId,
        'failed',
        new Date().toISOString(),
        [error instanceof Error ? error.message : 'Rollback failed']
      );
      
      throw error;
    }
  }

  /**
   * Restore from a backup
   */
  async restoreFromBackup(backupId: string): Promise<void> {
    const backup = await this.getBackup(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    // Validate backup integrity
    await this.validateBackup(backup);

    // Restore data
    await this.restoreTenantData(backup.tenantId, backup.moduleId, backup.backupData);

    // Restore customizations
    if (backup.metadata.customizations.length > 0) {
      await this.restoreCustomizations(backup.tenantId, backup.moduleId, backup.metadata.customizations);
    }

    // Update tenant version
    await this.multiVersionService.updateTenantVersion(
      backup.tenantId,
      backup.moduleId,
      backup.version
    );
  }

  /**
   * Validate migration before execution
   */
  async validateMigration(
    tenantId: string,
    moduleId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    estimatedTime: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let estimatedTime = 0;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check version compatibility
    const compatibility = await this.multiVersionService.checkCompatibility(
      fromVersion,
      toVersion,
      moduleId
    );

    if (compatibility.compatibility === 'breaking') {
      riskLevel = 'high';
      warnings.push('Breaking changes detected - careful testing required');
    }

    // Get schema migrations
    const schemaMigrations = await this.getSchemaMigrations(moduleId, fromVersion, toVersion);
    for (const migration of schemaMigrations) {
      estimatedTime += migration.estimatedTime;
      if (migration.riskLevel === 'critical') {
        riskLevel = 'critical';
        errors.push(`Critical schema migration: ${migration.migrationFile}`);
      }
    }

    // Get data migrations
    const dataMigrations = await this.getDataMigrations(moduleId, fromVersion, toVersion);
    for (const migration of dataMigrations) {
      estimatedTime += Math.ceil(migration.estimatedRecords / migration.batchSize) * 0.1; // 0.1s per batch
    }

    // Check tenant data volume
    const dataVolume = await this.getTenantDataVolume(tenantId, moduleId);
    if (dataVolume.totalRecords > 1000000) {
      warnings.push('Large data volume detected - consider off-peak migration');
      estimatedTime *= 1.5;
    }

    // Check customizations
    const customizations = await this.getTenantCustomizations(tenantId, moduleId);
    if (customizations.length > 10) {
      warnings.push('Many customizations detected - migration may take longer');
      estimatedTime *= 1.2;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      estimatedTime,
      riskLevel
    };
  }

  /**
   * Get migration statistics
   */
  async getMigrationStatistics(moduleId: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    rolledBack: number;
    averageTime: number;
    successRate: number;
  }> {
    const { data, error } = await this.supabase
      .from('module_migrations')
      .select('*')
      .eq('module_id', moduleId);

    if (error) throw error;

    const migrations = data || [];
    const total = migrations.length;
    const successful = migrations.filter(m => m.status === 'completed').length;
    const failed = migrations.filter(m => m.status === 'failed').length;
    const rolledBack = migrations.filter(m => m.status === 'rolled-back').length;

    const completedMigrations = migrations.filter(m => m.status === 'completed' && m.endTime);
    const averageTime = completedMigrations.length > 0
      ? completedMigrations.reduce((sum, m) => {
          const duration = new Date(m.endTime!).getTime() - new Date(m.startTime).getTime();
          return sum + duration;
        }, 0) / completedMigrations.length / 1000 / 60 // Convert to minutes
      : 0;

    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      successful,
      failed,
      rolledBack,
      averageTime,
      successRate
    };
  }

  // Private helper methods

  private async executeMigrationSteps(
    migration: ModuleMigration,
    options: any
  ): Promise<void> {
    const steps: MigrationStep[] = [];

    // Step 1: Create backup
    steps.push({
      id: `step_${migration.id}_backup`,
      name: 'Create Migration Backup',
      type: 'backup',
      status: 'pending',
      rollbackSupported: false
    });

    // Step 2: Schema migration
    const schemaMigrations = await this.getSchemaMigrations(
      migration.moduleId,
      migration.fromVersion,
      migration.toVersion
    );
    
    for (const schemaMigration of schemaMigrations) {
      steps.push({
        id: `step_${migration.id}_schema_${schemaMigration.id}`,
        name: `Schema Migration: ${schemaMigration.migrationFile}`,
        type: 'schema',
        status: 'pending',
        rollbackSupported: schemaMigration.rollbackSupported,
        details: schemaMigration
      });
    }

    // Step 3: Data migration
    const dataMigrations = await this.getDataMigrations(
      migration.moduleId,
      migration.fromVersion,
      migration.toVersion
    );
    
    for (const dataMigration of dataMigrations) {
      steps.push({
        id: `step_${migration.id}_data_${dataMigration.id}`,
        name: `Data Migration: ${dataMigration.id}`,
        type: 'data',
        status: 'pending',
        rollbackSupported: dataMigration.rollbackStrategy !== 'none',
        details: dataMigration
      });
    }

    // Step 4: Customization migration
    if (options.preserveCustomizations) {
      steps.push({
        id: `step_${migration.id}_customization`,
        name: 'Migrate Customizations',
        type: 'customization',
        status: 'pending',
        rollbackSupported: true
      });
    }

    // Step 5: Validation
    steps.push({
      id: `step_${migration.id}_validation`,
      name: 'Validate Migration',
      type: 'validation',
      status: 'pending',
      rollbackSupported: false
    });

    // Execute steps
    for (const step of steps) {
      await this.executeMigrationStep(migration.id, step, options);
    }
  }

  private async executeMigrationStep(
    migrationId: string,
    step: MigrationStep,
    options: any
  ): Promise<void> {
    // Update step status
    await this.updateStepStatus(step.id, 'in-progress', new Date().toISOString());

    try {
      switch (step.type) {
        case 'backup':
          await this.executeBackupStep(migrationId, step);
          break;
        case 'schema':
          await this.executeSchemaStep(migrationId, step);
          break;
        case 'data':
          await this.executeDataStep(migrationId, step, options);
          break;
        case 'customization':
          await this.executeCustomizationStep(migrationId, step);
          break;
        case 'validation':
          await this.executeValidationStep(migrationId, step);
          break;
      }

      // Update step status
      await this.updateStepStatus(step.id, 'completed', undefined, undefined, new Date().toISOString());

    } catch (error) {
      // Update step status with error
      await this.updateStepStatus(
        step.id,
        'failed',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  private async executeBackupStep(migrationId: string, step: MigrationStep): Promise<void> {
    const migration = await this.getMigration(migrationId);
    if (!migration) throw new Error('Migration not found');

    const backupId = await this.createMigrationBackup(
      migration.tenantId,
      migration.moduleId,
      migration.fromVersion
    );

    // Update migration with backup ID
    await this.updateMigrationBackupId(migrationId, backupId);
  }

  private async executeSchemaStep(migrationId: string, step: MigrationStep): Promise<void> {
    const migration = await this.getMigration(migrationId);
    if (!migration) throw new Error('Migration not found');

    const schemaMigration = step.details as SchemaMigration;
    
    // Execute schema migration SQL
    const { error } = await this.supabase.rpc('execute_sql', {
      sql_query: schemaMigration.upSQL,
      tenant_id: migration.tenantId
    });

    if (error) throw error;

    // Run validation queries
    for (const validationQuery of schemaMigration.validationQueries) {
      const { data, error: validationError } = await this.supabase.rpc('execute_sql', {
        sql_query: validationQuery,
        tenant_id: migration.tenantId
      });

      if (validationError) {
        throw new Error(`Schema validation failed: ${validationError.message}`);
      }
    }
  }

  private async executeDataStep(
    migrationId: string,
    step: MigrationStep,
    options: any
  ): Promise<void> {
    const migration = await this.getMigration(migrationId);
    if (!migration) throw new Error('Migration not found');

    const dataMigration = step.details as DataMigration;
    const batchSize = options.batchSize || dataMigration.batchSize;

    // Execute data transformations in batches
    for (const rule of dataMigration.transformationRules) {
      await this.executeDataTransformation(
        migration.tenantId,
        rule,
        batchSize
      );
    }

    // Run validation rules
    for (const rule of dataMigration.validationRules) {
      await this.executeDataValidation(migration.tenantId, rule);
    }
  }

  private async executeCustomizationStep(migrationId: string, step: MigrationStep): Promise<void> {
    const migration = await this.getMigration(migrationId);
    if (!migration) throw new Error('Migration not found');

    // Migrate customizations
    const customizations = await this.getTenantCustomizations(
      migration.tenantId,
      migration.moduleId
    );

    const migratedCount = await this.migrateCustomizations(
      customizations,
      migration.fromVersion,
      migration.toVersion
    );

    // Update migration with customization count
    await this.updateMigrationCustomizations(migrationId, migratedCount);
  }

  private async executeValidationStep(migrationId: string, step: MigrationStep): Promise<void> {
    const migration = await this.getMigration(migrationId);
    if (!migration) throw new Error('Migration not found');

    // Run comprehensive validation
    await this.validateMigrationResult(
      migration.tenantId,
      migration.moduleId,
      migration.toVersion
    );
  }

  private async executeRollbackSteps(migration: ModuleMigration): Promise<void> {
    // Execute rollback steps in reverse order
    const steps = migration.migrationSteps
      .filter(step => step.rollbackSupported)
      .reverse();

    for (const step of steps) {
      await this.executeRollbackStep(migration.id, step);
    }
  }

  private async executeRollbackStep(migrationId: string, step: MigrationStep): Promise<void> {
    // Implementation for rollback step execution
    // This would restore the previous state based on the step type
  }

  private async extractTenantData(
    tenantId: string,
    moduleId: string,
    backupType: string
  ): Promise<any> {
    // Implementation for extracting tenant data
    // This would query all module-specific tables for the tenant
    return {};
  }

  private async getTenantCustomizations(tenantId: string, moduleId: string): Promise<any[]> {
    // Implementation for getting tenant customizations
    return [];
  }

  private async getModuleSchema(moduleId: string, version: string): Promise<any> {
    // Implementation for getting module schema
    return {};
  }

  private calculateRecordCounts(backupData: any): Record<string, number> {
    // Implementation for calculating record counts
    return {};
  }

  private async getSchemaMigrations(
    moduleId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<SchemaMigration[]> {
    // Implementation for getting schema migrations
    return [];
  }

  private async getDataMigrations(
    moduleId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<DataMigration[]> {
    // Implementation for getting data migrations
    return [];
  }

  private async getTenantDataVolume(tenantId: string, moduleId: string): Promise<any> {
    // Implementation for getting tenant data volume
    return { totalRecords: 0 };
  }

  private async createRollbackPoint(
    tenantId: string,
    moduleId: string,
    version: string,
    migrationId: string,
    description: string
  ): Promise<string> {
    // Implementation for creating rollback point
    return 'rollback_point_id';
  }

  private async getMigration(migrationId: string): Promise<ModuleMigration | null> {
    // Implementation for getting migration
    return null;
  }

  private async updateMigrationStatus(
    migrationId: string,
    status: string,
    endTime?: string,
    errors?: string[]
  ): Promise<void> {
    // Implementation for updating migration status
  }

  private async updateMigrationRollbackId(migrationId: string, rollbackId: string): Promise<void> {
    // Implementation for updating migration rollback ID
  }

  private async updateMigrationBackupId(migrationId: string, backupId: string): Promise<void> {
    // Implementation for updating migration backup ID
  }

  private async updateMigrationCustomizations(migrationId: string, count: number): Promise<void> {
    // Implementation for updating migration customizations
  }

  private async updateStepStatus(
    stepId: string,
    status: string,
    startTime?: string,
    error?: string,
    endTime?: string
  ): Promise<void> {
    // Implementation for updating step status
  }

  private async executeDataTransformation(
    tenantId: string,
    rule: DataTransformationRule,
    batchSize: number
  ): Promise<void> {
    // Implementation for executing data transformation
  }

  private async executeDataValidation(tenantId: string, rule: DataValidationRule): Promise<void> {
    // Implementation for executing data validation
  }

  private async migrateCustomizations(
    customizations: any[],
    fromVersion: string,
    toVersion: string
  ): Promise<number> {
    // Implementation for migrating customizations
    return customizations.length;
  }

  private async validateMigrationResult(
    tenantId: string,
    moduleId: string,
    version: string
  ): Promise<void> {
    // Implementation for validating migration result
  }

  private async getBackup(backupId: string): Promise<MigrationBackup | null> {
    // Implementation for getting backup
    return null;
  }

  private async validateBackup(backup: MigrationBackup): Promise<void> {
    // Implementation for validating backup
  }

  private async restoreTenantData(tenantId: string, moduleId: string, backupData: any): Promise<void> {
    // Implementation for restoring tenant data
  }

  private async restoreCustomizations(tenantId: string, moduleId: string, customizations: any[]): Promise<void> {
    // Implementation for restoring customizations
  }
} 