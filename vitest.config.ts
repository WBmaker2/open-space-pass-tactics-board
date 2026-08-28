import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// vite.config.ts는 command별 base를 정하는 함수형 설정이므로 테스트용으로는 serve 기준으로 고정해 합친다.
const resolvedViteConfig =
  typeof viteConfig === "function"
    ? viteConfig({ command: "serve", mode: "test", isSsrBuild: false, isPreview: false })
    : viteConfig;

export default mergeConfig(
  resolvedViteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    },
  }),
);
