'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppManifest, manifestLoader } from './ManifestLoader';

// ==================== TYPES ====================
interface AppContainerProps {
  manifest: AppManifest;
  onMount?: () => void;
  onError?: (error: string) => void;
  onDestroy?: () => void;
  className?: string;
  style?: React.CSSProperties;
  options?: {
    timeout?: number; // Timeout in milliseconds
    strictCSP?: boolean; // Enable strict Content Security Policy
    enableDevtools?: boolean; // Enable developer tools
    trustedOrigins?: string[]; // Trusted origins for postMessage
  };
}

interface AppRuntimeContext {
  appId: string;
  manifest: AppManifest;
  permissions: string[];
  theme: 'light' | 'dark' | 'auto';
  user: {
    id: string;
    name: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  api: {
    call: (endpoint: string, options?: any) => Promise<any>;
    notify: (message: string, type?: 'success' | 'error' | 'warning') => void;
    navigate: (path: string) => void;
  };
  devtools?: {
    log: (message: string, level: 'info' | 'warn' | 'error') => void;
    metrics: {
      memoryUsage: number;
      loadTime: number;
      apiCalls: number;
    };
  };
}

interface AppContainerState {
  status: 'loading' | 'mounted' | 'error' | 'destroyed' | 'timeout';
  error?: string;
  loadTime?: number;
  memoryUsage?: number;
  timeoutId?: NodeJS.Timeout;
}

// ==================== GLOBAL RUNTIME BUS ====================
declare global {
  interface Window {
    AIBOS_EVENTBUS?: {
      publish: (event: string, data: any) => void;
      subscribe: (event: string, callback: (data: any) => void) => void;
      unsubscribe: (event: string, callback: (data: any) => void) => void;
    };
    __AIBOS_DEVTOOLS__?: {
      registerApp: (context: AppRuntimeContext) => void;
      unregisterApp: (appId: string) => void;
    };
  }
}

// Initialize global runtime bus
if (typeof window !== 'undefined' && !window.AIBOS_EVENTBUS) {
  const listeners = new Map<string, Set<(data: any) => void>>();

  window.AIBOS_EVENTBUS = {
    publish: (event: string, data: any) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(data));
      }
    },
    subscribe: (event: string, callback: (data: any) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);
    },
    unsubscribe: (event: string, callback: (data: any) => void) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    }
  };
}

// Initialize devtools
if (typeof window !== 'undefined' && !window.__AIBOS_DEVTOOLS__) {
  window.__AIBOS_DEVTOOLS__ = {
    registerApp: (context: AppRuntimeContext) => {
      console.log(`[AIBOS DevTools] App registered: ${context.appId}`, context);
    },
    unregisterApp: (appId: string) => {
      console.log(`[AIBOS DevTools] App unregistered: ${appId}`);
    }
  };
}

