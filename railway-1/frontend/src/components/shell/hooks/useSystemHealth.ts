'use client';

import { useMemo } from 'react';
import { useSystemCore } from '../SystemCore';

export interface SystemHealth {
  // Boot Status
  isBooted: boolean;
  isReady: boolean;
  bootProgress: number;
  currentPhase: string;

  // Performance Metrics
  bootTime: number;
  memoryUsage: number;
  cpuUsage: number;

  // Health Indicators
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;

  // Session Info
  sessionAge: number; // in minutes
  sessionId: string;

  // Health Score (0-100)
  healthScore: number;

  // Status Messages
  status: 'booting' | 'ready' | 'warning' | 'error' | 'degraded';
  statusMessage: string;
}

export const useSystemHealth = (): SystemHealth => {
  const { state, config } = useSystemCore();

  return useMemo(() => {
    const sessionAge = state.isReady
      ? Math.floor((Date.now() - state.session.startTime.getTime()) / (1000 * 60))
      : 0;

    const errorCount = state.errors.length;
    const warningCount = state.warnings.length;
    const hasErrors = errorCount > 0;
    const hasWarnings = warningCount > 0;

    // Calculate health score (0-100)
    let healthScore = 100;

    // Deduct points for errors
    healthScore -= errorCount * 20;

    // Deduct points for warnings
    healthScore -= warningCount * 5;

    // Deduct points for high memory usage
    if (state.performance.memoryUsage > 100) {
      healthScore -= 10;
    }

    // Deduct points for slow boot time
    if (state.performance.bootTime > 2000) {
      healthScore -= 15;
    }

    // Ensure score doesn't go below 0
    healthScore = Math.max(0, healthScore);

    // Determine status
    let status: SystemHealth['status'] = 'booting';
    let statusMessage = 'System is starting up...';

    if (state.isReady) {
      if (healthScore >= 90) {
        status = 'ready';
        statusMessage = 'System is running optimally';
      } else if (healthScore >= 70) {
        status = 'warning';
        statusMessage = 'System has some issues to address';
      } else if (healthScore >= 50) {
        status = 'degraded';
        statusMessage = 'System performance is degraded';
      } else {
        status = 'error';
        statusMessage = 'System has critical issues';
      }
    }

    return {
      // Boot Status
      isBooted: state.isBooted,
      isReady: state.isReady,
      bootProgress: state.bootProgress,
      currentPhase: state.currentPhase,

      // Performance Metrics
      bootTime: state.performance.bootTime,
      memoryUsage: state.performance.memoryUsage,
      cpuUsage: 0, // CPU usage not available in current state

      // Health Indicators
      hasErrors,
      hasWarnings,
      errorCount,
      warningCount,

      // Session Info
      sessionAge,
      sessionId: 'session-' + Date.now(), // Generate session ID

      // Health Score
      healthScore,

      // Status
      status,
      statusMessage
    };
  }, [state, config]);
};

// Convenience hooks for specific health aspects
export const useBootStatus = () => {
  const health = useSystemHealth();
  return {
    isBooted: health.isBooted,
    isReady: health.isReady,
    bootProgress: health.bootProgress,
    currentPhase: health.currentPhase
  };
};

export const usePerformanceMetrics = () => {
  const health = useSystemHealth();
  return {
    bootTime: health.bootTime,
    memoryUsage: health.memoryUsage,
    cpuUsage: health.cpuUsage
  };
};

export const useErrorStatus = () => {
  const health = useSystemHealth();
  return {
    hasErrors: health.hasErrors,
    hasWarnings: health.hasWarnings,
    errorCount: health.errorCount,
    warningCount: health.warningCount
  };
};

export default useSystemHealth;
