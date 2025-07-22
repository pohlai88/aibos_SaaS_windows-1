'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';
import { useToastActions } from '@/components/ui/Toast';

interface Suggestion {
  id: string;
  type: 'app' | 'folder' | 'action' | 'tip';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  action: () => void;
  category: string;
}

interface SmartSuggestionsProps {
  isVisible: boolean;
  onClose: () => void;
  onAction: (suggestion: Suggestion) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  isVisible,
  onClose,
  onAction
}) => {
  const { trackEvent } = useSystemCore();
  const { success, info } = useToastActions();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generate smart suggestions based on context
  const generateSuggestions = useMemo(() => {
    const currentSuggestions: Suggestion[] = [];

    // App recommendations based on usage patterns
    currentSuggestions.push({
      id: 'suggest-analytics',
      type: 'app',
      title: 'Try Analytics Suite',
      description: 'Based on your dashboard usage, you might find advanced analytics helpful',
      icon: '📈',
      priority: 'high',
      category: 'productivity',
      action: () => {
        trackEvent('smart_suggestion_followed', { suggestionId: 'suggest-analytics' });
        success('Analytics Suite', 'Opening app store to install...');
        onAction(currentSuggestions[0]);
      }
    });

    // Organization suggestions
    currentSuggestions.push({
      id: 'suggest-folder',
      type: 'folder',
      title: 'Create a Productivity Folder',
      description: 'Organize your dashboard and settings apps together',
      icon: '📁',
      priority: 'medium',
      category: 'organization',
      action: () => {
        trackEvent('smart_suggestion_followed', { suggestionId: 'suggest-folder' });
        success('Folder Created', 'Productivity folder added to desktop');
        onAction(currentSuggestions[1]);
      }
    });

    // Action suggestions
    currentSuggestions.push({
      id: 'suggest-arrange',
      type: 'action',
      title: 'Auto-arrange Desktop',
      description: 'Your icons could be better organized. Let me help!',
      icon: '🎯',
      priority: 'medium',
      category: 'organization',
      action: () => {
        trackEvent('smart_suggestion_followed', { suggestionId: 'suggest-arrange' });
        success('Desktop Arranged', 'Icons organized for better workflow');
        onAction(currentSuggestions[2]);
      }
    });

    // Tips and tricks
    currentSuggestions.push({
      id: 'suggest-tip',
      type: 'tip',
      title: 'Pro Tip: Quick App Access',
      description: 'Double-click any app icon to launch it instantly',
      icon: '💡',
      priority: 'low',
      category: 'tips',
      action: () => {
        trackEvent('smart_suggestion_followed', { suggestionId: 'suggest-tip' });
        info('Pro Tip', 'You can also drag icons to create folders!');
        onAction(currentSuggestions[3]);
      }
    });

    // AI Assistant suggestion
    currentSuggestions.push({
      id: 'suggest-ai',
      type: 'app',
      title: 'Meet Your AI Assistant',
      description: 'Get intelligent help with workflows and automation',
      icon: '🤖',
      priority: 'high',
      category: 'ai',
      action: () => {
        trackEvent('smart_suggestion_followed', { suggestionId: 'suggest-ai' });
        success('AI Assistant', 'Opening AI Assistant for you');
        onAction(currentSuggestions[4]);
      }
    });

    return currentSuggestions;
  }, [trackEvent, success, info, onAction]);

  useEffect(() => {
    setSuggestions(generateSuggestions);
  }, [generateSuggestions]);

  const filteredSuggestions = useMemo(() => {
    if (selectedCategory === 'all') return suggestions;
    return suggestions.filter(s => s.category === selectedCategory);
  }, [suggestions, selectedCategory]);

  const categories = [
    { id: 'all', name: 'All', icon: '🎯' },
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'organization', name: 'Organization', icon: '📁' },
    { id: 'ai', name: 'AI', icon: '🤖' },
    { id: 'tips', name: 'Tips', icon: '💡' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-blue-500';
      default: return '';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🧠</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Smart Suggestions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered recommendations for your workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No suggestions for this category right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  className={`bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-shadow cursor-pointer ${getPriorityColor(suggestion.priority)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    suggestion.action();
                    trackEvent('smart_suggestion_clicked', {
                      suggestionId: suggestion.id,
                      suggestionType: suggestion.type
                    });
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">{suggestion.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {suggestion.priority} priority
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {suggestion.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                      →
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} found</span>
            <span>AI-BOS Smart Suggestions v1.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmartSuggestions;
