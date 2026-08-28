import { expect, test } from "@playwright/test";
import { clickNext, startLearning } from "./helpers";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    overflow.scrollWidth,
    `가로 넘침 발생: scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth);
}

async function expectToolsBelowBoard(page: import("@playwright/test").Page) {
  const boardBottom = await page.getByRole("group", { name: /전술 경기판/ }).evaluate(
    (element) => element.getBoundingClientRect().bottom,
  );
  const actionsTop = await page
    .getByRole("button", { name: "다음 단계로" })
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(actionsTop).toBeGreaterThan(boardBottom - 40);
}

for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }]) {
  test(`${viewport.width}px에서 가로 넘침 없이 도구가 경기판 아래에 온다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await startLearning(page);

    await expectNoHorizontalOverflow(page);
    await expectToolsBelowBoard(page);

    await page.getByRole("button", { name: /선수 A1/ }).click();
    await clickNext(page);
    await page.getByRole("radio", { name: /→/ }).first().click();
    await page.getByRole("button", { name: "생각 확인하기" }).click();

    await expectNoHorizontalOverflow(page);
    await expectToolsBelowBoard(page);
  });
}

test("축소 모션에서 맥박 애니메이션이 제거되고 고정 외곽선으로 대체된다", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startLearning(page);

  await page.getByRole("button", { name: /선수 A1/ }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /→/ }).first().click();
  await page.getByRole("button", { name: "생각 확인하기" }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /→/ }).first().click();
  // 패스 길 확인(필수 버튼)이 보이는 상태에서 축소 모션을 검사한다
  const pulseButton = page.getByRole("button", { name: "패스 길 확인" });
  await expect(pulseButton).toBeVisible();

  const motion = await pulseButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationName: style.animationName, outlineWidth: style.outlineWidth };
  });
  expect(motion.animationName).toBe("none");
  expect(motion.outlineWidth).toBe("3px");
});

test("축소 모션을 켜지 않으면 필수 버튼에 맥박이 유지된다", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await startLearning(page);
  await page.getByRole("button", { name: /선수 A1/ }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /→/ }).first().click();
  await page.getByRole("button", { name: "생각 확인하기" }).click();
  await clickNext(page);
  await page.getByRole("radio", { name: /→/ }).first().click();
  const pulseButton = page.getByRole("button", { name: "패스 길 확인" });
  await expect(pulseButton).toBeVisible();
  const animationName = await pulseButton.evaluate(
    (element) => getComputedStyle(element).animationName,
  );
  expect(animationName).toContain("gi-pulse");
});
