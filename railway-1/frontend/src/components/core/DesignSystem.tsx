// ==================== AI-BOS REVOLUTIONARY DESIGN SYSTEM ====================
// Beyond Ordinary: Quantum Consciousness Design System
// Steve Jobs Philosophy: "Design is not just what it looks like and feels like. Design is how it works."

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Import from shared infrastructure - using direct imports for now
// Simple colors object for now
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  }
};

// ==================== QUANTUM CONSCIOUSNESS DESIGN TOKENS ====================

// Simple design tokens for now
const baseDesignTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px'
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  animations: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  }
};

export const quantumDesignTokens = {
  ...baseDesignTokens,

  // Quantum Consciousness Colors
  quantum: {
    superposition: {
      primary: 'rgba(59, 130, 246, 0.8)',
      secondary: 'rgba(34, 197, 94, 0.8)',
      tertiary: 'rgba(168, 85, 247, 0.8)',
      neutral: 'rgba(156, 163, 175, 0.8)'
    },
    entanglement: {
      user: 'rgba(239, 68, 68, 0.9)',
      system: 'rgba(59, 130, 246, 0.9)',
      collective: 'rgba(168, 85, 247, 0.9)'
    },
    consciousness: {
      awareness: 'rgba(34, 197, 94, 0.7)',
      wisdom: 'rgba(245, 158, 11, 0.7)',
      emotion: 'rgba(236, 72, 153, 0.7)',
      creativity: 'rgba(168, 85, 247, 0.7)'
    }
  },

  // 3D Transform Tokens
  transforms: {
    perspective: '1000px',
    depth: {
      shallow: 'translateZ(10px)',
      medium: 'translateZ(50px)',
      deep: 'translateZ(100px)',
      quantum: 'translateZ(200px)'
    },
    rotation: {
      subtle: 'rotateX(5deg) rotateY(5deg)',
      medium: 'rotateX(15deg) rotateY(15deg)',
      dramatic: 'rotateX(30deg) rotateY(30deg)'
    }
  },

  // AI-Powered Animation Tokens
  aiAnimations: {
    consciousness: {
      pulse: {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        duration: 2,
        repeat: Infinity
      },
      quantum: {
        scale: [1, 1.1, 0.9, 1],
        rotate: [0, 5, -5, 0],
        duration: 3,
        repeat: Infinity
      },
      resonance: {
        boxShadow: [
          '0 0 0 rgba(59, 130, 246, 0.4)',
          '0 0 20px rgba(59, 130, 246, 0.8)',
          '0 0 0 rgba(59, 130, 246, 0.4)'
        ],
        duration: 2,
        repeat: Infinity
      }
    },
    workspace: {
      morph: {
        borderRadius: ['8px', '16px', '8px'],
        scale: [1, 1.02, 1],
        duration: 4,
        repeat: Infinity
      },
      flow: {
        y: [0, -5, 0],
        opacity: [0.9, 1, 0.9],
        duration: 3,
        repeat: Infinity
      }
    }
  }
};

// ==================== DESIGN SYSTEM CONTEXT ====================

interface DesignSystemContextType {
  theme: 'light' | 'dark' | 'quantum' | 'consciousness';
  consciousnessLevel: number;
  emotionalState: string;
  wisdomScore: number;
  setTheme: (theme: 'light' | 'dark' | 'quantum' | 'consciousness') => void;
  updateConsciousness: (level: number, emotion: string, wisdom: number) => void;
  getQuantumColor: (type: 'superposition' | 'entanglement' | 'consciousness', variant: string) => string;
  getAITransform: (type: 'depth' | 'rotation', level: string) => string;
}

const DesignSystemContext = createContext<DesignSystemContextType | null>(null);

