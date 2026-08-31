import type { PassMissionRecord } from "../../domain/types";
import {
  attack,
  defend,
  EV_LANE_NO_DEFENDER,
  EV_LANE_SPACE,
  EV_SUPPORT_NEXT,
  EV_SUPPORT_SAFE,
  EV_TWO_WAYS,
  lane,
  state,
} from "../missionBuilders";

export const passTwoOptions04: PassMissionRecord = {
  id: "pass-two-options-04",
  states: [
    state(
      "st-04-start",
      [attack("A1", 1, 2, true), attack("A2", 5, 0), attack("A3", 5, 4), defend("D1", 3, 2)],
      [
        lane("lane-left-side", "A1", "A2", [], ["c2r1"]),
        lane("lane-right-side", "A1", "A3", [], ["c2r3"]),
      ],
    ),
    state(
      "st-04-left-passed",
      [attack("A1", 1, 2), attack("A2", 5, 0, true), attack("A3", 5, 4), defend("D1", 3, 2)],
      [lane("lane-left-side", "A1", "A2", []), lane("lane-right-side", "A1", "A3", [])],
    ),
    state(
      "st-04-right-passed",
      [attack("A1", 1, 2), attack("A2", 5, 0), attack("A3", 5, 4, true), defend("D1", 3, 2)],
      [lane("lane-left-side", "A1", "A2", []), lane("lane-right-side", "A1", "A3", [])],
    ),
    state(
      "st-04-reveal-left",
      [attack("A1", 1, 2), attack("A2", 5, 0, true), attack("A3", 5, 4), defend("D1", 4, 1)],
      [lane("lane-left-side", "A1", "A2", []), lane("lane-right-side", "A1", "A3", [])],
    ),
    state(
      "st-04-reveal-right",
      [attack("A1", 1, 2), attack("A2", 5, 0), attack("A3", 5, 4, true), defend("D1", 4, 3)],
      [lane("lane-left-side", "A1", "A2", []), lane("lane-right-side", "A1", "A3", [])],
    ),
    state("st-04-support-l-up", [
      attack("A1", 2, 1),
      attack("A2", 5, 0, true),
      attack("A3", 5, 4),
      defend("D1", 4, 1),
    ], [lane("lane-a2-a1", "A2", "A1", [])]),
    state("st-04-support-l-down", [
      attack("A1", 2, 3),
      attack("A2", 5, 0, true),
      attack("A3", 5, 4),
      defend("D1", 4, 1),
    ], [lane("lane-a2-a1", "A2", "A1", [])]),
    state("st-04-support-r-up", [
      attack("A1", 2, 1),
      attack("A2", 5, 0),
      attack("A3", 5, 4, true),
      defend("D1", 4, 3),
    ], [lane("lane-a3-a1", "A3", "A1", [])]),
    state("st-04-support-r-down", [
      attack("A1", 2, 3),
      attack("A2", 5, 0),
      attack("A3", 5, 4, true),
      defend("D1", 4, 3),
    ], [lane("lane-a3-a1", "A3", "A1", [])]),
  ],
  openLaneIds: ["lane-left-side", "lane-right-side", "lane-a2-a1", "lane-a3-a1"],
  approvedSupportCellIds: ["c2r1", "c2r3"],
  acceptedSequenceIds: [],
  sourceNote:
    "계획서 4.1 pass-two-options-04 fixture. lane-left-side와 lane-right-side를 모두 open으로 승인하며 어느 쪽도 거리만으로 오답 처리하지 않는다.",
  reviewStatus: "pending",
  misconceptionGuard:
    "두 길이 모두 열려 있을 때는 거리만으로 정답을 정하지 않아요. 다음 지원 자리를 함께 비교해요.",
  flow: {
    title: "미션 4 · 두 가지 열린 길 비교",
    intro: "두 측면 길이 모두 열려 있어요. 어느 쪽을 골라도 맞을 수 있어요.",
    steps: ["OBSERVE", "PREDICT", "PASS", "REVEAL", "SUPPORT"],
    firstStateId: "st-04-start",
    observe: { prompt: "공을 가진 사람을 찾아 눌러요.", ballHolderPlayerId: "A1" },
    predict: {
      stateId: "st-04-start",
      prompt: "열려 있는 길이 하나가 아니에요. 먼저 끌리는 길을 골라요.",
      evidenceOptions: [EV_TWO_WAYS, EV_LANE_NO_DEFENDER, EV_LANE_SPACE],
    },
    pass: {
      prompt: "두 길 중 어디로 패스할지 정해요. 어느 쪽도 틀리지 않아요.",
      transitions: [
        { fromStateId: "st-04-start", laneId: "lane-left-side", nextStateId: "st-04-left-passed" },
        { fromStateId: "st-04-start", laneId: "lane-right-side", nextStateId: "st-04-right-passed" },
      ],
      evidenceOptions: [EV_TWO_WAYS, EV_LANE_NO_DEFENDER, EV_LANE_SPACE],
    },
    reveal: {
      defenderId: "D1",
      prompt: "수비가 움직였어요. 계획을 유지할까요, 수정할까요?",
      transitions: [
        { fromStateId: "st-04-left-passed", toCellId: "c4r1", nextStateId: "st-04-reveal-left" },
        { fromStateId: "st-04-right-passed", toCellId: "c4r3", nextStateId: "st-04-reveal-right" },
      ],
    },
    support: {
      prompt: "패스를 보낸 선수가 한 칸 움직이면 다음 패스 길이 열려요. 어디로 갈까요?",
      transitions: [
        { fromStateId: "st-04-reveal-left", playerId: "A1", toCellId: "c2r1", nextStateId: "st-04-support-l-up" },
        { fromStateId: "st-04-reveal-left", playerId: "A1", toCellId: "c2r3", nextStateId: "st-04-support-l-down" },
        { fromStateId: "st-04-reveal-right", playerId: "A1", toCellId: "c2r1", nextStateId: "st-04-support-r-up" },
        { fromStateId: "st-04-reveal-right", playerId: "A1", toCellId: "c2r3", nextStateId: "st-04-support-r-down" },
      ],
      evidenceOptions: [EV_SUPPORT_NEXT, EV_SUPPORT_SAFE],
    },
    sequenceStepsById: {},
  },
};
