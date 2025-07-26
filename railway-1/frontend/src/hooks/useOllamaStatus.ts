'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAIBOSStore } from '@/lib/store';
import { Logger } from 'aibos-shared-infrastructure';

// ==================== TYPES ====================

interface OllamaStatus {
  isConnected: boolean;
  isRunning: boolean;
  models: OllamaModel[];
  currentModel: string | null;
  performance: OllamaPerformance;
  lastUpdated: Date;
  error: string | null;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

interface OllamaPerformance {
  responseTime: number;
  tokensPerSecond: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

// ==================== OLLAMA STATUS HOOK ====================

export const useOllamaStatus = () => {
  const [status, setStatus] = useState<OllamaStatus>({
    isConnected: false,
    isRunning: false,
    models: [],
    currentModel: null,
    performance: {
      responseTime: 0,
      tokensPerSecond: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0
    },
    lastUpdated: new Date(),
    error: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useAIBOSStore();

  // ==================== OLLAMA API FUNCTIONS ====================

  const checkOllamaStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if Ollama is running
      const response = await fetch('/api/ollama/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          isConnected: true,
          isRunning: data.isRunning,
          models: data.models || [],
          currentModel: data.currentModel,
          performance: data.performance || {
            responseTime: 0,
            tokensPerSecond: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            activeConnections: 0
          },
          lastUpdated: new Date(),
          error: null
        });

        Logger.info();
      } else {
        throw new Error('Failed to check Ollama status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isRunning: false,
        error: errorMessage,
        lastUpdated: new Date()
      }));

      Logger.error();

      addNotification({
        type: 'error',
        title: 'Ollama Connection Error',
        message: 'Failed to connect to Ollama service. Please check if Ollama is running.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const pullModel = useCallback(async (modelName: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/ollama/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName }),
      });

      if (response.ok) {
        const result = await response.json();

        addNotification({
          type: 'success',
          title: 'Model Downloaded',
          message: `Successfully downloaded ${modelName}`,
          isRead: false
        });

        // Refresh status after model pull
        await checkOllamaStatus();

        return result;
      } else {
        throw new Error('Failed to pull model');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      Logger.error();

      addNotification({
        type: 'error',
        title: 'Model Download Failed',
        message: `Failed to download ${modelName}: ${errorMessage}`,
        isRead: false
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkOllamaStatus, addNotification]);

  const switchModel = useCallback(async (modelName: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/ollama/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName }),
      });

      if (response.ok) {
        const result = await response.json();

        setStatus(prev => ({
          ...prev,
          currentModel: modelName,
          lastUpdated: new Date()
        }));

        addNotification({
          type: 'success',
          title: 'Model Switched',
          message: `Switched to ${modelName}`,
          isRead: false
        });

        return result;
      } else {
        throw new Error('Failed to switch model');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      Logger.error();

      addNotification({
        type: 'error',
        title: 'Model Switch Failed',
        message: `Failed to switch to ${modelName}: ${errorMessage}`,
        isRead: false
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    checkOllamaStatus();

    // Set up periodic status checks
    const interval = setInterval(checkOllamaStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkOllamaStatus]);

  // ==================== RETURN VALUES ====================

  return {
    status,
    isLoading,
    checkOllamaStatus,
    pullModel,
    switchModel,
    isConnected: status.isConnected,
    isRunning: status.isRunning,
    models: status.models,
    currentModel: status.currentModel,
    performance: status.performance,
    error: status.error
  };
};
