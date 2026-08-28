import { expect, type Locator, type Page } from "@playwright/test";
import { missions } from "../src/content/missions";

export async function gotoApp(page: Page) {
  // GitHub Pages 하위 경로와 같은 preview base에서 상대 경로로 진입한다.
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1, name: /빈 공간 패스 전술판/ })).toBeVisible();
}

export async function startLearning(page: Page) {
  await gotoApp(page);
  await page.getByRole("button", { name: "학습 시작하기" }).click();
}

export async function pressTabUntil(page: Page, target: Locator, maxTabs = 120) {
  for (let index = 0; index < maxTabs; index += 1) {
    const focused = await target.evaluate(
      (element) => element === document.activeElement || element.contains(document.activeElement),
    );
    if (focused) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Tab으로 대상에 도달하지 못했다");
}

export async function clickNext(page: Page) {
  await page.getByRole("button", { name: "다음 단계로" }).click();
}

export async function passWithAnyOpenLane(page: Page) {
  const radios = page.getByRole("radio", { name: /→/ });
  const count = await radios.count();
  for (let index = 0; index < count; index += 1) {
    await radios.nth(index).click();
    await page.getByRole("button", { name: "패스 길 확인" }).click();
    const rejected = await page
      .locator('[role="status"]')
      .filter({ hasText: "다시 볼까요" })
      .count();
    if (rejected === 0) return;
  }
  throw new Error("열린 패스 길을 찾지 못했다");
}

export async function completeAllMissions(
  page: Page,
  options: { twoOptionsLane?: string } = {},
) {
  for (let missionIndex = 0; missionIndex < missions.length; missionIndex += 1) {
    const mission = missions[missionIndex];
    for (const step of mission.flow.steps) {
      if (step === "OBSERVE") {
        await page
          .getByRole("button", { name: new RegExp(`선수 ${mission.flow.observe.ballHolderPlayerId}`) })
          .click();
      } else if (step === "PREDICT") {
        await page.getByRole("radio", { name: /→/ }).first().click();
        await page.getByRole("button", { name: "생각 확인하기" }).click();
      } else if (step === "MOVE") {
        await page.getByRole("radio", { name: /→/ }).first().click();
        await page.getByRole("button", { name: "이동해 보기" }).click();
      } else if (step === "PASS") {
        if (mission.id === "pass-two-options-04" && options.twoOptionsLane) {
          await page.getByRole("radio", { name: new RegExp(`^${options.twoOptionsLane}`) }).click();
          await page.getByRole("button", { name: "패스 길 확인" }).click();
        } else {
          await passWithAnyOpenLane(page);
        }
      } else if (step === "REVEAL") {
        await page.getByRole("radio", { name: "계획을 유지할래요" }).click();
        await page.getByRole("button", { name: "계획 정하기" }).click();
      } else if (step === "SUPPORT") {
        await page.getByRole("radio", { name: /→/ }).first().click();
        await page.getByRole("button", { name: "다음 지원 시험" }).click();
      }
      await clickNext(page);
    }
  }
  await expect(page.getByRole("heading", { level: 1, name: "전술 기록" })).toBeVisible();
}

export function watchConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => {
    errors.push(String(error));
  });
  return errors;
}
