'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================
interface SystemConfig {
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    ai: boolean;
    realtime: boolean;
    analytics: boolean;
    telemetry: boolean;
    [key: string]: boolean; // Allow dynamic features
  };
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primary: string;
    accent: string;
  };
  featureFlags?: {
    remoteConfig?: boolean;
    configUrl?: string;
    refreshInterval?: number; // in minutes
  };
}

interface SystemState {
  isBooted: boolean;
  isReady: boolean;
  bootProgress: number;
  currentPhase: string;
  errors: SystemError[];
  warnings: SystemWarning[];
  performance: {
    bootTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  session: {
    id: string;
    startTime: Date;
    tenantId?: string;
    userId?: string;
  };
}

interface SystemError {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  component: string;
  timestamp: Date;
  stack?: string;
  resolved: boolean;
}

interface SystemWarning {
  id: string;
  message: string;
  component: string;
  timestamp: Date;
  dismissed: boolean;
}

interface TelemetryEvent {
  event: string;
  timestamp: Date;
  data: Record<string, any>;
  sessionId: string;
}

interface SystemCoreContextType {
  config: SystemConfig;
  state: SystemState;
  boot: () => Promise<void>;
  shutdown: () => Promise<void>;
  reportError: (error: Omit<SystemError, 'id' | 'timestamp' | 'resolved'>) => void;
  reportWarning: (warning: Omit<SystemWarning, 'id' | 'timestamp' | 'dismissed'>) => void;
  trackEvent: (event: string, data?: Record<string, any>) => void;
  getPerformanceMetrics: () => SystemState['performance'];
  isFeatureEnabled: (feature: string) => boolean;
  toggleFeature: (feature: string, enabled: boolean) => void;
}

// ==================== CONSTANTS ====================
const BOOT_PHASES = [
  'Initializing Core',
  'Loading Configuration',
  'Establishing Connections',
  'Initializing Providers',
  'Loading UI Components',
  'Preparing Workspace',
  'System Ready'
];

const DEFAULT_CONFIG: SystemConfig = {
  version: '1.0.0',
  buildNumber: '2024.1.0',
  environment: 'development',
  features: {
    ai: true,
    realtime: true,
    analytics: true,
    telemetry: true
  },
  theme: {
    mode: 'auto',
    primary: '#3B82F6',
    accent: '#10B981'
  }
};

// ==================== CONTEXT ====================
const SystemCoreContext = createContext<SystemCoreContextType | undefined>(undefined);

export const useSystemCore = () => {
  const context = useContext(SystemCoreContext);
  if (!context) {
    throw new Error('useSystemCore must be used within SystemCoreProvider');
  }
  return context;
};

// ==================== UTILITIES ====================
class PerformanceMonitor {
  private startTime: number;
  private metrics: Map<string, number> = new Map();

  constructor() {
    this.startTime = performance.now();
  }

  mark(name: string) {
    this.metrics.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark: string) {
    const start = this.metrics.get(startMark);
    const end = this.metrics.get(endMark);
    if (start && end) {
      return end - start;
    }
    return 0;
  }

  getBootTime() {
    return performance.now() - this.startTime;
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}

class TelemetryService {
  private events: TelemetryEvent[] = [];
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  track(event: string, data: Record<string, any> = {}) {
    const telemetryEvent: TelemetryEvent = {
      event,
      timestamp: new Date(),
      data,
      sessionId: this.sessionId
    };

    this.events.push(telemetryEvent);

    // In production, this would send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Telemetry:', telemetryEvent);
    }
  }

  getEvents() {
    return this.events;
  }
}

// ==================== ERROR BOUNDARY ====================
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class SystemErrorBoundary extends React.Component<
  React.PropsWithChildren<{ onError: (error: SystemError) => void }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ onError: (error: SystemError) => void }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const systemError: SystemError = {
      id: `error-${Date.now()}`,
      type: 'critical',
      message: error.message,
      component: 'SystemCore',
      timestamp: new Date(),
      stack: error.stack,
      resolved: false
    };

    this.props.onError(systemError);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              System Error
            </h1>
            <p className="text-red-600 mb-6">
              Something went wrong with the AI-BOS OS. We&apos;re working to fix this.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==================== BOOT SCREEN ====================
