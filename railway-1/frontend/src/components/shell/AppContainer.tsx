import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES & INTERFACES ====================

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  category: 'development' | 'productivity' | 'communication' | 'entertainment' | 'system';
  features: string[];
  backendIntegration?: {
    api: string;
    websocket?: string;
    realtime?: boolean;
  };
}

export interface AppInstance {
  id: string;
  appId: string;
  windowId: string;
  data: any;
  state: 'loading' | 'ready' | 'error' | 'saving';
  lastSaved: Date;
  metadata: Record<string, any>;
}

export interface AppMessage {
  type: 'data' | 'command' | 'event' | 'ai-suggestion';
  from: string;
  to: string;
  payload: any;
  timestamp: Date;
}

export interface AppContainerProps {
  appId: string;
  windowId: string;
  onAppReady?: (instance: AppInstance) => void;
  onAppError?: (error: Error) => void;
  onAppMessage?: (message: AppMessage) => void;
  className?: string;
}

// ==================== APP REGISTRY ====================

class AppRegistry {
  private static instance: AppRegistry;
  private apps: Map<string, AppConfig> = new Map();
  private instances: Map<string, AppInstance> = new Map();

  static getInstance(): AppRegistry {
    if (!AppRegistry.instance) {
      AppRegistry.instance = new AppRegistry();
    }
    return AppRegistry.instance;
  }

  registerApp(config: AppConfig): void {
    this.apps.set(config.id, config);
  }

  getApp(appId: string): AppConfig | undefined {
    return this.apps.get(appId);
  }

  getAllApps(): AppConfig[] {
    return Array.from(this.apps.values());
  }

  createInstance(appId: string, windowId: string, data?: any): AppInstance {
    const app = this.getApp(appId);
    if (!app) {
      throw new Error(`App ${appId} not found`);
    }

    const instance: AppInstance = {
      id: `${appId}-${windowId}-${Date.now()}`,
      appId,
      windowId,
      data: data || {},
      state: 'loading',
      lastSaved: new Date(),
      metadata: {}
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  getInstance(instanceId: string): AppInstance | undefined {
    return this.instances.get(instanceId);
  }

  updateInstance(instanceId: string, updates: Partial<AppInstance>): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      Object.assign(instance, updates);
    }
  }

  removeInstance(instanceId: string): void {
    this.instances.delete(instanceId);
  }
}

// ==================== BACKEND INTEGRATION ====================

class BackendIntegration {
  private static instance: BackendIntegration;
  private websocket: WebSocket | null = null;
  private messageHandlers: Map<string, (message: AppMessage) => void> = new Map();

  static getInstance(): BackendIntegration {
    if (!BackendIntegration.instance) {
      BackendIntegration.instance = new BackendIntegration();
    }
    return BackendIntegration.instance;
  }

  async connect(): Promise<void> {
    if (this.websocket?.readyState === WebSocket.OPEN) return;

    return new Promise((resolve, reject) => {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('🔌 Backend WebSocket connected');
        resolve();
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: AppMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };
    });
  }

  private handleMessage(message: AppMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  registerMessageHandler(type: string, handler: (message: AppMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  async sendMessage(message: AppMessage): Promise<void> {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, message queued');
      // Queue message for when connection is restored
    }
  }

  async callAPI(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API call failed for ${endpoint}:`, error);
      throw error;
    }
  }
}

// ==================== CONTEXT ====================

interface AppContainerContextType {
  instance: AppInstance;
  app: AppConfig;
  backend: BackendIntegration;
  sendMessage: (message: Omit<AppMessage, 'from' | 'timestamp'>) => void;
  saveData: (data: any) => Promise<void>;
  loadData: () => Promise<any>;
}

const AppContainerContext = createContext<AppContainerContextType | null>(null);

export const useAppContainer = () => {
  const context = useContext(AppContainerContext);
  if (!context) {
    throw new Error('useAppContainer must be used within an AppContainer');
  }
  return context;
};

// ==================== MAIN COMPONENT ====================

const AppContainer: React.FC<AppContainerProps> = ({
  appId,
  windowId,
  onAppReady,
  onAppError,
  onAppMessage,
  className = ''
}) => {
  const [instance, setInstance] = useState<AppInstance | null>(null);
  const [app, setApp] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const backend = BackendIntegration.getInstance();
  const registry = AppRegistry.getInstance();

  // Initialize app instance
  useEffect(() => {
    try {
      const appConfig = registry.getApp(appId);
      if (!appConfig) {
        throw new Error(`App ${appId} not found in registry`);
      }

      const appInstance = registry.createInstance(appId, windowId);

      setApp(appConfig);
      setInstance(appInstance);

      // Connect to backend if app has backend integration
      if (appConfig.backendIntegration) {
        backend.connect().catch(console.error);
      }

      // Mark as ready
      registry.updateInstance(appInstance.id, { state: 'ready' });
      onAppReady?.(appInstance);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onAppError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [appId, windowId, onAppReady, onAppError]);

  // Message handling
  useEffect(() => {
    const handleMessage = (message: AppMessage) => {
      if (message.to === windowId || message.to === 'all') {
        onAppMessage?.(message);
      }
    };

    backend.registerMessageHandler('data', handleMessage);
    backend.registerMessageHandler('command', handleMessage);
    backend.registerMessageHandler('event', handleMessage);
    backend.registerMessageHandler('ai-suggestion', handleMessage);

    return () => {
      // Cleanup message handlers
    };
  }, [windowId, onAppMessage]);

  // Context value
  const contextValue: AppContainerContextType | null = instance && app ? {
    instance,
    app,
    backend,
    sendMessage: (messageData) => {
      const message: AppMessage = {
        ...messageData,
        from: windowId,
        timestamp: new Date()
      };
      backend.sendMessage(message);
    },
    saveData: async (data) => {
      if (!instance) return;

      try {
        registry.updateInstance(instance.id, {
          state: 'saving',
          data,
          lastSaved: new Date()
        });

        if (app.backendIntegration?.api) {
          await backend.callAPI(app.backendIntegration.api, 'POST', data);
        }

        registry.updateInstance(instance.id, { state: 'ready' });
      } catch (error) {
        registry.updateInstance(instance.id, { state: 'error' });
        throw error;
      }
    },
    loadData: async () => {
      if (!app.backendIntegration?.api) return instance?.data || {};

      try {
        const data = await backend.callAPI(app.backendIntegration.api);
        registry.updateInstance(instance.id, { data });
        return data;
      } catch (error) {
        console.error('Failed to load data:', error);
        return instance?.data || {};
      }
    }
  } : null;

  // Render loading state
  if (isLoading) {
    return (
      <motion.div
        className={`w-full h-full flex items-center justify-center bg-slate-900 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">{app?.icon || '📱'}</div>
          <div className="text-white/70 text-lg">{app?.name || 'Loading App...'}</div>
          <div className="mt-4">
            <motion.div
              className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Render error state
  if (error) {
    return (
      <motion.div
        className={`w-full h-full flex items-center justify-center bg-red-900/20 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-red-400 text-lg mb-2">App Error</div>
          <div className="text-red-300 text-sm">{error.message}</div>
        </div>
      </motion.div>
    );
  }

  // Render app
  if (!contextValue || !app?.component) {
    return null;
  }

  const AppComponent = app.component;

  return (
    <AppContainerContext.Provider value={contextValue}>
      <motion.div
        className={`w-full h-full bg-transparent ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AppComponent />
      </motion.div>
    </AppContainerContext.Provider>
  );
};

// ==================== EXPORTS ====================

export { AppRegistry, BackendIntegration };
export default AppContainer;
