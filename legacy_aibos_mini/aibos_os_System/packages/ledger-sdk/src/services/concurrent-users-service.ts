import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

export interface ConcurrentUserMetrics {
  current: number;
  peak: number;
  average: number;
  byModule: Record<string, number>;
  byOrganization: Record<string, number>;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    database: number;
  };
}

export interface UserSession {
  userId: string;
  organizationId: string;
  sessionId: string;
  moduleId?: string;
  lastActivity: number;
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
}

export class ConcurrentUsersService {
  private redis: Redis;
  private supabase: any;
  private readonly ACTIVITY_WINDOW = 60 * 1000; // 1 minute
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(redisUrl: string, supabaseUrl: string, supabaseKey: string) {
    this.redis = new Redis(redisUrl);
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Start cleanup process
    this.startCleanupProcess();
  }

  /**
   * Track user activity for concurrent user calculation
   */
  async trackUserActivity(session: Omit<UserSession, 'lastActivity'>): Promise<void> {
    const now = Date.now();
    const sessionData: UserSession = {
      ...session,
      lastActivity: now
    };

    // Store in Redis with expiration
    const key = `user_activity:${session.userId}:${session.sessionId}`;
    await this.redis.setex(key, 120, JSON.stringify(sessionData)); // 2 minute TTL

    // Add to active users sorted set
    await this.redis.zadd('active_users', now, `${session.userId}:${session.sessionId}`);
    
    // Track by module if specified
    if (session.moduleId) {
      await this.redis.zadd(`module_users:${session.moduleId}`, now, `${session.userId}:${session.sessionId}`);
    }

    // Track by organization
    await this.redis.zadd(`org_users:${session.organizationId}`, now, `${session.userId}:${session.sessionId}`);

    // Update user session in database
    await this.updateUserSession(sessionData);
  }

  /**
   * Get current concurrent users
   */
  async getCurrentConcurrentUsers(): Promise<number> {
    const cutoff = Date.now() - this.ACTIVITY_WINDOW;
    return await this.redis.zcount('active_users', cutoff, '+inf');
  }

  /**
   * Get concurrent users by module
   */
  async getConcurrentUsersByModule(moduleId: string): Promise<number> {
    const cutoff = Date.now() - this.ACTIVITY_WINDOW;
    return await this.redis.zcount(`module_users:${moduleId}`, cutoff, '+inf');
  }

  /**
   * Get concurrent users by organization
   */
  async getConcurrentUsersByOrganization(organizationId: string): Promise<number> {
    const cutoff = Date.now() - this.ACTIVITY_WINDOW;
    return await this.redis.zcount(`org_users:${organizationId}`, cutoff, '+inf');
  }

  /**
   * Get peak concurrent users in a time period
   */
  async getPeakConcurrentUsers(startTime: number, endTime: number): Promise<number> {
    const { data, error } = await this.supabase
      .from('concurrent_users_history')
      .select('concurrent_users')
      .gte('timestamp', new Date(startTime).toISOString())
      .lte('timestamp', new Date(endTime).toISOString())
      .order('concurrent_users', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0]?.concurrent_users || 0;
  }

  /**
   * Get average concurrent users in a time period
   */
  async getAverageConcurrentUsers(startTime: number, endTime: number): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('get_average_concurrent_users', {
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString()
      });

