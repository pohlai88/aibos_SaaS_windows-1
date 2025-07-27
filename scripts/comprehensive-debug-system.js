#!/usr/bin/env node

/**
 * AI-BOS Comprehensive Debug System
 * Concurrent debugging across Frontend, Backend, and Shared NPM Package
 *
 * Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."
 * This debug system innovates by providing real-time, cross-layer diagnostics.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

// ==================== CONFIGURATION ====================
const CONFIG = {
  projectRoot: path.resolve(__dirname, '..'),
  frontendPath: path.resolve(__dirname, '../railway-1/frontend'),
  backendPath: path.resolve(__dirname, '../railway-1/backend'),
  sharedPath: path.resolve(__dirname, '../shared'),
  outputPath: path.resolve(__dirname, '../debug-reports'),
  maxConcurrentProcesses: 3,
  timeoutMs: 30000
};

// ==================== DEBUG CATEGORIES ====================
const DEBUG_CATEGORIES = {
  TYPESCRIPT: 'typescript',
  BUILD: 'build',
  DEPENDENCIES: 'dependencies',
  IMPORTS: 'imports',
  RUNTIME: 'runtime',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  INTEGRATION: 'integration'
};

// ==================== DEBUG RESULTS STORAGE ====================
class DebugResults {
  constructor() {
    this.results = {
      frontend: {},
      backend: {},
      shared: {},
      integration: {},
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        warnings: 0,
        recommendations: []
      }
    };
    this.startTime = Date.now();
  }

  addResult(layer, category, result) {
    if (!this.results[layer]) {
      this.results[layer] = {};
    }
    this.results[layer][category] = result;
  }

  addIssue(layer, severity, message, details = {}) {
    if (!this.results[layer].issues) {
      this.results[layer].issues = [];
    }

    const issue = {
      id: `${layer}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      message,
      details,
      timestamp: new Date().toISOString(),
      layer
    };

    this.results[layer].issues.push(issue);

    // Update summary
    this.results.summary.totalIssues++;
    if (severity === 'critical') {
      this.results.summary.criticalIssues++;
    } else if (severity === 'warning') {
      this.results.summary.warnings++;
    }
  }

  addRecommendation(recommendation) {
    this.results.summary.recommendations.push({
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recommendation,
      timestamp: new Date().toISOString()
    });
  }

  getSummary() {
    return {
      ...this.results.summary,
      duration: Date.now() - this.startTime,
      layers: Object.keys(this.results).filter(key => key !== 'summary' && key !== 'integration')
    };
  }

  export() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-report-${timestamp}.json`;
    const filepath = path.join(CONFIG.outputPath, filename);

    if (!fs.existsSync(CONFIG.outputPath)) {
      fs.mkdirSync(CONFIG.outputPath, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    return filepath;
  }
}

// ==================== DEBUGGERS ====================
class TypeScriptDebugger {
  static async debug(layerPath, layerName, results) {
    console.log(chalk.blue(`🔍 Debugging TypeScript in ${layerName}...`));

    try {
      // Check if TypeScript is configured
      const tsConfigPath = path.join(layerPath, 'tsconfig.json');
      if (!fs.existsSync(tsConfigPath)) {
        results.addIssue(layerName, 'warning', 'No TypeScript configuration found', { path: tsConfigPath });
        return;
      }

      // Run TypeScript compiler
      const tscOutput = execSync('npx tsc --noEmit --pretty', {
        cwd: layerPath,
        encoding: 'utf8',
        timeout: CONFIG.timeoutMs
      });

      results.addResult(layerName, DEBUG_CATEGORIES.TYPESCRIPT, {
        status: 'success',
        output: tscOutput,
        issues: []
      });

    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      const issues = this.parseTypeScriptErrors(errorOutput);

      results.addResult(layerName, DEBUG_CATEGORIES.TYPESCRIPT, {
        status: 'error',
        output: errorOutput,
        issues
      });

      issues.forEach(issue => {
        results.addIssue(layerName, issue.severity, issue.message, issue.details);
      });
    }
  }

  static parseTypeScriptErrors(output) {
    const issues = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('error TS')) {
        const match = line.match(/error TS(\d+): (.+)/);
        if (match) {
          const [, code, message] = match;
          issues.push({
            severity: 'error',
            message: `TypeScript Error ${code}: ${message}`,
            details: { code, line }
          });
        }
      }
    }

    return issues;
  }
}

class BuildDebugger {
  static async debug(layerPath, layerName, results) {
    console.log(chalk.blue(`🔨 Debugging build in ${layerName}...`));

    try {
      const packageJsonPath = path.join(layerPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        results.addIssue(layerName, 'critical', 'No package.json found', { path: packageJsonPath });
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const buildScript = packageJson.scripts?.build;

      if (!buildScript) {
        results.addIssue(layerName, 'warning', 'No build script found in package.json');
        return;
      }

      const buildOutput = execSync(`npm run build`, {
        cwd: layerPath,
        encoding: 'utf8',
        timeout: CONFIG.timeoutMs
      });

      results.addResult(layerName, DEBUG_CATEGORIES.BUILD, {
        status: 'success',
        output: buildOutput,
        script: buildScript
      });

    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;

      results.addResult(layerName, DEBUG_CATEGORIES.BUILD, {
        status: 'error',
        output: errorOutput,
        script: buildScript
      });

      results.addIssue(layerName, 'critical', 'Build failed', {
        error: errorOutput,
        script: buildScript
      });
    }
  }
}

class DependenciesDebugger {
  static async debug(layerPath, layerName, results) {
    console.log(chalk.blue(`📦 Debugging dependencies in ${layerName}...`));

    try {
      const packageJsonPath = path.join(layerPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Check for missing node_modules
      const nodeModulesPath = path.join(layerPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        results.addIssue(layerName, 'critical', 'node_modules not found', { path: nodeModulesPath });
        return;
      }

      // Check for outdated packages
      const outdatedOutput = execSync('npm outdated --json', {
        cwd: layerPath,
        encoding: 'utf8',
        timeout: CONFIG.timeoutMs
      });

      const outdated = JSON.parse(outdatedOutput);

      results.addResult(layerName, DEBUG_CATEGORIES.DEPENDENCIES, {
        status: 'success',
        dependencies,
        outdated,
        nodeModulesExists: true
      });

      if (Object.keys(outdated).length > 0) {
        results.addIssue(layerName, 'warning', 'Outdated dependencies found', {
          count: Object.keys(outdated).length,
          packages: Object.keys(outdated)
        });
      }

    } catch (error) {
      results.addIssue(layerName, 'warning', 'Dependency check failed', { error: error.message });
    }
  }
}

class ImportsDebugger {
  static async debug(layerPath, layerName, results) {
    console.log(chalk.blue(`📥 Debugging imports in ${layerName}...`));

    try {
      const srcPath = path.join(layerPath, 'src');
      if (!fs.existsSync(srcPath)) {
        return;
      }

      const importIssues = [];
      const files = this.getAllFiles(srcPath, ['.ts', '.tsx', '.js', '.jsx']);

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const issues = this.checkImports(content, file, layerPath);
        importIssues.push(...issues);
      }

      results.addResult(layerName, DEBUG_CATEGORIES.IMPORTS, {
        status: importIssues.length === 0 ? 'success' : 'warning',
        filesChecked: files.length,
        issues: importIssues
      });

      importIssues.forEach(issue => {
        results.addIssue(layerName, 'warning', issue.message, issue.details);
      });

    } catch (error) {
      results.addIssue(layerName, 'error', 'Import analysis failed', { error: error.message });
    }
  }

  static getAllFiles(dir, extensions) {
    const files = [];

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  static checkImports(content, filePath, layerPath) {
    const issues = [];
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    const relativePathRegex = /^\.\.?\/|^\.\//;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Check for relative imports
      if (relativePathRegex.test(importPath)) {
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);

        // Check if file exists
        if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.ts') && !fs.existsSync(resolvedPath + '.tsx')) {
          issues.push({
            message: `Import not found: ${importPath}`,
            details: { file: filePath, importPath, resolvedPath }
          });
        }
      }

      // Check for shared package imports
      if (importPath.startsWith('aibos-shared-infrastructure')) {
        const sharedPath = path.join(CONFIG.sharedPath, 'src');
        if (!fs.existsSync(sharedPath)) {
          issues.push({
            message: `Shared package not found: ${importPath}`,
            details: { file: filePath, importPath, sharedPath }
          });
        }
      }
    }

    return issues;
  }
}

class IntegrationDebugger {
  static async debug(results) {
    console.log(chalk.blue(`🔗 Debugging cross-layer integration...`));

    try {
      // Check shared package integration
      const sharedPackagePath = path.join(CONFIG.sharedPath, 'package.json');
      if (fs.existsSync(sharedPackagePath)) {
        const sharedPackage = JSON.parse(fs.readFileSync(sharedPackagePath, 'utf8'));

        // Check if frontend and backend reference the shared package
        const frontendPackage = JSON.parse(fs.readFileSync(path.join(CONFIG.frontendPath, 'package.json'), 'utf8'));
        const backendPackage = JSON.parse(fs.readFileSync(path.join(CONFIG.backendPath, 'package.json'), 'utf8'));

        const frontendUsesShared = frontendPackage.dependencies?.[sharedPackage.name] || frontendPackage.devDependencies?.[sharedPackage.name];
        const backendUsesShared = backendPackage.dependencies?.[sharedPackage.name] || backendPackage.devDependencies?.[sharedPackage.name];

        results.addResult('integration', 'shared-package', {
          status: 'success',
          sharedPackage: sharedPackage.name,
          frontendUsesShared,
          backendUsesShared,
          version: sharedPackage.version
        });

        if (!frontendUsesShared) {
          results.addIssue('integration', 'warning', 'Frontend does not reference shared package');
        }

        if (!backendUsesShared) {
          results.addIssue('integration', 'warning', 'Backend does not reference shared package');
        }
      }

      // Check API compatibility
      const frontendApiCalls = this.findApiCalls(CONFIG.frontendPath);
      const backendApiEndpoints = this.findApiEndpoints(CONFIG.backendPath);

      results.addResult('integration', 'api-compatibility', {
        status: 'success',
        frontendApiCalls,
        backendApiEndpoints
      });

    } catch (error) {
      results.addIssue('integration', 'error', 'Integration analysis failed', { error: error.message });
    }
  }

  static findApiCalls(frontendPath) {
    const apiCalls = [];
    const files = this.getAllFiles(frontendPath, ['.ts', '.tsx', '.js', '.jsx']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
      const axiosRegex = /axios\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;

      let match;
      while ((match = fetchRegex.exec(content)) !== null) {
        apiCalls.push({ type: 'fetch', url: match[1], file });
      }

      while ((match = axiosRegex.exec(content)) !== null) {
        apiCalls.push({ type: 'axios', method: match[1], url: match[2], file });
      }
    }

    return apiCalls;
  }

  static findApiEndpoints(backendPath) {
    const endpoints = [];
    const files = this.getAllFiles(backendPath, ['.ts', '.js']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const routeRegex = /router\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;

      let match;
      while ((match = routeRegex.exec(content)) !== null) {
        endpoints.push({ method: match[1], path: match[2], file });
      }
    }

    return endpoints;
  }

  static getAllFiles(dir, extensions) {
    const files = [];

    function traverse(currentDir) {
      if (!fs.existsSync(currentDir)) return;

      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }
}

// ==================== MAIN DEBUG SYSTEM ====================
class ComprehensiveDebugSystem {
  constructor() {
    this.results = new DebugResults();
  }

  async run() {
    console.log(chalk.green.bold('🚀 AI-BOS Comprehensive Debug System Starting...'));
    console.log(chalk.gray('Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."'));
    console.log('');

    const startTime = Date.now();

    try {
      // Run concurrent debugging for each layer
      await Promise.all([
        this.debugLayer('frontend', CONFIG.frontendPath),
        this.debugLayer('backend', CONFIG.backendPath),
        this.debugLayer('shared', CONFIG.sharedPath)
      ]);

      // Run integration debugging
      await IntegrationDebugger.debug(this.results);

      // Generate recommendations
      this.generateRecommendations();

      // Export results
      const reportPath = this.results.export();

      // Display summary
      this.displaySummary();

      console.log(chalk.green.bold(`\n✅ Debug completed in ${Date.now() - startTime}ms`));
      console.log(chalk.blue(`📄 Full report saved to: ${reportPath}`));

    } catch (error) {
      console.error(chalk.red.bold('❌ Debug system failed:'), error.message);
      process.exit(1);
    }
  }

  async debugLayer(layerName, layerPath) {
    console.log(chalk.yellow(`\n🔍 Debugging ${layerName.toUpperCase()} layer...`));

    if (!fs.existsSync(layerPath)) {
      this.results.addIssue(layerName, 'critical', `Layer path not found: ${layerPath}`);
      return;
    }

    // Run all debuggers for this layer
    await Promise.all([
      TypeScriptDebugger.debug(layerPath, layerName, this.results),
      BuildDebugger.debug(layerPath, layerName, this.results),
      DependenciesDebugger.debug(layerPath, layerName, this.results),
      ImportsDebugger.debug(layerPath, layerName, this.results)
    ]);
  }

  generateRecommendations() {
    const summary = this.results.getSummary();

    if (summary.criticalIssues > 0) {
      this.results.addRecommendation('Fix critical issues before proceeding with development');
    }

    if (summary.warnings > 5) {
      this.results.addRecommendation('Address warnings to improve code quality');
    }

    // Check for specific patterns
    const allIssues = Object.values(this.results.results)
      .filter(layer => layer.issues)
      .flatMap(layer => layer.issues);

    const importIssues = allIssues.filter(issue => issue.message.includes('Import'));
    if (importIssues.length > 0) {
      this.results.addRecommendation('Review and fix import issues to ensure proper module resolution');
    }

    const buildIssues = allIssues.filter(issue => issue.message.includes('Build'));
    if (buildIssues.length > 0) {
      this.results.addRecommendation('Resolve build issues to ensure deployment readiness');
    }
  }

  displaySummary() {
    const summary = this.results.getSummary();

    console.log(chalk.cyan.bold('\n📊 DEBUG SUMMARY'));
    console.log(chalk.cyan('═'.repeat(50)));

    console.log(chalk.white(`Total Issues: ${summary.totalIssues}`));
    console.log(chalk.red(`Critical Issues: ${summary.criticalIssues}`));
    console.log(chalk.yellow(`Warnings: ${summary.warnings}`));
    console.log(chalk.gray(`Duration: ${summary.duration}ms`));

    if (summary.recommendations.length > 0) {
      console.log(chalk.green.bold('\n💡 RECOMMENDATIONS:'));
      summary.recommendations.forEach((rec, index) => {
        console.log(chalk.green(`${index + 1}. ${rec.recommendation}`));
      });
    }

    // Display layer-specific issues
    summary.layers.forEach(layer => {
      const layerIssues = this.results.results[layer].issues || [];
      if (layerIssues.length > 0) {
        console.log(chalk.yellow(`\n🔍 ${layer.toUpperCase()} ISSUES:`));
        layerIssues.slice(0, 3).forEach(issue => {
          const color = issue.severity === 'critical' ? chalk.red : chalk.yellow;
          console.log(color(`  • ${issue.message}`));
        });
        if (layerIssues.length > 3) {
          console.log(chalk.gray(`  ... and ${layerIssues.length - 3} more issues`));
        }
      }
    });
  }
}

// ==================== CLI INTERFACE ====================
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.cyan.bold('AI-BOS Comprehensive Debug System'));
    console.log('');
    console.log(chalk.white('Usage: node comprehensive-debug-system.js [options]'));
    console.log('');
    console.log(chalk.yellow('Options:'));
    console.log(chalk.white('  --help, -h     Show this help message'));
    console.log(chalk.white('  --quick        Run quick diagnostic (skip detailed analysis)'));
    console.log(chalk.white('  --verbose      Show detailed output'));
    console.log('');
    console.log(chalk.gray('This system provides concurrent debugging across:'));
    console.log(chalk.gray('  • Frontend (Next.js/React)'));
    console.log(chalk.gray('  • Backend (Node.js/Express)'));
    console.log(chalk.gray('  • Shared NPM Package'));
    console.log(chalk.gray('  • Cross-layer Integration'));
    return;
  }

  const debugSystem = new ComprehensiveDebugSystem();
  await debugSystem.run();
}

// ==================== EXECUTION ====================
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = {
  ComprehensiveDebugSystem,
  DebugResults,
  TypeScriptDebugger,
  BuildDebugger,
  DependenciesDebugger,
  ImportsDebugger,
  IntegrationDebugger
};
