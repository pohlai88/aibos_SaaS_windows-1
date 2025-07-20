'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface EmptyStateConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionLabel: string;
  actionType: 'primary' | 'secondary' | 'tertiary';
  category: string;
  priority: number;
  conditions: {
    module?: string;
    context?: string;
    userRole?: string;
    tenantType?: string;
  };
  suggestions?: string[];
  metadata?: Record<string, any>;
}

interface EmptyStateEngineProps {
  className?: string;
  context?: string;
  module?: string;
  userRole?: string;
  tenantType?: string;
  onAction?: (action: string, config: EmptyStateConfig) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

// ==================== CONSTANTS ====================
const EMPTY_STATE_CONFIGS: EmptyStateConfig[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI-BOS',
    description: 'Your revolutionary OS is ready! Start by exploring the available apps and features.',
    icon: '🚀',
    actionLabel: 'Get Started',
    actionType: 'primary',
    category: 'onboarding',
    priority: 100,
    conditions: {
      context: 'first-time'
    },
    suggestions: [
      'Browse the app store',
      'Check out the dashboard',
      'Explore system settings'
    ]
  },
  {
    id: 'no-apps',
    title: 'No Apps Installed',
    description: 'Your desktop is clean and ready for your favorite apps. Install some apps to get started.',
    icon: '📱',
    actionLabel: 'Browse Apps',
    actionType: 'primary',
    category: 'apps',
    priority: 90,
    conditions: {
      module: 'apps'
    },
    suggestions: [
      'Dashboard for analytics',
      'Tenant Manager for administration',
      'Module Registry for development'
    ]
  },
  {
    id: 'no-tenants',
    title: 'No Tenants Configured',
    description: 'Set up your first tenant to start managing your multi-tenant environment.',
    icon: '🏢',
    actionLabel: 'Create Tenant',
    actionType: 'primary',
    category: 'administration',
    priority: 85,
    conditions: {
      module: 'tenants'
    },
    suggestions: [
      'Create your first tenant',
      'Import existing data',
      'Configure tenant settings'
    ]
  },
  {
    id: 'no-modules',
    title: 'No Modules Available',
    description: 'Install modules to extend your AI-BOS platform with powerful features.',
    icon: '📦',
    actionLabel: 'Browse Modules',
    actionType: 'primary',
    category: 'development',
    priority: 80,
    conditions: {
      module: 'modules'
    },
    suggestions: [
      'CRM Module for customer management',
      'Accounting Module for financials',
      'Analytics Module for insights'
    ]
  },
  {
    id: 'no-data',
    title: 'No Data Available',
    description: 'Start by adding some data to see meaningful insights and analytics.',
    icon: '📊',
    actionLabel: 'Add Data',
    actionType: 'primary',
    category: 'analytics',
    priority: 75,
    conditions: {
      module: 'analytics'
    },
    suggestions: [
      'Import CSV files',
      'Connect external data sources',
      'Create sample data'
    ]
  },
  {
    id: 'no-collaboration',
    title: 'No Team Members',
    description: 'Invite team members to collaborate and work together on your projects.',
    icon: '👥',
    actionLabel: 'Invite Team',
    actionType: 'primary',
    category: 'collaboration',
    priority: 70,
    conditions: {
      module: 'collaboration'
    },
    suggestions: [
      'Invite team members',
      'Set up roles and permissions',
      'Create shared workspaces'
    ]
  },
  {
    id: 'no-ai-assistant',
    title: 'AI Assistant Ready',
    description: 'Your AI assistant is ready to help you automate tasks and get insights.',
    icon: '🤖',
    actionLabel: 'Activate AI',
    actionType: 'primary',
    category: 'ai',
    priority: 65,
    conditions: {
      module: 'ai-assistant'
    },
    suggestions: [
      'Ask for workflow automation',
      'Get data insights',
      'Generate reports'
    ]
  },
  {
    id: 'no-settings',
    title: 'System Settings',
    description: 'Configure your AI-BOS system preferences and security settings.',
    icon: '⚙️',
    actionLabel: 'Configure',
    actionType: 'secondary',
    category: 'system',
    priority: 60,
    conditions: {
      module: 'settings'
    },
    suggestions: [
      'Security settings',
      'Theme preferences',
      'Notification settings'
    ]
  },
  {
    id: 'no-help',
    title: 'Need Help?',
    description: 'Explore our documentation and support resources to get the most out of AI-BOS.',
    icon: '❓',
    actionLabel: 'Get Help',
    actionType: 'secondary',
    category: 'support',
    priority: 50,
    conditions: {
      module: 'help'
    },
    suggestions: [
      'Browse documentation',
      'Watch tutorials',
      'Contact support'
    ]
  }
];

