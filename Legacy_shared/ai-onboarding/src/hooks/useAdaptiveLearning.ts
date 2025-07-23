/**
 * useAdaptiveLearning Hook
 *
 * Provides adaptive learning functionality including:
 * - Performance tracking and analysis
 * - Dynamic difficulty adjustment
 * - Personalized recommendations
 * - Learning pattern recognition
 */

import { useState, useEffect, useCallback } from 'react';
import type { useMemo } from 'react';
import { logger } from '@aibos/shared/lib';

export interface AdaptiveLearningConfig {
  enabled: boolean;
  performanceThreshold: number;
  reviewThreshold: number;
  difficultyAdjustmentRate: number;
  recommendationConfidence: number;
  maxRecommendations: number;
}

export interface PerformanceData {
  type: 'assessment' | 'tutorial' | 'quiz' | 'practice';
  score: number;
  timeSpent: number;
  attempts: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AdaptiveLearningData {
  userId: string;
  performanceHistory: PerformanceData[];
  currentDifficulty: Record<string, number>;
  learningPatterns: Record<string, any>;
  recommendations: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    confidence: number;
    priority: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  lastUpdated: number;
}

export interface LearningPattern {
  skillId: string;
  averageScore: number;
  improvementRate: number;
  timeToMaster: number;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficultyPreference: 'easy' | 'medium' | 'hard';
  sessionDuration: number;
  frequency: number;
}

export const useAdaptiveLearning = (config: AdaptiveLearningConfig) => {
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveLearningData>({
    userId: 'anonymous',
    performanceHistory: [],
    currentDifficulty: {},
    learningPatterns: {},
    recommendations: [],
    lastUpdated: Date.now(),
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ============================================================================
  // PERFORMANCE TRACKING
  // ============================================================================

  const updatePerformanceData = useCallback(
    (type: PerformanceData['type'], score: number, metadata?: Record<string, any>) => {
      if (!config.enabled) return;

      const performanceData: PerformanceData = {
        type,
        score,
        timeSpent: metadata?.timeSpent || 0,
        attempts: metadata?.attempts || 1,
        timestamp: Date.now(),
        metadata,
      };

      setAdaptiveData((prev) => ({
        ...prev,
        performanceHistory: [...prev.performanceHistory, performanceData],
        lastUpdated: Date.now(),
      }));

      logger.info('Performance data updated', { type, score, metadata });
    },
    [config.enabled],
  );

  const getPerformanceStats = useCallback(
    (skillId?: string) => {
      const relevantData = skillId
        ? adaptiveData.performanceHistory.filter((p) => p.metadata?.skillId === skillId)
        : adaptiveData.performanceHistory;

      if (relevantData.length === 0) {
        return {
          averageScore: 0,
          totalAttempts: 0,
          improvementRate: 0,
          timeSpent: 0,
        };
      }

      const scores = relevantData.map((p) => p.score);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const totalAttempts = relevantData.reduce((sum, p) => sum + p.attempts, 0);
      const timeSpent = relevantData.reduce((sum, p) => sum + p.timeSpent, 0);

      // Calculate improvement rate (comparing recent vs older scores)
      const recentScores = relevantData.slice(-5).map((p) => p.score);
      const olderScores = relevantData.slice(0, -5).map((p) => p.score);

      let improvementRate = 0;
      if (olderScores.length > 0 && recentScores.length > 0) {
        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
        improvementRate = recentAvg - olderAvg;
      }

      return {
        averageScore,
        totalAttempts,
        improvementRate,
        timeSpent,
      };
    },
    [adaptiveData.performanceHistory],
  );

  // ============================================================================
  // DIFFICULTY ADJUSTMENT
  // ============================================================================

  const adjustDifficulty = useCallback(
    (skillId: string, direction: 'increase' | 'decrease' | 'maintain') => {
      if (!config.enabled) return;

      setAdaptiveData((prev) => {
        const currentDiff = prev.currentDifficulty[skillId] || 0.5;
        let newDifficulty = currentDiff;

        switch (direction) {
          case 'increase':
            newDifficulty = Math.min(1.0, currentDiff + config.difficultyAdjustmentRate);
            break;
          case 'decrease':
            newDifficulty = Math.max(0.1, currentDiff - config.difficultyAdjustmentRate);
            break;
          case 'maintain':
            newDifficulty = currentDiff;
            break;
        }

        return {
          ...prev,
          currentDifficulty: {
            ...prev.currentDifficulty,
            [skillId]: newDifficulty,
          },
          lastUpdated: Date.now(),
        };
      });

      logger.info('Difficulty adjusted', {
        skillId,
        direction,
        newDifficulty: adaptiveData.currentDifficulty[skillId],
      });
    },
    [config.enabled, config.difficultyAdjustmentRate, adaptiveData.currentDifficulty],
  );

  const getOptimalDifficulty = useCallback(
    (skillId: string): number => {
      const stats = getPerformanceStats(skillId);
      const currentDiff = adaptiveData.currentDifficulty[skillId] || 0.5;

      // Adjust based on performance
      if (stats.averageScore > config.performanceThreshold + 0.2) {
        // Performing well, increase difficulty
        return Math.min(1.0, currentDiff + 0.1);
      } else if (stats.averageScore < config.performanceThreshold - 0.2) {
        // Struggling, decrease difficulty
        return Math.max(0.1, currentDiff - 0.1);
      }

      return currentDiff;
    },
    [getPerformanceStats, adaptiveData.currentDifficulty, config.performanceThreshold],
  );

  // ============================================================================
  // LEARNING PATTERN ANALYSIS
  // ============================================================================

  const analyzeLearningPatterns = useCallback(async (): Promise<
    Record<string, LearningPattern>
  > => {
    if (!config.enabled) return {};

    setIsAnalyzing(true);

    try {
      const patterns: Record<string, LearningPattern> = {};
      const skillGroups = groupPerformanceBySkill(adaptiveData.performanceHistory);

      for (const [skillId, performances] of Object.entries(skillGroups)) {
        const stats = getPerformanceStats(skillId);
        const learningStyle = determineLearningStyle(performances);
        const difficultyPref = determineDifficultyPreference(performances);
        const sessionData = analyzeSessionPatterns(performances);

        patterns[skillId] = {
          skillId,
          averageScore: stats.averageScore,
          improvementRate: stats.improvementRate,
          timeToMaster: calculateTimeToMaster(performances),
          preferredLearningStyle: learningStyle,
          difficultyPreference: difficultyPref,
          sessionDuration: sessionData.averageDuration,
          frequency: sessionData.frequency,
        };
      }

      setAdaptiveData((prev) => ({
        ...prev,
        learningPatterns: patterns,
        lastUpdated: Date.now(),
      }));

      logger.info('Learning patterns analyzed', { patternsCount: Object.keys(patterns).length });
      return patterns;
    } catch (error) {
      logger.error('Failed to analyze learning patterns', { error });
      return {};
    } finally {
      setIsAnalyzing(false);
    }
  }, [config.enabled, adaptiveData.performanceHistory, getPerformanceStats]);

  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================

  const generateRecommendations = useCallback(async (): Promise<
    Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      confidence: number;
      priority: 'low' | 'medium' | 'high';
      reason: string;
    }>
  > => {
    if (!config.enabled) return [];

    try {
      const recommendations = [];
      const patterns = await analyzeLearningPatterns();

      // Generate skill-based recommendations
      for (const [skillId, pattern] of Object.entries(patterns)) {
        if (pattern.averageScore < config.reviewThreshold) {
          recommendations.push({
            id: `review-${skillId}`,
            type: 'review',
            title: `Review ${skillId.replace('-', ' ')}`,
            description: `You might benefit from reviewing ${skillId} concepts`,
            confidence: Math.max(0.5, 1 - pattern.averageScore),
            priority: 'high' as const,
            reason: `Low performance in ${skillId} (${(pattern.averageScore * 100).toFixed(0)}%)`,
          });
        }

        if (pattern.improvementRate > 0.1) {
          recommendations.push({
            id: `advance-${skillId}`,
            type: 'advance',
            title: `Advance in ${skillId.replace('-', ' ')}`,
            description: `You're improving quickly in ${skillId}, ready for more challenging content`,
            confidence: Math.min(0.9, pattern.improvementRate + 0.5),
            priority: 'medium' as const,
            reason: `Strong improvement rate in ${skillId}`,
          });
        }
      }

      // Generate learning style recommendations
      const dominantStyle = findDominantLearningStyle(patterns);
      if (dominantStyle) {
        recommendations.push({
          id: `style-${dominantStyle}`,
          type: 'learning-style',
          title: `Optimize for ${dominantStyle} Learning`,
          description: `Focus on ${dominantStyle} learning methods for better results`,
          confidence: 0.8,
          priority: 'medium' as const,
          reason: `Your learning pattern shows preference for ${dominantStyle} methods`,
        });
      }

      // Sort by confidence and limit
      const sortedRecommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, config.maxRecommendations);

      setAdaptiveData((prev) => ({
        ...prev,
        recommendations: sortedRecommendations,
        lastUpdated: Date.now(),
      }));

      logger.info('Recommendations generated', { count: sortedRecommendations.length });
      return sortedRecommendations;
    } catch (error) {
      logger.error('Failed to generate recommendations', { error });
      return [];
    }
  }, [config.enabled, config.reviewThreshold, config.maxRecommendations, analyzeLearningPatterns]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const groupPerformanceBySkill = (
    performances: PerformanceData[],
  ): Record<string, PerformanceData[]> => {
    return performances.reduce(
      (groups, performance) => {
        const skillId = performance.metadata?.skillId || 'general';
        if (!groups[skillId]) {
          groups[skillId] = [];
        }
        groups[skillId].push(performance);
        return groups;
      },
      {} as Record<string, PerformanceData[]>,
    );
  };

  const determineLearningStyle = (
    performances: PerformanceData[],
  ): LearningPattern['preferredLearningStyle'] => {
    // Analyze metadata to determine preferred learning style
    const visualCount = performances.filter((p) => p.metadata?.learningStyle === 'visual').length;
    const auditoryCount = performances.filter(
      (p) => p.metadata?.learningStyle === 'auditory',
    ).length;
    const kinestheticCount = performances.filter(
      (p) => p.metadata?.learningStyle === 'kinesthetic',
    ).length;
    const readingCount = performances.filter((p) => p.metadata?.learningStyle === 'reading').length;

    const maxCount = Math.max(visualCount, auditoryCount, kinestheticCount, readingCount);

    if (maxCount === visualCount) return 'visual';
    if (maxCount === auditoryCount) return 'auditory';
    if (maxCount === kinestheticCount) return 'kinesthetic';
    return 'reading';
  };

  const determineDifficultyPreference = (
    performances: PerformanceData[],
  ): LearningPattern['difficultyPreference'] => {
    const easyScores = performances
      .filter((p) => p.metadata?.difficulty === 'easy')
      .map((p) => p.score);
    const mediumScores = performances
      .filter((p) => p.metadata?.difficulty === 'medium')
      .map((p) => p.score);
    const hardScores = performances
      .filter((p) => p.metadata?.difficulty === 'hard')
      .map((p) => p.score);

    const easyAvg =
      easyScores.length > 0 ? easyScores.reduce((sum, s) => sum + s, 0) / easyScores.length : 0;
    const mediumAvg =
      mediumScores.length > 0
        ? mediumScores.reduce((sum, s) => sum + s, 0) / mediumScores.length
        : 0;
    const hardAvg =
      hardScores.length > 0 ? hardScores.reduce((sum, s) => sum + s, 0) / hardScores.length : 0;

    const maxAvg = Math.max(easyAvg, mediumAvg, hardAvg);

    if (maxAvg === easyAvg) return 'easy';
    if (maxAvg === hardAvg) return 'hard';
    return 'medium';
  };

  const analyzeSessionPatterns = (performances: PerformanceData[]) => {
    const sessionDurations = performances.map((p) => p.timeSpent).filter((d) => d > 0);
    const averageDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
        : 0;

    // Calculate frequency (sessions per week)
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSessions = performances.filter((p) => p.timestamp > oneWeekAgo).length;
    const frequency = recentSessions / 7; // sessions per day

    return { averageDuration, frequency };
  };

  const calculateTimeToMaster = (performances: PerformanceData[]): number => {
    // Find time from first attempt to reaching mastery threshold
    const masteryThreshold = 0.8;
    const sortedPerformances = performances.sort((a, b) => a.timestamp - b.timestamp);

    const masteryIndex = sortedPerformances.findIndex((p) => p.score >= masteryThreshold);
    if (masteryIndex === -1) return 0;

    const firstAttempt = sortedPerformances[0].timestamp;
    const masteryTime = sortedPerformances[masteryIndex].timestamp;

    return masteryTime - firstAttempt;
  };

  const findDominantLearningStyle = (patterns: Record<string, LearningPattern>): string | null => {
    const styleCounts: Record<string, number> = {};

    Object.values(patterns).forEach((pattern) => {
      styleCounts[pattern.preferredLearningStyle] =
        (styleCounts[pattern.preferredLearningStyle] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(styleCounts));
    const dominantStyle = Object.entries(styleCounts).find(([_, count]) => count === maxCount)?.[0];

    return dominantStyle || null;
  };

  const suggestReview = useCallback(
    (assessment: any): boolean => {
      if (!config.enabled) return false;

      const overallScore = assessment.overallLevel || 0;
      return overallScore < config.reviewThreshold;
    },
    [config.enabled, config.reviewThreshold],
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (config.enabled && adaptiveData.performanceHistory.length > 0) {
      generateRecommendations();
    }
  }, [config.enabled, adaptiveData.performanceHistory, generateRecommendations]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    adaptiveData,
    updatePerformanceData,
    getPerformanceStats,
    adjustDifficulty,
    getOptimalDifficulty,
    analyzeLearningPatterns,
    generateRecommendations,
    suggestReview,
    isAnalyzing,
  };
};
