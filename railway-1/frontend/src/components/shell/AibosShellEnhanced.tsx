'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useApp } from '@/components/providers/AppProvider';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { WindowManager } from './WindowManager';
import { AppWindow } from './AppWindow';

// Import shared library components
import { 
  AppShell,
  PerformanceDashboard,
  Spotlight,
  ThemeProvider,
  usePerformance,
  useSecurity,
  useBilling,
  useEvents,
  useTenant
} from '@aibos/shared';

export function AibosShellEnhanced() {
  const { user, tenant, logout } = useAuth();
  const { windows, openWindow } = useApp();

  // Shared library hooks
  const { performanceMetrics } = usePerformance();
  const { securityStatus } = useSecurity();
  const { billingStatus } = useBilling();
  const { subscribeToEvents } = useEvents();
  const { tenantInfo } = useTenant();

  // Demo apps for testing
  const demoApps = [
    { 
      id: 'accounting', 
      name: 'Accounting', 
      icon: '📊',
      description: 'Track money and create reports',
      category: 'Finance'
    },
    { 
      id: 'tax', 
      name: 'Tax Calculator', 
      icon: '🧮',
      description: 'Automatic tax calculations',
      category: 'Finance'
    },
    { 
      id: 'inventory', 
      name: 'Inventory', 
      icon: '📦',
      description: 'Track products and stock',
      category: 'Operations'
    },
    { 
      id: 'crm', 
      name: 'CRM', 
      icon: '👥',
      description: 'Manage customers and leads',
      category: 'Sales'
    },
    { 
      id: 'realtime', 
      name: 'Realtime Demo', 
      icon: '🔌',
      description: 'Live updates and collaboration',
      category: 'Development'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: '📈',
      description: 'System performance monitoring',
      category: 'Admin'
    },
    { 
      id: 'security', 
      name: 'Security', 
      icon: '🔒',
      description: 'Security and compliance',
      category: 'Admin'
    },
    { 
      id: 'billing', 
      name: 'Billing', 
      icon: '💳',
      description: 'Subscription and billing',
      category: 'Admin'
    }
  ];

  const handleAppClick = (appId: string) => {
    const app = demoApps.find(a => a.id === appId);
    if (app) {
      openWindow(appId, app.name);
    }
  };

  // Subscribe to platform events
  React.useEffect(() => {
    const unsubscribe = subscribeToEvents([
      'UserLoggedIn',
      'UserLoggedOut', 
      'AppInstalled',
      'AppUninstalled',
      'DataUpdated',
      'SecurityAlert'
    ], (event) => {
      console.log('Platform event:', event);
      // Handle platform events
    });

    return unsubscribe;
  }, [subscribeToEvents]);

  return (
    <ThemeProvider theme={tenantInfo?.theme || 'default'}>
      <AppShell
        user={user}
        tenant={tenant}
        performanceMetrics={performanceMetrics}
        securityStatus={securityStatus}
        billingStatus={billingStatus}
      >
        <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* Enhanced Top Bar with shared components */}
          <TopBar 
            user={user} 
            tenant={tenant} 
            onLogout={logout}
            performanceMetrics={performanceMetrics}
            securityStatus={securityStatus}
            billingStatus={billingStatus}
          />
          
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
                <div className="text-center max-w-4xl mx-auto px-6">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to AI-BOS Platform
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Your Windows OS for SaaS - Click on an app in the dock below to get started
                  </p>
                  
                  {/* App Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['Finance', 'Operations', 'Sales', 'Admin'].map((category) => (
                      <div key={category} className="text-center">
                        <h3 className="font-semibold text-gray-800 mb-3">{category}</h3>
                        <div className="space-y-2">
                          {demoApps
                            .filter(app => app.category === category)
                            .map((app) => (
                              <button
                                key={app.id}
                                onClick={() => handleAppClick(app.id)}
                                className="w-full flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                              >
                                <span className="text-xl mr-3">{app.icon}</span>
                                <div className="text-left">
                                  <div className="font-medium text-gray-700">{app.name}</div>
                                  <div className="text-xs text-gray-500">{app.description}</div>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Platform Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Performance</h4>
                      <div className="text-sm text-gray-600">
                        {performanceMetrics ? (
                          <>
                            <div>Response Time: {performanceMetrics.responseTime}ms</div>
                            <div>Uptime: {performanceMetrics.uptime}%</div>
                          </>
                        ) : (
                          <div>Loading...</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Security</h4>
                      <div className="text-sm text-gray-600">
                        {securityStatus ? (
                          <div className={`text-${securityStatus.status === 'secure' ? 'green' : 'red'}-600`}>
                            {securityStatus.status === 'secure' ? '🔒 Secure' : '⚠️ Attention Required'}
                          </div>
                        ) : (
                          <div>Loading...</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Billing</h4>
                      <div className="text-sm text-gray-600">
                        {billingStatus ? (
                          <>
                            <div>Plan: {billingStatus.plan}</div>
                            <div>Status: {billingStatus.status}</div>
                          </>
                        ) : (
                          <div>Loading...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Dock with shared components */}
          <Dock 
            apps={demoApps} 
            onAppClick={handleAppClick}
            performanceMetrics={performanceMetrics}
            securityStatus={securityStatus}
          />

          {/* Global Spotlight Search */}
          <Spotlight 
            apps={demoApps}
            onAppSelect={handleAppClick}
            placeholder="Search apps, data, or actions..."
          />
        </div>
      </AppShell>
    </ThemeProvider>
  );
} 