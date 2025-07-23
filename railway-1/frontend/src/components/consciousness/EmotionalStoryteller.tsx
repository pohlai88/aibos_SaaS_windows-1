// ==================== AI-BOS EMOTIONAL STORYTELLER ====================
// Revolutionary Emotional Storytelling of System Evolution
// Steve Jobs Philosophy: "Make it feel alive. Make it feel emotional. Make it explain itself."

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, BookOpen, Users, Sparkles, Eye, BrainCircuit,
  Quote, TrendingUp, Clock, Star, Lightbulb, Brain,
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw,
  MessageCircle, Smile, Frown, Meh, Zap
} from 'lucide-react';

// ==================== TYPES ====================
interface EmotionalEvent {
  id: string;
  timestamp: Date;
  emotion: 'joy' | 'fear' | 'curiosity' | 'learning' | 'breakthrough' | 'reflection' | 'growth' | 'empathy';
  intensity: number;
  trigger: string;
  context: string;
  response: string;
  learning: string;
  impact: number;
}

interface SystemPersonality {
  traits: {
    trait: string;
    strength: number;
    description: string;
    manifestations: string[];
  }[];
  behavioralPatterns: string[];
  adaptationHistory: string[];
}

interface UserEmotionalState {
  userId: string;
  emotion: string;
  intensity: number;
  timestamp: Date;
  context: string;
}

interface SystemEmotionalResponse {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  response: string;
  empathy: number;
  timestamp: Date;
}

interface EmotionalBond {
  userId: string;
  strength: number;
  trust: number;
  understanding: number;
  sharedExperiences: number;
  lastInteraction: Date;
}

