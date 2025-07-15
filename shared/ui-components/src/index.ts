/**
 * AI-BOS UI Components
 * 
 * Enterprise-grade UI components for AI-BOS platform,
 * integrating outstanding components from the reference implementation.
 */

// Theme System (Already migrated)
export * from './theme/ThemeProvider';

// Performance Monitoring (Already migrated)
export * from './performance/PerformanceDashboard';

// Search & Spotlight (Already migrated)
export * from './search/Spotlight';

// NEW: Data Table Component (Migrated from legacy)
export * from './data-table/DataTable';

// NEW: Form Builder Component (Migrated from legacy)
export * from './form-builder/FormBuilder';

// NEW: App Shell Component (Migrated from legacy)
export * from './app-shell/AppShell';

// Desktop Environment (from reference)
export * from './desktop/Desktop';
export * from './desktop/Window';
export * from './desktop/TopBar';
export * from './desktop/Dock';
export * from './desktop/StartMenu';

// Shortcut Management
export * from './shortcuts/ShortcutHelp';
export * from './shortcuts/ShortcutManager';

// App Management
export * from './apps/AppStore';
export * from './apps/AppRegistry';

// System Components
export * from './system/Clock';
export * from './system/PropertiesDialog';
export * from './system/Tooltip';

// Onboarding
export * from './onboarding/TenantOnboarding';

// Platform Integration
export * from './platform/AibosPlatform';

// Database Integration
export * from './database/Supabase';

// Performance Utilities
export * from './performance/PerformanceOptimizer';
export * from './performance/CodeSplitting';

// Search Utilities
export * from './search/SearchRegistry';

// System Commands
export * from './system/SystemCommands';

// Type Definitions
export interface UIComponentProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: Record<string, string>;
  dark?: boolean;
}

export interface PerformanceConfig {
  refreshInterval: number;
  thresholds: {
    cpu: number;
    memory: number;
    responseTime: number;
    errorRate: number;
  };
}

export interface SearchConfig {
  enableFuzzy: boolean;
  enableHistory: boolean;
  maxResults: number;
  categories: string[];
}

// NEW: Data Table Types (Migrated from legacy)
export type {
  SortDirection,
  SortConfig,
  Column,
  PaginationConfig,
  SelectionConfig,
  ExpandableConfig,
  DataTableProps
} from './data-table/DataTable';

// NEW: Form Builder Types (Migrated from legacy)
export type {
  FieldType,
  FieldOption,
  FieldValidation,
  FormField,
  FormSection,
  FormBuilderProps
} from './form-builder/FormBuilder';

// Component Registry
export const COMPONENT_REGISTRY = {
  // Theme Components
  ThemeProvider: 'theme/ThemeProvider',
  ThemeSelector: 'theme/ThemeSelector',
  ThemePreview: 'theme/ThemePreview',
  
  // Performance Components
  PerformanceDashboard: 'performance/PerformanceDashboard',
  PerformanceOptimizer: 'performance/PerformanceOptimizer',
  
  // Search Components
  Spotlight: 'search/Spotlight',
  SearchRegistry: 'search/SearchRegistry',
  
  // NEW: Data Table Components (Migrated from legacy)
  DataTable: 'data-table/DataTable',
  
  // NEW: Form Builder Components (Migrated from legacy)
  FormBuilder: 'form-builder/FormBuilder',
  
  // NEW: App Shell Components (Migrated from legacy)
  AppShell: 'app-shell/AppShell',
  
  // Desktop Components
  Desktop: 'desktop/Desktop',
  Window: 'desktop/Window',
  TopBar: 'desktop/TopBar',
  Dock: 'desktop/Dock',
  StartMenu: 'desktop/StartMenu',
  
  // Shortcut Components
  ShortcutHelp: 'shortcuts/ShortcutHelp',
  ShortcutManager: 'shortcuts/ShortcutManager',
  
  // App Components
  AppStore: 'apps/AppStore',
  AppRegistry: 'apps/AppRegistry',
  
  // System Components
  Clock: 'system/Clock',
  PropertiesDialog: 'system/PropertiesDialog',
  Tooltip: 'system/Tooltip',
  SystemCommands: 'system/SystemCommands',
  
  // Onboarding Components
  TenantOnboarding: 'onboarding/TenantOnboarding',
  
  // Platform Components
  AibosPlatform: 'platform/AibosPlatform',
  
  // Database Components
  Supabase: 'database/Supabase',
  
  // Performance Utilities
  CodeSplitting: 'performance/CodeSplitting'
} as const;

// Component Categories
export const COMPONENT_CATEGORIES = {
  theme: {
    name: 'Theme System',
    description: 'Theme management and customization',
    components: ['ThemeProvider', 'ThemeSelector', 'ThemePreview']
  },
  performance: {
    name: 'Performance Monitoring',
    description: 'Real-time performance tracking and optimization',
    components: ['PerformanceDashboard', 'PerformanceOptimizer', 'CodeSplitting']
  },
  search: {
    name: 'Search & Spotlight',
    description: 'Global search functionality with fuzzy matching',
    components: ['Spotlight', 'SearchRegistry']
  },
  data: {
    name: 'Data Components',
    description: 'Data display and management components',
    components: ['DataTable']
  },
  forms: {
    name: 'Form Components',
    description: 'Dynamic form building and validation',
    components: ['FormBuilder']
  },
  layout: {
    name: 'Layout Components',
    description: 'Application layout and shell components',
    components: ['AppShell']
  },
  desktop: {
    name: 'Desktop Environment',
    description: 'Desktop metaphor with windows and dock',
    components: ['Desktop', 'Window', 'TopBar', 'Dock', 'StartMenu']
  },
  shortcuts: {
    name: 'Shortcut Management',
    description: 'Keyboard shortcuts and help system',
    components: ['ShortcutHelp', 'ShortcutManager']
  },
  apps: {
    name: 'App Management',
    description: 'Application store and registry',
    components: ['AppStore', 'AppRegistry']
  },
  system: {
    name: 'System Components',
    description: 'System-level UI components',
    components: ['Clock', 'PropertiesDialog', 'Tooltip', 'SystemCommands']
  },
  onboarding: {
    name: 'Onboarding',
    description: 'User onboarding and setup',
    components: ['TenantOnboarding']
  },
  platform: {
    name: 'Platform Integration',
    description: 'AI-BOS platform integration',
    components: ['AibosPlatform', 'Supabase']
  }
} as const;

// Utility Functions
export function getComponentCategory(componentName: string): string | null {
  for (const [category, config] of Object.entries(COMPONENT_CATEGORIES)) {
    if (config.components.includes(componentName as any)) {
      return category;
    }
  }
  return null;
}

export function getComponentsByCategory(category: string): string[] {
  return COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES]?.components || [];
}

export function getAllComponents(): string[] {
  return Object.values(COMPONENT_REGISTRY);
}

// Default exports
export { default as ThemeProvider } from './theme/ThemeProvider';
export { default as PerformanceDashboard } from './performance/PerformanceDashboard';
export { default as Spotlight } from './search/Spotlight';
export { default as DataTable } from './data-table/DataTable';
export { default as FormBuilder } from './form-builder/FormBuilder';
export { default as AppShell } from './app-shell/AppShell';
export { default as Desktop } from './desktop/Desktop';
export { default as ShortcutHelp } from './shortcuts/ShortcutHelp';
export { default as AppStore } from './apps/AppStore';
export { default as Clock } from './system/Clock';
export { default as TenantOnboarding } from './onboarding/TenantOnboarding'; 