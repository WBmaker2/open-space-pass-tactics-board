import { defineConfig, devices } from "@playwright/test";

// GitHub Pages 하위 경로와 같은 preview 서버 기준 URL을 사용한다.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  baseURL: "http://127.0.0.1:4173/open-space-pass-tactics-board/",
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/open-space-pass-tactics-board/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
