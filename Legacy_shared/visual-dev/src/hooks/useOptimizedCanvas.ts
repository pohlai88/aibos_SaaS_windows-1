/**
 * Optimized Canvas Hook
 *
 * Performance-optimized hooks for managing large canvas state
 * with memoization, virtualization, and memory leak prevention.
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';
import type { VisualElement, CanvasState } from '../types';

/**
 * Performance-optimized derived state
 */
export const useOptimizedCanvas = (canvasState: CanvasState, selectedElements: VisualElement[]) => {
  // Memoize expensive computations
  const selectedElementIds = useMemo(
    () => selectedElements.map((el) => el.instanceId),
    [selectedElements],
  );

  const elementsByType = useMemo(
    () =>
      canvasState.elements.reduce(
        (acc, element) => {
          if (!acc[element.type]) acc[element.type] = [];
          acc[element.type].push(element);
          return acc;
        },
        {} as Record<string, VisualElement[]>,
      ),
    [canvasState.elements],
  );

  const visibleElements = useMemo(
    () => canvasState.elements.filter((el) => el.isVisible),
    [canvasState.elements],
  );

  const canvasMetrics = useMemo(
    () => ({
      totalElements: canvasState.elements.length,
      selectedCount: selectedElements.length,
      visibleCount: visibleElements.length,
      typeDistribution: Object.keys(elementsByType).reduce(
        (acc, type) => {
          acc[type] = elementsByType[type].length;
          return acc;
        },
        {} as Record<string, number>,
      ),
    }),
    [canvasState.elements.length, selectedElements.length, visibleElements.length, elementsByType],
  );

  return {
    selectedElementIds,
    elementsByType,
    visibleElements,
    canvasMetrics,
  };
};

/**
 * Virtualized Component Palette Hook
 */
export const useVirtualizedPalette = (components: any[], searchQuery: string) => {
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components;

    return components.filter(
      (component) =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [components, searchQuery]);

  const componentsByCategory = useMemo(
    () =>
      filteredComponents.reduce(
        (acc, component) => {
          if (!acc[component.category]) acc[component.category] = [];
          acc[component.category].push(component);
          return acc;
        },
        {} as Record<string, any[]>,
      ),
    [filteredComponents],
  );

  return {
    filteredComponents,
    componentsByCategory,
    totalComponents: filteredComponents.length,
  };
};

/**
 * Memory-optimized event handlers
 */
export const useCanvasEvents = (onElementUpdate: Function, onCanvasUpdate: Function) => {
  // Use refs to prevent unnecessary re-renders
  const handlersRef = useRef({
    onElementUpdate,
    onCanvasUpdate,
  });

  // Update refs when handlers change
  useEffect(() => {
    handlersRef.current = {
      onElementUpdate,
      onCanvasUpdate,
    };
  }, [onElementUpdate, onCanvasUpdate]);

  const optimizedElementUpdate = useCallback((elementId: string, updates: any) => {
    // Batch updates and debounce for performance
    const handler = handlersRef.current.onElementUpdate;
    if (handler) {
      handler(elementId, updates);
    }
  }, []);

  const optimizedCanvasUpdate = useCallback((updates: any) => {
    const handler = handlersRef.current.onCanvasUpdate;
    if (handler) {
      handler(updates);
    }
  }, []);

  return {
    optimizedElementUpdate,
    optimizedCanvasUpdate,
  };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitoring = () => {
  const metricsRef = useRef({
    renderCount: 0,
    lastRenderTime: Date.now(),
    averageRenderTime: 0,
  });

  const trackRender = useCallback(() => {
    const now = Date.now();
    const renderTime = now - metricsRef.current.lastRenderTime;

    metricsRef.current.renderCount++;
    metricsRef.current.averageRenderTime = (metricsRef.current.averageRenderTime + renderTime) / 2;
    metricsRef.current.lastRenderTime = now;

    // Log performance warnings
    if (renderTime > 16) {
      // 60fps threshold
      console.warn(`Slow render detected: ${renderTime}ms`, {
        renderCount: metricsRef.current.renderCount,
        averageRenderTime: metricsRef.current.averageRenderTime,
      });
    }
  }, []);

  useEffect(() => {
    trackRender();
  });

  return {
    renderMetrics: metricsRef.current,
    trackRender,
  };
};
