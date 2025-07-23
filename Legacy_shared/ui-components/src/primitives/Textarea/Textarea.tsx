import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const textareaVariants = cva(
  'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  onValueChange?: (value: string) => void
}

const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      error,
      success,
      showCharacterCount = false,
      maxLength,
      onValueChange,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [currentValue, setCurrentValue] = useState(value || '');
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCurrentValue(newValue);

      if (onChange) {
        onChange(e)
}

      if (onValueChange) {
        onValueChange(newValue)
}

      auditLog('textarea_change', {
        component: 'Textarea',
  valueLength: newValue.length,
        maxLength,
        label,
      })
};

    const characterCount = currentValue.length;
    const isOverLimit = maxLength && characterCount > maxLength;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={currentValue}
            onChange={handleChange}
            className={cn(
              textareaVariants({
                variant: error ? 'error' : success ? 'success' : variant,
                size,
              }),
              className
            )}
            {...props}
          />
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600" role="alert">
                {success}
              </p>
            )}
          </div>

          {showCharacterCount && maxLength && (
            <span
              className={cn(
                'text-xs',
                isOverLimit ? 'text-red-600' : 'text-gray-500'
              )}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
}
);

TextareaComponent.displayName = 'Textarea';

export const Textarea = withCompliance(withPerformance(TextareaComponent));

export default Textarea;
