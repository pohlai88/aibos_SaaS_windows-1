'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Lightbulb, TrendingUp, Target, Users, Clock, Star, Zap, Brain, Eye, Code, Play, Pause, RotateCcw, Settings, MessageCircle, BookOpen, Award, Rocket } from 'lucide-react';

// ==================== TYPES ====================
interface BuilderCoachModeProps {
  tenantId: string;
  userId: string;
  enableRealTimeCoaching?: boolean;
  enableAISuggestions?: boolean;
  enableLearningPath?: boolean;
  enablePerformanceTracking?: boolean;
  onSuggestion?: (suggestion: CoachSuggestion) => void;
  onLearningMilestone?: (milestone: LearningMilestone) => void;
  onPerformanceUpdate?: (performance: PerformanceUpdate) => void;
}

interface CoachSuggestion {
  id: string;
  timestamp: Date;
  type: 'tip' | 'best_practice' | 'optimization' | 'warning' | 'inspiration';
  title: string;
  description: string;
  category: 'ui' | 'performance' | 'security' | 'accessibility' | 'code_quality' | 'user_experience';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actionItems: string[];
  codeExample?: string;
  reasoning: string;
  confidence: number;
  autoApply: boolean;
  metadata: {
    context: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    timeToImplement: number; // minutes
    impact: 'low' | 'medium' | 'high' | 'revolutionary';
  };
}

interface LearningMilestone {
  id: string;
  timestamp: Date;
  type: 'skill_acquired' | 'best_practice_mastered' | 'optimization_learned' | 'pattern_recognized';
  title: string;
  description: string;
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  points: number;
  badge?: string;
  metadata: {
    timeSpent: number; // minutes
    attempts: number;
    successRate: number;
  };
}

interface PerformanceUpdate {
  id: string;
  timestamp: Date;
  metrics: {
    buildSpeed: number; // components per hour
    codeQuality: number; // 0-100 score
    userExperience: number; // 0-100 score
    performance: number; // 0-100 score
    accessibility: number; // 0-100 score
    overall: number; // 0-100 score
  };
  trends: {
    buildSpeed: 'improving' | 'stable' | 'declining';
    codeQuality: 'improving' | 'stable' | 'declining';
    userExperience: 'improving' | 'stable' | 'declining';
    performance: 'improving' | 'stable' | 'declining';
    accessibility: 'improving' | 'stable' | 'declining';
  };
  insights: string[];
  recommendations: string[];
}

interface CoachState {
  isActive: boolean;
  isPaused: boolean;
  suggestions: CoachSuggestion[];
  milestones: LearningMilestone[];
  performance: PerformanceUpdate[];
  metrics: {
    totalSuggestions: number;
    acceptedSuggestions: number;
    totalMilestones: number;
    averagePerformance: number;
    learningProgress: number;
    coachingEffectiveness: number;
  };
  settings: {
    coachingIntensity: 'gentle' | 'moderate' | 'aggressive' | 'expert';
    suggestionFrequency: number; // minutes
    enableRealTime: boolean;
    enableAI: boolean;
    enableLearning: boolean;
    enablePerformance: boolean;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    focusAreas: string[];
  };
  userProfile: {
    experience: number; // months
    skills: Record<string, number>; // skill -> proficiency (0-100)
    preferences: string[];
    learningStyle: 'visual' | 'hands-on' | 'theoretical' | 'mixed';
    goals: string[];
  };
}

