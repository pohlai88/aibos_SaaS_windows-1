// ==================== TYPES ====================
export interface UsageEvent {
  id: string;
  type: 'app_launch' | 'feature_use' | 'navigation' | 'action' | 'error' | 'idle';
  target: string;
  timestamp: Date;
  duration?: number; // in milliseconds
  metadata: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface HeatmapZone {
  id: string;
  name: string;
  type: 'app' | 'feature' | 'area' | 'workflow';
  coordinates?: { x: number; y: number; width: number; height: number };
  usageCount: number;
  lastUsed: Date;
  averageDuration: number;
  successRate: number;
  errorCount: number;
  userSatisfaction: number; // 0-1 score
}

export interface UsagePattern {
  id: string;
  name: string;
  description: string;
  events: string[]; // Array of event types
  frequency: number; // How often this pattern occurs
  averageDuration: number;
  userCount: number;
  confidence: number; // 0-1 score
  suggestions: string[]; // Related suggestion IDs
}

export interface WorkflowAnalysis {
  workflowId: string;
  name: string;
  steps: Array<{
    step: string;
    usageCount: number;
    averageTime: number;
    dropoffRate: number;
    suggestions: string[];
  }>;
  completionRate: number;
  averageTime: number;
  bottlenecks: string[];
  optimizationOpportunities: string[];
}

// ==================== HEATMAP TRACKER CLASS ====================
class UsageHeatmapTracker {
  private events: UsageEvent[] = [];
  private zones: Map<string, HeatmapZone> = new Map();
  private patterns: Map<string, UsagePattern> = new Map();
  private workflows: Map<string, WorkflowAnalysis> = new Map();
  private sessionStartTime: Date = new Date();
  private isTracking: boolean = false;

  // Start tracking
  startTracking(): void {
    this.isTracking = true;
    this.sessionStartTime = new Date();
    console.log('🔥 Usage heatmap tracking started');
  }

  // Stop tracking
  stopTracking(): void {
    this.isTracking = false;
    console.log('🔥 Usage heatmap tracking stopped');
  }

