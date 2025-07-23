/**
 * AI-BOS Event Types
 *
 * Event-related TypeScript types.
 */

export interface EventEmitter {
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, data?: any) => void;
}

export interface EventHandler {
  (data?: any): void;
}
