import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import semver from 'semver';

export interface ModuleVersion {
  id: string;
  moduleId: string;
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'stable';
  releaseDate: string;
  endOfLife?: string;
  breakingChanges: boolean;
  migrationRequired: boolean;
  dependencies: Record<string, string>;
  features: string[];
  deprecatedFeatures: string[];
  customizations: string[];
  tenantCompatibility: string[];
  performanceMetrics: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
  };
  securityPatches: string[];
  changelog: string;
}

export interface TenantModuleInstance {
  id: string;
  tenantId: string;
  moduleId: string;
  version: string;
  status: 'active' | 'migrating' | 'deprecated' | 'customized';
  customizations: Customization[];
  featureFlags: Record<string, boolean>;
  lastAccessed: string;
  usageMetrics: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    totalTransactions: number;
  };
  migrationHistory: MigrationRecord[];
  rollbackVersion?: string;
  customConfig: Record<string, any>;
}

export interface Customization {
  id: string;
  type: 'ui' | 'business-logic' | 'integration' | 'workflow';
  description: string;
  code: string;
  dependencies: string[];
  compatibility: string[];
  lastModified: string;
  author: string;
}

export interface MigrationRecord {
  id: string;
  fromVersion: string;
  toVersion: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'rolled-back';
  startTime: string;
  endTime?: string;
  errors?: string[];
  customizationsMigrated: number;
  dataMigrated: boolean;
}

export interface VersionCompatibility {
  sourceVersion: string;
  targetVersion: string;
  compatibility: 'compatible' | 'breaking' | 'deprecated' | 'unknown';
  migrationPath: string[];
  estimatedDowntime: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiredActions: string[];
}

export class MultiVersionService {
  private redis: Redis;
  private supabase: any;
  private readonly VERSION_CACHE_TTL = 3600; // 1 hour
  private readonly INSTANCE_CACHE_TTL = 300; // 5 minutes

