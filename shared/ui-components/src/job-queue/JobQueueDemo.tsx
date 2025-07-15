import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus, 
  Settings, 
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { JobQueueProvider, JobQueueDashboard, JobForm, useJobQueue } from './index';
import { JobStatus, JobPriority } from '@aibos/shared/lib/queue';

export interface JobQueueDemoProps {
  className?: string;
  showForm?: boolean;
  showStats?: boolean;
  queueName?: string;
}

// Mock job data for demo
const mockJobs = [
  {
    id: 'job-1',
    name: 'Data Processing Task',
    data: { userId: 123, action: 'process_data' },
    status: JobStatus.RUNNING,
    priority: JobPriority.HIGH,
    createdAt: new Date(Date.now() - 300000), // 5 minutes ago
    startedAt: new Date(Date.now() - 240000), // 4 minutes ago
    retries: 0,
    maxRetries: 3,
    tags: ['data-processing', 'user-123'],
    metadata: { source: 'api', batch: 'batch-1' },
    progress: 65
  },
  {
    id: 'job-2',
    name: 'Email Notification',
    data: { email: 'user@example.com', template: 'welcome' },
    status: JobStatus.PENDING,
    priority: JobPriority.NORMAL,
    createdAt: new Date(Date.now() - 120000), // 2 minutes ago
    retries: 0,
    maxRetries: 3,
    tags: ['email', 'notification'],
    metadata: { channel: 'email', priority: 'normal' }
  },
  {
    id: 'job-3',
    name: 'Report Generation',
    data: { reportType: 'monthly', userId: 456 },
    status: JobStatus.COMPLETED,
    priority: JobPriority.LOW,
    createdAt: new Date(Date.now() - 600000), // 10 minutes ago
    startedAt: new Date(Date.now() - 580000), // 9.7 minutes ago
    completedAt: new Date(Date.now() - 500000), // 8.3 minutes ago
    retries: 0,
    maxRetries: 3,
    tags: ['report', 'monthly'],
    metadata: { format: 'pdf', size: 'large' },
    result: { reportUrl: '/reports/monthly-456.pdf' }
  },
  {
    id: 'job-4',
    name: 'Database Backup',
    data: { database: 'production', type: 'full' },
    status: JobStatus.FAILED,
    priority: JobPriority.CRITICAL,
    createdAt: new Date(Date.now() - 900000), // 15 minutes ago
    startedAt: new Date(Date.now() - 880000), // 14.7 minutes ago
    retries: 3,
    maxRetries: 3,
    tags: ['backup', 'database', 'critical'],
    metadata: { size: '2GB', location: 's3' },
    error: 'Insufficient storage space on backup server'
  },
  {
    id: 'job-5',
    name: 'Cache Invalidation',
    data: { cacheKeys: ['user:123', 'user:456'] },
    status: JobStatus.RETRY,
    priority: JobPriority.URGENT,
    createdAt: new Date(Date.now() - 180000), // 3 minutes ago
    startedAt: new Date(Date.now() - 160000), // 2.7 minutes ago
    retries: 1,
    maxRetries: 3,
    tags: ['cache', 'invalidation'],
    metadata: { cacheType: 'redis', keys: 2 }
  }
];

// Mock API functions for demo
const mockApi = {
  fetchJobs: async () => ({ jobs: mockJobs }),
  retryJob: async (jobId: string) => {
    console.log(`Retrying job: ${jobId}`);
    return { success: true };
  },
  cancelJob: async (jobId: string) => {
    console.log(`Cancelling job: ${jobId}`);
    return { success: true };
  },
  deleteJob: async (jobId: string) => {
    console.log(`Deleting job: ${jobId}`);
    return { success: true };
  },
  addJob: async (jobConfig: any) => {
    console.log('Adding new job:', jobConfig);
    return {
      id: `job-${Date.now()}`,
      name: jobConfig.name,
      data: jobConfig.data,
      status: JobStatus.PENDING,
      priority: jobConfig.priority,
      createdAt: new Date(),
      retries: 0,
      maxRetries: jobConfig.retries || 3,
      tags: jobConfig.tags || [],
      metadata: jobConfig.metadata || {}
    };
  }
};

