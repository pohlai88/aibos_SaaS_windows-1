/**
 * Module Routes
 * Handle module management operations
 */

const express = require('express');
const { Logger } = require('../../../utils/logger');
const database = require('../../../utils/database');

const router = express.Router();
const logger = new Logger('Module-Routes');

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await database.getModules();
    res.json({
      success: true,
      modules: modules,
      count: modules.length
    });
  } catch (error) {
    logger.error('❌ Get modules error:', error);
    res.status(500).json({
      error: 'Failed to get modules',
      message: error.message
    });
  }
});

// Get module by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const module = modules.find(m => m.id === id);
    
    if (!module) {
      return res.status(404).json({
        error: 'Module not found',
        message: `Module with ID ${id} not found`
      });
    }
    
    res.json({
      success: true,
      module: module
    });
  } catch (error) {
    logger.error('❌ Get module error:', error);
    res.status(500).json({
      error: 'Failed to get module',
      message: error.message
    });
  }
});

// Create new module
router.post('/', async (req, res) => {
  try {
    const { name, description, version, type, fileId, metadata } = req.body;
    
    if (!name || !version) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and version are required'
      });
    }
    
    const newModule = {
      id: uuidv4(),
      name,
      description: description || '',
      version,
      type: type || 'custom',
      fileId,
      metadata: metadata || {},
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    modules.push(newModule);
    
    logger.info(`📦 Module created: ${newModule.name} v${newModule.version}`);
    
    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module: newModule
    });
  } catch (error) {
    logger.error('❌ Create module error:', error);
    res.status(500).json({
      error: 'Failed to create module',
      message: error.message
    });
  }
});

// Update module
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, version, type, metadata, status } = req.body;
    
    const moduleIndex = modules.findIndex(m => m.id === id);
    
    if (moduleIndex === -1) {
      return res.status(404).json({
        error: 'Module not found',
        message: `Module with ID ${id} not found`
      });
    }
    
    const updatedModule = {
      ...modules[moduleIndex],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(version && { version }),
      ...(type && { type }),
      ...(metadata && { metadata }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };
    
    modules[moduleIndex] = updatedModule;
    
    logger.info(`📦 Module updated: ${updatedModule.name} v${updatedModule.version}`);
    
    res.json({
      success: true,
      message: 'Module updated successfully',
      module: updatedModule
    });
  } catch (error) {
    logger.error('❌ Update module error:', error);
    res.status(500).json({
      error: 'Failed to update module',
      message: error.message
    });
  }
});

// Delete module
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const moduleIndex = modules.findIndex(m => m.id === id);
    
    if (moduleIndex === -1) {
      return res.status(404).json({
        error: 'Module not found',
        message: `Module with ID ${id} not found`
      });
    }
    
    const deletedModule = modules[moduleIndex];
    modules.splice(moduleIndex, 1);
    
    logger.info(`🗑️ Module deleted: ${deletedModule.name} v${deletedModule.version}`);
    
    res.json({
      success: true,
      message: 'Module deleted successfully',
      module: deletedModule
    });
  } catch (error) {
    logger.error('❌ Delete module error:', error);
    res.status(500).json({
      error: 'Failed to delete module',
      message: error.message
    });
  }
});

// Install module
router.post('/:id/install', async (req, res) => {
  try {
    const { id } = req.params;
    const module = modules.find(m => m.id === id);
    
    if (!module) {
      return res.status(404).json({
        error: 'Module not found',
        message: `Module with ID ${id} not found`
      });
    }
    
    // Simulate installation process
    module.status = 'installing';
    module.installedAt = new Date().toISOString();
    
    // In a real implementation, you'd:
    // 1. Extract the module files
    // 2. Validate the module structure
    // 3. Install dependencies
    // 4. Register the module with the system
    
    setTimeout(() => {
      module.status = 'installed';
      module.updatedAt = new Date().toISOString();
      logger.info(`✅ Module installed: ${module.name} v${module.version}`);
    }, 2000);
    
    res.json({
      success: true,
      message: 'Module installation started',
      module: module
    });
  } catch (error) {
    logger.error('❌ Install module error:', error);
    res.status(500).json({
      error: 'Failed to install module',
      message: error.message
    });
  }
});

// Uninstall module
router.post('/:id/uninstall', async (req, res) => {
  try {
    const { id } = req.params;
    const module = modules.find(m => m.id === id);
    
    if (!module) {
      return res.status(404).json({
        error: 'Module not found',
        message: `Module with ID ${id} not found`
      });
    }
    
    // Simulate uninstallation process
    module.status = 'uninstalling';
    
    setTimeout(() => {
      module.status = 'uninstalled';
      module.updatedAt = new Date().toISOString();
      logger.info(`🗑️ Module uninstalled: ${module.name} v${module.version}`);
    }, 1000);
    
    res.json({
      success: true,
      message: 'Module uninstallation started',
      module: module
    });
  } catch (error) {
    logger.error('❌ Uninstall module error:', error);
    res.status(500).json({
      error: 'Failed to uninstall module',
      message: error.message
    });
  }
});

// Get module statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      total: modules.length,
      active: modules.filter(m => m.status === 'active').length,
      installed: modules.filter(m => m.status === 'installed').length,
      installing: modules.filter(m => m.status === 'installing').length,
      uninstalled: modules.filter(m => m.status === 'uninstalled').length,
      byType: {}
    };
    
    // Count by type
    modules.forEach(module => {
      stats.byType[module.type] = (stats.byType[module.type] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    logger.error('❌ Module stats error:', error);
    res.status(500).json({
      error: 'Failed to get module statistics',
      message: error.message
    });
  }
});

// Search modules
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { type, status } = req.query;
    
    let filteredModules = modules.filter(module => {
      const matchesQuery = module.name.toLowerCase().includes(query.toLowerCase()) ||
                          module.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = !type || module.type === type;
      const matchesStatus = !status || module.status === status;
      
      return matchesQuery && matchesType && matchesStatus;
    });
    
    res.json({
      success: true,
      modules: filteredModules,
      count: filteredModules.length,
      query: query
    });
  } catch (error) {
    logger.error('❌ Search modules error:', error);
    res.status(500).json({
      error: 'Failed to search modules',
      message: error.message
    });
  }
});

module.exports = router; 