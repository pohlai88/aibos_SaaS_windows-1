import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Nested theme context
interface NestedThemeContextType {
  currentTheme: Theme;
  parentTheme?: Theme;
  setTheme: (themeId: string) => void;
  isNested: boolean;
  themePath: string[];
}

const NestedThemeContext = createContext<NestedThemeContextType | undefined>(undefined);

// Theme interface
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
  cssCustomProperties?: Record<string, string>;
}

// Nested theme provider props
interface NestedThemeProviderProps {
  children: ReactNode;
  theme: Theme;
  parentTheme?: Theme;
  scope?: string;
  className?: string;
  enableIsolation?: boolean;
  enableAnimations?: boolean;
  onThemeChange?: (theme: Theme) => void;
}

// CSS variable scoping utility
const createScopedCSSVariables = (theme: Theme, scope: string): string => {
  const variables = Object.entries(theme.cssVariables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');

  return `
    [data-theme-scope="${scope}"] {
      ${variables}
    }
  `;
};

// Nested theme provider component
export const NestedThemeProvider: React.FC<NestedThemeProviderProps> = ({
  children,
  theme,
  parentTheme,
  scope = 'default',
  className = '',
  enableIsolation = true,
  enableAnimations = true,
  onThemeChange,
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);
  const [isNested, setIsNested] = useState(false);
  const [themePath, setThemePath] = useState<string[]>([]);
  const parentContext = useContext(NestedThemeContext);

  // Determine if this is a nested theme
  useEffect(() => {
    setIsNested(!!parentContext);
    setThemePath(parentContext ? [...parentContext.themePath, scope] : [scope]);
  }, [parentContext, scope]);

  // Apply theme to scope
  const applyTheme = useCallback(
    (themeToApply: Theme) => {
      if (!enableIsolation) return;

      // Remove existing style tag for this scope
      const existingStyle = document.getElementById(`theme-scope-${scope}`);
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag with scoped CSS variables
      const style = document.createElement('style');
      style.id = `theme-scope-${scope}`;
      style.textContent = createScopedCSSVariables(themeToApply, scope);
      document.head.appendChild(style);

      // Update meta theme-color for this scope
      const metaThemeColor = document.querySelector(`meta[name="theme-color-${scope}"]`);
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeToApply.colors.background);
      }
    },
    [scope, enableIsolation],
  );

  // Set theme
  const setTheme = useCallback(
    (themeId: string) => {
      // In a real implementation, you'd look up the theme by ID
      // For now, we'll just update the current theme
      const newTheme = { ...currentTheme, id: themeId };
      setCurrentTheme(newTheme);
      onThemeChange?.(newTheme);
    },
    [currentTheme, onThemeChange],
  );

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableIsolation) {
        const style = document.getElementById(`theme-scope-${scope}`);
        if (style) {
          style.remove();
        }
      }
    };
  }, [scope, enableIsolation]);

  const contextValue: NestedThemeContextType = {
    currentTheme,
    parentTheme,
    setTheme,
    isNested,
    themePath,
  };

  const containerClassName = `theme-scope-${scope} ${className}`.trim();

  return (
    <NestedThemeContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {enableAnimations ? (
          <motion.div
            key={currentTheme.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={containerClassName}
            data-theme-scope={scope}
            data-theme-id={currentTheme.id}
            data-theme-category={currentTheme.category}
            data-is-nested={isNested}
          >
            {children}
          </motion.div>
        ) : (
          <div
            className={containerClassName}
            data-theme-scope={scope}
            data-theme-id={currentTheme.id}
            data-theme-category={currentTheme.category}
            data-is-nested={isNested}
          >
            {children}
          </div>
        )}
      </AnimatePresence>
    </NestedThemeContext.Provider>
  );
};

// Hook to use nested theme
export const useNestedTheme = () => {
  const context = useContext(NestedThemeContext);
  if (context === undefined) {
    throw new Error('useNestedTheme must be used within a NestedThemeProvider');
  }
  return context;
};

