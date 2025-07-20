import { createClient, SupabaseClient } from '@supabase/supabase-js';

// KPMG Doorkeeper Interfaces
export interface DoorkeeperValidation {
  id: string;
  transaction_id: string;
  validation_type: DoorkeeperValidationType;
  kpmg_standard: KPMGStandard;
  validationStatus: ValidationStatus;
  risk_level: RiskLevel;
  compliance_score: number;
  audit_notes: string[];
  recommendations: string[];
  kpmg_reference: string;
  validated_at: string;
  validated_by: string;
  createdAt: string;
}

export enum DoorkeeperValidationType {
  TRANSACTION_ENTRY = 'transaction_entry',
  JOURNAL_POSTING = 'journal_posting',
  ACCOUNT_RECONCILIATION = 'account_reconciliation',
  FINANCIAL_STATEMENT = 'financial_statement',
  TAX_CALCULATION = 'tax_calculation',
  REVENUE_RECOGNITION = 'revenue_recognition',
  EXPENSE_ALLOCATION = 'expense_allocation',
  INTERCOMPANY_TRANSACTION = 'intercompany_transaction',
  RELATED_PARTY_TRANSACTION = 'related_party_transaction',
  ASSET_VALUATION = 'asset_valuation',
  LIABILITY_MEASUREMENT = 'liability_measurement',
  DISCLOSURE_REQUIREMENT = 'disclosure_requirement'
}

export enum KPMGStandard {
  AUDIT_QUALITY = 'audit_quality',
  FINANCIAL_REPORTING = 'financial_reporting',
  INTERNAL_CONTROLS = 'internal_controls',
  RISK_MANAGEMENT = 'risk_management',
  COMPLIANCE_FRAMEWORK = 'compliance_framework',
  GOVERNANCE = 'governance',
  ETHICS = 'ethics',
  SUSTAINABILITY = 'sustainability'
}

export enum ValidationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  WARNING = 'warning',
  REQUIRES_REVIEW = 'requires_review',
  PENDING = 'pending'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface KPMGAuditChecklist {
  id: string;
  checklist_name: string;
  kpmg_standard: KPMGStandard;
  checklist_items: AuditChecklistItem[];
  risk_weighting: number;
  is_mandatory: boolean;
  createdAt: string;
}

export interface AuditChecklistItem {
  id: string;
  item_code: string;
  description: string;
  kpmg_requirement: string;
  validation_logic: string;
  risk_level: RiskLevel;
  is_critical: boolean;
  evidence_required: string[];
  sample_size_requirement?: number;
}

export interface DoorkeeperReport {
  id: string;
  organizationId: string;
  report_period: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  overall_compliance_score: number;
  risk_assessment: RiskAssessment;
  audit_readiness_score: number;
  kpmg_standards_coverage: KPMGStandardCoverage[];
  critical_issues: CriticalIssue[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}

export interface RiskAssessment {
  overall_risk_level: RiskLevel;
  risk_factors: RiskFactor[];
  risk_score: number;
  risk_trend: 'improving' | 'stable' | 'deteriorating';
}

export interface RiskFactor {
  factor_name: string;
  risk_level: RiskLevel;
  impact_score: number;
  likelihood_score: number;
  mitigation_actions: string[];
}

export interface KPMGStandardCoverage {
  standard: KPMGStandard;
  coverage_percentage: number;
  compliance_score: number;
  validation_count: number;
  issues_count: number;
}

export interface CriticalIssue {
  id: string;
  issue_type: string;
  description: string;
  risk_level: RiskLevel;
  affected_areas: string[];
  kpmg_impact: string;
  recommended_actions: string[];
  deadline: string;
  assigned_to: string;
}

export interface DoorkeeperSettings {
  organizationId: string;
  auto_validation_enabled: boolean;
  critical_issue_alerts: boolean;
  kpmg_standards_enabled: KPMGStandard[];
  risk_thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  notification_settings: {
    email_alerts: boolean;
    dashboard_alerts: boolean;
    sms_alerts: boolean;
  };
  audit_trail_retention_days: number;
}

export class KPMGDoorkeeperService {
  private supabase: SupabaseClient;
  private settings: DoorkeeperSettings;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.settings = this.getDefaultSettings();
  }

