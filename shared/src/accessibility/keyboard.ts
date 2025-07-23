/**
 * AI-BOS Keyboard Navigation Utilities
 *
 * World-class keyboard navigation utilities for comprehensive keyboard accessibility.
 */

// ==================== KEYBOARD TYPES ====================

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export interface KeyboardNavigationConfig {
  enableArrowKeys: boolean;
  enableTabNavigation: boolean;
  enableEscapeKey: boolean;
  enableEnterKey: boolean;
  enableSpaceKey: boolean;
  enableHomeEndKeys: boolean;
  enablePageUpDownKeys: boolean;
}

export interface KeyboardEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  target: HTMLElement;
  preventDefault: () => void;
  stopPropagation: () => void;
}

// ==================== KEYBOARD CONSTANTS ====================

export const KEYBOARD_CONSTANTS = {
  KEYS: {
    TAB: 'Tab',
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    SPACE: ' ',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12'
  },

  NAVIGATION: {
    NEXT: 'next',
    PREVIOUS: 'previous',
    FIRST: 'first',
    LAST: 'last',
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
  },

  MODIFIERS: {
    CTRL: 'ctrl',
    ALT: 'alt',
    SHIFT: 'shift',
    META: 'meta'
  }
} as const;

// ==================== KEYBOARD UTILITIES ====================

/**
 * Create keyboard shortcut handler
 */
export const createKeyboardShortcut = (
  shortcut: KeyboardShortcut,
  element: HTMLElement
): (() => void) => {
  const handler = (event: globalThis.KeyboardEvent) => {
    const matchesKey = event.key === shortcut.key;
    const matchesCtrl = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
    const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;
    const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
    const matchesMeta = shortcut.meta ? event.metaKey : !event.metaKey;

    if (matchesKey && matchesCtrl && matchesAlt && matchesShift && matchesMeta) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  };

  element.addEventListener('keydown', handler);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handler);
  };
};

/**
 * Create keyboard navigation for list items
 */
export const createListNavigation = (
  container: HTMLElement,
  options: {
    selector?: string;
    onSelect?: (element: HTMLElement) => void;
    onNavigate?: (direction: string) => void;
  } = {}
): (() => void) => {
  const selector = options.selector || '[role="listitem"], [role="option"], [role="menuitem"]';
  let currentIndex = 0;

  const getFocusableElements = (): HTMLElement[] => {
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };

  const focusElement = (index: number): void => {
    const elements = getFocusableElements();
    if (elements[index]) {
      elements[index].focus();
      currentIndex = index;
      options.onSelect?.(elements[index]);
    }
  };

  const handler = (event: globalThis.KeyboardEvent) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    switch (event.key) {
      case KEYBOARD_CONSTANTS.KEYS.ARROW_DOWN:
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % elements.length;
        focusElement(nextIndex);
        options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.DOWN);
        break;

      case KEYBOARD_CONSTANTS.KEYS.ARROW_UP:
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
        focusElement(prevIndex);
        options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.UP);
        break;

      case KEYBOARD_CONSTANTS.KEYS.HOME:
        event.preventDefault();
        focusElement(0);
        options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.FIRST);
        break;

      case KEYBOARD_CONSTANTS.KEYS.END:
        event.preventDefault();
        focusElement(elements.length - 1);
        options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.LAST);
        break;

      case KEYBOARD_CONSTANTS.KEYS.ENTER:
      case KEYBOARD_CONSTANTS.KEYS.SPACE:
        event.preventDefault();
        const element = elements[currentIndex];
        if (element) {
          element.click();
        }
        break;
    }
  };

  container.addEventListener('keydown', handler);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handler);
  };
};

/**
 * Create keyboard navigation for grid items
 */