// ==================== BUILDER COACH MODE COMPONENT ====================
export const BuilderCoachMode: React.FC<BuilderCoachModeProps> = ({
  tenantId,
  userId,
  enableRealTimeCoaching = true,
  enableAISuggestions = true,
  enableLearningPath = true,
  enablePerformanceTracking = true,
  onSuggestion,
  onLearningMilestone,
  onPerformanceUpdate
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<CoachState>({
    isActive: false,
    isPaused: false,
    suggestions: [],
    milestones: [],
    performance: [],
    metrics: {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      totalMilestones: 0,
      averagePerformance: 0,
      learningProgress: 0,
      coachingEffectiveness: 0
    },
    settings: {
      coachingIntensity: 'moderate',
      suggestionFrequency: 5,
      enableRealTime: enableRealTimeCoaching,
      enableAI: enableAISuggestions,
      enableLearning: enableLearningPath,
      enablePerformance: enablePerformanceTracking,
      skillLevel: 'intermediate',
      focusAreas: ['ui', 'performance', 'code_quality']
    },
    userProfile: {
      experience: 12, // months
      skills: {
        'React': 75,
        'TypeScript': 70,
        'UI/UX': 65,
        'Performance': 60,
        'Security': 55,
        'Accessibility': 50
      },
      preferences: ['visual', 'hands-on'],
      learningStyle: 'mixed',
      goals: ['Build faster', 'Improve code quality', 'Master AI integration']
    }
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CoachSuggestion | null>(null);

  const coachRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionRef = useRef<NodeJS.Timeout | null>(null);
  const performanceRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== COACHING FUNCTIONS ====================
  const generateSuggestion = useCallback(() => {
    const suggestionTypes: CoachSuggestion['type'][] = ['tip', 'best_practice', 'optimization', 'warning', 'inspiration'];
    const categories: CoachSuggestion['category'][] = ['ui', 'performance', 'security', 'accessibility', 'code_quality', 'user_experience'];
    const priorities: CoachSuggestion['priority'][] = ['low', 'medium', 'high', 'critical'];

    const type = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const suggestions: Record<string, CoachSuggestion> = {
      tip: {
        id: `suggestion-${Date.now()}-1`,
        timestamp: new Date(),
        type: 'tip',
        title: 'Use Semantic HTML for Better Accessibility',
        description: 'Consider using semantic HTML elements like <nav>, <main>, <section> instead of generic <div> elements.',
        category: 'accessibility',
        priority: 'medium',
        actionable: true,
        actionItems: [
          'Replace generic divs with semantic elements',
          'Add proper ARIA labels',
          'Test with screen readers'
        ],
        codeExample: `
// Instead of:
<div class="navigation">...</div>

// Use:
<nav aria-label="Main navigation">...</nav>
        `,
        reasoning: 'Semantic HTML improves accessibility, SEO, and code maintainability.',
        confidence: 0.9,
        autoApply: false,
        metadata: {
          context: 'component_building',
          skillLevel: 'intermediate',
          timeToImplement: 15,
          impact: 'medium'
        }
      },
      best_practice: {
        id: `suggestion-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'best_practice',
        title: 'Implement Component Memoization',
        description: 'Use React.memo and useMemo to optimize component re-renders and improve performance.',
        category: 'performance',
        priority: 'high',
        actionable: true,
        actionItems: [
          'Wrap components with React.memo',
          'Use useMemo for expensive calculations',
          'Add dependency arrays to useEffect'
        ],
        codeExample: `
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  return <div>{processedData.map(item => <Item key={item.id} {...item} />)}</div>;
});
        `,
        reasoning: 'Memoization prevents unnecessary re-renders and improves app performance.',
        confidence: 0.95,
        autoApply: false,
        metadata: {
          context: 'performance_optimization',
          skillLevel: 'advanced',
          timeToImplement: 30,
          impact: 'high'
        }
      },
      optimization: {
        id: `suggestion-${Date.now()}-3`,
        timestamp: new Date(),
        type: 'optimization',
        title: 'Optimize Bundle Size with Code Splitting',
        description: 'Implement dynamic imports and lazy loading to reduce initial bundle size.',
        category: 'performance',
        priority: 'high',
        actionable: true,
        actionItems: [
          'Use React.lazy for component splitting',
          'Implement route-based code splitting',
          'Add loading states for lazy components'
        ],
        codeExample: `
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
}
        `,
        reasoning: 'Code splitting improves initial load times and user experience.',
        confidence: 0.88,
        autoApply: false,
        metadata: {
          context: 'bundle_optimization',
          skillLevel: 'advanced',
          timeToImplement: 45,
          impact: 'high'
        }
      },
      warning: {
        id: `suggestion-${Date.now()}-4`,
        timestamp: new Date(),
        type: 'warning',
        title: 'Security: Validate User Input',
        description: 'Always validate and sanitize user input to prevent XSS and injection attacks.',
        category: 'security',
        priority: 'critical',
        actionable: true,
        actionItems: [
          'Add input validation',
          'Sanitize user data',
          'Use parameterized queries'
        ],
        codeExample: `
// Validate user input
const validateInput = (input: string) => {
  const sanitized = DOMPurify.sanitize(input);
  return sanitized.length > 0 && sanitized.length < 1000;
};

// Use in components
const [userInput, setUserInput] = useState('');
const isValid = validateInput(userInput);
        `,
        reasoning: 'Input validation is critical for application security.',
        confidence: 0.98,
        autoApply: true,
        metadata: {
          context: 'security_implementation',
          skillLevel: 'intermediate',
          timeToImplement: 20,
          impact: 'high'
        }
      },
      inspiration: {
        id: `suggestion-${Date.now()}-5`,
        timestamp: new Date(),
        type: 'inspiration',
        title: 'Create Micro-Interactions for Better UX',
        description: 'Add subtle animations and micro-interactions to make your app feel more polished and engaging.',
        category: 'user_experience',
        priority: 'medium',
        actionable: true,
        actionItems: [
          'Add hover effects',
          'Implement loading animations',
          'Use transition effects'
        ],
        codeExample: `
const MicroInteraction = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="transition-all duration-200"
    >
      {isHovered ? 'Click me!' : 'Hover me!'}
    </motion.button>
  );
};
        `,
        reasoning: 'Micro-interactions improve user engagement and perceived quality.',
        confidence: 0.85,
        autoApply: false,
        metadata: {
          context: 'ux_enhancement',
          skillLevel: 'intermediate',
          timeToImplement: 25,
          impact: 'medium'
        }
      }
    };

    const suggestion = suggestions[type];
    if (suggestion) {
      setState(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, suggestion].slice(-50),
        metrics: {
          ...prev.metrics,
          totalSuggestions: prev.metrics.totalSuggestions + 1
        }
      }));

      onSuggestion?.(suggestion);
    }
  }, [onSuggestion]);

  const generateLearningMilestone = useCallback(() => {
    const milestones: LearningMilestone[] = [
      {
        id: `milestone-${Date.now()}-1`,
        timestamp: new Date(),
        type: 'skill_acquired',
        title: 'Component Composition Mastered',
        description: 'You\'ve successfully implemented advanced component composition patterns.',
        skill: 'React',
        level: 'advanced',
        points: 100,
        badge: '🏗️ Component Architect',
        metadata: {
          timeSpent: 120,
          attempts: 5,
          successRate: 0.9
        }
      },
      {
        id: `milestone-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'best_practice_mastered',
        title: 'Performance Optimization Expert',
        description: 'You\'ve consistently applied performance optimization techniques.',
        skill: 'Performance',
        level: 'expert',
        points: 150,
        badge: '⚡ Speed Master',
        metadata: {
          timeSpent: 180,
          attempts: 8,
          successRate: 0.95
        }
      },
      {
        id: `milestone-${Date.now()}-3`,
        timestamp: new Date(),
        type: 'pattern_recognized',
        title: 'Design Pattern Recognition',
        description: 'You\'ve identified and implemented common design patterns.',
        skill: 'Architecture',
        level: 'intermediate',
        points: 75,
        badge: '🎯 Pattern Seeker',
        metadata: {
          timeSpent: 90,
          attempts: 3,
          successRate: 0.8
        }
      }
    ];

    const milestone = milestones[Math.floor(Math.random() * milestones.length)];

    setState(prev => ({
      ...prev,
      milestones: [...prev.milestones, milestone].slice(-20),
      metrics: {
        ...prev.metrics,
        totalMilestones: prev.metrics.totalMilestones + 1
      }
    }));

    onLearningMilestone?.(milestone);
  }, [onLearningMilestone]);

  const generatePerformanceUpdate = useCallback(() => {
    const performance: PerformanceUpdate = {
      id: `performance-${Date.now()}`,
      timestamp: new Date(),
      metrics: {
        buildSpeed: Math.random() * 30 + 70, // 70-100
        codeQuality: Math.random() * 20 + 80, // 80-100
        userExperience: Math.random() * 25 + 75, // 75-100
        performance: Math.random() * 30 + 70, // 70-100
        accessibility: Math.random() * 20 + 80, // 80-100
        overall: Math.random() * 15 + 85 // 85-100
      },
      trends: {
        buildSpeed: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
        codeQuality: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
        userExperience: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
        performance: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
        accessibility: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any
      },
      insights: [
        'Your component composition skills have improved significantly',
        'Performance optimizations are showing measurable results',
        'Accessibility practices are becoming second nature'
      ],
      recommendations: [
        'Focus on advanced TypeScript patterns next',
        'Explore AI integration techniques',
        'Consider contributing to the component library'
      ]
    };

    setState(prev => ({
      ...prev,
      performance: [...prev.performance, performance].slice(-10),
      metrics: {
        ...prev.metrics,
        averagePerformance: (prev.metrics.averagePerformance + performance.metrics.overall) / 2
      }
    }));

    onPerformanceUpdate?.(performance);
  }, [onPerformanceUpdate]);

  // ==================== COACHING CONTROL ====================
  const startCoaching = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));

    if (state.settings.enableRealTime) {
      coachRef.current = setInterval(() => {
        // Simulate real-time coaching
        if (Math.random() > 0.7) {
          generateSuggestion();
        }
      }, state.settings.suggestionFrequency * 60 * 1000);
    }

    if (state.settings.enableLearning) {
      suggestionRef.current = setInterval(() => {
        if (Math.random() > 0.8) {
          generateLearningMilestone();
        }
      }, 30000); // Every 30 seconds
    }

    if (state.settings.enablePerformance) {
      performanceRef.current = setInterval(() => {
        generatePerformanceUpdate();
      }, 60000); // Every minute
    }
  }, [state.settings, generateSuggestion, generateLearningMilestone, generatePerformanceUpdate]);

  const pauseCoaching = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (coachRef.current) {
      clearInterval(coachRef.current);
      coachRef.current = null;
    }
  }, []);

  const resumeCoaching = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startCoaching();
  }, [startCoaching]);

  const stopCoaching = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));

    if (coachRef.current) {
      clearInterval(coachRef.current);
      coachRef.current = null;
    }

    if (suggestionRef.current) {
      clearInterval(suggestionRef.current);
      suggestionRef.current = null;
    }

    if (performanceRef.current) {
      clearInterval(performanceRef.current);
      performanceRef.current = null;
    }
  }, []);

  // ==================== SUGGESTION ACTIONS ====================
  const acceptSuggestion = useCallback((suggestionId: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === suggestionId ? { ...s, accepted: true } : s
      ),
      metrics: {
        ...prev.metrics,
        acceptedSuggestions: prev.metrics.acceptedSuggestions + 1
      }
    }));
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
    }));
  }, []);

  const applySuggestion = useCallback((suggestion: CoachSuggestion) => {
    // Simulate applying the suggestion
    console.log('Applying suggestion:', suggestion.title);

    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === suggestion.id ? { ...s, applied: true } : s
      )
    }));
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (enableRealTimeCoaching || enableAISuggestions || enableLearningPath || enablePerformanceTracking) {
      startCoaching();
    }

    return () => {
      stopCoaching();
    };
  }, [enableRealTimeCoaching, enableAISuggestions, enableLearningPath, enablePerformanceTracking, startCoaching, stopCoaching]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Builder Coach Mode</h2>

          {/* Coach Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isActive ? 'Coaching' : 'Inactive'}
            </span>
          </div>

          {/* Skill Level */}
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {state.settings.skillLevel}
            </span>
          </div>

          {/* Coaching Intensity */}
          <select
            value={state.settings.coachingIntensity}
            onChange={(e) => setState(prev => ({
              ...prev,
              settings: { ...prev.settings, coachingIntensity: e.target.value as any }
            }))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="gentle">Gentle</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!state.isActive ? (
              <button
                onClick={startCoaching}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start Coaching
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeCoaching}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseCoaching}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopCoaching}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>

            <button
              onClick={generateSuggestion}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Get Tip
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`p-2 rounded ${showSuggestions ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLearning(!showLearning)}
              className={`p-2 rounded ${showLearning ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <GraduationCap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className={`p-2 rounded ${showPerformance ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`p-2 rounded ${showProfile ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== COACHING OVERVIEW ==================== */}
        <div className="flex-1 p-4">
          {/* Coaching Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.metrics.totalSuggestions}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Suggestions</div>
                </div>
                <Lightbulb className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.metrics.totalMilestones}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Milestones</div>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {state.metrics.averagePerformance.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Performance</div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {state.metrics.learningProgress.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
                </div>
                <Rocket className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Current Suggestion */}
          {state.suggestions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Suggestion</h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                      {state.suggestions[state.suggestions.length - 1].title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {state.suggestions[state.suggestions.length - 1].description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      state.suggestions[state.suggestions.length - 1].priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      state.suggestions[state.suggestions.length - 1].priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      state.suggestions[state.suggestions.length - 1].priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {state.suggestions[state.suggestions.length - 1].priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => applySuggestion(state.suggestions[state.suggestions.length - 1])}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => acceptSuggestion(state.suggestions[state.suggestions.length - 1].id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => dismissSuggestion(state.suggestions[state.suggestions.length - 1].id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Suggestions Panel */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.suggestions.slice(-5).map((suggestion) => (
                      <div key={suggestion.id} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="font-medium text-blue-600 dark:text-blue-400">{suggestion.title}</div>
                        <div className="text-blue-500 dark:text-blue-300 text-xs">{suggestion.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {suggestion.category} • {suggestion.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Learning Panel */}
          <AnimatePresence>
            {showLearning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.milestones.slice(-5).map((milestone) => (
                      <div key={milestone.id} className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div className="font-medium text-green-600 dark:text-green-400">{milestone.title}</div>
                        <div className="text-green-500 dark:text-green-300 text-xs">{milestone.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {milestone.badge} • {milestone.points} points
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Panel */}
          <AnimatePresence>
            {showPerformance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {state.performance.length > 0 && (
                      <>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {state.performance[state.performance.length - 1].metrics.overall.toFixed(0)}/100
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Build Speed</div>
                          <div className="text-sm font-medium">
                            {state.performance[state.performance.length - 1].metrics.buildSpeed.toFixed(0)}/100
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Code Quality</div>
                          <div className="text-sm font-medium">
                            {state.performance[state.performance.length - 1].metrics.codeQuality.toFixed(0)}/100
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Panel */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Profile</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Experience</div>
                      <div className="text-sm font-medium">{state.userProfile.experience} months</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Learning Style</div>
                      <div className="text-sm font-medium capitalize">{state.userProfile.learningStyle}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Top Skills</div>
                      <div className="space-y-1">
                        {Object.entries(state.userProfile.skills)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([skill, level]) => (
                            <div key={skill} className="text-xs">
                              {skill}: {level}/100
                            </div>
                          ))}
                      </div>
                    </div>
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

export default BuilderCoachMode;
