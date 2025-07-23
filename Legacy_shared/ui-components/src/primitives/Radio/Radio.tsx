import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const radioVariants = cva(
  'relative inline-flex h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-gray-300 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
  error: 'border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'h-3 w-3',
  md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

const radioDotVariants = cva(
  'pointer-events-none absolute inset-0 flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-blue-600',
  error: 'text-red-600',
        success: 'text-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  onValueChange?: (checked: boolean) => void
}

const RadioComponent = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      error,
      success,
      checked,
      disabled,
      onValueChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (onChange) {
        onChange(e)
}

      if (onValueChange) {
        onValueChange(newChecked)
}

      auditLog('radio_change', {
        component: 'Radio',
  checked: newChecked,
        value: e.target.value,
        label,
      })
};

    const radioId = props.id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start space-x-2">
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className={cn(
              radioVariants({
                variant: error ? 'error' : success ? 'success' : variant,
                size,
              }),
              className
            )}
            {...props}
          />
          {checked && (
            <div
              className={cn(
                radioDotVariants({
                  variant: error ? 'error' : success ? 'success' : variant,
                })
              )}
            >
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
          )}
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  'text-sm font-medium text-gray-900 cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-1 text-sm text-green-600" role="alert">
                {success}
              </p>
            )}
          </div>
        )}
      </div>
    )
}
);

RadioComponent.displayName = 'Radio';

export const Radio = withCompliance(withPerformance(RadioComponent));

export default Radio;
