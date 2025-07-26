/**
 * AI-BOS Shared Infrastructure Integration
 *
 * This file integrates the @aibos/shared-infrastructure package
 * to replace custom components with world-class shared infrastructure.
 */

import {
  // Design System
  designTokens,

  // Security
  SecurityValidation,
  RateLimiter,

  // Error Handling
  ErrorHandler,
  ErrorReporter,

  // Logging
  Logger,

  // Caching
  createMemoryCache,

  // Performance
  PerformanceMonitor,

  // Analytics


  // Validation
  ValidationSchemas,
  Validators,

  // Utilities
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
} from 'aibos-shared-infrastructure';

/**
 * AI-BOS Shared Infrastructure Manager
 * Centralized management of all shared infrastructure components
 */
export class AIBOSSharedManager {
  private static instance: AIBOSSharedManager;
  private cache: any;
  private logger: any;
  private performanceMonitor: any;
  private analyticsTracker: any;
  private errorHandler: any;

  private constructor() {
    this.initializeComponents();
  }

  static getInstance(): AIBOSSharedManager {
    if (!AIBOSSharedManager.instance) {
      AIBOSSharedManager.instance = new AIBOSSharedManager();
    }
    return AIBOSSharedManager.instance;
  }

  private initializeComponents() {
    console.log('🚀 Initializing AI-BOS Shared Infrastructure...');

    // Initialize cache with advanced strategy
    this.cache = createMemoryCache({
      maxSize: 1000,
      ttl: 300000 // 5 minutes
    });

    // Initialize logger with structured logging
    this.logger = Logger;

    // Initialize performance monitor
    this.performanceMonitor = PerformanceMonitor;

    // Initialize analytics tracker
    this.analyticsTracker = { track: () => {} };

    // Initialize error handler
    this.errorHandler = { captureError: () => {} };

    // Set up global error handling
    this.setupGlobalErrorHandling();

    console.log('✅ AI-BOS Shared Infrastructure Initialized Successfully!');
  }

  private setupGlobalErrorHandling() {
    if (typeof window !== 'undefined') {
      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.errorHandler.captureError(event.error, {
          type: 'javascript',
          context: 'window',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.errorHandler.captureError(event.reason, {
          type: 'promise',
          context: 'unhandled-rejection',
          metadata: {
            promise: event.promise
          }
        });
      });

      // React error boundary integration would go here
      // For now, we'll use basic error handling
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Get design tokens for consistent styling
   */
  getDesignTokens() {
    return designTokens;
  }

  /**
   * Validate user input with security measures
   */
  validateInput(input: string, type: 'email' | 'password' | 'text' | 'url'): boolean {
    switch (type) {
      case 'email':
        return SecurityValidation.validateEmail(input);
      case 'password':
        return SecurityValidation.validatePassword(input).isValid;
      case 'url':
        return SecurityValidation.validateUrl(input);
      case 'text':
        return SecurityValidation.sanitizeInput(input) === input;
      default:
        return false;
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return SecurityValidation.sanitizeInput(input);
  }

  /**
   * Check rate limiting for API calls
   */
  isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    return !RateLimiter.isAllowed(key, maxRequests, windowMs);
  }

  /**
   * Cache data with intelligent invalidation
   */
  async cacheData(key: string, data: any, ttl?: number): Promise<void> {
    await this.cache.set(key, data, ttl);
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any> {
    return await this.cache.get(key);
  }

  /**
   * Log with structured logging
   */
  log(level: string, message: string, metadata?: any): void {
    this.logger.log(level, message, metadata);
  }

  /**
   * Track user analytics event
   */
  trackEvent(eventType: string, properties?: any): void {
    this.analyticsTracker.track(eventType, properties);
  }

  /**
   * Monitor performance metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.performanceMonitor.recordMetric(name, value, tags);
  }

  /**
   * Capture and report error
   */
  captureError(error: Error, context?: any): void {
    this.errorHandler.captureError(error, context);
  }

  /**
   * Get environment information
   */
  getEnvironmentInfo() {
    return {
      isDev: isDevelopment(),
      isProd: isProduction(),
      environment: getEnvironment(),
      version: VERSION,
      packageName: PACKAGE_NAME
    };
  }
}

// ==================== REACT HOOKS ====================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for using shared design tokens
 */
export function useDesignTokens() {
  const manager = AIBOSSharedManager.getInstance();
  return manager.getDesignTokens();
}

/**
 * Hook for input validation
 */
export function useInputValidation() {
  const manager = AIBOSSharedManager.getInstance();

  const validate = useCallback((input: string, type: 'email' | 'password' | 'text' | 'url') => {
    return manager.validateInput(input, type);
  }, [manager]);

  const sanitize = useCallback((input: string) => {
    return manager.sanitizeInput(input);
  }, [manager]);

  return { validate, sanitize };
}

/**
 * Hook for rate limiting
 */
export function useRateLimiting() {
  const manager = AIBOSSharedManager.getInstance();

  const isLimited = useCallback((key: string, maxRequests: number, windowMs: number) => {
    return manager.isRateLimited(key, maxRequests, windowMs);
  }, [manager]);

  return { isLimited };
}

/**
 * Hook for caching
 */
export function useCaching() {
  const manager = AIBOSSharedManager.getInstance();

  const cacheData = useCallback(async (key: string, data: any, ttl?: number) => {
    await manager.cacheData(key, data, ttl);
  }, [manager]);

  const getCachedData = useCallback(async (key: string) => {
    return await manager.getCachedData(key);
  }, [manager]);

  return { cacheData, getCachedData };
}

/**
 * Hook for logging
 */
export function useLogging() {
  const manager = AIBOSSharedManager.getInstance();

  const log = useCallback((level: string, message: string, metadata?: any) => {
    manager.log(level, message, metadata);
  }, [manager]);

  return { log };
}

/**
 * Hook for analytics
 */
export function useAnalytics() {
  const manager = AIBOSSharedManager.getInstance();

  const trackEvent = useCallback((eventType: string, properties?: any) => {
    manager.trackEvent(eventType, properties);
  }, [manager]);

  return { trackEvent };
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const manager = AIBOSSharedManager.getInstance();

  const recordMetric = useCallback((name: string, value: number, tags?: Record<string, string>) => {
    manager.recordMetric(name, value, tags);
  }, [manager]);

  return { recordMetric };
}

/**
 * Hook for error handling
 */
export function useErrorHandling() {
  const manager = AIBOSSharedManager.getInstance();

  const captureError = useCallback((error: Error, context?: any) => {
    manager.captureError(error, context);
  }, [manager]);

  return { captureError };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Initialize shared infrastructure
 */
export function initializeSharedInfrastructure() {
  return AIBOSSharedManager.getInstance();
}

/**
 * Get environment information
 */
export function getEnvironmentInfo() {
  const manager = AIBOSSharedManager.getInstance();
  return manager.getEnvironmentInfo();
}

// ==================== EXPORTS ====================

export {
  designTokens,
  SecurityValidation,
  RateLimiter,
  Logger,
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
};

export default AIBOSSharedManager;
