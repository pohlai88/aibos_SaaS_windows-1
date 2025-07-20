import { SupabaseClient } from '@supabase/supabase-js';
import { Decimal } from 'decimal.js';
import { EventEmitter } from 'events';
import { 
  EnterpriseTaxCalculationService, 
  EnterpriseTaxCalculationRequest,
  EnterpriseTaxCalculationResult,
  TaxExemption,
  TaxLocation,
  ValidationLevel,
  CalculationStatus,
  ComplianceStatus
} from './tax-calculation-enterprise';

// ===== TAX INTEGRATION TYPE DEFINITIONS =====

export interface InvoiceTaxIntegration {
  invoice_id: string;
  organization_id: string;
  tax_calculations: LineItemTaxCalculation[];
  total_tax_summary: TaxSummary;
  compliance_status: ComplianceStatus;
  validation_results: TaxValidationResult[];
  audit_trail_id: string;
  calculated_at: Date;
  calculated_by: string;
  approval_status?: string;
  recalculation_required: boolean;
}

export interface BillTaxIntegration {
  bill_id: string;
  organization_id: string;
  tax_calculations: LineItemTaxCalculation[];
  total_tax_summary: TaxSummary;
  compliance_status: ComplianceStatus;
  validation_results: TaxValidationResult[];
  audit_trail_id: string;
  calculated_at: Date;
  calculated_by: string;
  approval_status?: string;
  recalculation_required: boolean;
}

export interface LineItemTaxCalculation {
  line_id: string;
  line_description: string;
  base_amount: Decimal;
  tax_code_id: string;
  tax_code_name: string;
  calculation_result: EnterpriseTaxCalculationResult;
  exemptions_applied: AppliedExemption[];
  compliance_notes?: string;
}

export interface TaxSummary {
  total_base_amount: Decimal;
  total_taxable_amount: Decimal;
  total_tax_amount: Decimal;
  total_amount: Decimal;
  effective_tax_rate: Decimal;
  currency: string;
  tax_breakdown: TaxBreakdownSummary[];
  exemption_summary: ExemptionSummary;
  jurisdiction_summary: JurisdictionSummary[];
}

export interface TaxBreakdownSummary {
  tax_type: string;
  tax_name: string;
  jurisdiction: string;
  rate: Decimal;
  taxable_amount: Decimal;
  tax_amount: Decimal;
  line_items: string[];
}

export interface ExemptionSummary {
  total_exemptions: number;
  total_exempted_amount: Decimal;
  exemptions_by_type: Record<string, number>;
  certificate_count: number;
  expiring_certificates: ExpiringCertificate[];
}

export interface JurisdictionSummary {
  jurisdiction_id: string;
  jurisdiction_name: string;
  total_taxable_amount: Decimal;
  total_tax_amount: Decimal;
  compliance_status: ComplianceStatus;
  rates_used: string[];
}

export interface AppliedExemption {
  exemption_id: string;
  exemption_code: string;
  exemption_name: string;
  amount_exempted: Decimal;
  certificate_number?: string;
  expiry_date?: Date;
  validation_status: string;
}

export interface TaxValidationResult {
  line_id?: string;
  rule_name: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggested_action?: string;
  auto_correctable: boolean;
}

export interface ExpiringCertificate {
  exemption_id: string;
  certificate_number: string;
  expiry_date: Date;
  days_until_expiry: number;
  line_items_affected: string[];
}

export interface TaxRecalculationTrigger {
  trigger_type: 'AMOUNT_CHANGE' | 'TAX_CODE_CHANGE' | 'LOCATION_CHANGE' | 'EXEMPTION_CHANGE' | 'RATE_UPDATE';
  old_value?: any;
  new_value?: any;
  affected_lines: string[];
  requires_approval: boolean;
  confidence_level: number;
}

export interface TaxComplianceAlert {
  id: string;
  type: 'NON_COMPLIANCE' | 'RATE_CHANGE' | 'EXEMPTION_EXPIRY' | 'VALIDATION_FAILURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  affected_transactions: string[];
  jurisdiction: string;
  action_required: string;
  deadline?: Date;
  auto_resolvable: boolean;
}

