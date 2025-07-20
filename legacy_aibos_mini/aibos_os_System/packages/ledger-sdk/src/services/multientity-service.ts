import { createClient, SupabaseClient } from '@supabase/supabase-js';

// MultiEntity Types
export enum EntityType {
  PUBLIC_COMPANY = 'PublicCompany',
  PRIVATE_COMPANY = 'PrivateCompany',
  GOVERNMENT_LINKED = 'GovernmentLinked',
  BRANCH = 'Branch',
  HOLDING = 'Holding',
  SUBSIDIARY = 'Subsidiary',
  JOINT_VENTURE = 'JointVenture',
  PARTNERSHIP = 'Partnership',
  TRUST = 'Trust',
  FOUNDATION = 'Foundation'
}

export enum CountryCode {
  MY = 'MY', // Malaysia
  SG = 'SG', // Singapore
  TH = 'TH', // Thailand
  ID = 'ID', // Indonesia
  PH = 'PH', // Philippines
  VN = 'VN', // Vietnam
  BN = 'BN', // Brunei
  KH = 'KH', // Cambodia
  LA = 'LA', // Laos
  MM = 'MM'  // Myanmar
}

export enum OwnershipType {
  PRIVATE = 'Private',
  PUBLIC = 'Public',
  GOVERNMENT = 'Government',
  FOREIGN = 'Foreign',
  INSTITUTIONAL = 'Institutional',
  FAMILY_OWNED = 'FamilyOwned'
}

export enum EntityStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING_APPROVAL = 'PendingApproval',
  SUSPENDED = 'Suspended',
  IN_LIQUIDATION = 'InLiquidation',
  STRUCK_OFF = 'StruckOff'
}

export enum IndustrySector {
  AGRICULTURE = 'Agriculture',
  MANUFACTURING = 'Manufacturing',
  CONSTRUCTION = 'Construction',
  RETAIL = 'Retail',
  FINANCIAL = 'Financial',
  TECHNOLOGY = 'Technology',
  HEALTHCARE = 'Healthcare',
  TRANSPORTATION = 'Transportation',
  ENERGY = 'Energy',
  TELECOMMUNICATIONS = 'Telecommunications',
  REAL_ESTATE = 'RealEstate',
  PROFESSIONAL = 'Professional',
  EDUCATION = 'Education',
  ENTERTAINMENT = 'Entertainment',
  HOSPITALITY = 'Hospitality',
  MINING = 'Mining',
  UTILITIES = 'Utilities',
  MEDIA = 'Media',
  LOGISTICS = 'Logistics',
  INSURANCE = 'Insurance'
}

export interface Entity {
  id: string;
  name: string;
  legal_name: string;
  entity_type: EntityType;
  country_code: CountryCode;
  parent_entity_id?: string;
  registration_number: string;
  tax_id?: string;
  industry_sector: IndustrySector;
  ownership_type: OwnershipType;
  incorporation_date: string;
  financial_year_end: string;
  compliance_score?: number;
  risk_score?: number;
  status: EntityStatus;
  tags: string[];
  metadata: EntityMetadata;
  createdAt: string;
  updatedAt: string;
  created_by: string;
  updated_by?: string;
  // Enhanced fields for SEA consolidation
  timezone: string; // Always GMT+8 for consistency
  reporting_currency: string;
  consolidation_group: string;
  direct_company: boolean; // Is this a direct company or associate?
  associate_type?: 'Direct' | 'Associate' | 'JointVenture' | 'Subsidiary';
  beneficial_owners: BeneficialOwner[];
  shareholding_structure: ShareholdingStructure;
  regulatory_compliance: RegulatoryCompliance;
  audit_firm?: string;
  audit_partner?: string;
  board_members: BoardMember[];
  key_management: KeyManagement[];
}

export interface EntityMetadata {
  regulatory_body?: string;
  license_numbers?: string[];
  capital_structure?: CapitalStructure;
  banking_details?: BankingDetail[];
  local_requirements?: LocalRequirement[];
  consolidation_notes?: string;
}