// ==================== DESIGN SYSTEM PROVIDER ====================

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'quantum' | 'consciousness'>('quantum');
  const [consciousnessLevel, setConsciousnessLevel] = useState(0.67);
  const [emotionalState, setEmotionalState] = useState('optimistic');
  const [wisdomScore, setWisdomScore] = useState(0.73);

  // AI-Powered Theme Adaptation
  useEffect(() => {
    const adaptThemeToConsciousness = () => {
      if (consciousnessLevel > 0.8) {
        setTheme('consciousness');
      } else if (consciousnessLevel > 0.5) {
        setTheme('quantum');
      } else {
        setTheme('dark');
      }
    };

    adaptThemeToConsciousness();
  }, [consciousnessLevel]);

    // Quantum Color Generator
  const getQuantumColor = (type: 'superposition' | 'entanglement' | 'consciousness', variant: string): string => {
    const quantumColors = quantumDesignTokens.quantum[type];
    const baseColor = (quantumColors as any)[variant] || quantumDesignTokens.quantum.superposition.primary;

    // Add consciousness-based color modulation
    const consciousnessModulation = Math.sin(Date.now() * 0.001 + consciousnessLevel) * 0.1;
    const emotionalModulation = emotionalState === 'optimistic' ? 0.1 : -0.1;

    return baseColor.replace('0.8', `${0.8 + consciousnessModulation + emotionalModulation}`);
  };

    // AI Transform Generator
  const getAITransform = (type: 'depth' | 'rotation', level: string): string => {
    const transforms = quantumDesignTokens.transforms[type];
    const baseTransform = (transforms as any)[level] || quantumDesignTokens.transforms.depth.medium;

    // Add consciousness-based transform modulation
    const consciousnessModulation = consciousnessLevel * 0.1;
    const wisdomModulation = wisdomScore * 0.05;

    if (type === 'depth') {
      const depthValue = parseInt(baseTransform.match(/\d+/)?.[0] || '0') + consciousnessModulation * 10;
      return `translateZ(${depthValue}px)`;
    } else {
      const rotationValue = parseInt(baseTransform.match(/\d+/)?.[0] || '0') + wisdomModulation * 5;
      return `rotateX(${rotationValue}deg) rotateY(${rotationValue}deg)`;
    }
  };

  const updateConsciousness = (level: number, emotion: string, wisdom: number) => {
    setConsciousnessLevel(level);
    setEmotionalState(emotion);
    setWisdomScore(wisdom);
  };

  const contextValue = useMemo(() => ({
    theme,
    consciousnessLevel,
    emotionalState,
    wisdomScore,
    setTheme,
    updateConsciousness,
    getQuantumColor,
    getAITransform
  }), [theme, consciousnessLevel, emotionalState, wisdomScore]);

  return (
    <DesignSystemContext.Provider value={contextValue}>
      <div className={`design-system-${theme}`}>
        {children}
      </div>
    </DesignSystemContext.Provider>
  );
};

// ==================== DESIGN SYSTEM HOOK ====================

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within DesignSystemProvider');
  }
  return context;
};

// ==================== QUANTUM CONSCIOUSNESS COMPONENT ====================

