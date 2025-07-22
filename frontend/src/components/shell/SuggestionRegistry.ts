// ==================== TYPES ====================
export interface SuggestionManifest {
  id: string;
  appId: string;
  appName: string;
  version: string;
  suggestions: SuggestionDefinition[];
  permissions: string[];
  metadata: {
    description: string;
    author: string;
    category: string;
    tags: string[];
  };
}

export interface SuggestionDefinition {
  id: string;
  type: 'app' | 'folder' | 'action' | 'tip' | 'workflow';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  triggers: SuggestionTrigger[];
  conditions: SuggestionCondition[];
  action: {
    type: 'navigate' | 'execute' | 'install' | 'configure' | 'custom';
    payload: any;
    handler?: string; // Custom handler function name
  };
  confidence: number; // 0-1 score for auto-execution
  feedback: {
    helpful: number;
    notHelpful: number;
    totalResponses: number;
  };
}

export interface SuggestionTrigger {
  type: 'user_action' | 'time_based' | 'usage_pattern' | 'system_event';
  event: string;
  conditions?: Record<string, any>;
}

export interface SuggestionCondition {
  type: 'app_installed' | 'usage_frequency' | 'user_role' | 'system_state' | 'custom';
  condition: string;
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
}

// ==================== REGISTRY CLASS ====================
class SuggestionRegistry {
  private manifests: Map<string, SuggestionManifest> = new Map();
  private suggestions: Map<string, SuggestionDefinition> = new Map();
  private handlers: Map<string, Function> = new Map();
  private usageTracker: Map<string, number> = new Map();
  private feedbackTracker: Map<string, { helpful: number; notHelpful: number }> = new Map();

  // Register a new suggestion manifest
  registerManifest(manifest: SuggestionManifest): void {
    this.manifests.set(manifest.id, manifest);

    // Register all suggestions from this manifest
    manifest.suggestions.forEach(suggestion => {
      const fullId = `${manifest.appId}:${suggestion.id}`;
      this.suggestions.set(fullId, {
        ...suggestion,
        id: fullId,
        feedback: {
          helpful: 0,
          notHelpful: 0,
          totalResponses: 0
        }
      });
    });

    console.log(`📦 Registered ${manifest.suggestions.length} suggestions from ${manifest.appName}`);
  }

  // Register a custom action handler
  registerHandler(handlerName: string, handler: Function): void {
    this.handlers.set(handlerName, handler);
  }

