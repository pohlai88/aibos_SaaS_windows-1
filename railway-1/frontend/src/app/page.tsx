'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { TerminalLoginScreen } from '@/components/auth/TerminalLoginScreen';

import { TopBar } from '@/components/shell/TopBar';
import { DesktopView } from '@/components/shell/DesktopView';
import { DockSystem } from '@/components/shell/DockSystem';
import { LiveAppMetrics } from '@/components/shell/LiveAppMetrics';
import { SceneManager } from '@/components/shell/SceneManager';
import { AIOnboardingAssistant } from '@/components/shell/AIOnboardingAssistant';
import { IdleDetection } from '@/components/shell/IdleDetection';
import { DeveloperPortal } from '@/components/enterprise/DeveloperPortal';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';
import { VisualAppBuilder } from '@/components/enterprise/VisualAppBuilder';
import { motion, AnimatePresence } from 'framer-motion';

type AppMode = 'shell' | 'dashboard' | 'revolutionary' | 'builder' | 'portal' | 'analytics' | 'settings' | 'help';

export default function HomePage() {
  const { user, tenant, loading } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('shell');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLiveMetrics, setShowLiveMetrics] = useState(false); // Hidden by default
  const [isMetricsPanelExpanded, setIsMetricsPanelExpanded] = useState(false);

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
    // Show metrics panel when there's a performance issue
    if (!showLiveMetrics) {
      setShowLiveMetrics(true);
      setIsMetricsPanelExpanded(true);
    }
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

  // Handle real app navigation from desktop icons
  const handleAppLaunch = (appId: string) => {
    console.log('Launching app:', appId);

    // Map app IDs to app modes
    switch (appId) {
      case 'dashboard':
        setAppMode('dashboard');
        break;
      case 'portal':
        setAppMode('portal');
        break;
      case 'builder':
        setAppMode('builder');
        break;
      case 'analytics':
        setAppMode('analytics');
        break;
      case 'settings':
        setAppMode('settings');
        break;
      case 'help':
        setAppMode('help');
        break;
      default:
        console.log('Unknown app:', appId);
    }
  };

  // Handle returning to shell
  const handleReturnToShell = () => {
    setAppMode('shell');
  };

  // Handle metrics panel toggle
  const toggleMetricsPanel = () => {
    if (!showLiveMetrics) {
      setShowLiveMetrics(true);
      setIsMetricsPanelExpanded(true);
    } else {
      setIsMetricsPanelExpanded(!isMetricsPanelExpanded);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Render different app modes */}
      {(() => {
          switch (appMode) {
            case 'dashboard':
              return (
                <div className="relative">
                  {/* Back button */}
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>
                  <EnterpriseDashboard
                    tenantId={tenant?.tenant_id}
                    userId={user.user_id}
                    enableAI={true}
                    enableRealtime={true}
                  />
                </div>
              );

            case 'revolutionary':
              return (
                <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
                  {/* Back button */}
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>

                  {/* Revolutionary AI Workspace */}
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/20">
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          🚀 Revolutionary AI Workspace
                        </h1>
                        <p className="text-white/70 mt-2">Experience the future of AI-powered productivity</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                          <span className="text-green-400 text-sm">AI Active</span>
                        </div>
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                          <span className="text-blue-400 text-sm">Real-time</span>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex">
                      {/* Left Panel - AI Assistant */}
                      <div className="w-1/3 border-r border-white/20 p-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4 h-full">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="mr-2">🤖</span>
                            AI Assistant
                          </h3>
                          <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                              <p className="text-sm text-blue-300">
                                "I've analyzed your workflow and found 3 optimization opportunities. Would you like me to implement them?"
                              </p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                              <p className="text-sm text-purple-300">
                                "Your team's productivity has increased by 23% this week. Great job!"
                              </p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <p className="text-sm text-green-300">
                                "New AI model deployed successfully. Performance improved by 15%."
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Panel - Live Workspace */}
                      <div className="flex-1 p-6">
                        <div className="grid grid-cols-2 gap-6 h-full">
                          {/* Real-time Analytics */}
                          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <span className="mr-2">📊</span>
                              Live Analytics
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">Active Users</span>
                                <span className="text-green-400 font-semibold">1,247</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">AI Requests</span>
                                <span className="text-blue-400 font-semibold">5,892</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">System Load</span>
                                <span className="text-yellow-400 font-semibold">67%</span>
                              </div>
                            </div>
                          </div>

                          {/* AI Insights */}
                          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <span className="mr-2">💡</span>
                              AI Insights
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3">
                                <p className="text-sm">Peak usage detected at 2:30 PM</p>
                              </div>
                              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3">
                                <p className="text-sm">User satisfaction: 94%</p>
                              </div>
                              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3">
                                <p className="text-sm">3 potential issues identified</p>
                              </div>
                            </div>
                          </div>

                          {/* Smart Actions */}
                          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <span className="mr-2">⚡</span>
                              Smart Actions
                            </h3>
                            <div className="space-y-2">
                              <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-2 text-sm transition-colors">
                                Optimize Database
                              </button>
                              <button className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-2 text-sm transition-colors">
                                Deploy Update
                              </button>
                              <button className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-2 text-sm transition-colors">
                                Generate Report
                              </button>
                            </div>
                          </div>

                          {/* Neural Network Status */}
                          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <span className="mr-2">🧠</span>
                              Neural Network
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">Model Status</span>
                                <span className="text-green-400 text-sm">Active</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">Accuracy</span>
                                <span className="text-blue-400 text-sm">97.3%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">Training</span>
                                <span className="text-yellow-400 text-sm">In Progress</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel - Quick Actions */}
                      <div className="w-1/4 border-l border-white/20 p-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4 h-full">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="mr-2">🎯</span>
                            Quick Actions
                          </h3>
                          <div className="space-y-3">
                            <button
                              onClick={() => setAppMode('dashboard')}
                              className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-lg p-3 text-sm transition-all duration-200 hover:scale-105"
                            >
                              📊 Open Dashboard
                            </button>
                            <button
                              onClick={() => setAppMode('portal')}
                              className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-lg p-3 text-sm transition-all duration-200 hover:scale-105"
                            >
                              📦 Developer Portal
                            </button>
                            <button
                              onClick={() => setAppMode('builder')}
                              className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg p-3 text-sm transition-all duration-200 hover:scale-105"
                            >
                              🔨 App Builder
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'builder':
              return (
                <div className="relative">
                  {/* Back button */}
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>
                  <VisualAppBuilder
                    tenantId={tenant?.tenant_id}
                    userId={user.user_id}
                    enableAI={true}
                    enableRealtime={true}
                  />
                </div>
              );

            case 'portal':
              return (
                <div className="relative">
                  {/* Back button */}
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>
                  <DeveloperPortal
                    tenantId={tenant?.tenant_id}
                    userId={user.user_id}
                    enableAI={true}
                    enableRealtime={true}
                  />
                </div>
              );

            case 'analytics':
              return (
                <div className="relative h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-2xl mx-auto p-8">
                      <div className="mb-8">
                        <div className="text-8xl mb-6">📊</div>
                        <h1 className="text-4xl font-bold text-white mb-4">Advanced Analytics</h1>
                        <p className="text-xl text-blue-200 mb-8">
                          Deep insights, predictive analytics, and intelligent reporting
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">🔮</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Predictive Analytics</h3>
                          <p className="text-blue-200 text-sm">AI-powered forecasting and trend analysis</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">📈</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Real-time Dashboards</h3>
                          <p className="text-blue-200 text-sm">Live metrics and performance monitoring</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">🎯</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Custom Reports</h3>
                          <p className="text-blue-200 text-sm">Tailored insights for your business</p>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                          Launch Analytics
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20">
                          View Documentation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'settings':
              return (
                <div className="relative h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900">
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-2xl mx-auto p-8">
                      <div className="mb-8">
                        <div className="text-8xl mb-6">⚙️</div>
                        <h1 className="text-4xl font-bold text-white mb-4">System Settings</h1>
                        <p className="text-xl text-gray-300 mb-8">
                          Configure your AI-BOS environment and preferences
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">🔒</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
                          <p className="text-gray-300 text-sm">Authentication, permissions, and access control</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">🎨</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Appearance</h3>
                          <p className="text-gray-300 text-sm">Themes, layouts, and visual preferences</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">🔔</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
                          <p className="text-gray-300 text-sm">Alerts, updates, and communication preferences</p>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                          Open Settings
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20">
                          System Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'help':
              return (
                <div className="relative h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900">
                  <button
                    onClick={handleReturnToShell}
                    className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ← Back to Desktop
                  </button>
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-2xl mx-auto p-8">
                      <div className="mb-8">
                        <div className="text-8xl mb-6">❓</div>
                        <h1 className="text-4xl font-bold text-white mb-4">Help & Support</h1>
                        <p className="text-xl text-green-200 mb-8">
                          Get assistance and learn how to use AI-BOS effectively
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">📚</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
                          <p className="text-green-200 text-sm">Comprehensive guides and tutorials</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">🎥</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Video Tutorials</h3>
                          <p className="text-green-200 text-sm">Step-by-step visual guides</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                          <div className="text-3xl mb-3">💬</div>
                          <h3 className="text-lg font-semibold text-white mb-2">Live Support</h3>
                          <p className="text-green-200 text-sm">Real-time assistance and chat</p>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                          Get Help
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

                  {/* DesktopView - Main workspace with proper z-index */}
                  <div className="pt-16 pb-20 h-full relative z-20">
                    <DesktopView
                      onIconClick={(icon) => console.log('Icon clicked:', icon)}
                      onIconDoubleClick={(icon) => handleAppLaunch(icon.appId)}
                    />
                  </div>

                  {/* DockSystem - App launcher, pinned apps, running indicators */}
                  <DockSystem
                    onAppLaunch={(appId) => handleAppLaunch(appId)}
                    onAppClose={(appId) => console.log('App closed:', appId)}
                    onAppPin={(appId, pinned) => console.log('App pinned:', appId, pinned)}
                  />

                  {/* Jobs-Style Scene Manager - Floating experience */}
                  <SceneManager
                    onSceneChange={handleSceneChange}
                    onCustomSceneCreate={handleCustomSceneCreate}
                  />

                  {/* Minimal Metrics Toggle - Only when needed */}
                  <AnimatePresence>
                    {showLiveMetrics && (
                      <motion.div
                        className="absolute top-20 right-4 z-10"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LiveAppMetrics
                          onAppSelect={handleAppSelect}
                          onPerformanceAlert={handlePerformanceAlert}
                          className={`max-h-[calc(100vh-6rem)] overflow-y-auto bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 ${
                            isMetricsPanelExpanded ? 'max-w-sm' : 'max-w-xs'
                          }`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Onboarding Assistant - Modal overlay */}
                  <AIOnboardingAssistant
                    isVisible={showOnboarding}
                    onClose={() => setShowOnboarding(false)}
                    onStepComplete={handleOnboardingStepComplete}
                    onComplete={handleOnboardingComplete}
                  />

                  {/* Idle Detection - System-wide */}
                  <IdleDetection
                    idleTimeout={2 * 60 * 1000} // 2 minutes idle timeout
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
