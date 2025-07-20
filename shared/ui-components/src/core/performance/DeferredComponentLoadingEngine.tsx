import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface LoadConfig {
  importance: 'critical' | 'high' | 'medium' | 'low';
  loadWindow: 'now' | 'idle' | 'nextIdle' | 'userEvent' | 'custom';
  userEvent?: string;
  customCondition?: () => boolean;
  estimatedLoadTime: number;
  dependencies?: string[];
  fallback?: ReactNode;
  retryAttempts?: number;
  retryDelay?: number
}

interface LoadState {
  componentId: string;
  status: 'pending' | 'loading' | 'loaded' | 'error' | 'cancelled';
  loadStartTime?: number;
  loadEndTime?: number;
  actualLoadTime?: number;
  retryCount: number;
  error?: string
}

interface DCLEContextType {
  // Core functionality
  registerComponent: (componentId: string,
  config: LoadConfig) => void;
  unregisterComponent: (componentId: string) => void;
  loadComponent: (componentId: string) => Promise<void>;
  cancelLoad: (componentId: string) => void;

  // State management
  loadStates: Map<string, LoadState>;
  isLoading: (componentId: string) => boolean;
  isLoaded: (componentId: string) => boolean;
  getLoadTime: (componentId: string) => number | null;

  // Configuration
  setGlobalConfig: (config: Partial<GlobalLoadConfig>) => void;
  getGlobalConfig: () => GlobalLoadConfig;

  // Analytics
  getPerformanceMetrics: () => PerformanceMetrics;
  getLoadQueue: () => LoadQueueItem[]
}

interface GlobalLoadConfig {
  maxConcurrentLoads: number;
  idleTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableAnalytics: boolean;
  enableAuditTrail: boolean
}

interface PerformanceMetrics {
  totalComponents: number;
  loadedComponents: number;
  averageLoadTime: number;
  totalLoadTime: number;
  errorRate: number;
  idleTime: number
}

interface LoadQueueItem {
  componentId: string;
  priority: number;
  estimatedLoadTime: number;
  addedAt: Date
}

// Priority scoring system
class PriorityScorer {
  private static importanceWeights = {
    critical: 100,
  high: 75,
    medium: 50,
  low: 25
  };

  static calculatePriority(config: LoadConfig,
  userActivity: number): number {
    const basePriority = this.importanceWeights[config.importance];
    const timeFactor = Math.max(0, 1 - (config.estimatedLoadTime / 1000));
    const activityFactor = Math.min(1, userActivity / 100);

    return basePriority * timeFactor * (1 + activityFactor)
}
}

// Load scheduler
class LoadScheduler {
  private queue: LoadQueueItem[] = [];
  private activeLoads: Set<string> = new Set();
  private maxConcurrent: number;
  private idleTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: GlobalLoadConfig) {
    this.maxConcurrent = config.maxConcurrentLoads;
    this.idleTimeout = config.idleTimeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay
}

  addToQueue(componentId: string,
  priority: number, estimatedLoadTime: number): void {
    const item: LoadQueueItem = {
      componentId,
      priority,
      estimatedLoadTime,
      addedAt: new Date()
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(q => q.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(item)
} else {
      this.queue.splice(insertIndex, 0, item)
}
  }

  getNextToLoad(): string | null {
    if (this.activeLoads.size >= this.maxConcurrent) {
      return null
}

    const next = this.queue.shift();
    if (next) {
      this.activeLoads.add(next.componentId);
      return next.componentId
}

    return null
}

  markLoadComplete(componentId: string): void {
    this.activeLoads.delete(componentId)
}

  getQueue(): LoadQueueItem[] {
    return [...this.queue]
}

  getActiveLoads(): string[] {
    return Array.from(this.activeLoads)
}
}

// Idle detection
class IdleDetector {
  private static instance: IdleDetector;
  private idleCallbacks: Array<() => void> = [];
  private isIdle: boolean = false;
  private idleTimeout: number = 1000;
  private lastActivity: number = Date.now();

  static getInstance(): IdleDetector {
    if (!IdleDetector.instance) {
      IdleDetector.instance = new IdleDetector()
}
    return IdleDetector.instance
}

  constructor() {
    this.setupEventListeners();
    this.startIdleCheck()
}

