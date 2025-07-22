'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, Download, Upload, Settings, Eye, Code, Play, Pause, RotateCcw, Star, Users, Globe, Database, Shield, Zap } from 'lucide-react';

// ==================== TYPES ====================
interface BuilderPluginSystemProps {
  tenantId: string;
  userId: string;
  enablePluginMarketplace?: boolean;
  enablePluginDevelopment?: boolean;
  enablePluginAnalytics?: boolean;
  enablePluginSecurity?: boolean;
  onPluginInstalled?: (plugin: BuilderPlugin) => void;
  onPluginUpdated?: (plugin: BuilderPlugin) => void;
  onPluginRemoved?: (pluginId: string) => void;
}

interface BuilderPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  publisher: string;
  category: PluginCategory;
  tags: string[];
  icon: string;
  repository: string;
  documentation: string;
  license: string;
  price: number; // 0 for free
  rating: number;
  downloads: number;
  reviews: number;
  lastUpdated: Date;
  compatibility: {
    minVersion: string;
    maxVersion: string;
    dependencies: string[];
  };
  security: {
    verified: boolean;
    securityScore: number;
    permissions: string[];
    sandboxed: boolean;
  };
  features: PluginFeature[];
  metadata: {
    size: number;
    installDate?: Date;
    enabled: boolean;
    settings: Record<string, any>;
  };
}

type PluginCategory =
  | 'ui-components'
  | 'data-visualization'
  | 'forms-validation'
  | 'navigation'
  | 'authentication'
  | 'integrations'
  | 'utilities'
  | 'themes'
  | 'ai-tools'
  | 'analytics';

interface PluginFeature {
  id: string;
  name: string;
  description: string;
  type: 'component' | 'hook' | 'utility' | 'theme' | 'integration';
  component?: React.ComponentType<any>;
  hook?: () => any;
  utility?: (...args: any[]) => any;
  configurable: boolean;
  settings?: Record<string, any>;
}

interface PluginInstallation {
  id: string;
  pluginId: string;
  timestamp: Date;
  status: 'installing' | 'installed' | 'failed' | 'updating';
  progress: number;
  error?: string;
}

interface PluginAnalytics {
  pluginId: string;
  usage: {
    totalUses: number;
    dailyUses: number;
    weeklyUses: number;
    monthlyUses: number;
  };
  performance: {
    averageLoadTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  userFeedback: {
    rating: number;
    reviews: Review[];
  };
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: Date;
  helpful: number;
}

interface PluginSystemState {
  isActive: boolean;
  isPaused: boolean;
  installedPlugins: BuilderPlugin[];
  availablePlugins: BuilderPlugin[];
  installations: PluginInstallation[];
  analytics: Record<string, PluginAnalytics>;
  marketplace: {
    featured: BuilderPlugin[];
    trending: BuilderPlugin[];
    new: BuilderPlugin[];
    categories: Record<PluginCategory, BuilderPlugin[]>;
  };
  metrics: {
    totalPlugins: number;
    installedPlugins: number;
    activePlugins: number;
    totalDownloads: number;
    averageRating: number;
  };
}

// ==================== BUILDER PLUGIN SYSTEM COMPONENT ====================
export const BuilderPluginSystem: React.FC<BuilderPluginSystemProps> = ({
  tenantId,
  userId,
  enablePluginMarketplace = true,
  enablePluginDevelopment = true,
  enablePluginAnalytics = true,
  enablePluginSecurity = true,
  onPluginInstalled,
  onPluginUpdated,
  onPluginRemoved
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<PluginSystemState>({
    isActive: false,
    isPaused: false,
    installedPlugins: [],
    availablePlugins: [],
    installations: [],
    analytics: {},
    marketplace: {
      featured: [],
      trending: [],
      new: [],
      categories: {} as Record<PluginCategory, BuilderPlugin[]>
    },
    metrics: {
      totalPlugins: 0,
      installedPlugins: 0,
      activePlugins: 0,
      totalDownloads: 0,
      averageRating: 0
    }
  });

  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showInstalled, setShowInstalled] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pluginSystemRef = useRef<NodeJS.Timeout | null>(null);
  const analyticsRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== PLUGIN REGISTRATION ====================
  const registerPlugin = useCallback((plugin: Omit<BuilderPlugin, 'id' | 'metadata'>) => {
    const newPlugin: BuilderPlugin = {
      ...plugin,
      id: `plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        size: Math.random() * 1000 + 100,
        enabled: true,
        settings: {}
      }
    };

    setState(prev => ({
      ...prev,
      availablePlugins: [...prev.availablePlugins, newPlugin],
      marketplace: {
        ...prev.marketplace,
        categories: {
          ...prev.marketplace.categories,
          [plugin.category]: [...(prev.marketplace.categories[plugin.category] || []), newPlugin]
        }
      },
      metrics: {
        ...prev.metrics,
        totalPlugins: prev.metrics.totalPlugins + 1
      }
    }));

    return newPlugin.id;
  }, []);

  const installPlugin = useCallback(async (pluginId: string) => {
    const plugin = state.availablePlugins.find(p => p.id === pluginId);
    if (!plugin) return;

    // Create installation record
    const installation: PluginInstallation = {
      id: `install-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pluginId,
      timestamp: new Date(),
      status: 'installing',
      progress: 0
    };

    setState(prev => ({
      ...prev,
      installations: [...prev.installations, installation]
    }));

    // Simulate installation process
    const installSteps = [
      { progress: 20, message: 'Downloading plugin...' },
      { progress: 40, message: 'Verifying security...' },
      { progress: 60, message: 'Installing dependencies...' },
      { progress: 80, message: 'Configuring plugin...' },
      { progress: 100, message: 'Installation complete!' }
    ];

    for (let i = 0; i < installSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        installations: prev.installations.map(inst =>
          inst.id === installation.id
            ? { ...inst, progress: installSteps[i].progress }
            : inst
        )
      }));
    }

