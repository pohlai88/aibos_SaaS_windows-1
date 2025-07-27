'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Eye,
  MessageSquare,
  Database,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Target,
  Network,
  Layers,
  Activity,
  Gauge,
  Code,
  Sparkles,
  Upload,
  Download,
  Share,
  Copy,
  Trash2,
  Plus,
  Save,
  FileText,
  Image,
  Mic,
  Video,
  Cpu,
  Lightbulb
} from 'lucide-react';

// ==================== MULTI-MODAL AI FUSION ====================
import {
  multiModalAIFusion,
  FusionRequest,
  FusionResult,
  ModalityData,
  ModalityType,
  CrossModalRelationship
} from '@/lib/multi-modal-ai-fusion';

// ==================== UI COMPONENTS ====================
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/empty-states/EmptyState';

// ==================== HOOKS & UTILITIES ====================
import { useAIBOSStore } from '@/lib/store';
import { useConsciousness } from '@/hooks/useConsciousness';
import { aiBackendAPI } from '@/lib/api';
import { cachedConsciousnessAPI } from '@/lib/cached-api';
import {
  designTokens,
  SecurityValidation,
  RateLimiter,
  Logger,
  createMemoryCache,
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
} from 'aibos-shared-infrastructure';

// ==================== TYPES ====================

interface MultiModalAIFusionDashboardProps {
  className?: string;
  tenantId?: string;
  userId?: string;
}

interface ModalityInput {
  type: ModalityType;
  content: string | File | any;
  metadata?: Record<string, any>;
  confidence?: number;
  source: string;
}

