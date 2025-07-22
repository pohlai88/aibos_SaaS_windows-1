'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useApp } from '@/components/providers/AppProvider';
import { EmptyState, LogsEmptyState, DataEmptyState } from '@/components/ui/EmptyState';

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

interface RealtimeDemoState {
  events: RealtimeEvent[];
  metrics: SystemMetric[];
  collaborations: CollaborationSession[];
  activeView: 'overview' | 'events' | 'metrics' | 'collaborations';
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  lastUpdate: Date;
}

// ==================== CONSTANTS ====================
// Start with empty data to demonstrate warm empty states
const INITIAL_METRICS: SystemMetric[] = [];

const SAMPLE_EVENTS: RealtimeEvent[] = [];

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

const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ==================== COMPONENTS ====================

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
export const RealtimeDemo: React.FC = () => {
  const { openWindow } = useApp();
  const [state, setState] = useState<RealtimeDemoState>({
    events: SAMPLE_EVENTS,
    metrics: INITIAL_METRICS,
    collaborations: [],
    activeView: 'overview',
    isConnected: true,
    connectionQuality: 'excellent',
    lastUpdate: new Date()
  });

  // Simulate real-time updates
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

  // Simulate new events
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

  const handleMarkRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.id === id ? { ...event, isRead: true } : event
      )
    }));
  }, []);

  const handleViewChange = useCallback((view: RealtimeDemoState['activeView']) => {
    setState(prev => ({ ...prev, activeView: view }));
  }, []);

  const unreadCount = state.events.filter(e => !e.isRead).length;

  return (
    <div className="h-full bg-gray-50 p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Realtime Intelligence</h1>
              <p className="text-gray-600">Live system monitoring and real-time insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  state.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {state.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last update: {state.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'events', label: 'Events', icon: '🔔', badge: unreadCount },
              { key: 'metrics', label: 'Metrics', icon: '📈' },
              { key: 'collaborations', label: 'Collaborations', icon: '👥' }
            ].map(({ key, label, icon, badge }) => (
              <button
                key={key}
                onClick={() => handleViewChange(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.activeView === key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {state.activeView === 'overview' && (
            <motion.div
              key="overview"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
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
                    // Simulate adding metrics
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
                  helpText="System metrics track performance indicators like CPU usage, memory consumption, network latency, and user activity. They help you monitor your platform's health and performance."
                />
              )}

              {/* Recent Events */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                              {state.events.length > 0 ? (
                <div className="space-y-3">
                  {state.events.slice(0, 3).map((event) => (
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

          {state.activeView === 'events' && (
            <motion.div
              key="events"
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {state.events.length > 0 ? (
                state.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onMarkRead={handleMarkRead}
                  />
                ))
              ) : (
                <DataEmptyState
                  title="No Events Yet"
                  description="When system events occur, they'll appear here in real-time."
                  actionLabel="Refresh"
                  onAction={() => window.location.reload()}
                  helpText="System events include user actions, system notifications, AI activities, and collaboration updates. They help you stay informed about what's happening on your platform."
                />
              )}
            </motion.div>
          )}

          {state.activeView === 'metrics' && (
            <motion.div
              key="metrics"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
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
                    // Simulate adding metrics
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
                  helpText="System metrics track performance indicators like CPU usage, memory consumption, network latency, and user activity. They help you monitor your platform's health and performance."
                />
              )}

              {state.metrics.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
                  <div className="space-y-4">
                    {state.metrics.map((metric) => (
                      <div key={metric.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{metric.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">{metric.name}</h4>
                            <p className="text-sm text-gray-600">{metric.value}{metric.unit}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          metric.status === 'healthy' ? 'bg-green-100 text-green-600' :
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

                  {state.activeView === 'collaborations' && (
          <motion.div
            key="collaborations"
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DataEmptyState
              title="No Active Collaborations"
              description="When team members join workspaces or start collaborative sessions, they'll appear here."
              actionLabel="Start Collaboration"
              onAction={() => openWindow('collaboration', 'Collaboration')}
              helpText="Collaboration sessions allow team members to work together in real-time. You'll see active sessions, participant counts, and last activity times here."
            />
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RealtimeDemo;
