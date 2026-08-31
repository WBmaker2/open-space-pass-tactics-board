import { expect, test } from "@playwright/test";
import { pressTabUntil, startLearning } from "./helpers";

test("키보드만으로 선수·격자 칸·패스 길을 선택한다", async ({ page }) => {
  await startLearning(page);

  // 관찰: 토큰으로 이동해 Enter로 선택
  const token = page.getByRole("button", { name: /선수 A1/ });
  await pressTabUntil(page, token);
  await page.keyboard.press("Enter");
  await expect(token).toHaveAttribute("aria-pressed", "true");

  const nextButton = page.getByRole("button", { name: "다음 단계로" });
  await pressTabUntil(page, nextButton);
  await page.keyboard.press("Enter");

  // 예측: 라디오에 스페이스로 선택, 확인 버튼을 Enter로 실행
  const laneRadio = page.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ });
  await pressTabUntil(page, laneRadio);
  await page.keyboard.press("Space");
  await expect(laneRadio).toBeChecked();

  const chip = page.getByRole("checkbox", { name: "고른 길 사이에 수비가 없어요" });
  await pressTabUntil(page, chip);
  await page.keyboard.press("Space");
  await expect(chip).toBeChecked();

  const predictConfirm = page.getByRole("button", { name: "생각 확인하기" });
  await pressTabUntil(page, predictConfirm);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("열려 있어요");

  await pressTabUntil(page, nextButton);
  await page.keyboard.press("Enter");

  // 패스: 라디오 선택 뒤 필수 확인 버튼을 Enter로 실행
  const passRadio = page.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ });
  await pressTabUntil(page, passRadio);
  await page.keyboard.press("Space");

  const passConfirm = page.getByRole("button", { name: "패스 길 확인" });
  await pressTabUntil(page, passConfirm);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("패스 성공");

  await pressTabUntil(page, nextButton);
  await page.keyboard.press("Enter");
  await expect(page.getByText(/수비가 한 칸 움직였어요/)).toBeVisible();
});

test("뒤로 가기는 키보드로도 도달할 수 있다", async ({ page }) => {
  await startLearning(page);
  await page.getByRole("button", { name: /선수 A1/ }).click();
  const backButton = page.getByRole("button", { name: "뒤로" });
  await pressTabUntil(page, backButton);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: /빈 공간 패스 전술판/ }),
  ).toBeVisible();
});
