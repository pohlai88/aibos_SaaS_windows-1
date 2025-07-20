import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  // Base styles
  [
    'rounded-lg border bg-white shadow-sm',
    'transition-all duration-200',
    'dark:bg-neutral-900 dark:border-neutral-800',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-neutral-200',
          'hover:shadow-md hover:border-neutral-300',
          'dark:border-neutral-700 dark:hover:border-neutral-600',
        ],
        elevated: [
          'border-neutral-200 shadow-lg',
          'hover:shadow-xl hover:border-neutral-300',
          'dark:border-neutral-700 dark:hover:border-neutral-600',
        ],
        outline: [
          'border-neutral-300 bg-transparent',
          'hover:bg-neutral-50',
          'dark:border-neutral-600 dark:hover:bg-neutral-800',
        ],
        ghost: [
          'border-transparent bg-transparent',
          'hover:bg-neutral-50',
          'dark:hover:bg-neutral-800',
        ],
        interactive: [
          'border-neutral-200 cursor-pointer',
          'hover:shadow-md hover:border-neutral-300 hover:-translate-y-1',
          'active:scale-95',
          'dark:border-neutral-700 dark:hover:border-neutral-600',
        ],
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

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding, className }))}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-neutral-900',
        'dark:text-neutral-100',
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-600',
        'dark:text-neutral-400',
        className
      )}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
const cardContentVariants = cva('', {
  variants: {
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding, className }))}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

// Card Footer Component
const cardFooterVariants = cva('flex items-center', {
  variants: {
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ padding, className }))}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter'; 