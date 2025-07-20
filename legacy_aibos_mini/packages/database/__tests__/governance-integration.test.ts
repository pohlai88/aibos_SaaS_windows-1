import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AibosDatabaseKernel } from '../src/core/AibosDatabaseKernel';
import { MetadataRegistryService } from '../../metadataRegistry/src/services/metadata-registry-service';
import { EnterpriseSchemaRegistry } from '../../DataGovernance/src/enterprise-ssot';

describe('Governance Integration Tests', () => {
  let db: AibosDatabaseKernel;
  let metadataService: MetadataRegistryService;
  let governanceRegistry: EnterpriseSchemaRegistry;
  let testOrgId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Initialize services
    db = new AibosDatabaseKernel();
    metadataService = new MetadataRegistryService(db);
    governanceRegistry = new EnterpriseSchemaRegistry();
    
    // Create test organization and user
    const org = await db.query(`
      INSERT INTO organizations (name, legal_name) 
      VALUES ('Test Org', 'Test Organization LLC') 
      RETURNING id
    `);
    testOrgId = org.rows[0].id;
    
    const user = await db.query(`
      INSERT INTO users (email, first_name, last_name) 
      VALUES ('test@example.com', 'Test', 'User') 
      RETURNING id
    `);
    testUserId = user.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.query('DELETE FROM organizations WHERE id = $1', [testOrgId]);
    await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await db.close();
  });

  describe('Metadata Registry Integration', () => {
    it('should create enriched metadata with governance data', async () => {
      // Create a metadata field
      const metadataField = await metadataService.createMetadataField({
        field_name: 'customer_ssn',
        data_type: 'short_text',
        description: 'Customer Social Security Number',
        domain: 'customer',
        is_pii: true,
        is_sensitive: true,
        business_owner: testUserId,
        technical_owner: testUserId,
        created_by: testUserId
      });

      expect(metadataField.success).toBe(true);
      expect(metadataField.data?.field_name).toBe('customer_ssn');

      // Check if governance metadata was auto-created
      const governanceData = await db.query(`
        SELECT * FROM governance_metadata 
        WHERE metadata_field_id = $1 AND organization_id = $2
      `, [metadataField.data?.id, testOrgId]);

      expect(governanceData.rows.length).toBe(1);
      expect(governanceData.rows[0].crip_classification).toBe('critical');
      expect(governanceData.rows[0].encryption_required).toBe(true);
    });

    it('should log governance audit events', async () => {
      // Check audit log for the auto-classification
      const auditLogs = await db.query(`
        SELECT * FROM governance_audit_log 
        WHERE organization_id = $1 AND action_type = 'classification_assigned'
        ORDER BY performed_at DESC LIMIT 1
      `, [testOrgId]);

      expect(auditLogs.rows.length).toBe(1);
      expect(auditLogs.rows[0].action_description).toContain('Auto-classified');
    });
  });

  describe('CRIP Classification', () => {
    it('should classify PII data as Critical', async () => {
      const result = await governanceRegistry.classifyData({
        fieldName: 'employee_ssn',
        dataType: 'short_text',
        isPII: true,
        isSensitive: true,
        domain: 'employee'
      });

      expect(result.classification).toBe('Critical');
      expect(result.encryptionRequired).toBe(true);
    });

    it('should classify financial data appropriately', async () => {
      const result = await governanceRegistry.classifyData({
        fieldName: 'account_balance',
        dataType: 'currency',
        isFinancial: true,
        domain: 'accounting'
      });

      expect(result.classification).toBe('Restricted');
      expect(result.complianceStandards).toContain('SOX');
    });
  });

  describe('SEA Compliance', () => {
    it('should validate GDPR compliance for EU data', async () => {
      const complianceCheck = await governanceRegistry.validateCompliance({
        dataType: 'personal_data',
        region: 'EU',
        standards: ['GDPR']
      });

      expect(complianceCheck.isCompliant).toBe(true);
      expect(complianceCheck.requirements).toContain('data_subject_rights');
    });
  });

  describe('Database Integration', () => {
    it('should enforce encryption for Critical data', async () => {
      const encryptedData = await db.enforceGovernance({
        data: 'sensitive-customer-data',
        classification: 'Critical',
        operation: 'insert'
      });

      expect(encryptedData.encrypted).toBe(true);
      expect(encryptedData.encryptionMethod).toBe('AES256');
    });

    it('should validate queries against governance policies', async () => {
      const queryValidation = await db.validateQuery({
        query: 'SELECT customer_ssn FROM customers',
        userId: testUserId,
        organizationId: testOrgId
      });

      expect(queryValidation.allowed).toBe(false);
      expect(queryValidation.reason).toContain('Critical data access requires approval');
    });
  });

  describe('Dashboard Metrics', () => {
    it('should return governance dashboard metrics', async () => {
      const metrics = await db.query(`
        SELECT get_governance_dashboard_metrics($1) as metrics
      `, [testOrgId]);

      const dashboardData = metrics.rows[0].metrics;
      
      expect(dashboardData.total_fields).toBeGreaterThan(0);
      expect(dashboardData.classified_fields).toBeGreaterThan(0);
      expect(dashboardData.critical_fields).toBeGreaterThan(0);
      expect(dashboardData.encrypted_fields).toBeGreaterThan(0);
    });
  });
});