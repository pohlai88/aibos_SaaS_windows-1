'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript cache refresh - all errors resolved

// ==================== TYPES ====================
interface MoodContext {
  time: {
    hour: number;
    dayOfWeek: number;
    isWeekend: boolean;
    isWorkHours: boolean;
  };
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
    temperature: number;
    humidity: number;
  };
  calendar?: {
    hasMeetings: boolean;
    meetingCount: number;
    nextMeetingTime?: number;
    isImportantDay: boolean;
  };
  userActivity?: {
    isIdle: boolean;
    idleTime: number;
    recentApps: string[];
    productivityScore: number;
  };
  emotionalState?: {
    stressLevel: number; // 0-10
    energyLevel: number; // 0-10
    focusLevel: number; // 0-10
  };
}

interface MoodSuggestion {
  id: string;
  name: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  mood: 'focused' | 'creative' | 'relaxed' | 'energetic' | 'professional' | 'cozy' | 'zen' | 'productive';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  ambientSound?: string;
  aiBehavior: 'cheerful' | 'laser-focus' | 'zen' | 'energetic' | 'calm';
  autoSwitch?: boolean;
  priority: 'high' | 'medium' | 'low';
}

// ==================== AI MOOD ENGINE ====================
class AIMoodEngineClass {
  private static instance: AIMoodEngineClass;
  private contextHistory: MoodContext[] = [];
  private userPreferences: any = {};

  static getInstance(): AIMoodEngineClass {
    if (!AIMoodEngineClass.instance) {
      AIMoodEngineClass.instance = new AIMoodEngineClass();
    }
    return AIMoodEngineClass.instance;
  }

  // Analyze current context and generate mood suggestions
  analyzeContext(): MoodContext {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const context: MoodContext = {
      time: {
        hour,
        dayOfWeek,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isWorkHours: hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5
      },
      // Simulate weather data (would integrate with weather API)
      weather: this.simulateWeather(),
      // Simulate calendar data (would integrate with calendar API)
      calendar: this.simulateCalendar(),
      // Simulate user activity (would integrate with activity tracking)
      userActivity: this.simulateUserActivity(),
      // Simulate emotional state (would integrate with biometrics/behavioral analysis)
      emotionalState: this.simulateEmotionalState()
    };

    this.contextHistory.push(context);
    if (this.contextHistory.length > 10) {
      this.contextHistory.shift();
    }

    return context;
  }

  // Generate intelligent mood suggestions based on context
  generateSuggestions(context: MoodContext): MoodSuggestion[] {
    const suggestions: MoodSuggestion[] = [];

    // Time-based suggestions
    if (context.time.hour >= 6 && context.time.hour < 10) {
      suggestions.push({
        id: 'morning-focus',
        name: 'Morning Focus',
        description: 'Clean and bright to start your day with clarity',
        reason: 'Perfect time for deep work and planning',
        confidence: 0.9,
        mood: 'focused',
        colorScheme: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          background: '#F8FAFC'
        },
        ambientSound: 'morning-birds',
        aiBehavior: 'cheerful',
        priority: 'high'
      });
    }

