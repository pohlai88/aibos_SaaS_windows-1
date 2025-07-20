// SHRM Notification Service - Enterprise Grade Notification Management
// Following isolation standards with comprehensive notification handling

import { 
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from '../constants';
import type { 
  Notification, 
  Employee, 
  PayrollRecord, 
  LeaveRequest, 
  PerformanceReview 
} from '../types';

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  variables: string[];
}

export interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  defaultPriority: string;
  retryAttempts: number;
  retryDelay: number;
}

export class SHRMNotificationService {
  private config: NotificationConfig;
  private templates: Map<string, NotificationTemplate>;

  constructor(config?: Partial<NotificationConfig>) {
    this.config = {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: false,
      inAppEnabled: true,
      defaultPriority: NOTIFICATION_PRIORITY.MEDIUM,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Employee-related templates
    this.templates.set('employee_created', {
      id: 'employee_created',
      title: 'New Employee Added',
      message: 'A new employee, {employee_name}, has been added to the system.',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['employee_name']
    });

    this.templates.set('employee_updated', {
      id: 'employee_updated',
      title: 'Employee Information Updated',
      message: 'Employee information for {employee_name} has been updated.',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITY.LOW,
      variables: ['employee_name']
    });

    this.templates.set('employee_terminated', {
      id: 'employee_terminated',
      title: 'Employee Termination',
      message: 'Employee {employee_name} has been terminated effective {termination_date}.',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITY.HIGH,
      variables: ['employee_name', 'termination_date']
    });

    // Payroll-related templates
    this.templates.set('payroll_processed', {
      id: 'payroll_processed',
      title: 'Payroll Processed',
      message: 'Payroll for {employee_name} has been processed. Net pay: {currency} {net_pay}.',
      category: NOTIFICATION_CATEGORIES.PAYROLL,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['employee_name', 'currency', 'net_pay']
    });

    this.templates.set('payroll_paid', {
      id: 'payroll_paid',
      title: 'Payroll Payment Confirmed',
      message: 'Payment of {currency} {net_pay} has been confirmed for {employee_name}.',
      category: NOTIFICATION_CATEGORIES.PAYROLL,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['employee_name', 'currency', 'net_pay']
    });

    this.templates.set('payroll_error', {
      id: 'payroll_error',
      title: 'Payroll Processing Error',
      message: 'Error processing payroll for {employee_name}. Please review and retry.',
      category: NOTIFICATION_CATEGORIES.PAYROLL,
      priority: NOTIFICATION_PRIORITY.HIGH,
      variables: ['employee_name']
    });

    // Leave-related templates
    this.templates.set('leave_request_created', {
      id: 'leave_request_created',
      title: 'New Leave Request',
      message: '{employee_name} has submitted a leave request for {days} days from {start_date} to {end_date}.',
      category: NOTIFICATION_CATEGORIES.LEAVE,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['employee_name', 'days', 'start_date', 'end_date']
    });

    this.templates.set('leave_request_approved', {
      id: 'leave_request_approved',
      title: 'Leave Request Approved',
      message: 'Your leave request for {days} days from {start_date} to {end_date} has been approved.',
      category: NOTIFICATION_CATEGORIES.LEAVE,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['days', 'start_date', 'end_date']
    });

    this.templates.set('leave_request_rejected', {
      id: 'leave_request_rejected',
      title: 'Leave Request Rejected',
      message: 'Your leave request for {days} days from {start_date} to {end_date} has been rejected. Reason: {reason}.',
      category: NOTIFICATION_CATEGORIES.LEAVE,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['days', 'start_date', 'end_date', 'reason']
    });

    // Performance-related templates
    this.templates.set('performance_review_due', {
      id: 'performance_review_due',
      title: 'Performance Review Due',
      message: 'Performance review for {employee_name} is due on {due_date}.',
      category: NOTIFICATION_CATEGORIES.PERFORMANCE,
      priority: NOTIFICATION_PRIORITY.HIGH,
      variables: ['employee_name', 'due_date']
    });

    this.templates.set('performance_review_completed', {
      id: 'performance_review_completed',
      title: 'Performance Review Completed',
      message: 'Performance review for {employee_name} has been completed with rating: {rating}/5.',
      category: NOTIFICATION_CATEGORIES.PERFORMANCE,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['employee_name', 'rating']
    });

    // Compliance-related templates
    this.templates.set('compliance_deadline', {
      id: 'compliance_deadline',
      title: 'Compliance Deadline Approaching',
      message: 'Compliance report {report_type} is due on {due_date}. Please submit before deadline.',
      category: NOTIFICATION_CATEGORIES.COMPLIANCE,
      priority: NOTIFICATION_PRIORITY.HIGH,
      variables: ['report_type', 'due_date']
    });

    this.templates.set('compliance_overdue', {
      id: 'compliance_overdue',
      title: 'Compliance Report Overdue',
      message: 'Compliance report {report_type} is overdue. Please submit immediately to avoid penalties.',
      category: NOTIFICATION_CATEGORIES.COMPLIANCE,
      priority: NOTIFICATION_PRIORITY.URGENT,
      variables: ['report_type']
    });

    // System-related templates
    this.templates.set('system_maintenance', {
      id: 'system_maintenance',
      title: 'System Maintenance Scheduled',
      message: 'System maintenance is scheduled for {maintenance_date} from {start_time} to {end_time}.',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      variables: ['maintenance_date', 'start_time', 'end_time']
    });

    this.templates.set('system_error', {
      id: 'system_error',
      title: 'System Error Detected',
      message: 'A system error has been detected: {error_message}. Technical team has been notified.',
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      priority: NOTIFICATION_PRIORITY.HIGH,
      variables: ['error_message']
    });
  }

  // Core notification methods
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      recipient_id: notificationData.recipient_id!,
      type: notificationData.type || NOTIFICATION_TYPES.IN_APP,
      title: notificationData.title!,
      message: notificationData.message!,
      category: notificationData.category || NOTIFICATION_CATEGORIES.OTHER,
      priority: notificationData.priority || this.config.defaultPriority,
      status: NOTIFICATION_STATUS.PENDING,
      metadata: notificationData.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scheduled_at: notificationData.scheduled_at,
      sent_at: notificationData.sent_at,
      read_at: notificationData.read_at
    };

