import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface AIAssistant {
  id: string;
  name: string;
  type: 'product-naming' | 'code-generation' | 'content-suggestion' | 'data-analysis' | 'custom';
  description: string;
  endpoint: string;
  config: AIConfig;
  isActive: boolean;
  usage: AIUsage
}

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  customHeaders?: Record<string, string>;
  retryAttempts: number;
  timeout: number
}

interface AIUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: Date;
  cost: number
}

interface AIRequest {
  id: string;
  assistantId: string;
  prompt: string;
  context?: any;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: any;
  error?: string;
  responseTime?: number
}

interface AIHookConfig {
  assistant: string;
  autoExplain?: boolean;
  auditTrail?: boolean;
  suggestionsCount?: number;
  confidenceThreshold?: number;
  customPrompt?: string
}

interface AIContextType {
  // AI Assistant management
  assistants: AIAssistant[];
  registerAssistant: (assistant: AIAssistant) => void;
  unregisterAssistant: (assistantId: string) => void;
  updateAssistant: (assistantId: string,
  updates: Partial<AIAssistant>) => void;

  // AI Requests
  makeRequest: (assistantId: string,
  prompt: string, context?: any) => Promise<any>;
  getRequestHistory: (assistantId?: string) => AIRequest[];

  // Hooks
  useAISuggestions: (config: AIHookConfig) => {
    suggestions: any[];
    isLoading: boolean;
    error: string | null;
    generateSuggestions: (input: string) => Promise<void>;
    clearSuggestions: () => void
};

  useAIExplanation: (config: AIHookConfig) => {
    explanation: string | null;
    isLoading: boolean;
    error: string | null;
    explain: (content: string) => Promise<void>;
    clearExplanation: () => void
};

  useAIAnalysis: (config: AIHookConfig) => {
    analysis: any | null;
    isLoading: boolean;
    error: string | null;
    analyze: (data: any) => Promise<void>;
    clearAnalysis: () => void
};

  // Analytics
  getUsageAnalytics: () => AIUsageAnalytics;
  getCostAnalytics: () => CostAnalytics
}

interface AIUsageAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByAssistant: Record<string, number>;
  requestsByType: Record<string, number>
}

interface CostAnalytics {
  totalCost: number;
  costByAssistant: Record<string, number>;
  costByMonth: Record<string, number>;
  averageCostPerRequest: number
}

// AI Request Manager
class AIRequestManager {
  private static instance: AIRequestManager;
  private requests: AIRequest[] = [];
  private assistants: Map<string, AIAssistant> = new Map();

  static getInstance(): AIRequestManager {
    if (!AIRequestManager.instance) {
      AIRequestManager.instance = new AIRequestManager()
}
    return AIRequestManager.instance
}

  registerAssistant(assistant: AIAssistant): void {
    this.assistants.set(assistant.id, assistant)
}

  unregisterAssistant(assistantId: string): void {
    this.assistants.delete(assistantId)
}

  async makeRequest(assistantId: string,
  prompt: string, context?: any): Promise<any> {
    const assistant = this.assistants.get(assistantId);
    if (!assistant) {
      throw new Error(`Assistant ${assistantId} not found`)
}

    const request: AIRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assistantId,
      prompt,
      context,
      timestamp: new Date(),
      status: 'pending'
    };

    this.requests.push(request);

