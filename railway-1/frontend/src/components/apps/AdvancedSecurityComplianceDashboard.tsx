'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Activity,
  Key,
  FileText,
  Clipboard,
  RotateCcw,
  Plus,
  Trash2,
  Play,
  Sparkles,
} from 'lucide-react';

// ==================== ADVANCED SECURITY & COMPLIANCE ====================
import {
  advancedSecurityCompliance,
  ThreatLevel,
  ComplianceStandard,
  SecurityEventType,
  EncryptionAlgorithm,
  SecurityThreat,
  ComplianceRequirement,
  SecurityEvent,
  EncryptionKey,
  AuditTrail,
  SecurityMetrics
} from '@/lib/advanced-security-compliance';

// ==================== TYPES ====================

interface AdvancedSecurityComplianceDashboardProps {
  className?: string;
}

interface SecurityEventForm {
  type: SecurityEventType;
  userId: string;
  resource: string;
  action: string;
  ipAddress: string;
  userAgent: string;
}

interface ComplianceCheckForm {
  standard: ComplianceStandard;
  context: string;
}

interface EncryptionForm {
  algorithm: EncryptionAlgorithm;
  purpose: string;
  keySize: number;
  data: string;
}

// ==================== ADVANCED SECURITY & COMPLIANCE DASHBOARD ====================

