#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

async function deploymentReadiness() {
  log('🚀 AI-BOS Deployment Readiness Check', 'blue');
  
  const steps = [
    {
      name: 'Install Dependencies',
      command: 'npm install',
      critical: true
    },
    {
      name: 'TypeScript Check',
      command: 'npx tsc --noEmit --skipLibCheck',
      critical: true
    },
    {
      name: 'Build Verification',
      command: 'npm run build',
      critical: true
    },
    {
      name: 'Health Check',
      command: 'node scripts/health-check.mjs',
      critical: false
    }
  ];
  
  let criticalFailures = 0;
  
  for (const step of steps) {
    const success = runCommand(step.command, step.name);
    if (!success && step.critical) {
      criticalFailures++;
    }
  }
  
  if (criticalFailures === 0) {
    log('🎉 Deployment Ready! All critical checks passed.', 'green');
    log('📦 Ready for production deployment', 'green');
    return true;
  } else {
    log(`❌ ${criticalFailures} critical issues found. Fix before deployment.`, 'red');
    return false;
  }
}

deploymentReadiness();