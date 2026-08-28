// 콘텐츠 무결성 검증기 (계획서 7.2).
// 잘못된 콘텐츠는 개발·빌드 시 예외로 중단하고, 학생 화면에서 추측해 복구하지 않는다.
import { cellDistance, isInsideGrid, parseCellId } from "../domain/grid";
import type {
  PassMissionRecord,
  PlayerToken,
  RevealTransition,
  SequenceStep,
  StateTransition,
  TacticsState,
} from "../domain/types";
import { MISSION_IDS } from "./missionIds";

function findState(mission: PassMissionRecord, stateId: string): TacticsState | undefined {
  return mission.states.find((candidate) => candidate.id === stateId);
}

function cellMap(state: TacticsState): Map<string, PlayerToken> {
  return new Map(state.players.map((player) => [player.id, player]));
}

function ballHolderIds(state: TacticsState): string[] {
  return state.players.filter((player) => player.hasBall).map((player) => player.id);
}

export function validateMissions(missions: readonly PassMissionRecord[]): void {
  const errors: string[] = [];

  if (missions.length !== MISSION_IDS.length) {
    errors.push(`미션은 정확히 ${MISSION_IDS.length}개여야 한다 (현재 ${missions.length}개)`);
  }

  const seenIds = new Set<string>();
  for (const mission of missions) {
    if (seenIds.has(mission.id)) {
      errors.push(`미션 ID가 중복된다: ${mission.id}`);
    }
    seenIds.add(mission.id);
  }

  missions.forEach((mission, index) => {
    const prefix = `[${mission.id}]`;
    validateMetadata(mission, prefix, errors);
    validateStates(mission, prefix, errors);
    validateLanes(mission, prefix, errors);
    validateFlow(mission, prefix, errors);
    validateSequences(mission, prefix, errors);
    validateAcceptedOptionMinimum(mission, prefix, index, errors);
  });

  if (errors.length > 0) {
    throw new Error(`콘텐츠 검증 실패:\n- ${errors.join("\n- ")}`);
  }
}

function validateMetadata(
  mission: PassMissionRecord,
  prefix: string,
  errors: string[],
): void {
  if (mission.sourceNote.trim().length === 0) {
    errors.push(`${prefix} sourceNote가 비어 있다`);
  }
  if (mission.misconceptionGuard.trim().length === 0) {
    errors.push(`${prefix} misconceptionGuard(오개념 방지 문구)가 비어 있다`);
  }
  if (mission.reviewStatus !== "pending" && mission.reviewStatus !== "approved") {
    errors.push(`${prefix} reviewStatus는 pending 또는 approved만 허용된다 (현재 ${String(mission.reviewStatus)})`);
  }
}

function validateStates(
  mission: PassMissionRecord,
  prefix: string,
  errors: string[],
): void {
  const stateIds = new Set<string>();
  for (const state of mission.states) {
    if (stateIds.has(state.id)) {
      errors.push(`${prefix} state ID가 중복된다: ${state.id}`);
    }
    stateIds.add(state.id);

    const seenCells = new Set<string>();
    for (const player of state.players) {
      if (!isInsideGrid(player.cell)) {
        errors.push(`${prefix} state ${state.id}의 선수 ${player.id} 좌표가 격자를 벗어난다`);
        continue;
      }
      const cellKey = `c${player.cell.column}r${player.cell.row}`;
      if (seenCells.has(cellKey)) {
        errors.push(`${prefix} state ${state.id}에서 선수 좌표가 겹친다: ${cellKey}`);
      }
      seenCells.add(cellKey);
    }

    const holders = ballHolderIds(state);
    if (holders.length !== 1) {
      errors.push(`${prefix} state ${state.id}에서 공을 가진 선수가 정확히 한 명이어야 한다 (현재 ${holders.length}명)`);
    }
  }

  if (!findState(mission, mission.flow.firstStateId)) {
    errors.push(`${prefix} flow.firstStateId가 존재하지 않는 state를 참조한다: ${mission.flow.firstStateId}`);
  }
}

