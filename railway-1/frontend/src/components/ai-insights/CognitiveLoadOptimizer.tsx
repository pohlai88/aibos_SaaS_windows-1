/**
 * AI-BOS Cognitive Load Optimizer
 *
 * Advanced cognitive load optimization for AI insights:
 * - Progressive disclosure of insights (tiered levels)
 * - Insight priority scoring and ranking
 * - Adaptive complexity based on user expertise
 * - Cognitive load monitoring and optimization
 * - User experience enhancement
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Settings,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAIBOSStore } from '@/lib/store';

// ==================== TYPES ====================

export interface InsightPriority {
  id: string;
  score: number; // 0-100 AI-calculated value
  confidence: number; // 0-1 statistical confidence
  businessImpact: 'high' | 'medium' | 'low';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  category: string;
  tags: string[];
}

export interface TieredInsight {
  id: string;
  title: string;
  description: string;
  tier: 'basic' | 'intermediate' | 'advanced' | 'expert';
  priority: InsightPriority;
  content: {
    basic: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
  metadata: {
    dataSources: string[];
    modelVersion: string;
    lastUpdated: Date;
    confidence: number;
  };
  actions: InsightAction[];
  isExpanded: boolean;
  isVisible: boolean;
}

export interface InsightAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'outline';
  action: () => void;
  disabled?: boolean;
}

export interface UserExpertise {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences: {
    showAdvanced: boolean;
    showTechnicalDetails: boolean;
    autoExpand: boolean;
    priorityThreshold: number;
  };
  cognitiveLoad: number; // 0-1 current cognitive load
}

export interface CognitiveLoadMetrics {
  currentLoad: number;
  maxLoad: number;
  insightsVisible: number;
  complexityLevel: string;
  recommendations: string[];
}

// ==================== COGNITIVE LOAD OPTIMIZER ====================

interface CognitiveLoadOptimizerProps {
  insights: TieredInsight[];
  userExpertise: UserExpertise;
  onInsightAction: (insightId: string, actionId: string) => void;
  onExpertiseChange: (expertise: UserExpertise) => void;
  className?: string;
}

export const CognitiveLoadOptimizer: React.FC<CognitiveLoadOptimizerProps> = ({
  insights,
  userExpertise,
  onInsightAction,
  onExpertiseChange,
  className = ''
}) => {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [visibleInsights, setVisibleInsights] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const { addNotification } = useAIBOSStore();

  // ==================== COGNITIVE LOAD CALCULATION ====================

  const cognitiveLoadMetrics = useMemo((): CognitiveLoadMetrics => {
    const visibleCount = visibleInsights.size;
    const expandedCount = expandedInsights.size;
    const complexityMultiplier = userExpertise.preferences.showAdvanced ? 1.5 : 1.0;

    const baseLoad = (visibleCount * 0.1) + (expandedCount * 0.05);
    const currentLoad = Math.min(1, baseLoad * complexityMultiplier);
    const maxLoad = userExpertise.level === 'expert' ? 1.0 :
                   userExpertise.level === 'advanced' ? 0.8 :
                   userExpertise.level === 'intermediate' ? 0.6 : 0.4;

    const recommendations: string[] = [];
    if (currentLoad > maxLoad * 0.8) {
      recommendations.push('Consider collapsing some insights to reduce cognitive load');
    }
    if (visibleCount > 10) {
      recommendations.push('Too many insights visible - consider filtering by priority');
    }
    if (userExpertise.preferences.showAdvanced && userExpertise.level === 'beginner') {
      recommendations.push('Advanced details may be overwhelming - consider basic view');
    }

    return {
      currentLoad,
      maxLoad,
      insightsVisible: visibleCount,
      complexityLevel: userExpertise.preferences.showAdvanced ? 'Advanced' : 'Basic',
      recommendations
    };
  }, [visibleInsights, expandedInsights, userExpertise]);

  // ==================== INSIGHT PROCESSING ====================

  const processedInsights = useMemo(() => {
    return insights
      .filter(insight => insight.priority.score >= userExpertise.preferences.priorityThreshold)
      .sort((a, b) => b.priority.score - a.priority.score)
      .map(insight => ({
        ...insight,
        isExpanded: expandedInsights.has(insight.id),
        isVisible: visibleInsights.has(insight.id) || visibleInsights.size === 0
      }));
  }, [insights, expandedInsights, visibleInsights, userExpertise.preferences.priorityThreshold]);

  // ==================== EVENT HANDLERS ====================

  const toggleInsightExpansion = useCallback((insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  }, []);

  const toggleInsightVisibility = useCallback((insightId: string) => {
    setVisibleInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  }, []);

  const handleInsightAction = useCallback((insightId: string, actionId: string) => {
    try {
      onInsightAction(insightId, actionId);
      addNotification({
        type: 'success',
        title: 'Action Executed',
        message: 'Insight action completed successfully',
        isRead: false
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to execute insight action',
        isRead: false
      });
    }
  }, [onInsightAction, addNotification]);

  const updateUserExpertise = useCallback((updates: Partial<UserExpertise>) => {
    const updatedExpertise = { ...userExpertise, ...updates };
    onExpertiseChange(updatedExpertise);
  }, [userExpertise, onExpertiseChange]);

  // ==================== RENDER HELPERS ====================

  const getPriorityColor = (priority: InsightPriority) => {
    if (priority.urgency === 'critical') return 'text-red-500';
    if (priority.urgency === 'high') return 'text-orange-500';
    if (priority.urgency === 'medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPriorityIcon = (priority: InsightPriority) => {
    if (priority.urgency === 'critical') return <AlertTriangle className="w-4 h-4" />;
    if (priority.urgency === 'high') return <TrendingUp className="w-4 h-4" />;
    if (priority.urgency === 'medium') return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getInsightContent = (insight: TieredInsight) => {
    if (userExpertise.preferences.showAdvanced) {
      return insight.content.expert;
    }
    if (userExpertise.level === 'advanced') {
      return insight.content.advanced;
    }
    if (userExpertise.level === 'intermediate') {
      return insight.content.intermediate;
    }
    return insight.content.basic;
  };

  // ==================== RENDER ====================

  return (
    <div className={`cognitive-load-optimizer ${className}`}>
      {/* Cognitive Load Monitor */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Cognitive Load Monitor</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-1"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(cognitiveLoadMetrics.currentLoad * 100)}%
            </div>
            <div className="text-sm text-gray-600">Current Load</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cognitiveLoadMetrics.insightsVisible}
            </div>
            <div className="text-sm text-gray-600">Insights Visible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cognitiveLoadMetrics.complexityLevel}
            </div>
            <div className="text-sm text-gray-600">Complexity Level</div>
          </div>
        </div>

        {/* Load Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Load Level</span>
            <span>{Math.round(cognitiveLoadMetrics.maxLoad * 100)}% Max</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                cognitiveLoadMetrics.currentLoad > cognitiveLoadMetrics.maxLoad * 0.8
                  ? 'bg-red-500'
                  : cognitiveLoadMetrics.currentLoad > cognitiveLoadMetrics.maxLoad * 0.6
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (cognitiveLoadMetrics.currentLoad / cognitiveLoadMetrics.maxLoad) * 100)}%` }}
            />
          </div>
        </div>

        {/* Recommendations */}
        {cognitiveLoadMetrics.recommendations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-800 mb-1">Recommendations:</div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {cognitiveLoadMetrics.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border"
          >
            <h4 className="font-semibold mb-3">User Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Level
                </label>
                <select
                  value={userExpertise.level}
                  onChange={(e) => updateUserExpertise({ level: e.target.value as UserExpertise['level'] })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Threshold
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={userExpertise.preferences.priorityThreshold}
                  onChange={(e) => updateUserExpertise({
                    preferences: {
                      ...userExpertise.preferences,
                      priorityThreshold: parseInt(e.target.value)
                    }
                  })}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {userExpertise.preferences.priorityThreshold}% minimum priority
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showAdvanced"
                  checked={userExpertise.preferences.showAdvanced}
                  onChange={(e) => updateUserExpertise({
                    preferences: {
                      ...userExpertise.preferences,
                      showAdvanced: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <label htmlFor="showAdvanced" className="text-sm text-gray-700">
                  Show Advanced Details
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoExpand"
                  checked={userExpertise.preferences.autoExpand}
                  onChange={(e) => updateUserExpertise({
                    preferences: {
                      ...userExpertise.preferences,
                      autoExpand: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <label htmlFor="autoExpand" className="text-sm text-gray-700">
                  Auto-expand High Priority
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights List */}
      <div className="space-y-4">
        {processedInsights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white rounded-lg border transition-all duration-200 ${
              insight.isVisible ? 'opacity-100' : 'opacity-50'
            }`}
          >
            {/* Insight Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`flex items-center space-x-1 ${getPriorityColor(insight.priority)}`}>
                      {getPriorityIcon(insight.priority)}
                      <span className="text-sm font-medium">
                        {insight.priority.urgency.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {insight.priority.score}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {insight.priority.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {insight.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleInsightVisibility(insight.id)}
                    className="p-1"
                  >
                    {insight.isVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleInsightExpansion(insight.id)}
                    className="p-1"
                  >
                    {insight.isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {insight.isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 bg-gray-50"
                >
                  <div className="prose prose-sm max-w-none">
                    <div className="mb-4">
                      <h4 className="text-md font-semibold mb-2">Detailed Analysis</h4>
                      <p className="text-gray-700">{getInsightContent(insight)}</p>
                    </div>

                    {/* Metadata */}
                    <div className="mb-4 p-3 bg-white rounded border">
                      <h5 className="text-sm font-semibold mb-2">Technical Details</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Confidence: {Math.round(insight.metadata.confidence * 100)}%</div>
                        <div>Model: {insight.metadata.modelVersion}</div>
                        <div>Updated: {insight.metadata.lastUpdated.toLocaleDateString()}</div>
                        <div>Sources: {insight.metadata.dataSources.length}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    {insight.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {insight.actions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.type}
                            size="sm"
                            onClick={() => handleInsightAction(insight.id, action.id)}
                            disabled={action.disabled}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {processedInsights.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
          <p className="text-gray-600">
            Try adjusting your priority threshold or check back later for new insights.
          </p>
        </div>
      )}
    </div>
  );
};
