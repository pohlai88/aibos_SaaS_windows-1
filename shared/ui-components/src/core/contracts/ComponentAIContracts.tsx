import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface ComponentContract {
  id: string;
  name: string;
  version: string;
  description: string;
  inputs: ContractInput[];
  outputs: ContractOutput[];
  compliance: ComplianceTier;
  aiUsage: AIUsageScope;
  riskClassification: RiskClassification;
  dependencies: string[];
  performance: PerformanceGuarantees;
  security: SecurityRequirements;
  accessibility: AccessibilityRequirements;
  createdAt: Date;
  updatedAt: Date
}

interface ContractInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  validation?: ValidationRule[];
  defaultValue?: any;
  examples?: any[]
}

interface ContractOutput {
  name: string;
  type: string;
  description: string;
  guaranteed?: boolean;
  examples?: any[]
}

interface ComplianceTier {
  level: 'basic' | 'standard' | 'enterprise' | 'government';
  certifications: string[];
  requirements: string[];
  auditTrail: boolean;
  dataRetention: string
}

interface AIUsageScope {
  enabled: boolean;
  models: string[];
  dataTypes: string[];
  processingLevel: 'local' | 'edge' | 'cloud';
  privacyImpact: 'low' | 'medium' | 'high';
  consentRequired: boolean;
  dataRetention: string
}

interface RiskClassification {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  mitigations: string[];
  insurance: boolean;
  liability: string
}

interface RiskFactor {
  type: 'security' | 'privacy' | 'performance' | 'compliance' | 'operational';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high'
}

interface PerformanceGuarantees {
  renderTime: number; // milliseconds
  memoryUsage: number; // MB
  bundleSize: number; // KB
  loadTime: number; // milliseconds
  scalability: 'low' | 'medium' | 'high'
}

interface SecurityRequirements {
  encryption: boolean;
  authentication: boolean;
  authorization: boolean;
  inputValidation: boolean;
  outputSanitization: boolean;
  auditLogging: boolean
}

interface AccessibilityRequirements {
  wcagLevel: 'A' | 'AA' | 'AAA';
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
  focusManagement: boolean
}

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value: any;
  message: string
}

interface ContractContextType {
  // Contract management
  contracts: ComponentContract[];
  registerContract: (contract: Omit<ComponentContract, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateContract: (contractId: string,
  updates: Partial<ComponentContract>) => void;
  deleteContract: (contractId: string) => void;
  getContract: (contractId: string) => ComponentContract | null;

  // Validation
  validateContract: (contractId: string,
  props: any) => ValidationResult;
  validateAllContracts: () => ValidationReport;

  // Documentation
  generateDocumentation: (contractId: string) => string;
  exportContract: (contractId: string) => string;
  importContract: (contractData: string) => string;

  // AI Analysis
  analyzeContract: (contractId: string) => ContractAnalysis;
  suggestImprovements: (contractId: string) => ImprovementSuggestion[];

  // Compliance
  checkCompliance: (contractId: string,
  standards: string[]) => ComplianceReport;
  getComplianceGap: (contractId: string) => ComplianceGap[]
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[]
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning'
}

interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string
}

interface ValidationReport {
  totalContracts: number;
  validContracts: number;
  invalidContracts: number;
  errors: ValidationError[];
  warnings: ValidationWarning[]
}

interface ContractAnalysis {
  contractId: string;
  complexity: 'low' | 'medium' | 'high';
  riskScore: number;
  complianceScore: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  recommendations: string[]
}

interface ImprovementSuggestion {
  id: string;
  type: 'security' | 'performance' | 'accessibility' | 'compliance' | 'documentation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number
}

interface ComplianceReport {
  contractId: string;
  standards: Record<string, boolean>;
  overallCompliance: number;
  missingRequirements: string[];
  recommendations: string[]
}

interface ComplianceGap {
  standard: string;
  requirement: string;
  currentStatus: 'missing' | 'partial' | 'implemented';
  description: string;
  impact: 'low' | 'medium' | 'high'
}

// Contract Manager
class ContractManager {
  private static instance: ContractManager;
  private contracts: Map<string, ComponentContract> = new Map();

