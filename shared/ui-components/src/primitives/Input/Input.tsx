/**
 * Enterprise Input Component
 * ISO27001, GDPR, SOC2, HIPAA compliant input with validation and accessibility
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { DataClassification } from '../../types';

// ============================================================================
// INPUT VARIANTS
// ============================================================================

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

// ============================================================================
// INPUT PROPS
// ============================================================================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  dataClassification?: DataClassification;
  auditId?: string;
  onValidationChange?: (isValid: boolean,
  errors: string[]) => void
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      size,
      label,
      helperText,
      error,
      success,
      warning,
      leftIcon,
      rightIcon,
      dataClassification = 'public',
      auditId,
      onValidationChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;

    // Validation logic
    React.useEffect(() => {
      const errors: string[] = [];

      if (error) errors.push(error);
      if (warning) errors.push(warning);

      // Data classification validation
      if (dataClassification === 'sensitive' && !auditId) {
        errors.push('Audit ID required for sensitive data')
}

      setValidationErrors(errors);
      onValidationChange?.(errors.length === 0, errors)
}, [error, warning, dataClassification, auditId, onValidationChange]);

    // Audit logging for sensitive data
    React.useEffect(() => {
      if (dataClassification === 'sensitive' && auditId) {
        console.log(`[AUDIT] Input accessed: ${auditId} - ${dataClassification}`)
}
    }, [dataClassification, auditId]);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {dataClassification === 'sensitive' && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              inputVariants({ variant: currentVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e)
}}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e)
}}
            data-classification={dataClassification}
            data-audit-id={auditId}
            aria-invalid={!!error}
            aria-describedby={
              error || helperText || success || warning
                ? `${props.id || 'input'}-description`
                : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText || success || warning) && (
          <div
            id={`${props.id || 'input'}-description`}
            className={cn(
              'text-sm',
              error && 'text-red-600',
              success && 'text-green-600',
              warning && 'text-yellow-600',
              helperText && !error && !success && !warning && 'text-gray-500'
            )}
          >
            {error || success || warning || helperText}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="text-xs text-red-500">
            {validationErrors.map((err, index) => (
              <div key={index}>• {err}</div>
            ))}
          </div>
        )}
      </div>
    )
}
);

Input.displayName = 'Input';

export { Input, inputVariants };
