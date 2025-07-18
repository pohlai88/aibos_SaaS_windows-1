import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { cva, type VariantProps  } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// CSS Variable scope manager
class CSSVariableScope {
  private scopeId: string;
  private element: HTMLElement;
  private variables: Map<string, string> = new Map();

  constructor(scopeId: string, element: HTMLElement) {
    this.scopeId = scopeId;
    this.element = element;
  }

  setVariable(name: string, value: string) {
    this.variables.set(name, value);
    this.element.style.setProperty(`--${this.scopeId}-${name}`, value);
  }

  getVariable(name: string): string | undefined {
    return this.variables.get(name);
  }

  getAllVariables(): Record<string, string> {
    const result: Record<string, string> = {};
    this.variables.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  removeVariable(name: string) {
    this.variables.delete(name);
    this.element.style.removeProperty(`--${this.scopeId}-${name}`);
  }

  clear() {
    this.variables.forEach((_, name) => {
      this.removeVariable(name);
    });
  }
}

// Theme definition interface
export interface ThemeDefinition {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
    success: string;
    warning: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      'xs': string;
      'sm': string;
      'base': string;
      'lg': string;
      'xl': string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    'xs': string;
    'sm': string;
    'md': string;
    'lg': string;
    'xl': string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Multi-tenant theme context
interface MultiTenantThemeContextType {
  registerTheme: (theme: ThemeDefinition) => void;
  unregisterTheme: (themeId: string) => void;
  getTheme: (themeId: string) => ThemeDefinition | undefined;
  getAllThemes: () => ThemeDefinition[];
  createThemeScope: (themeId: string, element: HTMLElement) => CSSVariableScope;
  removeThemeScope: (themeId: string) => void;
}

const MultiTenantThemeContext = createContext<MultiTenantThemeContextType | null>(null);

// Multi-tenant theme provider
export interface MultiTenantThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeDefinition;
}

export const MultiTenantThemeProvider: React.FC<MultiTenantThemeProviderProps> = ({
  children,
  defaultTheme,
}) => {
  const [themes, setThemes] = useState<Map<string, ThemeDefinition>>(new Map());
  const [themeScopes, setThemeScopes] = useState<Map<string, CSSVariableScope>>(new Map());

  const registerTheme = useCallback((theme: ThemeDefinition) => {
    setThemes((prev) => new Map(prev).set(theme.id, theme));
  }, []);

  const unregisterTheme = useCallback(
    (themeId: string) => {
      setThemes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(themeId);
        return newMap;
      });

      // Clean up theme scope
      const scope = themeScopes.get(themeId);
      if (scope) {
        scope.clear();
        setThemeScopes((prev) => {
          const newMap = new Map(prev);
          newMap.delete(themeId);
          return newMap;
        });
      }
    },
    [themeScopes],
  );

  const getTheme = useCallback(
    (themeId: string) => {
      return themes.get(themeId);
    },
    [themes],
  );

  const getAllThemes = useCallback(() => {
    return Array.from(themes.values());
  }, [themes]);

  const createThemeScope = useCallback(
    (themeId: string, element: HTMLElement) => {
      const theme = themes.get(themeId);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }

      const scope = new CSSVariableScope(themeId, element);

      // Apply theme variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        scope.setVariable(`color-${key}`, value);
      });

      Object.entries(theme.typography).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            scope.setVariable(`typography-${key}-${subKey}`, subValue);
          });
        } else {
          scope.setVariable(`typography-${key}`, value);
        }
      });

      Object.entries(theme.spacing).forEach(([key, value]) => {
        scope.setVariable(`spacing-${key}`, value);
      });

      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        scope.setVariable(`radius-${key}`, value);
      });

      Object.entries(theme.shadows).forEach(([key, value]) => {
        scope.setVariable(`shadow-${key}`, value);
      });

      setThemeScopes((prev) => new Map(prev).set(themeId, scope));
      return scope;
    },
    [themes],
  );

  const removeThemeScope = useCallback(
    (themeId: string) => {
      const scope = themeScopes.get(themeId);
      if (scope) {
        scope.clear();
        setThemeScopes((prev) => {
          const newMap = new Map(prev);
          newMap.delete(themeId);
          return newMap;
        });
      }
    },
    [themeScopes],
  );

  // Register default theme
  useEffect(() => {
    if (defaultTheme) {
      registerTheme(defaultTheme);
    }
  }, [defaultTheme, registerTheme]);

  return (
    <MultiTenantThemeContext.Provider
      value={{
        registerTheme,
        unregisterTheme,
        getTheme,
        getAllThemes,
        createThemeScope,
        removeThemeScope,
      }}
    >
      {children}
    </MultiTenantThemeContext.Provider>
  );
};

// Hook to use multi-tenant theme
export const useMultiTenantTheme = () => {
  const context = useContext(MultiTenantThemeContext);
  if (!context) {
    throw new Error('useMultiTenantTheme must be used within MultiTenantThemeProvider');
  }
  return context;
};

// Scoped theme component
export interface ScopedThemeProps {
  themeId: string;
  children: React.ReactNode;
  className?: string;
}