export interface CapitalStructure {
  authorized_capital: number;
  issued_capital: number;
  currency: string;
  share_classes: ShareClass[];
  paid_up_capital: number;
  share_premium?: number;
}

export interface ShareClass {
  class: string;
  voting_rights: number;
  dividend_rights: number;
  shares_issued: number;
  shares_authorized: number;
  par_value: number;
}

export interface BeneficialOwner {
  name: string;
  ownership_percentage: number;
  nationality: CountryCode;
  identification_type?: string;
  identification_number?: string;
  ultimate_beneficial_owner: boolean;
  politically_exposed_person: boolean;
}

export interface BankingDetail {
  bank_name: string;
  accountNumber: string;
  account_type: string;
  currency: string;
  branch_code?: string;
  swift_code?: string;
  is_primary: boolean;
}

export interface LocalRequirement {
  country: CountryCode;
  requirement_type: string;
  description: string;
  due_date: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  penalty_amount?: number;
  penalty_currency?: string;
}

export interface ShareholdingStructure {
  total_shares: number;
  share_classes: ShareClass[];
  major_shareholders: MajorShareholder[];
  cross_ownership: CrossOwnership[];
}

export interface MajorShareholder {
  name: string;
  shares_held: number;
  percentage: number;
  share_class: string;
  relationship: 'Direct' | 'Indirect' | 'Beneficial';
}

export interface CrossOwnership {
  related_entity_id: string;
  related_entity_name: string;
  ownership_percentage: number;
  relationship_type: 'Parent' | 'Subsidiary' | 'Associate' | 'JointVenture';
}

export interface RegulatoryCompliance {
  tax_compliance: TaxCompliance;
  corporate_governance: CorporateGovernance;
  financial_reporting: FinancialReporting;
  industry_regulations: IndustryRegulation[];
}

export interface TaxCompliance {
  tax_authority: string;
  tax_registration_number: string;
  tax_registration_date: string;
  tax_year_end: string;
  filing_frequency: 'Monthly' | 'Quarterly' | 'Annually';
  last_filing_date?: string;
  next_filing_date: string;
  compliance_status: 'Compliant' | 'NonCompliant' | 'Pending';
  outstanding_liabilities: number;
  currency: string;
}

export interface CorporateGovernance {
  board_size: number;
  independent_directors: number;
  audit_committee: boolean;
  remuneration_committee: boolean;
  nomination_committee: boolean;
  risk_committee: boolean;
  last_agm_date?: string;
  next_agm_date: string;
  corporate_secretary: string;
  registered_office: string;
}

export interface FinancialReporting {
  reporting_standard: string; // MFRS, SFRS, TFRS, etc.
  audit_requirement: boolean;
  audit_exemption?: boolean;
  filing_deadline: string;
  last_filing_date?: string;
  next_filing_date: string;
  reporting_currency: string;
  consolidation_required: boolean;
}

export interface IndustryRegulation {
  regulatory_body: string;
  license_number: string;
  license_expiry: string;
  compliance_status: 'Compliant' | 'NonCompliant' | 'Pending';
  last_inspection_date?: string;
  next_inspection_date?: string;
}

export interface BoardMember {
  name: string;
  position: string;
  appointment_date: string;
  term_end_date?: string;
  nationality: CountryCode;
  independent: boolean;
  qualifications: string[];
  other_directorships: string[];
}

export interface KeyManagement {
  name: string;
  position: string;
  appointment_date: string;
  nationality: CountryCode;
  qualifications: string[];
  reporting_to?: string;
}