  /**
   * Validate transaction entry against KPMG standards
   */
  async validateTransactionEntry(transaction: any): Promise<DoorkeeperValidation> {
    const validation: DoorkeeperValidation = {
      id: crypto.randomUUID(),
      transaction_id: transaction.id,
      validation_type: DoorkeeperValidationType.TRANSACTION_ENTRY,
      kpmg_standard: KPMGStandard.FINANCIAL_REPORTING,
      validationStatus: ValidationStatus.PENDING,
      risk_level: RiskLevel.LOW,
      compliance_score: 0,
      audit_notes: [],
      recommendations: [],
      kpmg_reference: '',
      validated_at: new Date().toISOString(),
      validated_by: 'system',
      createdAt: new Date().toISOString()
    };

    // KPMG Audit Checklist Validation
    const checklist = await this.getAuditChecklist(KPMGStandard.FINANCIAL_REPORTING);
    const results = await this.runAuditChecklist(transaction, checklist);

    validation.validationStatus = results.passed ? "passed" : "failed";
    validation.compliance_score = results.complianceScore;
    validation.risk_level = this.calculateRiskLevel(results.issues);
    validation.audit_notes = results.auditNotes;
    validation.recommendations = results.recommendations;
    validation.kpmg_reference = `KPMG-AUDIT-${Date.now()}`;

    // Store validation result
    await this.storeValidation(validation);

    return validation;
  }

  /**
   * Validate journal posting against KPMG internal controls
   */
  async validateJournalPosting(journalEntry: any): Promise<DoorkeeperValidation> {
    const validation: DoorkeeperValidation = {
      id: crypto.randomUUID(),
      transaction_id: journalEntry.id,
      validation_type: DoorkeeperValidationType.JOURNAL_POSTING,
      kpmg_standard: KPMGStandard.INTERNAL_CONTROLS,
      validationStatus: ValidationStatus.PENDING,
      risk_level: RiskLevel.LOW,
      compliance_score: 0,
      audit_notes: [],
      recommendations: [],
      kpmg_reference: '',
      validated_at: new Date().toISOString(),
      validated_by: 'system',
      createdAt: new Date().toISOString()
    };

    // KPMG Internal Controls Checklist
    const checklist = await this.getAuditChecklist(KPMGStandard.INTERNAL_CONTROLS);
    const results = await this.runAuditChecklist(journalEntry, checklist);

    validation.validationStatus = results.passed ? "passed" : "failed";
    validation.compliance_score = results.complianceScore;
    validation.risk_level = this.calculateRiskLevel(results.issues);
    validation.audit_notes = results.auditNotes;
    validation.recommendations = results.recommendations;
    validation.kpmg_reference = `KPMG-IC-${Date.now()}`;

    await this.storeValidation(validation);
    return validation;
  }

  /**
   * Validate account reconciliation against KPMG audit standards
   */
  async validateAccountReconciliation(reconciliation: any): Promise<DoorkeeperValidation> {
    const validation: DoorkeeperValidation = {
      id: crypto.randomUUID(),
      transaction_id: reconciliation.id,
      validation_type: DoorkeeperValidationType.ACCOUNT_RECONCILIATION,
      kpmg_standard: KPMGStandard.AUDIT_QUALITY,
      validationStatus: ValidationStatus.PENDING,
      risk_level: RiskLevel.LOW,
      compliance_score: 0,
      audit_notes: [],
      recommendations: [],
      kpmg_reference: '',
      validated_at: new Date().toISOString(),
      validated_by: 'system',
      createdAt: new Date().toISOString()
    };

    // KPMG Audit Quality Checklist
    const checklist = await this.getAuditChecklist(KPMGStandard.AUDIT_QUALITY);
    const results = await this.runAuditChecklist(reconciliation, checklist);

    validation.validationStatus = results.passed ? "passed" : "failed";
    validation.compliance_score = results.complianceScore;
    validation.risk_level = this.calculateRiskLevel(results.issues);
    validation.audit_notes = results.auditNotes;
    validation.recommendations = results.recommendations;
    validation.kpmg_reference = `KPMG-AQ-${Date.now()}`;

    await this.storeValidation(validation);
    return validation;
  }

