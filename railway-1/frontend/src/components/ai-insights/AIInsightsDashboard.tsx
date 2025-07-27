'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Zap,
  Shield,
  Target,
  BarChart3,
  Grid3X3,
  List,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Eye,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Sparkles
} from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { useAIBOSStore } from '@/lib/store';
import { useOllamaStatus } from '@/hooks/useOllamaStatus';
import { useSchemaAnalysisWithOllama } from '@/hooks/useSchemaAnalysisWithOllama';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

// ==================== REVOLUTIONARY AI INTEGRATION ====================
import { XAISystem } from '@/lib/xai-system';
import { HybridIntelligenceSystem } from '@/lib/hybrid-intelligence';
import {
  designTokens,
  SecurityValidation,
  RateLimiter,
  Logger,
  createMemoryCache,
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
} from 'aibos-shared-infrastructure';

// ==================== TYPES ====================

interface AIInsightsDashboardProps {
  className?: string;
  tenantId?: string;
  userId?: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'security' | 'optimization' | 'prediction' | 'anomaly' | 'recommendation';
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
  actions?: InsightAction[];
  xaiExplanation?: any; // XAI System integration
  hybridReasoning?: any; // Hybrid Intelligence integration
}

interface InsightAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'modal';
  action: string;
  icon?: React.ReactNode;
}

// ==================== REVOLUTIONARY AI SYSTEMS ====================

// Initialize XAI System for explainable AI
const xaiSystem = XAISystem.getInstance();

// Initialize Hybrid Intelligence for ML + Business rules
const hybridIntelligence = HybridIntelligenceSystem.getInstance();

// Initialize shared infrastructure components
const sharedCache = createMemoryCache({ maxSize: 1000, ttl: 300000 });
const sharedLogger = Logger;
const sharedSecurity = SecurityValidation;
const sharedRateLimiter = RateLimiter;

// ==================== AI INSIGHTS DASHBOARD ====================

