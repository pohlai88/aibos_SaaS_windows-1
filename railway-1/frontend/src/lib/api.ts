import axios, { AxiosError } from 'axios';
import { apiDebugger, performanceMonitor } from './debug';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aibos-railay-1-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and debug logging
api.interceptors.request.use(
  (config) => {
    const startTime = performance.now();

    // Add auth token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('aibos_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Debug logging
    apiDebugger.logRequest(config.url || '', config.method || 'GET', config.data);

    // Store start time for performance monitoring
    (config as any).startTime = startTime;

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors, network issues, and debug logging
// Add connection status checker
export const checkConnection = async () => {
  try {
    const response = await performanceMonitor.measureAsync('connection-check', () =>
      api.get('/health', { timeout: 5000 })
    );
    return { connected: true, status: response.status };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    return {
      connected: false,
      error: axiosError.code === 'NETWORK_ERROR' ? 'Server unreachable' : axiosError.message
    };
  }
};

// Enhanced response interceptor with debugging
api.interceptors.response.use(
  (response) => {
    const duration = performance.now() - (response.config as any).startTime;

    // Debug logging
    apiDebugger.logResponse(
      response.config.url || '',
      response.status,
      response.data,
      duration
    );

    return response;
  },
  (error: AxiosError) => {
    const duration = performance.now() - (error.config as any)?.startTime;

    // Debug logging
    apiDebugger.logError(error.config?.url || '', error);

    console.error('API Error:', error);

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aibos_token');
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    // Enhanced network error handling
    if (!error.response) {
      (error as any).code = 'NETWORK_ERROR';
      if (error.code === 'ECONNREFUSED') {
        error.message = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        error.message = 'Network Error: Unable to connect to server. Please check your internet connection.';
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions with performance monitoring
export const authAPI = {
  login: (email: string, password: string) =>
    performanceMonitor.measureAsync('auth-login', () =>
      api.post('/auth/login', { email, password })
    ),

  register: (email: string, password: string, name: string, tenant_name: string) =>
    performanceMonitor.measureAsync('auth-register', () =>
      api.post('/auth/register', { email, password, name, tenant_name })
    ),

  me: () => performanceMonitor.measureAsync('auth-me', () => api.get('/auth/me')),

  logout: () => performanceMonitor.measureAsync('auth-logout', () => api.post('/auth/logout')),
};

export const manifestsAPI = {
  list: () => performanceMonitor.measureAsync('manifests-list', () => api.get('/manifests')),

  get: (id: string) => performanceMonitor.measureAsync('manifests-get', () => api.get(`/manifests/${id}`)),

  create: (data: any) => performanceMonitor.measureAsync('manifests-create', () => api.post('/manifests', data)),

  update: (id: string, data: any) => performanceMonitor.measureAsync('manifests-update', () => api.put(`/manifests/${id}`, data)),

  delete: (id: string) => performanceMonitor.measureAsync('manifests-delete', () => api.delete(`/manifests/${id}`)),
};

export const appsAPI = {
  list: (tenant_id?: string) =>
    api.get('/apps', { params: { tenant_id } }),

  get: (id: string) => api.get(`/apps/${id}`),

  install: (manifest_id: string, tenant_id: string, name: string) =>
    api.post('/apps/install', { manifest_id, tenant_id, name }),

  update: (id: string, data: any) => api.put(`/apps/${id}`, data),

  delete: (id: string) => api.delete(`/apps/${id}`),

  start: (id: string) => api.post(`/apps/${id}/start`),

  stop: (id: string) => api.post(`/apps/${id}/stop`),
};

export const eventsAPI = {
  list: (params?: any) => api.get('/events', { params }),

  emit: (tenant_id: string, app_id: string, event_name: string, payload?: any) =>
    api.post('/events/emit', { tenant_id, app_id, event_name, payload }),

  subscribe: (tenant_id: string, app_id: string, event_name: string, handler_url?: string) =>
    api.post('/events/subscribe', { tenant_id, app_id, event_name, handler_url }),

  subscriptions: (params?: any) => api.get('/events/subscriptions', { params }),

  unsubscribe: (id: string) => api.delete(`/events/subscriptions/${id}`),

  toggleSubscription: (id: string) => api.post(`/events/subscriptions/${id}/toggle`),
};

export const entitiesAPI = {
  list: (params?: any) => api.get('/entities', { params }),

  create: (data: any) => api.post('/entities', data),

  getData: (name: string, params?: any) => api.get(`/entities/${name}`, { params }),

  createRecord: (name: string, tenant_id: string, data: any) =>
    api.post(`/entities/${name}`, { tenant_id, data }),

  updateRecord: (name: string, id: string, tenant_id: string, data: any) =>
    api.put(`/entities/${name}/${id}`, { tenant_id, data }),

  deleteRecord: (name: string, id: string, tenant_id: string) =>
    api.delete(`/entities/${name}/${id}`, { params: { tenant_id } }),
};

// ==================== CONSCIOUSNESS API ====================
export const consciousnessAPI = {
  // Get consciousness status
  getStatus: () => api.get('/consciousness/status'),

  // Get consciousness story
  getStory: () => api.get('/consciousness/story'),

  // Record experience
  recordExperience: (experience: any) => api.post('/consciousness/experience', experience),

  // Get consciousness metrics
  getMetrics: () => api.get('/consciousness/metrics'),

  // Evolve consciousness
  evolve: (data: any) => api.post('/consciousness/evolve', data),

  // Get consciousness history
  getHistory: (params?: any) => api.get('/consciousness/history', { params }),

  // Get emotional state
  getEmotionalState: () => api.get('/consciousness/emotions'),

  // Get quantum state
  getQuantumState: () => api.get('/consciousness/quantum'),

  // Get wisdom insights
  getWisdom: () => api.get('/consciousness/wisdom'),

  // Get evolution progress
  getEvolution: () => api.get('/consciousness/evolution'),
};

// ==================== DATABASE API ====================
export const databaseAPI = {
  // Schema management
  createSchemaVersion: (data: any) => api.post('/database/schemas', data),
  getSchemaVersions: (params?: any) => api.get('/database/schemas', { params }),
  getSchemaVersion: (id: string) => api.get(`/database/schemas/${id}`),
  updateSchemaVersion: (id: string, data: any) => api.put(`/database/schemas/${id}`, data),
  deleteSchemaVersion: (id: string) => api.delete(`/database/schemas/${id}`),

  // Manifest management
  createManifest: (data: any) => api.post('/database/manifests', data),
  getManifests: (params?: any) => api.get('/database/manifests', { params }),
  getManifest: (id: string) => api.get(`/database/manifests/${id}`),
  updateManifest: (id: string, data: any) => api.put(`/database/manifests/${id}`, data),
  deleteManifest: (id: string) => api.delete(`/database/manifests/${id}`),

  // Approval workflow
  submitManifest: (data: any) => api.post('/database/manifests/submit', data),
  approveStep: (data: any) => api.post('/database/manifests/approve', data),
  rejectStep: (data: any) => api.post('/database/manifests/reject', data),
  getApprovalWorkflow: (manifestId: string) => api.get(`/database/manifests/${manifestId}/workflow`),

  // Migration management
  generateMigrationPlan: (data: any) => api.post('/database/migrations/plan', data),
  executeMigration: (data: any) => api.post('/database/migrations/execute', data),
  rollbackMigration: (data: any) => api.post('/database/migrations/rollback', data),
  getMigrationHistory: (params?: any) => api.get('/database/migrations', { params }),

  // Database health
  getHealth: () => api.get('/database/health'),
  getMetrics: () => api.get('/database/metrics'),
  getAnalytics: (params?: any) => api.get('/database/analytics', { params }),
};

// ==================== WORKSPACE API ====================
export const workspaceAPI = {
  // Workspace management
  createWorkspace: (data: any) => api.post('/workspaces', data),
  getWorkspaces: (params?: any) => api.get('/workspaces', { params }),
  getWorkspace: (id: string) => api.get(`/workspaces/${id}`),
  updateWorkspace: (id: string, data: any) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id: string) => api.delete(`/workspaces/${id}`),

  // Workspace state
  saveWorkspaceState: (id: string, state: any) => api.post(`/workspaces/${id}/state`, state),
  getWorkspaceState: (id: string) => api.get(`/workspaces/${id}/state`),
  exportWorkspace: (id: string) => api.get(`/workspaces/${id}/export`),
  importWorkspace: (data: any) => api.post('/workspaces/import', data),
};

// ==================== SYSTEM API ====================
export const systemAPI = {
  // System health
  getHealth: () => api.get('/health'),
  getSystemInfo: () => api.get('/system/info'),
  getSystemMetrics: () => api.get('/system/metrics'),

  // Configuration
  getConfig: () => api.get('/system/config'),
  updateConfig: (data: any) => api.put('/system/config', data),

  // Logs
  getLogs: (params?: any) => api.get('/system/logs', { params }),
  clearLogs: () => api.delete('/system/logs'),
};

// ==================== AI BACKEND CONNECTOR API ====================
export const aiBackendAPI = {
  // AI Provider Management
  getProviders: () => api.get('/ai/providers'),
  getProvider: (id: string) => api.get(`/ai/providers/${id}`),
  connectProvider: (id: string) => api.post(`/ai/providers/${id}/connect`),
  disconnectProvider: (id: string) => api.post(`/ai/providers/${id}/disconnect`),

  // AI Model Management
  getModels: (providerId?: string) => api.get('/ai/models', { params: { providerId } }),
  getModel: (id: string) => api.get(`/ai/models/${id}`),

  // AI Generation
  generateText: (request: any) => api.post('/ai/generate/text', request),
  generateCode: (request: any) => api.post('/ai/generate/code', request),
  generateUI: (request: any) => api.post('/ai/generate/ui', request),
  generateManifest: (request: any) => api.post('/ai/generate/manifest', request),
  generateWorkflow: (request: any) => api.post('/ai/generate/workflow', request),

  // AI Settings
  getSettings: () => api.get('/ai/settings'),
  updateSettings: (settings: any) => api.put('/ai/settings', settings),

  // AI Usage & Metrics
  getUsage: (providerId?: string) => api.get('/ai/usage', { params: { providerId } }),
  getPerformance: () => api.get('/ai/performance'),
  getRequests: (params?: any) => api.get('/ai/requests', { params }),

  // Ollama Integration
  getOllamaStatus: () => api.get('/ai/ollama/status'),
  startOllama: () => api.post('/ai/ollama/start'),
  stopOllama: () => api.post('/ai/ollama/stop'),
  getOllamaModels: () => api.get('/ai/ollama/models'),
  pullOllamaModel: (model: string) => api.post('/ai/ollama/pull', { model }),
};
