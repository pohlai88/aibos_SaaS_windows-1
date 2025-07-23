const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Proactive Monitor - Steve Jobs Excellence
class ProactiveMonitor {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.publicDir = path.join(this.projectRoot, 'public');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  async runFullScan() {
    console.log('🔍 PROACTIVE MONITOR - STEVE JOBS EXCELLENCE');
    console.log('=' .repeat(60));
    console.log('🎯 Preventing problems before they appear...\n');

    await this.scanAssets();
    await this.scanPerformance();
    await this.scanAccessibility();
    await this.scanCodeQuality();

    this.generateReport();
  }

  async scanAssets() {
    console.log('📁 SCANNING ASSETS...');

    const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
      cwd: this.srcDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    const imagePatterns = [
      /['"`](\/[^'"`]*\.(jpg|jpeg|png|gif|svg|webp))['"`]/g,
      /url\(['"`]?(\/[^'"`]*\.(jpg|jpeg|png|gif|svg|webp))['"`]?\)/g,
      /backgroundImage:\s*['"`](\/[^'"`]*\.(jpg|jpeg|png|gif|svg|webp))['"`]/g
    ];

    const missingAssets = [];
    const foundAssets = [];

    for (const file of files) {
      const filePath = path.join(this.srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      for (const pattern of imagePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const imagePath = match[1];
          const fullPath = path.join(this.publicDir, imagePath);

          if (fs.existsSync(fullPath)) {
            foundAssets.push({ path: imagePath, source: file });
          } else {
            missingAssets.push({ path: imagePath, source: file });
          }
        }
      }
    }

    if (missingAssets.length > 0) {
      this.issues.push(`❌ ${missingAssets.length} missing assets detected`);
      missingAssets.forEach(asset => {
        this.warnings.push(`   Missing: ${asset.path} (referenced in ${asset.source})`);
      });
    } else {
      this.successes.push('✅ All assets present');
    }

    this.successes.push(`✅ ${foundAssets.length} assets found`);
  }

  async scanPerformance() {
    console.log('⚡ SCANNING PERFORMANCE...');

    // Check for useEffect issues
    const files = glob.sync('**/*.{ts,tsx}', {
      cwd: this.srcDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    let useEffectIssues = 0;
    let totalUseEffects = 0;

    for (const file of files) {
      const filePath = path.join(this.srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Count useEffect hooks
      const useEffectMatches = content.match(/useEffect\(/g);
      if (useEffectMatches) {
        totalUseEffects += useEffectMatches.length;
      }

      // Check for potential infinite loops
      const infiniteLoopPatterns = [
        /useEffect\([^)]*\)\s*{\s*[^}]*setState[^}]*}\s*,\s*\[\s*\]/g,
        /useEffect\([^)]*\)\s*{\s*[^}]*setState[^}]*}\s*,\s*\[[^\]]*\]/g
      ];

      for (const pattern of infiniteLoopPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          useEffectIssues += matches.length;
          this.warnings.push(`   Potential infinite loop in ${file}`);
        }
      }
    }

    if (useEffectIssues > 0) {
      this.issues.push(`❌ ${useEffectIssues} potential performance issues detected`);
    } else {
      this.successes.push('✅ No performance issues detected');
    }

    this.successes.push(`✅ ${totalUseEffects} useEffect hooks analyzed`);
  }

  async scanAccessibility() {
    console.log('♿ SCANNING ACCESSIBILITY...');

    const files = glob.sync('**/*.{ts,tsx}', {
      cwd: this.srcDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    let accessibilityIssues = 0;
    let totalInputs = 0;

    for (const file of files) {
      const filePath = path.join(this.srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Count input elements
      const inputMatches = content.match(/<input/g);
      if (inputMatches) {
        totalInputs += inputMatches.length;
      }

      // Check for missing accessibility attributes
      const accessibilityPatterns = [
        /<input[^>]*(?!.*(?:id=|name=))[^>]*>/g,
        /<button[^>]*(?!.*(?:aria-label|aria-labelledby))[^>]*>/g,
        /<img[^>]*(?!.*(?:alt=|aria-label))[^>]*>/g
      ];

      for (const pattern of accessibilityPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          accessibilityIssues += matches.length;
          this.warnings.push(`   Accessibility issue in ${file}`);
        }
      }
    }

    if (accessibilityIssues > 0) {
      this.issues.push(`❌ ${accessibilityIssues} accessibility issues detected`);
    } else {
      this.successes.push('✅ No accessibility issues detected');
    }

    this.successes.push(`✅ ${totalInputs} input elements analyzed`);
  }

  async scanCodeQuality() {
    console.log('🔧 SCANNING CODE QUALITY...');

    const files = glob.sync('**/*.{ts,tsx}', {
      cwd: this.srcDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    let qualityIssues = 0;
    let totalFiles = files.length;

    for (const file of files) {
      const filePath = path.join(this.srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for common issues
      const qualityPatterns = [
        /console\.log\(/g,
        /TODO:/g,
        /FIXME:/g,
        /@ts-ignore/g
      ];

      for (const pattern of qualityPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          qualityIssues += matches.length;
          this.warnings.push(`   Code quality issue in ${file}: ${pattern.source}`);
        }
      }
    }

    if (qualityIssues > 0) {
      this.issues.push(`❌ ${qualityIssues} code quality issues detected`);
    } else {
      this.successes.push('✅ No code quality issues detected');
    }

    this.successes.push(`✅ ${totalFiles} files analyzed`);
  }

  generateReport() {
    console.log('\n📊 PROACTIVE MONITORING REPORT');
    console.log('=' .repeat(50));

    if (this.issues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.successes.length > 0) {
      console.log('\n✅ SUCCESSES:');
      this.successes.forEach(success => console.log(`   ${success}`));
    }

    const totalIssues = this.issues.length + this.warnings.length;

    if (totalIssues === 0) {
      console.log('\n🎉 PERFECT SCORE - STEVE JOBS EXCELLENCE ACHIEVED!');
      console.log('🌟 No issues detected. The codebase is ready for production!');
    } else {
      console.log(`\n📈 SUMMARY: ${totalIssues} issues found, ${this.successes.length} checks passed`);
      console.log('🔧 Consider running the asset generator to fix missing assets.');
    }

    console.log('\n🎯 Proactive monitoring complete. Excellence maintained!');
  }
}

// Run the monitor
async function runProactiveMonitor() {
  const monitor = new ProactiveMonitor();
  await monitor.runFullScan();
}

// Check if glob is available
try {
  require('glob');
  runProactiveMonitor();
} catch (error) {
  console.log('📦 Installing required dependency...');
  const { execSync } = require('child_process');
  execSync('npm install glob', { cwd: path.join(__dirname, '..') });
  runProactiveMonitor();
}
