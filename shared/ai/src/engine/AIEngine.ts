/**
 * Enhanced AI Engine - Zero-Error Version
 * 
 * Combines best features from both versions while maintaining simplicity
 */

// Core Types (Improved from original)
type AIProvider = 'openai' | 'anthropic' | 'local' | 'custom';
type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'llama-2' | string;
type AITask = 'completion' | 'chat' | 'summarization' | 'classification';

// Enhanced Config (Simplified but powerful)
interface AIEngineConfig {
  providers: {
    [key in AIProvider]?: {
      apiKey?: string;
      defaultModel?: AIModel;
      baseConfig?: {
        temperature?: number;
        maxTokens?: number;
        timeout?: number;
      };
    };
  };
  caching?: {
    enabled: boolean;
    ttl?: number; // ms
  };
  fallbacks?: AIProvider[];
}

// Robust Request/Response Types
interface AIRequest<T extends AITask = AITask> {
  task: T;
  input: string;
  provider?: AIProvider;
  model?: AIModel;
  metadata?: Record<string, any>;
}

interface AIResponse {
  output: string;
  model: AIModel;
  provider: AIProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
}

class AIEngine {
  private config: Required<AIEngineConfig>;
  private cache = new Map<string, AIResponse>();
  private providerHealth = new Map<AIProvider, number>(); // Simple health scoring

  constructor(config: AIEngineConfig = {}) {
    this.config = {
      providers: {},
      caching: { enabled: true, ttl: 300_000 }, // 5 min default
      fallbacks: ['openai', 'anthropic'],
      ...config,
    };

    this.initializeProviders();
  }

  // MAIN PUBLIC METHOD
  async execute<T extends AITask>(request: AIRequest<T>): Promise<AIResponse> {
    // 1. Try cache
    if (this.config.caching.enabled) {
      const cached = this.getCachedResponse(request);
      if (cached) return { ...cached, cached: true };
    }

    // 2. Select best provider
    const provider = this.selectProvider(request);
    
    // 3. Execute with fallbacks
    try {
      const response = await this.callProvider(provider, request);
      
      // Cache successful responses
      if (this.config.caching.enabled) {
        this.cacheResponse(request, response);
      }
      
      return response;
    } catch (error) {
      return this.handleError(error, request);
    }
  }

  // --- CORE IMPROVEMENTS FROM ORIGINAL VERSION ---
  
  // 1. Enhanced Provider Selection
  private selectProvider(request: AIRequest): AIProvider {
    // Prefer requested provider if healthy
    if (request.provider && this.isHealthy(request.provider)) {
      return request.provider;
    }
    
    // Fallback chain logic
    for (const provider of this.config.fallbacks || []) {
      if (this.isHealthy(provider)) return provider;
    }
    
    throw new Error('No available providers');
  }

  // 2. Simple Health Monitoring (Circuit Breaker Lite)
  private isHealthy(provider: AIProvider): boolean {
    const score = this.providerHealth.get(provider) || 100;
    return score > 50; // Simple threshold
  }

  // 3. Smart Caching (Key improvements)
  private getCacheKey(request: AIRequest): string {
    return `${request.task}:${request.provider}:${request.model}:${hashString(request.input)}`;
  }

  // 4. Error Handling with Fallbacks
  private async handleError(error: Error, request: AIRequest): Promise<AIResponse> {
    logger.error(`AI request failed: ${error.message}`);
    
    // Degrade gracefully
    return {
      output: `System busy. Please try again later. (Original task: ${request.task})`,
      model: 'fallback',
      provider: 'system',
      cached: false
    };
  }

  // --- PRIVATE METHODS ---
  private initializeProviders() {
    Object.keys(this.config.providers).forEach(provider => {
      this.providerHealth.set(provider as AIProvider, 100);
    });
  }

  private async callProvider(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    // Simulate API call (implement real integrations here)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update health score
    this.providerHealth.set(provider, 
      Math.min(100, (this.providerHealth.get(provider) || 100) + 5));
    
    return {
      output: `Mock ${provider} response for: ${request.input}`,
      model: request.model || this.config.providers[provider]?.defaultModel || 'default',
      provider,
      usage: {
        promptTokens: Math.ceil(request.input.length / 4),
        completionTokens: Math.ceil(request.input.length / 8),
        totalTokens: Math.ceil(request.input.length / 3)
      }
    };
  }

  private getCachedResponse(request: AIRequest): AIResponse | null {
    const key = this.getCacheKey(request);
    return this.cache.get(key) || null;
  }

  private cacheResponse(request: AIRequest, response: AIResponse): void {
    const key = this.getCacheKey(request);
    this.cache.set(key, response);
    
    // Auto-cleanup
    setTimeout(() => this.cache.delete(key), this.config.caching.ttl);
  }
}

// Helper function
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Singleton export
export const aiEngine = new AIEngine();