'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Maximize, Minimize, AlertTriangle, CheckCircle, XCircle, Eye, Code, Zap, Shield } from 'lucide-react';

import { AppManifest } from './ManifestLoader';
import { AppContainer } from './AppContainer';

// ==================== TYPES ====================
interface LiveSimulatorProps {
  manifest: AppManifest;
  mockData?: Record<string, any>;
  enableValidation?: boolean;
  enablePerformance?: boolean;
  enableSecurity?: boolean;
  onValidationResult?: (result: ValidationResult) => void;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  onSecurityAlert?: (alert: SecurityAlert) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  score: number; // 0-100
}

interface ValidationError {
  type: 'critical' | 'error' | 'warning';
  message: string;
  field?: string;
  line?: number;
  code?: string;
}

interface ValidationWarning {
  type: 'performance' | 'accessibility' | 'security' | 'best_practice';
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface PerformanceAlert {
  type: 'slow_render' | 'high_memory' | 'api_timeout' | 'bundle_size';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface SecurityAlert {
  type: 'permission_violation' | 'unsafe_api_call' | 'data_exposure' | 'xss_risk';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: Record<string, any>;
}

interface SimulatorState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  performanceMetrics: {
    renderTime: number;
    memoryUsage: number;
    apiCalls: number;
    bundleSize: number;
  };
  securityEvents: SecurityAlert[];
  testResults: {
    passed: number;
    failed: number;
    total: number;
  };
}

// ==================== LIVE SIMULATOR COMPONENT ====================
export const LiveSimulator: React.FC<LiveSimulatorProps> = ({
  manifest,
  mockData = {},
  enableValidation = true,
  enablePerformance = true,
  enableSecurity = true,
  onValidationResult,
  onPerformanceAlert,
  onSecurityAlert
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<SimulatorState>({
    isRunning: false,
    isPaused: false,
    currentTime: 0,
    errors: [],
    warnings: [],
    performanceMetrics: {
      renderTime: 0,
      memoryUsage: 0,
      apiCalls: 0,
      bundleSize: 0
    },
    securityEvents: [],
    testResults: {
      passed: 0,
      failed: 0,
      total: 0
    }
  });

  const [showConsole, setShowConsole] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(1);

  const simulatorRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const performanceRef = useRef<{ startTime: number }>({ startTime: 0 });

  // ==================== VALIDATION ENGINE ====================
  const validateManifest = useCallback(async (): Promise<ValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    // Validate required fields
    if (!manifest.app_id) {
      errors.push({
        type: 'critical',
        message: 'Missing app_id',
        field: 'app_id'
      });
      score -= 20;
    }

    if (!manifest.name) {
      errors.push({
        type: 'error',
        message: 'Missing app name',
        field: 'name'
      });
      score -= 10;
    }

    if (!manifest.permissions || manifest.permissions.length === 0) {
      warnings.push({
        type: 'security',
        message: 'No permissions defined',
        severity: 'medium',
        suggestion: 'Consider adding appropriate permissions for security'
      });
      score -= 5;
    }

    // Validate security settings
    if (manifest.security?.sandboxed === false) {
      warnings.push({
        type: 'security',
        message: 'App is not sandboxed',
        severity: 'high',
        suggestion: 'Enable sandboxing for better security isolation'
      });
      score -= 15;
    }

    // Validate performance
    if (manifest.security?.maxMemory && manifest.security.maxMemory > 100) {
      warnings.push({
        type: 'performance',
        message: 'High memory limit detected',
        severity: 'medium',
        suggestion: 'Consider reducing memory limit for better performance'
      });
      score -= 5;
    }

    // Validate dependencies
    if (manifest.dependencies && manifest.dependencies.length > 10) {
      warnings.push({
        type: 'performance',
        message: 'Many dependencies detected',
        severity: 'low',
        suggestion: 'Consider reducing dependencies to improve load time'
      });
      score -= 3;
    }

    const result: ValidationResult = {
      isValid: errors.filter(e => e.type === 'critical').length === 0,
      errors,
      warnings,
      suggestions: [
        'Add comprehensive error handling',
        'Implement proper loading states',
        'Add accessibility features',
        'Consider implementing caching strategies'
      ],
      score: Math.max(0, score)
    };

    setState(prev => ({
      ...prev,
      errors,
      warnings
    }));

    onValidationResult?.(result);
    return result;
  }, [manifest, onValidationResult]);

  // ==================== PERFORMANCE MONITORING ====================
  const monitorPerformance = useCallback(() => {
    const startTime = performance.now();
    performanceRef.current.startTime = startTime;

    // Simulate performance monitoring
    const renderTime = Math.random() * 100 + 10;
    const memoryUsage = Math.random() * 500 + 50;
    const apiCalls = Math.floor(Math.random() * 20);
    const bundleSize = Math.random() * 1000 + 100;

    setState(prev => ({
      ...prev,
      performanceMetrics: {
        renderTime,
        memoryUsage,
        apiCalls,
        bundleSize
      }
    }));

    // Check for performance alerts
    if (renderTime > 50) {
      const alert: PerformanceAlert = {
        type: 'slow_render',
        message: `Slow render detected: ${renderTime.toFixed(2)}ms`,
        value: renderTime,
        threshold: 50,
        timestamp: new Date()
      };
      onPerformanceAlert?.(alert);
    }

    if (memoryUsage > 300) {
      const alert: PerformanceAlert = {
        type: 'high_memory',
        message: `High memory usage: ${memoryUsage.toFixed(2)}MB`,
        value: memoryUsage,
        threshold: 300,
        timestamp: new Date()
      };
      onPerformanceAlert?.(alert);
    }
  }, [onPerformanceAlert]);

  // ==================== SECURITY MONITORING ====================
  const monitorSecurity = useCallback(() => {
    // Simulate security monitoring
    const securityChecks = [
      {
        type: 'permission_violation' as const,
        message: 'Attempted access to unauthorized resource',
        severity: 'high' as const,
        details: { resource: 'user_data', permission: 'read.users' }
      },
      {
        type: 'unsafe_api_call' as const,
        message: 'API call to untrusted domain detected',
        severity: 'medium' as const,
        details: { domain: 'untrusted.com', endpoint: '/api/data' }
      }
    ];

    // Randomly trigger security alerts
    if (Math.random() < 0.1) {
      const alert = securityChecks[Math.floor(Math.random() * securityChecks.length)];
      if (alert) {
        const securityAlert: SecurityAlert = {
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          timestamp: new Date(),
          details: alert.details
        };

        setState(prev => ({
          ...prev,
          securityEvents: [...prev.securityEvents, securityAlert]
        }));

        onSecurityAlert?.(securityAlert);
      }
    }
  }, [onSecurityAlert]);

  // ==================== SIMULATION CONTROL ====================
  const startSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));

    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentTime: prev.currentTime + 1
      }));

      if (enablePerformance) {
        monitorPerformance();
      }

      if (enableSecurity) {
        monitorSecurity();
      }
    }, 1000);
  }, [enablePerformance, enableSecurity, monitorPerformance, monitorSecurity]);

  const pauseSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startSimulation();
  }, [startSimulation]);

  const stopSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentTime: 0
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setState(prev => ({
      ...prev,
      errors: [],
      warnings: [],
      securityEvents: [],
      testResults: { passed: 0, failed: 0, total: 0 }
    }));
  }, [stopSimulation]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (enableValidation) {
      validateManifest();
    }
  }, [manifest, enableValidation, validateManifest]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Simulator</h2>

          {/* Simulation Controls */}
          <div className="flex items-center space-x-2">
            {!state.isRunning ? (
              <button
                onClick={startSimulation}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                <span>Start</span>
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeSimulation}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={stopSimulation}
              className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle className="w-4 h-4" />
              <span>Stop</span>
            </button>

            <button
              onClick={resetSimulation}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Simulation Time */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Time: {Math.floor(state.currentTime / 60)}:{(state.currentTime % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Preview Mode */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Minimize className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Minimize className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              -
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              +
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`p-2 rounded ${showConsole ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className={`p-2 rounded ${showPerformance ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              className={`p-2 rounded ${showSecurity ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== PREVIEW AREA ==================== */}
        <div className="flex-1 p-4">
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {manifest.name} - Live Preview
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{previewMode}</span>
                  <span>•</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 h-full overflow-auto">
              <div
                ref={simulatorRef}
                className="mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg"
                style={{
                  width: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center'
                }}
              >
                <AppContainer
                  manifest={manifest}
                  options={{
                    enableDevtools: true,
                    timeout: 10000,
                    strictCSP: true
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Validation Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validation</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                {state.errors.length === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {state.errors.length} errors, {state.warnings.length} warnings
                </span>
              </div>

              {state.errors.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Errors</h4>
                  {state.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {error.message}
                    </div>
                  ))}
                </div>
              )}

              {state.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warnings</h4>
                  {state.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      {warning.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Panel */}
          <AnimatePresence>
            {showPerformance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Render Time</span>
                    <span className="text-sm font-medium">{state.performanceMetrics.renderTime.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="text-sm font-medium">{state.performanceMetrics.memoryUsage.toFixed(2)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Calls</span>
                    <span className="text-sm font-medium">{state.performanceMetrics.apiCalls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bundle Size</span>
                    <span className="text-sm font-medium">{state.performanceMetrics.bundleSize.toFixed(2)}KB</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Panel */}
          <AnimatePresence>
            {showSecurity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {state.securityEvents.length} security events detected
                  </div>
                  <div className="space-y-2">
                    {state.securityEvents.slice(-5).map((event, index) => (
                      <div key={index} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400">{event.type}</div>
                        <div className="text-red-500 dark:text-red-300">{event.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==================== CONSOLE PANEL ==================== */}
      <AnimatePresence>
        {showConsole && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '200px' }}
            exit={{ height: 0 }}
            className="bg-gray-900 text-green-400 border-t border-gray-700"
          >
            <div className="p-4 h-full overflow-auto font-mono text-sm">
              <div>[{new Date().toISOString()}] Live Simulator started</div>
              <div>[{new Date().toISOString()}] Loading manifest: {manifest.app_id}</div>
              <div>[{new Date().toISOString()}] Validation completed: {state.errors.length} errors</div>
              <div>[{new Date().toISOString()}] Performance monitoring active</div>
              <div>[{new Date().toISOString()}] Security monitoring active</div>
              {state.isRunning && (
                <div>[{new Date().toISOString()}] Simulation running... Time: {state.currentTime}s</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSimulator;
