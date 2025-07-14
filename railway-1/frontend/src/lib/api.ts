import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aibos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear it
      localStorage.removeItem('aibos_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string, tenant_name: string) => 
    api.post('/auth/register', { email, password, name, tenant_name }),
  
  me: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};

export const manifestsAPI = {
  list: () => api.get('/manifests'),
  
  get: (id: string) => api.get(`/manifests/${id}`),
  
  create: (data: any) => api.post('/manifests', data),
  
  update: (id: string, data: any) => api.put(`/manifests/${id}`, data),
  
  delete: (id: string) => api.delete(`/manifests/${id}`),
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