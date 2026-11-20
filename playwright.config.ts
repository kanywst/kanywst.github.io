import { defineConfig, devices } from '@playwright/test';

// Browser checks the jsdom unit tests can't make: real focus movement, the View Transition
// path, the prerendered no-JS copy, and an axe scan of both states. Runs against the
// production build (`npm run build` first), served by vite preview.
const PORT = 4795;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, ...devices['Desktop Chrome'] },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
