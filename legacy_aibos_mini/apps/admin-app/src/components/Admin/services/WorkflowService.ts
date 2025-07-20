// WorkflowService
// Handles automated workflows, approvals, and business process automation

import { adminSDK } from '../admin-sdk';
import type { WorkflowDefinition, AdminAction, WorkflowStep } from '../types';

interface WorkflowInstance {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  created_by: string;
  participants: WorkflowParticipant[];
  history: WorkflowHistoryItem[];
}

interface WorkflowParticipant {
  user_id: string;
  role: 'initiator' | 'approver' | 'reviewer' | 'notified';
  status: 'pending' | 'approved' | 'rejected' | 'notified';
  action_taken_at?: string;
  comments?: string;
}

interface WorkflowHistoryItem {
  step_id: string;
  step_name: string;
  action: string;
  user_id: string;
  timestamp: string;
  details: Record<string, any>;
  status: 'success' | 'failure' | 'pending';
}

interface WorkflowTrigger {
  type: 'manual' | 'automatic' | 'scheduled';
  event?: string;
  conditions?: Record<string, any>;
  schedule?: string;
}

class WorkflowService {
  private static instance: WorkflowService;
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private triggers: Map<string, WorkflowTrigger[]> = new Map();

  private constructor() {
    this.initializeWorkflows();
  }

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  private async initializeWorkflows(): Promise<void> {
    try {
      const workflows = await adminSDK.getWorkflows();
      workflows.forEach(workflow => {
        this.workflows.set(workflow.id, workflow);
      });
    } catch (error) {
      console.error('Error initializing workflows:', error);
    }
  }

