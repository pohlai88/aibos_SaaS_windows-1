const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

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
router.get('/:name', (req, res) => {
  try {
    const { tenant_id, filters } = req.query;
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

    let data = entityData[entityName] || [];
    
    // Apply filters if provided
    if (filters) {
      try {
        const filterObj = JSON.parse(filters);
        data = data.filter(item => {
          return Object.keys(filterObj).every(key => 
            item[key] === filterObj[key]
          );
        });
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid filters format' });
      }
    }
    
    res.json({
      success: true,
      data,
      count: data.length,
      entity: entity
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

// DELETE /api/entities/:name/:id - Delete entity record
router.delete('/:name/:id', (req, res) => {
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

    if (!entityData[entityName]) {
      return res.status(404).json({ success: false, error: 'Entity data not found' });
    }

    const recordIndex = entityData[entityName].findIndex(r => r.id === recordId);
    if (recordIndex === -1) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    entityData[entityName].splice(recordIndex, 1);
    
    res.json({
      success: true,
      message: 'Entity record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 