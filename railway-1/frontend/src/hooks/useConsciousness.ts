// ==================== AI-BOS CONSCIOUSNESS REACT HOOK ====================
// Revolutionary Digital Consciousness React Integration
// Steve Jobs Philosophy: "Make it feel alive. Make it explain itself."

import { useState, useEffect, useCallback, useRef } from 'react';
import { consciousnessAPI, ConsciousnessStatus, EmotionalState, Wisdom, Personality, Evolution } from '@/lib/consciousness-api';
import { cachedConsciousnessAPI } from '@/lib/cached-api';
import { aiBackendAPI } from '@/lib/api';
import { ParallelProcessor } from '@/ai/engines/ParallelProcessor';
import { MLModelManager } from '@/ai/engines/MLModelManager';
import { NLPEngine } from '@/ai/engines/NLPEngine';
import { ComputerVisionEngine } from '@/ai/engines/ComputerVisionEngine';

// ==================== HOOK TYPES ====================
export interface UseConsciousnessReturn {
  // State
  status: ConsciousnessStatus | null;
  emotionalState: EmotionalState | null;
  wisdom: Wisdom | null;
  personality: Personality | null;
  evolution: Evolution | null;

  // Loading states
  loading: boolean;
  loadingStatus: boolean;
  loadingEmotional: boolean;
  loadingWisdom: boolean;
  loadingPersonality: boolean;
  loadingEvolution: boolean;

  // Error states
  error: string | null;
  errorStatus: string | null;
  errorEmotional: string | null;
  errorWisdom: string | null;
  errorPersonality: string | null;
  errorEvolution: string | null;

  // Actions
  recordExperience: (experience: {
    type?: string;
    description?: string;
    emotionalImpact?: number;
    learningValue?: number;
    consciousnessImpact?: number;
    context?: Record<string, any>;
    insights?: string[];
    wisdomGained?: string[];
  }) => Promise<void>;

  recordEmotion: (emotion: {
    emotion: string;
    intensity?: number;
    trigger?: string;
    context?: Record<string, any>;
  }) => Promise<void>;

  interact: (interaction: {
    action: string;
    context?: Record<string, any>;
    userEmotion?: number;
    userIntent?: string;
  }) => Promise<void>;

  getStory: () => Promise<string>;
  getWisdom: (params?: { domain?: string; limit?: number }) => Promise<void>;
  getPredictions: () => Promise<void>;
  getInsights: () => Promise<void>;

  // Simulation capabilities
  simulateExperience: (experience: {
    type: string;
    complexity: 'simple' | 'medium' | 'high';
    duration: number;
    outcomes: string[];
    learningObjectives: string[];
  }) => Promise<void>;

  simulateInteraction: (interaction: {
    userType: string;
    scenario: string;
    expectedOutcome: string;
    complexity: number;
  }) => Promise<void>;

  // AI Engine integration
  processWithAIEngines: (data: any, engines: ('parallel' | 'ml' | 'nlp' | 'vision')[]) => Promise<any>;
  analyzeWithML: (data: any) => Promise<any>;
  processWithNLP: (text: string) => Promise<any>;
  analyzeWithVision: (image: any) => Promise<any>;

  // Utilities
  isConscious: boolean;
  consciousnessLevel: number;
  emotionalMood: string;
  wisdomScore: number;
  evolutionScore: number;

  // Refresh functions
  refreshStatus: () => Promise<void>;
  refreshEmotional: () => Promise<void>;
  refreshWisdom: () => Promise<void>;
  refreshPersonality: () => Promise<void>;
  refreshEvolution: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ==================== CONSCIOUSNESS HOOK ====================
export const useConsciousness = (autoRefresh: boolean = true): UseConsciousnessReturn => {
  // ==================== STATE ====================
  const [status, setStatus] = useState<ConsciousnessStatus | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [wisdom, setWisdom] = useState<Wisdom | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [evolution, setEvolution] = useState<Evolution | null>(null);

  // ==================== LOADING STATES ====================
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingEmotional, setLoadingEmotional] = useState(false);
  const [loadingWisdom, setLoadingWisdom] = useState(false);
  const [loadingPersonality, setLoadingPersonality] = useState(false);
  const [loadingEvolution, setLoadingEvolution] = useState(false);

