import { toast } from 'react-hot-toast';
import type {
  CostCenter,
  Activity,
  StandardCost,
  ProcessCost,
  CostVariance,
  CostingAnalytics,
  CostingFilters,
  CostAllocationRule,
  CostDriver,
  BOMItem,
  CostBreakdown,
  ProcessStage,
  CostAllocation,
  AllocationCondition,
  AllocationAction,
  CostCenterFormData,
  ActivityFormData,
  StandardCostFormData,
  ProcessCostFormData,
  CostAllocationRuleFormData,
} from '../types/costing';

// API Base URL - this would come from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};

// HTTP client with error handling and retry logic
class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(1000 * (4 - retries)); // Exponential backoff
        return this.request<T>(endpoint, options, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return error.message.includes('500') || 
           error.message.includes('502') || 
           error.message.includes('503') ||
           error.message.includes('504') ||
           error.name === 'TypeError';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Cache utility functions
const cacheUtils = {
  get<T>(key: string): T | null {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  },

  set<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },

  delete(key: string): void {
    cache.delete(key);
  },

  clear(): void {
    cache.clear();
  },

  invalidatePattern(pattern: string): void {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  },
};

// HTTP client instance
const httpClient = new HttpClient(API_BASE_URL);

// Error handling utility
const handleError = (error: any, context: string): never => {
  console.error(`Costing Service Error (${context}):`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error.message) {
    if (error.message.includes('401')) {
      message = 'Authentication required. Please log in again.';
    } else if (error.message.includes('403')) {
      message = 'You do not have permission to perform this action.';
    } else if (error.message.includes('404')) {
      message = 'The requested resource was not found.';
    } else if (error.message.includes('422')) {
      message = 'Invalid data provided. Please check your input.';
    } else if (error.message.includes('500')) {
      message = 'Server error. Please try again later.';
    } else if (error.message.includes('Network')) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message;
    }
  }
  
  toast.error(message);
  throw new Error(message);
};

