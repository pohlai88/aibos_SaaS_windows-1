/**
 * 🧠 AI-BOS Manifestor Accessibility
 * Manifest-driven accessibility enhancement system
 */

import { Manifestor } from '../manifestor';

// ==================== ACCESSIBILITY TYPES ====================

export interface AccessibilityConfig {
  enableARIA: boolean;
  enableKeyboardNavigation: boolean;
  enableScreenReaderSupport: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableFocusIndicators: boolean;
  enableSkipLinks: boolean;
  enableLiveRegions: boolean;
}

export interface ARIAConfig {
  enableLabels: boolean;
  enableDescriptions: boolean;
  enableRoles: boolean;
  enableStates: boolean;
  enableLiveRegions: boolean;
  enableLandmarks: boolean;
  enableHeadings: boolean;
  enableLists: boolean;
  enableTables: boolean;
  enableForms: boolean;
}

export interface KeyboardConfig {
  enableTabNavigation: boolean;
  enableArrowNavigation: boolean;
  enableEscapeKey: boolean;
  enableEnterKey: boolean;
  enableSpaceKey: boolean;
  enableShortcuts: boolean;
  enableFocusTrapping: boolean;
  enableFocusRestoration: boolean;
}

export interface ScreenReaderConfig {
  enableAnnouncements: boolean;
  enableDescriptions: boolean;
  enableInstructions: boolean;
  enableErrorMessages: boolean;
  enableSuccessMessages: boolean;
  enableLoadingStates: boolean;
  enableProgressIndicators: boolean;
  enableStatusUpdates: boolean;
}

export interface ColorConfig {
  enableHighContrast: boolean;
  enableColorBlindSupport: boolean;
  enableDarkMode: boolean;
  enableCustomColors: boolean;
  contrastRatio: number;
  colorBlindnessType: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

export interface MotionConfig {
  enableReducedMotion: boolean;
  enableSmoothTransitions: boolean;
  enableAnimations: boolean;
  animationDuration: number;
  transitionDuration: number;
}

// ==================== MANIFESTOR ACCESSIBILITY ====================

export class ManifestorAccessibility {
  private static instance: ManifestorAccessibility;
  private manifestor: typeof Manifestor;
  private focusManager: FocusManager;
  private ariaManager: ARIAManager;
  private keyboardManager: KeyboardManager;
  private screenReaderManager: ScreenReaderManager;

  private constructor() {
    this.manifestor = Manifestor;
    this.focusManager = new FocusManager();
    this.ariaManager = new ARIAManager();
    this.keyboardManager = new KeyboardManager();
    this.screenReaderManager = new ScreenReaderManager();
  }

  static getInstance(): ManifestorAccessibility {
    if (!ManifestorAccessibility.instance) {
      ManifestorAccessibility.instance = new ManifestorAccessibility();
    }
    return ManifestorAccessibility.instance;
  }

  /**
   * Get accessibility configuration
   */
  getAccessibilityConfig(): AccessibilityConfig {
    const config = this.manifestor.getConfig('accessibility');

    return {
      enableARIA: config?.enableARIA ?? true,
      enableKeyboardNavigation: config?.enableKeyboardNavigation ?? true,
      enableScreenReaderSupport: config?.enableScreenReaderSupport ?? true,
      enableHighContrast: config?.enableHighContrast ?? true,
      enableReducedMotion: config?.enableReducedMotion ?? true,
      enableFocusIndicators: config?.enableFocusIndicators ?? true,
      enableSkipLinks: config?.enableSkipLinks ?? true,
      enableLiveRegions: config?.enableLiveRegions ?? true
    };
  }

  /**
   * Get ARIA configuration
   */
  getARIAConfig(): ARIAConfig {
    const config = this.manifestor.getConfig('accessibility');

    return {
      enableLabels: config?.aria?.enableLabels ?? true,
      enableDescriptions: config?.aria?.enableDescriptions ?? true,
      enableRoles: config?.aria?.enableRoles ?? true,
      enableStates: config?.aria?.enableStates ?? true,
      enableLiveRegions: config?.aria?.enableLiveRegions ?? true,
      enableLandmarks: config?.aria?.enableLandmarks ?? true,
      enableHeadings: config?.aria?.enableHeadings ?? true,
      enableLists: config?.aria?.enableLists ?? true,
      enableTables: config?.aria?.enableTables ?? true,
      enableForms: config?.aria?.enableForms ?? true
    };
  }

