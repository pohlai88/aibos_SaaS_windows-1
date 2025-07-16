// Job Queue Types
// Temporary types until @aibos/shared/lib/queue is properly linked

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
  RETRY = 'retry' // Alias for RETRYING
}

export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical' // Add missing CRITICAL priority
}

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  priority: JobPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retries: number;
  maxRetries: number;
  tags: string[];
  error?: string;
  progress?: number;
  metadata?: Record<string, any>;
}

export interface JobConfig {
  maxRetries: number;
  timeout: number;
  priority: JobPriority;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface JobQueueStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  retrying: number;
  retry: number; // Alias for retrying
  averageProcessingTime: number;
  successRate: number;
}

export interface JobFilter {
  status?: JobStatus[];
  priority?: JobPriority[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface JobSort {
  field: keyof Job;
  direction: 'asc' | 'desc';
}

// Status configuration
export const JOB_STATUS_CONFIG = {
  [JobStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'clock'
  },
  [JobStatus.RUNNING]: {
    label: 'Running',
    color: 'bg-blue-100 text-blue-800',
    icon: 'play'
  },
  [JobStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: 'check'
  },
  [JobStatus.FAILED]: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: 'x'
  },
  [JobStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: 'stop'
  },
  [JobStatus.RETRYING]: {
    label: 'Retrying',
    color: 'bg-orange-100 text-orange-800',
    icon: 'refresh'
  },
  [JobStatus.RETRY]: {
    label: 'Retry',
    color: 'bg-orange-100 text-orange-800',
    icon: 'refresh'
  }
} as const;

// Priority configuration
export const JOB_PRIORITY_CONFIG = {
  [JobPriority.LOW]: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800',
    icon: 'arrow-down'
  },
  [JobPriority.NORMAL]: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-800',
    icon: 'minus'
  },
  [JobPriority.HIGH]: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800',
    icon: 'arrow-up'
  },
  [JobPriority.URGENT]: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800',
    icon: 'alert-triangle'
  },
  [JobPriority.CRITICAL]: {
    label: 'Critical',
    color: 'bg-purple-100 text-purple-800',
    icon: 'alert-octagon'
  }
} as const;

// Priority weight mapping for sorting
export const PRIORITY_WEIGHTS = {
  [JobPriority.LOW]: 1,
  [JobPriority.NORMAL]: 2,
  [JobPriority.HIGH]: 3,
  [JobPriority.URGENT]: 4,
  [JobPriority.CRITICAL]: 5
} as const;

// Utility function to compare priorities
export const comparePriorities = (a: JobPriority, b: JobPriority): number => {
  return PRIORITY_WEIGHTS[a] - PRIORITY_WEIGHTS[b];
}; 