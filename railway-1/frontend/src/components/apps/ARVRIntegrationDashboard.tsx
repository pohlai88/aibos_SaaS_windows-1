'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Box, Headphones, Zap, BarChart3, Plus, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Star, Code, Globe, Lock,
  Shield, Target, Smartphone, Monitor, Camera, Mic, Cpu
} from 'lucide-react';

import {
  arVrIntegration,
  RealityType,
  DeviceType,
  InteractionType,
  ContentType,
  SessionStatus,
  ARVRSession,
  ARVRDevice,
  ARVRExperience,
  ARVRMetrics
} from '@/lib/ar-vr-integration';

interface ARVRIntegrationDashboardProps {
  className?: string;
}

export default function ARVRIntegrationDashboard({ className = '' }: ARVRIntegrationDashboardProps) {
  const [arVrMetrics, setArVrMetrics] = useState<ARVRMetrics | null>(null);
  const [sessions, setSessions] = useState<ARVRSession[]>([]);
  const [devices, setDevices] = useState<ARVRDevice[]>([]);
  const [experiences, setExperiences] = useState<ARVRExperience[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions' | 'devices' | 'experiences' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [sessionForm, setSessionForm] = useState({
    userId: 'user-001',
    realityType: 'vr' as RealityType,
    deviceType: 'headset' as DeviceType,
    aiEnhanced: true,
    quantumOptimized: false
  });

  const [deviceForm, setDeviceForm] = useState({
    type: 'headset' as DeviceType,
    name: '',
    aiOptimized: true,
    quantumOptimized: false
  });

  const [experienceForm, setExperienceForm] = useState({
    name: '',
    description: '',
    type: 'vr' as RealityType,
    aiEnhanced: true,
    quantumOptimized: false
  });

  useEffect(() => {
    initializeARVRData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshARVRData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeARVRData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshARVRData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshARVRData = useCallback(async () => {
    try {
      // Real API call to backend AR/VR endpoint
      const response = await fetch('/api/ar-vr-integration/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`AR/VR API error: ${response.status}`);
      }

      const data = await response.json();
      setArVrMetrics(data.metrics);
      setSessions(data.sessions || []);
      setDevices(data.devices || []);
      setExperiences(data.experiences || []);
    } catch (err) {
      console.error('AR/VR API error:', err);
      // Set empty state on error
      setArVrMetrics(null);
      setSessions([]);
      setDevices([]);
      setExperiences([]);
    }
  }, []);

  const createARVRSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Real API call to create AR/VR session
      const response = await fetch('/api/ar-vr-integration/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionForm),
      });

      if (!response.ok) {
        throw new Error(`Create session API error: ${response.status}`);
      }

      const session = await response.json();
      setSessions(prev => [...prev, session]);
      await refreshARVRData();
    } catch (err) {
      console.error('Create session API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionForm, refreshARVRData]);

  const registerDevice = useCallback(async () => {
    if (!deviceForm.name) return;
    setIsLoading(true);
    try {
      // Real API call to register AR/VR device
      const response = await fetch('/api/ar-vr-integration/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceForm),
      });

      if (!response.ok) {
        throw new Error(`Register device API error: ${response.status}`);
      }

      const device = await response.json();
      setDevices(prev => [...prev, device]);
      setDeviceForm({ type: 'headset', name: '', aiOptimized: true, quantumOptimized: false });
      await refreshARVRData();
    } catch (err) {
      console.error('Register device API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceForm, refreshARVRData]);

  const createExperience = useCallback(async () => {
    if (!experienceForm.name || !experienceForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to create AR/VR experience
      const response = await fetch('/api/ar-vr-integration/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienceForm),
      });

      if (!response.ok) {
        throw new Error(`Create experience API error: ${response.status}`);
      }

      const experience = await response.json();
      setExperiences(prev => [...prev, experience]);
      setExperienceForm({ name: '', description: '', type: 'vr', aiEnhanced: true, quantumOptimized: false });
      await refreshARVRData();
    } catch (err) {
      console.error('Create experience API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [experienceForm, refreshARVRData]);

  const renderOverview = () => {
    if (!arVrMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No AR/VR Data Available</h3>
            <p className="text-gray-400 mb-6">Start by creating your first AR/VR session to enable immersive AI experiences and virtual reality interactions.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Create Session
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Sessions" value={arVrMetrics.totalSessions} icon={Eye} color="blue" />
          <MetricCard title="Active Users" value={arVrMetrics.activeUsers} icon={Box} color="green" />
          <MetricCard title="AI Enhancement" value={`${(arVrMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Star} color="purple" />
          <MetricCard title="Experiences" value={arVrMetrics.totalExperiences.toLocaleString()} icon={Headphones} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              AR/VR Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Session Duration</span>
                <span className="text-blue-400 font-semibold">{arVrMetrics.averageSessionDuration.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-purple-400 font-semibold">{(arVrMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Devices</span>
                <span className="text-green-400 font-semibold">{devices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-orange-400 font-semibold">{arVrMetrics.lastUpdated.toLocaleTimeString()}</span>
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
                Create AR/VR Session
              </button>
              <button
                onClick={() => setSelectedTab('devices')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Register Device
              </button>
              <button
                onClick={() => setSelectedTab('experiences')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Create Experience
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSessions = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AR/VR Sessions</h3>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No AR/VR sessions yet</p>
              <p className="text-sm text-gray-500">Create AR/VR sessions to start immersive AI experiences.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Session {session.id.slice(0, 8)}...</h4>
                      <p className="text-gray-400 text-sm">User: {session.userId} | Type: {session.realityType.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {session.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.status === 'active' ? 'bg-green-600 text-white' :
                        session.status === 'initializing' ? 'bg-blue-600 text-white' :
                        session.status === 'paused' ? 'bg-yellow-600 text-white' :
                        session.status === 'ended' ? 'bg-gray-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Device: {session.deviceType}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">FPS: {session.performance.fps}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{session.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Interactions:</span>
                        <span className="text-white ml-2">{session.performance.metrics.interactions}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Content:</span>
                        <span className="text-white ml-2">{session.performance.metrics.contentLoaded}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-white ml-2">{session.performance.latency}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Resolution:</span>
                        <span className="text-white ml-2">{session.performance.resolution.width}x{session.performance.resolution.height}</span>
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

  const renderDevices = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AR/VR Devices</h3>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No AR/VR devices registered</p>
              <p className="text-sm text-gray-500">Register AR/VR devices to enable immersive experiences.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map(device => (
                <div key={device.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{device.name}</h4>
                      <p className="text-gray-400 text-sm">Type: {device.type} | ID: {device.id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.aiOptimized && <span className="text-blue-400 text-xs">AI</span>}
                      {device.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        device.status.connected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {device.status.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Battery: {device.status.battery}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Temperature: {device.status.temperature}°C</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">FPS: {device.performance.fps}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{device.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-700 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Capabilities:</span>
                        <span className="text-white ml-2">{device.capabilities.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-white ml-2">{device.performance.latency}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Resolution:</span>
                        <span className="text-white ml-2">{device.performance.resolution.width}x{device.performance.resolution.height}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Refresh Rate:</span>
                        <span className="text-white ml-2">{device.performance.resolution.refreshRate}Hz</span>
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

  const renderExperiences = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AR/VR Experiences</h3>
          {experiences.length === 0 ? (
            <div className="text-center py-8">
              <Headphones className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No AR/VR experiences created</p>
              <p className="text-sm text-gray-500">Create AR/VR experiences to enable immersive AI interactions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map(experience => (
                <div key={experience.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{experience.name}</h4>
                      <p className="text-gray-400 text-sm">{experience.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {experience.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {experience.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
                        {experience.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Content: {experience.content.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Interactions: {experience.interactions.length}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{experience.createdAt.toLocaleDateString()}</span>
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
          <h3 className="text-lg text-white mb-4">Create AR/VR Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">User ID</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter user ID"
                value={sessionForm.userId}
                onChange={e => setSessionForm({ ...sessionForm, userId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Reality Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={sessionForm.realityType}
                onChange={e => setSessionForm({ ...sessionForm, realityType: e.target.value as RealityType })}
              >
                <option value="vr">Virtual Reality (VR)</option>
                <option value="ar">Augmented Reality (AR)</option>
                <option value="mr">Mixed Reality (MR)</option>
                <option value="xr">Extended Reality (XR)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Device Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={sessionForm.deviceType}
                onChange={e => setSessionForm({ ...sessionForm, deviceType: e.target.value as DeviceType })}
              >
                <option value="headset">Headset</option>
                <option value="glasses">Glasses</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="haptic">Haptic Device</option>
                <option value="controller">Controller</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sessionForm.aiEnhanced}
                  onChange={e => setSessionForm({ ...sessionForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sessionForm.quantumOptimized}
                  onChange={e => setSessionForm({ ...sessionForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={createARVRSession}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Register Device</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Device Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter device name"
                value={deviceForm.name}
                onChange={e => setDeviceForm({ ...deviceForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Device Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={deviceForm.type}
                onChange={e => setDeviceForm({ ...deviceForm, type: e.target.value as DeviceType })}
              >
                <option value="headset">Headset</option>
                <option value="glasses">Glasses</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="haptic">Haptic Device</option>
                <option value="controller">Controller</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deviceForm.aiOptimized}
                  onChange={e => setDeviceForm({ ...deviceForm, aiOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Optimized</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deviceForm.quantumOptimized}
                  onChange={e => setDeviceForm({ ...deviceForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={registerDevice}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !deviceForm.name}
            >
              {isLoading ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Create Experience</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Experience Name</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                placeholder="Enter experience name"
                value={experienceForm.name}
                onChange={e => setExperienceForm({ ...experienceForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                rows={3}
                placeholder="Enter experience description"
                value={experienceForm.description}
                onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Reality Type</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                value={experienceForm.type}
                onChange={e => setExperienceForm({ ...experienceForm, type: e.target.value as RealityType })}
              >
                <option value="vr">Virtual Reality (VR)</option>
                <option value="ar">Augmented Reality (AR)</option>
                <option value="mr">Mixed Reality (MR)</option>
                <option value="xr">Extended Reality (XR)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={experienceForm.aiEnhanced}
                  onChange={e => setExperienceForm({ ...experienceForm, aiEnhanced: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">AI Enhanced</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={experienceForm.quantumOptimized}
                  onChange={e => setExperienceForm({ ...experienceForm, quantumOptimized: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Quantum Optimized</span>
              </label>
            </div>
            <button
              onClick={createExperience}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
              disabled={isLoading || !experienceForm.name || !experienceForm.description}
            >
              {isLoading ? 'Creating...' : 'Create Experience'}
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
              <Eye className="w-8 h-8 mr-3 text-blue-400" />
              AR/VR Integration
            </h1>
            <button onClick={refreshARVRData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'sessions', 'devices', 'experiences', 'create'].map(tab => (
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
          {selectedTab === 'sessions' && renderSessions()}
          {selectedTab === 'devices' && renderDevices()}
          {selectedTab === 'experiences' && renderExperiences()}
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
