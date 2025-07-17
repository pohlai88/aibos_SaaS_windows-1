import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Suggestion context interface
interface SuggestionContext {
  userRole: string;
  currentPage: string;
  userActions: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  previousSuggestions: string[];
  dismissedSuggestions: string[];
  userPreferences: {
    suggestionFrequency: 'low' | 'medium' | 'high';
    suggestionTypes: string[];
    privacyLevel: 'minimal' | 'standard' | 'enhanced';
  };
}

// Suggestion data
interface Suggestion {
  id: string;
  text: string;
  type: 'action' | 'tip' | 'shortcut' | 'feature' | 'optimization';
  priority: 'low' | 'medium' | 'high';
  context: string[];
  relevance: number;
  privacySafe: boolean;
  userFeedback?: {
    helpful: number;
    notHelpful: number;
    dismissed: number;
  };
  expiresAt?: Date;
}

// Privacy-safe suggestion engine
class PrivacySafeSuggestionEngine {
  private context: SuggestionContext;
  private suggestions: Map<string, Suggestion> = new Map();
  private userHistory: string[] = [];
  private dismissedSuggestions: Set<string> = new Set();
  private suggestionCooldowns: Map<string, number> = new Map();
  private maxSuggestionsPerSession = 5;
  private sessionSuggestionCount = 0;

  constructor(context: SuggestionContext) {
    this.context = context;
    this.initializeSuggestions();
  }

  // Initialize suggestion database
  private initializeSuggestions() {
    const baseSuggestions: Suggestion[] = [
      {
        id: 'quick-actions',
        text: 'Try using Ctrl+K for quick actions',
        type: 'shortcut',
        priority: 'medium',
        context: ['general', 'productivity'],
        relevance: 0.8,
        privacySafe: true,
      },
      {
        id: 'data-export',
        text: 'Export your data to CSV for analysis',
        type: 'feature',
        priority: 'low',
        context: ['data', 'export'],
        relevance: 0.6,
        privacySafe: true,
      },
      {
        id: 'keyboard-nav',
        text: 'Use Tab to navigate between fields quickly',
        type: 'tip',
        priority: 'medium',
        context: ['accessibility', 'productivity'],
        relevance: 0.7,
        privacySafe: true,
      },
      {
        id: 'auto-save',
        text: 'Your work is automatically saved every 30 seconds',
        type: 'tip',
        priority: 'low',
        context: ['safety', 'productivity'],
        relevance: 0.5,
        privacySafe: true,
      },
      {
        id: 'dark-mode',
        text: 'Switch to dark mode for better eye comfort',
        type: 'feature',
        priority: 'low',
        context: ['preferences', 'accessibility'],
        relevance: 0.4,
        privacySafe: true,
      },
      {
        id: 'bulk-actions',
        text: 'Select multiple items to perform bulk operations',
        type: 'tip',
        priority: 'medium',
        context: ['productivity', 'bulk'],
        relevance: 0.7,
        privacySafe: true,
      },
      {
        id: 'search-filters',
        text: 'Use advanced filters to find exactly what you need',
        type: 'feature',
        priority: 'medium',
        context: ['search', 'productivity'],
        relevance: 0.6,
        privacySafe: true,
      },
      {
        id: 'undo-redo',
        text: 'Use Ctrl+Z to undo and Ctrl+Y to redo actions',
        type: 'shortcut',
        priority: 'high',
        context: ['safety', 'productivity'],
        relevance: 0.9,
        privacySafe: true,
      },
    ];

    baseSuggestions.forEach((suggestion) => {
      this.suggestions.set(suggestion.id, suggestion);
    });
  }

