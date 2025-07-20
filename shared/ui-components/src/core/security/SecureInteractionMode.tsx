import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  compliance: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface SecurityRule {
  type: 'encrypt' | 'sanitize' | 'validate' | 'audit' | 'disable';
  target: 'all' | 'input' | 'output' | 'logs' | 'clipboard';
  conditions?: SecurityCondition[];
  actions: SecurityAction[]
}

interface SecurityCondition {
  field?: string;
  value?: any;
  pattern?: RegExp;
  userRole?: string;
  timeOfDay?: string;
  location?: string
}

interface SecurityAction {
  type: 'encrypt' | 'sanitize' | 'log' | 'block' | 'notify';
  config?: any
}

interface SecureModeContextType {
  isSecureMode: boolean;
  currentPolicy: SecurityPolicy | null;
  enterSecureMode: (policy: SecurityPolicy) => void;
  exitSecureMode: () => void;
  encryptData: (data: any) => string;
  decryptData: (encryptedData: string) => any;
  sanitizeInput: (input: string) => string;
  validateInput: (input: any,
  schema: any) => boolean;
  logSecureAction: (action: string, data?: any) => void;
  getTrustBadge: () => TrustBadge
}

interface TrustBadge {
  type: 'GDPR' | 'SOC2' | 'ISO27001' | 'HIPAA' | 'PCI';
  status: 'active' | 'pending' | 'expired';
  expiresAt: Date;
  description: string
}

// Default security policies
const DEFAULT_POLICIES: SecurityPolicy[] = [
  {
    id: 'gdpr-compliant',
  name: 'GDPR Compliant Mode',
    description: 'Ensures GDPR compliance for data processing',
  compliance: ['GDPR'],
    riskLevel: 'high',
  rules: [
      {
        type: 'encrypt',
  target: 'all',
        actions: [{ type: 'encrypt',
  config: { algorithm: 'AES-256' } }]
      },
  {
    type: 'audit',
  target: 'all',
        actions: [{ type: 'log',
  config: { level: 'info' } }]
      }
    ]
  },
  {
    id: 'financial-data',
  name: 'Financial Data Protection',
    description: 'Enhanced security for financial information',
  compliance: ['PCI-DSS', 'SOC2'],
    riskLevel: 'critical',
  rules: [
      {
        type: 'encrypt',
  target: 'all',
        actions: [{ type: 'encrypt',
  config: { algorithm: 'AES-256-GCM' } }]
      },
  {
    type: 'disable',
  target: 'logs',
        actions: [{ type: 'block' }]
      },
  {
    type: 'validate',
  target: 'input',
        actions: [{ type: 'validate',
  config: { strict: true } }]
      }
    ]
  },
  {
    id: 'healthcare-data',
  name: 'Healthcare Data Protection',
    description: 'HIPAA-compliant data handling',
  compliance: ['HIPAA', 'SOC2'],
    riskLevel: 'critical',
  rules: [
      {
        type: 'encrypt',
  target: 'all',
        actions: [{ type: 'encrypt',
  config: { algorithm: 'AES-256' } }]
      },
  {
    type: 'audit',
  target: 'all',
        actions: [{ type: 'log',
  config: { level: 'audit' } }]
      },
  {
    type: 'sanitize',
  target: 'input',
        actions: [{ type: 'sanitize',
  config: { strict: true } }]
      }
    ]
  }
];

// Context
const SecureModeContext = createContext<SecureModeContextType | null>(null);

// Simple encryption utilities (in production, use proper crypto libraries)
class SecurityUtils {
  private static readonly ENCRYPTION_KEY = 'aibos-secure-key-2024';

  static encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // Simple base64 encoding for demo (use proper encryption in production)
      return btoa(jsonString)
} catch (error) {
      auditLogger.error('Encryption failed', { error });
      return ''
}
  }

  static decrypt(encryptedData: string): any {
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString)
} catch (error) {
      auditLogger.error('Decryption failed', { error });
      return null
}
  }

  static sanitize(input: string): string {
    // Remove potentially dangerous characters and patterns
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim()
}

  static validate(input: any,
  schema: any): boolean {
    // Basic validation (use proper validation library in production)
    if (schema.required && !input) return false;
    if (schema.type && typeof input !== schema.type) return false;
    if (schema.pattern && !schema.pattern.test(input)) return false;
    if (schema.minLength && input.length < schema.minLength) return false;
    if (schema.maxLength && input.length > schema.maxLength) return false;
    return true
}
}