    try {
      request.status = 'processing';
      const startTime = Date.now();

      // Simulate AI request
      const response = await this.simulateAIRequest(assistant, prompt, context);

      request.status = 'completed';
      request.response = response;
      request.responseTime = Date.now() - startTime;

      // Update assistant usage
      assistant.usage.totalRequests++;
      assistant.usage.successfulRequests++;
      assistant.usage.averageResponseTime =
        (assistant.usage.averageResponseTime + request.responseTime!) / 2;
      assistant.usage.lastUsed = new Date();

      return response
} catch (error) {
      request.status = 'failed';
      request.error = error instanceof Error ? error.message : 'Unknown error';

      // Update assistant usage
      assistant.usage.totalRequests++;
      assistant.usage.failedRequests++;
      assistant.usage.lastUsed = new Date();

      throw error
}
  }

  private async simulateAIRequest(assistant: AIAssistant,
  prompt: string, context?: any): Promise<any> {
    // Simulate different AI behaviors based on assistant type
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    switch (assistant.type) {
      case 'product-naming':
        return this.generateProductNames(prompt);

      case 'code-generation':
        return this.generateCode(prompt, context);

      case 'content-suggestion':
        return this.generateContentSuggestions(prompt);

      case 'data-analysis':
        return this.analyzeData(prompt, context);

      case 'custom':
        return this.handleCustomRequest(assistant, prompt, context);

      default:
        return { response: `AI response for: ${prompt}` }
}
  }

  private generateProductNames(prompt: string): any {
    const productTypes = ['app', 'service', 'platform', 'tool', 'solution'];
    const adjectives = ['smart', 'quick', 'easy', 'powerful', 'innovative', 'secure'];
    const nouns = ['hub', 'pro', 'max', 'plus', 'suite', 'works'];

    const suggestions = [];
    for (let i = 0; i < 5; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const type = productTypes[Math.floor(Math.random() * productTypes.length)];

      suggestions.push(`${adjective}${noun.charAt(0).toUpperCase() + noun.slice(1)} ${type}`)
}

    return { suggestions, type: 'product-names' }
}

  private generateCode(prompt: string, context?: any): any {
    const language = context?.language || 'javascript';
    const codeSnippets = {
      javascript: `// ${prompt}\nfunction ${prompt.toLowerCase().replace(/\s+/g, '')}() {\n  // Implementation here\n  console.log('${prompt}');\n}`,
      typescript: `// ${prompt}\nfunction ${prompt.toLowerCase().replace(/\s+/g, '')}(): void {\n  // Implementation here\n  console.log('${prompt}');\n}`,
      python: `# ${prompt}\ndef ${prompt.lower().replace(' ', '_')}():\n    # Implementation here\n    print('${prompt}')`
    };

    return {
      code: codeSnippets[language as keyof typeof codeSnippets] || codeSnippets.javascript,
      language,
      type: 'code-generation'
    }
}

  private generateContentSuggestions(prompt: string): any {
    const suggestions = [
      `${prompt} - Enhanced with AI-powered insights`,
      `${prompt} - Optimized for maximum engagement`,
      `${prompt} - Tailored for your target audience`,
      `${prompt} - Designed for conversion optimization`,
      `${prompt} - Crafted for brand consistency`
    ];

    return { suggestions, type: 'content-suggestions' }
}

  private analyzeData(prompt: string, context?: any): any {
    const data = context?.data || [];
    const analysis = {
      count: data.length,
      average: data.length > 0 ? data.reduce((a: number,
  b: number) => a + b, 0) / data.length: 0,
  min: data.length > 0 ? Math.min(...data) : 0,
      max: data.length > 0 ? Math.max(...data) : 0,
      insights: [
        `Found ${data.length} data points`,
        `Average value: ${data.length > 0 ? (data.reduce((a: number,
  b: number) => a + b, 0) / data.length).toFixed(2) : 0}`,
        `Range: ${data.length > 0 ? Math.min(...data) : 0} - ${data.length > 0 ? Math.max(...data) : 0}`
      ]
    };

    return { analysis, type: 'data-analysis' }
}

  private handleCustomRequest(assistant: AIAssistant,
  prompt: string, context?: any): any {
    // Custom AI behavior based on assistant configuration
    const customResponse = `${assistant.name} response: ${prompt}`;

    if (assistant.config.systemPrompt) {
      return {
        response: customResponse,
  systemPrompt: assistant.config.systemPrompt,
        type: 'custom'
      }
}

    return { response: customResponse,
  type: 'custom' }
}

  getRequestHistory(assistantId?: string): AIRequest[] {
    if (assistantId) {
      return this.requests.filter(req => req.assistantId === assistantId)
}
    return [...this.requests]
}

  getUsageAnalytics(): AIUsageAnalytics {
    const analytics: AIUsageAnalytics = {
      totalRequests: 0,
  successfulRequests: 0,
      failedRequests: 0,
  averageResponseTime: 0,
      requestsByAssistant: {},
      requestsByType: {}
    };

    this.requests.forEach(request => {
      analytics.totalRequests++;

      if (request.status === 'completed') {
        analytics.successfulRequests++
} else if (request.status === 'failed') {
        analytics.failedRequests++
}

      analytics.requestsByAssistant[request.assistantId] =
        (analytics.requestsByAssistant[request.assistantId] || 0) + 1;

      const assistant = this.assistants.get(request.assistantId);
      if (assistant) {
        analytics.requestsByType[assistant.type] =
          (analytics.requestsByType[assistant.type] || 0) + 1
}

      if (request.responseTime) {
        analytics.averageResponseTime =
          (analytics.averageResponseTime + request.responseTime) / 2
}
    });

    return analytics
}
}

// Context
const AIContext = createContext<AIContextType | null>(null);

// Provider Component
interface AIProviderProps {
  children: ReactNode;
  enableAuditTrail?: boolean;
  defaultAssistants?: AIAssistant[]
}

