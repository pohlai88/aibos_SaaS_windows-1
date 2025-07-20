/**
 * AI-BOS Single Source of Truth (SSOT) Architecture
 * 
 * Enforces consistency across all modules through centralized standards
 */

import Ajv from 'ajv';

// ============================================================================
// AI-BOS CORE DATA DICTIONARY (ENFORCED)
// ============================================================================

export const AIBOS_DATA_DICTIONARY = {
  // Customer/Client/User/Account = CUSTOMER (standardized)
  customer: {
    id: 'customer_id',           // UUID format
    name: 'customer_name',       // String
    email: 'customer_email',     // Email format
    phone: 'customer_phone',     // Phone format
    status: 'customer_status',   // 'active' | 'inactive' | 'suspended'
    created_at: 'created_at',    // ISO 8601 timestamp
    updated_at: 'updated_at'     // ISO 8601 timestamp
  },
  
  // Financial Data (standardized)
  financial: {
    id: 'transaction_id',        // UUID format
    amount: 'amount',            // Decimal(15,2)
    currency: 'currency',        // ISO 4217 code (USD, EUR, etc.)
    date: 'transaction_date',    // ISO 8601 date
    status: 'transaction_status', // 'pending' | 'completed' | 'failed'
    type: 'transaction_type'     // 'payment' | 'refund' | 'fee'
  },
  
  // Document/File Data (standardized)
  document: {
    id: 'document_id',           // UUID format
    name: 'document_name',       // String
    type: 'document_type',       // 'pdf' | 'image' | 'spreadsheet'
    size: 'document_size',       // Number (bytes)
    url: 'document_url',         // String (URL)
    status: 'document_status'    // 'uploaded' | 'processed' | 'approved'
  },
  
  // Common Status Values (standardized)
  status: {
    active: 'active',
    inactive: 'inactive',
    pending: 'pending',
    completed: 'completed',
    failed: 'failed',
    suspended: 'suspended',
    approved: 'approved',
    rejected: 'rejected'
  }
};

// ============================================================================
// AI-BOS SCHEMA REGISTRY (MANDATORY)
// ============================================================================

