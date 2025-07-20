/**
 * AI-BOS AI Visual Assistant
 *
 * Intelligent assistant that provides real-time suggestions, component generation,
 * layout optimization, and accessibility improvements for visual app development.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Eye,
  Accessibility,
  Zap,
  MessageSquare,
  Lightbulb,
  Target,
  Trash2,
  Check,
  ArrowRight,
  Brain,
  Palette,
  Layout,
} from 'lucide-react';

// AI-BOS Shared Library Integration
import { logger } from '@aibos/shared/lib';
import { AIEngine } from '@aibos/shared/ai';

// Types
import type {
  AISuggestion,
  AISuggestionType,
  CanvasState,
  VisualElement,
  ComponentType,
} from '../types';

// ============================================================================
// AI VISUAL ASSISTANT COMPONENT
// ============================================================================

export interface AIVisualAssistantProps {
  /** Current AI suggestions */
  suggestions: AISuggestion[];
  /** Whether AI is analyzing */
  isAnalyzing: boolean;
  /** Event handlers */
  onApplySuggestion: (suggestionId: string) => Promise<void>;
  onDismissSuggestion: (suggestionId: string) => void;
  onGenerateSuggestions: () => Promise<void>;
  onOptimizeLayout: () => Promise<void>;
  onGenerateComponent: (prompt: string) => Promise<ComponentType | null>;
  onAnalyzeAccessibility: () => Promise<void>;
  /** Canvas state for context */
  canvasState: CanvasState;
}

/**
 * AI Visual Assistant providing intelligent development assistance
 */
