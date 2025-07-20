import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { auditLog } from '../../utils/auditLogger';

// Security policy types
export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean
}

export interface SecurityRule {
  type: 'encrypt' | 'sanitize' | 'validate' | 'audit' | 'block';
  target: 'hover' | 'click' | 'input' | 'clipboard' | 'navigation' | 'all';
  condition?: (data: any) => boolean;
  action: (data: any) => any;
  description: string
}

// Security event types
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'policy_violation' | 'encryption' | 'sanitization' | 'validation' | 'audit';
  component: string;
  userAction: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  reason?: string
}

// Zero-trust context
interface ZeroTrustContextType {
  policies: SecurityPolicy[];
  events: SecurityEvent[];
  addPolicy: (policy: SecurityPolicy) => void;
  removePolicy: (policyId: string) => void;
  validateAction: (action: string,
  data: any, component: string) => boolean;
  encryptData: (data: any) => string;
  sanitizeData: (data: any) => any;
  auditAction: (action: string,
  data: any, component: string) => void;
  getSecurityReport: () => SecurityReport
}

interface SecurityReport {
  totalEvents: number;
  blockedActions: number;
  policyViolations: number;
  encryptionCount: number;
  sanitizationCount: number;
  riskScore: number; // 0-100
}

const ZeroTrustContext = createContext<ZeroTrustContextType | undefined>(undefined);

// Default security policies
const defaultPolicies: SecurityPolicy[] = [
  {
    id: 'encrypt-hover-data',
  name: 'Encrypt Hover Tooltip Data',
    description: 'Encrypts all data displayed in hover tooltips',
  severity: 'high',
    enabled: true,
  rules: [
      {
        type: 'encrypt',
  target: 'hover',
        action: (data) => btoa(JSON.stringify(data)), // Base64 encoding
        description: 'Encrypt hover tooltip data'
      }
    ]
  },
  {
    id: 'sanitize-clipboard',
  name: 'Sanitize Clipboard Interactions',
    description: 'Sanitizes all clipboard operations',
  severity: 'critical',
    enabled: true,
  rules: [
      {
        type: 'sanitize',
  target: 'clipboard',
        action: (data) => {
          if (typeof data === 'string') {
            // Remove potentially dangerous content
            return data
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
}
          return data
},
        description: 'Sanitize clipboard data'
      }
    ]
  },
  {
    id: 'validate-input',
  name: 'Validate All Input Data',
    description: 'Validates and sanitizes all user input',
  severity: 'critical',
    enabled: true,
  rules: [
      {
        type: 'validate',
  target: 'input',
        condition: (data) => {
          if (typeof data === 'string') {
            // Check for SQL injection patterns
            const sqlPatterns = [
              /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
              /(\b(UNION|EXEC|EXECUTE)\b)/i,
              /(--|\/\*|\*\/)/,
              /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i
            ];
            return !sqlPatterns.some(pattern => pattern.test(data))
}
          return true
},
        action: (data) => {
          if (typeof data === 'string') {
            // HTML encode
            return data
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;')
}
          return data
},
        description: 'Validate and sanitize input data'
      }
    ]
  },
  {
    id: 'audit-all-actions',
  name: 'Audit All User Actions',
    description: 'Logs all user interactions for security analysis',
  severity: 'medium',
    enabled: true,
  rules: [
      {
        type: 'audit',
  target: 'all',
        action: (data) => data, // No modification, just audit
        description: 'Audit all user actions'
      }
    ]
  }
];

