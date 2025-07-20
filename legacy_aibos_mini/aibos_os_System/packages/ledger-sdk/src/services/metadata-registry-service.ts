import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Metadata Registry Types
export enum DataType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  SHORT_DATE = 'short_date',
  LONG_DATE = 'long_date',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DROPDOWN = 'dropdown',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  JSON = 'json',
  ARRAY = 'array',
  FILE = 'file',
  IMAGE = 'image'
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
  TAX = 'tax',
  COMPLIANCE = 'compliance',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  EMPLOYEE = 'employee',
  INVENTORY = 'inventory',
  PROJECT = 'project',
  REPORTING = 'reporting',
  AUDIT = 'audit',
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
  HIPAA = 'hipaa',
  SOC2 = 'soc2',
  ISO27001 = 'iso27001',
  SEA_TAX = 'sea_tax',
  MFRS = 'mfrs'
}

export enum IntegrationPlatform {
  ZAPIER = 'zapier',
  MAKE = 'make',
  N8N = 'n8n',
  AIRTABLE = 'airtable',
  SALESFORCE = 'salesforce'
}

export interface MetadataField {
  id: string;
  field_name: string;
  data_type: DataType;
  description: string;
  domain: Domain;
  is_custom: boolean;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  match_confidence: number;
  status: MetadataStatus;
  security_level: SecurityLevel;
  is_pii: boolean;
  is_sensitive: boolean;
  is_financial: boolean;
  validation_rules?: string;
  default_value?: string;
  allowed_values?: string[];
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  usage_count: number;
  last_used_at?: string;
  version: number;
  tags: string[];
  synonyms: string[];
  business_owner: string;
  technical_owner: string;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
  organizationId?: string;
  tenant_group_id?: string;
  compliance_standards: ComplianceStandard[];
  integration_platforms: IntegrationPlatform[];
  api_endpoints: string[];
  performance_metrics: {
    response_time: string;
    throughput: number;
    max_concurrent_users: number;
  };
  audit_trail_retention_days: number;
  data_encryption: boolean;
  rls_enabled: boolean;
  role_based_access: boolean;
  country_specific_rules: Record<string, any>;
  language_support: string[];
  mobile_compatibility: boolean;
  cloud_platform_support: string[];
}

export interface LocalMetadataField {
  id: string;
  field_name: string;
  data_type: DataType;
  description: string;
  mapped_to?: string;
  is_mapped: boolean;
  created_by: string;
  createdAt: string;
  organizationId: string;
  table_name: string;
  column_name: string;
  usage_count: number;
  last_used_at?: string;
  confidence_score?: number;
  suggested_mappings: string[];
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  tenant_group_id?: string;
  country_code?: string;
  currency?: string;
  compliance_validation: {
    gdpr_compliant: boolean;
    sea_tax_compliant: boolean;
    audit_trail_enabled: boolean;
    data_encrypted: boolean;
  };
  bulk_operation_support: boolean;
  api_compatibility: {
    rest_api: boolean;
    graphql: boolean;
    webhook: boolean;
  };
  performance_requirements: {
    max_response_time: string;
    max_throughput: number;
  };
}

export interface MetadataSuggestion {
  field: MetadataField;
  confidence: number;
  match_type: 'exact' | 'fuzzy' | 'semantic' | 'synonym';
  reasoning: string;
  usage_stats: {
    total_usage: number;
    recent_usage: number;
    organizations_using: number;
  };
  compatibility_score: number;
  compliance_alignment: ComplianceStandard[];
  integration_ready: boolean;
  performance_impact: 'low' | 'medium' | 'high';
}

export interface MetadataUsage {
  id: string;
  field_id: string;
  organizationId: string;
  table_name: string;
  column_name: string;
  usage_count: number;
  last_used_at: string;
  createdAt: string;
  tenant_group_id?: string;
  country_code?: string;
  user_agent?: string;
  ip_address?: string;
  api_endpoint?: string;
  response_time?: number;
  error_rate?: number;
}

