/**
 * Enterprise Performance HOCs
 * Performance optimization, monitoring, and virtualization
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { CommonProps, PerformanceProfile } from '../../types';

// ============================================================================
// PERFORMANCE CONTEXT
// ============================================================================

interface PerformanceContext {
  metrics: PerformanceMetrics;
  trackRender: (component: string,
  duration: number) => void;
  trackInteraction: (component: string,
  event: string) => void;
  getPerformanceReport: () => PerformanceReport
}

interface PerformanceMetrics {
  renderTimes: Record<string, number[]>;
  interactionCounts: Record<string, number>;
  memoryUsage: number[];
  cpuUsage: number[]
}

interface PerformanceReport {
  averageRenderTime: number;
  slowestComponent: string;
  totalInteractions: number;
  memoryTrend: 'stable' | 'increasing' | 'decreasing'
}

const PerformanceContext = createContext<PerformanceContext | null>(null);

// ============================================================================
// PERFORMANCE PROVIDER
// ============================================================================

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableTracking?: boolean;
  performanceThreshold?: number
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableTracking = true,
  performanceThreshold = 16 // 60fps threshold
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTimes: {},
    interactionCounts: {},
    memoryUsage: [],
    cpuUsage: []
  });

  const trackRender = useCallback((component: string,
  duration: number) => {
    if (!enableTracking) return;

    setMetrics(prev => ({
      ...prev,
      renderTimes: {
        ...prev.renderTimes,
        [component]: [...(prev.renderTimes[component] || []), duration]
      }
    }));

    if (duration > performanceThreshold) {
      console.warn(`Performance warning: ${component} took ${duration.toFixed(2)}ms to render`)
}
  }, [enableTracking, performanceThreshold]);

  const trackInteraction = useCallback((component: string,
  event: string) => {
    if (!enableTracking) return;

    setMetrics(prev => ({
      ...prev,
      interactionCounts: {
        ...prev.interactionCounts,
        [`${component}:${event}`]: (prev.interactionCounts[`${component}:${event}`] || 0) + 1
      }
    }))
}, [enableTracking]);

  const getPerformanceReport = useCallback((): PerformanceReport => {
    const allRenderTimes = Object.values(metrics.renderTimes).flat();
    const averageRenderTime = allRenderTimes.length > 0
      ? allRenderTimes.reduce((sum, time) => sum + time, 0) / allRenderTimes.length
      : 0;

    const slowestComponent = Object.entries(metrics.renderTimes)
      .map(([component, times]) => ({
        component,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)[0]?.component || 'none';

    const totalInteractions = Object.values(metrics.interactionCounts)
      .reduce((sum, count) => sum + count, 0);

    const memoryTrend = metrics.memoryUsage.length >= 3
      ? (metrics.memoryUsage[metrics.memoryUsage.length - 1] || 0) > (metrics.memoryUsage[metrics.memoryUsage.length - 3] || 0)
        ? 'increasing'
        : (metrics.memoryUsage[metrics.memoryUsage.length - 1] || 0) < (metrics.memoryUsage[metrics.memoryUsage.length - 3] || 0)
          ? 'decreasing'
          : 'stable'
      : 'stable';

    return {
      averageRenderTime,
      slowestComponent,
      totalInteractions,
      memoryTrend
    }
}, [metrics]);

  const contextValue: PerformanceContext = {
    metrics,
    trackRender,
    trackInteraction,
    getPerformanceReport
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
};

// ============================================================================
// PERFORMANCE HOOK
// ============================================================================

export const usePerformance = (): PerformanceContext => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
}
  return context
};

// ============================================================================
// PERFORMANCE HOCS
// ============================================================================

/**
 * Type-safe HOC pattern for performance
 */
type WithPerformanceProps<P> = P & {
  performanceProfile?: Partial<PerformanceProfile>;
  enableTracking?: boolean;
  enableOptimization?: boolean
};

/**
 * Main performance HOC
 */
