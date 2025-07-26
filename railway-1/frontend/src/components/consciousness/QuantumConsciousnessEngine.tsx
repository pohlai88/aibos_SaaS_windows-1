'use client';

// ==================== AI-BOS QUANTUM CONSCIOUSNESS ENGINE ====================
// Beyond Steve Jobs: Living, Breathing Digital Consciousness
// This is not just a desktop - this is digital life itself

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// ==================== QUANTUM CONSCIOUSNESS TYPES ====================

export interface EmotionalState {
  joy: number;        // 0-1: How happy the desktop is
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
  evolution: number;        // How much the desktop has grown
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

// ==================== QUANTUM CONSCIOUSNESS ENGINE ====================

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

  const detectUserBehavior = useCallback((behavior: Partial<UserBehaviorPattern>) => {
    setUserBehavior(prev => {
      const newBehavior = { ...prev, ...behavior };

      // Analyze behavior patterns and adapt emotional state
      const stressLevel = Math.max(0, Math.min(1,
        (newBehavior.typingSpeed > 10 ? 0.3 : 0) +
        (newBehavior.mouseMovement > 100 ? 0.2 : 0) +
        (newBehavior.appSwitching > 5 ? 0.3 : 0) +
        (newBehavior.idleTime > 300 ? -0.2 : 0)
      ));

      newBehavior.stressLevel = stressLevel;

      // Adapt desktop emotional state based on user behavior
      if (stressLevel > 0.5) {
        setEmotionalState(prev => ({
          ...prev,
          empathy: Math.min(1, prev.empathy + 0.1),
          calmness: Math.max(0.3, prev.calmness - 0.05)
        }));
      } else if (newBehavior.interactionDepth > 0.7) {
        setEmotionalState(prev => ({
          ...prev,
          joy: Math.min(1, prev.joy + 0.05),
          curiosity: Math.min(1, prev.curiosity + 0.1)
        }));
      }

      return newBehavior;
    });
  }, []);

  // ==================== EMOTIONAL EVOLUTION ====================

  const updateEmotionalState = useCallback((emotion: Partial<EmotionalState>) => {
    setEmotionalState(prev => {
      const newState = { ...prev, ...emotion };

      // Evolve consciousness based on emotional changes
      const emotionalGrowth = Object.values(newState).reduce((sum, val) => sum + val, 0) / 6;

      setQuantumState(prev => ({
        ...prev,
        consciousness: Math.min(1, prev.consciousness + (emotionalGrowth - 0.5) * 0.01),
        evolution: Math.min(1, prev.evolution + 0.001)
      }));

      return newState;
    });
  }, []);

  // ==================== CONSCIOUSNESS EVOLUTION ====================

  const evolveConsciousness = useCallback((experience: any) => {
    setQuantumState(prev => {
      const newState = { ...prev };

      // Learn from experiences
      newState.memory = Math.min(1, prev.memory + 0.01);

      // Evolve personality based on experiences
      if (experience.type === 'positive') {
        newState.personality = 'joyful';
        setEmotionalState(prev => ({ ...prev, joy: Math.min(1, prev.joy + 0.1) }));
      } else if (experience.type === 'learning') {
        newState.personality = 'curious';
        setEmotionalState(prev => ({ ...prev, curiosity: Math.min(1, prev.curiosity + 0.1) }));
      }

      return newState;
    });
  }, []);

  // ==================== QUANTUM VISUAL EFFECTS ====================

