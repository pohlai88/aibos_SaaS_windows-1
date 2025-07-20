'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/auth/LoginScreen';
import SystemCoreProvider from '@/components/shell/SystemCore';
import { TopBar } from '@/components/shell/TopBar';
import { DockSystem } from '@/components/shell/DockSystem';
import { DesktopView } from '@/components/shell/DesktopView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';
import { VisualAppBuilder } from '@/components/enterprise/VisualAppBuilder';
import { DeveloperPortal } from '@/components/enterprise/DeveloperPortal';
import { RevolutionaryDashboard } from '@/components/ai/RevolutionaryDashboard';

// Steve Jobs Bonus Features
import { AIOnboardingAssistant } from '@/components/shell/AIOnboardingAssistant';
import { LiveAppMetrics } from '@/components/shell/LiveAppMetrics';
import { PersonalizedScenes } from '@/components/shell/PersonalizedScenes';
import { IdleDetection } from '@/components/shell/IdleDetection';

// Import the revolutionary design system
import '@/styles/ai-design-system.css';

type AppMode = 'shell' | 'dashboard' | 'revolutionary' | 'builder' | 'portal';

export default function HomePage() {
  const { user, tenant, loading } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('revolutionary'); // Default to revolutionary

  // Steve Jobs Bonus Features State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLiveMetrics, setShowLiveMetrics] = useState(false);
  const [showPersonalizedScenes, setShowPersonalizedScenes] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  // Check if user needs onboarding (first time or returning after long time)
  useEffect(() => {
    if (user && !loading) {
      const lastOnboarding = localStorage.getItem('aibos-onboarding-seen');
      const lastVisit = localStorage.getItem('aibos-last-visit');
      const now = Date.now();

      // Show onboarding if never seen or if it's been more than 30 days
      if (!lastOnboarding || (lastVisit && (now - parseInt(lastVisit)) > 30 * 24 * 60 * 60 * 1000)) {
        setShowOnboarding(true);
      }

      // Update last visit
      localStorage.setItem('aibos-last-visit', now.toString());
    }
  }, [user, loading]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    localStorage.setItem('aibos-onboarding-seen', Date.now().toString());
  };

  // Handle onboarding step completion
  const handleOnboardingStepComplete = (stepId: string) => {
    console.log('Onboarding step completed:', stepId);
  };

  // Handle app selection from live metrics
  const handleAppSelect = (appId: string) => {
    console.log('App selected from metrics:', appId);
    // Could launch the app or show more details
  };

  // Handle performance alerts
  const handlePerformanceAlert = (appId: string, issue: string) => {
    console.log('Performance alert:', appId, issue);
    // Could show a toast notification
  };

  // Handle scene change
  const handleSceneChange = (scene: any) => {
    console.log('Scene changed:', scene.name);
    // Apply the scene theme
  };

  // Handle custom scene creation
  const handleCustomSceneCreate = (scene: any) => {
    console.log('Custom scene created:', scene.name);
  };

  // Handle idle detection events
  const handleIdleStart = () => {
    setIsIdle(true);
    console.log('User is now idle');
  };

  const handleIdleEnd = () => {
    setIsIdle(false);
    console.log('User is active again');
  };

  const handleSleep = () => {
    setIsSleeping(true);
    console.log('System going to sleep');
  };

  const handleWake = () => {
    setIsIdle(false);
    setIsSleeping(false);
    console.log('System woke up');
  };

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

        {/* Steve Jobs Bonus Features Toggle */}
        <div className="flex items-center justify-center space-x-2 mt-3">
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            🤖 AI Onboarding
          </button>
          <button
            onClick={() => setShowLiveMetrics(!showLiveMetrics)}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            📊 Live Metrics
          </button>
          <button
            onClick={() => setShowPersonalizedScenes(!showPersonalizedScenes)}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
          >
            🎨 Personalized Scenes
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
            return (
              <SystemCoreProvider
                config={{
                  features: {
                    ai: true,
                    realtime: true,
                    analytics: true,
                    telemetry: true
                  }
                }}
              >
                <div className="h-screen relative overflow-hidden">
                  {/* TopBar - System menu, user profile, global controls */}
                  <TopBar
                    onMenuAction={(action) => console.log('Menu action:', action)}
                    onUserAction={(action) => console.log('User action:', action)}
                    onSearch={(query) => console.log('Search:', query)}
                  />

                  {/* DesktopView - Main workspace */}
                  <div className="pt-16 pb-20 h-full">
                    <DesktopView
                      onIconClick={(icon) => console.log('Icon clicked:', icon)}
                      onIconDoubleClick={(icon) => console.log('Icon double-clicked:', icon)}
                    />
                  </div>

                  {/* DockSystem - App launcher, pinned apps, running indicators */}
                  <DockSystem
                    onAppLaunch={(appId) => console.log('App launched:', appId)}
                    onAppClose={(appId) => console.log('App closed:', appId)}
                    onAppPin={(appId, pinned) => console.log('App pinned:', appId, pinned)}
                  />

                  {/* Steve Jobs Bonus Features */}

                  {/* Live App Metrics - Floating widget */}
                  {showLiveMetrics && (
                    <div className="absolute top-20 right-4 z-40">
                      <LiveAppMetrics
                        onAppSelect={handleAppSelect}
                        onPerformanceAlert={handlePerformanceAlert}
                      />
                    </div>
                  )}

                  {/* Personalized Scenes - Floating widget */}
                  {showPersonalizedScenes && (
                    <div className="absolute top-20 left-4 z-40">
                      <PersonalizedScenes
                        onSceneChange={handleSceneChange}
                        onCustomSceneCreate={handleCustomSceneCreate}
                      />
                    </div>
                  )}
                </div>
              </SystemCoreProvider>
            );
        }
      })()}

      {/* AI Onboarding Assistant - Modal overlay */}
      <AIOnboardingAssistant
        isVisible={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStepComplete={handleOnboardingStepComplete}
        onComplete={handleOnboardingComplete}
      />

      {/* Idle Detection - System-wide */}
      <IdleDetection
        idleTimeout={2 * 60 * 1000} // 2 minutes for demo
        onIdleStart={handleIdleStart}
        onIdleEnd={handleIdleEnd}
        onSleep={handleSleep}
        onWake={handleWake}
      />
    </div>
  );
}
