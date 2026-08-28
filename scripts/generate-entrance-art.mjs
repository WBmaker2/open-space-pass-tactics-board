// 입구 장식 이미지 1회 생성 스크립트.
// 직접 작성한 SVG 장면을 로컬 Chromium에서 래스터라이즈해 WebP로 인코딩한다.
// 외부 이미지 생성 모델·외부 요청을 사용하지 않는다.
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const svg = readFileSync("scripts/entrance-art.svg", "utf8");
const width = 1200;
const height = 630;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.setContent(
  `<!doctype html><html><body style="margin:0">${svg}</body></html>`,
  { waitUntil: "load" },
);

const dataUrl = await page.evaluate(
  async ({ svgText, w, h }) => {
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, w, h);
    const encoded = canvas.toDataURL("image/webp", 0.9);
    if (!encoded.startsWith("data:image/webp")) {
      throw new Error("이 브라우저는 webp 인코딩을 지원하지 않는다");
    }
    return encoded;
  },
  { svgText: svg, w: width, h: height },
);

await browser.close();

const base64 = dataUrl.slice("data:image/webp;base64,".length);
writeFileSync("src/assets/generated/bright-gym-tactics-board.webp", Buffer.from(base64, "base64"));
console.log("생성 완료: src/assets/generated/bright-gym-tactics-board.webp");
