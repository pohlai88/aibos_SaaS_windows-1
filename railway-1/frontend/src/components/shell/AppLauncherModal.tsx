'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isInstalled: boolean;
  isFeatured: boolean;
  rating: number;
  developer: string;
  version: string;
  size: string;
}

interface AppLauncherModalProps {
  isVisible: boolean;
  onClose: () => void;
  onInstall: (app: App) => void;
}

const SAMPLE_APPS: App[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Central hub for monitoring and analytics',
    icon: '📊',
    category: 'Productivity',
    isInstalled: true,
    isFeatured: true,
    rating: 4.8,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '2.1 MB'
  },
  {
    id: 'tenants',
    name: 'Tenant Manager',
    description: 'Manage multi-tenant configurations',
    icon: '🏢',
    category: 'Administration',
    isInstalled: true,
    isFeatured: true,
    rating: 4.9,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '1.8 MB'
  },
  {
    id: 'modules',
    name: 'Module Registry',
    description: 'Browse and install system modules',
    icon: '📦',
    category: 'Development',
    isInstalled: false,
    isFeatured: true,
    rating: 4.7,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '3.2 MB'
  },
  {
    id: 'analytics',
    name: 'Analytics Suite',
    description: 'Advanced data visualization and insights',
    icon: '📈',
    category: 'Analytics',
    isInstalled: false,
    isFeatured: false,
    rating: 4.6,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '4.5 MB'
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'Configure system preferences and security',
    icon: '⚙️',
    category: 'System',
    isInstalled: true,
    isFeatured: false,
    rating: 4.5,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '1.2 MB'
  },
  {
    id: 'help',
    name: 'Help Center',
    description: 'Documentation and support resources',
    icon: '❓',
    category: 'Support',
    isInstalled: false,
    isFeatured: false,
    rating: 4.4,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '2.8 MB'
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Intelligent workflow automation',
    icon: '🤖',
    category: 'AI',
    isInstalled: false,
    isFeatured: true,
    rating: 4.9,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '5.1 MB'
  },
  {
    id: 'collaboration',
    name: 'Team Collaboration',
    description: 'Real-time team communication tools',
    icon: '👥',
    category: 'Collaboration',
    isInstalled: false,
    isFeatured: false,
    rating: 4.3,
    developer: 'AI-BOS Team',
    version: '1.0.0',
    size: '3.7 MB'
  }
];

const CATEGORIES = ['All', 'Productivity', 'Administration', 'Development', 'Analytics', 'System', 'Support', 'AI', 'Collaboration'];

export const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  isVisible,
  onClose,
  onInstall
}) => {
  const { trackEvent } = useSystemCore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'featured'>('featured');

  const filteredApps = useMemo(() => {
    let filtered = SAMPLE_APPS;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Sort apps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleInstall = (app: App) => {
    onInstall(app);
    trackEvent('app_installed', { appId: app.id, appName: app.name });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    trackEvent('app_launcher_category_changed', { category });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    trackEvent('app_launcher_search', { query });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🛍️</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                App Store
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover and install amazing apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* App Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No apps found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <motion.div
                  key={app.id}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* App Header */}
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{app.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {app.developer}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {app.rating}
                            </span>
                          </div>
                          {app.isFeatured && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* App Description */}
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {app.description}
                    </p>

                    {/* App Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>v{app.version}</span>
                      <span>{app.size}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleInstall(app)}
                      disabled={app.isInstalled}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        app.isInstalled
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {app.isInstalled ? '✓ Installed' : 'Install'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''} found</span>
            <span>AI-BOS App Store v1.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppLauncherModal;
