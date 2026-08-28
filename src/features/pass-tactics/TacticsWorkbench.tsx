import { useEffect, useState, type RefObject } from "react";
import type { SessionAction, SessionState } from "../../app/sessionReducer";
import { ActionButton } from "../../components/ActionButton";
import { ProgressSteps, stepLabel } from "../../components/ProgressSteps";
import { missions } from "../../content/missions";
import type { PassMissionRecord, TacticsState } from "../../domain/types";
import {
  MovePanel,
  ObservePanel,
  PassPanel,
  PredictPanel,
  RevealPanel,
  SupportPanel,
} from "./StepPanels";
import { TacticsBoard } from "./TacticsBoard";

interface TacticsWorkbenchProps {
  readonly session: SessionState;
  readonly dispatch: (action: SessionAction) => void;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

export function TacticsWorkbench({ session, dispatch, headingRef }: TacticsWorkbenchProps) {
  const mission = missions[session.missionIndex];
  const progress = session.missions[session.missionIndex];
  const boardState =
    mission.states.find((candidate) => candidate.id === progress.stateId) ?? mission.states[0];

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [evidenceKeys, setEvidenceKeys] = useState<readonly string[]>([]);
  const [revealChoice, setRevealChoice] = useState<"keep" | "revise" | null>(null);

  // 단계·미션이 바뀌면 선택 상태를 새로 시작한다.
  useEffect(() => {
    setSelectedPlayerId(null);
    setSelectedLaneId(null);
    setSelectedCellId(null);
    setEvidenceKeys([]);
    setRevealChoice(null);
  }, [session.step, session.missionIndex]);

  const missionIndex = session.missionIndex;
  const step = session.step;

  function answer(action: SessionAction) {
    dispatch(action);
  }

  const predictState =
    mission.flow.predict != null
      ? (mission.states.find((candidate) => candidate.id === mission.flow.predict?.stateId) ??
        boardState)
      : boardState;

  const observeAnswered = progress.observePlayerId !== null;
  const predictAnswered = progress.predict !== null;
  const moveAnswered = progress.move !== null;
  const passAnswered = progress.pass !== null;
  const revealAnswered = progress.reveal !== null;
  const supportAnswered = progress.support !== null;
  const stepAnswered =
    (step === "OBSERVE" && observeAnswered) ||
    (step === "PREDICT" && predictAnswered) ||
    (step === "MOVE" && moveAnswered) ||
    (step === "PASS" && passAnswered) ||
    (step === "REVEAL" && revealAnswered) ||
    (step === "SUPPORT" && supportAnswered);

  const revision = progress.revision;

  return (
    <section className="workbench" aria-labelledby="workbench-heading">
      <h1 id="workbench-heading" ref={headingRef} tabIndex={-1}>
        {mission.flow.title}
      </h1>
      <ProgressSteps
        steps={mission.flow.steps}
        currentStep={step}
        missionTitle={mission.flow.title}
        missionNumber={missionIndex + 1}
        totalMissions={missions.length}
      />
      <p className="workbench__intro">{mission.flow.intro}</p>

      <div className="workbench__grid">
        <section className="workbench__board" aria-label="경기판">
          <TacticsBoard
            state={boardState}
            selectablePlayerIds={selectablePlayerIdsFor(step, boardState)}
            selectedPlayerId={selectedPlayerId}
            onPlayerSelect={(playerId) => {
              setSelectedPlayerId(playerId);
              if (step === "OBSERVE") {
                answer({ type: "ANSWER_OBSERVE", missionIndex, playerId, revision });
              }
            }}
            targetCellIds={targetCellIdsFor(step, mission, progress.stateId)}
            selectedCellId={selectedCellId}
            onCellSelect={setSelectedCellId}
            showLaneStatus={step === "REVEAL" || step === "SUPPORT"}
          />
          <ul className="board-legend">
            <li>동그라미 + A = 공격 선수</li>
            <li>세모 + D = 수비 선수</li>
            <li>흰 공 = 지금 공을 가진 사람</li>
            <li>칸 이름은 c열r행 (왼쪽 위가 c0r0)</li>
          </ul>
        </section>

        <section className="workbench__panel" aria-label="현재 할 일">
          <p className="workbench__step-label">{stepLabel(step)} 단계</p>
          {step === "OBSERVE" ? (
            <ObservePanel
              mission={mission}
              boardState={boardState}
              progress={progress}
            />
          ) : null}
          {step === "PREDICT" ? (
            <PredictPanel
              mission={mission}
              predictState={predictState}
              selectedLaneId={selectedLaneId}
              onSelectLane={setSelectedLaneId}
              evidenceKeys={evidenceKeys}
              onToggleEvidence={setEvidenceKeys}
              onConfirm={() =>
                answer({
                  type: "ANSWER_PREDICT",
                  missionIndex,
                  laneId: selectedLaneId ?? "",
                  evidenceKeys,
                  revision,
                })
              }
              progress={progress}
            />
          ) : null}
          {step === "MOVE" ? (
            <MovePanel
              mission={mission}
              stateId={progress.stateId}
              selectedCellId={selectedCellId}
              onSelectCell={setSelectedCellId}
              onConfirm={() => {
                const transition = mission.flow.move?.transitions.find(
                  (candidate) =>
                    candidate.fromStateId === progress.stateId &&
                    candidate.toCellId === selectedCellId,
                );
                if (transition) {
                  answer({
                    type: "CHOOSE_MOVE",
                    missionIndex,
                    playerId: transition.playerId,
                    toCellId: selectedCellId ?? "",
                    revision,
                  });
                }
              }}
              progress={progress}
            />
          ) : null}
          {step === "PASS" ? (
            <PassPanel
              mission={mission}
              boardState={boardState}
              progress={progress}
              selectedLaneId={selectedLaneId}
              onSelectLane={setSelectedLaneId}
              evidenceKeys={evidenceKeys}
              onToggleEvidence={setEvidenceKeys}
              onConfirm={(deferred) =>
                answer({
                  type: "ANSWER_PASS",
                  missionIndex,
                  laneId: deferred
                    ? (selectedLaneId ?? progress.pass?.laneId ?? "")
                    : (selectedLaneId ?? ""),
                  evidenceKeys,
                  blockerPlayerId: selectedPlayerId,
                  deferred,
                  revision,
                })
              }
            />
          ) : null}
          {step === "REVEAL" ? (
            <RevealPanel
              mission={mission}
              boardState={boardState}
              progress={progress}
              revealChoice={revealChoice}
              onSelectChoice={setRevealChoice}
              selectedLaneId={selectedLaneId}
              onSelectLane={setSelectedLaneId}
              onConfirm={() =>
                answer({
                  type: "ANSWER_REVEAL",
                  missionIndex,
                  keptPlan: revealChoice === "keep",
                  revisedLaneId: revealChoice === "revise" ? selectedLaneId : null,
                  revision,
                })
              }
            />
          ) : null}
          {step === "SUPPORT" ? (
            <SupportPanel
              mission={mission}
              stateId={progress.stateId}
              progress={progress}
              selectedCellId={selectedCellId}
              onSelectCell={setSelectedCellId}
              evidenceKeys={evidenceKeys}
              onToggleEvidence={setEvidenceKeys}
              onConfirm={() => {
                const transition = mission.flow.support?.transitions.find(
                  (candidate) =>
                    candidate.fromStateId === progress.stateId &&
                    candidate.toCellId === selectedCellId,
                );
                if (transition) {
                  answer({
                    type: "ANSWER_SUPPORT",
                    missionIndex,
                    playerId: transition.playerId,
                    toCellId: selectedCellId ?? "",
                    evidenceKeys,
                    revision,
                  });
                }
              }}
            />
          ) : null}

          <div className="workbench__actions">
            <ActionButton onClick={() => answer({ type: "BACK" })}>뒤로</ActionButton>
            <ActionButton
              variant="primary"
              disabled={!stepAnswered}
              onClick={() => answer({ type: "NEXT" })}
            >
              다음 단계로
            </ActionButton>
          </div>
        </section>
      </div>
    </section>
  );
}

function selectablePlayerIdsFor(step: string, boardState: TacticsState): readonly string[] | undefined {
  if (step === "OBSERVE") return boardState.players.map((player) => player.id);
  if (step === "PASS") {
    const hasBlocked = boardState.lanes.some((lane) => lane.blockedByPlayerIds.length > 0);
    if (!hasBlocked) return undefined;
    return boardState.players
      .filter((player) => player.team === "defense")
      .map((player) => player.id);
  }
  return undefined;
}

function targetCellIdsFor(
  step: string,
  mission: PassMissionRecord,
  stateId: string,
): readonly string[] | undefined {
  if (step === "MOVE") {
    return mission.flow.move?.transitions
      .filter((transition) => transition.fromStateId === stateId)
      .map((transition) => transition.toCellId);
  }
  if (step === "SUPPORT") {
    return mission.flow.support?.transitions
      .filter((transition) => transition.fromStateId === stateId)
      .map((transition) => transition.toCellId);
  }
  return undefined;
}
