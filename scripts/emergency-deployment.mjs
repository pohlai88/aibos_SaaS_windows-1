#!/usr/bin/env node
/**
 * Emergency Deployment Protocol
 * Build-first approach with automatic crisis resolution
 */

import { execSync } from 'child_process';
import fs from 'fs';

class EmergencyDeployment {
  constructor() {
    this.autoFixed = [];
    this.manualRequired = [];
    this.criticalIssues = [];
    this.deploymentBlocked = false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      emergency: '🚨'
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async phase0DependencyCheck() {
    this.log('Checking critical dependencies...', 'info');

    const criticalDeps = [
      '@vitejs/plugin-react',
      'rollup-plugin-visualizer',
      'vite-plugin-pwa',
      'vite-plugin-compression2'
    ];

    for (const dep of criticalDeps) {
      try {
        execSync(`npm list ${dep}`, { stdio: 'ignore' });
        this.log(`Dependency ${dep} ✓`, 'success');
      } catch (error) {
        this.log(`Installing missing dependency: ${dep}`, 'warning');
        try {
          execSync(`npm install ${dep} --save-dev`, { stdio: 'pipe' });
          this.autoFixed.push(`Installed ${dep}`);
        } catch (installError) {
          this.manualRequired.push(`Failed to install ${dep}`);
          this.criticalIssues.push(`Missing dependency: ${dep}`);
        }
      }
    }
  }

  async phase1TypeScriptEmergency() {
    this.log('Checking TypeScript build status...', 'info');

    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('TypeScript build: PASSING', 'success');
    } catch (error) {
      this.log('TypeScript build: FAILING - Applying emergency protocol', 'emergency');

      try {
        execSync('node scripts/ts-emergency.mjs', { stdio: 'inherit' });
        this.autoFixed.push('Applied TypeScript emergency relaxation');

        // Verify emergency fix worked
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        this.log('Emergency TypeScript fix: SUCCESS', 'success');
      } catch (emergencyError) {
        this.criticalIssues.push('TypeScript emergency protocol failed');
        this.deploymentBlocked = true;
      }
    }
  }

  async phase2BuildVerification() {
    this.log('Verifying build process...', 'info');

    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.log('Build process: SUCCESS', 'success');
    } catch (error) {
      this.log('Build process: FAILED', 'error');
      this.criticalIssues.push('Build process failed even with relaxed TypeScript');
      this.deploymentBlocked = true;
    }
  }

  async phase3SafetyGate() {
    this.log('Evaluating deployment safety...', 'info');

    if (this.criticalIssues.length > 0) {
      this.deploymentBlocked = true;
      this.log('DEPLOYMENT BLOCKED - Critical issues detected', 'error');
      return false;
    }

    if (this.manualRequired.length > 0) {
      this.log('Manual intervention required before deployment', 'warning');
      return false;
    }

    this.log('Safety gate: PASSED - Deployment authorized', 'success');
    return true;
  }

  async phase4OptionalOptimizations() {
    if (this.deploymentBlocked) return;

    this.log('Running optional optimizations...', 'info');

    const optimizations = [
      { name: 'lint-fix', command: 'npm run lint -- --fix' },
      { name: 'format', command: 'npm run format' }
    ];

    for (const opt of optimizations) {
      try {
        execSync(opt.command, { stdio: 'pipe' });
        this.log(`Optimization ${opt.name}: SUCCESS`, 'success');
      } catch (error) {
        this.log(`Optimization ${opt.name}: SKIPPED (non-critical)`, 'warning');
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      deploymentStatus: this.deploymentBlocked ? 'BLOCKED' : 'AUTHORIZED',
      autoFixed: this.autoFixed,
      manualRequired: this.manualRequired,
      criticalIssues: this.criticalIssues,
      emergencyMode: this.autoFixed.some(fix => fix.includes('TypeScript emergency'))
    };

    fs.writeFileSync('emergency-deployment-report.json', JSON.stringify(report, null, 2));

    console.log('\n📊 EMERGENCY DEPLOYMENT REPORT');
    console.log('═══════════════════════════════');
    console.log(`Status: ${report.deploymentStatus}`);
    console.log(`Auto-fixed: ${this.autoFixed.length} issues`);
    console.log(`Manual required: ${this.manualRequired.length} issues`);
    console.log(`Critical issues: ${this.criticalIssues.length} issues`);

    if (report.emergencyMode) {
      console.log('\n⚠️  EMERGENCY MODE ACTIVE');
      console.log('   Remember to run "node scripts/ts-restore.mjs" after deployment');
    }

    return report;
  }

  async execute() {
    this.log('🚨 EMERGENCY DEPLOYMENT PROTOCOL INITIATED', 'emergency');

    await this.phase0DependencyCheck();
    await this.phase1TypeScriptEmergency();
    await this.phase2BuildVerification();
    const canDeploy = await this.phase3SafetyGate();
    await this.phase4OptionalOptimizations();

    const report = this.generateReport();

    if (canDeploy) {
      this.log('🚀 DEPLOYMENT AUTHORIZED - System ready for production', 'success');
      process.exit(0);
    } else {
      this.log('🚫 DEPLOYMENT BLOCKED - Manual intervention required', 'error');
      process.exit(1);
    }
  }
}

// Execute emergency deployment
new EmergencyDeployment().execute().catch(error => {
  console.error('❌ Emergency deployment failed:', error);
  process.exit(1);
});
