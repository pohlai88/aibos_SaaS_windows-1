/**
 * AI-BOS ARIA Utilities
 *
 * World-class ARIA utilities for proper semantic markup and screen reader support.
 */

// ==================== ARIA TYPES ====================

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-activedescendant'?: string;
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-level'?: number;
  'aria-multiselectable'?: boolean;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-flowto'?: string;
  'aria-keyshortcuts'?: string;
  'aria-roledescription'?: string;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colspan'?: number;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowspan'?: number;
}

export interface AriaRole {
  role: string;
  attributes: AriaAttributes;
  description: string;
}

// ==================== ARIA CONSTANTS ====================

export const ARIA_CONSTANTS = {
  ROLES: {
    BUTTON: 'button',
    LINK: 'link',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    TEXTBOX: 'textbox',
    SEARCHBOX: 'searchbox',
    COMBOBOX: 'combobox',
    LISTBOX: 'listbox',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    TAB: 'tab',
    TABPANEL: 'tabpanel',
    DIALOG: 'dialog',
    ALERT: 'alert',
    ALERTDIALOG: 'alertdialog',
    BANNER: 'banner',
    COMPLEMENTARY: 'complementary',
    CONTENTINFO: 'contentinfo',
    FORM: 'form',
    MAIN: 'main',
    NAVIGATION: 'navigation',
    REGION: 'region',
    SEARCH: 'search',
    STATUS: 'status',
    TOOLBAR: 'toolbar',
    TOOLTIP: 'tooltip',
    TREE: 'tree',
    TREEITEM: 'treeitem',
    GRID: 'grid',
    GRIDCELL: 'gridcell',
    COLUMNHEADER: 'columnheader',
    ROWHEADER: 'rowheader',
    ROW: 'row',
    ROWGROUP: 'rowgroup',
    COLUMNGROUP: 'columngroup',
    ARTICLE: 'article',
    SECTION: 'section',
    HEADING: 'heading',
    LIST: 'list',
    LISTITEM: 'listitem',
    DEFINITION: 'definition',
    TERM: 'term',
    MATH: 'math',
    PRESENTATION: 'presentation',
    NONE: 'none'
  },

  LIVE_REGIONS: {
    OFF: 'off',
    POLITE: 'polite',
    ASSERTIVE: 'assertive'
  },

  STATES: {
    TRUE: 'true',
    FALSE: 'false',
    MIXED: 'mixed',
    UNDEFINED: 'undefined'
  }
} as const;

// ==================== ARIA UTILITIES ====================

/**
 * Set ARIA attributes on an element
 */
export const setAriaAttributes = (element: HTMLElement, attributes: AriaAttributes): void => {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value));
    }
  });
};

/**
 * Remove ARIA attributes from an element
 */
export const removeAriaAttributes = (element: HTMLElement, attributes: (keyof AriaAttributes)[]): void => {
  attributes.forEach(attribute => {
    element.removeAttribute(attribute);
  });
};

/**
 * Get ARIA attributes from an element
 */
export const getAriaAttributes = (element: HTMLElement): Partial<AriaAttributes> => {
  const attributes: Partial<AriaAttributes> = {};

  Object.keys(ARIA_CONSTANTS.ROLES).forEach(key => {
    const attributeName = key.toLowerCase() as keyof AriaAttributes;
    const value = element.getAttribute(attributeName);
    if (value !== null) {
      (attributes as any)[attributeName] = value;
    }
  });

  return attributes;
};

/**
 * Create accessible button
 */
export const createAccessibleButton = (
  element: HTMLElement,
  label: string,
  options: {
    pressed?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    description?: string;
  } = {}
): void => {
  element.setAttribute('role', ARIA_CONSTANTS.ROLES.BUTTON);
  element.setAttribute('aria-label', label);

  if (options.description) {
    element.setAttribute('aria-describedby', options.description);
  }

  if (options.pressed !== undefined) {
    element.setAttribute('aria-pressed', String(options.pressed));
  }

  if (options.expanded !== undefined) {
    element.setAttribute('aria-expanded', String(options.expanded));
  }

  if (options.disabled) {
    element.setAttribute('aria-disabled', 'true');
  }

  // Ensure keyboard accessibility
  element.setAttribute('tabindex', '0');

  // Add keyboard event listeners
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      element.click();
    }
  });
};

/**
 * Create accessible link
 */
export const createAccessibleLink = (
  element: HTMLElement,
  label: string,
  href: string,
  options: {
    external?: boolean;
    description?: string;
  } = {}
): void => {
  element.setAttribute('role', ARIA_CONSTANTS.ROLES.LINK);
  element.setAttribute('aria-label', label);
  element.setAttribute('href', href);

  if (options.description) {
    element.setAttribute('aria-describedby', options.description);
  }

  if (options.external) {
    element.setAttribute('aria-label', `${label} (opens in new window)`);
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer');
  }
};

/**
 * Create accessible checkbox
 */
