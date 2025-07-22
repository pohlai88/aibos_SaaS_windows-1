const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (replace with Supabase in production)
let events = [];
let eventSubscriptions = [];

// GET /api/events - List events
router.get('/', (req, res) => {
  try {
    const { tenant_id, app_id, event_name } = req.query;
    let filteredEvents = events;
    
    if (tenant_id) {
      filteredEvents = filteredEvents.filter(e => e.tenant_id === tenant_id);
    }
    if (app_id) {
      filteredEvents = filteredEvents.filter(e => e.app_id === app_id);
    }
    if (event_name) {
      filteredEvents = filteredEvents.filter(e => e.event_name === event_name);
    }
    
    res.json({
      success: true,
      data: filteredEvents,
      count: filteredEvents.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/events/emit - Emit platform event
router.post('/emit', (req, res) => {
  try {
    const { tenant_id, app_id, event_name, payload } = req.body;
    
    if (!tenant_id || !app_id || !event_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'tenant_id, app_id, and event_name are required' 
      });
    }

    const event = {
      event_id: uuidv4(),
      tenant_id,
      app_id,
      event_name,
      payload: payload || {},
      processed_at: null,
      created_at: new Date().toISOString()
    };

    events.push(event);
    
    // Process event subscriptions
    const subscriptions = eventSubscriptions.filter(sub => 
      sub.tenant_id === tenant_id && 
      sub.event_name === event_name && 
      sub.is_active
    );

    // In a real implementation, this would trigger webhooks or message queues
    console.log(`📡 Event emitted: ${event_name}`, {
      event_id: event.event_id,
      subscriptions: subscriptions.length,
      payload
    });

    // Mark as processed
    event.processed_at = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      data: event,
      subscriptions_triggered: subscriptions.length,
      message: 'Event emitted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/events/subscribe - Subscribe to events
router.post('/subscribe', (req, res) => {
  try {
    const { tenant_id, app_id, event_name, handler_url } = req.body;
    
    if (!tenant_id || !app_id || !event_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'tenant_id, app_id, and event_name are required' 
      });
    }

    // Check if subscription already exists
    const existingSubscription = eventSubscriptions.find(sub => 
      sub.tenant_id === tenant_id && 
      sub.app_id === app_id && 
      sub.event_name === event_name
    );

    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        error: 'Subscription already exists' 
      });
    }

    const subscription = {
      subscription_id: uuidv4(),
      tenant_id,
      app_id,
      event_name,
      handler_url: handler_url || null,
      is_active: true,
      created_at: new Date().toISOString()
    };

    eventSubscriptions.push(subscription);
    
    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Event subscription created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/subscriptions - List subscriptions
router.get('/subscriptions', (req, res) => {
  try {
    const { tenant_id, app_id, event_name } = req.query;
    let filteredSubscriptions = eventSubscriptions;
    
    if (tenant_id) {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.tenant_id === tenant_id);
    }
    if (app_id) {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.app_id === app_id);
    }
    if (event_name) {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.event_name === event_name);
    }
    
    res.json({
      success: true,
      data: filteredSubscriptions,
      count: filteredSubscriptions.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/events/subscriptions/:id - Unsubscribe from events
router.delete('/subscriptions/:id', (req, res) => {
  try {
    const subscriptionIndex = eventSubscriptions.findIndex(s => s.subscription_id === req.params.id);
    if (subscriptionIndex === -1) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    eventSubscriptions.splice(subscriptionIndex, 1);
    
    res.json({
      success: true,
      message: 'Event subscription removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/events/subscriptions/:id/toggle - Toggle subscription
router.post('/subscriptions/:id/toggle', (req, res) => {
  try {
    const subscription = eventSubscriptions.find(s => s.subscription_id === req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    subscription.is_active = !subscription.is_active;
    subscription.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: subscription,
      message: `Subscription ${subscription.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 