  static getInstance(): ContractManager {
    if (!ContractManager.instance) {
      ContractManager.instance = new ContractManager()
}
    return ContractManager.instance
}

  registerContract(contract: Omit<ComponentContract, 'id' | 'createdAt' | 'updatedAt'>): string {
    const contractId = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newContract: ComponentContract = {
      ...contract,
      id: contractId,
  createdAt: new Date(),
      updatedAt: new Date()
    };

    this.contracts.set(contractId, newContract);
    return contractId
}

  updateContract(contractId: string,
  updates: Partial<ComponentContract>): void {
    const contract = this.contracts.get(contractId);
    if (!contract) return;

    const updatedContract = { ...contract, ...updates, updatedAt: new Date() };
    this.contracts.set(contractId, updatedContract)
}

  deleteContract(contractId: string): void {
    this.contracts.delete(contractId)
}

  getContract(contractId: string): ComponentContract | null {
    return this.contracts.get(contractId) || null
}

  validateContract(contractId: string,
  props: any): ValidationResult {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return {
        isValid: false,
  errors: [{ field: 'contract',
  message: 'Contract not found', severity: 'error' }],
        warnings: [],
        suggestions: []
      }
}

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Validate required inputs
    contract.inputs.forEach(input => {
      if (input.required && props[input.name] === undefined) {
        errors.push({
          field: input.name,
          message: `Required input '${input.name}' is missing`,
          severity: 'error'
        })
}

      // Validate input type
      if (props[input.name] !== undefined) {
        const propType = typeof props[input.name];
        if (input.type !== propType) {
          warnings.push({
            field: input.name,
            message: `Expected type '${input.type}' but got '${propType}'`,
            recommendation: `Consider converting the value to ${input.type}`
          })
}
      }

      // Validate custom rules
      input.validation?.forEach(rule => {
        if (rule.type === 'minLength' && props[input.name]?.length < rule.value) {
          errors.push({
            field: input.name,
            message: rule.message,
            severity: 'error'
          })
}

        if (rule.type === 'maxLength' && props[input.name]?.length > rule.value) {
          errors.push({
            field: input.name,
            message: rule.message,
            severity: 'error'
          })
}

        if (rule.type === 'pattern' && !rule.value.test(props[input.name])) {
          errors.push({
            field: input.name,
            message: rule.message,
            severity: 'error'
          })
}
      })
});

    // Performance validation
    if (contract.performance.renderTime > 16) {
      warnings.push({
        field: 'performance',
  message: 'Render time exceeds 16ms threshold',
        recommendation: 'Consider optimizing component rendering'
      })
}

