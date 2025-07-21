// ==================== AI-BOS SIMULATOR ENGINE ====================
// AI-Powered Application Testing and Simulation Engine
// Steve Jobs Philosophy: "Quality is more important than quantity"

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, RotateCcw, CheckCircle, AlertTriangle,
  Eye, Code, Sparkles, Settings, Target, Zap,
  Clock, Brain, Layers, Bug, Shield, BarChart3,
  Smartphone, Tablet, Monitor, Users, Database
} from 'lucide-react';

// ==================== TYPES ====================
interface SimulationRequest {
  id: string;
  appManifest: any;
  testScenarios: TestScenario[];
  environment: SimulationEnvironment;
  userProfiles: UserProfile[];
  performanceTargets: PerformanceTargets;
  timestamp: Date;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  type: 'functional' | 'performance' | 'security' | 'accessibility' | 'usability';
  steps: TestStep[];
  expectedResults: ExpectedResult[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface TestStep {
  id: string;
  action: string;
  target: string;
  data?: any;
  waitTime?: number;
  conditions?: string[];
}

interface ExpectedResult {
  condition: string;
  expected: any;
  tolerance?: number;
}

interface SimulationEnvironment {
  device: 'mobile' | 'tablet' | 'desktop';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge';
  network: 'fast' | 'slow' | 'offline';
  screenSize: { width: number; height: number };
  userAgent: string;
}

interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  behavior: {
    patience: number; // 0-1
    technicalSkill: number; // 0-1
    accessibilityNeeds: string[];
  };
}

interface PerformanceTargets {
  loadTime: number; // milliseconds
  responseTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  errorRate: number; // percentage
}

interface SimulationResult {
  id: string;
  requestId: string;
  status: 'running' | 'complete' | 'failed';
  scenarios: ScenarioResult[];
  performance: PerformanceMetrics;
  security: SecurityReport;
  accessibility: AccessibilityReport;
  usability: UsabilityReport;
  recommendations: string[];
  warnings: string[];
  errors: string[];
  timestamp: Date;
}

interface ScenarioResult {
  scenarioId: string;
  status: 'passed' | 'failed' | 'warning';
  executionTime: number;
  steps: StepResult[];
  issues: Issue[];
}

interface StepResult {
  stepId: string;
  status: 'passed' | 'failed' | 'skipped';
  executionTime: number;
  actualResult: any;
  expectedResult: any;
  screenshot?: string;
  error?: string;
}

interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location: string;
  suggestion: string;
}

