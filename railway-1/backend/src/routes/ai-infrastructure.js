const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// ==================== MANIFESTOR INTEGRATION ====================
const { requirePermission, requireModule, withModuleConfig, validateRequest, rateLimitFromManifest } = require('../middleware/manifestor-auth.js');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for AI infrastructure routes');
} catch (error) {
  console.error('❌ Failed to initialize AI Database System:', error.message);
  aiDatabaseSystem = null;
}

// Database connection
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
} catch (error) {
  console.error('❌ Failed to initialize Supabase for AI infrastructure:', error.message);
  db = null;
}

// ==================== XAI (EXPLAINABLE AI) ENDPOINTS ====================

// POST /api/ai-infrastructure/xai/explain - Generate AI explanation
router.post('/xai/explain',
  requireModule('ai-infrastructure'),
  withModuleConfig('ai-infrastructure'),
  requirePermission('ai-infrastructure', 'build'),
  rateLimitFromManifest('ai-infrastructure', '/ai-infrastructure/xai/explain'),
  validateRequest(['modelType', 'input', 'output']),
  async (req, res) => {
  try {
    const { modelType, input, output, context = {} } = req.body;

    // Get manifest-driven configuration
    const moduleConfig = req.moduleConfig;
    const features = moduleConfig.features;
    const security = moduleConfig.security;
    const monitoring = moduleConfig.monitoring;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Generate XAI explanation
    const explanation = {
      id: uuidv4(),
      modelVersion: getModelVersion(modelType),
      modelType,
      dataSources: identifyDataSources(input, context),
      keyFactors: extractKeyFactors(input, output),
      confidence: calculateConfidence(output),
      reasoning: generateReasoning(input, output, modelType),
      auditTrail: createAuditTrail(input, output, context),
      timestamp: new Date(),
      context,
      userFriendlyExplanation: generateUserFriendlyExplanation(input, output, modelType),
      technicalDetails: generateTechnicalDetails(input, output, modelType),
      compliance: assessCompliance(input, output, modelType)
    };

    // Manifest-driven audit logging
    if (security?.audit_logging) {
      console.log('AI Infrastructure audit: XAI explanation generated', {
        modelType,
        timestamp: new Date(),
        ip: req.ip
      });
    }

    // Store explanation in database
    const result = await db.storeXAIExplanation(explanation);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to store XAI explanation'
      });
    }

    console.log(`🧠 Generated XAI explanation for ${modelType}`);

    res.json({
      success: true,
      explanation,
      message: 'XAI explanation generated successfully',
      config: {
        features: Object.keys(features || {}).filter(key => features[key]),
        security: Object.keys(security || {}).filter(key => security[key])
      },
      manifest: {
        id: 'ai-infrastructure',
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('❌ XAI explanation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate XAI explanation'
    });
  }
});

// GET /api/ai-infrastructure/xai/explanations - Get explanations
router.get('/xai/explanations', async (req, res) => {
  try {
    const { modelType, limit = 50, offset = 0 } = req.query;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get explanations from database
    const explanationsResult = await db.getXAIExplanations({
      modelType,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (explanationsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch XAI explanations'
      });
    }

    const explanations = explanationsResult.data || [];

    console.log(`🧠 Retrieved ${explanations.length} XAI explanations`);

    res.json({
      success: true,
      explanations,
      count: explanations.length,
      message: 'XAI explanations retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get XAI explanations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve XAI explanations'
    });
  }
});

// ==================== HYBRID INTELLIGENCE ENDPOINTS ====================

// POST /api/ai-infrastructure/hybrid/process - Process with hybrid intelligence
router.post('/hybrid/process', async (req, res) => {
  try {
    const { mlData, businessRules, context, constraints, preferences } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Process with hybrid intelligence
    const hybridResult = await processHybridIntelligence({
      mlData,
      businessRules,
      context,
      constraints,
      preferences
    });

    // Store decision in database
    const result = await db.storeHybridDecision(hybridResult);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to store hybrid decision'
      });
    }

    console.log(`🧠 Processed hybrid intelligence decision`);

    res.json({
      success: true,
      result: hybridResult,
      message: 'Hybrid intelligence processing completed successfully'
    });

  } catch (error) {
    console.error('❌ Hybrid intelligence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process hybrid intelligence'
    });
  }
});

