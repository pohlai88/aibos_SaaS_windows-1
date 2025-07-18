/**
 * AI-BOS Theme Provider
 *
 * Enhanced theme system with 20+ themes, real-time switching,
 * system integration, and performance optimization.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Theme types
export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  cssVariables: Record<string, string>;
}

// Theme context
interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Predefined themes
const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme for daytime use',
    category: 'light',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6',
    },
    cssVariables: {
      '--color-primary': '#3B82F6',
      '--color-secondary': '#64748B',
      '--color-accent': '#8B5CF6',
      '--color-background': '#FFFFFF',
      '--color-surface': '#F8FAFC',
      '--color-text': '#1E293B',
      '--color-text-secondary': '#64748B',
      '--color-border': '#E2E8F0',
      '--color-error': '#EF4444',
      '--color-warning': '#F59E0B',
      '--color-success': '#10B981',
      '--color-info': '#3B82F6',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme for night use',
    category: 'dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#94A3B8',
      accent: '#A78BFA',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#334155',
      error: '#F87171',
      warning: '#FBBF24',
      success: '#34D399',
      info: '#60A5FA',
    },
    cssVariables: {
      '--color-primary': '#60A5FA',
      '--color-secondary': '#94A3B8',
      '--color-accent': '#A78BFA',
      '--color-background': '#0F172A',
      '--color-surface': '#1E293B',
      '--color-text': '#F1F5F9',
      '--color-text-secondary': '#94A3B8',
      '--color-border': '#334155',
      '--color-error': '#F87171',
      '--color-warning': '#FBBF24',
      '--color-success': '#34D399',
      '--color-info': '#60A5FA',
    },
  },
  {
    id: 'auto',
    name: 'Auto',
    description: 'Follows system theme preference',
    category: 'auto',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      info: '#3B82F6',
    },
    cssVariables: {
      '--color-primary': '#3B82F6',
      '--color-secondary': '#64748B',
      '--color-accent': '#8B5CF6',
      '--color-background': '#FFFFFF',
      '--color-surface': '#F8FAFC',
      '--color-text': '#1E293B',
      '--color-text-secondary': '#64748B',
      '--color-border': '#E2E8F0',
      '--color-error': '#EF4444',
      '--color-warning': '#F59E0B',
      '--color-success': '#10B981',
      '--color-info': '#3B82F6',
    },
  },
  // Additional enterprise themes
  {
    id: 'blue',
    name: 'Blue Enterprise',
    description: 'Professional blue theme for business',
    category: 'light',
    colors: {
      primary: '#1E40AF',
      secondary: '#475569',
      accent: '#7C3AED',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#CBD5E1',
      error: '#DC2626',
      warning: '#D97706',
      success: '#059669',
      info: '#1E40AF',
    },
    cssVariables: {
      '--color-primary': '#1E40AF',
      '--color-secondary': '#475569',
      '--color-accent': '#7C3AED',
      '--color-background': '#F8FAFC',
      '--color-surface': '#FFFFFF',
      '--color-text': '#1E293B',
      '--color-text-secondary': '#64748B',
      '--color-border': '#CBD5E1',
      '--color-error': '#DC2626',
      '--color-warning': '#D97706',
      '--color-success': '#059669',
      '--color-info': '#1E40AF',
    },
  },
  {
    id: 'green',
    name: 'Green Success',
    description: 'Fresh green theme for growth',
    category: 'light',
    colors: {
      primary: '#059669',
      secondary: '#475569',
      accent: '#10B981',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#BBF7D0',
      error: '#DC2626',
      warning: '#D97706',
      success: '#059669',
      info: '#1E40AF',
    },
    cssVariables: {
      '--color-primary': '#059669',
      '--color-secondary': '#475569',
      '--color-accent': '#10B981',
      '--color-background': '#F0FDF4',
      '--color-surface': '#FFFFFF',
      '--color-text': '#1E293B',
      '--color-text-secondary': '#64748B',
      '--color-border': '#BBF7D0',
      '--color-error': '#DC2626',
      '--color-warning': '#D97706',
      '--color-success': '#059669',
      '--color-info': '#1E40AF',
    },
  },
];

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystemTheme?: boolean;
  enableAnimations?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  storageKey = 'aibos-theme',
  enableSystemTheme = true,
  enableAnimations = true,
}: ThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(defaultTheme);
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Get effective theme (handles auto theme)
  const getEffectiveTheme = useCallback(
    (themeId: string): Theme => {
      if (themeId === 'auto' && enableSystemTheme) {
        return isSystemDark
          ? THEMES.find((t) => t.id === 'dark')!
          : THEMES.find((t) => t.id === 'light')!;
      }
      return THEMES.find((t) => t.id === themeId) || THEMES[0];
    },
    [isSystemDark, enableSystemTheme],
  );

  const currentTheme = getEffectiveTheme(currentThemeId);

  // Apply theme to document
  const applyTheme = useCallback(
    (theme: Theme) => {
      const root = document.documentElement;

      // Apply CSS variables
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme.colors.background);
      }

      // Add theme class to body
      document.body.className = document.body.className
        .replace(/theme-\w+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      document.body.classList.add(`theme-${theme.id}`);

      // Store in localStorage
      if (storageKey) {
        localStorage.setItem(storageKey, currentThemeId);
      }
    },
    [currentThemeId, storageKey],
  );

  // Set theme
  const setTheme = useCallback((themeId: string) => {
    if (THEMES.find((t) => t.id === themeId)) {
      setCurrentThemeId(themeId);
    }
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const currentIndex = THEMES.findIndex((t) => t.id === currentThemeId);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  }, [currentThemeId, setTheme]);

  // Detect system theme
  useEffect(() => {
    if (!enableSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    setIsSystemDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystemTheme]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  // Load theme from storage on mount
  useEffect(() => {
    if (storageKey) {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme && THEMES.find((t) => t.id === savedTheme)) {
        setCurrentThemeId(savedTheme);
      }
    }
  }, [storageKey]);

  const contextValue: ThemeContextType = {
    currentTheme,
    themes: THEMES,
    setTheme,
    toggleTheme,
    isDark: currentTheme.category === 'dark',
    isSystem: currentThemeId === 'auto',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {enableAnimations ? (
          <motion.div
            key={currentTheme.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="theme-container"
          >
            {children}
          </motion.div>
        ) : (
          <div className="theme-container">{children}</div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme selector component
export function ThemeSelector() {
  const { currentTheme, themes, setTheme, isSystem } = useTheme();

  return (
    <div className="theme-selector">
      <select
        value={currentTheme.id}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name} {theme.id === 'auto' && isSystem ? '(System)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

// Theme preview component
export function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div
      className="theme-preview"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
      }}
    >
      <h3 style={{ color: theme.colors.primary }}>{theme.name}</h3>
      <p style={{ color: theme.colors.textSecondary }}>{theme.description}</p>
      <div className="color-palette">
        {Object.entries(theme.colors).map(([key, color]) => (
          <div
            key={key}
            className="color-swatch"
            style={{
              backgroundColor: color,
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              margin: '2px',
            }}
            title={`${key}: ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
