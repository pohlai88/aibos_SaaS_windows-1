#!/usr/bin/env node

/**
 * AIBOS Monorepo Restructure Helper
 * 
 * This script helps with the manual restructure process by providing
 * status information and guidance for the migration.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDirectory(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function countFiles(dir) {
  if (!checkDirectory(dir)) return 0;
  
  try {
    const files = fs.readdirSync(dir, { recursive: true });
    return files.filter(file => !fs.statSync(path.join(dir, file)).isDirectory()).length;
  } catch {
    return 0;
  }
}

function main() {
  log('🚀 AIBOS Monorepo Restructure Helper', 'bold');
  log('=====================================\n', 'blue');

  // Check current structure
  log('📊 Current Structure Status:', 'bold');
  
  const packages = [
    'accounting-sdk',
    'auth-sdk', 
    'database',
    'ui-components',
    'crm-sdk',
    'hr-sdk',
    'workflow-sdk',
    'procurement-sdk',
    'tax-sdk'
  ];

  const apps = [
    'admin-app',
    'customer-portal',
    'api-gateway'
  ];

  log('\n📦 Packages:', 'bold');
  packages.forEach(pkg => {
    const exists = checkDirectory(`packages/${pkg}`);
    const fileCount = exists ? countFiles(`packages/${pkg}`) : 0;
    const status = exists ? '✅' : '❌';
    const color = exists ? 'green' : 'red';
    log(`  ${status} ${pkg} (${fileCount} files)`, color);
  });

  log('\n📱 Apps:', 'bold');
  apps.forEach(app => {
    const exists = checkDirectory(`apps/${app}`);
    const fileCount = exists ? countFiles(`apps/${app}`) : 0;
    const status = exists ? '✅' : '❌';
    const color = exists ? 'green' : 'red';
    log(`  ${status} ${app} (${fileCount} files)`, color);
  });

  // Check for legacy files
  log('\n🧹 Legacy Cleanup Needed:', 'bold');
  const legacyItems = [
    'packages/aibos_css',
    'packages/ledger-sdk/src/services/homepage',
    'packages/ledger-sdk/src/services/login-page'
  ];

  legacyItems.forEach(item => {
    const exists = checkDirectory(item);
    if (exists) {
      log(`  ⚠️  ${item} (should be cleaned up)`, 'yellow');
    }
  });

  // Next steps
  log('\n🎯 Next Steps:', 'bold');
  log('1. Test accounting-sdk build: pnpm run build --filter=@aibos/accounting-sdk', 'blue');
  log('2. Start tax-sdk migration (depends on accounting)', 'blue');
  log('3. Continue with crm-sdk, hr-sdk, etc.', 'blue');
  log('4. Update admin-app imports to use new packages', 'blue');
  log('5. Clean up legacy files and directories', 'blue');

  log('\n📝 Migration status available in MIGRATION.md', 'green');
}

if (require.main === module) {
  main();
}

module.exports = { main, checkDirectory, countFiles }; 