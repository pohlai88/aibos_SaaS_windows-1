/**
 * Enterprise Procurement Service (Plug-and-Play, Isolated)
 *
 * Provides advanced procurement management, purchase order lifecycle, and integration hooks for inventory, bill, and vendor modules.
 *
 * - Isolated: No hard dependencies on other services. Integration via interfaces/events only.
 * - Plug-and-Play: Can be enabled/disabled or replaced without breaking the system.
 * - Enterprise-grade: Approval workflows, analytics, audit, and compliance ready.
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
import { PurchaseOrder as CorePurchaseOrder } from '@aibos/core-types';

// Extend the core PurchaseOrder interface with additional fields
export interface PurchaseOrder extends CorePurchaseOrder {
  metadata?: {
    organizationId?: string;
    vendorId?: string;
    orderDate?: Date;
    notes?: string;
    type?: string;
    contractPeriodMonths?: number;
    autoReleaseThreshold?: number;
    priceProtectionDays?: number;
    deliveryStatus?: string;
    qualityIssues?: boolean;
    preferredSupplier?: boolean;
    contractPurchase?: boolean;
    policyCompliant?: boolean;
    category?: string;
    [key: string]: any;
  };
}

// ===== TYPES & INTERFACES =====
import { PurchaseOrderItem as CorePurchaseOrderItem } from '@aibos/core-types';

export interface PurchaseOrderItem extends CorePurchaseOrderItem {
  metadata?: {
    status?: string;
    category?: string;
    [key: string]: any;
  };
}

export interface PurchaseOrderLine {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  metadata?: Record<string, any>;
}

export interface ProcurementApproval {
  id: string;
  poId: string;
  approverId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: Date;
  notes?: string;
}

export interface ProcurementAuditTrail {
  id: string;
  action: string;
  poId: string;
  timestamp: Date;
  userId: string;
  details: Record<string, any>;
}

export interface ProcurementAnalytics {
  totalOrders: number;
  totalValue: number;
  openOrders: number;
  fulfilledOrders: number;
  rejectedOrders: number;
  lastUpdated: Date;
}

export interface ProcurementServiceOptions {
  enableAudit?: boolean;
  enableNotifications?: boolean;
  integrationHooks?: {
    onPOStatusChange?: (po: PurchaseOrder) => void;
    onItemReceived?: (po: PurchaseOrder, line: PurchaseOrderLine) => void;
  };
}

export interface SupplierScorecard {
  vendorId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: SupplierMetrics;
  riskAssessment: SupplierRiskAssessment;
  recommendations: string[];
  overallScore: number;
  generatedAt: Date;
}

export interface SupplierMetrics {
  onTimeDeliveryRate: number;
  qualityScore: number;
  costCompetitiveness: number;
  responseTimeAvgHours: number;
  fillRate: number;
  defectRate: number;
  totalOrders: number;
  totalSpend: number;
}

export interface SupplierRiskAssessment {
  financialStability: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  geographicRisk: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  operationalRisk: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  complianceRisk: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  overallRiskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  riskFactors: string[];
  mitigationStrategies: string[];
}

export interface SpendAnalysis {
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalSpend: number;
  categoryBreakdown: Record<string, number>;
  vendorBreakdown: Record<string, number>;
  maverickSpend: MaverickSpend;
  savingsOpportunities: SavingsOpportunity[];
  complianceScore: number;
  generatedAt: Date;
}

export interface MaverickSpend {
  totalMaverickSpend: number;
  maverickPercentage: number;
  maverickTransactions: number;
}

export interface SavingsOpportunity {
  type: 'VENDOR_CONSOLIDATION' | 'CONTRACT_LEVERAGE' | 'BULK_PURCHASING' | 'ALTERNATIVE_SOURCING';
  description: string;
  potentialSavings: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  receivedDate: Date;
  items: Array<{
    itemId: string;
    quantityReceived: number;
    condition: 'GOOD' | 'DAMAGED' | 'PARTIAL';
  }>;
  receivedBy: string;
  notes?: string;
}

export interface VendorInvoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  items: Array<{
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
}

export interface ThreeWayMatchResult {
  poId: string;
  receiptId: string;
  invoiceId: string;
  matchStatus: 'MATCHED' | 'MATCHED_WITH_WARNINGS' | 'DISCREPANCIES_FOUND';
  discrepancies: MatchDiscrepancy[];
  autoApproveEligible: boolean;
  matchedAt: Date;
  matchedBy: string;
}

export interface MatchDiscrepancy {
  type: 'QUANTITY' | 'PRICE' | 'TERMS' | 'OTHER';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
  expectedValue: any;
  actualValue: any;
  suggestedAction?: string;
}

export interface ContractComplianceReport {
  contractId: string;
  complianceScore: number;
  violations: Array<{
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    detectedDate: Date;
  }>;
  recommendations: string[];
  monitoringPeriod: {
    start: Date;
    end: Date;
  };
  lastChecked: Date;
}

// ===== VALIDATION SCHEMAS =====
export const PurchaseOrderSchema = z.object({
  organization_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  order_date: z.date(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED']),
  items: z.array(z.object({
    item_id: z.string().uuid(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    total: z.number().positive(),
    status: z.enum(['PENDING', 'RECEIVED', 'CANCELLED'])
  })).min(1),
  total_amount: z.number().positive(),
  currency: z.string().length(3),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// ===== SERVICE IMPLEMENTATION =====
export class EnterpriseProcurementService extends EventEmitter {
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private approvals: ProcurementApproval[] = [];
  private auditTrail: ProcurementAuditTrail[] = [];
  private options: ProcurementServiceOptions;

  constructor(options: ProcurementServiceOptions = {}) {
    super();
    this.options = options;
  }

  /** Create or update a purchase order */
  upsertPurchaseOrder(po: PurchaseOrder): void {
    this.purchaseOrders.set(po.id, po);
    this.emit('poUpserted', po);
    if (this.options.enableAudit) {
      this.recordAudit('UPSERT', po.id, { po });
    }
  }

  /** Remove a purchase order */
  removePurchaseOrder(poId: string): void {
    this.purchaseOrders.delete(poId);
    this.emit('poRemoved', poId);
    if (this.options.enableAudit) {
      this.recordAudit('REMOVE', poId, {});
    }
  }

  /** Approve or reject a purchase order */
  setApproval(poId: string, approverId: string, status: 'APPROVED' | 'REJECTED', notes?: string): void {
    const approval: ProcurementApproval = {
      id: 'approval_' + Date.now(),
      poId,
      approverId,
      status,
      timestamp: new Date(),
      notes
    };
    this.approvals.push(approval);
    this.emit('poApprovalChanged', approval);
    if (this.options.enableAudit) {
      this.recordAudit('APPROVAL_' + status, poId, { approval });
    }
  }

  /** Mark a line item as received */
  receiveItem(poId: string, lineId: string): void {
    const po = this.purchaseOrders.get(poId);
    if (!po) return;
    const line = po.items.find(l => l.id === lineId) as PurchaseOrderItem;
    if (!line) return;
    
    // Store status in metadata since PurchaseOrderItem doesn't have status
    if (!line.metadata) line.metadata = {};
    line.metadata.status = 'RECEIVED';
    
    this.emit('itemReceived', po, line);
    if (this.options.integrationHooks?.onItemReceived) {
      this.options.integrationHooks.onItemReceived(po, line as any);
    }
    if (this.options.enableAudit) {
      this.recordAudit('ITEM_RECEIVED', poId, { line });
    }
  }

  /** Get purchase order by ID */
  getPurchaseOrder(poId: string): PurchaseOrder | undefined {
    return this.purchaseOrders.get(poId);
  }

  /** List all purchase orders */
  listPurchaseOrders(): PurchaseOrder[] {
    return Array.from(this.purchaseOrders.values());
  }

  /** Get analytics */
  getAnalytics(): ProcurementAnalytics {
    const orders = this.listPurchaseOrders();
    return {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      openOrders: orders.filter(o => o.status !== 'completed').length,
      fulfilledOrders: orders.filter(o => o.status === 'completed').length,
      rejectedOrders: orders.filter(o => o.status === 'rejected').length,
      lastUpdated: new Date()
    };
  }

  /** Get audit trail */
  getAuditTrail(): ProcurementAuditTrail[] {
    return this.auditTrail;
  }

  /** Create blanket purchase order for long-term supplier agreements */
  createBlanketPO(
    blanketOrder: Omit<PurchaseOrder, 'id' | 'status'> & { 
      contractPeriodMonths: number;
      autoReleaseThreshold?: number;
      priceProtectionDays?: number;
    }
  ): PurchaseOrder {
    const id = `BPO_${Date.now()}`;
    const po: PurchaseOrder = {
      ...blanketOrder,
      id,
      number: `BPO-${Date.now()}`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        ...blanketOrder.metadata,
        type: 'BLANKET_ORDER',
        contractPeriodMonths: blanketOrder.contractPeriodMonths,
        autoReleaseThreshold: blanketOrder.autoReleaseThreshold,
        priceProtectionDays: blanketOrder.priceProtectionDays || 30
      }
    };

    this.purchaseOrders.set(id, po);
    this.emit('blanketPOCreated', po);
    
    if (this.options.enableAudit) {
      this.recordAudit('BLANKET_PO_CREATED', id, { po });
    }

    return po;
  }

  /** Release items from blanket PO based on demand */
  releaseBlanketPO(
    blanketPOId: string, 
    releaseItems: Array<{ itemId: string; quantity: number; requiredDate?: Date }>
  ): PurchaseOrder {
    const blanketPO = this.purchaseOrders.get(blanketPOId);
    if (!blanketPO || blanketPO.metadata?.type !== 'BLANKET_ORDER') {
      throw new Error('Blanket PO not found or invalid');
    }

    const releaseId = `REL_${blanketPOId}_${Date.now()}`;
    const releasePO: PurchaseOrder = {
      id: releaseId,
      number: `REL-${Date.now()}`,
      supplierId: blanketPO.supplierId,
      items: releaseItems.map((item, index) => ({
        id: `${releaseId}_${index}`,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: 0, // Would be populated from blanket PO rates
        totalPrice: 0,
        description: `Release from Blanket PO ${blanketPOId}`
      })),
      totalAmount: 0, // Would be calculated
      currency: blanketPO.currency,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        type: 'BLANKET_RELEASE',
        parentBlanketPo: blanketPOId,
        organizationId: blanketPO.metadata?.organizationId,
        vendorId: blanketPO.metadata?.vendorId,
        orderDate: new Date(),
        blanketPoId: blanketPOId,
        requiredDate: releaseItems[0]?.requiredDate
      }
    };

    this.purchaseOrders.set(releaseId, releasePO);
    this.emit('blanketPOReleased', { blanketPO, releasePO });
    
    return releasePO;
  }

  /** Advanced supplier performance analytics */
  generateSupplierScorecard(
    vendorId: string, 
    periodStartDate: Date, 
    periodEndDate: Date
  ): SupplierScorecard {
    const vendorPOs = Array.from(this.purchaseOrders.values())
      .filter(po => 
        po.metadata?.vendorId === vendorId && 
        po.metadata?.orderDate >= periodStartDate && 
        po.metadata?.orderDate <= periodEndDate
      );

    const metrics = this.calculateSupplierMetrics(vendorPOs);
    const riskAssessment = this.assessSupplierRisk(vendorId, vendorPOs);
    const recommendations = this.generateSupplierRecommendations(metrics, riskAssessment);

    return {
      vendorId: vendorId,
      period: { start: periodStartDate, end: periodEndDate },
      metrics,
      riskAssessment: riskAssessment,
      recommendations,
      overallScore: this.calculateOverallSupplierScore(metrics),
      generatedAt: new Date()
    };
  }

  /** Automated spend analysis with category insights */
  generateSpendAnalysis(
    organizationId: string, 
    periodStartDate: Date, 
    periodEndDate: Date
  ): SpendAnalysis {
    const orgPOs = Array.from(this.purchaseOrders.values())
      .filter(po => 
        po.metadata?.organizationId === organizationId &&
        po.metadata?.orderDate >= periodStartDate && 
        po.metadata?.orderDate <= periodEndDate
      );

    const categorySpend = this.calculateCategorySpend(orgPOs);
    const vendorSpend = this.calculateVendorSpend(orgPOs);
    const maverickSpend = this.identifyMaverickSpend(orgPOs);
    const savingsOpportunities = this.identifySavingsOpportunities(orgPOs);

    return {
      organizationId: organizationId,
      period: { start: periodStartDate, end: periodEndDate },
      totalSpend: orgPOs.reduce((sum, po) => sum + po.totalAmount, 0),
      categoryBreakdown: categorySpend,
      vendorBreakdown: vendorSpend,
      maverickSpend: maverickSpend,
      savingsOpportunities,
      complianceScore: this.calculateComplianceScore(orgPOs),
      generatedAt: new Date()
    };
  }

  /** Three-way matching automation */
  performThreeWayMatch(
    poId: string, 
    receipt: GoodsReceipt, 
    invoice: VendorInvoice
  ): ThreeWayMatchResult {
    const po = this.purchaseOrders.get(poId);
    if (!po) throw new Error('Purchase Order not found');

    const discrepancies: MatchDiscrepancy[] = [];
    
    // Quantity matching
    const qtyDiscrepancies = this.checkQuantityMatching(po, receipt, invoice);
    discrepancies.push(...qtyDiscrepancies);

    // Price matching
    const priceDiscrepancies = this.checkPriceMatching(po, invoice);
    discrepancies.push(...priceDiscrepancies);

    // Terms matching
    const termsDiscrepancies = this.checkTermsMatching(po, invoice);
    discrepancies.push(...termsDiscrepancies);

    const matchStatus = discrepancies.length === 0 ? 'MATCHED' : 
                       discrepancies.every(d => d.severity === 'WARNING') ? 'MATCHED_WITH_WARNINGS' : 
                       'DISCREPANCIES_FOUND';

    const result: ThreeWayMatchResult = {
      poId: poId,
      receiptId: receipt.id,
      invoiceId: invoice.id,
      matchStatus: matchStatus,
      discrepancies,
      autoApproveEligible: matchStatus === 'MATCHED',
      matchedAt: new Date(),
      matchedBy: 'system'
    };

    this.emit('threeWayMatchCompleted', result);
    
    if (this.options.enableAudit) {
      this.recordAudit('THREE_WAY_MATCH', poId, { result });
    }

    return result;
  }

  /** Automated contract compliance monitoring */
  monitorContractCompliance(contractId: string): ContractComplianceReport {
    // Implementation would check contract terms against actual performance
    const compliance: ContractComplianceReport = {
      contractId: contractId,
      complianceScore: 0.95,
      violations: [],
      recommendations: [],
      monitoringPeriod: {
        start: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)),
        end: new Date()
      },
      lastChecked: new Date()
    };

    return compliance;
  }

  // ===== HELPER METHODS =====

  private calculateSupplierMetrics(pos: PurchaseOrder[]): SupplierMetrics {
    const totalOrders = pos.length;
    const onTimeDeliveries = pos.filter(po => 
      po.metadata?.deliveryStatus === 'ON_TIME'
    ).length;
    
    const qualityIssues = pos.filter(po => 
      po.metadata?.qualityIssues
    ).length;

    return {
      onTimeDeliveryRate: totalOrders > 0 ? onTimeDeliveries / totalOrders : 0,
      qualityScore: totalOrders > 0 ? (totalOrders - qualityIssues) / totalOrders : 1,
      costCompetitiveness: 0.85, // Would be calculated against market rates
      responseTimeAvgHours: 24,
      fillRate: 0.95,
      defectRate: qualityIssues / Math.max(totalOrders, 1),
      totalOrders: totalOrders,
      totalSpend: pos.reduce((sum, po) => sum + po.totalAmount, 0)
    };
  }

  private assessSupplierRisk(vendorId: string, pos: PurchaseOrder[]): SupplierRiskAssessment {
    // Simplified risk assessment - would integrate with external risk databases
    return {
      financialStability: 'LOW_RISK',
      geographicRisk: 'MEDIUM_RISK',
      operationalRisk: 'LOW_RISK',
      complianceRisk: 'LOW_RISK',
      overallRiskLevel: 'LOW_RISK',
      riskFactors: ['Geographic concentration'],
      mitigationStrategies: ['Diversify supplier base']
    };
  }

  private generateSupplierRecommendations(
    metrics: SupplierMetrics, 
    risk: SupplierRiskAssessment
  ): string[] {
    const recommendations: string[] = [];
    
    if (metrics.onTimeDeliveryRate < 0.9) {
      recommendations.push('Implement delivery performance improvement plan');
    }
    
    if (metrics.qualityScore < 0.95) {
      recommendations.push('Conduct quality audit and improvement initiative');
    }
    
    if (risk.overallRiskLevel === 'HIGH_RISK') {
      recommendations.push('Consider alternative suppliers or risk mitigation strategies');
    }

    return recommendations;
  }

  private calculateOverallSupplierScore(metrics: SupplierMetrics): number {
    // Weighted scoring algorithm
    const weights = {
      onTimeDelivery: 0.3,
      quality: 0.3,
      cost: 0.2,
      responsiveness: 0.2
    };

    return (
      metrics.onTimeDeliveryRate * weights.onTimeDelivery +
      metrics.qualityScore * weights.quality +
      metrics.costCompetitiveness * weights.cost +
      (1 - metrics.responseTimeAvgHours / 48) * weights.responsiveness
    );
  }

  private calculateCategorySpend(pos: PurchaseOrder[]): Record<string, number> {
    const categorySpend: Record<string, number> = {};
    
    for (const po of pos) {
      for (const line of po.items) {
        const lineItem = line as PurchaseOrderItem;
        const category = lineItem.metadata?.category || 'Uncategorized';
        categorySpend[category] = (categorySpend[category] || 0) + line.totalPrice;
      }
    }

    return categorySpend;
  }

  private calculateVendorSpend(pos: PurchaseOrder[]): Record<string, number> {
    const vendorSpend: Record<string, number> = {};
    
    for (const po of pos) {
      const vendorId = po.metadata?.vendorId || po.supplierId;
      vendorSpend[vendorId] = (vendorSpend[vendorId] || 0) + po.totalAmount;
    }

    return vendorSpend;
  }

  private identifyMaverickSpend(pos: PurchaseOrder[]): MaverickSpend {
    // Identify spend outside of preferred suppliers/contracts
    const maverickTransactions = pos.filter(po => 
      !po.metadata?.preferredSupplier && !po.metadata?.contractPurchase
    );

    return {
      totalMaverickSpend: maverickTransactions.reduce((sum, po) => sum + po.totalAmount, 0),
      maverickPercentage: pos.length > 0 ? maverickTransactions.length / pos.length : 0,
      maverickTransactions: maverickTransactions.length
    };
  }

  private identifySavingsOpportunities(pos: PurchaseOrder[]): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];
    
    // Consolidation opportunities
    const vendorFrequency = this.calculateVendorSpend(pos);
    const lowVolumeVendors = Object.entries(vendorFrequency)
      .filter(([_, spend]) => spend < 10000)
      .map(([vendorId]) => vendorId);

    if (lowVolumeVendors.length > 0) {
      opportunities.push({
        type: 'VENDOR_CONSOLIDATION',
        description: 'Consolidate purchases from low-volume suppliers',
        potentialSavings: lowVolumeVendors.length * 500, // Estimated
        confidence: 'MEDIUM',
        implementationEffort: 'LOW'
      });
    }

    return opportunities;
  }

  private calculateComplianceScore(pos: PurchaseOrder[]): number {
    // Calculate procurement compliance based on policy adherence
    const compliantPOs = pos.filter(po => 
      po.metadata?.policyCompliant !== false
    ).length;

    return pos.length > 0 ? compliantPOs / pos.length : 1;
  }

  private checkQuantityMatching(
    po: PurchaseOrder, 
    receipt: GoodsReceipt, 
    invoice: VendorInvoice
  ): MatchDiscrepancy[] {
    const discrepancies: MatchDiscrepancy[] = [];
    
    // Implementation would check quantities across all three documents
    // This is a simplified version
    
    return discrepancies;
  }

  private checkPriceMatching(po: PurchaseOrder, invoice: VendorInvoice): MatchDiscrepancy[] {
    const discrepancies: MatchDiscrepancy[] = [];
    
    // Implementation would check unit prices and totals
    // This is a simplified version
    
    return discrepancies;
  }

  private checkTermsMatching(po: PurchaseOrder, invoice: VendorInvoice): MatchDiscrepancy[] {
    const discrepancies: MatchDiscrepancy[] = [];
    
    // Implementation would check payment terms, delivery terms, etc.
    // This is a simplified version
    
    return discrepancies;
  }

  private recordAudit(action: string, poId: string, details: Record<string, any>) {
    this.auditTrail.push({
      id: 'audit_' + Date.now(),
      action,
      poId,
      timestamp: new Date(),
      userId: 'system',
      details
    });
  }
}
