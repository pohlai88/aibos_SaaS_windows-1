// Costing Validation - Enterprise Grade Input Validation
// Using Zod for comprehensive type-safe validation

import { z } from 'zod';

// Base validation schemas
export const costCenterTypeSchema = z.enum(['production', 'service', 'support', 'administrative', 'sales', 'research']);
export const costCategorySchema = z.enum(['direct', 'indirect', 'overhead', 'fixed', 'variable']);
export const allocationMethodSchema = z.enum(['direct', 'step_down', 'reciprocal', 'activity_based']);
export const allocationBasisSchema = z.enum(['headcount', 'square_footage', 'machine_hours', 'labor_hours', 'revenue', 'custom']);
export const budgetPeriodSchema = z.enum(['monthly', 'quarterly', 'annual']);

// Activity validation schemas
export const activityTypeSchema = z.enum(['unit_level', 'batch_level', 'product_level', 'facility_level']);
export const activityCategorySchema = z.enum(['production', 'setup', 'maintenance', 'quality', 'logistics', 'administration']);
export const costDriverTypeSchema = z.enum(['volume', 'time', 'complexity', 'custom']);
export const allocationMethodActivitySchema = z.enum(['direct', 'proportional', 'formula']);

// Process validation schemas
export const processTypeSchema = z.enum(['continuous', 'batch', 'job_order']);
export const processStatusSchema = z.enum(['in_progress', 'completed', 'closed']);

// Variance validation schemas
export const varianceTypeSchema = z.enum(['materials', 'labor', 'overhead', 'efficiency', 'volume', 'price', 'mix']);
export const varianceStatusSchema = z.enum(['open', 'investigating', 'resolved', 'closed']);

// Standard cost validation schemas
export const overheadAllocationBasisSchema = z.enum(['direct_labor_hours', 'direct_labor_cost', 'machine_hours', 'activity_based']);
export const standardCostStatusSchema = z.enum(['draft', 'pending_approval', 'approved', 'rejected']);

// Cost Center validation schema
export const costCenterSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  code: z.string().min(1, 'Code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  
  // Classification
  type: costCenterTypeSchema,
  category: costCategorySchema,
  parent_cost_center_id: z.string().uuid().optional(),
  level: z.number().int().min(0).max(10, 'Level must be between 0 and 10'),
  
  // Cost allocation
  allocation_method: allocationMethodSchema,
  allocation_basis: allocationBasisSchema.optional(),
  allocation_percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional(),
  
  // Budget and control
  budget_amount: z.number().positive('Budget amount must be positive'),
  budget_currency: z.string().length(3, 'Currency must be 3 characters'),
  budget_period: budgetPeriodSchema,
  cost_center_manager_id: z.string().uuid().optional(),
  
  // Status
  is_active: z.boolean().default(true),
  is_production: z.boolean().default(false),
  is_service: z.boolean().default(false),
  
  // Metadata
  location: z.string().optional(),
  department_id: z.string().uuid().optional(),
});

// Activity validation schema
export const activitySchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  code: z.string().min(1, 'Code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  
  // Activity classification
  type: activityTypeSchema,
  category: activityCategorySchema,
  
  // Cost driver
  cost_driver: z.object({
    type: costDriverTypeSchema,
    name: z.string().min(1, 'Driver name is required').max(50, 'Driver name too long'),
    unit: z.string().min(1, 'Unit is required').max(20, 'Unit too long'),
    description: z.string().optional(),
  }),
  
  // Cost pool
  cost_pool: z.object({
    total_cost: z.number().min(0, 'Total cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    allocation_method: allocationMethodActivitySchema,
    allocation_formula: z.string().optional(),
  }),
  
  // Performance metrics
  standard_rate: z.number().min(0, 'Standard rate cannot be negative'),
  standard_hours: z.number().positive().optional(),
  efficiency_target: z.number().min(0).max(100, 'Efficiency target must be between 0 and 100'),
  
  // Status
  is_active: z.boolean().default(true),
  is_automated: z.boolean().default(false),
});

