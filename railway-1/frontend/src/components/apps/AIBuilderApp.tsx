'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Code, List, BarChart3, Grid3X3, Eye, Sparkles, Target, Lightbulb, Download, Trash2, Brain, RefreshCw, Copy, ExternalLink, Cpu, Zap, Layers, Network, Puzzle, Plus, AlertTriangle, Clock, ArrowRight, CheckCircle, Play } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import { getAIBuilderSDK, PromptRequest, PromptResponse, PromptOptions } from '@/ai/sdk/AIBuilderSDK';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { useAIBOSStore } from '@/lib/store';
import { useConsciousness } from '@/hooks/useConsciousness';
import { aiBackendAPI } from '@/lib/api';
import { responseProcessor } from '@/lib/response-processor';
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

interface AIBuilderAppProps {
  className?: string;
  tenantId?: string;
  userId?: string;
}

interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  manifest: any;
  components: any[];
  workflows: any[];
  confidence: number;
  reasoning: string;
  createdAt: Date;
  status: 'generating' | 'completed' | 'failed' | 'deployed';
  metadata?: Record<string, any>;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: 'form' | 'dashboard' | 'list' | 'chart' | 'custom';
  complexity: 'simple' | 'moderate' | 'advanced';
  tags: string[];
}

// ==================== CONSTANTS ====================

const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'customer-form',
    name: 'Customer Registration Form',
    description: 'Create a form for customer registration with validation',
    template: 'Create a customer registration form with fields for name, email, phone, and address. Include validation and a submit button.',
    category: 'form',
    complexity: 'simple',
    tags: ['form', 'registration', 'validation']
  },
  {
    id: 'sales-dashboard',
    name: 'Sales Dashboard',
    description: 'Create a dashboard for sales analytics and reporting',
    template: 'Create a sales dashboard with charts showing revenue, customer growth, and product performance. Include filters and export functionality.',
    category: 'dashboard',
    complexity: 'moderate',
    tags: ['dashboard', 'analytics', 'charts', 'sales']
  },
  {
    id: 'product-list',
    name: 'Product Catalog',
    description: 'Create a list view for product catalog with search and filters',
    template: 'Create a product catalog with a list view, search functionality, filters by category and price, and add to cart buttons.',
    category: 'list',
    complexity: 'simple',
    tags: ['list', 'catalog', 'search', 'filters']
  },
  {
    id: 'analytics-chart',
    name: 'Analytics Chart',
    description: 'Create interactive charts for data visualization',
    template: 'Create an interactive chart component for data visualization with multiple chart types, zoom functionality, and data export.',
    category: 'chart',
    complexity: 'advanced',
    tags: ['chart', 'analytics', 'visualization', 'interactive']
  }
];

// ==================== AI BUILDER APP ====================

