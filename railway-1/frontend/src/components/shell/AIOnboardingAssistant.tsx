'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  actionLabel: string;
  isCompleted: boolean;
  isRequired: boolean;
  category: 'essential' | 'productivity' | 'personalization' | 'advanced';
}

interface OnboardingSession {
  id: string;
  userId: string;
  tenantId: string;
  startedAt: Date;
  completedSteps: string[];
  currentStep: string;
  isCompleted: boolean;
  preferences: {
    role: string;
    experience: 'beginner' | 'intermediate' | 'expert';
    interests: string[];
  };
}

interface AIOnboardingAssistantProps {
  isVisible: boolean;
  onClose: () => void;
  onStepComplete: (stepId: string) => void;
  onComplete: () => void;
}

// ==================== CONSTANTS ====================
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI-BOS',
    description: 'Your revolutionary OS is ready to transform how you work. Let me show you around!',
    icon: '🚀',
    action: 'explore',
    actionLabel: 'Start Exploring',
    isCompleted: false,
    isRequired: true,
    category: 'essential'
  },
  {
    id: 'desktop-tour',
    title: 'Your Desktop',
    description: 'This is your workspace. You can add apps, organize folders, and customize everything.',
    icon: '🖥️',
    action: 'tour-desktop',
    actionLabel: 'Take Tour',
    isCompleted: false,
    isRequired: true,
    category: 'essential'
  },
  {
    id: 'app-store',
    title: 'App Store',
    description: 'Discover powerful apps that work together seamlessly. No more switching between tools.',
    icon: '📱',
    action: 'browse-apps',
    actionLabel: 'Browse Apps',
    isCompleted: false,
    isRequired: true,
    category: 'essential'
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Meet your AI companion. It learns your workflow and suggests ways to work smarter.',
    icon: '🤖',
    action: 'activate-ai',
    actionLabel: 'Activate AI',
    isCompleted: false,
    isRequired: false,
    category: 'productivity'
  },
  {
    id: 'personalization',
    title: 'Make It Yours',
    description: 'Choose your theme, organize your workspace, and set up your preferences.',
    icon: '🎨',
    action: 'customize',
    actionLabel: 'Customize',
    isCompleted: false,
    isRequired: false,
    category: 'personalization'
  },
  {
    id: 'collaboration',
    title: 'Team Up',
    description: 'Invite team members and collaborate in real-time. Everyone stays in sync.',
    icon: '👥',
    action: 'invite-team',
    actionLabel: 'Invite Team',
    isCompleted: false,
    isRequired: false,
    category: 'advanced'
  },
  {
    id: 'analytics',
    title: 'Insights & Analytics',
    description: 'Get powerful insights into your workflow and productivity patterns.',
    icon: '📊',
    action: 'view-analytics',
    actionLabel: 'View Analytics',
    isCompleted: false,
    isRequired: false,
    category: 'advanced'
  }
];

// ==================== COMPONENTS ====================
interface OnboardingStepCardProps {
  step: OnboardingStep;
  isActive: boolean;
  onAction: (stepId: string, action: string) => void;
}

const OnboardingStepCard: React.FC<OnboardingStepCardProps> = ({
  step,
  isActive,
  onAction
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'productivity': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'personalization': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${
        isActive
          ? 'border-blue-500 shadow-lg'
          : step.isCompleted
            ? 'border-green-500 shadow-md'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <motion.div
            className={`text-3xl ${step.isCompleted ? 'opacity-100' : 'opacity-80'}`}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {step.isCompleted ? '✅' : step.icon}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              {step.isRequired && (
                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">
                  Required
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(step.category)}`}>
                {step.category}
              </span>

              {!step.isCompleted && (
                <motion.button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  onClick={() => onAction(step.id, step.action)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step.actionLabel}
                </motion.button>
              )}

              {step.isCompleted && (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-xl"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const AIOnboardingAssistant: React.FC<AIOnboardingAssistantProps> = ({
  isVisible,
  onClose,
  onStepComplete,
  onComplete
}) => {
  const { trackEvent } = useSystemCore();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Initialize onboarding session
  useEffect(() => {
    if (isVisible && !session) {
      const newSession: OnboardingSession = {
        id: `onboarding-${Date.now()}`,
        userId: 'current-user',
        tenantId: 'current-tenant',
        startedAt: new Date(),
        completedSteps: [],
        currentStep: ONBOARDING_STEPS[0].id,
        isCompleted: false,
        preferences: {
          role: 'user',
          experience: 'beginner',
          interests: []
        }
      };
      setSession(newSession);
      trackEvent('onboarding_started', { sessionId: newSession.id });
    }
  }, [isVisible, session, trackEvent]);

  const handleStepAction = useCallback(async (stepId: string, action: string) => {
    setIsLoading(true);

    // Simulate action completion
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark step as completed
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
        currentStep: ONBOARDING_STEPS[currentStepIndex + 1]?.id || ''
      };
    });

    onStepComplete(stepId);
    trackEvent('onboarding_step_completed', { stepId, action });

    // Move to next step
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Onboarding complete
      setSession(prev => prev ? { ...prev, isCompleted: true } : prev);
      onComplete();
    }

    setIsLoading(false);
  }, [currentStepIndex, onStepComplete, onComplete, trackEvent]);

  const handleSkip = useCallback(() => {
    trackEvent('onboarding_skipped', {
      sessionId: session?.id,
      completedSteps: session?.completedSteps.length
    });
    onClose();
  }, [session, trackEvent, onClose]);

  const handleComplete = useCallback(() => {
    trackEvent('onboarding_completed', {
      sessionId: session?.id,
      totalSteps: ONBOARDING_STEPS.length,
      completedSteps: session?.completedSteps.length
    });
    onComplete();
  }, [session, trackEvent, onComplete]);

  const getProgressPercentage = () => {
    if (!session) return 0;
    return (session.completedSteps.length / ONBOARDING_STEPS.length) * 100;
  };

  const getCurrentStep = () => ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Welcome to AI-BOS</h1>
                <p className="text-blue-100">Let me show you around your new revolutionary OS</p>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">Setting things up...</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your AI assistant is preparing everything for you
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Step */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {isLastStep ? 'Final Step' : `Step ${currentStepIndex + 1} of ${ONBOARDING_STEPS.length}`}
                  </h2>
                  <OnboardingStepCard
                    step={getCurrentStep()}
                    isActive={true}
                    onAction={handleStepAction}
                  />
                </div>

                {/* Upcoming Steps */}
                {!isLastStep && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Coming up next:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ONBOARDING_STEPS.slice(currentStepIndex + 1, currentStepIndex + 3).map((step) => (
                        <OnboardingStepCard
                          key={step.id}
                          step={step}
                          isActive={false}
                          onAction={handleStepAction}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {session?.completedSteps.length} of {ONBOARDING_STEPS.length} steps completed
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Skip Tour
                </button>

                {isLastStep && (
                  <motion.button
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    onClick={handleComplete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Complete Setup
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
