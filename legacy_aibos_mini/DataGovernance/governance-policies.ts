/**
 * Enterprise Data Governance Policies
 * Defines comprehensive governance rules and enforcement
 */

export enum GovernancePolicy {
  DATA_RETENTION = 'data_retention',
  ACCESS_CONTROL = 'access_control',
  ENCRYPTION_REQUIRED = 'encryption_required',
  AUDIT_LOGGING = 'audit_logging',
  COMPLIANCE_VALIDATION = 'compliance_validation',
  BUSINESS_RULES = 'business_rules'
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enforcement: 'block' | 'warn' | 'log';
  conditions: PolicyCondition[];
  actions: PolicyAction[];
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'in' | 'not_in';
  value: any;
  dataClassification?: DataClassification;
}

export interface PolicyAction {
  type: 'encrypt' | 'mask' | 'audit' | 'notify' | 'block';
  parameters: Record<string, any>;
}

export const ENTERPRISE_GOVERNANCE_POLICIES: Record<GovernancePolicy, PolicyRule[]> = {
  [GovernancePolicy.DATA_RETENTION]: [
    {
      id: 'retention_critical_7_years',
      name: 'Critical Data 7-Year Retention',
      description: 'Critical financial data must be retained for 7 years',
      severity: 'critical',
      enforcement: 'block',
      conditions: [{
        field: 'dataClassification',
        operator: 'equals',
        value: DataClassification.CRITICAL
      }],
      actions: [{
        type: 'audit',
        parameters: { retentionPeriod: '7 years' }
      }]
    }
  ],
  // ... other policies
};