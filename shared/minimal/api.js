"use strict";
/**
 * Simple API Fetcher for AI-BOS Shared Library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiFetcher = apiFetcher;
async function apiFetcher(endpoint, options) {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
}
//# sourceMappingURL=api.js.map