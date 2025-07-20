/**
 * Visual Development Accessibility Hooks
 *
 * Comprehensive accessibility utilities for WCAG 2.1 AA compliance,
 * keyboard navigation, screen reader support, and inclusive design.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { logger } from '@aibos/shared/lib';

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  announceChanges: boolean;
}

export interface KeyboardNavigationConfig {
  trapFocus: boolean;
  autoFocus: boolean;
  restoreFocus: boolean;
  skipLinks: boolean;
}

export interface AriaAttributes {
  'role'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'tabIndex'?: number;
}

// ============================================================================
// MAIN ACCESSIBILITY HOOK
// ============================================================================

export const useAccessibility = (config: Partial<AccessibilityConfig> = {}) => {
  const defaultConfig: AccessibilityConfig = {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    enableHighContrast: false,
    enableReducedMotion: false,
    announceChanges: true,
    ...config,
  };

  const [a11yConfig, setA11yConfig] = useState(defaultConfig);
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({});

  // Detect user accessibility preferences
  useEffect(() => {
    const preferences: Record<string, boolean> = {};

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      preferences.reducedMotion = true;
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      preferences.highContrast = true;
    }

    // Check for dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      preferences.darkMode = true;
    }

    setUserPreferences(preferences);

    // Update config based on preferences
    setA11yConfig((prev) => ({
      ...prev,
      enableReducedMotion: preferences.reducedMotion || prev.enableReducedMotion,
      enableHighContrast: preferences.highContrast || prev.enableHighContrast,
    }));

    logger.info('Accessibility preferences detected', { preferences });
  }, []);

  return {
    config: a11yConfig,
    userPreferences,
    updateConfig: setA11yConfig,
  };
};

// ============================================================================
// KEYBOARD NAVIGATION HOOK
// ============================================================================

export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  config: Partial<KeyboardNavigationConfig> = {},
) => {
  const navigationConfig = {
    trapFocus: true,
    autoFocus: false,
    restoreFocus: true,
    skipLinks: true,
    ...config,
  };

  const previousActiveElement = useRef<Element | null>(null);
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, [containerRef]);

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!navigationConfig.trapFocus) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab (backward navigation)
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (forward navigation)
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Arrow key navigation for grid/list items
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const currentIndex = focusableElements.findIndex((el) => el === document.activeElement);
        if (currentIndex === -1) return;

        let nextIndex: number;

        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
          default:
            return;
        }

        event.preventDefault();
        focusableElements[nextIndex].focus();
        setFocusedElementId(focusableElements[nextIndex].id || `element-${nextIndex}`);
      }

      // Escape key to exit focus trap
      if (event.key === 'Escape') {
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      }
    },
    [getFocusableElements, navigationConfig.trapFocus],
  );

  // Set up keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Store previous active element for restoration
    if (navigationConfig.restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    // Auto-focus first element if enabled
    if (navigationConfig.autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Add keyboard event listeners
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus when component unmounts
      if (navigationConfig.restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [containerRef, handleKeyDown, getFocusableElements, navigationConfig]);

  return {
    focusedElementId,
    setFocusedElementId,
    getFocusableElements,
  };
};

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

export const useScreenReader = () => {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live region for announcements
  useEffect(() => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';

    document.body.appendChild(liveRegion);
    liveRegionRef.current = liveRegion;

    return () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return;

    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;

    logger.info('Screen reader announcement', { message, priority });

    // Clear the message after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  return { announce };
};

// ============================================================================
// ARIA ATTRIBUTES HOOK
// ============================================================================

export const useAriaAttributes = (
  elementType: 'button' | 'input' | 'dialog' | 'listbox' | 'grid' | 'toolbar' = 'button',
  options: {
    label?: string;
    description?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    live?: 'polite' | 'assertive' | 'off';
  } = {},
) => {
  const ariaAttributes: AriaAttributes = {};

  // Set role based on element type
  switch (elementType) {
    case 'button':
      ariaAttributes.role = 'button';
      ariaAttributes.tabIndex = options.disabled ? -1 : 0;
      break;
    case 'dialog':
      ariaAttributes.role = 'dialog';
      ariaAttributes['aria-modal'] = true;
      break;
    case 'listbox':
      ariaAttributes.role = 'listbox';
      break;
    case 'grid':
      ariaAttributes.role = 'grid';
      break;
    case 'toolbar':
      ariaAttributes.role = 'toolbar';
      break;
  }

  // Set common attributes
  if (options.label) {
    ariaAttributes['aria-label'] = options.label;
  }

  if (options.description) {
    ariaAttributes['aria-describedby'] = `${elementType}-description`;
  }

  if (options.expanded !== undefined) {
    ariaAttributes['aria-expanded'] = options.expanded;
  }

  if (options.selected !== undefined) {
    ariaAttributes['aria-selected'] = options.selected;
  }

  if (options.disabled !== undefined) {
    ariaAttributes['aria-disabled'] = options.disabled;
  }

  if (options.hidden !== undefined) {
    ariaAttributes['aria-hidden'] = options.hidden;
  }

  if (options.live) {
    ariaAttributes['aria-live'] = options.live;
  }

  return ariaAttributes;
};

// ============================================================================
// FOCUS MANAGEMENT HOOK
// ============================================================================

export const useFocusManagement = () => {
  const focusHistory = useRef<HTMLElement[]>([]);

  const pushFocus = useCallback((element: HTMLElement) => {
    if (document.activeElement instanceof HTMLElement) {
      focusHistory.current.push(document.activeElement);
    }
    element.focus();
  }, []);

  const popFocus = useCallback(() => {
    const previousElement = focusHistory.current.pop();
    if (previousElement) {
      previousElement.focus();
    }
  }, []);

  const clearFocusHistory = useCallback(() => {
    focusHistory.current = [];
  }, []);

  return {
    pushFocus,
    popFocus,
    clearFocusHistory,
    focusHistoryLength: focusHistory.current.length,
  };
};

// ============================================================================
// COLOR CONTRAST UTILITIES
// ============================================================================

export const useColorContrast = () => {
  const checkContrast = useCallback((foreground: string, background: string): number => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const { r, g, b } = rgb;
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) return 0;

    const fgLum = getLuminance(fg);
    const bgLum = getLuminance(bg);

    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const meetsWCAG = useCallback(
    (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA') => {
      const contrast = checkContrast(foreground, background);
      const threshold = level === 'AAA' ? 7 : 4.5;
      return contrast >= threshold;
    },
    [checkContrast],
  );

  return {
    checkContrast,
    meetsWCAG,
  };
};

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

export const useAccessibilityTesting = () => {
  const auditElement = useCallback((element: HTMLElement) => {
    const issues: string[] = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });

    // Check for buttons without accessible names
    const buttons = element.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasAccessibleName =
        button.textContent?.trim() ||
        button.getAttribute('aria-label') ||
        button.getAttribute('aria-labelledby');
      if (!hasAccessibleName) {
        issues.push(`Button ${index + 1} missing accessible name`);
      }
    });

    // Check for form inputs without labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel =
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        element.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push(`Form input ${index + 1} missing label`);
      }
    });

    // Check for proper heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push(`Heading ${index + 1} skips hierarchy level`);
      }
      lastLevel = level;
    });

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - issues.length * 10),
    };
  }, []);

  return { auditElement };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique ID for ARIA relationships
 */
export const useUniqueId = (prefix: string = 'aria') => {
  const id = useRef<string>();

  if (!id.current) {
    id.current = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return id.current;
};

/**
 * Announce visual changes to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
