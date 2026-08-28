// 세션 상태와 전이 잠금 (계획서 9장).
// step은 정의된 전이표를 통해서만 바뀌고, 알 수 없는 action·범위 밖 missionIndex·
// 이전 revision 응답은 상태를 바꾸지 않는다. 학생 응답은 이 메모리 구조에만 존재한다.
import { evaluateBlocker, evaluatePass, evaluateSequence } from "../domain/passEvaluator";
import type { PassEvaluation, PassMissionRecord, SessionStep } from "../domain/types";
import { missions } from "../content/missions";

export interface PredictAnswer {
  readonly laneId: string;
  readonly evidenceKeys: readonly string[];
  readonly evaluation: PassEvaluation;
}

export interface MoveAnswer {
  readonly playerId: string;
  readonly toCellId: string;
}

export interface PassAnswer {
  readonly laneId: string;
  readonly evidenceKeys: readonly string[];
  readonly blockerPlayerId: string | null;
  readonly blockerEvaluation: PassEvaluation | null;
  readonly deferred: boolean;
  readonly evaluation: PassEvaluation;
}

export interface RevealAnswer {
  readonly keptPlan: boolean;
  readonly revisedLaneId: string | null;
}

export interface SupportAnswer {
  readonly playerId: string;
  readonly toCellId: string;
  readonly evidenceKeys: readonly string[];
  readonly evaluation: PassEvaluation;
  readonly sequenceEvaluation: PassEvaluation | null;
}

export interface MissionProgress {
  readonly stateId: string;
  readonly revision: number;
  readonly observePlayerId: string | null;
  readonly predict: PredictAnswer | null;
  readonly move: MoveAnswer | null;
  readonly pass: PassAnswer | null;
  readonly reveal: RevealAnswer | null;
  readonly support: SupportAnswer | null;
}

export interface SessionState {
  readonly step: SessionStep;
  readonly missionIndex: number;
  readonly missions: readonly MissionProgress[];
  readonly focusToken: number;
}

export type SessionAction =
  | { readonly type: "START" }
  | { readonly type: "ANSWER_OBSERVE"; readonly missionIndex: number; readonly playerId: string; readonly revision: number }
  | { readonly type: "ANSWER_PREDICT"; readonly missionIndex: number; readonly laneId: string; readonly evidenceKeys: readonly string[]; readonly revision: number }
  | { readonly type: "CHOOSE_MOVE"; readonly missionIndex: number; readonly playerId: string; readonly toCellId: string; readonly revision: number }
  | { readonly type: "ANSWER_PASS"; readonly missionIndex: number; readonly laneId: string; readonly evidenceKeys: readonly string[]; readonly blockerPlayerId: string | null; readonly deferred: boolean; readonly revision: number }
  | { readonly type: "ANSWER_REVEAL"; readonly missionIndex: number; readonly keptPlan: boolean; readonly revisedLaneId: string | null; readonly revision: number }
  | { readonly type: "ANSWER_SUPPORT"; readonly missionIndex: number; readonly playerId: string; readonly toCellId: string; readonly evidenceKeys: readonly string[]; readonly revision: number }
  | { readonly type: "NEXT" }
  | { readonly type: "BACK" }
  | { readonly type: "RESTART_CONFIRMED" };

export function initialSessionState(): SessionState {
  return {
    step: "INTRO",
    missionIndex: 0,
    missions: missions.map((mission) => freshProgress(mission)),
    focusToken: 0,
  };
}

function freshProgress(mission: PassMissionRecord): MissionProgress {
  return {
    stateId: mission.flow.firstStateId,
    revision: 0,
    observePlayerId: null,
    predict: null,
    move: null,
    pass: null,
    reveal: null,
    support: null,
  };
}

function currentMission(state: SessionState): PassMissionRecord {
  return missions[state.missionIndex];
}

function hasAnswer(step: SessionStep, progress: MissionProgress): boolean {
  switch (step) {
    case "OBSERVE":
      return progress.observePlayerId !== null;
    case "PREDICT":
      return progress.predict !== null;
    case "MOVE":
      return progress.move !== null;
    case "PASS":
      return progress.pass !== null;
    case "REVEAL":
      return progress.reveal !== null;
    case "SUPPORT":
      return progress.support !== null;
    default:
      return false;
  }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "START":
      return state.step === "INTRO"
        ? { ...state, step: firstStepOf(missions[0]), focusToken: state.focusToken + 1 }
        : state;
    case "RESTART_CONFIRMED":
      return { ...initialSessionState(), focusToken: state.focusToken + 1 };
    case "NEXT":
      return advance(state);
    case "BACK":
      return goBack(state);
    default:
      return answerAction(state, action);
  }
}

