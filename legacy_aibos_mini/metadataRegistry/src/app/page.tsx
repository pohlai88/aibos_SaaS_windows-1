'use client'

import MetadataRegistryDashboard from '@/components/MetadataRegistryDashboard'

export default function HomePage() {
  return (
    <MetadataRegistryDashboard 
      organizationId={process.env.NEXT_PUBLIC_ORGANIZATION_ID || "demo-org-123"}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"}
    />
  );
} 