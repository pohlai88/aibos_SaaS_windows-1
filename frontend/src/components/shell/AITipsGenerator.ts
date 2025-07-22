// ==================== TYPES ====================
export interface AITip {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'efficiency' | 'discovery' | 'optimization' | 'learning';
  priority: 'high' | 'medium' | 'low';
  relevance: number; // 0-1 score
  context: string[];
  action?: {
    type: 'navigate' | 'execute' | 'configure' | 'learn';
    payload: any;
  };
  metadata: {
    generatedAt: Date;
    model: string;
    confidence: number;
    userSegment: string;
    tags: string[];
  };
}

export interface UserContext {
  userId: string;
  role: string;
  recentActions: string[];
  usagePatterns: string[];
  preferences: Record<string, any>;
  systemState: Record<string, any>;
  sessionDuration: number;
  featureUsage: Record<string, number>;
}

export interface TipGenerationRequest {
  context: UserContext;
  category?: string;
  limit?: number;
  minRelevance?: number;
  includeActions?: boolean;
}

export interface TipGenerationResult {
  tips: AITip[];
  generationTime: number;
  modelUsed: string;
  contextAnalyzed: boolean;
  recommendations: string[];
}

// ==================== AI TIPS GENERATOR ====================
class AITipsGenerator {
  private tipsDatabase: AITip[] = [];
  private userContexts: Map<string, UserContext> = new Map();
  private generationHistory: TipGenerationResult[] = [];
  private modelConfig = {
    name: 'ai-bos-tips-v1',
    maxTokens: 500,
    temperature: 0.7,
    topP: 0.9
  };

  // Initialize with base tips
  initialize(): void {
    this.loadBaseTips();
    console.log('🧠 AI Tips Generator initialized');
  }

