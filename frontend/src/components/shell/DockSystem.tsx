'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface DockApp {
  id: string;
  name: string;
  icon: string;
  isPinned: boolean;
  isRunning: boolean;
  isActive: boolean;
  windowCount: number;
  // Steve Jobs Bonus: Live Metrics
  metrics?: {
    cpuUsage: number;
    memoryUsage: number;
    performance: 'excellent' | 'good' | 'warning' | 'critical';
  };
  metadata: {
    lastLaunched: Date;
    launchCount: number;
    category: string;
  };
}

interface DockSystemProps {
  className?: string;
  onAppLaunch?: (appId: string) => void;
  onAppClose?: (appId: string) => void;
  onAppPin?: (appId: string, pinned: boolean) => void;
}

// ==================== CONSTANTS ====================
const DOCK_APPS: DockApp[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    isPinned: true,
    isRunning: false,
    isActive: false,
    windowCount: 0,
    metadata: {
      lastLaunched: new Date(),
      launchCount: 0,
      category: 'Productivity'
    }
  },
  {
    id: 'tenants',
    name: 'Tenants',
    icon: '🏢',
    isPinned: true,
    isRunning: false,
    isActive: false,
    windowCount: 0,
    metadata: {
      lastLaunched: new Date(),
      launchCount: 0,
      category: 'Administration'
    }
  },
  {
    id: 'modules',
    name: 'Modules',
    icon: '📦',
    isPinned: true,
    isRunning: false,
    isActive: false,
    windowCount: 0,
    metadata: {
      lastLaunched: new Date(),
      launchCount: 0,
      category: 'Development'
    }
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📈',
    isPinned: false,
    isRunning: false,
    isActive: false,
    windowCount: 0,
    metadata: {
      lastLaunched: new Date(),
      launchCount: 0,
      category: 'Analytics'
    }
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    isPinned: true,
    isRunning: false,
    isActive: false,
    windowCount: 0,
    metadata: {
      lastLaunched: new Date(),
      launchCount: 0,
      category: 'System'
    }
  },
  {
    id: 'help',
    name: 'Help',
    icon: '❓',
    isPinned: false,
    isRunning: false,
    isActive: false,
    windowCount: 0,
    metadata: {
      lastLaunched: new Date(),
      launchCount: 0,
      category: 'Support'
    }
  }
];

// ==================== COMPONENTS ====================
interface DockAppIconProps {
  app: DockApp;
  onLaunch: (appId: string) => void;
  onClose: (appId: string) => void;
  onPin: (appId: string, pinned: boolean) => void;
  onContextMenu: (app: DockApp, event: React.MouseEvent) => void;
}

