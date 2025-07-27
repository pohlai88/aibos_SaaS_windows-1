// ==================== AI-BOS DATABASE API ENDPOINTS ====================
// The World's First AI-Powered Database Governance API
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getAIDatabaseSystem } from '../ai-database';
import {
  SchemaVersion,
  SchemaVersionMetadata,
  BreakingChange,
  SchemaManifest
} from '../ai-database';
import { SchemaManifestMetadata } from '../ai-database/SchemaManifestGovernance';

const router = express.Router();

// Get the singleton instance of AIDatabaseSystem
const aiDatabaseSystem = getAIDatabaseSystem();

// ==================== VALIDATION SCHEMAS ====================

const CreateSchemaVersionSchema = z.object({
  schema: z.any(),
  metadata: z.object({
    author: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    tenantId: z.string().optional(),
    moduleId: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    estimatedDowntime: z.number().optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional()
  }).optional(),
  options: z.object({
    analyze: z.boolean().optional(),
    generatePlan: z.boolean().optional()
  }).optional()
});

const CreateManifestSchema = z.object({
  versionId: z.string(),
  title: z.string(),
  description: z.string(),
  schema: z.any(),
  metadata: z.object({
    author: z.string().optional(),
    department: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    businessImpact: z.string().optional(),
    technicalImpact: z.string().optional(),
    estimatedCost: z.number().optional(),
    estimatedTime: z.number().optional(),
    dependencies: z.array(z.string()).optional(),
    stakeholders: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    tenantId: z.string().optional(),
    moduleId: z.string().optional()
  }).optional()
});

const SubmitManifestSchema = z.object({
  manifestId: z.string(),
  submittedBy: z.string()
});

const ApproveStepSchema = z.object({
  manifestId: z.string(),
  stepId: z.string(),
  approver: z.string(),
  comment: z.string().optional()
});

const RejectStepSchema = z.object({
  manifestId: z.string(),
  stepId: z.string(),
  approver: z.string(),
  reason: z.string()
});

const GenerateDiffSchema = z.object({
  fromVersion: z.string(),
  toVersion: z.string()
});

const ApproveVersionSchema = z.object({
  versionId: z.string(),
  approvedBy: z.string(),
  comments: z.string().optional()
});

const DeployVersionSchema = z.object({
  versionId: z.string(),
  deployedBy: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  dryRun: z.boolean().optional()
});

const RollbackVersionSchema = z.object({
  versionId: z.string(),
  rolledBackBy: z.string(),
  reason: z.string().optional()
});

// ==================== SCHEMA MANIFEST GOVERNANCE ENDPOINTS ====================

/**
 * POST /api/database/manifest/create
 * Create a new schema manifest
 */
router.post('/manifest/create', async (req: Request, res: Response) => {
  try {
    console.log('📋 Creating new schema manifest');

    const { versionId, title, description, schema, metadata } = CreateManifestSchema.parse(req.body);

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();

    // Create proper metadata object handling optional properties
    const manifestMetadata: Partial<SchemaManifestMetadata> = {};
    if (metadata) {
      if (metadata.author !== undefined) manifestMetadata.author = metadata.author;
      if (metadata.department !== undefined) manifestMetadata.department = metadata.department;
      if (metadata.priority !== undefined) manifestMetadata.priority = metadata.priority;
      if (metadata.businessImpact !== undefined) manifestMetadata.businessImpact = metadata.businessImpact;
      if (metadata.technicalImpact !== undefined) manifestMetadata.technicalImpact = metadata.technicalImpact;
      if (metadata.estimatedCost !== undefined) manifestMetadata.estimatedCost = metadata.estimatedCost;
      if (metadata.estimatedTime !== undefined) manifestMetadata.estimatedTime = metadata.estimatedTime;
      if (metadata.dependencies !== undefined) manifestMetadata.dependencies = metadata.dependencies;
      if (metadata.stakeholders !== undefined) manifestMetadata.stakeholders = metadata.stakeholders;
      if (metadata.tags !== undefined) manifestMetadata.tags = metadata.tags;
      if (metadata.environment !== undefined) manifestMetadata.environment = metadata.environment;
      if (metadata.tenantId !== undefined) manifestMetadata.tenantId = metadata.tenantId;
      if (metadata.moduleId !== undefined) manifestMetadata.moduleId = metadata.moduleId;
    }

    const manifest = await schemaManifestGovernance.createManifest(versionId, title, description, schema, manifestMetadata);

    res.status(201).json({
      success: true,
      message: 'Schema manifest created successfully',
      data: {
        manifest: {
          id: manifest.id,
          versionId: manifest.versionId,
          title: manifest.title,
          description: manifest.description,
          metadata: manifest.metadata,
          aiAnalysis: manifest.aiAnalysis,
          status: manifest.status,
          createdAt: manifest.createdAt,
          updatedAt: manifest.updatedAt
        },
        approvalWorkflow: manifest.approvalWorkflow
      }
    });

  } catch (error) {
    console.error('❌ Schema manifest creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Schema manifest creation failed',
      error: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Unknown error'
    });
  }
});

