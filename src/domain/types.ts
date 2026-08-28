// 계획서 7.1 TypeScript 계약: 순수 도메인 타입.
// UI·React에 의존하지 않고, 콘텐츠 데이터와 판정 함수가 함께 사용한다.

export type MissionId =
  | "pass-lane-01"
  | "pass-defender-02"
  | "pass-move-03"
  | "pass-two-options-04"
  | "pass-after-05"
  | "pass-plan-06";

export type Team = "attack" | "defense";

export interface GridCell {
  readonly column: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly row: 0 | 1 | 2 | 3 | 4;
}

export interface PlayerToken {
  readonly id: string;
  readonly team: Team;
  readonly roleLabel: string;
  readonly cell: GridCell;
  readonly hasBall: boolean;
}

export interface PassLane {
  readonly id: string;
  readonly fromPlayerId: string;
  readonly toPlayerId: string;
  readonly blockedByPlayerIds: readonly string[];
  readonly nextSupportCellIds: readonly string[];
}

export interface TacticsState {
  readonly id: string;
  readonly players: readonly PlayerToken[];
  readonly lanes: readonly PassLane[];
}

export interface PassMission {
  readonly id: MissionId;
  readonly states: readonly TacticsState[];
  readonly openLaneIds: readonly string[];
  readonly approvedSupportCellIds: readonly string[];
  readonly acceptedSequenceIds: readonly string[];
  readonly sourceNote: string;
  readonly reviewStatus: "pending" | "approved";
  readonly misconceptionGuard: string;
}

export interface PassEvaluation {
  readonly accepted: boolean;
  readonly laneId: string | null;
  readonly blockedByPlayerIds: readonly string[];
  readonly evidenceKeys: readonly string[];
}

export type SessionStep =
  | "INTRO"
  | "OBSERVE"
  | "PREDICT"
  | "MOVE"
  | "PASS"
  | "REVEAL"
  | "SUPPORT"
  | "REPORT";

// ---------------------------------------------------------------------------
// 학습 흐름(단계·전이) 콘텐츠 계약. 검수 데이터는 PassMission + flow로 기록된다.
// ---------------------------------------------------------------------------

export interface EvidenceOption {
  readonly key: string;
  readonly label: string;
}

export interface ObservePhase {
  readonly prompt: string;
  readonly ballHolderPlayerId: string;
}

export interface PredictPhase {
  readonly stateId: string;
  readonly prompt: string;
  readonly evidenceOptions: readonly EvidenceOption[];
}

/** 선수의 한 칸 이동(지원 이동·다음 지원) 전이. */
export interface StateTransition {
  readonly fromStateId: string;
  readonly playerId: string;
  readonly toCellId: string;
  readonly nextStateId: string;
}

/** 패스 실행 전이: 공이 받을 사람에게 옮겨 간다. */
export interface PassTransition {
  readonly fromStateId: string;
  readonly laneId: string;
  readonly nextStateId: string;
}

/** 수비 공개 전이: 수비가 한 칸 움직인다. */
export interface RevealTransition {
  readonly fromStateId: string;
  readonly toCellId: string;
  readonly nextStateId: string;
}

export interface MovePhase {
  readonly prompt: string;
  readonly transitions: readonly StateTransition[];
  readonly evidenceOptions: readonly EvidenceOption[];
}

export interface PassPhase {
  readonly prompt: string;
  readonly transitions: readonly PassTransition[];
  readonly evidenceOptions: readonly EvidenceOption[];
}

export interface RevealPhase {
  readonly defenderId: string;
  readonly prompt: string;
  readonly transitions: readonly RevealTransition[];
}

export interface SupportPhase {
  readonly prompt: string;
  readonly transitions: readonly StateTransition[];
  readonly evidenceOptions: readonly EvidenceOption[];
}

export type SequenceStep =
  | { readonly kind: "move"; readonly playerId: string; readonly toCellId: string }
  | { readonly kind: "pass"; readonly laneId: string }
  | { readonly kind: "support"; readonly playerId: string; readonly toCellId: string };

export interface MissionFlow {
  readonly title: string;
  readonly intro: string;
  readonly steps: readonly SessionStep[];
  readonly firstStateId: string;
  readonly observe: ObservePhase;
  readonly predict?: PredictPhase;
  readonly move?: MovePhase;
  readonly pass?: PassPhase;
  readonly reveal?: RevealPhase;
  readonly support?: SupportPhase;
  readonly sequenceStepsById: Readonly<Record<string, readonly SequenceStep[]>>;
}

export type PassMissionRecord = PassMission & { readonly flow: MissionFlow };