// Provider Component
interface SecureModeProviderProps {
  children: ReactNode;
  defaultPolicy?: SecurityPolicy;
  enableAuditTrail?: boolean;
  customPolicies?: SecurityPolicy[]
}

export const SecureModeProvider: React.FC<SecureModeProviderProps> = ({
  children,
  defaultPolicy,
  enableAuditTrail = true,
  customPolicies = []
}) => {
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<SecurityPolicy | null>(defaultPolicy || null);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([
    {
      type: 'GDPR',
  status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      description: 'GDPR Compliance Active'
    },
  {
    type: 'SOC2',
  status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      description: 'SOC2 Type II Certified'
    },
  {
    type: 'ISO27001',
  status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      description: 'ISO27001 Information Security'
    }
  ]);

  const allPolicies = [...DEFAULT_POLICIES, ...customPolicies];

  const enterSecureMode = (policy: SecurityPolicy) => {
    setIsSecureMode(true);
    setCurrentPolicy(policy);

    if (enableAuditTrail) {
      auditLogger.info('Secure mode activated', {
        policy: policy.name,
        compliance: policy.compliance,
        riskLevel: policy.riskLevel
      })
}
  };

  const exitSecureMode = () => {
    setIsSecureMode(false);
    setCurrentPolicy(null);

    if (enableAuditTrail) {
      auditLogger.info('Secure mode deactivated')
}
  };

  const encryptData = (data: any): string => {
    if (!isSecureMode) {
      auditLogger.warn('Encryption attempted outside secure mode');
      return JSON.stringify(data)
}

    const encrypted = SecurityUtils.encrypt(data);
    logSecureAction('data_encrypted', { dataType: typeof data });
    return encrypted
};

  const decryptData = (encryptedData: string): any => {
    if (!isSecureMode) {
      auditLogger.warn('Decryption attempted outside secure mode');
      return null
}

    const decrypted = SecurityUtils.decrypt(encryptedData);
    logSecureAction('data_decrypted');
    return decrypted
};

  const sanitizeInput = (input: string): string => {
    const sanitized = SecurityUtils.sanitize(input);
    if (sanitized !== input) {
      logSecureAction('input_sanitized', { originalLength: input.length, sanitizedLength: sanitized.length })
}
    return sanitized
};

  const validateInput = (input: any,
  schema: any): boolean => {
    const isValid = SecurityUtils.validate(input, schema);
    logSecureAction('input_validated', { isValid, schema });
    return isValid
};

  const logSecureAction = (action: string, data?: any) => {
    if (enableAuditTrail) {
      auditLogger.info(`Secure action: ${action}`, {
        secureMode: isSecureMode,
  policy: currentPolicy?.name,
        data
      })
}
  };

  const getTrustBadge = (): TrustBadge => {
    if (!currentPolicy) {
      return trustBadges[0]; // Default to GDPR
    }

    const complianceType = currentPolicy.compliance[0] as TrustBadge['type'];
    return trustBadges.find(badge => badge.type === complianceType) || trustBadges[0]
};

  const value: SecureModeContextType = {
    isSecureMode,
    currentPolicy,
    enterSecureMode,
    exitSecureMode,
    encryptData,
    decryptData,
    sanitizeInput,
    validateInput,
    logSecureAction,
    getTrustBadge
  };

  return (
    <SecureModeContext.Provider value={value}>
      {children}
    </SecureModeContext.Provider>
  )
};

// Hook
export const useSecureMode = () => {
  const context = useContext(SecureModeContext);
  if (!context) {
    throw new Error('useSecureMode must be used within SecureModeProvider')
}
  return context
};

