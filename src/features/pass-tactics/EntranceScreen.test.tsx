import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { missions } from "../../content/missions";
import { EntranceScreen } from "./EntranceScreen";

describe("입구 화면", () => {
  it("학습 목표와 6개 미션 이름을 보여 준다", () => {
    render(<EntranceScreen onStart={() => {}} headingRef={{ current: null }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("빈 공간 패스 전술판");
    for (const mission of missions) {
      expect(screen.getByText(mission.flow.title)).toBeInTheDocument();
    }
  });

  it("예상 시간과 저장하지 않는다는 안내를 보여 준다", () => {
    render(<EntranceScreen onStart={() => {}} headingRef={{ current: null }} />);
    expect(screen.getByText(/15~25분/)).toBeInTheDocument();
    expect(screen.getByText(/저장하지 않아요/)).toBeInTheDocument();
    expect(screen.getByText(/실제 경기 실력을 평가하지 않아요/)).toBeInTheDocument();
  });

  it("시작 버튼으로 학습 시작을 요청한다", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<EntranceScreen onStart={onStart} headingRef={{ current: null }} />);
    await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("시작 버튼은 Enter와 Space로도 작동한다", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<EntranceScreen onStart={onStart} headingRef={{ current: null }} />);
    const button = screen.getByRole("button", { name: "학습 시작하기" });
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onStart).toHaveBeenCalledTimes(2);
  });

  it("업데이트 내역 대화상자에 최초 항목을 보여 주고 Escape으로 닫는다", async () => {
    const user = userEvent.setup();
    render(<EntranceScreen onStart={() => {}} headingRef={{ current: null }} />);
    await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
    expect(screen.getByRole("dialog", { name: "업데이트 내역" })).toBeInTheDocument();
    expect(screen.getByText("2026-08-28 — 구현 계획 확정")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "업데이트 내역" })).not.toBeInTheDocument();
  });
});
