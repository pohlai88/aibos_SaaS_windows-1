import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MetadataRegistryService, DataType, Domain } from './metadata-registry-service';

// Report Designer Types
export enum ReportTemplate {
  SIMPLE_TABLE = 'simple_table',
  FINANCIAL_STATEMENT = 'financial_statement',
  MODERN_CARD = 'modern_card',
  WATERFALL_CHART = 'waterfall_chart',
  INVOICE_REPORT = 'invoice_report',
  CUSTOMER_REPORT = 'customer_report',
  VENDOR_REPORT = 'vendor_report',
  TAX_REPORT = 'tax_report',
  COMPLIANCE_REPORT = 'compliance_report'
}

export enum ReportFormat {
  PDF = 'pdf',
  HTML = 'html',
  EXCEL = 'excel',
  CSV = 'csv'
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  CURRENCY = 'currency',
  DATE = 'date',
  BOOLEAN = 'boolean',
  IMAGE = 'image',
  FILE = 'file',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url'
}

export interface ReportField {
  field_name: string;
  label: string;
  data_type: FieldType;
  source_type: 'hard_metadata' | 'soft_metadata' | 'computed';
  source_table?: string;
  source_column?: string;
  display_order: number;
  is_visible: boolean;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  formatting?: {
    decimal_places?: number;
    currency_symbol?: string;
    date_format?: string;
    number_format?: string;
  };
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
  filter?: {
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
    value: any;
    second_value?: any;
  };
}

