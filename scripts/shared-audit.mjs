#!/usr/bin/env node
/**
 * Shared Directory Comprehensive Audit
 * Ensures the shared library is mature, error-free, and production-ready
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class SharedDirectoryAudit {
  constructor() {
    this.auditResults = {
      structure: [],
      typescript: [],
      exports: [],
      dependencies: [],
      tests: [],
      documentation: [],
      performance: [],
      security: []
    };
    this.issues = [];
    this.fixes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      audit: '📋',
      fix: '🔧'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async auditFileStructure() {
    this.log('Auditing shared directory structure...', 'audit');

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
      'examples/': 'Optional - Usage examples',
      'README.md': 'Recommended - Documentation'
    };

    for (const [item, description] of Object.entries(expectedStructure)) {
      const exists = fs.existsSync(item);
      const status = exists ? 'PASS' : (description.startsWith('Required') ? 'FAIL' : 'WARN');

      this.auditResults.structure.push({
        item,
        description,
        exists,
        status
      });

      if (!exists && description.startsWith('Required')) {
        this.issues.push(`Missing required: ${item} - ${description}`);
      }
    }
  }

  async auditTypeScript() {
    this.log('Auditing TypeScript configuration and compilation...', 'audit');

    try {
      // Check TypeScript compilation
      this.log('Testing TypeScript compilation...', 'info');
      const output = execSync('npx tsc --noEmit', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.auditResults.typescript.push({
        test: 'TypeScript Compilation',
        status: 'PASS',
        details: 'Compiles without errors'
      });
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      const errorCount = (errorOutput.match(/error TS/g) || []).length;

      this.auditResults.typescript.push({
        test: 'TypeScript Compilation',
        status: 'FAIL',
        errors: errorCount,
        details: errorOutput.split('\n').slice(0, 10).join('\n')
      });

      this.issues.push(`TypeScript compilation: ${errorCount} errors`);
    }

    // Check tsconfig.json
    if (fs.existsSync('tsconfig.json')) {
      try {
        const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        this.auditResults.typescript.push({
          test: 'TSConfig Validation',
          status: 'PASS',
          details: 'Valid JSON configuration'
        });
      } catch (error) {
        this.auditResults.typescript.push({
          test: 'TSConfig Validation',
          status: 'FAIL',
          details: `Invalid JSON: ${error.message}`
        });
        this.issues.push(`Invalid tsconfig.json: ${error.message}`);
      }
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

          // Check for common export issues
          const duplicateExports = this.findDuplicateExports(content);
          const circularImports = this.detectCircularImports(file);
          const invalidPaths = this.findInvalidImportPaths(file, content);

          this.auditResults.exports.push({
            file,
            duplicateExports: duplicateExports.length,
            circularImports: circularImports.length,
            invalidPaths: invalidPaths.length,
            status: (duplicateExports.length + circularImports.length + invalidPaths.length) === 0 ? 'PASS' : 'FAIL'
          });

          if (duplicateExports.length > 0) {
            this.issues.push(`${file}: ${duplicateExports.length} duplicate exports`);
            this.fixes.push(`Fix duplicate exports in ${file}`);
          }

          if (invalidPaths.length > 0) {
            this.issues.push(`${file}: ${invalidPaths.length} invalid import paths`);
            this.fixes.push(`Fix import paths in ${file}`);
          }

        } catch (error) {
          this.auditResults.exports.push({
            file,
            status: 'ERROR',
            error: error.message
          });
          this.issues.push(`Cannot read ${file}: ${error.message}`);
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
    // Simplified circular import detection
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = content.match(/from\s+['"`]([^'"`]+)['"`]/g) || [];

      // Check if any imports reference back to parent directories excessively
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

      // Check if path exists (with common extensions)
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

    if (fs.existsSync('package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        // Check for missing dependencies
        this.log('Checking npm dependencies...', 'info');
        try {
          execSync('npm list --production', { stdio: 'pipe' });
          this.auditResults.dependencies.push({
            test: 'Production Dependencies',
            status: 'PASS',
            details: 'All dependencies resolved'
          });
        } catch (error) {
          this.auditResults.dependencies.push({
            test: 'Production Dependencies',
            status: 'FAIL',
            details: 'Missing dependencies detected'
          });
          this.issues.push('Missing production dependencies');
          this.fixes.push('Run: npm install');
        }

        // Security audit
        try {
          execSync('npm audit --audit-level=critical', { stdio: 'pipe' });
          this.auditResults.dependencies.push({
            test: 'Security Audit',
            status: 'PASS',
            details: 'No critical vulnerabilities'
          });
        } catch (error) {
          this.auditResults.dependencies.push({
            test: 'Security Audit',
            status: 'WARN',
            details: 'Security issues detected'
          });
          this.issues.push('Security vulnerabilities detected');
          this.fixes.push('Run: npm audit fix');
        }

      } catch (error) {
        this.auditResults.dependencies.push({
          test: 'Package.json',
          status: 'FAIL',
          details: `Invalid package.json: ${error.message}`
        });
        this.issues.push(`Invalid package.json: ${error.message}`);
      }
    }
  }

  async auditTestCoverage() {
    this.log('Auditing test coverage...', 'audit');

    const testDirs = ['__tests__', 'test', 'tests'];
    const hasTests = testDirs.some(dir => fs.existsSync(dir));

    if (hasTests) {
      try {
        // Check if test command exists
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasTestScript = packageJson.scripts && packageJson.scripts.test;

        this.auditResults.tests.push({
          test: 'Test Infrastructure',
          status: hasTestScript ? 'PASS' : 'WARN',
          details: hasTestScript ? 'Test scripts configured' : 'No test script found'
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
        details: 'No test directories found'
      });
      this.issues.push('No test infrastructure');
      this.fixes.push('Add test framework and tests');
    }
  }

  async auditDocumentation() {
    this.log('Auditing documentation...', 'audit');

    const docFiles = ['README.md', 'CHANGELOG.md', 'API.md'];
    let documentationScore = 0;

    for (const file of docFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const wordCount = content.split(/\s+/).length;

        this.auditResults.documentation.push({
          file,
          exists: true,
          wordCount,
          status: wordCount > 50 ? 'PASS' : 'WARN'
        });

        if (wordCount > 50) documentationScore++;
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
    }

    if (documentationScore < 1) {
      this.issues.push('Insufficient documentation');
    }
  }

  async generateAuditReport() {
    this.log('Generating comprehensive audit report...', 'audit');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        suggestedFixes: this.fixes.length,
        overallStatus: this.issues.length === 0 ? 'HEALTHY' :
                      this.issues.length < 5 ? 'NEEDS_ATTENTION' : 'CRITICAL'
      },
      results: this.auditResults,
      issues: this.issues,
      suggestedFixes: this.fixes,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync('../shared-audit-report.json', JSON.stringify(report, null, 2));

    // Console output
    console.log('\n📋 SHARED DIRECTORY COMPREHENSIVE AUDIT REPORT');
    console.log('═══════════════════════════════════════════════');
    console.log(`Overall Status: ${report.summary.overallStatus}`);
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`Suggested Fixes: ${report.summary.suggestedFixes}`);

    console.log('\n🔍 AUDIT RESULTS:');
    Object.entries(this.auditResults).forEach(([category, results]) => {
      if (results.length > 0) {
        console.log(`\n  ${category.toUpperCase()}:`);
        results.forEach(result => {
          const icon = result.status === 'PASS' ? '✅' :
                      result.status === 'WARN' ? '⚠️' : '❌';
          console.log(`    ${icon} ${result.test || result.item || result.file}`);
          if (result.details) console.log(`       → ${result.details}`);
          if (result.errors) console.log(`       → ${result.errors} errors`);
        });
      }
    });

    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (this.fixes.length > 0) {
      console.log('\n🔧 SUGGESTED FIXES:');
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.auditResults.typescript.some(r => r.status === 'FAIL')) {
      recommendations.push('Fix TypeScript compilation errors before deployment');
    }

    if (this.auditResults.exports.some(r => r.duplicateExports > 0)) {
      recommendations.push('Resolve duplicate exports to prevent build issues');
    }

    if (this.auditResults.dependencies.some(r => r.status === 'FAIL')) {
      recommendations.push('Update and secure package dependencies');
    }

    if (this.auditResults.tests.some(r => r.status !== 'PASS')) {
      recommendations.push('Implement comprehensive testing framework');
    }

    if (this.issues.length === 0) {
      recommendations.push('Shared library is production-ready! 🎉');
      recommendations.push('Consider adding performance benchmarks');
      recommendations.push('Consider adding automated CI/CD validation');
    }

    return recommendations;
  }

  async execute() {
    this.log('🚀 SHARED DIRECTORY COMPREHENSIVE AUDIT INITIATED', 'audit');

    await this.auditFileStructure();
    await this.auditTypeScript();
    await this.auditExports();
    await this.auditDependencies();
    await this.auditTestCoverage();
    await this.auditDocumentation();

    const report = await this.generateAuditReport();

    if (report.summary.overallStatus === 'HEALTHY') {
      this.log('🎉 SHARED DIRECTORY AUDIT: HEALTHY!', 'success');
      this.log('Your shared library is production-ready!', 'success');
    } else {
      this.log(`⚠️ Shared directory needs attention: ${report.summary.totalIssues} issues`, 'warning');
      this.log('Review the audit report and apply suggested fixes', 'info');
    }

    return report;
  }
}

// Execute comprehensive audit
new SharedDirectoryAudit().execute().catch(error => {
  console.error('❌ Shared directory audit failed:', error);
  process.exit(1);
});
