import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { Job, JobStatus, JobPriority } from './types';

export interface JobQueueContextValue {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    retry: number;
    cancelled: number;
  };
  refreshJobs: () => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  addJob: (jobConfig: any) => Promise<Job>;
  getJob: (jobId: string) => Job | undefined;
  clearCompletedJobs: () => Promise<void>;
  clearFailedJobs: () => Promise<void>;
}

const JobQueueContext = createContext<JobQueueContextValue | undefined>(undefined);

export interface JobQueueProviderProps {
  children: ReactNode;
  queueName?: string;
  refreshInterval?: number;
  apiEndpoint?: string;
  enableWebSocket?: boolean;
  maxJobs?: number;
}

export const JobQueueProvider: React.FC<JobQueueProviderProps> = ({
  children,
  queueName = 'default',
  refreshInterval = 5000,
  apiEndpoint = '/api/jobs',
  enableWebSocket = true,
  maxJobs = 1000,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Calculate stats
  const stats = {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === JobStatus.PENDING).length,
    running: jobs.filter((job) => job.status === JobStatus.RUNNING).length,
    completed: jobs.filter((job) => job.status === JobStatus.COMPLETED).length,
    failed: jobs.filter((job) => job.status === JobStatus.FAILED).length,
    retry: jobs.filter((job) => job.status === JobStatus.RETRYING).length,
    cancelled: jobs.filter((job) => job.status === JobStatus.CANCELLED).length,
  };

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiEndpoint}?queue=${queueName}&limit=${maxJobs}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, queueName, maxJobs]);

  // Refresh jobs
  const refreshJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  // Retry a failed job
  const retryJob = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`${apiEndpoint}/${jobId}/retry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to retry job: ${response.statusText}`);
        }

        // Update local state
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: JobStatus.PENDING, retries: job.retries + 1, error: undefined }
              : job,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to retry job');
        console.error('Error retrying job:', err);
      }
    },
    [apiEndpoint],
  );

  // Cancel a job
  const cancelJob = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`${apiEndpoint}/${jobId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to cancel job: ${response.statusText}`);
        }

        // Update local state
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: JobStatus.CANCELLED, completedAt: new Date() }
              : job,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel job');
        console.error('Error cancelling job:', err);
      }
    },
    [apiEndpoint],
  );

  // Delete a job
  const deleteJob = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`${apiEndpoint}/${jobId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete job: ${response.statusText}`);
        }

        // Remove from local state
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete job');
        console.error('Error deleting job:', err);
      }
    },
    [apiEndpoint],
  );

  // Add a new job
  const addJob = useCallback(
    async (jobConfig: any): Promise<Job> => {
      try {
        const response = await fetch(`${apiEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...jobConfig, queue: queueName }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add job: ${response.statusText}`);
        }

        const job = await response.json();

        // Add to local state
        setJobs((prev) => [job, ...prev.slice(0, maxJobs - 1)]);

        return job;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add job');
        console.error('Error adding job:', err);
        throw err;
      }
    },
    [apiEndpoint, queueName, maxJobs],
  );

  // Get a specific job
  const getJob = useCallback(
    (jobId: string): Job | undefined => {
      return jobs.find((job) => job.id === jobId);
    },
    [jobs],
  );

  // Clear completed jobs
  const clearCompletedJobs = useCallback(async () => {
    try {
      const response = await fetch(`${apiEndpoint}/clear-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: queueName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to clear completed jobs: ${response.statusText}`);
      }

      // Remove completed jobs from local state
      setJobs((prev) => prev.filter((job) => job.status !== JobStatus.COMPLETED));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear completed jobs');
      console.error('Error clearing completed jobs:', err);
    }
  }, [apiEndpoint, queueName]);

  // Clear failed jobs
  const clearFailedJobs = useCallback(async () => {
    try {
      const response = await fetch(`${apiEndpoint}/clear-failed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: queueName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to clear failed jobs: ${response.statusText}`);
      }

      // Remove failed jobs from local state
      setJobs((prev) => prev.filter((job) => job.status !== JobStatus.FAILED));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear failed jobs');
      console.error('Error clearing failed jobs:', err);
    }
  }, [apiEndpoint, queueName]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const wsUrl = apiEndpoint.replace('http', 'ws').replace('https', 'wss');
    const ws = new WebSocket(`${wsUrl}/ws?queue=${queueName}`);

    ws.onopen = () => {
      console.log('WebSocket connected for job queue updates');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'job_added':
            setJobs((prev) => [data.job, ...prev.slice(0, maxJobs - 1)]);
            break;
          case 'job_updated':
            setJobs((prev) => prev.map((job) => (job.id === data.job.id ? data.job : job)));
            break;
          case 'job_removed':
            setJobs((prev) => prev.filter((job) => job.id !== data.jobId));
            break;
          case 'queue_stats':
            // Stats are calculated locally, but we could update them here if needed
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWsConnection(ws);

    return () => {
      ws.close();
    };
  }, [enableWebSocket, apiEndpoint, queueName, maxJobs]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchJobs();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchJobs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchJobs, refreshInterval]);

  const contextValue: JobQueueContextValue = {
    jobs,
    isLoading,
    error,
    stats,
    refreshJobs,
    retryJob,
    cancelJob,
    deleteJob,
    addJob,
    getJob,
    clearCompletedJobs,
    clearFailedJobs,
  };

  return <JobQueueContext.Provider value={contextValue}>{children}</JobQueueContext.Provider>;
};

// Hook to use the job queue context
export const useJobQueue = (): JobQueueContextValue => {
  const context = useContext(JobQueueContext);
  if (context === undefined) {
    throw new Error('useJobQueue must be used within a JobQueueProvider');
  }
  return context;
};
