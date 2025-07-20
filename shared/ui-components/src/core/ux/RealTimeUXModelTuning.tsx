import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface UXFeedback {
  userId?: string;
  tenantId?: string;
  componentName: string;
  action: string;
  timestamp: Date;
  metadata: {
    interactionTime: number;
    success: boolean;
    errorMessage?: string;
    userSatisfaction?: number;
    context: string
}
}

interface UXModel {
  componentName: string;
  tenantId?: string;
  userId?: string;
  adaptations: UXAdaptation[];
  performance: UXPerformance;
  lastUpdated: Date
}

interface UXAdaptation {
  type: 'defaultValue' | 'visibility' | 'behavior' | 'styling' | 'layout';
  target: string;
  value: any;
  confidence: number;
  reason: string;
  appliedAt: Date
}

interface UXPerformance {
  averageInteractionTime: number;
  successRate: number;
  userSatisfaction: number;
  usageFrequency: number;
  errorRate: number
}

interface RTUXContextType {
  reportFeedback: (feedback: UXFeedback) => void;
  getAdaptations: (componentName: string, tenantId?: string, userId?: string) => UXAdaptation[];
  applyAdaptation: (componentName: string,
  adaptation: UXAdaptation) => void;
  getPerformance: (componentName: string) => UXPerformance;
  enableAdaptiveMode: boolean;
  setEnableAdaptiveMode: (enabled: boolean) => void;
  getPersonalizedDefaults: (componentName: string) => any
}

// AI-powered UX analysis engine
class UXAnalysisEngine {
  private static instance: UXAnalysisEngine;
  private feedbackDatabase: UXFeedback[] = [];
  private models: Map<string, UXModel> = new Map();

  static getInstance(): UXAnalysisEngine {
    if (!UXAnalysisEngine.instance) {
      UXAnalysisEngine.instance = new UXAnalysisEngine()
}
    return UXAnalysisEngine.instance
}

  addFeedback(feedback: UXFeedback): void {
    this.feedbackDatabase.push(feedback);
    this.updateModel(feedback)
}

  private updateModel(feedback: UXFeedback): void {
    const key = this.getModelKey(feedback.componentName, feedback.tenantId, feedback.userId);
    const existingModel = this.models.get(key) || this.createNewModel(feedback);

    // Update performance metrics
    const recentFeedback = this.getRecentFeedback(feedback.componentName, feedback.tenantId, feedback.userId);
    existingModel.performance = this.calculatePerformance(recentFeedback);

    // Generate new adaptations
    const newAdaptations = this.generateAdaptations(feedback, recentFeedback);
    existingModel.adaptations = [...existingModel.adaptations, ...newAdaptations];
    existingModel.lastUpdated = new Date();

    this.models.set(key, existingModel)
}

  private createNewModel(feedback: UXFeedback): UXModel {
    return {
      componentName: feedback.componentName,
      tenantId: feedback.tenantId,
      userId: feedback.userId,
      adaptations: [],
      performance: {
        averageInteractionTime: 0,
  successRate: 0,
        userSatisfaction: 0,
  usageFrequency: 0,
        errorRate: 0
      },
      lastUpdated: new Date()
    }
}

  private getModelKey(componentName: string, tenantId?: string, userId?: string): string {
    return `${componentName}-${tenantId || 'global'}-${userId || 'global'}`
}

  private getRecentFeedback(componentName: string, tenantId?: string, userId?: string, days: number = 30): UXFeedback[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.feedbackDatabase.filter(feedback =>
      feedback.componentName === componentName &&
      feedback.timestamp > cutoff &&
      (tenantId ? feedback.tenantId === tenantId : true) &&
      (userId ? feedback.userId === userId : true)
    )
}

