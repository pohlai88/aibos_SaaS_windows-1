import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// ==================== TYPES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  tenant_id: string;
  avatar?: string;
  preferences: UserPreferences;
  created_at: string;
  last_login: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  sound: boolean;
  animations: boolean;
  workspace_layout: 'grid' | 'list' | 'spatial';
  window_behavior: 'cascade' | 'tile' | 'free';
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: 'personal' | 'shared' | 'project';
  apps: string[];
  layout: any;
  created_at: string;
  updated_at: string;
  owner_id: string;
  members: string[];
}

export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  data?: any;
}

export interface AppState {
  id: string;
  isRunning: boolean;
  isInstalled: boolean;
  lastUsed: string;
  usageCount: number;
  settings: any;
}

export interface SystemState {
  isOnline: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  clipboard: any;
  activeWorkspace: string | null;
  activeWindows: string[];
  // 5G Network Slices
  analytics?: {
    active: boolean;
    engines: number;
    dataSources: number;
    metrics?: any;
  };
  edgeComputing?: {
    active: boolean;
    nodes: number;
    processingPower: number;
    metrics?: any;
  };
  networkAutomation?: {
    active: boolean;
    rules: number;
    aiModels: number;
    metrics?: any;
  };
  security?: {
    active: boolean;
    threatLevel: string;
    securityScore: number;
    metrics?: any;
  };
  consciousness?: {
    edgeOptimized?: boolean;
    automationOptimized?: boolean;
    securityOptimized?: boolean;
    analyticsOptimized?: boolean;
    processingPower?: number;
    latency?: number;
    automationEfficiency?: number;
    securityScore?: number;
    predictionAccuracy?: number;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ==================== STORE INTERFACE ====================

interface AIBOSStore {
  // User State
  user: User | null;
  token: string | null;

  // System State
  system: SystemState;

  // Workspace Management
  workspaces: Workspace[];
  activeWorkspace: string | null;

  // Window Management
  windows: AppWindow[];
  activeWindow: string | null;

  // App Management
  apps: Record<string, AppState>;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSystemState: (updates: Partial<SystemState>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  setActiveWorkspace: (workspaceId: string | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  addWindow: (window: AppWindow) => void;
  updateWindow: (id: string, updates: Partial<AppWindow>) => void;
  removeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  setAppState: (appId: string, state: Partial<AppState>) => void;
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  clearError: () => void;
  logout: () => void;
}

// ==================== STORE IMPLEMENTATION ====================

export const useAIBOSStore = create<AIBOSStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        token: null,

        system: {
          isOnline: true,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          notifications: [],
          clipboard: null,
          activeWorkspace: null,
          activeWindows: []
        },

        workspaces: [],
        activeWorkspace: null,
        windows: [],
        activeWindow: null,
        apps: {},

        // User Actions
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),

        // System Actions
        setSystemState: (updates) =>
          set((state) => ({
            system: { ...state.system, ...updates }
          })),

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          };
          set((state) => ({
            system: {
              ...state.system,
              notifications: [newNotification, ...state.system.notifications]
            }
          }));
        },

        removeNotification: (id) =>
          set((state) => ({
            system: {
              ...state.system,
              notifications: state.system.notifications.filter(n => n.id !== id)
            }
          })),

