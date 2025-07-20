/**
 * AI-BOS Module Registry Database Service
 * 
 * Handles all database operations for the module registry
 */

import { createClient } from '@supabase/supabase-js';
import { ModuleMetadata, ModuleInstallation, ModuleStatus, InstallationStatus } from './index';

export interface Developer {
  id: string;
  email: string;
  name: string;
  company?: string;
  website?: string;
  api_key: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleReview {
  id: string;
  module_id: string;
  developer_id: string;
  reviewer_id?: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  feedback?: string;
  files: any[];
  created_at: string;
  updated_at: string;
}

export interface ModuleRevenue {
  id: string;
  module_id: string;
  developer_id: string;
  organization_id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  transaction_date: string;
  created_at: string;
}

export class ModuleRegistryDatabase {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  // Developer operations
  async createDeveloper(developer: Omit<Developer, 'id' | 'created_at' | 'updated_at'>): Promise<Developer> {
    const { data, error } = await this.supabase
      .from('developers')
      .insert(developer)
      .select()
      .single();

    if (error) throw new Error(`Failed to create developer: ${error.message}`);
    return data;
  }

  async getDeveloperById(id: string): Promise<Developer | null> {
    const { data, error } = await this.supabase
      .from('developers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get developer: ${error.message}`);
    return data;
  }

  async getDeveloperByApiKey(apiKey: string): Promise<Developer | null> {
    const { data, error } = await this.supabase
      .from('developers')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get developer: ${error.message}`);
    return data;
  }

  // Module operations
  async createModule(module: Omit<ModuleMetadata, 'createdAt' | 'updatedAt'>): Promise<ModuleMetadata> {
    const { data, error } = await this.supabase
      .from('modules')
      .insert({
        ...module,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create module: ${error.message}`);
    return this.mapDatabaseModuleToMetadata(data);
  }

  async getModuleById(id: string): Promise<ModuleMetadata | null> {
    const { data, error } = await this.supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get module: ${error.message}`);
    return data ? this.mapDatabaseModuleToMetadata(data) : null;
  }

  async isModuleInstalled(moduleId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('module_installations')
      .select('id')
      .eq('module_id', moduleId)
      .eq('status', 'installed')
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to check module installation: ${error.message}`);
    return !!data;
  }

  async createModuleIntegration(integration: any): Promise<void> {
    const { error } = await this.supabase
      .from('module_integrations')
      .insert({
        id: integration.id,
        source_module: integration.sourceModule,
        target_module: integration.targetModule,
        event_types: integration.eventTypes,
        data_access: integration.dataAccess,
        status: integration.status,
        last_sync: integration.lastSync.toISOString(),
        config: integration.config
      });

    if (error) throw new Error(`Failed to create module integration: ${error.message}`);
  }

  async updateModuleIntegration(integrationId: string, integration: any): Promise<void> {
    const { error } = await this.supabase
      .from('module_integrations')
      .update({
        status: integration.status,
        last_sync: integration.lastSync.toISOString(),
        config: integration.config
      })
      .eq('id', integrationId);

    if (error) throw new Error(`Failed to update module integration: ${error.message}`);
  }

