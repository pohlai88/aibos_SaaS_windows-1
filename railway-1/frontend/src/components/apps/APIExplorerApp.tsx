'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Search, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAIBOSStore } from '@/lib/store';

// ==================== API EXPLORER APP ====================

const APIExplorerApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);
  const { addNotification } = useAIBOSStore();

  // ==================== API ENDPOINTS ====================

  const apiEndpoints = [
    {
      id: 'auth-login',
      name: 'User Login',
      method: 'POST',
      path: '/api/auth/login',
      description: 'Authenticate user with email and password',
      category: 'Authentication',
      requiresAuth: false
    },
    {
      id: 'consciousness-status',
      name: 'Consciousness Status',
      method: 'GET',
      path: '/api/consciousness/status',
      description: 'Get current consciousness engine status',
      category: 'Consciousness',
      requiresAuth: true
    },
    {
      id: 'workspace-list',
      name: 'List Workspaces',
      method: 'GET',
      path: '/api/workspaces',
      description: 'Get all user workspaces',
      category: 'Workspaces',
      requiresAuth: true
    }
  ];

  // ==================== UTILITY FUNCTIONS ====================

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const executeRequest = useCallback(async (endpoint: any) => {
    setIsRequesting(true);
    const startTime = Date.now();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = {
        status: 200,
        time: Date.now() - startTime,
        data: { success: true, message: 'Request successful' }
      };

      setRequestHistory(prev => [...prev, { endpoint, response, timestamp: new Date() }]);

      addNotification({
        type: 'success',
        title: 'API Request Successful',
        message: `${endpoint.method} ${endpoint.path} completed in ${response.time}ms`,
        isRead: false
      });

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'API Request Failed',
        message: 'Request failed',
        isRead: false
      });
    } finally {
      setIsRequesting(false);
    }
  }, [addNotification]);

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">API Explorer</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interactive API testing and documentation
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4">
          {apiEndpoints
            .filter(endpoint =>
              endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((endpoint) => (
              <motion.div
                key={endpoint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <h3 className="font-medium">{endpoint.name}</h3>
                    {endpoint.requiresAuth && (
                      <Shield className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <button
                    onClick={() => executeRequest(endpoint)}
                    disabled={isRequesting}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isRequesting ? 'Executing...' : 'Test'}</span>
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {endpoint.path}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {endpoint.description}
                </p>
              </motion.div>
            ))}
        </div>

        {/* Request History */}
        {requestHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Request History</h2>
            <div className="space-y-3">
              {requestHistory.slice(-5).reverse().map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(item.endpoint.method)}`}>
                        {item.endpoint.method}
                      </span>
                      <span className="text-sm font-medium">{item.endpoint.path}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.response.time}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIExplorerApp;
