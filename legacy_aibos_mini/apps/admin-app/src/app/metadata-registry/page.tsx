'use client';

import MetadataRegistryDashboard from '../../components/metadata-registry/MetadataRegistryDashboard';

export default function MetadataRegistryPage() {
  // These should come from environment variables or auth context
  const organizationId = 'default-org-id';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

  return (
    <MetadataRegistryDashboard
      organizationId={organizationId}
      supabaseUrl={supabaseUrl}
      supabaseKey={supabaseKey}
    />
  );
} 