'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Brain, Eye, Code, Play, Pause, RotateCcw, Download, Share, Settings, Activity, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';

// ==================== TYPES ====================
interface PolicyExpressionEvaluatorProps {
  tenantId: string;
  userId: string;
  enableRealTimeEvaluation?: boolean;
  enableAISuggestions?: boolean;
  enablePolicyBuilder?: boolean;
  enableAuditTrail?: boolean;
  onPolicyViolation?: (violation: PolicyViolation) => void;
  onAISuggestion?: (suggestion: AISecuritySuggestion) => void;
  onPolicyUpdate?: (policy: SecurityPolicy) => void;
}

interface PolicyExpression {
  id: string;
  name: string;
  description: string;
  expression: string;
  action: 'allow' | 'deny' | 'warn' | 'log';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  priority: number;
  metadata: {
    category: 'permission' | 'resource' | 'api' | 'data' | 'network';
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface EvaluationContext {
  user: {
    id: string;
    role: string;
    permissions: string[];
    tenantId: string;
    sessionId: string;
  };
  resource: {
    id: string;
    type: string;
    sensitivity: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
    metadata: Record<string, any>;
  };
  action: {
    type: string;
    target: string;
    data: Record<string, any>;
    timestamp: Date;
  };
  environment: {
    ipAddress: string;
    userAgent: string;
    location: string;
    timeOfDay: number;
    riskScore: number;
  };
}

interface PolicyViolation {
  id: string;
  timestamp: Date;
  policyId: string;
  policyName: string;
  expression: string;
  context: EvaluationContext;
  result: 'denied' | 'warned' | 'logged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    reason: string;
    evidence: Record<string, any>;
    suggestions: string[];
  };
  resolved: boolean;
}

interface AISecuritySuggestion {
  id: string;
  timestamp: Date;
  type: 'policy_optimization' | 'threat_prevention' | 'compliance_improvement' | 'performance_enhancement';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  autoApply: boolean;
  metadata: Record<string, any>;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  expressions: PolicyExpression[];
  enabled: boolean;
  priority: number;
  metadata: {
    category: string;
    compliance: string[];
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface EvaluatorState {
  isActive: boolean;
  isPaused: boolean;
  policies: SecurityPolicy[];
  violations: PolicyViolation[];
  suggestions: AISecuritySuggestion[];
  metrics: {
    totalEvaluations: number;
    violations: number;
    warnings: number;
    averageEvaluationTime: number;
    policyCount: number;
    activePolicies: number;
  };
  evaluationHistory: Array<{
    id: string;
    timestamp: Date;
    policyId: string;
    result: boolean;
    evaluationTime: number;
    context: EvaluationContext;
  }>;
}

// ==================== POLICY EXPRESSION EVALUATOR COMPONENT ====================
export const PolicyExpressionEvaluator: React.FC<PolicyExpressionEvaluatorProps> = ({
  tenantId,
  userId,
  enableRealTimeEvaluation = true,
  enableAISuggestions = true,
  enablePolicyBuilder = true,
  enableAuditTrail = true,
  onPolicyViolation,
  onAISuggestion,
  onPolicyUpdate
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [state, setState] = useState<EvaluatorState>({
    isActive: false,
    isPaused: false,
    policies: [],
    violations: [],
    suggestions: [],
    metrics: {
      totalEvaluations: 0,
      violations: 0,
      warnings: 0,
      averageEvaluationTime: 0,
      policyCount: 0,
      activePolicies: 0
    },
    evaluationHistory: []
  });

  const [showPolicyBuilder, setShowPolicyBuilder] = useState(false);
  const [showViolations, setShowViolations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<'strict' | 'lenient' | 'adaptive'>('adaptive');

  const evaluatorRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== POLICY EXPRESSION PARSER ====================
  const parseExpression = useCallback((expression: string): (context: EvaluationContext) => boolean => {
    // Simple expression parser - in production, use a proper expression engine
    return (context: EvaluationContext) => {
      try {
        // Replace variables with context values
        let parsedExpression = expression
          .replace(/\buser\.role\b/g, `"${context.user.role}"`)
          .replace(/\buser\.permissions\b/g, JSON.stringify(context.user.permissions))
          .replace(/\bresource\.sensitivity\b/g, `"${context.resource.sensitivity}"`)
          .replace(/\bresource\.type\b/g, `"${context.resource.type}"`)
          .replace(/\baction\.type\b/g, `"${context.action.type}"`)
          .replace(/\benvironment\.riskScore\b/g, context.environment.riskScore.toString())
          .replace(/\benvironment\.timeOfDay\b/g, context.environment.timeOfDay.toString());

        // Evaluate the expression
        return eval(parsedExpression);
      } catch (error) {
        console.error('Expression evaluation error:', error);
        return false; // Deny by default on error
      }
    };
  }, []);

  // ==================== POLICY EVALUATION ====================
  const evaluatePolicy = useCallback((policy: PolicyExpression, context: EvaluationContext): boolean => {
    const startTime = performance.now();

    try {
      const evaluator = parseExpression(policy.expression);
      const result = evaluator(context);

      const evaluationTime = performance.now() - startTime;

      // Record evaluation history
      setState(prev => ({
        ...prev,
        evaluationHistory: [...prev.evaluationHistory, {
          id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          policyId: policy.id,
          result,
          evaluationTime,
          context
        }].slice(-1000) // Keep last 1000 evaluations
      }));

      // Update metrics
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalEvaluations: prev.metrics.totalEvaluations + 1,
          averageEvaluationTime: (prev.metrics.averageEvaluationTime + evaluationTime) / 2
        }
      }));

      return result;
    } catch (error) {
      console.error('Policy evaluation failed:', error);
      return false;
    }
  }, [parseExpression]);

