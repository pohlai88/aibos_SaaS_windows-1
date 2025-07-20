'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { AibosShellEnhanced } from '@/components/shell/AibosShellEnhanced';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';
import { VisualAppBuilder } from '@/components/enterprise/VisualAppBuilder';
import { DeveloperPortal } from '@/components/enterprise/DeveloperPortal';
import { RevolutionaryDashboard } from '@/components/ai/RevolutionaryDashboard';

// Import the revolutionary design system
import '@/styles/ai-design-system.css';

type AppMode = 'shell' | 'dashboard' | 'revolutionary' | 'builder' | 'portal';

export default function HomePage() {
  const { user, tenant, loading } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('revolutionary'); // Default to revolutionary

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Mode Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setAppMode('shell')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              appMode === 'shell'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏠 AI-BOS Shell
          </button>
          <button
            onClick={() => setAppMode('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              appMode === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Enterprise Dashboard
          </button>
          <button
            onClick={() => setAppMode('revolutionary')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              appMode === 'revolutionary'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🚀 Revolutionary Dashboard
          </button>
          <button
            onClick={() => setAppMode('builder')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              appMode === 'builder'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎨 Visual App Builder
          </button>
          <button
            onClick={() => setAppMode('portal')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              appMode === 'portal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔧 Developer Portal
          </button>
        </div>
      </div>

      {/* Render different app modes based on user selection */}
      {(() => {
        switch (appMode) {
          case 'revolutionary':
            return (
              <RevolutionaryDashboard
                tenantId={tenant?.tenant_id}
                userId={user.user_id}
                enableAI={true}
                enableRealtime={true}
              />
            );

          case 'dashboard':
            return (
              <EnterpriseDashboard
                tenantId={tenant?.tenant_id}
                userId={user.user_id}
                enableAI={true}
                enableRealtime={true}
              />
            );

          case 'builder':
            return (
              <VisualAppBuilder
                tenantId={tenant?.tenant_id}
                userId={user.user_id}
                enableAI={true}
                enableRealtime={true}
              />
            );

          case 'portal':
            return (
              <DeveloperPortal
                tenantId={tenant?.tenant_id}
                userId={user.user_id}
                enableAI={true}
                enableRealtime={true}
              />
            );

          case 'shell':
          default:
            return <AibosShellEnhanced />;
        }
      })()}
    </div>
  );
}
