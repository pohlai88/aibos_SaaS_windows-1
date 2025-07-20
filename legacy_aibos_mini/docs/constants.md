export const TABLE_CONFIG = {
  SKELETON_ROWS: 5,
  ANIMATION_DELAY_MS: 50,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_SEARCH_RESULTS: 100,
} as const

export const TABLE_STYLES = {
  GLASS_CARD: 'glass-card overflow-hidden',
  SEARCH_INPUT: 'w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-apple text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all duration-200 ease-apple-smooth',
  // ... more styles
} as const