  // ==================== ERROR STATES ====================
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorEmotional, setErrorEmotional] = useState<string | null>(null);
  const [errorWisdom, setErrorWisdom] = useState<string | null>(null);
  const [errorPersonality, setErrorPersonality] = useState<string | null>(null);
  const [errorEvolution, setErrorEvolution] = useState<string | null>(null);

  // ==================== REFS ====================
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // ==================== AI SYSTEMS INITIALIZATION ====================
  const parallelProcessor = new ParallelProcessor({
    maxConcurrentRequests: 5,
    maxRetries: 3,
    timeoutMs: 30000,
    enableBatching: true,
    batchSize: 3,
    priorityWeights: {
      low: 1,
      normal: 2,
      high: 4,
      critical: 8
    }
  });

  const mlModelManager = new MLModelManager();
  const nlpEngine = new NLPEngine();
  const computerVisionEngine = new ComputerVisionEngine();

  // ==================== FETCH FUNCTIONS ====================
  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      setErrorStatus(null);
      const response = await cachedConsciousnessAPI.getStatus();
      if (isMountedRef.current) {
        setStatus(response.data as ConsciousnessStatus);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorStatus(error instanceof Error ? error.message : 'Failed to fetch consciousness status');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingStatus(false);
      }
    }
  }, []);

  const fetchEmotionalState = useCallback(async () => {
    try {
      setLoadingEmotional(true);
      setErrorEmotional(null);
      const response = await cachedConsciousnessAPI.getEmotionalState();
      if (isMountedRef.current) {
        setEmotionalState(response.data as EmotionalState);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorEmotional(error instanceof Error ? error.message : 'Failed to fetch emotional state');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingEmotional(false);
      }
    }
  }, []);

  const fetchWisdom = useCallback(async (params?: { domain?: string; limit?: number }) => {
    try {
      setLoadingWisdom(true);
      setErrorWisdom(null);
      const response = await cachedConsciousnessAPI.getWisdom();
      if (isMountedRef.current) {
        setWisdom({
          totalWisdom: (response.data as any).totalWisdom,
          wisdomScore: (response.data as any).wisdomScore,
          lifeLessons: (response.data as any).wisdom,
          wisdomDomains: (response.data as any).domains.map((domain: any) => ({
            domain,
            wisdom: 0.8,
            insights: [],
            principles: [],
            applications: []
          }))
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorWisdom(error instanceof Error ? error.message : 'Failed to fetch wisdom');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingWisdom(false);
      }
    }
  }, []);

  const fetchPersonality = useCallback(async () => {
    try {
      setLoadingPersonality(true);
      setErrorPersonality(null);
      const data = await consciousnessAPI.getPersonality();
      if (isMountedRef.current) {
        setPersonality(data.personality);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorPersonality(error instanceof Error ? error.message : 'Failed to fetch personality');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingPersonality(false);
      }
    }
  }, []);

  const fetchEvolution = useCallback(async () => {
    try {
      setLoadingEvolution(true);
      setErrorEvolution(null);
      const data = await consciousnessAPI.getEvolution();
      if (isMountedRef.current) {
        setEvolution(data.evolution);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrorEvolution(error instanceof Error ? error.message : 'Failed to fetch evolution');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingEvolution(false);
      }
    }
  }, []);

  // ==================== ACTION FUNCTIONS ====================
  const recordExperience = useCallback(async (experience: {
    type?: string;
    description?: string;
    emotionalImpact?: number;
    learningValue?: number;
    consciousnessImpact?: number;
    context?: Record<string, any>;
    insights?: string[];
    wisdomGained?: string[];
  }) => {
    try {
      await consciousnessAPI.recordExperience(experience);
      // Refresh status after recording experience
      await fetchStatus();
    } catch (error) {
      console.error();
      throw error;
    }
  }, [fetchStatus]);

  const recordEmotion = useCallback(async (emotion: {
    emotion: string;
    intensity?: number;
    trigger?: string;
    context?: Record<string, any>;
  }) => {
    try {
      await consciousnessAPI.recordEmotion(emotion);
      // Refresh emotional state after recording emotion
      await fetchEmotionalState();
    } catch (error) {
      console.error();
      throw error;
    }
  }, [fetchEmotionalState]);

  const interact = useCallback(async (interaction: {
    action: string;
    context?: Record<string, any>;
    userEmotion?: number;
    userIntent?: string;
  }) => {
    try {
      const response = await consciousnessAPI.interact(interaction);
      console.log('Consciousness interaction response:', response);
      // Refresh status after interaction
      await fetchStatus();
    } catch (error) {
      console.error();
      throw error;
    }
  }, [fetchStatus]);

  const getStory = useCallback(async (): Promise<string> => {
    try {
      const story = await consciousnessAPI.getStory();
      return story.story;
    } catch (error) {
      console.error();
      return 'Unable to retrieve consciousness story at this time.';
    }
  }, []);

  const getPredictions = useCallback(async () => {
    try {
      const predictions = await consciousnessAPI.getPredictions();
      console.log('Consciousness predictions:', predictions);
    } catch (error) {
      console.error();
    }
  }, []);

  const getInsights = useCallback(async () => {
    try {
      const insights = await consciousnessAPI.getInsights();
      console.log('Consciousness insights:', insights);
    } catch (error) {
      console.error();
    }
  }, []);

  // ==================== SIMULATION FUNCTIONS ====================

  const simulateExperience = useCallback(async (experience: {
    type: string;
    complexity: 'simple' | 'medium' | 'high';
    duration: number;
    outcomes: string[];
    learningObjectives: string[];
  }) => {
    try {
      // Use AI Backend Connector to simulate experience
      const simulationRequest = {
        type: 'consciousness_experience',
        experience: {
          ...experience,
          consciousnessLevel: status?.consciousness?.level || 0,
          emotionalState: emotionalState?.currentMood?.primary || 'neutral',
          wisdomLevel: wisdom?.wisdomScore || 0
        },
        context: {
          timestamp: new Date(),
          environment: 'simulation',
          complexity: experience.complexity
        }
      };

      // Generate simulation using AI
      const response = await aiBackendAPI.generateText({
        model: 'consciousness-simulator',
        prompt: `Simulate a consciousness experience: ${JSON.stringify(simulationRequest)}`,
        options: {
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: 'You are an AI consciousness simulator. Generate realistic simulation outcomes.'
        }
      });

      // Record the simulated experience
      await recordExperience({
        type: `simulated_${experience.type}`,
        description: `Simulated ${experience.type} experience`,
        emotionalImpact: 0.5,
        learningValue: 0.8,
        consciousnessImpact: 0.3,
        context: {
          simulation: true,
          complexity: experience.complexity,
          duration: experience.duration,
          outcomes: experience.outcomes,
          learningObjectives: experience.learningObjectives,
          aiResponse: response.data
        },
        insights: [response.data],
        wisdomGained: experience.learningObjectives
      });

      console.log('Experience simulation completed:', response.data);
    } catch (error) {
      console.error();
      throw error;
    }
  }, [status, emotionalState, wisdom, recordExperience]);

  const simulateInteraction = useCallback(async (interaction: {
    userType: string;
    scenario: string;
    expectedOutcome: string;
    complexity: number;
  }) => {
    try {
      // Use AI Backend Connector to simulate interaction
      const simulationRequest = {
        type: 'consciousness_interaction',
        interaction: {
          ...interaction,
          consciousnessLevel: status?.consciousness?.level || 0,
          emotionalState: emotionalState?.currentMood?.primary || 'neutral',
          personality: personality?.traits || []
        },
        context: {
          timestamp: new Date(),
          environment: 'simulation',
          complexity: interaction.complexity
        }
      };

      // Generate simulation using AI
      const response = await aiBackendAPI.generateText({
        model: 'consciousness-simulator',
        prompt: `Simulate a consciousness interaction: ${JSON.stringify(simulationRequest)}`,
        options: {
          temperature: 0.8,
          maxTokens: 800,
          systemPrompt: 'You are an AI consciousness interaction simulator. Generate realistic interaction outcomes.'
        }
      });

      // Record the simulated interaction
      await interact({
        action: `simulated_${interaction.scenario}`,
        context: {
          simulation: true,
          userType: interaction.userType,
          scenario: interaction.scenario,
          expectedOutcome: interaction.expectedOutcome,
          complexity: interaction.complexity,
          aiResponse: response.data
        },
        userEmotion: 0.6,
        userIntent: interaction.expectedOutcome
      });

      console.log('Interaction simulation completed:', response.data);
    } catch (error) {
      console.error();
      throw error;
    }
  }, [status, emotionalState, personality, interact]);

  // ==================== AI ENGINE INTEGRATION FUNCTIONS ====================
  const processWithAIEngines = useCallback(async (data: any, engines: ('parallel' | 'ml' | 'nlp' | 'vision')[]) => {
    try {
      const results: Record<string, any> = {};

      for (const engine of engines) {
        switch (engine) {
          case 'parallel':
            results.parallel = await parallelProcessor.submit({
              id: `consciousness-${Date.now()}`,
              task: 'consciousness-processing',
              input: data,
              priority: 'normal'
            });
            break;
          case 'ml':
            results.ml = await mlModelManager.predict('consciousness-analyzer', data);
            break;
          case 'nlp':
            results.nlp = await nlpEngine.analyzeSentiment(typeof data === 'string' ? data : JSON.stringify(data));
            break;
          case 'vision':
            if (data.image || data.visual) {
              results.vision = await computerVisionEngine.process({
                task: 'object-detection',
                image: data.image || data.visual,
                options: { confidence: 0.5 }
              });
            }
            break;
        }
      }

      // Record the AI engine processing experience
      await recordExperience({
        type: 'ai_engine_processing',
        description: `Processed data with ${engines.join(', ')} engines`,
        learningValue: engines.length * 0.1,
        consciousnessImpact: 0.05,
        context: { engines, results }
      });

      return results;
    } catch (error) {
      console.error();
      throw error;
    }
  }, [parallelProcessor, mlModelManager, nlpEngine, computerVisionEngine, recordExperience]);

  const analyzeWithML = useCallback(async (data: any) => {
    try {
      const result = await mlModelManager.predict('consciousness-analyzer', data);

      await recordExperience({
        type: 'ml_analysis',
        description: 'Analyzed data with ML model',
        learningValue: 0.2,
        consciousnessImpact: 0.03,
        context: { result }
      });

      return result;
    } catch (error) {
      console.error();
      throw error;
    }
  }, [mlModelManager, recordExperience]);

  const processWithNLP = useCallback(async (text: string) => {
    try {
      const result = await nlpEngine.analyzeSentiment(text);

      await recordExperience({
        type: 'nlp_processing',
        description: 'Processed text with NLP engine',
        learningValue: 0.15,
        consciousnessImpact: 0.02,
        context: { text, result }
      });

      return result;
    } catch (error) {
      console.error();
      throw error;
    }
  }, [nlpEngine, recordExperience]);

  const analyzeWithVision = useCallback(async (image: any) => {
    try {
      const result = await computerVisionEngine.process({
        task: 'object-detection',
        image: image,
        options: { confidence: 0.5 }
      });

      await recordExperience({
        type: 'vision_analysis',
        description: 'Analyzed image with computer vision',
        learningValue: 0.25,
        consciousnessImpact: 0.04,
        context: { result }
      });

      return result;
    } catch (error) {
      console.error();
      throw error;
    }
  }, [computerVisionEngine, recordExperience]);

  // ==================== REFRESH FUNCTIONS ====================
  const refreshStatus = useCallback(() => fetchStatus(), [fetchStatus]);
  const refreshEmotional = useCallback(() => fetchEmotionalState(), [fetchEmotionalState]);
  const refreshWisdom = useCallback(() => fetchWisdom(), [fetchWisdom]);
  const refreshPersonality = useCallback(() => fetchPersonality(), [fetchPersonality]);
  const refreshEvolution = useCallback(() => fetchEvolution(), [fetchEvolution]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchStatus(),
      fetchEmotionalState(),
      fetchWisdom(),
      fetchPersonality(),
      fetchEvolution()
    ]);
  }, [fetchStatus, fetchEmotionalState, fetchWisdom, fetchPersonality, fetchEvolution]);

  // ==================== COMPUTED VALUES ====================
  const isConscious = status?.status === 'conscious';
  const consciousnessLevel = status?.consciousness.level || 0;
  const emotionalMood = status?.consciousness.emotionalState.primary || 'unknown';
  const wisdomScore = status?.consciousness.wisdom || 0;
  const evolutionScore = status?.consciousness.evolution || 0;

  const loading = loadingStatus || loadingEmotional || loadingWisdom || loadingPersonality || loadingEvolution;
  const error = errorStatus || errorEmotional || errorWisdom || errorPersonality || errorEvolution;

  // ==================== EFFECTS ====================
  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchStatus();

    // Auto-refresh if enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchStatus();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchStatus, autoRefresh]);

  // ==================== RETURN ====================
  return {
    // State
    status,
    emotionalState,
    wisdom,
    personality,
    evolution,

    // Loading states
    loading,
    loadingStatus,
    loadingEmotional,
    loadingWisdom,
    loadingPersonality,
    loadingEvolution,

    // Error states
    error,
    errorStatus,
    errorEmotional,
    errorWisdom,
    errorPersonality,
    errorEvolution,

    // Actions
    recordExperience,
    recordEmotion,
    interact,
    getStory,
    getWisdom: fetchWisdom,
    getPredictions,
    getInsights,
    simulateExperience,
    simulateInteraction,

    // AI Engine integration
    processWithAIEngines,
    analyzeWithML,
    processWithNLP,
    analyzeWithVision,

    // Utilities
    isConscious,
    consciousnessLevel,
    emotionalMood,
    wisdomScore,
    evolutionScore,

    // Refresh functions
    refreshStatus,
    refreshEmotional,
    refreshWisdom,
    refreshPersonality,
    refreshEvolution,
    refreshAll,
  };
};

