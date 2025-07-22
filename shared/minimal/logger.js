"use strict";
/**
 * Simple Logger for AI-BOS Shared Library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, data) => {
        console.log(`[INFO] ${message}`, data || '');
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${message}`, data || '');
    },
    error: (message, data) => {
        console.error(`[ERROR] ${message}`, data || '');
    },
    debug: (message, data) => {
        console.debug(`[DEBUG] ${message}`, data || '');
    },
};
//# sourceMappingURL=logger.js.map