    // Security validation
    if (contract.security.inputValidation && !this.hasInputValidation(props)) {
      warnings.push({
        field: 'security',
  message: 'Input validation not detected',
        recommendation: 'Implement input validation for security'
      })
}

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
}

  private hasInputValidation(props: any): boolean {
    // Simple check for validation patterns
    return Object.keys(props).some(key =>
      key.includes('validate') || key.includes('validation') || key.includes('sanitize')
    )
}

  validateAllContracts(): ValidationReport {
    const report: ValidationReport = {
      totalContracts: this.contracts.size,
      validContracts: 0,
  invalidContracts: 0,
      errors: [],
      warnings: []
    };

    this.contracts.forEach((contract, contractId) => {
      const validation = this.validateContract(contractId, {});

      if (validation.isValid) {
        report.validContracts++
} else {
        report.invalidContracts++
}

      report.errors.push(...validation.errors);
      report.warnings.push(...validation.warnings)
});

    return report
}

  generateDocumentation(contractId: string): string {
    const contract = this.contracts.get(contractId);
    if (!contract) return 'Contract not found';

    return `# ${contract.name} v${contract.version}

## Description
${contract.description}

## Inputs
${contract.inputs.map(input => `
### ${input.name}
- **Type:** ${input.type}
- **Required:** ${input.required}
- **Description:** ${input.description}
${input.defaultValue ? `- **Default:** ${input.defaultValue}` : ''}
`).join('')}

## Outputs
${contract.outputs.map(output => `
### ${output.name}
- **Type:** ${output.type}
- **Description:** ${output.description}
- **Guaranteed:** ${output.guaranteed || false}
`).join('')}

## Compliance
- **Level:** ${contract.compliance.level}
- **Certifications:** ${contract.compliance.certifications.join(', ')}
- **Audit Trail:** ${contract.compliance.auditTrail}

## AI Usage
- **Enabled:** ${contract.aiUsage.enabled}
- **Processing Level:** ${contract.aiUsage.processingLevel}
- **Privacy Impact:** ${contract.aiUsage.privacyImpact}

## Risk Classification
- **Level:** ${contract.riskClassification.level}
- **Insurance:** ${contract.riskClassification.insurance}

## Performance Guarantees
- **Render Time:** ${contract.performance.renderTime}ms
- **Memory Usage:** ${contract.performance.memoryUsage}MB
- **Bundle Size:** ${contract.performance.bundleSize}KB

## Security Requirements
- **Encryption:** ${contract.security.encryption}
- **Authentication:** ${contract.security.authentication}
- **Input Validation:** ${contract.security.inputValidation}

## Accessibility Requirements
- **WCAG Level:** ${contract.accessibility.wcagLevel}
- **Screen Reader:** ${contract.accessibility.screenReader}
- **Keyboard Navigation:** ${contract.accessibility.keyboardNavigation}
`
}

  exportContract(contractId: string): string {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error('Contract not found');

    return JSON.stringify(contract, null, 2)
}

  importContract(contractData: string): string {
    try {
      const contract: ComponentContract = JSON.parse(contractData);
      contract.id = `imported-${Date.now()}`;
      contract.createdAt = new Date();
      contract.updatedAt = new Date();

      this.contracts.set(contract.id, contract);
      return contract.id
} catch (error) {
      throw new Error('Invalid contract data format')
}
  }

  analyzeContract(contractId: string): ContractAnalysis {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error('Contract not found');

    // Calculate complexity score
    const complexity = this.calculateComplexity(contract);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(contract);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(contract);

    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore(contract);

    // Calculate security score
    const securityScore = this.calculateSecurityScore(contract);

    // Calculate accessibility score
    const accessibilityScore = this.calculateAccessibilityScore(contract);

    const recommendations = this.generateRecommendations(contract);

    return {
      contractId,
      complexity,
      riskScore,
      complianceScore,
      performanceScore,
      securityScore,
      accessibilityScore,
      recommendations
    }
}

  private calculateComplexity(contract: ComponentContract): 'low' | 'medium' | 'high' {
    const inputCount = contract.inputs.length;
    const outputCount = contract.outputs.length;
    const dependencyCount = contract.dependencies.length;

    const complexityScore = inputCount + outputCount + dependencyCount;

    if (complexityScore <= 5) return 'low';
    if (complexityScore <= 15) return 'medium';
    return 'high'
}

  private calculateRiskScore(contract: ComponentContract): number {
    let score = 0;

    // Risk level scoring
    switch (contract.riskClassification.level) {
      case 'low': score += 10; break;
      case 'medium': score += 30; break;
      case 'high': score += 60; break;
      case 'critical': score += 90; break
}

    // AI usage impact
    if (contract.aiUsage.enabled) {
      switch (contract.aiUsage.privacyImpact) {
        case 'low': score += 5; break;
        case 'medium': score += 15; break;
        case 'high': score += 30; break
}
    }

    // Security requirements
    if (!contract.security.encryption) score += 20;
    if (!contract.security.inputValidation) score += 15;

    return Math.min(100, score)
}

  private calculateComplianceScore(contract: ComponentContract): number {
    let score = 100;

    // Compliance level scoring
    switch (contract.compliance.level) {
      case 'basic': score -= 30; break;
      case 'standard': score -= 15; break;
      case 'enterprise': score -= 5; break;
      case 'government': score -= 0; break
}

    // Missing certifications
    score -= (5 - contract.compliance.certifications.length) * 10;

    if (!contract.compliance.auditTrail) score -= 20;

    return Math.max(0, score)
}

  private calculatePerformanceScore(contract: ComponentContract): number {
    let score = 100;

    // Render time penalty
    if (contract.performance.renderTime > 16) {
      score -= Math.min(30, (contract.performance.renderTime - 16) * 2)
}

    // Memory usage penalty
    if (contract.performance.memoryUsage > 50) {
      score -= Math.min(20, (contract.performance.memoryUsage - 50) / 5)
}

    // Bundle size penalty
    if (contract.performance.bundleSize > 100) {
      score -= Math.min(20, (contract.performance.bundleSize - 100) / 10)
}

    return Math.max(0, score)
}

  private calculateSecurityScore(contract: ComponentContract): number {
    let score = 100;

    if (!contract.security.encryption) score -= 25;
    if (!contract.security.authentication) score -= 20;
    if (!contract.security.authorization) score -= 20;
    if (!contract.security.inputValidation) score -= 15;
    if (!contract.security.outputSanitization) score -= 10;
    if (!contract.security.auditLogging) score -= 10;

    return Math.max(0, score)
}

  private calculateAccessibilityScore(contract: ComponentContract): number {
    let score = 100;

    if (!contract.accessibility.screenReader) score -= 25;
    if (!contract.accessibility.keyboardNavigation) score -= 25;
    if (!contract.accessibility.colorContrast) score -= 20;
    if (!contract.accessibility.focusManagement) score -= 15;

    // WCAG level scoring
    switch (contract.accessibility.wcagLevel) {
      case 'A': score -= 15; break;
      case 'AA': score -= 5; break;
      case 'AAA': score -= 0; break
}

    return Math.max(0, score)
}

  private generateRecommendations(contract: ComponentContract): string[] {
    const recommendations: string[] = [];

    if (contract.performance.renderTime > 16) {
      recommendations.push('Optimize component rendering to meet 16ms threshold')
}

    if (!contract.security.inputValidation) {
      recommendations.push('Implement input validation for security')
}

    if (!contract.accessibility.screenReader) {
      recommendations.push('Add screen reader support for accessibility')
}

    if (contract.riskClassification.level === 'high' && !contract.riskClassification.insurance) {
      recommendations.push('Consider adding liability insurance for high-risk components')
}

    return recommendations
}

  suggestImprovements(contractId: string): ImprovementSuggestion[] {
    const contract = this.contracts.get(contractId);
    if (!contract) return [];

    const suggestions: ImprovementSuggestion[] = [];

    // Performance improvements
    if (contract.performance.renderTime > 16) {
      suggestions.push({
        id: 'perf-1',
  type: 'performance',
        title: 'Optimize Render Time',
  description: 'Component render time exceeds 16ms threshold',
        impact: 'high',
  effort: 'medium',
        priority: 1
      })
}

    // Security improvements
    if (!contract.security.inputValidation) {
      suggestions.push({
        id: 'sec-1',
  type: 'security',
        title: 'Add Input Validation',
  description: 'Implement input validation for security',
        impact: 'high',
  effort: 'low',
        priority: 1
      })
}

    // Accessibility improvements
    if (!contract.accessibility.screenReader) {
      suggestions.push({
        id: 'a11y-1',
  type: 'accessibility',
        title: 'Add Screen Reader Support',
  description: 'Implement screen reader support for accessibility',
        impact: 'medium',
  effort: 'medium',
        priority: 2
      })
}

    return suggestions.sort((a, b) => a.priority - b.priority)
}

  checkCompliance(contractId: string,
  standards: string[]): ComplianceReport {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error('Contract not found');

    const standardsCompliance: Record<string, boolean> = {};
    const missingRequirements: string[] = [];
    const recommendations: string[] = [];

    standards.forEach(standard => {
      let compliant = true;

      switch (standard.toLowerCase()) {
        case 'gdpr':
          compliant = contract.aiUsage.consentRequired &&
                     contract.aiUsage.dataRetention !== 'indefinite';
          break;
        case 'wcag':
          compliant = contract.accessibility.wcagLevel === 'AA' ||
                     contract.accessibility.wcagLevel === 'AAA';
          break;
        case 'sox':
          compliant = contract.compliance.auditTrail &&
                     contract.security.auditLogging;
          break;
        case 'hipaa':
          compliant = contract.security.encryption &&
                     contract.aiUsage.processingLevel === 'local';
          break
}

      standardsCompliance[standard] = compliant;

      if (!compliant) {
        missingRequirements.push(`${standard} compliance requirements not met`)
}
    });

    const overallCompliance = Object.values(standardsCompliance)
      .filter(Boolean).length / standards.length * 100;

    return {
      contractId,
      standards: standardsCompliance,
      overallCompliance,
      missingRequirements,
      recommendations
    }
}

  getComplianceGap(contractId: string): ComplianceGap[] {
    const contract = this.contracts.get(contractId);
    if (!contract) return [];

    const gaps: ComplianceGap[] = [];

    // GDPR gaps
    if (!contract.aiUsage.consentRequired) {
      gaps.push({
        standard: 'GDPR',
  requirement: 'Consent Required',
        currentStatus: 'missing',
  description: 'AI processing requires explicit user consent',
        impact: 'high'
      })
}

    // WCAG gaps
    if (contract.accessibility.wcagLevel === 'A') {
      gaps.push({
        standard: 'WCAG',
  requirement: 'AA Compliance',
        currentStatus: 'partial',
  description: 'Component meets WCAG A but not AA standards',
        impact: 'medium'
      })
}

    // Security gaps
    if (!contract.security.encryption) {
      gaps.push({
        standard: 'Security',
  requirement: 'Data Encryption',
        currentStatus: 'missing',
  description: 'Component does not encrypt sensitive data',
        impact: 'high'
      })
}

    return gaps
}

  getAllContracts(): ComponentContract[] {
    return Array.from(this.contracts.values())
}
}

