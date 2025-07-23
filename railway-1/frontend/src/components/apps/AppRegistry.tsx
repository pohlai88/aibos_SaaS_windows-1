import React from 'react';
import { motion } from 'framer-motion';
import { AppRegistry as AppRegistryClass, AppConfig } from '../shell/AppContainer';
import CodeEditor from './CodeEditor';
import Terminal from './Terminal';

// ==================== APP CONFIGURATIONS ====================

const APP_CONFIGS: AppConfig[] = [
  {
    id: 'code-editor',
    name: 'Code Editor',
    icon: '📝',
    component: CodeEditor,
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: 100, y: 100 },
    category: 'development',
    features: [
      'Syntax Highlighting',
      'File Management',
      'AI Code Suggestions',
      'Real-time Collaboration',
      'Auto-save',
      'Multi-language Support'
    ],
    backendIntegration: {
      api: 'editor',
      websocket: 'editor-collaboration',
      realtime: true
    }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    component: Terminal,
    defaultSize: { width: 700, height: 500 },
    defaultPosition: { x: 200, y: 150 },
    category: 'development',
    features: [
      'Command Execution',
      'File System Operations',
      'Real-time Output',
      'Command History',
      'Auto-completion',
      'File Explorer'
    ],
    backendIntegration: {
      api: 'terminal',
      websocket: 'terminal-output',
      realtime: true
    }
  }
];

// ==================== APP REGISTRY INITIALIZATION ====================

class AppRegistryManager {
  private static instance: AppRegistryManager;
  private registry: AppRegistryClass;

  private constructor() {
    this.registry = AppRegistryClass.getInstance();
    this.initializeApps();
  }

  static getInstance(): AppRegistryManager {
    if (!AppRegistryManager.instance) {
      AppRegistryManager.instance = new AppRegistryManager();
    }
    return AppRegistryManager.instance;
  }

  private initializeApps(): void {
    // Register all apps
    APP_CONFIGS.forEach(config => {
      this.registry.registerApp(config);
    });

    console.log(`🚀 Registered ${APP_CONFIGS.length} apps in AppRegistry`);
  }

  // Get all available apps
  getAllApps(): AppConfig[] {
    return this.registry.getAllApps();
  }

  // Get apps by category
  getAppsByCategory(category: AppConfig['category']): AppConfig[] {
    return this.registry.getAllApps().filter(app => app.category === category);
  }

  // Get app by ID
  getApp(appId: string): AppConfig | undefined {
    return this.registry.getApp(appId);
  }

  // Get apps with backend integration
  getAppsWithBackend(): AppConfig[] {
    return this.registry.getAllApps().filter(app => app.backendIntegration);
  }

  // Get development apps
  getDevelopmentApps(): AppConfig[] {
    return this.getAppsByCategory('development');
  }

  // Get productivity apps
  getProductivityApps(): AppConfig[] {
    return this.getAppsByCategory('productivity');
  }

  // Get communication apps
  getCommunicationApps(): AppConfig[] {
    return this.getAppsByCategory('communication');
  }

  // Get entertainment apps
  getEntertainmentApps(): AppConfig[] {
    return this.getAppsByCategory('entertainment');
  }

  // Get system apps
  getSystemApps(): AppConfig[] {
    return this.getAppsByCategory('system');
  }

  // Search apps by name or features
  searchApps(query: string): AppConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.registry.getAllApps().filter(app =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.features.some(feature => feature.toLowerCase().includes(lowerQuery))
    );
  }

  // Get app statistics
  getAppStats() {
    const apps = this.registry.getAllApps();
    return {
      total: apps.length,
      byCategory: {
        development: apps.filter(app => app.category === 'development').length,
        productivity: apps.filter(app => app.category === 'productivity').length,
        communication: apps.filter(app => app.category === 'communication').length,
        entertainment: apps.filter(app => app.category === 'entertainment').length,
        system: apps.filter(app => app.category === 'system').length
      },
      withBackend: apps.filter(app => app.backendIntegration).length,
      withRealtime: apps.filter(app => app.backendIntegration?.realtime).length
    };
  }
}

// ==================== REACT COMPONENT FOR APP LAUNCHER ====================

interface AppLauncherProps {
  onAppLaunch?: (appId: string) => void;
  className?: string;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ onAppLaunch, className = '' }) => {
  const registryManager = AppRegistryManager.getInstance();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<AppConfig['category'] | 'all'>('all');

  const apps = React.useMemo(() => {
    let filteredApps = registryManager.getAllApps();

    if (selectedCategory !== 'all') {
      filteredApps = filteredApps.filter(app => app.category === selectedCategory);
    }

    if (searchQuery) {
      filteredApps = registryManager.searchApps(searchQuery);
    }

    return filteredApps;
  }, [searchQuery, selectedCategory]);

  const stats = React.useMemo(() => registryManager.getAppStats(), []);

  const handleAppLaunch = (appId: string) => {
    onAppLaunch?.(appId);
  };

  const categories = [
    { id: 'all', name: 'All Apps', count: stats.total },
    { id: 'development', name: 'Development', count: stats.byCategory.development },
    { id: 'productivity', name: 'Productivity', count: stats.byCategory.productivity },
    { id: 'communication', name: 'Communication', count: stats.byCategory.communication },
    { id: 'entertainment', name: 'Entertainment', count: stats.byCategory.entertainment },
    { id: 'system', name: 'System', count: stats.byCategory.system }
  ];

  return (
    <div className={`bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/20 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">App Launcher</h2>
        <p className="text-white/70 text-sm">
          {stats.total} apps available • {stats.withBackend} with backend integration
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-400"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as AppConfig['category'] | 'all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <motion.div
            key={app.id}
            className="p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-indigo-400/50 cursor-pointer transition-all hover:bg-slate-800/70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAppLaunch(app.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl">{app.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{app.name}</h3>
                <p className="text-xs text-white/50 mb-2 capitalize">{app.category}</p>

                <div className="space-y-1">
                  {app.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-xs text-white/60 flex items-center">
                      <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                      {feature}
                    </div>
                  ))}
                  {app.features.length > 3 && (
                    <div className="text-xs text-white/40">
                      +{app.features.length - 3} more features
                    </div>
                  )}
                </div>

                {app.backendIntegration && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-green-400">🔌 Backend</span>
                    {app.backendIntegration.realtime && (
                      <span className="text-xs text-blue-400">⚡ Realtime</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {apps.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-white/70">No apps found matching your search</div>
        </div>
      )}
    </div>
  );
};

// ==================== EXPORTS ====================

export { AppRegistryManager, AppLauncher };
export default AppRegistryManager;
