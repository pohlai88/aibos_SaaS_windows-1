#!/usr/bin/env node

/**
 * 🧠 AI-BOS Build Analysis Script
 * Analyzes bundle size, performance, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      bundleSizes: {},
      performance: {},
      recommendations: [],
      issues: []
    };
  }

  async analyzeBuild() {
    console.log('🔍 Starting build analysis...');

    try {
      // Analyze frontend build
      await this.analyzeFrontendBuild();

      // Analyze backend build
      await this.analyzeBackendBuild();

      // Generate performance report
      await this.generatePerformanceReport();

      // Save analysis results
      await this.saveAnalysis();

      this.printSummary();

    } catch (error) {
      console.error('❌ Build analysis failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeFrontendBuild() {
    console.log('📊 Analyzing frontend build...');

    try {
      // Run Next.js build with analysis
      process.env.ANALYZE = 'true';
      execSync('cd railway-1/frontend && npm run build', { stdio: 'pipe' });

      // Analyze bundle stats
      const statsPath = path.join(__dirname, '../railway-1/frontend/.next/analyze/client.html');
      if (fs.existsSync(statsPath)) {
        this.analysis.bundleSizes.frontend = await this.parseBundleStats(statsPath);
      }

      // Check for common issues
      await this.checkFrontendIssues();

    } catch (error) {
      this.analysis.issues.push({
        type: 'frontend_build',
        error: error.message
      });
    }
  }

  async analyzeBackendBuild() {
    console.log('📊 Analyzing backend build...');

    try {
      // Run backend build
      execSync('cd railway-1/backend && npm run build', { stdio: 'pipe' });

      // Analyze dist folder
      const distPath = path.join(__dirname, '../railway-1/backend/dist');
      if (fs.existsSync(distPath)) {
        this.analysis.bundleSizes.backend = await this.analyzeDistFolder(distPath);
      }

      // Check for common issues
      await this.checkBackendIssues();

    } catch (error) {
      this.analysis.issues.push({
        type: 'backend_build',
        error: error.message
      });
    }
  }

  async parseBundleStats(statsPath) {
    // Parse bundle analysis HTML to extract sizes
    const content = fs.readFileSync(statsPath, 'utf-8');

    // Extract bundle information (simplified parsing)
    const bundleInfo = {
      totalSize: 0,
      chunks: [],
      modules: []
    };

    // This is a simplified parser - in production you'd use a proper HTML parser
    const sizeMatches = content.match(/size:\s*([\d.]+)\s*([KMGT]?B)/g);
    if (sizeMatches) {
      sizeMatches.forEach(match => {
        const size = parseFloat(match.match(/[\d.]+/)[0]);
        const unit = match.match(/[KMGT]?B/)[0];
        bundleInfo.totalSize += this.convertToBytes(size, unit);
      });
    }

    return bundleInfo;
  }

  async analyzeDistFolder(distPath) {
    const stats = {
      totalSize: 0,
      files: [],
      largestFiles: []
    };

    const files = this.getAllFiles(distPath);

    for (const file of files) {
      const stat = fs.statSync(file);
      const relativePath = path.relative(distPath, file);

      stats.files.push({
        path: relativePath,
        size: stat.size,
        sizeFormatted: this.formatBytes(stat.size)
      });

      stats.totalSize += stat.size;
    }

    // Sort by size to find largest files
    stats.largestFiles = stats.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    return stats;
  }

  getAllFiles(dirPath) {
    const files = [];

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  async checkFrontendIssues() {
    const issues = [];

    // Check bundle size thresholds
    if (this.analysis.bundleSizes.frontend?.totalSize > 5 * 1024 * 1024) { // 5MB
      issues.push({
        type: 'large_bundle',
        severity: 'high',
        message: 'Frontend bundle size exceeds 5MB threshold',
        recommendation: 'Implement code splitting and lazy loading'
      });
    }

    // Check for common performance issues
    const commonIssues = [
      'large_images',
      'unused_dependencies',
      'duplicate_modules',
      'inefficient_imports'
    ];

    for (const issue of commonIssues) {
      issues.push({
        type: issue,
        severity: 'medium',
        message: `Potential ${issue.replace('_', ' ')} detected`,
        recommendation: `Review and optimize ${issue.replace('_', ' ')}`
      });
    }

    this.analysis.issues.push(...issues);
  }

  async checkBackendIssues() {
    const issues = [];

    // Check backend bundle size
    if (this.analysis.bundleSizes.backend?.totalSize > 50 * 1024 * 1024) { // 50MB
      issues.push({
        type: 'large_backend_bundle',
        severity: 'high',
        message: 'Backend bundle size exceeds 50MB threshold',
        recommendation: 'Review dependencies and optimize imports'
      });
    }

    // Check for TypeScript issues
    try {
      execSync('cd railway-1/backend && npm run type-check', { stdio: 'pipe' });
    } catch (error) {
      issues.push({
        type: 'typescript_errors',
        severity: 'critical',
        message: 'TypeScript compilation errors detected',
        recommendation: 'Fix all TypeScript errors before deployment'
      });
    }

    this.analysis.issues.push(...issues);
  }

  async generatePerformanceReport() {
    console.log('📈 Generating performance report...');

    // Calculate performance metrics
    this.analysis.performance = {
      frontendBundleSize: this.analysis.bundleSizes.frontend?.totalSize || 0,
      backendBundleSize: this.analysis.bundleSizes.backend?.totalSize || 0,
      totalBundleSize: (this.analysis.bundleSizes.frontend?.totalSize || 0) +
                      (this.analysis.bundleSizes.backend?.totalSize || 0),
      criticalIssues: this.analysis.issues.filter(i => i.severity === 'critical').length,
      highIssues: this.analysis.issues.filter(i => i.severity === 'high').length,
      mediumIssues: this.analysis.issues.filter(i => i.severity === 'medium').length
    };

    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    if (this.analysis.performance.frontendBundleSize > 2 * 1024 * 1024) {
      recommendations.push({
        priority: 'high',
        category: 'bundle_optimization',
        title: 'Optimize Frontend Bundle Size',
        description: 'Implement code splitting, lazy loading, and tree shaking',
        actions: [
          'Use dynamic imports for route-based code splitting',
          'Implement lazy loading for heavy components',
          'Remove unused dependencies',
          'Optimize images and assets'
        ]
      });
    }

    // Performance recommendations
    if (this.analysis.performance.criticalIssues > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'build_quality',
        title: 'Fix Critical Build Issues',
        description: 'Resolve all critical issues before deployment',
        actions: [
          'Fix TypeScript compilation errors',
          'Resolve dependency conflicts',
          'Address security vulnerabilities'
        ]
      });
    }

    // General optimization recommendations
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Implement Performance Monitoring',
      description: 'Add comprehensive performance monitoring',
      actions: [
        'Set up bundle size monitoring',
        'Implement performance budgets',
        'Add build time tracking',
        'Monitor runtime performance'
      ]
    });

    this.analysis.recommendations = recommendations;
  }

  async saveAnalysis() {
    const reportPath = 'BUILD_ANALYSIS.json';
    const markdownPath = 'BUILD_ANALYSIS.md';

    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
    console.log(`✅ Build analysis saved to: ${reportPath}`);

    // Generate markdown report
    await this.generateMarkdownReport(markdownPath);
  }

  async generateMarkdownReport(outputPath) {
    const markdown = `# 🧠 AI-BOS Build Analysis Report

**Generated**: ${this.analysis.timestamp}

## 📊 Performance Summary

- **Frontend Bundle Size**: ${this.formatBytes(this.analysis.performance.frontendBundleSize)}
- **Backend Bundle Size**: ${this.formatBytes(this.analysis.performance.backendBundleSize)}
- **Total Bundle Size**: ${this.formatBytes(this.analysis.performance.totalBundleSize)}
- **Critical Issues**: ${this.analysis.performance.criticalIssues}
- **High Priority Issues**: ${this.analysis.performance.highIssues}
- **Medium Priority Issues**: ${this.analysis.performance.mediumIssues}

## 🚨 Issues Found

${this.analysis.issues.map(issue =>
  `### ${issue.severity.toUpperCase()}: ${issue.type}
  - **Message**: ${issue.message}
  - **Recommendation**: ${issue.recommendation}
`).join('\n')}

## 💡 Recommendations

${this.analysis.recommendations.map(rec =>
  `### ${rec.priority.toUpperCase()}: ${rec.title}
  - **Category**: ${rec.category}
  - **Description**: ${rec.description}
  - **Actions**:
${rec.actions.map(action => `    - ${action}`).join('\n')}
`).join('\n')}

## 📈 Bundle Analysis

### Frontend Bundle
${this.analysis.bundleSizes.frontend ?
  `- **Total Size**: ${this.formatBytes(this.analysis.bundleSizes.frontend.totalSize)}
- **Chunks**: ${this.analysis.bundleSizes.frontend.chunks.length}
- **Modules**: ${this.analysis.bundleSizes.frontend.modules.length}` :
  '- No frontend bundle data available'}

### Backend Bundle
${this.analysis.bundleSizes.backend ?
  `- **Total Size**: ${this.formatBytes(this.analysis.bundleSizes.backend.totalSize)}
- **Files**: ${this.analysis.bundleSizes.backend.files.length}
- **Largest Files**:
${this.analysis.bundleSizes.backend.largestFiles.slice(0, 5).map(file =>
  `  - ${file.path}: ${file.sizeFormatted}`).join('\n')}` :
  '- No backend bundle data available'}

## 🎯 Next Steps

1. **Immediate Actions**:
   - Fix all critical issues
   - Address high-priority recommendations
   - Implement bundle size monitoring

2. **Optimization Actions**:
   - Implement code splitting
   - Add lazy loading
   - Optimize dependencies

3. **Monitoring Actions**:
   - Set up performance budgets
   - Add build time tracking
   - Monitor runtime performance
`;

    fs.writeFileSync(outputPath, markdown);
    console.log(`✅ Markdown report saved to: ${outputPath}`);
  }

  printSummary() {
    console.log('\n📊 Build Analysis Summary');
    console.log('=========================');
    console.log(`Frontend Bundle: ${this.formatBytes(this.analysis.performance.frontendBundleSize)}`);
    console.log(`Backend Bundle: ${this.formatBytes(this.analysis.performance.backendBundleSize)}`);
    console.log(`Total Size: ${this.formatBytes(this.analysis.performance.totalBundleSize)}`);
    console.log(`Issues: ${this.analysis.issues.length} (${this.analysis.performance.criticalIssues} critical)`);
    console.log(`Recommendations: ${this.analysis.recommendations.length}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Review BUILD_ANALYSIS.md for detailed recommendations');
    console.log('2. Fix critical issues immediately');
    console.log('3. Implement high-priority optimizations');
    console.log('4. Set up continuous monitoring');
  }

  convertToBytes(size, unit) {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    return size * (units[unit] || 1);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

async function main() {
  const analyzer = new BuildAnalyzer();

  try {
    await analyzer.analyzeBuild();
  } catch (error) {
    console.error('❌ Build analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BuildAnalyzer;
