/**
 * 🧠 AI-BOS Manifestor React Hooks
 * Manifest-driven component integration
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Manifestor, Manifest, User } from '@/lib/manifestor';

// ==================== CORE MANIFESTOR HOOKS ====================

/**
 * Main Manifestor hook for component integration
 */
export function useManifestor() {
  const [manifestor] = useState(() => Manifestor);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const healthStatus = await manifestor.healthCheck();
      setHealth(healthStatus);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [manifestor]);

  const registerModule = useCallback((manifest: Manifest) => {
    manifestor.register(manifest);
  }, [manifestor]);

  const getTelemetry = useCallback(() => {
    return manifestor.getTelemetry();
  }, [manifestor]);

  const clearCache = useCallback(() => {
    manifestor.clearCache();
  }, [manifestor]);

  return {
    manifestor,
    health,
    registerModule,
    getTelemetry,
    clearCache,
    isHealthy: health?.status === 'healthy'
  };
}

/**
 * Permission checking hook
 */
export function usePermission(resource: string, action: string, user: User) {
  const { manifestor } = useManifestor();

  return useMemo(() => {
    return manifestor.can(resource, action, user);
  }, [manifestor, resource, action, user]);
}

/**
 * Module configuration hook
 */
export function useModuleConfig(moduleId: string) {
  const { manifestor } = useManifestor();

  return useMemo(() => {
    return manifestor.getConfig(moduleId);
  }, [manifestor, moduleId]);
}

/**
 * Module enabled status hook
 */
export function useModuleEnabled(moduleId: string) {
  const { manifestor } = useManifestor();

  return useMemo(() => {
    return manifestor.isEnabled(moduleId);
  }, [manifestor, moduleId]);
}

// ==================== SPECIALIZED MANIFESTOR HOOKS ====================

/**
 * AI module configuration hook
 */
export function useAIModuleConfig() {
  const aiConfig = useModuleConfig('ai-engine');
  const consciousnessConfig = useModuleConfig('consciousness');

  return useMemo(() => ({
    ai: aiConfig,
    consciousness: consciousnessConfig,
    isAIEnabled: useModuleEnabled('ai-engine'),
    isConsciousnessEnabled: useModuleEnabled('consciousness'),
    features: {
      ...aiConfig.features,
      ...consciousnessConfig.features
    }
  }), [aiConfig, consciousnessConfig]);
}

/**
 * Security module configuration hook
 */
export function useSecurityModuleConfig() {
  const securityConfig = useModuleConfig('security');
  const advancedSecurityConfig = useModuleConfig('security-advanced');

  return useMemo(() => ({
    security: securityConfig,
    advancedSecurity: advancedSecurityConfig,
    isSecurityEnabled: useModuleEnabled('security'),
    isAdvancedSecurityEnabled: useModuleEnabled('security-advanced'),
    policies: {
      ...securityConfig.policies,
      ...advancedSecurityConfig.policies
    }
  }), [securityConfig, advancedSecurityConfig]);
}

/**
 * Performance module configuration hook
 */
export function usePerformanceModuleConfig() {
  const performanceConfig = useModuleConfig('performance');
  const analyticsConfig = useModuleConfig('analytics');

  return useMemo(() => ({
    performance: performanceConfig,
    analytics: analyticsConfig,
    isPerformanceEnabled: useModuleEnabled('performance'),
    isAnalyticsEnabled: useModuleEnabled('analytics'),
    metrics: {
      ...performanceConfig.metrics,
      ...analyticsConfig.metrics
    }
  }), [performanceConfig, analyticsConfig]);
}

/**
 * Collaboration module configuration hook
 */
export function useCollaborationModuleConfig() {
  const collaborationConfig = useModuleConfig('collaboration');
  const advancedCollaborationConfig = useModuleConfig('collaboration-advanced');

  return useMemo(() => ({
    collaboration: collaborationConfig,
    advancedCollaboration: advancedCollaborationConfig,
    isCollaborationEnabled: useModuleEnabled('collaboration'),
    isAdvancedCollaborationEnabled: useModuleEnabled('collaboration-advanced'),
    features: {
      ...collaborationConfig.features,
      ...advancedCollaborationConfig.features
    }
  }), [collaborationConfig, advancedCollaborationConfig]);
}

/**
 * Real-time module configuration hook
 */
export function useRealtimeModuleConfig() {
  const realtimeConfig = useModuleConfig('realtime');
  const websocketConfig = useModuleConfig('websocket');

  return useMemo(() => ({
    realtime: realtimeConfig,
    websocket: websocketConfig,
    isRealtimeEnabled: useModuleEnabled('realtime'),
    isWebSocketEnabled: useModuleEnabled('websocket'),
    events: {
      ...realtimeConfig.events,
      ...websocketConfig.events
    }
  }), [realtimeConfig, websocketConfig]);
}

/**
 * Billing module configuration hook
 */
export function useBillingModuleConfig() {
  const billingConfig = useModuleConfig('billing');

  return useMemo(() => ({
    billing: billingConfig,
    isBillingEnabled: useModuleEnabled('billing'),
    plans: billingConfig.plans || [],
    features: billingConfig.features || {},
    limits: billingConfig.limits || {}
  }), [billingConfig]);
}

/**
 * User management module configuration hook
 */
