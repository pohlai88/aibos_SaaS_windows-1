import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Permission } from '../types';
import { PermissionResource, UserPermission } from '../utils/permission-utils';

export class PermissionService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getUserPermissions(userId: string, organizationId: string): Promise<{ permissions: PermissionResource[]; error: any }> {
    const { data, error } = await this.supabase
      .from('user_permissions')
      .select(`
        *,
        permissions (*)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    return { permissions: data?.map(p => p.permissions) || [], error };
  }

  async checkPermission(userId: string, organizationId: string, resource: string, action: string): Promise<{ hasPermission: boolean; error: any }> {
    const { data, error } = await this.supabase
      .from('user_permissions')
      .select(`
        *,
        permissions (*)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('permissions.resource', resource)
      .eq('permissions.action', action);

    return { hasPermission: (data && data.length > 0) || false, error };
  }
} 