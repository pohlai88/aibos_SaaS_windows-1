'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Activity, 
  DollarSign, 
  Calculator, 
  Target, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { activitySchema } from '../validation/costing';
import { 
  ACTIVITY_TYPES, 
  ACTIVITY_TYPE_COLORS,
  ACTIVITY_CATEGORIES,
  ACTIVITY_CATEGORY_COLORS,
  COST_DRIVER_TYPES,
  COST_DRIVER_TYPE_COLORS,
  CURRENCIES,
  ACTIVITY_STATUS
} from '../constants/costing';
import type { Activity, ActivityFormData, CostCenter, CostDriver } from '../types/costing';

interface ActivityFormProps {
  activity?: Activity;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  costCenters: CostCenter[];
  isEdit?: boolean;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  onSubmit,
  onCancel,
  organizationId,
  costCenters,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [suggestedCode, setSuggestedCode] = useState<string>('');
  const [costDrivers, setCostDrivers] = useState<CostDriver[]>([]);
  const [showCostDriverForm, setShowCostDriverForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity ? {
      code: activity.code,
      name: activity.name,
      description: activity.description,
      type: activity.type,
      category: activity.category,
      cost_center_id: activity.cost_center_id,
      cost_driver_id: activity.cost_driver_id,
      standard_rate: activity.standard_rate,
      currency: activity.currency,
      capacity: activity.capacity,
      capacity_unit: activity.capacity_unit,
      efficiency_target: activity.efficiency_target,
      quality_target: activity.quality_target,
      lead_time: activity.lead_time,
      setup_time: activity.setup_time,
      cycle_time: activity.cycle_time,
      cost_pool_id: activity.cost_pool_id,
      is_bottleneck: activity.is_bottleneck,
      is_critical_path: activity.is_critical_path,
      is_active: activity.is_active,
      effective_date: activity.effective_date,
      expiry_date: activity.expiry_date,
      notes: activity.notes,
    } : {
      code: '',
      name: '',
      description: '',
      type: 'production',
      category: 'direct',
      cost_center_id: '',
      cost_driver_id: '',
      standard_rate: 0,
      currency: 'MYR',
      capacity: 0,
      capacity_unit: 'hours',
      efficiency_target: 85,
      quality_target: 99,
      lead_time: 0,
      setup_time: 0,
      cycle_time: 0,
      cost_pool_id: '',
      is_bottleneck: false,
      is_critical_path: false,
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: undefined,
      notes: '',
    },
  });

  const watchedType = watch('type');
  const watchedCategory = watch('category');
  const watchedCostCenterId = watch('cost_center_id');

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

  // Load cost drivers for selected cost center
  useEffect(() => {
    if (watchedCostCenterId) {
      // This would load cost drivers for the selected cost center
      // For now, we'll create some sample cost drivers
      const sampleCostDrivers: CostDriver[] = [
        {
          id: 'cd1',
          name: 'Machine Hours',
          type: 'volume',
          unit: 'hours',
          description: 'Machine operating hours',
          is_active: true,
        },
        {
          id: 'cd2',
          name: 'Labor Hours',
          type: 'volume',
          unit: 'hours',
          description: 'Direct labor hours',
          is_active: true,
        },
        {
          id: 'cd3',
          name: 'Setup Count',
          type: 'transaction',
          unit: 'count',
          description: 'Number of setups',
          is_active: true,
        },
      ];
      setCostDrivers(sampleCostDrivers);
    }
  }, [watchedCostCenterId]);

  // Business logic validation
  const validateBusinessRules = async (data: ActivityFormData): Promise<string[]> => {
    const errors: string[] = [];

    // Check if activity code is unique
    if (data.code) {
      try {
        // This would call the API to check uniqueness
        // const isUnique = await costingService.checkActivityCodeUnique(data.code, organizationId);
        // if (!isUnique) {
        //   errors.push('Activity code must be unique within the organization');
        // }
      } catch (error) {
        console.error('Error checking code uniqueness:', error);
      }
    }

    // Validate standard rate based on type
    if (data.type === 'production' && data.standard_rate < 10) {
      errors.push('Production activities should have a minimum standard rate of MYR 10 per unit');
    }

    // Validate efficiency target
    if (data.efficiency_target < 50 || data.efficiency_target > 100) {
      errors.push('Efficiency target must be between 50% and 100%');
    }

    // Validate quality target
    if (data.quality_target < 90 || data.quality_target > 100) {
      errors.push('Quality target must be between 90% and 100%');
    }

    // Validate capacity
    if (data.capacity <= 0) {
      errors.push('Capacity must be greater than zero');
    }

    // Validate times
    if (data.setup_time < 0 || data.cycle_time < 0 || data.lead_time < 0) {
      errors.push('Setup time, cycle time, and lead time must be non-negative');
    }

    // Validate cost center selection
    if (!data.cost_center_id) {
      errors.push('Cost center must be selected');
    }

    // Validate cost driver selection
    if (!data.cost_driver_id) {
      errors.push('Cost driver must be selected');
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
  const handleFormSubmit = async (data: ActivityFormData) => {
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
      toast.success(`Activity ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} activity`);
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
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <Activity className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Activity' : 'New Activity'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update activity details and cost driver settings' : 'Create a new activity for cost allocation and analysis'}
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
                Activity Code *
              </label>
              <div className="relative">
                <Input
                  {...register('code')}
                  placeholder="e.g., ACT001"
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
                Activity Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Assembly Line Operation"
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
                {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
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
                {Object.entries(ACTIVITY_CATEGORIES).map(([key, value]) => (
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
                placeholder="Describe the activity, its purpose, and scope..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cost Center and Cost Driver */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Cost Center & Cost Driver
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Cost Driver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Driver *
              </label>
              <div className="flex space-x-2">
                <select
                  {...register('cost_driver_id')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  disabled={!watchedCostCenterId}
                >
                  <option value="">Select Cost Driver</option>
                  {costDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.unit})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCostDriverForm(true)}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {errors.cost_driver_id && (
                <p className="mt-1 text-sm text-red-600">{errors.cost_driver_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Standard Rate and Capacity */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Standard Rate & Capacity
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Standard Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard Rate *
              </label>
              <div className="relative">
                <Input
                  {...register('standard_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={errors.standard_rate ? 'border-red-500' : ''}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watch('currency')}
                  </span>
                </div>
              </div>
              {errors.standard_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.standard_rate.message}</p>
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
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacity *
              </label>
              <div className="flex space-x-2">
                <Input
                  {...register('capacity', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                <select
                  {...register('capacity_unit')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="hours">Hours</option>
                  <option value="units">Units</option>
                  <option value="batches">Batches</option>
                  <option value="transactions">Transactions</option>
                </select>
              </div>
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Targets */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Performance Targets
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Efficiency Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Efficiency Target (%)
              </label>
              <Input
                {...register('efficiency_target', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="85"
                className={errors.efficiency_target ? 'border-red-500' : ''}
              />
              {errors.efficiency_target && (
                <p className="mt-1 text-sm text-red-600">{errors.efficiency_target.message}</p>
              )}
            </div>

            {/* Quality Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality Target (%)
              </label>
              <Input
                {...register('quality_target', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="99"
                className={errors.quality_target ? 'border-red-500' : ''}
              />
              {errors.quality_target && (
                <p className="mt-1 text-sm text-red-600">{errors.quality_target.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Time Parameters */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Time Parameters
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lead Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lead Time (hours)
              </label>
              <Input
                {...register('lead_time', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className={errors.lead_time ? 'border-red-500' : ''}
              />
              {errors.lead_time && (
                <p className="mt-1 text-sm text-red-600">{errors.lead_time.message}</p>
              )}
            </div>

            {/* Setup Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Setup Time (hours)
              </label>
              <Input
                {...register('setup_time', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className={errors.setup_time ? 'border-red-500' : ''}
              />
              {errors.setup_time && (
                <p className="mt-1 text-sm text-red-600">{errors.setup_time.message}</p>
              )}
            </div>

            {/* Cycle Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cycle Time (hours)
              </label>
              <Input
                {...register('cycle_time', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                className={errors.cycle_time ? 'border-red-500' : ''}
              />
              {errors.cycle_time && (
                <p className="mt-1 text-sm text-red-600">{errors.cycle_time.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Flags */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Activity Characteristics
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_bottleneck')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Bottleneck Activity
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_critical_path')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Critical Path Activity
                </span>
              </label>
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
                <span>{isEdit ? 'Update Activity' : 'Create Activity'}</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 