export function AIInsightsDashboard({ className, tenantId, userId }: AIInsightsDashboardProps) {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { manifestor, health, isHealthy } = useManifestor();
  const manifestLoading = false; // TODO: Add loading state to useManifestor
  const manifestError = null; // TODO: Add error state to useManifestor
  const moduleConfig = useModuleConfig('ai-insights');
  const isModuleEnabled = useModuleEnabled('ai-insights');

  // Check permissions for current user
  const currentUser = { id: userId || 'anonymous', role: 'user', permissions: [] };
  const canView = usePermission('ai-insights', 'view', currentUser);
  const canCreate = usePermission('ai-insights', 'create', currentUser);
  const canEdit = usePermission('ai-insights', 'edit', currentUser);
  const canDelete = usePermission('ai-insights', 'delete', currentUser);
  const canExport = usePermission('ai-insights', 'export', currentUser);
  const canConfigure = usePermission('ai-insights', 'configure', currentUser);
  const canMonitor = usePermission('ai-insights', 'monitor', currentUser);
  const canAnalyze = usePermission('ai-insights', 'analyze', currentUser);
  const canOptimize = usePermission('ai-insights', 'optimize', currentUser);
  const canPredict = usePermission('ai-insights', 'predict', currentUser);

  // Get configuration from manifest
  const refreshInterval = moduleConfig.refreshInterval || 30000;
  const maxInsights = moduleConfig.maxInsights || 50;
  const confidenceThreshold = moduleConfig.confidenceThreshold || 0.7;
  const impactLevels = moduleConfig.impactLevels || ['low', 'medium', 'high', 'critical'];
  const categories = moduleConfig.categories || ['performance', 'security', 'optimization', 'prediction', 'anomaly', 'recommendation'];
  const statuses = moduleConfig.statuses || ['pending', 'in-progress', 'completed', 'failed'];
  const features = moduleConfig.features || {};
  const uiConfig = moduleConfig.ui || {};
  const performanceConfig = moduleConfig.performance || {};
  const securityConfig = moduleConfig.security || {};

  // ==================== COMPONENT STATE ====================
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);

  // ==================== REVOLUTIONARY AI INTEGRATION ====================
  const [xaiExplanations, setXaiExplanations] = useState<Map<string, any>>(new Map());
  const [hybridDecisions, setHybridDecisions] = useState<Map<string, any>>(new Map());
  const [aiConfidence, setAiConfidence] = useState<number>(0);

  const { addNotification } = useAIBOSStore();

  // Ollama integration hooks
  const { checkOllamaStatus, isLoading: ollamaLoading, error: ollamaError, status: ollamaStatusData } = useOllamaStatus();
  const { analyzeSchema, isLoading: analysisLoading, error: analysisError, currentAnalysis: schemaAnalysis } = useSchemaAnalysisWithOllama();

  // ==================== REVOLUTIONARY AI FUNCTIONS ====================

  // Generate explainable AI insights with XAI System
  const generateExplainableInsight = useCallback(async (data: any, context: any): Promise<Insight> => {
    try {
      // Use XAI System to explain the insight generation
      const xaiExplanation = await xaiSystem.explainInsightsGeneration(
        data,
        { type: 'ai-insight', category: 'performance' },
        context
      );

      // Use Hybrid Intelligence for decision making
      const hybridDecision = await hybridIntelligence.processInsightsGeneration(
        data,
        { type: 'ai-insight', category: 'performance' },
        context
      );

      // Create insight with XAI and Hybrid Intelligence integration
      const insight: Insight = {
        id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `AI-Generated Insight: ${data.title || 'Performance Optimization'}`,
        description: data.description || 'AI-powered insight for system optimization',
        category: data.category || 'performance',
        confidence: hybridDecision.confidence,
        impact: hybridDecision.decision.impact || 'medium',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          xaiExplanation,
          hybridDecision,
          modelVersion: VERSION,
          environment: getEnvironment(),
          tenantId,
          userId
        },
        xaiExplanation,
        hybridReasoning: hybridDecision.reasoning
      };

      // Log with shared infrastructure
      console.log('AI Insight Generated', {
        insightId: insight.id,
        confidence: insight.confidence,
        category: insight.category,
        xaiExplanation: xaiExplanation.id,
        hybridDecision: hybridDecision.decision
      });

      return insight;
    } catch (error) {
      console.error('Failed to generate explainable insight', { error });
      throw error;
    }
  }, [tenantId, userId]);

  // ==================== CORE FUNCTIONS ====================

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use manifest-driven configuration for caching
      const cacheKey = `insights-${tenantId}-${selectedCategory}`;
      const cachedInsights = performanceConfig.caching ? await sharedCache.get(cacheKey) : null;

      if (cachedInsights) {
        setInsights(cachedInsights as Insight[]);
        setLoading(false);
        return;
      }

      // Use manifest-driven API endpoint with permissions
      const apiUrl = `/api/ai-insights?category=${selectedCategory}&tenantId=${tenantId}&userId=${userId}&maxInsights=${maxInsights}&confidenceThreshold=${confidenceThreshold}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();

      // Generate explainable insights with XAI and Hybrid Intelligence
      const explainableInsights = await Promise.all(
        data.insights.map(async (insight: any) => {
          try {
            return await generateExplainableInsight(insight, {
              tenantId,
              userId,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Failed to generate explainable insight', { insightId: insight.id, error });
            return insight; // Fallback to original insight
          }
        })
      );

      setInsights(explainableInsights);

      // Cache the results using manifest-driven configuration
      if (performanceConfig.caching) {
        await sharedCache.set(cacheKey, explainableInsights as any, 300000); // 5 minutes
      }

      // Update XAI and Hybrid Intelligence state
      const xaiMap = new Map();
      const hybridMap = new Map();
      let totalConfidence = 0;

      explainableInsights.forEach(insight => {
        if (insight.xaiExplanation) {
          xaiMap.set(insight.id, insight.xaiExplanation);
        }
        if (insight.hybridReasoning) {
          hybridMap.set(insight.id, insight.hybridReasoning);
        }
        totalConfidence += insight.confidence;
      });

      setXaiExplanations(xaiMap);
      setHybridDecisions(hybridMap);
      setAiConfidence(explainableInsights.length > 0 ? totalConfidence / explainableInsights.length : 0);

      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(errorMessage);
      console.error('Failed to fetch insights', { error: errorMessage, tenantId, userId });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, tenantId, userId, generateExplainableInsight]);

  const generateNewInsight = useCallback(async () => {
    if (!tenantId || !userId) {
      addNotification({
        type: 'error',
        title: 'Missing Context',
        message: 'Tenant ID and User ID are required for insight generation',
        isRead: false
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          tenantId,
          userId,
          context: {
            timestamp: new Date().toISOString(),
            environment: getEnvironment(),
            version: VERSION
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insight: ${response.statusText}`);
      }

      const data = await response.json();

      addNotification({
        type: 'success',
        title: 'Insight Generated',
        message: 'New AI insight has been generated successfully',
        isRead: false
      });

      // Refresh insights after generation
      await fetchInsights();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insight';
      console.error('[AIInsights] Failed to generate insight', { error: errorMessage });

      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage,
        isRead: false
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCategory, tenantId, userId, generateExplainableInsight, addNotification]);

  const executeAction = useCallback(async (insightId: string, action: InsightAction) => {
    try {
      const response = await fetch(`/api/ai-insights/${insightId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.action,
          tenantId,
          userId,
          context: {
            timestamp: new Date().toISOString(),
            environment: getEnvironment(),
            version: VERSION
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to execute action: ${response.statusText}`);
      }

      const data = await response.json();

      addNotification({
        type: 'success',
        title: 'Action Executed',
        message: `Successfully executed: ${action.label}`,
        isRead: false
      });

      // Refresh insights after action execution
      await fetchInsights();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute action';
      console.error('[AIInsights] Failed to execute insight action', { insightId, action: action.action, error: errorMessage });

      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: errorMessage,
        isRead: false
      });
    }
  }, [tenantId, userId, fetchInsights, addNotification]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Manifest-driven auto-refresh
  useEffect(() => {
    if (!features.realTimeUpdates) return;

    const interval = setInterval(() => {
      fetchInsights();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchInsights, refreshInterval, features.realTimeUpdates]);

  useEffect(() => {
    if (ollamaStatusData) {
      setOllamaStatus(ollamaStatusData);
    }
  }, [ollamaStatusData]);

  // ==================== RENDER FUNCTIONS ====================

  const renderInsightCard = (insight: Insight) => {
    const xaiExplanation = xaiExplanations.get(insight.id);
    const hybridDecision = hybridDecisions.get(insight.id);

    return (
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: uiConfig.animations ? 0.3 : 0 }}
        className="group"
      >
        <DashboardCard
          title={insight.title}
          value={insight.confidence}
          subtitle={`${insight.category} • ${insight.impact} impact`}
          className="h-full hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                insight.category === 'performance' ? 'bg-blue-100 text-blue-600' :
                insight.category === 'security' ? 'bg-red-100 text-red-600' :
                insight.category === 'optimization' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {insight.category === 'performance' && <Activity className="h-4 w-4" />}
                {insight.category === 'security' && <Shield className="h-4 w-4" />}
                {insight.category === 'optimization' && <Zap className="h-4 w-4" />}
                {insight.category === 'prediction' && <TrendingUp className="h-4 w-4" />}
                {insight.category === 'anomaly' && <AlertTriangle className="h-4 w-4" />}
                {insight.category === 'recommendation' && <Lightbulb className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                insight.status === 'completed' ? 'bg-green-100 text-green-800' :
                insight.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                insight.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {insight.status}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(insight.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* XAI Explanation */}
          {features.xai && xaiExplanation && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Explainable AI
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {xaiExplanation.reasoning}
              </p>
            </div>
          )}

          {/* Hybrid Intelligence Decision */}
          {features.hybridIntelligence && hybridDecision && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Hybrid Intelligence
                </span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                {hybridDecision.reasoning}
              </p>
            </div>
          )}

          {/* Actions */}
          {insight.actions && insight.actions.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {insight.actions.map((action) => {
                // Check permissions for each action type
                const canExecuteAction =
                  (action.action === 'edit' && canEdit) ||
                  (action.action === 'delete' && canDelete) ||
                  (action.action === 'export' && canExport) ||
                  (action.action === 'configure' && canConfigure) ||
                  (action.action === 'monitor' && canMonitor) ||
                  (action.action === 'analyze' && canAnalyze) ||
                  (action.action === 'optimize' && canOptimize) ||
                  (action.action === 'predict' && canPredict) ||
                  !['edit', 'delete', 'export', 'configure', 'monitor', 'analyze', 'optimize', 'predict'].includes(action.action);

                if (!canExecuteAction) return null;

                return (
                  <Button
                    key={action.id}
                    onClick={() => executeAction(insight.id, action)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Metadata */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created: {new Date(insight.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(insight.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </DashboardCard>
      </motion.div>
    );
  };

  // ==================== MAIN RENDER ====================

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading Manifestor...</span>
        </div>
      </div>
    );
  }

  if (manifestError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Manifestor Error"
        description={manifestError}
        action={{
          label: "Retry",
          onClick: () => window.location.reload(),
          variant: "outline"
        }}
      />
    );
  }

  if (!isModuleEnabled) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="AI Insights Module Disabled"
        description="The AI Insights module is currently disabled. Please contact your administrator to enable this feature."
        action={{
          label: "Contact Admin",
          onClick: () => window.location.href = '/admin',
          variant: "outline"
        }}
      />
    );
  }

  if (!canView) {
    return (
      <EmptyState
        icon={Shield}
        title="Access Denied"
        description="You don't have permission to view AI Insights. Please contact your administrator for access."
        action={{
          label: "Request Access",
          onClick: () => window.location.href = '/support',
          variant: "outline"
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading AI Insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Error Loading Insights"
        description={error}
        action={{
          label: "Try Again",
          onClick: fetchInsights,
          variant: "outline"
        }}
      />
    );
  }

  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter(insight => insight.category === selectedCategory);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Insights Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revolutionary AI-powered insights with explainable AI and hybrid intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ==================== MANIFEST-DRIVEN AI STATUS ==================== */}
          <div className="flex items-center gap-2 text-sm">
            {features.xai && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">XAI:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {xaiExplanations.size} insights
                </span>
              </div>
            )}
            {features.hybridIntelligence && (
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">Hybrid:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {hybridDecisions.size} decisions
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(aiConfidence * 100)}%
              </span>
            </div>
            {features.realTimeUpdates && (
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600 dark:text-gray-400">Live:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {refreshInterval / 1000}s
                </span>
              </div>
            )}
          </div>

          {canCreate && (
            <Button
              onClick={generateNewInsight}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Insight
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ==================== FILTERS ==================== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="optimization">Optimization</option>
              <option value="prediction">Prediction</option>
              <option value="anomaly">Anomaly</option>
              <option value="recommendation">Recommendation</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ==================== INSIGHTS GRID ==================== */}
      {filteredInsights.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No AI Insights Found"
          description="Generate your first AI-powered insight to get started with revolutionary explainable AI capabilities."
          action={canCreate ? {
            label: "Generate First Insight",
            onClick: generateNewInsight,
            variant: "primary" as const
          } : undefined}
        />
      ) : (
        <div className={
          viewMode === 'grid'
            ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${uiConfig.responsive ? 'responsive-grid' : ''}`
            : 'space-y-4'
        }>
          {filteredInsights.map(renderInsightCard)}
        </div>
      )}

      {/* ==================== MANIFEST-DRIVEN AI FOOTER ==================== */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Manifest-Driven AI Features:
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              {features.xai && <span>• XAI System: {xaiExplanations.size} explanations</span>}
              {features.hybridIntelligence && <span>• Hybrid Intelligence: {hybridDecisions.size} decisions</span>}
              {features.realTimeUpdates && <span>• Real-time Updates: {refreshInterval / 1000}s interval</span>}
              {performanceConfig.caching && <span>• Intelligent Caching: Enabled</span>}
              <span>• Shared Infrastructure: {PACKAGE_NAME} v{VERSION}</span>
              <span>• Environment: {getEnvironment()}</span>
              <span>• Manifest: ai-insights v{moduleConfig.version || '1.0.0'}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Powered by AI-BOS Manifest-Driven AI Platform
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIInsightsDashboard;
