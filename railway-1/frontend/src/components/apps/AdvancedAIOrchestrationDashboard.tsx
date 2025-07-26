'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Cpu,
  Network,
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
  Layers,
  Activity,
  Gauge,
  Code,
  Sparkles,
  Upload,
  Download,
  Share,
  Eye,
  Copy,
  Trash2,
  Plus,
  Save,
  FileText,
  Image,
  Mic,
  Video,
  Database,
  Lightbulb,
  Users,
  Workflow,
  TrendingUp,
  Shield,
  Globe,
  Rocket
} from 'lucide-react';

// ==================== ADVANCED AI ORCHESTRATION ====================
import {
  advancedAIOrchestration,
  AIAgent,
  DynamicWorkflow,
  WorkflowStep,
  AgentType,
  OrchestrationDecision,
  ResourceType
} from '@/lib/advanced-ai-orchestration';

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

interface AdvancedAIOrchestrationDashboardProps {
  className?: string;
  tenantId?: string;
  userId?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'data_processing' | 'ml_training' | 'analysis' | 'optimization' | 'custom';
  steps: Omit<WorkflowStep, 'id' | 'status' | 'startTime' | 'endTime'>[];
  estimatedDuration: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

// ==================== CONSTANTS ====================

const AGENT_TYPES: { type: AgentType; name: string; icon: React.ComponentType<any>; description: string; color: string }[] = [
  { type: 'coordinator', name: 'Coordinator', icon: Users, description: 'Workflow coordination and management', color: 'text-blue-600' },
  { type: 'processor', name: 'Processor', icon: Cpu, description: 'Data processing and computation', color: 'text-green-600' },
  { type: 'analyzer', name: 'Analyzer', icon: Brain, description: 'Intelligence analysis and insights', color: 'text-purple-600' },
  { type: 'optimizer', name: 'Optimizer', icon: TrendingUp, description: 'Performance optimization', color: 'text-orange-600' },
  { type: 'validator', name: 'Validator', icon: Shield, description: 'Quality validation and assurance', color: 'text-red-600' },
  { type: 'learner', name: 'Learner', icon: Lightbulb, description: 'Adaptive learning and improvement', color: 'text-yellow-600' },
  { type: 'communicator', name: 'Communicator', icon: Globe, description: 'Communication and reporting', color: 'text-indigo-600' },
  { type: 'planner', name: 'Planner', icon: Workflow, description: 'Strategic planning and coordination', color: 'text-teal-600' }
];

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'data-processing',
    name: 'Data Processing Pipeline',
    description: 'End-to-end data processing workflow',
    category: 'data_processing',
    complexity: 'moderate',
    estimatedDuration: 300000, // 5 minutes
    steps: [
      {
        name: 'Data Ingestion',
        description: 'Load and validate input data',
        agentType: 'processor',
        dependencies: [],
        estimatedDuration: 30000,
        resources: { cpu: 20, memory: 30, network: 10 },
        priority: 'high'
      },
      {
        name: 'Data Validation',
        description: 'Validate data quality and integrity',
        agentType: 'validator',
        dependencies: ['Data Ingestion'],
        estimatedDuration: 20000,
        resources: { cpu: 15, memory: 20, network: 5 },
        priority: 'high'
      },
      {
        name: 'Data Processing',
        description: 'Process and transform data',
        agentType: 'processor',
        dependencies: ['Data Validation'],
        estimatedDuration: 60000,
        resources: { cpu: 40, memory: 50, network: 15 },
        priority: 'medium'
      },
      {
        name: 'Quality Check',
        description: 'Final quality assurance',
        agentType: 'validator',
        dependencies: ['Data Processing'],
        estimatedDuration: 15000,
        resources: { cpu: 10, memory: 15, network: 5 },
        priority: 'medium'
      }
    ]
  },
  {
    id: 'ml-training',
    name: 'ML Model Training',
    description: 'Complete machine learning training workflow',
    category: 'ml_training',
    complexity: 'complex',
    estimatedDuration: 900000, // 15 minutes
    steps: [
      {
        name: 'Data Preparation',
        description: 'Prepare training data',
        agentType: 'processor',
        dependencies: [],
        estimatedDuration: 60000,
        resources: { cpu: 30, memory: 40, network: 10 },
        priority: 'high'
      },
      {
        name: 'Model Training',
        description: 'Train machine learning model',
        agentType: 'analyzer',
        dependencies: ['Data Preparation'],
        estimatedDuration: 300000,
        resources: { cpu: 50, memory: 60, gpu: 30, network: 20 },
        priority: 'critical'
      },
      {
        name: 'Model Validation',
        description: 'Validate model performance',
        agentType: 'validator',
        dependencies: ['Model Training'],
        estimatedDuration: 45000,
        resources: { cpu: 25, memory: 30, network: 10 },
        priority: 'high'
      },
      {
        name: 'Performance Optimization',
        description: 'Optimize model performance',
        agentType: 'optimizer',
        dependencies: ['Model Validation'],
        estimatedDuration: 90000,
        resources: { cpu: 35, memory: 40, network: 15 },
        priority: 'medium'
      }
    ]
  },
  {
    id: 'analysis-workflow',
    name: 'Intelligence Analysis',
    description: 'Comprehensive data analysis workflow',
    category: 'analysis',
    complexity: 'moderate',
    estimatedDuration: 450000, // 7.5 minutes
    steps: [
      {
        name: 'Data Collection',
        description: 'Collect and aggregate data',
        agentType: 'processor',
        dependencies: [],
        estimatedDuration: 30000,
        resources: { cpu: 20, memory: 25, network: 15 },
        priority: 'high'
      },
      {
        name: 'Pattern Analysis',
        description: 'Analyze patterns and trends',
        agentType: 'analyzer',
        dependencies: ['Data Collection'],
        estimatedDuration: 120000,
        resources: { cpu: 40, memory: 50, network: 20 },
        priority: 'high'
      },
      {
        name: 'Insight Generation',
        description: 'Generate actionable insights',
        agentType: 'analyzer',
        dependencies: ['Pattern Analysis'],
        estimatedDuration: 60000,
        resources: { cpu: 30, memory: 35, network: 10 },
        priority: 'medium'
      },
      {
        name: 'Report Generation',
        description: 'Generate comprehensive report',
        agentType: 'communicator',
        dependencies: ['Insight Generation'],
        estimatedDuration: 30000,
        resources: { cpu: 15, memory: 20, network: 10 },
        priority: 'medium'
      }
    ]
  }
];

