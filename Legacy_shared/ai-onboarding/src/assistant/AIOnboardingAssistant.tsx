/**
 * AI-BOS AI Onboarding Assistant
 *
 * Intelligent onboarding system that creates personalized learning paths,
 * assesses skill levels, and provides step-by-step guidance for micro-developers.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

// AI-BOS Shared Library Integration
import type { EventBus } from '@aibos/shared/lib';
import { logger, monitoring } from '@aibos/shared/lib';
import type { AIEngine } from '@aibos/shared/ai';

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
} from '../types';

// Components
import { SkillAssessmentQuiz } from '../assessment/SkillAssessmentQuiz';
import { TutorialPlayer } from '../tutorials/TutorialPlayer';
import { LearningPathVisualization } from '../learning-paths/LearningPathVisualization';
import { ProgressDashboard } from '../progress/ProgressDashboard';

// ============================================================================
// AI ONBOARDING ASSISTANT COMPONENT
// ============================================================================

export interface AIOnboardingAssistantProps {
  /** User profile for personalization */
  userProfile?: UserProfile;
  /** AI Engine for intelligent recommendations */
  aiEngine?: AIEngine;
  /** Event bus for tracking */
  eventBus?: EventBus;
  /** Initial learning goal */
  initialGoal?: LearningGoal;
  /** Event handlers */
  onSkillAssessed?: (assessment: SkillAssessment) => void;
  onTutorialCompleted?: (tutorialId: string, progress: LearningProgress) => void;
  onLearningPathCompleted?: (pathId: string) => void;
  onGoalAchieved?: (goalId: string) => void;
}

/**
 * AI-Powered Onboarding Assistant
 * Provides personalized learning experience for micro-developers
 */
