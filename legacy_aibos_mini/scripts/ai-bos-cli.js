#!/usr/bin/env node

/**
 * AI-BOS CLI - SaaS Operating System Command Line Interface
 * 
 * This CLI provides OS-level commands for managing the AI-BOS SaaS platform.
 * It validates compliance, manages packages, and provides system diagnostics.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(message) {
  log(`🔍 ${message}`, 'cyan');
}

// Load OS configuration
function loadOSConfig() {
  try {
    const configPath = path.join(process.cwd(), 'saas-os.json');
    if (!fs.existsSync(configPath)) {
      logError('saas-os.json not found. Please run setup first.');
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    logError(`Failed to load OS config: ${error.message}`);
    process.exit(1);
  }
}

// Check Node.js version
function checkNodeVersion(requiredVersion) {
  const currentVersion = process.version;
  const required = requiredVersion.replace(/[^\d.]/g, '');
  const current = currentVersion.replace(/[^\d.]/g, '');
  
  if (current >= required) {
    logSuccess(`Node.js version OK (${currentVersion})`);
    return true;
  } else {
    logError(`Node.js version mismatch. Required: ${requiredVersion}, Current: ${currentVersion}`);
    return false;
  }
}

// Check TypeScript configuration
function checkTypeScriptConfig() {
  try {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      logError('tsconfig.json not found');
      return false;
    }
    
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    // Check for strict mode
    if (tsConfig.compilerOptions?.strict) {
      logSuccess('TypeScript strict mode enabled');
    } else {
      logWarning('TypeScript strict mode not enabled');
    }
    
    // Check for ESM module
    if (tsConfig.compilerOptions?.module === 'esnext') {
      logSuccess('ESM module system configured');
    } else {
      logWarning('Not using ESM module system');
    }
    
    return true;
  } catch (error) {
    logError(`TypeScript config check failed: ${error.message}`);
    return false;
  }
}

// Check package structure
function checkPackageStructure(config) {
  const { packages } = config.os;
  let allValid = true;
  
  logStep('Checking package structure...');
  
  // Check core packages
  for (const pkg of packages.core) {
    const pkgName = pkg.replace('@aibos/', '');
    const pkgPath = path.join(process.cwd(), 'packages', pkgName);
    
    if (fs.existsSync(pkgPath)) {
      logSuccess(`Core package: ${pkg}`);
    } else {
      logError(`Missing core package: ${pkg}`);
      allValid = false;
    }
  }
  
  // Check domain packages
  for (const pkg of packages.domain) {
    const pkgName = pkg.replace('@aibos/', '');
    const pkgPath = path.join(process.cwd(), 'packages', pkgName);
    
    if (fs.existsSync(pkgPath)) {
      logSuccess(`Domain package: ${pkg}`);
    } else {
      logWarning(`Missing domain package: ${pkg}`);
    }
  }
  
  return allValid;
}

// Check for CommonJS usage
function checkCommonJSUsage() {
  logStep('Checking for CommonJS usage...');
  
  try {
    const result = execSync('grep -r "require(" packages/ apps/ --include="*.ts" --include="*.tsx" 2>/dev/null || true', { encoding: 'utf8' });
    
    if (result.trim()) {
      logError('CommonJS require() statements found:');
      console.log(result);
      return false;
    } else {
      logSuccess('No CommonJS require() statements found');
      return true;
    }
  } catch (error) {
    logWarning('Could not check for CommonJS usage');
    return true;
  }
}

// Run validation pipeline
function runValidationPipeline() {
  logStep('Running validation pipeline...');
  
  try {
    execSync('pnpm run validate', { stdio: 'inherit' });
    logSuccess('Validation pipeline completed');
    return true;
  } catch (error) {
    logError('Validation pipeline failed');
    return false;
  }
}

// Show system status
function showSystemStatus(config) {
  log('🚀 AI-BOS SaaS OS Status', 'bold');
  log('========================', 'blue');
  
  const checks = [
    { name: 'Node.js Version', fn: () => checkNodeVersion(config.os.runtime.nodeVersion) },
    { name: 'TypeScript Config', fn: checkTypeScriptConfig },
    { name: 'Package Structure', fn: () => checkPackageStructure(config) },
    { name: 'CommonJS Usage', fn: checkCommonJSUsage }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  for (const check of checks) {
    logStep(`Checking ${check.name}...`);
    if (check.fn()) {
      passed++;
    }
  }
  
  log('\n📊 Summary:', 'bold');
  log(`${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    logSuccess('System is compliant with OS requirements');
  } else {
    logWarning('System has compliance issues');
  }
}

// Diagnose issues
function diagnoseIssues() {
  log('🔧 AI-BOS System Diagnostics', 'bold');
  log('============================', 'blue');
  
  // Check for common issues
  const issues = [];
  
  // Check for missing dependencies
  if (!fs.existsSync('node_modules')) {
    issues.push('Missing node_modules - run pnpm install');
  }
  
  // Check for build artifacts
  if (fs.existsSync('.next')) {
    issues.push('Build artifacts found - run pnpm run clean');
  }
  
  // Check for TypeScript errors
  try {
    execSync('pnpm run type-check', { stdio: 'pipe' });
  } catch (error) {
    issues.push('TypeScript errors found - run pnpm run type-check for details');
  }
  
  if (issues.length === 0) {
    logSuccess('No issues detected');
  } else {
    logWarning('Issues found:');
    issues.forEach(issue => log(`  • ${issue}`, 'yellow'));
  }
}

// Update OS components
function updateOSComponents() {
  log('🔄 Updating OS Components', 'bold');
  log('========================', 'blue');
  
  try {
    logStep('Updating dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });
    
    logStep('Building packages...');
    execSync('pnpm run build:deps', { stdio: 'inherit' });
    
    logStep('Running validation...');
    execSync('pnpm run validate', { stdio: 'inherit' });
    
    logSuccess('OS components updated successfully');
  } catch (error) {
    logError('Failed to update OS components');
    process.exit(1);
  }
}

// Show help function
function showHelp() {
  log('🚀 AI-BOS CLI - SaaS Operating System', 'bold');
  log('====================================', 'blue');
  log('');
  log('Available commands:', 'bold');
  log('  check     - Validate OS compliance');
  log('  build     - Build packages and apps');
  log('  test      - Run tests with coverage');
  log('  lint      - Check code quality');
  log('  validate  - Full validation pipeline');
  log('  status    - Show system status');
  log('  doctor    - Diagnose issues');
  log('  update    - Update OS components');
  log('  help      - Show this help');
  log('');
}

// Main command handler
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    showHelp();
    process.exit(0);
  }
  
  const config = loadOSConfig();
  
  switch (command.toLowerCase()) {
    case 'check':
      showSystemStatus(config);
      break;
      
    case 'build':
      logStep('Building packages and apps...');
      try {
        execSync('pnpm run build', { stdio: 'inherit' });
        logSuccess('Build completed successfully');
      } catch (error) {
        logError('Build failed');
        process.exit(1);
      }
      break;
      
    case 'test':
      logStep('Running tests...');
      try {
        execSync('pnpm run test', { stdio: 'inherit' });
        logSuccess('Tests completed successfully');
      } catch (error) {
        logError('Tests failed');
        process.exit(1);
      }
      break;
      
    case 'lint':
      logStep('Running linting...');
      try {
        execSync('pnpm run lint', { stdio: 'inherit' });
        logSuccess('Linting completed successfully');
      } catch (error) {
        logError('Linting failed');
        process.exit(1);
      }
      break;
      
    case 'validate':
      runValidationPipeline();
      break;
      
    case 'status':
      showSystemStatus(config);
      break;
      
    case 'doctor':
      diagnoseIssues();
      break;
      
    case 'update':
      updateOSComponents();
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      logError(`Unknown command: ${command}`);
      log('Run "node scripts/ai-bos-cli.js help" for available commands');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadOSConfig,
  checkNodeVersion,
  checkTypeScriptConfig,
  checkPackageStructure,
  checkCommonJSUsage,
  runValidationPipeline,
  showSystemStatus,
  diagnoseIssues,
  updateOSComponents
}; 