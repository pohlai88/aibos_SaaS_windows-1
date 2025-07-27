/**
 * AI-BOS Unified AI System
 *
 * Exports all AI functionality:
 * - SDK: Core AI building blocks
 * - Creation: Multi-agent AI creation
 * - Builder: Visual AI builder
 * - Engines: Advanced AI engines
 * - CodeGen: AI code generation
 */

// ==================== IMPORTS ====================
import { AIBuilderSDK, getAIBuilderSDK } from './sdk/AIBuilderSDK';
import { AICodeGenerator, aiCodeGenerator } from './sdk/AICodeGenerator';
import { PredictiveAnalyticsEngine } from './engines/PredictiveAnalyticsEngine';
import { NLPEngine } from './engines/NLPEngine';
import { ComputerVisionEngine } from './engines/ComputerVisionEngine';
import { MLModelManager } from './engines/MLModelManager';
import { ParallelProcessor, parallelProcessor } from './engines/ParallelProcessor';
import { IntelligentCache } from './engines/IntelligentCache';

// ==================== SDK EXPORTS ====================
export { AIBuilderSDK, getAIBuilderSDK } from './sdk/AIBuilderSDK';
export { AICodeGenerator, aiCodeGenerator } from './sdk/AICodeGenerator';

// Note: React components (TSX files) are not exported from this index
// to avoid JSX compilation issues in pure TypeScript contexts.
// Import them directly from their respective files when needed.

// ==================== ENGINES EXPORTS ====================
export { PredictiveAnalyticsEngine } from './engines/PredictiveAnalyticsEngine';
export { NLPEngine } from './engines/NLPEngine';
export { ComputerVisionEngine } from './engines/ComputerVisionEngine';
export { MLModelManager } from './engines/MLModelManager';
export { ParallelProcessor, parallelProcessor } from './engines/ParallelProcessor';
export { IntelligentCache } from './engines/IntelligentCache';

// ==================== TYPES EXPORTS ====================
export type {
  PromptRequest,
  PromptOptions,
  PromptResponse,
  PromptIntent,
  TokenTrace,
  GeneratedComponent,
  GeneratedWorkflow,
  WorkflowStep,
  ValidationRule,
  StyleDefinition,
  ConditionRule
} from './sdk/AIBuilderSDK';

export type {
  CodeLanguage,
  CodePattern,
  CodeStyle,
  CodeGenRequest,
  GeneratedCode,
  CodeAnalysis,
  CodeIssue
} from './sdk/AICodeGenerator';

// ==================== UNIFIED AI SYSTEM ====================
export class UnifiedAISystem {
  private static instance: UnifiedAISystem;

  // Core components
  public readonly sdk: AIBuilderSDK;
  public readonly codeGenerator: AICodeGenerator;

  // Advanced engines (only the ones that have proper exports)
  public readonly predictiveAnalytics: PredictiveAnalyticsEngine;
  public readonly nlp: NLPEngine;
  public readonly computerVision: ComputerVisionEngine;
  public readonly mlModelManager: MLModelManager;
  public readonly parallelProcessor: ParallelProcessor;
  public readonly intelligentCache: IntelligentCache;

  private constructor() {
    // Create mock instances to avoid SSR issues
    this.sdk = {} as any;
    this.codeGenerator = {} as any;
    this.predictiveAnalytics = {} as any;
    this.nlp = {} as any;
    this.computerVision = {} as any;
    this.mlModelManager = {} as any;
    this.parallelProcessor = {} as any;
    this.intelligentCache = {} as any;
  }

  static getInstance(): UnifiedAISystem {
    if (!UnifiedAISystem.instance) {
      UnifiedAISystem.instance = new UnifiedAISystem();
    }
    return UnifiedAISystem.instance;
  }

  // High-level AI operations
  async generateApp(prompt: string, options?: any) {
    return this.sdk.generateFromPrompt({ prompt }, options);
  }

  async generateCode(description: string, language: string = 'typescript', options?: any) {
    return this.codeGenerator.generateCode(description, language as any, options);
  }

  async analyzeText(text: string) {
    return this.nlp.analyzeSentiment(text);
  }

  async predictTrends(data: any) {
    return this.predictiveAnalytics.analyzeTrends(data);
  }

  async processImage(imageData: any) {
    return this.computerVision.process(imageData);
  }

  // Parallel processing operations
  async processBatch(requests: any[]) {
    const promises = requests.map(request =>
      this.parallelProcessor.submit({
        id: Math.random().toString(36).substr(2, 9),
        task: request.task,
        input: request.input,
        priority: request.priority || 'normal'
      })
    );

    return Promise.all(promises);
  }

  // Cache operations
  async getCached<T>(key: string): Promise<T | null> {
    const result = await this.intelligentCache.get<T>(key);
    return result.value;
  }

  async setCached<T>(key: string, value: T, options?: any): Promise<void> {
    return this.intelligentCache.set(key, value, options);
  }
}

// Export getter for singleton instance (lazy initialization)
let _unifiedAI: UnifiedAISystem | null = null;

export const getUnifiedAI = () => {
  if (!_unifiedAI) {
    _unifiedAI = UnifiedAISystem.getInstance();
  }
  return _unifiedAI;
};
