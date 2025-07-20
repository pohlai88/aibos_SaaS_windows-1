'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Layers, 
  DollarSign, 
  Calculator, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Table } from '@/components/ui/Table';

import { processCostSchema } from '../validation/costing';
import { 
  PROCESS_STATUS,
  PROCESS_STATUS_COLORS,
  PROCESS_TYPES,
  PROCESS_TYPE_COLORS,
  CURRENCIES,
  COST_CATEGORIES
} from '../constants/costing';
import type { 
  ProcessCost, 
  ProcessCostFormData, 
  CostCenter,
  ProcessStage,
  CostAllocation
} from '../types/costing';

interface ProcessCostFormProps {
  processCost?: ProcessCost;
  onSubmit: (data: ProcessCostFormData) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  costCenters: CostCenter[];
  isEdit?: boolean;
}

export const ProcessCostForm: React.FC<ProcessCostFormProps> = ({
  processCost,
  onSubmit,
  onCancel,
  organizationId,
  costCenters,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [processStages, setProcessStages] = useState<ProcessStage[]>([]);
  const [costAllocations, setCostAllocations] = useState<CostAllocation[]>([]);
  const [showStageForm, setShowStageForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<ProcessCostFormData>({
    resolver: zodResolver(processCostSchema),
    defaultValues: processCost ? {
      process_name: processCost.process_name,
      process_type: processCost.process_type,
      cost_center_id: processCost.cost_center_id,
      total_stages: processCost.total_stages,
      current_stage: processCost.current_stage,
      units_started: processCost.units_started,
      units_completed: processCost.units_completed,
      units_in_progress: processCost.units_in_progress,
      units_scrapped: processCost.units_scrapped,
      currency: processCost.currency,
      current_period_costs: processCost.current_period_costs,
      cost_per_equivalent_unit: processCost.cost_per_equivalent_unit,
      total_costs_to_date: processCost.total_costs_to_date,
      status: processCost.status,
      process_stages: processCost.process_stages,
      cost_allocations: processCost.cost_allocations,
      notes: processCost.notes,
    } : {
      process_name: '',
      process_type: 'continuous',
      cost_center_id: '',
      total_stages: 1,
      current_stage: 1,
      units_started: 0,
      units_completed: 0,
      units_in_progress: 0,
      units_scrapped: 0,
      currency: 'MYR',
      current_period_costs: {
        direct_material: 0,
        direct_labor: 0,
        manufacturing_overhead: 0,
        total: 0,
      },
      cost_per_equivalent_unit: {
        direct_material: 0,
        direct_labor: 0,
        manufacturing_overhead: 0,
        total: 0,
      },
      total_costs_to_date: {
        direct_material: 0,
        direct_labor: 0,
        manufacturing_overhead: 0,
        total: 0,
      },
      status: 'in_progress',
      process_stages: [],
      cost_allocations: [],
      notes: '',
    },
  });

  const watchedProcessType = watch('process_type');
  const watchedTotalStages = watch('total_stages');
  const watchedCurrency = watch('currency');

  // Initialize process stages when total stages changes
  useEffect(() => {
    if (watchedTotalStages > 0) {
      const stages: ProcessStage[] = [];
      for (let i = 1; i <= watchedTotalStages; i++) {
        stages.push({
          id: `stage_${i}`,
          stage_number: i,
          stage_name: `Stage ${i}`,
          completion_percentage: 0,
          units_in_stage: 0,
          equivalent_units: 0,
          costs_incurred: {
            direct_material: 0,
            direct_labor: 0,
            manufacturing_overhead: 0,
            total: 0,
          },
          is_completed: false,
        });
      }
      setProcessStages(stages);
    }
  }, [watchedTotalStages]);

  // Calculate equivalent units and costs
  useEffect(() => {
    if (processStages.length > 0) {
      const totalEquivalentUnits = processStages.reduce((sum, stage) => sum + stage.equivalent_units, 0);
      const totalCurrentCosts = watch('current_period_costs');
      
      if (totalEquivalentUnits > 0) {
        const costPerUnit = {
          direct_material: totalCurrentCosts.direct_material / totalEquivalentUnits,
          direct_labor: totalCurrentCosts.direct_labor / totalEquivalentUnits,
          manufacturing_overhead: totalCurrentCosts.manufacturing_overhead / totalEquivalentUnits,
          total: totalCurrentCosts.total / totalEquivalentUnits,
        };
        
        setValue('cost_per_equivalent_unit', costPerUnit);
      }
    }
  }, [processStages, watch, setValue]);

  // Business logic validation
  const validateBusinessRules = async (data: ProcessCostFormData): Promise<string[]> => {
    const errors: string[] = [];

    // Check if process name is unique
    if (data.process_name) {
      try {
        // This would call the API to check uniqueness
        // const isUnique = await costingService.checkProcessNameUnique(data.process_name, organizationId);
        // if (!isUnique && !isEdit) {
        //   errors.push('Process name must be unique within the organization');
        // }
      } catch (error) {
        console.error('Error checking process name uniqueness:', error);
      }
    }

    // Validate units
    if (data.units_started < data.units_completed + data.units_scrapped) {
      errors.push('Units started must be greater than or equal to units completed plus units scrapped');
    }

    if (data.units_in_progress < 0) {
      errors.push('Units in progress cannot be negative');
    }

    // Validate stages
    if (data.total_stages < 1) {
      errors.push('Total stages must be at least 1');
    }

    if (data.current_stage > data.total_stages) {
      errors.push('Current stage cannot exceed total stages');
    }

    // Validate costs
    if (data.current_period_costs.total < 0) {
      errors.push('Current period costs cannot be negative');
    }

    // Validate process stages
    if (data.process_stages.length === 0) {
      errors.push('At least one process stage is required');
    }

    // Validate cost center selection
    if (!data.cost_center_id) {
      errors.push('Cost center must be selected');
    }

    return errors;
  };

  // Handle form submission
  const handleFormSubmit = async (data: ProcessCostFormData) => {
    setIsSubmitting(true);
    setIsValidating(true);

    try {
      // Validate business rules
      const businessErrors = await validateBusinessRules(data);
      if (businessErrors.length > 0) {
        setValidationErrors(businessErrors);
        setIsValidating(false);
        setIsSubmitting(false);
        return;
      }

      setValidationErrors([]);
      
      // Prepare submission data
      const submissionData = {
        ...data,
        organization_id: organizationId,
        process_stages,
        cost_allocations,
        created_by: 'current_user_id', // This would come from auth context
        updated_by: 'current_user_id',
      };

      await onSubmit(submissionData);
      toast.success(`Process cost ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} process cost`);
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    reset();
    setProcessStages([]);
    setCostAllocations([]);
    setValidationErrors([]);
    toast.success('Form reset successfully');
  };

  // Update process stage
  const handleUpdateStage = (stageId: string, field: keyof ProcessStage, value: any) => {
    setProcessStages(stages => stages.map(stage => {
      if (stage.id === stageId) {
        const updatedStage = { ...stage, [field]: value };
        
        // Recalculate equivalent units based on completion percentage
        if (field === 'completion_percentage' || field === 'units_in_stage') {
          updatedStage.equivalent_units = (updatedStage.units_in_stage * updatedStage.completion_percentage) / 100;
        }
        
        return updatedStage;
      }
      return stage;
    }));
  };

  // Add cost allocation
  const handleAddCostAllocation = () => {
    const newAllocation: CostAllocation = {
      id: `allocation_${Date.now()}`,
      cost_category: 'direct_material',
      amount: 0,
      currency: watchedCurrency,
      allocation_method: 'direct',
      allocation_basis: 'units',
      description: '',
    };
    setCostAllocations([...costAllocations, newAllocation]);
  };

  // Remove cost allocation
  const handleRemoveCostAllocation = (id: string) => {
    setCostAllocations(costAllocations.filter(allocation => allocation.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <Layers className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Process Cost' : 'New Process Cost'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update process cost details and stage management' : 'Create a new process cost for continuous manufacturing'}
          </p>
        </div>
      </div>

      {/* Business Rule Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Business Rule Violations
              </h4>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Basic Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Process Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Process Name *
              </label>
              <Input
                {...register('process_name')}
                placeholder="e.g., Chemical Processing Line A"
                className={errors.process_name ? 'border-red-500' : ''}
              />
              {errors.process_name && (
                <p className="mt-1 text-sm text-red-600">{errors.process_name.message}</p>
              )}
            </div>

            {/* Process Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Process Type *
              </label>
              <select
                {...register('process_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(PROCESS_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.process_type && (
                <p className="mt-1 text-sm text-red-600">{errors.process_type.message}</p>
              )}
            </div>

            {/* Cost Center */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Center *
              </label>
              <select
                {...register('cost_center_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Cost Center</option>
                {costCenters
                  .filter(cc => cc.is_active)
                  .map((costCenter) => (
                    <option key={costCenter.id} value={costCenter.id}>
                      {costCenter.code} - {costCenter.name}
                    </option>
                  ))}
              </select>
              {errors.cost_center_id && (
                <p className="mt-1 text-sm text-red-600">{errors.cost_center_id.message}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency *
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Process Stages Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Process Stages Configuration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Stages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Stages *
              </label>
              <Input
                {...register('total_stages', { valueAsNumber: true })}
                type="number"
                min="1"
                max="20"
                placeholder="1"
                className={errors.total_stages ? 'border-red-500' : ''}
              />
              {errors.total_stages && (
                <p className="mt-1 text-sm text-red-600">{errors.total_stages.message}</p>
              )}
            </div>

            {/* Current Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Stage *
              </label>
              <Input
                {...register('current_stage', { valueAsNumber: true })}
                type="number"
                min="1"
                max={watchedTotalStages}
                placeholder="1"
                className={errors.current_stage ? 'border-red-500' : ''}
              />
              {errors.current_stage && (
                <p className="mt-1 text-sm text-red-600">{errors.current_stage.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(PROCESS_STATUS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Process Stages Table */}
          {processStages.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Stage Name</th>
                    <th>Completion %</th>
                    <th>Units in Stage</th>
                    <th>Equivalent Units</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {processStages.map((stage) => (
                    <tr key={stage.id}>
                      <td className="font-medium">{stage.stage_number}</td>
                      <td>
                        <Input
                          value={stage.stage_name}
                          onChange={(e) => handleUpdateStage(stage.id, 'stage_name', e.target.value)}
                          placeholder="Stage Name"
                          className="w-32"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={stage.completion_percentage}
                          onChange={(e) => handleUpdateStage(stage.id, 'completion_percentage', parseFloat(e.target.value))}
                          className="w-20"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={stage.units_in_stage}
                          onChange={(e) => handleUpdateStage(stage.id, 'units_in_stage', parseInt(e.target.value))}
                          className="w-20"
                        />
                      </td>
                      <td className="font-medium">
                        {stage.equivalent_units.toFixed(2)}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={stage.is_completed}
                          onChange={(e) => handleUpdateStage(stage.id, 'is_completed', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Units Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Units Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Units Started */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Units Started *
              </label>
              <Input
                {...register('units_started', { valueAsNumber: true })}
                type="number"
                step="1"
                min="0"
                placeholder="0"
                className={errors.units_started ? 'border-red-500' : ''}
              />
              {errors.units_started && (
                <p className="mt-1 text-sm text-red-600">{errors.units_started.message}</p>
              )}
            </div>

            {/* Units Completed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Units Completed *
              </label>
              <Input
                {...register('units_completed', { valueAsNumber: true })}
                type="number"
                step="1"
                min="0"
                placeholder="0"
                className={errors.units_completed ? 'border-red-500' : ''}
              />
              {errors.units_completed && (
                <p className="mt-1 text-sm text-red-600">{errors.units_completed.message}</p>
              )}
            </div>

            {/* Units In Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Units In Progress
              </label>
              <Input
                {...register('units_in_progress', { valueAsNumber: true })}
                type="number"
                step="1"
                min="0"
                placeholder="0"
                className={errors.units_in_progress ? 'border-red-500' : ''}
              />
              {errors.units_in_progress && (
                <p className="mt-1 text-sm text-red-600">{errors.units_in_progress.message}</p>
              )}
            </div>

            {/* Units Scrapped */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Units Scrapped
              </label>
              <Input
                {...register('units_scrapped', { valueAsNumber: true })}
                type="number"
                step="1"
                min="0"
                placeholder="0"
                className={errors.units_scrapped ? 'border-red-500' : ''}
              />
              {errors.units_scrapped && (
                <p className="mt-1 text-sm text-red-600">{errors.units_scrapped.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Period Costs */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Current Period Costs
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Direct Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direct Material
              </label>
              <div className="relative">
                <Input
                  {...register('current_period_costs.direct_material', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Labor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direct Labor
              </label>
              <div className="relative">
                <Input
                  {...register('current_period_costs.direct_labor', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Manufacturing Overhead */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manufacturing Overhead
              </label>
              <div className="relative">
                <Input
                  {...register('current_period_costs.manufacturing_overhead', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total
              </label>
              <div className="relative">
                <Input
                  {...register('current_period_costs.total', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Per Equivalent Unit */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Cost Per Equivalent Unit
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Direct Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direct Material
              </label>
              <div className="relative">
                <Input
                  {...register('cost_per_equivalent_unit.direct_material', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Labor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direct Labor
              </label>
              <div className="relative">
                <Input
                  {...register('cost_per_equivalent_unit.direct_labor', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Manufacturing Overhead */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manufacturing Overhead
              </label>
              <div className="relative">
                <Input
                  {...register('cost_per_equivalent_unit.manufacturing_overhead', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total
              </label>
              <div className="relative">
                <Input
                  {...register('cost_per_equivalent_unit.total', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Additional Notes
          </h4>
          
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Add any additional notes, process details, or comments..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {isValidating && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <LoadingSpinner size="sm" />
                <span>Validating...</span>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting || isValidating || !isValid}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <span>{isEdit ? 'Update Process Cost' : 'Create Process Cost'}</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 