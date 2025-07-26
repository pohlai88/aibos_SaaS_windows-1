// Load environment variables
import 'dotenv/config';

// Import environment utilities
import { env, getCorsOrigins } from './utils/env';

// Minimal working version for Railway deployment
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';

// Import AI-BOS Database API
import databaseRouter from './api/database';

// Import Manifestor Engine
import { Manifestor } from './lib/manifestor';
import { loadManifests } from './lib/manifestor/loader';

// Import auth routes
import authRouter from './routes/auth.js';

// Import entities routes
import entitiesRouter from './routes/entities.js';

// Import dashboard routes
import dashboardRouter from './routes/dashboard.js';

// Import modules routes
import modulesRouter from './routes/modules.js';

// Import consciousness routes
import consciousnessRouter from './routes/consciousness';

// Import security routes
import securityRouter from './routes/security.js';

// Import billing routes
import billingRouter from './routes/billing.js';

// Import analytics routes
import analyticsRouter from './routes/analytics.js';

// Import scalability routes
import scalabilityRouter from './routes/scalability.js';

// Import workflow automation routes
import workflowAutomationRouter from './routes/workflow-automation.js';

// Import user management routes
import usersRouter from './routes/users.js';
import invitationsRouter from './routes/invitations.js';

// Import collaboration routes
import collaborationRouter from './routes/collaboration.js';

// Import AI optimization routes
import aiOptimizationRouter from './routes/ai-optimization.js';

// Import AI insights routes
import aiInsightsRouter from './routes/ai-insights.js';

// Import workspaces routes
import workspacesRouter from './routes/workspaces.js';

// Import system routes
import systemRouter from './routes/system.js';

// Import monitoring routes
import monitoringRouter from './routes/monitoring.js';

// Import team management routes
import teamsRouter from './routes/teams.js';

// Import realtime routes
import realtimeRouter from './routes/realtime.js';

// Import advanced security routes
import advancedSecurityRouter from './routes/security-advanced.js';

// Import advanced collaboration routes
import advancedCollaborationRouter from './routes/advanced-collaboration.js';

// Import custom AI model training routes
import customAIModelTrainingRouter from './routes/custom-ai-model-training.js';

// Import blockchain integration routes
import blockchainIntegrationRouter from './routes/blockchain-integration.js';

// Import IoT device management routes
import iotDeviceManagementRouter from './routes/iot-device-management.js';

// Import advanced voice speech routes
import advancedVoiceSpeechRouter from './routes/advanced-voice-speech.js';

// Import AR/VR integration routes
import arVrIntegrationRouter from './routes/ar-vr-integration.js';

// Import edge computing integration routes
import edgeComputingIntegrationRouter from './routes/edge-computing-integration.js';

// Import 5G network integration routes
import network5GIntegrationRouter from './routes/5g-network-integration.js';

// Import digital twin integration routes
import digitalTwinIntegrationRouter from './routes/digital-twin-integration.js';

// Import federated learning integration routes
import federatedLearningIntegrationRouter from './routes/federated-learning-integration.js';

// Import quantum computing integration routes
import quantumComputingIntegrationRouter from './routes/quantum-computing-integration.js';

// Import advanced cybersecurity integration routes
import advancedCybersecurityIntegrationRouter from './routes/advanced-cybersecurity-integration.js';

// Import Ollama routes
import ollamaRouter from './routes/ollama.js';

// Import manifests routes
import manifestsRouter from './routes/manifests.js';

// Import WebSocket realtime service
import WebSocketServer from './websocket-server.js';

const app = express();
const server = http.createServer(app);
const PORT = env.PORT;

// Initialize WebSocket server
let wsServer: any;
try {
  wsServer = new WebSocketServer(server);
  console.log('✅ WebSocket server initialized');
} catch (error) {
  console.error('❌ Failed to initialize WebSocket server:', error instanceof Error ? error.message : 'Unknown error');
  wsServer = null;
}

// Initialize WebSocket service
// realtimeService.initialize(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: getCorsOrigins(),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply Manifestor middleware
app.use(Manifestor.middleware());

// Mount AI-BOS Database API
app.use('/api/database', databaseRouter);

// Mount Manifestor API routes
app.use('/api/manifestor', Manifestor.getRoutes());
app.use('/api/manifests', manifestsRouter);

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

// Mount security routes
app.use('/api/security', securityRouter);

// Mount billing routes
app.use('/api/billing', billingRouter);

// Mount analytics routes
app.use('/api/analytics', analyticsRouter);

// Mount user management routes
app.use('/api/users', usersRouter);
app.use('/api/invitations', invitationsRouter);

// Mount collaboration routes
app.use('/api/collaboration', collaborationRouter);

// Mount AI optimization routes
app.use('/api/ai-optimization', aiOptimizationRouter);