        markNotificationRead: (id) =>
          set((state) => ({
            system: {
              ...state.system,
              notifications: state.system.notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
              )
            }
          })),

        // Workspace Actions
        setActiveWorkspace: (workspaceId) => set({ activeWorkspace: workspaceId }),

        addWorkspace: (workspace) =>
          set((state) => ({
            workspaces: [...state.workspaces, workspace]
          })),

        updateWorkspace: (id, updates) =>
          set((state) => ({
            workspaces: state.workspaces.map(w =>
              w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
            )
          })),

        removeWorkspace: (id) =>
          set((state) => ({
            workspaces: state.workspaces.filter(w => w.id !== id)
          })),

        // Window Actions
        addWindow: (window) => {
          set((state) => {
            const newWindows = [...state.windows, window];
            const maxZIndex = Math.max(...newWindows.map(w => w.zIndex), 0);
            return {
              windows: newWindows,
              activeWindow: window.id,
              system: {
                ...state.system,
                activeWindows: [...state.system.activeWindows, window.id]
              }
            };
          });
        },

        updateWindow: (id, updates) =>
          set((state) => ({
            windows: state.windows.map(w =>
              w.id === id ? { ...w, ...updates } : w
            )
          })),

        removeWindow: (id) =>
          set((state) => ({
            windows: state.windows.filter(w => w.id !== id),
            activeWindow: state.activeWindow === id ? null : state.activeWindow,
            system: {
              ...state.system,
              activeWindows: state.system.activeWindows.filter(wId => wId !== id)
            }
          })),

        focusWindow: (id) => {
          set((state) => {
            const maxZIndex = Math.max(...state.windows.map(w => w.zIndex), 0);
            return {
              windows: state.windows.map(w =>
                w.id === id
                  ? { ...w, isFocused: true, zIndex: maxZIndex + 1 }
                  : { ...w, isFocused: false }
              ),
              activeWindow: id
            };
          });
        },

        minimizeWindow: (id) =>
          set((state) => ({
            windows: state.windows.map(w =>
              w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
            ),
            activeWindow: state.activeWindow === id ? null : state.activeWindow
          })),

        maximizeWindow: (id) =>
          set((state) => ({
            windows: state.windows.map(w =>
              w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
            )
          })),

        // App Actions
        setAppState: (appId, state) =>
          set((store) => {
            const existingApp = store.apps[appId];
            const updatedApp: AppState = {
              id: appId,
              isRunning: existingApp?.isRunning ?? false,
              isInstalled: existingApp?.isInstalled ?? false,
              lastUsed: existingApp?.lastUsed ?? new Date().toISOString(),
              usageCount: existingApp?.usageCount ?? 0,
              settings: existingApp?.settings ?? {},
              ...state
            };

            return {
              apps: {
                ...store.apps,
                [appId]: updatedApp
              }
            };
          }),

        installApp: (appId) =>
          set((state) => ({
            apps: {
              ...state.apps,
              [appId]: {
                id: appId,
                isRunning: false,
                isInstalled: true,
                lastUsed: new Date().toISOString(),
                usageCount: 0,
                settings: {}
              }
            }
          })),

        uninstallApp: (appId) => {
          const { apps } = get();
          const newApps = { ...apps };
          delete newApps[appId];
          set({ apps: newApps });
        },

        clearError: () =>
          set((state) => ({
            system: { ...state.system, error: null }
          })),

        logout: () => {
          set({
            user: null,
            token: null,
            system: {
              isOnline: true,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              notifications: [],
              clipboard: null,
              activeWorkspace: null,
              activeWindows: []
            },
            workspaces: [],
            activeWorkspace: null,
            windows: [],
            activeWindow: null,
            apps: {}
          });

          if (typeof window !== 'undefined') {
            localStorage.removeItem('aibos_token');
            localStorage.removeItem('aibos_user');
          }
        }
      }),
      {
        name: 'aibos-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          workspaces: state.workspaces,
          activeWorkspace: state.activeWorkspace,
          apps: state.apps,
          system: {
            ...state.system,
            notifications: state.system.notifications.filter(n => !n.isRead)
          }
        })
      }
    ),
    {
      name: 'aibos-store'
    }
  )
);

// ==================== SELECTORS ====================

export const useUser = () => useAIBOSStore((state) => state.user);
export const useToken = () => useAIBOSStore((state) => state.token);
export const useSystem = () => useAIBOSStore((state) => state.system);
export const useWorkspaces = () => useAIBOSStore((state) => state.workspaces);
export const useActiveWorkspace = () => useAIBOSStore((state) => state.activeWorkspace);
export const useWindows = () => useAIBOSStore((state) => state.windows);
export const useActiveWindow = () => useAIBOSStore((state) => state.activeWindow);
export const useApps = () => useAIBOSStore((state) => state.apps);
export const useNotifications = () => useAIBOSStore((state) => state.system.notifications);
export const useIsAuthenticated = () => useAIBOSStore((state) => state.system.isAuthenticated);
export const useIsOnline = () => useAIBOSStore((state) => state.system.isOnline);
