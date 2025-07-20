'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calculator, 
  Settings, 
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Code,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Table } from '@/components/ui/Table';

import { costAllocationRuleSchema } from '../validation/costing';
import { 
  ALLOCATION_METHODS, 
  ALLOCATION_METHOD_COLORS,
  ALLOCATION_BASIS,
  ALLOCATION_BASIS_COLORS,
  RULE_PRIORITIES,
  RULE_PRIORITY_COLORS,
  CURRENCIES,
  CONDITION_OPERATORS
} from '../constants/costing';
import type { 
  CostAllocationRule, 
  CostAllocationRuleFormData, 
  CostCenter,
  AllocationCondition,
  AllocationAction
} from '../types/costing';

interface CostAllocationRuleFormProps {
  allocationRule?: CostAllocationRule;
  onSubmit: (data: CostAllocationRuleFormData) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  costCenters: CostCenter[];
  isEdit?: boolean;
}

export const CostAllocationRuleForm: React.FC<CostAllocationRuleFormProps> = ({
  allocationRule,
  onSubmit,
  onCancel,
  organizationId,
  costCenters,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [conditions, setConditions] = useState<AllocationCondition[]>([]);
  const [actions, setActions] = useState<AllocationAction[]>([]);
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<CostAllocationRuleFormData>({
    resolver: zodResolver(costAllocationRuleSchema),
    defaultValues: allocationRule ? {
      rule_name: allocationRule.rule_name,
      rule_description: allocationRule.rule_description,
      source_cost_center_id: allocationRule.source_cost_center_id,
      target_cost_center_id: allocationRule.target_cost_center_id,
      allocation_method: allocationRule.allocation_method,
      allocation_basis: allocationRule.allocation_basis,
      allocation_percentage: allocationRule.allocation_percentage,
      allocation_amount: allocationRule.allocation_amount,
      currency: allocationRule.currency,
      priority: allocationRule.priority,
      is_active: allocationRule.is_active,
      effective_date: allocationRule.effective_date,
      expiry_date: allocationRule.expiry_date,
      conditions: allocationRule.conditions,
      actions: allocationRule.actions,
      notes: allocationRule.notes,
    } : {
      rule_name: '',
      rule_description: '',
      source_cost_center_id: '',
      target_cost_center_id: '',
      allocation_method: 'percentage',
      allocation_basis: 'headcount',
      allocation_percentage: 0,
      allocation_amount: 0,
      currency: 'MYR',
      priority: 'medium',
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: undefined,
      conditions: [],
      actions: [],
      notes: '',
    },
  });

  const watchedAllocationMethod = watch('allocation_method');
  const watchedCurrency = watch('currency');

  // Business logic validation
  const validateBusinessRules = async (data: CostAllocationRuleFormData): Promise<string[]> => {
    const errors: string[] = [];

    // Check if rule name is unique
    if (data.rule_name) {
      try {
        // This would call the API to check uniqueness
        // const isUnique = await costingService.checkRuleNameUnique(data.rule_name, organizationId);
        // if (!isUnique && !isEdit) {
        //   errors.push('Rule name must be unique within the organization');
        // }
      } catch (error) {
        console.error('Error checking rule name uniqueness:', error);
      }
    }

    // Validate source and target cost centers
    if (data.source_cost_center_id === data.target_cost_center_id) {
      errors.push('Source and target cost centers cannot be the same');
    }

    // Validate allocation percentage
    if (data.allocation_method === 'percentage' && (data.allocation_percentage <= 0 || data.allocation_percentage > 100)) {
      errors.push('Allocation percentage must be between 0 and 100');
    }

    // Validate allocation amount
    if (data.allocation_method === 'amount' && data.allocation_amount <= 0) {
      errors.push('Allocation amount must be greater than zero');
    }

    // Validate conditions
    if (data.conditions.length === 0) {
      errors.push('At least one condition is required');
    }

    // Validate actions
    if (data.actions.length === 0) {
      errors.push('At least one action is required');
    }

    // Validate effective and expiry dates
    if (data.effective_date && data.expiry_date) {
      const effectiveDate = new Date(data.effective_date);
      const expiryDate = new Date(data.expiry_date);
      if (effectiveDate >= expiryDate) {
        errors.push('Expiry date must be after effective date');
      }
    }

    return errors;
  };

  // Handle form submission
  const handleFormSubmit = async (data: CostAllocationRuleFormData) => {
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
        conditions,
        actions,
        created_by: 'current_user_id', // This would come from auth context
        updated_by: 'current_user_id',
      };

      await onSubmit(submissionData);
      toast.success(`Allocation rule ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} allocation rule`);
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    reset();
    setConditions([]);
    setActions([]);
    setValidationErrors([]);
    toast.success('Form reset successfully');
  };

  // Add condition
  const handleAddCondition = () => {
    const newCondition: AllocationCondition = {
      id: `condition_${Date.now()}`,
      field: 'cost_amount',
      operator: 'greater_than',
      value: 0,
      logical_operator: 'AND',
      is_active: true,
    };
    setConditions([...conditions, newCondition]);
  };

  // Remove condition
  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  // Update condition
  const handleUpdateCondition = (id: string, field: keyof AllocationCondition, value: any) => {
    setConditions(conditions.map(condition => {
      if (condition.id === id) {
        return { ...condition, [field]: value };
      }
      return condition;
    }));
  };

  // Add action
  const handleAddAction = () => {
    const newAction: AllocationAction = {
      id: `action_${Date.now()}`,
      action_type: 'allocate_cost',
      target_field: 'cost_center_id',
      value: '',
      parameters: {},
      is_active: true,
    };
    setActions([...actions, newAction]);
  };

  // Remove action
  const handleRemoveAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  // Update action
  const handleUpdateAction = (id: string, field: keyof AllocationAction, value: any) => {
    setActions(actions.map(action => {
      if (action.id === id) {
        return { ...action, [field]: value };
      }
      return action;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
          <Calculator className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Cost Allocation Rule' : 'New Cost Allocation Rule'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update allocation rule conditions and actions' : 'Create a new cost allocation rule for automated cost distribution'}
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
            {/* Rule Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rule Name *
              </label>
              <Input
                {...register('rule_name')}
                placeholder="e.g., Production Overhead Allocation"
                className={errors.rule_name ? 'border-red-500' : ''}
              />
              {errors.rule_name && (
                <p className="mt-1 text-sm text-red-600">{errors.rule_name.message}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority *
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(RULE_PRIORITIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rule Description
              </label>
              <textarea
                {...register('rule_description')}
                rows={3}
                placeholder="Describe the purpose and logic of this allocation rule..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              {errors.rule_description && (
                <p className="mt-1 text-sm text-red-600">{errors.rule_description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cost Centers */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Cost Centers
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Cost Center */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Cost Center *
              </label>
              <select
                {...register('source_cost_center_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Source Cost Center</option>
                {costCenters
                  .filter(cc => cc.is_active)
                  .map((costCenter) => (
                    <option key={costCenter.id} value={costCenter.id}>
                      {costCenter.code} - {costCenter.name}
                    </option>
                  ))}
              </select>
              {errors.source_cost_center_id && (
                <p className="mt-1 text-sm text-red-600">{errors.source_cost_center_id.message}</p>
              )}
            </div>

            {/* Target Cost Center */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Cost Center *
              </label>
              <select
                {...register('target_cost_center_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Target Cost Center</option>
                {costCenters
                  .filter(cc => cc.is_active)
                  .map((costCenter) => (
                    <option key={costCenter.id} value={costCenter.id}>
                      {costCenter.code} - {costCenter.name}
                    </option>
                  ))}
              </select>
              {errors.target_cost_center_id && (
                <p className="mt-1 text-sm text-red-600">{errors.target_cost_center_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Allocation Settings */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Allocation Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Allocation Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allocation Method *
              </label>
              <select
                {...register('allocation_method')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(ALLOCATION_METHODS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.allocation_method && (
                <p className="mt-1 text-sm text-red-600">{errors.allocation_method.message}</p>
              )}
            </div>

            {/* Allocation Basis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allocation Basis *
              </label>
              <select
                {...register('allocation_basis')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(ALLOCATION_BASIS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.allocation_basis && (
                <p className="mt-1 text-sm text-red-600">{errors.allocation_basis.message}</p>
              )}
            </div>

            {/* Allocation Percentage */}
            {watchedAllocationMethod === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allocation Percentage *
                </label>
                <div className="relative">
                  <Input
                    {...register('allocation_percentage', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    className={errors.allocation_percentage ? 'border-red-500' : ''}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                {errors.allocation_percentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.allocation_percentage.message}</p>
                )}
              </div>
            )}

            {/* Allocation Amount */}
            {watchedAllocationMethod === 'amount' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allocation Amount *
                </label>
                <div className="relative">
                  <Input
                    {...register('allocation_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={errors.allocation_amount ? 'border-red-500' : ''}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">
                      {watchedCurrency}
                    </span>
                  </div>
                </div>
                {errors.allocation_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.allocation_amount.message}</p>
                )}
              </div>
            )}

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

        {/* Conditions */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Conditions
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCondition}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>
          
          {conditions.length > 0 ? (
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {index > 0 && (
                    <select
                      value={condition.logical_operator}
                      onChange={(e) => handleUpdateCondition(condition.id, 'logical_operator', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  
                  <select
                    value={condition.field}
                    onChange={(e) => handleUpdateCondition(condition.id, 'field', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="cost_amount">Cost Amount</option>
                    <option value="cost_center_type">Cost Center Type</option>
                    <option value="cost_category">Cost Category</option>
                    <option value="date_range">Date Range</option>
                    <option value="budget_variance">Budget Variance</option>
                  </select>
                  
                  <select
                    value={condition.operator}
                    onChange={(e) => handleUpdateCondition(condition.id, 'operator', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.entries(CONDITION_OPERATORS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                  
                  <Input
                    type="text"
                    value={condition.value}
                    onChange={(e) => handleUpdateCondition(condition.id, 'value', e.target.value)}
                    placeholder="Value"
                    className="w-32"
                  />
                  
                  <input
                    type="checkbox"
                    checked={condition.is_active}
                    onChange={(e) => handleUpdateCondition(condition.id, 'is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCondition(condition.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No conditions added yet
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Actions
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAction}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Action
            </Button>
          </div>
          
          {actions.length > 0 ? (
            <div className="space-y-4">
              {actions.map((action, index) => (
                <div key={action.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <select
                    value={action.action_type}
                    onChange={(e) => handleUpdateAction(action.id, 'action_type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="allocate_cost">Allocate Cost</option>
                    <option value="set_field">Set Field</option>
                    <option value="calculate_amount">Calculate Amount</option>
                    <option value="send_notification">Send Notification</option>
                  </select>
                  
                  <select
                    value={action.target_field}
                    onChange={(e) => handleUpdateAction(action.id, 'target_field', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="cost_center_id">Cost Center</option>
                    <option value="allocation_amount">Allocation Amount</option>
                    <option value="allocation_percentage">Allocation Percentage</option>
                    <option value="status">Status</option>
                  </select>
                  
                  <Input
                    type="text"
                    value={action.value}
                    onChange={(e) => handleUpdateAction(action.id, 'value', e.target.value)}
                    placeholder="Value"
                    className="w-32"
                  />
                  
                  <input
                    type="checkbox"
                    checked={action.is_active}
                    onChange={(e) => handleUpdateAction(action.id, 'is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAction(action.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No actions added yet
              </p>
            </div>
          )}
        </div>

        {/* Dates and Status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Dates & Status
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Effective Date *
              </label>
              <Input
                {...register('effective_date')}
                type="date"
                className={errors.effective_date ? 'border-red-500' : ''}
              />
              {errors.effective_date && (
                <p className="mt-1 text-sm text-red-600">{errors.effective_date.message}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <Input
                {...register('expiry_date')}
                type="date"
                className={errors.expiry_date ? 'border-red-500' : ''}
              />
              {errors.expiry_date && (
                <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register('is_active')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
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
            placeholder="Add any additional notes, rule logic explanations, or comments..."
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
                <span>{isEdit ? 'Update Allocation Rule' : 'Create Allocation Rule'}</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 