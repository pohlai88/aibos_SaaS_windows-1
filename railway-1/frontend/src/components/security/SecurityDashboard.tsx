'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Lock, Unlock, Eye, EyeOff,
  Zap, Users, Settings, Activity, ShieldCheck, AlertCircle, TrendingUp,
  Database, Network, Key, Fingerprint, Clock, RefreshCw, Loader2
} from 'lucide-react';
import { useAIBOSStore } from '@/lib/store';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

// ==================== TYPES ====================

interface SecurityMetrics {
  securityScore: number;
  totalViolations: number;
  totalThreats: number;
  blockedRequests: number;
  allowedRequests: number;
  activePolicies: number;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  lastIncident: Date | null;
  mfaEnabled: boolean;
  sessionCount: number;
  apiCallsToday: number;
}

interface SecurityViolation {
  id: string;
  timestamp: Date;
  type: 'permission_violation' | 'resource_access' | 'api_violation' | 'data_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user: string;
  resolved: boolean;
}

interface SecurityThreat {
  id: string;
  timestamp: Date;
  type: 'malicious_request' | 'data_breach' | 'api_abuse' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  blocked: boolean;
}

interface ComplianceFramework {
  name: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  lastAudit: Date;
  nextAudit: Date;
  score: number;
}

// ==================== SECURITY DASHBOARD ====================

