import React from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface ActivityItem {
  id: string;
  type: 'journal_entry' | 'invoice' | 'payment' | 'bill';
  description: string;
  amount?: number;
  date: string;
  user: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, className }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'journal_entry':
        return '📝';
      case 'invoice':
        return '📄';
      case 'payment':
        return '💰';
      case 'bill':
        return '🧾';
      default:
        return '📋';
    }
  };

  return (
    <div className={cn(
      'rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gray-900/70',
      'shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-800',
      'transition-colors duration-300 ease-in-out p-6',
      className
    )}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 neon-text-shadow">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-white/40 dark:bg-gray-900/40 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-colors duration-200">
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.user} • {new Date(activity.date).toLocaleDateString()}
              </p>
            </div>
            {activity.amount && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                ${activity.amount.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 