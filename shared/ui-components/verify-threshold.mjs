#!/usr/bin/env node

/**
 * AI-BOS UI Components - Threshold Verification
 * Ensures lint issues don't exceed acceptable thresholds
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';

// Default thresholds (can be overridden by .env.lint)
const DEFAULT_THRESHOLDS = {
  MAX_ERRORS: 600,
  MAX_WARNINGS: 250
};

async function loadThresholds() {
  try {
    const envContent = await fs.readFile('.env.lint', 'utf8');
    const thresholds = { ...DEFAULT_THRESHOLDS };

    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && thresholds.hasOwnProperty(key.trim())) {
        thresholds[key.trim()] = parseInt(value.trim());
      }
    });

    return thresholds;
  } catch (error) {
    console.log('⚠️ No .env.lint found, using defaults');
    return DEFAULT_THRESHOLDS;
  }
}

function extractProblemCounts(lintOutput) {
  const match = lintOutput.match(/(\d+) problems \((\d+) errors?, (\d+) warnings?\)/);
  if (match) {
    return {
      total: parseInt(match[1]),
      errors: parseInt(match[2]),
      warnings: parseInt(match[3])
    };
  }
  return { total: 0, errors: 0, warnings: 0 };
}

async function main() {
  console.log('🔍 Verifying lint thresholds...\n');

  const thresholds = await loadThresholds();
  console.log(`📊 Current thresholds:`);
  console.log(`   Max Errors: ${thresholds.MAX_ERRORS}`);
  console.log(`   Max Warnings: ${thresholds.MAX_WARNINGS}\n`);

  let lintOutput;
  try {
    // Run lint and capture output
    execSync('npm run lint', { stdio: 'pipe' });
    console.log('✅ No lint issues found!');
    process.exit(0);
  } catch (error) {
    lintOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  }

  const counts = extractProblemCounts(lintOutput);

  console.log(`📈 Current status:`);
  console.log(`   Errors: ${counts.errors}/${thresholds.MAX_ERRORS}`);
  console.log(`   Warnings: ${counts.warnings}/${thresholds.MAX_WARNINGS}`);
  console.log(`   Total: ${counts.total}\n`);

  // Check thresholds
  let passed = true;

  if (counts.errors > thresholds.MAX_ERRORS) {
    console.log(`❌ Error threshold exceeded: ${counts.errors} > ${thresholds.MAX_ERRORS}`);
    passed = false;
  } else {
    console.log(`✅ Error threshold OK: ${counts.errors} <= ${thresholds.MAX_ERRORS}`);
  }

  if (counts.warnings > thresholds.MAX_WARNINGS) {
    console.log(`❌ Warning threshold exceeded: ${counts.warnings} > ${thresholds.MAX_WARNINGS}`);
    passed = false;
  } else {
    console.log(`✅ Warning threshold OK: ${counts.warnings} <= ${thresholds.MAX_WARNINGS}`);
  }

  if (passed) {
    console.log('\n🎯 All thresholds passed! ✅');

    // Calculate progress to green zone
    const greenErrors = 100;
    const greenWarnings = 50;
    const errorProgress = Math.max(0, 100 - (counts.errors / greenErrors) * 100);
    const warningProgress = Math.max(0, 100 - (counts.warnings / greenWarnings) * 100);

    console.log(`\n📊 Progress to green zone:`);
    console.log(`   Errors: ${errorProgress.toFixed(1)}% to target`);
    console.log(`   Warnings: ${warningProgress.toFixed(1)}% to target`);

    process.exit(0);
  } else {
    console.log('\n🚫 Threshold verification FAILED! ❌');
    console.log('\n💡 Recommended actions:');
    console.log('   1. Run: npm run cleanup:track');
    console.log('   2. Fix: npm run cleanup:phase1');
    console.log('   3. Test: npm run lint:threshold');

    process.exit(1);
  }
}

main().catch(console.error);
