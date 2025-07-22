'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useApp } from '@/components/providers/AppProvider';
import { EmptyState, LogsEmptyState, DataEmptyState } from '@/components/ui/EmptyState';
import { aiBuilderSDK, PromptRequest, PromptResponse } from '../../ai/sdk/AIBuilderSDK';
import { AppContainer } from '../../runtime/AppContainer';
import { AppManifest } from '../../runtime/ManifestLoader';

// ==================== TYPES ====================
interface RealtimeEvent {
  id: string;
  type: 'notification' | 'system' | 'user' | 'ai' | 'collaboration';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metadata?: Record<string, any>;
  isRead: boolean;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  icon: string;
}

interface CollaborationSession {
  id: string;
  title: string;
  participants: number;
  status: 'active' | 'idle' | 'ended';
  lastActivity: Date;
}

interface DemoState {
  // AI Builder State
  prompt: string;
  aiResponse: PromptResponse | null;
  isGenerating: boolean;
  selectedApp: AppManifest | null;
  showPreview: boolean;

  // Realtime State
  events: RealtimeEvent[];
  metrics: SystemMetric[];
  collaborations: CollaborationSession[];
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  lastUpdate: Date;

  // UI State
  activeTab: 'ai-builder' | 'realtime' | 'overview';
}

// ==================== CONSTANTS ====================
const EXAMPLE_PROMPTS = [
  "Create a form to collect customer contact information",
  "Build a dashboard showing sales analytics with charts",
  "Make a list view to manage product inventory",
  "Create a workflow to process customer orders",
  "Build a form to onboard new employees",
];

const INITIAL_METRICS: SystemMetric[] = [];

// ==================== ANIMATION VARIANTS ====================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

// ==================== SUB-COMPONENTS ====================

interface MetricCardProps {
  metric: SystemMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const statusColors = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <motion.div
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
      variants={itemVariants}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{metric.icon}</span>
        <span className={`text-sm font-medium ${statusColors[metric.status]}`}>
          {metric.status}
        </span>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{metric.name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {metric.value}{metric.unit}
        </span>
        <span className="text-sm text-gray-500">{trendIcons[metric.trend]}</span>
      </div>
    </motion.div>
  );
};

