/**
 * AI-BOS OS Configuration Manager
 * Centralized configuration management
 */

const fs = require('fs').promises;
const path = require('path');

class ConfigManager {
  constructor() {
    this.config = {};
    this.configPath = path.join(process.cwd(), 'config.env');
    this.defaultConfig = {
      // Server Configuration
      PORT: 3000,
      HOST: 'localhost',
      NODE_ENV: 'development',
      
      // Database Configuration
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'ai_bos_os',
      DB_USER: 'ai_bos_user',
      DB_PASSWORD: '',
      
      // Redis Configuration
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: '',
      
      // Authentication
      JWT_SECRET: 'your_jwt_secret_key_here',
      JWT_EXPIRES_IN: '24h',
      SESSION_SECRET: 'your_session_secret_here',
      
      // AI Services
      OPENAI_API_KEY: '',
      ANTHROPIC_API_KEY: '',
      GOOGLE_AI_API_KEY: '',
      
      // External Services
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: 587,
      SMTP_USER: '',
      SMTP_PASS: '',
      
      // File Storage
      STORAGE_TYPE: 'local',
      STORAGE_PATH: './storage',
      S3_BUCKET: 'ai-bos-storage',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY: '',
      S3_SECRET_KEY: '',
      
      // Monitoring
      LOG_LEVEL: 'info',
      SENTRY_DSN: '',
      NEW_RELIC_LICENSE_KEY: '',
      
      // Security
      CORS_ORIGIN: 'http://localhost:3000',
      RATE_LIMIT_WINDOW: '15m',
      RATE_LIMIT_MAX: 100,
      
      // Development
      DEBUG: true,
      HOT_RELOAD: true,
      ENABLE_SWAGGER: true
    };
  }

  async load() {
    try {
      // Load from environment variables first
      this.loadFromEnv();
      
      // Load from config file if it exists
      await this.loadFromFile();
      
      // Validate configuration
      this.validate();
      
      console.log('✅ Configuration loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
      throw error;
    }
  }

  loadFromEnv() {
    // Load all environment variables
    for (const key in this.defaultConfig) {
      if (process.env[key] !== undefined) {
        this.config[key] = this.parseValue(process.env[key]);
      }
    }
  }

  async loadFromFile() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      const lines = configContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (trimmedLine.startsWith('#') || trimmedLine === '') {
          continue;
        }
        
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          this.config[key.trim()] = this.parseValue(value);
        }
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 No config file found, using defaults');
      } else {
        throw error;
      }
    }
  }

  parseValue(value) {
    // Remove quotes if present
    const trimmed = value.replace(/^["']|["']$/g, '');
    
    // Parse boolean values
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    
    // Parse numeric values
    if (!isNaN(trimmed) && trimmed !== '') {
      return Number(trimmed);
    }
    
    // Return as string
    return trimmed;
  }

  validate() {
    const required = [
      'JWT_SECRET',
      'SESSION_SECRET'
    ];
    
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    // Validate numeric values
    const numericConfigs = ['PORT', 'DB_PORT', 'REDIS_PORT', 'SMTP_PORT'];
    for (const key of numericConfigs) {
      if (this.config[key] && isNaN(this.config[key])) {
        throw new Error(`Invalid numeric value for ${key}: ${this.config[key]}`);
      }
    }
  }

  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  set(key, value) {
    this.config[key] = value;
  }

  has(key) {
    return this.config.hasOwnProperty(key);
  }

  getAll() {
    return { ...this.config };
  }

  getSection(prefix) {
    const section = {};
    for (const [key, value] of Object.entries(this.config)) {
      if (key.startsWith(prefix)) {
        section[key] = value;
      }
    }
    return section;
  }

  // Convenience methods for common configs
  getServerConfig() {
    return {
      port: this.get('PORT'),
      host: this.get('HOST'),
      nodeEnv: this.get('NODE_ENV')
    };
  }

  getDatabaseConfig() {
    return {
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      name: this.get('DB_NAME'),
      user: this.get('DB_USER'),
      password: this.get('DB_PASSWORD')
    };
  }

  getRedisConfig() {
    return {
      host: this.get('REDIS_HOST'),
      port: this.get('REDIS_PORT'),
      password: this.get('REDIS_PASSWORD')
    };
  }

  getAuthConfig() {
    return {
      jwtSecret: this.get('JWT_SECRET'),
      jwtExpiresIn: this.get('JWT_EXPIRES_IN'),
      sessionSecret: this.get('SESSION_SECRET')
    };
  }

  getAIConfig() {
    return {
      openaiApiKey: this.get('OPENAI_API_KEY'),
      anthropicApiKey: this.get('ANTHROPIC_API_KEY'),
      googleAiApiKey: this.get('GOOGLE_AI_API_KEY')
    };
  }

  getStorageConfig() {
    return {
      type: this.get('STORAGE_TYPE'),
      path: this.get('STORAGE_PATH'),
      s3: {
        bucket: this.get('S3_BUCKET'),
        region: this.get('S3_REGION'),
        accessKey: this.get('S3_ACCESS_KEY'),
        secretKey: this.get('S3_SECRET_KEY')
      }
    };
  }

  getSecurityConfig() {
    return {
      corsOrigin: this.get('CORS_ORIGIN'),
      rateLimitWindow: this.get('RATE_LIMIT_WINDOW'),
      rateLimitMax: this.get('RATE_LIMIT_MAX')
    };
  }

  getDevelopmentConfig() {
    return {
      debug: this.get('DEBUG'),
      hotReload: this.get('HOT_RELOAD'),
      enableSwagger: this.get('ENABLE_SWAGGER')
    };
  }

  // Export configuration for other modules
  export() {
    return {
      server: this.getServerConfig(),
      database: this.getDatabaseConfig(),
      redis: this.getRedisConfig(),
      auth: this.getAuthConfig(),
      ai: this.getAIConfig(),
      storage: this.getStorageConfig(),
      security: this.getSecurityConfig(),
      development: this.getDevelopmentConfig()
    };
  }
}

module.exports = { ConfigManager }; 