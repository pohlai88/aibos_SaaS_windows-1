// Zero-Cost 5G Network Slicer
// Dynamically loads network slices to reduce initial bundle size

const NETWORK_SLICES = new Map<string, () => Promise<any>>([
  ['ultra-low-latency', () => import('./slices/ull')],
  ['massive-iot', () => import('./slices/miot')],
  ['enhanced-mobile', () => import('./slices/embb')],
  ['network-slicing', () => import('./slices/slicing')],
  ['edge-computing', () => import('./slices/edge')],
  ['network-automation', () => import('./slices/automation')],
  ['security-slice', () => import('./slices/security')],
  ['analytics-slice', () => import('./slices/analytics')]
]);

// Preload cache for frequently used slices
const preloadCache = new Map<string, Promise<any>>();

/**
 * Loads a 5G network slice dynamically
 * @param slice - The slice name to load
 * @returns Promise with the loaded slice module
 */
export async function loadNetworkSlice(slice: string): Promise<any> {
  const loader = NETWORK_SLICES.get(slice);

  if (!loader) {
    throw new Error(`Invalid network slice: ${slice}`);
  }

  // Check preload cache first
  if (preloadCache.has(slice)) {
    return preloadCache.get(slice);
  }

  try {
    const module = await loader();
    preloadCache.set(slice, Promise.resolve(module));
    return module;
  } catch (error) {
    console.error(`Failed to load network slice '${slice}':`, error);
    throw error;
  }
}

/**
 * Preloads multiple network slices for better performance
 * @param slices - Array of slice names to preload
 * @returns Promise that resolves when all slices are loaded
 */
export async function preloadNetworkSlices(slices: string[]): Promise<void> {
  const loadPromises = slices
    .filter(slice => NETWORK_SLICES.has(slice))
    .map(slice => loadNetworkSlice(slice));

  await Promise.all(loadPromises);
}

/**
 * Gets all available network slice names
 * @returns Array of available slice names
 */
export function getAvailableSlices(): string[] {
  return Array.from(NETWORK_SLICES.keys());
}

/**
 * Checks if a network slice is available
 * @param slice - The slice name to check
 * @returns True if the slice is available
 */
export function isSliceAvailable(slice: string): boolean {
  return NETWORK_SLICES.has(slice);
}

/**
 * Gets slice loading statistics
 * @returns Object with cache statistics
 */
export function getSliceStats(): {
  totalSlices: number;
  cachedSlices: number;
  cacheHitRate: number;
} {
  return {
    totalSlices: NETWORK_SLICES.size,
    cachedSlices: preloadCache.size,
    cacheHitRate: preloadCache.size / NETWORK_SLICES.size
  };
}

/**
 * Clears the preload cache to free memory
 */
export function clearSliceCache(): void {
  preloadCache.clear();
}

/**
 * Intelligent slice loader with usage tracking
 */
class IntelligentSliceLoader {
  private usageStats = new Map<string, number>();
  private lastUsed = new Map<string, number>();

  async loadWithIntelligence(slice: string): Promise<any> {
    // Track usage
    this.usageStats.set(slice, (this.usageStats.get(slice) || 0) + 1);
    this.lastUsed.set(slice, Date.now());

    // Preload frequently used slices
    const frequentlyUsed = this.getFrequentlyUsedSlices();
    if (frequentlyUsed.length > 0) {
      await preloadNetworkSlices(frequentlyUsed);
    }

    return loadNetworkSlice(slice);
  }

  private getFrequentlyUsedSlices(): string[] {
    const threshold = 3; // Consider frequently used if accessed 3+ times
    return Array.from(this.usageStats.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([slice, _]) => slice);
  }

  getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.usageStats);
  }
}

// Export intelligent loader instance
export const intelligentLoader = new IntelligentSliceLoader();