// Zero-trust provider component
export const ZeroTrustProvider: React.FC<{
  children: React.ReactNode;
  policies?: SecurityPolicy[];
  enableAuditTrail?: boolean;
  encryptionKey?: string
}> = ({
  children,
  policies = defaultPolicies,
  enableAuditTrail = true,
  encryptionKey = 'default-key'
}) => {
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>(policies);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [riskScore, setRiskScore] = useState(0);

  // Add a new security policy
  const addPolicy = useCallback((policy: SecurityPolicy) => {
    setSecurityPolicies(prev => [...prev, policy]);

    if (enableAuditTrail) {
      auditLog('security_policy_added', {
        policyId: policy.id,
        policyName: policy.name,
        severity: policy.severity,
        timestamp: new Date().toISOString()
      })
}
  }, [enableAuditTrail]);

  // Remove a security policy
  const removePolicy = useCallback((policyId: string) => {
    setSecurityPolicies(prev => prev.filter(p => p.id !== policyId));

    if (enableAuditTrail) {
      auditLog('security_policy_removed', {
        policyId,
        timestamp: new Date().toISOString()
      })
}
  }, [enableAuditTrail]);

  // Validate an action against security policies
  const validateAction = useCallback((action: string,
  data: any, component: string): boolean => {
    const applicablePolicies = securityPolicies.filter(policy =>
      policy.enabled && policy.rules.some(rule =>
        rule.target === action || rule.target === 'all'
      )
    );

    let isAllowed = true;
    const events: SecurityEvent[] = [];

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (rule.target === action || rule.target === 'all') {
          // Check condition if present
          if (rule.condition && !rule.condition(data)) {
            const event: SecurityEvent = {
              id: `${policy.id}-${Date.now()}`,
              timestamp: new Date(),
              type: 'policy_violation',
              component,
              userAction: action,
              data,
              severity: policy.severity,
              blocked: true,
  reason: `Policy violation: ${policy.name}`
            };
            events.push(event);
            isAllowed = false
}

          // Apply action
          if (rule.type === 'audit') {
            const event: SecurityEvent = {
              id: `${policy.id}-${Date.now()}`,
              timestamp: new Date(),
              type: 'audit',
              component,
              userAction: action,
              data,
              severity: policy.severity,
              blocked: false
            };
            events.push(event)
}
        }
      }
    }

    // Add events to the log
    if (events.length > 0) {
      setSecurityEvents(prev => [...prev, ...events]);

      if (enableAuditTrail) {
        events.forEach(event => {
          auditLog('security_event', {
            eventId: event.id,
            eventType: event.type,
            component,
            userAction: action,
  severity: event.severity,
            blocked: event.blocked,
            reason: event.reason,
            timestamp: event.timestamp.toISOString()
          })
})
}
    }

    return isAllowed
}, [securityPolicies, enableAuditTrail]);

  // Encrypt data
  const encryptData = useCallback((data: any): string => {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = btoa(jsonData); // Base64 encoding for demo

      if (enableAuditTrail) {
        auditLog('data_encrypted', {
          dataLength: jsonData.length,
          encryptedLength: encrypted.length,
          timestamp: new Date().toISOString()
        })
}

      return encrypted
} catch (error) {
      console.error('Encryption failed:', error);
      return ''
}
  }, [enableAuditTrail]);

  // Sanitize data
  const sanitizeData = useCallback((data: any): any => {
    if (typeof data === 'string') {
      const sanitized = data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      if (enableAuditTrail && sanitized !== data) {
        auditLog('data_sanitized', {
          originalLength: data.length,
          sanitizedLength: sanitized.length,
          timestamp: new Date().toISOString()
        })
}

      return sanitized
}
    return data
}, [enableAuditTrail]);

  // Audit an action
  const auditAction = useCallback((action: string,
  data: any, component: string) => {
    const event: SecurityEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      type: 'audit',
      component,
      userAction: action,
      data,
      severity: 'low',
  blocked: false
    };

    setSecurityEvents(prev => [...prev, event]);

    if (enableAuditTrail) {
      auditLog('action_audited', {
        eventId: event.id,
        component,
        userAction: action,
  timestamp: event.timestamp.toISOString()
      })
}
  }, [enableAuditTrail]);

  // Get security report
  const getSecurityReport = useCallback((): SecurityReport => {
    const totalEvents = securityEvents.length;
    const blockedActions = securityEvents.filter(e => e.blocked).length;
    const policyViolations = securityEvents.filter(e => e.type === 'policy_violation').length;
    const encryptionCount = securityEvents.filter(e => e.type === 'encryption').length;
    const sanitizationCount = securityEvents.filter(e => e.type === 'sanitization').length;

    // Calculate risk score based on events
    const riskScore = Math.min(100,
      (blockedActions * 10) +
      (policyViolations * 15) +
      (securityEvents.filter(e => e.severity === 'critical').length * 20)
    );

    return {
      totalEvents,
      blockedActions,
      policyViolations,
      encryptionCount,
      sanitizationCount,
      riskScore
    }
}, [securityEvents]);

  // Update risk score when events change
  useEffect(() => {
    const report = getSecurityReport();
    setRiskScore(report.riskScore)
}, [securityEvents, getSecurityReport]);

  const value: ZeroTrustContextType = {
    policies: securityPolicies,
  events: securityEvents,
    addPolicy,
    removePolicy,
    validateAction,
    encryptData,
    sanitizeData,
    auditAction,
    getSecurityReport
  };

  return (
    <ZeroTrustContext.Provider value={value}>
      {children}
    </ZeroTrustContext.Provider>
  )
};