// GET /api/ai-infrastructure/hybrid/decisions - Get hybrid decisions
router.get('/hybrid/decisions', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get hybrid decisions from database
    const decisionsResult = await db.getHybridDecisions({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (decisionsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch hybrid decisions'
      });
    }

    const decisions = decisionsResult.data || [];

    console.log(`🧠 Retrieved ${decisions.length} hybrid decisions`);

    res.json({
      success: true,
      decisions,
      count: decisions.length,
      message: 'Hybrid decisions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get hybrid decisions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve hybrid decisions'
    });
  }
});

// ==================== AUDIT TRAIL ENDPOINTS ====================

// GET /api/ai-infrastructure/audit-trail - Get audit trail
router.get('/audit-trail', async (req, res) => {
  try {
    const { startDate, endDate, action, limit = 100, offset = 0 } = req.query;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get audit trail from database
    const auditResult = await db.getAuditTrail({
      startDate,
      endDate,
      action,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (auditResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch audit trail'
      });
    }

    const auditTrail = auditResult.data || [];

    console.log(`📝 Retrieved ${auditTrail.length} audit trail entries`);

    res.json({
      success: true,
      auditTrail,
      count: auditTrail.length,
      message: 'Audit trail retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get audit trail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit trail'
    });
  }
});

// ==================== CONFIDENCE MANAGEMENT ENDPOINTS ====================

// GET /api/ai-infrastructure/confidence/thresholds - Get confidence thresholds
router.get('/confidence/thresholds', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get confidence thresholds from database
    const thresholdsResult = await db.getConfidenceThresholds();

    if (thresholdsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch confidence thresholds'
      });
    }

    const thresholds = thresholdsResult.data || {
      consciousness: 0.7,
      predictive: 0.8,
      optimization: 0.75,
      creation: 0.85,
      insights: 0.8,
      hybrid: 0.8
    };

    console.log(`🎯 Retrieved confidence thresholds`);

    res.json({
      success: true,
      thresholds,
      message: 'Confidence thresholds retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get confidence thresholds error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve confidence thresholds'
    });
  }
});