// Multi-tenant theme manager
export class MultiTenantThemeManager {
  private themes: Map<string, Theme> = new Map();
  private scopes: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultThemes();
  }

  private initializeDefaultThemes() {
    const defaultThemes: Theme[] = [
      {
        id: 'tenant-blue',
        name: 'Blue Enterprise',
        description: 'Professional blue theme for enterprise',
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
        id: 'tenant-green',
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
          info: '#059669',
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
          '--color-info': '#059669',
        },
      },
      {
        id: 'tenant-purple',
        name: 'Purple Innovation',
        description: 'Creative purple theme for innovation',
        category: 'light',
        colors: {
          primary: '#7C3AED',
          secondary: '#475569',
          accent: '#A78BFA',
          background: '#FAF5FF',
          surface: '#FFFFFF',
          text: '#1E293B',
          textSecondary: '#64748B',
          border: '#DDD6FE',
          error: '#DC2626',
          warning: '#D97706',
          success: '#059669',
          info: '#7C3AED',
        },
        cssVariables: {
          '--color-primary': '#7C3AED',
          '--color-secondary': '#475569',
          '--color-accent': '#A78BFA',
          '--color-background': '#FAF5FF',
          '--color-surface': '#FFFFFF',
          '--color-text': '#1E293B',
          '--color-text-secondary': '#64748B',
          '--color-border': '#DDD6FE',
          '--color-error': '#DC2626',
          '--color-warning': '#D97706',
          '--color-success': '#059669',
          '--color-info': '#7C3AED',
        },
      },
    ];

    defaultThemes.forEach((theme) => {
      this.themes.set(theme.id, theme);
    });
  }

  // Register a new theme
  registerTheme(theme: Theme) {
    this.themes.set(theme.id, theme);
  }

  // Get theme by ID
  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  // Register a tenant scope
  registerTenantScope(tenantId: string, scope: string) {
    this.scopes.set(tenantId, scope);
  }

  // Get scope for tenant
  getTenantScope(tenantId: string): string {
    return this.scopes.get(tenantId) || `tenant-${tenantId}`;
  }

  // Create tenant-specific theme
  createTenantTheme(baseThemeId: string, tenantId: string, customizations: Partial<Theme>): Theme {
    const baseTheme = this.getTheme(baseThemeId);
    if (!baseTheme) {
      throw new Error(`Base theme ${baseThemeId} not found`);
    }

    const tenantTheme: Theme = {
      ...baseTheme,
      id: `${tenantId}-${baseThemeId}`,
      name: `${baseTheme.name} (${tenantId})`,
      ...customizations,
      colors: {
        ...baseTheme.colors,
        ...customizations.colors,
      },
      cssVariables: {
        ...baseTheme.cssVariables,
        ...customizations.cssVariables,
      },
    };

    this.registerTheme(tenantTheme);
    return tenantTheme;
  }

  // Get all available themes
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  // Get themes by category
  getThemesByCategory(category: 'light' | 'dark' | 'auto'): Theme[] {
    return this.getAllThemes().filter((theme) => theme.category === category);
  }
}

// Global theme manager instance
export const globalThemeManager = new MultiTenantThemeManager();

// Tenant-specific theme provider
export const TenantThemeProvider: React.FC<{
  children: ReactNode;
  tenantId: string;
  themeId: string;
  className?: string;
  enableIsolation?: boolean;
  enableAnimations?: boolean;
}> = ({
  children,
  tenantId,
  themeId,
  className = '',
  enableIsolation = true,
  enableAnimations = true,
}) => {
  const theme = globalThemeManager.getTheme(themeId);
  const scope = globalThemeManager.getTenantScope(tenantId);

  if (!theme) {
    throw new Error(`Theme ${themeId} not found`);
  }

  return (
    <NestedThemeProvider
      theme={theme}
      scope={scope}
      className={className}
      enableIsolation={enableIsolation}
      enableAnimations={enableAnimations}
    >
      {children}
    </NestedThemeProvider>
  );
};

// Theme scope selector component
export const ThemeScopeSelector: React.FC<{
  onThemeChange: (themeId: string) => void;
  currentThemeId: string;
  className?: string;
}> = ({ onThemeChange, currentThemeId, className = '' }) => {
  const themes = globalThemeManager.getAllThemes();

  return (
    <div className={`theme-scope-selector ${className}`}>
      <select
        value={currentThemeId}
        onChange={(e) => onThemeChange(e.target.value)}
        className="theme-select"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Theme preview component for nested themes
export const NestedThemePreview: React.FC<{
  theme: Theme;
  scope: string;
  className?: string;
}> = ({ theme, scope, className = '' }) => {
  return (
    <div
      className={`nested-theme-preview ${className}`}
      data-theme-scope={scope}
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
      <div style={{ marginTop: '8px' }}>
        <span style={{ color: theme.colors.primary }}>Primary</span>
        <span style={{ color: theme.colors.secondary }}> Secondary</span>
        <span style={{ color: theme.colors.accent }}> Accent</span>
      </div>
      <div style={{ marginTop: '4px', fontSize: '12px', color: theme.colors.textSecondary }}>
        Scope: {scope}
      </div>
    </div>
  );
};

// Multi-tenant demo component
export const MultiTenantDemo: React.FC = () => {
  const [currentThemeId, setCurrentThemeId] = useState('tenant-blue');

  return (
    <div className="multi-tenant-demo">
      <h2>Multi-Tenant Theme Demo</h2>

      <div className="theme-selector">
        <ThemeScopeSelector currentThemeId={currentThemeId} onThemeChange={setCurrentThemeId} />
      </div>

      <div className="tenant-sections">
        {/* Tenant 1 */}
        <TenantThemeProvider tenantId="tenant1" themeId="tenant-blue" className="tenant-section">
          <div className="tenant-content">
            <h3>Tenant 1 - Blue Theme</h3>
            <p>This section uses the blue enterprise theme.</p>
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
          </div>
        </TenantThemeProvider>

        {/* Tenant 2 */}
        <TenantThemeProvider tenantId="tenant2" themeId="tenant-green" className="tenant-section">
          <div className="tenant-content">
            <h3>Tenant 2 - Green Theme</h3>
            <p>This section uses the green success theme.</p>
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
          </div>
        </TenantThemeProvider>

        {/* Tenant 3 */}
        <TenantThemeProvider tenantId="tenant3" themeId="tenant-purple" className="tenant-section">
          <div className="tenant-content">
            <h3>Tenant 3 - Purple Theme</h3>
            <p>This section uses the purple innovation theme.</p>
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
          </div>
        </TenantThemeProvider>
      </div>
    </div>
  );
};
