// CRM-specific types for AIBOS SDKs

// ===== ACTIVITY MANAGEMENT =====
export enum ActivityStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  daysInAdvance: number;
}

export interface ActivityContext {
  customerId?: string;
  opportunityId?: string;
  leadId?: string;
  campaignId?: string;
}

export interface ActivitySuggestion {
  type: 'follow_up' | 'demo' | 'proposal' | 'meeting';
  priority: Priority;
  suggestedDate: Date;
  reason: string;
}

// ===== ANALYTICS & DASHBOARDS =====
export interface DateRange {
  start: Date;
  end: Date;
  timezone?: string;
}

export interface SalesDashboard {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  activeOpportunities: number;
  totalPipelineValue: number;
  averageDealSize: number;
}

export interface SalesForecast {
  period: DateRange;
  predictedRevenue: number;
  confidence: number;
  factors: string[];
}

// ===== LEAD MANAGEMENT =====
export interface LeadScoringEngine {
  score: number;
  factors: LeadScoringFactor[];
  lastUpdated: Date;
  calculateLeadScore: (leadData: any) => Promise<number>;
}

export interface LeadScoringFactor {
  factor: string;
  weight: number;
  value: any;
  score: number;
}

export interface AutomationEngine {
  id: string;
  name: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  isActive: boolean;
  triggerLeadCreated: (lead: any) => Promise<void>;
  triggerLeadConverted: (lead: any, customer: any, opportunity: any) => Promise<void>;
}

export interface AutomationTrigger {
  type: 'lead_created' | 'lead_updated' | 'activity_completed';
  conditions: Record<string, any>;
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'update_lead' | 'assign_lead';
  parameters: Record<string, any>;
}

export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  assignedTo?: string;
  metadata?: Record<string, any>;
  // Additional fields used in the service
  organization_id?: string;
  company_name?: string;
  contact_name?: string;
  industry?: string;
  estimated_value?: number;
  expected_close_date?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface LeadConversionData {
  leadId: string;
  customerId: string;
  opportunityId?: string;
  conversionDate: Date;
  conversionValue?: number;
  notes?: string;
  // Additional fields used in the service
  customer_type?: string;
  opportunity_name?: string;
}

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

// ===== MARKETING & CAMPAIGNS =====
export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface AudienceSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  size: number;
  lastUpdated: Date;
}

export interface CampaignContent {
  id: string;
  type: 'email' | 'sms' | 'social' | 'landing_page';
  subject?: string;
  body: string;
  metadata?: Record<string, any>;
  // Additional fields used in the service
  sequence?: any[];
  personalization_rules?: any[];
  dynamic_content?: string;
}

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  timezone: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  timeOfDay?: string; // HH:MM format
  // Additional fields used in the service
  start_date?: Date;
  send_times?: Date;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  conversionRate: number;
}

export interface NurtureCampaignInput {
  name: string;
  description: string;
  audience: AudienceSegment;
  content: CampaignContent[];
  schedule: CampaignSchedule;
  goals: string[];
  // Additional fields used in the service
  audience_segment?: AudienceSegment;
  industry?: string;
  start_date?: Date;
  timezone?: string;
  budget?: number;
}

// ===== CUSTOMER & OPPORTUNITY =====
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  name: string;
  customerId: string;
  stage: OpportunityStage;
  value: number;
  probability: number;
  expectedCloseDate: Date;
  created_at: string;
  updated_at: string;
}

// ===== UTILITY TYPES =====
export interface generateId {
  (): string;
}

// ===== SERVICE RESULT TYPES =====
export interface CRMServiceResult<T> {
  success: boolean;
  data?: T;
  errors: CRMError[];
  warnings: CRMWarning[];
}

export interface CRMError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: Date;
  field?: string;
}

export interface CRMWarning {
  code: string;
  message: string;
  field?: string;
  timestamp: Date;
}

// ===== ENUM TYPES =====
export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  SOCIAL_MEDIA = 'social_media',
  TRADE_SHOW = 'trade_show',
  EMAIL_CAMPAIGN = 'email_campaign',
  PARTNER = 'partner',
  ADVERTISEMENT = 'advertisement'
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CONVERTED = 'converted',
  LOST = 'lost',
  NURTURING = 'nurturing'
}

export enum LeadTemperature {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold'
}

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  WEBINAR = 'webinar',
  CONTENT = 'content',
  NURTURE = 'nurture'
} 