export const AIBOS_SCHEMAS = {
  customer: {
    type: 'object',
    required: ['customer_id', 'customer_name', 'customer_email'],
    properties: {
      customer_id: { type: 'string', format: 'uuid' },
      customer_name: { type: 'string', minLength: 1, maxLength: 255 },
      customer_email: { type: 'string', format: 'email' },
      customer_phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
      customer_status: { 
        type: 'string', 
        enum: ['active', 'inactive', 'suspended'] 
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
  },
  
  transaction: {
    type: 'object',
    required: ['transaction_id', 'amount', 'currency', 'transaction_date'],
    properties: {
      transaction_id: { type: 'string', format: 'uuid' },
      customer_id: { type: 'string', format: 'uuid' },
      amount: { type: 'number', minimum: 0 },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' },
      transaction_date: { type: 'string', format: 'date' },
      transaction_status: { 
        type: 'string', 
        enum: ['pending', 'completed', 'failed'] 
      },
      transaction_type: { 
        type: 'string', 
        enum: ['payment', 'refund', 'fee'] 
      },
      created_at: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
  },
  
  document: {
    type: 'object',
    required: ['document_id', 'document_name', 'document_type'],
    properties: {
      document_id: { type: 'string', format: 'uuid' },
      document_name: { type: 'string', minLength: 1, maxLength: 255 },
      document_type: { 
        type: 'string', 
        enum: ['pdf', 'image', 'spreadsheet', 'document'] 
      },
      document_size: { type: 'number', minimum: 0 },
      document_url: { type: 'string', format: 'uri' },
      document_status: { 
        type: 'string', 
        enum: ['uploaded', 'processed', 'approved', 'rejected'] 
      },
      created_at: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
  }
};

// ============================================================================
// AI-BOS EVENT STANDARDS (MANDATORY)
// ============================================================================

export const AIBOS_EVENTS = {
  // Customer Events
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  CUSTOMER_STATUS_CHANGED: 'customer.status_changed',
  
  // Transaction Events
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_FAILED: 'transaction.failed',
  TRANSACTION_REFUNDED: 'transaction.refunded',
  
  // Document Events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_PROCESSED: 'document.processed',
  DOCUMENT_APPROVED: 'document.approved',
  DOCUMENT_REJECTED: 'document.rejected',
  
  // System Events
  MODULE_INSTALLED: 'module.installed',
  MODULE_UNINSTALLED: 'module.uninstalled',
  MODULE_UPDATED: 'module.updated'
};

// ============================================================================
// AI-BOS MODULE VALIDATOR
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * AI-BOS Data Governance Integration
 * Integrates with the new @aibos/data-governance package
 */
import { 
  EnterpriseSchemaRegistry,
  CRIPFieldValidator,
  SEAComplianceValidator,
  DataClassification,
  ComplianceFramework
} from '@aibos/data-governance';

export class AIBOSModuleValidator {
  private dataGovernance: EnterpriseSchemaRegistry;
  private cripValidator: CRIPFieldValidator;
  private seaValidator: SEAComplianceValidator;

  constructor() {
    this.dataGovernance = new EnterpriseSchemaRegistry();
    this.cripValidator = new CRIPFieldValidator();
    this.seaValidator = new SEAComplianceValidator();
  }

  private ajv: Ajv;
  private forbiddenPatterns: Array<{
    pattern: RegExp;
    message: string;
    severity: 'error' | 'warning';
  }>;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      coerceTypes: false
    });

    // Register AI-BOS schemas
    Object.entries(AIBOS_SCHEMAS).forEach(([name, schema]) => {
      this.ajv.addSchema(schema, `aibos-${name}`);
    });

    // Define forbidden patterns (anti-patterns)
    this.forbiddenPatterns = [
      // Forbidden field names
      { 
        pattern: /client_id|user_id|account_id/, 
        message: 'Use customer_id from AI-BOS dictionary', 
        severity: 'error' 
      },
      { 
        pattern: /isActive|enabled|status/, 
        message: 'Use customer_status from AI-BOS dictionary', 
        severity: 'error' 
      },
      { 
        pattern: /amount_|price_|cost_/, 
        message: 'Use amount from AI-BOS dictionary', 
        severity: 'error' 
      },
      
      // Forbidden date formats
      { 
        pattern: /MM\/DD\/YYYY|DD-MM-YYYY|MM-DD-YYYY/, 
        message: 'Use ISO 8601 date format (YYYY-MM-DD)', 
        severity: 'error' 
      },
      
      // Forbidden event names
      { 
        pattern: /user_created|client_updated|account_deleted/, 
        message: 'Use AI-BOS standard events (customer.created, etc.)', 
        severity: 'error' 
      },
      
      // Forbidden table names
      { 
        pattern: /clients|users|accounts/, 
        message: 'Use customers table from AI-BOS schema', 
        severity: 'error' 
      },
      
      // Warnings for potential issues
      { 
        pattern: /createdAt|updatedAt/, 
        message: 'Use created_at and updated_at (snake_case)', 
        severity: 'warning' 
      },
      { 
        pattern: /firstName|lastName/, 
        message: 'Consider using customer_name for consistency', 
        severity: 'warning' 
      }
    ];
  }

  /**
   * Validate a module's code against AI-BOS standards
   */
  async validateModule(modulePath: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Load module manifest
      const manifest = await this.loadModuleManifest(modulePath);
      
      // 2. Validate manifest structure
      const manifestValidation = this.validateManifest(manifest);
      if (!manifestValidation.valid) {
        errors.push(...manifestValidation.errors!);
      }

      // 3. Scan code for forbidden patterns
      const codeFiles = await this.scanCodeFiles(modulePath);
      for (const file of codeFiles) {
        const codeValidation = this.validateCodeFile(file);
        if (codeValidation.errors) {
          errors.push(...codeValidation.errors);
        }
        if (codeValidation.warnings) {
          warnings.push(...codeValidation.warnings);
        }
      }

      // 4. Validate data usage
      const dataValidation = await this.validateDataUsage(modulePath);
      if (!dataValidation.valid) {
        errors.push(...dataValidation.errors!);
      }

      // 5. Validate event usage
      const eventValidation = await this.validateEventUsage(modulePath);
      if (!eventValidation.valid) {
        errors.push(...eventValidation.errors!);
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Validation failed: ${error}`]
      };
    }
  }

  /**
   * Validate module manifest
   */
  private validateManifest(manifest: any): ValidationResult {
    const requiredFields = ['moduleId', 'version', 'aibosVersion'];
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!manifest[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (manifest.aibosVersion && !this.isValidAIBOSVersion(manifest.aibosVersion)) {
      errors.push(`Invalid AI-BOS version: ${manifest.aibosVersion}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate code file for forbidden patterns
   */
  private validateCodeFile(filePath: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // This would read the actual file content
    // For now, we'll simulate the validation
    const fileContent = this.readFileContent(filePath);

    for (const rule of this.forbiddenPatterns) {
      if (rule.pattern.test(fileContent)) {
        const message = `${filePath}: ${rule.message}`;
        if (rule.severity === 'error') {
          errors.push(message);
        } else {
          warnings.push(message);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate data usage against AI-BOS schemas
   */
  private async validateDataUsage(modulePath: string): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // This would scan the module for database operations
    // and validate against AI-BOS schemas
    const dataOperations = await this.extractDataOperations(modulePath);
    
    for (const operation of dataOperations) {
      const validation = this.validateDataOperation(operation);
      if (!validation.valid) {
        errors.push(...validation.errors!);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate event usage against AI-BOS standards
   */
  private async validateEventUsage(modulePath: string): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // This would scan the module for event usage
    const events = await this.extractEvents(modulePath);
    
    for (const event of events) {
      if (!this.isValidAIBOSEvent(event)) {
        errors.push(`Invalid event: ${event}. Use AI-BOS standard events.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Helper methods (simplified implementations)
  private async loadModuleManifest(modulePath: string): Promise<any> {
    // Implementation would load module.json or similar
    return {};
  }

  private async scanCodeFiles(modulePath: string): Promise<string[]> {
    // Implementation would scan for .ts, .js, .tsx, .jsx files
    return [];
  }

  private readFileContent(filePath: string): string {
    // Implementation would read file content
    return '';
  }

  private async extractDataOperations(modulePath: string): Promise<any[]> {
    // Implementation would extract database operations
    return [];
  }

  private validateDataOperation(operation: any): ValidationResult {
    // Implementation would validate against AI-BOS schemas
    return { valid: true };
  }

  private async extractEvents(modulePath: string): Promise<string[]> {
    // Implementation would extract event usage
    return [];
  }

  private isValidAIBOSEvent(event: string): boolean {
    return Object.values(AIBOS_EVENTS).includes(event);
  }

  private isValidAIBOSVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  async validateModuleCompliance(moduleCode: string): Promise<ValidationResult> {
    const results = {
      ssot: await this.validateModule(moduleCode),
      crip: await this.cripValidator.validateFields(moduleCode),
      sea: await this.seaValidator.validateCompliance(moduleCode),
      governance: await this.dataGovernance.validateSchema(moduleCode)
    };

    return this.consolidateResults(results);
  }
}

// ============================================================================
// AI-BOS DATA VALIDATOR
// ============================================================================

export class AIBOSDataValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      coerceTypes: false
    });

    // Register AI-BOS schemas
    Object.entries(AIBOS_SCHEMAS).forEach(([name, schema]) => {
      this.ajv.addSchema(schema, `aibos-${name}`);
    });
  }

  /**
   * Validate data against AI-BOS schema
   */
  validateData(table: string, data: any): ValidationResult {
    const schemaName = `aibos-${table}`;
    const validate = this.ajv.getSchema(schemaName);

    if (!validate) {
      return {
        valid: false,
        errors: [`Unknown table: ${table}`]
      };
    }

    const valid = validate(data);
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors?.map(err => `${err.instancePath} ${err.message}`) || []
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple records
   */
  validateDataBatch(table: string, dataArray: any[]): ValidationResult {
    const errors: string[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      const validation = this.validateData(table, dataArray[i]);
      if (!validation.valid) {
        errors.push(`Record ${i}: ${validation.errors!.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

// ============================================================================
// AI-BOS RULE ENGINE (Enhanced)
// ============================================================================

export class AIBOSRuleEngine {
  private validator: AIBOSModuleValidator;
  private dataValidator: AIBOSDataValidator;

  constructor() {
    this.validator = new AIBOSModuleValidator();
    this.dataValidator = new AIBOSDataValidator();
  }

  /**
   * Validate module during development
   */
  async validateModule(modulePath: string): Promise<ValidationResult> {
    return await this.validator.validateModule(modulePath);
  }

  /**
   * Validate data at runtime
   */
  validateRuntimeData(table: string, data: any): ValidationResult {
    return this.dataValidator.validateData(table, data);
  }

  /**
   * Get AI-BOS standards for developers
   */
  getStandards() {
    return {
      dataDictionary: AIBOS_DATA_DICTIONARY,
      schemas: AIBOS_SCHEMAS,
      events: AIBOS_EVENTS
    };
  }

  /**
   * Check if field name follows AI-BOS standards
   */
  isValidFieldName(fieldName: string): boolean {
    const allFields = [
      ...Object.values(AIBOS_DATA_DICTIONARY.customer),
      ...Object.values(AIBOS_DATA_DICTIONARY.financial),
      ...Object.values(AIBOS_DATA_DICTIONARY.document)
    ];
    
    return allFields.includes(fieldName);
  }

  /**
   * Check if event follows AI-BOS standards
   */
  isValidEvent(event: string): boolean {
    return Object.values(AIBOS_EVENTS).includes(event);
  }
}

// Export singleton instance
export const aibosRuleEngine = new AIBOSRuleEngine();