// ==================== APP CONTAINER COMPONENT ====================
export const AppContainer: React.FC<AppContainerProps> = ({
  manifest,
  onMount,
  onError,
  onDestroy,
  className = '',
  style = {},
  options = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<AppContainerState>({ status: 'loading' });
  const [runtimeContext, setRuntimeContext] = useState<AppRuntimeContext | null>(null);
  const [metrics, setMetrics] = useState({ memoryUsage: 0, apiCalls: 0 });

  // ==================== LIFECYCLE MANAGEMENT ====================

  /**
   * Initialize app container
   * Steve Jobs Philosophy: "It just works"
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setState(prev => ({ ...prev, status: 'loading' }));

        // Create runtime context
        const context = createRuntimeContext(manifest, options);
        setRuntimeContext(context);

        // Register with devtools
        if (options.enableDevtools) {
          window.__AIBOS_DEVTOOLS__?.registerApp(context);
        }

        // Validate permissions
        await validatePermissions(manifest.permissions);

        // Set timeout
        const timeoutId = setTimeout(() => {
          setState(prev => ({
            ...prev,
            status: 'timeout',
            error: 'App failed to load within timeout period'
          }));
          onError?.('App load timeout');
        }, options.timeout || 30000);

        setState(prev => ({ ...prev, timeoutId }));

        // Mount the app
        await mountApp(manifest, context);

        // Clear timeout on success
        clearTimeout(timeoutId);

        setState(prev => ({
          ...prev,
          status: 'mounted',
          loadTime: Date.now(),
          timeoutId: undefined
        }));

        // Publish event to global bus
        window.AIBOS_EVENTBUS?.publish('app.loaded', {
          appId: manifest.app_id,
          loadTime: Date.now(),
          manifest
        });

        onMount?.();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
          timeoutId: undefined
        }));
        onError?.(errorMessage);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      destroyApp();
    };
  }, [manifest.app_id]);

  // ==================== CORE METHODS ====================

  /**
   * Create runtime context for the app
   * Steve Jobs Philosophy: "Think different"
   */
  const createRuntimeContext = (manifest: AppManifest, options: AppContainerProps['options']): AppRuntimeContext => {
    return {
      appId: manifest.app_id,
      manifest,
      permissions: manifest.permissions,
      theme: manifest.theme || 'auto',
      user: {
        id: 'current-user-id',
        name: 'Current User',
        role: 'user'
      },
      tenant: {
        id: 'current-tenant-id',
        name: 'Current Tenant'
      },
      api: {
        call: async (endpoint: string, apiOptions?: any) => {
          // Track API calls for metrics
          setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
          return await secureApiCall(endpoint, apiOptions, manifest.permissions, options?.trustedOrigins);
        },
        notify: (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
          // Implement notification system
          console.log(`[${manifest.app_id}] ${type}: ${message}`);
        },
        navigate: (path: string) => {
          // Implement navigation
          console.log(`[${manifest.app_id}] Navigate to: ${path}`);
        }
      },
      devtools: options?.enableDevtools ? {
        log: (message: string, level: 'info' | 'warn' | 'error') => {
          console.log(`[${manifest.app_id}] ${level}: ${message}`);
        },
        metrics: {
          memoryUsage: metrics.memoryUsage,
          loadTime: state.loadTime || 0,
          apiCalls: metrics.apiCalls,
        }
      } : undefined
    };
  };

  /**
   * Validate app permissions
   * Steve Jobs Philosophy: "Security by design"
   */
  const validatePermissions = async (permissions: string[]): Promise<void> => {
    // In a real implementation, this would check against user permissions
    // For now, we'll simulate validation
    const hasPermission = (permission: string) => {
      // Simulate permission check
      return true;
    };

    const invalidPermissions = permissions.filter(p => !hasPermission(p));
    if (invalidPermissions.length > 0) {
      throw new Error(`Insufficient permissions: ${invalidPermissions.join(', ')}`);
    }
  };

  /**
   * Mount the app in the container
   * Steve Jobs Philosophy: "Make it simple, make it work"
   */
  const mountApp = async (manifest: AppManifest, context: AppRuntimeContext): Promise<void> => {
    if (!containerRef.current) {
      throw new Error('Container not ready');
    }

    // Create iframe for sandboxed execution
    if (manifest.security?.sandboxed !== false) {
      await mountSandboxedApp(manifest, context);
    } else {
      await mountDirectApp(manifest, context);
    }
  };

  /**
   * Mount app in sandboxed iframe with enhanced security
   * Steve Jobs Philosophy: "Safety first"
   */
  const mountSandboxedApp = async (manifest: AppManifest, context: AppRuntimeContext): Promise<void> => {
    if (!iframeRef.current) {
      throw new Error('Iframe not ready');
    }

    // Set up iframe with enhanced security restrictions
    const iframe = iframeRef.current;
    iframe.sandbox.add('allow-scripts', 'allow-same-origin');

    // Add Content Security Policy if strict mode is enabled
    if (options.strictCSP) {
      iframe.setAttribute('csp', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    }

    // Inject runtime context into iframe
    const iframeContent = generateIframeContent(manifest, context);
    iframe.srcdoc = iframeContent;

    // Set up message communication with origin validation
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      // Validate origin if trusted origins are specified
      if (options.trustedOrigins && options.trustedOrigins.length > 0) {
        if (!options.trustedOrigins.includes(event.origin)) {
          console.warn(`[AppContainer] Rejected message from untrusted origin: ${event.origin}`);
          return;
        }
      }

      const { type, payload } = event.data;
      handleAppMessage(type, payload, context);
    };

    window.addEventListener('message', handleMessage);
  };

  /**
   * Mount app directly in container with React.lazy
   * Steve Jobs Philosophy: "Performance matters"
   */
  const mountDirectApp = async (manifest: AppManifest, context: AppRuntimeContext): Promise<void> => {
    // For trusted apps, mount directly using React.lazy
    try {
      const LazyApp = React.lazy(() => loadAppComponent(manifest.entry));

      if (containerRef.current) {
        // This would be implemented with React rendering
        // For now, we'll show a placeholder
        console.log(`[AppContainer] Direct mount for trusted app: ${manifest.app_id}`);
      }
    } catch (error) {
      throw new Error(`Failed to load app component: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Destroy the app
   * Steve Jobs Philosophy: "Clean up after yourself"
   */
  const destroyApp = useCallback(() => {
    // Clear timeout if exists
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    setState(prev => ({ ...prev, status: 'destroyed' }));

    // Clean up resources
    if (iframeRef.current) {
      iframeRef.current.srcdoc = '';
    }

    // Unregister from devtools
    if (options.enableDevtools) {
      window.__AIBOS_DEVTOOLS__?.unregisterApp(manifest.app_id);
    }

    // Publish event to global bus
    window.AIBOS_EVENTBUS?.publish('app.destroyed', {
      appId: manifest.app_id,
      manifest
    });

    // Clear runtime context
    setRuntimeContext(null);

    onDestroy?.();
  }, [onDestroy, manifest.app_id, state.timeoutId, options.enableDevtools]);

  // ==================== UTILITY METHODS ====================

  /**
   * Generate iframe content for sandboxed apps with lifecycle support
   * Steve Jobs Philosophy: "Attention to detail"
   */
  const generateIframeContent = (manifest: AppManifest, context: AppRuntimeContext): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${manifest.name}</title>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            .app-container { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="app-root" class="app-container">
            <div id="loading">Loading ${manifest.name}...</div>
          </div>
          <script>
            // Inject runtime context
            window.AIBOS_RUNTIME = ${JSON.stringify(context)};

            // Set up message communication
            window.addEventListener('message', (event) => {
              // Handle incoming messages from parent
              if (event.data.type === 'invoke' && event.data.handler) {
                // Invoke lifecycle handlers
                if (typeof window[event.data.handler] === 'function') {
                  window[event.data.handler]();
                }
              }
            });

            // Load and render app
            loadApp('${manifest.entry}');

            function loadApp(entry) {
              // This would load the actual app component
              document.getElementById('loading').innerHTML = 'App loaded: ${manifest.name}';

              // Invoke onMount lifecycle handler if defined
              ${manifest.lifecycle?.onMount ? `if (typeof ${manifest.lifecycle.onMount} === 'function') { ${manifest.lifecycle.onMount}(); }` : ''}
            }

            // Error handler
            window.addEventListener('error', (event) => {
              window.parent.postMessage({
                type: 'error',
                payload: { message: event.error?.message || 'Unknown error' }
              }, '*');
            });
          </script>
        </body>
      </html>
    `;
  };

  /**
   * Handle messages from sandboxed app with enhanced security
   * Steve Jobs Philosophy: "Communication is key"
   */
  const handleAppMessage = (type: string, payload: any, context: AppRuntimeContext) => {
    switch (type) {
      case 'api_call':
        // Handle API calls
        break;
      case 'notification':
        // Handle notifications
        break;
      case 'navigation':
        // Handle navigation
        break;
      case 'error':
        // Handle errors
        setState(prev => ({ ...prev, status: 'error', error: payload.message }));
        break;
      case 'lifecycle':
        // Handle lifecycle events
        if (payload.handler && manifest.lifecycle?.[payload.handler as keyof typeof manifest.lifecycle]) {
          // Invoke lifecycle handler
          console.log(`[AppContainer] Invoking lifecycle handler: ${payload.handler}`);
        }
        break;
    }
  };

  /**
   * Load app component with React.lazy
   * Steve Jobs Philosophy: "Lazy loading for performance"
   */
  const loadAppComponent = async (entry: string): Promise<any> => {
    // This would dynamically import the app component using React.lazy
    // For now, return a placeholder
    return {
      default: () => React.createElement('div', { className: 'app-placeholder' }, 'App Component')
    };
  };

  /**
   * Secure API call with origin validation
   * Steve Jobs Philosophy: "Security by design"
   */
  const secureApiCall = async (endpoint: string, options: any, permissions: string[], trustedOrigins?: string[]): Promise<any> => {
    // Validate endpoint against trusted origins
    if (trustedOrigins && trustedOrigins.length > 0) {
      const url = new URL(endpoint, window.location.origin);
      if (!trustedOrigins.some(origin => url.origin === origin)) {
        throw new Error(`API call to untrusted origin: ${url.origin}`);
      }
    }

    // Implement secure API calls with permission checking
    return { success: true, data: {} };
  };

  // ==================== RENDER ====================

  return (
    <motion.div
      ref={containerRef}
      className={`app-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loading State */}
      <AnimatePresence>
        {state.status === 'loading' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Loading {manifest.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">Preparing your app...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {state.status === 'error' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">
                App Error
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {state.error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeout State */}
      <AnimatePresence>
        {state.status === 'timeout' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                Load Timeout
              </h3>
              <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                App took too long to load. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Content */}
      {state.status === 'mounted' && (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title={manifest.name}
          sandbox="allow-scripts allow-same-origin"
        />
      )}

      {/* App Info Overlay */}
      {state.status === 'mounted' && (
        <motion.div
          className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="font-medium">{manifest.name}</span>
            <span className="text-gray-500">v{manifest.version}</span>
          </div>
          {state.loadTime && (
            <div className="text-gray-500 mt-1">
              Loaded in {state.loadTime}ms
            </div>
          )}
          {options.enableDevtools && (
            <div className="text-gray-500 mt-1">
              API calls: {metrics.apiCalls}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== HOOK FOR APP RUNTIME ====================
export const useAppRuntime = () => {
  const [context, setContext] = useState<AppRuntimeContext | null>(null);

  const initializeRuntime = useCallback((manifest: AppManifest, options?: AppContainerProps['options']) => {
    const runtimeContext = {
      appId: manifest.app_id,
      manifest,
      permissions: manifest.permissions,
      theme: manifest.theme || 'auto',
      user: {
        id: 'current-user-id',
        name: 'Current User',
        role: 'user'
      },
      tenant: {
        id: 'current-tenant-id',
        name: 'Current Tenant'
      },
      api: {
        call: async (endpoint: string, options?: any) => {
          // Implement secure API calls
          return { success: true, data: {} };
        },
        notify: (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
          console.log(`[${manifest.app_id}] ${type}: ${message}`);
        },
        navigate: (path: string) => {
          console.log(`[${manifest.app_id}] Navigate to: ${path}`);
        }
      },
      devtools: options?.enableDevtools ? {
        log: (message: string, level: 'info' | 'warn' | 'error') => {
          console.log(`[${manifest.app_id}] ${level}: ${message}`);
        },
        metrics: {
          memoryUsage: 0,
          loadTime: 0,
          apiCalls: 0,
        }
      } : undefined
    };
    setContext(runtimeContext);
    return runtimeContext;
  }, []);

  return { context, initializeRuntime };
};
