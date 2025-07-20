'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Calendar, 
  TrendingUp, 
  FileText,
  Save,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Percent,
  Minus,
  Plus
} from 'lucide-react';
import { payrollSchema, safeValidatePayroll } from '../validation';
import { 
  PAYROLL_STATUS_LABELS, 
  CURRENCY_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../constants';
import type { PayrollRecord, Employee } from '../types';

interface PayrollCalculatorProps {
  employee: Employee;
  onCalculate: (payrollData: Partial<PayrollRecord>) => Promise<PayrollRecord>;
  onSave: (payrollData: PayrollRecord) => Promise<void>;
  onExport?: (payrollData: PayrollRecord) => Promise<void>;
  isLoading?: boolean;
}

interface PayrollFormData {
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  basic_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  bonus_amount: number;
  allowance_housing: number;
  allowance_transport: number;
  allowance_meal: number;
  allowance_other: number;
  deduction_epf: number;
  deduction_socso: number;
  deduction_eis: number;
  deduction_pcb: number;
  deduction_other: number;
  leave_days: number;
  absence_days: number;
  notes: string;
}

const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({
  employee,
  onCalculate,
  onSave,
  onExport,
  isLoading = false
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [calculatedPayroll, setCalculatedPayroll] = useState<PayrollRecord | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    mode: 'onChange',
    defaultValues: {
      pay_period_start: new Date().toISOString().split('T')[0],
      pay_period_end: new Date().toISOString().split('T')[0],
      pay_date: new Date().toISOString().split('T')[0],
      basic_salary: employee.salary,
      overtime_hours: 0,
      overtime_rate: employee.salary / 160, // Assuming 160 hours per month
      bonus_amount: 0,
      allowance_housing: 0,
      allowance_transport: 0,
      allowance_meal: 0,
      allowance_other: 0,
      deduction_epf: 0,
      deduction_socso: 0,
      deduction_eis: 0,
      deduction_pcb: 0,
      deduction_other: 0,
      leave_days: 0,
      absence_days: 0,
      notes: '',
    }
  });

  const watchedValues = watch();

  // Calculate totals in real-time
  const allowanceTotal = 
    watchedValues.allowance_housing + 
    watchedValues.allowance_transport + 
    watchedValues.allowance_meal + 
    watchedValues.allowance_other;

  const deductionTotal = 
    watchedValues.deduction_epf + 
    watchedValues.deduction_socso + 
    watchedValues.deduction_eis + 
    watchedValues.deduction_pcb + 
    watchedValues.deduction_other;

  const overtimeAmount = watchedValues.overtime_hours * watchedValues.overtime_rate;
  const grossPay = watchedValues.basic_salary + allowanceTotal + overtimeAmount + watchedValues.bonus_amount;
  const netPay = grossPay - deductionTotal;

  // Auto-calculate statutory deductions based on basic salary
  useEffect(() => {
    const basicSalary = watchedValues.basic_salary;
    if (basicSalary > 0) {
      // EPF: Employee contribution 11% (capped at RM5000)
      const epfBase = Math.min(basicSalary, 5000);
      setValue('deduction_epf', epfBase * 0.11);

      // SOCSO: Employee contribution 0.5% (capped at RM5000)
      const socsoBase = Math.min(basicSalary, 5000);
      setValue('deduction_socso', socsoBase * 0.005);

      // EIS: Employee contribution 0.2% (capped at RM5000)
      const eisBase = Math.min(basicSalary, 5000);
      setValue('deduction_eis', eisBase * 0.002);
    }
  }, [watchedValues.basic_salary, setValue]);

  const handleCalculate = async (data: PayrollFormData) => {
    try {
      setIsCalculating(true);
      setError(null);
      setSuccess(null);

      const payrollData: Partial<PayrollRecord> = {
        employee_id: employee.id,
        pay_period_start: data.pay_period_start,
        pay_period_end: data.pay_period_end,
        pay_date: data.pay_date,
        basic_salary: data.basic_salary,
        gross_pay: grossPay,
        net_pay: netPay,
        currency: employee.currency,
        allowances: {
          housing: data.allowance_housing,
          transport: data.allowance_transport,
          meal: data.allowance_meal,
          other: data.allowance_other,
        },
        allowance_total: allowanceTotal,
        deductions: {
          epf: data.deduction_epf,
          socso: data.deduction_socso,
          eis: data.deduction_eis,
          pcb: data.deduction_pcb,
          other: data.deduction_other,
        },
        deduction_total: deductionTotal,
        tax_amount: data.deduction_pcb,
        social_security_amount: data.deduction_epf + data.deduction_socso + data.deduction_eis,
        other_taxes: 0,
        overtime_hours: data.overtime_hours,
        overtime_rate: data.overtime_rate,
        overtime_amount: overtimeAmount,
        bonus_amount: data.bonus_amount,
        leave_days: data.leave_days,
        absence_days: data.absence_days,
        leave_deduction: 0, // Calculate based on leave policy
        status: 'pending',
        payment_method: 'bank_transfer',
        tax_year: new Date().getFullYear(),
        compliance_verified: false,
        notes: data.notes,
      };

      const result = await onCalculate(payrollData);
      setCalculatedPayroll(result);
      setSuccess('Payroll calculated successfully');
      setShowBreakdown(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to calculate payroll');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!calculatedPayroll) return;

    try {
      setIsSaving(true);
      setError(null);

      await onSave(calculatedPayroll);
      setSuccess(SUCCESS_MESSAGES.PAYROLL_PROCESSED);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save payroll');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!calculatedPayroll || !onExport) return;

    try {
      await onExport(calculatedPayroll);
      setSuccess('Payroll exported successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export payroll');
    }
  };

  const getFieldError = (fieldName: keyof PayrollFormData) => {
    return errors[fieldName]?.message;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Payroll Calculator
              </h2>
              <p className="text-sm text-gray-600">
                Calculate payroll for {employee.first_name} {employee.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showBreakdown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mx-6 mt-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      )}

      <div className="p-6">
        <form onSubmit={handleSubmit(handleCalculate)} className="space-y-6">
          {/* Pay Period Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Pay Period Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Period Start *
                </label>
                <input
                  type="date"
                  {...register('pay_period_start')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('pay_period_start') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('pay_period_start') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('pay_period_start')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Period End *
                </label>
                <input
                  type="date"
                  {...register('pay_period_end')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('pay_period_end') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('pay_period_end') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('pay_period_end')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Date *
                </label>
                <input
                  type="date"
                  {...register('pay_date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('pay_date') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('pay_date') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('pay_date')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Pay Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Basic Pay Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {...register('basic_salary', { valueAsNumber: true })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('basic_salary') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {getFieldError('basic_salary') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('basic_salary')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                  {employee.currency} - {CURRENCY_LABELS[employee.currency as keyof typeof CURRENCY_LABELS]}
                </div>
              </div>
            </div>
          </div>

          {/* Overtime and Bonuses */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Overtime & Bonuses
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('overtime_hours', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('overtime_hours') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {getFieldError('overtime_hours') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('overtime_hours')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Rate (per hour)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('overtime_rate', { valueAsNumber: true })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('overtime_rate') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {getFieldError('overtime_rate') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('overtime_rate')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('bonus_amount', { valueAsNumber: true })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('bonus_amount') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {getFieldError('bonus_amount') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('bonus_amount')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Allowances */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Allowances
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Housing Allowance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('allowance_housing', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Allowance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('allowance_transport', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Allowance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('allowance_meal', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Allowances
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('allowance_other', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Minus className="h-5 w-5 text-red-600" />
              Deductions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EPF (11%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('deduction_epf', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SOCSO (0.5%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('deduction_socso', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EIS (0.2%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('deduction_eis', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PCB (Tax)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('deduction_pcb', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Deductions
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('deduction_other', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Leave and Absence */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Leave & Absence
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Days
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('leave_days', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Absence Days
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('absence_days', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Notes
            </h3>
            
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or comments..."
            />
          </div>

          {/* Payroll Summary */}
          {showBreakdown && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Payroll Summary
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {employee.currency} {grossPay.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Gross Pay</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {employee.currency} {deductionTotal.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Deductions</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {employee.currency} {allowanceTotal.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Allowances</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {employee.currency} {netPay.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Net Pay</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Allowances Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Housing:</span>
                        <span>{employee.currency} {watchedValues.allowance_housing.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport:</span>
                        <span>{employee.currency} {watchedValues.allowance_transport.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meal:</span>
                        <span>{employee.currency} {watchedValues.allowance_meal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span>{employee.currency} {watchedValues.allowance_other.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Deductions Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>EPF:</span>
                        <span>{employee.currency} {watchedValues.deduction_epf.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SOCSO:</span>
                        <span>{employee.currency} {watchedValues.deduction_socso.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EIS:</span>
                        <span>{employee.currency} {watchedValues.deduction_eis.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PCB:</span>
                        <span>{employee.currency} {watchedValues.deduction_pcb.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span>{employee.currency} {watchedValues.deduction_other.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={!isValid || isCalculating || isLoading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calculate Payroll
                </>
              )}
            </button>

            {calculatedPayroll && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Payroll
                    </>
                  )}
                </button>

                {onExport && (
                  <button
                    type="button"
                    onClick={handleExport}
                    className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollCalculator; 