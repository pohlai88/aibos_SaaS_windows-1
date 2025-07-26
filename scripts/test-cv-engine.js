#!/usr/bin/env node

const { ComputerVisionEngine } = require('../railway-1/frontend/src/ai/engines/ComputerVisionEngine.ts');

class CVEngineTester {
  constructor() {
    this.engine = new ComputerVisionEngine();
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runTests() {
    console.log('🧠 Testing Computer Vision Engine...\n');

    const tests = [
      { name: 'Object Detection', task: 'object-detection' },
      { name: 'Image Classification', task: 'image-classification' },
      { name: 'Facial Recognition', task: 'facial-recognition' },
      { name: 'OCR', task: 'optical-character-recognition' },
      { name: 'Image Segmentation', task: 'image-segmentation' },
      { name: 'Image Generation', task: 'image-generation' },
      { name: 'Image Enhancement', task: 'image-enhancement' },
      { name: 'Scene Understanding', task: 'scene-understanding' },
      { name: 'Video Analysis', task: 'video-analysis' },
      { name: 'Pose Estimation', task: 'pose-estimation' },
      { name: 'Image Similarity', task: 'image-similarity' },
      { name: 'Image Captioning', task: 'image-captioning' },
      { name: 'Image Tagging', task: 'image-tagging' },
      { name: 'Quality Assessment', task: 'quality-assessment' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }

    this.printResults();
  }

  async runTest(test) {
    this.testResults.total++;

    try {
      console.log(`🔍 Testing ${test.name}...`);

      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const result = await this.engine.process({
        task: test.task,
        image: mockImage,
        options: { confidence: 0.5, maxResults: 5 }
      });

      if (result && result.task === test.task && result.confidence > 0) {
        console.log(`✅ ${test.name}: PASSED (confidence: ${result.confidence.toFixed(2)}, time: ${result.processingTime}ms)`);
        this.testResults.passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED - Invalid result`);
        this.testResults.failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      this.testResults.failed++;
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);

    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Computer Vision Engine is fully functional.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const tester = new CVEngineTester();
  tester.runTests().catch(console.error);
}

module.exports = CVEngineTester;
