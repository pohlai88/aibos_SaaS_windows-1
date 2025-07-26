'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// ==================== TYPES ====================

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  variant?: 'default' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

// ==================== EMPTY STATE COMPONENT ====================

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  size = 'md'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-500',
          title: 'text-red-900 dark:text-red-100',
          description: 'text-red-700 dark:text-red-300'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-500',
          title: 'text-yellow-900 dark:text-yellow-100',
          description: 'text-yellow-700 dark:text-yellow-300'
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-500',
          title: 'text-blue-900 dark:text-blue-100',
          description: 'text-blue-700 dark:text-blue-300'
        };
      default:
        return {
          container: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
          icon: 'text-gray-500 dark:text-gray-400',
          title: 'text-gray-900 dark:text-gray-100',
          description: 'text-gray-700 dark:text-gray-300'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'w-8 h-8',
          title: 'text-sm',
          description: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'w-16 h-16',
          title: 'text-xl',
          description: 'text-base'
        };
      default:
        return {
          container: 'p-6',
          icon: 'w-12 h-12',
          title: 'text-lg',
          description: 'text-sm'
        };
    }
  };

  const getActionStyles = (variant: 'primary' | 'secondary' | 'outline') => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${variantStyles.container} ${sizeStyles.container} text-center`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <div className={`${variantStyles.icon} ${sizeStyles.icon}`}>
          <Icon className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={`font-semibold ${variantStyles.title} ${sizeStyles.title}`}>
            {title}
          </h3>
          <p className={`${variantStyles.description} ${sizeStyles.description} max-w-sm`}>
            {description}
          </p>
        </div>

        {/* Action Button */}
        {action && (
          <motion.button
            onClick={action.onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getActionStyles(action.variant || 'primary')}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.label}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export { EmptyState };
export default EmptyState;
