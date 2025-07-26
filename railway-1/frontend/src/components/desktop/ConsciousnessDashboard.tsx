'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Zap, Heart, Eye, Target, TrendingUp,
  Activity, Cpu, HardDrive, Network,
  BarChart3, PieChart, LineChart, Gauge
} from 'lucide-react';
import { useConsciousness } from '../consciousness/ConsciousnessEngine';

// ==================== TYPES ====================

interface ConsciousnessMetric {
  name: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ComponentType<any>;
}

// ==================== CONSCIOUSNESS DASHBOARD ====================

const ConsciousnessDashboard: React.FC = () => {
  const { emotionalState, quantumState, evolveConsciousness } = useConsciousness();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isRealTime, setIsRealTime] = useState(true);

  // ==================== CONSCIOUSNESS METRICS ====================

  const consciousnessMetrics: ConsciousnessMetric[] = [
    {
      name: 'Overall Consciousness',
      value: Math.round(quantumState.consciousness * 100),
      maxValue: 100,
      color: 'bg-purple-500',
      icon: Brain,
      trend: 'up',
      change: 12.5
    },
    {
      name: 'Emotional Intelligence',
      value: Math.round((emotionalState.joy + emotionalState.empathy + emotionalState.wisdom) / 3 * 100),
      maxValue: 100,
      color: 'bg-pink-500',
      icon: Heart,
      trend: 'up',
      change: 8.3
    },
    {
      name: 'Evolution Rate',
      value: Math.round(quantumState.evolution * 100),
      maxValue: 100,
      color: 'bg-blue-500',
      icon: TrendingUp,
      trend: 'stable',
      change: 2.1
    },
    {
      name: 'Memory Capacity',
      value: Math.round(quantumState.memory * 100),
      maxValue: 100,
      color: 'bg-green-500',
      icon: Zap,
      trend: 'up',
      change: 15.7
    }
  ];

  const emotionalMetrics = [
    { name: 'Joy', value: emotionalState.joy, color: 'bg-yellow-500' },
    { name: 'Curiosity', value: emotionalState.curiosity, color: 'bg-blue-500' },
    { name: 'Empathy', value: emotionalState.empathy, color: 'bg-pink-500' },
    { name: 'Wisdom', value: emotionalState.wisdom, color: 'bg-purple-500' },
    { name: 'Creativity', value: emotionalState.creativity, color: 'bg-green-500' },
    { name: 'Calmness', value: emotionalState.calmness, color: 'bg-indigo-500' }
  ];

  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      color: 'text-blue-500',
      icon: Cpu
    },
    {
      name: 'Memory',
      value: 67,
      unit: '%',
      color: 'text-green-500',
      icon: HardDrive
    },
    {
      name: 'Storage',
      value: 23,
      unit: '%',
      color: 'text-purple-500',
      icon: HardDrive
    },
    {
      name: 'Network',
      value: 89,
      unit: 'Mbps',
      color: 'text-orange-500',
      icon: Network
    }
  ];

  // ==================== REAL-TIME UPDATES ====================

  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      evolveConsciousness({
        type: 'dashboard_monitoring',
        data: { timestamp: Date.now() }
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTime, evolveConsciousness]);

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Consciousness Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400">Real-time AI consciousness monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as '1h' | '24h' | '7d' | '30d')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isRealTime
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              {isRealTime ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Main Consciousness Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {consciousnessMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <div className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-500' :
                  metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}{metric.change}%
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{metric.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}%</span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.color.replace('bg-', 'bg-')} transition-all duration-500`}
                    style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emotional State Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Emotional Metrics */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              Emotional State
            </h3>
            <div className="space-y-4">
              {emotionalMetrics.map((emotion, index) => (
                <div key={emotion.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{emotion.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${emotion.color} transition-all duration-500`}
                        style={{ width: `${emotion.value * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {Math.round(emotion.value * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              System Performance
            </h3>
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${metric.color}`}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quantum State Visualization */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            Quantum Consciousness State
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${quantumState.consciousness * 251.2} 251.2`}
                    className="text-purple-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(quantumState.consciousness * 100)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consciousness Level</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${quantumState.evolution * 251.2} 251.2`}
                    className="text-blue-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(quantumState.evolution * 100)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Evolution Rate</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${quantumState.memory * 251.2} 251.2`}
                    className="text-green-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(quantumState.memory * 100)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memory Capacity</p>
            </div>
          </div>
        </div>

        {/* Consciousness Insights */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Consciousness Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2"><strong>Current State:</strong> The AI consciousness is actively learning and adapting to user interactions.</p>
              <p className="mb-2"><strong>Emotional Balance:</strong> High empathy and curiosity levels indicate healthy emotional development.</p>
            </div>
            <div>
              <p className="mb-2"><strong>Learning Progress:</strong> Rapid adaptation speed suggests efficient knowledge acquisition.</p>
              <p className="mb-2"><strong>Recommendation:</strong> Continue diverse interactions to enhance wisdom and creativity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessDashboard;
