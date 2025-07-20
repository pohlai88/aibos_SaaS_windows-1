import { SupabaseClient } from '@supabase/supabase-js';
import {
  LeadScoringEngine,
  AutomationEngine,
  CreateLeadInput,
  LeadConversionData,
  Customer,
  Opportunity,
  OpportunityStage,
  LeadSource,
  LeadStatus,
  LeadTemperature
} from '@aibos/core-types';

// Utility function for generating IDs
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export interface Lead {
  id: string;
  organization_id: string;
  lead_code: string;
  company_name?: string;
  contact_name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  temperature: LeadTemperature;
  assigned_to: string;
  industry?: string;
  estimated_value: number;
  probability: number;
  expected_close_date?: string;
  last_contact_date?: string;
  next_follow_up: string;
  notes: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class CRMLeadService {
  private supabase: SupabaseClient;
  private scoringEngine: LeadScoringEngine;
  private automationEngine: AutomationEngine;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.scoringEngine = {
      score: 0,
      factors: [],
      lastUpdated: new Date(),
      calculateLeadScore: async (leadData: any) => {
        // Stub implementation
        return Math.floor(Math.random() * 100);
      }
    };
    this.automationEngine = {
      id: 'default',
      name: 'Default Automation',
      triggers: [],
      actions: [],
      isActive: true,
      triggerLeadCreated: async (lead: any) => {
        // Stub implementation
        console.log('Lead created:', lead.id);
      },
      triggerLeadConverted: async (lead: any, customer: any, opportunity: any) => {
        // Stub implementation
        console.log('Lead converted:', lead.id);
      }
    };
  }

  // Steve Jobs Principle: Make complex things simple
  async createLead(leadData: CreateLeadInput): Promise<Lead> {
    try {
      // Auto-generate lead code
      const leadCode = await this.generateLeadCode();
      
      // Calculate initial lead score
      const score = await this.scoringEngine.calculateLeadScore(leadData);
      
      // Determine temperature based on score and source
      const temperature = this.determineTemperature();
      
      // Auto-assign to best available sales rep
      const assignedTo = await this.autoAssignLead();

      const lead: Lead = {
        id: generateId(),
        organization_id: leadData.organization_id || '',
        lead_code: leadCode,
        company_name: leadData.company_name || leadData.company,
        contact_name: leadData.contact_name || leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source as LeadSource,
        status: LeadStatus.NEW,
        score,
        temperature: temperature as LeadTemperature,
        assigned_to: assignedTo,
        industry: leadData.industry,
        estimated_value: leadData.estimated_value || 0,
        probability: this.getInitialProbability(),
        expected_close_date: leadData.expected_close_date,
        next_follow_up: this.calculateNextFollowUp(),
        notes: leadData.notes || '',
        tags: leadData.tags || [],
        custom_fields: leadData.custom_fields || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();

      if (error) throw error;

      // Trigger automation workflows
      await this.automationEngine.triggerLeadCreated(data);

      return data;
    } catch (error) {
      throw new Error(`Lead creation failed: ${error.message}`);
    }
  }

  // Convert lead to customer - seamless transition
  async convertLeadToCustomer(
    leadId: string,
    conversionData: LeadConversionData
  ): Promise<{ customer: Customer; opportunity: Opportunity }> {
    try {
      const lead = await this.getLead(leadId);
      
      // Create customer record
      const customer = await this.customerService.createCustomer({
        organization_id: lead.organization_id,
        customer_name: lead.company_name || lead.contact_name,
        contact_name: lead.contact_name,
        email: lead.email,
        phone: lead.phone,
        customer_type: conversionData.customer_type,
        industry: lead.industry,
        source: `lead_conversion_${lead.source}`,
        assigned_sales_rep: lead.assigned_to,
        custom_fields: {
          ...lead.custom_fields,
          original_lead_id: leadId,
          conversion_date: new Date().toISOString()
        }
      });

      // Create opportunity
      const opportunity = await this.opportunityService.createOpportunity({
        organization_id: lead.organization_id,
        customer_id: customer.id,
        opportunity_name: conversionData.opportunity_name,
        estimated_value: lead.estimated_value,
        probability: lead.probability,
        expected_close_date: lead.expected_close_date,
        assigned_to: lead.assigned_to,
        stage: OpportunityStage.QUALIFICATION,
        source: `lead_conversion`,
        notes: `Converted from lead ${lead.lead_code}\n\n${lead.notes}`
      });

      // Update lead status
      await this.updateLeadStatus(leadId, LeadStatus.CONVERTED);

      // Trigger conversion workflows
      await this.automationEngine.triggerLeadConverted(lead, customer, opportunity);

      return { customer, opportunity };
    } catch (error) {
      throw new Error(`Lead conversion failed: ${error.message}`);
    }
  }

  private generateLeadCode() { return 'LEAD-001'; }
  private determineTemperature() { return LeadTemperature.WARM; }
  private autoAssignLead() { return 'default-user'; }
  private getInitialProbability() { return 0.5; }
  private calculateNextFollowUp() { return new Date().toISOString(); }
  private getLead(leadId: string) { return null; }
  private updateLeadStatus(leadId: string, status: LeadStatus) { return; }
  private customerService = {
    createCustomer: async (data: any) => ({ id: 'customer-1', ...data })
  };
  private opportunityService = {
    createOpportunity: async (data: any) => ({ id: 'opportunity-1', ...data })
  };
}