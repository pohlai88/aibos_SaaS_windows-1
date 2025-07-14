import { logger } from './logger';
import { monitoring } from './monitoring';

/**
 * Job status enumeration
 */
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY = 'retry'
}

/**
 * Job priority levels
 */
export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

/**
 * Job configuration
 */
export interface JobConfig {
  id: string;
  name: string;
  data: any;
  priority?: JobPriority;
  delay?: number; // Delay in milliseconds
  retries?: number;
  retryDelay?: number;
  timeout?: number; // Job timeout in milliseconds
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Job instance
 */
export interface Job {
  id: string;
  name: string;
  data: any;
  status: JobStatus;
  priority: JobPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retries: number;
  maxRetries: number;
  error?: string;
  result?: any;
  tags: string[];
  metadata: Record<string, any>;
  progress?: number; // 0-100
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultPriority?: JobPriority;
  defaultRetries?: number;
  defaultRetryDelay?: number;
  defaultTimeout?: number;
  enableMetrics?: boolean;
  redisUrl?: string;
  redisOptions?: any;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  name: string;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  retry: number;
  totalProcessed: number;
  averageProcessingTime: number;
  throughput: number; // jobs per minute
}

/**
 * Job processor function type
 */
export type JobProcessor<T = any> = (job: Job) => Promise<T>;

/**
 * Job event handlers
 */
export interface JobEventHandlers {
  onStart?: (job: Job) => void;
  onComplete?: (job: Job, result: any) => void;
  onFail?: (job: Job, error: Error) => void;
  onRetry?: (job: Job, error: Error) => void;
  onProgress?: (job: Job, progress: number) => void;
}

/**
 * Memory-based job queue implementation
 */
export class MemoryQueue {
  private name: string;
  private config: QueueConfig;
  private jobs: Map<string, Job> = new Map();
  private pendingJobs: Job[] = [];
  private runningJobs: Set<string> = new Set();
  private processors: Map<string, JobProcessor> = new Map();
  private eventHandlers: JobEventHandlers = {};
  private isProcessing: boolean = false;
  private stats: QueueStats;
  private processingTimer: NodeJS.Timeout | null = null;

  constructor(config: QueueConfig) {
    this.name = config.name;
    this.config = {
      concurrency: 1,
      defaultPriority: JobPriority.NORMAL,
      defaultRetries: 3,
      defaultRetryDelay: 5000,
      defaultTimeout: 30000,
      enableMetrics: true,
      ...config
    };

    this.stats = {
      name: this.name,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      retry: 0,
      totalProcessed: 0,
      averageProcessingTime: 0,
      throughput: 0
    };

    this.startProcessing();
  }

  /**
   * Add a job to the queue
   */
  async add(jobConfig: JobConfig): Promise<Job> {
    const job: Job = {
      id: jobConfig.id,
      name: jobConfig.name,
      data: jobConfig.data,
      status: JobStatus.PENDING,
      priority: jobConfig.priority || this.config.defaultPriority!,
      createdAt: new Date(),
      retries: 0,
      maxRetries: jobConfig.retries || this.config.defaultRetries!,
      tags: jobConfig.tags || [],
      metadata: jobConfig.metadata || {}
    };

    // Add delay if specified
    if (jobConfig.delay) {
      setTimeout(() => {
        this.addToPendingQueue(job);
      }, jobConfig.delay);
    } else {
      this.addToPendingQueue(job);
    }

    this.jobs.set(job.id, job);
    this.stats.pending++;
    
    logger.info(`Job added to queue: ${job.id}`, {
      queue: this.name,
      jobName: job.name,
      priority: job.priority
    });

    return job;
  }

  /**
   * Register a job processor
   */
  process(jobName: string, processor: JobProcessor): void {
    this.processors.set(jobName, processor);
    logger.info(`Job processor registered: ${jobName}`, { queue: this.name });
  }

  /**
   * Set event handlers
   */
  on(handlers: JobEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getJobs(status?: JobStatus): Job[] {
    const jobs = Array.from(this.jobs.values());
    return status ? jobs.filter(job => job.status === status) : jobs;
  }

  /**
   * Cancel a job
   */
  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== JobStatus.PENDING) {
      return false;
    }

    job.status = JobStatus.CANCELLED;
    this.removeFromPendingQueue(job);
    this.stats.pending--;

