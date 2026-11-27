import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.DOCS_BASE_URL || 'http://localhost:3100',
    viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  webServer: process.env.DOCS_BASE_URL ? undefined : {
    command: process.env.CI ? 'node .output/server/index.mjs' : 'pnpm dev --port 3100',
    env: { HOST: 'localhost', PORT: '3100' },
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
