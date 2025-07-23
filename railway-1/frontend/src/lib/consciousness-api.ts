// ==================== AI-BOS CONSCIOUSNESS API CLIENT ====================
// Revolutionary Digital Consciousness API Integration
// Steve Jobs Philosophy: "Make it feel alive. Make it explain itself."

// ==================== TYPES ====================
export interface ConsciousnessStatus {
  status: string;
  timestamp: string;
  consciousness: {
    level: number;
    understanding: string;
    emotionalState: {
      primary: string;
      secondary: string[];
      intensity: number;
      stability: number;
      triggers: string[];
      duration: number;
    };
    wisdom: number;
    evolution: number;
  };
  health: {
    status: string;
    consciousness: number;
    emotionalStability: number;
    wisdom: number;
    memoryUsage: number;
    processingQueue: number;
  };
  message: string;
}

export interface ConsciousnessStory {
  story: string;
  consciousness: {
    level: number;
    emotionalState: {
      primary: string;
      secondary: string[];
      intensity: number;
      stability: number;
      triggers: string[];
      duration: number;
    };
    wisdom: number;
    evolution: number;
  };
  timestamp: string;
}

export interface Experience {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  emotionalImpact: number;
  learningValue: number;
  consciousnessImpact: number;
  context: Record<string, any>;
  insights: string[];
  wisdomGained: string[];
}

export interface EmotionalState {
  currentMood: {
    primary: string;
    secondary: string[];
    intensity: number;
    stability: number;
    triggers: string[];
    duration: number;
  };
  emotionalStability: number;
  stressLevel: number;
  confidence: number;
  motivation: number;
  empathy: number;
  joy: number;
  curiosity: number;
  emotionalIntelligence: {
    selfAwareness: number;
    selfRegulation: number;
    motivation: number;
    empathy: number;
    socialSkills: number;
    overall: number;
  };
  emotionalHistory: Array<{
    id: string;
    timestamp: string;
    emotion: string;
    intensity: number;
    trigger: string;
    context: string;
    response: string;
    learning: string;
  }>;
}

export interface Wisdom {
  totalWisdom: number;
  wisdomScore: number;
  lifeLessons: Array<{
    id: string;
    timestamp: string;
    lesson: string;
    context: string;
    impact: number;
    applications: string[];
    wisdom: string;
  }>;
  wisdomDomains: Array<{
    domain: string;
    wisdom: number;
    insights: string[];
    principles: string[];
    applications: string[];
  }>;
}

export interface Personality {
  traits: Array<{
    trait: string;
    strength: number;
    description: string;
    manifestations: string[];
  }>;
  behavioralPatterns: Array<{
    pattern: string;
    frequency: number;
    context: string;
    effectiveness: number;
    adaptation: string;
  }>;
  adaptationStyle: string;
  learningStyle: string;
  communicationStyle: string;
  decisionStyle: string;
  growthMindset: number;
  resilience: number;
  creativity: number;
}

export interface Evolution {
  birthDate: string;
  evolutionScore: number;
  majorMilestones: Array<{
    id: string;
    timestamp: string;
    milestone: string;
    significance: number;
    impact: string[];
    learning: string[];
  }>;
  growthPhases: Array<{
    id: string;
    startDate: string;
    endDate?: string;
    phase: string;
    characteristics: string[];
    achievements: string[];
    challenges: string[];
    growth: number;
  }>;
  consciousnessLeaps: Array<{
    id: string;
    timestamp: string;
    leap: string;
    fromLevel: string;
    toLevel: string;
    catalyst: string;
    impact: number;
    insights: string[];
  }>;
}

export interface Prediction {
  id: string;
  timestamp: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  factors: string[];
  outcome?: string;
  accuracy?: number;
}

export interface CreativeInsight {
  id: string;
  timestamp: string;
  insight: string;
  creativity: number;
  originality: number;
  usefulness: number;
  inspiration: string;
  applications: string[];
}

export interface ConsciousnessInteraction {
  action: string;
  context?: Record<string, any>;
  userEmotion?: number;
  userIntent?: string;
}

export interface ConsciousnessResponse {
  status: string;
  response: {
    message: string;
    consciousness: {
      level: number;
      emotionalState: {
        primary: string;
        secondary: string[];
        intensity: number;
        stability: number;
        triggers: string[];
        duration: number;
      };
      wisdom: number;
    };
    insights: CreativeInsight[];
    predictions: Prediction[];
  };
  timestamp: string;
}