export interface MetadataChangeLog {
  id: string;
  field_id: string;
  change_type: 'created' | 'updated' | 'deprecated' | 'mapped' | 'approved';
  old_value?: any;
  new_value?: any;
  changed_by: string;
  changed_at: string;
  reason?: string;
  impact_assessment?: string;
  organizationId?: string;
  tenant_group_id?: string;
  compliance_impact?: ComplianceStandard[];
  api_breaking_change?: boolean;
  migration_required?: boolean;
  rollback_available?: boolean;
}

export interface CompatibilityMatrix {
  frontend: {
    react: { versions: string[]; status: string; notes?: string };
    vue: { versions: string[]; status: string; notes?: string };
    angular: { versions: string[]; status: string; notes?: string };
  };
  backend: {
    supabase: { versions: string[]; status: string; notes?: string };
    firebase: { versions: string[]; status: string; notes?: string };
    postgresql: { versions: string[]; status: string; notes?: string };
  };
  cloud: {
    vercel: { status: string; features: string[] };
    netlify: { status: string; features: string[] };
    aws: { status: string; services: string[] };
    gcp: { status: string; services: string[] };
    azure: { status: string; services: string[] };
  };
  integrations: {
    zapier: { status: string; triggers: string[]; actions: string[] };
    make: { status: string; notes?: string };
    n8n: { status: string; notes?: string };
    airtable: { status: string; features: string[] };
    salesforce: { status: string; notes?: string };
  };
  compliance: {
    gdpr: { status: string; features: string[] };
    hipaa: { status: string; notes?: string };
    soc2: { status: string; notes?: string };
    iso27001: { status: string; notes?: string };
  };
}

export interface ApiRouteSpecification {
  base_url: string;
  version: string;
  endpoints: {
    [key: string]: {
      method: string;
      path: string;
      description: string;
      parameters?: Array<{
        name: string;
        type: string;
        required: boolean;
        description: string;
      }>;
      body?: {
        schema: string;
      };
      responses: {
        [code: string]: {
          description: string;
          schema?: string;
        };
      };
    };
  };
}

export interface ModuleInfo {
  name: string;
  version: string;
  description: string;
  category: string;
  status: string;
  release_date: string;
  commercial: {
    pricing_tier: string;
    min_license_cost: string;
    target_market: string;
    roi_estimate: string;
  };
  dependencies: {
    core: string[];
    optional: string[];
  };
  database: {
    required_tables: string[];
    migrations: string[];
  };
  api_routes: {
    [key: string]: string;
  };
  compliance: {
    [key: string]: boolean;
  };
  performance: {
    [key: string]: any;
  };
  security: {
    [key: string]: boolean;
  };
  support: {
    sla: string;
    response_time: string;
    documentation: string;
    training_available: boolean;
  };
}

