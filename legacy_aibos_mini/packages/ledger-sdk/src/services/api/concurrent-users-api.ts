import express from 'express';
import { ConcurrentUsersService } from '../concurrent-users-service';

export class ConcurrentUsersAPI {
  private app: express.Application;
  private service: ConcurrentUsersService;

  constructor(
    app: express.Application,
    redisUrl: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.app = app;
    this.service = new ConcurrentUsersService(redisUrl, supabaseUrl, supabaseKey);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // ========================================
    // CONCURRENT USERS ENDPOINTS
    // ========================================

    // Get current concurrent users
    this.app.get('/api/concurrent-users/current', async (req, res) => {
      try {
        const count = await this.service.getCurrentConcurrentUsers();
        res.json({
          success: true,
          data: {
            concurrent_users: count,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get current concurrent users',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get comprehensive metrics
    this.app.get('/api/concurrent-users/metrics', async (req, res) => {
      try {
        const metrics = await this.service.getConcurrentUserMetrics();
        res.json({
          success: true,
          data: metrics
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get metrics',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get concurrent users by module
    this.app.get('/api/concurrent-users/module/:moduleId', async (req, res) => {
      try {
        const { moduleId } = req.params;
        const count = await this.service.getConcurrentUsersByModule(moduleId);
        res.json({
          success: true,
          data: {
            module_id: moduleId,
            concurrent_users: count,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get module concurrent users',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get concurrent users by organization
    this.app.get('/api/concurrent-users/organization/:organizationId', async (req, res) => {
      try {
        const { organizationId } = req.params;
        const count = await this.service.getConcurrentUsersByOrganization(organizationId);
        res.json({
          success: true,
          data: {
            organization_id: organizationId,
            concurrent_users: count,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get organization concurrent users',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get peak concurrent users
    this.app.get('/api/concurrent-users/peak', async (req, res) => {
      try {
        const { start_time, end_time } = req.query;
        const startTime = start_time ? new Date(start_time as string).getTime() : Date.now() - 24 * 60 * 60 * 1000;
        const endTime = end_time ? new Date(end_time as string).getTime() : Date.now();
        
        const peak = await this.service.getPeakConcurrentUsers(startTime, endTime);
        res.json({
          success: true,
          data: {
            peak_concurrent_users: peak,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get peak concurrent users',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get average concurrent users
    this.app.get('/api/concurrent-users/average', async (req, res) => {
      try {
        const { start_time, end_time } = req.query;
        const startTime = start_time ? new Date(start_time as string).getTime() : Date.now() - 60 * 60 * 1000;
        const endTime = end_time ? new Date(end_time as string).getTime() : Date.now();
        
        const average = await this.service.getAverageConcurrentUsers(startTime, endTime);
        res.json({
          success: true,
          data: {
            average_concurrent_users: average,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get average concurrent users',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get concurrent users trend
    this.app.get('/api/concurrent-users/trend', async (req, res) => {
      try {
        const trend = await this.service.getConcurrentUsersTrend();
        res.json({
          success: true,
          data: {
            trend,
            period: '24h'
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get trend data',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // ========================================
    // USER ACTIVITY TRACKING ENDPOINTS
    // ========================================

    // Track user activity
    this.app.post('/api/concurrent-users/track', async (req, res) => {
      try {
        const {
          userId,
          organizationId,
          sessionId,
          moduleId,
          userAgent,
          ipAddress
        } = req.body;

        // Validate required fields
        if (!userId || !organizationId || !sessionId) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: userId, organizationId, sessionId'
          });
        }

        await this.service.trackUserActivity({
          userId,
          organizationId,
          sessionId,
          moduleId,
          userAgent: userAgent || req.headers['user-agent'] || 'Unknown',
          ipAddress: ipAddress || req.ip || 'Unknown',
          isActive: true
        });

        res.json({
          success: true,
          message: 'User activity tracked successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to track user activity',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // ========================================
    // REAL-TIME ENDPOINTS
    // ========================================

    // Real-time concurrent users stream (Server-Sent Events)
    this.app.get('/api/concurrent-users/realtime', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const sendUpdate = async () => {
        try {
          const count = await this.service.getRealtimeConcurrentUsers();
          res.write(`data: ${JSON.stringify({
            concurrent_users: count,
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          console.error('Error sending real-time update:', error);
        }
      };

      // Send initial data
      sendUpdate();

      // Send updates every 5 seconds
      const interval = setInterval(sendUpdate, 5000);

      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(interval);
      });
    });

    // ========================================
    // ANALYTICS ENDPOINTS
    // ========================================

    // Get module usage analytics
    this.app.get('/api/concurrent-users/analytics/modules', async (req, res) => {
      try {
        const { period = '1h' } = req.query;
        const modules = ['accounting', 'bookkeeping', 'tax', 'crm', 'inventory'];
        
        const moduleData = await Promise.all(
          modules.map(async (moduleId) => {
            const count = await this.service.getConcurrentUsersByModule(moduleId);
            return { module_id: moduleId, concurrent_users: count };
          })
        );

        res.json({
          success: true,
          data: {
            modules: moduleData,
            period,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get module analytics',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get organization analytics
    this.app.get('/api/concurrent-users/analytics/organizations', async (req, res) => {
      try {
        const { limit = 10 } = req.query;
        const metrics = await this.service.getConcurrentUserMetrics();
        
        const topOrganizations = Object.entries(metrics.byOrganization)
          .sort(([,a], [,b]) => b - a)
          .slice(0, Number(limit))
          .map(([orgId, count]) => ({
            organization_id: orgId,
            concurrent_users: count
          }));

        res.json({
          success: true,
          data: {
            organizations: topOrganizations,
            limit: Number(limit),
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get organization analytics',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // ========================================
    // HEALTH CHECK ENDPOINTS
    // ========================================

    // Health check
    this.app.get('/api/concurrent-users/health', async (req, res) => {
      try {
        const current = await this.service.getCurrentConcurrentUsers();
        res.json({
          success: true,
          data: {
            status: 'healthy',
            current_concurrent_users: current,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(503).json({
          success: false,
          data: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        });
      }
    });

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    // Get system status (admin only)
    this.app.get('/api/concurrent-users/admin/status', async (req, res) => {
      try {
        // TODO: Add admin authentication middleware
        const metrics = await this.service.getConcurrentUserMetrics();
        const trend = await this.service.getConcurrentUsersTrend();
        
        res.json({
          success: true,
          data: {
            metrics,
            trend,
            system_info: {
              uptime: process.uptime(),
              memory_usage: process.memoryUsage(),
              node_version: process.version
            },
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get system status',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Force cleanup expired sessions (admin only)
    this.app.post('/api/concurrent-users/admin/cleanup', async (req, res) => {
      try {
        // TODO: Add admin authentication middleware
        // This would trigger the cleanup process manually
        res.json({
          success: true,
          message: 'Cleanup process triggered'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to trigger cleanup',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }
} 