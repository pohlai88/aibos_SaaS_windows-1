'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { z } from 'zod';

// Enhanced compliance-aware notification schema
const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['info', 'success', 'warning', 'error', 'compliance', 'security']),
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  category: z.enum(['system', 'user', 'compliance', 'security', 'business']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  priority: z.number().int().min(1).max(10),
  timestamp: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  actions: z.array(z.object({
    label: z.string().min(1).max(30),
    action: z.string().min(1),
    icon: z.string().min(1),
    type: z.enum(['primary', 'secondary', 'danger'])
  })).optional().default([]),
  metadata: z.object({
    userId: z.string().optional(),
    tenantId: z.string().optional(),
    resource: z.string().optional(),
    complianceContext: z.object({
      ruleId: z.string().optional(),
      complianceType: z.enum(['gdpr', 'soc2', 'hipaa', 'iso_27001', 'ccpa', 'lgpd', 'custom']).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
    }).optional(),
    auditTrail: z.object({
      action: z.string(),
      ipAddress: z.string().ip().optional(),
      userAgent: z.string().optional(),
      sessionId: z.string().optional()
    }).optional()
  }).optional().default({}),
  isRead: z.boolean().default(false),
  isDismissed: z.boolean().default(false)
}).strict();

type Notification = z.infer<typeof NotificationSchema>;

interface NotificationTrayProps {
  onNotificationAction?: (notificationId: string, action: string) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onNotificationRead?: (notificationId: string) => void;
  maxNotifications?: number;
  storageKey?: string;
}