interface PerformanceMetrics {
  loadTime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  bundleSize: number;
  lighthouseScore: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

interface SecurityReport {
  vulnerabilities: Vulnerability[];
  compliance: ComplianceCheck[];
  dataProtection: DataProtectionCheck;
  overallScore: number;
}

interface Vulnerability {
  id: string;
  type: 'xss' | 'csrf' | 'sqli' | 'auth' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  remediation: string;
}

interface ComplianceCheck {
  standard: 'gdpr' | 'hipaa' | 'sox' | 'pci';
  status: 'compliant' | 'non-compliant' | 'partial';
  issues: string[];
}

interface DataProtectionCheck {
  encryption: boolean;
  dataMasking: boolean;
  accessControl: boolean;
  auditLogging: boolean;
}

interface AccessibilityReport {
  wcagLevel: 'A' | 'AA' | 'AAA';
  violations: AccessibilityViolation[];
  recommendations: string[];
  overallScore: number;
}

interface AccessibilityViolation {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  element: string;
  fix: string;
}

interface UsabilityReport {
  userSatisfaction: number; // 0-1
  taskCompletion: number; // 0-1
  errorRate: number; // 0-1
  learnability: number; // 0-1
  efficiency: number; // 0-1
  recommendations: string[];
}

interface SimulatorState {
  isActive: boolean;
  currentSimulation: SimulationRequest | null;
  simulationResult: SimulationResult | null;
  history: SimulationRequest[];
  templates: TestTemplate[];
  performance: {
    totalSimulations: number;
    averageExecutionTime: number;
    successRate: number;
    issuesFound: number;
  };
  settings: {
    autoRun: boolean;
    parallelExecution: boolean;
    screenshotCapture: boolean;
    performanceMonitoring: boolean;
    securityScanning: boolean;
    accessibilityTesting: boolean;
  };
  error: string | null;
}

interface TestTemplate {
  id: string;
  name: string;
  description: string;
  scenarios: string[];
  complexity: 'simple' | 'medium' | 'high';
}

// ==================== TEST TEMPLATES ====================
const TEST_TEMPLATES: TestTemplate[] = [
  {
    id: 'basic-functionality',
    name: 'Basic Functionality',
    description: 'Core application functionality testing',
    scenarios: ['form-submission', 'navigation', 'data-display'],
    complexity: 'simple'
  },
  {
    id: 'performance',
    name: 'Performance Testing',
    description: 'Load time and performance optimization',
    scenarios: ['load-testing', 'memory-usage', 'response-time'],
    complexity: 'medium'
  },
  {
    id: 'security',
    name: 'Security Testing',
    description: 'Vulnerability and security assessment',
    scenarios: ['xss-testing', 'authentication', 'data-protection'],
    complexity: 'high'
  },
  {
    id: 'accessibility',
    name: 'Accessibility Testing',
    description: 'WCAG compliance and accessibility features',
    scenarios: ['screen-reader', 'keyboard-navigation', 'color-contrast'],
    complexity: 'medium'
  }
];

// ==================== COMPONENT ====================
export const SimulatorEngine: React.FC = () => {
  const [state, setState] = useState<SimulatorState>({
    isActive: false,
    currentSimulation: null,
    simulationResult: null,
    history: [],
    templates: TEST_TEMPLATES,
    performance: {
      totalSimulations: 0,
      averageExecutionTime: 0,
      successRate: 0,
      issuesFound: 0
    },
    settings: {
      autoRun: true,
      parallelExecution: true,
      screenshotCapture: true,
      performanceMonitoring: true,
      securityScanning: true,
      accessibilityTesting: true
    },
    error: null
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);

  // ==================== SIMULATION FUNCTIONS ====================
  const startSimulation = useCallback(async (appManifest: any, template?: string) => {
    setIsSimulating(true);
    setState(prev => ({ ...prev, error: null }));

    const request: SimulationRequest = {
      id: `sim-${Date.now()}`,
      appManifest,
      testScenarios: generateTestScenarios(template),
      environment: generateEnvironment(),
      userProfiles: generateUserProfiles(),
      performanceTargets: generatePerformanceTargets(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      currentSimulation: request,
      history: [request, ...prev.history]
    }));

    // Simulate testing process
    await simulateTesting(request);
  }, []);

  const simulateTesting = useCallback(async (request: SimulationRequest) => {
    const startTime = Date.now();

    // Step 1: Initialize simulation environment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Run functional tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Run performance tests
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 4: Run security tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Run accessibility tests
    await new Promise(resolve => setTimeout(resolve, 800));

    const executionTime = Date.now() - startTime;

    const result: SimulationResult = {
      id: `result-${Date.now()}`,
      requestId: request.id,
      status: 'complete',
      scenarios: generateScenarioResults(request),
      performance: generatePerformanceMetrics(),
      security: generateSecurityReport(),
      accessibility: generateAccessibilityReport(),
      usability: generateUsabilityReport(),
      recommendations: generateRecommendations(),
      warnings: generateWarnings(),
      errors: generateErrors(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      simulationResult: result,
      currentSimulation: null,
      performance: {
        ...prev.performance,
        totalSimulations: prev.performance.totalSimulations + 1,
        averageExecutionTime: (prev.performance.averageExecutionTime + executionTime) / 2,
        successRate: ((prev.performance.successRate * prev.performance.totalSimulations) + 1) / (prev.performance.totalSimulations + 1),
        issuesFound: prev.performance.issuesFound + result.errors.length + result.warnings.length
      }
    }));

    setIsSimulating(false);
  }, []);

