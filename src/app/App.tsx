import { useEffect, useReducer, useRef, useState } from "react";
import { AccessibilityToolbar } from "../accessibility/AccessibilityToolbar";
import { ModalDialog } from "../components/ModalDialog";
import { UpdateHistoryButton } from "../components/UpdateHistoryButton";
import { missions } from "../content/missions";
import { EntranceScreen } from "../features/pass-tactics/EntranceScreen";
import { TacticsWorkbench } from "../features/pass-tactics/TacticsWorkbench";
import { ErrorBoundary } from "./ErrorBoundary";
import { initialSessionState, sessionReducer } from "./sessionReducer";

export function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, initialSessionState);
  const [restartAsked, setRestartAsked] = useState(false);
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);

  // 단계가 바뀌면 새 단계의 시작점(큰 제목)으로 초점과 스크롤을 옮긴다.
  useEffect(() => {
    if (state.focusToken === 0) return;
    mainHeadingRef.current?.focus();
    mainHeadingRef.current?.scrollIntoView({ block: "start" });
  }, [state.focusToken]);

  const inSession = state.step !== "INTRO";

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <p className="app-header__title" aria-hidden="true">
            빈 공간 패스 전술판
          </p>
          <div className="app-header__tools">
            <AccessibilityToolbar />
            {inSession ? (
              <button
                type="button"
                className="app-header__restart"
                onClick={() => setRestartAsked(true)}
              >
                처음부터
              </button>
            ) : null}
            {inSession ? <UpdateHistoryButton /> : null}
          </div>
        </header>

        <main className="app-main">
          {state.step === "INTRO" ? (
            <EntranceScreen
              onStart={() => dispatch({ type: "START" })}
              headingRef={mainHeadingRef}
            />
          ) : state.step === "REPORT" ? (
            <section className="report" aria-labelledby="report-heading">
              <h1 id="report-heading" ref={mainHeadingRef} tabIndex={-1}>
                전술 기록
              </h1>
              <p>결과 기록 화면을 준비하고 있어요.</p>
            </section>
          ) : (
            <TacticsWorkbench
              mission={missions[state.missionIndex]}
              progress={state.missions[state.missionIndex]}
              headingRef={mainHeadingRef}
            />
          )}
        </main>

        {restartAsked ? (
          <ModalDialog title="처음부터 다시 할까요?" onClose={() => setRestartAsked(false)}>
            <p>지금까지의 응답을 모두 지우고 처음부터 시작해요.</p>
            <div className="dialog__actions">
              <button
                type="button"
                className="action-button action-button--primary"
                onClick={() => {
                  setRestartAsked(false);
                  dispatch({ type: "RESTART_CONFIRMED" });
                }}
              >
                <span className="action-button__label">다시 시작할래요</span>
              </button>
              <button
                type="button"
                className="action-button action-button--secondary"
                onClick={() => setRestartAsked(false)}
              >
                <span className="action-button__label">계속할래요</span>
              </button>
            </div>
          </ModalDialog>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}
