import React from 'react';

/**
 * GlassPanel - Universal glassmorphic container for dashboard elements
 * - Soft shadow, glass blur, neon accent border (optional)
 * - Responsive padding, dark mode support
 * - Use as a wrapper for tables, charts, cards, etc.
 */
export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  neonAccent?: boolean; // If true, adds a neon green border
  className?: string;
  children: React.ReactNode;
}

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ neonAccent = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gray-900/70',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-800',
        'transition-colors duration-300 ease-in-out',
        'p-6',
        neonAccent && 'border-2 border-[#00FF88] shadow-[0_0_16px_2px_#00FF8899]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

GlassPanel.displayName = 'GlassPanel'; 