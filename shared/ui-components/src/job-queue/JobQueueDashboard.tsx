import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  Filter,
  Search,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { JobStatus, JobPriority, Job } from '@aibos/shared/lib/queue';

export interface JobQueueDashboardProps {
  className?: string;
  queueName?: string;
  refreshInterval?: number;
  showFilters?: boolean;
  showActions?: boolean;
  maxJobs?: number;
  onJobAction?: (jobId: string, action: 'retry' | 'cancel' | 'delete') => void;
  onRefresh?: () => void;
  jobs?: Job[];
  isLoading?: boolean;
  error?: string | null;
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

const statusConfig = {
  [JobStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-500',
    icon: Clock,
    textColor: 'text-yellow-700'
  },
  [JobStatus.RUNNING]: {
    label: 'Running',
    color: 'bg-blue-500',
    icon: Play,
    textColor: 'text-blue-700'
  },
  [JobStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-500',
    icon: CheckCircle,
    textColor: 'text-green-700'
  },
  [JobStatus.FAILED]: {
    label: 'Failed',
    color: 'bg-red-500',
    icon: XCircle,
    textColor: 'text-red-700'
  },
  [JobStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-500',
    icon: XCircle,
    textColor: 'text-gray-700'
  },
  [JobStatus.RETRY]: {
    label: 'Retry',
    color: 'bg-orange-500',
    icon: RefreshCw,
    textColor: 'text-orange-700'
  }
};

const priorityConfig = {
  [JobPriority.LOW]: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  [JobPriority.NORMAL]: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  [JobPriority.HIGH]: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  [JobPriority.URGENT]: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
  [JobPriority.CRITICAL]: { label: 'Critical', color: 'bg-purple-100 text-purple-800' }
};

export const JobQueueDashboard: React.FC<JobQueueDashboardProps> = ({
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
  error = null
}) => {
  const [filter, setFilter] = useState<JobFilter>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Auto-refresh effect
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  // Filter and sort jobs
  const filteredJobs = useCallback(() => {
    let filtered = [...jobs];

    // Apply status filter
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(job => filter.status!.includes(job.status));
    }

    // Apply priority filter
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(job => filter.priority!.includes(job.priority));
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(job => 
        filter.tags!.some(tag => job.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filter.dateRange) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= filter.dateRange!.start && jobDate <= filter.dateRange!.end;
      });
    }

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(searchLower) ||
        job.id.toLowerCase().includes(searchLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort jobs
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered.slice(0, maxJobs);
  }, [jobs, filter, sortBy, sortOrder, maxJobs]);

  // Statistics
  const stats = useCallback(() => {
    const allJobs = filteredJobs();
    return {
      total: allJobs.length,
      pending: allJobs.filter(job => job.status === JobStatus.PENDING).length,
      running: allJobs.filter(job => job.status === JobStatus.RUNNING).length,
      completed: allJobs.filter(job => job.status === JobStatus.COMPLETED).length,
      failed: allJobs.filter(job => job.status === JobStatus.FAILED).length,
      retry: allJobs.filter(job => job.status === JobStatus.RETRY).length,
      cancelled: allJobs.filter(job => job.status === JobStatus.CANCELLED).length
    };
  }, [filteredJobs]);

  const handleJobAction = (jobId: string, action: 'retry' | 'cancel' | 'delete') => {
    onJobAction?.(jobId, action);
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === filteredJobs().length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs().map(job => job.id)));
    }
  };

  const handleBulkAction = (action: 'retry' | 'cancel' | 'delete') => {
    selectedJobs.forEach(jobId => {
      handleJobAction(jobId, action);
    });
    setSelectedJobs(new Set());
  };

  const exportJobs = () => {
    const data = filteredJobs().map(job => ({
      id: job.id,
      name: job.name,
      status: job.status,
      priority: job.priority,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      retries: job.retries,
      tags: job.tags.join(', '),
      error: job.error
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-${queueName}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStats = stats();
  const displayJobs = filteredJobs();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Job Queue Dashboard</h1>
            <p className="text-blue-100 mt-1">Queue: {queueName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onRefresh?.()}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportJobs}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-6 bg-gray-50 border-b">
        <StatCard
          label="Total"
          value={currentStats.total}
          color="bg-gray-500"
        />
        <StatCard
          label="Pending"
          value={currentStats.pending}
          color="bg-yellow-500"
        />
        <StatCard
          label="Running"
          value={currentStats.running}
          color="bg-blue-500"
        />
        <StatCard
          label="Completed"
          value={currentStats.completed}
          color="bg-green-500"
        />
        <StatCard
          label="Failed"
          value={currentStats.failed}
          color="bg-red-500"
        />
        <StatCard
          label="Retry"
          value={currentStats.retry}
          color="bg-orange-500"
        />
        <StatCard
          label="Cancelled"
          value={currentStats.cancelled}
          color="bg-gray-400"
        />
      </div>

      {/* Filters and Actions */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                setSortBy(field as any);
                setSortOrder(order);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors"
            >
              {viewMode === 'list' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{viewMode === 'list' ? 'Grid' : 'List'}</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="space-y-2">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filter.status?.includes(status as JobStatus) || false}
                          onChange={(e) => {
                            const currentStatuses = filter.status || [];
                            if (e.target.checked) {
                              setFilter(prev => ({ 
                                ...prev, 
                                status: [...currentStatuses, status as JobStatus] 
                              }));
                            } else {
                              setFilter(prev => ({ 
                                ...prev, 
                                status: currentStatuses.filter(s => s !== status) 
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{config.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="space-y-2">
                    {Object.entries(priorityConfig).map(([priority, config]) => (
                      <label key={priority} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filter.priority?.includes(Number(priority) as JobPriority) || false}
                          onChange={(e) => {
                            const currentPriorities = filter.priority || [];
                            if (e.target.checked) {
                              setFilter(prev => ({ 
                                ...prev, 
                                priority: [...currentPriorities, Number(priority) as JobPriority] 
                              }));
                            } else {
                              setFilter(prev => ({ 
                                ...prev, 
                                priority: currentPriorities.filter(p => p !== Number(priority)) 
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{config.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filter.dateRange?.start ? format(filter.dateRange.start, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const start = e.target.value ? new Date(e.target.value) : undefined;
                        setFilter(prev => ({
                          ...prev,
                          dateRange: start ? { start, end: prev.dateRange?.end || new Date() } : undefined
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={filter.dateRange?.end ? format(filter.dateRange.end, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const end = e.target.value ? new Date(e.target.value) : undefined;
                        setFilter(prev => ({
                          ...prev,
                          dateRange: end ? { start: prev.dateRange?.start || new Date(), end } : undefined
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="Enter tags (comma-separated)"
                    value={filter.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                      setFilter(prev => ({ ...prev, tags: tags.length > 0 ? tags : undefined }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {showActions && selectedJobs.size > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('retry')}
                className="flex items-center space-x-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg px-3 py-1 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-1 text-sm transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg px-3 py-1 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      <div className="overflow-hidden">
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-gray-600">Loading jobs...</span>
            </div>
          </div>
        )}

        {!isLoading && displayJobs.length === 0 && (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
          </div>
        )}

        {!isLoading && displayJobs.length > 0 && (
          <div className="divide-y divide-gray-200">
            {displayJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJobs.has(job.id)}
                onSelect={(selected) => {
                  const newSelected = new Set(selectedJobs);
                  if (selected) {
                    newSelected.add(job.id);
                  } else {
                    newSelected.delete(job.id);
                  }
                  setSelectedJobs(newSelected);
                }}
                onAction={handleJobAction}
                showActions={showActions}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
    <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Job Card Component
const JobCard: React.FC<{
  job: Job;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (jobId: string, action: 'retry' | 'cancel' | 'delete') => void;
  showActions: boolean;
  viewMode: 'list' | 'grid';
}> = ({ job, isSelected, onSelect, onAction, showActions, viewMode }) => {
  const status = statusConfig[job.status];
  const priority = priorityConfig[job.priority];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-6 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {showActions && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1"
            />
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <h3 className="text-lg font-medium text-gray-900">{job.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                {priority.label}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">ID:</span> {job.id}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDistanceToNow(new Date(job.createdAt))} ago
              </div>
              <div>
                <span className="font-medium">Retries:</span> {job.retries}/{job.maxRetries}
              </div>
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {job.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <div className="font-medium">Error:</div>
                    <div className="mt-1">{job.error}</div>
                  </div>
                </div>
              </div>
            )}

            {job.progress !== undefined && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <StatusIcon className="w-4 h-4" />
                <span>{status.label}</span>
              </div>
              {job.startedAt && (
                <div>
                  Started: {formatDistanceToNow(new Date(job.startedAt))} ago
                </div>
              )}
              {job.completedAt && (
                <div>
                  Completed: {formatDistanceToNow(new Date(job.completedAt))} ago
                </div>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {job.status === JobStatus.FAILED && (
              <button
                onClick={() => onAction(job.id, 'retry')}
                className="flex items-center space-x-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg px-3 py-1 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
            {(job.status === JobStatus.PENDING || job.status === JobStatus.RUNNING) && (
              <button
                onClick={() => onAction(job.id, 'cancel')}
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-1 text-sm transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
            <button
              onClick={() => onAction(job.id, 'delete')}
              className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg px-3 py-1 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 