function validateLanes(
  mission: PassMissionRecord,
  prefix: string,
  errors: string[],
): void {
  const openLaneIdSet = new Set(mission.openLaneIds);
  for (const state of mission.states) {
    const players = cellMap(state);
    for (const lane of state.lanes) {
      if (!players.has(lane.fromPlayerId) || !players.has(lane.toPlayerId)) {
        errors.push(
          `${prefix} state ${state.id}의 lane ${lane.id}이(가) 존재하지 않는 선수를 참조한다 (${lane.fromPlayerId} → ${lane.toPlayerId})`,
        );
      }
      for (const blockerId of lane.blockedByPlayerIds) {
        if (!players.has(blockerId)) {
          errors.push(`${prefix} state ${state.id}의 lane ${lane.id}이(가) 존재하지 않는 수비 ${blockerId}을(를) 참조한다`);
        }
      }
      for (const supportCellId of lane.nextSupportCellIds) {
        const cell = parseCellId(supportCellId);
        if (!cell || !isInsideGrid(cell)) {
          errors.push(`${prefix} state ${state.id}의 lane ${lane.id} nextSupportCellIds에 올바르지 않은 지원 칸이 있다: ${supportCellId}`);
        }
      }
      if (lane.blockedByPlayerIds.length === 0 && !openLaneIdSet.has(lane.id)) {
        errors.push(`${prefix} state ${state.id}의 열린 lane ${lane.id}이(가) 미션 openLaneIds에 없다`);
      }
    }
  }

  for (const laneId of mission.openLaneIds) {
    const openSomewhere = mission.states.some((state) =>
      state.lanes.some((lane) => lane.id === laneId && lane.blockedByPlayerIds.length === 0),
    );
    if (!openSomewhere) {
      errors.push(`${prefix} openLaneIds의 ${laneId}은(는) 어떤 state에서도 열려 있지 않다`);
    }
  }
}

function validateFlow(
  mission: PassMissionRecord,
  prefix: string,
  errors: string[],
): void {
  const flow = mission.flow;
  for (const step of flow.steps) {
    if (step === "INTRO" || step === "REPORT") {
      errors.push(`${prefix} flow 단계는 학습 단계만 허용된다 (INTRO·REPORT 포함 불가): ${step}`);
      continue;
    }
    const phase = {
      OBSERVE: flow.observe,
      PREDICT: flow.predict,
      MOVE: flow.move,
      PASS: flow.pass,
      REVEAL: flow.reveal,
      SUPPORT: flow.support,
    }[step];
    if (!phase) {
      errors.push(`${prefix} flow 단계 ${step}에 해당하는 페이즈 데이터가 없다`);
    }
  }
  if (flow.steps[0] !== "OBSERVE") {
    errors.push(`${prefix} flow는 OBSERVE 단계로 시작해야 한다`);
  }

  const usedSupportCellIds = new Set<string>();
  for (const transition of [...(flow.move?.transitions ?? []), ...(flow.support?.transitions ?? [])]) {
    validateStateTransition(mission, transition, prefix, errors);
    usedSupportCellIds.add(transition.toCellId);
  }
  for (const transition of flow.pass?.transitions ?? []) {
    validatePassTransition(mission, transition, prefix, errors);
  }
  for (const transition of flow.reveal?.transitions ?? []) {
    validateRevealTransition(mission, transition, prefix, errors);
  }
  if (flow.predict && !findState(mission, flow.predict.stateId)) {
    errors.push(`${prefix} predict.stateId가 존재하지 않는 state를 참조한다: ${flow.predict.stateId}`);
  }

  for (const cellId of mission.approvedSupportCellIds) {
    const cell = parseCellId(cellId);
    if (!usedSupportCellIds.has(cellId) || !cell || !isInsideGrid(cell)) {
      errors.push(`${prefix} 승인 지원 칸 ${cellId}이(가) 흐름의 이동·지원 전이에 없거나 격자에 없다`);
    }
  }
  for (const cellId of usedSupportCellIds) {
    if (!mission.approvedSupportCellIds.includes(cellId)) {
      errors.push(`${prefix} 이동·지원 전이의 칸 ${cellId}이(가) 승인 지원 칸 목록에 없다`);
    }
  }
}

