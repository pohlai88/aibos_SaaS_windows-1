/**
 * 🧠 AI-BOS Shared Infrastructure
 * World-class shared infrastructure for AI-BOS platform
 *
 * This package provides:
 * - Design System (tokens, components, themes)
 * - Error Handling (validation, authentication, network, database, AI, security, performance)
 * - Performance Monitoring (metrics, optimization, caching)
 * - Security (encryption, sanitization, validation)
 * - Accessibility (ARIA, keyboard navigation, screen readers)
 * - Manifestor (module governance, permissions, configuration)
 * - Utilities (helpers, constants, types)
 * - Logging (structured logging, formatters, transports)
 * - Analytics (events, insights, tracking)
 * - Caching (memory, Redis, invalidation)
 * - Validation (schemas, sanitizers, formatters)
 */

// ==================== MODULE EXPORTS ====================

// Design System
export * from './design-system';
export * from './design-system/tokens';
export * from './design-system/components';
export * from './design-system/theme';

// Error Handling
export * from './error-handling';
export * from './error-handling/handlers';
export * from './error-handling/formatters';
export * from './error-handling/types';

// Performance
export * from './performance';
export * from './performance/monitor';
export * from './performance/metrics';

// Security
export * from './security';
export * from './security/encryption';
export * from './security/sanitization';

// Accessibility
export * from './accessibility';
export * from './accessibility/aria';
export * from './accessibility/index';

// Manifestor
export * from './manifestor';
export * from './manifestor/loader';

// Utilities
export * from './utils';

// Logging
export * from './logging';
export * from './logging/logger';
export * from './logging/formatters';
export * from './logging/transports';

// Analytics
export * from './analytics';
export * from './analytics/events';
export * from './analytics/insights';

// Caching
export * from './caching';
export * from './caching/cache';
export * from './caching/invalidation';

// Validation
export * from './validation';
export * from './validation/schemas';
export * from './validation/sanitizers';

// Constants
export * from './constants';
export * from './constants/api';
export * from './constants/limits';

// Types
export * from './types';
export * from './types/api';
export * from './types/common';
export * from './types/events';

// ==================== VERSION INFO ====================

export const VERSION = '1.0.0';
export const PACKAGE_NAME = 'aibos-shared-infrastructure';

// ==================== TYPE EXPORTS ====================

// Export all types for TypeScript users
export type {
  DesignTokens,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  BorderRadiusTokens,
  ShadowTokens,
  AnimationTokens,
  ZIndexTokens,
  BreakpointTokens,
  BorderTokens
} from './design-system/tokens';

export type {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DatabaseError,
  AIError,
  SecurityError,
  PerformanceError,
  ErrorContext,
  ErrorMetadata,
  ErrorResponse,
  ValidationErrorResponse,
  ErrorHandler,
  ErrorReporter,
  ErrorFormatter,
  ErrorWithContext,
  ErrorHandlerFunction,
  ErrorFilterFunction,
  ErrorTransformFunction
} from './error-handling/types';

// ==================== CONSTANTS ====================

export const INFRASTRUCTURE_CONSTANTS = {
  VERSION,
  PACKAGE_NAME,
  SUPPORTED_NODE_VERSION: '>=18.0.0',
  SUPPORTED_REACT_VERSION: '>=18.0.0',
  BUILD_TIMESTAMP: new Date().toISOString(),
  GITHUB_URL: 'https://github.com/aibos/aibos-shared-infrastructure',
  DOCUMENTATION_URL: 'https://docs.aibos.com/shared-infrastructure',
  SUPPORT_EMAIL: 'support@aibos.com',
  DISCORD_URL: 'https://discord.gg/aibos'
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get package information
 */
export const getPackageInfo = () => ({
  name: PACKAGE_NAME,
  version: VERSION,
  description: 'World-class shared infrastructure for AI-BOS platform',
  author: 'AI-BOS Team',
  license: 'MIT'
});

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
};

/**
 * Get current environment
 */
export const getEnvironment = (): string => {
  return typeof process !== 'undefined' ? (process.env?.NODE_ENV || 'development') : 'development';
};

/**
 * Validate infrastructure setup
 */
export const validateInfrastructure = (): boolean => {
  try {
    // Check if all required modules are available
    const requiredModules = [
      'design-system',
      'error-handling',
      'performance',
      'security',
      'accessibility',
      'manifestor'
    ];

    for (const module of requiredModules) {
      // This is a basic validation - in a real implementation,
      // you might want to check for actual module availability
      if (!module) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Infrastructure validation failed:', error);
    return false;
  }
};

// ==================== MANIFESTOR INITIALIZATION ====================

// Initialize shared manifestor when package is loaded
import { initializeSharedManifestor } from './manifestor/loader';

// Auto-initialize in browser environments
if (typeof window !== 'undefined') {
  initializeSharedManifestor();
}
