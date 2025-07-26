/**
 * 🧠 AI-BOS Structured Logging System
 * Enterprise-grade logging with context, levels, and performance optimization
 */

export interface LogContext {
  module: string;
  version?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  environment?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context: LogContext;
  stack?: string;
  duration?: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

class Logger {
  private logLevel: LogLevel = 'info';
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  private isProduction: boolean = process.env.NODE_ENV === 'production';
  private requestIdCounter: number = 0;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
    const timestamp = new Date().toISOString();
    const baseContext: LogContext = {
      module: context.module || 'unknown',
      version: context.version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...context
    };

    return {
      timestamp,
      level,
      message,
      context: baseContext
    };
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context.module}]`;
    const contextStr = Object.keys(entry.context)
      .filter(key => !['module', 'version', 'environment'].includes(key))
      .map(key => `${key}=${entry.context[key]}`)
      .join(' ');

    const fullMessage = `${prefix} ${entry.message} ${contextStr}`.trim();

    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) console.debug(fullMessage);
        break;
      case 'info':
        console.info(fullMessage);
        break;
      case 'warn':
        console.warn(fullMessage);
        break;
      case 'error':
      case 'fatal':
        console.error(fullMessage);
        if (entry.stack) console.error(entry.stack);
        break;
    }

    // In production, also send to external logging service
    if (this.isProduction && entry.level === 'error') {
      this.sendToExternalLogger(entry);
    }
  }

  private sendToExternalLogger(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // This would send critical errors to services like Sentry, LogRocket, etc.
  }

  debug(message: string, context: LogContext = {}): void {
    this.output(this.formatMessage('debug', message, context));
  }

  info(message: string, context: LogContext = {}): void {
    this.output(this.formatMessage('info', message, context));
  }

  warn(message: string, context: LogContext = {}): void {
    this.output(this.formatMessage('warn', message, context));
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    const entry = this.formatMessage('error', message, context);
    if (error) {
      entry.stack = error.stack;
    }
    this.output(entry);
  }

  fatal(message: string, context: LogContext = {}, error?: Error): void {
    const entry = this.formatMessage('fatal', message, context);
    if (error) {
      entry.stack = error.stack;
    }
    this.output(entry);
  }

  // Performance logging
  time(label: string, context: LogContext = {}): () => void {
    const start = performance.now();
    const requestId = `req_${++this.requestIdCounter}`;

    this.debug(`Starting timer: ${label}`, { ...context, requestId });

    return () => {
      const duration = performance.now() - start;
      this.info(`Timer completed: ${label}`, {
        ...context,
        requestId,
        duration: `${duration.toFixed(2)}ms`
      });
    };
  }

  // Request logging
  request(method: string, url: string, context: LogContext = {}): void {
    this.info(`HTTP ${method} ${url}`, { ...context, type: 'request' });
  }

  response(status: number, url: string, context: LogContext = {}): void {
    const level = status >= 400 ? 'error' : 'info';
    this[level](`HTTP ${status} ${url}`, { ...context, type: 'response' });
  }

  // AI-specific logging
  aiModel(model: string, action: string, context: LogContext = {}): void {
    this.info(`AI Model: ${model} - ${action}`, { ...context, type: 'ai_model' });
  }

  aiPrediction(model: string, confidence: number, context: LogContext = {}): void {
    this.info(`AI Prediction: ${model} (${(confidence * 100).toFixed(1)}%)`, {
      ...context,
      type: 'ai_prediction',
      confidence
    });
  }

  // Manifestor-specific logging
  manifestor(action: string, module: string, context: LogContext = {}): void {
    this.info(`Manifestor: ${action}`, { ...context, type: 'manifestor', module });
  }

  // Performance metrics
  performance(metric: string, value: number, unit: string, context: LogContext = {}): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      ...context,
      type: 'performance',
      metric,
      value,
      unit
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const debug = (message: string, context?: LogContext) => logger.debug(message, context);
export const info = (message: string, context?: LogContext) => logger.info(message, context);
export const warn = (message: string, context?: LogContext) => logger.warn(message, context);
export const error = (message: string, context?: LogContext, err?: Error) => logger.error(message, context, err);
export const fatal = (message: string, context?: LogContext, err?: Error) => logger.fatal(message, context, err);
export const time = (label: string, context?: LogContext) => logger.time(label, context);
