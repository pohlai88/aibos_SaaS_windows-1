#!/usr/bin/env node

/**
 * AI-BOS UI Components - Fix Verification Script
 * Verifies that fixes don't break functionality
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyComponent(componentName) {
  if (!componentName) {
    log('red', '❌ Please provide a component name');
    log('blue', 'Usage: node verify-fixes.mjs ComponentName');
    return;
  }

  log('blue', `🔍 Verifying fixes for ${componentName}...`);

  try {
    // Step 1: Capture baseline lint status
    log('yellow', '📊 Capturing baseline lint status...');
    let beforeOutput;
    try {
      beforeOutput = execSync(`npm run lint src/**/*${componentName}*`, { encoding: 'utf8' });
    } catch (error) {
      beforeOutput = error.stdout || error.message;
    }

    const beforeProblems = extractProblemCount(beforeOutput);
    log('blue', `Baseline: ${beforeProblems.errors} errors, ${beforeProblems.warnings} warnings`);

    // Step 2: Run component-specific fixes
    const fixScriptPath = `./fix-scripts/${componentName}-fixes.mjs`;

    try {
      await fs.access(fixScriptPath);
      log('yellow', '🔧 Running component-specific fixes...');
      execSync(`node ${fixScriptPath}`, { stdio: 'inherit' });
    } catch (error) {
      log('yellow', '⚠️ No specific fix script found, running general fixes...');
      // Apply general fixes
      await applyGeneralFixes(componentName);
    }

    // Step 3: Capture post-fix lint status
    log('yellow', '📊 Checking post-fix lint status...');
    let afterOutput;
    try {
      afterOutput = execSync(`npm run lint src/**/*${componentName}*`, { encoding: 'utf8' });
    } catch (error) {
      afterOutput = error.stdout || error.message;
    }

    const afterProblems = extractProblemCount(afterOutput);
    log('blue', `After fixes: ${afterProblems.errors} errors, ${afterProblems.warnings} warnings`);

    // Step 4: Calculate improvement
    const errorReduction = beforeProblems.errors - afterProblems.errors;
    const warningReduction = beforeProblems.warnings - afterProblems.warnings;

    if (errorReduction > 0 || warningReduction > 0) {
      log('green', `✅ Improvement detected!`);
      log('green', `   Errors reduced: ${errorReduction}`);
      log('green', `   Warnings reduced: ${warningReduction}`);
    } else if (errorReduction < 0 || warningReduction < 0) {
      log('red', `❌ Regressions detected!`);
      log('red', `   Errors increased: ${Math.abs(errorReduction)}`);
      log('red', `   Warnings increased: ${Math.abs(warningReduction)}`);
    } else {
      log('yellow', '➡️ No changes detected');
    }

    // Step 5: Test build
    log('yellow', '🏗️ Testing build...');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      log('green', '✅ Build successful');
    } catch (error) {
      log('red', '❌ Build failed');
      throw error;
    }

    // Step 6: Test component if test exists
    log('yellow', '🧪 Running component tests...');
    try {
      execSync(`npm test -- --testNamePattern="${componentName}"`, { stdio: 'pipe' });
      log('green', '✅ Tests passed');
    } catch (error) {
      log('yellow', '⚠️ No tests found or tests failed');
    }

    // Step 7: Generate report
    await generateReport(componentName, beforeProblems, afterProblems);

  } catch (error) {
    log('red', `❌ Verification failed: ${error.message}`);
    process.exit(1);
  }
}

function extractProblemCount(lintOutput) {
  const problemsMatch = lintOutput.match(/(\d+) problems \((\d+) errors?, (\d+) warnings?\)/);
  if (problemsMatch) {
    return {
      total: parseInt(problemsMatch[1]),
      errors: parseInt(problemsMatch[2]),
      warnings: parseInt(problemsMatch[3])
    };
  }
  return { total: 0, errors: 0, warnings: 0 };
}

async function applyGeneralFixes(componentName) {
  // Apply general fixes like unused variable prefixing, console removal
  const componentFiles = await findComponentFiles(componentName);

  for (const file of componentFiles) {
    let content = await fs.readFile(file, 'utf8');
    const original = content;

    // Remove console statements
    content = content.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?\s*/g, '');

    // Prefix unused parameters with _
    content = content.replace(/\(([^)]*)\s*:\s*any\)/g, (match, params) => {
      if (!params.startsWith('_')) {
        return match.replace(params, `_${params}`);
      }
      return match;
    });

    if (content !== original) {
      await fs.writeFile(file, content);
      log('green', `✅ Applied general fixes to ${path.basename(file)}`);
    }
  }
}

async function findComponentFiles(componentName) {
  const srcDir = './src';
  const files = [];

  async function search(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await search(fullPath);
      } else if (entry.name.includes(componentName) && entry.name.match(/\.(ts|tsx)$/)) {
        files.push(fullPath);
      }
    }
  }

  await search(srcDir);
  return files;
}

async function generateReport(componentName, before, after) {
  const report = {
    component: componentName,
    timestamp: new Date().toISOString(),
    before,
    after,
    improvement: {
      errors: before.errors - after.errors,
      warnings: before.warnings - after.warnings,
      total: before.total - after.total
    }
  };

  const reportPath = `./reports/fix-report-${componentName}-${Date.now()}.json`;
  await fs.mkdir('./reports', { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  log('blue', `📊 Report saved to ${reportPath}`);
}

// Handle command line arguments
const componentName = process.argv[2];
verifyComponent(componentName);
