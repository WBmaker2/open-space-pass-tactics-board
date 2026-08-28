import { describe, expect, it } from "vitest";
import { missions } from "../content/missions";
import type { SessionState } from "./sessionReducer";
import { initialSessionState, sessionReducer } from "./sessionReducer";

function progressOf(state: SessionState) {
  return state.missions[state.missionIndex];
}

function start(): SessionState {
  return sessionReducer(initialSessionState(), { type: "START" });
}

function answerObserve(state: SessionState, playerId: string): SessionState {
  return sessionReducer(state, {
    type: "ANSWER_OBSERVE",
    missionIndex: state.missionIndex,
    playerId,
    revision: progressOf(state).revision,
  });
}

function answerPredict(state: SessionState, laneId: string): SessionState {
  return sessionReducer(state, {
    type: "ANSWER_PREDICT",
    missionIndex: state.missionIndex,
    laneId,
    evidenceKeys: ["ev-lane-no-defender"],
    revision: progressOf(state).revision,
  });
}

function chooseMove(state: SessionState, playerId: string, toCellId: string): SessionState {
  return sessionReducer(state, {
    type: "CHOOSE_MOVE",
    missionIndex: state.missionIndex,
    playerId,
    toCellId,
    revision: progressOf(state).revision,
  });
}

function answerPass(
  state: SessionState,
  laneId: string,
  options: { blockerPlayerId?: string | null; deferred?: boolean } = {},
): SessionState {
  return sessionReducer(state, {
    type: "ANSWER_PASS",
    missionIndex: state.missionIndex,
    laneId,
    evidenceKeys: ["ev-lane-no-defender"],
    blockerPlayerId: options.blockerPlayerId ?? null,
    deferred: options.deferred ?? false,
    revision: progressOf(state).revision,
  });
}

function answerReveal(state: SessionState, keptPlan: boolean): SessionState {
  return sessionReducer(state, {
    type: "ANSWER_REVEAL",
    missionIndex: state.missionIndex,
    keptPlan,
    revisedLaneId: null,
    revision: progressOf(state).revision,
  });
}

function answerSupport(state: SessionState, playerId: string, toCellId: string): SessionState {
  return sessionReducer(state, {
    type: "ANSWER_SUPPORT",
    missionIndex: state.missionIndex,
    playerId,
    toCellId,
    evidenceKeys: ["ev-support-next"],
    revision: progressOf(state).revision,
  });
}

function next(state: SessionState): SessionState {
  return sessionReducer(state, { type: "NEXT" });
}

function back(state: SessionState): SessionState {
  return sessionReducer(state, { type: "BACK" });
}

describe("세션 시작과 전이 잠금", () => {
  it("INTRO에서 START하면 첫 미션의 첫 단계로 진입한다", () => {
    const state = start();
    expect(state.step).toBe("OBSERVE");
    expect(state.missionIndex).toBe(0);
    expect(state.focusToken).toBe(1);
  });

  it("필수 응답 없이 NEXT하면 상태가 바뀌지 않는다", () => {
    const state = start();
    expect(next(state)).toBe(state);
  });

  it("알 수 없는 action은 상태를 바꾸지 않는다", () => {
    const state = start();
    expect(sessionReducer(state, { type: "아무개" } as never)).toBe(state);
  });

  it("범위를 벗어난 missionIndex 응답은 무시된다", () => {
    const state = start();
    const moved = sessionReducer(state, {
      type: "ANSWER_OBSERVE",
      missionIndex: 99,
      playerId: "A1",
      revision: 0,
    });
    expect(moved).toBe(state);
  });

  it("이전 revision 응답은 상태를 바꾸지 않는다", () => {
    let state = start();
    state = answerObserve(state, "A1");
    const stale = sessionReducer(state, {
      type: "ANSWER_OBSERVE",
      missionIndex: state.missionIndex,
      playerId: "A2",
      revision: 0,
    });
    expect(stale).toBe(state);
    expect(progressOf(state).observePlayerId).toBe("A1");
  });

  it("단계와 맞지 않는 응답은 무시된다", () => {
    const state = start();
    const moved = sessionReducer(state, {
      type: "ANSWER_PASS",
      missionIndex: 0,
      laneId: "lane-a1-a2",
      evidenceKeys: [],
      blockerPlayerId: null,
      deferred: false,
      revision: 0,
    });
    expect(moved).toBe(state);
  });
});

