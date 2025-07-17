#!/usr/bin/env node

/**
 * AI-BOS Enterprise npm Audit CI Script
 * Integrates with enhanced .npmrc for security validation
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG = {
  AUDIT_LEVEL: process.env.NPM_AUDIT_LEVEL || 'critical',
  FAIL_ON_VULNERABILITIES: process.env.NPM_AUDIT_FAIL === 'true',
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  OUTPUT_FILE: 'npm-audit-report.json'
};

class NpmAuditCI {
  constructor() {
    this.vulnerabilities = [];
    this.auditData = null;
  }

  async run() {
    console.log('🔒 AI-BOS npm Audit CI - Enterprise Security Validation');
    console.log('=' .repeat(60));

    try {
      // Validate .npmrc configuration
      this.validateNpmrc();

      // Run npm audit with retries
      await this.runAuditWithRetries();

      // Parse and analyze results
      this.parseAuditResults();

      // Generate detailed report
      this.generateReport();

      // Check against enterprise thresholds
      const shouldFail = this.checkEnterpriseThresholds();

      if (shouldFail && CONFIG.FAIL_ON_VULNERABILITIES) {
        console.error('❌ Critical vulnerabilities detected - Build failed');
        process.exit(1);
      }

      console.log('✅ npm Audit CI completed successfully');

    } catch (error) {
      console.error('💥 npm Audit CI failed:', error.message);
      process.exit(1);
    }
  }

  validateNpmrc() {
    console.log('📋 Validating .npmrc configuration...');

    const npmrcPath = join(process.cwd(), '.npmrc');
    if (!existsSync(npmrcPath)) {
      throw new Error('.npmrc file not found');
    }

    const npmrc = readFileSync(npmrcPath, 'utf8');
    const requiredSettings = [
      'audit-level=critical',
      'engine-strict=true',
      'strict-peer-dependencies=true',
      'save-exact=true'
    ];

    const missingSettings = requiredSettings.filter(setting =>
      !npmrc.includes(setting)
    );

    if (missingSettings.length > 0) {
      console.warn('⚠️  Missing recommended .npmrc settings:', missingSettings);
    } else {
      console.log('✅ .npmrc validation passed');
    }
  }

  async runAuditWithRetries() {
    console.log(`🔍 Running npm audit (level: ${CONFIG.AUDIT_LEVEL})...`);

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        const command = `npm audit --audit-level=${CONFIG.AUDIT_LEVEL} --json > ${CONFIG.OUTPUT_FILE}`;
        execSync(command, { stdio: 'pipe' });

        const auditOutput = readFileSync(CONFIG.OUTPUT_FILE, 'utf8');
        this.auditData = JSON.parse(auditOutput);

        console.log('✅ npm audit completed successfully');
        return;

      } catch (error) {
        if (attempt === CONFIG.MAX_RETRIES) {
          throw new Error(`npm audit failed after ${CONFIG.MAX_RETRIES} attempts`);
        }

        console.log(`⚠️  Attempt ${attempt} failed, retrying in ${CONFIG.RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      }
    }
  }

  parseAuditResults() {
    if (!this.auditData) {
      throw new Error('No audit data available');
    }

    const { vulnerabilities } = this.auditData;
    this.vulnerabilities = Object.values(vulnerabilities || {});

    console.log(`📊 Found ${this.vulnerabilities.length} vulnerabilities`);

    // Categorize by severity
    const bySeverity = this.vulnerabilities.reduce((acc, vuln) => {
      const severity = vuln.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});

    Object.entries(bySeverity).forEach(([severity, count]) => {
      const icon = severity === 'critical' ? '🔴' :
                   severity === 'high' ? '🟠' :
                   severity === 'moderate' ? '🟡' : '🔵';
      console.log(`${icon} ${severity.toUpperCase()}: ${count}`);
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalVulnerabilities: this.vulnerabilities.length,
      bySeverity: this.vulnerabilities.reduce((acc, vuln) => {
        const severity = vuln.severity || 'unknown';
        if (!acc[severity]) acc[severity] = [];
        acc[severity].push({
          name: vuln.name,
          version: vuln.version,
          title: vuln.title,
          description: vuln.description?.substring(0, 200) + '...',
          recommendation: vuln.recommendation
        });
        return acc;
      }, {}),
      summary: {
        critical: this.vulnerabilities.filter(v => v.severity === 'critical').length,
        high: this.vulnerabilities.filter(v => v.severity === 'high').length,
        moderate: this.vulnerabilities.filter(v => v.severity === 'moderate').length,
        low: this.vulnerabilities.filter(v => v.severity === 'low').length
      }
    };

    const reportFile = 'npm-audit-report-detailed.json';
    require('fs').writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to ${reportFile}`);
  }

  checkEnterpriseThresholds() {
    const criticalCount = this.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = this.vulnerabilities.filter(v => v.severity === 'high').length;

    // Enterprise thresholds
    const thresholds = {
      critical: 0,  // Zero tolerance for critical
      high: 5,      // Max 5 high severity
      moderate: 20  // Max 20 moderate severity
    };

    const violations = [];

    if (criticalCount > thresholds.critical) {
      violations.push(`Critical: ${criticalCount} > ${thresholds.critical}`);
    }

    if (highCount > thresholds.high) {
      violations.push(`High: ${highCount} > ${thresholds.high}`);
    }

    if (violations.length > 0) {
      console.error('🚨 Enterprise thresholds exceeded:');
      violations.forEach(v => console.error(`   ${v}`));
      return true;
    }

    console.log('✅ All enterprise thresholds met');
    return false;
  }
}

// Run the audit
const auditor = new NpmAuditCI();
auditor.run().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