    if (context.time.hour >= 10 && context.time.hour < 14) {
      suggestions.push({
        id: 'creative-flow',
        name: 'Creative Flow',
        description: 'Inspirational colors to spark your imagination',
        reason: 'Peak creativity hours - time to innovate',
        confidence: 0.85,
        mood: 'creative',
        colorScheme: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F97316',
          background: '#FDF4FF'
        },
        ambientSound: 'creative-flow',
        aiBehavior: 'energetic',
        priority: 'high'
      });
    }

    if (context.time.hour >= 14 && context.time.hour < 18) {
      suggestions.push({
        id: 'deep-work',
        name: 'Deep Work',
        description: 'Minimal and distraction-free for intense focus',
        reason: 'Afternoon focus session - eliminate distractions',
        confidence: 0.8,
        mood: 'productive',
        colorScheme: {
          primary: '#1F2937',
          secondary: '#374151',
          accent: '#6B7280',
          background: '#111827'
        },
        ambientSound: 'deep-focus',
        aiBehavior: 'laser-focus',
        priority: 'high'
      });
    }

    if (context.time.hour >= 18 && context.time.hour < 22) {
      suggestions.push({
        id: 'cozy-evening',
        name: 'Cozy Evening',
        description: 'Warm and comfortable for evening relaxation',
        reason: 'Time to wind down and reflect',
        confidence: 0.75,
        mood: 'cozy',
        colorScheme: {
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#92400E',
          background: '#FEF3C7'
        },
        ambientSound: 'cozy-evening',
        aiBehavior: 'calm',
        priority: 'medium'
      });
    }

    // Weather-based suggestions
    if (context.weather?.condition === 'rainy') {
      suggestions.push({
        id: 'rainy-focus',
        name: 'Rainy Focus',
        description: 'Cozy indoor atmosphere with rain sounds',
        reason: 'Perfect weather for focused indoor work',
        confidence: 0.7,
        mood: 'focused',
        colorScheme: {
          primary: '#64748B',
          secondary: '#475569',
          accent: '#94A3B8',
          background: '#F1F5F9'
        },
        ambientSound: 'rain-sounds',
        aiBehavior: 'calm',
        priority: 'medium'
      });
    }

    // Calendar-based suggestions
    if (context.calendar?.hasMeetings && context.calendar.meetingCount > 3) {
      suggestions.push({
        id: 'meeting-mode',
        name: 'Meeting Mode',
        description: 'Professional and alert for back-to-back meetings',
        reason: 'You have multiple meetings today - stay sharp',
        confidence: 0.9,
        mood: 'professional',
        colorScheme: {
          primary: '#1E40AF',
          secondary: '#1E3A8A',
          accent: '#3B82F6',
          background: '#EFF6FF'
        },
        ambientSound: 'professional',
        aiBehavior: 'laser-focus',
        priority: 'high'
      });
    }

    // Activity-based suggestions
    if (context.userActivity?.isIdle && context.userActivity.idleTime > 10) {
      suggestions.push({
        id: 'zen-reset',
        name: 'Zen Reset',
        description: 'Peaceful and minimal for mental clarity',
        reason: 'You\'ve been idle - time for a mental reset',
        confidence: 0.8,
        mood: 'zen',
        colorScheme: {
          primary: '#059669',
          secondary: '#047857',
          accent: '#10B981',
          background: '#ECFDF5'
        },
        ambientSound: 'zen-meditation',
        aiBehavior: 'zen',
        priority: 'medium',
        autoSwitch: true
      });
    }

    // Emotional state-based suggestions
    if (context.emotionalState && context.emotionalState.stressLevel > 7) {
      suggestions.push({
        id: 'stress-relief',
        name: 'Stress Relief',
        description: 'Calming colors and sounds to reduce stress',
        reason: 'High stress detected - let\'s create a calming environment',
        confidence: 0.85,
        mood: 'relaxed',
        colorScheme: {
          primary: '#7C3AED',
          secondary: '#6D28D9',
          accent: '#A78BFA',
          background: '#FAF5FF'
        },
        ambientSound: 'stress-relief',
        aiBehavior: 'calm',
        priority: 'high',
        autoSwitch: true
      });
    }

    // Sort by confidence and priority
    return suggestions
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return b.confidence - a.confidence;
      })
      .slice(0, 3); // Return top 3 suggestions
  }

  // Simulate weather data (would integrate with weather API)
  private simulateWeather() {
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)] as any,
      temperature: Math.floor(Math.random() * 30) + 10,
      humidity: Math.floor(Math.random() * 60) + 20
    };
  }

  // Simulate calendar data (would integrate with calendar API)
  private simulateCalendar() {
    const hasMeetings = Math.random() > 0.5;
    return {
      hasMeetings,
      meetingCount: hasMeetings ? Math.floor(Math.random() * 5) + 1 : 0,
      nextMeetingTime: hasMeetings ? Date.now() + Math.random() * 3600000 : undefined,
      isImportantDay: Math.random() > 0.7
    };
  }

  // Simulate user activity (would integrate with activity tracking)
  private simulateUserActivity() {
    return {
      isIdle: Math.random() > 0.7,
      idleTime: Math.floor(Math.random() * 20),
      recentApps: ['terminal', 'code-editor', 'browser'],
      productivityScore: Math.floor(Math.random() * 40) + 60
    };
  }

  // Simulate emotional state (would integrate with biometrics/behavioral analysis)
  private simulateEmotionalState() {
    return {
      stressLevel: Math.floor(Math.random() * 10),
      energyLevel: Math.floor(Math.random() * 10),
      focusLevel: Math.floor(Math.random() * 10)
    };
  }
}