describe("학습 단계 진행", () => {
  it("미션 1을 관찰→예측→패스→공개→지원 순서로 진행한다", () => {
    let state = start();
    state = answerObserve(state, "A1");
    state = next(state);
    expect(state.step).toBe("PREDICT");

    state = answerPredict(state, "lane-a1-a2");
    expect(progressOf(state).predict?.evaluation.accepted).toBe(true);
    state = next(state);
    expect(state.step).toBe("PASS");

    state = answerPass(state, "lane-a1-a2", { blockerPlayerId: "D1" });
    expect(progressOf(state).pass?.evaluation.accepted).toBe(true);
    expect(progressOf(state).pass?.blockerEvaluation?.accepted).toBe(true);
    expect(state.missions[0].stateId).toBe("st-01-passed");
    state = next(state);
    expect(state.step).toBe("REVEAL");
    expect(state.missions[0].stateId).toBe("st-01-reveal");

    state = answerReveal(state, true);
    state = next(state);
    expect(state.step).toBe("SUPPORT");

    state = answerSupport(state, "A1", "c2r1");
    expect(progressOf(state).support?.evaluation.accepted).toBe(true);
    expect(state.missions[0].stateId).toBe("st-01-support-up");

    state = next(state);
    expect(state.missionIndex).toBe(1);
    expect(state.step).toBe("OBSERVE");
    expect(state.missions[1].stateId).toBe("st-02-start");
  });

  it("패스를 보류하면 공은 그대로이고 다음 단계로 진행할 수 있다", () => {
    let state = start();
    state = answerObserve(state, "A1");
    state = next(state);
    state = answerPredict(state, "lane-a1-a2");
    state = next(state);
    state = answerPass(state, "lane-a1-a3", { deferred: true });
    expect(progressOf(state).pass?.deferred).toBe(true);
    expect(state.missions[0].stateId).toBe("st-01-start");
    const moved = next(state);
    expect(moved.step).toBe("REVEAL");
  });

  it("BACK은 직전 단계의 응답을 보존한다", () => {
    let state = start();
    state = answerObserve(state, "A1");
    state = next(state);
    state = answerPredict(state, "lane-a1-a2");
    state = next(state);
    state = back(state);
    expect(state.step).toBe("PREDICT");
    expect(progressOf(state).predict?.laneId).toBe("lane-a1-a2");
    expect(progressOf(state).revision).toBe(2);
  });

  it("미션 3에서 이동하면 경기판 state가 열린 길 쪽으로 바뀐다", () => {
    let state = sessionReducer(initialSessionState(), { type: "START" });
    // 미션 3으로 이동: 앞 미션을 최소 응답으로 통과한다
    state = driveThroughMissions(state, 2);
    expect(state.missionIndex).toBe(2);
    state = answerObserve(state, "A1");
    state = next(state);
    state = answerPredict(state, "lane-a1-a2");
    state = next(state);
    expect(state.step).toBe("MOVE");
    state = chooseMove(state, "A2", "c4r1");
    expect(state.missions[2].stateId).toBe("st-03-up");
    state = next(state);
    expect(state.step).toBe("PASS");
    state = answerPass(state, "lane-a1-a2-up");
    expect(state.missions[2].stateId).toBe("st-03-up-passed");
  });

  it("미션 6의 승인된 계획은 SUPPORT 완료 시 통과한다", () => {
    let state = sessionReducer(initialSessionState(), { type: "START" });
    state = driveThroughMissions(state, 5);
    expect(state.missionIndex).toBe(5);
    state = answerObserve(state, "A1");
    state = next(state);
    state = chooseMove(state, "A2", "c5r1");
    state = next(state);
    state = answerPass(state, "lane-a1-a2", { blockerPlayerId: "D2" });
    state = next(state);
    expect(state.step).toBe("SUPPORT");
    state = answerSupport(state, "A1", "c2r2");
    expect(progressOf(state).support?.sequenceEvaluation?.accepted).toBe(true);
    expect(progressOf(state).support?.sequenceEvaluation?.evidenceKeys).toContain("sequence-match:seq-left");
  });
});

