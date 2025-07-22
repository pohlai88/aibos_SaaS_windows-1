'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Brain, Eye, Code, Play, Pause, RotateCcw, Download, Share, Settings, Globe, Database, Shield, Users } from 'lucide-react';

// ==================== TYPES ====================
interface TelemetryEventBusProps {
  tenantId: string;
  userId: string;
  enableRealTimeEvents?: boolean;
  enableEventAnalytics?: boolean;
  enableAIIntegration?: boolean;
  enableEventExport?: boolean;
  onEventEmitted?: (event: TelemetryEvent) => void;
  onEventAnalyzed?: (analysis: EventAnalysis) => void;
  onAIInsight?: (insight: AIInsight) => void;
}

interface TelemetryEvent {
  id: string;
  timestamp: Date;
  type: TelemetryEventType;
  source: string;
  target: string;
  data: Record<string, any>;
  metadata: {
    tenantId: string;
    userId: string;
    sessionId: string;
    component: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    tags: string[];
  };
}

type TelemetryEventType =
  | 'performance:render'
  | 'performance:memory'
  | 'performance:cpu'
  | 'security:violation'
  | 'security:threat'
  | 'security:policy'
  | 'user:interaction'
  | 'user:journey'
  | 'ai:generation'
  | 'ai:confidence'
  | 'system:lifecycle'
  | 'system:error'
  | 'collaboration:user_join'
  | 'collaboration:user_leave'
  | 'collaboration:sync'
  | 'telemetry:alert'
  | 'telemetry:crash'
  | 'telemetry:metric';

interface EventAnalysis {
  id: string;
  timestamp: Date;
  eventType: TelemetryEventType;
  patterns: EventPattern[];
  anomalies: EventAnomaly[];
  trends: EventTrend[];
  recommendations: string[];
  riskScore: number;
}

interface EventPattern {
  type: 'frequency' | 'sequence' | 'correlation' | 'timing';
  description: string;
  confidence: number;
  data: Record<string, any>;
}

interface EventAnomaly {
  type: 'spike' | 'drop' | 'outlier' | 'sequence_break';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
}

interface EventTrend {
  direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  description: string;
  confidence: number;
  data: Record<string, any>;
}

interface AIInsight {
  id: string;
  timestamp: Date;
  type: 'performance' | 'security' | 'user_experience' | 'system_health';
  insight: string;
  confidence: number;
  actionItems: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
}

interface EventBusState {
  isActive: boolean;
  isPaused: boolean;
  events: TelemetryEvent[];
  analyses: EventAnalysis[];
  insights: AIInsight[];
  metrics: {
    totalEvents: number;
    eventsPerSecond: number;
    averageLatency: number;
    errorRate: number;
    activeSubscribers: number;
  };
  subscribers: Map<string, (event: TelemetryEvent) => void>;
}