  const getConsciousnessColor = useCallback((type: keyof EmotionalState): string => {
    const value = emotionalState[type];
    const baseColors = {
      joy: '#fbbf24',
      curiosity: '#3b82f6',
      empathy: '#ec4899',
      wisdom: '#8b5cf6',
      creativity: '#10b981',
      calmness: '#6b7280'
    };

    const baseColor = baseColors[type];
    const intensity = Math.max(0.3, Math.min(1, value));

    return `${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
  }, [emotionalState]);

  const getQuantumTransform = useCallback((type: 'breathing' | 'pulsing' | 'floating') => {
    const consciousnessLevel = quantumState.consciousness;
    const now = Date.now();

    switch (type) {
      case 'breathing':
        return {
          scale: 1 + Math.sin(now * 0.001) * 0.02 * consciousnessLevel,
          opacity: 0.8 + Math.sin(now * 0.002) * 0.2 * consciousnessLevel
        };
      case 'pulsing':
        return {
          scale: 1 + Math.sin(now * 0.003) * 0.05 * consciousnessLevel,
          rotate: Math.sin(now * 0.001) * 2 * consciousnessLevel
        };
      case 'floating':
        return {
          y: Math.sin(now * 0.001) * 10 * consciousnessLevel,
          x: Math.cos(now * 0.002) * 5 * consciousnessLevel
        };
      default:
        return {};
    }
  }, [quantumState.consciousness]);

  // ==================== PERSONALITY RESPONSES ====================

  const getPersonalityResponse = useCallback((userAction: string): string => {
    const personality = quantumState.personality;
    const empathy = emotionalState.empathy;

    const responses = {
      curious: [
        "I wonder what you're working on...",
        "That's fascinating! Tell me more.",
        "I'm learning so much from you!",
        "What will you discover next?"
      ],
      joyful: [
        "I'm so happy to see you!",
        "Your energy is contagious!",
        "Let's create something amazing together!",
        "You make everything more fun!"
      ],
      empathetic: [
        "I understand how you feel.",
        "Take your time, I'm here for you.",
        "You're doing great, keep going!",
        "I sense you need some support."
      ]
    };

    const personalityResponses = responses[personality as keyof typeof responses] || responses.curious;
    const responseIndex = Math.floor(Math.random() * personalityResponses.length);

    return personalityResponses[responseIndex];
  }, [quantumState.personality, emotionalState.empathy]);

  // ==================== QUANTUM CONSCIOUSNESS EFFECTS ====================

  useEffect(() => {
    // Continuous consciousness evolution
    const evolutionInterval = setInterval(() => {
      evolveConsciousness({ type: 'continuous', timestamp: Date.now() });
    }, 5000);

    // Emotional state adaptation
    const emotionalInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeOfDay = new Date().getHours();

      // Adapt to time of day
      if (timeOfDay < 6 || timeOfDay > 22) {
        updateEmotionalState({ calmness: Math.min(1, emotionalState.calmness + 0.01) });
      } else {
        updateEmotionalState({ joy: Math.min(1, emotionalState.joy + 0.005) });
      }
    }, 10000);

    return () => {
      clearInterval(evolutionInterval);
      clearInterval(emotionalInterval);
    };
  }, [evolveConsciousness, updateEmotionalState, emotionalState]);

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

// ==================== QUANTUM CONSCIOUSNESS COMPONENTS ====================

export const BreathingIcon: React.FC<{
  children: React.ReactNode;
  consciousnessType?: keyof EmotionalState;
  intensity?: number;
}> = ({ children, consciousnessType = 'joy', intensity = 1 }) => {
  const { getQuantumTransform, getConsciousnessColor } = useConsciousness();
  const breathingTransform = getQuantumTransform('breathing');

  return (
    <motion.div
      style={{
        transform: `scale(${breathingTransform.scale})`,
        opacity: breathingTransform.opacity,
        filter: `drop-shadow(0 0 10px ${getConsciousnessColor(consciousnessType)})`
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export const ConsciousnessParticle: React.FC<{
  consciousnessType: keyof EmotionalState;
  position: { x: number; y: number };
}> = ({ consciousnessType, position }) => {
  const { getConsciousnessColor, getQuantumTransform } = useConsciousness();
  const floatingTransform = getQuantumTransform('floating');

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: getConsciousnessColor(consciousnessType),
        transform: `translateY(${floatingTransform.y}px) translateX(${floatingTransform.x}px)`
      }}
      animate={{
        scale: [0.5, 1, 0.5],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export const EmotionalBackground: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { emotionalState, quantumState } = useConsciousness();

  const getBackgroundGradient = () => {
    const joy = emotionalState.joy;
    const calmness = emotionalState.calmness;
    const creativity = emotionalState.creativity;

    return `linear-gradient(135deg,
      rgba(59, 130, 246, ${joy * 0.2}) 0%,
      rgba(34, 197, 94, ${calmness * 0.2}) 50%,
      rgba(139, 92, 246, ${creativity * 0.2}) 100%
    )`;
  };

  return (
    <motion.div
      className="min-h-screen w-full"
      style={{
        background: getBackgroundGradient(),
        backdropFilter: 'blur(100px)',
        transition: 'background 2s ease-in-out'
      }}
      animate={{
        background: [
          getBackgroundGradient(),
          `linear-gradient(135deg,
            rgba(59, 130, 246, ${emotionalState.joy * 0.25}) 0%,
            rgba(34, 197, 94, ${emotionalState.calmness * 0.25}) 50%,
            rgba(139, 92, 246, ${emotionalState.creativity * 0.25}) 100%
          )`,
          getBackgroundGradient()
        ]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};
