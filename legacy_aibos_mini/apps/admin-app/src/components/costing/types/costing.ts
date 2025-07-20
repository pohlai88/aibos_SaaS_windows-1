// Costing System Types - Enterprise Grade Type Definitions
// Comprehensive costing system for manufacturing and service industries

// Core Costing Types
export interface CostCenter {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  
  // Classification
  type: 'production' | 'service' | 'support' | 'administrative' | 'sales' | 'research';
  category: 'direct' | 'indirect' | 'overhead' | 'fixed' | 'variable';
  parent_cost_center_id?: string;
  level: number;
  
  // Cost allocation
  allocation_method: 'direct' | 'step_down' | 'reciprocal' | 'activity_based';
  allocation_basis?: 'headcount' | 'square_footage' | 'machine_hours' | 'labor_hours' | 'revenue' | 'custom';
  allocation_percentage?: number;
  
  // Budget and control
  budget_amount: number;
  budget_currency: string;
  budget_period: 'monthly' | 'quarterly' | 'annual';
  cost_center_manager_id?: string;
  
  // Status
  is_active: boolean;
  is_production: boolean;
  is_service: boolean;
  
  // Metadata
  location?: string;
  department_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface Activity {
  id: string;
  organization_id: string;
  cost_center_id: string;
  code: string;
  name: string;
  description?: string;
  
  // Activity classification
  type: 'unit_level' | 'batch_level' | 'product_level' | 'facility_level';
  category: 'production' | 'setup' | 'maintenance' | 'quality' | 'logistics' | 'administration';
  
  // Cost driver
  cost_driver: {
    type: 'volume' | 'time' | 'complexity' | 'custom';
    name: string;
    unit: string;
    description?: string;
  };
  
  // Cost pool
  cost_pool: {
    total_cost: number;
    currency: string;
    allocation_method: 'direct' | 'proportional' | 'formula';
    allocation_formula?: string;
  };
  
  // Performance metrics
  standard_rate: number;
  standard_hours?: number;
  efficiency_target: number;
  
  // Status
  is_active: boolean;
  is_automated: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CostDriver {
  id: string;
  organization_id: string;
  activity_id: string;
  name: string;
  description?: string;
  
  // Driver details
  type: 'volume' | 'time' | 'complexity' | 'custom';
  unit: string;
  measurement_method: 'manual' | 'automated' | 'estimated';
  
  // Driver rates
  standard_rate: number;
  currency: string;
  rate_period: 'hour' | 'day' | 'month' | 'year' | 'unit' | 'batch';
  
  // Driver allocation
  allocation_method: 'direct' | 'proportional' | 'formula';
  allocation_formula?: string;
  
  // Performance tracking
  actual_usage: number;
  standard_usage: number;
  variance: number;
  variance_percentage: number;
  
  // Status
  is_active: boolean;
  requires_approval: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface StandardCost {
  id: string;
  organization_id: string;
  product_id: string;
  cost_center_id: string;
  
  // Cost components
  direct_materials: {
    standard_cost: number;
    currency: string;
    bill_of_materials: Array<{
      material_id: string;
      quantity: number;
      unit_cost: number;
      total_cost: number;
    }>;
  };
  
  direct_labor: {
    standard_cost: number;
    currency: string;
    standard_hours: number;
    labor_rate: number;
    operations: Array<{
      operation_id: string;
      hours: number;
      rate: number;
      cost: number;
    }>;
  };
  
  manufacturing_overhead: {
    standard_cost: number;
    currency: string;
    allocation_basis: 'direct_labor_hours' | 'direct_labor_cost' | 'machine_hours' | 'activity_based';
    overhead_rate: number;
    activities: Array<{
      activity_id: string;
      driver_quantity: number;
      driver_rate: number;
      allocated_cost: number;
    }>;
  };
  
  // Total costs
  total_standard_cost: number;
  total_actual_cost: number;
  variance: number;
  variance_percentage: number;
  
  // Period
  effective_date: string;
  expiry_date?: string;
  is_current: boolean;
  
  // Approval
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface ProcessCost {
  id: string;
  organization_id: string;
  process_id: string;
  cost_center_id: string;
  
  // Process details
  process_name: string;
  process_type: 'continuous' | 'batch' | 'job_order';
  process_stage: number;
  total_stages: number;
  
  // Cost accumulation
  beginning_wip: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };
  
  current_period_costs: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };
  
  ending_wip: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
    completion_percentage: number;
  };
  
  // Production units
  units_started: number;
  units_completed: number;
  units_in_process: number;
  equivalent_units: number;
  
  // Cost per unit
  cost_per_equivalent_unit: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };
  