    logger.info(`Job cancelled: ${jobId}`, { queue: this.name });
    return true;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(olderThan?: number): number {
    const cutoff = olderThan ? Date.now() - olderThan : 0;
    let cleared = 0;

    for (const [id, job] of this.jobs.entries()) {
      if ((job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) &&
          (!cutoff || job.completedAt!.getTime() < cutoff)) {
        this.jobs.delete(id);
        cleared++;
      }
    }

    logger.info(`Cleared ${cleared} completed jobs`, { queue: this.name });
    return cleared;
  }

  /**
   * Add job to pending queue with priority
   */
  private addToPendingQueue(job: Job): void {
    // Insert based on priority (higher priority first)
    const insertIndex = this.pendingJobs.findIndex(pendingJob => 
      pendingJob.priority < job.priority
    );

    if (insertIndex === -1) {
      this.pendingJobs.push(job);
    } else {
      this.pendingJobs.splice(insertIndex, 0, job);
    }
  }

  /**
   * Remove job from pending queue
   */
  private removeFromPendingQueue(job: Job): void {
    const index = this.pendingJobs.findIndex(pendingJob => pendingJob.id === job.id);
    if (index !== -1) {
      this.pendingJobs.splice(index, 1);
    }
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    this.processingTimer = setInterval(() => {
      this.processJobs();
    }, 100); // Check every 100ms
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    if (this.isProcessing || this.runningJobs.size >= this.config.concurrency!) {
      return;
    }

    const job = this.pendingJobs.shift();
    if (!job) {
      return;
    }

    this.isProcessing = true;
    this.runningJobs.add(job.id);
    this.stats.pending--;
    this.stats.running++;

    // Process job in background
    this.processJob(job).finally(() => {
      this.runningJobs.delete(job.id);
      this.stats.running--;
      this.isProcessing = false;
    });
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    const startTime = Date.now();
    const processor = this.processors.get(job.name);

    if (!processor) {
      await this.failJob(job, new Error(`No processor found for job: ${job.name}`));
      return;
    }

    try {
      // Update job status
      job.status = JobStatus.RUNNING;
      job.startedAt = new Date();

      // Call event handler
      this.eventHandlers.onStart?.(job);

      // Set timeout if specified
      let timeoutId: NodeJS.Timeout | null = null;
      if (this.config.defaultTimeout) {
        timeoutId = setTimeout(() => {
          this.failJob(job, new Error('Job timeout'));
        }, this.config.defaultTimeout);
      }

      // Execute job
      const result = await processor(job);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Update job status
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      job.result = result;

      // Update statistics
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, true);

      // Call event handler
      this.eventHandlers.onComplete?.(job, result);

      logger.info(`Job completed: ${job.id}`, {
        queue: this.name,
        processingTime,
        result
      });

    } catch (error) {
      await this.handleJobError(job, error as Error, startTime);
    }
  }

  /**
   * Handle job error
   */
  private async handleJobError(job: Job, error: Error, startTime: number): Promise<void> {
    job.retries++;

    if (job.retries <= job.maxRetries) {
      // Retry job
      job.status = JobStatus.RETRY;
      this.stats.retry++;

      // Call event handler
      this.eventHandlers.onRetry?.(job, error);

      // Schedule retry
      const retryDelay = this.config.defaultRetryDelay! * Math.pow(2, job.retries - 1);
      setTimeout(() => {
        this.addToPendingQueue(job);
        this.stats.pending++;
      }, retryDelay);

      logger.warn(`Job retry scheduled: ${job.id}`, {
        queue: this.name,
        retry: job.retries,
        maxRetries: job.maxRetries,
        retryDelay
      });
    } else {
      // Job failed permanently
      await this.failJob(job, error, startTime);
    }
  }

  /**
   * Mark job as failed
   */
  private async failJob(job: Job, error: Error, startTime?: number): Promise<void> {
    job.status = JobStatus.FAILED;
    job.completedAt = new Date();
    job.error = error.message;

    const processingTime = startTime ? Date.now() - startTime : 0;
    this.updateStats(processingTime, false);

    // Call event handler
    this.eventHandlers.onFail?.(job, error);

    logger.error(`Job failed: ${job.id}`, {
      queue: this.name,
      error: error.message,
      processingTime
    });
  }

  /**
   * Update queue statistics
   */
  private updateStats(processingTime: number, success: boolean): void {
    this.stats.totalProcessed++;
    
    if (success) {
      this.stats.completed++;
    } else {
      this.stats.failed++;
    }

    // Update average processing time
    const totalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1) + processingTime;
    this.stats.averageProcessingTime = totalTime / this.stats.totalProcessed;

