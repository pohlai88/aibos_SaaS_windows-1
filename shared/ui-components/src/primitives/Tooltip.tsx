import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const tooltipVariants = cva(
  'absolute z-50 px-3 py-2 text-sm font-medium rounded-md shadow-lg border border-border',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        dark: 'bg-gray-900 text-white',
        light: 'bg-white text-gray-900 border-gray-200',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        success: 'bg-green-500 text-white',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-3',
      },
      placement: {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
        'top-start': 'bottom-full left-0 mb-2',
        'top-end': 'bottom-full right-0 mb-2',
        'bottom-start': 'top-full left-0 mt-2',
        'bottom-end': 'top-full right-0 mt-2',
        'left-start': 'right-full top-0 mr-2',
        'left-end': 'right-full bottom-0 mr-2',
        'right-start': 'left-full top-0 ml-2',
        'right-end': 'left-full bottom-0 ml-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      placement: 'top',
    },
  }
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  delay?: number;
  className?: string;
  contentClassName?: string;
  showArrow?: boolean;
  interactive?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  disabled = false,
  delay = 300,
  className,
  contentClassName,
  showArrow = true,
  interactive = false,
  onShow,
  onHide,
  variant = 'default',
  size = 'md',
  placement = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Calculate position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'top-start':
        x = triggerRect.left;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'top-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom-start':
        x = triggerRect.left;
        y = triggerRect.bottom + 8;
        break;
      case 'bottom-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.bottom + 8;
        break;
      case 'left-start':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.bottom - tooltipRect.height;
        break;
      case 'right-start':
        x = triggerRect.right + 8;
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + 8;
        y = triggerRect.bottom - tooltipRect.height;
        break;
    }

    // Ensure tooltip stays within viewport
    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
    if (y < 0) y = 8;
    if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

    setPosition({ x, y });
  };

  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      onShow?.();
      // Calculate position after tooltip is rendered
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    onHide?.();
  };

  // Handle mouse events
  const handleMouseEnter = () => {
    if (!interactive) {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (!interactive) {
      hideTooltip();
    }
  };

  // Handle focus events for keyboard accessibility
  const handleFocus = () => {
    showTooltip();
  };

  const handleBlur = () => {
    hideTooltip();
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className={cn('inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-describedby={isVisible ? 'tooltip-content' : undefined}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <div
            ref={tooltipRef}
            id="tooltip-content"
            role="tooltip"
            aria-hidden={!isVisible}
            className={cn(
              tooltipVariants({ variant, size, placement }),
              contentClassName
            )}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 9999,
            }}
            onMouseEnter={interactive ? showTooltip : undefined}
            onMouseLeave={interactive ? hideTooltip : undefined}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {content}
              {showArrow && (
                <div
                  className={cn(
                    'absolute w-2 h-2 bg-inherit border-inherit',
                    {
                      'top-full left-1/2 -translate-x-1/2 border-t border-l': placement.startsWith('top'),
                      'bottom-full left-1/2 -translate-x-1/2 border-b border-r': placement.startsWith('bottom'),
                      'left-full top-1/2 -translate-y-1/2 border-l border-t': placement.startsWith('left'),
                      'right-full top-1/2 -translate-y-1/2 border-r border-b': placement.startsWith('right'),
                    }
                  )}
                  style={{
                    transform: placement.startsWith('top') || placement.startsWith('bottom')
                      ? 'translateX(-50%) rotate(45deg)'
                      : 'translateY(-50%) rotate(45deg)',
                  }}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}; 