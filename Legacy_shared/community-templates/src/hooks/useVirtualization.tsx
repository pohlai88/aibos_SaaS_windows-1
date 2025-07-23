/**
 * AI-BOS Community Templates - Virtualization Hook
 *
 * Performance-optimized virtualization hook for rendering large lists
 * of templates with efficient memory usage and smooth scrolling.
 */

'use client';

import type { useState, useEffect, useCallback, useRef, useMemo  } from 'react';
import { useIntersectionObserver } from 'react-intersection-observer';

// ============================================================================
// VIRTUALIZATION TYPES
// ============================================================================

export interface VirtualizationOptions {
  /** Number of items to render */
  itemCount: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render outside viewport (overscan) */
  overscan?: number;
  /** Container height in pixels */
  containerHeight?: number;
  /** Enable dynamic height calculation */
  dynamicHeight?: boolean;
  /** Custom height calculation function */
  getItemHeight?: (index: number) => number;
  /** Enable intersection observer for lazy loading */
  enableIntersectionObserver?: boolean;
  /** Threshold for intersection observer */
  intersectionThreshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
}

export interface VirtualizationResult<T> {
  /** Virtualized items to render */
  virtualItems: VirtualItem<T>[];
  /** Total height of virtualized content */
  totalHeight: number;
  /** Scroll offset */
  scrollOffset: number;
  /** Container ref */
  containerRef: React.RefObject<HTMLElement>;
  /** Scroll to specific item */
  scrollToItem: (index: number, align?: 'start' | 'center' | 'end') => void;
  /** Scroll to specific offset */
  scrollToOffset: (offset: number) => void;
  /** Get item at specific index */
  getItem: (index: number) => T | undefined;
  /** Check if item is visible */
  isItemVisible: (index: number) => boolean;
  /** Get visible range */
  getVisibleRange: () => { start: number; end: number };
}

export interface VirtualItem<T> {
  /** Item data */
  data: T;
  /** Item index */
  index: number;
  /** Item key for React */
  key: string;
  /** Item offset from top */
  offsetTop: number;
  /** Item height */
  height: number;
  /** Whether item is visible */
  isVisible: boolean;
  /** Whether item is in viewport */
  isInViewport: boolean;
}

// ============================================================================
// VIRTUALIZATION HOOK
// ============================================================================

/**
 * Virtualization hook for efficient rendering of large lists
 */
