'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow, Play, Pause, RotateCcw, Plus, Trash2, CheckCircle, AlertTriangle,
  Settings, Activity, BarChart3, Clock, Zap, Brain, Target, Layers
} from 'lucide-react';

import {
  aiWorkflowAutomation,
  WorkflowStatus,
  TaskStatus,
  TriggerType,
  TaskType,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowMetrics
} from '@/lib/ai-workflow-automation';

interface AIWorkflowAutomationDashboardProps {
  className?: string;
}

export default function AIWorkflowAutomationDashboard({ className = '' }: AIWorkflowAutomationDashboardProps) {
  const [workflowMetrics, setWorkflowMetrics] = useState<WorkflowMetrics | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'workflows' | 'executions' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    aiEnhanced: true,
    quantumEnhanced: false
  });

  useEffect(() => {
    initializeWorkflowData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshWorkflowData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeWorkflowData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshWorkflowData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshWorkflowData = useCallback(async () => {
    try {
      // Real API call to backend workflow endpoint
      const response = await fetch('/api/workflow-automation/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Workflow API error: ${response.status}`);
      }

      const data = await response.json();
      setWorkflowMetrics(data.metrics);
      setWorkflows(data.workflows || []);
      setExecutions(data.executions || []);
    } catch (err) {
      console.error('Workflow API error:', err);
      // Set empty state on error
      setWorkflowMetrics(null);
      setWorkflows([]);
      setExecutions([]);
    }
  }, []);

  const createWorkflow = useCallback(async () => {
    if (!workflowForm.name || !workflowForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to create workflow
      const response = await fetch('/api/workflow-automation/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowForm),
      });

      if (!response.ok) {
        throw new Error(`Create workflow API error: ${response.status}`);
      }

      const workflow = await response.json();
      setWorkflows(prev => [...prev, workflow]);
      setWorkflowForm({ name: '', description: '', aiEnhanced: true, quantumEnhanced: false });
      await refreshWorkflowData();
    } catch (err) {
      console.error('Create workflow API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workflowForm, refreshWorkflowData]);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    setIsLoading(true);
    try {
      // Real API call to execute workflow
      const response = await fetch(`/api/workflow-automation/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables: {} }),
      });

      if (!response.ok) {
        throw new Error(`Execute workflow API error: ${response.status}`);
      }

      const execution = await response.json();
      setExecutions(prev => [...prev, execution]);
      await refreshWorkflowData();
    } catch (err) {
      console.error('Execute workflow API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshWorkflowData]);

  const renderOverview = () => {
    if (!workflowMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Workflow Automation Data Available</h3>
            <p className="text-gray-400 mb-6">Start by creating your first AI-powered workflow to automate processes.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Create Workflow
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Workflows" value={workflowMetrics.totalWorkflows} icon={Workflow} color="blue" />
          <MetricCard title="Success Rate" value={`${(workflowMetrics.successRate * 100).toFixed(1)}%`} icon={CheckCircle} color="green" />
          <MetricCard title="AI Enhancement" value={`${(workflowMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Brain} color="purple" />
          <MetricCard title="Avg Execution Time" value={`${(workflowMetrics.averageExecutionTime / 1000).toFixed(1)}s`} icon={Clock} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Execution Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Completed</span>
                <span className="text-green-400 font-semibold">{workflowMetrics.completedExecutions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Failed</span>
                <span className="text-red-400 font-semibold">{workflowMetrics.failedExecutions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Workflows</span>
                <span className="text-blue-400 font-semibold">{workflowMetrics.activeWorkflows}</span>
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
                Create New Workflow
              </button>
              <button
                onClick={() => setSelectedTab('workflows')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                View All Workflows
              </button>
              <button
                onClick={() => setSelectedTab('executions')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Monitor Executions
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderWorkflows = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">AI-Powered Workflows</h3>
        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <Workflow className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 mb-4">No workflows created yet</p>
            <p className="text-sm text-gray-500">Create your first workflow to start automating processes with AI.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map(workflow => (
              <div key={workflow.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{workflow.name}</h4>
                    <p className="text-gray-400 text-sm">{workflow.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {workflow.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                    {workflow.quantumEnhanced && <span className="text-purple-400 text-xs">Quantum</span>}
                    <span className={`px-2 py-1 rounded text-xs ${
                      workflow.status === 'active' ? 'bg-green-600 text-white' :
                      workflow.status === 'draft' ? 'bg-yellow-600 text-black' :
                      workflow.status === 'paused' ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-3 space-x-2">
                  <span className="text-sm text-gray-500">Tasks: {workflow.tasks.length}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Version: {workflow.version}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{workflow.updatedAt.toLocaleDateString()}</span>
                  {workflow.status === 'active' && (
                    <>
                      <span className="text-sm text-gray-500">•</span>
                      <button
                        onClick={() => executeWorkflow(workflow.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Executing...' : 'Execute'}
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

  const renderExecutions = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Workflow Executions</h3>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 mb-4">No executions yet</p>
            <p className="text-sm text-gray-500">Execute a workflow to see execution history and monitoring.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {executions.slice(0, 10).map(execution => (
              <div key={execution.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">Execution {execution.id.slice(0, 8)}</h4>
                    <p className="text-gray-400 text-sm">
                      Workflow: {workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    execution.status === 'completed' ? 'bg-green-600 text-white' :
                    execution.status === 'failed' ? 'bg-red-600 text-white' :
                    execution.status === 'active' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {execution.status}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>Tasks: {execution.taskExecutions.length}</span>
                  <span className="mx-2">•</span>
                  <span>Duration: {execution.duration ? `${(execution.duration / 1000).toFixed(1)}s` : 'Running'}</span>
                  <span className="mx-2">•</span>
                  <span>{execution.startTime.toLocaleDateString()}</span>
                  {execution.aiInsights.length > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-blue-400">AI Insights: {execution.aiInsights.length}</span>
                    </>
                  )}
                </div>
                {execution.error && (
                  <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                    <p className="text-red-400 text-sm">{execution.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderCreate = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Create AI-Powered Workflow</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Workflow Name</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter workflow name"
              value={workflowForm.name}
              onChange={e => setWorkflowForm({ ...workflowForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Describe what this workflow does"
              rows={3}
              value={workflowForm.description}
              onChange={e => setWorkflowForm({ ...workflowForm, description: e.target.value })}
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={workflowForm.aiEnhanced}
                onChange={e => setWorkflowForm({ ...workflowForm, aiEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">AI Enhanced</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={workflowForm.quantumEnhanced}
                onChange={e => setWorkflowForm({ ...workflowForm, quantumEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Quantum Enhanced</span>
            </label>
          </div>
          <button
            onClick={createWorkflow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            disabled={isLoading || !workflowForm.name || !workflowForm.description}
          >
            {isLoading ? 'Creating...' : 'Create Workflow'}
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
              <Workflow className="w-8 h-8 mr-3 text-blue-400" />
              AI Workflow Automation
            </h1>
            <button onClick={refreshWorkflowData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <RotateCcw className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'workflows', 'executions', 'create'].map(tab => (
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
          {selectedTab === 'workflows' && renderWorkflows()}
          {selectedTab === 'executions' && renderExecutions()}
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