  private calculatePerformance(feedback: UXFeedback[]): UXPerformance {
    if (feedback.length === 0) {
      return {
        averageInteractionTime: 0,
  successRate: 0,
        userSatisfaction: 0,
  usageFrequency: 0,
        errorRate: 0
      }
}

    const totalInteractions = feedback.length;
    const successfulInteractions = feedback.filter(f => f.metadata.success).length;
    const totalInteractionTime = feedback.reduce((sum, f) => sum + f.metadata.interactionTime, 0);
    const totalSatisfaction = feedback.reduce((sum, f) => sum + (f.metadata.userSatisfaction || 0), 0);
    const errorCount = feedback.filter(f => !f.metadata.success).length;

    return {
      averageInteractionTime: totalInteractionTime / totalInteractions,
      successRate: successfulInteractions / totalInteractions,
      userSatisfaction: totalSatisfaction / totalInteractions,
      usageFrequency: totalInteractions / 30, // per day
      errorRate: errorCount / totalInteractions
    }
}

  private generateAdaptations(feedback: UXFeedback,
  recentFeedback: UXFeedback[]): UXAdaptation[] {
    const adaptations: UXAdaptation[] = [];

    // Analyze patterns and generate AI-powered suggestions
    const patterns = this.analyzePatterns(recentFeedback);

    // Default value adaptations
    if (patterns.mostCommonValues) {
      Object.entries(patterns.mostCommonValues).forEach(([field, value]) => {
        adaptations.push({
          type: 'defaultValue',
  target: field,
          value,
          confidence: patterns.confidence,
          reason: `Most commonly used value based on ${recentFeedback.length} interactions`,
          appliedAt: new Date()
        })
})
}

    // Visibility adaptations
    if (patterns.lowUsageElements) {
      patterns.lowUsageElements.forEach(element => {
        adaptations.push({
          type: 'visibility',
  target: element,
          value: false,
  confidence: 0.7,
          reason: 'Low usage detected - hiding to reduce clutter',
  appliedAt: new Date()
        })
})
}

    // Behavior adaptations
    if (patterns.preferredBehaviors) {
      Object.entries(patterns.preferredBehaviors).forEach(([behavior, preference]) => {
        adaptations.push({
          type: 'behavior',
  target: behavior,
          value: preference,
  confidence: 0.8,
          reason: `User preference detected: ${preference}`,
          appliedAt: new Date()
        })
})
}

    return adaptations
}

  private analyzePatterns(feedback: UXFeedback[]): {
    mostCommonValues: Record<string, any>;
    lowUsageElements: string[];
    preferredBehaviors: Record<string, any>;
    confidence: number
} {
    const patterns = {
      mostCommonValues: {} as Record<string, any>,
      lowUsageElements: [] as string[],
      preferredBehaviors: {} as Record<string, any>,
      confidence: 0.5
    };

    if (feedback.length < 5) {
      return patterns
}

    // Analyze most common values
    const valueCounts: Record<string, Record<string, number>> = {};
    feedback.forEach(f => {
      if (f.metadata.context) {
        try {
          const context = JSON.parse(f.metadata.context);
          Object.entries(context).forEach(([key, value]) => {
            if (!valueCounts[key]) valueCounts[key] = {};
            const valueStr = String(value);
            valueCounts[key][valueStr] = (valueCounts[key][valueStr] || 0) + 1
})
} catch (e) {
          // Context is not JSON
        }
      }
    });

    Object.entries(valueCounts).forEach(([field, counts]) => {
      const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (mostCommon && mostCommon[1] > feedback.length * 0.6) {
        patterns.mostCommonValues[field] = mostCommon[0]
}
    });

    // Analyze low usage elements
    const elementUsage: Record<string, number> = {};
    feedback.forEach(f => {
      if (f.action.includes('click') || f.action.includes('interact')) {
        const element = f.action.split('_')[0];
        elementUsage[element] = (elementUsage[element] || 0) + 1
}
    });

    const avgUsage = Object.values(elementUsage).reduce((sum, count) => sum + count, 0) / Object.keys(elementUsage).length;
    patterns.lowUsageElements = Object.entries(elementUsage)
      .filter(([_, count]) => count < avgUsage * 0.3)
      .map(([element, _]) => element);

    // Calculate confidence based on data quality
    patterns.confidence = Math.min(0.9, feedback.length / 100);

    return patterns
}

  getModel(componentName: string, tenantId?: string, userId?: string): UXModel | null {
    const key = this.getModelKey(componentName, tenantId, userId);
    return this.models.get(key) || null
}

