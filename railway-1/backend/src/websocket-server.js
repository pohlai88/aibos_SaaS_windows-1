const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('./ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for WebSocket server');
} catch (error) {
  console.error('❌ Failed to initialize AI Database System:', error.message);
  aiDatabaseSystem = null;
}

// Database connection
let db;
try {
  const supabaseModule = require('./utils/supabase');
  db = supabaseModule.db;
} catch (error) {
  console.error('❌ Failed to initialize Supabase for WebSocket:', error.message);
  db = null;
}

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // clientId -> WebSocket
    this.userConnections = new Map(); // userId -> Set of clientIds
    this.channelSubscriptions = new Map(); // channelId -> Set of clientIds
    this.presenceUsers = new Map(); // userId -> presence data
    this.heartbeatIntervals = new Map(); // clientId -> interval

    this.setupWebSocketServer();
    console.log('🚀 WebSocket server initialized');
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      const userId = this.extractUserIdFromRequest(req);

      console.log(`🔗 New WebSocket connection: ${clientId} (User: ${userId})`);

      // Store client information
      this.clients.set(clientId, {
        ws,
        userId,
        clientId,
        connectedAt: new Date(),
        subscriptions: new Set(),
        lastHeartbeat: Date.now()
      });

      // Add to user connections
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId).add(clientId);

      // Update presence
      this.updateUserPresence(userId, 'online', 'Connected to WebSocket');

      // Setup heartbeat
      this.setupHeartbeat(clientId);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'welcome',
        clientId,
        userId,
        timestamp: Date.now(),
        message: 'Connected to AI-BOS real-time server'
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
          this.sendToClient(clientId, {
            type: 'error',
            message: 'Invalid message format',
            timestamp: Date.now()
          });
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });
    });
  }

  extractUserIdFromRequest(req) {
    // Extract user ID from request headers or query parameters
    // This is a simplified version - in production, you'd validate JWT tokens
    const url = new URL(req.url, 'http://localhost');
    const userId = url.searchParams.get('userId') || 'anonymous';
    return userId;
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) {
      console.error(`❌ Unknown client: ${clientId}`);
      return;
    }

    console.log(`📨 Message from ${clientId}:`, message.type);

    switch (message.type) {
      case 'ping':
        this.handlePing(clientId, message);
        break;

      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;

      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message);
        break;

      case 'message':
        this.handleChatMessage(clientId, message);
        break;

      case 'join_channel':
        this.handleJoinChannel(clientId, message);
        break;

      case 'leave_channel':
        this.handleLeaveChannel(clientId, message);
        break;

      case 'presence_update':
        this.handlePresenceUpdate(clientId, message);
        break;

      case 'typing_start':
        this.handleTypingStart(clientId, message);
        break;

      case 'typing_stop':
        this.handleTypingStop(clientId, message);
        break;

      default:
        console.log(`❓ Unknown message type: ${message.type}`);
        this.sendToClient(clientId, {
          type: 'error',
          message: `Unknown message type: ${message.type}`,
          timestamp: Date.now()
        });
    }
  }

  handlePing(clientId, message) {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastHeartbeat = Date.now();
    }

    this.sendToClient(clientId, {
      type: 'pong',
      timestamp: message.timestamp || Date.now(),
      serverTime: Date.now()
    });
  }

  handleSubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const channels = Array.isArray(message.channels) ? message.channels : [message.channels];

    channels.forEach(channelId => {
      if (!this.channelSubscriptions.has(channelId)) {
        this.channelSubscriptions.set(channelId, new Set());
      }
      this.channelSubscriptions.get(channelId).add(clientId);
      client.subscriptions.add(channelId);
    });

    console.log(`📡 Client ${clientId} subscribed to channels:`, channels);

    this.sendToClient(clientId, {
      type: 'subscribed',
      channels,
      timestamp: Date.now()
    });
  }

  handleUnsubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const channels = Array.isArray(message.channels) ? message.channels : [message.channels];

    channels.forEach(channelId => {
      if (this.channelSubscriptions.has(channelId)) {
        this.channelSubscriptions.get(channelId).delete(clientId);
      }
      client.subscriptions.delete(channelId);
    });

    console.log(`📡 Client ${clientId} unsubscribed from channels:`, channels);

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      channels,
      timestamp: Date.now()
    });
  }

  handleChatMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { content, channel, metadata = {} } = message;

    if (!content || !channel) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Message content and channel are required',
        timestamp: Date.now()
      });
      return;
    }

    // Create message object
    const chatMessage = {
      id: uuidv4(),
      type: 'message',
      sender: client.userId,
      content,
      channel,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        clientId,
        userName: metadata.userName || client.userId
      }
    };

    // Store message in database
    if (db) {
      db.createMessage(chatMessage).catch(error => {
        console.error('❌ Failed to store message in database:', error);
      });
    }

    // Broadcast to channel subscribers
    this.broadcastToChannel(channel, {
      type: 'message',
      ...chatMessage
    });

    console.log(`💬 Message sent to channel ${channel}:`, content.substring(0, 50));
  }

  handleJoinChannel(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = message;

    if (!channel) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Channel is required',
        timestamp: Date.now()
      });
      return;
    }

    // Subscribe to channel
    this.handleSubscribe(clientId, { type: 'subscribe', channels: [channel] });

    // Notify channel members
    this.broadcastToChannel(channel, {
      type: 'user_joined',
      userId: client.userId,
      channel,
      timestamp: Date.now()
    });

    console.log(`👋 User ${client.userId} joined channel ${channel}`);
  }

  handleLeaveChannel(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = message;

    if (!channel) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Channel is required',
        timestamp: Date.now()
      });
      return;
    }

    // Unsubscribe from channel
    this.handleUnsubscribe(clientId, { type: 'unsubscribe', channels: [channel] });

    // Notify channel members
    this.broadcastToChannel(channel, {
      type: 'user_left',
      userId: client.userId,
      channel,
      timestamp: Date.now()
    });

    console.log(`👋 User ${client.userId} left channel ${channel}`);
  }

  handlePresenceUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { status, activity } = message;

    if (!status) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Status is required',
        timestamp: Date.now()
      });
      return;
    }

    this.updateUserPresence(client.userId, status, activity);
  }

  handleTypingStart(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = message;

    if (!channel) return;

    this.broadcastToChannel(channel, {
      type: 'typing_start',
      userId: client.userId,
      channel,
      timestamp: Date.now()
    });
  }

  handleTypingStop(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = message;

    if (!channel) return;

    this.broadcastToChannel(channel, {
      type: 'typing_stop',
      userId: client.userId,
      channel,
      timestamp: Date.now()
    });
  }

  updateUserPresence(userId, status, activity) {
    const presenceData = {
      id: userId,
      status,
      activity: activity || 'No activity',
      lastSeen: new Date()
    };

    this.presenceUsers.set(userId, presenceData);

    // Update in database
    if (db) {
      db.updatePresence(presenceData).catch(error => {
        console.error('❌ Failed to update presence in database:', error);
      });
    }

    // Broadcast presence update
    this.broadcastToAll({
      type: 'presence_update',
      user: presenceData,
      timestamp: Date.now()
    });

    console.log(`👤 User ${userId} presence updated: ${status}`);
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`🔌 Client disconnected: ${clientId} (User: ${client.userId})`);

    // Remove from user connections
    if (this.userConnections.has(client.userId)) {
      this.userConnections.get(client.userId).delete(clientId);
      if (this.userConnections.get(client.userId).size === 0) {
        this.userConnections.delete(client.userId);
        // Update presence to offline
        this.updateUserPresence(client.userId, 'offline', 'Disconnected');
      }
    }

    // Remove from channel subscriptions
    client.subscriptions.forEach(channelId => {
      if (this.channelSubscriptions.has(channelId)) {
        this.channelSubscriptions.get(channelId).delete(clientId);
      }
    });

    // Clear heartbeat interval
    if (this.heartbeatIntervals.has(clientId)) {
      clearInterval(this.heartbeatIntervals.get(clientId));
      this.heartbeatIntervals.delete(clientId);
    }

    // Remove client
    this.clients.delete(clientId);

    // Notify channels about user leaving
    client.subscriptions.forEach(channelId => {
      this.broadcastToChannel(channelId, {
        type: 'user_left',
        userId: client.userId,
        channel: channelId,
        timestamp: Date.now()
      });
    });
  }

  setupHeartbeat(clientId) {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      // Check if client is still responsive
      const timeSinceLastHeartbeat = Date.now() - client.lastHeartbeat;
      if (timeSinceLastHeartbeat > 60000) { // 60 seconds
        console.log(`💀 Client ${clientId} heartbeat timeout`);
        client.ws.terminate();
        return;
      }

      // Send heartbeat
      this.sendToClient(clientId, {
        type: 'heartbeat',
        timestamp: Date.now()
      });
    }, 30000); // 30 seconds

    this.heartbeatIntervals.set(clientId, interval);
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`❌ Failed to send message to client ${clientId}:`, error);
      return false;
    }
  }

  broadcastToChannel(channelId, message) {
    if (!this.channelSubscriptions.has(channelId)) {
      return;
    }

    const subscribers = this.channelSubscriptions.get(channelId);
    let sentCount = 0;

    subscribers.forEach(clientId => {
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    });

    console.log(`📢 Broadcasted to channel ${channelId}: ${sentCount}/${subscribers.size} clients`);
  }

  broadcastToAll(message) {
    let sentCount = 0;
    const totalClients = this.clients.size;

    this.clients.forEach((client, clientId) => {
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    });

    console.log(`📢 Broadcasted to all: ${sentCount}/${totalClients} clients`);
  }

  broadcastToUser(userId, message) {
    if (!this.userConnections.has(userId)) {
      return;
    }

    const userClients = this.userConnections.get(userId);
    let sentCount = 0;

    userClients.forEach(clientId => {
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    });

    console.log(`📢 Broadcasted to user ${userId}: ${sentCount}/${userClients.size} clients`);
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      totalUsers: this.userConnections.size,
      totalChannels: this.channelSubscriptions.size,
      totalPresenceUsers: this.presenceUsers.size,
      uptime: Date.now() - this.startTime
    };
  }

  // Public methods for external use
  sendNotification(userId, notification) {
    this.broadcastToUser(userId, {
      type: 'notification',
      ...notification,
      timestamp: Date.now()
    });
  }

  sendSystemMessage(channelId, message) {
    this.broadcastToChannel(channelId, {
      type: 'system_message',
      content: message,
      timestamp: Date.now()
    });
  }

  updateChannel(channelId, channelData) {
    this.broadcastToChannel(channelId, {
      type: 'channel_update',
      channel: channelData,
      timestamp: Date.now()
    });
  }
}

module.exports = WebSocketServer;