    if (error) throw error;
    return data || 0;
  }

  /**
   * Get comprehensive metrics
   */
  async getConcurrentUserMetrics(): Promise<ConcurrentUserMetrics> {
    const current = await this.getCurrentConcurrentUsers();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Get peak and average
    const peak = await this.getPeakConcurrentUsers(oneDayAgo, now);
    const average = await this.getAverageConcurrentUsers(oneHourAgo, now);

    // Get by module
    const modules = ['accounting', 'bookkeeping', 'tax', 'crm', 'inventory'];
    const byModule: Record<string, number> = {};
    for (const moduleId of modules) {
      byModule[moduleId] = await this.getConcurrentUsersByModule(moduleId);
    }

    // Get by organization (top 10)
    const byOrganization = await this.getTopOrganizationsByConcurrency(10);

    // Get performance metrics
    const responseTime = await this.getResponseTimeMetrics();
    const errorRate = await this.getErrorRate();
    const resourceUtilization = await this.getResourceUtilization();

    return {
      current,
      peak,
      average,
      byModule,
      byOrganization,
      responseTime,
      errorRate,
      resourceUtilization
    };
  }

  /**
   * Get top organizations by concurrent users
   */
  private async getTopOrganizationsByConcurrency(limit: number): Promise<Record<string, number>> {
    const cutoff = Date.now() - this.ACTIVITY_WINDOW;
    const orgKeys = await this.redis.keys('org_users:*');
    
    const orgCounts: Record<string, number> = {};
    for (const key of orgKeys) {
      const orgId = key.replace('org_users:', '');
      const count = await this.redis.zcount(key, cutoff, '+inf');
      if (count > 0) {
        orgCounts[orgId] = count;
      }
    }

    // Sort and return top N
    return Object.fromEntries(
      Object.entries(orgCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
    );
  }

  /**
   * Get response time metrics (P50, P95, P99)
   */
  private async getResponseTimeMetrics(): Promise<{ p50: number; p95: number; p99: number }> {
    // This would integrate with your APM system (e.g., DataDog, New Relic)
    // For now, return mock data
    return {
      p50: 120,
      p95: 250,
      p99: 500
    };
  }

  /**
   * Get error rate
   */
  private async getErrorRate(): Promise<number> {
    // This would integrate with your error tracking system
    // For now, return mock data
    return 0.05; // 0.05%
  }

  /**
   * Get resource utilization
   */
  private async getResourceUtilization(): Promise<{ cpu: number; memory: number; database: number }> {
    // This would integrate with your monitoring system
    // For now, return mock data
    return {
      cpu: 65,
      memory: 78,
      database: 45
    };
  }

  /**
   * Update user session in database
   */
  private async updateUserSession(session: UserSession): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .upsert({
        user_id: session.userId,
        organization_id: session.organizationId,
        session_id: session.sessionId,
        module_id: session.moduleId,
        last_activity: new Date(session.lastActivity).toISOString(),
        user_agent: session.userAgent,
        ip_address: session.ipAddress,
        is_active: session.isActive
      }, {
        onConflict: 'user_id,session_id'
      });

    if (error) throw error;
  }

  /**
   * Record concurrent users history for analytics
   */
  async recordConcurrentUsersHistory(): Promise<void> {
    const current = await this.getCurrentConcurrentUsers();
    
    const { error } = await this.supabase
      .from('concurrent_users_history')
      .insert({
        concurrent_users: current,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const cutoff = Date.now() - this.ACTIVITY_WINDOW;
    
    // Remove expired entries from sorted sets
    await this.redis.zremrangebyscore('active_users', '-inf', cutoff);
    
    // Clean up module-specific sets
    const moduleKeys = await this.redis.keys('module_users:*');
    for (const key of moduleKeys) {
      await this.redis.zremrangebyscore(key, '-inf', cutoff);
    }
    
    // Clean up organization-specific sets
    const orgKeys = await this.redis.keys('org_users:*');
    for (const key of orgKeys) {
      await this.redis.zremrangebyscore(key, '-inf', cutoff);
    }
  }

  /**
   * Start cleanup process
   */
  private startCleanupProcess(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
      this.recordConcurrentUsersHistory();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Get real-time concurrent users stream
   */
  async getRealtimeConcurrentUsers(): Promise<number> {
    return await this.getCurrentConcurrentUsers();
  }

  /**
   * Get concurrent users trend (last 24 hours)
   */
  async getConcurrentUsersTrend(): Promise<Array<{ timestamp: string; count: number }>> {
    const { data, error } = await this.supabase
      .from('concurrent_users_history')
      .select('timestamp, concurrent_users')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    
    return data?.map(row => ({
      timestamp: row.timestamp,
      count: row.concurrent_users
    })) || [];
  }
} 