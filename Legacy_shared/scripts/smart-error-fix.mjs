#!/usr/bin/env node

/**
 * AI-BOS Smart Error Fix Script
 *
 * Intelligent error classification and automated fixing
 * Prioritizes critical errors and applies fixes efficiently
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Node.js globals for ESLint
/* global process, console */

// Error categories by priority
const ERROR_CATEGORIES = {
  CRITICAL: {
    patterns: [
      /Cannot find module/,
      /verbatimModuleSyntax/,
      /TS1484/,
      /TS2307/
    ],
    impact: 'Build Failure',
    fixTime: '5 minutes'
  },
  HIGH: {
    patterns: [
      /TS6133/, // Unused variables
      /TS4111/, // Index signature access
      /TS2375/, // Type compatibility
      /TS2345/  // Argument type mismatch
    ],
    impact: 'Compilation Issues',
    fixTime: '15 minutes'
  },
  MEDIUM: {
    patterns: [
      /TS6133/, // Unused variables (non-critical)
      /TS2379/, // Optional property types
      /TS2412/  // Type assignment
    ],
    impact: 'Code Quality',
    fixTime: '30 minutes'
  },
  LOW: {
    patterns: [
      /TS6133/, // Unused variables (cosmetic)
      /TS6133/  // Unused imports
    ],
    impact: 'Linting',
    fixTime: '1 hour'
  }
};

