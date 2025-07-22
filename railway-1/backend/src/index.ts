// Minimal working version for Railway deployment
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';

// Import AI-BOS Database API
import databaseRouter from './api/database';

// Import auth routes
const authRouter = require('./routes/auth');

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

// Mount auth routes
app.use('/api/auth', authRouter);

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
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 AI-BOS Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🔌 WebSocket service: ${realtimeService ? 'Initialized' : 'Not available'}`);
});