// Cost Driver validation schema
export const costDriverSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  activity_id: z.string().uuid('Invalid activity ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  
  // Driver details
  type: costDriverTypeSchema,
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit too long'),
  measurement_method: z.enum(['manual', 'automated', 'estimated']),
  
  // Driver rates
  standard_rate: z.number().min(0, 'Standard rate cannot be negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  rate_period: z.enum(['hour', 'day', 'month', 'year', 'unit', 'batch']),
  
  // Driver allocation
  allocation_method: allocationMethodActivitySchema,
  allocation_formula: z.string().optional(),
  
  // Performance tracking
  actual_usage: z.number().min(0, 'Actual usage cannot be negative').default(0),
  standard_usage: z.number().min(0, 'Standard usage cannot be negative').default(0),
  variance: z.number().default(0),
  variance_percentage: z.number().default(0),
  
  // Status
  is_active: z.boolean().default(true),
  requires_approval: z.boolean().default(false),
});

// Standard Cost validation schema
export const standardCostSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  product_id: z.string().uuid('Invalid product ID'),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  
  // Cost components
  direct_materials: z.object({
    standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    bill_of_materials: z.array(z.object({
      material_id: z.string().uuid('Invalid material ID'),
      quantity: z.number().positive('Quantity must be positive'),
      unit_cost: z.number().min(0, 'Unit cost cannot be negative'),
      total_cost: z.number().min(0, 'Total cost cannot be negative'),
    })).min(1, 'At least one material is required'),
  }),
  
  direct_labor: z.object({
    standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    standard_hours: z.number().positive('Standard hours must be positive'),
    labor_rate: z.number().min(0, 'Labor rate cannot be negative'),
    operations: z.array(z.object({
      operation_id: z.string().uuid('Invalid operation ID'),
      hours: z.number().positive('Hours must be positive'),
      rate: z.number().min(0, 'Rate cannot be negative'),
      cost: z.number().min(0, 'Cost cannot be negative'),
    })).min(1, 'At least one operation is required'),
  }),
  
  manufacturing_overhead: z.object({
    standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    allocation_basis: overheadAllocationBasisSchema,
    overhead_rate: z.number().min(0, 'Overhead rate cannot be negative'),
    activities: z.array(z.object({
      activity_id: z.string().uuid('Invalid activity ID'),
      driver_quantity: z.number().min(0, 'Driver quantity cannot be negative'),
      driver_rate: z.number().min(0, 'Driver rate cannot be negative'),
      allocated_cost: z.number().min(0, 'Allocated cost cannot be negative'),
    })).default([]),
  }),
  
  // Total costs
  total_standard_cost: z.number().min(0, 'Total standard cost cannot be negative'),
  total_actual_cost: z.number().min(0, 'Total actual cost cannot be negative').default(0),
  variance: z.number().default(0),
  variance_percentage: z.number().default(0),
  
  // Period
  effective_date: z.string().datetime('Invalid effective date'),
  expiry_date: z.string().datetime().optional(),
  is_current: z.boolean().default(true),
  
  // Approval
  status: standardCostStatusSchema.default('draft'),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
});