export const createAccessibleCheckbox = (
  element: HTMLElement,
  label: string,
  options: {
    checked?: boolean;
    disabled?: boolean;
    required?: boolean;
    description?: string;
  } = {}
): void => {
  element.setAttribute('role', ARIA_CONSTANTS.ROLES.CHECKBOX);
  element.setAttribute('aria-label', label);
  element.setAttribute('aria-checked', String(options.checked || false));

  if (options.description) {
    element.setAttribute('aria-describedby', options.description);
  }

  if (options.disabled) {
    element.setAttribute('aria-disabled', 'true');
  }

  if (options.required) {
    element.setAttribute('aria-required', 'true');
  }

  // Ensure keyboard accessibility
  element.setAttribute('tabindex', '0');

  // Add keyboard event listeners
  element.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      const currentState = element.getAttribute('aria-checked') === 'true';
      element.setAttribute('aria-checked', String(!currentState));
    }
  });
};

/**
 * Create accessible dialog
 */
export const createAccessibleDialog = (
  element: HTMLElement,
  options: {
    label?: string;
    description?: string;
    modal?: boolean;
  } = {}
): void => {
  element.setAttribute('role', options.modal ? ARIA_CONSTANTS.ROLES.ALERTDIALOG : ARIA_CONSTANTS.ROLES.DIALOG);

  if (options.label) {
    element.setAttribute('aria-label', options.label);
  }

  if (options.description) {
    element.setAttribute('aria-describedby', options.description);
  }

  if (options.modal) {
    element.setAttribute('aria-modal', 'true');
  }
};

/**
 * Create accessible tab
 */
export const createAccessibleTab = (
  element: HTMLElement,
  label: string,
  panelId: string,
  options: {
    selected?: boolean;
    disabled?: boolean;
  } = {}
): void => {
  element.setAttribute('role', ARIA_CONSTANTS.ROLES.TAB);
  element.setAttribute('aria-label', label);
  element.setAttribute('aria-selected', String(options.selected || false));
  element.setAttribute('aria-controls', panelId);

  if (options.disabled) {
    element.setAttribute('aria-disabled', 'true');
  }

  // Ensure keyboard accessibility
  element.setAttribute('tabindex', options.selected ? '0' : '-1');
};

/**
 * Create accessible tab panel
 */
export const createAccessibleTabPanel = (
  element: HTMLElement,
  tabId: string,
  options: {
    label?: string;
  } = {}
): void => {
  element.setAttribute('role', ARIA_CONSTANTS.ROLES.TABPANEL);
  element.setAttribute('aria-labelledby', tabId);

  if (options.label) {
    element.setAttribute('aria-label', options.label);
  }
};

/**
 * Create accessible list
 */
export const createAccessibleList = (
  element: HTMLElement,
  options: {
    role?: 'list' | 'listbox' | 'menu' | 'tree';
    label?: string;
    multiselectable?: boolean;
  } = {}
): void => {
  const role = options.role || ARIA_CONSTANTS.ROLES.LIST;
  element.setAttribute('role', role);

  if (options.label) {
    element.setAttribute('aria-label', options.label);
  }

  if (options.multiselectable) {
    element.setAttribute('aria-multiselectable', 'true');
  }
};

/**
 * Create accessible list item
 */
export const createAccessibleListItem = (
  element: HTMLElement,
  options: {
    role?: 'listitem' | 'option' | 'menuitem' | 'treeitem';
    selected?: boolean;
    disabled?: boolean;
  } = {}
): void => {
  const role = options.role || ARIA_CONSTANTS.ROLES.LISTITEM;
  element.setAttribute('role', role);

  if (options.selected !== undefined) {
    element.setAttribute('aria-selected', String(options.selected));
  }

  if (options.disabled) {
    element.setAttribute('aria-disabled', 'true');
  }
};

/**
 * Create accessible form field
 */
export const createAccessibleFormField = (
  element: HTMLElement,
  label: string,
  options: {
    type?: 'textbox' | 'searchbox' | 'combobox';
    required?: boolean;
    invalid?: boolean;
    description?: string;
    errorMessage?: string;
  } = {}
): void => {
  const type = options.type || ARIA_CONSTANTS.ROLES.TEXTBOX;
  element.setAttribute('role', type);
  element.setAttribute('aria-label', label);

  if (options.description) {
    element.setAttribute('aria-describedby', options.description);
  }

  if (options.required) {
    element.setAttribute('aria-required', 'true');
  }

  if (options.invalid) {
    element.setAttribute('aria-invalid', 'true');
  }

  if (options.errorMessage) {
    element.setAttribute('aria-errormessage', options.errorMessage);
  }
};

/**
 * Announce to screen readers
 */
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};

/**
 * Generate unique ID for ARIA relationships
 */
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create ARIA relationship between elements
 */
export const createAriaRelationship = (
  controller: HTMLElement,
  controlled: HTMLElement,
  relationship: 'controls' | 'owns' | 'labelledby' | 'describedby' | 'flowto'
): void => {
  const controlledId = controlled.id || generateAriaId();
  if (!controlled.id) {
    controlled.id = controlledId;
  }

  const attributeName = `aria-${relationship}`;
  const currentValue = controller.getAttribute(attributeName);

  if (currentValue) {
    controller.setAttribute(attributeName, `${currentValue} ${controlledId}`);
  } else {
    controller.setAttribute(attributeName, controlledId);
  }
};
