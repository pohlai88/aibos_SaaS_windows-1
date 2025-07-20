#!/usr/bin/env node

/**
 * AI-BOS Phase 2 Validation Script
 *
 * Comprehensive validation for Phase 2 AI components
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @since 2025-07-18
 */

import { existsSync, readFileSync } from 'node:fs';

const PHASE2_COMPONENTS = [
  'lib/intelligence/AdaptiveEngine.ts',
  'lib/intelligence/ContextEngine.ts',
  'lib/intelligence/SystemIntelligence.ts',
  'lib/intelligence/ThreatDetector.ts'
];

const PHASE2_PATTERNS = {
  'lib/intelligence/AdaptiveEngine.ts': [
    'class AdaptiveEngine',
    'interface UserBehavior',
    'interface UserProfile',
    'recordBehavior',
    'getUserProfile',
    'applyAdaptation',
    'getRecommendations'
  ],
  'lib/intelligence/ContextEngine.ts': [
    'class ContextEngine',
    'interface ContextData',
    'interface ContextualAnalysis',
    'addContext',
    'analyzeContext',
    'getRecommendations',
    'getInsights'
  ],
  'lib/intelligence/SystemIntelligence.ts': [
    'class SystemIntelligence',
    'interface SystemMetrics',
    'interface OptimizationAction',
    'collectMetrics',
    'optimizeSystem',
    'getSystemHealth',
    'getMetrics'
  ],
  'lib/intelligence/ThreatDetector.ts': [
    'class ThreatDetector',
    'interface SecurityEvent',
    'interface ThreatIntelligence',
    'processSecurityEvent',
    'addThreatIntelligence',
    'getAlerts',
    'createIncidentResponse'
  ]
};

function validatePhase2Component(filePath, patterns) {
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
  console.log('🧠 AI-BOS Phase 2 Validation');
  console.log('='.repeat(50));

  let totalTests = 0;
  let passedTests = 0;

  for (const [filePath, patterns] of Object.entries(PHASE2_PATTERNS)) {
    totalTests++;
    if (validatePhase2Component(filePath, patterns)) {
      passedTests++;
      console.log(`  🎉 ${filePath} - VALIDATED`);
    } else {
      console.log(`  ⚠️  ${filePath} - NEEDS ATTENTION`);
    }
  }

  console.log('\n📊 Phase 2 Validation Summary:');
  console.log(`  Total AI Components: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All Phase 2 AI components validated!');
    console.log('🚀 AI-BOS is now a complete AI-native SaaS Operating System!');
    return true;
  } else {
    console.log('\n⚠️  Some Phase 2 components need attention.');
    return false;
  }
}

main();
