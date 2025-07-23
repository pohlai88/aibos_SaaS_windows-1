/**
 * useSessionPersistence Hook
 *
 * Provides session persistence functionality including:
 * - Auto-save to localStorage
 * - Session restoration
 * - Session management
 * - Data compression for large sessions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@aibos/shared/lib';

export interface SessionPersistenceConfig {
  sessionKey: string;
  autoSaveInterval?: number;
  compressData?: boolean;
  maxSessionSize?: number;
  onSessionLoad?: (session: any) => void;
  onSessionSave?: (session: any) => void;
  onSessionError?: (error: Error) => void;
}

export interface SessionData {
  id: string;
  userId: string;
  startTime: number;
  currentStep: string;
  interactions: Array<{
    type: string;
    timestamp: number;
    data: any;
  }>;
  preferences: Record<string, any>;
  selectedGoals?: any[];
  learningProgress?: any;
  lastSaved?: number;
}

export const useSessionPersistence = (config: SessionPersistenceConfig) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionDataRef = useRef<SessionData | null>(null);

  // ============================================================================
  // DATA COMPRESSION
  // ============================================================================

  const compressData = useCallback(
    (data: any): string => {
      if (!config.compressData) {
        return JSON.stringify(data);
      }

      try {
        // Simple compression: remove unnecessary whitespace and use shorter property names
        const compressed = JSON.stringify(data, (key, value) => {
          // Shorten common property names
          const shortNames: Record<string, string> = {
            timestamp: 't',
            type: 'ty',
            data: 'd',
            userId: 'uid',
            startTime: 'st',
            currentStep: 'cs',
            interactions: 'i',
            preferences: 'p',
            selectedGoals: 'sg',
            learningProgress: 'lp',
            lastSaved: 'ls',
          };

          if (shortNames[key]) {
            return { [shortNames[key]]: value };
          }

          return value;
        });

        return compressed;
      } catch (error) {
        logger.error('Data compression failed', { error });
        return JSON.stringify(data);
      }
    },
    [config.compressData],
  );

  const decompressData = useCallback(
    (compressedData: string): any => {
      if (!config.compressData) {
        return JSON.parse(compressedData);
      }

      try {
        const parsed = JSON.parse(compressedData);

        // Restore original property names
        const restoreNames = (obj: any): any => {
          if (typeof obj !== 'object' || obj === null) return obj;

          const restored: any = {};
          const nameMapping: Record<string, string> = {
            t: 'timestamp',
            ty: 'type',
            d: 'data',
            uid: 'userId',
            st: 'startTime',
            cs: 'currentStep',
            i: 'interactions',
            p: 'preferences',
            sg: 'selectedGoals',
            lp: 'learningProgress',
            ls: 'lastSaved',
          };

          for (const [key, value] of Object.entries(obj)) {
            const restoredKey = nameMapping[key] || key;
            restored[restoredKey] = typeof value === 'object' ? restoreNames(value) : value;
          }

          return restored;
        };

        return restoreNames(parsed);
      } catch (error) {
        logger.error('Data decompression failed', { error });
        return JSON.parse(compressedData);
      }
    },
    [config.compressData],
  );

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const saveSession = useCallback(
    async (sessionData: SessionData): Promise<void> => {
      if (!config.sessionKey) {
        logger.warn('No session key provided for saving');
        return;
      }

      setIsSaving(true);

      try {
        // Add metadata
        const sessionToSave = {
          ...sessionData,
          lastSaved: Date.now(),
          version: '1.0',
        };

        // Check session size
        const sessionSize = JSON.stringify(sessionToSave).length;
        if (config.maxSessionSize && sessionSize > config.maxSessionSize) {
          logger.warn('Session size exceeds limit', {
            size: sessionSize,
            limit: config.maxSessionSize,
          });

          // Truncate old interactions if needed
          if (sessionToSave.interactions && sessionToSave.interactions.length > 50) {
            sessionToSave.interactions = sessionToSave.interactions.slice(-50);
          }
        }

        // Compress and save
        const compressedData = compressData(sessionToSave);
        localStorage.setItem(config.sessionKey, compressedData);

        setLastSaved(Date.now());
        sessionDataRef.current = sessionToSave;

        config.onSessionSave?.(sessionToSave);
        logger.info('Session saved successfully', {
          key: config.sessionKey,
          size: compressedData.length,
        });
      } catch (error) {
        logger.error('Failed to save session', { error, key: config.sessionKey });
        config.onSessionError?.(error as Error);
      } finally {
        setIsSaving(false);
      }
    },
    [config, compressData],
  );

  const loadSession = useCallback(async (): Promise<SessionData | null> => {
    if (!config.sessionKey) {
      logger.warn('No session key provided for loading');
      return null;
    }

    setIsLoading(true);

    try {
      const savedData = localStorage.getItem(config.sessionKey);
      if (!savedData) {
        logger.info('No saved session found', { key: config.sessionKey });
        return null;
      }

      // Decompress and parse
      const sessionData = decompressData(savedData);

      // Validate session data
      if (!sessionData || typeof sessionData !== 'object') {
        logger.warn('Invalid session data format', { key: config.sessionKey });
        return null;
      }

      // Check if session is too old (optional)
      const sessionAge = Date.now() - (sessionData.startTime || 0);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (sessionAge > maxAge) {
        logger.info('Session is too old, clearing', {
          age: sessionAge,
          maxAge,
        });
        clearSession();
        return null;
      }

      sessionDataRef.current = sessionData;
      setLastSaved(sessionData.lastSaved || null);

      config.onSessionLoad?.(sessionData);
      logger.info('Session loaded successfully', {
        key: config.sessionKey,
        age: sessionAge,
      });

      return sessionData;
    } catch (error) {
      logger.error('Failed to load session', { error, key: config.sessionKey });
      config.onSessionError?.(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [config, decompressData]);

  const clearSession = useCallback(async (): Promise<void> => {
    if (!config.sessionKey) return;

    try {
      localStorage.removeItem(config.sessionKey);
      sessionDataRef.current = null;
      setLastSaved(null);

      logger.info('Session cleared', { key: config.sessionKey });
    } catch (error) {
      logger.error('Failed to clear session', { error, key: config.sessionKey });
    }
  }, [config.sessionKey]);

  const getSessionInfo = useCallback((): {
    exists: boolean;
    size: number;
    lastSaved: number | null;
    age: number | null;
  } => {
    if (!config.sessionKey) {
      return { exists: false, size: 0, lastSaved: null, age: null };
    }

    try {
      const savedData = localStorage.getItem(config.sessionKey);
      if (!savedData) {
        return { exists: false, size: 0, lastSaved: null, age: null };
      }

      const sessionData = sessionDataRef.current || decompressData(savedData);
      const age = sessionData.startTime ? Date.now() - sessionData.startTime : null;

      return {
        exists: true,
        size: savedData.length,
        lastSaved: sessionData.lastSaved || null,
        age,
      };
    } catch (error) {
      logger.error('Failed to get session info', { error });
      return { exists: false, size: 0, lastSaved: null, age: null };
    }
  }, [config.sessionKey, decompressData]);

  // ============================================================================
  // AUTO-SAVE FUNCTIONALITY
  // ============================================================================

  const startAutoSave = useCallback(
    (sessionData: SessionData) => {
      if (!config.autoSaveInterval || config.autoSaveInterval < 1000) {
        return;
      }

      // Clear existing timer
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }

      // Start new auto-save timer
      autoSaveTimer.current = setInterval(() => {
        saveSession(sessionData);
      }, config.autoSaveInterval);

      logger.info('Auto-save started', { interval: config.autoSaveInterval });
    },
    [config.autoSaveInterval, saveSession],
  );

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
      autoSaveTimer.current = null;
      logger.info('Auto-save stopped');
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const exportSession = useCallback(async (): Promise<string> => {
    if (!sessionDataRef.current) {
      throw new Error('No session data to export');
    }

    try {
      const exportData = {
        ...sessionDataRef.current,
        exportedAt: Date.now(),
        version: '1.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logger.error('Failed to export session', { error });
      throw error;
    }
  }, []);

  const importSession = useCallback(
    async (sessionJson: string): Promise<void> => {
      try {
        const importedData = JSON.parse(sessionJson);

        // Validate imported data
        if (!importedData.id || !importedData.userId) {
          throw new Error('Invalid session data format');
        }

        // Update with current timestamp
        const sessionData: SessionData = {
          ...importedData,
          startTime: importedData.startTime || Date.now(),
          lastSaved: Date.now(),
        };

        await saveSession(sessionData);
        logger.info('Session imported successfully');
      } catch (error) {
        logger.error('Failed to import session', { error });
        throw error;
      }
    },
    [saveSession],
  );

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    saveSession,
    loadSession,
    clearSession,
    getSessionInfo,
    startAutoSave,
    stopAutoSave,
    exportSession,
    importSession,
    isSaving,
    isLoading,
    lastSaved,
  };
};
