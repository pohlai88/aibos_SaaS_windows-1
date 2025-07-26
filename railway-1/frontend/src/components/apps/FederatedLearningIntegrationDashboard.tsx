import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Cpu,
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
  Atom,
  Users
} from 'lucide-react';

import { federatedLearningIntegration, FederatedLearning, FederatedType, LearningStatus, AggregationMethod, PrivacyLevel } from '../../lib/federated-learning-integration';
import { useSystemHealth } from '../shell/hooks/useSystemHealth';
import { EmptyState } from '../empty-states/EmptyState';

interface FederatedLearningIntegrationDashboardProps {
  className?: string;
}

const FederatedLearningIntegrationDashboard: React.FC<FederatedLearningIntegrationDashboardProps> = ({ className = '' }) => {
  const [federatedLearning, setFederatedLearning] = useState<FederatedLearning[]>([]);
  const [selectedFederated, setSelectedFederated] = useState<FederatedLearning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'federated' | 'participants' | 'analytics' | 'optimization' | 'settings'>('overview');
  const [filterType, setFilterType] = useState<FederatedType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<LearningStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const systemHealth = useSystemHealth();

  // Load federated learning on component mount
  useEffect(() => {
    loadFederatedLearning();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadFederatedLearning();
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadFederatedLearning = async () => {
    try {
      setLoading(true);
      setError(null);

      const federatedData = await federatedLearningIntegration.getAllFederatedLearning();
      setFederatedLearning(federatedData);

      // If no federated learning exists, create some sample federated learning for demonstration
      if (federatedData.length === 0) {
        await createSampleFederatedLearning();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load federated learning');
      console.error('Error loading federated learning:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleFederatedLearning = async () => {
    try {
      // Create sample coordinator
      const coordinator = {
        id: 'coordinator-001',
        name: 'Central Coordinator',
        type: 'centralized' as const,
        capabilities: {
          aggregation: true,
          scheduling: true,
          monitoring: true,
          optimization: true,
          aiOptimized: true
        },
        strategy: {
          method: 'adaptive',
          parameters: { learningRate: 0.01, batchSize: 32 },
          adaptive: true,
          aiOptimized: true
        },
        aiOptimized: true
      };

      // Create sample model
      const model = {
        id: 'model-001',
        name: 'Federated Neural Network',
        architecture: {
          type: 'CNN',
          layers: 5,
          neurons: [64, 128, 256, 128, 64],
          activation: 'ReLU',
          aiOptimized: true
        },
        parameters: {
          total: 1000000,
          trainable: 950000,
          nonTrainable: 50000,
          size: 50,
          aiOptimized: true
        },
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          epochs: 10,
          optimizer: 'Adam',
          lossFunction: 'CrossEntropy',
          aiOptimized: true
        },
        performance: {
          accuracy: 0,
          loss: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          aiOptimized: true
        },
        aiOptimized: true
      };

      // Create sample training config
      const training = {
        rounds: 10,
        currentRound: 0,
        batchSize: 32,
        learningRate: 0.001,
        epochs: 10,
        validation: {
          enabled: true,
          split: 0.2,
          metrics: ['accuracy', 'loss', 'precision', 'recall'],
          aiOptimized: true
        },
        aiOptimized: true
      };

      // Create sample aggregation config
      const aggregation = {
        method: 'fedavg' as AggregationMethod,
        parameters: { weight: 1.0 },
        frequency: 1,
        threshold: 0.8,
        aiOptimized: true
      };

      // Create sample privacy config
      const privacy = {
        level: 'differential' as PrivacyLevel,
        techniques: [
          {
            name: 'differential_privacy',
            enabled: true,
            parameters: { epsilon: 1.0, delta: 0.0001 },
            aiOptimized: true
          }
        ],
        encryption: {
          enabled: true,
          algorithm: 'AES-256',
          keySize: 256,
          aiOptimized: true
        },
        differentialPrivacy: {
          enabled: true,
          epsilon: 1.0,
          delta: 0.0001,
          sensitivity: 1.0,
          aiOptimized: true
        },
        aiOptimized: true
      };

      // Create federated learning
      const federated = await federatedLearningIntegration.createFederatedLearning(
        'Distributed Image Classification',
        'horizontal',
        coordinator,
        model,
        training,
        aggregation,
        privacy,
        true, // AI enhanced
        false // Quantum optimized
      );

      // Add sample participants
      await federatedLearningIntegration.addParticipant(
        federated.id,
        'Edge Device 1',
        'edge_device',
        {
          compute: { cpu: 4, gpu: 1, cores: 8, frequency: 2.4, aiOptimized: true },
          memory: { ram: 8192, vram: 4096, cache: 512, aiOptimized: true },
          network: { bandwidth: 100, latency: 50, reliability: 99.9, aiOptimized: true },
          storage: { capacity: 512, speed: 500, type: 'SSD', aiOptimized: true },
          ai: { frameworks: ['TensorFlow', 'PyTorch'], models: 5, inferenceSpeed: 100, aiOptimized: true },
          quantum: { quantumBits: 64, quantumGates: 500, quantumMemory: 256, quantumOptimized: true },
          aiOptimized: true
        },
        {
          size: 1000,
          samples: 50000,
          features: 784,
          distribution: { type: 'normal', parameters: { mean: 0, std: 1 }, skewness: 0, aiOptimized: true },
          quality: 95,
          privacy: 'differential',
          aiOptimized: true
        },
        true
      );

      await federatedLearningIntegration.addParticipant(
        federated.id,
        'Mobile Device 1',
        'mobile_device',
        {
          compute: { cpu: 2, gpu: 0, cores: 4, frequency: 1.8, aiOptimized: true },
          memory: { ram: 4096, vram: 0, cache: 256, aiOptimized: true },
          network: { bandwidth: 50, latency: 100, reliability: 99.5, aiOptimized: true },
          storage: { capacity: 128, speed: 200, type: 'eMMC', aiOptimized: true },
          ai: { frameworks: ['TensorFlow Lite'], models: 2, inferenceSpeed: 50, aiOptimized: true },
          quantum: { quantumBits: 32, quantumGates: 250, quantumMemory: 128, quantumOptimized: true },
          aiOptimized: true
        },
        {
          size: 500,
          samples: 25000,
          features: 784,
          distribution: { type: 'normal', parameters: { mean: 0, std: 1 }, skewness: 0, aiOptimized: true },
          quality: 90,
          privacy: 'differential',
          aiOptimized: true
        },
        true
      );

      setFederatedLearning([federated]);
    } catch (err) {
      console.error('Error creating sample federated learning:', err);
    }
  };

  const filteredFederatedLearning = federatedLearning.filter(federated => {
    const matchesType = filterType === 'all' || federated.type === filterType;
    const matchesStatus = filterStatus === 'all' || federated.status === filterStatus;
    const matchesSearch = federated.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: LearningStatus) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'training': return 'text-blue-400';
      case 'aggregating': return 'text-purple-400';
      case 'evaluating': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'paused': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: LearningStatus) => {
    switch (status) {
      case 'idle': return <Pause className="w-4 h-4" />;
      case 'training': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'aggregating': return <Network className="w-4 h-4" />;
      case 'evaluating': return <BarChart3 className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getFederatedTypeIcon = (type: FederatedType) => {
    switch (type) {
      case 'horizontal': return <Network className="w-5 h-5" />;
      case 'vertical': return <Layers className="w-5 h-5" />;
      case 'federated_transfer': return <Brain className="w-5 h-5" />;
      case 'multi_task': return <Target className="w-5 h-5" />;
      case 'cross_silo': return <Server className="w-5 h-5" />;
      case 'custom': return <Settings className="w-5 h-5" />;
      default: return <Network className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-lg">Loading Federated Learning...</span>
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
            <h3 className="text-xl font-semibold mb-2">Error Loading Federated Learning</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadFederatedLearning}
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
          <Network className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Federated Learning Integration</h1>
            <p className="text-gray-400">Distributed AI training across multiple devices</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadFederatedLearning}
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
            placeholder="Search federated learning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FederatedType | 'all')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="federated_transfer">Federated Transfer</option>
          <option value="multi_task">Multi-Task</option>
          <option value="cross_silo">Cross-Silo</option>
          <option value="custom">Custom</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LearningStatus | 'all')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="idle">Idle</option>
          <option value="training">Training</option>
          <option value="aggregating">Aggregating</option>
          <option value="evaluating">Evaluating</option>
          <option value="completed">Completed</option>
          <option value="error">Error</option>
          <option value="paused">Paused</option>
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
      {filteredFederatedLearning.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No Federated Learning Found"
          description="No federated learning matches your current filters. Try adjusting your search criteria or create a new federated learning session."
          action={{
            label: 'Create New Federated Learning',
            onClick: () => console.log('Create new federated learning'),
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
                  <p className="text-gray-400 text-sm">Total Federated</p>
                  <p className="text-2xl font-bold">{federatedLearning.length}</p>
                </div>
                <Network className="w-8 h-8 text-blue-400" />
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
                  <p className="text-gray-400 text-sm">Active Federated</p>
                  <p className="text-2xl font-bold">{federatedLearning.filter(f => f.status === 'training').length}</p>
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
                  <p className="text-gray-400 text-sm">Total Participants</p>
                  <p className="text-2xl font-bold">{federatedLearning.reduce((sum, f) => sum + f.participants.length, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
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
                  <p className="text-gray-400 text-sm">AI Enhanced</p>
                  <p className="text-2xl font-bold">{federatedLearning.filter(f => f.aiEnhanced).length}</p>
                </div>
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
            </motion.div>
          </div>

          {/* Federated Learning Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFederatedLearning.map((federated, index) => (
                <motion.div
                  key={federated.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedFederated(federated)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFederatedTypeIcon(federated.type)}
                      <div>
                        <h3 className="font-semibold text-lg">{federated.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{federated.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(federated.status)}`}>
                      {getStatusIcon(federated.status)}
                      <span className="text-sm capitalize">{federated.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Participants:</span>
                      <span>{federated.participants.length}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Rounds:</span>
                      <span>{federated.training.currentRound}/{federated.training.rounds}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Accuracy:</span>
                      <span>{(federated.performance.training.accuracy * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Privacy Level:</span>
                      <span className="capitalize">{federated.privacy.level.replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">AI Enhanced:</span>
                      <span className={federated.aiEnhanced ? 'text-green-400' : 'text-gray-400'}>
                        {federated.aiEnhanced ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Quantum Optimized:</span>
                      <span className={federated.quantumOptimized ? 'text-cyan-400' : 'text-gray-400'}>
                        {federated.quantumOptimized ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Updated {new Date(federated.updatedAt).toLocaleTimeString()}</span>
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
              {filteredFederatedLearning.map((federated, index) => (
                <motion.div
                  key={federated.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedFederated(federated)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFederatedTypeIcon(federated.type)}
                      <div>
                        <h3 className="font-semibold">{federated.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{federated.type.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Participants</p>
                        <p className="text-sm">{federated.participants.length}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">Rounds</p>
                        <p className="text-sm">{federated.training.currentRound}/{federated.training.rounds}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">Accuracy</p>
                        <p className="text-sm">{(federated.performance.training.accuracy * 100).toFixed(1)}%</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-400">Privacy</p>
                        <p className="text-sm capitalize">{federated.privacy.level.replace('_', ' ')}</p>
                      </div>

                      <div className={`flex items-center space-x-1 ${getStatusColor(federated.status)}`}>
                        {getStatusIcon(federated.status)}
                        <span className="text-sm capitalize">{federated.status}</span>
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

export default FederatedLearningIntegrationDashboard;
