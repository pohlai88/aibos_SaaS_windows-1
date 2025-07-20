/**
 * AI-BOS Module Integration System
 * 
 * Handles data flow, events, and communication between modules
 */

import { moduleRegistryDb } from './database';

export interface ModuleEvent {
  id: string;
  type: string;
  sourceModule: string;
  targetModule?: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModuleIntegration {
  id: string;
  sourceModule: string;
  targetModule: string;
  eventTypes: string[];
  dataAccess: {
    read: string[];
    write: string[];
  };
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  config: Record<string, any>;
}

export interface CrossModuleDataRequest {
  sourceModule: string;
  targetModule: string;
  table: string;
  action: 'read' | 'write' | 'delete';
  data?: any;
  filters?: Record<string, any>;
}

export class ModuleIntegrationSystem {
  private eventListeners: Map<string, Function[]> = new Map();
  private integrations: Map<string, ModuleIntegration> = new Map();
  private eventQueue: ModuleEvent[] = [];

  /**
   * Register an event listener for a module
   */
  async registerEventListener(
    moduleId: string,
    eventType: string,
    handler: Function
  ): Promise<void> {
    const key = `${moduleId}:${eventType}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    this.eventListeners.get(key)!.push(handler);
    
    console.log(`📡 Registered event listener: ${moduleId} -> ${eventType}`);
  }

  /**
   * Trigger an event across modules
   */
  async triggerEvent(
    sourceModule: string,
    eventType: string,
    data: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const event: ModuleEvent = {
      id: `${sourceModule}-${eventType}-${Date.now()}`,
      type: eventType,
      sourceModule,
      data,
      timestamp: new Date(),
      priority
    };

    // Add to queue
    this.eventQueue.push(event);

    // Process event
    await this.processEvent(event);
  }

  /**
   * Process an event and notify listeners
   */
  private async processEvent(event: ModuleEvent): Promise<void> {
    try {
      // Find all listeners for this event type
      const listeners: Function[] = [];
      
      for (const [key, handlers] of this.eventListeners.entries()) {
        const [moduleId, eventType] = key.split(':');
        if (eventType === event.type && moduleId !== event.sourceModule) {
          listeners.push(...handlers);
        }
      }

      // Execute all listeners
      const promises = listeners.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler: ${error}`);
          // Log error but don't fail the entire event
        }
      });

      await Promise.all(promises);

      // Log event processing
      console.log(`📡 Processed event: ${event.type} from ${event.sourceModule} to ${listeners.length} listeners`);

    } catch (error) {
      console.error(`Error processing event: ${error}`);
      throw error;
    }
  }

  /**
   * Set up integration between two modules
   */
  async setupIntegration(
    sourceModule: string,
    targetModule: string,
    config: {
      eventTypes: string[];
      dataAccess: {
        read: string[];
        write: string[];
      };
      config?: Record<string, any>;
    }
  ): Promise<ModuleIntegration> {
    const integration: ModuleIntegration = {
      id: `${sourceModule}-${targetModule}`,
      sourceModule,
      targetModule,
      eventTypes: config.eventTypes,
      dataAccess: config.dataAccess,
      status: 'active',
      lastSync: new Date(),
      config: config.config || {}
    };

    this.integrations.set(integration.id, integration);

    // Save to database
    await moduleRegistryDb.createModuleIntegration(integration);

    console.log(`🔗 Set up integration: ${sourceModule} ↔ ${targetModule}`);
    return integration;
  }

  /**
   * Get data from another module
   */
  async getDataFromModule(
    sourceModule: string,
    targetModule: string,
    table: string,
    filters?: Record<string, any>
  ): Promise<any> {
    // Check if integration exists
    const integrationId = `${targetModule}-${sourceModule}`;
    const integration = this.integrations.get(integrationId);

    if (!integration) {
      throw new Error(`No integration found between ${targetModule} and ${sourceModule}`);
    }

    // Check if source module has read permission
    if (!integration.dataAccess.read.includes(table)) {
      throw new Error(`Module ${sourceModule} does not have read permission for ${table} in ${targetModule}`);
    }

    // Get data from target module
    const data = await moduleRegistryDb.getModuleData(targetModule, table, filters);
    return data;
  }

  /**
   * Send data to another module
   */
  async sendDataToModule(
    sourceModule: string,
    targetModule: string,
    table: string,
    data: any
  ): Promise<void> {
    // Check if integration exists
    const integrationId = `${sourceModule}-${targetModule}`;
    const integration = this.integrations.get(integrationId);

    if (!integration) {
      throw new Error(`No integration found between ${sourceModule} and ${targetModule}`);
    }

    // Check if source module has write permission
    if (!integration.dataAccess.write.includes(table)) {
      throw new Error(`Module ${sourceModule} does not have write permission for ${table} in ${targetModule}`);
    }

    // Send data to target module
    await moduleRegistryDb.setModuleData(targetModule, table, data);

    // Update last sync
    integration.lastSync = new Date();
    await moduleRegistryDb.updateModuleIntegration(integration.id, integration);
  }

  /**
   * Check if a module has permission to access data
   */
  async checkModulePermission(
    sourceModule: string,
    targetModule: string,
    action: 'read' | 'write',
    table: string
  ): Promise<boolean> {
    const integrationId = `${sourceModule}-${targetModule}`;
    const integration = this.integrations.get(integrationId);

    if (!integration) {
      return false;
    }

    const allowedTables = integration.dataAccess[action];
    return allowedTables.includes(table);
  }

  /**
   * Get all integrations for a module
   */
  async getModuleIntegrations(moduleId: string): Promise<ModuleIntegration[]> {
    const integrations: ModuleIntegration[] = [];
    
    for (const integration of this.integrations.values()) {
      if (integration.sourceModule === moduleId || integration.targetModule === moduleId) {
        integrations.push(integration);
      }
    }

    return integrations;
  }

  /**
   * Migrate data when a new module is installed
   */
  async migrateDataForNewModule(
    newModule: string,
    dependencies: string[]
  ): Promise<void> {
    console.log(`🔄 Migrating data for new module: ${newModule}`);

    for (const dependency of dependencies) {
      // Check if dependency is installed
      const isInstalled = await moduleRegistryDb.isModuleInstalled(dependency);
      if (!isInstalled) {
        console.warn(`⚠️ Dependency ${dependency} not installed, skipping migration`);
        continue;
      }

      // Get integration config
      const integrationConfig = await this.getIntegrationConfig(newModule, dependency);
      if (!integrationConfig) {
        console.warn(`⚠️ No integration config found for ${newModule} -> ${dependency}`);
        continue;
      }

      // Migrate data based on config
      await this.migrateData(newModule, dependency, integrationConfig);
    }

    console.log(`✅ Data migration completed for ${newModule}`);
  }

  /**
   * Get integration configuration for two modules
   */
  private async getIntegrationConfig(
    sourceModule: string,
    targetModule: string
  ): Promise<any> {
    // This would load from module configuration files
    // For now, return a default config
    return {
      tables: {
        'chart_of_accounts': {
          migrate: true,
          transform: (data: any) => data // No transformation needed
        },
        'journal_entries': {
          migrate: true,
          transform: (data: any) => data
        }
      }
    };
  }

  /**
   * Migrate data from one module to another
   */
  private async migrateData(
    sourceModule: string,
    targetModule: string,
    config: any
  ): Promise<void> {
    for (const [table, tableConfig] of Object.entries(config.tables)) {
      if (tableConfig.migrate) {
        try {
          // Get data from source module
          const sourceData = await moduleRegistryDb.getModuleData(sourceModule, table);
          
          // Transform data if needed
          const transformedData = tableConfig.transform ? 
            tableConfig.transform(sourceData) : sourceData;

          // Save to target module
          await moduleRegistryDb.setModuleData(targetModule, table, transformedData);

          console.log(`📦 Migrated ${sourceData.length} records from ${sourceModule}.${table} to ${targetModule}.${table}`);
        } catch (error) {
          console.error(`❌ Failed to migrate ${table}: ${error}`);
        }
      }
    }
  }

  /**
   * Set up integration triggers for a module
   */
  async setupIntegrationTriggers(moduleId: string): Promise<void> {
    const integrations = await this.getModuleIntegrations(moduleId);

    for (const integration of integrations) {
      // Set up database triggers for real-time sync
      await this.setupDatabaseTriggers(integration);
      
      // Set up event listeners
      await this.setupEventListeners(integration);
    }

    console.log(`🔧 Set up integration triggers for ${moduleId}`);
  }

  /**
   * Set up database triggers for real-time synchronization
   */
  private async setupDatabaseTriggers(integration: ModuleIntegration): Promise<void> {
    // This would create database triggers for real-time data sync
    // For now, just log the setup
    console.log(`🔧 Setting up database triggers for ${integration.sourceModule} ↔ ${integration.targetModule}`);
  }

  /**
   * Set up event listeners for an integration
   */
  private async setupEventListeners(integration: ModuleIntegration): Promise<void> {
    for (const eventType of integration.eventTypes) {
      // Register listener for target module
      await this.registerEventListener(
        integration.targetModule,
        eventType,
        async (event: ModuleEvent) => {
          // Handle the event based on integration config
          await this.handleIntegrationEvent(integration, event);
        }
      );
    }
  }

  /**
   * Handle an integration event
   */
  private async handleIntegrationEvent(
    integration: ModuleIntegration,
    event: ModuleEvent
  ): Promise<void> {
    try {
      // Process event based on integration configuration
      const handler = this.getEventHandler(integration, event.type);
      if (handler) {
        await handler(event.data);
      }

      // Update last sync
      integration.lastSync = new Date();
      await moduleRegistryDb.updateModuleIntegration(integration.id, integration);

    } catch (error) {
      console.error(`❌ Error handling integration event: ${error}`);
      integration.status = 'error';
      await moduleRegistryDb.updateModuleIntegration(integration.id, integration);
    }
  }

  /**
   * Get event handler for an integration
   */
  private getEventHandler(integration: ModuleIntegration, eventType: string): Function | null {
    // This would return the appropriate handler based on integration config
    // For now, return a default handler
    const handlers: Record<string, Function> = {
      'journal_entry_created': async (data: any) => {
        // Update trial balance
        await this.updateTrialBalance(data);
      },
      'chart_of_accounts_updated': async (data: any) => {
        // Refresh account structure
        await this.refreshAccountStructure(data);
      }
    };

    return handlers[eventType] || null;
  }

  /**
   * Update trial balance (example handler)
   */
  private async updateTrialBalance(data: any): Promise<void> {
    console.log(`📊 Updating trial balance with journal entry: ${data.id}`);
    // Implementation would update trial balance based on journal entry
  }

  /**
   * Refresh account structure (example handler)
   */
  private async refreshAccountStructure(data: any): Promise<void> {
    console.log(`🔄 Refreshing account structure: ${data.id}`);
    // Implementation would refresh account structure
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    errorIntegrations: number;
    lastSync: Date;
  }> {
    const integrations = Array.from(this.integrations.values());
    
    return {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.status === 'active').length,
      errorIntegrations: integrations.filter(i => i.status === 'error').length,
      lastSync: new Date(Math.max(...integrations.map(i => i.lastSync.getTime())))
    };
  }
}

// Export singleton instance
export const moduleIntegration = new ModuleIntegrationSystem(); 