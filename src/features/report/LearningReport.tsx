import type { RefObject } from "react";
import type { MissionProgress, SessionState } from "../../app/sessionReducer";
import { ActionButton } from "../../components/ActionButton";
import { missions } from "../../content/missions";
import { cellId as cellIdOf } from "../../domain/grid";
import type { PassLane, PassMissionRecord, TacticsState } from "../../domain/types";
import { TacticsBoard } from "../pass-tactics/TacticsBoard";
import "./print.css";

interface LearningReportProps {
  readonly session: SessionState;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

export function LearningReport({ session, headingRef }: LearningReportProps) {
  return (
    <section className="report" aria-labelledby="report-heading">
      <h1 id="report-heading" ref={headingRef} tabIndex={-1}>
        전술 기록
      </h1>
      <p className="report__lead">점수나 순위는 없어요. 여러분의 생각을 기록했어요.</p>
      <p className="report__notice">
        이 기록은 이 탭에만 있어요. 새로고침하면 사라져요. 남기고 싶으면 인쇄하세요.
      </p>

      {missions.map((mission, index) => (
        <MissionReportCard
          key={mission.id}
          mission={mission}
          progress={session.missions[index]}
        />
      ))}

      <div className="report__actions">
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
}

function MissionReportCard({ mission, progress }: MissionReportCardProps) {
  const firstState =
    mission.states.find((candidate) => candidate.id === mission.flow.firstStateId) ??
    mission.states[0];
  const lastState =
    mission.states.find((candidate) => candidate.id === progress.stateId) ?? firstState;

  return (
    <section className="report__card" aria-label={mission.flow.title}>
      <h2>{mission.flow.title}</h2>
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
    return progress.predict.evaluation.accepted
      ? `${label}이(가) 열려 있다고 생각했어요.`
      : `${label}을(는) 열려 있다고 생각했어요.`;
  }
  if (progress.pass) {
    const pair = findLane(mission, progress.pass.laneId);
    const label = pair ? laneText(pair.state, pair.lane) : progress.pass.laneId;
    return `${label}로 패스할 계획이었어요.`;
  }
  return "이 미션은 패스 길 고르기가 없는 지원 미션이었어요.";
}

function usedEvidence(mission: PassMissionRecord, progress: MissionProgress): string {
  const keys = [
    ...(progress.predict?.evidenceKeys ?? []),
    ...(progress.pass?.evidenceKeys ?? []),
    ...(progress.support?.evidenceKeys ?? []),
  ];
  const labels = keys
    .map((key) => mission.flow.predict?.evidenceOptions.find((option) => option.key === key)?.label)
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
    lines.push(
      `마지막에 ${progress.support.playerId}을(를) ${progress.support.toCellId}칸으로 지원했어요.`,
    );
  }

  if (progress.support?.sequenceEvaluation) {
    const sequence = progress.support.sequenceEvaluation;
    lines.push(
      sequence.accepted
        ? sequence.evidenceKeys
            .filter((key) => key.startsWith("sequence-match:"))
            .map((key) => `검수된 계획(${key.slice("sequence-match:".length)})을 완성했어요.`)
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
  if (!from || !to) return `${lane.fromPlayerId} → ${lane.toPlayerId}`;
  return `${from.roleLabel} → ${to.roleLabel} (${cellIdOf(from.cell)} → ${cellIdOf(to.cell)})`;
}
