// Shared types for procurement services

import { PurchaseOrderItem as CorePurchaseOrderItem } from '@aibos/core-types';

export interface ProductSpecification {
  name: string;
  value: string | number;
  unit?: string;
  category: string;
}

export interface PreferredSupplier {
  supplierId: string;
  supplierName: string;
  rating: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  priceCompetitiveness: number;
  qualityScore: number;
  deliveryReliability: number;
}

export interface ContractPricing {
  contractId: string;
  supplierId: string;
  unitPrice: number;
  currency: string;
  volumeDiscounts: Array<{
    minQuantity: number;
    discountPercentage: number;
  }>;
  effectiveDate: string;
  expiryDate: string;
}

export interface CatalogItem {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  categoryHierarchy: string[];
  specifications: ProductSpecification[];
  preferredSuppliers: PreferredSupplier[];
  contractPricing: ContractPricing[];
  complianceCertifications: string[];
  sustainabilityScore: number;
  availabilityStatus: 'AVAILABLE' | 'LIMITED' | 'DISCONTINUED';
  leadTimeDays: number;
  minimumOrderQuantity: number;
  images: string[];
  documents: string[];
}

export interface RFQItem {
  id: string;
  description: string;
  specifications: Record<string, any>;
  quantity: number;
  unitOfMeasure: string;
  deliveryRequirements: {
    location: string;
    requiredDate: Date;
    specialInstructions?: string;
  };
  attachments?: string[];
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage
  scoringMethod: 'LOWEST_PRICE' | 'HIGHEST_SCORE' | 'BEST_VALUE';
  subCriteria?: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
}

