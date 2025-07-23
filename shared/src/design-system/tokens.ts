/**
 * AI-BOS Design System Tokens
 *
 * World-class design tokens for consistent theming across the platform.
 * These tokens serve as the single source of truth for all design decisions.
 *
 * @version 1.0.0
 * @author AI-BOS Team
 */

// ==================== COLOR SYSTEM ====================

export const colors = {
  // Primary Colors - Blue-based palette
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

  // Secondary Colors - Green-based palette
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

  // Neutral Colors - Gray-based palette
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
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  // AI-Specific Colors
  ai: {
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63'
    },
    magenta: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75'
    }
  },

  // Dark Mode Colors
  dark: {
    background: '#0a0a0a',
    surface: '#171717',
    surfaceHover: '#262626',
    border: '#404040',
    text: '#fafafa',
    textSecondary: '#a3a3a3',
    textMuted: '#737373'
  },

  // Light Mode Colors
  light: {
    background: '#ffffff',
    surface: '#fafafa',
    surfaceHover: '#f5f5f5',
    border: '#e5e5e5',
    text: '#171717',
    textSecondary: '#525252',
    textMuted: '#737373'
  }
} as const;

// ==================== SPACING SYSTEM ====================

export const spacing = {
  // Base spacing units (4px grid system)
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',

  // Semantic spacing
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  '5xl': '128px',
  '6xl': '192px',

  // Component-specific spacing
  button: {
    padding: '12px 24px',
    paddingSmall: '8px 16px',
    paddingLarge: '16px 32px'
  },
  input: {
    padding: '12px 16px',
    paddingSmall: '8px 12px',
    paddingLarge: '16px 20px'
  },
  card: {
    padding: '24px',
    paddingSmall: '16px',
    paddingLarge: '32px'
  }
} as const;

// ==================== TYPOGRAPHY SYSTEM ====================

export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ].join(', '),
    mono: [
      'JetBrains Mono',
      'Fira Code',
      'Consolas',
      'Monaco',
      'Andale Mono',
      'Ubuntu Mono',
      'monospace'
    ].join(', '),
    serif: [
      'Georgia',
      'Times New Roman',
      'serif'
    ].join(', '),
    display: [
      'Poppins',
      'Inter',
      'system-ui',
      'sans-serif'
    ].join(', ')
  },

  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px'
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Text styles
  textStyles: {
    display: {
      fontFamily: 'display',
      fontSize: '4xl',
      fontWeight: 'bold',
      lineHeight: 'tight',
      letterSpacing: 'tight'
    },
    heading: {
      fontFamily: 'sans',
      fontSize: '2xl',
      fontWeight: 'semibold',
      lineHeight: 'tight'
    },
    body: {
      fontFamily: 'sans',
      fontSize: 'base',
      fontWeight: 'normal',
      lineHeight: 'relaxed'
    },
    caption: {
      fontFamily: 'sans',
      fontSize: 'sm',
      fontWeight: 'normal',
      lineHeight: 'normal'
    },
    code: {
      fontFamily: 'mono',
      fontSize: 'sm',
      fontWeight: 'normal',
      lineHeight: 'normal'
    }
  }
} as const;

// ==================== BORDER RADIUS SYSTEM ====================

export const borderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
} as const;

// ==================== SHADOW SYSTEM ====================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',

  // Colored shadows
  primary: '0 4px 14px 0 rgb(59 130 246 / 0.25)',
  success: '0 4px 14px 0 rgb(34 197 94 / 0.25)',
  warning: '0 4px 14px 0 rgb(245 158 11 / 0.25)',
  error: '0 4px 14px 0 rgb(239 68 68 / 0.25)',

  // AI-specific shadows
  ai: {
    purple: '0 4px 14px 0 rgb(168 85 247 / 0.25)',
    cyan: '0 4px 14px 0 rgb(6 182 212 / 0.25)',
    magenta: '0 4px 14px 0 rgb(217 70 239 / 0.25)'
  }
} as const;

// ==================== ANIMATION SYSTEM ====================

export const animations = {
  // Duration
  duration: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms'
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },

  // Keyframes
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' }
    },
    slideInUp: {
      '0%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(0)' }
    },
    slideInDown: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(0)' }
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' }
    },
    slideInRight: {
      '0%': { transform: 'translateX(100%)' },
      '100%': { transform: 'translateX(0)' }
    },
    scaleIn: {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    },
    scaleOut: {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.9)', opacity: '0' }
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-25%)' },
      '50%': { transform: 'translateY(0)' }
    },
    shimmer: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' }
    },
    glow: {
      '0%, 100%': { boxShadow: '0 0 5px currentColor' },
      '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
    }
  },

  // Animation presets
  presets: {
    fadeIn: {
      animation: 'fadeIn 200ms ease-out'
    },
    slideUp: {
      animation: 'slideInUp 300ms ease-out'
    },
    scaleIn: {
      animation: 'scaleIn 200ms ease-out'
    },
    spin: {
      animation: 'spin 1s linear infinite'
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    shimmer: {
      animation: 'shimmer 2s infinite'
    }
  }
} as const;

// ==================== Z-INDEX SYSTEM ====================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  notification: 1900,
  max: 9999
} as const;

// ==================== BREAKPOINT SYSTEM ====================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px'
} as const;

// ==================== BORDER SYSTEM ====================

export const borders = {
  width: {
    none: '0px',
    thin: '1px',
    base: '2px',
    thick: '4px'
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double'
  }
} as const;

// ==================== EXPORT ALL TOKENS ====================

export const designTokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animations,
  zIndex,
  breakpoints,
  borders
} as const;

// ==================== TYPE EXPORTS ====================

export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof colors;
export type SpacingTokens = typeof spacing;
export type TypographyTokens = typeof typography;
export type BorderRadiusTokens = typeof borderRadius;
export type ShadowTokens = typeof shadows;
export type AnimationTokens = typeof animations;
export type ZIndexTokens = typeof zIndex;
export type BreakpointTokens = typeof breakpoints;
export type BorderTokens = typeof borders;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get a color value with opacity
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

/**
 * Get a spacing value as a number
 */
export const getSpacingAsNumber = (spacingValue: string): number => {
  return parseInt(spacingValue.replace('px', ''), 10);
};

/**
 * Convert pixels to rem
 */
export const pxToRem = (px: number): string => {
  return `${px / 16}rem`;
};

/**
 * Convert rem to pixels
 */
export const remToPx = (rem: number): number => {
  return rem * 16;
};