  private setupEventListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
        if (this.isIdle) {
          this.isIdle = false;
          this.onActivityResume()
}
      }, { passive: true })
})
}

  private startIdleCheck(): void {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastActivity > this.idleTimeout && !this.isIdle) {
        this.isIdle = true;
        this.onIdle()
}
    }, 100)
}

  private onIdle(): void {
    this.idleCallbacks.forEach(callback => callback())
}

  private onActivityResume(): void {
    // Handle activity resume if needed
  }

  onIdle(callback: () => void): void {
    this.idleCallbacks.push(callback)
}

  isCurrentlyIdle(): boolean {
    return this.isIdle
}

  getLastActivity(): number {
    return this.lastActivity
}
}

// Context
const DCLEContext = createContext<DCLEContextType | null>(null);

// Provider Component
interface DCLEProviderProps {
  children: ReactNode;
  globalConfig?: Partial<GlobalLoadConfig>;
  enableAnalytics?: boolean;
  enableAuditTrail?: boolean
}

export const DCLEProvider: React.FC<DCLEProviderProps> = ({
  children,
  globalConfig = {},
  enableAnalytics = true,
  enableAuditTrail = true
}) => {
  const [loadStates, setLoadStates] = useState<Map<string, LoadState>>(new Map());
  const [globalConfigState, setGlobalConfigState] = useState<GlobalLoadConfig>({
    maxConcurrentLoads: 3,
  idleTimeout: 1000,
    retryAttempts: 3,
  retryDelay: 1000,
    enableAnalytics: enableAnalytics,
  enableAuditTrail: enableAuditTrail,
    ...globalConfig
  });

  const scheduler = useRef(new LoadScheduler(globalConfigState));
  const idleDetector = useRef(IdleDetector.getInstance());
  const componentConfigs = useRef<Map<string, LoadConfig>>(new Map());
  const userActivity = useRef(0);

  // Update scheduler when global config changes
  useEffect(() => {
    scheduler.current = new LoadScheduler(globalConfigState)
}, [globalConfigState]);

  // Setup idle detection
  useEffect(() => {
    idleDetector.current.onIdle(() => {
      processIdleLoads()
})
}, []);

  const processIdleLoads = () => {
    const idleComponents = Array.from(componentConfigs.current.entries())
      .filter(([_, config]) => config.loadWindow === 'idle')
      .map(([id, config]) => ({ id, config }));

    idleComponents.forEach(({ id, config }) => {
      if (!loadStates.has(id) || loadStates.get(id)?.status === 'pending') {
        loadComponent(id)
}
    })
};

  const registerComponent = (componentId: string,
  config: LoadConfig) => {
    componentConfigs.current.set(componentId, config);

    const loadState: LoadState = {
      componentId,
      status: 'pending',
  retryCount: 0
    };

    setLoadStates(prev => new Map(prev).set(componentId, loadState));

    // Handle different load windows
    switch (config.loadWindow) {
      case 'now':
        loadComponent(componentId);
        break;
      case 'idle':
        // Will be handled by idle detector
        break;
      case 'nextIdle':
        // Schedule for next idle period
        break;
      case 'userEvent':
        if (config.userEvent) {
          document.addEventListener(config.userEvent, () => {
            loadComponent(componentId)
}, { once: true })
}
        break;
      case 'custom':
        if (config.customCondition) {
          const checkCondition = () => {
            if (config.customCondition!()) {
              loadComponent(componentId)
} else {
              setTimeout(checkCondition, 100)
}
          };
          checkCondition()
}
        break
}

    if (enableAuditTrail) {
      auditLogger.info('Component registered for deferred loading', {
        componentId,
        config: config.loadWindow,
        importance: config.importance
      })
}
  };

  const unregisterComponent = (componentId: string) => {
    componentConfigs.current.delete(componentId);
    setLoadStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(componentId);
      return newMap
});

    if (enableAuditTrail) {
      auditLogger.info('Component unregistered from deferred loading', { componentId })
}
  };

  const loadComponent = async (componentId: string): Promise<void> => {
    const config = componentConfigs.current.get(componentId);
    if (!config) {
      throw new Error(`Component ${componentId} not registered`)
}

    const currentState = loadStates.get(componentId);
    if (currentState?.status === 'loading' || currentState?.status === 'loaded') {
      return
}

    // Update state to loading
    setLoadStates(prev => {
      const newMap = new Map(prev);
      newMap.set(componentId, {
        ...currentState!,
        status: 'loading',
  loadStartTime: Date.now()
      });
      return newMap
});

    // Add to scheduler queue
    const priority = PriorityScorer.calculatePriority(config, userActivity.current);
    scheduler.current.addToQueue(componentId, priority, config.estimatedLoadTime);

    // Process queue
    await processQueue();

    if (enableAuditTrail) {
      auditLogger.info('Component load started', {
        componentId,
        priority,
        estimatedTime: config.estimatedLoadTime
      })
}
  };

  const processQueue = async (): Promise<void> => {
    let nextComponent = scheduler.current.getNextToLoad();

    while (nextComponent) {
      const config = componentConfigs.current.get(nextComponent);
      if (!config) continue;

      try {
        // Simulate component loading
        await simulateLoad(config.estimatedLoadTime);

        // Mark as loaded
        setLoadStates(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(nextComponent);
          if (current) {
            newMap.set(nextComponent, {
              ...current,
              status: 'loaded',
  loadEndTime: Date.now(),
              actualLoadTime: Date.now() - (current.loadStartTime || Date.now())
            })
}
          return newMap
});

        scheduler.current.markLoadComplete(nextComponent);

        if (enableAuditTrail) {
          auditLogger.info('Component loaded successfully', {
            componentId: nextComponent,
  actualLoadTime: Date.now() - (loadStates.get(nextComponent)?.loadStartTime || Date.now())
          })
}

      } catch (error) {
        // Handle retry logic
        const currentState = loadStates.get(nextComponent);
        if (currentState && currentState.retryCount < (config.retryAttempts || globalConfigState.retryAttempts)) {
          setLoadStates(prev => {
            const newMap = new Map(prev);
            newMap.set(nextComponent, {
              ...currentState,
              retryCount: currentState.retryCount + 1,
              status: 'pending'
            });
            return newMap
});

          // Retry after delay
          setTimeout(() => {
            loadComponent(nextComponent)
}, config.retryDelay || globalConfigState.retryDelay)
} else {
          // Mark as error
          setLoadStates(prev => {
            const newMap = new Map(prev);
            newMap.set(nextComponent, {
              ...currentState!,
              status: 'error',
  error: error instanceof Error ? error.message : 'Unknown error'
            });
            return newMap
})
}

        scheduler.current.markLoadComplete(nextComponent)
}

      nextComponent = scheduler.current.getNextToLoad()
}
  };

  const simulateLoad = (estimatedTime: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const actualTime = estimatedTime * (0.8 + Math.random() * 0.4); // ±20% variance

      setTimeout(() => {
        if (Math.random() > 0.95) { // 5% chance of failure
          reject(new Error('Simulated load failure'))
} else {
          resolve()
}
      }, actualTime)
})
};

  const cancelLoad = (componentId: string) => {
    setLoadStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(componentId);
      if (current && current.status === 'pending') {
        newMap.set(componentId, {
          ...current,
          status: 'cancelled'
        })
}
      return newMap
});

    if (enableAuditTrail) {
      auditLogger.info('Component load cancelled', { componentId })
}
  };

  const isLoading = (componentId: string): boolean => {
    return loadStates.get(componentId)?.status === 'loading'
};

  const isLoaded = (componentId: string): boolean => {
    return loadStates.get(componentId)?.status === 'loaded'
};

  const getLoadTime = (componentId: string): number | null => {
    const state = loadStates.get(componentId);
    return state?.actualLoadTime || null
};

  const setGlobalConfig = (config: Partial<GlobalLoadConfig>) => {
    setGlobalConfigState(prev => ({ ...prev, ...config }))
};

  const getGlobalConfig = (): GlobalLoadConfig => {
    return globalConfigState
};

  const getPerformanceMetrics = (): PerformanceMetrics => {
    const states = Array.from(loadStates.values());
    const loadedStates = states.filter(s => s.status === 'loaded');
    const errorStates = states.filter(s => s.status === 'error');

    const totalLoadTime = loadedStates.reduce((sum, state) =>
      sum + (state.actualLoadTime || 0), 0
    );

    return {
      totalComponents: states.length,
      loadedComponents: loadedStates.length,
      averageLoadTime: loadedStates.length > 0 ? totalLoadTime / loadedStates.length : 0,
      totalLoadTime,
      errorRate: states.length > 0 ? errorStates.length / states.length: 0,
  idleTime: Date.now() - idleDetector.current.getLastActivity()
    }
};

  const getLoadQueue = (): LoadQueueItem[] => {
    return scheduler.current.getQueue()
};

  const value: DCLEContextType = {
    registerComponent,
    unregisterComponent,
    loadComponent,
    cancelLoad,
    loadStates,
    isLoading,
    isLoaded,
    getLoadTime,
    setGlobalConfig,
    getGlobalConfig,
    getPerformanceMetrics,
    getLoadQueue
  };

  return (
    <DCLEContext.Provider value={value}>
      {children}
    </DCLEContext.Provider>
  )
};

