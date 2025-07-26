'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAIBOSStore } from '@/lib/store';
import { Logger } from 'aibos-shared-infrastructure';

// ==================== TYPES ====================

interface SchemaAnalysisRequest {
  schema: any;
  analysisType: 'validation' | 'optimization' | 'migration' | 'compliance';
  options?: {
    includeSuggestions?: boolean;
    includePerformance?: boolean;
    includeSecurity?: boolean;
    model?: string;
  };
}

interface SchemaAnalysisResult {
  id: string;
  timestamp: Date;
  analysisType: string;
  schema: any;
  results: {
    isValid: boolean;
    issues: SchemaIssue[];
    suggestions: SchemaSuggestion[];
    performance: PerformanceAnalysis;
    security: SecurityAnalysis;
    compliance: ComplianceAnalysis;
  };
  metadata: {
    modelUsed: string;
    processingTime: number;
    confidence: number;
    version: string;
  };
}

interface SchemaIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  field?: string;
  suggestion?: string;
  impact?: string;
}

interface SchemaSuggestion {
  id: string;
  type: 'optimization' | 'security' | 'performance' | 'compliance';
  title: string;
  description: string;
  implementation: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

interface PerformanceAnalysis {
  score: number;
  bottlenecks: string[];
  recommendations: string[];
  estimatedImprovement: number;
}

interface SecurityAnalysis {
  score: number;
  vulnerabilities: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceAnalysis {
  score: number;
  standards: string[];
  violations: string[];
  recommendations: string[];
  complianceLevel: 'compliant' | 'partial' | 'non-compliant';
}

// ==================== SCHEMA ANALYSIS HOOK ====================

export const useSchemaAnalysisWithOllama = () => {
  const [analysisHistory, setAnalysisHistory] = useState<SchemaAnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<SchemaAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useAIBOSStore();

  // ==================== ANALYSIS FUNCTIONS ====================

  const analyzeSchema = useCallback(async (request: SchemaAnalysisRequest): Promise<SchemaAnalysisResult> => {
    try {
      setIsLoading(true);
      setError(null);

      Logger.info();

      // Call the AI-governed database API for schema analysis
      const response = await fetch('/api/ai-database/schema/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          useOllama: true,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Schema analysis failed: ${response.statusText}`);
      }

      const result: SchemaAnalysisResult = await response.json();

      // Update state
      setCurrentAnalysis(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 analyses

      Logger.info();

      // Show notification based on results
      const criticalIssues = result.results.issues.filter(issue => issue.severity === 'critical');
      const highIssues = result.results.issues.filter(issue => issue.severity === 'high');

      if (criticalIssues.length > 0) {
        addNotification({
          type: 'error',
          title: 'Critical Schema Issues Found',
          message: `${criticalIssues.length} critical issues detected in schema analysis`,
          isRead: false
        });
      } else if (highIssues.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Schema Issues Detected',
          message: `${highIssues.length} high-priority issues found in schema analysis`,
          isRead: false
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Schema Analysis Complete',
          message: 'Schema analysis completed successfully with no critical issues',
          isRead: false
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);

      Logger.error();

      addNotification({
        type: 'error',
        title: 'Schema Analysis Failed',
        message: `Failed to analyze schema: ${errorMessage}`,
        isRead: false
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const validateSchema = useCallback(async (schema: any): Promise<SchemaAnalysisResult> => {
    return analyzeSchema({
      schema,
      analysisType: 'validation',
      options: {
        includeSuggestions: true,
        includePerformance: true,
        includeSecurity: true
      }
    });
  }, [analyzeSchema]);

  const optimizeSchema = useCallback(async (schema: any): Promise<SchemaAnalysisResult> => {
    return analyzeSchema({
      schema,
      analysisType: 'optimization',
      options: {
        includeSuggestions: true,
        includePerformance: true,
        includeSecurity: true
      }
    });
  }, [analyzeSchema]);

  const generateMigrationPlan = useCallback(async (currentSchema: any, targetSchema: any): Promise<SchemaAnalysisResult> => {
    return analyzeSchema({
      schema: { current: currentSchema, target: targetSchema },
      analysisType: 'migration',
      options: {
        includeSuggestions: true,
        includePerformance: true,
        includeSecurity: true
      }
    });
  }, [analyzeSchema]);

  const checkCompliance = useCallback(async (schema: any, standards: string[] = ['GDPR', 'SOC2', 'ISO27001']): Promise<SchemaAnalysisResult> => {
    return analyzeSchema({
      schema: { schema, standards },
      analysisType: 'compliance',
      options: {
        includeSuggestions: true,
        includeSecurity: true
      }
    });
  }, [analyzeSchema]);

  const getAnalysisById = useCallback((id: string): SchemaAnalysisResult | undefined => {
    return analysisHistory.find(analysis => analysis.id === id);
  }, [analysisHistory]);

  const clearHistory = useCallback(() => {
    setAnalysisHistory([]);
    setCurrentAnalysis(null);
    Logger.info();
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  const getIssuesBySeverity = useCallback((severity: 'low' | 'medium' | 'high' | 'critical') => {
    if (!currentAnalysis) return [];
    return currentAnalysis.results.issues.filter(issue => issue.severity === severity);
  }, [currentAnalysis]);

  const getSuggestionsByType = useCallback((type: 'optimization' | 'security' | 'performance' | 'compliance') => {
    if (!currentAnalysis) return [];
    return currentAnalysis.results.suggestions.filter(suggestion => suggestion.type === type);
  }, [currentAnalysis]);

  const exportAnalysis = useCallback(async (analysisId: string, format: 'json' | 'pdf' | 'csv' = 'json') => {
    try {
      const analysis = getAnalysisById(analysisId);
      if (!analysis) {
        throw new Error('Analysis not found');
      }

      const response = await fetch('/api/ai-database/schema/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          format
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema-analysis-${analysisId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        addNotification({
          type: 'success',
          title: 'Analysis Exported',
          message: `Schema analysis exported as ${format.toUpperCase()}`,
          isRead: false
        });
      } else {
        throw new Error('Failed to export analysis');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      Logger.error();

      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: `Failed to export analysis: ${errorMessage}`,
        isRead: false
      });
    }
  }, [getAnalysisById, addNotification]);

  // ==================== RETURN VALUES ====================

  return {
    // State
    analysisHistory,
    currentAnalysis,
    isLoading,
    error,

    // Analysis functions
    analyzeSchema,
    validateSchema,
    optimizeSchema,
    generateMigrationPlan,
    checkCompliance,

    // Utility functions
    getAnalysisById,
    clearHistory,
    getIssuesBySeverity,
    getSuggestionsByType,
    exportAnalysis,

    // Computed values
    hasCurrentAnalysis: !!currentAnalysis,
    totalAnalyses: analysisHistory.length,
    criticalIssues: currentAnalysis ? getIssuesBySeverity('critical') : [],
    highIssues: currentAnalysis ? getIssuesBySeverity('high') : [],
    optimizationSuggestions: currentAnalysis ? getSuggestionsByType('optimization') : [],
    securitySuggestions: currentAnalysis ? getSuggestionsByType('security') : []
  };
};
