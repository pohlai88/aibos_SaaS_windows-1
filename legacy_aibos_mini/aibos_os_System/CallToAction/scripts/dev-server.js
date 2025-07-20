#!/usr/bin/env node

/**
 * AI-BOS OS Development Server
 * Starts the development environment with hot reload
 */

const { spawn } = require('child_process');
const { Logger } = require('../utils/logger');
const { ConfigManager } = require('../utils/config-manager');

class DevServer {
  constructor() {
    this.logger = new Logger('Dev-Server');
    this.config = new ConfigManager();
    this.processes = [];
  }

  async start() {
    try {
      this.logger.info('🚀 Starting AI-BOS OS Development Server...');
      
      // Load configuration
      await this.config.load();
      
      // Start the kernel
      await this.startKernel();
      
      // Start additional development services
      await this.startDevServices();
      
      this.logger.info('✅ Development server started successfully');
      this.logger.info('📱 Access the system at: http://localhost:3000');
      
    } catch (error) {
      this.logger.error('❌ Failed to start development server:', error);
      process.exit(1);
    }
  }

  async startKernel() {
    this.logger.info('🔧 Starting AI-BOS OS Kernel...');
    
    const kernelProcess = spawn('node', ['core/kernel/index.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug'
      }
    });
    
    kernelProcess.on('error', (error) => {
      this.logger.error('❌ Kernel process error:', error);
    });
    
    kernelProcess.on('close', (code) => {
      this.logger.info(`🛑 Kernel process exited with code ${code}`);
    });
    
    this.processes.push(kernelProcess);
  }

  async startDevServices() {
    this.logger.info('🔧 Starting development services...');
    
    // Start file watcher for hot reload
    await this.startFileWatcher();
    
    // Start development API server
    await this.startDevAPI();
    
    this.logger.info('✅ Development services started');
  }

  async startFileWatcher() {
    this.logger.info('👀 Starting file watcher...');
    
    const watcherProcess = spawn('npx', ['nodemon', '--watch', '.', '--ext', 'js,json', 'core/kernel/index.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });
    
    watcherProcess.on('error', (error) => {
      this.logger.error('❌ File watcher error:', error);
    });
    
    this.processes.push(watcherProcess);
  }

  async startDevAPI() {
    this.logger.info('🌐 Starting development API server...');
    
    const apiProcess = spawn('node', ['interfaces/api/dev-server.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: 3001
      }
    });
    
    apiProcess.on('error', (error) => {
      this.logger.error('❌ API server error:', error);
    });
    
    this.processes.push(apiProcess);
  }

  async stop() {
    this.logger.info('🛑 Stopping development server...');
    
    // Stop all processes
    for (const process of this.processes) {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    }
    
    this.logger.info('✅ Development server stopped');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  const server = new DevServer();
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  const server = new DevServer();
  await server.stop();
  process.exit(0);
});

// Start the development server if this file is run directly
if (require.main === module) {
  const server = new DevServer();
  server.start();
}

module.exports = DevServer; 