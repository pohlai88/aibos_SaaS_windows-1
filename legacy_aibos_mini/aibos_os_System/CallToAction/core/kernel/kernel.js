/**
 * AI-BOS OS Kernel
 * Core system management and coordination
 */

const { EventEmitter } = require('events');
const { ModuleManager } = require('./module-manager');
const { ProcessManager } = require('../process/process-manager');
const { MemoryManager } = require('../memory/memory-manager');
const { Scheduler } = require('../scheduler/scheduler');
const { FileSystem } = require('../file-system/file-system');

class Kernel extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = options.config;
    this.logger = options.logger;
    
    // Core components
    this.moduleManager = null;
    this.processManager = null;
    this.memoryManager = null;
    this.scheduler = null;
    this.fileSystem = null;
    
    // System state
    this.isRunning = false;
    this.startTime = null;
    this.systemInfo = {};
    
    this.logger.info('🔧 Kernel instance created');
  }

  async start() {
    try {
      this.logger.info('🚀 Starting AI-BOS OS Kernel...');
      
      // Initialize core components
      await this.initializeComponents();
      
      // Start core services
      await this.startServices();
      
      // Load system modules
      await this.loadSystemModules();
      
      // Mark as running
      this.isRunning = true;
      this.startTime = Date.now();
      
      this.logger.info('✅ AI-BOS OS Kernel started successfully');
      this.emit('started');
      
    } catch (error) {
      this.logger.error('❌ Failed to start kernel:', error);
      throw error;
    }
  }

  async stop() {
    try {
      this.logger.info('🛑 Stopping AI-BOS OS Kernel...');
      
      // Stop all services
      await this.stopServices();
      
      // Unload modules
      await this.unloadModules();
      
      // Mark as stopped
      this.isRunning = false;
      
      this.logger.info('✅ AI-BOS OS Kernel stopped');
      this.emit('stopped');
      
    } catch (error) {
      this.logger.error('❌ Error stopping kernel:', error);
      throw error;
    }
  }

  async initializeComponents() {
    this.logger.info('🔧 Initializing core components...');
    
    // Initialize file system
    this.fileSystem = new FileSystem({
      config: this.config,
      logger: this.logger
    });
    await this.fileSystem.initialize();
    
    // Initialize memory manager
    this.memoryManager = new MemoryManager({
      config: this.config,
      logger: this.logger
    });
    await this.memoryManager.initialize();
    
    // Initialize process manager
    this.processManager = new ProcessManager({
      config: this.config,
      logger: this.logger,
      memoryManager: this.memoryManager
    });
    await this.processManager.initialize();
    
    // Initialize scheduler
    this.scheduler = new Scheduler({
      config: this.config,
      logger: this.logger,
      processManager: this.processManager
    });
    await this.scheduler.initialize();
    
    // Initialize module manager
    this.moduleManager = new ModuleManager({
      config: this.config,
      logger: this.logger,
      kernel: this
    });
    await this.moduleManager.initialize();
    
    this.logger.info('✅ Core components initialized');
  }

  async startServices() {
    this.logger.info('🚀 Starting core services...');
    
    // Start scheduler
    await this.scheduler.start();
    
    // Start process manager
    await this.processManager.start();
    
    // Start memory manager
    await this.memoryManager.start();
    
    this.logger.info('✅ Core services started');
  }

  async stopServices() {
    this.logger.info('🛑 Stopping core services...');
    
    // Stop in reverse order
    if (this.memoryManager) {
      await this.memoryManager.stop();
    }
    
    if (this.processManager) {
      await this.processManager.stop();
    }
    
    if (this.scheduler) {
      await this.scheduler.stop();
    }
    
    this.logger.info('✅ Core services stopped');
  }

  async loadSystemModules() {
    this.logger.info('📦 Loading system modules...');
    
    // Load core modules
    const coreModules = [
      'ai-engine',
      'business-logic',
      'user-interface',
      'data-management'
    ];
    
    for (const moduleName of coreModules) {
      try {
        await this.moduleManager.loadModule(moduleName);
        this.logger.info(`✅ Loaded module: ${moduleName}`);
      } catch (error) {
        this.logger.error(`❌ Failed to load module ${moduleName}:`, error);
      }
    }
    
    this.logger.info('✅ System modules loaded');
  }

  async unloadModules() {
    this.logger.info('📦 Unloading modules...');
    
    if (this.moduleManager) {
      await this.moduleManager.unloadAll();
    }
    
    this.logger.info('✅ Modules unloaded');
  }

  // System information
  getSystemInfo() {
    return {
      isRunning: this.isRunning,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      memory: this.memoryManager ? this.memoryManager.getStats() : null,
      processes: this.processManager ? this.processManager.getStats() : null,
      modules: this.moduleManager ? this.moduleManager.getLoadedModules() : []
    };
  }

  // Health check
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      components: {}
    };
    
    // Check each component
    if (this.memoryManager) {
      health.components.memory = await this.memoryManager.healthCheck();
    }
    
    if (this.processManager) {
      health.components.processes = await this.processManager.healthCheck();
    }
    
    if (this.scheduler) {
      health.components.scheduler = await this.scheduler.healthCheck();
    }
    
    if (this.fileSystem) {
      health.components.fileSystem = await this.fileSystem.healthCheck();
    }
    
    // Determine overall status
    const componentStatuses = Object.values(health.components);
    if (componentStatuses.some(status => status.status === 'error')) {
      health.status = 'unhealthy';
    } else if (componentStatuses.some(status => status.status === 'warning')) {
      health.status = 'degraded';
    }
    
    return health;
  }
}

module.exports = { Kernel }; 