function firstStepOf(mission: PassMissionRecord): SessionStep {
  return mission.flow.steps[0];
}

function answerAction(state: SessionState, action: SessionAction): SessionState {
  if (state.step === "INTRO" || state.step === "REPORT") return state;
  if (!("missionIndex" in action)) return state;
  if (action.missionIndex !== state.missionIndex) return state;
  if (action.missionIndex < 0 || action.missionIndex >= missions.length) return state;

  const mission = currentMission(state);
  const progress = state.missions[state.missionIndex];
  if (action.revision !== progress.revision) return state;

  switch (action.type) {
    case "ANSWER_OBSERVE":
      if (state.step !== "OBSERVE") return state;
      return replaceProgress(state, { ...progress, observePlayerId: action.playerId, revision: progress.revision + 1 });
    case "ANSWER_PREDICT": {
      if (state.step !== "PREDICT" || !mission.flow.predict) return state;
      const predictState = mission.states.find((candidate) => candidate.id === mission.flow.predict!.stateId);
      if (!predictState) return state;
      return replaceProgress(state, {
        ...progress,
        revision: progress.revision + 1,
        predict: {
          laneId: action.laneId,
          evidenceKeys: [...action.evidenceKeys],
          evaluation: evaluatePass(predictState, action.laneId),
        },
      });
    }
    case "CHOOSE_MOVE": {
      if (state.step !== "MOVE" || !mission.flow.move) return state;
      const match = mission.flow.move.transitions.find(
        (transition) =>
          transition.fromStateId === progress.stateId &&
          transition.playerId === action.playerId &&
          transition.toCellId === action.toCellId,
      );
      if (!match) return state;
      return replaceProgress(state, {
        ...progress,
        revision: progress.revision + 1,
        stateId: match.nextStateId,
        move: { playerId: action.playerId, toCellId: action.toCellId },
      });
    }
    case "ANSWER_PASS": {
      if (state.step !== "PASS" || !mission.flow.pass) return state;
      const evaluation = evaluatePass(stateAt(mission, progress.stateId), action.laneId);
      const blockerEvaluation =
        action.blockerPlayerId !== null
          ? evaluateBlocker(stateAt(mission, progress.stateId), action.blockerPlayerId)
          : null;
      const transition = evaluation.accepted && !action.deferred
        ? mission.flow.pass.transitions.find(
            (candidate) => candidate.fromStateId === progress.stateId && candidate.laneId === action.laneId,
          )
        : undefined;
      return replaceProgress(state, {
        ...progress,
        revision: progress.revision + 1,
        stateId: transition?.nextStateId ?? progress.stateId,
        pass: {
          laneId: action.laneId,
          evidenceKeys: [...action.evidenceKeys],
          blockerPlayerId: action.blockerPlayerId,
          blockerEvaluation,
          deferred: action.deferred,
          evaluation,
        },
      });
    }
    case "ANSWER_REVEAL":
      if (state.step !== "REVEAL") return state;
      return replaceProgress(state, {
        ...progress,
        revision: progress.revision + 1,
        reveal: { keptPlan: action.keptPlan, revisedLaneId: action.revisedLaneId },
      });
    case "ANSWER_SUPPORT": {
      if (state.step !== "SUPPORT" || !mission.flow.support) return state;
      const match = mission.flow.support.transitions.find(
        (transition) =>
          transition.fromStateId === progress.stateId &&
          transition.playerId === action.playerId &&
          transition.toCellId === action.toCellId,
      );
      if (!match) return state;
      const sequenceSteps = [
        ...(progress.move ? [{ kind: "move" as const, playerId: progress.move.playerId, toCellId: progress.move.toCellId }] : []),
        ...(progress.pass ? [{ kind: "pass" as const, laneId: progress.pass.laneId }] : []),
        { kind: "support" as const, playerId: action.playerId, toCellId: action.toCellId },
      ];
      const sequenceEvaluation =
        mission.acceptedSequenceIds.length > 0 ? evaluateSequence(mission, sequenceSteps) : null;
      return replaceProgress(state, {
        ...progress,
        revision: progress.revision + 1,
        stateId: match.nextStateId,
        support: {
          playerId: action.playerId,
          toCellId: action.toCellId,
          evidenceKeys: [...action.evidenceKeys],
          evaluation: { accepted: true, laneId: null, blockedByPlayerIds: [], evidenceKeys: ["support-approved"] },
          sequenceEvaluation,
        },
      });
    }
    default:
      return state;
  }
}

