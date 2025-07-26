import { Manifest, register } from './index';
import path from 'path';
import fs from 'fs';

// ==================== MANIFEST LOADER ====================

/**
 * Load all manifests from the manifests directory
 */
export async function loadManifests(): Promise<void> {
  console.log('🧠 Loading AI-BOS backend manifests...');

  try {
    // Define manifest paths
    const manifestsDir = path.join(__dirname, '../../manifests');
    const coreManifestsDir = path.join(manifestsDir, 'core');
    const moduleManifestsDir = path.join(manifestsDir, 'modules');
    const integrationManifestsDir = path.join(manifestsDir, 'integrations');

    const manifests: Manifest[] = [];

    // Load core manifests
    if (fs.existsSync(coreManifestsDir)) {
      const coreFiles = fs.readdirSync(coreManifestsDir).filter(file => file.endsWith('.manifest.json'));
      for (const file of coreFiles) {
        const manifestPath = path.join(coreManifestsDir, file);
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent) as Manifest;
        manifests.push(manifest);
      }
    }

    // Load module manifests
    if (fs.existsSync(moduleManifestsDir)) {
      const moduleFiles = fs.readdirSync(moduleManifestsDir).filter(file => file.endsWith('.manifest.json'));
      for (const file of moduleFiles) {
        const manifestPath = path.join(moduleManifestsDir, file);
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent) as Manifest;
        manifests.push(manifest);
      }
    }

    // Load integration manifests
    if (fs.existsSync(integrationManifestsDir)) {
      const integrationFiles = fs.readdirSync(integrationManifestsDir).filter(file => file.endsWith('.manifest.json'));
      for (const file of integrationFiles) {
        const manifestPath = path.join(integrationManifestsDir, file);
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent) as Manifest;
        manifests.push(manifest);
      }
    }

    // Sort by dependencies (core first, then modules, then integrations)
    const sorted = sortByDependencies(manifests);

    // Register each manifest
    for (const manifest of sorted) {
      try {
        register(manifest);
      } catch (error) {
        console.error(`Failed to register manifest ${manifest.id}:`, error);
      }
    }

    console.log(`✅ Loaded ${sorted.length} backend manifests`);
  } catch (error) {
    console.error('Failed to load manifests:', error);
    throw error;
  }
}

/**
 * Sort manifests by dependencies
 */
function sortByDependencies(manifests: Manifest[]): Manifest[] {
  const sorted: Manifest[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(manifest: Manifest) {
    if (visiting.has(manifest.id)) {
      throw new Error(`Circular dependency detected: ${manifest.id}`);
    }
    if (visited.has(manifest.id)) {
      return;
    }

    visiting.add(manifest.id);

    // Visit dependencies first
    for (const depId of manifest.dependencies) {
      const dep = manifests.find(m => m.id === depId);
      if (dep) {
        visit(dep);
      }
    }

    visiting.delete(manifest.id);
    visited.add(manifest.id);
    sorted.push(manifest);
  }

  // Sort by type first (core, module, integration)
  const typeOrder = { core: 0, module: 1, integration: 2 };
  const typeSorted = manifests.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  // Then sort by dependencies
  for (const manifest of typeSorted) {
    visit(manifest);
  }

  return sorted;
}

/**
 * Get manifest by ID
 */
export function getManifest(id: string): Manifest | undefined {
  // This would need to be implemented with the actual manifest storage
  // For now, return undefined
  return undefined;
}

/**
 * Get all manifests
 */
export function getAllManifests(): Manifest[] {
  // This would need to be implemented with the actual manifest storage
  // For now, return empty array
  return [];
}

/**
 * Watch for manifest changes and reload
 */
export function watchManifests(): void {
  const manifestsDir = path.join(__dirname, '../../manifests');

  if (!fs.existsSync(manifestsDir)) {
    return;
  }

  console.log('👀 Watching for manifest changes...');

  fs.watch(manifestsDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.manifest.json')) {
      console.log(`📝 Manifest changed: ${filename}`);
      // In a production environment, you might want to reload manifests here
      // For now, we'll just log the change
    }
  });
}
