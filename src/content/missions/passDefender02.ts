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

export const passDefender02: PassMissionRecord = {
  id: "pass-defender-02",
  states: [
    state(
      "st-02-start",
      [attack("A1", 1, 2, true), attack("A2", 5, 2), attack("A3", 5, 0), defend("D1", 3, 2)],
      [
        lane("lane-center", "A1", "A2", ["D1"]),
        lane("lane-side", "A1", "A3", [], ["c2r1", "c2r3"]),
      ],
    ),
    state(
      "st-02-passed",
      [attack("A1", 1, 2), attack("A2", 5, 2), attack("A3", 5, 0, true), defend("D1", 3, 2)],
      [
        lane("lane-center", "A1", "A2", ["D1"]),
        lane("lane-side", "A1", "A3", [], ["c2r1", "c2r3"]),
      ],
    ),
    state(
      "st-02-reveal",
      [attack("A1", 1, 2), attack("A2", 5, 2), attack("A3", 5, 0, true), defend("D1", 4, 1)],
      [
        lane("lane-center", "A1", "A2", ["D1"]),
        lane("lane-side", "A1", "A3", [], ["c2r1", "c2r3"]),
      ],
    ),
    state("st-02-support-up", [
      attack("A1", 2, 1),
      attack("A2", 5, 2),
      attack("A3", 5, 0, true),
      defend("D1", 4, 1),
    ]),
    state("st-02-support-down", [
      attack("A1", 2, 3),
      attack("A2", 5, 2),
      attack("A3", 5, 0, true),
      defend("D1", 4, 1),
    ]),
  ],
  openLaneIds: ["lane-side"],
  approvedSupportCellIds: ["c2r1", "c2r3"],
  acceptedSequenceIds: [],
  sourceNote:
    "계획서 4.1 pass-defender-02 fixture. D1(c3r2)이 lane-center를 막고 lane-side만 열려 있다. 학생은 D1과 lane-side를 함께 근거로 고른다.",
  reviewStatus: "pending",
  misconceptionGuard:
    "가운데가 막혀도 끝난 게 아니에요. 막은 수비를 화면에서 확인하고 다른 길을 찾아요.",
  flow: {
    title: "미션 2 · 막힌 길과 열린 길",
    intro: "수비가 중앙 길에 서 있어요. 열린 길을 찾고 막은 수비도 확인해요.",
    steps: ["OBSERVE", "PREDICT", "PASS", "REVEAL", "SUPPORT"],
    firstStateId: "st-02-start",
    observe: { prompt: "공을 가진 사람을 찾아 눌러요.", ballHolderPlayerId: "A1" },
    predict: {
      stateId: "st-02-start",
      prompt: "중앙 길과 측면 길 중 지금 열려 있는 길은 무엇일까요?",
      evidenceOptions: [EV_LANE_NO_DEFENDER, EV_LANE_SPACE],
    },
    pass: {
      prompt: "패스 길을 정하고, 막힌 길을 막고 있는 수비도 찾아요.",
      transitions: [{ fromStateId: "st-02-start", laneId: "lane-side", nextStateId: "st-02-passed" }],
      evidenceOptions: [EV_LANE_NO_DEFENDER, EV_LANE_SPACE],
    },
    reveal: {
      defenderId: "D1",
      prompt: "수비 D1이 한 칸 움직였어요. 계획을 유지할까요, 수정할까요?",
      transitions: [{ fromStateId: "st-02-passed", toCellId: "c4r1", nextStateId: "st-02-reveal" }],
    },
    support: {
      prompt: "패스를 보낸 A1이 한 칸 움직이면 다음 패스 길이 열려요. 어디로 갈까요?",
      transitions: [
        { fromStateId: "st-02-reveal", playerId: "A1", toCellId: "c2r1", nextStateId: "st-02-support-up" },
        { fromStateId: "st-02-reveal", playerId: "A1", toCellId: "c2r3", nextStateId: "st-02-support-down" },
      ],
      evidenceOptions: [EV_SUPPORT_NEXT, EV_SUPPORT_SAFE],
    },
    sequenceStepsById: {},
  },
};
