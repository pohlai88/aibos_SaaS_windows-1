import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white',
  elevated: 'border-gray-200 bg-white shadow-lg',
        outlined: 'border-gray-300 bg-transparent',
  interactive: 'border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer',
      },
      padding: {
        none: '',
  sm: 'p-3',
        md: 'p-4',
  lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
  padding: 'md',
    },
  }
);

const headerVariants = cva('flex flex-col space-y-1.5 p-4', {
  variants: {
    variant: {
      default: '',
  border: 'border-b border-gray-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const contentVariants = cva('p-4', {
  variants: {
    variant: {
      default: '',
  border: 'border-t border-gray-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const footerVariants = cva('flex items-center p-4', {
  variants: {
    variant: {
      default: '',
  border: 'border-t border-gray-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean
}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {}

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentVariants> {}

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof footerVariants> {}

const CardComponent: React.FC<CardProps> = ({
  className,
  variant,
  padding,
  onClick,
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
      auditLog('card_click', {
        component: 'Card',
        variant,
        loading,
        disabled,
      })
}
  };

  return (
    <div
      className={cn(
        cardVariants({ variant, padding }),
        onClick && !disabled && !loading && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'animate-pulse',
        className
      )}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {children}
    </div>
  )
};

const CardHeaderComponent: React.FC<CardHeaderProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <div className={cn(headerVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
};

const CardContentComponent: React.FC<CardContentProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <div className={cn(contentVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
};

const CardFooterComponent: React.FC<CardFooterProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <div className={cn(footerVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
};

export const Card = withCompliance(withPerformance(CardComponent));
export const CardHeader = withCompliance(withPerformance(CardHeaderComponent));
export const CardContent = withCompliance(withPerformance(CardContentComponent));
export const CardFooter = withCompliance(withPerformance(CardFooterComponent));

export default Card;
