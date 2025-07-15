import { useEffect, useState, useRef } from 'react';

// Check if we're running on the client
export const isClient = typeof window !== 'undefined';

// Check if we're running on the server
export const isServer = !isClient;

// Hook to detect if component has mounted (for SSR)
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return isMounted;
};

// Hook to safely access browser APIs
export const useBrowserAPI = <T>(getValue: () => T, defaultValue: T): T => {
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
export const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;
    
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, [isMounted]);
  
  return size;
};

// Safe localStorage access
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
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
      console.warn(`Failed to read localStorage key "${key}":`, error);
    }
  }, [key, isMounted]);
  
  const setStoredValue = (newValue: T) => {
    if (!isMounted) return;
    
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}":`, error);
    }
  };
  
  return [value, setStoredValue] as const;
};

// Safe sessionStorage access
export const useSessionStorage = <T>(key: string, defaultValue: T) => {
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
      console.warn(`Failed to read sessionStorage key "${key}":`, error);
    }
  }, [key, isMounted]);
  
  const setStoredValue = (newValue: T) => {
    if (!isMounted) return;
    
    try {
      setValue(newValue);
      sessionStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Failed to write sessionStorage key "${key}":`, error);
    }
  };
  
  return [value, setStoredValue] as const;
};

// Safe media query access
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query, isMounted]);
  
  return matches;
};

// Safe document access
export const useDocumentTitle = (title: string) => {
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (isMounted && document.title !== title) {
      document.title = title;
    }
  }, [title, isMounted]);
};

// Safe focus management
export const useFocusTrap = (enabled: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted || !enabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
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
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted || !elementRef.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);
    
    observer.observe(elementRef.current);
    
    return () => observer.disconnect();
  }, [options, isMounted]);
  
  return { elementRef, isIntersecting, entry };
};

// Safe resize observer
export const useResizeObserver = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLElement>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted || !elementRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    
    observer.observe(elementRef.current);
    
    return () => observer.disconnect();
  }, [isMounted]);
  
  return { elementRef, size };
};

// Safe mutation observer
export const useMutationObserver = (
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = {}
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
export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const isMounted = useIsMounted();
  
  const copyToClipboard = async (text: string) => {
    if (!isMounted) return false;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      return false;
    }
  };
  
  return { copied, copyToClipboard };
};

// Safe geolocation access
export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useIsMounted();
  
  const getLocation = () => {
    if (!isMounted || !navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation(position),
      (error) => setError(error.message)
    );
  };
  
  return { location, error, getLocation };
};

// Safe device motion/orientation
export const useDeviceMotion = () => {
  const [motion, setMotion] = useState<DeviceMotionEvent | null>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      setMotion(event);
    };
    
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isMounted]);
  
  return motion;
};

// Safe device orientation
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientationEvent | null>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation(event);
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isMounted]);
  
  return orientation;
};

// Safe network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [effectiveType, setEffectiveType] = useState<string>('');
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;
    
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setEffectiveType(connection.effectiveType || '');
      }
    };
    
    updateNetworkStatus();
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkStatus);
    }
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [isMounted]);
  
  return { isOnline, effectiveType };
};

// Safe battery status
export const useBatteryStatus = () => {
  const [battery, setBattery] = useState<BatteryManager | null>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted || !('getBattery' in navigator)) return;
    
    (navigator as any).getBattery().then((batteryManager: BatteryManager) => {
      setBattery(batteryManager);
      
      const updateBatteryInfo = () => {
        setBattery(batteryManager);
      };
      
      batteryManager.addEventListener('levelchange', updateBatteryInfo);
      batteryManager.addEventListener('chargingchange', updateBatteryInfo);
      
      return () => {
        batteryManager.removeEventListener('levelchange', updateBatteryInfo);
        batteryManager.removeEventListener('chargingchange', updateBatteryInfo);
      };
    });
  }, [isMounted]);
  
  return battery;
};

// SSR-safe random ID generation
export const useSSRSafeId = (prefix: string = 'id') => {
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
export const useSSRPortal = () => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (isMounted) {
      const container = document.createElement('div');
      container.setAttribute('data-portal', 'true');
      document.body.appendChild(container);
      setPortalContainer(container);
      
      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };
    }
  }, [isMounted]);
  
  return portalContainer;
};

// SSR-safe theme detection
export const useSSRTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (!isMounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMounted]);
  
  return theme;
};

// SSR-safe language detection
export const useSSRLanguage = () => {
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
export const useSSRTimezone = () => {
  const [timezone, setTimezone] = useState<string>('UTC');
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (isMounted) {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [isMounted]);
  
  return timezone;
}; 