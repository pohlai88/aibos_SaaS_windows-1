/**
 * AI-BOS Module Registry
 * 
 * This package manages the module ecosystem for AI-BOS OS.
 * It handles module discovery, validation, installation, and lifecycle management.
 */

export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: ModuleCategory;
  tags: string[];
  dependencies: string[];
  requirements: ModuleRequirements;
  permissions: ModulePermissions;
  entryPoints: ModuleEntryPoints;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  rating: number;
  status: ModuleStatus;
}

export interface ModuleRequirements {
  nodeVersion: string;
  typescriptVersion: string;
  aiBosVersion: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

export interface ModulePermissions {
  fileSystem: string[];
  network: string[];
  database: string[];
  api: string[];
}

export interface ModuleEntryPoints {
  main: string;
  types?: string;
  exports?: Record<string, string>;
  bin?: Record<string, string>;
}

export interface ModuleInstallation {
  id: string;
  moduleId: string;
  version: string;
  installedAt: Date;
  status: InstallationStatus;
  location: string;
  configuration: Record<string, any>;
}

export enum ModuleCategory {
  ACCOUNTING = 'accounting',
  CRM = 'crm',
  HR = 'hr',
  WORKFLOW = 'workflow',
  PROCUREMENT = 'procurement',
  TAX = 'tax',
  REPORTING = 'reporting',
  INTEGRATION = 'integration',
  UTILITY = 'utility',
  CUSTOM = 'custom'
}

export enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  SUSPENDED = 'suspended'
}

export enum InstallationStatus {
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  FAILED = 'failed',
  UPDATING = 'updating',
  UNINSTALLING = 'uninstalling'
}

import { moduleIntegration } from './integration';
import { aibosRuleEngine } from './ssot-architecture';

export class ModuleRegistry {
  private modules: Map<string, ModuleMetadata> = new Map();
  private installations: Map<string, ModuleInstallation> = new Map();

  /**
   * Register a new module
   */
  async registerModule(metadata: ModuleMetadata): Promise<void> {
    // Validate module metadata
    this.validateModuleMetadata(metadata);
    
    // Check for conflicts
    if (this.modules.has(metadata.id)) {
      throw new Error(`Module ${metadata.id} already exists`);
    }
    
    // Store module
    this.modules.set(metadata.id, metadata);
    
    console.log(`✅ Module ${metadata.name} registered successfully`);
  }

  /**
   * Install a module
   */
  async installModule(moduleId: string, version: string, config?: Record<string, any>): Promise<ModuleInstallation> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Check dependencies first
    await this.checkModuleDependencies(module);

    // Check requirements
    await this.checkRequirements(module.requirements);
    
    // Create installation record
    const installation: ModuleInstallation = {
      id: `${moduleId}-${Date.now()}`,
      moduleId,
      version,
      installedAt: new Date(),
      status: InstallationStatus.INSTALLING,
      location: `./packages/${moduleId}`,
      configuration: config || {}
    };

