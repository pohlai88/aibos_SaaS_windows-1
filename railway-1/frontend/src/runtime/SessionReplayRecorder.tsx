'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Play, Pause, RotateCcw, Download, Share, Settings, Eye, Clock, MousePointer, Keyboard, Globe, Database, Shield, Zap } from 'lucide-react';

// ==================== TYPES ====================
interface SessionReplayRecorderProps {
  tenantId: string;
  userId: string;
  enableRecording?: boolean;
  enableNetworkCapture?: boolean;
  enableDOMCapture?: boolean;
  enableUserInteractions?: boolean;
  onRecordingComplete?: (session: SessionRecording) => void;
  onRecordingError?: (error: RecordingError) => void;
  onPrivacyViolation?: (violation: PrivacyViolation) => void;
}

interface SessionRecording {
  id: string;
  sessionId: string;
  userId: string;
  tenantId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  events: RecordingEvent[];
  metadata: {
    userAgent: string;
    screenResolution: string;
    viewport: { width: number; height: number };
    url: string;
    title: string;
    privacyLevel: 'low' | 'medium' | 'high';
    dataRetention: number; // days
  };
  analytics: {
    totalEvents: number;
    userInteractions: number;
    networkRequests: number;
    domChanges: number;
    errors: number;
    performance: {
      averageEventInterval: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
}

interface RecordingEvent {
  id: string;
  timestamp: number;
  type: RecordingEventType;
  data: Record<string, any>;
  privacy: {
    sensitive: boolean;
    masked: boolean;
    redacted: boolean;
  };
}

type RecordingEventType =
  | 'dom_change'
  | 'user_click'
  | 'user_input'
  | 'user_scroll'
  | 'user_navigation'
  | 'network_request'
  | 'network_response'
  | 'error'
  | 'performance'
  | 'custom';

interface RecordingError {
  id: string;
  timestamp: Date;
  type: 'permission_denied' | 'storage_full' | 'network_error' | 'privacy_violation';
  message: string;
  details: Record<string, any>;
  recoverable: boolean;
}

interface PrivacyViolation {
  id: string;
  timestamp: Date;
  type: 'sensitive_data' | 'unauthorized_capture' | 'retention_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  data: Record<string, any>;
  action: 'mask' | 'redact' | 'stop_recording' | 'alert';
}

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  currentSession: SessionRecording | null;
  events: RecordingEvent[];
  errors: RecordingError[];
  violations: PrivacyViolation[];
  metrics: {
    totalSessions: number;
    totalEvents: number;
    totalDuration: number;
    averageSessionLength: number;
    errorRate: number;
    privacyViolations: number;
  };
  settings: {
    privacyLevel: 'low' | 'medium' | 'high';
    maxSessionDuration: number; // minutes
    maxEventsPerSession: number;
    enableNetworkCapture: boolean;
    enableDOMCapture: boolean;
    enableUserInteractions: boolean;
    dataRetention: number; // days
  };
}

// ==================== SESSION REPLAY RECORDER COMPONENT ====================
export const SessionReplayRecorder: React.FC<SessionReplayRecorderProps> = ({
  tenantId,
  userId,
  enableRecording = true,
  enableNetworkCapture = true,
  enableDOMCapture = true,
  enableUserInteractions = true,
  onRecordingComplete,
  onRecordingError,
  onPrivacyViolation
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    currentSession: null,
    events: [],
    errors: [],
    violations: [],
    metrics: {
      totalSessions: 0,
      totalEvents: 0,
      totalDuration: 0,
      averageSessionLength: 0,
      errorRate: 0,
      privacyViolations: 0
    },
    settings: {
      privacyLevel: 'medium',
      maxSessionDuration: 30,
      maxEventsPerSession: 10000,
      enableNetworkCapture,
      enableDOMCapture,
      enableUserInteractions,
      dataRetention: 30
    }
  });

  const [showReplay, setShowReplay] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRecording | null>(null);

  const recorderRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number>(0);
  const eventBuffer = useRef<RecordingEvent[]>([]);