describe("완료 잠금과 재시작", () => {
  it("모든 미션을 끝내면 REPORT에 도달하고 이후에는 응답을 바꿀 수 없다", () => {
    let state = sessionReducer(initialSessionState(), { type: "START" });
    for (let index = 0; index < missions.length; index += 1) {
      state = driveCurrentMission(state);
    }
    expect(state.step).toBe("REPORT");
    expect(state.missionIndex).toBe(missions.length - 1);
    const locked = sessionReducer(state, {
      type: "ANSWER_OBSERVE",
      missionIndex: 0,
      playerId: "A1",
      revision: 0,
    });
    expect(locked).toBe(state);
    expect(next(state)).toBe(state);
  });

  it("RESTART_CONFIRMED는 초기 상태를 새 객체로 만들고 이전 상태를 보존한다", () => {
    let state = start();
    state = answerObserve(state, "A1");
    const restarted = sessionReducer(state, { type: "RESTART_CONFIRMED" });
    expect(restarted).not.toBe(state);
    expect(restarted.step).toBe("INTRO");
    expect(progressOf(restarted).observePlayerId).toBeNull();
    expect(progressOf(state).observePlayerId).toBe("A1");
    expect(restarted.missions).not.toBe(state.missions);
  });
});

/** 현재 미션을 최소 응답으로 통과하고 NEXT로 다음 미션(또는 REPORT)까지 진행한다. */
function driveCurrentMission(state: SessionState): SessionState {
  const mission = missions[state.missionIndex];
  let current = state;
  for (const step of mission.flow.steps) {
    if (step === "OBSERVE") {
      current = answerObserve(current, mission.flow.observe.ballHolderPlayerId);
    } else if (step === "PREDICT") {
      const predictState = mission.states.find((candidate) => candidate.id === mission.flow.predict!.stateId)!;
      const laneId = predictState.lanes[0].id;
      current = answerPredict(current, laneId);
    } else if (step === "MOVE") {
      const transition = mission.flow.move!.transitions[0];
      current = chooseMove(current, transition.playerId, transition.toCellId);
    } else if (step === "PASS") {
      const currentState = mission.states.find((candidate) => candidate.id === current.missions[current.missionIndex].stateId)!;
      const openLane = currentState.lanes.find((lane) => lane.blockedByPlayerIds.length === 0) ?? currentState.lanes[0];
      current = answerPass(current, openLane.id);
    } else if (step === "REVEAL") {
      current = answerReveal(current, true);
    } else if (step === "SUPPORT") {
      const transition = mission.flow.support!.transitions.find(
        (candidate) => candidate.fromStateId === current.missions[current.missionIndex].stateId,
      ) ?? mission.flow.support!.transitions[0];
      current = answerSupport(current, transition.playerId, transition.toCellId);
    }
    current = next(current);
  }
  return current;
}

/** startIndex 미션까지 앞 미션들을 통과시킨 뒤 그 미션의 첫 단계에 서 있게 한다. */
function driveThroughMissions(state: SessionState, startIndex: number): SessionState {
  let current = state;
  for (let index = 0; index < startIndex; index += 1) {
    current = driveCurrentMission(current);
  }
  return current;
}