  async getModuleData(moduleId: string, table: string, filters?: Record<string, any>): Promise<any[]> {
    // This is a simplified implementation
    // In a real system, you'd have proper table mapping and query building
    let query = this.supabase
      .from(table)
      .select('*')
      .eq('module_id', moduleId);

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get module data: ${error.message}`);
    return data || [];
  }

  async setModuleData(moduleId: string, table: string, data: any): Promise<void> {
    // This is a simplified implementation
    // In a real system, you'd have proper table mapping and data validation
    const { error } = await this.supabase
      .from(table)
      .upsert({
        module_id: moduleId,
        data: data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'module_id'
      });

    if (error) throw new Error(`Failed to set module data: ${error.message}`);
  }

  async getModuleInstallation(moduleId: string): Promise<ModuleInstallation | null> {
    const { data, error } = await this.supabase
      .from('module_installations')
      .select('*')
      .eq('module_id', moduleId)
      .eq('status', 'installed')
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get module installation: ${error.message}`);
    return data ? this.mapDatabaseInstallationToInstallation(data) : null;
  }

  async getAllModuleInstallations(): Promise<ModuleInstallation[]> {
    const { data, error } = await this.supabase
      .from('module_installations')
      .select('*')
      .eq('status', 'installed')
      .order('installed_at', { ascending: false });

    if (error) throw new Error(`Failed to get module installations: ${error.message}`);
    return data.map(this.mapDatabaseInstallationToInstallation);
  }

  async removeModuleIntegration(integrationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('module_integrations')
      .delete()
      .eq('id', integrationId);

    if (error) throw new Error(`Failed to remove module integration: ${error.message}`);
  }

  async getModulesByAuthor(authorId: string): Promise<ModuleMetadata[]> {
    const { data, error } = await this.supabase
      .from('modules')
      .select('*')
      .eq('author', authorId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get modules: ${error.message}`);
    return data.map(this.mapDatabaseModuleToMetadata);
  }

  async getPublishedModules(category?: string, search?: string, page = 1, limit = 20): Promise<{
    modules: ModuleMetadata[];
    pagination: { page: number; limit: number; total: number };
  }> {
    let query = this.supabase
      .from('modules')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('downloads', { ascending: false });

    if (error) throw new Error(`Failed to get modules: ${error.message}`);

    return {
      modules: data.map(this.mapDatabaseModuleToMetadata),
      pagination: {
        page,
        limit,
        total: count || 0
      }
    };
  }

  async updateModule(id: string, updates: Partial<ModuleMetadata>): Promise<ModuleMetadata> {
    const { data, error } = await this.supabase
      .from('modules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update module: ${error.message}`);
    return this.mapDatabaseModuleToMetadata(data);
  }

  async deleteModule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete module: ${error.message}`);
  }

  // Installation operations
  async createInstallation(installation: Omit<ModuleInstallation, 'id'>): Promise<ModuleInstallation> {
    const { data, error } = await this.supabase
      .from('module_installations')
      .insert({
        module_id: installation.moduleId,
        organization_id: installation.configuration.organizationId,
        version: installation.version,
        status: installation.status,
        location: installation.location,
        configuration: installation.configuration,
        installed_at: installation.installedAt.toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create installation: ${error.message}`);
    return this.mapDatabaseInstallationToInstallation(data);
  }

  async getInstallationsByOrganization(organizationId: string): Promise<ModuleInstallation[]> {
    const { data, error } = await this.supabase
      .from('module_installations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'installed')
      .order('installed_at', { ascending: false });

    if (error) throw new Error(`Failed to get installations: ${error.message}`);
    return data.map(this.mapDatabaseInstallationToInstallation);
  }

  async updateInstallationStatus(id: string, status: InstallationStatus): Promise<void> {
    const { error } = await this.supabase
      .from('module_installations')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(`Failed to update installation: ${error.message}`);
  }

  // Review operations
  async createReview(review: Omit<ModuleReview, 'id' | 'created_at' | 'updated_at'>): Promise<ModuleReview> {
    const { data, error } = await this.supabase
      .from('module_reviews')
      .insert({
        ...review,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create review: ${error.message}`);
    return data;
  }

  async getReviewsByDeveloper(developerId: string): Promise<ModuleReview[]> {
    const { data, error } = await this.supabase
      .from('module_reviews')
      .select('*')
      .eq('developer_id', developerId)
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(`Failed to get reviews: ${error.message}`);
    return data;
  }

  async updateReviewStatus(id: string, status: string, feedback?: string): Promise<void> {
    const { error } = await this.supabase
      .from('module_reviews')
      .update({
        status,
        feedback,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to update review: ${error.message}`);
  }

  // Revenue operations
  async createRevenue(revenue: Omit<ModuleRevenue, 'id' | 'created_at'>): Promise<ModuleRevenue> {
    const { data, error } = await this.supabase
      .from('module_revenue')
      .insert({
        ...revenue,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create revenue: ${error.message}`);
    return data;
  }

  async getRevenueByDeveloper(developerId: string): Promise<ModuleRevenue[]> {
    const { data, error } = await this.supabase
      .from('module_revenue')
      .select('*')
      .eq('developer_id', developerId)
      .order('transaction_date', { ascending: false });

    if (error) throw new Error(`Failed to get revenue: ${error.message}`);
    return data;
  }

  async getDeveloperRevenueSummary(developerId: string): Promise<{
    totalRevenue: number;
    totalModules: number;
    monthlyRevenue: number;
    topModule?: string;
  }> {
    const { data, error } = await this.supabase
      .rpc('get_developer_revenue_summary', { developer_id_param: developerId });

    if (error) throw new Error(`Failed to get revenue summary: ${error.message}`);
    
    const result = data[0];
    return {
      totalRevenue: parseFloat(result.total_revenue) || 0,
      totalModules: result.total_modules || 0,
      monthlyRevenue: parseFloat(result.monthly_revenue) || 0,
      topModule: result.top_module
    };
  }

  // Analytics operations
  async trackEvent(event: {
    moduleId: string;
    organizationId: string;
    eventType: string;
    eventData?: any;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('module_analytics')
      .insert({
        module_id: event.moduleId,
        organization_id: event.organizationId,
        event_type: event.eventType,
        event_data: event.eventData || {},
        user_agent: event.userAgent,
        ip_address: event.ipAddress,
        created_at: new Date().toISOString()
      });

    if (error) throw new Error(`Failed to track event: ${error.message}`);
  }

  // Helper methods for data mapping
  private mapDatabaseModuleToMetadata(dbModule: any): ModuleMetadata {
    return {
      id: dbModule.id,
      name: dbModule.name,
      version: dbModule.version,
      description: dbModule.description,
      author: dbModule.author,
      category: dbModule.category,
      tags: dbModule.tags || [],
      dependencies: dbModule.dependencies || [],
      requirements: dbModule.requirements || {},
      permissions: dbModule.permissions || {},
      entryPoints: dbModule.entry_points || {},
      metadata: dbModule.metadata || {},
      createdAt: new Date(dbModule.created_at),
      updatedAt: new Date(dbModule.updated_at),
      downloads: dbModule.downloads || 0,
      rating: parseFloat(dbModule.rating) || 0,
      status: dbModule.status as ModuleStatus
    };
  }

  private mapDatabaseInstallationToInstallation(dbInstallation: any): ModuleInstallation {
    return {
      id: dbInstallation.id,
      moduleId: dbInstallation.module_id,
      version: dbInstallation.version,
      installedAt: new Date(dbInstallation.installed_at),
      status: dbInstallation.status as InstallationStatus,
      location: dbInstallation.location,
      configuration: dbInstallation.configuration || {}
    };
  }

  // Sandbox environment operations
  async createSandboxEnvironment(sandbox: {
    id: string;
    name: string;
    owner: string;
    type: 'development' | 'testing' | 'staging';
    status: 'active' | 'paused' | 'destroyed';
    createdAt: Date;
    expiresAt: Date;
    resources: any;
    modules: string[];
    data: any;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('sandbox_environments')
      .insert({
        id: sandbox.id,
        name: sandbox.name,
        owner: sandbox.owner,
        type: sandbox.type,
        status: sandbox.status,
        created_at: sandbox.createdAt.toISOString(),
        expires_at: sandbox.expiresAt.toISOString(),
        resources: sandbox.resources,
        modules: sandbox.modules,
        data: sandbox.data
      });

    if (error) throw new Error(`Failed to create sandbox environment: ${error.message}`);
  }

  async getSandboxEnvironment(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('sandbox_environments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get sandbox environment: ${error.message}`);
    return data;
  }

  async listSandboxEnvironments(owner?: string): Promise<any[]> {
    let query = this.supabase
      .from('sandbox_environments')
      .select('*')
      .neq('status', 'destroyed');

    if (owner) {
      query = query.eq('owner', owner);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to list sandbox environments: ${error.message}`);
    return data || [];
  }

  async updateSandboxEnvironment(id: string, updates: any): Promise<void> {
    const { error } = await this.supabase
      .from('sandbox_environments')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`Failed to update sandbox environment: ${error.message}`);
  }

  async destroySandboxEnvironment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sandbox_environments')
      .update({ status: 'destroyed' })
      .eq('id', id);

    if (error) throw new Error(`Failed to destroy sandbox environment: ${error.message}`);
  }

  // Migration operations
  async createMigrationLog(migration: {
    moduleId: string;
    originalLanguage: string;
    targetLanguage: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
    filesMigrated?: number;
    linesOfCode?: number;
    performanceImpact?: any;
    errors?: string[];
    warnings?: string[];
    backupPath?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('migration_logs')
      .insert({
        module_id: migration.moduleId,
        original_language: migration.originalLanguage,
        target_language: migration.targetLanguage,
        status: migration.status,
        files_migrated: migration.filesMigrated || 0,
        lines_of_code: migration.linesOfCode || 0,
        performance_impact: migration.performanceImpact,
        errors: migration.errors,
        warnings: migration.warnings,
        backup_path: migration.backupPath
      });

    if (error) throw new Error(`Failed to create migration log: ${error.message}`);
  }

  async updateMigrationLog(moduleId: string, updates: any): Promise<void> {
    const { error } = await this.supabase
      .from('migration_logs')
      .update(updates)
      .eq('module_id', moduleId);

    if (error) throw new Error(`Failed to update migration log: ${error.message}`);
  }

  async getMigrationLogs(moduleId?: string): Promise<any[]> {
    let query = this.supabase
      .from('migration_logs')
      .select('*')
      .order('migration_date', { ascending: false });

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get migration logs: ${error.message}`);
    return data || [];
  }

  async createMigrationBackup(backup: {
    moduleId: string;
    backupPath: string;
    originalLanguage: string;
    originalCodeHash: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('migration_backups')
      .insert({
        module_id: backup.moduleId,
        backup_path: backup.backupPath,
        original_language: backup.originalLanguage,
        original_code_hash: backup.originalCodeHash
      });

    if (error) throw new Error(`Failed to create migration backup: ${error.message}`);
  }

  async getMigrationBackups(moduleId?: string): Promise<any[]> {
    let query = this.supabase
      .from('migration_backups')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get migration backups: ${error.message}`);
    return data || [];
  }

  async updateMigrationBackupStatus(backupId: number, status: 'active' | 'restored' | 'deleted'): Promise<void> {
    const { error } = await this.supabase
      .from('migration_backups')
      .update({ status })
      .eq('id', backupId);

    if (error) throw new Error(`Failed to update migration backup status: ${error.message}`);
  }
}

// Export singleton instance
export const moduleRegistryDb = new ModuleRegistryDatabase(); 