export interface ConsolidationGroup {
  id: string;
  name: string;
  parent_entity_id?: string;
  consolidation_method: 'Full' | 'Equity' | 'Proportional';
  reporting_currency: string;
  timezone: string; // Always GMT+8
  fiscal_year_end: string;
  consolidation_entities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsolidationReport {
  id: string;
  group_id: string;
  reporting_period: string;
  report_type: 'Monthly' | 'Quarterly' | 'Annual';
  status: 'Draft' | 'InReview' | 'Final' | 'Filed';
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  revenue: number;
  profit_before_tax: number;
  profit_after_tax: number;
  currency: string;
  exchange_rates: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  created_by: string;
  reviewed_by?: string;
  filed_date?: string;
}

export interface EntityRelationship {
  id: string;
  parent_entity_id: string;
  child_entity_id: string;
  relationship_type: 'Subsidiary' | 'Associate' | 'JointVenture' | 'Branch';
  ownership_percentage: number;
  voting_rights_percentage: number;
  effective_date: string;
  termination_date?: string;
  consolidation_method: 'Full' | 'Equity' | 'Proportional';
  createdAt: string;
  updatedAt: string;
}

export class MultiEntityService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new entity with SEA-specific validation
   */
  async createEntity(entityData: Partial<Entity>): Promise<Entity> {
    try {
      // Validate tax ID format based on country
      if (entityData.tax_id && entityData.country_code) {
        const isValidTaxId = this.validateTaxId(entityData.tax_id, entityData.country_code);
        if (!isValidTaxId) {
          throw new Error(`Invalid tax ID format for ${entityData.country_code}`);
        }
      }

      // Set default timezone to GMT+8 for consistency
      const entity: Entity = {
        id: crypto.randomUUID(),
        name: entityData.name!,
        legal_name: entityData.legal_name!,
        entity_type: entityData.entity_type!,
        country_code: entityData.country_code!,
        parent_entity_id: entityData.parent_entity_id,
        registration_number: entityData.registration_number!,
        tax_id: entityData.tax_id,
        industry_sector: entityData.industry_sector!,
        ownership_type: entityData.ownership_type!,
        incorporation_date: entityData.incorporation_date!,
        financial_year_end: entityData.financial_year_end!,
        compliance_score: entityData.compliance_score || 0,
        risk_score: entityData.risk_score || 0,
        status: entityData.status || EntityStatus.ACTIVE,
        tags: entityData.tags || [],
        metadata: entityData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: entityData.created_by!,
        updated_by: entityData.updated_by,
        // Enhanced fields
        timezone: 'GMT+8', // Standardized for all SEA entities
        reporting_currency: entityData.reporting_currency || this.getDefaultCurrency(entityData.country_code!),
        consolidation_group: entityData.consolidation_group || 'default',
        direct_company: entityData.direct_company || false,
        associate_type: entityData.associate_type,
        beneficial_owners: entityData.beneficial_owners || [],
        shareholding_structure: entityData.shareholding_structure || {
          total_shares: 0,
          share_classes: [],
          major_shareholders: [],
          cross_ownership: []
        },
        regulatory_compliance: entityData.regulatory_compliance || {
          tax_compliance: {
            tax_authority: '',
            tax_registration_number: '',
            tax_registration_date: '',
            tax_year_end: '',
            filing_frequency: 'Annually',
            next_filing_date: '',
            compliance_status: 'Pending',
            outstanding_liabilities: 0,
            currency: ''
          },
          corporate_governance: {
            board_size: 0,
            independent_directors: 0,
            audit_committee: false,
            remuneration_committee: false,
            nomination_committee: false,
            risk_committee: false,
            next_agm_date: '',
            corporate_secretary: '',
            registered_office: ''
          },
          financial_reporting: {
            reporting_standard: this.getDefaultReportingStandard(entityData.country_code!),
            audit_requirement: true,
            filing_deadline: '',
            next_filing_date: '',
            reporting_currency: '',
            consolidation_required: false
          },
          industry_regulations: []
        },
        audit_firm: entityData.audit_firm,
        audit_partner: entityData.audit_partner,
        board_members: entityData.board_members || [],
        key_management: entityData.key_management || []
      };

      const { data, error } = await this.supabase
        .from('entities')
        .insert(entity)
        .select()
        .single();

      if (error) throw error;

      // Create entity relationship if parent is specified
      if (entity.parent_entity_id) {
        await this.createEntityRelationship({
          parent_entity_id: entity.parent_entity_id,
          child_entity_id: entity.id,
          relationship_type: 'Subsidiary',
          ownership_percentage: 100,
          voting_rights_percentage: 100,
          effective_date: new Date().toISOString(),
          consolidation_method: 'Full'
        });
      }

      return data;
    } catch (error) {
      throw new Error(`Error creating entity: ${error}`);
    }
  }