export const SecurityDashboard: React.FC = () => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('security');
  const isModuleEnabled = useModuleEnabled('security');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('security', 'view', currentUser);
  const canMonitor = usePermission('security', 'monitor', currentUser);
  const canConfigure = usePermission('security', 'configure', currentUser);
  const canAudit = usePermission('security', 'audit', currentUser);
  const canThreatDetection = usePermission('security', 'threat_detection', currentUser);
  const canIncidentResponse = usePermission('security', 'incident_response', currentUser);
  const canCompliance = usePermission('security', 'compliance', currentUser);
  const canVulnerabilityScan = usePermission('security', 'vulnerability_scan', currentUser);
  const canAccessControl = usePermission('security', 'access_control', currentUser);
  const canEncryption = usePermission('security', 'encryption', currentUser);
  const canFirewall = usePermission('security', 'firewall', currentUser);
  const canBackup = usePermission('security', 'backup', currentUser);
  const canRecovery = usePermission('security', 'recovery', currentUser);

  // Get configuration from manifest
  const refreshInterval = moduleConfig.refreshInterval || 15000;
  const maxAlerts = moduleConfig.maxAlerts || 100;
  const threatLevels = moduleConfig.threatLevels || ['low', 'medium', 'high', 'critical'];
  const securityCategories = moduleConfig.securityCategories || ['authentication', 'authorization', 'data', 'network', 'application', 'infrastructure'];
  const alertStatuses = moduleConfig.alertStatuses || ['new', 'investigating', 'resolved', 'false_positive'];
  const features = moduleConfig.features || {};
  const uiConfig = moduleConfig.ui || {};
  const performanceConfig = moduleConfig.performance || {};
  const securityConfig = moduleConfig.security || {};
  const monitoringConfig = moduleConfig.monitoring || {};

  // ==================== COMPONENT STATE ====================
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'compliance' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAIBOSStore();

  // ==================== REAL DATA STATE ====================
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);

  // ==================== DATA FETCHING ====================
  const fetchSecurityData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use manifest-driven API endpoints with permissions and configuration
      const metricsResponse = await fetch(`/api/security/metrics?maxAlerts=${maxAlerts}&refreshInterval=${refreshInterval}`);
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData.data);
        }

        // Fetch security violations with manifest-driven filtering
        const violationsResponse = await fetch(`/api/security/violations?maxAlerts=${maxAlerts}&categories=${securityCategories.join(',')}`);
        if (violationsResponse.ok) {
          const violationsData = await violationsResponse.json();
          setViolations(violationsData.data);
        }

        // Fetch security threats with manifest-driven filtering
        const threatsResponse = await fetch(`/api/security/threats?maxAlerts=${maxAlerts}&threatLevels=${threatLevels.join(',')}`);
        if (threatsResponse.ok) {
          const threatsData = await threatsResponse.json();
          setThreats(threatsData.data);
        }

        // Fetch compliance frameworks with manifest-driven configuration
        const complianceResponse = await fetch(`/api/security/compliance?logRetention=${monitoringConfig.logRetention || 90}`);
        if (complianceResponse.ok) {
          const complianceData = await complianceResponse.json();
          setComplianceFrameworks(Object.keys(complianceData.data.status).map(key => ({
            name: key.toUpperCase(),
            status: complianceData.data.status[key].compliant ? 'compliant' : 'non_compliant',
            score: complianceData.data.status[key].score || 0,
            lastAudit: complianceData.data.status[key].lastAudit || new Date(),
            nextAudit: complianceData.data.status[key].nextAudit || new Date(),
            severity: 'medium'
          })));
        }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security data');
      addNotification({
        type: 'error',
        title: 'Security Data Error',
        message: 'Unable to load security metrics and data.',
        isRead: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchSecurityData();
    setIsRefreshing(false);
    addNotification({
      type: 'success',
      title: 'Security Dashboard Updated',
      message: 'Latest security metrics have been refreshed.',
      isRead: false
    });
  }, [fetchSecurityData, addNotification]);

  const handleResolveViolation = useCallback(async (violationId: string) => {
    if (!canIncidentResponse) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to resolve security violations.',
        isRead: false
      });
      return;
    }

    try {
      // Resolve violation through our AI-governed database with manifest-driven permissions
      const response = await fetch(`/api/security/violations/${violationId}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution: 'Resolved by user', notes: 'Manual resolution' })
        });

        if (response.ok) {
          setViolations(prev =>
            prev.map(v => v.id === violationId ? { ...v, resolved: true } : v)
          );
          addNotification({
            type: 'success',
            title: 'Violation Resolved',
            message: 'Security violation has been resolved successfully.',
            isRead: false
          });
        } else {
          throw new Error('Failed to resolve violation');
        }
      addNotification({
        type: 'success',
        title: 'Violation Resolved',
        message: 'Security violation has been marked as resolved.',
        isRead: false
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Resolution Failed',
        message: 'Failed to resolve security violation.',
        isRead: false
      });
    }
  }, [addNotification]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  // Manifest-driven auto-refresh
  useEffect(() => {
    if (!features.realTimeMonitoring) return;

    const interval = setInterval(() => {
      fetchSecurityData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchSecurityData, refreshInterval, features.realTimeMonitoring]);

  // ==================== UTILITY FUNCTIONS ====================
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'non_compliant': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // ==================== EMPTY STATES ====================
  const EmptyState: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void; }
  }> = ({ icon: Icon, title, description, action }) => (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading security data...</p>
    </div>
  );

  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading Manifestor...</p>
        </div>
      </div>
    );
  }

  if (manifestError) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manifestor Error</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{manifestError}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isModuleEnabled) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Security Module Disabled</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The Security module is currently disabled. Please contact your administrator to enable this feature.</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Admin
          </button>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have permission to view the Security Dashboard. Please contact your administrator for access.</p>
          <button
            onClick={() => window.location.href = '/support'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Access
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Security Dashboard</h1>
              <p className="text-blue-100">Manifest-driven enterprise security monitoring</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                {features.realTimeMonitoring && (
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Live Monitoring
                  </span>
                )}
                {features.threatDetection && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Threat Detection
                  </span>
                )}
                {features.complianceReporting && (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Compliance
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  v{moduleConfig.version || '1.0.0'}
                </span>
              </div>
            </div>
          </div>
          {canMonitor && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity, permission: canView },
            { id: 'threats', label: 'Threats & Violations', icon: AlertTriangle, permission: canThreatDetection },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck, permission: canCompliance },
            { id: 'settings', label: 'Settings', icon: Settings, permission: canConfigure }
          ].filter(tab => tab.permission).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-[calc(100%-200px)]">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSecurityData} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {!metrics ? (
                  <EmptyState
                    icon={Shield}
                    title="No Security Data Available"
                    description="Security metrics and monitoring data will appear here once configured."
                    action={{
                      label: 'Configure Security',
                      onClick: () => setActiveTab('settings')
                    }}
                  />
                ) : (
                  <>
                    {/* Security Score */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Score</h3>
                          <p className="text-gray-600 dark:text-gray-400">Overall platform security rating</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">{metrics.securityScore}</div>
                          <div className="text-sm text-gray-500">out of 100</div>
                        </div>
                      </div>
                      <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${metrics.securityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Active Sessions', value: metrics.sessionCount, icon: Users, color: 'blue' },
                        { label: 'API Calls Today', value: metrics.apiCallsToday.toLocaleString(), icon: Zap, color: 'purple' },
                        { label: 'Blocked Requests', value: metrics.blockedRequests, icon: XCircle, color: 'red' },
                        { label: 'Active Policies', value: metrics.activePolicies, icon: Shield, color: 'green' }
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                            </div>
                            <Icon className={`w-8 h-8 text-${color}-500`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Security Events</h3>
                      </div>
                      <div className="p-4">
                        {violations.length === 0 ? (
                          <EmptyState
                            icon={CheckCircle}
                            title="No Recent Violations"
                            description="No security violations have been detected recently."
                          />
                        ) : (
                          violations.slice(0, 3).map((violation) => (
                            <div key={violation.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  violation.severity === 'critical' ? 'bg-red-500' :
                                  violation.severity === 'high' ? 'bg-orange-500' :
                                  violation.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{violation.message}</p>
                                  <p className="text-xs text-gray-500">{violation.user} • {violation.timestamp.toLocaleString()}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                                {violation.severity}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'threats' && (
              <motion.div
                key="threats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Threats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Threats</h3>
                  </div>
                  <div className="p-4">
                    {threats.length === 0 ? (
                      <EmptyState
                        icon={ShieldCheck}
                        title="No Active Threats"
                        description="No security threats are currently detected on the platform."
                      />
                    ) : (
                      threats.map((threat) => (
                        <div key={threat.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className={`w-5 h-5 ${
                              threat.severity === 'critical' ? 'text-red-500' :
                              threat.severity === 'high' ? 'text-orange-500' :
                              threat.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{threat.description}</p>
                              <p className="text-xs text-gray-500">Source: {threat.source} • {threat.timestamp.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                              {threat.severity}
                            </span>
                            {threat.blocked && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Blocked
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Violations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Violations</h3>
                  </div>
                  <div className="p-4">
                    {violations.length === 0 ? (
                      <EmptyState
                        icon={CheckCircle}
                        title="No Violations"
                        description="No security violations have been recorded."
                      />
                    ) : (
                      violations.map((violation) => (
                        <div key={violation.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              violation.severity === 'critical' ? 'bg-red-500' :
                              violation.severity === 'high' ? 'bg-orange-500' :
                              violation.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{violation.message}</p>
                              <p className="text-xs text-gray-500">{violation.user} • {violation.timestamp.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                              {violation.severity}
                            </span>
                            {!violation.resolved && (
                              <button
                                onClick={() => handleResolveViolation(violation.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                Resolve
                              </button>
                            )}
                            {violation.resolved && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'compliance' && (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {complianceFrameworks.length === 0 ? (
                  <EmptyState
                    icon={ShieldCheck}
                    title="No Compliance Frameworks"
                    description="Compliance frameworks and audit data will appear here once configured."
                    action={{
                      label: 'Configure Compliance',
                      onClick: () => setActiveTab('settings')
                    }}
                  />
                ) : (
                  complianceFrameworks.map((framework) => (
                    <div key={framework.name} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{framework.name}</h3>
                          <p className="text-sm text-gray-500">Compliance Framework</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(framework.status)}`}>
                          {framework.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{framework.score}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Audit</p>
                          <p className="text-sm text-gray-900 dark:text-white">{framework.lastAudit.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Audit</p>
                          <p className="text-sm text-gray-900 dark:text-white">{framework.nextAudit.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            framework.score >= 90 ? 'bg-green-500' :
                            framework.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${framework.score}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Multi-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Require 2FA for all users</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          metrics?.mfaEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {metrics?.mfaEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                        <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">API Rate Limiting</p>
                        <p className="text-sm text-gray-500">Limit API requests per minute</p>
                      </div>
                      <input
                        type="number"
                        defaultValue="100"
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-20"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
