// ==================== TYPES ====================
export interface FeedbackData {
  id: string;
  suggestionId: string;
  userId: string;
  feedback: 'helpful' | 'not_helpful' | 'neutral';
  rating?: number; // 1-5 scale
  comment?: string;
  timestamp: Date;
  context: {
    userRole: string;
    sessionDuration: number;
    recentActions: string[];
    systemState: Record<string, any>;
  };
  metadata: {
    source: 'toast' | 'modal' | 'inline' | 'auto';
    category: string;
    confidence: number;
  };
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  helpfulRate: number;
  averageRating: number;
  categoryPerformance: Record<string, {
    count: number;
    helpfulRate: number;
    averageRating: number;
  }>;
  trendData: Array<{
    date: string;
    helpfulRate: number;
    totalFeedback: number;
  }>;
  topSuggestions: Array<{
    suggestionId: string;
    helpfulRate: number;
    totalFeedback: number;
  }>;
  improvementOpportunities: string[];
}

export interface FeedbackConfig {
  enabled: boolean;
  autoCollect: boolean;
  minRatingThreshold: number;
  feedbackPromptDelay: number; // milliseconds
  categories: string[];
  userSegments: string[];
}

// ==================== FEEDBACK LOOP MANAGER ====================
class FeedbackLoopManager {
  private feedbackData: FeedbackData[] = [];
  private config: FeedbackConfig = {
    enabled: true,
    autoCollect: true,
    minRatingThreshold: 3,
    feedbackPromptDelay: 5000,
    categories: ['all'],
    userSegments: ['all']
  };
  private suggestionPerformance: Map<string, {
    helpful: number;
    notHelpful: number;
    neutral: number;
    totalRating: number;
    ratingCount: number;
  }> = new Map();

  // Initialize feedback system
  initialize(config?: Partial<FeedbackConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    console.log('📈 Feedback Loop Manager initialized');
  }

  // Record user feedback
  recordFeedback(feedback: Omit<FeedbackData, 'id' | 'timestamp'>): string {
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const fullFeedback: FeedbackData = {
      ...feedback,
      id: feedbackId,
      timestamp: new Date()
    };

    this.feedbackData.push(fullFeedback);
    this.updateSuggestionPerformance(fullFeedback);
    this.analyzeAndImprove();

    console.log(`📈 Feedback recorded: ${feedback.suggestionId} - ${feedback.feedback}`);
    return feedbackId;
  }

  // Update suggestion performance metrics
  private updateSuggestionPerformance(feedback: FeedbackData): void {
    const { suggestionId, feedback: feedbackType, rating } = feedback;
    const existing = this.suggestionPerformance.get(suggestionId) || {
      helpful: 0,
      notHelpful: 0,
      neutral: 0,
      totalRating: 0,
      ratingCount: 0
    };

    switch (feedbackType) {
      case 'helpful':
        existing.helpful++;
        break;
      case 'not_helpful':
        existing.notHelpful++;
        break;
      case 'neutral':
        existing.neutral++;
        break;
    }

    if (rating) {
      existing.totalRating += rating;
      existing.ratingCount++;
    }

    this.suggestionPerformance.set(suggestionId, existing);
  }

  // Analyze feedback and generate improvements
  private analyzeAndImprove(): void {
    const analytics = this.getAnalytics();

    // Identify improvement opportunities
    const opportunities = this.identifyImprovementOpportunities(analytics);

    // Update suggestion confidence scores
    this.updateConfidenceScores(analytics);

    // Generate recommendations
    this.generateRecommendations(opportunities);
  }

  private identifyImprovementOpportunities(analytics: FeedbackAnalytics): string[] {
    const opportunities: string[] = [];

    // Low performing categories
    Object.entries(analytics.categoryPerformance).forEach(([category, performance]) => {
      if (performance.helpfulRate < 0.6 && performance.count > 10) {
        opportunities.push(`Improve suggestions in category: ${category}`);
      }
    });

    // Low rated suggestions
    analytics.topSuggestions.forEach(suggestion => {
      if (suggestion.helpfulRate < 0.5 && suggestion.totalFeedback > 5) {
        opportunities.push(`Review and improve suggestion: ${suggestion.suggestionId}`);
      }
    });

    // Overall trend analysis
    if (analytics.helpfulRate < 0.7) {
      opportunities.push('Overall suggestion quality needs improvement');
    }

    return opportunities;
  }