  // Load base tips from predefined knowledge base
  private loadBaseTips(): void {
    this.tipsDatabase = [
      {
        id: 'tip-001',
        title: 'Organize Your Desktop',
        description: 'Create folders to group related apps and keep your workspace clean. Right-click on the desktop to create new folders.',
        category: 'productivity',
        priority: 'high',
        relevance: 0.9,
        context: ['new_user', 'desktop_cluttered'],
        action: {
          type: 'navigate',
          payload: { target: 'desktop_organize' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.95,
          userSegment: 'new_user',
          tags: ['organization', 'desktop', 'folders']
        }
      },
      {
        id: 'tip-002',
        title: 'Use Keyboard Shortcuts',
        description: 'Press Ctrl+Space to quickly search and launch apps. This can save you time navigating through menus.',
        category: 'efficiency',
        priority: 'medium',
        relevance: 0.8,
        context: ['frequent_app_launch', 'keyboard_user'],
        action: {
          type: 'learn',
          payload: { topic: 'keyboard_shortcuts' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.88,
          userSegment: 'power_user',
          tags: ['shortcuts', 'efficiency', 'keyboard']
        }
      },
      {
        id: 'tip-003',
        title: 'Explore Smart Suggestions',
        description: 'The AI-powered suggestions panel learns from your behavior to provide personalized recommendations.',
        category: 'discovery',
        priority: 'medium',
        relevance: 0.7,
        context: ['ai_features', 'personalization'],
        action: {
          type: 'navigate',
          payload: { target: 'smart_suggestions' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.82,
          userSegment: 'curious_user',
          tags: ['ai', 'suggestions', 'personalization']
        }
      },
      {
        id: 'tip-004',
        title: 'Customize Your Theme',
        description: 'Switch between light and dark themes based on your preference and environment. Find the theme switcher in the top-right corner.',
        category: 'optimization',
        priority: 'low',
        relevance: 0.6,
        context: ['theme_preference', 'customization'],
        action: {
          type: 'configure',
          payload: { setting: 'theme_switcher' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.75,
          userSegment: 'customization_user',
          tags: ['theme', 'customization', 'preferences']
        }
      },
      {
        id: 'tip-005',
        title: 'Enable Auto-Execute',
        description: 'Allow the system to automatically perform high-confidence actions to streamline your workflow.',
        category: 'efficiency',
        priority: 'high',
        relevance: 0.85,
        context: ['repetitive_tasks', 'automation'],
        action: {
          type: 'configure',
          payload: { setting: 'auto_execute' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.92,
          userSegment: 'efficiency_user',
          tags: ['automation', 'efficiency', 'auto_execute']
        }
      }
    ];
  }

  // Update user context
  updateUserContext(userId: string, context: Partial<UserContext>): void {
    const existing = this.userContexts.get(userId) || {
      userId,
      role: 'user',
      recentActions: [],
      usagePatterns: [],
      preferences: {},
      systemState: {},
      sessionDuration: 0,
      featureUsage: {}
    };

    this.userContexts.set(userId, { ...existing, ...context });
  }

  // Generate personalized tips
  async generateTips(request: TipGenerationRequest): Promise<TipGenerationResult> {
    const startTime = Date.now();
    const { context, category, limit = 5, minRelevance = 0.5, includeActions = true } = request;

    // Analyze user context
    const analyzedContext = this.analyzeUserContext(context);

    // Generate personalized tips
    const personalizedTips = await this.generatePersonalizedTips(analyzedContext, category);

    // Filter and rank tips
    const filteredTips = this.filterAndRankTips(personalizedTips, {
      minRelevance,
      includeActions,
      limit
    });

    const generationTime = Date.now() - startTime;

    const result: TipGenerationResult = {
      tips: filteredTips,
      generationTime,
      modelUsed: this.modelConfig.name,
      contextAnalyzed: true,
      recommendations: this.generateRecommendations(analyzedContext)
    };

    this.generationHistory.push(result);
    return result;
  }

  // Analyze user context for patterns and insights
  private analyzeUserContext(context: UserContext): {
    patterns: string[];
    preferences: string[];
    opportunities: string[];
    userSegment: string;
    behaviorScore: number;
  } {
    const patterns: string[] = [];
    const preferences: string[] = [];
    const opportunities: string[] = [];

    // Analyze recent actions
    if ((context.recentActions || []).some(action => (action || '').includes('folder'))) {
      patterns.push('folder_user');
    }
    if ((context.recentActions || []).some(action => (action || '').includes('search'))) {
      patterns.push('search_user');
    }

    // Analyze usage patterns
    if ((context.usagePatterns || []).includes('keyboard_shortcuts')) {
      patterns.push('keyboard_user');
    }
    if ((context.usagePatterns || []).includes('mouse_navigation')) {
      patterns.push('mouse_user');
    }

    // Analyze feature usage
    const featureUsage = context.featureUsage;
    const mostUsedFeature = Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)[0];

    if (mostUsedFeature) {
      patterns.push(`${mostUsedFeature[0]}_heavy_user`);
    }

    // Identify opportunities
    if (context.sessionDuration > 300000) { // 5 minutes
      opportunities.push('long_session_optimization');
    }
    if (Object.keys(featureUsage).length < 3) {
      opportunities.push('feature_discovery');
    }
    if (!(context.usagePatterns || []).includes('ai_features')) {
      opportunities.push('ai_adoption');
    }

    // Determine user segment
    const userSegment = this.determineUserSegment(patterns, context);

    // Calculate behavior score
    const behaviorScore = this.calculateBehaviorScore(context);

    return {
      patterns,
      preferences,
      opportunities,
      userSegment,
      behaviorScore
    };
  }

  private determineUserSegment(patterns: string[], context: UserContext): string {
    if ((patterns || []).includes('frequent_user') && context.sessionDuration > 600000) {
      return 'power_user';
    }
    if ((patterns || []).includes('ai_adoption')) {
      return 'curious_user';
    }
    if ((context.recentActions || []).length < 5) {
      return 'new_user';
    }
    if ((patterns || []).includes('keyboard_user')) {
      return 'efficiency_user';
    }
    return 'regular_user';
  }

  private calculateBehaviorScore(context: UserContext): number {
    let score = 0.5; // Base score

    // Session duration bonus
    if (context.sessionDuration > 300000) score += 0.1;
    if (context.sessionDuration > 900000) score += 0.1;

    // Feature usage bonus
    const featureCount = Object.keys(context.featureUsage).length;
    if (featureCount > 5) score += 0.1;
    if (featureCount > 10) score += 0.1;

    // Recent actions bonus
    if ((context.recentActions || []).length > 10) score += 0.1;

    return Math.min(1, score);
  }

  // Generate personalized tips based on context
  private async generatePersonalizedTips(
    analyzedContext: ReturnType<typeof this.analyzeUserContext>,
    category?: string
  ): Promise<AITip[]> {
    const { patterns, opportunities, userSegment, behaviorScore } = analyzedContext;

    // Start with base tips
    let tips = [...this.tipsDatabase];

    // Filter by category if specified
    if (category) {
      tips = tips.filter(tip => tip.category === category);
    }

    // Generate contextual tips based on patterns
    const contextualTips = await this.generateContextualTips(patterns, opportunities, userSegment);
    tips.push(...contextualTips);

    // Adjust relevance based on user context
    tips = tips.map(tip => ({
      ...tip,
      relevance: this.calculateTipRelevance(tip, analyzedContext)
    }));

    return tips;
  }

  // Generate contextual tips based on user patterns
  private async generateContextualTips(
    patterns: string[],
    opportunities: string[],
    userSegment: string
  ): Promise<AITip[]> {
    const contextualTips: AITip[] = [];

    // Generate tips based on patterns
    if ((patterns || []).includes('frequent_user')) {
      contextualTips.push({
        id: `tip-${Date.now()}-001`,
        title: 'Optimize Your Workflow',
        description: 'Based on your frequent usage, consider setting up custom shortcuts for your most-used actions.',
        category: 'efficiency',
        priority: 'high',
        relevance: 0.9,
        context: ['frequent_user', 'workflow_optimization'],
        action: {
          type: 'configure',
          payload: { setting: 'custom_shortcuts' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.88,
          userSegment,
          tags: ['workflow', 'shortcuts', 'optimization']
        }
      });
    }

    if ((opportunities || []).includes('ai_adoption')) {
      contextualTips.push({
        id: `tip-${Date.now()}-002`,
        title: 'Try AI-Powered Features',
        description: 'Discover how AI can enhance your experience with smart suggestions and automated workflows.',
        category: 'discovery',
        priority: 'medium',
        relevance: 0.8,
        context: ['ai_adoption', 'feature_discovery'],
        action: {
          type: 'navigate',
          payload: { target: 'ai_features_tour' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.85,
          userSegment,
          tags: ['ai', 'discovery', 'features']
        }
      });
    }

    if ((opportunities || []).includes('feature_discovery')) {
      contextualTips.push({
        id: `tip-${Date.now()}-003`,
        title: 'Explore Hidden Features',
        description: 'There are many powerful features waiting to be discovered. Take a tour to see what you might be missing.',
        category: 'discovery',
        priority: 'medium',
        relevance: 0.75,
        context: ['feature_discovery', 'learning'],
        action: {
          type: 'learn',
          payload: { topic: 'feature_tour' }
        },
        metadata: {
          generatedAt: new Date(),
          model: this.modelConfig.name,
          confidence: 0.82,
          userSegment,
          tags: ['discovery', 'features', 'tour']
        }
      });
    }

    return contextualTips;
  }

  // Calculate tip relevance based on user context
  private calculateTipRelevance(tip: AITip, context: ReturnType<typeof this.analyzeUserContext>): number {
    let relevance = tip.metadata.confidence;

    // Context matching bonus
    const contextMatches = tip.context.filter(c =>
      (context.patterns || []).includes(c) || (context.opportunities || []).includes(c)
    );
    relevance += contextMatches.length * 0.1;

    // User segment matching bonus
    if (tip.metadata.userSegment === context.userSegment) {
      relevance += 0.15;
    }

    // Behavior score influence
    relevance += context.behaviorScore * 0.1;

    return Math.min(1, relevance);
  }

  // Filter and rank tips
  private filterAndRankTips(tips: AITip[], options: {
    minRelevance: number;
    includeActions: boolean;
    limit: number;
  }): AITip[] {
    let filtered = tips.filter(tip => tip.relevance >= options.minRelevance);

    if (!options.includeActions) {
      filtered = filtered.filter(tip => !tip.action);
    }

    // Sort by relevance and priority
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aScore = a.relevance * priorityOrder[a.priority];
      const bScore = b.relevance * priorityOrder[b.priority];
      return bScore - aScore;
    });

    return filtered.slice(0, options.limit);
  }

  // Generate recommendations based on context analysis
  private generateRecommendations(context: ReturnType<typeof this.analyzeUserContext>): string[] {
    const recommendations: string[] = [];

    if ((context.opportunities || []).includes('ai_adoption')) {
      recommendations.push('Consider exploring AI-powered features to enhance your workflow');
    }

    if ((context.opportunities || []).includes('feature_discovery')) {
      recommendations.push('Take time to explore advanced features for better productivity');
    }

    if (context.behaviorScore > 0.8) {
      recommendations.push('You\'re making great use of the system! Consider sharing feedback to help improve it');
    }

    return recommendations;
  }

  // Get generation history
  getGenerationHistory(): TipGenerationResult[] {
    return [...this.generationHistory];
  }

  // Get tips by category
  getTipsByCategory(category: string): AITip[] {
    return this.tipsDatabase.filter(tip => tip.category === category);
  }

  // Add custom tip
  addCustomTip(tip: Omit<AITip, 'id' | 'metadata'>): void {
    const customTip: AITip = {
      ...tip,
      id: `custom-tip-${Date.now()}`,
      metadata: {
        generatedAt: new Date(),
        model: 'custom',
        confidence: 0.8,
        userSegment: 'custom',
        tags: []
      }
    };
    this.tipsDatabase.push(customTip);
  }

  // Clear generation history
  clearHistory(): void {
    this.generationHistory = [];
  }
}

// ==================== SINGLETON INSTANCE ====================
export const aiTipsGenerator = new AITipsGenerator();

// ==================== CONVENIENCE FUNCTIONS ====================
export const initializeAITips = () => {
  aiTipsGenerator.initialize();
};

export const updateUserContext = (userId: string, context: Partial<UserContext>) => {
  aiTipsGenerator.updateUserContext(userId, context);
};

export const generateAITips = (request: TipGenerationRequest) => {
  return aiTipsGenerator.generateTips(request);
};

export const getAITipsHistory = () => {
  return aiTipsGenerator.getGenerationHistory();
};

export const getAITipsByCategory = (category: string) => {
  return aiTipsGenerator.getTipsByCategory(category);
};

export const addCustomAITip = (tip: Omit<AITip, 'id' | 'metadata'>) => {
  aiTipsGenerator.addCustomTip(tip);
};

export default aiTipsGenerator;