  /**
   * Get keyboard configuration
   */
  getKeyboardConfig(): KeyboardConfig {
    const config = this.manifestor.getConfig('accessibility');

    return {
      enableTabNavigation: config?.keyboard?.enableTabNavigation ?? true,
      enableArrowNavigation: config?.keyboard?.enableArrowNavigation ?? true,
      enableEscapeKey: config?.keyboard?.enableEscapeKey ?? true,
      enableEnterKey: config?.keyboard?.enableEnterKey ?? true,
      enableSpaceKey: config?.keyboard?.enableSpaceKey ?? true,
      enableShortcuts: config?.keyboard?.enableShortcuts ?? true,
      enableFocusTrapping: config?.keyboard?.enableFocusTrapping ?? true,
      enableFocusRestoration: config?.keyboard?.enableFocusRestoration ?? true
    };
  }

  /**
   * Get screen reader configuration
   */
  getScreenReaderConfig(): ScreenReaderConfig {
    const config = this.manifestor.getConfig('accessibility');

    return {
      enableAnnouncements: config?.screenReader?.enableAnnouncements ?? true,
      enableDescriptions: config?.screenReader?.enableDescriptions ?? true,
      enableInstructions: config?.screenReader?.enableInstructions ?? true,
      enableErrorMessages: config?.screenReader?.enableErrorMessages ?? true,
      enableSuccessMessages: config?.screenReader?.enableSuccessMessages ?? true,
      enableLoadingStates: config?.screenReader?.enableLoadingStates ?? true,
      enableProgressIndicators: config?.screenReader?.enableProgressIndicators ?? true,
      enableStatusUpdates: config?.screenReader?.enableStatusUpdates ?? true
    };
  }

  /**
   * Get color configuration
   */
  getColorConfig(): ColorConfig {
    const config = this.manifestor.getConfig('accessibility');

    return {
      enableHighContrast: config?.color?.enableHighContrast ?? true,
      enableColorBlindSupport: config?.color?.enableColorBlindSupport ?? true,
      enableDarkMode: config?.color?.enableDarkMode ?? true,
      enableCustomColors: config?.color?.enableCustomColors ?? false,
      contrastRatio: config?.color?.contrastRatio ?? 4.5,
      colorBlindnessType: config?.color?.colorBlindnessType ?? 'protanopia'
    };
  }

  /**
   * Get motion configuration
   */
  getMotionConfig(): MotionConfig {
    const config = this.manifestor.getConfig('accessibility');

    return {
      enableReducedMotion: config?.motion?.enableReducedMotion ?? true,
      enableSmoothTransitions: config?.motion?.enableSmoothTransitions ?? true,
      enableAnimations: config?.motion?.enableAnimations ?? true,
      animationDuration: config?.motion?.animationDuration ?? 300,
      transitionDuration: config?.motion?.transitionDuration ?? 200
    };
  }

  /**
   * Initialize accessibility features
   */
  initialize(): void {
    const config = this.getAccessibilityConfig();

    if (config.enableARIA) {
      this.ariaManager.initialize();
    }

    if (config.enableKeyboardNavigation) {
      this.keyboardManager.initialize();
    }

    if (config.enableScreenReaderSupport) {
      this.screenReaderManager.initialize();
    }

    if (config.enableFocusIndicators) {
      this.focusManager.initialize();
    }

    // Apply color and motion preferences
    this.applyColorPreferences();
    this.applyMotionPreferences();

    console.log('♿ Accessibility features initialized');
  }

  /**
   * Apply color preferences
   */
  private applyColorPreferences(): void {
    const colorConfig = this.getColorConfig();

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      if (colorConfig.enableHighContrast) {
        root.style.setProperty('--contrast-ratio', colorConfig.contrastRatio.toString());
      }

      if (colorConfig.enableColorBlindSupport) {
        root.style.setProperty('--color-blindness-type', colorConfig.colorBlindnessType);
      }
    }
  }

