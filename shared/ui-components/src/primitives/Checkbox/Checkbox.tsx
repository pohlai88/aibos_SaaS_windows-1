import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const checkboxVariants = cva(
  'relative inline-flex h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

const checkmarkVariants = cva(
  'pointer-events-none absolute inset-0 flex items-center justify-center text-white',
  {
    variants: {
      variant: {
        default: 'bg-blue-600',
  error: 'bg-red-600',
        success: 'bg-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  indeterminate?: boolean;
  onValueChange?: (checked: boolean) => void
}

const CheckboxComponent = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      error,
      success,
      indeterminate = false,
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

      auditLog('checkbox_change', {
        component: 'Checkbox',
  checked: newChecked,
        indeterminate,
        label,
      })
};

    const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start space-x-2">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className={cn(
              checkboxVariants({
                variant: error ? 'error' : success ? 'success' : variant,
                size,
              }),
              className
            )}
            {...props}
          />
          {(checked || indeterminate) && (
            <div
              className={cn(
                checkmarkVariants({
                  variant: error ? 'error' : success ? 'success' : variant,
                }),
                'rounded'
              )}
            >
              {indeterminate ? (
                <svg
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
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

CheckboxComponent.displayName = 'Checkbox';

export const Checkbox = withCompliance(withPerformance(CheckboxComponent));

export default Checkbox;
