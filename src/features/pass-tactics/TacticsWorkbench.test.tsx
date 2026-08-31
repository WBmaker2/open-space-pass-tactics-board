import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { App } from "../../app/App";

type User = ReturnType<typeof userEvent.setup>;

async function startApp(): Promise<User> {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  return user;
}

it("미션 1을 관찰→예측→패스→공개→지원 순서로 완주한다", async () => {
  const user = await startApp();

  // OBSERVE: 공을 가진 선수를 판에서 직접 고른다
  await user.click(screen.getByRole("button", { name: /선수 A1/ }));
  expect(screen.getByRole("button", { name: /선수 A1/ })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  // PREDICT: 이동 전에 열려 있다고 생각하는 길을 고르고 근거를 남긴다
  await user.click(screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ }));
  await user.click(screen.getByRole("checkbox", { name: "고른 길 사이에 수비가 없어요" }));
  await user.click(screen.getByRole("button", { name: "생각 확인하기" }));
  expect(screen.getByRole("status")).toHaveTextContent("열려 있어요");
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  // PASS: 길을 정하고 막힌 길을 막은 수비를 판에서 찾는다
  await user.click(screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ }));
  await user.click(screen.getByRole("button", { name: /수비 D1/ }));
  expect(screen.getByRole("button", { name: /수비 D1/ })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "패스 길 확인" }));
  expect(screen.getByRole("status")).toHaveTextContent("패스 성공");
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  // REVEAL: 수비가 움직인 뒤 계획을 유지한다
  expect(screen.getByText(/수비가 한 칸 움직였어요/)).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: "계획을 유지할래요" }));
  await user.click(screen.getByRole("button", { name: "계획 정하기" }));
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  // SUPPORT: 패서의 다음 지원을 시험한다
  await user.click(screen.getByRole("radio", { name: /왼쪽에 있는 선수 → 오른쪽 위 한 칸 옮기기/ }));
  await user.click(screen.getByRole("button", { name: "다음 지원 시험" }));
  expect(screen.getByRole("status")).toHaveTextContent("다음 패스 길이 열려요");
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  expect(screen.getByRole("heading", { level: 1, name: /미션 2/ })).toBeInTheDocument();
});

it("오답을 고르면 정답을 공개하지 않고 근거와 한 번의 수정 기회를 제공한다", async () => {
  const user = await startApp();

  await user.click(screen.getByRole("button", { name: /선수 A1/ }));
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  // PREDICT에서 막힌 길을 고른다
  await user.click(screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 아래 선수/ }));
  await user.click(screen.getByRole("button", { name: "생각 확인하기" }));
  const feedback = screen.getByRole("status");
  expect(feedback).toHaveTextContent("막고 있어요");
  expect(feedback).not.toHaveTextContent("정답");

  // PASS에서는 다시 고를 수 있고, 이번에는 열린 길로 성공한다
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));
  await user.click(screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 아래 선수/ }));
  await user.click(screen.getByRole("button", { name: "패스 길 확인" }));
  expect(screen.getByRole("status")).toHaveTextContent("막고 있어요");
  await user.click(screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ }));
  await user.click(screen.getByRole("button", { name: "패스 길 확인" }));
  expect(screen.getByRole("status")).toHaveTextContent("패스 성공");
});

it("키보드만으로 선수와 패스 길을 선택한다", async () => {
  const user = await startApp();

  // 관찰: 토큰으로 이동해 Enter로 선택
  const token = screen.getByRole("button", { name: /선수 A1/ });
  token.focus();
  await user.keyboard("{Enter}");
  expect(token).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  // 예측: 라디오에 스페이스로 선택
  const radio = screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ });
  radio.focus();
  await user.keyboard(" ");
  expect(radio).toBeChecked();
  await user.click(screen.getByRole("button", { name: "생각 확인하기" }));
});

it("필수 다음 행동 버튼에만 맥박 강조가 붙는다", async () => {
  const user = await startApp();

  await user.click(screen.getByRole("button", { name: /선수 A1/ }));
  const nextButton = screen.getByRole("button", { name: "다음 단계로" });
  expect(nextButton).not.toHaveClass("gi-pulse");
  await user.click(nextButton);

  const predictConfirm = screen.getByRole("button", { name: "생각 확인하기" });
  expect(predictConfirm).not.toHaveClass("gi-pulse");
  await user.click(screen.getByRole("radio", { name: /왼쪽 선수 → 오른쪽 위 선수/ }));
  await user.click(predictConfirm);
  await user.click(screen.getByRole("button", { name: "다음 단계로" }));

  expect(screen.getByRole("button", { name: "패스 길 확인" })).toHaveClass("gi-pulse");
});
