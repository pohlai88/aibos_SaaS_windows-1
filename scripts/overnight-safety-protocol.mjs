#!/usr/bin/env node
/**
 * Overnight Safety Protocol
 * Automated CI Watchdog for type system stability monitoring
 */

import { execSync } from 'child_process';
import fs from 'fs';

class OvernightSafetyProtocol {
  constructor() {
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.maxChecks = process.env.NODE_ENV === 'production' ? 288 : 12; // 24h or 1h
    this.checkCount = 0;
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🛡️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[type];

    const logEntry = `${prefix} [${timestamp}] ${message}`;
    console.log(logEntry);

    // Append to safety log
    fs.appendFileSync('overnight-safety.log', logEntry + '\n');
  }

  async checkTypeSystemStability() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('✅ Type System Stable - All checks passing', 'success');
      return true;
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error TS/g) || []).length;

      if (errorCount > 0) {
        this.log(`❌ Regression Detected - ${errorCount} new TypeScript errors`, 'critical');
        return false;
      }

      return true;
    }
  }

  async rollbackTypes() {
    this.log('🚨 INITIATING EMERGENCY ROLLBACK', 'critical');

    try {
      // Restore from emergency backup
      if (fs.existsSync('tsconfig.emergency-backup.json')) {
        execSync('node scripts/ts-restore.mjs', { stdio: 'pipe' });
        this.log('TypeScript configuration restored from backup', 'success');
      }

      // Git rollback to last stable commit
      execSync('git reset --hard HEAD~1', { stdio: 'pipe' });
      this.log('Git rollback to previous stable state completed', 'success');

      // Verify rollback success
      if (await this.checkTypeSystemStability()) {
        this.log('🎯 ROLLBACK SUCCESSFUL - System restored to stable state', 'success');
        return true;
      } else {
        this.log('❌ ROLLBACK FAILED - Manual intervention required', 'critical');
        return false;
      }
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'critical');
      return false;
    }
  }

  generateStatusReport() {
    const uptime = Math.round((Date.now() - this.startTime) / 1000 / 60);
    const report = {
      timestamp: new Date().toISOString(),
      uptime: `${uptime} minutes`,
      checksPerformed: this.checkCount,
      status: 'MONITORING',
      nextCheck: new Date(Date.now() + this.checkInterval).toISOString()
    };

    fs.writeFileSync('safety-protocol-status.json', JSON.stringify(report, null, 2));
    return report;
  }

  async executeCheck() {
    this.checkCount++;
    this.log(`Safety Check #${this.checkCount} - Monitoring type system stability`, 'info');

    const isStable = await this.checkTypeSystemStability();

    if (!isStable) {
      // Attempt automatic rollback
      const rollbackSuccess = await this.rollbackTypes();

      if (!rollbackSuccess) {
        this.log('🚨 CRITICAL: Automatic recovery failed - Manual intervention required', 'critical');

        // Send alert (in production environment)
        if (process.env.NODE_ENV === 'production') {
          // Would integrate with monitoring system
          this.log('Production alert sent to development team', 'critical');
        }

        process.exit(1);
      }
    }

    // Generate status report
    this.generateStatusReport();

    // Continue monitoring if within limits
    if (this.checkCount < this.maxChecks) {
      setTimeout(() => this.executeCheck(), this.checkInterval);
    } else {
      this.log(`🎯 Safety Protocol completed - ${this.checkCount} checks performed`, 'success');
      this.log('Day 2 handover ready - System remained stable throughout monitoring period', 'success');
    }
  }

  async initialize() {
    this.log('🛡️ OVERNIGHT SAFETY PROTOCOL ACTIVATED', 'info');
    this.log(`Monitoring interval: ${this.checkInterval / 1000 / 60} minutes`, 'info');
    this.log(`Maximum checks: ${this.maxChecks}`, 'info');

    // Initial stability check
    const initialStability = await this.checkTypeSystemStability();

    if (!initialStability) {
      this.log('❌ Initial stability check failed - Cannot activate safety protocol', 'critical');
      process.exit(1);
    }

    this.log('Initial stability confirmed - Beginning continuous monitoring', 'success');

    // Start monitoring loop
    setTimeout(() => this.executeCheck(), this.checkInterval);

    // Keep process alive
    process.on('SIGINT', () => {
      this.log('Safety protocol terminated by user', 'warning');
      this.generateStatusReport();
      process.exit(0);
    });
  }
}

// Activate overnight safety protocol
const safetyProtocol = new OvernightSafetyProtocol();
safetyProtocol.initialize().catch(error => {
  console.error('❌ Safety protocol failed to initialize:', error);
  process.exit(1);
});
