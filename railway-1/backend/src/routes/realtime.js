const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for realtime routes');
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
  console.error('❌ Failed to initialize Supabase for realtime:', error.message);
  db = null;
}

// ==================== PRESENCE MANAGEMENT ====================

// GET /api/realtime/presence - Get user presence
router.get('/presence', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get presence data from database
    const presenceResult = await db.getPresence({
      userId: req.user?.id
    });

    if (presenceResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch presence data'
      });
    }

    // Generate mock presence data if none exists
    const presenceData = presenceResult.data || [
      {
        id: 'user-1',
        name: 'John Doe',
        status: 'online',
        lastSeen: new Date(),
        currentActivity: 'Working on AI-BOS platform'
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        status: 'away',
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        currentActivity: 'In a meeting'
      },
      {
        id: 'user-3',
        name: 'Mike Johnson',
        status: 'busy',
        lastSeen: new Date(Date.now() - 60000), // 1 minute ago
        currentActivity: 'Coding session'
      },
      {
        id: 'user-4',
        name: 'Sarah Wilson',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        currentActivity: 'Last seen 1 hour ago'
      }
    ];

    console.log(`👥 Retrieved ${presenceData.length} presence records`);

    res.json({
      success: true,
      data: presenceData,
      count: presenceData.length,
      message: 'Presence data retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Presence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve presence data'
    });
  }
});

