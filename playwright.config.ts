import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 90000,
  use: { baseURL: 'http://localhost:3300', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'npm run e2e:api', url: 'http://localhost:4400/api/health', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm exec -w wooblet-web -- next dev --webpack --port 3300', env: { WOOBLET_E2E: '1', NEXT_PUBLIC_API_URL: 'http://localhost:4400/api', NEXT_PUBLIC_APP_URL: 'http://localhost:3300' }, url: 'http://localhost:3300', reuseExistingServer: false, timeout: 120000 },
  ],
});
