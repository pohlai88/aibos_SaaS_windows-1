// ==================== AI-BOS DATABASE API CLIENT ====================
// Frontend Integration with Backend AI Database Automation with Ollama
// Steve Jobs Philosophy: "Simple can be harder than complex."

// ==================== TYPES ====================
export interface TypeScriptInterface {
  name: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface DatabaseOrchestrationRequest {
  typescriptInterfaces: string[];
}

export interface DatabaseOrchestrationResponse {
  success: boolean;
  data: any;
  requestId: string;
  timestamp: string;
  ollamaStatus?: string;
  aiConfidence?: number;
}

export interface ComplianceVerificationResponse {
  success: boolean;
  data: {
    iso27001: { compliant: boolean; score: number };
    hipaa: { compliant: boolean; score: number };
    soc2: { compliant: boolean; score: number };
    gdpr: { compliant: boolean; score: number };
    pci: { compliant: boolean; score: number };
    audit: any;
  };
  requestId: string;
  timestamp: string;
}

export interface AuditQueryFilters {
  eventTypes?: string[];
  userIds?: string[];
  tenantIds?: string[];
  startDate?: string;
  endDate?: string;
  resources?: string[];
  actions?: string[];
}

export interface AuditQueryRequest {
  filters: AuditQueryFilters;
}

export interface AuditQueryResponse {
  success: boolean;
  data: any[];
  count: number;
  requestId: string;
  timestamp: string;
}

export interface AuditReportRequest {
  filters: AuditQueryFilters;
}

export interface AuditReportResponse {
  success: boolean;
  data: any;
  requestId: string;
  timestamp: string;
}

export interface ComplianceMonitoringResponse {
  success: boolean;
  data: {
    realTime: {
      iso27001: { status: string; violations: number; lastCheck: string };
      hipaa: { status: string; violations: number; lastCheck: string };
      soc2: { status: string; violations: number; lastCheck: string };
      gdpr: { status: string; violations: number; lastCheck: string };
      pci: { status: string; violations: number; lastCheck: string };
    };
    alerts: string[];
    trends: {
      complianceScore: number;
      trend: string;
      recommendations: string[];
    };
  };
  requestId: string;
  timestamp: string;
}

export interface RetentionManagementResponse {
  success: boolean;
  data: {
    archived: number;
    compliance: {
      compliant: boolean;
      retentionPeriod: string;
      archivedRecords: number;
      nextArchive: string;
    };
    nextArchive: string;
    recommendations: string[];
  };
  requestId: string;
  timestamp: string;
}

export interface ComplianceReportResponse {
  success: boolean;
  data: any;
  requestId: string;
  timestamp: string;
}

export interface DatabaseHealthResponse {
  success: boolean;
  data: {
    status: string;
    compliance: any;
    audit: any;
    retention: any;
    timestamp: string;
    recommendations: string[];
    ollamaStatus?: string;
    aiModel?: string;
  };
  requestId: string;
  timestamp: string;
}

export interface MigrationRequest {
  fromVersion: string;
  toVersion: string;
}

export interface MigrationResponse {
  success: boolean;
  data: {
    success: boolean;
    fromVersion: string;
    toVersion: string;
    timestamp: string;
    message: string;
  };
  requestId: string;
  timestamp: string;
}

export interface RollbackRequest {
  schemaVersion: string;
}

export interface RollbackResponse {
  success: boolean;
  data: {
    success: boolean;
    schemaVersion: string;
    timestamp: string;
    message: string;
  };
  requestId: string;
  timestamp: string;
}

export interface BackupResponse {
  success: boolean;
  data: {
    id: string;
    timestamp: string;
    size: number;
    location: string;
    checksum: string;
    status: string;
  };
  requestId: string;
  timestamp: string;
}

export interface RestoreRequest {
  backupId: string;
}

export interface RestoreResponse {
  success: boolean;
  data: {
    success: boolean;
    backupId: string;
    timestamp: string;
    message: string;
  };
  requestId: string;
  timestamp: string;
}

export interface OptimizationResponse {
  success: boolean;
  data: {
    success: boolean;
    improvements: string[];
    performanceGain: number;
    timestamp: string;
    recommendations: string[];
  };
  requestId: string;
  timestamp: string;
}

export interface SecurityAuditResponse {
  success: boolean;
  data: {
    success: boolean;
    vulnerabilities: string[];
    riskScore: number;
    timestamp: string;
    recommendations: string[];
  };
  requestId: string;
  timestamp: string;
}

export interface DatabaseStatusResponse {
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    compliance: any;
    audit: any;
    retention: any;
  };
  requestId: string;
  timestamp: string;
}

