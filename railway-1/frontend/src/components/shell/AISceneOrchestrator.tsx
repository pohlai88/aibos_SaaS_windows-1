'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================
interface OrchestrationContext {
  time: number;
  userActivity: {
    isIdle: boolean;
    idleTime: number;
    recentApps: string[];
    productivityScore: number;
    stressLevel: number;
    energyLevel: number;
  };
  environment: {
    weather: string;
    temperature: number;
    isWorkHours: boolean;
    isWeekend: boolean;
  };
  calendar: {
    hasMeetings: boolean;
    meetingCount: number;
    nextMeetingTime?: number;
    isImportantDay: boolean;
  };
  system: {
    performance: number;
    batteryLevel: number;
    networkStatus: 'online' | 'offline' | 'slow';
  };
}

interface OrchestrationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    idleTime?: { min: number; max?: number };
    stressLevel?: { min: number; max?: number };
    energyLevel?: { min: number; max?: number };
    timeOfDay?: { start: number; end: number };
    weather?: string[];
    hasMeetings?: boolean;
    meetingCount?: { min: number; max?: number };
    isWeekend?: boolean;
    performance?: { min: number; max?: number };
  };
  actions: {
    sceneId: string;
    message?: string;
    autoSwitch: boolean;
    priority: 'high' | 'medium' | 'low';
  };
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

interface OrchestrationEvent {
  id: string;
  timestamp: Date;
  ruleId: string;
  ruleName: string;
  context: OrchestrationContext;
  action: string;
  result: 'success' | 'failure' | 'ignored';
  message?: string;
}

// ==================== CONTEXT ====================
interface OrchestratorContextType {
  currentContext: OrchestrationContext | null;
  activeRules: OrchestrationRule[];
  events: OrchestrationEvent[];
  isOrchestrating: boolean;
  enableAutoSwitch: boolean;
  setEnableAutoSwitch: (enabled: boolean) => void;
  addRule: (rule: OrchestrationRule) => void;
  removeRule: (ruleId: string) => void;
  updateRule: (ruleId: string, updates: Partial<OrchestrationRule>) => void;
  getOrchestrationHistory: () => OrchestrationEvent[];
}

const OrchestratorContext = createContext<OrchestratorContextType | null>(null);

export const useOrchestrator = () => {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestrator must be used within an AISceneOrchestrator');
  }
  return context;
};

// ==================== AI ORCHESTRATION ENGINE ====================
class AISceneOrchestrationEngine {
  private static instance: AISceneOrchestrationEngine;
  private rules: OrchestrationRule[] = [];
  private events: OrchestrationEvent[] = [];
  private isRunning = false;
  private contextHistory: OrchestrationContext[] = [];

  static getInstance(): AISceneOrchestrationEngine {
    if (!AISceneOrchestrationEngine.instance) {
      AISceneOrchestrationEngine.instance = new AISceneOrchestrationEngine();
    }
    return AISceneOrchestrationEngine.instance;
  }

