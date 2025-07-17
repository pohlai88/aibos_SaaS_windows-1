// AI-BOS UI Components Library
// Enterprise-grade React components with AI-powered features

// Core Components
export * from './primitives';
export * from './feedback';
export * from './layout';
export * from './forms';
export * from './data';
export * from './analytics';
export * from './job-queue';
export * from './ai-assistant';

// Re-export specific components for convenience
export { PerformanceDashboard } from './performance/PerformanceDashboard';
export { JobQueueDashboard } from './job-queue/JobQueueDashboard';
export { JobQueueProvider } from './job-queue/JobQueueProvider';
export { AIAssistant } from './ai-assistant/AIAssistant';

// Component Categories for dynamic loading
export const COMPONENT_CATEGORIES = {
  'primitives': {
    name: 'Primitives',
    description: 'Basic UI building blocks',
    components: ['Button', 'Badge', 'Modal', 'Tooltip', 'Skeleton', 'Progress', 'Input'],
  },
  'feedback': {
    name: 'Feedback',
    description: 'User feedback and notifications',
    components: ['Toast', 'ConfirmDialog'],
  },
  'layout': {
    name: 'Layout',
    description: 'Layout and navigation components',
    components: ['Breadcrumb', 'Drawer', 'Tabs'],
  },
  'forms': {
    name: 'Forms',
    description: 'Form components and builders',
    components: ['FormBuilder', 'DateTimePicker'],
  },
  'data': {
    name: 'Data',
    description: 'Data display and management',
    components: ['DataGrid', 'DataTable', 'ExcelLikeGrid', 'VirtualizedDataGrid'],
  },
  'analytics': {
    name: 'Analytics',
    description: 'Analytics and reporting',
    components: ['AnalyticsDashboard'],
  },
  'performance': {
    name: 'Performance',
    description: 'Performance monitoring',
    components: ['PerformanceDashboard'],
  },
  'job-queue': {
    name: 'Job Queue',
    description: 'Background job management',
    components: ['JobQueueDashboard', 'JobQueueProvider', 'JobForm'],
  },
  'ai-assistant': {
    name: 'AI Assistant',
    description: 'AI-powered assistance',
    components: ['AIAssistant', 'AIAssistantProvider'],
  },
} as const;

// Utility function to get components by category
export function getComponentsByCategory(category: string): readonly string[] {
  return COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES]?.components || [];
}

// Component registry for dynamic loading
export const COMPONENT_REGISTRY = {
  // Primitives
  Button: () => import('./primitives/Button'),
  Badge: () => import('./primitives/Badge'),
  Modal: () => import('./primitives/Modal'),
  Tooltip: () => import('./primitives/Tooltip'),
  Skeleton: () => import('./primitives/Skeleton'),
  Progress: () => import('./primitives/Progress'),
  Input: () => import('./primitives/Input'),

  // Feedback
  Toast: () => import('./feedback/Toast'),
  ConfirmDialog: () => import('./feedback/ConfirmDialog'),

  // Layout
  Breadcrumb: () => import('./layout/Breadcrumb'),
  Drawer: () => import('./layout/Drawer'),
  Tabs: () => import('./layout/Tabs'),

  // Forms
  FormBuilder: () => import('./forms/FormBuilder'),
  DateTimePicker: () => import('./forms/DateTimePicker'),

  // Data
  DataGrid: () => import('./data/DataGrid'),
  DataTable: () => import('./data-table/DataTable'),
  ExcelLikeGrid: () => import('./data/ExcelLikeGrid'),
  VirtualizedDataGrid: () => import('./data/VirtualizedDataGrid'),

  // Analytics
  AnalyticsDashboard: () => import('./analytics/AnalyticsDashboard'),

  // Performance
  PerformanceDashboard: () => import('./performance/PerformanceDashboard'),

  // Job Queue
  JobQueueDashboard: () => import('./job-queue/JobQueueDashboard'),
  JobQueueProvider: () => import('./job-queue/JobQueueProvider'),
  JobForm: () => import('./job-queue/JobForm'),

  // AI Assistant
  AIAssistant: () => import('./ai-assistant/AIAssistant'),
  AIAssistantProvider: () => import('./ai-assistant/AIAssistantProvider'),
} as const;

// Dynamic component loader
export async function loadComponent(componentName: string) {
  const loader = COMPONENT_REGISTRY[componentName as keyof typeof COMPONENT_REGISTRY];
  if (!loader) {
    throw new Error(`Component ${componentName} not found in registry`);
  }
  return loader();
}

// Configuration for component loading
export interface ComponentConfig {
  components: string[];
  categories?: string[];
  lazy?: boolean;
}

// Check if component is available
export function isComponentAvailable(componentName: string, config: ComponentConfig): boolean {
  return config.components.includes(componentName);
}

// Get available components by category
export function getAvailableComponentsByCategory(
  category: string,
  config: ComponentConfig,
): string[] {
  const categoryComponents = getComponentsByCategory(category);
  return categoryComponents.filter((component) => isComponentAvailable(component, config));
}
