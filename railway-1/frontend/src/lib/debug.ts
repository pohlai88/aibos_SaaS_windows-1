/**
 * Frontend Debug Utilities
 * Optimized debugging capabilities for AI-BOS frontend
 */

import React from 'react';

// Debug configuration
const DEBUG_CONFIG = {
  memory: process.env.NEXT_PUBLIC_DEBUG_MEMORY === 'true',
  performance: process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === 'true',
  api: process.env.NEXT_PUBLIC_DEBUG_API === 'true',
  profile: process.env.NEXT_PUBLIC_DEBUG_PROFILE === 'true',
  level: process.env.NEXT_PUBLIC_DEBUG_LEVEL || 'info'
};

// Debug logger
class DebugLogger {
  private isEnabled: boolean;
  private level: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.level = DEBUG_CONFIG.level;
  }

  private shouldLog(level: string): boolean {
    if (!this.isEnabled) return false;

    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, context?: any) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  info(message: string, context?: any) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  warn(message: string, context?: any) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  error(message: string, context?: any, error?: Error) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, context);
      if (error) {
        console.error(error.stack);
      }
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  private measurements: Map<string, number> = new Map();

  startTimer(name: string): void {
    if (DEBUG_CONFIG.performance) {
      this.measurements.set(name, performance.now());
    }
  }

  endTimer(name: string): number | null {
    if (!DEBUG_CONFIG.performance) return null;

    const startTime = this.measurements.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, {
      module: 'performance-monitor',
      measurement: name,
      duration: duration
    });

    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!DEBUG_CONFIG.performance) return fn();

    this.startTimer(name);
    return fn().finally(() => {
      this.endTimer(name);
    });
  }
}

// Memory monitoring
class MemoryMonitor {
  private lastMemoryUsage: NodeJS.MemoryUsage | null = null;

  checkMemoryUsage(): void {
    if (!DEBUG_CONFIG.memory || typeof window !== 'undefined') return;

    const currentMemory = process.memoryUsage();

    if (this.lastMemoryUsage) {
      const diff = {
        rss: currentMemory.rss - this.lastMemoryUsage.rss,
        heapUsed: currentMemory.heapUsed - this.lastMemoryUsage.heapUsed,
        heapTotal: currentMemory.heapTotal - this.lastMemoryUsage.heapTotal,
        external: currentMemory.external - this.lastMemoryUsage.external
      };

      logger.debug('Memory usage change', {
        module: 'memory-monitor',
        diff: {
          rss: `${(diff.rss / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(diff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(diff.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          external: `${(diff.external / 1024 / 1024).toFixed(2)}MB`
        }
      });
    }

    this.lastMemoryUsage = currentMemory;
  }
}

// API debugging
class APIDebugger {
  logRequest(url: string, method: string, data?: any): void {
    if (!DEBUG_CONFIG.api) return;

    logger.debug('API Request', {
      module: 'api-debugger',
      url,
      method,
      data: data ? JSON.stringify(data).substring(0, 200) + '...' : undefined
    });
  }

  logResponse(url: string, status: number, data?: any, duration?: number): void {
    if (!DEBUG_CONFIG.api) return;

    logger.debug('API Response', {
      module: 'api-debugger',
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
      data: data ? JSON.stringify(data).substring(0, 200) + '...' : undefined
    });
  }

  logError(url: string, error: any): void {
    if (!DEBUG_CONFIG.api) return;

    logger.error('API Error', {
      module: 'api-debugger',
      url,
      error: error.message || error
    });
  }
}

// Profile monitoring
class ProfileMonitor {
  private profiles: Map<string, { start: number; calls: number }> = new Map();

  startProfile(name: string): void {
    if (!DEBUG_CONFIG.profile) return;

    const existing = this.profiles.get(name);
    if (existing) {
      existing.calls++;
    } else {
      this.profiles.set(name, { start: performance.now(), calls: 1 });
    }
  }

  endProfile(name: string): void {
    if (!DEBUG_CONFIG.profile) return;

    const profile = this.profiles.get(name);
    if (!profile) return;

    const duration = performance.now() - profile.start;
    logger.info(`Profile: ${name}`, {
      module: 'profile-monitor',
      name,
      duration: `${duration.toFixed(2)}ms`,
      calls: profile.calls
    });

    this.profiles.delete(name);
  }
}

// Create instances
export const logger = new DebugLogger();
export const performanceMonitor = new PerformanceMonitor();
export const memoryMonitor = new MemoryMonitor();
export const apiDebugger = new APIDebugger();
export const profileMonitor = new ProfileMonitor();

// Debug utilities
export const debug = {
  logger,
  performance: performanceMonitor,
  memory: memoryMonitor,
  api: apiDebugger,
  profile: profileMonitor,

  // Utility functions
  isEnabled: (feature: keyof typeof DEBUG_CONFIG) => DEBUG_CONFIG[feature],

  // Simple performance monitoring hook
  usePerformanceMonitoring: (name: string) => {
    React.useEffect(() => {
      performanceMonitor.startTimer(`${name}-mount`);
      return () => {
        performanceMonitor.endTimer(`${name}-mount`);
      };
    }, [name]);
  }
};

// Export debug configuration
export { DEBUG_CONFIG };

// Auto-check memory usage in development
if (typeof window !== 'undefined' && DEBUG_CONFIG.memory) {
  setInterval(() => {
    memoryMonitor.checkMemoryUsage();
  }, 30000); // Check every 30 seconds
}
