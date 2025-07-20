/**
 * System Routes
 * Handle system information and management operations
 */

const express = require('express');
const os = require('os');
const { Logger } = require('../../../utils/logger');

const router = express.Router();
const logger = new Logger('System-Routes');

// Get system information
router.get('/info', async (req, res) => {
  try {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      networkInterfaces: os.networkInterfaces(),
      userInfo: os.userInfo(),
      version: '1.0.0',
      service: 'AI-BOS OS'
    };
    
    res.json({
      success: true,
      system: systemInfo
    });
  } catch (error) {
    logger.error('❌ System info error:', error);
    res.status(500).json({
      error: 'Failed to get system information',
      message: error.message
    });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform
    };
    
    res.json({
      success: true,
      health: health
    });
  } catch (error) {
    logger.error('❌ Health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

// Get system status
router.get('/status', async (req, res) => {
  try {
    const status = {
      service: 'AI-BOS OS API',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      pid: process.pid,
      uptime: process.uptime()
    };
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    logger.error('❌ Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

module.exports = router; 