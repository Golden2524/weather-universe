import { defineConfig, devices } from "@playwright/test"

const browserChannel = process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined)

export default defineConfig({
  testDir: "./e2e-live",
  use: {
    ...devices["Desktop Chrome"],
    ...(browserChannel ? { channel: browserChannel } : {}),
    baseURL: process.env.LIVE_WEB_URL ?? "https://weather-universe-web-ew28.vercel.app"
  },
  workers: 1,
  timeout: 120_000
})
