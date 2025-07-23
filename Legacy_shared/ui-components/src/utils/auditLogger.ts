/**
 * Enterprise Audit Logger
 * Provides compliance logging for ISO27001, GDPR, SOC2, and HIPAA
 */

export interface AuditLogEntry {
  event: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  data?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface AuditLoggerConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  fallback?: boolean
}

class AuditLogger {
  private config: AuditLoggerConfig;
  private queue: AuditLogEntry[] = [];
  private flushTimer: NodeJS.Timeout | undefined;

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = {
      enabled: true,
  batchSize: 10,
      flushInterval: 5000,
  fallback: true,
      ...config,
    }
}

  log(event: string, data?: Record<string, any>): void;
  log(entry: AuditLogEntry): void;
  log(eventOrEntry: string | AuditLogEntry, data?: Record<string, any>): void {
    if (!this.config.enabled) return;

    let entry: AuditLogEntry;

    if (typeof eventOrEntry === 'string') {
      entry = {
        event: eventOrEntry,
  timestamp: new Date().toISOString(),
        data: data || {},
      }
} else {
      entry = eventOrEntry
}

    this.queue.push(entry);

    if (this.queue.length >= this.config.batchSize!) {
      this.flush()
} else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.config.flushInterval)
}
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const entries = [...this.queue];
    this.queue = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined
}

    try {
      if (this.config.endpoint) {
        await this.sendToEndpoint(entries)
} else if (this.config.fallback) {
        this.fallbackLog(entries)
}
    } catch (error) {
      console.error('Audit logging failed:', error);
      if (this.config.fallback) {
        this.fallbackLog(entries)
}
    }
  }

  private async sendToEndpoint(entries: AuditLogEntry[]): Promise<void> {
    const response = await fetch(this.config.endpoint!, {
      method: 'POST',
  headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entries }),
    });

    if (!response.ok) {
      throw new Error(`Audit endpoint returned ${response.status}`)
}
  }

  private fallbackLog(entries: AuditLogEntry[]): void {
    entries.forEach(entry => {
      console.log(`[AUDIT] ${entry.event}`, entry)
})
}

  setConfig(config: Partial<AuditLoggerConfig>): void {
    this.config = { ...this.config, ...config }
}

  getConfig(): AuditLoggerConfig {
    return { ...this.config }
}

  clear(): void {
    this.queue = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined
}
  }
}

// Global audit logger instance
const auditLogger = new AuditLogger();

// Export the main logging function
export const auditLog = (event: string, data?: Record<string, any>): void => {
  auditLogger.log(event, data)
};

// Export the class for advanced usage
export { AuditLogger };

// Export types
export type { AuditLogEntry, AuditLoggerConfig };
