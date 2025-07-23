/**
 * Enterprise Compliance HOCs
 * ISO27001, GDPR, SOC2, HIPAA compliance wrappers
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CommonProps, DataClassification, EnterpriseCompliance } from '../../types';

// ============================================================================
// COMPLIANCE CONTEXT
// ============================================================================

interface ComplianceContext {
  gdpr: boolean;
  soc2: boolean;
  hipaa: boolean;
  iso27001: boolean;
  validateCompliance: (component: string,
  data: any) => boolean;
  logComplianceEvent: (event: string,
  details: any) => void
}

const ComplianceContext = createContext<ComplianceContext | null>(null);

// ============================================================================
// COMPLIANCE PROVIDER
// ============================================================================

interface ComplianceProviderProps {
  children: React.ReactNode;
  compliance?: Partial<EnterpriseCompliance>
}

export const ComplianceProvider: React.FC<ComplianceProviderProps> = ({
  children,
  compliance = {}
}) => {
  const [complianceEvents, setComplianceEvents] = useState<any[]>([]);

  const validateCompliance = useCallback((component: string,
  data: any): boolean => {
    // Basic compliance validation
    const isValid = true; // Placeholder for actual validation logic
    return isValid
}, []);

  const logComplianceEvent = useCallback((event: string,
  details: any) => {
    setComplianceEvents(prev => [...prev, { event, details, timestamp: new Date() }])
}, []);

  const contextValue: ComplianceContext = {
    gdpr: compliance.gdpr?.dataProtection || false,
    soc2: compliance.soc2?.security || false,
    hipaa: compliance.hipaa?.privacyRule || false,
    iso27001: compliance.iso27001?.informationSecurity || false,
    validateCompliance,
    logComplianceEvent
  };

  return (
    <ComplianceContext.Provider value={contextValue}>
      {children}
    </ComplianceContext.Provider>
  )
};

// ============================================================================
// COMPLIANCE HOOK
// ============================================================================

export const useCompliance = (): ComplianceContext => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider')
}
  return context
};

// ============================================================================
// COMPLIANCE BOUNDARY
// ============================================================================

interface ComplianceBoundaryProps {
  children: React.ReactNode;
  classification: DataClassification;
  auditTrail: boolean;
  encryption: boolean;
  onComplianceViolation: (violation: string) => void
}

export const ComplianceBoundary: React.FC<ComplianceBoundaryProps> = ({
  children,
  classification,
  auditTrail,
  encryption,
  onComplianceViolation
}) => {
  const { logComplianceEvent } = useCompliance();

  React.useEffect(() => {
    if (auditTrail) {
      logComplianceEvent('component_mount', {
        classification,
        encryption,
        timestamp: new Date().toISOString()
      })
}
  }, [auditTrail, classification, encryption, logComplianceEvent]);

  return <>{children}</>
};

// ============================================================================
// COMPLIANCE HOCS
// ============================================================================

/**
 * Enterprise-grade type-safe HOC pattern
 */
type WithComplianceProps<P> = P & {
  dataClassification?: DataClassification;
  auditTrail?: boolean;
  encryption?: boolean;
  onComplianceViolation?: (violation: string) => void
};

/**
 * Optimized compliance HOC with proper type inference
 */
export function withCompliance<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithComplianceProps<P>> {
  const WrappedComponent = React.forwardRef<
    React.ElementRef<typeof Component>,
    WithComplianceProps<P>
  >((props, ref) => {
    const {
      dataClassification = 'internal',
      auditTrail = true,
      encryption = false,
      onComplianceViolation,
      ...componentProps
    } = props;

    const { validateCompliance, logComplianceEvent } = useCompliance();

    React.useEffect(() => {
      if (auditTrail) {
        logComplianceEvent('component_interaction', {
          component: Component.displayName || Component.name,
          dataClassification,
          encryption,
          timestamp: new Date().toISOString()
        })
}
    }, [auditTrail, dataClassification, encryption, logComplianceEvent]);

    return (
      <ComplianceBoundary
        classification={dataClassification}
        auditTrail={auditTrail}
        encryption={encryption}
        onComplianceViolation={onComplianceViolation || (() => {})}
      >
        <Component 
          {...(componentProps as P)} 
          ref={ref as React.Ref<React.ElementRef<typeof Component>>} 
        />
      </ComplianceBoundary>
    )
});

  WrappedComponent.displayName = `withCompliance(${Component.displayName || Component.name})`;
  
  // Proper type assertion with component type preservation
  return WrappedComponent as React.ComponentType<WithComplianceProps<P>>
}

