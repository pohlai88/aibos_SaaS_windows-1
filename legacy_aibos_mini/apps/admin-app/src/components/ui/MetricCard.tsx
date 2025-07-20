import React from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: string; // e.g. 'from-[#00FF88] to-[#00B3FF]'
  className?: string;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    { title, value, icon, accentColor = 'from-[#00FF88] to-[#00B3FF]', className, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl p-6 flex flex-col gap-2 min-w-[180px] min-h-[120px]',
        'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg',
        'border border-gray-200 dark:border-gray-800',
        'shadow-[0_4px_24px_rgba(0,0,0,0.18)]',
        'transition-colors duration-300 ease-in-out',
        'hover:shadow-[0_8px_32px_rgba(0,255,136,0.25)]',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full h-10 w-10',
              'bg-gradient-to-br',
              accentColor,
              'shadow-[0_0_8px_2px_rgba(0,255,136,0.25)]'
            )}
          >
            {icon}
          </span>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        {value}
      </div>
    </div>
  )
);

MetricCard.displayName = 'MetricCard'; 