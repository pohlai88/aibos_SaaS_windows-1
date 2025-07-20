/**
 * useOfflineSupport Hook
 *
 * Provides offline support functionality including:
 * - Service worker registration
 * - Cache management
 * - Offline status detection
 * - Data synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@aibos/shared/lib';

export interface OfflineSupportConfig {
  enabled: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  cacheName?: string;
  syncInterval?: number;
}

export interface OfflineData {
  learningPaths?: any[];
  tutorials?: any[];
  userProgress?: any;
  sessionData?: any;
}

export interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

export const useOfflineSupport = (config: OfflineSupportConfig) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const syncQueue = useRef<Array<{ action: string; data: any; timestamp: number }>>([]);
  const serviceWorkerRegistration = useRef<ServiceWorkerRegistration | null>(null);

  // ============================================================================
  // SERVICE WORKER REGISTRATION
  // ============================================================================

  const registerServiceWorker = useCallback(async () => {
    if (!config.enabled || !('serviceWorker' in navigator)) {
      logger.info('Service worker not supported or disabled');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      serviceWorkerRegistration.current = registration;
      logger.info('Service worker registered successfully', { scope: registration.scope });

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              logger.info('New service worker version available');
            }
          });
        }
      });
    } catch (error) {
      logger.error('Service worker registration failed', { error });
    }
  }, [config.enabled]);

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  const cacheData = useCallback(
    async (key: string, data: any, ttl?: number) => {
      if (!config.enabled) return;

      try {
        const cacheItem: CacheItem = {
          key,
          data,
          timestamp: Date.now(),
          ttl,
        };

        // Store in IndexedDB for larger data
        if (data && typeof data === 'object' && Object.keys(data).length > 10) {
          await storeInIndexedDB(key, cacheItem);
        } else {
          // Store in localStorage for smaller data
          localStorage.setItem(`offline_${key}`, JSON.stringify(cacheItem));
        }

        logger.info('Data cached successfully', { key, size: JSON.stringify(data).length });
      } catch (error) {
        logger.error('Failed to cache data', { key, error });
      }
    },
    [config.enabled],
  );

  const getCachedData = useCallback(
    async (key: string): Promise<any | null> => {
      if (!config.enabled) return null;

      try {
        // Try localStorage first
        const localData = localStorage.getItem(`offline_${key}`);
        if (localData) {
          const cacheItem: CacheItem = JSON.parse(localData);
          if (!isExpired(cacheItem)) {
            return cacheItem.data;
          }
        }

        // Try IndexedDB
        const indexedData = await getFromIndexedDB(key);
        if (indexedData && !isExpired(indexedData)) {
          return indexedData.data;
        }

        return null;
      } catch (error) {
        logger.error('Failed to get cached data', { key, error });
        return null;
      }
    },
    [config.enabled],
  );

  const clearCache = useCallback(
    async (key?: string) => {
      if (!config.enabled) return;

      try {
        if (key) {
          localStorage.removeItem(`offline_${key}`);
          await removeFromIndexedDB(key);
        } else {
          // Clear all offline cache
          Object.keys(localStorage)
            .filter((k) => k.startsWith('offline_'))
            .forEach((k) => localStorage.removeItem(k));
          await clearIndexedDB();
        }

        logger.info('Cache cleared', { key: key || 'all' });
      } catch (error) {
        logger.error('Failed to clear cache', { error });
      }
    },
    [config.enabled],
  );

  // ============================================================================
  // INDEXEDDB OPERATIONS
  // ============================================================================

  const storeInIndexedDB = async (key: string, data: CacheItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AIBOSOfflineCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const putRequest = store.put(data);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  };

  const getFromIndexedDB = async (key: string): Promise<CacheItem | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AIBOSOfflineCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getRequest = store.get(key);

        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  };

  const removeFromIndexedDB = async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AIBOSOfflineCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const deleteRequest = store.delete(key);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  };

  const clearIndexedDB = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AIBOSOfflineCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      };
    });
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isExpired = (cacheItem: CacheItem): boolean => {
    if (!cacheItem.ttl) return false;
    return Date.now() - cacheItem.timestamp > cacheItem.ttl;
  };

  const addToSyncQueue = useCallback((action: string, data: any) => {
    syncQueue.current.push({
      action,
      data,
      timestamp: Date.now(),
    });
    logger.info('Added to sync queue', { action, queueLength: syncQueue.current.length });
  }, []);

  // ============================================================================
  // SYNCHRONIZATION
  // ============================================================================

  const syncWhenOnline = useCallback(async () => {
    if (!isOnline || syncQueue.current.length === 0) return;

    setIsSyncing(true);
    logger.info('Starting sync process', { queueLength: syncQueue.current.length });

    try {
      const queue = [...syncQueue.current];
      syncQueue.current = [];

      for (const item of queue) {
        try {
          // This would sync with your backend API
          // await api.syncData(item.action, item.data);
          logger.info('Synced item', { action: item.action });
        } catch (error) {
          // Re-add failed items to queue
          syncQueue.current.push(item);
          logger.error('Sync failed for item', { action: item.action, error });
        }
      }

      logger.info('Sync completed', {
        synced: queue.length - syncQueue.current.length,
        failed: syncQueue.current.length,
      });
    } catch (error) {
      logger.error('Sync process failed', { error });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Device came online');
      syncWhenOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.info('Device went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncWhenOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.current.length > 0) {
      const timer = setTimeout(syncWhenOnline, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncWhenOnline]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    isOnline,
    offlineData,
    isSyncing,
    syncQueue: syncQueue.current,
    cacheData,
    getCachedData,
    clearCache,
    addToSyncQueue,
    syncWhenOnline,
    registerServiceWorker,
  };
};
