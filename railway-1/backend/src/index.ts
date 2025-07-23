// Load environment variables
import 'dotenv/config';

// Minimal working version for Railway deployment
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';

// Import AI-BOS Database API
import databaseRouter from './api/database';

// Import auth routes
const authRouter = require('./routes/auth');

// Import entities routes
const entitiesRouter = require('./routes/entities');

// Import dashboard routes
const dashboardRouter = require('./routes/dashboard');

// Import modules routes
const modulesRouter = require('./routes/modules');

// Import consciousness routes
import consciousnessRouter from './routes/consciousness';

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

// Mount entities routes
app.use('/api/entities', entitiesRouter);

// Mount dashboard routes
app.use('/api/dashboard', dashboardRouter);

// Mount modules routes
app.use('/api/modules', modulesRouter);

// Mount consciousness routes
app.use('/api/consciousness', consciousnessRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AI-BOS Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      auth: '/api/auth',
      database: '/api/database',
      entities: '/api/entities',
      dashboard: '/api/dashboard',
      modules: '/api/modules',
      consciousness: '/api/consciousness',
      websocket: '/api'
    },
    documentation: 'API documentation available at /api/health'
  });
});

// Health check endpoint (root level)
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection if consciousness database is available
    let databaseStatus = 'unknown';
    let consciousnessStatus = 'unknown';

    try {
      const { consciousnessDatabase } = require('./consciousness/ConsciousnessDatabase');
      const testClient = await consciousnessDatabase.pool.connect();
      await testClient.query('SELECT NOW()');
      testClient.release();
      databaseStatus = 'connected';
    } catch (dbError) {
      databaseStatus = 'disconnected';
      console.error('Database health check failed:', (dbError as Error).message);
    }

    // Test consciousness engine if available
    try {
      const { consciousnessEngine } = require('./consciousness/ConsciousnessEngine');
      const health = await consciousnessEngine.healthCheck();
      consciousnessStatus = health.status;
    } catch (ceError) {
      consciousnessStatus = 'unavailable';
      console.error('Consciousness engine health check failed:', (ceError as Error).message);
    }

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'AI-BOS Backend',
      version: '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      database: {
        status: databaseStatus,
        url: process.env['DATABASE_URL'] ? 'configured' : 'missing'
      },
      consciousness: {
        status: consciousnessStatus
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
      } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        service: 'AI-BOS Backend',
        error: (error as Error).message
      });
    }
});

// Favicon endpoint
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end(); // No content - prevents 404 errors
});

// API Health check endpoint (standard REST API)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI-BOS Backend API',
    version: '1.0.0',
    environment: process.env['NODE_ENV'] || 'development',
    endpoints: {
      auth: '/api/auth',
      database: '/api/database',
      dashboard: '/api/dashboard',
      modules: '/api/modules',
      consciousness: '/api/consciousness',
      websocket: '/api'
    }
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
  console.log(`📊 Dashboard API: /api/dashboard`);
  console.log(`📦 Modules API: /api/modules`);
});
