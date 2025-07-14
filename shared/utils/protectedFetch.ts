import { Permission } from '../types/roles/permissions';
import { User } from '../types/user/user';
import { apiFetcher, ApiFetcherConfig } from './apiFetcher';
import { requirePermission } from './permissionUtils';

/**
 * User context interface for getting current user
 */
export interface UserContext {
  getCurrentUser(): User | null;
}

/**
 * Global user context - should be set by the application
 */
let userContext: UserContext | null = null;

/**
 * Set the user context for the protected fetch utility
 */
export function setUserContext(context: UserContext): void {
  userContext = context;
}

/**
 * Get the current user from the context
 */
function getCurrentUser(): User | null {
  if (!userContext) {
    throw new Error('User context not set. Call setUserContext() first.');
  }
  return userContext.getCurrentUser();
}

/**
 * Protected fetch function that checks permissions before making API calls
 * @param endpoint - API endpoint URL
 * @param requiredPermissions - Permission or array of permissions required
 * @param options - Fetch options
 * @param config - API fetcher configuration
 * @returns Promise with typed API response
 * @throws Error if user lacks required permissions
 */
export async function protectedFetch<T>(
  endpoint: string,
  requiredPermissions: Permission | Permission[],
  options?: RequestInit,
  config?: ApiFetcherConfig
): Promise<T> {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  requirePermission(user.role, requiredPermissions);
  
  return apiFetcher<T>(endpoint, options, config);
}

/**
 * Convenience methods for common HTTP methods with permission checking
 */
export const protectedApi = {
  get: <T>(endpoint: string, requiredPermissions: Permission | Permission[], config?: ApiFetcherConfig) =>
    protectedFetch<T>(endpoint, requiredPermissions, { method: 'GET' }, config),
    
  post: <T>(endpoint: string, requiredPermissions: Permission | Permission[], data?: unknown, config?: ApiFetcherConfig) =>
    protectedFetch<T>(endpoint, requiredPermissions, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }, config),
    
  put: <T>(endpoint: string, requiredPermissions: Permission | Permission[], data?: unknown, config?: ApiFetcherConfig) =>
    protectedFetch<T>(endpoint, requiredPermissions, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }, config),
    
  patch: <T>(endpoint: string, requiredPermissions: Permission | Permission[], data?: unknown, config?: ApiFetcherConfig) =>
    protectedFetch<T>(endpoint, requiredPermissions, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }, config),
    
  delete: <T>(endpoint: string, requiredPermissions: Permission | Permission[], config?: ApiFetcherConfig) =>
    protectedFetch<T>(endpoint, requiredPermissions, { method: 'DELETE' }, config)
}; 