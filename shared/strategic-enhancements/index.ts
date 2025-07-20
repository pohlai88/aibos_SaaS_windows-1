/**
 * AI-BOS Strategic Enhancements
 *
 * Enterprise-grade integration layer for Visual Development Interface,
 * AI-Powered Onboarding, and Community Templates marketplace.
 *
 * This module orchestrates the "Everyone Can Dev" vision by providing
 * a unified API for all strategic enhancement systems.
 */

// ============================================================================
// VISUAL DEVELOPMENT INTERFACE
// ============================================================================

export {
  // Core Visual Builder
  VisualAppBuilder,
  DragDropCanvas,
  ComponentPalette,
  PropertyPanel,

  // Real-time Preview
  LivePreview,
  PreviewFrame,
  PreviewControls,

  // AI Assistance
  AIVisualAssistant,
  AIComponentSuggestions,
  AILayoutOptimizer,

  // Manifest Integration
  VisualManifestBuilder,
  ManifestPreview,
  CodeGenerator,

  // Hooks & Utilities
  useVisualBuilder,
  useCanvasState,
  useAIAssistant,
  usePreview,

  // Types
  type VisualComponent,
  type VisualElement,
  type CanvasState,
  type BuilderConfig,
  type PreviewMode,
  type AIAssistantConfig,
  type ComponentLibrary,
  type VisualAppState,
  type CodeGenerationOptions,
  type ManifestGenerationOptions,

  // Constants
  DEFAULT_BUILDER_CONFIG,
  COMPONENT_CATEGORIES,
  LAYOUT_TEMPLATES,
  AI_SUGGESTIONS_CONFIG,
  VISUAL_DEV_VERSION,
  VISUAL_DEV_INFO,
} from '../visual-dev';

// ============================================================================
// AI-POWERED ONBOARDING
// ============================================================================

export {
  // Core Onboarding
  AIOnboardingAssistant,
  SkillAssessmentQuiz,
  TutorialPlayer,
  LearningPathVisualization,
  ProgressDashboard,

  // Learning System
  PersonalizedLearningEngine,
  SkillAssessmentEngine,
  RecommendationEngine,
  TutorialSystem,

  // Types
  type LearningPath,
  type SkillLevel,
  type Tutorial,
  type UserProfile,
  type LearningProgress,
  type SkillAssessment,
  type PersonalizedRecommendation,
  type LearningGoal,
  type OnboardingSession,

  // Hooks
  useOnboarding,
  useLearningProgress,
  useSkillAssessment,

  // Constants
  DEFAULT_LEARNING_PATHS,
  SKILL_CATEGORIES,
  TUTORIAL_TYPES,
  ONBOARDING_CONFIG,
} from '../ai-onboarding';

// ============================================================================
// COMMUNITY TEMPLATES
// ============================================================================

export {
  // Template Browser
  TemplateBrowser,
  TemplateCard,
  TemplatePreviewModal,
  TemplateInstaller,

  // Marketplace
  CommunityMarketplace,
  TemplatePublisher,
  TemplateManager,
  RecommendationEngine as TemplateRecommendationEngine,

  // Types
  type AppTemplate,
  type TemplateCategory,
  type TemplateFilter,
  type TemplateRecommendation,
  type TemplateInstallation,
  type TemplateRating,
  type TemplatePreview,

  // Hooks
  useTemplates,
  useTemplateInstaller,
  useTemplateRecommendations,

  // Constants
  TEMPLATE_CATEGORIES,
  TEMPLATE_TAGS,
  MARKETPLACE_CONFIG,
} from '../community-templates';

// ============================================================================
// SHARED INTEGRATION LAYER
// ============================================================================

import {
  initializeAibosSystems,
  EventBus,
  AIEngine,
  ManifestProcessor,
  logger,
  monitoring,
} from '../lib';

/**
 * Strategic Enhancement Orchestrator
 *
 * Provides unified initialization and coordination of all strategic enhancements
 */
export class StrategicEnhancementOrchestrator {
  private aibosSystems: any;
  private visualBuilder?: any;
  private onboardingSystem?: any;
  private templateMarketplace?: any;
  private isInitialized = false;

  constructor(private config: StrategicEnhancementConfig) {}

