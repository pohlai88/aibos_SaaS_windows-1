import * as React from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface DashboardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * DashboardSection - Luxury, responsive section for Revenue vs Expenses
 * - Title heading, GlassPanel wrapper, responsive grid
 * - Table left, chart right (desktop); stacked (mobile)
 * - Accessible, clean, minimal luxury styling
 */
export const DashboardSection: React.FC<DashboardSectionProps> = ({ title, icon, className, children, ...props }) => (
  <section
    className={cn(
      'mb-8',
      className
    )}
    {...props}
  >
    {title && (
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="text-neon-green">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight neon-text-shadow">
          {title}
        </h2>
      </div>
    )}
    <div className="rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200 dark:border-gray-800 shadow-[0_4px_24px_rgba(0,0,0,0.18)] p-6">
      {children}
    </div>
  </section>
);

// Neon text shadow utility (add to global CSS if not present)
// .neon-text-shadow {
//   text-shadow: 0 0 8px #00FF88, 0 0 2px #00FF88;
// } 