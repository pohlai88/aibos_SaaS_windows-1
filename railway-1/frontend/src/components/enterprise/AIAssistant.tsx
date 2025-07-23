import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistantProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'info' | 'warning' | 'success' | 'critical' | 'predictive' | 'insight';
  dismissible?: boolean;
  className?: string;
  context?: {
    metrics?: any;
    userBehavior?: any;
    systemStatus?: any;
    recentActions?: any[];
  };
  enableAI?: boolean;
  autoAnalyze?: boolean;
}

interface AIInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'optimization' | 'insight';
  title: string;
  description: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    handler: () => void;
  };
  data?: any;
}

// Simplified AI analysis functions (browser-compatible)
const analyzeChurnRisk = (metrics: any): AIInsight | null => {
  if (!metrics?.churnRate) return null;

  const churnRate = metrics.churnRate;
  if (churnRate > 0.07) {
    return {
      type: 'prediction',
      title: 'High Churn Risk Detected',
      description: `Churn rate is ${(churnRate * 100).toFixed(1)}%. Consider proactive customer engagement.`,
      confidence: 0.85,
      urgency: 'high',
      action: {
        label: 'Launch Retention Campaign',
        handler: () => console.log('Launching retention campaign...')
      }
    };
  }
  return null;
};

const analyzeMRRTrend = (metrics: any): AIInsight | null => {
  if (!metrics?.mrr) return null;

  // Simulate trend analysis
  const trendStrength = 0.75; // Mock confidence
  if (trendStrength > 0.7) {
    return {
      type: 'trend',
      title: 'Strong MRR Growth Trend',
      description: `MRR is growing with ${(trendStrength * 100).toFixed(1)}% confidence. Consider scaling operations.`,
      confidence: 0.78,
      urgency: 'medium',
      action: {
        label: 'Scale Infrastructure',
        handler: () => console.log('Scaling infrastructure...')
      }
    };
  }
  return null;
};

const analyzeSystemPerformance = (systemStatus: any): AIInsight | null => {
  if (!systemStatus) return null;

  const uptime = systemStatus.uptime || 99.9;
  if (uptime < 99.5) {
    return {
      type: 'anomaly',
      title: 'System Performance Anomaly',
      description: `Uptime is ${uptime}%. Immediate attention required.`,
      confidence: 0.92,
      urgency: 'critical',
      action: {
        label: 'Investigate Issues',
        handler: () => console.log('Investigating system issues...')
      }
    };
  }
  return null;
};

const analyzeUserSentiment = (userBehavior: any): AIInsight | null => {
  if (!userBehavior?.recentQueries) return null;

  // Simple sentiment analysis based on keywords
  const queries = userBehavior.recentQueries.join(' ').toLowerCase();
  const negativeWords = ['error', 'problem', 'issue', 'broken', 'failed', 'slow'];
  const negativeCount = negativeWords.filter(word => queries.includes(word)).length;

  if (negativeCount > 2) {
    return {
      type: 'insight',
      title: 'User Sentiment Decline',
      description: `Recent user interactions show negative sentiment. Consider improving user experience.`,
      confidence: 0.76,
      urgency: 'high',
      action: {
        label: 'Improve UX',
        handler: () => console.log('Improving user experience...')
      }
    };
  }
  return null;
};

const analyzeUserValue = (metrics: any): AIInsight | null => {
  if (!metrics?.activeUsers || !metrics?.mrr) return null;

  const userValue = metrics.mrr / metrics.activeUsers;
  if (userValue < 50) {
    return {
      type: 'optimization',
      title: 'Low User Value Opportunity',
      description: `Average user value is $${userValue.toFixed(2)}. Consider upselling strategies.`,
      confidence: 0.89,
      urgency: 'medium',
      action: {
        label: 'Optimize Pricing',
        handler: () => console.log('Optimizing pricing strategy...')
      }
    };
  }
  return null;
};

export const AIAssistant: React.FC<AIAssistantProps> = ({
  message,
  actionLabel,
  onAction,
  type = 'info',
  dismissible = true,
  className = '',
  context,
  enableAI = true,
  autoAnalyze = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);

  // Analyze context and generate insights
  const analyzeContext = useCallback(async () => {
    if (!enableAI || !context || !autoAnalyze) return;

    setIsAnalyzing(true);
    const newInsights: AIInsight[] = [];

    try {
      // Run all analysis functions
      const churnInsight = analyzeChurnRisk(context.metrics);
      const mrrInsight = analyzeMRRTrend(context.metrics);
      const performanceInsight = analyzeSystemPerformance(context.systemStatus);
      const sentimentInsight = analyzeUserSentiment(context.userBehavior);
      const valueInsight = analyzeUserValue(context.metrics);

      // Add valid insights
      if (churnInsight) newInsights.push(churnInsight);
      if (mrrInsight) newInsights.push(mrrInsight);
      if (performanceInsight) newInsights.push(performanceInsight);
      if (sentimentInsight) newInsights.push(sentimentInsight);
      if (valueInsight) newInsights.push(valueInsight);

      setInsights(newInsights);

      // Show the most urgent insight first
      const urgentInsight = newInsights.sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      })[0];

      setCurrentInsight(urgentInsight);

    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [context, enableAI, autoAnalyze]);

  // Auto-analyze when context changes
  useEffect(() => {
    analyzeContext();
  }, [analyzeContext]);

  // Get type configuration
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          icon: '🤖'
        };
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          icon: '✨'
        };
      case 'critical':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          icon: '🚨'
        };
      case 'predictive':
        return {
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-800 dark:text-purple-200',
          icon: '🔮'
        };
      case 'insight':
        return {
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
          borderColor: 'border-indigo-200 dark:border-indigo-800',
          textColor: 'text-indigo-800 dark:text-indigo-200',
          icon: '🧠'
        };
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: '💡'
        };
    }
  };

  const config = getTypeConfig();

  if (!isVisible) return null;

  // Show AI-generated insight if available
  const displayMessage = currentInsight ? currentInsight.description : message;
  const displayAction = currentInsight?.action || (actionLabel && onAction ? { label: actionLabel, handler: onAction } : undefined);

  return (
    <AnimatePresence>
      <motion.div
        className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start space-x-3">
          <div className="relative">
            <span className="text-lg" role="img" aria-label="AI Assistant">
              {config.icon}
            </span>
            {isAnalyzing && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <p className={`text-sm font-medium ${config.textColor}`}>
                {displayMessage}
              </p>
              {currentInsight && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/50">
                  {currentInsight.confidence > 0.9 ? '🔥' : currentInsight.confidence > 0.7 ? '⚡' : '💡'}
                  {(currentInsight.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {displayAction && (
              <button
                onClick={displayAction.handler}
                className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {displayAction.label} →
              </button>
            )}

            {/* Show multiple insights if available */}
            {insights.length > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {insights.length} AI insights available
                </p>
                <div className="flex flex-wrap gap-2">
                  {insights.slice(0, 3).map((insight, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentInsight(insight)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        currentInsight === insight
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {insight.type} • {insight.urgency}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss AI suggestion"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
