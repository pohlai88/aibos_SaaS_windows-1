'use client';

import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Upload, X, AlertCircle, CheckCircle, DollarSign, Calendar, MapPin, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';

import { expenseClaimFormSchema, safeValidateExpenseClaimForm } from '../validation/expense';
import { EXPENSE_STATUS, EXPENSE_PRIORITY, SUPPORTED_CURRENCIES, FILE_UPLOAD_LIMITS, VALIDATION_LIMITS } from '../constants/expense';
import type { ExpenseClaimFormData, ExpenseCategory } from '../types/expense';

interface ExpenseClaimFormProps {
  onSubmit: (data: ExpenseClaimFormData) => Promise<void>;
  onCancel: () => void;
  categories: ExpenseCategory[];
  employeeId: string;
  isLoading?: boolean;
  initialData?: Partial<ExpenseClaimFormData>;
}

export const ExpenseClaimForm: React.FC<ExpenseClaimFormProps> = ({
  onSubmit,
  onCancel,
  categories,
  employeeId,
  isLoading = false,
  initialData,
}) => {
  const [receiptFiles, setReceiptFiles] = useState<Record<string, File>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [showReceiptPreview, setShowReceiptPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ExpenseClaimFormData>({
    resolver: zodResolver(expenseClaimFormSchema),
    defaultValues: {
      title: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      currency: 'MYR',
      items: [
        {
          category_id: '',
          description: '',
          amount: 0,
          quantity: 1,
          unit_price: 0,
          expense_date: new Date().toISOString().split('T')[0],
          location: '',
          vendor: '',
        },
      ],
      notes: '',
      ...initialData,
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedCurrency = watch('currency');

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const totals = watchedItems.reduce(
      (acc, item) => {
        const itemTotal = (item.amount || 0) * (item.quantity || 1);
        acc.subtotal += itemTotal;
        acc.tax += (item.tax_amount || 0);
        acc.total += itemTotal + (item.tax_amount || 0);
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
    return totals;
  }, [watchedItems]);

  const totals = calculateTotals();

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File, itemIndex: number) => {
    if (!file) return;

    // Validate file
    if (file.size > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    if (!FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image or PDF.');
      return;
    }

    const fileKey = `item_${itemIndex}`;
    setReceiptFiles(prev => ({ ...prev, [fileKey]: file }));
    setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update form with file info
      setValue(`items.${itemIndex}.receipt_file`, file);
      
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload receipt');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fileKey]: false }));
    }
  }, [setValue]);

  // Handle form submission
  const handleFormSubmit = async (data: ExpenseClaimFormData) => {
    try {
      // Validate form data
      const validation = safeValidateExpenseClaimForm(data);
      if (!validation.success) {
        toast.error(validation.error || 'Validation failed');
        return;
      }

      // Add employee ID and submission metadata
      const submissionData = {
        ...data,
        employee_id: employeeId,
        submitted_at: new Date().toISOString(),
        status: EXPENSE_STATUS.SUBMITTED,
        priority: EXPENSE_PRIORITY.MEDIUM,
      };

      await onSubmit(submissionData);
      toast.success('Expense claim submitted successfully');
      reset();
    } catch (error) {
      toast.error('Failed to submit expense claim');
      console.error('Expense claim submission error:', error);
    }
  };

  // Add new expense item
  const addExpenseItem = () => {
    if (fields.length >= VALIDATION_LIMITS.MAX_ITEMS_PER_CLAIM) {
      toast.error(`Maximum ${VALIDATION_LIMITS.MAX_ITEMS_PER_CLAIM} items allowed per claim`);
      return;
    }

    append({
      category_id: '',
      description: '',
      amount: 0,
      quantity: 1,
      unit_price: 0,
      expense_date: new Date().toISOString().split('T')[0],
      location: '',
      vendor: '',
    });
  };

  // Remove expense item
  const removeExpenseItem = (index: number) => {
    if (fields.length <= 1) {
      toast.error('At least one expense item is required');
      return;
    }
    remove(index);
  };

  // Preview receipt
  const previewReceipt = (fileKey: string) => {
    const file = receiptFiles[fileKey];
    if (file) {
      const url = URL.createObjectURL(file);
      setShowReceiptPreview(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            New Expense Claim
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Submit your expense claim for approval
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Draft
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claim Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter claim title"
                    error={errors.title?.message}
                    maxLength={VALIDATION_LIMITS.TITLE_MAX_LENGTH}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency *
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {Object.entries(SUPPORTED_CURRENCIES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expense Date *
              </label>
              <Controller
                name="expense_date"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    error={errors.expense_date?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Enter description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {/* Expense Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Items
            </h2>
            <Button
              type="button"
              onClick={addExpenseItem}
              disabled={fields.length >= VALIDATION_LIMITS.MAX_ITEMS_PER_CLAIM}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Item {index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExpenseItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <Controller
                      name={`items.${index}.category_id`}
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.items?.[index]?.category_id && (
                      <p className="text-red-600 text-sm mt-1">{errors.items[index]?.category_id?.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <Controller
                      name={`items.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter description"
                          error={errors.items?.[index]?.description?.message}
                          maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
                        />
                      )}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount ({watchedCurrency}) *
                    </label>
                    <Controller
                      name={`items.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          error={errors.items?.[index]?.amount?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          placeholder="1"
                          error={errors.items?.[index]?.quantity?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Vendor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vendor
                    </label>
                    <Controller
                      name={`items.${index}.vendor`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter vendor name"
                          error={errors.items?.[index]?.vendor?.message}
                          maxLength={VALIDATION_LIMITS.VENDOR_MAX_LENGTH}
                        />
                      )}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <Controller
                      name={`items.${index}.location`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter location"
                          error={errors.items?.[index]?.location?.message}
                          maxLength={VALIDATION_LIMITS.LOCATION_MAX_LENGTH}
                        />
                      )}
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Receipt
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept={FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES.join(',')}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, index);
                          }
                        }}
                        className="hidden"
                        id={`receipt-${index}`}
                      />
                      <label
                        htmlFor={`receipt-${index}`}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        {uploadingFiles[`item_${index}`] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Upload Receipt</span>
                      </label>

                      {receiptFiles[`item_${index}`] && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receiptFiles[`item_${index}`].name}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => previewReceipt(`item_${index}`)}
                          >
                            Preview
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Totals */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium">
                {watchedCurrency} {totals.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax:</span>
              <span className="font-medium">
                {watchedCurrency} {totals.tax.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {watchedCurrency} {totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Notes
          </h2>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                placeholder="Enter any additional notes or comments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                maxLength={VALIDATION_LIMITS.NOTES_MAX_LENGTH}
              />
            )}
          />
          {errors.notes && (
            <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading || !isDirty}
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {!isValid && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
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
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <span>Submit Claim</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Receipt Preview Modal */}
      {showReceiptPreview && (
        <Modal
          isOpen={!!showReceiptPreview}
          onClose={() => {
            setShowReceiptPreview(null);
            URL.revokeObjectURL(showReceiptPreview);
          }}
          title="Receipt Preview"
        >
          <div className="max-h-96 overflow-auto">
            <img
              src={showReceiptPreview}
              alt="Receipt preview"
              className="w-full h-auto"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}; 