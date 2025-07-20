'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface AppState {
  id: string;
  windowId: string;
  tenantId: string;
  data: Record<string, any>;
  metadata: {
    lastAccessed: Date;
    created: Date;
    version: string;
  };
  permissions: string[];
  isActive: boolean;
}

interface WindowState {
  id: string;
  appId: string;
  tenantId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isActive: boolean;
  state: Record<string, any>;
}

interface TenantState {
  id: string;
  name: string;
  settings: Record<string, any>;
  permissions: string[];
  apps: string[];
  isActive: boolean;
  lastAccessed: Date;
}

interface GlobalState {
  tenants: Map<string, TenantState>;
  windows: Map<string, WindowState>;
  apps: Map<string, AppState>;
  activeTenantId: string | null;
  activeWindowId: string | null;
  globalSettings: Record<string, any>;
  cache: Map<string, { data: any; timestamp: number; ttl: number }>;
}

type StateAction =
  | { type: 'INITIALIZE_TENANT'; payload: TenantState }
  | { type: 'SET_ACTIVE_TENANT'; payload: string }
  | { type: 'CREATE_WINDOW'; payload: WindowState }
  | { type: 'UPDATE_WINDOW'; payload: Partial<WindowState> & { id: string } }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'SET_ACTIVE_WINDOW'; payload: string }
  | { type: 'CREATE_APP_STATE'; payload: AppState }
  | { type: 'UPDATE_APP_STATE'; payload: Partial<AppState> & { id: string } }
  | { type: 'REMOVE_APP_STATE'; payload: string }
  | { type: 'SET_GLOBAL_SETTING'; payload: { key: string; value: any } }
  | { type: 'CACHE_DATA'; payload: { key: string; data: any; ttl: number } }
  | { type: 'CLEAR_CACHE'; payload?: string }
  | { type: 'CLEANUP_INACTIVE'; payload?: void };

interface StateManagerContextType {
  state: GlobalState;
  // Tenant operations
  initializeTenant: (tenant: TenantState) => void;
  setActiveTenant: (tenantId: string) => void;
  getTenant: (tenantId: string) => TenantState | undefined;
  getActiveTenant: () => TenantState | undefined;

  // Window operations
  createWindow: (window: Omit<WindowState, 'id'>) => string;
  updateWindow: (windowId: string, updates: Partial<WindowState>) => void;
  closeWindow: (windowId: string) => void;
  setActiveWindow: (windowId: string) => void;
  getWindow: (windowId: string) => WindowState | undefined;
  getActiveWindow: () => WindowState | undefined;
  getWindowsByApp: (appId: string) => WindowState[];

  // App state operations
  createAppState: (app: Omit<AppState, 'id'>) => string;
  updateAppState: (appId: string, updates: Partial<AppState>) => void;
  removeAppState: (appId: string) => void;
  getAppState: (appId: string) => AppState | undefined;
  getAppStatesByWindow: (windowId: string) => AppState[];

  // Global operations
  setGlobalSetting: (key: string, value: any) => void;
  getGlobalSetting: (key: string) => any;

  // Cache operations
  cacheData: (key: string, data: any, ttl?: number) => void;
  getCachedData: (key: string) => any;
  clearCache: (key?: string) => void;

  // Utility operations
  cleanup: () => void;
  exportState: () => string;
  importState: (stateData: string) => void;
}

