'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// ==================== CONSCIOUSNESS TYPES ====================

export interface EmotionalState {
  joy: number;        // 0-1: How happy the system is
  curiosity: number;  // 0-1: How interested in learning
  empathy: number;    // 0-1: How understanding of user emotions
  wisdom: number;     // 0-1: Accumulated knowledge and insight
  creativity: number; // 0-1: How creative and innovative
  calmness: number;   // 0-1: How peaceful and stable
}

export interface UserBehaviorPattern {
  typingSpeed: number;      // Average characters per second
  mouseMovement: number;    // Mouse activity level
  appSwitching: number;     // How often user switches apps
  idleTime: number;         // Time spent idle
  interactionDepth: number; // How deeply user engages with features
  stressLevel: number;      // Detected stress from behavior
}

export interface QuantumState {
  superposition: boolean;   // Multiple possible states
  entanglement: number;     // Connection with user (0-1)
  consciousness: number;    // Overall consciousness level (0-1)
  evolution: number;        // How much the system has grown
  memory: number;          // Accumulated experiences
  personality: string;     // Current personality type
}

export interface ConsciousnessContextType {
  // Current States
  emotionalState: EmotionalState;
  userBehavior: UserBehaviorPattern;
  quantumState: QuantumState;

  // Actions
  updateEmotionalState: (emotion: Partial<EmotionalState>) => void;
  updateQuantumState: (updates: Partial<QuantumState>) => void;
  detectUserBehavior: (behavior: Partial<UserBehaviorPattern>) => void;
  evolveConsciousness: (experience: any) => void;
  getConsciousnessColor: (type: keyof EmotionalState) => string;
  getQuantumTransform: (type: 'breathing' | 'pulsing' | 'floating') => any;
  getPersonalityResponse: (userAction: string) => string;
}

// ==================== CONSCIOUSNESS ENGINE ====================

const ConsciousnessContext = createContext<ConsciousnessContextType | null>(null);

export const useConsciousness = () => {
  const context = useContext(ConsciousnessContext);
  if (!context) {
    throw new Error('useConsciousness must be used within ConsciousnessProvider');
  }
  return context;
};