export const ScopedTheme: React.FC<ScopedThemeProps> = ({ themeId, children, className }) => {
  const { getTheme, createThemeScope, removeThemeScope } = useMultiTenantTheme();
  const elementRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<CSSVariableScope | null>(null);

  const theme = getTheme(themeId);

  useEffect(() => {
    if (elementRef.current && theme) {
      scopeRef.current = createThemeScope(themeId, elementRef.current);
    }

    return () => {
      if (scopeRef.current) {
        removeThemeScope(themeId);
        scopeRef.current = null;
      }
    };
  }, [themeId, theme, createThemeScope, removeThemeScope]);

  if (!theme) {
    return <div className="text-red-500">Theme {themeId} not found</div>;
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        'isolate', // CSS isolation to prevent style leakage
        className,
      )}
      data-theme-id={themeId}
      style={
        {
          // Apply theme-specific CSS custom properties
          '--theme-id': themeId,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

// Theme-aware component variants
const scopedComponentVariants = cva(
  '', // Base styles will be applied via CSS variables
  {
    variants: {
      variant: {
        default: '[--component-variant:default]',
        primary: '[--component-variant:primary]',
        secondary: '[--component-variant:secondary]',
        destructive: '[--component-variant:destructive]',
      },
      size: {
        sm: '[--component-size:sm]',
        md: '[--component-size:md]',
        lg: '[--component-size:lg]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

// Scoped button component
export interface ScopedButtonProps extends VariantProps<typeof scopedComponentVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ScopedButton: React.FC<ScopedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  variant = 'default',
  size = 'md',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        scopedComponentVariants({ variant, size }),
        'px-4 py-2 rounded-md font-medium transition-colors',
        'bg-[var(--theme-color-primary)] text-[var(--theme-color-foreground)]',
        'hover:bg-[var(--theme-color-primary)]/90',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-ring)]',
        className,
      )}
    >
      {children}
    </button>
  );
};

// Scoped card component
export interface ScopedCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ScopedCard: React.FC<ScopedCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'p-6 rounded-lg border shadow-sm',
        'bg-[var(--theme-color-background)]',
        'border-[var(--theme-color-border)]',
        'text-[var(--theme-color-foreground)]',
        className,
      )}
    >
      {children}
    </div>
  );
};

// Multi-tenant dashboard demo
export const MultiTenantDashboardDemo: React.FC = () => {
  const { registerTheme, getAllThemes } = useMultiTenantTheme();

  // Define multiple themes
  const themes: ThemeDefinition[] = [
    {
      id: 'enterprise-blue',
      name: 'Enterprise Blue',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#3b82f6',
        background: '#ffffff',
        foreground: '#0f172a',
        muted: '#f1f5f9',
        mutedForeground: '#64748b',
        border: '#e2e8f0',
        input: '#ffffff',
        ring: '#2563eb',
        destructive: '#ef4444',
        destructiveForeground: '#ffffff',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: {
          'xs': '0.75rem',
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
    },
    {
      id: 'startup-green',
      name: 'Startup Green',
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#10b981',
        background: '#f9fafb',
        foreground: '#111827',
        muted: '#f3f4f6',
        mutedForeground: '#6b7280',
        border: '#d1d5db',
        input: '#ffffff',
        ring: '#059669',
        destructive: '#dc2626',
        destructiveForeground: '#ffffff',
        success: '#059669',
        warning: '#d97706',
        info: '#3b82f6',
      },
      typography: {
        fontFamily: 'SF Pro Display, system-ui, sans-serif',
        fontSize: {
          'xs': '0.75rem',
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
    },
    {
      id: 'fintech-purple',
      name: 'Fintech Purple',
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#a855f7',
        background: '#0f0f23',
        foreground: '#ffffff',
        muted: '#1e1e3f',
        mutedForeground: '#a1a1aa',
        border: '#27272a',
        input: '#1e1e3f',
        ring: '#7c3aed',
        destructive: '#ef4444',
        destructiveForeground: '#ffffff',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      typography: {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: {
          'xs': '0.75rem',
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
      },
    },
  ];

  // Register themes
  useEffect(() => {
    themes.forEach((theme) => registerTheme(theme));
  }, [registerTheme]);

  const DashboardContent: React.FC<{ themeId: string }> = ({ themeId }) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard - {themeId}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScopedCard>
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$124,563</p>
          <p className="text-sm text-muted-foreground">+12% from last month</p>
        </ScopedCard>

        <ScopedCard>
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-3xl font-bold">1,234</p>
          <p className="text-sm text-muted-foreground">+5% from last week</p>
        </ScopedCard>
      </div>

      <div className="flex gap-2">
        <ScopedButton variant="primary">Primary Action</ScopedButton>
        <ScopedButton variant="secondary">Secondary</ScopedButton>
        <ScopedButton variant="destructive">Delete</ScopedButton>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Multi-Tenant Theme Demo</h1>
      <p className="text-muted-foreground mb-6">
        Three dashboards with completely separate themes, no style collisions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScopedTheme themeId="enterprise-blue">
          <DashboardContent themeId="Enterprise Blue" />
        </ScopedTheme>

        <ScopedTheme themeId="startup-green">
          <DashboardContent themeId="Startup Green" />
        </ScopedTheme>

        <ScopedTheme themeId="fintech-purple">
          <DashboardContent themeId="Fintech Purple" />
        </ScopedTheme>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Theme Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {themes.map((theme) => (
            <div key={theme.id} className="space-y-1">
              <p className="font-medium">{theme.name}</p>
              <p className="text-muted-foreground">ID: {theme.id}</p>
              <p className="text-muted-foreground">Primary: {theme.colors.primary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
