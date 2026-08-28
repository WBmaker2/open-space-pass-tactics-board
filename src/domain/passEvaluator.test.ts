import { describe, expect, it } from "vitest";
import { missions } from "../content/missions";
import type { PassMissionRecord, SequenceStep, TacticsState } from "./types";
import {
  availablePassIds,
  evaluateBlocker,
  evaluatePass,
  evaluateSequence,
  evaluateSupportMove,
} from "./passEvaluator";

function missionById(id: string): PassMissionRecord {
  const mission = missions.find((candidate) => candidate.id === id);
  if (!mission) throw new Error(`미션 없음: ${id}`);
  return mission;
}

function stateOf(missionId: string, stateId: string): TacticsState {
  const mission = missionById(missionId);
  const state = mission.states.find((candidate) => candidate.id === stateId);
  if (!state) throw new Error(`state 없음: ${stateId}`);
  return state;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.getOwnPropertyNames(value).forEach((key) => {
      deepFreeze((value as Record<string, unknown>)[key]);
    });
    Object.freeze(value);
  }
  return value;
}

describe("availablePassIds", () => {
  it("현재 state에서 수비에게 막히지 않은 lane만 반환한다", () => {
    expect(availablePassIds(stateOf("pass-two-options-04", "st-04-start"))).toEqual([
      "lane-left-side",
      "lane-right-side",
    ]);
  });

  it("모든 길이 막힌 state에서는 빈 배열을 반환한다", () => {
    expect(availablePassIds(stateOf("pass-after-05", "st-05-start"))).toEqual([]);
  });
});

describe("evaluatePass — 열린 길 8건", () => {
  const openCases: ReadonlyArray<readonly [string, string, string]> = [
    ["pass-lane-01", "st-01-start", "lane-a1-a2"],
    ["pass-defender-02", "st-02-start", "lane-side"],
    ["pass-move-03", "st-03-up", "lane-a1-a2-up"],
    ["pass-move-03", "st-03-down", "lane-a1-a2-down"],
    ["pass-two-options-04", "st-04-start", "lane-left-side"],
    ["pass-two-options-04", "st-04-start", "lane-right-side"],
    ["pass-after-05", "st-05-support-up", "lane-a2-a1"],
    ["pass-plan-06", "st-06-left", "lane-a1-a2"],
  ];

  it.each(openCases)("%s의 %s에서 %s은(는) 열린 길이다", (missionId, stateId, laneId) => {
    const evaluation = evaluatePass(stateOf(missionId, stateId), laneId);
    expect(evaluation.accepted).toBe(true);
    expect(evaluation.laneId).toBe(laneId);
    expect(evaluation.blockedByPlayerIds).toEqual([]);
    expect(evaluation.evidenceKeys).toContain("lane-open");
  });
});

describe("evaluatePass — 수비 차단 8건", () => {
  const blockedCases: ReadonlyArray<readonly [string, string, string, string]> = [
    ["pass-lane-01", "st-01-start", "lane-a1-a3", "D1"],
    ["pass-defender-02", "st-02-start", "lane-center", "D1"],
    ["pass-move-03", "st-03-start", "lane-a1-a2", "D1"],
    ["pass-after-05", "st-05-start", "lane-a2-a1", "D1"],
    ["pass-after-05", "st-05-start", "lane-a2-a3", "D1"],
    ["pass-plan-06", "st-06-start", "lane-a1-a2", "D1"],
    ["pass-plan-06", "st-06-start", "lane-a1-a3", "D2"],
    ["pass-plan-06", "st-06-right", "lane-a1-a2", "D1"],
  ];

  it.each(blockedCases)("%s의 %s에서 %s은(는) %s에게 막혀 있다", (missionId, stateId, laneId, blockerId) => {
    const evaluation = evaluatePass(stateOf(missionId, stateId), laneId);
    expect(evaluation.accepted).toBe(false);
    expect(evaluation.blockedByPlayerIds).toContain(blockerId);
    expect(evaluation.evidenceKeys).toContain("lane-blocked");
    expect(evaluation.evidenceKeys).toContain(`blocked-by:${blockerId}`);
  });

  it("존재하지 않는 lane은 오답으로 처리하고 어린이용 근거를 반환한다", () => {
    const evaluation = evaluatePass(stateOf("pass-lane-01", "st-01-start"), "lane-없음");
    expect(evaluation.accepted).toBe(false);
    expect(evaluation.evidenceKeys).toContain("lane-not-found");
  });
});