  getPersonalizedDefaults(componentName: string, tenantId?: string, userId?: string): any {
    const model = this.getModel(componentName, tenantId, userId);
    if (!model) return {};

    const defaults: any = {};
    model.adaptations
      .filter(a => a.type === 'defaultValue' && a.confidence > 0.7)
      .forEach(a => {
        defaults[a.target] = a.value
});

    return defaults
}
}

// Context
const RTUXContext = createContext<RTUXContextType | null>(null);

// Provider Component
interface RTUXProviderProps {
  children: ReactNode;
  enableAdaptiveMode?: boolean;
  enableAnalytics?: boolean;
  tenantId?: string;
  userId?: string
}

export const RTUXProvider: React.FC<RTUXProviderProps> = ({
  children,
  enableAdaptiveMode = true,
  enableAnalytics = true,
  tenantId,
  userId
}) => {
  const [enableAdaptiveModeState, setEnableAdaptiveModeState] = useState(enableAdaptiveMode);
  const uxEngine = useRef(UXAnalysisEngine.getInstance());

  const reportFeedback = (feedback: UXFeedback) => {
    const enhancedFeedback = {
      ...feedback,
      tenantId: feedback.tenantId || tenantId,
      userId: feedback.userId || userId
    };

    if (enableAnalytics) {
      uxEngine.current.addFeedback(enhancedFeedback);
      auditLogger.info('UX feedback reported', { feedback: enhancedFeedback })
}
  };

  const getAdaptations = (componentName: string, componentTenantId?: string, componentUserId?: string): UXAdaptation[] => {
    const model = uxEngine.current.getModel(
      componentName,
      componentTenantId || tenantId,
      componentUserId || userId
    );
    return model?.adaptations || []
};

  const applyAdaptation = (componentName: string,
  adaptation: UXAdaptation) => {
    // Apply adaptation logic here
    auditLogger.info('UX adaptation applied', { componentName, adaptation })
};

  const getPerformance = (componentName: string): UXPerformance => {
    const model = uxEngine.current.getModel(componentName, tenantId, userId);
    return model?.performance || {
      averageInteractionTime: 0,
  successRate: 0,
      userSatisfaction: 0,
  usageFrequency: 0,
      errorRate: 0
    }
};

  const getPersonalizedDefaults = (componentName: string): any => {
    return uxEngine.current.getPersonalizedDefaults(componentName, tenantId, userId)
};

  const value: RTUXContextType = {
    reportFeedback,
    getAdaptations,
    applyAdaptation,
    getPerformance,
    enableAdaptiveMode: enableAdaptiveModeState,
  setEnableAdaptiveMode: setEnableAdaptiveModeState,
    getPersonalizedDefaults
  };

  return (
    <RTUXContext.Provider value={value}>
      {children}
    </RTUXContext.Provider>
  )
};

// Hook
export const useRTUX = () => {
  const context = useContext(RTUXContext);
  if (!context) {
    throw new Error('useRTUX must be used within RTUXProvider')
}
  return context
};

