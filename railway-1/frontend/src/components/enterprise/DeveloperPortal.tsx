'use client';

import React, { useState, useEffect } from 'react';

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
}

interface DeveloperPortalProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableRealtime?: boolean;
}

// Simple SelfHealingProvider component
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
  const [installedModules, setInstalledModules] = useState<string[]>([]);

  // Sample modules data
  const sampleModules: Module[] = [
    {
      id: '1',
      name: 'Advanced Data Grid',
      version: '2.1.0',
      description: 'High-performance data grid with sorting, filtering, and virtualization',
      category: 'data',
      downloads: 15420,
      rating: 4.8,
      price: 29.99,
      isInstalled: false
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
      isInstalled: true
    },
    {
      id: '3',
      name: 'Security Audit Logger',
      version: '1.2.1',
      description: 'Comprehensive security audit logging for compliance',
      category: 'security',
      downloads: 5670,
      rating: 4.9,
      price: 39.99,
      isInstalled: false
    },
    {
      id: '4',
      name: 'Analytics Dashboard',
      version: '3.0.0',
      description: 'Real-time analytics dashboard with customizable widgets',
      category: 'analytics',
      downloads: 12340,
      rating: 4.7,
      price: 59.99,
      isInstalled: false
    },
    {
      id: '5',
      name: 'UI Component Library',
      version: '1.8.3',
      description: 'Complete set of enterprise-grade UI components',
      category: 'ui',
      downloads: 23450,
      rating: 4.5,
      price: 19.99,
      isInstalled: true
    }
  ];

  // Initialize
  useEffect(() => {
    setTimeout(() => {
      setModules(sampleModules);
      setInstalledModules(['2', '5']); // AI Chat Assistant and UI Component Library
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter modules
  const filteredModules = modules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Install module
  const installModule = (moduleId: string) => {
    setInstalledModules(prev => [...prev, moduleId]);
    setModules(prev => prev.map(module =>
      module.id === moduleId ? { ...module, isInstalled: true } : module
    ));
  };

  // Uninstall module
  const uninstallModule = (moduleId: string) => {
    setInstalledModules(prev => prev.filter(id => id !== moduleId));
    setModules(prev => prev.map(module =>
      module.id === moduleId ? { ...module, isInstalled: false } : module
    ));
  };

  // Categories
  const categories = [
    { id: 'all', name: 'All Modules', icon: '📦' },
    { id: 'ui', name: 'UI Components', icon: '🎨' },
    { id: 'data', name: 'Data & Analytics', icon: '📊' },
    { id: 'ai', name: 'AI & ML', icon: '🤖' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
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

  return (
    <SelfHealingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Discover, install, and manage modules for your AI-BOS applications
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {enableAI && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    🤖 AI Assistant
                  </button>
                )}
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  📦 My Modules ({installedModules.length})
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Modules</p>
                  <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Installed</p>
                  <p className="text-2xl font-bold text-gray-900">{installedModules.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.7</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">📥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">65.8K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">v{module.version}</p>
                      <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        module.category === 'ui' ? 'bg-blue-100 text-blue-800' :
                        module.category === 'data' ? 'bg-green-100 text-green-800' :
                        module.category === 'ai' ? 'bg-purple-100 text-purple-800' :
                        module.category === 'security' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {module.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📥 {module.downloads.toLocaleString()}</span>
                      <span>⭐ {module.rating}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      ${module.price}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {module.isInstalled ? (
                      <button
                        onClick={() => uninstallModule(module.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Uninstall
                      </button>
                    ) : (
                      <button
                        onClick={() => installModule(module.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Install
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* AI Recommendations */}
          {enableAI && (
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Based on your usage</h4>
                  <p className="text-sm text-gray-600 mb-3">We recommend the Analytics Dashboard for better insights</p>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Learn More →
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Popular in your industry</h4>
                  <p className="text-sm text-gray-600 mb-3">Security Audit Logger is trending among similar companies</p>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Learn More →
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Performance boost</h4>
                  <p className="text-sm text-gray-600 mb-3">Advanced Data Grid can improve your app's performance by 40%</p>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SelfHealingProvider>
  );
};

export default DeveloperPortal;
