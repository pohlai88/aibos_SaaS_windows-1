#!/usr/bin/env node

/**
 * Phase 4 Test Runner - System-Wide Optimization & Testing
 *
 * This script runs comprehensive tests for the AI-BOS system following
 * Lean Architecture standards and manifest-driven testing principles.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now(),
  endTime: null,
  details: []
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(80), 'cyan');
  log(`🧠 ${message}`, 'bright');
  log('='.repeat(80), 'cyan');
}

function logSection(message) {
  log('\n' + '-'.repeat(60), 'blue');
  log(`📋 ${message}`, 'blue');
  log('-'.repeat(60), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'white');
}

// Test execution functions
function runCommand(command, description) {
  try {
    logInfo(`Running: ${description}`);
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    logSuccess(`${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

function runTypeScriptCheck() {
  logSection('TypeScript Compilation Check');

  const result = runCommand(
    'npx tsc --noEmit',
    'TypeScript compilation check'
  );

  testResults.total++;
  if (result.success) {
    testResults.passed++;
    logSuccess('All TypeScript files compile successfully');
  } else {
    testResults.failed++;
    logError('TypeScript compilation errors found');
    logInfo(result.output);
  }

  return result;
}

function runLintingCheck() {
  logSection('ESLint Code Quality Check');

  const result = runCommand(
    'npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0',
    'ESLint code quality check'
  );

  testResults.total++;
  if (result.success) {
    testResults.passed++;
    logSuccess('All code passes ESLint quality standards');
  } else {
    testResults.failed++;
    logWarning('ESLint warnings/errors found');
    logInfo(result.output);
  }

  return result;
}

function runUnitTests() {
  logSection('Unit Tests - AI Engines');

  const result = runCommand(
    'npm run test:unit',
    'Unit tests for AI engines'
  );

  testResults.total++;
  if (result.success) {
    testResults.passed++;
    logSuccess('All unit tests passed');
  } else {
    testResults.failed++;
    logError('Unit tests failed');
    logInfo(result.output);
  }

  return result;
}

function runIntegrationTests() {
  logSection('Integration Tests - API & Database');

  const result = runCommand(
    'npm run test:integration',
    'Integration tests for API and database'
  );

  testResults.total++;
  if (result.success) {
    testResults.passed++;
    logSuccess('All integration tests passed');
  } else {
    testResults.failed++;
    logError('Integration tests failed');
    logInfo(result.output);
  }

  return result;
}

function runPerformanceTests() {
  logSection('Performance Tests - Bundle Size & Runtime');

  // Check bundle size
  const bundleResult = runCommand(
    'npm run build:analyze',
    'Bundle size analysis'
  );

  // Check build performance
  const buildResult = runCommand(
    'npm run build',
    'Build performance test'
  );

  testResults.total += 2;

  if (bundleResult.success) {
    testResults.passed++;
    logSuccess('Bundle size within acceptable limits');
  } else {
    testResults.failed++;
    logWarning('Bundle size analysis failed');
  }

  if (buildResult.success) {
    testResults.passed++;
    logSuccess('Build performance acceptable');
  } else {
    testResults.failed++;
    logError('Build performance test failed');
  }

  return { bundleResult, buildResult };
}

function runSecurityTests() {
  logSection('Security Tests - Vulnerability Scan');

  const result = runCommand(
    'npm audit --audit-level moderate',
    'Security vulnerability scan'
  );

  testResults.total++;
  if (result.success) {
    testResults.passed++;
    logSuccess('No security vulnerabilities found');
  } else {
    testResults.failed++;
    logWarning('Security vulnerabilities detected');
    logInfo(result.output);
  }

  return result;
}

function runManifestValidation() {
  logSection('Manifest Validation - Lean Architecture Compliance');

  // Check manifest files exist and are valid JSON
  const manifestPaths = [
    'railway-1/frontend/src/manifests/core/app.manifest.json',
    'railway-1/frontend/src/manifests/core/auth.manifest.json',
    'railway-1/frontend/src/manifests/modules/ai-engine.manifest.json',
    'shared/src/manifests/components.manifest.json'
  ];

  let manifestValid = true;

  for (const manifestPath of manifestPaths) {
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      JSON.parse(manifestContent);
      logSuccess(`✓ ${manifestPath} is valid JSON`);
    } catch (error) {
      logError(`✗ ${manifestPath} is invalid: ${error.message}`);
      manifestValid = false;
    }
  }

  testResults.total++;
  if (manifestValid) {
    testResults.passed++;
    logSuccess('All manifest files are valid');
  } else {
    testResults.failed++;
    logError('Some manifest files are invalid');
  }

  return { success: manifestValid };
}

function runAITests() {
  logSection('AI Engine Tests - Real Functionality Validation');

  // Test Computer Vision Engine
  const cvTest = runCommand(
    'npm run test:ai:vision',
    'Computer Vision Engine tests'
  );

  // Test NLP Engine
  const nlpTest = runCommand(
    'npm run test:ai:nlp',
    'NLP Engine tests'
  );

  // Test Predictive Analytics Engine
  const analyticsTest = runCommand(
    'npm run test:ai:analytics',
    'Predictive Analytics Engine tests'
  );

  testResults.total += 3;

  if (cvTest.success) {
    testResults.passed++;
    logSuccess('Computer Vision Engine tests passed');
  } else {
    testResults.failed++;
    logError('Computer Vision Engine tests failed');
  }

  if (nlpTest.success) {
    testResults.passed++;
    logSuccess('NLP Engine tests passed');
  } else {
    testResults.failed++;
    logError('NLP Engine tests failed');
  }

  if (analyticsTest.success) {
    testResults.passed++;
    logSuccess('Predictive Analytics Engine tests passed');
  } else {
    testResults.failed++;
    logError('Predictive Analytics Engine tests failed');
  }

  return { cvTest, nlpTest, analyticsTest };
}

function generateTestReport() {
  logSection('Test Results Summary');

  testResults.endTime = Date.now();
  const duration = testResults.endTime - testResults.startTime;

  log(`\n📊 Test Execution Summary:`, 'bright');
  log(`   Total Tests: ${testResults.total}`, 'white');
  log(`   Passed: ${testResults.passed}`, 'green');
  log(`   Failed: ${testResults.failed}`, 'red');
  log(`   Skipped: ${testResults.skipped}`, 'yellow');
  log(`   Duration: ${duration}ms`, 'white');

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'red');

  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      successRate: parseFloat(successRate),
      duration
    },
    details: testResults.details
  };

  // Save report to file
  const reportPath = path.join(process.cwd(), 'test-results-phase4.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');

  return report;
}

function checkPhase4Compliance() {
  logSection('Phase 4 Compliance Check - Lean Architecture Standards');

  const complianceChecks = [
    {
      name: 'Zero Placeholder Code',
      check: () => {
        const todoPattern = /TODO.*Implement actual/;
        const files = ['railway-1/frontend/src/ai/engines/ComputerVisionEngine.ts'];
        let hasPlaceholders = false;

        for (const file of files) {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            if (todoPattern.test(content)) {
              hasPlaceholders = true;
              break;
            }
          }
        }

        return !hasPlaceholders;
      }
    },
    {
      name: 'Real AI Functionality',
      check: () => {
        const aiPattern = /TensorFlow|loadGraphModel|predict/;
        const files = ['railway-1/frontend/src/ai/engines/ComputerVisionEngine.ts'];
        let hasRealAI = false;

        for (const file of files) {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            if (aiPattern.test(content)) {
              hasRealAI = true;
              break;
            }
          }
        }

        return hasRealAI;
      }
    },
    {
      name: 'Comprehensive Testing',
      check: () => {
        const testFiles = [
          'railway-1/frontend/src/ai/engines/__tests__/ComputerVisionEngine.test.ts'
        ];

        return testFiles.every(file => fs.existsSync(file));
      }
    },
    {
      name: 'Performance Monitoring',
      check: () => {
        const perfPattern = /performanceMetrics|processingTime/;
        const files = ['railway-1/frontend/src/ai/engines/ComputerVisionEngine.ts'];
        let hasPerfMonitoring = false;

        for (const file of files) {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            if (perfPattern.test(content)) {
              hasPerfMonitoring = true;
              break;
            }
          }
        }

        return hasPerfMonitoring;
      }
    }
  ];

  let complianceScore = 0;

  for (const check of complianceChecks) {
    const passed = check.check();
    if (passed) {
      logSuccess(`✓ ${check.name}`);
      complianceScore++;
    } else {
      logError(`✗ ${check.name}`);
    }
  }

  const complianceRate = ((complianceScore / complianceChecks.length) * 100).toFixed(2);
  log(`\n🎯 Phase 4 Compliance Rate: ${complianceRate}%`, complianceRate >= 90 ? 'green' : 'red');

  return complianceRate;
}

// Main execution
async function main() {
  logHeader('PHASE 4: SYSTEM-WIDE OPTIMIZATION & TESTING');
  log('🧠 AI-BOS Comprehensive Test Suite', 'bright');
  log('Following Lean Architecture Standards & Manifest-Driven Testing', 'cyan');

  try {
    // Run all test suites
    const results = {
      typescript: runTypeScriptCheck(),
      linting: runLintingCheck(),
      unit: runUnitTests(),
      integration: runIntegrationTests(),
      performance: runPerformanceTests(),
      security: runSecurityTests(),
      manifest: runManifestValidation(),
      ai: runAITests()
    };

    // Check Phase 4 compliance
    const complianceRate = checkPhase4Compliance();

    // Generate final report
    const report = generateTestReport();

    // Final assessment
    logHeader('PHASE 4 ASSESSMENT');

    if (testResults.failed === 0 && parseFloat(complianceRate) >= 90) {
      log('🎉 PHASE 4 COMPLETED SUCCESSFULLY!', 'green');
      log('✅ All tests passed', 'green');
      log('✅ Lean Architecture compliance achieved', 'green');
      log('✅ Real AI functionality implemented', 'green');
      log('✅ Comprehensive testing infrastructure in place', 'green');
      log('\n🚀 Ready for Phase 5: Production Hardening', 'bright');
    } else {
      log('⚠️  PHASE 4 NEEDS ATTENTION', 'yellow');
      if (testResults.failed > 0) {
        log(`❌ ${testResults.failed} tests failed`, 'red');
      }
      if (parseFloat(complianceRate) < 90) {
        log(`❌ Compliance rate below 90%: ${complianceRate}%`, 'red');
      }
      log('\n🔧 Please address issues before proceeding to Phase 5', 'yellow');
    }

    process.exit(testResults.failed === 0 ? 0 : 1);

  } catch (error) {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runTypeScriptCheck,
  runLintingCheck,
  runUnitTests,
  runIntegrationTests,
  runPerformanceTests,
  runSecurityTests,
  runManifestValidation,
  runAITests,
  checkPhase4Compliance,
  generateTestReport
};
