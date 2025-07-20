import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface TenantProfile {
  id: string;
  name: string;
  region: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  preferences: TenantPreferences;
  compliance: ComplianceProfile;
  usage: UsagePatterns;
  createdAt: Date;
  updatedAt: Date
}

interface TenantPreferences {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  theme: string;
  notifications: NotificationPreferences
}

interface ComplianceProfile {
  gdpr: boolean;
  ccpa: boolean;
  hipaa: boolean;
  sox: boolean;
  iso27001: boolean;
  regionSpecific: Record<string, boolean>
}

interface UsagePatterns {
  mostUsedFields: Record<string, number>;
  commonValues: Record<string, any[]>;
  formCompletions: number;
  averageSessionTime: number;
  lastActivity: Date
}

interface SmartDefault {
  field: string;
  value: any;
  confidence: number;
  source: 'tenant' | 'region' | 'industry' | 'usage' | 'ai';
  reason: string;
  applicable: boolean
}

interface TenantAwareContextType {
  // Tenant management
  currentTenant: TenantProfile | null;
  setTenant: (tenant: TenantProfile) => void;
  updateTenantPreferences: (preferences: Partial<TenantPreferences>) => void;

  // Smart defaults
  getSmartDefaults: (formId: string,
  fields: string[]) => SmartDefault[];
  applySmartDefaults: (formId: string,
  formData: any) => any;
  learnFromSubmission: (formId: string,
  formData: any) => void;

  // Compliance
  getComplianceDefaults: () => Record<string, any>;
  isCompliant: (regulation: string) => boolean;

  // Regional defaults
  getRegionalDefaults: (region: string) => Record<string, any>;
  getCurrencyDefaults: (currency: string) => Record<string, any>;

  // AI-powered suggestions
  generateAISuggestions: (field: string,
  context: any) => Promise<any[]>;
  getFieldRecommendations: (formId: string) => Promise<string[]>
}

// Regional and compliance data
const REGIONAL_DEFAULTS: Record<string, Record<string, any>> = {
  'US': {
    currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
  timezone: 'America/New_York',
    taxCode: 'US',
  compliance: ['ccpa', 'sox']
  },
  'EU': {
    currency: 'EUR',
  dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB',
  timezone: 'Europe/London',
    taxCode: 'EU',
  compliance: ['gdpr']
  },
  'UK': {
    currency: 'GBP',
  dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB',
  timezone: 'Europe/London',
    taxCode: 'UK',
  compliance: ['gdpr']
  },
  'CA': {
    currency: 'CAD',
  dateFormat: 'YYYY-MM-DD',
    numberFormat: 'en-CA',
  timezone: 'America/Toronto',
    taxCode: 'CA',
  compliance: ['pipeda']
  },
  'AU': {
    currency: 'AUD',
  dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-AU',
  timezone: 'Australia/Sydney',
    taxCode: 'AU',
  compliance: ['privacy-act']
  }
};

const INDUSTRY_DEFAULTS: Record<string, Record<string, any>> = {
  'healthcare': {
    compliance: ['hipaa'],
    defaultFields: {
      'patientConsent': true,
      'dataRetention': '7 years',
      'encryptionLevel': 'high'
    }
  },
  'finance': {
    compliance: ['sox', 'pci'],
    defaultFields: {
      'auditTrail': true,
      'dataRetention': '10 years',
      'encryptionLevel': 'maximum'
    }
  },
  'retail': {
    compliance: ['ccpa'],
    defaultFields: {
      'customerConsent': true,
      'dataRetention': '3 years',
      'encryptionLevel': 'medium'
    }
  },
  'education': {
    compliance: ['ferpa'],
    defaultFields: {
      'studentConsent': true,
      'dataRetention': '5 years',
      'encryptionLevel': 'high'
    }
  }
};

// AI-powered default generator
class SmartDefaultGenerator {
  private static instance: SmartDefaultGenerator;
  private tenantData: Map<string, TenantProfile> = new Map();

  static getInstance(): SmartDefaultGenerator {
    if (!SmartDefaultGenerator.instance) {
      SmartDefaultGenerator.instance = new SmartDefaultGenerator()
}
    return SmartDefaultGenerator.instance
}

