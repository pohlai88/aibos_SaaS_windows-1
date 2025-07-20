import React, { useState } from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface LuxuryTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: TabItem[];
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const LuxuryTabs: React.FC<LuxuryTabsProps> = ({
  value,
  onValueChange,
  items,
  className,
  variant = 'default'
}) => {
  const handleTabClick = (tabValue: string) => {
    const item = items.find(item => item.value === tabValue);
    if (item?.disabled) return;
    onValueChange(tabValue);
  };

  const getTabListClasses = () => {
    switch (variant) {
      case 'pills':
        return 'flex space-x-1 rounded-xl bg-white/20 dark:bg-gray-800/20 p-1 backdrop-blur-sm';
      case 'underline':
        return 'flex space-x-8 border-b border-gray-200 dark:border-gray-700';
      default:
        return 'flex space-x-1';
    }
  };

  const getTabClasses = (selected: boolean) => {
    const baseClasses = 'px-3 py-2 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2';
    
    switch (variant) {
      case 'pills':
        return cn(
          baseClasses,
          'rounded-lg',
          selected
            ? 'bg-neon-green text-white shadow-neon-green'
            : 'text-gray-600 dark:text-gray-400 hover:text-white hover:bg-white/[0.12]'
        );
      case 'underline':
        return cn(
          baseClasses,
          'border-b-2',
          selected
            ? 'border-neon-green text-neon-green'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        );
      default:
        return cn(
          baseClasses,
          'rounded-lg',
          selected
            ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-gray-800/10'
        );
    }
  };

  return (
    <div className={className}>
      <div className={getTabListClasses()}>
        {items.map((item) => (
          <button
            key={item.value}
            disabled={item.disabled}
            onClick={() => handleTabClick(item.value)}
            className={cn(
              getTabClasses(value === item.value),
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center space-x-2">
              {item.icon && (
                <span className="text-current">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6">
        {items.find(item => item.value === value)?.content}
      </div>
    </div>
  );
}; 