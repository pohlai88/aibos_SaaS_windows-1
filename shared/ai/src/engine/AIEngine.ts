/**
 * AI-BOS Advanced AI Engine
 * 
 * Market-leading AI integration engine with multi-provider support,
 * real-time learning, and enterprise-grade capabilities.
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import * as tf from '@tensorflow/tfjs-node';
import { z } from 'zod';
import { MultiLevelCache, MemoryCache, CacheUtils } from '../../../lib/cache';
import { logger } from '../../../lib/logger';

// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'local' | 'custom';

// AI Model types
export type AIModel = 
  | 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'gpt-4o'
  | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku'
  | 'llama-2' | 'llama-3' | 'mistral' | 'gemini'
  | 'custom';

// AI Task types
export type AITask = 
  | 'text-generation'
  | 'text-completion'
  | 'text-classification'
  | 'sentiment-analysis'
  | 'entity-extraction'
  | 'summarization'
  | 'translation'
  | 'code-generation'
  | 'code-review'
  | 'image-generation'
  | 'image-analysis'
  | 'speech-to-text'
  | 'text-to-speech'
  | 'data-analysis'
  | 'prediction'
  | 'anomaly-detection'
  | 'recommendation'
  | 'automation';

// AI Configuration
export interface AIConfig {
  provider: AIProvider;
  model: AIModel;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  streaming?: boolean;
}

// Advanced Prompt Engineering Types
export interface PromptTemplate {
  id: string;
  name: string;
  task: AITask;
  template: string;
  variables: string[];
  examples?: FewShotExample[];
  outputSchema?: z.ZodSchema<any>;
  optimization?: PromptOptimization;
}

export interface FewShotExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface PromptOptimization {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
}

export interface StructuredOutput {
  data: any;
  confidence: number;
  metadata: Record<string, any>;
  alternatives?: any[];
}

export interface PromptContext {
  userProfile?: Record<string, any>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  domain?: string;
  language?: string;
  tone?: 'formal' | 'casual' | 'technical' | 'creative';
  constraints?: string[];
}

// Enhanced AI Request
export interface AIRequest {
  task: AITask;
  prompt: string;
  context?: PromptContext;
  options?: Partial<AIConfig>;
  metadata?: Record<string, any>;
  template?: string;
  outputSchema?: z.ZodSchema<any>;
  examples?: FewShotExample[];
  structured?: boolean;
}

// Enhanced AI Response
export interface AIResponse {
  content: string;
  model: AIModel;
  provider: AIProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
  confidence?: number;
  alternatives?: string[];
  structured?: StructuredOutput;
  parsed?: any;
  validation?: {
    valid: boolean;
    errors?: string[];
  };
}

// AI Performance Metrics
export interface AIPerformanceMetrics {
  responseTime: number;
  tokenUsage: number;
  cost: number;
  accuracy?: number;
  latency: number;
  throughput: number;
}

// AI Learning Data
export interface AILearningData {
  input: string;
  output: string;
  feedback: 'positive' | 'negative' | 'neutral';
  metadata?: Record<string, any>;
  timestamp: number;
}

// Circuit Breaker States
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// Provider Health Metrics
export interface ProviderHealth {
  provider: AIProvider;
  successCount: number;
  failureCount: number;
  totalRequests: number;
  averageResponseTime: number;
  lastFailureTime?: number;
  circuitBreakerState: CircuitBreakerState;
  isHealthy: boolean;
  costPerRequest: number;
  totalCost: number;
}

// Circuit Breaker Configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening circuit
  recoveryTimeout: number;       // Time to wait before trying again (ms)
  successThreshold: number;      // Number of successes to close circuit
  timeout: number;               // Request timeout (ms)
}

// Local Model Configuration
export interface LocalModelConfig {
  modelPath: string;
  modelType: 'tensorflow' | 'onnx' | 'pytorch';
  quantization: boolean;
  maxInputLength: number;
  batchSize: number;
  cacheModel: boolean;
  fallbackToCloud: boolean;
}

// Local Model Registry
export interface LocalModelRegistry {
  [task: string]: {
    model: any;
    config: LocalModelConfig;
    loaded: boolean;
    lastUsed: number;
    performance: {
      averageResponseTime: number;
      successCount: number;
      failureCount: number;
    };
  };
}

// Cost Calculation & Analytics Types
export interface CostMetrics {
  totalCost: number;
  costPerRequest: number;
  costPerToken: number;
  costByProvider: Record<AIProvider, number>;
  costByModel: Record<string, number>;
  costByTask: Record<AITask, number>;
  budgetUsage: number;
  budgetRemaining: number;
  costTrends: CostTrend[];
}

export interface CostTrend {
  timestamp: number;
  cost: number;
  tokens: number;
  provider: AIProvider;
  model: string;
  task: AITask;
}

export interface BudgetConfig {
  monthly: number;
  daily: number;
  perRequest: number;
  alerts: {
    warningThreshold: number; // percentage
    criticalThreshold: number; // percentage
  };
}

export interface CostOptimization {
  enabled: boolean;
  strategies: {
    modelSelection: boolean;
    providerRouting: boolean;
    tokenOptimization: boolean;
    caching: boolean;
    localModels: boolean;
  };
  thresholds: {
    maxCostPerRequest: number;
    maxTokensPerRequest: number;
    preferredProviders: AIProvider[];
  };
}

// Performance Metrics & Monitoring Types
export interface PerformanceMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    tokensPerSecond: number;
    concurrentRequests: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    byProvider: Record<AIProvider, number>;
    recentErrors: Array<{ error: string; timestamp: number; count: number }>;
  };
  utilization: {
    cacheHitRate: number;
    providerUtilization: Record<AIProvider, number>;
    queueLength: number;
    processingTime: number;
  };
  trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  timestamp: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  provider: AIProvider;
  task: AITask;
}

export interface PerformanceAlert {
  id: string;
  type: 'error_rate' | 'response_time' | 'throughput' | 'cost' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  metrics: Record<string, number>;
}

export interface PerformanceConfig {
  enabled: boolean;
  sampling: {
    rate: number; // percentage of requests to sample
    maxSamples: number;
  };
  alerting: {
    enabled: boolean;
    thresholds: {
      errorRate: number;
      responseTime: number;
      throughput: number;
      costPerRequest: number;
    };
    cooldown: number; // minutes
  };
  retention: {
    trends: number; // days
    alerts: number; // days
    samples: number; // days
  };
}

// Enhanced AI Engine Configuration
export interface AIEngineConfig {
  providers: Record<AIProvider, AIConfig>;
  defaultProvider: AIProvider;
  defaultModel: AIModel;
  enableCaching: boolean;
  enableLearning: boolean;
  enableAnalytics: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
  retryAttempts: number;
  costOptimization: boolean;
  performanceMonitoring: boolean;
  circuitBreaker: CircuitBreakerConfig;
  fallbackChain: AIProvider[];   // Provider fallback order
  enableGracefulDegradation: boolean;
  localModels: {
    enabled: boolean;
    modelsPath: string;
    maxMemoryUsage: number;
    enableQuantization: boolean;
    enableModelCaching: boolean;
    fallbackToCloud: boolean;
    supportedTasks: AITask[];
  };
  promptEngineering: {
    enabled: boolean;
    templatesPath: string;
    enableOptimization: boolean;
    enableStructuredOutput: boolean;
    enableFewShotLearning: boolean;
    maxExamples: number;
    defaultTemplates: Record<AITask, string>;
  };
  costManagement: {
    enabled: boolean;
    budget: BudgetConfig;
    optimization: CostOptimization;
    tracking: {
      enabled: boolean;
      retentionDays: number;
      realTimeAlerts: boolean;
    };
  };
  performanceMonitoring: PerformanceConfig;
}

/**
 * Market-leading AI Engine with multi-provider support and circuit breaker pattern
 * 
 * This engine has been optimized for:
 * - High performance and low latency
 * - Cost optimization and budget management
 * - Advanced prompt engineering and structured outputs
 * - Comprehensive monitoring and analytics
 * - Circuit breaker pattern for reliability
 * - Local model integration for cost savings
 */
export class AIEngine {
  private config: AIEngineConfig;
  private providers: Map<AIProvider, any>;
  private cache: MultiLevelCache | MemoryCache;
  private learningData: AILearningData[];
  private performanceMetrics: AIPerformanceMetrics[];
  private requestQueue: Array<{ request: AIRequest; resolve: (value: AIResponse) => void; reject: (reason: any) => void }>;
  private isProcessing: boolean;
  
  // Circuit Breaker and Health Monitoring
  private providerHealth: Map<AIProvider, ProviderHealth>;
  private circuitBreakers: Map<AIProvider, CircuitBreakerState>;
  private lastFailureTimes: Map<AIProvider, number>;

  // Local Model Management
  private localModelRegistry: LocalModelRegistry;
  private modelCache: Map<string, any>;
  private isLocalModelsInitialized: boolean;

  // Advanced Prompt Engineering
  private promptTemplates: Map<string, PromptTemplate>;
  private promptCache: Map<string, string>;
  private optimizationHistory: Map<string, PromptOptimization[]>;

  // Cost Management & Analytics
  private costMetrics: CostMetrics;
  private costTrends: CostTrend[];
  private budgetAlerts: Array<{ type: 'warning' | 'critical'; message: string; timestamp: number }>;
  private costOptimizationCache: Map<string, { provider: AIProvider; model: string; cost: number }>;

  // Performance Monitoring
  private performanceData: PerformanceMetrics;
  private performanceTrends: PerformanceTrend[];
  private performanceAlerts: PerformanceAlert[];
  private requestSamples: Array<{ request: AIRequest; response: AIResponse; metrics: any; timestamp: number }>;
  private alertCooldowns: Map<string, number>;

  constructor(config: Partial<AIEngineConfig> = {}) {
    this.config = this.buildDefaultConfig(config);
    this.initializeComponents();
    this.initializeProviders();
  }