  /**
   * Get entity by ID with full relationship tree
   */
  async getEntity(id: string): Promise<Entity | null> {
    try {
      const { data, error } = await this.supabase
        .from('entities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting entity:', error);
      return null;
    }
  }

  /**
   * Get entity hierarchy (parent and children)
   */
  async getEntityHierarchy(entityId: string): Promise<{
    parent?: Entity;
    children: Entity[];
    siblings: Entity[];
  }> {
    try {
      // Get parent
      const { data: parent } = await this.supabase
        .from('entities')
        .select('*')
        .eq('id', entityId)
        .single();

      // Get children
      const { data: children } = await this.supabase
        .from('entities')
        .select('*')
        .eq('parent_entity_id', entityId);

      // Get siblings
      const { data: siblings } = await this.supabase
        .from('entities')
        .select('*')
        .eq('parent_entity_id', parent?.parent_entity_id)
        .neq('id', entityId);

      return {
        parent: parent || undefined,
        children: children || [],
        siblings: siblings || []
      };
    } catch (error) {
      console.error('Error getting entity hierarchy:', error);
      return { children: [], siblings: [] };
    }
  }

  /**
   * Get consolidation group
   */
  async getConsolidationGroup(groupId: string): Promise<ConsolidationGroup | null> {
    try {
      const { data, error } = await this.supabase
        .from('consolidation_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting consolidation group:', error);
      return null;
    }
  }

