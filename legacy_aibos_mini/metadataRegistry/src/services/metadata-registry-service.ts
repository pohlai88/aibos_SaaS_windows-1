import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BaseEntity } from '../types';

// Metadata Registry Types
export enum DataType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  SHORT_DATE = 'short_date',
  LONG_DATE = 'long_date',
  NUMBER = 'number',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  JSON = 'json',
  ARRAY = 'array'
}

export enum MetadataStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

export enum Domain {
  ACCOUNTING = 'accounting',
  FINANCE = 'finance',
  HR = 'hr',
  SALES = 'sales',
  MARKETING = 'marketing',
  OPERATIONS = 'operations',
  COMPLIANCE = 'compliance',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  EMPLOYEE = 'employee',
  INVENTORY = 'inventory',
  PROJECT = 'project',
  REPORTING = 'reporting',
  AUDIT = 'audit',
  TAX = 'tax',
  GENERAL = 'general'
}

export enum SecurityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export enum ComplianceStandard {
  GDPR = 'gdpr',
  SOX = 'sox',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  NONE = 'none'
}

export enum IntegrationPlatform {
  SALESFORCE = 'salesforce',
  HUBSPOT = 'hubspot',
  QUICKBOOKS = 'quickbooks',
  SAP = 'sap',
  ORACLE = 'oracle',
  CUSTOM = 'custom'
}

export interface MetadataField extends BaseEntity {
  field_name: string;
  data_type: DataType;
  description: string;
  domain: Domain;
  security_level: SecurityLevel;
  is_required: boolean;
  default_value?: string;
  validation_rules?: Record<string, any>;
  compliance_standards: ComplianceStandard[];
  integration_platforms: IntegrationPlatform[];
  usage_count: number;
  last_used_at?: string;
  created_by: string;
  status: MetadataStatus;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface LocalMetadataField {
  id: string;
  local_name: string;
  mapped_field_id?: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_mapped: boolean;
  confidence_score?: number;
  suggestions: MetadataSuggestion[];
  created_at: string;
}

export interface MetadataSuggestion {
  field: MetadataField;
  confidence_score: number;
  match_reasons: string[];
  compatibility_score: number;
}

export interface MetadataTerm {
  id: string;
  term_name: string;
  term_prefix: string; // e.g., 'term_customer', 'term_finance'
  display_name: string;
  description: string;
  data_type: DataType;
  domain: Domain;
  validation_rules: ValidationRule[];
  allowed_values?: string[]; // For ENUM types
  default_value?: string;
  is_required: boolean;
  is_sensitive: boolean;
  is_pii: boolean;
  security_level: SecurityLevel;
  compliance_standards: ComplianceStandard[];
  synonyms: string[];
  tags: string[];
  usage_context: string[];
  created_by: string;
  status: MetadataStatus;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  rule_type: 'regex' | 'length' | 'range' | 'enum' | 'custom';
  rule_value: string;
  error_message: string;
  is_critical: boolean;
}

export interface MetadataMapping {
  id: string;
  source_term_id: string;
  target_term_id: string;
  mapping_type: 'exact' | 'fuzzy' | 'transform';
  confidence_score: number;
  transformation_rules?: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface MetadataUsage extends BaseEntity {
  term_id: string;
  table_name: string;
  column_name: string;
  usage_type: 'read' | 'write' | 'transform';
  frequency: number;
  last_accessed: string;
  performance_metrics?: Record<string, any>;
}

export interface MetadataChangeLog extends BaseEntity {
  field_id: string;
  change_type: 'created' | 'updated' | 'deleted' | 'status_changed';
  old_values?: Record<string, any>;
  new_values: Record<string, any>;
  changed_by: string;
  reason?: string;
}

export interface CompatibilityMatrix {
  frontend_frameworks: Record<string, boolean>;
  backend_platforms: Record<string, boolean>;
  cloud_providers: Record<string, boolean>;
  integration_complexity: 'low' | 'medium' | 'high';
  estimated_implementation_hours: number;
}

export interface ApiRouteSpecification {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  parameters: Record<string, any>;
  response_schema: Record<string, any>;
  authentication_required: boolean;
}

export interface ModuleInfo {
  id: string;
  name: string;
  version: string;
  api_routes: ApiRouteSpecification[];
  required_fields: string[];
  optional_fields: string[];
}

export class MetadataRegistryService {
  private supabase: SupabaseClient;
  private static instance: MetadataRegistryService | null = null;