const DockAppIcon: React.FC<DockAppIconProps> = ({
  app,
  onLaunch,
  onClose,
  onPin,
  onContextMenu
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (app.isRunning) {
      // Focus existing window
      onLaunch(app.id);
    } else {
      // Launch new instance
      onLaunch(app.id);
    }
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onContextMenu(app, event);
  };

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* App Icon */}
      <motion.button
        className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
          app.isActive
            ? 'bg-blue-500/20 border-2 border-blue-400 shadow-lg'
            : app.isRunning
            ? 'bg-green-500/20 border-2 border-green-400 shadow-md'
            : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
        }`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* App Icon */}
        <span className="text-2xl">{app.icon}</span>

        {/* Running Indicator with Live Metrics */}
        {app.isRunning && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Performance-based indicator color */}
            <motion.div
              className={`w-full h-full rounded-full ${
                app.metrics?.performance === 'critical' ? 'bg-red-400' :
                app.metrics?.performance === 'warning' ? 'bg-yellow-400' :
                app.metrics?.performance === 'good' ? 'bg-blue-400' : 'bg-green-400'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* CPU Usage Mini Bar */}
            {app.metrics && (
              <motion.div
                className="absolute -top-1 -left-1 w-1 h-2 bg-white/80 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className={`h-full ${
                    app.metrics.performance === 'critical' ? 'bg-red-500' :
                    app.metrics.performance === 'warning' ? 'bg-yellow-500' :
                    app.metrics.performance === 'good' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${app.metrics.cpuUsage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Window Count Badge */}
        {app.windowCount > 1 && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {app.windowCount}
          </motion.div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg whitespace-nowrap z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="font-medium">{app.name}</div>
            {app.isRunning && (
              <div className="text-xs opacity-80">
                {app.windowCount} window{app.windowCount !== 1 ? 's' : ''} open
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const DockSystem: React.FC<DockSystemProps> = ({
  className = '',
  onAppLaunch,
  onAppClose,
  onAppPin
}) => {
  const { trackEvent } = useSystemCore();
  const [apps, setApps] = useState<DockApp[]>(DOCK_APPS);
  const [contextMenu, setContextMenu] = useState<{
    app: DockApp;
    x: number;
    y: number;
  } | null>(null);

  // Steve Jobs Bonus: Live Metrics Simulation
  useEffect(() => {
    const updateMetrics = () => {
      setApps(prev => prev.map(app => {
        if (app.isRunning) {
          return {
            ...app,
            metrics: {
              cpuUsage: Math.random() * 80 + 10, // 10-90%
              memoryUsage: Math.random() * 500 + 100, // 100-600 MB
              performance:
                Math.random() > 0.8 ? 'critical' :
                Math.random() > 0.6 ? 'warning' :
                Math.random() > 0.3 ? 'good' : 'excellent'
            }
          };
        }
        return app;
      }));
    };

    // Update metrics every 3 seconds for running apps
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load pinned apps from localStorage
  useEffect(() => {
    const savedPinnedApps = localStorage.getItem('aibos-dock-pinned-apps');
    if (savedPinnedApps) {
      try {
        const pinnedAppIds = JSON.parse(savedPinnedApps) || [];
        setApps(prev => prev.map(app => ({
          ...app,
          isPinned: (pinnedAppIds || []).includes(app.id)
        })));
      } catch (error) {
        console.warn('Failed to load pinned apps:', error);
      }
    }
  }, []);

  // Save pinned apps to localStorage
  useEffect(() => {
    const pinnedAppIds = apps.filter(app => app.isPinned).map(app => app.id);
    localStorage.setItem('aibos-dock-pinned-apps', JSON.stringify(pinnedAppIds));
  }, [apps]);

  const handleAppLaunch = useCallback((appId: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          isRunning: true,
          isActive: true,
          windowCount: app.windowCount + 1,
          metadata: {
            ...app.metadata,
            lastLaunched: new Date(),
            launchCount: app.metadata.launchCount + 1
          }
        };
      }
      return {
        ...app,
        isActive: false
      };
    }));

    onAppLaunch?.(appId);
    trackEvent('dock_app_launched', { appId });
  }, [onAppLaunch, trackEvent]);

  const handleAppClose = useCallback((appId: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        const newWindowCount = Math.max(0, app.windowCount - 1);
        return {
          ...app,
          isRunning: newWindowCount > 0,
          isActive: false,
          windowCount: newWindowCount
        };
      }
      return app;
    }));

    onAppClose?.(appId);
    trackEvent('dock_app_closed', { appId });
  }, [onAppClose, trackEvent]);

  const handleAppPin = useCallback((appId: string, pinned: boolean) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        return { ...app, isPinned: pinned };
      }
      return app;
    }));

    onAppPin?.(appId, pinned);
    trackEvent('dock_app_pinned', { appId, pinned });
  }, [onAppPin, trackEvent]);

  const handleContextMenu = useCallback((app: DockApp, event: React.MouseEvent) => {
    setContextMenu({
      app,
      x: event.clientX,
      y: event.clientY
    });
  }, []);

  const handleContextMenuAction = useCallback((action: string) => {
    if (!contextMenu) return;

    const { app } = contextMenu;

    switch (action) {
      case 'launch':
        handleAppLaunch(app.id);
        break;
      case 'close':
        handleAppClose(app.id);
        break;
      case 'pin':
        handleAppPin(app.id, !app.isPinned);
        break;
      case 'new-window':
        handleAppLaunch(app.id);
        break;
    }

    setContextMenu(null);
  }, [contextMenu, handleAppLaunch, handleAppClose, handleAppPin]);

  // Sort apps: pinned first, then by last launched
  const sortedApps = [...apps].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.metadata.lastLaunched.getTime() - a.metadata.lastLaunched.getTime();
  });

  return (
    <>
      {/* Dock Container */}
      <motion.div
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 z-40 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* App Icons */}
        <div className="flex items-center space-x-2">
          <AnimatePresence>
            {sortedApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <DockAppIcon
                  app={app}
                  onLaunch={handleAppLaunch}
                  onClose={handleAppClose}
                  onPin={handleAppPin}
                  onContextMenu={handleContextMenu}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContextMenu(null)}
            />

            {/* Menu */}
            <motion.div
              className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-48"
              style={{
                left: contextMenu.x,
                top: contextMenu.y
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleContextMenuAction('launch')}
              >
                {contextMenu.app.isRunning ? 'Focus Window' : 'Launch'}
              </button>

              {contextMenu.app.isRunning && (
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleContextMenuAction('new-window')}
                >
                  New Window
                </button>
              )}

              {contextMenu.app.isRunning && (
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleContextMenuAction('close')}
                >
                  Close All Windows
                </button>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleContextMenuAction('pin')}
              >
                {contextMenu.app.isPinned ? 'Unpin from Dock' : 'Pin to Dock'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
