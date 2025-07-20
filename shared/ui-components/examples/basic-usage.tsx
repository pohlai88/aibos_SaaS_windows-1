/**
 * Basic Usage Example
 * Demonstrates how to use the Enterprise UI Components
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import {
  EnterpriseProvider,
  createEnterpriseComponent,
  Button,
  withCompliance,
  withPerformance,
  useCompliance,
  usePerformance
} from '../src';

// Example 1: Using the pre-built Enterprise Button
function Example1() {
  return (
    <EnterpriseProvider
      compliance={{
        iso27001: { informationSecurity: true },
        gdpr: { dataProtection: true },
        soc2: { security: true },
        hipaa: { privacyRule: true }
      }}
      performance={{
        enableTracking: true,
        enableOptimization: true
      }}
    >
      <Button
        variant="primary"
        size="lg"
        actionType="submit"
        securityLevel="high"
        auditTrail={true}
        encryption={true}
        dataClassification="confidential"
        onComplianceViolation={(violation) => {
          console.warn('Compliance Violation:', violation);
        }}
        onPerformanceIssue={(issue) => {
          console.warn('Performance Issue:', issue);
        }}
      >
        Submit Secure Data
      </Button>
    </EnterpriseProvider>
  );
}

// Example 2: Creating a custom enterprise component
const CustomButton = ({ children, ...props }: any) => (
  <button
    style={{
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
    {...props}
  >
    {children}
  </button>
);

const EnterpriseCustomButton = createEnterpriseComponent(CustomButton, {
  purpose: 'action',
  compliance: true,
  performance: true,
  security: true,
  accessibility: true
});

function Example2() {
  return (
    <EnterpriseProvider
      compliance={{
        iso27001: { informationSecurity: true },
        gdpr: { dataProtection: true }
      }}
    >
      <EnterpriseCustomButton
        dataClassification="internal"
        auditTrail={true}
        onClick={() => console.log('Custom button clicked!')}
      >
        Custom Enterprise Button
      </EnterpriseCustomButton>
    </EnterpriseProvider>
  );
}

// Example 3: Using HOCs directly
const CompliantButton = withCompliance(CustomButton);
const PerformanceButton = withPerformance(CustomButton, 'action');

function Example3() {
  return (
    <EnterpriseProvider
      compliance={{ gdpr: { dataProtection: true } }}
      performance={{ enableTracking: true }}
    >
      <div style={{ display: 'flex', gap: '10px' }}>
        <CompliantButton
          dataClassification="public"
          auditTrail={false}
        >
          Compliant Button
        </CompliantButton>

        <PerformanceButton
          enableTracking={true}
          enableOptimization={true}
        >
          Performance Button
        </PerformanceButton>
      </div>
    </EnterpriseProvider>
  );
}

// Example 4: Using hooks
function Example4() {
  const { gdpr, soc2, hipaa, iso27001 } = useCompliance();
  const { trackPerformance, getMetrics } = usePerformance();

  const handleClick = () => {
    const interactionId = trackPerformance('example_click', {
      component: 'Example4',
      action: 'button_click'
    });

    console.log('Interaction ID:', interactionId);
    console.log('Current metrics:', getMetrics());
  };

  return (
    <div>
      <h3>Compliance Status:</h3>
      <ul>
        <li>GDPR: {gdpr ? '✅' : '❌'}</li>
        <li>SOC2: {soc2 ? '✅' : '❌'}</li>
        <li>HIPAA: {hipaa ? '✅' : '❌'}</li>
        <li>ISO27001: {iso27001 ? '✅' : '❌'}</li>
      </ul>

      <Button onClick={handleClick}>
        Track Performance
      </Button>
    </div>
  );
}

// Example 5: Complete application example
function CompleteExample() {
  return (
    <EnterpriseProvider
      compliance={{
        iso27001: {
          informationSecurity: true,
          riskAssessment: true,
          accessControl: true,
          assetManagement: true,
          incidentManagement: true,
          businessContinuity: true,
          supplierRelationships: true
        },
        gdpr: {
          dataProtection: true,
          userConsent: true,
          dataPortability: true,
          rightToErasure: true,
          dataMinimization: true,
          purposeLimitation: true,
          accountability: true
        },
        soc2: {
          security: true,
          availability: true,
          processingIntegrity: true,
          confidentiality: true,
          privacy: true
        },
        hipaa: {
          privacyRule: true,
          securityRule: true,
          breachNotification: true,
          administrativeSafeguards: true,
          physicalSafeguards: true,
          technicalSafeguards: true
        }
      }}
      performance={{
        enableTracking: true,
        enableOptimization: true,
        performanceThreshold: 16
      }}
    >
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>AI-BOS Enterprise UI Components Demo</h1>

        <section style={{ marginBottom: '30px' }}>
          <h2>Example 1: Pre-built Enterprise Button</h2>
          <Example1 />
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Example 2: Custom Enterprise Component</h2>
          <Example2 />
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Example 3: Direct HOC Usage</h2>
          <Example3 />
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Example 4: Using Hooks</h2>
          <Example4 />
        </section>
      </div>
    </EnterpriseProvider>
  );
}

export {
  Example1,
  Example2,
  Example3,
  Example4,
  CompleteExample
};
