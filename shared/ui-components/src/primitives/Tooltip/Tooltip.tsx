import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const tooltipVariants = cva(
  'absolute z-50 px-3 py-2 text-sm font-medium text-white rounded-md shadow-lg transition-opacity duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-900',
  info: 'bg-blue-600',
        success: 'bg-green-600',
  warning: 'bg-yellow-600',
        error: 'bg-red-600',
      },
      size: {
        sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

const arrowVariants = cva(
  'absolute w-2 h-2 bg-current transform rotate-45',
  {
    variants: {
      position: {
        top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
  bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
        left: 'right-[-4px] top-1/2 -translate-y-1/2',
  right: 'left-[-4px] top-1/2 -translate-y-1/2',
      },
    },
    defaultVariants: {
      position: 'top',
    },
  }
);

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  maxWidth?: string;
  showArrow?: boolean;
  onShow?: () => void;
  onHide?: () => void
}

const TooltipComponent: React.FC<TooltipProps> = ({
  className,
  variant,
  size,
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  maxWidth = '200px',
  showArrow = true,
  onShow,
  onHide,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0,
  y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
      onShow?.();

      auditLog('tooltip_show', {
        component: 'Tooltip',
  content: typeof content === 'string' ? content : 'ReactNode',
        position,
      })
}, delay)
};

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
}
    setIsVisible(false);
    onHide?.();

    auditLog('tooltip_hide', {
      component: 'Tooltip',
  content: typeof content === 'string' ? content : 'ReactNode',
    })
};

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.top - tooltipRect.height - 8 + scrollY;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.bottom + 8 + scrollY;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
      case 'right':
        x = triggerRect.right + 8 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break
}

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
    if (y < 0) y = 8;
    if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

    setTooltipPosition({ x, y })
};

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition)
}
}
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
}
    }
}, []);

  const clonedChild = React.cloneElement(children, {
    ref: triggerRef,
  onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
  onFocus: showTooltip,
    onBlur: hideTooltip,
    'aria-describedby': isVisible ? 'tooltip-content' : undefined,
  });

  return (
    <>
      {clonedChild}
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={cn(
            tooltipVariants({ variant, size }),
            'fixed',
            className
          )}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth,
          }}
          {...props}
        >
          {content}
          {showArrow && (
            <div className={cn(arrowVariants({ position }))} />
          )}
        </div>
      )}
    </>
  )
};

export const Tooltip = withCompliance(withPerformance(TooltipComponent));

export default Tooltip;
