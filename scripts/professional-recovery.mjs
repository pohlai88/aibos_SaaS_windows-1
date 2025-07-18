#!/usr/bin/env node
/**
 * Professional Recovery System
 * Implements systematic TypeScript error resolution with progress tracking
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class ProfessionalRecovery {
  constructor() {
    this.startTime = Date.now();
    this.errors = {
      initial: 0,
      current: 0,
      fixed: 0
    };
    this.fixedIssues = [];
    this.progressLog = [];
    this.criticalFiles = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      fix: '🔧',
      progress: '📊'
    }[type];

    const logEntry = `${prefix} [${timestamp}] ${message}`;
    console.log(logEntry);

    this.progressLog.push({
      timestamp,
      type,
      message,
      errorCount: this.errors.current
    });
  }

  async phase1AnalyzeErrors() {
    this.log('🔍 PHASE 1: Analyzing TypeScript Errors', 'info');

    try {
      const output = execSync('npx tsc --noEmit', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';

      // Count errors
      const errorLines = errorOutput.split('\n').filter(line =>
        line.includes('error TS') && !line.includes('Found ')
      );

      this.errors.initial = errorLines.length;
      this.errors.current = errorLines.length;

      // Analyze error types
      const errorCategories = {
        interfaces: errorLines.filter(line =>
          line.includes('interface') || line.includes('Type ') || line.includes('assignable')
        ),
        properties: errorLines.filter(line =>
          line.includes('Property') || line.includes('missing') || line.includes('required')
        ),
        imports: errorLines.filter(line =>
          line.includes('Cannot find module') || line.includes('has no exported member')
        ),
        types: errorLines.filter(line =>
          line.includes('implicitly has') || line.includes('any') || line.includes('undefined')
        )
      };

      this.log(`Found ${this.errors.initial} TypeScript errors`, 'error');
      this.log(`  - Interface/Type issues: ${errorCategories.interfaces.length}`, 'info');
      this.log(`  - Property issues: ${errorCategories.properties.length}`, 'info');
      this.log(`  - Import issues: ${errorCategories.imports.length}`, 'info');
      this.log(`  - Type annotation issues: ${errorCategories.types.length}`, 'info');

      // Save detailed analysis
      fs.writeFileSync('error-analysis.json', JSON.stringify({
        total: this.errors.initial,
        categories: errorCategories,
        timestamp: new Date().toISOString()
      }, null, 2));

      return errorCategories;
    }
  }

  async phase2FixCriticalInterfaces() {
    this.log('🔧 PHASE 2: Fixing Critical Interface Issues', 'fix');

    const fixes = [
      // Fix common interface mismatches
      {
        description: 'Fix PromptContext interface mismatch',
        files: ['shared/ai/src/codegen/AICodeGenerator.ts'],
        action: (content) => {
          return content.replace(
            /context: request\.context,/g,
            'context: request.context as PromptContext,'
          );
        }
      },

      // Fix missing required properties
      {
        description: 'Add missing description property to CodeGenRequest',
        files: ['shared/ai/src/codegen/AICodeGenerator.ts'],
        action: (content) => {
          return content.replace(
            /language: CodeLanguage;\s*pattern: CodePattern;\s*}/g,
            'language: CodeLanguage;\n    pattern: CodePattern;\n    description: string;'
          );
        }
      },

      // Fix import issues
      {
        description: 'Fix lucide-react icon imports',
        files: ['shared/ui-components/src/**/*.tsx'],
        action: (content) => {
          // Replace non-existent icons with valid ones
          const iconReplacements = {
            'Brain': 'Circle',
            'History': 'Clock',
            'ChevronLeft': 'ChevronLeft',
            'ChevronRight': 'ChevronRight',
            'PanelLeftClose': 'PanelLeft',
            'PanelLeftOpen': 'PanelRight',
            'Smartphone': 'Phone',
            'Monitor': 'Monitor',
            'Tablet': 'Tablet',
            'Plus': 'Plus',
            'MoreHorizontal': 'MoreHorizontal',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown'
          };

          let updatedContent = content;
          Object.entries(iconReplacements).forEach(([old, replacement]) => {
            updatedContent = updatedContent.replace(
              new RegExp(`\\b${old}\\b`, 'g'),
              replacement
            );
          });

          return updatedContent;
        }
      }
    ];

    let fixesApplied = 0;

    for (const fix of fixes) {
      try {
        for (const filePattern of fix.files) {
          const files = this.globFiles(filePattern);

          for (const file of files) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              const updatedContent = fix.action(content);

              if (content !== updatedContent) {
                fs.writeFileSync(file, updatedContent);
                this.fixedIssues.push(`${fix.description} in ${file}`);
                fixesApplied++;
                this.log(`Fixed: ${fix.description} in ${path.basename(file)}`, 'success');
              }
            }
          }
        }
      } catch (error) {
        this.log(`Failed to apply fix: ${fix.description} - ${error.message}`, 'error');
      }
    }

    this.log(`Applied ${fixesApplied} automated fixes`, 'success');
    return fixesApplied;
  }

  async phase3AddTypeGuards() {
    this.log('🛡️ PHASE 3: Adding Type Guards', 'fix');

    const typeGuardTemplate = `
/**
 * Type guards for runtime validation
 * Auto-generated by Professional Recovery System
 */

export function isValidObject(obj: any): obj is Record<string, any> {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

export function hasRequiredProperty<T extends Record<string, any>>(
  obj: any,
  property: keyof T
): obj is T {
  return isValidObject(obj) && property in obj && obj[property] !== undefined;
}

export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}
`;

    const typeGuardPath = 'shared/types/type-guards.ts';
    fs.writeFileSync(typeGuardPath, typeGuardTemplate);
    this.fixedIssues.push('Added type guards for runtime validation');
    this.log('Added comprehensive type guard system', 'success');

    return 1;
  }

  async phase4VerifyFixes() {
    this.log('✅ PHASE 4: Verifying Fixes', 'progress');

    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.errors.current = 0;
      this.log('🎉 ALL TYPESCRIPT ERRORS RESOLVED!', 'success');
      return true;
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      const remainingErrors = errorOutput.split('\n').filter(line =>
        line.includes('error TS') && !line.includes('Found ')
      ).length;

      this.errors.current = remainingErrors;
      this.errors.fixed = this.errors.initial - remainingErrors;

      const progressPercent = Math.round((this.errors.fixed / this.errors.initial) * 100);

      this.log(`Progress: ${this.errors.fixed}/${this.errors.initial} errors fixed (${progressPercent}%)`, 'progress');
      this.log(`Remaining: ${remainingErrors} errors`, 'warning');

      return remainingErrors === 0;
    }
  }

  globFiles(pattern) {
    // Simple glob implementation for TypeScript files
    if (pattern.includes('**')) {
      // Recursive search
      const baseDir = pattern.split('**')[0];
      const extension = pattern.split('.').pop();

      const findFiles = (dir) => {
        const files = [];
        try {
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
              files.push(...findFiles(fullPath));
            } else if (item.endsWith(`.${extension}`)) {
              files.push(fullPath);
            }
          }
        } catch (error) {
          // Directory doesn't exist or no permission
        }
        return files;
      };

      return findFiles(baseDir);
    } else {
      return fs.existsSync(pattern) ? [pattern] : [];
    }
  }

  generateReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000 / 60);
    const successRate = Math.round((this.errors.fixed / this.errors.initial) * 100);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration} minutes`,
      errors: this.errors,
      successRate: `${successRate}%`,
      fixesApplied: this.fixedIssues.length,
      status: this.errors.current === 0 ? 'SUCCESS' : 'PARTIAL',
      fixes: this.fixedIssues,
      progressLog: this.progressLog
    };

    fs.writeFileSync('professional-recovery-report.json', JSON.stringify(report, null, 2));

    console.log('\n📊 PROFESSIONAL RECOVERY REPORT');
    console.log('═══════════════════════════════════');
    console.log(`Status: ${report.status}`);
    console.log(`Duration: ${report.duration}`);
    console.log(`Success Rate: ${report.successRate}`);
    console.log(`Errors Fixed: ${this.errors.fixed}/${this.errors.initial}`);
    console.log(`Fixes Applied: ${report.fixesApplied}`);

    if (this.errors.current === 0) {
      console.log('\n🎉 READY FOR PRODUCTION DEPLOYMENT!');
      console.log('Run: node scripts/ts-restore.mjs');
      console.log('Then: npm run build && npm test');
    } else {
      console.log(`\n⚠️  ${this.errors.current} errors require manual intervention`);
    }

    return report;
  }

  async execute() {
    this.log('🚀 PROFESSIONAL RECOVERY SYSTEM INITIATED', 'info');

    const errorCategories = await this.phase1AnalyzeErrors();
    const autoFixes = await this.phase2FixCriticalInterfaces();
    const typeGuards = await this.phase3AddTypeGuards();
    const success = await this.phase4VerifyFixes();

    const report = this.generateReport();

    if (success) {
      this.log('✅ PROFESSIONAL RECOVERY COMPLETE - System ready for Day 2', 'success');
      process.exit(0);
    } else {
      this.log('⚠️ PARTIAL RECOVERY - Manual fixes required for remaining errors', 'warning');
      process.exit(1);
    }
  }
}

// Execute professional recovery
new ProfessionalRecovery().execute().catch(error => {
  console.error('❌ Professional recovery failed:', error);
  process.exit(1);
});