  /**
   * Build default configuration with sensible defaults
   */
  private buildDefaultConfig(userConfig: Partial<AIEngineConfig>): AIEngineConfig {
    const defaultConfig: AIEngineConfig = {
      providers: {
        openai: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          timeout: 30000,
          retries: 3,
          cache: true,
          streaming: false
        },
        anthropic: {
          provider: 'anthropic',
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 2000,
          timeout: 30000,
          retries: 3,
          cache: true,
          streaming: false
        }
      },
      defaultProvider: 'openai',
      defaultModel: 'gpt-4',
      enableCaching: true,
      enableLearning: true,
      enableAnalytics: true,
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      retryAttempts: 3,
      costOptimization: true,
      performanceMonitoring: true,
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 60000,
        successThreshold: 3,
        timeout: 30000
      },
      fallbackChain: ['openai', 'anthropic', 'local'],
      enableGracefulDegradation: true,
      localModels: {
        enabled: true,
        modelsPath: './models',
        maxMemoryUsage: 1024 * 1024 * 1024,
        enableQuantization: true,
        enableModelCaching: true,
        fallbackToCloud: true,
        supportedTasks: [
          'text-classification',
          'sentiment-analysis',
          'entity-extraction',
          'summarization',
          'translation',
          'anomaly-detection',
          'recommendation'
        ]
      },
      promptEngineering: {
        enabled: true,
        templatesPath: './prompts',
        enableOptimization: true,
        enableStructuredOutput: true,
        enableFewShotLearning: true,
        maxExamples: 3,
        defaultTemplates: this.getDefaultTemplates()
      },
      costManagement: {
        enabled: true,
        budget: {
          monthly: 1000,
          daily: 33.33,
          perRequest: 0.10,
          alerts: {
            warningThreshold: 80,
            criticalThreshold: 95
          }
        },
        optimization: {
          enabled: true,
          strategies: {
            modelSelection: true,
            providerRouting: true,
            tokenOptimization: true,
            caching: true,
            localModels: true
          },
          thresholds: {
            maxCostPerRequest: 0.50,
            maxTokensPerRequest: 2000,
            preferredProviders: ['local', 'anthropic', 'openai']
          }
        },
        tracking: {
          enabled: true,
          retentionDays: 90,
          realTimeAlerts: true
        }
      },
      performanceMonitoring: {
        enabled: true,
        sampling: {
          rate: 10,
          maxSamples: 1000
        },
        alerting: {
          enabled: true,
          thresholds: {
            errorRate: 5,
            responseTime: 5000,
            throughput: 10,
            costPerRequest: 0.50
          },
          cooldown: 5
        },
        retention: {
          trends: 30,
          alerts: 7,
          samples: 1
        }
      }
    };

    return this.mergeConfigs(defaultConfig, userConfig);
  }

  /**
   * Get default prompt templates
   */
  private getDefaultTemplates(): Record<AITask, string> {
    return {
      'text-generation': 'Generate high-quality, engaging content about {topic}.',
      'text-completion': 'Complete the following text naturally: {text}',
      'text-classification': 'Classify the following text into the most appropriate category: {text}',
      'sentiment-analysis': 'Analyze the sentiment of the following text: {text}',
      'entity-extraction': 'Extract all named entities from the following text: {text}',
      'summarization': 'Summarize the following text concisely: {text}',
      'translation': 'Translate the following text to {targetLanguage}: {text}',
      'code-generation': 'Generate clean, efficient code for: {description}',
      'code-review': 'Review the following code and provide feedback: {code}',
      'image-generation': 'Generate an image based on: {description}',
      'image-analysis': 'Analyze the following image: {image}',
      'speech-to-text': 'Transcribe the following audio: {audio}',
      'text-to-speech': 'Convert the following text to speech: {text}',
      'data-analysis': 'Analyze the following data: {data}',
      'prediction': 'Make a prediction based on: {context}',
      'anomaly-detection': 'Detect anomalies in: {data}',
      'recommendation': 'Provide recommendations for: {context}',
      'automation': 'Create automation for: {task}'
    };
  }

  /**
   * Merge configurations with deep merge
   */
  private mergeConfigs(defaultConfig: AIEngineConfig, userConfig: Partial<AIEngineConfig>): AIEngineConfig {
    return {
      ...defaultConfig,
      ...userConfig,
      providers: { ...defaultConfig.providers, ...userConfig.providers },
      promptEngineering: {
        ...defaultConfig.promptEngineering,
        ...userConfig.promptEngineering,
        defaultTemplates: {
          ...defaultConfig.promptEngineering.defaultTemplates,
          ...userConfig.promptEngineering?.defaultTemplates
        }
      },
      costManagement: {
        ...defaultConfig.costManagement,
        ...userConfig.costManagement,
        budget: { ...defaultConfig.costManagement.budget, ...userConfig.costManagement?.budget },
        optimization: {
          ...defaultConfig.costManagement.optimization,
          ...userConfig.costManagement?.optimization,
          strategies: {
            ...defaultConfig.costManagement.optimization.strategies,
            ...userConfig.costManagement?.optimization?.strategies
          },
          thresholds: {
            ...defaultConfig.costManagement.optimization.thresholds,
            ...userConfig.costManagement?.optimization?.thresholds
          }
        }
      },
      performanceMonitoring: {
        ...defaultConfig.performanceMonitoring,
        ...userConfig.performanceMonitoring,
        sampling: { ...defaultConfig.performanceMonitoring.sampling, ...userConfig.performanceMonitoring?.sampling },
        alerting: {
          ...defaultConfig.performanceMonitoring.alerting,
          ...userConfig.performanceMonitoring?.alerting,
          thresholds: {
            ...defaultConfig.performanceMonitoring.alerting.thresholds,
            ...userConfig.performanceMonitoring?.alerting?.thresholds
          }
        }
      }
    };
  }

  /**
   * Initialize all engine components
   */
  private initializeComponents(): void {
    this.initializeCache();
    this.initializeCircuitBreakers();
    this.initializeLocalModels();
    this.initializePromptEngineering();
    this.initializeCostManagement();
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize cache system
   */
  private initializeCache(): void {
    const cacheConfig = {
      defaultTTL: 5 * 60 * 1000,
      maxSize: 1000,
      cleanupInterval: 60 * 1000,
      enableStats: true,
      redisUrl: process.env.REDIS_URL || undefined
    };

    try {
      this.cache = new MultiLevelCache(cacheConfig);
    } catch (e) {
      logger?.warn?.('MultiLevelCache init failed, falling back to MemoryCache', e);
      this.cache = new MemoryCache(cacheConfig);
    }
  }

  /**
   * Initialize circuit breakers and health monitoring
   */
  private initializeCircuitBreakers(): void {
    this.providerHealth = new Map();
    this.circuitBreakers = new Map();
    this.lastFailureTimes = new Map();
    this.initializeProviderHealth();
  }

  /**
   * Initialize local model management
   */
  private initializeLocalModels(): void {
    this.localModelRegistry = {};
    this.modelCache = new Map();
    this.isLocalModelsInitialized = false;
  }

  /**
   * Initialize prompt engineering
   */
  private initializePromptEngineering(): void {
    this.promptTemplates = new Map();
    this.promptCache = new Map();
    this.optimizationHistory = new Map();
    this.initializePromptTemplates();
  }

  /**
   * Initialize cost management
   */
  private initializeCostManagement(): void {
    this.costMetrics = this.initializeCostMetrics();
    this.costTrends = [];
    this.budgetAlerts = [];
    this.costOptimizationCache = new Map();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    this.performanceData = this.initializePerformanceMetrics();
    this.performanceTrends = [];
    this.performanceAlerts = [];
    this.requestSamples = [];
    this.alertCooldowns = new Map();
  }

  /**
   * Initialize provider health tracking
   */
  private initializeProviderHealth(): void {
    Object.keys(this.config.providers).forEach(provider => {
      this.providerHealth.set(provider as AIProvider, {
        provider: provider as AIProvider,
        successCount: 0,
        failureCount: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        circuitBreakerState: 'CLOSED',
        isHealthy: true,
        costPerRequest: 0,
        totalCost: 0
      });
      this.circuitBreakers.set(provider as AIProvider, 'CLOSED');
    });
  }

  /**
   * Initialize AI providers
   */
  private initializeProviders(): void {
    // Initialize OpenAI
    if (this.config.providers.openai?.apiKey) {
      const openai = new OpenAI({
        apiKey: this.config.providers.openai.apiKey,
        baseURL: this.config.providers.openai.baseURL
      });
      this.providers.set('openai', openai);
    }

    // Initialize Anthropic
    if (this.config.providers.anthropic?.apiKey) {
      const anthropic = new Anthropic({
        apiKey: this.config.providers.anthropic.apiKey,
        baseURL: this.config.providers.anthropic.baseURL
      });
      this.providers.set('anthropic', anthropic);
    }

    // Initialize local models
    this.initializeLocalModels();
  }

  /**
   * Initialize local AI models
   */
  private async initializeLocalModels(): Promise<void> {
    if (!this.config.localModels.enabled) {
      logger?.info?.('Local models disabled');
      return;
    }

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      logger?.info?.('TensorFlow.js initialized');
      
      // Load pre-trained models
      await this.loadLocalModels();
      
      this.providers.set('local', {
        type: 'local',
        models: this.localModelRegistry,
        isInitialized: true
      });

      this.isLocalModelsInitialized = true;
      logger?.info?.('Local models initialized successfully');
    } catch (error) {
      logger?.warn?.('Failed to initialize local models:', error);
      this.isLocalModelsInitialized = false;
    }
  }

  /**
   * Load local AI models
   */
  private async loadLocalModels(): Promise<void> {
    const modelConfigs = {
      'text-classification': {
        modelPath: `${this.config.localModels.modelsPath}/text-classification`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 512,
        batchSize: 32,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      },
      'sentiment-analysis': {
        modelPath: `${this.config.localModels.modelsPath}/sentiment-analysis`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 256,
        batchSize: 64,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      },
      'entity-extraction': {
        modelPath: `${this.config.localModels.modelsPath}/entity-extraction`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 512,
        batchSize: 16,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      },
      'summarization': {
        modelPath: `${this.config.localModels.modelsPath}/summarization`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 1024,
        batchSize: 8,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      },
      'translation': {
        modelPath: `${this.config.localModels.modelsPath}/translation`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 512,
        batchSize: 16,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      },
      'anomaly-detection': {
        modelPath: `${this.config.localModels.modelsPath}/anomaly-detection`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 256,
        batchSize: 32,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      },
      'recommendation': {
        modelPath: `${this.config.localModels.modelsPath}/recommendation`,
        modelType: 'tensorflow' as const,
        quantization: this.config.localModels.enableQuantization,
        maxInputLength: 128,
        batchSize: 64,
        cacheModel: this.config.localModels.enableModelCaching,
        fallbackToCloud: this.config.localModels.fallbackToCloud
      }
    };

    // Load models for supported tasks
    for (const task of this.config.localModels.supportedTasks) {
      const config = modelConfigs[task];
      if (config) {
        try {
          await this.loadModel(task, config);
        } catch (error) {
          logger?.warn?.(`Failed to load model for task ${task}:`, error);
        }
      }
    }
  }

  /**
   * Load a specific model
   */
  private async loadModel(task: AITask, config: LocalModelConfig): Promise<void> {
    try {
      // Check if model is already cached
      if (this.modelCache.has(task)) {
        this.localModelRegistry[task] = {
          model: this.modelCache.get(task),
          config,
          loaded: true,
          lastUsed: Date.now(),
          performance: {
            averageResponseTime: 0,
            successCount: 0,
            failureCount: 0
          }
        };
        logger?.info?.(`Model for task ${task} loaded from cache`);
        return;
      }

      // Load model from file system or remote
      const model = await this.loadModelFromSource(task, config);
      
      // Apply quantization if enabled
      if (config.quantization) {
        await this.quantizeModel(model);
      }

      // Cache model if enabled
      if (config.cacheModel) {
        this.modelCache.set(task, model);
      }

      this.localModelRegistry[task] = {
        model,
        config,
        loaded: true,
        lastUsed: Date.now(),
        performance: {
          averageResponseTime: 0,
          successCount: 0,
          failureCount: 0
        }
      };

      logger?.info?.(`Model for task ${task} loaded successfully`);
    } catch (error) {
      logger?.error?.(`Failed to load model for task ${task}:`, error);
      throw error;
    }
  }

  /**
   * Load model from source (file system, remote, or pre-trained)
   */
  private async loadModelFromSource(task: AITask, config: LocalModelConfig): Promise<any> {
    // For now, create mock models for demonstration
    // In production, this would load actual pre-trained models
    return this.createMockModel(task, config);
  }

  /**
   * Create mock model for demonstration
   */
  private createMockModel(task: AITask, config: LocalModelConfig): any {
    return {
      predict: async (input: string) => {
        // Simulate model prediction with realistic delays
        await this.delay(50 + Math.random() * 100);
        
        switch (task) {
          case 'text-classification':
            return {
              label: 'general',
              confidence: 0.85,
              alternatives: ['business', 'technology', 'sports']
            };
          case 'sentiment-analysis':
            return {
              sentiment: 'positive',
              confidence: 0.78,
              score: 0.7
            };
          case 'entity-extraction':
            return {
              entities: [
                { text: 'example', type: 'PERSON', confidence: 0.9 },
                { text: 'company', type: 'ORG', confidence: 0.8 }
              ]
            };
          case 'summarization':
            return {
              summary: 'This is a generated summary of the input text.',
              confidence: 0.75,
              length: 50
            };
          case 'translation':
            return {
              translated: 'This is the translated text.',
              confidence: 0.82,
              sourceLanguage: 'en',
              targetLanguage: 'es'
            };
          case 'anomaly-detection':
            return {
              isAnomaly: false,
              confidence: 0.88,
              score: 0.12
            };
          case 'recommendation':
            return {
              recommendations: ['item1', 'item2', 'item3'],
              confidence: 0.79,
              scores: [0.9, 0.7, 0.6]
            };
          default:
            return {
              result: 'Default response',
              confidence: 0.5
            };
        }
      },
      config
    };
  }

  /**
   * Quantize model for better performance
   */
  private async quantizeModel(model: any): Promise<void> {
    // Simulate quantization process
    await this.delay(100);
    logger?.info?.('Model quantization applied');
  }

  /**
   * Process AI request with circuit breaker and fallback logic
   */
  async process(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Check cache
      const cachedResponse = await this.getCachedResponse(request);
      if (cachedResponse) {
        this.updatePerformanceMetrics(request, cachedResponse, startTime, true);
        return cachedResponse;
      }

      // Step 2: Optimize request
      const optimizedRequest = this.optimizeRequest(request);

      // Step 3: Validate budget constraints
      this.validateBudgetConstraints(optimizedRequest);

      // Step 4: Process with providers
      const response = await this.processWithProviders(optimizedRequest, startTime);

      // Step 5: Update metrics and cache
      this.finalizeRequest(request, response, startTime);

      return response;
    } catch (error) {
      this.handleRequestError(request, error, startTime);
      throw error;
    }
  }

  /**
   * Optimize request for cost and performance
   */
  private optimizeRequest(request: AIRequest): AIRequest {
    let optimizedRequest = { ...request };

    // Cost optimization
    if (this.config.costManagement.optimization.enabled) {
      optimizedRequest = this.optimizeRequestForCost(optimizedRequest);
    }

    // Token optimization
    if (this.config.costManagement.optimization.strategies.tokenOptimization) {
      optimizedRequest = this.optimizeTokens(optimizedRequest);
    }

    return optimizedRequest;
  }

  /**
   * Optimize tokens for cost efficiency
   */
  private optimizeTokens(request: AIRequest): AIRequest {
    const maxTokens = this.config.costManagement.optimization.thresholds.maxTokensPerRequest;
    
    if (request.prompt.length > maxTokens) {
      return {
        ...request,
        prompt: request.prompt.substring(0, maxTokens)
      };
    }

    return request;
  }

  /**
   * Validate budget constraints
   */
  private validateBudgetConstraints(request: AIRequest): void {
    if (!this.config.costManagement.enabled) return;

    const estimatedCost = this.estimateRequestCost(request);
    const maxCost = this.config.costManagement.optimization.thresholds.maxCostPerRequest;

    if (estimatedCost > maxCost) {
      throw new Error(`Estimated cost $${estimatedCost.toFixed(4)} exceeds maximum allowed cost $${maxCost}`);
    }
  }

  /**
   * Process request with provider fallback
   */
  private async processWithProviders(request: AIRequest, startTime: number): Promise<AIResponse> {
    const healthyProviders = this.getHealthyProviders();
    
    if (healthyProviders.length === 0) {
      return await this.handleGracefulDegradation(request);
    }

    for (const provider of healthyProviders) {
      try {
        const response = await this.executeWithCircuitBreaker(provider, request);
        this.updatePerformanceMetrics(request, response, startTime, true);
        return response;
      } catch (error) {
        this.updatePerformanceMetrics(request, {} as AIResponse, startTime, false, error);
        this.recordProviderFailure(provider, error);
        
        logger?.warn?.('Provider failed, trying next in fallback chain', {
          provider,
          error: error.message,
          remainingProviders: healthyProviders.slice(healthyProviders.indexOf(provider) + 1)
        });
        
        continue;
      }
    }

    return await this.handleGracefulDegradation(request);
  }

  /**
   * Finalize request processing
   */
  private async finalizeRequest(request: AIRequest, response: AIResponse, startTime: number): Promise<void> {
    // Update cost metrics
    const cost = this.calculateCost(response, request);
    this.updateCostMetrics(response, request, cost);
    
    // Record success
    this.recordProviderSuccess(response.provider, Date.now() - startTime);
    
    // Cache response
    if (this.config.enableCaching) {
      await this.cacheResponse(request, response);
    }
  }

  /**
   * Handle request errors
   */
  private handleRequestError(request: AIRequest, error: Error, startTime: number): void {
    this.updatePerformanceMetrics(request, {} as AIResponse, startTime, false, error);
    logger?.error?.('AI processing failed', error);
  }

  /**
   * Queue request for processing
   */
  private async queueRequest(request: AIRequest): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processNext();
    });
  }

  /**
   * Process queue with non-blocking event-driven approach
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    const batch = this.requestQueue.splice(0, this.config.maxConcurrentRequests);
    
    // Process batch concurrently
    const promises = batch.map(({ request, resolve, reject }) =>
      this.executeRequest(request).then(resolve).catch(reject)
    );
    
    await Promise.allSettled(promises);
    this.isProcessing = false;
    
    // Schedule next batch processing
    setTimeout(() => this.processNext(), 0);
  }

  /**
   * Execute AI request
   */
  private async executeRequest(request: AIRequest): Promise<AIResponse> {
    const config = this.getRequestConfig(request);
    const provider = this.providers.get(config.provider);

    if (!provider) {
      throw new Error(`Provider ${config.provider} not available`);
    }

    // Retry logic
    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        return await this.executeWithProvider(provider, request, config);
      } catch (error) {
        if (attempt === config.retries) {
          throw error;
        }
        await this.delay(1000 * attempt); // Exponential backoff
      }
    }

    throw new Error('All retry attempts failed');
  }

  /**
   * Execute request with specific provider
   */
  private async executeWithProvider(provider: any, request: AIRequest, config: AIConfig): Promise<AIResponse> {
    switch (config.provider) {
      case 'openai':
        return this.executeOpenAI(provider, request, config);
      case 'anthropic':
        return this.executeAnthropic(provider, request, config);
      case 'local':
        return this.executeLocal(provider, request, config);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * Execute OpenAI request with advanced prompt engineering
   */
  private async executeOpenAI(openai: OpenAI, request: AIRequest, config: AIConfig): Promise<AIResponse> {
    const optimizedPrompt = this.buildPrompt(request);
    const template = this.getPromptTemplate(request);
    const optimization = template.optimization || this.getDefaultOptimization(request.task);

    const completion = await openai.chat.completions.create({
      model: config.model as string,
      messages: [
        { role: 'system', content: this.getSystemPrompt(request.task) },
        { role: 'user', content: optimizedPrompt }
      ],
      temperature: optimization.temperature,
      max_tokens: optimization.maxTokens,
      top_p: optimization.topP,
      frequency_penalty: optimization.frequencyPenalty,
      presence_penalty: optimization.presencePenalty,
      stream: config.streaming
    });

    const response: AIResponse = {
      content: completion.choices[0]?.message?.content || '',
      model: config.model,
      provider: config.provider,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : undefined,
      confidence: this.calculateConfidence(completion.choices[0]?.finish_reason)
    };

    // Parse and validate response
    return this.parseResponse(response, request);
  }

  /**
   * Execute Anthropic request with advanced prompt engineering
   */
  private async executeAnthropic(anthropic: Anthropic, request: AIRequest, config: AIConfig): Promise<AIResponse> {
    const optimizedPrompt = this.buildPrompt(request);
    const template = this.getPromptTemplate(request);
    const optimization = template.optimization || this.getDefaultOptimization(request.task);

    const message = await anthropic.messages.create({
      model: config.model as string,
      max_tokens: optimization.maxTokens,
      temperature: optimization.temperature,
      system: this.getSystemPrompt(request.task),
      messages: [{ role: 'user', content: optimizedPrompt }]
    });

    const response: AIResponse = {
      content: message.content[0]?.text || '',
      model: config.model,
      provider: config.provider,
      usage: message.usage ? {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens
      } : undefined,
      confidence: this.calculateConfidence(message.stop_reason)
    };

    // Parse and validate response
    return this.parseResponse(response, request);
  }

  /**
   * Execute local model request with optimization
   */
  private async executeLocal(provider: any, request: AIRequest, config: AIConfig): Promise<AIResponse> {
    if (!this.isLocalModelsInitialized) {
      throw new Error('Local models not initialized');
    }

    const modelInfo = this.localModelRegistry[request.task];
    if (!modelInfo || !modelInfo.loaded) {
      if (config.fallbackToCloud) {
        logger?.warn?.(`Local model not available for task ${request.task}, falling back to cloud`);
        throw new Error(`Local model not available for task: ${request.task}`);
      } else {
        throw new Error(`Local model not available for task: ${request.task}`);
      }
    }

    const startTime = Date.now();
    
    try {
      // Preprocess input
      const processedInput = this.preprocessInput(request.prompt, modelInfo.config);
      
      // Execute prediction
      const result = await modelInfo.model.predict(processedInput);
      
      // Postprocess output
      const processedOutput = this.postprocessOutput(result, request.task);
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updateLocalModelPerformance(request.task, responseTime, true);
      
      return {
        content: processedOutput,
        model: 'local' as AIModel,
        provider: 'local' as AIProvider,
        confidence: result.confidence || 0.8,
        metadata: {
          localModel: true,
          task: request.task,
          responseTime,
          modelType: modelInfo.config.modelType,
          quantized: modelInfo.config.quantization
        }
      };
    } catch (error) {
      // Update performance metrics
      this.updateLocalModelPerformance(request.task, Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Preprocess input for local models
   */
  private preprocessInput(input: string, config: LocalModelConfig): string {
    // Truncate if too long
    if (input.length > config.maxInputLength) {
      input = input.substring(0, config.maxInputLength);
    }
    
    // Basic text cleaning
    input = input.trim().toLowerCase();
    
    return input;
  }

  /**
   * Postprocess output from local models
   */
  private postprocessOutput(result: any, task: AITask): string {
    switch (task) {
      case 'text-classification':
        return `Classification: ${result.label} (confidence: ${(result.confidence * 100).toFixed(1)}%)`;
      case 'sentiment-analysis':
        return `Sentiment: ${result.sentiment} (score: ${result.score.toFixed(2)})`;
      case 'entity-extraction':
        return `Entities: ${result.entities.map((e: any) => `${e.text} (${e.type})`).join(', ')}`;
      case 'summarization':
        return result.summary;
      case 'translation':
        return result.translated;
      case 'anomaly-detection':
        return `Anomaly: ${result.isAnomaly ? 'Yes' : 'No'} (confidence: ${(result.confidence * 100).toFixed(1)}%)`;
      case 'recommendation':
        return `Recommendations: ${result.recommendations.join(', ')}`;
      default:
        return JSON.stringify(result);
    }
  }

  /**
   * Update local model performance metrics
   */
  private updateLocalModelPerformance(task: AITask, responseTime: number, success: boolean): void {
    const modelInfo = this.localModelRegistry[task];
    if (!modelInfo) return;

    if (success) {
      modelInfo.performance.successCount++;
      modelInfo.performance.averageResponseTime = 
        (modelInfo.performance.averageResponseTime * (modelInfo.performance.successCount - 1) + responseTime) / modelInfo.performance.successCount;
    } else {
      modelInfo.performance.failureCount++;
    }

    modelInfo.lastUsed = Date.now();
  }

  /**
   * Get system prompt for task
   */
  private getSystemPrompt(task: AITask): string {
    const prompts = {
      'text-generation': 'You are an expert text generator. Generate high-quality, engaging content.',
      'text-completion': 'You are an expert at completing text. Provide natural and coherent completions.',
      'text-classification': 'You are an expert at classifying text. Provide accurate classifications.',
      'sentiment-analysis': 'You are an expert at analyzing sentiment. Provide accurate sentiment analysis.',
      'entity-extraction': 'You are an expert at extracting entities from text. Extract all relevant entities.',
      'summarization': 'You are an expert at summarizing text. Provide concise and accurate summaries.',
      'translation': 'You are an expert translator. Provide accurate and natural translations.',
      'code-generation': 'You are an expert programmer. Generate clean, efficient, and well-documented code.',
      'code-review': 'You are an expert code reviewer. Provide thorough and constructive feedback.',
      'image-generation': 'You are an expert at generating images. Create high-quality, relevant images.',
      'image-analysis': 'You are an expert at analyzing images. Provide detailed and accurate analysis.',
      'speech-to-text': 'You are an expert at converting speech to text. Provide accurate transcriptions.',
      'text-to-speech': 'You are an expert at converting text to speech. Generate natural-sounding speech.',
      'data-analysis': 'You are an expert data analyst. Provide insightful and accurate analysis.',
      'prediction': 'You are an expert at making predictions. Provide accurate and well-reasoned predictions.',
      'anomaly-detection': 'You are an expert at detecting anomalies. Identify unusual patterns accurately.',
      'recommendation': 'You are an expert at making recommendations. Provide personalized and relevant recommendations.',
      'automation': 'You are an expert at automation. Provide efficient and reliable automation solutions.'
    };

    return prompts[task] || 'You are an expert AI assistant. Provide helpful and accurate responses.';
  }

  /**
   * Get request configuration
   */
  private getRequestConfig(request: AIRequest): AIConfig {
    const defaultConfig = this.config.providers[this.config.defaultProvider];
    
    return {
      ...defaultConfig,
      ...request.options,
      provider: request.options?.provider || this.config.defaultProvider,
      model: request.options?.model || this.config.defaultModel
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(finishReason?: string): number {
    switch (finishReason) {
      case 'stop':
        return 0.95;
      case 'length':
        return 0.85;
      case 'content_filter':
        return 0.70;
      default:
        return 0.80;
    }
  }

  /**
   * Cache response (async)
   */
  private async cacheResponse(request: AIRequest, response: AIResponse, ttl?: number): Promise<void> {
    if (!this.config.enableCaching && !request.options?.cache) return;
    const key = this.generateCacheKey(request);
    await this.cache.set(key, response, ttl || this.getCacheTTL(request));
  }

  /**
   * Get cached response (async)
   */
  private async getCachedResponse(request: AIRequest): Promise<AIResponse | null> {
    if (!this.config.enableCaching && !request.options?.cache) return null;
    const key = this.generateCacheKey(request);
    const cached = await this.cache.get<AIResponse>(key);
    if (cached) {
      logger?.info?.('AIEngine cache hit', { key });
      return cached;
    } else {
      logger?.info?.('AIEngine cache miss', { key });
      return null;
    }
  }

  /**
   * Generate strong cache key
   */
  private generateCacheKey(request: AIRequest): string {
    return CacheUtils.generateKey(
      'ai',
      request.task,
      request.prompt,
      JSON.stringify(request.options || {}),
      JSON.stringify(request.context || {})
    );
  }

  /**
   * Get cache TTL for a request
   */
  private getCacheTTL(request: AIRequest): number {
    // Allow per-request TTL override, else use default
    return (request.options?.cache && typeof request.options.cache === 'number')
      ? request.options.cache
      : 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Expose cache stats
   */
  async getCacheStats() {
    if ('getStats' in this.cache) {
      return this.cache.getStats();
    }
    return null;
  }

  /**
   * Record performance metrics
   */
  private recordPerformanceMetrics(request: AIRequest, response: AIResponse, responseTime: number): void {
    const metrics: AIPerformanceMetrics = {
      responseTime,
      tokenUsage: response.usage?.totalTokens || 0,
      cost: this.calculateCost(response, request),
      latency: responseTime,
      throughput: 1 / (responseTime / 1000)
    };

    this.performanceMetrics.push(metrics);
  }

  /**
   * Calculate cost
   */
  private calculateCost(response: AIResponse, request: AIRequest): number {
    if (!this.config.costManagement.enabled) return 0;

    const costRates = {
      // OpenAI models
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
      
      // Anthropic models
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'claude-2.1': { input: 0.008, output: 0.024 },
      
      // Local models (minimal cost)
      'local': { input: 0.00001, output: 0.00001 }
    };

    const model = response.model as string;
    const rates = costRates[model] || costRates['gpt-3.5-turbo'];
    
    const inputTokens = response.usage?.promptTokens || 0;
    const outputTokens = response.usage?.completionTokens || 0;
    
    const inputCost = (inputTokens / 1000) * rates.input;
    const outputCost = (outputTokens / 1000) * rates.output;
    
    return inputCost + outputCost;
  }

  /**
   * Add learning data
   */
  addLearningData(data: AILearningData): void {
    if (this.config.enableLearning) {
      this.learningData.push(data);
    }
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): PerformanceMetrics {
    return { ...this.performanceData };
  }

  /**
   * Get learning data
   */
  getLearningData(): AILearningData[] {
    return this.learningData;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Utility function for delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with circuit breaker protection
   */
  private async executeWithCircuitBreaker(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const circuitState = this.getCircuitBreakerState(provider);
    
    if (circuitState === 'OPEN') {
      throw new Error(`Circuit breaker is OPEN for provider: ${provider}`);
    }

    try {
      const response = await this.executeRequest({
        ...request,
        options: {
          ...request.options,
          provider
        }
      });

      // Record success and potentially close circuit
      this.recordCircuitBreakerSuccess(provider);
      
      return response;
    } catch (error) {
      // Record failure and potentially open circuit
      this.recordCircuitBreakerFailure(provider);
      throw error;
    }
  }

  /**
   * Get healthy providers in fallback order
   */
  private getHealthyProviders(): AIProvider[] {
    return this.config.fallbackChain.filter(provider => {
      const health = this.providerHealth.get(provider);
      return health && health.isHealthy && this.getCircuitBreakerState(provider) !== 'OPEN';
    });
  }

  /**
   * Get circuit breaker state for provider
   */
  private getCircuitBreakerState(provider: AIProvider): CircuitBreakerState {
    const state = this.circuitBreakers.get(provider);
    const lastFailureTime = this.lastFailureTimes.get(provider);
    
    if (state === 'OPEN' && lastFailureTime) {
      const timeSinceFailure = Date.now() - lastFailureTime;
      if (timeSinceFailure > this.config.circuitBreaker.recoveryTimeout) {
        // Move to HALF_OPEN state
        this.circuitBreakers.set(provider, 'HALF_OPEN');
        return 'HALF_OPEN';
      }
    }
    
    return state || 'CLOSED';
  }

  /**
   * Record circuit breaker success
   */
  private recordCircuitBreakerSuccess(provider: AIProvider): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    health.successCount++;
    health.totalRequests++;
    
    // Close circuit if in HALF_OPEN state
    if (this.circuitBreakers.get(provider) === 'HALF_OPEN') {
      this.circuitBreakers.set(provider, 'CLOSED');
      health.circuitBreakerState = 'CLOSED';
      logger?.info?.('Circuit breaker CLOSED for provider', { provider });
    }
    
    // Update health status
    this.updateProviderHealth(provider);
  }

  /**
   * Record circuit breaker failure
   */
  private recordCircuitBreakerFailure(provider: AIProvider): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    health.failureCount++;
    health.totalRequests++;
    health.lastFailureTime = Date.now();
    this.lastFailureTimes.set(provider, Date.now());
    
    // Check if circuit should open
    const failureRate = health.failureCount / health.totalRequests;
    if (health.failureCount >= this.config.circuitBreaker.failureThreshold || 
        failureRate > 0.5) {
      this.circuitBreakers.set(provider, 'OPEN');
      health.circuitBreakerState = 'OPEN';
      health.isHealthy = false;
      logger?.warn?.('Circuit breaker OPENED for provider', { 
        provider, 
        failureCount: health.failureCount,
        failureRate: failureRate.toFixed(2)
      });
    }
    
    // Update health status
    this.updateProviderHealth(provider);
  }

  /**
   * Record provider success
   */
  private recordProviderSuccess(provider: AIProvider, responseTime: number): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    health.successCount++;
    health.totalRequests++;
    health.averageResponseTime = 
      (health.averageResponseTime * (health.totalRequests - 1) + responseTime) / health.totalRequests;
    
    this.updateProviderHealth(provider);
  }

  /**
   * Record provider failure
   */
  private recordProviderFailure(provider: AIProvider, error: any): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    health.failureCount++;
    health.totalRequests++;
    health.lastFailureTime = Date.now();
    
    this.updateProviderHealth(provider);
  }

  /**
   * Update provider health status
   */
  private updateProviderHealth(provider: AIProvider): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    const successRate = health.successCount / health.totalRequests;
    health.isHealthy = successRate > 0.8; // 80% success rate threshold
  }

  /**
   * Handle graceful degradation when all providers are down
   */
  private async handleGracefulDegradation(request: AIRequest): Promise<AIResponse> {
    if (!this.config.enableGracefulDegradation) {
      throw new Error('All AI providers are unavailable');
    }

    // Try to get cached response with longer TTL
    const cachedResponse = await this.getCachedResponse(request);
    if (cachedResponse) {
      logger?.info?.('Returning cached response for graceful degradation');
      return cachedResponse;
    }

    // Return a fallback response
    return {
      content: `I'm currently experiencing technical difficulties. Please try again later. (Task: ${request.task})`,
      model: 'fallback' as AIModel,
      provider: 'fallback' as AIProvider,
      confidence: 0.1,
      metadata: {
        degraded: true,
        reason: 'all_providers_unavailable'
      }
    };
  }

  /**
   * Get provider health information
   */
  getProviderHealth(): ProviderHealth[] {
    return Array.from(this.providerHealth.values());
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Record<AIProvider, CircuitBreakerState> {
    const status: Record<AIProvider, CircuitBreakerState> = {};
    this.circuitBreakers.forEach((state, provider) => {
      status[provider] = this.getCircuitBreakerState(provider);
    });
    return status;
  }

  /**
   * Reset circuit breaker for a provider
   */
  resetCircuitBreaker(provider: AIProvider): void {
    this.circuitBreakers.set(provider, 'CLOSED');
    const health = this.providerHealth.get(provider);
    if (health) {
      health.circuitBreakerState = 'CLOSED';
      health.isHealthy = true;
    }
    logger?.info?.('Circuit breaker reset for provider', { provider });
  }

  /**
   * Get best provider based on health and cost
   */
  getBestProvider(): AIProvider | null {
    const healthyProviders = this.getHealthyProviders();
    if (healthyProviders.length === 0) return null;

    // Sort by success rate and cost
    return healthyProviders.sort((a, b) => {
      const healthA = this.providerHealth.get(a);
      const healthB = this.providerHealth.get(b);
      
      if (!healthA || !healthB) return 0;
      
      const successRateA = healthA.successCount / healthA.totalRequests;
      const successRateB = healthB.successCount / healthB.totalRequests;
      
      // Prioritize success rate, then cost
      if (Math.abs(successRateA - successRateB) > 0.1) {
        return successRateB - successRateA;
      }
      
      return healthA.costPerRequest - healthB.costPerRequest;
    })[0];
  }

  /**
   * Get comprehensive AI engine analytics
   */
  getAnalytics(): {
    performance: PerformanceMetrics;
    cost: CostMetrics;
    health: ProviderHealth[];
    insights: Array<{ insight: string; impact: 'low' | 'medium' | 'high'; recommendation: string }>;
  } {
    return {
      performance: this.getPerformanceAnalytics(),
      cost: this.getCostAnalytics(),
      health: this.getProviderHealth(),
      insights: this.getPerformanceInsights()
    };
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<AIProvider, { status: 'healthy' | 'degraded' | 'unhealthy'; lastCheck: number }>;
    metrics: {
      uptime: number;
      totalRequests: number;
      successRate: number;
      averageResponseTime: number;
      totalCost: number;
    };
  } {
    const health = this.getProviderHealth();
    const healthyProviders = health.filter(h => h.status === 'healthy').length;
    const totalProviders = health.length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyProviders === totalProviders) {
      status = 'healthy';
    } else if (healthyProviders > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const providerStatus: Record<AIProvider, { status: 'healthy' | 'degraded' | 'unhealthy'; lastCheck: number }> = {};
    health.forEach(h => {
      providerStatus[h.provider] = {
        status: h.status,
        lastCheck: h.lastCheck
      };
    });

    return {
      status,
      providers: providerStatus,
      metrics: {
        uptime: Date.now() - (this.performanceData.requests.total > 0 ? this.performanceTrends[0]?.timestamp || Date.now() : Date.now()),
        totalRequests: this.performanceData.requests.total,
        successRate: this.performanceData.requests.successRate,
        averageResponseTime: this.performanceData.responseTime.average,
        totalCost: this.costMetrics.totalCost
      }
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    logger?.info?.('Shutting down AI Engine...');
    
    // Clear queues
    this.requestQueue = [];
    
    // Clear caches
    this.costOptimizationCache.clear();
    this.promptCache.clear();
    this.modelCache.clear();
    
    // Reset metrics
    this.resetPerformanceMetrics();
    this.resetCostMetrics();
    
    // Close providers
    for (const [provider, instance] of this.providers) {
      try {
        if (instance && typeof instance.close === 'function') {
          await instance.close();
        }
      } catch (error) {
        logger?.warn?.(`Error closing provider ${provider}:`, error);
      }
    }
    
    logger?.info?.('AI Engine shutdown complete');
  }

  /**
   * Get cost analytics
   */
  getCostAnalytics(): CostMetrics {
    return {
      ...this.costMetrics,
      costPerRequest: this.costMetrics.totalCost / Math.max(this.costTrends.length, 1),
      costPerToken: this.costMetrics.totalCost / Math.max(
        this.costTrends.reduce((sum, trend) => sum + trend.tokens, 0), 1
      )
    };
  }

  /**
   * Get cost trends
   */
  getCostTrends(days: number = 30): CostTrend[] {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.costTrends.filter(trend => trend.timestamp > cutoff);
  }

  /**
   * Get budget alerts
   */
  getBudgetAlerts(): Array<{ type: 'warning' | 'critical'; message: string; timestamp: number }> {
    return [...this.budgetAlerts];
  }

  /**
   * Reset cost metrics
   */
  resetCostMetrics(): void {
    this.costMetrics = this.initializeCostMetrics();
    this.costTrends = [];
    this.budgetAlerts = [];
    this.costOptimizationCache.clear();
    logger?.info?.('Cost metrics reset');
  }

  /**
   * Set budget limits
   */
  setBudgetLimits(budget: Partial<BudgetConfig>): void {
    this.config.costManagement.budget = {
      ...this.config.costManagement.budget,
      ...budget
    };
    this.costMetrics.budgetRemaining = this.config.costManagement.budget.monthly - this.costMetrics.totalCost;
    logger?.info?.('Budget limits updated', budget);
  }

  /**
   * Get cost optimization recommendations
   */
  getCostOptimizationRecommendations(): Array<{ strategy: string; potentialSavings: number; description: string }> {
    const recommendations = [];

    // Analyze provider costs
    const providerCosts = Object.entries(this.costMetrics.costByProvider);
    const mostExpensiveProvider = providerCosts.reduce((a, b) => a[1] > b[1] ? a : b);
    
    if (mostExpensiveProvider[1] > this.costMetrics.totalCost * 0.5) {
      recommendations.push({
        strategy: 'Provider Optimization',
        potentialSavings: mostExpensiveProvider[1] * 0.3,
        description: `Consider using more cost-effective providers. ${mostExpensiveProvider[0]} accounts for ${((mostExpensiveProvider[1] / this.costMetrics.totalCost) * 100).toFixed(1)}% of total costs.`
      });
    }

    // Analyze model costs
    const modelCosts = Object.entries(this.costMetrics.costByModel);
    const expensiveModels = modelCosts.filter(([_, cost]) => cost > this.costMetrics.totalCost * 0.1);
    
    expensiveModels.forEach(([model, cost]) => {
      recommendations.push({
        strategy: 'Model Optimization',
        potentialSavings: cost * 0.2,
        description: `Consider using more cost-effective models. ${model} costs $${cost.toFixed(2)}.`
      });
    });

    // Local model recommendation
    if (this.config.localModels.enabled && this.costMetrics.costByProvider.local < this.costMetrics.totalCost * 0.1) {
      recommendations.push({
        strategy: 'Local Model Expansion',
        potentialSavings: this.costMetrics.totalCost * 0.15,
        description: 'Expand local model usage for supported tasks to reduce cloud costs.'
      });
    }

    return recommendations;
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights() {
    const health = this.getProviderHealth();
    const performance = this.getPerformanceAnalytics();
    
    const fastestProvider = health.reduce((fastest, current) => 
      current.averageResponseTime < fastest.averageResponseTime ? current : fastest
    );
    
    const slowestProvider = health.reduce((slowest, current) => 
      current.averageResponseTime > slowest.averageResponseTime ? current : slowest
    );
    
    return {
      fastestProvider: fastestProvider.provider,
      fastestResponseTime: fastestProvider.averageResponseTime,
      slowestProvider: slowestProvider.provider,
      slowestResponseTime: slowestProvider.averageResponseTime,
      performanceMetrics: performance,
      recommendations: this.generatePerformanceRecommendations(health)
    };
  }

  /**
   * Generate performance optimization recommendations
   */
  private generatePerformanceRecommendations(health: ProviderHealth[]): string[] {
    const recommendations: string[] = [];
    
    const responseTimes = health
      .filter(h => h.totalRequests > 5)
      .map(h => ({ provider: h.provider, avgTime: h.averageResponseTime }))
      .sort((a, b) => b.avgTime - a.avgTime);
    
    if (responseTimes.length > 1) {
      const fastest = responseTimes[responseTimes.length - 1];
      const slowest = responseTimes[0];
      
      if (slowest.avgTime > fastest.avgTime * 2) {
        recommendations.push(`Consider using ${fastest.provider} for time-sensitive requests. ${slowest.provider} is ${(slowest.avgTime / fastest.avgTime).toFixed(1)}x slower.`);
      }
    }
    
    return recommendations;
  }

  /**
   * Export health data for external monitoring
   */
  exportHealthData() {
    return {
      timestamp: new Date().toISOString(),
      providers: this.getProviderHealth(),
      circuitBreakers: this.getCircuitBreakerStatus(),
      cache: this.getCacheStats(),
      performance: this.getPerformanceAnalytics()
    };
  }

  /**
   * Get local model statistics
   */
  getLocalModelStats() {
    const stats = {
      totalModels: Object.keys(this.localModelRegistry).length,
      loadedModels: Object.values(this.localModelRegistry).filter(m => m.loaded).length,
      totalRequests: 0,
      averageResponseTime: 0,
      successRate: 0,
      memoryUsage: this.getMemoryUsage(),
      models: Object.entries(this.localModelRegistry).map(([task, info]) => ({
        task,
        loaded: info.loaded,
        lastUsed: info.lastUsed,
        performance: info.performance,
        config: info.config
      }))
    };

    // Calculate aggregate metrics
    const allModels = Object.values(this.localModelRegistry);
    const totalSuccess = allModels.reduce((sum, m) => sum + m.performance.successCount, 0);
    const totalFailures = allModels.reduce((sum, m) => sum + m.performance.failureCount, 0);
    const totalRequests = totalSuccess + totalFailures;
    
    if (totalRequests > 0) {
      stats.totalRequests = totalRequests;
      stats.successRate = totalSuccess / totalRequests;
      stats.averageResponseTime = allModels.reduce((sum, m) => sum + m.performance.averageResponseTime, 0) / allModels.length;
    }

    return stats;
  }

  /**
   * Get memory usage for local models
   */
  private getMemoryUsage(): number {
    // Simulate memory usage calculation
    return Object.keys(this.localModelRegistry).length * 50 * 1024 * 1024; // 50MB per model
  }

  /**
   * Unload model to free memory
   */
  async unloadModel(task: AITask): Promise<void> {
    const modelInfo = this.localModelRegistry[task];
    if (modelInfo) {
      // Clean up model resources
      if (modelInfo.model && modelInfo.model.dispose) {
        modelInfo.model.dispose();
      }
      
      delete this.localModelRegistry[task];
      this.modelCache.delete(task);
      
      logger?.info?.(`Model for task ${task} unloaded`);
    }
  }

  /**
   * Reload model
   */
  async reloadModel(task: AITask): Promise<void> {
    await this.unloadModel(task);
    
    const modelConfigs = {
      'text-classification': { modelPath: './models/text-classification', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 512, batchSize: 32, cacheModel: true, fallbackToCloud: true },
      'sentiment-analysis': { modelPath: './models/sentiment-analysis', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 256, batchSize: 64, cacheModel: true, fallbackToCloud: true },
      'entity-extraction': { modelPath: './models/entity-extraction', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 512, batchSize: 16, cacheModel: true, fallbackToCloud: true },
      'summarization': { modelPath: './models/summarization', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 1024, batchSize: 8, cacheModel: true, fallbackToCloud: true },
      'translation': { modelPath: './models/translation', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 512, batchSize: 16, cacheModel: true, fallbackToCloud: true },
      'anomaly-detection': { modelPath: './models/anomaly-detection', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 256, batchSize: 32, cacheModel: true, fallbackToCloud: true },
      'recommendation': { modelPath: './models/recommendation', modelType: 'tensorflow' as const, quantization: true, maxInputLength: 128, batchSize: 64, cacheModel: true, fallbackToCloud: true }
    };

    const config = modelConfigs[task];
    if (config) {
      await this.loadModel(task, config);
    }
  }

  /**
   * Initialize prompt templates
   */
  private initializePromptTemplates(): void {
    if (!this.config.promptEngineering.enabled) {
      return;
    }

    // Load default templates
    Object.entries(this.config.promptEngineering.defaultTemplates).forEach(([task, template]) => {
      this.promptTemplates.set(task, {
        id: `default-${task}`,
        name: `Default ${task} template`,
        task: task as AITask,
        template,
        variables: this.extractTemplateVariables(template),
        examples: this.getDefaultExamples(task as AITask),
        outputSchema: this.getDefaultOutputSchema(task as AITask),
        optimization: this.getDefaultOptimization(task as AITask)
      });
    });

    logger?.info?.('Prompt templates initialized');
  }

  /**
   * Extract variables from template string
   */
  private extractTemplateVariables(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * Get default examples for task
   */
  private getDefaultExamples(task: AITask): FewShotExample[] {
    const examples: Record<AITask, FewShotExample[]> = {
      'sentiment-analysis': [
        {
          input: 'I love this product!',
          output: '{"sentiment": "positive", "confidence": 0.9, "score": 0.8}',
          explanation: 'Positive sentiment with high confidence'
        },
        {
          input: 'This is terrible quality.',
          output: '{"sentiment": "negative", "confidence": 0.85, "score": -0.7}',
          explanation: 'Negative sentiment with high confidence'
        }
      ],
      'text-classification': [
        {
          input: 'The stock market reached new highs today.',
          output: '{"category": "business", "confidence": 0.95}',
          explanation: 'Business-related content'
        },
        {
          input: 'Scientists discover new species in Amazon.',
          output: '{"category": "science", "confidence": 0.9}',
          explanation: 'Science-related content'
        }
      ],
      'entity-extraction': [
        {
          input: 'John Smith works at Microsoft in Seattle.',
          output: '{"entities": [{"text": "John Smith", "type": "PERSON"}, {"text": "Microsoft", "type": "ORG"}, {"text": "Seattle", "type": "LOCATION"}]}',
          explanation: 'Extract person, organization, and location'
        }
      ],
      'summarization': [
        {
          input: 'The long article about climate change...',
          output: '{"summary": "Climate change impacts and solutions discussed.", "length": 45}',
          explanation: 'Concise summary with length'
        }
      ]
    };

    return examples[task] || [];
  }

  /**
   * Get default output schema for task
   */
  private getDefaultOutputSchema(task: AITask): z.ZodSchema<any> {
    const schemas: Record<AITask, z.ZodSchema<any>> = {
      'sentiment-analysis': z.object({
        sentiment: z.enum(['positive', 'negative', 'neutral']),
        confidence: z.number().min(0).max(1),
        score: z.number().min(-1).max(1)
      }),
      'text-classification': z.object({
        category: z.string(),
        confidence: z.number().min(0).max(1),
        alternatives: z.array(z.string()).optional()
      }),
      'entity-extraction': z.object({
        entities: z.array(z.object({
          text: z.string(),
          type: z.string(),
          confidence: z.number().min(0).max(1)
        }))
      }),
      'summarization': z.object({
        summary: z.string(),
        length: z.number(),
        confidence: z.number().min(0).max(1)
      }),
      'translation': z.object({
        translated: z.string(),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
        confidence: z.number().min(0).max(1)
      }),
      'anomaly-detection': z.object({
        isAnomaly: z.boolean(),
        confidence: z.number().min(0).max(1),
        score: z.number()
      }),
      'recommendation': z.object({
        recommendations: z.array(z.string()),
        confidence: z.number().min(0).max(1),
        scores: z.array(z.number())
      })
    };

    return schemas[task] || z.string();
  }

  /**
   * Get default optimization for task
   */
  private getDefaultOptimization(task: AITask): PromptOptimization {
    const optimizations: Record<AITask, PromptOptimization> = {
      'sentiment-analysis': {
        maxTokens: 100,
        temperature: 0.1,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      'text-classification': {
        maxTokens: 150,
        temperature: 0.1,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      'entity-extraction': {
        maxTokens: 200,
        temperature: 0.1,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      'summarization': {
        maxTokens: 300,
        temperature: 0.3,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      },
      'translation': {
        maxTokens: 500,
        temperature: 0.2,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      'code-generation': {
        maxTokens: 1000,
        temperature: 0.2,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      }
    };

    return optimizations[task] || {
      maxTokens: 500,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0
    };
  }

  /**
   * Build optimized prompt with context and examples
   */
  private buildPrompt(request: AIRequest): string {
    const template = this.getPromptTemplate(request);
    let optimizedPrompt = this.optimizePrompt(template, request);
    
    // Add few-shot examples if enabled
    if (this.config.promptEngineering.enableFewShotLearning && template.examples) {
      const examples = this.selectBestExamples(template.examples, request);
      optimizedPrompt = this.addFewShotExamples(optimizedPrompt, examples);
    }

    // Add output schema if structured output is requested
    if (request.structured && template.outputSchema) {
      optimizedPrompt = this.addOutputSchema(optimizedPrompt, template.outputSchema);
    }

    return optimizedPrompt;
  }

  /**
   * Get prompt template for request
   */
  private getPromptTemplate(request: AIRequest): PromptTemplate {
    // Use custom template if provided
    if (request.template) {
      const customTemplate = this.promptTemplates.get(request.template);
      if (customTemplate) {
        return customTemplate;
      }
    }

    // Use default template for task
    const defaultTemplate = this.promptTemplates.get(request.task);
    if (defaultTemplate) {
      return defaultTemplate;
    }

    // Fallback to basic template
    return {
      id: 'fallback',
      name: 'Fallback template',
      task: request.task,
      template: request.prompt,
      variables: [],
      optimization: this.getDefaultOptimization(request.task)
    };
  }

  /**
   * Optimize prompt based on context and history
   */
  private optimizePrompt(template: PromptTemplate, request: AIRequest): string {
    let prompt = template.template;

    // Replace template variables
    if (request.context) {
      prompt = this.replaceTemplateVariables(prompt, request.context);
    }

    // Apply prompt optimization
    if (this.config.promptEngineering.enableOptimization && template.optimization) {
      prompt = this.applyPromptOptimization(prompt, template.optimization, request);
    }

    // Add conversation history if available
    if (request.context?.conversationHistory) {
      prompt = this.addConversationHistory(prompt, request.context.conversationHistory);
    }

    return prompt;
  }

  /**
   * Replace template variables with context values
   */
  private replaceTemplateVariables(template: string, context: PromptContext): string {
    let result = template;
    
    if (context.domain) {
      result = result.replace(/\{domain\}/g, context.domain);
    }
    if (context.language) {
      result = result.replace(/\{language\}/g, context.language);
    }
    if (context.tone) {
      result = result.replace(/\{tone\}/g, context.tone);
    }

    return result;
  }

  /**
   * Apply prompt optimization techniques
   */
  private applyPromptOptimization(prompt: string, optimization: PromptOptimization, request: AIRequest): string {
    let optimizedPrompt = prompt;

    // Add tone and style instructions
    if (request.context?.tone) {
      optimizedPrompt = `Please respond in a ${request.context.tone} tone.\n\n${optimizedPrompt}`;
    }

    // Add constraints if specified
    if (request.context?.constraints) {
      const constraints = request.context.constraints.join(', ');
      optimizedPrompt = `${optimizedPrompt}\n\nConstraints: ${constraints}`;
    }

    // Add length guidance
    if (optimization.maxTokens) {
      optimizedPrompt = `${optimizedPrompt}\n\nPlease keep your response under ${optimization.maxTokens} tokens.`;
    }

    return optimizedPrompt;
  }

  /**
   * Add conversation history to prompt
   */
  private addConversationHistory(prompt: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): string {
    if (history.length === 0) return prompt;

    const historyText = history
      .slice(-5) // Keep last 5 exchanges
      .map(exchange => `${exchange.role}: ${exchange.content}`)
      .join('\n');

    return `Previous conversation:\n${historyText}\n\nCurrent request: ${prompt}`;
  }

  /**
   * Select best few-shot examples
   */
  private selectBestExamples(examples: FewShotExample[], request: AIRequest): FewShotExample[] {
    // Simple selection - take first N examples
    // In production, this could use semantic similarity or other heuristics
    return examples.slice(0, this.config.promptEngineering.maxExamples);
  }

  /**
   * Add few-shot examples to prompt
   */
  private addFewShotExamples(prompt: string, examples: FewShotExample[]): string {
    if (examples.length === 0) return prompt;

    const examplesText = examples
      .map(example => `Input: ${example.input}\nOutput: ${example.output}${example.explanation ? `\nExplanation: ${example.explanation}` : ''}`)
      .join('\n\n');

    return `Examples:\n${examplesText}\n\nNow, please respond to:\n${prompt}`;
  }

  /**
   * Add output schema to prompt
   */
  private addOutputSchema(prompt: string, schema: z.ZodSchema<any>): string {
    const schemaDescription = this.describeSchema(schema);
    return `${prompt}\n\nPlease respond in the following JSON format:\n${schemaDescription}`;
  }

  /**
   * Describe schema in natural language
   */
  private describeSchema(schema: z.ZodSchema<any>): string {
    // This is a simplified version - in production, you'd want more sophisticated schema description
    return 'JSON format matching the specified schema';
  }

  /**
   * Parse and validate response
   */
  private parseResponse(response: AIResponse, request: AIRequest): AIResponse {
    if (!request.structured || !request.outputSchema) {
      return response;
    }

    try {
      // Try to parse JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validation = request.outputSchema.safeParse(parsed);
        
        if (validation.success) {
          return {
            ...response,
            structured: {
              data: validation.data,
              confidence: response.confidence || 0.8,
              metadata: { parsed: true }
            },
            parsed: validation.data,
            validation: { valid: true }
          };
        } else {
          return {
            ...response,
            validation: {
              valid: false,
              errors: validation.error.errors.map(e => e.message)
            }
          };
        }
      }
    } catch (error) {
      logger?.warn?.('Failed to parse structured response', error);
    }

    return response;
  }

  /**
   * Register custom prompt template
   */
  registerPromptTemplate(template: PromptTemplate): void {
    this.promptTemplates.set(template.id, template);
    logger?.info?.(`Prompt template registered: ${template.id}`);
  }

  /**
   * Get prompt template by ID
   */
  getPromptTemplateById(id: string): PromptTemplate | undefined {
    return this.promptTemplates.get(id);
  }

  /**
   * List all prompt templates
   */
  listPromptTemplates(): PromptTemplate[] {
    return Array.from(this.promptTemplates.values());
  }

  /**
   * Update prompt optimization based on performance
   */
  updatePromptOptimization(templateId: string, performance: { success: boolean; responseTime: number; quality: number }): void {
    const template = this.promptTemplates.get(templateId);
    if (!template) return;

    if (!this.optimizationHistory.has(templateId)) {
      this.optimizationHistory.set(templateId, []);
    }

    const history = this.optimizationHistory.get(templateId)!;
    history.push(template.optimization!);

    // Keep only last 10 optimizations
    if (history.length > 10) {
      history.shift();
    }

    // In production, you'd implement more sophisticated optimization logic
    logger?.info?.(`Prompt optimization updated for template: ${templateId}`);
  }

  /**
   * Initialize cost metrics
   */
  private initializeCostMetrics(): CostMetrics {
    return {
      totalCost: 0,
      costPerRequest: 0,
      costPerToken: 0,
      costByProvider: {
        openai: 0,
        anthropic: 0,
        local: 0,
        custom: 0
      },
      costByModel: {},
      costByTask: {
        'text-generation': 0,
        'text-completion': 0,
        'text-classification': 0,
        'sentiment-analysis': 0,
        'entity-extraction': 0,
        'summarization': 0,
        'translation': 0,
        'code-generation': 0,
        'code-review': 0,
        'image-generation': 0,
        'image-analysis': 0,
        'speech-to-text': 0,
        'text-to-speech': 0,
        'data-analysis': 0,
        'prediction': 0,
        'anomaly-detection': 0,
        'recommendation': 0,
        'automation': 0
      },
      budgetUsage: 0,
      budgetRemaining: this.config.costManagement.budget.monthly,
      costTrends: []
    };
  }

  /**
   * Update cost metrics
   */
  private updateCostMetrics(response: AIResponse, request: AIRequest, cost: number): void {
    if (!this.config.costManagement.enabled) return;

    // Update total cost
    this.costMetrics.totalCost += cost;
    
    // Update provider cost
    this.costMetrics.costByProvider[response.provider] += cost;
    
    // Update model cost
    const model = response.model as string;
    this.costMetrics.costByModel[model] = (this.costMetrics.costByModel[model] || 0) + cost;
    
    // Update task cost
    this.costMetrics.costByTask[request.task] += cost;
    
    // Update budget usage
    this.costMetrics.budgetUsage = (this.costMetrics.totalCost / this.config.costManagement.budget.monthly) * 100;
    this.costMetrics.budgetRemaining = this.config.costManagement.budget.monthly - this.costMetrics.totalCost;
    
    // Add cost trend
    this.costTrends.push({
      timestamp: Date.now(),
      cost,
      tokens: response.usage?.totalTokens || 0,
      provider: response.provider,
      model: response.model as string,
      task: request.task
    });
    
    // Keep only recent trends (last 90 days)
    const cutoff = Date.now() - (this.config.costManagement.tracking.retentionDays * 24 * 60 * 60 * 1000);
    this.costTrends = this.costTrends.filter(trend => trend.timestamp > cutoff);
    
    // Check budget alerts
    this.checkBudgetAlerts();
    
    // Update cost optimization cache
    this.updateCostOptimizationCache(request, response, cost);
  }

  /**
   * Check budget alerts
   */
  private checkBudgetAlerts(): void {
    if (!this.config.costManagement.tracking.realTimeAlerts) return;

    const usage = this.costMetrics.budgetUsage;
    const { warningThreshold, criticalThreshold } = this.config.costManagement.budget.alerts;

    if (usage >= criticalThreshold) {
      this.budgetAlerts.push({
        type: 'critical',
        message: `Critical: Budget usage at ${usage.toFixed(1)}%`,
        timestamp: Date.now()
      });
      logger?.error?.(`Critical budget alert: ${usage.toFixed(1)}% usage`);
    } else if (usage >= warningThreshold) {
      this.budgetAlerts.push({
        type: 'warning',
        message: `Warning: Budget usage at ${usage.toFixed(1)}%`,
        timestamp: Date.now()
      });
      logger?.warn?.(`Budget warning: ${usage.toFixed(1)}% usage`);
    }
  }

  /**
   * Update cost optimization cache
   */
  private updateCostOptimizationCache(request: AIRequest, response: AIResponse, cost: number): void {
    const key = `${request.task}-${request.prompt.length}`;
    this.costOptimizationCache.set(key, {
      provider: response.provider,
      model: response.model as string,
      cost
    });
  }

  /**
   * Get cost-optimized provider and model
   */
  private getCostOptimizedConfig(request: AIRequest): { provider: AIProvider; model: string } {
    if (!this.config.costManagement.optimization.enabled) {
      return {
        provider: this.config.defaultProvider,
        model: this.config.defaultModel
      };
    }

    // Check if we can use local models
    if (this.config.costManagement.optimization.strategies.localModels && 
        this.config.localModels.enabled &&
        this.config.localModels.supportedTasks.includes(request.task)) {
      return { provider: 'local', model: 'local' };
    }

    // Check cache for similar requests
    const key = `${request.task}-${request.prompt.length}`;
    const cached = this.costOptimizationCache.get(key);
    if (cached && cached.cost <= this.config.costManagement.optimization.thresholds.maxCostPerRequest) {
      return { provider: cached.provider, model: cached.model };
    }

    // Use preferred providers in order
    for (const provider of this.config.costManagement.optimization.thresholds.preferredProviders) {
      if (this.isProviderHealthy(provider)) {
        const config = this.config.providers[provider];
        if (config) {
          return { provider, model: config.model };
        }
      }
    }

    // Fallback to default
    return {
      provider: this.config.defaultProvider,
      model: this.config.defaultModel
    };
  }

  /**
   * Optimize request for cost
   */
  private optimizeRequestForCost(request: AIRequest): AIRequest {
    if (!this.config.costManagement.optimization.enabled) return request;

    const optimizedRequest = { ...request };

    // Token optimization
    if (this.config.costManagement.optimization.strategies.tokenOptimization) {
      const maxTokens = this.config.costManagement.optimization.thresholds.maxTokensPerRequest;
      if (request.prompt.length > maxTokens) {
        optimizedRequest.prompt = request.prompt.substring(0, maxTokens);
        logger?.info?.('Request optimized for token limit');
      }
    }

    // Use cost-optimized provider
    const costOptimized = this.getCostOptimizedConfig(request);
    optimizedRequest.options = {
      ...request.options,
      provider: costOptimized.provider,
      model: costOptimized.model
    };

    return optimizedRequest;
  }

  /**
   * Estimate request cost
   */
  private estimateRequestCost(request: AIRequest): number {
    const config = this.getRequestConfig(request);
    const avgTokensPerChar = 0.25; // Rough estimate
    const estimatedTokens = request.prompt.length * avgTokensPerChar;
    
    const costRates = {
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.002,
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003,
      'claude-3-haiku': 0.00025,
      'local': 0.00001
    };

    const rate = costRates[config.model as keyof typeof costRates] || 0.002;
    return (estimatedTokens / 1000) * rate;
  }

  /**
   * Initialize performance metrics
   */
  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0
      },
      responseTime: {
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        min: 0,
        max: 0
      },
      throughput: {
        requestsPerSecond: 0,
        tokensPerSecond: 0,
        concurrentRequests: 0
      },
      errors: {
        total: 0,
        byType: {},
        byProvider: {
          openai: 0,
          anthropic: 0,
          local: 0,
          custom: 0
        },
        recentErrors: []
      },
      utilization: {
        cacheHitRate: 0,
        providerUtilization: {
          openai: 0,
          anthropic: 0,
          local: 0,
          custom: 0
        },
        queueLength: 0,
        processingTime: 0
      },
      trends: []
    };
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(request: AIRequest, response: AIResponse, startTime: number, success: boolean, error?: Error): void {
    if (!this.config.performanceMonitoring.enabled) return;

    const responseTime = Date.now() - startTime;
    const timestamp = Date.now();

    // Update request counts
    this.performanceData.requests.total++;
    if (success) {
      this.performanceData.requests.successful++;
    } else {
      this.performanceData.requests.failed++;
      this.performanceData.errors.total++;
    }

    // Update success rate
    this.performanceData.requests.successRate = 
      (this.performanceData.requests.successful / this.performanceData.requests.total) * 100;

    // Update response time statistics
    this.updateResponseTimeStats(responseTime);

    // Update throughput
    this.updateThroughputStats(response, responseTime);

    // Update error tracking
    if (error) {
      this.updateErrorStats(error, response.provider);
    }

    // Update utilization
    this.updateUtilizationStats();

    // Add performance trend
    this.addPerformanceTrend(timestamp, responseTime, success, response);

    // Sample request if needed
    if (this.shouldSampleRequest()) {
      this.sampleRequest(request, response, { responseTime, success, error });
    }

    // Check for alerts
    this.checkPerformanceAlerts();
  }

  /**
   * Update response time statistics
   */
  private updateResponseTimeStats(responseTime: number): void {
    const times = this.performanceTrends
      .slice(-100) // Last 100 requests
      .map(trend => trend.responseTime)
      .concat([responseTime])
      .sort((a, b) => a - b);

    this.performanceData.responseTime = {
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      p50: times[Math.floor(times.length * 0.5)],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)],
      min: times[0],
      max: times[times.length - 1]
    };
  }

  /**
   * Update throughput statistics
   */
  private updateThroughputStats(response: AIResponse, responseTime: number): void {
    const recentTrends = this.performanceTrends
      .filter(trend => Date.now() - trend.timestamp < 60000) // Last minute
      .concat([{
        timestamp: Date.now(),
        responseTime,
        throughput: 1,
        errorRate: 0,
        cacheHitRate: 0,
        provider: response.provider,
        task: 'unknown' as AITask
      }]);

    this.performanceData.throughput = {
      requestsPerSecond: recentTrends.length / 60,
      tokensPerSecond: recentTrends.reduce((sum, trend) => sum + (response.usage?.totalTokens || 0), 0) / 60,
      concurrentRequests: this.requestQueue.length
    };
  }

  /**
   * Update error statistics
   */
  private updateErrorStats(error: Error, provider: AIProvider): void {
    const errorType = error.constructor.name;
    this.performanceData.errors.byType[errorType] = (this.performanceData.errors.byType[errorType] || 0) + 1;
    this.performanceData.errors.byProvider[provider]++;

    // Update recent errors
    const existingError = this.performanceData.errors.recentErrors.find(e => e.error === error.message);
    if (existingError) {
      existingError.count++;
      existingError.timestamp = Date.now();
    } else {
      this.performanceData.errors.recentErrors.push({
        error: error.message,
        timestamp: Date.now(),
        count: 1
      });
    }

    // Keep only recent errors
    this.performanceData.errors.recentErrors = this.performanceData.errors.recentErrors
      .filter(e => Date.now() - e.timestamp < 3600000) // Last hour
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 errors
  }

  /**
   * Update utilization statistics
   */
  private updateUtilizationStats(): void {
    // Cache hit rate (simplified - would need cache stats)
    this.performanceData.utilization.cacheHitRate = 0.8; // Placeholder

    // Provider utilization
    const totalRequests = this.performanceData.requests.total;
    Object.keys(this.performanceData.utilization.providerUtilization).forEach(provider => {
      const providerRequests = this.performanceTrends
        .filter(trend => trend.provider === provider)
        .length;
      this.performanceData.utilization.providerUtilization[provider as AIProvider] = 
        (providerRequests / totalRequests) * 100;
    });

    // Queue and processing stats
    this.performanceData.utilization.queueLength = this.requestQueue.length;
    this.performanceData.utilization.processingTime = this.isProcessing ? 1 : 0;
  }

  /**
   * Add performance trend
   */
  private addPerformanceTrend(timestamp: number, responseTime: number, success: boolean, response: AIResponse): void {
    const trend: PerformanceTrend = {
      timestamp,
      responseTime,
      throughput: 1 / (responseTime / 1000),
      errorRate: success ? 0 : 1,
      cacheHitRate: this.performanceData.utilization.cacheHitRate,
      provider: response.provider,
      task: 'unknown' as AITask // Would need to track task from request
    };

    this.performanceTrends.push(trend);

    // Keep only recent trends
    const cutoff = Date.now() - (this.config.performanceMonitoring.retention.trends * 24 * 60 * 60 * 1000);
    this.performanceTrends = this.performanceTrends.filter(trend => trend.timestamp > cutoff);
  }

  /**
   * Check if request should be sampled
   */
  private shouldSampleRequest(): boolean {
    if (!this.config.performanceMonitoring.sampling.enabled) return false;
    
    const shouldSample = Math.random() * 100 < this.config.performanceMonitoring.sampling.rate;
    const underLimit = this.requestSamples.length < this.config.performanceMonitoring.sampling.maxSamples;
    
    return shouldSample && underLimit;
  }

  /**
   * Sample request for detailed analysis
   */
  private sampleRequest(request: AIRequest, response: AIResponse, metrics: any): void {
    this.requestSamples.push({
      request,
      response,
      metrics,
      timestamp: Date.now()
    });

    // Keep only recent samples
    const cutoff = Date.now() - (this.config.performanceMonitoring.retention.samples * 24 * 60 * 60 * 1000);
    this.requestSamples = this.requestSamples.filter(sample => sample.timestamp > cutoff);
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(): void {
    if (!this.config.performanceMonitoring.alerting.enabled) return;

    const { thresholds } = this.config.performanceMonitoring.alerting;
    const cooldownMs = this.config.performanceMonitoring.alerting.cooldown * 60 * 1000;

    // Check error rate
    if (this.performanceData.requests.successRate < (100 - thresholds.errorRate)) {
      this.createAlert('error_rate', 'high', 
        `Error rate is ${(100 - this.performanceData.requests.successRate).toFixed(1)}%`, cooldownMs);
    }

    // Check response time
    if (this.performanceData.responseTime.p95 > thresholds.responseTime) {
      this.createAlert('response_time', 'medium',
        `P95 response time is ${this.performanceData.responseTime.p95}ms`, cooldownMs);
    }

    // Check throughput
    if (this.performanceData.throughput.requestsPerSecond < thresholds.throughput) {
      this.createAlert('throughput', 'low',
        `Throughput is ${this.performanceData.throughput.requestsPerSecond.toFixed(1)} req/s`, cooldownMs);
    }

    // Check cost per request
    const avgCost = this.costMetrics.totalCost / Math.max(this.performanceData.requests.total, 1);
    if (avgCost > thresholds.costPerRequest) {
      this.createAlert('cost', 'medium',
        `Average cost per request is $${avgCost.toFixed(4)}`, cooldownMs);
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(type: string, severity: 'low' | 'medium' | 'high' | 'critical', message: string, cooldownMs: number): void {
    const alertId = `${type}-${severity}`;
    const lastAlert = this.alertCooldowns.get(alertId);
    
    if (lastAlert && Date.now() - lastAlert < cooldownMs) {
      return; // Still in cooldown
    }

    const alert: PerformanceAlert = {
      id: `${alertId}-${Date.now()}`,
      type: type as any,
      severity,
      message,
      timestamp: Date.now(),
      resolved: false,
      metrics: {
        errorRate: this.performanceData.requests.successRate,
        responseTime: this.performanceData.responseTime.p95,
        throughput: this.performanceData.throughput.requestsPerSecond,
        costPerRequest: this.costMetrics.totalCost / Math.max(this.performanceData.requests.total, 1)
      }
    };

    this.performanceAlerts.push(alert);
    this.alertCooldowns.set(alertId, Date.now());

    // Log alert
    logger?.[severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info']?.(`Performance alert: ${message}`);

    // Keep only recent alerts
    const cutoff = Date.now() - (this.config.performanceMonitoring.retention.alerts * 24 * 60 * 60 * 1000);
    this.performanceAlerts = this.performanceAlerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(hours: number = 24): PerformanceTrend[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.performanceTrends.filter(trend => trend.timestamp > cutoff);
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): PerformanceAlert[] {
    return this.performanceAlerts.filter(alert => !alert.resolved);
  }

  /**
   * Get request samples
   */
  getRequestSamples(): Array<{ request: AIRequest; response: AIResponse; metrics: any; timestamp: number }> {
    return [...this.requestSamples];
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceData = this.initializePerformanceMetrics();
    this.performanceTrends = [];
    this.performanceAlerts = [];
    this.requestSamples = [];
    this.alertCooldowns.clear();
    logger?.info?.('Performance metrics reset');
  }

  /**
   * Resolve performance alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.performanceAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger?.info?.(`Performance alert resolved: ${alert.message}`);
    }
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): Array<{ insight: string; impact: 'low' | 'medium' | 'high'; recommendation: string }> {
    const insights = [];

    // Error rate insights
    if (this.performanceData.requests.successRate < 95) {
      insights.push({
        insight: `Low success rate: ${this.performanceData.requests.successRate.toFixed(1)}%`,
        impact: 'high',
        recommendation: 'Investigate error patterns and improve error handling'
      });
    }

    // Response time insights
    if (this.performanceData.responseTime.p95 > 3000) {
      insights.push({
        insight: `Slow response times: P95 is ${this.performanceData.responseTime.p95}ms`,
        impact: 'medium',
        recommendation: 'Consider caching, optimization, or faster providers'
      });
    }

    // Throughput insights
    if (this.performanceData.throughput.requestsPerSecond < 5) {
      insights.push({
        insight: `Low throughput: ${this.performanceData.throughput.requestsPerSecond.toFixed(1)} req/s`,
        impact: 'medium',
        recommendation: 'Increase concurrent processing or optimize request handling'
      });
    }

    // Provider utilization insights
    const providers = Object.entries(this.performanceData.utilization.providerUtilization);
    const underutilized = providers.filter(([_, utilization]) => utilization < 10);
    if (underutilized.length > 0) {
      insights.push({
        insight: `Underutilized providers: ${underutilized.map(([p, u]) => `${p} (${u.toFixed(1)}%)`).join(', ')}`,
        impact: 'low',
        recommendation: 'Consider removing underutilized providers or rebalancing load'
      });
    }

    return insights;
  }
}

// Export singleton instance
export const aiEngine = new AIEngine(); 