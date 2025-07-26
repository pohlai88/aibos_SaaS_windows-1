/**
 * AI-BOS Helper Utilities
 *
 * Manifest-driven helper functions.
 */

import {
  getConfig,
  isEnabled,
  isFeatureEnabled,
  trackComponentRender
} from '../manifestor';

// ==================== MANIFEST-DRIVEN UTILITY FUNCTIONS ====================

/**
 * Get utility configuration from manifest
 */
function getUtilityConfig(key?: string): any {
  if (!isEnabled('shared:utilities')) {
    return null;
  }

  return getConfig('shared:utilities', key);
}

/**
 * Check if a utility feature is enabled
 */
function isUtilityFeatureEnabled(feature: string): boolean {
  if (!isEnabled('shared:utilities')) {
    return false;
  }

  return isFeatureEnabled('shared:utilities', feature);
}

/**
 * Get performance configuration
 */
function getPerformanceConfig(): any {
  const config = getUtilityConfig('performance');
  return {
    debounce: config?.debounce || 300,
    throttle: config?.throttle || 100,
    memoization: config?.memoization || true
  };
}

// ==================== MANIFEST-DRIVEN UTILITIES ====================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait?: number
): ((...args: Parameters<T>) => void) => {
  // Use manifest configuration if no wait time provided
  const config = getPerformanceConfig();
  const defaultWait = wait || config.debounce;

  // Check if debounce feature is enabled
  if (!isUtilityFeatureEnabled('debounce')) {
    // Return original function if debounce is disabled
    return func as any;
  }

  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), defaultWait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit?: number
): ((...args: Parameters<T>) => void) => {
  // Use manifest configuration if no limit provided
  const config = getPerformanceConfig();
  const defaultLimit = limit || config.throttle;

  // Check if throttle feature is enabled
  if (!isUtilityFeatureEnabled('throttle')) {
    // Return original function if throttle is disabled
    return func as any;
  }

  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), defaultLimit);
    }
  };
};

/**
 * Memoization utility with manifest-driven configuration
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  // Check if memoization feature is enabled
  if (!isUtilityFeatureEnabled('memoize')) {
    return func;
  }

  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Lazy loading utility with manifest-driven configuration
 */
export const lazy = <T>(
  factory: () => Promise<T>
): (() => Promise<T>) => {
  // Check if lazy loading feature is enabled
  if (!isUtilityFeatureEnabled('lazy')) {
    // Return synchronous factory if lazy loading is disabled
    return async () => {
      const result = await factory();
      return result;
    };
  }

  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (cached !== null) {
      return cached;
    }

    if (loading === null) {
      loading = factory().then(result => {
        cached = result;
        return result;
      });
    }

    return loading;
  };
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Email validation with manifest-driven configuration
 */
export const validateEmail = (email: string): boolean => {
  if (!isUtilityFeatureEnabled('validation:email')) {
    return true; // Skip validation if disabled
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * URL validation with manifest-driven configuration
 */
export const validateUrl = (url: string): boolean => {
  if (!isUtilityFeatureEnabled('validation:url')) {
    return true; // Skip validation if disabled
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * UUID validation with manifest-driven configuration
 */
export const validateUuid = (uuid: string): boolean => {
  if (!isUtilityFeatureEnabled('validation:uuid')) {
    return true; // Skip validation if disabled
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ==================== FORMATTING UTILITIES ====================

/**
 * Date formatting with manifest-driven configuration
 */
export const formatDate = (date: Date, format?: string): string => {
  if (!isUtilityFeatureEnabled('formatting:date')) {
    return date.toISOString(); // Fallback to ISO format
  }

  const config = getUtilityConfig('formatting');
  const dateFormat = format || config?.dateFormat || 'ISO';

  switch (dateFormat) {
    case 'ISO':
      return date.toISOString();
    case 'locale':
      return date.toLocaleDateString();
    case 'short':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    default:
      return date.toISOString();
  }
};

/**
 * Number formatting with manifest-driven configuration
 */
export const formatNumber = (number: number, format?: string): string => {
  if (!isUtilityFeatureEnabled('formatting:number')) {
    return number.toString(); // Fallback to string conversion
  }

  const config = getUtilityConfig('formatting');
  const numberFormat = format || config?.numberFormat || 'en-US';

  return new Intl.NumberFormat(numberFormat).format(number);
};

/**
 * Currency formatting with manifest-driven configuration
 */
export const formatCurrency = (amount: number, currency?: string): string => {
  if (!isUtilityFeatureEnabled('formatting:currency')) {
    return amount.toString(); // Fallback to string conversion
  }

  const config = getUtilityConfig('formatting');
  const currencyFormat = currency || config?.currencyFormat || 'USD';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyFormat
  }).format(amount);
};
