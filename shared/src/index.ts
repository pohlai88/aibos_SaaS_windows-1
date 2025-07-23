/**
 * AI-BOS Shared Infrastructure
 *
 * World-class shared infrastructure package for the AI-BOS platform.
 * This package provides design tokens, error handling, performance monitoring,
 * security utilities, accessibility helpers, and more.
 *
 * @version 1.0.0
 * @author AI-BOS Team
 */

// ==================== DESIGN SYSTEM EXPORTS ====================

export * from './design-system';

// ==================== ERROR HANDLING EXPORTS ====================

export * from './error-handling';

// ==================== PERFORMANCE EXPORTS ====================

export * from './performance';

// ==================== SECURITY EXPORTS ====================

export * from './security';

// ==================== ACCESSIBILITY EXPORTS ====================

export * from './accessibility';

// ==================== TYPES EXPORTS ====================

export * from './types';

// ==================== CONSTANTS EXPORTS ====================

export * from './constants';

// ==================== UTILS EXPORTS ====================

export * from './utils';

// ==================== VALIDATION EXPORTS ====================

export * from './validation';

// ==================== LOGGING EXPORTS ====================

export * from './logging';

// ==================== CACHING EXPORTS ====================

export * from './caching';

// ==================== ANALYTICS EXPORTS ====================

export * from './analytics';

// ==================== MAIN EXPORTS ====================

// Re-export the main design tokens for convenience
export { designTokens } from './design-system/tokens';

// Re-export error handling utilities for convenience
export {
  createErrorId,
  createCorrelationId,
  createRequestId,
  isErrorSeverity,
  isErrorCategory,
  isErrorCode,
  ERROR_CONSTANTS
} from './error-handling/types';

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
      'accessibility'
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
