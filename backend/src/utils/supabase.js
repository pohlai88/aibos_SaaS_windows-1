const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('❌ Supabase credentials required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
const db = {
  // Tenants
  async createTenant(tenantData) {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenantData)
      .select()
      .single();
    
    return { data, error };
  },

  async getTenant(tenantId) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();
    
    return { data, error };
  },

  async listTenants() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    return { data, error };
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    return { data, error };
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },

  async listUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Manifests
  async createManifest(manifestData) {
    const { data, error } = await supabase
      .from('manifests')
      .insert(manifestData)
      .select()
      .single();
    
    return { data, error };
  },

  async getManifest(manifestId) {
    const { data, error } = await supabase
      .from('manifests')
      .select('*')
      .eq('manifest_id', manifestId)
      .single();
    
    return { data, error };
  },

  async listManifests() {
    const { data, error } = await supabase
      .from('manifests')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async updateManifest(manifestId, updateData) {
    const { data, error } = await supabase
      .from('manifests')
      .update(updateData)
      .eq('manifest_id', manifestId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteManifest(manifestId) {
    const { data, error } = await supabase
      .from('manifests')
      .delete()
      .eq('manifest_id', manifestId);
    
    return { data, error };
  },

  // Apps
  async createApp(appData) {
    const { data, error } = await supabase
      .from('apps')
      .insert(appData)
      .select()
      .single();
    
    return { data, error };
  },

  async getApp(appId) {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('app_id', appId)
      .single();
    
    return { data, error };
  },

  async listApps(tenantId = null) {
    let query = supabase.from('apps').select('*');
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query.order('installed_at', { ascending: false });
    return { data, error };
  },

  async updateApp(appId, updateData) {
    const { data, error } = await supabase
      .from('apps')
      .update(updateData)
      .eq('app_id', appId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteApp(appId) {
    const { data, error } = await supabase
      .from('apps')
      .delete()
      .eq('app_id', appId);
    
    return { data, error };
  },

  // Events
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    
    return { data, error };
  },

  async listEvents(filters = {}) {
    let query = supabase.from('events').select('*');
    
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    if (filters.app_id) {
      query = query.eq('app_id', filters.app_id);
    }
    if (filters.event_name) {
      query = query.eq('event_name', filters.event_name);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Event Subscriptions
  async createEventSubscription(subscriptionData) {
    const { data, error } = await supabase
      .from('event_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    return { data, error };
  },

  async listEventSubscriptions(filters = {}) {
    let query = supabase.from('event_subscriptions').select('*');
    
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    if (filters.app_id) {
      query = query.eq('app_id', filters.app_id);
    }
    if (filters.event_name) {
      query = query.eq('event_name', filters.event_name);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async deleteEventSubscription(subscriptionId) {
    const { data, error } = await supabase
      .from('event_subscriptions')
      .delete()
      .eq('subscription_id', subscriptionId);
    
    return { data, error };
  },

  async updateEventSubscription(subscriptionId, updateData) {
    const { data, error } = await supabase
      .from('event_subscriptions')
      .update(updateData)
      .eq('subscription_id', subscriptionId)
      .select()
      .single();
    
    return { data, error };
  },

  // Entities
  async createEntity(entityData) {
    const { data, error } = await supabase
      .from('entities')
      .insert(entityData)
      .select()
      .single();
    
    return { data, error };
  },

  async listEntities(filters = {}) {
    let query = supabase.from('entities').select('*');
    
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    if (filters.manifest_id) {
      query = query.eq('manifest_id', filters.manifest_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Entity Data (dynamic tables)
  async getEntityData(entityName, tenantId, filters = {}) {
    let query = supabase.from(entityName).select('*').eq('tenant_id', tenantId);
    
    // Apply additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        query = query.eq(key, filters[key]);
      }
    });
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createEntityRecord(entityName, recordData) {
    const { data, error } = await supabase
      .from(entityName)
      .insert(recordData)
      .select()
      .single();
    
    return { data, error };
  },

  async updateEntityRecord(entityName, recordId, updateData) {
    const { data, error } = await supabase
      .from(entityName)
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteEntityRecord(entityName, recordId) {
    const { data, error } = await supabase
      .from(entityName)
      .delete()
      .eq('id', recordId);
    
    return { data, error };
  }
};

module.exports = { supabase, db }; 