#!/usr/bin/env node

/**
 * AI-BOS Enterprise Validation Script
 * Provides measurable proof of enterprise-grade setup
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnterpriseValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      metrics: {},
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, description) {
    try {
      this.log(`Running: ${description}`);
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      this.log(`${description}: PASSED`, 'success');
      this.results.passed++;
      return { success: true, output };
    } catch (error) {
      this.log(`${description}: FAILED - ${error.message}`, 'error');
      this.results.failed++;
      return { success: false, error: error.message };
    }
  }

  async validateEditorConfig() {
    this.log('🔍 Validating EditorConfig Compliance');

    // Check if .editorconfig exists
    if (!fs.existsSync('.editorconfig')) {
      this.log('EditorConfig file missing!', 'error');
      return false;
    }

    // Check for common violations
    const violations = await this.checkForViolations();
    if (violations.length > 0) {
      this.log(`Found ${violations.length} EditorConfig violations`, 'error');
      violations.forEach((v) => this.log(`  - ${v}`, 'error'));
      return false;
    }

    this.log('EditorConfig: 100% compliant', 'success');
    return true;
  }

  async checkForViolations() {
    const violations = [];

    // Check for trailing whitespace
    try {
      const grepResult = execSync(
        'grep -r " $" --include="*.ts" --include="*.js" --include="*.json" --include="*.md" . --exclude-dir=node_modules --exclude-dir=dist',
        { encoding: 'utf8' }
      );
      if (grepResult.trim()) {
        violations.push('Trailing whitespace found');
      }
    } catch (e) {
      // No violations found
    }

    // Check for mixed line endings
    try {
      const mixedEndings = execSync("git grep -l $'\\r'", { encoding: 'utf8' });
      if (mixedEndings.trim()) {
        violations.push('Mixed line endings found');
      }
    } catch (e) {
      // No violations found
    }

    return violations;
  }

  async validateCodeQuality() {
    this.log('🔧 Validating Code Quality Standards');

    const checks = [
      { command: 'npm run lint', description: 'ESLint Compliance' },
      { command: 'npx tsc --noEmit', description: 'TypeScript Type Check' },
      { command: 'npm run test:ci', description: 'Test Suite' },
      { command: 'npm run build', description: 'Build Process' },
    ];

    for (const check of checks) {
      await this.runCommand(check.command, check.description);
    }
  }

  async validateSecurity() {
    this.log('🔒 Validating Security Standards');

    const securityChecks = [
      { command: 'npm audit --audit-level=moderate', description: 'Security Vulnerabilities' },
      { command: 'npx snyk test', description: 'Snyk Security Scan' },
    ];

    for (const check of securityChecks) {
      try {
        await this.runCommand(check.command, check.description);
      } catch (e) {
        this.log(`Skipping ${check.description} - tool not available`, 'warning');
        this.results.warnings++;
      }
    }
  }

  async validatePerformance() {
    this.log('⚡ Validating Performance Standards');

    // Check bundle size
    try {
      const bundleSize = await this.measureBundleSize();
      this.results.metrics.bundleSize = bundleSize;

      if (bundleSize > 1024 * 1024) {
        // 1MB
        this.log(
          `Bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)}MB (WARNING: Large bundle)`,
          'warning'
        );
        this.results.warnings++;
      } else {
        this.log(`Bundle size: ${(bundleSize / 1024).toFixed(2)}KB`, 'success');
      }
    } catch (e) {
      this.log('Could not measure bundle size', 'warning');
    }

    // Check test performance
    const testStart = Date.now();
    await this.runCommand('npm run test:ci', 'Test Performance');
    const testDuration = Date.now() - testStart;

    this.results.metrics.testDuration = testDuration;

    if (testDuration > 30000) {
      // 30 seconds
      this.log(`Test duration: ${testDuration}ms (WARNING: Slow tests)`, 'warning');
      this.results.warnings++;
    } else {
      this.log(`Test duration: ${testDuration}ms`, 'success');
    }
  }

  async measureBundleSize() {
    // This is a simplified measurement
    // In a real implementation, you'd analyze the actual bundle
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      }

      return totalSize;
    }

    return 0;
  }

  async validateDocumentation() {
    this.log('📚 Validating Documentation Standards');

    const requiredDocs = [
      'README.md',
      'shared/README.md',
      'shared/VITEST_ENTERPRISE_GUIDE.md',
      'shared/VITEST_ASSESSMENT.md',
    ];

    for (const doc of requiredDocs) {
      if (fs.existsSync(doc)) {
        this.log(`✓ ${doc} exists`, 'success');
        this.results.passed++;
      } else {
        this.log(`✗ ${doc} missing`, 'error');
        this.results.failed++;
      }
    }
  }

  async validateGitHooks() {
    this.log('🎣 Validating Git Hooks');

    const hooksPath = '.husky';
    if (fs.existsSync(hooksPath)) {
      const hooks = fs.readdirSync(hooksPath);

      if (hooks.includes('pre-commit')) {
        this.log('✓ Pre-commit hook installed', 'success');
        this.results.passed++;
      } else {
        this.log('✗ Pre-commit hook missing', 'error');
        this.results.failed++;
      }
    } else {
      this.log('✗ Husky hooks directory missing', 'error');
      this.results.failed++;
    }
  }

  async generateReport() {
    this.log('📊 Generating Enterprise Validation Report');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed + this.results.failed + this.results.warnings,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: (
          (this.results.passed / (this.results.passed + this.results.failed)) *
          100
        ).toFixed(2),
      },
      metrics: this.results.metrics,
      recommendations: [],
    };

    // Generate recommendations
    if (this.results.failed > 0) {
      report.recommendations.push('Fix failed validations before deployment');
    }

    if (this.results.warnings > 0) {
      report.recommendations.push('Address warnings to improve quality');
    }

    if (report.summary.successRate < 95) {
      report.recommendations.push('Aim for 95%+ success rate for enterprise deployment');
    }

    // Save report
    const reportPath = 'enterprise-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Report saved to: ${reportPath}`, 'success');

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('🏆 ENTERPRISE VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Checks: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Warnings: ${report.summary.warnings} ⚠️`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log('='.repeat(50));

    if (report.summary.successRate >= 95) {
      console.log('🎉 ENTERPRISE-GRADE VALIDATION PASSED!');
      console.log('🚀 Ready for production deployment');
    } else {
      console.log('⚠️  ENTERPRISE VALIDATION NEEDS IMPROVEMENT');
      console.log('📋 Review recommendations above');
    }

    return report;
  }

  async run() {
    console.log('🚀 AI-BOS Enterprise Validation Suite');
    console.log('=====================================');
    console.log('');

    await this.validateEditorConfig();
    await this.validateCodeQuality();
    await this.validateSecurity();
    await this.validatePerformance();
    await this.validateDocumentation();
    await this.validateGitHooks();

    console.log('');
    await this.generateReport();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EnterpriseValidator();
  validator.run().catch(console.error);
}

export default EnterpriseValidator;
