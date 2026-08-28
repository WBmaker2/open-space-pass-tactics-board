import type { RefObject } from "react";
import type { MissionProgress } from "../../app/sessionReducer";
import type { PassMissionRecord } from "../../domain/types";

interface TacticsWorkbenchProps {
  readonly mission: PassMissionRecord;
  readonly progress: MissionProgress;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

/** Task 5에서 단계별 학습 화면으로 대체되는 셸 자리 표시다. */
export function TacticsWorkbench({ mission, headingRef }: TacticsWorkbenchProps) {
  return (
    <section className="workbench" aria-labelledby="workbench-heading">
      <h1 id="workbench-heading" ref={headingRef} tabIndex={-1}>
        {mission.flow.title}
      </h1>
      <p>학습 화면을 준비하고 있어요.</p>
    </section>
  );
}
