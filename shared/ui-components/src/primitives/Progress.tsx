import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
      variant: {
        default: 'bg-secondary',
        success: 'bg-green-100 dark:bg-green-900/20',
        warning: 'bg-yellow-100 dark:bg-yellow-900/20',
        destructive: 'bg-red-100 dark:bg-red-900/20',
        info: 'bg-blue-100 dark:bg-blue-900/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        destructive: 'bg-red-600',
        info: 'bg-blue-600',
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

export interface ProgressProps extends VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  size?: VariantProps<typeof progressVariants>['size'];
  variant?: VariantProps<typeof progressVariants>['variant'];
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  className,
  showValue = false,
  showLabel = false,
  label,
  animated = false,
  striped = false,
  indeterminate = false,
  size = 'md',
  variant = 'default',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayValue = Math.round(percentage);

  const indicatorClasses = cn(
    progressIndicatorVariants({ variant, animated }),
    striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse',
    indeterminate && 'animate-indeterminate'
  );

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {label || 'Progress'}
          </span>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {displayValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(progressVariants({ size, variant }))}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={cn(
            indicatorClasses,
            !indeterminate && 'transition-all duration-300 ease-in-out'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

// Circular Progress Component
export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  variant?: VariantProps<typeof progressIndicatorVariants>['variant'];
  animated?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = false,
  variant = 'default',
  animated = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    destructive: 'stroke-red-600',
    info: 'stroke-blue-600',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            variantColors[variant || 'default'],
            animated && 'transition-all duration-300 ease-in-out'
          )}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Multi-step Progress Component
export interface Step {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  description?: string;
}

export interface MultiStepProgressProps {
  steps: Step[];
  currentStep?: number;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showStepNumbers?: boolean;
  clickable?: boolean;
  onStepClick?: (stepIndex: number) => void;
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStep = 0,
  className,
  variant = 'horizontal',
  showStepNumbers = true,
  clickable = false,
  onStepClick,
}) => {
  const getStepStatus = (index: number): Step['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const stepClasses = {
    pending: 'border-muted bg-muted text-muted-foreground',
    current: 'border-primary bg-primary text-primary-foreground',
    completed: 'border-green-600 bg-green-600 text-white',
    error: 'border-red-600 bg-red-600 text-white',
  };

  const connectorClasses = {
    pending: 'bg-muted',
    current: 'bg-primary',
    completed: 'bg-green-600',
    error: 'bg-red-600',
  };

  if (variant === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                    stepClasses[status],
                    clickable && 'cursor-pointer hover:opacity-80'
                  )}
                  onClick={() => clickable && onStepClick?.(index)}
                >
                  {showStepNumbers ? index + 1 : (
                    status === 'completed' ? '✓' : 
                    status === 'error' ? '✕' : 
                    status === 'current' ? '●' : '○'
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'mt-2 h-8 w-0.5',
                      connectorClasses[status]
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="text-sm font-medium text-foreground">
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                    stepClasses[status],
                    clickable && 'cursor-pointer hover:opacity-80'
                  )}
                  onClick={() => clickable && onStepClick?.(index)}
                >
                  {showStepNumbers ? index + 1 : (
                    status === 'completed' ? '✓' : 
                    status === 'error' ? '✕' : 
                    status === 'current' ? '●' : '○'
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-foreground">
                  {step.label}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1',
                    connectorClasses[status]
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 