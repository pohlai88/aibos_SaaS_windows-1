/**
 * AI-BOS Minimal Shared Library
 * Simple, working shared components for immediate integration
 */

// Core utilities
export { logger } from './logger';
export { monitoring } from './monitoring';
export { EventBus } from './events';
export { apiFetcher } from './api';
export { validateSchema } from './validation';

// Types
export type { ApiResponse, ApiError } from './types';
export type { ValidationResult } from './validation';

// Note: UI components are temporarily disabled to focus on core utilities
// export { Button } from './ui/Button';
// export { Input } from './ui/Input';
// export { Badge } from './ui/Badge';
// export type { ButtonProps } from './ui/Button';
// export type { InputProps } from './ui/Input';
// export type { BadgeProps } from './ui/Badge';