export const AIProvider: React.FC<AIProviderProps> = ({
  children,
  enableAuditTrail = true,
  defaultAssistants = []
}) => {
  const [assistants, setAssistants] = useState<AIAssistant[]>(defaultAssistants);
  const requestManager = useRef(AIRequestManager.getInstance());

  // Register default assistants
  useEffect(() => {
    defaultAssistants.forEach(assistant => {
      requestManager.current.registerAssistant(assistant)
})
}, []);

  const registerAssistant = (assistant: AIAssistant) => {
    setAssistants(prev => [...prev, assistant]);
    requestManager.current.registerAssistant(assistant);

    if (enableAuditTrail) {
      auditLogger.info('AI assistant registered', {
        assistantId: assistant.id,
        assistantName: assistant.name,
        type: assistant.type
      })
}
  };

  const unregisterAssistant = (assistantId: string) => {
    setAssistants(prev => prev.filter(a => a.id !== assistantId));
    requestManager.current.unregisterAssistant(assistantId)
};

  const updateAssistant = (assistantId: string,
  updates: Partial<AIAssistant>) => {
    setAssistants(prev => prev.map(a =>
      a.id === assistantId ? { ...a, ...updates } : a
    ))
};

  const makeRequest = async (assistantId: string,
  prompt: string, context?: any): Promise<any> => {
    const response = await requestManager.current.makeRequest(assistantId, prompt, context);

    if (enableAuditTrail) {
      auditLogger.info('AI request made', {
        assistantId,
        prompt: prompt.substring(0, 100),
        hasContext: !!context
      })
}

    return response
};

  const getRequestHistory = (assistantId?: string): AIRequest[] => {
    return requestManager.current.getRequestHistory(assistantId)
};

  // Custom hooks
  const useAISuggestions = (config: AIHookConfig) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSuggestions = async (input: string) => {
      if (!input.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await makeRequest(config.assistant, input, {
          type: 'suggestions',
  count: config.suggestionsCount || 5,
          threshold: config.confidenceThreshold || 0.7
        });

        setSuggestions(response.suggestions || [])
} catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate suggestions')
} finally {
        setIsLoading(false)
}
    };

    const clearSuggestions = () => {
      setSuggestions([]);
      setError(null)
};

    return {
      suggestions,
      isLoading,
      error,
      generateSuggestions,
      clearSuggestions
    }
};

  const useAIExplanation = (config: AIHookConfig) => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const explain = async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await makeRequest(config.assistant, content, {
          type: 'explanation',
  autoExplain: config.autoExplain
        });

        setExplanation(response.explanation || response.response || 'No explanation available')
} catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate explanation')
} finally {
        setIsLoading(false)
}
    };

    const clearExplanation = () => {
      setExplanation(null);
      setError(null)
};

    return {
      explanation,
      isLoading,
      error,
      explain,
      clearExplanation
    }
};

  const useAIAnalysis = (config: AIHookConfig) => {
    const [analysis, setAnalysis] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = async (data: any) => {
      if (!data) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await makeRequest(config.assistant, 'Analyze this data', {
          type: 'analysis',
          data,
          customPrompt: config.customPrompt
        });

        setAnalysis(response.analysis || response.response || 'No analysis available')
} catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze data')
} finally {
        setIsLoading(false)
}
    };

    const clearAnalysis = () => {
      setAnalysis(null);
      setError(null)
};

    return {
      analysis,
      isLoading,
      error,
      analyze,
      clearAnalysis
    }
};

  const getUsageAnalytics = (): AIUsageAnalytics => {
    return requestManager.current.getUsageAnalytics()
};

  const getCostAnalytics = (): CostAnalytics => {
    const analytics = getUsageAnalytics();
    const totalCost = analytics.totalRequests * 0.01; // $0.01 per request

    return {
      totalCost,
      costByAssistant: {},
      costByMonth: {},
      averageCostPerRequest: analytics.totalRequests > 0 ? totalCost / analytics.totalRequests : 0
    }
};

  const value: AIContextType = {
    assistants,
    registerAssistant,
    unregisterAssistant,
    updateAssistant,
    makeRequest,
    getRequestHistory,
    useAISuggestions,
    useAIExplanation,
    useAIAnalysis,
    getUsageAnalytics,
    getCostAnalytics
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
};

// Hook
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider')
}
  return context
};