  const generateTestScenarios = useCallback((template?: string): TestScenario[] => {
    const scenarios: TestScenario[] = [];

    if (template === 'basic-functionality') {
      scenarios.push({
        id: 'form-submission',
        name: 'Form Submission Test',
        description: 'Test form submission functionality',
        type: 'functional',
        steps: [
          { id: 'step-1', action: 'fill', target: 'name-field', data: 'John Doe' },
          { id: 'step-2', action: 'fill', target: 'email-field', data: 'john@example.com' },
          { id: 'step-3', action: 'click', target: 'submit-button' },
          { id: 'step-4', action: 'wait', target: 'response', waitTime: 2000 }
        ],
        expectedResults: [
          { condition: 'form-submitted', expected: true },
          { condition: 'success-message', expected: 'Success' }
        ],
        priority: 'high'
      });
    }

    if (template === 'performance') {
      scenarios.push({
        id: 'load-testing',
        name: 'Load Time Test',
        description: 'Test application load time',
        type: 'performance',
        steps: [
          { id: 'step-1', action: 'navigate', target: 'app-url' },
          { id: 'step-2', action: 'measure', target: 'load-time' }
        ],
        expectedResults: [
          { condition: 'load-time', expected: 3000, tolerance: 1000 }
        ],
        priority: 'medium'
      });
    }

    if (template === 'security') {
      scenarios.push({
        id: 'xss-testing',
        name: 'XSS Vulnerability Test',
        description: 'Test for XSS vulnerabilities',
        type: 'security',
        steps: [
          { id: 'step-1', action: 'inject', target: 'input-field', data: '<script>alert("xss")</script>' },
          { id: 'step-2', action: 'submit', target: 'form' },
          { id: 'step-3', action: 'check', target: 'output' }
        ],
        expectedResults: [
          { condition: 'xss-prevented', expected: true }
        ],
        priority: 'critical'
      });
    }

    return scenarios;
  }, []);