  constructor(redisUrl: string, supabaseUrl: string, supabaseKey: string) {
    this.redis = new Redis(redisUrl);
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Register a new module version
   */
  async registerModuleVersion(version: Omit<ModuleVersion, 'id'>): Promise<string> {
    const id = `version_${version.moduleId}_${version.version}`;
    
    const { data, error } = await this.supabase
      .from('module_versions')
      .insert({
        id,
        ...version
      })
      .select()
      .single();

    if (error) throw error;

    // Cache the version
    await this.redis.setex(
      `module_version:${id}`,
      this.VERSION_CACHE_TTL,
      JSON.stringify(data)
    );

    // Update version index
    await this.updateVersionIndex(version.moduleId);

    return id;
  }

  /**
   * Get all versions of a module
   */
  async getModuleVersions(moduleId: string): Promise<ModuleVersion[]> {
    // Try cache first
    const cached = await this.redis.get(`module_versions:${moduleId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await this.supabase
      .from('module_versions')
      .select('*')
      .eq('module_id', moduleId)
      .order('release_date', { ascending: false });

    if (error) throw error;

    // Cache the result
    await this.redis.setex(
      `module_versions:${moduleId}`,
      this.VERSION_CACHE_TTL,
      JSON.stringify(data)
    );

    return data || [];
  }

  /**
   * Get the latest stable version of a module
   */
  async getLatestStableVersion(moduleId: string): Promise<ModuleVersion | null> {
    const versions = await this.getModuleVersions(moduleId);
    return versions.find(v => v.status === 'stable') || null;
  }

  /**
   * Create a tenant module instance
   */
  async createTenantInstance(
    tenantId: string,
    moduleId: string,
    version: string,
    customizations: Customization[] = []
  ): Promise<string> {
    const instanceId = `instance_${tenantId}_${moduleId}_${version}`;
    
    const instance: TenantModuleInstance = {
      id: instanceId,
      tenantId,
      moduleId,
      version,
      status: 'active',
      customizations,
      featureFlags: {},
      lastAccessed: new Date().toISOString(),
      usageMetrics: {
        dailyActiveUsers: 0,
        monthlyActiveUsers: 0,
        totalTransactions: 0
      },
      migrationHistory: [],
      customConfig: {}
    };

    const { error } = await this.supabase
      .from('tenant_module_instances')
      .insert(instance);

    if (error) throw error;

    // Cache the instance
    await this.redis.setex(
      `tenant_instance:${instanceId}`,
      this.INSTANCE_CACHE_TTL,
      JSON.stringify(instance)
    );

    return instanceId;
  }

  /**
   * Get tenant module instance
   */
  async getTenantInstance(tenantId: string, moduleId: string): Promise<TenantModuleInstance | null> {
    const { data, error } = await this.supabase
      .from('tenant_module_instances')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('module_id', moduleId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Check version compatibility
   */
  async checkCompatibility(
    sourceVersion: string,
    targetVersion: string,
    moduleId: string
  ): Promise<VersionCompatibility> {
    const source = await this.getModuleVersion(moduleId, sourceVersion);
    const target = await this.getModuleVersion(moduleId, targetVersion);

    if (!source || !target) {
      throw new Error('Version not found');
    }

    const compatibility = this.analyzeCompatibility(source, target);
    
    return {
      sourceVersion,
      targetVersion,
      compatibility: compatibility.level,
      migrationPath: this.calculateMigrationPath(sourceVersion, targetVersion, moduleId),
      estimatedDowntime: this.estimateDowntime(source, target),
      riskLevel: this.assessRiskLevel(source, target),
      requiredActions: this.getRequiredActions(source, target)
    };
  }

  /**
   * Migrate tenant to new version
   */
  async migrateTenant(
    tenantId: string,
    moduleId: string,
    targetVersion: string,
    options: {
      force?: boolean;
      preserveCustomizations?: boolean;
      rollbackOnFailure?: boolean;
      scheduledTime?: string;
    } = {}
  ): Promise<MigrationRecord> {
    const instance = await this.getTenantInstance(tenantId, moduleId);
    if (!instance) {
      throw new Error('Tenant instance not found');
    }

    const compatibility = await this.checkCompatibility(
      instance.version,
      targetVersion,
      moduleId
    );

    if (compatibility.compatibility === 'breaking' && !options.force) {
      throw new Error('Breaking changes detected. Use force=true to proceed.');
    }

    const migration: MigrationRecord = {
      id: `migration_${tenantId}_${moduleId}_${Date.now()}`,
      fromVersion: instance.version,
      toVersion: targetVersion,
      status: 'pending',
      startTime: new Date().toISOString(),
      customizationsMigrated: 0,
      dataMigrated: false
    };

    // Store migration record
    const { error } = await this.supabase
      .from('migration_records')
      .insert(migration);

    if (error) throw error;

    // Start migration process
    await this.executeMigration(migration, instance, options);

    return migration;
  }

  /**
   * Rollback tenant to previous version
   */
  async rollbackTenant(
    tenantId: string,
    moduleId: string,
    targetVersion?: string
  ): Promise<MigrationRecord> {
    const instance = await this.getTenantInstance(tenantId, moduleId);
    if (!instance) {
      throw new Error('Tenant instance not found');
    }

    const rollbackVersion = targetVersion || instance.rollbackVersion;
    if (!rollbackVersion) {
      throw new Error('No rollback version available');
    }

    const migration: MigrationRecord = {
      id: `rollback_${tenantId}_${moduleId}_${Date.now()}`,
      fromVersion: instance.version,
      toVersion: rollbackVersion,
      status: 'in-progress',
      startTime: new Date().toISOString(),
      customizationsMigrated: 0,
      dataMigrated: false
    };

    // Execute rollback
    await this.executeRollback(migration, instance);

    return migration;
  }

  /**
   * Enable/disable feature flags for tenant
   */
  async updateFeatureFlags(
    tenantId: string,
    moduleId: string,
    flags: Record<string, boolean>
  ): Promise<void> {
    const instance = await this.getTenantInstance(tenantId, moduleId);
    if (!instance) {
      throw new Error('Tenant instance not found');
    }

    const updatedFlags = { ...instance.featureFlags, ...flags };

    const { error } = await this.supabase
      .from('tenant_module_instances')
      .update({ feature_flags: updatedFlags })
      .eq('id', instance.id);

    if (error) throw error;

    // Update cache
    instance.featureFlags = updatedFlags;
    await this.redis.setex(
      `tenant_instance:${instance.id}`,
      this.INSTANCE_CACHE_TTL,
      JSON.stringify(instance)
    );
  }

  /**
   * Get all tenants using a specific version
   */
  async getTenantsByVersion(moduleId: string, version: string): Promise<TenantModuleInstance[]> {
    const { data, error } = await this.supabase
      .from('tenant_module_instances')
      .select('*')
      .eq('module_id', moduleId)
      .eq('version', version)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get version usage statistics
   */
  async getVersionUsageStats(moduleId: string): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('tenant_module_instances')
      .select('version, tenant_id')
      .eq('module_id', moduleId)
      .eq('status', 'active');

    if (error) throw error;

    const stats: Record<string, number> = {};
    data?.forEach(instance => {
      stats[instance.version] = (stats[instance.version] || 0) + 1;
    });

    return stats;
  }

  /**
   * Deprecate a module version
   */
  async deprecateVersion(
    moduleId: string,
    version: string,
    endOfLife: string,
    migrationPath: string[]
  ): Promise<void> {
    const { error } = await this.supabase
      .from('module_versions')
      .update({
        status: 'deprecated',
        end_of_life: endOfLife
      })
      .eq('module_id', moduleId)
      .eq('version', version);

    if (error) throw error;

    // Notify affected tenants
    const affectedTenants = await this.getTenantsByVersion(moduleId, version);
    await this.notifyTenantsOfDeprecation(affectedTenants, endOfLife, migrationPath);

    // Clear cache
    await this.redis.del(`module_versions:${moduleId}`);
  }

  /**
   * Run side-by-side versions
   */
  async enableSideBySideVersions(
    tenantId: string,
    moduleId: string,
    newVersion: string
  ): Promise<string> {
    // Create new instance alongside existing one
    const newInstanceId = await this.createTenantInstance(
      tenantId,
      moduleId,
      newVersion
    );

    // Update routing to support both versions
    await this.updateVersionRouting(tenantId, moduleId, {
      oldVersion: (await this.getTenantInstance(tenantId, moduleId))?.version,
      newVersion,
      routing: 'gradual' // or 'immediate', 'percentage'
    });

    return newInstanceId;
  }

  /**
   * Force upgrade all tenants to latest version
   */
  async forceUpgradeAll(
    moduleId: string,
    targetVersion: string,
    options: {
      batchSize?: number;
      delayBetweenBatches?: number;
      excludeTenants?: string[];
    } = {}
  ): Promise<MigrationRecord[]> {
    const instances = await this.getAllActiveInstances(moduleId);
    const filteredInstances = instances.filter(
      instance => !options.excludeTenants?.includes(instance.tenantId)
    );

    const migrations: MigrationRecord[] = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delayBetweenBatches || 5000;

    for (let i = 0; i < filteredInstances.length; i += batchSize) {
      const batch = filteredInstances.slice(i, i + batchSize);
      
      const batchMigrations = await Promise.all(
        batch.map(instance =>
          this.migrateTenant(instance.tenantId, moduleId, targetVersion, {
            force: true,
            preserveCustomizations: true
          })
        )
      );

      migrations.push(...batchMigrations);

      if (i + batchSize < filteredInstances.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return migrations;
  }

  // Private helper methods

  private async getModuleVersion(moduleId: string, version: string): Promise<ModuleVersion | null> {
    const { data, error } = await this.supabase
      .from('module_versions')
      .select('*')
      .eq('module_id', moduleId)
      .eq('version', version)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private async updateVersionIndex(moduleId: string): Promise<void> {
    await this.redis.del(`module_versions:${moduleId}`);
  }

  private analyzeCompatibility(source: ModuleVersion, target: ModuleVersion): {
    level: 'compatible' | 'breaking' | 'deprecated' | 'unknown';
    breakingChanges: string[];
    deprecatedFeatures: string[];
  } {
    const breakingChanges: string[] = [];
    const deprecatedFeatures: string[] = [];

    // Check for breaking changes
    if (target.breakingChanges) {
      breakingChanges.push('Breaking changes detected in target version');
    }

    // Check for deprecated features
    const deprecated = target.deprecatedFeatures.filter(
      feature => source.features.includes(feature)
    );
    deprecatedFeatures.push(...deprecated);

    // Determine compatibility level
    let level: 'compatible' | 'breaking' | 'deprecated' | 'unknown' = 'compatible';
    
    if (target.status === 'deprecated') {
      level = 'deprecated';
    } else if (breakingChanges.length > 0) {
      level = 'breaking';
    }

    return { level, breakingChanges, deprecatedFeatures };
  }

  private calculateMigrationPath(
    sourceVersion: string,
    targetVersion: string,
    moduleId: string
  ): string[] {
    // Simple path calculation - can be enhanced with dependency graph
    return [sourceVersion, targetVersion];
  }

  private estimateDowntime(source: ModuleVersion, target: ModuleVersion): number {
    // Estimate based on version difference and complexity
    const versionDiff = semver.diff(source.version, target.version);
    let baseTime = 0;

    switch (versionDiff) {
      case 'patch':
        baseTime = 5; // 5 minutes
        break;
      case 'minor':
        baseTime = 15; // 15 minutes
        break;
      case 'major':
        baseTime = 60; // 1 hour
        break;
      default:
        baseTime = 30; // 30 minutes
    }

    // Add time for breaking changes
    if (target.breakingChanges) {
      baseTime *= 2;
    }

    return baseTime;
  }

  private assessRiskLevel(source: ModuleVersion, target: ModuleVersion): 'low' | 'medium' | 'high' | 'critical' {
    if (target.status === 'deprecated') return 'critical';
    if (target.breakingChanges) return 'high';
    if (semver.diff(source.version, target.version) === 'major') return 'medium';
    return 'low';
  }

  private getRequiredActions(source: ModuleVersion, target: ModuleVersion): string[] {
    const actions: string[] = [];

    if (target.breakingChanges) {
      actions.push('Review breaking changes documentation');
      actions.push('Update custom integrations');
      actions.push('Test thoroughly in staging environment');
    }

    if (target.deprecatedFeatures.length > 0) {
      actions.push('Replace deprecated features');
    }

    if (target.migrationRequired) {
      actions.push('Run data migration scripts');
    }

    return actions;
  }

  private async executeMigration(
    migration: MigrationRecord,
    instance: TenantModuleInstance,
    options: any
  ): Promise<void> {
    try {
      // Update migration status
      await this.updateMigrationStatus(migration.id, 'in-progress');

      // Backup current state
      await this.backupTenantState(instance);

      // Migrate customizations if preserving
      if (options.preserveCustomizations) {
        const migratedCount = await this.migrateCustomizations(
          instance.customizations,
          migration.fromVersion,
          migration.toVersion
        );
        await this.updateMigrationCustomizations(migration.id, migratedCount);
      }

      // Migrate data
      await this.migrateData(instance.tenantId, instance.moduleId, migration);
      await this.updateMigrationData(migration.id, true);

      // Update tenant instance
      await this.updateTenantVersion(instance.id, migration.toVersion);

      // Update migration status
      await this.updateMigrationStatus(migration.id, 'completed', new Date().toISOString());

    } catch (error) {
      await this.updateMigrationStatus(migration.id, 'failed', undefined, [error.message]);
      
      if (options.rollbackOnFailure) {
        await this.rollbackTenant(instance.tenantId, instance.moduleId, migration.fromVersion);
      }
      
      throw error;
    }
  }

  private async executeRollback(migration: MigrationRecord, instance: TenantModuleInstance): Promise<void> {
    // Implementation for rollback logic
    await this.updateMigrationStatus(migration.id, 'completed', new Date().toISOString());
  }

  private async updateMigrationStatus(
    migrationId: string,
    status: string,
    endTime?: string,
    errors?: string[]
  ): Promise<void> {
    const update: any = { status };
    if (endTime) update.end_time = endTime;
    if (errors) update.errors = errors;

    const { error } = await this.supabase
      .from('migration_records')
      .update(update)
      .eq('id', migrationId);

    if (error) throw error;
  }

  private async backupTenantState(instance: TenantModuleInstance): Promise<void> {
    // Implementation for backing up tenant state
  }

  private async migrateCustomizations(
    customizations: Customization[],
    fromVersion: string,
    toVersion: string
  ): Promise<number> {
    // Implementation for migrating customizations
    return customizations.length;
  }

  private async migrateData(
    tenantId: string,
    moduleId: string,
    migration: MigrationRecord
  ): Promise<void> {
    // Implementation for data migration
  }

  private async updateTenantVersion(instanceId: string, newVersion: string): Promise<void> {
    const { error } = await this.supabase
      .from('tenant_module_instances')
      .update({ version: newVersion })
      .eq('id', instanceId);

    if (error) throw error;
  }

  private async updateMigrationCustomizations(migrationId: string, count: number): Promise<void> {
    const { error } = await this.supabase
      .from('migration_records')
      .update({ customizations_migrated: count })
      .eq('id', migrationId);

    if (error) throw error;
  }

  private async updateMigrationData(migrationId: string, migrated: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('migration_records')
      .update({ data_migrated: migrated })
      .eq('id', migrationId);

    if (error) throw error;
  }

  private async notifyTenantsOfDeprecation(
    tenants: TenantModuleInstance[],
    endOfLife: string,
    migrationPath: string[]
  ): Promise<void> {
    // Implementation for notifying tenants
  }

  private async updateVersionRouting(
    tenantId: string,
    moduleId: string,
    routing: any
  ): Promise<void> {
    // Implementation for version routing
  }

  private async getAllActiveInstances(moduleId: string): Promise<TenantModuleInstance[]> {
    const { data, error } = await this.supabase
      .from('tenant_module_instances')
      .select('*')
      .eq('module_id', moduleId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }
} 