export interface DatabaseInfoResponse {
  success: boolean;
  data: {
    name: string;
    version: string;
    description: string;
    features: string[];
    compliance: Record<string, boolean>;
    security: Record<string, any>;
    performance: Record<string, any>;
  };
  requestId: string;
  timestamp: string;
}

// ==================== API CLIENT ====================
class AIBOSDatabaseAPIClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
  }

  // ==================== PRIVATE METHODS ====================
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}/api/database${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      console.log(`🌐 Making ${method} request to: ${url}`);

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ ${method} request successful:`, result.success);

      return result as T;

    } catch (error) {
      console.error(`❌ ${method} request failed:`, error);
      throw error;
    }
  }

  // ==================== DATABASE ORCHESTRATION ====================

  /**
   * Orchestrate database creation from TypeScript interfaces
   */
  async orchestrateDatabase(typescriptInterfaces: string[]): Promise<DatabaseOrchestrationResponse> {
    return this.makeRequest<DatabaseOrchestrationResponse>('/orchestrate', 'POST', {
      typescriptInterfaces
    });
  }

  /**
   * Generate compliant schema from TypeScript interfaces
   */
  async generateSchema(typescriptInterfaces: string[]): Promise<DatabaseOrchestrationResponse> {
    return this.makeRequest<DatabaseOrchestrationResponse>('/schema', 'POST', {
      typescriptInterfaces
    });
  }

  // ==================== COMPLIANCE ====================

  /**
   * Verify database compliance
   */
  async verifyCompliance(): Promise<ComplianceVerificationResponse> {
    return this.makeRequest<ComplianceVerificationResponse>('/compliance/verify', 'GET');
  }

  /**
   * Monitor real-time compliance
   */
  async monitorCompliance(): Promise<ComplianceMonitoringResponse> {
    return this.makeRequest<ComplianceMonitoringResponse>('/compliance/monitor', 'GET');
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(): Promise<ComplianceReportResponse> {
    return this.makeRequest<ComplianceReportResponse>('/compliance/report', 'GET');
  }

  // ==================== AUDIT ====================

  /**
   * Query audit trail
   */
  async queryAuditTrail(filters: AuditQueryFilters): Promise<AuditQueryResponse> {
    return this.makeRequest<AuditQueryResponse>('/audit/query', 'POST', { filters });
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(filters: AuditQueryFilters): Promise<AuditReportResponse> {
    return this.makeRequest<AuditReportResponse>('/audit/report', 'POST', { filters });
  }

  /**
   * Manage audit retention
   */
  async manageRetention(): Promise<RetentionManagementResponse> {
    return this.makeRequest<RetentionManagementResponse>('/audit/retention', 'GET');
  }

  // ==================== HEALTH AND MONITORING ====================

  /**
   * Perform database health check
   */
  async healthCheck(): Promise<DatabaseHealthResponse> {
    return this.makeRequest<DatabaseHealthResponse>('/health', 'GET');
  }

  /**
   * Get database status
   */
  async getStatus(): Promise<DatabaseStatusResponse> {
    return this.makeRequest<DatabaseStatusResponse>('/status', 'GET');
  }

  /**
   * Get database information
   */
  async getInfo(): Promise<DatabaseInfoResponse> {
    return this.makeRequest<DatabaseInfoResponse>('/info', 'GET');
  }

  // ==================== MIGRATION AND ROLLBACK ====================

  /**
   * Migrate database schema
   */
  async migrateSchema(fromVersion: string, toVersion: string): Promise<MigrationResponse> {
    return this.makeRequest<MigrationResponse>('/migrate', 'POST', {
      fromVersion,
      toVersion
    });
  }

  /**
   * Emergency rollback
   */
  async emergencyRollback(schemaVersion: string): Promise<RollbackResponse> {
    return this.makeRequest<RollbackResponse>('/rollback', 'POST', {
      schemaVersion
    });
  }

  // ==================== BACKUP AND RESTORE ====================

  /**
   * Create database backup
   */
  async createBackup(): Promise<BackupResponse> {
    return this.makeRequest<BackupResponse>('/backup', 'POST');
  }

  /**
   * Restore database backup
   */
  async restoreBackup(backupId: string): Promise<RestoreResponse> {
    return this.makeRequest<RestoreResponse>('/restore', 'POST', { backupId });
  }

  // ==================== PERFORMANCE AND SECURITY ====================

  /**
   * Optimize database performance
   */
  async optimizePerformance(): Promise<OptimizationResponse> {
    return this.makeRequest<OptimizationResponse>('/optimize', 'POST');
  }

  /**
   * Perform security audit
   */
  async performSecurityAudit(): Promise<SecurityAuditResponse> {
    return this.makeRequest<SecurityAuditResponse>('/security/audit', 'GET');
  }

  // ==================== OLLAMA INTEGRATION METHODS ====================

  /**
   * Get Ollama status and AI model information
   */
  async getOllamaStatus(): Promise<{ status: string; model: string; temperature: number; ollamaStatus: string }> {
    return this.makeRequest<{ status: string; model: string; temperature: number; ollamaStatus: string }>('/ai-database/health', 'GET');
  }

  /**
   * Analyze schema with real Ollama AI inference
   */
  async analyzeSchemaWithOllama(schema: any): Promise<{
    success: boolean;
    data: {
      quality: any;
      complexity: any;
      performance: any;
      security: any;
      compliance: any;
      recommendations: any[];
      risks: any[];
      optimizations: any[];
      confidence: number;
    };
    ollamaStatus: string;
    aiConfidence: number;
  }> {
    return this.makeRequest('/ai-database/analyze-schema', 'POST', { schema });
  }

  /**
   * Generate migration plan with real Ollama AI inference
   */
  async generateMigrationPlanWithOllama(oldSchema: any, newSchema: any): Promise<{
    success: boolean;
    data: {
      steps: any[];
      estimatedTime: number;
      riskLevel: string;
      aiConfidence: number;
      recommendations: string[];
    };
    ollamaStatus: string;
  }> {
    return this.makeRequest('/ai-database/migration-plan', 'POST', { oldSchema, newSchema });
  }

  /**
   * Optimize schema with real Ollama AI inference
   */
  async optimizeSchemaWithOllama(schema: any): Promise<{
    success: boolean;
    data: {
      optimizedSchema: any;
      changes: any[];
      improvements: any[];
      confidence: number;
    };
    ollamaStatus: string;
  }> {
    return this.makeRequest('/ai-database/optimize-schema', 'POST', { schema });
  }
}

// ==================== SINGLETON INSTANCE ====================
const aiBOSDatabaseAPI = new AIBOSDatabaseAPIClient();

// ==================== REACT HOOKS ====================
import { useState, useCallback } from 'react';

export function useDatabaseOrchestration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const orchestrate = useCallback(async (typescriptInterfaces: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.orchestrateDatabase(typescriptInterfaces);
      setResult(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { orchestrate, loading, error, result };
}

export function useComplianceVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compliance, setCompliance] = useState<any>(null);

  const verify = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.verifyCompliance();
      setCompliance(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading, error, compliance };
}

export function useAuditTrail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const query = useCallback(async (filters: AuditQueryFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.queryAuditTrail(filters);
      setEvents(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { query, loading, error, events };
}

export function useDatabaseHealth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<any>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.healthCheck();
      setHealth(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { check, loading, error, health };
}

// ==================== OLLAMA INTEGRATION HOOKS ====================

export function useOllamaStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.getOllamaStatus();
      setStatus(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { check, loading, error, status };
}

export function useSchemaAnalysisWithOllama() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyze = useCallback(async (schema: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.analyzeSchemaWithOllama(schema);
      setAnalysis(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error, analysis };
}

export function useMigrationPlanWithOllama() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);

  const generate = useCallback(async (oldSchema: any, newSchema: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.generateMigrationPlanWithOllama(oldSchema, newSchema);
      setPlan(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error, plan };
}

export function useSchemaOptimizationWithOllama() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<any>(null);

  const optimize = useCallback(async (schema: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiBOSDatabaseAPI.optimizeSchemaWithOllama(schema);
      setOptimization(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { optimize, loading, error, optimization };
}

// ==================== UTILITY FUNCTIONS ====================
export function createTypeScriptInterfaces(interfaces: TypeScriptInterface[]): string[] {
  return interfaces.map(intf => intf.content);
}

export function validateTypeScriptInterfaces(interfaces: string[]): boolean {
  return interfaces.every(intf =>
    typeof intf === 'string' &&
    intf.trim().length > 0 &&
    (intf || '').includes('interface')
  );
}

export function formatComplianceScore(compliance: any): number {
  const scores = [
    compliance.iso27001?.score || 0,
    compliance.hipaa?.score || 0,
    compliance.soc2?.score || 0,
    compliance.gdpr?.score || 0,
    compliance.pci?.score || 0
  ];

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function getComplianceStatus(compliance: any): 'compliant' | 'non-compliant' | 'warning' {
  const scores = [
    compliance.iso27001?.score || 0,
    compliance.hipaa?.score || 0,
    compliance.soc2?.score || 0,
    compliance.gdpr?.score || 0,
    compliance.pci?.score || 0
  ];

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  if (averageScore >= 90) return 'compliant';
  if (averageScore >= 70) return 'warning';
  return 'non-compliant';
}

// ==================== EXPORTS ====================
export default aiBOSDatabaseAPI;
export { AIBOSDatabaseAPIClient };