// ===== ENTERPRISE TAX INTEGRATION SERVICE =====

export class EnterpriseTaxIntegrationService extends EventEmitter {
  private taxCalculationService: EnterpriseTaxCalculationService;
  private supabase: SupabaseClient;
  private cache: Map<string, any> = new Map();

  constructor(supabase: SupabaseClient) {
    super();
    this.supabase = supabase;
    this.taxCalculationService = new EnterpriseTaxCalculationService(supabase);
    
    // Set up event listeners for tax calculation service
    this.setupTaxCalculationListeners();
  }

  // ===== INVOICE TAX INTEGRATION =====

  async calculateInvoiceTax(
    invoiceId: string,
    organizationId: string,
    lines: Array<{
      id: string;
      description: string;
      amount: Decimal;
      tax_code_id: string;
      exemptions?: TaxExemption[];
    }>,
    invoiceData: {
      currency: string;
      invoice_date: Date;
      customer_location?: TaxLocation;
      customer_exemptions?: TaxExemption[];
      is_tax_inclusive?: boolean;
      validation_level?: ValidationLevel;
      approval_required?: boolean;
    }
  ): Promise<InvoiceTaxIntegration> {
    const startTime = Date.now();

    try {
      // Prepare tax calculation requests for each line
      const lineCalculationPromises = lines.map(async (line) => {
        const request: EnterpriseTaxCalculationRequest = {
          organizationId: organizationId,
          transactionId: line.id,
          amount: line.amount,
          taxCodeId: line.tax_code_id,
          calculationDate: invoiceData.invoice_date,
          currency: invoiceData.currency,
          isTaxInclusive: invoiceData.is_tax_inclusive || false,
          exemptions: this.combineExemptions(line.exemptions, invoiceData.customer_exemptions),
          location: invoiceData.customer_location,
          validationLevel: invoiceData.validation_level || ValidationLevel.COMPREHENSIVE,
          approvalRequired: invoiceData.approval_required || false,
          auditTrailEnabled: true,
          metadata: {
            transaction_type: 'INVOICE',
            invoice_id: invoiceId,
            line_description: line.description
          }
        };

        const result = await this.taxCalculationService.calculateTax(request);

        return {
          line_id: line.id,
          line_description: line.description,
          base_amount: line.amount,
          tax_code_id: line.tax_code_id,
          tax_code_name: await this.getTaxCodeName(line.tax_code_id),
          calculation_result: result,
          exemptions_applied: this.mapExemptionsToApplied(result.calculationDetails.exemptionsApplied),
          compliance_notes: this.generateComplianceNotes(result)
        } as LineItemTaxCalculation;
      });

      const lineCalculations = await Promise.all(lineCalculationPromises);

      // Generate summary
      const totalSummary = this.generateTaxSummary(lineCalculations, invoiceData.currency);

      // Determine overall compliance status
      const overallCompliance = this.determineOverallCompliance(lineCalculations);

      // Aggregate validation results
      const allValidationResults = this.aggregateValidationResults(lineCalculations);

      // Check for recalculation requirements
      const recalculationRequired = this.checkRecalculationRequired(lineCalculations);

      // Create audit trail entry
      const auditTrailId = await this.createTaxAuditTrail({
        transaction_type: 'INVOICE',
        transaction_id: invoiceId,
        organization_id: organizationId,
        calculation_summary: totalSummary,
        calculation_time_ms: Date.now() - startTime,
        line_count: lines.length
      });

      const integration: InvoiceTaxIntegration = {
        invoice_id: invoiceId,
        organization_id: organizationId,
        tax_calculations: lineCalculations,
        total_tax_summary: totalSummary,
        compliance_status: overallCompliance,
        validation_results: allValidationResults,
        audit_trail_id: auditTrailId,
        calculated_at: new Date(),
        calculated_by: 'system', // TODO: Get from context
        approval_status: invoiceData.approval_required ? 'PENDING' : 'AUTO_APPROVED',
        recalculation_required: recalculationRequired
      };

      // Store integration result
      await this.storeInvoiceTaxIntegration(integration);

      // Emit events
      this.emit('invoiceTaxCalculated', {
        invoiceId,
        totalTaxAmount: totalSummary.total_tax_amount,
        complianceStatus: overallCompliance,
        calculationTime: Date.now() - startTime
      });

      // Check for compliance alerts
      await this.checkAndCreateComplianceAlerts(integration);

      return integration;

    } catch (error) {
      this.emit('invoiceTaxCalculationError', {
        invoiceId,
        error: error.message,
        timestamp: new Date()
      });
      throw new TaxIntegrationError(`Invoice tax calculation failed: ${error.message}`, {
        invoiceId,
        organizationId,
        originalError: error
      });
    }
  }

