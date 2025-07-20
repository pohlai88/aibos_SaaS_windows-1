// Costing Module Index
// Enterprise-grade costing system for manufacturing operations

// Core Components
export { CostingDashboard } from './components/CostingDashboard';
export { CostCenterForm } from './components/CostCenterForm';
export { ActivityForm } from './components/ActivityForm';
export { StandardCostForm } from './components/StandardCostForm';
export { ProcessCostForm } from './components/ProcessCostForm';
export { CostAllocationRuleForm } from './components/CostAllocationRuleForm';

// Services
export { costingService } from './services/costingService';

// Types
export type {
  CostCenter,
  Activity,
  StandardCost,
  ProcessCost,
  CostVariance,
  CostingAnalytics,
  CostingFilters,
  CostAllocationRule,
  CostDriver,
  BOMItem,
  CostBreakdown,
  ProcessStage,
  CostAllocation,
  AllocationCondition,
  AllocationAction,
  CostCenterFormData,
  ActivityFormData,
  StandardCostFormData,
  ProcessCostFormData,
  CostAllocationRuleFormData,
} from './types/costing';

// Validation Schemas
export {
  costCenterSchema,
  activitySchema,
  standardCostSchema,
  processCostSchema,
  costAllocationRuleSchema,
  costVarianceSchema,
  costingAnalyticsSchema,
  costingFiltersSchema,
} from './validation/costing';

// Constants
export {
  COST_CENTER_TYPES,
  COST_CENTER_TYPE_COLORS,
  COST_CATEGORIES,
  COST_CATEGORY_COLORS,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_COLORS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_CATEGORY_COLORS,
  ALLOCATION_METHODS,
  ALLOCATION_METHOD_COLORS,
  ALLOCATION_BASIS,
  ALLOCATION_BASIS_COLORS,
  VARIANCE_TYPES,
  VARIANCE_TYPE_COLORS,
  PROCESS_STATUS,
  PROCESS_STATUS_COLORS,
  PROCESS_TYPES,
  PROCESS_TYPE_COLORS,
  STANDARD_COST_STATUS,
  STANDARD_COST_STATUS_COLORS,
  RULE_PRIORITIES,
  RULE_PRIORITY_COLORS,
  CURRENCIES,
  COST_DRIVER_TYPES,
  COST_DRIVER_TYPE_COLORS,
  BOM_ITEM_TYPES,
  CONDITION_OPERATORS,
} from './constants/costing';

// Module Configuration
export const COSTING_MODULE_CONFIG = {
  name: 'Costing Management',
  version: '1.0.0',
  description: 'Enterprise-grade costing system for manufacturing operations',
  features: [
    'Cost Center Management',
    'Activity-Based Costing (ABC)',
    'Standard Costing System',
    'Process Costing',
    'Cost Allocation Rules Engine',
    'Variance Analysis',
    'Cost Analytics & Reporting',
    'Bill of Materials (BOM)',
    'Cost Breakdown Analysis',
    'Multi-currency Support',
    'Audit Trail & Compliance',
    'Real-time Cost Tracking',
  ],
  permissions: [
    'costing.view',
    'costing.create',
    'costing.edit',
    'costing.delete',
    'costing.export',
    'costing.reports',
    'costing.analytics',
  ],
  dependencies: [
    'auth-sdk',
    'database',
    'ui-components',
  ],
} as const;

// Default export for the entire module
export default {
  components: {
    CostingDashboard,
    CostCenterForm,
    ActivityForm,
    StandardCostForm,
    ProcessCostForm,
    CostAllocationRuleForm,
  },
  services: {
    costingService,
  },
  config: COSTING_MODULE_CONFIG,
}; 