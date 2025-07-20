import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface Theme {
  id: string;
  name: string;
  description: string;
  variables: ThemeVariables;
  metadata: ThemeMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date
}

interface ThemeVariables {
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
  borderRadius: BorderRadiusSettings;
  shadows: ShadowSettings;
  animations: AnimationSettings
}

interface ColorPalette {
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
  info: string
}

interface TypographySettings {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string
};
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number
};
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number
}
}

interface SpacingSettings {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string
}

interface BorderRadiusSettings {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string
}

interface ShadowSettings {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string
}

interface AnimationSettings {
  duration: {
    fast: string;
    normal: string;
    slow: string
};
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string
}
}

interface ThemeMetadata {
  author: string;
  version: string;
  tags: string[];
  compatibility: string[];
  preview?: string
}

interface ThemeContextType {
  // Theme management
  themes: Theme[];
  activeTheme: Theme | null;
  createTheme: (theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTheme: (id: string,
  updates: Partial<Theme>) => void;
  deleteTheme: (id: string) => void;
  activateTheme: (id: string) => void;

  // Runtime customization
  updateVariable: (path: string,
  value: any) => void;
  getVariable: (path: string) => any;
  exportTheme: (id: string) => string;
  importTheme: (themeData: string) => string;

  // AI-powered features
  generateTheme: (prompt: string) => Promise<Theme>;
  suggestImprovements: (themeId: string) => Promise<string[]>;
  autoOptimize: (themeId: string) => Promise<void>;

  // Storage
  saveToStorage: (key: string) => void;
  loadFromStorage: (key: string) => void;
  saveToTenant: (tenantId: string) => void;
  loadFromTenant: (tenantId: string) => void
}

// Default theme
const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Default Theme',
  description: 'AI-BOS default theme with modern design',
  variables: {
    colors: {
      primary: '#007bff',
  secondary: '#6c757d',
      accent: '#17a2b8',
  background: '#ffffff',
      surface: '#f8f9fa',
  text: '#212529',
      textSecondary: '#6c757d',
  border: '#dee2e6',
      error: '#dc3545',
  warning: '#ffc107',
      success: '#28a745',
  info: '#17a2b8'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
        xs: '0.75rem',
  sm: '0.875rem',
        base: '1rem',
  lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        light: 300,
  normal: 400,
        medium: 500,
  semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
  sm: '0.5rem',
      md: '1rem',
  lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
  sm: '0.125rem',
      md: '0.25rem',
  lg: '0.5rem',
      xl: '0.75rem',
  full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    animations: {
      duration: {
        fast: '150ms',
  normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
  ease: 'ease',
        easeIn: 'ease-in',
  easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    }
  },
  metadata: {
    author: 'AI-BOS Team',
  version: '1.0.0',
    tags: ['default', 'modern', 'clean'],
    compatibility: ['react', 'typescript']
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// AI-powered theme generator
class AIThemeGenerator {
  private static instance: AIThemeGenerator;

  static getInstance(): AIThemeGenerator {
    if (!AIThemeGenerator.instance) {
      AIThemeGenerator.instance = new AIThemeGenerator()
}
    return AIThemeGenerator.instance
}

  async generateTheme(prompt: string): Promise<Theme> {
    // Simulate AI theme generation
    const themeId = `ai-generated-${Date.now()}`;

    // Parse prompt for theme characteristics
    const characteristics = this.parsePrompt(prompt);

    const theme: Theme = {
      id: themeId,
  name: `AI Generated - ${prompt.substring(0, 30)}...`,
      description: `AI-generated theme based on: ${prompt}`,
      variables: this.generateVariables(characteristics),
      metadata: {
        author: 'AI-BOS AI',
  version: '1.0.0',
        tags: characteristics.tags,
        compatibility: ['react', 'typescript']
      },
      isActive: false,
  createdAt: new Date(),
      updatedAt: new Date()
    };

    return theme
}

  private parsePrompt(prompt: string): {
    style: string;
    mood: string;
    colors: string[];
    tags: string[]
} {
    const lowerPrompt = prompt.toLowerCase();

    // Extract style
    let style = 'modern';
    if (lowerPrompt.includes('classic')) style = 'classic';
    if (lowerPrompt.includes('minimal')) style = 'minimal';
    if (lowerPrompt.includes('bold')) style = 'bold';
    if (lowerPrompt.includes('soft')) style = 'soft';

    // Extract mood
    let mood = 'professional';
    if (lowerPrompt.includes('playful')) mood = 'playful';
    if (lowerPrompt.includes('serious')) mood = 'serious';
    if (lowerPrompt.includes('friendly')) mood = 'friendly';

    // Extract colors
    const colors: string[] = [];
    const colorKeywords = ['blue', 'green', 'red', 'purple', 'orange', 'pink', 'yellow', 'gray'];
    colorKeywords.forEach(color => {
      if (lowerPrompt.includes(color)) colors.push(color)
});

    // Generate tags
    const tags = [style, mood, ...colors];

    return { style, mood, colors, tags }
}

  private generateVariables(characteristics: any): ThemeVariables {
    const baseTheme = DEFAULT_THEME.variables;

    // Modify colors based on characteristics
    const colors = { ...baseTheme.colors };
    if (characteristics.colors.includes('blue')) {
      colors.primary = '#3b82f6';
      colors.accent = '#1d4ed8'
}
    if (characteristics.colors.includes('green')) {
      colors.primary = '#10b981';
      colors.accent = '#059669'
}
    if (characteristics.colors.includes('purple')) {
      colors.primary = '#8b5cf6';
      colors.accent = '#7c3aed'
}

    // Modify style based on characteristics
    if (characteristics.style === 'minimal') {
      colors.background = '#ffffff';
      colors.surface = '#ffffff';
      colors.border = '#e5e7eb'
}

    if (characteristics.style === 'bold') {
      colors.primary = '#000000';
      colors.text = '#000000';
      colors.background = '#ffffff'
}

    return {
      ...baseTheme,
      colors
    }
}

  async suggestImprovements(theme: Theme): Promise<string[]> {
    const suggestions: string[] = [];

    // Analyze theme and suggest improvements
    const colors = theme.variables.colors;

    // Check contrast ratios
    if (this.calculateContrast(colors.primary, colors.background) < 4.5) {
      suggestions.push('Consider increasing primary color contrast for better accessibility')
}

    if (this.calculateContrast(colors.text, colors.background) < 7) {
      suggestions.push('Text contrast could be improved for better readability')
}

    // Check color harmony
    if (colors.primary === colors.secondary) {
      suggestions.push('Primary and secondary colors are too similar - consider different hues')
}

    // Check for accessibility
    if (colors.error === colors.warning) {
      suggestions.push('Error and warning colors should be distinct for better UX')
}

    return suggestions
}

  private calculateContrast(color1: string,
  color2: string): number {
    // Simplified contrast calculation
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const luminance1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
    const luminance2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05)
}
}

// Context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Provider Component
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
  enableAI?: boolean;
  enableStorage?: boolean;
  tenantId?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
  enableAI = true,
  enableStorage = true,
  tenantId
}) => {
  const [themes, setThemes] = useState<Theme[]>([initialTheme || DEFAULT_THEME]);
  const [activeTheme, setActiveTheme] = useState<Theme>(initialTheme || DEFAULT_THEME);
  const aiGenerator = useRef(AIThemeGenerator.getInstance());
  const styleElement = useRef<HTMLStyleElement | null>(null);

  // Initialize style element for dynamic CSS
  useEffect(() => {
    if (!styleElement.current) {
      styleElement.current = document.createElement('style');
      styleElement.current.id = 'aibos-theme-styles';
      document.head.appendChild(styleElement.current)
}
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    if (styleElement.current && activeTheme) {
      const css = generateCSSVariables(activeTheme);
      styleElement.current.textContent = css
}
  }, [activeTheme]);

  const createTheme = (themeData: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const theme: Theme = {
      ...themeData,
      id: `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setThemes(prev => [...prev, theme]);
    auditLogger.info('Theme created', { themeId: theme.id, themeName: theme.name });

    return theme.id
};

  const updateTheme = (id: string,
  updates: Partial<Theme>) => {
    setThemes(prev => prev.map(theme =>
      theme.id === id
        ? { ...theme, ...updates, updatedAt: new Date() }
        : theme
    ));

    if (activeTheme?.id === id) {
      setActiveTheme(prev => ({ ...prev!, ...updates, updatedAt: new Date() }))
}

    auditLogger.info('Theme updated', { themeId: id, updates })
};

  const deleteTheme = (id: string) => {
    if (id === DEFAULT_THEME.id) {
      throw new Error('Cannot delete default theme')
}

    setThemes(prev => prev.filter(theme => theme.id !== id));

    if (activeTheme?.id === id) {
      setActiveTheme(DEFAULT_THEME)
}

    auditLogger.info('Theme deleted', { themeId: id })
};

  const activateTheme = (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) {
      throw new Error(`Theme with id ${id} not found`)
}

    setActiveTheme(theme);
    setThemes(prev => prev.map(t => ({ ...t, isActive: t.id === id })));

    auditLogger.info('Theme activated', { themeId: id,
  themeName: theme.name })
};

  const updateVariable = (path: string,
  value: any) => {
    if (!activeTheme) return;

    const pathParts = path.split('.');
    const newTheme = { ...activeTheme };
    let current: any = newTheme.variables;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
}

    current[pathParts[pathParts.length - 1]] = value;
    newTheme.updatedAt = new Date();

    setActiveTheme(newTheme);
    setThemes(prev => prev.map(t => t.id === newTheme.id ? newTheme : t))
};

  const getVariable = (path: string): any => {
    if (!activeTheme) return null;

    const pathParts = path.split('.');
    let current: any = activeTheme.variables;

    for (const part of pathParts) {
      if (current[part] === undefined) return null;
      current = current[part]
}

    return current
};

  const exportTheme = (id: string): string => {
    const theme = themes.find(t => t.id === id);
    if (!theme) throw new Error(`Theme with id ${id} not found`);

    return JSON.stringify(theme, null, 2)
};

  const importTheme = (themeData: string): string => {
    try {
      const theme: Theme = JSON.parse(themeData);
      theme.id = `imported-${Date.now()}`;
      theme.isActive = false;
      theme.createdAt = new Date();
      theme.updatedAt = new Date();

      setThemes(prev => [...prev, theme]);
      auditLogger.info('Theme imported', { themeId: theme.id, themeName: theme.name });

      return theme.id
} catch (error) {
      throw new Error('Invalid theme data format')
}
  };

  const generateTheme = async (prompt: string): Promise<Theme> => {
    if (!enableAI) {
      throw new Error('AI theme generation is disabled')
}

    const theme = await aiGenerator.current.generateTheme(prompt);
    setThemes(prev => [...prev, theme]);

    auditLogger.info('AI theme generated', { themeId: theme.id, prompt });

    return theme
};

  const suggestImprovements = async (themeId: string): Promise<string[]> => {
    if (!enableAI) {
      throw new Error('AI suggestions are disabled')
}

    const theme = themes.find(t => t.id === themeId);
    if (!theme) throw new Error(`Theme with id ${themeId} not found`);

    return await aiGenerator.current.suggestImprovements(theme)
};

  const autoOptimize = async (themeId: string): Promise<void> => {
    if (!enableAI) {
      throw new Error('AI optimization is disabled')
}

    const suggestions = await suggestImprovements(themeId);

    // Apply automatic optimizations
    suggestions.forEach(suggestion => {
      if (suggestion.includes('contrast')) {
        updateVariable('colors.primary', '#1a365d')
}
    })
};

  const saveToStorage = (key: string) => {
    if (!enableStorage) return;

    const data = {
      themes,
      activeThemeId: activeTheme?.id
    };

    localStorage.setItem(`aibos-themes-${key}`, JSON.stringify(data));
    auditLogger.info('Themes saved to storage', { key })
};

  const loadFromStorage = (key: string) => {
    if (!enableStorage) return;

    const data = localStorage.getItem(`aibos-themes-${key}`);
    if (data) {
      const parsed = JSON.parse(data);
      setThemes(parsed.themes);
      if (parsed.activeThemeId) {
        const theme = parsed.themes.find((t: Theme) => t.id === parsed.activeThemeId);
        if (theme) setActiveTheme(theme)
}
      auditLogger.info('Themes loaded from storage', { key })
}
  };

  const saveToTenant = (tenantId: string) => {
    if (!tenantId) return;
    saveToStorage(`tenant-${tenantId}`)
};

  const loadFromTenant = (tenantId: string) => {
    if (!tenantId) return;
    loadFromStorage(`tenant-${tenantId}`)
};

  const value: ThemeContextType = {
    themes,
    activeTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    activateTheme,
    updateVariable,
    getVariable,
    exportTheme,
    importTheme,
    generateTheme,
    suggestImprovements,
    autoOptimize,
    saveToStorage,
    loadFromStorage,
    saveToTenant,
    loadFromTenant
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
};

// Generate CSS variables from theme
function generateCSSVariables(theme: Theme): string {
  const variables: string[] = [];

  // Colors
  Object.entries(theme.variables.colors).forEach(([key, value]) => {
    variables.push(`--color-${key}: ${value};`)
});

  // Typography
  variables.push(`--font-family: ${theme.variables.typography.fontFamily};`);
  Object.entries(theme.variables.typography.fontSize).forEach(([key, value]) => {
    variables.push(`--font-size-${key}: ${value};`)
});
  Object.entries(theme.variables.typography.fontWeight).forEach(([key, value]) => {
    variables.push(`--font-weight-${key}: ${value};`)
});
  Object.entries(theme.variables.typography.lineHeight).forEach(([key, value]) => {
    variables.push(`--line-height-${key}: ${value};`)
});

  // Spacing
  Object.entries(theme.variables.spacing).forEach(([key, value]) => {
    variables.push(`--spacing-${key}: ${value};`)
});

  // Border radius
  Object.entries(theme.variables.borderRadius).forEach(([key, value]) => {
    variables.push(`--border-radius-${key}: ${value};`)
});

  // Shadows
  Object.entries(theme.variables.shadows).forEach(([key, value]) => {
    variables.push(`--shadow-${key}: ${value};`)
});

  // Animations
  Object.entries(theme.variables.animations.duration).forEach(([key, value]) => {
    variables.push(`--animation-duration-${key}: ${value};`)
});
  Object.entries(theme.variables.animations.easing).forEach(([key, value]) => {
    variables.push(`--animation-easing-${key}: ${value};`)
});

  return `:root {\n  ${variables.join('\n  ')}\n}`
}

// Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
}
  return context
};

// HOC for themed components
export const withTheme = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    themeProps?: string[];
    enableDynamicStyling?: boolean
} = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { activeTheme, getVariable } = useTheme();

    const themedProps = { ...props };

    if (options.enableDynamicStyling) {
      // Apply theme variables to component props
      options.themeProps?.forEach(prop => {
        const value = getVariable(prop);
        if (value) {
          themedProps[prop as keyof P] = value as any
}
      })
}

    return <Component {...themedProps} />
};

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Theme Editor Component
export const ThemeEditor: React.FC<{ themeId?: string }> = ({ themeId }) => {
  const {
    themes,
    activeTheme,
    updateVariable,
    getVariable,
    generateTheme,
    suggestImprovements,
    autoOptimize
  } = useTheme();

  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTheme = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      await generateTheme(prompt);
      setPrompt('')
} catch (error) {
      console.error('Failed to generate theme:', error)
} finally {
      setIsGenerating(false)
}
  };

  const handleGetSuggestions = async () => {
    if (!activeTheme) return;

    try {
      const themeSuggestions = await suggestImprovements(activeTheme.id);
      setSuggestions(themeSuggestions)
} catch (error) {
      console.error('Failed to get suggestions:', error)
}
  };

  const handleAutoOptimize = async () => {
    if (!activeTheme) return;

    try {
      await autoOptimize(activeTheme.id)
} catch (error) {
      console.error('Failed to auto-optimize:', error)
}
  };

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '500px'
    }}>
      <h3>🎨 Theme Editor</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>AI Theme Generation</h4>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your theme (e.g., 'modern blue theme with soft shadows')"
          style={{
            width: '100%',
  padding: '8px',
            marginBottom: '10px',
  background: '#333',
            color: '#fff',
  border: '1px solid #555',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={handleGenerateTheme}
          disabled={isGenerating}
          style={{
            background: '#007bff',
  color: '#fff',
            border: 'none',
  padding: '8px 16px',
            borderRadius: '4px',
  cursor: isGenerating ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Theme'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Theme Optimization</h4>
        <button
          onClick={handleGetSuggestions}
          style={{
            background: '#28a745',
  color: '#fff',
            border: 'none',
  padding: '8px 16px',
            borderRadius: '4px',
  marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Get Suggestions
        </button>
        <button
          onClick={handleAutoOptimize}
          style={{
            background: '#ffc107',
  color: '#000',
            border: 'none',
  padding: '8px 16px',
            borderRadius: '4px',
  cursor: 'pointer'
          }}
        >
          Auto Optimize
        </button>
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>AI Suggestions</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4>Available Themes</h4>
        <div style={{ maxHeight: '200px',
  overflowY: 'auto' }}>
          {themes.map(theme => (
            <div
              key={theme.id}
              style={{
                padding: '8px',
  background: theme.isActive ? '#007bff' : '#333',
                marginBottom: '4px',
  borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {theme.name} {theme.isActive && '(Active)'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};
