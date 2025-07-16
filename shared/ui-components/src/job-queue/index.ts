/**
 * Job Queue UI Components
 * 
 * Enterprise-grade job queue management components for AI-BOS platform.
 * Provides comprehensive job monitoring, management, and creation capabilities.
 */

// Job Queue Components
// Enterprise-grade job queue management and monitoring

export { JobQueueDashboard } from './JobQueueDashboard';
export { JobQueueProvider } from './JobQueueProvider';
export { JobForm } from './JobForm';

// Re-export types
export type { JobQueueDashboardProps } from './JobQueueDashboard';
export type { JobQueueProviderProps } from './JobQueueProvider';
export type { JobFormProps } from './JobForm';

// Re-export job types
export * from './types';

// Component Registry Entry
export const JOB_QUEUE_COMPONENTS = {
  JobQueueDashboard: 'job-queue/JobQueueDashboard',
  JobQueueProvider: 'job-queue/JobQueueProvider',
  JobForm: 'job-queue/JobForm',
  JobQueueDemo: 'job-queue/JobQueueDemo',
  JobQueueDemoStandalone: 'job-queue/JobQueueDemo'
} as const;

// Default Configuration
export const DEFAULT_JOB_QUEUE_CONFIG = {
  refreshInterval: 5000,
  maxJobs: 1000,
  enableWebSocket: true,
  showFilters: true,
  showActions: true,
  apiEndpoint: '/api/jobs'
} as const;

// Utility Functions
export const formatJobDuration = (startTime: Date, endTime?: Date): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = end.getTime() - start.getTime();
  
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${Math.round(duration / 1000)}s`;
  if (duration < 3600000) return `${Math.round(duration / 60000)}m`;
  return `${Math.round(duration / 3600000)}h`;
};

export const getJobStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'running': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    case 'failed': return 'bg-red-500';
    case 'cancelled': return 'bg-gray-500';
    case 'retry': return 'bg-orange-500';
    default: return 'bg-gray-400';
  }
};

export const getJobPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1: return 'bg-gray-100 text-gray-800';
    case 2: return 'bg-blue-100 text-blue-800';
    case 3: return 'bg-orange-100 text-orange-800';
    case 4: return 'bg-red-100 text-red-800';
    case 5: return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getJobPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 1: return 'Low';
    case 2: return 'Normal';
    case 3: return 'High';
    case 4: return 'Urgent';
    case 5: return 'Critical';
    default: return 'Unknown';
  }
}; 