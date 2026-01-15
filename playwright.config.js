const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com",
    headless: false, 
    viewport: { width: 1366, height: 768 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure"
  },

  projects: [
    {
      name: "setup",
      testMatch: ["**/*.setup.spec.js"],
      use: { ...devices["Desktop Chrome"] }
    },

    {
      name: "chromium",
      testIgnore: ["**/*.setup.spec.js"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "storageState.json"
      },
      dependencies: ["setup"]
    }
  ]
});
