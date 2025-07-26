/**
 * TypeScript declarations for manifest JSON imports
 */

declare module '*.manifest.json' {
  const value: {
    id: string;
    version: string;
    type: 'core' | 'module' | 'integration';
    enabled: boolean;
    dependencies: string[];
    permissions?: Record<string, string[]>;
    config?: {
      defaults: Record<string, any>;
      overrides?: Record<string, any>;
    };
    lifecycle?: {
      init?: string;
      destroy?: string;
    };
  };
  export default value;
}

declare module '@/manifests/core/*.manifest.json' {
  const value: import('*.manifest.json');
  export default value;
}

declare module '@/manifests/modules/*.manifest.json' {
  const value: import('*.manifest.json');
  export default value;
}

declare module '@/manifests/integrations/*.manifest.json' {
  const value: import('*.manifest.json');
  export default value;
}