export const createGridNavigation = (
  container: HTMLElement,
  options: {
    columns: number;
    selector?: string;
    onSelect?: (element: HTMLElement) => void;
    onNavigate?: (direction: string) => void;
  }
): (() => void) => {
  const selector = options.selector || '[role="gridcell"]';
  let currentIndex = 0;

  const getFocusableElements = (): HTMLElement[] => {
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };

  const focusElement = (index: number): void => {
    const elements = getFocusableElements();
    if (elements[index]) {
      elements[index].focus();
      currentIndex = index;
      options.onSelect?.(elements[index]);
    }
  };

  const handler = (event: globalThis.KeyboardEvent) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const totalElements = elements.length;
    const columns = options.columns;
    const rows = Math.ceil(totalElements / columns);
    const currentRow = Math.floor(currentIndex / columns);
    const currentCol = currentIndex % columns;

    switch (event.key) {
      case KEYBOARD_CONSTANTS.KEYS.ARROW_DOWN:
        event.preventDefault();
        const nextRow = (currentRow + 1) % rows;
        const downIndex = nextRow * columns + currentCol;
        if (downIndex < totalElements) {
          focusElement(downIndex);
          options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.DOWN);
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.ARROW_UP:
        event.preventDefault();
        const prevRow = currentRow === 0 ? rows - 1 : currentRow - 1;
        const upIndex = prevRow * columns + currentCol;
        if (upIndex < totalElements) {
          focusElement(upIndex);
          options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.UP);
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.ARROW_RIGHT:
        event.preventDefault();
        const nextCol = (currentCol + 1) % columns;
        const rightIndex = currentRow * columns + nextCol;
        if (rightIndex < totalElements) {
          focusElement(rightIndex);
          options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.RIGHT);
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.ARROW_LEFT:
        event.preventDefault();
        const prevCol = currentCol === 0 ? columns - 1 : currentCol - 1;
        const leftIndex = currentRow * columns + prevCol;
        if (leftIndex < totalElements) {
          focusElement(leftIndex);
          options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.LEFT);
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.HOME:
        event.preventDefault();
        if (event.ctrlKey) {
          focusElement(0);
          options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.FIRST);
        } else {
          const rowStartIndex = currentRow * columns;
          focusElement(rowStartIndex);
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.END:
        event.preventDefault();
        if (event.ctrlKey) {
          focusElement(totalElements - 1);
          options.onNavigate?.(KEYBOARD_CONSTANTS.NAVIGATION.LAST);
        } else {
          const rowEndIndex = Math.min((currentRow + 1) * columns - 1, totalElements - 1);
          focusElement(rowEndIndex);
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.ENTER:
      case KEYBOARD_CONSTANTS.KEYS.SPACE:
        event.preventDefault();
        const element = elements[currentIndex];
        if (element) {
          element.click();
        }
        break;
    }
  };

  container.addEventListener('keydown', handler);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handler);
  };
};

/**
 * Create keyboard navigation for tabs
 */
export const createTabNavigation = (
  tabList: HTMLElement,
  options: {
    onTabChange?: (index: number) => void;
  } = {}
): (() => void) => {
  let currentIndex = 0;

  const getTabs = (): HTMLElement[] => {
    return Array.from(tabList.querySelectorAll('[role="tab"]')) as HTMLElement[];
  };

  const focusTab = (index: number): void => {
    const tabs = getTabs();
    if (tabs[index]) {
      tabs[index].focus();
      currentIndex = index;
      options.onTabChange?.(index);
    }
  };

  const handler = (event: globalThis.KeyboardEvent) => {
    const tabs = getTabs();
    if (tabs.length === 0) return;

    switch (event.key) {
      case KEYBOARD_CONSTANTS.KEYS.ARROW_LEFT:
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        focusTab(prevIndex);
        break;

      case KEYBOARD_CONSTANTS.KEYS.ARROW_RIGHT:
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        focusTab(nextIndex);
        break;

      case KEYBOARD_CONSTANTS.KEYS.HOME:
        event.preventDefault();
        focusTab(0);
        break;

      case KEYBOARD_CONSTANTS.KEYS.END:
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;

      case KEYBOARD_CONSTANTS.KEYS.ENTER:
      case KEYBOARD_CONSTANTS.KEYS.SPACE:
        event.preventDefault();
        const tab = tabs[currentIndex];
        if (tab) {
          tab.click();
        }
        break;
    }
  };

  tabList.addEventListener('keydown', handler);

  // Return cleanup function
  return () => {
    tabList.removeEventListener('keydown', handler);
  };
};

/**
 * Create keyboard navigation for modal dialogs
 */
