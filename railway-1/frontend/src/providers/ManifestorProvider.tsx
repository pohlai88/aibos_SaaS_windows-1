/**
 * 🧠 AI-BOS Manifestor Provider
 * Provides manifest-driven functionality to the entire application
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ManifestorEngine, Manifest, User, Manifestor } from '@/lib/manifestor';
import { loadManifests, getManifestLoader, ManifestLoader } from '@/lib/manifestor/loader';

// ==================== MANIFESTOR CONTEXT ====================

interface ManifestorContextType {
  // Core manifestor functionality
  manifestor: ManifestorEngine | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;

  // Health and status
  health: any;
  isHealthy: boolean;

  // User context
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Manifest operations
  getConfig: (moduleId: string) => Record<string, any>;
  isEnabled: (moduleId: string) => boolean;
  can: (resource: string, action: string, user?: User) => boolean;

  // Utility functions
  reloadManifests: () => Promise<void>;
  getLoadedManifests: () => string[];
  getLoadErrors: () => Array<{ manifest: string; error: string }>;

  // Feature flags
  hasFeature: (feature: string, moduleId?: string) => boolean;
  getFeatureConfig: (feature: string, moduleId?: string) => any;

  // Environment
  environment: {
    isDevelopment: boolean;
    isProduction: boolean;
    isStaging: boolean;
    version: string;
    appName: string;
  };

  // Performance
  performance: {
    enableTelemetry: boolean;
    enableCaching: boolean;
    enableCompression: boolean;
    cacheTTL: number;
    maxCacheSize: number;
  };

  // Security
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: Record<string, any>;
  };

  // Theme
  theme: {
    theme: string;
    isDarkMode: boolean;
    isLightMode: boolean;
    isAutoMode: boolean;
    colors: Record<string, any>;
    fonts: Record<string, any>;
  };
}

const ManifestorContext = createContext<ManifestorContextType | null>(null);

// ==================== MANIFESTOR PROVIDER ====================

interface ManifestorProviderProps {
  children: ReactNode;
  initialUser?: User;
}

export function ManifestorProvider({ children, initialUser }: ManifestorProviderProps) {
  const [manifestor, setManifestor] = useState<ManifestorEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || null);
  const [loader, setLoader] = useState<ManifestLoader | null>(null);

  // Initialize manifestor
  useEffect(() => {
    async function initializeManifestor() {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Manifestor Engine
        const manifestorInstance = Manifestor;
        setManifestor(manifestorInstance);

        // Load all manifests
        await loadManifests();

        // Get loader instance
        const loaderInstance = getManifestLoader();
        setLoader(loaderInstance);

        // Perform initial health check
        const healthStatus = await manifestorInstance.healthCheck();
        setHealth(healthStatus);

        setIsReady(true);
        console.log('🧠 Manifestor Provider initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Manifestor';
        setError(errorMessage);
        console.error('❌ Manifestor Provider initialization failed:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    initializeManifestor();
  }, []);

  // Health check interval
  useEffect(() => {
    if (!manifestor || !isReady) return;

    const healthCheckInterval = setInterval(async () => {
      try {
        const healthStatus = await manifestor.healthCheck();
        setHealth(healthStatus);
      } catch (err) {
        console.warn('⚠️ Health check failed:', err);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [manifestor, isReady]);

  // Context value
  const contextValue: ManifestorContextType = {
    // Core manifestor functionality
    manifestor,
    isReady,
    isLoading,
    error,

    // Health and status
    health,
    isHealthy: health?.status === 'healthy',

    // User context
    currentUser,
    setCurrentUser,

    // Manifest operations
    getConfig: (moduleId: string) => manifestor?.getConfig(moduleId) || {},
    isEnabled: (moduleId: string) => manifestor?.isEnabled(moduleId) || false,
    can: (resource: string, action: string, user?: User) => {
      const targetUser = user || currentUser;
      if (!targetUser || !manifestor) return false;
      return manifestor.can(resource, action, targetUser);
    },

    // Utility functions
    reloadManifests: async () => {
      if (!loader) return;
      try {
        await loader.reloadManifests();
        const healthStatus = await manifestor?.healthCheck();
        setHealth(healthStatus);
      } catch (err) {
        console.error('❌ Failed to reload manifests:', err);
      }
    },
    getLoadedManifests: () => loader?.getLoadedManifests() || [],
    getLoadErrors: () => loader?.getLoadErrors() || [],

    // Feature flags
    hasFeature: (feature: string, moduleId: string = 'ai-bos-core') => {
      const config = manifestor?.getConfig(moduleId);
      return config?.features?.[feature] || false;
    },
    getFeatureConfig: (feature: string, moduleId: string = 'ai-bos-core') => {
      const config = manifestor?.getConfig(moduleId);
      return config?.features?.[feature] || null;
    },

    // Environment
    environment: {
      isDevelopment: manifestor?.getConfig('ai-bos-core')?.environment === 'development',
      isProduction: manifestor?.getConfig('ai-bos-core')?.environment === 'production',
      isStaging: manifestor?.getConfig('ai-bos-core')?.environment === 'staging',
      version: manifestor?.getConfig('ai-bos-core')?.version || '1.0.0',
      appName: manifestor?.getConfig('ai-bos-core')?.appName || 'AI-BOS'
    },

    // Performance
    performance: {
      enableTelemetry: manifestor?.getConfig('ai-bos-core')?.performance?.enableTelemetry || false,
      enableCaching: manifestor?.getConfig('ai-bos-core')?.performance?.enableCaching || true,
      enableCompression: manifestor?.getConfig('ai-bos-core')?.performance?.enableCompression || true,
      cacheTTL: manifestor?.getConfig('ai-bos-core')?.performance?.cacheTTL || 300000,
      maxCacheSize: manifestor?.getConfig('ai-bos-core')?.performance?.maxCacheSize || 1000
    },

    // Security
    security: {
      enableCSP: manifestor?.getConfig('ai-bos-core')?.security?.enableCSP || true,
      enableHSTS: manifestor?.getConfig('ai-bos-core')?.security?.enableHSTS || true,
      sessionTimeout: manifestor?.getConfig('ai-bos-core')?.security?.sessionTimeout || 3600,
      maxLoginAttempts: manifestor?.getConfig('ai-bos-core')?.security?.maxLoginAttempts || 5,
      passwordPolicy: manifestor?.getConfig('ai-bos-core')?.security?.passwordPolicy || {}
    },

    // Theme
    theme: {
      theme: manifestor?.getConfig('ai-bos-core')?.theme || 'light',
      isDarkMode: manifestor?.getConfig('ai-bos-core')?.theme === 'dark',
      isLightMode: manifestor?.getConfig('ai-bos-core')?.theme === 'light',
      isAutoMode: manifestor?.getConfig('ai-bos-core')?.theme === 'auto',
      colors: manifestor?.getConfig('ai-bos-core')?.colors || {},
      fonts: manifestor?.getConfig('ai-bos-core')?.fonts || {}
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Initializing AI-BOS</h2>
          <p className="text-blue-200">Loading manifest-driven architecture...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-800">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-200 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Initialization Failed</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ManifestorContext.Provider value={contextValue}>
      {children}
    </ManifestorContext.Provider>
  );
}

// ==================== MANIFESTOR HOOK ====================

export function useManifestorContext(): ManifestorContextType {
  const context = useContext(ManifestorContext);
  if (!context) {
    throw new Error('useManifestorContext must be used within a ManifestorProvider');
  }
  return context;
}

// ==================== MANIFESTOR GUARD ====================

interface ManifestorGuardProps {
  children: ReactNode;
  requiredFeature?: string;
  requiredModule?: string;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export function ManifestorGuard({
  children,
  requiredFeature,
  requiredModule,
  requiredPermission,
  fallback
}: ManifestorGuardProps) {
  const {
    isReady,
    hasFeature,
    isEnabled,
    can,
    currentUser
  } = useManifestorContext();

  // Check if manifestor is ready
  if (!isReady) {
    return fallback || <div>Loading...</div>;
  }

  // Check required feature
  if (requiredFeature && !hasFeature(requiredFeature, requiredModule)) {
    return fallback || <div>Feature not available</div>;
  }

  // Check required module
  if (requiredModule && !isEnabled(requiredModule)) {
    return fallback || <div>Module not enabled</div>;
  }

  // Check required permission
  if (requiredPermission && currentUser) {
    const [resource, action] = requiredPermission.split(':');
    if (resource && action && !can(resource, action, currentUser)) {
      return fallback || <div>Access denied</div>;
    }
  }

  return <>{children}</>;
}

// ==================== MANIFESTOR STATUS ====================

export function ManifestorStatus() {
  const {
    isReady,
    isHealthy,
    health,
    getLoadedManifests,
    getLoadErrors,
    environment
  } = useManifestorContext();

  if (!isReady) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Manifestor Status:</strong> Initializing...
      </div>
    );
  }

  const loadedManifests = getLoadedManifests();
  const loadErrors = getLoadErrors();

  return (
    <div className={`border rounded p-4 ${isHealthy ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
      <h3 className="font-semibold mb-2">Manifestor Status</h3>
      <div className="space-y-1 text-sm">
        <div><strong>Status:</strong> {isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</div>
        <div><strong>Environment:</strong> {environment.isProduction ? 'Production' : environment.isStaging ? 'Staging' : 'Development'}</div>
        <div><strong>Version:</strong> {environment.version}</div>
        <div><strong>Loaded Manifests:</strong> {loadedManifests.length}</div>
        {loadErrors.length > 0 && (
          <div><strong>Load Errors:</strong> {loadErrors.length}</div>
        )}
        {health && (
          <div><strong>Last Health Check:</strong> {new Date(health.timestamp).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  );
}
