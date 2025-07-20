'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, XCircle, AlertTriangle, DollarSign, User, Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';

import { expenseApprovalFormSchema, safeValidateExpenseApprovalForm } from '../validation/expense';
import { APPROVAL_TYPES, APPROVAL_LEVELS, EXPENSE_STATUS, VALIDATION_LIMITS } from '../constants/expense';
import type { ExpenseApprovalFormData, ExpenseClaim, ExpenseItem } from '../types/expense';

interface ExpenseApprovalFormProps {
  expenseClaim: ExpenseClaim;
  expenseItems: ExpenseItem[];
  approverId: string;
  approvalLevel: keyof typeof APPROVAL_LEVELS;
  onSubmit: (data: ExpenseApprovalFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ExpenseApprovalForm: React.FC<ExpenseApprovalFormProps> = ({
  expenseClaim,
  expenseItems,
  approverId,
  approvalLevel,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<ExpenseApprovalFormData>({
    resolver: zodResolver(expenseApprovalFormSchema),
    defaultValues: {
      approval_type: APPROVAL_TYPES.APPROVE,
      approved_amount: expenseClaim.total_amount,
      approved_items: expenseItems.map(item => item.id),
      rejected_items: [],
      comments: '',
      conditions: [],
      additional_requirements: [],
    },
    mode: 'onChange',
  });

  const watchedApprovalType = watch('approval_type');
  const watchedApprovedItems = watch('approved_items');
  const watchedRejectedItems = watch('rejected_items');
  const watchedConditions = watch('conditions');
  const watchedRequirements = watch('additional_requirements');

  // Calculate approved amount based on selected items
  const calculateApprovedAmount = useCallback(() => {
    const approvedItems = expenseItems.filter(item => 
      watchedApprovedItems.includes(item.id)
    );
    return approvedItems.reduce((total, item) => {
      return total + (item.amount * item.quantity) + (item.tax_amount || 0);
    }, 0);
  }, [expenseItems, watchedApprovedItems]);

  // Handle item selection
  const handleItemSelection = useCallback((itemId: string, isApproved: boolean) => {
    if (isApproved) {
      setValue('approved_items', [...watchedApprovedItems, itemId]);
      setValue('rejected_items', watchedRejectedItems.filter(id => id !== itemId));
    } else {
      setValue('rejected_items', [...watchedRejectedItems, itemId]);
      setValue('approved_items', watchedApprovedItems.filter(id => id !== itemId));
    }
    
    // Update approved amount
    const newApprovedAmount = calculateApprovedAmount();
    setValue('approved_amount', newApprovedAmount);
  }, [watchedApprovedItems, watchedRejectedItems, setValue, calculateApprovedAmount]);

  // Add condition
  const addCondition = useCallback((condition: string) => {
    if (condition.trim() && watchedConditions.length < VALIDATION_LIMITS.MAX_CONDITIONS_PER_APPROVAL) {
      setValue('conditions', [...watchedConditions, condition.trim()]);
    }
  }, [watchedConditions, setValue]);

  // Remove condition
  const removeCondition = useCallback((index: number) => {
    setValue('conditions', watchedConditions.filter((_, i) => i !== index));
  }, [watchedConditions, setValue]);

  // Add requirement
  const addRequirement = useCallback((requirement: string) => {
    if (requirement.trim() && watchedRequirements.length < VALIDATION_LIMITS.MAX_REQUIREMENTS_PER_APPROVAL) {
      setValue('additional_requirements', [...watchedRequirements, requirement.trim()]);
    }
  }, [watchedRequirements, setValue]);

  // Remove requirement
  const removeRequirement = useCallback((index: number) => {
    setValue('additional_requirements', watchedRequirements.filter((_, i) => i !== index));
  }, [watchedRequirements, setValue]);

  // Handle form submission
  const handleFormSubmit = async (data: ExpenseApprovalFormData) => {
    try {
      // Validate form data
      const validation = safeValidateExpenseApprovalForm(data);
      if (!validation.success) {
        toast.error(validation.error || 'Validation failed');
        return;
      }

      // Add approval metadata
      const approvalData = {
        ...data,
        approver_id: approverId,
        approval_level: approvalLevel,
        responded_at: new Date().toISOString(),
        status: data.approval_type === APPROVAL_TYPES.APPROVE ? 'approved' : 
                data.approval_type === APPROVAL_TYPES.REJECT ? 'rejected' : 'requested_changes',
      };

      await onSubmit(approvalData);
      
      const actionText = data.approval_type === APPROVAL_TYPES.APPROVE ? 'approved' :
                        data.approval_type === APPROVAL_TYPES.REJECT ? 'rejected' : 'requested changes for';
      toast.success(`Expense claim ${actionText} successfully`);
      
      reset();
    } catch (error) {
      toast.error('Failed to submit approval decision');
      console.error('Approval submission error:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case EXPENSE_STATUS.APPROVED:
        return 'green';
      case EXPENSE_STATUS.REJECTED:
        return 'red';
      case EXPENSE_STATUS.UNDER_REVIEW:
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expense Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve expense claim #{expenseClaim.claim_number}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" color={getStatusColor(expenseClaim.status)}>
            {expenseClaim.status}
          </Badge>
          <Badge variant="outline">
            {APPROVAL_LEVEL_LABELS[approvalLevel]}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Claim Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Claim Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted by</p>
                <p className="font-medium">{expenseClaim.submitted_by}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted on</p>
                <p className="font-medium">
                  {new Date(expenseClaim.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="font-medium">
                  {expenseClaim.currency} {expenseClaim.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {expenseClaim.title}
            </h3>
            {expenseClaim.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {expenseClaim.description}
              </p>
            )}
          </div>
        </Card>

        {/* Approval Decision */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Approval Decision
          </h2>
          
          <div className="space-y-4">
            {/* Approval Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Decision *
              </label>
              <Controller
                name="approval_type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(APPROVAL_TYPES).map(([key, value]) => (
                      <label
                        key={key}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          field.value === value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          value={value}
                          checked={field.value === value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          {value === APPROVAL_TYPES.APPROVE && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {value === APPROVAL_TYPES.REJECT && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          {value === APPROVAL_TYPES.REQUEST_CHANGES && (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className="font-medium">
                            {APPROVAL_TYPE_LABELS[value]}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.approval_type && (
                <p className="text-red-600 text-sm mt-1">{errors.approval_type.message}</p>
              )}
            </div>

            {/* Approved Amount */}
            {watchedApprovalType === APPROVAL_TYPES.APPROVE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approved Amount ({expenseClaim.currency})
                </label>
                <Controller
                  name="approved_amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      max={expenseClaim.total_amount}
                      error={errors.approved_amount?.message}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Item Review */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Item Review
          </h2>
          
          <div className="space-y-4">
            {expenseItems.map((item) => {
              const isApproved = watchedApprovedItems.includes(item.id);
              const isRejected = watchedRejectedItems.includes(item.id);
              const itemTotal = (item.amount * item.quantity) + (item.tax_amount || 0);

              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    isApproved
                      ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                      : isRejected
                      ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`item-${item.id}`}
                          checked={isApproved}
                          onChange={() => handleItemSelection(item.id, true)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-green-600">Approve</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`item-${item.id}`}
                          checked={isRejected}
                          onChange={() => handleItemSelection(item.id, false)}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-red-600">Reject</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {expenseClaim.currency} {itemTotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity} × {item.unit_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">{item.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.vendor && (
                        <div>
                          <span className="font-medium">Vendor:</span> {item.vendor}
                        </div>
                      )}
                      {item.location && (
                        <div>
                          <span className="font-medium">Location:</span> {item.location}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Date:</span> {new Date(item.expense_date).toLocaleDateString()}
                      </div>
                      {item.tax_amount > 0 && (
                        <div>
                          <span className="font-medium">Tax:</span> {expenseClaim.currency} {item.tax_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Conditions and Requirements */}
        {(watchedApprovalType === APPROVAL_TYPES.APPROVE || watchedApprovalType === APPROVAL_TYPES.REQUEST_CHANGES) && (
          <>
            {/* Conditions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conditions
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConditionsModal(true)}
                  disabled={watchedConditions.length >= VALIDATION_LIMITS.MAX_CONDITIONS_PER_APPROVAL}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              
              {watchedConditions.length > 0 ? (
                <div className="space-y-2">
                  {watchedConditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{condition}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No conditions specified
                </p>
              )}
            </Card>

            {/* Additional Requirements */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Additional Requirements
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRequirementsModal(true)}
                  disabled={watchedRequirements.length >= VALIDATION_LIMITS.MAX_REQUIREMENTS_PER_APPROVAL}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
              
              {watchedRequirements.length > 0 ? (
                <div className="space-y-2">
                  {watchedRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{requirement}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No additional requirements specified
                </p>
              )}
            </Card>
          </>
        )}

        {/* Comments */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Comments
          </h2>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                placeholder="Enter your comments or justification..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                maxLength={VALIDATION_LIMITS.COMMENTS_MAX_LENGTH}
              />
            )}
          />
          {errors.comments && (
            <p className="text-red-600 text-sm mt-1">{errors.comments.message}</p>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <div className="flex items-center space-x-4">
            {!isValid && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Please fix validation errors</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : watchedApprovalType === APPROVAL_TYPES.APPROVE ? (
                <CheckCircle className="w-4 h-4" />
              ) : watchedApprovalType === APPROVAL_TYPES.REJECT ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>
                {watchedApprovalType === APPROVAL_TYPES.APPROVE ? 'Approve' :
                 watchedApprovalType === APPROVAL_TYPES.REJECT ? 'Reject' : 'Request Changes'}
              </span>
            </Button>
          </div>
        </div>
      </form>

      {/* Conditions Modal */}
      <Modal
        isOpen={showConditionsModal}
        onClose={() => setShowConditionsModal(false)}
        title="Add Condition"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Specify any conditions that must be met for this approval.
          </p>
          <Input
            placeholder="Enter condition..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                addCondition(input.value);
                input.value = '';
                setShowConditionsModal(false);
              }
            }}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConditionsModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Enter condition..."]') as HTMLInputElement;
                if (input) {
                  addCondition(input.value);
                  input.value = '';
                }
                setShowConditionsModal(false);
              }}
            >
              Add Condition
            </Button>
          </div>
        </div>
      </Modal>

      {/* Requirements Modal */}
      <Modal
        isOpen={showRequirementsModal}
        onClose={() => setShowRequirementsModal(false)}
        title="Add Requirement"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Specify any additional requirements for this approval.
          </p>
          <Input
            placeholder="Enter requirement..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                addRequirement(input.value);
                input.value = '';
                setShowRequirementsModal(false);
              }
            }}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowRequirementsModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Enter requirement..."]') as HTMLInputElement;
                if (input) {
                  addRequirement(input.value);
                  input.value = '';
                }
                setShowRequirementsModal(false);
              }}
            >
              Add Requirement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper constants
const APPROVAL_TYPE_LABELS = {
  [APPROVAL_TYPES.APPROVE]: 'Approve',
  [APPROVAL_TYPES.REJECT]: 'Reject',
  [APPROVAL_TYPES.REQUEST_CHANGES]: 'Request Changes',
};

const APPROVAL_LEVEL_LABELS = {
  [APPROVAL_LEVELS.MANAGER]: 'Manager',
  [APPROVAL_LEVELS.FINANCE]: 'Finance',
  [APPROVAL_LEVELS.DIRECTOR]: 'Director',
  [APPROVAL_LEVELS.EXECUTIVE]: 'Executive',
}; 