// Demo Stats Component
const DemoStats: React.FC = () => {
  const { stats } = useJobQueue();
  
  const statItems = [
    { label: 'Total Jobs', value: stats.total, icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Running', value: stats.running, icon: Activity, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Failed', value: stats.failed, icon: XCircle, color: 'bg-red-500' },
    { label: 'Retry', value: stats.retry, icon: AlertCircle, color: 'bg-orange-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main Demo Component
export const JobQueueDemo: React.FC<JobQueueDemoProps> = ({
  className = '',
  showForm = true,
  showStats = true,
  queueName = 'demo-queue'
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form'>('dashboard');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Job Dashboard', icon: BarChart3 },
    { id: 'form', label: 'Add Job', icon: Plus }
  ];

  return (
    <JobQueueProvider
      queueName={queueName}
      refreshInterval={10000} // 10 seconds for demo
      apiEndpoint="/api/jobs"
      enableWebSocket={false} // Disable WebSocket for demo
      maxJobs={100}
    >
      <div className={`bg-gray-50 min-h-screen ${className}`}>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Queue Management</h1>
                <p className="mt-2 text-gray-600">
                  Enterprise-grade job queue monitoring and management system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Queue: {queueName}</span>
                </div>
                <button
                  onClick={() => setIsFormVisible(!isFormVisible)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Job</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {showStats && <DemoStats />}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'dashboard' | 'form')}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <JobQueueDashboard
                  queueName={queueName}
                  refreshInterval={10000}
                  showFilters={true}
                  showActions={true}
                  maxJobs={50}
                  onJobAction={(jobId, action) => {
                    console.log(`Job action: ${action} on job ${jobId}`);
                    // In a real app, this would call the actual API
                    switch (action) {
                      case 'retry':
                        mockApi.retryJob(jobId);
                        break;
                      case 'cancel':
                        mockApi.cancelJob(jobId);
                        break;
                      case 'delete':
                        mockApi.deleteJob(jobId);
                        break;
                    }
                  }}
                  onRefresh={() => {
                    console.log('Refreshing jobs...');
                  }}
                  jobs={mockJobs}
                  isLoading={false}
                  error={null}
                />
              </motion.div>
            )}

            {activeTab === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <JobForm
                  onSubmit={async (jobData) => {
                    console.log('Submitting job:', jobData);
                    await mockApi.addJob(jobData);
                    setActiveTab('dashboard');
                  }}
                  onCancel={() => setActiveTab('dashboard')}
                  isLoading={false}
                  error={null}
                  showAdvanced={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Form */}
          <AnimatePresence>
            {isFormVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setIsFormVisible(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl"
                >
                  <JobForm
                    onSubmit={async (jobData) => {
                      console.log('Submitting job:', jobData);
                      await mockApi.addJob(jobData);
                      setIsFormVisible(false);
                    }}
                    onCancel={() => setIsFormVisible(false)}
                    isLoading={false}
                    error={null}
                    showAdvanced={true}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </JobQueueProvider>
  );
};

// Standalone Demo Component (without provider)
export const JobQueueDemoStandalone: React.FC<JobQueueDemoProps> = (props) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Queue Demo</h1>
          <p className="mt-2 text-gray-600">
            This is a standalone demo with mock data. In a real application, 
            you would connect to your actual job queue API.
          </p>
        </div>
        
        <JobQueueDashboard
          {...props}
          jobs={mockJobs}
          isLoading={false}
          error={null}
          onJobAction={(jobId, action) => {
            console.log(`Demo action: ${action} on job ${jobId}`);
          }}
          onRefresh={() => {
            console.log('Demo refresh triggered');
          }}
        />
      </div>
    </div>
  );
}; 