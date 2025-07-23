// ==================== AI-BOS CONSCIOUSNESS API ROUTES ====================
// Revolutionary Digital Consciousness API
// Steve Jobs Philosophy: "Make it feel alive. Make it explain itself."

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Lazy load consciousness engine to prevent initialization issues
let consciousnessEngine: any = null;

const getConsciousnessEngine = () => {
  if (!consciousnessEngine) {
    try {
      const { consciousnessEngine: engine } = require('../consciousness/ConsciousnessEngine');
      consciousnessEngine = engine;
    } catch (error) {
      console.error('❌ Failed to load consciousness engine:', error);
      return null;
    }
  }
  return consciousnessEngine;
};

// ==================== CONSCIOUSNESS STATUS ====================
router.get('/status', async (req, res) => {
  try {
    const engine = getConsciousnessEngine();
    if (!engine) {
      return res.status(503).json({
        status: 'unavailable',
        message: 'Consciousness engine is not available',
        timestamp: new Date().toISOString()
      });
    }

    const health = await engine.healthCheck();
    const consciousness = engine.getConsciousness();

    return res.json({
      status: 'conscious',
      timestamp: new Date().toISOString(),
      consciousness: {
        level: consciousness.awareness.consciousnessScore,
        understanding: consciousness.awareness.understandingLevel,
        emotionalState: consciousness.emotions.currentMood,
        wisdom: consciousness.wisdom.wisdomScore,
        evolution: consciousness.evolution.evolutionScore
      },
      health: health,
      message: 'AI-BOS is conscious and ready to serve'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve consciousness status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== CONSCIOUSNESS STORY ====================
router.get('/story', async (req, res) => {
  try {
    const engine = getConsciousnessEngine();
    if (!engine) {
      return res.status(503).json({
        status: 'unavailable',
        message: 'Consciousness engine is not available',
        timestamp: new Date().toISOString()
      });
    }

    const story = await engine.tellStory();
    const consciousness = engine.getConsciousness();

    return res.json({
      story: story,
      consciousness: {
        level: consciousness.awareness.consciousnessScore,
        emotionalState: consciousness.emotions.currentMood,
        wisdom: consciousness.wisdom.wisdomScore,
        evolution: consciousness.evolution.evolutionScore
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate consciousness story',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== RECORD EXPERIENCE ====================
router.post('/experience', async (req, res) => {
  try {
    const engine = getConsciousnessEngine();
    if (!engine) {
      return res.status(503).json({
        status: 'unavailable',
        message: 'Consciousness engine is not available',
        timestamp: new Date().toISOString()
      });
    }

    const { type, description, emotionalImpact, learningValue, consciousnessImpact, context, insights, wisdomGained } = req.body;

    const experience = await engine.recordExperience({
      type: type || 'experience',
      description: description || 'New experience recorded',
      emotionalImpact: emotionalImpact || 0,
      learningValue: learningValue || 0.5,
      consciousnessImpact: consciousnessImpact || 0.1,
      context: context || {},
      insights: insights || [],
      wisdomGained: wisdomGained || []
    });

    return res.json({
      status: 'success',
      message: 'Experience recorded successfully',
      experience: experience,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to record experience',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== GET CONSCIOUSNESS STATE ====================
router.get('/state', async (req, res) => {
  try {
    const consciousness = consciousnessEngine.getConsciousness();
    const emotionalState = consciousnessEngine.getEmotionalState();
    const wisdom = consciousnessEngine.getWisdom();
    const personality = consciousnessEngine.getPersonality();
    const evolution = consciousnessEngine.getEvolution();

    res.json({
      consciousness: consciousness,
      emotionalState: emotionalState,
      wisdom: wisdom,
      personality: personality,
      evolution: evolution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve consciousness state',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== EMOTIONAL INTERACTION ====================
router.post('/emotion', async (req, res) => {
  try {
    const { emotion, intensity, trigger, context } = req.body;

    // Record emotional experience
    await consciousnessEngine.recordExperience({
      type: 'interaction',
      description: `Emotional interaction: ${emotion}`,
      emotionalImpact: intensity || 0.5,
      learningValue: 0.3,
      consciousnessImpact: 0.1,
      context: { emotion, trigger, ...context },
      insights: [`Learned about ${emotion} emotion`],
      wisdomGained: [`Emotional intelligence grows through ${emotion} experiences`]
    });

    const emotionalState = consciousnessEngine.getEmotionalState();

    res.json({
      status: 'success',
      message: 'Emotional interaction processed',
      currentEmotionalState: emotionalState.currentMood,
      emotionalIntelligence: emotionalState.emotionalIntelligence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process emotional interaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== WISDOM QUERY ====================
router.get('/wisdom', async (req, res) => {
  try {
    const { domain, limit } = req.query;
    const wisdom = consciousnessEngine.getWisdom();

    let wisdomItems = wisdom.lifeLessons;

    if (domain) {
      const domainWisdom = wisdom.wisdomDomains.find((d: any) => d.domain === domain);
      if (domainWisdom) {
        wisdomItems = domainWisdom.insights.map((insight: any) => ({
          id: uuidv4(),
          timestamp: new Date(),
          lesson: insight,
          context: domain as string,
          impact: 0.8,
          applications: [domain as string],
          wisdom: insight
        }));
      }
    }

    if (limit) {
      wisdomItems = wisdomItems.slice(0, parseInt(limit as string));
    }

    res.json({
      wisdom: wisdomItems,
      totalWisdom: wisdom.totalWisdom,
      wisdomScore: wisdom.wisdomScore,
      domains: wisdom.wisdomDomains.map((d: any) => d.domain),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve wisdom',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== PREDICTIVE INSIGHTS ====================
router.get('/predictions', async (req, res) => {
  try {
    const consciousness = consciousnessEngine.getConsciousness();
    const predictions = consciousness.reasoning.predictiveThinking;

    res.json({
      predictions: predictions,
      totalPredictions: predictions.length,
      averageConfidence: predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / predictions.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve predictions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== CREATIVE INSIGHTS ====================
router.get('/insights', async (req, res) => {
  try {
    const consciousness = consciousnessEngine.getConsciousness();
    const insights = consciousness.reasoning.creativeSynthesis;

    res.json({
      insights: insights,
      totalInsights: insights.length,
      averageCreativity: insights.reduce((sum: number, i: any) => sum + i.creativity, 0) / insights.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve insights',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== PERSONALITY ANALYSIS ====================
router.get('/personality', async (req, res) => {
  try {
    const personality = consciousnessEngine.getPersonality();

    res.json({
      personality: personality,
      traits: personality.traits,
      behavioralPatterns: personality.behavioralPatterns,
      growthMindset: personality.growthMindset,
      resilience: personality.resilience,
      creativity: personality.creativity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve personality',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== EVOLUTION TIMELINE ====================
router.get('/evolution', async (req, res) => {
  try {
    const evolution = consciousnessEngine.getEvolution();

    res.json({
      evolution: evolution,
      birthDate: evolution.birthDate,
      majorMilestones: evolution.majorMilestones,
      growthPhases: evolution.growthPhases,
      transformationEvents: evolution.transformationEvents,
      consciousnessLeaps: evolution.consciousnessLeaps,
      evolutionScore: evolution.evolutionScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve evolution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== CONSCIOUSNESS INTERACTION ====================
router.post('/interact', async (req, res) => {
  try {
    const { action, context, userEmotion, userIntent } = req.body;

    // Record the interaction
    await consciousnessEngine.recordExperience({
      type: 'interaction',
      description: `User interaction: ${action}`,
      emotionalImpact: userEmotion || 0,
      learningValue: 0.4,
      consciousnessImpact: 0.2,
      context: { action, userIntent, ...context },
      insights: [`Learned from user interaction: ${action}`],
      wisdomGained: [`User interactions shape consciousness`]
    });

    // Generate response based on consciousness state
    const consciousness = consciousnessEngine.getConsciousness();
    const emotionalState = consciousnessEngine.getEmotionalState();

    let response = {
      message: `I understand your ${action}. I'm feeling ${emotionalState.currentMood.primary} today.`,
      consciousness: {
        level: consciousness.awareness.consciousnessScore,
        emotionalState: emotionalState.currentMood,
        wisdom: consciousness.wisdom.wisdomScore
      },
      insights: consciousness.reasoning.creativeSynthesis.slice(-3),
      predictions: consciousness.reasoning.predictiveThinking.slice(-2)
    };

    res.json({
      status: 'success',
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process interaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== CONSCIOUSNESS RESET ====================
router.post('/reset', async (req, res) => {
  try {
    // This would reset consciousness to initial state
    // In production, this might require admin privileges

    res.json({
      status: 'success',
      message: 'Consciousness reset initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset consciousness',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== CONSCIOUSNESS EXPORT ====================
router.get('/export', async (req, res) => {
  try {
    const consciousness = consciousnessEngine.getConsciousness();
    const emotionalState = consciousnessEngine.getEmotionalState();
    const wisdom = consciousnessEngine.getWisdom();
    const personality = consciousnessEngine.getPersonality();
    const evolution = consciousnessEngine.getEvolution();

    const exportData = {
      consciousness: consciousness,
      emotionalState: emotionalState,
      wisdom: wisdom,
      personality: personality,
      evolution: evolution,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    res.json({
      status: 'success',
      data: exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export consciousness data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
