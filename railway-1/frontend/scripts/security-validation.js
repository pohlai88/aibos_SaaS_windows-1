#!/usr/bin/env node

/**
 * Security Validation Script for Phase 4.3
 * Comprehensive security audit and validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security validation results
const securityResults = {
  phase: '4.3',
  timestamp: new Date().toISOString(),
  summary: {
    totalVulnerabilities: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    productionVulnerabilities: 0,
    developmentVulnerabilities: 0
  },
  vulnerabilities: [],
  recommendations: [],
  securityScore: 0
};

// Security validation functions
function runSecurityAudit() {
  console.log('🔍 Running security audit...');

  try {
    // Run npm audit and capture output
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);

    // Parse vulnerabilities
    if (auditData.vulnerabilities) {
      Object.entries(auditData.vulnerabilities).forEach(([packageName, vuln]) => {
        const severity = vuln.severity || 'unknown';
        const isDevDependency = vuln.dev || false;

        securityResults.vulnerabilities.push({
          package: packageName,
          severity: severity,
          title: vuln.title || 'Unknown vulnerability',
          description: vuln.description || 'No description available',
          isDevDependency: isDevDependency,
          via: vuln.via || [],
          fixAvailable: vuln.fixAvailable || false
        });

        // Update summary
        securityResults.summary.totalVulnerabilities++;
        securityResults.summary[severity]++;

        if (isDevDependency) {
          securityResults.summary.developmentVulnerabilities++;
        } else {
          securityResults.summary.productionVulnerabilities++;
        }
      });
    }

    console.log(`✅ Security audit completed. Found ${securityResults.summary.totalVulnerabilities} vulnerabilities.`);

  } catch (error) {
    console.log('⚠️ Security audit failed, analyzing package.json manually...');
    analyzePackageSecurity();
  }
}

function analyzePackageSecurity() {
  console.log('📦 Analyzing package.json for security...');

  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Check for known vulnerable packages
  const knownVulnerablePackages = [
    'esbuild',
    'vite',
    'vitest',
    'vite-node'
  ];

  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  knownVulnerablePackages.forEach(pkg => {
    if (allDependencies[pkg]) {
      const isDev = packageJson.devDependencies && packageJson.devDependencies[pkg];

      securityResults.vulnerabilities.push({
        package: pkg,
        severity: 'moderate',
        title: 'Known vulnerability in development dependency',
        description: `${pkg} may have security vulnerabilities`,
        isDevDependency: isDev,
        via: [],
        fixAvailable: true
      });

      securityResults.summary.totalVulnerabilities++;
      securityResults.summary.moderate++;

      if (isDev) {
        securityResults.summary.developmentVulnerabilities++;
      } else {
        securityResults.summary.productionVulnerabilities++;
      }
    }
  });
}

function validateSecurityScripts() {
  console.log('🔧 Validating security scripts...');

  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredScripts = [
    'security:audit',
    'security:fix',
    'security:monitor'
  ];

  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

  if (missingScripts.length > 0) {
    securityResults.recommendations.push({
      type: 'missing_scripts',
      description: `Missing security scripts: ${missingScripts.join(', ')}`,
      priority: 'high'
    });
  } else {
    console.log('✅ All required security scripts present');
  }
}

function checkSecurityHeaders() {
  console.log('🛡️ Checking security headers configuration...');

  const nextConfigPath = path.join(__dirname, '../next.config.js');

  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Content-Security-Policy'
    ];

    const missingHeaders = securityHeaders.filter(header => !nextConfig.includes(header));

    if (missingHeaders.length > 0) {
      securityResults.recommendations.push({
        type: 'missing_headers',
        description: `Missing security headers: ${missingHeaders.join(', ')}`,
        priority: 'medium'
      });
    } else {
      console.log('✅ Security headers configured');
    }
  }
}

function checkEnvironmentSecurity() {
  console.log('🔐 Checking environment security...');

  const envExamplePath = path.join(__dirname, '../env.example');

  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');

    // Check for sensitive environment variables
    const sensitiveVars = [
      'API_KEY',
      'SECRET',
      'PASSWORD',
      'TOKEN',
      'PRIVATE_KEY'
    ];

    const foundSensitiveVars = sensitiveVars.filter(varName => envExample.includes(varName));

    if (foundSensitiveVars.length > 0) {
      securityResults.recommendations.push({
        type: 'sensitive_vars',
        description: `Sensitive environment variables found: ${foundSensitiveVars.join(', ')}`,
        priority: 'high'
      });
    } else {
      console.log('✅ No sensitive environment variables exposed');
    }
  }
}

function calculateSecurityScore() {
  let score = 100;

  // Deduct points for vulnerabilities
  score -= securityResults.summary.critical * 20;
  score -= securityResults.summary.high * 10;
  score -= securityResults.summary.moderate * 5;
  score -= securityResults.summary.low * 2;

  // Deduct points for production vulnerabilities
  score -= securityResults.summary.productionVulnerabilities * 15;

  // Deduct points for missing security measures
  securityResults.recommendations.forEach(rec => {
    if (rec.priority === 'high') score -= 10;
    else if (rec.priority === 'medium') score -= 5;
    else score -= 2;
  });

  securityResults.securityScore = Math.max(0, score);
}

function generateSecurityReport() {
  console.log('\n📊 Generating security report...');

  // Calculate security score
  calculateSecurityScore();

  // Generate recommendations
  if (securityResults.summary.critical > 0) {
    securityResults.recommendations.push({
      type: 'critical_vulnerabilities',
      description: `Fix ${securityResults.summary.critical} critical vulnerabilities immediately`,
      priority: 'critical'
    });
  }

  if (securityResults.summary.high > 0) {
    securityResults.recommendations.push({
      type: 'high_vulnerabilities',
      description: `Address ${securityResults.summary.high} high severity vulnerabilities`,
      priority: 'high'
    });
  }

  if (securityResults.summary.productionVulnerabilities > 0) {
    securityResults.recommendations.push({
      type: 'production_vulnerabilities',
      description: `Fix ${securityResults.summary.productionVulnerabilities} production vulnerabilities`,
      priority: 'high'
    });
  }

  // Save detailed report
  const reportPath = path.join(__dirname, '../../security-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(securityResults, null, 2));

  console.log(`📄 Security report saved to: ${reportPath}`);
}

// Run comprehensive security validation
console.log('\n🛡️ Phase 4.3 Security Validation Suite\n');
console.log('=' .repeat(60));

// Execute security validation
runSecurityAudit();
validateSecurityScripts();
checkSecurityHeaders();
checkEnvironmentSecurity();
generateSecurityReport();

// Print security summary
console.log('\n' + '='.repeat(60));
console.log('🛡️ SECURITY VALIDATION SUMMARY');
console.log('='.repeat(60));

console.log(`\nSecurity Score: ${securityResults.securityScore}/100`);

console.log(`\nVulnerability Summary:`);
console.log(`  Total: ${securityResults.summary.totalVulnerabilities}`);
console.log(`  Critical: ${securityResults.summary.critical}`);
console.log(`  High: ${securityResults.summary.high}`);
console.log(`  Moderate: ${securityResults.summary.moderate}`);
console.log(`  Low: ${securityResults.summary.low}`);

console.log(`\nEnvironment Impact:`);
console.log(`  Production: ${securityResults.summary.productionVulnerabilities}`);
console.log(`  Development: ${securityResults.summary.developmentVulnerabilities}`);

if (securityResults.recommendations.length > 0) {
  console.log(`\n🔧 Recommendations (${securityResults.recommendations.length}):`);
  securityResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
  });
}

// Grade assessment
let grade = 'F';
if (securityResults.securityScore >= 90) grade = 'A';
else if (securityResults.securityScore >= 80) grade = 'B';
else if (securityResults.securityScore >= 70) grade = 'C';
else if (securityResults.securityScore >= 60) grade = 'D';

console.log(`\n🏆 Phase 4.3 Security Grade: ${grade} (${securityResults.securityScore}/100)`);

// Exit with appropriate code
const hasCriticalIssues = securityResults.summary.critical > 0 || securityResults.summary.productionVulnerabilities > 0;
process.exit(hasCriticalIssues ? 1 : 0);
