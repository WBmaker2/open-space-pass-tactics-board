import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// 이 테스트는 npm run build 이후에 실행된다(npm run verify 순서).
describe("GitHub Pages 배포 자산", () => {
  const html = readFileSync("dist/index.html", "utf8");

  it("dist/index.html이 생성된다", () => {
    expect(existsSync("dist/index.html")).toBe(true);
  });

  it("HTML 참조 자산은 모두 하위 경로(/open-space-pass-tactics-board/)로 시작하고 실제로 존재한다", () => {
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((reference) => reference.startsWith("/"));
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(
        reference.startsWith("/open-space-pass-tactics-board/"),
        `${reference}이(가) Pages 하위 경로가 아니다`,
      ).toBe(true);
      const filePath = `dist${reference.replace("/open-space-pass-tactics-board", "")}`;
      expect(existsSync(filePath), `${filePath} 파일이 없다`).toBe(true);
    }
  });

  it("해시 자산과 favicon이 존재한다", () => {
    const assets = readdirSync("dist/assets");
    expect(assets.some((file) => /^index-[\w-]+\.js$/.test(file))).toBe(true);
    expect(assets.some((file) => /^index-[\w-]+\.css$/.test(file))).toBe(true);
    expect(assets.some((file) => file.endsWith(".webp"))).toBe(true);
    expect(existsSync("dist/favicon.svg")).toBe(true);
  });

  it("문서 언어와 제목이 올바르다", () => {
    expect(html).toContain('lang="ko"');
    expect(html).toContain("<title>빈 공간 패스 전술판</title>");
  });
});