// Authentication headers
const getAuthHeaders = (): Record<string, string> => {
  // This would get the auth token from your auth context/store
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Costing Service Class
export class CostingService {
  // Cost Centers
  async getCostCenters(filters: CostingFilters = {}): Promise<CostCenter[]> {
    const cacheKey = `cost_centers_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<CostCenter[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/cost-centers?${queryParams.toString()}`;
      const data = await httpClient.get<CostCenter[]>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getCostCenters');
    }
  }

  async getCostCenter(id: string): Promise<CostCenter> {
    const cacheKey = `cost_center_${id}`;
    const cached = cacheUtils.get<CostCenter>(cacheKey);
    if (cached) return cached;

    try {
      const data = await httpClient.get<CostCenter>(`/costing/cost-centers/${id}`, getAuthHeaders());
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getCostCenter');
    }
  }

  async createCostCenter(data: CostCenterFormData): Promise<CostCenter> {
    try {
      const result = await httpClient.post<CostCenter>('/costing/cost-centers', data, getAuthHeaders());
      cacheUtils.invalidatePattern('cost_centers');
      toast.success('Cost center created successfully');
      return result;
    } catch (error) {
      handleError(error, 'createCostCenter');
    }
  }

  async updateCostCenter(id: string, data: Partial<CostCenterFormData>): Promise<CostCenter> {
    try {
      const result = await httpClient.put<CostCenter>(`/costing/cost-centers/${id}`, data, getAuthHeaders());
      cacheUtils.delete(`cost_center_${id}`);
      cacheUtils.invalidatePattern('cost_centers');
      toast.success('Cost center updated successfully');
      return result;
    } catch (error) {
      handleError(error, 'updateCostCenter');
    }
  }

  async deleteCostCenter(id: string): Promise<void> {
    try {
      await httpClient.delete(`/costing/cost-centers/${id}`, getAuthHeaders());
      cacheUtils.delete(`cost_center_${id}`);
      cacheUtils.invalidatePattern('cost_centers');
      toast.success('Cost center deleted successfully');
    } catch (error) {
      handleError(error, 'deleteCostCenter');
    }
  }

  // Activities
  async getActivities(filters: CostingFilters = {}): Promise<Activity[]> {
    const cacheKey = `activities_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<Activity[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/activities?${queryParams.toString()}`;
      const data = await httpClient.get<Activity[]>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getActivities');
    }
  }

  async getActivity(id: string): Promise<Activity> {
    const cacheKey = `activity_${id}`;
    const cached = cacheUtils.get<Activity>(cacheKey);
    if (cached) return cached;

    try {
      const data = await httpClient.get<Activity>(`/costing/activities/${id}`, getAuthHeaders());
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getActivity');
    }
  }

  async createActivity(data: ActivityFormData): Promise<Activity> {
    try {
      const result = await httpClient.post<Activity>('/costing/activities', data, getAuthHeaders());
      cacheUtils.invalidatePattern('activities');
      toast.success('Activity created successfully');
      return result;
    } catch (error) {
      handleError(error, 'createActivity');
    }
  }

  async updateActivity(id: string, data: Partial<ActivityFormData>): Promise<Activity> {
    try {
      const result = await httpClient.put<Activity>(`/costing/activities/${id}`, data, getAuthHeaders());
      cacheUtils.delete(`activity_${id}`);
      cacheUtils.invalidatePattern('activities');
      toast.success('Activity updated successfully');
      return result;
    } catch (error) {
      handleError(error, 'updateActivity');
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      await httpClient.delete(`/costing/activities/${id}`, getAuthHeaders());
      cacheUtils.delete(`activity_${id}`);
      cacheUtils.invalidatePattern('activities');
      toast.success('Activity deleted successfully');
    } catch (error) {
      handleError(error, 'deleteActivity');
    }
  }

  // Standard Costs
  async getStandardCosts(filters: CostingFilters = {}): Promise<StandardCost[]> {
    const cacheKey = `standard_costs_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<StandardCost[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/standard-costs?${queryParams.toString()}`;
      const data = await httpClient.get<StandardCost[]>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getStandardCosts');
    }
  }

  async getStandardCost(id: string): Promise<StandardCost> {
    const cacheKey = `standard_cost_${id}`;
    const cached = cacheUtils.get<StandardCost>(cacheKey);
    if (cached) return cached;

    try {
      const data = await httpClient.get<StandardCost>(`/costing/standard-costs/${id}`, getAuthHeaders());
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getStandardCost');
    }
  }

  async createStandardCost(data: StandardCostFormData): Promise<StandardCost> {
    try {
      const result = await httpClient.post<StandardCost>('/costing/standard-costs', data, getAuthHeaders());
      cacheUtils.invalidatePattern('standard_costs');
      toast.success('Standard cost created successfully');
      return result;
    } catch (error) {
      handleError(error, 'createStandardCost');
    }
  }

  async updateStandardCost(id: string, data: Partial<StandardCostFormData>): Promise<StandardCost> {
    try {
      const result = await httpClient.put<StandardCost>(`/costing/standard-costs/${id}`, data, getAuthHeaders());
      cacheUtils.delete(`standard_cost_${id}`);
      cacheUtils.invalidatePattern('standard_costs');
      toast.success('Standard cost updated successfully');
      return result;
    } catch (error) {
      handleError(error, 'updateStandardCost');
    }
  }

  async deleteStandardCost(id: string): Promise<void> {
    try {
      await httpClient.delete(`/costing/standard-costs/${id}`, getAuthHeaders());
      cacheUtils.delete(`standard_cost_${id}`);
      cacheUtils.invalidatePattern('standard_costs');
      toast.success('Standard cost deleted successfully');
    } catch (error) {
      handleError(error, 'deleteStandardCost');
    }
  }

  // Process Costs
  async getProcessCosts(filters: CostingFilters = {}): Promise<ProcessCost[]> {
    const cacheKey = `process_costs_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<ProcessCost[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/process-costs?${queryParams.toString()}`;
      const data = await httpClient.get<ProcessCost[]>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getProcessCosts');
    }
  }

  async getProcessCost(id: string): Promise<ProcessCost> {
    const cacheKey = `process_cost_${id}`;
    const cached = cacheUtils.get<ProcessCost>(cacheKey);
    if (cached) return cached;

    try {
      const data = await httpClient.get<ProcessCost>(`/costing/process-costs/${id}`, getAuthHeaders());
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getProcessCost');
    }
  }

  async createProcessCost(data: ProcessCostFormData): Promise<ProcessCost> {
    try {
      const result = await httpClient.post<ProcessCost>('/costing/process-costs', data, getAuthHeaders());
      cacheUtils.invalidatePattern('process_costs');
      toast.success('Process cost created successfully');
      return result;
    } catch (error) {
      handleError(error, 'createProcessCost');
    }
  }

  async updateProcessCost(id: string, data: Partial<ProcessCostFormData>): Promise<ProcessCost> {
    try {
      const result = await httpClient.put<ProcessCost>(`/costing/process-costs/${id}`, data, getAuthHeaders());
      cacheUtils.delete(`process_cost_${id}`);
      cacheUtils.invalidatePattern('process_costs');
      toast.success('Process cost updated successfully');
      return result;
    } catch (error) {
      handleError(error, 'updateProcessCost');
    }
  }

  async deleteProcessCost(id: string): Promise<void> {
    try {
      await httpClient.delete(`/costing/process-costs/${id}`, getAuthHeaders());
      cacheUtils.delete(`process_cost_${id}`);
      cacheUtils.invalidatePattern('process_costs');
      toast.success('Process cost deleted successfully');
    } catch (error) {
      handleError(error, 'deleteProcessCost');
    }
  }

  // Cost Variances
  async getCostVariances(filters: CostingFilters = {}): Promise<CostVariance[]> {
    const cacheKey = `cost_variances_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<CostVariance[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/variances?${queryParams.toString()}`;
      const data = await httpClient.get<CostVariance[]>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.SHORT);
      return data;
    } catch (error) {
      handleError(error, 'getCostVariances');
    }
  }

  async getCostVariance(id: string): Promise<CostVariance> {
    const cacheKey = `cost_variance_${id}`;
    const cached = cacheUtils.get<CostVariance>(cacheKey);
    if (cached) return cached;

    try {
      const data = await httpClient.get<CostVariance>(`/costing/variances/${id}`, getAuthHeaders());
      cacheUtils.set(cacheKey, data, CACHE_TTL.SHORT);
      return data;
    } catch (error) {
      handleError(error, 'getCostVariance');
    }
  }

  async updateCostVariance(id: string, data: Partial<CostVariance>): Promise<CostVariance> {
    try {
      const result = await httpClient.put<CostVariance>(`/costing/variances/${id}`, data, getAuthHeaders());
      cacheUtils.delete(`cost_variance_${id}`);
      cacheUtils.invalidatePattern('cost_variances');
      toast.success('Cost variance updated successfully');
      return result;
    } catch (error) {
      handleError(error, 'updateCostVariance');
    }
  }

  // Cost Allocation Rules
  async getCostAllocationRules(filters: CostingFilters = {}): Promise<CostAllocationRule[]> {
    const cacheKey = `allocation_rules_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<CostAllocationRule[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/allocation-rules?${queryParams.toString()}`;
      const data = await httpClient.get<CostAllocationRule[]>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getCostAllocationRules');
    }
  }

  async getCostAllocationRule(id: string): Promise<CostAllocationRule> {
    const cacheKey = `allocation_rule_${id}`;
    const cached = cacheUtils.get<CostAllocationRule>(cacheKey);
    if (cached) return cached;

    try {
      const data = await httpClient.get<CostAllocationRule>(`/costing/allocation-rules/${id}`, getAuthHeaders());
      cacheUtils.set(cacheKey, data, CACHE_TTL.MEDIUM);
      return data;
    } catch (error) {
      handleError(error, 'getCostAllocationRule');
    }
  }

  async createCostAllocationRule(data: CostAllocationRuleFormData): Promise<CostAllocationRule> {
    try {
      const result = await httpClient.post<CostAllocationRule>('/costing/allocation-rules', data, getAuthHeaders());
      cacheUtils.invalidatePattern('allocation_rules');
      toast.success('Allocation rule created successfully');
      return result;
    } catch (error) {
      handleError(error, 'createCostAllocationRule');
    }
  }

  async updateCostAllocationRule(id: string, data: Partial<CostAllocationRuleFormData>): Promise<CostAllocationRule> {
    try {
      const result = await httpClient.put<CostAllocationRule>(`/costing/allocation-rules/${id}`, data, getAuthHeaders());
      cacheUtils.delete(`allocation_rule_${id}`);
      cacheUtils.invalidatePattern('allocation_rules');
      toast.success('Allocation rule updated successfully');
      return result;
    } catch (error) {
      handleError(error, 'updateCostAllocationRule');
    }
  }

  async deleteCostAllocationRule(id: string): Promise<void> {
    try {
      await httpClient.delete(`/costing/allocation-rules/${id}`, getAuthHeaders());
      cacheUtils.delete(`allocation_rule_${id}`);
      cacheUtils.invalidatePattern('allocation_rules');
      toast.success('Allocation rule deleted successfully');
    } catch (error) {
      handleError(error, 'deleteCostAllocationRule');
    }
  }

  // Analytics
  async getCostingAnalytics(filters: { date_from?: string; date_to?: string } = {}): Promise<CostingAnalytics> {
    const cacheKey = `costing_analytics_${JSON.stringify(filters)}`;
    const cached = cacheUtils.get<CostingAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/costing/analytics?${queryParams.toString()}`;
      const data = await httpClient.get<CostingAnalytics>(endpoint, getAuthHeaders());
      
      cacheUtils.set(cacheKey, data, CACHE_TTL.SHORT);
      return data;
    } catch (error) {
      handleError(error, 'getCostingAnalytics');
    }
  }

  // Reports
  async generateCostReport(reportData: {
    report_type: string;
    date_range: { start_date: string; end_date: string };
    filters: any;
    export_format: 'pdf' | 'excel' | 'csv';
  }): Promise<{ download_url: string }> {
    try {
      const result = await httpClient.post<{ download_url: string }>('/costing/reports', reportData, getAuthHeaders());
      toast.success('Report generated successfully');
      return result;
    } catch (error) {
      handleError(error, 'generateCostReport');
    }
  }

  // Utility Methods
  async checkCostCenterCodeUnique(code: string, organizationId: string): Promise<boolean> {
    try {
      const result = await httpClient.get<{ is_unique: boolean }>(
        `/costing/validate/cost-center-code?code=${code}&organization_id=${organizationId}`,
        getAuthHeaders()
      );
      return result.is_unique;
    } catch (error) {
      handleError(error, 'checkCostCenterCodeUnique');
    }
  }

  async checkActivityCodeUnique(code: string, organizationId: string): Promise<boolean> {
    try {
      const result = await httpClient.get<{ is_unique: boolean }>(
        `/costing/validate/activity-code?code=${code}&organization_id=${organizationId}`,
        getAuthHeaders()
      );
      return result.is_unique;
    } catch (error) {
      handleError(error, 'checkActivityCodeUnique');
    }
  }

  async checkStandardCostExists(productId: string, version: string, organizationId: string): Promise<boolean> {
    try {
      const result = await httpClient.get<{ exists: boolean }>(
        `/costing/validate/standard-cost?product_id=${productId}&version=${version}&organization_id=${organizationId}`,
        getAuthHeaders()
      );
      return result.exists;
    } catch (error) {
      handleError(error, 'checkStandardCostExists');
    }
  }

  async checkProcessNameUnique(name: string, organizationId: string): Promise<boolean> {
    try {
      const result = await httpClient.get<{ is_unique: boolean }>(
        `/costing/validate/process-name?name=${name}&organization_id=${organizationId}`,
        getAuthHeaders()
      );
      return result.is_unique;
    } catch (error) {
      handleError(error, 'checkProcessNameUnique');
    }
  }

  async checkRuleNameUnique(name: string, organizationId: string): Promise<boolean> {
    try {
      const result = await httpClient.get<{ is_unique: boolean }>(
        `/costing/validate/rule-name?name=${name}&organization_id=${organizationId}`,
        getAuthHeaders()
      );
      return result.is_unique;
    } catch (error) {
      handleError(error, 'checkRuleNameUnique');
    }
  }

  // Cache Management
  clearCache(): void {
    cacheUtils.clear();
  }

  invalidateCache(pattern: string): void {
    cacheUtils.invalidatePattern(pattern);
  }
}

// Export singleton instance
export const costingService = new CostingService(); 