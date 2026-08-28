import type { PassMissionRecord } from "../../domain/types";
import {
  attack,
  defend,
  EV_LANE_NO_DEFENDER,
  EV_LANE_SPACE,
  EV_SUPPORT_NEXT,
  EV_SUPPORT_SAFE,
  lane,
  state,
} from "../missionBuilders";

export const passLane01: PassMissionRecord = {
  id: "pass-lane-01",
  states: [
    state(
      "st-01-start",
      [attack("A1", 1, 2, true), attack("A2", 5, 1), attack("A3", 5, 3), defend("D1", 3, 3)],
      [
        lane("lane-a1-a2", "A1", "A2", [], ["c2r1", "c2r3"]),
        lane("lane-a1-a3", "A1", "A3", ["D1"]),
      ],
    ),
    state(
      "st-01-passed",
      [attack("A1", 1, 2), attack("A2", 5, 1, true), attack("A3", 5, 3), defend("D1", 3, 3)],
      [
        lane("lane-a1-a2", "A1", "A2", [], ["c2r1", "c2r3"]),
        lane("lane-a1-a3", "A1", "A3", ["D1"]),
      ],
    ),
    state(
      "st-01-reveal",
      [attack("A1", 1, 2), attack("A2", 5, 1, true), attack("A3", 5, 3), defend("D1", 4, 2)],
      [
        lane("lane-a1-a2", "A1", "A2", [], ["c2r1", "c2r3"]),
        lane("lane-a1-a3", "A1", "A3", ["D1"]),
      ],
    ),
    state("st-01-support-up", [
      attack("A1", 2, 1),
      attack("A2", 5, 1, true),
      attack("A3", 5, 3),
      defend("D1", 4, 2),
    ]),
    state("st-01-support-down", [
      attack("A1", 2, 3),
      attack("A2", 5, 1, true),
      attack("A3", 5, 3),
      defend("D1", 4, 2),
    ]),
  ],
  openLaneIds: ["lane-a1-a2"],
  approvedSupportCellIds: ["c2r1", "c2r3"],
  acceptedSequenceIds: [],
  sourceNote:
    "계획서 4.1 pass-lane-01 fixture. 3대1 상황에서 D1(c3r3)이 lane-a1-a3을 막고 있고 lane-a1-a2만 열려 있다. 승인 선택은 lane-a1-a2다.",
  reviewStatus: "pending",
  misconceptionGuard:
    "멀리 있는 패스가 항상 위험한 것은 아니에요. 수비가 길 위에 서 있는지로 확인해요.",
  flow: {
    title: "미션 1 · 열린 패스 길 찾기",
    intro: "3대1 상황에서 수비가 막지 않은 길을 찾아요.",
    steps: ["OBSERVE", "PREDICT", "PASS", "REVEAL", "SUPPORT"],
    firstStateId: "st-01-start",
    observe: { prompt: "경기판을 보고 공을 가진 사람을 찾아 눌러요.", ballHolderPlayerId: "A1" },
    predict: {
      stateId: "st-01-start",
      prompt: "움직이기 전에, 지금 열려 있다고 생각하는 패스 길을 골라요.",
      evidenceOptions: [EV_LANE_NO_DEFENDER, EV_LANE_SPACE],
    },
    pass: {
      prompt: "패스 길을 정해요. 처음 생각을 바꿔도 돼요. 막힌 길이 있다면 그 길을 막은 수비도 찾아요.",
      transitions: [{ fromStateId: "st-01-start", laneId: "lane-a1-a2", nextStateId: "st-01-passed" }],
      evidenceOptions: [EV_LANE_NO_DEFENDER, EV_LANE_SPACE],
    },
    reveal: {
      defenderId: "D1",
      prompt: "수비 D1이 한 칸 움직였어요. 처음 계획을 유지할까요, 수정할까요?",
      transitions: [{ fromStateId: "st-01-passed", toCellId: "c4r2", nextStateId: "st-01-reveal" }],
    },
    support: {
      prompt: "패스를 보낸 A1이 한 칸 움직이면 다음 패스 길이 열려요. 어디로 갈까요?",
      transitions: [
        { fromStateId: "st-01-reveal", playerId: "A1", toCellId: "c2r1", nextStateId: "st-01-support-up" },
        { fromStateId: "st-01-reveal", playerId: "A1", toCellId: "c2r3", nextStateId: "st-01-support-down" },
      ],
      evidenceOptions: [EV_SUPPORT_NEXT, EV_SUPPORT_SAFE],
    },
    sequenceStepsById: {},
  },
};
