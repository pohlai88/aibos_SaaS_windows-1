/**
 * Simple Monitoring for AI-BOS Shared Library
 */

export const monitoring = {
  start: () => {
    console.log('[MONITORING] Started');
  },
  track: (metric: string, value: any) => {
    console.log(`[METRIC] ${metric}:`, value);
  },
  stop: () => {
    console.log('[MONITORING] Stopped');
  },
};
