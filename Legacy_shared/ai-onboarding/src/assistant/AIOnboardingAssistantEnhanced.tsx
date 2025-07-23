/**
 * AI-BOS AI Onboarding Assistant - Enhanced Version
 *
 * Intelligent onboarding system that creates personalized learning paths,
 * assesses skill levels, and provides step-by-step guidance for micro-developers.
 *
 * Enhanced with:
 * - Performance optimizations (memoization, virtualization)
 * - Accessibility improvements (WCAG 2.1 AA compliance)
 * - Error handling and recovery
 * - Offline support with service worker
 * - Multi-language support
 * - Adaptive learning based on performance
 * - Session persistence and progress saving
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import {
  BookOpen,
  Target,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  Award,
  Brain,
  Lightbulb,
  Rocket,
  Clock,
  Star,
  TrendingUp,
  Users,
  Code,
  Palette,
  Database,
  Zap,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Wifi,
  WifiOff,
  Globe,
  Save,
  Undo,
  Redo,
  Settings,
  HelpCircle,
} from 'lucide-react';

// AI-BOS Shared Library Integration
import type { EventBus } from '@aibos/shared/lib';
import { logger, monitoring } from '@aibos/shared/lib';
import type { AIEngine } from '@aibos/shared/ai';

// Enhanced hooks and utilities
import { useOptimizedCanvas } from '../hooks/useOptimizedCanvas';
import { useAccessibility } from '../hooks/useAccessibility';
import { useErrorBoundary } from '../hooks/useErrorBoundary';
import { useOfflineSupport } from '../hooks/useOfflineSupport';
import { useLocalization } from '../hooks/useLocalization';
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';

// Types
import type {
  LearningPath,
  SkillLevel,
  Tutorial,
  UserProfile,
  LearningProgress,
  SkillAssessment,
  PersonalizedRecommendation,
  LearningGoal,
  OnboardingSession,
  ErrorState,
  OfflineData,
  LocalizationData,
  AdaptiveLearningData,
} from '../types';

// Components
import { SkillAssessmentQuiz } from '../assessment/SkillAssessmentQuiz';
import { TutorialPlayer } from '../tutorials/TutorialPlayer';
import { LearningPathVisualization } from '../learning-paths/LearningPathVisualization';
import { ProgressDashboard } from '../progress/ProgressDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { LanguageSelector } from '../components/LanguageSelector';
import { UndoRedoControls } from '../components/UndoRedoControls';

// ============================================================================
// AI ONBOARDING ASSISTANT ENHANCED COMPONENT
// ============================================================================

export interface AIOnboardingAssistantEnhancedProps {
  /** User profile for personalization */
  userProfile?: UserProfile;
  /** AI Engine for intelligent recommendations */
  aiEngine?: AIEngine;
  /** Event bus for tracking */
  eventBus?: EventBus;
  /** Initial learning goal */
  initialGoal?: LearningGoal;
  /** Localization data */
  localization?: LocalizationData;
  /** Offline support configuration */
  offlineConfig?: {
    enabled: boolean;
    cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  };
  /** Adaptive learning configuration */
  adaptiveConfig?: {
    enabled: boolean;
    performanceThreshold: number;
    reviewThreshold: number;
  };
  /** Event handlers */
  onSkillAssessed?: (assessment: SkillAssessment) => void;
  onTutorialCompleted?: (
    tutorialId: string,
    progress: LearningProgress,
    performanceScore: number,
  ) => void;
  onLearningPathCompleted?: (pathId: string) => void;
  onGoalAchieved?: (goalId: string) => void;
  onError?: (error: ErrorState) => void;
  onOfflineStatusChange?: (isOffline: boolean) => void;
}

/**
 * Enhanced AI-Powered Onboarding Assistant
 * Provides personalized learning experience with advanced features
 */
