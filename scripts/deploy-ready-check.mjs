#!/usr/bin/env node
/**
 * Final Deployment Readiness Check
 * Verify AI-BOS is ready for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';

class DeploymentReadinessCheck {
  constructor() {
    this.checks = [];
    this.status = 'CHECKING';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      deploy: '🚀'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async check(name, testFn, critical = true) {
    try {
      this.log(`Checking: ${name}...`, 'info');
      const result = await testFn();
      this.checks.push({ name, status: 'PASS', critical, details: result });
      this.log(`${name}: PASS`, 'success');
      return true;
    } catch (error) {
      this.checks.push({ name, status: 'FAIL', critical, error: error.message });
      this.log(`${name}: ${critical ? 'FAIL (Critical)' : 'FAIL (Warning)'}`, critical ? 'error' : 'warning');
      return false;
    }
  }

  async runAllChecks() {
    this.log('🚀 FINAL DEPLOYMENT READINESS CHECK INITIATED', 'deploy');

    // Critical checks
    await this.check('Build System', async () => {
      execSync('npm run build', { stdio: 'pipe' });
      return 'Production build generates successfully';
    });

    await this.check('TypeScript Compilation', async () => {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return 'TypeScript compiles without errors';
    });

    await this.check('Package Dependencies', async () => {
      execSync('npm list --production', { stdio: 'pipe' });
      return 'All production dependencies resolved';
    });

    await this.check('Security Audit', async () => {
      execSync('npm audit --audit-level=critical', { stdio: 'pipe' });
      return 'No critical security vulnerabilities';
    }, false);

    await this.check('File Structure', async () => {
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'railway-1/frontend/package.json',
        'railway-1/backend/package.json',
        'shared/package.json'
      ];

      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Missing required file: ${file}`);
        }
      }
      return 'All required files present';
    });

    await this.check('Professional Recovery Tools', async () => {
      const tools = [
        'scripts/emergency-deployment.mjs',
        'scripts/professional-recovery.mjs',
        'scripts/overnight-safety-protocol.mjs'
      ];

      for (const tool of tools) {
        if (!fs.existsSync(tool)) {
          throw new Error(`Missing recovery tool: ${tool}`);
        }
      }
      return 'All professional recovery tools available';
    });

    await this.check('Documentation', async () => {
      const docs = [
        'README.md',
        'DAY2_HANDOVER_PACKAGE.md',
        'PRODUCTION_READINESS_FINAL.md'
      ];

      for (const doc of docs) {
        if (!fs.existsSync(doc)) {
          throw new Error(`Missing documentation: ${doc}`);
        }
      }
      return 'Complete documentation package available';
    });

    // Performance checks (non-critical)
    await this.check('Build Performance', async () => {
      const start = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const duration = Date.now() - start;
      return `Build completed in ${(duration/1000).toFixed(2)}s`;
    }, false);
  }

  generateReport() {
    const criticalChecks = this.checks.filter(c => c.critical);
    const criticalPassed = criticalChecks.filter(c => c.status === 'PASS').length;
    const totalChecks = this.checks.length;
    const totalPassed = this.checks.filter(c => c.status === 'PASS').length;

    const deploymentReady = criticalChecks.every(c => c.status === 'PASS');

    const report = {
      timestamp: new Date().toISOString(),
      deploymentReady,
      overallStatus: deploymentReady ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION',
      criticalChecks: `${criticalPassed}/${criticalChecks.length}`,
      totalChecks: `${totalPassed}/${totalChecks}`,
      checks: this.checks,
      recommendation: deploymentReady
        ? 'DEPLOY TO PRODUCTION - All critical systems operational'
        : 'FIX CRITICAL ISSUES - Review failed checks before deployment'
    };

    fs.writeFileSync('deployment-readiness-report.json', JSON.stringify(report, null, 2));

    console.log('\n🚀 DEPLOYMENT READINESS REPORT');
    console.log('══════════════════════════════════');
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Critical Checks: ${report.criticalChecks} PASSED`);
    console.log(`Total Checks: ${report.totalChecks} PASSED`);
    console.log(`Recommendation: ${report.recommendation}`);

    console.log('\n📋 DETAILED RESULTS:');
    this.checks.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : '❌';
      const critical = check.critical ? '[CRITICAL]' : '[WARNING]';
      console.log(`  ${icon} ${check.name} ${check.critical ? '' : critical}`);
      if (check.details) console.log(`     → ${check.details}`);
      if (check.error) console.log(`     → Error: ${check.error}`);
    });

    if (deploymentReady) {
      console.log('\n🎉 READY FOR PRODUCTION DEPLOYMENT!');
      console.log('Execute: npm run build && [deploy-command]');
    } else {
      console.log('\n⚠️ ADDRESS CRITICAL ISSUES BEFORE DEPLOYMENT');
    }

    return report;
  }

  async execute() {
    await this.runAllChecks();
    const report = this.generateReport();

    if (report.deploymentReady) {
      this.log('🎉 DEPLOYMENT READINESS: CONFIRMED!', 'success');
      process.exit(0);
    } else {
      this.log('⚠️ Deployment readiness: Issues detected', 'warning');
      process.exit(1);
    }
  }
}

// Execute deployment readiness check
new DeploymentReadinessCheck().execute().catch(error => {
  console.error('❌ Deployment readiness check failed:', error);
  process.exit(1);
});
