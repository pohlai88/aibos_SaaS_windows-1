import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, AlertCircle, Trash2, Filter, Search, Download, Settings,
  Eye, EyeOff, Clock, CheckCircle, XCircle, RefreshCw, Zap, Shield,
  TrendingUp, TrendingDown, Activity, Users, Database
} from 'lucide-react';
import { auditLog } from '../../utils/auditLogger';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';

// Enterprise-grade job types
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export interface Job {
  id: string;
  name: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  tags: string[];
  metadata?: {
    userId?: string;
    tenantId?: string;
    resourceUsage?: {
      cpu: number;
      memory: number;
      disk: number
};
    errorMessage?: string;
    retryCount?: number;
    maxRetries?: number;
    estimatedDuration?: number;
    actualDuration?: number
};
  // Enterprise features
  complianceLevel?: 'basic' | 'gdpr' | 'hipaa' | 'soc2';
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  auditTrail?: boolean
}

export interface JobFilter {
  status?: JobStatus[];
  priority?: JobPriority[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date
};
  search?: string;
  userId?: string;
  tenantId?: string
}

export interface AdvancedJobQueueProps {
  className?: string;
  queueName?: string;
  refreshInterval?: number;
  showFilters?: boolean;
  showActions?: boolean;
  maxJobs?: number;
  onJobAction?: (jobId: string,
  action: 'retry' | 'cancel' | 'delete' | 'pause' | 'resume') => void;
  onRefresh?: () => void;
  jobs?: Job[];
  isLoading?: boolean;
  error?: string | null;
  // Enterprise features
  complianceLevel?: 'basic' | 'gdpr' | 'hipaa' | 'soc2';
  auditTrail?: boolean;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  enableBulkOperations?: boolean;
  enableRealTimeMonitoring?: boolean;
  enablePerformanceMetrics?: boolean
}

// Status configuration with enterprise styling
const statusConfig = {
  [JobStatus.PENDING]: {
    label: 'Pending',
  color: 'bg-yellow-500',
    icon: Clock,
  textColor: 'text-yellow-700',
  bgColor: 'bg-yellow-50'
  },
  [JobStatus.RUNNING]: {
    label: 'Running',
  color: 'bg-blue-500',
    icon: Play,
  textColor: 'text-blue-700',
  bgColor: 'bg-blue-50'
  },
  [JobStatus.COMPLETED]: {
    label: 'Completed',
  color: 'bg-green-500',
    icon: CheckCircle,
  textColor: 'text-green-700',
  bgColor: 'bg-green-50'
  },
  [JobStatus.FAILED]: {
    label: 'Failed',
  color: 'bg-red-500',
    icon: XCircle,
  textColor: 'text-red-700',
  bgColor: 'bg-red-50'
  },
  [JobStatus.CANCELLED]: {
    label: 'Cancelled',
  color: 'bg-gray-500',
    icon: XCircle,
  textColor: 'text-gray-700',
  bgColor: 'bg-gray-50'
  },
  [JobStatus.RETRYING]: {
    label: 'Retrying',
  color: 'bg-orange-500',
    icon: RefreshCw,
  textColor: 'text-orange-700',
  bgColor: 'bg-orange-50'
  }
};

// Priority configuration
const priorityConfig = {
  [JobPriority.LOW]: {
    label: 'Low',
  color: 'bg-gray-100 text-gray-800',
    icon: TrendingDown
  },
  [JobPriority.NORMAL]: {
    label: 'Normal',
  color: 'bg-blue-100 text-blue-800',
    icon: Activity
  },
  [JobPriority.HIGH]: {
    label: 'High',
  color: 'bg-orange-100 text-orange-800',
    icon: TrendingUp
  },
  [JobPriority.URGENT]: {
    label: 'Urgent',
  color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  },
  [JobPriority.CRITICAL]: {
    label: 'Critical',
  color: 'bg-purple-100 text-purple-800',
    icon: Zap
  }
};

// Priority comparison function
const comparePriorities = (a: JobPriority,
  b: JobPriority): number => {
  const priorityOrder = {
    [JobPriority.LOW]: 1,
    [JobPriority.NORMAL]: 2,
    [JobPriority.HIGH]: 3,
    [JobPriority.URGENT]: 4,
    [JobPriority.CRITICAL]: 5
  };
  return priorityOrder[b] - priorityOrder[a]
};

