'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

// ==================== TYPES ====================
export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error';
  helpText?: string;
  helpTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  className?: string;
}

export interface ErrorStateProps {
  title: string;
  message: string;
  error?: Error;
  onRetry?: () => void;
  onContactSupport?: () => void;
  showRetry?: boolean;
  showSupport?: boolean;
}

// ==================== ANIMATION VARIANTS ====================
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const iconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
      ease: "easeOut"
    }
  }
};

// ==================== COMPONENTS ====================
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  helpText,
  helpTitle,
  size = 'md',
  showAnimation = true,
  className = ''
}) => {
  const variantStyles = {
    default: {
      container: 'bg-gray-50 border-gray-200',
      icon: 'text-gray-400',
      title: 'text-gray-800',
      description: 'text-gray-600',
      help: 'bg-gray-100 border-gray-200',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      description: 'text-green-700',
      help: 'bg-green-100 border-green-200',
      button: 'bg-green-500 hover:bg-green-600 text-white'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      description: 'text-yellow-700',
      help: 'bg-yellow-100 border-yellow-200',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      description: 'text-blue-700',
      help: 'bg-blue-100 border-blue-200',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      description: 'text-red-700',
      help: 'bg-red-100 border-red-200',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    }
  };

  const sizeStyles = {
    sm: {
      container: 'p-6 min-h-[150px]',
      icon: 'text-3xl mb-3',
      title: 'text-base font-semibold mb-2',
      description: 'text-sm mb-4 max-w-xs',
      help: 'p-3 text-xs'
    },
    md: {
      container: 'p-8 min-h-[200px]',
      icon: 'text-4xl mb-4',
      title: 'text-lg font-semibold mb-2',
      description: 'text-sm mb-4 max-w-sm',
      help: 'p-4 text-sm'
    },
    lg: {
      container: 'p-12 min-h-[300px]',
      icon: 'text-6xl mb-6',
      title: 'text-2xl font-semibold mb-3',
      description: 'text-base mb-6 max-w-md',
      help: 'p-6 text-base'
    }
  };

  const styles = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  return (
    <motion.div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${styles.container} ${sizeConfig.container} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Icon */}
      <motion.div
        className={`${styles.icon} ${sizeConfig.icon}`}
        variants={iconVariants}
        animate={showAnimation ? "pulse" : "visible"}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <motion.div
        className="text-center"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className={`${styles.title} ${sizeConfig.title}`}>
          {title}
        </h3>
        <p className={`${styles.description} ${sizeConfig.description}`}>
          {description}
        </p>

        {/* Action Button */}
        {actionLabel && onAction && (
          <motion.button
            className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${styles.button}`}
            onClick={onAction}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLabel}
          </motion.button>
        )}
      </motion.div>

      {/* Help Text */}
      {helpText && (
        <motion.div
          className={`mt-6 w-full rounded-lg border ${styles.help} ${sizeConfig.help}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {helpTitle && (
            <h4 className="font-medium mb-1">{helpTitle}</h4>
          )}
          <p className="leading-relaxed">{helpText}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  error,
  onRetry,
  onContactSupport,
  showRetry = true,
  showSupport = true
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed bg-red-50 border-red-200 min-h-[200px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Error Icon */}
      <motion.div
        className="text-4xl mb-4 text-red-500"
        variants={iconVariants}
        animate="pulse"
      >
        ⚠️
      </motion.div>

      {/* Content */}
      <motion.div
        className="text-center"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {title}
        </h3>
        <p className="text-red-700 mb-6 max-w-sm">
          {message}
        </p>

        {/* Error Details (if provided) */}
        {error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-700">
              Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <motion.button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          )}

          {showSupport && onContactSupport && (
            <motion.button
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              onClick={onContactSupport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Help Text */}
      <motion.div
        className="mt-6 w-full rounded-lg border bg-red-100 border-red-200 p-4 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-red-700 leading-relaxed">
          Need help? Our support team is here to help you get back up and running quickly.
        </p>
      </motion.div>
    </motion.div>
  );
};

// ==================== PRESET COMPONENTS ====================
export const TenantEmptyState: React.FC<{ onAddTenant: () => void }> = ({ onAddTenant }) => (
  <EmptyState
    icon="🏢"
    title="Welcome to AI-BOS OS!"
    description="You haven't added any tenants yet. Let's get started by creating your first tenant."
    actionLabel="➕ Add Your First Tenant"
    onAction={onAddTenant}
    variant="info"
    helpTitle="What is a tenant?"
    helpText="A tenant represents a customer or organization using your AI-BOS OS platform. Each tenant has their own isolated workspace with their own data, users, and configurations."
    size="lg"
  />
);

export const ModuleEmptyState: React.FC<{ onDeployModule: () => void }> = ({ onDeployModule }) => (
  <EmptyState
    icon="📦"
    title="No Global Modules Yet"
    description="Global modules are available to all tenants. Let's deploy your first module."
    actionLabel="🚀 Deploy Your First Module"
    onAction={onDeployModule}
    variant="info"
    helpTitle="What are global modules?"
    helpText="These are system-wide modules that all tenants can access, like authentication, analytics, or core business logic. They provide shared functionality across your platform."
    size="lg"
  />
);

export const SSOEmptyState: React.FC<{ onConfigureSSO: () => void }> = ({ onConfigureSSO }) => (
  <EmptyState
    icon="🔐"
    title="SSO Not Configured"
    description="Single Sign-On (SSO) allows your tenants to use their existing identity providers."
    actionLabel="⚙️ Configure SSO"
    onAction={onConfigureSSO}
    variant="warning"
    helpTitle="Why SSO?"
    helpText="SSO improves security and user experience by allowing users to sign in with their existing credentials from providers like Google, Microsoft, or Okta."
    size="md"
  />
);

export const BillingEmptyState: React.FC<{ onCreateTenant: () => void }> = ({ onCreateTenant }) => (
  <EmptyState
    icon="💰"
    title="No Billing Data Yet"
    description="Billing information will appear here once you have active subscriptions."
    actionLabel="Create Your First Tenant"
    onAction={onCreateTenant}
    variant="info"
    helpText="Billing data is automatically generated when tenants subscribe to your services. You'll see revenue metrics, subscription details, and payment history here."
    size="md"
  />
);

export const LogsEmptyState: React.FC = () => (
  <EmptyState
    icon="📝"
    title="No System Logs Yet"
    description="System logs will appear here as activity occurs on your platform."
    variant="success"
    helpTitle="What are system logs?"
    helpText="These track all system activities, user actions, and security events for monitoring and debugging. They help you understand what's happening on your platform."
    size="md"
  />
);

export const DataEmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  helpText?: string;
}> = ({ title, description, actionLabel, onAction, helpText }) => (
  <EmptyState
    icon="📊"
    title={title}
    description={description}
    actionLabel={actionLabel}
    onAction={onAction}
    variant="info"
    helpText={helpText}
    size="md"
  />
);

// ==================== HOOKS ====================
export const useEmptyState = () => {
  const showEmptyState = (data: any[], emptyStateComponent: React.ReactNode) => {
    return data.length === 0 ? emptyStateComponent : null;
  };

  const showErrorState = (error: Error | null, errorStateComponent: React.ReactNode) => {
    return error ? errorStateComponent : null;
  };

  return {
    showEmptyState,
    showErrorState
  };
};

export default EmptyState;
