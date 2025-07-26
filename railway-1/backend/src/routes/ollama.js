// ==================== AI-BOS OLLAMA API ROUTES ====================
// RESTful API endpoints for Ollama integration
// Enterprise Grade - Production Ready

const express = require('express');
const router = express.Router();
const { OllamaIntegration } = require('../ai-database/ollama/OllamaIntegration');

// Initialize Ollama integration
const ollamaIntegration = new OllamaIntegration();

// ==================== HEALTH CHECK ====================
router.get('/health', async (req, res) => {
  try {
    const status = ollamaIntegration.getStatus();
    res.json({
      status: 'healthy',
      ollama: status.ollama,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SCHEMA ANALYSIS ====================
router.post('/analyze-schema', async (req, res) => {
  try {
    const { schema } = req.body;

    if (!schema) {
      return res.status(400).json({
        error: 'Schema is required',
        timestamp: new Date().toISOString()
      });
    }

    const analysis = await ollamaIntegration.analyzeSchema(schema);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schema analysis error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SCHEMA COMPARISON ====================
router.post('/compare-schemas', async (req, res) => {
  try {
    const { oldSchema, newSchema } = req.body;

    if (!oldSchema || !newSchema) {
      return res.status(400).json({
        error: 'Both oldSchema and newSchema are required',
        timestamp: new Date().toISOString()
      });
    }

    const comparison = await ollamaIntegration.compareSchemas(oldSchema, newSchema);

    res.json({
      success: true,
      comparison,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schema comparison error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== MIGRATION PLAN ====================
router.post('/generate-migration', async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff) {
      return res.status(400).json({
        error: 'Schema diff is required',
        timestamp: new Date().toISOString()
      });
    }

    const migrationPlan = await ollamaIntegration.generateMigrationPlan(diff);

    res.json({
      success: true,
      migrationPlan,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Migration plan generation error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== TEXT GENERATION ====================
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'llama3:8b', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    const response = await ollamaIntegration.ollamaService.generateText(prompt, model);

    res.json({
      success: true,
      response,
      model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== MODEL MANAGEMENT ====================
router.get('/models', async (req, res) => {
  try {
    const models = await ollamaIntegration.ollamaService.connector.listModels();

    res.json({
      success: true,
      models,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model listing error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/pull-model', async (req, res) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({
        error: 'Model name is required',
        timestamp: new Date().toISOString()
      });
    }

    await ollamaIntegration.ollamaService.connector.pullModel(modelName);

    res.json({
      success: true,
      message: `Model ${modelName} pulled successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model pull error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== CONFIGURATION ====================
router.get('/config', (req, res) => {
  try {
    const status = ollamaIntegration.getStatus();

    res.json({
      success: true,
      config: status.ollama.config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Config retrieval error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/config', (req, res) => {
  try {
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({
        error: 'Configuration is required',
        timestamp: new Date().toISOString()
      });
    }

    ollamaIntegration.ollamaService.updateConfig(config);

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