  // Cost allocation
  costs_transferred_out: number;
  costs_transferred_in: number;
  
  // Period
  period_start: string;
  period_end: string;
  
  // Status
  status: 'in_progress' | 'completed' | 'closed';
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CostAllocationRule {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  
  // Rule configuration
  source_cost_center_id: string;
  target_cost_center_ids: string[];
  
  // Allocation method
  method: 'direct' | 'step_down' | 'reciprocal' | 'activity_based' | 'formula';
  basis: 'headcount' | 'square_footage' | 'machine_hours' | 'labor_hours' | 'revenue' | 'custom';
  
  // Allocation formula
  formula?: string;
  formula_variables?: Record<string, any>;
  
  // Allocation percentages
  percentages: Array<{
    target_cost_center_id: string;
    percentage: number;
    fixed_amount?: number;
  }>;
  
  // Conditions
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }>;
  
  // Priority and execution
  priority: number;
  is_active: boolean;
  execution_order: number;
  
  // Validation
  validation_rules: Array<{
    rule: string;
    error_message: string;
  }>;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CostVariance {
  id: string;
  organization_id: string;
  cost_center_id: string;
  product_id?: string;
  process_id?: string;
  
  // Variance details
  variance_type: 'materials' | 'labor' | 'overhead' | 'efficiency' | 'volume' | 'price' | 'mix';
  period: string;
  
  // Standard vs Actual
  standard_cost: number;
  actual_cost: number;
  variance_amount: number;
  variance_percentage: number;
  
  // Variance breakdown
  price_variance: number;
  quantity_variance: number;
  efficiency_variance: number;
  volume_variance: number;
  mix_variance: number;
  
  // Analysis
  is_favorable: boolean;
  root_cause?: string;
  corrective_action?: string;
  responsible_party?: string;
  
  // Status
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  investigation_notes?: string;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CostReport {
  id: string;
  organization_id: string;
  report_name: string;
  report_type: 'cost_center' | 'product' | 'process' | 'activity' | 'variance' | 'profitability';
  
  // Report parameters
  date_range: {
    start_date: string;
    end_date: string;
  };
  filters: {
    cost_centers?: string[];
    products?: string[];
    processes?: string[];
    activities?: string[];
    categories?: string[];
  };
  
  // Report data
  summary: {
    total_costs: number;
    total_revenue: number;
    gross_profit: number;
    gross_margin: number;
    net_profit: number;
    net_margin: number;
  };
  
  // Breakdowns
  by_cost_center: Record<string, number>;
  by_product: Record<string, number>;
  by_process: Record<string, number>;
  by_activity: Record<string, number>;
  by_category: Record<string, number>;
  
  // Export
  export_format: 'pdf' | 'excel' | 'csv' | 'json';
  export_path?: string;
  generated_at: string;
  generated_by: string;
  
  created_at: string;
  updated_at: string;
}

export interface CostAllocationJob {
  id: string;
  organization_id: string;
  job_name: string;
  description?: string;
  
  // Job configuration
  allocation_rules: string[];
  cost_centers: string[];
  period: {
    start_date: string;
    end_date: string;
  };
  
  // Execution
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_step?: string;
  
  // Results
  total_allocated: number;
  allocation_details: Array<{
    source_cost_center: string;
    target_cost_center: string;
    amount: number;
    percentage: number;
  }>;
  
  // Performance
  started_at?: string;
  completed_at?: string;
  execution_time?: number;
  error_message?: string;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Form Types
export interface CostCenterFormData {
  code: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  parent_cost_center_id?: string;
  allocation_method: string;
  allocation_basis?: string;
  allocation_percentage?: number;
  budget_amount: number;
  budget_currency: string;
  budget_period: string;
  cost_center_manager_id?: string;
  location?: string;
  department_id?: string;
}

export interface ActivityFormData {
  code: string;
  name: string;
  description?: string;
  cost_center_id: string;
  type: string;
  category: string;
  cost_driver: {
    type: string;
    name: string;
    unit: string;
    description?: string;
  };
  cost_pool: {
    total_cost: number;
    currency: string;
    allocation_method: string;
    allocation_formula?: string;
  };
  standard_rate: number;
  standard_hours?: number;
  efficiency_target: number;
}

export interface StandardCostFormData {
  product_id: string;
  cost_center_id: string;
  direct_materials: {
    standard_cost: number;
    currency: string;
    bill_of_materials: Array<{
      material_id: string;
      quantity: number;
      unit_cost: number;
    }>;
  };
  direct_labor: {
    standard_cost: number;
    currency: string;
    standard_hours: number;
    labor_rate: number;
    operations: Array<{
      operation_id: string;
      hours: number;
      rate: number;
    }>;
  };
  manufacturing_overhead: {
    standard_cost: number;
    currency: string;
    allocation_basis: string;
    overhead_rate: number;
    activities: Array<{
      activity_id: string;
      driver_quantity: number;
      driver_rate: number;
    }>;
  };
  effective_date: string;
}

export interface ProcessCostFormData {
  process_id: string;
  cost_center_id: string;
  process_name: string;
  process_type: string;
  process_stage: number;
  total_stages: number;
  beginning_wip: {
    materials: number;
    labor: number;
    overhead: number;
  };
  current_period_costs: {
    materials: number;
    labor: number;
    overhead: number;
  };
  ending_wip: {
    materials: number;
    labor: number;
    overhead: number;
    completion_percentage: number;
  };
  units_started: number;
  units_completed: number;
  units_in_process: number;
  period_start: string;
  period_end: string;
}

export interface CostAllocationRuleFormData {
  name: string;
  description?: string;
  source_cost_center_id: string;
  target_cost_center_ids: string[];
  method: string;
  basis: string;
  formula?: string;
  percentages: Array<{
    target_cost_center_id: string;
    percentage: number;
    fixed_amount?: number;
  }>;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  priority: number;
  validation_rules: Array<{
    rule: string;
    error_message: string;
  }>;
}

// Filter Types
export interface CostingFilters {
  cost_center_id?: string;
  product_id?: string;
  process_id?: string;
  activity_id?: string;
  date_from?: string;
  date_to?: string;
  cost_type?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface CostingResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface CostingListResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
  timestamp: string;
}

// Analytics Types
export interface CostingAnalytics {
  // Cost center analytics
  cost_center_performance: {
    cost_center_id: string;
    cost_center_name: string;
    total_costs: number;
    allocated_costs: number;
    efficiency_ratio: number;
    cost_per_unit: number;
    variance_amount: number;
    variance_percentage: number;
  }[];
  
  // Product profitability
  product_profitability: {
    product_id: string;
    product_name: string;
    standard_cost: number;
    actual_cost: number;
    variance: number;
    revenue: number;
    gross_profit: number;
    gross_margin: number;
  }[];
  
  // Process efficiency
  process_efficiency: {
    process_id: string;
    process_name: string;
    total_cost: number;
    units_produced: number;
    cost_per_unit: number;
    efficiency_ratio: number;
    cycle_time: number;
  }[];
  
  // Activity analysis
  activity_analysis: {
    activity_id: string;
    activity_name: string;
    total_cost: number;
    driver_quantity: number;
    driver_rate: number;
    efficiency: number;
    utilization: number;
  }[];
  
  // Variance analysis
  variance_analysis: {
    period: string;
    total_variance: number;
    favorable_variance: number;
    unfavorable_variance: number;
    variance_by_type: Record<string, number>;
    variance_by_cost_center: Record<string, number>;
  };
  
  // Cost trends
  cost_trends: {
    period: string;
    total_costs: number;
    direct_costs: number;
    indirect_costs: number;
    overhead_costs: number;
  }[];
}

// Notification Types
export interface CostingNotification {
  type: 'variance_alert' | 'allocation_complete' | 'standard_cost_update' | 'process_complete' | 'budget_exceeded';
  cost_center_id?: string;
  product_id?: string;
  process_id?: string;
  amount?: number;
  threshold?: number;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
} 