'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Send, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2,
  CalendarDays,
  AlertTriangle,
  Info
} from 'lucide-react';
import { leaveRequestSchema, safeValidateLeaveRequest } from '../validation';
import { 
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../constants';
import type { LeaveRequest, Employee } from '../types';

interface LeaveRequestFormProps {
  employee: Employee;
  onSubmit: (data: Partial<LeaveRequest>) => Promise<LeaveRequest>;
  onCancel: () => void;
  isLoading?: boolean;
  isApprover?: boolean;
  existingRequest?: LeaveRequest;
}

interface LeaveFormData {
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading = false,
  isApprover = false,
  existingRequest
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: employee.annual_leave_balance,
    sick: employee.sick_leave_balance,
    other: employee.other_leave_balance
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveRequestSchema),
    mode: 'onChange',
    defaultValues: {
      leave_type: existingRequest?.leave_type || 'annual',
      start_date: existingRequest?.start_date || new Date().toISOString().split('T')[0],
      end_date: existingRequest?.end_date || new Date().toISOString().split('T')[0],
      days_requested: existingRequest?.days_requested || 1,
      reason: existingRequest?.reason || '',
    }
  });

  const watchedValues = watch();

  // Calculate working days between start and end date
  useEffect(() => {
    if (watchedValues.start_date && watchedValues.end_date) {
      const startDate = new Date(watchedValues.start_date);
      const endDate = new Date(watchedValues.end_date);
      
      if (endDate >= startDate) {
        const days = calculateWorkingDays(startDate, endDate);
        setCalculatedDays(days);
        setValue('days_requested', days);
      }
    }
  }, [watchedValues.start_date, watchedValues.end_date, setValue]);

  // Calculate working days (excluding weekends)
  const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
    let days = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        days++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check leave balance
  const checkLeaveBalance = () => {
    const requestedDays = watchedValues.days_requested;
    const leaveType = watchedValues.leave_type;
    
    if (leaveType === 'annual' && requestedDays > leaveBalance.annual) {
      return {
        insufficient: true,
        available: leaveBalance.annual,
        requested: requestedDays,
        shortfall: requestedDays - leaveBalance.annual
      };
    }
    
    if (leaveType === 'sick' && requestedDays > leaveBalance.sick) {
      return {
        insufficient: true,
        available: leaveBalance.sick,
        requested: requestedDays,
        shortfall: requestedDays - leaveBalance.sick
      };
    }
    
    return { insufficient: false };
  };

  const balanceCheck = checkLeaveBalance();

  const handleFormSubmit = async (data: LeaveFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Additional validation
      const validation = safeValidateLeaveRequest({
        ...data,
        employee_id: employee.id,
        requested_by: employee.id, // In real app, this would be the current user
        status: 'pending',
        supporting_documents: []
      });

      if (!validation.success) {
        setSubmitError(validation.error);
        return;
      }

      // Check leave balance
      if (balanceCheck.insufficient) {
        setSubmitError(`Insufficient leave balance. Available: ${balanceCheck.available} days, Requested: ${balanceCheck.requested} days`);
        return;
      }

      const leaveData: Partial<LeaveRequest> = {
        employee_id: employee.id,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        days_requested: data.days_requested,
        reason: data.reason,
        requested_by: employee.id, // In real app, this would be the current user
        status: 'pending',
        supporting_documents: []
      };

      await onSubmit(leaveData);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        reset();
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: keyof LeaveFormData) => {
    return errors[fieldName]?.message;
  };

  const isFieldValid = (fieldName: keyof LeaveFormData) => {
    return !errors[fieldName] && watchedValues[fieldName];
  };

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'annual': return 'text-blue-600 bg-blue-100';
      case 'sick': return 'text-red-600 bg-red-100';
      case 'maternity': return 'text-pink-600 bg-pink-100';
      case 'paternity': return 'text-indigo-600 bg-indigo-100';
      case 'unpaid': return 'text-gray-600 bg-gray-100';
      case 'other': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {existingRequest ? 'Edit Leave Request' : 'New Leave Request'}
              </h2>
              <p className="text-sm text-gray-600">
                {employee.first_name} {employee.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="mx-6 mt-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            {existingRequest ? 'Leave request updated successfully' : SUCCESS_MESSAGES.LEAVE_REQUEST_CREATED}
          </span>
        </div>
      )}

      {submitError && (
        <div className="mx-6 mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">{submitError}</span>
        </div>
      )}

      {/* Leave Balance Information */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Leave Balance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{leaveBalance.annual}</div>
            <div className="text-xs text-gray-600">Annual Leave</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{leaveBalance.sick}</div>
            <div className="text-xs text-gray-600">Sick Leave</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{leaveBalance.other}</div>
            <div className="text-xs text-gray-600">Other Leave</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
        {/* Leave Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Leave Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type *
            </label>
            <select
              {...register('leave_type')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('leave_type') 
                  ? 'border-red-300' 
                  : isFieldValid('leave_type') 
                    ? 'border-green-300' 
                    : 'border-gray-300'
              }`}
            >
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {getFieldError('leave_type') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('leave_type')}</p>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Date Range
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('start_date')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('start_date') 
                      ? 'border-red-300' 
                      : isFieldValid('start_date') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                />
                {isFieldValid('start_date') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('start_date') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('start_date')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('end_date')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('end_date') 
                      ? 'border-red-300' 
                      : isFieldValid('end_date') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                />
                {isFieldValid('end_date') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('end_date') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('end_date')}</p>
              )}
            </div>
          </div>

          {/* Calculated Days */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Working Days</span>
              </div>
              <div className="text-lg font-bold text-blue-600">{calculatedDays} days</div>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Calculated based on working days (excluding weekends)
            </p>
          </div>

          {/* Manual Days Override */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days Requested *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="365"
              {...register('days_requested', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('days_requested') 
                  ? 'border-red-300' 
                  : isFieldValid('days_requested') 
                    ? 'border-green-300' 
                    : 'border-gray-300'
              }`}
              placeholder="Number of days"
            />
            {getFieldError('days_requested') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('days_requested')}</p>
            )}
          </div>
        </div>

        {/* Leave Balance Warning */}
        {balanceCheck.insufficient && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Insufficient Leave Balance</span>
            </div>
            <div className="text-sm text-red-800 space-y-1">
              <p>Available: {balanceCheck.available} days</p>
              <p>Requested: {balanceCheck.requested} days</p>
              <p>Shortfall: {balanceCheck.shortfall} days</p>
            </div>
            <p className="text-xs text-red-700 mt-2">
              You may need to request unpaid leave for the remaining days.
            </p>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Reason
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Leave
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('reason') 
                  ? 'border-red-300' 
                  : isFieldValid('reason') 
                    ? 'border-green-300' 
                    : 'border-gray-300'
              }`}
              placeholder="Please provide a detailed reason for your leave request..."
            />
            {getFieldError('reason') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('reason')}</p>
            )}
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Leave Request Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Employee:</span>
              <span className="ml-2 font-medium">{employee.first_name} {employee.last_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Leave Type:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(watchedValues.leave_type)}`}>
                {LEAVE_TYPE_LABELS[watchedValues.leave_type]}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Start Date:</span>
              <span className="ml-2 font-medium">{watchedValues.start_date}</span>
            </div>
            <div>
              <span className="text-gray-600">End Date:</span>
              <span className="ml-2 font-medium">{watchedValues.end_date}</span>
            </div>
            <div>
              <span className="text-gray-600">Days Requested:</span>
              <span className="ml-2 font-medium">{watchedValues.days_requested} days</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full text-yellow-600 bg-yellow-100">
                {LEAVE_STATUS_LABELS.pending}
              </span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting || isLoading || balanceCheck.insufficient}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {existingRequest ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {existingRequest ? 'Update Request' : 'Submit Request'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm; 