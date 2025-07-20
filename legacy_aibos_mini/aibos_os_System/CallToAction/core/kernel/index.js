#!/usr/bin/env node

/**
 * AI-BOS OS Kernel
 * Main entry point for the AI-BOS Operating System
 * 
 * "don't talk to me, until you need it"
 */

const { Kernel } = require('./kernel');
const { Logger } = require('../utils/logger');
const { ConfigManager } = require('../utils/config-manager');

class AIBOSKernel {
  constructor() {
    this.kernel = null;
    this.logger = new Logger('AIBOS-Kernel');
    this.config = new ConfigManager();
  }

  async initialize() {
    try {
      this.logger.info('🚀 Initializing AI-BOS OS Kernel...');
      
      // Load configuration
      await this.config.load();
      
      // Initialize kernel
      this.kernel = new Kernel({
        config: this.config,
        logger: this.logger
      });
      
      // Start kernel
      await this.kernel.start();
      
      this.logger.info('✅ AI-BOS OS Kernel initialized successfully');
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize AI-BOS OS Kernel:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    try {
      this.logger.info('🛑 Shutting down AI-BOS OS Kernel...');
      
      if (this.kernel) {
        await this.kernel.stop();
      }
      
      this.logger.info('✅ AI-BOS OS Kernel shutdown complete');
      
    } catch (error) {
      this.logger.error('❌ Error during kernel shutdown:', error);
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  const kernel = new AIBOSKernel();
  await kernel.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  const kernel = new AIBOSKernel();
  await kernel.shutdown();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('AIBOS-Kernel');
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('AIBOS-Kernel');
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the kernel if this file is run directly
if (require.main === module) {
  const kernel = new AIBOSKernel();
  kernel.initialize();
}

module.exports = AIBOSKernel; 