'use client';

import React from 'react';
import {
  Terminal, FileText, Calculator, Brain, Sparkles,
  FolderOpen, Settings, HelpCircle, Zap, Cpu,
  Monitor, Database, Network, Shield, Users,
  Clock, Cloud, Code
} from 'lucide-react';

// ==================== APP METADATA ====================

export interface AppMetadata {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'productivity' | 'development' | 'system' | 'ai' | 'utilities';
  version: string;
  author: string;
  size: string;
  isInstalled: boolean;
  isRunning: boolean;
  dependencies: string[];
  permissions: string[];
  features: string[];
  screenshots?: string[];
  rating?: number;
  downloads?: number;
  lastUpdated: string;
  minSystemVersion: string;
  tags: string[];
}

// ==================== APP REGISTRY ====================

export const APP_REGISTRY: Record<string, AppMetadata> = {
  'terminal': {
    id: 'terminal',
    name: 'Terminal',
    description: 'Advanced command-line interface with AI-powered assistance and system management capabilities',
    icon: Terminal,
    category: 'development',
    version: '2.1.0',
    author: 'AI-BOS Team',
    size: '15.2 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core', 'ai-engine'],
    permissions: ['system-access', 'file-system', 'network'],
    features: [
      'Command execution',
      'AI assistance',
      'System monitoring',
      'File management',
      'Network tools',
      'Process control',
      'Package management',
      'Script execution'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['terminal', 'cli', 'development', 'system', 'ai']
  },

  'file-system': {
    id: 'file-system',
    name: 'File System',
    description: '3D spatial file manager with AI-powered organization and intelligent search capabilities',
    icon: FolderOpen,
    category: 'productivity',
    version: '1.8.0',
    author: 'AI-BOS Team',
    size: '8.7 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['file-system', 'storage'],
    features: [
      '3D spatial navigation',
      'AI-powered organization',
      'Intelligent search',
      'File preview',
      'Batch operations',
      'Cloud sync',
      'Version control',
      'Collaboration tools'
    ],
    lastUpdated: '2024-01-10',
    minSystemVersion: '1.0.0',
    tags: ['files', 'organization', '3d', 'ai', 'productivity']
  },

  'file-manager': {
    id: 'file-manager',
    name: 'File Manager',
    description: 'Advanced file management with drag-and-drop, search, preview, and AI-powered organization',
    icon: FolderOpen,
    category: 'productivity',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '6.5 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['file-system', 'storage'],
    features: [
      'File browsing',
      'Drag-and-drop',
      'Search functionality',
      'File preview',
      'Copy/cut/paste',
      'Favorites',
      'Grid/list views',
      'Upload support'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['files', 'management', 'productivity', 'organization', 'browser']
  },

  'api-explorer': {
    id: 'api-explorer',
    name: 'API Explorer',
    description: 'Interactive API testing and documentation with request history and authentication management',
    icon: Code,
    category: 'development',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '4.2 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['api-access', 'development'],
    features: [
      'API testing',
      'Request history',
      'Authentication management',
      'Response validation',
      'Documentation',
      'Search functionality',
      'Real-time monitoring',
      'Export capabilities'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['api', 'development', 'testing', 'documentation', 'debugging']
  },

  'aha-machine': {
    id: 'aha-machine',
    name: 'Aha Machine',
    description: 'AI-powered insight generator that connects patterns and generates breakthrough ideas',
    icon: Sparkles,
    category: 'ai',
    version: '1.5.0',
    author: 'AI-BOS Team',
    size: '12.3 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['ai-engine', 'consciousness'],
    permissions: ['ai-access', 'data-analysis'],
    features: [
      'Pattern recognition',
      'Insight generation',
      'Creative synthesis',
      'Predictive modeling',
      'Cross-domain connections',
      'Neural pattern analysis',
      'Emotional intelligence',
      'Breakthrough detection'
    ],
    lastUpdated: '2024-01-12',
    minSystemVersion: '1.0.0',
    tags: ['ai', 'insights', 'creativity', 'patterns', 'innovation']
  },

  'notes': {
    id: 'notes',
    name: 'Notes',
    description: 'Advanced note-taking app with AI-powered insights, markdown support, and intelligent organization',
    icon: FileText,
    category: 'productivity',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '6.8 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['ai-engine'],
    permissions: ['file-system', 'ai-access'],
    features: [
      'Rich text editing',
      'Markdown support',
      'AI-powered insights',
      'Smart organization',
      'Real-time sync',
      'Collaboration',
      'Version history',
      'Export options'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['notes', 'writing', 'ai', 'productivity', 'markdown']
  },

  'calculator': {
    id: 'calculator',
    name: 'Calculator',
    description: 'Advanced calculator with scientific functions, AI-powered natural language processing, and calculation history',
    icon: Calculator,
    category: 'utilities',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '4.2 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['ai-engine'],
    permissions: ['ai-access'],
    features: [
      'Basic arithmetic',
      'Scientific functions',
      'AI-powered calculations',
      'Natural language input',
      'Calculation history',
      'Memory functions',
      'Unit conversion',
      'Formula library'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['calculator', 'math', 'ai', 'scientific', 'utilities']
  },

  'consciousness-dashboard': {
    id: 'consciousness-dashboard',
    name: 'Consciousness Dashboard',
    description: 'Real-time monitoring and visualization of AI-BOS consciousness evolution and system intelligence',
    icon: Brain,
    category: 'ai',
    version: '1.2.0',
    author: 'AI-BOS Team',
    size: '9.1 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['consciousness', 'ai-engine'],
    permissions: ['consciousness-access', 'system-monitoring'],
    features: [
      'Real-time monitoring',
      'Consciousness metrics',
      'Emotional state tracking',
      'Neural network visualization',
      'Evolution tracking',
      'Performance analytics',
      'Alert system',
      'Predictive insights'
    ],
    lastUpdated: '2024-01-08',
    minSystemVersion: '1.0.0',
    tags: ['consciousness', 'ai', 'monitoring', 'analytics', 'evolution']
  },

  'connectivity': {
    id: 'connectivity',
    name: 'Connectivity',
    description: 'Network and service connectivity monitoring with detailed diagnostics and troubleshooting tools',
    icon: Network,
    category: 'system',
    version: '1.1.0',
    author: 'AI-BOS Team',
    size: '3.5 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['network-access', 'system-monitoring'],
    features: [
      'Network monitoring',
      'Service diagnostics',
      'Connection testing',
      'Performance metrics',
      'Troubleshooting tools',
      'Status reporting',
      'Alert notifications',
      'Auto-recovery'
    ],
    lastUpdated: '2024-01-05',
    minSystemVersion: '1.0.0',
    tags: ['network', 'connectivity', 'diagnostics', 'system', 'monitoring']
  },

  'clock': {
    id: 'clock',
    name: 'Clock',
    description: 'Comprehensive time management with world clock, stopwatch, timer, and AI-powered time insights',
    icon: Clock,
    category: 'utilities',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '2.8 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['time-access'],
    features: [
      'World clock',
      'Stopwatch',
      'Timer',
      'Time zones',
      'Alarms',
      'Time tracking',
      'AI insights',
      'Scheduling'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['clock', 'time', 'utilities', 'productivity', 'scheduling']
  },

  'weather': {
    id: 'weather',
    name: 'Weather',
    description: 'Advanced weather application with current conditions, forecasts, multiple locations, and AI insights',
    icon: Cloud,
    category: 'utilities',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '5.2 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['network-access'],
    permissions: ['location-access', 'network-access'],
    features: [
      'Current conditions',
      '5-day forecast',
      'Multiple locations',
      'Weather alerts',
      'UV index',
      'Air quality',
      'Weather maps',
      'AI insights'
    ],
    lastUpdated: '2024-01-15',
    minSystemVersion: '1.0.0',
    tags: ['weather', 'forecast', 'utilities', 'location', 'ai']
  },

  'system-monitor': {
    id: 'system-monitor',
    name: 'System Monitor',
    description: 'Comprehensive system resource monitoring with performance analytics and optimization recommendations',
    icon: Monitor,
    category: 'system',
    version: '1.3.0',
    author: 'AI-BOS Team',
    size: '7.8 MB',
    isInstalled: false,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['system-monitoring', 'performance-access'],
    features: [
      'Resource monitoring',
      'Performance analytics',
      'Process management',
      'Memory optimization',
      'CPU utilization',
      'Disk usage',
      'Network traffic',
      'Optimization recommendations'
    ],
    lastUpdated: '2024-01-03',
    minSystemVersion: '1.0.0',
    tags: ['system', 'monitoring', 'performance', 'optimization', 'resources']
  },

  'database-explorer': {
    id: 'database-explorer',
    name: 'Database Explorer',
    description: 'AI-governed database management with intelligent schema analysis and query optimization',
    icon: Database,
    category: 'development',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '11.4 MB',
    isInstalled: false,
    isRunning: false,
    dependencies: ['ai-engine', 'database-core'],
    permissions: ['database-access', 'ai-access'],
    features: [
      'Database management',
      'Schema visualization',
      'Query optimization',
      'AI-powered insights',
      'Data analysis',
      'Backup management',
      'Performance tuning',
      'Security monitoring'
    ],
    lastUpdated: '2024-01-01',
    minSystemVersion: '1.0.0',
    tags: ['database', 'development', 'ai', 'management', 'optimization']
  },

  'security-center': {
    id: 'security-center',
    name: 'Security Center',
    description: 'Comprehensive security monitoring and threat detection with AI-powered analysis',
    icon: Shield,
    category: 'system',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '8.9 MB',
    isInstalled: false,
    isRunning: false,
    dependencies: ['ai-engine', 'security-core'],
    permissions: ['security-access', 'system-monitoring'],
    features: [
      'Threat detection',
      'Vulnerability scanning',
      'Access control',
      'Audit logging',
      'Encryption management',
      'Security policies',
      'Incident response',
      'Compliance monitoring'
    ],
    lastUpdated: '2024-01-01',
    minSystemVersion: '1.0.0',
    tags: ['security', 'threats', 'monitoring', 'compliance', 'protection']
  },

  'user-management': {
    id: 'user-management',
    name: 'User Management',
    description: 'Comprehensive user and permission management with role-based access control',
    icon: Users,
    category: 'system',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '6.2 MB',
    isInstalled: false,
    isRunning: false,
    dependencies: ['auth-core'],
    permissions: ['user-management', 'auth-access'],
    features: [
      'User management',
      'Role assignment',
      'Permission control',
      'Access monitoring',
      'Authentication logs',
      'Password policies',
      'Multi-factor auth',
      'Session management'
    ],
    lastUpdated: '2024-01-01',
    minSystemVersion: '1.0.0',
    tags: ['users', 'permissions', 'auth', 'management', 'security']
  },

  'settings': {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration and preferences management with AI-powered optimization suggestions',
    icon: Settings,
    category: 'system',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '5.1 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['system-core'],
    permissions: ['system-config'],
    features: [
      'System configuration',
      'User preferences',
      'Theme customization',
      'Performance settings',
      'Security options',
      'Network configuration',
      'AI optimization',
      'Backup settings'
    ],
    lastUpdated: '2024-01-01',
    minSystemVersion: '1.0.0',
    tags: ['settings', 'configuration', 'preferences', 'system', 'customization']
  },

  'help-center': {
    id: 'help-center',
    name: 'Help Center',
    description: 'Interactive help system with AI-powered assistance and contextual guidance',
    icon: HelpCircle,
    category: 'utilities',
    version: '1.0.0',
    author: 'AI-BOS Team',
    size: '4.7 MB',
    isInstalled: true,
    isRunning: false,
    dependencies: ['ai-engine'],
    permissions: ['ai-access'],
    features: [
      'Interactive help',
      'AI assistance',
      'Contextual guidance',
      'Tutorial system',
      'FAQ database',
      'Video guides',
      'Search functionality',
      'Feedback system'
    ],
    lastUpdated: '2024-01-01',
    minSystemVersion: '1.0.0',
    tags: ['help', 'assistance', 'tutorials', 'guidance', 'support']
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const getAppById = (id: string): AppMetadata | null => {
  return APP_REGISTRY[id] || null;
};

export const getAppsByCategory = (category: string): AppMetadata[] => {
  return Object.values(APP_REGISTRY).filter(app => app.category === category);
};

export const getInstalledApps = (): AppMetadata[] => {
  return Object.values(APP_REGISTRY).filter(app => app.isInstalled);
};

export const getRunningApps = (): AppMetadata[] => {
  return Object.values(APP_REGISTRY).filter(app => app.isRunning);
};

export const searchApps = (query: string): AppMetadata[] => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(APP_REGISTRY).filter(app =>
    app.name.toLowerCase().includes(lowercaseQuery) ||
    app.description.toLowerCase().includes(lowercaseQuery) ||
    app.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getAppCategories = (): string[] => {
  const categories = Object.values(APP_REGISTRY).map(app => app.category);
  return Array.from(new Set(categories));
};

// ==================== APP COMPONENT MAPPING ====================

export const APP_COMPONENTS: Record<string, React.ComponentType> = {
  'terminal': React.lazy(() => import('./TerminalApp')),
  'file-system': React.lazy(() => import('./FileSystemApp')),
  'file-manager': React.lazy(() => import('./FileManagerApp')),
  'api-explorer': React.lazy(() => import('./APIExplorerApp')),
  'aha-machine': React.lazy(() => import('./AhaMachineApp')),
  'notes': React.lazy(() => import('./NotesApp')),
  'calculator': React.lazy(() => import('./CalculatorApp')),
  'clock': React.lazy(() => import('./ClockApp')),
  'weather': React.lazy(() => import('./WeatherApp')),
  'consciousness-dashboard': React.lazy(() => import('../consciousness/QuantumConsciousnessDashboard')),
  'connectivity': React.lazy(() => import('../connectivity/ConnectivityStatus')),
  // Add other app components as they are created
};

// ==================== DEFAULT EXPORT ====================

export default APP_REGISTRY;
