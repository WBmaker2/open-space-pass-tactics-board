import { ActionButton } from "../../components/ActionButton";
import { cellId as cellIdOf, parseCellId } from "../../domain/grid";
import type { EvidenceOption, PassMissionRecord, TacticsState } from "../../domain/types";
import type { MissionProgress } from "../../app/sessionReducer";
import { FeedbackPanel, sentencesFromEvidence } from "./FeedbackPanel";

interface PanelSharedProps {
  readonly mission: PassMissionRecord;
  readonly progress: MissionProgress;
}

function directionWord(fromCellId: string, toCellId: string): string {
  const from = parseCellId(fromCellId);
  const to = parseCellId(toCellId);
  if (!from || !to) return "";
  const parts: string[] = [];
  if (to.column > from.column) parts.push("오른쪽");
  if (to.column < from.column) parts.push("왼쪽");
  if (to.row < from.row) parts.push("위");
  if (to.row > from.row) parts.push("아래");
  return parts.length > 0 ? `${parts.join(" ")} 한 칸` : "한 칸";
}

function positionLabel(cellId: string): string {
  const cell = parseCellId(cellId);
  if (!cell) return "판 위";
  const horizontal = cell.column <= 1 ? "왼쪽" : cell.column >= 5 ? "오른쪽" : "가운데";
  const vertical = cell.row <= 1 ? "위" : cell.row >= 3 ? "아래" : "가운데";
  if (horizontal === "가운데" && vertical === "가운데") return "가운데";
  if (horizontal === "가운데") return vertical;
  if (vertical === "가운데") return horizontal;
  return `${horizontal} ${vertical}`;
}

function laneChoiceLabel(state: TacticsState, laneId: string): string {
  const lane = state.lanes.find((candidate) => candidate.id === laneId);
  if (!lane) return laneId;
  const from = state.players.find((player) => player.id === lane.fromPlayerId);
  const to = state.players.find((player) => player.id === lane.toPlayerId);
  if (!from || !to) return laneId;
  return `${positionLabel(cellIdOf(from.cell))} 선수 → ${positionLabel(cellIdOf(to.cell))} 선수`;
}