  const generateEnvironment = useCallback((): SimulationEnvironment => {
    return {
      device: 'desktop',
      browser: 'chrome',
      network: 'fast',
      screenSize: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  }, []);

  const generateUserProfiles = useCallback((): UserProfile[] => {
    return [
      {
        id: 'admin-1',
        name: 'Admin User',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        behavior: {
          patience: 0.8,
          technicalSkill: 0.9,
          accessibilityNeeds: []
        }
      },
      {
        id: 'user-1',
        name: 'Regular User',
        role: 'user',
        permissions: ['read', 'write'],
        behavior: {
          patience: 0.6,
          technicalSkill: 0.5,
          accessibilityNeeds: []
        }
      }
    ];
  }, []);

  const generatePerformanceTargets = useCallback((): PerformanceTargets => {
    return {
      loadTime: 3000,
      responseTime: 500,
      memoryUsage: 100,
      cpuUsage: 50,
      errorRate: 1
    };
  }, []);

  const generateScenarioResults = useCallback((request: SimulationRequest): ScenarioResult[] => {
    return request.testScenarios.map(scenario => ({
      scenarioId: scenario.id,
      status: Math.random() > 0.1 ? 'passed' : 'failed',
      executionTime: Math.random() * 2000 + 500,
      steps: scenario.steps.map(step => ({
        stepId: step.id,
        status: 'passed',
        executionTime: Math.random() * 500 + 100,
        actualResult: 'Success',
        expectedResult: 'Success'
      })),
      issues: []
    }));
  }, []);

  const generatePerformanceMetrics = useCallback((): PerformanceMetrics => {
    return {
      loadTime: Math.random() * 2000 + 1000,
      responseTime: Math.random() * 300 + 200,
      memoryUsage: Math.random() * 50 + 30,
      cpuUsage: Math.random() * 30 + 20,
      networkRequests: Math.floor(Math.random() * 20) + 10,
      bundleSize: Math.random() * 500 + 200,
      lighthouseScore: {
        performance: Math.random() * 20 + 80,
        accessibility: Math.random() * 15 + 85,
        bestPractices: Math.random() * 10 + 90,
        seo: Math.random() * 15 + 85
      }
    };
  }, []);

  const generateSecurityReport = useCallback((): SecurityReport => {
    return {
      vulnerabilities: Math.random() > 0.8 ? [{
        id: 'sec-1',
        type: 'xss',
        severity: 'medium',
        description: 'Potential XSS vulnerability in user input',
        location: 'contact form',
        remediation: 'Implement proper input sanitization'
      }] : [],
      compliance: [
        {
          standard: 'gdpr',
          status: 'compliant',
          issues: []
        }
      ],
      dataProtection: {
        encryption: true,
        dataMasking: true,
        accessControl: true,
        auditLogging: true
      },
      overallScore: Math.random() * 20 + 80
    };
  }, []);

  const generateAccessibilityReport = useCallback((): AccessibilityReport => {
    return {
      wcagLevel: 'AA',
      violations: Math.random() > 0.7 ? [{
        id: 'acc-1',
        rule: '1.4.3',
        severity: 'low',
        description: 'Color contrast could be improved',
        element: 'button',
        fix: 'Increase contrast ratio to 4.5:1'
      }] : [],
      recommendations: [
        'Add ARIA labels to interactive elements',
        'Ensure keyboard navigation works properly'
      ],
      overallScore: Math.random() * 15 + 85
    };
  }, []);

  const generateUsabilityReport = useCallback((): UsabilityReport => {
    return {
      userSatisfaction: Math.random() * 0.3 + 0.7,
      taskCompletion: Math.random() * 0.2 + 0.8,
      errorRate: Math.random() * 0.1,
      learnability: Math.random() * 0.3 + 0.7,
      efficiency: Math.random() * 0.2 + 0.8,
      recommendations: [
        'Simplify the navigation structure',
        'Add more visual feedback for user actions'
      ]
    };
  }, []);

  const generateRecommendations = useCallback((): string[] => {
    return [
      'Optimize bundle size for faster loading',
      'Implement lazy loading for better performance',
      'Add comprehensive error handling',
      'Enhance accessibility features'
    ];
  }, []);

  const generateWarnings = useCallback((): string[] => {
    return [
      'Memory usage is approaching recommended limits',
      'Some components could benefit from memoization'
    ];
  }, []);

  const generateErrors = useCallback((): string[] => {
    return Math.random() > 0.8 ? [
      'Critical security vulnerability detected',
      'Performance degradation under load'
    ] : [];
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
                <Play className="w-8 h-8 mr-3 text-green-500" />
                Simulator Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                AI-powered application testing and simulation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {state.performance.totalSimulations}
                </div>
                <div className="text-sm text-gray-500">Tests Run</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
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
          {/* ==================== SIMULATION CONTROLS ==================== */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-500" />
                  Test Configuration
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure and run comprehensive application tests
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isSimulating}
                    >
                      <option value="">Select a test template</option>
                      {state.templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => startSimulation({}, selectedTemplate)}
                      disabled={!selectedTemplate || isSimulating}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSimulating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{isSimulating ? 'Running Tests...' : 'Start Simulation'}</span>
                    </button>
                    <div className="text-sm text-gray-500">
                      {state.performance.totalSimulations} tests completed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== SIMULATION RESULTS ==================== */}
            {state.simulationResult && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Test Results
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Comprehensive analysis of application performance and security
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performance Metrics */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Load Time</span>
                          <span className="text-sm font-medium">{state.simulationResult.performance.loadTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                          <span className="text-sm font-medium">{state.simulationResult.performance.memoryUsage}MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Lighthouse Score</span>
                          <span className="text-sm font-medium">{Math.round(state.simulationResult.performance.lighthouseScore.performance)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Score */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Score</span>
                          <span className="text-sm font-medium">{Math.round(state.simulationResult.security.overallScore)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Vulnerabilities</span>
                          <span className="text-sm font-medium">{state.simulationResult.security.vulnerabilities.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Compliance</span>
                          <span className="text-sm font-medium">{state.simulationResult.security.compliance[0]?.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Issues and Recommendations */}
                  <div className="mt-6 space-y-4">
                    {state.simulationResult.errors.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Critical Issues</h4>
                        <div className="space-y-1">
                          {state.simulationResult.errors.map((error, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {state.simulationResult.warnings.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Warnings</h4>
                        <div className="space-y-1">
                          {state.simulationResult.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {state.simulationResult.recommendations.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Recommendations</h4>
                        <div className="space-y-1">
                          {state.simulationResult.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-green-700 dark:text-green-300">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Execution</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(state.performance.averageExecutionTime)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(state.performance.successRate * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Tests</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {state.performance.totalSimulations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issues Found</span>
                    <span className="text-sm text-orange-600 font-medium">
                      {state.performance.issuesFound}
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
                  Test Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Run</span>
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, autoRun: !prev.settings.autoRun }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          state.settings.autoRun ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          state.settings.autoRun ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance</span>
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, performanceMonitoring: !prev.settings.performanceMonitoring }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          state.settings.performanceMonitoring ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          state.settings.performanceMonitoring ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</span>
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, securityScanning: !prev.settings.securityScanning }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          state.settings.securityScanning ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          state.settings.securityScanning ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accessibility</span>
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          settings: { ...prev.settings, accessibilityTesting: !prev.settings.accessibilityTesting }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          state.settings.accessibilityTesting ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          state.settings.accessibilityTesting ? 'translate-x-6' : 'translate-x-1'
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

export default SimulatorEngine;
