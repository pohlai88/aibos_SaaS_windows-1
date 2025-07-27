/**
 * 🧠 AI-BOS Structured Logging System
 * Enterprise-grade logging with context, levels, and performance optimization
 */

export interface LogContext {
  module?: string;
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
  private isDevelopment: boolean = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  private isProduction: boolean = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
  private requestIdCounter: number = 0;

  constructor() {
    this.logLevel = (typeof process !== 'undefined' && process.env?.LOG_LEVEL as LogLevel) || 'info';
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
      environment: typeof process !== 'undefined' ? process.env?.NODE_ENV || 'development' : 'development',
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
    // This would typically send to services like DataDog, New Relic, etc.
  }

  debug(message: string, context: LogContext = {}): void {
    const entry = this.formatMessage('debug', message, context);
    this.output(entry);
  }

  info(message: string, context: LogContext = {}): void {
    const entry = this.formatMessage('info', message, context);
    this.output(entry);
  }

  warn(message: string, context: LogContext = {}): void {
    const entry = this.formatMessage('warn', message, context);
    this.output(entry);
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    const entry = this.formatMessage('error', message, context);
    if (error?.stack) {
      entry.stack = error.stack;
    }
    this.output(entry);
  }

  fatal(message: string, context: LogContext = {}, error?: Error): void {
    const entry = this.formatMessage('fatal', message, context);
    if (error?.stack) {
      entry.stack = error.stack;
    }
    this.output(entry);
  }

  time(label: string, context: LogContext = {}): () => void {
    const startTime = Date.now();
    this.info(`Started: ${label}`, context);

    return () => {
      const duration = Date.now() - startTime;
      this.info(`Completed: ${label} (${duration}ms)`, context);
    };
  }

  request(method: string, url: string, context: LogContext = {}): void {
    this.info(`${method} ${url}`, { ...context, type: 'request' });
  }

  response(status: number, url: string, context: LogContext = {}): void {
    this.info(`${status} ${url}`, { ...context, type: 'response' });
  }

  aiModel(model: string, action: string, context: LogContext = {}): void {
    this.info(`AI Model: ${model} - ${action}`, { ...context, type: 'ai_model' });
  }

  aiPrediction(model: string, confidence: number, context: LogContext = {}): void {
    this.info(`AI Prediction: ${model} (${confidence}%)`, { ...context, type: 'ai_prediction' });
  }

  manifestor(action: string, module: string, context: LogContext = {}): void {
    this.info(`Manifestor: ${action} - ${module}`, { ...context, type: 'manifestor' });
  }

  performance(metric: string, value: number, unit: string, context: LogContext = {}): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, { ...context, type: 'performance' });
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

export default logger;
