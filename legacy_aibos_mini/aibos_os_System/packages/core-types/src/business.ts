// Business types used across multiple packages

export interface UserContext {
  userId: string;
  user_id?: string; // Legacy compatibility
  organizationId: string;
  organization_id?: string; // Legacy compatibility
  role: string;
  permissions: string[];
  correlationId?: string;
  correlation_id?: string; // Legacy compatibility
  ip_address?: string; // For audit logging
  user_agent?: string; // For audit logging
}

export interface SupplierRating {
  supplierId: string;
  rating: number;
  category: string;
  lastUpdated: Date;
  criteria: {
    quality: number;
    delivery: number;
    price: number;
    communication: number;
  };
}

export interface ProcurementItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  currency: string;
  supplierId: string;
  specifications: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action';
  order: number;
  assignees: string[];
  conditions?: Record<string, any>;
  actions?: string[];
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

export interface ContractTerms {
  id: string;
  contractId: string;
  terms: string;
  effectiveDate: Date;
  expiryDate: Date;
  version: number;
}

export interface ContractPricing {
  id: string;
  contractId: string;
  itemId: string;
  unitPrice: number;
  currency: string;
  volumeDiscounts: Array<{
    minQuantity: number;
    discountPercentage: number;
  }>;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  mandatory: boolean;
  validationRules: string[];
}

export interface RenewalOption {
  id: string;
  contractId: string;
  renewalType: 'automatic' | 'manual' | 'conditional';
  noticePeriod: number;
  terms: string;
}

export interface ComplianceReport {
  id: string;
  organizationId: string;
  reportType: string;
  generatedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  data: Record<string, any>;
}

export interface RenewalAlert {
  id: string;
  contractId: string;
  alertType: 'renewal' | 'expiry' | 'review';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

// Integration types
export interface SAPConfig {
  baseUrl: string;
  clientId: string;
  username: string;
  password: string;
  systemId: string;
}

export interface OracleConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  serviceName: string;
}

export interface NetSuiteConfig {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
}

export interface AribaConnection {
  baseUrl: string;
  apiKey: string;
  realm: string;
  username: string;
  password: string;
}

export interface CoupaConnection {
  baseUrl: string;
  apiKey: string;
  username: string;
  password: string;
}

export interface JaggaerConnection {
  baseUrl: string;
  apiKey: string;
  username: string;
  password: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  timestamp: Date;
}

// Analytics and reporting types
export interface KPITracking {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AlertSystem {
  id: string;
  name: string;
  type: 'threshold' | 'trend' | 'anomaly';
  conditions: Record<string, any>;
  actions: string[];
  enabled: boolean;
}

export interface CustomReportEngine {
  id: string;
  name: string;
  query: string;
  parameters: Record<string, any>;
  schedule?: string;
  recipients: string[];
}

export interface TimeFrame {
  startDate: Date;
  endDate: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface ExecutiveDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: Record<string, any>;
  refreshInterval: number;
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

export interface ReportConfiguration {
  id: string;
  name: string;
  template: string;
  parameters: Record<string, any>;
  outputFormat: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface CustomReport {
  id: string;
  name: string;
  configuration: ReportConfiguration;
  generatedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  fileUrl?: string;
}

export interface AlertConfiguration {
  id: string;
  name: string;
  conditions: Record<string, any>;
  actions: string[];
  recipients: string[];
  enabled: boolean;
}

export interface AlertSetup {
  id: string;
  name: string;
  type: string;
  configuration: AlertConfiguration;
  schedule?: string;
  lastTriggered?: Date;
} 