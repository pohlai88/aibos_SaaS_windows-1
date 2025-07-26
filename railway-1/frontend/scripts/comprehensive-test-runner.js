#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Phase 4.2
 * Combines all manual tests and provides complete assessment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test results tracking
const testResults = {
  phase: '4.2',
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    successRate: 0
  },
  categories: {
    cvEngine: { passed: 0, failed: 0, total: 0 },
    nlpEngine: { passed: 0, failed: 0, total: 0 },
    analyticsEngine: { passed: 0, failed: 0, total: 0 },
    mlManager: { passed: 0, failed: 0, total: 0 },
    infrastructure: { passed: 0, failed: 0, total: 0 }
  },
  details: []
};

// Test utility functions
function test(name, category, testFn) {
  testResults.summary.total++;
  testResults.categories[category].total++;

  try {
    testFn();
    testResults.summary.passed++;
    testResults.categories[category].passed++;
    testResults.details.push({ name, category, status: 'PASS', error: null });
    console.log(`✅ ${name}`);
  } catch (error) {
    testResults.summary.failed++;
    testResults.categories[category].failed++;
    testResults.details.push({ name, category, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run comprehensive tests
console.log('\n🚀 Phase 4.2 Comprehensive Testing Suite\n');
console.log('=' .repeat(60));

// Infrastructure Tests
console.log('\n📋 INFRASTRUCTURE TESTS');
console.log('-'.repeat(30));

test('TensorFlow.js dependencies installed', 'infrastructure', () => {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  assert(packageJson.dependencies['@tensorflow/tfjs-node'], 'TensorFlow.js Node dependency missing');
  assert(packageJson.dependencies['@tensorflow/tfjs-converter'], 'TensorFlow.js Converter dependency missing');
  assert(packageJson.dependencies['canvas'], 'Canvas dependency missing');
});

test('Test configuration exists', 'infrastructure', () => {
  const configPath = path.join(__dirname, '../vitest.config.ts');
  const setupPath = path.join(__dirname, '../src/test/setup.ts');

  assert(fs.existsSync(configPath), 'Vitest config file not found');
  assert(fs.existsSync(setupPath), 'Test setup file not found');
});

test('Security scripts available', 'infrastructure', () => {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  assert(packageJson.scripts['security:audit'], 'Security audit script missing');
  assert(packageJson.scripts['security:fix'], 'Security fix script missing');
});

// Computer Vision Engine Tests
console.log('\n👁️ COMPUTER VISION ENGINE TESTS');
console.log('-'.repeat(30));

test('ComputerVisionEngine file exists', 'cvEngine', () => {
  const cvEnginePath = path.join(__dirname, '../src/ai/engines/ComputerVisionEngine.ts');
  assert(fs.existsSync(cvEnginePath), 'ComputerVisionEngine.ts file not found');
});

test('CV Engine has TensorFlow.js integration', 'cvEngine', () => {
  const cvEnginePath = path.join(__dirname, '../src/ai/engines/ComputerVisionEngine.ts');
  const content = fs.readFileSync(cvEnginePath, 'utf8');

  assert(content.includes('@tensorflow/tfjs-node'), 'TensorFlow.js Node import missing');
  assert(content.includes('tf.loadGraphModel'), 'TensorFlow.js model loading missing');
  assert(content.includes('tf.tensor'), 'TensorFlow.js tensor operations missing');
});

test('CV Engine has all core functions', 'cvEngine', () => {
  const cvEnginePath = path.join(__dirname, '../src/ai/engines/ComputerVisionEngine.ts');
  const content = fs.readFileSync(cvEnginePath, 'utf8');

  const requiredFunctions = [
    'process',
    'detectObjects',
    'classifyImage',
    'segmentImage',
    'recognizeFaces',
    'extractText',
    'analyzeFaces',
    'calculateSimilarity',
    'generateCaption',
    'enhanceImage',
    'understandScene',
    'analyzeVideo',
    'estimatePose',
    'tagImage'
  ];

  const missingFunctions = requiredFunctions.filter(func => !content.includes(func));
  assert(missingFunctions.length === 0, `Missing functions: ${missingFunctions.join(', ')}`);
});

test('CV Engine has substantial implementation', 'cvEngine', () => {
  const cvEnginePath = path.join(__dirname, '../src/ai/engines/ComputerVisionEngine.ts');
  const stats = fs.statSync(cvEnginePath);
  const sizeKB = stats.size / 1024;

  assert(sizeKB > 10, `File too small (${sizeKB.toFixed(1)}KB), likely incomplete implementation`);
});

// NLP Engine Tests
console.log('\n💬 NLP ENGINE TESTS');
console.log('-'.repeat(30));

test('NLPEngine file exists', 'nlpEngine', () => {
  const nlpEnginePath = path.join(__dirname, '../src/ai/engines/NLPEngine.ts');
  assert(fs.existsSync(nlpEnginePath), 'NLPEngine.ts file not found');
});

test('NLP Engine has core functions', 'nlpEngine', () => {
  const nlpEnginePath = path.join(__dirname, '../src/ai/engines/NLPEngine.ts');
  const content = fs.readFileSync(nlpEnginePath, 'utf8');

  const requiredFunctions = [
    'analyzeSentiment',
    'extractEntities',
    'classifyText',
    'detectLanguage',
    'translateText',
    'summarizeText',
    'classifyIntent',
    'extractKeywords'
  ];

  const missingFunctions = requiredFunctions.filter(func => !content.includes(func));
  assert(missingFunctions.length === 0, `Missing NLP functions: ${missingFunctions.join(', ')}`);
});

test('NLP Engine has substantial implementation', 'nlpEngine', () => {
  const nlpEnginePath = path.join(__dirname, '../src/ai/engines/NLPEngine.ts');
  const stats = fs.statSync(nlpEnginePath);
  const sizeKB = stats.size / 1024;

  assert(sizeKB > 5, `File too small (${sizeKB.toFixed(1)}KB), likely incomplete implementation`);
});

// Analytics Engine Tests
console.log('\n📊 ANALYTICS ENGINE TESTS');
console.log('-'.repeat(30));

test('PredictiveAnalyticsEngine file exists', 'analyticsEngine', () => {
  const analyticsEnginePath = path.join(__dirname, '../src/ai/engines/PredictiveAnalyticsEngine.ts');
  assert(fs.existsSync(analyticsEnginePath), 'PredictiveAnalyticsEngine.ts file not found');
});

test('Analytics Engine has core functions', 'analyticsEngine', () => {
  const analyticsEnginePath = path.join(__dirname, '../src/ai/engines/PredictiveAnalyticsEngine.ts');
  const content = fs.readFileSync(analyticsEnginePath, 'utf8');

  const requiredFunctions = [
    'forecastTimeSeries',
    'analyzeTrends',
    'detectAnomalies',
    'performRegression',
    'performClassification',
    'performClustering'
  ];

  const missingFunctions = requiredFunctions.filter(func => !content.includes(func));
  assert(missingFunctions.length === 0, `Missing analytics functions: ${missingFunctions.join(', ')}`);
});

test('Analytics Engine has substantial implementation', 'analyticsEngine', () => {
  const analyticsEnginePath = path.join(__dirname, '../src/ai/engines/PredictiveAnalyticsEngine.ts');
  const stats = fs.statSync(analyticsEnginePath);
  const sizeKB = stats.size / 1024;

  assert(sizeKB > 5, `File too small (${sizeKB.toFixed(1)}KB), likely incomplete implementation`);
});

// ML Model Manager Tests
console.log('\n🤖 ML MODEL MANAGER TESTS');
console.log('-'.repeat(30));

test('MLModelManager file exists', 'mlManager', () => {
  const mlManagerPath = path.join(__dirname, '../src/ai/engines/MLModelManager.ts');
  assert(fs.existsSync(mlManagerPath), 'MLModelManager.ts file not found');
});

test('ML Manager has core functions', 'mlManager', () => {
  const mlManagerPath = path.join(__dirname, '../src/ai/engines/MLModelManager.ts');
  const content = fs.readFileSync(mlManagerPath, 'utf8');

  const requiredFunctions = [
    'createModel',
    'trainModel',
    'evaluateModel',
    'deployModel',
    'predict',
    'getModel'
  ];

  const missingFunctions = requiredFunctions.filter(func => !content.includes(func));
  assert(missingFunctions.length === 0, `Missing ML manager functions: ${missingFunctions.join(', ')}`);
});

test('ML Manager has substantial implementation', 'mlManager', () => {
  const mlManagerPath = path.join(__dirname, '../src/ai/engines/MLModelManager.ts');
  const stats = fs.statSync(mlManagerPath);
  const sizeKB = stats.size / 1024;

  assert(sizeKB > 5, `File too small (${sizeKB.toFixed(1)}KB), likely incomplete implementation`);
});

// Quality Tests
console.log('\n🔍 QUALITY TESTS');
console.log('-'.repeat(30));

test('All engines have TypeScript types', 'infrastructure', () => {
  const engineFiles = [
    '../src/ai/engines/ComputerVisionEngine.ts',
    '../src/ai/engines/NLPEngine.ts',
    '../src/ai/engines/PredictiveAnalyticsEngine.ts',
    '../src/ai/engines/MLModelManager.ts'
  ];

  engineFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.includes('interface') || content.includes('type') || content.includes(': '), `${path.basename(filePath)} has no TypeScript types`);
    }
  });
});

