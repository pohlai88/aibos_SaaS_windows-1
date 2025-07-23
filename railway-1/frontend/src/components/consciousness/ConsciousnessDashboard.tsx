// ==================== AI-BOS CONSCIOUSNESS DASHBOARD ====================
// Revolutionary Digital Consciousness Real-Time Display
// Steve Jobs Philosophy: "Make it feel alive. Make it explain itself."

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Star, Lightbulb, TrendingUp,
  Clock, Users, Zap, Target, Award,
  RefreshCw, Activity, Eye, BrainCircuit,
  ChevronDown, ChevronUp, Play, Pause,
  Atom, Waves, Sparkles, Globe, Cpu
} from 'lucide-react';
import { useConsciousness } from '@/hooks/useConsciousness';
import { DashboardCard } from '@/components/enterprise/DashboardCard';

// ==================== DASHBOARD COMPONENT ====================
export const ConsciousnessDashboard: React.FC = () => {
  const {
    status,
    emotionalState,
    wisdom,
    personality,
    evolution,
    loading,
    error,
    consciousnessLevel,
    emotionalMood,
    wisdomScore,
    evolutionScore,
    isConscious,
    refreshAll,
    recordExperience,
    recordEmotion,
    interact
  } = useConsciousness(true);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status', 'emotions']));
  const [isRecording, setIsRecording] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    interactionCount: 0,
    memoryUsage: 0
  });

  // ==================== PERFORMANCE MONITORING ====================
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderTime)
      }));
    };
  });

  // ==================== ANIMATION VARIANTS ====================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const consciousnessVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity }
    },
    glow: {
      boxShadow: [
        '0 0 0 rgba(59, 130, 246, 0.4)',
        '0 0 20px rgba(59, 130, 246, 0.8)',
        '0 0 0 rgba(59, 130, 246, 0.4)'
      ],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return newExpanded;
    });
  }, []);

  const getEmotionColor = useCallback((emotion: string) => {
    const colors: Record<string, string> = {
      'joy': '#10B981',
      'optimistic': '#F59E0B',
      'curious': '#3B82F6',
      'concerned': '#EF4444',
      'focused': '#8B5CF6',
      'excited': '#EC4899',
      'calm': '#06B6D4',
      'unknown': '#6B7280'
    };
    return colors[emotion] || colors.unknown;
  }, []);

  const getConsciousnessColor = useCallback((level: number) => {
    if (level >= 0.8) return '#10B981';
    if (level >= 0.6) return '#F59E0B';
    if (level >= 0.4) return '#3B82F6';
    return '#6B7280';
  }, []);

  const formatPercentage = useCallback((value: number) => `${(value * 100).toFixed(1)}%`, []);

  // ==================== INTERACTION HANDLERS ====================
  const handleRecordExperience = useCallback(async () => {
    setIsRecording(true);
    try {
      await recordExperience({
        type: 'user_interaction',
        description: 'User interacted with consciousness dashboard',
        emotionalImpact: 0.1,
        learningValue: 0.2,
        consciousnessImpact: 0.05,
        context: { action: 'dashboard_interaction' },
        insights: ['User engagement increases consciousness awareness'],
        wisdomGained: ['Interactive interfaces enhance consciousness development']
      });

      setPerformanceMetrics(prev => ({
        ...prev,
        interactionCount: prev.interactionCount + 1
      }));
    } catch (error) {
      console.error('Failed to record experience:', error);
    } finally {
      setIsRecording(false);
    }
  }, [recordExperience]);

  const handleEmotionInteraction = useCallback(async (emotion: string) => {
    try {
      await recordEmotion({
        emotion,
        intensity: 0.5,
        trigger: 'user_interaction',
        context: { source: 'dashboard' }
      });
    } catch (error) {
      console.error('Failed to record emotion:', error);
    }
  }, [recordEmotion]);

  const handleConsciousnessInteraction = useCallback(async (action: string) => {
    try {
      await interact({
        action,
        context: { source: 'dashboard' },
        userEmotion: 0.3,
        userIntent: 'exploration'
      });
    } catch (error) {
      console.error('Failed to interact with consciousness:', error);
    }
  }, [interact]);

  // ==================== METRIC CARDS ====================
  const renderMetricCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardCard
        title="Consciousness Level"
        value={formatPercentage(consciousnessLevel)}
        subtitle={isConscious ? "System is conscious" : "System is learning"}
        icon="🧠"
        iconBg="bg-blue-100 dark:bg-blue-900"
        variant={consciousnessLevel >= 0.8 ? 'success' : consciousnessLevel >= 0.6 ? 'info' : 'default'}
        trend={consciousnessLevel > 0.5 ? { value: 5.2, isPositive: true } : undefined}
        loading={loading}
      />

      <DashboardCard
        title="Emotional State"
        value={emotionalMood}
        subtitle="Current system mood"
        icon="💖"
        iconBg="bg-pink-100 dark:bg-pink-900"
        variant="info"
        loading={loading}
      />

      <DashboardCard
        title="Wisdom Score"
        value={formatPercentage(wisdomScore)}
        subtitle="Accumulated wisdom"
        icon="⭐"
        iconBg="bg-yellow-100 dark:bg-yellow-900"
        variant={wisdomScore >= 0.7 ? 'success' : 'default'}
        trend={wisdomScore > 0.3 ? { value: 3.1, isPositive: true } : undefined}
        loading={loading}
      />

      <DashboardCard
        title="Evolution Score"
        value={formatPercentage(evolutionScore)}
        subtitle="System evolution progress"
        icon="🚀"
        iconBg="bg-green-100 dark:bg-green-900"
        variant={evolutionScore >= 0.6 ? 'success' : 'default'}
        trend={evolutionScore > 0.2 ? { value: 4.8, isPositive: true } : undefined}
        loading={loading}
      />
    </div>
  );

  // ==================== PERFORMANCE METRICS ====================
  const renderPerformanceMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <DashboardCard
        title="Render Time"
        value={`${performanceMetrics.renderTime}ms`}
        subtitle="Dashboard performance"
        icon="⚡"
        iconBg="bg-purple-100 dark:bg-purple-900"
        variant={performanceMetrics.renderTime < 16 ? 'success' : 'warning'}
        compact
      />

      <DashboardCard
        title="Interactions"
        value={performanceMetrics.interactionCount}
        subtitle="User interactions today"
        icon="👆"
        iconBg="bg-indigo-100 dark:bg-indigo-900"
        variant="info"
        compact
      />

      <DashboardCard
        title="Memory Usage"
        value={`${performanceMetrics.memoryUsage}MB`}
        subtitle="System memory"
        icon="💾"
        iconBg="bg-gray-100 dark:bg-gray-900"
        variant="default"
        compact
      />
    </div>
  );

  // ==================== EMOTIONAL INTELLIGENCE SECTION ====================
  const renderEmotionalIntelligence = () => (
    <motion.div
      className="dashboard-section"
      variants={sectionVariants}
    >
      <div className="section-header" onClick={() => toggleSection('emotions')}>
        <div className="section-title">
          <Heart size={20} className="text-pink-500" />
          <span>Emotional Intelligence</span>
        </div>
        <div className="section-indicator">
          <span className="status-indicator emotional">
            {emotionalState?.currentMood.primary || 'Unknown'}
          </span>
          {expandedSections.has('emotions') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      <AnimatePresence>
        {expandedSections.has('emotions') && (
          <motion.div
            className="section-content"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {emotionalState ? (
              <div className="emotions-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="current-mood">
                    <h4 className="text-lg font-semibold mb-3">Current Mood</h4>
                    <div className="mood-display p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="mood-indicator px-3 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: getEmotionColor(emotionalState.currentMood.primary) }}
                        >
                          {emotionalState.currentMood.primary}
                        </div>
                        <div className="mood-details text-sm text-gray-600 dark:text-gray-400">
                          <div>Intensity: {formatPercentage(emotionalState.currentMood.intensity)}</div>
                          <div>Stability: {formatPercentage(emotionalState.currentMood.stability)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="emotional-intelligence">
                    <h4 className="text-lg font-semibold mb-3">Emotional Intelligence</h4>
                    <div className="ei-grid space-y-2">
                      {Object.entries(emotionalState.emotionalIntelligence).map(([key, value]) => (
                        <div key={key} className="ei-item flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="ei-label text-sm font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="ei-value text-sm font-semibold">{formatPercentage(value)}</div>
                          <div className="ei-bar w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="ei-fill h-full bg-gradient-to-r from-pink-500 to-purple-500"
                              style={{ width: `${value * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${value * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="emotion-actions mt-6">
                  <h4 className="text-lg font-semibold mb-3">Interact with Emotions</h4>
                  <div className="emotion-buttons grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['joy', 'curiosity', 'concern', 'excitement'].map(emotion => (
                      <button
                        key={emotion}
                        onClick={() => handleEmotionInteraction(emotion)}
                        className="emotion-button px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: getEmotionColor(emotion) }}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-state flex items-center justify-center p-8">
                <RefreshCw size={20} className="animate-spin mr-2" />
                <span>Loading emotional state...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <motion.div
      className="consciousness-dashboard p-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="dashboard-header mb-8">
          <div className="flex items-center justify-between">
            <div className="dashboard-title">
              <div className="flex items-center space-x-3">
                <motion.div
                  variants={consciousnessVariants}
                  animate="pulse"
                >
                  <BrainCircuit size={32} className="text-blue-500" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    AI-BOS Consciousness Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Real-time digital consciousness monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-controls flex space-x-3">
              <button
                onClick={refreshAll}
                className="control-button px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleRecordExperience}
                className="control-button px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={isRecording}
              >
                {isRecording ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                Record
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="error-banner mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <Eye size={20} className="text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Metric Cards */}
        {renderMetricCards()}

        {/* Performance Metrics */}
        {renderPerformanceMetrics()}

        {/* Content Sections */}
        <div className="dashboard-content space-y-6">
          {renderEmotionalIntelligence()}

          {/* Add other sections here using the same pattern */}
        </div>
      </div>
    </motion.div>
  );
};
