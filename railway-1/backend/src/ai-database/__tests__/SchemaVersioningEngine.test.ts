// ==================== SCHEMA VERSIONING ENGINE TESTS ====================
// Comprehensive test suite for AI-BOS Schema Versioning Engine
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Quality is more important than quantity."

import { SchemaVersioningEngine } from '../SchemaVersioningEngine';
import type { SchemaVersion } from '../SchemaVersioningEngine';

describe('SchemaVersioningEngine', () => {
  let versioningEngine: SchemaVersioningEngine;

  beforeEach(() => {
    versioningEngine = new SchemaVersioningEngine();
  });

  afterEach(() => {
    // Clean up any event listeners
    versioningEngine.removeAllListeners();
  });

  // ==================== TEST DATA ====================
  const sampleSchema1 = {
    tables: {
      users: {
        columns: {
          id: { type: 'uuid', primaryKey: true },
          email: { type: 'varchar(255)', unique: true, notNull: true },
          name: { type: 'varchar(100)', notNull: true },
          created_at: { type: 'timestamp', defaultValue: 'now()' }
        },
        indexes: [
          { name: 'idx_users_email', columns: ['email'] }
        ]
      }
    }
  };

  const sampleSchema2 = {
    tables: {
      users: {
        columns: {
          id: { type: 'uuid', primaryKey: true },
          email: { type: 'varchar(255)', unique: true, notNull: true },
          name: { type: 'varchar(100)', notNull: true },
          phone: { type: 'varchar(20)', unique: true }, // Added field
          created_at: { type: 'timestamp', defaultValue: 'now()' },
          updated_at: { type: 'timestamp', defaultValue: 'now()' } // Added field
        },
        indexes: [
          { name: 'idx_users_email', columns: ['email'] },
          { name: 'idx_users_phone', columns: ['phone'] } // Added index
        ]
      },
      profiles: { // Added table
        columns: {
          id: { type: 'uuid', primaryKey: true },
          user_id: { type: 'uuid', foreignKey: 'users.id' },
          bio: { type: 'text' },
          avatar_url: { type: 'varchar(500)' },
          created_at: { type: 'timestamp', defaultValue: 'now()' }
        },
        indexes: [
          { name: 'idx_profiles_user_id', columns: ['user_id'] }
        ]
      }
    }
  };

  const sampleMetadata = {
    author: 'test-user',
    description: 'Test schema version',
    tags: ['test', 'development'],
    environment: 'development' as const,
    impact: 'low' as const,
    riskLevel: 'low' as const
  };

  // ==================== VERSION CREATION TESTS ====================

  describe('createSchemaVersion', () => {
    it('should create a new schema version with AI analysis', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);

      expect(version).toBeDefined();
      expect(version.id).toBeDefined();
      expect(version.version).toBe('1.0.0');
      expect(version.schema).toEqual(sampleSchema1);
      expect(version.metadata.author).toBe('test-user');
      expect(version.aiAnalysis).toBeDefined();
      expect(version.confidence).toBeGreaterThan(0);
      expect(version.status).toBe('draft');
    });

    it('should generate sequential version numbers', async () => {
      const version1 = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const version2 = await versioningEngine.createSchemaVersion(sampleSchema2, sampleMetadata);

      expect(version1.version).toBe('1.0.0');
      expect(version2.version).toBe('1.0.1');
    });

    it('should detect duplicate schemas by hash', async () => {
      const version1 = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const version2 = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);

      expect(version1.id).toBe(version2.id);
      expect(version1.hash).toBe(version2.hash);
    });

    it('should generate unique hash for different schemas', async () => {
      const version1 = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const version2 = await versioningEngine.createSchemaVersion(sampleSchema2, sampleMetadata);

      expect(version1.hash).not.toBe(version2.hash);
    });

    it('should emit versionCreated event', (done) => {
      versioningEngine.on('versionCreated', (data) => {
        expect(data.version).toBeDefined();
        expect(data.version.schema).toEqual(sampleSchema1);
        done();
      });

      versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
    });

    it('should handle options correctly', async () => {
      const version = await versioningEngine.createSchemaVersion(
        sampleSchema1,
        sampleMetadata,
        { analyze: false, generatePlan: false }
      );

      expect(version.aiAnalysis.confidence).toBe(0);
      expect(version.migrationPlan.steps).toHaveLength(0);
    });
  });

  // ==================== SCHEMA DIFF TESTS ====================

  describe('generateSchemaDiff', () => {
    let version1: SchemaVersion;
    let version2: SchemaVersion;

    beforeEach(async () => {
      version1 = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      version2 = await versioningEngine.createSchemaVersion(sampleSchema2, sampleMetadata);
    });

    it('should generate schema diff between two versions', async () => {
      const diff = await versioningEngine.generateSchemaDiff(version1.version, version2.version);

      expect(diff).toBeDefined();
      expect(diff.fromVersion).toBe(version1.version);
      expect(diff.toVersion).toBe(version2.version);
      expect(diff.changes).toBeDefined();
      expect(diff.breakingChanges).toBeDefined();
      expect(diff.additions).toBeDefined();
      expect(diff.modifications).toBeDefined();
      expect(diff.deletions).toBeDefined();
      expect(diff.impact).toBeDefined();
      expect(diff.aiAnalysis).toBeDefined();
    });

    it('should detect additions correctly', async () => {
      const diff = await versioningEngine.generateSchemaDiff(version1.version, version2.version);

      expect(diff.additions.length).toBeGreaterThan(0);
      expect(diff.additions.some(addition => addition.type === 'field')).toBe(true);
      expect(diff.additions.some(addition => addition.type === 'table')).toBe(true);
    });

    it('should calculate impact correctly', async () => {
      const diff = await versioningEngine.generateSchemaDiff(version1.version, version2.version);

      expect(['low', 'medium', 'high', 'critical']).toContain(diff.impact);
    });

    it('should throw error for non-existent versions', async () => {
      await expect(
        versioningEngine.generateSchemaDiff('999.0.0', '999.0.1')
      ).rejects.toThrow('One or both versions not found');
    });
  });

  // ==================== BREAKING CHANGES TESTS ====================

  describe('detectBreakingChanges', () => {
    it('should detect breaking changes in schema', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const breakingChanges = await versioningEngine.detectBreakingChanges(sampleSchema1, version);

      expect(Array.isArray(breakingChanges)).toBe(true);
    });

    it('should return empty array for first version', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const breakingChanges = await versioningEngine.detectBreakingChanges(sampleSchema1, version);

      expect(breakingChanges).toHaveLength(0);
    });
  });

  // ==================== MIGRATION PLAN TESTS ====================

  describe('generateMigrationPlan', () => {
    it('should generate migration plan for schema version', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const migrationPlan = await versioningEngine.generateMigrationPlan(version);

      expect(migrationPlan).toBeDefined();
      expect(migrationPlan.id).toBeDefined();
      expect(migrationPlan.version).toBe(version.version);
      expect(migrationPlan.steps).toBeDefined();
      expect(migrationPlan.estimatedTime).toBeGreaterThanOrEqual(0);
      expect(migrationPlan.riskLevel).toBeDefined();
      expect(migrationPlan.rollbackSupported).toBeDefined();
      expect(migrationPlan.testingRequired).toBeDefined();
      expect(migrationPlan.validationQueries).toBeDefined();
      expect(migrationPlan.aiConfidence).toBeGreaterThan(0);
    });

    it('should create empty migration plan for first version', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const migrationPlan = await versioningEngine.generateMigrationPlan(version);

      expect(migrationPlan.steps).toHaveLength(0);
      expect(migrationPlan.estimatedTime).toBe(0);
      expect(migrationPlan.riskLevel).toBe('low');
    });

    it('should calculate migration time correctly', async () => {
      await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const version2 = await versioningEngine.createSchemaVersion(sampleSchema2, sampleMetadata);
      const migrationPlan = await versioningEngine.generateMigrationPlan(version2);

      expect(migrationPlan.estimatedTime).toBeGreaterThan(0);
    });
  });

  // ==================== ROLLBACK PLAN TESTS ====================

  describe('generateRollbackPlan', () => {
    it('should generate rollback plan for schema version', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const rollbackPlan = await versioningEngine.generateRollbackPlan(version);

      expect(rollbackPlan).toBeDefined();
      expect(rollbackPlan.id).toBeDefined();
      expect(rollbackPlan.version).toBe(version.version);
      expect(rollbackPlan.steps).toBeDefined();
      expect(rollbackPlan.estimatedTime).toBeGreaterThanOrEqual(0);
      expect(rollbackPlan.riskLevel).toBeDefined();
      expect(rollbackPlan.dataLossRisk).toBeDefined();
      expect(rollbackPlan.validationQueries).toBeDefined();
      expect(rollbackPlan.aiConfidence).toBeGreaterThan(0);
    });

    it('should create empty rollback plan for first version', async () => {
      const version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      const rollbackPlan = await versioningEngine.generateRollbackPlan(version);

      expect(rollbackPlan.steps).toHaveLength(0);
      expect(rollbackPlan.estimatedTime).toBe(0);
      expect(rollbackPlan.riskLevel).toBe('low');
      expect(rollbackPlan.dataLossRisk).toBe('none');
    });
  });

  // ==================== PUBLIC API TESTS ====================

  describe('Public API Methods', () => {
    let version: SchemaVersion;

    beforeEach(async () => {
      version = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
    });

    it('should get all versions', () => {
      const versions = versioningEngine.getVersions();
      expect(versions).toHaveLength(1);
      expect(versions[0]!.id).toBe(version.id);
    });

    it('should get specific version', () => {
      const retrievedVersion = versioningEngine.getVersion(version.id);
      expect(retrievedVersion).toBeDefined();
      expect(retrievedVersion!.id).toBe(version.id);
    });

    it('should return undefined for non-existent version', () => {
      const retrievedVersion = versioningEngine.getVersion('non-existent-id');
      expect(retrievedVersion).toBeUndefined();
    });

    it('should get audit trail', () => {
      const auditTrail = versioningEngine.getAuditTrail();
      expect(Array.isArray(auditTrail)).toBe(true);
      expect(auditTrail.length).toBeGreaterThan(0);
    });

    it('should perform health check', () => {
      const health = versioningEngine.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.versions).toBe(1);
      expect(health.diffs).toBe(0);
      expect(health.plans).toBe(0);
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe('Error Handling', () => {
    it('should handle invalid schema gracefully', async () => {
      const invalidSchema = null;

      await expect(
        versioningEngine.createSchemaVersion(invalidSchema as any, sampleMetadata)
      ).rejects.toThrow();
    });

    it('should handle invalid metadata gracefully', async () => {
      const invalidMetadata = { invalidField: 'invalid' };

      const version = await versioningEngine.createSchemaVersion(sampleSchema1, invalidMetadata as any);
      expect(version).toBeDefined();
      expect(version.metadata.author).toBe('system'); // Default value
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance', () => {
    it('should handle large schemas efficiently', async () => {
      const largeSchema: any = {
        tables: {}
      };

      // Create a large schema with many tables
      for (let i = 0; i < 100; i++) {
        largeSchema.tables[`table_${i}`] = {
          columns: {
            id: { type: 'uuid', primaryKey: true },
            name: { type: 'varchar(100)' },
            created_at: { type: 'timestamp', defaultValue: 'now()' }
          }
        };
      }

      const startTime = Date.now();
      const version = await versioningEngine.createSchemaVersion(largeSchema, sampleMetadata);
      const endTime = Date.now();

      expect(version).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle multiple concurrent version creations', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const schema = { ...sampleSchema1, version: i };
        promises.push(versioningEngine.createSchemaVersion(schema, sampleMetadata));
      }

      const versions = await Promise.all(promises);
      expect(versions).toHaveLength(10);
      expect(versions.every(v => v.id)).toBe(true);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Integration', () => {
    it('should handle complete versioning workflow', async () => {
      // 1. Create initial version
      const version1 = await versioningEngine.createSchemaVersion(sampleSchema1, sampleMetadata);
      expect(version1.status).toBe('draft');

      // 2. Create second version
      const version2 = await versioningEngine.createSchemaVersion(sampleSchema2, sampleMetadata);
      expect(version2.status).toBe('draft');

      // 3. Generate diff
      const diff = await versioningEngine.generateSchemaDiff(version1.version, version2.version);
      expect(diff.fromVersion).toBe(version1.version);
      expect(diff.toVersion).toBe(version2.version);

      // 4. Generate migration plan
      const migrationPlan = await versioningEngine.generateMigrationPlan(version2);
      expect(migrationPlan.steps.length).toBeGreaterThan(0);

      // 5. Generate rollback plan
      const rollbackPlan = await versioningEngine.generateRollbackPlan(version2);
      expect(rollbackPlan.steps.length).toBeGreaterThan(0);

      // 6. Verify audit trail
      const auditTrail = versioningEngine.getAuditTrail();
      expect(auditTrail.length).toBeGreaterThan(0);

      // 7. Health check
      const health = versioningEngine.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.versions).toBe(2);
    });
  });
});
