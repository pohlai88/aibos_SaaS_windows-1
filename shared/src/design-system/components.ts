/**
 * AI-BOS Design System Components
 *
 * Manifest-driven design system component exports.
 */

import {
  SharedManifestor,
  getConfig,
  isEnabled,
  isFeatureEnabled,
  trackComponentRender
} from '../manifestor';

// ==================== MANIFEST-DRIVEN COMPONENT FACTORY ====================

export interface ComponentConfig {
  enabled: boolean;
  variants: string[];
  sizes: string[];
  features: Record<string, boolean>;
}

export interface DesignSystemConfig {
  theme: string;
  variant: string;
  animations: boolean;
  accessibility: boolean;
  responsive: boolean;
  components: Record<string, ComponentConfig>;
}

/**
 * Get component configuration from manifest
 */
export function getComponentConfig(componentName: string): ComponentConfig | null {
  if (!isEnabled('shared:components')) {
    return null;
  }

  const config = getConfig('shared:components', 'components');
  const componentConfig = config?.[componentName];

  if (!componentConfig) {
    return null;
  }

  return {
    enabled: componentConfig.enabled || false,
    variants: componentConfig.variants || [],
    sizes: componentConfig.sizes || [],
    features: componentConfig.features || {}
  };
}

/**
 * Get design system configuration from manifest
 */
export function getDesignSystemConfig(): DesignSystemConfig | null {
  if (!isEnabled('shared:design-system')) {
    return null;
  }

  const config = getConfig('shared:design-system');

  return {
    theme: config?.theme || 'auto',
    variant: config?.variant || 'default',
    animations: config?.animations || false,
    accessibility: config?.accessibility || true,
    responsive: config?.responsive || true,
    components: config?.components || {}
  };
}

/**
 * Check if a component feature is enabled
 */
export function isComponentFeatureEnabled(componentName: string, feature: string): boolean {
  if (!isEnabled('shared:components')) {
    return false;
  }

  return isFeatureEnabled('shared:components', `${componentName}:${feature}`);
}

/**
 * Track component render for telemetry
 */
export function trackComponent(componentName: string): void {
  trackComponentRender(componentName);
}

// ==================== MANIFEST-DRIVEN COMPONENTS ====================

export const DesignSystemComponents = {
  Button: {
    getConfig: () => getComponentConfig('Button'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Button', feature),
    track: () => trackComponent('Button')
  },
  Input: {
    getConfig: () => getComponentConfig('Input'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Input', feature),
    track: () => trackComponent('Input')
  },
  Card: {
    getConfig: () => getComponentConfig('Card'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Card', feature),
    track: () => trackComponent('Card')
  },
  Modal: {
    getConfig: () => getComponentConfig('Modal'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Modal', feature),
    track: () => trackComponent('Modal')
  },
  Table: {
    getConfig: () => getComponentConfig('Table'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Table', feature),
    track: () => trackComponent('Table')
  },
  Form: {
    getConfig: () => getComponentConfig('Form'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Form', feature),
    track: () => trackComponent('Form')
  },
  Navigation: {
    getConfig: () => getComponentConfig('Navigation'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Navigation', feature),
    track: () => trackComponent('Navigation')
  },
  Feedback: {
    getConfig: () => getComponentConfig('Feedback'),
    isFeatureEnabled: (feature: string) => isComponentFeatureEnabled('Feedback', feature),
    track: () => trackComponent('Feedback')
  }
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get all available component names
 */
export function getAvailableComponents(): string[] {
  if (!isEnabled('shared:components')) {
    return [];
  }

  const config = getConfig('shared:components', 'components');
  return Object.keys(config || {});
}

/**
 * Get all enabled components
 */
export function getEnabledComponents(): string[] {
  if (!isEnabled('shared:components')) {
    return [];
  }

  const config = getConfig('shared:components', 'components');
  return Object.entries(config || {})
    .filter(([_, componentConfig]) => componentConfig && typeof componentConfig === 'object' && 'enabled' in componentConfig && componentConfig.enabled)
    .map(([name, _]) => name);
}

/**
 * Get component variants
 */
export function getComponentVariants(componentName: string): string[] {
  const config = getComponentConfig(componentName);
  return config?.variants || [];
}

/**
 * Get component sizes
 */
export function getComponentSizes(componentName: string): string[] {
  const config = getComponentConfig(componentName);
  return config?.sizes || [];
}

/**
 * Get component features
 */
export function getComponentFeatures(componentName: string): Record<string, boolean> {
  const config = getComponentConfig(componentName);
  return config?.features || {};
}
