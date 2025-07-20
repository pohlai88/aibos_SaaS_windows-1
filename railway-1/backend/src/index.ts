// Validate environment variables first
import './validate-env';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AI-BOS Backend',
    version: '1.0.0'
  });
});

// Initialize realtime service
import realtimeService from './services/realtime';
realtimeService.initialize(server);

// API Routes
app.use('/api/manifests', require('./routes/manifests'));
app.use('/api/apps', require('./routes/apps'));
app.use('/api/events', require('./routes/events'));
app.use('/api/entities', require('./routes/entities'));
app.use('/api/auth', require('./routes/auth-enhanced')); // Enhanced with shared library
app.use('/api/realtime', require('./routes/realtime'));

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