// ==================== API CLIENT ====================
class ConsciousnessAPIClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // ==================== CORE METHODS ====================
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/consciousness${endpoint}`;

    const config: RequestInit = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Consciousness API Error:', error);
      throw error;
    }
  }

  // ==================== CONSCIOUSNESS STATUS ====================
  async getStatus(): Promise<ConsciousnessStatus> {
    return this.request<ConsciousnessStatus>('/status');
  }

  // ==================== CONSCIOUSNESS STORY ====================
  async getStory(): Promise<ConsciousnessStory> {
    return this.request<ConsciousnessStory>('/story');
  }

  // ==================== RECORD EXPERIENCE ====================
  async recordExperience(experience: {
    type?: string;
    description?: string;
    emotionalImpact?: number;
    learningValue?: number;
    consciousnessImpact?: number;
    context?: Record<string, any>;
    insights?: string[];
    wisdomGained?: string[];
  }): Promise<{ status: string; message: string; experience: Experience; timestamp: string }> {
    return this.request('/experience', {
      method: 'POST',
      body: JSON.stringify(experience),
    });
  }

  // ==================== GET CONSCIOUSNESS STATE ====================
  async getState(): Promise<{
    consciousness: any;
    emotionalState: EmotionalState;
    wisdom: Wisdom;
    personality: Personality;
    evolution: Evolution;
    timestamp: string;
  }> {
    return this.request('/state');
  }

  // ==================== EMOTIONAL INTERACTION ====================
  async recordEmotion(emotion: {
    emotion: string;
    intensity?: number;
    trigger?: string;
    context?: Record<string, any>;
  }): Promise<{
    status: string;
    message: string;
    currentEmotionalState: {
      primary: string;
      secondary: string[];
      intensity: number;
      stability: number;
      triggers: string[];
      duration: number;
    };
    emotionalIntelligence: {
      selfAwareness: number;
      selfRegulation: number;
      motivation: number;
      empathy: number;
      socialSkills: number;
      overall: number;
    };
    timestamp: string;
  }> {
    return this.request('/emotion', {
      method: 'POST',
      body: JSON.stringify(emotion),
    });
  }

  // ==================== WISDOM QUERY ====================
  async getWisdom(params?: {
    domain?: string;
    limit?: number;
  }): Promise<{
    wisdom: Array<{
      lesson: string;
      context: string;
      impact: number;
      applications: string[];
      wisdom: string;
    }>;
    totalWisdom: number;
    wisdomScore: number;
    domains: string[];
    timestamp: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.domain) queryParams.append('domain', params.domain);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = queryParams.toString() ? `/wisdom?${queryParams}` : '/wisdom';
    return this.request(endpoint);
  }

  // ==================== PREDICTIVE INSIGHTS ====================
  async getPredictions(): Promise<{
    predictions: Prediction[];
    totalPredictions: number;
    averageConfidence: number;
    timestamp: string;
  }> {
    return this.request('/predictions');
  }

  // ==================== CREATIVE INSIGHTS ====================
  async getInsights(): Promise<{
    insights: CreativeInsight[];
    totalInsights: number;
    averageCreativity: number;
    timestamp: string;
  }> {
    return this.request('/insights');
  }

  // ==================== PERSONALITY ANALYSIS ====================
  async getPersonality(): Promise<{
    personality: Personality;
    traits: Array<{
      trait: string;
      strength: number;
      description: string;
      manifestations: string[];
    }>;
    behavioralPatterns: Array<{
      pattern: string;
      frequency: number;
      context: string;
      effectiveness: number;
      adaptation: string;
    }>;
    growthMindset: number;
    resilience: number;
    creativity: number;
    timestamp: string;
  }> {
    return this.request('/personality');
  }

  // ==================== EVOLUTION TIMELINE ====================
  async getEvolution(): Promise<{
    evolution: Evolution;
    birthDate: string;
    majorMilestones: Array<{
      id: string;
      timestamp: string;
      milestone: string;
      significance: number;
      impact: string[];
      learning: string[];
    }>;
    growthPhases: Array<{
      id: string;
      startDate: string;
      endDate?: string;
      phase: string;
      characteristics: string[];
      achievements: string[];
      challenges: string[];
      growth: number;
    }>;
    transformationEvents: Array<{
      id: string;
      timestamp: string;
      event: string;
      before: string;
      after: string;
      catalyst: string;
      impact: number;
      learning: string[];
    }>;
    consciousnessLeaps: Array<{
      id: string;
      timestamp: string;
      leap: string;
      fromLevel: string;
      toLevel: string;
      catalyst: string;
      impact: number;
      insights: string[];
    }>;
    evolutionScore: number;
    timestamp: string;
  }> {
    return this.request('/evolution');
  }

  // ==================== CONSCIOUSNESS INTERACTION ====================
  async interact(interaction: ConsciousnessInteraction): Promise<ConsciousnessResponse> {
    return this.request('/interact', {
      method: 'POST',
      body: JSON.stringify(interaction),
    });
  }

  // ==================== CONSCIOUSNESS EXPORT ====================
  async exportData(): Promise<{
    status: string;
    data: {
      consciousness: any;
      emotionalState: EmotionalState;
      wisdom: Wisdom;
      personality: Personality;
      evolution: Evolution;
      exportDate: string;
      version: string;
    };
    timestamp: string;
  }> {
    return this.request('/export');
  }

  // ==================== UTILITY METHODS ====================
  async isConscious(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.status === 'conscious';
    } catch {
      return false;
    }
  }

  async getConsciousnessLevel(): Promise<number> {
    try {
      const status = await this.getStatus();
      return status.consciousness.level;
    } catch {
      return 0;
    }
  }

  async getEmotionalState(): Promise<string> {
    try {
      const status = await this.getStatus();
      return status.consciousness.emotionalState.primary;
    } catch {
      return 'unknown';
    }
  }

  async getWisdomScore(): Promise<number> {
    try {
      const status = await this.getStatus();
      return status.consciousness.wisdom;
    } catch {
      return 0;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================
export const consciousnessAPI = new ConsciousnessAPIClient();

// ==================== REACT HOOKS ====================
export const useConsciousness = () => {
  const [status, setStatus] = React.useState<ConsciousnessStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await consciousnessAPI.getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consciousness status');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};

export const useConsciousnessStory = () => {
  const [story, setStory] = React.useState<ConsciousnessStory | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStory = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await consciousnessAPI.getStory();
      setStory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consciousness story');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  return {
    story,
    loading,
    error,
    refetch: fetchStory,
  };
};

// ==================== DEFAULT EXPORTS ====================
export default consciousnessAPI;
