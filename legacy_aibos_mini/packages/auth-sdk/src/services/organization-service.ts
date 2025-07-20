import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createOrganizationSchema, updateOrganizationSchema } from '../validation';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface OrganizationServiceConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export class OrganizationService {
  private supabase: SupabaseClient;

  constructor(config: OrganizationServiceConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  // Create a new organization
  async createOrganization(data: any): Promise<{ organization: Organization | null; error: any }> {
    const validation = createOrganizationSchema.safeParse(data);
    if (!validation.success) {
      return { organization: null, error: validation.error };
    }

    const { data: org, error } = await this.supabase
      .from('organizations')
      .insert([validation.data])
      .select()
      .single();

    return { organization: org, error };
  }

  // Get organization by ID
  async getOrganization(id: string): Promise<{ organization: Organization | null; error: any }> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    return { organization: data, error };
  }

  // Get organization by slug
  async getOrganizationBySlug(slug: string): Promise<{ organization: Organization | null; error: any }> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    return { organization: data, error };
  }

  // Update organization
  async updateOrganization(id: string, data: any): Promise<{ organization: Organization | null; error: any }> {
    const validation = updateOrganizationSchema.safeParse(data);
    if (!validation.success) {
      return { organization: null, error: validation.error };
    }

    const { data: org, error } = await this.supabase
      .from('organizations')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    return { organization: org, error };
  }

  // Delete organization
  async deleteOrganization(id: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    return { error };
  }

  // Get organization members
  async getOrganizationMembers(organizationId: string): Promise<{ members: OrganizationMember[]; error: any }> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        users (
          id,
          email,
          first_name,
          last_name,
          role
        )
      `)
      .eq('organization_id', organizationId);

    return { members: data || [], error };
  }

  // Add member to organization
  async addMember(organizationId: string, userId: string, role: string = 'user'): Promise<{ member: OrganizationMember | null; error: any }> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .insert([{
        organization_id: organizationId,
        user_id: userId,
        role,
      }])
      .select()
      .single();

    return { member: data, error };
  }

  // Remove member from organization
  async removeMember(organizationId: string, userId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    return { error };
  }

  // Update member role
  async updateMemberRole(organizationId: string, userId: string, role: string): Promise<{ member: OrganizationMember | null; error: any }> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .update({ role })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single();

    return { member: data, error };
  }
} 