  // ===== BILL TAX INTEGRATION =====

  async calculateBillTax(
    billId: string,
    organizationId: string,
    lines: Array<{
      id: string;
      description: string;
      amount: Decimal;
      tax_code_id: string;
      exemptions?: TaxExemption[];
    }>,
    billData: {
      currency: string;
      bill_date: Date;
      vendor_location?: TaxLocation;
      company_location?: TaxLocation;
      is_tax_inclusive?: boolean;
      validation_level?: ValidationLevel;
      approval_required?: boolean;
      reverse_charge_applicable?: boolean;
    }
  ): Promise<BillTaxIntegration> {
    const startTime = Date.now();

    try {
      // Handle reverse charge scenarios for B2B transactions
      const effectiveLocation = this.determineEffectiveTaxLocation(
        billData.vendor_location,
        billData.company_location,
        billData.reverse_charge_applicable
      );

      // Prepare tax calculation requests for each line
      const lineCalculationPromises = lines.map(async (line) => {
        const request: EnterpriseTaxCalculationRequest = {
          organizationId: organizationId,
          transactionId: line.id,
          amount: line.amount,
          taxCodeId: line.tax_code_id,
          calculationDate: billData.bill_date,
          currency: billData.currency,
          isTaxInclusive: billData.is_tax_inclusive || false,
          exemptions: line.exemptions,
          location: effectiveLocation,
          validationLevel: billData.validation_level || ValidationLevel.COMPREHENSIVE,
          approvalRequired: billData.approval_required || false,
          auditTrailEnabled: true,
          metadata: {
            transaction_type: 'BILL',
            bill_id: billId,
            line_description: line.description,
            reverse_charge: billData.reverse_charge_applicable || false
          }
        };

        const result = await this.taxCalculationService.calculateTax(request);

        return {
          line_id: line.id,
          line_description: line.description,
          base_amount: line.amount,
          tax_code_id: line.tax_code_id,
          tax_code_name: await this.getTaxCodeName(line.tax_code_id),
          calculation_result: result,
          exemptions_applied: this.mapExemptionsToApplied(result.calculationDetails.exemptionsApplied),
          compliance_notes: this.generateComplianceNotes(result, billData.reverse_charge_applicable)
        } as LineItemTaxCalculation;
      });

      const lineCalculations = await Promise.all(lineCalculationPromises);

      // Generate summary
      const totalSummary = this.generateTaxSummary(lineCalculations, billData.currency);

      // Determine overall compliance status
      const overallCompliance = this.determineOverallCompliance(lineCalculations);

      // Aggregate validation results
      const allValidationResults = this.aggregateValidationResults(lineCalculations);

      // Check for recalculation requirements
      const recalculationRequired = this.checkRecalculationRequired(lineCalculations);

      // Create audit trail entry
      const auditTrailId = await this.createTaxAuditTrail({
        transaction_type: 'BILL',
        transaction_id: billId,
        organization_id: organizationId,
        calculation_summary: totalSummary,
        calculation_time_ms: Date.now() - startTime,
        line_count: lines.length
      });

      const integration: BillTaxIntegration = {
        bill_id: billId,
        organization_id: organizationId,
        tax_calculations: lineCalculations,
        total_tax_summary: totalSummary,
        compliance_status: overallCompliance,
        validation_results: allValidationResults,
        audit_trail_id: auditTrailId,
        calculated_at: new Date(),
        calculated_by: 'system', // TODO: Get from context
        approval_status: billData.approval_required ? 'PENDING' : 'AUTO_APPROVED',
        recalculation_required: recalculationRequired
      };

      // Store integration result
      await this.storeBillTaxIntegration(integration);

      // Emit events
      this.emit('billTaxCalculated', {
        billId,
        totalTaxAmount: totalSummary.total_tax_amount,
        complianceStatus: overallCompliance,
        calculationTime: Date.now() - startTime
      });

      // Check for compliance alerts
      await this.checkAndCreateComplianceAlerts(integration);

      return integration;

    } catch (error) {
      this.emit('billTaxCalculationError', {
        billId,
        error: error.message,
        timestamp: new Date()
      });
      throw new TaxIntegrationError(`Bill tax calculation failed: ${error.message}`, {
        billId,
        organizationId,
        originalError: error
      });
    }
  }