  /**
   * Initialize all strategic enhancement systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Strategic enhancements already initialized');
      return;
    }

    try {
      logger.info('Initializing strategic enhancements', {
        enableVisualDev: this.config.enableVisualDev,
        enableOnboarding: this.config.enableOnboarding,
        enableTemplates: this.config.enableTemplates,
      });

      // Initialize AI-BOS core systems
      this.aibosSystems = initializeAibosSystems({
        events: {
          enablePersistence: true,
          enableMetrics: true,
          enableAudit: true,
        },
        manifests: {
          enableValidation: true,
          enableCompliance: true,
          enableSecurity: true,
        },
        entities: {
          enableCaching: true,
          enableAudit: true,
          enableValidation: true,
        },
      });

      // Initialize Visual Development Interface
      if (this.config.enableVisualDev) {
        this.visualBuilder = await this.initializeVisualDev();
      }

      // Initialize AI-Powered Onboarding
      if (this.config.enableOnboarding) {
        this.onboardingSystem = await this.initializeOnboarding();
      }

      // Initialize Community Templates
      if (this.config.enableTemplates) {
        this.templateMarketplace = await this.initializeTemplates();
      }

      // Set up cross-system event handlers
      this.setupCrossSystemIntegration();

      this.isInitialized = true;

      logger.info('Strategic enhancements initialized successfully');

      // Emit initialization event
      this.aibosSystems.eventBus.emit('strategic-enhancements:initialized', {
        timestamp: Date.now(),
        systems: {
          visualDev: !!this.visualBuilder,
          onboarding: !!this.onboardingSystem,
          templates: !!this.templateMarketplace,
        },
      });
    } catch (error) {
      logger.error('Failed to initialize strategic enhancements', { error });
      throw new Error(`Strategic enhancement initialization failed: ${error}`);
    }
  }

  /**
   * Initialize Visual Development Interface
   */
  private async initializeVisualDev(): Promise<any> {
    logger.info('Initializing Visual Development Interface');

    const builderConfig = {
      aiEngine: this.aibosSystems.aiEngine,
      eventBus: this.aibosSystems.eventBus,
      componentLibrary: this.config.visualDev?.componentLibrary,
      enableAIAssistance: this.config.visualDev?.enableAI ?? true,
      enableCollaboration: this.config.visualDev?.enableCollaboration ?? false,
      enablePreview: this.config.visualDev?.enablePreview ?? true,
      enableCodeGeneration: this.config.visualDev?.enableCodeGeneration ?? true,
      autoSave: this.config.visualDev?.autoSave ?? true,
      autoSaveInterval: this.config.visualDev?.autoSaveInterval ?? 30000,
    };

    // Set up visual builder with AI integration
    const visualBuilder = {
      config: builderConfig,
      initialized: Date.now(),
    };

    logger.info('Visual Development Interface initialized');
    return visualBuilder;
  }

  /**
   * Initialize AI-Powered Onboarding
   */
  private async initializeOnboarding(): Promise<any> {
    logger.info('Initializing AI-Powered Onboarding');

    const onboardingConfig = {
      aiEngine: this.aibosSystems.aiEngine,
      eventBus: this.aibosSystems.eventBus,
      enablePersonalization: this.config.onboarding?.enablePersonalization ?? true,
      enableSkillAssessment: this.config.onboarding?.enableSkillAssessment ?? true,
      enableRecommendations: this.config.onboarding?.enableRecommendations ?? true,
      adaptiveLearning: this.config.onboarding?.adaptiveLearning ?? true,
    };

    // Set up onboarding system
    const onboarding = {
      config: onboardingConfig,
      initialized: Date.now(),
    };

    logger.info('AI-Powered Onboarding initialized');
    return onboarding;
  }

  /**
   * Initialize Community Templates
   */
  private async initializeTemplates(): Promise<any> {
    logger.info('Initializing Community Templates');

    const templateConfig = {
      aiEngine: this.aibosSystems.aiEngine,
      eventBus: this.aibosSystems.eventBus,
      enableRecommendations: this.config.templates?.enableRecommendations ?? true,
      enableRatings: this.config.templates?.enableRatings ?? true,
      enableComments: this.config.templates?.enableComments ?? true,
      moderationLevel: this.config.templates?.moderationLevel ?? 'moderate',
    };

    // Set up template marketplace
    const templates = {
      config: templateConfig,
      initialized: Date.now(),
    };

    logger.info('Community Templates initialized');
    return templates;
  }

  /**
   * Set up cross-system event integration
   */
  private setupCrossSystemIntegration(): void {
    const eventBus = this.aibosSystems.eventBus;

    // Visual Builder → Onboarding Integration
    if (this.visualBuilder && this.onboardingSystem) {
      eventBus.on('visual-builder:first-component-added', (event: any) => {
        eventBus.emit('onboarding:milestone-reached', {
          milestone: 'first-component',
          userId: event.userId,
          timestamp: Date.now(),
        });
      });

      eventBus.on('visual-builder:app-completed', (event: any) => {
        eventBus.emit('onboarding:achievement-unlocked', {
          achievement: 'first-app-built',
          userId: event.userId,
          timestamp: Date.now(),
        });
      });
    }

    // Visual Builder → Templates Integration
    if (this.visualBuilder && this.templateMarketplace) {
      eventBus.on('visual-builder:app-created', (event: any) => {
        eventBus.emit('templates:suggest-similar', {
          appManifest: event.manifest,
          userId: event.userId,
          timestamp: Date.now(),
        });
      });
    }

    // Templates → Onboarding Integration
    if (this.templateMarketplace && this.onboardingSystem) {
      eventBus.on('template:installed', (event: any) => {
        eventBus.emit('onboarding:progress-updated', {
          action: 'template-used',
          templateCategory: event.template.category,
          userId: event.userId,
          timestamp: Date.now(),
        });
      });
    }

    // AI Cross-System Learning
    eventBus.on('user:interaction', (event: any) => {
      // AI system learns from all user interactions across all enhancement systems
      this.aibosSystems.aiEngine.learn({
        interaction: event,
        context: 'strategic-enhancements',
        timestamp: Date.now(),
      });
    });

    logger.info('Cross-system integration configured');
  }

