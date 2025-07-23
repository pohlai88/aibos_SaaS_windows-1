import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusPillProps {
  status: 'healthy' | 'warning' | 'critical' | 'info' | 'offline';
  label: string;
  description?: string;
  className?: string;
  showPulse?: boolean;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

// SVG Icons for consistent cross-platform rendering
const StatusIcons = {
  healthy: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  critical: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  offline: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  )
};

// Status configuration mapping
const statusConfig = {
  healthy: {
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    darkBgColor: 'dark:bg-green-500',
    darkTextColor: 'dark:text-green-400',
    darkBorderColor: 'dark:border-green-800',
    icon: StatusIcons.healthy,
    emoji: '🟢'
  },
  warning: {
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    darkBgColor: 'dark:bg-yellow-500',
    darkTextColor: 'dark:text-yellow-400',
    darkBorderColor: 'dark:border-yellow-800',
    icon: StatusIcons.warning,
    emoji: '🟡'
  },
  critical: {
    bgColor: 'bg-red-500',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    darkBgColor: 'dark:bg-red-500',
    darkTextColor: 'dark:text-red-400',
    darkBorderColor: 'dark:border-red-800',
    icon: StatusIcons.critical,
    emoji: '🔴'
  },
  info: {
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    darkBgColor: 'dark:bg-blue-500',
    darkTextColor: 'dark:text-blue-400',
    darkBorderColor: 'dark:border-blue-800',
    icon: StatusIcons.info,
    emoji: '🔵'
  },
  offline: {
    bgColor: 'bg-gray-500',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    darkBgColor: 'dark:bg-gray-500',
    darkTextColor: 'dark:text-gray-400',
    darkBorderColor: 'dark:border-gray-800',
    icon: StatusIcons.offline,
    emoji: '⚪'
  }
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  description,
  className = '',
  showPulse = false,
  size = 'md',
  icon,
  loading = false,
  onClick
}) => {
  const config = statusConfig[status];
  const isInteractive = !!onClick;

  // Size-based styling
  const sizeStyles = {
    sm: {
      container: 'p-2',
      text: 'text-xs',
      icon: 'w-2 h-2',
      description: 'text-xs'
    },
    md: {
      container: 'p-4',
      text: 'text-sm',
      icon: 'w-3 h-3',
      description: 'text-xs'
    }
  };

  const currentSize = sizeStyles[size];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 ${currentSize.container} rounded-lg shadow-sm border ${config.borderColor} ${config.darkBorderColor} ${
        isInteractive ? 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800' : ''
      } ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : 'status'}
      aria-live="polite"
      aria-label={isInteractive ? `Status: ${label} - ${status}` : undefined}
      tabIndex={isInteractive ? 0 : -1}
      whileHover={isInteractive ? { scale: 1.02 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center">
        <div className={`relative ${currentSize.icon} rounded-full mr-3 ${config.bgColor} ${config.darkBgColor} flex items-center justify-center`}>
          {/* Custom icon or fallback to SVG */}
          <span className="text-white">
            {icon || config.icon}
          </span>

          {/* Enhanced pulse effect with better z-index */}
          {showPulse && (
            <motion.div
              className={`absolute inset-0 -m-0.5 rounded-full z-[-1] ${config.bgColor} ${config.darkBgColor}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="animate-pulse">
              <div className={`${currentSize.text} h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1`}></div>
              {description && (
                <div className={`${currentSize.description} h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3`}></div>
              )}
            </div>
          ) : (
            <>
              <p className={`${currentSize.text} font-medium text-gray-900 dark:text-white truncate`}>
                {label}
              </p>
              {description && (
                <p
                  className={`${currentSize.description} text-gray-500 dark:text-gray-400 truncate`}
                  title={description.length > 30 ? description : undefined} // Simple tooltip for overflow
                >
                  {description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Status indicator with fallback to emoji */}
        <span
          className={`${currentSize.text} ml-2`}
          role="img"
          aria-label={`${status} status`}
        >
          {config.emoji}
        </span>
      </div>

      {/* Subtle accent line for status indication */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.bgColor} ${config.darkBgColor} rounded-b-lg`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.div>
  );
};