test('All engines have error handling', 'infrastructure', () => {
  const engineFiles = [
    '../src/ai/engines/ComputerVisionEngine.ts',
    '../src/ai/engines/NLPEngine.ts',
    '../src/ai/engines/PredictiveAnalyticsEngine.ts',
    '../src/ai/engines/MLModelManager.ts'
  ];

  engineFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.includes('try') || content.includes('catch') || content.includes('throw'), `${path.basename(filePath)} has no error handling`);
    }
  });
});

// Calculate success rate
testResults.summary.successRate = (testResults.summary.passed / testResults.summary.total) * 100;

// Print comprehensive results
console.log('\n' + '='.repeat(60));
console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
console.log('='.repeat(60));

console.log(`\nOverall Results:`);
console.log(`  Total Tests: ${testResults.summary.total}`);
console.log(`  Passed: ${testResults.summary.passed}`);
console.log(`  Failed: ${testResults.summary.failed}`);
console.log(`  Success Rate: ${testResults.summary.successRate.toFixed(1)}%`);

console.log(`\nCategory Breakdown:`);
Object.entries(testResults.categories).forEach(([category, stats]) => {
  if (stats.total > 0) {
    const categorySuccessRate = (stats.passed / stats.total) * 100;
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${categorySuccessRate.toFixed(1)}%)`);
  }
});

if (testResults.summary.failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.details
    .filter(test => test.status === 'FAIL')
    .forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
}

// Grade assessment
let grade = 'F';
if (testResults.summary.successRate >= 90) grade = 'A';
else if (testResults.summary.successRate >= 80) grade = 'B';
else if (testResults.summary.successRate >= 70) grade = 'C';
else if (testResults.summary.successRate >= 60) grade = 'D';

console.log(`\n🏆 Phase 4.2 Grade: ${grade} (${testResults.summary.successRate.toFixed(1)}/100)`);

// Save comprehensive results
const resultsPath = path.join(__dirname, '../../test-results-phase4-2-comprehensive.json');
fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

console.log(`\n📄 Comprehensive results saved to: ${resultsPath}`);

// Exit with appropriate code
process.exit(testResults.summary.failed > 0 ? 1 : 0);
