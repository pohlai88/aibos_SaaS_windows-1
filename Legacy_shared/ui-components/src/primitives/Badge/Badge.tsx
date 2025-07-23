/**
 * Enterprise Badge Component
 * ISO27001, GDPR, SOC2, HIPAA compliant badge with status indicators
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { DataClassification } from '../../types';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';

// ============================================================================
// BADGE VARIANTS
// ============================================================================

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  primary: 'bg-blue-50 text-blue-700 ring-blue-700/10',
        secondary: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  success: 'bg-green-50 text-green-700 ring-green-600/20',
        warning: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/10',
        info: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  destructive: 'bg-red-50 text-red-700 ring-red-600/10',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

// ============================================================================
// BADGE PROPS
// ============================================================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
  dataClassification?: DataClassification;
  auditId?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  pulse?: boolean
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

const BadgeComponent = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      children,
      dot = false,
      dotColor,
      dataClassification = 'public',
      auditId,
      status,
      pulse = false,
      ...props
    },
    ref
  ) => {
    // Determine variant based on status
    const currentVariant = status
      ? status === 'online'
        ? 'success'
        : status === 'offline'
        ? 'error'
        : status === 'away'
        ? 'warning'
        : 'secondary'
      : variant;

    // Determine dot color based on variant or status
    const currentDotColor = dotColor ||
      (currentVariant === 'success' ? 'bg-green-400' :
       currentVariant === 'error' ? 'bg-red-400' :
       currentVariant === 'warning' ? 'bg-yellow-400' :
       currentVariant === 'primary' ? 'bg-blue-400' :
       'bg-gray-400');

    // Audit logging
    React.useEffect(() => {
      if (dataClassification === 'sensitive' && auditId) {
        console.log(`[AUDIT] Badge rendered: ${auditId} - ${dataClassification}`)
}
    }, [dataClassification, auditId]);

    return (
      <div
        className={cn(badgeVariants({ variant: currentVariant, size }), className)}
        ref={ref}
        data-classification={dataClassification}
        data-audit-id={auditId}
        data-status={status}
        {...props}
      >
        {dot && (
          <div
            className={cn(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              currentDotColor,
              pulse && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    )
}
);

BadgeComponent.displayName = 'Badge';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: 'online' | 'offline' | 'away' | 'busy';
  label?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  ...props
}) => {
  const statusLabels = {
    online: 'Online',
  offline: 'Offline',
    away: 'Away',
  busy: 'Busy',
  };

  return (
    <BadgeComponent
      status={status}
      dot
      pulse={status === 'online'}
      {...props}
    >
      {label || statusLabels[status]}
    </BadgeComponent>
  )
};

// ============================================================================
// NOTIFICATION BADGE COMPONENT
// ============================================================================

export interface NotificationBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  count: number;
  maxCount?: number;
  showZero?: boolean
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  showZero = false,
  ...props
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <BadgeComponent
      variant="error"
      size="sm"
      {...props}
    >
      {displayCount}
    </BadgeComponent>
  )
};

// ============================================================================
// PROGRESS BADGE COMPONENT
// ============================================================================

export interface ProgressBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  progress: number; // 0-100
  label?: string
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  progress,
  label,
  ...props
}) => {
  const variant = progress >= 80 ? 'success' :
                 progress >= 60 ? 'primary' :
                 progress >= 40 ? 'warning' :
                 'error';

  return (
    <BadgeComponent
      variant={variant}
      {...props}
    >
      {label || `${progress}%`}
    </BadgeComponent>
  )
};

export { badgeVariants };

// Export with enterprise HOCs
const Badge = withCompliance(
  withPerformance(BadgeComponent, {
    metrics: ['renderTime', 'interactionCount'],
    auditTrail: true
  }),
  {
    complianceLevel: 'basic',
  dataClassification: 'public',
    auditLogging: true
  }
);

export default Badge;
export type { BadgeProps };