export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const {
    itemCount,
    itemHeight,
    overscan = 5,
    containerHeight = 600,
    dynamicHeight = false,
    getItemHeight,
    enableIntersectionObserver = true,
    intersectionThreshold = 0.1,
    rootMargin = '50px'
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeightState, setContainerHeight] = useState(containerHeight);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLElement>(null);

  // ============================================================================
  // HEIGHT CALCULATIONS
  // ============================================================================

  /**
   * Calculate total height of all items
   */
  const totalHeight = useMemo(() => {
    if (dynamicHeight && getItemHeight) {
      let height = 0;
      for (let i = 0; i < itemCount; i++) {
        height += getItemHeight(i);
      }
      return height;
    }
    return itemCount * itemHeight;
  }, [itemCount, itemHeight, dynamicHeight, getItemHeight]);

  /**
   * Get height of specific item
   */
  const getHeight = useCallback((index: number): number => {
    if (dynamicHeight) {
      if (getItemHeight) {
        return getItemHeight(index);
      }
      return itemHeights.get(index) || itemHeight;
    }
    return itemHeight;
  }, [dynamicHeight, getItemHeight, itemHeights, itemHeight]);

  /**
   * Calculate offset for specific item
   */
  const getOffset = useCallback((index: number): number => {
    if (dynamicHeight) {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getHeight(i);
      }
      return offset;
    }
    return index * itemHeight;
  }, [dynamicHeight, getHeight, itemHeight]);

  // ============================================================================
  // VIRTUALIZATION LOGIC
  // ============================================================================

  /**
   * Calculate visible range
   */
  const getVisibleRange = useCallback((): { start: number; end: number } => {
    const start = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan);
    const end = Math.min(
      itemCount - 1,
      Math.ceil((scrollOffset + containerHeightState) / itemHeight) + overscan
    );
    return { start, end };
  }, [scrollOffset, itemHeight, overscan, itemCount, containerHeightState]);

  /**
   * Generate virtual items
   */
  const virtualItems = useMemo((): VirtualItem<T>[] => {
    const { start, end } = getVisibleRange();
    const items: VirtualItem<T>[] = [];

    for (let i = start; i <= end; i++) {
      if (i >= 0 && i < items.length) {
        const offsetTop = getOffset(i);
        const height = getHeight(i);
        const isVisible = offsetTop + height > scrollOffset && offsetTop < scrollOffset + containerHeightState;

        items.push({
          data: items[i],
          index: i,
          key: `virtual-item-${i}`,
          offsetTop,
          height,
          isVisible,
          isInViewport: isVisible
        });
      }
    }

    return items;
  }, [items, getVisibleRange, getOffset, getHeight, scrollOffset, containerHeightState]);

  // ============================================================================
  // SCROLL HANDLERS
  // ============================================================================

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    setScrollOffset(target.scrollTop);
  }, []);

  /**
   * Scroll to specific item
   */
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return;

    const offsetTop = getOffset(index);
    const height = getHeight(index);
    let scrollTop = offsetTop;

    switch (align) {
      case 'center':
        scrollTop = offsetTop - (containerHeightState / 2) + (height / 2);
        break;
      case 'end':
        scrollTop = offsetTop - containerHeightState + height;
        break;
    }

    containerRef.current.scrollTop = Math.max(0, scrollTop);
  }, [getOffset, getHeight, containerHeightState]);

  /**
   * Scroll to specific offset
   */
  const scrollToOffset = useCallback((offset: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = Math.max(0, offset);
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get item at specific index
   */
  const getItem = useCallback((index: number): T | undefined => {
    return items[index];
  }, [items]);

  /**
   * Check if item is visible
   */
  const isItemVisible = useCallback((index: number): boolean => {
    const offsetTop = getOffset(index);
    const height = getHeight(index);
    return offsetTop + height > scrollOffset && offsetTop < scrollOffset + containerHeightState;
  }, [getOffset, getHeight, scrollOffset, containerHeightState]);

  // ============================================================================
  // INTERSECTION OBSERVER
  // ============================================================================

  /**
   * Intersection observer for lazy loading
   */
  const useIntersectionObserverForItem = (index: number) => {
    const [ref, inView] = useIntersectionObserver({
      threshold: intersectionThreshold,
      rootMargin,
      triggerOnce: false
    });

    return { ref, inView };
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Set up scroll listener
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /**
   * Update container height
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * Update item heights for dynamic height
   */
  useEffect(() => {
    if (!dynamicHeight) return;

    const newHeights = new Map<number, number>();
    virtualItems.forEach((item) => {
      if (item.data && typeof item.data === 'object' && 'height' in item.data) {
        newHeights.set(item.index, (item.data as any).height);
      }
    });

    if (newHeights.size > 0) {
      setItemHeights(prev => new Map([...prev, ...newHeights]));
    }
  }, [virtualItems, dynamicHeight]);

  // ============================================================================
  // RETURN RESULT
  // ============================================================================

  return {
    virtualItems,
    totalHeight,
    scrollOffset,
    containerRef,
    scrollToItem,
    scrollToOffset,
    getItem,
    isItemVisible,
    getVisibleRange
  };
}

// ============================================================================
// VIRTUALIZED LIST COMPONENT
// ============================================================================

export interface VirtualizedListProps<T> {
  /** Items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: VirtualItem<T>) => React.ReactNode;
  /** Height of each item */
  itemHeight: number;
  /** Container height */
  containerHeight?: number;
  /** Overscan count */
  overscan?: number;
  /** Enable dynamic height */
  dynamicHeight?: boolean;
  /** Custom height calculation */
  getItemHeight?: (index: number) => number;
  /** Container className */
  className?: string;
  /** Container style */
  style?: React.CSSProperties;
}

/**
 * Virtualized list component
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 600,
  overscan = 5,
  dynamicHeight = false,
  getItemHeight,
  className = '',
  style = {}
}: VirtualizedListProps<T>) {
  const {
    virtualItems,
    totalHeight,
    containerRef
  } = useVirtualization(items, {
    itemCount: items.length,
    itemHeight,
    overscan,
    containerHeight,
    dynamicHeight,
    getItemHeight
  });

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: containerHeight,
        ...style
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: item.offsetTop,
              height: item.height,
              width: '100%'
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useVirtualization;
