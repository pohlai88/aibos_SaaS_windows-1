import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-200',
  primary: 'bg-blue-100',
        success: 'bg-green-100',
  warning: 'bg-yellow-100',
        error: 'bg-red-100',
      },
      size: {
        sm: 'h-1',
  md: 'h-2',
        lg: 'h-3',
  xl: 'h-4',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

const progressBarVariants = cva(
  'h-full transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-blue-600',
  primary: 'bg-blue-600',
        success: 'bg-green-600',
  warning: 'bg-yellow-600',
        error: 'bg-red-600',
      },
      animated: {
        true: 'animate-pulse',
  false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
  animated: false,
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  min?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  onValueChange?: (value: number) => void
}

const ProgressComponent: React.FC<ProgressProps> = ({
  className,
  variant,
  size,
  value,
  max = 100,
  min = 0,
  showValue = false,
  showPercentage = false,
  label,
  animated = false,
  striped = false,
  indeterminate = false,
  onValueChange,
  ...props
}) => {
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  React.useEffect(() => {
    if (onValueChange) {
      onValueChange(normalizedValue)
}

    auditLog('progress_value_change', {
      component: 'Progress',
  value: normalizedValue,
      percentage,
      variant,
    })
}, [normalizedValue, percentage, variant, onValueChange]);

  const progressBarClasses = cn(
    progressBarVariants({ variant, animated }),
    striped && 'bg-gradient-to-r from-transparent via-white to-transparent bg-[length:20px_100%] animate-pulse',
    indeterminate && 'animate-ping'
  );

  const progressBarStyle = indeterminate
    ? {}
    : { width: `${percentage}%` };

  return (
    <div className="w-full" {...props}>
      {(label || showValue || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          <div className="flex items-center space-x-2">
            {showValue && (
              <span className="text-sm text-gray-600">
                {normalizedValue} / {max}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm text-gray-600">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(progressVariants({ variant, size }), className)}
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={progressBarClasses}
          style={progressBarStyle}
        />
      </div>
    </div>
  )
};

export const Progress = withCompliance(withPerformance(ProgressComponent));

export default Progress;