function validateStateTransition(
  mission: PassMissionRecord,
  transition: StateTransition,
  prefix: string,
  errors: string[],
): void {
  const from = findState(mission, transition.fromStateId);
  const to = findState(mission, transition.nextStateId);
  if (!from || !to) {
    errors.push(`${prefix} 이동 전이가 존재하지 않는 state를 참조한다: ${transition.fromStateId} → ${transition.nextStateId}`);
    return;
  }
  const toCell = parseCellId(transition.toCellId);
  if (!toCell || !isInsideGrid(toCell)) {
    errors.push(`${prefix} 이동 전이의 칸이 올바르지 않다: ${transition.toCellId}`);
    return;
  }

  const fromMap = cellMap(from);
  const toMap = cellMap(to);
  const moverFrom = fromMap.get(transition.playerId);
  const moverTo = toMap.get(transition.playerId);
  if (!moverFrom || !moverTo) {
    errors.push(`${prefix} 이동 전이의 선수 ${transition.playerId}이(가) state에 없다`);
    return;
  }
  if (cellDistance(moverFrom.cell, moverTo.cell) !== 1) {
    errors.push(`${prefix} 선수 ${transition.playerId}의 이동이 한 칸이 아니다: ${transition.fromStateId} → ${transition.nextStateId}`);
  }
  if (cellDistance(moverFrom.cell, toCell) !== 1) {
    errors.push(`${prefix} 이동 전이 ${transition.toCellId}은(는) 한 칸 이동이 아니다`);
  }
  if (moverTo.cell.column !== toCell.column || moverTo.cell.row !== toCell.row) {
    errors.push(`${prefix} 이동 전이의 목표 칸 ${transition.toCellId}과(와) 다음 state의 선수 자리가 일치하지 않는다: ${transition.nextStateId}`);
  }

  const moved = new Set<string>();
  for (const [playerId, fromPlayer] of fromMap) {
    const toPlayer = toMap.get(playerId);
    if (!toPlayer || toPlayer.cell.column !== fromPlayer.cell.column || toPlayer.cell.row !== fromPlayer.cell.row) {
      moved.add(playerId);
    }
  }
  const expected = new Set([transition.playerId]);
  if (moved.size !== 1 || !moved.has(transition.playerId) || moved.size !== expected.size) {
    errors.push(`${prefix} 이동 전이 뒤 state가 이동한 선수 ${transition.playerId}의 자리와 일치하지 않는다: ${transition.nextStateId}`);
  }
  if (ballHolderIds(from).sort().join(",") !== ballHolderIds(to).sort().join(",")) {
    errors.push(`${prefix} 이동 전이에서 공 소유자가 바뀐다: ${transition.nextStateId}`);
  }
}

function validatePassTransition(
  mission: PassMissionRecord,
  transition: { readonly fromStateId: string; readonly laneId: string; readonly nextStateId: string },
  prefix: string,
  errors: string[],
): void {
  const from = findState(mission, transition.fromStateId);
  const to = findState(mission, transition.nextStateId);
  if (!from || !to) {
    errors.push(`${prefix} 패스 전이가 존재하지 않는 state를 참조한다: ${transition.fromStateId} → ${transition.nextStateId}`);
    return;
  }
  const lane = from.lanes.find((candidate) => candidate.id === transition.laneId);
  if (!lane) {
    errors.push(`${prefix} 패스 전이의 lane ${transition.laneId}이(가) state ${from.id}에 없다`);
    return;
  }
  const fromHolders = ballHolderIds(from);
  const toHolders = ballHolderIds(to);
  const sameCells = from.players.every((fromPlayer) => {
    const toPlayer = to.players.find((candidate) => candidate.id === fromPlayer.id);
    return (
      toPlayer &&
      toPlayer.cell.column === fromPlayer.cell.column &&
      toPlayer.cell.row === fromPlayer.cell.row
    );
  });
  if (!sameCells || toHolders.length !== 1 || toHolders[0] !== lane.toPlayerId || fromHolders.length !== 1 || fromHolders[0] !== lane.fromPlayerId) {
    errors.push(`${prefix} 패스 전이 뒤 공이 받을 사람 ${lane.toPlayerId}에게 있지 않다: ${transition.nextStateId}`);
  }
}