// Context
const ContractContext = createContext<ContractContextType | null>(null);

// Provider Component
interface ContractProviderProps {
  children: ReactNode;
  enableAuditTrail?: boolean
}

export const ContractProvider: React.FC<ContractProviderProps> = ({
  children,
  enableAuditTrail = true
}) => {
  const contractManager = useRef(ContractManager.getInstance());

  const registerContract = (contract: Omit<ComponentContract, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const contractId = contractManager.current.registerContract(contract);

    if (enableAuditTrail) {
      auditLogger.info('Component contract registered', {
        contractId,
        contractName: contract.name,
        version: contract.version
      })
}

    return contractId
};

  const updateContract = (contractId: string,
  updates: Partial<ComponentContract>) => {
    contractManager.current.updateContract(contractId, updates);

    if (enableAuditTrail) {
      auditLogger.info('Component contract updated', { contractId, updates })
}
  };

  const deleteContract = (contractId: string) => {
    contractManager.current.deleteContract(contractId);

    if (enableAuditTrail) {
      auditLogger.info('Component contract deleted', { contractId })
}
  };

  const getContract = (contractId: string): ComponentContract | null => {
    return contractManager.current.getContract(contractId)
};

  const validateContract = (contractId: string,
  props: any): ValidationResult => {
    return contractManager.current.validateContract(contractId, props)
};

  const validateAllContracts = (): ValidationReport => {
    return contractManager.current.validateAllContracts()
};

  const generateDocumentation = (contractId: string): string => {
    return contractManager.current.generateDocumentation(contractId)
};

  const exportContract = (contractId: string): string => {
    return contractManager.current.exportContract(contractId)
};

  const importContract = (contractData: string): string => {
    return contractManager.current.importContract(contractData)
};

  const analyzeContract = (contractId: string): ContractAnalysis => {
    return contractManager.current.analyzeContract(contractId)
};

  const suggestImprovements = (contractId: string): ImprovementSuggestion[] => {
    return contractManager.current.suggestImprovements(contractId)
};

  const checkCompliance = (contractId: string,
  standards: string[]): ComplianceReport => {
    return contractManager.current.checkCompliance(contractId, standards)
};

  const getComplianceGap = (contractId: string): ComplianceGap[] => {
    return contractManager.current.getComplianceGap(contractId)
};

  const value: ContractContextType = {
    contracts: contractManager.current.getAllContracts(),
    registerContract,
    updateContract,
    deleteContract,
    getContract,
    validateContract,
    validateAllContracts,
    generateDocumentation,
    exportContract,
    importContract,
    analyzeContract,
    suggestImprovements,
    checkCompliance,
    getComplianceGap
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
};

// Hook
export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within ContractProvider')
}
  return context
};

