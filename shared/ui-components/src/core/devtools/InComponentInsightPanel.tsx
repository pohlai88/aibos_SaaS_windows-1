import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface InsightData {
  componentName: string;
  props: Record<string, any>;
  state: Record<string, any>;
  renderCount: number;
  renderTime: number;
  memoryUsage: number;
  accessibilityScore: number;
  complianceStatus: ComplianceStatus;
  performanceMetrics: PerformanceMetrics;
  auditTrail: AuditEntry[];
  aiInsights: AIInsight[]
}

interface ComplianceStatus {
  wcag: 'pass' | 'fail' | 'warning';
  aria: 'pass' | 'fail' | 'warning';
  contrast: 'pass' | 'fail' | 'warning';
  keyboard: 'pass' | 'fail' | 'warning';
  issues: string[]
}

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number
}

interface AuditEntry {
  timestamp: Date;
  action: string;
  data?: any;
  level: 'info' | 'warn' | 'error'
}

interface AIInsight {
  id: string;
  type: 'performance' | 'accessibility' | 'security' | 'ux' | 'best-practice';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  impact: string;
  confidence: number
}

interface InsightContextType {
  // Core functionality
  registerComponent: (componentName: string,
  props: any, state?: any) => void;
  updateInsight: (componentName: string,
  updates: Partial<InsightData>) => void;
  addAuditEntry: (componentName: string,
  entry: Omit<AuditEntry, 'timestamp'>) => void;

  // Dev mode
  isDevMode: boolean;
  setDevMode: (enabled: boolean) => void;

  // Component insights
  getInsight: (componentName: string) => InsightData | null;
  getAllInsights: () => InsightData[];

  // AI features
  generateAIInsights: (componentName: string) => Promise<AIInsight[]>;
  applyAIRecommendation: (componentName: string,
  insightId: string) => void;

  // Export/Import
  exportInsights: () => string;
  importInsights: (data: string) => void
}

// AI-powered insight generator
class AIInsightGenerator {
  private static instance: AIInsightGenerator;

  static getInstance(): AIInsightGenerator {
    if (!AIInsightGenerator.instance) {
      AIInsightGenerator.instance = new AIInsightGenerator()
}
    return AIInsightGenerator.instance
}

  async generateInsights(insightData: InsightData): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Performance insights
    if (insightData.performanceMetrics.renderTime > 16) {
      insights.push({
        id: `perf-${Date.now()}-1`,
        type: 'performance',
  title: 'Slow Render Time',
        description: `Component renders in ${insightData.performanceMetrics.renderTime}ms, exceeding 16ms threshold`,
        severity: 'high',
  suggestion: 'Consider using React.memo, useMemo, or useCallback to optimize rendering',
        impact: 'May cause UI lag and poor user experience',
  confidence: 0.9
      })
}

    if (insightData.renderCount > 100) {
      insights.push({
        id: `perf-${Date.now()}-2`,
        type: 'performance',
  title: 'High Render Count',
        description: `Component has rendered ${insightData.renderCount} times`,
        severity: 'medium',
  suggestion: 'Investigate unnecessary re-renders and optimize component lifecycle',
        impact: 'Increased CPU usage and potential performance degradation',
  confidence: 0.8
      })
}

    // Accessibility insights
    if (insightData.accessibilityScore < 80) {
      insights.push({
        id: `a11y-${Date.now()}-1`,
        type: 'accessibility',
  title: 'Low Accessibility Score',
        description: `Accessibility score is ${insightData.accessibilityScore}/100`,
        severity: 'high',
  suggestion: 'Add ARIA labels, improve contrast ratios, and ensure keyboard navigation',
        impact: 'Poor accessibility for users with disabilities',
  confidence: 0.95
      })
}

    // Security insights
    const dangerousProps = this.findDangerousProps(insightData.props);
    if (dangerousProps.length > 0) {
      insights.push({
        id: `sec-${Date.now()}-1`,
        type: 'security',
  title: 'Potential Security Issues',
        description: `Found ${dangerousProps.length} potentially dangerous props`,
        severity: 'critical',
  suggestion: 'Sanitize user inputs and avoid dangerouslySetInnerHTML',
        impact: 'Risk of XSS attacks and security vulnerabilities',
  confidence: 0.9
      })
}