function stateAt(mission: PassMissionRecord, stateId: string) {
  const found = mission.states.find((candidate) => candidate.id === stateId);
  if (!found) throw new Error(`state를 찾을 수 없다: ${stateId}`);
  return found;
}

function replaceProgress(state: SessionState, progress: MissionProgress): SessionState {
  const updated = state.missions.map((candidate, index) => (index === state.missionIndex ? progress : candidate));
  return { ...state, missions: updated };
}

function advance(state: SessionState): SessionState {
  if (state.step === "INTRO") {
    return { ...state, step: firstStepOf(missions[0]), focusToken: state.focusToken + 1 };
  }
  if (state.step === "REPORT") return state;

  const mission = currentMission(state);
  const progress = state.missions[state.missionIndex];
  if (!hasAnswer(state.step, progress)) return state;

  const stepIndex = mission.flow.steps.indexOf(state.step);
  if (stepIndex === -1) return state;

  if (stepIndex < mission.flow.steps.length - 1) {
    const nextStep = mission.flow.steps[stepIndex + 1];
    return {
      ...state,
      step: nextStep,
      missions: withStateId(state, state.missionIndex, boardStateIdForStep(mission, progress, nextStep)),
      focusToken: state.focusToken + 1,
    };
  }

  const nextIndex = state.missionIndex + 1;
  if (nextIndex >= missions.length) {
    return { ...state, step: "REPORT", focusToken: state.focusToken + 1 };
  }
  return {
    ...state,
    missionIndex: nextIndex,
    step: firstStepOf(missions[nextIndex]),
    focusToken: state.focusToken + 1,
  };
}

function goBack(state: SessionState): SessionState {
  if (state.step === "INTRO" || state.step === "REPORT") return state;

  const mission = currentMission(state);
  const progress = state.missions[state.missionIndex];
  const stepIndex = mission.flow.steps.indexOf(state.step);

  if (stepIndex > 0) {
    const previousStep = mission.flow.steps[stepIndex - 1];
    return {
      ...state,
      step: previousStep,
      missions: withStateId(state, state.missionIndex, boardStateIdForStep(mission, progress, previousStep)),
      focusToken: state.focusToken + 1,
    };
  }
  if (state.missionIndex === 0) {
    return { ...state, step: "INTRO", focusToken: state.focusToken + 1 };
  }
  const previousIndex = state.missionIndex - 1;
  const previousMission = missions[previousIndex];
  const previousProgress = state.missions[previousIndex];
  const previousStep = previousMission.flow.steps[previousMission.flow.steps.length - 1];
  return {
    ...state,
    missionIndex: previousIndex,
    step: previousStep,
    missions: withStateId(state, previousIndex, boardStateIdForStep(previousMission, previousProgress, previousStep)),
    focusToken: state.focusToken + 1,
  };
}

/** 응답 기록을 다시 걸어 해당 단계 시점의 경기판 state를 복원한다. */
function boardStateIdForStep(
  mission: PassMissionRecord,
  progress: MissionProgress,
  targetStep: SessionStep,
): string {
  let stateId = mission.flow.firstStateId;
  for (const step of mission.flow.steps) {
    if (step === "MOVE" && progress.move) {
      const match = mission.flow.move?.transitions.find(
        (transition) => transition.fromStateId === stateId && transition.playerId === progress.move!.playerId,
      );
      if (match) stateId = match.nextStateId;
    }
    if (step === "PASS" && progress.pass && progress.pass.evaluation.accepted && !progress.pass.deferred) {
      const match = mission.flow.pass?.transitions.find(
        (transition) => transition.fromStateId === stateId && transition.laneId === progress.pass!.laneId,
      );
      if (match) stateId = match.nextStateId;
    }
    if (step === "REVEAL") {
      const match = mission.flow.reveal?.transitions.find(
        (transition) => transition.fromStateId === stateId,
      );
      if (match) stateId = match.nextStateId;
    }
    if (step === "SUPPORT" && progress.support) {
      const match = mission.flow.support?.transitions.find(
        (transition) => transition.fromStateId === stateId && transition.playerId === progress.support!.playerId,
      );
      if (match) stateId = match.nextStateId;
    }
    if (step === targetStep) break;
  }
  return stateId;
}

function withStateId(state: SessionState, missionIndex: number, stateId: string) {
  return state.missions.map((candidate, index) =>
    index === missionIndex ? { ...candidate, stateId } : candidate,
  );
}