// ==================== COMPONENTS ====================
interface EmptyStateCardProps {
  config: EmptyStateConfig;
  onAction: (action: string, config: EmptyStateConfig) => void;
  onSuggestionClick: (suggestion: string) => void;
  isPrimary?: boolean;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  config,
  onAction,
  onSuggestionClick,
  isPrimary = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getActionButtonClass = () => {
    switch (config.actionType) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'tertiary':
        return 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <motion.div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isPrimary ? 'shadow-xl' : 'shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="p-6 text-center">
        <motion.div
          className="text-4xl mb-4"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {config.icon}
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Action Button */}
      <div className="px-6 pb-4">
        <motion.button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${getActionButtonClass()}`}
          onClick={() => onAction(config.actionLabel.toLowerCase().replace(' ', '-'), config)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {config.actionLabel}
        </motion.button>
      </div>

      {/* Suggestions */}
      {config.suggestions && config.suggestions.length > 0 && (
        <div className="px-6 pb-6">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Suggestions
          </div>
          <div className="space-y-1">
            {config.suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                onClick={() => onSuggestionClick(suggestion)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.1 }}
              >
                • {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-4 right-4">
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
          {config.category}
        </span>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const EmptyStateEngine: React.FC<EmptyStateEngineProps> = ({
  className = '',
  context,
  module,
  userRole,
  tenantType,
  onAction,
  onSuggestionClick
}) => {
  const { trackEvent } = useSystemCore();
  const [selectedConfig, setSelectedConfig] = useState<EmptyStateConfig | null>(null);
  const [availableConfigs, setAvailableConfigs] = useState<EmptyStateConfig[]>([]);

  // Filter and sort empty state configurations based on context
  useEffect(() => {
    const filtered = EMPTY_STATE_CONFIGS.filter(config => {
      // Check if conditions match current context
      if (config.conditions.module && config.conditions.module !== module) {
        return false;
      }
      if (config.conditions.context && config.conditions.context !== context) {
        return false;
      }
      if (config.conditions.userRole && config.conditions.userRole !== userRole) {
        return false;
      }
      if (config.conditions.tenantType && config.conditions.tenantType !== tenantType) {
        return false;
      }
      return true;
    });

    // Sort by priority (higher priority first)
    const sorted = filtered.sort((a, b) => b.priority - a.priority);
    setAvailableConfigs(sorted);

    // Set the primary empty state (highest priority)
    if (sorted.length > 0) {
      setSelectedConfig(sorted[0]);
    }

    trackEvent('empty_state_engine_loaded', {
      context,
      module,
      userRole,
      tenantType,
      availableConfigs: sorted.length
    });
  }, [context, module, userRole, tenantType, trackEvent]);

  const handleAction = useCallback((action: string, config: EmptyStateConfig) => {
    onAction?.(action, config);
    trackEvent('empty_state_action_clicked', {
      action,
      configId: config.id,
      category: config.category
    });
  }, [onAction, trackEvent]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onSuggestionClick?.(suggestion);
    trackEvent('empty_state_suggestion_clicked', { suggestion });
  }, [onSuggestionClick, trackEvent]);

  const handleConfigSelect = useCallback((config: EmptyStateConfig) => {
    setSelectedConfig(config);
    trackEvent('empty_state_config_selected', {
      configId: config.id,
      category: config.category
    });
  }, [trackEvent]);

  if (availableConfigs.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Everything is Set Up!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your workspace is complete and ready to use.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Primary Empty State */}
      {selectedConfig && (
        <div className="mb-8">
          <EmptyStateCard
            config={selectedConfig}
            onAction={handleAction}
            onSuggestionClick={handleSuggestionClick}
            isPrimary={true}
          />
        </div>
      )}

      {/* Alternative Empty States */}
      {availableConfigs.length > 1 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Other Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {availableConfigs.slice(1).map((config, index) => (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EmptyStateCard
                    config={config}
                    onAction={handleAction}
                    onSuggestionClick={handleSuggestionClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Actions
        </h4>
        <div className="flex flex-wrap gap-2">
          <motion.button
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            onClick={() => handleAction('browse-apps', availableConfigs[0])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse Apps
          </motion.button>
          <motion.button
            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            onClick={() => handleAction('get-help', availableConfigs[0])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Help
          </motion.button>
          <motion.button
            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            onClick={() => handleAction('system-settings', availableConfigs[0])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Settings
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
