// ==================== TYPES ====================
export interface AutoExecuteAction {
  id: string;
  type: 'suggestion' | 'workflow' | 'optimization' | 'maintenance';
  title: string;
  description: string;
  confidence: number; // 0-1 score
  estimatedTime: number; // in milliseconds
  impact: 'low' | 'medium' | 'high';
  category: string;
  action: () => Promise<any>;
  undo?: () => Promise<any>;
  requirements: string[];
  risks: string[];
  benefits: string[];
}

export interface AutoExecuteContext {
  userId: string;
  sessionId: string;
  userRole: string;
  recentActions: string[];
  systemState: Record<string, any>;
  preferences: {
    autoExecuteEnabled: boolean;
    confidenceThreshold: number;
    maxActionsPerSession: number;
    categories: string[];
  };
}

export interface AutoExecuteResult {
  success: boolean;
  actionId: string;
  result?: any;
  error?: string;
  executionTime: number;
  userFeedback?: 'helpful' | 'not_helpful' | 'neutral';
  timestamp: Date;
}

// ==================== AUTO-EXECUTE MANAGER ====================
class AutoExecuteManager {
  private actions: Map<string, AutoExecuteAction> = new Map();
  private results: AutoExecuteResult[] = [];
  private context: AutoExecuteContext | null = null;
  private isEnabled: boolean = true;
  private confidenceThreshold: number = 0.8;
  private maxActionsPerSession: number = 5;
  private actionsExecutedThisSession: number = 0;

  // Initialize with user context
  initialize(context: AutoExecuteContext): void {
    this.context = context;
    this.isEnabled = context.preferences.autoExecuteEnabled;
    this.confidenceThreshold = context.preferences.confidenceThreshold;
    this.maxActionsPerSession = context.preferences.maxActionsPerSession;
    this.actionsExecutedThisSession = 0;

    console.log('🤖 Auto-execute manager initialized');
  }

  // Register an auto-execute action
  registerAction(action: AutoExecuteAction): void {
    this.actions.set(action.id, action);
    console.log(`🤖 Registered auto-execute action: ${action.title} (confidence: ${action.confidence})`);
  }

  // Get available actions for current context
  getAvailableActions(): AutoExecuteAction[] {
    if (!this.context || !this.isEnabled) return [];

    const availableActions: AutoExecuteAction[] = [];

    Array.from(this.actions.values()).forEach(action => {
      if (this.shouldExecuteAction(action)) {
        availableActions.push(action);
      }
    });

    // Sort by confidence and impact
    return availableActions.sort((a, b) => {
      const aScore = a.confidence * this.getImpactScore(a.impact);
      const bScore = b.confidence * this.getImpactScore(b.impact);
      return bScore - aScore;
    });
  }

  private shouldExecuteAction(action: AutoExecuteAction): boolean {
    if (!this.context) return false;

    // Check confidence threshold
    if (action.confidence < this.confidenceThreshold) return false;

    // Check session limits
    if (this.actionsExecutedThisSession >= this.maxActionsPerSession) return false;

    // Check category preferences
    if (!(this.context.preferences?.categories || []).includes(action.category)) return false;

    // Check requirements
    if (!this.checkRequirements(action.requirements)) return false;

    return true;
  }

