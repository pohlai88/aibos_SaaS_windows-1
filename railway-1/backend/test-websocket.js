const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection...');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected successfully');
  ws.send(JSON.stringify({ type: 'test', message: 'Hello' }));
});

ws.on('message', (data) => {
  console.log('📨 Received:', JSON.parse(data));
  ws.close();
});

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏰ Test timeout');
  process.exit(1);
}, 5000);