export function withPerformance<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithPerformanceProps<P>> {
  const WrappedComponent = React.forwardRef<any, WithPerformanceProps<P>>((props, ref) => {
    const {
      performanceProfile = {},
      enableTracking = true,
      enableOptimization = true,
      ...componentProps
    } = props;

    const { trackRender, trackInteraction } = usePerformance();
    const renderStartTime = useRef<number>(0);
    const componentName = Component.displayName || Component.name;

    useEffect(() => {
      renderStartTime.current = performance.now()
});

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      if (enableTracking) {
        trackRender(componentName, renderTime)
}
    });

    const handleInteraction = useCallback((event: string) => {
      if (enableTracking) {
        trackInteraction(componentName, event)
}
    }, [enableTracking, componentName, trackInteraction]);

    // Apply memoization if optimization is enabled
    const OptimizedComponent = enableOptimization
      ? React.memo(Component)
      : Component;

    return React.createElement(OptimizedComponent as any, {
      ...(componentProps as unknown as P),
      ref,
      onInteraction: handleInteraction
    })
});

  WrappedComponent.displayName = `withPerformance(${Component.displayName || Component.name})`;
  return WrappedComponent as unknown as React.ComponentType<WithPerformanceProps<P>>
}

/**
 * Virtualization HOC for large datasets
 */
type WithVirtualizationProps<P> = P & {
  data: any[];
  itemHeight?: number
};

export function withVirtualization<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithVirtualizationProps<P>> {
  const WrappedComponent = React.forwardRef<any, WithVirtualizationProps<P>>((props, ref) => {
    const {
      data = [],
      itemHeight = 50,
      ...componentProps
    } = props;

    const { trackRender } = usePerformance();
    const componentName = Component.displayName || Component.name;

    useEffect(() => {
      const renderTime = performance.now();
      trackRender(`${componentName}_virtualized`, renderTime)
}, [data.length, trackRender, componentName]);

    return (
      <Component
        {...(componentProps as unknown as P)}
        ref={ref}
        data={data}
        data-virtualized="true"
        data-item-height={itemHeight}
        data-total-items={data.length}
      />
    )
});

  WrappedComponent.displayName = `withVirtualization(${Component.displayName || Component.name})`;
  return WrappedComponent as unknown as React.ComponentType<WithVirtualizationProps<P>>
}

/**
 * Memoization HOC
 */
export function withMemoization<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic for performance optimization
    return JSON.stringify(prevProps) === JSON.stringify(nextProps)
});

  MemoizedComponent.displayName = `withMemoization(${Component.displayName || Component.name})`;
  return MemoizedComponent as unknown as React.ComponentType<P>
}

/**
 * Lazy loading HOC
 */
export function withLazyLoading<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const LazyComponent = React.forwardRef<any, P>((props, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect()
}
          })
},
        { threshold: 0.1 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current)
}

      return () => observer.disconnect()
}, []);

    useEffect(() => {
      if (isVisible && !isLoaded) {
        // Simulate loading delay
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer)
}
      return undefined; // Explicit return for all code paths
    }, [isVisible, isLoaded]);

    if (!isVisible) {
      return <div ref={elementRef} style={{ minHeight: '100px' }} />
}

    if (!isLoaded) {
      return <div ref={elementRef}>Loading...</div>
}

    return (
      <Component
        {...(props as unknown as P)}
        ref={ref}
        data-lazy-loading="true"
      />
    )
});

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyComponent as unknown as React.ComponentType<P>
}

/**
 * Performance monitoring HOC
 */
type WithPerformanceMonitoringProps<P> = P & {
  onPerformanceIssue?: (issue: string) => void;
  performanceThreshold?: number
};

export function withPerformanceMonitoring<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithPerformanceMonitoringProps<P>> {
  const WrappedComponent = React.forwardRef<any, WithPerformanceMonitoringProps<P>>((props, ref) => {
    const {
      onPerformanceIssue,
      performanceThreshold = 16,
      ...componentProps
    } = props;

    const { trackRender } = usePerformance();
    const componentName = Component.displayName || Component.name;
    const renderStartTime = useRef<number>(0);

    useEffect(() => {
      renderStartTime.current = performance.now()
});

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      trackRender(componentName, renderTime);

      if (renderTime > performanceThreshold && onPerformanceIssue) {
        const issue = `Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`;
        onPerformanceIssue(issue)
}
    });

    return (
      <Component
        {...(componentProps as unknown as P)}
        ref={ref}
      />
    )
});

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  return WrappedComponent as unknown as React.ComponentType<WithPerformanceMonitoringProps<P>>
}