  // Initialize default orchestration rules
  initializeDefaultRules() {
    this.rules = [
      {
        id: 'morning-focus',
        name: 'Morning Focus',
        description: 'Switch to focus mode during morning work hours',
        conditions: {
          timeOfDay: { start: 6, end: 10 },
          isWeekend: false
        },
        actions: {
          sceneId: 'morning-focus',
          message: 'Good morning! Time to focus and plan your day.',
          autoSwitch: true,
          priority: 'high'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'idle-reset',
        name: 'Idle Reset',
        description: 'Switch to zen mode when user has been idle',
        conditions: {
          idleTime: { min: 10 }
        },
        actions: {
          sceneId: 'zen-reset',
          message: 'You\'ve been idle for a while. Time for a mental reset?',
          autoSwitch: true,
          priority: 'medium'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'stress-relief',
        name: 'Stress Relief',
        description: 'Automatically switch to calming scene when stress detected',
        conditions: {
          stressLevel: { min: 7 }
        },
        actions: {
          sceneId: 'stress-relief',
          message: 'High stress detected. Let\'s create a calming environment.',
          autoSwitch: true,
          priority: 'high'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'meeting-mode',
        name: 'Meeting Mode',
        description: 'Switch to professional mode before meetings',
        conditions: {
          hasMeetings: true,
          meetingCount: { min: 3 }
        },
        actions: {
          sceneId: 'meeting-mode',
          message: 'You have multiple meetings today. Switching to professional mode.',
          autoSwitch: true,
          priority: 'high'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'evening-wind-down',
        name: 'Evening Wind Down',
        description: 'Switch to cozy mode in the evening',
        conditions: {
          timeOfDay: { start: 18, end: 22 }
        },
        actions: {
          sceneId: 'cozy-evening',
          message: 'Evening time. Let\'s wind down and relax.',
          autoSwitch: true,
          priority: 'medium'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'performance-optimization',
        name: 'Performance Optimization',
        description: 'Switch to minimal mode when system performance is low',
        conditions: {
          performance: { min: 0, max: 30 }
        },
        actions: {
          sceneId: 'deep-work',
          message: 'System performance is low. Switching to minimal mode.',
          autoSwitch: true,
          priority: 'high'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'creative-inspiration',
        name: 'Creative Inspiration',
        description: 'Switch to creative mode during peak creativity hours',
        conditions: {
          timeOfDay: { start: 10, end: 14 },
          energyLevel: { min: 7 }
        },
        actions: {
          sceneId: 'creative-flow',
          message: 'Peak creativity hours! Let\'s get inspired.',
          autoSwitch: false,
          priority: 'medium'
        },
        isActive: true,
        triggerCount: 0
      },
      {
        id: 'rainy-focus',
        name: 'Rainy Focus',
        description: 'Switch to cozy focus mode on rainy days',
        conditions: {
          weather: ['rainy', 'stormy']
        },
        actions: {
          sceneId: 'rainy-focus',
          message: 'Perfect weather for focused indoor work.',
          autoSwitch: true,
          priority: 'medium'
        },
        isActive: true,
        triggerCount: 0
      }
    ];
  }

  // Analyze current context
  analyzeContext(): OrchestrationContext {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const context: OrchestrationContext = {
      time: now.getTime(),
      userActivity: {
        isIdle: Math.random() > 0.7, // Simulate idle detection
        idleTime: Math.floor(Math.random() * 30),
        recentApps: ['terminal', 'code-editor', 'browser'],
        productivityScore: Math.floor(Math.random() * 40) + 60,
        stressLevel: Math.floor(Math.random() * 10),
        energyLevel: Math.floor(Math.random() * 10)
      },
      environment: {
        weather: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
        temperature: Math.floor(Math.random() * 30) + 10,
        isWorkHours: hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      },
      calendar: {
        hasMeetings: Math.random() > 0.5,
        meetingCount: Math.floor(Math.random() * 6),
        nextMeetingTime: Math.random() > 0.5 ? now.getTime() + Math.random() * 3600000 : undefined,
        isImportantDay: Math.random() > 0.7
      },
      system: {
        performance: Math.floor(Math.random() * 100),
        batteryLevel: Math.floor(Math.random() * 100),
        networkStatus: ['online', 'offline', 'slow'][Math.floor(Math.random() * 3)] as any
      }
    };

    this.contextHistory.push(context);
    if (this.contextHistory.length > 50) {
      this.contextHistory.shift();
    }

    return context;
  }

  // Check if conditions are met for a rule
  checkConditions(rule: OrchestrationRule, context: OrchestrationContext): boolean {
    const { conditions } = rule;

    // Check idle time
    if (conditions.idleTime) {
      const { min, max } = conditions.idleTime;
      if (context.userActivity.idleTime < min || (max && context.userActivity.idleTime > max)) {
        return false;
      }
    }

    // Check stress level
    if (conditions.stressLevel) {
      const { min, max } = conditions.stressLevel;
      if (context.userActivity.stressLevel < min || (max && context.userActivity.stressLevel > max)) {
        return false;
      }
    }

    // Check energy level
    if (conditions.energyLevel) {
      const { min, max } = conditions.energyLevel;
      if (context.userActivity.energyLevel < min || (max && context.userActivity.energyLevel > max)) {
        return false;
      }
    }

    // Check time of day
    if (conditions.timeOfDay) {
      const hour = new Date(context.time).getHours();
      if (hour < conditions.timeOfDay.start || hour > conditions.timeOfDay.end) {
        return false;
      }
    }

    // Check weather
    if (conditions.weather && !conditions.weather.includes(context.environment.weather)) {
      return false;
    }

    // Check meetings
    if (conditions.hasMeetings !== undefined && conditions.hasMeetings !== context.calendar.hasMeetings) {
      return false;
    }

    // Check meeting count
    if (conditions.meetingCount) {
      const { min, max } = conditions.meetingCount;
      if (context.calendar.meetingCount < min || (max && context.calendar.meetingCount > max)) {
        return false;
      }
    }

    // Check weekend
    if (conditions.isWeekend !== undefined && conditions.isWeekend !== context.environment.isWeekend) {
      return false;
    }

    // Check performance
    if (conditions.performance) {
      const { min, max } = conditions.performance;
      if (context.system.performance < min || (max && context.system.performance > max)) {
        return false;
      }
    }

    return true;
  }

  // Execute orchestration rules
  async executeRules(context: OrchestrationContext, onSceneSwitch: (sceneId: string, message?: string) => void): Promise<OrchestrationEvent[]> {
    const events: OrchestrationEvent[] = [];

    for (const rule of this.rules.filter(r => r.isActive)) {
      if (this.checkConditions(rule, context)) {
        // Check if rule was recently triggered (cooldown)
        const lastTriggered = rule.lastTriggered;
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
        if (lastTriggered && Date.now() - lastTriggered.getTime() < cooldownPeriod) {
          events.push({
            id: `event-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            ruleId: rule.id,
            ruleName: rule.name,
            context,
            action: rule.actions.sceneId,
            result: 'ignored',
            message: 'Rule on cooldown'
          });
          continue;
        }

        // Execute rule
        try {
          if (rule.actions.autoSwitch) {
            onSceneSwitch(rule.actions.sceneId, rule.actions.message);
          }

          // Update rule
          rule.lastTriggered = new Date();
          rule.triggerCount++;

          events.push({
            id: `event-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            ruleId: rule.id,
            ruleName: rule.name,
            context,
            action: rule.actions.sceneId,
            result: 'success',
            message: rule.actions.message
          });
        } catch (error) {
          events.push({
            id: `event-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            ruleId: rule.id,
            ruleName: rule.name,
            context,
            action: rule.actions.sceneId,
            result: 'failure',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    this.events.push(...events);
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    return events;
  }

  // Get orchestration history
  getHistory(): OrchestrationEvent[] {
    return [...this.events];
  }

  // Add custom rule
  addRule(rule: OrchestrationRule) {
    this.rules.push(rule);
  }

  // Remove rule
  removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  // Update rule
  updateRule(ruleId: string, updates: Partial<OrchestrationRule>) {
    this.rules = this.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
  }

  // Get all rules
  getRules(): OrchestrationRule[] {
    return [...this.rules];
  }
}

// ==================== REACT COMPONENT ====================
interface AISceneOrchestratorProps {
  onSceneSwitch: (sceneId: string, message?: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const AISceneOrchestrator: React.FC<AISceneOrchestratorProps> = ({
  onSceneSwitch,
  children,
  className = ''
}) => {
  const [currentContext, setCurrentContext] = useState<OrchestrationContext | null>(null);
  const [activeRules, setActiveRules] = useState<OrchestrationRule[]>([]);
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [enableAutoSwitch, setEnableAutoSwitch] = useState(true);
  const [showOrchestrationPanel, setShowOrchestrationPanel] = useState(false);

  // Initialize orchestration engine
  useEffect(() => {
    const engine = AISceneOrchestrationEngine.getInstance();
    engine.initializeDefaultRules();
    setActiveRules(engine.getRules());
  }, []);

  // Orchestration loop
  useEffect(() => {
    if (!enableAutoSwitch) return;

    const engine = AISceneOrchestrationEngine.getInstance();
    let interval: NodeJS.Timeout;

    const runOrchestration = async () => {
      setIsOrchestrating(true);

      try {
        const context = engine.analyzeContext();
        setCurrentContext(context);

        const newEvents = await engine.executeRules(context, onSceneSwitch);
        setEvents(prev => [...prev, ...newEvents].slice(-50));
        setActiveRules(engine.getRules());
      } catch (error) {
        console.error('Orchestration error:', error);
      } finally {
        setIsOrchestrating(false);
      }
    };

    // Run immediately
    runOrchestration();

    // Then run every 3 minutes
    interval = setInterval(runOrchestration, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enableAutoSwitch, onSceneSwitch]);

  // Context value
  const contextValue: OrchestratorContextType = {
    currentContext,
    activeRules,
    events,
    isOrchestrating,
    enableAutoSwitch,
    setEnableAutoSwitch,
    addRule: (rule) => {
      const engine = AISceneOrchestrationEngine.getInstance();
      engine.addRule(rule);
      setActiveRules(engine.getRules());
    },
    removeRule: (ruleId) => {
      const engine = AISceneOrchestrationEngine.getInstance();
      engine.removeRule(ruleId);
      setActiveRules(engine.getRules());
    },
    updateRule: (ruleId, updates) => {
      const engine = AISceneOrchestrationEngine.getInstance();
      engine.updateRule(ruleId, updates);
      setActiveRules(engine.getRules());
    },
    getOrchestrationHistory: () => {
      const engine = AISceneOrchestrationEngine.getInstance();
      return engine.getHistory();
    }
  };

  return (
    <OrchestratorContext.Provider value={contextValue}>
      {/* Orchestration Status Indicator */}
      <motion.div
        className={`fixed top-4 left-4 z-50 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={() => setShowOrchestrationPanel(!showOrchestrationPanel)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 ${
            isOrchestrating
              ? 'bg-gradient-to-br from-purple-500 to-blue-600'
              : 'bg-gradient-to-br from-green-500 to-emerald-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isOrchestrating ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isOrchestrating ? Infinity : 0, ease: "linear" }}
        >
          {isOrchestrating ? '🧠' : '🎭'}
        </motion.button>

        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </motion.div>

      {/* Orchestration Panel */}
      <AnimatePresence>
        {showOrchestrationPanel && (
          <motion.div
            className="fixed top-20 left-4 z-40 w-96 max-h-[calc(100vh-6rem)] bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden"
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">AI Orchestration</h3>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-white/70">Auto-switch</label>
                  <input
                    type="checkbox"
                    checked={enableAutoSwitch}
                    onChange={(e) => setEnableAutoSwitch(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Current Context */}
              {currentContext && (
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-white mb-2">Current Context</h4>
                  <div className="text-xs text-white/70 space-y-1">
                    <div>🕐 {new Date(currentContext.time).toLocaleTimeString()}</div>
                    <div>😴 Idle: {currentContext.userActivity.idleTime}m</div>
                    <div>😰 Stress: {currentContext.userActivity.stressLevel}/10</div>
                    <div>⚡ Energy: {currentContext.userActivity.energyLevel}/10</div>
                    <div>🌤️ {currentContext.environment.weather}</div>
                    <div>📅 {currentContext.calendar.meetingCount} meetings</div>
                  </div>
                </div>
              )}

              {/* Active Rules */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Active Rules ({activeRules.filter(r => r.isActive).length})</h4>
                <div className="space-y-2">
                  {activeRules.filter(r => r.isActive).map(rule => (
                    <div key={rule.id} className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium">{rule.name}</span>
                        <span className="text-xs text-white/60">{rule.triggerCount}x</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Events */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Recent Events</h4>
                <div className="space-y-1">
                  {events.slice(-5).reverse().map(event => (
                    <div key={event.id} className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium">{event.ruleName}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.result === 'success' ? 'bg-green-500/20 text-green-400' :
                          event.result === 'failure' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {event.result}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-xs text-white/60 mt-1">{event.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render children */}
      {children}
    </OrchestratorContext.Provider>
  );
};