  generateSmartDefaults(
    tenant: TenantProfile,
  formId: string,
    fields: string[]
  ): SmartDefault[] {
    const defaults: SmartDefault[] = [];

    fields.forEach(field => {
      // Tenant-specific defaults
      const tenantDefault = this.getTenantSpecificDefault(tenant, field);
      if (tenantDefault) {
        defaults.push(tenantDefault)
}

      // Regional defaults
      const regionalDefault = this.getRegionalDefault(tenant.region, field);
      if (regionalDefault) {
        defaults.push(regionalDefault)
}

      // Industry defaults
      const industryDefault = this.getIndustryDefault(tenant.industry, field);
      if (industryDefault) {
        defaults.push(industryDefault)
}

      // Usage-based defaults
      const usageDefault = this.getUsageBasedDefault(tenant, field);
      if (usageDefault) {
        defaults.push(usageDefault)
}
    });

    return defaults.sort((a, b) => b.confidence - a.confidence)
}

  private getTenantSpecificDefault(tenant: TenantProfile,
  field: string): SmartDefault | null {
    // Check tenant preferences
    if (field === 'language' && tenant.preferences.language) {
      return {
        field,
        value: tenant.preferences.language,
        confidence: 0.95,
        source: 'tenant',
  reason: 'Based on tenant language preference',
        applicable: true
      }
}

    if (field === 'currency' && tenant.preferences.currency) {
      return {
        field,
        value: tenant.preferences.currency,
        confidence: 0.95,
        source: 'tenant',
  reason: 'Based on tenant currency preference',
        applicable: true
      }
}

    if (field === 'timezone' && tenant.preferences.timezone) {
      return {
        field,
        value: tenant.preferences.timezone,
        confidence: 0.95,
        source: 'tenant',
  reason: 'Based on tenant timezone preference',
        applicable: true
      }
}

    // Check usage patterns
    const mostUsedValue = tenant.usage.mostUsedFields[field];
    if (mostUsedValue) {
      return {
        field,
        value: mostUsedValue,
  confidence: 0.8,
        source: 'usage',
  reason: 'Based on most frequently used value',
        applicable: true
      }
}

    return null
}

  private getRegionalDefault(region: string,
  field: string): SmartDefault | null {
    const regionalData = REGIONAL_DEFAULTS[region];
    if (!regionalData) return null;

    if (field === 'currency' && regionalData.currency) {
      return {
        field,
        value: regionalData.currency,
        confidence: 0.9,
        source: 'region',
  reason: `Standard currency for ${region}`,
        applicable: true
      }
}

    if (field === 'dateFormat' && regionalData.dateFormat) {
      return {
        field,
        value: regionalData.dateFormat,
        confidence: 0.85,
        source: 'region',
  reason: `Standard date format for ${region}`,
        applicable: true
      }
}

    if (field === 'timezone' && regionalData.timezone) {
      return {
        field,
        value: regionalData.timezone,
        confidence: 0.9,
        source: 'region',
  reason: `Primary timezone for ${region}`,
        applicable: true
      }
}

    return null
}

  private getIndustryDefault(industry: string,
  field: string): SmartDefault | null {
    const industryData = INDUSTRY_DEFAULTS[industry];
    if (!industryData) return null;

    const defaultField = industryData.defaultFields?.[field];
    if (defaultField) {
      return {
        field,
        value: defaultField,
  confidence: 0.8,
        source: 'industry',
  reason: `Standard for ${industry} industry`,
        applicable: true
      }
}

    return null
}

  private getUsageBasedDefault(tenant: TenantProfile,
  field: string): SmartDefault | null {
    const commonValues = tenant.usage.commonValues[field];
    if (commonValues && commonValues.length > 0) {
      // Get the most common value
      const valueCounts: Record<string, number> = {};
      commonValues.forEach(value => {
        const key = String(value);
        valueCounts[key] = (valueCounts[key] || 0) + 1
});

      const mostCommon = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])[0];

