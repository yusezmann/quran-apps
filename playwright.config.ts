import { defineConfig } from "@playwright/test"

const PORT = 3001
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  // Satu browser saja supaya ringan di laptop
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    // Pakai Google Chrome yang sudah terinstall, tidak perlu download Chromium Playwright
    channel: "chrome",
    viewport: { width: 1366, height: 900 },
    locale: "id-ID",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  // Pakai dev server yang sudah jalan (npm run dev); kalau belum ada, dijalankan otomatis
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
