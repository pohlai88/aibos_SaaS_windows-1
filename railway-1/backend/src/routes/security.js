const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for security routes');
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
  console.error('❌ Failed to initialize Supabase for security:', error.message);
  db = null;
}

// GET /api/security/metrics - Get security metrics
router.get('/metrics', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get compliance status from our AI Compliance Engine
    const complianceEngine = aiDatabaseSystem.getComplianceEngine();
    const complianceStatus = await complianceEngine.verifyCompliance();

    // Get audit logs from our AI Audit Engine
    const auditEngine = aiDatabaseSystem.getAuditEngine();
    const auditLogs = await auditEngine.getRecentLogs({ limit: 100 });

    // Calculate security metrics
    const securityMetrics = {
      securityScore: calculateSecurityScore(complianceStatus),
      totalViolations: auditLogs.filter(log => log.type === 'security_violation').length,
      totalThreats: auditLogs.filter(log => log.type === 'security_threat').length,
      blockedRequests: auditLogs.filter(log => log.action === 'blocked').length,
      allowedRequests: auditLogs.filter(log => log.action === 'allowed').length,
      activePolicies: Object.keys(complianceStatus).length,
      complianceStatus: getOverallComplianceStatus(complianceStatus),
      lastIncident: getLastIncident(auditLogs),
      mfaEnabled: true, // TODO: Get from user settings
      sessionCount: await getActiveSessions(),
      apiCallsToday: await getAPICallsToday()
    };

    console.log('🔒 Security metrics calculated:', securityMetrics);

    res.json({
      success: true,
      data: securityMetrics,
      message: 'Security metrics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Security metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate security metrics'
    });
  }
});

// GET /api/security/violations - Get security violations
router.get('/violations', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, severity, resolved } = req.query;

    // Get violations from audit engine
    const auditEngine = aiDatabaseSystem.getAuditEngine();
    const violations = await auditEngine.getSecurityViolations({
      limit: parseInt(limit),
      offset: parseInt(offset),
      severity,
      resolved: resolved === 'true'
    });

    console.log(`🔒 Retrieved ${violations.length} security violations`);

    res.json({
      success: true,
      data: violations,
      count: violations.length,
      message: 'Security violations retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Security violations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security violations'
    });
  }
});

// POST /api/security/violations/:id/resolve - Resolve security violation
router.post('/violations/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, notes } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Resolve violation through audit engine
    const auditEngine = aiDatabaseSystem.getAuditEngine();
    const result = await auditEngine.resolveViolation(id, {
      resolution,
      notes,
      resolvedBy: req.user?.user_id,
      resolvedAt: new Date()
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to resolve violation'
      });
    }

    console.log(`🔒 Security violation ${id} resolved successfully`);

    res.json({
      success: true,
      data: result.data,
      message: 'Security violation resolved successfully'
    });

  } catch (error) {
    console.error('❌ Resolve violation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve security violation'
    });
  }
});

// GET /api/security/threats - Get security threats
router.get('/threats', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, severity, blocked } = req.query;

    // Get threats from audit engine
    const auditEngine = aiDatabaseSystem.getAuditEngine();
    const threats = await auditEngine.getSecurityThreats({
      limit: parseInt(limit),
      offset: parseInt(offset),
      severity,
      blocked: blocked === 'true'
    });

    console.log(`🔒 Retrieved ${threats.length} security threats`);

    res.json({
      success: true,
      data: threats,
      count: threats.length,
      message: 'Security threats retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Security threats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security threats'
    });
  }
});

// GET /api/security/compliance - Get compliance status
router.get('/compliance', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get compliance status from our AI Compliance Engine
    const complianceEngine = aiDatabaseSystem.getComplianceEngine();
    const complianceStatus = await complianceEngine.verifyCompliance();
    const complianceReport = await complianceEngine.generateComplianceReport();

    console.log('🔒 Compliance status retrieved successfully');

    res.json({
      success: true,
      data: {
        status: complianceStatus,
        report: complianceReport
      },
      message: 'Compliance status retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Compliance status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance status'
    });
  }
});

// GET /api/security/settings - Get security settings
router.get('/settings', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get security settings from database
    const settings = await db.getSecuritySettings(req.user?.tenant_id);

    console.log('🔒 Security settings retrieved successfully');

    res.json({
      success: true,
      data: settings,
      message: 'Security settings retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Security settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security settings'
    });
  }
});

// POST /api/security/settings - Update security settings
router.post('/settings', async (req, res) => {
  try {
    const { mfaEnabled, sessionTimeout, apiRateLimit } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update security settings
    const result = await db.updateSecuritySettings(req.user?.tenant_id, {
      mfaEnabled,
      sessionTimeout,
      apiRateLimit,
      updatedBy: req.user?.user_id,
      updatedAt: new Date()
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update security settings'
      });
    }

    console.log('🔒 Security settings updated successfully');

    res.json({
      success: true,
      data: result.data,
      message: 'Security settings updated successfully'
    });

  } catch (error) {
    console.error('❌ Update security settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update security settings'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function calculateSecurityScore(complianceStatus) {
  const scores = Object.values(complianceStatus).map(status => status.score || 0);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function getOverallComplianceStatus(complianceStatus) {
  const scores = Object.values(complianceStatus).map(status => status.score || 0);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  if (avgScore >= 90) return 'compliant';
  if (avgScore >= 70) return 'warning';
  return 'non_compliant';
}

function getLastIncident(auditLogs) {
  const incidents = auditLogs.filter(log =>
    log.type === 'security_violation' || log.type === 'security_threat'
  );
  return incidents.length > 0 ? incidents[0].timestamp : null;
}

async function getActiveSessions() {
  // TODO: Implement session tracking
  return Math.floor(Math.random() * 50) + 10; // Mock data for now
}

async function getAPICallsToday() {
  // TODO: Implement API call tracking
  return Math.floor(Math.random() * 1000) + 500; // Mock data for now
}

module.exports = router;