    // Update throughput (jobs per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentJobs = Array.from(this.jobs.values()).filter(job => 
      job.completedAt && job.completedAt.getTime() > oneMinuteAgo
    );
    this.stats.throughput = recentJobs.length;

    // Record metrics
    if (this.config.enableMetrics) {
      monitoring.recordDatabaseOperation('JOB_PROCESSING', this.name, processingTime, success);
    }
  }

  /**
   * Stop processing jobs
   */
  stop(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    this.isProcessing = false;
  }

  /**
   * Destroy queue and cleanup
   */
  destroy(): void {
    this.stop();
    this.jobs.clear();
    this.pendingJobs = [];
    this.runningJobs.clear();
    this.processors.clear();
  }
}

/**
 * Redis-based job queue implementation
 */
export class RedisQueue {
  private name: string;
  private config: QueueConfig;
  private redis: any;
  private isConnected: boolean = false;
  private processors: Map<string, JobProcessor> = new Map();
  private eventHandlers: JobEventHandlers = {};
  private isProcessing: boolean = false;
  private processingTimer: NodeJS.Timeout | null = null;

  constructor(config: QueueConfig) {
    this.name = config.name;
    this.config = {
      concurrency: 1,
      defaultPriority: JobPriority.NORMAL,
      defaultRetries: 3,
      defaultRetryDelay: 5000,
      defaultTimeout: 30000,
      enableMetrics: true,
      ...config
    };

    if (config.redisUrl) {
      this.connect();
    }
  }