  // Get relevant suggestions based on context
  getSuggestions(limit: number = 3): Suggestion[] {
    if (this.sessionSuggestionCount >= this.maxSuggestionsPerSession) {
      return [];
    }

    const now = Date.now();
    const availableSuggestions = Array.from(this.suggestions.values())
      .filter((suggestion) => {
        // Check if suggestion is not dismissed
        if (this.dismissedSuggestions.has(suggestion.id)) {
          return false;
        }

        // Check cooldown
        const cooldown = this.suggestionCooldowns.get(suggestion.id) || 0;
        if (now < cooldown) {
          return false;
        }

        // Check expiration
        if (suggestion.expiresAt && suggestion.expiresAt < new Date()) {
          return false;
        }

        // Check privacy level
        if (!this.isPrivacySafe(suggestion)) {
          return false;
        }

        return true;
      })
      .map((suggestion) => ({
        ...suggestion,
        relevance: this.calculateRelevance(suggestion),
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    // Apply frequency controls
    const filteredSuggestions = this.applyFrequencyControls(availableSuggestions);

    return filteredSuggestions;
  }

  // Calculate suggestion relevance
  private calculateRelevance(suggestion: Suggestion): number {
    let relevance = suggestion.relevance;

    // Context matching
    const contextMatch = this.context.userActions.some((action) =>
      suggestion.context.some((ctx) => action.toLowerCase().includes(ctx)),
    );
    if (contextMatch) relevance += 0.2;

    // Time-based relevance
    const hour = new Date().getHours();
    if (hour < 12 && suggestion.context.includes('morning')) relevance += 0.1;
    if (hour >= 12 && hour < 17 && suggestion.context.includes('afternoon')) relevance += 0.1;
    if (hour >= 17 && suggestion.context.includes('evening')) relevance += 0.1;

    // User preference matching
    if (this.context.userPreferences.suggestionTypes.includes(suggestion.type)) {
      relevance += 0.15;
    }

    // Previous suggestion avoidance
    if (this.context.previousSuggestions.includes(suggestion.id)) {
      relevance -= 0.3;
    }

    // Feedback-based adjustment
    if (suggestion.userFeedback) {
      const totalFeedback = suggestion.userFeedback.helpful + suggestion.userFeedback.notHelpful;
      if (totalFeedback > 0) {
        const helpfulRatio = suggestion.userFeedback.helpful / totalFeedback;
        relevance += (helpfulRatio - 0.5) * 0.2;
      }
    }

    return Math.max(0, Math.min(1, relevance));
  }

  // Apply frequency controls based on user preferences
  private applyFrequencyControls(suggestions: Suggestion[]): Suggestion[] {
    const { suggestionFrequency } = this.context.userPreferences;

    switch (suggestionFrequency) {
      case 'low':
        return suggestions.slice(0, 1);
      case 'medium':
        return suggestions.slice(0, 2);
      case 'high':
        return suggestions.slice(0, 3);
      default:
        return suggestions.slice(0, 2);
    }
  }

  // Check if suggestion is privacy safe
  private isPrivacySafe(suggestion: Suggestion): boolean {
    if (!suggestion.privacySafe) return false;

    const { privacyLevel } = this.context.userPreferences;

    switch (privacyLevel) {
      case 'minimal':
        return suggestion.type === 'shortcut' || suggestion.type === 'tip';
      case 'standard':
        return true; // All privacy-safe suggestions
      case 'enhanced':
        return true; // All suggestions (with additional privacy measures)
      default:
        return suggestion.privacySafe;
    }
  }

  // Record user action for context
  recordUserAction(action: string) {
    this.userHistory.push(action);
    if (this.userHistory.length > 50) {
      this.userHistory.shift();
    }
  }

  // Dismiss suggestion
  dismissSuggestion(suggestionId: string, reason?: string) {
    this.dismissedSuggestions.add(suggestionId);

    // Set cooldown (don't show again for 24 hours)
    const cooldown = Date.now() + 24 * 60 * 60 * 1000;
    this.suggestionCooldowns.set(suggestionId, cooldown);

    // Update suggestion feedback
    const suggestion = this.suggestions.get(suggestionId);
    if (suggestion) {
      if (!suggestion.userFeedback) {
        suggestion.userFeedback = { helpful: 0, notHelpful: 0, dismissed: 0 };
      }
      suggestion.userFeedback.dismissed++;
    }
  }

  // Provide feedback on suggestion
  provideFeedback(suggestionId: string, helpful: boolean) {
    const suggestion = this.suggestions.get(suggestionId);
    if (suggestion) {
      if (!suggestion.userFeedback) {
        suggestion.userFeedback = { helpful: 0, notHelpful: 0, dismissed: 0 };
      }

      if (helpful) {
        suggestion.userFeedback.helpful++;
      } else {
        suggestion.userFeedback.notHelpful++;
      }
    }
  }

  // Update context
  updateContext(newContext: Partial<SuggestionContext>) {
    this.context = { ...this.context, ...newContext };
  }

  // Get suggestion statistics
  getStats() {
    return {
      totalSuggestions: this.suggestions.size,
      dismissedCount: this.dismissedSuggestions.size,
      sessionCount: this.sessionSuggestionCount,
      userHistoryLength: this.userHistory.length,
    };
  }
}

// Context-aware suggestions component
export interface ContextAwareSuggestionsProps extends VariantProps<typeof suggestionsVariants> {
  context: SuggestionContext;
  maxSuggestions?: number;
  className?: string;
  onSuggestionClick?: (suggestion: Suggestion) => void;
  onSuggestionDismiss?: (suggestionId: string) => void;
  onSuggestionFeedback?: (suggestionId: string, helpful: boolean) => void;
}

const suggestionsVariants = cva('space-y-2', {
  variants: {
    variant: {
      default: '',
      compact: 'space-y-1',
      expanded: 'space-y-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const ContextAwareSuggestions: React.FC<ContextAwareSuggestionsProps> = ({
  context,
  maxSuggestions = 3,
  className,
  onSuggestionClick,
  onSuggestionDismiss,
  onSuggestionFeedback,
  variant = 'default',
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const engineRef = useRef<PrivacySafeSuggestionEngine>();
  const lastUpdateRef = useRef<number>(0);

  // Initialize suggestion engine
  useEffect(() => {
    engineRef.current = new PrivacySafeSuggestionEngine(context);
    updateSuggestions();
  }, [context]);

  // Update suggestions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 30000) {
        // Update every 30 seconds
        updateSuggestions();
        lastUpdateRef.current = now;
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateSuggestions = useCallback(() => {
    if (engineRef.current) {
      const newSuggestions = engineRef.current.getSuggestions(maxSuggestions);
      setSuggestions(newSuggestions);
    }
  }, [maxSuggestions]);

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      onSuggestionClick?.(suggestion);

      // Record positive interaction
      if (engineRef.current) {
        engineRef.current.provideFeedback(suggestion.id, true);
      }
    },
    [onSuggestionClick],
  );

  const handleSuggestionDismiss = useCallback(
    (suggestionId: string) => {
      if (engineRef.current) {
        engineRef.current.dismissSuggestion(suggestionId);
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      onSuggestionDismiss?.(suggestionId);
    },
    [onSuggestionDismiss],
  );

  const handleFeedback = useCallback(
    (suggestionId: string, helpful: boolean) => {
      if (engineRef.current) {
        engineRef.current.provideFeedback(suggestionId, helpful);
      }

      setFeedbackGiven((prev) => new Set(prev).add(suggestionId));
      onSuggestionFeedback?.(suggestionId, helpful);
    },
    [onSuggestionFeedback],
  );

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn(suggestionsVariants({ variant }), className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Suggestions</h3>
        <button
          onClick={() => setShowSuggestions(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Hide
        </button>
      </div>

      <AnimatePresence>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-3 rounded-lg border border-border bg-background',
              'hover:bg-muted/50 transition-colors cursor-pointer',
              suggestion.priority === 'high' && 'border-primary/50 bg-primary/5',
              suggestion.priority === 'medium' && 'border-yellow-500/50 bg-yellow-500/5',
            )}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{suggestion.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs',
                      suggestion.type === 'shortcut' && 'bg-blue-100 text-blue-800',
                      suggestion.type === 'tip' && 'bg-green-100 text-green-800',
                      suggestion.type === 'feature' && 'bg-purple-100 text-purple-800',
                      suggestion.type === 'action' && 'bg-orange-100 text-orange-800',
                    )}
                  >
                    {suggestion.type}
                  </span>
                  {suggestion.priority === 'high' && (
                    <span className="text-xs text-red-600 font-medium">Important</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                {!feedbackGiven.has(suggestion.id) && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(suggestion.id, true);
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Helpful"
                    >
                      👍
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(suggestion.id, false);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Not helpful"
                    >
                      👎
                    </button>
                  </>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionDismiss(suggestion.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground rounded"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Privacy controls component
export interface PrivacyControlsProps {
  context: SuggestionContext;
  onContextUpdate: (context: Partial<SuggestionContext>) => void;
  className?: string;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  context,
  onContextUpdate,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-medium">Suggestion Preferences</h3>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Suggestion Frequency</label>
          <select
            value={context.userPreferences.suggestionFrequency}
            onChange={(e) =>
              onContextUpdate({
                userPreferences: {
                  ...context.userPreferences,
                  suggestionFrequency: e.target.value as any,
                },
              })
            }
            className="mt-1 w-full p-2 border border-border rounded"
          >
            <option value="low">Low (1 suggestion)</option>
            <option value="medium">Medium (2 suggestions)</option>
            <option value="high">High (3 suggestions)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Privacy Level</label>
          <select
            value={context.userPreferences.privacyLevel}
            onChange={(e) =>
              onContextUpdate({
                userPreferences: {
                  ...context.userPreferences,
                  privacyLevel: e.target.value as any,
                },
              })
            }
            className="mt-1 w-full p-2 border border-border rounded"
          >
            <option value="minimal">Minimal (shortcuts & tips only)</option>
            <option value="standard">Standard (all privacy-safe suggestions)</option>
            <option value="enhanced">Enhanced (all suggestions)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Suggestion Types</label>
          <div className="mt-2 space-y-2">
            {['shortcut', 'tip', 'feature', 'action', 'optimization'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={context.userPreferences.suggestionTypes.includes(type)}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...context.userPreferences.suggestionTypes, type]
                      : context.userPreferences.suggestionTypes.filter((t) => t !== type);

                    onContextUpdate({
                      userPreferences: {
                        ...context.userPreferences,
                        suggestionTypes: types,
                      },
                    });
                  }}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Test component
export const ContextAwareSuggestionsTest: React.FC = () => {
  const [context, setContext] = useState<SuggestionContext>({
    userRole: 'user',
    currentPage: 'dashboard',
    userActions: [],
    timeOfDay: 'morning',
    deviceType: 'desktop',
    previousSuggestions: [],
    dismissedSuggestions: [],
    userPreferences: {
      suggestionFrequency: 'medium',
      suggestionTypes: ['shortcut', 'tip', 'feature'],
      privacyLevel: 'standard',
    },
  });

  const handleContextUpdate = (updates: Partial<SuggestionContext>) => {
    setContext((prev) => ({ ...prev, ...updates }));
  };

  const simulateUserAction = (action: string) => {
    setContext((prev) => ({
      ...prev,
      userActions: [...prev.userActions, action],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Context-Aware Suggestions Test</h2>
        <p className="text-muted-foreground mb-4">
          Test intelligent suggestions that adapt to user context and respect privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
          <ContextAwareSuggestions
            context={context}
            maxSuggestions={3}
            onSuggestionClick={(suggestion) => {
              console.log('Suggestion clicked:', suggestion);
              simulateUserAction(`clicked_${suggestion.type}`);
            }}
            onSuggestionDismiss={(suggestionId) => {
              console.log('Suggestion dismissed:', suggestionId);
            }}
            onSuggestionFeedback={(suggestionId, helpful) => {
              console.log('Feedback:', suggestionId, helpful);
            }}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
          <PrivacyControls context={context} onContextUpdate={handleContextUpdate} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Simulate User Actions</h3>
        <div className="flex flex-wrap gap-2">
          {['data_export', 'search', 'bulk_edit', 'settings', 'help'].map((action) => (
            <button
              key={action}
              onClick={() => simulateUserAction(action)}
              className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-sm"
            >
              {action.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
