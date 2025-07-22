// ==================== AI-BOS UI BUILDER AGENT ====================
// Revolutionary AI-Powered UI Generation Engine
// Steve Jobs Philosophy: "Design is not just what it looks like and feels like. Design is how it works."

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Layout, Smartphone, Tablet, Monitor,
  Eye, Code, Sparkles, Settings, Target, Zap,
  CheckCircle, AlertTriangle, Clock, Brain, Layers
} from 'lucide-react';

// ==================== TYPES ====================
interface UIGenerationRequest {
  id: string;
  prompt: string;
  requirements: {
    layout: 'grid' | 'card' | 'list' | 'tab' | 'dashboard' | 'form' | 'table';
    theme: 'light' | 'dark' | 'auto';
    responsive: boolean;
    accessibility: boolean;
    components: string[];
    dataFields: string[];
    userType: 'admin' | 'user' | 'public';
    devicePriority: 'mobile' | 'desktop' | 'tablet';
  };
  context: {
    domain: string;
    complexity: 'simple' | 'medium' | 'complex';
    existingComponents: string[];
    brandGuidelines?: any;
  };
  timestamp: Date;
}

interface GeneratedUI {
  id: string;
  requestId: string;
  components: GeneratedComponent[];
  layout: LayoutConfig;
  theme: ThemeConfig;
  responsive: ResponsiveConfig;
  accessibility: AccessibilityConfig;
  code: {
    jsx: string;
    css: string;
    typescript: string;
  };
  metadata: {
    generationTime: number;
    confidence: number;
    suggestions: string[];
    warnings: string[];
  };
  status: 'generating' | 'complete' | 'error';
}

interface GeneratedComponent {
  id: string;
  type: 'form' | 'table' | 'chart' | 'card' | 'button' | 'input' | 'modal' | 'navigation' | 'sidebar';
  props: Record<string, any>;
  children?: GeneratedComponent[];
  styling: {
    classes: string[];
    customCSS: string;
    responsive: Record<string, any>;
  };
  behavior: {
    events: string[];
    validations: string[];
    accessibility: Record<string, any>;
  };
  data: {
    source?: string;
    fields: string[];
    transformations?: string[];
  };
}

interface LayoutConfig {
  type: 'grid' | 'flex' | 'absolute' | 'relative';
  columns: number;
  gap: number;
  padding: number;
  maxWidth?: number;
  centered: boolean;
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  shadow: string;
  borderRadius: number;
}

interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  mobileFirst: boolean;
  adaptiveLayout: boolean;
}

interface AccessibilityConfig {
  wcagLevel: 'A' | 'AA' | 'AAA';
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorContrast: boolean;
  focusIndicators: boolean;
}

interface UIBuilderState {
  isActive: boolean;
  currentRequest: UIGenerationRequest | null;
  generatedUI: GeneratedUI | null;
  history: UIGenerationRequest[];
  templates: UITemplate[];
  performance: {
    averageGenerationTime: number;
    successRate: number;
    totalGenerations: number;
    qualityScore: number;
  };
  settings: {
    aiModel: 'gpt-4' | 'claude-3' | 'local';
    qualityLevel: 'fast' | 'balanced' | 'high';
    includeAccessibility: boolean;
    includeResponsive: boolean;
    includeAnimations: boolean;
  };
  error: string | null;
}

// ==================== UI TEMPLATES ====================
const UI_TEMPLATES: UITemplate[] = [
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Modern dashboard with charts and metrics',
    components: ['header', 'sidebar', 'chart', 'metric-card', 'table'],
    layout: 'grid',
    complexity: 'medium'
  },
  {
    id: 'form',
    name: 'Data Entry Form',
    description: 'Clean form with validation and submission',
    components: ['form', 'input', 'button', 'validation'],
    layout: 'form',
    complexity: 'simple'
  },
  {
    id: 'table',
    name: 'Data Table',
    description: 'Interactive table with sorting and filtering',
    components: ['table', 'search', 'pagination', 'actions'],
    layout: 'table',
    complexity: 'medium'
  },
  {
    id: 'card',
    name: 'Card Layout',
    description: 'Responsive card-based layout',
    components: ['card', 'image', 'content', 'actions'],
    layout: 'card',
    complexity: 'simple'
  }
];

interface UITemplate {
  id: string;
  name: string;
  description: string;
  components: string[];
  layout: string;
  complexity: 'simple' | 'medium' | 'complex';
}

