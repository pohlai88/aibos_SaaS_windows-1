// ==================== AI-BOS RESPONSE PROCESSOR ====================
// AI Response Parsing, Validation, and Formatting Engine
// Steve Jobs Philosophy: "Details matter, it's worth waiting to get it right"

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle, AlertTriangle, Code, Settings,
  Zap, Eye, Copy, Download, Play, Pause, RotateCcw,
  Shield, Target, BarChart3, Cpu, Network, Sparkles
} from 'lucide-react';

// ==================== TYPES ====================
interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  model: string;
  processingTime: number;
  confidence: number;
  suggestions: string[];
  warnings: string[];
}

interface ProcessedResponse {
  id: string;
  originalResponse: AIResponse;
  parsedContent: ParsedContent;
  validation: ValidationResult;
  formatting: FormattingResult;
  metadata: ResponseMetadata;
  status: 'processing' | 'validated' | 'formatted' | 'error';
  error?: string;
}

interface ParsedContent {
  type: 'jsx' | 'json' | 'typescript' | 'markdown' | 'text';
  content: any;
  structure: ContentStructure;
  quality: ContentQuality;
}

interface ContentStructure {
  hasImports: boolean;
  hasExports: boolean;
  hasComponents: boolean;
  hasInterfaces: boolean;
  hasFunctions: boolean;
  hasComments: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

interface ContentQuality {
  syntaxValid: boolean;
  typeSafe: boolean;
  followsBestPractices: boolean;
  accessibilityCompliant: boolean;
  responsiveDesign: boolean;
  performanceOptimized: boolean;
  securityCompliant: boolean;
  score: number; // 0-100
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  compliance: ComplianceCheck;
}

interface ValidationError {
  type: 'syntax' | 'semantic' | 'security' | 'performance' | 'accessibility';
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  fix?: string;
}

interface ValidationWarning {
  type: string;
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

interface ComplianceCheck {
  wcag: boolean;
  security: boolean;
  performance: boolean;
  seo: boolean;
  accessibility: boolean;
}

interface FormattingResult {
  formatted: boolean;
  originalFormat: string;
  targetFormat: string;
  formattedContent: string;
  improvements: string[];
  optimizations: string[];
}

interface ResponseMetadata {
  processingTime: number;
  validationTime: number;
  formattingTime: number;
  totalTime: number;
  size: number;
  complexity: number;
  maintainability: number;
  readability: number;
}

interface ResponseProcessorState {
  isActive: boolean;
  currentResponse: ProcessedResponse | null;
  history: ProcessedResponse[];
  settings: ProcessorSettings;
  performance: {
    averageProcessingTime: number;
    successRate: number;
    totalProcessed: number;
    validationAccuracy: number;
  };
  error: string | null;
}

interface ProcessorSettings {
  enableValidation: boolean;
  enableFormatting: boolean;
  enableOptimization: boolean;
  strictMode: boolean;
  autoFix: boolean;
  qualityThreshold: number;
  maxProcessingTime: number;
  enableLogging: boolean;
}

// ==================== COMPONENT ====================
export const ResponseProcessor: React.FC = () => {
  const [state, setState] = useState<ResponseProcessorState>({
    isActive: false,
    currentResponse: null,
    history: [],
    settings: {
      enableValidation: true,
      enableFormatting: true,
      enableOptimization: true,
      strictMode: false,
      autoFix: true,
      qualityThreshold: 80,
      maxProcessingTime: 10000,
      enableLogging: true
    },
    performance: {
      averageProcessingTime: 0,
      successRate: 0,
      totalProcessed: 0,
      validationAccuracy: 0
    },
    error: null
  });

  const [responseInput, setResponseInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ==================== PROCESSING FUNCTIONS ====================
  const processResponse = useCallback(async (response: AIResponse) => {
    setIsProcessing(true);
    setState(prev => ({ ...prev, error: null }));

    const startTime = Date.now();

    try {
      // Step 1: Parse content
      const parsedContent = await parseContent(response.content);

      // Step 2: Validate content
      const validation = await validateContent(parsedContent, response);

      // Step 3: Format content
      const formatting = await formatContent(parsedContent, validation);

      // Step 4: Generate metadata
      const metadata = generateMetadata(startTime, parsedContent, validation, formatting);

      const processedResponse: ProcessedResponse = {
        id: `processed-${Date.now()}`,
        originalResponse: response,
        parsedContent,
        validation,
        formatting,
        metadata,
        status: 'formatted'
      };

      setState(prev => ({
        ...prev,
        currentResponse: processedResponse,
        history: [processedResponse, ...prev.history],
        performance: {
          ...prev.performance,
          totalProcessed: prev.performance.totalProcessed + 1,
          averageProcessingTime: (prev.performance.averageProcessingTime + metadata.totalTime) / 2
        }
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Processing failed'
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [state.settings]);

  const parseContent = useCallback(async (content: string): Promise<ParsedContent> => {
    const type = detectContentType(content);
    const structure = analyzeStructure(content, type);
    const quality = assessQuality(content, type);

    return {
      type,
      content: parseByType(content, type),
      structure,
      quality
    };
  }, []);

  const detectContentType = useCallback((content: string): ParsedContent['type'] => {
    if (content.includes('import React') || content.includes('export const') || content.includes('function')) {
      return 'jsx';
    }
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return 'json';
    }
    if (content.includes('interface') || content.includes('type') || content.includes('export type')) {
      return 'typescript';
    }
    if (content.includes('# ') || content.includes('## ') || content.includes('```')) {
      return 'markdown';
    }
    return 'text';
  }, []);

  const analyzeStructure = useCallback((content: string, type: ParsedContent['type']): ContentStructure => {
    const hasImports = content.includes('import ');
    const hasExports = content.includes('export ');
    const hasComponents = content.includes('React.FC') || content.includes('function ') || content.includes('const ');
    const hasInterfaces = content.includes('interface ') || content.includes('type ');
    const hasFunctions = content.includes('function ') || content.includes('=>') || content.includes('const ');
    const hasComments = content.includes('//') || content.includes('/*') || content.includes('<!--');

    let complexity: ContentStructure['complexity'] = 'simple';
    if (content.split('\n').length > 50 || content.includes('useState') || content.includes('useEffect')) {
      complexity = 'complex';
    } else if (content.split('\n').length > 20) {
      complexity = 'medium';
    }

    return {
      hasImports,
      hasExports,
      hasComponents,
      hasInterfaces,
      hasFunctions,
      hasComments,
      complexity
    };
  }, []);

  const assessQuality = useCallback((content: string, type: ParsedContent['type']): ContentQuality => {
    const syntaxValid = validateSyntax(content, type);
    const typeSafe = validateTypeSafety(content, type);
    const followsBestPractices = validateBestPractices(content, type);
    const accessibilityCompliant = validateAccessibility(content, type);
    const responsiveDesign = validateResponsiveDesign(content, type);
    const performanceOptimized = validatePerformance(content, type);
    const securityCompliant = validateSecurity(content, type);

    const score = calculateQualityScore({
      syntaxValid,
      typeSafe,
      followsBestPractices,
      accessibilityCompliant,
      responsiveDesign,
      performanceOptimized,
      securityCompliant
    });

    return {
      syntaxValid,
      typeSafe,
      followsBestPractices,
      accessibilityCompliant,
      responsiveDesign,
      performanceOptimized,
      securityCompliant,
      score
    };
  }, []);

  const validateSyntax = useCallback((content: string, type: ParsedContent['type']): boolean => {
    try {
      switch (type) {
        case 'json':
          JSON.parse(content);
          return true;
        case 'jsx':
        case 'typescript':
          // Basic syntax validation
          return !content.includes('syntax error') && content.includes('{') && content.includes('}');
        default:
          return true;
      }
    } catch {
      return false;
    }
  }, []);

  const validateTypeSafety = useCallback((content: string, type: ParsedContent['type']): boolean => {
    if (type !== 'typescript' && type !== 'jsx') return true;
    return content.includes(':') && (content.includes('interface') || content.includes('type'));
  }, []);

  const validateBestPractices = useCallback((content: string, type: ParsedContent['type']): boolean => {
    const practices = [
      content.includes('className') || content.includes('class'),
      !content.includes('var '),
      content.includes('const ') || content.includes('let '),
      content.includes('function ') || content.includes('=>')
    ];
    return practices.filter(Boolean).length >= 3;
  }, []);

  const validateAccessibility = useCallback((content: string, type: ParsedContent['type']): boolean => {
    if (type !== 'jsx') return true;
    return content.includes('aria-') || content.includes('role=') || content.includes('alt=');
  }, []);

  const validateResponsiveDesign = useCallback((content: string, type: ParsedContent['type']): boolean => {
    if (type !== 'jsx') return true;
    return content.includes('responsive') || content.includes('md:') || content.includes('lg:');
  }, []);

  const validatePerformance = useCallback((content: string, type: ParsedContent['type']): boolean => {
    if (type !== 'jsx') return true;
    return content.includes('useMemo') || content.includes('useCallback') || content.includes('React.memo');
  }, []);

  const validateSecurity = useCallback((content: string, type: ParsedContent['type']): boolean => {
    return !content.includes('dangerouslySetInnerHTML') && !content.includes('eval(');
  }, []);

  const calculateQualityScore = useCallback((quality: Omit<ContentQuality, 'score'>): number => {
    const checks = [
      quality.syntaxValid,
      quality.typeSafe,
      quality.followsBestPractices,
      quality.accessibilityCompliant,
      quality.responsiveDesign,
      quality.performanceOptimized,
      quality.securityCompliant
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, []);

  const parseByType = useCallback((content: string, type: ParsedContent['type']): any => {
    switch (type) {
      case 'json':
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      case 'jsx':
      case 'typescript':
      case 'markdown':
      case 'text':
      default:
        return content;
    }
  }, []);

  const validateContent = useCallback(async (parsedContent: ParsedContent, response: AIResponse): Promise<ValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Syntax validation
    if (!parsedContent.quality.syntaxValid) {
      errors.push({
        type: 'syntax',
        message: 'Syntax errors detected in the content',
        severity: 'error',
        fix: 'Review and correct syntax errors'
      });
    }

    // Type safety validation
    if (!parsedContent.quality.typeSafe && (parsedContent.type === 'typescript' || parsedContent.type === 'jsx')) {
      warnings.push({
        type: 'type-safety',
        message: 'Type safety could be improved',
        suggestion: 'Add TypeScript interfaces and type annotations',
        impact: 'medium'
      });
    }

    // Best practices validation
    if (!parsedContent.quality.followsBestPractices) {
      warnings.push({
        type: 'best-practices',
        message: 'Some best practices are not followed',
        suggestion: 'Use modern JavaScript/React patterns',
        impact: 'medium'
      });
    }

    // Accessibility validation
    if (!parsedContent.quality.accessibilityCompliant && parsedContent.type === 'jsx') {
      warnings.push({
        type: 'accessibility',
        message: 'Accessibility features could be improved',
        suggestion: 'Add ARIA attributes and semantic HTML',
        impact: 'high'
      });
    }

    // Performance validation
    if (!parsedContent.quality.performanceOptimized && parsedContent.type === 'jsx') {
      suggestions.push('Consider using React.memo, useMemo, or useCallback for performance optimization');
    }

    // Security validation
    if (!parsedContent.quality.securityCompliant) {
      errors.push({
        type: 'security',
        message: 'Security vulnerabilities detected',
        severity: 'error',
        fix: 'Remove dangerous patterns like dangerouslySetInnerHTML'
      });
    }

    const compliance: ComplianceCheck = {
      wcag: parsedContent.quality.accessibilityCompliant,
      security: parsedContent.quality.securityCompliant,
      performance: parsedContent.quality.performanceOptimized,
      seo: true, // Placeholder
      accessibility: parsedContent.quality.accessibilityCompliant
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      compliance
    };
  }, []);

  const formatContent = useCallback(async (parsedContent: ParsedContent, validation: ValidationResult): Promise<FormattingResult> => {
    let formattedContent = parsedContent.content;
    const improvements: string[] = [];
    const optimizations: string[] = [];

    // Apply auto-fixes if enabled
    if (state.settings.autoFix) {
      if (typeof formattedContent === 'string') {
        // Format JSX/TypeScript
        if (parsedContent.type === 'jsx' || parsedContent.type === 'typescript') {
          formattedContent = formatCode(formattedContent);
          improvements.push('Code formatting applied');
        }

        // Format JSON
        if (parsedContent.type === 'json') {
          try {
            const parsed = JSON.parse(formattedContent);
            formattedContent = JSON.stringify(parsed, null, 2);
            improvements.push('JSON formatting applied');
          } catch {
            // Keep original if parsing fails
          }
        }

        // Apply optimizations
        if (parsedContent.type === 'jsx') {
          const optimized = optimizeJSX(formattedContent);
          if (optimized !== formattedContent) {
            formattedContent = optimized;
            optimizations.push('JSX optimizations applied');
          }
        }
      }
    }

    return {
      formatted: true,
      originalFormat: typeof parsedContent.content === 'string' ? parsedContent.content : JSON.stringify(parsedContent.content),
      targetFormat: typeof formattedContent === 'string' ? formattedContent : JSON.stringify(formattedContent),
      formattedContent: typeof formattedContent === 'string' ? formattedContent : JSON.stringify(formattedContent),
      improvements,
      optimizations
    };
  }, [state.settings.autoFix]);

  const formatCode = useCallback((code: string): string => {
    // Basic code formatting
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\s*;\s*/g, ';\n  ')
      .trim();
  }, []);

  const optimizeJSX = useCallback((jsx: string): string => {
    // Basic JSX optimizations
    let optimized = jsx;

    // Remove unnecessary fragments
    optimized = optimized.replace(/<>\s*<\/>/g, '');

    // Optimize className concatenation
    optimized = optimized.replace(/className=\{`([^`]+)`\}/g, 'className="$1"');

    return optimized;
  }, []);

  const generateMetadata = useCallback((
    startTime: number,
    parsedContent: ParsedContent,
    validation: ValidationResult,
    formatting: FormattingResult
  ): ResponseMetadata => {
    const totalTime = Date.now() - startTime;
    const size = JSON.stringify(parsedContent.content).length;
    const complexity = parsedContent.structure.complexity === 'complex' ? 3 :
                      parsedContent.structure.complexity === 'medium' ? 2 : 1;
    const maintainability = Math.max(0, 100 - (validation.errors.length * 10) - (validation.warnings.length * 5));
    const readability = parsedContent.quality.score;

    return {
      processingTime: totalTime * 0.3,
      validationTime: totalTime * 0.4,
      formattingTime: totalTime * 0.3,
      totalTime,
      size,
      complexity,
      maintainability,
      readability
    };
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ==================== HEADER ==================== */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-8 h-8 mr-3 text-green-500" />
                Response Processor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI response parsing, validation, and formatting engine
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {state.performance.totalProcessed}
                </div>
                <div className="text-sm text-gray-500">Processed</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(state.performance.validationAccuracy)}%
                </div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==================== INPUT SECTION ==================== */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-blue-500" />
                  Process AI Response
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Paste an AI response to process, validate, and format
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      AI Response Content
                    </label>
                    <textarea
                      value={responseInput}
                      onChange={(e) => setResponseInput(e.target.value)}
                      placeholder="Paste AI-generated content here..."
                      className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        const mockResponse: AIResponse = {
                          content: responseInput,
                          usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
                          finishReason: 'stop',
                          model: 'gpt-4o',
                          processingTime: 1500,
                          confidence: 0.85,
                          suggestions: [],
                          warnings: []
                        };
                        processResponse(mockResponse);
                      }}
                      disabled={!responseInput.trim() || isProcessing}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>{isProcessing ? 'Processing...' : 'Process Response'}</span>
                    </button>
                    <div className="text-sm text-gray-500">
                      {responseInput.length} characters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== PROCESSED RESULT ==================== */}
            {state.currentResponse && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Processed Result
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Validation, formatting, and quality analysis complete
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quality Score */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Score</h4>
                      <div className="text-3xl font-bold text-blue-600">
                        {state.currentResponse.parsedContent.quality.score}/100
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {state.currentResponse.parsedContent.quality.score >= 90 ? 'Excellent' :
                         state.currentResponse.parsedContent.quality.score >= 80 ? 'Good' :
                         state.currentResponse.parsedContent.quality.score >= 70 ? 'Fair' : 'Needs Improvement'}
                      </div>
                    </div>

                    {/* Content Type */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Content Type</h4>
                      <div className="text-2xl font-bold text-green-600 uppercase">
                        {state.currentResponse.parsedContent.type}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {state.currentResponse.parsedContent.structure.complexity} complexity
                      </div>
                    </div>
                  </div>

                  {/* Validation Results */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Validation Results</h4>
                    <div className="space-y-3">
                      {state.currentResponse.validation.errors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                          <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors ({state.currentResponse.validation.errors.length})</h5>
                          <div className="space-y-2">
                            {state.currentResponse.validation.errors.map((error, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-red-800 dark:text-red-200">{error.message}</div>
                                  {error.fix && (
                                    <div className="text-xs text-red-600 dark:text-red-300">Fix: {error.fix}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {state.currentResponse.validation.warnings.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Warnings ({state.currentResponse.validation.warnings.length})</h5>
                          <div className="space-y-2">
                            {state.currentResponse.validation.warnings.map((warning, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{warning.message}</div>
                                  <div className="text-xs text-yellow-600 dark:text-yellow-300">Suggestion: {warning.suggestion}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {state.currentResponse.validation.isValid && state.currentResponse.validation.errors.length === 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-green-800 dark:text-green-200">All validations passed successfully!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formatted Content */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Formatted Content</h4>
                      <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-800 dark:text-gray-200">
                        {state.currentResponse.formatting.formattedContent}
                      </code>
                    </pre>
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
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Performance Metrics
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Processing</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(state.performance.averageProcessingTime)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(state.performance.successRate * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Processed</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {state.performance.totalProcessed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Validation Accuracy</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {Math.round(state.performance.validationAccuracy)}%
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
                  Processor Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Validation</span>
                    <input
                      type="checkbox"
                      checked={state.settings.enableValidation}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enableValidation: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Formatting</span>
                    <input
                      type="checkbox"
                      checked={state.settings.enableFormatting}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enableFormatting: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Fix</span>
                    <input
                      type="checkbox"
                      checked={state.settings.autoFix}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, autoFix: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quality Threshold
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.settings.qualityThreshold}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, qualityThreshold: parseInt(e.target.value) }
                      }))}
                      className="w-full mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {state.settings.qualityThreshold}% minimum quality
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

export default ResponseProcessor;