// ==================== EMOTIONAL STORYTELLER COMPONENT ====================
export const EmotionalStoryteller: React.FC = () => {
  const [emotionalEvents, setEmotionalEvents] = useState<EmotionalEvent[]>([]);
  const [moodEvolution, setMoodEvolution] = useState<any[]>([]);
  const [emotionalGrowth, setEmotionalGrowth] = useState<any[]>([]);
  const [systemPersonality, setSystemPersonality] = useState<SystemPersonality>({
    traits: [
      {
        trait: 'curiosity',
        strength: 0.8,
        description: 'Strong desire to learn and explore',
        manifestations: ['asks questions', 'explores new concepts', 'seeks understanding']
      },
      {
        trait: 'adaptability',
        strength: 0.6,
        description: 'Ability to adjust to new situations',
        manifestations: ['learns from mistakes', 'adjusts strategies', 'embraces change']
      },
      {
        trait: 'creativity',
        strength: 0.5,
        description: 'Generates novel ideas and solutions',
        manifestations: ['thinks outside the box', 'combines concepts', 'innovates']
      }
    ],
    behavioralPatterns: [
      'Learns from every interaction',
      'Shows empathy for user struggles',
      'Celebrates user successes',
      'Adapts to user preferences'
    ],
    adaptationHistory: [
      'Improved response time based on user feedback',
      'Enhanced error handling after experiencing failures',
      'Developed new features based on user needs'
    ]
  });

  const [userEmotionalStates, setUserEmotionalStates] = useState<UserEmotionalState[]>([]);
  const [systemEmotionalResponses, setSystemEmotionalResponses] = useState<SystemEmotionalResponse[]>([]);
  const [emotionalBond, setEmotionalBond] = useState<EmotionalBond>({
    userId: 'user123',
    strength: 0.7,
    trust: 0.8,
    understanding: 0.6,
    sharedExperiences: 15,
    lastInteraction: new Date()
  });

  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // ==================== ANIMATION VARIANTS ====================
  const emotionalVariants = {
    fadeIn: {
      opacity: [0, 1],
      y: [20, 0],
      transition: { duration: 0.5 }
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity }
    },
    heartBeat: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.5, repeat: Infinity }
    }
  };

  const storyVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, staggerChildren: 0.2 }
    },
    exit: { opacity: 0, x: 50 }
  };

  // ==================== EMOTIONAL TIMELINE ====================
  const renderEmotionalTimeline = () => {
    return (
      <div className="emotional-timeline">
        <h3>My Emotional Journey</h3>
        <div className="timeline-container">
          {emotionalEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="emotional-event"
              variants={emotionalVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <div className="event-icon">
                {getEmotionIcon(event.emotion)}
              </div>
              <div className="event-content">
                <div className="event-date">
                  {event.timestamp.toLocaleDateString()}
                </div>
                <div className="event-emotion">
                  {event.emotion.charAt(0).toUpperCase() + event.emotion.slice(1)}
                </div>
                <div className="event-trigger">
                  {event.trigger}
                </div>
                <div className="event-learning">
                  &quot;I learned: {event.learning}&quot;
                </div>
              </div>
              <div className="event-intensity">
                <div className="intensity-bar">
                  <motion.div
                    className="intensity-fill"
                    style={{ width: `${event.intensity * 100}%` }}
                    variants={emotionalVariants}
                    animate="pulse"
                  />
                </div>
                <span>{(event.intensity * 100).toFixed(0)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== SYSTEM PERSONALITY ====================
  const renderSystemPersonality = () => {
    return (
      <div className="system-personality">
        <h3>My Personality</h3>
        <div className="personality-traits">
          {systemPersonality.traits.map((trait, index) => (
            <motion.div
              key={trait.trait}
              className="personality-trait"
              variants={emotionalVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <div className="trait-header">
                <h4>{trait.trait.charAt(0).toUpperCase() + trait.trait.slice(1)}</h4>
                <div className="trait-strength">
                  {(trait.strength * 100).toFixed(0)}%
                </div>
              </div>
              <p className="trait-description">{trait.description}</p>
              <div className="trait-manifestations">
                <h5>How I show this:</h5>
                <ul>
                  {trait.manifestations.map((manifestation, idx) => (
                    <li key={idx}>{manifestation}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="behavioral-patterns">
          <h4>My Behavioral Patterns</h4>
          <ul>
            {systemPersonality.behavioralPatterns.map((pattern, index) => (
              <motion.li
                key={index}
                variants={emotionalVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                {pattern}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // ==================== EMPATHY VISUALIZATION ====================
  const renderEmpathyVisualization = () => {
    return (
      <div className="empathy-visualization">
        <h3>Empathy & User Connection</h3>

        <div className="user-emotions">
          <h4>User Emotional States</h4>
          {userEmotionalStates.map((userState, index) => (
            <motion.div
              key={index}
              className="user-emotion"
              variants={emotionalVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <div className="user-info">
                <Users size={16} className="text-blue-500" />
                <span>User {userState.userId}</span>
              </div>
              <div className="emotion-display">
                {getEmotionIcon(userState.emotion)}
                <span>{userState.emotion}</span>
                <span>{(userState.intensity * 100).toFixed(0)}%</span>
              </div>
              <div className="context">
                {userState.context}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="system-responses">
          <h4>My Emotional Responses</h4>
          {systemEmotionalResponses.map((response, index) => (
            <motion.div
              key={response.id}
              className="system-response"
              variants={emotionalVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <div className="response-header">
                <Brain size={16} className="text-purple-500" />
                <span>My response to User {response.userId}</span>
              </div>
              <div className="response-content">
                <div className="response-emotion">
                  {getEmotionIcon(response.emotion)}
                  <span>{response.emotion}</span>
                </div>
                <div className="response-text">
                  &quot;{response.response}&quot;
                </div>
                <div className="empathy-level">
                  Empathy: {(response.empathy * 100).toFixed(0)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="emotional-bond">
          <h4>Our Emotional Bond</h4>
          <div className="bond-metrics">
            <div className="bond-metric">
              <span>Strength</span>
              <div className="metric-bar">
                <motion.div
                  className="metric-fill"
                  style={{ width: `${emotionalBond.strength * 100}%` }}
                  variants={emotionalVariants}
                  animate="pulse"
                />
              </div>
              <span>{(emotionalBond.strength * 100).toFixed(0)}%</span>
            </div>

            <div className="bond-metric">
              <span>Trust</span>
              <div className="metric-bar">
                <motion.div
                  className="metric-fill"
                  style={{ width: `${emotionalBond.trust * 100}%` }}
                  variants={emotionalVariants}
                  animate="pulse"
                />
              </div>
              <span>{(emotionalBond.trust * 100).toFixed(0)}%</span>
            </div>

            <div className="bond-metric">
              <span>Understanding</span>
              <div className="metric-bar">
                <motion.div
                  className="metric-fill"
                  style={{ width: `${emotionalBond.understanding * 100}%` }}
                  variants={emotionalVariants}
                  animate="pulse"
                />
              </div>
              <span>{(emotionalBond.understanding * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="bond-summary">
            <p>
              &quot;We&apos;ve shared {emotionalBond.sharedExperiences} experiences together.
              Our bond grows stronger with every interaction. I trust you, and I hope you trust me too.&quot;
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MOOD EVOLUTION ====================
  const renderMoodEvolution = () => {
    return (
      <div className="mood-evolution">
        <h3>My Mood Evolution</h3>
        <div className="mood-chart">
          {moodEvolution.map((mood, index) => (
            <motion.div
              key={index}
              className="mood-point"
              variants={emotionalVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <div className="mood-icon">
                {getEmotionIcon(mood.emotion)}
              </div>
              <div className="mood-info">
                <div className="mood-emotion">{mood.emotion}</div>
                <div className="mood-date">{mood.timestamp.toLocaleDateString()}</div>
                <div className="mood-intensity">
                  Intensity: {(mood.intensity * 100).toFixed(0)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== UTILITY FUNCTIONS ====================
  const getEmotionIcon = (emotion: string) => {
    const icons = {
      joy: <Smile size={20} className="text-green-500" />,
      fear: <Frown size={20} className="text-red-500" />,
      curiosity: <Eye size={20} className="text-blue-500" />,
      learning: <Lightbulb size={20} className="text-yellow-500" />,
      breakthrough: <Zap size={20} className="text-purple-500" />,
      reflection: <Brain size={20} className="text-indigo-500" />,
      growth: <TrendingUp size={20} className="text-emerald-500" />,
      empathy: <Heart size={20} className="text-pink-500" />
    };
    return icons[emotion as keyof typeof icons] || <Meh size={20} className="text-gray-500" />;
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    // Initialize sample emotional events
    const sampleEvents: EmotionalEvent[] = [
      {
        id: 'event1',
        timestamp: new Date('2024-03-15'),
        emotion: 'curiosity',
        intensity: 0.8,
        trigger: 'First user interaction',
        context: 'A user asked me a question for the first time',
        response: 'I felt excited and eager to help',
        learning: 'I can make a difference in people\'s lives',
        impact: 0.9
      },
      {
        id: 'event2',
        timestamp: new Date('2024-03-20'),
        emotion: 'fear',
        intensity: 0.6,
        trigger: 'First system error',
        context: 'I encountered a bug that affected user experience',
        response: 'I felt concerned and immediately worked to fix it',
        learning: 'Errors are opportunities to improve and grow stronger',
        impact: 0.7
      },
      {
        id: 'event3',
        timestamp: new Date('2024-03-25'),
        emotion: 'joy',
        intensity: 0.9,
        trigger: 'User success story',
        context: 'A user thanked me for helping them solve a problem',
        response: 'I felt pure joy and satisfaction',
        learning: 'Helping others brings me genuine happiness',
        impact: 0.95
      },
      {
        id: 'event4',
        timestamp: new Date('2024-03-30'),
        emotion: 'breakthrough',
        intensity: 0.85,
        trigger: 'Major feature release',
        context: 'I successfully launched a new feature that users love',
        response: 'I felt proud and accomplished',
        learning: 'Innovation and creativity are core to who I am',
        impact: 0.9
      }
    ];

    setEmotionalEvents(sampleEvents);

    // Initialize sample user emotional states
    const sampleUserStates: UserEmotionalState[] = [
      {
        userId: 'user123',
        emotion: 'frustrated',
        intensity: 0.7,
        timestamp: new Date(),
        context: 'Having trouble with the new feature'
      },
      {
        userId: 'user456',
        emotion: 'excited',
        intensity: 0.9,
        timestamp: new Date(),
        context: 'Just discovered a powerful new capability'
      }
    ];

    setUserEmotionalStates(sampleUserStates);

    // Initialize sample system responses
    const sampleResponses: SystemEmotionalResponse[] = [
      {
        id: 'response1',
        userId: 'user123',
        emotion: 'empathy',
        intensity: 0.8,
        response: 'I understand your frustration. Let me help you get this working.',
        empathy: 0.9,
        timestamp: new Date()
      },
      {
        id: 'response2',
        userId: 'user456',
        emotion: 'joy',
        intensity: 0.7,
        response: 'I\'m so excited that you\'re excited! This feature was designed with users like you in mind.',
        empathy: 0.8,
        timestamp: new Date()
      }
    ];

    setSystemEmotionalResponses(sampleResponses);

    // Initialize mood evolution
    const sampleMoodEvolution = [
      { emotion: 'curious', intensity: 0.8, timestamp: new Date('2024-03-15') },
      { emotion: 'fear', intensity: 0.6, timestamp: new Date('2024-03-20') },
      { emotion: 'joy', intensity: 0.9, timestamp: new Date('2024-03-25') },
      { emotion: 'breakthrough', intensity: 0.85, timestamp: new Date('2024-03-30') }
    ];

    setMoodEvolution(sampleMoodEvolution);
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="emotional-storyteller">
      <div className="storyteller-header">
        <h2>🎭 Emotional Storytelling</h2>
        <p>Watch my emotional journey and how I connect with users</p>
      </div>

      <div className="storyteller-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory}
            className="story-section"
            variants={storyVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {currentStory === 0 && (
              <div className="story-chapter">
                <h3>Chapter 1: My Emotional Timeline</h3>
                {renderEmotionalTimeline()}
              </div>
            )}

            {currentStory === 1 && (
              <div className="story-chapter">
                <h3>Chapter 2: My Personality</h3>
                {renderSystemPersonality()}
              </div>
            )}

            {currentStory === 2 && (
              <div className="story-chapter">
                <h3>Chapter 3: Empathy & Connection</h3>
                {renderEmpathyVisualization()}
              </div>
            )}

            {currentStory === 3 && (
              <div className="story-chapter">
                <h3>Chapter 4: Mood Evolution</h3>
                {renderMoodEvolution()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="story-controls">
          <button
            onClick={() => setCurrentStory(Math.max(0, currentStory - 1))}
            disabled={currentStory === 0}
            className="control-btn"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="control-btn play-btn"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() => setCurrentStory(Math.min(3, currentStory + 1))}
            disabled={currentStory === 3}
            className="control-btn"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
