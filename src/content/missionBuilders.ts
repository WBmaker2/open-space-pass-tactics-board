// 미션 데이터 작성용 공용 빌더. 런타임 판정 로직은 포함하지 않는다.
import type {
  EvidenceOption,
  GridCell,
  PassLane,
  PlayerToken,
  TacticsState,
  Team,
} from "../domain/types";

export const attack = (id: string, column: number, row: number, hasBall = false): PlayerToken => ({
  id,
  team: "attack" satisfies Team,
  roleLabel: id,
  cell: { column, row } as GridCell,
  hasBall,
});

export const defend = (id: string, column: number, row: number): PlayerToken => ({
  id,
  team: "defense" satisfies Team,
  roleLabel: id,
  cell: { column, row } as GridCell,
  hasBall: false,
});

export const state = (
  id: string,
  players: readonly PlayerToken[],
  lanes: readonly PassLane[] = [],
): TacticsState => ({ id, players, lanes });

export const lane = (
  id: string,
  fromPlayerId: string,
  toPlayerId: string,
  blockedByPlayerIds: readonly string[],
  nextSupportCellIds: readonly string[] = [],
): PassLane => ({ id, fromPlayerId, toPlayerId, blockedByPlayerIds, nextSupportCellIds });

export const opt = (key: string, label: string): EvidenceOption => ({ key, label });

export const EV_LANE_NO_DEFENDER = opt("ev-lane-no-defender", "고른 길 사이에 수비가 없어요");
export const EV_LANE_SPACE = opt("ev-lane-space", "받을 사람 근처에 빈 공간이 있어요");
export const EV_TWO_WAYS = opt("ev-two-ways", "두 길이 모두 열려 있어 비교해서 골랐어요");
export const EV_MOVE_OPEN_LANE = opt("ev-move-open-lane", "움직이면 막힌 길이 다시 열려요");
export const EV_MOVE_AWAY = opt("ev-move-away", "수비에서 멀어지는 방향이에요");
export const EV_SUPPORT_NEXT = opt("ev-support-next", "이 자리에 서면 다음 패스 길이 열려요");
export const EV_SUPPORT_SAFE = opt("ev-support-safe", "수비에서 조금 더 멀어지는 자리예요");
