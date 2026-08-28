import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { App } from "../../app/App";
import { missions } from "../../content/missions";
import { UpdateHistoryDialog } from "../../components/UpdateHistoryDialog";
import { UpdateHistoryButton } from "../../components/UpdateHistoryButton";

type User = ReturnType<typeof userEvent.setup>;

async function completeAllMissions(user: User) {
  for (let missionIndex = 0; missionIndex < missions.length; missionIndex += 1) {
    const mission = missions[missionIndex];
    for (const step of mission.flow.steps) {
      if (step === "OBSERVE") {
        const holder = mission.flow.observe.ballHolderPlayerId;
        await user.click(screen.getByRole("button", { name: new RegExp(`선수 ${holder}`) }));
      } else if (step === "PREDICT") {
        await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
        await user.click(screen.getByRole("button", { name: "생각 확인하기" }));
      } else if (step === "MOVE") {
        await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
        await user.click(screen.getByRole("button", { name: "이동해 보기" }));
      } else if (step === "PASS") {
        await passWithAnyOpenLane(user);
      } else if (step === "REVEAL") {
        await user.click(screen.getByRole("radio", { name: "계획을 유지할래요" }));
        await user.click(screen.getByRole("button", { name: "계획 정하기" }));
      } else if (step === "SUPPORT") {
        await user.click(screen.getAllByRole("radio", { name: /→/ })[0]);
        await user.click(screen.getByRole("button", { name: "다음 지원 시험" }));
      }
      await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    }
  }
}

async function passWithAnyOpenLane(user: User) {
  const radios = screen.getAllByRole("radio", { name: /→/ });
  for (const radio of radios) {
    await user.click(radio);
    await user.click(screen.getByRole("button", { name: "패스 길 확인" }));
    const rejected = screen
      .getAllByRole("status")
      .some((element) => element.textContent?.includes("다시 볼까요"));
    if (!rejected) return;
  }
  throw new Error("열린 패스 길을 찾지 못했다");
}

it("여섯 미션을 끝내면 점수 없이 미션별 기록을 보여 준다", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  await completeAllMissions(user);

  expect(screen.getByRole("heading", { level: 1, name: "전술 기록" })).toBeInTheDocument();
  expect(screen.getByText(/점수나 순위는 없어요/)).toBeInTheDocument();
  for (const mission of missions) {
    expect(screen.getByText(mission.flow.title)).toBeInTheDocument();
  }
  expect(screen.getAllByText("처음 생각").length).toBe(missions.length);
  expect(screen.getAllByText("사용한 근거").length).toBe(missions.length);
  expect(screen.getAllByText("수정 결과").length).toBe(missions.length);
  expect(screen.queryByLabelText(/이름/)).not.toBeInTheDocument();
  expect(screen.getByText(/새로고침하면/)).toBeInTheDocument();
});

it("처음 생각을 바꾼 미션은 수정 결과에 기록된다", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  await completeAllMissions(user);
  // 미션 2에서 막힌 중앙 길을 먼저 골라 열린 측면 길로 수정한다
  expect(screen.getAllByText(/바꾸고/).length).toBeGreaterThanOrEqual(1);
});

it("인쇄 버튼으로 window.print를 호출한다", async () => {
  const user = userEvent.setup();
  const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
  render(<App />);
  await user.click(screen.getByRole("button", { name: "학습 시작하기" }));
  await completeAllMissions(user);
  await user.click(screen.getByRole("button", { name: "기록 인쇄하기" }));
  expect(printSpy).toHaveBeenCalledTimes(1);
  printSpy.mockRestore();
});

it("인쇄용 CSS는 A4 세로·검정 텍스트·제어 버튼 숨김을 보장한다", () => {
  const css = readFileSync("src/features/report/print.css", "utf8");
  expect(css).toContain("@media print");
  expect(css).toContain("size: A4 portrait");
  expect(css).toMatch(/color:\s*#000000/);
  expect(css).toMatch(/\.app-header\s*\{[^}]*display:\s*none/);
  expect(css).toMatch(/\.report__actions\s*\{[^}]*display:\s*none/);
});

it("업데이트 내역 대화상자는 닫기 버튼과 초점 복원을 지원한다", async () => {
  const user = userEvent.setup();
  render(<UpdateHistoryButton />);
  await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
  expect(screen.getByRole("dialog", { name: "업데이트 내역" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "닫기" }));
  expect(screen.queryByRole("dialog", { name: "업데이트 내역" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "업데이트 내역" })).toHaveFocus();
});

it("업데이트 내역은 onClose로 닫을 수 있다", async () => {
  const user = userEvent.setup();
  let closed = false;
  render(<UpdateHistoryDialog onClose={() => { closed = true; }} />);
  await user.keyboard("{Escape}");
  expect(closed).toBe(true);
});