export function useUserManagementModuleConfig() {
  const userConfig = useModuleConfig('user-management');
  const teamConfig = useModuleConfig('team-management');

  return useMemo(() => ({
    userManagement: userConfig,
    teamManagement: teamConfig,
    isUserManagementEnabled: useModuleEnabled('user-management'),
    isTeamManagementEnabled: useModuleEnabled('team-management'),
    roles: {
      ...userConfig.roles,
      ...teamConfig.roles
    },
    permissions: {
      ...userConfig.permissions,
      ...teamConfig.permissions
    }
  }), [userConfig, teamConfig]);
}

/**
 * Workflow automation module configuration hook
 */
export function useWorkflowAutomationModuleConfig() {
  const workflowConfig = useModuleConfig('workflow-automation');

  return useMemo(() => ({
    workflowAutomation: workflowConfig,
    isWorkflowAutomationEnabled: useModuleEnabled('workflow-automation'),
    templates: workflowConfig.templates || [],
    triggers: workflowConfig.triggers || {},
    actions: workflowConfig.actions || {}
  }), [workflowConfig]);
}

/**
 * Monitoring module configuration hook
 */
export function useMonitoringModuleConfig() {
  const monitoringConfig = useModuleConfig('monitoring');

  return useMemo(() => ({
    monitoring: monitoringConfig,
    isMonitoringEnabled: useModuleEnabled('monitoring'),
    alerts: monitoringConfig.alerts || {},
    metrics: monitoringConfig.metrics || {},
    thresholds: monitoringConfig.thresholds || {}
  }), [monitoringConfig]);
}

// ==================== UTILITY MANIFESTOR HOOKS ====================

/**
 * Feature flag hook based on manifest configuration
 */
export function useFeatureFlag(feature: string, moduleId: string = 'ai-bos-core') {
  const config = useModuleConfig(moduleId);

  return useMemo(() => {
    return config.features?.[feature] || false;
  }, [config.features, feature]);
}

/**
 * Environment-specific configuration hook
 */
export function useEnvironmentConfig() {
  const coreConfig = useModuleConfig('ai-bos-core');

  return useMemo(() => ({
    environment: coreConfig.environment || 'development',
    isDevelopment: coreConfig.environment === 'development',
    isProduction: coreConfig.environment === 'production',
    isStaging: coreConfig.environment === 'staging',
    version: coreConfig.version || '1.0.0',
    appName: coreConfig.appName || 'AI-BOS'
  }), [coreConfig]);
}

/**
 * Performance configuration hook
 */
export function usePerformanceConfig() {
  const coreConfig = useModuleConfig('ai-bos-core');

  return useMemo(() => ({
    enableTelemetry: coreConfig.performance?.enableTelemetry || false,
    enableCaching: coreConfig.performance?.enableCaching || true,
    enableCompression: coreConfig.performance?.enableCompression || true,
    cacheTTL: coreConfig.performance?.cacheTTL || 300000,
    maxCacheSize: coreConfig.performance?.maxCacheSize || 1000
  }), [coreConfig.performance]);
}

/**
 * Security configuration hook
 */
export function useSecurityConfig() {
  const coreConfig = useModuleConfig('ai-bos-core');

  return useMemo(() => ({
    enableCSP: coreConfig.security?.enableCSP || true,
    enableHSTS: coreConfig.security?.enableHSTS || true,
    sessionTimeout: coreConfig.security?.sessionTimeout || 3600,
    maxLoginAttempts: coreConfig.security?.maxLoginAttempts || 5,
    passwordPolicy: coreConfig.security?.passwordPolicy || {}
  }), [coreConfig.security]);
}

/**
 * Theme configuration hook
 */
export function useThemeConfig() {
  const coreConfig = useModuleConfig('ai-bos-core');

  return useMemo(() => ({
    theme: coreConfig.theme || 'light',
    isDarkMode: coreConfig.theme === 'dark',
    isLightMode: coreConfig.theme === 'light',
    isAutoMode: coreConfig.theme === 'auto',
    colors: coreConfig.colors || {},
    fonts: coreConfig.fonts || {}
  }), [coreConfig.theme, coreConfig.colors, coreConfig.fonts]);
}

// ==================== MANIFESTOR CONTEXT HOOKS ====================

/**
 * Manifestor context hook for component tree
 */
export function useManifestorContext() {
  const { manifestor, health, isHealthy } = useManifestor();
  const envConfig = useEnvironmentConfig();
  const perfConfig = usePerformanceConfig();
  const securityConfig = useSecurityConfig();
  const themeConfig = useThemeConfig();

  return useMemo(() => ({
    manifestor,
    health,
    isHealthy,
    environment: envConfig,
    performance: perfConfig,
    security: securityConfig,
    theme: themeConfig,
    isReady: isHealthy && manifestor !== null
  }), [manifestor, health, isHealthy, envConfig, perfConfig, securityConfig, themeConfig]);
}

/**
 * Component-specific manifestor hook
 */
export function useComponentManifestor(componentId: string) {
  const { manifestor, isHealthy } = useManifestor();
  const config = useModuleConfig(componentId);
  const isEnabled = useModuleEnabled(componentId);

  return useMemo(() => ({
    config,
    isEnabled,
    isHealthy,
    manifestor,
    canRender: isEnabled && isHealthy,
    getConfig: (key: string) => config[key],
    hasFeature: (feature: string) => config.features?.[feature] ?? false
  }), [config, isEnabled, isHealthy, manifestor]);
}