  const evaluateAllPolicies = useCallback((context: EvaluationContext): PolicyViolation[] => {
    const violations: PolicyViolation[] = [];
    const activePolicies = state.policies
      .filter(policy => policy.enabled)
      .flatMap(policy => policy.expressions)
      .filter(expression => expression.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of activePolicies) {
      const result = evaluatePolicy(policy, context);

      if (!result) {
        const violation: PolicyViolation = {
          id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          policyId: policy.id,
          policyName: policy.name,
          expression: policy.expression,
          context,
          result: policy.action === 'deny' ? 'denied' : policy.action === 'warn' ? 'warned' : 'logged',
          severity: policy.severity,
          details: {
            reason: `Policy "${policy.name}" evaluation failed`,
            evidence: {
              expression: policy.expression,
              context: context,
              evaluationResult: result
            },
            suggestions: generateViolationSuggestions(policy, context)
          },
          resolved: false
        };

        violations.push(violation);

        setState(prev => ({
          ...prev,
          violations: [...prev.violations, violation].slice(-100), // Keep last 100 violations
          metrics: {
            ...prev.metrics,
            violations: prev.metrics.violations + 1
          }
        }));

        onPolicyViolation?.(violation);
      }
    }

    return violations;
  }, [state.policies, evaluatePolicy, onPolicyViolation]);

  const generateViolationSuggestions = useCallback((policy: PolicyExpression, context: EvaluationContext): string[] => {
    const suggestions: string[] = [];

    if (policy.metadata.category === 'permission') {
      suggestions.push('Review user permissions and roles');
      suggestions.push('Consider granting temporary access if needed');
    }

    if (policy.metadata.category === 'resource') {
      suggestions.push('Check resource sensitivity settings');
      suggestions.push('Verify resource ownership and access rights');
    }

    if (policy.metadata.category === 'api') {
      suggestions.push('Review API access patterns');
      suggestions.push('Check rate limiting and quotas');
    }

    if (context.environment.riskScore > 0.7) {
      suggestions.push('High risk environment detected - consider additional verification');
    }

    return suggestions;
  }, []);

