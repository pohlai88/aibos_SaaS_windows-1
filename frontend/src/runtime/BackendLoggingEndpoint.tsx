'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Upload, Download, Settings, Eye, Code, Play, Pause, RotateCcw, Globe, Shield, Zap, Activity, Clock, Users } from 'lucide-react';

// ==================== TYPES ====================
interface BackendLoggingEndpointProps {
  tenantId: string;
  userId: string;
  enableBatchExport?: boolean;
  enableRealTimeSync?: boolean;
  enableComplianceLogging?: boolean;
  enableMLIngestion?: boolean;
  onExportComplete?: (exportData: LogExport) => void;
  onSyncError?: (error: SyncError) => void;
  onComplianceViolation?: (violation: ComplianceViolation) => void;
}

interface LogExport {
  id: string;
  timestamp: Date;
  type: 'batch' | 'realtime' | 'compliance' | 'ml';
  data: LogData[];
  metadata: {
    tenantId: string;
    userId: string;
    source: string;
    format: 'json' | 'csv' | 'parquet';
    compression: 'none' | 'gzip' | 'brotli';
    size: number;
    recordCount: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface LogData {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: LogCategory;
  message: string;
  data: Record<string, any>;
  metadata: {
    tenantId: string;
    userId: string;
    sessionId: string;
    requestId: string;
    source: string;
    tags: string[];
  };
}

type LogCategory =
  | 'performance'
  | 'security'
  | 'user_activity'
  | 'system_health'
  | 'business_logic'
  | 'api_calls'
  | 'database_queries'
  | 'external_integrations'
  | 'compliance'
  | 'ml_events';

interface SyncError {
  id: string;
  timestamp: Date;
  type: 'network' | 'authentication' | 'authorization' | 'rate_limit' | 'server_error';
  message: string;
  details: Record<string, any>;
  retryable: boolean;
  retryCount: number;
}

interface ComplianceViolation {
  id: string;
  timestamp: Date;
  type: 'data_retention' | 'privacy' | 'security' | 'audit' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  data: Record<string, any>;
  action: 'log' | 'alert' | 'block' | 'report';
  resolved: boolean;
}

interface EndpointState {
  isActive: boolean;
  isPaused: boolean;
  exports: LogExport[];
  errors: SyncError[];
  violations: ComplianceViolation[];
  metrics: {
    totalExports: number;
    totalRecords: number;
    averageExportSize: number;
    successRate: number;
    averageLatency: number;
    activeConnections: number;
  };
  settings: {
    batchSize: number;
    exportInterval: number; // seconds
    retentionPeriod: number; // days
    compressionLevel: 'none' | 'gzip' | 'brotli';
    enableEncryption: boolean;
    enableCompression: boolean;
    enableRetry: boolean;
    maxRetries: number;
  };
  connection: {
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
    lastSync: Date | null;
    syncInterval: number;
    endpoint: string;
    apiKey: string;
  };
}

// ==================== BACKEND LOGGING ENDPOINT COMPONENT ====================
export const BackendLoggingEndpoint: React.FC<BackendLoggingEndpointProps> = ({
  tenantId,
  userId,
  enableBatchExport = true,
  enableRealTimeSync = true,
  enableComplianceLogging = true,
  enableMLIngestion = true,
  onExportComplete,
  onSyncError,
  onComplianceViolation
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<EndpointState>({
    isActive: false,
    isPaused: false,
    exports: [],
    errors: [],
    violations: [],
    metrics: {
      totalExports: 0,
      totalRecords: 0,
      averageExportSize: 0,
      successRate: 0,
      averageLatency: 0,
      activeConnections: 0
    },
    settings: {
      batchSize: 1000,
      exportInterval: 60,
      retentionPeriod: 90,
      compressionLevel: 'gzip',
      enableEncryption: true,
      enableCompression: true,
      enableRetry: true,
      maxRetries: 3
    },
    connection: {
      status: 'disconnected',
      lastSync: null,
      syncInterval: 30,
      endpoint: 'https://api.supabase.com/logs',
      apiKey: 'your-supabase-api-key'
    }
  });

  const [showExports, setShowExports] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedExport, setSelectedExport] = useState<LogExport | null>(null);

  const endpointRef = useRef<NodeJS.Timeout | null>(null);
  const syncRef = useRef<NodeJS.Timeout | null>(null);
  const logBuffer = useRef<LogData[]>([]);

  // ==================== LOGGING FUNCTIONS ====================
  const log = useCallback((level: LogData['level'], category: LogCategory, message: string, data: Record<string, any> = {}) => {
    const logEntry: LogData = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      metadata: {
        tenantId,
        userId,
        sessionId: `session-${Date.now()}`,
        requestId: `req-${Date.now()}`,
        source: 'BackendLoggingEndpoint',
        tags: [category, level]
      }
    };

    logBuffer.current.push(logEntry);

    // Check if buffer is full
    if (logBuffer.current.length >= state.settings.batchSize) {
      exportBatch();
    }

    // Check for compliance violations
    checkComplianceViolations(logEntry);
  }, [tenantId, userId, state.settings.batchSize]);

  const exportBatch = useCallback(async () => {
    if (logBuffer.current.length === 0) return;

    const batchData = [...logBuffer.current];
    logBuffer.current = [];

    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const exportData: LogExport = {
      id: exportId,
      timestamp: new Date(),
      type: 'batch',
      data: batchData,
      metadata: {
        tenantId,
        userId,
        source: 'batch_export',
        format: 'json',
        compression: state.settings.compressionLevel,
        size: JSON.stringify(batchData).length,
        recordCount: batchData.length
      },
      status: 'processing'
    };

    setState(prev => ({
      ...prev,
      exports: [...prev.exports, exportData],
      metrics: {
        ...prev.metrics,
        totalExports: prev.metrics.totalExports + 1,
        totalRecords: prev.metrics.totalRecords + batchData.length
      }
    }));

    try {
      // Simulate API call to Supabase
      await simulateSupabaseExport(exportData);

      const completedExport = { ...exportData, status: 'completed' as const };

      setState(prev => ({
        ...prev,
        exports: prev.exports.map(exp =>
          exp.id === exportId ? completedExport : exp
        ),
        metrics: {
          ...prev.metrics,
          successRate: (prev.metrics.successRate + 1) / 2
        }
      }));

      onExportComplete?.(completedExport);
    } catch (error: unknown) {
      const failedExport: LogExport = {
        ...exportData,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setState(prev => ({
        ...prev,
        exports: prev.exports.map(exp =>
          exp.id === exportId ? failedExport : exp
        ),
        errors: [...prev.errors, {
          id: `error-${Date.now()}`,
          timestamp: new Date(),
          type: 'server_error',
          message: 'Export failed',
          details: { exportId, error: error instanceof Error ? error.message : 'Unknown error' },
          retryable: true,
          retryCount: 0
        }]
      }));

      onSyncError?.({
        id: `error-${Date.now()}`,
        timestamp: new Date(),
        type: 'server_error',
        message: 'Export failed',
        details: { exportId, error: error instanceof Error ? error.message : 'Unknown error' },
        retryable: true,
        retryCount: 0
      });
    }
  }, [tenantId, userId, state.settings.compressionLevel, onExportComplete, onSyncError]);

  const simulateSupabaseExport = useCallback(async (exportData: LogExport): Promise<void> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
  }, []);

  // ==================== COMPLIANCE CHECKING ====================
  const checkComplianceViolations = useCallback((logEntry: LogData) => {
    const violations: ComplianceViolation[] = [];

    // Check for sensitive data
    if (logEntry.data.password || logEntry.data.creditCard || logEntry.data.ssn) {
      violations.push({
        id: `violation-${Date.now()}`,
        timestamp: new Date(),
        type: 'privacy',
        severity: 'high',
        description: 'Sensitive data detected in log entry',
        data: { logId: logEntry.id, category: logEntry.category },
        action: 'alert',
        resolved: false
      });
    }

    // Check for security events
    if (logEntry.category === 'security' && logEntry.level === 'error') {
      violations.push({
        id: `violation-${Date.now()}`,
        timestamp: new Date(),
        type: 'security',
        severity: 'critical',
        description: 'Security error detected',
        data: { logId: logEntry.id, message: logEntry.message },
        action: 'block',
        resolved: false
      });
    }

    // Check for data retention
    const logAge = Date.now() - logEntry.timestamp.getTime();
    const retentionMs = state.settings.retentionPeriod * 24 * 60 * 60 * 1000;

    if (logAge > retentionMs) {
      violations.push({
        id: `violation-${Date.now()}`,
        timestamp: new Date(),
        type: 'data_retention',
        severity: 'medium',
        description: 'Log entry exceeds retention period',
        data: { logId: logEntry.id, age: logAge, retention: retentionMs },
        action: 'log',
        resolved: false
      });
    }

    violations.forEach(violation => {
      setState(prev => ({
        ...prev,
        violations: [...prev.violations, violation]
      }));
      onComplianceViolation?.(violation);
    });
  }, [state.settings.retentionPeriod, onComplianceViolation]);

  // ==================== REAL-TIME SYNC ====================
  const startRealTimeSync = useCallback(() => {
    if (state.connection.status !== 'connected') {
      setState(prev => ({
        ...prev,
        connection: { ...prev.connection, status: 'connecting' }
      }));

      // Simulate connection
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          connection: {
            ...prev.connection,
            status: 'connected',
            lastSync: new Date()
          }
        }));
      }, 1000);
    }

    syncRef.current = setInterval(() => {
      if (logBuffer.current.length > 0) {
        exportBatch();
      }

      setState(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          lastSync: new Date()
        }
      }));
    }, state.connection.syncInterval * 1000);
  }, [state.connection.status, state.connection.syncInterval, exportBatch]);

  const stopRealTimeSync = useCallback(() => {
    if (syncRef.current) {
      clearInterval(syncRef.current);
      syncRef.current = null;
    }

    setState(prev => ({
      ...prev,
      connection: { ...prev.connection, status: 'disconnected' }
    }));
  }, []);

  // ==================== ENDPOINT CONTROL ====================
  const startEndpoint = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));

    if (enableBatchExport) {
      endpointRef.current = setInterval(() => {
        if (logBuffer.current.length > 0) {
          exportBatch();
        }
      }, state.settings.exportInterval * 1000);
    }

    if (enableRealTimeSync) {
      startRealTimeSync();
    }

    // Generate sample logs
    const sampleLogs = [
      { level: 'info', category: 'user_activity', message: 'User logged in', data: { userId, timestamp: Date.now() } },
      { level: 'info', category: 'api_calls', message: 'API request processed', data: { endpoint: '/api/users', method: 'GET' } },
      { level: 'warn', category: 'performance', message: 'Slow database query detected', data: { query: 'SELECT * FROM users', duration: 1500 } },
      { level: 'error', category: 'security', message: 'Failed authentication attempt', data: { ip: '192.168.1.1', reason: 'Invalid credentials' } }
    ];

    sampleLogs.forEach((logData, index) => {
      setTimeout(() => {
        log(logData.level as any, logData.category as any, logData.message, logData.data);
      }, index * 2000);
    });
  }, [enableBatchExport, enableRealTimeSync, state.settings.exportInterval, startRealTimeSync, log]);

  const pauseEndpoint = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (endpointRef.current) {
      clearInterval(endpointRef.current);
      endpointRef.current = null;
    }
  }, []);

  const resumeEndpoint = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startEndpoint();
  }, [startEndpoint]);

  const stopEndpoint = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));

    if (endpointRef.current) {
      clearInterval(endpointRef.current);
      endpointRef.current = null;
    }

    stopRealTimeSync();
  }, [stopRealTimeSync]);

  // ==================== EXPORT FUNCTIONS ====================
  const exportToSupabase = useCallback(async (data: LogData[], format: 'json' | 'csv' | 'parquet' = 'json') => {
    const exportData: LogExport = {
      id: `export-${Date.now()}`,
      timestamp: new Date(),
      type: 'batch',
      data,
      metadata: {
        tenantId,
        userId,
        source: 'manual_export',
        format,
        compression: state.settings.compressionLevel,
        size: JSON.stringify(data).length,
        recordCount: data.length
      },
      status: 'processing'
    };

    setState(prev => ({
      ...prev,
      exports: [...prev.exports, exportData]
    }));

    try {
      await simulateSupabaseExport(exportData);

      const completedExport = { ...exportData, status: 'completed' as const };
      setState(prev => ({
        ...prev,
        exports: prev.exports.map(exp =>
          exp.id === exportData.id ? completedExport : exp
        )
      }));

      onExportComplete?.(completedExport);
      return completedExport;
    } catch (error: unknown) {
      const failedExport = { ...exportData, status: 'failed' as const, error: error instanceof Error ? error.message : 'Unknown error' };
      setState(prev => ({
        ...prev,
        exports: prev.exports.map(exp =>
          exp.id === exportData.id ? failedExport : exp
        )
      }));
      throw error;
    }
  }, [tenantId, userId, state.settings.compressionLevel, onExportComplete]);

  const downloadExport = useCallback((exportData: LogExport) => {
    const blob = new Blob([JSON.stringify(exportData.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-export-${exportData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (enableBatchExport || enableRealTimeSync) {
      startEndpoint();
    }

    return () => {
      stopEndpoint();
    };
  }, [enableBatchExport, enableRealTimeSync, startEndpoint, stopEndpoint]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backend Logging Endpoint</h2>

          {/* Endpoint Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              state.connection.status === 'connected' ? 'bg-green-500' :
              state.connection.status === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.connection.status}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!state.isActive ? (
              <button
                onClick={startEndpoint}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeEndpoint}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseEndpoint}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopEndpoint}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>

            <button
              onClick={() => exportToSupabase(logBuffer.current)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Upload className="w-4 h-4 mr-1" />
              Export Now
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExports(!showExports)}
              className={`p-2 rounded ${showExports ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowErrors(!showErrors)}
              className={`p-2 rounded ${showErrors ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCompliance(!showCompliance)}
              className={`p-2 rounded ${showCompliance ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded ${showSettings ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== ENDPOINT OVERVIEW ==================== */}
        <div className="flex-1 p-4">
          {/* Endpoint Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.metrics.totalExports}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Exports</div>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.metrics.totalRecords}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Records</div>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(state.metrics.successRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {logBuffer.current.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Buffer Size</div>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Connection Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connection Information</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Endpoint</div>
                <div className="font-medium text-sm">{state.connection.endpoint}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                <div className="font-medium capitalize">{state.connection.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Last Sync</div>
                <div className="font-medium text-sm">
                  {state.connection.lastSync?.toLocaleTimeString() || 'Never'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Sync Interval</div>
                <div className="font-medium text-sm">{state.connection.syncInterval}s</div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Exports Panel */}
          <AnimatePresence>
            {showExports && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Exports</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.exports.slice(-5).map((exportData) => (
                      <div key={exportData.id} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          {exportData.type} Export
                        </div>
                        <div className="text-blue-500 dark:text-blue-300">
                          {exportData.metadata.recordCount} records • {exportData.metadata.size} bytes
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exportData.timestamp.toLocaleTimeString()} • {exportData.status}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => downloadExport(exportData)}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Errors Panel */}
          <AnimatePresence>
            {showErrors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sync Errors</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.errors.slice(-5).map((error) => (
                      <div key={error.id} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400">{error.type}</div>
                        <div className="text-red-500 dark:text-red-300">{error.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {error.timestamp.toLocaleTimeString()} • Retryable: {error.retryable ? 'Yes' : 'No'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compliance Panel */}
          <AnimatePresence>
            {showCompliance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Violations</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.violations.slice(-5).map((violation) => (
                      <div key={violation.id} className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div className="font-medium text-green-600 dark:text-green-400">{violation.type}</div>
                        <div className="text-green-500 dark:text-green-300">{violation.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {violation.timestamp.toLocaleTimeString()} • {violation.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endpoint Settings</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Batch Size
                      </label>
                      <input
                        type="number"
                        value={state.settings.batchSize}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, batchSize: parseInt(e.target.value) }
                        }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Export Interval (seconds)
                      </label>
                      <input
                        type="number"
                        value={state.settings.exportInterval}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, exportInterval: parseInt(e.target.value) }
                        }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Compression Level
                      </label>
                      <select
                        value={state.settings.compressionLevel}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, compressionLevel: e.target.value as any }
                        }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      >
                        <option value="none">None</option>
                        <option value="gzip">Gzip</option>
                        <option value="brotli">Brotli</option>
                      </select>
                    </div>
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

export default BackendLoggingEndpoint;
