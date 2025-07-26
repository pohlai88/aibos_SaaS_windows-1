'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Wifi, Database, BarChart3, Plus, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Star, Code, Globe, Lock,
  Zap, Shield, Target, Smartphone, Monitor, Camera, Mic
} from 'lucide-react';

import {
  iotDeviceManagement,
  DeviceType,
  DeviceStatus,
  ConnectionType,
  DataType,
  IoTDevice,
  DeviceFleet,
  DeviceData,
  IoTMetrics
} from '@/lib/iot-device-management';

interface IoTDeviceManagementDashboardProps {
  className?: string;
}

export default function IoTDeviceManagementDashboard({ className = '' }: IoTDeviceManagementDashboardProps) {
  const [iotMetrics, setIotMetrics] = useState<IoTMetrics | null>(null);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [fleets, setFleets] = useState<DeviceFleet[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'devices' | 'fleets' | 'data' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: 'sensor' as DeviceType,
    latitude: 40.7128,
    longitude: -74.0060,
    indoor: true,
    room: '',
    building: '',
    aiEnhanced: true,
    quantumOptimized: false
  });

  useEffect(() => {
    initializeIoTData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshIoTData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeIoTData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshIoTData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshIoTData = useCallback(async () => {
    try {
      // Real API call to backend IoT endpoint
      const response = await fetch('/api/iot-device-management/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`IoT API error: ${response.status}`);
      }

      const data = await response.json();
      setIotMetrics(data.metrics);
      setDevices(data.devices || []);
      setFleets(data.fleets || []);
      setDeviceData(data.deviceData || []);
    } catch (err) {
      console.error('IoT API error:', err);
      // Set empty state on error
      setIotMetrics(null);
      setDevices([]);
      setFleets([]);
      setDeviceData([]);
    }
  }, []);

  const registerDevice = useCallback(async () => {
    if (!deviceForm.name) return;
    setIsLoading(true);
    try {
      // Real API call to register IoT device
      const response = await fetch('/api/iot-device-management/devices', {
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
      setDeviceForm({ name: '', type: 'sensor', latitude: 40.7128, longitude: -74.0060, indoor: true, room: '', building: '', aiEnhanced: true, quantumOptimized: false });
      await refreshIoTData();
    } catch (err) {
      console.error('Register device API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceForm, refreshIoTData]);

  const collectData = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    try {
      // Real API call to collect device data
      const response = await fetch(`/api/iot-device-management/devices/${deviceId}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'temperature',
          value: Math.random() * 30 + 10, // Random temperature between 10-40°C
          aiProcessed: true,
          quantumProcessed: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Collect data API error: ${response.status}`);
      }

      const data = await response.json();
      setDeviceData(prev => [...prev, data]);
      await refreshIoTData();
    } catch (err) {
      console.error('Collect data API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshIoTData]);

  const renderOverview = () => {
    if (!iotMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No IoT Devices Available</h3>
            <p className="text-gray-400 mb-6">Start by registering your first IoT device to enable connected intelligence and edge computing.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Register Device
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Devices" value={iotMetrics.totalDevices} icon={Cpu} color="blue" />
          <MetricCard title="Online Devices" value={iotMetrics.onlineDevices} icon={Wifi} color="green" />
          <MetricCard title="AI Enhancement" value={`${(iotMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Star} color="purple" />
          <MetricCard title="Data Points" value={iotMetrics.totalDataPoints.toLocaleString()} icon={Database} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              IoT Device Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Fleets</span>
                <span className="text-blue-400 font-semibold">{iotMetrics.totalFleets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Fleets</span>
                <span className="text-green-400 font-semibold">{iotMetrics.activeFleets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Uptime</span>
                <span className="text-purple-400 font-semibold">{iotMetrics.averageUptime.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-orange-400 font-semibold">{(iotMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
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
                Register Device
              </button>
              <button
                onClick={() => setSelectedTab('devices')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Monitor Devices
              </button>
              <button
                onClick={() => setSelectedTab('fleets')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Manage Fleets
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDevices = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">IoT Devices</h3>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No devices registered yet</p>
              <p className="text-sm text-gray-500">Register your first IoT device to start monitoring and data collection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map(device => (
                <div key={device.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{device.name}</h4>
                      <p className="text-gray-400 text-sm">Type: {device.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {device.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        device.status === 'online' ? 'bg-green-600 text-white' :
                        device.status === 'offline' ? 'bg-red-600 text-white' :
                        device.status === 'maintenance' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Location: {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Battery: {device.performance.metrics.batteryLevel}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Signal: {device.performance.metrics.signalStrength}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{device.lastSeen?.toLocaleDateString()}</span>
                    {device.status === 'online' && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <button
                          onClick={() => collectData(device.id)}
                          className="text-green-400 hover:text-green-300 text-sm"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Collecting...' : 'Collect Data'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderFleets = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Device Fleets</h3>
          {fleets.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No fleets created yet</p>
              <p className="text-sm text-gray-500">Create device fleets to manage groups of IoT devices efficiently.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fleets.map(fleet => (
                <div key={fleet.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{fleet.name}</h4>
                      <p className="text-gray-400 text-sm">{fleet.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {fleet.aiOptimized && <span className="text-blue-400 text-xs">AI</span>}
                      {fleet.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className="text-sm text-gray-300">{fleet.performance.onlineDevices}/{fleet.performance.totalDevices} online</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Devices: {fleet.performance.totalDevices}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Data Points: {fleet.performance.totalDataPoints}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Avg Uptime: {fleet.performance.averageUptime.toFixed(1)}h</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{fleet.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderData = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Device Data</h3>
          {deviceData.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No data collected yet</p>
              <p className="text-sm text-gray-500">Device data will appear here when devices collect and transmit information.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deviceData.slice(0, 10).map(data => (
                <div key={data.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Data from {devices.find(d => d.id === data.deviceId)?.name || 'Unknown Device'}</h4>
                      <p className="text-gray-400 text-sm">Type: {data.type} | Value: {data.value}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {data.aiProcessed && <span className="text-blue-400 text-xs">AI</span>}
                      {data.quantumProcessed && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className="text-sm text-gray-300">Quality: {(data.metadata.quality * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Confidence: {(data.metadata.confidence * 100).toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Source: {data.metadata.source}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{data.timestamp.toLocaleDateString()}</span>
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
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Register IoT Device</h3>
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
              <option value="sensor">Sensor</option>
              <option value="actuator">Actuator</option>
              <option value="gateway">Gateway</option>
              <option value="edge_compute">Edge Compute</option>
              <option value="camera">Camera</option>
              <option value="microphone">Microphone</option>
              <option value="display">Display</option>
              <option value="robot">Robot</option>
              <option value="vehicle">Vehicle</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Latitude</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={deviceForm.latitude}
                onChange={e => setDeviceForm({ ...deviceForm, latitude: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Longitude</label>
              <input
                className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={deviceForm.longitude}
                onChange={e => setDeviceForm({ ...deviceForm, longitude: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Building</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter building name"
              value={deviceForm.building}
              onChange={e => setDeviceForm({ ...deviceForm, building: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Room</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter room name"
              value={deviceForm.room}
              onChange={e => setDeviceForm({ ...deviceForm, room: e.target.value })}
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deviceForm.indoor}
                onChange={e => setDeviceForm({ ...deviceForm, indoor: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Indoor</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deviceForm.aiEnhanced}
                onChange={e => setDeviceForm({ ...deviceForm, aiEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">AI Enhanced</span>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            disabled={isLoading || !deviceForm.name}
          >
            {isLoading ? 'Registering...' : 'Register Device'}
          </button>
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
              IoT Device Management
            </h1>
            <button onClick={refreshIoTData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'devices', 'fleets', 'data', 'create'].map(tab => (
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
          {selectedTab === 'devices' && renderDevices()}
          {selectedTab === 'fleets' && renderFleets()}
          {selectedTab === 'data' && renderData()}
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
