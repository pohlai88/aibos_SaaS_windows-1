import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

interface DashboardMetrics {
  activeUsers: number;
  mrr: number;
  churnRate: number;
  npsScore: number;
  serverHealth: 'healthy' | 'warning' | 'critical';
  openTickets: number;
  criticalBugs: number;
  systemMetrics?: {
    uptime: number;
    avgResponse: number;
    requestsPerDay: number;
  };
}

type LoadStatus = 'idle' | 'loading' | 'refreshing' | 'error';

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  status: LoadStatus;
  error: string | null;
  lastUpdated: Date;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Type guard for cached data validation
const isValidDashboardMetrics = (data: any): data is DashboardMetrics => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.mrr === 'number' &&
    typeof data.activeUsers === 'number' &&
    typeof data.churnRate === 'number' &&
    typeof data.npsScore === 'number' &&
    typeof data.serverHealth === 'string' &&
    typeof data.openTickets === 'number' &&
    typeof data.criticalBugs === 'number'
  );
};

export const useDashboardMetrics = (refreshInterval = 30000): UseDashboardMetricsReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRefetchingRef = useRef(false);

  const fetch = useCallback(async (isRefresh = false, signal?: AbortSignal) => {
    // Prevent overlapping requests
    if (isRefetchingRef.current) {
      console.warn('[useDashboardMetrics] Skipping overlapping request');
      return;
    }

    try {
      isRefetchingRef.current = true;
      setStatus(isRefresh ? 'refreshing' : 'loading');
      setError(null);

      const [metricsRes, systemRes] = await Promise.all([
        api.get('/dashboard/metrics', { signal }),
        api.get('/dashboard/system-status', { signal }),
      ]);

      if (metricsRes.data.success) {
        const combinedMetrics = {
          ...metricsRes.data.data,
          systemMetrics: systemRes.data.success ? systemRes.data.data : undefined
        };
        setMetrics(combinedMetrics);
        localStorage.setItem('aibos-dashboard-metrics', JSON.stringify(combinedMetrics));
        setLastUpdated(new Date());
        setStatus('idle');

        // Dev-friendly logging
        if (process.env.NODE_ENV === 'development') {
          console.info(`[useDashboardMetrics] Updated @ ${new Date().toISOString()}`, combinedMetrics);
        }
      }
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError') {
        console.log('[useDashboardMetrics] Request aborted');
        return;
      }

      console.error('Dashboard metrics fetch failed:', err);
      setError('⚠️ Unable to load dashboard data. Showing cached information.');
      setStatus('error');

      // Graceful fallback to cached data with type safety
      const fallback = localStorage.getItem('aibos-dashboard-metrics');
      if (fallback) {
        try {
          const parsed = JSON.parse(fallback);
          if (isValidDashboardMetrics(parsed)) {
            setMetrics(parsed);
            setStatus('idle');
            console.log('[useDashboardMetrics] Using cached data as fallback');
          } else {
            console.warn('[useDashboardMetrics] Cached data is invalid, clearing cache');
            localStorage.removeItem('aibos-dashboard-metrics');
          }
        } catch (e) {
          console.error('Failed to parse cached metrics:', e);
          localStorage.removeItem('aibos-dashboard-metrics');
        }
      }
    } finally {
      isRefetchingRef.current = false;
    }
  }, []);

  const refetch = useCallback(async () => {
    // Debounce rapid refetch calls
    if (isRefetchingRef.current) {
      console.warn('[useDashboardMetrics] Refetch already in progress');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    await fetch(true, controller.signal);
  }, [fetch]);

  const clearError = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  // Initial load + auto-refresh with proper cleanup
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(false, controller.signal);
    const interval = setInterval(() => {
      fetch(true, controller.signal);
    }, refreshInterval);

    return () => {
      clearInterval(interval);
      controller.abort();
      abortControllerRef.current = null;
    };
  }, [fetch, refreshInterval]);

  return {
    metrics,
    status,
    error,
    lastUpdated,
    refetch,
    clearError
  };
};
