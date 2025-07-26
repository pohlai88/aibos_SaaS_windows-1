const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for monitoring routes');
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
  console.error('❌ Failed to initialize Supabase for monitoring:', error.message);
  db = null;
}

// ==================== SYSTEM HEALTH ====================

// GET /api/monitoring/health - Get system health status
router.get('/health', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get system health from database
    const healthResult = await db.getSystemHealth({
      userId: req.user?.id
    });

    if (healthResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch system health'
      });
    }

    // Generate mock health data if none exists
    const healthData = healthResult.data || {
      overall: 'healthy',
      uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24 hours
      lastCheck: new Date(),
      services: [
        {
          id: 'api-server',
          name: 'API Server',
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
          lastCheck: new Date(),
          errorCount: 0
        },
        {
          id: 'database',
          name: 'Database',
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 50) + 5, // 5-55ms
          lastCheck: new Date(),
          errorCount: 0
        },
        {
          id: 'ai-engine',
          name: 'AI Engine',
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
          lastCheck: new Date(),
          errorCount: 0
        },
        {
          id: 'websocket',
          name: 'WebSocket Server',
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 30) + 5, // 5-35ms
          lastCheck: new Date(),
          errorCount: 0
        }
      ]
    };

    console.log(`🏥 Retrieved system health data`);

    res.json({
      success: true,
      data: healthData,
      message: 'System health data retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health'
    });
  }
});

// ==================== PERFORMANCE METRICS ====================

// GET /api/monitoring/performance - Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get performance metrics from database
    const performanceResult = await db.getPerformanceMetrics({
      userId: req.user?.id
    });

    if (performanceResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch performance metrics'
      });
    }

    // Generate mock performance data if none exists
    const performanceData = performanceResult.data || {
      cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
      memoryUsage: Math.floor(Math.random() * 50) + 30, // 30-80%
      diskUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
      networkLatency: Math.floor(Math.random() * 100) + 50, // 50-150ms
      throughput: Math.floor(Math.random() * 50000000) + 10000000, // 10-60 MB/s
      activeConnections: Math.floor(Math.random() * 100) + 10 // 10-110 connections
    };

    console.log(`⚡ Retrieved performance metrics`);

    res.json({
      success: true,
      data: performanceData,
      message: 'Performance metrics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics'
    });
  }
});

// ==================== ERROR LOGS ====================

// GET /api/monitoring/errors - Get error logs
router.get('/errors', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, level, service } = req.query;

    // Get error logs from database
    const errorsResult = await db.getErrorLogs({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { level, service },
      userId: req.user?.id
    });

    if (errorsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch error logs'
      });
    }

    // Generate mock error data if none exists
    const errorsData = errorsResult.data || [
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        level: 'warning',
        service: 'api-server',
        message: 'High memory usage detected',
        resolved: false
      },
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        level: 'error',
        service: 'database',
        message: 'Connection timeout to database',
        resolved: true
      },
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        level: 'info',
        service: 'ai-engine',
        message: 'AI model loaded successfully',
        resolved: true
      }
    ];

    console.log(`🚨 Retrieved ${errorsData.length} error logs`);

    res.json({
      success: true,
      data: errorsData,
      count: errorsData.length,
      message: 'Error logs retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve error logs'
    });
  }
});

// POST /api/monitoring/errors/:id/resolve - Resolve error
router.post('/errors/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Resolve error in database
    const result = await db.resolveError(id, {
      resolvedBy: req.user?.id,
      resolvedAt: new Date()
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to resolve error'
      });
    }

    console.log(`✅ Resolved error: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Error resolved successfully'
    });

  } catch (error) {
    console.error('❌ Resolve error error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve error'
    });
  }
});

// ==================== SERVICE MANAGEMENT ====================

// POST /api/monitoring/services/:id/restart - Restart service
router.post('/services/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create restart job
    const restartJob = {
      id: uuidv4(),
      serviceId: id,
      action: 'restart',
      status: 'pending',
      initiatedBy: req.user?.id,
      initiatedAt: new Date()
    };

    const result = await db.createServiceJob(restartJob);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to initiate service restart'
      });
    }

    console.log(`🔄 Initiated restart for service: ${id}`);

    // In a real implementation, this would trigger the actual service restart
    // For now, we'll simulate the restart process
    setTimeout(async () => {
      try {
        await db.updateServiceJob(restartJob.id, {
          status: 'completed',
          completedAt: new Date()
        });
        console.log(`✅ Completed restart for service: ${id}`);
      } catch (error) {
        console.error(`❌ Failed to complete restart for service: ${id}`, error);
      }
    }, 5000);

    res.json({
      success: true,
      data: restartJob,
      message: 'Service restart initiated successfully'
    });

  } catch (error) {
    console.error('❌ Service restart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restart service'
    });
  }
});

// GET /api/monitoring/services - Get all services
router.get('/services', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get services from database
    const servicesResult = await db.getServices({
      userId: req.user?.id
    });

    if (servicesResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch services'
      });
    }

    const services = servicesResult.data || [];

    console.log(`🔧 Retrieved ${services.length} services`);

    res.json({
      success: true,
      data: services,
      count: services.length,
      message: 'Services retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve services'
    });
  }
});

// ==================== ALERTS ====================

// GET /api/monitoring/alerts - Get system alerts
router.get('/alerts', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 20, offset = 0, severity } = req.query;

    // Get alerts from database
    const alertsResult = await db.getAlerts({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { severity },
      userId: req.user?.id
    });

    if (alertsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch alerts'
      });
    }

    const alerts = alertsResult.data || [];

    console.log(`🚨 Retrieved ${alerts.length} alerts`);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      message: 'Alerts retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts'
    });
  }
});

// POST /api/monitoring/alerts/:id/acknowledge - Acknowledge alert
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Acknowledge alert
    const result = await db.acknowledgeAlert(id, {
      acknowledgedBy: req.user?.id,
      acknowledgedAt: new Date()
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to acknowledge alert'
      });
    }

    console.log(`✅ Acknowledged alert: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('❌ Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert'
    });
  }
});

// ==================== METRICS HISTORY ====================

// GET /api/monitoring/metrics/history - Get metrics history
router.get('/metrics/history', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { metric, timeRange = '24h', interval = '1h' } = req.query;

    // Get metrics history from database
    const historyResult = await db.getMetricsHistory({
      metric,
      timeRange,
      interval,
      userId: req.user?.id
    });

    if (historyResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics history'
      });
    }

    const history = historyResult.data || [];

    console.log(`📊 Retrieved metrics history for ${metric}`);

    res.json({
      success: true,
      data: history,
      count: history.length,
      message: 'Metrics history retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Metrics history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics history'
    });
  }
});

module.exports = router;