export interface ReportLayout {
  template: ReportTemplate;
  header: {
    logo_url?: string;
    company_name?: string;
    address?: string;
    title?: string;
    subtitle?: string;
  };
  footer: {
    text?: string;
    page_numbers: boolean;
    generated_by: boolean;
    timestamp: boolean;
  };
  styling: {
    font_family: string;
    font_size: number;
    primary_color: string;
    secondary_color: string;
    border_style: 'solid' | 'dashed' | 'none';
    row_alternating_colors: boolean;
  };
  page: {
    orientation: 'portrait' | 'landscape';
    size: 'a4' | 'letter' | 'legal';
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}

export interface ReportSettings {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  is_public: boolean;
  is_template: boolean;
  layout: ReportLayout;
  fields: ReportField[];
  filters: ReportFilter[];
  sorting: ReportSort[];
  grouping: ReportGroup[];
  computed_fields: ComputedField[];
  schedule?: ReportSchedule;
  permissions: ReportPermissions;
}

export interface ReportFilter {
  field_name: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'is_null' | 'is_not_null';
  value: any;
  second_value?: any;
  logical_operator: 'AND' | 'OR';
}

export interface ReportSort {
  field_name: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface ReportGroup {
  field_name: string;
  display_subtotals: boolean;
  display_grand_total: boolean;
  collapse_by_default: boolean;
}

export interface ComputedField {
  name: string;
  label: string;
  expression: string;
  data_type: FieldType;
  display_order: number;
  is_visible: boolean;
}

export interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  time: string;
  timezone: string;
  recipients: string[];
  format: ReportFormat;
  enabled: boolean;
}

export interface ReportPermissions {
  can_view: string[];
  can_edit: string[];
  can_delete: string[];
  can_share: string[];
}

export interface ReportExecution {
  id: string;
  report_id: string;
  executed_by: string;
  executed_at: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  format: ReportFormat;
  file_url?: string;
  file_size?: number;
  row_count?: number;
  execution_time?: number;
  error_message?: string;
  parameters?: Record<string, any>;
}

export interface ReportTemplateDefinition {
  name: ReportTemplate;
  display_name: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  default_fields: ReportField[];
  default_layout: ReportLayout;
  supported_formats: ReportFormat[];
  max_fields: number;
  recommended_use: string[];
}

export class ReportDesignerService {
  private supabase: SupabaseClient;
  private metadataService: MetadataRegistryService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.metadataService = new MetadataRegistryService(supabaseUrl, supabaseKey);
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<ReportTemplateDefinition[]> {
    return [
      {
        name: ReportTemplate.SIMPLE_TABLE,
        display_name: 'Simple Table',
        description: 'Basic table layout for any data',
        category: 'General',
        default_fields: [],
        default_layout: this.getDefaultLayout(ReportTemplate.SIMPLE_TABLE),
        supported_formats: [ReportFormat.PDF, ReportFormat.HTML, ReportFormat.EXCEL, ReportFormat.CSV],
        max_fields: 50,
        recommended_use: ['Data lists', 'Simple reports', 'Quick views']
      },
      {
        name: ReportTemplate.FINANCIAL_STATEMENT,
        display_name: 'Financial Statement',
        description: 'Professional financial report layout',
        category: 'Finance',
        default_fields: [
          {
            field_name: 'account_name',
            label: 'Account Name',
            data_type: FieldType.TEXT,
            source_type: 'hard_metadata',
            display_order: 1,
            is_visible: true,
            alignment: 'left'
          },
          {
            field_name: 'account_balance',
            label: 'Balance',
            data_type: FieldType.CURRENCY,
            source_type: 'hard_metadata',
            display_order: 2,
            is_visible: true,
            alignment: 'right',
            formatting: {
              decimal_places: 2,
              currency_symbol: '$'
            },
            aggregation: 'sum'
          }
        ],
        default_layout: this.getDefaultLayout(ReportTemplate.FINANCIAL_STATEMENT),
        supported_formats: [ReportFormat.PDF, ReportFormat.HTML, ReportFormat.EXCEL],
        max_fields: 20,
        recommended_use: ['Balance sheets', 'Income statements', 'Trial balances']
      },
      {
        name: ReportTemplate.INVOICE_REPORT,
        display_name: 'Invoice Report',
        description: 'Invoice listing with customer details',
        category: 'Sales',
        default_fields: [
          {
            field_name: 'invoice_number',
            label: 'Invoice #',
            data_type: FieldType.TEXT,
            source_type: 'hard_metadata',
            display_order: 1,
            is_visible: true
          },
          {
            field_name: 'customer_name',
            label: 'Customer',
            data_type: FieldType.TEXT,
            source_type: 'hard_metadata',
            display_order: 2,
            is_visible: true
          },
          {
            field_name: 'invoice_date',
            label: 'Date',
            data_type: FieldType.DATE,
            source_type: 'hard_metadata',
            display_order: 3,
            is_visible: true,
            formatting: {
              date_format: 'MM/DD/YYYY'
            }
          },
          {
            field_name: 'invoice_amount',
            label: 'Amount',
            data_type: FieldType.CURRENCY,
            source_type: 'hard_metadata',
            display_order: 4,
            is_visible: true,
            alignment: 'right',
            formatting: {
              decimal_places: 2,
              currency_symbol: '$'
            },
            aggregation: 'sum'
          }
        ],
        default_layout: this.getDefaultLayout(ReportTemplate.INVOICE_REPORT),
        supported_formats: [ReportFormat.PDF, ReportFormat.HTML, ReportFormat.EXCEL],
        max_fields: 15,
        recommended_use: ['Invoice listings', 'Sales reports', 'Customer analysis']
      },
      {
        name: ReportTemplate.MODERN_CARD,
        display_name: 'Modern Card Layout',
        description: 'Card-based layout for modern reports',
        category: 'Modern',
        default_fields: [],
        default_layout: this.getDefaultLayout(ReportTemplate.MODERN_CARD),
        supported_formats: [ReportFormat.PDF, ReportFormat.HTML],
        max_fields: 10,
        recommended_use: ['Dashboards', 'Summary reports', 'Executive briefings']
      }
    ];
  }

