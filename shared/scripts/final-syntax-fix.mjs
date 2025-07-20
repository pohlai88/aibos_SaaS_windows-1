#!/usr/bin/env node

/**
 * AI-BOS Final Syntax Fix Script
 * Comprehensive fix for remaining TypeScript syntax errors
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG = {
  REPORT_DIR: './.reports',
  FIX_REPORT: './.reports/final-syntax-fix-report.json'
};

class FinalSyntaxFix {
  constructor() {
    this.fixes = [];
    this.errors = [];
    this.startTime = new Date();
  }

  async run() {
    console.log('🔧 AI-BOS Final Syntax Fix System');
    console.log('='.repeat(60));

    try {
      this.ensureReportsDir();

      console.log('\n--- PHASE 1: Fix JSX Syntax Issues ---');
      await this.fixJSXSyntax();

      console.log('\n--- PHASE 2: Fix Object Literal Syntax ---');
      await this.fixObjectLiteralSyntax();

      console.log('\n--- PHASE 3: Fix Function Signature Issues ---');
      await this.fixFunctionSignatures();

      console.log('\n--- PHASE 4: Fix Import/Export Issues ---');
      await this.fixImportExportIssues();

      console.log('\n--- PHASE 5: Validation ---');
      await this.validateFixes();

      console.log('\n--- PHASE 6: Reporting ---');
      await this.generateReport();

    } catch (error) {
      console.error('❌ Error during final syntax fix:', error.message);
      this.errors.push({
        type: 'EXECUTION_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  ensureReportsDir() {
    if (!existsSync(CONFIG.REPORT_DIR)) {
      mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
    }
  }

  async fixJSXSyntax() {
    const patterns = [
      {
        pattern: /return\s*\(\s*;\s*\n/g,
        replacement: 'return (\n'
      },
      {
        pattern: /\(\s*;\s*</g,
        replacement: '(<'
      },
      {
        pattern: />\s*;\s*\)/g,
        replacement: '>)'
      }
    ];

    const files = [
      'ui-components/src/theme/NestedThemeProvider.tsx',
      'ui-components/src/theme/MultiTenantThemeManager.tsx',
      'ui-components/src/utils/offlineConflictResolver.tsx',
      'ui-components/src/utils/offlineSupport.tsx',
      'ui-components/src/utils/ssrUtils.ts',
      'ui-components/src/utils/animationUtils.ts',
      'ui-components/src/utils/colorUtils.ts',
      'community-templates/src/hooks/useVirtualization.ts'
    ];

    for (const file of files) {
      if (existsSync(file)) {
        try {
          let content = readFileSync(file, 'utf8');
          let modified = false;

          for (const { pattern, replacement } of patterns) {
            if (pattern.test(content)) {
              content = content.replace(pattern, replacement);
              modified = true;
            }
          }

          if (modified) {
            writeFileSync(file, content, 'utf8');
            this.fixes.push({
              type: 'jsx_syntax',
              file,
              description: 'Fixed JSX syntax issues',
              timestamp: new Date().toISOString()
            });
            console.log(`  ✅ Fixed JSX syntax in ${file}`);
          }
        } catch (error) {
          this.errors.push({
            type: 'FILE_ERROR',
            file,
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  async fixObjectLiteralSyntax() {
    const patterns = [
      {
        pattern: /{\s*;\s*\n/g,
        replacement: '{\n'
      },
      {
        pattern: /,\s*;\s*\n/g,
        replacement: ',\n'
      },
      {
        pattern: /:\s*{\s*;\s*\n/g,
        replacement: ': {\n'
      }
    ];

    const files = [
      'ui-components/src/utils/memoryManagement.ts',
      'ui-components/src/utils/offlineConflictResolver.tsx',
      'ui-components/src/utils/ssrUtils.ts'
    ];

    for (const file of files) {
      if (existsSync(file)) {
        try {
          let content = readFileSync(file, 'utf8');
          let modified = false;

          for (const { pattern, replacement } of patterns) {
            if (pattern.test(content)) {
              content = content.replace(pattern, replacement);
              modified = true;
            }
          }

          if (modified) {
            writeFileSync(file, content, 'utf8');
            this.fixes.push({
              type: 'object_literal',
              file,
              description: 'Fixed object literal syntax',
              timestamp: new Date().toISOString()
            });
            console.log(`  ✅ Fixed object literal syntax in ${file}`);
          }
        } catch (error) {
          this.errors.push({
            type: 'FILE_ERROR',
            file,
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  async fixFunctionSignatures() {
    const patterns = [
      {
        pattern: /const\s+(\w+)\s*\(\s*\.\.\.args:\s*unknown\[\]\s*\)\s*=>\s*unknown/g,
        replacement: 'const $1'
      },
      {
        pattern: /:\s*(\w+)\s*\(\s*\.\.\.args:\s*unknown\[\]\s*\)\s*=>\s*unknown/g,
        replacement: ': $1'
      }
    ];

    const files = [
      'ui-components/src/utils/memoryManagement.ts',
      'ui-components/src/utils/ssrUtils.ts'
    ];

    for (const file of files) {
      if (existsSync(file)) {
        try {
          let content = readFileSync(file, 'utf8');
          let modified = false;

          for (const { pattern, replacement } of patterns) {
            if (pattern.test(content)) {
              content = content.replace(pattern, replacement);
              modified = true;
            }
          }

          if (modified) {
            writeFileSync(file, content, 'utf8');
            this.fixes.push({
              type: 'function_signature',
              file,
              description: 'Fixed function signature issues',
              timestamp: new Date().toISOString()
            });
            console.log(`  ✅ Fixed function signatures in ${file}`);
          }
        } catch (error) {
          this.errors.push({
            type: 'FILE_ERROR',
            file,
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  async fixImportExportIssues() {
    const patterns = [
      {
        pattern: /import\s+React,\s*{\s*([^}]+)\s*}\s+from\s+['"]react['"];?\s*import\s+type\s+{\s*([^}]+)\s*}\s+from\s+['"]react['"];/g,
        replacement: 'import React, { $1 } from \'react\';\nimport type { $2 } from \'react\';'
      }
    ];

    const files = [
      'ui-components/src/theme/ThemeProvider.tsx',
      'ui-components/src/theme/NestedThemeProvider.tsx'
    ];

    for (const file of files) {
      if (existsSync(file)) {
        try {
          let content = readFileSync(file, 'utf8');
          let modified = false;

          for (const { pattern, replacement } of patterns) {
            if (pattern.test(content)) {
              content = content.replace(pattern, replacement);
              modified = true;
            }
          }

          if (modified) {
            writeFileSync(file, content, 'utf8');
            this.fixes.push({
              type: 'import_export',
              file,
              description: 'Fixed import/export issues',
              timestamp: new Date().toISOString()
            });
            console.log(`  ✅ Fixed import/export issues in ${file}`);
          }
        } catch (error) {
          this.errors.push({
            type: 'FILE_ERROR',
            file,
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  async validateFixes() {
    try {
      console.log('  🔍 Running TypeScript validation...');
      const result = execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      const errorCount = (result.match(/error TS\d+:/g) || []).length;
      console.log(`  📊 Found ${errorCount} remaining TypeScript errors`);

      this.fixes.push({
        type: 'validation',
        description: `Validation completed with ${errorCount} remaining errors`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
      console.log(`  📊 Found ${errorCount} remaining TypeScript errors`);

      this.fixes.push({
        type: 'validation',
        description: `Validation completed with ${errorCount} remaining errors`,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateReport() {
    const duration = Date.now() - this.startTime.getTime();

    const report = {
      meta: {
        timestamp: this.startTime.toISOString(),
        duration,
        nodeVersion: process.version,
        npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim()
      },
      summary: {
        fixesApplied: this.fixes.length,
        errorsEncountered: this.errors.length,
        success: this.errors.length === 0
      },
      fixes: this.fixes,
      errors: this.errors,
      recommendations: [
        {
          priority: 'HIGH',
          action: 'Review remaining TypeScript errors',
          description: 'Some complex syntax errors may require manual intervention'
        },
        {
          priority: 'MEDIUM',
          action: 'Run full compilation test',
          description: 'Test the entire codebase after syntax fixes'
        },
        {
          priority: 'LOW',
          action: 'Re-enable strict TypeScript checks',
          description: 'Once all errors are fixed, re-enable strict mode'
        }
      ]
    };

    writeFileSync(CONFIG.FIX_REPORT, JSON.stringify(report, null, 2));

    console.log('\n📋 Final Syntax Fix Summary:');
    console.log(`  ✅ Fixes applied: ${this.fixes.length}`);
    console.log(`  ❌ Errors encountered: ${this.errors.length}`);
    console.log(`  📄 Report saved to ${CONFIG.FIX_REPORT}`);

    if (this.errors.length === 0) {
      console.log('\n🎉 All syntax fixes completed successfully!');
    } else {
      console.log('\n⚠️  Some errors remain - manual intervention may be required');
    }
  }
}

// Run the fix system
const fixer = new FinalSyntaxFix();
fixer.run().catch(console.error);