interface EventCardProps {
  event: RealtimeEvent;
  onMarkRead: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onMarkRead }) => {
  const typeIcons = {
    notification: '🔔',
    system: '⚙️',
    user: '👤',
    ai: '🤖',
    collaboration: '👥'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-yellow-100 text-yellow-600',
    critical: 'bg-red-100 text-red-600'
  };

  const timeAgo = useMemo(() => {
    const diff = Date.now() - event.timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [event.timestamp]);

  return (
    <motion.div
      className={`bg-white p-4 rounded-lg border-l-4 ${
        event.isRead ? 'border-gray-200' : 'border-blue-500'
      } hover:shadow-md transition-all`}
      variants={itemVariants}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{typeIcons[event.type]}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[event.priority]}`}>
            {event.priority}
          </span>
        </div>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">{event.title}</h4>
      <p className="text-gray-600 text-sm mb-3">{event.message}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{event.category}</span>
        {!event.isRead && (
          <button
            onClick={() => onMarkRead(event.id)}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Mark as read
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const UnifiedDemo: React.FC = () => {
  const { openWindow } = useApp();
  const [state, setState] = useState<DemoState>({
    // AI Builder State
    prompt: '',
    aiResponse: null,
    isGenerating: false,
    selectedApp: null,
    showPreview: false,

    // Realtime State
    events: [],
    metrics: INITIAL_METRICS,
    collaborations: [],
    isConnected: true,
    connectionQuality: 'excellent',
    lastUpdate: new Date(),

    // UI State
    activeTab: 'overview'
  });

  // ==================== AI BUILDER HANDLERS ====================
  const handlePromptSubmit = async () => {
    if (!state.prompt.trim()) return;

    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const request: PromptRequest = {
        prompt: state.prompt.trim(),
        context: {
          userRole: 'business_user',
          businessDomain: 'general',
          preferences: {
            theme: 'auto',
            complexity: 'moderate',
            style: 'modern',
          },
        },
      };

      const result = await aiBuilderSDK.generateFromPrompt(request);

      setState(prev => ({
        ...prev,
        aiResponse: result,
        selectedApp: result.success && result.manifest ? result.manifest : null,
        isGenerating: false
      }));

    } catch (error) {
      console.error('Error generating app:', error);
      setState(prev => ({
        ...prev,
        aiResponse: {
          success: false,
          error: 'Failed to generate app',
          confidence: 0,
          reasoning: 'An error occurred during generation',
        },
        isGenerating: false
      }));
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setState(prev => ({ ...prev, prompt: examplePrompt }));
  };

  const handlePreviewApp = () => {
    if (state.selectedApp) {
      setState(prev => ({ ...prev, showPreview: true }));
    }
  };

  // ==================== REALTIME HANDLERS ====================
  const handleMarkRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.id === id ? { ...event, isRead: true } : event
      )
    }));
  }, []);

  const handleTabChange = useCallback((tab: DemoState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // ==================== SIMULATED REALTIME UPDATES ====================
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        lastUpdate: new Date(),
        metrics: prev.metrics.map(metric => ({
          ...metric,
          value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 5))
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new event
        const newEvent: RealtimeEvent = {
          id: Date.now().toString(),
          type: ['notification', 'system', 'ai', 'collaboration'][Math.floor(Math.random() * 4)] as any,
          title: 'New activity detected',
          message: 'System detected new activity in your workspace',
          timestamp: new Date(),
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          category: 'System',
          isRead: false
        };

        setState(prev => ({
          ...prev,
          events: [newEvent, ...prev.events.slice(0, 9)] // Keep only 10 events
        }));
      }
    }, 10000);

    return () => clearInterval(eventInterval);
  }, []);

  const unreadCount = state.events.filter(e => !e.isRead).length;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            🚀 AI-BOS Unified Demo
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <strong>&quot;Everyone becomes a creator&quot;</strong> - AI App Builder + Realtime Intelligence
          </motion.p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'ai-builder', label: 'AI Builder', icon: '🤖' },
            { key: 'realtime', label: 'Realtime', icon: '🔔', badge: unreadCount }
          ].map(({ key, label, icon, badge }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                state.activeTab === key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {state.activeTab === 'overview' && (
            <motion.div
              key="overview"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Builder Quick Demo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🤖 AI App Builder
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Create applications using natural language prompts. Describe what you want, and AI will generate it for you.
                  </p>
                  <button
                    onClick={() => handleTabChange('ai-builder')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try AI Builder
                  </button>
                </div>

                {/* Realtime Intelligence */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🔔 Realtime Intelligence
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Monitor system metrics, track real-time events, and collaborate with team members in real-time.
                  </p>
                  <button
                    onClick={() => handleTabChange('realtime')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Realtime Dashboard
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">🤖</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">AI Builder Ready</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">🔔</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{unreadCount} New Events</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">⚡</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">System Active</div>
                </div>
              </div>
            </motion.div>
          )}

          {state.activeTab === 'ai-builder' && (
            <motion.div
              key="ai-builder"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Builder Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    🤖 AI App Builder
                  </h2>

                  {/* Prompt Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Describe the app you want to create:
                    </label>
                    <textarea
                      value={state.prompt}
                      onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="e.g., Create a form to collect customer contact information"
                      className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Example Prompts */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Try these examples:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {EXAMPLE_PROMPTS.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(example)}
                          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handlePromptSubmit}
                    disabled={state.isGenerating || !state.prompt.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {state.isGenerating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating App...
                      </div>
                    ) : (
                      '🚀 Generate App'
                    )}
                  </button>
                </div>

                {/* Results Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    📋 Generated App
                  </h2>

                  <AnimatePresence>
                    {state.aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {state.aiResponse.success ? (
                          <div className="space-y-4">
                            {/* Success Message */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <div className="flex items-center">
                                <span className="text-green-600 dark:text-green-400 text-lg mr-2">✅</span>
                                <span className="text-green-800 dark:text-green-200 font-medium">
                                  App generated successfully!
                                </span>
                              </div>
                            </div>

                            {/* App Details */}
                            {state.aiResponse.manifest && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {state.aiResponse.manifest.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                  {state.aiResponse.manifest.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                      {state.aiResponse.manifest.metadata?.category}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Version:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                      {state.aiResponse.manifest.version}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Permissions:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                      {state.aiResponse.manifest.permissions.length}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                      {Math.round(state.aiResponse.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Preview Button */}
                            {state.selectedApp && (
                              <button
                                onClick={handlePreviewApp}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                👀 Preview App
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-center">
                              <span className="text-red-600 dark:text-red-400 text-lg mr-2">❌</span>
                              <span className="text-red-800 dark:text-red-200 font-medium">
                                Generation failed
                              </span>
                            </div>
                            <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                              {state.aiResponse.error}
                            </p>
                          </div>
                        )}

                        {/* Reasoning */}
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            🤔 AI Reasoning:
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {state.aiResponse.reasoning}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {state.activeTab === 'realtime' && (
            <motion.div
              key="realtime"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Connection Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        state.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {state.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last update: {state.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              {state.metrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {state.metrics.map((metric) => (
                    <MetricCard key={metric.name} metric={metric} />
                  ))}
                </div>
              ) : (
                <DataEmptyState
                  title="No System Metrics Available"
                  description="System metrics will appear here once your platform starts collecting performance data."
                  actionLabel="Initialize Metrics"
                  onAction={() => {
                    setState(prev => ({
                      ...prev,
                      metrics: [
                        {
                          name: 'System Load',
                          value: 23,
                          unit: '%',
                          trend: 'stable',
                          status: 'healthy',
                          icon: '⚡'
                        },
                        {
                          name: 'Memory Usage',
                          value: 67,
                          unit: '%',
                          trend: 'up',
                          status: 'warning',
                          icon: '🧠'
                        },
                        {
                          name: 'Network Latency',
                          value: 45,
                          unit: 'ms',
                          trend: 'down',
                          status: 'healthy',
                          icon: '🌐'
                        },
                        {
                          name: 'Active Users',
                          value: 12,
                          unit: '',
                          trend: 'up',
                          status: 'healthy',
                          icon: '👥'
                        }
                      ]
                    }));
                  }}
                  helpText="System metrics track performance indicators like CPU usage, memory consumption, network latency, and user activity."
                />
              )}

              {/* Events */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Events</h3>
                {state.events.length > 0 ? (
                  <div className="space-y-3">
                    {state.events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onMarkRead={handleMarkRead}
                      />
                    ))}
                  </div>
                ) : (
                  <LogsEmptyState />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Preview Modal */}
        <AnimatePresence>
          {state.showPreview && state.selectedApp && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">App Preview</h2>
                      <p className="text-blue-100">{state.selectedApp.name}</p>
                    </div>
                    <button
                      onClick={() => setState(prev => ({ ...prev, showPreview: false }))}
                      className="text-white/80 hover:text-white transition-colors text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* App Container */}
                <div className="h-96">
                  <AppContainer
                    manifest={state.selectedApp}
                    onMount={() => console.log('App mounted')}
                    onError={(error) => console.error('App error:', error)}
                    onDestroy={() => console.log('App destroyed')}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnifiedDemo;
