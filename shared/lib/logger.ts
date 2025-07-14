import { z } from 'zod';

/**
 * Log levels with severity ordering
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

/**
 * Log context for structured logging
 */
export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  appId?: string;
  component?: string;
  function?: string;
  [key: string]: any;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  data?: any;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  service: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  enableConsole: boolean;
  enableFile: boolean;
  logFilePath?: string;
  enableStructured: boolean;
  enableMetrics: boolean;
}

/**
 * Structured logger for enterprise-grade logging
 */
export class Logger {
  private config: LoggerConfig;
  private requestId: string | null = null;
  private sessionId: string | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      service: 'aibos-platform',
      version: '1.0.0',
      environment: 'development',
      enableConsole: true,
      enableFile: false,
      enableStructured: true,
      enableMetrics: false,
      ...config
    };
  }

  /**
   * Set request context for tracing
   */
  setRequestContext(requestId: string, sessionId?: string): void {
    this.requestId = requestId;
    this.sessionId = sessionId;
  }

  /**
   * Clear request context
   */
  clearRequestContext(): void {
    this.requestId = null;
    this.sessionId = null;
  }

  /**
   * Create log entry with context
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        requestId: this.requestId,
        sessionId: this.sessionId,
        service: this.config.service,
        version: this.config.version,
        environment: this.config.environment
      },
      error,
      data
    };
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.enableStructured) {
      return JSON.stringify(entry);
    }

    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const context = Object.keys(entry.context).length > 0 
      ? ` [${Object.entries(entry.context).map(([k, v]) => `${k}=${v}`).join(', ')}]`
      : '';

    return `[${timestamp}] ${levelName}${context}: ${entry.message}`;
  }

  /**
   * Write log entry
   */
  private writeLog(entry: LogEntry): void {
    if (entry.level > this.config.level) {
      return;
    }

    const formatted = this.formatLogEntry(entry);

    if (this.config.enableConsole) {
      this.writeToConsole(entry, formatted);
    }

    if (this.config.enableFile) {
      this.writeToFile(formatted);
    }

    if (this.config.enableMetrics) {
      this.recordMetrics(entry);
    }
  }

  /**
   * Write to console with appropriate colors
   */
  private writeToConsole(entry: LogEntry, formatted: string): void {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m',  // Cyan
      [LogLevel.DEBUG]: '\x1b[35m', // Magenta
      [LogLevel.TRACE]: '\x1b[37m', // White
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || '';
    
    console.log(`${color}${formatted}${reset}`);
  }

  /**
   * Write to file (placeholder for file logging)
   */
  private writeToFile(formatted: string): void {
    // In production, this would write to a log file or log aggregation service
    // For now, we'll just use console for file output too
    if (this.config.logFilePath) {
      console.log(`[FILE] ${formatted}`);
    }
  }

  /**
   * Record metrics (placeholder for metrics collection)
   */
  private recordMetrics(entry: LogEntry): void {
    // In production, this would send metrics to monitoring services
    // like DataDog, New Relic, or Prometheus
    if (entry.level === LogLevel.ERROR) {
      // Increment error counter
      console.log(`[METRIC] error_count:${entry.context.component || 'unknown'}:1`);
    }
  }

  /**
   * Log error level
   */
  error(message: string, context?: LogContext, error?: Error, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.ERROR, message, context, error, data));
  }

  /**
   * Log warning level
   */
  warn(message: string, context?: LogContext, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.WARN, message, context, undefined, data));
  }

  /**
   * Log info level
   */
  info(message: string, context?: LogContext, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.INFO, message, context, undefined, data));
  }

  /**
   * Log debug level
   */
  debug(message: string, context?: LogContext, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.DEBUG, message, context, undefined, data));
  }

  /**
   * Log trace level
   */
  trace(message: string, context?: LogContext, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.TRACE, message, context, undefined, data));
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger(this.config);
    childLogger.requestId = this.requestId;
    childLogger.sessionId = this.sessionId;
    
    // Merge context in log methods
    const originalMethods = ['error', 'warn', 'info', 'debug', 'trace'];
    originalMethods.forEach(method => {
      const original = this[method as keyof Logger] as Function;
      childLogger[method as keyof Logger] = (message: string, context?: LogContext, ...args: any[]) => {
        const mergedContext = { ...additionalContext, ...context };
        return original.call(this, message, mergedContext, ...args);
      };
    });

    return childLogger;
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger({
  level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  environment: (process.env.NODE_ENV as any) || 'development',
  enableConsole: true,
  enableStructured: process.env.NODE_ENV === 'production',
  enableMetrics: process.env.NODE_ENV === 'production'
});

/**
 * Create logger for specific component
 */
export function createLogger(component: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger({
    ...config,
    service: `${logger.config.service}:${component}`
  });
}

/**
 * Express middleware for request logging
 */
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = req.headers['x-session-id'] || req.session?.id;
    
    logger.setRequestContext(requestId, sessionId);
    
    const startTime = Date.now();
    
    // Log request
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      tenantId: req.user?.tenant_id,
      userId: req.user?.id
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      logger.info('HTTP Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('content-length'),
        tenantId: req.user?.tenant_id,
        userId: req.user?.id
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Error logging middleware
 */
export function errorLogger() {
  return (error: Error, req: any, res: any, next: any) => {
    logger.error('Unhandled Error', {
      method: req.method,
      url: req.url,
      tenantId: req.user?.tenant_id,
      userId: req.user?.id
    }, error);

    next(error);
  };
} 