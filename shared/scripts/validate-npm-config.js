#!/usr/bin/env node

/**
 * AI-BOS npm Configuration Validator
 * Validates enterprise .npmrc settings and provides optimization recommendations
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENTERPRISE_SETTINGS = {
  security: {
    'audit-level': 'critical',
    'engine-strict': 'true',
    'strict-peer-dependencies': 'true',
    'package-lock-only': 'true',
    'omit': 'optional',
    'strict-ssl': 'true'
  },
  dependency: {
    'save-exact': 'true',
    'save-prefix': '',
    'lockfile-version': '3',
    'legacy-peer-deps': 'false'
  },
  performance: {
    'prefer-offline': 'true',
    'prefer-dedupe': 'true',
    'maxsockets': '3',
    'fetch-retries': '2'
  },
  compliance: {
    'loglevel': 'error',
    'color': 'false',
    'unicode': 'false',
    'scripts-prepend-node-path': 'true'
  },
  ci: {
    'ci': 'true',
    'ignore-scripts': 'true',
    'foreground-scripts': 'false',
    'offline': 'false'
  }
};

class NpmConfigValidator {
  constructor() {
    this.currentConfig = {};
    this.npmrcPath = join(process.cwd(), '.npmrc');
    this.score = 0;
    this.maxScore = 0;
    this.issues = [];
    this.recommendations = [];
  }

  async run() {
    console.log('🔧 AI-BOS npm Configuration Validator');
    console.log('=' .repeat(50));

    try {
      this.loadCurrentConfig();
      this.validateSettings();
      this.calculateScore();
      this.generateReport();
      this.provideRecommendations();

    } catch (error) {
      console.error('💥 Validation failed:', error.message);
      process.exit(1);
    }
  }

  loadCurrentConfig() {
    if (!existsSync(this.npmrcPath)) {
      throw new Error('.npmrc file not found');
    }

    const npmrc = readFileSync(this.npmrcPath, 'utf8');
    const lines = npmrc.split('\n').filter(line =>
      line.trim() && !line.startsWith('#') && !line.startsWith(';')
    );

    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        this.currentConfig[key.trim()] = value.trim();
      }
    });

    console.log(`📋 Loaded ${Object.keys(this.currentConfig).length} npm settings`);
  }

  validateSettings() {
    console.log('\n🔍 Validating enterprise settings...');

    Object.entries(ENTERPRISE_SETTINGS).forEach(([category, settings]) => {
      console.log(`\n📂 ${category.toUpperCase()} Settings:`);

      Object.entries(settings).forEach(([key, expectedValue]) => {
        this.maxScore++;
        const currentValue = this.currentConfig[key];

        if (currentValue === expectedValue) {
          console.log(`  ✅ ${key}=${expectedValue}`);
          this.score++;
        } else if (currentValue !== undefined) {
          console.log(`  ⚠️  ${key}=${currentValue} (expected: ${expectedValue})`);
          this.issues.push(`${category}.${key}: expected "${expectedValue}", got "${currentValue}"`);
        } else {
          console.log(`  ❌ ${key}: missing (expected: ${expectedValue})`);
          this.issues.push(`${category}.${key}: missing, should be "${expectedValue}"`);
        }
      });
    });
  }

  calculateScore() {
    const percentage = Math.round((this.score / this.maxScore) * 100);

    console.log('\n📊 Configuration Score:');
    console.log(`   Score: ${this.score}/${this.maxScore} (${percentage}%)`);

    if (percentage >= 90) {
      console.log('   🏆 EXCELLENT - Enterprise-grade configuration');
    } else if (percentage >= 75) {
      console.log('   🥈 GOOD - Minor improvements needed');
    } else if (percentage >= 50) {
      console.log('   🥉 FAIR - Significant improvements needed');
    } else {
      console.log('   ⚠️  POOR - Major configuration issues');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      score: this.score,
      maxScore: this.maxScore,
      percentage: Math.round((this.score / this.maxScore) * 100),
      issues: this.issues,
      currentConfig: this.currentConfig,
      missingSettings: this.getMissingSettings()
    };

    const reportFile = 'npm-config-validation-report.json';
    require('fs').writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Validation report saved to ${reportFile}`);
  }

  getMissingSettings() {
    const missing = {};

    Object.entries(ENTERPRISE_SETTINGS).forEach(([category, settings]) => {
      const categoryMissing = Object.entries(settings)
        .filter(([key]) => !this.currentConfig.hasOwnProperty(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      if (Object.keys(categoryMissing).length > 0) {
        missing[category] = categoryMissing;
      }
    });

    return missing;
  }

  provideRecommendations() {
    console.log('\n💡 Recommendations:');

    if (this.issues.length === 0) {
      console.log('   ✅ Configuration is optimal!');
      return;
    }

    // Security recommendations
    const securityIssues = this.issues.filter(issue => issue.startsWith('security.'));
    if (securityIssues.length > 0) {
      console.log('\n   🔒 Security Improvements:');
      securityIssues.forEach(issue => {
        const [category, key] = issue.split('.');
        const expectedValue = ENTERPRISE_SETTINGS[category][key];
        console.log(`      Add: ${key}=${expectedValue}`);
      });
    }

    // Performance recommendations
    const perfIssues = this.issues.filter(issue => issue.startsWith('performance.'));
    if (perfIssues.length > 0) {
      console.log('\n   ⚡ Performance Improvements:');
      perfIssues.forEach(issue => {
        const [category, key] = issue.split('.');
        const expectedValue = ENTERPRISE_SETTINGS[category][key];
        console.log(`      Add: ${key}=${expectedValue}`);
      });
    }

    // CI/CD recommendations
    const ciIssues = this.issues.filter(issue => issue.startsWith('ci.'));
    if (ciIssues.length > 0) {
      console.log('\n   🚀 CI/CD Improvements:');
      ciIssues.forEach(issue => {
        const [category, key] = issue.split('.');
        const expectedValue = ENTERPRISE_SETTINGS[category][key];
        console.log(`      Add: ${key}=${expectedValue}`);
      });
    }

    console.log('\n   📝 To apply all recommendations, update your .npmrc with the missing settings above.');
  }

  // Additional validation methods
  validateCacheDirectory() {
    const cacheDir = this.currentConfig.cache;
    if (cacheDir && !cacheDir.startsWith('.')) {
      console.log('   ⚠️  Cache directory should be relative (e.g., .aibos-npm-cache)');
    }
  }

  validateNetworkSettings() {
    const timeout = parseInt(this.currentConfig['fetch-timeout'] || '0');
    if (timeout < 300000) { // 5 minutes
      console.log('   💡 Consider increasing fetch-timeout for enterprise networks');
    }
  }
}

// Run validation
const validator = new NpmConfigValidator();
validator.run().catch(error => {
  console.error('💥 Validation failed:', error);
  process.exit(1);
});