// Hook
export const useDCLE = () => {
  const context = useContext(DCLEContext);
  if (!context) {
    throw new Error('useDCLE must be used within DCLEProvider')
}
  return context
};

// HOC for deferred loading components
export const withDeferredLoading = <P extends object>(
  Component: React.ComponentType<P>,
  config: LoadConfig
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      registerComponent,
      unregisterComponent,
      isLoading,
      isLoaded,
      loadComponent
    } = useDCLE();

    const componentId = useRef(`deferred-${Component.displayName || Component.name}-${Date.now()}`);

    useEffect(() => {
      registerComponent(componentId.current, config);

      return () => {
        unregisterComponent(componentId.current)
}
}, []);

    const handleLoad = () => {
      loadComponent(componentId.current)
};

    if (isLoading(componentId.current)) {
      return (
        <div style={{
          padding: '20px',
  textAlign: 'center',
          background: '#f8f9fa',
  borderRadius: '8px',
          border: '2px dashed #dee2e6'
        }}>
          <div>Loading {Component.displayName || Component.name}...</div>
          {config.fallback && config.fallback}
        </div>
      )
}

    if (!isLoaded(componentId.current)) {
      return (
        <div style={{
          padding: '20px',
  textAlign: 'center',
          background: '#f8f9fa',
  borderRadius: '8px',
          border: '2px dashed #dee2e6',
  cursor: 'pointer'
        }}
        onClick={handleLoad}
        >
          <div>Click to load {Component.displayName || Component.name}</div>
          <small>Estimated time: {config.estimatedLoadTime}ms</small>
        </div>
      )
}

    return <Component {...props} />
};

  WrappedComponent.displayName = `withDeferredLoading(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Performance Dashboard Component
export const DCLEPerformanceDashboard: React.FC = () => {
  const { getPerformanceMetrics, getLoadQueue, getGlobalConfig } = useDCLE();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [queue, setQueue] = useState<LoadQueueItem[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getPerformanceMetrics());
      setQueue(getLoadQueue())
};

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval)
}, []);

  if (!metrics) return null;

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '500px'
    }}>
      <h3>⚡ Deferred Loading Performance</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Metrics</h4>
        <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>Total: {metrics.totalComponents}</div>
          <div>Loaded: {metrics.loadedComponents}</div>
          <div>Avg Time: {metrics.averageLoadTime.toFixed(0)}ms</div>
          <div>Error Rate: {(metrics.errorRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Load Queue ({queue.length})</h4>
        <div style={{ maxHeight: '200px',
  overflowY: 'auto' }}>
          {queue.map((item, index) => (
            <div key={index} style={{
              padding: '8px',
  background: '#333',
              marginBottom: '4px',
  borderRadius: '4px',
              fontSize: '12px'
            }}>
              {item.componentId}
              <br />
              <small>Priority: {item.priority} | Est: {item.estimatedLoadTime}ms</small>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4>Global Config</h4>
        <div style={{ fontSize: '12px' }}>
          <div>Max Concurrent: {getGlobalConfig().maxConcurrentLoads}</div>
          <div>Idle Timeout: {getGlobalConfig().idleTimeout}ms</div>
          <div>Retry Attempts: {getGlobalConfig().retryAttempts}</div>
        </div>
      </div>
    </div>
  )
};
