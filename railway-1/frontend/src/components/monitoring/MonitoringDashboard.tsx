import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive,
  Loader2, AlertCircle, XCircle, BarChart3, TrendingUp, Server,
  Database, Globe, Shield, Zap, Eye, Settings, RefreshCw
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: Date;
  services: ServiceStatus[];
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  throughput: number;
  activeConnections: number;
}

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  service: string;
  message: string;
  resolved: boolean;
}

export const MonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'performance' | 'errors'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { addNotification } = useAIBOSStore();

  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  const fetchMonitoringData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const healthResponse = await fetch('/api/monitoring/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData.data);
      }

      const performanceResponse = await fetch('/api/monitoring/performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceMetrics(performanceData.data);
      }

      const errorsResponse = await fetch('/api/monitoring/errors');
      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setErrorLogs(errorsData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
      addNotification({
        type: 'error',
        title: 'Monitoring Error',
        message: 'Unable to load system monitoring data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleResolveError = useCallback(async (errorId: string) => {
    try {
      const response = await fetch(`/api/monitoring/errors/${errorId}/resolve`, {
        method: 'POST'
      });

      if (response.ok) {
        setErrorLogs(prev => prev.map(error =>
          error.id === errorId ? { ...error, resolved: true } : error
        ));
        addNotification({
          type: 'success',
          title: 'Error Resolved',
          message: 'Error has been marked as resolved.',
          isRead: false
        });
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Resolution Failed',
        message: 'Failed to resolve error.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleRestartService = useCallback(async (serviceId: string) => {
    try {
      const response = await fetch(`/api/monitoring/services/${serviceId}/restart`, {
        method: 'POST'
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Service Restart',
          message: 'Service restart initiated successfully.',
          isRead: false
        });
        setTimeout(fetchMonitoringData, 3000);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Restart Failed',
        message: 'Failed to restart service.',
        isRead: false
      });
    }
  }, [addNotification, fetchMonitoringData]);

  useEffect(() => {
    fetchMonitoringData();

    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [fetchMonitoringData, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'offline': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const EmptyState: React.FC<{ icon: React.ComponentType<any>; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading monitoring data...</p>
    </div>
  );

  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">System Monitoring</h1>
              <p className="text-blue-100 text-sm">Real-time health, performance & error tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            <button
              onClick={fetchMonitoringData}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'health', label: 'System Health', icon: CheckCircle },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'errors', label: 'Error Logs', icon: AlertTriangle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMonitoringData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                {/* System Health Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                        <p className={`text-2xl font-bold ${getStatusColor(systemHealth?.overall || 'unknown').split(' ')[0]}`}>
                          {systemHealth?.overall || 'Unknown'}
                        </p>
                      </div>
                      {getStatusIcon(systemHealth?.overall || 'unknown')}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {performanceMetrics?.cpuUsage || 0}%
                        </p>
                      </div>
                      <Cpu className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Errors</p>
                        <p className="text-2xl font-bold text-red-600">
                          {errorLogs.filter(error => !error.resolved).length}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Service Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>
                  </div>
                  <div className="p-6">
                    {systemHealth?.services && systemHealth.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {systemHealth.services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(service.status)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {service.responseTime}ms
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                                {service.status}
                              </span>
                              {service.status === 'critical' && (
                                <button
                                  onClick={() => handleRestartService(service.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Restart
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Server}
                        title="No Services Found"
                        description="No services are currently being monitored."
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'health' && (
              <motion.div
                key="health"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health Details</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {systemHealth ? formatTimestamp(systemHealth.lastCheck) : 'N/A'}
                  </span>
                </div>

                {systemHealth ? (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overall System Health</h4>
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-lg ${getStatusColor(systemHealth.overall)}`}>
                          {getStatusIcon(systemHealth.overall)}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                            {systemHealth.overall}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            System uptime: {formatUptime(systemHealth.uptime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Service Details</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Service
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Response Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Errors
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {systemHealth.services.map((service) => (
                              <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getStatusIcon(service.status)}
                                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                      {service.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                                    {service.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {service.responseTime}ms
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {service.errorCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {service.status === 'critical' && (
                                    <button
                                      onClick={() => handleRestartService(service.id)}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Restart
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={CheckCircle}
                    title="No Health Data"
                    description="System health data is not available."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>

                {performanceMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Resources</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span className="font-medium">{performanceMetrics.cpuUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${performanceMetrics.cpuUsage > 80 ? 'bg-red-500' : performanceMetrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${performanceMetrics.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory Usage</span>
                            <span className="font-medium">{performanceMetrics.memoryUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${performanceMetrics.memoryUsage > 80 ? 'bg-red-500' : performanceMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${performanceMetrics.memoryUsage}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Disk Usage</span>
                            <span className="font-medium">{performanceMetrics.diskUsage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${performanceMetrics.diskUsage > 80 ? 'bg-red-500' : performanceMetrics.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${performanceMetrics.diskUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Network & Connections</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Network Latency</span>
                          <span className="font-medium">{performanceMetrics.networkLatency}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Throughput</span>
                          <span className="font-medium">{(performanceMetrics.throughput / 1024 / 1024).toFixed(2)} MB/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
                          <span className="font-medium">{performanceMetrics.activeConnections}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    title="No Performance Data"
                    description="Performance metrics are not available."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'errors' && (
              <motion.div
                key="errors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Logs</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {errorLogs.filter(error => !error.resolved).length} active errors
                    </span>
                  </div>
                </div>

                {errorLogs.length > 0 ? (
                  <div className="space-y-4">
                    {errorLogs.map((error) => (
                      <div key={error.id} className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${error.resolved ? 'opacity-60' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                error.level === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                error.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}>
                                {error.level.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{error.service}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTimestamp(error.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {error.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!error.resolved && (
                              <button
                                onClick={() => handleResolveError(error.id)}
                                className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Resolve
                              </button>
                            )}
                            {error.resolved && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={AlertTriangle}
                    title="No Errors Found"
                    description="No error logs are currently available."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
