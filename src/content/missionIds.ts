import type { MissionId } from "../domain/types";

/** 계획서 4장 고정 미션 ID. 코드·테스트·문서에서 동일한 문자열을 사용한다. */
export const MISSION_IDS = [
  "pass-lane-01",
  "pass-defender-02",
  "pass-move-03",
  "pass-two-options-04",
  "pass-after-05",
  "pass-plan-06",
] as const satisfies readonly MissionId[];
