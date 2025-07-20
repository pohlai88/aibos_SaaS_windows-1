import { EnterpriseSchemaRegistry, DataClassification } from '@aibos/data-governance';
import { MetadataRegistryService, MetadataField } from './metadata-registry-service';

export class MetadataGovernanceIntegration {
  constructor(
    private metadataService: MetadataRegistryService,
    private governance: EnterpriseSchemaRegistry
  ) {}

  async enrichMetadataWithGovernance(field: MetadataField): Promise<EnrichedMetadataField> {
    // Auto-classify based on field properties
    const classification = await this.autoClassifyField(field);
    
    // Apply CRIP standards
    const cripCompliance = await this.governance.validateCRIPCompliance({
      fieldName: field.field_name,
      dataType: field.data_type,
      isPII: field.is_pii,
      isSensitive: field.is_sensitive,
      isFinancial: field.is_financial
    });
    
    // Check SEA compliance
    const seaCompliance = await this.governance.validateSEACompliance(field);
    
    return {
      ...field,
      governance: {
        classification,
        cripCompliance,
        seaCompliance,
        encryptionRequired: classification === DataClassification.CRITICAL,
        retentionPolicy: await this.governance.getRetentionPolicy(classification),
        auditRequired: field.is_pii || field.is_financial
      }
    };
  }

  private async autoClassifyField(field: MetadataField): Promise<DataClassification> {
    // Auto-classification logic
    if (field.is_financial && field.is_pii) return DataClassification.CRITICAL;
    if (field.is_pii || field.security_level === 'restricted') return DataClassification.RESTRICTED;
    if (field.security_level === 'confidential') return DataClassification.INTERNAL;
    return DataClassification.PUBLIC;
  }
}