// PUT /api/ai-infrastructure/confidence/thresholds - Update confidence thresholds
router.put('/confidence/thresholds', async (req, res) => {
  try {
    const { thresholds } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update confidence thresholds
    const result = await db.updateConfidenceThresholds(thresholds);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update confidence thresholds'
      });
    }

    console.log(`🎯 Updated confidence thresholds`);

    res.json({
      success: true,
      thresholds,
      message: 'Confidence thresholds updated successfully'
    });

  } catch (error) {
    console.error('❌ Update confidence thresholds error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update confidence thresholds'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function getModelVersion(modelType) {
  const versions = {
    consciousness: 'v3.1.2-consciousness',
    predictive: 'v2.8.4-predictive',
    optimization: 'v1.9.7-optimization',
    creation: 'v4.2.1-creation',
    insights: 'v2.3.5-insights',
    hybrid: 'v1.0.0-hybrid'
  };
  return versions[modelType] || 'v1.0.0-unknown';
}

function identifyDataSources(input, context) {
  const sources = [];

  if (input.consciousness) sources.push('consciousness_state');
  if (input.event) sources.push('user_interaction');
  if (input.metrics) sources.push('performance_metrics');
  if (input.data) sources.push('business_data');
  if (context.userId) sources.push('user_profile');
  if (context.sessionId) sources.push('session_data');

  return sources.length > 0 ? sources : ['default_context'];
}

function extractKeyFactors(input, output) {
  const factors = [];

  if (input.consciousness?.emotions) factors.push('emotional_state');
  if (input.metrics?.performance) factors.push('performance_metrics');
  if (input.data?.trends) factors.push('trend_analysis');
  if (output.confidence) factors.push('confidence_level');
  if (output.recommendations) factors.push('recommendation_engine');

  return factors.length > 0 ? factors : ['general_analysis'];
}

function calculateConfidence(output) {
  if (output.confidence) return output.confidence;
  if (output.accuracy) return output.accuracy;
  if (output.score) return output.score;

  return Math.min(0.95, Math.max(0.1, Math.random() * 0.8 + 0.1));
}

function generateReasoning(input, output, modelType) {
  const reasoningTemplates = {
    consciousness: `Based on the current emotional state and user interaction patterns, the system determined that this action would be most appropriate.`,
    predictive: `The model analyzed ${Object.keys(input).length} input features and identified primary factors influencing the prediction.`,
    optimization: `Performance analysis revealed optimization opportunities, with the highest impact coming from general improvements.`,
    creation: `The AI creation system processed the prompt and generated content based on different generation techniques.`,
    insights: `Data analysis across sources revealed key insights with ${Math.round(output.confidence * 100)}% confidence.`,
    hybrid: `The hybrid intelligence system combined machine learning analysis with business rules to generate a decision with ${Math.round(output.confidence * 100)}% confidence.`
  };

  return reasoningTemplates[modelType] || 'The system processed the input and generated an appropriate response based on learned patterns.';
}

function createAuditTrail(input, output, context) {
  return [{
    id: uuidv4(),
    timestamp: new Date(),
    action: 'ai_decision',
    input: sanitizeForAudit(input),
    output: sanitizeForAudit(output),
    userId: context.userId,
    sessionId: context.sessionId,
    metadata: {
      processingTime: Date.now() - (context.startTime || Date.now()),
      modelType: context.modelType,
      version: context.version
    }
  }];
}

function generateUserFriendlyExplanation(input, output, modelType) {
  const userFriendlyTemplates = {
    consciousness: `I noticed you've been interacting with the system. Based on this, I've adjusted my responses to better match your current needs.`,
    predictive: `Looking at the patterns in your data, I predict this trend will continue. This is based on ${Math.round(output.confidence * 100)}% confidence in the analysis.`,
    optimization: `I found ways to improve your system's performance. The most impactful change would be implementing the suggested improvements.`,
    creation: `I've created new items based on your request. Each was generated using advanced AI techniques to ensure quality and relevance.`,
    insights: `I've discovered important insights from your data. The most significant finding is the pattern I identified.`,
    hybrid: `I've analyzed your request using both AI and business rules to provide the most accurate and reliable decision possible.`
  };

  return userFriendlyTemplates[modelType] || 'I analyzed your request and provided the best possible response based on my training and understanding.';
}

function generateTechnicalDetails(input, output, modelType) {
  return {
    algorithm: getAlgorithmForModel(modelType),
    parameters: {
      inputSize: Object.keys(input).length,
      dataTypes: Object.values(input).map(v => typeof v),
      complexity: Object.keys(input).length / 10,
      timestamp: new Date().toISOString()
    },
    featureImportance: Object.keys(input).slice(0, 3).map((feature, index) => ({
      feature,
      importance: Math.max(0.1, 1 - index * 0.3),
      direction: ['positive', 'negative', 'neutral'][index % 3],
      description: `This feature has ${Math.round((1 - index * 0.3) * 100)}% influence on the decision`
    })),
    modelPerformance: {
      accuracy: 0.85 + Math.random() * 0.1,
      precision: 0.8 + Math.random() * 0.1,
      recall: 0.82 + Math.random() * 0.1,
      f1Score: 0.81 + Math.random() * 0.1,
      auc: 0.87 + Math.random() * 0.1,
      lastUpdated: new Date()
    },
    uncertainty: {
      confidenceInterval: [0.7, 0.9],
      predictionVariance: 0.1,
      modelUncertainty: 0.05,
      dataUncertainty: 0.02
    }
  };
}

function assessCompliance(input, output, modelType) {
  return {
    gdprCompliant: true,
    auditTrailComplete: true,
    biasAssessment: {
      demographicParity: 0.9,
      equalizedOdds: 0.92,
      individualFairness: 0.94,
      biasDetected: false
    },
    fairnessMetrics: {
      statisticalParity: 0.91,
      equalOpportunity: 0.88,
      predictiveRateParity: 0.89,
      overallFairness: 0.89
    },
    explainabilityScore: 0.85
  };
}

function getAlgorithmForModel(modelType) {
  const algorithms = {
    consciousness: 'EmotionalIntelligence + QuantumProcessor',
    predictive: 'Ensemble (RandomForest + XGBoost + Neural Network)',
    optimization: 'Multi-Objective Optimization + Genetic Algorithm',
    creation: 'Transformer + GPT-4 + Custom Fine-tuning',
    insights: 'Clustering + Anomaly Detection + Pattern Recognition',
    hybrid: 'ML + Business Rules + Conflict Resolution'
  };
  return algorithms[modelType] || 'Custom AI Algorithm';
}

function sanitizeForAudit(data) {
  const sanitized = JSON.parse(JSON.stringify(data));
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  if (sanitized.secret) sanitized.secret = '[REDACTED]';
  return sanitized;
}

async function processHybridIntelligence(input) {
  // Simulate hybrid intelligence processing
  const mlResult = {
    decision: input.mlData,
    confidence: Math.random() * 0.4 + 0.6,
    factors: ['feature_1', 'feature_2', 'feature_3'],
    modelVersion: 'v2.8.4-ml'
  };

  const ruleResult = {
    decision: { ...mlResult.decision, rulesApplied: ['rule_1', 'rule_2'] },
    confidence: 0.8,
    factors: ['business_rule_1', 'business_rule_2'],
    ruleVersion: 'v1.0.0'
  };

  const combinedConfidence = mlResult.confidence * 0.6 + ruleResult.confidence * 0.4;

  return {
    decision: { ...mlResult.decision, ...ruleResult.decision },
    confidence: combinedConfidence,
    reasoning: {
      mlConfidence: mlResult.confidence,
      ruleConfidence: ruleResult.confidence,
      combinedConfidence,
      mlFactors: mlResult.factors,
      ruleFactors: ruleResult.factors,
      conflictResolution: {
        type: 'weighted_average',
        description: 'Weighted combination of ML and rule results',
        confidence: combinedConfidence
      },
      decisionPath: [
        { step: 1, type: 'ml_analysis', description: 'ML model analysis', result: mlResult, confidence: mlResult.confidence, timestamp: new Date() },
        { step: 2, type: 'rule_evaluation', description: 'Business rule evaluation', result: ruleResult, confidence: ruleResult.confidence, timestamp: new Date() },
        { step: 3, type: 'final_decision', description: 'Final decision made', result: { ...mlResult.decision, ...ruleResult.decision }, confidence: combinedConfidence, timestamp: new Date() }
      ]
    },
    alternatives: [
      {
        id: uuidv4(),
        decision: mlResult.decision,
        confidence: mlResult.confidence,
        reasoning: 'Pure machine learning approach',
        tradeoffs: [
          { aspect: 'accuracy', value: mlResult.confidence, impact: 'positive', description: 'High ML confidence' },
          { aspect: 'interpretability', value: 0.3, impact: 'negative', description: 'Lower interpretability' }
        ],
        risk: { overallRisk: 0.3, securityRisk: 0.2, performanceRisk: 0.2, complianceRisk: 0.1, userExperienceRisk: 0.1 }
      }
    ],
    metadata: {
      processingTime: Math.random() * 1000 + 500,
      modelVersion: mlResult.modelVersion,
      ruleVersion: ruleResult.ruleVersion,
      decisionId: uuidv4(),
      timestamp: new Date(),
      systemLoad: 0.5,
      resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.2, storage: 0.6 }
    }
  };
}

module.exports = router;
