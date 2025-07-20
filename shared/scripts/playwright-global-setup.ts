import { chromium } from '@playwright/test';
import type { FullConfig } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;

  // Start browser and authenticate
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the application
  await page.goto(baseURL!);

  // Wait for the app to load
  await page.waitForLoadState('networkidle');

  // Perform authentication if needed
  // This is where you'd add your authentication logic
  // For example:
  // await page.fill('[data-testid="email"]', process.env.TEST_USER_EMAIL);
  // await page.fill('[data-testid="password"]', process.env.TEST_USER_PASSWORD);
  // await page.click('[data-testid="login-button"]');

  // Save signed-in state
  await page.context().storageState({ path: storageState as string });
  await browser.close();

  // Create test data or setup database state
  console.log('✅ Playwright global setup completed');
}

export default globalSetup;
