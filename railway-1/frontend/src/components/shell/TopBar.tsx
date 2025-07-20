'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface TopBarProps {
  className?: string;
  onMenuAction?: (action: string) => void;
  onUserAction?: (action: string) => void;
  onSearch?: (query: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: string;
  category: 'system' | 'user' | 'help';
  shortcut?: string;
}

// ==================== CONSTANTS ====================
const SYSTEM_MENU_ITEMS: MenuItem[] = [
  {
    id: 'about',
    label: 'About AI-BOS',
    icon: 'ℹ️',
    action: 'about',
    category: 'system'
  },
  {
    id: 'preferences',
    label: 'System Preferences',
    icon: '⚙️',
    action: 'preferences',
    category: 'system',
    shortcut: '⌘,'
  },
  {
    id: 'services',
    label: 'Services',
    icon: '🔧',
    action: 'services',
    category: 'system'
  },
  {
    id: 'hide',
    label: 'Hide AI-BOS',
    icon: '👁️',
    action: 'hide',
    category: 'system',
    shortcut: '⌘H'
  },
  {
    id: 'quit',
    label: 'Quit AI-BOS',
    icon: '🚪',
    action: 'quit',
    category: 'system',
    shortcut: '⌘Q'
  }
];

const USER_MENU_ITEMS: MenuItem[] = [
  {
    id: 'profile',
    label: 'User Profile',
    icon: '👤',
    action: 'profile',
    category: 'user'
  },
  {
    id: 'settings',
    label: 'Account Settings',
    icon: '🔐',
    action: 'settings',
    category: 'user'
  },
  {
    id: 'tenants',
    label: 'Switch Tenant',
    icon: '🏢',
    action: 'tenants',
    category: 'user'
  },
  {
    id: 'logout',
    label: 'Log Out',
    icon: '🚪',
    action: 'logout',
    category: 'user'
  }
];

const HELP_MENU_ITEMS: MenuItem[] = [
  {
    id: 'help',
    label: 'AI-BOS Help',
    icon: '❓',
    action: 'help',
    category: 'help',
    shortcut: '⌘?'
  },
  {
    id: 'docs',
    label: 'Documentation',
    icon: '📚',
    action: 'docs',
    category: 'help'
  },
  {
    id: 'support',
    label: 'Contact Support',
    icon: '💬',
    action: 'support',
    category: 'help'
  }
];

// ==================== COMPONENTS ====================
interface MenuButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  isActive?: boolean;
  shortcut?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  icon,
  onClick,
  isActive = false,
  shortcut
}) => {
  return (
    <motion.button
      className={`flex items-center w-full px-4 py-2 text-left text-sm transition-colors ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
      whileHover={{ backgroundColor: isActive ? undefined : 'rgba(0,0,0,0.05)' }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="mr-3 text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs opacity-60 ml-2">{shortcut}</span>
      )}
    </motion.button>
  );
};

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search apps, files, and more..."
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  return (
    <motion.div
      className={`relative flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-400 bg-white/20' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      whileFocus={{ scale: 1.02 }}
    >
      <span className="text-gray-400 mr-2">🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
      />
      {query && (
        <motion.button
          className="text-gray-400 hover:text-white transition-colors"
          onClick={() => handleSearch('')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const TopBar: React.FC<TopBarProps> = ({
  className = '',
  onMenuAction,
  onUserAction,
  onSearch
}) => {
  const { trackEvent, config } = useSystemCore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '👤',
    tenant: 'Acme Corp'
  });

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = useCallback((menuType: string) => {
    if (activeMenu === menuType) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuType);
    }
    trackEvent('topbar_menu_clicked', { menuType });
  }, [activeMenu, trackEvent]);

  const handleMenuAction = useCallback((action: string) => {
    setActiveMenu(null);
    onMenuAction?.(action);
    trackEvent('topbar_menu_action', { action });
  }, [onMenuAction, trackEvent]);

  const handleUserAction = useCallback((action: string) => {
    setActiveMenu(null);
    onUserAction?.(action);
    trackEvent('topbar_user_action', { action });
  }, [onUserAction, trackEvent]);

  const handleSearch = useCallback((query: string) => {
    onSearch?.(query);
    trackEvent('topbar_search', { query });
  }, [onSearch, trackEvent]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-30 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - System Menu */}
        <div className="flex items-center space-x-4">
          {/* AI-BOS Logo */}
          <motion.div
            className="flex items-center space-x-2 text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">🚀</span>
            <span className="text-sm">AI-BOS</span>
          </motion.div>

          {/* System Menu */}
          <div className="relative">
            <motion.button
              className="px-3 py-1 text-white text-sm hover:bg-white/20 rounded transition-colors"
              onClick={() => handleMenuClick('system')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🍎 System
            </motion.button>

            <AnimatePresence>
              {activeMenu === 'system' && (
                <motion.div
                  className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-48 z-50"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  {SYSTEM_MENU_ITEMS.map((item) => (
                    <MenuButton
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      shortcut={item.shortcut}
                      onClick={() => handleMenuAction(item.action)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help Menu */}
          <div className="relative">
            <motion.button
              className="px-3 py-1 text-white text-sm hover:bg-white/20 rounded transition-colors"
              onClick={() => handleMenuClick('help')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ❓ Help
            </motion.button>

            <AnimatePresence>
              {activeMenu === 'help' && (
                <motion.div
                  className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-48 z-50"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  {HELP_MENU_ITEMS.map((item) => (
                    <MenuButton
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      shortcut={item.shortcut}
                      onClick={() => handleMenuAction(item.action)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Right Section - User & Time */}
        <div className="flex items-center space-x-4">
          {/* Current Tenant */}
          <motion.div
            className="text-white text-sm opacity-80"
            whileHover={{ scale: 1.05 }}
          >
            {userProfile.tenant}
          </motion.div>

          {/* Time & Date */}
          <motion.div
            className="text-white text-sm text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="font-medium">{formatTime(currentTime)}</div>
            <div className="text-xs opacity-80">{formatDate(currentTime)}</div>
          </motion.div>

          {/* User Profile */}
          <div className="relative">
            <motion.button
              className="flex items-center space-x-2 text-white hover:bg-white/20 rounded-lg px-3 py-1 transition-colors"
              onClick={() => handleMenuClick('user')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">{userProfile.avatar}</span>
              <span className="text-sm font-medium">{userProfile.name}</span>
            </motion.button>

            <AnimatePresence>
              {activeMenu === 'user' && (
                <motion.div
                  className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-48 z-50"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  {/* User Info Header */}
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {userProfile.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {userProfile.email}
                    </div>
                  </div>

                  {/* User Menu Items */}
                  {USER_MENU_ITEMS.map((item) => (
                    <MenuButton
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      onClick={() => handleUserAction(item.action)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Backdrop for menus */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMenu(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