// HOC for AI-enhanced components
export const withAI = <P extends object>(
  Component: React.ComponentType<P>,
  config: AIHookConfig
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { useAISuggestions, useAIExplanation, useAIAnalysis } = useAI();

    const suggestions = useAISuggestions(config);
    const explanation = useAIExplanation(config);
    const analysis = useAIAnalysis(config);

    const enhancedProps = {
      ...props,
      aiSuggestions: suggestions,
  aiExplanation: explanation,
      aiAnalysis: analysis
    };

    return <Component {...enhancedProps} />
};

  WrappedComponent.displayName = `withAI(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// AI-enhanced Input Component
export const AIInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  assistant: string;
  autoExplain?: boolean;
  auditTrail?: boolean
}> = ({ value, onChange, placeholder, assistant, autoExplain, auditTrail }) => {
  const { useAISuggestions, useAIExplanation } = useAI();

  const suggestions = useAISuggestions({
    assistant,
    suggestionsCount: 3,
    auditTrail
  });

  const explanation = useAIExplanation({
    assistant,
    autoExplain,
    auditTrail
  });

  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Generate suggestions as user types
    if (newValue.length > 3) {
      suggestions.generateSuggestions(newValue)
} else {
      suggestions.clearSuggestions()
}
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    suggestions.clearSuggestions()
};

  const handleExplain = () => {
    if (value) {
      explanation.explain(value)
}
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
  padding: '8px 12px',
          border: '1px solid #ced4da',
  borderRadius: '4px',
          fontSize: '14px'
        }}
      />

      {suggestions.suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
  top: '100%',
          left: 0,
  right: 0,
          background: '#fff',
  border: '1px solid #ced4da',
          borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {suggestions.suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '8px 12px',
  cursor: 'pointer',
                borderBottom: index < suggestions.suggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa'
}}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
}}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {value && autoExplain && (
        <button
          onClick={handleExplain}
          style={{
            position: 'absolute',
  right: '8px',
            top: '50%',
  transform: 'translateY(-50%)',
            background: 'none',
  border: 'none',
            cursor: 'pointer',
  fontSize: '16px'
          }}
          title="Get AI explanation"
        >
          🤖
        </button>
      )}

      {explanation.explanation && (
        <div style={{
          marginTop: '8px',
  padding: '8px 12px',
          background: '#e3f2fd',
  border: '1px solid #2196f3',
          borderRadius: '4px',
  fontSize: '12px'
        }}>
          <strong>AI Explanation:</strong> {explanation.explanation}
        </div>
      )}
    </div>
  )
};

// AI Dashboard Component
export const AIDashboard: React.FC = () => {
  const {
    assistants,
    getUsageAnalytics,
    getCostAnalytics,
    getRequestHistory
  } = useAI();

  const [analytics, setAnalytics] = useState<AIUsageAnalytics | null>(null);
  const [costAnalytics, setCostAnalytics] = useState<CostAnalytics | null>(null);
  const [requestHistory, setRequestHistory] = useState<AIRequest[]>([]);

  useEffect(() => {
    setAnalytics(getUsageAnalytics());
    setCostAnalytics(getCostAnalytics());
    setRequestHistory(getRequestHistory().slice(-10)); // Last 10 requests
  }, []);

  if (!analytics || !costAnalytics) return null;

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '600px'
    }}>
      <h3>🤖 AI Assistant Dashboard</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Assistants ({assistants.length})</h4>
        <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {assistants.map(assistant => (
            <div key={assistant.id} style={{
              padding: '10px',
  background: assistant.isActive ? '#28a745' : '#6c757d',
              borderRadius: '4px',
  fontSize: '12px'
            }}>
              <div><strong>{assistant.name}</strong></div>
              <div>{assistant.type}</div>
              <div>Requests: {assistant.usage.totalRequests}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Usage Analytics</h4>
        <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>Total Requests: {analytics.totalRequests}</div>
          <div>Success Rate: {analytics.totalRequests > 0 ?
            ((analytics.successfulRequests / analytics.totalRequests) * 100).toFixed(1) : 0}%</div>
          <div>Avg Response Time: {analytics.averageResponseTime.toFixed(0)}ms</div>
          <div>Total Cost: ${costAnalytics.totalCost.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Recent Requests</h4>
        <div style={{
          maxHeight: '200px',
  overflowY: 'auto',
          background: '#333',
  padding: '10px',
          borderRadius: '4px'
        }}>
          {requestHistory.map(request => (
            <div key={request.id} style={{
              padding: '8px',
  background: '#444',
              marginBottom: '8px',
  borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div><strong>{request.assistantId}</strong></div>
              <div>{request.prompt.substring(0, 50)}...</div>
              <div style={{
                color: request.status === 'completed' ? '#28a745' :
                       request.status === 'failed' ? '#dc3545' : '#ffc107'
              }}>
                {request.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};