export default function AIBuilderApp({ className, tenantId, userId }: AIBuilderAppProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedApps, setGeneratedApps] = useState<GeneratedApp[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    stage: string;
    progress: number;
    message: string;
  }>({ stage: '', progress: 0, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'generated' | 'templates'>('create');

  // ==================== HOOKS ====================

  const { addNotification } = useAIBOSStore();
  const { recordExperience } = useConsciousness();

  // Initialize shared infrastructure
  const sharedCache = createMemoryCache({ maxSize: 1000, ttl: 300000 });
  const sharedLogger = Logger;
  const sharedSecurity = SecurityValidation;
  const sharedRateLimiter = RateLimiter;

  // ==================== FUNCTIONS ====================

  const generateApp = useCallback(async (promptText: string) => {
    if (!promptText.trim()) {
      setError('Please enter a prompt to generate an app');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ stage: 'Analyzing prompt...', progress: 10, message: 'Understanding your requirements' });

    try {
      // Create prompt request
      const request: PromptRequest = {
        prompt: promptText,
        context: {
          userRole: 'developer',
          businessDomain: 'general',
          existingApps: generatedApps.map(app => app.name),
          preferences: {
            theme: 'auto',
            complexity: 'moderate',
            style: 'modern'
          }
        }
      };

      // Generate app with streaming updates using AI Backend Connector
      const promptOptions: PromptOptions = {
        llmCallback: async (stage: string, data?: any) => {
          const progressMap: Record<string, { progress: number; message: string }> = {
            'analyzing': { progress: 20, message: 'Analyzing prompt intent' },
            'generating_manifest': { progress: 40, message: 'Creating app manifest' },
            'generating_components': { progress: 60, message: 'Building components' },
            'generating_workflows': { progress: 80, message: 'Creating workflows' },
            'finalizing': { progress: 90, message: 'Finalizing app' },
            'completed': { progress: 100, message: 'App generated successfully' }
          };

          const progress = progressMap[stage] || { progress: 50, message: stage };
          setGenerationProgress({ stage, ...progress });

          // Use AI Backend Connector for enhanced processing
          if (stage === 'analyzing' && data?.intent) {
            try {
              // Generate enhanced prompt using AI Backend Connector
              const enhancedPrompt = await aiBackendAPI.generateText({
                model: 'prompt-enhancer',
                prompt: `Enhance this app generation prompt: ${promptText}`,
                options: {
                  temperature: 0.3,
                  maxTokens: 500,
                  systemPrompt: 'You are an expert app development prompt enhancer. Improve the prompt for better AI understanding.'
                }
              });

              // Update the request with enhanced prompt
              request.prompt = enhancedPrompt.data;
            } catch (error) {
              console.warn('Failed to enhance prompt:', error);
            }
          }
        },
        domain: 'general',
        enableStreaming: true,
        confidenceThreshold: 0.7
      };

      // Only add tenantId if it exists
      if (tenantId) {
        promptOptions.tenantId = tenantId;
      }

      const response = await getAIBuilderSDK().generateFromPrompt(request, promptOptions);

      if (response.success && response.manifest) {
        // Process response using ResponseProcessor
        const processedResponse = await responseProcessor.processAIResponse({
          content: JSON.stringify(response),
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          finishReason: 'stop',
          model: 'ai-builder',
          processingTime: response.processingTime || 0,
          confidence: response.confidence,
          suggestions: [],
          warnings: []
        }, { type: 'app-generation', prompt: promptText });

        // Create generated app with processed response data
        const generatedApp: GeneratedApp = {
          id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: response.manifest.name || 'AI Generated App',
          description: response.manifest.description || 'AI-powered application',
          manifest: response.manifest,
          components: response.components || [],
          workflows: response.workflows || [],
          confidence: response.confidence,
          reasoning: response.reasoning,
          createdAt: new Date(),
          status: 'completed',
          metadata: {
            processingTime: response.processingTime,
            modelVersion: VERSION,
            environment: getEnvironment(),
            tenantId,
            userId,
            tokenTrace: response.tokenTrace,
            responseQuality: processedResponse.parsedContent.quality.score,
            validationResults: processedResponse.validation,
            formattingResults: processedResponse.formatting
          }
        };

        setGeneratedApps(prev => [generatedApp, ...prev]);
        setPrompt('');
        setActiveTab('generated');

        // Add notification
        addNotification({
          type: 'success',
          title: 'App Generated Successfully',
          message: `"${generatedApp.name}" has been created with ${Math.round(response.confidence * 100)}% confidence`,
          isRead: false
        });

        // Record experience
        recordExperience({
          type: 'ai_builder_success',
          description: `Generated app "${generatedApp.name}" with ${Math.round(response.confidence * 100)}% confidence`,
          emotionalImpact: 0.8,
          learningValue: 0.9,
          consciousnessImpact: 0.7,
          context: {
            appName: generatedApp.name,
            confidence: response.confidence,
            complexity: response.manifest.metadata?.category || 'moderate',
            componentsCount: response.components?.length || 0
          }
        });

        // Log success
        console.log('AI Builder: App generated successfully', {
          appId: generatedApp.id,
          appName: generatedApp.name,
          confidence: response.confidence,
          tenantId,
          userId
        });

      } else {
        throw new Error(response.error || 'Failed to generate app');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate app';
      setError(errorMessage);

      // Add error notification
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage,
        isRead: false
      });

      // Log error
      console.error('AI Builder: App generation failed', {
        error: errorMessage,
        prompt: promptText,
        tenantId,
        userId
      });

    } finally {
      setIsGenerating(false);
      setGenerationProgress({ stage: '', progress: 0, message: '' });
    }
  }, [generatedApps, addNotification, recordExperience, tenantId, userId, sharedLogger]);

  const useTemplate = useCallback((template: PromptTemplate) => {
    setPrompt(template.template);
    setSelectedTemplate(template);
    setShowTemplates(false);
    setActiveTab('create');
  }, []);

  const deployApp = useCallback(async (app: GeneratedApp) => {
    try {
      // Update app status
      setGeneratedApps(prev => prev.map(a =>
        a.id === app.id ? { ...a, status: 'deployed' as const } : a
      ));

      // Add notification
      addNotification({
        type: 'success',
        title: 'App Deployed',
        message: `"${app.name}" has been deployed successfully`,
        isRead: false
      });

      // Log deployment
      console.log('AI Builder: App deployed', {
        appId: app.id,
        appName: app.name,
        tenantId,
        userId
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy app';

      addNotification({
        type: 'error',
        title: 'Deployment Failed',
        message: errorMessage,
        isRead: false
      });
    }
  }, [addNotification, sharedLogger, tenantId, userId]);

  const deleteApp = useCallback(async (appId: string) => {
    setGeneratedApps(prev => prev.filter(app => app.id !== appId));

    addNotification({
      type: 'info',
      title: 'App Deleted',
      message: 'App has been removed from your collection',
      isRead: false
    });
  }, [addNotification]);

  // ==================== RENDER ====================

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-purple-700/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Builder
            </h1>
            <p className="text-purple-300 text-sm">Natural language → Working apps</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-purple-300 hover:text-white"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('generated')}
            className="text-purple-300 hover:text-white"
          >
            <Code className="w-4 h-4 mr-2" />
            Generated ({generatedApps.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                {/* Prompt Input */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-xl font-semibold text-white">Create Your App</h2>
                    {selectedTemplate && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 rounded-full">
                        <span className="text-purple-300 text-sm">Template:</span>
                        <span className="text-white text-sm font-medium">{selectedTemplate.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(null)}
                          className="text-purple-300 hover:text-white p-0 h-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the app you want to create... (e.g., 'Create a customer registration form with validation and a submit button')"
                      className="w-full h-32 p-4 bg-slate-800/50 border border-purple-600/30 rounded-lg text-white placeholder-purple-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isGenerating}
                    />

                    {error && (
                      <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-red-300 text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => generateApp(prompt)}
                          disabled={isGenerating || !prompt.trim()}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Generate App</span>
                            </>
                          )}
                        </Button>

                        {isGenerating && (
                          <div className="flex items-center space-x-2 text-purple-300">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{generationProgress.message}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-purple-300 text-sm">
                        {prompt.length} characters
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isGenerating && (
                      <div className="mt-4">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${generationProgress.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Templates */}
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DEFAULT_PROMPT_TEMPLATES.map((template) => (
                        <DashboardCard title="A I Builder App"
                          key={template.id}
                          className="p-4 cursor-pointer hover:bg-purple-600/10 transition-colors duration-200"
                          onClick={() => {
                            setPrompt(template.template);
                            setShowTemplates(false);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-1">{template.name}</h4>
                              <p className="text-purple-300 text-sm mb-2">{template.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {template.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-purple-400">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </DashboardCard>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Empty State */}
                {!isGenerating && generatedApps.length === 0 && !showTemplates && (
                  <EmptyState
                    icon={Sparkles}
                    title="Start Building with AI"
                    description="Describe the app you want to create in natural language, and AI will generate it for you."
                    action={{
                      label: "Try Templates",
                      onClick: () => setShowTemplates(true),
                      variant: 'primary'
                    }}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'generated' && (
              <motion.div
                key="generated"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Generated Apps</h2>
                  <Button
                    onClick={() => setActiveTab('create')}
                    variant="ghost"
                    className="text-purple-300 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </div>

                {generatedApps.length === 0 ? (
                  <EmptyState
                    icon={Code}
                    title="No Apps Generated Yet"
                    description="Create your first AI-generated app to see it here."
                    action={{
                      label: "Create App",
                      onClick: () => setActiveTab('create'),
                      variant: 'primary'
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {generatedApps.map((app) => (
                      <DashboardCard title="A I Builder App" key={app.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
                            <p className="text-purple-300 text-sm mb-2">{app.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-purple-300">
                                Confidence: {Math.round(app.confidence * 100)}%
                              </span>
                              <span className="text-purple-300">
                                Components: {app.components.length}
                              </span>
                              <span className="text-purple-300">
                                {app.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {app.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            {app.status === 'generating' && (
                              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                            )}
                            {app.status === 'failed' && (
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            )}
                            {app.status === 'deployed' && (
                              <div className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full">
                                Deployed
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => deployApp(app)}
                              disabled={app.status === 'deployed'}
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Deploy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-300 hover:text-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-300 hover:text-white"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                          <Button
                            onClick={() => deleteApp(app.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </DashboardCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