export const AIOnboardingAssistant: React.FC<AIOnboardingAssistantProps> = ({
  userProfile,
  aiEngine,
  eventBus,
  initialGoal,
  onSkillAssessed,
  onTutorialCompleted,
  onLearningPathCompleted,
  onGoalAchieved,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
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
  const [sessionData, setSessionData] = useState<OnboardingSession>({
    id: `session-${Date.now()}`,
    userId: userProfile?.id || 'anonymous',
    startTime: Date.now(),
    currentStep: 'welcome',
    interactions: [],
    preferences: {},
  });

  // ============================================================================
  // LEARNING GOALS CONFIGURATION
  // ============================================================================

  const availableGoals: LearningGoal[] = useMemo(
    () => [
      {
        id: 'build-first-app',
        title: 'Build My First App',
        description: 'Create a complete working application from scratch',
        difficulty: 'beginner',
        estimatedHours: 8,
        skills: ['visual-design', 'basic-logic', 'deployment'],
        icon: 'rocket',
        category: 'practical',
      },
      {
        id: 'master-visual-builder',
        title: 'Master Visual Builder',
        description: 'Become proficient with drag-and-drop app creation',
        difficulty: 'beginner',
        estimatedHours: 6,
        skills: ['visual-design', 'component-composition', 'responsive-design'],
        icon: 'palette',
        category: 'tools',
      },
      {
        id: 'understand-data',
        title: 'Understand Data Management',
        description: 'Learn how to store, retrieve, and manage app data',
        difficulty: 'intermediate',
        estimatedHours: 12,
        skills: ['database-basics', 'api-integration', 'data-validation'],
        icon: 'database',
        category: 'backend',
      },
      {
        id: 'advanced-features',
        title: 'Add Advanced Features',
        description: 'Implement complex functionality and integrations',
        difficulty: 'advanced',
        estimatedHours: 20,
        skills: ['api-development', 'authentication', 'real-time-features'],
        icon: 'zap',
        category: 'advanced',
      },
      {
        id: 'business-apps',
        title: 'Create Business Apps',
        description: 'Build professional applications for business use',
        difficulty: 'intermediate',
        estimatedHours: 16,
        skills: ['business-logic', 'user-management', 'reporting'],
        icon: 'briefcase',
        category: 'business',
      },
    ],
    [],
  );

  // ============================================================================
  // AI-POWERED PERSONALIZATION
  // ============================================================================

  /**
   * Generate personalized learning path based on assessment and goals
   */
  const generatePersonalizedPath = useCallback(async () => {
    if (!skillAssessment || selectedGoals.length === 0) return;

    setIsGeneratingPath(true);

    try {
      // Use AI to analyze user profile and create optimal learning path
      const pathRequest = {
        userProfile,
        skillAssessment,
        selectedGoals,
        preferences: sessionData.preferences,
        timeConstraints: userProfile?.availableHours || 10,
      };

      logger.info('Generating personalized learning path', pathRequest);

      // Simulate AI path generation (in real implementation, this would call AI service)
      const generatedPath: LearningPath = {
        id: `path-${Date.now()}`,
        title: `Your Personalized Journey: ${selectedGoals.map((g) => g.title).join(' + ')}`,
        description: 'AI-curated learning path based on your skills and goals',
        totalEstimatedHours: selectedGoals.reduce((sum, goal) => sum + goal.estimatedHours, 0),
        difficulty: getMostCommonDifficulty(selectedGoals),
        modules: await generateLearningModules(skillAssessment, selectedGoals),
        skills: Array.from(new Set(selectedGoals.flatMap((g) => g.skills))),
        prerequisites: [],
        isPersonalized: true,
        adaptivityLevel: 'high',
        createdAt: Date.now(),
      };

      setPersonalizedPath(generatedPath);

      // Generate initial recommendations
      const initialRecommendations = await generateRecommendations(generatedPath, skillAssessment);
      setRecommendations(initialRecommendations);

      // Track event
      eventBus?.emit('onboarding:path-generated', {
        pathId: generatedPath.id,
        goals: selectedGoals.map((g) => g.id),
        estimatedHours: generatedPath.totalEstimatedHours,
        timestamp: Date.now(),
      });

      logger.info('Personalized learning path generated', {
        pathId: generatedPath.id,
        modules: generatedPath.modules.length,
      });
    } catch (error) {
      logger.error('Failed to generate learning path', { error });
    } finally {
      setIsGeneratingPath(false);
    }
  }, [skillAssessment, selectedGoals, userProfile, sessionData.preferences, eventBus]);

  /**
   * Get most common difficulty level from selected goals
   */
  const getMostCommonDifficulty = (goals: LearningGoal[]): SkillLevel => {
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
  };

  /**
   * Generate learning modules based on assessment and goals
   */
  const generateLearningModules = useCallback(
    async (assessment: SkillAssessment, goals: LearningGoal[]) => {
      // This would be powered by AI in real implementation
      const modules = [
        {
          id: 'module-1',
          title: 'Getting Started with Visual Development',
          description: 'Learn the basics of drag-and-drop app building',
          estimatedHours: 2,
          tutorials: ['intro-to-visual-builder', 'first-component', 'basic-layout'],
          isRequired: true,
          order: 1,
        },
        {
          id: 'module-2',
          title: 'Building Your First Component',
          description: 'Create interactive components with properties and events',
          estimatedHours: 3,
          tutorials: ['component-properties', 'event-handling', 'component-preview'],
          isRequired: true,
          order: 2,
        },
        {
          id: 'module-3',
          title: 'Data and Logic',
          description: 'Add data management and business logic to your apps',
          estimatedHours: 4,
          tutorials: ['data-binding', 'form-validation', 'api-integration'],
          isRequired: selectedGoals.some((g) => g.skills.includes('database-basics')),
          order: 3,
        },
      ];

      return modules;
    },
    [],
  );

  /**
   * Generate AI-powered recommendations
   */
  const generateRecommendations = useCallback(
    async (path: LearningPath, assessment: SkillAssessment) => {
      // AI would analyze user behavior and suggest personalized recommendations
      const recommendations: PersonalizedRecommendation[] = [
        {
          id: 'rec-1',
          type: 'tutorial',
          title: 'Quick Start: 5-Minute App',
          description: 'Build a simple app in just 5 minutes to get familiar with the interface',
          confidence: 0.95,
          priority: 'high',
          estimatedTime: 5,
          reason: 'Perfect for getting hands-on experience quickly',
          category: 'quick-win',
        },
        {
          id: 'rec-2',
          type: 'practice',
          title: 'Practice: Component Gallery',
          description: 'Explore all available components by building a showcase',
          confidence: 0.87,
          priority: 'medium',
          estimatedTime: 15,
          reason: 'Helps you understand what components are available',
          category: 'exploration',
        },
      ];

      return recommendations;
    },
    [],
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle skill assessment completion
   */
  const handleAssessmentComplete = useCallback(
    (assessment: SkillAssessment) => {
      setSkillAssessment(assessment);
      setCurrentStep('goals');

      // Update session data
      setSessionData((prev) => ({
        ...prev,
        currentStep: 'goals',
        interactions: [
          ...prev.interactions,
          {
            type: 'assessment_completed',
            timestamp: Date.now(),
            data: { skillLevel: assessment.overallLevel },
          },
        ],
      }));

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
    },
    [onSkillAssessed, userProfile?.id, eventBus],
  );

  /**
   * Handle goal selection
   */
  const handleGoalSelection = useCallback((goal: LearningGoal, selected: boolean) => {
    if (selected) {
      setSelectedGoals((prev) => [...prev, goal]);
    } else {
      setSelectedGoals((prev) => prev.filter((g) => g.id !== goal.id));
    }

    // Track interaction
    setSessionData((prev) => ({
      ...prev,
      interactions: [
        ...prev.interactions,
        {
          type: 'goal_selected',
          timestamp: Date.now(),
          data: { goalId: goal.id, selected },
        },
      ],
    }));
  }, []);

  /**
   * Handle tutorial completion
   */
  const handleTutorialComplete = useCallback(
    (tutorialId: string) => {
      setLearningProgress((prev) => ({
        ...prev,
        completedTutorials: [...prev.completedTutorials, tutorialId],
        lastActivity: Date.now(),
      }));

      onTutorialCompleted?.(tutorialId, learningProgress);

      logger.info('Tutorial completed', { tutorialId });

      // Track event
      eventBus?.emit('onboarding:tutorial-completed', {
        userId: userProfile?.id || 'anonymous',
        tutorialId,
        timestamp: Date.now(),
      });
    },
    [learningProgress, onTutorialCompleted, userProfile?.id, eventBus],
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Track session duration
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionData((prev) => ({
        ...prev,
        interactions: [
          ...prev.interactions,
          {
            type: 'heartbeat',
            timestamp: Date.now(),
            data: { step: currentStep },
          },
        ],
      }));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [currentStep]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get icon component for goal
   */
  const getGoalIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      rocket: Rocket,
      palette: Palette,
      database: Database,
      zap: Zap,
      briefcase: Target,
    };

    const IconComponent = icons[iconName] || Target;
    return <IconComponent className="w-6 h-6" />;
  };

  /**
   * Render welcome step
   */
  const renderWelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Brain className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI-BOS!</h1>

      <p className="text-gray-600 mb-8 leading-relaxed">
        I'm your AI assistant, here to help you learn app development step by step. Let's create a
        personalized learning path just for you!
      </p>

      {userProfile ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Welcome back, <strong>{userProfile.name}</strong>! Ready to continue your journey?
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">No account needed - let's get started right away!</p>
        </div>
      )}

      <button
        onClick={() => setCurrentStep('assessment')}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <span>Start Your Journey</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Takes about 5 minutes to set up your personalized path
      </p>
    </motion.div>
  );

  /**
   * Render goals selection step
   */
  const renderGoalsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What would you like to achieve?</h2>
        <p className="text-gray-600">
          Select your learning goals. I'll create a personalized path to help you reach them.
        </p>
      </div>

      <div className="grid gap-4 mb-8">
        {availableGoals.map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGoalSelection(goal, !selectedGoals.some((g) => g.id === goal.id))}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedGoals.some((g) => g.id === goal.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
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
                      {goal.difficulty}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {goal.estimatedHours}h
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{goal.description}</p>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Skills:</span>
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
                      <span className="text-xs text-gray-500">+{goal.skills.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedGoals.some((g) => g.id === goal.id) && (
                <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('assessment')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Back
        </button>

        <button
          onClick={() => {
            generatePersonalizedPath();
            setCurrentStep('path');
          }}
          disabled={selectedGoals.length === 0}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>Create My Learning Path</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
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
                >
                  {['welcome', 'assessment', 'goals', 'path'].indexOf(currentStep) > index ? (
                    <CheckCircle className="w-4 h-4" />
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
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && renderWelcomeStep()}

          {currentStep === 'assessment' && (
            <SkillAssessmentQuiz onComplete={handleAssessmentComplete} userProfile={userProfile} />
          )}

          {currentStep === 'goals' && renderGoalsStep()}

          {currentStep === 'path' && personalizedPath && (
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
            />
          )}

          {currentStep === 'tutorial' && currentTutorial && (
            <TutorialPlayer
              tutorial={currentTutorial}
              onComplete={() => handleTutorialComplete(currentTutorial.id)}
              onExit={() => setCurrentStep('path')}
              progress={learningProgress}
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
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
