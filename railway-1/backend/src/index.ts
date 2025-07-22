// Minimal working version for Railway deployment
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';

// Import AI-BOS Database API
import databaseRouter from './api/database';

// Import WebSocket realtime service
const realtimeService = require('./services/realtime');

const app = express();
const server = http.createServer(app);
const PORT = process.env['PORT'] || 3001;

// Initialize WebSocket service
realtimeService.initialize(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount AI-BOS Database API
app.use('/api/database', databaseRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI-BOS Backend',
    version: '1.0.0',
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// Basic API Routes (without complex dependencies)
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    message: 'AI-BOS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// WebSocket endpoint info
app.get('/api/websocket-info', (req: Request, res: Response) => {
  res.json({
    websocketUrl: `wss://${req.get('host')}/api`,
    status: 'available',
    timestamp: new Date().toISOString()
  });
});

// Simple auth endpoint for testing
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Demo credentials for testing
  const demoUsers = [
    { email: 'demo@aibos.com', password: 'demo123', role: 'admin' },
    { email: 'user@aibos.com', password: 'user123', role: 'user' },
    { email: 'admin@aibos.com', password: 'admin123', role: 'admin' }
  ];

  const user = demoUsers.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        token: 'demo-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
server.listen(PORT, () => {
  console.log('🚀 AI-BOS Backend starting...');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/api`);
  console.log(`🔗 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log('✅ Ready to accept requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  realtimeService.cleanup();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