// Process Cost validation schema
export const processCostSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  process_id: z.string().uuid('Invalid process ID'),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  
  // Process details
  process_name: z.string().min(1, 'Process name is required').max(100, 'Process name too long'),
  process_type: processTypeSchema,
  process_stage: z.number().int().min(1, 'Process stage must be at least 1'),
  total_stages: z.number().int().min(1, 'Total stages must be at least 1'),
  
  // Cost accumulation
  beginning_wip: z.object({
    materials: z.number().min(0, 'Materials cost cannot be negative'),
    labor: z.number().min(0, 'Labor cost cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost cannot be negative'),
    total: z.number().min(0, 'Total cost cannot be negative'),
  }),
  
  current_period_costs: z.object({
    materials: z.number().min(0, 'Materials cost cannot be negative'),
    labor: z.number().min(0, 'Labor cost cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost cannot be negative'),
    total: z.number().min(0, 'Total cost cannot be negative'),
  }),
  
  ending_wip: z.object({
    materials: z.number().min(0, 'Materials cost cannot be negative'),
    labor: z.number().min(0, 'Labor cost cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost cannot be negative'),
    total: z.number().min(0, 'Total cost cannot be negative'),
    completion_percentage: z.number().min(0).max(100, 'Completion percentage must be between 0 and 100'),
  }),
  
  // Production units
  units_started: z.number().min(0, 'Units started cannot be negative'),
  units_completed: z.number().min(0, 'Units completed cannot be negative'),
  units_in_process: z.number().min(0, 'Units in process cannot be negative'),
  equivalent_units: z.number().min(0, 'Equivalent units cannot be negative'),
  
  // Cost per unit
  cost_per_equivalent_unit: z.object({
    materials: z.number().min(0, 'Materials cost per unit cannot be negative'),
    labor: z.number().min(0, 'Labor cost per unit cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost per unit cannot be negative'),
    total: z.number().min(0, 'Total cost per unit cannot be negative'),
  }),
  
  // Cost allocation
  costs_transferred_out: z.number().min(0, 'Costs transferred out cannot be negative').default(0),
  costs_transferred_in: z.number().min(0, 'Costs transferred in cannot be negative').default(0),
  
  // Period
  period_start: z.string().datetime('Invalid period start date'),
  period_end: z.string().datetime('Invalid period end date'),
  
  // Status
  status: processStatusSchema.default('in_progress'),
});

// Cost Allocation Rule validation schema
export const costAllocationRuleSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  
  // Rule configuration
  source_cost_center_id: z.string().uuid('Invalid source cost center ID'),
  target_cost_center_ids: z.array(z.string().uuid('Invalid target cost center ID')).min(1, 'At least one target cost center is required'),
  
  // Allocation method
  method: z.enum(['direct', 'step_down', 'reciprocal', 'activity_based', 'formula']),
  basis: allocationBasisSchema,
  
  // Allocation formula
  formula: z.string().optional(),
  formula_variables: z.record(z.any()).optional(),
  
  // Allocation percentages
  percentages: z.array(z.object({
    target_cost_center_id: z.string().uuid('Invalid target cost center ID'),
    percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    fixed_amount: z.number().min(0, 'Fixed amount cannot be negative').optional(),
  })).min(1, 'At least one percentage allocation is required'),
  
  // Conditions
  conditions: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
    value: z.any(),
  })).default([]),
  
  // Priority and execution
  priority: z.number().int().min(1, 'Priority must be at least 1'),
  is_active: z.boolean().default(true),
  execution_order: z.number().int().min(1, 'Execution order must be at least 1'),
  
  // Validation
  validation_rules: z.array(z.object({
    rule: z.string().min(1, 'Rule is required'),
    error_message: z.string().min(1, 'Error message is required'),
  })).default([]),
});

// Cost Variance validation schema
export const costVarianceSchema = z.object({
  organization_id: z.string().uuid('Invalid organization ID'),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  product_id: z.string().uuid().optional(),
  process_id: z.string().uuid().optional(),
  
  // Variance details
  variance_type: varianceTypeSchema,
  period: z.string().datetime('Invalid period'),
  
  // Standard vs Actual
  standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
  actual_cost: z.number().min(0, 'Actual cost cannot be negative'),
  variance_amount: z.number(),
  variance_percentage: z.number(),
  
  // Variance breakdown
  price_variance: z.number().default(0),
  quantity_variance: z.number().default(0),
  efficiency_variance: z.number().default(0),
  volume_variance: z.number().default(0),
  mix_variance: z.number().default(0),
  
  // Analysis
  is_favorable: z.boolean(),
  root_cause: z.string().optional(),
  corrective_action: z.string().optional(),
  responsible_party: z.string().optional(),
  
  // Status
  status: varianceStatusSchema.default('open'),
  investigation_notes: z.string().optional(),
});

