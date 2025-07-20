import { EnterpriseSchemaRegistry, DataClassification } from '@aibos/data-governance';
import { MetadataField, SecurityLevel } from './metadata-registry-service';

export class MetadataGovernanceBridge {
  constructor(private governance: EnterpriseSchemaRegistry) {}

  async classifyMetadataField(field: MetadataField): Promise<DataClassification> {
    // Map security levels to CRIP classification
    const mapping = {
      [SecurityLevel.RESTRICTED]: DataClassification.CRITICAL,
      [SecurityLevel.CONFIDENTIAL]: DataClassification.RESTRICTED,
      [SecurityLevel.INTERNAL]: DataClassification.INTERNAL,
      [SecurityLevel.PUBLIC]: DataClassification.PUBLIC
    };
    
    return mapping[field.security_level] || DataClassification.INTERNAL;
  }

  async validateFieldCompliance(field: MetadataField): Promise<ValidationResult> {
    const classification = await this.classifyMetadataField(field);
    
    return await this.governance.validateFieldCompliance({
      fieldName: field.field_name,
      dataType: field.data_type,
      classification,
      isPII: field.is_pii,
      isSensitive: field.is_sensitive,
      isFinancial: field.is_financial
    });
  }
}