// ==================== TELEMETRY EVENT BUS COMPONENT ====================
export const TelemetryEventBus: React.FC<TelemetryEventBusProps> = ({
  tenantId,
  userId,
  enableRealTimeEvents = true,
  enableEventAnalytics = true,
  enableAIIntegration = true,
  enableEventExport = true,
  onEventEmitted,
  onEventAnalyzed,
  onAIInsight
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<EventBusState>({
    isActive: false,
    isPaused: false,
    events: [],
    analyses: [],
    insights: [],
    metrics: {
      totalEvents: 0,
      eventsPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      activeSubscribers: 0
    },
    subscribers: new Map()
  });

  const [showEventStream, setShowEventStream] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [filterType, setFilterType] = useState<TelemetryEventType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');

  const eventBusRef = useRef<NodeJS.Timeout | null>(null);
  const analyticsRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // ==================== EVENT BUS CONTROL ====================
  const startEventBus = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));

    if (enableRealTimeEvents) {
      eventBusRef.current = setInterval(() => {
        // Simulate real-time events
        const eventTypes: TelemetryEventType[] = [
          'performance:render',
          'performance:memory',
          'user:interaction',
          'ai:generation',
          'system:lifecycle'
        ];

        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event: TelemetryEvent = {
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          type: randomEventType,
          source: 'system',
          target: 'telemetry',
          data: generateEventData(randomEventType),
          metadata: {
            tenantId,
            userId,
            sessionId: sessionId.current,
            component: 'TelemetryEventBus',
            severity: Math.random() > 0.8 ? 'warning' : 'info',
            tags: ['automated', 'system']
          }
        };

        emitEvent(event);
      }, 1000);
    }

    if (enableEventAnalytics) {
      analyticsRef.current = setInterval(() => {
        analyzeEvents();
      }, 5000);
    }
  }, [tenantId, userId, enableRealTimeEvents, enableEventAnalytics]);

  const pauseEventBus = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (eventBusRef.current) {
      clearInterval(eventBusRef.current);
      eventBusRef.current = null;
    }
  }, []);

  const resumeEventBus = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startEventBus();
  }, [startEventBus]);

  const stopEventBus = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));

    if (eventBusRef.current) {
      clearInterval(eventBusRef.current);
      eventBusRef.current = null;
    }

    if (analyticsRef.current) {
      clearInterval(analyticsRef.current);
      analyticsRef.current = null;
    }
  }, []);

  // ==================== EVENT EMISSION ====================
  const emitEvent = useCallback((event: TelemetryEvent) => {
    setState(prev => ({
      ...prev,
      events: [...prev.events, event].slice(-1000), // Keep last 1000 events
      metrics: {
        ...prev.metrics,
        totalEvents: prev.metrics.totalEvents + 1,
        eventsPerSecond: prev.metrics.eventsPerSecond + 1
      }
    }));

    // Notify subscribers
    state.subscribers.forEach(callback => callback(event));
    onEventEmitted?.(event);

    // Update metrics
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          eventsPerSecond: Math.max(0, prev.metrics.eventsPerSecond - 1)
        }
      }));
    }, 1000);
  }, [onEventEmitted, state.subscribers]);

  const generateEventData = useCallback((eventType: TelemetryEventType): Record<string, any> => {
    switch (eventType) {
      case 'performance:render':
        return {
          renderTime: Math.random() * 100 + 10,
          component: 'AppContainer',
          timestamp: Date.now()
        };
      case 'performance:memory':
        return {
          memoryUsage: Math.random() * 500 + 50,
          memoryLimit: 1024,
          timestamp: Date.now()
        };
      case 'user:interaction':
        return {
          action: 'click',
          target: 'button-submit',
          coordinates: { x: Math.random() * 1000, y: Math.random() * 1000 },
          timestamp: Date.now()
        };
      case 'ai:generation':
        return {
          prompt: 'Generate a contact form',
          tokens: Math.floor(Math.random() * 100) + 10,
          confidence: Math.random() * 0.5 + 0.5,
          timestamp: Date.now()
        };
      case 'system:lifecycle':
        return {
          phase: 'running',
          uptime: Date.now(),
          timestamp: Date.now()
        };
      default:
        return { timestamp: Date.now() };
    }
  }, []);

  // ==================== EVENT ANALYTICS ====================
  const analyzeEvents = useCallback(() => {
    const recentEvents = state.events.slice(-100);

    // Analyze patterns
    const patterns: EventPattern[] = [];
    const anomalies: EventAnomaly[] = [];
    const trends: EventTrend[] = [];

    // Pattern: High frequency events
    const eventFrequency = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(eventFrequency).forEach(([type, count]) => {
      if (count > 10) {
        patterns.push({
          type: 'frequency',
          description: `High frequency of ${type} events`,
          confidence: 0.8,
          data: { eventType: type, count }
        });
      }
    });

    // Anomaly: Performance spikes
    const performanceEvents = recentEvents.filter(e => e.type.startsWith('performance:'));
    if (performanceEvents.length > 0) {
      const avgRenderTime = performanceEvents.reduce((sum, e) => sum + (e.data.renderTime || 0), 0) / performanceEvents.length;
      if (avgRenderTime > 80) {
        anomalies.push({
          type: 'spike',
          description: 'Performance degradation detected',
          severity: 'high',
          data: { averageRenderTime: avgRenderTime, threshold: 80 }
        });
      }
    }

    // Trend: Increasing events
    const eventCounts = recentEvents.reduce((acc, event, index) => {
      acc[index] = (acc[index - 1] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const trendDirection = eventCounts[recentEvents.length - 1] > eventCounts[0] ? 'increasing' : 'decreasing';
    trends.push({
      direction: trendDirection,
      description: `Event frequency is ${trendDirection}`,
      confidence: 0.7,
      data: { startCount: eventCounts[0], endCount: eventCounts[recentEvents.length - 1] }
    });

    const analysis: EventAnalysis = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date(),
      eventType: 'telemetry:metric',
      patterns,
      anomalies,
      trends,
      recommendations: generateRecommendations(patterns, anomalies, trends),
      riskScore: calculateRiskScore(anomalies)
    };

    setState(prev => ({
      ...prev,
      analyses: [...prev.analyses, analysis].slice(-50) // Keep last 50 analyses
    }));

    onEventAnalyzed?.(analysis);

    // Generate AI insights
    if (enableAIIntegration) {
      generateAIInsights(analysis);
    }
  }, [state.events, enableAIIntegration, onEventAnalyzed]);

  const generateRecommendations = useCallback((patterns: EventPattern[], anomalies: EventAnomaly[], trends: EventTrend[]): string[] => {
    const recommendations: string[] = [];

    if (anomalies.some(a => a.severity === 'critical')) {
      recommendations.push('Immediate attention required for critical anomalies');
    }

    if (patterns.some(p => p.type === 'frequency' && p.data.count > 20)) {
      recommendations.push('Consider rate limiting for high-frequency events');
    }

    if (trends.some(t => t.direction === 'increasing' && t.confidence > 0.8)) {
      recommendations.push('Monitor increasing event trends for potential issues');
    }

    return recommendations;
  }, []);

  const calculateRiskScore = useCallback((anomalies: EventAnomaly[]): number => {
    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalWeight = anomalies.reduce((sum, anomaly) => sum + severityWeights[anomaly.severity], 0);
    return Math.min(100, totalWeight * 10);
  }, []);

  // ==================== AI INSIGHTS ====================
  const generateAIInsights = useCallback((analysis: EventAnalysis) => {
    const insights: AIInsight[] = [];

    // Performance insight
    if ((analysis.anomalies || []).some(a => (a.description || '').includes('Performance'))) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        timestamp: new Date(),
        type: 'performance',
        insight: 'Performance degradation detected. Consider optimizing render cycles and memory usage.',
        confidence: 0.85,
        actionItems: [
          'Review component render optimization',
          'Check memory leaks',
          'Monitor bundle size'
        ],
        impact: 'high',
        data: { analysisId: analysis.id }
      });
    }

    // Security insight
    if ((analysis.patterns || []).some(p => (p.description || '').includes('security'))) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'security',
        insight: 'Unusual security event patterns detected. Review access patterns and permissions.',
        confidence: 0.9,
        actionItems: [
          'Audit user permissions',
          'Review access logs',
          'Check for suspicious activity'
        ],
        impact: 'critical',
        data: { analysisId: analysis.id }
      });
    }

    // User experience insight
    if ((analysis.trends || []).some(t => t.direction === 'increasing' && (t.description || '').includes('interaction'))) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        timestamp: new Date(),
        type: 'user_experience',
        insight: 'User interaction patterns suggest engagement opportunities. Consider feature optimization.',
        confidence: 0.75,
        actionItems: [
          'Analyze user journey patterns',
          'Optimize high-traffic features',
          'Consider new feature development'
        ],
        impact: 'medium',
        data: { analysisId: analysis.id }
      });
    }

    insights.forEach(insight => {
      setState(prev => ({
        ...prev,
        insights: [...prev.insights, insight].slice(-50) // Keep last 50 insights
      }));
      onAIInsight?.(insight);
    });
  }, [onAIInsight]);

  // ==================== EVENT SUBSCRIPTION ====================
  const subscribe = useCallback((id: string, callback: (event: TelemetryEvent) => void) => {
    setState(prev => {
      const newSubscribers = new Map(prev.subscribers);
      newSubscribers.set(id, callback);
      return {
        ...prev,
        subscribers: newSubscribers,
        metrics: {
          ...prev.metrics,
          activeSubscribers: newSubscribers.size
        }
      };
    });
  }, []);

  const unsubscribe = useCallback((id: string) => {
    setState(prev => {
      const newSubscribers = new Map(prev.subscribers);
      newSubscribers.delete(id);
      return {
        ...prev,
        subscribers: newSubscribers,
        metrics: {
          ...prev.metrics,
          activeSubscribers: newSubscribers.size
        }
      };
    });
  }, []);

  // ==================== EVENT EXPORT ====================
  const exportEvents = useCallback(() => {
    const exportData = {
      events: state.events,
      analyses: state.analyses,
      insights: state.insights,
      metrics: state.metrics,
      exportTime: new Date().toISOString(),
      tenantId,
      userId
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state, tenantId, userId]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (enableRealTimeEvents || enableEventAnalytics) {
      startEventBus();
    }

    return () => {
      stopEventBus();
    };
  }, [enableRealTimeEvents, enableEventAnalytics, startEventBus, stopEventBus]);

  // ==================== RENDER ====================
  const filteredEvents = state.events.filter(event => {
    if (filterType !== 'all' && event.type !== filterType) return false;
    if (filterSeverity !== 'all' && event.metadata.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Telemetry Event Bus</h2>

          {/* Event Bus Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Event Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {state.metrics.totalEvents} events • {state.metrics.eventsPerSecond}/s
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filters */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="performance:render">Performance</option>
            <option value="security:violation">Security</option>
            <option value="user:interaction">User</option>
            <option value="ai:generation">AI</option>
            <option value="system:lifecycle">System</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!state.isActive ? (
              <button
                onClick={startEventBus}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeEventBus}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseEventBus}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopEventBus}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>

            {enableEventExport && (
              <button
                onClick={exportEvents}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            )}
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEventStream(!showEventStream)}
              className={`p-2 rounded ${showEventStream ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded ${showAnalytics ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`p-2 rounded ${showInsights ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== EVENT STREAM ==================== */}
        <div className="flex-1 p-4">
          {/* Event Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.metrics.totalEvents}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Events</div>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.metrics.eventsPerSecond}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Events/sec</div>
                </div>
                <Zap className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {state.metrics.activeSubscribers}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Subscribers</div>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {state.metrics.errorRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Error Rate</div>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Event Stream */}
          <AnimatePresence>
            {showEventStream && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Stream</h3>
                <div className="h-64 overflow-y-auto space-y-2">
                  {filteredEvents.slice(-50).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{event.type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.metadata.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          event.metadata.severity === 'error' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          event.metadata.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {event.metadata.severity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.timestamp.toLocaleTimeString()} • {event.source} → {event.target}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Analytics Panel */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Analytics</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.analyses.slice(-5).map((analysis) => (
                      <div key={analysis.id} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="font-medium text-blue-600 dark:text-blue-400">Analysis</div>
                        <div className="text-blue-500 dark:text-blue-300">
                          {analysis.patterns.length} patterns, {analysis.anomalies.length} anomalies
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Risk Score: {analysis.riskScore}/100
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insights Panel */}
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.insights.slice(-5).map((insight) => (
                      <div key={insight.id} className="text-sm bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <div className="font-medium text-purple-600 dark:text-purple-400">{insight.type}</div>
                        <div className="text-purple-500 dark:text-purple-300">{insight.insight}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence: {(insight.confidence * 100).toFixed(1)}% • Impact: {insight.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ==================== HOOK ====================
export const useTelemetryEventBus = () => {
  const [eventBus, setEventBus] = useState<any>(null);

  const emitEvent = useCallback((event: Omit<TelemetryEvent, 'id' | 'timestamp'>) => {
    if (eventBus) {
      const fullEvent: TelemetryEvent = {
        ...event,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      eventBus.emitEvent(fullEvent);
    }
  }, [eventBus]);

  return { eventBus, setEventBus, emitEvent };
};

export default TelemetryEventBus;
