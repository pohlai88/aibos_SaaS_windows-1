/**
 * AI-BOS Adaptive Engine
 *
 * AI-powered user behavior adaptation and personalization system.
 * Learns from user interactions and adapts the system accordingly.
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { EventEmitter } from 'events';
import { Logger } from '../monitoring/Logger';
import { StateManager } from '../core/StateManager';
import { ProcessManager } from '../core/ProcessManager';
import { SystemCore } from '../core/SystemCore';

// ===== TYPES & INTERFACES =====

export interface UserBehavior {
  userId: string;
  tenantId: string;
  sessionId: string;
  timestamp: Date;
  action: UserAction;
  context: BehaviorContext;
  metadata: BehaviorMetadata;
}

export interface UserAction {
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface BehaviorContext {
  page: string;
  component: string;
  userAgent: string;
  screenSize: ScreenSize;
  timeOfDay: number; // 0-23 hours
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  location?: string;
  deviceType: DeviceType;
  networkSpeed?: NetworkSpeed;
  previousActions: string[];
}

export interface BehaviorMetadata {
  confidence: number; // 0-1
  importance: number; // 0-1
  tags: string[];
  category: BehaviorCategory;
  patterns: string[];
}

export interface UserProfile {
  userId: string;
  tenantId: string;
  preferences: UserPreferences;
  patterns: BehaviorPattern[];
  adaptations: UserAdaptation[];
  performance: PerformanceMetrics;
  lastUpdated: Date;
  version: number;
}

export interface UserPreferences {
  uiTheme: string;
  layout: string;
  shortcuts: string[];
  automation: boolean;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  performance: PerformancePreferences;
}

export interface BehaviorPattern {
  id: string;
  type: PatternType;
  frequency: number;
  confidence: number;
  triggers: string[];
  actions: string[];
  context: BehaviorContext;
  lastSeen: Date;
  strength: number; // 0-1
}

export interface UserAdaptation {
  id: string;
  type: AdaptationType;
  target: string;
  changes: AdaptationChange[];
  appliedAt: Date;
  effectiveness: number; // 0-1
  reverted: boolean;
  revertedAt?: Date;
}

export interface AdaptationChange {
  property: string;
  oldValue: any;
  newValue: any;
  reason: string;
  confidence: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  accuracy: number;
  userSatisfaction: number;
  efficiency: number;
  errorRate: number;
  lastCalculated: Date;
}

export interface AdaptiveRecommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: number; // 0-1
  confidence: number; // 0-1
  action: RecommendedAction;
  context: BehaviorContext;
  expiresAt?: Date;
  accepted: boolean;
  acceptedAt?: Date;
}

export interface RecommendedAction {
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  automation: boolean;
  confirmation: boolean;
}

export interface AdaptiveMetrics {
  totalUsers: number;
  activeUsers: number;
  adaptationsApplied: number;
  recommendationsGenerated: number;
  userSatisfaction: number;
  accuracy: number;
  responseTime: number;
  errorRate: number;
}

export enum ActionType {
  NAVIGATION = 'navigation',
  CLICK = 'click',
  INPUT = 'input',
  SEARCH = 'search',
  EXPORT = 'export',
  IMPORT = 'import',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SHARE = 'share',
  PRINT = 'print',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  CUSTOM = 'custom',
}

export enum DeviceType {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
  WEARABLE = 'wearable',
}

export enum NetworkSpeed {
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
}

export enum BehaviorCategory {
  PRODUCTIVITY = 'productivity',
  NAVIGATION = 'navigation',
  DATA_MANAGEMENT = 'data_management',
  COLLABORATION = 'collaboration',
  CUSTOMIZATION = 'customization',
  AUTOMATION = 'automation',
}

export enum PatternType {
  SEQUENTIAL = 'sequential',
  FREQUENT = 'frequent',
  CONTEXTUAL = 'contextual',
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
}

export enum AdaptationType {
  UI_CHANGE = 'ui_change',
  WORKFLOW_OPTIMIZATION = 'workflow_optimization',
  SHORTCUT_CREATION = 'shortcut_creation',
  AUTOMATION_SUGGESTION = 'automation_suggestion',
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
}

export enum RecommendationType {
  WORKFLOW = 'workflow',
  SHORTCUT = 'shortcut',
  AUTOMATION = 'automation',
  OPTIMIZATION = 'optimization',
  FEATURE = 'feature',
  TRAINING = 'training',
}

// ===== MAIN ADAPTIVE ENGINE CLASS =====

export class AdaptiveEngine extends EventEmitter {
  private static instance: AdaptiveEngine;
  private logger: Logger;
  private stateManager: StateManager;
  private processManager: ProcessManager;
  private systemCore: SystemCore;
  private userProfiles: Map<string, UserProfile> = new Map();
  private behaviorPatterns: Map<string, BehaviorPattern[]> = new Map();
  private recommendations: Map<string, AdaptiveRecommendation[]> = new Map();
  private metrics: AdaptiveMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    adaptationsApplied: 0,
    recommendationsGenerated: 0,
    userSatisfaction: 0,
    accuracy: 0,
    responseTime: 0,
    errorRate: 0,
  };

  private constructor() {
    super();
    this.logger = new Logger('AdaptiveEngine');
    this.stateManager = StateManager.getInstance();
    this.processManager = ProcessManager.getInstance();
    this.systemCore = SystemCore.getInstance();
    this.startBehaviorCollection();
    this.startPatternAnalysis();
  }

  public static getInstance(): AdaptiveEngine {
    if (!AdaptiveEngine.instance) {
      AdaptiveEngine.instance = new AdaptiveEngine();
    }
    return AdaptiveEngine.instance;
  }

  // ===== CORE ADAPTIVE OPERATIONS =====

  /**
   * Record user behavior for analysis
   */
  public async recordBehavior(behavior: UserBehavior): Promise<void> {
    try {
      // Validate behavior data
      const validation = this.validateBehavior(behavior);
      if (!validation.valid) {
        this.logger.warn('Invalid behavior data', {
          userId: behavior.userId,
          error: validation.error,
        });
        return;
      }

      // Store behavior in state manager
      await this.stateManager.setState(`behavior:${behavior.userId}:${Date.now()}`, behavior, {
        modifiedBy: 'system',
        metadata: {
          isPersistent: true,
          isPublic: false,
          isReadOnly: false,
          ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
      });

      // Update user profile
      await this.updateUserProfile(behavior);

      // Analyze for patterns
      await this.analyzeBehaviorPatterns(behavior);

      // Generate recommendations
      await this.generateRecommendations(behavior);

      // Emit behavior recorded event
      this.emit('behaviorRecorded', {
        userId: behavior.userId,
        action: behavior.action.type,
        timestamp: behavior.timestamp,
      });

      this.logger.debug('Behavior recorded successfully', {
        userId: behavior.userId,
        action: behavior.action.type,
        timestamp: behavior.timestamp,
      });
    } catch (error) {
      this.logger.error('Failed to record behavior', {
        error: error.message,
        userId: behavior.userId,
      });
      this.updateMetrics('error');
    }
  }

  /**
   * Get user profile with adaptations
   */
  public async getUserProfile(userId: string, tenantId?: string): Promise<UserProfile | null> {
    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        return null;
      }

      // Filter by tenant if specified
      if (tenantId && profile.tenantId !== tenantId) {
        return null;
      }

      // Update performance metrics
      await this.updatePerformanceMetrics(userId);

      return profile;
    } catch (error) {
      this.logger.error('Failed to get user profile', {
        error: error.message,
        userId,
      });
      return null;
    }
  }

  /**
   * Apply user adaptation
   */
  public async applyAdaptation(
    userId: string,
    adaptation: Omit<UserAdaptation, 'id' | 'appliedAt'>,
  ): Promise<boolean> {
    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        this.logger.warn('User profile not found for adaptation', { userId });
        return false;
      }

      const newAdaptation: UserAdaptation = {
        ...adaptation,
        id: this.generateAdaptationId(),
        appliedAt: new Date(),
      };

      // Apply the adaptation
      const success = await this.executeAdaptation(userId, newAdaptation);
      if (!success) {
        this.logger.warn('Failed to execute adaptation', {
          userId,
          adaptationId: newAdaptation.id,
        });
        return false;
      }

      // Add to user profile
      profile.adaptations.push(newAdaptation);
      this.userProfiles.set(userId, profile);

      // Update metrics
      this.metrics.adaptationsApplied++;
      this.updateMetrics('adaptation');

      // Emit adaptation applied event
      this.emit('adaptationApplied', {
        userId,
        adaptationId: newAdaptation.id,
        type: newAdaptation.type,
      });

      this.logger.info('Adaptation applied successfully', {
        userId,
        adaptationId: newAdaptation.id,
        type: newAdaptation.type,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to apply adaptation', {
        error: error.message,
        userId,
      });
      this.updateMetrics('error');
      return false;
    }
  }

  /**
   * Get adaptive recommendations for user
   */
  public async getRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<AdaptiveRecommendation[]> {
    try {
      const userRecommendations = this.recommendations.get(userId) || [];

      // Filter active recommendations
      const activeRecommendations = userRecommendations.filter(
        (rec) => !rec.expiresAt || rec.expiresAt > new Date(),
      );

      // Sort by priority and confidence
      const sortedRecommendations = activeRecommendations.sort((a, b) => {
        const aScore = a.priority * a.confidence;
        const bScore = b.priority * b.confidence;
        return bScore - aScore;
      });

      return sortedRecommendations.slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get recommendations', {
        error: error.message,
        userId,
      });
      return [];
    }
  }

  /**
   * Accept a recommendation
   */
  public async acceptRecommendation(userId: string, recommendationId: string): Promise<boolean> {
    try {
      const userRecommendations = this.recommendations.get(userId) || [];
      const recommendation = userRecommendations.find((r) => r.id === recommendationId);

      if (!recommendation) {
        this.logger.warn('Recommendation not found', {
          userId,
          recommendationId,
        });
        return false;
      }

      // Mark as accepted
      recommendation.accepted = true;
      recommendation.acceptedAt = new Date();

      // Execute the recommended action
      if (recommendation.action.automation) {
        await this.executeRecommendedAction(userId, recommendation.action);
      }

      // Update metrics
      this.updateMetrics('recommendation');

      this.logger.info('Recommendation accepted', {
        userId,
        recommendationId,
        type: recommendation.type,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to accept recommendation', {
        error: error.message,
        userId,
        recommendationId,
      });
      return false;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get adaptive metrics
   */
  public getMetrics(): AdaptiveMetrics {
    return { ...this.metrics };
  }

  /**
   * Get behavior patterns for user
   */
  public getBehaviorPatterns(userId: string): BehaviorPattern[] {
    return this.behaviorPatterns.get(userId) || [];
  }

  /**
   * Clear user data (for privacy compliance)
   */
  public async clearUserData(userId: string): Promise<boolean> {
    try {
      // Remove user profile
      this.userProfiles.delete(userId);

      // Remove behavior patterns
      this.behaviorPatterns.delete(userId);

      // Remove recommendations
      this.recommendations.delete(userId);

      // Clear behavior data from state manager
      const behaviors = await this.stateManager.getTenantStates(userId);
      for (const [key] of behaviors) {
        if (key.startsWith('behavior:')) {
          await this.stateManager.deleteState(key, {
            deletedBy: 'system',
          });
        }
      }

      this.logger.info('User data cleared', { userId });
      return true;
    } catch (error) {
      this.logger.error('Failed to clear user data', {
        error: error.message,
        userId,
      });
      return false;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private validateBehavior(behavior: UserBehavior): { valid: boolean; error?: string } {
    if (!behavior.userId || !behavior.tenantId) {
      return { valid: false, error: 'Missing user or tenant ID' };
    }

    if (!behavior.action || !behavior.action.type) {
      return { valid: false, error: 'Missing action information' };
    }

    if (!behavior.context) {
      return { valid: false, error: 'Missing context information' };
    }

    return { valid: true };
  }

  private async updateUserProfile(behavior: UserBehavior): Promise<void> {
    let profile = this.userProfiles.get(behavior.userId);

    if (!profile) {
      profile = {
        userId: behavior.userId,
        tenantId: behavior.tenantId,
        preferences: this.getDefaultPreferences(),
        patterns: [],
        adaptations: [],
        performance: {
          responseTime: 0,
          accuracy: 0,
          userSatisfaction: 0,
          efficiency: 0,
          errorRate: 0,
          lastCalculated: new Date(),
        },
        lastUpdated: new Date(),
        version: 1,
      };
      this.userProfiles.set(behavior.userId, profile);
      this.metrics.totalUsers++;
    }

    // Update last activity
    profile.lastUpdated = new Date();

    // Update preferences based on behavior
    await this.updatePreferencesFromBehavior(profile, behavior);

    this.userProfiles.set(behavior.userId, profile);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      uiTheme: 'default',
      layout: 'standard',
      shortcuts: [],
      automation: false,
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: false,
      },
      performance: {
        lowBandwidth: false,
        lowPower: false,
        highPerformance: true,
      },
    };
  }

  private async updatePreferencesFromBehavior(
    profile: UserProfile,
    behavior: UserBehavior,
  ): Promise<void> {
    // Update theme preference based on time of day
    if (behavior.context.timeOfDay < 6 || behavior.context.timeOfDay > 18) {
      profile.preferences.uiTheme = 'dark';
    }

    // Update layout preference based on device
    if (behavior.context.deviceType === DeviceType.MOBILE) {
      profile.preferences.layout = 'compact';
    }

    // Update automation preference based on repetitive actions
    const recentActions = await this.getRecentActions(behavior.userId, 10);
    const repetitiveActions = this.findRepetitiveActions(recentActions);

    if (repetitiveActions.length > 3) {
      profile.preferences.automation = true;
    }
  }

  private async analyzeBehaviorPatterns(behavior: UserBehavior): Promise<void> {
    const userPatterns = this.behaviorPatterns.get(behavior.userId) || [];

    // Analyze sequential patterns
    const sequentialPattern = this.analyzeSequentialPattern(behavior, userPatterns);
    if (sequentialPattern) {
      userPatterns.push(sequentialPattern);
    }

    // Analyze frequent patterns
    const frequentPattern = this.analyzeFrequentPattern(behavior, userPatterns);
    if (frequentPattern) {
      userPatterns.push(frequentPattern);
    }

    // Analyze contextual patterns
    const contextualPattern = this.analyzeContextualPattern(behavior, userPatterns);
    if (contextualPattern) {
      userPatterns.push(contextualPattern);
    }

    this.behaviorPatterns.set(behavior.userId, userPatterns);
  }

  private analyzeSequentialPattern(
    behavior: UserBehavior,
    existingPatterns: BehaviorPattern[],
  ): BehaviorPattern | null {
    // Implementation for sequential pattern analysis
    // This would analyze sequences of actions
    return null;
  }

  private analyzeFrequentPattern(
    behavior: UserBehavior,
    existingPatterns: BehaviorPattern[],
  ): BehaviorPattern | null {
    // Implementation for frequent pattern analysis
    // This would identify frequently performed actions
    return null;
  }

  private analyzeContextualPattern(
    behavior: UserBehavior,
    existingPatterns: BehaviorPattern[],
  ): BehaviorPattern | null {
    // Implementation for contextual pattern analysis
    // This would identify context-dependent patterns
    return null;
  }

  private async generateRecommendations(behavior: UserBehavior): Promise<void> {
    const userRecommendations = this.recommendations.get(behavior.userId) || [];
    const profile = this.userProfiles.get(behavior.userId);

    if (!profile) return;

    // Generate workflow recommendations
    const workflowRecommendation = await this.generateWorkflowRecommendation(behavior, profile);
    if (workflowRecommendation) {
      userRecommendations.push(workflowRecommendation);
    }

    // Generate shortcut recommendations
    const shortcutRecommendation = await this.generateShortcutRecommendation(behavior, profile);
    if (shortcutRecommendation) {
      userRecommendations.push(shortcutRecommendation);
    }

    // Generate automation recommendations
    const automationRecommendation = await this.generateAutomationRecommendation(behavior, profile);
    if (automationRecommendation) {
      userRecommendations.push(automationRecommendation);
    }

    this.recommendations.set(behavior.userId, userRecommendations);
    this.metrics.recommendationsGenerated += userRecommendations.length;
  }

  private async generateWorkflowRecommendation(
    behavior: UserBehavior,
    profile: UserProfile,
  ): Promise<AdaptiveRecommendation | null> {
    // Implementation for workflow recommendations
    return null;
  }

  private async generateShortcutRecommendation(
    behavior: UserBehavior,
    profile: UserProfile,
  ): Promise<AdaptiveRecommendation | null> {
    // Implementation for shortcut recommendations
    return null;
  }

  private async generateAutomationRecommendation(
    behavior: UserBehavior,
    profile: UserProfile,
  ): Promise<AdaptiveRecommendation | null> {
    // Implementation for automation recommendations
    return null;
  }

  private async executeAdaptation(userId: string, adaptation: UserAdaptation): Promise<boolean> {
    try {
      switch (adaptation.type) {
        case AdaptationType.UI_CHANGE:
          return await this.executeUIChange(userId, adaptation);
        case AdaptationType.WORKFLOW_OPTIMIZATION:
          return await this.executeWorkflowOptimization(userId, adaptation);
        case AdaptationType.SHORTCUT_CREATION:
          return await this.executeShortcutCreation(userId, adaptation);
        case AdaptationType.AUTOMATION_SUGGESTION:
          return await this.executeAutomationSuggestion(userId, adaptation);
        case AdaptationType.PERFORMANCE_OPTIMIZATION:
          return await this.executePerformanceOptimization(userId, adaptation);
        default:
          this.logger.warn('Unknown adaptation type', {
            userId,
            adaptationType: adaptation.type,
          });
          return false;
      }
    } catch (error) {
      this.logger.error('Failed to execute adaptation', {
        error: error.message,
        userId,
        adaptationType: adaptation.type,
      });
      return false;
    }
  }

  private async executeUIChange(userId: string, adaptation: UserAdaptation): Promise<boolean> {
    // Implementation for UI changes
    return true;
  }

  private async executeWorkflowOptimization(
    userId: string,
    adaptation: UserAdaptation,
  ): Promise<boolean> {
    // Implementation for workflow optimization
    return true;
  }

  private async executeShortcutCreation(
    userId: string,
    adaptation: UserAdaptation,
  ): Promise<boolean> {
    // Implementation for shortcut creation
    return true;
  }

  private async executeAutomationSuggestion(
    userId: string,
    adaptation: UserAdaptation,
  ): Promise<boolean> {
    // Implementation for automation suggestions
    return true;
  }

  private async executePerformanceOptimization(
    userId: string,
    adaptation: UserAdaptation,
  ): Promise<boolean> {
    // Implementation for performance optimization
    return true;
  }

  private async executeRecommendedAction(
    userId: string,
    action: RecommendedAction,
  ): Promise<boolean> {
    try {
      // Implementation for executing recommended actions
      this.logger.info('Executing recommended action', {
        userId,
        actionType: action.type,
        target: action.target,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to execute recommended action', {
        error: error.message,
        userId,
        actionType: action.type,
      });
      return false;
    }
  }

  private async getRecentActions(userId: string, limit: number): Promise<UserAction[]> {
    try {
      const behaviors = await this.stateManager.getTenantStates(userId);
      const recentBehaviors = Array.from(behaviors.values())
        .filter((b) => b.key.startsWith('behavior:'))
        .sort((a, b) => b.value.timestamp.getTime() - a.value.timestamp.getTime())
        .slice(0, limit);

      return recentBehaviors.map((b) => b.value.action);
    } catch (error) {
      this.logger.error('Failed to get recent actions', {
        error: error.message,
        userId,
      });
      return [];
    }
  }

  private findRepetitiveActions(actions: UserAction[]): UserAction[] {
    const actionCounts = new Map<string, number>();

    for (const action of actions) {
      const key = `${action.type}:${action.target}`;
      actionCounts.set(key, (actionCounts.get(key) || 0) + 1);
    }

    return actions.filter((action) => {
      const key = `${action.type}:${action.target}`;
      return (actionCounts.get(key) || 0) > 2;
    });
  }

  private async updatePerformanceMetrics(userId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Calculate performance metrics based on recent behavior
    const recentBehaviors = await this.getRecentActions(userId, 100);

    if (recentBehaviors.length > 0) {
      const successRate = recentBehaviors.filter((a) => a.success).length / recentBehaviors.length;
      const avgDuration =
        recentBehaviors.reduce((sum, a) => sum + (a.duration || 0), 0) / recentBehaviors.length;

      profile.performance = {
        responseTime: avgDuration,
        accuracy: successRate,
        userSatisfaction: this.calculateUserSatisfaction(recentBehaviors),
        efficiency: this.calculateEfficiency(recentBehaviors),
        errorRate: 1 - successRate,
        lastCalculated: new Date(),
      };

      this.userProfiles.set(userId, profile);
    }
  }

  private calculateUserSatisfaction(actions: UserAction[]): number {
    // Implementation for calculating user satisfaction
    return 0.8; // Placeholder
  }

  private calculateEfficiency(actions: UserAction[]): number {
    // Implementation for calculating efficiency
    return 0.75; // Placeholder
  }

  private generateAdaptationId(): string {
    return `adapt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateMetrics(operation: 'behavior' | 'adaptation' | 'recommendation' | 'error'): void {
    // Update metrics based on operation
    if (operation === 'error') {
      this.metrics.errorRate = this.metrics.errorRate * 0.9 + 0.1;
    }
  }

  private startBehaviorCollection(): void {
    // Start collecting behavior data
    this.logger.info('Behavior collection started');
  }

  private startPatternAnalysis(): void {
    // Start pattern analysis
    setInterval(
      () => {
        this.performPatternAnalysis();
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  private async performPatternAnalysis(): Promise<void> {
    // Perform periodic pattern analysis
    this.logger.debug('Performing pattern analysis');
  }
}

// ===== EXPORTS =====

export default AdaptiveEngine;
