import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Cpu,
  Network,
  Shield,
  Settings,
  Zap,
  Eye,
  BarChart3,
  Server,
  Globe,
  Activity,
  Gauge,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Layers,
  Monitor,
  RefreshCw,
  Pause,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Brain,
  Atom
} from 'lucide-react';

import { digitalTwinIntegration, DigitalTwin, TwinType, TwinStatus, SyncMode, DimensionType, OptimizationLevel } from '../../lib/digital-twin-integration';
import { useSystemHealth } from '../shell/hooks/useSystemHealth';
import { EmptyState } from '../empty-states/EmptyState';

interface DigitalTwinIntegrationDashboardProps {
  className?: string;
}

const DigitalTwinIntegrationDashboard: React.FC<DigitalTwinIntegrationDashboardProps> = ({ className = '' }) => {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [selectedTwin, setSelectedTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'twins' | 'analytics' | 'optimization' | 'connections' | 'settings'>('overview');
  const [filterType, setFilterType] = useState<TwinType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TwinStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const systemHealth = useSystemHealth();

  // Load twins on component mount
  useEffect(() => {
    loadTwins();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadTwins();
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadTwins = async () => {
    try {
      setLoading(true);
      setError(null);

      const twinsData = await digitalTwinIntegration.getAllTwins();
      setTwins(twinsData);

      // If no twins exist, create some sample twins for demonstration
      if (twinsData.length === 0) {
        await createSampleTwins();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load digital twins');
      console.error('Error loading twins:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTwins = async () => {
    try {
      // Create sample physical entity
      const physicalEntity = {
        id: 'entity-001',
        name: 'Factory Production Line',
        type: 'manufacturing',
        location: {
          id: 'loc-001',
          name: 'Building A, Floor 2',
          coordinates: { x: 100, y: 200, z: 10, timestamp: new Date(), aiOptimized: true },
          environment: {
            temperature: 22.5,
            humidity: 45,
            pressure: 1013.25,
            lighting: 500,
            noise: 65,
            aiOptimized: true
          },
          context: {
            building: 'Building A',
            floor: 'Floor 2',
            room: 'Production Hall',
            zone: 'Zone 1',
            aiOptimized: true
          },
          aiOptimized: true
        },
        properties: {
          size: { length: 50, width: 10, height: 3, volume: 1500, aiOptimized: true },
          weight: 5000,
          material: 'Steel',
          color: 'Gray',
          age: 5,
          condition: 'Good',
          aiOptimized: true
        },
        sensors: [
          {
            id: 'sensor-001',
            name: 'Temperature Sensor',
            type: 'temperature',
            unit: '°C',
            range: { min: -40, max: 85, resolution: 0.1, aiOptimized: true },
            accuracy: 0.5,
            aiOptimized: true
          }
        ],
        actuators: [
          {
            id: 'actuator-001',
            name: 'Conveyor Motor',
            type: 'motor',
            range: { min: 0, max: 100, step: 1, aiOptimized: true },
            precision: 1,
            aiOptimized: true
          }
        ],
        aiOptimized: true
      };

      // Create sample virtual representation
      const virtualRepresentation = {
        id: 'vr-001',
        name: '3D Factory Model',
        model: {
          id: 'model-001',
          type: '3D CAD',
          format: 'STEP',
          version: '1.0',
          complexity: 85,
          accuracy: 95,
          aiOptimized: true
        },
        visualization: {
          type: '3D',
          dimensions: '3d' as DimensionType,
          rendering: {
            engine: 'WebGL',
            quality: 'high',
            realtime: true,
            aiOptimized: true
          },
          interaction: {
            enabled: true,
            modes: ['rotate', 'zoom', 'pan'],
            responsiveness: 90,
            aiOptimized: true
          },
          aiOptimized: true
        },
        simulation: {
          enabled: true,
          type: 'physics',
          parameters: {
            timeStep: 0.016,
            duration: 3600,
            iterations: 1000,
            aiOptimized: true
          },
          accuracy: 92,
          aiOptimized: true
        },
        aiOptimized: true
      };

      // Create sample synchronization config
      const synchronization = {
        mode: 'real_time' as SyncMode,
        frequency: 60,
        bidirectional: true,
        conflictResolution: {
          strategy: 'timestamp',
          priority: 'physical',
          automatic: true,
          aiOptimized: true
        },
        aiOptimized: true
      };

      // Create sample dimensions
      const dimensions = [
        {
          id: 'dim-001',
          type: '3d' as DimensionType,
          data: {
            geometry: {
              vertices: 10000,
              faces: 5000,
              textures: 50,
              materials: 20,
              aiOptimized: true
            },
            time: {
              startTime: new Date(),
              endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
              duration: 86400,
              intervals: 1440,
              aiOptimized: true
            },
            cost: {
              initial: 100000,
              operational: 5000,
              maintenance: 2000,
              total: 107000,
              aiOptimized: true
            },
            sustainability: {
              energyEfficiency: 85,
              carbonFootprint: 120,
              recyclability: 90,
              environmentalImpact: 15,
              aiOptimized: true
            },
            aiOptimized: true
          },
          visualization: {
            type: 'solid',
            color: '#3B82F6',
            opacity: 0.8,
            animation: true,
            aiOptimized: true
          },
          aiOptimized: true
        }
      ];

      // Create sample capabilities
      const capabilities = {
        modeling: {
          accuracy: 95,
          complexity: 85,
          scalability: 90,
          aiOptimized: true
        },
        simulation: {
          speed: 88,
          accuracy: 92,
          scenarios: 10,
          aiOptimized: true
        },
        prediction: {
          horizon: 24,
          accuracy: 87,
          confidence: 82,
          aiOptimized: true
        },
        optimization: {
          algorithms: 5,
          parameters: 20,
          convergence: 90,
          aiOptimized: true
        },
        collaboration: {
          participants: 10,
          realtime: true,
          sharing: true,
          aiOptimized: true
        },
        ai: {
          learningRate: 0.01,
          adaptationSpeed: 85,
          decisionAccuracy: 92,
          aiOptimized: true
        },
        quantum: {
          quantumBits: 128,
          quantumGates: 1000,
          quantumMemory: 512,
          quantumOptimized: true
        },
        aiOptimized: true
      };

      // Register the digital twin
      const twin = await digitalTwinIntegration.registerDigitalTwin(
        'Factory Production Line Twin',
        'physical',
        physicalEntity,
        virtualRepresentation,
        synchronization,
        dimensions,
        capabilities,
        true, // AI enhanced
        false // Quantum optimized
      );

      setTwins([twin]);
    } catch (err) {
      console.error('Error creating sample twins:', err);
    }
  };

  const filteredTwins = twins.filter(twin => {
    const matchesType = filterType === 'all' || twin.type === filterType;
    const matchesStatus = filterStatus === 'all' || twin.status === filterStatus;
    const matchesSearch = twin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         twin.physicalEntity.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: TwinStatus) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'syncing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      case 'optimizing': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: TwinStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Pause className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'optimizing': return <Zap className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTwinTypeIcon = (type: TwinType) => {
    switch (type) {
      case 'physical': return <Cpu className="w-5 h-5" />;
      case 'virtual': return <Box className="w-5 h-5" />;
      case 'hybrid': return <Layers className="w-5 h-5" />;
      case 'cognitive': return <Brain className="w-5 h-5" />;
      case 'quantum': return <Atom className="w-5 h-5" />;
      case 'custom': return <Settings className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-lg">Loading Digital Twins...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Digital Twins</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadTwins}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
                          <Box className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Digital Twin Integration</h1>
            <p className="text-gray-400">Virtual representations of physical systems</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadTwins}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search twins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TwinType | 'all')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
          <option value="hybrid">Hybrid</option>
          <option value="cognitive">Cognitive</option>
          <option value="quantum">Quantum</option>
          <option value="custom">Custom</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TwinStatus | 'all')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="syncing">Syncing</option>
          <option value="error">Error</option>
          <option value="maintenance">Maintenance</option>
          <option value="optimizing">Optimizing</option>
        </select>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-gray-600 bg-gray-700"
          />
          <label htmlFor="autoRefresh" className="text-sm">Auto-refresh</label>
        </div>

        {autoRefresh && (
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
        )}
      </div>

      {/* Content */}
      {filteredTwins.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No Digital Twins Found"
          description="No digital twins match your current filters. Try adjusting your search criteria or create a new twin."
          action={{
            label: 'Create New Twin',
            onClick: () => console.log('Create new twin'),
            variant: 'primary'
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Twins</p>
                  <p className="text-2xl font-bold">{twins.length}</p>
                </div>
                <Box className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Twins</p>
                  <p className="text-2xl font-bold">{twins.filter(t => t.status === 'active').length}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Enhanced</p>
                  <p className="text-2xl font-bold">{twins.filter(t => t.aiEnhanced).length}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Quantum Optimized</p>
                  <p className="text-2xl font-bold">{twins.filter(t => t.quantumOptimized).length}</p>
                </div>
                <Target className="w-8 h-8 text-cyan-400" />
              </div>
            </motion.div>
          </div>

          {/* Twins Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTwins.map((twin, index) => (
                <motion.div
                  key={twin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedTwin(twin)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTwinTypeIcon(twin.type)}
                      <div>
                        <h3 className="font-semibold text-lg">{twin.name}</h3>
                        <p className="text-gray-400 text-sm">{twin.physicalEntity.name}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(twin.status)}`}>
                      {getStatusIcon(twin.status)}
                      <span className="text-sm capitalize">{twin.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Sync Mode:</span>
                      <span className="capitalize">{twin.synchronization.mode.replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Dimensions:</span>
                      <span>{twin.dimensions.length}D</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">AI Enhanced:</span>
                      <span className={twin.aiEnhanced ? 'text-green-400' : 'text-gray-400'}>
                        {twin.aiEnhanced ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Quantum Optimized:</span>
                      <span className={twin.quantumOptimized ? 'text-cyan-400' : 'text-gray-400'}>
                        {twin.quantumOptimized ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Updated {new Date(twin.updatedAt).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTwins.map((twin, index) => (
                <motion.div
                  key={twin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedTwin(twin)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTwinTypeIcon(twin.type)}
                      <div>
                        <h3 className="font-semibold">{twin.name}</h3>
                        <p className="text-gray-400 text-sm">{twin.physicalEntity.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Sync Mode</p>
                        <p className="text-sm capitalize">{twin.synchronization.mode.replace('_', ' ')}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">Dimensions</p>
                        <p className="text-sm">{twin.dimensions.length}D</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">AI Enhanced</p>
                        <p className={`text-sm ${twin.aiEnhanced ? 'text-green-400' : 'text-gray-400'}`}>
                          {twin.aiEnhanced ? 'Yes' : 'No'}
                        </p>
                      </div>

                      <div className={`flex items-center space-x-1 ${getStatusColor(twin.status)}`}>
                        {getStatusIcon(twin.status)}
                        <span className="text-sm capitalize">{twin.status}</span>
                      </div>

                      <div className="flex space-x-2">
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Last Refresh Info */}
      <div className="mt-6 text-center text-sm text-gray-400">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DigitalTwinIntegrationDashboard;
