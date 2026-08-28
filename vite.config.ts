import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발(base=/)과 프로덕션(GitHub Pages 하위 경로) 베이스를 계획서대로 고정한다.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/open-space-pass-tactics-board/" : "/",
  plugins: [react()],
}));