export const NotificationTray: React.FC<NotificationTrayProps> = ({
  onNotificationAction = () => {},
  onNotificationDismiss = () => {},
  onNotificationRead = () => {},
  maxNotifications = 100,
  storageKey = 'notification-tray'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validated = parsed.map(item => NotificationSchema.parse(item));
          setNotifications(validated.slice(0, maxNotifications));
        }
      }
    } catch (err) {
      console.error('Failed to load notifications from storage', err);
    }
  }, [storageKey, maxNotifications]);

  // Save to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notifications));
      } catch (err) {
        console.error('Failed to save notifications to storage', err);
      }
    }
  }, [notifications, storageKey]);

  // Counters
  const { unreadCount, criticalCount } = useMemo(() => {
    const unread = notifications.filter(n => !n.isRead && !n.isDismissed).length;
    const critical = notifications.filter(n =>
      n.severity === 'critical' && !n.isDismissed
    ).length;
    return { unreadCount: unread, criticalCount: critical };
  }, [notifications]);

  // Priority calculation
  const getNotificationPriority = useCallback((notification: Notification): number => {
    let priority = notification.priority;

    // Boost compliance and security notifications
    if (notification.type === 'compliance' || notification.type === 'security') {
      priority += 2;
    }

    // Boost critical severity notifications
    if (notification.severity === 'critical') {
      priority += 3;
    }

    // Boost unread notifications
    if (!notification.isRead) {
      priority += 1;
    }

    return Math.min(priority, 10);
  }, []);

  // Sorted notifications
  const sortedNotifications = useMemo(() => {
    return notifications
      .filter(n => !n.isDismissed)
      .sort((a, b) => {
        const priorityA = getNotificationPriority(a);
        const priorityB = getNotificationPriority(b);

        if (priorityA !== priorityB) {
          return priorityB - priorityA;
        }

        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, maxNotifications);
  }, [notifications, getNotificationPriority, maxNotifications]);

  // Auto-expire notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev => prev.filter(n => {
        if (n.expiresAt && new Date(n.expiresAt) < now) {
          return false;
        }
        return true;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Notification handlers
  const handleNotificationAction = useCallback((notificationId: string, action: string) => {
    onNotificationAction(notificationId, action);
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  }, [onNotificationAction]);

  const handleNotificationDismiss = useCallback((notificationId: string) => {
    onNotificationDismiss(notificationId);
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, isDismissed: true } : n
    ));
  }, [onNotificationDismiss]);

  const handleNotificationRead = useCallback((notificationId: string) => {
    onNotificationRead(notificationId);
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  }, [onNotificationRead]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isDismissed: true })));
  }, []);

  // Notification rendering helpers
  const getNotificationIcon = useCallback((type: Notification['type'], severity: Notification['severity']) => {
    switch (type) {
      case 'compliance':
        return severity === 'critical' ? '🚨' : '📋';
      case 'security':
        return severity === 'critical' ? '🔒' : '🛡️';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  }, []);

  const getNotificationColor = useCallback((type: Notification['type'], severity: Notification['severity']) => {
    if (severity === 'critical') return 'border-red-500 bg-red-50';
    if (severity === 'high') return 'border-orange-500 bg-orange-50';

    switch (type) {
      case 'compliance':
        return 'border-purple-500 bg-purple-50';
      case 'security':
        return 'border-blue-500 bg-blue-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'info':
      default:
        return 'border-gray-500 bg-gray-50';
    }
  }, []);

  // Animation variants with proper typing
  const trayVariants: Variants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 20,
      rotateX: -15
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      } as Transition
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -20,
      rotateX: 15,
      transition: {
        duration: 0.3
      } as Transition
    }
  };

  const notificationVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      } as Transition
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      } as Transition
    }
  };

  // Notification item component with proper typing
  const NotificationItem = React.memo(({ notification }: { notification: Notification }) => (
    <motion.div
      className={`p-4 rounded-xl border-l-4 ${getNotificationColor(notification.type, notification.severity)} ${
        !notification.isRead ? 'ring-2 ring-blue-200' : ''
      }`}
      variants={notificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={() => handleNotificationRead(notification.id)}
      aria-live={notification.severity === 'critical' ? 'assertive' : 'polite'}
      role="alert"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {getNotificationIcon(notification.type, notification.severity)}
          </span>
          <h4 className="font-semibold text-gray-800">
            {notification.title}
          </h4>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
          )}
        </div>
        <motion.button
          className="w-5 h-5 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            handleNotificationDismiss(notification.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Dismiss ${notification.title} notification`}
        >
          ✕
        </motion.button>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {notification.message}
      </p>

      {notification.metadata?.complianceContext && (
        <div className="mb-3 p-2 bg-purple-100 rounded-lg">
          <div className="text-xs text-purple-700 font-medium">
            Compliance: {notification.metadata.complianceContext.complianceType?.toUpperCase()}
          </div>
          {notification.metadata.complianceContext.ruleId && (
            <div className="text-xs text-purple-600">
              Rule: {notification.metadata.complianceContext.ruleId}
            </div>
          )}
        </div>
      )}

      {notification.actions && notification.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {notification.actions.map((action, index) => (
            <motion.button
              key={index}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                action.type === 'primary'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : action.type === 'danger'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationAction(notification.id, action.action);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={action.label}
            >
              <span className="mr-1">{action.icon}</span>
              {action.label}
            </motion.button>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        {new Date(notification.timestamp).toLocaleString()}
      </div>
    </motion.div>
  ));

  return (
    <div
      className="notification-tray fixed top-6 right-6 z-50"
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
    >
      {/* Notification Bell */}
      <motion.button
        className="relative w-12 h-12 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-xl cursor-pointer hover:bg-white transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        🔔

        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {criticalCount > 0 && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
            aria-hidden="true"
          />
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-16 right-0 w-96 max-h-[600px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            variants={trayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-modal="true"
            role="dialog"
          >
            <div className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  🔔
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">Notifications</h3>
                  <p className="text-gray-500 text-xs">
                    {unreadCount} unread, {criticalCount} critical
                  </p>
                </div>
              </div>
              <motion.button
                className="w-6 h-6 text-gray-500 hover:bg-gray-200 rounded-full flex items-center justify-center"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close notifications"
              >
                ✕
              </motion.button>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔕</div>
                  <div className="text-gray-600 mb-2">No notifications</div>
                  <div className="text-sm text-gray-500">
                    You're all caught up!
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {sortedNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {sortedNotifications.length > 0 && (
              <div className="h-12 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-6">
                <button
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={markAllAsRead}
                  aria-label="Mark all notifications as read"
                >
                  Mark all as read
                </button>
                <button
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={clearAll}
                  aria-label="Clear all notifications"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced hook for managing notifications
export const useNotificationTray = () => {
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => {
    const newNotification = NotificationSchema.parse({
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      isRead: false,
      isDismissed: false
    });
    return newNotification;
  }, []);

  const clearNotifications = useCallback(() => {
    return [];
  }, []);

  return {
    addNotification,
    clearNotifications
  };
};
