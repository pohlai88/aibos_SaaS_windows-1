/**
 * Shared Infrastructure Integration Test
 *
 * This file tests the integration of the @aibos/shared-infrastructure package
 * to ensure it's working correctly in the frontend.
 */

import {
  SecurityValidation,
  RateLimiter,
  designTokens,
  Logger,
  createMemoryCache,
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
} from 'aibos-shared-infrastructure';

/**
 * Test the shared infrastructure package
 */
export const testSharedInfrastructure = async () => {
  console.log('🧪 Testing Shared Infrastructure Package...');

  // Test package info
  console.log('📦 Package Info:', { VERSION, PACKAGE_NAME });

  // Test environment detection
  console.log('🌍 Environment:', {
    isDev: isDevelopment(),
    isProd: isProduction(),
    env: getEnvironment()
  });

  // Test security validation
  console.log('🔒 Security Validation:');
  console.log('- Email validation:', SecurityValidation.validateEmail('test@example.com'));
  console.log('- Password validation:', SecurityValidation.validatePassword('TestPass123'));
  console.log('- Input sanitization:', SecurityValidation.sanitizeInput('<script>alert("xss")</script>'));

  // Test rate limiting
  console.log('⏱️ Rate Limiting:');
  console.log('- Request allowed:', RateLimiter.isAllowed('test-key', 10, 60000));

  // Test design tokens
  console.log('🎨 Design Tokens:');
  console.log('- Primary color:', designTokens.colors.primary);
  console.log('- Spacing unit:', designTokens.spacing.md);
  console.log('- Border radius:', designTokens.borderRadius.md);

    // Test logging
  console.log('📝 Logging:');
  Logger.info();

  // Test caching
  console.log('💾 Caching:');
  const cache = createMemoryCache();
  cache.set('test-key', 'test-value', 60000);
  console.log('- Cached value:', await cache.get('test-key'));

  console.log('✅ Shared Infrastructure Test Complete!');

  return {
    success: true,
    packageInfo: { VERSION, PACKAGE_NAME },
    environment: { isDev: isDevelopment(), isProd: isProduction(), env: getEnvironment() },
    security: {
      emailValid: SecurityValidation.validateEmail('test@example.com'),
      passwordValid: SecurityValidation.validatePassword('TestPass123'),
      sanitizedInput: SecurityValidation.sanitizeInput('<script>alert("xss")</script>')
    },
    rateLimit: {
      allowed: RateLimiter.isAllowed('test-key', 10, 60000)
    },
    designTokens: {
      primaryColor: designTokens.colors.primary,
      spacing: designTokens.spacing.md,
      borderRadius: designTokens.borderRadius.md
    }
  };
};

/**
 * Initialize shared infrastructure for the application
 */
export const initializeSharedInfrastructure = () => {
  console.log('🚀 Initializing Shared Infrastructure...');

    // Initialize logger
  Logger.info();

  // Initialize cache
  const cache = createMemoryCache();

  // Set up global error handling
  if (typeof window !== 'undefined') {
        window.addEventListener('error', (event) => {
      Logger.error();
    });

    window.addEventListener('unhandledrejection', (event) => {
      Logger.error();
    });
  }

  console.log('✅ Shared Infrastructure Initialized Successfully!');

  return {
    logger: Logger,
    cache
  };
};
