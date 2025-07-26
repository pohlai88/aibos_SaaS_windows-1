'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, Settings, Play, Pause, RotateCcw, Plus,
  Trash2, CheckCircle, AlertTriangle, Gauge, Server, Network, Scale,
  TrendingUp
} from 'lucide-react';

import {
  scalabilityOptimizations,
  ScalingStrategy,
  LoadBalancingAlgorithm,
  ResourceType,
  PerformanceMetric,
  PerformanceMetricType,
  ScalingRule,
  LoadBalancer,
  ResourcePool,
  CapacityForecast,
  ScalingDecision,
  ScalabilityMetrics
} from '@/lib/scalability-optimizations';

interface ScalabilityOptimizationsDashboardProps {
  className?: string;
}

export default function ScalabilityOptimizationsDashboard({ className = '' }: ScalabilityOptimizationsDashboardProps) {
  const [scalabilityMetrics, setScalabilityMetrics] = useState<ScalabilityMetrics | null>(null);
  const [scalingRules, setScalingRules] = useState<ScalingRule[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'scaling'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [scalingRuleForm, setScalingRuleForm] = useState({
    name: '',
    metric: 'response_time' as PerformanceMetricType,
    threshold: 1000,
    operator: 'gt' as 'gt' | 'lt' | 'gte' | 'lte' | 'eq',
    action: 'scale_up' as 'scale_up' | 'scale_down' | 'maintain',
    cooldown: 300,
    enabled: true,
    aiEnhanced: true,
    quantumEnhanced: false
  });

  useEffect(() => {
    initializeScalabilityData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshScalabilityData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeScalabilityData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshScalabilityData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshScalabilityData = useCallback(async () => {
    try {
      // Real API call to backend scalability endpoint
      const response = await fetch('/api/scalability/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Scalability API error: ${response.status}`);
      }

      const data = await response.json();
      setScalabilityMetrics(data.metrics);
      setScalingRules(data.scalingRules || []);
    } catch (err) {
      console.error('Scalability API error:', err);
      // Set empty state on error
      setScalabilityMetrics(null);
      setScalingRules([]);
    }
  }, []);

  const createScalingRule = useCallback(async () => {
    if (!scalingRuleForm.name) return;
    setIsLoading(true);
    try {
      // Real API call to create scaling rule
      const response = await fetch('/api/scalability/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scalingRuleForm),
      });

      if (!response.ok) {
        throw new Error(`Create scaling rule API error: ${response.status}`);
      }

      const rule = await response.json();
      setScalingRules(prev => [...prev, rule]);
      setScalingRuleForm({
        name: '', metric: 'response_time' as PerformanceMetricType, threshold: 1000,
        operator: 'gt', action: 'scale_up', cooldown: 300,
        enabled: true, aiEnhanced: true, quantumEnhanced: false
      });
      await refreshScalabilityData();
    } catch (err) {
      console.error('Create scaling rule API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [scalingRuleForm, refreshScalabilityData]);

  const renderOverview = () => {
    if (!scalabilityMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Scale className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Scalability Data Available</h3>
            <p className="text-gray-400 mb-6">Start by creating scaling rules to monitor and optimize system performance.</p>
            <button
              onClick={() => setSelectedTab('scaling')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Create Scaling Rules
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Nodes" value={scalabilityMetrics.totalNodes} icon={Server} color="blue" />
          <MetricCard title="Load Balancer Efficiency" value={`${scalabilityMetrics.loadBalancerEfficiency}%`} icon={Network} color="green" />
          <MetricCard title="Resource Utilization" value={`${scalabilityMetrics.resourceUtilization}%`} icon={Gauge} color="purple" />
          <MetricCard title="Cost Efficiency" value={`${scalabilityMetrics.costEfficiency}%`} icon={TrendingUp} color="orange" />
        </div>
      </motion.div>
    );
  };

  const renderScalingRules = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Create Scaling Rule</h3>
        <input
          className="w-full bg-gray-800 text-white p-2 mb-2 rounded"
          placeholder="Rule Name"
          value={scalingRuleForm.name}
          onChange={e => setScalingRuleForm({ ...scalingRuleForm, name: e.target.value })}
        />
        <button
          onClick={createScalingRule}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Rule'}
        </button>
      </div>
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Existing Scaling Rules</h3>
        {scalingRules.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 mb-4">No scaling rules created yet</p>
            <p className="text-sm text-gray-500">Create your first scaling rule to start monitoring system performance.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {scalingRules.map(rule => (
              <li key={rule.id} className="bg-gray-800 p-3 rounded">
                <p className="text-white">{rule.name}</p>
                <p className="text-sm text-gray-400">{rule.metric} {rule.operator} {rule.threshold} → {rule.action}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <Scale className="w-8 h-8 mr-3 text-blue-400" />
              Scalability Dashboard
            </h1>
            <button onClick={refreshScalabilityData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <RotateCcw className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>
        <div className="mb-6">
          <div className="flex space-x-1">
            {['overview', 'scaling'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded ${selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'scaling' && renderScalingRules()}
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