// ==================== ADVANCED AI ORCHESTRATION DASHBOARD ====================

export default function AdvancedAIOrchestrationDashboard({ className, tenantId, userId }: AdvancedAIOrchestrationDashboardProps) {
  // ==================== STATE MANAGEMENT ====================
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [workflows, setWorkflows] = useState<DynamicWorkflow[]>([]);
  const [decisions, setDecisions] = useState<OrchestrationDecision[]>([]);
  const [resourcePool, setResourcePool] = useState<Record<ResourceType, number>>({
    cpu: 0,
    memory: 0,
    gpu: 0,
    network: 0,
    storage: 0,
    api_calls: 0
  });
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DynamicWorkflow | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows' | 'decisions' | 'resources'>('agents');

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
    loadOrchestrationData();
    startDataRefresh();
  }, []);

  const loadOrchestrationData = useCallback(async () => {
    try {
      const [agentsData, workflowsData, decisionsData, resourcePoolData, statsData] = await Promise.all([
        advancedAIOrchestration.getAgents(),
        advancedAIOrchestration.getWorkflows(),
        advancedAIOrchestration.getDecisions(),
        advancedAIOrchestration.getResourcePool(),
        advancedAIOrchestration.getPerformanceStats()
      ]);

      setAgents(agentsData);
      setWorkflows(workflowsData);
      setDecisions(decisionsData);
      setResourcePool(resourcePoolData);
      setPerformanceStats(statsData);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load orchestration data');
    }
  }, []);

  const startDataRefresh = useCallback(() => {
    const interval = setInterval(() => {
      loadOrchestrationData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [loadOrchestrationData]);

  // ==================== WORKFLOW MANAGEMENT ====================

  const createWorkflowFromTemplate = useCallback(async (template: WorkflowTemplate) => {
    try {
      setIsProcessing(true);
      setError(null);

      const workflowId = await advancedAIOrchestration.createDynamicWorkflow(
        template.name,
        template.description,
        `Execute ${template.name} workflow`,
        template.steps
      );

      // Record consciousness experience
      await simulateExperience({
        type: 'workflow_created',
        complexity: template.complexity === 'moderate' ? 'medium' : template.complexity === 'complex' ? 'high' : 'simple',
        duration: template.estimatedDuration,
        outcomes: ['workflow_ready', 'agents_assigned'],
        learningObjectives: ['workflow_optimization', 'agent_coordination']
      });

      // Reload data
      await loadOrchestrationData();

      console.info('[ADVANCED_A_I_ORCHESTRATION_DASHBOARD] Workflow created from template', {
        workflowId,
        template: template.name,
        steps: template.steps.length
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create workflow');
    } finally {
      setIsProcessing(false);
    }
  }, [simulateExperience, loadOrchestrationData]);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      await advancedAIOrchestration.executeWorkflow(workflowId);

      // Record consciousness interaction
      await simulateInteraction({
        userType: 'orchestrator',
        scenario: 'workflow_execution',
        expectedOutcome: 'successful_completion',
        complexity: 8
      });

      // Reload data
      await loadOrchestrationData();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute workflow');
    } finally {
      setIsProcessing(false);
    }
  }, [simulateInteraction, loadOrchestrationData]);

  // ==================== RENDER FUNCTIONS ====================

  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-2">
        <Rocket className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Advanced AI Orchestration Dashboard
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Revolutionary autonomous AI orchestration with intelligent agent coordination
      </p>
    </div>
  );

  const renderPerformanceOverview = () => (
    <DashboardCard title="Advanced A I Orchestration Dashboard" className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>

      {performanceStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{performanceStats.totalWorkflows}</div>
            <div className="text-sm text-gray-600">Total Workflows</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{performanceStats.activeWorkflows}</div>
            <div className="text-sm text-gray-600">Active Workflows</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(performanceStats.averageEfficiency * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Efficiency</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{performanceStats.totalDecisions}</div>
            <div className="text-sm text-gray-600">Total Decisions</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{(performanceStats.agentUtilization * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Agent Utilization</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Loading performance stats...</div>
      )}
    </DashboardCard>
  );

  const renderTabNavigation = () => (
    <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {[
        { id: 'agents', name: 'AI Agents', icon: Users },
        { id: 'workflows', name: 'Workflows', icon: Workflow },
        { id: 'decisions', name: 'Decisions', icon: Brain },
        { id: 'resources', name: 'Resources', icon: Gauge }
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{tab.name}</span>
          </button>
        );
      })}
    </div>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      <DashboardCard title="Advanced A I Orchestration Dashboard">
        <h3 className="text-lg font-semibold mb-4">AI Agents ({agents.length})</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const agentType = AGENT_TYPES.find(at => at.type === agent.type);
            const Icon = agentType?.icon || Users;
            const color = agentType?.color || 'text-gray-600';

            return (
              <div key={agent.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{agentType?.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'busy' ? 'bg-blue-100 text-blue-800' :
                    agent.status === 'error' ? 'bg-red-100 text-red-800' :
                    agent.status === 'learning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Efficiency</span>
                    <span className="font-medium">{(agent.performance.efficiency * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${agent.performance.efficiency * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-medium">{(agent.performance.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${agent.performance.accuracy * 100}%` }}
                    />
                  </div>
                </div>

                {/* Learning History */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Tasks: {agent.learningHistory.tasksCompleted}</div>
                  <div>Success Rate: {(agent.learningHistory.successRate * 100).toFixed(1)}%</div>
                  <div>Avg Response: {agent.learningHistory.averageResponseTime}ms</div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );

  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      {/* Workflow Templates */}
      <DashboardCard title="Advanced A I Orchestration Dashboard">
        <h3 className="text-lg font-semibold mb-4">Workflow Templates</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {WORKFLOW_TEMPLATES.map((template) => (
            <div key={template.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                  template.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {template.complexity}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>

              <div className="text-xs text-gray-500 mb-3">
                <div>Steps: {template.steps.length}</div>
                <div>Duration: {Math.round(template.estimatedDuration / 1000)}s</div>
              </div>

              <Button
                onClick={() => createWorkflowFromTemplate(template)}
                disabled={isProcessing}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Active Workflows */}
      <DashboardCard title="Advanced A I Orchestration Dashboard">
        <h3 className="text-lg font-semibold mb-4">Active Workflows ({workflows.length})</h3>

        {workflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No workflows created yet. Use templates above to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'failed' ? 'bg-red-100 text-red-800' :
                      workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>

                    {workflow.status === 'draft' && (
                      <Button
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={isProcessing}
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Execute
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(workflow.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Performance */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-medium ml-1">{(workflow.performance.efficiency * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="font-medium ml-1">{(workflow.performance.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium ml-1">${workflow.performance.cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );

  const renderDecisionsTab = () => (
    <DashboardCard title="Advanced A I Orchestration Dashboard">
      <h3 className="text-lg font-semibold mb-4">Orchestration Decisions ({decisions.length})</h3>

      {decisions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No decisions recorded yet. Execute workflows to see orchestration decisions.
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.slice(0, 10).map((decision) => (
            <div key={decision.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium capitalize">{decision.decisionType.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {decision.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{decision.reasoning}</p>

              <div className="text-xs text-gray-500 mb-2">
                <div>Action: {decision.action}</div>
                <div>Confidence: {(decision.confidence * 100).toFixed(1)}%</div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium ml-1">{(decision.impact.efficiency * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-medium ml-1">${decision.impact.cost.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium ml-1">{decision.impact.time}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium ml-1">{(decision.impact.quality * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderResourcesTab = () => (
    <DashboardCard title="Advanced A I Orchestration Dashboard">
      <h3 className="text-lg font-semibold mb-4">Resource Pool</h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(resourcePool).map(([resource, available]) => {
          const total = 100; // Assuming 100% as total
          const percentage = (available / total) * 100;

          return (
            <div key={resource} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{resource.replace('_', ' ')}</span>
                <span className="text-sm text-gray-600">{available}/{total}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage > 70 ? 'bg-green-600' :
                    percentage > 30 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="text-xs text-gray-500">
                {percentage.toFixed(1)}% available
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {renderHeader()}

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

        {/* Performance Overview */}
        {renderPerformanceOverview()}

        {/* Tab Navigation */}
        {renderTabNavigation()}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'agents' && renderAgentsTab()}
            {activeTab === 'workflows' && renderWorkflowsTab()}
            {activeTab === 'decisions' && renderDecisionsTab()}
            {activeTab === 'resources' && renderResourcesTab()}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {agents.length === 0 && workflows.length === 0 && (
          <EmptyState
            icon={Rocket}
            title="Ready for Advanced AI Orchestration"
            description="Start your revolutionary AI orchestration journey by creating workflows and monitoring autonomous AI decision making."
            action={{
              label: "Create First Workflow",
              onClick: () => setActiveTab('workflows'),
              variant: 'primary'
            }}
          />
        )}
      </div>
    </div>
  );
}
