/**
 * Enterprise Budget Control Service
 * Real-time budget tracking, spend limits, and automated controls
 */
export interface BudgetDefinition {
  id: string;
  name: string;
  organizationId: string;
  department_id?: string;
  category_ids?: string[];
  supplierIds?: string[];
  period: {
    start_date: Date;
    end_date: Date;
    type: 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';
  };
  limits: {
    total_budget: number;
    warning_threshold: number; // Percentage (e.g., 80)
    hard_limit_threshold: number; // Percentage (e.g., 95)
  };
  controls: {
    require_approval_over_threshold: boolean;
    block_over_budget: boolean;
    allow_emergency_override: boolean;
  };
  metadata?: Record<string, any>;
}

export interface BudgetUtilization {
  budget_id: string;
  period: { start_date: Date; end_date: Date; };
  total_budget: number;
  committed_amount: number;
  spent_amount: number;
  available_amount: number;
  utilization_percentage: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  last_updated: Date;
}

export class BudgetControlService {
  private budgets: Map<string, BudgetDefinition> = new Map();
  private utilizations: Map<string, BudgetUtilization> = new Map();

  addBudget(budget: BudgetDefinition): void {
    this.budgets.set(budget.id, budget);
    this.initializeBudgetUtilization(budget);
  }

  async checkBudgetAvailability(
    organizationId: string,
    amount: number,
    categoryId?: string,
    departmentId?: string,
    vendorId?: string
  ): Promise<BudgetCheckResult> {
    const applicableBudgets = this.findApplicableBudgets(
      organizationId, categoryId, departmentId, vendorId
    );

    const results: BudgetCheckResult[] = [];
    
    for (const budget of applicableBudgets) {
      const utilization = this.utilizations.get(budget.id)!;
      const newCommittedAmount = utilization.committed_amount + amount;
      const newUtilization = (newCommittedAmount / budget.limits.total_budget) * 100;

      let status: 'APPROVED' | 'WARNING' | 'REQUIRES_APPROVAL' | 'BLOCKED' = 'APPROVED';
      let message = 'Budget check passed';

      if (newUtilization >= budget.limits.hard_limit_threshold) {
        if (budget.controls.block_over_budget) {
          status = 'BLOCKED';
          message = `Purchase would exceed budget hard limit (${budget.limits.hard_limit_threshold}%)`;
        } else if (budget.controls.require_approval_over_threshold) {
          status = 'REQUIRES_APPROVAL';
          message = `Purchase requires approval - exceeds threshold (${budget.limits.hard_limit_threshold}%)`;
        }
      } else if (newUtilization >= budget.limits.warning_threshold) {
        status = 'WARNING';
        message = `Purchase approved with warning - approaching budget limit (${newUtilization.toFixed(1)}%)`;
      }

      results.push({
        budget_id: budget.id,
        budget_name: budget.name,
        status,
        message,
        current_utilization: utilization.utilization_percentage,
        projected_utilization: newUtilization,
        available_amount: utilization.available_amount,
        requested_amount: amount
      });
    }

    // Return most restrictive result
    const priorityOrder = ['BLOCKED', 'REQUIRES_APPROVAL', 'WARNING', 'APPROVED'];
    return results.sort((a, b) => 
      priorityOrder.indexOf(a.status) - priorityOrder.indexOf(b.status)
    )[0] || {
      budget_id: 'none',
      budget_name: 'No applicable budget',
      status: 'APPROVED',
      message: 'No budget controls apply',
      current_utilization: 0,
      projected_utilization: 0,
      available_amount: Infinity,
      requested_amount: amount
    };
  }

  async commitBudget(budgetId: string, amount: number, poId: string): Promise<void> {
    const utilization = this.utilizations.get(budgetId);
    if (!utilization) throw new Error('Budget not found');

    utilization.committed_amount += amount;
    utilization.available_amount = utilization.total_budget - utilization.committed_amount - utilization.spent_amount;
    utilization.utilization_percentage = ((utilization.committed_amount + utilization.spent_amount) / utilization.total_budget) * 100;
    utilization.last_updated = new Date();

    // Update status based on utilization
    const budget = this.budgets.get(budgetId)!;
    if (utilization.utilization_percentage >= budget.limits.hard_limit_threshold) {
      utilization.status = 'CRITICAL';
    } else if (utilization.utilization_percentage >= budget.limits.warning_threshold) {
      utilization.status = 'WARNING';
    } else {
      utilization.status = 'HEALTHY';
    }

    // Record commitment for tracking
    // Implementation would save to database
  }

  async releaseBudget(budgetId: string, amount: number, poId: string): Promise<void> {
    const utilization = this.utilizations.get(budgetId);
    if (!utilization) throw new Error('Budget not found');

    utilization.committed_amount = Math.max(0, utilization.committed_amount - amount);
    utilization.available_amount = utilization.total_budget - utilization.committed_amount - utilization.spent_amount;
    utilization.utilization_percentage = ((utilization.committed_amount + utilization.spent_amount) / utilization.total_budget) * 100;
    utilization.last_updated = new Date();
  }

  async recordActualSpend(budgetId: string, amount: number, poId: string): Promise<void> {
    const utilization = this.utilizations.get(budgetId);
    if (!utilization) throw new Error('Budget not found');

    // Move from committed to spent
    utilization.committed_amount = Math.max(0, utilization.committed_amount - amount);
    utilization.spent_amount += amount;
    utilization.available_amount = utilization.total_budget - utilization.committed_amount - utilization.spent_amount;
    utilization.utilization_percentage = ((utilization.committed_amount + utilization.spent_amount) / utilization.total_budget) * 100;
    utilization.last_updated = new Date();
  }

  getBudgetUtilization(budgetId: string): BudgetUtilization | undefined {
    return this.utilizations.get(budgetId);
  }

  getAllBudgetUtilizations(organizationId: string): BudgetUtilization[] {
    return Array.from(this.budgets.values())
      .filter(budget => budget.organizationId === organizationId)
      .map(budget => this.utilizations.get(budget.id)!)
      .filter(Boolean);
  }

  private findApplicableBudgets(
    organizationId: string,
    categoryId?: string,
    departmentId?: string,
    vendorId?: string
  ): BudgetDefinition[] {
    return Array.from(this.budgets.values()).filter(budget => {
      if (budget.organizationId !== organizationId) return false;
      
      // Check if current date is within budget period
      const now = new Date();
      if (now < budget.period.start_date || now > budget.period.end_date) return false;
      
      // Check department filter
      if (budget.department_id && budget.department_id !== departmentId) return false;
      
      // Check category filter
      if (budget.category_ids && categoryId && !budget.category_ids.includes(categoryId)) return false;
      
      // Check vendor filter
      if (budget.supplierIds && vendorId && !budget.supplierIds.includes(vendorId)) return false;
      
      return true;
    });
  }

  private initializeBudgetUtilization(budget: BudgetDefinition): void {
    const utilization: BudgetUtilization = {
      budget_id: budget.id,
      period: budget.period,
      total_budget: budget.limits.total_budget,
      committed_amount: 0,
      spent_amount: 0,
      available_amount: budget.limits.total_budget,
      utilization_percentage: 0,
      status: 'HEALTHY',
      last_updated: new Date()
    };
    
    this.utilizations.set(budget.id, utilization);
  }
}

export interface BudgetCheckResult {
  budget_id: string;
  budget_name: string;
  status: 'APPROVED' | 'WARNING' | 'REQUIRES_APPROVAL' | 'BLOCKED';
  message: string;
  current_utilization: number;
  projected_utilization: number;
  available_amount: number;
  requested_amount: number;
}