  /**
   * Generate comprehensive Doorkeeper report
   */
  async generateDoorkeeperReport(
    organizationId: string,
    period: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  ): Promise<DoorkeeperReport> {
    try {
      // Get all validations for the period
      const { data: validations } = await this.supabase
        .from('doorkeeper_validations')
        .select('*')
        .eq('organizationId', organizationId)
        .gte('createdAt', this.getPeriodStart(period, reportType))
        .lte('createdAt', this.getPeriodEnd(period, reportType));

      // Calculate overall compliance score
      const overallComplianceScore = this.calculateOverallCompliance(validations || []);

      // Assess risks
      const riskAssessment = this.assessRisks(validations || []);

      // Calculate audit readiness score
      const auditReadinessScore = this.calculateAuditReadiness(validations || []);

      // Analyze KPMG standards coverage
      const standardsCoverage = this.analyzeStandardsCoverage(validations || []);

      // Identify critical issues
      const criticalIssues = this.identifyCriticalIssues(validations || []);

      // Generate recommendations
      const recommendations = this.generateRecommendations(validations || []);

      const report: DoorkeeperReport = {
        id: crypto.randomUUID(),
        organizationId: organizationId,
        report_period: period,
        report_type: reportType,
        overall_compliance_score: overallComplianceScore,
        risk_assessment: riskAssessment,
        audit_readiness_score: auditReadinessScore,
        kpmg_standards_coverage: standardsCoverage,
        critical_issues: criticalIssues,
        recommendations,
        generated_at: new Date().toISOString(),
        generated_by: 'system'
      };

      // Store report
      await this.supabase
        .from('doorkeeper_reports')
        .insert(report);

      return report;
    } catch (error) {
      throw new Error(`Error generating Doorkeeper report: ${error}`);
    }
  }

  /**
   * Get KPMG audit checklist for a standard
   */
  async getAuditChecklist(standard: KPMGStandard): Promise<KPMGAuditChecklist> {
    // In practice, this would fetch from database
    const checklists: Record<KPMGStandard, KPMGAuditChecklist> = {
      [KPMGStandard.FINANCIAL_REPORTING]: {
        id: '1',
        checklist_name: 'Financial Reporting Compliance',
        kpmg_standard: KPMGStandard.FINANCIAL_REPORTING,
        checklist_items: [
          {
            id: '1',
            item_code: 'FR001',
            description: 'Transaction classification accuracy',
            kpmg_requirement: 'All transactions must be properly classified according to MFRS standards',
            validation_logic: 'account_classification_check',
            risk_level: RiskLevel.HIGH,
            is_critical: true,
            evidence_required: ['account_mapping', 'classification_rationale']
          },
          {
            id: '2',
            item_code: 'FR002',
            description: 'Amount accuracy and completeness',
            kpmg_requirement: 'All amounts must be accurate and complete',
            validation_logic: 'amount_validation_check',
            risk_level: RiskLevel.CRITICAL,
            is_critical: true,
            evidence_required: ['source_documents', 'calculation_evidence']
          }
        ],
        risk_weighting: 0.4,
        is_mandatory: true,
        createdAt: new Date().toISOString()
      },
      [KPMGStandard.INTERNAL_CONTROLS]: {
        id: '2',
        checklist_name: 'Internal Controls Validation',
        kpmg_standard: KPMGStandard.INTERNAL_CONTROLS,
        checklist_items: [
          {
            id: '3',
            item_code: 'IC001',
            description: 'Segregation of duties',
            kpmg_requirement: 'Proper segregation of duties must be maintained',
            validation_logic: 'segregation_check',
            risk_level: RiskLevel.HIGH,
            is_critical: true,
            evidence_required: ['user_roles', 'approval_chain']
          }
        ],
        risk_weighting: 0.3,
        is_mandatory: true,
        createdAt: new Date().toISOString()
      },
      [KPMGStandard.AUDIT_QUALITY]: {
        id: '3',
        checklist_name: 'Audit Quality Standards',
        kpmg_standard: KPMGStandard.AUDIT_QUALITY,
        checklist_items: [
          {
            id: '4',
            item_code: 'AQ001',
            description: 'Reconciliation accuracy',
            kpmg_requirement: 'All reconciliations must be accurate and complete',
            validation_logic: 'reconciliation_check',
            risk_level: RiskLevel.CRITICAL,
            is_critical: true,
            evidence_required: ['reconciliation_document', 'variance_analysis']
          }
        ],
        risk_weighting: 0.3,
        is_mandatory: true,
        createdAt: new Date().toISOString()
      }
    } as Record<KPMGStandard, KPMGAuditChecklist>;

    return checklists[standard];
  }

