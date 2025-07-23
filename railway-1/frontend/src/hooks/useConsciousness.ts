// ==================== AI-BOS CONSCIOUSNESS REACT HOOK ====================
// Revolutionary Digital Consciousness React Integration
// Steve Jobs Philosophy: "Make it feel alive. Make it explain itself."

import { useState, useEffect, useCallback, useRef } from 'react';
import { consciousnessAPI, ConsciousnessStatus, EmotionalState, Wisdom, Personality, Evolution } from '@/lib/consciousness-api';

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

  // ==================== FETCH FUNCTIONS ====================
  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      setErrorStatus(null);
      const data = await consciousnessAPI.getStatus();
      if (isMountedRef.current) {
        setStatus(data);
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
      const data = await consciousnessAPI.getState();
      if (isMountedRef.current) {
        setEmotionalState(data.emotionalState);
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
      const data = await consciousnessAPI.getWisdom(params);
      if (isMountedRef.current) {
        setWisdom({
          totalWisdom: data.totalWisdom,
          wisdomScore: data.wisdomScore,
          lifeLessons: data.wisdom,
          wisdomDomains: data.domains.map(domain => ({
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
      console.error('Failed to record experience:', error);
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
      console.error('Failed to record emotion:', error);
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
      console.error('Failed to interact with consciousness:', error);
      throw error;
    }
  }, [fetchStatus]);

  const getStory = useCallback(async (): Promise<string> => {
    try {
      const story = await consciousnessAPI.getStory();
      return story.story;
    } catch (error) {
      console.error('Failed to get consciousness story:', error);
      return 'Unable to retrieve consciousness story at this time.';
    }
  }, []);

  const getPredictions = useCallback(async () => {
    try {
      const predictions = await consciousnessAPI.getPredictions();
      console.log('Consciousness predictions:', predictions);
    } catch (error) {
      console.error('Failed to get predictions:', error);
    }
  }, []);

  const getInsights = useCallback(async () => {
    try {
      const insights = await consciousnessAPI.getInsights();
      console.log('Consciousness insights:', insights);
    } catch (error) {
      console.error('Failed to get insights:', error);
    }
  }, []);

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