      if (mostCommon) {
        return {
          field,
          value: mostCommon[0],
          confidence: Math.min(0.9, mostCommon[1] / commonValues.length),
          source: 'usage',
  reason: `Most commonly used value (${mostCommon[1]} times)`,
          applicable: true
        }
}
    }

    return null
}

  async generateAISuggestions(field: string,
  context: any): Promise<any[]> {
    // Simulate AI-powered suggestions
    const suggestions: any[] = [];

    switch (field) {
      case 'companyName':
        suggestions.push('Acme Corporation', 'Global Solutions Inc.', 'Tech Innovations Ltd.');
        break;
      case 'industry':
        suggestions.push('Technology', 'Healthcare', 'Finance', 'Retail', 'Education');
        break;
      case 'size':
        suggestions.push('small', 'medium', 'large', 'enterprise');
        break;
      case 'region':
        suggestions.push('US', 'EU', 'UK', 'CA', 'AU');
        break
}

    return suggestions.slice(0, 3)
}

  learnFromSubmission(tenant: TenantProfile,
  formId: string, formData: any): void {
    // Update usage patterns
    Object.entries(formData).forEach(([field, value]) => {
      if (!tenant.usage.mostUsedFields[field]) {
        tenant.usage.mostUsedFields[field] = 0
}
      tenant.usage.mostUsedFields[field]++;

      if (!tenant.usage.commonValues[field]) {
        tenant.usage.commonValues[field] = []
}
      tenant.usage.commonValues[field].push(value)
});

    tenant.usage.formCompletions++;
    tenant.usage.lastActivity = new Date()
}
}

// Context
const TenantAwareContext = createContext<TenantAwareContextType | null>(null);

// Provider Component
interface TenantAwareProviderProps {
  children: ReactNode;
  initialTenant?: TenantProfile;
  enableLearning?: boolean;
  enableAuditTrail?: boolean
}

export const TenantAwareProvider: React.FC<TenantAwareProviderProps> = ({
  children,
  initialTenant,
  enableLearning = true,
  enableAuditTrail = true
}) => {
  const [currentTenant, setCurrentTenant] = useState<TenantProfile | null>(initialTenant || null);
  const smartDefaultGenerator = useRef(SmartDefaultGenerator.getInstance());

  const setTenant = (tenant: TenantProfile) => {
    setCurrentTenant(tenant);

    if (enableAuditTrail) {
      auditLogger.info('Tenant set', { tenantId: tenant.id, tenantName: tenant.name })
}
  };

  const updateTenantPreferences = (preferences: Partial<TenantPreferences>) => {
    if (!currentTenant) return;

    const updatedTenant = {
      ...currentTenant,
      preferences: { ...currentTenant.preferences, ...preferences },
      updatedAt: new Date()
    };

    setCurrentTenant(updatedTenant);

    if (enableAuditTrail) {
      auditLogger.info('Tenant preferences updated', {
        tenantId: currentTenant.id,
        preferences
      })
}
  };

  const getSmartDefaults = (formId: string,
  fields: string[]): SmartDefault[] => {
    if (!currentTenant) return [];

    return smartDefaultGenerator.current.generateSmartDefaults(currentTenant, formId, fields)
};

  const applySmartDefaults = (formId: string,
  formData: any): any => {
    if (!currentTenant) return formData;

    const fields = Object.keys(formData);
    const smartDefaults = getSmartDefaults(formId, fields);

    const enhancedData = { ...formData };

    smartDefaults.forEach(defaultValue => {
      if (defaultValue.applicable && !enhancedData[defaultValue.field]) {
        enhancedData[defaultValue.field] = defaultValue.value
}
    });

    return enhancedData
};

  const learnFromSubmission = (formId: string,
  formData: any) => {
    if (!currentTenant || !enableLearning) return;

    smartDefaultGenerator.current.learnFromSubmission(currentTenant, formId, formData);

    if (enableAuditTrail) {
      auditLogger.info('Learned from form submission', {
        tenantId: currentTenant.id,
        formId,
        fields: Object.keys(formData)
      })
}
  };

  const getComplianceDefaults = (): Record<string, any> => {
    if (!currentTenant) return {};

    const complianceDefaults: Record<string, any> = {};

    if (currentTenant.compliance.gdpr) {
      complianceDefaults.gdprConsent = true;
      complianceDefaults.dataRetention = '7 years';
      complianceDefaults.rightToBeForgotten = true
}

    if (currentTenant.compliance.hipaa) {
      complianceDefaults.hipaaCompliant = true;
      complianceDefaults.encryptionLevel = 'high';
      complianceDefaults.auditTrail = true
}

    if (currentTenant.compliance.sox) {
      complianceDefaults.soxCompliant = true;
      complianceDefaults.financialControls = true;
      complianceDefaults.dataRetention = '10 years'
}

    return complianceDefaults
};

  const isCompliant = (regulation: string): boolean => {
    if (!currentTenant) return false;
    return currentTenant.compliance[regulation as keyof ComplianceProfile] || false
};

  const getRegionalDefaults = (region: string): Record<string, any> => {
    return REGIONAL_DEFAULTS[region] || {}
};

  const getCurrencyDefaults = (currency: string): Record<string, any> => {
    const currencyDefaults: Record<string, any> = {
      symbol: '',
  position: 'before',
      decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.'
    };

    switch (currency) {
      case 'USD':
        currencyDefaults.symbol = '$';
        currencyDefaults.position = 'before';
        break;
      case 'EUR':
        currencyDefaults.symbol = '€';
        currencyDefaults.position = 'after';
        break;
      case 'GBP':
        currencyDefaults.symbol = '£';
        currencyDefaults.position = 'before';
        break;
      case 'CAD':
        currencyDefaults.symbol = 'C$';
        currencyDefaults.position = 'before';
        break;
      case 'AUD':
        currencyDefaults.symbol = 'A$';
        currencyDefaults.position = 'before';
        break
}

    return currencyDefaults
};

  const generateAISuggestions = async (field: string,
  context: any): Promise<any[]> => {
    return await smartDefaultGenerator.current.generateAISuggestions(field, context)
};

  const getFieldRecommendations = async (formId: string): Promise<string[]> => {
    if (!currentTenant) return [];

    // Analyze usage patterns to recommend fields
    const recommendations: string[] = [];
    const usage = currentTenant.usage;

    // Recommend fields based on usage frequency
    Object.entries(usage.mostUsedFields)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([field, _]) => {
        recommendations.push(field)
});

    return recommendations
};

  const value: TenantAwareContextType = {
    currentTenant,
    setTenant,
    updateTenantPreferences,
    getSmartDefaults,
    applySmartDefaults,
    learnFromSubmission,
    getComplianceDefaults,
    isCompliant,
    getRegionalDefaults,
    getCurrencyDefaults,
    generateAISuggestions,
    getFieldRecommendations
  };

  return (
    <TenantAwareContext.Provider value={value}>
      {children}
    </TenantAwareContext.Provider>
  )
};

