'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Activity, Zap, Users, Database, Globe, Lock, Unlock, Eye, EyeOff, Clock } from 'lucide-react';

import { AppManifest, ValidPermission } from './ManifestLoader';

// ==================== TYPES ====================
interface AppRuntimeContextProps {
  manifest: AppManifest;
  tenantId: string;
  userId: string;
  userPermissions: ValidPermission[];
  enableLifecycleManagement?: boolean;
  enableStateManagement?: boolean;
  enableAPIManagement?: boolean;
  enableResourceManagement?: boolean;
  onLifecycleEvent?: (event: LifecycleEvent) => void;
  onStateChange?: (change: StateChange) => void;
  onAPIError?: (error: APIError) => void;
}

interface RuntimeState {
  isRunning: boolean;
  isPaused: boolean;
  currentPhase: 'initializing' | 'running' | 'paused' | 'error' | 'destroyed';
  startTime: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  errorCount: number;
  warningCount: number;
}

interface LifecycleEvent {
  id: string;
  timestamp: Date;
  type: 'mount' | 'unmount' | 'error' | 'warning' | 'state_change' | 'api_call' | 'resource_access';
  message: string;
  data?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface StateChange {
  id: string;
  timestamp: Date;
  component: string;
  property: string;
  oldValue: any;
  newValue: any;
  trigger: string;
}

interface APIError {
  id: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  status: number;
  message: string;
  retryCount: number;
  resolved: boolean;
}

interface ResourceUsage {
  memory: {
    used: number;
    allocated: number;
    peak: number;
  };
  cpu: {
    usage: number;
    cores: number;
    load: number;
  };
  network: {
    requests: number;
    bytesSent: number;
    bytesReceived: number;
    latency: number;
  };
  storage: {
    used: number;
    available: number;
    quota: number;
  };
}

// ==================== RUNTIME CONTEXT ====================
interface AppRuntimeContextValue {
  // State
  runtimeState: RuntimeState;
  resourceUsage: ResourceUsage;
  lifecycleEvents: LifecycleEvent[];
  stateChanges: StateChange[];
  apiErrors: APIError[];

  // Methods
  startRuntime: () => void;
  pauseRuntime: () => void;
  resumeRuntime: () => void;
  stopRuntime: () => void;
  resetRuntime: () => void;

  // Lifecycle Management
  triggerLifecycleEvent: (event: Omit<LifecycleEvent, 'id' | 'timestamp'>) => void;
  recordStateChange: (change: Omit<StateChange, 'id' | 'timestamp'>) => void;
  recordAPIError: (error: Omit<APIError, 'id' | 'timestamp'>) => void;

  // Resource Management
  allocateMemory: (bytes: number) => boolean;
  releaseMemory: (bytes: number) => void;
  checkResourceLimits: () => boolean;

  // API Management
  makeAPICall: (endpoint: string, options?: any) => Promise<any>;
  retryFailedCalls: () => void;

  // Utilities
  getRuntimeMetrics: () => Record<string, any>;
  exportRuntimeData: () => Record<string, any>;
}

const AppRuntimeContext = createContext<AppRuntimeContextValue | null>(null);

// ==================== APP RUNTIME CONTEXT COMPONENT ====================
export const AppRuntimeContextProvider: React.FC<AppRuntimeContextProps> = ({
  manifest,
  tenantId,
  userId,
  userPermissions,
  enableLifecycleManagement = true,
  enableStateManagement = true,
  enableAPIManagement = true,
  enableResourceManagement = true,
  onLifecycleEvent,
  onStateChange,
  onAPIError
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [runtimeState, setRuntimeState] = useState<RuntimeState>({
    isRunning: false,
    isPaused: false,
    currentPhase: 'initializing',
    startTime: 0,
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    errorCount: 0,
    warningCount: 0
  });

  const [resourceUsage, setResourceUsage] = useState<ResourceUsage>({
    memory: { used: 0, allocated: 0, peak: 0 },
    cpu: { usage: 0, cores: navigator.hardwareConcurrency || 4, load: 0 },
    network: { requests: 0, bytesSent: 0, bytesReceived: 0, latency: 0 },
    storage: { used: 0, available: 0, quota: 0 }
  });

  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [stateChanges, setStateChanges] = useState<StateChange[]>([]);
  const [apiErrors, setApiErrors] = useState<APIError[]>([]);

  const [showMetrics, setShowMetrics] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showResources, setShowResources] = useState(false);

  const runtimeRef = useRef<NodeJS.Timeout | null>(null);
  const metricsRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // ==================== RUNTIME CONTROL ====================
  const startRuntime = useCallback(() => {
    setRuntimeState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      currentPhase: 'running',
      startTime: Date.now(),
      errorCount: 0,
      warningCount: 0
    }));

