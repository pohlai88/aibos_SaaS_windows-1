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

// NEW: Job Queue Components (Enterprise-grade job management)
export * from './job-queue';

// NEW: AI Assistant Components (State-of-the-art AI chat and conversation management)
export * from './ai-assistant';

// NEW: Analytics Components (Advanced data visualization and real-time metrics)
export * from './analytics';

// NEW: Primitive Components (Enterprise-grade foundational components)
export * from './primitives';

// NEW: Feedback Components (Toast notifications and user feedback)
export * from './feedback';

// NEW: Advanced Layout Components (AI-powered layout system)
export * from './layout';

// NEW: Advanced Form Components (AI-powered form controls)
export * from './forms';

// NEW: Revolutionary Data Components (enterprise-grade data handling)
export * from './data';

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
  
  // NEW: Job Queue Components (Enterprise-grade job management)
  JobQueueDashboard: 'job-queue/JobQueueDashboard',
  JobQueueProvider: 'job-queue/JobQueueProvider',
  JobForm: 'job-queue/JobForm',
  
  // NEW: AI Assistant Components (State-of-the-art AI chat and conversation management)
  AIAssistant: 'ai-assistant/AIAssistant',
  AIAssistantProvider: 'ai-assistant/AIAssistantProvider',
  
  // NEW: Analytics Components (Advanced data visualization and real-time metrics)
  AnalyticsDashboard: 'analytics/AnalyticsDashboard',
  
  // NEW: Primitive Components (Enterprise-grade foundational components)
  Button: 'primitives/Button',
  Modal: 'primitives/Modal',
  Tooltip: 'primitives/Tooltip',
  Skeleton: 'primitives/Skeleton',
  Progress: 'primitives/Progress',
  Badge: 'primitives/Badge',
  
  // NEW: Feedback Components (Toast notifications and user feedback)
  ToastProvider: 'feedback/Toast',
  useToast: 'feedback/Toast',
  
  // NEW: Advanced Layout Components (AI-powered layout system)
  Drawer: 'layout/Drawer',
  Tabs: 'layout/Tabs',
  Breadcrumb: 'layout/Breadcrumb',
  
  // NEW: Advanced Form Components (AI-powered form controls)
  DateTimePicker: 'forms/DateTimePicker',
  FormBuilder: 'forms/FormBuilder',
  
  // NEW: Revolutionary Data Components (enterprise-grade data handling)
  DataGrid: 'data/DataGrid',
  
  // Demo Components
  PrimitivesDemo: 'primitives/PrimitivesDemo',
  UltimateDemo: 'UltimateDemo',
  
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
  jobQueue: {
    name: 'Job Queue Management',
    description: 'Enterprise-grade job queue monitoring and management',
    components: ['JobQueueDashboard', 'JobQueueProvider', 'JobForm']
  },
  aiAssistant: {
    name: 'AI Assistant',
    description: 'State-of-the-art AI chat and conversation management',
    components: ['AIAssistant', 'AIAssistantProvider']
  },
  analytics: {
    name: 'Analytics & Data Visualization',
    description: 'Advanced data visualization and real-time metrics',
    components: ['AnalyticsDashboard']
  },
  primitives: {
    name: 'Primitive Components',
    description: 'Enterprise-grade foundational components',
    components: ['Button', 'Modal', 'Tooltip', 'Skeleton', 'Progress', 'Badge']
  },
  feedback: {
    name: 'Feedback & Notifications',
    description: 'Toast notifications and user feedback systems',
    components: ['ToastProvider', 'useToast']
  },
  layout: {
    name: 'Advanced Layout System',
    description: 'AI-powered layout components with smart features',
    components: ['Drawer', 'Tabs', 'Breadcrumb']
  },
  forms: {
    name: 'Advanced Form Controls',
    description: 'AI-powered form components with intelligent features',
    components: ['DateTimePicker', 'FormBuilder']
  },
  data: {
    name: 'Revolutionary Data Components',
    description: 'Enterprise-grade data handling with AI intelligence',
    components: ['DataGrid']
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