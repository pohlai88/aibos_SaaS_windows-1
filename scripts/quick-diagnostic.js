#!/usr/bin/env node

/**
 * AI-BOS Quick Diagnostic System
 * Fast identification of critical issues across Frontend, Backend, and Shared Package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  projectRoot: path.resolve(__dirname, '..'),
  frontendPath: path.resolve(__dirname, '../railway-1/frontend'),
  backendPath: path.resolve(__dirname, '../railway-1/backend'),
  sharedPath: path.resolve(__dirname, '../shared')
};

class QuickDiagnostic {
  constructor() {
    this.issues = [];
    this.startTime = Date.now();
  }

  addIssue(layer, severity, message, details = {}) {
    this.issues.push({
      layer,
      severity,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async run() {
    console.log('🔍 AI-BOS Quick Diagnostic Starting...\n');

    // Check project structure
    this.checkProjectStructure();

    // Check critical files
    this.checkCriticalFiles();

    // Check build status
    await this.checkBuildStatus();

    // Check dependencies
    this.checkDependencies();

    // Check TypeScript errors
    await this.checkTypeScriptErrors();

    // Display results
    this.displayResults();
  }

  checkProjectStructure() {
    console.log('📁 Checking project structure...');

    const requiredPaths = [
      { path: CONFIG.frontendPath, name: 'Frontend' },
      { path: CONFIG.backendPath, name: 'Backend' },
      { path: CONFIG.sharedPath, name: 'Shared Package' }
    ];

    requiredPaths.forEach(({ path: layerPath, name }) => {
      if (!fs.existsSync(layerPath)) {
        this.addIssue(name, 'critical', `Directory not found: ${layerPath}`);
      } else {
        console.log(`  ✅ ${name}: ${layerPath}`);
      }
    });
  }

  checkCriticalFiles() {
    console.log('\n📄 Checking critical files...');

    const criticalFiles = [
      { path: path.join(CONFIG.frontendPath, 'package.json'), layer: 'Frontend' },
      { path: path.join(CONFIG.backendPath, 'package.json'), layer: 'Backend' },
      { path: path.join(CONFIG.sharedPath, 'package.json'), layer: 'Shared Package' },
      { path: path.join(CONFIG.frontendPath, 'tsconfig.json'), layer: 'Frontend' },
      { path: path.join(CONFIG.backendPath, 'tsconfig.json'), layer: 'Backend' }
    ];

    criticalFiles.forEach(({ path: filePath, layer }) => {
      if (!fs.existsSync(filePath)) {
        this.addIssue(layer, 'critical', `Critical file missing: ${path.basename(filePath)}`);
      } else {
        console.log(`  ✅ ${layer}: ${path.basename(filePath)}`);
      }
    });
  }

  async checkBuildStatus() {
    console.log('\n🔨 Checking build status...');

    const layers = [
      { path: CONFIG.frontendPath, name: 'Frontend' },
      { path: CONFIG.backendPath, name: 'Backend' }
    ];

    for (const layer of layers) {
      try {
        const packageJsonPath = path.join(layer.path, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
          this.addIssue(layer.name, 'critical', 'package.json not found');
          continue;
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson.scripts?.build) {
          this.addIssue(layer.name, 'warning', 'No build script found');
          continue;
        }

        console.log(`  🔄 Testing ${layer.name} build...`);
        execSync('npm run build', {
          cwd: layer.path,
          stdio: 'pipe',
          timeout: 30000
        });
        console.log(`  ✅ ${layer.name}: Build successful`);

      } catch (error) {
        const errorOutput = error.stdout || error.stderr || error.message;
        this.addIssue(layer.name, 'critical', 'Build failed', { error: errorOutput });
        console.log(`  ❌ ${layer.name}: Build failed`);
      }
    }
  }

  checkDependencies() {
    console.log('\n📦 Checking dependencies...');

    const layers = [
      { path: CONFIG.frontendPath, name: 'Frontend' },
      { path: CONFIG.backendPath, name: 'Backend' },
      { path: CONFIG.sharedPath, name: 'Shared Package' }
    ];

    layers.forEach(layer => {
      const packageJsonPath = path.join(layer.path, 'package.json');
      if (!fs.existsSync(packageJsonPath)) return;

      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const nodeModulesPath = path.join(layer.path, 'node_modules');

        if (!fs.existsSync(nodeModulesPath)) {
          this.addIssue(layer.name, 'critical', 'node_modules not found - run npm install');
        } else {
          console.log(`  ✅ ${layer.name}: Dependencies installed`);
        }

        // Check for shared package reference
        if (layer.name !== 'Shared Package') {
          const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
          const sharedPackage = Object.keys(dependencies).find(dep => dep.includes('aibos-shared'));

          if (!sharedPackage) {
            this.addIssue(layer.name, 'warning', 'No reference to shared package found');
          } else {
            console.log(`  ✅ ${layer.name}: References shared package (${sharedPackage})`);
          }
        }

      } catch (error) {
        this.addIssue(layer.name, 'error', 'Failed to check dependencies', { error: error.message });
      }
    });
  }

  async checkTypeScriptErrors() {
    console.log('\n📝 Checking TypeScript errors...');

    const layers = [
      { path: CONFIG.frontendPath, name: 'Frontend' },
      { path: CONFIG.backendPath, name: 'Backend' }
    ];

    for (const layer of layers) {
      const tsConfigPath = path.join(layer.path, 'tsconfig.json');
      if (!fs.existsSync(tsConfigPath)) {
        this.addIssue(layer.name, 'warning', 'No TypeScript configuration found');
        continue;
      }

      try {
        console.log(`  🔄 Checking ${layer.name} TypeScript...`);
        const output = execSync('npx tsc --noEmit --pretty', {
          cwd: layer.path,
          stdio: 'pipe',
          timeout: 30000
        });
        console.log(`  ✅ ${layer.name}: No TypeScript errors`);

      } catch (error) {
        const errorOutput = error.stdout || error.stderr || error.message || '';
        const errorCount = (errorOutput.toString().match(/error TS\d+:/g) || []).length;
        this.addIssue(layer.name, 'error', `${errorCount} TypeScript errors found`, {
          error: errorOutput.toString(),
          count: errorCount
        });
        console.log(`  ❌ ${layer.name}: ${errorCount} TypeScript errors`);
      }
    }
  }

  displayResults() {
    const duration = Date.now() - this.startTime;
    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
    const errors = this.issues.filter(issue => issue.severity === 'error');
    const warnings = this.issues.filter(issue => issue.severity === 'warning');

    console.log('\n' + '='.repeat(60));
    console.log('📊 QUICK DIAGNOSTIC RESULTS');
    console.log('='.repeat(60));

    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`🔴 Critical Issues: ${criticalIssues.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`📋 Total Issues: ${this.issues.length}`);

    if (this.issues.length === 0) {
      console.log('\n🎉 All systems operational! No issues detected.');
      return;
    }

    // Group issues by layer
    const issuesByLayer = {};
    this.issues.forEach(issue => {
      if (!issuesByLayer[issue.layer]) {
        issuesByLayer[issue.layer] = [];
      }
      issuesByLayer[issue.layer].push(issue);
    });

    Object.entries(issuesByLayer).forEach(([layer, layerIssues]) => {
      console.log(`\n🔍 ${layer.toUpperCase()}:`);
      layerIssues.forEach(issue => {
        const icon = issue.severity === 'critical' ? '🔴' :
                   issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${issue.message}`);
      });
    });

    // Provide recommendations
    console.log('\n💡 RECOMMENDATIONS:');

    if (criticalIssues.length > 0) {
      console.log('  🔴 Fix critical issues immediately before proceeding');
    }

    if (errors.length > 0) {
      console.log('  ❌ Address TypeScript and build errors');
    }

    if (warnings.length > 0) {
      console.log('  ⚠️  Review warnings to improve code quality');
    }

    const missingDeps = this.issues.filter(issue => issue.message.includes('node_modules'));
    if (missingDeps.length > 0) {
      console.log('  📦 Run npm install in affected directories');
    }

    const buildIssues = this.issues.filter(issue => issue.message.includes('Build failed'));
    if (buildIssues.length > 0) {
      console.log('  🔨 Fix build issues to ensure deployment readiness');
    }

    console.log('\n🚀 For detailed analysis, run: node scripts/comprehensive-debug-system.js');
  }
}

// Run diagnostic if called directly
if (require.main === module) {
  const diagnostic = new QuickDiagnostic();
  diagnostic.run().catch(error => {
    console.error('❌ Diagnostic failed:', error.message);
    process.exit(1);
  });
}

module.exports = QuickDiagnostic;
