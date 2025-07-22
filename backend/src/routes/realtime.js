const express = require('express');
const router = express.Router();
const realtimeService = require('../services/realtime');
const { authenticateToken } = require('../middleware/auth');

// Get realtime statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = realtimeService.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get realtime statistics'
    });
  }
});

// Broadcast message to tenant
router.post('/broadcast', authenticateToken, (req, res) => {
  try {
    const { channel, event, payload } = req.body;
    const tenantId = req.user.tenant_id;

    if (!channel || !event) {
      return res.status(400).json({
        success: false,
        error: 'Channel and event are required'
      });
    }

    const message = {
      type: 'broadcast',
      channel,
      event,
      payload,
      timestamp: new Date().toISOString()
    };

    realtimeService.broadcastToTenant(tenantId, message);

    res.json({
      success: true,
      message: 'Message broadcasted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast message'
    });
  }
});

// Get connected clients for tenant
router.get('/clients', authenticateToken, (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const tenantClients = realtimeService.tenantChannels.get(tenantId) || new Set();
    
    const clients = Array.from(tenantClients).map(clientId => {
      const client = realtimeService.clients.get(clientId);
      return {
        id: clientId,
        userId: client.userId,
        connectedAt: client.connectedAt,
        subscriptions: Array.from(client.subscriptions)
      };
    });

    res.json({
      success: true,
      data: {
        tenantId,
        clientCount: clients.length,
        clients
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting client list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get client list'
    });
  }
});

// Test realtime connection
router.post('/test', authenticateToken, (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { message } = req.body;

    const testMessage = {
      type: 'test',
      message: message || 'Test message from server',
      timestamp: new Date().toISOString()
    };

    realtimeService.broadcastToTenant(tenantId, testMessage);

    res.json({
      success: true,
      message: 'Test message sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test message'
    });
  }
});

module.exports = router; 