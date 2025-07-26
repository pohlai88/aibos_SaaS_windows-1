// ==================== AI-BOS OLLAMA CONNECTOR ====================
// Enterprise-Grade Ollama Integration for AI-BOS Platform
// Production Ready - Zero Dependencies
// Steve Jobs Philosophy: "Simplicity is the ultimate sophistication."

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { ollamaCache } from './OllamaCache';
import { securityEngine } from './SecurityEngine';

// ==================== CORE TYPES ====================
export interface OllamaConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  enableStreaming?: boolean;
  healthCheckInterval?: number;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    num_predict?: number;
    stop?: string[];
    tfs_z?: number;
    typical_p?: number;
    mirostat?: number;
    mirostat_tau?: number;
    mirostat_eta?: number;
    num_ctx?: number;
    num_gpu?: number;
    num_thread?: number;
    repeat_last_n?: number;
    rope_frequency_base?: number;
    rope_frequency_scale?: number;
    mul_mat_q?: boolean;
    f16_kv?: boolean;
    logits_all?: boolean;
    vocab_only?: boolean;
    use_mmap?: boolean;
    use_mlock?: boolean;
    embedding_only?: boolean;
    penalize_newline?: boolean;
    numa?: boolean;
    num_batch?: number;
    num_gqa?: number;
    main_gpu?: number;
    low_vram?: boolean;
    num_draft?: number;
    chunk_size?: number;
    num_parallel?: number;
    cache_prompt?: boolean;
    cache_prompt_batch_num?: number;
    num_ctx_predict?: number;
    hotswap?: boolean;
    lora_adapter?: string;
    lora_base?: string;
    num_keep?: number;
  };
  stream?: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  models: OllamaModel[];
  system: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  uptime: number;
  lastCheck: Date;
}

// ==================== ENTERPRISE CONNECTOR ====================
export class OllamaConnector extends EventEmitter {
  private config: Required<OllamaConfig>;
  private healthStatus: OllamaHealth;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private lastHealthCheck: number = 0;

  constructor(config: OllamaConfig = {}) {
    super();

    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:11434',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      defaultModel: config.defaultModel || 'llama3:8b',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      enableStreaming: config.enableStreaming || false,
      healthCheckInterval: config.healthCheckInterval || 30000
    };

    this.healthStatus = {
      status: 'unhealthy',
      models: [],
      system: { cpu: 0, memory: 0 },
      uptime: 0,
      lastCheck: new Date()
    };