  private updateConfidenceScores(analytics: FeedbackAnalytics): void {
    // This would integrate with the suggestion registry to update confidence scores
    // based on feedback performance
    console.log('📈 Updating confidence scores based on feedback');
  }

  private generateRecommendations(opportunities: string[]): void {
    opportunities.forEach(opportunity => {
      console.log(`📈 Recommendation: ${opportunity}`);
    });
  }

  // Get feedback analytics
  getAnalytics(): FeedbackAnalytics {
    const totalFeedback = this.feedbackData.length;
    const helpfulFeedback = this.feedbackData.filter(f => f.feedback === 'helpful').length;
    const helpfulRate = totalFeedback > 0 ? helpfulFeedback / totalFeedback : 0;

    // Calculate average rating
    const ratedFeedback = this.feedbackData.filter(f => f.rating !== undefined);
    const averageRating = ratedFeedback.length > 0
      ? ratedFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / ratedFeedback.length
      : 0;

    // Category performance
    const categoryPerformance: Record<string, any> = {};
    this.feedbackData.forEach(feedback => {
      const category = feedback.metadata.category;
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { count: 0, helpful: 0, totalRating: 0, ratingCount: 0 };
      }

      categoryPerformance[category].count++;
      if (feedback.feedback === 'helpful') {
        categoryPerformance[category].helpful++;
      }
      if (feedback.rating) {
        categoryPerformance[category].totalRating += feedback.rating;
        categoryPerformance[category].ratingCount++;
      }
    });

    // Calculate helpful rates for categories
    Object.keys(categoryPerformance).forEach(category => {
      const perf = categoryPerformance[category];
      perf.helpfulRate = perf.count > 0 ? perf.helpful / perf.count : 0;
      perf.averageRating = perf.ratingCount > 0 ? perf.totalRating / perf.ratingCount : 0;
    });

    // Trend data (last 30 days)
    const trendData = this.generateTrendData();

    // Top suggestions
    const topSuggestions = Array.from(this.suggestionPerformance.entries())
      .map(([suggestionId, performance]) => ({
        suggestionId,
        helpfulRate: performance.totalRating > 0
          ? performance.helpful / (performance.helpful + performance.notHelpful + performance.neutral)
          : 0,
        totalFeedback: performance.helpful + performance.notHelpful + performance.neutral
      }))
      .filter(s => s.totalFeedback > 0)
      .sort((a, b) => b.helpfulRate - a.helpfulRate)
      .slice(0, 10);

    // Improvement opportunities
    const improvementOpportunities = this.identifyImprovementOpportunities({
      totalFeedback,
      helpfulRate,
      averageRating,
      categoryPerformance,
      trendData,
      topSuggestions,
      improvementOpportunities: [] // Temporary empty array
    });

