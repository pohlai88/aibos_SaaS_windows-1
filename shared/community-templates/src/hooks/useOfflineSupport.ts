/**
 * AI-BOS Community Templates - Offline Support Hook
 *
 * Comprehensive offline support for caching templates, user data,
 * and providing offline functionality with sync capabilities.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger, monitoring } from '@aibos/shared/lib';

// Types
import type {
  AppTemplate,
  UserProfile,
  UserCollection,
  OfflineData,
  TemplateEvent,
} from '../types';

// ============================================================================
// OFFLINE SUPPORT TYPES
// ============================================================================

export interface OfflineSupportOptions {
  /** Enable offline support */
  enabled?: boolean;
  /** Cache expiration time in milliseconds */
  cacheExpiry?: number;
  /** Maximum cache size in MB */
  maxCacheSize?: number;
  /** Enable background sync */
  enableBackgroundSync?: boolean;
  /** Sync interval in milliseconds */
  syncInterval?: number;
  /** Enable push notifications for sync */
  enablePushNotifications?: boolean;
}

export interface OfflineSupportResult {
  /** Whether device is online */
  isOnline: boolean;
  /** Whether data is cached */
  isCached: boolean;
  /** Last sync timestamp */
  lastSync: number;
  /** Cache size in bytes */
  cacheSize: number;
  /** Pending actions count */
  pendingActionsCount: number;
  /** Sync status */
  syncStatus: 'idle' | 'syncing' | 'error';
  /** Cache templates */
  cacheTemplates: (templates: AppTemplate[]) => Promise<void>;
  /** Get cached templates */
  getCachedTemplates: () => Promise<AppTemplate[]>;
  /** Cache user profile */
  cacheUserProfile: (profile: UserProfile) => Promise<void>;
  /** Get cached user profile */
  getCachedUserProfile: () => Promise<UserProfile | null>;
  /** Cache collections */
  cacheCollections: (collections: UserCollection[]) => Promise<void>;
  /** Get cached collections */
  getCachedCollections: () => Promise<UserCollection[]>;
  /** Add pending action */
  addPendingAction: (action: TemplateEvent) => Promise<void>;
  /** Get pending actions */
  getPendingActions: () => Promise<TemplateEvent[]>;
  /** Clear pending actions */
  clearPendingActions: () => Promise<void>;
  /** Sync data */
  syncData: () => Promise<void>;
  /** Clear cache */
  clearCache: () => Promise<void>;
  /** Get cache info */
  getCacheInfo: () => Promise<{
    size: number;
    itemCount: number;
    lastUpdated: number;
    templates: number;
    collections: number;
    actions: number;
  }>;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  TEMPLATES: 'aibos_templates_cache',
  USER_PROFILE: 'aibos_user_profile_cache',
  COLLECTIONS: 'aibos_collections_cache',
  PENDING_ACTIONS: 'aibos_pending_actions',
  CACHE_METADATA: 'aibos_cache_metadata',
  LAST_SYNC: 'aibos_last_sync',
} as const;

// ============================================================================
// OFFLINE SUPPORT HOOK
// ============================================================================

/**
 * Offline support hook for caching and syncing data
 */
