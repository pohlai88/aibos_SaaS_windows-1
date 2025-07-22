const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (replace with Supabase in production)
let apps = [];
let manifests = [];

// GET /api/apps - List all apps
router.get('/', (req, res) => {
  try {
    const { tenant_id } = req.query;
    let filteredApps = apps;
    
    if (tenant_id) {
      filteredApps = apps.filter(app => app.tenant_id === tenant_id);
    }
    
    res.json({
      success: true,
      data: filteredApps,
      count: filteredApps.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/apps/:id - Get specific app
router.get('/:id', (req, res) => {
  try {
    const app = apps.find(a => a.app_id === req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/apps/install - Install app for tenant
router.post('/install', (req, res) => {
  try {
    const { manifest_id, tenant_id, name } = req.body;
    
    if (!manifest_id || !tenant_id || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'manifest_id, tenant_id, and name are required' 
      });
    }

    // Check if manifest exists
    const manifest = manifests.find(m => m.manifest_id === manifest_id);
    if (!manifest) {
      return res.status(404).json({ success: false, error: 'Manifest not found' });
    }

    // Check if app is already installed for this tenant
    const existingApp = apps.find(app => 
      app.manifest_id === manifest_id && app.tenant_id === tenant_id
    );
    if (existingApp) {
      return res.status(400).json({ 
        success: false, 
        error: 'App is already installed for this tenant' 
      });
    }

    const app = {
      app_id: uuidv4(),
      manifest_id,
      tenant_id,
      name,
      version: manifest.version || '1.0.0',
      status: 'installed',
      settings: {},
      installed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    apps.push(app);
    
    res.status(201).json({
      success: true,
      data: app,
      message: 'App installed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/apps/:id - Update app settings
router.put('/:id', (req, res) => {
  try {
    const appIndex = apps.findIndex(a => a.app_id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    const updatedApp = {
      ...apps[appIndex],
      ...req.body,
      app_id: req.params.id,
      updated_at: new Date().toISOString()
    };

    apps[appIndex] = updatedApp;
    
    res.json({
      success: true,
      data: updatedApp,
      message: 'App updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/apps/:id - Uninstall app
router.delete('/:id', (req, res) => {
  try {
    const appIndex = apps.findIndex(a => a.app_id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    apps.splice(appIndex, 1);
    
    res.json({
      success: true,
      message: 'App uninstalled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/apps/:id/start - Start app
router.post('/:id/start', (req, res) => {
  try {
    const app = apps.find(a => a.app_id === req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    app.status = 'running';
    app.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: app,
      message: 'App started successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/apps/:id/stop - Stop app
router.post('/:id/stop', (req, res) => {
  try {
    const app = apps.find(a => a.app_id === req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    app.status = 'stopped';
    app.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: app,
      message: 'App stopped successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 