export default function AdvancedSecurityComplianceDashboard({ className = '' }: AdvancedSecurityComplianceDashboardProps) {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceRequirements, setComplianceRequirements] = useState<ComplianceRequirement[]>([]);
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'threats' | 'compliance' | 'encryption' | 'audit' | 'events'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  // Forms
  const [securityEventForm, setSecurityEventForm] = useState<SecurityEventForm>({
    type: 'authentication',
    userId: '',
    resource: '',
    action: '',
    ipAddress: '',
    userAgent: ''
  });

  const [complianceCheckForm, setComplianceCheckForm] = useState<ComplianceCheckForm>({
    standard: 'GDPR',
    context: ''
  });

  const [encryptionForm, setEncryptionForm] = useState<EncryptionForm>({
    algorithm: 'AES-256',
    purpose: '',
    keySize: 256,
    data: ''
  });

  // ==================== EFFECTS ====================

  useEffect(() => {
    initializeSecurityData();
    const interval = setInterval(() => {
      if (autoRefresh) {
        refreshSecurityData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // ==================== INITIALIZATION ====================

  const initializeSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const metrics = await advancedSecurityCompliance.getSecurityMetrics();
      setSecurityMetrics(metrics);

      // Initialize other data
      await refreshSecurityData();
    } catch (error) {
      console.error('Failed to initialize security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSecurityData = useCallback(async () => {
    try {
      const metrics = await advancedSecurityCompliance.getSecurityMetrics();
      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Failed to refresh security data:', error);
    }
  }, []);

  // ==================== SECURITY EVENT LOGGING ====================

  const logSecurityEvent = useCallback(async () => {
    if (!securityEventForm.userId || !securityEventForm.resource || !securityEventForm.action) {
      return;
    }

    setIsLoading(true);
    try {
      const event: SecurityEvent = {
        id: `event-${Date.now()}`,
        type: securityEventForm.type,
        userId: securityEventForm.userId,
        sessionId: `session-${Date.now()}`,
        resource: securityEventForm.resource,
        action: securityEventForm.action,
        result: 'success',
        ipAddress: securityEventForm.ipAddress,
        userAgent: securityEventForm.userAgent,
        timestamp: new Date(),
        metadata: {},
        threatScore: 0,
        complianceImpact: []
      };

      await advancedSecurityCompliance.logSecurityEvent(event);

      // Reset form
      setSecurityEventForm({
        type: 'authentication',
        userId: '',
        resource: '',
        action: '',
        ipAddress: '',
        userAgent: ''
      });

      await refreshSecurityData();
    } catch (error) {
      console.error('Failed to log security event:', error);
    } finally {
      setIsLoading(false);
    }
  }, [securityEventForm, refreshSecurityData]);

  // ==================== COMPLIANCE CHECKING ====================

  const checkCompliance = useCallback(async () => {
    setIsLoading(true);
    try {
      const requirements = await advancedSecurityCompliance.checkCompliance(
        complianceCheckForm.standard,
        { context: complianceCheckForm.context }
      );

      setComplianceRequirements(requirements);
      await refreshSecurityData();
    } catch (error) {
      console.error('Failed to check compliance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [complianceCheckForm, refreshSecurityData]);

  const generateComplianceReport = useCallback(async (standard: ComplianceStandard) => {
    setIsLoading(true);
    try {
      const report = await advancedSecurityCompliance.generateComplianceReport(standard, 'json');
      console.log('Compliance Report:', report);

      // In a real application, you might download or display this report
      alert(`Compliance report generated for ${standard}. Check console for details.`);
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== ENCRYPTION MANAGEMENT ====================

  const generateEncryptionKey = useCallback(async () => {
    if (!encryptionForm.purpose) return;

    setIsLoading(true);
    try {
      const key = await advancedSecurityCompliance.generateEncryptionKey(
        encryptionForm.algorithm,
        encryptionForm.purpose,
        encryptionForm.keySize
      );

      console.log('Generated encryption key:', key);
      alert(`Encryption key generated: ${key.id}`);

      await refreshSecurityData();
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encryptionForm, refreshSecurityData]);

  const encryptData = useCallback(async () => {
    if (!encryptionForm.data || !encryptionForm.purpose) return;

    setIsLoading(true);
    try {
      // First generate a key
      const key = await advancedSecurityCompliance.generateEncryptionKey(
        encryptionForm.algorithm,
        encryptionForm.purpose,
        encryptionForm.keySize
      );

      // Then encrypt the data
      const result = await advancedSecurityCompliance.encryptData(
        { data: encryptionForm.data },
        key.id,
        { purpose: encryptionForm.purpose }
      );

      console.log('Encryption result:', result);
      alert(`Data encrypted successfully. Key ID: ${key.id}`);

      await refreshSecurityData();
    } catch (error) {
      console.error('Failed to encrypt data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encryptionForm, refreshSecurityData]);

  // ==================== RENDER FUNCTIONS ====================

  const renderOverview = () => {
    if (!securityMetrics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Security Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Total Threats</p>
                <p className="text-2xl font-bold text-red-100">{securityMetrics.totalThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Compliance Score</p>
                <p className="text-2xl font-bold text-green-100">{securityMetrics.complianceScore}%</p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Security Events</p>
                <p className="text-2xl font-bold text-blue-100">{securityMetrics.securityEvents}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Encryption Keys</p>
                <p className="text-2xl font-bold text-purple-100">{securityMetrics.encryptionKeys}</p>
              </div>
              <Key className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Threat Levels Breakdown */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Threat Levels
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(securityMetrics.threatsByLevel).map(([level, count]) => (
              <div key={level} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  level === 'critical' ? 'bg-red-500/20' :
                  level === 'high' ? 'bg-orange-500/20' :
                  level === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                }`}>
                  <span className={`text-lg font-bold ${
                    level === 'critical' ? 'text-red-300' :
                    level === 'high' ? 'text-orange-300' :
                    level === 'medium' ? 'text-yellow-300' : 'text-green-300'
                  }`}>
                    {count}
                  </span>
                </div>
                <p className="text-sm text-gray-400 capitalize">{level}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            Compliance Standards
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(securityMetrics.complianceByStandard).map(([standard, score]) => (
              <div key={standard} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-white font-medium">{standard}</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${
                        score >= 90 ? 'bg-green-500' :
                        score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSecurityEventForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 mb-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-400" />
        Log Security Event
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Type
          </label>
          <select
            value={securityEventForm.type}
            onChange={(e) => setSecurityEventForm(prev => ({
              ...prev,
              type: e.target.value as SecurityEventType
            }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="system_change">System Change</option>
            <option value="threat_detected">Threat Detected</option>
            <option value="compliance_violation">Compliance Violation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User ID
          </label>
          <input
            type="text"
            value={securityEventForm.userId}
            onChange={(e) => setSecurityEventForm(prev => ({
              ...prev,
              userId: e.target.value
            }))}
            placeholder="user@example.com"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resource
          </label>
          <input
            type="text"
            value={securityEventForm.resource}
            onChange={(e) => setSecurityEventForm(prev => ({
              ...prev,
              resource: e.target.value
            }))}
            placeholder="/api/data"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Action
          </label>
          <input
            type="text"
            value={securityEventForm.action}
            onChange={(e) => setSecurityEventForm(prev => ({
              ...prev,
              action: e.target.value
            }))}
            placeholder="GET, POST, DELETE"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            IP Address
          </label>
          <input
            type="text"
            value={securityEventForm.ipAddress}
            onChange={(e) => setSecurityEventForm(prev => ({
              ...prev,
              ipAddress: e.target.value
            }))}
            placeholder="192.168.1.1"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User Agent
          </label>
          <input
            type="text"
            value={securityEventForm.userAgent}
            onChange={(e) => setSecurityEventForm(prev => ({
              ...prev,
              userAgent: e.target.value
            }))}
            placeholder="Mozilla/5.0..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={logSecurityEvent}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Logging...
          </>
        ) : (
          <>
            <Activity className="w-4 h-4 mr-2" />
            Log Security Event
          </>
        )}
      </button>
    </motion.div>
  );

  const renderComplianceSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Compliance Check Form */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Compliance Check
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compliance Standard
            </label>
            <select
              value={complianceCheckForm.standard}
              onChange={(e) => setComplianceCheckForm(prev => ({
                ...prev,
                standard: e.target.value as ComplianceStandard
              }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="GDPR">GDPR</option>
              <option value="SOC2">SOC2</option>
              <option value="ISO27001">ISO27001</option>
              <option value="HIPAA">HIPAA</option>
              <option value="PCI-DSS">PCI-DSS</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Context
            </label>
            <input
              type="text"
              value={complianceCheckForm.context}
              onChange={(e) => setComplianceCheckForm(prev => ({
                ...prev,
                context: e.target.value
              }))}
              placeholder="Additional context for compliance check"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={checkCompliance}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Check Compliance
              </>
            )}
          </button>

          <button
            onClick={() => generateComplianceReport(complianceCheckForm.standard)}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Compliance Requirements */}
      {complianceRequirements.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clipboard className="w-5 h-5 mr-2 text-blue-400" />
            Compliance Requirements
          </h3>

          <div className="space-y-3">
            {complianceRequirements.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-lg border ${
                  req.status === 'compliant'
                    ? 'bg-green-900/20 border-green-500/30'
                    : req.status === 'non_compliant'
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-yellow-900/20 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {req.status === 'compliant' ? (
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    ) : req.status === 'non_compliant' ? (
                      <XCircle className="w-4 h-4 text-red-400 mr-2" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                    )}
                    <span className="text-white font-medium">{req.requirement}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.status === 'compliant'
                      ? 'bg-green-900/50 text-green-300'
                      : req.status === 'non_compliant'
                      ? 'bg-red-900/50 text-red-300'
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{req.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Priority: {req.priority} • Category: {req.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Last check: {req.lastCheck.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderEncryptionSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Encryption Form */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2 text-purple-400" />
          Encryption Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Algorithm
            </label>
            <select
              value={encryptionForm.algorithm}
              onChange={(e) => setEncryptionForm(prev => ({
                ...prev,
                algorithm: e.target.value as EncryptionAlgorithm
              }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="AES-256">AES-256</option>
              <option value="RSA-4096">RSA-4096</option>
              <option value="ChaCha20">ChaCha20</option>
              <option value="Quantum-Resistant">Quantum-Resistant</option>
              <option value="Multi-Layer">Multi-Layer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Purpose
            </label>
            <input
              type="text"
              value={encryptionForm.purpose}
              onChange={(e) => setEncryptionForm(prev => ({
                ...prev,
                purpose: e.target.value
              }))}
              placeholder="Data encryption purpose"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Size
            </label>
            <input
              type="number"
              value={encryptionForm.keySize}
              onChange={(e) => setEncryptionForm(prev => ({
                ...prev,
                keySize: parseInt(e.target.value)
              }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data to Encrypt
            </label>
            <textarea
              value={encryptionForm.data}
              onChange={(e) => setEncryptionForm(prev => ({
                ...prev,
                data: e.target.value
              }))}
              placeholder="Enter data to encrypt"
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateEncryptionKey}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Generate Key
              </>
            )}
          </button>

          <button
            onClick={encryptData}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            <Lock className="w-4 h-4 mr-2" />
            Encrypt Data
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Shield className="w-8 h-8 mr-3 text-green-400" />
                Advanced Security & Compliance Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Enterprise-grade security management and compliance automation
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800"
                />
                <span className="text-sm text-gray-300">Auto Refresh</span>
              </div>

              <button
                onClick={refreshSecurityData}
                className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1 border border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'threats', label: 'Threats', icon: AlertTriangle },
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'encryption', label: 'Encryption', icon: Key },
              { id: 'audit', label: 'Audit Trail', icon: FileText },
              { id: 'events', label: 'Events', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'threats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Threat Management</h3>
              <p className="text-gray-400">AI-powered threat detection and response system</p>
            </motion.div>
          )}
          {selectedTab === 'compliance' && renderComplianceSection()}
          {selectedTab === 'encryption' && renderEncryptionSection()}
          {selectedTab === 'audit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Audit Trail</h3>
              <p className="text-gray-400">Comprehensive audit trail and forensics</p>
            </motion.div>
          )}
          {selectedTab === 'events' && renderSecurityEventForm()}
        </AnimatePresence>
      </div>
    </div>
  );
}