export function EvidenceChips({
  options,
  selected,
  onToggle,
}: {
  readonly options: readonly EvidenceOption[];
  readonly selected: readonly string[];
  readonly onToggle: (keys: readonly string[]) => void;
}) {
  if (options.length === 0) return null;
  function toggle(key: string) {
    onToggle(
      selected.includes(key) ? selected.filter((candidate) => candidate !== key) : [...selected, key],
    );
  }
  return (
    <fieldset className="field-group">
      <legend>내 근거 골라 보기 (여러 개 골라도 돼요)</legend>
      {options.map((option) => (
        <label key={option.key} className="choice-label">
          <input
            type="checkbox"
            checked={selected.includes(option.key)}
            onChange={() => toggle(option.key)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

type ObserveProps = PanelSharedProps & { readonly boardState: TacticsState };

export function ObservePanel({ boardState, progress }: ObserveProps) {
  const answered = progress.observePlayerId !== null;
  if (!answered) {
    return <p className="workbench__prompt">공 아이콘이 있는 선수를 경기판에서 찾아 눌러 보세요.</p>;
  }
  const holder = boardState.players.find((player) => player.hasBall);
  const correct = progress.observePlayerId === holder?.id;
  return correct ? (
    <FeedbackPanel
      tone="good"
      heading="잘 찾았어요!"
      sentences={["공을 가진 선수를 찾았어요."]}
    />
  ) : (
    <FeedbackPanel
      tone="think"
      heading="다시 볼까요?"
      sentences={[
        "방금 고른 선수는 공을 가지고 있지 않아요. 공 아이콘이 붙은 선수를 눌러요.",
      ]}
      showModelNote
    />
  );
}

type PredictProps = PanelSharedProps & {
  readonly predictState: TacticsState;
  readonly selectedLaneId: string | null;
  readonly onSelectLane: (laneId: string | null) => void;
  readonly evidenceKeys: readonly string[];
  readonly onToggleEvidence: (keys: readonly string[]) => void;
  readonly onConfirm: () => void;
};

export function PredictPanel({
  mission,
  predictState,
  selectedLaneId,
  onSelectLane,
  evidenceKeys,
  onToggleEvidence,
  onConfirm,
  progress,
}: PredictProps) {
  const evaluation = progress.predict?.evaluation;
  return (
    <>
      <p className="workbench__prompt">{mission.flow.predict?.prompt}</p>
      <fieldset className="field-group">
        <legend>패스 길 고르기</legend>
        {predictState.lanes.map((lane) => (
          <label key={lane.id} className="choice-label choice-label--lane">
            <input
              type="radio"
              name="predict-lane"
              checked={selectedLaneId === lane.id}
              onChange={() => onSelectLane(lane.id)}
            />
            {laneChoiceLabel(predictState, lane.id)}
          </label>
        ))}
      </fieldset>
      <EvidenceChips
        options={mission.flow.predict?.evidenceOptions ?? []}
        selected={evidenceKeys}
        onToggle={onToggleEvidence}
      />
      <ActionButton
        variant="primary"
        disabled={selectedLaneId === null}
        onClick={onConfirm}
      >
        생각 확인하기
      </ActionButton>
      {evaluation ? (
        evaluation.accepted ? (
          <FeedbackPanel
            tone="good"
            heading="좋은 예측이에요!"
            sentences={sentencesFromEvidence(evaluation.evidenceKeys, mission)}
          />
        ) : (
          <FeedbackPanel
            tone="think"
            heading="다시 볼까요?"
            sentences={[
              ...sentencesFromEvidence(evaluation.evidenceKeys, mission),
              "이어서 패스 길을 정할 때 다시 골라 볼 수 있어요.",
            ]}
            showModelNote
          />
        )
      ) : null}
    </>
  );
}

type MoveProps = PanelSharedProps & {
  readonly stateId: string;
  readonly selectedCellId: string | null;
  readonly onSelectCell: (cellId: string | null) => void;
  readonly evidenceKeys: readonly string[];
  readonly onToggleEvidence: (keys: readonly string[]) => void;
  readonly onConfirm: () => void;
};

export function MovePanel({
  mission,
  stateId,
  selectedCellId,
  onSelectCell,
  evidenceKeys,
  onToggleEvidence,
  onConfirm,
  progress,
}: MoveProps) {
  const options = (mission.flow.move?.transitions ?? []).filter(
    (transition) => transition.fromStateId === stateId,
  );
  const answered = progress.move !== null;
  return (
    <>
      <p className="workbench__prompt">{mission.flow.move?.prompt}</p>
      <fieldset className="field-group">
        <legend>이동하기</legend>
        {options.map((transition) => {
          const fromState = mission.states.find((candidate) => candidate.id === stateId);
          const mover = fromState?.players.find((player) => player.id === transition.playerId);
          const direction = mover
            ? directionWord(cellIdOf(mover.cell), transition.toCellId)
            : "";
          const value = `${transition.playerId}:${transition.toCellId}`;
          return (
            <label key={value} className="choice-label">
              <input
                type="radio"
                name="move-target"
                checked={selectedCellId === transition.toCellId}
                onChange={() => onSelectCell(transition.toCellId)}
              />
              {positionLabel(mover ? cellIdOf(mover.cell) : "")}에 있는 선수 → {direction} 옮기기
            </label>
          );
        })}
      </fieldset>
      <EvidenceChips
        options={mission.flow.move?.evidenceOptions ?? []}
        selected={evidenceKeys}
        onToggle={onToggleEvidence}
      />
      <ActionButton variant="primary" disabled={selectedCellId === null} onClick={onConfirm}>
        이동해 보기
      </ActionButton>
      {answered ? (
        <FeedbackPanel
          tone="info"
          heading="이동했어요!"
          sentences={["받을 사람이 한 칸 움직였어요. 이제 패스 길을 확인해요."]}
        />
      ) : null}
    </>
  );
}

type PassProps = PanelSharedProps & {
  readonly boardState: TacticsState;
  readonly selectedLaneId: string | null;
  readonly onSelectLane: (laneId: string | null) => void;
  readonly evidenceKeys: readonly string[];
  readonly onToggleEvidence: (keys: readonly string[]) => void;
  readonly onConfirm: (deferred: boolean) => void;
};

export function PassPanel({
  mission,
  boardState,
  progress,
  selectedLaneId,
  onSelectLane,
  evidenceKeys,
  onToggleEvidence,
  onConfirm,
}: PassProps) {
  const answer = progress.pass;
  const hasBlockedLane = boardState.lanes.some((lane) => lane.blockedByPlayerIds.length > 0);
  const showRetryHint = answer != null && !answer.evaluation.accepted && !answer.deferred;

  return (
    <>
      <p className="workbench__prompt">{mission.flow.pass?.prompt}</p>
      <fieldset className="field-group">
        <legend>패스 길 고르기</legend>
        {boardState.lanes.map((lane) => (
          <label key={lane.id} className="choice-label choice-label--lane">
            <input
              type="radio"
              name="pass-lane"
              checked={selectedLaneId === lane.id}
              onChange={() => onSelectLane(lane.id)}
            />
            {laneChoiceLabel(boardState, lane.id)}
          </label>
        ))}
      </fieldset>
      {hasBlockedLane ? (
        <p className="workbench__hint">막힌 길을 막고 있는 수비를 경기판에서 찾아 눌러요.</p>
      ) : null}
      <EvidenceChips
        options={mission.flow.pass?.evidenceOptions ?? []}
        selected={evidenceKeys}
        onToggle={onToggleEvidence}
      />
      <div className="workbench__actions">
        <ActionButton
          variant="primary"
          pulse
          disabled={selectedLaneId === null}
          onClick={() => onConfirm(false)}
        >
          패스 길 확인
        </ActionButton>
        {showRetryHint ? (
          <ActionButton onClick={() => onConfirm(true)}>판단 보류하기</ActionButton>
        ) : null}
      </div>
      {answer ? (
        answer.deferred ? (
          <FeedbackPanel
            tone="info"
            heading="판단을 보류했어요"
            sentences={["기록에 남겼어요. 근거를 더 모아 보세요."]}
          />
        ) : answer.evaluation.accepted ? (
          <FeedbackPanel
            tone="good"
            heading="패스 성공!"
            sentences={[
              ...sentencesFromEvidence(answer.evaluation.evidenceKeys, mission),
              ...(answer.blockerEvaluation
                ? sentencesFromEvidence(answer.blockerEvaluation.evidenceKeys, mission)
                : []),
            ]}
          />
        ) : (
          <FeedbackPanel
            tone="think"
            heading="다시 볼까요?"
            sentences={[
              ...sentencesFromEvidence(answer.evaluation.evidenceKeys, mission),
              "한 번 다시 골라 볼 수 있어요.",
            ]}
            showModelNote
          />
        )
      ) : null}
    </>
  );
}

type RevealProps = PanelSharedProps & {
  readonly boardState: TacticsState;
  readonly revealChoice: "keep" | "revise" | null;
  readonly onSelectChoice: (choice: "keep" | "revise" | null) => void;
  readonly selectedLaneId: string | null;
  readonly onSelectLane: (laneId: string | null) => void;
  readonly onConfirm: () => void;
};

export function RevealPanel({
  mission,
  boardState,
  progress,
  revealChoice,
  onSelectChoice,
  selectedLaneId,
  onSelectLane,
  onConfirm,
}: RevealProps) {
  const reveal = mission.flow.reveal;
  const defender = boardState.players.find((player) => player.id === reveal?.defenderId);
  const answered = progress.reveal !== null;
  const canConfirm =
    revealChoice === "keep" || (revealChoice === "revise" && selectedLaneId !== null);

  return (
    <>
      <p className="workbench__prompt">{reveal?.prompt}</p>
      <p className="workbench__hint">
        수비 {reveal?.defenderId}이 {defender ? cellIdOf(defender.cell) : ""} 칸으로 움직였어요.
      </p>
      <fieldset className="field-group">
        <legend>계획 정하기</legend>
        <label className="choice-label">
          <input
            type="radio"
            name="reveal-choice"
            checked={revealChoice === "keep"}
            onChange={() => onSelectChoice("keep")}
          />
          계획을 유지할래요
        </label>
        <label className="choice-label">
          <input
            type="radio"
            name="reveal-choice"
            checked={revealChoice === "revise"}
            onChange={() => onSelectChoice("revise")}
          />
          수정할래요
        </label>
      </fieldset>
      {revealChoice === "revise" ? (
        <fieldset className="field-group">
          <legend>새로운 패스 길 고르기</legend>
          {boardState.lanes.map((lane) => (
            <label key={lane.id} className="choice-label choice-label--lane">
              <input
                type="radio"
                name="reveal-lane"
                checked={selectedLaneId === lane.id}
                onChange={() => onSelectLane(lane.id)}
              />
              {laneChoiceLabel(boardState, lane.id)}
            </label>
          ))}
        </fieldset>
      ) : null}
      <ActionButton variant="primary" disabled={!canConfirm} onClick={onConfirm}>
        계획 정하기
      </ActionButton>
      {answered ? (
        <FeedbackPanel
          tone="info"
          heading="기록했어요"
          sentences={[
            progress.reveal?.keptPlan
              ? "수비가 움직인 뒤에도 계획을 유지하기로 했어요."
              : "수비가 움직여서 계획을 수정하기로 했어요.",
          ]}
        />
      ) : null}
    </>
  );
}

type SupportProps = PanelSharedProps & {
  readonly stateId: string;
  readonly selectedCellId: string | null;
  readonly onSelectCell: (cellId: string | null) => void;
  readonly evidenceKeys: readonly string[];
  readonly onToggleEvidence: (keys: readonly string[]) => void;
  readonly onConfirm: () => void;
};

export function SupportPanel({
  mission,
  stateId,
  progress,
  selectedCellId,
  onSelectCell,
  evidenceKeys,
  onToggleEvidence,
  onConfirm,
}: SupportProps) {
  const options = (mission.flow.support?.transitions ?? []).filter(
    (transition) => transition.fromStateId === stateId,
  );
  const answer = progress.support;
  const sequence = answer?.sequenceEvaluation ?? null;

  return (
    <>
      <p className="workbench__prompt">{mission.flow.support?.prompt}</p>
      <fieldset className="field-group">
        <legend>지원 위치 고르기</legend>
        {options.map((transition) => {
          const fromState = mission.states.find((candidate) => candidate.id === stateId);
          const mover = fromState?.players.find((player) => player.id === transition.playerId);
          const direction = mover ? directionWord(cellIdOf(mover.cell), transition.toCellId) : "";
          return (
            <label key={`${transition.playerId}:${transition.toCellId}`} className="choice-label">
              <input
                type="radio"
                name="support-cell"
                checked={selectedCellId === transition.toCellId}
                onChange={() => onSelectCell(transition.toCellId)}
              />
              {positionLabel(mover ? cellIdOf(mover.cell) : "")}에 있는 선수 → {direction} 옮기기
            </label>
          );
        })}
      </fieldset>
      <EvidenceChips
        options={mission.flow.support?.evidenceOptions ?? []}
        selected={evidenceKeys}
        onToggle={onToggleEvidence}
      />
      <div className="workbench__actions">
        <ActionButton
          variant="primary"
          pulse
          disabled={selectedCellId === null}
          onClick={onConfirm}
        >
          다음 지원 시험
        </ActionButton>
      </div>
      {answer ? (
        <FeedbackPanel
          tone="good"
          heading="다음 패스 길이 열려요!"
          sentences={[
            ...sentencesFromEvidence(answer.evaluation.evidenceKeys, mission),
            ...(sequence ? sentencesFromEvidence(sequence.evidenceKeys, mission) : []),
          ]}
        />
      ) : null}
    </>
  );
}
