/**
 * Enhanced Parallel Processor for AI-BOS Frontend
 *
 * Features:
 * - Priority-based request processing
 * - Improved error handling and retry logic
 * - Better resource management
 * - Metrics collection
 * - Dynamic configuration updates
 * - Request batching support
 * - Production-ready optimizations
 */

export interface AIRequest {
  id: string;
  task: string;
  input: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  options?: Record<string, any>;
  createdAt?: number;
}

export interface AIResponse {
  id: string;
  success: boolean;
  data: any;
  error?: string;
  processingTime: number;
  provider: string;
  retries?: number;
}

export interface ProcessorConfig {
  maxConcurrentRequests: number;
  maxRetries: number;
  timeoutMs: number;
  enableBatching: boolean;
  batchSize: number;
  batchTimeoutMs: number;
  priorityWeights: Record<'low' | 'normal' | 'high' | 'critical', number>;
  retryDelayBaseMs: number;
  maxQueueSize: number;
  enableMetrics: boolean;
  metricsIntervalMs: number;
}

export interface ProcessorMetrics {
  totalProcessed: number;
  totalFailed: number;
  avgProcessingTime: number;
  currentLoad: number;
  lastUpdated: number;
  queueSize: number;
  successRate: number;
  throughput: number; // requests per second
}

export class ParallelProcessor {
  private requestQueue: Array<{
    request: AIRequest;
    resolve: (response: AIResponse) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];

  private activeRequests = new Map<string, Promise<AIResponse>>();
  private processing = false;
  private config: ProcessorConfig;
  private metrics: ProcessorMetrics;
  private abortController = new AbortController();
  private isShuttingDown = false;
  private metricsInterval?: NodeJS.Timeout;

