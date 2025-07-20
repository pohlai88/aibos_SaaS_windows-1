import { ValidationResult } from '@aibos/core-types';

import { supabase } from '../utils/supabase-client';

// Types for import/export operations
export interface ImportJob {
  id: string;
  userId: string;
  organizationId: string;
  type: 'csv' | 'excel' | 'json' | 'xml' | 'database';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  fileSize: number;
  totalRows: number;
  processedRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ImportError {
  row: number;
  column: string;
  value: string;
  message: string;
  type: 'validation' | 'format' | 'business' | 'system';
}

export interface ImportWarning {
  row: number;
  column: string;
  value: string;
  message: string;
  type: 'data' | 'format' | 'suggestion';
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  required: boolean;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'regex' | 'custom';
  value?: any;
  message: string;
}

export interface DataPreview {
  columns: string[];
  sampleData: any[][];
  dataTypes: { [key: string]: string };
  validationResults: ValidationResult[];
}

export interface ExportJob {
  id: string;
  userId: string;
  organizationId: string;
  type: 'csv' | 'excel' | 'pdf' | 'json' | 'xml';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dataSource: string;
  filters: any;
  format: ExportFormat;
  totalRecords: number;
  processedRecords: number;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ExportFormat {
  includeHeaders: boolean;
  dateFormat: string;
  numberFormat: string;
  currencyFormat: string;
  encoding: string;
  delimiter?: string;
}

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'chart_of_accounts' | 'transactions' | 'customers' | 'vendors' | 'custom';
  columnMappings: ColumnMapping[];
  validationRules: ValidationRule[];
  sampleFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MigrationSource {
  id: string;
  name: string;
  type: string;
  description: string;
  supportedData: string[];
  mappingTemplates: ImportTemplate[];
  region: 'SEA' | 'Global';
  mfrsCompliance: boolean;
  accountClassificationMapping?: AccountClassificationMapping;
}

export interface AccountClassificationMapping {
  sourceSystem: string;
  targetSystem: string;
  mappings: AccountMapping[];
  complianceNotes: string[];
  auditTrail: boolean;
}

export interface AccountMapping {
  sourceCategory: string;
  sourceSubcategory?: string;
  targetMFRSAccount: string;
  targetMFRSStandard: string;
  confidence: number;
  requiresReview: boolean;
  notes?: string;
}

export interface MFRSComplianceReport {
  migrationId: string;
  totalAccounts: number;
  compliantAccounts: number;
  nonCompliantAccounts: number;
  requiresReview: number;
  complianceScore: number;
  issues: ComplianceIssue[];
  recommendations: string[];
  auditTrail: AuditEntry[];
}

export interface ComplianceIssue {
  accountCode: string;
  accountName: string;
  sourceClassification: string;
  targetClassification: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
  changes?: any;
}

export interface DataQualityScore {
  overall: number; // 0-100
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  issues: DataQualityIssue[];
  suggestions: string[];
}

export interface DataQualityIssue {
  type: 'missing' | 'duplicate' | 'invalid' | 'inconsistent' | 'outlier';
  column: string;
  row?: number;
  value?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

export interface SmartSuggestion {
  column: string;
  suggestedMapping: string;
  confidence: number; // 0-1
  reasoning: string;
  alternatives: string[];
}

export enum MFRSStandard {
  MFRS_101 = "MFRS 101 - Presentation of Financial Statements",
  MFRS_107 = "MFRS 107 - Statement of Cash Flows",
  MFRS_108 = "MFRS 108 - Accounting Policies, Changes in Accounting Estimates and Errors",
  MFRS_109 = "MFRS 109 - Financial Instruments",
  MFRS_110 = "MFRS 110 - Consolidated Financial Statements",
  MFRS_112 = "MFRS 112 - Income Taxes",
  MFRS_113 = "MFRS 113 - Fair Value Measurement",
  MFRS_115 = "MFRS 115 - Revenue from Contracts with Customers",
  MFRS_116 = "MFRS 116 - Leases",
  MFRS_117 = "MFRS 117 - Insurance Contracts",
  MFRS_118 = "MFRS 118 - Employee Benefits",
  MFRS_119 = "MFRS 119 - Employee Benefits",
  MFRS_120 = "MFRS 120 - Accounting for Government Grants and Disclosure of Government Assistance",
  MFRS_121 = "MFRS 121 - The Effects of Changes in Foreign Exchange Rates",
  MFRS_123 = "MFRS 123 - Borrowing Costs",
  MFRS_124 = "MFRS 124 - Related Party Disclosures",
  MFRS_128 = "MFRS 128 - Investments in Associates and Joint Ventures",
  MFRS_129 = "MFRS 129 - Financial Reporting in Hyperinflationary Economies",
  MFRS_132 = "MFRS 132 - Financial Instruments: Presentation",
  MFRS_133 = "MFRS 133 - Earnings Per Share",
  MFRS_134 = "MFRS 134 - Interim Financial Reporting",
  MFRS_136 = "MFRS 136 - Impairment of Assets",
  MFRS_137 = "MFRS 137 - Provisions, Contingent Liabilities and Contingent Assets",
  MFRS_138 = "MFRS 138 - Intangible Assets",
  MFRS_140 = "MFRS 140 - Investment Property",
  MFRS_141 = "MFRS 141 - Agriculture",
  MFRS_1000 = "MFRS 1000 - Framework for the Preparation and Presentation of Financial Statements"
}

export enum ComplianceLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFO = "INFO"
}

export interface MFRSRule {
  id: string;
  standard: MFRSStandard;
  rule_code: string;
  title: string;
  description: string;
  compliance_level: ComplianceLevel;
  validation_logic: string; // JSON-serialized validation logic
  parameters: Record<string, any>;
  effective_date: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationViolation {
  id: string;
  rule_id: string;
  rule_title: string;
  standard: MFRSStandard;
  compliance_level: ComplianceLevel;
  message: string;
  details: Record<string, any>;
  transaction_id?: string;
  account_id?: string;
  amount?: number;
  suggested_correction?: string;
  createdAt: string;
}

export interface DisclosureRequirement {
  id: string;
  standard: MFRSStandard;
  requirement_code: string;
  title: string;
  description: string;
  disclosure_type: string; // "note", "statement", "annex"
  template: string; // Template for generating disclosure
  required_conditions: Record<string, any>;
  is_mandatory: boolean;
  effective_date: string;
  createdAt: string;
}

export interface GeneratedDisclosure {
  id: string;
  requirement_id: string;
  standard: MFRSStandard;
  title: string;
  content: string;
  disclosure_type: string;
  financial_period: string;
  tenant_id: string;
  generated_at: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface ValidationLogic {
  type: 'account_balance' | 'transaction_type' | 'amount_threshold' | 'account_relationship' | 'custom_logic';
  account_code?: string;
  condition?: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold?: number;
  transaction_types?: string[];
  amount_field?: string;
  relationship_type?: string;
  custom_expression?: string;
}

export class ImportExportService {
  private static instance: ImportExportService;

