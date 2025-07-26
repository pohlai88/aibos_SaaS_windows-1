'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, AlertTriangle, Info, Settings,
  Filter, Search, Archive, Trash2, Eye, EyeOff,
  Clock, Star, MessageSquare, Zap
} from 'lucide-react';
import { useNotifications, useAIBOSStore } from '@/lib/store';

// ==================== TYPES ====================

interface NotificationGroup {
  id: string;
  title: string;
  count: number;
  type: 'all' | 'unread' | 'important' | 'system' | 'user';
  notifications: any[];
}

interface NotificationFilters {
  showRead: boolean;
  showSystem: boolean;
  showUser: boolean;
  showImportant: boolean;
  searchQuery: string;
}

// ==================== NOTIFICATION CENTER ====================

const NotificationCenter: React.FC = () => {
  const notifications = useNotifications();
  const { markNotificationRead, removeNotification, addNotification } = useAIBOSStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    showRead: true,
    showSystem: true,
    showUser: true,
    showImportant: true,
    searchQuery: ''
  });
  const [activeGroup, setActiveGroup] = useState<string>('all');

  // ==================== NOTIFICATION GROUPS ====================

  const getNotificationGroups = useCallback((): NotificationGroup[] => {
    const filteredNotifications = notifications.filter(notification => {
      if (!filters.showRead && notification.isRead) return false;
      if (!filters.showSystem && notification.type === 'info') return false;
      if (!filters.showUser && notification.type === 'success') return false;
      if (!filters.showImportant && notification.type === 'warning') return false;
      if (filters.searchQuery && !notification.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !notification.message.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      return true;
    });

    const groups: NotificationGroup[] = [
      {
        id: 'all',
        title: 'All Notifications',
        count: filteredNotifications.length,
        type: 'all',
        notifications: filteredNotifications
      },
      {
        id: 'unread',
        title: 'Unread',
        count: filteredNotifications.filter(n => !n.isRead).length,
        type: 'unread',
        notifications: filteredNotifications.filter(n => !n.isRead)
      },
      {
        id: 'important',
        title: 'Important',
        count: filteredNotifications.filter(n => n.type === 'warning' || n.type === 'error').length,
        type: 'important',
        notifications: filteredNotifications.filter(n => n.type === 'warning' || n.type === 'error')
      },
      {
        id: 'system',
        title: 'System',
        count: filteredNotifications.filter(n => n.type === 'info').length,
        type: 'system',
        notifications: filteredNotifications.filter(n => n.type === 'info')
      },
      {
        id: 'user',
        title: 'User',
        count: filteredNotifications.filter(n => n.type === 'success').length,
        type: 'user',
        notifications: filteredNotifications.filter(n => n.type === 'success')
      }
    ];

    return groups;
  }, [notifications, filters]);

  // ==================== ACTIONS ====================

  const handleMarkAllRead = useCallback(() => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markNotificationRead(notification.id);
      }
    });
  }, [notifications, markNotificationRead]);

  const handleClearAll = useCallback(() => {
    notifications.forEach(notification => {
      removeNotification(notification.id);
    });
  }, [notifications, removeNotification]);

  const handleMarkRead = useCallback((notificationId: string) => {
    markNotificationRead(notificationId);
  }, [markNotificationRead]);

  const handleRemoveNotification = useCallback((notificationId: string) => {
    removeNotification(notificationId);
  }, [removeNotification]);

  const handleNotificationAction = useCallback((notification: any) => {
    if (notification.action) {
      notification.action.onClick();
    }
    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }
  }, [markNotificationRead]);

  // ==================== UTILITY FUNCTIONS ====================

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return Check;
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500 bg-green-50 border-green-200';
      case 'error': return 'text-red-500 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // ==================== RENDER ====================

  const groups = getNotificationGroups();
  const activeGroupData = groups.find(g => g.id === activeGroup) || groups[0];

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          <Bell size={20} className="text-white" />
          {notifications.filter(n => !n.isRead).length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
            >
              {notifications.filter(n => !n.isRead).length}
            </motion.div>
          )}
        </motion.button>

        {/* Notification Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'showRead', label: 'Read', icon: Eye },
                    { key: 'showSystem', label: 'System', icon: Settings },
                    { key: 'showImportant', label: 'Important', icon: Star }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key as keyof NotificationFilters] }))}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${
                        filters[key as keyof NotificationFilters]
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Tabs */}
              <div className="flex border-b border-gray-100">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      activeGroup === group.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{group.title}</span>
                      {group.count > 0 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {group.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {activeGroupData.notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center text-gray-500"
                    >
                      <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                    </motion.div>
                  ) : (
                    activeGroupData.notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                            {React.createElement(getNotificationIcon(notification.type), { size: 16 })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Clock size={12} className="text-gray-400" />
                                  <span className="text-xs text-gray-400">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {notification.action && (
                                  <button
                                    onClick={() => handleNotificationAction(notification)}
                                    className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                                    title={notification.action.label}
                                  >
                                    <Zap size={14} />
                                  </button>
                                )}
                                {!notification.isRead && (
                                  <button
                                    onClick={() => handleMarkRead(notification.id)}
                                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                                    title="Mark as read"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Remove"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{activeGroupData.count} notification{activeGroupData.count !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    View all
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotificationCenter;