describe("evaluatePass — 복수 유효 패스 4건", () => {
  it("미션 4에서 두 측면 길이 모두 availablePassIds로 나타난다", () => {
    expect(availablePassIds(stateOf("pass-two-options-04", "st-04-start")).sort()).toEqual([
      "lane-left-side",
      "lane-right-side",
    ]);
  });

  it("미션 4에서 어느 쪽 길도 거리만으로 오답 처리되지 않는다", () => {
    const state = stateOf("pass-two-options-04", "st-04-start");
    expect(evaluatePass(state, "lane-left-side").accepted).toBe(true);
    expect(evaluatePass(state, "lane-right-side").accepted).toBe(true);
  });

  it("미션 3에서 위·아래 이동 두 해법 모두 열린 길을 만든다", () => {
    expect(evaluatePass(stateOf("pass-move-03", "st-03-up"), "lane-a1-a2-up").accepted).toBe(true);
    expect(evaluatePass(stateOf("pass-move-03", "st-03-down"), "lane-a1-a2-down").accepted).toBe(true);
  });

  it("미션 5에서 두 지원 칸이 각각 다음 열린 길을 만든다", () => {
    const mission = missionById("pass-after-05");
    const up = evaluateSupportMove(mission, "support", "st-05-start", "A1", "c2r1");
    const down = evaluateSupportMove(mission, "support", "st-05-start", "A1", "c2r3");
    expect(up.accepted).toBe(true);
    expect(down.accepted).toBe(true);
    expect(up.evidenceKeys).toContain("lane-opened:lane-a2-a1");
    expect(down.evidenceKeys).toContain("lane-opened:lane-a2-a3");
  });
});

describe("evaluateSupportMove — 잘못된 지원 칸 6건", () => {
  const invalidCases: ReadonlyArray<readonly [string, "move" | "support", string, string, string]> = [
    ["pass-lane-01", "support", "st-01-reveal", "A1", "c1r1"],
    ["pass-lane-01", "support", "st-01-reveal", "A1", "c2r2"],
    ["pass-move-03", "move", "st-03-start", "A1", "c4r1"],
    ["pass-after-05", "support", "st-05-start", "A2", "c2r1"],
    ["pass-after-05", "support", "st-05-start", "A1", "c2r2"],
    ["pass-plan-06", "move", "st-06-start", "A1", "c5r1"],
  ];

  it.each(invalidCases)("%s %s에서 %s가 %s(으)로 움직이는 선택은 승인되지 않는다", (missionId, phase, stateId, playerId, toCellId) => {
    const evaluation = evaluateSupportMove(missionById(missionId), phase, stateId, playerId, toCellId);
    expect(evaluation.accepted).toBe(false);
    expect(evaluation.evidenceKeys).toContain("support-not-approved");
  });
});

