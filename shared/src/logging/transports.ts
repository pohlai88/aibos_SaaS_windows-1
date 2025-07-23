/**
 * AI-BOS Logging Transports
 *
 * World-class logging transports for different output destinations.
 */

import type { LogEntry, LogFormatter } from './formatters';

export interface LogTransport {
  write(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
  close?(): void | Promise<void>;
}

/**
 * Console Transport - For development and debugging
 */
export class ConsoleTransport implements LogTransport {
  constructor(private formatter: LogFormatter) {}

  write(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}

/**
 * File Transport - For persistent logging
 */
export class FileTransport implements LogTransport {
  private buffer: string[] = [];
  private flushInterval: ReturnType<typeof setTimeout>;

  constructor(
    private filePath: string,
    private formatter: LogFormatter,
    private maxBufferSize: number = 100,
    private flushIntervalMs: number = 5000
  ) {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  write(entry: LogEntry): void {
    const formatted = this.formatter.format(entry) + '\n';
    this.buffer.push(formatted);

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      const fs = await import('fs/promises');
      const content = this.buffer.join('');
      await fs.appendFile(this.filePath, content, 'utf8');
      this.buffer = [];
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  async close(): Promise<void> {
    clearInterval(this.flushInterval);
    await this.flush();
  }
}

/**
 * HTTP Transport - For remote logging services
 */
export class HttpTransport implements LogTransport {
  private buffer: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setTimeout>;

  constructor(
    private endpoint: string,
    private formatter: LogFormatter,
    private maxBufferSize: number = 50,
    private flushIntervalMs: number = 10000,
    private headers: Record<string, string> = {}
  ) {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  write(entry: LogEntry): void {
    this.buffer.push(entry);

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      const payload = {
        logs: this.buffer.map(entry => ({
          ...entry,
          timestamp: entry.timestamp.toISOString()
        }))
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP transport failed: ${response.status}`);
      }

      this.buffer = [];
    } catch (error) {
      console.error('Failed to send logs via HTTP:', error);
    }
  }

  close(): void {
    clearInterval(this.flushInterval);
  }
}

/**
 * Memory Transport - For testing and debugging
 */
export class MemoryTransport implements LogTransport {
  public logs: LogEntry[] = [];

  write(entry: LogEntry): void {
    this.logs.push(entry);
  }

  clear(): void {
    this.logs = [];
  }

  getLogs(level?: string): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }
}

/**
 * Transport factory
 */
export const createTransport = (
  type: 'console' | 'file' | 'http' | 'memory',
  options: {
    formatter: LogFormatter;
    filePath?: string;
    endpoint?: string;
    maxBufferSize?: number;
    flushIntervalMs?: number;
    headers?: Record<string, string>;
  }
): LogTransport => {
  switch (type) {
    case 'console':
      return new ConsoleTransport(options.formatter);
    case 'file':
      if (!options.filePath) {
        throw new Error('File path is required for file transport');
      }
      return new FileTransport(
        options.filePath,
        options.formatter,
        options.maxBufferSize,
        options.flushIntervalMs
      );
    case 'http':
      if (!options.endpoint) {
        throw new Error('Endpoint is required for HTTP transport');
      }
      return new HttpTransport(
        options.endpoint,
        options.formatter,
        options.maxBufferSize,
        options.flushIntervalMs,
        options.headers
      );
    case 'memory':
      return new MemoryTransport();
    default:
      throw new Error(`Unknown transport type: ${type}`);
  }
};
