import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  trafficSplit: Record<string, number>;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  metrics: ABMetrics;
  createdAt: Date;
  updatedAt: Date
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  isControl: boolean;
  trafficPercentage: number
}

interface ABMetrics {
  impressions: Record<string, number>;
  conversions: Record<string, number>;
  clickThroughRate: Record<string, number>;
  conversionRate: Record<string, number>;
  revenue: Record<string, number>;
  averageOrderValue: Record<string, number>
}

interface ABTestContextType {
  // Test management
  tests: ABTest[];
  activeTests: ABTest[];
  createTest: (test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTest: (testId: string,
  updates: Partial<ABTest>) => void;
  deleteTest: (testId: string) => void;
  startTest: (testId: string) => void;
  stopTest: (testId: string) => void;

  // Variant assignment
  getVariant: (testId: string, userId?: string) => ABVariant | null;
  assignVariant: (testId: string,
  userId: string) => ABVariant;

  // Event tracking
  trackImpression: (testId: string,
  variantId: string, userId?: string) => void;
  trackConversion: (testId: string,
  variantId: string, userId?: string, value?: number) => void;
  trackEvent: (testId: string,
  variantId: string, eventName: string, data?: any) => void;

  // Analytics
  getTestResults: (testId: string) => ABTestResults;
  getTestMetrics: (testId: string) => ABMetrics;
  exportTestData: (testId: string) => string;

  // Configuration
  enableABTesting: boolean;
  setEnableABTesting: (enabled: boolean) => void;
  enableAnalytics: boolean;
  setEnableAnalytics: (enabled: boolean) => void
}

interface ABTestResults {
  testId: string;
  variantResults: Record<string, VariantResult>;
  statisticalSignificance: Record<string, number>;
  winner?: string;
  confidence: number;
  sampleSize: number
}

interface VariantResult {
  variantId: string;
  impressions: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  improvement: number
}

// A/B Test Manager
class ABTestManager {
  private static instance: ABTestManager;
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private events: ABTestEvent[] = [];

  static getInstance(): ABTestManager {
    if (!ABTestManager.instance) {
      ABTestManager.instance = new ABTestManager()
}
    return ABTestManager.instance
}