  public static getInstance(): ImportExportService {
    if (!ImportExportService.instance) {
      ImportExportService.instance = new ImportExportService();
    }
    return ImportExportService.instance;
  }

  // ===== IMPORT FUNCTIONS =====

  /**
   * Upload file and create import job
   */
  async uploadFile(
    file: File,
    type: ImportJob['type'],
    organizationId: string,
    userId: string
  ): Promise<ImportJob> {
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create import job
      const importJob: Omit<ImportJob, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        organizationId,
        type,
        status: 'pending',
        fileName: file.name,
        fileSize: file.size,
        totalRows: 0,
        processedRows: 0,
        errors: [],
        warnings: []
      };

      const { data: jobData, error: jobError } = await supabase
        .from('import_jobs')
        .insert(importJob)
        .select()
        .single();

      if (jobError) throw jobError;

      return {
        ...jobData,
        createdAt: new Date(jobData.createdAt),
        updatedAt: new Date(jobData.updatedAt)
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Analyze uploaded file and generate data preview
   */
  async analyzeFile(jobId: string): Promise<DataPreview> {
    try {
      const { data: job, error: jobError } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Get file from storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('imports')
        .download(job.fileName);

      if (fileError) throw fileError;

      // Parse file based on type
      const preview = await this.parseFile(fileData, job.type);
      
      // Update job with row count
      await supabase
        .from('import_jobs')
        .update({ total_rows: preview.sampleData.length })
        .eq('id', jobId);

      return preview;
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw new Error('Failed to analyze file');
    }
  }

  /**
   * Parse file and extract data preview
   */
  private async parseFile(file: Blob, type: ImportJob['type']): Promise<DataPreview> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    // Parse CSV (most common format)
    const columns = this.parseCSVHeader(lines[0]);
    const sampleData = lines.slice(1, 6).map(line => this.parseCSVLine(line, columns.length));
    const dataTypes = this.detectDataTypes(columns, sampleData);
    const validationResults = this.validateData(columns, sampleData);

    return {
      columns,
      sampleData,
      dataTypes,
      validationResults
    };
  }