  // ===== TAX RECALCULATION METHODS =====

  async recalculateInvoiceTax(
    invoiceId: string,
    trigger: TaxRecalculationTrigger
  ): Promise<InvoiceTaxIntegration> {
    const existingIntegration = await this.getInvoiceTaxIntegration(invoiceId);
    if (!existingIntegration) {
      throw new Error(`No existing tax integration found for invoice ${invoiceId}`);
    }

    // Mark as requiring recalculation
    await this.markForRecalculation(invoiceId, 'INVOICE', trigger);

    // If approval required, don't auto-recalculate
    if (trigger.requires_approval) {
      this.emit('recalculationApprovalRequired', {
        transactionId: invoiceId,
        transactionType: 'INVOICE',
        trigger
      });
      return existingIntegration;
    }

    // Auto-recalculate if confidence is high
    if (trigger.confidence_level > 0.8) {
      // Get updated invoice data and recalculate
      const invoiceData = await this.getInvoiceData(invoiceId);
      return await this.calculateInvoiceTax(
        invoiceId,
        existingIntegration.organization_id,
        invoiceData.lines,
        invoiceData.invoice_details
      );
    }

    return existingIntegration;
  }

  async recalculateBillTax(
    billId: string,
    trigger: TaxRecalculationTrigger
  ): Promise<BillTaxIntegration> {
    const existingIntegration = await this.getBillTaxIntegration(billId);
    if (!existingIntegration) {
      throw new Error(`No existing tax integration found for bill ${billId}`);
    }

    // Mark as requiring recalculation
    await this.markForRecalculation(billId, 'BILL', trigger);

    // If approval required, don't auto-recalculate
    if (trigger.requires_approval) {
      this.emit('recalculationApprovalRequired', {
        transactionId: billId,
        transactionType: 'BILL',
        trigger
      });
      return existingIntegration;
    }

    // Auto-recalculate if confidence is high
    if (trigger.confidence_level > 0.8) {
      // Get updated bill data and recalculate
      const billData = await this.getBillData(billId);
      return await this.calculateBillTax(
        billId,
        existingIntegration.organization_id,
        billData.lines,
        billData.bill_details
      );
    }

    return existingIntegration;
  }

  // ===== COMPLIANCE MONITORING =====

  async getComplianceAlerts(
    organizationId: string,
    filters?: {
      severity?: string[];
      types?: string[];
      date_from?: Date;
      date_to?: Date;
      auto_resolvable_only?: boolean;
    }
  ): Promise<TaxComplianceAlert[]> {
    let query = this.supabase
      .from('tax_compliance_alerts')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.severity) {
      query = query.in('severity', filters.severity);
    }

