/**
 * AI-BOS Accessibility Utilities
 *
 * World-class accessibility utilities for WCAG compliance and enhanced user experience.
 */

// ==================== ACCESSIBILITY TYPES ====================

export interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableFocusIndicators: boolean;
}

export interface AccessibilityViolation {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  element?: HTMLElement;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ==================== ACCESSIBILITY CONSTANTS ====================

export const A11Y_CONSTANTS = {
  WCAG_AA_CONTRAST_RATIO: 4.5,
  WCAG_AAA_CONTRAST_RATIO: 7.0,
  FOCUS_INDICATOR_WIDTH: '2px',
  FOCUS_INDICATOR_COLOR: '#3b82f6',
  REDUCED_MOTION_PREFERENCE: 'prefers-reduced-motion',
  HIGH_CONTRAST_PREFERENCE: 'prefers-contrast',
  LARGE_TEXT_PREFERENCE: 'prefers-reduced-data'
} as const;

// ==================== ACCESSIBILITY UTILITIES ====================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Check if user prefers large text
 */
export const prefersLargeText = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-data: reduce)').matches;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get luminance of a color
 */
export const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  const r = typeof rgb?.r === 'number' ? rgb.r : 0;
  const g = typeof rgb?.g === 'number' ? rgb.g : 0;
  const b = typeof rgb?.b === 'number' ? rgb.b : 0;
  const [rs, gs, bs] = [r, g, b].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }) as [number, number, number];

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  // Ensure result[1], result[2], result[3] are defined
  const r = parseInt(result[1] || '0', 16);
  const g = parseInt(result[2] || '0', 16);
  const b = parseInt(result[3] || '0', 16);
  return { r, g, b };
};

/**
 * Check if color combination meets WCAG AA standards
 */
export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= A11Y_CONSTANTS.WCAG_AA_CONTRAST_RATIO;
};

/**
 * Check if color combination meets WCAG AAA standards
 */
export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= A11Y_CONSTANTS.WCAG_AAA_CONTRAST_RATIO;
};

/**
 * Generate accessible color suggestions
 */
export const generateAccessibleColors = (_baseColor: string): string[] => {
  // This is a simplified implementation
  // In a real-world scenario, you'd use a color library
  return [
    '#ffffff',
    '#000000',
    '#3b82f6',
    '#ef4444',
    '#22c55e'
  ];
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within an element
   */
  trapFocus: (element: HTMLElement): void => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  },

  /**
   * Move focus to first focusable element
   */
  focusFirst: (element: HTMLElement): void => {
    const focusableElement = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (focusableElement) {
      focusableElement.focus();
    }
  },

  /**
   * Move focus to last focusable element
   */
  focusLast: (element: HTMLElement): void => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  }
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announce message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Hide element from screen readers
   */
  hide: (element: HTMLElement): void => {
    element.setAttribute('aria-hidden', 'true');
  },

  /**
   * Show element to screen readers
   */
  show: (element: HTMLElement): void => {
    element.removeAttribute('aria-hidden');
  }
};

/**
 * Accessibility validation
 */
export const validateAccessibility = (element: HTMLElement): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = [];

  // Check for alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      violations.push({
        type: 'error',
        code: 'WCAG2.1_1.1.1',
        message: 'Image missing alt text',
        element: img,
        severity: 'high'
      });
    }
  });

  // Check for form labels
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        violations.push({
          type: 'error',
          code: 'WCAG2.1_3.3.2',
          message: 'Form control missing label',
          element: input as HTMLElement,
          severity: 'high'
        });
      }
    }
  });

  // Check for heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      violations.push({
        type: 'warning',
        code: 'WCAG2.1_1.3.1',
        message: 'Heading hierarchy skipped',
        element: heading as HTMLElement,
        severity: 'medium'
      });
    }
    previousLevel = level;
  });

  return violations;
};