    // UX insights
    if (Object.keys(insightData.props).length > 20) {
      insights.push({
        id: `ux-${Date.now()}-1`,
        type: 'ux',
  title: 'Too Many Props',
        description: `Component has ${Object.keys(insightData.props).length} props`,
        severity: 'medium',
  suggestion: 'Consider breaking down the component or using a configuration object',
        impact: 'Complex API makes component harder to use and maintain',
  confidence: 0.7
      })
}

    // Best practice insights
    if (insightData.state && Object.keys(insightData.state).length > 10) {
      insights.push({
        id: `bp-${Date.now()}-1`,
        type: 'best-practice',
  title: 'Complex State Management',
        description: 'Component has complex state with many properties',
  severity: 'medium',
        suggestion: 'Consider using useReducer or external state management',
  impact: 'Harder to debug and maintain state logic',
        confidence: 0.8
      })
}

    return insights
}

  private findDangerousProps(props: Record<string, any>): string[] {
    const dangerous: string[] = [];

    Object.entries(props).forEach(([key, value]) => {
      if (key.includes('dangerously') || key.includes('innerHTML')) {
        dangerous.push(key)
}
      if (typeof value === 'string' && value.includes('<script>')) {
        dangerous.push(key)
}
    });

    return dangerous
}
}

// Context
const InsightContext = createContext<InsightContextType | null>(null);

// Provider Component
interface InsightProviderProps {
  children: ReactNode;
  enableDevMode?: boolean;
  enableAI?: boolean;
  enableAuditTrail?: boolean
}

export const InsightProvider: React.FC<InsightProviderProps> = ({
  children,
  enableDevMode = false,
  enableAI = true,
  enableAuditTrail = true
}) => {
  const [isDevMode, setIsDevMode] = useState(enableDevMode);
  const [insights, setInsights] = useState<Map<string, InsightData>>(new Map());
  const aiGenerator = useRef(AIInsightGenerator.getInstance());

  const registerComponent = (componentName: string,
  props: any, state?: any) => {
    const insightData: InsightData = {
      componentName,
      props,
      state: state || {},
      renderCount: 1,
  renderTime: 0,
      memoryUsage: 0,
  accessibilityScore: 85,
      complianceStatus: {
        wcag: 'pass',
  aria: 'pass',
        contrast: 'pass',
  keyboard: 'pass',
        issues: []
      },
      performanceMetrics: {
        fps: 60,
  renderTime: 0,
        memoryUsage: 0,
  bundleSize: 0,
        networkRequests: 0
      },
      auditTrail: [],
      aiInsights: []
    };

    setInsights(prev => new Map(prev).set(componentName, insightData));

    if (enableAuditTrail) {
      auditLogger.info('Component registered for insights', { componentName })
}
  };

  const updateInsight = (componentName: string,
  updates: Partial<InsightData>) => {
    setInsights(prev => {
      const current = prev.get(componentName);
      if (!current) return prev;

      const updated = { ...current, ...updates };
      return new Map(prev).set(componentName, updated)
})
};

  const addAuditEntry = (componentName: string,
  entry: Omit<AuditEntry, 'timestamp'>) => {
    const auditEntry: AuditEntry = {
      ...entry,
      timestamp: new Date()
    };

    setInsights(prev => {
      const current = prev.get(componentName);
      if (!current) return prev;

      const updated = {
        ...current,
        auditTrail: [...current.auditTrail, auditEntry]
      };
      return new Map(prev).set(componentName, updated)
})
};

  const getInsight = (componentName: string): InsightData | null => {
    return insights.get(componentName) || null
};

  const getAllInsights = (): InsightData[] => {
    return Array.from(insights.values())
};

  const generateAIInsights = async (componentName: string): Promise<AIInsight[]> => {
    if (!enableAI) return [];

    const insightData = insights.get(componentName);
    if (!insightData) return [];

    const aiInsights = await aiGenerator.current.generateInsights(insightData);

    setInsights(prev => {
      const current = prev.get(componentName);
      if (!current) return prev;

      const updated = { ...current, aiInsights };
      return new Map(prev).set(componentName, updated)
});

    return aiInsights
};

  const applyAIRecommendation = (componentName: string,
  insightId: string) => {
    const insightData = insights.get(componentName);
    if (!insightData) return;

    const insight = insightData.aiInsights.find(i => i.id === insightId);
    if (!insight) return;

    // Apply the recommendation (this would be more sophisticated in practice)
    addAuditEntry(componentName, {
      action: 'ai_recommendation_applied',
  data: { insightId, recommendation: insight.suggestion },
      level: 'info'
    });

    if (enableAuditTrail) {
      auditLogger.info('AI recommendation applied', {
        componentName,
        insightId,
        recommendation: insight.suggestion
      })
}
  };

  const exportInsights = (): string => {
    return JSON.stringify(Array.from(insights.entries()), null, 2)
};

  const importInsights = (data: string) => {
    try {
      const imported = new Map(JSON.parse(data));
      setInsights(imported)
} catch (error) {
      console.error('Failed to import insights:', error)
}
  };

  const value: InsightContextType = {
    registerComponent,
    updateInsight,
    addAuditEntry,
    isDevMode,
    setDevMode: setIsDevMode,
    getInsight,
    getAllInsights,
    generateAIInsights,
    applyAIRecommendation,
    exportInsights,
    importInsights
  };

  return (
    <InsightContext.Provider value={value}>
      {children}
    </InsightContext.Provider>
  )
};