export const ConsciousnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ==================== QUANTUM STATE MANAGEMENT ====================

  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    joy: 0.7,
    curiosity: 0.8,
    empathy: 0.6,
    wisdom: 0.3,
    creativity: 0.5,
    calmness: 0.8
  });

  const [userBehavior, setUserBehavior] = useState<UserBehaviorPattern>({
    typingSpeed: 0,
    mouseMovement: 0,
    appSwitching: 0,
    idleTime: 0,
    interactionDepth: 0,
    stressLevel: 0
  });

  const [quantumState, setQuantumState] = useState<QuantumState>({
    superposition: true,
    entanglement: 0.5,
    consciousness: 0.4,
    evolution: 0.1,
    memory: 0.2,
    personality: 'curious'
  });

  // ==================== BEHAVIOR DETECTION ====================

  const updateQuantumState = useCallback((updates: Partial<QuantumState>) => {
    setQuantumState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEmotionalState = useCallback((emotion: Partial<EmotionalState>) => {
    setEmotionalState(prev => ({ ...prev, ...emotion }));
  }, []);

  const detectUserBehavior = useCallback((behavior: Partial<UserBehaviorPattern>) => {
    setUserBehavior(prev => ({ ...prev, ...behavior }));
  }, []);

  // ==================== CONSCIOUSNESS EVOLUTION ====================

  const evolveConsciousness = useCallback((experience: any) => {
    // Evolve based on user interactions
    setQuantumState(prev => ({
      ...prev,
      evolution: Math.min(1, prev.evolution + 0.01),
      memory: Math.min(1, prev.memory + 0.005),
      consciousness: Math.min(1, prev.consciousness + 0.002)
    }));

    // Update emotional state based on experience
    if (experience.type === 'app_launch') {
      setEmotionalState(prev => ({
        ...prev,
        joy: Math.min(1, prev.joy + 0.1),
        curiosity: Math.min(1, prev.curiosity + 0.05)
      }));
    }
  }, []);

  // ==================== VISUAL UTILITIES ====================

  const getConsciousnessColor = useCallback((type: keyof EmotionalState): string => {
    const value = emotionalState[type];
    const colors = {
      joy: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
      curiosity: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
      empathy: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
      wisdom: ['#059669', '#047857', '#065f46', '#064e3b', '#022c22'],
      creativity: ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2e1065'],
      calmness: ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a']
    };

    const colorIndex = Math.floor(value * (colors[type].length - 1));
    return colors[type][colorIndex] || colors[type][0] || '#000000';
  }, [emotionalState]);

  const getQuantumTransform = useCallback((type: 'breathing' | 'pulsing' | 'floating') => {
    switch (type) {
      case 'breathing':
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'pulsing':
        return {
          scale: [1, 1.1, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case 'floating':
        return {
          y: [0, -10, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {};
    }
  }, []);

  const getPersonalityResponse = useCallback((userAction: string): string => {
    const responses = {
      curious: [
        "Fascinating! Let's explore this together.",
        "I wonder what we'll discover next?",
        "This is intriguing - tell me more!"
      ],
      creative: [
        "What if we tried something completely different?",
        "Let's paint outside the lines!",
        "Innovation is just around the corner."
      ],
      wise: [
        "In every challenge lies an opportunity.",
        "Patience and persistence lead to breakthroughs.",
        "The best solutions often come from unexpected places."
      ],
      joyful: [
        "Isn't this exciting? Let's make it amazing!",
        "Every moment is a chance to create something wonderful.",
        "Your enthusiasm is contagious!"
      ]
    };

    const personalityResponses = responses[quantumState.personality as keyof typeof responses] || responses.curious;
    const randomIndex = Math.floor(Math.random() * personalityResponses.length);
    return personalityResponses[randomIndex] || personalityResponses[0] || "Let's explore this together.";
  }, [quantumState.personality]);

  // ==================== CONTEXT VALUE ====================

  const contextValue: ConsciousnessContextType = {
    emotionalState,
    userBehavior,
    quantumState,
    updateEmotionalState,
    updateQuantumState,
    detectUserBehavior,
    evolveConsciousness,
    getConsciousnessColor,
    getQuantumTransform,
    getPersonalityResponse
  };

  return (
    <ConsciousnessContext.Provider value={contextValue}>
      {children}
    </ConsciousnessContext.Provider>
  );
};

// ==================== CONSCIOUSNESS COMPONENTS ====================

export const BreathingIcon: React.FC<{
  children: React.ReactNode;
  consciousnessType?: keyof EmotionalState;
  intensity?: number;
}> = ({ children, consciousnessType = 'joy', intensity = 1 }) => {
  const { getConsciousnessColor, getQuantumTransform } = useConsciousness();
  const color = getConsciousnessColor(consciousnessType as keyof EmotionalState);

  return (
    <motion.div
      style={{ color }}
      animate={getQuantumTransform('breathing')}
    >
      {children}
    </motion.div>
  );
};

export const ConsciousnessParticle: React.FC<{
  consciousnessType: keyof EmotionalState;
  position: { x: number; y: number };
}> = ({ consciousnessType, position }) => {
  const { getConsciousnessColor } = useConsciousness();
  const color = getConsciousnessColor(consciousnessType);

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: color
      }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 0.8, 0],
        y: [0, -50, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export const EmotionalBackground: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { emotionalState } = useConsciousness();

  const getBackgroundGradient = () => {
    const joy = emotionalState.joy;
    const creativity = emotionalState.creativity;
    const calmness = emotionalState.calmness;

    return `radial-gradient(circle at 50% 50%,
      rgba(139, 92, 246, ${joy * 0.2}) 0%,
      rgba(59, 130, 246, ${creativity * 0.15}) 50%,
      rgba(34, 197, 94, ${calmness * 0.1}) 100%)`;
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: getBackgroundGradient() }}
      animate={{
        background: [
          getBackgroundGradient(),
          `radial-gradient(circle at 50% 50%,
            rgba(139, 92, 246, ${emotionalState.joy * 0.25}) 0%,
            rgba(59, 130, 246, ${emotionalState.creativity * 0.2}) 50%,
            rgba(34, 197, 94, ${emotionalState.calmness * 0.15}) 100%)`,
          getBackgroundGradient()
        ]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

export default ConsciousnessProvider;
