import { AIBOSModuleValidator } from '../module-registry/src/ssot-architecture';
import { EnterpriseSchemaRegistry } from './enterprise-ssot';

export class AIBOSGovernanceIntegration {
  constructor(
    private governance: EnterpriseSchemaRegistry,
    private moduleValidator: AIBOSModuleValidator
  ) {}

  async validateModuleCompliance(moduleManifest: any): Promise<ValidationResult> {
    // Validate against CRIP classification
    const cripValidation = await this.governance.validateCRIPCompliance(moduleManifest);
    
    // Validate against SEA compliance
    const seaValidation = await this.governance.validateSEACompliance(moduleManifest);
    
    // Validate against AI-BOS standards
    const aibosValidation = await this.moduleValidator.validateModule(moduleManifest);
    
    return {
      isValid: cripValidation.isValid && seaValidation.isValid && aibosValidation.isValid,
      violations: [...cripValidation.violations, ...seaValidation.violations, ...aibosValidation.violations]
    };
  }
}