  // Workflow Definition Management
  async createWorkflow(definition: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowDefinition> {
    try {
      const workflow: WorkflowDefinition = {
        id: crypto.randomUUID(),
        ...definition,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.workflows.set(workflow.id, workflow);
      
      // Log admin action
      await adminSDK.logAdminAction({
        type: 'workflow_creation',
        user_id: 'current-user-id', // TODO: Get from auth context
        target_type: 'workflow',
        target_id: workflow.id,
        details: { workflow: definition },
        status: 'completed',
      });

      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const updatedWorkflow: WorkflowDefinition = {
        ...workflow,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      this.workflows.set(workflowId, updatedWorkflow);

      await adminSDK.logAdminAction({
        type: 'workflow_update',
        user_id: 'current-user-id',
        target_type: 'workflow',
        target_id: workflowId,
        details: { updates },
        status: 'completed',
      });

      return updatedWorkflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      this.workflows.delete(workflowId);

      await adminSDK.logAdminAction({
        type: 'workflow_deletion',
        user_id: 'current-user-id',
        target_type: 'workflow',
        target_id: workflowId,
        details: { deleted_workflow: workflow },
        status: 'completed',
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  // Workflow Instance Management
  async startWorkflow(workflowId: string, data: Record<string, any>, createdBy: string): Promise<WorkflowInstance> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      if (workflow.status !== 'active') {
        throw new Error(`Workflow ${workflowId} is not active`);
      }

      const instance: WorkflowInstance = {
        id: crypto.randomUUID(),
        workflow_id: workflowId,
        status: 'running',
        current_step: 0,
        data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: createdBy,
        participants: [
          {
            user_id: createdBy,
            role: 'initiator',
            status: 'approved',
            action_taken_at: new Date().toISOString(),
          },
        ],
        history: [],
      };

      this.instances.set(instance.id, instance);

      // Execute first step
      await this.executeStep(instance.id, 0);

      await adminSDK.logAdminAction({
        type: 'workflow_started',
        user_id: createdBy,
        target_type: 'workflow_instance',
        target_id: instance.id,
        details: { workflow_id: workflowId, data },
        status: 'completed',
      });

      return instance;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }

  async executeStep(instanceId: string, stepIndex: number): Promise<void> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Workflow instance ${instanceId} not found`);
      }

      const workflow = this.workflows.get(instance.workflow_id);
      if (!workflow) {
        throw new Error(`Workflow ${instance.workflow_id} not found`);
      }

      const step = workflow.steps[stepIndex];
      if (!step) {
        throw new Error(`Step ${stepIndex} not found in workflow ${instance.workflow_id}`);
      }

      // Execute step based on type
      let stepResult: any;
      switch (step.type) {
        case 'action':
          stepResult = await this.executeActionStep(step, instance);
          break;
        case 'approval':
          stepResult = await this.executeApprovalStep(step, instance);
          break;
        case 'notification':
          stepResult = await this.executeNotificationStep(step, instance);
          break;
        case 'condition':
          stepResult = await this.executeConditionStep(step, instance);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Update instance
      instance.current_step = stepIndex + 1;
      instance.updated_at = new Date().toISOString();
      instance.history.push({
        step_id: step.id,
        step_name: step.name,
        action: step.type,
        user_id: 'system',
        timestamp: new Date().toISOString(),
        details: stepResult,
        status: 'success',
      });

      // Check if workflow is complete
      if (instance.current_step >= workflow.steps.length) {
        instance.status = 'completed';
        instance.completed_at = new Date().toISOString();
      }

      this.instances.set(instanceId, instance);
    } catch (error) {
      console.error('Error executing workflow step:', error);
      
      // Update instance with error
      const instance = this.instances.get(instanceId);
      if (instance) {
        instance.status = 'failed';
        instance.updated_at = new Date().toISOString();
        instance.history.push({
          step_id: workflow?.steps[stepIndex]?.id || '',
          step_name: workflow?.steps[stepIndex]?.name || '',
          action: 'error',
          user_id: 'system',
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          status: 'failure',
        });
        this.instances.set(instanceId, instance);
      }
      
      throw error;
    }
  }

  private async executeActionStep(step: WorkflowStep, instance: WorkflowInstance): Promise<any> {
    try {
      const { action, parameters } = step.config;
      
      switch (action) {
        case 'create_user':
          return await adminSDK.createUser(parameters);
        case 'update_user':
          return await adminSDK.updateUser(parameters.user_id, parameters.updates);
        case 'send_notification':
          return await adminSDK.sendNotification(parameters);
        case 'update_system_setting':
          // TODO: Implement system setting update
          return { success: true };
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('Error executing action step:', error);
      throw error;
    }
  }

  private async executeApprovalStep(step: WorkflowStep, instance: WorkflowInstance): Promise<any> {
    try {
      const { approvers, timeout } = step.config;
      
      // Add approvers to participants
      approvers.forEach((approver: string) => {
        const existingParticipant = instance.participants.find(p => p.user_id === approver);
        if (!existingParticipant) {
          instance.participants.push({
            user_id: approver,
            role: 'approver',
            status: 'pending',
          });
        }
      });

      // Send notification to approvers
      await adminSDK.sendNotification({
        title: 'Approval Required',
        message: `Workflow ${instance.workflow_id} requires your approval`,
        type: 'info',
        priority: 'high',
        target_type: 'user',
        target_ids: approvers,
      });

      // Set timeout if specified
      if (timeout) {
        setTimeout(async () => {
          await this.handleApprovalTimeout(instance.id, step.id);
        }, timeout * 1000);
      }

      return { status: 'pending_approval', approvers };
    } catch (error) {
      console.error('Error executing approval step:', error);
      throw error;
    }
  }

  private async executeNotificationStep(step: WorkflowStep, instance: WorkflowInstance): Promise<any> {
    try {
      const { template, recipients } = step.config;
      
      // TODO: Get notification template
      const notification = {
        title: 'Workflow Notification',
        message: `Workflow ${instance.workflow_id} has been updated`,
        type: 'info',
        priority: 'medium',
        target_type: 'user',
        target_ids: recipients,
      };

      return await adminSDK.sendNotification(notification);
    } catch (error) {
      console.error('Error executing notification step:', error);
      throw error;
    }
  }

  private async executeConditionStep(step: WorkflowStep, instance: WorkflowInstance): Promise<any> {
    try {
      const { condition, true_step, false_step } = step.config;
      
      // Evaluate condition
      const result = this.evaluateCondition(condition, instance.data);
      
      // Update workflow flow based on condition
      if (result && true_step) {
        // Jump to true_step
        const trueStepIndex = this.findStepIndex(instance.workflow_id, true_step);
        if (trueStepIndex !== -1) {
          instance.current_step = trueStepIndex;
        }
      } else if (!result && false_step) {
        // Jump to false_step
        const falseStepIndex = this.findStepIndex(instance.workflow_id, false_step);
        if (falseStepIndex !== -1) {
          instance.current_step = falseStepIndex;
        }
      }

      return { condition_result: result };
    } catch (error) {
      console.error('Error executing condition step:', error);
      throw error;
    }
  }

  private evaluateCondition(condition: string, data: Record<string, any>): boolean {
    try {
      // Simple condition evaluation - can be enhanced with a proper expression parser
      const conditions: Record<string, (value: any, expected: any) => boolean> = {
        equals: (value, expected) => value === expected,
        not_equals: (value, expected) => value !== expected,
        greater_than: (value, expected) => value > expected,
        less_than: (value, expected) => value < expected,
        contains: (value, expected) => String(value).includes(String(expected)),
        exists: (value) => value !== undefined && value !== null,
      };

      // Parse condition: "field operator value"
      const [field, operator, expectedValue] = condition.split(' ');
      const actualValue = this.getNestedValue(data, field);
      
      const conditionFn = conditions[operator];
      if (!conditionFn) {
        throw new Error(`Unknown operator: ${operator}`);
      }

      return conditionFn(actualValue, expectedValue);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private findStepIndex(workflowId: string, stepId: string): number {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return -1;
    
    return workflow.steps.findIndex(step => step.id === stepId);
  }

  // Approval Management
  async approveStep(instanceId: string, stepId: string, userId: string, comments?: string): Promise<void> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Workflow instance ${instanceId} not found`);
      }

      const participant = instance.participants.find(p => p.user_id === userId && p.role === 'approver');
      if (!participant) {
        throw new Error(`User ${userId} is not an approver for this workflow`);
      }

      participant.status = 'approved';
      participant.action_taken_at = new Date().toISOString();
      participant.comments = comments;

      // Check if all approvers have approved
      const pendingApprovers = instance.participants.filter(p => p.role === 'approver' && p.status === 'pending');
      if (pendingApprovers.length === 0) {
        // All approved, continue to next step
        await this.executeStep(instanceId, instance.current_step);
      }

      this.instances.set(instanceId, instance);

      await adminSDK.logAdminAction({
        type: 'workflow_approval',
        user_id: userId,
        target_type: 'workflow_instance',
        target_id: instanceId,
        details: { step_id: stepId, action: 'approved', comments },
        status: 'completed',
      });
    } catch (error) {
      console.error('Error approving workflow step:', error);
      throw error;
    }
  }

  async rejectStep(instanceId: string, stepId: string, userId: string, reason: string): Promise<void> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Workflow instance ${instanceId} not found`);
      }

      const participant = instance.participants.find(p => p.user_id === userId && p.role === 'approver');
      if (!participant) {
        throw new Error(`User ${userId} is not an approver for this workflow`);
      }

      participant.status = 'rejected';
      participant.action_taken_at = new Date().toISOString();
      participant.comments = reason;

      // Workflow is rejected
      instance.status = 'failed';
      instance.updated_at = new Date().toISOString();

      this.instances.set(instanceId, instance);

      await adminSDK.logAdminAction({
        type: 'workflow_rejection',
        user_id: userId,
        target_type: 'workflow_instance',
        target_id: instanceId,
        details: { step_id: stepId, action: 'rejected', reason },
        status: 'completed',
      });
    } catch (error) {
      console.error('Error rejecting workflow step:', error);
      throw error;
    }
  }

  private async handleApprovalTimeout(instanceId: string, stepId: string): Promise<void> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance || instance.status !== 'running') {
        return;
      }

      // Check if step is still pending approval
      const pendingApprovers = instance.participants.filter(p => p.role === 'approver' && p.status === 'pending');
      if (pendingApprovers.length > 0) {
        // Auto-reject due to timeout
        instance.status = 'failed';
        instance.updated_at = new Date().toISOString();
        instance.history.push({
          step_id: stepId,
          step_name: 'Approval Step',
          action: 'timeout',
          user_id: 'system',
          timestamp: new Date().toISOString(),
          details: { reason: 'Approval timeout' },
          status: 'failure',
        });

        this.instances.set(instanceId, instance);

        await adminSDK.logAdminAction({
          type: 'workflow_timeout',
          user_id: 'system',
          target_type: 'workflow_instance',
          target_id: instanceId,
          details: { step_id: stepId, reason: 'Approval timeout' },
          status: 'completed',
        });
      }
    } catch (error) {
      console.error('Error handling approval timeout:', error);
    }
  }

  // Workflow Instance Queries
  async getWorkflowInstances(params: {
    workflow_id?: string;
    status?: string;
    created_by?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ instances: WorkflowInstance[]; total: number; pagination: any }> {
    try {
      let instances = Array.from(this.instances.values());

      // Apply filters
      if (params.workflow_id) {
        instances = instances.filter(i => i.workflow_id === params.workflow_id);
      }
      if (params.status) {
        instances = instances.filter(i => i.status === params.status);
      }
      if (params.created_by) {
        instances = instances.filter(i => i.created_by === params.created_by);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedInstances = instances.slice(from, to);

      return {
        instances: paginatedInstances,
        total: instances.length,
        pagination: {
          page,
          limit,
          total: instances.length,
          total_pages: Math.ceil(instances.length / limit),
          has_next: to < instances.length,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      throw error;
    }
  }

  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstance | null> {
    return this.instances.get(instanceId) || null;
  }

  async cancelWorkflowInstance(instanceId: string, userId: string, reason: string): Promise<void> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Workflow instance ${instanceId} not found`);
      }

