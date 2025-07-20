// Export main components
export { default as MetadataRegistryDashboard } from './components/MetadataRegistryDashboard';

// Export services
export { MetadataRegistryService } from './services/metadata-registry-service';

// Export types and enums
export {
  DataType,
  MetadataStatus,
  Domain,
  SecurityLevel,
  type MetadataField,
  type LocalMetadataField,
  type MetadataSuggestion,
  type MetadataUsage,
  type MetadataFieldInput,
  type GovernanceMetrics
} from './services/metadata-registry-service';

// Export local types
export * from './types';

// Export UI components
export * from './components/ui';

// Module metadata for AI-BOS OS integration
export const moduleMetadata = {
  id: 'metadata-registry',
  name: 'Metadata Registry',
  version: '1.0.0',
  description: 'Standalone hybrid metadata framework for data governance and flexibility',
  category: 'governance',
  tags: ['metadata', 'governance', 'data-dictionary', 'hybrid'],
  author: 'AI-BOS Team',
  license: 'MIT',
  entryComponent: 'MetadataRegistryDashboard',
  permissions: [
    'database:read',
    'database:write',
    'metadata:manage',
    'governance:view'
  ],
  features: [
    'hybridMetadata',
    'smartSuggestions',
    'governanceMetrics',
    'dataDictionary'
  ],
  standalone: true,
  dependencies: {
    external: ['react', 'react-dom', '@supabase/supabase-js'],
    internal: []
  }
};