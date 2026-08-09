import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./test-results",
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm --dir ../../playground build && pnpm --dir ../../playground preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      testMatch: ["**/*.desktop.spec.ts", "**/*.a11y.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testMatch: "**/*.desktop.spec.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: "**/*.desktop.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      testMatch: "**/*.touch.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      testMatch: "**/*.touch.spec.ts",
      use: { ...devices["iPhone 15"] },
    },
  ],
});