  /**
   * Run audit checklist against data
   */
  private async runAuditChecklist(data: any, checklist: KPMGAuditChecklist): Promise<{
    passed: boolean;
    complianceScore: number;
    issues: string[];
    auditNotes: string[];
    recommendations: string[];
  }> {
    let passed = true;
    let totalScore = 0;
    let maxScore = 0;
    const issues: string[] = [];
    const auditNotes: string[] = [];
    const recommendations: string[] = [];

    for (const item of checklist.checklist_items) {
      const itemScore = await this.validateChecklistItem(data, item);
      const maxItemScore = item.is_critical ? 100 : 50;
      
      totalScore += itemScore;
      maxScore += maxItemScore;

      if (itemScore < maxItemScore) {
        passed = false;
        issues.push(`${item.item_code}: ${item.description}`);
        auditNotes.push(`KPMG Requirement: ${item.kpmg_requirement}`);
        recommendations.push(`Address ${item.description} to meet KPMG standards`);
      }
    }

    const complianceScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;

    return {
      passed,
      complianceScore,
      issues,
      auditNotes,
      recommendations
    };
  }

  /**
   * Validate individual checklist item
   */
  private async validateChecklistItem(data: any, item: AuditChecklistItem): Promise<number> {
    switch (item.validation_logic) {
      case 'account_classification_check':
        return this.validateAccountClassification(data);
      case 'amount_validation_check':
        return this.validateAmountAccuracy(data);
      case 'segregation_check':
        return this.validateSegregationOfDuties(data);
      case 'reconciliation_check':
        return this.validateReconciliation(data);
      default:
        return 100; // Default pass
    }
  }

  // Validation methods
  private validateAccountClassification(data: any): number {
    // Check if account classification is proper
    if (data.account_code && data.account_name) {
      return 100;
    }
    return 0;
  }

  private validateAmountAccuracy(data: any): number {
    // Check if amounts are accurate
    if (data.amount && data.amount > 0) {
      return 100;
    }
    return 0;
  }

  private validateSegregationOfDuties(data: any): number {
    // Check segregation of duties
    if (data.created_by !== data.approved_by) {
      return 100;
    }
    return 50; // Partial score for same user
  }

  private validateReconciliation(data: any): number {
    // Check reconciliation accuracy
    if (data.reconciled && data.variance === 0) {
      return 100;
    }
    return 75; // Partial score if reconciled but has variance
  }

