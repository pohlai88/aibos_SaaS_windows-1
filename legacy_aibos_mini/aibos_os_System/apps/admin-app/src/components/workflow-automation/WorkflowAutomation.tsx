'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  WorkflowAutomationService,
  WorkflowDefinition,
  WorkflowExecutionDetail,
  WorkflowTemplate,
  WorkflowMetrics,
  WorkflowTriggerType,
  WorkflowStepType,
  WorkflowStatus,
  ExecutionStatus
} from '@aibos/ledger-sdk';

interface WorkflowAutomationProps {
  organizationId: string;
}

export default function WorkflowAutomation({ organizationId }: WorkflowAutomationProps) {
  const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'templates' | 'metrics'>('workflows');
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecutionDetail[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);

  // Modal states
  const [createWorkflowModalOpen, setCreateWorkflowModalOpen] = useState(false);
  const [workflowDetailsModalOpen, setWorkflowDetailsModalOpen] = useState(false);
  const [executionHistoryModalOpen, setExecutionHistoryModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Form states
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    triggerType: 'invoice_created' as WorkflowTriggerType,
    triggerConfig: {
      conditions: [],
      schedule: {},
      thresholds: {}
    },
    steps: [] as any[],
    isActive: true
  });

  const [currentStep, setCurrentStep] = useState({
    name: '',
    type: 'approval' as WorkflowStepType,
    order: 1,
    config: {}
  });

  const workflowService = new WorkflowAutomationService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'workflows') {
        const { workflows } = await workflowService.getWorkflows(organizationId);
        setWorkflows(workflows);
      } else if (activeTab === 'executions') {
        const { executions } = await workflowService.getExecutionHistory(organizationId);
        setExecutions(executions);
      } else if (activeTab === 'templates') {
        const { templates } = await workflowService.getWorkflowTemplates();
        setTemplates(templates);
      } else if (activeTab === 'metrics') {
        const { metrics } = await workflowService.getWorkflowMetrics(organizationId);
        setMetrics(metrics);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    setLoading(true);
    try {
      const { workflow, error } = await workflowService.createWorkflow(
        organizationId,
        'current-user-id', // Would come from auth context
        workflowForm
      );
      if (error) throw error;

      setCreateWorkflowModalOpen(false);
      resetWorkflowForm();
      loadData();
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowStatus = async (workflowId: string, status: WorkflowStatus) => {
    setLoading(true);
    try {
      const { success, error } = await workflowService.updateWorkflowStatus(
        organizationId,
        workflowId,
        status
      );
      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error updating workflow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      const { execution, error } = await workflowService.triggerWorkflow(
        organizationId,
        workflowId,
        {
          triggerType: 'manual',
          entityId: 'test-entity',
          entityType: 'test',
          context: { test: true }
        }
      );
      if (error) throw error;

      console.log('Workflow triggered:', execution);
      loadData();
    } catch (error) {
      console.error('Error triggering workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStepToWorkflow = () => {
    if (!currentStep.name) return;

    const newStep = {
      id: `step-${Date.now()}`,
      ...currentStep
    };

    setWorkflowForm(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setCurrentStep({
      name: '',
      type: 'approval',
      order: prev.steps.length + 1,
      config: {}
    });
  };

  const removeStepFromWorkflow = (stepId: string) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const resetWorkflowForm = () => {
    setWorkflowForm({
      name: '',
      description: '',
      triggerType: 'invoice_created',
      triggerConfig: {
        conditions: [],
        schedule: {},
        thresholds: {}
      },
      steps: [],
      isActive: true
    });
  };

  const getStatusBadgeVariant = (status: WorkflowStatus | ExecutionStatus) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'draft':
      case 'pending':
        return 'warning';
      case 'paused':
      case 'running':
        return 'info';
      case 'archived':
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTriggerTypeLabel = (type: WorkflowTriggerType) => {
    const labels: Record<WorkflowTriggerType, string> = {
      invoice_created: 'Invoice Created',
      invoice_updated: 'Invoice Updated',
      bill_created: 'Bill Created',
      bill_updated: 'Bill Updated',
      journal_entry_created: 'Journal Entry Created',
      journal_entry_updated: 'Journal Entry Updated',
      payment_created: 'Payment Created',
      payment_updated: 'Payment Updated',
      customer_created: 'Customer Created',
      vendor_created: 'Vendor Created',
      account_balance_threshold: 'Account Balance Threshold',
      scheduled: 'Scheduled',
      manual: 'Manual'
    };
    return labels[type];
  };

  const getStepTypeLabel = (type: WorkflowStepType) => {
    const labels: Record<WorkflowStepType, string> = {
      approval: 'Approval',
      notification: 'Notification',
      validation: 'Validation',
      calculation: 'Calculation',
      data_update: 'Data Update',
      condition: 'Condition',
      delay: 'Delay',
      webhook: 'Webhook'
    };
    return labels[type];
  };

  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflows</h2>
        <Button onClick={() => setCreateWorkflowModalOpen(true)}>
          Create Workflow
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-4">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{workflow.name}</h3>
                      <Badge variant={getStatusBadgeVariant(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      {workflow.isActive && (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Trigger: {getTriggerTypeLabel(workflow.trigger.type)}</span>
                      <span>Steps: {workflow.steps.length}</span>
                      <span>Version: {workflow.version}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setWorkflowDetailsModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerWorkflow(workflow.id)}
                    >
                      Trigger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWorkflowStatus(
                        workflow.id,
                        workflow.status === 'active' ? 'paused' : 'active'
                      )}
                    >
                      {workflow.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderExecutionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Execution History</h2>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Status</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {executions.map(execution => (
              <tr key={execution.id}>
                <td>{execution.workflow.name}</td>
                <td>
                  <Badge variant={getStatusBadgeVariant(execution.status)}>
                    {execution.status}
                  </Badge>
                </td>
                <td>{new Date(execution.started_at).toLocaleString()}</td>
                <td>
                  {execution.completed_at 
                    ? new Date(execution.completed_at).toLocaleString()
                    : '-'
                  }
                </td>
                <td>
                  {execution.completed_at 
                    ? `${Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s`
                    : '-'
                  }
                </td>
                <td>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWorkflow(execution.workflow);
                      setExecutionHistoryModalOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Templates</h2>
        <Button onClick={() => setTemplateModalOpen(true)}>
          Create Template
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  {template.isPublic && (
                    <Badge variant="info">Public</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>Category: {template.category}</span>
                  <span>Steps: {template.steps.length}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Metrics</h2>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : metrics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{metrics.totalExecutions}</div>
              <div className="text-gray-600">Total Executions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{metrics.successfulExecutions}</div>
              <div className="text-gray-600">Successful</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{metrics.failedExecutions}</div>
              <div className="text-gray-600">Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{metrics.activeWorkflows}</div>
              <div className="text-gray-600">Active Workflows</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-500">No metrics available</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflow Automation</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'workflows', label: 'Workflows' },
            { id: 'executions', label: 'Execution History' },
            { id: 'templates', label: 'Templates' },
            { id: 'metrics', label: 'Metrics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'workflows' && renderWorkflowsTab()}
      {activeTab === 'executions' && renderExecutionsTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'metrics' && renderMetricsTab()}

      {/* Create Workflow Modal */}
      <Modal
        isOpen={createWorkflowModalOpen}
        onClose={() => setCreateWorkflowModalOpen(false)}
        title="Create Workflow"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Name
            </label>
            <Input
              value={workflowForm.name}
              onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter workflow name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Input
              value={workflowForm.description}
              onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter workflow description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type
            </label>
            <select
              value={workflowForm.triggerType}
              onChange={(e) => setWorkflowForm(prev => ({ 
                ...prev, 
                triggerType: e.target.value as WorkflowTriggerType 
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="invoice_created">Invoice Created</option>
              <option value="invoice_updated">Invoice Updated</option>
              <option value="bill_created">Bill Created</option>
              <option value="bill_updated">Bill Updated</option>
              <option value="journal_entry_created">Journal Entry Created</option>
              <option value="journal_entry_updated">Journal Entry Updated</option>
              <option value="payment_created">Payment Created</option>
              <option value="payment_updated">Payment Updated</option>
              <option value="customer_created">Customer Created</option>
              <option value="vendor_created">Vendor Created</option>
              <option value="account_balance_threshold">Account Balance Threshold</option>
              <option value="scheduled">Scheduled</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Steps
            </label>
            <div className="space-y-4">
              {workflowForm.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2 p-3 border rounded-md">
                  <span className="text-sm font-medium">{index + 1}.</span>
                  <span className="flex-1">{step.name}</span>
                  <Badge variant="info">{getStepTypeLabel(step.type)}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeStepFromWorkflow(step.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Name
                  </label>
                  <Input
                    value={currentStep.name}
                    onChange={(e) => setCurrentStep(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter step name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Type
                  </label>
                  <select
                    value={currentStep.type}
                    onChange={(e) => setCurrentStep(prev => ({ 
                      ...prev, 
                      type: e.target.value as WorkflowStepType 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="approval">Approval</option>
                    <option value="notification">Notification</option>
                    <option value="validation">Validation</option>
                    <option value="calculation">Calculation</option>
                    <option value="data_update">Data Update</option>
                    <option value="condition">Condition</option>
                    <option value="delay">Delay</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={addStepToWorkflow}
                className="mt-4"
                disabled={!currentStep.name}
              >
                Add Step
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateWorkflowModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createWorkflow}
              disabled={!workflowForm.name || workflowForm.steps.length === 0}
            >
              Create Workflow
            </Button>
          </div>
        </div>
      </Modal>

      {/* Workflow Details Modal */}
      <Modal
        isOpen={workflowDetailsModalOpen}
        onClose={() => setWorkflowDetailsModalOpen(false)}
        title={selectedWorkflow?.name || 'Workflow Details'}
        size="lg"
      >
        {selectedWorkflow && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Workflow Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusBadgeVariant(selectedWorkflow.status)}>
                    {selectedWorkflow.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Trigger:</span>
                  <span>{getTriggerTypeLabel(selectedWorkflow.trigger.type)}</span>
                </div>
                <div>
                  <span className="font-medium">Steps:</span>
                  <span>{selectedWorkflow.steps.length}</span>
                </div>
                <div>
                  <span className="font-medium">Version:</span>
                  <span>{selectedWorkflow.version}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Workflow Steps</h3>
              <div className="space-y-2">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 border rounded-md">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <span className="flex-1">{step.name}</span>
                    <Badge variant="info">{getStepTypeLabel(step.type)}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setWorkflowDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Execution History Modal */}
      <Modal
        isOpen={executionHistoryModalOpen}
        onClose={() => setExecutionHistoryModalOpen(false)}
        title="Execution History"
        size="lg"
      >
        <div className="space-y-4">
          {executions
            .filter(execution => execution.workflow.id === selectedWorkflow?.id)
            .map(execution => (
              <div key={execution.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {new Date(execution.started_at).toLocaleString()}
                  </span>
                  <Badge variant={getStatusBadgeVariant(execution.status)}>
                    {execution.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Duration: {execution.completed_at 
                    ? `${Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s`
                    : 'Running...'
                  }</div>
                  {execution.error_message && (
                    <div className="text-red-600 mt-1">
                      Error: {execution.error_message}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Create Template"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <Input placeholder="Enter template name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Input placeholder="Enter template description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option value="invoice">Invoice</option>
              <option value="bill">Bill</option>
              <option value="payment">Payment</option>
              <option value="approval">Approval</option>
              <option value="notification">Notification</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button>Create Template</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 