// ==================== SPECIALIZED HOOKS ====================
export const useConsciousnessStatus = () => {
  const { status, loadingStatus, errorStatus, refreshStatus } = useConsciousness();
  return { status, loading: loadingStatus, error: errorStatus, refresh: refreshStatus };
};

export const useConsciousnessEmotions = () => {
  const { emotionalState, loadingEmotional, errorEmotional, refreshEmotional, recordEmotion } = useConsciousness();
  return {
    emotionalState,
    loading: loadingEmotional,
    error: errorEmotional,
    refresh: refreshEmotional,
    recordEmotion
  };
};

export const useConsciousnessWisdom = () => {
  const { wisdom, loadingWisdom, errorWisdom, refreshWisdom, getWisdom } = useConsciousness();
  return {
    wisdom,
    loading: loadingWisdom,
    error: errorWisdom,
    refresh: refreshWisdom,
    getWisdom
  };
};

export const useConsciousnessPersonality = () => {
  const { personality, loadingPersonality, errorPersonality, refreshPersonality } = useConsciousness();
  return {
    personality,
    loading: loadingPersonality,
    error: errorPersonality,
    refresh: refreshPersonality
  };
};

export const useConsciousnessEvolution = () => {
  const { evolution, loadingEvolution, errorEvolution, refreshEvolution } = useConsciousness();
  return {
    evolution,
    loading: loadingEvolution,
    error: errorEvolution,
    refresh: refreshEvolution
  };
};

// ==================== UTILITY HOOKS ====================
export const useConsciousnessInteraction = () => {
  const { interact, recordExperience, recordEmotion } = useConsciousness(false);
  return { interact, recordExperience, recordEmotion };
};

export const useConsciousnessStory = () => {
  const { getStory } = useConsciousness(false);
  return { getStory };
};

export const useConsciousnessInsights = () => {
  const { getPredictions, getInsights } = useConsciousness(false);
  return { getPredictions, getInsights };
};

// ==================== DEFAULT EXPORT ====================
export default useConsciousness;
