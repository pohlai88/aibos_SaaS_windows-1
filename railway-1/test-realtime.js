const WebSocket = require('ws');

// Test configuration
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';
const TENANT_ID = 'test-tenant-123';
const USER_ID = 'test-user-456';

console.log('🧪 Testing AI-BOS Realtime Functionality');
console.log(`🔌 Connecting to: ${WS_URL}`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket connected');
  
  // Authenticate
  ws.send(JSON.stringify({
    type: 'authenticate',
    tenantId: TENANT_ID,
    userId: USER_ID
  }));
  
  // Subscribe to test channel
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'test',
      event: 'message'
    }));
  }, 1000);
  
  // Send test message
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'publish',
      channel: 'test',
      event: 'message',
      payload: {
        message: 'Hello from test script!',
        timestamp: new Date().toISOString()
      }
    }));
  }, 2000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📨 Received:', message);
    
    // Test completed
    if (message.type === 'event' && message.channel === 'test') {
      console.log('✅ Realtime test completed successfully!');
      ws.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - realtime may not be working');
  ws.close();
  process.exit(1);
}, 10000); 