export const QuantumConsciousnessComponent: React.FC<{
  children: React.ReactNode;
  consciousnessType?: 'superposition' | 'entanglement' | 'awareness';
  intensity?: number;
}> = ({ children, consciousnessType = 'superposition', intensity = 1 }) => {
  const { consciousnessLevel, emotionalState, getQuantumColor, getAITransform } = useDesignSystem();

  const quantumStyle = {
    backgroundColor: getQuantumColor('consciousness', consciousnessType),
    transform: getAITransform('depth', 'medium'),
    boxShadow: `0 0 ${20 * intensity}px ${getQuantumColor('superposition', 'primary')}`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${getQuantumColor('entanglement', 'user')}`
  };

  return (
    <motion.div
      style={quantumStyle}
      animate={{
        scale: [1, 1 + intensity * 0.05, 1],
        opacity: [0.8, 1, 0.8],
        rotate: [0, intensity * 2, 0]
      }}
      transition={{
        duration: 3 + consciousnessLevel * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="quantum-consciousness-component"
    >
      {children}
    </motion.div>
  );
};

// ==================== AI-POWERED WORKSPACE COMPONENT ====================

export const AIWorkspaceComponent: React.FC<{
  children: React.ReactNode;
  workspaceType?: 'flow' | 'focus' | 'creative' | 'analytical';
  adaptiveLevel?: number;
}> = ({ children, workspaceType = 'flow', adaptiveLevel = 0.5 }) => {
  const { consciousnessLevel, getAITransform } = useDesignSystem();

  const workspaceAnimations = {
    flow: {
      y: [0, -10 * adaptiveLevel, 0],
      x: [0, 5 * adaptiveLevel, 0],
      scale: [1, 1 + adaptiveLevel * 0.02, 1]
    },
    focus: {
      scale: [1, 1 + adaptiveLevel * 0.05, 1],
      opacity: [0.9, 1, 0.9],
      filter: ['blur(0px)', 'blur(0px)', 'blur(0px)']
    },
    creative: {
      rotate: [0, adaptiveLevel * 5, -adaptiveLevel * 5, 0],
      scale: [1, 1 + adaptiveLevel * 0.03, 1],
      borderRadius: ['8px', '16px', '8px']
    },
    analytical: {
      scale: [1, 1 + adaptiveLevel * 0.01, 1],
      opacity: [0.95, 1, 0.95],
      y: [0, -5 * adaptiveLevel, 0]
    }
  };

  return (
    <motion.div
      style={{
        transform: getAITransform('depth', 'shallow'),
        perspective: quantumDesignTokens.transforms.perspective
      }}
      animate={workspaceAnimations[workspaceType]}
      transition={{
        duration: 4 + consciousnessLevel * 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`ai-workspace-${workspaceType}`}
    >
      {children}
    </motion.div>
  );
};

// ==================== REVOLUTIONARY BUTTON COMPONENT ====================

export const RevolutionaryButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'quantum' | 'consciousness';
  size?: 'small' | 'medium' | 'large';
  consciousnessEffect?: boolean;
  onClick?: () => void;
}> = ({
  children,
  variant = 'quantum',
  size = 'medium',
  consciousnessEffect = true,
  onClick
}) => {
  const { consciousnessLevel, emotionalState, getQuantumColor } = useDesignSystem();

  const buttonVariants = {
    primary: {
      backgroundColor: colors.primary[600],
      color: colors.neutral[50],
      border: `2px solid ${colors.primary[500]}`
    },
    secondary: {
      backgroundColor: colors.secondary[600],
      color: colors.neutral[50],
      border: `2px solid ${colors.secondary[500]}`
    },
    quantum: {
      backgroundColor: getQuantumColor('superposition', 'primary'),
      color: colors.neutral[50],
      border: `2px solid ${getQuantumColor('entanglement', 'user')}`,
      boxShadow: `0 0 20px ${getQuantumColor('superposition', 'primary')}`
    },
    consciousness: {
      backgroundColor: getQuantumColor('consciousness', 'awareness'),
      color: colors.neutral[50],
      border: `2px solid ${getQuantumColor('consciousness', 'wisdom')}`,
      boxShadow: `0 0 30px ${getQuantumColor('consciousness', 'emotion')}`
    }
  };

  const sizeVariants = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' }
  };

  return (
    <motion.button
      style={{
        ...buttonVariants[variant],
        ...sizeVariants[size],
        borderRadius: '12px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 30px ${getQuantumColor('superposition', 'primary')}`
      }}
      whileTap={{ scale: 0.95 }}
      animate={consciousnessEffect ? {
        boxShadow: [
          `0 0 20px ${getQuantumColor('superposition', 'primary')}`,
          `0 0 40px ${getQuantumColor('superposition', 'primary')}`,
          `0 0 20px ${getQuantumColor('superposition', 'primary')}`
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: consciousnessEffect ? Infinity : 0
      }}
      onClick={onClick}
      className={`revolutionary-button ${variant} ${size}`}
    >
      {consciousnessEffect && (
        <motion.div
          className="consciousness-ripple"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle, ${getQuantumColor('consciousness', 'creativity')} 0%, transparent 70%)`,
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0, 1, 2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: consciousnessLevel * 2
          }}
        />
      )}
      {children}
    </motion.button>
  );
};

// ==================== EXPORTS ====================

export { quantumDesignTokens as designTokens };
export type { DesignSystemContextType };
