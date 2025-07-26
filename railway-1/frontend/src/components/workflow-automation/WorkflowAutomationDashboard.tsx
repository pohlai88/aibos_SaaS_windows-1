import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow, Zap, Settings, Play, Pause, Clock, CheckCircle, AlertCircle,
  Loader2, Plus, Edit, Trash, Eye, Copy, RefreshCw, BarChart3,
  Users, Mail, Bell, Database, Globe, Shield, Activity, ChevronRight
} from 'lucide-react';
import { useAIBOSStore } from '../../lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: 'manual' | 'scheduled' | 'event' | 'webhook';
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
}

interface WorkflowCondition {
  id: string;
  type: 'if' | 'and' | 'or' | 'not';
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'create_task' | 'update_record' | 'send_notification' | 'api_call' | 'wait';
  name: string;
  parameters: Record<string, any>;
  order: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  result: any;
  error?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'notification' | 'approval' | 'integration' | 'maintenance';
  template: WorkflowDefinition;
}

export const WorkflowAutomationDashboard: React.FC = () => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('workflow-automation');
  const isModuleEnabled = useModuleEnabled('workflow-automation');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('workflow-automation', 'view', currentUser);
  const canCreate = usePermission('workflow-automation', 'create', currentUser);
  const canEdit = usePermission('workflow-automation', 'edit', currentUser);
  const canExecute = usePermission('workflow-automation', 'execute', currentUser);
  const canSchedule = usePermission('workflow-automation', 'schedule', currentUser);
  const canMonitor = usePermission('workflow-automation', 'monitor', currentUser);

  // Get configuration from manifest
  const workflowConfig = moduleConfig.components?.WorkflowAutomationDashboard;
  const features = moduleConfig.features;
  const security = moduleConfig.security;
  const performance = moduleConfig.performance;

  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'executions' | 'templates' | 'integrations'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAIBOSStore();

  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-4">Workflow Automation Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-4">Workflow Automation Disabled</div>;
  }

  if (!canView) {
    return <div className="text-gray-600 p-4">Access Denied</div>;
  }

  // Check if workflow automation features are enabled
  const workflowEditorEnabled = workflowConfig?.features?.workflow_editor;
  const executionMonitorEnabled = workflowConfig?.features?.execution_monitor;
  const schedulerEnabled = workflowConfig?.features?.scheduler;
  const templatesEnabled = workflowConfig?.features?.templates;
  const analyticsEnabled = workflowConfig?.features?.analytics;
  const integrationManagerEnabled = workflowConfig?.features?.integration_manager;

  const fetchWorkflowData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [workflowsResponse, executionsResponse, templatesResponse] = await Promise.all([
        fetch('/api/workflow-automation/workflows'),
        fetch('/api/workflow-automation/executions'),
        fetch('/api/workflow-automation/templates')
      ]);

      if (workflowsResponse.ok) {
        const workflowsData = await workflowsResponse.json();
        setWorkflows(workflowsData.data || []);
      }

      if (executionsResponse.ok) {
        const executionsData = await executionsResponse.json();
        setExecutions(executionsData.data || []);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.data || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow data');
      addNotification({
        type: 'error',
        title: 'Workflow Error',
        message: 'Unable to load workflow data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleCreateWorkflow = useCallback(async (workflowData: Partial<WorkflowDefinition>) => {
    try {
      const response = await fetch('/api/workflow-automation/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Workflow Created',
          message: 'Workflow has been created successfully.',
          isRead: false
        });
        setShowCreateModal(false);
        fetchWorkflowData();
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Creation Error',
        message: 'Failed to create workflow.',
        isRead: false
      });
    }
  }, [addNotification, fetchWorkflowData]);

  const handleExecuteWorkflow = useCallback(async (workflowId: string) => {
    try {
      setExecutingWorkflow(workflowId);
      const response = await fetch(`/api/workflow-automation/workflows/${workflowId}/execute`, {
        method: 'POST'
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Workflow Executed',
          message: 'Workflow execution started successfully.',
          isRead: false
        });
        fetchWorkflowData();
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Execution Error',
        message: 'Failed to execute workflow.',
        isRead: false
      });
    } finally {
      setExecutingWorkflow(null);
    }
  }, [addNotification, fetchWorkflowData]);

  const handleToggleWorkflow = useCallback(async (workflowId: string, status: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/workflow-automation/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Workflow Updated',
          message: `Workflow ${status === 'active' ? 'activated' : 'deactivated'} successfully.`,
          isRead: false
        });
        fetchWorkflowData();
      } else {
        throw new Error('Failed to update workflow');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update workflow status.',
        isRead: false
      });
    }
  }, [addNotification, fetchWorkflowData]);

  useEffect(() => {
    fetchWorkflowData();
  }, [fetchWorkflowData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'manual': return <Play className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'event': return <Bell className="w-4 h-4" />;
      case 'webhook': return <Globe className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const EmptyState: React.FC<{ icon: React.ComponentType<any>; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading workflow data...</p>
    </div>
  );

  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Workflow className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Workflow Automation</h1>
              <p className="text-purple-100 text-sm">Process automation & conditional workflows</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </button>
            <button
              onClick={fetchWorkflowData}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'workflows', label: 'Workflows', icon: Workflow },
            { id: 'executions', label: 'Executions', icon: Play },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'integrations', label: 'Integrations', icon: Globe }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchWorkflowData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                {/* Workflow Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workflows</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {workflows.length}
                        </p>
                      </div>
                      <Workflow className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Workflows</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {workflows.filter(w => w.status === 'active').length}
                        </p>
                      </div>
                      <Play className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Executions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {executions.length}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {workflows.length > 0
                            ? Math.round(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length)
                            : 0}%
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Workflows */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Workflows</h3>
                  </div>
                  <div className="p-6">
                    {workflows.length > 0 ? (
                      <div className="space-y-4">
                        {workflows.slice(0, 5).map((workflow) => (
                          <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(workflow.status)}`}>
                                {getTriggerIcon(workflow.trigger)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{workflow.description}</p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                                  <span>Executions: {workflow.executionCount}</span>
                                  <span>Success: {workflow.successRate}%</span>
                                  <span>{formatDate(workflow.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                                {workflow.status}
                              </span>
                              <button
                                onClick={() => handleExecuteWorkflow(workflow.id)}
                                disabled={executingWorkflow === workflow.id}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                              >
                                {executingWorkflow === workflow.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Execute'
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Workflow}
                        title="No Workflows Created"
                        description="Create your first workflow to get started with automation."
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'workflows' && (
              <motion.div
                key="workflows"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Definitions</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {workflows.length} workflows
                    </span>
                  </div>
                </div>

                {workflows.length > 0 ? (
                  <div className="space-y-4">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${getStatusColor(workflow.status)}`}>
                              {getTriggerIcon(workflow.trigger)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                                  {workflow.status}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  {workflow.trigger}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">{workflow.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Conditions:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{workflow.conditions.length}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Actions:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{workflow.actions.length}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Executions:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{workflow.executionCount}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{workflow.successRate}%</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleExecuteWorkflow(workflow.id)}
                              disabled={executingWorkflow === workflow.id}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                              {executingWorkflow === workflow.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Execute'
                              )}
                            </button>
                            <button
                              onClick={() => handleToggleWorkflow(workflow.id, workflow.status === 'active' ? 'inactive' : 'active')}
                              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                                workflow.status === 'active'
                                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setSelectedWorkflow(workflow)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Workflow}
                    title="No Workflows Found"
                    description="Create your first workflow to start automating processes."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'executions' && (
              <motion.div
                key="executions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Executions</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {executions.length} executions
                    </span>
                  </div>
                </div>

                {executions.length > 0 ? (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <div key={execution.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Execution {execution.id.slice(0, 8)}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getExecutionStatusColor(execution.status)}`}>
                                {execution.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Workflow:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{execution.workflowId}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Started:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(execution.startedAt)}</p>
                              </div>
                              {execution.completedAt && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(execution.completedAt)}</p>
                                </div>
                              )}
                              {execution.duration && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatDuration(execution.duration)}</p>
                                </div>
                              )}
                            </div>
                            {execution.error && (
                              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{execution.error}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Play}
                    title="No Executions"
                    description="No workflow executions have been recorded yet."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Templates</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {templates.length} templates
                    </span>
                  </div>
                </div>

                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.category === 'onboarding' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            template.category === 'notification' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            template.category === 'approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            template.category === 'integration' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {template.category}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {template.template.conditions.length} conditions, {template.template.actions.length} actions
                          </div>
                          <button
                            onClick={() => handleCreateWorkflow(template.template)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Copy}
                    title="No Templates"
                    description="No workflow templates are currently available."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integration Hub</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      External system integrations
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Integrations</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Email Service</span>
                        </div>
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Database className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Database</span>
                        </div>
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-purple-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Webhook</span>
                        </div>
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integration Analytics</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Integrations:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Active Connections:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">API Calls Today:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">1,247</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Success Rate:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">99.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