export const createModalNavigation = (
  modal: HTMLElement,
  options: {
    onClose?: () => void;
    onEscape?: () => void;
  } = {}
): (() => void) => {
  const handler = (event: globalThis.KeyboardEvent) => {
    switch (event.key) {
      case KEYBOARD_CONSTANTS.KEYS.ESCAPE:
        event.preventDefault();
        options.onEscape?.();
        options.onClose?.();
        break;

      case KEYBOARD_CONSTANTS.KEYS.TAB:
        // Trap focus within modal
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
        break;
    }
  };

  modal.addEventListener('keydown', handler);

  // Return cleanup function
  return () => {
    modal.removeEventListener('keydown', handler);
  };
};

/**
 * Create keyboard navigation for dropdown menus
 */
export const createDropdownNavigation = (
  dropdown: HTMLElement,
  options: {
    onSelect?: (element: HTMLElement) => void;
    onClose?: () => void;
  } = {}
): (() => void) => {
  let currentIndex = 0;

  const getMenuItems = (): HTMLElement[] => {
    return Array.from(dropdown.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
  };

  const focusMenuItem = (index: number): void => {
    const items = getMenuItems();
    if (items[index]) {
      items[index].focus();
      currentIndex = index;
    }
  };

  const handler = (event: globalThis.KeyboardEvent) => {
    const items = getMenuItems();
    if (items.length === 0) return;

    switch (event.key) {
      case KEYBOARD_CONSTANTS.KEYS.ARROW_DOWN:
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        focusMenuItem(nextIndex);
        break;

      case KEYBOARD_CONSTANTS.KEYS.ARROW_UP:
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        focusMenuItem(prevIndex);
        break;

      case KEYBOARD_CONSTANTS.KEYS.ENTER:
      case KEYBOARD_CONSTANTS.KEYS.SPACE:
        event.preventDefault();
        const item = items[currentIndex];
        if (item) {
          options.onSelect?.(item);
          item.click();
        }
        break;

      case KEYBOARD_CONSTANTS.KEYS.ESCAPE:
        event.preventDefault();
        options.onClose?.();
        break;

      case KEYBOARD_CONSTANTS.KEYS.HOME:
        event.preventDefault();
        focusMenuItem(0);
        break;

      case KEYBOARD_CONSTANTS.KEYS.END:
        event.preventDefault();
        focusMenuItem(items.length - 1);
        break;
    }
  };

  dropdown.addEventListener('keydown', handler);

  // Return cleanup function
  return () => {
    dropdown.removeEventListener('keydown', handler);
  };
};

/**
 * Check if element is keyboard focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');

  // Elements that are naturally focusable
  if (['input', 'select', 'textarea', 'button', 'a'].includes(tagName)) {
    return true;
  }

  // Elements with tabindex >= 0
  if (tabIndex !== null && parseInt(tabIndex) >= 0) {
    return true;
  }

  // Elements with role that should be focusable
  const role = element.getAttribute('role');
  if (['button', 'link', 'checkbox', 'radio', 'textbox', 'menuitem', 'tab'].includes(role || '')) {
    return true;
  }

  return false;
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="textbox"]',
    '[role="menuitem"]',
    '[role="tab"]'
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
};

/**
 * Focus first focusable element in container
 */
export const focusFirst = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  if (firstElement) {
    firstElement.focus();
  }
};

/**
 * Focus last focusable element in container
 */
export const focusLast = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  const lastElement = focusableElements[focusableElements.length - 1];
  if (lastElement) {
    lastElement.focus();
  }
};

/**
 * Focus next focusable element
 */
export const focusNext = (currentElement: HTMLElement): void => {
  const container = currentElement.closest('body') || document.body;
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
    const nextElement = focusableElements[currentIndex + 1];
    if (nextElement) {
      nextElement.focus();
    }
  }
};

/**
 * Focus previous focusable element
 */
export const focusPrevious = (currentElement: HTMLElement): void => {
  const container = currentElement.closest('body') || document.body;
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex > 0) {
    const prevElement = focusableElements[currentIndex - 1];
    if (prevElement) {
      prevElement.focus();
    }
  }
};
