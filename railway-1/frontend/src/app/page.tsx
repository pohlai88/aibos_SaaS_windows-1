'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { TerminalLoginScreen } from '@/components/auth/TerminalLoginScreen';

import { TopBar } from '@/components/shell/TopBar';
import { DesktopView } from '@/components/shell/DesktopView';
import { DockSystem } from '@/components/shell/DockSystem';
import { LiveAppMetrics } from '@/components/shell/LiveAppMetrics';
import { PersonalizedScenes } from '@/components/shell/PersonalizedScenes';
import { AIOnboardingAssistant } from '@/components/shell/AIOnboardingAssistant';
import { IdleDetection } from '@/components/shell/IdleDetection';
import { DeveloperPortal } from '@/components/enterprise/DeveloperPortal';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';
import { VisualAppBuilder } from '@/components/enterprise/VisualAppBuilder';

type AppMode = 'shell' | 'dashboard' | 'revolutionary' | 'builder' | 'portal';

export default function HomePage() {
  const { user, tenant, loading } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('shell');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLiveMetrics, setShowLiveMetrics] = useState(true);
  const [showPersonalizedScenes, setShowPersonalizedScenes] = useState(true);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-400 font-mono">Loading AI-BOS...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <TerminalLoginScreen />;
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    console.log('Onboarding completed');
  };

  const handleOnboardingStepComplete = (stepId: string) => {
    console.log('Onboarding step completed:', stepId);
  };

  const handleAppSelect = (appId: string) => {
    console.log('App selected:', appId);
  };

  const handlePerformanceAlert = (appId: string, issue: string) => {
    console.log('Performance alert:', appId, issue);
  };

  const handleSceneChange = (scene: any) => {
    console.log('Scene changed:', scene);
  };

  const handleCustomSceneCreate = (scene: any) => {
    console.log('Custom scene created:', scene);
  };

  const handleIdleStart = () => {
    console.log('User became idle');
  };

  const handleIdleEnd = () => {
    console.log('User became active');
  };

  const handleSleep = () => {
    console.log('System going to sleep');
  };

  const handleWake = () => {
    console.log('System waking up');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Render different app modes */}
      {(() => {
          switch (appMode) {
            case 'dashboard':
              return (
                <EnterpriseDashboard
                  tenantId={tenant?.tenant_id}
                  userId={user.user_id}
                  enableAI={true}
                  enableRealtime={true}
                />
              );

            case 'revolutionary':
              return (
                <div className="h-screen flex items-center justify-center">
                  <div className="text-green-400 font-mono text-center">
                    <h1 className="text-2xl mb-4">🚀 Revolutionary Interface</h1>
                    <p>Coming soon...</p>
                  </div>
                </div>
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
        })()}
      </div>
    );
}