  createTest(test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): string {
    const testId = `ab-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTest: ABTest = {
      ...test,
      id: testId,
  createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tests.set(testId, newTest);
    return testId
}

  updateTest(testId: string,
  updates: Partial<ABTest>): void {
    const test = this.tests.get(testId);
    if (!test) return;

    const updatedTest = { ...test, ...updates, updatedAt: new Date() };
    this.tests.set(testId, updatedTest)
}

  deleteTest(testId: string): void {
    this.tests.delete(testId)
}

  startTest(testId: string): void {
    this.updateTest(testId, { status: 'running' })
}

  stopTest(testId: string): void {
    this.updateTest(testId, { status: 'completed',
  endDate: new Date() })
}

  getVariant(testId: string, userId?: string): ABVariant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;

    if (userId) {
      // Check if user already has an assignment
      const userTests = this.userAssignments.get(userId);
      if (userTests && userTests.has(testId)) {
        const variantId = userTests.get(testId)!;
        return test.variants.find(v => v.id === variantId) || null
}
    }

    // Assign new variant based on traffic split
    const assignedVariant = this.assignVariant(testId, userId || 'anonymous');
    return assignedVariant
}

  assignVariant(testId: string,
  userId: string): ABVariant {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    // Simple random assignment based on traffic split
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.trafficPercentage;
      if (random <= cumulative) {
        // Store assignment
        if (!this.userAssignments.has(userId)) {
          this.userAssignments.set(userId, new Map())
}
        this.userAssignments.get(userId)!.set(testId, variant.id);

        return variant
}
    }

    // Fallback to control variant
    const controlVariant = test.variants.find(v => v.isControl);
    if (controlVariant) {
      if (!this.userAssignments.has(userId)) {
        this.userAssignments.set(userId, new Map())
}
      this.userAssignments.get(userId)!.set(testId, controlVariant.id);
      return controlVariant
}

    throw new Error('No control variant found')
}

  trackImpression(testId: string,
  variantId: string, userId?: string): void {
    this.trackEvent(testId, variantId, 'impression', { userId })
}

  trackConversion(testId: string,
  variantId: string, userId?: string, value?: number): void {
    this.trackEvent(testId, variantId, 'conversion', { userId, value })
}

  trackEvent(testId: string,
  variantId: string, eventName: string, data?: any): void {
    const event: ABTestEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      testId,
      variantId,
      eventName,
      data,
      timestamp: new Date()
    };

    this.events.push(event)
}

  getTestResults(testId: string): ABTestResults {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    const variantResults: Record<string, VariantResult> = {};
    const testEvents = this.events.filter(e => e.testId === testId);

    test.variants.forEach(variant => {
      const variantEvents = testEvents.filter(e => e.variantId === variant.id);
      const impressions = variantEvents.filter(e => e.eventName === 'impression').length;
      const conversions = variantEvents.filter(e => e.eventName === 'conversion').length;
      const revenue = variantEvents
        .filter(e => e.eventName === 'conversion')
        .reduce((sum, e) => sum + (e.data?.value || 0), 0);

      variantResults[variant.id] = {
        variantId: variant.id,
        impressions,
        conversions,
        clickThroughRate: impressions > 0 ? (conversions / impressions) * 100: 0,
  conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
        revenue,
        averageOrderValue: conversions > 0 ? revenue / conversions: 0,
  improvement: 0 // Will be calculated below
      }
});

    // Calculate improvements relative to control
    const controlVariant = test.variants.find(v => v.isControl);
    if (controlVariant && variantResults[controlVariant.id]) {
      const controlRate = variantResults[controlVariant.id].conversionRate;

      Object.values(variantResults).forEach(result => {
        if (result.variantId !== controlVariant.id && controlRate > 0) {
          result.improvement = ((result.conversionRate - controlRate) / controlRate) * 100
}
      })
}

    // Determine winner
    let winner: string | undefined;
    let maxImprovement = 0;
    Object.values(variantResults).forEach(result => {
      if (result.improvement > maxImprovement) {
        maxImprovement = result.improvement;
        winner = result.variantId
}
    });

    // Calculate statistical significance (simplified)
    const totalImpressions = Object.values(variantResults).reduce((sum, r) => sum + r.impressions, 0);
    const confidence = Math.min(95, totalImpressions / 100); // Simplified confidence calculation

    return {
      testId,
      variantResults,
      statisticalSignificance: {},
      winner,
      confidence,
      sampleSize: totalImpressions
    }
}

  getTestMetrics(testId: string): ABMetrics {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    const metrics: ABMetrics = {
      impressions: {},
      conversions: {},
      clickThroughRate: {},
      conversionRate: {},
      revenue: {},
      averageOrderValue: {}
    };

    const testEvents = this.events.filter(e => e.testId === testId);

    test.variants.forEach(variant => {
      const variantEvents = testEvents.filter(e => e.variantId === variant.id);
      const impressions = variantEvents.filter(e => e.eventName === 'impression').length;
      const conversions = variantEvents.filter(e => e.eventName === 'conversion').length;
      const revenue = variantEvents
        .filter(e => e.eventName === 'conversion')
        .reduce((sum, e) => sum + (e.data?.value || 0), 0);

      metrics.impressions[variant.id] = impressions;
      metrics.conversions[variant.id] = conversions;
      metrics.clickThroughRate[variant.id] = impressions > 0 ? (conversions / impressions) * 100 : 0;
      metrics.conversionRate[variant.id] = impressions > 0 ? (conversions / impressions) * 100 : 0;
      metrics.revenue[variant.id] = revenue;
      metrics.averageOrderValue[variant.id] = conversions > 0 ? revenue / conversions : 0
});

    return metrics
}

  exportTestData(testId: string): string {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    const exportData = {
      test,
      events: this.events.filter(e => e.testId === testId),
      results: this.getTestResults(testId),
      metrics: this.getTestMetrics(testId)
    };

    return JSON.stringify(exportData, null, 2)
}

  getAllTests(): ABTest[] {
    return Array.from(this.tests.values())
}

  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running')
}
}

interface ABTestEvent {
  id: string;
  testId: string;
  variantId: string;
  eventName: string;
  data?: any;
  timestamp: Date
}

// Context
const ABTestContext = createContext<ABTestContextType | null>(null);

// Provider Component
interface ABTestProviderProps {
  children: ReactNode;
  enableABTesting?: boolean;
  enableAnalytics?: boolean;
  enableAuditTrail?: boolean
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({
  children,
  enableABTesting = true,
  enableAnalytics = true,
  enableAuditTrail = true
}) => {
  const [enableABTestingState, setEnableABTestingState] = useState(enableABTesting);
  const [enableAnalyticsState, setEnableAnalyticsState] = useState(enableAnalytics);
  const abTestManager = useRef(ABTestManager.getInstance());

  const createTest = (test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const testId = abTestManager.current.createTest(test);

    if (enableAuditTrail) {
      auditLogger.info('A/B test created', {
        testId,
        testName: test.name,
        variants: test.variants.length
      })
}

    return testId
};

  const updateTest = (testId: string,
  updates: Partial<ABTest>) => {
    abTestManager.current.updateTest(testId, updates);

    if (enableAuditTrail) {
      auditLogger.info('A/B test updated', { testId, updates })
}
  };

  const deleteTest = (testId: string) => {
    abTestManager.current.deleteTest(testId);

    if (enableAuditTrail) {
      auditLogger.info('A/B test deleted', { testId })
}
  };

  const startTest = (testId: string) => {
    abTestManager.current.startTest(testId);

    if (enableAuditTrail) {
      auditLogger.info('A/B test started', { testId })
}
  };

  const stopTest = (testId: string) => {
    abTestManager.current.stopTest(testId);

    if (enableAuditTrail) {
      auditLogger.info('A/B test stopped', { testId })
}
  };

  const getVariant = (testId: string, userId?: string): ABVariant | null => {
    if (!enableABTestingState) return null;
    return abTestManager.current.getVariant(testId, userId)
};

  const assignVariant = (testId: string,
  userId: string): ABVariant => {
    if (!enableABTestingState) {
      throw new Error('A/B testing is disabled')
}
    return abTestManager.current.assignVariant(testId, userId)
};

  const trackImpression = (testId: string,
  variantId: string, userId?: string) => {
    if (!enableAnalyticsState) return;

    abTestManager.current.trackImpression(testId, variantId, userId);

    if (enableAuditTrail) {
      auditLogger.info('A/B test impression tracked', { testId, variantId, userId })
}
  };

  const trackConversion = (testId: string,
  variantId: string, userId?: string, value?: number) => {
    if (!enableAnalyticsState) return;

    abTestManager.current.trackConversion(testId, variantId, userId, value);

    if (enableAuditTrail) {
      auditLogger.info('A/B test conversion tracked', { testId, variantId, userId, value })
}
  };

  const trackEvent = (testId: string,
  variantId: string, eventName: string, data?: any) => {
    if (!enableAnalyticsState) return;

    abTestManager.current.trackEvent(testId, variantId, eventName, data);

    if (enableAuditTrail) {
      auditLogger.info('A/B test event tracked', { testId, variantId, eventName, data })
}
  };

  const getTestResults = (testId: string): ABTestResults => {
    return abTestManager.current.getTestResults(testId)
};

  const getTestMetrics = (testId: string): ABMetrics => {
    return abTestManager.current.getTestMetrics(testId)
};

  const exportTestData = (testId: string): string => {
    return abTestManager.current.exportTestData(testId)
};

  const value: ABTestContextType = {
    tests: abTestManager.current.getAllTests(),
    activeTests: abTestManager.current.getActiveTests(),
    createTest,
    updateTest,
    deleteTest,
    startTest,
    stopTest,
    getVariant,
    assignVariant,
    trackImpression,
    trackConversion,
    trackEvent,
    getTestResults,
    getTestMetrics,
    exportTestData,
    enableABTesting: enableABTestingState,
  setEnableABTesting: setEnableABTestingState,
    enableAnalytics: enableAnalyticsState,
  setEnableAnalytics: setEnableAnalyticsState
  };

  return (
    <ABTestContext.Provider value={value}>
      {children}
    </ABTestContext.Provider>
  )
};

// Hook
export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider')
}
  return context
};

// HOC for A/B test-enabled components
export const withABTest = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    testId: string;
    variants: ABVariant[];
    enableTracking?: boolean
}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      getVariant,
      trackImpression,
      trackConversion,
      enableABTesting
    } = useABTest();

    const [currentVariant, setCurrentVariant] = useState<ABVariant | null>(null);
    const [userId] = useState(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
      if (enableABTesting) {
        const variant = getVariant(options.testId, userId);
        setCurrentVariant(variant);

        if (variant && options.enableTracking) {
          trackImpression(options.testId, variant.id, userId)
}
      }
    }, [options.testId, userId]);

    if (!enableABTesting || !currentVariant) {
      return <Component {...props} />
}

    // Apply variant configuration to props
    const variantProps = { ...props, ...currentVariant.config };

    return <Component {...variantProps} />
};

  WrappedComponent.displayName = `withABTest(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// A/B Test Button Component
export const ABTestButton: React.FC<{
  testId: string;
  onClick: () => void;
  children: ReactNode;
  variants: Array<{
    id: string;
    config: {
      text?: string;
      style?: React.CSSProperties;
      className?: string
}
}>
}> = ({ testId, onClick, children, variants }) => {
  const { getVariant, trackConversion, enableABTesting } = useABTest();
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [userId] = useState(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (enableABTesting) {
      const variant = getVariant(testId, userId);
      if (variant) {
        const variantConfig = variants.find(v => v.id === variant.id);
        setCurrentVariant(variantConfig)
}
    }
  }, [testId, userId, variants]);

  const handleClick = () => {
    if (enableABTesting && currentVariant) {
      trackConversion(testId, currentVariant.id, userId)
}
    onClick()
};

  if (!enableABTesting || !currentVariant) {
    return (
      <button onClick={handleClick}>
        {children}
      </button>
    )
}

  return (
    <button
      onClick={handleClick}
      style={currentVariant.config.style}
      className={currentVariant.config.className}
    >
      {currentVariant.config.text || children}
    </button>
  )
};

// A/B Test Dashboard Component
export const ABTestDashboard: React.FC = () => {
  const {
    tests,
    activeTests,
    createTest,
    startTest,
    stopTest,
    getTestResults,
    enableABTesting
  } = useABTest();

  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<ABTestResults | null>(null);

  const handleCreateTest = () => {
    const testId = createTest({
      name: 'Sample A/B Test',
  description: 'Testing button variations',
      variants: [
        {
          id: 'control',
  name: 'Control',
          description: 'Original button',
  config: { text: 'Click Me',
  style: { background: '#007bff' } },
          isControl: true,
  trafficPercentage: 50
        },
  {
    id: 'variant-a',
  name: 'Variant A',
          description: 'Blue button with different text',
  config: { text: 'Get Started',
  style: { background: '#28a745' } },
          isControl: false,
  trafficPercentage: 50
        }
      ],
      trafficSplit: { control: 50, 'variant-a': 50 },
      status: 'draft',
  startDate: new Date(),
      metrics: {
        impressions: {},
        conversions: {},
        clickThroughRate: {},
        conversionRate: {},
        revenue: {},
        averageOrderValue: {}
      }
    });

    const newTest = tests.find(t => t.id === testId);
    if (newTest) setSelectedTest(newTest)
};

  const handleViewResults = (testId: string) => {
    try {
      const results = getTestResults(testId);
      setTestResults(results)
} catch (error) {
      console.error('Failed to get test results:', error)
}
  };

  if (!enableABTesting) {
    return (
      <div style={{ padding: '20px',
  background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🧪 A/B Testing Dashboard</h3>
        <p>A/B testing is disabled</p>
      </div>
    )
}

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '600px'
    }}>
      <h3>🧪 A/B Testing Dashboard</h3>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleCreateTest}
          style={{
            background: '#28a745',
  color: '#fff',
            border: 'none',
  padding: '8px 16px',
            borderRadius: '4px',
  cursor: 'pointer'
          }}
        >
          Create New Test
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Active Tests ({activeTests.length})</h4>
        <div style={{
          maxHeight: '200px',
  overflowY: 'auto',
          background: '#333',
  padding: '10px',
          borderRadius: '4px'
        }}>
          {activeTests.map(test => (
            <div key={test.id} style={{
              padding: '10px',
  background: '#444',
              marginBottom: '8px',
  borderRadius: '4px'
            }}>
              <div><strong>{test.name}</strong></div>
              <div style={{ fontSize: '12px',
  color: '#888' }}>{test.description}</div>
              <div style={{ fontSize: '12px' }}>
                Variants: {test.variants.length} |
                Status: {test.status}
              </div>
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => handleViewResults(test.id)}
                  style={{
                    background: '#007bff',
  color: '#fff',
                    border: 'none',
  padding: '4px 8px',
                    borderRadius: '2px',
  fontSize: '12px',
                    cursor: 'pointer',
  marginRight: '8px'
                  }}
                >
                  View Results
                </button>
                <button
                  onClick={() => stopTest(test.id)}
                  style={{
                    background: '#dc3545',
  color: '#fff',
                    border: 'none',
  padding: '4px 8px',
                    borderRadius: '2px',
  fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Stop Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {testResults && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Test Results</h4>
          <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
            <div>Sample Size: {testResults.sampleSize}</div>
            <div>Confidence: {testResults.confidence.toFixed(1)}%</div>
            {testResults.winner && (
              <div style={{ color: '#28a745' }}>
                Winner: {testResults.winner}
              </div>
            )}

            <div style={{ marginTop: '10px' }}>
              <h5>Variant Results:</h5>
              {Object.values(testResults.variantResults).map(result => (
                <div key={result.variantId} style={{
                  padding: '8px',
  background: '#444',
                  marginBottom: '4px',
  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <div><strong>{result.variantId}</strong></div>
                  <div>Impressions: {result.impressions}</div>
                  <div>Conversions: {result.conversions}</div>
                  <div>Conversion Rate: {result.conversionRate.toFixed(2)}%</div>
                  {result.improvement !== 0 && (
                    <div style={{
                      color: result.improvement > 0 ? '#28a745' : '#dc3545'
                    }}>
                      Improvement: {result.improvement.toFixed(2)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
};
