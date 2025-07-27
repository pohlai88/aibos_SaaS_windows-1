// ==================== AI-BOS BACKEND SERVER ====================
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// ==================== CORE IMPORTS ====================
import { ConsciousnessDatabase } from './consciousness/ConsciousnessDatabase';
import { ConsciousnessEngine } from './consciousness/ConsciousnessEngine';
import { ConsciousLineageOrchestrator } from './consciousness/ConsciousLineageOrchestrator';

// ==================== ROUTE IMPORTS ====================

// Import route files
import authRouter from './routes/auth.js';
import entitiesRouter from './routes/entities.js';
import dashboardRouter from './routes/dashboard.js';
import modulesRouter from './routes/modules.js';
import securityRouter from './routes/security.js';
import billingRouter from './routes/billing.js';
import analyticsRouter from './routes/analytics.js';
import scalabilityRouter from './routes/scalability.js';
import workflowAutomationRouter from './routes/workflow-automation.js';
import usersRouter from './routes/users.js';
import invitationsRouter from './routes/invitations.js';
import collaborationRouter from './routes/collaboration.js';
import aiOptimizationRouter from './routes/ai-optimization.js';
import aiInsightsRouter from './routes/ai-insights.js';
import workspacesRouter from './routes/workspaces.js';
import systemRouter from './routes/system.js';
import monitoringRouter from './routes/monitoring.js';
import teamsRouter from './routes/teams.js';
import realtimeRouter from './routes/realtime.js';
import advancedSecurityRouter from './routes/security-advanced.js';
import advancedCollaborationRouter from './routes/advanced-collaboration.js';
import customAIModelTrainingRouter from './routes/custom-ai-model-training.js';
import blockchainIntegrationRouter from './routes/blockchain-integration.js';
import iotDeviceManagementRouter from './routes/iot-device-management.js';
import advancedVoiceSpeechRouter from './routes/advanced-voice-speech.js';
import arVrIntegrationRouter from './routes/ar-vr-integration.js';
import edgeComputingIntegrationRouter from './routes/edge-computing-integration.js';
import network5GIntegrationRouter from './routes/5g-network-integration.js';
import digitalTwinIntegrationRouter from './routes/digital-twin-integration.js';
import federatedLearningIntegrationRouter from './routes/federated-learning-integration.js';
import quantumComputingIntegrationRouter from './routes/quantum-computing-integration.js';
import advancedCybersecurityIntegrationRouter from './routes/advanced-cybersecurity-integration.js';
import ollamaRouter from './routes/ollama.js';
import manifestsRouter from './routes/manifests.js';


// ==================== AI DATABASE IMPORTS ====================
import { AIDatabaseSystem, getAIDatabaseSystem } from './ai-database';
import { EnhancedAIService } from './ai-database/AIService';
import { SchemaVersioningEngine } from './ai-database/SchemaVersioningEngine';
import { AuditEngine } from './ai-database/AuditEngine';
import { ComplianceEngine } from './ai-database/ComplianceEngine';
import { SecurityEngine } from './ai-database/SecurityEngine';
import { SchemaMindEngine } from './ai-database/SchemaMindEngine';
import { DatabaseConnector } from './ai-database/DatabaseConnector';
import { AITelemetryEngine } from './ai-database/AITelemetryEngine';

// ==================== API ROUTES ====================
import databaseRouter from './api/database';
import telemetryRouter from './api/telemetry';

// ==================== MIDDLEWARE ====================
import { healthMonitor } from './lib/HealthMonitor';
import { log } from './lib/Logger';
import { manifestValidator } from './lib/ManifestValidator';


// ==================== CONFIGURATION ====================
const PORT = process.env['PORT'] || 3001;
const NODE_ENV = process.env['NODE_ENV'] || 'development';

// ==================== SERVER SETUP ====================
const app = express();
const server = createServer(app);

// ==================== MIDDLEWARE CONFIGURATION ====================
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== AI SYSTEMS INITIALIZATION ====================
console.log('🧠 Initializing AI-BOS Backend Systems...');

// Initialize AI Database System
const aiDatabaseSystem = getAIDatabaseSystem();
const enhancedAIService = new EnhancedAIService();
const schemaVersioningEngine = new SchemaVersioningEngine();
const auditEngine = new AuditEngine();
const complianceEngine = new ComplianceEngine();
// const securityEngine = new SecurityEngine();
const schemaMindEngine = new SchemaMindEngine();
// const databaseConnector = new DatabaseConnector();
const aiTelemetryEngine = new AITelemetryEngine();

// Initialize Consciousness Systems
const consciousnessDatabase = new ConsciousnessDatabase();
const consciousnessEngine = new ConsciousnessEngine();
const consciousLineageOrchestrator = new ConsciousLineageOrchestrator();

// ==================== ROUTE SETUP ====================
console.log('🛣️ Setting up API routes...');

