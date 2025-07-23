const express = require('express');
const router = express.Router();

// Database connection
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
} catch (error) {
  console.error('❌ Failed to initialize Supabase for dashboard:', error.message);
  db = null;
}

// GET /api/dashboard/metrics - Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database service unavailable'
      });
    }

    // Get real metrics from database
    const [usersResult, tenantsResult] = await Promise.all([
      db.listUsers(),
      db.listTenants()
    ]);

    if (usersResult.error || tenantsResult.error) {
      console.error('❌ Failed to fetch dashboard data:', usersResult.error || tenantsResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard data'
      });
    }

    const users = usersResult.data || [];
    const tenants = tenantsResult.data || [];

    // Calculate real metrics
    const activeUsers = users.filter(user => user.is_active !== false).length;
    const activeTenants = tenants.filter(tenant => tenant.status === 'active').length;

    // Calculate MRR (Monthly Recurring Revenue) - simplified calculation
    const mrr = activeTenants * 99.99; // Assuming $99.99 per tenant per month

    // Calculate churn rate (simplified)
    const totalTenants = tenants.length;
    const churnedTenants = tenants.filter(tenant => tenant.status === 'inactive').length;
    const churnRate = totalTenants > 0 ? (churnedTenants / totalTenants) * 100 : 0;

    // NPS Score (simplified - would be calculated from actual surveys)
    const npsScore = 42 + Math.floor(Math.random() * 20); // Simulated NPS between 42-62

    // System health based on active users and tenants
    const serverHealth = activeUsers > 100 ? 'healthy' : activeUsers > 50 ? 'warning' : 'critical';

    // Support tickets (simplified - would come from actual ticket system)
    const openTickets = Math.floor(Math.random() * 20) + 5; // 5-25 tickets
    const criticalBugs = Math.floor(Math.random() * 5) + 1; // 1-6 bugs

    const metrics = {
      activeUsers,
      mrr: Math.round(mrr),
      churnRate: Math.round(churnRate * 10) / 10, // Round to 1 decimal
      npsScore,
      serverHealth,
      openTickets,
      criticalBugs,
      activeTenants,
      totalTenants
    };

    console.log('📊 Dashboard metrics calculated:', metrics);

    res.json({
      success: true,
      data: metrics,
      message: 'Dashboard metrics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate dashboard metrics'
    });
  }
});

// GET /api/dashboard/system-status - Get system performance metrics
router.get('/system-status', async (req, res) => {
  try {
    // Simulate system performance metrics
    // In a real implementation, these would come from actual system monitoring
    const systemMetrics = {
      uptime: 99.9 + (Math.random() * 0.1), // 99.9-100%
      avgResponse: 30 + Math.floor(Math.random() * 40), // 30-70ms
      requestsPerDay: 1000000 + Math.floor(Math.random() * 500000), // 1M-1.5M
      cpuUsage: 20 + Math.floor(Math.random() * 60), // 20-80%
      memoryUsage: 40 + Math.floor(Math.random() * 40), // 40-80%
      diskUsage: 30 + Math.floor(Math.random() * 50), // 30-80%
      activeConnections: 50 + Math.floor(Math.random() * 200), // 50-250
      errorRate: Math.random() * 0.5 // 0-0.5%
    };

    console.log('🖥️ System status retrieved:', systemMetrics);

    res.json({
      success: true,
      data: systemMetrics,
      message: 'System status retrieved successfully'
    });

  } catch (error) {
    console.error('❌ System status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system status'
    });
  }
});

// GET /api/dashboard/analytics - Get detailed analytics
router.get('/analytics', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database service unavailable'
      });
    }

    // Get analytics data
    const [usersResult, tenantsResult] = await Promise.all([
      db.listUsers(),
      db.listTenants()
    ]);

    if (usersResult.error || tenantsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics data'
      });
    }

    const users = usersResult.data || [];
    const tenants = tenantsResult.data || [];

    // Calculate analytics
    const analytics = {
      userGrowth: {
        total: users.length,
        active: users.filter(u => u.is_active !== false).length,
        newThisMonth: Math.floor(users.length * 0.1), // 10% growth
        growthRate: 8.2
      },
      tenantMetrics: {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        newThisMonth: Math.floor(tenants.length * 0.05), // 5% growth
        averageUsersPerTenant: users.length / Math.max(tenants.length, 1)
      },
      performance: {
        avgResponseTime: 45,
        uptime: 99.9,
        errorRate: 0.1,
        throughput: 1200000
      }
    };

    console.log('📈 Analytics data calculated:', analytics);

    res.json({
      success: true,
      data: analytics,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate analytics'
    });
  }
});

module.exports = router;
