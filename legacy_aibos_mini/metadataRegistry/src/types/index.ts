// Local type definitions extracted from @aibos/core-types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AuditLog extends BaseEntity {
  action: string;
  resource_type: string;
  resource_id: string;
  user_id: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Core module types
export interface ModuleConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}