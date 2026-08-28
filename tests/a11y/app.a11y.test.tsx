import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { axe } from "vitest-axe";
import { App } from "../../src/app/App";

type AxeResults = Awaited<ReturnType<typeof axe>>;

function seriousOrCritical(results: AxeResults) {
  return results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
}

it("입구 화면에서 자동 접근성 serious/critical 위반이 0건이다", async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(seriousOrCritical(results)).toEqual([]);
});

it("학습 화면(관찰 단계)에서도 serious/critical 위반이 0건이다", async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  const results = await axe(container);
  expect(seriousOrCritical(results)).toEqual([]);
});

it("예측 단계와 피드백이 모두 보이는 화면에서도 serious/critical 위반이 0건이다", async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  await user.click(screen.getByRole("button", { name: /선수 A1/ }));
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));
  await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
  await user.click(screen.getByRole("button", { name: "생각 확인하기" }));
  const results = await axe(container);
  expect(seriousOrCritical(results)).toEqual([]);
});
