'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useApp } from '@/components/providers/AppProvider';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { WindowManager } from './WindowManager';
import { AppWindow } from './AppWindow';

export function AibosShell() {
  const { user, tenant, logout } = useAuth();
  const { windows, openWindow } = useApp();

  // Demo apps for testing
  const demoApps = [
    { id: 'accounting', name: 'Accounting', icon: '📊' },
    { id: 'tax', name: 'Tax Calculator', icon: '🧮' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'crm', name: 'CRM', icon: '👥' },
    { id: 'realtime', name: 'Realtime Demo', icon: '🔌' },
  ];

  const handleAppClick = (appId: string) => {
    const app = demoApps.find(a => a.id === appId);
    if (app) {
      openWindow(appId, app.name);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Top Bar */}
      <TopBar user={user} tenant={tenant} onLogout={logout} />
      
      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Window Manager */}
        <WindowManager>
          {windows.map((window) => (
            <AppWindow
              key={window.id}
              window={window}
            />
          ))}
        </WindowManager>
        
        {/* Welcome Message (when no windows open) */}
        {windows.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to AI-BOS Platform
              </h2>
              <p className="text-gray-600 mb-6">
                Click on an app in the dock below to get started
              </p>
              <div className="flex justify-center space-x-4">
                {demoApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl mb-2">{app.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Dock */}
      <Dock apps={demoApps} onAppClick={handleAppClick} />
    </div>
  );
} 