  /**
   * Parse CSV header
   */
  private parseCSVHeader(header: string): string[] {
    return header.split(',').map(col => col.trim().replace(/"/g, ''));
  }

  /**
   * Parse CSV line
   */
  private parseCSVLine(line: string, expectedColumns: number): string[] {
    const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
    
    // Pad with empty strings if needed
    while (values.length < expectedColumns) {
      values.push('');
    }
    
    return values.slice(0, expectedColumns);
  }

  /**
   * Detect data types for columns
   */
  private detectDataTypes(columns: string[], sampleData: string[][]): { [key: string]: string } {
    const dataTypes: { [key: string]: string } = {};

    columns.forEach((column, index) => {
      const values = sampleData.map(row => row[index]).filter(val => val !== '');
      
      if (values.length === 0) {
        dataTypes[column] = 'string';
        return;
      }

      // Check for date
      if (values.every(val => this.isDate(val))) {
        dataTypes[column] = 'date';
      }
      // Check for number
      else if (values.every(val => this.isNumber(val))) {
        dataTypes[column] = 'number';
      }
      // Check for boolean
      else if (values.every(val => this.isBoolean(val))) {
        dataTypes[column] = 'boolean';
      }
      // Check for currency
      else if (values.every(val => this.isCurrency(val))) {
        dataTypes[column] = 'currency';
      }
      // Default to string
      else {
        dataTypes[column] = 'string';
      }
    });

    return dataTypes;
  }

  /**
   * Validate sample data
   */
  private validateData(columns: string[], sampleData: string[][]): ValidationResult[] {
    return columns.map((column, index) => {
      const values = sampleData.map(row => row[index]);
      const errors: ImportError[] = [];
      const suggestions: string[] = [];

      // Check for empty required fields
      const emptyCount = values.filter(val => !val.trim()).length;
      if (emptyCount > 0) {
        suggestions.push(`${emptyCount} rows have empty values`);
      }

      // Check for data type consistency
      const dataType = this.detectDataTypes([column], [values])[column];
      const invalidTypeCount = values.filter(val => val && !this.matchesType(val, dataType)).length;
      if (invalidTypeCount > 0) {
        errors.push({
          row: 0,
          column,
          value: 'multiple',
          message: `${invalidTypeCount} values don't match expected type: ${dataType}`,
          type: 'validation'
        });
      }

      return {
        column,
        validRows: values.length - errors.length,
        invalidRows: errors.length,
        errors,
        suggestions
      };
    });
  }

  /**
   * Execute import with column mapping
   */
  async executeImport(
    jobId: string,
    columnMappings: ColumnMapping[],
    validationRules: ValidationRule[]
  ): Promise<ImportJob> {
    try {
      // Update job status to processing
      await supabase
        .from('import_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Process import based on type
      const result = await this.processImport(job, columnMappings, validationRules);

      // Update job with results
      const { data: updatedJob, error: updateError } = await supabase
        .from('import_jobs')
        .update({
          status: result.success ? 'completed' : 'failed',
          processed_rows: result.processedRows,
          errors: result.errors,
          warnings: result.warnings,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        ...updatedJob,
        createdAt: new Date(updatedJob.createdAt),
        updatedAt: new Date(updatedJob.updatedAt),
        completedAt: updatedJob.completed_at ? new Date(updatedJob.completed_at) : undefined
      };
    } catch (error) {
      console.error('Error executing import:', error);
      throw new Error('Failed to execute import');
    }
  }

  /**
   * Process import data
   */
  private async processImport(
    job: any,
    columnMappings: ColumnMapping[],
    validationRules: ValidationRule[]
  ): Promise<{
    success: boolean;
    processedRows: number;
    errors: ImportError[];
    warnings: ImportWarning[];
  }> {
    // Implementation would vary based on import type
    // For now, return mock success
    return {
      success: true,
      processedRows: job.total_rows || 0,
      errors: [],
      warnings: []
    };
  }

  // ===== EXPORT FUNCTIONS =====

  /**
   * Create export job
   */
  async createExportJob(
    dataSource: string,
    type: ExportJob['type'],
    format: ExportFormat,
    filters: any,
    organizationId: string,
    userId: string
  ): Promise<ExportJob> {
    try {
      const exportJob: Omit<ExportJob, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        organizationId,
        type,
        status: 'pending',
        dataSource,
        filters,
        format,
        totalRecords: 0,
        processedRecords: 0
      };

      const { data: jobData, error: jobError } = await supabase
        .from('export_jobs')
        .insert(exportJob)
        .select()
        .single();

      if (jobError) throw jobError;

      return {
        ...jobData,
        createdAt: new Date(jobData.createdAt),
        updatedAt: new Date(jobData.updatedAt)
      };
    } catch (error) {
      console.error('Error creating export job:', error);
      throw new Error('Failed to create export job');
    }
  }

  /**
   * Execute export job
   */
  async executeExport(jobId: string): Promise<ExportJob> {
    try {
      // Update job status to processing
      await supabase
        .from('export_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Process export
      const result = await this.processExport(job);

      // Update job with results
      const { data: updatedJob, error: updateError } = await supabase
        .from('export_jobs')
        .update({
          status: result.success ? 'completed' : 'failed',
          processed_records: result.processedRecords,
          file_url: result.fileUrl,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        ...updatedJob,
        createdAt: new Date(updatedJob.createdAt),
        updatedAt: new Date(updatedJob.updatedAt),
        completedAt: updatedJob.completed_at ? new Date(updatedJob.completed_at) : undefined
      };
    } catch (error) {
      console.error('Error executing export:', error);
      throw new Error('Failed to execute export');
    }
  }

  /**
   * Process export data
   */
  private async processExport(job: any): Promise<{
    success: boolean;
    processedRecords: number;
    fileUrl?: string;
  }> {
    // Implementation would vary based on export type
    // For now, return mock success
    return {
      success: true,
      processedRecords: 100,
      fileUrl: 'https://example.com/export.csv'
    };
  }

  // ===== TEMPLATE FUNCTIONS =====

  /**
   * Get import templates
   */
  async getImportTemplates(organizationId: string): Promise<ImportTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('import_templates')
        .select('*')
        .eq('organizationId', organizationId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return data.map(template => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt)
      }));
    } catch (error) {
      console.error('Error getting import templates:', error);
      throw new Error('Failed to get import templates');
    }
  }

  /**
   * Create import template
   */
  async createImportTemplate(template: Omit<ImportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImportTemplate> {
    try {
      const { data, error } = await supabase
        .from('import_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
    } catch (error) {
      console.error('Error creating import template:', error);
      throw new Error('Failed to create import template');
    }
  }

  // ===== MIGRATION FUNCTIONS =====

  /**
   * Get migration sources focused on Southeast Asian systems
   */
  async getMigrationSources(): Promise<MigrationSource[]> {
    return [
      {
        id: 'autocount',
        name: 'AutoCount',
        type: 'autocount',
        description: 'Import data from AutoCount accounting software (Malaysia)',
        supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers', 'Inventory'],
        mappingTemplates: [],
        region: 'SEA',
        mfrsCompliance: true,
        accountClassificationMapping: this.getAutoCountMFRSMapping()
      },
      {
        id: 'sql',
        name: 'SQL Accounting',
        type: 'sql',
        description: 'Import data from SQL Accounting software (Malaysia)',
        supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers', 'Inventory'],
        mappingTemplates: [],
        region: 'SEA',
        mfrsCompliance: true,
        accountClassificationMapping: this.getSQLMFRSMapping()
      },
      {
        id: 'ubs',
        name: 'UBS Accounting',
        type: 'ubs',
        description: 'Import data from UBS Accounting software (Singapore/Malaysia)',
        supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers'],
        mappingTemplates: [],
        region: 'SEA',
        mfrsCompliance: true,
        accountClassificationMapping: this.getUBSMFRSMapping()
      },
      {
        id: 'myob',
        name: 'MYOB',
        type: 'myob',
        description: 'Import data from MYOB accounting software (Australia/SEA)',
        supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers'],
        mappingTemplates: [],
        region: 'SEA',
        mfrsCompliance: true,
        accountClassificationMapping: this.getMYOBMFRSMapping()
      },
      {
        id: 'sage',
        name: 'Sage 50',
        type: 'sage',
        description: 'Import data from Sage 50 accounting software',
        supportedData: ['Chart of Accounts', 'Transactions', 'Customers', 'Suppliers'],
        mappingTemplates: [],
        region: 'Global',
        mfrsCompliance: true,
        accountClassificationMapping: this.getSageMFRSMapping()
      },
      {
        id: 'csv',
        name: 'CSV File',
        type: 'csv',
        description: 'Import data from CSV files with custom mapping',
        supportedData: ['Any data format'],
        mappingTemplates: [],
        region: 'Global',
        mfrsCompliance: false
      }
    ];
  }

  /**
   * Enhanced AutoCount to MFRS mapping with comprehensive standards
   */
  private getAutoCountMFRSMapping(): AccountClassificationMapping {
    return {
      sourceSystem: 'AutoCount',
      targetSystem: 'AI-BOS MFRS',
      mappings: [
        // MFRS 101 - Presentation of Financial Statements
        { sourceCategory: 'Current Assets', sourceSubcategory: 'Cash & Bank', targetMFRSAccount: '1000-1999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Current Assets', sourceSubcategory: 'Accounts Receivable', targetMFRSAccount: '2000-2999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Current Assets', sourceSubcategory: 'Inventory', targetMFRSAccount: '3000-3999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Fixed Assets', sourceSubcategory: 'Property, Plant & Equipment', targetMFRSAccount: '4000-4999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Fixed Assets', sourceSubcategory: 'Intangible Assets', targetMFRSAccount: '5000-5999', targetMFRSStandard: 'MFRS 138.8', confidence: 0.90, requiresReview: true },
        { sourceCategory: 'Current Liabilities', sourceSubcategory: 'Accounts Payable', targetMFRSAccount: '6000-6999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Current Liabilities', sourceSubcategory: 'Short-term Loans', targetMFRSAccount: '7000-7999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Long-term Liabilities', sourceSubcategory: 'Long-term Loans', targetMFRSAccount: '8000-8999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Equity', sourceSubcategory: 'Share Capital', targetMFRSAccount: '9000-9999', targetMFRSStandard: 'MFRS 101.74', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Equity', sourceSubcategory: 'Retained Earnings', targetMFRSAccount: '10000-10999', targetMFRSStandard: 'MFRS 101.74', confidence: 0.95, requiresReview: false },
        
        // MFRS 115 - Revenue from Contracts with Customers
        { sourceCategory: 'Revenue', sourceSubcategory: 'Sales', targetMFRSAccount: '11000-11999', targetMFRSStandard: 'MFRS 115.9', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Revenue', sourceSubcategory: 'Other Income', targetMFRSAccount: '12000-12999', targetMFRSStandard: 'MFRS 115.9', confidence: 0.85, requiresReview: true },
        
        // MFRS 109 - Financial Instruments
        { sourceCategory: 'Financial Assets', sourceSubcategory: 'Investments', targetMFRSAccount: '13000-13999', targetMFRSStandard: 'MFRS 109.4.1', confidence: 0.85, requiresReview: true },
        { sourceCategory: 'Financial Liabilities', sourceSubcategory: 'Borrowings', targetMFRSAccount: '14000-14999', targetMFRSStandard: 'MFRS 109.4.2', confidence: 0.90, requiresReview: false },
        
        // MFRS 116 - Leases
        { sourceCategory: 'Lease Assets', sourceSubcategory: 'Right-of-Use Assets', targetMFRSAccount: '15000-15999', targetMFRSStandard: 'MFRS 116.22', confidence: 0.85, requiresReview: true },
        { sourceCategory: 'Lease Liabilities', sourceSubcategory: 'Lease Obligations', targetMFRSAccount: '16000-16999', targetMFRSStandard: 'MFRS 116.26', confidence: 0.85, requiresReview: true },
        
        // MFRS 112 - Income Taxes
        { sourceCategory: 'Deferred Tax', sourceSubcategory: 'Deferred Tax Assets', targetMFRSAccount: '17000-17999', targetMFRSStandard: 'MFRS 112.24', confidence: 0.80, requiresReview: true },
        { sourceCategory: 'Deferred Tax', sourceSubcategory: 'Deferred Tax Liabilities', targetMFRSAccount: '18000-18999', targetMFRSStandard: 'MFRS 112.24', confidence: 0.80, requiresReview: true },
        
        // MFRS 138 - Intangible Assets
        { sourceCategory: 'Intangible Assets', sourceSubcategory: 'Goodwill', targetMFRSAccount: '19000-19999', targetMFRSStandard: 'MFRS 138.8', confidence: 0.85, requiresReview: true },
        { sourceCategory: 'Intangible Assets', sourceSubcategory: 'Patents & Licenses', targetMFRSAccount: '20000-20999', targetMFRSStandard: 'MFRS 138.8', confidence: 0.90, requiresReview: false },
        
        // MFRS 136 - Impairment of Assets
        { sourceCategory: 'Impairment', sourceSubcategory: 'Asset Impairment', targetMFRSAccount: '21000-21999', targetMFRSStandard: 'MFRS 136.6', confidence: 0.80, requiresReview: true },
        
        // MFRS 137 - Provisions
        { sourceCategory: 'Provisions', sourceSubcategory: 'Provisions', targetMFRSAccount: '22000-22999', targetMFRSStandard: 'MFRS 137.14', confidence: 0.85, requiresReview: true },
        
        // Expenses - Various MFRS standards
        { sourceCategory: 'Expenses', sourceSubcategory: 'Cost of Sales', targetMFRSAccount: '23000-23999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Administrative Expenses', targetMFRSAccount: '24000-24999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.85, requiresReview: true },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Selling Expenses', targetMFRSAccount: '25000-25999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.85, requiresReview: true },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Finance Costs', targetMFRSAccount: '26000-26999', targetMFRSStandard: 'MFRS 123.6', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Depreciation', targetMFRSAccount: '27000-27999', targetMFRSStandard: 'MFRS 116.31', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Amortization', targetMFRSAccount: '28000-28999', targetMFRSStandard: 'MFRS 138.97', confidence: 0.90, requiresReview: false }
      ],
      complianceNotes: [
        'AutoCount uses traditional Malaysian accounting classifications',
        'MFRS 109 Financial Instruments require careful review for proper classification',
        'MFRS 116 Leases may need adjustment for right-of-use asset recognition',
        'MFRS 112 Deferred Tax calculations require expert review',
        'MFRS 138 Intangible Assets need verification of recognition criteria',
        'MFRS 136 Impairment testing may be required for certain assets',
        'Revenue recognition under MFRS 115 may differ from traditional methods'
      ],
      auditTrail: true
    };
  }

  /**
   * Enhanced SQL Accounting to MFRS mapping
   */
  private getSQLMFRSMapping(): AccountClassificationMapping {
    return {
      sourceSystem: 'SQL Accounting',
      targetSystem: 'AI-BOS MFRS',
      mappings: [
        // Similar structure to AutoCount but with SQL-specific mappings
        { sourceCategory: 'Current Assets', sourceSubcategory: 'Bank', targetMFRSAccount: '1000-1999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Current Assets', sourceSubcategory: 'Debtors', targetMFRSAccount: '2000-2999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Current Assets', sourceSubcategory: 'Stock', targetMFRSAccount: '3000-3999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Fixed Assets', sourceSubcategory: 'Equipment', targetMFRSAccount: '4000-4999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Current Liabilities', sourceSubcategory: 'Creditors', targetMFRSAccount: '6000-6999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Equity', sourceSubcategory: 'Capital', targetMFRSAccount: '9000-9999', targetMFRSStandard: 'MFRS 101.74', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Income', sourceSubcategory: 'Sales', targetMFRSAccount: '11000-11999', targetMFRSStandard: 'MFRS 115.9', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Purchases', targetMFRSAccount: '13000-13999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.90, requiresReview: false }
      ],
      complianceNotes: [
        'SQL Accounting uses simplified Malaysian accounting structure',
        'May need additional subcategories for MFRS compliance',
        'Revenue and expense recognition patterns may differ from MFRS requirements',
        'Financial instruments and leases may need manual classification'
      ],
      auditTrail: true
    };
  }

  /**
   * Enhanced UBS to MFRS mapping
   */
  private getUBSMFRSMapping(): AccountClassificationMapping {
    return {
      sourceSystem: 'UBS Accounting',
      targetSystem: 'AI-BOS MFRS',
      mappings: [
        // UBS-specific mappings
        { sourceCategory: 'Assets', sourceSubcategory: 'Bank', targetMFRSAccount: '1000-1999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Receivables', targetMFRSAccount: '2000-2999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Fixed Assets', targetMFRSAccount: '4000-4999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Liabilities', sourceSubcategory: 'Payables', targetMFRSAccount: '6000-6999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Capital', sourceSubcategory: 'Owner Equity', targetMFRSAccount: '9000-9999', targetMFRSStandard: 'MFRS 101.74', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Income', sourceSubcategory: 'Sales', targetMFRSAccount: '11000-11999', targetMFRSStandard: 'MFRS 115.9', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Cost of Sales', targetMFRSAccount: '13000-13999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.90, requiresReview: false }
      ],
      complianceNotes: [
        'UBS uses basic accounting classifications',
        'May require significant restructuring for MFRS compliance',
        'Revenue recognition and expense categorization need careful review',
        'Financial instruments and complex transactions need expert review'
      ],
      auditTrail: true
    };
  }

  /**
   * Enhanced MYOB to MFRS mapping
   */
  private getMYOBMFRSMapping(): AccountClassificationMapping {
    return {
      sourceSystem: 'MYOB',
      targetSystem: 'AI-BOS MFRS',
      mappings: [
        // MYOB-specific mappings
        { sourceCategory: 'Assets', sourceSubcategory: 'Bank', targetMFRSAccount: '1000-1999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Accounts Receivable', targetMFRSAccount: '2000-2999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Inventory', targetMFRSAccount: '3000-3999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Fixed Assets', targetMFRSAccount: '4000-4999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Liabilities', sourceSubcategory: 'Accounts Payable', targetMFRSAccount: '6000-6999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Equity', sourceSubcategory: 'Owner Equity', targetMFRSAccount: '9000-9999', targetMFRSStandard: 'MFRS 101.74', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Income', sourceSubcategory: 'Sales', targetMFRSAccount: '11000-11999', targetMFRSStandard: 'MFRS 115.9', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Cost of Sales', targetMFRSAccount: '13000-13999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.90, requiresReview: false }
      ],
      complianceNotes: [
        'MYOB follows Australian accounting standards',
        'Some classifications align well with MFRS',
        'Revenue recognition patterns may need adjustment',
        'Tax calculations may differ from Malaysian requirements'
      ],
      auditTrail: true
    };
  }

  /**
   * Enhanced Sage to MFRS mapping
   */
  private getSageMFRSMapping(): AccountClassificationMapping {
    return {
      sourceSystem: 'Sage 50',
      targetSystem: 'AI-BOS MFRS',
      mappings: [
        // Sage-specific mappings
        { sourceCategory: 'Assets', sourceSubcategory: 'Bank', targetMFRSAccount: '1000-1999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Accounts Receivable', targetMFRSAccount: '2000-2999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Inventory', targetMFRSAccount: '3000-3999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.90, requiresReview: false },
        { sourceCategory: 'Assets', sourceSubcategory: 'Fixed Assets', targetMFRSAccount: '4000-4999', targetMFRSStandard: 'MFRS 101.66', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Liabilities', sourceSubcategory: 'Accounts Payable', targetMFRSAccount: '6000-6999', targetMFRSStandard: 'MFRS 101.69', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Equity', sourceSubcategory: 'Owner Equity', targetMFRSAccount: '9000-9999', targetMFRSStandard: 'MFRS 101.74', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Income', sourceSubcategory: 'Sales', targetMFRSAccount: '11000-11999', targetMFRSStandard: 'MFRS 115.9', confidence: 0.95, requiresReview: false },
        { sourceCategory: 'Expenses', sourceSubcategory: 'Cost of Sales', targetMFRSAccount: '13000-13999', targetMFRSStandard: 'MFRS 101.99', confidence: 0.90, requiresReview: false }
      ],
      complianceNotes: [
        'Sage follows UK accounting standards',
        'Generally well-structured for MFRS migration',
        'Some UK-specific classifications may need adjustment',
        'Tax calculations may need Malaysian-specific adjustments'
      ],
      auditTrail: true
    };
  }

  /**
   * Perform migration with MFRS compliance checking
   */
  async performMigration(
    sourceSystem: string,
    data: any,
    options: {
      preserveLegacyClassification?: boolean;
      createAuditTrail?: boolean;
      autoMapAccounts?: boolean;
      requireReview?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    complianceReport: MFRSComplianceReport;
    migratedData: any;
    auditTrail: AuditEntry[];
  }> {
    try {
      const startTime = Date.now();
      const auditTrail: AuditEntry[] = [];
      
      // Get mapping for source system
      const sources = await this.getMigrationSources();
      const source = sources.find(s => s.id === sourceSystem);
      
      if (!source || !source.accountClassificationMapping) {
        throw new Error(`No MFRS mapping available for ${sourceSystem}`);
      }

      // Add audit entry
      auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'MIGRATION_STARTED',
        user: 'system',
        details: `Started migration from ${sourceSystem} to AI-BOS MFRS`,
        changes: { sourceSystem, options }
      });

      // Perform account classification mapping
      const mappingResult = await this.mapAccountClassifications(
        data,
        source.accountClassificationMapping,
        options
      );

      // Generate compliance report
      const complianceReport = await this.generateComplianceReport(
        mappingResult,
        source.accountClassificationMapping
      );

      // If preserve legacy classification is enabled
      if (options.preserveLegacyClassification) {
        const legacyData = await this.preserveLegacyClassification(data, sourceSystem);
        auditTrail.push({
          timestamp: new Date().toISOString(),
          action: 'LEGACY_PRESERVED',
          user: 'system',
          details: 'Legacy classification preserved for audit purposes',
          changes: { legacyData: legacyData.length }
        });
      }

      // Add completion audit entry
      auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'MIGRATION_COMPLETED',
        user: 'system',
        details: `Migration completed in ${Date.now() - startTime}ms`,
        changes: { 
          totalAccounts: complianceReport.totalAccounts,
          complianceScore: complianceReport.complianceScore 
        }
      });

      return {
        success: complianceReport.complianceScore >= 80,
        complianceReport,
        migratedData: mappingResult,
        auditTrail
      };

    } catch (error) {
      console.error('Migration error:', error);
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  /**
   * Map account classifications from legacy system to MFRS
   */
  private async mapAccountClassifications(
    data: any,
    mapping: AccountClassificationMapping,
    options: any
  ): Promise<any> {
    const mappedData = { ...data };
    const issues: ComplianceIssue[] = [];

    // Map chart of accounts
    if (data.chartOfAccounts) {
      mappedData.chartOfAccounts = data.chartOfAccounts.map((account: any) => {
        const mappingRule = mapping.mappings.find(m => 
          m.sourceCategory === account.category &&
          (!m.sourceSubcategory || m.sourceSubcategory === account.subcategory)
        );

        if (mappingRule) {
          return {
            ...account,
            mfrsAccountCode: mappingRule.targetMFRSAccount,
            mfrsStandard: mappingRule.targetMFRSStandard,
            confidence: mappingRule.confidence,
            requiresReview: mappingRule.requiresReview,
            originalClassification: {
              category: account.category,
              subcategory: account.subcategory
            }
          };
        } else {
          issues.push({
            accountCode: account.code,
            accountName: account.name,
            sourceClassification: `${account.category} - ${account.subcategory}`,
            targetClassification: 'UNMAPPED',
            issue: 'No MFRS mapping found for this account classification',
            severity: 'high',
            recommendation: 'Manual review required for proper MFRS classification'
          });

          return {
            ...account,
            mfrsAccountCode: 'UNMAPPED',
            mfrsStandard: 'REQUIRES_REVIEW',
            confidence: 0,
            requiresReview: true,
            originalClassification: {
              category: account.category,
              subcategory: account.subcategory
            }
          };
        }
      });
    }

    return mappedData;
  }

  /**
   * Enhanced compliance report with detailed MFRS analysis
   */
  private async generateComplianceReport(
    mappedData: any,
    mapping: AccountClassificationMapping
  ): Promise<MFRSComplianceReport> {
    const totalAccounts = mappedData.chartOfAccounts?.length || 0;
    const compliantAccounts = mappedData.chartOfAccounts?.filter((a: any) => a.confidence >= 0.8).length || 0;
    const nonCompliantAccounts = mappedData.chartOfAccounts?.filter((a: any) => a.confidence < 0.5).length || 0;
    const requiresReview = mappedData.chartOfAccounts?.filter((a: any) => a.requiresReview).length || 0;

    const complianceScore = totalAccounts > 0 ? (compliantAccounts / totalAccounts) * 100 : 0;

    // Group violations by MFRS standard
    const violationsByStandard: Record<string, number> = {};
    const issues: ComplianceIssue[] = mappedData.chartOfAccounts
      ?.filter((a: any) => a.confidence < 0.8)
      .map((account: any) => {
        const standard = account.mfrsStandard || 'UNKNOWN';
        violationsByStandard[standard] = (violationsByStandard[standard] || 0) + 1;
        
        return {
          accountCode: account.code,
          accountName: account.name,
          sourceClassification: `${account.originalClassification.category} - ${account.originalClassification.subcategory}`,
          targetClassification: account.mfrsAccountCode,
          issue: `Low confidence mapping (${Math.round(account.confidence * 100)}%)`,
          severity: account.confidence < 0.5 ? 'high' : 'medium',
          recommendation: 'Review and manually adjust classification if needed'
        };
      }) || [];

    // Generate MFRS-specific recommendations
    const recommendations = [
      ...mapping.complianceNotes,
      ...(complianceScore < 80 ? ['Consider manual review of low-confidence mappings'] : []),
      ...(requiresReview > 0 ? [`${requiresReview} accounts require manual review`] : []),
      ...this.generateMFRSRecommendations(mappedData)
    ];

    return {
      migrationId: Date.now().toString(),
      totalAccounts,
      compliantAccounts,
      nonCompliantAccounts,
      requiresReview,
      complianceScore: Math.round(complianceScore),
      issues,
      recommendations,
      auditTrail: []
    };
  }

  /**
   * Generate MFRS-specific recommendations based on data analysis
   */
  private generateMFRSRecommendations(mappedData: any): string[] {
    const recommendations: string[] = [];
    
    // Check for specific MFRS standards that need attention
    const standards = mappedData.chartOfAccounts?.map((a: any) => a.mfrsStandard).filter(Boolean) || [];
    
    if (standards.includes('MFRS 109.4.1') || standards.includes('MFRS 109.4.2')) {
      recommendations.push('MFRS 109 Financial Instruments detected - ensure proper classification (Amortized Cost, FVTPL, FVTOCI)');
    }
    
    if (standards.includes('MFRS 116.22') || standards.includes('MFRS 116.26')) {
      recommendations.push('MFRS 116 Leases detected - verify right-of-use asset and lease liability calculations');
    }
    
    if (standards.includes('MFRS 115.9')) {
      recommendations.push('MFRS 115 Revenue from Contracts detected - review performance obligation identification and revenue recognition timing');
    }
    
    if (standards.includes('MFRS 112.24')) {
      recommendations.push('MFRS 112 Income Taxes detected - ensure deferred tax calculations are accurate');
    }
    
    if (standards.includes('MFRS 138.8')) {
      recommendations.push('MFRS 138 Intangible Assets detected - verify recognition criteria and amortization periods');
    }
    
    if (standards.includes('MFRS 136.6')) {
      recommendations.push('MFRS 136 Impairment of Assets detected - consider impairment testing for significant assets');
    }
    
    if (standards.includes('MFRS 137.14')) {
      recommendations.push('MFRS 137 Provisions detected - ensure proper recognition and measurement of provisions');
    }

    return recommendations;
  }

  /**
   * Preserve legacy classification for audit purposes
   */
  private async preserveLegacyClassification(data: any, sourceSystem: string): Promise<any> {
    return {
      sourceSystem,
      migrationDate: new Date().toISOString(),
      originalData: data,
      metadata: {
        preservedFor: 'audit_trail',
        compliance: 'legacy_reference',
        notes: 'Original classification preserved for audit and compliance purposes'
      }
    };
  }

  // ===== UTILITY FUNCTIONS =====

  private isDate(value: string): boolean {
    return !isNaN(Date.parse(value));
  }

  private isNumber(value: string): boolean {
    return !isNaN(Number(value)) && value.trim() !== '';
  }

  private isBoolean(value: string): boolean {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'false' || lower === '1' || lower === '0';
  }

  private isCurrency(value: string): boolean {
    return /^[\$€£¥]?\s*\d+([.,]\d{2})?$/.test(value);
  }

  private matchesType(value: string, type: string): boolean {
    switch (type) {
      case 'date': return this.isDate(value);
      case 'number': return this.isNumber(value);
      case 'boolean': return this.isBoolean(value);
      case 'currency': return this.isCurrency(value);
      default: return true;
    }
  }

  // ===== JOB MANAGEMENT =====

  /**
   * Get import jobs
   */
  async getImportJobs(organizationId: string): Promise<ImportJob[]> {
    try {
      const { data, error } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('organizationId', organizationId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return data.map(job => ({
        ...job,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
        completedAt: job.completed_at ? new Date(job.completed_at) : undefined
      }));
    } catch (error) {
      console.error('Error getting import jobs:', error);
      throw new Error('Failed to get import jobs');
    }
  }

  /**
   * Get export jobs
   */
  async getExportJobs(organizationId: string): Promise<ExportJob[]> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('organizationId', organizationId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return data.map(job => ({
        ...job,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
        completedAt: job.completed_at ? new Date(job.completed_at) : undefined
      }));
    } catch (error) {
      console.error('Error getting export jobs:', error);
      throw new Error('Failed to get export jobs');
    }
  }

  /**
   * Enhanced column type detection with advanced patterns
   */
  private detectDataTypesAdvanced(columns: string[], sampleData: string[][]): { [key: string]: string } {
    const dataTypes: { [key: string]: string } = {};

    columns.forEach((column, index) => {
      const values = sampleData.map(row => row[index]).filter(val => val !== '');
      
      if (values.length === 0) {
        dataTypes[column] = 'string';
        return;
      }

      // Enhanced detection with confidence scoring
      const typeScores = this.calculateTypeScores(column, values);
      const bestType = Object.entries(typeScores).reduce((a, b) => a[1] > b[1] ? a : b);
      
      dataTypes[column] = bestType[0];
    });

    return dataTypes;
  }

  /**
   * Calculate confidence scores for different data types
   */
  private calculateTypeScores(columnName: string, values: string[]): { [key: string]: number } {
    const scores = {
      date: 0,
      currency: 0,
      number: 0,
      boolean: 0,
      email: 0,
      phone: 0,
      url: 0,
      string: 0
    };

    values.forEach(value => {
      // Date detection with multiple formats
      if (this.isDateAdvanced(value)) scores.date += 1;
      
      // Currency detection
      if (this.isCurrencyAdvanced(value)) scores.currency += 1;
      
      // Number detection
      if (this.isNumberAdvanced(value)) scores.number += 1;
      
      // Boolean detection
      if (this.isBooleanAdvanced(value)) scores.boolean += 1;
      
      // Email detection
      if (this.isEmail(value)) scores.email += 1;
      
      // Phone detection
      if (this.isPhone(value)) scores.phone += 1;
      
      // URL detection
      if (this.isUrl(value)) scores.url += 1;
      
      // String (default)
      scores.string += 1;
    });

    // Normalize scores
    const total = values.length;
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / total;
    });

    // Column name hints
    const columnLower = columnName.toLowerCase();
    if (columnLower.includes('date') || columnLower.includes('time')) scores.date += 0.3;
    if (columnLower.includes('amount') || columnLower.includes('price') || columnLower.includes('cost')) scores.currency += 0.3;
    if (columnLower.includes('email')) scores.email += 0.5;
    if (columnLower.includes('phone') || columnLower.includes('tel')) scores.phone += 0.5;
    if (columnLower.includes('url') || columnLower.includes('link')) scores.url += 0.5;

    return scores;
  }

  /**
   * Advanced date detection with multiple formats
   */
  private isDateAdvanced(value: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // M/D/YY or M/D/YYYY
      /^\d{1,2}-\d{1,2}-\d{2,4}$/, // M-D-YY or M-D-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
      /^\d{4}\.\d{2}\.\d{2}$/, // YYYY.MM.DD
    ];

    return datePatterns.some(pattern => pattern.test(value)) || !isNaN(Date.parse(value));
  }

  /**
   * Advanced currency detection
   */
  private isCurrencyAdvanced(value: string): boolean {
    const currencyPatterns = [
      /^[\$€£¥₹]?\s*\d{1,3}(,\d{3})*(\.\d{2})?$/, // $1,234.56
      /^\d{1,3}(,\d{3})*(\.\d{2})?\s*[\$€£¥₹]?$/, // 1,234.56$
      /^[\$€£¥₹]?\s*\d+(\.\d{2})?$/, // $1234.56
      /^\d+(\.\d{2})?\s*[\$€£¥₹]?$/, // 1234.56$
    ];

    return currencyPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Advanced number detection
   */
  private isNumberAdvanced(value: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(value) && !this.isCurrencyAdvanced(value);
  }

  /**
   * Advanced boolean detection
   */
  private isBooleanAdvanced(value: string): boolean {
    const booleanValues = ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n', 't', 'f'];
    return booleanValues.includes(value.toLowerCase());
  }

  /**
   * Email detection
   */
  private isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /**
   * Phone number detection
   */
  private isPhone(value: string): boolean {
    const phonePatterns = [
      /^\+?[\d\s\-\(\)]{10,}$/, // International format
      /^[\d\s\-\(\)]{10,}$/, // US format
      /^\d{3}-\d{3}-\d{4}$/, // XXX-XXX-XXXX
      /^\(\d{3}\)\s?\d{3}-\d{4}$/, // (XXX) XXX-XXXX
    ];
    return phonePatterns.some(pattern => pattern.test(value));
  }

  /**
   * URL detection
   */
  private isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return /^https?:\/\/.+/.test(value);
    }
  }

  /**
   * Calculate comprehensive data quality score
   */
  async calculateDataQuality(jobId: string): Promise<DataQualityScore> {
    try {
      const { data: job, error: jobError } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Get file data
      const { data: fileData, error: fileError } = await supabase.storage
        .from('imports')
        .download(job.fileName);

      if (fileError) throw fileError;

      const text = await fileData.text();
      const lines = text.split('\n').filter(line => line.trim());
      const columns = this.parseCSVHeader(lines[0]);
      const data = lines.slice(1).map(line => this.parseCSVLine(line, columns.length));

      const qualityScore = this.analyzeDataQuality(columns, data);
      return qualityScore;
    } catch (error) {
      console.error('Error calculating data quality:', error);
      throw new Error('Failed to calculate data quality');
    }
  }

  /**
   * Analyze data quality across multiple dimensions
   */
  private analyzeDataQuality(columns: string[], data: string[][]): DataQualityScore {
    const issues: DataQualityIssue[] = [];
    const suggestions: string[] = [];

    let completenessScore = 0;
    let consistencyScore = 0;
    let accuracyScore = 0;
    let uniquenessScore = 0;

    columns.forEach((column, colIndex) => {
      const values = data.map(row => row[colIndex]);
      const nonEmptyValues = values.filter(val => val.trim() !== '');
      
      // Completeness check
      const completeness = nonEmptyValues.length / values.length;
      completenessScore += completeness;
      
      if (completeness < 0.9) {
        issues.push({
          type: 'missing',
          column,
          severity: completeness < 0.5 ? 'high' : 'medium',
          message: `${Math.round((1 - completeness) * 100)}% of values are missing in column "${column}"`,
          suggestion: 'Consider filling missing values or removing incomplete rows'
        });
      }

      // Consistency check
      const dataTypes = this.detectDataTypesAdvanced([column], [nonEmptyValues]);
      const expectedType = dataTypes[column];
      const consistentValues = nonEmptyValues.filter(val => this.matchesTypeAdvanced(val, expectedType));
      const consistency = consistentValues.length / nonEmptyValues.length;
      consistencyScore += consistency;

      if (consistency < 0.95) {
        issues.push({
          type: 'inconsistent',
          column,
          severity: consistency < 0.8 ? 'high' : 'medium',
          message: `${Math.round((1 - consistency) * 100)}% of values have inconsistent data types in column "${column}"`,
          suggestion: `Expected type: ${expectedType}. Review and standardize data format.`
        });
      }

      // Uniqueness check
      const uniqueValues = new Set(nonEmptyValues);
      const uniqueness = uniqueValues.size / nonEmptyValues.length;
      uniquenessScore += uniqueness;

      if (uniqueness < 0.8 && column.toLowerCase().includes('id')) {
        issues.push({
          type: 'duplicate',
          column,
          severity: 'high',
          message: `Column "${column}" appears to be an ID but has ${Math.round((1 - uniqueness) * 100)}% duplicate values`,
          suggestion: 'Check for duplicate records or data entry errors'
        });
      }

      // Accuracy check (basic validation)
      const accuracy = this.validateColumnAccuracy(column, nonEmptyValues);
      accuracyScore += accuracy;
    });

    // Calculate overall score
    const overall = (completenessScore + consistencyScore + accuracyScore + uniquenessScore) / 4;

    // Generate suggestions based on issues
    if (issues.length > 0) {
      suggestions.push('Review and fix data quality issues before importing');
    }
    if (completenessScore < 0.9) {
      suggestions.push('Consider using data cleaning tools to fill missing values');
    }
    if (consistencyScore < 0.95) {
      suggestions.push('Standardize data formats across all columns');
    }

    return {
      overall: Math.round(overall * 100),
      completeness: Math.round(completenessScore * 100),
      consistency: Math.round(consistencyScore * 100),
      accuracy: Math.round(accuracyScore * 100),
      uniqueness: Math.round(uniquenessScore * 100),
      issues,
      suggestions
    };
  }

  /**
   * Validate column accuracy based on expected patterns
   */
  private validateColumnAccuracy(column: string, values: string[]): number {
    const columnLower = column.toLowerCase();
    let validCount = 0;

    values.forEach(value => {
      let isValid = true;

      if (columnLower.includes('email')) {
        isValid = this.isEmail(value);
      } else if (columnLower.includes('phone') || columnLower.includes('tel')) {
        isValid = this.isPhone(value);
      } else if (columnLower.includes('url') || columnLower.includes('link')) {
        isValid = this.isUrl(value);
      } else if (columnLower.includes('date')) {
        isValid = this.isDateAdvanced(value);
      } else if (columnLower.includes('amount') || columnLower.includes('price') || columnLower.includes('cost')) {
        isValid = this.isCurrencyAdvanced(value) || this.isNumberAdvanced(value);
      }

      if (isValid) validCount++;
    });

    return validCount / values.length;
  }

  /**
   * Generate smart suggestions for column mapping
   */
  async generateSmartSuggestions(jobId: string): Promise<SmartSuggestion[]> {
    try {
      const preview = await this.analyzeFile(jobId);
      const suggestions: SmartSuggestion[] = [];

      // Common field mappings
      const commonMappings: { [key: string]: string[] } = {
        'account_code': ['account code', 'account_code', 'code', 'account number', 'acct'],
        'account_name': ['account name', 'account_name', 'name', 'description', 'account description'],
        'amount': ['amount', 'value', 'sum', 'total', 'balance', 'debit', 'credit'],
        'date': ['date', 'date', 'posting_date', 'created_date', 'modified_date'],
        'description': ['description', 'memo', 'notes', 'comment', 'reference'],
        'customer_name': ['customer', 'customer name', 'client', 'client name', 'customer_name'],
        'vendor_name': ['vendor', 'vendor name', 'supplier', 'supplier name', 'vendor_name'],
        'invoice_number': ['invoice', 'invoice number', 'invoice_no', 'inv_number', 'reference'],
        'reference': ['reference', 'ref', 'reference number', 'ref_no', 'transaction_id']
      };

      preview.columns.forEach(column => {
        const columnLower = column.toLowerCase();
        let bestMatch = '';
        let bestConfidence = 0;
        const alternatives: string[] = [];

        Object.entries(commonMappings).forEach(([targetField, patterns]) => {
          patterns.forEach(pattern => {
            const similarity = this.calculateStringSimilarity(columnLower, pattern);
            if (similarity > bestConfidence) {
              bestConfidence = similarity;
              bestMatch = targetField;
            }
            if (similarity > 0.3) {
              alternatives.push(targetField);
            }
          });
        });

        if (bestConfidence > 0.5) {
          suggestions.push({
            column,
            suggestedMapping: bestMatch,
            confidence: bestConfidence,
            reasoning: `Column name "${column}" matches pattern for "${bestMatch}"`,
            alternatives: [...new Set(alternatives)].filter(alt => alt !== bestMatch)
          });
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      throw new Error('Failed to generate smart suggestions');
    }
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  /**
   * Enhanced type matching with advanced patterns
   */
  private matchesTypeAdvanced(value: string, type: string): boolean {
    switch (type) {
      case 'date': return this.isDateAdvanced(value);
      case 'currency': return this.isCurrencyAdvanced(value);
      case 'number': return this.isNumberAdvanced(value);
      case 'boolean': return this.isBooleanAdvanced(value);
      case 'email': return this.isEmail(value);
      case 'phone': return this.isPhone(value);
      case 'url': return this.isUrl(value);
      default: return true;
    }
  }
}

export default ImportExportService; 