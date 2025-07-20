'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Shield,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  employeeSchema, 
  safeValidateEmployee 
} from '../validation';
import { 
  EMPLOYMENT_STATUS_LABELS, 
  CURRENCY_LABELS, 
  GENDER_LABELS, 
  MARITAL_STATUS_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS
} from '../constants';
import type { Employee, EmployeeFormData } from '../types';

interface EmployeeFormProps {
  employee?: Employee;
  departments: Array<{ id: string; name: string }>;
  positions: Array<{ id: string; title: string }>;
  managers: Array<{ id: string; first_name: string; last_name: string }>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  departments,
  positions,
  managers,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      position: employee?.position || '',
      department: employee?.department || '',
      employment_status: employee?.employment_status || DEFAULTS.EMPLOYMENT_STATUS,
      hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
      salary: employee?.salary || 0,
      currency: employee?.currency || DEFAULTS.CURRENCY,
      national_id: employee?.national_id || '',
      date_of_birth: employee?.date_of_birth || '',
      gender: employee?.gender || undefined,
      address_line1: employee?.address_line1 || '',
      city: employee?.city || '',
      state: employee?.state || '',
      postal_code: employee?.postal_code || '',
      country: employee?.country || 'Malaysia',
      emergency_contact_name: employee?.emergency_contact_name || '',
      emergency_contact_phone: employee?.emergency_contact_phone || '',
      bank_name: employee?.bank_name || '',
      bank_account_number: employee?.bank_account_number || '',
      tax_id: employee?.tax_id || '',
    }
  });

  const watchedValues = watch();

  // Real-time validation
  useEffect(() => {
    const validation = safeValidateEmployee(watchedValues);
    if (!validation.success) {
      console.log('Validation errors:', validation.error);
    }
  }, [watchedValues]);

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Additional validation
      const validation = safeValidateEmployee(data);
      if (!validation.success) {
        setSubmitError(validation.error);
        return;
      }

      await onSubmit(data);
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

  const getFieldError = (fieldName: keyof EmployeeFormData) => {
    return errors[fieldName]?.message;
  };

  const isFieldValid = (fieldName: keyof EmployeeFormData) => {
    return !errors[fieldName] && watchedValues[fieldName];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {employee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-sm text-gray-600">
                {employee ? 'Update employee information' : 'Create a new employee record'}
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

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {employee ? SUCCESS_MESSAGES.EMPLOYEE_UPDATED : SUCCESS_MESSAGES.EMPLOYEE_CREATED}
            </span>
          </div>
        )}

        {submitError && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">{submitError}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('first_name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('first_name') 
                      ? 'border-red-300' 
                      : isFieldValid('first_name') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {isFieldValid('first_name') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('first_name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('first_name')}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('last_name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('last_name') 
                      ? 'border-red-300' 
                      : isFieldValid('last_name') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {isFieldValid('last_name') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('last_name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('last_name')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('email') 
                      ? 'border-red-300' 
                      : isFieldValid('email') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                  placeholder="employee@company.com"
                />
                {isFieldValid('email') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('phone') 
                      ? 'border-red-300' 
                      : isFieldValid('phone') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                  placeholder="+60 12-345 6789"
                />
                {isFieldValid('phone') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Employment Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                {...register('department')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('department') 
                    ? 'border-red-300' 
                    : isFieldValid('department') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {getFieldError('department') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('department')}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <select
                {...register('position')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('position') 
                    ? 'border-red-300' 
                    : isFieldValid('position') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              >
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.title}>
                    {pos.title}
                  </option>
                ))}
              </select>
              {getFieldError('position') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('position')}</p>
              )}
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status *
              </label>
              <select
                {...register('employment_status')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('employment_status') 
                    ? 'border-red-300' 
                    : isFieldValid('employment_status') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              >
                {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {getFieldError('employment_status') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('employment_status')}</p>
              )}
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('hire_date')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('hire_date') 
                      ? 'border-red-300' 
                      : isFieldValid('hire_date') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                />
                {isFieldValid('hire_date') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('hire_date') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('hire_date')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Compensation Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            Compensation Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic Salary *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('salary', { valueAsNumber: true })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('salary') 
                      ? 'border-red-300' 
                      : isFieldValid('salary') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {isFieldValid('salary') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('salary') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('salary')}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                {...register('currency')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('currency') 
                    ? 'border-red-300' 
                    : isFieldValid('currency') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              >
                {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {value} - {label}
                  </option>
                ))}
              </select>
              {getFieldError('currency') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('currency')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                type="text"
                {...register('national_id')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('national_id') 
                    ? 'border-red-300' 
                    : isFieldValid('national_id') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="e.g., 880101-01-1234"
              />
              {getFieldError('national_id') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('national_id')}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('date_of_birth') 
                      ? 'border-red-300' 
                      : isFieldValid('date_of_birth') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                />
                {isFieldValid('date_of_birth') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('date_of_birth') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('date_of_birth')}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register('gender')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('gender') 
                    ? 'border-red-300' 
                    : isFieldValid('gender') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              >
                <option value="">Select Gender</option>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {getFieldError('gender') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('gender')}</p>
              )}
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                {...register('marital_status')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('marital_status') 
                    ? 'border-red-300' 
                    : isFieldValid('marital_status') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              >
                <option value="">Select Marital Status</option>
                {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {getFieldError('marital_status') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('marital_status')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                {...register('address_line1')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('address_line1') 
                    ? 'border-red-300' 
                    : isFieldValid('address_line1') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Street address, apartment, suite, etc."
              />
              {getFieldError('address_line1') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address_line1')}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('city') 
                    ? 'border-red-300' 
                    : isFieldValid('city') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="City"
              />
              {getFieldError('city') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('city')}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                {...register('state')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('state') 
                    ? 'border-red-300' 
                    : isFieldValid('state') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="State/Province"
              />
              {getFieldError('state') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('state')}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                {...register('postal_code')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('postal_code') 
                    ? 'border-red-300' 
                    : isFieldValid('postal_code') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Postal code"
              />
              {getFieldError('postal_code') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('postal_code')}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                {...register('country')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('country') 
                    ? 'border-red-300' 
                    : isFieldValid('country') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Country"
              />
              {getFieldError('country') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('country')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="h-5 w-5 text-orange-600" />
            Emergency Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                {...register('emergency_contact_name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('emergency_contact_name') 
                    ? 'border-red-300' 
                    : isFieldValid('emergency_contact_name') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Emergency contact name"
              />
              {getFieldError('emergency_contact_name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('emergency_contact_name')}</p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  {...register('emergency_contact_phone')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError('emergency_contact_phone') 
                      ? 'border-red-300' 
                      : isFieldValid('emergency_contact_phone') 
                        ? 'border-green-300' 
                        : 'border-gray-300'
                  }`}
                  placeholder="+60 12-345 6789"
                />
                {isFieldValid('emergency_contact_phone') && (
                  <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
                )}
              </div>
              {getFieldError('emergency_contact_phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('emergency_contact_phone')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Banking Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                {...register('bank_name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('bank_name') 
                    ? 'border-red-300' 
                    : isFieldValid('bank_name') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Bank name"
              />
              {getFieldError('bank_name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('bank_name')}</p>
              )}
            </div>

            {/* Bank Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                {...register('bank_account_number')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('bank_account_number') 
                    ? 'border-red-300' 
                    : isFieldValid('bank_account_number') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Account number"
              />
              {getFieldError('bank_account_number') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('bank_account_number')}</p>
              )}
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                {...register('tax_id')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  getFieldError('tax_id') 
                    ? 'border-red-300' 
                    : isFieldValid('tax_id') 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
                placeholder="Tax identification number"
              />
              {getFieldError('tax_id') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('tax_id')}</p>
              )}
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
            disabled={!isValid || isSubmitting || isLoading}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {employee ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {employee ? 'Update Employee' : 'Create Employee'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm; 