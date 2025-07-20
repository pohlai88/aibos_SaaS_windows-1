// Basic audit log helper
import { SupabaseClient } from '@supabase/supabase-js';

export async function logAudit(
  supabase: SupabaseClient,
  {
    organizationId,
    userId,
    action,
    entity,
    entityId,
    details
  }: {
    organizationId: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
  }
) {
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    user_id: userId,
    action,
    entity,
    entity_id: entityId,
    details: details ? JSON.stringify(details) : null,
    created_at: new Date().toISOString()
  });
}