  /**
   * Get available fields for report building (including soft metadata)
   */
  async getAvailableFields(organizationId: string, domain?: Domain): Promise<ReportField[]> {
    try {
      // Get hard metadata fields
      const { data: hardFields } = await this.supabase
        .from('metadata_registry')
        .select('*')
        .eq('status', 'active')
        .eq('organizationId', organizationId)
        .order('field_name');

      // Get soft metadata fields
      const { data: softFields } = await this.supabase
        .from('local_metadata')
        .select('*')
        .eq('organizationId', organizationId)
        .eq('is_approved', true)
        .order('field_name');

      const availableFields: ReportField[] = [];

      // Convert hard metadata to report fields
      for (const field of hardFields || []) {
        if (!domain || field.domain === domain) {
          availableFields.push({
            field_name: field.field_name,
            label: field.field_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data_type: this.mapDataTypeToFieldType(field.data_type),
            source_type: 'hard_metadata',
            source_table: 'metadata_registry',
            source_column: field.field_name,
            display_order: availableFields.length + 1,
            is_visible: true,
            alignment: this.getDefaultAlignment(field.data_type),
            formatting: this.getDefaultFormatting(field.data_type)
          });
        }
      }

      // Convert soft metadata to report fields
      for (const field of softFields || []) {
        availableFields.push({
          field_name: field.field_name,
          label: field.field_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          data_type: this.mapDataTypeToFieldType(field.data_type),
          source_type: 'soft_metadata',
          source_table: field.table_name,
          source_column: field.column_name,
          display_order: availableFields.length + 1,
          is_visible: true,
          alignment: this.getDefaultAlignment(field.data_type),
          formatting: this.getDefaultFormatting(field.data_type)
        });
      }

      return availableFields;
    } catch (error) {
      console.error('Error getting available fields:', error);
      return [];
    }
  }

  /**
   * Create a new report
   */
  async createReport(reportData: Partial<ReportSettings>): Promise<ReportSettings> {
    try {
      const report: ReportSettings = {
        id: crypto.randomUUID(),
        name: reportData.name!,
        description: reportData.description,
        organizationId: reportData.organizationId!,
        created_by: reportData.created_by!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        is_public: reportData.is_public || false,
        is_template: reportData.is_template || false,
        layout: reportData.layout || this.getDefaultLayout(ReportTemplate.SIMPLE_TABLE),
        fields: reportData.fields || [],
        filters: reportData.filters || [],
        sorting: reportData.sorting || [],
        grouping: reportData.grouping || [],
        computed_fields: reportData.computed_fields || [],
        schedule: reportData.schedule,
        permissions: reportData.permissions || {
          can_view: [reportData.created_by!],
          can_edit: [reportData.created_by!],
          can_delete: [reportData.created_by!],
          can_share: []
        }
      };

      const { data, error } = await this.supabase
        .from('report_settings')
        .insert(report)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(`Error creating report: ${error}`);
    }
  }

  /**
   * Update an existing report
   */
  async updateReport(reportId: string, updates: Partial<ReportSettings>): Promise<ReportSettings> {
    try {
      const { data, error } = await this.supabase
        .from('report_settings')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(`Error updating report: ${error}`);
    }
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<ReportSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('report_settings')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting report:', error);
      return null;
    }
  }

  /**
   * List reports for an organization
   */
  async listReports(organizationId: string, userId: string): Promise<ReportSettings[]> {
    try {
      const { data, error } = await this.supabase
        .from('report_settings')
        .select('*')
        .or(`organizationId.eq.${organizationId},is_public.eq.true`)
        .order('updatedAt', { ascending: false });

      if (error) throw error;

      // Filter by permissions
      return (data || []).filter(report => 
        report.is_public || 
        report.permissions.can_view.includes(userId) ||
        report.created_by === userId
      );
    } catch (error) {
      console.error('Error listing reports:', error);
      return [];
    }
  }