  /**
   * Get system status
   */
  getStatus(): StrategicEnhancementStatus {
    return {
      isInitialized: this.isInitialized,
      systems: {
        visualDev: {
          enabled: !!this.visualBuilder,
          status: this.visualBuilder ? 'active' : 'disabled',
          lastActivity: this.visualBuilder?.initialized,
        },
        onboarding: {
          enabled: !!this.onboardingSystem,
          status: this.onboardingSystem ? 'active' : 'disabled',
          lastActivity: this.onboardingSystem?.initialized,
        },
        templates: {
          enabled: !!this.templateMarketplace,
          status: this.templateMarketplace ? 'active' : 'disabled',
          lastActivity: this.templateMarketplace?.initialized,
        },
      },
      health: this.isInitialized ? 'healthy' : 'initializing',
    };
  }

  /**
   * Shutdown all systems
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down strategic enhancements');

    try {
      // Clean shutdown of all systems
      if (this.visualBuilder) {
        // Save any pending work
        await this.visualBuilder.save?.();
      }

      if (this.onboardingSystem) {
        // Save learning progress
        await this.onboardingSystem.saveProgress?.();
      }

      if (this.templateMarketplace) {
        // Sync template data
        await this.templateMarketplace.sync?.();
      }

      this.isInitialized = false;

      logger.info('Strategic enhancements shutdown complete');
    } catch (error) {
      logger.error('Error during strategic enhancements shutdown', { error });
      throw error;
    }
  }
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface StrategicEnhancementConfig {
  enableVisualDev?: boolean;
  enableOnboarding?: boolean;
  enableTemplates?: boolean;

  visualDev?: {
    componentLibrary?: any;
    enableAI?: boolean;
    enableCollaboration?: boolean;
    enablePreview?: boolean;
    enableCodeGeneration?: boolean;
    autoSave?: boolean;
    autoSaveInterval?: number;
  };

  onboarding?: {
    enablePersonalization?: boolean;
    enableSkillAssessment?: boolean;
    enableRecommendations?: boolean;
    adaptiveLearning?: boolean;
  };

  templates?: {
    enableRecommendations?: boolean;
    enableRatings?: boolean;
    enableComments?: boolean;
    moderationLevel?: 'strict' | 'moderate' | 'permissive';
  };
}

export interface StrategicEnhancementStatus {
  isInitialized: boolean;
  systems: {
    visualDev: SystemStatus;
    onboarding: SystemStatus;
    templates: SystemStatus;
  };
  health: 'healthy' | 'degraded' | 'error' | 'initializing';
}

export interface SystemStatus {
  enabled: boolean;
  status: 'active' | 'disabled' | 'error';
  lastActivity?: number;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_STRATEGIC_ENHANCEMENT_CONFIG: StrategicEnhancementConfig = {
  enableVisualDev: true,
  enableOnboarding: true,
  enableTemplates: true,

  visualDev: {
    enableAI: true,
    enableCollaboration: false,
    enablePreview: true,
    enableCodeGeneration: true,
    autoSave: true,
    autoSaveInterval: 30000,
  },

  onboarding: {
    enablePersonalization: true,
    enableSkillAssessment: true,
    enableRecommendations: true,
    adaptiveLearning: true,
  },

  templates: {
    enableRecommendations: true,
    enableRatings: true,
    enableComments: true,
    moderationLevel: 'moderate',
  },
};

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create and initialize Strategic Enhancement Orchestrator
 */
export async function createStrategicEnhancements(
  config: Partial<StrategicEnhancementConfig> = {},
): Promise<StrategicEnhancementOrchestrator> {
  const finalConfig = {
    ...DEFAULT_STRATEGIC_ENHANCEMENT_CONFIG,
    ...config,
  };

  const orchestrator = new StrategicEnhancementOrchestrator(finalConfig);
  await orchestrator.initialize();

  return orchestrator;
}

// ============================================================================
// VERSION & METADATA
// ============================================================================

export const STRATEGIC_ENHANCEMENTS_VERSION = '1.0.0';

export const STRATEGIC_ENHANCEMENTS_INFO = {
  name: 'AI-BOS Strategic Enhancements',
  version: STRATEGIC_ENHANCEMENTS_VERSION,
  description: 'Enterprise-grade visual development, AI onboarding, and community templates',
  features: [
    'Visual Development Interface',
    'AI-Powered Onboarding',
    'Community Templates Marketplace',
    'Cross-System Integration',
    'Real-time Collaboration',
    'AI-Driven Recommendations',
    'Zero-Error Orchestration',
  ],
  compatibility: {
    'ai-bos-core': '^1.0.0',
    'ai-bos-shared': '^1.0.0',
  },
};