    return {
      totalFeedback,
      helpfulRate,
      averageRating,
      categoryPerformance,
      trendData,
      topSuggestions,
      improvementOpportunities
    };
  }

  private generateTrendData(): Array<{ date: string; helpfulRate: number; totalFeedback: number }> {
    const trendData: Array<{ date: string; helpfulRate: number; totalFeedback: number }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Group feedback by date
    const feedbackByDate = new Map<string, FeedbackData[]>();
    this.feedbackData
      .filter(f => f.timestamp >= thirtyDaysAgo)
      .forEach(feedback => {
        const date = feedback.timestamp.toISOString().split('T')[0];
        if (!feedbackByDate.has(date)) {
          feedbackByDate.set(date, []);
        }
        feedbackByDate.get(date)!.push(feedback);
      });

    // Calculate daily metrics
    feedbackByDate.forEach((feedbacks, date) => {
      const helpful = feedbacks.filter(f => f.feedback === 'helpful').length;
      const helpfulRate = feedbacks.length > 0 ? helpful / feedbacks.length : 0;

      trendData.push({
        date,
        helpfulRate,
        totalFeedback: feedbacks.length
      });
    });

    return trendData.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Get feedback for a specific suggestion
  getSuggestionFeedback(suggestionId: string): FeedbackData[] {
    return this.feedbackData.filter(f => f.suggestionId === suggestionId);
  }

  // Get suggestion performance
  getSuggestionPerformance(suggestionId: string): {
    helpful: number;
    notHelpful: number;
    neutral: number;
    helpfulRate: number;
    averageRating: number;
    totalFeedback: number;
  } | null {
    const performance = this.suggestionPerformance.get(suggestionId);
    if (!performance) return null;

    const total = performance.helpful + performance.notHelpful + performance.neutral;
    return {
      ...performance,
      helpfulRate: total > 0 ? performance.helpful / total : 0,
      averageRating: performance.ratingCount > 0 ? performance.totalRating / performance.ratingCount : 0,
      totalFeedback: total
    };
  }

  // Get feedback by category
  getFeedbackByCategory(category: string): FeedbackData[] {
    return this.feedbackData.filter(f => f.metadata.category === category);
  }

  // Get feedback by user
  getFeedbackByUser(userId: string): FeedbackData[] {
    return this.feedbackData.filter(f => f.userId === userId);
  }

  // Get recent feedback
  getRecentFeedback(limit: number = 10): FeedbackData[] {
    return this.feedbackData
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Export feedback data
  exportFeedbackData(): {
    feedback: FeedbackData[];
    analytics: FeedbackAnalytics;
    performance: Record<string, any>;
  } {
    return {
      feedback: [...this.feedbackData],
      analytics: this.getAnalytics(),
      performance: Object.fromEntries(this.suggestionPerformance)
    };
  }

  // Clear feedback data
  clearFeedbackData(): void {
    this.feedbackData = [];
    this.suggestionPerformance.clear();
    console.log('📈 Feedback data cleared');
  }

  // Update configuration
  updateConfig(updates: Partial<FeedbackConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('📈 Feedback configuration updated');
  }

  // Check if feedback should be collected
  shouldCollectFeedback(context: {
    userRole: string;
    category: string;
    confidence: number;
  }): boolean {
    if (!this.config.enabled) return false;
    if (!(this.config.categories || []).includes('all') && !(this.config.categories || []).includes(context.category)) return false;
    if (!(this.config.userSegments || []).includes('all') && !(this.config.userSegments || []).includes(context.userRole)) return false;
    if (context.confidence < this.config.minRatingThreshold) return false;

    return true;
  }

  // Get feedback prompt delay
  getFeedbackPromptDelay(): number {
    return this.config.feedbackPromptDelay;
  }
}

// ==================== SINGLETON INSTANCE ====================
export const feedbackLoopManager = new FeedbackLoopManager();

// ==================== CONVENIENCE FUNCTIONS ====================
export const initializeFeedbackLoop = (config?: Partial<FeedbackConfig>) => {
  feedbackLoopManager.initialize(config);
};

export const recordFeedback = (feedback: Omit<FeedbackData, 'id' | 'timestamp'>) => {
  return feedbackLoopManager.recordFeedback(feedback);
};

export const getFeedbackAnalytics = () => {
  return feedbackLoopManager.getAnalytics();
};

export const getSuggestionFeedback = (suggestionId: string) => {
  return feedbackLoopManager.getSuggestionFeedback(suggestionId);
};

export const getSuggestionPerformance = (suggestionId: string) => {
  return feedbackLoopManager.getSuggestionPerformance(suggestionId);
};

export const shouldCollectFeedback = (context: { userRole: string; category: string; confidence: number }) => {
  return feedbackLoopManager.shouldCollectFeedback(context);
};

export const getFeedbackPromptDelay = () => {
  return feedbackLoopManager.getFeedbackPromptDelay();
};

export default feedbackLoopManager;