// ==================== REACT COMPONENT ====================
interface AIMoodEngineProps {
  onSuggestionSelect: (suggestion: MoodSuggestion) => void;
  onAutoSwitch: (suggestion: MoodSuggestion) => void;
  className?: string;
}

export const AIMoodEngine: React.FC<AIMoodEngineProps> = ({
  onSuggestionSelect,
  onAutoSwitch,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<MoodSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentContext, setCurrentContext] = useState<MoodContext | null>(null);

  // Analyze context and generate suggestions
  const analyzeAndSuggest = useCallback(() => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const aiEngine = AIMoodEngineClass.getInstance();
      const context = aiEngine.analyzeContext();
      const newSuggestions = aiEngine.generateSuggestions(context);

      setCurrentContext(context);
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);

      // Check for auto-switch suggestions
      const autoSwitchSuggestion = newSuggestions.find((s: MoodSuggestion) => s.autoSwitch);
      if (autoSwitchSuggestion) {
        onAutoSwitch(autoSwitchSuggestion);
      }
    }, 1000); // Simulate AI processing time
  }, [onAutoSwitch]);

  // Analyze on mount and every 30 minutes
  useEffect(() => {
    analyzeAndSuggest();

    const interval = setInterval(analyzeAndSuggest, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [analyzeAndSuggest]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm"
            animate={isAnalyzing ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
          >
            🧠
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Mood Suggestions</h3>
            <p className="text-sm text-white/70">
              {isAnalyzing ? 'Analyzing your context...' : 'Based on your current situation'}
            </p>
          </div>
        </div>

        <motion.button
          onClick={analyzeAndSuggest}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Context Summary */}
      {currentContext && (
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-white/70">
              🕐 {currentContext.time.hour}:00
              {currentContext.time.isWeekend ? ' (Weekend)' : ' (Workday)'}
            </span>
            {currentContext.weather && (
              <span className="text-white/70">
                🌤️ {currentContext.weather.condition}, {currentContext.weather.temperature}°C
              </span>
            )}
            {currentContext.calendar?.hasMeetings && (
              <span className="text-white/70">
                📅 {currentContext.calendar.meetingCount} meetings today
              </span>
            )}
            {currentContext.userActivity?.isIdle && (
              <span className="text-white/70">
                😴 Idle for {currentContext.userActivity.idleTime} minutes
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Mood Suggestions */}
      <AnimatePresence>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4 cursor-pointer hover:bg-white/10 transition-all duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSuggestionSelect(suggestion)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: suggestion.colorScheme.primary }}
                  />
                  <h4 className="font-semibold text-white">{suggestion.name}</h4>
                  {suggestion.autoSwitch && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Auto
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/80 mb-2">{suggestion.description}</p>
                <p className="text-xs text-white/60">{suggestion.reason}</p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="text-xs text-white/60">
                  {Math.round(suggestion.confidence * 100)}% match
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-white/60">AI:</span>
                  <span className="text-xs text-blue-400">{suggestion.aiBehavior}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* No Suggestions State */}
      {!isAnalyzing && suggestions.length === 0 && (
        <motion.div
          className="text-center py-8 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-2">🤔</div>
          <p>No mood suggestions available</p>
          <p className="text-sm">Try refreshing or check back later</p>
        </motion.div>
      )}
    </div>
  );
};