    try {
      // Download and install module
      await this.downloadModule(module, version);
      await this.validateModule(module, version);
      await this.installDependencies(module.requirements.dependencies);
      await this.updateWorkspaceConfig(module);
      
      // Set up module integrations
      await this.setupModuleIntegrations(module);
      
      // Migrate data from dependencies
      await moduleIntegration.migrateDataForNewModule(module.id, module.dependencies);
      
      installation.status = InstallationStatus.INSTALLED;
      this.installations.set(installation.id, installation);
      
      console.log(`✅ Module ${module.name} installed successfully`);
      return installation;
    } catch (error) {
      installation.status = InstallationStatus.FAILED;
      this.installations.set(installation.id, installation);
      throw error;
    }
  }

  /**
   * Uninstall a module
   */
  async uninstallModule(installationId: string): Promise<void> {
    const installation = this.installations.get(installationId);
    if (!installation) {
      throw new Error(`Installation ${installationId} not found`);
    }

    installation.status = InstallationStatus.UNINSTALLING;
    
    try {
      // Remove module files
      await this.removeModuleFiles(installation.location);
      await this.updateWorkspaceConfig(installation.moduleId, true);
      
      this.installations.delete(installationId);
      console.log(`✅ Module ${installation.moduleId} uninstalled successfully`);
    } catch (error) {
      installation.status = InstallationStatus.INSTALLED;
      throw error;
    }
  }

  /**
   * List available modules
   */
  getAvailableModules(category?: ModuleCategory): ModuleMetadata[] {
    const modules = Array.from(this.modules.values());
    if (category) {
      return modules.filter(m => m.category === category);
    }
    return modules;
  }

  /**
   * List installed modules
   */
  getInstalledModules(): ModuleInstallation[] {
    return Array.from(this.installations.values())
      .filter(i => i.status === InstallationStatus.INSTALLED);
  }

  /**
   * Search modules
   */
  searchModules(query: string): ModuleMetadata[] {
    const modules = Array.from(this.modules.values());
    return modules.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase()) ||
      m.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  /**
   * Validate module metadata
   */
  private validateModuleMetadata(metadata: ModuleMetadata): void {
    // Check required fields
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error('Module must have id, name, and version');
    }

    // Validate ID format (must be kebab-case)
    if (!/^[a-z0-9-]+$/.test(metadata.id)) {
      throw new Error('Module ID must be kebab-case (lowercase, numbers, hyphens only)');
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      throw new Error('Version must be in semver format (x.y.z)');
    }

    // Check for forbidden exports
    this.checkForbiddenExports(metadata);
  }

  /**
   * Check for forbidden exports (no Export, export_to, ExportTo)
   */
  private checkForbiddenExports(metadata: ModuleMetadata): void {
    const forbiddenExports = ['Export', 'export_to', 'ExportTo'];
    
    if (metadata.entryPoints.exports) {
      for (const [key, value] of Object.entries(metadata.entryPoints.exports)) {
        if (forbiddenExports.some(forbidden => key.includes(forbidden))) {
          throw new Error(`Forbidden export found: ${key}. Use proper naming conventions.`);
        }
      }
    }
  }



  /**
   * Check module dependencies
   */
  private async checkModuleDependencies(module: ModuleMetadata): Promise<void> {
    for (const dependency of module.dependencies) {
      const isInstalled = this.getInstalledModules().some(
        installation => installation.moduleId === dependency
      );
      
      if (!isInstalled) {
        throw new Error(`Module ${module.name} requires ${dependency} to be installed first`);
      }
    }
  }

  /**
   * Set up module integrations
   */
  private async setupModuleIntegrations(module: ModuleMetadata): Promise<void> {
    for (const dependency of module.dependencies) {
      // Set up integration between dependency and new module
      await moduleIntegration.setupIntegration(dependency, module.id, {
        eventTypes: this.getDefaultEventTypes(module.category),
        dataAccess: this.getDefaultDataAccess(module.category, dependency)
      });
    }

    // Set up integration triggers
    await moduleIntegration.setupIntegrationTriggers(module.id);
  }

  /**
   * Get default event types for module category
   */
  private getDefaultEventTypes(category: ModuleCategory): string[] {
    const eventTypes: Record<ModuleCategory, string[]> = {
      [ModuleCategory.ACCOUNTING]: ['journal_entry_created', 'chart_of_accounts_updated'],
      [ModuleCategory.CRM]: ['customer_created', 'lead_updated'],
      [ModuleCategory.HR]: ['employee_created', 'payroll_processed'],
      [ModuleCategory.WORKFLOW]: ['workflow_started', 'workflow_completed'],
      [ModuleCategory.PROCUREMENT]: ['purchase_order_created', 'invoice_received'],
      [ModuleCategory.TAX]: ['tax_calculation_completed', 'tax_filing_submitted'],
      [ModuleCategory.REPORTING]: ['report_generated', 'data_exported'],
      [ModuleCategory.INTEGRATION]: ['data_synced', 'webhook_received'],
      [ModuleCategory.UTILITY]: ['backup_completed', 'maintenance_performed'],
      [ModuleCategory.CUSTOM]: []
    };

    return eventTypes[category] || [];
  }

  /**
   * Get default data access for module category
   */
  private getDefaultDataAccess(category: ModuleCategory, dependency: string): {
    read: string[];
    write: string[];
  } {
    const dataAccess: Record<ModuleCategory, { read: string[]; write: string[] }> = {
      [ModuleCategory.ACCOUNTING]: {
        read: ['chart_of_accounts', 'journal_entries', 'account_balances'],
        write: ['financial_reports', 'trial_balance']
      },
      [ModuleCategory.CRM]: {
        read: ['customers', 'leads', 'opportunities'],
        write: ['analytics', 'reports']
      },
      [ModuleCategory.HR]: {
        read: ['employees', 'payroll', 'attendance'],
        write: ['reports', 'analytics']
      },
      [ModuleCategory.WORKFLOW]: {
        read: ['workflows', 'tasks', 'approvals'],
        write: ['workflow_executions', 'notifications']
      },
      [ModuleCategory.PROCUREMENT]: {
        read: ['purchase_orders', 'invoices', 'vendors'],
        write: ['reports', 'analytics']
      },
      [ModuleCategory.TAX]: {
        read: ['tax_calculations', 'tax_filings'],
        write: ['tax_reports', 'compliance_documents']
      },
      [ModuleCategory.REPORTING]: {
        read: ['*'], // Can read from all modules
        write: ['reports', 'exports']
      },
      [ModuleCategory.INTEGRATION]: {
        read: ['*'],
        write: ['sync_logs', 'webhook_data']
      },
      [ModuleCategory.UTILITY]: {
        read: ['*'],
        write: ['logs', 'backups']
      },
      [ModuleCategory.CUSTOM]: {
        read: [],
        write: []
      }
    };

    return dataAccess[category] || { read: [], write: [] };
  }

  /**
   * Check module requirements
   */
  private async checkRequirements(requirements: ModuleRequirements): Promise<void> {
    // Check Node.js version
    const nodeVersion = process.version;
    if (!this.satisfiesVersion(nodeVersion, requirements.nodeVersion)) {
      throw new Error(`Node.js version ${requirements.nodeVersion} required, got ${nodeVersion}`);
    }

    // Check TypeScript version
    // This would need to be implemented based on your TypeScript setup
    
    // Check AI-BOS version
    // This would check against your saas-os.json version
  }

  /**
   * Download module
   */
  private async downloadModule(module: ModuleMetadata, version: string): Promise<void> {
    // This would implement actual module downloading
    // For now, we'll simulate it
    console.log(`📥 Downloading ${module.name} v${version}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Validate downloaded module
   */
  private async validateModule(module: ModuleMetadata, version: string): Promise<void> {
    // Validate module structure
    // Check for required files (package.json, tsconfig.json, etc.)
    // Validate against AI-BOS OS requirements
    console.log(`🔍 Validating ${module.name}...`);
    
    // Validate against AI-BOS SSOT standards
    const validation = await aibosRuleEngine.validateModule(`./packages/${module.id}`);
    if (!validation.valid) {
      throw new Error(`Module validation failed: ${validation.errors?.join(', ')}`);
    }
    
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn(`⚠️ Module warnings: ${validation.warnings.join(', ')}`);
    }
  }

  /**
   * Install module dependencies
   */
  private async installDependencies(dependencies: Record<string, string>): Promise<void> {
    // Install dependencies using pnpm
    console.log(`📦 Installing dependencies...`);
  }

  /**
   * Update workspace configuration
   */
  private async updateWorkspaceConfig(module: ModuleMetadata, remove = false): Promise<void> {
    // Update pnpm-workspace.yaml, package.json, etc.
    console.log(`${remove ? '🗑️' : '⚙️'} Updating workspace config...`);
  }

  /**
   * Remove module files
   */
  private async removeModuleFiles(location: string): Promise<void> {
    // Remove module files from filesystem
    console.log(`🗑️ Removing module files from ${location}...`);
  }

  /**
   * Check if version satisfies requirement
   */
  private satisfiesVersion(current: string, required: string): boolean {
    // Simple version comparison - you might want to use semver library
    return current >= required;
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();

// Export types
export type {
  ModuleMetadata,
  ModuleRequirements,
  ModulePermissions,
  ModuleEntryPoints,
  ModuleInstallation
}; 