  /**
   * Execute a report and generate output
   */
  async executeReport(
    reportId: string, 
    format: ReportFormat, 
    userId: string,
    parameters?: Record<string, any>
  ): Promise<ReportExecution> {
    try {
      const report = await this.getReport(reportId);
      if (!report) throw new Error('Report not found');

      // Create execution record
      const execution: ReportExecution = {
        id: crypto.randomUUID(),
        report_id: reportId,
        executed_by: userId,
        executed_at: new Date().toISOString(),
        status: 'running',
        format,
        parameters
      };

      const { data: executionRecord, error: insertError } = await this.supabase
        .from('report_executions')
        .insert(execution)
        .select()
        .single();

      if (insertError) throw insertError;

      try {
        // Generate dynamic SQL based on report configuration
        const sql = this.generateDynamicSQL(report, parameters);
        
        // Execute query
        const { data: queryResult, error: queryError } = await this.supabase
          .rpc('execute_dynamic_report', { sql_query: sql });

        if (queryError) throw queryError;

        // Generate file based on format
        const fileUrl = await this.generateReportFile(report, queryResult, format);

        // Update execution record
        const { error: updateError } = await this.supabase
          .from('report_executions')
          .update({
            status: 'completed',
            file_url: fileUrl,
            file_size: queryResult.length,
            row_count: queryResult.length,
            execution_time: Date.now() - new Date(execution.executed_at).getTime()
          })
          .eq('id', executionRecord.id);

        if (updateError) throw updateError;

        return {
          ...executionRecord,
          status: 'completed',
          file_url: fileUrl,
          row_count: queryResult.length
        };

      } catch (executionError) {
        // Update execution record with error
        await this.supabase
          .from('report_executions')
          .update({
            status: 'failed',
            error_message: executionError.message
          })
          .eq('id', executionRecord.id);

        throw executionError;
      }

    } catch (error) {
      throw new Error(`Error executing report: ${error}`);
    }
  }

  /**
   * Generate dynamic SQL based on report configuration
   */
  private generateDynamicSQL(report: ReportSettings, parameters?: Record<string, any>): string {
    let sql = 'SELECT ';

    // Add fields
    const fieldSelects = report.fields
      .filter(f => f.is_visible)
      .map(field => {
        if (field.source_type === 'soft_metadata') {
          // Handle JSONB fields
          return `${field.source_table}.${field.source_column}->>'${field.field_name}' AS "${field.label}"`;
        } else {
          return `${field.source_table || 'main'}.${field.field_name} AS "${field.label}"`;
        }
      });

    // Add computed fields
    const computedSelects = report.computed_fields
      .filter(f => f.is_visible)
      .map(field => `${field.expression} AS "${field.label}"`);

    sql += [...fieldSelects, ...computedSelects].join(', ');

    // Add FROM clause (simplified - in real implementation, you'd need to determine the main table)
    sql += ' FROM invoices'; // This should be dynamic based on the primary data source

    // Add WHERE clause for filters
    if (report.filters.length > 0) {
      sql += ' WHERE ';
      const whereConditions = report.filters.map(filter => {
        const operator = this.mapFilterOperator(filter.operator);
        if (filter.operator === 'between') {
          return `${filter.field_name} ${operator} '${filter.value}' AND '${filter.second_value}'`;
        } else if (filter.operator === 'in') {
          const values = Array.isArray(filter.value) ? filter.value.map(v => `'${v}'`).join(',') : `'${filter.value}'`;
          return `${filter.field_name} ${operator} (${values})`;
        } else {
          return `${filter.field_name} ${operator} '${filter.value}'`;
        }
      });
      sql += whereConditions.join(` ${report.filters[0].logical_operator} `);
    }

    // Add GROUP BY for aggregations
    const aggregatedFields = report.fields.filter(f => f.aggregation && f.aggregation !== 'none');
    const nonAggregatedFields = report.fields.filter(f => !f.aggregation || f.aggregation === 'none');
    
    if (aggregatedFields.length > 0 && nonAggregatedFields.length > 0) {
      sql += ` GROUP BY ${nonAggregatedFields.map(f => f.field_name).join(', ')}`;
    }

    // Add ORDER BY
    if (report.sorting.length > 0) {
      sql += ' ORDER BY ';
      const orderClauses = report.sorting
        .sort((a, b) => a.priority - b.priority)
        .map(sort => `${sort.field_name} ${sort.direction.toUpperCase()}`);
      sql += orderClauses.join(', ');
    }

    return sql;
  }