// Form validation schemas
export const costCenterFormSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  type: costCenterTypeSchema,
  category: costCategorySchema,
  parent_cost_center_id: z.string().uuid().optional(),
  allocation_method: allocationMethodSchema,
  allocation_basis: allocationBasisSchema.optional(),
  allocation_percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional(),
  budget_amount: z.number().positive('Budget amount must be positive'),
  budget_currency: z.string().length(3, 'Currency must be 3 characters'),
  budget_period: budgetPeriodSchema,
  cost_center_manager_id: z.string().uuid().optional(),
  location: z.string().optional(),
  department_id: z.string().uuid().optional(),
});

export const activityFormSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  type: activityTypeSchema,
  category: activityCategorySchema,
  cost_driver: z.object({
    type: costDriverTypeSchema,
    name: z.string().min(1, 'Driver name is required').max(50, 'Driver name too long'),
    unit: z.string().min(1, 'Unit is required').max(20, 'Unit too long'),
    description: z.string().optional(),
  }),
  cost_pool: z.object({
    total_cost: z.number().min(0, 'Total cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    allocation_method: allocationMethodActivitySchema,
    allocation_formula: z.string().optional(),
  }),
  standard_rate: z.number().min(0, 'Standard rate cannot be negative'),
  standard_hours: z.number().positive().optional(),
  efficiency_target: z.number().min(0).max(100, 'Efficiency target must be between 0 and 100'),
});

export const standardCostFormSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  direct_materials: z.object({
    standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    bill_of_materials: z.array(z.object({
      material_id: z.string().uuid('Invalid material ID'),
      quantity: z.number().positive('Quantity must be positive'),
      unit_cost: z.number().min(0, 'Unit cost cannot be negative'),
    })).min(1, 'At least one material is required'),
  }),
  direct_labor: z.object({
    standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    standard_hours: z.number().positive('Standard hours must be positive'),
    labor_rate: z.number().min(0, 'Labor rate cannot be negative'),
    operations: z.array(z.object({
      operation_id: z.string().uuid('Invalid operation ID'),
      hours: z.number().positive('Hours must be positive'),
      rate: z.number().min(0, 'Rate cannot be negative'),
    })).min(1, 'At least one operation is required'),
  }),
  manufacturing_overhead: z.object({
    standard_cost: z.number().min(0, 'Standard cost cannot be negative'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    allocation_basis: overheadAllocationBasisSchema,
    overhead_rate: z.number().min(0, 'Overhead rate cannot be negative'),
    activities: z.array(z.object({
      activity_id: z.string().uuid('Invalid activity ID'),
      driver_quantity: z.number().min(0, 'Driver quantity cannot be negative'),
      driver_rate: z.number().min(0, 'Driver rate cannot be negative'),
    })).default([]),
  }),
  effective_date: z.string().datetime('Invalid effective date'),
});

export const processCostFormSchema = z.object({
  process_id: z.string().uuid('Invalid process ID'),
  cost_center_id: z.string().uuid('Invalid cost center ID'),
  process_name: z.string().min(1, 'Process name is required').max(100, 'Process name too long'),
  process_type: processTypeSchema,
  process_stage: z.number().int().min(1, 'Process stage must be at least 1'),
  total_stages: z.number().int().min(1, 'Total stages must be at least 1'),
  beginning_wip: z.object({
    materials: z.number().min(0, 'Materials cost cannot be negative'),
    labor: z.number().min(0, 'Labor cost cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost cannot be negative'),
  }),
  current_period_costs: z.object({
    materials: z.number().min(0, 'Materials cost cannot be negative'),
    labor: z.number().min(0, 'Labor cost cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost cannot be negative'),
  }),
  ending_wip: z.object({
    materials: z.number().min(0, 'Materials cost cannot be negative'),
    labor: z.number().min(0, 'Labor cost cannot be negative'),
    overhead: z.number().min(0, 'Overhead cost cannot be negative'),
    completion_percentage: z.number().min(0).max(100, 'Completion percentage must be between 0 and 100'),
  }),
  units_started: z.number().min(0, 'Units started cannot be negative'),
  units_completed: z.number().min(0, 'Units completed cannot be negative'),
  units_in_process: z.number().min(0, 'Units in process cannot be negative'),
  period_start: z.string().datetime('Invalid period start date'),
  period_end: z.string().datetime('Invalid period end date'),
});

