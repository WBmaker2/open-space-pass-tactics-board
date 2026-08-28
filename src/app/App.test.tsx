import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("앱 셸", () => {
  it("처음에는 입구 화면을 렌더링한다", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /빈 공간 패스 전술판/ })).toBeInTheDocument();
  });

  it("시작하면 첫 미션 화면으로 이동하고 제목에 초점이 옮겨진다", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
    const heading = screen.getByRole("heading", { level: 1, name: /미션 1/ });
    expect(heading).toHaveFocus();
  });

  it("학습 중에도 업데이트 내역 버튼을 헤더에서 열 수 있다", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
    await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
    expect(screen.getByRole("dialog", { name: "업데이트 내역" })).toBeInTheDocument();
  });
});