/**
 * GET /api/database/manifest/list
 * Get all schema manifests
 */
router.get('/manifest/list', async (req: Request, res: Response) => {
  try {
    console.log('📋 Retrieving all schema manifests');

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const manifests = schemaManifestGovernance.getManifests();

    return res.status(200).json({
      success: true,
      message: 'Schema manifests retrieved successfully',
      data: {
        manifests: manifests.map((manifest: SchemaManifest) => ({
          id: manifest.id,
          versionId: manifest.versionId,
          title: manifest.title,
          description: manifest.description,
          metadata: manifest.metadata,
          status: manifest.status,
          createdAt: manifest.createdAt,
          updatedAt: manifest.updatedAt,
          submittedAt: manifest.submittedAt,
          approvedAt: manifest.approvedAt,
          deployedAt: manifest.deployedAt
        })),
        total: manifests.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve schema manifests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema manifests',
      error: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Unknown error'
    });
  }
});

/**
 * GET /api/database/manifest/:id
 * Get specific schema manifest
 */
router.get('/manifest/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Manifest ID is required'
      });
    }
    console.log(`📋 Retrieving schema manifest: ${id}`);

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const manifest = schemaManifestGovernance.getManifest(id);

    if (!manifest) {
      return res.status(404).json({
        success: false,
        message: 'Schema manifest not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Schema manifest retrieved successfully',
      data: {
        manifest: {
          id: manifest.id,
          versionId: manifest.versionId,
          title: manifest.title,
          description: manifest.description,
          schema: manifest.schema,
          metadata: manifest.metadata,
          aiAnalysis: manifest.aiAnalysis,
          status: manifest.status,
          createdAt: manifest.createdAt,
          updatedAt: manifest.updatedAt,
          submittedAt: manifest.submittedAt,
          approvedAt: manifest.approvedAt,
          deployedAt: manifest.deployedAt
        },
        approvalWorkflow: manifest.approvalWorkflow
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve schema manifest:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema manifest',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/manifest/submit
 * Submit manifest for approval
 */
router.post('/manifest/submit', async (req: Request, res: Response) => {
  try {
    console.log('📤 Submitting manifest for approval');

    const { manifestId, submittedBy } = SubmitManifestSchema.parse(req.body);

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const manifest = await schemaManifestGovernance.submitManifest(manifestId, submittedBy);

    return res.status(200).json({
      success: true,
      message: 'Schema manifest submitted successfully',
      data: {
        manifest: {
          id: manifest.id,
          title: manifest.title,
          status: manifest.status,
          submittedAt: manifest.submittedAt,
          updatedAt: manifest.updatedAt
        },
        approvalWorkflow: manifest.approvalWorkflow
      }
    });

  } catch (error) {
    console.error('❌ Schema manifest submission failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Schema manifest submission failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/manifest/approve-step
 * Approve a workflow step
 */
router.post('/manifest/approve-step', async (req: Request, res: Response) => {
  try {
    console.log('✅ Approving workflow step');

    const { manifestId, stepId, approver, comment } = ApproveStepSchema.parse(req.body);

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const step = await schemaManifestGovernance.approveStep(manifestId, stepId, approver, comment);

    return res.status(200).json({
      success: true,
      message: 'Workflow step approved successfully',
      data: {
        step: {
          id: step.id,
          title: step.title,
          status: step.status,
          currentApprovals: step.currentApprovals,
          requiredApprovals: step.requiredApprovals,
          updatedAt: step.updatedAt,
          completedAt: step.completedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Workflow step approval failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Workflow step approval failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/manifest/reject-step
 * Reject a workflow step
 */
router.post('/manifest/reject-step', async (req: Request, res: Response) => {
  try {
    console.log('❌ Rejecting workflow step');

    const { manifestId, stepId, approver, reason } = RejectStepSchema.parse(req.body);

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const step = await schemaManifestGovernance.rejectStep(manifestId, stepId, approver, reason);

    return res.status(200).json({
      success: true,
      message: 'Workflow step rejected successfully',
      data: {
        step: {
          id: step.id,
          title: step.title,
          status: step.status,
          updatedAt: step.updatedAt,
          completedAt: step.completedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Workflow step rejection failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Workflow step rejection failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/manifest/:id/workflow
 * Get approval workflow for manifest
 */
router.get('/manifest/:id/workflow', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Manifest ID is required'
      });
    }
    console.log(`📋 Retrieving approval workflow for manifest: ${id}`);

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const workflow = schemaManifestGovernance.getWorkflow(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Approval workflow not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Approval workflow retrieved successfully',
      data: {
        workflow: {
          id: workflow.id,
          manifestId: workflow.manifestId,
          steps: workflow.steps,
          currentStep: workflow.currentStep,
          status: workflow.status,
          approvers: workflow.approvers,
          escalationPath: workflow.escalationPath,
          autoApproval: workflow.autoApproval,
          requiresSignOff: workflow.requiresSignOff,
          maxApprovalTime: workflow.maxApprovalTime,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          completedAt: workflow.completedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve approval workflow:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve approval workflow',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/manifest/audit-trail
 * Get manifest audit trail
 */
router.get('/manifest/audit-trail', async (req: Request, res: Response) => {
  try {
    console.log('📋 Retrieving manifest audit trail');

    const { schemaManifestGovernance } = aiDatabaseSystem.getEngines();
    const auditTrail = schemaManifestGovernance.getAuditTrail();

    return res.status(200).json({
      success: true,
      message: 'Manifest audit trail retrieved successfully',
      data: {
        auditTrail,
        total: auditTrail.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve manifest audit trail:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve manifest audit trail',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

// ==================== SCHEMA VERSIONING ENDPOINTS ====================

/**
 * POST /api/database/version/create
 * Create a new schema version with AI analysis
 */
router.post('/version/create', async (req: Request, res: Response) => {
  try {
    console.log('📋 Creating new schema version with AI analysis');

    const { schema, metadata, options } = CreateSchemaVersionSchema.parse(req.body);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();

    // Create proper metadata object handling optional properties
    const versionMetadata: Partial<SchemaVersionMetadata> = {};
    if (metadata) {
      if (metadata.author !== undefined) versionMetadata.author = metadata.author;
      if (metadata.description !== undefined) versionMetadata.description = metadata.description;
      if (metadata.tags !== undefined) versionMetadata.tags = metadata.tags;
      if (metadata.environment !== undefined) versionMetadata.environment = metadata.environment;
      if (metadata.tenantId !== undefined) versionMetadata.tenantId = metadata.tenantId;
      if (metadata.moduleId !== undefined) versionMetadata.moduleId = metadata.moduleId;
      if (metadata.dependencies !== undefined) versionMetadata.dependencies = metadata.dependencies;
      if (metadata.impact !== undefined) versionMetadata.impact = metadata.impact;
      if (metadata.estimatedDowntime !== undefined) versionMetadata.estimatedDowntime = metadata.estimatedDowntime;
      if (metadata.riskLevel !== undefined) versionMetadata.riskLevel = metadata.riskLevel;
    }

    const versionOptions = {
      analyze: options?.analyze ?? true,
      generatePlan: options?.generatePlan ?? true
    };
    const version = await schemaVersioning.createSchemaVersion(schema, versionMetadata, versionOptions);

    res.status(201).json({
      success: true,
      message: 'Schema version created successfully',
      data: {
        version: {
          id: version.id,
          version: version.version,
          timestamp: version.timestamp,
          hash: version.hash,
          metadata: version.metadata,
          aiAnalysis: version.aiAnalysis,
          breakingChanges: version.breakingChanges,
          confidence: version.confidence,
          status: version.status
        },
        migrationPlan: version.migrationPlan,
        rollbackPlan: version.rollbackPlan
      }
    });

  } catch (error) {
    console.error('❌ Schema version creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Schema version creation failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/version/list
 * Get all schema versions
 */
router.get('/version/list', async (req: Request, res: Response) => {
  try {
    console.log('📋 Retrieving all schema versions');

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const versions = schemaVersioning.getVersions();

    res.status(200).json({
      success: true,
      message: 'Schema versions retrieved successfully',
      data: {
        versions: versions.map((version: SchemaVersion) => ({
          id: version.id,
          version: version.version,
          timestamp: version.timestamp,
          hash: version.hash,
          metadata: version.metadata,
          confidence: version.confidence,
          status: version.status,
          breakingChangesCount: version.breakingChanges.length
        })),
        total: versions.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve schema versions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema versions',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/version/:id
 * Get specific schema version
 */
router.get('/version/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Version ID is required'
      });
    }
    console.log(`📋 Retrieving schema version: ${id}`);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const version = schemaVersioning.getVersion(id);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Schema version not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Schema version retrieved successfully',
      data: {
        version: {
          id: version.id,
          version: version.version,
          timestamp: version.timestamp,
          hash: version.hash,
          schema: version.schema,
          metadata: version.metadata,
          aiAnalysis: version.aiAnalysis,
          breakingChanges: version.breakingChanges,
          confidence: version.confidence,
          status: version.status
        },
        migrationPlan: version.migrationPlan,
        rollbackPlan: version.rollbackPlan
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve schema version:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema version',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/version/diff
 * Generate schema diff between two versions
 */
router.post('/version/diff', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Generating schema diff');

    const { fromVersion, toVersion } = GenerateDiffSchema.parse(req.body);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const diff = await schemaVersioning.generateSchemaDiff(fromVersion, toVersion);

    return res.status(200).json({
      success: true,
      message: 'Schema diff generated successfully',
      data: {
        diff: {
          id: diff.id,
          fromVersion: diff.fromVersion,
          toVersion: diff.toVersion,
          timestamp: diff.timestamp,
          changes: diff.changes,
          breakingChanges: diff.breakingChanges,
          additions: diff.additions,
          modifications: diff.modifications,
          deletions: diff.deletions,
          impact: diff.impact,
          aiAnalysis: diff.aiAnalysis
        }
      }
    });

  } catch (error) {
    console.error('❌ Schema diff generation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Schema diff generation failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/version/approve
 * Approve a schema version for deployment
 */
router.post('/version/approve', async (req: Request, res: Response) => {
  try {
    console.log('✅ Approving schema version for deployment');

    const { versionId, approvedBy, comments } = ApproveVersionSchema.parse(req.body);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const version = schemaVersioning.getVersion(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Schema version not found'
      });
    }

    // Update version status
    version.status = 'approved';
    version.metadata.author = approvedBy;
    if (comments) {
      version.metadata.description = `${version.metadata.description}\n\nApproval Comments: ${comments}`;
    }

    return res.status(200).json({
      success: true,
      message: 'Schema version approved successfully',
      data: {
        version: {
          id: version.id,
          version: version.version,
          status: version.status,
          metadata: version.metadata
        }
      }
    });

  } catch (error) {
    console.error('❌ Schema version approval failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Schema version approval failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/version/deploy
 * Deploy a schema version
 */
router.post('/version/deploy', async (req: Request, res: Response) => {
  try {
    console.log('🚀 Deploying schema version');

    const { versionId, deployedBy, environment, dryRun = false } = DeployVersionSchema.parse(req.body);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const version = schemaVersioning.getVersion(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Schema version not found'
      });
    }

    if (version.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Schema version must be approved before deployment'
      });
    }

    // Simulate deployment
    if (!dryRun) {
      version.status = 'deployed';
      version.metadata.environment = environment;
    }

    return res.status(200).json({
      success: true,
      message: dryRun ? 'Schema version deployment simulation completed' : 'Schema version deployed successfully',
      data: {
        version: {
          id: version.id,
          version: version.version,
          status: version.status,
          environment: version.metadata.environment
        },
        migrationPlan: version.migrationPlan,
        deploymentInfo: {
          deployedBy,
          environment,
          dryRun,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Schema version deployment failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Schema version deployment failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/version/rollback
 * Rollback a schema version
 */
router.post('/version/rollback', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Rolling back schema version');

    const { versionId, rolledBackBy, reason } = RollbackVersionSchema.parse(req.body);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const version = schemaVersioning.getVersion(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Schema version not found'
      });
    }

    if (version.status !== 'deployed') {
      return res.status(400).json({
        success: false,
        message: 'Only deployed versions can be rolled back'
      });
    }

    // Update version status
    version.status = 'rolled_back';
    if (reason) {
      version.metadata.description = `${version.metadata.description}\n\nRollback Reason: ${reason}`;
    }

    return res.status(200).json({
      success: true,
      message: 'Schema version rolled back successfully',
      data: {
        version: {
          id: version.id,
          version: version.version,
          status: version.status
        },
        rollbackPlan: version.rollbackPlan,
        rollbackInfo: {
          rolledBackBy,
          reason,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Schema version rollback failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Schema version rollback failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/version/:id/migration-plan
 * Get migration plan for a schema version
 */
router.get('/version/:id/migration-plan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Version ID is required'
      });
    }
    console.log(`📋 Retrieving migration plan for version: ${id}`);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const version = schemaVersioning.getVersion(id);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Schema version not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Migration plan retrieved successfully',
      data: {
        migrationPlan: version.migrationPlan
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve migration plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve migration plan',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/version/:id/rollback-plan
 * Get rollback plan for a schema version
 */
router.get('/version/:id/rollback-plan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Version ID is required'
      });
    }
    console.log(`📋 Retrieving rollback plan for version: ${id}`);

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const version = schemaVersioning.getVersion(id);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Schema version not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rollback plan retrieved successfully',
      data: {
        rollbackPlan: version.rollbackPlan
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve rollback plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rollback plan',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/version/audit-trail
 * Get audit trail for schema versions
 */
router.get('/version/audit-trail', async (req: Request, res: Response) => {
  try {
    console.log('📋 Retrieving schema version audit trail');

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const auditTrail = schemaVersioning.getAuditTrail();

    return res.status(200).json({
      success: true,
      message: 'Audit trail retrieved successfully',
      data: {
        auditTrail,
        total: auditTrail.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve audit trail:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit trail',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/version/breaking-changes
 * Get all breaking changes across versions
 */
router.get('/version/breaking-changes', async (req: Request, res: Response) => {
  try {
    console.log('⚠️ Retrieving all breaking changes');

    const { schemaVersioning } = aiDatabaseSystem.getEngines();
    const versions = schemaVersioning.getVersions();

    const allBreakingChanges: BreakingChange[] = [];
    versions.forEach(version => {
      allBreakingChanges.push(...version.breakingChanges);
    });

    return res.status(200).json({
      success: true,
      message: 'Breaking changes retrieved successfully',
      data: {
        breakingChanges: allBreakingChanges,
        total: allBreakingChanges.length,
        bySeverity: {
          critical: allBreakingChanges.filter(bc => bc.severity === 'critical').length,
          high: allBreakingChanges.filter(bc => bc.severity === 'high').length,
          medium: allBreakingChanges.filter(bc => bc.severity === 'medium').length,
          low: allBreakingChanges.filter(bc => bc.severity === 'low').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve breaking changes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve breaking changes',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

// ==================== EXISTING ENDPOINTS (KEPT FOR COMPATIBILITY) ====================

/**
 * POST /api/database/orchestrate
 * AI-powered database orchestration
 */
router.post('/orchestrate', async (req: Request, res: Response) => {
  try {
    console.log('🚀 AI-BOS Database Orchestration: Starting Revolutionary Database Automation');

    const { typescriptInterfaces } = req.body;

    if (!typescriptInterfaces || !Array.isArray(typescriptInterfaces)) {
      return res.status(400).json({
        success: false,
        message: 'typescriptInterfaces array is required'
      });
    }

    const { aiService } = aiDatabaseSystem.getEngines();
    const orchestration = await aiService.orchestrateDatabase(typescriptInterfaces);

    return res.status(200).json({
      success: true,
      message: 'AI-BOS Database Orchestration completed successfully',
      data: orchestration
    });

  } catch (error) {
    console.error('❌ AI-BOS Database Orchestration failed:', error);
    return res.status(500).json({
      success: false,
      message: 'AI-BOS Database Orchestration failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * POST /api/database/schema
 * Generate compliant schema
 */
router.post('/schema', async (req: Request, res: Response) => {
  try {
    console.log('📋 Generating compliant schema');

    const { typescriptInterfaces } = req.body;

    if (!typescriptInterfaces || !Array.isArray(typescriptInterfaces)) {
      return res.status(400).json({
        success: false,
        message: 'typescriptInterfaces array is required'
      });
    }

    const { aiService } = aiDatabaseSystem.getEngines();
    const schema = await aiService.generateCompliantSchema(typescriptInterfaces);

    return res.status(200).json({
      success: true,
      message: 'Compliant schema generated successfully',
      data: schema
    });

  } catch (error) {
    console.error('❌ Schema generation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Schema generation failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/compliance/verify
 * Verify compliance
 */
router.get('/compliance/verify', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Verifying compliance');

    const { databaseConnector } = aiDatabaseSystem.getEngines();
    const compliance = await databaseConnector.verifyCompliance();

    return res.status(200).json({
      success: true,
      message: 'Compliance verification completed',
      data: compliance
    });

  } catch (error) {
    console.error('❌ Compliance verification failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Compliance verification failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/compliance/monitor
 * Monitor compliance in real-time
 */
router.get('/compliance/monitor', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Monitoring compliance in real-time');

    const { databaseConnector } = aiDatabaseSystem.getEngines();
    const monitoring = await databaseConnector.monitorCompliance();

    return res.status(200).json({
      success: true,
      message: 'Compliance monitoring completed',
      data: monitoring
    });

  } catch (error) {
    console.error('❌ Compliance monitoring failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Compliance monitoring failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/compliance/report
 * Generate compliance report
 */
router.get('/compliance/report', async (req: Request, res: Response) => {
  try {
    console.log('📊 Generating compliance report');

    const { databaseConnector } = aiDatabaseSystem.getEngines();
    const report = await databaseConnector.generateComplianceReport();

    return res.status(200).json({
      success: true,
      message: 'Compliance report generated successfully',
      data: report
    });

  } catch (error) {
    console.error('❌ Compliance report generation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Compliance report generation failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/audit/trail
 * Query audit trail
 */
router.get('/audit/trail', async (req: Request, res: Response) => {
  try {
    console.log('📊 Querying audit trail');

    const { telemetryEngine } = aiDatabaseSystem.getEngines();
    const filters = req.query as any;
    const auditTrail = await telemetryEngine.queryAuditTrail(filters);

    return res.status(200).json({
      success: true,
      message: 'Audit trail queried successfully',
      data: auditTrail
    });

  } catch (error) {
    console.error('❌ Audit trail query failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Audit trail query failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/audit/report
 * Generate audit report
 */
router.get('/audit/report', async (req: Request, res: Response) => {
  try {
    console.log('📊 Generating audit report');

    const { telemetryEngine } = aiDatabaseSystem.getEngines();
    const timeframe = (req.query as any)['timeframe'] as string || '30d';
    const report = await telemetryEngine.generateAuditReport(timeframe);

    return res.status(200).json({
      success: true,
      message: 'Audit report generated successfully',
      data: report
    });

  } catch (error) {
    console.error('❌ Audit report generation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Audit report generation failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

/**
 * GET /api/database/health
 * Health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log('🏥 Performing health check');

    const health = aiDatabaseSystem.healthCheck();

    res.status(200).json({
      success: true,
      message: 'Health check completed',
      data: health
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: (error instanceof Error ? error.message : "Unknown error")
    });
  }
});

export default router;