  // ==================== RECORDING CONTROL ====================
  const startRecording = useCallback(() => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStartTime.current = Date.now();

    const session: SessionRecording = {
      id: `recording-${Date.now()}`,
      sessionId,
      userId,
      tenantId,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      events: [],
      metadata: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        url: window.location.href,
        title: document.title,
        privacyLevel: state.settings.privacyLevel,
        dataRetention: state.settings.dataRetention
      },
      analytics: {
        totalEvents: 0,
        userInteractions: 0,
        networkRequests: 0,
        domChanges: 0,
        errors: 0,
        performance: {
          averageEventInterval: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      }
    };

    setState(prev => ({
      ...prev,
      isRecording: true,
      isPaused: false,
      currentSession: session,
      events: []
    }));

    // Start event capture
    if (enableUserInteractions) {
      setupUserInteractionCapture();
    }

    if (enableDOMCapture) {
      setupDOMCapture();
    }

    if (enableNetworkCapture) {
      setupNetworkCapture();
    }

    // Start recording timer
    recorderRef.current = setInterval(() => {
      updateSessionMetrics();
    }, 1000);
  }, [tenantId, userId, enableUserInteractions, enableDOMCapture, enableNetworkCapture, state.settings]);

  const pauseRecording = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (recorderRef.current) {
      clearInterval(recorderRef.current);
      recorderRef.current = null;
    }
  }, []);

  const resumeRecording = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    recorderRef.current = setInterval(() => {
      updateSessionMetrics();
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (!state.currentSession) return;

    const endTime = Date.now();
    const duration = endTime - sessionStartTime.current;

    const completedSession: SessionRecording = {
      ...state.currentSession,
      endTime: new Date(),
      duration,
      events: state.events,
      analytics: calculateSessionAnalytics(state.events, duration)
    };

    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      currentSession: null,
      metrics: {
        ...prev.metrics,
        totalSessions: prev.metrics.totalSessions + 1,
        totalEvents: prev.metrics.totalEvents + state.events.length,
        totalDuration: prev.metrics.totalDuration + duration,
        averageSessionLength: (prev.metrics.totalDuration + duration) / (prev.metrics.totalSessions + 1)
      }
    }));

    if (recorderRef.current) {
      clearInterval(recorderRef.current);
      recorderRef.current = null;
    }

    onRecordingComplete?.(completedSession);
  }, [state.currentSession, state.events, onRecordingComplete]);

  // ==================== EVENT CAPTURE ====================
  const setupUserInteractionCapture = useCallback(() => {
    // Click events
    document.addEventListener('click', (event) => {
      captureEvent('user_click', {
        x: event.clientX,
        y: event.clientY,
        target: event.target,
        timestamp: event.timeStamp
      });
    });

    // Input events
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      captureEvent('user_input', {
        type: target.type,
        name: target.name,
        value: maskSensitiveData(target.value, target.type),
        target: target
      });
    });

    // Scroll events
    document.addEventListener('scroll', (event) => {
      captureEvent('user_scroll', {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        target: event.target
      });
    });

    // Navigation events
    window.addEventListener('popstate', (event) => {
      captureEvent('user_navigation', {
        url: window.location.href,
        title: document.title,
        state: event.state
      });
    });
  }, []);

  const setupDOMCapture = useCallback(() => {
    // Use MutationObserver to capture DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        captureEvent('dom_change', {
          type: mutation.type,
          target: mutation.target,
          addedNodes: Array.from(mutation.addedNodes).map(node => ({
            nodeType: node.nodeType,
            nodeName: node.nodeName
          })),
          removedNodes: Array.from(mutation.removedNodes).map(node => ({
            nodeType: node.nodeType,
            nodeName: node.nodeName
          })),
          attributeName: mutation.attributeName,
          oldValue: mutation.oldValue
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });
  }, []);

  const setupNetworkCapture = useCallback(() => {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();

      captureEvent('network_request', {
        url: args[0],
        method: args[1]?.method || 'GET',
        headers: args[1]?.headers,
        body: args[1]?.body
      });

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        captureEvent('network_response', {
          url: args[0],
          status: response.status,
          statusText: response.statusText,
          duration: endTime - startTime,
          headers: Object.fromEntries(response.headers.entries())
        });

        return response;
      } catch (error: unknown) {
        if (error instanceof Error) {
          captureEvent('error', {
            type: 'network_error',
            message: error.message,
            url: args[0]
          });
        } else {
          captureEvent('error', {
            type: 'network_error',
            message: 'Unknown network error',
            url: args[0]
          });
        }
        throw error;
      }
    };
  }, []);

  const captureEvent = useCallback((type: RecordingEventType, data: Record<string, any>) => {
    if (!state.isRecording || state.isPaused) return;

    const event: RecordingEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now() - sessionStartTime.current,
      type,
      data,
      privacy: {
        sensitive: checkSensitiveData(data),
        masked: false,
        redacted: false
      }
    };

    // Apply privacy settings
    if (event.privacy.sensitive && state.settings.privacyLevel === 'high') {
      event.privacy.masked = true;
      event.data = maskEventData(event.data);
    }

    setState(prev => ({
      ...prev,
      events: [...prev.events, event].slice(-state.settings.maxEventsPerSession)
    }));

    eventBuffer.current.push(event);
  }, [state.isRecording, state.isPaused, state.settings]);

  // ==================== PRIVACY & SECURITY ====================
  const checkSensitiveData = useCallback((data: Record<string, any>): boolean => {
    const sensitivePatterns = [
      /password/i,
      /credit.?card/i,
      /ssn/i,
      /social.?security/i,
      /phone/i,
      /email/i,
      /address/i
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    return sensitivePatterns.some(pattern => pattern.test(dataString));
  }, []);

  const maskSensitiveData = useCallback((value: string, type: string): string => {
    if (type === 'password') return '*'.repeat(value.length);
    if (type === 'email') return value.replace(/(.{2}).*@/, '$1***@');
    if (type === 'tel') return value.replace(/\d(?=\d{4})/g, '*');
    return value;
  }, []);

  const maskEventData = useCallback((data: Record<string, any>): Record<string, any> => {
    const masked = { ...data };

    Object.keys(masked).forEach(key => {
      if (typeof masked[key] === 'string') {
        if (/password|credit.?card|ssn/i.test(key)) {
          masked[key] = '*'.repeat(masked[key].length);
        }
      }
    });

    return masked;
  }, []);

  const checkPrivacyViolations = useCallback((event: RecordingEvent): PrivacyViolation[] => {
    const violations: PrivacyViolation[] = [];

    if (event.privacy.sensitive && state.settings.privacyLevel === 'high') {
      violations.push({
        id: `violation-${Date.now()}`,
        timestamp: new Date(),
        type: 'sensitive_data',
        severity: 'high',
        description: 'Sensitive data detected in recording',
        data: { eventId: event.id, eventType: event.type },
        action: 'mask'
      });
    }

    return violations;
  }, [state.settings.privacyLevel]);

  // ==================== ANALYTICS ====================
  const calculateSessionAnalytics = useCallback((events: RecordingEvent[], duration: number): SessionRecording['analytics'] => {
    const userInteractions = events.filter(e => e.type.startsWith('user_')).length;
    const networkRequests = events.filter(e => e.type.startsWith('network_')).length;
    const domChanges = events.filter(e => e.type === 'dom_change').length;
    const errors = events.filter(e => e.type === 'error').length;

    const intervals = events.slice(1).map((event, index) =>
      event.timestamp - events[index].timestamp
    );

    const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;

    return {
      totalEvents: events.length,
      userInteractions,
      networkRequests,
      domChanges,
      errors,
      performance: {
        averageEventInterval: intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0,
        memoryUsage: memoryUsage,
        cpuUsage: 0 // Would need performance API
      }
    };
  }, []);

  const updateSessionMetrics = useCallback(() => {
    if (!state.currentSession) return;

    setState(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        duration: Date.now() - sessionStartTime.current,
        analytics: calculateSessionAnalytics(prev.events, Date.now() - sessionStartTime.current)
      } : null
    }));
  }, [calculateSessionAnalytics]);

  // ==================== REPLAY FUNCTIONALITY ====================
  const replaySession = useCallback((session: SessionRecording) => {
    setSelectedSession(session);
    setShowReplay(true);
  }, []);

  const exportSession = useCallback((session: SessionRecording) => {
    const exportData = {
      session,
      exportTime: new Date().toISOString(),
      format: 'json'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-replay-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (enableRecording) {
      startRecording();
    }

    return () => {
      if (state.isRecording) {
        stopRecording();
      }
    };
  }, [enableRecording, startRecording, stopRecording, state.isRecording]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session Replay Recorder</h2>

          {/* Recording Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isRecording ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isRecording ? 'Recording' : 'Stopped'}
            </span>
            {state.currentSession && (
              <span className="text-sm text-gray-500">
                {Math.floor((Date.now() - sessionStartTime.current) / 1000)}s
              </span>
            )}
          </div>

          {/* Privacy Level */}
          <select
            value={state.settings.privacyLevel}
            onChange={(e) => setState(prev => ({
              ...prev,
              settings: { ...prev.settings, privacyLevel: e.target.value as any }
            }))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="low">Low Privacy</option>
            <option value="medium">Medium Privacy</option>
            <option value="high">High Privacy</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!state.isRecording ? (
              <button
                onClick={startRecording}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start Recording
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeRecording}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReplay(!showReplay)}
              className={`p-2 rounded ${showReplay ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded ${showAnalytics ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPrivacy(!showPrivacy)}
              className={`p-2 rounded ${showPrivacy ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded ${showSettings ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== RECORDING OVERVIEW ==================== */}
        <div className="flex-1 p-4">
          {/* Recording Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.metrics.totalSessions}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</div>
                </div>
                <Video className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.metrics.totalEvents}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Events</div>
                </div>
                <MousePointer className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.floor(state.metrics.averageSessionLength / 1000)}s
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Duration</div>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {state.metrics.privacyViolations}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Privacy Issues</div>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Current Session Info */}
          {state.currentSession && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Session</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Session ID</div>
                  <div className="font-medium">{state.currentSession.sessionId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Events Captured</div>
                  <div className="font-medium">{state.events.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  <div className="font-medium">
                    {Math.floor((Date.now() - sessionStartTime.current) / 1000)}s
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Privacy Level</div>
                  <div className="font-medium capitalize">{state.currentSession.metadata.privacyLevel}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Replay Panel */}
          <AnimatePresence>
            {showReplay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Session Replay</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.currentSession && (
                      <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="font-medium text-blue-600 dark:text-blue-400">Current Session</div>
                        <div className="text-blue-500 dark:text-blue-300">
                          {state.events.length} events • {Math.floor((Date.now() - sessionStartTime.current) / 1000)}s
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => replaySession(state.currentSession!)}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Replay
                          </button>
                          <button
                            onClick={() => exportSession(state.currentSession!)}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analytics Panel */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recording Analytics</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">User Interactions</div>
                      <div className="text-lg font-medium">
                        {state.events.filter(e => e.type.startsWith('user_')).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Network Requests</div>
                      <div className="text-lg font-medium">
                        {state.events.filter(e => e.type.startsWith('network_')).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">DOM Changes</div>
                      <div className="text-lg font-medium">
                        {state.events.filter(e => e.type === 'dom_change').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
                      <div className="text-lg font-medium">
                        {state.events.filter(e => e.type === 'error').length}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Panel */}
          <AnimatePresence>
            {showPrivacy && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Security</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <div className="font-medium text-green-600 dark:text-green-400">Privacy Level</div>
                      <div className="text-green-500 dark:text-green-300 capitalize">
                        {state.settings.privacyLevel}
                      </div>
                    </div>
                    <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <div className="font-medium text-blue-600 dark:text-blue-400">Sensitive Events</div>
                      <div className="text-blue-500 dark:text-blue-300">
                        {state.events.filter(e => e.privacy.sensitive).length} detected
                      </div>
                    </div>
                    <div className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <div className="font-medium text-red-600 dark:text-red-400">Violations</div>
                      <div className="text-red-500 dark:text-red-300">
                        {state.violations.length} privacy violations
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recording Settings</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Session Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={state.settings.maxSessionDuration}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, maxSessionDuration: parseInt(e.target.value) }
                        }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Events Per Session
                      </label>
                      <input
                        type="number"
                        value={state.settings.maxEventsPerSession}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, maxEventsPerSession: parseInt(e.target.value) }
                        }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Retention (days)
                      </label>
                      <input
                        type="number"
                        value={state.settings.dataRetention}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, dataRetention: parseInt(e.target.value) }
                        }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SessionReplayRecorder;
