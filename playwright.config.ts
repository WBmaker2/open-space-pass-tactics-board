import { defineConfig, devices } from "@playwright/test";

// GitHub Pages 하위 경로와 같은 preview 서버 기준 URL을 사용한다.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  webServer: {
    // vite preview는 serve 모드라 base가 /가 되므로, Pages와 같은 하위 경로로 dist를
    // 서빙하는 전용 스크립트를 사용한다.
    command: "node scripts/preview-pages.mjs 4173",
    url: "http://127.0.0.1:4173/open-space-pass-tactics-board/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173/open-space-pass-tactics-board/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