  /**
   * Generate report file based on format
   */
  private async generateReportFile(
    report: ReportSettings, 
    data: any[], 
    format: ReportFormat
  ): Promise<string> {
    // This would integrate with a file generation service
    // For now, return a placeholder URL
    const fileName = `${report.name}_${Date.now()}.${format}`;
    return `https://storage.aibos.com/reports/${fileName}`;
  }

  // Helper methods
  private getDefaultLayout(template: ReportTemplate): ReportLayout {
    const baseLayout: ReportLayout = {
      template,
      header: {
        title: 'Report Title',
        generated_by: true,
        timestamp: true
      },
      footer: {
        text: 'Generated by AIBOS',
        page_numbers: true,
        generated_by: true,
        timestamp: true
      },
      styling: {
        font_family: 'Arial',
        font_size: 12,
        primary_color: '#2563eb',
        secondary_color: '#64748b',
        border_style: 'solid',
        row_alternating_colors: true
      },
      page: {
        orientation: 'portrait',
        size: 'a4',
        margins: { top: 20, bottom: 20, left: 20, right: 20 }
      }
    };

    switch (template) {
      case ReportTemplate.FINANCIAL_STATEMENT:
        return {
          ...baseLayout,
          header: { ...baseLayout.header, title: 'Financial Statement' },
          styling: { ...baseLayout.styling, font_family: 'Times New Roman' }
        };
      case ReportTemplate.INVOICE_REPORT:
        return {
          ...baseLayout,
          header: { ...baseLayout.header, title: 'Invoice Report' }
        };
      default:
        return baseLayout;
    }
  }

  private mapDataTypeToFieldType(dataType: DataType): FieldType {
    const mapping: Record<DataType, FieldType> = {
      [DataType.SHORT_TEXT]: FieldType.TEXT,
      [DataType.LONG_TEXT]: FieldType.TEXT,
      [DataType.NUMBER]: FieldType.NUMBER,
      [DataType.CURRENCY]: FieldType.CURRENCY,
      [DataType.SHORT_DATE]: FieldType.DATE,
      [DataType.LONG_DATE]: FieldType.DATE,
      [DataType.BOOLEAN]: FieldType.BOOLEAN,
      [DataType.EMAIL]: FieldType.EMAIL,
      [DataType.PHONE]: FieldType.PHONE,
      [DataType.URL]: FieldType.URL,
      [DataType.FILE]: FieldType.FILE,
      [DataType.IMAGE]: FieldType.IMAGE,
      [DataType.DROPDOWN]: FieldType.TEXT,
      [DataType.PERCENTAGE]: FieldType.NUMBER,
      [DataType.JSON]: FieldType.TEXT,
      [DataType.ARRAY]: FieldType.TEXT
    };
    return mapping[dataType] || FieldType.TEXT;
  }

  private getDefaultAlignment(dataType: DataType): 'left' | 'center' | 'right' {
    switch (dataType) {
      case DataType.NUMBER:
      case DataType.CURRENCY:
      case DataType.PERCENTAGE:
        return 'right';
      case DataType.BOOLEAN:
        return 'center';
      default:
        return 'left';
    }
  }

  private getDefaultFormatting(dataType: DataType): any {
    switch (dataType) {
      case DataType.CURRENCY:
        return { decimal_places: 2, currency_symbol: '$' };
      case DataType.PERCENTAGE:
        return { decimal_places: 2, number_format: '0.00%' };
      case DataType.SHORT_DATE:
        return { date_format: 'MM/DD/YYYY' };
      case DataType.LONG_DATE:
        return { date_format: 'MM/DD/YYYY HH:mm' };
      default:
        return {};
    }
  }

  private mapFilterOperator(operator: string): string {
    const mapping: Record<string, string> = {
      'equals': '=',
      'contains': 'ILIKE',
      'greater_than': '>',
      'less_than': '<',
      'between': 'BETWEEN',
      'in': 'IN',
      'is_null': 'IS NULL',
      'is_not_null': 'IS NOT NULL'
    };
    return mapping[operator] || '=';
  }
}

export default ReportDesignerService; 