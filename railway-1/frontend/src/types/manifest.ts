// ==================== SHARED MANIFEST TYPES ====================
// Centralized type definitions for AI-BOS platform

export interface AppManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  components: ComponentDefinition[];
  pages: PageDefinition[];
  data: DataDefinition[];
  api: APIDefinition[];
  security: SecurityDefinition;
  performance: PerformanceDefinition;
  metadata: Record<string, any>;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  type: 'ui' | 'logic' | 'data' | 'integration';
  props: PropDefinition[];
  events: EventDefinition[];
  examples: ExampleDefinition[];
  documentation: string;
}

export interface PageDefinition {
  id: string;
  name: string;
  path: string;
  description: string;
  components: string[];
  layout: string;
  metadata: Record<string, any>;
}

export interface DataDefinition {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'cache';
  schema: Record<string, any>;
  description: string;
}

export interface APIDefinition {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters: ParameterDefinition[];
  responses: ResponseDefinition[];
}

export interface SecurityDefinition {
  policies: PolicyDefinition[];
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
}

export interface PerformanceDefinition {
  metrics: MetricDefinition[];
  optimizations: OptimizationDefinition[];
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface EventDefinition {
  name: string;
  description: string;
  payload: Record<string, any>;
}

export interface ExampleDefinition {
  id: string;
  title: string;
  description: string;
  code: string;
  preview: string;
  interactive: boolean;
}

export interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ResponseDefinition {
  status: number;
  description: string;
  schema: Record<string, any>;
}

export interface PolicyDefinition {
  name: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionDefinition {
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface MetricDefinition {
  name: string;
  description: string;
  target: number;
  current: number;
  status: 'pass' | 'warn' | 'fail';
}

export interface OptimizationDefinition {
  name: string;
  description: string;
  impact: string;
  implementation: string;
}

// ==================== TELEMETRY TYPES ====================
export interface TelemetryEvent {
  id: string;
  timestamp: Date;
  type: 'user_action' | 'system_event' | 'error' | 'performance' | 'ai_interaction';
  category: string;
  action: string;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
  tenantId?: string;
  metadata: {
    userAgent: string;
    url: string;
    component: string;
    version: string;
  };
}

export interface TelemetryMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByCategory: Record<string, number>;
  averageProcessingTime: number;
  errorRate: number;
  activeUsers: number;
  sessionDuration: number;
}

// ==================== AI STREAMING TYPES ====================
export interface AIStreamingToken {
  id: string;
  content: string;
  confidence: number;
  timestamp: Date;
  metadata: {
    model: string;
    temperature: number;
    maxTokens: number;
    stopSequences: string[];
  };
}

export interface AIStreamingResponse {
  id: string;
  tokens: AIStreamingToken[];
  status: 'streaming' | 'completed' | 'error';
  totalTokens: number;
  processingTime: number;
  metadata: {
    model: string;
    prompt: string;
    userId: string;
    sessionId: string;
  };
}

// ==================== POLICY EVALUATION TYPES ====================
export interface PolicyExpression {
  id: string;
  name: string;
  description: string;
  expression: string;
  type: 'security' | 'compliance' | 'performance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

export interface PolicyEvaluationResult {
  id: string;
  policyId: string;
  timestamp: Date;
  result: 'pass' | 'fail' | 'warn';
  details: Record<string, any>;
  recommendations: string[];
  metadata: {
    evaluationTime: number;
    context: string;
    userId: string;
  };
}

// ==================== PLUGIN SYSTEM TYPES ====================
export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  dependencies: string[];
  permissions: string[];
  entryPoint: string;
  metadata: {
    icon: string;
    screenshots: string[];
    documentation: string;
    repository: string;
    license: string;
  };
}

export interface PluginInstance {
  id: string;
  pluginId: string;
  status: 'installing' | 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  metrics: {
    usageCount: number;
    lastUsed: Date;
    performance: number;
  };
  metadata: {
    installedAt: Date;
    updatedAt: Date;
    version: string;
  };
}

// ==================== SESSION REPLAY TYPES ====================
export interface SessionEvent {
  id: string;
  timestamp: Date;
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'error' | 'performance';
  data: Record<string, any>;
  metadata: {
    url: string;
    element: string;
    coordinates: { x: number; y: number };
    sessionId: string;
    userId: string;
  };
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  events: SessionEvent[];
  metadata: {
    duration: number;
    eventCount: number;
    errorCount: number;
    performance: {
      loadTime: number;
      renderTime: number;
      interactionTime: number;
    };
  };
}

// ==================== BACKEND LOGGING TYPES ====================
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context: Record<string, any>;
  metadata: {
    service: string;
    version: string;
    environment: string;
    requestId: string;
    userId: string;
    tenantId: string;
  };
}

export interface LogBatch {
  id: string;
  entries: LogEntry[];
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: {
    batchSize: number;
    processingTime: number;
    destination: string;
  };
}

// ==================== DOCUMENTATION TYPES ====================
export interface GeneratedDocumentation {
  id: string;
  timestamp: Date;
  manifestId: string;
  sections: DocSection[];
  metadata: {
    totalPages: number;
    totalComponents: number;
    totalAPIs: number;
    generationTime: number;
    aiImprovements: number;
  };
  formats: {
    markdown: string;
    html: string;
    pdf: string;
    apiDocs: string;
  };
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  type: 'overview' | 'components' | 'api' | 'security' | 'performance' | 'examples';
  subsections: DocSubsection[];
  interactive: boolean;
}

export interface DocSubsection {
  id: string;
  title: string;
  content: string;
  code?: string;
  examples?: ExampleDefinition[];
}

export interface DocExport {
  id: string;
  timestamp: Date;
  format: 'markdown' | 'html' | 'pdf' | 'api' | 'all';
  data: string | Blob;
  metadata: {
    size: number;
    pages: number;
    components: number;
    generationTime: number;
  };
}

export interface AIDocSuggestion {
  id: string;
  timestamp: Date;
  type: 'improvement' | 'example' | 'clarification' | 'best_practice';
  title: string;
  description: string;
  section: string;
  code?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoApply: boolean;
}

// ==================== COACH MODE TYPES ====================
export interface CoachSuggestion {
  id: string;
  timestamp: Date;
  type: 'tip' | 'best_practice' | 'optimization' | 'warning' | 'inspiration';
  title: string;
  description: string;
  category: 'ui' | 'performance' | 'security' | 'accessibility' | 'code_quality' | 'user_experience';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actionItems: string[];
  codeExample?: string;
  reasoning: string;
  confidence: number;
  autoApply: boolean;
  metadata: {
    context: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    timeToImplement: number;
    impact: 'low' | 'medium' | 'high' | 'revolutionary';
  };
}

export interface LearningMilestone {
  id: string;
  timestamp: Date;
  type: 'skill_acquired' | 'best_practice_mastered' | 'optimization_learned' | 'pattern_recognized';
  title: string;
  description: string;
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  points: number;
  badge?: string;
  metadata: {
    timeSpent: number;
    attempts: number;
    successRate: number;
  };
}

export interface PerformanceUpdate {
  id: string;
  timestamp: Date;
  metrics: {
    buildSpeed: number;
    codeQuality: number;
    userExperience: number;
    performance: number;
    accessibility: number;
    overall: number;
  };
  trends: {
    buildSpeed: 'improving' | 'stable' | 'declining';
    codeQuality: 'improving' | 'stable' | 'declining';
    userExperience: 'improving' | 'stable' | 'declining';
    performance: 'improving' | 'stable' | 'declining';
    accessibility: 'improving' | 'stable' | 'declining';
  };
  insights: string[];
  recommendations: string[];
}

// ==================== MARKETPLACE DEPLOYMENT TYPES ====================
export interface MarketplaceDeployment {
  id: string;
  timestamp: Date;
  manifestId: string;
  status: 'pending' | 'processing' | 'published' | 'failed';
  marketplace: {
    appId: string;
    url: string;
    category: string;
    tags: string[];
    rating: number;
    downloads: number;
    revenue: number;
    featured: boolean;
  };
  quality: {
    score: number;
    checks: QualityCheck[];
    passed: number;
    failed: number;
    warnings: number;
  };
  security: {
    score: number;
    scans: SecurityScan[];
    vulnerabilities: number;
    passed: boolean;
  };
  performance: {
    score: number;
    metrics: PerformanceMetric[];
    optimizations: string[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    score: number;
  };
  analytics: {
    views: number;
    installations: number;
    reviews: number;
    rating: number;
  };
}

export interface QualityCheck {
  id: string;
  timestamp: Date;
  type: 'code_quality' | 'performance' | 'accessibility' | 'seo' | 'documentation' | 'testing';
  name: string;
  description: string;
  status: 'pass' | 'warn' | 'fail';
  score: number;
  details: Record<string, any>;
  recommendations: string[];
}

export interface SecurityScan {
  id: string;
  timestamp: Date;
  type: 'vulnerability' | 'dependency' | 'code_analysis' | 'permission' | 'data_protection';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pass' | 'warn' | 'fail';
  details: Record<string, any>;
  remediation: string[];
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'pass' | 'warn' | 'fail';
}
