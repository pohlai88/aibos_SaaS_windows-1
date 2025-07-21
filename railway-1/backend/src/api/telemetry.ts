// ==================== AI-BOS TELEMETRY API ENDPOINTS ====================
// REST API for AI Telemetry Learning Feedback Loop
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAIDatabaseSystem } from '../ai-database';
import type {
  TelemetryEvent,
  TelemetryEventType,
  TelemetryData,
  TelemetryMetadata,
  LearningFeedback,
  Correction,
  TelemetryReport,
  TelemetryInsight,
  LearningModel
} from '../ai-database';

const router = Router();
const telemetryEngine = getAIDatabaseSystem().getTelemetryEngine();

// ==================== VALIDATION SCHEMAS ====================
const RecordEventSchema = z.object({
  type: z.enum([
    'schema_operation', 'migration_execution', 'performance_metric', 'error_occurrence',
    'user_interaction', 'system_health', 'security_event', 'compliance_check',
    'ai_prediction', 'ai_accuracy', 'learning_feedback', 'model_update'
  ]),
  source: z.string().min(1),
  data: z.object({
    operation: z.string(),
    parameters: z.record(z.any()),
    result: z.any().optional(),
    error: z.string().optional(),
    duration: z.number().min(0),
    resourceUsage: z.object({
      cpu: z.number().min(0).max(100),
      memory: z.number().min(0),
      disk: z.number().min(0),
      network: z.number().min(0),
      databaseConnections: z.number().min(0),
      cacheHitRate: z.number().min(0).max(1)
    }),
    context: z.record(z.any())
  }),
  metadata: z.object({
    version: z.string().optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    region: z.string().optional(),
    instanceId: z.string().optional(),
    requestId: z.string().optional(),
    correlationId: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

const ProvideFeedbackSchema = z.object({
  eventId: z.string().uuid(),
  actualOutcome: z.any(),
  feedback: z.string().min(1),
  userRating: z.number().min(1).max(5).optional(),
  corrections: z.array(z.object({
    field: z.string(),
    originalValue: z.any(),
    correctedValue: z.any(),
    reason: z.string(),
    confidence: z.number().min(0).max(1)
  })).optional()
});

const AnalyzeTelemetrySchema = z.object({
  timeframe: z.string().default('24h'),
  filters: z.record(z.any()).optional(),
  includeInsights: z.boolean().default(true),
  includePatterns: z.boolean().default(true),
  includeAnomalies: z.boolean().default(true),
  includeTrends: z.boolean().default(true),
  includePredictions: z.boolean().default(true)
});

const TrainModelsSchema = z.object({
  models: z.array(z.enum(['performance', 'anomaly', 'usage', 'error'])).optional(),
  forceRetrain: z.boolean().default(false),
  validateOnly: z.boolean().default(false)
});

// ==================== API ENDPOINTS ====================

/**
 * Record telemetry event
 * POST /api/telemetry/events
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const validatedData = RecordEventSchema.parse(req.body);

    const event = await telemetryEngine.recordEvent(
      validatedData.type,
      validatedData.source,
      validatedData.data,
      validatedData.metadata
    );

    res.status(201).json({
      success: true,
      data: {
        eventId: event.id,
        timestamp: event.timestamp,
        type: event.type,
        source: event.source,
        confidence: event.confidence
      },
      message: 'Telemetry event recorded successfully'
    });

  } catch (error) {
    console.error('❌ Failed to record telemetry event:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_EVENT_DATA',
        message: 'Invalid telemetry event data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * List telemetry events
 * GET /api/telemetry/events
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, source, startDate, endDate } = req.query;

    // Get all events (in a real implementation, this would be paginated from database)
    const allEvents = Array.from(telemetryEngine['events'].values());

    // Apply filters
    let filteredEvents = allEvents;

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    if (source) {
      filteredEvents = filteredEvents.filter(event => event.source === source);
    }

    if (startDate) {
      const start = new Date(startDate as string);
      filteredEvents = filteredEvents.filter(event => event.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      filteredEvents = filteredEvents.filter(event => event.timestamp <= end);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        events: paginatedEvents.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type,
          source: event.source,
          confidence: event.confidence,
          processed: event.processed,
          metadata: event.metadata
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredEvents.length,
          totalPages: Math.ceil(filteredEvents.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to list telemetry events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_EVENTS_FAILED',
        message: 'Failed to list telemetry events',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Get telemetry event by ID
 * GET /api/telemetry/events/:id
 */
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = telemetryEngine['events'].get(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Telemetry event not found'
        }
      });
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('❌ Failed to get telemetry event:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EVENT_FAILED',
        message: 'Failed to get telemetry event',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Provide learning feedback
 * POST /api/telemetry/feedback
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const validatedData = ProvideFeedbackSchema.parse(req.body);

    const feedback = await telemetryEngine.provideFeedback(
      validatedData.eventId,
      validatedData.actualOutcome,
      validatedData.feedback,
      validatedData.userRating,
      validatedData.corrections
    );

    res.status(201).json({
      success: true,
      data: {
        feedbackId: feedback.id,
        eventId: feedback.eventId,
        accuracy: feedback.accuracy,
        timestamp: feedback.timestamp
      },
      message: 'Learning feedback provided successfully'
    });

  } catch (error) {
    console.error('❌ Failed to provide feedback:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FEEDBACK_DATA',
        message: 'Invalid feedback data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * List learning feedback
 * GET /api/telemetry/feedback
 */
router.get('/feedback', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, eventId } = req.query;

    // Get all feedback (in a real implementation, this would be paginated from database)
    const allFeedback = Array.from(telemetryEngine['feedback'].values());

    // Apply filters
    let filteredFeedback = allFeedback;

    if (eventId) {
      filteredFeedback = filteredFeedback.filter(feedback => feedback.eventId === eventId);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedFeedback = filteredFeedback.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        feedback: paginatedFeedback.map(feedback => ({
          id: feedback.id,
          eventId: feedback.eventId,
          accuracy: feedback.accuracy,
          timestamp: feedback.timestamp,
          userRating: feedback.userRating,
          feedback: feedback.feedback
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredFeedback.length,
          totalPages: Math.ceil(filteredFeedback.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to list feedback:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_FEEDBACK_FAILED',
        message: 'Failed to list learning feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Analyze telemetry data
 * POST /api/telemetry/analyze
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const validatedData = AnalyzeTelemetrySchema.parse(req.body);

    const report = await telemetryEngine.analyzeTelemetry(validatedData.timeframe);

    res.json({
      success: true,
      data: {
        reportId: report.id,
        timestamp: report.timestamp,
        period: report.period,
        summary: report.summary,
        insights: validatedData.includeInsights ? report.insights : [],
        patterns: validatedData.includePatterns ? report.patterns : [],
        anomalies: validatedData.includeAnomalies ? report.anomalies : [],
        trends: validatedData.includeTrends ? report.trends : [],
        predictions: validatedData.includePredictions ? report.predictions : [],
        recommendations: report.recommendations,
        actions: report.actions
      }
    });

  } catch (error) {
    console.error('❌ Failed to analyze telemetry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Failed to analyze telemetry data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Train AI models
 * POST /api/telemetry/train-models
 */
router.post('/train-models', async (req: Request, res: Response) => {
  try {
    const validatedData = TrainModelsSchema.parse(req.body);

    const models = await telemetryEngine.trainModels();

    res.json({
      success: true,
      data: {
        models: models.map(model => ({
          id: model.id,
          name: model.name,
          type: model.type,
          version: model.version,
          status: model.status,
          performance: {
            accuracy: model.performance.accuracy,
            precision: model.performance.precision,
            recall: model.performance.recall,
            f1Score: model.performance.f1Score
          },
          lastTrained: model.lastTrained
        })),
        totalModels: models.length
      },
      message: 'AI models trained successfully'
    });

  } catch (error) {
    console.error('❌ Failed to train models:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TRAINING_FAILED',
        message: 'Failed to train AI models',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Get learning models
 * GET /api/telemetry/models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = telemetryEngine.getModels();

    res.json({
      success: true,
      data: {
        models: models.map(model => ({
          id: model.id,
          name: model.name,
          type: model.type,
          version: model.version,
          status: model.status,
          performance: {
            accuracy: model.performance.accuracy,
            precision: model.performance.precision,
            recall: model.performance.recall,
            f1Score: model.performance.f1Score
          },
          features: model.features,
          lastTrained: model.lastTrained,
          nextRetrain: model.nextRetrain
        })),
        totalModels: models.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to get models:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MODELS_FAILED',
        message: 'Failed to get learning models',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Get model performance
 * GET /api/telemetry/models/:id/performance
 */
router.get('/models/:id/performance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const performance = telemetryEngine.getModelPerformance(id);

    if (!performance) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MODEL_NOT_FOUND',
          message: 'Learning model not found'
        }
      });
    }

    res.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error('❌ Failed to get model performance:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PERFORMANCE_FAILED',
        message: 'Failed to get model performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Get telemetry insights
 * GET /api/telemetry/insights
 */
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, severity } = req.query;

    const allInsights = telemetryEngine.getInsights();

    // Apply filters
    let filteredInsights = allInsights;

    if (type) {
      filteredInsights = filteredInsights.filter(insight => insight.type === type);
    }

    if (severity) {
      filteredInsights = filteredInsights.filter(insight => insight.severity === severity);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedInsights = filteredInsights.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        insights: paginatedInsights,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredInsights.length,
          totalPages: Math.ceil(filteredInsights.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to get insights:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_INSIGHTS_FAILED',
        message: 'Failed to get telemetry insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Get telemetry health check
 * GET /api/telemetry/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = telemetryEngine.healthCheck();

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('❌ Failed to get telemetry health:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Failed to get telemetry health',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Get telemetry statistics
 * GET /api/telemetry/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const health = telemetryEngine.healthCheck();

    const stats = {
      totalEvents: health.events,
      totalFeedback: health.feedback,
      totalModels: health.models,
      totalInsights: health.insights,
      queueLength: health.queueLength,
      processing: health.processing,
      status: health.status
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Failed to get telemetry stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_FAILED',
        message: 'Failed to get telemetry statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// ==================== EXPORT ====================
export default router;