export interface SupplierResponse {
  id: string;
  rfqId: string;
  supplierId: string;
  submittedAt: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CLARIFICATION_REQUESTED' | 'EVALUATED';
  lineItems: Array<{
    rfqItemId: string;
    unitPrice: number;
    totalPrice: number;
    deliveryDate: Date;
    complianceNotes?: string;
    alternatives?: Array<{
      description: string;
      unitPrice: number;
      benefits: string;
    }>;
  }>;
  commercialTerms: {
    paymentTerms: string;
    warrantyPeriod: string;
    deliveryTerms: string;
    validityPeriodDays: number;
  };
  technicalCompliance: Array<{
    requirementId: string;
    compliant: boolean;
    explanation?: string;
    supportingDocuments?: string[];
  }>;
  attachments: string[];
  totalValue: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'gauge';
  title: string;
  data: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SpendAlert {
  id: string;
  type: 'overspend' | 'maverick' | 'compliance' | 'savings';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  actionable: boolean;
}

export interface ExecutiveDashboard {
  organizationId: string;
  period: DateRange;
  summaryMetrics: {
    totalSpend: number;
    savingsAchieved: number;
    supplierCount: number;
    maverickSpendPercentage: number;
    complianceScore: number;
  };
  keyInsights: string[];
  recommendations: string[];
  visualizations: DashboardWidget[];
}

export interface SavingsOpportunity {
  id: string;
  category: string;
  description: string;
  potentialSavings: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timelineMonths: number;
  riskLevel: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface SupplierPermission {
  resource: string;
  actions: string[];
  scope: 'read' | 'write' | 'admin';
}

export interface PortalCredentials {
  supplierId: string;
  username: string;
  password: string;
  apiKey?: string;
  accessToken?: string;
  expiryDate: string;
}

export interface SyncResult {
  supplierId: string;
  status: 'success' | 'partial' | 'failed';
  itemsSynced: number;
  itemsFailed: number;
  errors: string[];
  syncDate: string;
}

// Placeholder types for missing definitions
export interface PaymentGatewayConnector {
  // Placeholder implementation
}

export interface DocumentManagementConnector {
  // Placeholder implementation
}

export interface ComplianceServiceConnector {
  // Placeholder implementation
}

export interface SAPConfig {
  // Placeholder implementation
}

export interface OracleConfig {
  // Placeholder implementation
}

export interface NetSuiteConfig {
  // Placeholder implementation
}

export interface AribaConnection {
  // Placeholder implementation
}

export interface CoupaConnection {
  // Placeholder implementation
}

export interface JaggaerConnection {
  // Placeholder implementation
}

export interface KPITracking {
  // Placeholder implementation
}

export interface AlertSystem {
  // Placeholder implementation
}

export interface CustomReportEngine {
  // Placeholder implementation
}

export interface TimeFrame {
  // Placeholder implementation
}

export interface ReportConfiguration {
  id: string;
  name: string;
  template: string;
  parameters: Record<string, any>;
  outputFormat: 'pdf' | 'excel' | 'csv' | 'json';
}

// Additional types from other services
export interface ProcurementAIConfig {
  modelVersion: string;
  trainingDataSource: string;
  confidenceThreshold: number;
  autoApprovalEnabled: boolean;
  learningRate: number;
  maxIterations: number;
}

export interface DemandForecast {
  itemId: string;
  period: string;
  forecastedQuantity: number;
  confidenceLevel: number;
  factors: string[];
  lastUpdated: string;
}

export interface PriceIntelligence {
  itemId: string;
  marketPrice: number;
  competitorPrices: Array<{
    competitor: string;
    price: number;
    currency: string;
  }>;
  priceTrend: 'increasing' | 'decreasing' | 'stable';
  volatilityScore: number;
  lastUpdated: string;
}

export interface SupplierRiskPrediction {
  supplierId: string;
  riskScore: number;
  riskFactors: string[];
  probabilityOfDefault: number;
  recommendedActions: string[];
  lastAssessment: string;
}

export interface SmartProcurementRecommendations {
  category: string;
  recommendations: Array<{
    type: 'consolidation' | 'substitution' | 'negotiation' | 'automation';
    description: string;
    potentialSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  totalPotentialSavings: number;
  generatedAt: string;
}

export interface IntegrationHub {
  id: string;
  name: string;
  type: 'erp' | 'crm' | 'supplier_portal' | 'payment_gateway';
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  config: Record<string, any>;
}

export interface ProcurementDashboard {
  organizationId: string;
  widgets: DashboardWidget[];
  layout: Record<string, any>;
  refreshInterval: number;
  lastUpdated: string;
}

export interface RealTimeMetrics {
  totalSpend: number;
  activeSuppliers: number;
  pendingApprovals: number;
  savingsAchieved: number;
  complianceScore: number;
  timestamp: string;
}

export interface PredictiveAnalyticsEngine {
  id: string;
  name: string;
  modelType: 'regression' | 'classification' | 'clustering';
  accuracy: number;
  lastTrained: string;
  features: string[];
  predictions: Array<{
    target: string;
    predictedValue: number;
    confidence: number;
    timestamp: string;
  }>;
}

export interface BudgetControl {
  id: string;
  name: string;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  period: string;
  alerts: BudgetAlert[];
  status: 'under_budget' | 'at_risk' | 'over_budget';
}

export interface BudgetPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  allocatedAmount: number;
  spentAmount: number;
  categoryBreakdown: Record<string, number>;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'threshold' | 'trend' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: string;
  resolved: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  steps: ApprovalRule[];
  escalationPolicy: EscalationPolicy;
  autoApprovalThreshold: number;
  status: 'active' | 'inactive' | 'draft';
}

export interface ApprovalRule {
  id: string;
  name: string;
  conditions: Record<string, any>;
  approvers: ApproverConfig[];
  order: number;
  timeoutHours: number;
}

export interface ApproverConfig {
  userId: string;
  role: string;
  approvalThreshold: number;
  canOverride: boolean;
  notificationPreferences: string[];
}

export interface EscalationPolicy {
  id: string;
  name: string;
  escalationRules: Array<{
    condition: string;
    action: string;
    target: string;
    delayHours: number;
  }>;
  maxEscalationLevels: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connectionPoolSize: number;
  sslEnabled: boolean;
}

export interface CacheConfig {
  type: 'redis' | 'memory' | 'file';
  host: string;
  port: number;
  ttlSeconds: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export interface RFQDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetRange: {
    min: number;
    max: number;
  };
  deadline: string;
  requirements: RFQRequirement[];
  evaluationCriteria: EvaluationCriteria[];
  status: 'draft' | 'published' | 'evaluating' | 'awarded' | 'closed';
}

export interface RFQRequirement {
  id: string;
  rfqId: string;
  requirementType: 'technical' | 'commercial' | 'compliance';
  description: string;
  mandatory: boolean;
  weight: number;
  criteria: string[];
}

export interface EvaluationResult {
  id: string;
  rfqId: string;
  supplierResponseId: string;
  evaluatorId: string;
  criteriaScores: Array<{
    criteriaId: string;
    score: number;
    comments: string;
  }>;
  totalScore: number;
  ranking: number;
  recommendation: 'accept' | 'reject' | 'shortlist';
  comments: string;
  evaluatedAt: string;
}

export interface CatalogFilters {
  category?: string;
  supplier?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: 'AVAILABLE' | 'LIMITED' | 'DISCONTINUED';
  sustainabilityScore?: number;
  complianceCertifications?: string[];
}

export interface CatalogSearchResults {
  items: CatalogItem[];
  totalCount: number;
  searchTimeMs: number;
  suggestions: string[];
  filtersApplied: CatalogFilters;
}

export interface ItemRecommendations {
  itemId: string;
  alternatives: Array<{
    item: CatalogItem;
    similarityScore: number;
    reason: string;
  }>;
  crossSellItems: CatalogItem[];
  upSellItems: CatalogItem[];
}

export interface SupplierPortal {
  supplierId: string;
  portalUrl: string;
  features: string[];
  permissions: SupplierPermission[];
  lastSync: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface PurchaseOrderItem extends CorePurchaseOrderItem {
  metadata?: {
    customField1?: string;
    customField2?: number;
    // Add other metadata fields as needed
  };
}

export interface ExecutiveDashboard {
  totalSpend: number;
  savingsOpportunities: number;
  topCategories: string[];
  // Add other required fields
} 