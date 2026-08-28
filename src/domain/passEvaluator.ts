// 단일 판정 경계 (계획서 5장·7.2). 정오·충족·판단 보류의 계산은 이 파일만 한다.
// 컴포넌트는 정답 배열을 직접 조회하지 않고 이 모듈의 결과만 렌더링한다.
// 모든 함수는 순수 함수로, readonly 입력을 변경하지 않는다.
import type {
  PassEvaluation,
  PassMissionRecord,
  SequenceStep,
  TacticsState,
} from "./types";

/** 현재 state에서 수비에게 막히지 않은 lane만 반환한다. */
export function availablePassIds(state: TacticsState): string[] {
  return state.lanes.filter((lane) => lane.blockedByPlayerIds.length === 0).map((lane) => lane.id);
}

/** 학생이 고른 lane이 현재 state에서 열려 있는지 승인 데이터로만 판정한다. */
export function evaluatePass(state: TacticsState, laneId: string): PassEvaluation {
  const lane = state.lanes.find((candidate) => candidate.id === laneId);
  if (!lane) {
    return { accepted: false, laneId, blockedByPlayerIds: [], evidenceKeys: ["lane-not-found"] };
  }
  if (lane.blockedByPlayerIds.length === 0) {
    return { accepted: true, laneId, blockedByPlayerIds: [], evidenceKeys: ["lane-open"] };
  }
  return {
    accepted: false,
    laneId,
    blockedByPlayerIds: [...lane.blockedByPlayerIds],
    evidenceKeys: ["lane-blocked", ...lane.blockedByPlayerIds.map((id) => `blocked-by:${id}`)],
  };
}

/** 막힌 길이 있는 장면에서, 그 길을 막은 수비를 학생이 바르게 연결했는지 판정한다. */
export function evaluateBlocker(state: TacticsState, playerId: string): PassEvaluation {
  const blockedLane = state.lanes.find((candidate) => candidate.blockedByPlayerIds.length > 0);
  if (!blockedLane) {
    return { accepted: false, laneId: null, blockedByPlayerIds: [], evidenceKeys: ["lane-not-blocked"] };
  }
  if (blockedLane.blockedByPlayerIds.includes(playerId)) {
    return {
      accepted: true,
      laneId: blockedLane.id,
      blockedByPlayerIds: [...blockedLane.blockedByPlayerIds],
      evidenceKeys: ["blocker-found", `blocked-by:${playerId}`],
    };
  }
  return {
    accepted: false,
    laneId: blockedLane.id,
    blockedByPlayerIds: [...blockedLane.blockedByPlayerIds],
    evidenceKeys: ["blocker-not-on-lane", ...blockedLane.blockedByPlayerIds.map((id) => `blocked-by:${id}`)],
  };
}

export type SupportMovePhase = "move" | "support";

/**
 * 지원 이동(받을 사람의 이동 또는 패서의 다음 지원)이 검수된 칸인지 판정한다.
 * 실제 경기의 최적 전술이라고 단정하지 않고, 승인된 전이 데이터만 확인한다.
 */
export function evaluateSupportMove(
  mission: PassMissionRecord,
  phase: SupportMovePhase,
  fromStateId: string,
  playerId: string,
  toCellId: string,
): PassEvaluation {
  const transitions =
    phase === "move" ? mission.flow.move?.transitions : mission.flow.support?.transitions;
  const match = transitions?.find(
    (transition) =>
      transition.fromStateId === fromStateId &&
      transition.playerId === playerId &&
      transition.toCellId === toCellId,
  );
  if (!match) {
    return { accepted: false, laneId: null, blockedByPlayerIds: [], evidenceKeys: ["support-not-approved"] };
  }

  const fromState = mission.states.find((state) => state.id === fromStateId);
  const toState = mission.states.find((state) => state.id === match.nextStateId);
  const openedLaneIds = fromState && toState ? diffAvailableLaneIds(fromState, toState) : [];
  return {
    accepted: true,
    laneId: null,
    blockedByPlayerIds: [],
    evidenceKeys: ["support-approved", ...openedLaneIds.map((id) => `lane-opened:${id}`)],
  };
}

/** 이동→패스→지원 계획이 검수된 승인 시퀀스와 순서까지 같은지 판정한다. */
export function evaluateSequence(
  mission: PassMissionRecord,
  steps: readonly SequenceStep[],
): PassEvaluation {
  if (steps.length === 0 || !isExecutable(mission, steps)) {
    return { accepted: false, laneId: null, blockedByPlayerIds: [], evidenceKeys: ["sequence-mismatch"] };
  }
  for (const sequenceId of mission.acceptedSequenceIds) {
    const accepted = mission.flow.sequenceStepsById[sequenceId];
    if (accepted && sameSteps(accepted, steps)) {
      return {
        accepted: true,
        laneId: null,
        blockedByPlayerIds: [],
        evidenceKeys: [`sequence-match:${sequenceId}`],
      };
    }
  }
  return { accepted: false, laneId: null, blockedByPlayerIds: [], evidenceKeys: ["sequence-mismatch"] };
}

function isExecutable(mission: PassMissionRecord, steps: readonly SequenceStep[]): boolean {
  let currentStateId = mission.flow.firstStateId;
  for (const step of steps) {
    if (step.kind === "move") {
      const match = mission.flow.move?.transitions.find(
        (transition) =>
          transition.fromStateId === currentStateId &&
          transition.playerId === step.playerId &&
          transition.toCellId === step.toCellId,
      );
      if (!match) return false;
      currentStateId = match.nextStateId;
    } else if (step.kind === "pass") {
      const currentState = mission.states.find((state) => state.id === currentStateId);
      const lane = currentState?.lanes.find((candidate) => candidate.id === step.laneId);
      if (!currentState || !lane || lane.blockedByPlayerIds.length > 0) return false;
      const match = mission.flow.pass?.transitions.find(
        (transition) => transition.fromStateId === currentStateId && transition.laneId === step.laneId,
      );
      if (!match) return false;
      currentStateId = match.nextStateId;
    } else {
      const match = mission.flow.support?.transitions.find(
        (transition) =>
          transition.fromStateId === currentStateId &&
          transition.playerId === step.playerId &&
          transition.toCellId === step.toCellId,
      );
      if (!match) return false;
      currentStateId = match.nextStateId;
    }
  }
  return true;
}

function sameSteps(a: readonly SequenceStep[], b: readonly SequenceStep[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((step, index) => {
    const other = b[index];
    if (step.kind !== other.kind) return false;
    if (step.kind === "pass" && other.kind === "pass") return step.laneId === other.laneId;
    if (step.kind === "move" && other.kind === "move") {
      return step.playerId === other.playerId && step.toCellId === other.toCellId;
    }
    if (step.kind === "support" && other.kind === "support") {
      return step.playerId === other.playerId && step.toCellId === other.toCellId;
    }
    return false;
  });
}

function diffAvailableLaneIds(fromState: TacticsState, toState: TacticsState): string[] {
  const before = new Set(availablePassIds(fromState));
  return availablePassIds(toState).filter((laneId) => !before.has(laneId));
}
