"use strict";
/**
 * AI-BOS Minimal Shared Library
 * Simple, working shared components for immediate integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = exports.apiFetcher = exports.EventBus = exports.monitoring = exports.logger = void 0;
// Core utilities
var logger_1 = require("./logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
var monitoring_1 = require("./monitoring");
Object.defineProperty(exports, "monitoring", { enumerable: true, get: function () { return monitoring_1.monitoring; } });
var events_1 = require("./events");
Object.defineProperty(exports, "EventBus", { enumerable: true, get: function () { return events_1.EventBus; } });
var api_1 = require("./api");
Object.defineProperty(exports, "apiFetcher", { enumerable: true, get: function () { return api_1.apiFetcher; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return validation_1.validateSchema; } });
// Note: UI components are temporarily disabled to focus on core utilities
// export { Button } from './ui/Button';
// export { Input } from './ui/Input';
// export { Badge } from './ui/Badge';
// export type { ButtonProps } from './ui/Button';
// export type { InputProps } from './ui/Input';
// export type { BadgeProps } from './ui/Badge';
//# sourceMappingURL=index.js.map