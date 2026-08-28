import type { PassMissionRecord, TacticsState } from "../../domain/types";

export type FeedbackTone = "good" | "think" | "info";

interface FeedbackPanelProps {
  readonly tone: FeedbackTone;
  readonly heading: string;
  readonly sentences: readonly string[];
  /** think 톤에는 모형의 한계 문장을 함께 보여 준다 (계획서 11장). */
  readonly showModelNote?: boolean;
}

export function FeedbackPanel({ tone, heading, sentences, showModelNote = false }: FeedbackPanelProps) {
  return (
    <div className={`feedback feedback--${tone}`} role="status">
      <p className="feedback__heading">{heading}</p>
      {sentences.length > 0 ? (
        <ul className="feedback__list">
          {sentences.map((sentence, index) => (
            <li key={`${index}-${sentence}`}>{sentence}</li>
          ))}
        </ul>
      ) : null}
      {showModelNote ? (
        <p className="feedback__model-note">
          이 판은 연습용 모형이에요. 실제 경기 전체를 대신하지 않아요.
        </p>
      ) : null}
    </div>
  );
}

/** 판정기의 evidenceKeys를 어린이용 문장으로 바꾼다. */
export function sentencesFromEvidence(
  evidenceKeys: readonly string[],
  mission: PassMissionRecord,
): string[] {
  return evidenceKeys
    .map((key) => sentenceFor(key, mission))
    .filter((sentence): sentence is string => sentence !== null);
}

function sentenceFor(key: string, mission: PassMissionRecord): string | null {
  const fixed = FIXED_SENTENCES[key];
  if (fixed) return fixed;
  if (key.startsWith("blocked-by:")) {
    const playerId = key.slice("blocked-by:".length);
    return `${playerId} 선수가 그 길을 막고 있어요.`;
  }
  if (key.startsWith("lane-opened:")) {
    const laneId = key.slice("lane-opened:".length);
    return `이 움직임으로 ${laneLabelText(mission, laneId)} 길이 다시 열려요.`;
  }
  if (key.startsWith("sequence-match:")) {
    const sequenceId = key.slice("sequence-match:".length);
    return `검수된 계획(${sequenceId})과 순서가 같아요. 이동 → 패스 → 지원이 완성됐어요.`;
  }
  return null;
}

const FIXED_SENTENCES: Record<string, string> = {
  "lane-open": "고른 길 위에 수비가 없어요. 그 길은 지금 열려 있어요.",
  "lane-blocked": "고른 길 위에 수비가 서 있어요.",
  "lane-not-found": "그 길은 이 판에 없어요. 판에 있는 길 중에서 골라요.",
  "lane-not-blocked": "지금은 막힌 길이 없어요.",
  "blocker-found": "막힌 길을 막은 수비를 바로 찾았어요.",
  "blocker-not-on-lane": "그 선수는 길을 막고 있지 않아요. 막힌 길 위의 수비를 다시 찾아요.",
  "support-approved": "정해진 지원 칸으로 움직였어요.",
  "support-not-approved": "그 칸은 이번에 정해진 지원 칸이 아니에요.",
  "sequence-mismatch": "아직 검수된 계획과 순서가 달라요. 이동 → 패스 → 지원 순서를 확인해요.",
};

function laneLabelText(mission: PassMissionRecord, laneId: string): string {
  for (const state of mission.states) {
    const lane = state.lanes.find((candidate) => candidate.id === laneId);
    if (lane) {
      const from = state.players.find((player) => player.id === lane.fromPlayerId);
      const to = state.players.find((player) => player.id === lane.toPlayerId);
      if (from && to) return `${from.roleLabel} → ${to.roleLabel}`;
    }
  }
  return laneId;
}

/** state 안에서 선수 roleLabel을 찾는 유틸(관찰 피드백 등에 사용). */
export function roleLabelOf(state: TacticsState, playerId: string): string {
  return state.players.find((player) => player.id === playerId)?.roleLabel ?? playerId;
}
