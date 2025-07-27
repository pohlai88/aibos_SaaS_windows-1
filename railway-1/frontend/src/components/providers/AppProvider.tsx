'use client';

import { createContext, useContext, useState } from 'react';

interface App {
  app_id: string;
  manifest_id: string;
  name: string;
  version: string;
  status: string;
  installed_at: string;
}

interface Window {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isActive: boolean;
}

interface AppContextType {
  apps: App[];
  windows: Window[];
  activeWindow: string | null;
  installApp: (manifestId: string, name: string) => Promise<void>;
  uninstallApp: (appId: string) => Promise<void>;
  openWindow: (appId: string, title?: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  setActiveWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<App[]>([]);
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindow, setActiveWindowState] = useState<string | null>(null);

  const installApp = async (manifestId: string, name: string) => {
    // In a real implementation, this would call the API
    const newApp: App = {
      app_id: `app-${Date.now()}`,
      manifest_id: manifestId,
      name,
      version: '1.0.0',
      status: 'installed',
      installed_at: new Date().toISOString(),
    };

    setApps(prev => [...prev, newApp]);
  };

  const uninstallApp = async (appId: string) => {
    // Close all windows for this app
    setWindows(prev => prev.filter(w => w.appId !== appId));
    setApps(prev => prev.filter(app => app.app_id !== appId));
  };

  const openWindow = (appId: string, title?: string) => {
    const app = apps.find(a => a.app_id === appId);
    if (!app) return;

    const windowId = `window-${Date.now()}`;
    const newWindow: Window = {
      id: windowId,
      appId,
      title: title || app.name,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: Math.max(...windows.map(w => w.zIndex), 0) + 1,
      isActive: true,
    };

    setWindows(prev => {
      // Deactivate all other windows
      const updatedWindows = prev.map(w => ({ ...w, isActive: false, zIndex: w.zIndex + 1 }));
      return [...updatedWindows, newWindow];
    });

    setActiveWindowState(windowId);
  };

  const closeWindow = (windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));

    if (activeWindow === windowId) {
      const remainingWindows = windows.filter(w => w.id !== windowId);
      if (remainingWindows.length > 0) {
        const lastWindow = remainingWindows[remainingWindows.length - 1];
        if (lastWindow) {
          setActiveWindowState(lastWindow.id);
        } else {
          setActiveWindowState(null);
        }
      } else {
        setActiveWindowState(null);
      }
    }
  };

    const minimizeWindow = (windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMinimized: true, isActive: false } : w
    ));

    if (activeWindow === windowId) {
      const remainingWindows = windows.filter(w => w.id !== windowId);
      if (remainingWindows.length > 0) {
        const lastWindow = remainingWindows[remainingWindows.length - 1];
        if (lastWindow) {
          setActiveWindowState(lastWindow.id);
        } else {
          setActiveWindowState(null);
        }
      } else {
        setActiveWindowState(null);
      }
    }
  };

  const maximizeWindow = (windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const setActiveWindow = (windowId: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      isActive: w.id === windowId,
      zIndex: w.id === windowId ? Math.max(...prev.map(w => w.zIndex)) + 1 : w.zIndex
    })));
    setActiveWindowState(windowId);
  };

  const updateWindowPosition = (windowId: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, position } : w
    ));
  };

  const updateWindowSize = (windowId: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, size } : w
    ));
  };

  const value: AppContextType = {
    apps,
    windows,
    activeWindow,
    installApp,
    uninstallApp,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
