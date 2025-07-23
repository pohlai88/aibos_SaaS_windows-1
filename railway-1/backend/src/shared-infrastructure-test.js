/**
 * Shared Infrastructure Integration Test (Backend)
 *
 * This file tests the integration of the @aibos/shared-infrastructure package
 * to ensure it's working correctly in the backend.
 */

const {
  SecurityValidation,
  RateLimiter,
  designTokens,
  Logger,
  ErrorHandler,
  CacheManager,
  isDevelopment,
  isProduction,
  getEnvironment,
  VERSION,
  PACKAGE_NAME
} = require('aibos-shared-infrastructure');

/**
 * Test the shared infrastructure package
 */
const testSharedInfrastructure = () => {
  console.log('🧪 Testing Shared Infrastructure Package (Backend)...');

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
  const logger = new Logger();
  logger.info('Test log message', { context: 'test' });

  // Test error handling
  console.log('🚨 Error Handling:');
  const errorHandler = new ErrorHandler();
  const testError = new Error('Test error');
  errorHandler.handle(testError);

  // Test caching
  console.log('💾 Caching:');
  const cache = new CacheManager();
  cache.set('test-key', 'test-value', 60000);
  console.log('- Cached value:', cache.get('test-key'));

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
 * Initialize shared infrastructure for the backend application
 */
const initializeSharedInfrastructure = () => {
  console.log('🚀 Initializing Shared Infrastructure (Backend)...');

  // Initialize logger
  const logger = new Logger();
  logger.info('Shared infrastructure initialized', {
    environment: getEnvironment(),
    version: VERSION
  });

  // Initialize error handler
  const errorHandler = new ErrorHandler();

  // Initialize cache
  const cache = new CacheManager();

  // Set up global error handling
  process.on('uncaughtException', (error) => {
    errorHandler.handle(error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    errorHandler.handle(new Error(reason));
  });

  console.log('✅ Shared Infrastructure Initialized Successfully!');

  return {
    logger,
    errorHandler,
    cache
  };
};

module.exports = {
  testSharedInfrastructure,
  initializeSharedInfrastructure
};
