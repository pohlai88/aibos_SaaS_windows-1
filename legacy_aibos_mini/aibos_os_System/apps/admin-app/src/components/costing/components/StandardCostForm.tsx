'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Target, 
  DollarSign, 
  Calculator, 
  Package, 
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

import { standardCostSchema } from '../validation/costing';
import { 
  STANDARD_COST_STATUS,
  STANDARD_COST_STATUS_COLORS,
  COST_CATEGORIES,
  COST_CATEGORY_COLORS,
  CURRENCIES,
  BOM_ITEM_TYPES
} from '../constants/costing';
import type { 
  StandardCost, 
  StandardCostFormData, 
  CostCenter, 
  Activity,
  BOMItem,
  CostBreakdown
} from '../types/costing';

interface StandardCostFormProps {
  standardCost?: StandardCost;
  onSubmit: (data: StandardCostFormData) => Promise<void>;
  onCancel: () => void;
  organizationId: string;
  costCenters: CostCenter[];
  activities: Activity[];
  isEdit?: boolean;
}

export const StandardCostForm: React.FC<StandardCostFormProps> = ({
  standardCost,
  onSubmit,
  onCancel,
  organizationId,
  costCenters,
  activities,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [showBOMForm, setShowBOMForm] = useState(false);
  const [showCostBreakdownForm, setShowCostBreakdownForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<StandardCostFormData>({
    resolver: zodResolver(standardCostSchema),
    defaultValues: standardCost ? {
      product_id: standardCost.product_id,
      product_name: standardCost.product_name,
      cost_center_id: standardCost.cost_center_id,
      version: standardCost.version,
      effective_date: standardCost.effective_date,
      expiry_date: standardCost.expiry_date,
      currency: standardCost.currency,
      total_standard_cost: standardCost.total_standard_cost,
      total_actual_cost: standardCost.total_actual_cost,
      variance: standardCost.variance,
      status: standardCost.status,
      bom_items: standardCost.bom_items,
      cost_breakdown: standardCost.cost_breakdown,
      notes: standardCost.notes,
    } : {
      product_id: '',
      product_name: '',
      cost_center_id: '',
      version: '1.0',
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: undefined,
      currency: 'MYR',
      total_standard_cost: 0,
      total_actual_cost: 0,
      variance: 0,
      status: 'draft',
      bom_items: [],
      cost_breakdown: [],
      notes: '',
    },
  });

  const watchedProductId = watch('product_id');
  const watchedCostCenterId = watch('cost_center_id');
  const watchedCurrency = watch('currency');

  // Load BOM items and cost breakdown when product changes
  useEffect(() => {
    if (watchedProductId) {
      // This would load BOM items for the selected product
      // For now, we'll create sample data
      const sampleBOMItems: BOMItem[] = [
        {
          id: 'bom1',
          item_code: 'RAW001',
          item_name: 'Raw Material A',
          item_type: 'raw_material',
          quantity: 2.5,
          unit: 'kg',
          unit_cost: 15.00,
          currency: 'MYR',
          total_cost: 37.50,
          supplier_id: 'supplier1',
          lead_time: 7,
          is_critical: true,
        },
        {
          id: 'bom2',
          item_code: 'COMP001',
          item_name: 'Component B',
          item_type: 'component',
          quantity: 1,
          unit: 'pcs',
          unit_cost: 25.00,
          currency: 'MYR',
          total_cost: 25.00,
          supplier_id: 'supplier2',
          lead_time: 14,
          is_critical: false,
        },
      ];
      setBomItems(sampleBOMItems);

      const sampleCostBreakdown: CostBreakdown[] = [
        {
          id: 'cb1',
          cost_category: 'direct_material',
          description: 'Direct Materials',
          standard_cost: 62.50,
          actual_cost: 65.00,
          variance: -2.50,
          percentage: 62.5,
        },
        {
          id: 'cb2',
          cost_category: 'direct_labor',
          description: 'Direct Labor',
          standard_cost: 25.00,
          actual_cost: 28.00,
          variance: -3.00,
          percentage: 25.0,
        },
        {
          id: 'cb3',
          cost_category: 'manufacturing_overhead',
          description: 'Manufacturing Overhead',
          standard_cost: 12.50,
          actual_cost: 12.00,
          variance: 0.50,
          percentage: 12.5,
        },
      ];
      setCostBreakdown(sampleCostBreakdown);
    }
  }, [watchedProductId]);

  // Calculate totals when BOM items or cost breakdown change
  useEffect(() => {
    const bomTotal = bomItems.reduce((sum, item) => sum + item.total_cost, 0);
    const breakdownTotal = costBreakdown.reduce((sum, item) => sum + item.standard_cost, 0);
    
    setValue('total_standard_cost', breakdownTotal);
    setValue('total_actual_cost', costBreakdown.reduce((sum, item) => sum + item.actual_cost, 0));
    setValue('variance', breakdownTotal - costBreakdown.reduce((sum, item) => sum + item.actual_cost, 0));
  }, [bomItems, costBreakdown, setValue]);

  // Business logic validation
  const validateBusinessRules = async (data: StandardCostFormData): Promise<string[]> => {
    const errors: string[] = [];

    // Check if standard cost already exists for this product and version
    if (data.product_id && data.version) {
      try {
        // This would call the API to check uniqueness
        // const exists = await costingService.checkStandardCostExists(data.product_id, data.version, organizationId);
        // if (exists && !isEdit) {
        //   errors.push('Standard cost already exists for this product and version');
        // }
      } catch (error) {
        console.error('Error checking standard cost existence:', error);
      }
    }

    // Validate total standard cost
    if (data.total_standard_cost <= 0) {
      errors.push('Total standard cost must be greater than zero');
    }

    // Validate BOM items
    if (data.bom_items.length === 0) {
      errors.push('At least one BOM item is required');
    }

    // Validate cost breakdown
    if (data.cost_breakdown.length === 0) {
      errors.push('Cost breakdown is required');
    }

    // Validate cost center selection
    if (!data.cost_center_id) {
      errors.push('Cost center must be selected');
    }

    // Validate effective and expiry dates
    if (data.effective_date && data.expiry_date) {
      const effectiveDate = new Date(data.effective_date);
      const expiryDate = new Date(data.expiry_date);
      if (effectiveDate >= expiryDate) {
        errors.push('Expiry date must be after effective date');
      }
    }

    // Validate cost breakdown percentages
    const totalPercentage = data.cost_breakdown.reduce((sum, item) => sum + item.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push('Cost breakdown percentages must total 100%');
    }

    return errors;
  };

  // Handle form submission
  const handleFormSubmit = async (data: StandardCostFormData) => {
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
        bom_items,
        cost_breakdown,
        created_by: 'current_user_id', // This would come from auth context
        updated_by: 'current_user_id',
      };

      await onSubmit(submissionData);
      toast.success(`Standard cost ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} standard cost`);
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    reset();
    setBomItems([]);
    setCostBreakdown([]);
    setValidationErrors([]);
    toast.success('Form reset successfully');
  };

  // Add BOM item
  const handleAddBOMItem = () => {
    const newBOMItem: BOMItem = {
      id: `bom_${Date.now()}`,
      item_code: '',
      item_name: '',
      item_type: 'raw_material',
      quantity: 1,
      unit: 'pcs',
      unit_cost: 0,
      currency: watchedCurrency,
      total_cost: 0,
      supplier_id: '',
      lead_time: 0,
      is_critical: false,
    };
    setBomItems([...bomItems, newBOMItem]);
  };

  // Remove BOM item
  const handleRemoveBOMItem = (id: string) => {
    setBomItems(bomItems.filter(item => item.id !== id));
  };

  // Update BOM item
  const handleUpdateBOMItem = (id: string, field: keyof BOMItem, value: any) => {
    setBomItems(bomItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_cost') {
          updatedItem.total_cost = updatedItem.quantity * updatedItem.unit_cost;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Target className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Standard Cost' : 'New Standard Cost'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update standard cost details and calculations' : 'Create a new standard cost for product costing'}
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
            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product ID *
              </label>
              <Input
                {...register('product_id')}
                placeholder="e.g., PROD001"
                className={errors.product_id ? 'border-red-500' : ''}
              />
              {errors.product_id && (
                <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <Input
                {...register('product_name')}
                placeholder="e.g., Premium Widget"
                className={errors.product_name ? 'border-red-500' : ''}
              />
              {errors.product_name && (
                <p className="mt-1 text-sm text-red-600">{errors.product_name.message}</p>
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

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Version *
              </label>
              <Input
                {...register('version')}
                placeholder="e.g., 1.0"
                className={errors.version ? 'border-red-500' : ''}
              />
              {errors.version && (
                <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Cost Summary
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Standard Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Standard Cost
              </label>
              <div className="relative">
                <Input
                  {...register('total_standard_cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
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

            {/* Total Actual Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Actual Cost
              </label>
              <div className="relative">
                <Input
                  {...register('total_actual_cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
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

            {/* Variance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variance
              </label>
              <div className="relative">
                <Input
                  {...register('variance', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  readOnly
                  className={`bg-gray-100 dark:bg-gray-700 ${
                    watch('variance') >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">
                    {watchedCurrency}
                  </span>
                </div>
              </div>
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

        {/* Bill of Materials */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Bill of Materials
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBOMItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          {bomItems.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Critical</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bomItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <Input
                          value={item.item_code}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'item_code', e.target.value)}
                          placeholder="Item Code"
                          className="w-24"
                        />
                      </td>
                      <td>
                        <Input
                          value={item.item_name}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'item_name', e.target.value)}
                          placeholder="Item Name"
                          className="w-32"
                        />
                      </td>
                      <td>
                        <select
                          value={item.item_type}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'item_type', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {Object.entries(BOM_ITEM_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'quantity', parseFloat(e.target.value))}
                          className="w-20"
                        />
                      </td>
                      <td>
                        <Input
                          value={item.unit}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="w-16"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'unit_cost', parseFloat(e.target.value))}
                          className="w-20"
                        />
                      </td>
                      <td className="font-medium">
                        {watchedCurrency} {item.total_cost.toFixed(2)}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={item.is_critical}
                          onChange={(e) => handleUpdateBOMItem(item.id, 'is_critical', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBOMItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No BOM items added yet
              </p>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Cost Breakdown
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCostBreakdownForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Breakdown
            </Button>
          </div>
          
          {costBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Standard Cost</th>
                    <th>Actual Cost</th>
                    <th>Variance</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {costBreakdown.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Badge
                          variant="outline"
                          color={COST_CATEGORY_COLORS[item.cost_category]}
                        >
                          {item.cost_category.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>{item.description}</td>
                      <td className="font-medium">
                        {watchedCurrency} {item.standard_cost.toFixed(2)}
                      </td>
                      <td>
                        {watchedCurrency} {item.actual_cost.toFixed(2)}
                      </td>
                      <td>
                        <span className={`font-medium ${
                          item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {watchedCurrency} {item.variance.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No cost breakdown added yet
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
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(STANDARD_COST_STATUS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
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
            placeholder="Add any additional notes, assumptions, or comments..."
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
                <span>{isEdit ? 'Update Standard Cost' : 'Create Standard Cost'}</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 