// Hook to use zero-trust context
export const useZeroTrust = () => {
  const context = useContext(ZeroTrustContext);
  if (!context) {
    throw new Error('useZeroTrust must be used within ZeroTrustProvider')
}
  return context
};

// Zero-trust boundary component
export const ZeroTrustBoundary: React.FC<{
  children: React.ReactNode;
  policies?: SecurityPolicy[];
  componentName?: string
}> = ({ children, policies = [], componentName = 'Unknown' }) => {
  const { addPolicy, auditAction } = useZeroTrust();

  // Add component-specific policies
  useEffect(() => {
    policies.forEach(policy => {
      addPolicy(policy)
})
}, [policies, addPolicy]);

  // Audit component render
  useEffect(() => {
    auditAction('component_render', { componentName }, componentName)
}, [componentName, auditAction]);

  return <>{children}</>
};

// HOC to add zero-trust to any component
export const withZeroTrust = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName: string;
    policies?: SecurityPolicy[]
}
) => {
  const ZeroTrustComponent: React.FC<P> = (props) => {
    return (
      <ZeroTrustBoundary
        policies={options.policies}
        componentName={options.componentName}
      >
        <Component {...props} />
      </ZeroTrustBoundary>
    )
};

  ZeroTrustComponent.displayName = `withZeroTrust(${options.componentName})`;
  return ZeroTrustComponent
};

// Security dashboard component
export const SecurityDashboard: React.FC = () => {
  const { events, getSecurityReport } = useZeroTrust();
  const report = getSecurityReport();

  return (
    <div className="security-dashboard">
      <h3>Security Dashboard</h3>
      <div className="security-metrics">
        <div className="metric">
          <span className="label">Risk Score</span>
          <span className={`value ${report.riskScore > 50 ? 'high' : 'low'}`}>
            {report.riskScore}/100
          </span>
        </div>
        <div className="metric">
          <span className="label">Total Events</span>
          <span className="value">{report.totalEvents}</span>
        </div>
        <div className="metric">
          <span className="label">Blocked Actions</span>
          <span className="value">{report.blockedActions}</span>
        </div>
        <div className="metric">
          <span className="label">Policy Violations</span>
          <span className="value">{report.policyViolations}</span>
        </div>
      </div>

      <div className="recent-events">
        <h4>Recent Security Events</h4>
        <div className="events-list">
          {events.slice(-10).reverse().map(event => (
            <div key={event.id} className={`event ${event.severity}`}>
              <span className="timestamp">
                {event.timestamp.toLocaleTimeString()}
              </span>
              <span className="type">{event.type}</span>
              <span className="component">{event.component}</span>
              <span className="action">{event.userAction}</span>
              {event.blocked && <span className="blocked">BLOCKED</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};