    // Send notification based on type
    await this.sendNotification(notification);

    return notification;
  }

  async sendNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.type) {
        case NOTIFICATION_TYPES.EMAIL:
          await this.sendEmailNotification(notification);
          break;
        case NOTIFICATION_TYPES.SMS:
          await this.sendSMSNotification(notification);
          break;
        case NOTIFICATION_TYPES.PUSH:
          await this.sendPushNotification(notification);
          break;
        case NOTIFICATION_TYPES.IN_APP:
          await this.sendInAppNotification(notification);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }

      // Update notification status
      notification.status = NOTIFICATION_STATUS.SENT;
      notification.sent_at = new Date().toISOString();
      notification.updated_at = new Date().toISOString();

    } catch (error) {
      notification.status = NOTIFICATION_STATUS.FAILED;
      notification.updated_at = new Date().toISOString();
      throw error;
    }
  }

  // Template-based notification methods
  async sendTemplatedNotification(
    templateId: string,
    recipientId: string,
    variables: Record<string, any>,
    type: string = NOTIFICATION_TYPES.IN_APP
  ): Promise<Notification> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Notification template not found: ${templateId}`);
    }

    let title = template.title;
    let message = template.message;

    // Replace variables in template
    template.variables.forEach(variable => {
      const value = variables[variable];
      if (value !== undefined) {
        title = title.replace(`{${variable}}`, String(value));
        message = message.replace(`{${variable}}`, String(value));
      }
    });

    return this.createNotification({
      recipient_id: recipientId,
      type,
      title,
      message,
      category: template.category,
      priority: template.priority,
      metadata: { templateId, variables }
    });
  }

  // Employee-related notifications
  async notifyEmployeeCreated(employee: Employee, recipientIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const recipientId of recipientIds) {
      const notification = await this.sendTemplatedNotification(
        'employee_created',
        recipientId,
        {
          employee_name: `${employee.first_name} ${employee.last_name}`
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  async notifyEmployeeUpdated(employee: Employee, recipientIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const recipientId of recipientIds) {
      const notification = await this.sendTemplatedNotification(
        'employee_updated',
        recipientId,
        {
          employee_name: `${employee.first_name} ${employee.last_name}`
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  async notifyEmployeeTerminated(employee: Employee, terminationDate: string, recipientIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const recipientId of recipientIds) {
      const notification = await this.sendTemplatedNotification(
        'employee_terminated',
        recipientId,
        {
          employee_name: `${employee.first_name} ${employee.last_name}`,
          termination_date: terminationDate
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  // Payroll-related notifications
  async notifyPayrollProcessed(payrollRecord: PayrollRecord, employee: Employee): Promise<Notification> {
    return this.sendTemplatedNotification(
      'payroll_processed',
      employee.id,
      {
        employee_name: `${employee.first_name} ${employee.last_name}`,
        currency: payrollRecord.currency,
        net_pay: payrollRecord.net_pay.toLocaleString()
      },
      NOTIFICATION_TYPES.EMAIL
    );
  }

  async notifyPayrollPaid(payrollRecord: PayrollRecord, employee: Employee): Promise<Notification> {
    return this.sendTemplatedNotification(
      'payroll_paid',
      employee.id,
      {
        employee_name: `${employee.first_name} ${employee.last_name}`,
        currency: payrollRecord.currency,
        net_pay: payrollRecord.net_pay.toLocaleString()
      },
      NOTIFICATION_TYPES.EMAIL
    );
  }

  async notifyPayrollError(employee: Employee, errorMessage: string, adminIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    // Notify employee
    const employeeNotification = await this.sendTemplatedNotification(
      'payroll_error',
      employee.id,
      {
        employee_name: `${employee.first_name} ${employee.last_name}`
      }
    );
    notifications.push(employeeNotification);

    // Notify admins
    for (const adminId of adminIds) {
      const adminNotification = await this.sendTemplatedNotification(
        'payroll_error',
        adminId,
        {
          employee_name: `${employee.first_name} ${employee.last_name}`
        }
      );
      notifications.push(adminNotification);
    }

    return notifications;
  }

  // Leave-related notifications
  async notifyLeaveRequestCreated(leaveRequest: LeaveRequest, employee: Employee, managerIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    // Notify managers
    for (const managerId of managerIds) {
      const notification = await this.sendTemplatedNotification(
        'leave_request_created',
        managerId,
        {
          employee_name: `${employee.first_name} ${employee.last_name}`,
          days: leaveRequest.days_requested,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  async notifyLeaveRequestApproved(leaveRequest: LeaveRequest, employee: Employee): Promise<Notification> {
    return this.sendTemplatedNotification(
      'leave_request_approved',
      employee.id,
      {
        days: leaveRequest.days_requested,
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date
      },
      NOTIFICATION_TYPES.EMAIL
    );
  }

  async notifyLeaveRequestRejected(leaveRequest: LeaveRequest, employee: Employee, reason: string): Promise<Notification> {
    return this.sendTemplatedNotification(
      'leave_request_rejected',
      employee.id,
      {
        days: leaveRequest.days_requested,
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        reason
      },
      NOTIFICATION_TYPES.EMAIL
    );
  }

  // Performance-related notifications
  async notifyPerformanceReviewDue(employee: Employee, dueDate: string, reviewerIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const reviewerId of reviewerIds) {
      const notification = await this.sendTemplatedNotification(
        'performance_review_due',
        reviewerId,
        {
          employee_name: `${employee.first_name} ${employee.last_name}`,
          due_date: dueDate
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  async notifyPerformanceReviewCompleted(review: PerformanceReview, employee: Employee): Promise<Notification> {
    return this.sendTemplatedNotification(
      'performance_review_completed',
      employee.id,
      {
        employee_name: `${employee.first_name} ${employee.last_name}`,
        rating: review.overall_rating || 'Not rated'
      }
    );
  }

  // Compliance-related notifications
  async notifyComplianceDeadline(reportType: string, dueDate: string, adminIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const adminId of adminIds) {
      const notification = await this.sendTemplatedNotification(
        'compliance_deadline',
        adminId,
        {
          report_type: reportType,
          due_date: dueDate
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  async notifyComplianceOverdue(reportType: string, adminIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const adminId of adminIds) {
      const notification = await this.sendTemplatedNotification(
        'compliance_overdue',
        adminId,
        {
          report_type: reportType
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  // System-related notifications
  async notifySystemMaintenance(maintenanceDate: string, startTime: string, endTime: string, allUserIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of allUserIds) {
      const notification = await this.sendTemplatedNotification(
        'system_maintenance',
        userId,
        {
          maintenance_date: maintenanceDate,
          start_time: startTime,
          end_time: endTime
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  async notifySystemError(errorMessage: string, adminIds: string[]): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const adminId of adminIds) {
      const notification = await this.sendTemplatedNotification(
        'system_error',
        adminId,
        {
          error_message: errorMessage
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  // Bulk notification methods
  async sendBulkNotifications(
    recipientIds: string[],
    title: string,
    message: string,
    category: string = NOTIFICATION_CATEGORIES.OTHER,
    type: string = NOTIFICATION_TYPES.IN_APP
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const recipientId of recipientIds) {
      const notification = await this.createNotification({
        recipient_id: recipientId,
        type,
        title,
        message,
        category
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Utility methods
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    if (!this.config.emailEnabled) {
      throw new Error('Email notifications are disabled');
    }
    
    // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending email notification: ${notification.title} to ${notification.recipient_id}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendSMSNotification(notification: Notification): Promise<void> {
    if (!this.config.smsEnabled) {
      throw new Error('SMS notifications are disabled');
    }
    
    // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`Sending SMS notification: ${notification.title} to ${notification.recipient_id}`);
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    if (!this.config.pushEnabled) {
      throw new Error('Push notifications are disabled');
    }
    
    // Implementation would integrate with push notification service (Firebase, OneSignal, etc.)
    console.log(`Sending push notification: ${notification.title} to ${notification.recipient_id}`);
    
    // Simulate push notification sending
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async sendInAppNotification(notification: Notification): Promise<void> {
    if (!this.config.inAppEnabled) {
      throw new Error('In-app notifications are disabled');
    }
    
    // Implementation would store notification in database for in-app display
    console.log(`Storing in-app notification: ${notification.title} for ${notification.recipient_id}`);
    
    // Simulate storing notification
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Configuration methods
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }
} 