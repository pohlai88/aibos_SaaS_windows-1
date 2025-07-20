// AdminConfig SDK
// Comprehensive service layer for admin operations

import { supabase } from '@/lib/supabase';
import { type AdminUser, type SystemModule, type SecurityPolicy, type Notification, type AuditLog, type SystemStats, type AdminAction, type WorkflowDefinition, type BackupConfig, type SystemAlert } from './types';

class AdminSDK {
  private static instance: AdminSDK;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AdminSDK {
    if (!AdminSDK.instance) {
      AdminSDK.instance = new AdminSDK();
    }
    return AdminSDK.instance;
  }

  // Cache Management
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    organization_id?: string;
  } = {}): Promise<{ users: AdminUser[]; total: number; pagination: any }> {
    const cacheKey = `users_${JSON.stringify(params)}`;
    const cached = this.getCached<{ users: AdminUser[]; total: number; pagination: any }>(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' });

      if (params.search) {
        query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,work_email.ilike.%${params.search}%`);
      }

      if (params.role) {
        query = query.eq('role', params.role);
      }

      if (params.status) {
        query = query.eq('employment_status', params.status);
      }

      if (params.organization_id) {
        query = query.eq('organization_id', params.organization_id);
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const users: AdminUser[] = (data || []).map((user: any) => ({
        id: user.id,
        email: user.work_email || '',
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'employee',
        status: user.employment_status,
        permissions: [], // TODO: Implement permissions
        last_login: user.last_login,
        created_at: user.created_at,
        organization_id: user.organization_id,
        mfa_enabled: user.mfa_enabled || false,
        login_attempts: user.login_attempts || 0,
        locked_until: user.locked_until,
      }));

      const result = {
        users,
        total: count || 0,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
          has_next: page * limit < (count || 0),
          has_prev: page > 1,
        },
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    organization_id: string;
    permissions?: string[];
  }): Promise<AdminUser> {
    try {
      // Basic validation
      if (!userData.email || !userData.first_name || !userData.last_name || !userData.role || !userData.organization_id) {
        throw new Error('Missing required fields');
      }

      const { data, error } = await supabase
        .from('employees')
        .insert({
          work_email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          organization_id: userData.organization_id,
          employment_status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Clear user cache
      this.clearCache('users');

      // Log admin action
      await this.logAdminAction({
        type: 'user_creation',
        user_id: data.id,
        target_type: 'user',
        target_id: data.id,
        details: { created_user: userData },
        status: 'completed',
      });

      return {
        id: data.id,
        email: data.work_email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        status: data.employment_status,
        permissions: [],
        created_at: data.created_at,
        organization_id: data.organization_id,
        mfa_enabled: false,
        login_attempts: 0,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      // Basic validation
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('employees')
        .update({
          work_email: updates.email,
          first_name: updates.first_name,
          last_name: updates.last_name,
          role: updates.role,
          employment_status: updates.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Clear user cache
      this.clearCache('users');

      // Log admin action
      await this.logAdminAction({
        type: 'role_assignment',
        user_id: userId,
        target_type: 'user',
        target_id: userId,
        details: { updated_user: updates },
        status: 'completed',
      });

      return {
        id: data.id,
        email: data.work_email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        status: data.employment_status,
        permissions: [],
        created_at: data.created_at,
        organization_id: data.organization_id,
        mfa_enabled: data.mfa_enabled || false,
        login_attempts: data.login_attempts || 0,
        locked_until: data.locked_until,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      this.clearCache('users');

      await this.logAdminAction({
        type: 'user_deletion',
        user_id: userId,
        target_type: 'user',
        target_id: userId,
        details: { deleted_user_id: userId },
        status: 'completed',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Module Management
  async getModules(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  } = {}): Promise<{ modules: SystemModule[]; total: number; pagination: any }> {
    const cacheKey = `modules_${JSON.stringify(params)}`;
    const cached = this.getCached<{ modules: SystemModule[]; total: number; pagination: any }>(cacheKey);
    if (cached) return cached;

    try {
      // Mock modules data - implement actual table later
      const mockModules: SystemModule[] = [
        {
          id: 'accounting',
          name: 'Accounting Module',
          description: 'Core accounting functionality including ledger, journal entries, and financial reporting',
          icon: '📊',
          status: 'enabled',
          version: '2.1.0',
          category: 'Finance',
          dependencies: ['core'],
          lastUpdated: '2024-01-15T00:00:00Z',
          config: {
            settings: { multi_currency: true, auto_reconciliation: true },
            features: ['ledger', 'journal_entries', 'financial_reports'],
            limits: { max_accounts: 1000, max_transactions: 10000 },
            customizations: {},
          },
          permissions: [],
          health: {
            status: 'healthy',
            uptime: 99.9,
            response_time: 150,
            error_rate: 0.1,
            last_check: new Date().toISOString(),
            issues: [],
          },
          usage: {
            active_users: 150,
            total_requests: 50000,
            storage_used: 1024000,
            api_calls: 25000,
            last_activity: new Date().toISOString(),
          },
        },
        // Add more mock modules...
      ];

      const result = {
        modules: mockModules,
        total: mockModules.length,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: mockModules.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async toggleModule(moduleId: string, enabled: boolean): Promise<void> {
    try {
      // TODO: Implement actual module toggle logic
      console.log(`Toggling module ${moduleId} to ${enabled}`);

      await this.logAdminAction({
        type: enabled ? 'module_enable' : 'module_disable',
        user_id: 'current-user-id', // TODO: Get from auth context
        target_type: 'module',
        target_id: moduleId,
        details: { enabled },
        status: 'completed',
      });

      this.clearCache('modules');
    } catch (error) {
      console.error('Error toggling module:', error);
      throw error;
    }
  }

  // System Statistics
  async getSystemStats(): Promise<SystemStats> {
    const cacheKey = 'system_stats';
    const cached = this.getCached<SystemStats>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch real statistics
      const [usersResult, organizationsResult] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
      ]);

      const totalUsers = usersResult.count || 0;
      const totalOrganizations = organizationsResult.count || 0;

      // Get active users
      const { count: activeUsers } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('employment_status', 'active');

      const stats: SystemStats = {
        totalUsers,
        activeUsers: activeUsers || 0,
        totalOrganizations,
        systemHealth: {
          overall: 'excellent',
          uptime: 99.9,
          response_time: 150,
          error_rate: 0.1,
          active_modules: 8,
          total_modules: 10,
        },
        lastBackup: new Date().toISOString(),
        storageUsed: 250000000, // Mock data
        storageLimit: 1000000000,
        performance: {
          cpu_usage: 45,
          memory_usage: 60,
          disk_usage: 25,
          network_throughput: 100,
          database_connections: 25,
          cache_hit_rate: 85,
        },
        security: {
          security_score: 85,
          active_threats: 0,
          failed_logins: 5,
          suspicious_activities: 1,
          last_security_scan: new Date().toISOString(),
          vulnerabilities: [],
        },
        compliance: {
          compliance_score: 92,
          pending_audits: 2,
          regulatory_requirements: [],
          last_compliance_check: new Date().toISOString(),
          next_audit_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      this.setCached(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  // Security Management
  async getSecurityPolicies(): Promise<SecurityPolicy[]> {
    const cacheKey = 'security_policies';
    const cached = this.getCached<SecurityPolicy[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock security policies - implement actual table later
      const policies: SecurityPolicy[] = [
        {
          id: 'mfa',
          name: 'Multi-Factor Authentication',
          description: 'Require MFA for all user accounts',
          status: 'enabled',
          category: 'Authentication',
          lastUpdated: '2024-01-15',
          config: {
            settings: { required: true, grace_period: 7 },
            rules: [],
            exceptions: [],
          },
          enforcement_level: 'strict',
        },
        // Add more policies...
      ];

      this.setCached(cacheKey, policies);
      return policies;
    } catch (error) {
      console.error('Error fetching security policies:', error);
      throw error;
    }
  }

  async updateSecurityPolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    try {
      // TODO: Implement actual policy update
      console.log(`Updating security policy ${policyId}`, updates);

      await this.logAdminAction({
        type: 'security_policy_change',
        user_id: 'current-user-id',
        target_type: 'security_policy',
        target_id: policyId,
        details: { updates },
        status: 'completed',
      });

      this.clearCache('security_policies');
      
      // Return updated policy
      return {} as SecurityPolicy; // TODO: Return actual updated policy
    } catch (error) {
      console.error('Error updating security policy:', error);
      throw error;
    }
  }

  // Audit Logging
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    user_id?: string;
    action?: string;
    resource?: string;
    severity?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{ logs: AuditLog[]; total: number; pagination: any }> {
    try {
      // Mock audit logs - implement actual table later
      const logs: AuditLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          action: 'user_login',
          resource: 'auth',
          resource_id: 'user-1',
          details: { ip: '192.168.1.100', user_agent: 'Mozilla/5.0...' },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date().toISOString(),
          severity: 'low',
          status: 'success',
        },
        // Add more logs...
      ];

      return {
        logs: logs,
        total: logs.length,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: logs.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  async logAdminAction(action: Omit<AdminAction, 'id' | 'created_at'>): Promise<void> {
    try {
      const adminAction: AdminAction = {
        id: crypto.randomUUID(),
        ...action,
        created_at: new Date().toISOString(),
      };

      // TODO: Store in actual admin_actions table
      console.log('Admin action logged:', adminAction);

      // Also log to audit trail
      const auditLog: AuditLog = {
        id: crypto.randomUUID(),
        user_id: action.user_id,
        action: action.type,
        resource: action.target_type,
        resource_id: action.target_id,
        details: action.details,
        ip_address: '127.0.0.1', // TODO: Get from request
        user_agent: 'AdminSDK', // TODO: Get from request
        timestamp: new Date().toISOString(),
        severity: 'medium',
        status: action.status === 'completed' ? 'success' : 
                action.status === 'failed' ? 'failure' : 'pending',
      };

      // TODO: Store audit log
      console.log('Audit log created:', auditLog);
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw - logging should not break main operations
    }
  }

  // Notification Management
  async sendNotification(notification: {
    title: string;
    message: string;
    type: string;
    priority: string;
    target_type: string;
    target_ids: string[];
    expires_at?: string;
  }): Promise<Notification> {
    try {
      const newNotification: Notification = {
        id: crypto.randomUUID(),
        title: notification.title,
        message: notification.message,
        type: notification.type as any,
        priority: notification.priority as any,
        target_type: notification.target_type as any,
        target_ids: notification.target_ids,
        sent_by: 'current-user-id', // TODO: Get from auth context
        sent_at: new Date().toISOString(),
        expires_at: notification.expires_at,
        read_by: [],
        status: 'sent',
      };

      // TODO: Store in notifications table
      console.log('Notification sent:', newNotification);

      await this.logAdminAction({
        type: 'notification_sent',
        user_id: 'current-user-id',
        target_type: 'notification',
        target_id: newNotification.id,
        details: { notification: newNotification },
        status: 'completed',
      });

      return newNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // System Monitoring
  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      // TODO: Implement actual alert system
      const alerts: SystemAlert[] = [
        {
          id: '1',
          type: 'security',
          severity: 'medium',
          title: 'Multiple failed login attempts',
          message: 'User account has 5 failed login attempts in the last hour',
          affected_components: ['authentication'],
          created_at: new Date().toISOString(),
          status: 'active',
        },
        // Add more alerts...
      ];

      return alerts;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  }

  // Backup Management
  async getBackupConfigs(): Promise<BackupConfig[]> {
    try {
      // TODO: Implement actual backup configuration
      const configs: BackupConfig[] = [
        {
          id: '1',
          name: 'Daily Full Backup',
          type: 'full',
          schedule: '0 2 * * *', // Daily at 2 AM
          retention_days: 30,
          storage_location: 's3://backups/aibos',
          encryption_enabled: true,
          compression_enabled: true,
          status: 'active',
        },
        // Add more configs...
      ];

      return configs;
    } catch (error) {
      console.error('Error fetching backup configs:', error);
      throw error;
    }
  }

  // Workflow Management
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    try {
      // TODO: Implement actual workflow system
      const workflows: WorkflowDefinition[] = [
        {
          id: '1',
          name: 'User Approval Workflow',
          description: 'Automated workflow for user creation approval',
          trigger: {
            type: 'automatic',
            event: 'user_creation',
          },
          steps: [
            {
              id: '1',
              name: 'Notify Admin',
              type: 'notification',
              config: { template: 'user_approval_notification' },
              order: 1,
              required: true,
            },
            {
              id: '2',
              name: 'Admin Approval',
              type: 'approval',
              config: { approvers: ['admin'] },
              order: 2,
              required: true,
              timeout: 24 * 60 * 60, // 24 hours
            },
          ],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Add more workflows...
      ];

      return workflows;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  // Utility Methods
  async clearAllCache(): Promise<void> {
    this.cache.clear();
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Check database connection
      const { error: dbError } = await supabase.from('employees').select('id').limit(1);
      
      // Check cache
      const cacheStatus = this.cache.size > 0 ? 'active' : 'empty';
      
      const status = dbError ? 'unhealthy' : 'healthy';
      
      return {
        status,
        details: {
          database: dbError ? 'error' : 'connected',
          cache: cacheStatus,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

// Export singleton instance
export const adminSDK = AdminSDK.getInstance();

// Export types for convenience
export type { AdminUser, SystemModule, SecurityPolicy, Notification, AuditLog, SystemStats, AdminAction, WorkflowDefinition, BackupConfig, SystemAlert }; 