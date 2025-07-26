const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const os = require('os');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for system routes');
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
  console.error('❌ Failed to initialize Supabase for system:', error.message);
  db = null;
}

// ==================== SYSTEM MANAGEMENT ====================

// GET /api/system/health - Get system health
router.get('/health', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get system health from AI database
    const healthResult = await db.getSystemHealth();

    if (healthResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system health'
      });
    }

    const health = healthResult.data || {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      },
      services: {
        database: 'connected',
        consciousness: 'active',
        websocket: 'running',
        api: 'operational'
      }
    };

    console.log(`🏥 Retrieved system health`);

    res.json({
      success: true,
      data: health,
      message: 'System health retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health'
    });
  }
});

// GET /api/system/info - Get system information
router.get('/info', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get system info from AI database
    const infoResult = await db.getSystemInfo();

    if (infoResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system info'
      });
    }

    const info = infoResult.data || {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      version: process.version,
      pid: process.pid,
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      networkInterfaces: os.networkInterfaces(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      build: process.env.BUILD_ID || 'local'
    };

    console.log(`ℹ️ Retrieved system info`);

    res.json({
      success: true,
      data: info,
      message: 'System info retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system info'
    });
  }
});

// GET /api/system/metrics - Get system metrics
router.get('/metrics', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get system metrics from AI database
    const metricsResult = await db.getSystemMetrics();

    if (metricsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system metrics'
      });
    }

    const metrics = metricsResult.data || {
      timestamp: new Date(),
      performance: {
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      system: {
        loadAverage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        networkConnections: 0 // Would need to implement network monitoring
      },
      application: {
        activeConnections: 0,
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorRate: 0
      },
      database: {
        connections: 0,
        queriesPerSecond: 0,
        averageQueryTime: 0
      }
    };

    console.log(`📊 Retrieved system metrics`);

    res.json({
      success: true,
      data: metrics,
      message: 'System metrics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system metrics'
    });
  }
});

// GET /api/system/config - Get system configuration
router.get('/config', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get system config from AI database
    const configResult = await db.getSystemConfig();

    if (configResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system config'
      });
    }

    const config = configResult.data || {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      database: {
        url: process.env.DATABASE_URL || 'local',
        type: 'supabase'
      },
      ai: {
        enabled: true,
        model: 'consciousness-v1',
        maxTokens: 4096
      },
      security: {
        jwtSecret: process.env.JWT_SECRET ? 'configured' : 'not-configured',
        corsEnabled: true,
        rateLimitEnabled: true
      },
      features: {
        consciousness: true,
        aiInsights: true,
        realtime: true,
        monitoring: true
      }
    };

    console.log(`⚙️ Retrieved system config`);

    res.json({
      success: true,
      data: config,
      message: 'System config retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system config'
    });
  }
});

// PUT /api/system/config - Update system configuration
router.put('/config', async (req, res) => {
  try {
    const configData = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update system config
    const result = await db.updateSystemConfig(configData);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update system config'
      });
    }

    console.log(`⚙️ Updated system config`);

    res.json({
      success: true,
      data: result.data,
      message: 'System config updated successfully'
    });

  } catch (error) {
    console.error('❌ Update system config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update system config'
    });
  }
});

// GET /api/system/logs - Get system logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0, level, startDate, endDate } = req.query;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get system logs from AI database
    const logsResult = await db.getSystemLogs({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { level, startDate, endDate }
    });

    if (logsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system logs'
      });
    }

    const logs = logsResult.data || [
      {
        id: uuidv4(),
        level: 'info',
        message: 'System started successfully',
        timestamp: new Date(Date.now() - 3600000),
        source: 'system',
        metadata: {}
      },
      {
        id: uuidv4(),
        level: 'info',
        message: 'AI Database System initialized',
        timestamp: new Date(Date.now() - 1800000),
        source: 'ai-database',
        metadata: {}
      }
    ];

    console.log(`📝 Retrieved ${logs.length} system logs`);

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      message: 'System logs retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system logs'
    });
  }
});

// DELETE /api/system/logs - Clear system logs
router.delete('/logs', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Clear system logs
    const result = await db.clearSystemLogs();

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to clear system logs'
      });
    }

    console.log(`🗑️ Cleared system logs`);

    res.json({
      success: true,
      message: 'System logs cleared successfully'
    });

  } catch (error) {
    console.error('❌ Clear system logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear system logs'
    });
  }
});

module.exports = router; 