  private getImpactScore(impact: string): number {
    switch (impact) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private checkRequirements(requirements: string[]): boolean {
    if (!this.context) return false;

    return requirements.every(req => {
      // Check if requirement is met based on context
      switch (req) {
        case 'user_authenticated':
          return !!this.context!.userId;
        case 'session_active':
          return !!this.context!.sessionId;
        case 'admin_role':
          return this.context!.userRole === 'admin';
        case 'recent_activity':
          return this.context!.recentActions.length > 0;
        default:
          return this.context!.systemState[req] === true;
      }
    });
  }

  // Execute an action automatically
  async executeAction(actionId: string, userConsent: boolean = false): Promise<AutoExecuteResult> {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    if (!userConsent && action.confidence < 0.95) {
      throw new Error('User consent required for actions with confidence < 0.95');
    }

    const startTime = Date.now();
    let result: any;
    let error: string | undefined;

    try {
      result = await action.action();
      this.actionsExecutedThisSession++;

      console.log(`🤖 Auto-executed: ${action.title} (${Date.now() - startTime}ms)`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`🤖 Auto-execute failed: ${action.title}`, err);
    }

    const executionResult: AutoExecuteResult = {
      success: !error,
      actionId,
      result,
      error,
      executionTime: Date.now() - startTime,
      timestamp: new Date()
    };

    this.results.push(executionResult);
    return executionResult;
  }

  // Undo an action
  async undoAction(actionId: string): Promise<AutoExecuteResult> {
    const action = this.actions.get(actionId);
    if (!action || !action.undo) {
      throw new Error(`Cannot undo action ${actionId}`);
    }

    const startTime = Date.now();
    let result: any;
    let error: string | undefined;

    try {
      result = await action.undo();
      console.log(`🤖 Undid action: ${action.title}`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`🤖 Undo failed: ${action.title}`, err);
    }

    const undoResult: AutoExecuteResult = {
      success: !error,
      actionId: `${actionId}_undo`,
      result,
      error,
      executionTime: Date.now() - startTime,
      timestamp: new Date()
    };

    this.results.push(undoResult);
    return undoResult;
  }

  // Get execution history
  getExecutionHistory(): AutoExecuteResult[] {
    return [...this.results];
  }

  // Record user feedback
  recordFeedback(actionId: string, feedback: 'helpful' | 'not_helpful' | 'neutral'): void {
    const result = this.results.find(r => r.actionId === actionId);
    if (result) {
      result.userFeedback = feedback;
    }
  }

  // Get analytics
  getAnalytics(): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    mostExecutedActions: Array<{ actionId: string; count: number }>;
    userSatisfaction: number;
    recommendations: string[];
  } {
    const totalExecutions = this.results.length;
    const successfulExecutions = this.results.filter(r => r.success).length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const averageExecutionTime = this.results.length > 0
      ? this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length
      : 0;

    const actionCounts = new Map<string, number>();
    this.results.forEach(result => {
      const count = actionCounts.get(result.actionId) || 0;
      actionCounts.set(result.actionId, count + 1);
    });

    const mostExecutedActions = Array.from(actionCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([actionId, count]) => ({ actionId, count }));

    const feedbackResults = this.results.filter(r => r.userFeedback);
    const userSatisfaction = feedbackResults.length > 0
      ? feedbackResults.reduce((sum, r) => {
          switch (r.userFeedback) {
            case 'helpful': return sum + 1;
            case 'not_helpful': return sum - 1;
            default: return sum;
          }
        }, 0) / feedbackResults.length
      : 0;

    const recommendations = this.generateRecommendations();

    return {
      totalExecutions,
      successRate,
      averageExecutionTime,
      mostExecutedActions,
      userSatisfaction,
      recommendations
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = this.getAnalytics();

    if (analytics.successRate < 0.8) {
      recommendations.push('Consider adjusting confidence thresholds to improve success rate');
    }

    if (analytics.userSatisfaction < 0.5) {
      recommendations.push('Review auto-execute actions to better match user expectations');
    }

    if (this.actionsExecutedThisSession === 0) {
      recommendations.push('No actions executed this session - consider lowering confidence threshold');
    }

    return recommendations;
  }

  // Update context
  updateContext(updates: Partial<AutoExecuteContext>): void {
    if (this.context) {
      this.context = { ...this.context, ...updates };
    }
  }

  // Enable/disable auto-execute
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🤖 Auto-execute ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Set confidence threshold
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`🤖 Confidence threshold set to ${this.confidenceThreshold}`);
  }

  // Clear history
  clearHistory(): void {
    this.results = [];
  }

  // Get action details
  getAction(actionId: string): AutoExecuteAction | undefined {
    return this.actions.get(actionId);
  }

  // List all registered actions
  getAllActions(): AutoExecuteAction[] {
    return Array.from(this.actions.values());
  }
}

// ==================== SINGLETON INSTANCE ====================
export const autoExecuteManager = new AutoExecuteManager();

// ==================== CONVENIENCE FUNCTIONS ====================
export const initializeAutoExecute = (context: AutoExecuteContext) => {
  autoExecuteManager.initialize(context);
};

export const registerAutoExecuteAction = (action: AutoExecuteAction) => {
  autoExecuteManager.registerAction(action);
};

export const getAvailableAutoExecuteActions = () => {
  return autoExecuteManager.getAvailableActions();
};

export const executeAutoAction = (actionId: string, userConsent?: boolean) => {
  return autoExecuteManager.executeAction(actionId, userConsent);
};

export const undoAutoAction = (actionId: string) => {
  return autoExecuteManager.undoAction(actionId);
};

export const getAutoExecuteAnalytics = () => {
  return autoExecuteManager.getAnalytics();
};

export const recordAutoExecuteFeedback = (actionId: string, feedback: 'helpful' | 'not_helpful' | 'neutral') => {
  autoExecuteManager.recordFeedback(actionId, feedback);
};

export default autoExecuteManager;