  /**
   * Apply motion preferences
   */
  private applyMotionPreferences(): void {
    const motionConfig = this.getMotionConfig();

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      if (motionConfig.enableReducedMotion) {
        root.style.setProperty('--animation-duration', motionConfig.animationDuration + 'ms');
        root.style.setProperty('--transition-duration', motionConfig.transitionDuration + 'ms');
      }
    }
  }

  /**
   * Get focus manager
   */
  getFocusManager(): FocusManager {
    return this.focusManager;
  }

  /**
   * Get ARIA manager
   */
  getARIAManager(): ARIAManager {
    return this.ariaManager;
  }

  /**
   * Get keyboard manager
   */
  getKeyboardManager(): KeyboardManager {
    return this.keyboardManager;
  }

  /**
   * Get screen reader manager
   */
  getScreenReaderManager(): ScreenReaderManager {
    return this.screenReaderManager;
  }
}

// ==================== FOCUS MANAGER ====================

export class FocusManager {
  private focusHistory: HTMLElement[] = [];
  private focusTraps: Map<string, HTMLElement[]> = new Map();

  initialize(): void {
    if (typeof document !== 'undefined') {
      this.setupFocusIndicators();
      this.setupFocusRestoration();
    }
  }

  private setupFocusIndicators(): void {
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }

      .focus-trap {
        outline: 2px solid #ef4444 !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  private setupFocusRestoration(): void {
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && !this.focusHistory.includes(target)) {
        this.focusHistory.push(target);
      }
    });
  }

  trapFocus(container: HTMLElement, trapId: string): void {
    const focusableElements = this.getFocusableElements(container);
    this.focusTraps.set(trapId, focusableElements);

    // Focus first element
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }
    }
  }

  releaseFocus(trapId: string): void {
    this.focusTraps.delete(trapId);
  }

  restoreFocus(): void {
    if (this.focusHistory.length > 0) {
      const lastFocused = this.focusHistory.pop()!;
      if (lastFocused && document.contains(lastFocused)) {
        lastFocused.focus();
      }
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }
}

// ==================== ARIA MANAGER ====================

export class ARIAManager {
  private liveRegions: Map<string, HTMLElement> = new Map();

  initialize(): void {
    if (typeof document !== 'undefined') {
      this.setupLiveRegions();
      this.setupLandmarks();
    }
  }

  private setupLiveRegions(): void {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';
    document.body.appendChild(liveRegion);
  }

  private setupLandmarks(): void {
    // Ensure main landmarks exist
    const landmarks = ['main', 'nav', 'header', 'footer', 'aside'];

    landmarks.forEach(landmark => {
      if (!document.querySelector(landmark)) {
        const element = document.createElement(landmark);
        element.setAttribute('role', landmark);
        document.body.appendChild(element);
      }
    });
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;

      // Clear message after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.id = id;
    region.className = 'sr-only';
    document.body.appendChild(region);
    this.liveRegions.set(id, region);
    return region;
  }

  updateLiveRegion(id: string, message: string): void {
    const region = this.liveRegions.get(id);
    if (region) {
      region.textContent = message;
    }
  }

  removeLiveRegion(id: string): void {
    const region = this.liveRegions.get(id);
    if (region) {
      region.remove();
      this.liveRegions.delete(id);
    }
  }
}

// ==================== KEYBOARD MANAGER ====================

export class KeyboardManager {
  private shortcuts: Map<string, () => void> = new Map();
  private navigationHandlers: Map<string, (event: KeyboardEvent) => void> = new Map();

  initialize(): void {
    if (typeof document !== 'undefined') {
      this.setupGlobalKeyboardHandlers();
      this.setupNavigationHandlers();
    }
  }

