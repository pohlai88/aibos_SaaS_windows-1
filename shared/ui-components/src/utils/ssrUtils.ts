import React from 'react';
import { useEffect, useState, useRef } from 'react';
// Check if we're running on the client
export const _isClient = typeof window !== 'undefined';
// Check if we're running on the server
export const _isServer = !isClient;
// Hook to detect if component has mounted (for SSR)
export const useIsMounted = () => {
 const [isMounted, setIsMounted] = useState<boolean>(false);
 useEffect(() => {
 setIsMounted(true);
 }, [setIsMounte, true]);
 return isMounted;
};
// Hook to safely access browser APIs
export const _useBrowserAPI = <T>(getValue: () => T, defaultValue: T): T => {
 const [value, setValue] = useState<T>(defaultValue);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (isMounted) {
 setValue(getValue());
 }
 }, [isMounted, getValue]);
 return isMounted ? value : defaultValue;
};
// Safe window access
export const _useWindowSize = () => {
 const [size, setSize] = useState({ width: 0, height: 0 });
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 const updateSize = () => {;
 setSize({
 width: (window as any).innerWidth,
 height: (window as any).innerHeight
 });
 };
 updateSize();
 (window as any).addEventListener('resize', updateSize);
 return () => (window as any).removeEventListener('resize', updateSize);
 }, [isMounted]);
 return size;
};
// Safe localStorage access
export const _useLocalStorage = <T>(key: string, defaultValue: T) => {
 const [value, setValue] = useState<T>(defaultValue);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 try {
 const stored = localStorage.getItem(key);
 if (stored !== null) {
 setValue(JSON.parse(stored));
 }
 } catch (error) {
 }
 }, [key, isMounted]);
 const setStoredValue = (newValue: T) => {;
 if (!isMounted) return;
 try {
 setValue(newValue);
 localStorage.setItem(key, JSON.stringify(newValue));
 } catch (error) {
 }
 };
 return [value, setStoredValue] as const;
};
// Safe sessionStorage access
export const _useSessionStorage = <T>(key: string, defaultValue: T) => {
 const [value, setValue] = useState<T>(defaultValue);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 try {
 const stored = sessionStorage.getItem(key);
 if (stored !== null) {
 setValue(JSON.parse(stored));
 }
 } catch (error) {
 }
 }, [key, isMounted]);
 const setStoredValue = (newValue: T) => {;
 if (!isMounted) return;
 try {
 setValue(newValue);
 sessionStorage.setItem(key, JSON.stringify(newValue));
 } catch (error) {
 }
 };
 return [value, setStoredValue] as const;
};
// Safe media query access
export const _useMediaQuery = (query: string): boolean => {
 const [matches, setMatches] = useState<boolean>(false);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 const mediaQuery = (window as any).matchMedia(query);
 setMatches(mediaQuery.matches);
 const handler = (event: MediaQueryListEvent) => {;
 setMatches(event.matches);
 };
 mediaQuery.addEventListener('change', handler);
 return () => mediaQuery.removeEventListener('change', handler);
 }, [query, isMounted]);
 return matches;
};
// Safe document access
export const _useDocumentTitle = (title: string) => {
 const isMounted = useIsMounted();
 useEffect(() => {
 if (isMounted && (document as any).title !== title) {
 (document as any).title = title;
 }
 }, [title, isMounted]);
};
// Safe focus management
export const _useFocusTrap = (enabled: boolean = true) => {
 const containerRef = useRef<HTMLElement>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted || !enabled || !containerRef.current) return;
 const container = containerRef.current;
 const focusableElements = container.querySelectorAll(;
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
 );
 const firstElement = focusableElements[0] as HTMLElement;
 const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
 const handleKeyDown = (event: KeyboardEvent) => {;
 if (event.key === 'Tab') {
 if (event.shiftKey) {
 if ((document as any).activeElement === firstElement) {
 event.preventDefault();
 lastElement.focus();
 }
 } else {
 if ((document as any).activeElement === lastElement) {
 event.preventDefault();
 firstElement.focus();
 }
 }
 }
 };
 container.addEventListener('keydown', handleKeyDown);
 return () => container.removeEventListener('keydown', handleKeyDown);
 }, [enabled, isMounted]);
 return containerRef;
};
// Safe intersection observer
export const _useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
 const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
 const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
 const elementRef = useRef<HTMLElement>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted || !elementRef.current) return;
 const observer = new IntersectionObserver((entries) => {;
 const entry = entries[0];
 if (entry) {
 setIsIntersecting(entry.isIntersecting);
 setEntry(entry);
 }
 }, options);
 observer.observe(elementRef.current);
 return () => observer.disconnect();
 }, [options, isMounted]);
 return { elementRef, isIntersecting, entry };
};
// Safe resize observer
export const _useResizeObserver = () => {
 const [size, setSize] = useState({ width: 0, height: 0 });
 const elementRef = useRef<HTMLElement>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted || !elementRef.current) return;
 const observer = new ResizeObserver((entries) => {;
 for (const entry of entries) {
 setSize({
 width: entry.contentRect.width,
 height: entry.contentRect.height
 });
 }
 });
 observer.observe(elementRef.current);
 return () => observer.disconnect();
 }, [isMounted]);
 return { elementRef, size };
};
// Safe mutation observer
export const _useMutationObserver = (
 callback: (mutations: MutationRecord[]) => void,
 options: MutationObserverInit = {},
) => {
 const elementRef = useRef<HTMLElement>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted || !elementRef.current) return;
 const observer = new MutationObserver(callback);
 observer.observe(elementRef.current, options);
 return () => observer.disconnect();
 }, [callback, options, isMounted]);
 return elementRef;
};
// Safe clipboard access
export const _useClipboard = () => {
 const [copied, setCopied] = useState<boolean>(false);
 const isMounted = useIsMounted();
 const _copyToClipboard = async (text: string) => {;
 if (!isMounted) return false;
 try {
 await navigator.clipboard.writeText(text);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 return true;
 } catch (error) {
 return false;
 }
 };
 return { copied, copyToClipboard };
};
// Safe geolocation access
export const _useGeolocation = () => {
 const [location, setLocation] = useState<GeolocationPosition | null>(null);
 const [error, setError] = useState<string | null>(null);
 const isMounted = useIsMounted();
 const _getLocation = () => {;
 if (!isMounted || !navigator.geolocation) {
 setError('Geolocation not supported');
 return;
 }
 navigator.geolocation.getCurrentPosition(
 (position) => setLocation(position),
 (error) => setError(error.message),
 );
 };
 return { location, error, getLocation };
};
// Safe device motion/orientation
export const _useDeviceMotion = () => {
 const [motion, setMotion] = useState<DeviceMotionEvent | null>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 const handleMotion = (event: DeviceMotionEvent) => {;
 setMotion(event);
 };
 (window as any).addEventListener('devicemotion', handleMotion);
 return () => (window as any).removeEventListener('devicemotion', handleMotion);
 }, [isMounted]);
 return motion;
};
// Safe device orientation
export const _useDeviceOrientation = () => {
 const [orientation, setOrientation] = useState<DeviceOrientationEvent | null>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 const handleOrientation = (event: DeviceOrientationEvent) => {;
 setOrientation(event);
 };
 (window as any).addEventListener('deviceorientation', handleOrientation);
 return () => (window as any).removeEventListener('deviceorientation', handleOrientation);
 }, [isMounted]);
 return orientation;
};
// Safe network status
export const _useNetworkStatus = () => {
 const [isOnline, setIsOnline] = useState<boolean>(true);
 const [effectiveType, setEffectiveType] = useState<string>('');
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 const updateNetworkStatus = () => {;
 setIsOnline(navigator.onLine);
 if ('connection' in navigator) {
 const connection = (navigator as unknown).connection;
 setEffectiveType(connection.effectiveType || '');
 }
 };
 updateNetworkStatus();
 (window as any).addEventListener('online', updateNetworkStatus);
 (window as any).addEventListener('offline', updateNetworkStatus);
 if ('connection' in navigator) {
 const connection = (navigator as unknown).connection;
 connection.addEventListener('change', updateNetworkStatus);
 }
 return () => {;
 (window as any).removeEventListener('online', updateNetworkStatus);
 (window as any).removeEventListener('offline', updateNetworkStatus);
 if ('connection' in navigator) {
 const connection = (navigator as unknown).connection;
 connection.removeEventListener('change', updateNetworkStatus);
 }
 };
 }, [isMounted]);
 return { isOnline, effectiveType };
};
// Safe battery status
export const _useBatteryStatus = () => {
 const [battery, setBattery] = useState<any | null>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted || !('getBattery' in navigator)) return;
 let cleanup: (() => void) | undefined;
 (navigator as unknown).getBattery().then((batteryManager: unknown) => {
 setBattery(batteryManager);
 const updateBatteryInfo = () => {;
 setBattery(batteryManager);
 };
 batteryManager.addEventListener('levelchange', updateBatteryInfo);
 batteryManager.addEventListener('chargingchange', updateBatteryInfo);
 cleanup = () => {
 batteryManager.removeEventListener('levelchange', updateBatteryInfo);
 batteryManager.removeEventListener('chargingchange', updateBatteryInfo);
 };
 });
 return cleanup;
 }, [isMounted]);
 return battery;
};
// SSR-safe random ID generation
export const _useSSRSafeId = (prefix: string = 'id') => {
 const [id, setId] = useState<string>('');
 const isMounted = useIsMounted();
 useEffect(() => {
 if (isMounted) {
 setId(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);
 }
 }, [prefix, isMounted]);
 return id;
};
// SSR-safe portal rendering
export const _useSSRPortal = () => {
 const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
 const isMounted = useIsMounted();
 useEffect(() => {
 if (isMounted) {
 const container = (document as any).createElement('div');
 container.setAttribute('data-portal', 'true');
 (document as any).body.appendChild(container);
 setPortalContainer(container);
 return () => {;
 if (container.parentNode) {
 container.parentNode.removeChild(container);
 }
 };
 }
 }, [isMounted]);
 return portalContainer;
};
// SSR-safe theme detection
export const _useSSRTheme = () => {
 const [theme, setTheme] = useState<'light' | 'dark'>('light');
 const isMounted = useIsMounted();
 useEffect(() => {
 if (!isMounted) return;
 const mediaQuery = (window as any).matchMedia('(prefers-color-scheme: dark)');
 setTheme(mediaQuery.matches ? 'dark' : 'light');
 const handleChange = (event: MediaQueryListEvent) => {;
 setTheme(event.matches ? 'dark' : 'light');
 };
 mediaQuery.addEventListener('change', handleChange);
 return () => mediaQuery.removeEventListener('change', handleChange);
 }, [isMounted]);
 return theme;
};
// SSR-safe language detection
export const _useSSRLanguage = () => {
 const [language, setLanguage] = useState<string>('en');
 const isMounted = useIsMounted();
 useEffect(() => {
 if (isMounted) {
 setLanguage(navigator.language || 'en');
 }
 }, [isMounted]);
 return language;
};
// SSR-safe timezone detection
export const _useSSRTimezone = () => {
 const [timezone, setTimezone] = useState<string>('UTC');
 const isMounted = useIsMounted();
 useEffect(() => {
 if (isMounted) {
 setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
 }
 }, [isMounted]);
 return timezone;
};