/**
 * Enterprise-Grade Lifecycle Manager
 * Manages intervals, timeouts, and event listeners with safe cleanup
 */

export interface LifecycleResource {
  id: string;
  type: 'interval' | 'timeout' | 'listener';
  cleanup: () => void;
  description: string;
}

export class LifecycleManager {
  private static instance: LifecycleManager;
  private resources: Map<string, LifecycleResource> = new Map();
  private isShuttingDown = false;

  private constructor() {
    this.setupGracefulShutdown();
  }

  static getInstance(): LifecycleManager {
    if (!LifecycleManager.instance) {
      LifecycleManager.instance = new LifecycleManager();
    }
    return LifecycleManager.instance;
  }

  /**
   * Create a safe interval with automatic cleanup
   */
  createInterval(
    id: string,
    callback: () => void,
    delay: number,
    description: string
  ): NodeJS.Timeout {
    if (this.isShuttingDown) {
      throw new Error('Cannot create interval during shutdown');
    }

    const interval = setInterval(callback, delay);

    const resource: LifecycleResource = {
      id,
      type: 'interval',
      cleanup: () => clearInterval(interval),
      description
    };

    this.resources.set(id, resource);
    console.log(`🔧 Created interval: ${id} (${description})`);

    return interval;
  }

  /**
   * Create a safe timeout with automatic cleanup
   */
  createTimeout(
    id: string,
    callback: () => void,
    delay: number,
    description: string
  ): NodeJS.Timeout {
    if (this.isShuttingDown) {
      throw new Error('Cannot create timeout during shutdown');
    }

    const timeout = setTimeout(() => {
      callback();
      this.resources.delete(id);
    }, delay);

    const resource: LifecycleResource = {
      id,
      type: 'timeout',
      cleanup: () => clearTimeout(timeout),
      description
    };

    this.resources.set(id, resource);
    console.log(`⏰ Created timeout: ${id} (${description})`);

    return timeout;
  }

  /**
   * Register an event listener with automatic cleanup
   */
  registerListener(
    id: string,
    emitter: NodeJS.EventEmitter,
    event: string,
    listener: (...args: any[]) => void,
    description: string
  ): void {
    if (this.isShuttingDown) {
      throw new Error('Cannot register listener during shutdown');
    }

    emitter.on(event, listener);

    const resource: LifecycleResource = {
      id,
      type: 'listener',
      cleanup: () => emitter.off(event, listener),
      description
    };

    this.resources.set(id, resource);
    console.log(`👂 Registered listener: ${id} (${description})`);
  }

  /**
   * Manually cleanup a specific resource
   */
  cleanup(id: string): boolean {
    const resource = this.resources.get(id);
    if (!resource) {
      return false;
    }

    try {
      resource.cleanup();
      this.resources.delete(id);
      console.log(`🧹 Cleaned up: ${id} (${resource.description})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to cleanup ${id}:`, error);
      return false;
    }
  }

  /**
   * Get all active resources
   */
  getResources(): LifecycleResource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Get resource count by type
   */
  getResourceCount(): { intervals: number; timeouts: number; listeners: number } {
    const intervals = Array.from(this.resources.values()).filter(r => r.type === 'interval').length;
    const timeouts = Array.from(this.resources.values()).filter(r => r.type === 'timeout').length;
    const listeners = Array.from(this.resources.values()).filter(r => r.type === 'listener').length;

    return { intervals, timeouts, listeners };
  }

  /**
   * Cleanup all resources
   */
  cleanupAll(): void {
    console.log('🧹 Starting cleanup of all resources...');

    const resources = Array.from(this.resources.values());
    let successCount = 0;
    let failureCount = 0;

    resources.forEach(resource => {
      try {
        resource.cleanup();
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to cleanup ${resource.id}:`, error);
        failureCount++;
      }
    });

    this.resources.clear();

    console.log(`🧹 Cleanup complete: ${successCount} successful, ${failureCount} failed`);
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
      this.isShuttingDown = true;

      // Give processes time to cleanup
      setTimeout(() => {
        this.cleanupAll();
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
      }, 1000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  }
}

// Export singleton instance
export const lifecycleManager = LifecycleManager.getInstance();
