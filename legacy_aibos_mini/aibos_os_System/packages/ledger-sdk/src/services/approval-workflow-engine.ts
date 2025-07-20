/**
 * Enterprise Approval Workflow Engine
 * Supports complex routing, parallel approvals, and escalations
 */
import { PurchaseOrder } from '@aibos/core-types';
export interface ApprovalRule {
  id: string;
  name: string;
  conditions: ApprovalCondition[];
  approvers: ApprovalStep[];
  escalation?: EscalationRule;
  metadata?: Record<string, any>;
}

export interface ApprovalCondition {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface ApprovalStep {
  step_number: number;
  type: 'SEQUENTIAL' | 'PARALLEL' | 'ANY_ONE';
  approvers: Array<{
    userId?: string;
    role?: string;
    department?: string;
  }>;
  required_approvals: number;
  timeout_hours?: number;
}

export interface EscalationRule {
  timeout_hours: number;
  escalate_to: Array<{
    userId?: string;
    role?: string;
  }>;
  notification_template: string;
}

export class ApprovalWorkflowEngine {
  private rules: Map<string, ApprovalRule> = new Map();
  private activeWorkflows: Map<string, WorkflowInstance> = new Map();

  addRule(rule: ApprovalRule): void {
    this.rules.set(rule.id, rule);
  }

  async startApprovalWorkflow(poId: string, po: PurchaseOrder): Promise<string> {
    const applicableRules = this.findApplicableRules(po);
    if (applicableRules.length === 0) {
      throw new Error('No approval rules found for this purchase order');
    }

    const rule = applicableRules[0]; // Use first matching rule
    const workflowId = `workflow_${poId}_${Date.now()}`;
    
    const workflow: WorkflowInstance = {
      id: workflowId,
      po_id: poId,
      rule_id: rule.id,
      current_step: 0,
      status: 'IN_PROGRESS',
      started_at: new Date(),
      approvals: [],
      escalations: []
    };

    this.activeWorkflows.set(workflowId, workflow);
    
    // Start first approval step
    await this.processNextStep(workflowId);
    
    return workflowId;
  }

  async submitApproval(
    workflowId: string, 
    approverId: string, 
    decision: 'APPROVED' | 'REJECTED', 
    comments?: string
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const approval: WorkflowApproval = {
      id: `approval_${Date.now()}`,
      workflow_id: workflowId,
      step_number: workflow.current_step,
      approver_id: approverId,
      decision,
      timestamp: new Date(),
      comments
    };

    workflow.approvals.push(approval);

    if (decision === 'REJECTED') {
      workflow.status = 'REJECTED';
      workflow.completed_at = new Date();
      return;
    }

    // Check if current step is complete
    const rule = this.rules.get(workflow.rule_id)!;
    const currentStep = rule.approvers[workflow.current_step];
    const stepApprovals = workflow.approvals.filter(a => a.step_number === workflow.current_step && a.decision === 'APPROVED');

    if (stepApprovals.length >= currentStep.required_approvals) {
      workflow.current_step++;
      
      if (workflow.current_step >= rule.approvers.length) {
        // Workflow complete
        workflow.status = 'APPROVED';
        workflow.completed_at = new Date();
      } else {
        // Move to next step
        await this.processNextStep(workflowId);
      }
    }
  }

  private findApplicableRules(po: PurchaseOrder): ApprovalRule[] {
    return Array.from(this.rules.values()).filter(rule => {
      return rule.conditions.every(condition => {
        const fieldValue = this.getFieldValue(po, condition.field);
        return this.evaluateCondition(fieldValue, condition.operator, condition.value);
      });
    });
  }

  private async processNextStep(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId)!;
    const rule = this.rules.get(workflow.rule_id)!;
    const step = rule.approvers[workflow.current_step];

    // Send notifications to approvers
    for (const approver of step.approvers) {
      await this.sendApprovalNotification(workflowId, approver);
    }

    // Set up escalation timer if configured
    if (step.timeout_hours && rule.escalation) {
      setTimeout(() => {
        this.handleEscalation(workflowId);
      }, step.timeout_hours * 60 * 60 * 1000);
    }
  }

  private async sendApprovalNotification(workflowId: string, approver: any): Promise<void> {
    // Implementation would integrate with notification service
    console.log(`Sending approval notification for workflow ${workflowId} to approver:`, approver);
  }

  private async handleEscalation(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow || workflow.status !== 'IN_PROGRESS') return;

    const rule = this.rules.get(workflow.rule_id)!;
    if (!rule.escalation) return;

    const escalation: WorkflowEscalation = {
      id: `escalation_${Date.now()}`,
      workflow_id: workflowId,
      step_number: workflow.current_step,
      escalated_at: new Date(),
      escalated_to: rule.escalation.escalate_to
    };

    workflow.escalations.push(escalation);

    // Send escalation notifications
    for (const escalateTo of rule.escalation.escalate_to) {
      await this.sendEscalationNotification(workflowId, escalateTo);
    }
  }

  private async sendEscalationNotification(workflowId: string, escalateTo: any): Promise<void> {
    // Implementation would integrate with notification service
    console.log(`Sending escalation notification for workflow ${workflowId} to:`, escalateTo);
  }

  private getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, key) => o?.[key], obj);
  }

  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case 'eq': return fieldValue === value;
      case 'gt': return fieldValue > value;
      case 'lt': return fieldValue < value;
      case 'gte': return fieldValue >= value;
      case 'lte': return fieldValue <= value;
      case 'in': return Array.isArray(value) && value.includes(fieldValue);
      case 'contains': return String(fieldValue).includes(String(value));
      default: return false;
    }
  }
}

interface WorkflowInstance {
  id: string;
  po_id: string;
  rule_id: string;
  current_step: number;
  status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  started_at: Date;
  completed_at?: Date;
  approvals: WorkflowApproval[];
  escalations: WorkflowEscalation[];
}

interface WorkflowApproval {
  id: string;
  workflow_id: string;
  step_number: number;
  approver_id: string;
  decision: 'APPROVED' | 'REJECTED';
  timestamp: Date;
  comments?: string;
}

interface WorkflowEscalation {
  id: string;
  workflow_id: string;
  step_number: number;
  escalated_at: Date;
  escalated_to: Array<{ userId?: string; role?: string; }>;
}