/**
 * GDPR-specific HOC
 */
type WithGDPRProps<P> = P & {
  userConsent?: boolean;
  dataPortability?: boolean;
  rightToErasure?: boolean
};

export function withGDPR<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithGDPRProps<P>> {
  const WrappedComponent = React.forwardRef<any, WithGDPRProps<P>>((props, ref) => {
    const {
      userConsent = true,
      dataPortability = true,
      rightToErasure = true,
      ...componentProps
    } = props;

    const { gdpr, logComplianceEvent } = useCompliance();

    React.useEffect(() => {
      if (gdpr) {
        logComplianceEvent('gdpr_compliance', {
          userConsent,
          dataPortability,
          rightToErasure,
          timestamp: new Date().toISOString()
        })
}
    }, [gdpr, userConsent, dataPortability, rightToErasure, logComplianceEvent]);

    return <Component {...(componentProps as unknown as P)} ref={ref} />
});

  WrappedComponent.displayName = `withGDPR(${Component.displayName || Component.name})`;
  return WrappedComponent as unknown as React.ComponentType<WithGDPRProps<P>>
}

/**
 * SOC2-specific HOC
 */
type WithSOC2Props<P> = P & {
  security?: boolean;
  availability?: boolean;
  processingIntegrity?: boolean
};

export function withSOC2<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithSOC2Props<P>> {
  const WrappedComponent = React.forwardRef<any, WithSOC2Props<P>>((props, ref) => {
    const {
      security = true,
      availability = true,
      processingIntegrity = true,
      ...componentProps
    } = props;

    const { soc2, logComplianceEvent } = useCompliance();

    React.useEffect(() => {
      if (soc2) {
        logComplianceEvent('soc2_compliance', {
          security,
          availability,
          processingIntegrity,
          timestamp: new Date().toISOString()
        })
}
    }, [soc2, security, availability, processingIntegrity, logComplianceEvent]);

    return <Component {...(componentProps as unknown as P)} ref={ref} />
});

  WrappedComponent.displayName = `withSOC2(${Component.displayName || Component.name})`;
  return WrappedComponent as unknown as React.ComponentType<WithSOC2Props<P>>
}

/**
 * HIPAA-specific HOC
 */
type WithHIPAAProps<P> = P & {
  privacyRule?: boolean;
  securityRule?: boolean;
  breachNotification?: boolean
};

export function withHIPAA<P extends CommonProps>(
  Component: React.ComponentType<P>
): React.ComponentType<WithHIPAAProps<P>> {
  const WrappedComponent = React.forwardRef<any, WithHIPAAProps<P>>((props, ref) => {
    const {
      privacyRule = true,
      securityRule = true,
      breachNotification = true,
      ...componentProps
    } = props;

    const { hipaa, logComplianceEvent } = useCompliance();

    React.useEffect(() => {
      if (hipaa) {
        logComplianceEvent('hipaa_compliance', {
          privacyRule,
          securityRule,
          breachNotification,
          timestamp: new Date().toISOString()
        })
}
    }, [hipaa, privacyRule, securityRule, breachNotification, logComplianceEvent]);

    return <Component {...(componentProps as unknown as P)} ref={ref} />
});

  WrappedComponent.displayName = `withHIPAA(${Component.displayName || Component.name})`;
  return WrappedComponent as unknown as React.ComponentType<WithHIPAAProps<P>>
}