  // Get all suggestions for a given context
  getSuggestions(context: {
    userRole?: string;
    installedApps?: string[];
    recentActions?: string[];
    systemState?: Record<string, any>;
  }): SuggestionDefinition[] {
    const suggestions: SuggestionDefinition[] = [];

    Array.from(this.suggestions.entries()).forEach(([id, suggestion]) => {
      if (this.evaluateConditions(suggestion, context)) {
        suggestions.push(suggestion);
      }
    });

    // Sort by priority and confidence
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aScore = priorityOrder[a.priority] * a.confidence;
      const bScore = priorityOrder[b.priority] * b.confidence;
      return bScore - aScore;
    });
  }

  // Evaluate if a suggestion should be shown based on conditions
  private evaluateConditions(suggestion: SuggestionDefinition, context: any): boolean {
    for (const condition of suggestion.conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(condition: SuggestionCondition, context: any): boolean {
    const { type, condition: conditionKey, value, operator } = condition;

    switch (type) {
      case 'app_installed':
        const isInstalled = (context.installedApps || []).includes(value);
        return operator === 'equals' ? isInstalled : !isInstalled;

      case 'usage_frequency':
        const usage = this.usageTracker.get(value) || 0;
        switch (operator) {
          case 'greater_than': return usage > value;
          case 'less_than': return usage < value;
          case 'equals': return usage === value;
          default: return false;
        }

      case 'user_role':
        const hasRole = context.userRole === value;
        return operator === 'equals' ? hasRole : !hasRole;

      case 'system_state':
        const stateValue = context.systemState?.[conditionKey];
        switch (operator) {
          case 'equals': return stateValue === value;
          case 'contains': return stateValue?.includes?.(value);
          case 'greater_than': return stateValue > value;
          case 'less_than': return stateValue < value;
          default: return false;
        }

      default:
        return true;
    }
  }

  // Execute a suggestion action
  async executeSuggestion(suggestionId: string, context: any): Promise<any> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    const { action } = suggestion;

    switch (action.type) {
      case 'navigate':
        return { type: 'navigate', payload: action.payload };

      case 'execute':
        return { type: 'execute', payload: action.payload };

      case 'install':
        return { type: 'install', payload: action.payload };

      case 'configure':
        return { type: 'configure', payload: action.payload };

      case 'custom':
        const handler = this.handlers.get(action.handler!);
        if (handler) {
          return await handler(action.payload, context);
        }
        throw new Error(`Custom handler ${action.handler} not found`);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Track suggestion usage
  trackUsage(suggestionId: string): void {
    const current = this.usageTracker.get(suggestionId) || 0;
    this.usageTracker.set(suggestionId, current + 1);
  }

  // Record user feedback
  recordFeedback(suggestionId: string, wasHelpful: boolean): void {
    const suggestion = this.suggestions.get(suggestionId);
    if (suggestion) {
      if (wasHelpful) {
        suggestion.feedback.helpful++;
      } else {
        suggestion.feedback.notHelpful++;
      }
      suggestion.feedback.totalResponses++;
    }

    const current = this.feedbackTracker.get(suggestionId) || { helpful: 0, notHelpful: 0 };
    if (wasHelpful) {
      current.helpful++;
    } else {
      current.notHelpful++;
    }
    this.feedbackTracker.set(suggestionId, current);
  }

  // Get suggestion analytics
  getAnalytics(): {
    totalSuggestions: number;
    totalManifests: number;
    mostUsedSuggestions: Array<{ id: string; usage: number }>;
    bestRatedSuggestions: Array<{ id: string; rating: number }>;
  } {
    const mostUsed = Array.from(this.usageTracker.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id, usage]) => ({ id, usage }));

    const bestRated = Array.from(this.suggestions.values())
      .filter(s => s.feedback.totalResponses > 0)
      .map(s => ({
        id: s.id,
        rating: s.feedback.helpful / s.feedback.totalResponses
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    return {
      totalSuggestions: this.suggestions.size,
      totalManifests: this.manifests.size,
      mostUsedSuggestions: mostUsed,
      bestRatedSuggestions: bestRated
    };
  }

  // Get suggestions by app
  getSuggestionsByApp(appId: string): SuggestionDefinition[] {
    return Array.from(this.suggestions.values())
      .filter(s => s.id.startsWith(`${appId}:`));
  }

  // Unregister a manifest
  unregisterManifest(manifestId: string): void {
    const manifest = this.manifests.get(manifestId);
    if (manifest) {
      manifest.suggestions.forEach(suggestion => {
        const fullId = `${manifest.appId}:${suggestion.id}`;
        this.suggestions.delete(fullId);
      });
      this.manifests.delete(manifestId);
    }
  }
}

// ==================== SINGLETON INSTANCE ====================
export const suggestionRegistry = new SuggestionRegistry();

// ==================== CONVENIENCE FUNCTIONS ====================
export const registerSuggestionManifest = (manifest: SuggestionManifest) => {
  suggestionRegistry.registerManifest(manifest);
};

export const getSuggestions = (context: any) => {
  return suggestionRegistry.getSuggestions(context);
};

export const executeSuggestion = (suggestionId: string, context: any) => {
  return suggestionRegistry.executeSuggestion(suggestionId, context);
};

export const trackSuggestionUsage = (suggestionId: string) => {
  suggestionRegistry.trackUsage(suggestionId);
};

export const recordSuggestionFeedback = (suggestionId: string, wasHelpful: boolean) => {
  suggestionRegistry.recordFeedback(suggestionId, wasHelpful);
};

export default suggestionRegistry;
