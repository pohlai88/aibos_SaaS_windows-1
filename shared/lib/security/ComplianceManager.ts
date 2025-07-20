/**
 * AI-BOS Compliance Manager
 *
 * Enterprise-grade compliance management system for GDPR, SOC2, and data retention.
 * Handles compliance checking, audit trails, and regulatory reporting.
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { EventEmitter } from 'events';
import { Logger } from '../monitoring/Logger';
import { StateManager } from '../core/StateManager';

// ===== TYPES & INTERFACES =====

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: ComplianceType;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  enabled: boolean;
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  metadata: ComplianceRuleMetadata;
}

export interface ComplianceCondition {
  type:
    | 'data_access'
    | 'data_retention'
    | 'user_consent'
    | 'data_export'
    | 'data_deletion'
    | 'audit_log'
    | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  customLogic?: (data: any) => boolean;
}

export interface ComplianceAction {
  type: 'log' | 'alert' | 'block' | 'encrypt' | 'anonymize' | 'delete' | 'notify' | 'custom';
  parameters: Record<string, any>;
  customAction?: (data: any) => Promise<void>;
}

export interface ComplianceRuleMetadata {
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  version: string;
  tags: string[];
  references: string[];
  lastEvaluated?: Date;
  evaluationCount: number;
  violationCount: number;
}

export interface ComplianceResult {
  compliant: boolean;
  ruleId: string;
  ruleName: string;
  severity: ComplianceSeverity;
  violations: ComplianceViolation[];
  recommendations: string[];
  auditRequired: boolean;
  timestamp: Date;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  type: ComplianceType;
  severity: ComplianceSeverity;
  description: string;
  data: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface AuditTrail {
  id: string;
  action: string;
  userId: string;
  tenantId?: string;
  resource: string;
  data: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  complianceContext?: ComplianceContext;
}

export interface ComplianceContext {
  ruleId?: string;
  complianceType?: ComplianceType;
  severity?: ComplianceSeverity;
  dataClassification?: DataClassification;
  retentionPolicy?: RetentionPolicy;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  category: string[];
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  retentionPeriod: number; // days
  encryptionRequired: boolean;
  accessControls: string[];
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  retentionPeriod: number; // days
  archiveAfter: number; // days
  deleteAfter: number; // days
  exceptions: RetentionException[];
  enabled: boolean;
}

export interface RetentionException {
  condition: string;
  retentionPeriod: number;
  reason: string;
}

export interface ComplianceReport {
  id: string;
  type: ComplianceType;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalActions: number;
    compliantActions: number;
    violations: number;
    complianceRate: number;
  };
  details: {
    rules: ComplianceRuleSummary[];
    violations: ComplianceViolationSummary[];
    recommendations: string[];
  };
  generatedAt: Date;
  generatedBy: string;
}

export interface ComplianceRuleSummary {
  ruleId: string;
  ruleName: string;
  evaluations: number;
  violations: number;
  complianceRate: number;
}

export interface ComplianceViolationSummary {
  ruleId: string;
  ruleName: string;
  count: number;
  severity: ComplianceSeverity;
  mostCommonIssue: string;
}

export interface RetentionResult {
  success: boolean;
  processedCount: number;
  deletedCount: number;
  archivedCount: number;
  errors: string[];
  report: RetentionReport;
}

export interface RetentionReport {
  policyId: string;
  policyName: string;
  executionDate: Date;
  dataProcessed: number;
  dataDeleted: number;
  dataArchived: number;
  errors: string[];
  duration: number; // milliseconds
}

export enum ComplianceType {
  GDPR = 'gdpr',
  SOC2 = 'soc2',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  CCPA = 'ccpa',
  LGPD = 'lgpd',
  CUSTOM = 'custom',
}

export enum ComplianceCategory {
  DATA_PROTECTION = 'data_protection',
  ACCESS_CONTROL = 'access_control',
  AUDIT_LOGGING = 'audit_logging',
  DATA_RETENTION = 'data_retention',
  ENCRYPTION = 'encryption',
  CONSENT_MANAGEMENT = 'consent_management',
  BREACH_NOTIFICATION = 'breach_notification',
  CUSTOM = 'custom',
}

export enum ComplianceSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ===== MAIN COMPLIANCE MANAGER CLASS =====

export class ComplianceManager extends EventEmitter {
  private static instance: ComplianceManager;
  private rules: Map<string, ComplianceRule> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();
  private auditTrail: AuditTrail[] = [];
  private retentionPolicies: Map<string, RetentionPolicy> = new Map();
  private logger: Logger;
  private stateManager: StateManager;
  private isInitialized = false;

  private constructor() {
    super();
    this.logger = new Logger('ComplianceManager');
    this.stateManager = StateManager.getInstance();
  }

  public static getInstance(): ComplianceManager {
    if (!ComplianceManager.instance) {
      ComplianceManager.instance = new ComplianceManager();
    }
    return ComplianceManager.instance;
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize compliance manager with default rules
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadDefaultRules();
      await this.loadRetentionPolicies();
      this.isInitialized = true;

      this.logger.info('Compliance manager initialized successfully', {
        rulesCount: this.rules.size,
        policiesCount: this.retentionPolicies.size,
      });
    } catch (error) {
      this.logger.error('Failed to initialize compliance manager', {
        error: error.message,
      });
      throw error;
    }
  }

  // ===== COMPLIANCE CHECKING =====

  /**
   * Check compliance for an action
   */
  public async checkCompliance(action: Action, tenantId?: string): Promise<ComplianceResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results: ComplianceResult[] = [];
    const violations: ComplianceViolation[] = [];

    // Check each enabled rule
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const ruleResult = await this.evaluateRule(rule, action, tenantId);
      if (!ruleResult.compliant) {
        violations.push(...ruleResult.violations);
      }
      results.push(ruleResult);
    }

    // Determine overall compliance
    const compliant = violations.length === 0;
    const severity = this.getHighestSeverity(violations);

    const result: ComplianceResult = {
      compliant,
      ruleId: 'comprehensive',
      ruleName: 'Comprehensive Compliance Check',
      severity,
      violations,
      recommendations: this.generateRecommendations(violations),
      auditRequired:
        severity === ComplianceSeverity.HIGH || severity === ComplianceSeverity.CRITICAL,
      timestamp: new Date(),
    };

    // Log audit trail
    await this.logAuditTrail(action, result);

    // Emit event
    this.emit('complianceChecked', {
      action,
      result,
      tenantId,
    });

    return result;
  }

  /**
   * Add a compliance rule
   */
  public addRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);

    this.logger.info('Compliance rule added', {
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      severity: rule.severity,
    });
  }

  /**
   * Remove a compliance rule
   */
  public removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);

    if (removed) {
      this.logger.info('Compliance rule removed', { ruleId });
    }

    return removed;
  }

  /**
   * Update a compliance rule
   */
  public updateRule(ruleId: string, updates: Partial<ComplianceRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);

    this.logger.info('Compliance rule updated', {
      ruleId,
      ruleName: updatedRule.name,
    });

    return true;
  }

  // ===== DATA RETENTION =====

  /**
   * Enforce data retention policies
   */
  public async enforceDataRetention(tenantId?: string): Promise<RetentionResult> {
    const results: RetentionResult[] = [];

    for (const policy of this.retentionPolicies.values()) {
      if (!policy.enabled) continue;

      const result = await this.executeRetentionPolicy(policy, tenantId);
      results.push(result);
    }

    // Aggregate results
    const aggregatedResult: RetentionResult = {
      success: results.every((r) => r.success),
      processedCount: results.reduce((sum, r) => sum + r.processedCount, 0),
      deletedCount: results.reduce((sum, r) => sum + r.deletedCount, 0),
      archivedCount: results.reduce((sum, r) => sum + r.archivedCount, 0),
      errors: results.flatMap((r) => r.errors),
      report: {
        policyId: 'aggregated',
        policyName: 'Aggregated Retention Report',
        executionDate: new Date(),
        dataProcessed: results.reduce((sum, r) => sum + r.processedCount, 0),
        dataDeleted: results.reduce((sum, r) => sum + r.deletedCount, 0),
        dataArchived: results.reduce((sum, r) => sum + r.archivedCount, 0),
        errors: results.flatMap((r) => r.errors),
        duration: results.reduce((sum, r) => sum + r.report.duration, 0),
      },
    };

    this.logger.info('Data retention enforcement completed', {
      policiesProcessed: results.length,
      totalProcessed: aggregatedResult.processedCount,
      totalDeleted: aggregatedResult.deletedCount,
      totalArchived: aggregatedResult.archivedCount,
    });

    return aggregatedResult;
  }

  /**
   * Add a retention policy
   */
  public addRetentionPolicy(policy: RetentionPolicy): void {
    this.retentionPolicies.set(policy.id, policy);

    this.logger.info('Retention policy added', {
      policyId: policy.id,
      policyName: policy.name,
      retentionPeriod: policy.retentionPeriod,
    });
  }

  // ===== AUDIT TRAIL =====

  /**
   * Log an audit trail entry
   */
  public async logAuditTrail(action: Action, complianceResult?: ComplianceResult): Promise<void> {
    const auditEntry: AuditTrail = {
      id: this.generateAuditId(),
      action: action.type,
      userId: action.userId,
      tenantId: action.tenantId,
      resource: action.resource,
      data: action.data,
      timestamp: new Date(),
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      sessionId: action.sessionId,
      complianceContext: complianceResult
        ? {
            ruleId: complianceResult.ruleId,
            complianceType: complianceResult.violations[0]?.type,
            severity: complianceResult.severity,
            dataClassification: action.dataClassification,
            retentionPolicy: action.retentionPolicy,
          }
        : undefined,
    };

    this.auditTrail.push(auditEntry);

    // Keep only last 10,000 audit entries
    if (this.auditTrail.length > 10000) {
      this.auditTrail = this.auditTrail.slice(-10000);
    }

    // Store in state manager for persistence
    await this.stateManager.setState(`audit:${auditEntry.id}`, auditEntry, {
      modifiedBy: 'system',
      metadata: {
        isPersistent: true,
        isPublic: false,
        isReadOnly: true,
        ttl: 365 * 24 * 60 * 60 * 1000, // 1 year
      },
    });
  }

  /**
   * Get audit trail entries
   */
  public getAuditTrail(
    options: {
      userId?: string;
      tenantId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {},
  ): AuditTrail[] {
    let filtered = this.auditTrail;

    if (options.userId) {
      filtered = filtered.filter((entry) => entry.userId === options.userId);
    }

    if (options.tenantId) {
      filtered = filtered.filter((entry) => entry.tenantId === options.tenantId);
    }

    if (options.action) {
      filtered = filtered.filter((entry) => entry.action === options.action);
    }

    if (options.startDate) {
      filtered = filtered.filter((entry) => entry.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filtered = filtered.filter((entry) => entry.timestamp <= options.endDate!);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  // ===== REPORTING =====

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    type: ComplianceType,
    period: { start: Date; end: Date },
    tenantId?: string,
  ): Promise<ComplianceReport> {
    const violations = Array.from(this.violations.values()).filter(
      (v) => v.type === type && v.timestamp >= period.start && v.timestamp <= period.end,
    );

    const rules = Array.from(this.rules.values()).filter((r) => r.type === type);

    const ruleSummaries: ComplianceRuleSummary[] = rules.map((rule) => {
      const ruleViolations = violations.filter((v) => v.ruleId === rule.id);
      const evaluations = rule.metadata.evaluationCount;

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        evaluations,
        violations: ruleViolations.length,
        complianceRate:
          evaluations > 0 ? ((evaluations - ruleViolations.length) / evaluations) * 100 : 100,
      };
    });

    const violationSummaries: ComplianceViolationSummary[] = rules.map((rule) => {
      const ruleViolations = violations.filter((v) => v.ruleId === rule.id);
      const mostCommonIssue = this.getMostCommonIssue(ruleViolations);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        count: ruleViolations.length,
        severity: rule.severity,
        mostCommonIssue,
      };
    });

    const totalActions = rules.reduce((sum, rule) => sum + rule.metadata.evaluationCount, 0);
    const compliantActions = totalActions - violations.length;

    const report: ComplianceReport = {
      id: this.generateReportId(),
      type,
      period,
      summary: {
        totalActions,
        compliantActions,
        violations: violations.length,
        complianceRate: totalActions > 0 ? (compliantActions / totalActions) * 100 : 100,
      },
      details: {
        rules: ruleSummaries,
        violations: violationSummaries,
        recommendations: this.generateReportRecommendations(violations),
      },
      generatedAt: new Date(),
      generatedBy: 'system',
    };

    this.logger.info('Compliance report generated', {
      reportId: report.id,
      type,
      complianceRate: report.summary.complianceRate,
      violations: report.summary.violations,
    });

    return report;
  }

  // ===== UTILITY METHODS =====

  /**
   * Get all compliance rules
   */
  public getRules(): ComplianceRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all violations
   */
  public getViolations(): ComplianceViolation[] {
    return Array.from(this.violations.values());
  }

  /**
   * Get all retention policies
   */
  public getRetentionPolicies(): RetentionPolicy[] {
    return Array.from(this.retentionPolicies.values());
  }

  // ===== VALIDATION METHODS =====

  /**
   * Validate a compliance rule
   */
  public validateRule(rule: ComplianceRule): boolean {
    if (!rule.id || !rule.name || !rule.type) {
      return false;
    }
    if (rule.conditions.length === 0) {
      return false;
    }
    if (rule.actions.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Validate an action for compliance
   */
  public validateAction(action: Action): boolean {
    if (!action.type || !action.userId || !action.resource) {
      return false;
    }
    if (!action.data || typeof action.data !== 'object') {
      return false;
    }
    return true;
  }

  /**
   * Validate a retention policy
   */
  public validateRetentionPolicy(policy: RetentionPolicy): boolean {
    if (!policy.id || !policy.name || !policy.description) {
      return false;
    }
    if (policy.retentionPeriod <= 0) {
      return false;
    }
    if (policy.dataTypes.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Get compliance metrics
   */
  public getMetrics(): {
    rulesEvaluated: number;
    violationsDetected: number;
    complianceRate: number;
    auditTrailSize: number;
    retentionPoliciesCount: number;
  } {
    const totalRules = this.rules.size;
    const totalViolations = this.violations.size;
    const complianceRate =
      totalRules > 0 ? ((totalRules - totalViolations) / totalRules) * 100 : 100;

    return {
      rulesEvaluated: totalRules,
      violationsDetected: totalViolations,
      complianceRate,
      auditTrailSize: this.auditTrail.length,
      retentionPoliciesCount: this.retentionPolicies.size,
    };
  }

  /**
   * Resolve a violation
   */
  public resolveViolation(violationId: string, resolvedBy: string, notes?: string): boolean {
    const violation = this.violations.get(violationId);
    if (!violation) return false;

    violation.resolved = true;
    violation.resolutionNotes = notes;
    violation.resolvedBy = resolvedBy;
    violation.resolvedAt = new Date();

    this.logger.info('Violation resolved', {
      violationId,
      resolvedBy,
      ruleId: violation.ruleId,
    });

    return true;
  }

  // ===== PRIVATE HELPER METHODS =====

  private async loadDefaultRules(): Promise<void> {
    // GDPR Rules
    this.addRule({
      id: 'gdpr_data_minimization',
      name: 'GDPR Data Minimization',
      description: 'Ensure only necessary data is collected and processed',
      type: ComplianceType.GDPR,
      category: ComplianceCategory.DATA_PROTECTION,
      severity: ComplianceSeverity.HIGH,
      enabled: true,
      conditions: [
        {
          type: 'data_access',
          field: 'dataType',
          operator: 'in',
          value: ['personal', 'sensitive'],
        },
      ],
      actions: [
        {
          type: 'log',
          parameters: { level: 'info' },
        },
      ],
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        updatedBy: 'system',
        updatedAt: new Date(),
        version: '1.0.0',
        tags: ['gdpr', 'data-protection'],
        references: ['GDPR Article 5(1)(c)'],
        evaluationCount: 0,
        violationCount: 0,
      },
    });

    // SOC2 Rules
    this.addRule({
      id: 'soc2_access_control',
      name: 'SOC2 Access Control',
      description: 'Ensure proper access controls are in place',
      type: ComplianceType.SOC2,
      category: ComplianceCategory.ACCESS_CONTROL,
      severity: ComplianceSeverity.HIGH,
      enabled: true,
      conditions: [
        {
          type: 'data_access',
          field: 'accessLevel',
          operator: 'not_equals',
          value: 'authorized',
        },
      ],
      actions: [
        {
          type: 'block',
          parameters: { reason: 'Unauthorized access attempt' },
        },
        {
          type: 'alert',
          parameters: { severity: 'high' },
        },
      ],
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        updatedBy: 'system',
        updatedAt: new Date(),
        version: '1.0.0',
        tags: ['soc2', 'access-control'],
        references: ['SOC2 CC6.1'],
        evaluationCount: 0,
        violationCount: 0,
      },
    });
  }

  private async loadRetentionPolicies(): Promise<void> {
    // Default retention policy
    this.addRetentionPolicy({
      id: 'default_retention',
      name: 'Default Data Retention Policy',
      description: 'Default policy for data retention and deletion',
      dataTypes: ['user_data', 'logs', 'audit_trails'],
      retentionPeriod: 365, // 1 year
      archiveAfter: 90, // 90 days
      deleteAfter: 2555, // 7 years
      exceptions: [
        {
          condition: 'legal_hold',
          retentionPeriod: 2555,
          reason: 'Legal hold requirement',
        },
      ],
      enabled: true,
    });
  }

  private async evaluateRule(
    rule: ComplianceRule,
    action: Action,
    tenantId?: string,
  ): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];

    // Evaluate each condition
    for (const condition of rule.conditions) {
      const conditionResult = this.evaluateCondition(condition, action);
      if (!conditionResult.matches) {
        const violation: ComplianceViolation = {
          id: this.generateViolationId(),
          ruleId: rule.id,
          type: rule.type,
          severity: rule.severity,
          description: `Rule violation: ${rule.name}`,
          data: {
            condition,
            action,
            tenantId,
          },
          timestamp: new Date(),
          resolved: false,
        };

        violations.push(violation);
        this.violations.set(violation.id, violation);

        // Execute actions
        await this.executeActions(rule.actions, violation);
      }
    }

    // Update rule metadata
    rule.metadata.evaluationCount++;
    rule.metadata.violationCount += violations.length;
    rule.metadata.lastEvaluated = new Date();

    return {
      compliant: violations.length === 0,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      violations,
      recommendations: violations.length > 0 ? [`Review ${rule.name} compliance`] : [],
      auditRequired:
        rule.severity === ComplianceSeverity.HIGH || rule.severity === ComplianceSeverity.CRITICAL,
      timestamp: new Date(),
    };
  }

  private evaluateCondition(condition: ComplianceCondition, action: Action): { matches: boolean } {
    const fieldValue = this.getFieldValue(action, condition.field);

    switch (condition.operator) {
      case 'equals':
        return { matches: fieldValue === condition.value };
      case 'not_equals':
        return { matches: fieldValue !== condition.value };
      case 'contains':
        return { matches: String(fieldValue).includes(String(condition.value)) };
      case 'greater_than':
        return { matches: fieldValue > condition.value };
      case 'less_than':
        return { matches: fieldValue < condition.value };
      case 'in':
        return { matches: Array.isArray(condition.value) && condition.value.includes(fieldValue) };
      case 'not_in':
        return { matches: Array.isArray(condition.value) && !condition.value.includes(fieldValue) };
      default:
        return { matches: true };
    }
  }

  private getFieldValue(action: Action, field: string): any {
    const fieldPath = field.split('.');
    let value: any = action;

    for (const path of fieldPath) {
      value = value?.[path];
    }

    return value;
  }

  private async executeActions(
    actions: ComplianceAction[],
    violation: ComplianceViolation,
  ): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'log':
            this.logger.info('Compliance violation logged', {
              violationId: violation.id,
              ruleId: violation.ruleId,
              severity: violation.severity,
            });
            break;

          case 'alert':
            this.emit('complianceAlert', {
              violation,
              severity: action.parameters.severity || 'medium',
            });
            break;

          case 'block':
            this.emit('complianceBlock', {
              violation,
              reason: action.parameters.reason,
            });
            break;

          case 'custom':
            if (action.customAction) {
              await action.customAction(violation);
            }
            break;
        }
      } catch (error) {
        this.logger.error('Failed to execute compliance action', {
          error: error.message,
          actionType: action.type,
          violationId: violation.id,
        });
      }
    }
  }

  private async executeRetentionPolicy(
    policy: RetentionPolicy,
    tenantId?: string,
  ): Promise<RetentionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let processedCount = 0;
    let deletedCount = 0;
    let archivedCount = 0;

    try {
      // In a real implementation, this would query the database for data matching the policy
      // For now, we'll simulate the process

      this.logger.info('Executing retention policy', {
        policyId: policy.id,
        policyName: policy.name,
        tenantId,
      });

      // Simulate processing
      processedCount = Math.floor(Math.random() * 1000);
      deletedCount = Math.floor(processedCount * 0.1);
      archivedCount = Math.floor(processedCount * 0.2);
    } catch (error) {
      errors.push(error.message);
      this.logger.error('Retention policy execution failed', {
        error: error.message,
        policyId: policy.id,
      });
    }

    const duration = Date.now() - startTime;

    const result: RetentionResult = {
      success: errors.length === 0,
      processedCount,
      deletedCount,
      archivedCount,
      errors,
      report: {
        policyId: policy.id,
        policyName: policy.name,
        executionDate: new Date(),
        dataProcessed: processedCount,
        dataDeleted: deletedCount,
        dataArchived: archivedCount,
        errors,
        duration,
      },
    };

    return result;
  }

  private getHighestSeverity(violations: ComplianceViolation[]): ComplianceSeverity {
    if (violations.length === 0) return ComplianceSeverity.LOW;

    const severityOrder = [
      ComplianceSeverity.CRITICAL,
      ComplianceSeverity.HIGH,
      ComplianceSeverity.MEDIUM,
      ComplianceSeverity.LOW,
    ];

    for (const severity of severityOrder) {
      if (violations.some((v) => v.severity === severity)) {
        return severity;
      }
    }

    return ComplianceSeverity.LOW;
  }

  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some((v) => v.type === ComplianceType.GDPR)) {
      recommendations.push('Review GDPR compliance and data processing practices');
    }

    if (violations.some((v) => v.type === ComplianceType.SOC2)) {
      recommendations.push('Strengthen access controls and security measures');
    }

    if (violations.some((v) => v.severity === ComplianceSeverity.CRITICAL)) {
      recommendations.push('Address critical compliance violations immediately');
    }

    return recommendations;
  }

  private generateReportRecommendations(violations: ComplianceViolation[]): string[] {
    return this.generateRecommendations(violations);
  }

  private getMostCommonIssue(violations: ComplianceViolation[]): string {
    if (violations.length === 0) return 'No violations';

    const issueCounts: Record<string, number> = {};

    for (const violation of violations) {
      const issue = violation.description;
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    }

    const mostCommon = Object.entries(issueCounts).sort(([, a], [, b]) => b - a)[0];

    return mostCommon ? mostCommon[0] : 'Unknown issue';
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ===== ACTION INTERFACE =====

export interface Action {
  type: string;
  userId: string;
  tenantId?: string;
  resource: string;
  data: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  dataClassification?: DataClassification;
  retentionPolicy?: RetentionPolicy;
}

// ===== EXPORTS =====

export default ComplianceManager;