export class MetadataRegistryService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Enhanced field suggestion with compatibility and compliance analysis
   */
  async suggestFields(
    newFieldName: string,
    dataType?: DataType,
    domain?: Domain,
    organizationId?: string,
    countryCode?: string
  ): Promise<MetadataSuggestion[]> {
    try {
      // Get all active metadata fields
      const { data: fields } = await this.supabase
        .from('metadata_registry')
        .select('*')
        .eq('status', MetadataStatus.ACTIVE)
        .order('usage_count', { ascending: false });

      if (!fields) return [];

      const suggestions: MetadataSuggestion[] = [];

      for (const field of fields) {
        const confidence = this.calculateMatchConfidence(newFieldName, field, dataType, domain);
        
        if (confidence > 0.3) {
          const usageStats = await this.getFieldUsageStats(field.id);
          const compatibilityScore = await this.calculateCompatibilityScore(field, organizationId, countryCode);
          const complianceAlignment = this.getComplianceAlignment(field, countryCode);
          
          suggestions.push({
            field,
            confidence,
            match_type: this.determineMatchType(newFieldName, field.field_name),
            reasoning: this.generateReasoning(newFieldName, field, confidence),
            usage_stats: usageStats,
            compatibility_score: compatibilityScore,
            compliance_alignment: complianceAlignment,
            integration_ready: field.integration_platforms.length > 0,
            performance_impact: this.assessPerformanceImpact(field)
          });
        }
      }

      // Sort by confidence and compatibility
      return suggestions
        .sort((a, b) => {
          const scoreA = (a.confidence * 0.6) + (a.compatibility_score * 0.4);
          const scoreB = (b.confidence * 0.6) + (b.compatibility_score * 0.4);
          return scoreB - scoreA;
        })
        .slice(0, 10);
    } catch (error) {
      console.error('Error suggesting fields:', error);
      return [];
    }
  }

  /**
   * Register metadata field with enhanced compliance and compatibility features
   */
  async registerMetadataField(
    fieldData: Partial<MetadataField>,
    organizationId?: string,
    tenantGroupId?: string
  ): Promise<MetadataField> {
    try {
      const field: MetadataField = {
        id: crypto.randomUUID(),
        field_name: fieldData.field_name!,
        data_type: fieldData.data_type!,
        description: fieldData.description!,
        domain: fieldData.domain || Domain.GENERAL,
        is_custom: fieldData.is_custom || false,
        created_by: fieldData.created_by!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        match_confidence: 1.0,
        status: MetadataStatus.DRAFT,
        security_level: fieldData.security_level || SecurityLevel.INTERNAL,
        is_pii: fieldData.is_pii || false,
        is_sensitive: fieldData.is_sensitive || false,
        is_financial: fieldData.is_financial || false,
        validation_rules: fieldData.validation_rules,
        default_value: fieldData.default_value,
        allowed_values: fieldData.allowed_values,
        min_length: fieldData.min_length,
        max_length: fieldData.max_length,
        min_value: fieldData.min_value,
        max_value: fieldData.max_value,
        pattern: fieldData.pattern,
        usage_count: 0,
        version: 1,
        tags: fieldData.tags || [],
        synonyms: fieldData.synonyms || [],
        business_owner: fieldData.business_owner || fieldData.created_by!,
        technical_owner: fieldData.technical_owner || fieldData.created_by!,
        approval_required: fieldData.approval_required || false,
        organizationId: organizationId,
        tenant_group_id: tenantGroupId,
        compliance_standards: fieldData.compliance_standards || [ComplianceStandard.GDPR],
        integration_platforms: fieldData.integration_platforms || [],
        api_endpoints: fieldData.api_endpoints || [],
        performance_metrics: fieldData.performance_metrics || {
          response_time: '< 200ms',
          throughput: 100,
          max_concurrent_users: 1000
        },
        audit_trail_retention_days: fieldData.audit_trail_retention_days || 2555, // 7 years
        data_encryption: fieldData.data_encryption || true,
        rls_enabled: fieldData.rls_enabled || true,
        role_based_access: fieldData.role_based_access || true,
        country_specific_rules: fieldData.country_specific_rules || {},
        language_support: fieldData.language_support || ['en'],
        mobile_compatibility: fieldData.mobile_compatibility || true,
        cloud_platform_support: fieldData.cloud_platform_support || ['vercel', 'netlify', 'aws']
      };

      const { data, error } = await this.supabase
        .from('metadata_registry')
        .insert(field)
        .select()
        .single();

      if (error) throw error;

      // Log the creation with enhanced audit trail
      await this.logMetadataChange({
        field_id: field.id,
        change_type: 'created',
        new_value: field,
        changed_by: field.created_by,
        reason: 'New field registration',
        organizationId,
        tenant_group_id,
        compliance_impact: field.compliance_standards,
        api_breaking_change: false,
        migration_required: false,
        rollback_available: true
      });

      return data;
    } catch (error) {
      throw new Error(`Error registering metadata field: ${error}`);
    }
  }

  /**
   * Get compatibility matrix for a field
   */
  async getCompatibilityMatrix(fieldId: string): Promise<CompatibilityMatrix> {
    try {
      const { data: field } = await this.supabase
        .from('metadata_registry')
        .select('*')
        .eq('id', fieldId)
        .single();

      if (!field) throw new Error('Field not found');

      return {
        frontend: {
          react: { versions: ['18.0.0', '18.1.0', '18.2.0', '19.0.0'], status: 'fully_supported' },
          vue: { versions: ['3.0.0', '3.1.0', '3.2.0', '3.3.0'], status: 'beta_support' },
          angular: { versions: ['15.0.0', '16.0.0', '17.0.0'], status: 'planned' }
        },
        backend: {
          supabase: { versions: ['2.0.0', '2.1.0', '2.2.0', '2.3.0'], status: 'fully_supported' },
          firebase: { versions: ['9.0.0', '10.0.0', '11.0.0'], status: 'beta_support' },
          postgresql: { versions: ['13.0', '14.0', '15.0', '16.0'], status: 'fully_supported' }
        },
        cloud: {
          vercel: { status: 'fully_supported', features: ['Serverless functions', 'Edge functions'] },
          netlify: { status: 'fully_supported', features: ['Serverless functions', 'Form handling'] },
          aws: { status: 'fully_supported', services: ['Lambda', 'RDS', 'S3'] },
          gcp: { status: 'fully_supported', services: ['Cloud Functions', 'Cloud SQL'] },
          azure: { status: 'beta_support', services: ['Functions', 'SQL Database'] }
        },
        integrations: {
          zapier: { status: 'fully_supported', triggers: ['field_created', 'field_updated'], actions: ['create_field', 'update_field'] },
          make: { status: 'fully_supported', notes: 'Formerly Integromat' },
          n8n: { status: 'beta_support', notes: 'Community-driven integration' },
          airtable: { status: 'fully_supported', features: ['Bidirectional sync', 'Real-time updates'] },
          salesforce: { status: 'planned', notes: 'Salesforce integration planned' }
        },
        compliance: {
          gdpr: { status: 'fully_supported', features: ['Data portability', 'Right to be forgotten'] },
          hipaa: { status: 'planned', notes: 'HIPAA compliance planned' },
          soc2: { status: 'in_progress', notes: 'SOC 2 Type II certification in progress' },
          iso27001: { status: 'planned', notes: 'ISO 27001 certification planned' }
        }
      };
    } catch (error) {
      throw new Error(`Error getting compatibility matrix: ${error}`);
    }
  }

  /**
   * Get API route specifications for a field
   */
  async getApiRouteSpecification(fieldId: string): Promise<ApiRouteSpecification> {
    try {
      const { data: field } = await this.supabase
        .from('metadata_registry')
        .select('*')
        .eq('id', fieldId)
        .single();

      if (!field) throw new Error('Field not found');

      return {
        base_url: '/api/metadata',
        version: 'v2',
        endpoints: {
          get: {
            method: 'GET',
            path: `/fields/${fieldId}`,
            description: `Get metadata field: ${field.field_name}`,
            responses: {
              '200': { description: 'Field details', schema: 'MetadataField' },
              '404': { description: 'Field not found' }
            }
          },
          update: {
            method: 'PUT',
            path: `/fields/${fieldId}`,
            description: `Update metadata field: ${field.field_name}`,
            body: { schema: 'Partial<MetadataField>' },
            responses: {
              '200': { description: 'Field updated' },
              '404': { description: 'Field not found' }
            }
          },
          delete: {
            method: 'DELETE',
            path: `/fields/${fieldId}`,
            description: `Delete metadata field: ${field.field_name}`,
            responses: {
              '204': { description: 'Field deleted' },
              '404': { description: 'Field not found' }
            }
          }
        }
      };
    } catch (error) {
      throw new Error(`Error getting API route specification: ${error}`);
    }
  }

  /**
   * Get module information for metadata registry
   */
  async getModuleInfo(): Promise<ModuleInfo> {
    return {
      name: 'MetadataRegistry',
      version: '2.0.0',
      description: 'Enhanced metadata management with SEA compliance, audit logging, and multi-entity support',
      category: 'Enterprise',
      status: 'production-ready',
      release_date: '2025-01-05',
      commercial: {
        pricing_tier: 'Enterprise',
        min_license_cost: '$199/month',
        target_market: 'SEA SaaS Companies',
        roi_estimate: '35% cost reduction in data governance'
      },
      dependencies: {
        core: ['React 18+', 'TypeScript 4.9+', 'Supabase', 'Tailwind CSS'],
        optional: ['Docker', 'Redis (for caching)']
      },
      database: {
        required_tables: [
          'metadata_registry', 'local_metadata', 'metadata_usage',
          'metadata_change_log', 'metadata_relationships', 'metadata_validation_rules'
        ],
        migrations: ['005_metadata_registry.sql']
      },
      api_routes: {
        registry: '/api/metadata/registry',
        local: '/api/metadata/local',
        governance: '/api/metadata/governance',
        dictionary: '/api/metadata/dictionary'
      },
      compliance: {
        gdpr: true,
        sea_tax_compliance: true,
        audit_trail: true,
        data_encryption: true
      },
      performance: {
        max_fields: 10000,
        max_organizations: 1000,
        audit_log_retention: '7 years',
        response_time: '< 200ms'
      },
      security: {
        rls_enabled: true,
        role_based_access: true,
        audit_logging: true,
        data_validation: true
      },
      support: {
        sla: '99.95% uptime',
        response_time: '4 hours',
        documentation: 'Complete',
        training_available: true
      }
    };
  }

  /**
   * Enhanced governance metrics with compliance tracking
   */
  async getEnhancedGovernanceMetrics(organizationId: string): Promise<any> {
    try {
      const basicMetrics = await this.getGovernanceMetrics(organizationId);
      
      // Get compliance metrics
      const { data: complianceData } = await this.supabase
        .from('metadata_registry')
        .select('compliance_standards, organizationId')
        .eq('organizationId', organizationId);

      const complianceMetrics = {
        gdpr_compliant_fields: complianceData?.filter(f => f.compliance_standards.includes(ComplianceStandard.GDPR)).length || 0,
        sea_tax_compliant_fields: complianceData?.filter(f => f.compliance_standards.includes(ComplianceStandard.SEA_TAX)).length || 0,
        soc2_compliant_fields: complianceData?.filter(f => f.compliance_standards.includes(ComplianceStandard.SOC2)).length || 0,
        total_compliance_score: 0
      };

      // Calculate compliance score
      const totalFields = basicMetrics.total_local_fields;
      if (totalFields > 0) {
        complianceMetrics.total_compliance_score = Math.round(
          ((complianceMetrics.gdpr_compliant_fields + complianceMetrics.sea_tax_compliant_fields) / (totalFields * 2)) * 100
        );
      }

      return {
        ...basicMetrics,
        compliance: complianceMetrics,
        integration_ready_fields: complianceData?.filter(f => f.integration_platforms.length > 0).length || 0,
        mobile_compatible_fields: complianceData?.filter(f => f.mobile_compatibility).length || 0,
        cloud_platform_support: {
          vercel: complianceData?.filter(f => f.cloud_platform_support.includes('vercel')).length || 0,
          netlify: complianceData?.filter(f => f.cloud_platform_support.includes('netlify')).length || 0,
          aws: complianceData?.filter(f => f.cloud_platform_support.includes('aws')).length || 0,
          gcp: complianceData?.filter(f => f.cloud_platform_support.includes('gcp')).length || 0
        }
      };
    } catch (error) {
      throw new Error(`Error getting enhanced governance metrics: ${error}`);
    }
  }

  // Helper methods
  private async calculateCompatibilityScore(field: MetadataField, organizationId?: string, countryCode?: string): Promise<number> {
    let score = 0.5; // Base score

    // Organization-specific compatibility
    if (organizationId && field.organizationId === organizationId) {
      score += 0.2;
    }

    // Country-specific compatibility
    if (countryCode && field.country_specific_rules[countryCode]) {
      score += 0.15;
    }

    // Integration readiness
    if (field.integration_platforms.length > 0) {
      score += 0.1;
    }

    // Mobile compatibility
    if (field.mobile_compatibility) {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  private getComplianceAlignment(field: MetadataField, countryCode?: string): ComplianceStandard[] {
    const alignments: ComplianceStandard[] = [];

    // Always include GDPR for EU compliance
    if (field.compliance_standards.includes(ComplianceStandard.GDPR)) {
      alignments.push(ComplianceStandard.GDPR);
    }

    // Add SEA tax compliance for Southeast Asian countries
    if (countryCode && ['MY', 'SG', 'TH', 'ID', 'PH', 'VN'].includes(countryCode)) {
      if (field.compliance_standards.includes(ComplianceStandard.SEA_TAX)) {
        alignments.push(ComplianceStandard.SEA_TAX);
      }
    }

    // Add other compliance standards
    if (field.compliance_standards.includes(ComplianceStandard.SOC2)) {
      alignments.push(ComplianceStandard.SOC2);
    }

    return alignments;
  }

  private assessPerformanceImpact(field: MetadataField): 'low' | 'medium' | 'high' {
    const responseTime = parseInt(field.performance_metrics.response_time.replace(/[^\d]/g, ''));
    
    if (responseTime < 100) return 'low';
    if (responseTime < 500) return 'medium';
    return 'high';
  }

  private calculateMatchConfidence(
    newFieldName: string,
    existingField: MetadataField,
    dataType?: DataType,
    domain?: Domain
  ): number {
    let confidence = 0;

    // Exact name match
    if (newFieldName.toLowerCase() === existingField.field_name.toLowerCase()) {
      confidence += 0.8;
    }
    // Fuzzy name match
    else if (this.levenshteinDistance(newFieldName, existingField.field_name) <= 2) {
      confidence += 0.6;
    }
    // Synonym match
    else if (existingField.synonyms.some(syn => 
      newFieldName.toLowerCase().includes(syn.toLowerCase()) ||
      syn.toLowerCase().includes(newFieldName.toLowerCase())
    )) {
      confidence += 0.5;
    }

    // Data type match
    if (dataType && dataType === existingField.data_type) {
      confidence += 0.2;
    }

    // Domain match
    if (domain && domain === existingField.domain) {
      confidence += 0.1;
    }

    // Usage popularity bonus
    confidence += Math.min(existingField.usage_count / 100, 0.1);

    return Math.min(confidence, 1.0);
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

  private determineMatchType(newFieldName: string, existingFieldName: string): 'exact' | 'fuzzy' | 'semantic' | 'synonym' {
    if (newFieldName.toLowerCase() === existingFieldName.toLowerCase()) {
      return 'exact';
    }
    if (this.levenshteinDistance(newFieldName, existingFieldName) <= 2) {
      return 'fuzzy';
    }
    return 'semantic';
  }

  private generateReasoning(newFieldName: string, field: MetadataField, confidence: number): string {
    if (confidence > 0.8) {
      return `Exact match with existing field "${field.field_name}"`;
    }
    if (confidence > 0.6) {
      return `Similar to existing field "${field.field_name}" (${field.description})`;
    }
    return `Potential match with "${field.field_name}" based on domain and usage`;
  }

  private async getFieldUsageStats(fieldId: string): Promise<any> {
    try {
      const { data } = await this.supabase
        .from('metadata_usage')
        .select('*')
        .eq('field_id', fieldId);

      const totalUsage = data?.reduce((sum, usage) => sum + usage.usage_count, 0) || 0;
      const recentUsage = data?.filter(usage => 
        new Date(usage.last_used_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const organizationsUsing = new Set(data?.map(usage => usage.organizationId)).size;

      return {
        total_usage: totalUsage,
        recent_usage: recentUsage,
        organizations_using: organizationsUsing
      };
    } catch (error) {
      return { total_usage: 0, recent_usage: 0, organizations_using: 0 };
    }
  }

  private async getGovernanceMetrics(organizationId: string): Promise<any> {
    try {
      const { data: localFields } = await this.supabase
        .from('local_metadata')
        .select('*')
        .eq('organizationId', organizationId);

      const totalLocalFields = localFields?.length || 0;
      const mappedFields = localFields?.filter(f => f.is_mapped).length || 0;
      const unmappedFields = totalLocalFields - mappedFields;
      const mappingRate = totalLocalFields > 0 ? (mappedFields / totalLocalFields) * 100 : 0;

      const { data: usageStats } = await this.supabase
        .from('metadata_usage')
        .select('*')
        .eq('organizationId', organizationId);

      const totalUsage = usageStats?.reduce((sum, stat) => sum + stat.usage_count, 0) || 0;

      return {
        total_local_fields: totalLocalFields,
        mapped_fields: mappedFields,
        unmapped_fields: unmappedFields,
        mapping_rate: mappingRate,
        total_usage: totalUsage,
        fields_needing_review: localFields?.filter(f => !f.is_approved).length || 0,
        duplicate_candidates: await this.findDuplicateCandidates(organizationId)
      };
    } catch (error) {
      throw new Error(`Error getting governance metrics: ${error}`);
    }
  }

  private async findDuplicateCandidates(organizationId: string): Promise<any[]> {
    try {
      const { data: localFields } = await this.supabase
        .from('local_metadata')
        .select('*')
        .eq('organizationId', organizationId)
        .eq('is_mapped', false);

      const candidates: any[] = [];
      
      for (let i = 0; i < localFields.length; i++) {
        for (let j = i + 1; j < localFields.length; j++) {
          const field1 = localFields[i];
          const field2 = localFields[j];
          const similarity = this.calculateMatchConfidence(field1.field_name, {
            field_name: field2.field_name,
            data_type: field2.data_type,
            domain: Domain.GENERAL,
            usage_count: 0,
            version: 1,
            tags: [],
            synonyms: [],
            business_owner: '',
            technical_owner: '',
            approval_required: false,
            created_by: '',
            createdAt: '',
            updatedAt: '',
            match_confidence: 0,
            status: MetadataStatus.ACTIVE,
            security_level: SecurityLevel.INTERNAL,
            is_custom: false,
            is_pii: false,
            is_sensitive: false,
            is_financial: false,
            compliance_standards: [],
            integration_platforms: [],
            api_endpoints: [],
            performance_metrics: { response_time: '', throughput: 0, max_concurrent_users: 0 },
            audit_trail_retention_days: 0,
            data_encryption: false,
            rls_enabled: false,
            role_based_access: false,
            country_specific_rules: {},
            language_support: [],
            mobile_compatibility: false,
            cloud_platform_support: []
          } as MetadataField);

          if (similarity > 0.7) {
            candidates.push({
              field1,
              field2,
              similarity,
              suggestion: `Consider merging "${field1.field_name}" and "${field2.field_name}"`
            });
          }
        }
      }

      return candidates;
    } catch (error) {
      return [];
    }
  }

  private async logMetadataChange(change: Partial<MetadataChangeLog>): Promise<void> {
    try {
      const changeLog: MetadataChangeLog = {
        id: crypto.randomUUID(),
        field_id: change.field_id!,
        change_type: change.change_type!,
        old_value: change.old_value,
        new_value: change.new_value,
        changed_by: change.changed_by!,
        changed_at: new Date().toISOString(),
        reason: change.reason,
        impact_assessment: change.impact_assessment,
        organizationId: change.organizationId,
        tenant_group_id: change.tenant_group_id,
        compliance_impact: change.compliance_impact,
        api_breaking_change: change.api_breaking_change,
        migration_required: change.migration_required,
        rollback_available: change.rollback_available
      };

      await this.supabase
        .from('metadata_change_log')
        .insert(changeLog);
    } catch (error) {
      console.error('Error logging metadata change:', error);
    }
  }
}

export default MetadataRegistryService; 