// Hook
export const useTenantAware = () => {
  const context = useContext(TenantAwareContext);
  if (!context) {
    throw new Error('useTenantAware must be used within TenantAwareProvider')
}
  return context
};

// HOC for tenant-aware components
export const withTenantAware = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    formId?: string;
    enableSmartDefaults?: boolean;
    enableLearning?: boolean
} = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      getSmartDefaults,
      applySmartDefaults,
      learnFromSubmission,
      currentTenant
    } = useTenantAware();

    const [smartDefaults, setSmartDefaults] = useState<SmartDefault[]>([]);

    useEffect(() => {
      if (options.enableSmartDefaults && options.formId) {
        const fields = Object.keys(props).filter(key =>
          typeof props[key as keyof P] === 'string' ||
          typeof props[key as keyof P] === 'number' ||
          typeof props[key as keyof P] === 'boolean'
        );
        const defaults = getSmartDefaults(options.formId, fields);
        setSmartDefaults(defaults)
}
    }, [props, options.formId]);

    const handleSubmit = (formData: any) => {
      if (options.enableLearning && options.formId) {
        learnFromSubmission(options.formId, formData)
}
    };

    const enhancedProps = {
      ...props,
      smartDefaults,
      onFormSubmit: handleSubmit
    };

    return <Component {...enhancedProps} />
};

  WrappedComponent.displayName = `withTenantAware(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Smart Form Component
export const SmartForm: React.FC<{
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required?: boolean
}>;
  onSubmit: (data: any) => void;
  formId: string
}> = ({ fields, onSubmit, formId }) => {
  const {
    getSmartDefaults,
    applySmartDefaults,
    learnFromSubmission,
    generateAISuggestions
  } = useTenantAware();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [smartDefaults, setSmartDefaults] = useState<SmartDefault[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fieldNames = fields.map(f => f.name);
    const defaults = getSmartDefaults(formId, fieldNames);
    setSmartDefaults(defaults);

    // Apply smart defaults to initial form data
    const initialData: Record<string, any> = {};
    defaults.forEach(defaultValue => {
      if (defaultValue.applicable) {
        initialData[defaultValue.field] = defaultValue.value
}
    });
    setFormData(initialData)
}, [fields, formId]);

  const handleFieldChange = async (fieldName: string,
  value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Generate AI suggestions for empty fields
    if (!value && !aiSuggestions[fieldName]) {
      const suggestions = await generateAISuggestions(fieldName, formData);
      setAiSuggestions(prev => ({ ...prev, [fieldName]: suggestions }))
}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Apply smart defaults before submission
    const enhancedData = applySmartDefaults(formId, formData);

    // Learn from submission
    learnFromSubmission(formId, enhancedData);

    onSubmit(enhancedData)
};

  const getDefaultForField = (fieldName: string): any => {
    const defaultObj = smartDefaults.find(d => d.field === fieldName);
    return defaultObj?.value
};

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#f8f9fa',
  padding: '20px',
      borderRadius: '8px',
  maxWidth: '500px'
    }}>
      <h3>Smart Form - {formId}</h3>

      {fields.map(field => {
        const defaultValue = getDefaultForField(field.name);
        const suggestions = aiSuggestions[field.name] || [];

        return (
          <div key={field.name} style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block',
  marginBottom: '5px', fontWeight: 'bold' }}>
              {field.label}
              {field.required && <span style={{ color: '#dc3545' }}> *</span>}
            </label>

            {defaultValue && (
              <div style={{
                background: '#d4edda',
  color: '#155724',
                padding: '5px 10px',
  borderRadius: '4px',
                fontSize: '12px',
  marginBottom: '5px'
              }}>
                💡 Smart default: {String(defaultValue)}
              </div>
            )}

            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.label}
              required={field.required}
              style={{
                width: '100%',
  padding: '8px 12px',
                border: '1px solid #ced4da',
  borderRadius: '4px',
                fontSize: '14px'
              }}
            />

            {suggestions.length > 0 && (
              <div style={{ marginTop: '5px' }}>
                <small style={{ color: '#6c757d' }}>AI suggestions:</small>
                <div style={{ display: 'flex',
  gap: '5px', marginTop: '2px' }}>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleFieldChange(field.name, suggestion)}
                      style={{
                        background: '#e9ecef',
  border: '1px solid #ced4da',
                        borderRadius: '3px',
  padding: '2px 6px',
                        fontSize: '11px',
  cursor: 'pointer'
                      }}
                    >
                      {String(suggestion)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
})}

      <button
        type="submit"
        style={{
          background: '#007bff',
  color: '#fff',
          border: 'none',
  padding: '10px 20px',
          borderRadius: '4px',
  cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Submit
      </button>
    </form>
  )
};

// Tenant Dashboard Component
export const TenantDashboard: React.FC = () => {
  const {
    currentTenant,
    getSmartDefaults,
    getComplianceDefaults,
    isCompliant
  } = useTenantAware();

  if (!currentTenant) {
    return (
      <div style={{ padding: '20px',
  background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🏢 Tenant-Aware System</h3>
        <p>No tenant selected</p>
      </div>
    )
}

  const complianceDefaults = getComplianceDefaults();
  const smartDefaults = getSmartDefaults('demo-form', ['language', 'currency', 'timezone']);

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '500px'
    }}>
      <h3>🏢 Tenant: {currentTenant.name}</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Profile</h4>
        <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
          <div><strong>Region:</strong> {currentTenant.region}</div>
          <div><strong>Industry:</strong> {currentTenant.industry}</div>
          <div><strong>Size:</strong> {currentTenant.size}</div>
          <div><strong>Language:</strong> {currentTenant.preferences.language}</div>
          <div><strong>Currency:</strong> {currentTenant.preferences.currency}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Compliance Status</h4>
        <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {Object.entries(currentTenant.compliance).map(([regulation, compliant]) => (
            <div key={regulation} style={{
              padding: '4px 8px',
  background: compliant ? '#28a745' : '#dc3545',
              borderRadius: '4px',
  fontSize: '12px',
              textAlign: 'center'
            }}>
              {regulation.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Smart Defaults</h4>
        <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
          {smartDefaults.map((defaultValue, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <strong>{defaultValue.field}:</strong> {String(defaultValue.value)}
              <br />
              <small style={{ color: '#888' }}>
                {defaultValue.reason} (Confidence: {(defaultValue.confidence * 100).toFixed(0)}%)
              </small>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Usage Patterns</h4>
        <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
          <div>Form Completions: {currentTenant.usage.formCompletions}</div>
          <div>Average Session: {currentTenant.usage.averageSessionTime}ms</div>
          <div>Last Activity: {currentTenant.usage.lastActivity.toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  )
};
