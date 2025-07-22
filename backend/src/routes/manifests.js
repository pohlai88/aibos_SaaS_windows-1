const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (replace with Supabase in production)
let manifests = [];
let apps = [];

// GET /api/manifests - List all manifests
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: manifests,
      count: manifests.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/manifests/:id - Get specific manifest
router.get('/:id', (req, res) => {
  try {
    const manifest = manifests.find(m => m.manifest_id === req.params.id);
    if (!manifest) {
      return res.status(404).json({ success: false, error: 'Manifest not found' });
    }
    res.json({ success: true, data: manifest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/manifests - Create new manifest
router.post('/', (req, res) => {
  try {
    const { manifest_name, description, entities, events, ui_components } = req.body;
    
    if (!manifest_name) {
      return res.status(400).json({ success: false, error: 'Manifest name is required' });
    }

    const manifest = {
      manifest_id: uuidv4(),
      manifest_name,
      description: description || '',
      entities: entities || [],
      events: events || [],
      ui_components: ui_components || [],
      version: '1.0.0',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    manifests.push(manifest);
    
    res.status(201).json({
      success: true,
      data: manifest,
      message: 'Manifest created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/manifests/:id - Update manifest
router.put('/:id', (req, res) => {
  try {
    const manifestIndex = manifests.findIndex(m => m.manifest_id === req.params.id);
    if (manifestIndex === -1) {
      return res.status(404).json({ success: false, error: 'Manifest not found' });
    }

    const updatedManifest = {
      ...manifests[manifestIndex],
      ...req.body,
      manifest_id: req.params.id,
      updated_at: new Date().toISOString()
    };

    manifests[manifestIndex] = updatedManifest;
    
    res.json({
      success: true,
      data: updatedManifest,
      message: 'Manifest updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/manifests/:id - Delete manifest
router.delete('/:id', (req, res) => {
  try {
    const manifestIndex = manifests.findIndex(m => m.manifest_id === req.params.id);
    if (manifestIndex === -1) {
      return res.status(404).json({ success: false, error: 'Manifest not found' });
    }

    // Check if manifest is installed in any apps
    const installedApps = apps.filter(app => app.manifest_id === req.params.id);
    if (installedApps.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete manifest that is installed in apps',
        installedApps: installedApps.length
      });
    }

    manifests.splice(manifestIndex, 1);
    
    res.json({
      success: true,
      message: 'Manifest deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 