export function useOfflineSupport(options: OfflineSupportOptions = {}): OfflineSupportResult {
  const {
    enabled = true,
    cacheExpiry = 24 * 60 * 60 * 1000, // 24 hours
    maxCacheSize = 50 * 1024 * 1024, // 50MB
    enableBackgroundSync = true,
    syncInterval = 5 * 60 * 1000, // 5 minutes
    enablePushNotifications = false,
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [isOnline, setIsOnline] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [lastSync, setLastSync] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialized = useRef(false);

  // ============================================================================
  // STORAGE UTILITIES
  // ============================================================================

  /**
   * Check if storage is available
   */
  const isStorageAvailable = useCallback((): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Get storage size
   */
  const getStorageSize = useCallback((): number => {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }, []);

  /**
   * Save data to storage
   */
  const saveToStorage = useCallback(
    async <T>(key: string, data: T): Promise<void> => {
      if (!isStorageAvailable()) {
        throw new Error('Storage not available');
      }

      try {
        const serialized = JSON.stringify({
          data,
          timestamp: Date.now(),
          version: '1.0.0',
        });

        localStorage.setItem(key, serialized);

        // Update cache size
        setCacheSize(getStorageSize());

        logger.info('Data saved to storage', { key, size: serialized.length });
      } catch (error) {
        logger.error('Failed to save data to storage', { key, error });
        throw error;
      }
    },
    [isStorageAvailable, getStorageSize],
  );

  /**
   * Load data from storage
   */
  const loadFromStorage = useCallback(
    async <T>(key: string): Promise<T | null> => {
      if (!isStorageAvailable()) {
        return null;
      }

      try {
        const serialized = localStorage.getItem(key);
        if (!serialized) return null;

        const parsed = JSON.parse(serialized);

        // Check if data is expired
        if (Date.now() - parsed.timestamp > cacheExpiry) {
          localStorage.removeItem(key);
          return null;
        }

        return parsed.data;
      } catch (error) {
        logger.error('Failed to load data from storage', { key, error });
        return null;
      }
    },
    [isStorageAvailable, cacheExpiry],
  );

  /**
   * Remove data from storage
   */
  const removeFromStorage = useCallback(
    async (key: string): Promise<void> => {
      if (!isStorageAvailable()) return;

      try {
        localStorage.removeItem(key);
        setCacheSize(getStorageSize());
        logger.info('Data removed from storage', { key });
      } catch (error) {
        logger.error('Failed to remove data from storage', { key, error });
      }
    },
    [isStorageAvailable, getStorageSize],
  );

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  /**
   * Cache templates
   */
  const cacheTemplates = useCallback(
    async (templates: AppTemplate[]): Promise<void> => {
      if (!enabled) return;

      try {
        await saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
        setIsCached(true);

        // Update cache metadata
        const metadata = (await loadFromStorage(STORAGE_KEYS.CACHE_METADATA)) || {};
        metadata.templates = templates.length;
        metadata.lastUpdated = Date.now();
        await saveToStorage(STORAGE_KEYS.CACHE_METADATA, metadata);

        logger.info('Templates cached successfully', { count: templates.length });
      } catch (error) {
        logger.error('Failed to cache templates', { error });
        throw error;
      }
    },
    [enabled, saveToStorage, loadFromStorage],
  );

  /**
   * Get cached templates
   */
  const getCachedTemplates = useCallback(async (): Promise<AppTemplate[]> => {
    if (!enabled) return [];

    try {
      const templates = await loadFromStorage<AppTemplate[]>(STORAGE_KEYS.TEMPLATES);
      return templates || [];
    } catch (error) {
      logger.error('Failed to get cached templates', { error });
      return [];
    }
  }, [enabled, loadFromStorage]);

  /**
   * Cache user profile
   */
  const cacheUserProfile = useCallback(
    async (profile: UserProfile): Promise<void> => {
      if (!enabled) return;

      try {
        await saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
        logger.info('User profile cached successfully');
      } catch (error) {
        logger.error('Failed to cache user profile', { error });
        throw error;
      }
    },
    [enabled, saveToStorage],
  );

  /**
   * Get cached user profile
   */
  const getCachedUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!enabled) return null;

    try {
      return await loadFromStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      logger.error('Failed to get cached user profile', { error });
      return null;
    }
  }, [enabled, loadFromStorage]);

  /**
   * Cache collections
   */
  const cacheCollections = useCallback(
    async (collections: UserCollection[]): Promise<void> => {
      if (!enabled) return;

      try {
        await saveToStorage(STORAGE_KEYS.COLLECTIONS, collections);

        // Update cache metadata
        const metadata = (await loadFromStorage(STORAGE_KEYS.CACHE_METADATA)) || {};
        metadata.collections = collections.length;
        metadata.lastUpdated = Date.now();
        await saveToStorage(STORAGE_KEYS.CACHE_METADATA, metadata);

        logger.info('Collections cached successfully', { count: collections.length });
      } catch (error) {
        logger.error('Failed to cache collections', { error });
        throw error;
      }
    },
    [enabled, saveToStorage, loadFromStorage],
  );

  /**
   * Get cached collections
   */
  const getCachedCollections = useCallback(async (): Promise<UserCollection[]> => {
    if (!enabled) return [];

    try {
      const collections = await loadFromStorage<UserCollection[]>(STORAGE_KEYS.COLLECTIONS);
      return collections || [];
    } catch (error) {
      logger.error('Failed to get cached collections', { error });
      return [];
    }
  }, [enabled, loadFromStorage]);

  // ============================================================================
  // PENDING ACTIONS
  // ============================================================================

  /**
   * Add pending action
   */
  const addPendingAction = useCallback(
    async (action: TemplateEvent): Promise<void> => {
      if (!enabled) return;

      try {
        const actions =
          (await loadFromStorage<TemplateEvent[]>(STORAGE_KEYS.PENDING_ACTIONS)) || [];
        actions.push({
          ...action,
          timestamp: Date.now(),
        });

        await saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, actions);
        setPendingActionsCount(actions.length);

        logger.info('Pending action added', { action: action.type });
      } catch (error) {
        logger.error('Failed to add pending action', { error });
        throw error;
      }
    },
    [enabled, loadFromStorage, saveToStorage],
  );

  /**
   * Get pending actions
   */
  const getPendingActions = useCallback(async (): Promise<TemplateEvent[]> => {
    if (!enabled) return [];

    try {
      const actions = await loadFromStorage<TemplateEvent[]>(STORAGE_KEYS.PENDING_ACTIONS);
      return actions || [];
    } catch (error) {
      logger.error('Failed to get pending actions', { error });
      return [];
    }
  }, [enabled, loadFromStorage]);

  /**
   * Clear pending actions
   */
  const clearPendingActions = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    try {
      await removeFromStorage(STORAGE_KEYS.PENDING_ACTIONS);
      setPendingActionsCount(0);
      logger.info('Pending actions cleared');
    } catch (error) {
      logger.error('Failed to clear pending actions', { error });
      throw error;
    }
  }, [enabled, removeFromStorage]);

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  /**
   * Sync data
   */
  const syncData = useCallback(async (): Promise<void> => {
    if (!enabled || !isOnline) return;

    setSyncStatus('syncing');

    try {
      // Get pending actions
      const actions = await getPendingActions();

      if (actions.length > 0) {
        // Process pending actions
        for (const action of actions) {
          try {
            // Send action to server
            await fetch('/api/templates/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action),
            });
          } catch (error) {
            logger.error('Failed to sync action', { action, error });
          }
        }

        // Clear processed actions
        await clearPendingActions();
      }

      // Update last sync time
      const syncTime = Date.now();
      setLastSync(syncTime);
      await saveToStorage(STORAGE_KEYS.LAST_SYNC, syncTime);

      setSyncStatus('idle');
      logger.info('Data synced successfully', { actionsCount: actions.length });
    } catch (error) {
      setSyncStatus('error');
      logger.error('Failed to sync data', { error });

      // Report to monitoring
      monitoring.captureException(error, {
        tags: { component: 'OfflineSupport', operation: 'sync' },
      });
    }
  }, [enabled, isOnline, getPendingActions, clearPendingActions, saveToStorage]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    try {
      await Promise.all([
        removeFromStorage(STORAGE_KEYS.TEMPLATES),
        removeFromStorage(STORAGE_KEYS.USER_PROFILE),
        removeFromStorage(STORAGE_KEYS.COLLECTIONS),
        removeFromStorage(STORAGE_KEYS.PENDING_ACTIONS),
        removeFromStorage(STORAGE_KEYS.CACHE_METADATA),
        removeFromStorage(STORAGE_KEYS.LAST_SYNC),
      ]);

      setIsCached(false);
      setLastSync(0);
      setCacheSize(0);
      setPendingActionsCount(0);

      logger.info('Cache cleared successfully');
    } catch (error) {
      logger.error('Failed to clear cache', { error });
      throw error;
    }
  }, [enabled, removeFromStorage]);

  /**
   * Get cache info
   */
  const getCacheInfo = useCallback(async () => {
    if (!enabled) {
      return {
        size: 0,
        itemCount: 0,
        lastUpdated: 0,
        templates: 0,
        collections: 0,
        actions: 0,
      };
    }

    try {
      const metadata = (await loadFromStorage(STORAGE_KEYS.CACHE_METADATA)) || {};
      const actions = await getPendingActions();

      return {
        size: cacheSize,
        itemCount: Object.keys(localStorage).filter((key) => key.startsWith('aibos_')).length,
        lastUpdated: metadata.lastUpdated || 0,
        templates: metadata.templates || 0,
        collections: metadata.collections || 0,
        actions: actions.length,
      };
    } catch (error) {
      logger.error('Failed to get cache info', { error });
      return {
        size: 0,
        itemCount: 0,
        lastUpdated: 0,
        templates: 0,
        collections: 0,
        actions: 0,
      };
    }
  }, [enabled, cacheSize, loadFromStorage, getPendingActions]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initialize offline support
   */
  useEffect(() => {
    if (!enabled || isInitialized.current) return;

    const initialize = async () => {
      try {
        // Check if data is cached
        const templates = await getCachedTemplates();
        setIsCached(templates.length > 0);

        // Get last sync time
        const lastSyncTime = await loadFromStorage<number>(STORAGE_KEYS.LAST_SYNC);
        setLastSync(lastSyncTime || 0);

        // Get pending actions count
        const actions = await getPendingActions();
        setPendingActionsCount(actions.length);

        // Get cache size
        setCacheSize(getStorageSize());

        isInitialized.current = true;
        logger.info('Offline support initialized');
      } catch (error) {
        logger.error('Failed to initialize offline support', { error });
      }
    };

    initialize();
  }, [enabled, getCachedTemplates, loadFromStorage, getPendingActions, getStorageSize]);

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Device came online');

      // Sync data when coming back online
      if (enableBackgroundSync) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.info('Device went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableBackgroundSync, syncData]);

  /**
   * Set up background sync
   */
  useEffect(() => {
    if (!enabled || !enableBackgroundSync || !isOnline) return;

    const scheduleSync = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncData();
        scheduleSync(); // Schedule next sync
      }, syncInterval);
    };

    scheduleSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [enabled, enableBackgroundSync, isOnline, syncData, syncInterval]);

  // ============================================================================
  // RETURN RESULT
  // ============================================================================

  return {
    isOnline,
    isCached,
    lastSync,
    cacheSize,
    pendingActionsCount,
    syncStatus,
    cacheTemplates,
    getCachedTemplates,
    cacheUserProfile,
    getCachedUserProfile,
    cacheCollections,
    getCachedCollections,
    addPendingAction,
    getPendingActions,
    clearPendingActions,
    syncData,
    clearCache,
    getCacheInfo,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useOfflineSupport;
