#!/usr/bin/env node

/**
 * AI-BOS Frontend Deployment Audit
 * Comprehensive deployment readiness check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
    this.projectRoot = path.resolve(__dirname);
    this.sharedRoot = path.resolve(__dirname, '../../shared');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'error': '❌',
      'warning': '⚠️',
      'success': '✅',
      'info': 'ℹ️'
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkDependencies() {
    this.log('Checking dependencies...', 'info');

    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const requiredDeps = [
        'react', 'next', 'typescript', '@types/react', '@types/node',
        'tailwindcss', 'autoprefixer', 'postcss'
      ];

      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);

      if (missingDeps.length > 0) {
        this.issues.push(`Missing required dependencies: ${missingDeps.join(', ')}`);
        this.log(`Missing dependencies: ${missingDeps.join(', ')}`, 'error');
      } else {
        this.successes.push('All required dependencies are installed');
        this.log('All required dependencies are installed', 'success');
      }
    } catch (error) {
      this.issues.push(`Failed to check dependencies: ${error.message}`);
      this.log(`Failed to check dependencies: ${error.message}`, 'error');
    }
  }

  async checkSharedLibrary() {
    this.log('Checking shared library...', 'info');

    try {
      // Check if shared library exists
      if (!fs.existsSync(this.sharedRoot)) {
        this.issues.push('Shared library directory not found');
        this.log('Shared library directory not found', 'error');
        return;
      }

      // Check shared library exports
      const sharedIndex = path.join(this.sharedRoot, 'index.ts');
      if (!fs.existsSync(sharedIndex)) {
        this.issues.push('Shared library index.ts not found');
        this.log('Shared library index.ts not found', 'error');
        return;
      }

      const sharedContent = fs.readFileSync(sharedIndex, 'utf8');

      // Check for problematic exports
      const problematicExports = [
        'visual-dev/src/index',
        'ai-onboarding/src/index',
        'community-templates/src/index',
        'strategic-enhancements/index'
      ];

      const foundProblematic = problematicExports.filter(exportPath =>
        sharedContent.includes(`export * from './${exportPath}'`)
      );

      if (foundProblematic.length > 0) {
        this.warnings.push(`Found potentially problematic exports: ${foundProblematic.join(', ')}`);
        this.log(`Found potentially problematic exports: ${foundProblematic.join(', ')}`, 'warning');
      }

      this.successes.push('Shared library structure verified');
      this.log('Shared library structure verified', 'success');
    } catch (error) {
      this.issues.push(`Failed to check shared library: ${error.message}`);
      this.log(`Failed to check shared library: ${error.message}`, 'error');
    }
  }

  async checkUIComponents() {
    this.log('Checking UI components...', 'info');

    try {
      const uiComponentsPath = path.join(this.sharedRoot, 'ui-components/src/index.ts');

      if (!fs.existsSync(uiComponentsPath)) {
        this.issues.push('UI components index not found');
        this.log('UI components index not found', 'error');
        return;
      }

      const uiContent = fs.readFileSync(uiComponentsPath, 'utf8');

      // Check for disabled exports
      const disabledExports = (uiContent.match(/\/\/ export \* from/g) || []).length;

      if (disabledExports > 0) {
        this.warnings.push(`${disabledExports} UI component exports are disabled`);
        this.log(`${disabledExports} UI component exports are disabled`, 'warning');
      }

      // Check for actual exports
      const actualExports = (uiContent.match(/export \* from/g) || []).length;

      if (actualExports === 0) {
        this.issues.push('No UI components are being exported');
        this.log('No UI components are being exported', 'error');
      } else {
        this.successes.push(`${actualExports} UI component exports found`);
        this.log(`${actualExports} UI component exports found`, 'success');
      }
    } catch (error) {
      this.issues.push(`Failed to check UI components: ${error.message}`);
      this.log(`Failed to check UI components: ${error.message}`, 'error');
    }
  }

  async checkTypeScript() {
    this.log('Checking TypeScript configuration...', 'info');

    try {
      const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json');

      if (!fs.existsSync(tsConfigPath)) {
        this.issues.push('TypeScript configuration not found');
        this.log('TypeScript configuration not found', 'error');
        return;
      }

      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

      // Check for strict mode
      if (!tsConfig.compilerOptions?.strict) {
        this.warnings.push('TypeScript strict mode is not enabled');
        this.log('TypeScript strict mode is not enabled', 'warning');
      } else {
        this.successes.push('TypeScript strict mode is enabled');
        this.log('TypeScript strict mode is enabled', 'success');
      }

      // Check for path mapping
      if (!tsConfig.compilerOptions?.paths) {
        this.warnings.push('No TypeScript path mapping configured');
        this.log('No TypeScript path mapping configured', 'warning');
      } else {
        this.successes.push('TypeScript path mapping is configured');
        this.log('TypeScript path mapping is configured', 'success');
      }
    } catch (error) {
      this.issues.push(`Failed to check TypeScript: ${error.message}`);
      this.log(`Failed to check TypeScript: ${error.message}`, 'error');
    }
  }

  async checkNextJS() {
    this.log('Checking Next.js configuration...', 'info');

    try {
      const nextConfigPath = path.join(this.projectRoot, 'next.config.js');

      if (!fs.existsSync(nextConfigPath)) {
        this.issues.push('Next.js configuration not found');
        this.log('Next.js configuration not found', 'error');
        return;
      }

      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

      // Check for webpack configuration
      if (!nextConfig.includes('webpack')) {
        this.warnings.push('No custom webpack configuration found');
        this.log('No custom webpack configuration found', 'warning');
      } else {
        this.successes.push('Custom webpack configuration found');
        this.log('Custom webpack configuration found', 'success');
      }

      // Check for transpilePackages
      if (!nextConfig.includes('transpilePackages')) {
        this.warnings.push('No transpilePackages configuration found');
        this.log('No transpilePackages configuration found', 'warning');
      } else {
        this.successes.push('transpilePackages configuration found');
        this.log('transpilePackages configuration found', 'success');
      }
    } catch (error) {
      this.issues.push(`Failed to check Next.js: ${error.message}`);
      this.log(`Failed to check Next.js: ${error.message}`, 'error');
    }
  }

  async checkBuildProcess() {
    this.log('Checking build process...', 'info');

    try {
      // Check if build script exists
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));

      if (!packageJson.scripts?.build) {
        this.issues.push('Build script not found in package.json');
        this.log('Build script not found in package.json', 'error');
        return;
      }

      this.successes.push('Build script found in package.json');
      this.log('Build script found in package.json', 'success');

      // Try to run build (dry run)
      try {
        execSync('npm run build --dry-run', { cwd: this.projectRoot, stdio: 'pipe' });
        this.successes.push('Build process can be executed');
        this.log('Build process can be executed', 'success');
      } catch (error) {
        this.warnings.push('Build process may have issues');
        this.log('Build process may have issues', 'warning');
      }
    } catch (error) {
      this.issues.push(`Failed to check build process: ${error.message}`);
      this.log(`Failed to check build process: ${error.message}`, 'error');
    }
  }

  async checkEnvironment() {
    this.log('Checking environment configuration...', 'info');

    try {
      const envExamplePath = path.join(this.projectRoot, 'env.example');
      const envPath = path.join(this.projectRoot, '.env.local');

      if (!fs.existsSync(envExamplePath)) {
        this.warnings.push('No environment example file found');
        this.log('No environment example file found', 'warning');
      } else {
        this.successes.push('Environment example file found');
        this.log('Environment example file found', 'success');
      }

      if (!fs.existsSync(envPath)) {
        this.warnings.push('No local environment file found');
        this.log('No local environment file found', 'warning');
      } else {
        this.successes.push('Local environment file found');
        this.log('Local environment file found', 'success');
      }
    } catch (error) {
      this.issues.push(`Failed to check environment: ${error.message}`);
      this.log(`Failed to check environment: ${error.message}`, 'error');
    }
  }

  async checkImportIssues() {
    this.log('Checking import issues...', 'info');

    try {
      // Check for problematic imports in components
      const componentsDir = path.join(this.projectRoot, 'src/components');

      if (fs.existsSync(componentsDir)) {
        const componentFiles = this.getFilesRecursively(componentsDir, '.tsx');

        for (const file of componentFiles) {
          const content = fs.readFileSync(file, 'utf8');

          // Check for @aibos/shared imports
          if (content.includes('@aibos/shared')) {
            this.successes.push(`Found @aibos/shared imports in ${path.relative(this.projectRoot, file)}`);
            this.log(`Found @aibos/shared imports in ${path.relative(this.projectRoot, file)}`, 'success');
          }

          // Check for problematic imports
          const problematicImports = [
            'net',
            'fs',
            'path',
            'crypto',
            'child_process'
          ];

          for (const problematic of problematicImports) {
            if (content.includes(`import.*${problematic}`)) {
              this.issues.push(`Found problematic import '${problematic}' in ${path.relative(this.projectRoot, file)}`);
              this.log(`Found problematic import '${problematic}' in ${path.relative(this.projectRoot, file)}`, 'error');
            }
          }
        }
      }
    } catch (error) {
      this.issues.push(`Failed to check import issues: ${error.message}`);
      this.log(`Failed to check import issues: ${error.message}`, 'error');
    }
  }

  getFilesRecursively(dir, ext) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath, ext));
      } else if (item.endsWith(ext)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 AI-BOS FRONTEND DEPLOYMENT AUDIT REPORT');
    console.log('='.repeat(80));

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Issues: ${this.issues.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Successes: ${this.successes.length}`);

    if (this.issues.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES (${this.issues.length}):`);
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (this.successes.length > 0) {
      console.log(`\n✅ SUCCESSES (${this.successes.length}):`);
      this.successes.forEach((success, index) => {
        console.log(`   ${index + 1}. ${success}`);
      });
    }

    console.log('\n' + '='.repeat(80));

    // Deployment readiness assessment
    const readinessScore = this.calculateReadinessScore();
    console.log(`\n🎯 DEPLOYMENT READINESS: ${readinessScore}%`);

    if (readinessScore >= 90) {
      console.log('✅ EXCELLENT - Ready for deployment');
    } else if (readinessScore >= 75) {
      console.log('⚠️  GOOD - Minor issues to address');
    } else if (readinessScore >= 50) {
      console.log('🔧 FAIR - Significant issues to fix');
    } else {
      console.log('❌ POOR - Major issues prevent deployment');
    }

    console.log('='.repeat(80) + '\n');

    return {
      issues: this.issues,
      warnings: this.warnings,
      successes: this.successes,
      readinessScore
    };
  }

  calculateReadinessScore() {
    const totalChecks = this.issues.length + this.warnings.length + this.successes.length;
    if (totalChecks === 0) return 0;

    const issueWeight = 0.5; // Issues reduce score by 50%
    const warningWeight = 0.1; // Warnings reduce score by 10%
    const successWeight = 1.0; // Successes add 100%

    const score = (
      (this.successes.length * successWeight) -
      (this.issues.length * issueWeight) -
      (this.warnings.length * warningWeight)
    ) / totalChecks * 100;

    return Math.max(0, Math.min(100, score));
  }

  async runFullAudit() {
    console.log('🔍 Starting comprehensive deployment audit...\n');

    await this.checkDependencies();
    await this.checkSharedLibrary();
    await this.checkUIComponents();
    await this.checkTypeScript();
    await this.checkNextJS();
    await this.checkBuildProcess();
    await this.checkEnvironment();
    await this.checkImportIssues();

    return this.generateReport();
  }
}

// Run the audit
const auditor = new DeploymentAuditor();
auditor.runFullAudit().catch(console.error);