// Main component with enterprise features
export const AdvancedJobQueue: React.FC<AdvancedJobQueueProps> = ({
  className = '',
  queueName = 'default',
  refreshInterval = 5000,
  showFilters = true,
  showActions = true,
  maxJobs = 100,
  onJobAction,
  onRefresh,
  jobs = [],
  isLoading = false,
  error = null,
  complianceLevel = 'gdpr',
  auditTrail = true,
  dataClassification = 'confidential',
  enableBulkOperations = true,
  enableRealTimeMonitoring = true,
  enablePerformanceMetrics = true
}) => {
  const [filter, setFilter] = useState<JobFilter>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(false);

  // Auto-refresh effect with enterprise compliance
  useEffect(() => {
    if (refreshInterval <= 0 || !enableRealTimeMonitoring) return;

    const interval = setInterval(() => {
      onRefresh?.();

      if (auditTrail) {
        auditLog('job_queue_refresh', {
          timestamp: new Date().toISOString(),
          queueName,
          jobCount: jobs.length,
          dataClassification
        })
}
    }, refreshInterval);

    return () => clearInterval(interval)
}, [refreshInterval, onRefresh, jobs.length, auditTrail, queueName, dataClassification, enableRealTimeMonitoring]);

  // Filter and sort jobs with enterprise optimization
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Apply status filter
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter((job) => filter.status!.includes(job.status))
}

    // Apply priority filter
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter((job) => filter.priority!.includes(job.priority))
}

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((job) =>
        filter.tags!.some((tag) => job.tags.includes(tag))
      )
}

    // Apply date range filter
    if (filter.dateRange) {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= filter.dateRange!.start && jobDate <= filter.dateRange!.end
})
}

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.name.toLowerCase().includes(searchLower) ||
          job.id.toLowerCase().includes(searchLower) ||
          job.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
}

    // Apply user/tenant filters
    if (filter.userId) {
      filtered = filtered.filter((job) => job.metadata?.userId === filter.userId)
}

    if (filter.tenantId) {
      filtered = filtered.filter((job) => job.metadata?.tenantId === filter.tenantId)
}

    // Sort jobs
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          comparison = comparePriorities(a.priority, b.priority);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break
}
      return sortOrder === 'asc' ? comparison : -comparison
});

    return filtered.slice(0, maxJobs)
}, [jobs, filter, sortBy, sortOrder, maxJobs]);

  // Statistics with enterprise metrics
  const stats = useMemo(() => {
    const allJobs = filteredJobs;
    const now = new Date();

    return {
      total: allJobs.length,
      pending: allJobs.filter((job) => job.status === JobStatus.PENDING).length,
      running: allJobs.filter((job) => job.status === JobStatus.RUNNING).length,
      completed: allJobs.filter((job) => job.status === JobStatus.COMPLETED).length,
      failed: allJobs.filter((job) => job.status === JobStatus.FAILED).length,
      retrying: allJobs.filter((job) => job.status === JobStatus.RETRYING).length,
      cancelled: allJobs.filter((job) => job.status === JobStatus.CANCELLED).length,
      // Performance metrics
      avgProcessingTime: allJobs
        .filter((job) => job.metadata?.actualDuration)
        .reduce((sum, job) => sum + (job.metadata?.actualDuration || 0), 0) /
        allJobs.filter((job) => job.metadata?.actualDuration).length || 0,
      successRate: allJobs.length > 0 ?
        (allJobs.filter((job) => job.status === JobStatus.COMPLETED).length / allJobs.length) * 100 : 0,
      // Resource usage
      totalCpuUsage: allJobs
        .filter((job) => job.status === JobStatus.RUNNING)
        .reduce((sum, job) => sum + (job.metadata?.resourceUsage?.cpu || 0), 0),
      totalMemoryUsage: allJobs
        .filter((job) => job.status === JobStatus.RUNNING)
        .reduce((sum, job) => sum + (job.metadata?.resourceUsage?.memory || 0), 0)
    }
}, [filteredJobs]);

  // Job action handler with enterprise compliance
  const handleJobAction = useCallback((jobId: string,
  action: 'retry' | 'cancel' | 'delete' | 'pause' | 'resume') => {
    onJobAction?.(jobId, action);

    if (auditTrail) {
      auditLog('job_action_performed', {
        timestamp: new Date().toISOString(),
        jobId,
        action,
        queueName,
        dataClassification
      })
}
  }, [onJobAction, auditTrail, queueName, dataClassification]);

  // Bulk operations with enterprise compliance
  const handleBulkAction = useCallback((action: 'retry' | 'cancel' | 'delete' | 'pause' | 'resume') => {
    selectedJobs.forEach((jobId) => {
      handleJobAction(jobId, action)
});

    setSelectedJobs(new Set());

    if (auditTrail) {
      auditLog('bulk_job_action_performed', {
        timestamp: new Date().toISOString(),
        action,
        jobCount: selectedJobs.size,
        queueName,
        dataClassification
      })
}
  }, [selectedJobs, handleJobAction, auditTrail, queueName, dataClassification]);

  // Select all functionality
  const handleSelectAll = useCallback(() => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
} else {
      setSelectedJobs(new Set(filteredJobs.map((job) => job.id)))
}
  }, [selectedJobs.size, filteredJobs]);

  // Export functionality with enterprise compliance
  const exportJobs = useCallback(() => {
    const exportData = filteredJobs.map((job) => ({
      id: job.id,
      name: job.name,
      status: job.status,
      priority: job.priority,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      tags: job.tags.join(', '),
      userId: job.metadata?.userId,
      tenantId: job.metadata?.tenantId,
      processingTime: job.metadata?.actualDuration
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${queueName}-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    if (auditTrail) {
      auditLog('jobs_exported', {
        timestamp: new Date().toISOString(),
        jobCount: exportData.length,
        queueName,
        dataClassification
      })
}
  }, [filteredJobs, queueName, auditTrail, dataClassification]);

  // Performance metrics component
  const PerformanceMetrics = () => (
    <motion.div
      initial={{ opacity: 0,
  height: 0 }}
      animate={{ opacity: 1,
  height: 'auto' }}
      exit={{ opacity: 0,
  height: 0 }}
      className="performance-metrics"
    >
      <div className="metrics-grid">
        <div className="metric-card">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <h4>Success Rate</h4>
            <p>{stats.successRate.toFixed(1)}%</p>
          </div>
        </div>
        <div className="metric-card">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h4>Avg Processing</h4>
            <p>{stats.avgProcessingTime.toFixed(2)}s</p>
          </div>
        </div>
        <div className="metric-card">
          <Activity className="w-5 h-5 text-orange-600" />
          <div>
            <h4>CPU Usage</h4>
            <p>{stats.totalCpuUsage.toFixed(1)}%</p>
          </div>
        </div>
        <div className="metric-card">
          <Database className="w-5 h-5 text-purple-600" />
          <div>
            <h4>Memory Usage</h4>
            <p>{stats.totalMemoryUsage.toFixed(1)}MB</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`advanced-job-queue ${className}`}>
      {/* Header */}
      <div className="queue-header">
        <div className="queue-info">
          <h3>Job Queue: {queueName}</h3>
          <p>Compliance: {complianceLevel.toUpperCase()} • Classification: {dataClassification.toUpperCase()}</p>
        </div>
        <div className="queue-controls">
          {enablePerformanceMetrics && (
            <button
              onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
              className="metrics-button"
            >
              <Activity className="w-4 h-4" />
              Metrics
            </button>
          )}
          <button onClick={onRefresh} className="refresh-button">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportJobs} className="export-button">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <AnimatePresence>
        {showPerformanceMetrics && <PerformanceMetrics />}
      </AnimatePresence>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total</h4>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card pending">
          <h4>Pending</h4>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card running">
          <h4>Running</h4>
          <p>{stats.running}</p>
        </div>
        <div className="stat-card completed">
          <h4>Completed</h4>
          <p>{stats.completed}</p>
        </div>
        <div className="stat-card failed">
          <h4>Failed</h4>
          <p>{stats.failed}</p>
        </div>
        <div className="stat-card retrying">
          <h4>Retrying</h4>
          <p>{stats.retrying}</p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-header">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="filters-toggle"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="search-box">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ opacity: 0,
  height: 0 }}
                animate={{ opacity: 1,
  height: 'auto' }}
                exit={{ opacity: 0,
  height: 0 }}
                className="filters-panel"
              >
                {/* Status filter */}
                <div className="filter-group">
                  <label>Status</label>
                  <div className="filter-options">
                    {Object.values(JobStatus).map((status) => (
                      <label key={status} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filter.status?.includes(status) || false}
                          onChange={(e) => {
                            const newStatus = e.target.checked
                              ? [...(filter.status || []), status]
                              : (filter.status || []).filter(s => s !== status);
                            setFilter(prev => ({ ...prev, status: newStatus }))
}}
                        />
                        {statusConfig[status].label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority filter */}
                <div className="filter-group">
                  <label>Priority</label>
                  <div className="filter-options">
                    {Object.values(JobPriority).map((priority) => (
                      <label key={priority} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filter.priority?.includes(priority) || false}
                          onChange={(e) => {
                            const newPriority = e.target.checked
                              ? [...(filter.priority || []), priority]
                              : (filter.priority || []).filter(p => p !== priority);
                            setFilter(prev => ({ ...prev, priority: newPriority }))
}}
                        />
                        {priorityConfig[priority].label}
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bulk Actions */}
      {enableBulkOperations && selectedJobs.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedJobs.size} jobs selected</span>
          <div className="bulk-buttons">
            <button onClick={() => handleBulkAction('retry')}>Retry</button>
            <button onClick={() => handleBulkAction('cancel')}>Cancel</button>
            <button onClick={() => handleBulkAction('delete')}>Delete</button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="jobs-container">
        {isLoading ? (
          <div className="loading">Loading jobs...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty">No jobs found</div>
        ) : (
          <div className={`jobs-list ${viewMode}`}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJobs.has(job.id)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedJobs(prev => new Set([...prev, job.id]))
} else {
                    setSelectedJobs(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(job.id);
                      return newSet
})
}
                }}
                onAction={handleJobAction}
                showActions={showActions}
                viewMode={viewMode}
                statusConfig={statusConfig}
                priorityConfig={priorityConfig}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compliance Badge */}
      {auditTrail && (
        <div className="compliance-badge">
          <Shield className="w-3 h-3" />
          <span>{complianceLevel.toUpperCase()} Compliant • Audit Trail Active</span>
        </div>
      )}
    </div>
  )
};