interface BootScreenProps {
  progress: number;
  phase: string;
  onComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ progress, phase, onComplete }) => {
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(onComplete, 500); // Brief pause to show completion
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center text-white">
        {/* Logo Animation */}
        <motion.div
          className="text-8xl mb-8"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🧱
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          AI-BOS OS
        </motion.h1>

        <motion.p
          className="text-xl text-blue-200 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Initializing your workspace...
        </motion.p>

        {/* Progress Bar */}
        <div className="w-80 h-2 bg-blue-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Phase Text */}
        <motion.p
          className="text-sm text-blue-300"
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {phase}
        </motion.p>

        {/* Version Info */}
        <motion.p
          className="text-xs text-blue-400 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Version 1.0.0 • Build 2024.1.0
        </motion.p>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
interface SystemCoreProviderProps {
  children: React.ReactNode;
  config?: Partial<SystemConfig>;
}

export const SystemCoreProvider: React.FC<SystemCoreProviderProps> = ({
  children,
  config: userConfig = {}
}) => {
  const [state, setState] = useState<SystemState>({
    isBooted: false,
    isReady: false,
    bootProgress: 0,
    currentPhase: BOOT_PHASES[0],
    errors: [],
    warnings: [],
    performance: {
      bootTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    },
    session: {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      startTime: new Date()
    }
  });

  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const performanceMonitor = useRef<PerformanceMonitor>();
  const telemetry = useRef<TelemetryService>();

  // Boot sequence
  const boot = useCallback(async () => {
    performanceMonitor.current = new PerformanceMonitor();
    telemetry.current = new TelemetryService(state.session.id);

    performanceMonitor.current.mark('boot-start');
    telemetry.current.track('system_boot_started');

    setState(prev => ({ ...prev, isBooted: true }));

    try {
      // Phase 1: Initialize Core
      await updateBootProgress(0, BOOT_PHASES[0]);
      await simulateBootPhase(500);

      // Phase 2: Load Configuration
      await updateBootProgress(15, BOOT_PHASES[1]);
      await simulateBootPhase(300);

      // Phase 3: Establish Connections
      await updateBootProgress(30, BOOT_PHASES[2]);
      await simulateBootPhase(400);

      // Phase 4: Initialize Providers
      await updateBootProgress(50, BOOT_PHASES[3]);
      await simulateBootPhase(600);

      // Phase 5: Load UI Components
      await updateBootProgress(70, BOOT_PHASES[4]);
      await simulateBootPhase(400);

      // Phase 6: Prepare Workspace
      await updateBootProgress(85, BOOT_PHASES[5]);
      await simulateBootPhase(300);

      // Phase 7: System Ready
      await updateBootProgress(100, BOOT_PHASES[6]);
      await simulateBootPhase(200);

      performanceMonitor.current.mark('boot-complete');
      const bootTime = performanceMonitor.current.getBootTime();

      setState(prev => ({
        ...prev,
        isReady: true,
        performance: {
          ...prev.performance,
          bootTime
        }
      }));

      telemetry.current.track('system_boot_completed', { bootTime });

      // Apply global theme
      applyGlobalTheme(config.theme);

    } catch (error) {
      const systemError: SystemError = {
        id: `boot-error-${Date.now()}`,
        type: 'critical',
        message: error instanceof Error ? error.message : 'Unknown boot error',
        component: 'SystemCore',
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
        resolved: false
      };

      setState(prev => ({
        ...prev,
        errors: [...prev.errors, systemError]
      }));

      telemetry.current?.track('system_boot_failed', { error: systemError.message });
    }
  }, [state.session.id, config.theme]);

  const updateBootProgress = async (progress: number, phase: string) => {
    setState(prev => ({
      ...prev,
      bootProgress: progress,
      currentPhase: phase
    }));
  };

  const simulateBootPhase = (duration: number) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const applyGlobalTheme = (theme: SystemConfig['theme']) => {
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--accent-color', theme.accent);

    // Apply theme mode
    if (theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const shutdown = useCallback(async () => {
    telemetry.current?.track('system_shutdown_started');

    setState(prev => ({ ...prev, isReady: false }));

    // Cleanup resources
    await new Promise(resolve => setTimeout(resolve, 100));

    telemetry.current?.track('system_shutdown_completed');
  }, []);

  const reportError = useCallback((error: Omit<SystemError, 'id' | 'timestamp' | 'resolved'>) => {
    const systemError: SystemError = {
      ...error,
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      resolved: false
    };

    setState(prev => ({
      ...prev,
      errors: [...prev.errors, systemError]
    }));

    telemetry.current?.track('system_error_reported', { error: systemError });
  }, []);

  const reportWarning = useCallback((warning: Omit<SystemWarning, 'id' | 'timestamp' | 'dismissed'>) => {
    const systemWarning: SystemWarning = {
      ...warning,
      id: `warning-${Date.now()}`,
      timestamp: new Date(),
      dismissed: false
    };

    setState(prev => ({
      ...prev,
      warnings: [...prev.warnings, systemWarning]
    }));

    telemetry.current?.track('system_warning_reported', { warning: systemWarning });
  }, []);

  const trackEvent = useCallback((event: string, data: Record<string, any> = {}) => {
    telemetry.current?.track(event, data);
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    if (performanceMonitor.current) {
      return {
        bootTime: performanceMonitor.current.getBootTime(),
        memoryUsage: performanceMonitor.current.getMemoryUsage(),
        cpuUsage: 0 // Would need more sophisticated monitoring
      };
    }
    return state.performance;
  }, [state.performance]);

  const isFeatureEnabled = useCallback((feature: string) => {
    return config.features[feature] ?? false;
  }, [config.features]);

  const toggleFeature = useCallback((feature: string, enabled: boolean) => {
    // Update the config directly since it's not part of state
    config.features[feature] = enabled;
    trackEvent('feature_toggled', { feature, enabled });
  }, [config.features, trackEvent]);

  // Auto-boot on mount
  useEffect(() => {
    boot();
  }, [boot]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (performanceMonitor.current) {
        setState(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            memoryUsage: performanceMonitor.current!.getMemoryUsage()
          }
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: SystemCoreContextType = {
    config,
    state,
    boot,
    shutdown,
    reportError,
    reportWarning,
    trackEvent,
    getPerformanceMetrics,
    isFeatureEnabled,
    toggleFeature
  };

  return (
    <SystemCoreContext.Provider value={contextValue}>
      <SystemErrorBoundary onError={reportError}>
        <AnimatePresence mode="wait">
          {!state.isReady && (
            <BootScreen
              progress={state.bootProgress}
              phase={state.currentPhase}
              onComplete={() => setState(prev => ({ ...prev, isReady: true }))}
            />
          )}
        </AnimatePresence>

        {state.isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {state.errors.slice(-3).map(error => (
            <motion.div
              key={error.id}
              className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">System Error</h4>
                  <p className="text-sm">{error.message}</p>
                  <p className="text-xs opacity-80 mt-1">{error.component}</p>
                </div>
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      errors: prev.errors.filter(e => e.id !== error.id)
                    }));
                    trackEvent('error_dismissed', { errorId: error.id });
                  }}
                  className="ml-3 text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </SystemErrorBoundary>
    </SystemCoreContext.Provider>
  );
};

export default SystemCoreProvider;
