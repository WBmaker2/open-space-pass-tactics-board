import type { PassMissionRecord } from "../../domain/types";
import {
  attack,
  defend,
  EV_SUPPORT_NEXT,
  EV_SUPPORT_SAFE,
  lane,
  state,
} from "../missionBuilders";

export const passAfter05: PassMissionRecord = {
  id: "pass-after-05",
  states: [
    state(
      "st-05-start",
      [attack("A1", 1, 2), attack("A2", 4, 1, true), attack("A3", 5, 4), defend("D1", 3, 3)],
      [
        lane("lane-a2-a1", "A2", "A1", ["D1"]),
        lane("lane-a2-a3", "A2", "A3", ["D1"]),
      ],
    ),
    state(
      "st-05-support-up",
      [attack("A1", 2, 1), attack("A2", 4, 1, true), attack("A3", 5, 4), defend("D1", 3, 3)],
      [lane("lane-a2-a1", "A2", "A1", []), lane("lane-a2-a3", "A2", "A3", ["D1"])],
    ),
    state(
      "st-05-support-down",
      [attack("A1", 2, 3), attack("A2", 4, 1, true), attack("A3", 5, 4), defend("D1", 3, 3)],
      [lane("lane-a2-a1", "A2", "A1", ["D1"]), lane("lane-a2-a3", "A2", "A3", [])],
    ),
  ],
  openLaneIds: ["lane-a2-a1", "lane-a2-a3"],
  approvedSupportCellIds: ["c2r1", "c2r3"],
  acceptedSequenceIds: [],
  sourceNote:
    "계획서 4.1 pass-after-05 fixture. 패스 뒤 A2(ball)=c4r1이고 A1의 승인 지원 셀 c2r1/c2r3이 각각 lane-a2-a1/lane-a2-a3의 다음 선택을 만든다.",
  reviewStatus: "pending",
  misconceptionGuard:
    "패스를 한 뒤에도 멈추지 않아요. 다음 길을 열어 주는 자리로 움직여요.",
  flow: {
    title: "미션 5 · 패스 뒤 지원 위치",
    intro: "패스가 끝난 뒤가 중요해요. 공을 보낸 A1의 다음 움직임을 찾아요.",
    steps: ["OBSERVE", "SUPPORT"],
    firstStateId: "st-05-start",
    observe: {
      prompt: "패스가 끝난 뒤 판이에요. 이제 공을 가진 사람을 찾아 눌러요.",
      ballHolderPlayerId: "A2",
    },
    support: {
      prompt: "공을 보낸 A1이 한 칸 움직이면 다음 패스 길이 열려요. 어디로 갈까요?",
      transitions: [
        { fromStateId: "st-05-start", playerId: "A1", toCellId: "c2r1", nextStateId: "st-05-support-up" },
        { fromStateId: "st-05-start", playerId: "A1", toCellId: "c2r3", nextStateId: "st-05-support-down" },
      ],
      evidenceOptions: [EV_SUPPORT_NEXT, EV_SUPPORT_SAFE],
    },
    sequenceStepsById: {},
  },
};