  constructor(supabaseUrl: string, supabaseKey: string) {
    // Check if we already have an instance with the same credentials
    if (MetadataRegistryService.instance && 
        MetadataRegistryService.instance.supabase.supabaseUrl === supabaseUrl) {
      return MetadataRegistryService.instance;
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    MetadataRegistryService.instance = this;
  }

  /**
   * Enhanced field suggestion with compatibility and compliance analysis
   */
  async suggestFields(
    newFieldName: string,
    organizationId?: string,
    context?: {
      domain?: Domain;
      dataType?: DataType;
      securityLevel?: SecurityLevel;
    }
  ): Promise<MetadataSuggestion[]> {
    try {
      const { data: existingFields, error } = await this.supabase
        .from('metadata_fields')
        .select('*')
        .eq('status', MetadataStatus.ACTIVE);

      if (error) throw error;

      // Simple matching algorithm for demonstration
      const suggestions: MetadataSuggestion[] = existingFields
        .filter(field => 
          field.field_name.toLowerCase().includes(newFieldName.toLowerCase()) ||
          newFieldName.toLowerCase().includes(field.field_name.toLowerCase())
        )
        .map(field => ({
          field,
          confidence_score: this.calculateConfidenceScore(newFieldName, field.field_name),
          match_reasons: this.getMatchReasons(newFieldName, field),
          compatibility_score: this.calculateCompatibilityScore(field, context)
        }))
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 5);

      return suggestions;
    } catch (error) {
      console.error('Error suggesting fields:', error);
      return [];
    }
  }

