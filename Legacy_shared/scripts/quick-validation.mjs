#!/usr/bin/env node

/**
 * AI-BOS Quick Validation Script
 *
 * Simple validation for Phase 1 components
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { existsSync, readFileSync } from 'node:fs';

const COMPONENTS = [
  'lib/core/ResourceManager.ts',
  'lib/core/StateManager.ts',
  'lib/core/ProcessManager.ts',
  'lib/security/ComplianceManager.ts',
  'lib/core/SystemCore.ts'
];

const REQUIRED_PATTERNS = {
  'lib/core/ResourceManager.ts': [
    'class ResourceManager',
    'interface Resource',
    'getInstance()',
    'allocateResource',
    'releaseResource'
  ],
  'lib/core/StateManager.ts': [
    'class StateManager',
    'interface StateValue',
    'setState',
    'getState',
    'subscribeToState'
  ],
  'lib/core/ProcessManager.ts': [
    'class ProcessManager',
    'interface Process',
    'spawnProcess',
    'startProcess',
    'stopProcess'
  ],
  'lib/security/ComplianceManager.ts': [
    'class ComplianceManager',
    'interface ComplianceRule',
    'checkCompliance',
    'GDPR',
    'SOC2'
  ],
  'lib/core/SystemCore.ts': [
    'class SystemCore',
    'boot()',
    'shutdown()',
    'getSystemStatus',
    'performHealthChecks'
  ]
};

function validateComponent(filePath, patterns) {
  console.log(`\n🔍 Validating ${filePath}...`);

  if (!existsSync(filePath)) {
    console.log(`  ❌ File not found: ${filePath}`);
    return false;
  }

  const content = readFileSync(filePath, 'utf8');
  let allPatternsFound = true;

  for (const pattern of patterns) {
    if (content.includes(pattern)) {
      console.log(`  ✅ Found: ${pattern}`);
    } else {
      console.log(`  ❌ Missing: ${pattern}`);
      allPatternsFound = false;
    }
  }

  return allPatternsFound;
}

function main() {
  console.log('🧪 AI-BOS Quick Validation');
  console.log('='.repeat(50));

  let totalTests = 0;
  let passedTests = 0;

  for (const [filePath, patterns] of Object.entries(REQUIRED_PATTERNS)) {
    totalTests++;
    if (validateComponent(filePath, patterns)) {
      passedTests++;
      console.log(`  🎉 ${filePath} - VALIDATED`);
    } else {
      console.log(`  ⚠️  ${filePath} - NEEDS ATTENTION`);
    }
  }

  console.log('\n📊 Validation Summary:');
  console.log(`  Total Components: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All components validated! Ready for Phase 2.');
    return true;
  } else {
    console.log('\n⚠️  Some components need attention before Phase 2.');
    return false;
  }
}

main();
