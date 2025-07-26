/**
 * 🧠 AI-BOS Ollama Integration
 * Local AI inference with Ollama models
 */

import { logger } from '@aibos/shared-infrastructure/logging';

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
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

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    num_predict?: number;
    stop?: string[];
  };
}

export interface OllamaEmbedding {
  embedding: number[];
}

class OllamaIntegration {
  private baseUrl: string;
  private isConnected: boolean = false;
  private availableModels: OllamaModel[] = [];
  private connectionTimeout: number = 5000;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      await this.checkConnection();
      await this.loadAvailableModels();
      this.isConnected = true;
      logger.info('Ollama connection established', {
        module: 'ollama-integration',
        baseUrl: this.baseUrl,
        modelsCount: this.availableModels.length
      });
    } catch (error) {
      logger.warn('Ollama not available, using fallback', {
        module: 'ollama-integration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.isConnected = false;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.connectionTimeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      logger.error('Ollama connection check failed', {
        module: 'ollama-integration',
        baseUrl: this.baseUrl
      }, error as Error);
      return false;
    }
  }

  async loadAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.connectionTimeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.availableModels = data.models || [];

      logger.info('Ollama models loaded', {
        module: 'ollama-integration',
        modelsCount: this.availableModels.length,
        models: this.availableModels.map(m => m.name)
      });

      return this.availableModels;
    } catch (error) {
      logger.error('Failed to load Ollama models', {
        module: 'ollama-integration'
      }, error as Error);
      return [];
    }
  }

  async generateText(request: OllamaRequest): Promise<OllamaResponse> {
    if (!this.isConnected) {
      throw new Error('Ollama not connected');
    }

    const timer = logger.time('ollama_generation', {
      module: 'ollama-integration',
      model: request.model
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();

      timer();
      logger.aiPrediction('ollama_generation', 0.9, {
        module: 'ollama-integration',
        model: request.model,
        responseLength: data.response.length,
        duration: data.total_duration
      });

      return data;
    } catch (error) {
      logger.error('Ollama text generation failed', {
        module: 'ollama-integration',
        model: request.model,
        prompt: request.prompt.substring(0, 100)
      }, error as Error);
      throw error;
    }
  }

  async generateEmbedding(text: string, model: string = 'llama2'): Promise<OllamaEmbedding> {
    if (!this.isConnected) {
      throw new Error('Ollama not connected');
    }

    const timer = logger.time('ollama_embedding', {
      module: 'ollama-integration',
      model
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: text }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OllamaEmbedding = await response.json();

      timer();
      logger.performance('embedding_dimensions', data.embedding.length, 'dimensions', {
        module: 'ollama-integration',
        model
      });

      return data;
    } catch (error) {
      logger.error('Ollama embedding generation failed', {
        module: 'ollama-integration',
        model,
        textLength: text.length
      }, error as Error);
      throw error;
    }
  }

  async streamText(request: OllamaRequest): Promise<ReadableStream<OllamaResponse>> {
    if (!this.isConnected) {
      throw new Error('Ollama not connected');
    }

    const streamRequest = { ...request, stream: true };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamRequest),
        signal: AbortSignal.timeout(60000) // 60 second timeout for streaming
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      logger.info('Ollama streaming started', {
        module: 'ollama-integration',
        model: request.model
      });

      return response.body;
    } catch (error) {
      logger.error('Ollama streaming failed', {
        module: 'ollama-integration',
        model: request.model
      }, error as Error);
      throw error;
    }
  }

  async pullModel(modelName: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Ollama not connected');
    }

    logger.info('Pulling Ollama model', {
      module: 'ollama-integration',
      model: modelName
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
        signal: AbortSignal.timeout(300000) // 5 minute timeout for model download
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Stream the response to track progress
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.status === 'success') {
                logger.info('Ollama model pulled successfully', {
                  module: 'ollama-integration',
                  model: modelName
                });
                return;
              }
            } catch (e) {
              // Ignore parsing errors for progress updates
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to pull Ollama model', {
        module: 'ollama-integration',
        model: modelName
      }, error as Error);
      throw error;
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Ollama not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Ollama model deleted', {
        module: 'ollama-integration',
        model: modelName
      });
    } catch (error) {
      logger.error('Failed to delete Ollama model', {
        module: 'ollama-integration',
        model: modelName
      }, error as Error);
      throw error;
    }
  }

  getAvailableModels(): OllamaModel[] {
    return this.availableModels;
  }

  isModelAvailable(modelName: string): boolean {
    return this.availableModels.some(model => model.name === modelName);
  }

  getConnectionStatus(): { connected: boolean; modelsCount: number; baseUrl: string } {
    return {
      connected: this.isConnected,
      modelsCount: this.availableModels.length,
      baseUrl: this.baseUrl
    };
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    const connected = await this.checkConnection();

    return {
      status: connected ? 'healthy' : 'unhealthy',
      details: {
        connected,
        baseUrl: this.baseUrl,
        modelsCount: this.availableModels.length,
        availableModels: this.availableModels.map(m => m.name)
      }
    };
  }
}

// Singleton instance
export const ollamaIntegration = new OllamaIntegration();
export default ollamaIntegration;
