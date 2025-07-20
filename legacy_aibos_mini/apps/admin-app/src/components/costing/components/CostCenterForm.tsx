'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Building, 
  DollarSign, 
  Calculator, 
  Users, 
  MapPin, 
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { costCenterSchema } from '../validation/costing';
import { 
  COST_CENTER_TYPES, 
  COST_CENTER_TYPE_COLORS,
  COST_CATEGORIES,
  COST_CATEGORY_COLORS,
  ALLOCATION_METHODS,
  ALLOCATION_METHOD_COLORS,
  CURRENCIES,
  COST_CENTER_STATUS
} from '../constants/costing';
import type { CostCenter, CostCenterFormData } from '../types/costing';

interface CostCenterFormProps {
  costCenter?: CostCenter;
  onSubmit: (data: CostCenterFormData) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  isEdit?: boolean;
}

export const CostCenterForm: React.FC<CostCenterFormProps> = ({
  costCenter,
  onSubmit,
  onCancel,
  organizationId,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [suggestedCode, setSuggestedCode] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<CostCenterFormData>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: costCenter ? {
      code: costCenter.code,
      name: costCenter.name,
      description: costCenter.description,
      type: costCenter.type,
      category: costCenter.category,
      parent_cost_center_id: costCenter.parent_cost_center_id,
      manager_id: costCenter.manager_id,
      budget_amount: costCenter.budget_amount,
      budget_currency: costCenter.budget_currency,
      budget_period: costCenter.budget_period,
      allocation_method: costCenter.allocation_method,
      allocation_basis: costCenter.allocation_basis,
      is_profit_center: costCenter.is_profit_center,
      is_investment_center: costCenter.is_investment_center,
      location: costCenter.location,
      department: costCenter.department,
      cost_drivers: costCenter.cost_drivers,
      cost_pools: costCenter.cost_pools,
      is_active: costCenter.is_active,
      effective_date: costCenter.effective_date,
      expiry_date: costCenter.expiry_date,
      notes: costCenter.notes,
    } : {
      code: '',
      name: '',
      description: '',
      type: 'production',
      category: 'direct',
      parent_cost_center_id: undefined,
      manager_id: undefined,
      budget_amount: 0,
      budget_currency: 'MYR',
      budget_period: 'monthly',
      allocation_method: 'direct',
      allocation_basis: 'headcount',
      is_profit_center: false,
      is_investment_center: false,
      location: '',
      department: '',
      cost_drivers: [],
      cost_pools: [],
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: undefined,
      notes: '',
    },
  });

  const watchedType = watch('type');
  const watchedCategory = watch('category');
  const watchedAllocationMethod = watch('allocation_method');

  // Generate suggested code
  useEffect(() => {
    if (!isEdit && watchedType && watchedCategory) {
      const typePrefix = watchedType.substring(0, 3).toUpperCase();
      const categoryPrefix = watchedCategory.substring(0, 2).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      setSuggestedCode(`${typePrefix}${categoryPrefix}${timestamp}`);
    }
  }, [watchedType, watchedCategory, isEdit]);

  // Auto-fill suggested code
  useEffect(() => {
    if (suggestedCode && !watch('code')) {
      setValue('code', suggestedCode);
    }
  }, [suggestedCode, setValue, watch]);

  // Business logic validation
  const validateBusinessRules = async (data: CostCenterFormData): Promise<string[]> => {
    const errors: string[] = [];

    // Check if cost center code is unique
    if (data.code) {
      try {
        // This would call the API to check uniqueness
        // const isUnique = await costingService.checkCostCenterCodeUnique(data.code, organizationId);
        // if (!isUnique) {
        //   errors.push('Cost center code must be unique within the organization');
        // }
      } catch (error) {
        console.error('Error checking code uniqueness:', error);
      }
    }

    // Validate budget amount based on type
    if (data.type === 'production' && data.budget_amount < 1000) {
      errors.push('Production cost centers should have a minimum budget of MYR 1,000');
    }

    // Validate allocation method based on category
    if (data.category === 'indirect' && data.allocation_method === 'direct') {
      errors.push('Indirect cost centers cannot use direct allocation method');
    }

    // Validate profit center settings
    if (data.is_profit_center && data.type === 'service') {
      errors.push('Service cost centers cannot be profit centers');
    }

    // Validate investment center settings
    if (data.is_investment_center && !data.is_profit_center) {
      errors.push('Investment centers must also be profit centers');
    }

    // Validate effective and expiry dates
    if (data.effective_date && data.expiry_date) {
      const effectiveDate = new Date(data.effective_date);
      const expiryDate = new Date(data.expiry_date);
      if (effectiveDate >= expiryDate) {
        errors.push('Expiry date must be after effective date');
      }
    }

    // Validate cost drivers based on type
    if (data.type === 'production' && data.cost_drivers.length === 0) {
      errors.push('Production cost centers must have at least one cost driver');
    }

    return errors;
  };

  // Handle form submission
  const handleFormSubmit = async (data: CostCenterFormData) => {
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
        created_by: 'current_user_id', // This would come from auth context
        updated_by: 'current_user_id',
      };

      await onSubmit(submissionData);
      toast.success(`Cost center ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} cost center`);
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    reset();
    setValidationErrors([]);
    toast.success('Form reset successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Cost Center' : 'New Cost Center'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update cost center details and settings' : 'Create a new cost center for cost allocation and analysis'}
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
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Center Code *
              </label>
              <div className="relative">
                <Input
                  {...register('code')}
                  placeholder="e.g., PROD001"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {suggestedCode && !isEdit && (
                  <button
                    type="button"
                    onClick={() => setValue('code', suggestedCode)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use: {suggestedCode}
                  </button>
                )}
              </div>
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Center Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Production Line A"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(COST_CENTER_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(COST_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe the purpose and scope of this cost center..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Budget Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Budget Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Budget Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Amount *
              </label>
              <Input
                {...register('budget_amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={errors.budget_amount ? 'border-red-500' : ''}
              />
              {errors.budget_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.budget_amount.message}</p>
              )}
            </div>

            {/* Budget Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency *
              </label>
              <select
                {...register('budget_currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              {errors.budget_currency && (
                <p className="mt-1 text-sm text-red-600">{errors.budget_currency.message}</p>
              )}
            </div>

            {/* Budget Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Period *
              </label>
              <select
                {...register('budget_period')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
              {errors.budget_period && (
                <p className="mt-1 text-sm text-red-600">{errors.budget_period.message}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="headcount">Headcount</option>
                <option value="floor_space">Floor Space</option>
                <option value="machine_hours">Machine Hours</option>
                <option value="labor_hours">Labor Hours</option>
                <option value="revenue">Revenue</option>
                <option value="direct_costs">Direct Costs</option>
              </select>
              {errors.allocation_basis && (
                <p className="mt-1 text-sm text-red-600">{errors.allocation_basis.message}</p>
              )}
            </div>
          </div>

          {/* Center Type Flags */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_profit_center')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Profit Center
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_investment_center')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Investment Center
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Location and Organization */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location & Organization
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <Input
                {...register('location')}
                placeholder="e.g., Building A, Floor 2"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <Input
                {...register('department')}
                placeholder="e.g., Manufacturing"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>
          </div>
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
            placeholder="Add any additional notes, special instructions, or comments..."
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
                <span>{isEdit ? 'Update Cost Center' : 'Create Cost Center'}</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 