import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  iconBg?: string; // Flexible icon background color
  prefix?: string; // e.g., "$", "€"
  suffix?: string; // e.g., "%", "users", "k"
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  compact?: boolean; // Compact mode for dense layouts
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'info'; // Context-aware theming
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg,
  prefix = '',
  suffix = '',
  className = '',
  onClick,
  loading = false,
  compact = false,
  variant = 'default'
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const formatTrend = (trendValue: number) => {
    const sign = trendValue > 0 ? '+' : '';
    return `${sign}${trendValue.toFixed(1)}%`;
  };

  // Context-aware theming
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          border: 'border-green-200 dark:border-green-800',
          iconBg: iconBg || 'bg-green-100 dark:bg-green-900',
          accent: 'text-green-600 dark:text-green-400'
        };
      case 'warning':
        return {
          border: 'border-yellow-200 dark:border-yellow-800',
          iconBg: iconBg || 'bg-yellow-100 dark:bg-yellow-900',
          accent: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'critical':
        return {
          border: 'border-red-200 dark:border-red-800',
          iconBg: iconBg || 'bg-red-100 dark:bg-red-900',
          accent: 'text-red-600 dark:text-red-400'
        };
      case 'info':
        return {
          border: 'border-blue-200 dark:border-blue-800',
          iconBg: iconBg || 'bg-blue-100 dark:bg-blue-900',
          accent: 'text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-700',
          iconBg: iconBg || 'bg-blue-100 dark:bg-blue-900',
          accent: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isInteractive = !!onClick;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 ${compact ? 'p-4' : 'p-6'} rounded-xl shadow-sm ${variantStyles.border} hover:shadow-md transition-all duration-200 ${
        isInteractive ? 'cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800' : ''
      } ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileHover={isInteractive ? { scale: 1.02 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? `Dashboard card: ${title}` : undefined}
      tabIndex={isInteractive ? 0 : -1}
    >
      <div className={`flex items-start justify-between ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center space-x-3">
          {icon && (
            <motion.div
              className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} ${variantStyles.iconBg} rounded-lg flex items-center justify-center`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className={`${compact ? 'text-lg' : 'text-xl'}`} role="img" aria-label={`${title} icon`}>
                {icon}
              </span>
            </motion.div>
          )}
          <div>
            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-500 dark:text-gray-400`}>
              {title}
            </p>
            {subtitle && (
              <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-400 dark:text-gray-500`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {trend && (
          <motion.span
            className={`${compact ? 'text-xs' : 'text-sm'} font-semibold ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatTrend(trend.value)}
          </motion.span>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className={`${compact ? 'h-6' : 'h-8'} bg-gray-200 dark:bg-gray-700 rounded mb-2`}></div>
          <div className={`${compact ? 'h-3' : 'h-4'} bg-gray-200 dark:bg-gray-700 rounded w-2/3`}></div>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline">
            {prefix && (
              <span className={`${compact ? 'text-lg' : 'text-xl'} font-medium text-gray-500 dark:text-gray-400 mr-1`}>
                {prefix}
              </span>
            )}
            <AnimatePresence mode="wait">
              <motion.span
                key={`${value}-${prefix}-${suffix}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 dark:text-white`}
              >
                {formatValue(value)}
              </motion.span>
            </AnimatePresence>
            {suffix && (
              <span className={`${compact ? 'text-lg' : 'text-xl'} font-medium text-gray-500 dark:text-gray-400 ml-1`}>
                {suffix}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400 mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Subtle accent line for variant indication */}
      {variant !== 'default' && (
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 ${variantStyles.accent} rounded-b-xl`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}
    </motion.div>
  );
};