  // Record a usage event
  recordEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): string {
    if (!this.isTracking) return '';

    const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const fullEvent: UsageEvent = {
      ...event,
      id: eventId,
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.updateZone(fullEvent);
    this.detectPatterns();
    this.analyzeWorkflows();

    return eventId;
  }

  // Update heatmap zone based on event
  private updateZone(event: UsageEvent): void {
    const zoneId = this.getZoneId(event);
    const existingZone = this.zones.get(zoneId);

    if (existingZone) {
      existingZone.usageCount++;
      existingZone.lastUsed = event.timestamp;
      if (event.duration) {
        existingZone.averageDuration =
          (existingZone.averageDuration + event.duration) / 2;
      }
      if (event.type === 'error') {
        existingZone.errorCount++;
      }
    } else {
      const newZone: HeatmapZone = {
        id: zoneId,
        name: this.getZoneName(event),
        type: this.getZoneType(event),
        usageCount: 1,
        lastUsed: event.timestamp,
        averageDuration: event.duration || 0,
        successRate: event.type === 'error' ? 0 : 1,
        errorCount: event.type === 'error' ? 1 : 0,
        userSatisfaction: 0.5 // Default neutral score
      };
      this.zones.set(zoneId, newZone);
    }
  }

  private getZoneId(event: UsageEvent): string {
    return `${event.type}:${event.target}`;
  }

  private getZoneName(event: UsageEvent): string {
    return event.target.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getZoneType(event: UsageEvent): HeatmapZone['type'] {
    if ((event.target || '').includes('app_')) return 'app';
    if ((event.target || '').includes('feature_')) return 'feature';
    if ((event.target || '').includes('workflow_')) return 'workflow';
    return 'area';
  }

  // Detect usage patterns
  private detectPatterns(): void {
    const recentEvents = this.events.slice(-50); // Last 50 events
    const patterns = this.findPatterns(recentEvents);

    patterns.forEach(pattern => {
      const patternId = `pattern-${pattern.events.join('-')}`;
      const existing = this.patterns.get(patternId);

      if (existing) {
        existing.frequency++;
        existing.averageDuration =
          (existing.averageDuration + pattern.averageDuration) / 2;
      } else {
        this.patterns.set(patternId, {
          id: patternId,
          name: `Pattern: ${pattern.events.join(' → ')}`,
          description: `Users frequently perform: ${pattern.events.join(' then ')}`,
          events: pattern.events,
          frequency: 1,
          averageDuration: pattern.averageDuration,
          userCount: 1,
          confidence: 0.5,
          suggestions: []
        });
      }
    });
  }

  private findPatterns(events: UsageEvent[]): Array<{ events: string[]; averageDuration: number }> {
    const patterns: Array<{ events: string[]; averageDuration: number }> = [];

    // Find sequences of 2-4 events
    for (let length = 2; length <= 4; length++) {
      for (let i = 0; i <= events.length - length; i++) {
        const sequence = events.slice(i, i + length);
        const eventTypes = sequence.map(e => e.type);
        const avgDuration = sequence.reduce((sum, e) => sum + (e.duration || 0), 0) / sequence.length;

        patterns.push({
          events: eventTypes,
          averageDuration: avgDuration
        });
      }
    }

    return patterns;
  }

  // Analyze workflows
  private analyzeWorkflows(): void {
    const workflowEvents = this.events.filter(e => e.target.startsWith('workflow_'));
    const workflows = this.groupByWorkflow(workflowEvents);

    workflows.forEach((events, workflowId) => {
      const analysis = this.createWorkflowAnalysis(workflowId, events);
      this.workflows.set(workflowId, analysis);
    });
  }

  private groupByWorkflow(events: UsageEvent[]): Map<string, UsageEvent[]> {
    const workflows = new Map<string, UsageEvent[]>();

    events.forEach(event => {
      const workflowId = event.target.split('_')[1];
      if (!workflows.has(workflowId)) {
        workflows.set(workflowId, []);
      }
      workflows.get(workflowId)!.push(event);
    });

    return workflows;
  }

  private createWorkflowAnalysis(workflowId: string, events: UsageEvent[]): WorkflowAnalysis {
    const steps = this.identifyWorkflowSteps(events);
    const completionRate = this.calculateCompletionRate(events);
    const averageTime = this.calculateAverageWorkflowTime(events);
    const bottlenecks = this.identifyBottlenecks(steps);

    return {
      workflowId,
      name: `Workflow ${workflowId}`,
      steps,
      completionRate,
      averageTime,
      bottlenecks,
      optimizationOpportunities: this.generateOptimizationOpportunities(steps, bottlenecks)
    };
  }

  private identifyWorkflowSteps(events: UsageEvent[]): WorkflowAnalysis['steps'] {
    const stepMap = new Map<string, { count: number; totalTime: number; errors: number }>();

    events.forEach(event => {
      const step = event.target.split('_')[2] || 'unknown';
      const existing = stepMap.get(step) || { count: 0, totalTime: 0, errors: 0 };

      existing.count++;
      existing.totalTime += event.duration || 0;
      if (event.type === 'error') existing.errors++;

      stepMap.set(step, existing);
    });

    return Array.from(stepMap.entries()).map(([step, data]) => ({
      step,
      usageCount: data.count,
      averageTime: data.totalTime / data.count,
      dropoffRate: data.errors / data.count,
      suggestions: []
    }));
  }

  private calculateCompletionRate(events: UsageEvent[]): number {
    const startEvents = events.filter(e => e.type === 'action' && (e.target || '').includes('start'));
    const endEvents = events.filter(e => e.type === 'action' && (e.target || '').includes('complete'));
    return startEvents.length > 0 ? endEvents.length / startEvents.length : 0;
  }

  private calculateAverageWorkflowTime(events: UsageEvent[]): number {
    const durations = events.map(e => e.duration || 0).filter(d => d > 0);
    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
  }

  private identifyBottlenecks(steps: WorkflowAnalysis['steps']): string[] {
    const avgTime = steps.reduce((sum, s) => sum + s.averageTime, 0) / steps.length;
    return steps
      .filter(s => s.averageTime > avgTime * 1.5)
      .map(s => s.step);
  }

  private generateOptimizationOpportunities(steps: WorkflowAnalysis['steps'], bottlenecks: string[]): string[] {
    const opportunities: string[] = [];

    if (bottlenecks.length > 0) {
      opportunities.push(`Optimize ${bottlenecks.join(', ')} steps`);
    }

    const highDropoffSteps = steps.filter(s => s.dropoffRate > 0.3);
    if (highDropoffSteps.length > 0) {
      opportunities.push(`Reduce errors in ${highDropoffSteps.map(s => s.step).join(', ')}`);
    }

    return opportunities;
  }

  // Get analytics and insights
  getAnalytics(): {
    totalEvents: number;
    sessionDuration: number;
    mostUsedZones: HeatmapZone[];
    leastUsedZones: HeatmapZone[];
    topPatterns: UsagePattern[];
    workflowInsights: WorkflowAnalysis[];
    recommendations: string[];
  } {
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();

    const mostUsedZones = Array.from(this.zones.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    const leastUsedZones = Array.from(this.zones.values())
      .filter(z => z.usageCount < 3)
      .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime())
      .slice(0, 10);

    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const workflowInsights = Array.from(this.workflows.values());

    const recommendations = this.generateRecommendations(mostUsedZones, leastUsedZones, topPatterns, workflowInsights);

    return {
      totalEvents: this.events.length,
      sessionDuration,
      mostUsedZones,
      leastUsedZones,
      topPatterns,
      workflowInsights,
      recommendations
    };
  }

  private generateRecommendations(
    mostUsed: HeatmapZone[],
    leastUsed: HeatmapZone[],
    patterns: UsagePattern[],
    workflows: WorkflowAnalysis[]
  ): string[] {
    const recommendations: string[] = [];

    // Underused features
    if (leastUsed.length > 0) {
      recommendations.push(`Consider exploring: ${leastUsed.slice(0, 3).map(z => z.name).join(', ')}`);
    }

    // Workflow optimizations
    workflows.forEach(workflow => {
      if (workflow.completionRate < 0.7) {
        recommendations.push(`Optimize ${workflow.name} workflow (${Math.round(workflow.completionRate * 100)}% completion rate)`);
      }
    });

    // Pattern-based suggestions
    patterns.forEach(pattern => {
      if (pattern.frequency > 5) {
        recommendations.push(`Consider automating: ${pattern.name}`);
      }
    });

    return recommendations;
  }

  // Get specific insights
  getUnderusedFeatures(): HeatmapZone[] {
    return Array.from(this.zones.values())
      .filter(z => z.usageCount < 2)
      .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime());
  }

  getPopularFeatures(): HeatmapZone[] {
    return Array.from(this.zones.values())
      .filter(z => z.usageCount > 5)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  getWorkflowBottlenecks(): Array<{ workflow: string; bottlenecks: string[] }> {
    return Array.from(this.workflows.values())
      .filter(w => w.bottlenecks.length > 0)
      .map(w => ({ workflow: w.name, bottlenecks: w.bottlenecks }));
  }

  // Clear data
  clearData(): void {
    this.events = [];
    this.zones.clear();
    this.patterns.clear();
    this.workflows.clear();
  }

  // Export data
  exportData(): {
    events: UsageEvent[];
    zones: HeatmapZone[];
    patterns: UsagePattern[];
    workflows: WorkflowAnalysis[];
  } {
    return {
      events: [...this.events],
      zones: Array.from(this.zones.values()),
      patterns: Array.from(this.patterns.values()),
      workflows: Array.from(this.workflows.values())
    };
  }
}

// ==================== SINGLETON INSTANCE ====================
export const usageHeatmapTracker = new UsageHeatmapTracker();

// ==================== CONVENIENCE FUNCTIONS ====================
export const startHeatmapTracking = () => {
  usageHeatmapTracker.startTracking();
};

export const stopHeatmapTracking = () => {
  usageHeatmapTracker.stopTracking();
};

export const recordUsageEvent = (event: Omit<UsageEvent, 'id' | 'timestamp'>) => {
  return usageHeatmapTracker.recordEvent(event);
};

export const getUsageAnalytics = () => {
  return usageHeatmapTracker.getAnalytics();
};

export const getUnderusedFeatures = () => {
  return usageHeatmapTracker.getUnderusedFeatures();
};

export const getPopularFeatures = () => {
  return usageHeatmapTracker.getPopularFeatures();
};

export const getWorkflowBottlenecks = () => {
  return usageHeatmapTracker.getWorkflowBottlenecks();
};

export default usageHeatmapTracker;
