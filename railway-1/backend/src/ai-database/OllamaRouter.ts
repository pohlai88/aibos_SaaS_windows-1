// ==================== AI-BOS OLLAMA ROUTER ====================
// Simplified Router for Ollama-Only AI Integration
// Steve Jobs Philosophy: "Simplicity is the ultimate sophistication."

import { OllamaConnector } from './OllamaConnector';

export interface OllamaModelConfig {
  model: string;
  capabilities: string[];
  performance: { speed: number; accuracy: number };
  fallback: string;
}

export interface AIRequest {
  prompt: string;
  taskType: string;
  model?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}

export interface AIResponse {
  content: string;
  model: string;
  latency: number;
  confidence: number;
  metadata: {
    taskType: string;
    modelCapabilities: string[];
    performance: { speed: number; accuracy: number };
    fallbackUsed: boolean;
  };
}

export class OllamaRouter {
  private connector: OllamaConnector;
  private modelRegistry: Map<string, OllamaModelConfig> = new Map();

  constructor() {
    this.connector = new OllamaConnector();
    this.initializeModelRegistry();
  }

  private initializeModelRegistry() {
    // Core model configurations with fallbacks
    this.modelRegistry.set('text-generation', {
      model: 'llama3:8b',
      capabilities: ['general-text', 'summarization', 'translation'],
      performance: { speed: 95, accuracy: 0.85 },
      fallback: 'mistral:7b'
    });

    this.modelRegistry.set('code-generation', {
      model: 'codellama:7b',
      capabilities: ['code-generation', 'code-review', 'debugging'],
      performance: { speed: 90, accuracy: 0.88 },
      fallback: 'wizardcoder:7b'
    });

    this.modelRegistry.set('reasoning', {
      model: 'mistral:7b',
      capabilities: ['analysis', 'reasoning', 'problem-solving'],
      performance: { speed: 92, accuracy: 0.87 },
      fallback: 'llama3:8b'
    });

    this.modelRegistry.set('assistant', {
      model: 'phi3:3.8b',
      capabilities: ['conversation', 'instruction-following'],
      performance: { speed: 98, accuracy: 0.83 },
      fallback: 'llama3:8b'
    });

    this.modelRegistry.set('fast-response', {
      model: 'phi3:3.8b',
      capabilities: ['quick-queries', 'real-time'],
      performance: { speed: 98, accuracy: 0.83 },
      fallback: 'llama3:8b'
    });

    this.modelRegistry.set('schema-analysis', {
      model: 'llama3:8b',
      capabilities: ['database-analysis', 'insights'],
      performance: { speed: 95, accuracy: 0.85 },
      fallback: 'mistral:7b'
    });

    this.modelRegistry.set('security-assessment', {
      model: 'mistral:7b',
      capabilities: ['security-analysis', 'compliance'],
      performance: { speed: 92, accuracy: 0.87 },
      fallback: 'llama3:8b'
    });
  }

  async routeRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const taskType = this.determineTaskType(request.prompt);
    const modelConfig = this.modelRegistry.get(taskType);

    if (!modelConfig) {
      throw new Error(`No suitable model found for task: ${taskType}`);
    }

    let response: string;
    let modelUsed: string = request.model || modelConfig.model;
    let fallbackUsed = false;

    try {
      // Try primary model first
      response = await this.connector.generateText(request.prompt, {
        model: modelUsed,
        options: {
          temperature: request.options?.temperature || 0.7,
          num_predict: request.options?.maxTokens || 1000,
          ...request.options
        }
      });
    } catch (error) {
      console.warn(`Primary model ${modelUsed} failed, trying fallback ${modelConfig.fallback}`);

      // Try fallback model
      try {
        modelUsed = modelConfig.fallback;
        response = await this.connector.generateText(request.prompt, {
          model: modelUsed,
          options: {
            temperature: request.options?.temperature || 0.7,
            num_predict: request.options?.maxTokens || 1000,
            ...request.options
          }
        });
        fallbackUsed = true;
      } catch (fallbackError) {
        throw new Error(`Both primary and fallback models failed for task: ${taskType}`);
      }
    }

    const latency = Date.now() - startTime;

    return {
      content: response,
      model: modelUsed,
      latency,
      confidence: modelConfig.performance.accuracy,
      metadata: {
        taskType,
        modelCapabilities: modelConfig.capabilities,
        performance: modelConfig.performance,
        fallbackUsed
      }
    };
  }

  private determineTaskType(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // Code generation detection
    if (lowerPrompt.includes('code') || lowerPrompt.includes('function') ||
        lowerPrompt.includes('class') || lowerPrompt.includes('generate') ||
        lowerPrompt.includes('implement') || lowerPrompt.includes('create')) {
      return 'code-generation';
    }

    // Schema analysis detection
    if (lowerPrompt.includes('schema') || lowerPrompt.includes('database') ||
        lowerPrompt.includes('table') || lowerPrompt.includes('analyze') ||
        lowerPrompt.includes('structure')) {
      return 'schema-analysis';
    }

    // Security assessment detection
    if (lowerPrompt.includes('security') || lowerPrompt.includes('vulnerability') ||
        lowerPrompt.includes('compliance') || lowerPrompt.includes('audit') ||
        lowerPrompt.includes('threat')) {
      return 'security-assessment';
    }

    // Reasoning detection
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('assess') ||
        lowerPrompt.includes('evaluate') || lowerPrompt.includes('compare') ||
        lowerPrompt.includes('why') || lowerPrompt.includes('how')) {
      return 'reasoning';
    }

    // Assistant detection
    if (lowerPrompt.includes('help') || lowerPrompt.includes('assist') ||
        lowerPrompt.includes('explain') || lowerPrompt.includes('guide') ||
        lowerPrompt.includes('support')) {
      return 'assistant';
    }

    // Fast response detection
    if (lowerPrompt.length < 100 || lowerPrompt.includes('quick') ||
        lowerPrompt.includes('fast') || lowerPrompt.includes('simple')) {
      return 'fast-response';
    }

    // Default to text generation
    return 'text-generation';
  }

  // Get available models
  getAvailableModels(): string[] {
    const models = new Set<string>();
    this.modelRegistry.forEach(config => {
      models.add(config.model);
      models.add(config.fallback);
    });
    return Array.from(models);
  }

  // Get model configuration
  getModelConfig(taskType: string): OllamaModelConfig | undefined {
    return this.modelRegistry.get(taskType);
  }

  // Test model availability
  async testModel(model: string): Promise<boolean> {
    try {
      await this.connector.generateText('test', { model });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================
export const ollamaRouter = new OllamaRouter();