  // ==================== AI SUGGESTIONS ====================
  const generateAISuggestions = useCallback(() => {
    if (!enableAISuggestions) return;

    const suggestions: AISecuritySuggestion[] = [];

    // Analyze violation patterns
    const recentViolations = state.violations.slice(-20);
    const violationTypes = recentViolations.reduce((acc, violation) => {
      const category = violation.context.resource.type;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Suggest policy optimizations
    Object.entries(violationTypes).forEach(([type, count]) => {
      if (count > 5) {
        suggestions.push({
          id: `suggestion-${Date.now()}-1`,
          timestamp: new Date(),
          type: 'policy_optimization',
          title: `Optimize policies for ${type} resources`,
          description: `High violation rate detected for ${type} resources. Consider reviewing and optimizing related policies.`,
          confidence: 0.85,
          impact: 'medium',
          actionItems: [
            `Review ${type} resource access patterns`,
            'Analyze user permission requirements',
            'Consider implementing role-based access control'
          ],
          autoApply: false,
          metadata: { resourceType: type, violationCount: count }
        });
      }
    });

    // Suggest threat prevention
    if (state.metrics.violations > 10) {
      suggestions.push({
        id: `suggestion-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'threat_prevention',
        title: 'Implement additional security measures',
        description: 'High violation rate detected. Consider implementing additional security measures.',
        confidence: 0.9,
        impact: 'high',
        actionItems: [
          'Enable multi-factor authentication',
          'Implement session timeout policies',
          'Add anomaly detection rules'
        ],
        autoApply: false,
        metadata: { violationCount: state.metrics.violations }
      });
    }

    // Suggest compliance improvements
    if (state.policies.length < 10) {
      suggestions.push({
        id: `suggestion-${Date.now()}-3`,
        timestamp: new Date(),
        type: 'compliance_improvement',
        title: 'Enhance policy coverage',
        description: 'Limited policy coverage detected. Consider adding more comprehensive security policies.',
        confidence: 0.8,
        impact: 'medium',
        actionItems: [
          'Add data protection policies',
          'Implement audit logging policies',
          'Create incident response policies'
        ],
        autoApply: false,
        metadata: { currentPolicyCount: state.policies.length }
      });
    }

    suggestions.forEach(suggestion => {
      setState(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, suggestion].slice(-50) // Keep last 50 suggestions
      }));
      onAISuggestion?.(suggestion);
    });
  }, [state.violations, state.metrics.violations, state.policies.length, enableAISuggestions, onAISuggestion]);

  // ==================== POLICY BUILDER ====================
  const createPolicy = useCallback((policyData: Omit<SecurityPolicy, 'id' | 'metadata'>) => {
    const policy: SecurityPolicy = {
      ...policyData,
      id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        category: 'custom',
        compliance: ['GDPR', 'SOC2'],
        tags: ['custom', 'security'],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    setState(prev => ({
      ...prev,
      policies: [...prev.policies, policy],
      metrics: {
        ...prev.metrics,
        policyCount: prev.metrics.policyCount + 1,
        activePolicies: prev.metrics.activePolicies + (policy.enabled ? 1 : 0)
      }
    }));

    onPolicyUpdate?.(policy);
  }, [userId, onPolicyUpdate]);

  // ==================== EVALUATOR CONTROL ====================
  const startEvaluator = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));

    if (enableRealTimeEvaluation) {
      evaluatorRef.current = setInterval(() => {
        // Simulate real-time policy evaluations
        const context: EvaluationContext = {
          user: {
            id: userId,
            role: 'user',
            permissions: ['read', 'write'],
            tenantId,
            sessionId: `session-${Date.now()}`
          },
          resource: {
            id: `resource-${Math.floor(Math.random() * 1000)}`,
            type: ['document', 'user', 'api', 'database'][Math.floor(Math.random() * 4)] || 'document',
            sensitivity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            owner: userId,
            metadata: {}
          },
          action: {
            type: ['read', 'write', 'delete', 'execute'][Math.floor(Math.random() * 4)] || 'read',
            target: 'resource',
            data: {},
            timestamp: new Date()
          },
          environment: {
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            location: 'US',
            timeOfDay: new Date().getHours(),
            riskScore: Math.random()
          }
        };

        evaluateAllPolicies(context);
      }, 2000);
    }

    if (enableAISuggestions) {
      suggestionRef.current = setInterval(() => {
        generateAISuggestions();
      }, 10000);
    }
  }, [tenantId, userId, enableRealTimeEvaluation, enableAISuggestions, evaluateAllPolicies, generateAISuggestions]);

  const pauseEvaluator = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (evaluatorRef.current) {
      clearInterval(evaluatorRef.current);
      evaluatorRef.current = null;
    }
  }, []);

  const resumeEvaluator = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startEvaluator();
  }, [startEvaluator]);

  const stopEvaluator = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));

    if (evaluatorRef.current) {
      clearInterval(evaluatorRef.current);
      evaluatorRef.current = null;
    }

    if (suggestionRef.current) {
      clearInterval(suggestionRef.current);
      suggestionRef.current = null;
    }
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Initialize default policies
    const defaultPolicies: SecurityPolicy[] = [
      {
        id: 'policy-1',
        name: 'Permission Enforcement',
        description: 'Enforce strict permission checking',
        expressions: [
          {
            id: 'expr-1',
            name: 'Admin Access Only',
            description: 'Only admins can access critical resources',
            expression: 'user.role === "admin" && resource.sensitivity === "critical"',
            action: 'deny',
            severity: 'critical',
            enabled: true,
            priority: 1,
            metadata: {
              category: 'permission',
              tags: ['admin', 'critical'],
              createdBy: 'system',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        ],
        enabled: true,
        priority: 1,
        metadata: {
          category: 'security',
          compliance: ['SOC2'],
          tags: ['default', 'security'],
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ];

    setState(prev => ({
      ...prev,
      policies: defaultPolicies,
      metrics: {
        ...prev.metrics,
        policyCount: defaultPolicies.length,
        activePolicies: defaultPolicies.filter(p => p.enabled).length
      }
    }));

    if (enableRealTimeEvaluation || enableAISuggestions) {
      startEvaluator();
    }

    return () => {
      stopEvaluator();
    };
  }, [enableRealTimeEvaluation, enableAISuggestions, startEvaluator, stopEvaluator]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Expression Evaluator</h2>

          {/* Evaluator Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {state.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Evaluation Mode */}
          <select
            value={evaluationMode}
            onChange={(e) => setEvaluationMode(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="strict">Strict</option>
            <option value="lenient">Lenient</option>
            <option value="adaptive">Adaptive</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!state.isActive ? (
              <button
                onClick={startEvaluator}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
            ) : state.isPaused ? (
              <button
                onClick={resumeEvaluator}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseEvaluator}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
            )}

            <button
              onClick={stopEvaluator}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPolicyBuilder(!showPolicyBuilder)}
              className={`p-2 rounded ${showPolicyBuilder ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowViolations(!showViolations)}
              className={`p-2 rounded ${showViolations ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`p-2 rounded ${showSuggestions ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAuditTrail(!showAuditTrail)}
              className={`p-2 rounded ${showAuditTrail ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== EVALUATOR OVERVIEW ==================== */}
        <div className="flex-1 p-4">
          {/* Evaluation Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {state.metrics.totalEvaluations}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Evaluations</div>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {state.metrics.violations}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Violations</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.metrics.activePolicies}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Active Policies</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {state.metrics.averageEvaluationTime.toFixed(2)}ms
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Time</div>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Policy Builder */}
          <AnimatePresence>
            {showPolicyBuilder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Policy Builder</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter policy name"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expression
                    </label>
                    <textarea
                      placeholder="user.role === 'admin' && resource.sensitivity === 'critical'"
                      className="w-full h-20 p-2 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Policy
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================== SIDEBAR PANELS ==================== */}
        <div className="w-80 flex flex-col space-y-4 p-4">
          {/* Violations Panel */}
          <AnimatePresence>
            {showViolations && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Violations</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.violations.slice(-5).map((violation) => (
                      <div key={violation.id} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400">{violation.policyName}</div>
                        <div className="text-red-500 dark:text-red-300">{violation.details.reason}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {violation.timestamp.toLocaleTimeString()} • {violation.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Suggestions Panel */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.suggestions.slice(-5).map((suggestion) => (
                      <div key={suggestion.id} className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div className="font-medium text-green-600 dark:text-green-400">{suggestion.title}</div>
                        <div className="text-green-500 dark:text-green-300">{suggestion.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence: {(suggestion.confidence * 100).toFixed(1)}% • Impact: {suggestion.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audit Trail Panel */}
          <AnimatePresence>
            {showAuditTrail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Trail</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {state.evaluationHistory.slice(-5).map((evaluation) => (
                      <div key={evaluation.id} className="text-sm bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <div className="font-medium text-purple-600 dark:text-purple-400">
                          {evaluation.result ? 'Allowed' : 'Denied'}
                        </div>
                        <div className="text-purple-500 dark:text-purple-300">
                          {evaluation.evaluationTime.toFixed(2)}ms
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {evaluation.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PolicyExpressionEvaluator;