    // Complete installation
    const installedPlugin: BuilderPlugin = {
      ...plugin,
      metadata: {
        ...plugin.metadata,
        installDate: new Date(),
        enabled: true
      }
    };

    setState(prev => ({
      ...prev,
      installedPlugins: [...prev.installedPlugins, installedPlugin],
      installations: prev.installations.filter(inst => inst.id !== installation.id),
      metrics: {
        ...prev.metrics,
        installedPlugins: prev.metrics.installedPlugins + 1,
        activePlugins: prev.metrics.activePlugins + 1,
        totalDownloads: prev.metrics.totalDownloads + 1
      }
    }));

    onPluginInstalled?.(installedPlugin);
  }, [state.availablePlugins, onPluginInstalled]);

  const uninstallPlugin = useCallback((pluginId: string) => {
    setState(prev => ({
      ...prev,
      installedPlugins: prev.installedPlugins.filter(p => p.id !== pluginId),
      metrics: {
        ...prev.metrics,
        installedPlugins: prev.metrics.installedPlugins - 1,
        activePlugins: prev.metrics.activePlugins - 1
      }
    }));

    onPluginRemoved?.(pluginId);
  }, [onPluginRemoved]);

  const updatePlugin = useCallback(async (pluginId: string) => {
    const plugin = state.installedPlugins.find(p => p.id === pluginId);
    if (!plugin) return;

    // Simulate update process
    const updatedPlugin: BuilderPlugin = {
      ...plugin,
      version: `${parseFloat(plugin.version) + 0.1}`.slice(0, 4),
      lastUpdated: new Date()
    };

    setState(prev => ({
      ...prev,
      installedPlugins: prev.installedPlugins.map(p =>
        p.id === pluginId ? updatedPlugin : p
      )
    }));

    onPluginUpdated?.(updatedPlugin);
  }, [state.installedPlugins, onPluginUpdated]);

  // ==================== PLUGIN ANALYTICS ====================
  const trackPluginUsage = useCallback((pluginId: string, featureId: string) => {
    setState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [pluginId]: {
          ...prev.analytics[pluginId],
          usage: {
            totalUses: (prev.analytics[pluginId]?.usage.totalUses || 0) + 1,
            dailyUses: (prev.analytics[pluginId]?.usage.dailyUses || 0) + 1,
            weeklyUses: (prev.analytics[pluginId]?.usage.weeklyUses || 0) + 1,
            monthlyUses: (prev.analytics[pluginId]?.usage.monthlyUses || 0) + 1
          }
        }
      }
    }));
  }, []);

  const generatePluginAnalytics = useCallback(() => {
    const analytics: Record<string, PluginAnalytics> = {};

    state.installedPlugins.forEach(plugin => {
      analytics[plugin.id] = {
        pluginId: plugin.id,
        usage: {
          totalUses: Math.floor(Math.random() * 1000) + 10,
          dailyUses: Math.floor(Math.random() * 50) + 1,
          weeklyUses: Math.floor(Math.random() * 200) + 5,
          monthlyUses: Math.floor(Math.random() * 500) + 20
        },
        performance: {
          averageLoadTime: Math.random() * 100 + 10,
          memoryUsage: Math.random() * 50 + 5,
          errorRate: Math.random() * 0.1
        },
        userFeedback: {
          rating: Math.random() * 2 + 3, // 3-5 stars
          reviews: []
        }
      };
    });

    setState(prev => ({ ...prev, analytics }));
  }, [state.installedPlugins]);

  // ==================== PLUGIN SECURITY ====================
  const verifyPluginSecurity = useCallback((plugin: BuilderPlugin): boolean => {
    // Simulate security verification
    const securityChecks = [
      plugin.security.verified,
      plugin.security.sandboxed,
      plugin.security.permissions.length < 10,
      plugin.security.securityScore > 0.7
    ];

    return securityChecks.every(check => check);
  }, []);

  const scanPluginForVulnerabilities = useCallback((plugin: BuilderPlugin): string[] => {
    const vulnerabilities: string[] = [];

    if (plugin.security.permissions.length > 20) {
      vulnerabilities.push('Excessive permissions requested');
    }

    if (plugin.security.securityScore < 0.5) {
      vulnerabilities.push('Low security score detected');
    }

    if (!plugin.security.sandboxed) {
      vulnerabilities.push('Plugin not sandboxed');
    }

    return vulnerabilities;
  }, []);

  // ==================== PLUGIN SYSTEM CONTROL ====================
  const startPluginSystem = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));

    if (enablePluginAnalytics) {
      analyticsRef.current = setInterval(() => {
        generatePluginAnalytics();
      }, 30000); // Every 30 seconds
    }

    if (enablePluginMarketplace) {
      pluginSystemRef.current = setInterval(() => {
        // Simulate marketplace updates
        setState(prev => ({
          ...prev,
          marketplace: {
            ...prev.marketplace,
            trending: prev.marketplace.trending.slice(1).concat(prev.marketplace.trending[0])
          }
        }));
      }, 60000); // Every minute
    }
  }, [enablePluginAnalytics, enablePluginMarketplace, generatePluginAnalytics]);

  const pausePluginSystem = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (pluginSystemRef.current) {
      clearInterval(pluginSystemRef.current);
      pluginSystemRef.current = null;
    }
  }, []);

  const resumePluginSystem = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startPluginSystem();
  }, [startPluginSystem]);

  const stopPluginSystem = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));

    if (pluginSystemRef.current) {
      clearInterval(pluginSystemRef.current);
      pluginSystemRef.current = null;
    }

    if (analyticsRef.current) {
      clearInterval(analyticsRef.current);
      analyticsRef.current = null;
    }
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Initialize sample plugins
    const samplePlugins: BuilderPlugin[] = [
      {
        id: 'plugin-1',
        name: 'Advanced Data Table',
        description: 'Enterprise-grade data table with sorting, filtering, and pagination',
        version: '1.2.0',
        author: 'DataViz Team',
        publisher: 'Enterprise Solutions',
        category: 'data-visualization',
        tags: ['table', 'data', 'enterprise'],
        icon: '📊',
        repository: 'https://github.com/enterprise/data-table',
        documentation: 'https://docs.enterprise.com/data-table',
        license: 'MIT',
        price: 0,
        rating: 4.8,
        downloads: 15420,
        reviews: 342,
        lastUpdated: new Date(),
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0',
          dependencies: ['@aibos/ui-components']
        },
        security: {
          verified: true,
          securityScore: 0.95,
          permissions: ['ui.table', 'data.read'],
          sandboxed: true
        },
        features: [
          {
            id: 'feature-1',
            name: 'Sortable Columns',
            description: 'Click column headers to sort data',
            type: 'component',
            configurable: true,
            settings: { defaultSort: 'name', sortDirection: 'asc' }
          }
        ],
        metadata: {
          size: 245,
          enabled: true,
          settings: {}
        }
      },
      {
        id: 'plugin-2',
        name: 'AI Form Assistant',
        description: 'AI-powered form validation and auto-completion',
        version: '2.1.0',
        author: 'AI Labs',
        publisher: 'AI Innovations',
        category: 'ai-tools',
        tags: ['ai', 'forms', 'validation'],
        icon: '🤖',
        repository: 'https://github.com/ai-labs/form-assistant',
        documentation: 'https://docs.ai-labs.com/form-assistant',
        license: 'Commercial',
        price: 29.99,
        rating: 4.9,
        downloads: 8920,
        reviews: 156,
        lastUpdated: new Date(),
        compatibility: {
          minVersion: '1.5.0',
          maxVersion: '3.0.0',
          dependencies: ['@aibos/ai-engine']
        },
        security: {
          verified: true,
          securityScore: 0.88,
          permissions: ['ai.process', 'data.write'],
          sandboxed: true
        },
        features: [
          {
            id: 'feature-2',
            name: 'Auto-Complete',
            description: 'AI-powered field auto-completion',
            type: 'component',
            configurable: true,
            settings: { enableAutoComplete: true, confidence: 0.8 }
          }
        ],
        metadata: {
          size: 512,
          enabled: true,
          settings: {}
        }
      }
    ];

    setState(prev => ({
      ...prev,
      availablePlugins: samplePlugins,
      marketplace: {
        featured: samplePlugins.slice(0, 3),
        trending: samplePlugins.slice(1, 4),
        new: samplePlugins.slice(2, 5),
        categories: {
          'ui-components': samplePlugins.filter(p => p.category === 'ui-components'),
          'data-visualization': samplePlugins.filter(p => p.category === 'data-visualization'),
          'forms-validation': samplePlugins.filter(p => p.category === 'forms-validation'),
          'navigation': samplePlugins.filter(p => p.category === 'navigation'),
          'authentication': samplePlugins.filter(p => p.category === 'authentication'),
          'integrations': samplePlugins.filter(p => p.category === 'integrations'),
          'utilities': samplePlugins.filter(p => p.category === 'utilities'),
          'themes': samplePlugins.filter(p => p.category === 'themes'),
          'ai-tools': samplePlugins.filter(p => p.category === 'ai-tools'),
          'analytics': samplePlugins.filter(p => p.category === 'analytics')
        }
      },
      installedPlugins: [],
      pendingInstallations: [],
      analytics: {}
    }));

    if (enablePluginMarketplace || enablePluginAnalytics) {
      startPluginSystem();
    }

    return () => {
      stopPluginSystem();
    };
  }, [enablePluginMarketplace, enablePluginAnalytics, startPluginSystem, stopPluginSystem]);

  // ==================== RENDER ====================
  const filteredPlugins = state.availablePlugins.filter(plugin => {
    if (selectedCategory !== 'all' && plugin.category !== selectedCategory) return false;
    if (searchQuery && !plugin.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Builder Plugin System</h2>

          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 w-64"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="all">All Categories</option>
            <option value="ui-components">UI Components</option>
            <option value="data-visualization">Data Visualization</option>
            <option value="forms-validation">Forms & Validation</option>
            <option value="ai-tools">AI Tools</option>
            <option value="integrations">Integrations</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!state.isActive ? (
              <button
                onClick={startPluginSystem}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumePluginSystem}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pausePluginSystem}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopPluginSystem}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMarketplace(!showMarketplace)}
              className={`p-2 rounded ${showMarketplace ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowInstalled(!showInstalled)}
              className={`p-2 rounded ${showInstalled ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded ${showAnalytics ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDevelopment(!showDevelopment)}
              className={`p-2 rounded ${showDevelopment ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== PLUGIN MARKETPLACE ==================== */}
        <div className="flex-1 p-4">
          {/* Plugin Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.metrics.totalPlugins}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Plugins</div>
                </div>
                <Puzzle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.metrics.installedPlugins}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Installed</div>
                </div>
                <Download className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {state.metrics.totalDownloads}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {state.metrics.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</div>
                </div>
                <Star className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Plugin Grid */}
          <AnimatePresence>
            {showMarketplace && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plugin Marketplace</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlugins.map((plugin) => (
                    <motion.div
                      key={plugin.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{plugin.icon}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{plugin.rating}</span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{plugin.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plugin.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{plugin.author}</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {plugin.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
                        </span>
                        <button
                          onClick={() => installPlugin(plugin.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Install
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Installed Plugins Panel */}
          <AnimatePresence>
            {showInstalled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Installed Plugins</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.installedPlugins.map((plugin) => (
                      <div key={plugin.id} className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div className="font-medium text-green-600 dark:text-green-400">{plugin.name}</div>
                        <div className="text-green-500 dark:text-green-300">v{plugin.version}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Installed: {plugin.metadata.installDate?.toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updatePlugin(plugin.id)}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => uninstallPlugin(plugin.id)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analytics Panel */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plugin Analytics</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {Object.entries(state.analytics).map(([pluginId, analytics]) => {
                      const plugin = state.installedPlugins.find(p => p.id === pluginId);
                      return (
                        <div key={pluginId} className="text-sm bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                          <div className="font-medium text-purple-600 dark:text-purple-400">
                            {plugin?.name || 'Unknown Plugin'}
                          </div>
                          <div className="text-purple-500 dark:text-purple-300">
                            {analytics.usage.totalUses} uses • {analytics.performance.averageLoadTime.toFixed(1)}ms
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Rating: {analytics.userFeedback.rating.toFixed(1)}/5
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Development Panel */}
          <AnimatePresence>
            {showDevelopment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plugin Development</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Create New Plugin
                    </button>
                    <button className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Upload Plugin
                    </button>
                    <button className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                      Plugin Documentation
                    </button>
                    <button className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                      Developer Tools
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BuilderPluginSystem;
