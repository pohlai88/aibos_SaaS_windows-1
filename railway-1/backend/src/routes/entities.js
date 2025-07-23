const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Database connection with error handling
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
  console.log('✅ Supabase connection initialized for entities');
} catch (error) {
  console.error('❌ Failed to initialize Supabase for entities:', error.message);
  db = null;
}

// In-memory storage for demo (replace with Supabase in production)
let entities = [];
let entityData = {};

// GET /api/entities - List entity definitions
router.get('/', (req, res) => {
  try {
    const { tenant_id, manifest_id } = req.query;
    let filteredEntities = entities;

    if (tenant_id) {
      filteredEntities = filteredEntities.filter(e => e.tenant_id === tenant_id);
    }
    if (manifest_id) {
      filteredEntities = filteredEntities.filter(e => e.manifest_id === manifest_id);
    }

    res.json({
      success: true,
      data: filteredEntities,
      count: filteredEntities.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/entities - Create entity definition
router.post('/', (req, res) => {
  try {
    const { name, manifest_id, tenant_id, schema_json, tags } = req.body;

    if (!name || !manifest_id || !tenant_id || !schema_json) {
      return res.status(400).json({
        success: false,
        error: 'name, manifest_id, tenant_id, and schema_json are required'
      });
    }

    // Check if entity already exists for this tenant
    const existingEntity = entities.find(e =>
      e.tenant_id === tenant_id && e.name === name
    );
    if (existingEntity) {
      return res.status(400).json({
        success: false,
        error: 'Entity already exists for this tenant'
      });
    }

    const entity = {
      entity_id: uuidv4(),
      name,
      manifest_id,
      tenant_id,
      schema_json,
      tags: tags || [],
      created_at: new Date().toISOString()
    };

    entities.push(entity);

    // Initialize data storage for this entity
    entityData[name] = [];

    res.status(201).json({
      success: true,
      data: entity,
      message: 'Entity created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/entities/:name - Get entity data
router.get('/:name', async (req, res) => {
  try {
    const { tenant_id, filters, include_deleted } = req.query;
    const entityName = req.params.name;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id is required'
      });
    }

    // Check if entity exists
    const entity = entities.find(e =>
      e.tenant_id === tenant_id && e.name === entityName
    );
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found' });
    }

    // Parse filters
    let filterObj = {};
    if (filters) {
      try {
        filterObj = JSON.parse(filters);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid filters format' });
      }
    }

    // Get data from database with soft delete filtering
    const includeDeleted = include_deleted === 'true';

    if (!db) {
      // Fallback to in-memory data when database is not available
      let data = entityData[entityName] || [];

      // Apply filters
      if (filters && Object.keys(filterObj).length > 0) {
        data = data.filter(item => {
          return Object.entries(filterObj).every(([key, value]) => {
            return item[key] === value;
          });
        });
      }

      // Filter out deleted items unless includeDeleted is true
      if (!includeDeleted) {
        data = data.filter(item => !item.deleted_at);
      }

      return res.json({
        success: true,
        data: data,
        count: data.length,
        entity: entity,
        includeDeleted
      });
    }

    const { data, error } = await db.getEntityData(entityName, tenant_id, filterObj, includeDeleted);

    if (error) {
      console.error('❌ Database query failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch entity data'
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: (data || []).length,
      entity: entity,
      includeDeleted
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/entities/:name - Create entity record
router.post('/:name', (req, res) => {
  try {
    const { tenant_id, data } = req.body;
    const entityName = req.params.name;

    if (!tenant_id || !data) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id and data are required'
      });
    }

    // Check if entity exists
    const entity = entities.find(e =>
      e.tenant_id === tenant_id && e.name === entityName
    );
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found' });
    }

    const record = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!entityData[entityName]) {
      entityData[entityName] = [];
    }

    entityData[entityName].push(record);

    res.status(201).json({
      success: true,
      data: record,
      message: 'Entity record created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/entities/:name/:id - Update entity record
router.put('/:name/:id', (req, res) => {
  try {
    const { tenant_id, data } = req.body;
    const entityName = req.params.name;
    const recordId = req.params.id;

    if (!tenant_id || !data) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id and data are required'
      });
    }

    // Check if entity exists
    const entity = entities.find(e =>
      e.tenant_id === tenant_id && e.name === entityName
    );
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found' });
    }

    if (!entityData[entityName]) {
      return res.status(404).json({ success: false, error: 'Entity data not found' });
    }

    const recordIndex = entityData[entityName].findIndex(r => r.id === recordId);
    if (recordIndex === -1) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    const updatedRecord = {
      ...entityData[entityName][recordIndex],
      ...data,
      id: recordId,
      updated_at: new Date().toISOString()
    };

    entityData[entityName][recordIndex] = updatedRecord;

    res.json({
      success: true,
      data: updatedRecord,
      message: 'Entity record updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/entities/:name/:id - Soft delete entity record
router.delete('/:name/:id', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    const entityName = req.params.name;
    const recordId = req.params.id;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id is required'
      });
    }

    // Check if entity exists
    const entity = entities.find(e =>
      e.tenant_id === tenant_id && e.name === entityName
    );
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found' });
    }

    // Use soft delete instead of hard delete
    if (!db) {
      // Fallback to in-memory soft delete
      if (!entityData[entityName]) {
        return res.status(404).json({ success: false, error: 'Entity data not found' });
      }

      const recordIndex = entityData[entityName].findIndex(r => r.id === recordId);
      if (recordIndex === -1) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      entityData[entityName][recordIndex].deleted_at = new Date().toISOString();
      entityData[entityName][recordIndex].deleted_by = req.user?.user_id || 'system';

      return res.json({
        success: true,
        message: 'Entity record soft deleted successfully',
        data: entityData[entityName][recordIndex]
      });
    }

    const { data, error } = await db.softDeleteEntityRecord(
      entityName,
      recordId,
      req.user?.user_id || 'system'
    );

    if (error) {
      console.error('❌ Soft delete failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to soft delete record'
      });
    }

    res.json({
      success: true,
      message: 'Entity record soft deleted successfully',
      data
    });
  } catch (error) {
    console.error('❌ Entity soft delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/entities/:name/:id/restore - Restore soft deleted entity record
router.post('/:name/:id/restore', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    const entityName = req.params.name;
    const recordId = req.params.id;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'tenant_id is required'
      });
    }

    // Check if entity exists
    const entity = entities.find(e =>
      e.tenant_id === tenant_id && e.name === entityName
    );
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found' });
    }

    // Restore soft deleted record
    if (!db) {
      // Fallback to in-memory restore
      if (!entityData[entityName]) {
        return res.status(404).json({ success: false, error: 'Entity data not found' });
      }

      const recordIndex = entityData[entityName].findIndex(r => r.id === recordId);
      if (recordIndex === -1) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      delete entityData[entityName][recordIndex].deleted_at;
      delete entityData[entityName][recordIndex].deleted_by;
      entityData[entityName][recordIndex].restored_at = new Date().toISOString();
      entityData[entityName][recordIndex].restored_by = req.user?.user_id || 'system';

      return res.json({
        success: true,
        message: 'Entity record restored successfully',
        data: entityData[entityName][recordIndex]
      });
    }

    const { data, error } = await db.restoreEntityRecord(
      entityName,
      recordId,
      req.user?.user_id || 'system'
    );

    if (error) {
      console.error('❌ Restore failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to restore record'
      });
    }

    res.json({
      success: true,
      message: 'Entity record restored successfully',
      data
    });
  } catch (error) {
    console.error('❌ Entity restore error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
