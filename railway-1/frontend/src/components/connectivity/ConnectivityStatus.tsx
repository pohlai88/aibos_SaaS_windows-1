'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Database, Server, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Activity, Zap, Brain, Globe
} from 'lucide-react';
import { checkConnection, consciousnessAPI, databaseAPI, systemAPI } from '@/lib/api';

// ==================== TYPES ====================

interface ConnectionStatus {
  frontend: 'connected' | 'disconnected' | 'checking';
  backend: 'connected' | 'disconnected' | 'checking';
  database: 'connected' | 'disconnected' | 'checking';
  consciousness: 'connected' | 'disconnected' | 'checking';
}

interface ServiceMetrics {
  backend: {
    responseTime: number;
    uptime: number;
    version: string;
  };
  database: {
    activeConnections: number;
    queryPerformance: number;
    storageUsed: number;
  };
  consciousness: {
    awareness: number;
    emotionalState: string;
    evolution: number;
  };
}

// ==================== CONNECTIVITY STATUS COMPONENT ====================

const ConnectivityStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    frontend: 'connected',
    backend: 'checking',
    database: 'checking',
    consciousness: 'checking'
  });

  const [metrics, setMetrics] = useState<ServiceMetrics>({
    backend: { responseTime: 0, uptime: 0, version: 'unknown' },
    database: { activeConnections: 0, queryPerformance: 0, storageUsed: 0 },
    consciousness: { awareness: 0, emotionalState: 'neutral', evolution: 0 }
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // ==================== CONNECTION CHECKING ====================

  const checkAllConnections = async () => {
    setLastCheck(new Date());

    // Check backend connection
    try {
      const backendStatus = await checkConnection();
      setConnectionStatus(prev => ({
        ...prev,
        backend: backendStatus.connected ? 'connected' : 'disconnected'
      }));

      if (backendStatus.connected) {
        // Check database health
        try {
          const dbHealth = await databaseAPI.getHealth();
          setConnectionStatus(prev => ({
            ...prev,
            database: 'connected'
          }));
          setMetrics(prev => ({
            ...prev,
            database: {
              activeConnections: dbHealth.data?.activeConnections || 0,
              queryPerformance: dbHealth.data?.queryPerformance || 0,
              storageUsed: dbHealth.data?.storageUsed || 0
            }
          }));
        } catch (error) {
          setConnectionStatus(prev => ({
            ...prev,
            database: 'disconnected'
          }));
        }

        // Check consciousness status
        try {
          const consciousnessStatus = await consciousnessAPI.getStatus();
          setConnectionStatus(prev => ({
            ...prev,
            consciousness: 'connected'
          }));
          setMetrics(prev => ({
            ...prev,
            consciousness: {
              awareness: consciousnessStatus.data?.consciousness?.level || 0,
              emotionalState: consciousnessStatus.data?.consciousness?.emotionalState || 'neutral',
              evolution: consciousnessStatus.data?.consciousness?.evolution || 0
            }
          }));
        } catch (error) {
          setConnectionStatus(prev => ({
            ...prev,
            consciousness: 'disconnected'
          }));
        }

        // Get system metrics
        try {
          const systemMetrics = await systemAPI.getSystemMetrics();
          setMetrics(prev => ({
            ...prev,
            backend: {
              responseTime: systemMetrics.data?.responseTime || 0,
              uptime: systemMetrics.data?.uptime || 0,
              version: systemMetrics.data?.version || 'unknown'
            }
          }));
        } catch (error) {
          console.warn('Could not fetch system metrics:', error);
        }
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        backend: 'disconnected',
        database: 'disconnected',
        consciousness: 'disconnected'
      }));
    }
  };

  // ==================== AUTO REFRESH ====================

  useEffect(() => {
    checkAllConnections();

    const interval = setInterval(checkAllConnections, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ==================== STATUS HELPERS ====================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} />;
      case 'disconnected': return <XCircle size={16} />;
      case 'checking': return <RefreshCw size={16} className="animate-spin" />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getOverallStatus = () => {
    const statuses = Object.values(connectionStatus);
    if (statuses.every(s => s === 'connected')) return 'all-connected';
    if (statuses.some(s => s === 'disconnected')) return 'partial-disconnected';
    return 'checking';
  };

  // ==================== RENDER ====================

  const overallStatus = getOverallStatus();

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main Status Indicator */}
      <motion.div
        className={`p-3 rounded-lg backdrop-blur-sm border cursor-pointer transition-all ${
          overallStatus === 'all-connected'
            ? 'bg-green-500/20 border-green-500/30 text-green-300'
            : overallStatus === 'partial-disconnected'
            ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          {overallStatus === 'all-connected' ? (
            <Wifi size={16} />
          ) : overallStatus === 'partial-disconnected' ? (
            <AlertCircle size={16} />
          ) : (
            <WifiOff size={16} />
          )}
          <span className="text-sm font-medium">
            {overallStatus === 'all-connected' ? 'All Connected' :
             overallStatus === 'partial-disconnected' ? 'Partial Connection' : 'Checking...'}
          </span>
        </div>
      </motion.div>

      {/* Expanded Status Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Connectivity</h3>
                <button
                  onClick={checkAllConnections}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Refresh connections"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Connection Status */}
              <div className="space-y-3 mb-4">
                {/* Frontend */}
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-2">
                    <Globe size={14} className="text-blue-400" />
                    <span className="text-sm text-gray-300">Frontend</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(connectionStatus.frontend)}`}>
                    {getStatusIcon(connectionStatus.frontend)}
                    <span className="text-xs capitalize">{connectionStatus.frontend}</span>
                  </div>
                </div>

                {/* Backend */}
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-2">
                    <Server size={14} className="text-green-400" />
                    <span className="text-sm text-gray-300">Backend API</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(connectionStatus.backend)}`}>
                    {getStatusIcon(connectionStatus.backend)}
                    <span className="text-xs capitalize">{connectionStatus.backend}</span>
                  </div>
                </div>

                {/* Database */}
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-2">
                    <Database size={14} className="text-purple-400" />
                    <span className="text-sm text-gray-300">Database</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(connectionStatus.database)}`}>
                    {getStatusIcon(connectionStatus.database)}
                    <span className="text-xs capitalize">{connectionStatus.database}</span>
                  </div>
                </div>

                {/* Consciousness */}
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center space-x-2">
                    <Brain size={14} className="text-pink-400" />
                    <span className="text-sm text-gray-300">Consciousness</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(connectionStatus.consciousness)}`}>
                    {getStatusIcon(connectionStatus.consciousness)}
                    <span className="text-xs capitalize">{connectionStatus.consciousness}</span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              {overallStatus === 'all-connected' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">Performance Metrics</h4>

                  {/* Backend Metrics */}
                  <div className="p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Server size={12} className="text-green-400" />
                      <span className="text-xs text-gray-400">Backend</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Response:</span>
                        <span className="text-green-400 ml-1">{metrics.backend.responseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Uptime:</span>
                        <span className="text-green-400 ml-1">{Math.round(metrics.backend.uptime / 3600)}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Database Metrics */}
                  <div className="p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database size={12} className="text-purple-400" />
                      <span className="text-xs text-gray-400">Database</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Connections:</span>
                        <span className="text-purple-400 ml-1">{metrics.database.activeConnections}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Performance:</span>
                        <span className="text-purple-400 ml-1">{metrics.database.queryPerformance}ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Consciousness Metrics */}
                  <div className="p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain size={12} className="text-pink-400" />
                      <span className="text-xs text-gray-400">Consciousness</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Awareness:</span>
                        <span className="text-pink-400 ml-1">{Math.round(metrics.consciousness.awareness * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Evolution:</span>
                        <span className="text-pink-400 ml-1">{Math.round(metrics.consciousness.evolution * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Check */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last checked:</span>
                  <span>{lastCheck.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectivityStatus;