export const costAllocationRuleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  source_cost_center_id: z.string().uuid('Invalid source cost center ID'),
  target_cost_center_ids: z.array(z.string().uuid('Invalid target cost center ID')).min(1, 'At least one target cost center is required'),
  method: z.enum(['direct', 'step_down', 'reciprocal', 'activity_based', 'formula']),
  basis: allocationBasisSchema,
  formula: z.string().optional(),
  percentages: z.array(z.object({
    target_cost_center_id: z.string().uuid('Invalid target cost center ID'),
    percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    fixed_amount: z.number().min(0, 'Fixed amount cannot be negative').optional(),
  })).min(1, 'At least one percentage allocation is required'),
  conditions: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
    value: z.any(),
  })).default([]),
  priority: z.number().int().min(1, 'Priority must be at least 1'),
  validation_rules: z.array(z.object({
    rule: z.string().min(1, 'Rule is required'),
    error_message: z.string().min(1, 'Error message is required'),
  })).default([]),
});

// Filter validation schemas
export const costingFiltersSchema = z.object({
  cost_center_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  process_id: z.string().uuid().optional(),
  activity_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  cost_type: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
}).refine((data) => {
  // Validate date range
  if (data.date_from && data.date_to) {
    const fromDate = new Date(data.date_from);
    const toDate = new Date(data.date_to);
    return toDate >= fromDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['date_to'],
});

// Export all schemas
export const CostingValidationSchemas = {
  costCenter: costCenterSchema,
  activity: activitySchema,
  costDriver: costDriverSchema,
  standardCost: standardCostSchema,
  processCost: processCostSchema,
  costAllocationRule: costAllocationRuleSchema,
  costVariance: costVarianceSchema,
  costCenterForm: costCenterFormSchema,
  activityForm: activityFormSchema,
  standardCostForm: standardCostFormSchema,
  processCostForm: processCostFormSchema,
  costAllocationRuleForm: costAllocationRuleFormSchema,
  costingFilters: costingFiltersSchema,
};

// Validation helper functions
export const validateCostCenter = (data: unknown) => costCenterSchema.parse(data);
export const validateActivity = (data: unknown) => activitySchema.parse(data);
export const validateCostDriver = (data: unknown) => costDriverSchema.parse(data);
export const validateStandardCost = (data: unknown) => standardCostSchema.parse(data);
export const validateProcessCost = (data: unknown) => processCostSchema.parse(data);
export const validateCostAllocationRule = (data: unknown) => costAllocationRuleSchema.parse(data);
export const validateCostVariance = (data: unknown) => costVarianceSchema.parse(data);
export const validateCostCenterForm = (data: unknown) => costCenterFormSchema.parse(data);
export const validateActivityForm = (data: unknown) => activityFormSchema.parse(data);
export const validateStandardCostForm = (data: unknown) => standardCostFormSchema.parse(data);
export const validateProcessCostForm = (data: unknown) => processCostFormSchema.parse(data);
export const validateCostAllocationRuleForm = (data: unknown) => costAllocationRuleFormSchema.parse(data);

// Safe validation functions that return errors instead of throwing
export const safeValidateCostCenter = (data: unknown) => {
  try {
    return { success: true, data: costCenterSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateCostCenterForm = (data: unknown) => {
  try {
    return { success: true, data: costCenterFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateActivityForm = (data: unknown) => {
  try {
    return { success: true, data: activityFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateStandardCostForm = (data: unknown) => {
  try {
    return { success: true, data: standardCostFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateProcessCostForm = (data: unknown) => {
  try {
    return { success: true, data: processCostFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const safeValidateCostAllocationRuleForm = (data: unknown) => {
  try {
    return { success: true, data: costAllocationRuleFormSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

// Business rule validation functions
export const validateCostAllocationRule = (
  rule: any,
  costCenters: any[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if source cost center exists
  const sourceExists = costCenters.find(cc => cc.id === rule.source_cost_center_id);
  if (!sourceExists) {
    errors.push('Source cost center does not exist');
  }

  // Check if all target cost centers exist
  const missingTargets = rule.target_cost_center_ids.filter((targetId: string) => 
    !costCenters.find(cc => cc.id === targetId)
  );
  if (missingTargets.length > 0) {
    errors.push(`Target cost centers not found: ${missingTargets.join(', ')}`);
  }

  // Validate percentages sum to 100%
  if (rule.method === 'direct' || rule.method === 'step_down') {
    const totalPercentage = rule.percentages.reduce((sum: number, p: any) => sum + p.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push('Allocation percentages must sum to 100%');
    }
  }

  // Validate formula if provided
  if (rule.formula && rule.method === 'formula') {
    try {
      // Basic formula validation - check for valid syntax
      const testVariables = rule.formula_variables || {};
      const testFormula = rule.formula.replace(/\{(\w+)\}/g, (match: string, varName: string) => {
        return testVariables[varName] || '0';
      });
      // Try to evaluate the formula
      eval(testFormula);
    } catch (error) {
      errors.push('Invalid allocation formula');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateStandardCostCalculation = (
  standardCost: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate direct materials
  const materialsTotal = standardCost.direct_materials.bill_of_materials.reduce(
    (sum: number, item: any) => sum + (item.quantity * item.unit_cost), 0
  );
  if (Math.abs(materialsTotal - standardCost.direct_materials.standard_cost) > 0.01) {
    errors.push('Direct materials total does not match sum of bill of materials');
  }

  // Validate direct labor
  const laborTotal = standardCost.direct_labor.operations.reduce(
    (sum: number, op: any) => sum + (op.hours * op.rate), 0
  );
  if (Math.abs(laborTotal - standardCost.direct_labor.standard_cost) > 0.01) {
    errors.push('Direct labor total does not match sum of operations');
  }

  // Validate manufacturing overhead
  const overheadTotal = standardCost.manufacturing_overhead.activities.reduce(
    (sum: number, activity: any) => sum + (activity.driver_quantity * activity.driver_rate), 0
  );
  if (Math.abs(overheadTotal - standardCost.manufacturing_overhead.standard_cost) > 0.01) {
    errors.push('Manufacturing overhead total does not match sum of activities');
  }

  // Validate total standard cost
  const calculatedTotal = standardCost.direct_materials.standard_cost + 
                         standardCost.direct_labor.standard_cost + 
                         standardCost.manufacturing_overhead.standard_cost;
  if (Math.abs(calculatedTotal - standardCost.total_standard_cost) > 0.01) {
    errors.push('Total standard cost does not match sum of components');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateProcessCostCalculation = (
  processCost: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate beginning WIP total
  const beginningTotal = processCost.beginning_wip.materials + 
                        processCost.beginning_wip.labor + 
                        processCost.beginning_wip.overhead;
  if (Math.abs(beginningTotal - processCost.beginning_wip.total) > 0.01) {
    errors.push('Beginning WIP total does not match sum of components');
  }

  // Validate current period costs total
  const currentTotal = processCost.current_period_costs.materials + 
                      processCost.current_period_costs.labor + 
                      processCost.current_period_costs.overhead;
  if (Math.abs(currentTotal - processCost.current_period_costs.total) > 0.01) {
    errors.push('Current period costs total does not match sum of components');
  }

  // Validate ending WIP total
  const endingTotal = processCost.ending_wip.materials + 
                     processCost.ending_wip.labor + 
                     processCost.ending_wip.overhead;
  if (Math.abs(endingTotal - processCost.ending_wip.total) > 0.01) {
    errors.push('Ending WIP total does not match sum of components');
  }

  // Validate equivalent units calculation
  const calculatedEquivalentUnits = processCost.units_completed + 
                                   (processCost.units_in_process * processCost.ending_wip.completion_percentage / 100);
  if (Math.abs(calculatedEquivalentUnits - processCost.equivalent_units) > 0.01) {
    errors.push('Equivalent units calculation is incorrect');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}; 