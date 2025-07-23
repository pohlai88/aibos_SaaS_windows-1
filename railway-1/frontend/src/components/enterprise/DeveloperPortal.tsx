'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Module {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'ui' | 'data' | 'ai' | 'security' | 'analytics';
  downloads: number;
  rating: number;
  price: number;
  isInstalled: boolean;
  author?: string;
  lastUpdated?: string;
  compatibility?: string[];
}

interface DeveloperPortalProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableRealtime?: boolean;
}

// Simple local SelfHealingProvider
const SelfHealingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({
  tenantId,
  userId,
  enableAI = true,
  enableRealtime = true
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installedModules, setInstalledModules] = useState<string[]>([]);

  // Fetch modules from API
  const fetchModules = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await api.get('/modules/marketplace');

      if (response.data.success) {
        setModules(response.data.data.modules || []);
        setInstalledModules(response.data.data.installed || []);
      } else {
        throw new Error(response.data.error || 'Failed to fetch modules');
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setError('Failed to load modules. Please try again.');

      // Fallback to basic modules if API fails
      setModules([
        {
          id: '1',
          name: 'Advanced Data Grid',
          version: '2.1.0',
          description: 'High-performance data grid with sorting, filtering, and virtualization',
          category: 'data',
          downloads: 15420,
          rating: 4.8,
          price: 29.99,
          isInstalled: false,
          author: 'AI-BOS Team',
          lastUpdated: '2024-01-15',
          compatibility: ['React 18+', 'TypeScript']
        },
        {
          id: '2',
          name: 'AI Chat Assistant',
          version: '1.5.2',
          description: 'Intelligent chat assistant with natural language processing',
          category: 'ai',
          downloads: 8920,
          rating: 4.6,
          price: 49.99,
          isInstalled: true,
          author: 'AI-BOS Team',
          lastUpdated: '2024-01-10',
          compatibility: ['React 18+', 'OpenAI API']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchModules();
  }, []); // Remove fetchModules dependency

  const installModule = async (moduleId: string) => {
    try {
      const response = await api.post(`/modules/${moduleId}/install`);

      if (response.data.success) {
        setInstalledModules(prev => [...prev, moduleId]);
        setModules(prev => prev.map(module =>
          module.id === moduleId ? { ...module, isInstalled: true } : module
        ));
        console.log(`✅ Module ${moduleId} installed successfully`);
      } else {
        throw new Error(response.data.error || 'Installation failed');
      }
    } catch (err) {
      console.error('Failed to install module:', err);
      alert('Failed to install module. Please try again.');
    }
  };

  const uninstallModule = async (moduleId: string) => {
    try {
      const response = await api.post(`/modules/${moduleId}/uninstall`);

      if (response.data.success) {
        setInstalledModules(prev => prev.filter(id => id !== moduleId));
        setModules(prev => prev.map(module =>
          module.id === moduleId ? { ...module, isInstalled: false } : module
        ));
        console.log(`✅ Module ${moduleId} uninstalled successfully`);
      } else {
        throw new Error(response.data.error || 'Uninstallation failed');
      }
    } catch (err) {
      console.error('Failed to uninstall module:', err);
      alert('Failed to uninstall module. Please try again.');
    }
  };

  // Filter modules based on category and search
  const filteredModules = modules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📦' },
    { id: 'ui', name: 'UI Components', icon: '🎨' },
    { id: 'data', name: 'Data & Analytics', icon: '📊' },
    { id: 'ai', name: 'AI & Machine Learning', icon: '🤖' },
    { id: 'security', name: 'Security & Compliance', icon: '🔒' },
    { id: 'analytics', name: 'Analytics & Monitoring', icon: '📈' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Developer Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Portal Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchModules}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SelfHealingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Discover and install powerful modules for your AI-BOS applications
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {enableAI && (
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    🤖 AI Assistant
                  </div>
                )}
                <button
                  onClick={fetchModules}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  id="module-search"
                  name="module-search"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search modules"
                />
              </div>

              {/* Category Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                      <p className="text-sm text-gray-500">v{module.version}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium">{module.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {module.category.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {module.downloads.toLocaleString()} downloads
                    </span>
                  </div>

                  {module.author && (
                    <div className="text-xs text-gray-500 mb-2">
                      By {module.author} • Updated {module.lastUpdated}
                    </div>
                  )}

                  {module.compatibility && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Compatible with:</div>
                      <div className="flex flex-wrap gap-1">
                        {module.compatibility.map((comp, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${module.price}
                    </span>
                    <button
                      onClick={() => module.isInstalled ? uninstallModule(module.id) : installModule(module.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        module.isInstalled
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {module.isInstalled ? 'Uninstall' : 'Install'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-500">
                Try adjusting your search or category filter to find what you&apos;re looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </SelfHealingProvider>
  );
};

export default DeveloperPortal;