// ==================== COMPONENT ====================
export const UIBuilderAgent: React.FC = () => {
  const [state, setState] = useState<UIBuilderState>({
    isActive: false,
    currentRequest: null,
    generatedUI: null,
    history: [],
    templates: UI_TEMPLATES,
    performance: {
      averageGenerationTime: 0,
      successRate: 0,
      totalGenerations: 0,
      qualityScore: 0
    },
    settings: {
      aiModel: 'gpt-4',
      qualityLevel: 'balanced',
      includeAccessibility: true,
      includeResponsive: true,
      includeAnimations: true
    },
    error: null
  });

  const [promptInput, setPromptInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // ==================== UI GENERATION FUNCTIONS ====================
  const generateUI = useCallback(async (prompt: string, template?: string) => {
    setIsGenerating(true);
    setState(prev => ({ ...prev, error: null }));

    const request: UIGenerationRequest = {
      id: `ui-request-${Date.now()}`,
      prompt,
      requirements: {
        layout: template === 'dashboard' ? 'dashboard' :
                template === 'form' ? 'form' :
                template === 'table' ? 'table' : 'card',
        theme: 'light',
        responsive: true,
        accessibility: true,
        components: template ? UI_TEMPLATES.find(t => t.id === template)?.components || [] : [],
        dataFields: extractDataFields(prompt),
        userType: 'user',
        devicePriority: 'desktop'
      },
      context: {
        domain: extractDomain(prompt),
        complexity: assessComplexity(prompt),
        existingComponents: [],
        brandGuidelines: null
      },
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      currentRequest: request,
      history: [request, ...prev.history]
    }));

    // Simulate AI generation process
    await simulateUIGeneration(request);
  }, []);

  const simulateUIGeneration = useCallback(async (request: UIGenerationRequest) => {
    const startTime = Date.now();

    // Step 1: Analyze requirements
    await new Promise(resolve => setTimeout(resolve, 800));

    // Step 2: Generate components
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Step 3: Apply styling
    await new Promise(resolve => setTimeout(resolve, 600));

    // Step 4: Add accessibility
    await new Promise(resolve => setTimeout(resolve, 400));

    // Step 5: Generate code
    await new Promise(resolve => setTimeout(resolve, 1000));

    const generationTime = Date.now() - startTime;
    const confidence = Math.random() * 0.3 + 0.7; // 70-100%

    const generatedUI: GeneratedUI = {
      id: `ui-${Date.now()}`,
      requestId: request.id,
      components: generateComponents(request),
      layout: generateLayout(request),
      theme: generateTheme(request),
      responsive: generateResponsiveConfig(),
      accessibility: generateAccessibilityConfig(),
      code: generateCode(request),
      metadata: {
        generationTime,
        confidence,
        suggestions: generateSuggestions(request),
        warnings: generateWarnings(request)
      },
      status: 'complete'
    };

    setState(prev => ({
      ...prev,
      generatedUI,
      currentRequest: null,
      performance: {
        ...prev.performance,
        totalGenerations: prev.performance.totalGenerations + 1,
        averageGenerationTime: (prev.performance.averageGenerationTime + generationTime) / 2,
        successRate: ((prev.performance.successRate * prev.performance.totalGenerations) + 1) / (prev.performance.totalGenerations + 1)
      }
    }));

    setIsGenerating(false);
  }, []);

  const generateComponents = useCallback((request: UIGenerationRequest): GeneratedComponent[] => {
    const components: GeneratedComponent[] = [];

    // Generate header
    components.push({
      id: 'header-1',
      type: 'navigation',
      props: {
        title: extractTitle(request.prompt),
        showLogo: true,
        showUserMenu: true
      },
      children: [],
      styling: {
        classes: ['bg-white', 'shadow-sm', 'border-b'],
        customCSS: '',
        responsive: {}
      },
      behavior: {
        events: ['click', 'hover'],
        validations: [],
        accessibility: { role: 'banner' }
      },
      data: {
        fields: [],
        transformations: []
      }
    });

    // Generate main content based on requirements
    if (request.requirements.components.includes('form')) {
      components.push({
        id: 'form-1',
        type: 'form',
        props: {
          title: 'Data Entry Form',
          submitText: 'Submit',
          fields: request.requirements.dataFields
        },
        children: request.requirements.dataFields.map(field => ({
          id: `input-${field}`,
          type: 'input',
          props: {
            label: field.charAt(0).toUpperCase() + field.slice(1),
            type: getInputType(field),
            required: true,
            placeholder: `Enter ${field}`
          },
          children: [],
          styling: {
            classes: ['mb-4'],
            customCSS: '',
            responsive: {}
          },
          behavior: {
            events: ['change', 'blur'],
            validations: ['required'],
            accessibility: { id: field, 'aria-label': field }
          },
          data: {
            fields: [field],
            transformations: []
          }
        })),
        styling: {
          classes: ['max-w-md', 'mx-auto', 'p-6', 'bg-white', 'rounded-lg', 'shadow'],
          customCSS: '',
          responsive: {}
        },
        behavior: {
          events: ['submit'],
          validations: [],
          accessibility: { role: 'form' }
        },
        data: {
          fields: request.requirements.dataFields,
          transformations: []
        }
      });
    }

    if (request.requirements.components.includes('table')) {
      components.push({
        id: 'table-1',
        type: 'table',
        props: {
          title: 'Data Table',
          columns: request.requirements.dataFields,
          data: []
        },
        children: [],
        styling: {
          classes: ['w-full', 'border-collapse'],
          customCSS: '',
          responsive: {}
        },
        behavior: {
          events: ['sort', 'filter', 'select'],
          validations: [],
          accessibility: { role: 'table' }
        },
        data: {
          fields: request.requirements.dataFields,
          transformations: []
        }
      });
    }

    return components;
  }, []);

  const generateLayout = useCallback((request: UIGenerationRequest): LayoutConfig => {
    return {
      type: 'grid',
      columns: request.requirements.layout === 'dashboard' ? 12 : 1,
      gap: 4,
      padding: 6,
      maxWidth: 1200,
      centered: true
    };
  }, []);

  const generateTheme = useCallback((request: UIGenerationRequest): ThemeConfig => {
    return {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#F9FAFB',
      text: '#111827',
      border: '#E5E7EB',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 8
    };
  }, []);

  const generateResponsiveConfig = useCallback((): ResponsiveConfig => {
    return {
      breakpoints: {
        mobile: 640,
        tablet: 768,
        desktop: 1024
      },
      mobileFirst: true,
      adaptiveLayout: true
    };
  }, []);

  const generateAccessibilityConfig = useCallback((): AccessibilityConfig => {
    return {
      wcagLevel: 'AA',
      keyboardNavigation: true,
      screenReaderSupport: true,
      colorContrast: true,
      focusIndicators: true
    };
  }, []);

  const generateCode = useCallback((request: UIGenerationRequest) => {
    return {
      jsx: `// Generated JSX for ${extractTitle(request.prompt)}
import React from 'react';

export const GeneratedComponent = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="bg-white shadow-sm border-b p-4">
        <h1 className="text-2xl font-bold text-gray-900">
          ${extractTitle(request.prompt)}
        </h1>
      </header>

      <main className="mt-6">
        ${request.requirements.components.includes('form') ? `
        <form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          ${request.requirements.dataFields.map(field => `
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ${field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="${getInputType(field)}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          `).join('')}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
        ` : ''}
      </main>
    </div>
  );
};`,
      css: `/* Generated CSS */
.generated-component {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.generated-component header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.generated-component form {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.generated-component input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}`,
      typescript: `// Generated TypeScript interfaces
interface FormData {
  ${request.requirements.dataFields.map(field => `${field}: ${getTypeScriptType(field)};`).join('\n  ')}
}

interface GeneratedComponentProps {
  onSubmit?: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

export const GeneratedComponent: React.FC<GeneratedComponentProps> = ({
  onSubmit,
  initialData
}) => {
  // Component implementation
};`
    };
  }, []);

  const generateSuggestions = useCallback((request: UIGenerationRequest): string[] => {
    const suggestions: string[] = [];

    if (request.requirements.dataFields.length > 5) {
      suggestions.push('Consider breaking the form into multiple steps for better UX');
    }

    if (!request.requirements.components.includes('validation')) {
      suggestions.push('Add client-side validation for better user experience');
    }

    if (request.context.complexity === 'complex') {
      suggestions.push('Consider adding a progress indicator for multi-step processes');
    }

    return suggestions;
  }, []);

  const generateWarnings = useCallback((request: UIGenerationRequest): string[] => {
    const warnings: string[] = [];

    if (request.requirements.dataFields.length > 10) {
      warnings.push('Large number of fields may impact form completion rates');
    }

    if (request.requirements.components.includes('sensitive-data')) {
      warnings.push('Ensure proper security measures for sensitive data handling');
    }

    return warnings;
  }, []);

  // ==================== UTILITY FUNCTIONS ====================
  const extractDataFields = useCallback((prompt: string): string[] => {
    const commonFields = ['name', 'email', 'phone', 'address', 'company', 'title', 'description'];
    const words = prompt.toLowerCase().split(' ');
    return commonFields.filter(field => words.includes(field) || words.includes(field + 's'));
  }, []);

  const extractDomain = useCallback((prompt: string): string => {
    const words = prompt.toLowerCase().split(' ');
    if (words.includes('customer') || words.includes('crm')) return 'business';
    if (words.includes('project') || words.includes('task')) return 'productivity';
    if (words.includes('analytics') || words.includes('data')) return 'analytics';
    return 'general';
  }, []);

  const assessComplexity = useCallback((prompt: string): 'simple' | 'medium' | 'complex' => {
    const words = prompt.toLowerCase().split(' ');
    if (words.length > 20) return 'complex';
    if (words.length > 10) return 'medium';
    return 'simple';
  }, []);

  const extractTitle = useCallback((prompt: string): string => {
    const words = prompt.split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  }, []);

  const getInputType = useCallback((field: string): string => {
    if (field.includes('email')) return 'email';
    if (field.includes('phone')) return 'tel';
    if (field.includes('date')) return 'date';
    if (field.includes('password')) return 'password';
    return 'text';
  }, []);

  const getTypeScriptType = useCallback((field: string): string => {
    if (field.includes('email')) return 'string';
    if (field.includes('phone')) return 'string';
    if (field.includes('date')) return 'Date';
    if (field.includes('number')) return 'number';
    return 'string';
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ==================== HEADER ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Palette className="w-8 h-8 mr-3 text-blue-500" />
                UI Builder Agent
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI-powered UI generation with intelligent design
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {state.performance.totalGenerations}
                </div>
                <div className="text-sm text-gray-500">UIs Generated</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(state.performance.successRate * 100)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==================== UI GENERATION ==================== */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                  Generate UI
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Describe the UI you want to create
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      UI Description
                    </label>
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="e.g., 'Create a customer registration form with name, email, phone, and company fields'"
                      className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template (Optional)
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isGenerating}
                    >
                      <option value="">No template</option>
                      {state.templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => generateUI(promptInput, selectedTemplate)}
                      disabled={!promptInput.trim() || isGenerating}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Palette className="w-4 h-4" />
                      )}
                      <span>{isGenerating ? 'Generating...' : 'Generate UI'}</span>
                    </button>
                    <div className="text-sm text-gray-500">
                      {promptInput.length}/500 characters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== GENERATED UI PREVIEW ==================== */}
            {state.generatedUI && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-green-500" />
                    Generated UI
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    AI-generated interface with {state.generatedUI.components.length} components
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round(state.generatedUI.metadata.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generation Time</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {state.generatedUI.metadata.generationTime}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Components</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {state.generatedUI.components.length}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Code className="w-4 h-4 inline mr-2" />
                        View Generated Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================== SIDEBAR ==================== */}
          <div className="lg:col-span-1 space-y-6">
            {/* ==================== PERFORMANCE METRICS ==================== */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Performance Metrics
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Generation Time</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(state.performance.averageGenerationTime)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(state.performance.successRate * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality Score</span>
                    <span className="text-sm text-yellow-600 font-medium">
                      {Math.round(state.performance.qualityScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== SETTINGS ==================== */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-500" />
                  Generation Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AI Model
                    </label>
                    <select
                      value={state.settings.aiModel}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, aiModel: e.target.value as any }
                      }))}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="gpt-4">GPT-4 (High Quality)</option>
                      <option value="claude-3">Claude-3 (Balanced)</option>
                      <option value="local">Local Model (Fast)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quality Level
                    </label>
                    <select
                      value={state.settings.qualityLevel}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, qualityLevel: e.target.value as any }
                      }))}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="fast">Fast Generation</option>
                      <option value="balanced">Balanced</option>
                      <option value="high">High Quality</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accessibility</span>
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, includeAccessibility: !prev.settings.includeAccessibility }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          state.settings.includeAccessibility ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          state.settings.includeAccessibility ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Responsive</span>
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, includeResponsive: !prev.settings.includeResponsive }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          state.settings.includeResponsive ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          state.settings.includeResponsive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIBuilderAgent;