// ==================== REDUCER ====================
const stateReducer = (state: GlobalState, action: StateAction): GlobalState => {
  switch (action.type) {
    case 'INITIALIZE_TENANT': {
      const newTenants = new Map(state.tenants);
      newTenants.set(action.payload.id, action.payload);
      return {
        ...state,
        tenants: newTenants,
        activeTenantId: action.payload.id
      };
    }

    case 'SET_ACTIVE_TENANT': {
      return {
        ...state,
        activeTenantId: action.payload
      };
    }

    case 'CREATE_WINDOW': {
      const newWindows = new Map(state.windows);
      newWindows.set(action.payload.id, action.payload);

      // Update z-index for all windows
      const updatedWindows = new Map();
      Array.from(newWindows.entries()).forEach(([id, window]) => {
        updatedWindows.set(id, {
          ...window,
          zIndex: id === action.payload.id ?
            Math.max(...Array.from(newWindows.values()).map(w => w.zIndex)) + 1 :
            window.zIndex
        });
      });

      return {
        ...state,
        windows: updatedWindows,
        activeWindowId: action.payload.id
      };
    }

    case 'UPDATE_WINDOW': {
      const newWindows = new Map(state.windows);
      const existingWindow = newWindows.get(action.payload.id);
      if (existingWindow) {
        newWindows.set(action.payload.id, { ...existingWindow, ...action.payload });
      }
      return { ...state, windows: newWindows };
    }

    case 'CLOSE_WINDOW': {
      const newWindows = new Map(state.windows);
      newWindows.delete(action.payload);

      // Clean up associated app states
      const newApps = new Map(state.apps);
      Array.from(newApps.entries()).forEach(([appId, app]) => {
        if (app.windowId === action.payload) {
          newApps.delete(appId);
        }
      });

      // Set new active window if needed
      let newActiveWindowId = state.activeWindowId;
      if (state.activeWindowId === action.payload) {
        const remainingWindows = Array.from(newWindows.values())
          .sort((a, b) => b.zIndex - a.zIndex);
        newActiveWindowId = remainingWindows[0]?.id || null;
      }

      return {
        ...state,
        windows: newWindows,
        apps: newApps,
        activeWindowId: newActiveWindowId
      };
    }

    case 'SET_ACTIVE_WINDOW': {
      const newWindows = new Map(state.windows);
      const targetWindow = newWindows.get(action.payload);

      if (targetWindow) {
        // Update z-index for all windows
        Array.from(newWindows.entries()).forEach(([id, window]) => {
          newWindows.set(id, {
            ...window,
            zIndex: id === action.payload ?
              Math.max(...Array.from(newWindows.values()).map(w => w.zIndex)) + 1 :
              window.zIndex
          });
        });
      }

      return {
        ...state,
        windows: newWindows,
        activeWindowId: action.payload
      };
    }

    case 'CREATE_APP_STATE': {
      const newApps = new Map(state.apps);
      newApps.set(action.payload.id, action.payload);
      return { ...state, apps: newApps };
    }

    case 'UPDATE_APP_STATE': {
      const newApps = new Map(state.apps);
      const existingApp = newApps.get(action.payload.id);
      if (existingApp) {
        newApps.set(action.payload.id, {
          ...existingApp,
          ...action.payload,
          metadata: {
            ...existingApp.metadata,
            lastAccessed: new Date()
          }
        });
      }
      return { ...state, apps: newApps };
    }

    case 'REMOVE_APP_STATE': {
      const newApps = new Map(state.apps);
      newApps.delete(action.payload);
      return { ...state, apps: newApps };
    }

    case 'SET_GLOBAL_SETTING': {
      return {
        ...state,
        globalSettings: {
          ...state.globalSettings,
          [action.payload.key]: action.payload.value
        }
      };
    }

    case 'CACHE_DATA': {
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, {
        data: action.payload.data,
        timestamp: Date.now(),
        ttl: action.payload.ttl || 300000 // 5 minutes default
      });
      return { ...state, cache: newCache };
    }

    case 'CLEAR_CACHE': {
      if (action.payload) {
        const newCache = new Map(state.cache);
        newCache.delete(action.payload);
        return { ...state, cache: newCache };
      } else {
        return { ...state, cache: new Map() };
      }
    }

    case 'CLEANUP_INACTIVE': {
      const now = Date.now();

      // Clean up expired cache entries
      const newCache = new Map(state.cache);
      Array.from(newCache.entries()).forEach(([key, entry]) => {
        if (now - entry.timestamp > entry.ttl) {
          newCache.delete(key);
        }
      });

      // Clean up inactive app states
      const newApps = new Map(state.apps);
      Array.from(newApps.entries()).forEach(([appId, app]) => {
        const timeSinceAccess = now - app.metadata.lastAccessed.getTime();
        if (timeSinceAccess > 1800000) { // 30 minutes
          newApps.delete(appId);
        }
      });

      return { ...state, cache: newCache, apps: newApps };
    }

    default:
      return state;
  }
};

