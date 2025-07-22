/**
 * Simple EventBus for AI-BOS Shared Library
 */
export declare class EventBus {
    private listeners;
    subscribe(event: string, handler: Function): () => void;
    unsubscribe(event: string, handler: Function): void;
    publish(event: string, data?: any): void;
}
//# sourceMappingURL=events.d.ts.map