    if (filters?.types) {
      query = query.in('type', filters.types);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from.toISOString());
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to.toISOString());
    }

    if (filters?.auto_resolvable_only) {
      query = query.eq('auto_resolvable', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  async resolveComplianceAlert(
    alertId: string,
    resolution: {
      resolved_by: string;
      resolution_notes: string;
      auto_resolved: boolean;
      resolution_actions: string[];
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('tax_compliance_alerts')
      .update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
        resolved_by: resolution.resolved_by,
        resolution_notes: resolution.resolution_notes,
        auto_resolved: resolution.auto_resolved,
        resolution_actions: resolution.resolution_actions
      })
      .eq('id', alertId);

    if (error) throw error;

    this.emit('complianceAlertResolved', {
      alertId,
      resolvedBy: resolution.resolved_by,
      autoResolved: resolution.auto_resolved
    });
  }

  // ===== HELPER METHODS =====

  private setupTaxCalculationListeners(): void {
    this.taxCalculationService.on('calculationCompleted', (event) => {
      this.emit('taxCalculationCompleted', event);
    });

    this.taxCalculationService.on('calculationApproved', (event) => {
      this.emit('taxCalculationApproved', event);
    });

    this.taxCalculationService.on('batchCalculationCompleted', (event) => {
      this.emit('batchTaxCalculationCompleted', event);
    });
  }

  private combineExemptions(
    lineExemptions?: TaxExemption[],
    customerExemptions?: TaxExemption[]
  ): TaxExemption[] {
    const combined: TaxExemption[] = [];
    
    if (lineExemptions) {
      combined.push(...lineExemptions);
    }
    
    if (customerExemptions) {
      combined.push(...customerExemptions);
    }
    
    // Remove duplicates based on exemption ID
    return combined.filter((exemption, index, array) => 
      array.findIndex(e => e.id === exemption.id) === index
    );
  }

  private async getTaxCodeName(taxCodeId: string): Promise<string> {
    const cached = this.cache.get(`tax_code_name_${taxCodeId}`);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('tax_codes')
      .select('name')
      .eq('id', taxCodeId)
      .single();

    if (error || !data) return 'Unknown Tax Code';

    this.cache.set(`tax_code_name_${taxCodeId}`, data.name);
    return data.name;
  }

  private mapExemptionsToApplied(exemptions: any[]): AppliedExemption[] {
    return exemptions.map(exemption => ({
      exemption_id: exemption.exemption_id,
      exemption_code: exemption.exemption_code,
      exemption_name: exemption.exemption_name || 'Unknown Exemption',
      amount_exempted: exemption.amount_exempted || new Decimal(0),
      certificate_number: exemption.certificate_number,
      expiry_date: exemption.expiry_date,
      validation_status: exemption.validation_status
    }));
  }

  private generateComplianceNotes(
    result: EnterpriseTaxCalculationResult,
    reverseCharge?: boolean
  ): string {
    const notes: string[] = [];

    if (result.complianceStatus === ComplianceStatus.NON_COMPLIANT) {
      notes.push('❌ Non-compliant calculation detected');
    }

    if (result.validationResults.some(v => v.severity === 'critical')) {
      notes.push('⚠️ Critical validation issues found');
    }

    if (reverseCharge) {
      notes.push('🔄 Reverse charge mechanism applied');
    }

    if (result.calculationDetails.exemptionsApplied.length > 0) {
      notes.push(`💼 ${result.calculationDetails.exemptionsApplied.length} exemption(s) applied`);
    }

    return notes.join(' | ') || '✅ Standard calculation';
  }

  private generateTaxSummary(
    lineCalculations: LineItemTaxCalculation[],
    currency: string
  ): TaxSummary {
    let totalBaseAmount = new Decimal(0);
    let totalTaxableAmount = new Decimal(0);
    let totalTaxAmount = new Decimal(0);
    let totalAmount = new Decimal(0);

    const taxBreakdownMap = new Map<string, TaxBreakdownSummary>();
    const jurisdictionMap = new Map<string, JurisdictionSummary>();
    const exemptionTypes = new Map<string, number>();
    let totalExemptions = 0;
    let totalExemptedAmount = new Decimal(0);
    let certificateCount = 0;
    const expiringCerts: ExpiringCertificate[] = [];

    for (const lineCalc of lineCalculations) {
      const details = lineCalc.calculation_result.calculationDetails;
      
      totalBaseAmount = totalBaseAmount.plus(details.baseAmount);
      totalTaxableAmount = totalTaxableAmount.plus(details.taxableAmount);
      totalTaxAmount = totalTaxAmount.plus(details.taxAmount);
      totalAmount = totalAmount.plus(details.totalAmount);

      // Process tax breakdown
      for (const breakdown of details.breakdown) {
        const key = `${breakdown.jurisdiction}_${breakdown.taxType}`;
        const existing = taxBreakdownMap.get(key);

        if (existing) {
          existing.taxable_amount = existing.taxable_amount.plus(breakdown.baseAmount);
          existing.tax_amount = existing.tax_amount.plus(breakdown.calculatedAmount);
          existing.line_items.push(lineCalc.line_id);
        } else {
          taxBreakdownMap.set(key, {
            tax_type: breakdown.taxType,
            tax_name: breakdown.description,
            jurisdiction: breakdown.jurisdiction,
            rate: breakdown.rate,
            taxable_amount: breakdown.baseAmount,
            tax_amount: breakdown.calculatedAmount,
            line_items: [lineCalc.line_id]
          });
        }
      }

      // Process exemptions
      for (const exemption of lineCalc.exemptions_applied) {
        totalExemptions++;
        totalExemptedAmount = totalExemptedAmount.plus(exemption.amount_exempted);

        const exemptionType = exemption.exemption_code.split('-')[0]; // Get type from code
        exemptionTypes.set(exemptionType, (exemptionTypes.get(exemptionType) || 0) + 1);

        if (exemption.certificate_number) {
          certificateCount++;
          
          if (exemption.expiry_date) {
            const daysUntilExpiry = Math.ceil(
              (exemption.expiry_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
              expiringCerts.push({
                exemption_id: exemption.exemption_id,
                certificate_number: exemption.certificate_number,
                expiry_date: exemption.expiry_date,
                days_until_expiry: daysUntilExpiry,
                line_items_affected: [lineCalc.line_id]
              });
            }
          }
        }
      }
    }

    const effectiveRate = totalTaxableAmount.gt(0) 
      ? totalTaxAmount.dividedBy(totalTaxableAmount).times(100) 
      : new Decimal(0);

    return {
      total_base_amount: totalBaseAmount,
      total_taxable_amount: totalTaxableAmount,
      total_tax_amount: totalTaxAmount,
      total_amount: totalAmount,
      effective_tax_rate: effectiveRate,
      currency,
      tax_breakdown: Array.from(taxBreakdownMap.values()),
      exemption_summary: {
        total_exemptions: totalExemptions,
        total_exempted_amount: totalExemptedAmount,
        exemptions_by_type: Object.fromEntries(exemptionTypes),
        certificate_count: certificateCount,
        expiring_certificates: expiringCerts
      },
      jurisdiction_summary: Array.from(jurisdictionMap.values())
    };
  }

  private determineOverallCompliance(lineCalculations: LineItemTaxCalculation[]): ComplianceStatus {
    const statuses = lineCalculations.map(calc => calc.calculation_result.complianceStatus);
    
    if (statuses.every(status => status === ComplianceStatus.COMPLIANT)) {
      return ComplianceStatus.COMPLIANT;
    }
    
    if (statuses.some(status => status === ComplianceStatus.NON_COMPLIANT)) {
      return ComplianceStatus.NON_COMPLIANT;
    }
    
    if (statuses.some(status => status === ComplianceStatus.PARTIALLY_COMPLIANT)) {
      return ComplianceStatus.PARTIALLY_COMPLIANT;
    }
    
    return ComplianceStatus.UNDER_REVIEW;
  }

  private aggregateValidationResults(lineCalculations: LineItemTaxCalculation[]): TaxValidationResult[] {
    const results: TaxValidationResult[] = [];

    for (const lineCalc of lineCalculations) {
      for (const validation of lineCalc.calculation_result.validationResults) {
        results.push({
          line_id: lineCalc.line_id,
          rule_name: validation.rule_name,
          status: validation.status as any,
          severity: validation.severity as any,
          message: validation.message,
          suggested_action: validation.suggestedFix,
          auto_correctable: validation.autoCorrectable
        });
      }
    }

    return results;
  }

  private checkRecalculationRequired(lineCalculations: LineItemTaxCalculation[]): boolean {
    return lineCalculations.some(calc => 
      calc.calculation_result.validationResults.some(v => 
        v.severity === 'critical' && v.autoCorrectable
      )
    );
  }

  private determineEffectiveTaxLocation(
    vendorLocation?: TaxLocation,
    companyLocation?: TaxLocation,
    reverseCharge?: boolean
  ): TaxLocation | undefined {
    if (reverseCharge && companyLocation) {
      return companyLocation; // Reverse charge - use company location
    }
    
    return vendorLocation; // Standard - use vendor location
  }

  private async createTaxAuditTrail(data: any): Promise<string> {
    const auditId = `tax_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error } = await this.supabase
      .from('tax_audit_trails')
      .insert({
        id: auditId,
        ...data,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    
    return auditId;
  }

  private async storeInvoiceTaxIntegration(integration: InvoiceTaxIntegration): Promise<void> {
    const { error } = await this.supabase
      .from('invoice_tax_integrations')
      .upsert({
        ...integration,
        tax_calculations: JSON.stringify(integration.tax_calculations),
        total_tax_summary: JSON.stringify(integration.total_tax_summary),
        validation_results: JSON.stringify(integration.validation_results)
      });

    if (error) throw error;
  }

  private async storeBillTaxIntegration(integration: BillTaxIntegration): Promise<void> {
    const { error } = await this.supabase
      .from('bill_tax_integrations')
      .upsert({
        ...integration,
        tax_calculations: JSON.stringify(integration.tax_calculations),
        total_tax_summary: JSON.stringify(integration.total_tax_summary),
        validation_results: JSON.stringify(integration.validation_results)
      });

    if (error) throw error;
  }

  private async checkAndCreateComplianceAlerts(
    integration: InvoiceTaxIntegration | BillTaxIntegration
  ): Promise<void> {
    const alerts: TaxComplianceAlert[] = [];

    // Check for non-compliance
    if (integration.compliance_status === ComplianceStatus.NON_COMPLIANT) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'NON_COMPLIANCE',
        severity: 'HIGH',
        message: 'Non-compliant tax calculation detected',
        affected_transactions: ['invoice_id' in integration ? integration.invoice_id : integration.bill_id],
        jurisdiction: 'Multiple', // Would be specific in real implementation
        action_required: 'Review and correct tax calculation',
        auto_resolvable: false
      });
    }

    // Check for expiring exemption certificates
    const expiringCerts = integration.total_tax_summary.exemption_summary.expiring_certificates;
    if (expiringCerts.length > 0) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'EXEMPTION_EXPIRY',
        severity: 'MEDIUM',
        message: `${expiringCerts.length} exemption certificate(s) expiring within 30 days`,
        affected_transactions: ['invoice_id' in integration ? integration.invoice_id : integration.bill_id],
        jurisdiction: 'Multiple',
        action_required: 'Renew exemption certificates',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        auto_resolvable: false
      });
    }

    // Store alerts
    if (alerts.length > 0) {
      const { error } = await this.supabase
        .from('tax_compliance_alerts')
        .insert(alerts.map(alert => ({
          ...alert,
          organization_id: integration.organization_id,
          created_at: new Date().toISOString(),
          status: 'ACTIVE'
        })));

      if (error) throw error;

      // Emit alert events
      for (const alert of alerts) {
        this.emit('complianceAlertCreated', alert);
      }
    }
  }

  private async markForRecalculation(
    transactionId: string,
    transactionType: 'INVOICE' | 'BILL',
    trigger: TaxRecalculationTrigger
  ): Promise<void> {
    const { error } = await this.supabase
      .from('tax_recalculation_queue')
      .insert({
        transaction_id: transactionId,
        transaction_type: transactionType,
        trigger_type: trigger.trigger_type,
        trigger_details: JSON.stringify(trigger),
        created_at: new Date().toISOString(),
        status: 'PENDING',
        requires_approval: trigger.requires_approval,
        confidence_level: trigger.confidence_level
      });

    if (error) throw error;
  }

  private async getInvoiceTaxIntegration(invoiceId: string): Promise<InvoiceTaxIntegration | null> {
    const { data, error } = await this.supabase
      .from('invoice_tax_integrations')
      .select('*')
      .eq('invoice_id', invoiceId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      tax_calculations: JSON.parse(data.tax_calculations),
      total_tax_summary: JSON.parse(data.total_tax_summary),
      validation_results: JSON.parse(data.validation_results)
    };
  }

  private async getBillTaxIntegration(billId: string): Promise<BillTaxIntegration | null> {
    const { data, error } = await this.supabase
      .from('bill_tax_integrations')
      .select('*')
      .eq('bill_id', billId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      tax_calculations: JSON.parse(data.tax_calculations),
      total_tax_summary: JSON.parse(data.total_tax_summary),
      validation_results: JSON.parse(data.validation_results)
    };
  }

  private async getInvoiceData(invoiceId: string): Promise<any> {
    // Implementation would fetch current invoice data
    return {};
  }

  private async getBillData(billId: string): Promise<any> {
    // Implementation would fetch current bill data
    return {};
  }
}

// ===== ERROR CLASSES =====

export class TaxIntegrationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'TaxIntegrationError';
  }
}

/**
 * # Enterprise Tax Integration Service
 * 
 * This service provides seamless integration between the Enterprise Tax Calculation
 * Service and Invoice/Bill services, enabling automatic tax calculation, compliance
 * monitoring, and audit trail management.
 * 
 * ## Key Features
 * - Automatic tax calculation for invoices and bills
 * - Real-time compliance monitoring
 * - Advanced exemption handling
 * - Audit trail management
 * - Recalculation triggers and workflows
 * - Compliance alert system
 * 
 * ## Usage Examples
 * 
 * ### Invoice Tax Integration
 * ```typescript
 * const taxIntegration = new EnterpriseTaxIntegrationService(supabase);
 * 
 * const invoiceTax = await taxIntegration.calculateInvoiceTax(
 *   'invoice-123',
 *   'org-456',
 *   [
 *     {
 *       id: 'line-1',
 *       description: 'Professional Services',
 *       amount: new Decimal(1000),
 *       tax_code_id: 'vat-standard'
 *     }
 *   ],
 *   {
 *     currency: 'USD',
 *     invoice_date: new Date(),
 *     customer_location: { country: 'US', state_province: 'CA' },
 *     validation_level: ValidationLevel.AUDIT_READY
 *   }
 * );
 * ```
 * 
 * ### Bill Tax Integration
 * ```typescript
 * const billTax = await taxIntegration.calculateBillTax(
 *   'bill-789',
 *   'org-456',
 *   lines,
 *   {
 *     currency: 'USD',
 *     bill_date: new Date(),
 *     vendor_location: { country: 'US', state_province: 'NY' },
 *     reverse_charge_applicable: true
 *   }
 * );
 * ```
 * 
 * ### Event Handling
 * ```typescript
 * taxIntegration.on('invoiceTaxCalculated', (event) => {
 *   console.log('Invoice tax calculated:', event.totalTaxAmount);
 * });
 * 
 * taxIntegration.on('complianceAlertCreated', (alert) => {
 *   console.log('Compliance alert:', alert.message);
 * });
 * ```
 */
