import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4201',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['desktop chromium'] },
    },
  ],

  webServer: {
    command: 'pnpm exec ng serve --port 4201',
    url: 'http://localhost:4201',
    reuseExistingServer: !process.env.CI,
  },
});