  /**
   * Create consolidation report
   */
  async createConsolidationReport(reportData: Partial<ConsolidationReport>): Promise<ConsolidationReport> {
    try {
      const report: ConsolidationReport = {
        id: crypto.randomUUID(),
        group_id: reportData.group_id!,
        reporting_period: reportData.reporting_period!,
        report_type: reportData.report_type!,
        status: reportData.status || 'Draft',
        total_assets: reportData.total_assets || 0,
        total_liabilities: reportData.total_liabilities || 0,
        total_equity: reportData.total_equity || 0,
        revenue: reportData.revenue || 0,
        profit_before_tax: reportData.profit_before_tax || 0,
        profit_after_tax: reportData.profit_after_tax || 0,
        currency: reportData.currency || 'USD',
        exchange_rates: reportData.exchange_rates || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: reportData.created_by!,
        reviewed_by: reportData.reviewed_by,
        filed_date: reportData.filed_date
      };

      const { data, error } = await this.supabase
        .from('consolidation_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error creating consolidation report: ${error}`);
    }
  }

  /**
   * Get entities by country with compliance status
   */
  async getEntitiesByCountry(countryCode: CountryCode): Promise<Entity[]> {
    try {
      const { data, error } = await this.supabase
        .from('entities')
        .select('*')
        .eq('country_code', countryCode)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting entities by country:', error);
      return [];
    }
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(organizationId: string): Promise<any> {
    try {
      const { data: entities } = await this.supabase
        .from('entities')
        .select('*')
        .eq('organizationId', organizationId);

      const complianceStats = {
        total_entities: entities?.length || 0,
        compliant_entities: entities?.filter(e => e.compliance_score >= 80).length || 0,
        non_compliant_entities: entities?.filter(e => e.compliance_score < 80).length || 0,
        pending_approval: entities?.filter(e => e.status === EntityStatus.PENDING_APPROVAL).length || 0,
        by_country: {} as Record<string, number>,
        by_industry: {} as Record<string, number>,
        upcoming_deadlines: [] as any[]
      };

      // Group by country
      entities?.forEach(entity => {
        complianceStats.by_country[entity.country_code] = (complianceStats.by_country[entity.country_code] || 0) + 1;
        complianceStats.by_industry[entity.industry_sector] = (complianceStats.by_industry[entity.industry_sector] || 0) + 1;
      });

      return complianceStats;
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      return {};
    }
  }

  /**
   * Validate tax ID format for SEA countries
   */
  private validateTaxId(taxId: string, countryCode: CountryCode): boolean {
    const patterns: Record<CountryCode, RegExp> = {
      [CountryCode.SG]: /^[0-9]{8}[A-Z]$/, // UEN format
      [CountryCode.MY]: /^[0-9]{12}$/, // SST format
      [CountryCode.TH]: /^[0-9]{13}$/, // VAT format
      [CountryCode.ID]: /^[0-9]{15}$/, // NPWP format
      [CountryCode.PH]: /^[0-9]{9}-[0-9]{3}$/, // TIN format
      [CountryCode.VN]: /^[0-9]{10}$/, // MST format
      [CountryCode.BN]: /^[0-9]{11}$/, // Brunei format
      [CountryCode.KH]: /^[0-9]{9}$/, // Cambodia format
      [CountryCode.LA]: /^[0-9]{10}$/, // Laos format
      [CountryCode.MM]: /^[0-9]{9}$/ // Myanmar format
    };

    return patterns[countryCode]?.test(taxId) || false;
  }

  /**
   * Get default currency for country
   */
  private getDefaultCurrency(countryCode: CountryCode): string {
    const currencies: Record<CountryCode, string> = {
      [CountryCode.SG]: 'SGD',
      [CountryCode.MY]: 'MYR',
      [CountryCode.TH]: 'THB',
      [CountryCode.ID]: 'IDR',
      [CountryCode.PH]: 'PHP',
      [CountryCode.VN]: 'VND',
      [CountryCode.BN]: 'BND',
      [CountryCode.KH]: 'KHR',
      [CountryCode.LA]: 'LAK',
      [CountryCode.MM]: 'MMK'
    };

    return currencies[countryCode] || 'USD';
  }

  /**
   * Get default reporting standard for country
   */
  private getDefaultReportingStandard(countryCode: CountryCode): string {
    const standards: Record<CountryCode, string> = {
      [CountryCode.SG]: 'SFRS',
      [CountryCode.MY]: 'MFRS',
      [CountryCode.TH]: 'TFRS',
      [CountryCode.ID]: 'PSAK',
      [CountryCode.PH]: 'PFRS',
      [CountryCode.VN]: 'VAS',
      [CountryCode.BN]: 'IFRS',
      [CountryCode.KH]: 'IFRS',
      [CountryCode.LA]: 'IFRS',
      [CountryCode.MM]: 'IFRS'
    };

    return standards[countryCode] || 'IFRS';
  }

  /**
   * Create entity relationship
   */
  private async createEntityRelationship(relationship: Partial<EntityRelationship>): Promise<void> {
    try {
      const entityRelationship: EntityRelationship = {
        id: crypto.randomUUID(),
        parent_entity_id: relationship.parent_entity_id!,
        child_entity_id: relationship.child_entity_id!,
        relationship_type: relationship.relationship_type!,
        ownership_percentage: relationship.ownership_percentage!,
        voting_rights_percentage: relationship.voting_rights_percentage!,
        effective_date: relationship.effective_date!,
        termination_date: relationship.termination_date,
        consolidation_method: relationship.consolidation_method!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.supabase
        .from('entity_relationships')
        .insert(entityRelationship);
    } catch (error) {
      console.error('Error creating entity relationship:', error);
    }
  }
}

export default MultiEntityService; 