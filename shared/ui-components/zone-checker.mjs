#!/usr/bin/env node

/**
 * Zone Checker - Track progress toward Green Zone
 */

import { execSync } from 'child_process';

const ZONE_THRESHOLDS = {
  RED: { errors: 600, warnings: 250, color: '🔴', name: 'RED' },
  YELLOW: { errors: 400, warnings: 150, color: '🟡', name: 'YELLOW' },
  GREEN: { errors: 100, warnings: 50, color: '🟢', name: 'GREEN' }
};

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

function getCurrentZone(errors, warnings) {
  if (errors <= ZONE_THRESHOLDS.GREEN.errors && warnings <= ZONE_THRESHOLDS.GREEN.warnings) {
    return ZONE_THRESHOLDS.GREEN;
  } else if (errors <= ZONE_THRESHOLDS.YELLOW.errors && warnings <= ZONE_THRESHOLDS.YELLOW.warnings) {
    return ZONE_THRESHOLDS.YELLOW;
  } else {
    return ZONE_THRESHOLDS.RED;
  }
}

function getNextZoneTarget(currentZone) {
  if (currentZone.name === 'RED') return ZONE_THRESHOLDS.YELLOW;
  if (currentZone.name === 'YELLOW') return ZONE_THRESHOLDS.GREEN;
  return null; // Already in GREEN
}

function calculateProgress(current, target, baseline) {
  if (!target) return 100; // Already at final target
  const totalReduction = baseline - target;
  const currentReduction = baseline - current;
  return Math.max(0, Math.min(100, (currentReduction / totalReduction) * 100));
}

async function main() {
  console.log('🎯 Zone Checker - Green Zone Progress Tracker\n');

  // Get current lint status
  let lintOutput;
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    console.log('✅ No lint issues found! You\'re in PERFECT ZONE! 🎉\n');
    return;
  } catch (error) {
    lintOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  }

  const counts = extractProblemCounts(lintOutput);
  const currentZone = getCurrentZone(counts.errors, counts.warnings);
  const nextTarget = getNextZoneTarget(currentZone);

  // Display current status
  console.log(`📊 CURRENT STATUS`);
  console.log(`   Zone: ${currentZone.color} ${currentZone.name} ZONE`);
  console.log(`   Errors: ${counts.errors}`);
  console.log(`   Warnings: ${counts.warnings}`);
  console.log(`   Total Issues: ${counts.total}\n`);

  // Show zone progression
  console.log(`🎯 ZONE PROGRESSION`);
  console.log(`   🔴 RED Zone: ≤${ZONE_THRESHOLDS.RED.errors} errors, ≤${ZONE_THRESHOLDS.RED.warnings} warnings`);
  console.log(`   🟡 YELLOW Zone: ≤${ZONE_THRESHOLDS.YELLOW.errors} errors, ≤${ZONE_THRESHOLDS.YELLOW.warnings} warnings`);
  console.log(`   🟢 GREEN Zone: ≤${ZONE_THRESHOLDS.GREEN.errors} errors, ≤${ZONE_THRESHOLDS.GREEN.warnings} warnings\n`);

  if (nextTarget) {
    // Calculate progress to next zone
    const errorProgress = calculateProgress(counts.errors, nextTarget.errors, 600);
    const warningProgress = calculateProgress(counts.warnings, nextTarget.warnings, 250);
    const overallProgress = (errorProgress + warningProgress) / 2;

    console.log(`📈 PROGRESS TO ${nextTarget.color} ${nextTarget.name} ZONE`);
    console.log(`   Errors: ${counts.errors}/${nextTarget.errors} (${errorProgress.toFixed(1)}% progress)`);
    console.log(`   Warnings: ${counts.warnings}/${nextTarget.warnings} (${warningProgress.toFixed(1)}% progress)`);
    console.log(`   Overall: ${overallProgress.toFixed(1)}% to ${nextTarget.name} zone\n`);

    // Show required reductions
    const errorsToReduce = Math.max(0, counts.errors - nextTarget.errors);
    const warningsToReduce = Math.max(0, counts.warnings - nextTarget.warnings);

    if (errorsToReduce > 0 || warningsToReduce > 0) {
      console.log(`🎯 NEEDED FOR ${nextTarget.name} ZONE`);
      if (errorsToReduce > 0) {
        console.log(`   ❌ Reduce ${errorsToReduce} more errors`);
      }
      if (warningsToReduce > 0) {
        console.log(`   ⚠️ Reduce ${warningsToReduce} more warnings`);
      }
      console.log();
    }

    // Suggest next actions based on current zone
    console.log(`🚀 RECOMMENDED NEXT STEPS`);
    if (currentZone.name === 'RED') {
      console.log(`   1. npm run cleanup:phase1-undefined  # Fix ~80 undefined errors`);
      console.log(`   2. npm run cleanup:phase1-react      # Fix ~40 React hook errors`);
      console.log(`   3. npm run cleanup:phase1-types      # Fix ~30 TypeScript warnings`);
      console.log(`   4. npm run zone:check                # Check progress`);
    } else if (currentZone.name === 'YELLOW') {
      console.log(`   1. npm run cleanup:component-deep    # Deep component fixes`);
      console.log(`   2. npm run cleanup:architecture      # Architecture improvements`);
      console.log(`   3. npm run cleanup:final-polish      # Final optimizations`);
      console.log(`   4. npm run zone:check                # Check progress`);
    }
  } else {
    console.log(`🎉 CONGRATULATIONS! 🎉`);
    console.log(`   You've achieved the GREEN ZONE!`);
    console.log(`   Your codebase has premium quality! ✨\n`);

    console.log(`🏆 GREEN ZONE BENEFITS UNLOCKED:`);
    console.log(`   ✅ Ultra-clean codebase`);
    console.log(`   ✅ Premium developer experience`);
    console.log(`   ✅ Easy maintenance`);
    console.log(`   ✅ Fast CI/CD`);
    console.log(`   ✅ Production confidence`);
  }

  console.log(`\n📊 Quick Status Check: npm run zone:check`);
  console.log(`📈 Detailed Progress: npm run zone:progress`);
}

main().catch(console.error);
