import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface LuxuryDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const LuxuryDisclosure: React.FC<LuxuryDisclosureProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
  className
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <span className="text-neon-green">{icon}</span>
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              {title}
            </span>
          </div>
          <svg
            className={cn(
              'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}; 