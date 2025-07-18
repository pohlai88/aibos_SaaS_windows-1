import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Lock } from 'lucide-react';

// Memory leak prevention utilities
export interface Cleanup(...args: unknown[]) => unknown {
 (): void;
}
export interface MemoryManager {
 addCleanup: (cleanup: Cleanup(...args: unknown[]) => unknown) => void;
 cleanup: () => void;
 isDisposed: boolean;
}
// Hook for managing memory cleanup
export const useMemoryManager = (): MemoryManager => {
 const cleanup(...args: unknown[]) => unknowns = useRef<Cleanup(...args: unknown[]) => unknown[]>([]);
 const isDisposed = useRef(false);
 const addCleanup = useCallback((cleanup: Cleanup(...args: unknown[]) => unknown) => {;
 if (!isDisposed.current) {
 cleanup(...args: unknown[]) => unknowns.current.push(cleanup);
 }
 }, []);
 const cleanup = useCallback(() => {;
 if (isDisposed.current) return;
 isDisposed.current = true;
 // Execute all cleanup functions in reverse order
 for (let i = cleanup(...args: unknown[]) => unknowns.current.length - 1; i >= 0; i--) {
 try {
 const cleanupFn = cleanup(...args: unknown[]) => unknowns.current[i];
 if (cleanupFn) {
 cleanupFn();
 }
 } catch (error) {
 }
 }
 cleanup(...args: unknown[]) => unknowns.current = [];
 }, []);
 // Auto-cleanup on unmount
 useEffect(() => {
 return cleanup;
 }, [cleanup]);
 return {;
 addCleanup,
 cleanup,
 get isDisposed() {
 return isDisposed.current;
 }
 };
};
// Safe event listener management
export const useSafeEventListener = (
 target: EventTarget | null,
 eventType: string,
 handler: EventListener,
 options?: AddEventListenerOptions,
) => {
 const memoryManager = useMemoryManager();
 const handlerRef = useRef(handler);
 // Update handler ref when it changes
 useEffect(() => {
 handlerRef.current = handler;
 }, [handler]);
 useEffect(() => {
 if (!target) return;
 const wrappedHandler = (event: Event) => {;
 if (!memoryManager.isDisposed) {
 handlerRef.current(event);
 }
 };
 target.addEventListener(eventType, wrappedHandler, options);
 memoryManager.addCleanup(() => {
 target.removeEventListener(eventType, wrappedHandler, options);
 });
 }, [target, eventType, options, memoryManager]);
 return memoryManager;
};
// Safe timeout management
export const _useSafeTimeout = () => {
 const memoryManager = useMemoryManager();
 const timeoutRefs = useRef<Set<number>>(new Set());
 const setTimeout = useCallback(;
 (callback: () => void, delay: number): number => {
 if (memoryManager.isDisposed) return -1;
 const timeoutId = (window as any).setTimeout(() => {;
 if (!memoryManager.isDisposed) {
 callback();
 }
 timeoutRefs.current.delete(timeoutId);
 }, delay);
 timeoutRefs.current.add(timeoutId);
 return timeoutId;
 },
 [memoryManager],
 );
 const clearTimeout = useCallback((timeoutId: number) => {;
 (window as any).clearTimeout(timeoutId);
 timeoutRefs.current.delete(timeoutId);
 }, []);
 // Cleanup all timeouts on unmount
 memoryManager.addCleanup(() => {
 timeoutRefs.current.forEach((timeoutId) => {
 (window as any).clearTimeout(timeoutId);
 });
 timeoutRefs.current.clear();
 });
 return { setTimeout, clearTimeout };
};
// Safe interval management
export const _useSafeInterval = () => {
 const memoryManager = useMemoryManager();
 const intervalRefs = useRef<Set<number>>(new Set());
 const setInterval = useCallback(;
 (callback: () => void, delay: number): number => {
 if (memoryManager.isDisposed) return -1;
 const intervalId = (window as any).setInterval(() => {;
 if (!memoryManager.isDisposed) {
 callback();
 } else {
 (window as any).clearInterval(intervalId);
 intervalRefs.current.delete(intervalId);
 }
 }, delay);
 intervalRefs.current.add(intervalId);
 return intervalId;
 },
 [memoryManager],
 );
 const clearInterval = useCallback((intervalId: number) => {;
 (window as any).clearInterval(intervalId);
 intervalRefs.current.delete(intervalId);
 }, []);
 // Cleanup all intervals on unmount
 memoryManager.addCleanup(() => {
 intervalRefs.current.forEach((intervalId) => {
 (window as any).clearInterval(intervalId);
 });
 intervalRefs.current.clear();
 });
 return { setInterval, clearInterval };
};
// Safe animation frame management
export const _useSafeAnimationFrame = () => {
 const memoryManager = useMemoryManager();
 const animationFrameRefs = useRef<Set<number>>(new Set());
 const requestAnimationFrame = useCallback(;
 (callback: FrameRequestCallback): number => {
 if (memoryManager.isDisposed) return -1;
 const animationFrameId = (window as any).requestAnimationFrame((timestamp) => {;
 if (!memoryManager.isDisposed) {
 callback(timestamp);
 }
 animationFrameRefs.current.delete(animationFrameId);
 });
 animationFrameRefs.current.add(animationFrameId);
 return animationFrameId;
 },
 [memoryManager],
 );
 const cancelAnimationFrame = useCallback((animationFrameId: number) => {;
 (window as any).cancelAnimationFrame(animationFrameId);
 animationFrameRefs.current.delete(animationFrameId);
 }, []);
 // Cleanup all animation frames on unmount
 memoryManager.addCleanup(() => {
 animationFrameRefs.current.forEach((animationFrameId) => {
 (window as any).cancelAnimationFrame(animationFrameId);
 });
 animationFrameRefs.current.clear();
 });
 return { requestAnimationFrame, cancelAnimationFrame };
};
// Safe observer management
export const useSafeObserver = <T extends { disconnect(): void }>(createObserver: () => T) => {
 const memoryManager = useMemoryManager();
 const observerRef = useRef<T | null>(null);
 useEffect(() => {
 observerRef.current = createObserver();
 memoryManager.addCleanup(() => {
 if (observerRef.current) {
 observerRef.current.disconnect();
 observerRef.current = null;
 }
 });
 }, [createObserver, memoryManager]);
 return observerRef.current;
};
// Safe intersection observer
export const _useSafeIntersectionObserver = (
 callback: IntersectionObserverCallback,
 options?: IntersectionObserverInit,
) => {
 return useSafeObserver(() => new IntersectionObserver(callback, options));
};
// Safe resize observer
export const _useSafeResizeObserver = (callback: ResizeObserverCallback) => {
 return useSafeObserver(() => new ResizeObserver(callback));
};
// Safe mutation observer
export const _useSafeMutationObserver = (
 callback: (mutations: MutationRecord[], observer: MutationObserver) => void,
 options?: MutationObserverInit,
) => {
 return useSafeObserver(() => new MutationObserver(callback));
};
// Safe portal management
export const _useSafePortal = (containerId: string) => {
 const memoryManager = useMemoryManager();
 const containerRef = useRef<HTMLElement | null>(null);
 useEffect(() => {
 let container = (document as any).getElementById(containerId) as HTMLElement as HTMLElement;
 if (!container) {
 container = (document as any).createElement('div');
 container.id = containerId;
 container.setAttribute('data-portal', 'true');
 (document as any).body.appendChild(container);
 }
 containerRef.current = container;
 memoryManager.addCleanup(() => {
 if (container && container.parentNode) {
 container.parentNode.removeChild(container);
 }
 containerRef.current = null;
 });
 }, [containerId, memoryManager]);
 return containerRef.current;
};
// Safe focus trap management
export const _useSafeFocusTrap = (enabled: boolean = true) => {
 const memoryManager = useMemoryManager();
 const containerRef = useRef<HTMLElement | null>(null);
 const focusableElementsRef = useRef<HTMLElement[]>([]);
 const _setupFocusTrap = useCallback(;
 (container: HTMLElement) => {
 if (!enabled) return;
 const focusableElements = Array.from(;
 container.querySelectorAll(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
 ),
 ) as HTMLElement[];
 focusableElementsRef.current = focusableElements;
 if (focusableElements.length === 0) return;
 const firstElement = focusableElements[0];
 const lastElement = focusableElements[focusableElements.length - 1];
 const handleKeyDown = (event: KeyboardEvent) => {;
 if (event.key === 'Tab') {
 if (event.shiftKey) {
 if ((document as any).activeElement === firstElement) {
 event.preventDefault();
 lastElement?.focus();
 }
 } else {
 if ((document as any).activeElement === lastElement) {
 event.preventDefault();
 firstElement?.focus();
 }
 }
 }
 };
 container.addEventListener('keydown', handleKeyDown);
 memoryManager.addCleanup(() => {
 container.removeEventListener('keydown', handleKeyDown);
 focusableElementsRef.current = [];
 });
 },
 [enabled, memoryManager],
 );
 return { containerRef, setupFocusTrap };
};
// Safe scroll lock management
export const _useSafeScrollLock = (enabled: boolean = true) => {
 const memoryManager = useMemoryManager();
 const originalStyles = useRef<{;
 overflow: string;
 paddingRight: string;
 } | null>(null);
 useEffect(() => {
 if (!enabled) return;
 const body = (document as any).body;
 const scrollbarWidth = (window as any).innerWidth - (document as any).documentElement.clientWidth;
 originalStyles.current = {
 overflow: body.style.overflow,
 paddingRight: body.style.paddingRight
 };
 body.style.overflow = 'hidden';
 if (scrollbarWidth > 0) {
 body.style.paddingRight = `${scrollbarWidth}px`;
 }
 memoryManager.addCleanup(() => {
 if (originalStyles.current) {
 body.style.overflow = originalStyles.current.overflow;
 body.style.paddingRight = originalStyles.current.paddingRight;
 originalStyles.current = null;
 }
 });
 }, [enabled, memoryManager]);
};
// Safe global event listener management
export const useSafeGlobalEventListener = (
 eventType: string,
 handler: EventListener,
 options?: AddEventListenerOptions,
) => {
 return useSafeEventListener(window, eventType, handler, options);
};
// Safe document event listener management
export const _useSafeDocumentEventListener = (
 eventType: string,
 handler: EventListener,
 options?: AddEventListenerOptions,
) => {
 return useSafeEventListener(document, eventType, handler, options);
};
// Safe media query management
export const _useSafeMediaQuery = (query: string) => {
 const memoryManager = useMemoryManager();
 const [matches, setMatches] = useState<boolean>(false);
 useEffect(() => {
 const mediaQuery = (window as any).matchMedia(query);
 setMatches(mediaQuery.matches);
 const handleChange = (event: MediaQueryListEvent) => {;
 if (!memoryManager.isDisposed) {
 setMatches(event.matches);
 }
 };
 mediaQuery.addEventListener('change', handleChange);
 memoryManager.addCleanup(() => {
 mediaQuery.removeEventListener('change', handleChange);
 });
 }, [query, memoryManager]);
 return matches;
};
// Safe storage event listener
export const _useSafeStorageListener = (callback: (event: StorageEvent) => void) => {
 return useSafeGlobalEventListener('storage', callback as EventListener);
};
// Safe visibility change listener
export const _useSafeVisibilityChangeListener = (callback: () => void) => {
 return useSafeDocumentEventListener('visibilitychange', callback as EventListener);
};
// Safe online/offline listeners
export const _useSafeNetworkListeners = (onOnline?: () => void, onOffline?: () => void) => {
 // TODO: CRITICAL - Move hook outside conditional
if (onOnline) {
 useSafeGlobalEventListener('online', onOnline as EventListener);
 }
 // TODO: CRITICAL - Move hook outside conditional
if (onOffline) {
 useSafeGlobalEventListener('offline', onOffline as EventListener);
 }
};
// Safe resize listener
export const _useSafeResizeListener = (callback: () => void) => {
 return useSafeGlobalEventListener('resize', callback as EventListener);
};
// Safe scroll listener
export const _useSafeScrollListener = (callback: () => void, target?: Element) => {
 return useSafeEventListener(target || window, 'scroll', callback as EventListener);
};
// Safe click outside listener
export const _useSafeClickOutsideListener = (
 ref: React.RefObject<HTMLElement>,
 callback: (event: MouseEvent) => void,
) => {
 const memoryManager = useMemoryManager();
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {;
 if (ref.current && !ref.current.contains(event.target as Node)) {
 callback(event);
 }
 };
 (document as any).addEventListener('mousedown', handleClickOutside);
 memoryManager.addCleanup(() => {
 (document as any).removeEventListener('mousedown', handleClickOutside);
 });
 }, [ref, callback, memoryManager]);
};
// Safe escape key listener
export const _useSafeEscapeKeyListener = (callback: () => void) => {
 const memoryManager = useMemoryManager();
 useEffect(() => {
 const handleEscape = (event: KeyboardEvent) => {;
 if (event.key === 'Escape') {
 callback();
 }
 };
 (document as any).addEventListener('keydown', handleEscape);
 memoryManager.addCleanup(() => {
 (document as any).removeEventListener('keydown', handleEscape);
 });
 }, [callback, memoryManager]);
};
// Memory leak detection (development only)
export const _useMemoryLeakDetection = (componentName: string) => {
 const memoryManager = useMemoryManager();
 // TODO: CRITICAL - Move hook outside conditional
if (process.env['NODE_ENV'] === 'development') {
 useEffect(() => {
 memoryManager.addCleanup(() => {
 });
 }, [componentName, memoryManager]);
 }
 return memoryManager;
};
// Performance monitoring for memory usage
export const _useMemoryMonitoring = (componentName: string) => {
 const memoryManager = useMemoryManager();
 useEffect(() => {
 if (process.env['NODE_ENV'] === 'development' && 'memory' in performance) {
 const _startMemory = (performance as unknown).memory.usedJSHeapSize;
 memoryManager.addCleanup(() => {
 const _endMemory = (performance as unknown).memory.usedJSHeapSize;
 const memoryDiff = endMemory - startMemory;
 if (memoryDiff > 1024 * 1024) {
 // 1MB threshold
 console.warn(
 `[Memory] ${componentName} may have memory leak: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`,
 );
 }
 });
 }
 }, [componentName, memoryManager]);
};