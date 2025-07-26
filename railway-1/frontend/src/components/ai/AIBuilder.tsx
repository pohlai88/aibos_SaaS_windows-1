'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  List,
  BarChart3,
  Grid3X3,
  Eye,
  Sparkles,
  Target,
  Lightbulb,
  Download,
  Trash2,
  Brain,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { useAIBOSStore } from '@/lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

// ==================== REVOLUTIONARY AI INTEGRATION ====================
import { getAIBuilderSDK, PromptRequest, PromptResponse } from '@/ai/sdk/AIBuilderSDK';
import { IntelligentCache } from '@/ai/engines/IntelligentCache';
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

interface AIBuilderProps {
  className?: string;
  tenantId?: string;
  userId?: string;
}

interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  type: 'form' | 'list' | 'chart' | 'dashboard' | 'modal' | 'custom';
  domain: 'crm' | 'ecommerce' | 'hr' | 'finance' | 'healthcare' | 'education' | 'general';
  complexity: 'simple' | 'moderate' | 'advanced';
  confidence: number;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  manifest?: any;
  components?: any[];
  workflows?: any[];
  suggestions?: string[];
  error?: string;
  processingTime?: number;
  tokenTrace?: any;
}

interface TabItem {
  id: 'builder' | 'preview' | 'history' | 'templates';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BuilderState {
  prompt: string;
  isGenerating: boolean;
  selectedApp: GeneratedApp | null;
  showPreview: boolean;
  viewMode: 'grid' | 'list';
  selectedDomain: string;
  selectedComplexity: string;
  generatedApps: GeneratedApp[];
  activeTab: 'builder' | 'preview' | 'history' | 'templates';
}

// ==================== REVOLUTIONARY AI SYSTEMS ====================

// Initialize AI Builder SDK
const builderSDK = getAIBuilderSDK();

// Initialize Intelligent Cache for AI responses
let intelligentCache: IntelligentCache | null = null;

const getIntelligentCache = () => {
  if (!intelligentCache) {
    try {
      intelligentCache = new IntelligentCache({
        maxSize: 1000,
        maxEntries: 500,
        defaultTTL: 300000, // 5 minutes
        enablePredictiveCaching: true,
        enableCompression: true,
        evictionPolicy: 'hybrid',
        enableMetrics: true
      });
    } catch (error) {
      console.error('Failed to initialize IntelligentCache:', error);
      // Return a mock cache if initialization fails
      return {
        get: async () => ({ value: null, stale: false }),
        set: async () => {},
        getStats: () => ({ hitRate: 0, missRate: 0, totalEntries: 0, totalSize: 0, maxSize: 0, evictionCount: 0, compressionRatio: 0, warmingPredictions: 0, memoryUsage: 0, performanceScore: 0, averageAccessCount: 0, oldestEntry: null, newestEntry: null })
      };
    }
  }
  return intelligentCache;
};

// Initialize shared infrastructure components
const sharedCache = createMemoryCache({ maxSize: 1000, ttl: 300000 });
const sharedLogger = Logger;
const sharedSecurity = SecurityValidation;
const sharedRateLimiter = RateLimiter;

// ==================== CONSTANTS ====================

const EXAMPLE_PROMPTS = [
  "Create a form to collect customer contact information",
  "Build a dashboard showing sales analytics with charts",
  "Make a list view to manage product inventory",
  "Create a workflow to process customer orders",
  "Build a form to onboard new employees",
  "Create a modal for user settings",
  "Build a chart showing monthly revenue trends",
  "Make a dashboard for project management",
  "Create a form for expense reporting",
  "Build a list for task management"
];

const DOMAINS = [
  { value: 'general', label: 'General'},
  { value: 'crm', label: 'CRM'},
  { value: 'ecommerce', label: 'E-commerce'},
  { value: 'hr', label: 'HR'},
  { value: 'finance', label: 'Finance'},
  { value: 'healthcare', label: 'Healthcare'},
  { value: 'education', label: 'Education'}
];

const COMPLEXITIES = [
  { value: 'simple', label: 'Simple', description: 'Basic functionality' },
  { value: 'moderate', label: 'Moderate', description: 'Standard features' },
  { value: 'advanced', label: 'Advanced', description: 'Complex interactions' }
];

// ==================== AI BUILDER COMPONENT ====================

export function AIBuilder({ className, tenantId, userId }: AIBuilderProps) {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('ai-components');
  const isModuleEnabled = useModuleEnabled('ai-components');

  // Check permissions for current user
  const currentUser = { id: userId || 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('ai-components', 'view', currentUser);
  const canBuild = usePermission('ai-components', 'build', currentUser);
  const canTrain = usePermission('ai-components', 'train', currentUser);
  const canDeploy = usePermission('ai-components', 'deploy', currentUser);

  // Get configuration from manifest
  const aiBuilderConfig = moduleConfig.components?.AIBuilder;
  const providers = moduleConfig.providers;
  const features = moduleConfig.features;
  const performance = moduleConfig.performance;
  const security = moduleConfig.security;
  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-4">AI Builder Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-4">AI Builder Disabled</div>;
  }

  if (!canView) {
    return <div className="text-gray-600 p-4">Access Denied</div>;
  }

  const [state, setState] = useState<BuilderState>({
    prompt: '',
    isGenerating: false,
    selectedApp: null,
    showPreview: false,
    viewMode: 'grid',
    selectedDomain: 'general',
    selectedComplexity: 'moderate',
    generatedApps: [],
    activeTab: 'builder'
  });

  const { addNotification } = useAIBOSStore();

  // ==================== REVOLUTIONARY AI FUNCTIONS ====================

  // Generate app with AI Builder SDK and Intelligent Cache
  const generateApp = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }));

      // Use shared rate limiting
      const rateLimitCheck = sharedRateLimiter.isAllowed(`generate-app-${userId}`, 10, 60000);
      if (!rateLimitCheck) {
        throw new Error('Rate limit exceeded. Please wait before generating another app.');
      }

      // Validate prompt with shared security
      const validation = sharedSecurity.validateAndSanitize(state.prompt, 'text');
      if (!validation.isValid || state.prompt.length < 10 || state.prompt.length > 1000) {
        throw new Error('Please provide a more detailed description (10-1000 characters).');
      }

      // Check cache first
      const cacheKey = `app-generation-${state.prompt}-${state.selectedDomain}-${state.selectedComplexity}`;
      const cachedResult = await getIntelligentCache().get(cacheKey);

      if (cachedResult && !cachedResult.stale) {
        const cachedApp = cachedResult.value as GeneratedApp;
        setState(prev => ({
          ...prev,
          generatedApps: [cachedApp, ...prev.generatedApps],
          selectedApp: cachedApp,
          isGenerating: false
        }));

        addNotification({
          type: 'success',
          title: 'App Generated (Cached)',
          message: 'App generated from cache for faster response.',
          isRead: false
        });
        return;
      }

      // Create prompt request with context
      const promptRequest: PromptRequest = {
        prompt: state.prompt,
        context: {
          userRole: 'developer',
          businessDomain: state.selectedDomain,
          existingApps: state.generatedApps.map(app => app.name),
          preferences: {
            theme: 'auto',
            complexity: state.selectedComplexity as any,
            style: 'modern'
          }
        }
      };

      // Generate with AI Builder SDK
      const startTime = Date.now();
      const response: PromptResponse = await builderSDK.generateFromPrompt(promptRequest, {
        llmCallback: (stage, data) => {
          sharedLogger.info();
        },
        tenantId,
        domain: state.selectedDomain,
        enableStreaming: true,
        confidenceThreshold: 0.7
      });

      const processingTime = Date.now() - startTime;

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate app');
      }

      // Create generated app object
      const generatedApp: GeneratedApp = {
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: response.manifest?.name || 'Generated App',
        description: response.manifest?.description || 'AI-generated application',
        type: 'custom',
        domain: state.selectedDomain as any,
        complexity: state.selectedComplexity as any,
        confidence: response.confidence,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        manifest: response.manifest,
        components: response.components,
        workflows: response.workflows,
        suggestions: response.suggestions,
        processingTime,
        tokenTrace: response.tokenTrace
      };

      // Cache the result
              await getIntelligentCache().set(cacheKey, generatedApp, {
        ttl: 600000, // 10 minutes
        type: 'ai-response',
        priority: 0.8,
        metadata: {
          prompt: state.prompt,
          domain: state.selectedDomain,
          complexity: state.selectedComplexity,
          confidence: response.confidence
        }
      });

      // Update state
      setState(prev => ({
        ...prev,
        generatedApps: [generatedApp, ...prev.generatedApps],
        selectedApp: generatedApp,
        isGenerating: false
      }));

      // Log with shared infrastructure
      sharedLogger.info();

      addNotification({
        type: 'success',
        title: 'App Generated Successfully',
        message: `Generated "${generatedApp.name}" with ${Math.round(response.confidence * 100)}% confidence.`,
        isRead: false
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate app';

      sharedLogger.error();

      setState(prev => ({ ...prev, isGenerating: false }));

      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage,
        isRead: false
      });
    }
  }, [state.prompt, state.selectedDomain, state.selectedComplexity, state.generatedApps, tenantId, userId, addNotification]);

  // ==================== UTILITY FUNCTIONS ====================

  const handleExampleClick = useCallback((examplePrompt: string) => {
    setState(prev => ({ ...prev, prompt: examplePrompt }));
  }, []);

  const handlePreviewApp = useCallback((app: GeneratedApp) => {
    setState(prev => ({ ...prev, selectedApp: app, showPreview: true, activeTab: 'preview' }));
  }, []);

  const handleDeleteApp = useCallback(async (appId: string) => {
    try {
      setState(prev => ({
        ...prev,
        generatedApps: prev.generatedApps.filter(app => app.id !== appId),
        selectedApp: prev.selectedApp?.id === appId ? null : prev.selectedApp
      }));

      addNotification({
        type: 'success',
        title: 'App Deleted',
        message: 'App has been removed from your history.',
        isRead: false
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete app.',
        isRead: false
      });
    }
  }, [addNotification]);

  const handleExportApp = useCallback(async (app: GeneratedApp) => {
    try {
      const exportData = {
        app,
        exportedAt: new Date().toISOString(),
        version: VERSION,
        environment: getEnvironment()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'App Exported',
        message: 'App has been exported successfully.',
        isRead: false
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export app.',
        isRead: false
      });
    }
  }, [addNotification]);

  // ==================== RENDER FUNCTIONS ====================

  const renderAppCard = (app: GeneratedApp) => (
    <motion.div
      key={app.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <DashboardCard title="AI Builder" className="h-full hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              app.type === 'form' ? 'bg-blue-100 text-blue-600' :
              app.type === 'list' ? 'bg-green-100 text-green-600' :
              app.type === 'chart' ? 'bg-purple-100 text-purple-600' :
              app.type === 'dashboard' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {app.type === 'form' && <Code className="h-4 w-4" />}
              {app.type === 'list' && <List className="h-4 w-4" />}
              {app.type === 'chart' && <BarChart3 className="h-4 w-4" />}
              {app.type === 'dashboard' && <Grid3X3 className="h-4 w-4" />}
              {app.type === 'modal' && <Eye className="h-4 w-4" />}
              {app.type === 'custom' && <Sparkles className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {app.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {app.domain.charAt(0).toUpperCase() + app.domain.slice(1)} • {app.complexity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <Target className="h-3 w-3" />
              <span>{Math.round(app.confidence * 100)}%</span>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              app.status === 'completed' ? 'bg-green-100 text-green-700' :
              app.status === 'generating' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {app.status}
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {app.description}
        </p>

        {/* AI Generation Details */}
        {app.processingTime && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Processing Time: {app.processingTime}ms</span>
              <span>Components: {app.components?.length || 0}</span>
              <span>Workflows: {app.workflows?.length || 0}</span>
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {app.suggestions && app.suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Suggestions
            </h4>
            <div className="space-y-1">
              {app.suggestions.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewApp(app)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportApp(app)}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteApp(app.id)}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </DashboardCard>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            AI App Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revolutionary AI-powered application building with natural language
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Generated:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {state.generatedApps.length} apps
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-gray-600 dark:text-gray-400">Avg Confidence:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {state.generatedApps.length > 0
                  ? Math.round(state.generatedApps.reduce((acc, app) => acc + app.confidence, 0) / state.generatedApps.length * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TABS ==================== */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        {([
          { id: 'builder', label: 'Builder', icon: Sparkles},
          { id: 'preview', label: 'Preview', icon: Eye},
          { id: 'history', label: 'History', icon: List},
          { id: 'templates', label: 'Templates', icon: Grid3X3}
        ] as TabItem[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setState(prev => ({ ...prev, activeTab: tab.id as any }))}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              state.activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== BUILDER TAB ==================== */}
      {state.activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your app
              </label>
              <textarea
                value={state.prompt}
                onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe the app you want to create... (e.g., 'Create a form to collect customer contact information')"
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain
                </label>
                <select
                  value={state.selectedDomain}
                  onChange={(e) => setState(prev => ({ ...prev, selectedDomain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DOMAINS.map(domain => (
                    <option key={domain.value} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Complexity
                </label>
                <select
                  value={state.selectedComplexity}
                  onChange={(e) => setState(prev => ({ ...prev, selectedComplexity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {COMPLEXITIES.map(complexity => (
                    <option key={complexity.value} value={complexity.value}>
                      {complexity.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={generateApp}
                disabled={!state.prompt.trim() || state.isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {state.isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate App
                  </>
                )}
              </Button>

              <div className="text-sm text-gray-500">
                {state.prompt.length}/1000 characters
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Example Prompts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="text-left p-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PREVIEW TAB ==================== */}
      {state.activeTab === 'preview' && state.selectedApp && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Preview: {state.selectedApp.name}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Editor
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* App Manifest */}
            <div className="lg:col-span-1">
              <DashboardCard title="App Details">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  App Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="text-gray-900 dark:text-white">{state.selectedApp.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <p className="text-gray-900 dark:text-white capitalize">{state.selectedApp.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Domain:</span>
                    <p className="text-gray-900 dark:text-white capitalize">{state.selectedApp.domain}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Complexity:</span>
                    <p className="text-gray-900 dark:text-white capitalize">{state.selectedApp.complexity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Confidence:</span>
                    <p className="text-gray-900 dark:text-white">{Math.round(state.selectedApp.confidence * 100)}%</p>
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <DashboardCard title="Live Preview">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Live Preview
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 min-h-[400px]">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <p>Live preview will be available here</p>
                    <p className="text-sm">Components: {state.selectedApp.components?.length || 0}</p>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      )}

      {/* ==================== HISTORY TAB ==================== */}
      {state.activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated Apps ({state.generatedApps.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={state.viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={state.viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {state.generatedApps.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No Apps Generated"
              description="Generate your first AI-powered app to get started."
              action={{
                label: "Generate First App",
                onClick: () => setState(prev => ({ ...prev, activeTab: 'builder' })),
                variant: "primary"
              }}
            />
          ) : (
            <div className={
              state.viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {state.generatedApps.map(renderAppCard)}
            </div>
          )}
        </div>
      )}

      {/* ==================== TEMPLATES TAB ==================== */}
      {state.activeTab === 'templates' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            App Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <DashboardCard key={index} title="Example Prompt" className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Template {index + 1}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {prompt}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      prompt,
                      activeTab: 'builder'
                    }));
                  }}
                >
                  Use Template
                </Button>
              </DashboardCard>
            ))}
          </div>
        </div>
      )}

      {/* ==================== REVOLUTIONARY AI FOOTER ==================== */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Revolutionary AI Features:
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span>• AI Builder SDK: Natural language → Apps</span>
              <span>• Intelligent Cache: {getIntelligentCache().getStats().hitRate.toFixed(1)}% hit rate</span>
              <span>• Shared Infrastructure: {PACKAGE_NAME} v{VERSION}</span>
              <span>• Environment: {getEnvironment()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Powered by AI-BOS Revolutionary AI Platform
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIBuilder;
