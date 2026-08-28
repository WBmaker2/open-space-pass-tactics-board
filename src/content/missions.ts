// 검수된 고정 6개 미션 데이터 (계획서 4장·4.1 fixture).
// 미션 ID, state ID, lane ID, 선택지 ID는 계획서·테스트·문서와 동일한 문자열을 사용한다.
// 좌표 기반 물리 추론은 하지 않고, 승인된 lane 데이터로만 판정한다.
import type { PassMissionRecord } from "../domain/types";
import { passAfter05 } from "./missions/passAfter05";
import { passDefender02 } from "./missions/passDefender02";
import { passLane01 } from "./missions/passLane01";
import { passMove03 } from "./missions/passMove03";
import { passPlan06 } from "./missions/passPlan06";
import { passTwoOptions04 } from "./missions/passTwoOptions04";

export const missions: readonly PassMissionRecord[] = [
  passLane01,
  passDefender02,
  passMove03,
  passTwoOptions04,
  passAfter05,
  passPlan06,
];
