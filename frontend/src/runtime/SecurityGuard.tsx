'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Unlock, Eye, EyeOff, Zap, Users, Settings, Activity } from 'lucide-react';

import { AppManifest, ValidPermission } from './ManifestLoader';

// ==================== TYPES ====================
interface SecurityGuardProps {
  manifest: AppManifest;
  userPermissions: ValidPermission[];
  tenantId: string;
  userId: string;
  enableRealTimeMonitoring?: boolean;
  enableThreatDetection?: boolean;
  enablePolicyEnforcement?: boolean;
  onSecurityViolation?: (violation: SecurityViolation) => void;
  onThreatDetected?: (threat: SecurityThreat) => void;
  onPolicyUpdate?: (policy: SecurityPolicy) => void;
}

interface SecurityViolation {
  id: string;
  timestamp: Date;
  type: 'permission_violation' | 'resource_access' | 'api_violation' | 'data_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  user: string;
  tenant: string;
  resolved: boolean;
}

interface SecurityThreat {
  id: string;
  timestamp: Date;
  type: 'malicious_request' | 'data_breach' | 'api_abuse' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  indicators: string[];
  blocked: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityRule {
  id: string;
  type: 'permission' | 'resource' | 'api' | 'data' | 'network';
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'log';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface SecurityMetrics {
  totalViolations: number;
  totalThreats: number;
  blockedRequests: number;
  allowedRequests: number;
  securityScore: number; // 0-100
  lastIncident: Date | null;
  activePolicies: number;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
}

// ==================== SECURITY GUARD COMPONENT ====================
export const SecurityGuard: React.FC<SecurityGuardProps> = ({
  manifest,
  userPermissions,
  tenantId,
  userId,
  enableRealTimeMonitoring = true,
  enableThreatDetection = true,
  enablePolicyEnforcement = true,
  onSecurityViolation,
  onThreatDetected,
  onPolicyUpdate
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalViolations: 0,
    totalThreats: 0,
    blockedRequests: 0,
    allowedRequests: 0,
    securityScore: 100,
    lastIncident: null,
    activePolicies: 0,
    complianceStatus: 'compliant'
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showViolations, setShowViolations] = useState(false);
  const [showThreats, setShowThreats] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const monitoringRef = useRef<NodeJS.Timeout | null>(null);
  const threatDetectionRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== SECURITY POLICIES ====================
  const defaultPolicies: SecurityPolicy[] = [
    {
      id: 'policy-1',
      name: 'Permission Enforcement',
      description: 'Enforce strict permission checking for all app operations',
      rules: [
        {
          id: 'rule-1',
          type: 'permission',
          condition: 'user.permissions.includes(requiredPermission)',
          action: 'deny',
          severity: 'high',
          enabled: true
        }
      ],
      enabled: true,
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'policy-2',
      name: 'Resource Access Control',
      description: 'Control access to sensitive resources and data',
      rules: [
        {
          id: 'rule-2',
          type: 'resource',
          condition: 'resource.sensitivity === "high" && !user.hasAccess(resource)',
          action: 'deny',
          severity: 'critical',
          enabled: true
        }
      ],
      enabled: true,
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'policy-3',
      name: 'API Security',
      description: 'Secure API calls and prevent abuse',
      rules: [
        {
          id: 'rule-3',
          type: 'api',
          condition: 'api.rateLimit.exceeded || api.origin !== "trusted"',
          action: 'deny',
          severity: 'medium',
          enabled: true
        }
      ],
      enabled: true,
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // ==================== SECURITY VALIDATION ====================
  const validatePermissions = useCallback((requiredPermissions: ValidPermission[]): boolean => {
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const violation: SecurityViolation = {
        id: `violation-${Date.now()}`,
        timestamp: new Date(),
        type: 'permission_violation',
        severity: 'high',
        message: `User lacks required permissions: ${requiredPermissions.filter(p => !userPermissions.includes(p)).join(', ')}`,
        details: {
          required: requiredPermissions,
          actual: userPermissions,
          missing: requiredPermissions.filter(p => !userPermissions.includes(p))
        },
        user: userId,
        tenant: tenantId,
        resolved: false
      };

      setViolations(prev => [...prev, violation]);
      onSecurityViolation?.(violation);
      return false;
    }

    return true;
  }, [userPermissions, userId, tenantId, onSecurityViolation]);

  const validateManifestSecurity = useCallback((manifest: AppManifest): boolean => {
    const violations: SecurityViolation[] = [];

    // Check if app has excessive permissions
    if (manifest.permissions.length > 20) {
      violations.push({
        id: `violation-${Date.now()}-1`,
        timestamp: new Date(),
        type: 'permission_violation',
        severity: 'medium',
        message: 'App requests excessive permissions',
        details: {
          permissionCount: manifest.permissions.length,
          threshold: 20
        },
        user: userId,
        tenant: tenantId,
        resolved: false
      });
    }

    // Check if app is not sandboxed
    if (manifest.security?.sandboxed === false) {
      violations.push({
        id: `violation-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'resource_access',
        severity: 'high',
        message: 'App is not sandboxed',
        details: {
          sandboxed: false,
          risk: 'high'
        },
        user: userId,
        tenant: tenantId,
        resolved: false
      });
    }

    // Check for suspicious domains
    if (manifest.security?.allowedDomains) {
      const suspiciousDomains = manifest.security.allowedDomains.filter(domain =>
        !domain.includes('aibos.com') && !domain.includes('localhost')
      );

      if (suspiciousDomains.length > 0) {
        violations.push({
          id: `violation-${Date.now()}-3`,
          timestamp: new Date(),
          type: 'api_violation',
          severity: 'high',
          message: 'App requests access to suspicious domains',
          details: {
            suspiciousDomains,
            allowedDomains: manifest.security.allowedDomains
          },
          user: userId,
          tenant: tenantId,
          resolved: false
        });
      }
    }

    if (violations.length > 0) {
      setViolations(prev => [...prev, ...violations]);
      violations.forEach(violation => onSecurityViolation?.(violation));
      return false;
    }

    return true;
  }, [userId, tenantId, onSecurityViolation]);

  // ==================== THREAT DETECTION ====================
  const detectThreats = useCallback(() => {
    // Simulate threat detection
    const threatTypes: SecurityThreat['type'][] = [
      'malicious_request',
      'data_breach',
      'api_abuse',
      'privilege_escalation'
    ];

    // Randomly detect threats
    if (Math.random() < 0.05) { // 5% chance of threat detection
      const threat: SecurityThreat = {
        id: `threat-${Date.now()}`,
        timestamp: new Date(),
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium',
        source: `user-${Math.floor(Math.random() * 1000)}`,
        target: manifest.app_id,
        description: `Suspicious activity detected in ${manifest.app_id}`,
        indicators: ['unusual_pattern', 'high_frequency', 'privilege_escalation'],
        blocked: Math.random() > 0.5
      };

      setThreats(prev => [...prev, threat]);
      onThreatDetected?.(threat);
    }
  }, [manifest.app_id, onThreatDetected]);

  // ==================== POLICY ENFORCEMENT ====================
  const enforcePolicies = useCallback((action: string, context: Record<string, any>): boolean => {
    const activePolicies = policies.filter(policy => policy.enabled);

    for (const policy of activePolicies.sort((a, b) => b.priority - a.priority)) {
      for (const rule of policy.rules.filter(rule => rule.enabled)) {
        // Evaluate rule condition (simplified)
        const shouldBlock = Math.random() < 0.1; // 10% chance of blocking

        if (shouldBlock) {
          const violation: SecurityViolation = {
            id: `violation-${Date.now()}`,
            timestamp: new Date(),
            type: 'permission_violation',
            severity: rule.severity,
            message: `Policy violation: ${policy.name} - ${rule.condition}`,
            details: {
              policy: policy.name,
              rule: rule.condition,
              action,
              context
            },
            user: userId,
            tenant: tenantId,
            resolved: false
          };

          setViolations(prev => [...prev, violation]);
          onSecurityViolation?.(violation);

          if (rule.action === 'deny') {
            return false;
          }
        }
      }
    }

    return true;
  }, [policies, userId, tenantId, onSecurityViolation]);

  // ==================== MONITORING CONTROL ====================
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);

    if (enableRealTimeMonitoring) {
      monitoringRef.current = setInterval(() => {
        // Simulate real-time monitoring
        const allowed = Math.random() > 0.1; // 90% of requests allowed
        setMetrics(prev => ({
          ...prev,
          allowedRequests: prev.allowedRequests + (allowed ? 1 : 0),
          blockedRequests: prev.blockedRequests + (allowed ? 0 : 1),
          securityScore: Math.max(0, prev.securityScore - (allowed ? 0 : 1))
        }));
      }, 2000);
    }

    if (enableThreatDetection) {
      threatDetectionRef.current = setInterval(() => {
        detectThreats();
      }, 5000);
    }
  }, [enableRealTimeMonitoring, enableThreatDetection, detectThreats]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);

    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }

    if (threatDetectionRef.current) {
      clearInterval(threatDetectionRef.current);
      threatDetectionRef.current = null;
    }
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Initialize default policies
    setPolicies(defaultPolicies);
    setMetrics(prev => ({
      ...prev,
      activePolicies: defaultPolicies.filter(p => p.enabled).length
    }));

    // Validate manifest security
    validateManifestSecurity(manifest);

    // Start monitoring if enabled
    if (enableRealTimeMonitoring || enableThreatDetection) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [manifest, enableRealTimeMonitoring, enableThreatDetection, validateManifestSecurity, startMonitoring, stopMonitoring]);

  // ==================== RENDER ====================
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ==================== TOOLBAR ==================== */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Guard</h2>

          {/* Security Level Indicator */}
          <div className="flex items-center space-x-2">
            <Shield className={`w-5 h-5 ${
              securityLevel === 'critical' ? 'text-red-500' :
              securityLevel === 'high' ? 'text-orange-500' :
              securityLevel === 'medium' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
            <span className="text-sm font-medium capitalize">{securityLevel} security</span>
          </div>

          {/* Monitoring Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Security Score */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.securityScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Security Score</div>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowViolations(!showViolations)}
              className={`p-2 rounded ${showViolations ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowThreats(!showThreats)}
              className={`p-2 rounded ${showThreats ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPolicies(!showPolicies)}
              className={`p-2 rounded ${showPolicies ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Monitoring Controls */}
          <div className="flex items-center space-x-2">
            {isMonitoring ? (
              <button
                onClick={stopMonitoring}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex">
        {/* ==================== SECURITY OVERVIEW ==================== */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Violations Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {metrics.totalViolations}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Violations</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Threats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {metrics.totalThreats}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Threats</div>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Blocked Requests Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {metrics.blockedRequests}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Blocked</div>
                </div>
                <Lock className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Active Policies Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {metrics.activePolicies}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Policies</div>
                </div>
                <Settings className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Security Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Activity</h3>
            <div className="h-64 flex items-end justify-center space-x-2">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="w-4 bg-blue-500 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Violations</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {violations.slice(-5).map((violation) => (
                      <div key={violation.id} className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400">{violation.type}</div>
                        <div className="text-red-500 dark:text-red-300">{violation.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {violation.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Threats Panel */}
          <AnimatePresence>
            {showThreats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Threats</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {threats.slice(-5).map((threat) => (
                      <div key={threat.id} className="text-sm bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                        <div className="font-medium text-orange-600 dark:text-orange-400">{threat.type}</div>
                        <div className="text-orange-500 dark:text-orange-300">{threat.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {threat.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Policies Panel */}
          <AnimatePresence>
            {showPolicies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policies</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {policies.map((policy) => (
                      <div key={policy.id} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="font-medium text-blue-600 dark:text-blue-400">{policy.name}</div>
                        <div className="text-blue-500 dark:text-blue-300">{policy.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {policy.enabled ? 'Active' : 'Inactive'} • {policy.rules.length} rules
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

export default SecurityGuard;
