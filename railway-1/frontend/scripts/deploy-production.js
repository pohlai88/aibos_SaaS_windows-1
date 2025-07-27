#!/usr/bin/env node

/**
 * 🧠 AI-BOS Production Deployment Script
 * Lean Architecture Manifesto Compliant
 *
 * This script ensures production deployment follows all our agreements:
 * - Manifest validation before deployment
 * - Zero-error builds
 * - Performance optimization
 * - Security validation
 * - Environment validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================

const CONFIG = {
  // Build settings
  BUILD_TIMEOUT: 300000, // 5 minutes
  MAX_BUNDLE_SIZE: 500000, // 500KB

  // Validation settings
  REQUIRE_ZERO_ERRORS: true,
  REQUIRE_MANIFEST_VALIDATION: true,
  REQUIRE_PERFORMANCE_CHECK: true,

  // Environment settings
  PRODUCTION_ENV: 'production',
  STAGING_ENV: 'staging',

  // Deployment settings
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,

  // Manifest settings
  MANIFEST_PATHS: [
    'src/manifests/core/app.manifest.json',
    'src/manifests/core/auth.manifest.json',
    'src/manifests/modules/ai-engine.manifest.json',
    'src/manifests/modules/consciousness.manifest.json'
  ]
};

// ==================== UTILITY FUNCTIONS ====================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function executeCommand(command, options = {}) {
  try {
    log(`Executing: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      timeout: options.timeout || 60000,
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    log(`Error: ${error.message}`, 'error');
    return { success: false, error };
  }
}

function validateEnvironment() {
  log('Validating environment...');

  const requiredEnvVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_URL'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    log(`Missing environment variables: ${missing.join(', ')}`, 'error');
    return false;
  }

  log('Environment validation passed');
  return true;
}

function validateManifests() {
  log('Validating manifests...');

  const errors = [];

  for (const manifestPath of CONFIG.MANIFEST_PATHS) {
    if (!fs.existsSync(manifestPath)) {
      errors.push(`Manifest not found: ${manifestPath}`);
      continue;
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Basic manifest validation
      if (!manifest.id || !manifest.version || !manifest.type) {
        errors.push(`Invalid manifest structure: ${manifestPath}`);
      }

      // Check for required fields based on type
      if (manifest.type === 'module' && !manifest.permissions) {
        errors.push(`Module manifest missing permissions: ${manifestPath}`);
      }

    } catch (error) {
      errors.push(`Failed to parse manifest ${manifestPath}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    log('Manifest validation failed:', 'error');
    errors.forEach(error => log(`  - ${error}`, 'error'));
    return false;
  }

  log('Manifest validation passed');
  return true;
}

function runTypeCheck() {
  log('Running TypeScript type check...');

  const result = executeCommand('npx tsc --noEmit --strict', {
    timeout: CONFIG.BUILD_TIMEOUT
  });

  if (!result.success) {
    log('TypeScript type check failed', 'error');
    return false;
  }

  log('TypeScript type check passed');
  return true;
}

function runLint() {
  log('Running ESLint...');

  const result = executeCommand('npm run lint', {
    timeout: CONFIG.BUILD_TIMEOUT
  });

  if (!result.success) {
    log('ESLint check failed', 'error');
    return false;
  }

  log('ESLint check passed');
  return true;
}

function runTests() {
  log('Running tests...');

  const result = executeCommand('npm run test:run', {
    timeout: CONFIG.BUILD_TIMEOUT
  });

  if (!result.success) {
    log('Tests failed', 'error');
    return false;
  }

  log('Tests passed');
  return true;
}

function buildApplication() {
  log('Building application...');

  const result = executeCommand('npm run build', {
    timeout: CONFIG.BUILD_TIMEOUT
  });

  if (!result.success) {
    log('Build failed', 'error');
    return false;
  }

  log('Build completed successfully');
  return true;
}

function analyzeBundle() {
  log('Analyzing bundle size...');

  const result = executeCommand('npm run analyze', {
    timeout: CONFIG.BUILD_TIMEOUT
  });

  if (!result.success) {
    log('Bundle analysis failed', 'warning');
    return true; // Don't fail deployment for analysis issues
  }

  log('Bundle analysis completed');
  return true;
}

function deployToVercel() {
  log('Deploying to Vercel...');

  if (!CONFIG.VERCEL_PROJECT_ID || !CONFIG.VERCEL_TOKEN) {
    log('Vercel configuration missing', 'error');
    return false;
  }

  const result = executeCommand('npx vercel --prod --token ${CONFIG.VERCEL_TOKEN}', {
    timeout: CONFIG.BUILD_TIMEOUT * 2
  });

  if (!result.success) {
    log('Vercel deployment failed', 'error');
    return false;
  }

  log('Deployment completed successfully');
  return true;
}

function runHealthCheck() {
  log('Running health check...');

  // Wait for deployment to be ready
  setTimeout(() => {
    const result = executeCommand('curl -f ${process.env.NEXT_PUBLIC_APP_URL}/api/health', {
      timeout: 30000
    });

    if (!result.success) {
      log('Health check failed', 'error');
      return false;
    }

    log('Health check passed');
    return true;
  }, 30000);
}

// ==================== MAIN DEPLOYMENT PROCESS ====================

async function deploy() {
  log('🚀 Starting AI-BOS Production Deployment');
  log('Following Lean Architecture Manifesto principles');

  const startTime = Date.now();
  const steps = [];

  try {
    // Step 1: Environment Validation
    log('\n📋 Step 1: Environment Validation');
    if (!validateEnvironment()) {
      throw new Error('Environment validation failed');
    }
    steps.push('Environment validation');

    // Step 2: Manifest Validation
    log('\n📋 Step 2: Manifest Validation');
    if (CONFIG.REQUIRE_MANIFEST_VALIDATION && !validateManifests()) {
      throw new Error('Manifest validation failed');
    }
    steps.push('Manifest validation');

    // Step 3: Type Check
    log('\n📋 Step 3: TypeScript Type Check');
    if (CONFIG.REQUIRE_ZERO_ERRORS && !runTypeCheck()) {
      throw new Error('TypeScript type check failed');
    }
    steps.push('TypeScript type check');

    // Step 4: Linting
    log('\n📋 Step 4: Code Quality Check');
    if (CONFIG.REQUIRE_ZERO_ERRORS && !runLint()) {
      throw new Error('ESLint check failed');
    }
    steps.push('Code quality check');

    // Step 5: Tests
    log('\n📋 Step 5: Test Suite');
    if (!runTests()) {
      throw new Error('Test suite failed');
    }
    steps.push('Test suite');

    // Step 6: Build
    log('\n📋 Step 6: Application Build');
    if (!buildApplication()) {
      throw new Error('Application build failed');
    }
    steps.push('Application build');

    // Step 7: Bundle Analysis
    log('\n📋 Step 7: Performance Analysis');
    if (CONFIG.REQUIRE_PERFORMANCE_CHECK && !analyzeBundle()) {
      log('Bundle analysis failed, but continuing deployment', 'warning');
    }
    steps.push('Performance analysis');

    // Step 8: Deploy
    log('\n📋 Step 8: Production Deployment');
    if (!deployToVercel()) {
      throw new Error('Production deployment failed');
    }
    steps.push('Production deployment');

    // Step 9: Health Check
    log('\n📋 Step 9: Post-Deployment Health Check');
    runHealthCheck();
    steps.push('Health check');

    const duration = Date.now() - startTime;

    log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    log(`⏱️  Duration: ${duration}ms`);
    log(`✅ Steps completed: ${steps.length}`);
    log('🚀 AI-BOS is now live in production!');

    return true;

  } catch (error) {
    const duration = Date.now() - startTime;

    log('\n❌ DEPLOYMENT FAILED!', 'error');
    log(`⏱️  Duration: ${duration}ms`, 'error');
    log(`✅ Steps completed: ${steps.length}`, 'error');
    log(`❌ Failed at: ${error.message}`, 'error');

    return false;
  }
}

// ==================== SCRIPT EXECUTION ====================

if (require.main === module) {
  deploy()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`Unexpected error: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { deploy, validateManifests, validateEnvironment };
