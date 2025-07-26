#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
  constructor() {
    this.workspaces = ['railway-1/frontend', 'railway-1/backend', 'shared'];
    this.analysisResults = {
      unusedDeps: new Set(),
      duplicateDeps: new Map(),
      outdatedDeps: new Map(),
      securityIssues: new Map(),
      recommendations: []
    };
  }

  async analyzeAllWorkspaces() {
    console.log('🔍 Starting Comprehensive Dependency Analysis...');

    for (const workspace of this.workspaces) {
      console.log(`\n📁 Analyzing ${workspace}...`);
      await this.analyzeWorkspace(workspace);
    }

    this.generateOptimizationReport();
  }

  async analyzeWorkspace(workspacePath) {
    const packageJsonPath = path.join(workspacePath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.log(`  ⚠️  No package.json found in ${workspacePath}`);
      return;
    }

    try {
      // Analyze unused dependencies
      await this.analyzeUnusedDependencies(workspacePath);

      // Analyze duplicate dependencies
      await this.analyzeDuplicateDependencies(workspacePath);

      // Check for outdated dependencies
      await this.analyzeOutdatedDependencies(workspacePath);

      // Check for security issues
      await this.analyzeSecurityIssues(workspacePath);

    } catch (error) {
      console.error(`  ❌ Error analyzing ${workspacePath}:`, error.message);
    }
  }

  async analyzeUnusedDependencies(workspacePath) {
    try {
      console.log('  🔍 Checking unused dependencies...');

      const result = execSync(`cd ${workspacePath} && npx depcheck --json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const analysis = JSON.parse(result);

      if (analysis.dependencies && analysis.dependencies.length > 0) {
        analysis.dependencies.forEach(dep => {
          this.analysisResults.unusedDeps.add(`${workspacePath}:${dep}`);
        });
        console.log(`    Found ${analysis.dependencies.length} unused dependencies`);
      }

    } catch (error) {
      console.log('    ⚠️  Could not analyze unused dependencies');
    }
  }

  async analyzeDuplicateDependencies(workspacePath) {
    try {
      console.log('  🔍 Checking duplicate dependencies...');

      const packageJson = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const depVersions = new Map();

      for (const [dep, version] of Object.entries(allDeps)) {
        if (depVersions.has(dep)) {
          const existingVersion = depVersions.get(dep);
          if (existingVersion !== version) {
            this.analysisResults.duplicateDeps.set(dep, {
              workspace: workspacePath,
              versions: [existingVersion, version]
            });
          }
        } else {
          depVersions.set(dep, version);
        }
      }

    } catch (error) {
      console.log('    ⚠️  Could not analyze duplicate dependencies');
    }
  }

  async analyzeOutdatedDependencies(workspacePath) {
    try {
      console.log('  🔍 Checking outdated dependencies...');

      const result = execSync(`cd ${workspacePath} && npm outdated --json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const outdated = JSON.parse(result);

      for (const [dep, info] of Object.entries(outdated)) {
        this.analysisResults.outdatedDeps.set(`${workspacePath}:${dep}`, {
          current: info.current,
          wanted: info.wanted,
          latest: info.latest
        });
      }

    } catch (error) {
      // npm outdated returns non-zero exit code when there are outdated deps
      if (error.status === 1) {
        try {
          const result = execSync(`cd ${workspacePath} && npm outdated --json 2>/dev/null`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });

          const outdated = JSON.parse(result);

          for (const [dep, info] of Object.entries(outdated)) {
            this.analysisResults.outdatedDeps.set(`${workspacePath}:${dep}`, {
              current: info.current,
              wanted: info.wanted,
              latest: info.latest
            });
          }
        } catch (parseError) {
          console.log('    ⚠️  Could not parse outdated dependencies');
        }
      }
    }
  }

  async analyzeSecurityIssues(workspacePath) {
    try {
      console.log('  🔍 Checking security issues...');

      const result = execSync(`cd ${workspacePath} && npm audit --json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const audit = JSON.parse(result);

      if (audit.vulnerabilities) {
        for (const [dep, vuln] of Object.entries(audit.vulnerabilities)) {
          this.analysisResults.securityIssues.set(`${workspacePath}:${dep}`, {
            severity: vuln.severity,
            title: vuln.title,
            recommendation: vuln.recommendation
          });
        }
      }

    } catch (error) {
      console.log('    ⚠️  Could not analyze security issues');
    }
  }

  generateOptimizationReport() {
    console.log('\n📊 Dependency Analysis Report');
    console.log('==============================');

    // Unused dependencies
    if (this.analysisResults.unusedDeps.size > 0) {
      console.log(`\n🗑️  Unused Dependencies (${this.analysisResults.unusedDeps.size}):`);
      this.analysisResults.unusedDeps.forEach(dep => {
        console.log(`  - ${dep}`);
      });
      this.analysisResults.recommendations.push('Remove unused dependencies to reduce bundle size');
    }

    // Duplicate dependencies
    if (this.analysisResults.duplicateDeps.size > 0) {
      console.log(`\n🔄 Duplicate Dependencies (${this.analysisResults.duplicateDeps.size}):`);
      this.analysisResults.duplicateDeps.forEach((info, dep) => {
        console.log(`  - ${dep}: ${info.versions.join(' vs ')}`);
      });
      this.analysisResults.recommendations.push('Consolidate duplicate dependencies to single versions');
    }

    // Outdated dependencies
    if (this.analysisResults.outdatedDeps.size > 0) {
      console.log(`\n📦 Outdated Dependencies (${this.analysisResults.outdatedDeps.size}):`);
      this.analysisResults.outdatedDeps.forEach((info, dep) => {
        console.log(`  - ${dep}: ${info.current} → ${info.latest}`);
      });
      this.analysisResults.recommendations.push('Update outdated dependencies for security and performance');
    }

    // Security issues
    if (this.analysisResults.securityIssues.size > 0) {
      console.log(`\n🔒 Security Issues (${this.analysisResults.securityIssues.size}):`);
      this.analysisResults.securityIssues.forEach((info, dep) => {
        console.log(`  - ${dep}: ${info.severity} - ${info.title}`);
      });
      this.analysisResults.recommendations.push('Fix security vulnerabilities immediately');
    }

    // Recommendations
    if (this.analysisResults.recommendations.length > 0) {
      console.log(`\n💡 Optimization Recommendations:`);
      this.analysisResults.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    // Summary
    const totalIssues = this.analysisResults.unusedDeps.size +
                       this.analysisResults.duplicateDeps.size +
                       this.analysisResults.outdatedDeps.size +
                       this.analysisResults.securityIssues.size;

    console.log(`\n📈 Summary:`);
    console.log(`  Total Issues Found: ${totalIssues}`);
    console.log(`  Estimated Bundle Size Reduction: ${this.analysisResults.unusedDeps.size * 50}KB`);
    console.log(`  Security Risk Level: ${this.getSecurityRiskLevel()}`);

    this.saveReportToFile();
  }

  getSecurityRiskLevel() {
    const criticalIssues = Array.from(this.analysisResults.securityIssues.values())
      .filter(issue => issue.severity === 'critical').length;

    const highIssues = Array.from(this.analysisResults.securityIssues.values())
      .filter(issue => issue.severity === 'high').length;

    if (criticalIssues > 0) return '🔴 CRITICAL';
    if (highIssues > 0) return '🟡 HIGH';
    if (this.analysisResults.securityIssues.size > 0) return '🟠 MEDIUM';
    return '🟢 LOW';
  }

  saveReportToFile() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.analysisResults.unusedDeps.size +
                    this.analysisResults.duplicateDeps.size +
                    this.analysisResults.outdatedDeps.size +
                    this.analysisResults.securityIssues.size,
        unusedDeps: this.analysisResults.unusedDeps.size,
        duplicateDeps: this.analysisResults.duplicateDeps.size,
        outdatedDeps: this.analysisResults.outdatedDeps.size,
        securityIssues: this.analysisResults.securityIssues.size
      },
      details: {
        unusedDeps: Array.from(this.analysisResults.unusedDeps),
        duplicateDeps: Object.fromEntries(this.analysisResults.duplicateDeps),
        outdatedDeps: Object.fromEntries(this.analysisResults.outdatedDeps),
        securityIssues: Object.fromEntries(this.analysisResults.securityIssues)
      },
      recommendations: this.analysisResults.recommendations
    };

    fs.writeFileSync('dependency-analysis-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Report saved to dependency-analysis-report.json');
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new DependencyAnalyzer();
  analyzer.analyzeAllWorkspaces();
}

module.exports = DependencyAnalyzer;
