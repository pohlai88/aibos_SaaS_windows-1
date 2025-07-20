'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Globe,
  Database,
  Cpu,
  Memory,
  HardDrive
} from 'lucide-react';
import { ConcurrentUsersService, ConcurrentUserMetrics } from '@aibos/ledger-sdk';

interface ConcurrentUsersDashboardProps {
  redisUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export default function ConcurrentUsersDashboard({
  redisUrl,
  supabaseUrl,
  supabaseKey
}: ConcurrentUsersDashboardProps) {
  const [metrics, setMetrics] = useState<ConcurrentUserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<Array<{ timestamp: string; count: number }>>([]);
  const [realtimeCount, setRealtimeCount] = useState(0);

  const [concurrentUsersService] = useState(() => 
    new ConcurrentUsersService(redisUrl, supabaseUrl, supabaseKey)
  );

  useEffect(() => {
    loadMetrics();
    loadTrend();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(() => {
      loadMetrics();
      loadRealtimeCount();
    }, 10000);

    // Load trend data every minute
    const trendInterval = setInterval(() => {
      loadTrend();
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(trendInterval);
    };
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await concurrentUsersService.getConcurrentUserMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrend = async () => {
    try {
      const data = await concurrentUsersService.getConcurrentUsersTrend();
      setTrend(data);
    } catch (err) {
      console.error('Error loading trend:', err);
    }
  };

  const loadRealtimeCount = async () => {
    try {
      const count = await concurrentUsersService.getRealtimeConcurrentUsers();
      setRealtimeCount(count);
    } catch (err) {
      console.error('Error loading realtime count:', err);
    }
  };

  const getStatusColor = (current: number, peak: number) => {
    const ratio = current / peak;
    if (ratio > 0.8) return 'text-red-600';
    if (ratio > 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (current: number, peak: number) => {
    const ratio = current / peak;
    if (ratio > 0.8) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (ratio > 0.6) return <Clock className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Concurrent Users Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time monitoring of platform usage and performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(metrics.current, metrics.peak)}
                <span className={`text-sm font-medium ${getStatusColor(metrics.current, metrics.peak)}`}>
                  {metrics.current > metrics.peak * 0.8 ? 'High Load' : 
                   metrics.current > metrics.peak * 0.6 ? 'Moderate Load' : 'Normal Load'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Concurrent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Users</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.current}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Active in last minute
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Peak Concurrent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Users</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.peak}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 24 hours
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Average Concurrent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Users</p>
                <p className="text-3xl font-bold text-green-600">{metrics.average}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last hour
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className={`text-3xl font-bold ${metrics.errorRate > 0.1 ? 'text-red-600' : 'text-gray-600'}`}>
                  {(metrics.errorRate * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Failed requests
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metrics.errorRate > 0.1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Activity className={`w-6 h-6 ${metrics.errorRate > 0.1 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">P50 (Median)</span>
                <span className="font-medium">{metrics.responseTime.p50}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">P95</span>
                <span className="font-medium">{metrics.responseTime.p95}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">P99</span>
                <span className="font-medium">{metrics.responseTime.p99}ms</span>
              </div>
            </div>
          </div>

          {/* Resource Utilization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    CPU
                  </span>
                  <span className="font-medium">{metrics.resourceUtilization.cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metrics.resourceUtilization.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${metrics.resourceUtilization.cpu}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Memory className="w-4 h-4 mr-2" />
                    Memory
                  </span>
                  <span className="font-medium">{metrics.resourceUtilization.memory}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metrics.resourceUtilization.memory > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${metrics.resourceUtilization.memory}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Database
                  </span>
                  <span className="font-medium">{metrics.resourceUtilization.database}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metrics.resourceUtilization.database > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${metrics.resourceUtilization.database}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* By Module */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Module</h3>
            <div className="space-y-3">
              {Object.entries(metrics.byModule).map(([module, count]) => (
                <div key={module} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {module}
                  </span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Organization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Organizations</h3>
            <div className="space-y-3">
              {Object.entries(metrics.byOrganization).slice(0, 5).map(([orgId, count]) => (
                <div key={orgId} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {orgId.substring(0, 8)}...
                  </span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Concurrent Users Trend (24h)</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {trend.map((point, index) => {
              const maxCount = Math.max(...trend.map(p => p.count));
              const height = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(point.timestamp).getHours()}:00
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 