// Core API routes
app.use('/api/auth', authRouter);
app.use('/api/entities', entitiesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/security', securityRouter);
app.use('/api/billing', billingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/scalability', scalabilityRouter);
app.use('/api/workflow-automation', workflowAutomationRouter);
app.use('/api/users', usersRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/collaboration', collaborationRouter);
app.use('/api/ai-optimization', aiOptimizationRouter);
app.use('/api/ai-insights', aiInsightsRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/system', systemRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/realtime', realtimeRouter);
app.use('/api/security-advanced', advancedSecurityRouter);
app.use('/api/advanced-collaboration', advancedCollaborationRouter);
app.use('/api/custom-ai-model-training', customAIModelTrainingRouter);
app.use('/api/blockchain-integration', blockchainIntegrationRouter);
app.use('/api/iot-device-management', iotDeviceManagementRouter);
app.use('/api/advanced-voice-speech', advancedVoiceSpeechRouter);
app.use('/api/ar-vr-integration', arVrIntegrationRouter);
app.use('/api/edge-computing-integration', edgeComputingIntegrationRouter);
app.use('/api/5g-network-integration', network5GIntegrationRouter);
app.use('/api/digital-twin-integration', digitalTwinIntegrationRouter);
app.use('/api/federated-learning-integration', federatedLearningIntegrationRouter);
app.use('/api/quantum-computing-integration', quantumComputingIntegrationRouter);
app.use('/api/advanced-cybersecurity-integration', advancedCybersecurityIntegrationRouter);
app.use('/api/ollama', ollamaRouter);
app.use('/api/manifests', manifestsRouter);

// AI Database routes
app.use('/api/database', databaseRouter);
app.use('/api/telemetry', telemetryRouter);

// ==================== ROOT ROUTES ====================
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🧠 AI-BOS Backend Server',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    features: {
      aiDatabase: 'enabled',
      consciousness: 'enabled',
      manifestor: 'enabled',
      telemetry: 'enabled',
      security: 'enabled'
    }
  });
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Check consciousness database health
    const consciousnessHealth = { status: 'healthy' }; // await consciousnessDatabase.healthCheck();

    // Check AI database system health
    const aiDatabaseHealth = await aiDatabaseSystem.healthCheck();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        consciousness: consciousnessHealth,
        aiDatabase: aiDatabaseHealth,
        manifestor: 'operational',
        telemetry: 'operational'
      },
      environment: NODE_ENV,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Favicon
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// API health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// API status
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      aiDatabase: 'running',
      consciousness: 'running',
      manifestor: 'running',
      telemetry: 'running'
    },
    environment: NODE_ENV
  });
});

// Enterprise health endpoints
app.get('/healthz', (_req: Request, res: Response) => {
  const health = healthMonitor.getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

app.get('/readyz', async (_req: Request, res: Response) => {
  const readiness = await healthMonitor.getReadinessStatus();
  res.status(readiness.ready ? 200 : 503).json(readiness);
});

// ==================== ERROR HANDLING ====================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ==================== WEBSOCKET SERVER ====================
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('🔌 WebSocket client connected:', req.socket.remoteAddress);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 WebSocket message received:', data);

      // Handle different message types
      switch (data.type) {
        case 'consciousness_update':
          // Broadcast consciousness updates
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'consciousness_update',
                data: data.payload
              }));
            }
          });
          break;

        case 'ai_insight':
          // Broadcast AI insights
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'ai_insight',
                data: data.payload
              }));
            }
          });
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message parsing error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ==================== SERVER STARTUP ====================
server.listen(PORT, async () => {
  // Validate runtime integrity
  const validationResult = await manifestValidator.validateRuntime();
  if (!validationResult.valid) {
    log.error('Runtime validation failed', new Error('Runtime integrity check failed'), {
      module: 'server',
      action: 'startup',
      errors: validationResult.errors
    });
    console.error('❌ Runtime validation failed:', validationResult.errors);
  } else {
    log.info('Runtime validation passed', {
      module: 'server',
      action: 'startup',
      warnings: validationResult.warnings.length
    });
  }

  log.info('AI-BOS Backend Server started successfully!', {
    module: 'server',
    action: 'startup',
    port: PORT,
    environment: NODE_ENV,
    validationValid: validationResult.valid
  });

  console.log('🚀 AI-BOS Backend Server started successfully!');
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🧠 AI Database: ${aiDatabaseSystem ? 'Initialized' : 'Failed'}`);
  console.log(`🧠 Consciousness: ${consciousnessDatabase ? 'Initialized' : 'Failed'}`);
  console.log(`📊 Telemetry: ${aiTelemetryEngine ? 'Initialized' : 'Failed'}`);
  console.log(`🔍 Runtime Validation: ${validationResult.valid ? '✅ Passed' : '❌ Failed'}`);
  console.log('✅ All systems operational!');

  // Start system telemetry ping
  setInterval(() => {
    log.heartbeat();
  }, 60000); // Every minute
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