// Mount AI insights routes
app.use('/api/ai-insights', aiInsightsRouter);

// Mount workspaces routes
app.use('/api/workspaces', workspacesRouter);

// Mount system routes
app.use('/api/system', systemRouter);

// Mount monitoring routes
app.use('/api/monitoring', monitoringRouter);

// Mount team management routes
app.use('/api/teams', teamsRouter);

// Mount realtime routes
app.use('/api/realtime', realtimeRouter);

// Mount analytics routes
app.use('/api/analytics', analyticsRouter);

// Mount scalability routes
app.use('/api/scalability', scalabilityRouter);

// Mount workflow automation routes
app.use('/api/workflow-automation', workflowAutomationRouter);

// Mount advanced security routes
app.use('/api/security-advanced', advancedSecurityRouter);

// Mount advanced collaboration routes
app.use('/api/advanced-collaboration', advancedCollaborationRouter);

// Mount custom AI model training routes
app.use('/api/custom-ai-model-training', customAIModelTrainingRouter);

// Mount blockchain integration routes
app.use('/api/blockchain-integration', blockchainIntegrationRouter);

// Mount IoT device management routes
app.use('/api/iot-device-management', iotDeviceManagementRouter);

// Mount advanced voice speech routes
app.use('/api/advanced-voice-speech', advancedVoiceSpeechRouter);

// Mount AR/VR integration routes
app.use('/api/ar-vr-integration', arVrIntegrationRouter);

// Mount edge computing integration routes
app.use('/api/edge-computing-integration', edgeComputingIntegrationRouter);

// Mount 5G network integration routes
app.use('/api/5g-network-integration', network5GIntegrationRouter);

// Mount digital twin integration routes
app.use('/api/digital-twin-integration', digitalTwinIntegrationRouter);

// Mount federated learning integration routes
app.use('/api/federated-learning-integration', federatedLearningIntegrationRouter);

// Mount quantum computing integration routes
app.use('/api/quantum-computing-integration', quantumComputingIntegrationRouter);

// Mount advanced cybersecurity integration routes
app.use('/api/advanced-cybersecurity-integration', advancedCybersecurityIntegrationRouter);

// Mount Ollama routes
app.use('/api/ollama', ollamaRouter);

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
      security: '/api/security',
      billing: '/api/billing',
      analytics: '/api/analytics',
      scalability: '/api/scalability',
      workflowAutomation: '/api/workflow-automation',
      users: '/api/users',
      invitations: '/api/invitations',
      collaboration: '/api/collaboration',
      aiOptimization: '/api/ai-optimization',
      aiInsights: '/api/ai-insights',
      workspaces: '/api/workspaces',
      system: '/api/system',
      monitoring: '/api/monitoring',
      teams: '/api/teams',
      realtime: '/api/realtime',
      securityAdvanced: '/api/security-advanced',
      advancedCollaboration: '/api/advanced-collaboration',
      customAIModelTraining: '/api/custom-ai-model-training',
      blockchainIntegration: '/api/blockchain-integration',
      iotDeviceManagement: '/api/iot-device-management',
      advancedVoiceSpeech: '/api/advanced-voice-speech',
      arVrIntegration: '/api/ar-vr-integration',
      edgeComputingIntegration: '/api/edge-computing-integration',
      network5GIntegration: '/api/5g-network-integration',
      ollama: '/api/ollama',
      websocket: wsServer ? 'ws://localhost:3001' : '/api'
    },
    documentation: 'API documentation available at /api/health'
  });
});

// Health check endpoint (root level)
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test consciousness database if available
    let databaseStatus = 'unknown';
    let consciousnessStatus = 'unknown';

    try {
      const { consciousnessDatabase } = await import('./consciousness/ConsciousnessDatabase.js');
      // Use a simple query to test database connectivity
      const stats = await consciousnessDatabase.getConsciousnessStats();
      databaseStatus = 'connected';
    } catch (dbError) {
      databaseStatus = 'disconnected';
      console.error('Database health check failed:', (dbError as Error).message);
    }

    // Test consciousness engine if available
    try {
      const { consciousnessEngine } = await import('./consciousness/ConsciousnessEngine.js');
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
      environment: env.NODE_ENV,
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
server.listen(PORT, async () => {
  console.log(`🚀 AI-BOS Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🔌 WebSocket service: ${wsServer ? 'Initialized' : 'Not available'}`);
  console.log(`📊 Dashboard API: /api/dashboard`);
  console.log(`📦 Modules API: /api/modules`);

  // Load manifests
  try {
    await loadManifests();
    console.log(`🧠 Manifestor Engine: Initialized`);
    console.log(`📋 Manifestor API: /api/manifestor`);
  } catch (error) {
    console.error('Failed to load manifests:', error);
  }
});