      instance.status = 'cancelled';
      instance.updated_at = new Date().toISOString();
      instance.history.push({
        step_id: 'cancellation',
        step_name: 'Workflow Cancelled',
        action: 'cancelled',
        user_id: userId,
        timestamp: new Date().toISOString(),
        details: { reason },
        status: 'success',
      });

      this.instances.set(instanceId, instance);

      await adminSDK.logAdminAction({
        type: 'workflow_cancellation',
        user_id: userId,
        target_type: 'workflow_instance',
        target_id: instanceId,
        details: { reason },
        status: 'completed',
      });
    } catch (error) {
      console.error('Error cancelling workflow instance:', error);
      throw error;
    }
  }

  // Trigger Management
  async registerTrigger(workflowId: string, trigger: WorkflowTrigger): Promise<void> {
    try {
      if (!this.triggers.has(workflowId)) {
        this.triggers.set(workflowId, []);
      }
      
      this.triggers.get(workflowId)!.push(trigger);
    } catch (error) {
      console.error('Error registering trigger:', error);
      throw error;
    }
  }

  async handleEvent(event: string, data: Record<string, any>): Promise<void> {
    try {
      // Find workflows triggered by this event
      for (const [workflowId, triggers] of this.triggers.entries()) {
        for (const trigger of triggers) {
          if (trigger.type === 'automatic' && trigger.event === event) {
            // Check conditions if specified
            if (trigger.conditions) {
              const conditionsMet = this.evaluateConditions(trigger.conditions, data);
              if (!conditionsMet) continue;
            }

            // Start workflow
            await this.startWorkflow(workflowId, data, 'system');
          }
        }
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  private evaluateConditions(conditions: Record<string, any>, data: Record<string, any>): boolean {
    try {
      // Simple condition evaluation - can be enhanced
      for (const [field, expectedValue] of Object.entries(conditions)) {
        const actualValue = this.getNestedValue(data, field);
        if (actualValue !== expectedValue) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  // Utility Methods
  async getWorkflowStatistics(): Promise<{
    total_workflows: number;
    active_instances: number;
    completed_instances: number;
    failed_instances: number;
    average_completion_time: number;
  }> {
    try {
      const instances = Array.from(this.instances.values());
      const activeInstances = instances.filter(i => i.status === 'running').length;
      const completedInstances = instances.filter(i => i.status === 'completed').length;
      const failedInstances = instances.filter(i => i.status === 'failed').length;

      // Calculate average completion time
      const completedWithTime = instances.filter(i => i.status === 'completed' && i.completed_at);
      const averageCompletionTime = completedWithTime.length > 0
        ? completedWithTime.reduce((sum, instance) => {
            const duration = new Date(instance.completed_at!).getTime() - new Date(instance.created_at).getTime();
            return sum + duration;
          }, 0) / completedWithTime.length
        : 0;

      return {
        total_workflows: this.workflows.size,
        active_instances: activeInstances,
        completed_instances: completedInstances,
        failed_instances: failedInstances,
        average_completion_time: averageCompletionTime,
      };
    } catch (error) {
      console.error('Error getting workflow statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const workflowService = WorkflowService.getInstance();

// Export types for convenience
export type { WorkflowInstance, WorkflowParticipant, WorkflowHistoryItem, WorkflowTrigger }; 