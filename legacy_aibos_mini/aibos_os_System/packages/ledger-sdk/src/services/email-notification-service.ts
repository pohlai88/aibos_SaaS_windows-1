import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  EmailTemplate,
  EmailNotification,
  NotificationSchedule,
  NotificationRecipient,
  NotificationDelivery,
  NotificationStatistics,
  EmailProvider,
  NotificationQueue,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  EmailTemplateType
} from '../../types';

// ===== ENTERPRISE-GRADE ENHANCEMENTS =====

// Provider failover: support multiple providers and failover logic
interface ProviderConfig {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  send: (email: any) => Promise<{ success: boolean; error?: any }>;
}

// Audit log event type
interface NotificationAuditEvent {
  event: string;
  notificationId?: string;
  userId?: string;
  organizationId?: string;
  timestamp: string;
  details?: any;
}

export class EmailNotificationService {
  private supabase: SupabaseClient;
  private providers: ProviderConfig[] = [];
  private rateLimitMap: Map<string, { count: number; lastReset: number }> = new Map();
  private readonly RATE_LIMIT = 100; // max notifications per org per hour

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    // Initialize providers (stub: in production, load from DB/config)
    this.providers = [
      // Example: { id: 'default', name: 'DefaultProvider', isActive: true, isDefault: true, send: this.sendViaDefaultProvider }
    ];
  }

  // ===== PROVIDER FAILOVER =====
  private async sendWithFailover(email: any): Promise<{ success: boolean; error?: any }> {
    for (const provider of this.providers.filter(p => p.isActive)) {
      try {
        const result = await provider.send(email);
        if (result.success) return { success: true };
        // Log provider failure
        await this.logAudit({ event: 'provider_fail', details: { provider: provider.name, error: result.error }, timestamp: new Date().toISOString() });
      } catch (error) {
        await this.logAudit({ event: 'provider_exception', details: { provider: provider.name, error }, timestamp: new Date().toISOString() });
      }
    }
    return { success: false, error: 'All providers failed' };
  }

  // ===== AUDIT LOGGING =====
  private async logAudit(event: NotificationAuditEvent) {
    // In production, write to audit log table or external system
    // Example stub:
    // await this.supabase.from('notification_audit').insert(event);
    // For now, just log to console
    console.log('[Audit]', event);
  }

  // ===== RATE LIMITING =====
  private checkRateLimit(organizationId: string): boolean {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    let entry = this.rateLimitMap.get(organizationId);
    if (!entry || now - entry.lastReset > hour) {
      entry = { count: 0, lastReset: now };
      this.rateLimitMap.set(organizationId, entry);
    }
    if (entry.count >= this.RATE_LIMIT) return false;
    entry.count++;
    return true;
  }

  // ===== WEBHOOK/CALLBACK STUBS =====
  async handleProviderWebhook(event: any) {
    // Stub: handle delivery, bounce, unsubscribe events from provider
    // Update notification status, log audit event, trigger alerts if needed
    await this.logAudit({ event: 'provider_webhook', details: event, timestamp: new Date().toISOString() });
  }

  // ===== MONITORING/ALERTING HOOKS =====
  private alertOnFailure(notificationId: string, error: any) {
    // Stub: integrate with monitoring/alerting system (e.g., Sentry, PagerDuty)
    console.error('[Alert] Notification failure', { notificationId, error });
  }

  /**
   * Create email template
   */
  async createEmailTemplate(
    organizationId: string,
    templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ template: EmailTemplate | null; error: any }> {
    try {
      const { data: template, error } = await this.supabase
        .from('email_templates')
        .insert({
          organizationId: organizationId,
          name: templateData.name,
          description: templateData.description,
          type: templateData.type,
          subject: templateData.subject,
          body: templateData.body,
          variables: templateData.variables,
          is_active: templateData.isActive,
          notification_type: templateData.notificationType
        })
        .select()
        .single();

      if (error) throw error;

      return { template: this.formatEmailTemplate(template), error: null };

    } catch (error) {
      return { template: null, error };
    }
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(
    organizationId: string,
    notificationType?: NotificationType,
    isActive?: boolean
  ): Promise<{ templates: EmailTemplate[]; error: any }> {
    try {
      let query = this.supabase
        .from('email_templates')
        .select('*')
        .eq('organizationId', organizationId);

      if (notificationType) {
        query = query.eq('notification_type', notificationType);
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      query = query.order('name', { ascending: true });

      const { data: templates, error } = await query;

      if (error) throw error;

      const formattedTemplates = templates?.map(template => this.formatEmailTemplate(template)) || [];

      return { templates: formattedTemplates, error: null };

    } catch (error) {
      return { templates: [], error };
    }
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(
    templateId: string,
    updates: Partial<EmailTemplate>
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.supabase
        .from('email_templates')
        .update({
          name: updates.name,
          description: updates.description,
          type: updates.type,
          subject: updates.subject,
          body: updates.body,
          variables: updates.variables,
          is_active: updates.isActive,
          notification_type: updates.notificationType,
          updatedAt: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Delete email template
   */
  async deleteEmailTemplate(templateId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Send email notification (enterprise-grade: failover, audit, rate limit, alert)
   */
  async sendEmailNotification(
    organizationId: string,
    notificationData: {
      templateId: string;
      recipientEmail: string;
      recipientName?: string;
      variables?: Record<string, any>;
      priority?: NotificationPriority;
      scheduledFor?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      metadata?: Record<string, any>;
      userId?: string; // Added for audit
    }
  ): Promise<{ notification: EmailNotification | null; error: any }> {
    try {
      // Rate limiting
      if (!this.checkRateLimit(organizationId)) {
        await this.logAudit({ event: 'rate_limit_exceeded', organizationId, timestamp: new Date().toISOString() });
        return { notification: null, error: 'Rate limit exceeded' };
      }
      // Get template
      const { data: template, error: templateError } = await this.supabase
        .from('email_templates')
        .select('*')
        .eq('id', notificationData.templateId)
        .single();
      if (templateError) throw templateError;
      // Process template variables
      const processedSubject = this.processTemplate(template.subject, notificationData.variables || {});
      const processedBody = this.processTemplate(template.body, notificationData.variables || {});
      // Create notification record
      const { data: notification, error } = await this.supabase
        .from('email_notifications')
        .insert({
          organizationId: organizationId,
          template_id: notificationData.templateId,
          recipient_email: notificationData.recipientEmail,
          recipient_name: notificationData.recipientName,
          subject: processedSubject,
          body: processedBody,
          notification_type: template.notification_type,
          priority: notificationData.priority || 'normal',
          status: notificationData.scheduledFor ? 'pending' : 'pending',
          scheduled_for: notificationData.scheduledFor,
          retry_count: 0,
          max_retries: 3,
          related_entity_type: notificationData.relatedEntityType,
          related_entity_id: notificationData.relatedEntityId,
          metadata: notificationData.metadata
        })
        .select()
        .single();
      if (error) throw error;
      // Audit log: notification created
      await this.logAudit({ event: 'notification_created', notificationId: notification.id, userId: notificationData.userId, organizationId, timestamp: new Date().toISOString(), details: notification });
      // If immediate send, queue for delivery and send with failover
      if (!notificationData.scheduledFor) {
        await this.queueNotificationForDelivery(notification.id, notification.priority);
        // Enterprise: send with failover
        const sendResult = await this.sendWithFailover({
          to: notification.recipient_email,
          subject: notification.subject,
          body: notification.body
        });
        if (!sendResult.success) {
          this.alertOnFailure(notification.id, sendResult.error);
          await this.logAudit({ event: 'notification_send_failed', notificationId: notification.id, organizationId, timestamp: new Date().toISOString(), details: sendResult.error });
        } else {
          await this.logAudit({ event: 'notification_sent', notificationId: notification.id, organizationId, timestamp: new Date().toISOString() });
        }
      }
      return { notification: this.formatEmailNotification(notification), error: null };
    } catch (error) {
      this.alertOnFailure('unknown', error);
      await this.logAudit({ event: 'notification_error', timestamp: new Date().toISOString(), details: error });
      return { notification: null, error };
    }
  }

  /**
   * Get email notifications
   */
  async getEmailNotifications(
    organizationId: string,
    status?: NotificationStatus,
    notificationType?: NotificationType,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: EmailNotification[]; total: number; error: any }> {
    try {
      let query = this.supabase
        .from('email_notifications')
        .select(`
          *,
          template:email_templates(*)
        `, { count: 'exact' })
        .eq('organizationId', organizationId);

      if (status) {
        query = query.eq('status', status);
      }

      if (notificationType) {
        query = query.eq('notification_type', notificationType);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by creation date
      query = query.order('createdAt', { ascending: false });

      const { data: notifications, error, count } = await query;

      if (error) throw error;

      const formattedNotifications = notifications?.map(notification => 
        this.formatEmailNotification(notification)
      ) || [];

      return { notifications: formattedNotifications, total: count || 0, error: null };

    } catch (error) {
      return { notifications: [], total: 0, error };
    }
  }

  /**
   * Create notification schedule
   */
  async createNotificationSchedule(
    organizationId: string,
    scheduleData: Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ schedule: NotificationSchedule | null; error: any }> {
    try {
      const { data: schedule, error } = await this.supabase
        .from('notification_schedules')
        .insert({
          organizationId: organizationId,
          name: scheduleData.name,
          description: scheduleData.description,
          notification_type: scheduleData.notificationType,
          template_id: scheduleData.templateId,
          schedule_type: scheduleData.scheduleType,
          schedule_config: scheduleData.scheduleConfig,
          conditions: scheduleData.conditions,
          is_active: scheduleData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      return { schedule: this.formatNotificationSchedule(schedule), error: null };

    } catch (error) {
      return { schedule: null, error };
    }
  }

  /**
   * Get notification schedules
   */
  async getNotificationSchedules(
    organizationId: string,
    isActive?: boolean
  ): Promise<{ schedules: NotificationSchedule[]; error: any }> {
    try {
      let query = this.supabase
        .from('notification_schedules')
        .select(`
          *,
          template:email_templates(*)
        `)
        .eq('organizationId', organizationId);

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      query = query.order('name', { ascending: true });

      const { data: schedules, error } = await query;

      if (error) throw error;

      const formattedSchedules = schedules?.map(schedule => 
        this.formatNotificationSchedule(schedule)
      ) || [];

      return { schedules: formattedSchedules, error: null };

    } catch (error) {
      return { schedules: [], error };
    }
  }

  /**
   * Create notification recipient
   */
  async createNotificationRecipient(
    organizationId: string,
    recipientData: Omit<NotificationRecipient, 'id' | 'unsubscribeToken' | 'createdAt' | 'updatedAt'>
  ): Promise<{ recipient: NotificationRecipient | null; error: any }> {
    try {
      const unsubscribeToken = this.generateUnsubscribeToken();

      const { data: recipient, error } = await this.supabase
        .from('notification_recipients')
        .insert({
          organizationId: organizationId,
          email: recipientData.email,
          name: recipientData.name,
          notification_types: recipientData.notificationTypes,
          is_active: recipientData.isActive,
          unsubscribe_token: unsubscribeToken,
          preferences: recipientData.preferences
        })
        .select()
        .single();

      if (error) throw error;

      return { recipient: this.formatNotificationRecipient(recipient), error: null };

    } catch (error) {
      return { recipient: null, error };
    }
  }

  /**
   * Get notification recipients
   */
  async getNotificationRecipients(
    organizationId: string,
    isActive?: boolean
  ): Promise<{ recipients: NotificationRecipient[]; error: any }> {
    try {
      let query = this.supabase
        .from('notification_recipients')
        .select('*')
        .eq('organizationId', organizationId);

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      query = query.order('email', { ascending: true });

      const { data: recipients, error } = await query;

      if (error) throw error;

      const formattedRecipients = recipients?.map(recipient => 
        this.formatNotificationRecipient(recipient)
      ) || [];

      return { recipients: formattedRecipients, error: null };

    } catch (error) {
      return { recipients: [], error };
    }
  }

  /**
   * Unsubscribe recipient
   */
  async unsubscribeRecipient(unsubscribeToken: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.supabase
        .from('notification_recipients')
        .update({ is_active: false })
        .eq('unsubscribe_token', unsubscribeToken);

      if (error) throw error;

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Create email provider
   */
  async createEmailProvider(
    organizationId: string,
    providerData: Omit<EmailProvider, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ provider: EmailProvider | null; error: any }> {
    try {
      const { data: provider, error } = await this.supabase
        .from('email_providers')
        .insert({
          organizationId: organizationId,
          name: providerData.name,
          provider: providerData.provider,
          config: providerData.config,
          is_active: providerData.isActive,
          is_default: providerData.isDefault,
          daily_limit: providerData.dailyLimit,
          monthly_limit: providerData.monthlyLimit
        })
        .select()
        .single();

      if (error) throw error;

      return { provider: this.formatEmailProvider(provider), error: null };

    } catch (error) {
      return { provider: null, error };
    }
  }

  /**
   * Get email providers
   */
  async getEmailProviders(
    organizationId: string,
    isActive?: boolean
  ): Promise<{ providers: EmailProvider[]; error: any }> {
    try {
      let query = this.supabase
        .from('email_providers')
        .select('*')
        .eq('organizationId', organizationId);

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      query = query.order('name', { ascending: true });

      const { data: providers, error } = await query;

      if (error) throw error;

      const formattedProviders = providers?.map(provider => 
        this.formatEmailProvider(provider)
      ) || [];

      return { providers: formattedProviders, error: null };

    } catch (error) {
      return { providers: [], error };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(
    organizationId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{ statistics: NotificationStatistics | null; error: any }> {
    try {
      let query = this.supabase
        .from('email_notifications')
        .select('status, notification_type, createdAt')
        .eq('organizationId', organizationId);

      if (dateFrom) {
        query = query.gte('createdAt', dateFrom);
      }

      if (dateTo) {
        query = query.lte('createdAt', dateTo);
      }

      const { data: notifications, error } = await query;

      if (error) throw error;

      const statistics = this.calculateNotificationStatistics(notifications || []);

      return { statistics, error: null };

    } catch (error) {
      return { statistics: null, error };
    }
  }

  /**
   * Retry failed notification
   */
  async retryFailedNotification(
    notificationId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Get current retry count
      const { data: notification, error: fetchError } = await this.supabase
        .from('email_notifications')
        .select('retry_count')
        .eq('id', notificationId)
        .single();
      if (fetchError) throw fetchError;
      const newRetryCount = (notification?.retry_count || 0) + 1;
      // Update notification status
      const { error: updateError } = await this.supabase
        .from('email_notifications')
        .update({
          status: 'pending',
          retry_count: newRetryCount,
          updatedAt: new Date().toISOString()
        })
        .eq('id', notificationId);
      if (updateError) throw updateError;
      // Queue for delivery
      await this.queueNotificationForDelivery(notificationId, 'normal');
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Process template variables
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return processed;
  }

  /**
   * Queue notification for delivery
   */
  private async queueNotificationForDelivery(
    notificationId: string,
    priority: NotificationPriority
  ): Promise<void> {
    try {
      await this.supabase
        .from('notification_queue')
        .insert({
          notification_id: notificationId,
          priority,
          scheduled_for: new Date().toISOString(),
          retry_count: 0,
          status: 'queued'
        });
    } catch (error) {
      console.error('Failed to queue notification:', error);
    }
  }

  /**
   * Generate unsubscribe token
   */
  private generateUnsubscribeToken(): string {
    return `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate notification statistics
   */
  private calculateNotificationStatistics(notifications: any[]): NotificationStatistics {
    const totalSent = notifications.filter((n: any) => n.status === 'sent' || n.status === 'delivered').length;
    const totalDelivered = notifications.filter((n: any) => n.status === 'delivered').length;
    const totalFailed = notifications.filter((n: any) => n.status === 'failed').length;
    const totalBounced = notifications.filter((n: any) => n.status === 'bounced').length;
    const totalUnsubscribed = notifications.filter((n: any) => n.status === 'unsubscribed').length;
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    // Group by notification type
    const byType: Record<string, any> = {};
    const typeGroups = notifications.reduce((groups: Record<string, any[]>, notification: any) => {
      const type = notification.notification_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(notification);
      return groups;
    }, {});
    for (const [type, typeNotifications] of Object.entries(typeGroups)) {
      const sent = (typeNotifications as any[]).filter((n: any) => n.status === 'sent' || n.status === 'delivered').length;
      const delivered = (typeNotifications as any[]).filter((n: any) => n.status === 'delivered').length;
      const failed = (typeNotifications as any[]).filter((n: any) => n.status === 'failed').length;
      const rate = sent > 0 ? (delivered / sent) * 100 : 0;
      byType[type] = { sent, delivered, failed, rate };
    }
    // Group by date
    const byDate = notifications.reduce((groups: Record<string, any>, notification: any) => {
      const date = new Date(notification.createdAt).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = { sent: 0, delivered: 0, failed: 0 };
      }
      if (notification.status === 'sent' || notification.status === 'delivered') {
        groups[date].sent++;
      }
      if (notification.status === 'delivered') {
        groups[date].delivered++;
      }
      if (notification.status === 'failed') {
        groups[date].failed++;
      }
      return groups;
    }, {});
    const byDateArray = Object.entries(byDate)
      .map(([date, stats]) => ({ date, ...(typeof stats === 'object' && stats !== null ? stats : {}) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      totalSent,
      totalDelivered,
      totalFailed,
      totalBounced,
      totalUnsubscribed,
      deliveryRate,
      bounceRate,
      byType,
      byDate: byDateArray
    };
  }

  // Helper methods
  private formatEmailTemplate(templateData: any): EmailTemplate {
    return {
      id: templateData.id,
      organizationId: templateData.organizationId,
      name: templateData.name,
      description: templateData.description,
      type: templateData.type,
      subject: templateData.subject,
      body: templateData.body,
      variables: templateData.variables || [],
      isActive: templateData.is_active,
      notificationType: templateData.notification_type,
      createdAt: templateData.createdAt,
      updatedAt: templateData.updatedAt
    };
  }

  private formatEmailNotification(notificationData: any): EmailNotification {
    return {
      id: notificationData.id,
      organizationId: notificationData.organizationId,
      templateId: notificationData.template_id,
      template: notificationData.template ? this.formatEmailTemplate(notificationData.template) : undefined,
      recipientEmail: notificationData.recipient_email,
      recipientName: notificationData.recipient_name,
      subject: notificationData.subject,
      body: notificationData.body,
      notificationType: notificationData.notification_type,
      priority: notificationData.priority,
      status: notificationData.status,
      scheduledFor: notificationData.scheduled_for,
      sentAt: notificationData.sent_at,
      deliveredAt: notificationData.delivered_at,
      failedAt: notificationData.failed_at,
      errorMessage: notificationData.error_message,
      retryCount: notificationData.retry_count,
      maxRetries: notificationData.max_retries,
      relatedEntityType: notificationData.related_entity_type,
      relatedEntityId: notificationData.related_entity_id,
      metadata: notificationData.metadata,
      createdAt: notificationData.createdAt,
      updatedAt: notificationData.updatedAt
    };
  }

  private formatNotificationSchedule(scheduleData: any): NotificationSchedule {
    return {
      id: scheduleData.id,
      organizationId: scheduleData.organizationId,
      name: scheduleData.name,
      description: scheduleData.description,
      notificationType: scheduleData.notification_type,
      templateId: scheduleData.template_id,
      scheduleType: scheduleData.schedule_type,
      scheduleConfig: scheduleData.schedule_config,
      conditions: scheduleData.conditions || [],
      isActive: scheduleData.is_active,
      createdAt: scheduleData.createdAt,
      updatedAt: scheduleData.updatedAt
    };
  }

  private formatNotificationRecipient(recipientData: any): NotificationRecipient {
    return {
      id: recipientData.id,
      organizationId: recipientData.organizationId,
      email: recipientData.email,
      name: recipientData.name,
      notificationTypes: recipientData.notification_types || [],
      isActive: recipientData.is_active,
      unsubscribeToken: recipientData.unsubscribe_token,
      preferences: recipientData.preferences,
      createdAt: recipientData.createdAt,
      updatedAt: recipientData.updatedAt
    };
  }

  private formatEmailProvider(providerData: any): EmailProvider {
    return {
      id: providerData.id,
      organizationId: providerData.organizationId,
      name: providerData.name,
      provider: providerData.provider,
      config: providerData.config,
      isActive: providerData.is_active,
      isDefault: providerData.is_default,
      dailyLimit: providerData.daily_limit,
      monthlyLimit: providerData.monthly_limit,
      createdAt: providerData.createdAt,
      updatedAt: providerData.updatedAt
    };
  }
}