    startTimeRef.current = Date.now();

    // Start metrics monitoring
    if (enableResourceManagement) {
      metricsRef.current = setInterval(() => {
        setRuntimeState(prev => ({
          ...prev,
          uptime: Date.now() - startTimeRef.current,
          memoryUsage: Math.random() * 100 + 50,
          cpuUsage: Math.random() * 30 + 10,
          activeConnections: Math.floor(Math.random() * 10) + 1
        }));

        setResourceUsage(prev => ({
          ...prev,
          memory: {
            ...prev.memory,
            used: Math.random() * 500 + 100,
            peak: Math.max(prev.memory.peak, Math.random() * 500 + 100)
          },
          cpu: {
            ...prev.cpu,
            usage: Math.random() * 100,
            load: Math.random() * 10
          },
          network: {
            ...prev.network,
            requests: prev.network.requests + Math.floor(Math.random() * 5) + 1,
            latency: Math.random() * 200 + 20
          }
        }));
      }, 1000);
    }

    // Trigger mount event
    if (enableLifecycleManagement) {
      triggerLifecycleEvent({
        type: 'mount',
        message: `App ${manifest.app_id} mounted successfully`,
        severity: 'info',
        data: { appId: manifest.app_id, tenantId, userId }
      });
    }
  }, [manifest.app_id, tenantId, userId, enableLifecycleManagement, enableResourceManagement]);

  const pauseRuntime = useCallback(() => {
    setRuntimeState(prev => ({
      ...prev,
      isPaused: true,
      currentPhase: 'paused'
    }));

    if (metricsRef.current) {
      clearInterval(metricsRef.current);
      metricsRef.current = null;
    }

    if (enableLifecycleManagement) {
      triggerLifecycleEvent({
        type: 'warning',
        message: `App ${manifest.app_id} paused`,
        severity: 'warning',
        data: { appId: manifest.app_id, uptime: runtimeState.uptime }
      });
    }
  }, [manifest.app_id, runtimeState.uptime, enableLifecycleManagement]);

  const resumeRuntime = useCallback(() => {
    setRuntimeState(prev => ({
      ...prev,
      isPaused: false,
      currentPhase: 'running'
    }));

    // Restart metrics monitoring
    if (enableResourceManagement) {
      startRuntime();
    }

    if (enableLifecycleManagement) {
      triggerLifecycleEvent({
        type: 'state_change',
        message: `App ${manifest.app_id} resumed`,
        severity: 'info',
        data: { appId: manifest.app_id }
      });
    }
  }, [manifest.app_id, enableLifecycleManagement, enableResourceManagement, startRuntime]);

  const stopRuntime = useCallback(() => {
    setRuntimeState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentPhase: 'destroyed'
    }));

    if (runtimeRef.current) {
      clearInterval(runtimeRef.current);
      runtimeRef.current = null;
    }

    if (metricsRef.current) {
      clearInterval(metricsRef.current);
      metricsRef.current = null;
    }

    if (enableLifecycleManagement) {
      triggerLifecycleEvent({
        type: 'unmount',
        message: `App ${manifest.app_id} stopped`,
        severity: 'info',
        data: { appId: manifest.app_id, uptime: runtimeState.uptime }
      });
    }
  }, [manifest.app_id, runtimeState.uptime, enableLifecycleManagement]);

  const resetRuntime = useCallback(() => {
    stopRuntime();
    setLifecycleEvents([]);
    setStateChanges([]);
    setApiErrors([]);
    setResourceUsage({
      memory: { used: 0, allocated: 0, peak: 0 },
      cpu: { usage: 0, cores: navigator.hardwareConcurrency || 4, load: 0 },
      network: { requests: 0, bytesSent: 0, bytesReceived: 0, latency: 0 },
      storage: { used: 0, available: 0, quota: 0 }
    });
  }, [stopRuntime]);

  // ==================== LIFECYCLE MANAGEMENT ====================
  const triggerLifecycleEvent = useCallback((event: Omit<LifecycleEvent, 'id' | 'timestamp'>) => {
    const lifecycleEvent: LifecycleEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    setLifecycleEvents(prev => [...prev, lifecycleEvent]);
    onLifecycleEvent?.(lifecycleEvent);

    // Update error/warning counts
    if (event.severity === 'error' || event.severity === 'critical') {
      setRuntimeState(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    } else if (event.severity === 'warning') {
      setRuntimeState(prev => ({ ...prev, warningCount: prev.warningCount + 1 }));
    }
  }, [onLifecycleEvent]);

  const recordStateChange = useCallback((change: Omit<StateChange, 'id' | 'timestamp'>) => {
    const stateChange: StateChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...change
    };

    setStateChanges(prev => [...prev, stateChange]);
    onStateChange?.(stateChange);
  }, [onStateChange]);

  const recordAPIError = useCallback((error: Omit<APIError, 'id' | 'timestamp'>) => {
    const apiError: APIError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...error
    };

    setApiErrors(prev => [...prev, apiError]);
    onAPIError?.(apiError);

    // Trigger lifecycle event
    triggerLifecycleEvent({
      type: 'error',
      message: `API Error: ${error.message}`,
      severity: 'error',
      data: { endpoint: error.endpoint, status: error.status }
    });
  }, [onAPIError, triggerLifecycleEvent]);

  // ==================== RESOURCE MANAGEMENT ====================
  const allocateMemory = useCallback((bytes: number): boolean => {
    const newUsed = resourceUsage.memory.used + bytes;
    const maxMemory = 1024 * 1024 * 100; // 100MB limit

    if (newUsed > maxMemory) {
      triggerLifecycleEvent({
        type: 'error',
        message: `Memory allocation failed: ${bytes} bytes requested`,
        severity: 'error',
        data: { requested: bytes, available: maxMemory - resourceUsage.memory.used }
      });
      return false;
    }

    setResourceUsage(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        used: newUsed,
        peak: Math.max(prev.memory.peak, newUsed)
      }
    }));

    return true;
  }, [resourceUsage.memory.used, triggerLifecycleEvent]);

  const releaseMemory = useCallback((bytes: number) => {
    setResourceUsage(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        used: Math.max(0, prev.memory.used - bytes)
      }
    }));
  }, []);

  const checkResourceLimits = useCallback((): boolean => {
    const memoryLimit = 1024 * 1024 * 100; // 100MB
    const cpuLimit = 80; // 80% CPU usage

    if (resourceUsage.memory.used > memoryLimit) {
      triggerLifecycleEvent({
        type: 'warning',
        message: 'Memory usage exceeded limits',
        severity: 'warning',
        data: { used: resourceUsage.memory.used, limit: memoryLimit }
      });
      return false;
    }

    if (resourceUsage.cpu.usage > cpuLimit) {
      triggerLifecycleEvent({
        type: 'warning',
        message: 'CPU usage exceeded limits',
        severity: 'warning',
        data: { used: resourceUsage.cpu.usage, limit: cpuLimit }
      });
      return false;
    }

    return true;
  }, [resourceUsage.memory.used, resourceUsage.cpu.usage, triggerLifecycleEvent]);

  // ==================== API MANAGEMENT ====================
  const makeAPICall = useCallback(async (endpoint: string, options: any = {}): Promise<any> => {
    try {
      // Simulate API call
      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update network metrics
      setResourceUsage(prev => ({
        ...prev,
        network: {
          ...prev.network,
          requests: prev.network.requests + 1,
          bytesReceived: prev.network.bytesReceived + JSON.stringify(data).length
        }
      }));

      return data;
    } catch (error) {
      const apiError: Omit<APIError, 'id' | 'timestamp'> = {
        endpoint,
        method: options.method || 'GET',
        status: 500,
        message: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        resolved: false
      };

      recordAPIError(apiError);
      throw error;
    }
  }, [recordAPIError]);

  const retryFailedCalls = useCallback(() => {
    const failedCalls = apiErrors.filter(error => !error.resolved && error.retryCount < 3);

    failedCalls.forEach(error => {
      // Simulate retry
      if (Math.random() > 0.5) { // 50% success rate
        setApiErrors(prev => prev.map(e =>
          e.id === error.id ? { ...e, resolved: true, retryCount: e.retryCount + 1 } : e
        ));
      } else {
        setApiErrors(prev => prev.map(e =>
          e.id === error.id ? { ...e, retryCount: e.retryCount + 1 } : e
        ));
      }
    });
  }, [apiErrors]);

  // ==================== UTILITIES ====================
  const getRuntimeMetrics = useCallback((): Record<string, any> => {
    return {
      uptime: runtimeState.uptime,
      memoryUsage: resourceUsage.memory.used,
      cpuUsage: resourceUsage.cpu.usage,
      activeConnections: runtimeState.activeConnections,
      errorCount: runtimeState.errorCount,
      warningCount: runtimeState.warningCount,
      networkRequests: resourceUsage.network.requests,
      apiErrors: apiErrors.length
    };
  }, [runtimeState, resourceUsage, apiErrors]);

  const exportRuntimeData = useCallback((): Record<string, any> => {
    return {
      manifest,
      runtimeState,
      resourceUsage,
      lifecycleEvents: lifecycleEvents.slice(-100), // Last 100 events
      stateChanges: stateChanges.slice(-100), // Last 100 changes
      apiErrors: apiErrors.slice(-50), // Last 50 errors
      metrics: getRuntimeMetrics(),
      exportTime: new Date().toISOString()
    };
  }, [manifest, runtimeState, resourceUsage, lifecycleEvents, stateChanges, apiErrors, getRuntimeMetrics]);

  // ==================== CONTEXT VALUE ====================
  const contextValue: AppRuntimeContextValue = {
    // State
    runtimeState,
    resourceUsage,
    lifecycleEvents,
    stateChanges,
    apiErrors,

    // Methods
    startRuntime,
    pauseRuntime,
    resumeRuntime,
    stopRuntime,
    resetRuntime,

    // Lifecycle Management
    triggerLifecycleEvent,
    recordStateChange,
    recordAPIError,

    // Resource Management
    allocateMemory,
    releaseMemory,
    checkResourceLimits,

    // API Management
    makeAPICall,
    retryFailedCalls,

    // Utilities
    getRuntimeMetrics,
    exportRuntimeData
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Auto-start runtime
    startRuntime();

    return () => {
      stopRuntime();
    };
  }, [startRuntime, stopRuntime]);

  // ==================== RENDER ====================
  return (
    <AppRuntimeContext.Provider value={contextValue}>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* ==================== TOOLBAR ==================== */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">App Runtime Context</h2>

            {/* Runtime Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                runtimeState.currentPhase === 'running' ? 'bg-green-500' :
                runtimeState.currentPhase === 'paused' ? 'bg-yellow-500' :
                runtimeState.currentPhase === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {runtimeState.currentPhase}
              </span>
            </div>

            {/* Uptime */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Uptime: {Math.floor(runtimeState.uptime / 1000)}s
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Runtime Controls */}
            <div className="flex items-center space-x-2">
              {!runtimeState.isRunning ? (
                <button
                  onClick={startRuntime}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </button>
              ) : runtimeState.isPaused ? (
                <button
                  onClick={resumeRuntime}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={pauseRuntime}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </button>
              )}

              <button
                onClick={stopRuntime}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Stop
              </button>

              <button
                onClick={resetRuntime}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>

            {/* Panel Toggles */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`p-2 rounded ${showMetrics ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowEvents(!showEvents)}
                className={`p-2 rounded ${showEvents ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowResources(!showResources)}
                className={`p-2 rounded ${showResources ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== MAIN CONTENT ==================== */}
        <div className="flex-1 flex">
          {/* ==================== RUNTIME OVERVIEW ==================== */}
          <div className="flex-1 p-4">
            {/* Runtime Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.floor(runtimeState.uptime / 1000)}s
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {resourceUsage.memory.used.toFixed(1)}MB
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Memory</div>
                  </div>
                  <Database className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {resourceUsage.cpu.usage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">CPU</div>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {resourceUsage.network.requests}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Requests</div>
                  </div>
                  <Globe className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Runtime Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Runtime Performance</h3>
              <div className="h-64 flex items-end justify-center space-x-2">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="w-4 bg-blue-500 rounded-t"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ==================== SIDEBAR PANELS ==================== */}
          <div className="w-80 flex flex-col space-y-4 p-4">
            {/* Metrics Panel */}
            <AnimatePresence>
              {showMetrics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Runtime Metrics</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Errors</span>
                      <span className="text-sm font-medium">{runtimeState.errorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Warnings</span>
                      <span className="text-sm font-medium">{runtimeState.warningCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
                      <span className="text-sm font-medium">{runtimeState.activeConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">API Errors</span>
                      <span className="text-sm font-medium">{apiErrors.length}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Events Panel */}
            <AnimatePresence>
              {showEvents && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lifecycle Events</h3>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {lifecycleEvents.slice(-5).map((event) => (
                        <div key={event.id} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          <div className="font-medium text-blue-600 dark:text-blue-400">{event.type}</div>
                          <div className="text-blue-500 dark:text-blue-300">{event.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {event.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resources Panel */}
            <AnimatePresence>
              {showResources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Usage</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Memory</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(resourceUsage.memory.used / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPU</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${resourceUsage.cpu.usage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network</div>
                      <div className="text-sm font-medium">{resourceUsage.network.latency.toFixed(0)}ms latency</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppRuntimeContext.Provider>
  );
};

// ==================== HOOK ====================
export const useAppRuntime = (): AppRuntimeContextValue => {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error('useAppRuntime must be used within AppRuntimeContextProvider');
  }
  return context;
};

export default AppRuntimeContextProvider;
