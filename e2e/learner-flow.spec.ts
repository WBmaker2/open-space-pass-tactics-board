import { expect, test } from "@playwright/test";
import {
  clickNext,
  completeAllMissions,
  startLearning,
  watchConsoleErrors,
} from "./helpers";

test("3대1 안내 미션에서 열린 길을 고르고 근거를 함께 남긴다", async ({ page }) => {
  const consoleErrors = watchConsoleErrors(page);
  await startLearning(page);

  await page.getByRole("button", { name: /선수 A1/ }).click();
  await clickNext(page);

  await page.getByRole("radio", { name: /A1 → A2/ }).click();
  await page.getByRole("checkbox", { name: "고른 길 사이에 수비가 없어요" }).check();
  await page.getByRole("button", { name: "생각 확인하기" }).click();

  await expect(page.getByRole("status")).toContainText("열려 있어요");
  await expect(page.getByRole("checkbox", { name: "고른 길 사이에 수비가 없어요" })).toBeChecked();
  expect(consoleErrors).toEqual([]);
});

test("중앙 길이 막힌 장면에서 막은 수비를 정확히 연결한다", async ({ page }) => {
  await startLearning(page);

  // 미션 1 통과
  await page.getByRole("button", { name: /선수 A1/ }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /A1 → A2/ }).first().click();
  await page.getByRole("button", { name: "생각 확인하기" }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /A1 → A2/ }).first().click();
  await page.getByRole("button", { name: "패스 길 확인" }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: "계획을 유지할래요" }).click();
  await page.getByRole("button", { name: "계획 정하기" }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /A1 → c2r1/ }).click();
  await page.getByRole("button", { name: "다음 지원 시험" }).click();
  await clickNext(page);

  // 미션 2: 중앙은 막혀 있고 측면만 열려 있다
  await page.getByRole("button", { name: /선수 A1/ }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /A1 → A3/ }).click();
  await page.getByRole("button", { name: "생각 확인하기" }).click();
  await clickNext(page);

  await page.getByRole("radio", { name: /A1 → A3/ }).click();
  await page.getByRole("button", { name: /수비 D1/ }).click();
  await page.getByRole("button", { name: "패스 길 확인" }).click();

  await expect(page.getByRole("status")).toContainText("패스 성공");
  await expect(page.getByRole("status")).toContainText("바로 찾았어요");
});

test("복수 유효 패스 미션을 두 경로로 각각 완료한다", async ({ page }) => {
  for (const lane of ["A1 → A2", "A1 → A3"]) {
    await startLearning(page);
    await completeAllMissions(page, { twoOptionsLane: lane });
    const body = await page.locator("body").textContent();
    expect(body).toContain("전술 기록");
    expect(body).not.toMatch(/등급|1등|승리/);
  }
});

test("여섯 미션 뒤 보고서에 승패·점수 없이 공간 근거가 표시된다", async ({ page }) => {
  await startLearning(page);
  await completeAllMissions(page);

  await expect(page.getByText(/점수나 순위는 없어요/)).toBeVisible();
  expect(await page.getByText("사용한 근거", { exact: true }).count()).toBe(6);
  expect(await page.getByText("처음 생각", { exact: true }).count()).toBe(6);
  expect(await page.getByText("수정 결과", { exact: true }).count()).toBe(6);
});

test("학습 흐름 동안 콘솔 오류가 0건이다", async ({ page }) => {
  const consoleErrors = watchConsoleErrors(page);
  await startLearning(page);
  await completeAllMissions(page);
  expect(consoleErrors).toEqual([]);
});

test("처음부터 다시 하기는 확인 대화상자 뒤에 온다", async ({ page }) => {
  await startLearning(page);
  await page.getByRole("button", { name: "처음부터" }).click();
  await expect(page.getByRole("dialog", { name: "처음부터 다시 할까요?" })).toBeVisible();
  await page.getByRole("button", { name: "다시 시작할래요" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: /빈 공간 패스 전술판/ }),
  ).toBeVisible();
  // 대화상자 닫기(취소)로 돌아가면 학습이 이어진다
  await page.getByRole("button", { name: "학습 시작하기" }).click();
  await page.getByRole("button", { name: "처음부터" }).click();
  await page.getByRole("button", { name: "계속할래요" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /미션 1/ })).toBeVisible();
});
