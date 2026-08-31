import type { RefObject } from "react";
import type { MissionProgress, SessionState } from "../../app/sessionReducer";
import { ActionButton } from "../../components/ActionButton";
import { missions } from "../../content/missions";
import { cellId as cellIdOf, parseCellId } from "../../domain/grid";
import type { PassLane, PassMissionRecord, TacticsState } from "../../domain/types";
import { TacticsBoard } from "../pass-tactics/TacticsBoard";
import "./report.css";
import "./print.css";

interface LearningReportProps {
  readonly session: SessionState;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

export function LearningReport({ session, headingRef }: LearningReportProps) {
  return (
    <section className="report" aria-labelledby="report-heading">
      <div className="report__intro">
        <h1 id="report-heading" ref={headingRef} tabIndex={-1}>
          전술 기록
        </h1>
        <p className="report__lead">점수나 순위는 없어요. 여러분의 생각을 기록했어요.</p>
        <p className="report__notice">
          이 기록은 이 탭에만 있어요. 새로고침하면 사라져요. 남기고 싶으면 인쇄하세요.
        </p>
      </div>

      <div className="report__section-heading">
        <h2>미션별 작전 기록</h2>
        <p>처음 생각과 판을 다시 보며, 어떤 근거를 사용했는지 살펴보세요.</p>
      </div>

      <div className="report__cards">
        {missions.map((mission, index) => (
          <MissionReportCard
            key={mission.id}
            mission={mission}
            progress={session.missions[index]}
            missionNumber={index + 1}
          />
        ))}
      </div>

      <section className="report__takeaway" aria-labelledby="report-takeaway-heading">
        <h2 id="report-takeaway-heading">다음에는 이렇게 말해 보세요</h2>
        <p>공을 가진 선수와 수비 사이를 살펴보고, 빈 패스 길과 다음 지원 자리를 근거와 함께 말해 보세요.</p>
      </section>

      <div className="report__actions">
        <div>
          <h2>이 기록을 남겨 볼까요?</h2>
          <p>필요하면 종이에 인쇄해서 선생님과 이야기할 수 있어요.</p>
        </div>
        <ActionButton variant="primary" onClick={() => window.print()}>
          기록 인쇄하기
        </ActionButton>
      </div>
      <p className="report__model-note">
        이 앱은 연습용 모형이에요. 실제 경기 실력이나 운동 능력을 평가하지 않아요.
      </p>
    </section>
  );
}

interface MissionReportCardProps {
  readonly mission: PassMissionRecord;
  readonly progress: MissionProgress;
  readonly missionNumber: number;
}

function MissionReportCard({ mission, progress, missionNumber }: MissionReportCardProps) {
  const firstState =
    mission.states.find((candidate) => candidate.id === mission.flow.firstStateId) ??
    mission.states[0];
  const lastState =
    mission.states.find((candidate) => candidate.id === progress.stateId) ?? firstState;

  return (
    <section className="report__card" aria-label={mission.flow.title}>
      <header className="report__card-heading">
        <span className="report__card-number" aria-hidden="true">
          {String(missionNumber).padStart(2, "0")}
        </span>
        <h3>{mission.flow.title}</h3>
      </header>
      <div className="report__boards">
        <div className="report__board">
          <p className="report__board-title">시작 판</p>
          <TacticsBoard state={firstState} showLaneStatus />
        </div>
        <div className="report__board">
          <p className="report__board-title">마친 판</p>
          <TacticsBoard state={lastState} showLaneStatus />
        </div>
      </div>
      <dl className="report__summary">
        <div>
          <dt>처음 생각</dt>
          <dd>{firstThought(mission, progress)}</dd>
        </div>
        <div>
          <dt>사용한 근거</dt>
          <dd>{usedEvidence(mission, progress)}</dd>
        </div>
        <div>
          <dt>수정 결과</dt>
          <dd>{revisionResult(mission, progress)}</dd>
        </div>
      </dl>
    </section>
  );
}

function firstThought(mission: PassMissionRecord, progress: MissionProgress): string {
  if (progress.predict) {
    const pair = findLane(mission, progress.predict.laneId);
    const label = pair ? laneText(pair.state, pair.lane) : progress.predict.laneId;
    return `“${label}” 길이 열려 있다고 생각했어요.`;
  }
  if (progress.move) {
    const move = findMove(mission, progress.move);
    return move
      ? `${positionLabel(move.fromCellId)}에 있는 선수를 ${directionWord(move.fromCellId, move.toCellId)} 옮기기로 했어요.`
      : "받을 선수를 빈 공간으로 옮기기로 했어요.";
  }
  if (progress.pass) {
    const pair = findLane(mission, progress.pass.laneId);
    const label = pair ? laneText(pair.state, pair.lane) : progress.pass.laneId;
    return `“${label}” 길로 패스할 계획이었어요.`;
  }
  return "처음에는 패스 뒤에 도울 자리를 찾아보기로 했어요.";
}

function usedEvidence(mission: PassMissionRecord, progress: MissionProgress): string {
  const keys = [
    ...(progress.predict?.evidenceKeys ?? []),
    ...(progress.move?.evidenceKeys ?? []),
    ...(progress.pass?.evidenceKeys ?? []),
    ...(progress.support?.evidenceKeys ?? []),
  ];
  const options = [
    ...(mission.flow.predict?.evidenceOptions ?? []),
    ...(mission.flow.move?.evidenceOptions ?? []),
    ...(mission.flow.pass?.evidenceOptions ?? []),
    ...(mission.flow.support?.evidenceOptions ?? []),
  ];
  const labels = keys
    .map((key) => options.find((option) => option.key === key)?.label)
    .filter((label): label is string => label !== undefined);
  const unique = [...new Set(labels)];
  if (unique.length === 0) return "기록한 근거 문장이 없어요.";
  return unique.join(", ");
}

function revisionResult(mission: PassMissionRecord, progress: MissionProgress): string {
  const lines: string[] = [];

  if (progress.pass) {
    if (progress.pass.deferred) {
      lines.push("이 미션은 판단을 보류했어요.");
    } else if (progress.pass.evaluation.accepted) {
      const changed = progress.predict && progress.predict.laneId !== progress.pass.laneId;
      const pair = findLane(mission, progress.pass.laneId);
      const label = pair ? laneText(pair.state, pair.lane) : progress.pass.laneId;
      lines.push(
        changed ? `처음 생각을 바꾸고 ${label}로 패스했어요.` : `처음 생각을 그대로 ${label}로 패스했어요.`,
      );
      if (progress.pass.blockerEvaluation) {
        lines.push(
          progress.pass.blockerEvaluation.accepted
            ? "막힌 길을 막은 수비도 바로 찾았어요."
            : "막힌 길을 막은 수비 연결은 다시 확인해요.",
        );
      }
    } else {
      lines.push("열린 패스 길을 다시 확인해요.");
    }
  }

  if (progress.reveal) {
    lines.push(
      progress.reveal.keptPlan
        ? "수비가 움직인 뒤에도 계획을 유지했어요."
        : "수비가 움직여서 계획을 수정했어요.",
    );
  }

  if (progress.support) {
    const move = findMove(mission, progress.support);
    lines.push(
      move
        ? `패스를 보낸 선수를 ${directionWord(move.fromCellId, move.toCellId)} 옮겨 다음 길을 도왔어요.`
        : "패스를 보낸 선수를 다음 길을 돕는 자리로 옮겼어요.",
    );
  }

  if (progress.support?.sequenceEvaluation) {
    const sequence = progress.support.sequenceEvaluation;
    lines.push(
      sequence.accepted
        ? sequence.evidenceKeys
            .filter((key) => key.startsWith("sequence-match:"))
            .map(() => "이동 → 패스 → 지원 순서를 완성했어요.")
            .join(" ")
        : "계획 순서가 검수된 계획과 달랐어요.",
    );
  }

  return lines.length > 0 ? lines.join(" ") : "기록할 수정 내용이 없어요.";
}

function findLane(mission: PassMissionRecord, laneId: string): { lane: PassLane; state: TacticsState } | null {
  for (const state of mission.states) {
    const lane = state.lanes.find((candidate) => candidate.id === laneId);
    if (lane) return { lane, state };
  }
  return null;
}

function laneText(state: TacticsState, lane: PassLane): string {
  const from = state.players.find((player) => player.id === lane.fromPlayerId);
  const to = state.players.find((player) => player.id === lane.toPlayerId);
  if (!from || !to) return "선택한 패스 길";
  return `${positionLabel(cellIdOf(from.cell))} 선수 → ${positionLabel(cellIdOf(to.cell))} 선수`;
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

function directionWord(fromCellId: string, toCellId: string): string {
  const from = parseCellId(fromCellId);
  const to = parseCellId(toCellId);
  if (!from || !to) return "한 칸";
  const parts: string[] = [];
  if (to.column > from.column) parts.push("오른쪽");
  if (to.column < from.column) parts.push("왼쪽");
  if (to.row < from.row) parts.push("위");
  if (to.row > from.row) parts.push("아래");
  return parts.length > 0 ? `${parts.join(" ")} 한 칸` : "한 칸";
}

function findMove(
  mission: PassMissionRecord,
  answer: { readonly playerId: string; readonly toCellId: string },
): { readonly fromCellId: string; readonly toCellId: string } | null {
  for (const transition of [
    ...(mission.flow.move?.transitions ?? []),
    ...(mission.flow.support?.transitions ?? []),
  ]) {
    if (transition.playerId !== answer.playerId || transition.toCellId !== answer.toCellId) continue;
    const state = mission.states.find((candidate) => candidate.id === transition.fromStateId);
    const player = state?.players.find((candidate) => candidate.id === transition.playerId);
    if (player) return { fromCellId: cellIdOf(player.cell), toCellId: transition.toCellId };
  }
  return null;
}
