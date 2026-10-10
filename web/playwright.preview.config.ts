import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "preview.spec.ts",
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.PREVIEW_BASE_URL ?? "http://127.0.0.1:3001",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], browserName: "chromium", channel: "chrome", viewport: { width: 1440, height: 900 } } },
    { name: "tablet-1024", use: { ...devices["Desktop Chrome"], browserName: "chromium", channel: "chrome", viewport: { width: 1024, height: 900 } } },
    { name: "tablet-768", use: { ...devices["iPad Mini"], browserName: "chromium", channel: "chrome", viewport: { width: 768, height: 1024 } } },
    { name: "phone-430", use: { ...devices["iPhone 13"], browserName: "chromium", channel: "chrome", viewport: { width: 430, height: 932 } } },
    { name: "phone-390", use: { ...devices["iPhone 13"], browserName: "chromium", channel: "chrome", viewport: { width: 390, height: 844 } } },
  ],
});
