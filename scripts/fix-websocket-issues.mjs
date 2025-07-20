#!/usr/bin/env node

/**
 * AI-BOS WebSocket Connection Fix Script
 * This script diagnoses and fixes WebSocket connection issues
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔧 AI-BOS WebSocket Connection Fix Script');
console.log('==========================================');

// Configuration
const CONFIG = {
  backendPort: 3001,
  frontendPort: 3000,
  backendPath: 'railway-1/backend',
  frontendPath: 'railway-1/frontend'
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    debug: '🔍'
  }[type] || 'ℹ️';

  console.log(`${emoji} [${timestamp}] ${message}`);
}

function checkPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function checkFileExists(path) {
  return existsSync(path);
}

// Diagnostic functions
function diagnoseBackend() {
  log('Checking backend configuration...', 'debug');

  const packageJsonPath = join(CONFIG.backendPath, 'package.json');
  if (!checkFileExists(packageJsonPath)) {
    log('Backend package.json not found', 'error');
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const hasWs = packageJson.dependencies?.ws || packageJson.devDependencies?.ws;

  if (!hasWs) {
    log('WebSocket dependency (ws) not found in backend', 'error');
    return false;
  }

  log('Backend dependencies OK', 'success');
  return true;
}

function diagnoseFrontend() {
  log('Checking frontend configuration...', 'debug');

  const nextConfigPath = join(CONFIG.frontendPath, 'next.config.js');
  if (!checkFileExists(nextConfigPath)) {
    log('Frontend next.config.js not found', 'error');
    return false;
  }

  const realtimePath = join(CONFIG.frontendPath, 'src/lib/realtime.ts');
  if (!checkFileExists(realtimePath)) {
    log('Frontend realtime.ts not found', 'error');
    return false;
  }

  log('Frontend configuration OK', 'success');
  return true;
}

function checkPorts() {
  log('Checking port availability...', 'debug');

  const backendPortInUse = checkPort(CONFIG.backendPort);
  const frontendPortInUse = checkPort(CONFIG.frontendPort);

  if (backendPortInUse) {
    log(`Backend port ${CONFIG.backendPort} is in use`, 'warning');
  } else {
    log(`Backend port ${CONFIG.backendPort} is available`, 'success');
  }

  if (frontendPortInUse) {
    log(`Frontend port ${CONFIG.frontendPort} is in use`, 'warning');
  } else {
    log(`Frontend port ${CONFIG.frontendPort} is available`, 'success');
  }

  return { backendPortInUse, frontendPortInUse };
}

// Fix functions
function fixEnvironmentVariables() {
  log('Checking environment variables...', 'debug');

  const envExamplePath = join(CONFIG.backendPath, 'env.example');
  const envPath = join(CONFIG.backendPath, '.env');

  if (checkFileExists(envExamplePath) && !checkFileExists(envPath)) {
    log('Creating .env file from example...', 'info');
    try {
      execSync(`copy "${envExamplePath}" "${envPath}"`, { shell: true });
      log('Environment file created', 'success');
    } catch (error) {
      log('Failed to create environment file', 'error');
    }
  }
}

function generateTestScript() {
  log('Generating WebSocket test script...', 'debug');

  const testScript = `const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection...');

const ws = new WebSocket('ws://localhost:${CONFIG.backendPort}');

ws.on('open', () => {
  console.log('✅ Connected successfully');
  ws.send(JSON.stringify({ type: 'test', message: 'Hello' }));
});

ws.on('message', (data) => {
  console.log('📨 Received:', JSON.parse(data));
  ws.close();
});

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏰ Test timeout');
  process.exit(1);
}, 5000);
`;

  writeFileSync(join(CONFIG.backendPath, 'test-websocket.js'), testScript);
  log('Test script generated', 'success');
}

// Main execution
async function main() {
  try {
    log('Starting WebSocket connection diagnosis...', 'info');

    // Run diagnostics
    const backendOk = diagnoseBackend();
    const frontendOk = diagnoseFrontend();
    const ports = checkPorts();

    // Apply fixes
    fixEnvironmentVariables();
    generateTestScript();

    // Summary
    console.log('\n📋 Diagnosis Summary:');
    console.log('=====================');
    console.log(`Backend Configuration: ${backendOk ? '✅ OK' : '❌ Issues Found'}`);
    console.log(`Frontend Configuration: ${frontendOk ? '✅ OK' : '❌ Issues Found'}`);
    console.log(`Backend Port (${CONFIG.backendPort}): ${ports.backendPortInUse ? '⚠️ In Use' : '✅ Available'}`);
    console.log(`Frontend Port (${CONFIG.frontendPort}): ${ports.frontendPortInUse ? '⚠️ In Use' : '✅ Available'}`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('==================');

    if (!backendOk) {
      console.log('1. Install WebSocket dependencies: cd railway-1/backend && npm install ws');
    }

    if (!frontendOk) {
      console.log('2. Check frontend configuration files');
    }

    if (ports.backendPortInUse) {
      console.log('3. Backend port is in use - check if another instance is running');
    }

    console.log('4. Start backend: cd railway-1/backend && npm start');
    console.log('5. Start frontend: cd railway-1/frontend && npm run dev');
    console.log('6. Test WebSocket: cd railway-1/backend && node test-websocket.js');

    log('Diagnosis complete!', 'success');

  } catch (error) {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the script
main();
