import type { FullConfig  } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function globalTeardown(config: FullConfig) {
  // Clean up test data
  console.log('🧹 Cleaning up test data...');

  // Generate test summary report
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: 0, // This would be populated from test results
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
  };

  // Save summary to reports directory
  const summaryPath = join(__dirname, '../.reports/playwright/summary.json');
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('✅ Playwright global teardown completed');
}

export default globalTeardown;
