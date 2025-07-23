#!/usr/bin/env node

/**
 * AI-BOS UI Components Fix Script
 * Systematically fixes parsing errors in UI components
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG = {
  REPORT_DIR: './.reports',
  FIX_REPORT: './.reports/ui-components-fix-report.json'
};

class UIComponentsFix {
  constructor() {
    this.fixes = [];
    this.errors = [];
    this.startTime = new Date();
  }

  async run() {
    console.log('🔧 AI-BOS UI Components Fix System');
    console.log('='.repeat(60));

    try {
      this.ensureReportsDir();

      console.log('\n--- PHASE 1: Fix Common Syntax Patterns ---');
      await this.fixCommonPatterns();

      console.log('\n--- PHASE 2: Fix Specific Files ---');
      await this.fixSpecificFiles();

      console.log('\n--- PHASE 3: Validation ---');
      await this.validateFixes();

      console.log('\n--- PHASE 4: Reporting ---');
      await this.generateReport();

    } catch (error) {
      console.error('💥 UI Components Fix failed:', error);
      this.logError('SYSTEM_ERROR', error.message);
      process.exit(1);
    }
  }

  ensureReportsDir() {
    if (!existsSync(CONFIG.REPORT_DIR)) {
      execSync(`mkdir -p ${CONFIG.REPORT_DIR}`);
    }
  }

  async fixCommonPatterns() {
    console.log('  🧹 Fixing common syntax patterns...');

    const patterns = [
      // Fix semicolons in object literals
      {
        pattern: /{\s*;\s*\n/g,
        replacement: '{\n'
      },
      // Fix semicolons after object properties
      {
        pattern: /(\w+):\s*([^,}]+);\s*\n/g,
        replacement: '$1: $2,\n'
      },
      // Fix standalone semicolons
      {
        pattern: /^\s*;\s*$/gm,
        replacement: ''
      },
      // Fix function declarations with semicolons
      {
        pattern: /(\w+)\s*\([^)]*\)\s*{\s*;\s*\n/g,
        replacement: '$1() {\n'
      },
      // Fix return statements with semicolons
      {
        pattern: /return\s*\(\s*;\s*\n/g,
        replacement: 'return (\n'
      }
    ];

    const uiComponentFiles = [
      'ui-components/src/utils/offlineConflictResolver.tsx',
      'ui-components/src/utils/offlineSupport.tsx',
      'ui-components/src/utils/ssrUtils.ts',
      'ui-components/src/utils/memoryManagement.ts',
      'ui-components/src/utils/colorUtils.ts',
      'ui-components/src/utils/animationUtils.ts'
    ];

    for (const file of uiComponentFiles) {
      if (existsSync(file)) {
        try {
          let content = readFileSync(file, 'utf8');
          let originalContent = content;

          for (const { pattern, replacement } of patterns) {
            content = content.replace(pattern, replacement);
          }

          if (content !== originalContent) {
            writeFileSync(file, content);
            this.fixes.push({
              type: 'syntax_pattern',
              file,
              description: 'Fixed common syntax patterns',
              timestamp: new Date().toISOString()
            });
            console.log(`    ✅ Fixed ${file}`);
          }
        } catch (error) {
          this.logError('FILE_FIX', `Failed to fix ${file}: ${error.message}`);
        }
      }
    }
  }

  async fixSpecificFiles() {
    console.log('  🔧 Fixing specific problematic files...');

    const specificFixes = [
      {
        file: 'ui-components/src/utils/offlineSupport.tsx',
        fixes: [
          {
            pattern: /^\s*;\s*$/gm,
            replacement: ''
          },
          {
            pattern: /{\s*;\s*\n/g,
            replacement: '{\n'
          },
          {
            pattern: /}\s*=\s*config;/g,
            replacement: '} = config;'
          }
        ]
      },
      {
        file: 'ui-components/src/utils/ssrUtils.ts',
        fixes: [
          {
            pattern: /^\s*;\s*$/gm,
            replacement: ''
          },
          {
            pattern: /\)\s*;\s*$/gm,
            replacement: ');'
          }
        ]
      }
    ];

    for (const { file, fixes } of specificFixes) {
      if (existsSync(file)) {
        try {
          let content = readFileSync(file, 'utf8');
          let originalContent = content;

          for (const { pattern, replacement } of fixes) {
            content = content.replace(pattern, replacement);
          }

          if (content !== originalContent) {
            writeFileSync(file, content);
            this.fixes.push({
              type: 'specific_fix',
              file,
              description: 'Applied specific fixes',
              timestamp: new Date().toISOString()
            });
            console.log(`    ✅ Fixed ${file}`);
          }
        } catch (error) {
          this.logError('SPECIFIC_FIX', `Failed to fix ${file}: ${error.message}`);
        }
      }
    }
  }

  async validateFixes() {
    console.log('  ✅ Validating fixes...');

    try {
      // Test TypeScript compilation for UI components
      console.log('    Running TypeScript check on UI components...');
      execSync('npx tsc --noEmit ui-components/src/utils/*.tsx', { stdio: 'inherit' });

      this.fixes.push({
        type: 'validation',
        description: 'TypeScript compilation successful for UI components',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('    ⚠️  Some TypeScript errors remain - continuing with other fixes');
      this.logError('VALIDATION_FAILED', error.message);
    }
  }

  async generateReport() {
    console.log('  📊 Generating UI components fix report...');

    const report = {
      meta: {
        timestamp: this.startTime.toISOString(),
        duration: new Date() - this.startTime,
        nodeVersion: process.version,
        npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim()
      },
      summary: {
        fixesApplied: this.fixes.length,
        errorsRemaining: this.errors.length,
        success: this.errors.length === 0
      },
      fixes: this.fixes,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };

    writeFileSync(CONFIG.FIX_REPORT, JSON.stringify(report, null, 2));
    console.log(`  📄 Report saved to ${CONFIG.FIX_REPORT}`);

    // Display summary
    console.log('\n📋 UI Components Fix Summary:');
    console.log(`  ✅ Fixes applied: ${this.fixes.length}`);
    console.log(`  ❌ Errors remaining: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n⚠️  Manual fixes still required:');
      this.errors.forEach(error => {
        console.log(`    - ${error.type}: ${error.message}`);
      });
    }
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Review remaining TypeScript errors manually',
        description: 'Some complex syntax errors require manual intervention'
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      action: 'Run full TypeScript compilation',
      description: 'Test the entire codebase after UI component fixes'
    });

    recommendations.push({
      priority: 'LOW',
      action: 'Re-enable strict TypeScript checks',
      description: 'Once all errors are fixed, re-enable strict mode'
    });

    return recommendations;
  }

  logError(type, message) {
    this.errors.push({
      type,
      message: message.substring(0, 200),
      timestamp: new Date().toISOString()
    });
  }
}

// CLI execution
if (process.argv[1] === (process.env.npm_execpath || process.argv[1])) {
  const fixer = new UIComponentsFix();
  fixer.run().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { UIComponentsFix };