// HOC for contract-enabled components
export const withContract = <P extends object>(
  Component: React.ComponentType<P>,
  contract: Omit<ComponentContract, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { registerContract, validateContract, getContract } = useContract();
    const [contractId, setContractId] = useState<string | null>(null);
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    useEffect(() => {
      const id = registerContract(contract);
      setContractId(id)
}, []);

    useEffect(() => {
      if (contractId) {
        const result = validateContract(contractId, props);
        setValidation(result)
}
    }, [props, contractId]);

    if (validation && !validation.isValid) {
      console.warn('Contract validation failed:', validation.errors)
}

    return <Component {...props} />
};

  WrappedComponent.displayName = `withContract(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Contract Dashboard Component
export const ContractDashboard: React.FC = () => {
  const {
    contracts,
    validateAllContracts,
    analyzeContract,
    suggestImprovements
  } = useContract();

  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [selectedContract, setSelectedContract] = useState<ComponentContract | null>(null);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);

  const handleValidateAll = () => {
    const report = validateAllContracts();
    setValidationReport(report)
};

  const handleAnalyzeContract = (contractId: string) => {
    try {
      const contractAnalysis = analyzeContract(contractId);
      setAnalysis(contractAnalysis);

      const improvementSuggestions = suggestImprovements(contractId);
      setSuggestions(improvementSuggestions)
} catch (error) {
      console.error('Failed to analyze contract:', error)
}
  };

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '600px'
    }}>
      <h3>📋 Component AI Contracts</h3>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleValidateAll}
          style={{
            background: '#007bff',
  color: '#fff',
            border: 'none',
  padding: '8px 16px',
            borderRadius: '4px',
  cursor: 'pointer'
          }}
        >
          Validate All Contracts
        </button>
      </div>

      {validationReport && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Validation Report</h4>
          <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
            <div>Total Contracts: {validationReport.totalContracts}</div>
            <div>Valid: {validationReport.validContracts}</div>
            <div>Invalid: {validationReport.invalidContracts}</div>
            <div>Errors: {validationReport.errors.length}</div>
            <div>Warnings: {validationReport.warnings.length}</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h4>Contracts ({contracts.length})</h4>
        <div style={{
          maxHeight: '300px',
  overflowY: 'auto',
          background: '#333',
  padding: '10px',
          borderRadius: '4px'
        }}>
          {contracts.map(contract => (
            <div key={contract.id} style={{
              padding: '10px',
  background: '#444',
              marginBottom: '8px',
  borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedContract(contract);
              handleAnalyzeContract(contract.id)
}}
            >
              <div><strong>{contract.name}</strong> v{contract.version}</div>
              <div style={{ fontSize: '12px',
  color: '#888' }}>{contract.description}</div>
              <div style={{ fontSize: '12px' }}>
                Risk: {contract.riskClassification.level} |
                Compliance: {contract.compliance.level} |
                AI: {contract.aiUsage.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {analysis && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Contract Analysis</h4>
          <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
            <div>Complexity: {analysis.complexity}</div>
            <div>Risk Score: {analysis.riskScore}/100</div>
            <div>Compliance Score: {analysis.complianceScore}/100</div>
            <div>Performance Score: {analysis.performanceScore}/100</div>
            <div>Security Score: {analysis.securityScore}/100</div>
            <div>Accessibility Score: {analysis.accessibilityScore}/100</div>

            {analysis.recommendations.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <h5>Recommendations:</h5>
                <ul style={{ paddingLeft: '20px' }}>
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} style={{ fontSize: '12px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h4>Improvement Suggestions</h4>
          <div style={{
            maxHeight: '200px',
  overflowY: 'auto',
            background: '#333',
  padding: '10px',
            borderRadius: '4px'
          }}>
            {suggestions.map(suggestion => (
              <div key={suggestion.id} style={{
                padding: '8px',
  background: '#444',
                marginBottom: '8px',
  borderRadius: '4px',
                fontSize: '12px'
              }}>
                <div><strong>{suggestion.title}</strong></div>
                <div>{suggestion.description}</div>
                <div style={{
                  color: suggestion.impact === 'high' ? '#ff4444' :
                         suggestion.impact === 'medium' ? '#ffc107' : '#28a745'
                }}>
                  Impact: {suggestion.impact} | Effort: {suggestion.effort}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
};
