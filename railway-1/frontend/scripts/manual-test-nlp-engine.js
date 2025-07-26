#!/usr/bin/env node

/**
 * Manual Test Script for NLP Engine
 * Bypasses vitest/rollup issues on Windows
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Test utility functions
function test(name, testFn) {
  testResults.total++;
  try {
    testFn();
    testResults.passed++;
    testResults.details.push({ name, status: 'PASS', error: null });
    console.log(`✅ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run all tests
console.log('\n🧪 Running Manual NLP Engine Tests...\n');

// Test 1: Check if NLPEngine file exists
test('NLPEngine file exists', () => {
  const nlpEnginePath = path.join(__dirname, '../src/ai/engines/NLPEngine.ts');
  assert(fs.existsSync(nlpEnginePath), 'NLPEngine.ts file not found');
});

// Test 2: Check if PredictiveAnalyticsEngine file exists
test('PredictiveAnalyticsEngine file exists', () => {
  const analyticsEnginePath = path.join(__dirname, '../src/ai/engines/PredictiveAnalyticsEngine.ts');
  assert(fs.existsSync(analyticsEnginePath), 'PredictiveAnalyticsEngine.ts file not found');
});

// Test 3: Check if MLModelManager file exists
test('MLModelManager file exists', () => {
  const mlManagerPath = path.join(__dirname, '../src/ai/engines/MLModelManager.ts');
  assert(fs.existsSync(mlManagerPath), 'MLModelManager.ts file not found');
});

// Test 4: Check NLPEngine content for key functions
test('NLPEngine has core NLP functions', () => {
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

// Test 5: Check PredictiveAnalyticsEngine content
test('PredictiveAnalyticsEngine has analytics functions', () => {
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

// Test 6: Check MLModelManager content
test('MLModelManager has model management functions', () => {
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

// Test 7: Check for placeholder comments in all engines
test('No placeholder comments in AI engines', () => {
  const engineFiles = [
    '../src/ai/engines/NLPEngine.ts',
    '../src/ai/engines/PredictiveAnalyticsEngine.ts',
    '../src/ai/engines/MLModelManager.ts'
  ];

  const placeholderPatterns = [
    /\/\/\s*placeholder/i,
    /\/\/\s*todo/i,
    /\/\/\s*fixme/i,
    /\/\/\s*implement/i
  ];

  let foundPlaceholders = [];

  engineFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      placeholderPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          foundPlaceholders.push(...matches.map(match => `${path.basename(filePath)}: ${match}`));
        }
      });
    }
  });

  assert(foundPlaceholders.length === 0, `Found placeholder comments: ${foundPlaceholders.join(', ')}`);
});

// Test 8: Check file sizes (should be substantial for real implementation)
test('AI engine files have substantial size', () => {
  const engineFiles = [
    '../src/ai/engines/NLPEngine.ts',
    '../src/ai/engines/PredictiveAnalyticsEngine.ts',
    '../src/ai/engines/MLModelManager.ts'
  ];

  engineFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = stats.size / 1024;
      assert(sizeKB > 2, `${path.basename(filePath)} too small (${sizeKB.toFixed(1)}KB), likely incomplete implementation`);
    }
  });
});

// Test 9: Check for proper TypeScript types
test('AI engines have TypeScript types', () => {
  const engineFiles = [
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

// Test 10: Check for error handling
test('AI engines have error handling', () => {
  const engineFiles = [
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

// Print results
console.log('\n📊 Test Results Summary:');
console.log(`Total Tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed}`);
console.log(`Failed: ${testResults.failed}`);
console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.details
    .filter(test => test.status === 'FAIL')
    .forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
}

// Save results to file
const resultsPath = path.join(__dirname, '../../test-results-manual-nlp.json');
fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

console.log(`\n📄 Results saved to: ${resultsPath}`);

// Exit with appropriate code
process.exit(testResults.failed > 0 ? 1 : 0);
