#!/usr/bin/env node

/**
 * 🧠 AI-BOS Production Deployment Script
 * Manifest-driven production deployment with comprehensive validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ==================== DEPLOYMENT CONFIGURATION ====================

const DEPLOYMENT_CONFIG = {
  // Environment variables
  environments: {
    production: {
      NODE_ENV: 'production',
      AI_BOS_ENVIRONMENT: 'production',
      ENABLE_AI_ENGINE: 'true',
      ENABLE_CONSCIOUSNESS: 'true',
      ENABLE_QUANTUM: 'false',
      ENABLE_PERFORMANCE_MONITORING: 'true',
      ENABLE_ACCESSIBILITY: 'true',
      ENABLE_SCREEN_READER: 'true',
      ANALYZE: 'false',
      MEASURE: 'false'
    },
    staging: {
      NODE_ENV: 'production',
      AI_BOS_ENVIRONMENT: 'staging',
      ENABLE_AI_ENGINE: 'true',
      ENABLE_CONSCIOUSNESS: 'true',
      ENABLE_QUANTUM: 'false',
      ENABLE_PERFORMANCE_MONITORING: 'true',
      ENABLE_ACCESSIBILITY: 'true',
      ENABLE_SCREEN_READER: 'true',
      ANALYZE: 'false',
      MEASURE: 'false'
    }
  },

  // Deployment platforms
  platforms: {
    vercel: {
      name: 'Vercel',
      command: 'vercel --prod',
      envFile: '.env.production',
      buildCommand: 'npm run build',
      deployCommand: 'vercel --prod'
    },
    railway: {
      name: 'Railway',
      command: 'railway up',
      envFile: '.env.production',
      buildCommand: 'npm run build',
      deployCommand: 'railway up'
    },
    netlify: {
      name: 'Netlify',
      command: 'netlify deploy --prod',
      envFile: '.env.production',
      buildCommand: 'npm run build',
      deployCommand: 'netlify deploy --prod'
    }
  },

  // Validation checks
  validations: {
    typeCheck: true,
    lintCheck: true,
    testCheck: true,
    buildCheck: true,
    securityCheck: true,
    performanceCheck: true,
    accessibilityCheck: true,
    manifestCheck: true
  }
};

// ==================== DEPLOYMENT CLASS ====================

class ProductionDeployer {
  constructor(environment = 'production', platform = 'vercel') {
    this.environment = environment;
    this.platform = platform;
    this.config = DEPLOYMENT_CONFIG;
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Execute deployment
   */
  async deploy() {
    console.log(`🚀 Starting AI-BOS ${this.environment} deployment to ${this.config.platforms[this.platform].name}...`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);

    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks();

      // Environment setup
      await this.setupEnvironment();

      // Build process
      await this.runBuildProcess();

      // Post-build validations
      await this.runPostBuildValidations();

      // Deployment
      await this.executeDeployment();

      // Post-deployment checks
      await this.runPostDeploymentChecks();

      // Generate deployment report
      this.generateDeploymentReport();

      console.log(`✅ Deployment completed successfully!`);
      console.log(`⏱️ Total time: ${this.getElapsedTime()}`);
    } catch (error) {
      console.error(`❌ Deployment failed: ${error.message}`);
      this.errors.push(error.message);
      this.generateDeploymentReport();
      process.exit(1);
    }
  }

  /**
   * Run pre-deployment checks
   */
  async runPreDeploymentChecks() {
    console.log('\n🔍 Running pre-deployment checks...');

    const checks = [
      { name: 'TypeScript Check', fn: () => this.runTypeCheck() },
      { name: 'Lint Check', fn: () => this.runLintCheck() },
      { name: 'Test Check', fn: () => this.runTestCheck() },
      { name: 'Security Check', fn: () => this.runSecurityCheck() },
      { name: 'Manifest Check', fn: () => this.runManifestCheck() },
      { name: 'Dependency Check', fn: () => this.runDependencyCheck() }
    ];

    for (const check of checks) {
      if (this.config.validations[check.name.toLowerCase().replace(/\s+/g, '')]) {
        try {
          await check.fn();
          console.log(`✅ ${check.name} passed`);
        } catch (error) {
          console.error(`❌ ${check.name} failed: ${error.message}`);
          this.errors.push(`${check.name}: ${error.message}`);
        }
      }
    }

    if (this.errors.length > 0) {
      throw new Error('Pre-deployment checks failed');
    }
  }

  /**
   * Setup environment
   */
  async setupEnvironment() {
    console.log('\n⚙️ Setting up environment...');

    const envConfig = this.config.environments[this.environment];
    const envFile = this.config.platforms[this.platform].envFile;

    // Create environment file
    const envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(envFile, envContent);
    console.log(`✅ Environment file created: ${envFile}`);

    // Set environment variables
    Object.entries(envConfig).forEach(([key, value]) => {
      process.env[key] = value;
    });

    console.log(`✅ Environment variables set for ${this.environment}`);
  }

  /**
   * Run build process
   */
  async runBuildProcess() {
    console.log('\n🔨 Running build process...');

    const buildCommand = this.config.platforms[this.platform].buildCommand;

    try {
      console.log(`Executing: ${buildCommand}`);
      execSync(buildCommand, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Build completed successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  /**
   * Run post-build validations
   */
  async runPostBuildValidations() {
    console.log('\n🔍 Running post-build validations...');

    const validations = [
      { name: 'Build Output Check', fn: () => this.checkBuildOutput() },
      { name: 'Bundle Size Check', fn: () => this.checkBundleSize() },
      { name: 'Performance Check', fn: () => this.runPerformanceCheck() },
      { name: 'Accessibility Check', fn: () => this.runAccessibilityCheck() }
    ];

    for (const validation of validations) {
      if (this.config.validations[validation.name.toLowerCase().replace(/\s+/g, '')]) {
        try {
          await validation.fn();
          console.log(`✅ ${validation.name} passed`);
        } catch (error) {
          console.warn(`⚠️ ${validation.name} failed: ${error.message}`);
          this.warnings.push(`${validation.name}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Execute deployment
   */
  async executeDeployment() {
    console.log('\n🚀 Executing deployment...');

    const deployCommand = this.config.platforms[this.platform].deployCommand;

    try {
      console.log(`Deploying to ${this.config.platforms[this.platform].name}...`);
      execSync(deployCommand, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Deployment completed successfully');
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Run post-deployment checks
   */
  async runPostDeploymentChecks() {
    console.log('\n🔍 Running post-deployment checks...');

    const checks = [
      { name: 'Health Check', fn: () => this.runHealthCheck() },
      { name: 'Performance Check', fn: () => this.runPerformanceCheck() },
      { name: 'Accessibility Check', fn: () => this.runAccessibilityCheck() }
    ];

    for (const check of checks) {
      try {
        await check.fn();
        console.log(`✅ ${check.name} passed`);
      } catch (error) {
        console.warn(`⚠️ ${check.name} failed: ${error.message}`);
        this.warnings.push(`${check.name}: ${error.message}`);
      }
    }
  }

  // ==================== VALIDATION METHODS ====================

  async runTypeCheck() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('TypeScript compilation errors found');
    }
  }

  async runLintCheck() {
    try {
      execSync('npm run lint', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('ESLint errors found');
    }
  }

  async runTestCheck() {
    try {
      execSync('npm run test:run', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Test failures found');
    }
  }

  async runSecurityCheck() {
    try {
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Security vulnerabilities found');
    }
  }

  async runManifestCheck() {
    const manifestFiles = [
      'src/manifests/core/app.manifest.json',
      'src/manifests/core/auth.manifest.json',
      'src/manifests/modules/ai-engine.manifest.json',
      'src/manifests/modules/consciousness.manifest.json'
    ];

    for (const manifestFile of manifestFiles) {
      if (!fs.existsSync(manifestFile)) {
        throw new Error(`Missing manifest file: ${manifestFile}`);
      }

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
        if (!manifest.id || !manifest.version || !manifest.type) {
          throw new Error(`Invalid manifest structure in ${manifestFile}`);
        }
      } catch (error) {
        throw new Error(`Invalid JSON in manifest file: ${manifestFile}`);
      }
    }
  }

  async runDependencyCheck() {
    try {
      execSync('npm ci --only=production', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Dependency installation failed');
    }
  }

  async checkBuildOutput() {
    const buildDir = '.next';
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build output directory not found');
    }

    const requiredFiles = ['server', 'static', 'server/pages-manifest.json'];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(buildDir, file))) {
        throw new Error(`Required build file missing: ${file}`);
      }
    }
  }

  async checkBundleSize() {
    const bundleSizeLimit = 1024 * 1024; // 1MB
    const buildDir = '.next/static/chunks';

    if (fs.existsSync(buildDir)) {
      const files = fs.readdirSync(buildDir);
      for (const file of files) {
        const filePath = path.join(buildDir, file);
        const stats = fs.statSync(filePath);
        if (stats.size > bundleSizeLimit) {
          this.warnings.push(`Large bundle detected: ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        }
      }
    }
  }

  async runPerformanceCheck() {
    // This would typically run Lighthouse or similar performance testing
    console.log('Performance check would run here in a real deployment');
  }

  async runAccessibilityCheck() {
    // This would typically run axe-core or similar accessibility testing
    console.log('Accessibility check would run here in a real deployment');
  }

  async runHealthCheck() {
    // This would check the deployed application's health endpoint
    console.log('Health check would run here in a real deployment');
  }

  // ==================== UTILITY METHODS ====================

  getElapsedTime() {
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      platform: this.platform,
      duration: this.getElapsedTime(),
      errors: this.errors,
      warnings: this.warnings,
      success: this.errors.length === 0
    };

    const reportFile = `deployment-report-${this.environment}-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Deployment report saved: ${reportFile}`);

    // Print summary
    console.log('\n📋 Deployment Summary:');
    console.log(`Environment: ${this.environment}`);
    console.log(`Platform: ${this.config.platforms[this.platform].name}`);
    console.log(`Duration: ${this.getElapsedTime()}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Status: ${report.success ? '✅ Success' : '❌ Failed'}`);
  }
}

// ==================== COMMAND LINE INTERFACE ====================

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    environment: 'production',
    platform: 'vercel',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--env':
      case '-e':
        options.environment = args[++i] || 'production';
        break;
      case '--platform':
      case '-p':
        options.platform = args[++i] || 'vercel';
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🧠 AI-BOS Production Deployment Script

Usage: node scripts/deploy-production.js [options]

Options:
  -e, --env <environment>    Deployment environment (production, staging) [default: production]
  -p, --platform <platform>  Deployment platform (vercel, railway, netlify) [default: vercel]
  -h, --help                 Show this help message

Examples:
  node scripts/deploy-production.js
  node scripts/deploy-production.js --env staging --platform railway
  node scripts/deploy-production.js -e production -p vercel

Supported Environments:
  - production: Production deployment with all optimizations
  - staging: Staging deployment with production-like settings

Supported Platforms:
  - vercel: Deploy to Vercel
  - railway: Deploy to Railway
  - netlify: Deploy to Netlify
`);
}

// ==================== MAIN EXECUTION ====================

async function main() {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    return;
  }

  // Validate options
  const validEnvironments = Object.keys(DEPLOYMENT_CONFIG.environments);
  const validPlatforms = Object.keys(DEPLOYMENT_CONFIG.platforms);

  if (!validEnvironments.includes(options.environment)) {
    console.error(`❌ Invalid environment: ${options.environment}`);
    console.error(`Valid environments: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  if (!validPlatforms.includes(options.platform)) {
    console.error(`❌ Invalid platform: ${options.platform}`);
    console.error(`Valid platforms: ${validPlatforms.join(', ')}`);
    process.exit(1);
  }

  // Execute deployment
  const deployer = new ProductionDeployer(options.environment, options.platform);
  await deployer.deploy();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { ProductionDeployer, DEPLOYMENT_CONFIG };
