const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for workspaces routes');
} catch (error) {
  console.error('❌ Failed to initialize AI Database System:', error.message);
  aiDatabaseSystem = null;
}

// Database connection
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
} catch (error) {
  console.error('❌ Failed to initialize Supabase for workspaces:', error.message);
  db = null;
}

// ==================== WORKSPACES MANAGEMENT ====================

// GET /api/workspaces - Get all workspaces
router.get('/', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, tenantId } = req.query;

    // Get workspaces from database
    const workspacesResult = await db.listWorkspaces({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { tenantId }
    });

    if (workspacesResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch workspaces'
      });
    }

    // Generate mock workspaces if none exist
    const workspaces = workspacesResult.data || [
      {
        id: uuidv4(),
        name: 'Development Workspace',
        description: 'Main development environment for AI-BOS',
        tenantId: 'tenant-1',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        metadata: {
          type: 'development',
          environment: 'staging',
          version: '1.0.0'
        }
      },
      {
        id: uuidv4(),
        name: 'Production Workspace',
        description: 'Production environment for AI-BOS',
        tenantId: 'tenant-1',
        status: 'active',
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(),
        metadata: {
          type: 'production',
          environment: 'live',
          version: '1.0.0'
        }
      }
    ];

    console.log(`🏢 Retrieved ${workspaces.length} workspaces`);

    res.json({
      success: true,
      data: workspaces,
      count: workspaces.length,
      message: 'Workspaces retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Workspaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workspaces'
    });
  }
});

// POST /api/workspaces - Create new workspace
router.post('/', async (req, res) => {
  try {
    const { name, description, tenantId, metadata } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const newWorkspace = {
      id: uuidv4(),
      name,
      description,
      tenantId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: metadata || {}
    };

    // Store workspace in database
    const result = await db.createWorkspace(newWorkspace);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create workspace'
      });
    }

    console.log(`🏢 Created new workspace: ${newWorkspace.id}`);

    res.json({
      success: true,
      data: newWorkspace,
      message: 'Workspace created successfully'
    });

  } catch (error) {
    console.error('❌ Create workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workspace'
    });
  }
});

// GET /api/workspaces/:id - Get specific workspace
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get workspace from database
    const workspaceResult = await db.getWorkspace(id);

    if (workspaceResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    console.log(`🏢 Retrieved workspace: ${id}`);

    res.json({
      success: true,
      data: workspaceResult.data,
      message: 'Workspace retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workspace'
    });
  }
});

// PUT /api/workspaces/:id - Update workspace
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update workspace in database
    const result = await db.updateWorkspace(id, {
      ...updateData,
      updatedAt: new Date()
    });

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update workspace'
      });
    }

    console.log(`🏢 Updated workspace: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Workspace updated successfully'
    });

  } catch (error) {
    console.error('❌ Update workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workspace'
    });
  }
});

// DELETE /api/workspaces/:id - Delete workspace
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Delete workspace from database
    const result = await db.deleteWorkspace(id);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete workspace'
      });
    }

    console.log(`🏢 Deleted workspace: ${id}`);

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workspace'
    });
  }
});

// POST /api/workspaces/:id/state - Save workspace state
router.post('/:id/state', async (req, res) => {
  try {
    const { id } = req.params;
    const state = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Save workspace state
    const result = await db.saveWorkspaceState(id, state);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save workspace state'
      });
    }

    console.log(`💾 Saved workspace state: ${id}`);

    res.json({
      success: true,
      message: 'Workspace state saved successfully'
    });

  } catch (error) {
    console.error('❌ Save workspace state error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save workspace state'
    });
  }
});

// GET /api/workspaces/:id/state - Get workspace state
router.get('/:id/state', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get workspace state
    const result = await db.getWorkspaceState(id);

    if (result.error) {
      return res.status(404).json({
        success: false,
        error: 'Workspace state not found'
      });
    }

    console.log(`💾 Retrieved workspace state: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Workspace state retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get workspace state error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workspace state'
    });
  }
});

// GET /api/workspaces/:id/export - Export workspace
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Export workspace
    const result = await db.exportWorkspace(id);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to export workspace'
      });
    }

    console.log(`📦 Exported workspace: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Workspace exported successfully'
    });

  } catch (error) {
    console.error('❌ Export workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export workspace'
    });
  }
});

// POST /api/workspaces/import - Import workspace
router.post('/import', async (req, res) => {
  try {
    const importData = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Import workspace
    const result = await db.importWorkspace(importData);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to import workspace'
      });
    }

    console.log(`📦 Imported workspace: ${result.data.id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Workspace imported successfully'
    });

  } catch (error) {
    console.error('❌ Import workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import workspace'
    });
  }
});

module.exports = router;
