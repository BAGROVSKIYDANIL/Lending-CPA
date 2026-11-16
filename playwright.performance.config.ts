import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './performance',
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4273',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js preview --outDir dist/cpa-landing/en-US --host 127.0.0.1 --port 4273 --strictPort',
    url: 'http://127.0.0.1:4273',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
