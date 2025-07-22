"use strict";
/**
 * Simple Monitoring for AI-BOS Shared Library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoring = void 0;
exports.monitoring = {
    start: () => {
        console.log('[MONITORING] Started');
    },
    track: (metric, value) => {
        console.log(`[METRIC] ${metric}:`, value);
    },
    stop: () => {
        console.log('[MONITORING] Stopped');
    },
};
//# sourceMappingURL=monitoring.js.map