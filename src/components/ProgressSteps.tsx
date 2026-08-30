import type { SessionStep } from "../domain/types";

export const STEP_LABELS: Record<SessionStep, string> = {
  INTRO: "입구",
  OBSERVE: "경기판 관찰",
  PREDICT: "패스 예측",
  MOVE: "지원 이동",
  PASS: "패스 길",
  REVEAL: "수비 공개",
  SUPPORT: "다음 지원",
  REPORT: "전술 기록",
};

export function stepLabel(step: SessionStep): string {
  return STEP_LABELS[step];
}

interface ProgressStepsProps {
  readonly steps: readonly SessionStep[];
  readonly currentStep: SessionStep;
  readonly missionTitle: string;
  readonly missionNumber: number;
  readonly totalMissions: number;
}

export function ProgressSteps({
  steps,
  currentStep,
  missionTitle,
  missionNumber,
  totalMissions,
}: ProgressStepsProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="학습 진행" className="progress-steps">
      <div className="progress-steps__heading">
        <p className="progress-steps__mission">
          미션 {missionNumber}/{totalMissions}
        </p>
        <p className="progress-steps__title">{missionTitle}</p>
      </div>
      <ol className="progress-steps__list">
        {steps.map((step, index) => (
          <li
            key={step}
            className={[
              "progress-steps__item",
              step === currentStep ? "is-current" : "",
              index < currentIndex ? "is-complete" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={step === currentStep ? "step" : undefined}
          >
            <span className="progress-steps__dot" aria-hidden="true" />
            {stepLabel(step)}
          </li>
        ))}
      </ol>
    </nav>
  );
}