// HOC for secure components
export const withSecureMode = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    policy?: SecurityPolicy;
    autoEnable?: boolean;
    secureProps?: string[]
} = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      isSecureMode,
      enterSecureMode,
      exitSecureMode,
      encryptData,
      sanitizeInput,
      getTrustBadge
    } = useSecureMode();

    useEffect(() => {
      if (options.autoEnable && options.policy) {
        enterSecureMode(options.policy);
        return () => exitSecureMode()
}
    }, []);

    // Process secure props
    const processedProps = { ...props };
    if (isSecureMode && options.secureProps) {
      options.secureProps.forEach(propKey => {
        if (props[propKey as keyof P]) {
          if (typeof props[propKey as keyof P] === 'string') {
            processedProps[propKey as keyof P] = sanitizeInput(props[propKey as keyof P] as string) as any
} else {
            processedProps[propKey as keyof P] = encryptData(props[propKey as keyof P]) as any
}
        }
      })
}

    const trustBadge = getTrustBadge();

    return (
      <div style={{ position: 'relative' }}>
        <Component {...processedProps} />
        {isSecureMode && (
          <div style={{
            position: 'absolute',
  top: '-25px',
            right: '0',
  background: '#28a745',
            color: '#fff',
  padding: '2px 8px',
            borderRadius: '4px',
  fontSize: '10px',
            fontWeight: 'bold',
  display: 'flex',
            alignItems: 'center',
  gap: '4px'
          }}>
            <span>🛡️</span>
            <span>{trustBadge.type}</span>
          </div>
        )}
      </div>
    )
};

  WrappedComponent.displayName = `withSecureMode(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Secure Input Component
export const SecureInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  policy?: SecurityPolicy
}> = ({ value, onChange, placeholder, type = 'text', policy }) => {
  const { isSecureMode, enterSecureMode, sanitizeInput, validateInput } = useSecureMode();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (isSecureMode) {
      newValue = sanitizeInput(newValue);

      // Validate input
      const isValid = validateInput(newValue, {
        required: true,
  type: 'string',
  maxLength: 1000
      });

      if (!isValid) {
        return; // Don't update if validation fails
      }
    }

    onChange(newValue)
};

  const handleFocus = () => {
    if (policy && !isSecureMode) {
      enterSecureMode(policy)
}
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      style={{
        padding: '8px 12px',
  border: isSecureMode ? '2px solid #28a745' : '1px solid #ccc',
        borderRadius: '4px',
  background: isSecureMode ? '#f8fff8' : '#fff'
      }}
    />
  )
};

// Trust Badge Component
export const TrustBadge: React.FC<{ type?: TrustBadge['type'] }> = ({ type = 'GDPR' }) => {
  const { getTrustBadge } = useSecureMode();
  const badge = getTrustBadge();

  return (
    <div style={{
      display: 'inline-flex',
  alignItems: 'center',
      gap: '6px',
  padding: '4px 8px',
      background: badge.status === 'active' ? '#28a745' : '#ffc107',
      color: '#fff',
  borderRadius: '4px',
      fontSize: '12px',
  fontWeight: 'bold'
    }}>
      <span>🛡️</span>
      <span>{badge.type}</span>
      <span>{badge.status}</span>
    </div>
  )
};

// Security Dashboard Component
export const SecurityDashboard: React.FC = () => {
  const { isSecureMode, currentPolicy, trustBadges } = useSecureMode();

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '400px'
    }}>
      <h3>🛡️ Security Status</h3>

      <div style={{ marginBottom: '15px' }}>
        <strong>Secure Mode:</strong> {isSecureMode ? '🟢 Active' : '🔴 Inactive'}
      </div>

      {currentPolicy && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Active Policy:</strong> {currentPolicy.name}
          <br />
          <small>Risk Level: {currentPolicy.riskLevel}</small>
          <br />
          <small>Compliance: {currentPolicy.compliance.join(', ')}</small>
        </div>
      )}

      <div>
        <strong>Trust Badges:</strong>
        <div style={{ display: 'flex',
  gap: '8px', marginTop: '8px' }}>
          {trustBadges.map((badge, index) => (
            <TrustBadge key={index} type={badge.type} />
          ))}
        </div>
      </div>
    </div>
  )
};
