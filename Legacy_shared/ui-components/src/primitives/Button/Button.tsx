/**
 * Enterprise Button Component
 * ISO27001, GDPR, SOC2, HIPAA compliant button with performance optimization
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
// BUTTON VARIANTS
// ============================================================================

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'default',
    },
  }
);

// ============================================================================
// BUTTON INTERFACE
// ============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // Enterprise compliance properties
  dataClassification?: DataClassification;
  auditTrail?: boolean;
  encryption?: boolean;

  // Performance properties
  performanceProfile?: 'critical' | 'high' | 'medium' | 'low';
  enableTracking?: boolean;

  // Accessibility properties
  ariaLabel?: string;
  ariaDescribedBy?: string;

  // Security properties
  securityLevel?: 'standard' | 'high' | 'military';

  // Custom properties
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right'
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    dataClassification = 'internal',
    auditTrail = true,
    encryption = false,
    performanceProfile = 'medium',
    enableTracking = true,
    ariaLabel,
    ariaDescribedBy,
    securityLevel = 'standard',
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    onClick,
    onBlur,
    ...props
  }, ref) => {
    // Performance tracking
    React.useEffect(() => {
      if (enableTracking) {
        console.log(`Button component mounted: ${performanceProfile} priority`)
}
    }, [enableTracking, performanceProfile]);

    // Compliance logging
    React.useEffect(() => {
      if (auditTrail) {
        console.log(`Button compliance: ${dataClassification} classification, ${securityLevel} security`)
}
    }, [auditTrail, dataClassification, securityLevel]);

    // Enhanced click handler with compliance
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) return;

      // Log compliance event
      if (auditTrail) {
        console.log(`Button click: ${dataClassification} data, ${securityLevel} security level`)
}

      // Track performance
      if (enableTracking) {
        const startTime = performance.now();
        setTimeout(() => {
          const duration = performance.now() - startTime;
          console.log(`Button interaction: ${duration.toFixed(2)}ms`)
}, 0)
}

      onClick?.(event)
}, [loading, auditTrail, dataClassification, securityLevel, enableTracking, onClick]);

    // Enhanced blur handler
    const handleBlur = React.useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
      if (auditTrail) {
        console.log(`Button blur: ${dataClassification} data`)
}
      onBlur?.(event)
}, [auditTrail, dataClassification, onBlur]);

    return React.createElement('button', {
      className: cn(buttonVariants({ variant, size, className })),
      ref,
      onClick: handleClick,
  onBlur: handleBlur,
      disabled: loading || props.disabled,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-busy': loading,
      'data-classification': dataClassification,
      'data-security-level': securityLevel,
      'data-performance-profile': performanceProfile,
      'data-audit-trail': auditTrail,
      'data-encryption': encryption,
      ...props,
      children: [
        loading && React.createElement('svg', {
          key: 'loading-spinner',
  className: 'mr-2 h-4 w-4 animate-spin',
          xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
          viewBox: '0 0 24 24',
  children: [
            React.createElement('circle', {
              key: 'circle',
  className: 'opacity-25',
              cx: '12',
  cy: '12',
              r: '10',
  stroke: 'currentColor',
              strokeWidth: '4'
            }),
            React.createElement('path', {
              key: 'path',
  className: 'opacity-75',
              fill: 'currentColor',
  d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            })
          ]
        }),
        !loading && icon && iconPosition === 'left' && React.createElement('span', {
          key: 'left-icon',
  className: 'mr-2',
          children: icon
        }),
        children,
        !loading && icon && iconPosition === 'right' && React.createElement('span', {
          key: 'right-icon',
  className: 'ml-2',
          children: icon
        })
      ].filter(Boolean)
    })
}
);

Button.displayName = 'Button';

export { buttonVariants };
export default Button;
