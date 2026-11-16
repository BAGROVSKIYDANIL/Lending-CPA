import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env['E2E_PORT'] ?? 4200);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'en-US',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-13-inch',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 12'], viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    command: `npm start -- --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    env: {
      VITE_API_URL: 'https://cpa-server-vtel.onrender.com',
      VITE_API_HEADER: 'x-api-key: e2e-placeholder',
    },
  },
});
