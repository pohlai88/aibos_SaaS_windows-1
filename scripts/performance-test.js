#!/usr/bin/env node

const http = require('http');
const https = require('https');

class PerformanceTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTime: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: []
    };
  }

  async testEndpoint(url, concurrency = 10, duration = 10000) {
    console.log(`🚀 Performance Testing: ${url}`);
    console.log(`📊 Concurrency: ${concurrency}, Duration: ${duration}ms`);

    const startTime = Date.now();
    const promises = [];

    // Create concurrent requests
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.makeRequest(url));
    }

    // Wait for all requests to complete
    await Promise.all(promises);

    const endTime = Date.now();
    this.results.totalTime = endTime - startTime;
    this.results.averageResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;

    this.printResults();
  }

  async makeRequest(url) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, (res) => {
        const responseTime = Date.now() - startTime;

        this.results.totalRequests++;
        this.results.successfulRequests++;
        this.results.responseTimes.push(responseTime);
        this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
        this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);

        res.on('data', () => {}); // Consume data
        res.on('end', () => resolve());
      });

      req.on('error', (err) => {
        const responseTime = Date.now() - startTime;

        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.responseTimes.push(responseTime);

        console.error(`❌ Request failed: ${err.message}`);
        resolve();
      });

      req.setTimeout(5000, () => {
        req.destroy();
        this.results.totalRequests++;
        this.results.failedRequests++;
        resolve();
      });
    });
  }

  printResults() {
    console.log('\n📈 Performance Test Results');
    console.log('==========================');
    console.log(`Total Requests: ${this.results.totalRequests}`);
    console.log(`Successful: ${this.results.successfulRequests}`);
    console.log(`Failed: ${this.results.failedRequests}`);
    console.log(`Success Rate: ${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2)}%`);
    console.log(`Total Time: ${this.results.totalTime}ms`);
    console.log(`Average Response Time: ${this.results.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${this.results.minResponseTime}ms`);
    console.log(`Max Response Time: ${this.results.maxResponseTime}ms`);
    console.log(`Requests/Second: ${(this.results.totalRequests / (this.results.totalTime / 1000)).toFixed(2)}`);
  }
}

// Execute if run directly
if (require.main === module) {
  const tester = new PerformanceTester();
  const url = process.argv[2] || 'http://localhost:3000';
  const concurrency = parseInt(process.argv[3]) || 10;
  const duration = parseInt(process.argv[4]) || 10000;

  tester.testEndpoint(url, concurrency, duration);
}

module.exports = PerformanceTester;