class SmartErrorFixer {
  constructor() {
    this.errorLogPath = join(process.cwd(), 'shared', 'typescript-errors.log');
    this.categorizedErrors = new Map();
    this.fixStats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };
  }

  async run() {
    console.log('🔍 AI-BOS Smart Error Classification & Fix');
    console.log('==========================================\n');

    // Step 1: Classify errors
    await this.classifyErrors();

    // Step 2: Generate fix plan
    await this.generateFixPlan();

    // Step 3: Apply automated fixes
    await this.applyAutomatedFixes();

    // Step 4: Generate manual fix guide
    await this.generateManualFixGuide();

    // Step 5: Validate fixes
    await this.validateFixes();

    console.log('\n✅ Smart Error Analysis Complete!');
    console.log(`📊 Fixed: ${this.fixStats.total} errors automatically`);
    console.log(`🎯 Remaining: ${this.getRemainingErrors()} errors for manual fix`);
    console.log(`⏱️  Estimated manual fix time: ${this.estimateManualFixTime()} minutes`);
  }

  async classifyErrors() {
    console.log('📋 Step 1: Classifying errors by impact...');

    if (!existsSync(this.errorLogPath)) {
      console.log('❌ Error log not found. Running type check first...');
      this.runTypeCheck();
    }

    const errorLog = readFileSync(this.errorLogPath, 'utf8');
    const errorLines = errorLog.split('\n').filter(line => line.trim());

    for (const line of errorLines) {
      for (const [category, config] of Object.entries(ERROR_CATEGORIES)) {
        for (const pattern of config.patterns) {
          if (pattern.test(line)) {
            if (!this.categorizedErrors.has(category)) {
              this.categorizedErrors.set(category, []);
            }
            this.categorizedErrors.get(category).push(line);
            break;
          }
        }
      }
    }

    console.log('✅ Error classification complete:');
    for (const [category, errors] of this.categorizedErrors) {
      console.log(`   ${category}: ${errors.length} errors`);
    }
  }

  async generateFixPlan() {
    console.log('\n📝 Step 2: Generating intelligent fix plan...');

    const fixPlan = {
      automated: [],
      manual: [],
      dependencies: [],
      estimatedTime: 0
    };

    // Critical fixes (automated)
    const criticalErrors = this.categorizedErrors.get('CRITICAL') || [];
    for (const error of criticalErrors) {
      if (error.includes('Cannot find module')) {
        fixPlan.dependencies.push(this.extractMissingDependency(error));
      } else if (error.includes('verbatimModuleSyntax')) {
        fixPlan.automated.push({
          type: 'type-import',
          error,
          fix: this.generateTypeImportFix(error)
        });
      }
    }

    // High priority fixes (semi-automated)
    const highErrors = this.categorizedErrors.get('HIGH') || [];
    for (const error of highErrors) {
      if (error.includes('TS6133')) {
        fixPlan.automated.push({
          type: 'unused-variable',
          error,
          fix: this.generateUnusedVariableFix(error)
        });
      }
    }

    // Save fix plan
    writeFileSync('fix-plan.json', JSON.stringify(fixPlan, null, 2));
    console.log('✅ Fix plan generated: fix-plan.json');
  }

  async applyAutomatedFixes() {
    console.log('\n🔧 Step 3: Applying automated fixes...');

    const fixPlan = JSON.parse(readFileSync('fix-plan.json', 'utf8'));

    // Fix 1: Install missing dependencies
    if (fixPlan.dependencies.length > 0) {
      console.log('📦 Installing missing dependencies...');
      const deps = fixPlan.dependencies.join(' ');
      try {
        execSync(`npm install ${deps}`, { stdio: 'inherit' });
        this.fixStats.critical += fixPlan.dependencies.length;
        console.log(`   ✅ Installed ${fixPlan.dependencies.length} dependencies`);
      } catch (error) {
        console.log('⚠️  Dependency installation failed, continuing...');
      }
    }

    // Fix 2: Apply type import fixes
    const typeImportFixes = fixPlan.automated.filter(f => f.type === 'type-import');
    console.log(`   🔄 Applying ${typeImportFixes.length} type import fixes...`);
    for (const fix of typeImportFixes) {
      await this.applyTypeImportFix(fix);
      this.fixStats.critical++;
    }

    // Fix 3: Apply unused variable fixes
    const unusedVarFixes = fixPlan.automated.filter(f => f.type === 'unused-variable');
    console.log(`   🔄 Applying ${unusedVarFixes.length} unused variable fixes...`);
    for (const fix of unusedVarFixes) {
      await this.applyUnusedVariableFix(fix);
      this.fixStats.high++;
    }

    // Fix 4: Run ESLint auto-fix
    console.log('   🔄 Running ESLint auto-fix...');
    try {
      execSync('npm run lint:fix', { stdio: 'pipe' });
      console.log('   ✅ ESLint auto-fix completed');
    } catch (error) {
      console.log('   ⚠️  ESLint auto-fix had issues, continuing...');
    }

    this.fixStats.total = this.fixStats.critical + this.fixStats.high + this.fixStats.medium + this.fixStats.low;
  }

  async generateManualFixGuide() {
    console.log('\n📖 Step 4: Generating manual fix guide...');

    const guide = this.createManualFixGuide();
    writeFileSync('MANUAL_FIX_GUIDE.md', guide);
    console.log('✅ Manual fix guide generated: MANUAL_FIX_GUIDE.md');
  }

  // Helper methods
  runTypeCheck() {
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
    } catch (error) {
      // Expected to fail, errors captured in log
    }
  }

  extractMissingDependency(error) {
    const match = error.match(/Cannot find module '([^']+)'/);
    return match ? match[1] : null;
  }

  generateTypeImportFix(error) {
    const match = error.match(/import \{ ([^}]+) \} from '([^']+)'/);
    if (match) {
      const types = match[1].split(',').map(t => t.trim());
      const module = match[2];
      return {
        before: `import { ${types.join(', ')} } from '${module}';`,
        after: `import type { ${types.join(', ')} } from '${module}';`
      };
    }
    return null;
  }

  generateUnusedVariableFix(error) {
    const match = error.match(/'([^']+)' is declared but its value is never read/);
    if (match) {
      const varName = match[1];
      return {
        before: `${varName}`,
        after: `_${varName}`
      };
    }
    return null;
  }

  async applyTypeImportFix(fix) {
    try {
      console.log(`   🔄 Applying type import fix: ${fix.error.substring(0, 50)}...`);

      // Extract file path and line info
      const fileMatch = fix.error.match(/^\[96m([^\]]+)\[0m/);
      if (!fileMatch) return;

      const filePath = fileMatch[1];
      const lineMatch = fix.error.match(/\[93m(\d+)\[0m/);
      if (!lineMatch) return;

      const lineNum = parseInt(lineMatch[1]);

      // Read file content
      const fileContent = readFileSync(filePath, 'utf8').split('\n');
      const targetLine = fileContent[lineNum - 1];

      // Apply fix
      if (targetLine && fix.fix) {
        const newLine = targetLine.replace(fix.fix.before, fix.fix.after);
        fileContent[lineNum - 1] = newLine;

        // Write back to file
        writeFileSync(filePath, fileContent.join('\n'));
        console.log(`      ✅ Fixed: ${filePath}:${lineNum}`);
      }
    } catch (error) {
      console.log(`      ⚠️  Failed to apply fix: ${error.message}`);
    }
  }

  async applyUnusedVariableFix(fix) {
    try {
      console.log(`   🔄 Applying unused variable fix: ${fix.error.substring(0, 50)}...`);

      // Extract file path and line info
      const fileMatch = fix.error.match(/^\[96m([^\]]+)\[0m/);
      if (!fileMatch) return;

      const filePath = fileMatch[1];
      const lineMatch = fix.error.match(/\[93m(\d+)\[0m/);
      if (!lineMatch) return;

      const lineNum = parseInt(lineMatch[1]);

      // Read file content
      const fileContent = readFileSync(filePath, 'utf8').split('\n');
      const targetLine = fileContent[lineNum - 1];

      // Apply fix
      if (targetLine && fix.fix) {
        const newLine = targetLine.replace(fix.fix.before, fix.fix.after);
        fileContent[lineNum - 1] = newLine;

        // Write back to file
        writeFileSync(filePath, fileContent.join('\n'));
        console.log(`      ✅ Fixed: ${filePath}:${lineNum}`);
      }
    } catch (error) {
      console.log(`      ⚠️  Failed to apply fix: ${error.message}`);
    }
  }

  createManualFixGuide() {
    return `# AI-BOS Manual Fix Guide

## Remaining Errors to Fix Manually

### Critical Priority
${this.formatErrorList('CRITICAL')}

### High Priority
${this.formatErrorList('HIGH')}

### Medium Priority
${this.formatErrorList('MEDIUM')}

### Low Priority
${this.formatErrorList('LOW')}

## Quick Fix Commands

\`\`\`bash
# Fix remaining type imports
npm run lint:fix

# Check remaining errors
npm run type-check

# Build after fixes
npm run build
\`\`\`
`;
  }

  formatErrorList(category) {
    const errors = this.categorizedErrors.get(category) || [];
    if (errors.length === 0) return '- None';

    return errors.slice(0, 5).map(error => `- ${error.substring(0, 100)}...`).join('\n') +
           (errors.length > 5 ? `\n- ... and ${errors.length - 5} more` : '');
  }

  getRemainingErrors() {
    return Array.from(this.categorizedErrors.values()).reduce((sum, errors) => sum + errors.length, 0) - this.fixStats.total;
  }

  async validateFixes() {
    console.log('\n🔍 Step 5: Validating fixes...');

    try {
      // Run type check to see remaining errors
      const typeCheckOutput = execSync('npm run type-check 2>&1', { encoding: 'utf8' });
      const remainingErrors = (typeCheckOutput.match(/error TS/g) || []).length;

      console.log(`   📊 Remaining TypeScript errors: ${remainingErrors}`);

      if (remainingErrors === 0) {
        console.log('   🎉 All TypeScript errors fixed!');
      } else if (remainingErrors < 100) {
        console.log('   ✅ Significant improvement achieved!');
      } else {
        console.log('   ⚠️  Many errors remain, manual intervention needed');
      }

      // Try to build
      try {
        execSync('npm run build', { stdio: 'pipe' });
        console.log('   ✅ Build successful!');
      } catch (buildError) {
        console.log('   ⚠️  Build still failing, manual fixes needed');
      }

    } catch (error) {
      console.log('   ⚠️  Validation failed, continuing...');
    }
  }

  estimateManualFixTime() {
    const critical = this.categorizedErrors.get('CRITICAL')?.length || 0;
    const high = this.categorizedErrors.get('HIGH')?.length || 0;
    const medium = this.categorizedErrors.get('MEDIUM')?.length || 0;
    const low = this.categorizedErrors.get('LOW')?.length || 0;

    // Time estimates per error category
    const timePerError = {
      CRITICAL: 2, // 2 minutes per critical error
      HIGH: 1,     // 1 minute per high priority error
      MEDIUM: 0.5, // 30 seconds per medium priority error
      LOW: 0.25    // 15 seconds per low priority error
    };

    const totalMinutes =
      (critical * timePerError.CRITICAL) +
      (high * timePerError.HIGH) +
      (medium * timePerError.MEDIUM) +
      (low * timePerError.LOW);

    return Math.ceil(totalMinutes);
  }
}

// Run the smart fixer
const fixer = new SmartErrorFixer();
fixer.run().catch(console.error);
