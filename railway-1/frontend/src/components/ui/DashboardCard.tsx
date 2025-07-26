'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ==================== TYPES ====================

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  error?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

// ==================== DASHBOARD CARD ====================

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  value,
  change,
  icon,
  children,
  className,
  onClick,
  loading = false,
  error = false,
  variant = 'default',
  size = 'md',
  interactive = false
}) => {
  // ==================== VARIANT STYLES ====================

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
    }
  };

  // ==================== SIZE STYLES ====================

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  // ==================== CHANGE INDICATOR ====================

  const getChangeIndicator = () => {
    if (!change) return null;

    const getChangeColor = () => {
      switch (change.type) {
        case 'increase':
          return 'text-green-600 dark:text-green-400';
        case 'decrease':
          return 'text-red-600 dark:text-red-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    };

    const getChangeIcon = () => {
      switch (change.type) {
        case 'increase':
          return '↗';
        case 'decrease':
          return '↘';
        default:
          return '→';
      }
    };

    return (
      <div className={cn('flex items-center text-sm font-medium', getChangeColor())}>
        <span className="mr-1">{getChangeIcon()}</span>
        <span>{Math.abs(change.value)}%</span>
      </div>
    );
  };

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className={cn(
        'rounded-lg border shadow-sm',
        getVariantStyles(),
        getSizeStyles(),
        'animate-pulse',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (error) {
    return (
      <div className={cn(
        'rounded-lg border shadow-sm',
        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
        getSizeStyles(),
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{title}</h3>
            <p className="text-xs text-red-600 dark:text-red-300">Error loading data</p>
          </div>
          <div className="text-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN CARD ====================

  const CardComponent = interactive ? motion.button : motion.div;

  return (
    <CardComponent
      className={cn(
        'rounded-lg border shadow-sm transition-all duration-200',
        getVariantStyles(),
        getSizeStyles(),
        interactive && 'hover:shadow-md hover:scale-[1.02] cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {value !== undefined && (
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {getChangeIndicator()}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </CardComponent>
  );
};

// ==================== EXPORT ====================

export default DashboardCard;