// Job Card Component
const JobCard: React.FC<{
  job: Job;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (jobId: string,
  action: 'retry' | 'cancel' | 'delete' | 'pause' | 'resume') => void;
  showActions: boolean;
  viewMode: 'list' | 'grid';
  statusConfig: any;
  priorityConfig: any
}> = ({ job, isSelected, onSelect, onAction, showActions, viewMode, statusConfig, priorityConfig }) => {
  const status = statusConfig[job.status];
  const priority = priorityConfig[job.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0,
  y: 20 }}
      animate={{ opacity: 1,
  y: 0 }}
      exit={{ opacity: 0,
  y: -20 }}
      className={`job-card ${viewMode} ${isSelected ? 'selected' : ''}`}
    >
      <div className="job-header">
        <div className="job-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
        </div>
        <div className="job-status">
          <div className={`status-badge ${status.color}`}>
            <status.icon className="w-3 h-3" />
            {status.label}
          </div>
        </div>
        <div className="job-priority">
          <div className={`priority-badge ${priority.color}`}>
            <priority.icon className="w-3 h-3" />
            {priority.label}
          </div>
        </div>
      </div>

      <div className="job-content">
        <h4>{job.name}</h4>
        {job.description && <p>{job.description}</p>}

        <div className="job-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <span>{job.progress}%</span>
        </div>

        <div className="job-meta">
          <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
          {job.metadata?.actualDuration && (
            <span>Duration: {job.metadata.actualDuration}s</span>
          )}
        </div>

        {job.tags.length > 0 && (
          <div className="job-tags">
            {job.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {showActions && (
        <div className="job-actions">
          {job.status === JobStatus.FAILED && (
            <button onClick={() => onAction(job.id, 'retry')}>
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {job.status === JobStatus.RUNNING && (
            <button onClick={() => onAction(job.id, 'pause')}>
              <Pause className="w-4 h-4" />
            </button>
          )}
          {job.status === JobStatus.PENDING && (
            <button onClick={() => onAction(job.id, 'cancel')}>
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onAction(job.id, 'delete')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  )
};

// Export with enterprise HOCs
export default withCompliance(
  withPerformance(AdvancedJobQueue, {
    metrics: ['jobProcessingTime', 'queueThroughput', 'errorRate'],
    auditTrail: true
  }),
  {
    complianceLevel: 'gdpr',
  dataClassification: 'confidential',
    auditLogging: true
  }
);
