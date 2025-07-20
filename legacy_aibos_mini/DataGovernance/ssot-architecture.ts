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

// ... existing code ...

// Enhanced with Data Governance
export class AIBOSModuleValidator {
  private dataGovernance: EnterpriseSchemaRegistry;
  private cripValidator: CRIPFieldValidator;
  private seaValidator: SEAComplianceValidator;

  constructor() {
    this.dataGovernance = new EnterpriseSchemaRegistry();
    this.cripValidator = new CRIPFieldValidator();
    this.seaValidator = new SEAComplianceValidator();
  }

  // ... existing code ...

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