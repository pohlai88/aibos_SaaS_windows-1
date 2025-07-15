# Job Queue UI Components

Enterprise-grade job queue management components for the AI-BOS platform. This package provides comprehensive job monitoring, management, and creation capabilities with real-time updates and advanced filtering.

## Features

- 🎯 **Real-time Job Monitoring** - Live updates via WebSocket or polling
- 📊 **Comprehensive Dashboard** - Visual job status, progress tracking, and statistics
- 🔍 **Advanced Filtering** - Filter by status, priority, tags, date range, and search
- ⚡ **Job Management** - Retry, cancel, delete, and bulk operations
- 📝 **Job Creation** - Intuitive form with validation and advanced options
- 🎨 **Modern UI** - Beautiful, responsive design with animations
- 🔧 **Flexible Configuration** - Customizable refresh intervals, API endpoints, and more

## Components

### JobQueueDashboard

The main dashboard component for monitoring and managing jobs.

```tsx
import { JobQueueDashboard } from '@aibos/ui-components';

<JobQueueDashboard
  queueName="my-queue"
  refreshInterval={5000}
  showFilters={true}
  showActions={true}
  maxJobs={100}
  onJobAction={(jobId, action) => {
    // Handle job actions (retry, cancel, delete)
  }}
  onRefresh={() => {
    // Handle manual refresh
  }}
  jobs={jobs}
  isLoading={false}
  error={null}
/>
```

### JobQueueProvider

React context provider for managing job queue state and real-time updates.

```tsx
import { JobQueueProvider, useJobQueue } from '@aibos/ui-components';

<JobQueueProvider
  queueName="my-queue"
  refreshInterval={5000}
  apiEndpoint="/api/jobs"
  enableWebSocket={true}
  maxJobs={1000}
>
  <YourApp />
</JobQueueProvider>

// Use the hook in child components
const { jobs, stats, retryJob, cancelJob, deleteJob } = useJobQueue();
```

### JobForm

Form component for creating new jobs with validation and advanced options.

```tsx
import { JobForm } from '@aibos/ui-components';

<JobForm
  onSubmit={async (jobData) => {
    // Handle job submission
  }}
  onCancel={() => {
    // Handle cancellation
  }}
  isLoading={false}
  error={null}
  showAdvanced={true}
/>
```

### JobQueueDemo

Complete demo component showcasing all features with mock data.

```tsx
import { JobQueueDemo } from '@aibos/ui-components';

<JobQueueDemo
  queueName="demo-queue"
  showForm={true}
  showStats={true}
/>
```

## Quick Start

### 1. Basic Setup

```tsx
import { JobQueueProvider, JobQueueDashboard } from '@aibos/ui-components';

function App() {
  return (
    <JobQueueProvider queueName="my-queue">
      <JobQueueDashboard />
    </JobQueueProvider>
  );
}
```

### 2. With Custom API Integration

```tsx
import { JobQueueProvider, useJobQueue } from '@aibos/ui-components';

function JobManager() {
  const { jobs, addJob, retryJob } = useJobQueue();

  const handleAddJob = async (jobData) => {
    try {
      await addJob(jobData);
      console.log('Job added successfully');
    } catch (error) {
      console.error('Failed to add job:', error);
    }
  };

  return (
    <div>
      <JobForm onSubmit={handleAddJob} />
      <JobQueueDashboard />
    </div>
  );
}

function App() {
  return (
    <JobQueueProvider
      queueName="production-queue"
      apiEndpoint="https://api.example.com/jobs"
      refreshInterval={3000}
      enableWebSocket={true}
    >
      <JobManager />
    </JobQueueProvider>
  );
}
```

### 3. Standalone Usage (without provider)

```tsx
import { JobQueueDashboard } from '@aibos/ui-components';

function StandaloneDashboard() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      await fetch(`/api/jobs/${jobId}/${action}`, { method: 'POST' });
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    }
  };

  return (
    <JobQueueDashboard
      jobs={jobs}
      isLoading={isLoading}
      onJobAction={handleJobAction}
      onRefresh={fetchJobs}
    />
  );
}
```

## API Reference

### JobQueueProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `queueName` | `string` | `'default'` | Name of the job queue |
| `refreshInterval` | `number` | `5000` | Polling interval in milliseconds (0 to disable) |
| `apiEndpoint` | `string` | `'/api/jobs'` | API endpoint for job operations |
| `enableWebSocket` | `boolean` | `true` | Enable real-time updates via WebSocket |
| `maxJobs` | `number` | `1000` | Maximum number of jobs to load |
| `children` | `ReactNode` | - | Child components |

### JobQueueDashboard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `queueName` | `string` | - | Queue name for display |
| `refreshInterval` | `number` | `5000` | Auto-refresh interval |
| `showFilters` | `boolean` | `true` | Show filter panel |
| `showActions` | `boolean` | `true` | Show action buttons |
| `maxJobs` | `number` | `100` | Maximum jobs to display |
| `onJobAction` | `function` | - | Callback for job actions |
| `onRefresh` | `function` | - | Manual refresh callback |
| `jobs` | `Job[]` | `[]` | Array of job objects |
| `isLoading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |

### JobForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `function` | - | Form submission handler |
| `onCancel` | `function` | - | Cancel handler |
| `isLoading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |
| `initialData` | `Partial<JobFormData>` | - | Initial form data |
| `showAdvanced` | `boolean` | `false` | Show advanced options |

### useJobQueue Hook

Returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `jobs` | `Job[]` | Array of jobs |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `stats` | `object` | Job statistics |
| `refreshJobs` | `function` | Refresh jobs |
| `retryJob` | `function` | Retry a failed job |
| `cancelJob` | `function` | Cancel a job |
| `deleteJob` | `function` | Delete a job |
| `addJob` | `function` | Add a new job |
| `getJob` | `function` | Get a specific job |
| `clearCompletedJobs` | `function` | Clear completed jobs |
| `clearFailedJobs` | `function` | Clear failed jobs |

## Job Data Structure

```typescript
interface Job {
  id: string;
  name: string;
  data: any;
  status: JobStatus;
  priority: JobPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retries: number;
  maxRetries: number;
  error?: string;
  result?: any;
  tags: string[];
  metadata: Record<string, any>;
  progress?: number; // 0-100
}

enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY = 'retry'
}

enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}
```

## Styling

The components use Tailwind CSS for styling and can be customized using:

1. **Tailwind Classes**: All components accept `className` props
2. **CSS Variables**: Customize colors and spacing
3. **Theme Override**: Extend the default theme

### Custom Styling Example

```tsx
<JobQueueDashboard
  className="custom-dashboard"
  // ... other props
/>

<style>
.custom-dashboard {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
}
</style>
```

## Backend Integration

### Required API Endpoints

The components expect the following API endpoints:

```
GET /api/jobs?queue={queueName}&limit={maxJobs}
POST /api/jobs
POST /api/jobs/{jobId}/retry
POST /api/jobs/{jobId}/cancel
DELETE /api/jobs/{jobId}
POST /api/jobs/clear-completed
POST /api/jobs/clear-failed
```

### WebSocket Events

For real-time updates, implement WebSocket events:

```typescript
// Event types
interface WebSocketEvent {
  type: 'job_added' | 'job_updated' | 'job_removed' | 'queue_stats';
  job?: Job;
  jobId?: string;
  stats?: QueueStats;
}
```

### Example Backend Response

```json
{
  "jobs": [
    {
      "id": "job-123",
      "name": "Process Data",
      "data": { "userId": 123 },
      "status": "running",
      "priority": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "startedAt": "2024-01-01T00:00:05Z",
      "retries": 0,
      "maxRetries": 3,
      "tags": ["data-processing"],
      "metadata": {},
      "progress": 65
    }
  ],
  "stats": {
    "total": 10,
    "pending": 3,
    "running": 2,
    "completed": 4,
    "failed": 1
  }
}
```

## Performance Considerations

1. **Virtualization**: For large job lists, consider implementing virtual scrolling
2. **Pagination**: Use pagination for very large datasets
3. **Debouncing**: Debounce search and filter inputs
4. **Caching**: Cache job data to reduce API calls
5. **WebSocket**: Use WebSocket for real-time updates instead of polling

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Dependencies

- React 18+
- Framer Motion 10+
- Lucide React 0.29+
- Date-fns 2.30+
- Tailwind CSS 3.0+

## License

MIT License - see LICENSE file for details. 