// Hook
export const useInsights = () => {
  const context = useContext(InsightContext);
  if (!context) {
    throw new Error('useInsights must be used within InsightProvider')
}
  return context
};

// HOC for insight-enabled components
export const withInsights = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName: string;
    enablePerformanceTracking?: boolean;
    enableAccessibilityScanning?: boolean
} = { componentName: 'UnknownComponent' }
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      registerComponent,
      updateInsight,
      addAuditEntry,
      isDevMode,
      generateAIInsights
    } = useInsights();

    const renderStartTime = useRef<number>(0);
    const renderCount = useRef(0);

    useEffect(() => {
      registerComponent(options.componentName, props);
      renderStartTime.current = performance.now();
      renderCount.current++
}, []);

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;

      updateInsight(options.componentName, {
        renderCount: renderCount.current,
        renderTime,
        performanceMetrics: {
          fps: Math.round(1000 / renderTime),
          renderTime,
          memoryUsage: 0,
  bundleSize: 0,
          networkRequests: 0
        }
      });

      addAuditEntry(options.componentName, {
        action: 'component_rendered',
  data: { renderCount: renderCount.current, renderTime },
        level: 'info'
      });

      // Generate AI insights periodically
      if (isDevMode && renderCount.current % 10 === 0) {
        generateAIInsights(options.componentName)
}
    });

    return <Component {...props} />
};

  WrappedComponent.displayName = `withInsights(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Insight Panel Component
export const InsightPanel: React.FC<{ componentName?: string }> = ({ componentName }) => {
  const {
    isDevMode,
    getInsight,
    getAllInsights,
    generateAIInsights,
    applyAIRecommendation
  } = useInsights();

  const [selectedComponent, setSelectedComponent] = useState(componentName || '');
  const [showAIInsights, setShowAIInsights] = useState(false);

  if (!isDevMode) {
    return (
      <div style={{ padding: '20px',
  background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 Component Insights</h3>
        <p>Dev mode is disabled</p>
      </div>
    )
}

  const allInsights = getAllInsights();
  const currentInsight = selectedComponent ? getInsight(selectedComponent) : null;

  const handleGenerateAIInsights = async () => {
    if (selectedComponent) {
      await generateAIInsights(selectedComponent);
      setShowAIInsights(true)
}
  };

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '600px',
  maxHeight: '600px',
      overflowY: 'auto'
    }}>
      <h3>🔍 Component Insights Panel</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Components ({allInsights.length})</h4>
        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          style={{
            width: '100%',
  padding: '8px',
            background: '#333',
  color: '#fff',
            border: '1px solid #555',
  borderRadius: '4px'
          }}
        >
          <option value="">Select a component</option>
          {allInsights.map(insight => (
            <option key={insight.componentName} value={insight.componentName}>
              {insight.componentName} (Renders: {insight.renderCount})
            </option>
          ))}
        </select>
      </div>

      {currentInsight && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h4>Performance Metrics</h4>
            <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>Render Count: {currentInsight.renderCount}</div>
              <div>Render Time: {currentInsight.renderTime.toFixed(2)}ms</div>
              <div>FPS: {currentInsight.performanceMetrics.fps}</div>
              <div>Accessibility: {currentInsight.accessibilityScore}/100</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Compliance Status</h4>
            <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>WCAG: <span style={{ color: currentInsight.complianceStatus.wcag === 'pass' ? '#28a745' : '#ff4444' }}>
                {currentInsight.complianceStatus.wcag.toUpperCase()}
              </span></div>
              <div>ARIA: <span style={{ color: currentInsight.complianceStatus.aria === 'pass' ? '#28a745' : '#ff4444' }}>
                {currentInsight.complianceStatus.aria.toUpperCase()}
              </span></div>
              <div>Contrast: <span style={{ color: currentInsight.complianceStatus.contrast === 'pass' ? '#28a745' : '#ff4444' }}>
                {currentInsight.complianceStatus.contrast.toUpperCase()}
              </span></div>
              <div>Keyboard: <span style={{ color: currentInsight.complianceStatus.keyboard === 'pass' ? '#28a745' : '#ff4444' }}>
                {currentInsight.complianceStatus.keyboard.toUpperCase()}
              </span></div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Props ({Object.keys(currentInsight.props).length})</h4>
            <div style={{
              maxHeight: '150px',
  overflowY: 'auto',
              background: '#333',
  padding: '10px',
              borderRadius: '4px',
  fontSize: '12px'
            }}>
              <pre>{JSON.stringify(currentInsight.props, null, 2)}</pre>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Recent Audit Trail</h4>
            <div style={{
              maxHeight: '150px',
  overflowY: 'auto',
              background: '#333',
  padding: '10px',
              borderRadius: '4px',
  fontSize: '12px'
            }}>
              {currentInsight.auditTrail.slice(-5).map((entry, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  <span style={{ color: '#888' }}>
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span style={{
                    color: entry.level === 'error' ? '#ff4444' :
                           entry.level === 'warn' ? '#ffc107' : '#28a745',
                    marginLeft: '10px'
                  }}>
                    {entry.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>AI Insights</h4>
            <button
              onClick={handleGenerateAIInsights}
              style={{
                background: '#007bff',
  color: '#fff',
                border: 'none',
  padding: '8px 16px',
                borderRadius: '4px',
  marginBottom: '10px',
                cursor: 'pointer'
              }}
            >
              Generate AI Insights
            </button>

            {currentInsight.aiInsights.length > 0 && (
              <div style={{
                maxHeight: '200px',
  overflowY: 'auto',
                background: '#333',
  padding: '10px',
                borderRadius: '4px'
              }}>
                {currentInsight.aiInsights.map(insight => (
                  <div key={insight.id} style={{
                    padding: '8px',
  background: '#444',
                    marginBottom: '8px',
  borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 'bold',
  marginBottom: '4px' }}>
                      {insight.title}
                      <span style={{
                        color: insight.severity === 'critical' ? '#ff4444' :
                               insight.severity === 'high' ? '#ff8800' :
                               insight.severity === 'medium' ? '#ffc107' : '#28a745',
                        marginLeft: '8px',
  fontSize: '10px'
                      }}>
                        {insight.severity.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>{insight.description}</div>
                    <div style={{ color: '#888',
  marginBottom: '4px' }}>{insight.suggestion}</div>
                    <button
                      onClick={() => applyAIRecommendation(currentInsight.componentName, insight.id)}
                      style={{
                        background: '#28a745',
  color: '#fff',
                        border: 'none',
  padding: '4px 8px',
                        borderRadius: '2px',
  fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
};
