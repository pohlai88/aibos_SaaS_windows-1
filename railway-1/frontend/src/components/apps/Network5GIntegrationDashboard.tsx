'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, Network, BarChart3, Zap, Plus, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Star, Code, Globe, Lock,
  Shield, Target, Smartphone, Monitor, Camera, Mic, Server,
  Cpu, Database, HardDrive, Gauge, ActivitySquare, Signal, Router
} from 'lucide-react';

import {
  network5GIntegration,
  NetworkType,
  NetworkStatus,
  SliceType,
  QoSLevel,
  SecurityLevel,
  Network5G,
  NetworkSlice,
  NetworkConnection,
  NetworkAnalytics,
  NetworkOptimization,
  SystemNetworkMetrics
} from '@/lib/5g-network-integration';

interface Network5GIntegrationDashboardProps {
  className?: string;
}

export default function Network5GIntegrationDashboard({ className = '' }: Network5GIntegrationDashboardProps) {
  const [networkMetrics, setNetworkMetrics] = useState<SystemNetworkMetrics | null>(null);
  const [networks, setNetworks] = useState<Network5G[]>([]);
  const [slices, setSlices] = useState<NetworkSlice[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [analytics, setAnalytics] = useState<NetworkAnalytics[]>([]);
  const [optimizations, setOptimizations] = useState<NetworkOptimization[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'networks' | 'slices' | 'connections' | 'analytics' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [networkForm, setNetworkForm] = useState({
    name: '',
    type: '5g_nr' as NetworkType,
    region: '',
    country: '',
    aiEnhanced: true,
    quantumOptimized: false
  });

  const [sliceForm, setSliceForm] = useState({
    networkId: '',
    name: '',
    type: 'embb' as SliceType,
    qosLevel: 'high_bandwidth' as QoSLevel,
    bandwidth: 1000,
    latency: 10,
    reliability: 0.99,
    priority: 1,
    aiEnhanced: true,
    quantumOptimized: false
  });

  const [connectionForm, setConnectionForm] = useState({
    sourceId: '',
    targetId: '',
    type: 'direct' as any,
    bandwidth: 1000,
    latency: 5,
    aiOptimized: true
  });

  useEffect(() => {
    initializeNetworkData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshNetworkData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeNetworkData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshNetworkData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshNetworkData = useCallback(async () => {
    try {
      // Real API call to backend 5G Network endpoint
      const response = await fetch('/api/5g-network-integration/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`5G Network API error: ${response.status}`);
      }

      const data = await response.json();
      setNetworkMetrics(data.metrics);
      setNetworks(data.networks || []);
      setSlices(data.slices || []);
      setConnections(data.connections || []);
      setAnalytics(data.analytics || []);
      setOptimizations(data.optimizations || []);
    } catch (err) {
      console.error('5G Network API error:', err);
      // Set empty state on error
      setNetworkMetrics(null);
      setNetworks([]);
      setSlices([]);
      setConnections([]);
      setAnalytics([]);
      setOptimizations([]);
    }
  }, []);

  const registerNetwork5G = useCallback(async () => {
    if (!networkForm.name || !networkForm.region || !networkForm.country) return;
    setIsLoading(true);
    try {
      // Real API call to register 5G network
      const response = await fetch('/api/5g-network-integration/networks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(networkForm),
      });

      if (!response.ok) {
        throw new Error(`Register network API error: ${response.status}`);
      }

      const network = await response.json();
      setNetworks(prev => [...prev, network]);
      setNetworkForm({ name: '', type: '5g_nr', region: '', country: '', aiEnhanced: true, quantumOptimized: false });
      await refreshNetworkData();
    } catch (err) {
      console.error('Register network API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [networkForm, refreshNetworkData]);

  const createNetworkSlice = useCallback(async () => {
    if (!sliceForm.networkId || !sliceForm.name) return;
    setIsLoading(true);
    try {
      // Real API call to create network slice
      const response = await fetch('/api/5g-network-integration/slices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sliceForm),
      });

      if (!response.ok) {
        throw new Error(`Create slice API error: ${response.status}`);
      }

      const slice = await response.json();
      setSlices(prev => [...prev, slice]);
      setSliceForm({
        networkId: '', name: '', type: 'embb', qosLevel: 'high_bandwidth',
        bandwidth: 1000, latency: 10, reliability: 0.99, priority: 1,
        aiEnhanced: true, quantumOptimized: false
      });
      await refreshNetworkData();
    } catch (err) {
      console.error('Create slice API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sliceForm, refreshNetworkData]);

  const establishConnection = useCallback(async () => {
    if (!connectionForm.sourceId || !connectionForm.targetId) return;
    setIsLoading(true);
    try {
      // Real API call to establish connection
      const response = await fetch('/api/5g-network-integration/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionForm),
      });

      if (!response.ok) {
        throw new Error(`Establish connection API error: ${response.status}`);
      }

      const connection = await response.json();
      setConnections(prev => [...prev, connection]);
      setConnectionForm({ sourceId: '', targetId: '', type: 'direct', bandwidth: 1000, latency: 5, aiOptimized: true });
      await refreshNetworkData();
    } catch (err) {
      console.error('Establish connection API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectionForm, refreshNetworkData]);

  const renderOverview = () => {
    if (!networkMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Wifi className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No 5G Network Data Available</h3>
            <p className="text-gray-400 mb-6">Start by registering your first 5G network to enable ultra-high-speed connectivity and network optimization.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Register Network
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Networks" value={networkMetrics.totalNetworks} icon={Wifi} color="blue" />
          <MetricCard title="Active Networks" value={networkMetrics.activeNetworks} icon={Network} color="green" />
          <MetricCard title="AI Enhancement" value={`${(networkMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Star} color="purple" />
          <MetricCard title="Network Slices" value={networkMetrics.totalSlices.toLocaleString()} icon={Router} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              5G Network Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Slices</span>
                <span className="text-blue-400 font-semibold">{networkMetrics.activeSlices}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Connections</span>
                <span className="text-green-400 font-semibold">{networkMetrics.activeConnections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Throughput</span>
                <span className="text-purple-400 font-semibold">{networkMetrics.averageThroughput.toLocaleString()} Mbps</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Latency</span>
                <span className="text-orange-400 font-semibold">{networkMetrics.averageLatency.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-indigo-400 font-semibold">{(networkMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-yellow-400 font-semibold">{networkMetrics.lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTab('create')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Register 5G Network
              </button>
              <button
                onClick={() => setSelectedTab('slices')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Create Network Slice
              </button>
              <button
                onClick={() => setSelectedTab('connections')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Establish Connection
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNetworks = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">5G Networks</h3>
          {networks.length === 0 ? (
            <div className="text-center py-8">
              <Wifi className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No 5G networks registered</p>
              <p className="text-sm text-gray-500">Register 5G networks to enable ultra-high-speed connectivity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {networks.map(network => (
                <div key={network.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{network.name}</h4>
                      <p className="text-gray-400 text-sm">Type: {network.type.toUpperCase()} | Location: {network.location.region}, {network.location.country}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {network.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {network.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        network.status === 'active' ? 'bg-green-600 text-white' :
                        network.status === 'inactive' ? 'bg-red-600 text-white' :
                        network.status === 'maintenance' ? 'bg-yellow-600 text-white' :
                        network.status === 'error' ? 'bg-red-600 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {network.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Slices: {network.slices.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Connections: {network.connections.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{network.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Downlink:</span>
                        <span className="text-white ml-2">{network.performance.throughput.downlink.toLocaleString()} Mbps</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Uplink:</span>
                        <span className="text-white ml-2">{network.performance.throughput.uplink.toLocaleString()} Mbps</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-white ml-2">{network.performance.latency.ultraLow}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Availability:</span>
                        <span className="text-white ml-2">{(network.performance.reliability.availability * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderSlices = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Network Slices</h3>
          {slices.length === 0 ? (
            <div className="text-center py-8">
              <Router className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No network slices created</p>
              <p className="text-sm text-gray-500">Create network slices to enable specialized services.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slices.map(slice => (
                <div key={slice.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{slice.name}</h4>
                      <p className="text-gray-400 text-sm">Type: {slice.type.toUpperCase()} | QoS: {slice.qos.level}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {slice.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {slice.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        slice.status === 'active' ? 'bg-green-600 text-white' :
                        slice.status === 'inactive' ? 'bg-red-600 text-white' :
                        slice.status === 'provisioning' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {slice.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Bandwidth: {slice.resources.bandwidth} Mbps</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Latency: {slice.qos.latency}ms</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Priority: {slice.qos.priority}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{slice.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Throughput:</span>
                        <span className="text-white ml-2">{slice.performance.throughput.toLocaleString()} Mbps</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reliability:</span>
                        <span className="text-white ml-2">{(slice.performance.reliability * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Utilization:</span>
                        <span className="text-white ml-2">{(slice.performance.utilization * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">CPU:</span>
                        <span className="text-white ml-2">{slice.resources.cpu} cores</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderConnections = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Network Connections</h3>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Signal className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No network connections established</p>
              <p className="text-sm text-gray-500">Establish connections to enable network communication.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map(connection => (
                <div key={connection.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Connection {connection.id.slice(0, 8)}...</h4>
                      <p className="text-gray-400 text-sm">Type: {connection.type} | Source: {connection.sourceId.slice(0, 8)}... → Target: {connection.targetId.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {connection.aiOptimized && <span className="text-blue-400 text-xs">AI</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        connection.status === 'active' ? 'bg-green-600 text-white' :
                        connection.status === 'inactive' ? 'bg-red-600 text-white' :
                        connection.status === 'error' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {connection.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Bandwidth: {connection.bandwidth.toLocaleString()} Mbps</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Latency: {connection.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderAnalytics = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Network Analytics</h3>
          {analytics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No analytics data available</p>
              <p className="text-sm text-gray-500">Analytics will be generated as networks process traffic.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map(analytic => (
                <div key={analytic.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{analytic.type} Analytics</h4>
                      <p className="text-gray-400 text-sm">Network: {analytic.networkId.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {analytic.aiGenerated && <span className="text-blue-400 text-xs">AI</span>}
                      {analytic.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Insights:</span>
                        <span className="text-white ml-2">{analytic.insights.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Anomalies:</span>
                        <span className="text-white ml-2">{analytic.data.anomalies.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Metrics:</span>
                        <span className="text-white ml-2">{Object.keys(analytic.data.metrics).length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Generated:</span>
                        <span className="text-white ml-2">{analytic.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderCreate = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Register 5G Network</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Network Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter network name"
                value={networkForm.name}
                onChange={e => setNetworkForm({ ...networkForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Network Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={networkForm.type}
                onChange={e => setNetworkForm({ ...networkForm, type: e.target.value as NetworkType })}
              >
                <option value="5g_nr">5G NR (New Radio)</option>
                <option value="5g_sa">5G SA (Standalone)</option>
                <option value="5g_nsa">5G NSA (Non-Standalone)</option>
                <option value="4g_lte">4G LTE</option>
                <option value="3g_umts">3G UMTS</option>
                <option value="2g_gsm">2G GSM</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Region</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter region"
                value={networkForm.region}
                onChange={e => setNetworkForm({ ...networkForm, region: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Country</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter country"
                value={networkForm.country}
                onChange={e => setNetworkForm({ ...networkForm, country: e.target.value })}
              />
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={networkForm.aiEnhanced}
                  onChange={e => setNetworkForm({ ...networkForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={networkForm.quantumOptimized}
                  onChange={e => setNetworkForm({ ...networkForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={registerNetwork5G}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !networkForm.name || !networkForm.region || !networkForm.country}
            >
              {isLoading ? 'Registering...' : 'Register Network'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Create Network Slice</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Network ID</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter network ID"
                value={sliceForm.networkId}
                onChange={e => setSliceForm({ ...sliceForm, networkId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Slice Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter slice name"
                value={sliceForm.name}
                onChange={e => setSliceForm({ ...sliceForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Slice Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={sliceForm.type}
                onChange={e => setSliceForm({ ...sliceForm, type: e.target.value as SliceType })}
              >
                <option value="embb">eMBB (Enhanced Mobile Broadband)</option>
                <option value="urllc">URLLC (Ultra-Reliable Low-Latency)</option>
                <option value="mmtc">mMTC (Massive Machine Type)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">QoS Level</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={sliceForm.qosLevel}
                onChange={e => setSliceForm({ ...sliceForm, qosLevel: e.target.value as QoSLevel })}
              >
                <option value="ultra_low_latency">Ultra Low Latency</option>
                <option value="high_bandwidth">High Bandwidth</option>
                <option value="massive_iot">Massive IoT</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Bandwidth (Mbps)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                  value={sliceForm.bandwidth}
                  onChange={e => setSliceForm({ ...sliceForm, bandwidth: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Latency (ms)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                  value={sliceForm.latency}
                  onChange={e => setSliceForm({ ...sliceForm, latency: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sliceForm.aiEnhanced}
                  onChange={e => setSliceForm({ ...sliceForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sliceForm.quantumOptimized}
                  onChange={e => setSliceForm({ ...sliceForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={createNetworkSlice}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !sliceForm.networkId || !sliceForm.name}
            >
              {isLoading ? 'Creating...' : 'Create Slice'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Establish Connection</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Source ID</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter source ID"
                value={connectionForm.sourceId}
                onChange={e => setConnectionForm({ ...connectionForm, sourceId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Target ID</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter target ID"
                value={connectionForm.targetId}
                onChange={e => setConnectionForm({ ...connectionForm, targetId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Connection Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={connectionForm.type}
                onChange={e => setConnectionForm({ ...connectionForm, type: e.target.value })}
              >
                <option value="direct">Direct</option>
                <option value="relay">Relay</option>
                <option value="mesh">Mesh</option>
                <option value="star">Star</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Bandwidth (Mbps)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                  value={connectionForm.bandwidth}
                  onChange={e => setConnectionForm({ ...connectionForm, bandwidth: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Latency (ms)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                  value={connectionForm.latency}
                  onChange={e => setConnectionForm({ ...connectionForm, latency: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={connectionForm.aiOptimized}
                  onChange={e => setConnectionForm({ ...connectionForm, aiOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Optimized</span>
              </label>
            </div>
            <button
              onClick={establishConnection}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !connectionForm.sourceId || !connectionForm.targetId}
            >
              {isLoading ? 'Establishing...' : 'Establish Connection'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <Wifi className="w-8 h-8 mr-3 text-blue-400" />
              5G Network Integration
            </h1>
            <button onClick={refreshNetworkData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'networks', 'slices', 'connections', 'analytics', 'create'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'networks' && renderNetworks()}
          {selectedTab === 'slices' && renderSlices()}
          {selectedTab === 'connections' && renderConnections()}
          {selectedTab === 'analytics' && renderAnalytics()}
          {selectedTab === 'create' && renderCreate()}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: React.ReactNode; icon: any; color: string }) => (
  <div className={`bg-${color}-500/20 p-4 border border-${color}-500/30 rounded-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-100`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
  </div>
);
