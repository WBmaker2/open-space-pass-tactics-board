import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const LEDGER = "docs/image-rights-ledger.md";
const GENERATED_DIR = "src/assets/generated";

describe("생성 자산과 권리 장부", () => {
  it("밝은 체육관 입구 이미지가 로컬 webp 자산으로 존재한다", () => {
    expect(existsSync(`${GENERATED_DIR}/bright-gym-tactics-board.webp`)).toBe(true);
  });

  it("src/assets/generated의 모든 파일이 권리 장부에 기록된다 (1:1 대응)", () => {
    const files = existsSync(GENERATED_DIR) ? readdirSync(GENERATED_DIR) : [];
    expect(files.length, "생성 자산이 최소 1개 필요하다").toBeGreaterThan(0);
    const ledger = readFileSync(LEDGER, "utf8");
    for (const file of files) {
      expect(ledger.includes(file), `${file}이(가) 권리 장부에 없다`).toBe(true);
    }
  });

  it("권리 장부의 모든 자산 행이 실제 파일로 존재한다", () => {
    const ledger = readFileSync(LEDGER, "utf8");
    const mentioned = [
      ...ledger.matchAll(/src\/assets\/generated\/([A-Za-z0-9._-]+)/g),
    ].map((match) => match[1]);
    expect(mentioned.length).toBeGreaterThan(0);
    for (const file of mentioned) {
      expect(existsSync(`${GENERATED_DIR}/${file}`), `${file} 파일이 없다`).toBe(true);
    }
  });

  it("입구 화면은 자산을 장식 이미지(빈 alt)로 참조한다", () => {
    const source = readFileSync("src/features/pass-tactics/EntranceScreen.tsx", "utf8");
    expect(source).toContain("bright-gym-tactics-board.webp");
    expect(source).toMatch(/alt=""/);
  });

  it("장부의 자산 행은 생성일과 사용 위치를 함께 기록한다", () => {
    const ledger = readFileSync(LEDGER, "utf8");
    expect(ledger).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(ledger).toContain("입구 화면");
  });
});

describe("모션 규칙", () => {
  it("축소 모션에서 gi-pulse는 animation none과 3px 외곽선으로 대체된다", () => {
    const css = readFileSync("src/styles/motion.css", "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/\.gi-pulse\s*\{[^}]*animation:\s*none/);
    expect(css).toMatch(/outline:\s*3px/);
  });

  it("gi-pulse는 두 필수 버튼(패스 길 확인·다음 지원 시험)에만 사용된다", () => {
    const source = readFileSync("src/features/pass-tactics/StepPanels.tsx", "utf8");
    const uses = source.match(/\bpulse\b/g) ?? [];
    expect(uses.length, "gi-pulse는 정확히 두 버튼에만 적용해야 한다").toBe(2);
    expect(source).toContain("패스 길 확인");
    expect(source).toContain("다음 지원 시험");
  });
});
