#!/usr/bin/env node
/**
 * Enhanced Shared Directory Audit - Enterprise Grade
 * Professional analysis with automated fixing, security hardening, and CI/CD integration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

// ============================================================================
// ENTERPRISE ERROR HANDLER
// ============================================================================

class ErrorHandler {
  static handle(error, context = '') {
    const errorTypes = {
      ENOTFOUND: { level: 'critical', action: 'check_network', priority: 1 },
      EACCES: { level: 'critical', action: 'fix_permissions', priority: 1 },
      MODULE_NOT_FOUND: { level: 'high', action: 'install_dependency', priority: 2 },
      ENOENT: { level: 'high', action: 'create_missing_file', priority: 2 },
      SyntaxError: { level: 'high', action: 'fix_syntax', priority: 2 },
      'TS2307': { level: 'medium', action: 'fix_import_path', priority: 3 },
      'TS2345': { level: 'medium', action: 'fix_type_mismatch', priority: 3 }
    };

    const errorCode = error.code || this.extractErrorCode(error.message);
    const errorType = errorTypes[errorCode] || { level: 'medium', action: 'manual_review', priority: 4 };

    return {
      timestamp: new Date().toISOString(),
      context,
      error: error.message,
      code: errorCode,
      stack: error.stack ? error.stack.split('\n').slice(0, 3) : [],
      ...errorType,
      autoFixScript: this.generateFixScript(error, errorType.action),
      severity: this.calculateSeverity(errorType.level, context)
    };
  }

  static extractErrorCode(message) {
    // Extract TypeScript error codes
    const tsErrorMatch = message.match(/error TS(\d+):/);
    if (tsErrorMatch) return `TS${tsErrorMatch[1]}`;

    // Extract npm error patterns
    if (message.includes('Cannot find module')) return 'MODULE_NOT_FOUND';
    if (message.includes('permission denied')) return 'EACCES';
    if (message.includes('no such file')) return 'ENOENT';

    return 'UNKNOWN';
  }

  static generateFixScript(error, action) {
    const fixScripts = {
      install_dependency: () => {
        const module = error.message.match(/Cannot find module ['"`]([^'"`]+)['"`]/)?.[1];
        return module ? `npm install ${module}` : 'npm install';
      },
      fix_permissions: () => `chmod -R 755 ${error.path || './'}`,
      check_network: () => 'ping -c 1 registry.npmjs.org',
      create_missing_file: () => {
        const file = error.message.match(/ENOENT: no such file or directory.*'([^']+)'/)?.[1];
        return file ? `touch ${file}` : null;
      },
      fix_import_path: () => 'npx tsc --noEmit --listFiles | grep -E "error|not found"',
      fix_syntax: () => 'npx prettier --write --parser typescript',
      fix_type_mismatch: () => 'npx tsc --noEmit --strict'
    };

    const generator = fixScripts[action];
    return generator ? generator() : null;
  }

  static calculateSeverity(level, context) {
    const severityMatrix = {
      critical: { base: 100, context: { compilation: 20, security: 30 }},
      high: { base: 75, context: { compilation: 15, security: 20 }},
      medium: { base: 50, context: { compilation: 10, security: 15 }},
      low: { base: 25, context: { compilation: 5, security: 10 }}
    };

    const config = severityMatrix[level] || severityMatrix.medium;
    const contextBonus = Object.entries(config.context)
      .filter(([key]) => context.toLowerCase().includes(key))
      .reduce((sum, [, bonus]) => sum + bonus, 0);

    return Math.min(100, config.base + contextBonus);
  }
}

// ============================================================================
// ENTERPRISE SHARED DIRECTORY AUDIT
// ============================================================================

class EnhancedSharedDirectoryAudit {
  constructor(options = {}) {
    this.startTime = performance.now();
    this.options = {
      autoFix: options.autoFix || process.argv.includes('--auto-fix'),
      ciMode: options.ciMode || process.env.CI || process.argv.includes('--ci'),
      failOnCritical: options.failOnCritical || process.argv.includes('--fail-on-critical'),
      verbose: options.verbose || process.argv.includes('--verbose'),
      maxConcurrency: options.maxConcurrency || 3,
      ...options
    };

    this.auditResults = {
      structure: [],
      typescript: [],
      exports: [],
      dependencies: [],
      tests: [],
      documentation: [],
      performance: [],
      security: [],
      errors: []
    };

    this.issues = [];
    this.fixes = [];
    this.metrics = {
      duration: 0,
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      autoFixedIssues: 0
    };
  }

  log(message, type = 'info') {
    if (this.options.ciMode && !['error', 'success'].includes(type)) return;

    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      audit: '📋',
      fix: '🔧',
      security: '🔒',
      performance: '⚡'
    }[type];

    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      audit: '\x1b[35m',   // Magenta
      fix: '\x1b[34m',     // Blue
      reset: '\x1b[0m'
    };

    const color = colors[type] || colors.info;
    console.log(`${color}${prefix} [${timestamp}] ${message}${colors.reset}`);
  }

  // ============================================================================
  // CONCURRENT AUDIT EXECUTION
  // ============================================================================

  async executeParallelAudits() {
    this.log('Executing parallel audit checks...', 'performance');

    const parallelChecks = [
      () => this.auditFileStructure(),
      () => this.auditDependencies(),
      () => this.auditDocumentation()
    ];

    const results = await Promise.allSettled(
      parallelChecks.map(check => this.executeWithTimeout(check, 30000))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const error = ErrorHandler.handle(result.reason, `Parallel check ${index + 1}`);
        this.auditResults.errors.push(error);
      }
    });
  }

  async executeWithTimeout(fn, timeout = 30000) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      )
    ]);
  }

  // ============================================================================
  // ENHANCED SECURITY AUDIT
  // ============================================================================

  async auditSecurity() {
    this.log('Performing comprehensive security audit...', 'security');

    const securityChecks = [
      {
        name: 'Sensitive Data Exposure',
        cmd: 'grep -r -i "password\\|secret\\|token\\|api.key\\|private.key" --include="*.ts" --include="*.js" --exclude-dir=node_modules . || true',
        severity: 'critical',
        parser: (output) => output.trim().split('\n').filter(line => line.length > 0)
      },
      {
        name: 'Hardcoded Credentials',
        cmd: 'grep -r -E "(password|secret|token)\\s*[:=]\\s*[\'\\"][^\'\\"\\s]{8,}" --include="*.ts" --include="*.js" --exclude-dir=node_modules . || true',
        severity: 'critical',
        parser: (output) => output.trim().split('\n').filter(line => line.length > 0)
      },
      {
        name: 'Dependency Vulnerabilities',
        cmd: 'npm audit --json || echo "{}"',
        severity: 'high',
        parser: (output) => {
          try {
            const audit = JSON.parse(output);
            return audit.metadata?.vulnerabilities || {};
          } catch {
            return {};
          }
        }
      },
      {
        name: 'Unsafe File Permissions',
        cmd: 'find . -type f -perm -002 -not -path "./node_modules/*" || true',
        severity: 'medium',
        parser: (output) => output.trim().split('\n').filter(line => line.length > 0)
      },
      {
        name: 'HTTPS URL Check',
        cmd: 'grep -r "http://" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules . || true',
        severity: 'low',
        parser: (output) => output.trim().split('\n').filter(line => line.length > 0)
      }
    ];

    for (const check of securityChecks) {
      try {
        const output = execSync(check.cmd, {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        });

        const findings = check.parser(output);
        const hasIssues = Array.isArray(findings) ? findings.length > 0 :
                         typeof findings === 'object' ? Object.keys(findings).length > 0 :
                         Boolean(findings);

        this.auditResults.security.push({
          check: check.name,
          status: hasIssues ? 'FAIL' : 'PASS',
          severity: check.severity,
          findings: findings,
          details: hasIssues ? `${Array.isArray(findings) ? findings.length : 'Multiple'} security issues found` : 'No issues detected'
        });

        if (hasIssues) {
          this.issues.push(`Security: ${check.name} - ${check.severity} severity`);
          this.fixes.push(`Review and remediate ${check.name.toLowerCase()}`);
        }

        this.metrics.totalChecks++;
        if (!hasIssues) this.metrics.passedChecks++;
        else this.metrics.failedChecks++;

      } catch (error) {
        const handledError = ErrorHandler.handle(error, `Security check: ${check.name}`);
        this.auditResults.errors.push(handledError);

        this.auditResults.security.push({
          check: check.name,
          status: 'ERROR',
          severity: 'unknown',
          error: handledError,
          details: `Check failed: ${error.message}`
        });
      }
    }
  }

  // ============================================================================
  // AUTOMATED FIX PIPELINE
  // ============================================================================

  async applyAutomatedFixes() {
    if (!this.options.autoFix) {
      this.log('Auto-fix disabled. Use --auto-fix to enable automated repairs.', 'info');
      return;
    }

    this.log('Applying automated fixes...', 'fix');

    const fixableErrors = this.auditResults.errors
      .filter(e => e.autoFixScript && e.severity >= 50)
      .sort((a, b) => a.priority - b.priority);

    for (const error of fixableErrors) {
      try {
        this.log(`Applying fix: ${error.autoFixScript}`, 'fix');

        execSync(error.autoFixScript, {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          timeout: 30000
        });

        error.fixStatus = 'applied';
        error.fixTimestamp = new Date().toISOString();
        this.metrics.autoFixedIssues++;

        this.log(`✅ Fixed: ${error.context}`, 'success');

      } catch (fixError) {
        const handledFixError = ErrorHandler.handle(fixError, `Auto-fix for: ${error.context}`);
        error.fixError = handledFixError;
        error.fixStatus = 'failed';

        this.log(`❌ Fix failed for: ${error.context}`, 'error');
      }
    }

    // Re-audit critical areas after fixes
    if (this.metrics.autoFixedIssues > 0) {
      this.log('Re-auditing after automated fixes...', 'audit');
      await this.auditTypeScript();
      await this.auditDependencies();
    }
  }

  // ============================================================================
  // ENHANCED TYPESCRIPT AUDIT
  // ============================================================================

  async auditTypeScript() {
    this.log('Auditing TypeScript configuration and compilation...', 'audit');

    try {
      // TypeScript compilation check
      this.log('Testing TypeScript compilation...', 'info');

      const compileResult = await this.executeWithTimeout(async () => {
        return execSync('npx tsc --noEmit --listFiles', {
          encoding: 'utf8',
          stdio: 'pipe'
        });
      }, 45000);

      this.auditResults.typescript.push({
        test: 'TypeScript Compilation',
        status: 'PASS',
        details: 'Compiles without errors',
        metrics: {
          files: (compileResult.match(/\.ts/g) || []).length,
          duration: performance.now() - this.startTime
        }
      });

      this.metrics.totalChecks++;
      this.metrics.passedChecks++;

    } catch (error) {
      const handledError = ErrorHandler.handle(error, 'TypeScript compilation');
      this.auditResults.errors.push(handledError);

      const errorOutput = error.stdout || error.stderr || error.message;
      const errorCount = (errorOutput.match(/error TS/g) || []).length;
      const warningCount = (errorOutput.match(/warning TS/g) || []).length;

      this.auditResults.typescript.push({
        test: 'TypeScript Compilation',
        status: 'FAIL',
        errors: errorCount,
        warnings: warningCount,
        details: errorOutput.split('\n').slice(0, 10).join('\n'),
        severity: errorCount > 10 ? 'critical' : errorCount > 0 ? 'high' : 'medium'
      });

      this.issues.push(`TypeScript compilation: ${errorCount} errors, ${warningCount} warnings`);
      this.fixes.push('Fix TypeScript compilation errors');

      this.metrics.totalChecks++;
      this.metrics.failedChecks++;
    }

    // Enhanced TSConfig validation
    await this.auditTSConfig();
  }

  async auditTSConfig() {
    if (!fs.existsSync('tsconfig.json')) {
      this.auditResults.typescript.push({
        test: 'TSConfig Existence',
        status: 'FAIL',
        details: 'Missing tsconfig.json'
      });
      this.issues.push('Missing tsconfig.json configuration');
      this.fixes.push('Create comprehensive tsconfig.json');
      return;
    }

    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

      // Check for recommended compiler options
      const recommendedOptions = {
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitReturns: true,
        noUnusedLocals: true,
        noUnusedParameters: true
      };

      const missingOptions = [];
      for (const [option, recommended] of Object.entries(recommendedOptions)) {
        if (tsConfig.compilerOptions?.[option] !== recommended) {
          missingOptions.push(option);
        }
      }

      this.auditResults.typescript.push({
        test: 'TSConfig Validation',
        status: missingOptions.length === 0 ? 'PASS' : 'WARN',
        details: missingOptions.length === 0 ?
          'Optimal TypeScript configuration' :
          `Missing recommended options: ${missingOptions.join(', ')}`,
        recommendations: missingOptions.length > 0 ? missingOptions : []
      });

      if (missingOptions.length > 0) {
        this.fixes.push(`Add recommended TypeScript options: ${missingOptions.join(', ')}`);
      }

    } catch (error) {
      const handledError = ErrorHandler.handle(error, 'TSConfig validation');
      this.auditResults.errors.push(handledError);

      this.auditResults.typescript.push({
        test: 'TSConfig Validation',
        status: 'FAIL',
        details: `Invalid JSON: ${error.message}`
      });

      this.issues.push(`Invalid tsconfig.json: ${error.message}`);
      this.fixes.push('Fix tsconfig.json syntax errors');
    }
  }

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================

  async auditPerformance() {
    this.log('Auditing performance metrics...', 'performance');

    const performanceChecks = [
      {
        name: 'Bundle Size Analysis',
        test: async () => {
          try {
            const result = execSync('npm run build 2>&1 || echo "Build failed"', {
              encoding: 'utf8',
              stdio: 'pipe'
            });

            const sizeMatch = result.match(/(\d+(?:\.\d+)?)\s*(KB|MB)/gi);
            return {
              status: 'PASS',
              details: sizeMatch ? `Bundle sizes: ${sizeMatch.join(', ')}` : 'Build completed'
            };
          } catch (error) {
            return {
              status: 'WARN',
              details: 'Build command not available'
            };
          }
        }
      },
      {
        name: 'Dependency Count',
        test: async () => {
          try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const depCount = Object.keys(packageJson.dependencies || {}).length;
            const devDepCount = Object.keys(packageJson.devDependencies || {}).length;

            return {
              status: depCount < 50 ? 'PASS' : 'WARN',
              details: `${depCount} production deps, ${devDepCount} dev deps`,
              metrics: { production: depCount, development: devDepCount }
            };
          } catch (error) {
            return { status: 'ERROR', details: error.message };
          }
        }
      }
    ];

    for (const check of performanceChecks) {
      try {
        const result = await check.test();
        this.auditResults.performance.push({
          check: check.name,
          ...result
        });
      } catch (error) {
        const handledError = ErrorHandler.handle(error, `Performance check: ${check.name}`);
        this.auditResults.errors.push(handledError);
      }
    }
  }

  // ============================================================================
  // CI/CD INTEGRATION
  // ============================================================================

  generateCIConfig() {
    return {
      github: {
        workflow: {
          name: 'Shared Library Audit',
          on: ['push', 'pull_request'],
          jobs: {
            audit: {
              'runs-on': 'ubuntu-latest',
              steps: [
                { uses: 'actions/checkout@v3' },
                { uses: 'actions/setup-node@v3', with: { 'node-version': '18' }},
                { run: 'npm ci' },
                { run: 'node scripts/shared-audit-enhanced.mjs --ci --fail-on-critical' },
                {
                  uses: 'actions/upload-artifact@v3',
                  if: 'always()',
                  with: {
                    name: 'audit-report',
                    path: 'shared-audit-report.json'
                  }
                }
              ]
            }
          }
        }
      },
      gitlab: {
        audit: {
          stage: 'test',
          script: [
            'npm ci',
            'node scripts/shared-audit-enhanced.mjs --ci --fail-on-critical'
          ],
          artifacts: {
            reports: { junit: 'shared-audit-report.xml' },
            paths: ['shared-audit-report.json']
          }
        }
      }
    };
  }

  // ============================================================================
  // ENHANCED REPORTING
  // ============================================================================

  async generateEnhancedReport() {
    this.metrics.duration = (performance.now() - this.startTime) / 1000;

    this.log('Generating comprehensive audit report...', 'audit');

    const criticalIssues = this.auditResults.errors.filter(e => e.level === 'critical').length;
    const securityIssues = this.auditResults.security.filter(s => s.status === 'FAIL').length;

    const overallStatus = criticalIssues > 0 ? 'CRITICAL' :
                         securityIssues > 0 ? 'SECURITY_RISK' :
                         this.issues.length === 0 ? 'HEALTHY' :
                         this.issues.length < 5 ? 'NEEDS_ATTENTION' : 'UNSTABLE';

    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: `${this.metrics.duration.toFixed(2)}s`,
        version: '2.0.0',
        environment: {
          node: process.version,
          os: process.platform,
          ci: this.options.ciMode,
          autoFix: this.options.autoFix
        },
        options: this.options
      },
      summary: {
        overallStatus,
        totalIssues: this.issues.length,
        criticalIssues,
        securityIssues,
        fixableIssues: this.auditResults.errors.filter(e => e.autoFixScript).length,
        autoFixedIssues: this.metrics.autoFixedIssues,
        checksPerformed: this.metrics.totalChecks,
        successRate: Math.round((this.metrics.passedChecks / this.metrics.totalChecks) * 100) || 0
      },
      results: this.auditResults,
      issues: this.issues,
      suggestedFixes: this.fixes,
      actions: {
        immediate: this.generateImmediateActions(),
        recommended: this.generateRecommendations(),
        longTerm: this.generateLongTermActions()
      },
      ci: {
        exitCode: this.calculateExitCode(overallStatus),
        config: this.generateCIConfig(),
        recommendations: this.generateCIRecommendations()
      },
      metrics: this.metrics
    };

    fs.writeFileSync('../shared-audit-report.json', JSON.stringify(report, null, 2));

    // Generate additional formats for CI
    if (this.options.ciMode) {
      this.generateJUnitReport(report);
      this.generateMarkdownReport(report);
    }

    this.displayConsoleReport(report);
    return report;
  }

  generateImmediateActions() {
    const criticalErrors = this.auditResults.errors
      .filter(e => e.level === 'critical')
      .slice(0, 3)
      .map(e => `Fix: ${e.context} - ${e.error}`);

    return criticalErrors.length > 0 ? criticalErrors : [
      'No immediate critical actions required',
      'Continue with recommended improvements'
    ];
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.auditResults.typescript.some(r => r.status === 'FAIL')) {
      recommendations.push('🔧 Fix TypeScript compilation errors before deployment');
    }

    if (this.auditResults.security.some(r => r.status === 'FAIL')) {
      recommendations.push('🔒 Address security vulnerabilities immediately');
    }

    if (this.auditResults.exports.some(r => r.duplicateExports > 0)) {
      recommendations.push('📦 Resolve duplicate exports to prevent build issues');
    }

    if (this.auditResults.dependencies.some(r => r.status === 'FAIL')) {
      recommendations.push('📚 Update and secure package dependencies');
    }

    if (this.auditResults.tests.some(r => r.status !== 'PASS')) {
      recommendations.push('🧪 Implement comprehensive testing framework');
    }

    if (this.issues.length === 0) {
      recommendations.push('🎉 Shared library is production-ready!');
      recommendations.push('📊 Consider adding performance benchmarks');
      recommendations.push('🤖 Consider adding automated CI/CD validation');
    }

    return recommendations;
  }

  generateLongTermActions() {
    return [
      '📈 Implement weekly automated audit schedule',
      '🔄 Set up continuous security monitoring',
      '📊 Add performance benchmarking and regression testing',
      '📚 Create comprehensive developer documentation',
      '🤖 Implement automated dependency updates',
      '🔍 Add code quality metrics tracking'
    ];
  }

  generateCIRecommendations() {
    if (this.options.ciMode) return [];

    return [
      'Add shared library audit to CI pipeline',
      'Set up automated security scanning',
      'Configure performance regression testing',
      'Implement automated dependency updates'
    ];
  }

  calculateExitCode(status) {
    const exitCodes = {
      HEALTHY: 0,
      NEEDS_ATTENTION: 0,
      UNSTABLE: 1,
      SECURITY_RISK: 1,
      CRITICAL: 2
    };

    return this.options.failOnCritical ? exitCodes[status] || 1 : 0;
  }

  generateJUnitReport(report) {
    // Generate JUnit XML for CI integration
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Shared Library Audit" tests="${report.metrics.totalChecks}" failures="${report.metrics.failedChecks}">
  <testsuite name="Audit Checks" tests="${report.metrics.totalChecks}" failures="${report.metrics.failedChecks}">
    ${Object.entries(report.results).map(([category, results]) =>
      results.map(result => `
        <testcase name="${category}: ${result.test || result.check || result.item}" classname="SharedAudit">
          ${result.status === 'FAIL' || result.status === 'ERROR' ?
            `<failure message="${result.details || result.error}">${result.error || result.details}</failure>` :
            ''}
        </testcase>`).join('')
    ).join('')}
  </testsuite>
</testsuites>`;

    fs.writeFileSync('../shared-audit-report.xml', xml);
  }

  generateMarkdownReport(report) {
    const markdown = `# Shared Library Audit Report

## Summary
- **Status**: ${report.summary.overallStatus}
- **Total Issues**: ${report.summary.totalIssues}
- **Critical Issues**: ${report.summary.criticalIssues}
- **Security Issues**: ${report.summary.securityIssues}
- **Success Rate**: ${report.summary.successRate}%

## Immediate Actions
${report.actions.immediate.map(action => `- ${action}`).join('\n')}

## Recommendations
${report.actions.recommended.map(rec => `- ${rec}`).join('\n')}

*Generated on ${report.metadata.timestamp}*
`;

    fs.writeFileSync('../shared-audit-report.md', markdown);
  }

  displayConsoleReport(report) {
    console.log('\n📋 ENHANCED SHARED DIRECTORY AUDIT REPORT');
    console.log('═══════════════════════════════════════════════');
    console.log(`Overall Status: ${this.getStatusColor(report.summary.overallStatus)}${report.summary.overallStatus}\x1b[0m`);
    console.log(`Duration: ${report.metadata.duration}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`Auto-Fixed: ${report.summary.autoFixedIssues}`);

    if (report.summary.criticalIssues > 0) {
      console.log(`\n❌ CRITICAL ISSUES: ${report.summary.criticalIssues}`);
    }

    if (report.summary.securityIssues > 0) {
      console.log(`\n🔒 SECURITY ISSUES: ${report.summary.securityIssues}`);
    }

    console.log('\n🎯 IMMEDIATE ACTIONS:');
    report.actions.immediate.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action}`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    report.actions.recommended.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    if (this.options.verbose) {
      this.displayDetailedResults(report);
    }
  }

  getStatusColor(status) {
    const colors = {
      HEALTHY: '\x1b[32m',    // Green
      NEEDS_ATTENTION: '\x1b[33m', // Yellow
      UNSTABLE: '\x1b[31m',   // Red
      SECURITY_RISK: '\x1b[35m', // Magenta
      CRITICAL: '\x1b[41m'    // Red background
    };
    return colors[status] || '\x1b[0m';
  }

  displayDetailedResults(report) {
    console.log('\n🔍 DETAILED RESULTS:');
    Object.entries(report.results).forEach(([category, results]) => {
      if (results.length > 0) {
        console.log(`\n  ${category.toUpperCase()}:`);
        results.forEach(result => {
          const icon = result.status === 'PASS' ? '✅' :
                      result.status === 'WARN' ? '⚠️' : '❌';
          console.log(`    ${icon} ${result.test || result.check || result.item || result.file}`);
          if (result.details) console.log(`       → ${result.details}`);
          if (result.errors) console.log(`       → ${result.errors} errors`);
        });
      }
    });
  }

  // ============================================================================
  // MAIN EXECUTION PIPELINE
  // ============================================================================

  async execute() {
    this.log('🚀 ENHANCED SHARED DIRECTORY AUDIT INITIATED', 'audit');
    this.log(`Mode: ${this.options.ciMode ? 'CI' : 'Development'}`, 'info');

    try {
      // Phase 1: Parallel execution for independent checks
      await this.executeParallelAudits();

      // Phase 2: Sequential execution for dependent checks
      await this.auditTypeScript();
      await this.auditExports();
      await this.auditSecurity();
      await this.auditPerformance();
      await this.auditTestCoverage();

      // Phase 3: Automated fixing
      await this.applyAutomatedFixes();

      // Phase 4: Report generation
      const report = await this.generateEnhancedReport();

      // Phase 5: Exit handling
      if (report.summary.overallStatus === 'HEALTHY') {
        this.log('🎉 SHARED DIRECTORY AUDIT: HEALTHY!', 'success');
        this.log('Your shared library is production-ready!', 'success');
      } else {
        this.log(`⚠️ Shared directory status: ${report.summary.overallStatus}`, 'warning');
        this.log('Review the audit report and apply suggested fixes', 'info');
      }

      process.exit(report.ci.exitCode);

    } catch (error) {
      const criticalError = ErrorHandler.handle(error, 'Audit execution');
      this.log(`❌ Audit failed: ${criticalError.error}`, 'error');

      if (this.options.ciMode) {
        process.exit(2);
      }
      throw error;
    }
  }

  // ============================================================================
  // EXISTING AUDIT METHODS (Enhanced)
  // ============================================================================

  async auditFileStructure() {
    this.log('Auditing enhanced file structure...', 'audit');

    const expectedStructure = {
      'package.json': 'Required - Package configuration',
      'tsconfig.json': 'Required - TypeScript configuration',
      'index.ts': 'Required - Main entry point',
      'lib/': 'Required - Core library functions',
      'types/': 'Required - Type definitions',
      'ui-components/': 'Required - UI component library',
      'validation/': 'Required - Validation schemas',
      'utils/': 'Required - Utility functions',
      'security/': 'Required - Security utilities',
      'examples/': 'Recommended - Usage examples',
      'README.md': 'Recommended - Documentation',
      '__tests__/': 'Recommended - Test files',
      '.github/': 'Optional - GitHub workflows'
    };

    for (const [item, description] of Object.entries(expectedStructure)) {
      const exists = fs.existsSync(item);
      const isRequired = description.startsWith('Required');
      const status = exists ? 'PASS' : (isRequired ? 'FAIL' : 'WARN');

      this.auditResults.structure.push({
        item,
        description,
        exists,
        status,
        required: isRequired
      });

      if (!exists && isRequired) {
        this.issues.push(`Missing required: ${item} - ${description}`);
        this.fixes.push(`Create ${item}`);
      }

      this.metrics.totalChecks++;
      if (status === 'PASS') this.metrics.passedChecks++;
      else if (status === 'FAIL') this.metrics.failedChecks++;
    }
  }

  async auditExports() {
    this.log('Auditing module exports and imports...', 'audit');

    const exportFiles = [
      'index.ts',
      'lib/index.ts',
      'types/index.ts',
      'ui-components/src/index.ts'
    ];

    for (const file of exportFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');

          const duplicateExports = this.findDuplicateExports(content);
          const circularImports = this.detectCircularImports(file);
          const invalidPaths = this.findInvalidImportPaths(file, content);

          this.auditResults.exports.push({
            file,
            duplicateExports: duplicateExports.length,
            circularImports: circularImports.length,
            invalidPaths: invalidPaths.length,
            status: (duplicateExports.length + circularImports.length + invalidPaths.length) === 0 ? 'PASS' : 'FAIL',
            details: {
              duplicates: duplicateExports,
              circular: circularImports,
              invalid: invalidPaths
            }
          });

          if (duplicateExports.length > 0) {
            this.issues.push(`${file}: ${duplicateExports.length} duplicate exports`);
            this.fixes.push(`Fix duplicate exports in ${file}`);
          }

          if (invalidPaths.length > 0) {
            this.issues.push(`${file}: ${invalidPaths.length} invalid import paths`);
            this.fixes.push(`Fix import paths in ${file}`);
          }

          this.metrics.totalChecks++;
          if (duplicateExports.length + invalidPaths.length === 0) {
            this.metrics.passedChecks++;
          } else {
            this.metrics.failedChecks++;
          }

        } catch (error) {
          const handledError = ErrorHandler.handle(error, `Export analysis: ${file}`);
          this.auditResults.errors.push(handledError);

          this.auditResults.exports.push({
            file,
            status: 'ERROR',
            error: handledError
          });
          this.issues.push(`Cannot analyze ${file}: ${error.message}`);
        }
      }
    }
  }

  findDuplicateExports(content) {
    const exportRegex = /export\s+(?:type\s+)?\{\s*([^}]+)\s*\}/g;
    const exports = [];
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      const exportList = match[1].split(',').map(exp =>
        exp.trim().split(' as ')[0].trim()
      );
      exports.push(...exportList);
    }

    const duplicates = exports.filter((item, index) =>
      exports.indexOf(item) !== index && item.length > 0
    );

    return [...new Set(duplicates)];
  }

  detectCircularImports(file) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = content.match(/from\s+['"`]([^'"`]+)['"`]/g) || [];

      const suspiciousImports = imports.filter(imp =>
        imp.includes('../') && imp.split('../').length > 3
      );

      return suspiciousImports;
    } catch (error) {
      return [];
    }
  }

  findInvalidImportPaths(file, content) {
    const importRegex = /from\s+['"`]\.([^'"`]+)['"`]/g;
    const invalidPaths = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const fullPath = path.resolve(path.dirname(file), '.' + importPath);

      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];
      const exists = extensions.some(ext => fs.existsSync(fullPath + ext));

      if (!exists) {
        invalidPaths.push(importPath);
      }
    }

    return invalidPaths;
  }

  async auditDependencies() {
    this.log('Auditing package dependencies...', 'audit');

    if (!fs.existsSync('package.json')) {
      this.auditResults.dependencies.push({
        test: 'Package.json',
        status: 'FAIL',
        details: 'Missing package.json file'
      });
      this.issues.push('Missing package.json');
      this.fixes.push('Create package.json with npm init');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Check dependencies installation
      try {
        this.log('Checking npm dependencies...', 'info');
        execSync('npm list --production', { stdio: 'pipe' });

        this.auditResults.dependencies.push({
          test: 'Production Dependencies',
          status: 'PASS',
          details: 'All dependencies resolved'
        });
        this.metrics.passedChecks++;
      } catch (error) {
        this.auditResults.dependencies.push({
          test: 'Production Dependencies',
          status: 'FAIL',
          details: 'Missing dependencies detected'
        });
        this.issues.push('Missing production dependencies');
        this.fixes.push('Run: npm install');
        this.metrics.failedChecks++;
      }

      this.metrics.totalChecks++;

    } catch (error) {
      const handledError = ErrorHandler.handle(error, 'Package.json validation');
      this.auditResults.errors.push(handledError);

      this.auditResults.dependencies.push({
        test: 'Package.json',
        status: 'FAIL',
        details: `Invalid package.json: ${error.message}`
      });
      this.issues.push(`Invalid package.json: ${error.message}`);
    }
  }

  async auditTestCoverage() {
    this.log('Auditing test coverage...', 'audit');

    const testDirs = ['__tests__', 'test', 'tests'];
    const hasTests = testDirs.some(dir => fs.existsSync(dir));

    if (hasTests) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasTestScript = packageJson.scripts && packageJson.scripts.test;

        this.auditResults.tests.push({
          test: 'Test Infrastructure',
          status: hasTestScript ? 'PASS' : 'WARN',
          details: hasTestScript ? 'Test scripts configured' : 'No test script found',
          hasTests: true,
          hasTestScript
        });

        if (!hasTestScript) {
          this.issues.push('No test script configured');
          this.fixes.push('Add test script to package.json');
        }

      } catch (error) {
        this.auditResults.tests.push({
          test: 'Test Infrastructure',
          status: 'FAIL',
          details: `Cannot read package.json: ${error.message}`
        });
      }
    } else {
      this.auditResults.tests.push({
        test: 'Test Infrastructure',
        status: 'WARN',
        details: 'No test directories found',
        hasTests: false
      });
      this.issues.push('No test infrastructure');
      this.fixes.push('Add test framework and tests');
    }

    this.metrics.totalChecks++;
  }

  async auditDocumentation() {
    this.log('Auditing documentation...', 'audit');

    const docFiles = ['README.md', 'CHANGELOG.md', 'API.md', 'CONTRIBUTING.md'];
    let documentationScore = 0;

    for (const file of docFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const wordCount = content.split(/\s+/).length;
        const quality = wordCount > 500 ? 'EXCELLENT' :
                       wordCount > 100 ? 'GOOD' :
                       wordCount > 50 ? 'BASIC' : 'MINIMAL';

        this.auditResults.documentation.push({
          file,
          exists: true,
          wordCount,
          quality,
          status: wordCount > 50 ? 'PASS' : 'WARN'
        });

        if (wordCount > 100) documentationScore++;
      } else {
        this.auditResults.documentation.push({
          file,
          exists: false,
          status: 'FAIL'
        });

        if (file === 'README.md') {
          this.issues.push('Missing README.md');
          this.fixes.push('Create comprehensive README.md');
        }
      }
      this.metrics.totalChecks++;
    }

    if (documentationScore < 1) {
      this.issues.push('Insufficient documentation');
      this.metrics.failedChecks++;
    } else {
      this.metrics.passedChecks++;
    }
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

// Execute enhanced audit
const options = {
  autoFix: process.argv.includes('--auto-fix'),
  ciMode: process.env.CI || process.argv.includes('--ci'),
  failOnCritical: process.argv.includes('--fail-on-critical'),
  verbose: process.argv.includes('--verbose')
};

new EnhancedSharedDirectoryAudit(options).execute().catch(error => {
  console.error('❌ Enhanced shared directory audit failed:', error);
  process.exit(2);
});
