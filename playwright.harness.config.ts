import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the smart-notification screenshot harness.
 *
 * Deliberately separate from `playwright.config.ts`: the main e2e config has a `globalSetup` that
 * authenticates against a live OpenMRS backend, which the harness neither has nor needs. The
 * harness serves the real components from a local Vite dev server, so this suite runs anywhere.
 */
export default defineConfig({
  testDir: './e2e/harness',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  outputDir: './e2e/harness/test-results',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // The viewport must come after the device preset, which carries one of its own.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: 'yarn harness',
    url: 'http://localhost:5199',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
