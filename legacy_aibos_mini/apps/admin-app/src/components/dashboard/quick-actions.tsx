import React from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, className }) => {
  return (
    <div className={cn(
      'rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gray-900/70',
      'shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-800',
      'transition-colors duration-300 ease-in-out p-6',
      className
    )}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 neon-text-shadow">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={cn(
              'h-auto p-4 flex flex-col items-start space-y-2 rounded-xl',
              'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg',
              'border border-gray-200 dark:border-gray-800',
              'shadow-[0_4px_24px_rgba(0,0,0,0.18)]',
              'transition-all duration-300 ease-in-out',
              'hover:shadow-[0_8px_32px_rgba(0,255,136,0.25)] hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2'
            )}
          >
            <div className="text-2xl">{action.icon}</div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">{action.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 