  /**
   * Connect to Redis
   */
  private async connect(): Promise<void> {
    try {
      const { createClient } = await import('redis');
      
      this.redis = createClient({
        url: this.config.redisUrl,
        ...this.config.redisOptions
      });

      this.redis.on('error', (err: Error) => {
        logger.error('Redis queue connection error', { error: err.message });
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis queue connected successfully');
        this.isConnected = true;
        this.startProcessing();
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis queue', { error });
      this.isConnected = false;
    }
  }

  /**
   * Add a job to the queue
   */
  async add(jobConfig: JobConfig): Promise<Job> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const job: Job = {
      id: jobConfig.id,
      name: jobConfig.name,
      data: jobConfig.data,
      status: JobStatus.PENDING,
      priority: jobConfig.priority || this.config.defaultPriority!,
      createdAt: new Date(),
      retries: 0,
      maxRetries: jobConfig.retries || this.config.defaultRetries!,
      tags: jobConfig.tags || [],
      metadata: jobConfig.metadata || {}
    };

    const jobData = JSON.stringify(job);
    const key = `queue:${this.name}:jobs:${job.id}`;
    const pendingKey = `queue:${this.name}:pending`;
    const score = job.priority * 1000000 + Date.now(); // Priority + timestamp

    try {
      // Store job data
      await this.redis.set(key, jobData);
      
      // Add to pending queue with priority
      await this.redis.zadd(pendingKey, score, job.id);

      logger.info(`Job added to Redis queue: ${job.id}`, {
        queue: this.name,
        jobName: job.name,
        priority: job.priority
      });

      return job;
    } catch (error) {
      logger.error('Failed to add job to Redis queue', { error });
      throw error;
    }
  }

  /**
   * Register a job processor
   */
  process(jobName: string, processor: JobProcessor): void {
    this.processors.set(jobName, processor);
    logger.info(`Job processor registered: ${jobName}`, { queue: this.name });
  }

  /**
   * Set event handlers
   */
  on(handlers: JobEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const key = `queue:${this.name}:jobs:${jobId}`;
      const jobData = await this.redis.get(key);
      return jobData ? JSON.parse(jobData) : null;
    } catch (error) {
      logger.error('Failed to get job from Redis', { error });
      return null;
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    if (!this.isConnected) {
      return {
        name: this.name,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
        retry: 0,
        totalProcessed: 0,
        averageProcessingTime: 0,
        throughput: 0
      };
    }

    try {
      const pendingKey = `queue:${this.name}:pending`;
      const runningKey = `queue:${this.name}:running`;
      const completedKey = `queue:${this.name}:completed`;
      const failedKey = `queue:${this.name}:failed`;

      const [pending, running, completed, failed] = await Promise.all([
        this.redis.zcard(pendingKey),
        this.redis.scard(runningKey),
        this.redis.zcard(completedKey),
        this.redis.zcard(failedKey)
      ]);

      return {
        name: this.name,
        pending: pending || 0,
        running: running || 0,
        completed: completed || 0,
        failed: failed || 0,
        retry: 0, // Would need additional tracking
        totalProcessed: (completed || 0) + (failed || 0),
        averageProcessingTime: 0, // Would need additional tracking
        throughput: 0 // Would need additional tracking
      };
    } catch (error) {
      logger.error('Failed to get Redis queue stats', { error });
      return {
        name: this.name,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
        retry: 0,
        totalProcessed: 0,
        averageProcessingTime: 0,
        throughput: 0
      };
    }
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    this.processingTimer = setInterval(() => {
      this.processJobs();
    }, 1000); // Check every second
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    if (!this.isConnected || this.isProcessing) {
      return;
    }

    try {
      const pendingKey = `queue:${this.name}:pending`;
      const runningKey = `queue:${this.name}:running`;

      // Get current running count
      const runningCount = await this.redis.scard(runningKey);
      if (runningCount >= this.config.concurrency!) {
        return;
      }

      // Get next job with highest priority
      const jobIds = await this.redis.zrange(pendingKey, 0, 0);
      if (jobIds.length === 0) {
        return;
      }

      const jobId = jobIds[0];
      const job = await this.getJob(jobId);
      if (!job) {
        return;
      }

      this.isProcessing = true;

      // Move job to running set
      await Promise.all([
        this.redis.zrem(pendingKey, jobId),
        this.redis.sadd(runningKey, jobId)
      ]);

      // Process job in background
      this.processJob(job).finally(() => {
        this.isProcessing = false;
      });

    } catch (error) {
      logger.error('Error processing Redis queue jobs', { error });
      this.isProcessing = false;
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    const startTime = Date.now();
    const processor = this.processors.get(job.name);

    if (!processor) {
      await this.failJob(job, new Error(`No processor found for job: ${job.name}`));
      return;
    }

    try {
      // Update job status
      job.status = JobStatus.RUNNING;
      job.startedAt = new Date();
      await this.updateJob(job);

      // Call event handler
      this.eventHandlers.onStart?.(job);

      // Execute job
      const result = await processor(job);

      // Update job status
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      job.result = result;
      await this.completeJob(job);

      // Call event handler
      this.eventHandlers.onComplete?.(job, result);

      logger.info(`Redis job completed: ${job.id}`, {
        queue: this.name,
        processingTime: Date.now() - startTime
      });

    } catch (error) {
      await this.handleJobError(job, error as Error, startTime);
    }
  }

  /**
   * Handle job error
   */
  private async handleJobError(job: Job, error: Error, startTime: number): Promise<void> {
    job.retries++;

    if (job.retries <= job.maxRetries) {
      // Retry job
      job.status = JobStatus.RETRY;
      await this.retryJob(job, error);
    } else {
      // Job failed permanently
      await this.failJob(job, error, startTime);
    }
  }

  /**
   * Update job in Redis
   */
  private async updateJob(job: Job): Promise<void> {
    const key = `queue:${this.name}:jobs:${job.id}`;
    await this.redis.set(key, JSON.stringify(job));
  }

  /**
   * Complete job
   */
  private async completeJob(job: Job): Promise<void> {
    const runningKey = `queue:${this.name}:running`;
    const completedKey = `queue:${this.name}:completed`;
    
    await Promise.all([
      this.redis.srem(runningKey, job.id),
      this.redis.zadd(completedKey, Date.now(), job.id),
      this.updateJob(job)
    ]);
  }

  /**
   * Retry job
   */
  private async retryJob(job: Job, error: Error): Promise<void> {
    const runningKey = `queue:${this.name}:running`;
    const pendingKey = `queue:${this.name}:pending`;
    
    const retryDelay = this.config.defaultRetryDelay! * Math.pow(2, job.retries - 1);
    const score = job.priority * 1000000 + (Date.now() + retryDelay);

    await Promise.all([
      this.redis.srem(runningKey, job.id),
      this.redis.zadd(pendingKey, score, job.id),
      this.updateJob(job)
    ]);

    this.eventHandlers.onRetry?.(job, error);

    logger.warn(`Redis job retry scheduled: ${job.id}`, {
      queue: this.name,
      retry: job.retries,
      retryDelay
    });
  }

  /**
   * Fail job
   */
  private async failJob(job: Job, error: Error, startTime?: number): Promise<void> {
    job.status = JobStatus.FAILED;
    job.completedAt = new Date();
    job.error = error.message;

    const runningKey = `queue:${this.name}:running`;
    const failedKey = `queue:${this.name}:failed`;
    
    await Promise.all([
      this.redis.srem(runningKey, job.id),
      this.redis.zadd(failedKey, Date.now(), job.id),
      this.updateJob(job)
    ]);

    this.eventHandlers.onFail?.(job, error);

    logger.error(`Redis job failed: ${job.id}`, {
      queue: this.name,
      error: error.message,
      processingTime: startTime ? Date.now() - startTime : 0
    });
  }

  /**
   * Stop processing jobs
   */
  stop(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    this.isProcessing = false;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    this.stop();
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }
}

/**
 * Job scheduler for delayed and recurring jobs
 */
export class JobScheduler {
  private queues: Map<string, MemoryQueue | RedisQueue> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a queue
   */
  registerQueue(name: string, queue: MemoryQueue | RedisQueue): void {
    this.queues.set(name, queue);
  }

  /**
   * Schedule a job to run at a specific time
   */
  schedule(
    queueName: string,
    jobConfig: JobConfig,
    runAt: Date
  ): string {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const delay = runAt.getTime() - Date.now();
    if (delay <= 0) {
      throw new Error('Schedule time must be in the future');
    }

    const timeoutId = setTimeout(async () => {
      await queue.add(jobConfig);
      this.scheduledJobs.delete(jobConfig.id);
    }, delay);

    this.scheduledJobs.set(jobConfig.id, timeoutId);

    logger.info(`Job scheduled: ${jobConfig.id}`, {
      queue: queueName,
      runAt: runAt.toISOString()
    });

    return jobConfig.id;
  }

  /**
   * Schedule a recurring job
   */
  scheduleRecurring(
    queueName: string,
    jobConfig: JobConfig,
    interval: number, // milliseconds
    startAt?: Date
  ): string {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const startTime = startAt || new Date();
    const delay = startTime.getTime() - Date.now();

    const timeoutId = setTimeout(async () => {
      await queue.add(jobConfig);
      
      // Schedule next occurrence
      this.scheduleRecurring(queueName, jobConfig, interval);
    }, Math.max(0, delay));

    this.scheduledJobs.set(jobConfig.id, timeoutId);

    logger.info(`Recurring job scheduled: ${jobConfig.id}`, {
      queue: queueName,
      interval,
      startAt: startTime.toISOString()
    });

    return jobConfig.id;
  }

  /**
   * Cancel a scheduled job
   */
  cancelScheduled(jobId: string): boolean {
    const timeoutId = this.scheduledJobs.get(jobId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledJobs.delete(jobId);
      logger.info(`Scheduled job cancelled: ${jobId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all scheduled job IDs
   */
  getScheduledJobs(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  /**
   * Clear all scheduled jobs
   */
  clearScheduledJobs(): void {
    for (const timeoutId of this.scheduledJobs.values()) {
      clearTimeout(timeoutId);
    }
    this.scheduledJobs.clear();
    logger.info('All scheduled jobs cleared');
  }
}

/**
 * Global queue manager
 */
export const queueManager = {
  queues: new Map<string, MemoryQueue | RedisQueue>(),
  scheduler: new JobScheduler(),

  /**
   * Create a memory queue
   */
  createMemoryQueue(config: QueueConfig): MemoryQueue {
    const queue = new MemoryQueue(config);
    this.queues.set(config.name, queue);
    this.scheduler.registerQueue(config.name, queue);
    return queue;
  },

  /**
   * Create a Redis queue
   */
  createRedisQueue(config: QueueConfig): RedisQueue {
    const queue = new RedisQueue(config);
    this.queues.set(config.name, queue);
    this.scheduler.registerQueue(config.name, queue);
    return queue;
  },

  /**
   * Get a queue by name
   */
  getQueue(name: string): MemoryQueue | RedisQueue | undefined {
    return this.queues.get(name);
  },

  /**
   * Get all queue statistics
   */
  async getAllStats(): Promise<Record<string, QueueStats>> {
    const stats: Record<string, QueueStats> = {};
    
    for (const [name, queue] of this.queues.entries()) {
      if (queue instanceof MemoryQueue) {
        stats[name] = queue.getStats();
      } else if (queue instanceof RedisQueue) {
        stats[name] = await queue.getStats();
      }
    }

    return stats;
  },

  /**
   * Stop all queues
   */
  stopAll(): void {
    for (const queue of this.queues.values()) {
      if (queue instanceof MemoryQueue) {
        queue.stop();
      } else if (queue instanceof RedisQueue) {
        queue.stop();
      }
    }
  },

  /**
   * Destroy all queues
   */
  async destroyAll(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      if (queue instanceof MemoryQueue) {
        queue.destroy();
      } else if (queue instanceof RedisQueue) {
        await queue.disconnect();
      }
      logger.info(`Queue destroyed: ${name}`);
    }
    this.queues.clear();
  }
}; 