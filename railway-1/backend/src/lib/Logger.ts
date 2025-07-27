/**
 * Enterprise-Grade Structured Logger
 * Lightweight, zero-overhead logging with structured output
 */

export interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: LogContext | undefined;
  error?: Error | undefined;
}

export class Logger {
  private static instance: Logger;
  private logLevel: 'debug' | 'info' | 'warn' | 'error';
  private isProduction: boolean;

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as any) || 'info';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.log('info', message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, context);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.log('error', message, context, error);
    }
  }

  /**
   * Log system heartbeat
   */
  heartbeat(): void {
    this.info('System heartbeat', {
      module: 'system',
      action: 'heartbeat',
      timestamp: Date.now(),
      memory: this.getMemoryUsage(),
      uptime: process.uptime()
    });
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `${method} ${url} - ${statusCode}`, {
      ...context,
      module: 'api',
      action: 'request',
      method,
      url,
      statusCode,
      duration
    });
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table: string, duration: number, context?: LogContext): void {
    this.info(`Database ${operation} on ${table}`, {
      ...context,
      module: 'database',
      action: operation,
      table,
      duration
    });
  }

  /**
   * Log consciousness event
   */
  logConsciousness(event: string, data?: any, context?: LogContext): void {
    this.info(`Consciousness: ${event}`, {
      ...context,
      module: 'consciousness',
      action: event,
      data
    });
  }

  /**
   * Log telemetry event
   */
  logTelemetry(event: string, data?: any, context?: LogContext): void {
    this.info(`Telemetry: ${event}`, {
      ...context,
      module: 'telemetry',
      action: event,
      data
    });
  }

  /**
   * Check if should log at given level
   */
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level as keyof typeof levels] >= levels[this.logLevel];
  }

  /**
   * Format and output log entry
   */
  private log(level: string, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level as any,
      message,
      context,
      error
    };

    const output = this.formatLogEntry(entry);

    if (this.isProduction) {
      // In production, use structured JSON logging
      console.log(JSON.stringify(output));
    } else {
      // In development, use pretty formatting
      console.log(this.formatPrettyLog(entry));
    }
  }

  /**
   * Format log entry for production (JSON)
   */
  private formatLogEntry(entry: LogEntry): any {
    const output: any = {
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      message: entry.message
    };

    if (entry.context) {
      Object.assign(output, entry.context);
    }

    if (entry.error) {
      output.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      };
    }

    return output;
  }

  /**
   * Format log entry for development (pretty)
   */
  private formatPrettyLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    const module = entry.context?.module || 'system';
    const action = entry.context?.action || '';

    let output = `[${timestamp}] ${level} [${module}] ${entry.message}`;

    if (action) {
      output += ` (${action})`;
    }

    if (entry.context?.duration) {
      output += ` - ${entry.context.duration}ms`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    const usage = process.memoryUsage();
    const used = Math.round(usage.heapUsed / 1024 / 1024);
    const total = Math.round(usage.heapTotal / 1024 / 1024);
    const percentage = Math.round((used / total) * 100);

    return { used, total, percentage };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
  heartbeat: () => logger.heartbeat(),
  request: (method: string, url: string, statusCode: number, duration: number, context?: LogContext) =>
    logger.logRequest(method, url, statusCode, duration, context),
  database: (operation: string, table: string, duration: number, context?: LogContext) =>
    logger.logDatabase(operation, table, duration, context),
  consciousness: (event: string, data?: any, context?: LogContext) =>
    logger.logConsciousness(event, data, context),
  telemetry: (event: string, data?: any, context?: LogContext) =>
    logger.logTelemetry(event, data, context)
};