// POST /api/realtime/presence - Update user presence
router.post('/presence', async (req, res) => {
  try {
    const { status, activity } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update presence in database
    const presenceUpdate = {
      userId: req.user?.id,
      status,
      activity: activity || 'No activity',
      lastSeen: new Date()
    };

    const result = await db.updatePresence(presenceUpdate);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update presence'
      });
    }

    console.log(`✅ Updated presence for user: ${req.user?.id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Presence updated successfully'
    });

  } catch (error) {
    console.error('❌ Update presence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update presence'
    });
  }
});

// ==================== CHANNELS ====================

// GET /api/realtime/channels - Get channels
router.get('/channels', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get channels from database
    const channelsResult = await db.getChannels({
      userId: req.user?.id
    });

    if (channelsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch channels'
      });
    }

    // Generate mock channels data if none exists
    const channelsData = channelsResult.data || [
      {
        id: 'general',
        name: 'general',
        type: 'public',
        participants: ['user-1', 'user-2', 'user-3'],
        unreadCount: 0,
        isActive: true
      },
      {
        id: 'development',
        name: 'development',
        type: 'public',
        participants: ['user-1', 'user-3'],
        unreadCount: 2,
        isActive: true
      },
      {
        id: 'design',
        name: 'design',
        type: 'private',
        participants: ['user-2', 'user-4'],
        unreadCount: 0,
        isActive: false
      },
      {
        id: 'notifications',
        name: 'notifications',
        type: 'system',
        participants: ['user-1', 'user-2', 'user-3', 'user-4'],
        unreadCount: 1,
        isActive: true
      }
    ];

    console.log(`📢 Retrieved ${channelsData.length} channels`);

    res.json({
      success: true,
      data: channelsData,
      count: channelsData.length,
      message: 'Channels retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Channels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve channels'
    });
  }
});

// POST /api/realtime/channels - Create channel
router.post('/channels', async (req, res) => {
  try {
    const { name, type, participants } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Channel name and type are required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create channel in database
    const newChannel = {
      id: uuidv4(),
      name,
      type,
      participants: participants || [req.user?.id],
      unreadCount: 0,
      isActive: true,
      createdAt: new Date(),
      createdBy: req.user?.id
    };

    const result = await db.createChannel(newChannel);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create channel'
      });
    }

    console.log(`✅ Created channel: ${name}`);

    res.status(201).json({
      success: true,
      data: newChannel,
      message: 'Channel created successfully'
    });

  } catch (error) {
    console.error('❌ Create channel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create channel'
    });
  }
});

// ==================== MESSAGES ====================

// GET /api/realtime/messages - Get messages
router.get('/messages', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { channel, limit = 50, offset = 0 } = req.query;

    // Get messages from database
    const messagesResult = await db.getMessages({
      channel,
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: req.user?.id
    });

    if (messagesResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }

    const messagesData = messagesResult.data || [];

    console.log(`💬 Retrieved ${messagesData.length} messages`);

    res.json({
      success: true,
      data: messagesData,
      count: messagesData.length,
      message: 'Messages retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve messages'
    });
  }
});

// POST /api/realtime/messages - Send message
router.post('/messages', async (req, res) => {
  try {
    const { content, channel, type = 'message' } = req.body;

    if (!content || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Message content and channel are required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create message in database
    const newMessage = {
      id: uuidv4(),
      type,
      sender: req.user?.id || 'system',
      content,
      channel,
      timestamp: new Date(),
      metadata: {
        userId: req.user?.id,
        userName: req.user?.name || 'System'
      }
    };

    const result = await db.createMessage(newMessage);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send message'
      });
    }

    console.log(`💬 Sent message to channel: ${channel}`);

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// ==================== CONNECTIONS ====================

// GET /api/realtime/connections - Get active connections
router.get('/connections', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get connections from database
    const connectionsResult = await db.getConnections({
      userId: req.user?.id
    });

    if (connectionsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch connections'
      });
    }

    const connectionsData = connectionsResult.data || [];

    console.log(`🔗 Retrieved ${connectionsData.length} connections`);

    res.json({
      success: true,
      data: connectionsData,
      count: connectionsData.length,
      message: 'Connections retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve connections'
    });
  }
});

// POST /api/realtime/connections - Register connection
router.post('/connections', async (req, res) => {
  try {
    const { connectionId, userAgent, ip } = req.body;

    if (!connectionId) {
      return res.status(400).json({
        success: false,
        error: 'Connection ID is required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Register connection in database
    const connection = {
      id: connectionId,
      userId: req.user?.id,
      userAgent: userAgent || req.headers['user-agent'],
      ip: ip || req.ip,
      connectedAt: new Date(),
      status: 'active'
    };

    const result = await db.registerConnection(connection);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to register connection'
      });
    }

    console.log(`🔗 Registered connection: ${connectionId}`);

    res.status(201).json({
      success: true,
      data: connection,
      message: 'Connection registered successfully'
    });

  } catch (error) {
    console.error('❌ Register connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register connection'
    });
  }
});

// DELETE /api/realtime/connections/:id - Disconnect
router.delete('/connections/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Disconnect in database
    const result = await db.disconnect(id, {
      disconnectedBy: req.user?.id,
      disconnectedAt: new Date()
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to disconnect'
      });
    }

    console.log(`🔌 Disconnected: ${id}`);

    res.json({
      success: true,
      message: 'Disconnected successfully'
    });

  } catch (error) {
    console.error('❌ Disconnect error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect'
    });
  }
});

// ==================== NOTIFICATIONS ====================

// GET /api/realtime/notifications - Get notifications
router.get('/notifications', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    // Get notifications from database
    const notificationsResult = await db.getNotifications({
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true',
      userId: req.user?.id
    });

    if (notificationsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }

    const notificationsData = notificationsResult.data || [];

    console.log(`🔔 Retrieved ${notificationsData.length} notifications`);

    res.json({
      success: true,
      data: notificationsData,
      count: notificationsData.length,
      message: 'Notifications retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications'
    });
  }
});

// POST /api/realtime/notifications - Send notification
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type = 'info', recipients, channel } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Notification title and message are required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create notification in database
    const notification = {
      id: uuidv4(),
      title,
      message,
      type,
      recipients: recipients || [req.user?.id],
      channel: channel || 'system',
      sentBy: req.user?.id,
      sentAt: new Date(),
      isRead: false
    };

    const result = await db.createNotification(notification);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send notification'
      });
    }

    console.log(`🔔 Sent notification: ${title}`);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    console.error('❌ Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification'
    });
  }
});

// PATCH /api/realtime/notifications/:id/read - Mark as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Mark notification as read
    const result = await db.markNotificationRead(id, {
      readBy: req.user?.id,
      readAt: new Date()
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to mark notification as read'
      });
    }

    console.log(`✅ Marked notification as read: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

module.exports = router;
