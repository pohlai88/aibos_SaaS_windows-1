/**
 * AI-BOS OS Logger
 * Centralized logging system
 */

const { EventEmitter } = require('events');

class Logger extends EventEmitter {
  constructor(name = 'AIBOS') {
    super();
    
    this.name = name;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[35m', // Magenta
      trace: '\x1b[37m', // White
      reset: '\x1b[0m'   // Reset
    };
  }

  _shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || this.colors.reset;
    const reset = this.colors.reset;
    
    let formatted = `${color}[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}${reset}`;
    
    if (data) {
      if (typeof data === 'object') {
        formatted += `\n${color}${JSON.stringify(data, null, 2)}${reset}`;
      } else {
        formatted += ` ${data}`;
      }
    }
    
    return formatted;
  }

  _log(level, message, data = null) {
    if (!this._shouldLog(level)) {
      return;
    }
    
    const formattedMessage = this._formatMessage(level, message, data);
    
    // Emit log event
    this.emit('log', {
      level,
      message,
      data,
      timestamp: new Date(),
      name: this.name
    });
    
    // Output to console
    console.log(formattedMessage);
  }

  error(message, data = null) {
    this._log('error', message, data);
  }

  warn(message, data = null) {
    this._log('warn', message, data);
  }

  info(message, data = null) {
    this._log('info', message, data);
  }

  debug(message, data = null) {
    this._log('debug', message, data);
  }

  trace(message, data = null) {
    this._log('trace', message, data);
  }

  // Specialized logging methods
  system(message, data = null) {
    this.info(`🔧 ${message}`, data);
  }

  security(message, data = null) {
    this.warn(`🔒 ${message}`, data);
  }

  performance(message, data = null) {
    this.debug(`⚡ ${message}`, data);
  }

  ai(message, data = null) {
    this.info(`🤖 ${message}`, data);
  }

  business(message, data = null) {
    this.info(`💼 ${message}`, data);
  }

  // Structured logging
  logEvent(event, data = {}) {
    this.info(`Event: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  logError(error, context = {}) {
    this.error(`Error: ${error.message}`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString()
    });
  }

  logPerformance(operation, duration, data = {}) {
    this.performance(`Operation: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...data
    });
  }

  // Create child logger
  child(name) {
    const childLogger = new Logger(`${this.name}:${name}`);
    childLogger.logLevel = this.logLevel;
    
    // Forward events to parent
    childLogger.on('log', (logData) => {
      this.emit('log', logData);
    });
    
    return childLogger;
  }

  // Set log level
  setLevel(level) {
    if (this.logLevels.hasOwnProperty(level)) {
      this.logLevel = level;
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  // Get current log level
  getLevel() {
    return this.logLevel;
  }
}

module.exports = { Logger }; 