export const AIVisualAssistant: React.FC<AIVisualAssistantProps> = ({
  suggestions,
  isAnalyzing,
  onApplySuggestion,
  onDismissSuggestion,
  onGenerateSuggestions,
  onOptimizeLayout,
  onGenerateComponent,
  onAnalyzeAccessibility,
  canvasState,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<'suggestions' | 'generate' | 'optimize'>(
    'suggestions',
  );
  const [componentPrompt, setComponentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle applying a suggestion
   */
  const handleApplySuggestion = useCallback(
    async (suggestionId: string) => {
      try {
        await onApplySuggestion(suggestionId);

        logger.info('AI suggestion applied', { suggestionId });

        // Auto-generate new suggestions after applying one
        setTimeout(() => {
          onGenerateSuggestions();
        }, 1000);
      } catch (error) {
        logger.error('Failed to apply AI suggestion', { suggestionId, error });
      }
    },
    [onApplySuggestion, onGenerateSuggestions],
  );

  /**
   * Handle component generation
   */
  const handleGenerateComponent = useCallback(async () => {
    if (!componentPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const componentType = await onGenerateComponent(componentPrompt);

      if (componentType) {
        logger.info('AI component generated', { prompt: componentPrompt, componentType });
        setComponentPrompt('');
      }
    } catch (error) {
      logger.error('Failed to generate component', { prompt: componentPrompt, error });
    } finally {
      setIsGenerating(false);
    }
  }, [componentPrompt, onGenerateComponent]);

  /**
   * Handle layout optimization
   */
  const handleOptimizeLayout = useCallback(async () => {
    setIsOptimizing(true);

    try {
      await onOptimizeLayout();
      logger.info('Layout optimized by AI');
    } catch (error) {
      logger.error('Failed to optimize layout', { error });
    } finally {
      setIsOptimizing(false);
    }
  }, [onOptimizeLayout]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Auto-generate suggestions when canvas changes significantly
   */
  useEffect(() => {
    if (canvasState.elements.length > 0 && !isAnalyzing) {
      const timer = setTimeout(() => {
        onGenerateSuggestions();
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [canvasState.elements.length, onGenerateSuggestions, isAnalyzing]);

  // ============================================================================
  // SUGGESTION RENDERING
  // ============================================================================

  /**
   * Get icon for suggestion type
   */
  const getSuggestionIcon = (type: AISuggestionType) => {
    switch (type) {
      case 'component-addition':
        return <Zap className="w-4 h-4" />;
      case 'layout-improvement':
        return <Layout className="w-4 h-4" />;
      case 'style-enhancement':
        return <Palette className="w-4 h-4" />;
      case 'accessibility-fix':
        return <Accessibility className="w-4 h-4" />;
      case 'performance-optimization':
        return <Target className="w-4 h-4" />;
      case 'ux-improvement':
        return <Eye className="w-4 h-4" />;
      case 'content-suggestion':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  /**
   * Get color for suggestion type
   */
  const getSuggestionColor = (type: AISuggestionType) => {
    switch (type) {
      case 'component-addition':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'layout-improvement':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'style-enhancement':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'accessibility-fix':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'performance-optimization':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'ux-improvement':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'content-suggestion':
        return 'text-teal-600 bg-teal-50 border-teal-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /**
   * Render suggestion item
   */
  const renderSuggestion = (suggestion: AISuggestion) => (
    <motion.div
      key={suggestion.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type)} mb-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-0.5">{getSuggestionIcon(suggestion.type)}</div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>

            {/* Confidence Score */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500">Confidence:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>

            {/* Reasoning (expandable) */}
            <button
              onClick={() => setShowDetails(showDetails === suggestion.id ? null : suggestion.id)}
              className="text-xs text-gray-500 hover:text-gray-700 mb-2"
            >
              {showDetails === suggestion.id ? 'Hide details' : 'Show reasoning'}
            </button>

            <AnimatePresence>
              {showDetails === suggestion.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-gray-600 bg-white bg-opacity-50 p-2 rounded mb-3"
                >
                  {suggestion.reasoning}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleApplySuggestion(suggestion.id)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Apply</span>
              </button>
              <button
                onClick={() => onDismissSuggestion(suggestion.id)}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-xs text-gray-500">Intelligent development assistance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded ${
              activeTab === 'suggestions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Suggestions
            {suggestions.length > 0 && (
              <span className="ml-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {suggestions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded ${
              activeTab === 'generate'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded ${
              activeTab === 'optimize'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Optimize
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Analyzing your app...</p>
                  </div>
                </div>
              )}

              {!isAnalyzing && suggestions.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No suggestions yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add some components to your canvas to get AI-powered suggestions
                  </p>
                  <button
                    onClick={onGenerateSuggestions}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                  >
                    Generate Suggestions
                  </button>
                </div>
              )}

              {suggestions.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} available
                    </h3>
                    <button
                      onClick={onGenerateSuggestions}
                      disabled={isAnalyzing}
                      className="text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50"
                    >
                      Refresh
                    </button>
                  </div>

                  <AnimatePresence>{suggestions.map(renderSuggestion)}</AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Generate Component</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Describe what you want to build and AI will create it for you
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={componentPrompt}
                  onChange={(e) => setComponentPrompt(e.target.value)}
                  placeholder="E.g., 'Create a user profile card with avatar, name, and bio'"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />

                <button
                  onClick={handleGenerateComponent}
                  disabled={!componentPrompt.trim() || isGenerating}
                  className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Component</span>
                    </>
                  )}
                </button>
              </div>

              {/* Example Prompts */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Example prompts:</h4>
                <div className="space-y-2">
                  {[
                    'Create a pricing table with three tiers',
                    'Build a contact form with validation',
                    'Make a product gallery with image carousel',
                    'Design a dashboard sidebar with navigation',
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setComponentPrompt(example)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded hover:bg-gray-100 border border-gray-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Optimize Tab */}
          {activeTab === 'optimize' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">AI Optimization</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Let AI analyze and improve your app automatically
                </p>
              </div>

              <div className="space-y-3">
                {/* Layout Optimization */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Layout className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-medium text-gray-900">Layout Optimization</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Improve spacing, alignment, and visual hierarchy
                  </p>
                  <button
                    onClick={handleOptimizeLayout}
                    disabled={isOptimizing || canvasState.elements.length === 0}
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOptimizing ? 'Optimizing...' : 'Optimize Layout'}
                  </button>
                </div>

                {/* Accessibility Analysis */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Accessibility className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-medium text-gray-900">Accessibility Check</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Analyze and fix accessibility issues</p>
                  <button
                    onClick={onAnalyzeAccessibility}
                    disabled={canvasState.elements.length === 0}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Run Accessibility Check
                  </button>
                </div>

                {/* Performance Analysis */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      <h4 className="text-sm font-medium text-gray-900">Performance Analysis</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Optimize for speed and efficiency</p>
                  <button
                    disabled={canvasState.elements.length === 0}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze Performance
                  </button>
                </div>
              </div>

              {/* Stats */}
              {canvasState.elements.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Current app stats:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-900">{canvasState.elements.length}</div>
                      <div className="text-gray-500">Components</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-900">
                        {new Set(canvasState.elements.map((e) => e.type)).size}
                      </div>
                      <div className="text-gray-500">Types</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
