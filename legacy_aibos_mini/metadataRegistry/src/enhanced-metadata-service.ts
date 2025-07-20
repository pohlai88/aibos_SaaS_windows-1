import { MetadataGovernanceIntegration } from './governance-integration';
import { AibosDatabaseKernel } from '@aibos/database';

export class EnhancedMetadataRegistryService {
  constructor(
    private governanceIntegration: MetadataGovernanceIntegration,
    private database: AibosDatabaseKernel
  ) {}

  async createEnrichedField(fieldData: CreateFieldRequest): Promise<EnrichedMetadataField> {
    // Create base field
    const baseField = await this.createField(fieldData);
    
    // Enrich with governance
    const enrichedField = await this.governanceIntegration.enrichMetadataWithGovernance(baseField);
    
    // Store in database with governance metadata
    await this.database.storeEnrichedMetadata(enrichedField);
    
    // Log governance audit event
    await this.governanceIntegration.logMetadataCreation(enrichedField);
    
    return enrichedField;
  }

  async validateFieldCompliance(fieldId: string): Promise<ComplianceReport> {
    const field = await this.getField(fieldId);
    return await this.governanceIntegration.validateCompliance(field);
  }
}