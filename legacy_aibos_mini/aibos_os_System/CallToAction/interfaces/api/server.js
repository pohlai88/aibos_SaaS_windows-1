/**
 * AI-BOS OS API Server
 * Main API server for module management and system operations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const { Logger } = require('../../utils/logger');
const { ConfigManager } = require('../../utils/config-manager');
const database = require('../../utils/database');

class APIServer {
  constructor() {
    this.app = express();
    this.logger = new Logger('API-Server');
    this.config = new ConfigManager();
    this.port = process.env.PORT || 3000;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: this.config.get('CORS_ORIGIN', 'http://localhost:3000'),
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => this.logger.info(message.trim())
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../../storage/uploads')));
    this.app.use('/assets', express.static(path.join(__dirname, '../../assets')));
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'AI-BOS OS API'
      });
    });

    // Module routes
    this.app.use('/api/modules', require('./routes/modules'));
    
    // System routes
    this.app.use('/api/system', require('./routes/system'));
    
    // Upload routes
    this.app.use('/api/upload', require('./routes/upload'));

    // Task Master routes
    this.app.use('/api/tasks', require('./routes/tasks'));

    // Default route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'AI-BOS OS API Server',
        version: '1.0.0',
        status: 'running'
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      this.logger.error('API Error:', error);
      
      res.status(error.status || 500).json({
        error: 'Internal Server Error',
        message: error.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });
  }

  async start() {
    try {
      // Ensure storage directories exist
      await this.ensureDirectories();
      
      // Connect to database
      await database.connect();
      
      // Start server
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`🚀 AI-BOS OS API Server running on port ${this.port}`);
        this.logger.info(`📱 Health check: http://localhost:${this.port}/api/health`);
        this.logger.info(`🗄️ Database: Supabase connected`);
      });

    } catch (error) {
      this.logger.error('❌ Failed to start API server:', error);
      throw error;
    }
  }

  async stop() {
    if (this.server) {
      this.server.close();
      this.logger.info('🛑 API Server stopped');
    }
  }

  async ensureDirectories() {
    const directories = [
      path.join(__dirname, '../../storage'),
      path.join(__dirname, '../../storage/uploads'),
      path.join(__dirname, '../../storage/modules'),
      path.join(__dirname, '../../storage/temp')
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        this.logger.info(`📁 Created directory: ${dir}`);
      }
    }
  }
}

module.exports = APIServer; 