describe("evaluateSequence — 두 단계 허용 순서 4건", () => {
  const seqLeft: readonly SequenceStep[] = [
    { kind: "move", playerId: "A2", toCellId: "c5r1" },
    { kind: "pass", laneId: "lane-a1-a2" },
    { kind: "support", playerId: "A1", toCellId: "c2r2" },
  ];
  const seqRight: readonly SequenceStep[] = [
    { kind: "move", playerId: "A3", toCellId: "c5r3" },
    { kind: "pass", laneId: "lane-a1-a3" },
    { kind: "support", playerId: "A1", toCellId: "c2r2" },
  ];

  it("seq-left 계획을 승인한다", () => {
    const evaluation = evaluateSequence(missionById("pass-plan-06"), seqLeft);
    expect(evaluation.accepted).toBe(true);
    expect(evaluation.evidenceKeys).toContain("sequence-match:seq-left");
  });

  it("seq-right 계획을 승인한다", () => {
    const evaluation = evaluateSequence(missionById("pass-plan-06"), seqRight);
    expect(evaluation.accepted).toBe(true);
    expect(evaluation.evidenceKeys).toContain("sequence-match:seq-right");
  });

  it("패스를 먼저 하는 순서는 승인되지 않는다", () => {
    const evaluation = evaluateSequence(missionById("pass-plan-06"), [
      { kind: "pass", laneId: "lane-a1-a2" },
      { kind: "move", playerId: "A2", toCellId: "c5r1" },
      { kind: "support", playerId: "A1", toCellId: "c2r2" },
    ]);
    expect(evaluation.accepted).toBe(false);
    expect(evaluation.evidenceKeys).toContain("sequence-mismatch");
  });

  it("승인되지 않은 이동(A2→c5r3)을 포함하면 승인되지 않는다", () => {
    const evaluation = evaluateSequence(missionById("pass-plan-06"), [
      { kind: "move", playerId: "A2", toCellId: "c5r3" },
      { kind: "pass", laneId: "lane-a1-a2" },
      { kind: "support", playerId: "A1", toCellId: "c2r2" },
    ]);
    expect(evaluation.accepted).toBe(false);
  });
});

describe("evaluateBlocker", () => {
  it("막힌 길이 있는 장면에서 막은 수비를 바로 연결한다", () => {
    const evaluation = evaluateBlocker(stateOf("pass-defender-02", "st-02-start"), "D1");
    expect(evaluation.accepted).toBe(true);
    expect(evaluation.evidenceKeys).toContain("blocker-found");
    expect(evaluation.laneId).toBe("lane-center");
  });

  it("막지 않은 선수를 고르면 오답이다", () => {
    const evaluation = evaluateBlocker(stateOf("pass-defender-02", "st-02-start"), "A2");
    expect(evaluation.accepted).toBe(false);
    expect(evaluation.evidenceKeys).toContain("blocker-not-on-lane");
  });

  it("막힌 길이 없는 장면에서는 물어보지 않는 선택도 오답으로 처리한다", () => {
    const evaluation = evaluateBlocker(stateOf("pass-two-options-04", "st-04-start"), "D1");
    expect(evaluation.accepted).toBe(false);
    expect(evaluation.evidenceKeys).toContain("lane-not-blocked");
  });
});

describe("순수성과 잘못된 입력", () => {
  it("판정 함수는 얼려 넣은 readonly 입력을 변경하지 않는다", () => {
    const state = deepFreeze(stateOf("pass-lane-01", "st-01-start"));
    const mission = deepFreeze(missionById("pass-lane-01"));
    expect(() => evaluatePass(state, "lane-a1-a2")).not.toThrow();
    expect(() => evaluateSupportMove(mission, "support", "st-01-reveal", "A1", "c2r1")).not.toThrow();
    expect(() => evaluateSequence(mission, [{ kind: "pass", laneId: "lane-a1-a2" }])).not.toThrow();
    expect(Object.isFrozen(state)).toBe(true);
  });

  it("존재하지 않는 state를 조회하면 승인하지 않는다", () => {
    const evaluation = evaluateSupportMove(missionById("pass-lane-01"), "support", "st-없음", "A1", "c2r1");
    expect(evaluation.accepted).toBe(false);
  });

  it("빈 시퀀스는 승인하지 않는다", () => {
    const evaluation = evaluateSequence(missionById("pass-plan-06"), []);
    expect(evaluation.accepted).toBe(false);
  });
});