    this.initializeHealthMonitoring();
    console.log('🤖 AI-BOS Ollama Connector: Initialized');
  }

  // ==================== CORE METHODS ====================

    /**
   * Generate text using Ollama with intelligent caching and security
   */
  async generateText(prompt: string, options: Partial<OllamaRequest> = {}, userId?: string, ipAddress?: string): Promise<string> {
    const requestId = uuidv4();
    const startTime = Date.now();

    try {
      console.log(`🚀 Ollama generation started [${requestId}]`);

      // Perform security check
      const securityCheck = await securityEngine.performSecurityCheck(
        prompt,
        options.model || this.config.defaultModel,
        userId,
        ipAddress
      );

      if (!securityCheck.allowed) {
        console.log(`🛡️ Security check failed [${requestId}]: ${securityCheck.events.map(e => e.type).join(', ')}`);

        this.emit('generation:blocked', {
          requestId,
          reason: 'security_check_failed',
          events: securityCheck.events,
          securityScore: securityCheck.securityScore
        });

        throw new Error(`Request blocked by security: ${securityCheck.events.map(e => e.type).join(', ')}`);
      }

      // Use sanitized prompt
      const sanitizedPrompt = securityCheck.sanitizedPrompt;

      // Check cache first
      const cachedResponse = await ollamaCache.getCachedResponse(
        sanitizedPrompt,
        options.model || this.config.defaultModel,
        options.options || {}
      );

      if (cachedResponse) {
        const duration = Date.now() - startTime;
        console.log(`🎯 Cache HIT: Returning cached response [${requestId}] in ${duration}ms`);

        this.emit('generation:cached', {
          requestId,
          model: cachedResponse.model,
          duration,
          confidence: cachedResponse.confidence,
          securityScore: securityCheck.securityScore
        });

        return cachedResponse.content;
      }

      // Ensure health check
      await this.ensureHealthy();

      const request: OllamaRequest = {
        model: options.model || this.config.defaultModel,
        prompt: sanitizedPrompt,
        ...(options.system && { system: options.system }),
        ...(options.template && { template: options.template }),
        ...(options.context && { context: options.context }),
        options: {
          temperature: options.options?.temperature || this.config.temperature,
          num_predict: options.options?.num_predict || this.config.maxTokens,
          ...options.options
        },
        stream: options.stream || this.config.enableStreaming
      };

      const response = await this.makeRequest('/api/generate', request, requestId);

      const duration = Date.now() - startTime;
      console.log(`✅ Ollama generation completed [${requestId}] in ${duration}ms`);

      // Cache the response
      await ollamaCache.cacheResponse(
        prompt,
        request.model,
        options.options || {},
        {
          content: response.response,
          usage: {
            promptTokens: response.prompt_eval_count || 0,
            completionTokens: response.eval_count || 0,
            totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
          },
          processingTime: duration
        }
      );

      this.emit('generation:success', {
        requestId,
        model: request.model,
        duration,
        tokens: response.eval_count || 0,
        cached: false
      });

      return response.response;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Ollama generation failed [${requestId}] after ${duration}ms:`, error);

      this.emit('generation:error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      throw new Error(`Ollama generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate text with streaming support
   */
  async *generateTextStream(prompt: string, options: Partial<OllamaRequest> = {}): AsyncGenerator<string> {
    const requestId = uuidv4();
    const startTime = Date.now();

    try {
      console.log(`🌊 Ollama streaming started [${requestId}]`);

      await this.ensureHealthy();

      const request: OllamaRequest = {
        model: options.model || this.config.defaultModel,
        prompt,
        ...(options.system && { system: options.system }),
        ...(options.template && { template: options.template }),
        ...(options.context && { context: options.context }),
        options: {
          temperature: options.options?.temperature || this.config.temperature,
          num_predict: options.options?.num_predict || this.config.maxTokens,
          ...options.options
        },
        stream: true
      };

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available for streaming');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }
              if (data.done) {
                const duration = Date.now() - startTime;
                console.log(`✅ Ollama streaming completed [${requestId}] in ${duration}ms`);
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming response:', parseError);
            }
          }
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Ollama streaming failed [${requestId}] after ${duration}ms:`, error);
      throw new Error(`Ollama streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.makeGetRequest('/api/tags', 'list-models');
      return response.models || [];
    } catch (error) {
      console.error('❌ Failed to list models:', error);
      throw new Error(`Failed to list models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pull a model
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      console.log(`📥 Pulling model: ${modelName}`);
      await this.makeRequest('/api/pull', { name: modelName }, 'pull-model');
      console.log(`✅ Model pulled successfully: ${modelName}`);
    } catch (error) {
      console.error(`❌ Failed to pull model ${modelName}:`, error);
      throw new Error(`Failed to pull model ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get system health
   */
  async getHealth(): Promise<OllamaHealth> {
    try {
      const now = Date.now();

      // Cache health check for 30 seconds
      if (now - this.lastHealthCheck < 30000) {
        return this.healthStatus;
      }

      // Use GET requests for health check endpoints
      const modelsResponse = await this.makeGetRequest('/api/tags', 'health-models');
      const systemResponse = await this.makeGetRequest('/api/ps', 'health-system');

      this.healthStatus = {
        status: 'healthy',
        models: modelsResponse.models || [],
        system: {
          cpu: systemResponse.cpu || 0,
          memory: systemResponse.memory || 0,
          gpu: systemResponse.gpu
        },
        uptime: systemResponse.uptime || 0,
        lastCheck: new Date()
      };

      this.lastHealthCheck = now;
      this.isConnected = true;
      this.retryCount = 0;

      return this.healthStatus;

    } catch (error) {
      this.healthStatus.status = 'unhealthy';
      this.isConnected = false;
      console.error('❌ Health check failed:', error);
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async makeRequest(endpoint: string, data: any, operation: string): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }

      throw error;
    }
  }

  private async makeGetRequest(endpoint: string, operation: string): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }

      throw error;
    }
  }

  private async ensureHealthy(): Promise<void> {
    if (!this.isConnected || this.healthStatus.status !== 'healthy') {
      await this.getHealth();
    }
  }

  private initializeHealthMonitoring(): void {
    // Initial health check
    this.getHealth().catch(error => {
      console.warn('Initial health check failed:', error);
    });

    // Periodic health monitoring
    setInterval(async () => {
      try {
        await this.getHealth();
      } catch (error) {
        console.warn('Periodic health check failed:', error);
      }
    }, this.config.healthCheckInterval);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get connector status
   */
  getStatus(): { connected: boolean; health: OllamaHealth; config: OllamaConfig } {
    return {
      connected: this.isConnected,
      health: this.healthStatus,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Ollama configuration updated');
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================
export const ollamaConnector = new OllamaConnector();