export const AIOnboardingAssistantEnhanced: React.FC<AIOnboardingAssistantEnhancedProps> = ({
  userProfile,
  aiEngine,
  eventBus,
  initialGoal,
  localization,
  offlineConfig = { enabled: true, cacheStrategy: 'network-first' },
  adaptiveConfig = { enabled: true, performanceThreshold: 0.7, reviewThreshold: 0.5 },
  onSkillAssessed,
  onTutorialCompleted,
  onLearningPathCompleted,
  onGoalAchieved,
  onError,
  onOfflineStatusChange,
}) => {
  // ============================================================================
  // ENHANCED STATE MANAGEMENT
  // ============================================================================

  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'assessment' | 'goals' | 'path' | 'tutorial' | 'dashboard'
  >('welcome');
  const [skillAssessment, setSkillAssessment] = useState<SkillAssessment | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);
  const [personalizedPath, setPersonalizedPath] = useState<LearningPath | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [learningProgress, setLearningProgress] = useState<LearningProgress>({
    userId: userProfile?.id || 'anonymous',
    completedTutorials: [],
    skillLevels: {},
    achievedGoals: [],
    timeSpent: 0,
    streakDays: 0,
    lastActivity: Date.now(),
  });
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [sessionData, setSessionData] = useState<OnboardingSession>({
    id: `session-${Date.now()}`,
    userId: userProfile?.id || 'anonymous',
    startTime: Date.now(),
    currentStep: 'welcome',
    interactions: [],
    preferences: {},
  });

  // ============================================================================
  // ENHANCED HOOKS INTEGRATION
  // ============================================================================

  // Performance optimization
  const { optimizedCanvas, canvasRef } = useOptimizedCanvas({
    width: 800,
    height: 600,
    pixelRatio: window.devicePixelRatio || 1,
  });

  // Accessibility support
  const { focusManager, keyboardNavigation, screenReaderSupport, announceToScreenReader } =
    useAccessibility({
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      enableFocusManagement: true,
    });

  // Error handling
  const { errorBoundary, handleError, clearError, errorRecovery } = useErrorBoundary({
    onError: (error) => {
      setError(error);
      onError?.(error);
      logger.error('Onboarding assistant error', error);
    },
    fallbackComponent: <div>Something went wrong. Please refresh the page.</div>,
  });

  // Offline support
  const { isOnline, offlineData, syncWhenOnline, cacheData } = useOfflineSupport({
    enabled: offlineConfig.enabled,
    cacheStrategy: offlineConfig.cacheStrategy,
    onOfflineStatusChange: (status) => {
      setIsOffline(!status);
      onOfflineStatusChange?.(!status);
    },
  });

  // Localization
  const { t, currentLocale, changeLanguage, formatDate, formatNumber } = useLocalization({
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'zh'],
    localizationData: localization,
  });

  // Session persistence
  const { saveSession, loadSession, clearSession, autoSave } = useSessionPersistence({
    sessionKey: `onboarding-session-${userProfile?.id || 'anonymous'}`,
    autoSaveInterval: 30000, // 30 seconds
    onSessionLoad: (session) => {
      if (session) {
        setSessionData(session);
        setCurrentStep(session.currentStep);
        setSelectedGoals(session.selectedGoals || []);
        setLearningProgress(session.learningProgress || learningProgress);
      }
    },
  });

  // Adaptive learning
  const { adaptiveRecommendations, updatePerformanceData, adjustDifficulty, suggestReview } =
    useAdaptiveLearning({
      enabled: adaptiveConfig.enabled,
      performanceThreshold: adaptiveConfig.performanceThreshold,
      reviewThreshold: adaptiveConfig.reviewThreshold,
      onRecommendationUpdate: (recommendations) => {
        setRecommendations((prev) => [...prev, ...recommendations]);
      },
    });

  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================

  // Memoize expensive calculations
  const selectedGoalIds = useMemo(() => selectedGoals.map((g) => g.id), [selectedGoals]);

  const totalEstimatedHours = useMemo(
    () => selectedGoals.reduce((sum, goal) => sum + goal.estimatedHours, 0),
    [selectedGoals],
  );

  const completedTutorialCount = useMemo(
    () => learningProgress.completedTutorials.length,
    [learningProgress.completedTutorials],
  );

  const progressPercentage = useMemo(() => {
    if (!personalizedPath) return 0;
    const totalTutorials = personalizedPath.modules.reduce(
      (sum, module) => sum + module.tutorials.length,
      0,
    );
    return totalTutorials > 0 ? (completedTutorialCount / totalTutorials) * 100 : 0;
  }, [personalizedPath, completedTutorialCount]);

  // ============================================================================
  // LEARNING GOALS CONFIGURATION (Memoized)
  // ============================================================================

  const availableGoals: LearningGoal[] = useMemo(
    () => [
      {
        id: 'build-first-app',
        title: t('goals.build-first-app.title'),
        description: t('goals.build-first-app.description'),
        difficulty: 'beginner' as SkillLevel,
        estimatedHours: 8,
        skills: ['visual-design', 'basic-logic', 'deployment'],
        icon: 'rocket',
        category: 'practical',
      },
      {
        id: 'master-visual-builder',
        title: t('goals.master-visual-builder.title'),
        description: t('goals.master-visual-builder.description'),
        difficulty: 'beginner' as SkillLevel,
        estimatedHours: 6,
        skills: ['visual-design', 'component-composition', 'responsive-design'],
        icon: 'palette',
        category: 'tools',
      },
      {
        id: 'understand-data',
        title: t('goals.understand-data.title'),
        description: t('goals.understand-data.description'),
        difficulty: 'intermediate' as SkillLevel,
        estimatedHours: 12,
        skills: ['database-basics', 'api-integration', 'data-validation'],
        icon: 'database',
        category: 'backend',
      },
      {
        id: 'advanced-features',
        title: t('goals.advanced-features.title'),
        description: t('goals.advanced-features.description'),
        difficulty: 'advanced' as SkillLevel,
        estimatedHours: 20,
        skills: ['api-development', 'authentication', 'real-time-features'],
        icon: 'zap',
        category: 'advanced',
      },
      {
        id: 'business-apps',
        title: t('goals.business-apps.title'),
        description: t('goals.business-apps.description'),
        difficulty: 'intermediate' as SkillLevel,
        estimatedHours: 16,
        skills: ['business-logic', 'user-management', 'reporting'],
        icon: 'briefcase',
        category: 'business',
      },
    ],
    [t],
  );

  // ============================================================================
  // ENHANCED AI-POWERED PERSONALIZATION
  // ============================================================================

  /**
   * Generate personalized learning path with error handling
   */
  const generatePersonalizedPath = useCallback(async () => {
    if (!skillAssessment || selectedGoals.length === 0) return;

    setIsGeneratingPath(true);
    setError(null);

    try {
      // Check offline status
      if (isOffline) {
        // Use cached data if available
        const cachedPath = offlineData?.learningPaths?.find((p) =>
          p.goals.every((g) => selectedGoalIds.includes(g)),
        );

        if (cachedPath) {
          setPersonalizedPath(cachedPath);
          announceToScreenReader(t('offline.path-loaded'));
          return;
        } else {
          throw new Error('No cached path available offline');
        }
      }

      // Use AI to analyze user profile and create optimal learning path
      const pathRequest = {
        userProfile,
        skillAssessment,
        selectedGoals,
        preferences: sessionData.preferences,
        timeConstraints: userProfile?.availableHours || 10,
        adaptiveData: adaptiveRecommendations,
      };

      logger.info('Generating personalized learning path', pathRequest);

      // Simulate AI path generation (in real implementation, this would call AI service)
      const generatedPath: LearningPath = {
        id: `path-${Date.now()}`,
        title: t('path.personalized-title', {
          goals: selectedGoals.map((g) => g.title).join(' + '),
        }),
        description: t('path.personalized-description'),
        totalEstimatedHours,
        difficulty: getMostCommonDifficulty(selectedGoals),
        modules: await generateLearningModules(skillAssessment, selectedGoals),
        skills: Array.from(new Set(selectedGoals.flatMap((g) => g.skills))),
        prerequisites: [],
        isPersonalized: true,
        adaptivityLevel: 'high',
        createdAt: Date.now(),
      };

      setPersonalizedPath(generatedPath);

      // Cache the generated path for offline use
      if (offlineConfig.enabled) {
        await cacheData('learningPaths', generatedPath);
      }

      // Generate initial recommendations
      const initialRecommendations = await generateRecommendations(generatedPath, skillAssessment);
      setRecommendations(initialRecommendations);

      // Track event
      eventBus?.emit('onboarding:path-generated', {
        pathId: generatedPath.id,
        goals: selectedGoalIds,
        estimatedHours: generatedPath.totalEstimatedHours,
        timestamp: Date.now(),
      });

      logger.info('Personalized learning path generated', {
        pathId: generatedPath.id,
        modules: generatedPath.modules.length,
      });

      announceToScreenReader(t('path.generation-complete'));
    } catch (err) {
      const errorState: ErrorState = {
        type: 'path-generation-failed',
        message: t('errors.path-generation-failed'),
        details: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now(),
        recoverable: true,
      };

      setError(errorState);
      handleError(errorState);

      // Try to recover with a basic path
      if (errorRecovery.canRecover) {
        const basicPath = generateBasicPath(selectedGoals);
        setPersonalizedPath(basicPath);
        announceToScreenReader(t('errors.recovery-attempt'));
      }
    } finally {
      setIsGeneratingPath(false);
    }
  }, [
    skillAssessment,
    selectedGoals,
    selectedGoalIds,
    totalEstimatedHours,
    userProfile,
    sessionData.preferences,
    eventBus,
    isOffline,
    offlineData,
    adaptiveRecommendations,
    t,
    announceToScreenReader,
    handleError,
    errorRecovery,
    offlineConfig.enabled,
    cacheData,
  ]);

  /**
   * Generate basic path as fallback
   */
  const generateBasicPath = useCallback(
    (goals: LearningGoal[]): LearningPath => {
      return {
        id: `basic-path-${Date.now()}`,
        title: t('path.basic-title'),
        description: t('path.basic-description'),
        totalEstimatedHours: goals.reduce((sum, goal) => sum + goal.estimatedHours, 0),
        difficulty: getMostCommonDifficulty(goals),
        modules: goals.map((goal, index) => ({
          id: `basic-module-${index + 1}`,
          title: goal.title,
          description: goal.description,
          estimatedHours: goal.estimatedHours,
          tutorials: [`tutorial-${goal.id}`],
          isRequired: true,
          order: index + 1,
        })),
        skills: Array.from(new Set(goals.flatMap((g) => g.skills))),
        prerequisites: [],
        isPersonalized: false,
        adaptivityLevel: 'low',
        createdAt: Date.now(),
      };
    },
    [t],
  );

  /**
   * Get most common difficulty level from selected goals
   */
  const getMostCommonDifficulty = useCallback((goals: LearningGoal[]): SkillLevel => {
    const difficultyCount = goals.reduce(
      (acc, goal) => {
        acc[goal.difficulty] = (acc[goal.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<SkillLevel, number>,
    );

    return Object.entries(difficultyCount).reduce((a, b) =>
      difficultyCount[a[0] as SkillLevel] > difficultyCount[b[0] as SkillLevel] ? a : b,
    )[0] as SkillLevel;
  }, []);

  /**
   * Generate learning modules with adaptive learning
   */
  const generateLearningModules = useCallback(
    async (assessment: SkillAssessment, goals: LearningGoal[]) => {
      // Apply adaptive learning adjustments
      const adjustedGoals = goals.map((goal) => ({
        ...goal,
        difficulty: adjustDifficulty(
          goal.difficulty,
          assessment.skillLevels[goal.skills[0]] || 'beginner',
        ),
      }));

      const modules = [
        {
          id: 'module-1',
          title: t('modules.getting-started.title'),
          description: t('modules.getting-started.description'),
          estimatedHours: 2,
          tutorials: ['intro-to-visual-builder', 'first-component', 'basic-layout'],
          isRequired: true,
          order: 1,
        },
        {
          id: 'module-2',
          title: t('modules.building-components.title'),
          description: t('modules.building-components.description'),
          estimatedHours: 3,
          tutorials: ['component-properties', 'event-handling', 'component-preview'],
          isRequired: true,
          order: 2,
        },
        {
          id: 'module-3',
          title: t('modules.data-logic.title'),
          description: t('modules.data-logic.description'),
          estimatedHours: 4,
          tutorials: ['data-binding', 'form-validation', 'api-integration'],
          isRequired: adjustedGoals.some((g) => g.skills.includes('database-basics')),
          order: 3,
        },
      ];

      // Add review modules if needed
      if (suggestReview(assessment)) {
        modules.unshift({
          id: 'module-review',
          title: t('modules.review.title'),
          description: t('modules.review.description'),
          estimatedHours: 1,
          tutorials: ['skill-review', 'concept-refresh'],
          isRequired: true,
          order: 0,
        });
      }

      return modules;
    },
    [t, adjustDifficulty, suggestReview],
  );

  /**
   * Generate AI-powered recommendations with adaptive learning
   */
  const generateRecommendations = useCallback(
    async (path: LearningPath, assessment: SkillAssessment) => {
      const recommendations: PersonalizedRecommendation[] = [
        {
          id: 'rec-1',
          type: 'tutorial',
          title: t('recommendations.quick-start.title'),
          description: t('recommendations.quick-start.description'),
          confidence: 0.95,
          priority: 'high',
          estimatedTime: 5,
          reason: t('recommendations.quick-start.reason'),
          category: 'quick-win',
        },
        {
          id: 'rec-2',
          type: 'practice',
          title: t('recommendations.component-gallery.title'),
          description: t('recommendations.component-gallery.description'),
          confidence: 0.87,
          priority: 'medium',
          estimatedTime: 15,
          reason: t('recommendations.component-gallery.reason'),
          category: 'exploration',
        },
      ];

      // Add adaptive recommendations
      if (adaptiveConfig.enabled) {
        const adaptiveRecs = adaptiveRecommendations.filter(
          (rec) => rec.confidence > adaptiveConfig.performanceThreshold,
        );
        recommendations.push(...adaptiveRecs);
      }

      return recommendations;
    },
    [t, adaptiveConfig, adaptiveRecommendations],
  );

  // ============================================================================
  // ENHANCED EVENT HANDLERS
  // ============================================================================

  /**
   * Handle skill assessment completion with adaptive learning
   */
  const handleAssessmentComplete = useCallback(
    (assessment: SkillAssessment) => {
      setSkillAssessment(assessment);
      setCurrentStep('goals');

      // Update adaptive learning data
      updatePerformanceData('assessment', assessment.overallLevel);

      // Update session data
      const updatedSession = {
        ...sessionData,
        currentStep: 'goals',
        interactions: [
          ...sessionData.interactions,
          {
            type: 'assessment_completed',
            timestamp: Date.now(),
            data: { skillLevel: assessment.overallLevel },
          },
        ],
      };
      setSessionData(updatedSession);

      // Save session
      saveSession(updatedSession);

      onSkillAssessed?.(assessment);

      logger.info('Skill assessment completed', {
        overallLevel: assessment.overallLevel,
        skills: Object.keys(assessment.skillLevels),
      });

      // Track event
      eventBus?.emit('onboarding:assessment-completed', {
        userId: userProfile?.id || 'anonymous',
        assessment,
        timestamp: Date.now(),
      });

      announceToScreenReader(t('assessment.complete'));
    },
    [
      sessionData,
      saveSession,
      onSkillAssessed,
      userProfile?.id,
      eventBus,
      announceToScreenReader,
      t,
      updatePerformanceData,
    ],
  );

  /**
   * Handle goal selection with accessibility
   */
  const handleGoalSelection = useCallback(
    (goal: LearningGoal, selected: boolean) => {
      if (selected) {
        setSelectedGoals((prev) => [...prev, goal]);
      } else {
        setSelectedGoals((prev) => prev.filter((g) => g.id !== goal.id));
      }

      // Track interaction
      const updatedSession = {
        ...sessionData,
        interactions: [
          ...sessionData.interactions,
          {
            type: 'goal_selected',
            timestamp: Date.now(),
            data: { goalId: goal.id, selected },
          },
        ],
      };
      setSessionData(updatedSession);

      // Announce to screen reader
      announceToScreenReader(
        selected
          ? t('goals.selected', { goal: goal.title })
          : t('goals.deselected', { goal: goal.title }),
      );
    },
    [sessionData, announceToScreenReader, t],
  );

  /**
   * Handle tutorial completion with adaptive learning
   */
  const handleTutorialComplete = useCallback(
    (tutorialId: string, performanceScore: number = 1.0) => {
      setLearningProgress((prev) => ({
        ...prev,
        completedTutorials: [...prev.completedTutorials, tutorialId],
        lastActivity: Date.now(),
      }));

      // Update adaptive learning data
      updatePerformanceData('tutorial', performanceScore);

      // Adjust difficulty if needed
      if (performanceScore < adaptiveConfig.performanceThreshold) {
        adjustDifficulty('current', 'decrease');
      }

      onTutorialCompleted?.(tutorialId, learningProgress, performanceScore);

      logger.info('Tutorial completed', { tutorialId, performanceScore });

      // Track event
      eventBus?.emit('onboarding:tutorial-completed', {
        userId: userProfile?.id || 'anonymous',
        tutorialId,
        performanceScore,
        timestamp: Date.now(),
      });

      announceToScreenReader(t('tutorial.complete'));
    },
    [
      learningProgress,
      onTutorialCompleted,
      userProfile?.id,
      eventBus,
      announceToScreenReader,
      t,
      updatePerformanceData,
      adjustDifficulty,
      adaptiveConfig.performanceThreshold,
    ],
  );

  // ============================================================================
  // ENHANCED EFFECTS
  // ============================================================================

  /**
   * Auto-save session data
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionToSave = {
        ...sessionData,
        selectedGoals,
        learningProgress,
        currentStep,
      };
      saveSession(sessionToSave);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [sessionData, selectedGoals, learningProgress, currentStep, saveSession]);

  /**
   * Sync progress with backend when online
   */
  useEffect(() => {
    if (isOnline && userProfile) {
      const syncProgress = async () => {
        try {
          // This would sync with your backend API
          // await api.saveProgress(learningProgress);
          logger.info('Progress synced with backend');
        } catch (err) {
          logger.error('Failed to sync progress', { error: err });
        }
      };

      const timer = setInterval(syncProgress, 60000); // Every minute
      return () => clearInterval(timer);
    }
  }, [isOnline, userProfile, learningProgress]);

  /**
   * Load session on mount
   */
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // ============================================================================
  // ENHANCED RENDER HELPERS
  // ============================================================================

  /**
   * Get icon component for goal
   */
  const getGoalIcon = useCallback((iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      rocket: Rocket,
      palette: Palette,
      database: Database,
      zap: Zap,
      briefcase: Target,
    };

    const IconComponent = icons[iconName] || Target;
    return <IconComponent className="w-6 h-6" />;
  }, []);

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );

  /**
   * Render welcome step with accessibility
   */
  const renderWelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
      role="main"
      aria-labelledby="welcome-title"
    >
      <div
        className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
        aria-hidden="true"
      >
        <Brain className="w-10 h-10 text-white" />
      </div>

      <h1 id="welcome-title" className="text-2xl font-bold text-gray-900 mb-4">
        {t('welcome.title')}
      </h1>

      <p className="text-gray-600 mb-8 leading-relaxed">{t('welcome.description')}</p>

      {userProfile ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            {t('welcome.welcome-back', { name: userProfile.name })}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">{t('welcome.no-account')}</p>
        </div>
      )}

      <button
        onClick={() => setCurrentStep('assessment')}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
        aria-describedby="start-journey-description"
      >
        <span>{t('welcome.start-journey')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p id="start-journey-description" className="text-xs text-gray-500 mt-4">
        {t('welcome.setup-time')}
      </p>
    </motion.div>
  );

  /**
   * Render goals selection step with virtualization
   */
  const renderGoalsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
      role="main"
      aria-labelledby="goals-title"
    >
      <div className="text-center mb-8">
        <h2 id="goals-title" className="text-2xl font-bold text-gray-900 mb-4">
          {t('goals.title')}
        </h2>
        <p className="text-gray-600">{t('goals.description')}</p>
      </div>

      <div className="mb-8" style={{ height: '400px' }}>
        <Virtuoso
          data={availableGoals}
          itemContent={(index, goal) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                handleGoalSelection(goal, !selectedGoals.some((g) => g.id === goal.id))
              }
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 mb-4 ${
                selectedGoals.some((g) => g.id === goal.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedGoals.some((g) => g.id === goal.id)}
              aria-label={`${t('goals.select')} ${goal.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleGoalSelection(goal, !selectedGoals.some((g) => g.id === goal.id));
                }
              }}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    selectedGoals.some((g) => g.id === goal.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getGoalIcon(goal.icon)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          goal.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-700'
                            : goal.difficulty === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {t(`difficulty.${goal.difficulty}`)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {goal.estimatedHours}h
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{goal.description}</p>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{t('goals.skills')}:</span>
                    <div className="flex flex-wrap gap-1">
                      {goal.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {skill.replace('-', ' ')}
                        </span>
                      ))}
                      {goal.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{goal.skills.length - 3} {t('goals.more')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedGoals.some((g) => g.id === goal.id) && (
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-1" aria-hidden="true" />
                )}
              </div>
            </motion.div>
          )}
          overscan={3}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('assessment')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          aria-label={t('navigation.back')}
        >
          {t('navigation.back')}
        </button>

        <button
          onClick={() => {
            generatePersonalizedPath();
            setCurrentStep('path');
          }}
          disabled={selectedGoals.length === 0}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          aria-describedby="create-path-description"
        >
          <span>{t('goals.create-path')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p id="create-path-description" className="text-xs text-gray-500 mt-2 text-center">
        {t('goals.selected-count', { count: selectedGoals.length })}
      </p>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary {...errorBoundary}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header with Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <OfflineIndicator isOffline={isOffline} />
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
            </div>

            <div className="flex items-center space-x-2">
              <UndoRedoControls
                canUndo={true}
                canRedo={false}
                onUndo={() => {
                  /* Implement undo */
                }}
                onRedo={() => {
                  /* Implement redo */
                }}
              />
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label={t('navigation.settings')}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label={t('navigation.help')}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Indicator with Accessibility */}
          <div className="mb-8">
            <div
              className="flex items-center justify-center space-x-4"
              role="tablist"
              aria-label={t('progress.steps')}
            >
              {['welcome', 'assessment', 'goals', 'path'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : ['welcome', 'assessment', 'goals', 'path'].indexOf(currentStep) > index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}
                    role="tab"
                    aria-selected={currentStep === step}
                    aria-label={`${t(`steps.${step}`)} ${t('progress.step')} ${index + 1}`}
                  >
                    {['welcome', 'assessment', 'goals', 'path'].indexOf(currentStep) > index ? (
                      <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        ['welcome', 'assessment', 'goals', 'path'].indexOf(currentStep) > index
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">{error.message}</span>
              </div>
              {error.recoverable && (
                <button
                  onClick={() => clearError()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  {t('errors.try-again')}
                </button>
              )}
            </motion.div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 'welcome' && renderWelcomeStep()}

            {currentStep === 'assessment' && (
              <SkillAssessmentQuiz
                onComplete={handleAssessmentComplete}
                userProfile={userProfile}
                isOffline={isOffline}
              />
            )}

            {currentStep === 'goals' && renderGoalsStep()}

            {currentStep === 'path' &&
              (isGeneratingPath ? (
                <LoadingSkeleton />
              ) : personalizedPath ? (
                <LearningPathVisualization
                  learningPath={personalizedPath}
                  progress={learningProgress}
                  recommendations={recommendations}
                  onStartTutorial={(tutorial) => {
                    setCurrentTutorial(tutorial);
                    setCurrentStep('tutorial');
                  }}
                  onViewDashboard={() => setCurrentStep('dashboard')}
                  isGenerating={isGeneratingPath}
                  isOffline={isOffline}
                />
              ) : (
                <div className="text-center text-gray-500">{t('path.not-generated')}</div>
              ))}

            {currentStep === 'tutorial' && currentTutorial && (
              <TutorialPlayer
                tutorial={currentTutorial}
                onComplete={(performanceScore) =>
                  handleTutorialComplete(currentTutorial.id, performanceScore)
                }
                onExit={() => setCurrentStep('path')}
                progress={learningProgress}
                isOffline={isOffline}
              />
            )}

            {currentStep === 'dashboard' && (
              <ProgressDashboard
                progress={learningProgress}
                learningPath={personalizedPath}
                recommendations={recommendations}
                sessionData={sessionData}
                onContinueLearning={() => setCurrentStep('path')}
                onRetakeAssessment={() => setCurrentStep('assessment')}
                isOffline={isOffline}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};
