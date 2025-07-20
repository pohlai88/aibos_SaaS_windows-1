#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TurboSpeedOptimizer {
  constructor() {
    this.rootDir = process.cwd();
    this.turboCacheDir = path.join(this.rootDir, '.turbo');
    this.nodeModulesDir = path.join(this.rootDir, 'node_modules');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        cwd: this.rootDir,
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkTurboInstallation() {
    this.log('🔍 Checking Turbo installation...', 'info');
    
    const result = await this.runCommand('turbo --version');
    if (result.success) {
      this.log(`✅ Turbo version: ${result.output.trim()}`, 'success');
      return true;
    } else {
      this.log('❌ Turbo not found. Installing...', 'warning');
      const installResult = await this.runCommand('pnpm add -D turbo');
      if (installResult.success) {
        this.log('✅ Turbo installed successfully', 'success');
        return true;
      } else {
        this.log('❌ Failed to install Turbo', 'error');
        return false;
      }
    }
  }

  async analyzeWorkspace() {
    this.log('📊 Analyzing workspace structure...', 'info');
    
    const apps = fs.readdirSync(path.join(this.rootDir, 'apps')).filter(f => 
      fs.statSync(path.join(this.rootDir, 'apps', f)).isDirectory()
    );
    
    const packages = fs.readdirSync(path.join(this.rootDir, 'packages')).filter(f => 
      fs.statSync(path.join(this.rootDir, 'packages', f)).isDirectory()
    );
    
    this.log(`📁 Found ${apps.length} apps: ${apps.join(', ')}`, 'info');
    this.log(`📦 Found ${packages.length} packages: ${packages.join(', ')}`, 'info');
    
    return { apps, packages };
  }

  async checkDependencies() {
    this.log('🔍 Checking dependencies...', 'info');
    
    const result = await this.runCommand('pnpm check-deps');
    if (result.success) {
      this.log('✅ Dependencies are valid', 'success');
      return true;
    } else {
      this.log('⚠️  Dependency issues found', 'warning');
      this.log(result.error, 'warning');
      return false;
    }
  }

  async optimizeCache() {
    this.log('⚡ Optimizing cache...', 'info');
    
    // Clear old cache
    if (fs.existsSync(this.turboCacheDir)) {
      fs.rmSync(this.turboCacheDir, { recursive: true, force: true });
      this.log('🗑️  Cleared old cache', 'info');
    }
    
    // Build dependencies first
    this.log('🔨 Building dependencies...', 'info');
    const buildResult = await this.runCommand('pnpm build:deps');
    if (buildResult.success) {
      this.log('✅ Dependencies built successfully', 'success');
    } else {
      this.log('⚠️  Some dependency builds failed', 'warning');
    }
    
    return buildResult.success;
  }

  async runSpeedTest() {
    this.log('🏃 Running speed tests...', 'info');
    
    const startTime = Date.now();
    
    // Test build speed
    const buildResult = await this.runCommand('pnpm build:fast');
    const buildTime = Date.now() - startTime;
    
    if (buildResult.success) {
      this.log(`✅ Build completed in ${buildTime}ms`, 'success');
    } else {
      this.log(`❌ Build failed after ${buildTime}ms`, 'error');
    }
    
    return { buildTime, success: buildResult.success };
  }

  async generateReport() {
    this.log('📋 Generating optimization report...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      turboVersion: '',
      workspace: await this.analyzeWorkspace(),
      dependencies: false,
      cacheOptimized: false,
      speedTest: null
    };
    
    // Get Turbo version
    const turboResult = await this.runCommand('turbo --version');
    if (turboResult.success) {
      report.turboVersion = turboResult.output.trim();
    }
    
    // Check dependencies
    report.dependencies = await this.checkDependencies();
    
    // Optimize cache
    report.cacheOptimized = await this.optimizeCache();
    
    // Run speed test
    report.speedTest = await this.runSpeedTest();
    
    // Save report
    const reportPath = path.join(this.rootDir, 'turbo-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📄 Report saved to: ${reportPath}`, 'success');
    
    return report;
  }

  async showRecommendations(report) {
    this.log('\n🎯 Optimization Recommendations:', 'info');
    
    if (!report.dependencies) {
      this.log('• Run "pnpm install" to fix dependency issues', 'warning');
    }
    
    if (!report.cacheOptimized) {
      this.log('• Run "pnpm clean:cache" to clear cache issues', 'warning');
    }
    
    if (report.speedTest && report.speedTest.buildTime > 30000) {
      this.log('• Build time is slow. Consider using "pnpm build:fast"', 'warning');
    }
    
    this.log('\n🚀 Recommended daily workflow:', 'success');
    this.log('1. pnpm dev:fast          # Fast development mode', 'info');
    this.log('2. pnpm build:fast        # Fast builds', 'info');
    this.log('3. pnpm lint:fix          # Auto-fix linting', 'info');
    this.log('4. pnpm clean:cache       # Weekly cache cleanup', 'info');
  }

  async optimize() {
    this.log('🚀 Starting Turbo Speed Optimization...', 'info');
    this.log('=====================================', 'info');
    
    // Check Turbo installation
    const turboInstalled = await this.checkTurboInstallation();
    if (!turboInstalled) {
      this.log('❌ Cannot proceed without Turbo', 'error');
      process.exit(1);
    }
    
    // Generate report
    const report = await this.generateReport();
    
    // Show recommendations
    await this.showRecommendations(report);
    
    this.log('\n✅ Turbo Speed Optimization Complete!', 'success');
    this.log('Check TURBO_SPEED_ENHANCEMENT.md for detailed usage guide.', 'info');
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new TurboSpeedOptimizer();
  optimizer.optimize().catch(error => {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  });
}

module.exports = TurboSpeedOptimizer; 