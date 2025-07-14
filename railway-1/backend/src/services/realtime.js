const WebSocket = require('ws');
const { supabase } = require('../utils/supabase');

class RealtimeService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of client connections
    this.tenantChannels = new Map(); // Map of tenant-specific channels
    this.supabaseSubscriptions = new Map(); // Map of Supabase realtime subscriptions
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('🔌 Realtime service initialized');
    this.setupSupabaseRealtime();
  }

  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    const client = {
      id: clientId,
      ws,
      tenantId: null,
      userId: null,
      subscriptions: new Set(),
      connectedAt: new Date()
    };

    this.clients.set(clientId, client);

    console.log(`🔗 Client connected: ${clientId}`);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        this.handleMessage(clientId, data);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.sendError(clientId, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    });
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'authenticate':
        this.handleAuthentication(clientId, data);
        break;
      case 'subscribe':
        this.handleSubscription(clientId, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, data);
        break;
      case 'publish':
        this.handlePublish(clientId, data);
        break;
      default:
        this.sendError(clientId, `Unknown message type: ${data.type}`);
    }
  }

  handleAuthentication(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { tenantId, userId, token } = data;

    // In a real implementation, you'd verify the JWT token here
    // For now, we'll accept the provided tenantId and userId
    client.tenantId = tenantId;
    client.userId = userId;

    // Add client to tenant channel
    if (!this.tenantChannels.has(tenantId)) {
      this.tenantChannels.set(tenantId, new Set());
    }
    this.tenantChannels.get(tenantId).add(clientId);

    console.log(`🔐 Client ${clientId} authenticated for tenant ${tenantId}`);

    this.sendToClient(clientId, {
      type: 'authenticated',
      tenantId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  handleSubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.tenantId) {
      this.sendError(clientId, 'Authentication required');
      return;
    }

    const { channel, event } = data;
    const subscriptionKey = `${channel}:${event}`;
    
    client.subscriptions.add(subscriptionKey);
    
    console.log(`📡 Client ${clientId} subscribed to ${subscriptionKey}`);

    this.sendToClient(clientId, {
      type: 'subscribed',
      channel,
      event,
      timestamp: new Date().toISOString()
    });
  }

  handleUnsubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel, event } = data;
    const subscriptionKey = `${channel}:${event}`;
    
    client.subscriptions.delete(subscriptionKey);
    
    console.log(`📡 Client ${clientId} unsubscribed from ${subscriptionKey}`);

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      channel,
      event,
      timestamp: new Date().toISOString()
    });
  }

  handlePublish(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.tenantId) {
      this.sendError(clientId, 'Authentication required');
      return;
    }

    const { channel, event, payload } = data;
    
    // Publish to all clients in the same tenant subscribed to this channel/event
    this.publishToTenant(client.tenantId, {
      type: 'event',
      channel,
      event,
      payload,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from tenant channel
    if (client.tenantId && this.tenantChannels.has(client.tenantId)) {
      this.tenantChannels.get(client.tenantId).delete(clientId);
    }

    this.clients.delete(clientId);
    console.log(`🔌 Client disconnected: ${clientId}`);
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
    }
  }

  sendError(clientId, error) {
    this.sendToClient(clientId, {
      type: 'error',
      error,
      timestamp: new Date().toISOString()
    });
  }

  publishToTenant(tenantId, message) {
    const tenantClients = this.tenantChannels.get(tenantId);
    if (!tenantClients) return;

    tenantClients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.subscriptions.has(`${message.channel}:${message.event}`)) {
        this.sendToClient(clientId, message);
      }
    });
  }

  // Supabase Realtime Integration
  setupSupabaseRealtime() {
    // Subscribe to database changes
    this.subscribeToTableChanges('events');
    this.subscribeToTableChanges('apps');
    this.subscribeToTableChanges('entities');
    this.subscribeToTableChanges('audit_logs');
  }

  subscribeToTableChanges(tableName) {
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        }, 
        (payload) => {
          this.handleSupabaseChange(tableName, payload);
        }
      )
      .subscribe();

    this.supabaseSubscriptions.set(tableName, subscription);
    console.log(`📡 Subscribed to Supabase realtime changes for table: ${tableName}`);
  }

  handleSupabaseChange(tableName, payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Extract tenant_id from the record
    const tenantId = newRecord?.tenant_id || oldRecord?.tenant_id;
    if (!tenantId) return;

    // Create a standardized event message
    const eventMessage = {
      type: 'database_change',
      table: tableName,
      event: eventType,
      data: {
        new: newRecord,
        old: oldRecord
      },
      timestamp: new Date().toISOString()
    };

    // Publish to all clients in the affected tenant
    this.publishToTenant(tenantId, eventMessage);
    
    console.log(`📊 Database change: ${eventType} on ${tableName} for tenant ${tenantId}`);
  }

  // Broadcast to all clients in a tenant
  broadcastToTenant(tenantId, message) {
    this.publishToTenant(tenantId, message);
  }

  // Broadcast to all clients
  broadcastToAll(message) {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  // Get client statistics
  getStats() {
    const stats = {
      totalClients: this.clients.size,
      tenants: this.tenantChannels.size,
      tenantStats: {}
    };

    this.tenantChannels.forEach((clients, tenantId) => {
      stats.tenantStats[tenantId] = clients.size;
    });

    return stats;
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  cleanup() {
    // Close all Supabase subscriptions
    this.supabaseSubscriptions.forEach((subscription, tableName) => {
      supabase.removeChannel(subscription);
      console.log(`📡 Unsubscribed from Supabase table: ${tableName}`);
    });

    // Close all WebSocket connections
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });

    this.clients.clear();
    this.tenantChannels.clear();
    this.supabaseSubscriptions.clear();
  }
}

module.exports = new RealtimeService(); 