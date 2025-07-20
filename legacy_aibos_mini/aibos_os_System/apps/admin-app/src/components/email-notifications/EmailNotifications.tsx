'use client';

import React, { useState, useEffect } from 'react';
import { 
  EmailTemplate, 
  EmailNotification, 
  NotificationSchedule, 
  NotificationRecipient, 
  EmailProvider, 
  NotificationStatistics,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  EmailTemplateType
} from '@aibos/ledger-sdk';
import { 
  LuxuryTabs, 
  LuxuryModal, 
  LuxurySelect, 
  GlassPanel, 
  MetricCard,
  DashboardSection 
} from '../ui';
import { 
  Mail, 
  Template, 
  Clock, 
  Users, 
  Settings, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';

interface EmailNotificationsProps {
  organizationId: string;
}

export default function EmailNotifications({ organizationId }: EmailNotificationsProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [statistics, setStatistics] = useState<NotificationStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showCreateRecipient, setShowCreateRecipient] = useState(false);
  const [showCreateProvider, setShowCreateProvider] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    type: 'html' as EmailTemplateType,
    subject: '',
    body: '',
    notificationType: 'invoice_reminder' as NotificationType,
    isActive: true
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    description: '',
    notificationType: 'invoice_reminder' as NotificationType,
    templateId: '',
    scheduleType: 'immediate' as 'immediate' | 'scheduled' | 'recurring',
    isActive: true
  });

  const [recipientForm, setRecipientForm] = useState({
    email: '',
    name: '',
    notificationTypes: [] as NotificationType[],
    isActive: true,
    preferences: {
      emailFrequency: 'immediate' as 'immediate' | 'daily' | 'weekly',
      timezone: 'UTC',
      language: 'en'
    }
  });

  const [providerForm, setProviderForm] = useState({
    name: '',
    provider: 'smtp' as 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'custom',
    config: {
      host: '',
      port: 587,
      username: '',
      password: '',
      secure: true
    },
    isActive: true,
    isDefault: false
  });

  const [notificationForm, setNotificationForm] = useState({
    templateId: '',
    recipientEmail: '',
    recipientName: '',
    priority: 'normal' as NotificationPriority,
    variables: {} as Record<string, any>
  });

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data based on active tab
      switch (activeTab) {
        case 'templates':
          // Load templates
          break;
        case 'notifications':
          // Load notifications
          break;
        case 'schedules':
          // Load schedules
          break;
        case 'recipients':
          // Load recipients
          break;
        case 'providers':
          // Load providers
          break;
        case 'statistics':
          // Load statistics
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      // Create template logic
      setShowCreateTemplate(false);
      setTemplateForm({
        name: '',
        description: '',
        type: 'html',
        subject: '',
        body: '',
        notificationType: 'invoice_reminder',
        isActive: true
      });
      await loadData();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      // Create schedule logic
      setShowCreateSchedule(false);
      setScheduleForm({
        name: '',
        description: '',
        notificationType: 'invoice_reminder',
        templateId: '',
        scheduleType: 'immediate',
        isActive: true
      });
      await loadData();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleCreateRecipient = async () => {
    try {
      // Create recipient logic
      setShowCreateRecipient(false);
      setRecipientForm({
        email: '',
        name: '',
        notificationTypes: [],
        isActive: true,
        preferences: {
          emailFrequency: 'immediate',
          timezone: 'UTC',
          language: 'en'
        }
      });
      await loadData();
    } catch (error) {
      console.error('Error creating recipient:', error);
    }
  };

  const handleCreateProvider = async () => {
    try {
      // Create provider logic
      setShowCreateProvider(false);
      setProviderForm({
        name: '',
        provider: 'smtp',
        config: {
          host: '',
          port: 587,
          username: '',
          password: '',
          secure: true
        },
        isActive: true,
        isDefault: false
      });
      await loadData();
    } catch (error) {
      console.error('Error creating provider:', error);
    }
  };

  const handleSendNotification = async () => {
    try {
      // Send notification logic
      setShowSendNotification(false);
      setNotificationForm({
        templateId: '',
        recipientEmail: '',
        recipientName: '',
        priority: 'normal',
        variables: {}
      });
      await loadData();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const tabs = [
    {
      id: 'templates',
      label: 'Email Templates',
      icon: <Template className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Templates</h3>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <GlassPanel key={template.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{template.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{template.notificationType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${template.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Mail className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Notifications</h3>
            <button
              onClick={() => setShowSendNotification(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Notification
            </button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <GlassPanel key={notification.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(notification.status)}
                      <h4 className="font-semibold">{notification.subject}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      To: {notification.recipientEmail}
                      {notification.recipientName && ` (${notification.recipientName})`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {notification.notificationType} • 
                      Sent: {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedNotification(notification)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {notification.status === 'failed' && (
                      <button className="p-2 text-gray-600 hover:text-orange-600 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: <Clock className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notification Schedules</h3>
            <button
              onClick={() => setShowCreateSchedule(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedules.map((schedule) => (
              <GlassPanel key={schedule.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{schedule.name}</h4>
                    <p className="text-sm text-gray-600">{schedule.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{schedule.notificationType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Schedule:</span>
                    <span className="font-medium">{schedule.scheduleType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${schedule.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'recipients',
      label: 'Recipients',
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notification Recipients</h3>
            <button
              onClick={() => setShowCreateRecipient(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Recipient
            </button>
          </div>

          <div className="space-y-4">
            {recipients.map((recipient) => (
              <GlassPanel key={recipient.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{recipient.email}</h4>
                    {recipient.name && (
                      <p className="text-sm text-gray-600 mb-2">{recipient.name}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {recipient.notificationTypes.map((type) => (
                        <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Frequency: {recipient.preferences.emailFrequency} • 
                      Timezone: {recipient.preferences.timezone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'providers',
      label: 'Email Providers',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Providers</h3>
            <button
              onClick={() => setShowCreateProvider(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <GlassPanel key={provider.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{provider.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{provider.provider}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${provider.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {provider.isDefault && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Default:</span>
                      <span className="font-medium text-blue-600">Yes</span>
                    </div>
                  )}
                  {provider.dailyLimit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Limit:</span>
                      <span className="font-medium">{provider.dailyLimit}</span>
                    </div>
                  )}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Email Notification Statistics</h3>

          {statistics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Sent"
                  value={statistics.totalSent.toString()}
                  icon={<Send className="w-6 h-6" />}
                  trend="up"
                  trendValue="12%"
                />
                <MetricCard
                  title="Delivery Rate"
                  value={`${statistics.deliveryRate.toFixed(1)}%`}
                  icon={<CheckCircle className="w-6 h-6" />}
                  trend="up"
                  trendValue="2.1%"
                />
                <MetricCard
                  title="Failed"
                  value={statistics.totalFailed.toString()}
                  icon={<XCircle className="w-6 h-6" />}
                  trend="down"
                  trendValue="8.3%"
                />
                <MetricCard
                  title="Bounce Rate"
                  value={`${statistics.bounceRate.toFixed(1)}%`}
                  icon={<AlertCircle className="w-6 h-6" />}
                  trend="down"
                  trendValue="1.2%"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel className="p-6">
                  <h4 className="font-semibold mb-4">Performance by Type</h4>
                  <div className="space-y-3">
                    {Object.entries(statistics.byType).map(([type, stats]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">{stats.sent} sent</span>
                          <span className="text-sm text-gray-600">{stats.delivered} delivered</span>
                          <span className={`text-sm font-medium ${stats.rate > 90 ? 'text-green-600' : stats.rate > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {stats.rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>

                <GlassPanel className="p-6">
                  <h4 className="font-semibold mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {statistics.byDate.slice(-7).map((day) => (
                      <div key={day.date} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">{day.sent} sent</span>
                          <span className="text-sm text-gray-600">{day.delivered} delivered</span>
                          <span className="text-sm text-gray-600">{day.failed} failed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <DashboardSection title="Email Notifications" description="Manage email templates, notifications, and delivery settings">
        <LuxuryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mt-6"
        />
      </DashboardSection>

      {/* Create Template Modal */}
      <LuxuryModal
        isOpen={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        title="Create Email Template"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <LuxurySelect
                value={templateForm.type}
                onChange={(value) => setTemplateForm({ ...templateForm, type: value as EmailTemplateType })}
                options={[
                  { value: 'html', label: 'HTML' },
                  { value: 'text', label: 'Plain Text' },
                  { value: 'markdown', label: 'Markdown' }
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notification Type</label>
            <LuxurySelect
              value={templateForm.notificationType}
              onChange={(value) => setTemplateForm({ ...templateForm, notificationType: value as NotificationType })}
              options={[
                { value: 'invoice_reminder', label: 'Invoice Reminder' },
                { value: 'bill_reminder', label: 'Bill Reminder' },
                { value: 'payment_received', label: 'Payment Received' },
                { value: 'payment_due', label: 'Payment Due' },
                { value: 'overdue_notice', label: 'Overdue Notice' },
                { value: 'reconciliation_complete', label: 'Reconciliation Complete' },
                { value: 'tax_due', label: 'Tax Due' },
                { value: 'report_ready', label: 'Report Ready' },
                { value: 'workflow_approval', label: 'Workflow Approval' },
                { value: 'system_alert', label: 'System Alert' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Body</label>
            <textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email body content. Use {{variable}} for dynamic content."
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={templateForm.isActive}
              onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm">Active</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowCreateTemplate(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Template
          </button>
        </div>
      </LuxuryModal>

      {/* Send Notification Modal */}
      <LuxuryModal
        isOpen={showSendNotification}
        onClose={() => setShowSendNotification(false)}
        title="Send Email Notification"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template</label>
            <LuxurySelect
              value={notificationForm.templateId}
              onChange={(value) => setNotificationForm({ ...notificationForm, templateId: value })}
              options={templates.map(t => ({ value: t.id, label: t.name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Email</label>
            <input
              type="email"
              value={notificationForm.recipientEmail}
              onChange={(e) => setNotificationForm({ ...notificationForm, recipientEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Name (Optional)</label>
            <input
              type="text"
              value={notificationForm.recipientName}
              onChange={(e) => setNotificationForm({ ...notificationForm, recipientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <LuxurySelect
              value={notificationForm.priority}
              onChange={(value) => setNotificationForm({ ...notificationForm, priority: value as NotificationPriority })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowSendNotification(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendNotification}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Send Notification
          </button>
        </div>
      </LuxuryModal>

      {/* Template Details Modal */}
      <LuxuryModal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.name || 'Template Details'}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Type</label>
                <p className="text-sm">{selectedTemplate.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm capitalize">{selectedTemplate.notificationType.replace('_', ' ')}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Subject</label>
              <p className="text-sm">{selectedTemplate.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Body</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.body}</pre>
              </div>
            </div>
            {selectedTemplate.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Available Variables</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.map((variable) => (
                    <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </LuxuryModal>

      {/* Notification Details Modal */}
      <LuxuryModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedNotification.status)}
                  <span className="text-sm capitalize">{selectedNotification.status}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Priority</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPriorityColor(selectedNotification.priority)}`}>
                  {selectedNotification.priority}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Recipient</label>
              <p className="text-sm">{selectedNotification.recipientEmail}</p>
              {selectedNotification.recipientName && (
                <p className="text-sm text-gray-600">{selectedNotification.recipientName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Subject</label>
              <p className="text-sm">{selectedNotification.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Body</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{selectedNotification.body}</pre>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              </div>
              {selectedNotification.sentAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Sent</label>
                  <p className="text-sm">{new Date(selectedNotification.sentAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            {selectedNotification.errorMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Error Message</label>
                <p className="text-sm text-red-600">{selectedNotification.errorMessage}</p>
              </div>
            )}
          </div>
        )}
      </LuxuryModal>
    </div>
  );
} 