function validateRevealTransition(
  mission: PassMissionRecord,
  transition: RevealTransition,
  prefix: string,
  errors: string[],
): void {
  const from = findState(mission, transition.fromStateId);
  const to = findState(mission, transition.nextStateId);
  if (!from || !to) {
    errors.push(`${prefix} 수비 공개 전이가 존재하지 않는 state를 참조한다: ${transition.fromStateId} → ${transition.nextStateId}`);
    return;
  }
  const toCell = parseCellId(transition.toCellId);
  if (!toCell || !isInsideGrid(toCell)) {
    errors.push(`${prefix} 수비 공개 전이의 칸이 올바르지 않다: ${transition.toCellId}`);
    return;
  }
  const defenderFrom = cellMap(from).get(mission.flow.reveal?.defenderId ?? "");
  const defenderTo = cellMap(to).get(mission.flow.reveal?.defenderId ?? "");
  if (!defenderFrom || !defenderTo) {
    errors.push(`${prefix} 수비 공개 전이의 수비 ${mission.flow.reveal?.defenderId}이(가) state에 없다`);
    return;
  }
  if (cellDistance(defenderFrom.cell, toCell) !== 1) {
    errors.push(`${prefix} 수비 공개 이동이 한 칸이 아니다: ${transition.toCellId}`);
  }
  if (defenderTo.cell.column !== toCell.column || defenderTo.cell.row !== toCell.row) {
    errors.push(`${prefix} 수비 공개 뒤 state에서 수비가 새 칸 ${transition.toCellId}에 없다: ${transition.nextStateId}`);
  }
  const moved = new Set<string>();
  for (const [playerId, fromPlayer] of cellMap(from)) {
    const toPlayer = cellMap(to).get(playerId);
    if (!toPlayer || toPlayer.cell.column !== fromPlayer.cell.column || toPlayer.cell.row !== fromPlayer.cell.row) {
      moved.add(playerId);
    }
  }
  if (moved.size !== 1 || !moved.has(mission.flow.reveal?.defenderId ?? "")) {
    errors.push(`${prefix} 수비 공개 전이에서 수비 외의 선수가 움직인다: ${transition.nextStateId}`);
  }
  if (ballHolderIds(from).sort().join(",") !== ballHolderIds(to).sort().join(",")) {
    errors.push(`${prefix} 수비 공개 전이에서 공 소유자가 바뀐다: ${transition.nextStateId}`);
  }
}

function validateSequences(
  mission: PassMissionRecord,
  prefix: string,
  errors: string[],
): void {
  for (const sequenceId of mission.acceptedSequenceIds) {
    const steps = mission.flow.sequenceStepsById[sequenceId];
    if (!steps || steps.length === 0) {
      errors.push(`${prefix} 승인 sequence ${sequenceId}의 단계가 flow.sequenceStepsById에 없다`);
      continue;
    }
    walkSequence(mission, sequenceId, steps, prefix, errors);
  }
}

function walkSequence(
  mission: PassMissionRecord,
  sequenceId: string,
  steps: readonly SequenceStep[],
  prefix: string,
  errors: string[],
): void {
  let currentStateId = mission.flow.firstStateId;
  for (const step of steps) {
    const currentState = findState(mission, currentStateId);
    if (!currentState) {
      errors.push(`${prefix} sequence ${sequenceId}가 존재하지 않는 state에 도달한다: ${currentStateId}`);
      return;
    }
    if (step.kind === "move") {
      const match = mission.flow.move?.transitions.find(
        (transition) =>
          transition.fromStateId === currentStateId &&
          transition.playerId === step.playerId &&
          transition.toCellId === step.toCellId,
      );
      if (!match) {
        errors.push(`${prefix} sequence ${sequenceId}의 이동 단계가 흐름과 맞지 않는다`);
        return;
      }
      currentStateId = match.nextStateId;
    } else if (step.kind === "pass") {
      const lane = currentState.lanes.find((candidate) => candidate.id === step.laneId);
      if (!lane || lane.blockedByPlayerIds.length > 0) {
        errors.push(`${prefix} sequence ${sequenceId}의 패스 ${step.laneId}은(는) 그 state에서 열려 있지 않다`);
        return;
      }
      const match = mission.flow.pass?.transitions.find(
        (transition) => transition.fromStateId === currentStateId && transition.laneId === step.laneId,
      );
      if (!match) {
        errors.push(`${prefix} sequence ${sequenceId}의 패스 단계가 흐름과 맞지 않는다`);
        return;
      }
      currentStateId = match.nextStateId;
    } else {
      const match = mission.flow.support?.transitions.find(
        (transition) =>
          transition.fromStateId === currentStateId &&
          transition.playerId === step.playerId &&
          transition.toCellId === step.toCellId,
      );
      if (!match) {
        errors.push(`${prefix} sequence ${sequenceId}의 지원 단계가 흐름과 맞지 않는다`);
        return;
      }
      currentStateId = match.nextStateId;
    }
  }
}

function validateAcceptedOptionMinimum(
  mission: PassMissionRecord,
  prefix: string,
  index: number,
  errors: string[],
): void {
  const acceptedOptionCount =
    mission.openLaneIds.length +
    mission.approvedSupportCellIds.length +
    mission.acceptedSequenceIds.length;
  if (acceptedOptionCount < 2) {
    errors.push(`${prefix} ${index + 1}번 미션은 최소 2개의 승인된 선택지(복수 해법)를 제공해야 한다`);
  }
}
