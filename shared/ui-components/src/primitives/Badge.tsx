import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { X, LucideIcon } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-100',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
        error: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-100',
        pending: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-100',
        processing: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-100',
        completed: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100',
        draft: 'border-transparent bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-100',
        published: 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-100',
        archived: 'border-transparent bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  dismissible?: boolean;
  onDismiss?: () => void;
  dot?: boolean;
  dotColor?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant,
  size,
  icon: Icon,
  iconPosition = 'left',
  dismissible = false,
  onDismiss,
  dot = false,
  dotColor,
  pulse = false,
  ...props
}) => {
  const dotClasses = cn(
    'inline-block w-1.5 h-1.5 rounded-full mr-1.5',
    pulse && 'animate-pulse',
    dotColor || 'bg-current'
  );

  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && <span className={dotClasses} />}
      {Icon && iconPosition === 'left' && (
        <Icon className="mr-1 h-3 w-3" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="ml-1 h-3 w-3" />
      )}
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove badge</span>
        </button>
      )}
    </div>
  );
};

// Status Badge Component
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'dnd';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const statusConfig = {
    online: {
      label: 'Online',
      variant: 'success' as const,
      dotColor: 'bg-green-500',
    },
    offline: {
      label: 'Offline',
      variant: 'secondary' as const,
      dotColor: 'bg-gray-400',
    },
    away: {
      label: 'Away',
      variant: 'warning' as const,
      dotColor: 'bg-yellow-500',
    },
    busy: {
      label: 'Busy',
      variant: 'destructive' as const,
      dotColor: 'bg-red-500',
    },
    dnd: {
      label: 'Do Not Disturb',
      variant: 'destructive' as const,
      dotColor: 'bg-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot
      dotColor={config.dotColor}
      className={className}
    >
      {showLabel ? config.label : ''}
    </Badge>
  );
};

// Notification Badge Component
export interface NotificationBadgeProps {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  variant?: VariantProps<typeof badgeVariants>['variant'];
  size?: VariantProps<typeof badgeVariants>['size'];
  className?: string;
  children?: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  maxCount = 99,
  showZero = false,
  variant = 'destructive',
  size = 'md',
  className,
  children,
}) => {
  if (count === 0 && !showZero) {
    return <>{children}</>;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div className="relative inline-block">
      {children}
      <Badge
        variant={variant}
        size={size}
        className={cn(
          'absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center',
          className
        )}
      >
        {displayCount}
      </Badge>
    </div>
  );
};

// Progress Badge Component
export interface ProgressBadgeProps {
  value: number;
  max?: number;
  variant?: VariantProps<typeof badgeVariants>['variant'];
  size?: VariantProps<typeof badgeVariants>['size'];
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showPercentage = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getVariant = (): VariantProps<typeof badgeVariants>['variant'] => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'destructive';
  };

  return (
    <Badge
      variant={variant === 'default' ? getVariant() : variant}
      size={size}
      className={className}
    >
      {showPercentage ? `${Math.round(percentage)}%` : value}
    </Badge>
  );
}; 