// ==================== CONTEXT ====================
const StateManagerContext = createContext<StateManagerContextType | undefined>(undefined);

export const useStateManager = () => {
  const context = useContext(StateManagerContext);
  if (!context) {
    throw new Error('useStateManager must be used within StateManagerProvider');
  }
  return context;
};

// ==================== PROVIDER ====================
interface StateManagerProviderProps {
  children: React.ReactNode;
  initialState?: Partial<GlobalState>;
}

export const StateManagerProvider: React.FC<StateManagerProviderProps> = ({
  children,
  initialState = {}
}) => {
  const { trackEvent } = useSystemCore();
  const cleanupInterval = useRef<NodeJS.Timeout>();

  const [state, dispatch] = useReducer(stateReducer, {
    tenants: new Map(),
    windows: new Map(),
    apps: new Map(),
    activeTenantId: null,
    activeWindowId: null,
    globalSettings: {},
    cache: new Map(),
    ...initialState
  });

  // Initialize cleanup interval
  useEffect(() => {
    cleanupInterval.current = setInterval(() => {
      dispatch({ type: 'CLEANUP_INACTIVE' });
    }, 60000); // Clean up every minute

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, []);

  // Tenant operations
  const initializeTenant = useCallback((tenant: TenantState) => {
    dispatch({ type: 'INITIALIZE_TENANT', payload: tenant });
    trackEvent('tenant_initialized', { tenantId: tenant.id });
  }, [trackEvent]);

  const setActiveTenant = useCallback((tenantId: string) => {
    dispatch({ type: 'SET_ACTIVE_TENANT', payload: tenantId });
    trackEvent('active_tenant_changed', { tenantId });
  }, [trackEvent]);

  const getTenant = useCallback((tenantId: string) => {
    return state.tenants.get(tenantId);
  }, [state.tenants]);

  const getActiveTenant = useCallback(() => {
    return state.activeTenantId ? state.tenants.get(state.activeTenantId) : undefined;
  }, [state.activeTenantId, state.tenants]);

  // Window operations
  const createWindow = useCallback((window: Omit<WindowState, 'id'>) => {
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newWindow: WindowState = {
      ...window,
      id: windowId,
      zIndex: Math.max(...Array.from(state.windows.values()).map(w => w.zIndex), 0) + 1
    };

    dispatch({ type: 'CREATE_WINDOW', payload: newWindow });
    trackEvent('window_created', { windowId, appId: window.appId });

    return windowId;
  }, [state.windows, trackEvent]);

  const updateWindow = useCallback((windowId: string, updates: Partial<WindowState>) => {
    dispatch({ type: 'UPDATE_WINDOW', payload: { id: windowId, ...updates } });
    trackEvent('window_updated', { windowId, updates: Object.keys(updates) });
  }, [trackEvent]);

  const closeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: windowId });
    trackEvent('window_closed', { windowId });
  }, [trackEvent]);

  const setActiveWindow = useCallback((windowId: string) => {
    dispatch({ type: 'SET_ACTIVE_WINDOW', payload: windowId });
    trackEvent('active_window_changed', { windowId });
  }, [trackEvent]);

  const getWindow = useCallback((windowId: string) => {
    return state.windows.get(windowId);
  }, [state.windows]);

  const getActiveWindow = useCallback(() => {
    return state.activeWindowId ? state.windows.get(state.activeWindowId) : undefined;
  }, [state.activeWindowId, state.windows]);

  const getWindowsByApp = useCallback((appId: string) => {
    return Array.from(state.windows.values()).filter(window => window.appId === appId);
  }, [state.windows]);

  // App state operations
  const createAppState = useCallback((app: Omit<AppState, 'id'>) => {
    const appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newApp: AppState = {
      ...app,
      id: appId,
      metadata: {
        lastAccessed: new Date(),
        created: new Date(),
        version: '1.0.0'
      }
    };

    dispatch({ type: 'CREATE_APP_STATE', payload: newApp });
    trackEvent('app_state_created', { appId, windowId: app.windowId });

    return appId;
  }, [trackEvent]);

  const updateAppState = useCallback((appId: string, updates: Partial<AppState>) => {
    dispatch({ type: 'UPDATE_APP_STATE', payload: { id: appId, ...updates } });
    trackEvent('app_state_updated', { appId, updates: Object.keys(updates) });
  }, [trackEvent]);

  const removeAppState = useCallback((appId: string) => {
    dispatch({ type: 'REMOVE_APP_STATE', payload: appId });
    trackEvent('app_state_removed', { appId });
  }, [trackEvent]);

  const getAppState = useCallback((appId: string) => {
    return state.apps.get(appId);
  }, [state.apps]);

  const getAppStatesByWindow = useCallback((windowId: string) => {
    return Array.from(state.apps.values()).filter(app => app.windowId === windowId);
  }, [state.apps]);

  // Global operations
  const setGlobalSetting = useCallback((key: string, value: any) => {
    dispatch({ type: 'SET_GLOBAL_SETTING', payload: { key, value } });
    trackEvent('global_setting_updated', { key });
  }, [trackEvent]);

  const getGlobalSetting = useCallback((key: string) => {
    return state.globalSettings[key];
  }, [state.globalSettings]);

  // Cache operations
  const cacheData = useCallback((key: string, data: any, ttl: number = 300000) => {
    dispatch({ type: 'CACHE_DATA', payload: { key, data, ttl } });
  }, []);

  const getCachedData = useCallback((key: string) => {
    const entry = state.cache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }
    return null;
  }, [state.cache]);

  const clearCache = useCallback((key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', payload: key });
  }, []);

  // Utility operations
  const cleanup = useCallback(() => {
    dispatch({ type: 'CLEANUP_INACTIVE' });
  }, []);

  const exportState = useCallback(() => {
    const exportData = {
      tenants: Array.from(state.tenants.entries()),
      windows: Array.from(state.windows.entries()),
      apps: Array.from(state.apps.entries()),
      activeTenantId: state.activeTenantId,
      activeWindowId: state.activeWindowId,
      globalSettings: state.globalSettings
    };

    return JSON.stringify(exportData, null, 2);
  }, [state]);

  const importState = useCallback((stateData: string) => {
    try {
      const importData = JSON.parse(stateData);

      // Clear current state
      dispatch({ type: 'CLEAR_CACHE' });

      // Import tenants
      if (importData.tenants) {
        for (const [id, tenant] of importData.tenants) {
          dispatch({ type: 'INITIALIZE_TENANT', payload: tenant as TenantState });
        }
      }

      // Import windows
      if (importData.windows) {
        for (const [id, window] of importData.windows) {
          dispatch({ type: 'CREATE_WINDOW', payload: window as WindowState });
        }
      }

      // Import app states
      if (importData.apps) {
        for (const [id, app] of importData.apps) {
          dispatch({ type: 'CREATE_APP_STATE', payload: app as AppState });
        }
      }

      // Import global settings
      if (importData.globalSettings) {
        for (const [key, value] of Object.entries(importData.globalSettings)) {
          dispatch({ type: 'SET_GLOBAL_SETTING', payload: { key, value } });
        }
      }

      trackEvent('state_imported', { dataSize: stateData.length });
    } catch (error) {
      trackEvent('state_import_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error('Failed to import state data');
    }
  }, [trackEvent]);

  const contextValue: StateManagerContextType = {
    state,
    // Tenant operations
    initializeTenant,
    setActiveTenant,
    getTenant,
    getActiveTenant,

    // Window operations
    createWindow,
    updateWindow,
    closeWindow,
    setActiveWindow,
    getWindow,
    getActiveWindow,
    getWindowsByApp,

    // App state operations
    createAppState,
    updateAppState,
    removeAppState,
    getAppState,
    getAppStatesByWindow,

    // Global operations
    setGlobalSetting,
    getGlobalSetting,

    // Cache operations
    cacheData,
    getCachedData,
    clearCache,

    // Utility operations
    cleanup,
    exportState,
    importState
  };

  return (
    <StateManagerContext.Provider value={contextValue}>
      {children}
    </StateManagerContext.Provider>
  );
};

export default StateManagerProvider;
