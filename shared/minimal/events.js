"use strict";
/**
 * Simple EventBus for AI-BOS Shared Library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    subscribe(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        return () => this.unsubscribe(event, handler);
    }
    unsubscribe(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    publish(event, data) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=events.js.map