interface FusionSession {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  modalities: ModalityInput[];
  result?: FusionResult;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== CONSTANTS ====================

const MODALITY_TYPES: { type: ModalityType; name: string; icon: React.ComponentType<any>; description: string }[] = [
  { type: 'text', name: 'Text', icon: FileText, description: 'Natural language text' },
  { type: 'image', name: 'Image', icon: Image, description: 'Visual content and images' },
  { type: 'audio', name: 'Audio', icon: Mic, description: 'Audio recordings and sounds' },
  { type: 'video', name: 'Video', icon: Video, description: 'Video content and streams' },
  { type: 'data', name: 'Data', icon: Database, description: 'Structured data and metrics' },
  { type: 'sensor', name: 'Sensor', icon: Cpu, description: 'Sensor data and IoT' },
  { type: 'structured', name: 'Structured', icon: Code, description: 'Formatted data' },
  { type: 'unstructured', name: 'Unstructured', icon: Brain, description: 'Raw unstructured data' }
];

// ==================== MULTI-MODAL AI FUSION DASHBOARD ====================

export default function MultiModalAIFusionDashboard({ className, tenantId, userId }: MultiModalAIFusionDashboardProps) {
  // ==================== STATE MANAGEMENT ====================
  const [sessions, setSessions] = useState<FusionSession[]>([]);
  const [currentSession, setCurrentSession] = useState<FusionSession | null>(null);
  const [modalities, setModalities] = useState<ModalityInput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [crossModalRelationships, setCrossModalRelationships] = useState<CrossModalRelationship[]>([]);

  // ==================== HOOKS ====================
  const { user } = useAIBOSStore();
  const {
    status: consciousnessStatus,
    emotionalState,
    wisdom,
    simulateExperience,
    simulateInteraction,
    processWithAIEngines
  } = useConsciousness();

  // ==================== SHARED INFRASTRUCTURE ====================
  const sharedCache = createMemoryCache({ maxSize: 1000, ttl: 300000 });
  const sharedLogger = Logger;
  const sharedSecurity = SecurityValidation;
  const sharedRateLimiter = RateLimiter;

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    loadPerformanceStats();
    loadCrossModalRelationships();
  }, []);

  const loadPerformanceStats = useCallback(async () => {
    try {
      const stats = await multiModalAIFusion.getPerformanceStats();
      setPerformanceStats(stats);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    }
  }, []);

  const loadCrossModalRelationships = useCallback(async () => {
    try {
      const relationships = await multiModalAIFusion.getCrossModalRelationships();
      setCrossModalRelationships(relationships);
    } catch (error) {
      console.error('Failed to load cross-modal relationships:', error);
    }
  }, []);

  // ==================== SESSION MANAGEMENT ====================

  const createSession = useCallback((name: string, description: string) => {
    const session: FusionSession = {
      id: `session-${Date.now()}`,
      name,
      description,
      status: 'idle',
      modalities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSessions(prev => [...prev, session]);
    setCurrentSession(session);
    setModalities([]);

    return session;
  }, []);

  const addModality = useCallback((modality: ModalityInput) => {
    setModalities(prev => [...prev, modality]);
  }, []);

  const removeModality = useCallback((index: number) => {
    setModalities(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateModality = useCallback((index: number, updates: Partial<ModalityInput>) => {
    setModalities(prev => prev.map((modality, i) =>
      i === index ? { ...modality, ...updates } : modality
    ));
  }, []);

  // ==================== FUSION PROCESSING ====================

  const processFusion = useCallback(async () => {
    if (!currentSession || modalities.length === 0) {
      setError('Please create a session and add modalities first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Update session status
      setCurrentSession(prev => prev ? { ...prev, status: 'processing', updatedAt: new Date() } : null);

      // Convert modalities to ModalityData format
      const modalityData: ModalityData[] = modalities.map((modality, index) => ({
        type: modality.type,
        content: modality.content,
        metadata: modality.metadata || {},
        confidence: modality.confidence || 0.8,
        timestamp: new Date(),
        source: modality.source || `user-input-${index}`
      }));

      // Create fusion request
      const request: FusionRequest = {
        id: currentSession.id,
        modalities: modalityData,
        context: {
          sessionName: currentSession.name,
          userId: user?.id,
          tenantId,
          timestamp: new Date()
        },
        objectives: ['unified_understanding', 'cross_modal_insights', 'integrated_recommendations'],
        constraints: [],
        preferences: {
          priority: 'balance',
          explainability: true,
          confidence: 0.8
        }
      };

      // Process fusion
      const result = await multiModalAIFusion.fuseModalities(request);

      // Update session with result
      const updatedSession: FusionSession = {
        ...currentSession,
        status: 'completed',
        result,
        updatedAt: new Date()
      };

      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));

      // Record consciousness experience
      await simulateExperience({
        type: 'multi_modal_fusion_completed',
        complexity: 'high',
        duration: result.performance.processingTime,
        outcomes: ['unified_understanding', 'cross_modal_insights'],
        learningObjectives: ['multi_modal_learning', 'unified_reasoning']
      });

      // Process with consciousness AI engines
      await processWithAIEngines(result, ['parallel', 'ml', 'nlp']);

      // Reload performance stats
      await loadPerformanceStats();
      await loadCrossModalRelationships();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fusion processing failed');
      setCurrentSession(prev => prev ? { ...prev, status: 'failed', updatedAt: new Date() } : null);
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, modalities, user, tenantId, simulateExperience, processWithAIEngines, loadPerformanceStats, loadCrossModalRelationships]);

  // ==================== RENDER FUNCTIONS ====================

  const renderModalitySelector = () => (
    <DashboardCard title="Multi Modal A I Fusion Dashboard" className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Add Modalities</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {MODALITY_TYPES.map((modalityType) => {
          const Icon = modalityType.icon;

          return (
            <motion.div
              key={modalityType.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addModality({
                type: modalityType.type,
                content: '',
                source: 'user-input',
                confidence: 0.8
              })}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{modalityType.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{modalityType.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardCard>
  );

  const renderModalitiesList = () => (
    <DashboardCard title="Multi Modal A I Fusion Dashboard" className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Current Modalities ({modalities.length})</h3>

      {modalities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No modalities added yet. Select modalities above to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {modalities.map((modality, index) => {
            const modalityType = MODALITY_TYPES.find(mt => mt.type === modality.type);
            const Icon = modalityType?.icon || FileText;

            return (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium capitalize">{modality.type}</span>
                    <span className="text-sm text-gray-500">from {modality.source}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Confidence: {(modality.confidence || 0.8) * 100}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModality(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={typeof modality.content === 'string' ? modality.content : ''}
                    onChange={(e) => updateModality(index, { content: e.target.value })}
                    placeholder={`Enter ${modality.type} content...`}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    rows={3}
                  />

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={modality.confidence || 0.8}
                        onChange={(e) => updateModality(index, { confidence: parseFloat(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">
                        {((modality.confidence || 0.8) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );

  const renderFusionControls = () => (
    <DashboardCard title="Multi Modal A I Fusion Dashboard" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fusion Controls</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button
            onClick={() => createSession('New Fusion Session', 'Multi-modal AI fusion analysis')}
            disabled={isProcessing}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Session
          </Button>

          <Button
            onClick={processFusion}
            disabled={isProcessing || modalities.length === 0}
            variant="primary"
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Fusion
              </>
            )}
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Current Session</h4>
              <div className="text-sm space-y-1">
                <div>Name: {currentSession?.name || 'None'}</div>
                <div>Status: {currentSession?.status || 'None'}</div>
                <div>Modalities: {modalities.length}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Performance Stats</h4>
              <div className="text-sm space-y-1">
                <div>Total Fusions: {performanceStats?.totalFusions || 0}</div>
                <div>Success Rate: {performanceStats?.successRate ? (performanceStats.successRate * 100).toFixed(1) + '%' : 'N/A'}</div>
                <div>Avg Confidence: {performanceStats?.averageConfidence ? (performanceStats.averageConfidence * 100).toFixed(1) + '%' : 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );

  const renderFusionResult = () => {
    if (!currentSession?.result) return null;

    const result = currentSession.result;

    return (
      <div className="space-y-6">
        {/* Unified Understanding */}
        <DashboardCard title="Multi Modal A I Fusion Dashboard">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Unified Understanding</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Summary</h4>
              <p className="text-gray-700 dark:text-gray-300">{result.unifiedUnderstanding.summary}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {result.unifiedUnderstanding.keyInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {insight}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Confidence:</span>
              <span className="font-medium">{(result.unifiedUnderstanding.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </DashboardCard>

        {/* Cross-Modal Insights */}
        <DashboardCard title="Multi Modal A I Fusion Dashboard">
          <div className="flex items-center space-x-2 mb-4">
            <Network className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Cross-Modal Insights</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Text Insights</h4>
              <ul className="space-y-1">
                {result.crossModalInsights.textInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {insight}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Visual Insights</h4>
              <ul className="space-y-1">
                {result.crossModalInsights.visualInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {insight}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Data Insights</h4>
              <ul className="space-y-1">
                {result.crossModalInsights.dataInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardCard>

        {/* Unified Reasoning */}
        <DashboardCard title="Multi Modal A I Fusion Dashboard">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold">Unified Reasoning</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Reasoning</h4>
              <p className="text-gray-700 dark:text-gray-300">{result.unifiedReasoning.reasoning}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Decision Factors</h4>
              <ul className="space-y-1">
                {result.unifiedReasoning.decisionFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {factor}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {result.unifiedReasoning.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardCard>

        {/* Integrated Output */}
        <DashboardCard title="Multi Modal A I Fusion Dashboard">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Integrated Output</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Action</h4>
              <p className="text-gray-700 dark:text-gray-300">{result.integratedOutput.action}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Next Steps</h4>
              <ul className="space-y-1">
                {result.integratedOutput.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {step}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Risks</h4>
              <ul className="space-y-1">
                {result.integratedOutput.risks.map((risk, index) => (
                  <li key={index} className="text-sm text-red-600">• {risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardCard>

        {/* Performance Metrics */}
        <DashboardCard title="Multi Modal A I Fusion Dashboard">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Performance Metrics</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.performance.processingTime}ms</div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(result.performance.accuracy * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(result.performance.crossModalAccuracy * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Cross-Modal Accuracy</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{(result.performance.confidence * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
          </div>
        </DashboardCard>

        {/* Explainability */}
        <DashboardCard title="Multi Modal A I Fusion Dashboard">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold">Explainability</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Reasoning</h4>
              <p className="text-gray-700 dark:text-gray-300">{result.explainability.reasoning}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Confidence Factors</h4>
              <ul className="space-y-1">
                {result.explainability.confidenceFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {factor}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Uncertainty Areas</h4>
              <ul className="space-y-1">
                {result.explainability.uncertaintyAreas.map((area, index) => (
                  <li key={index} className="text-sm text-yellow-600">• {area}</li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardCard>
      </div>
    );
  };

  const renderCrossModalRelationships = () => (
    <DashboardCard title="Multi Modal A I Fusion Dashboard" className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Cross-Modal Relationships</h3>

      {crossModalRelationships.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No cross-modal relationships available yet. Run a fusion to see relationships.
        </div>
      ) : (
        <div className="space-y-3">
          {crossModalRelationships.map((relationship, index) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium capitalize">{relationship.sourceModality}</span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium capitalize">{relationship.targetModality}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  relationship.relationshipType === 'complementary' ? 'bg-green-100 text-green-800' :
                  relationship.relationshipType === 'conflicting' ? 'bg-red-100 text-red-800' :
                  relationship.relationshipType === 'correlation' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {relationship.relationshipType}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {relationship.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Strength: {(relationship.strength * 100).toFixed(1)}%</span>
                <span>Confidence: {(relationship.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Multi-Modal AI Fusion Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Revolutionary unified AI intelligence across multiple data modalities
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 dark:text-red-200 font-medium">Error:</span>
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Modality Selector */}
        {renderModalitySelector()}

        {/* Modalities List */}
        {renderModalitiesList()}

        {/* Fusion Controls */}
        {renderFusionControls()}

        {/* Cross-Modal Relationships */}
        {renderCrossModalRelationships()}

        {/* Fusion Result */}
        {renderFusionResult()}

        {/* Empty State */}
        {!currentSession && sessions.length === 0 && (
          <EmptyState
            icon={Brain}
            title="Ready for Multi-Modal Fusion"
            description="Start your revolutionary AI fusion journey by creating a session and adding multiple data modalities for unified AI intelligence."
            action={{
              label: "Create First Session",
              onClick: () => createSession('My First Fusion', 'Multi-modal AI fusion analysis'),
              variant: "primary"
            }}
          />
        )}
      </div>
    </div>
  );
}
