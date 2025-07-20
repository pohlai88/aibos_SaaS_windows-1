import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { theme } from '../../design-system/theme';

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700',
          'focus:ring-primary-500',
          'shadow-sm hover:shadow-md',
        ],
        secondary: [
          'bg-secondary-600 text-white',
          'hover:bg-secondary-700',
          'focus:ring-secondary-500',
          'shadow-sm hover:shadow-md',
        ],
        outline: [
          'border border-neutral-300 bg-transparent text-neutral-700',
          'hover:bg-neutral-50 hover:border-neutral-400',
          'focus:ring-neutral-500',
          'dark:border-neutral-600 dark:text-neutral-300',
          'dark:hover:bg-neutral-800 dark:hover:border-neutral-500',
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100',
          'focus:ring-neutral-500',
          'dark:text-neutral-300 dark:hover:bg-neutral-800',
        ],
        danger: [
          'bg-error-600 text-white',
          'hover:bg-error-700',
          'focus:ring-error-500',
          'shadow-sm hover:shadow-md',
        ],
        success: [
          'bg-success-600 text-white',
          'hover:bg-success-700',
          'focus:ring-success-500',
          'shadow-sm hover:shadow-md',
        ],
        warning: [
          'bg-warning-600 text-white',
          'hover:bg-warning-700',
          'focus:ring-warning-500',
          'shadow-sm hover:shadow-md',
        ],
      },
      size: {
        sm: [
          'px-3 py-1.5 text-sm',
          'rounded-md',
        ],
        md: [
          'px-4 py-2 text-base',
          'rounded-lg',
        ],
        lg: [
          'px-6 py-3 text-lg',
          'rounded-lg',
        ],
        xl: [
          'px-8 py-4 text-xl',
          'rounded-xl',
        ],
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button'; 