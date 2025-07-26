import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Atom,
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
  Network,
  Users
} from 'lucide-react';

import { quantumComputingIntegration, QuantumSystem, QuantumType, QuantumStatus, QuantumAlgorithm, QuantumErrorCorrection, ProcessorStatus, SecurityLevel } from '../../lib/quantum-computing-integration';
import { useSystemHealth } from '../shell/hooks/useSystemHealth';
import { EmptyState } from '../empty-states/EmptyState';

interface QuantumComputingIntegrationDashboardProps {
  className?: string;
}

const QuantumComputingIntegrationDashboard: React.FC<QuantumComputingIntegrationDashboardProps> = ({ className = '' }) => {
  const [quantumSystems, setQuantumSystems] = useState<QuantumSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<QuantumSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'systems' | 'processors' | 'analytics' | 'optimization' | 'settings'>('overview');
  const [filterType, setFilterType] = useState<QuantumType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<QuantumStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const systemHealth = useSystemHealth();

  // Load quantum systems on component mount
  useEffect(() => {
    loadQuantumSystems();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadQuantumSystems();
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadQuantumSystems = async () => {
    try {
      setLoading(true);
      setError(null);

      const quantumData = await quantumComputingIntegration.getAllQuantumSystems();
      setQuantumSystems(quantumData);

      // If no quantum systems exist, create some sample systems for demonstration
      if (quantumData.length === 0) {
        await createSampleQuantumSystems();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quantum systems');
      console.error('Error loading quantum systems:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleQuantumSystems = async () => {
    try {
      // Create sample quantum system
      const sampleSystem = {
        id: 'quantum-001',
        name: 'Advanced Quantum Computing System',
        type: 'superconducting' as QuantumType,
        status: 'idle' as QuantumStatus,
        processors: [
          {
            id: 'processor-001',
            name: 'Quantum Processor 1',
            type: 'superconducting' as QuantumType,
            status: 'online' as ProcessorStatus,
            capabilities: {
              maxQubits: 100,
              maxGates: 1000,
              coherenceTime: 1000,
              gateFidelity: 0.999,
              measurementFidelity: 0.995,
              aiOptimized: true
            },
            qubits: 100,
            coherence: 1000,
            fidelity: 0.999,
            connectivity: {
              topology: 'nearest_neighbor',
              maxDistance: 2,
              errorRate: 0.001,
              aiOptimized: true
            },
            aiOptimized: true
          }
        ],
        algorithms: ['grover', 'shor', 'quantum_ml'] as QuantumAlgorithm[],
        qubits: 100,
        gates: 1000,
        memory: {
          id: 'memory-001',
          type: 'quantum_ram',
          capacity: 1024,
          coherence: 1000,
          errorRate: 0.001,
          accessTime: 10,
          aiOptimized: true
        },
        performance: {
          computation: {
            quantumSpeedup: 1000,
            algorithmEfficiency: 95,
            parallelization: 100,
            accuracy: 99.9,
            aiOptimized: true
          },
          communication: {
            entanglementRate: 1000,
            fidelity: 99.9,
            bandwidth: 10000,
            latency: 1,
            aiOptimized: true
          },
          errorCorrection: {
            errorRate: 0.001,
            correctionEfficiency: 99.9,
            faultTolerance: 99.9,
            overhead: 10,
            aiOptimized: true
          },
          aiPerformance: {
            inferenceTime: 1,
            accuracy: 99.9,
            modelEfficiency: 95,
            optimizationLevel: 90,
            aiOptimized: true
          },
          metrics: {
            totalQubits: 100,
            activeQubits: 0,
            totalGates: 1000,
            executedGates: 0,
            averageFidelity: 99.9,
            customMetrics: {}
          }
        },
        errorCorrection: {
          method: 'surface_code' as QuantumErrorCorrection,
          enabled: true,
          parameters: {
            codeDistance: 3,
            logicalQubits: 10,
            physicalQubits: 100,
            syndromeExtraction: true,
            aiOptimized: true
          },
          performance: {
            errorRate: 0.001,
            correctionEfficiency: 99.9,
            faultTolerance: 99.9,
            overhead: 10,
            aiOptimized: true
          },
          aiOptimized: true
        },
        security: {
          level: 'high' as SecurityLevel,
          cryptography: {
            enabled: true,
            algorithms: ['RSA', 'ECC', 'AES'],
            keySize: 256,
            aiOptimized: true
          },
          keyDistribution: {
            enabled: true,
            protocol: 'BB84',
            distance: 100,
            rate: 1000,
            aiOptimized: true
          },
          threatDetection: {
            enabled: true,
            threats: [],
            aiOptimized: true
          },
          aiOptimized: true
        },
        analytics: [],
        aiEnhanced: true,
        hybridOptimized: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await quantumComputingIntegration.createQuantumSystem(
        sampleSystem.name,
        sampleSystem.type,
        sampleSystem.processors,
        sampleSystem.algorithms,
        sampleSystem.errorCorrection,
        sampleSystem.security,
        sampleSystem.aiEnhanced,
        sampleSystem.hybridOptimized
      );
      await loadQuantumSystems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sample quantum systems');
      console.error('Error creating sample quantum systems:', err);
    }
  };

  const getStatusColor = (status: QuantumStatus) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'idle': return 'text-blue-400';
      case 'initializing': return 'text-yellow-400';
      case 'measuring': return 'text-purple-400';
      case 'error_correction': return 'text-orange-400';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-400';
      case 'maintenance': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: QuantumStatus) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'idle': return <Pause className="w-4 h-4" />;
      case 'initializing': return <RefreshCw className="w-4 h-4" />;
      case 'measuring': return <Target className="w-4 h-4" />;
      case 'error_correction': return <Shield className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getQuantumTypeIcon = (type: QuantumType) => {
    switch (type) {
      case 'superconducting': return <Atom className="w-4 h-4" />;
      case 'trapped_ion': return <Cpu className="w-4 h-4" />;
      case 'neutral_atom': return <Brain className="w-4 h-4" />;
      case 'photonics': return <Zap className="w-4 h-4" />;
      case 'topological': return <Layers className="w-4 h-4" />;
      case 'hybrid': return <Network className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const filteredSystems = quantumSystems.filter(system => {
    const matchesType = filterType === 'all' || system.type === filterType;
    const matchesStatus = filterStatus === 'all' || system.status === filterStatus;
    const matchesSearch = system.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className={`p-6 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading quantum computing systems...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Quantum Systems</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadQuantumSystems}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Atom className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Quantum Computing Integration</h1>
            <p className="text-gray-400">Advanced quantum systems and AI-enhanced computing</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadQuantumSystems}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New System</span>
          </button>
        </div>
      </div>

      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Atom className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Systems</p>
              <p className="text-2xl font-bold">{quantumSystems.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Cpu className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Active Processors</p>
              <p className="text-2xl font-bold">
                {quantumSystems.reduce((sum, system) => sum + system.processors.length, 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">AI Enhanced</p>
              <p className="text-2xl font-bold">
                {quantumSystems.filter(s => s.aiEnhanced).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Network className="w-6 h-6 text-orange-400" />
            <div>
              <p className="text-sm text-gray-400">Hybrid Optimized</p>
              <p className="text-2xl font-bold">
                {quantumSystems.filter(s => s.hybridOptimized).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search quantum systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as QuantumType | 'all')}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="superconducting">Superconducting</option>
            <option value="trapped_ion">Trapped Ion</option>
            <option value="neutral_atom">Neutral Atom</option>
            <option value="photonics">Photonics</option>
            <option value="topological">Topological</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as QuantumStatus | 'all')}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="idle">Idle</option>
            <option value="running">Running</option>
            <option value="initializing">Initializing</option>
            <option value="measuring">Measuring</option>
            <option value="error_correction">Error Correction</option>
            <option value="completed">Completed</option>
            <option value="error">Error</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quantum Systems Grid/List */}
      {filteredSystems.length === 0 ? (
        <EmptyState
          icon={Atom}
          title="No Quantum Systems Found"
          description="Create your first quantum computing system to get started with advanced quantum algorithms and AI-enhanced processing."
          action={{
            label: "Create Quantum System",
            onClick: () => console.log("Create quantum system")
          }}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredSystems.map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer ${
                selectedSystem?.id === system.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedSystem(system)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getQuantumTypeIcon(system.type)}
                  <div>
                    <h3 className="text-lg font-semibold">{system.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{system.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 ${getStatusColor(system.status)}`}>
                  {getStatusIcon(system.status)}
                  <span className="text-sm capitalize">{system.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Qubits</p>
                  <p className="text-lg font-semibold">{system.qubits.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gates</p>
                  <p className="text-lg font-semibold">{system.gates.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Processors</p>
                  <p className="text-lg font-semibold">{system.processors.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Algorithms</p>
                  <p className="text-lg font-semibold">{system.algorithms.length}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {system.aiEnhanced && (
                    <div className="flex items-center space-x-1 text-blue-400">
                      <Brain className="w-4 h-4" />
                      <span className="text-xs">AI</span>
                    </div>
                  )}
                  {system.hybridOptimized && (
                    <div className="flex items-center space-x-1 text-orange-400">
                      <Network className="w-4 h-4" />
                      <span className="text-xs">Hybrid</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Last Refresh */}
      <div className="mt-6 text-center text-sm text-gray-400">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default QuantumComputingIntegrationDashboard;
