/**
 * AI-BOS Logging Formatters
 *
 * World-class logging formatters for structured logging output.
 */

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context?: Record<string, any>;
  error?: Error;
  traceId?: string;
  userId?: string;
  sessionId?: string;
}

export interface LogFormatter {
  format(entry: LogEntry): string;
}

/**
 * JSON Formatter - Structured logging for production
 */
export class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const logObject = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level.toUpperCase(),
      message: entry.message,
      context: entry.context || {},
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined,
      traceId: entry.traceId,
      userId: entry.userId,
      sessionId: entry.sessionId
    };

    return JSON.stringify(logObject);
  }
}

/**
 * Human Readable Formatter - For development and debugging
 */
export class HumanFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;

    let output = `[${timestamp}] ${level} ${message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      output += ` | Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }

    if (entry.traceId) {
      output += ` | Trace: ${entry.traceId}`;
    }

    if (entry.userId) {
      output += ` | User: ${entry.userId}`;
    }

    return output;
  }
}

/**
 * Compact Formatter - Minimal output for high-volume logging
 */
export class CompactFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.charAt(0).toUpperCase();
    const message = entry.message.substring(0, 100);

    return `${timestamp} ${level} ${message}`;
  }
}

/**
 * Colored Formatter - For terminal output with colors
 */
export class ColoredFormatter implements LogFormatter {
  private colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    fatal: '\x1b[35m', // Magenta
    reset: '\x1b[0m'   // Reset
  };

  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;
    const color = this.colors[entry.level] || this.colors.reset;

    let output = `${color}[${timestamp}] ${level}${this.colors.reset} ${message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n${color}Context:${this.colors.reset} ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n${color}Error:${this.colors.reset} ${entry.error.name}: ${entry.error.message}`;
    }

    return output;
  }
}

/**
 * Formatter factory
 */
export const createFormatter = (type: 'json' | 'human' | 'compact' | 'colored'): LogFormatter => {
  switch (type) {
    case 'json':
      return new JsonFormatter();
    case 'human':
      return new HumanFormatter();
    case 'compact':
      return new CompactFormatter();
    case 'colored':
      return new ColoredFormatter();
    default:
      return new HumanFormatter();
  }
};
