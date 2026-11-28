import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  use: { ...devices["Desktop Chrome"], channel: "msedge", baseURL: "http://127.0.0.1:3100" },
  workers: 1,
  timeout: 60_000,
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