  /**
   * Register a new metadata field with enhanced features
   */
  async registerMetadataField(
    fieldData: Omit<MetadataField, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used_at'>,
    organizationId: string
  ): Promise<MetadataField> {
    try {
      const { data, error } = await this.supabase
        .from('metadata_fields')
        .insert([{
          ...fieldData,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering metadata field:', error);
      throw error;
    }
  }

  /**
   * Register a new metadata term with prefix validation
   */
  async registerMetadataTerm(
    termData: Omit<MetadataTerm, 'id' | 'created_at' | 'updated_at'>,
    organizationId: string
  ): Promise<MetadataTerm> {
    try {
      // Validate term prefix format
      if (!this.validateTermPrefix(termData.term_prefix)) {
        throw new Error(`Invalid term prefix format: ${termData.term_prefix}. Must follow pattern: term_[domain]_[name]`);
      }

      // Check for duplicate terms
      const existingTerm = await this.getTermByPrefix(termData.term_prefix, organizationId);
      if (existingTerm) {
        throw new Error(`Term with prefix ${termData.term_prefix} already exists`);
      }

      const { data, error } = await this.supabase
        .from('metadata_terms')
        .insert([{
          ...termData,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering metadata term:', error);
      throw error;
    }
  }

  /**
   * Get metadata term by prefix
   */
  async getTermByPrefix(prefix: string, organizationId: string): Promise<MetadataTerm | null> {
    try {
      const { data, error } = await this.supabase
        .from('metadata_terms')
        .select('*')
        .eq('term_prefix', prefix)
        .eq('organization_id', organizationId)
        .eq('status', MetadataStatus.ACTIVE)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting term by prefix:', error);
      return null;
    }
  }

  /**
   * Get all metadata terms for a domain
   */
  async getTermsByDomain(domain: Domain, organizationId: string): Promise<MetadataTerm[]> {
    try {
      const { data, error } = await this.supabase
        .from('metadata_terms')
        .select('*')
        .eq('domain', domain)
        .eq('organization_id', organizationId)
        .eq('status', MetadataStatus.ACTIVE)
        .order('term_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting terms by domain:', error);
      return [];
    }
  }

  /**
   * Search metadata terms with prefix matching
   */
  async searchTerms(
    query: string,
    organizationId: string,
    options?: {
      domain?: Domain;
      dataType?: DataType;
      includeInactive?: boolean;
    }
  ): Promise<MetadataTerm[]> {
    try {
      let queryBuilder = this.supabase
        .from('metadata_terms')
        .select('*')
        .eq('organization_id', organizationId);

      if (!options?.includeInactive) {
        queryBuilder = queryBuilder.eq('status', MetadataStatus.ACTIVE);
      }

      if (options?.domain) {
        queryBuilder = queryBuilder.eq('domain', options.domain);
      }

      if (options?.dataType) {
        queryBuilder = queryBuilder.eq('data_type', options.dataType);
      }

      // Search in term_name, term_prefix, display_name, and synonyms
      const { data, error } = await queryBuilder
        .or(`term_name.ilike.%${query}%,term_prefix.ilike.%${query}%,display_name.ilike.%${query}%`)
        .order('term_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching terms:', error);
      return [];
    }
  }

  /**
   * Validate term prefix format
   */
  private validateTermPrefix(prefix: string): boolean {
    // Must follow pattern: term_[domain]_[name]
    const prefixPattern = /^term_[a-z_]+_[a-z0-9_]+$/;
    return prefixPattern.test(prefix);
  }

  /**
   * Generate term prefix from domain and name
   */
  generateTermPrefix(domain: Domain, name: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `term_${domain}_${cleanName}`;
  }

  /**
   * Get validation rules for a term
   */
  async getTermValidationRules(termId: string): Promise<ValidationRule[]> {
    try {
      const { data, error } = await this.supabase
        .from('metadata_terms')
        .select('validation_rules')
        .eq('id', termId)
        .single();

      if (error) throw error;
      return data?.validation_rules || [];
    } catch (error) {
      console.error('Error getting validation rules:', error);
      return [];
    }
  }

  /**
   * Validate data against term rules
   */
  validateDataAgainstTerm(data: any, term: MetadataTerm): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (term.is_required && (data === null || data === undefined || data === '')) {
      errors.push(`${term.display_name} is required`);
    }

    // Apply validation rules
    term.validation_rules.forEach(rule => {
      switch (rule.rule_type) {
        case 'regex':
          if (data && !new RegExp(rule.rule_value).test(data.toString())) {
            errors.push(rule.error_message);
          }
          break;
        case 'length':
          const [min, max] = rule.rule_value.split(',').map(Number);
          if (data && (data.toString().length < min || data.toString().length > max)) {
            errors.push(rule.error_message);
          }
          break;
        case 'enum':
          if (data && term.allowed_values && !term.allowed_values.includes(data.toString())) {
            errors.push(rule.error_message);
          }
          break;
        case 'range':
          const [minVal, maxVal] = rule.rule_value.split(',').map(Number);
          const numValue = Number(data);
          if (data && (numValue < minVal || numValue > maxVal)) {
            errors.push(rule.error_message);
          }
          break;
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get terms for CID dashboard integration
   */
  async getTermsForCIDDashboard(organizationId: string): Promise<{
    [domain: string]: {
      terms: MetadataTerm[];
      count: number;
      compliance_score: number;
    }
  }> {
    try {
      const { data: terms, error } = await this.supabase
        .from('metadata_terms')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', MetadataStatus.ACTIVE);

      if (error) throw error;

      // Group by domain
      const groupedTerms = terms.reduce((acc, term) => {
        if (!acc[term.domain]) {
          acc[term.domain] = {
            terms: [],
            count: 0,
            compliance_score: 0
          };
        }
        acc[term.domain].terms.push(term);
        acc[term.domain].count++;
        
        // Calculate compliance score based on security level and compliance standards
        const complianceScore = this.calculateTermComplianceScore(term);
        acc[term.domain].compliance_score += complianceScore;
        
        return acc;
      }, {} as any);

      // Average compliance scores
      Object.keys(groupedTerms).forEach(domain => {
        if (groupedTerms[domain].count > 0) {
          groupedTerms[domain].compliance_score = 
            groupedTerms[domain].compliance_score / groupedTerms[domain].count;
        }
      });

      return groupedTerms;
    } catch (error) {
      console.error('Error getting terms for CID dashboard:', error);
      return {};
    }
  }

  /**
   * Calculate compliance score for a term
   */
  private calculateTermComplianceScore(term: MetadataTerm): number {
    let score = 0;
    
    // Security level scoring
    switch (term.security_level) {
      case SecurityLevel.RESTRICTED: score += 4; break;
      case SecurityLevel.CONFIDENTIAL: score += 3; break;
      case SecurityLevel.INTERNAL: score += 2; break;
      case SecurityLevel.PUBLIC: score += 1; break;
    }

    // Compliance standards scoring
    score += term.compliance_standards.length * 2;

    // PII and sensitive data scoring
    if (term.is_pii) score += 3;
    if (term.is_sensitive) score += 2;

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Get enhanced governance metrics for an organization
   */
  async getEnhancedGovernanceMetrics(organizationId: string): Promise<any> {
    try {
      // Mock governance metrics for demonstration
      return {
        total_terms: 1247,
        compliance_score: 95.2,
        active_terms: 1189,
        deprecated_terms: 58,
        domains: {
          accounting: { count: 156, compliance: 98.5 },
          finance: { count: 234, compliance: 96.8 },
          customer: { count: 189, compliance: 94.2 },
          vendor: { count: 145, compliance: 97.1 },
          employee: { count: 123, compliance: 93.5 },
          inventory: { count: 98, compliance: 95.8 },
          project: { count: 76, compliance: 92.3 },
          reporting: { count: 134, compliance: 96.1 },
          audit: { count: 67, compliance: 98.9 },
          tax: { count: 89, compliance: 97.4 },
          general: { count: 56, compliance: 91.7 }
        },
        recent_activity: {
          terms_added: 12,
          terms_updated: 8,
          terms_deprecated: 3,
          last_sync: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting governance metrics:', error);
      return null;
    }
  }

  /**
   * Get compatibility matrix for a field
   */
  async getCompatibilityMatrix(fieldId: string): Promise<CompatibilityMatrix> {
    // Mock implementation for demonstration
    return {
      frontend_frameworks: {
        'React': true,
        'Vue': true,
        'Angular': true,
        'Svelte': false
      },
      backend_platforms: {
        'Node.js': true,
        'Python': true,
        'Java': true,
        'C#': false
      },
      cloud_providers: {
        'AWS': true,
        'Azure': true,
        'GCP': true,
        'Vercel': true
      },
      integration_complexity: 'low',
      estimated_implementation_hours: 2
    };
  }

  private calculateConfidenceScore(newName: string, existingName: string): number {
    const similarity = this.stringSimilarity(newName.toLowerCase(), existingName.toLowerCase());
    return Math.round(similarity * 100);
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private getMatchReasons(newName: string, field: MetadataField): string[] {
    const reasons = [];
    
    if (field.field_name.toLowerCase().includes(newName.toLowerCase())) {
      reasons.push('Name contains search term');
    }
    
    if (field.description.toLowerCase().includes(newName.toLowerCase())) {
      reasons.push('Description matches');
    }
    
    if (field.tags.some(tag => tag.toLowerCase().includes(newName.toLowerCase()))) {
      reasons.push('Tag similarity');
    }
    
    return reasons;
  }

  private calculateCompatibilityScore(field: MetadataField, context?: any): number {
    let score = 70; // Base score
    
    if (context?.domain && field.domain === context.domain) {
      score += 20;
    }
    
    if (context?.dataType && field.data_type === context.dataType) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }
}