// HOC for adaptive components
export const withAdaptiveUX = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName: string;
    adaptiveProps?: string[];
    enablePersonalization?: boolean
}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      reportFeedback,
      getAdaptations,
      getPersonalizedDefaults,
      enableAdaptiveMode
    } = useRTUX();

    const [personalizedProps, setPersonalizedProps] = useState<any>({});
    const interactionStartTime = useRef<number>(0);

    useEffect(() => {
      if (enableAdaptiveMode && options.enablePersonalization) {
        const defaults = getPersonalizedDefaults(options.componentName);
        setPersonalizedProps(defaults)
}
    }, [enableAdaptiveMode, options.componentName]);

    const handleInteraction = (action: string,
  success: boolean = true, errorMessage?: string) => {
      const interactionTime = performance.now() - interactionStartTime.current;

      reportFeedback({
        componentName: options.componentName,
        action,
        timestamp: new Date(),
        metadata: {
          interactionTime,
          success,
          errorMessage,
          userSatisfaction: success ? 0.8 : 0.2,
          context: JSON.stringify(props)
        }
      })
};

    const enhancedProps = {
      ...props,
      ...personalizedProps,
      onInteractionStart: () => {
        interactionStartTime.current = performance.now()
},
      onInteraction: handleInteraction
    };

    return <Component {...enhancedProps} />
};

  WrappedComponent.displayName = `withAdaptiveUX(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Adaptive Input Component
export const AdaptiveInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  componentName: string
}> = ({ value, onChange, placeholder, type = 'text', componentName }) => {
  const { reportFeedback, getPersonalizedDefaults, enableAdaptiveMode } = useRTUX();
  const [defaultValue, setDefaultValue] = useState('');
  const interactionStartTime = useRef<number>(0);

  useEffect(() => {
    if (enableAdaptiveMode) {
      const defaults = getPersonalizedDefaults(componentName);
      if (defaults.defaultValue) {
        setDefaultValue(defaults.defaultValue)
}
    }
  }, [componentName, enableAdaptiveMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Report feedback for value changes
    reportFeedback({
      componentName,
      action: 'value_changed',
  timestamp: new Date(),
      metadata: {
        interactionTime: performance.now() - interactionStartTime.current,
        success: true,
  userSatisfaction: 0.8,
        context: JSON.stringify({ value: newValue, type })
      }
    })
};

  const handleFocus = () => {
    interactionStartTime.current = performance.now();
    reportFeedback({
      componentName,
      action: 'focused',
  timestamp: new Date(),
      metadata: {
        interactionTime: 0,
  success: true,
        userSatisfaction: 0.7,
        context: JSON.stringify({ type })
      }
    })
};

  const handleBlur = () => {
    reportFeedback({
      componentName,
      action: 'blurred',
  timestamp: new Date(),
      metadata: {
        interactionTime: performance.now() - interactionStartTime.current,
        success: true,
  userSatisfaction: 0.8,
        context: JSON.stringify({ finalValue: value, type })
      }
    })
};

  return (
    <input
      type={type}
      value={value || defaultValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        padding: '8px 12px',
  border: '1px solid #ccc',
        borderRadius: '4px',
  background: enableAdaptiveMode ? '#f8f9fa' : '#fff'
      }}
    />
  )
};

// UX Analytics Dashboard
export const UXAnalyticsDashboard: React.FC<{ componentName?: string }> = ({ componentName }) => {
  const { getPerformance, getAdaptations, enableAdaptiveMode } = useRTUX();

  if (!enableAdaptiveMode) {
    return (
      <div style={{ padding: '20px',
  background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🧠 UX Analytics</h3>
        <p>Adaptive mode is disabled</p>
      </div>
    )
}

  const performance = componentName ? getPerformance(componentName) : null;
  const adaptations = componentName ? getAdaptations(componentName) : null;

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '500px'
    }}>
      <h3>🧠 Real-Time UX Analytics</h3>

      {componentName && performance && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Performance Metrics - {componentName}</h4>
          <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>Success Rate: {(performance.successRate * 100).toFixed(1)}%</div>
            <div>Avg Time: {performance.averageInteractionTime.toFixed(0)}ms</div>
            <div>Satisfaction: {(performance.userSatisfaction * 100).toFixed(1)}%</div>
            <div>Usage: {performance.usageFrequency.toFixed(1)}/day</div>
          </div>
        </div>
      )}

      {componentName && adaptations && adaptations.length > 0 && (
        <div>
          <h4>Recent Adaptations</h4>
          <div style={{ maxHeight: '200px',
  overflowY: 'auto' }}>
            {adaptations.slice(-5).map((adaptation, index) => (
              <div key={index} style={{
                padding: '8px',
  background: '#333',
                marginBottom: '8px',
  borderRadius: '4px',
                fontSize: '12px'
              }}>
                <strong>{adaptation.type}:</strong> {adaptation.target} = {String(adaptation.value)}
                <br />
                <small>Confidence: {(adaptation.confidence * 100).toFixed(0)}%</small>
                <br />
                <small>{adaptation.reason}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
};
