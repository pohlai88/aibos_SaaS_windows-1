'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Network, BarChart3, Zap, Plus, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Star, Code, Globe, Lock,
  Shield, Target, Smartphone, Monitor, Camera, Mic, Server,
  Wifi, Database, HardDrive, Gauge, ActivitySquare
} from 'lucide-react';

import {
  edgeComputingIntegration,
  EdgeNodeType,
  EdgeStatus,
  WorkloadType,
  NetworkType,
  SecurityLevel,
  EdgeNode,
  EdgeCluster,
  EdgeWorkload,
  EdgeAnalytics,
  EdgeOptimization,
  EdgeMetrics
} from '@/lib/edge-computing-integration';

interface EdgeComputingIntegrationDashboardProps {
  className?: string;
}

export default function EdgeComputingIntegrationDashboard({ className = '' }: EdgeComputingIntegrationDashboardProps) {
  const [edgeMetrics, setEdgeMetrics] = useState<EdgeMetrics | null>(null);
  const [nodes, setNodes] = useState<EdgeNode[]>([]);
  const [clusters, setClusters] = useState<EdgeCluster[]>([]);
  const [workloads, setWorkloads] = useState<EdgeWorkload[]>([]);
  const [analytics, setAnalytics] = useState<EdgeAnalytics[]>([]);
  const [optimizations, setOptimizations] = useState<EdgeOptimization[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'nodes' | 'clusters' | 'workloads' | 'analytics' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [nodeForm, setNodeForm] = useState({
    name: '',
    type: 'edge_server' as EdgeNodeType,
    region: '',
    country: '',
    aiEnhanced: true,
    quantumOptimized: false
  });

  const [clusterForm, setClusterForm] = useState({
    name: '',
    description: '',
    aiEnhanced: true,
    quantumOptimized: false
  });

  const [workloadForm, setWorkloadForm] = useState({
    nodeId: '',
    type: 'ai_inference' as WorkloadType,
    name: '',
    description: '',
    cpu: 1,
    memory: 1024,
    storage: 100,
    network: 100,
    gpu: 0,
    aiEnhanced: true,
    quantumOptimized: false
  });

  useEffect(() => {
    initializeEdgeData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshEdgeData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeEdgeData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshEdgeData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshEdgeData = useCallback(async () => {
    try {
      // Real API call to backend Edge Computing endpoint
      const response = await fetch('/api/edge-computing-integration/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Edge Computing API error: ${response.status}`);
      }

      const data = await response.json();
      setEdgeMetrics(data.metrics);
      setNodes(data.nodes || []);
      setClusters(data.clusters || []);
      setWorkloads(data.workloads || []);
      setAnalytics(data.analytics || []);
      setOptimizations(data.optimizations || []);
    } catch (err) {
      console.error('Edge Computing API error:', err);
      // Set empty state on error
      setEdgeMetrics(null);
      setNodes([]);
      setClusters([]);
      setWorkloads([]);
      setAnalytics([]);
      setOptimizations([]);
    }
  }, []);

  const registerEdgeNode = useCallback(async () => {
    if (!nodeForm.name || !nodeForm.region || !nodeForm.country) return;
    setIsLoading(true);
    try {
      // Real API call to register edge node
      const response = await fetch('/api/edge-computing-integration/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodeForm),
      });

      if (!response.ok) {
        throw new Error(`Register node API error: ${response.status}`);
      }

      const node = await response.json();
      setNodes(prev => [...prev, node]);
      setNodeForm({ name: '', type: 'edge_server', region: '', country: '', aiEnhanced: true, quantumOptimized: false });
      await refreshEdgeData();
    } catch (err) {
      console.error('Register node API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [nodeForm, refreshEdgeData]);

  const createEdgeCluster = useCallback(async () => {
    if (!clusterForm.name || !clusterForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to create edge cluster
      const response = await fetch('/api/edge-computing-integration/clusters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clusterForm),
      });

      if (!response.ok) {
        throw new Error(`Create cluster API error: ${response.status}`);
      }

      const cluster = await response.json();
      setClusters(prev => [...prev, cluster]);
      setClusterForm({ name: '', description: '', aiEnhanced: true, quantumOptimized: false });
      await refreshEdgeData();
    } catch (err) {
      console.error('Create cluster API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clusterForm, refreshEdgeData]);

  const deployWorkload = useCallback(async () => {
    if (!workloadForm.nodeId || !workloadForm.name || !workloadForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to deploy workload
      const response = await fetch('/api/edge-computing-integration/workloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workloadForm),
      });

      if (!response.ok) {
        throw new Error(`Deploy workload API error: ${response.status}`);
      }

      const workload = await response.json();
      setWorkloads(prev => [...prev, workload]);
      setWorkloadForm({
        nodeId: '', type: 'ai_inference', name: '', description: '',
        cpu: 1, memory: 1024, storage: 100, network: 100, gpu: 0,
        aiEnhanced: true, quantumOptimized: false
      });
      await refreshEdgeData();
    } catch (err) {
      console.error('Deploy workload API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workloadForm, refreshEdgeData]);

  const renderOverview = () => {
    if (!edgeMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Edge Computing Data Available</h3>
            <p className="text-gray-400 mb-6">Start by registering your first edge node to enable distributed AI processing and edge-based intelligence.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Register Node
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Nodes" value={edgeMetrics.totalNodes} icon={Cpu} color="blue" />
          <MetricCard title="Active Nodes" value={edgeMetrics.activeNodes} icon={Server} color="green" />
          <MetricCard title="AI Enhancement" value={`${(edgeMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Star} color="purple" />
          <MetricCard title="Clusters" value={edgeMetrics.totalClusters.toLocaleString()} icon={Network} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Edge Computing Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Workloads</span>
                <span className="text-blue-400 font-semibold">{edgeMetrics.totalWorkloads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Workloads</span>
                <span className="text-green-400 font-semibold">{edgeMetrics.activeWorkloads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Latency</span>
                <span className="text-purple-400 font-semibold">{edgeMetrics.averageLatency.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Throughput</span>
                <span className="text-orange-400 font-semibold">{edgeMetrics.averageThroughput.toLocaleString()}/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-indigo-400 font-semibold">{(edgeMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-yellow-400 font-semibold">{edgeMetrics.lastUpdated.toLocaleTimeString()}</span>
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
                Register Edge Node
              </button>
              <button
                onClick={() => setSelectedTab('clusters')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Create Cluster
              </button>
              <button
                onClick={() => setSelectedTab('workloads')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Deploy Workload
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNodes = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Edge Nodes</h3>
          {nodes.length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No edge nodes registered</p>
              <p className="text-sm text-gray-500">Register edge nodes to enable distributed AI processing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map(node => (
                <div key={node.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{node.name}</h4>
                      <p className="text-gray-400 text-sm">Type: {node.type} | Location: {node.location.region}, {node.location.country}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {node.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {node.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        node.status === 'online' ? 'bg-green-600 text-white' :
                        node.status === 'offline' ? 'bg-red-600 text-white' :
                        node.status === 'maintenance' ? 'bg-yellow-600 text-white' :
                        node.status === 'overloaded' ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">CPU: {node.resources.cpu.utilization.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Memory: {node.resources.memory.utilization.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Storage: {node.resources.storage.utilization.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{node.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Throughput:</span>
                        <span className="text-white ml-2">{node.performance.throughput.toLocaleString()}/s</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-white ml-2">{node.performance.latency}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reliability:</span>
                        <span className="text-white ml-2">{(node.performance.reliability * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Efficiency:</span>
                        <span className="text-white ml-2">{(node.performance.efficiency * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Workloads:</span>
                        <span className="text-white ml-2">{node.workloads.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Connections:</span>
                        <span className="text-white ml-2">{node.connections.length}</span>
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

  const renderClusters = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Edge Clusters</h3>
          {clusters.length === 0 ? (
            <div className="text-center py-8">
              <Network className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No edge clusters created</p>
              <p className="text-sm text-gray-500">Create edge clusters to enable distributed computing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clusters.map(cluster => (
                <div key={cluster.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{cluster.name}</h4>
                      <p className="text-gray-400 text-sm">{cluster.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {cluster.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {cluster.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Nodes: {cluster.performance.totalNodes}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Active: {cluster.performance.activeNodes}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Workloads: {cluster.performance.totalWorkloads}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{cluster.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Throughput:</span>
                        <span className="text-white ml-2">{cluster.performance.throughput.toLocaleString()}/s</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-white ml-2">{cluster.performance.latency.toFixed(2)}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reliability:</span>
                        <span className="text-white ml-2">{(cluster.performance.reliability * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Active Workloads:</span>
                        <span className="text-white ml-2">{cluster.performance.activeWorkloads}</span>
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

  const renderWorkloads = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Edge Workloads</h3>
          {workloads.length === 0 ? (
            <div className="text-center py-8">
              <ActivitySquare className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No workloads deployed</p>
              <p className="text-sm text-gray-500">Deploy workloads to enable distributed processing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workloads.map(workload => (
                <div key={workload.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{workload.name}</h4>
                      <p className="text-gray-400 text-sm">{workload.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {workload.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {workload.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        workload.status === 'running' ? 'bg-green-600 text-white' :
                        workload.status === 'pending' ? 'bg-yellow-600 text-white' :
                        workload.status === 'completed' ? 'bg-blue-600 text-white' :
                        workload.status === 'failed' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {workload.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Type: {workload.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">CPU: {workload.resources.cpu}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Memory: {workload.resources.memory}MB</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{workload.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Storage:</span>
                        <span className="text-white ml-2">{workload.resources.storage}GB</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Network:</span>
                        <span className="text-white ml-2">{workload.resources.network}Mbps</span>
                      </div>
                      <div>
                        <span className="text-gray-400">GPU:</span>
                        <span className="text-white ml-2">{workload.resources.gpu}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-2">{workload.performance.duration}s</span>
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

  const renderAnalytics = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Edge Analytics</h3>
          {analytics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No analytics data available</p>
              <p className="text-sm text-gray-500">Analytics will be generated as edge nodes process workloads.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map(analytic => (
                <div key={analytic.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{analytic.type} Analytics</h4>
                      <p className="text-gray-400 text-sm">Node: {analytic.nodeId.slice(0, 8)}...</p>
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
          <h3 className="text-lg text-white mb-4">Register Edge Node</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Node Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter node name"
                value={nodeForm.name}
                onChange={e => setNodeForm({ ...nodeForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Node Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={nodeForm.type}
                onChange={e => setNodeForm({ ...nodeForm, type: e.target.value as EdgeNodeType })}
              >
                <option value="gateway">Gateway</option>
                <option value="edge_server">Edge Server</option>
                <option value="micro_edge">Micro Edge</option>
                <option value="mobile_edge">Mobile Edge</option>
                <option value="iot_edge">IoT Edge</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Region</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter region"
                value={nodeForm.region}
                onChange={e => setNodeForm({ ...nodeForm, region: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Country</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter country"
                value={nodeForm.country}
                onChange={e => setNodeForm({ ...nodeForm, country: e.target.value })}
              />
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={nodeForm.aiEnhanced}
                  onChange={e => setNodeForm({ ...nodeForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={nodeForm.quantumOptimized}
                  onChange={e => setNodeForm({ ...nodeForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={registerEdgeNode}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !nodeForm.name || !nodeForm.region || !nodeForm.country}
            >
              {isLoading ? 'Registering...' : 'Register Node'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Create Edge Cluster</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Cluster Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter cluster name"
                value={clusterForm.name}
                onChange={e => setClusterForm({ ...clusterForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                rows={3}
                placeholder="Enter cluster description"
                value={clusterForm.description}
                onChange={e => setClusterForm({ ...clusterForm, description: e.target.value })}
              />
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={clusterForm.aiEnhanced}
                  onChange={e => setClusterForm({ ...clusterForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={clusterForm.quantumOptimized}
                  onChange={e => setClusterForm({ ...clusterForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={createEdgeCluster}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !clusterForm.name || !clusterForm.description}
            >
              {isLoading ? 'Creating...' : 'Create Cluster'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Deploy Workload</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Node ID</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter node ID"
                value={workloadForm.nodeId}
                onChange={e => setWorkloadForm({ ...workloadForm, nodeId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Workload Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter workload name"
                value={workloadForm.name}
                onChange={e => setWorkloadForm({ ...workloadForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                rows={2}
                placeholder="Enter workload description"
                value={workloadForm.description}
                onChange={e => setWorkloadForm({ ...workloadForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Workload Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={workloadForm.type}
                onChange={e => setWorkloadForm({ ...workloadForm, type: e.target.value as WorkloadType })}
              >
                <option value="ai_inference">AI Inference</option>
                <option value="data_processing">Data Processing</option>
                <option value="analytics">Analytics</option>
                <option value="streaming">Streaming</option>
                <option value="batch">Batch</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300 mb-1">CPU</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                  value={workloadForm.cpu}
                  onChange={e => setWorkloadForm({ ...workloadForm, cpu: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Memory (MB)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                  value={workloadForm.memory}
                  onChange={e => setWorkloadForm({ ...workloadForm, memory: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={workloadForm.aiEnhanced}
                  onChange={e => setWorkloadForm({ ...workloadForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={workloadForm.quantumOptimized}
                  onChange={e => setWorkloadForm({ ...workloadForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={deployWorkload}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !workloadForm.nodeId || !workloadForm.name || !workloadForm.description}
            >
              {isLoading ? 'Deploying...' : 'Deploy Workload'}
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
              <Cpu className="w-8 h-8 mr-3 text-blue-400" />
              Edge Computing Integration
            </h1>
            <button onClick={refreshEdgeData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'nodes', 'clusters', 'workloads', 'analytics', 'create'].map(tab => (
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
          {selectedTab === 'nodes' && renderNodes()}
          {selectedTab === 'clusters' && renderClusters()}
          {selectedTab === 'workloads' && renderWorkloads()}
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