  // Helper methods
  private calculateRiskLevel(issues: string[]): RiskLevel {
    if (issues.length === 0) return RiskLevel.LOW;
    if (issues.length <= 2) return RiskLevel.MEDIUM;
    if (issues.length <= 5) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  private calculateOverallCompliance(validations: DoorkeeperValidation[]): number {
    if (validations.length === 0) return 100;
    const totalScore = validations.reduce((sum, v) => sum + v.compliance_score, 0);
    return totalScore / validations.length;
  }

  private assessRisks(validations: DoorkeeperValidation[]): RiskAssessment {
    const riskFactors: RiskFactor[] = [];
    let overallRiskScore = 0;

    // Analyze validation failures
    const failedValidations = validations.filter(v => v.validationStatus === "failed");
    if (failedValidations.length > 0) {
      riskFactors.push({
        factor_name: 'Validation Failures',
        risk_level: RiskLevel.HIGH,
        impact_score: 8,
        likelihood_score: 6,
        mitigation_actions: ['Review failed validations', 'Implement corrective actions']
      });
      overallRiskScore += 7;
    }

    // Analyze high-risk validations
    const highRiskValidations = validations.filter(v => v.risk_level === RiskLevel.HIGH || v.risk_level === RiskLevel.CRITICAL);
    if (highRiskValidations.length > 0) {
      riskFactors.push({
        factor_name: 'High-Risk Transactions',
        risk_level: RiskLevel.MEDIUM,
        impact_score: 6,
        likelihood_score: 4,
        mitigation_actions: ['Review high-risk transactions', 'Implement additional controls']
      });
      overallRiskScore += 5;
    }

    const overallRiskLevel = overallRiskScore <= 3 ? RiskLevel.LOW : 
                            overallRiskScore <= 6 ? RiskLevel.MEDIUM :
                            overallRiskScore <= 9 ? RiskLevel.HIGH : RiskLevel.CRITICAL;

    return {
      overall_risk_level: overallRiskLevel,
      risk_factors: riskFactors,
      risk_score: overallRiskScore,
      risk_trend: 'stable' // In practice, this would be calculated from historical data
    };
  }

  private calculateAuditReadiness(validations: DoorkeeperValidation[]): number {
    if (validations.length === 0) return 100;
    
    const passedValidations = validations.filter(v => v.validationStatus === "passed");
    const criticalValidations = validations.filter(v => v.risk_level === RiskLevel.CRITICAL);
    const passedCritical = criticalValidations.filter(v => v.validationStatus === "passed");

    const overallPassRate = (passedValidations.length / validations.length) * 100;
    const criticalPassRate = criticalValidations.length > 0 ? 
      (passedCritical.length / criticalValidations.length) * 100 : 100;

    // Weight critical validations more heavily
    return (overallPassRate * 0.6) + (criticalPassRate * 0.4);
  }

  private analyzeStandardsCoverage(validations: DoorkeeperValidation[]): KPMGStandardCoverage[] {
    const standards = Object.values(KPMGStandard);
    return standards.map(standard => {
      const standardValidations = validations.filter(v => v.kpmg_standard === standard);
      const issues = standardValidations.filter(v => v.validationStatus === "failed");
      
      return {
        standard,
        coverage_percentage: standardValidations.length > 0 ? 100 : 0,
        compliance_score: standardValidations.length > 0 ? 
          standardValidations.reduce((sum, v) => sum + v.compliance_score, 0) / standardValidations.length : 100,
        validation_count: standardValidations.length,
        issues_count: issues.length
      };
    });
  }

  private identifyCriticalIssues(validations: DoorkeeperValidation[]): CriticalIssue[] {
    const criticalValidations = validations.filter(v => 
      v.risk_level === RiskLevel.CRITICAL && v.validationStatus === "failed"
    );

    return criticalValidations.map(v => ({
      id: crypto.randomUUID(),
      issue_type: v.validation_type,
      description: `Critical validation failure: ${v.audit_notes.join(', ')}`,
      risk_level: v.risk_level,
      affected_areas: [v.validation_type],
      kpmg_impact: 'High impact on audit opinion',
      recommended_actions: v.recommendations,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      assigned_to: 'accounting_manager'
    }));
  }

  private generateRecommendations(validations: DoorkeeperValidation[]): string[] {
    const recommendations: string[] = [];
    
    const failedValidations = validations.filter(v => v.validationStatus === "failed");
    if (failedValidations.length > 0) {
      recommendations.push(`Address ${failedValidations.length} failed validations to improve compliance`);
    }

    const highRiskValidations = validations.filter(v => v.risk_level === RiskLevel.HIGH || v.risk_level === RiskLevel.CRITICAL);
    if (highRiskValidations.length > 0) {
      recommendations.push(`Review ${highRiskValidations.length} high-risk transactions for audit readiness`);
    }

    const avgCompliance = this.calculateOverallCompliance(validations);
    if (avgCompliance < 90) {
      recommendations.push('Implement additional controls to improve overall compliance score');
    }

    return recommendations;
  }

  private getDefaultSettings(): DoorkeeperSettings {
    return {
      organizationId: '',
      auto_validation_enabled: true,
      critical_issue_alerts: true,
      kpmg_standards_enabled: Object.values(KPMGStandard),
      risk_thresholds: {
        low: 0,
        medium: 25,
        high: 50,
        critical: 75
      },
      notification_settings: {
        email_alerts: true,
        dashboard_alerts: true,
        sms_alerts: false
      },
      audit_trail_retention_days: 2555 // 7 years
    };
  }

  private getPeriodStart(period: string, reportType: string): string {
    const date = new Date(period);
    switch (reportType) {
      case 'daily': return date.toISOString();
      case 'weekly': return new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly': return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      case 'quarterly': return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1).toISOString();
      case 'annual': return new Date(date.getFullYear(), 0, 1).toISOString();
      default: return date.toISOString();
    }
  }

  private getPeriodEnd(period: string, reportType: string): string {
    const date = new Date(period);
    switch (reportType) {
      case 'daily': return date.toISOString();
      case 'weekly': return date.toISOString();
      case 'monthly': return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
      case 'quarterly': return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 0).toISOString();
      case 'annual': return new Date(date.getFullYear(), 11, 31).toISOString();
      default: return date.toISOString();
    }
  }

  private async storeValidation(validation: DoorkeeperValidation): Promise<void> {
    try {
      await this.supabase
        .from('doorkeeper_validations')
        .insert(validation);
    } catch (error) {
      console.error('Error storing validation:', error);
    }
  }
}

export default KPMGDoorkeeperService; 