  constructor(config: Partial<ProcessorConfig> = {}) {
    this.config = {
      maxConcurrentRequests: 10,
      maxRetries: 3,
      timeoutMs: 30000,
      enableBatching: true,
      batchSize: 5,
      batchTimeoutMs: 1000,
      priorityWeights: {
        low: 1,
        normal: 2,
        high: 4,
        critical: 8
      },
      retryDelayBaseMs: 1000,
      maxQueueSize: 1000,
      enableMetrics: true,
      metricsIntervalMs: 5000,
      ...config
    };

    this.metrics = {
      totalProcessed: 0,
      totalFailed: 0,
      avgProcessingTime: 0,
      currentLoad: 0,
      lastUpdated: Date.now(),
      queueSize: 0,
      successRate: 1,
      throughput: 0
    };

    // Start metrics collection if enabled
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  /**
   * Submit a request for processing with priority handling
   */
  async submit(request: AIRequest): Promise<AIResponse> {
    if (this.isShuttingDown) {
      throw new Error('Processor is shutting down and not accepting new requests');
    }

    // Check queue size limit
    if (this.requestQueue.length >= this.config.maxQueueSize) {
      throw new Error(`Queue is full (${this.config.maxQueueSize} requests). Please try again later.`);
    }

    request.createdAt = request.createdAt || Date.now();

    return new Promise((resolve, reject) => {
      const queueItem = {
        request,
        resolve,
        reject,
        timestamp: Date.now()
      };

      // Insert based on priority
      const priorityScore = this.calculatePriorityScore(request.priority);
      let inserted = false;

      for (let i = 0; i < this.requestQueue.length; i++) {
        const itemScore = this.calculatePriorityScore(this.requestQueue[i].request.priority);
        if (priorityScore > itemScore) {
          this.requestQueue.splice(i, 0, queueItem);
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        this.requestQueue.push(queueItem);
      }

      // Update queue size metric
      this.metrics.queueSize = this.requestQueue.length;

      if (!this.processing) {
        this.processQueue().catch(err => {
          console.error('Queue processing error:', err);
        });
      }
    });
  }

  /**
   * Calculate priority score for request ordering
   */
  private calculatePriorityScore(priority: AIRequest['priority']): number {
    const weight = this.config.priorityWeights[priority] || 1;
    return weight * 1000; // Scale for better sorting
  }

  /**
   * Process the request queue with improved flow control
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      while (!this.isShuttingDown && this.requestQueue.length > 0) {
        // Process batch or single requests based on config
        if (this.config.enableBatching && this.requestQueue.length >= this.config.batchSize) {
          await this.processBatch();
        } else {
          await this.processSingleRequest();
        }

        // Update metrics
        this.updateMetrics();

        // Small delay to prevent event loop blocking
        await this.delay(10);
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a batch of requests
   */
  private async processBatch(): Promise<void> {
    const batchItems = this.requestQueue.splice(0, this.config.batchSize);
    const batchRequests = batchItems.map(item => item.request);

    try {
      const batchPromise = this.processBatchRequest(batchRequests);
      const batchResults = await Promise.race([
        batchPromise,
        this.createTimeoutPromise(this.config.batchTimeoutMs)
      ]);

      batchItems.forEach((item, index) => {
        const result = batchResults[index];
        if (result.success) {
          item.resolve(result);
          this.metrics.totalProcessed++;
        } else {
          // Retry logic for failed items in batch
          this.handleFailedRequest(item, result.error || 'Batch processing failed');
        }
      });
    } catch (error) {
      // Fallback to individual processing if batch fails
      console.warn('Batch processing failed, falling back to individual requests');
      for (const item of batchItems) {
        try {
          const result = await this.processSingleItem(item);
          item.resolve(result);
          this.metrics.totalProcessed++;
        } catch (error) {
          item.reject(error as Error);
          this.metrics.totalFailed++;
        }
      }
    }
  }

  /**
   * Process a single request from the queue
   */
  private async processSingleRequest(): Promise<void> {
    if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
      await Promise.race([
        new Promise(resolve => setTimeout(resolve, 100)),
        ...Array.from(this.activeRequests.values())
      ]);
      return;
    }

    const item = this.requestQueue.shift();
    if (!item) return;

    try {
      const result = await this.processSingleItem(item);
      item.resolve(result);
      this.metrics.totalProcessed++;
    } catch (error) {
      item.reject(error as Error);
      this.metrics.totalFailed++;
    }
  }

  /**
   * Process a single queue item
   */
  private async processSingleItem(item: {
    request: AIRequest;
    resolve: (response: AIResponse) => void;
    reject: (error: Error) => void;
  }): Promise<AIResponse> {
    const { request } = item;
    const processingPromise = this.processRequestWithRetry(request);

    this.activeRequests.set(request.id, processingPromise);

    try {
      const result = await processingPromise;
      return result;
    } finally {
      this.activeRequests.delete(request.id);
    }
  }

  /**
   * Process request with retry logic
   */
  private async processRequestWithRetry(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    let attempt = 0;

    for (; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          this.executeAIRequest(request),
          this.createTimeoutPromise(this.config.timeoutMs)
        ]);

        return {
          id: request.id,
          success: true,
          data: result,
          processingTime: Date.now() - startTime,
          provider: 'ai-processor',
          retries: attempt
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.maxRetries) {
          const delayMs = this.config.retryDelayBaseMs * Math.pow(2, attempt);
          await this.delay(delayMs);
        }
      }
    }

    return {
      id: request.id,
      success: false,
      data: null,
      error: lastError?.message || 'Unknown error',
      processingTime: Date.now() - startTime,
      provider: 'ai-processor',
      retries: attempt - 1
    };
  }

  /**
   * Handle failed request (retry or reject)
   */
  private handleFailedRequest(
    item: {
      request: AIRequest;
      resolve: (response: AIResponse) => void;
      reject: (error: Error) => void;
    },
    error: string
  ): void {
    if (item.request.options?.noRetry) {
      item.reject(new Error(error));
      this.metrics.totalFailed++;
      return;
    }

    // Requeue with lower priority
    const retryRequest = {
      ...item.request,
      priority: this.downgradePriority(item.request.priority)
    };

    this.submit(retryRequest)
      .then(item.resolve)
      .catch(item.reject);
  }

  /**
   * Downgrade priority for retries
   */
  private downgradePriority(priority: AIRequest['priority']): AIRequest['priority'] {
    switch (priority) {
      case 'critical': return 'high';
      case 'high': return 'normal';
      case 'normal': return 'low';
      default: return 'low';
    }
  }

  /**
   * Process batch request
   */
  private async processBatchRequest(requests: AIRequest[]): Promise<AIResponse[]> {
    // Simulate batch processing
    await this.delay(200 + Math.random() * 800);

    return requests.map(request => ({
      id: request.id,
      success: Math.random() > 0.2, // 20% failure rate for simulation
      data: { batch: true, ...this.generateMockResponse(request) },
      processingTime: 0,
      provider: 'ai-processor-batch',
      error: Math.random() > 0.2 ? undefined : 'Batch processing error'
    }));
  }

  /**
   * Execute the actual AI request
   */
  private async executeAIRequest(request: AIRequest): Promise<any> {
    await this.delay(100 + Math.random() * 500);
    return this.generateMockResponse(request);
  }

  /**
   * Generate mock response based on request type
   */
  private generateMockResponse(request: AIRequest): any {
    switch (request.task) {
      case 'text-analysis':
        return {
          sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
          confidence: 0.7 + Math.random() * 0.3,
          keywords: ['ai', 'technology', 'innovation'].slice(0, 1 + Math.floor(Math.random() * 3))
        };

      case 'image-analysis':
        return {
          objects: ['person', 'computer', 'desk', 'chair', 'window'].slice(0, 1 + Math.floor(Math.random() * 4)),
          confidence: 0.8 + Math.random() * 0.2,
          tags: ['office', 'work', 'technology', 'indoor'].slice(0, 1 + Math.floor(Math.random() * 3))
        };

      case 'prediction':
        return {
          prediction: Math.random() > 0.5 ? 'up' : 'down',
          confidence: 0.6 + Math.random() * 0.4,
          factors: ['market', 'trend', 'data', 'analysis'].slice(0, 2 + Math.floor(Math.random() * 2))
        };

      default:
        return {
          result: `Processed ${request.task}`,
          confidence: 0.7 + Math.random() * 0.3,
          timestamp: new Date().toISOString()
        };
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, this.config.metricsIntervalMs);
  }

  /**
   * Update processor metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    const timeWindow = 60 * 1000; // 1 minute window

    // Update current load
    this.metrics.currentLoad = this.activeRequests.size / this.config.maxConcurrentRequests;
    this.metrics.queueSize = this.requestQueue.length;
    this.metrics.lastUpdated = now;

    // Calculate success rate
    const totalRequests = this.metrics.totalProcessed + this.metrics.totalFailed;
    this.metrics.successRate = totalRequests > 0 ? this.metrics.totalProcessed / totalRequests : 1;

    // Calculate throughput (requests per second over last minute)
    // This is a simplified calculation - in production you'd want a rolling window
    this.metrics.throughput = totalRequests / 60; // Simplified: total requests / 60 seconds
  }

  /**
   * Get current status and metrics
   */
  getStatus() {
    return {
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests.size,
      processing: this.processing,
      config: this.config,
      metrics: this.metrics,
      isShuttingDown: this.isShuttingDown
    };
  }

  /**
   * Get detailed metrics
   */
  getMetrics(): ProcessorMetrics {
    return { ...this.metrics };
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(newConfig: Partial<ProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart metrics collection if enabled status changed
    if (newConfig.enableMetrics !== undefined) {
      if (newConfig.enableMetrics && !this.metricsInterval) {
        this.startMetricsCollection();
      } else if (!newConfig.enableMetrics && this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = undefined;
      }
    }
  }

  /**
   * Gracefully shutdown the processor
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    this.abortController.abort();

    // Stop metrics collection
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }

    // Wait for active requests to complete
    while (this.activeRequests.size > 0) {
      await Promise.race([
        new Promise(resolve => setTimeout(resolve, 100)),
        ...Array.from(this.activeRequests.values())
      ]);
    }

    // Reject all queued requests
    this.clearQueue();
  }

  /**
   * Clear the queue and reject all pending requests
   */
  clearQueue(): void {
    this.requestQueue.forEach(item => {
      item.reject(new Error('Processor queue cleared'));
    });
    this.requestQueue = [];
    this.metrics.queueSize = 0;
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    );
  }

  /**
   * Utility delay function with abort support
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      this.abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Delay aborted'));
      });
    });
  }
}

// Export singleton instance
export const parallelProcessor = new ParallelProcessor();