  private setupGlobalKeyboardHandlers(): void {
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardEvent(event);
    });
  }

  private setupNavigationHandlers(): void {
    // Arrow key navigation
    this.navigationHandlers.set('ArrowUp', (event) => {
      this.navigateToPreviousElement(event);
    });

    this.navigationHandlers.set('ArrowDown', (event) => {
      this.navigateToNextElement(event);
    });

    this.navigationHandlers.set('ArrowLeft', (event) => {
      this.navigateToPreviousElement(event);
    });

    this.navigationHandlers.set('ArrowRight', (event) => {
      this.navigateToNextElement(event);
    });

    // Escape key
    this.navigationHandlers.set('Escape', (event) => {
      this.handleEscapeKey(event);
    });
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    const handler = this.navigationHandlers.get(event.key);
    if (handler) {
      handler(event);
    }

    // Handle shortcuts
    const shortcut = this.getShortcutKey(event);
    const shortcutHandler = this.shortcuts.get(shortcut);
    if (shortcutHandler) {
      event.preventDefault();
      shortcutHandler();
    }
  }

  private navigateToNextElement(event: KeyboardEvent): void {
    const currentElement = event.target as HTMLElement;
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex < focusableElements.length - 1) {
      const nextElement = focusableElements[currentIndex + 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  private navigateToPreviousElement(event: KeyboardEvent): void {
    const currentElement = event.target as HTMLElement;
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex > 0) {
      const prevElement = focusableElements[currentIndex - 1];
      if (prevElement) {
        prevElement.focus();
      }
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
      if (closeButton) {
        (closeButton as HTMLElement).click();
      }
    });
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(document.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');

    return [...modifiers, event.key].join('+');
  }

  registerShortcut(shortcut: string, handler: () => void): void {
    this.shortcuts.set(shortcut, handler);
  }

  unregisterShortcut(shortcut: string): void {
    this.shortcuts.delete(shortcut);
  }
}

// ==================== SCREEN READER MANAGER ====================

export class ScreenReaderManager {
  private ariaManager: ARIAManager;

  constructor() {
    this.ariaManager = new ARIAManager();
  }

  initialize(): void {
    this.ariaManager.initialize();
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.ariaManager.announce(message, priority);
  }

  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  announceLoading(message: string): void {
    this.announce(`${message} loading...`, 'polite');
  }

  announceProgress(current: number, total: number): void {
    const percentage = Math.round((current / total) * 100);
    this.announce(`Progress: ${percentage}% complete`, 'polite');
  }

  announceStatus(message: string): void {
    this.announce(message, 'polite');
  }
}

// ==================== ACCESSIBILITY UTILITIES ====================

export class AccessibilityUtils {
  /**
   * Generate ARIA label
   */
  static generateARIALabel(element: HTMLElement, context?: string): string {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim();
    const placeholder = element.getAttribute('placeholder');
    const title = element.getAttribute('title');
    const ariaLabel = element.getAttribute('aria-label');

    if (ariaLabel) return ariaLabel;
    if (title) return title;
    if (placeholder) return placeholder;
    if (textContent) return textContent;

    // Generate based on tag and context
    switch (tagName) {
      case 'button':
        return context ? `${context} button` : 'Button';
      case 'input':
        return context ? `${context} input field` : 'Input field';
      case 'select':
        return context ? `${context} dropdown` : 'Dropdown';
      case 'textarea':
        return context ? `${context} text area` : 'Text area';
      case 'a':
        return context ? `${context} link` : 'Link';
      default:
        return context || 'Element';
    }
  }

  /**
   * Generate ARIA description
   */
  static generateARIADescription(element: HTMLElement, description?: string): string {
    if (description) return description;

    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const describedElement = document.getElementById(ariaDescribedBy);
      if (describedElement) {
        return describedElement.textContent || '';
      }
    }

    return '';
  }

  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const tabIndex = element.getAttribute('tabindex');
    const disabled = element.hasAttribute('disabled');
    const hidden = element.hasAttribute('hidden');

    if (disabled || hidden) return false;

    if (tabIndex === '-1') return false;

    const focusableTags = ['button', 'input', 'select', 'textarea', 'a'];
    if (focusableTags.includes(tagName)) return true;

    if (tabIndex !== null) return true;

    return false;
  }

  /**
   * Get next focusable element
   */
  static getNextFocusableElement(currentElement: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex < focusableElements.length - 1) {
      const nextElement = focusableElements[currentIndex + 1];
      return nextElement || null;
    }

    return null;
  }

  /**
   * Get previous focusable element
   */
  static getPreviousFocusableElement(currentElement: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex > 0) {
      const prevElement = focusableElements[currentIndex - 1];
      return prevElement || null;
    }

    return null;
  }

  /**
   * Get all focusable elements
   */
  static getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Get manifestor accessibility instance
 */
export function getManifestorAccessibility(): ManifestorAccessibility {
  return ManifestorAccessibility.getInstance();
}

/**
 * Get accessibility utilities
 */
export function getAccessibilityUtils(): typeof AccessibilityUtils {
  return AccessibilityUtils;
}
