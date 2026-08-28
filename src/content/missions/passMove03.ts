import type { PassMissionRecord } from "../../domain/types";
import {
  attack,
  defend,
  EV_LANE_NO_DEFENDER,
  EV_MOVE_AWAY,
  EV_MOVE_OPEN_LANE,
  lane,
  state,
} from "../missionBuilders";

export const passMove03: PassMissionRecord = {
  id: "pass-move-03",
  states: [
    state(
      "st-03-start",
      [attack("A1", 1, 2, true), attack("A2", 4, 2), defend("D1", 3, 2)],
      [lane("lane-a1-a2", "A1", "A2", ["D1"])],
    ),
    state(
      "st-03-up",
      [attack("A1", 1, 2, true), attack("A2", 4, 1), defend("D1", 3, 2)],
      [lane("lane-a1-a2-up", "A1", "A2", [])],
    ),
    state(
      "st-03-down",
      [attack("A1", 1, 2, true), attack("A2", 4, 3), defend("D1", 3, 2)],
      [lane("lane-a1-a2-down", "A1", "A2", [])],
    ),
    state(
      "st-03-up-passed",
      [attack("A1", 1, 2), attack("A2", 4, 1, true), defend("D1", 3, 2)],
      [lane("lane-a1-a2-up", "A1", "A2", [])],
    ),
    state(
      "st-03-down-passed",
      [attack("A1", 1, 2), attack("A2", 4, 3, true), defend("D1", 3, 2)],
      [lane("lane-a1-a2-down", "A1", "A2", [])],
    ),
    state(
      "st-03-up-reveal",
      [attack("A1", 1, 2), attack("A2", 4, 1, true), defend("D1", 3, 1)],
      [lane("lane-a1-a2-up", "A1", "A2", [])],
    ),
    state(
      "st-03-down-reveal",
      [attack("A1", 1, 2), attack("A2", 4, 3, true), defend("D1", 3, 3)],
      [lane("lane-a1-a2-down", "A1", "A2", [])],
    ),
  ],
  openLaneIds: ["lane-a1-a2-up", "lane-a1-a2-down"],
  approvedSupportCellIds: ["c4r1", "c4r3"],
  acceptedSequenceIds: [],
  sourceNote:
    "계획서 4.1 pass-move-03 fixture. 시작 lane-a1-a2는 D1(c3r2)이 막으며, A2가 승인 셀 c4r1 또는 c4r3으로 이동한 뒤 lane-a1-a2-up/down이 열린다.",
  reviewStatus: "pending",
  misconceptionGuard:
    "길이 막혔다고 포기하지 않아요. 받을 사람이 한 칸 움직이면 길이 다시 열려요.",
  flow: {
    title: "미션 3 · 한 칸 이동으로 길 다시 열기",
    intro: "길이 막혔을 때 받을 사람의 이동을 생각해요.",
    steps: ["OBSERVE", "PREDICT", "MOVE", "PASS", "REVEAL"],
    firstStateId: "st-03-start",
    observe: { prompt: "공을 가진 사람을 찾아 눌러요.", ballHolderPlayerId: "A1" },
    predict: {
      stateId: "st-03-start",
      prompt: "지금 바로 A1이 A2에게 패스할 수 있을까요? 길을 골라 확인해요.",
      evidenceOptions: [EV_LANE_NO_DEFENDER, EV_MOVE_OPEN_LANE],
    },
    move: {
      prompt: "받을 사람 A2를 어디로 옮기면 길이 다시 열릴까요? 한 칸만 움직일 수 있어요.",
      transitions: [
        { fromStateId: "st-03-start", playerId: "A2", toCellId: "c4r1", nextStateId: "st-03-up" },
        { fromStateId: "st-03-start", playerId: "A2", toCellId: "c4r3", nextStateId: "st-03-down" },
      ],
      evidenceOptions: [EV_MOVE_OPEN_LANE, EV_MOVE_AWAY],
    },
    pass: {
      prompt: "이동한 뒤에 열린 패스 길을 골라요.",
      transitions: [
        { fromStateId: "st-03-up", laneId: "lane-a1-a2-up", nextStateId: "st-03-up-passed" },
        { fromStateId: "st-03-down", laneId: "lane-a1-a2-down", nextStateId: "st-03-down-passed" },
      ],
      evidenceOptions: [EV_LANE_NO_DEFENDER],
    },
    reveal: {
      defenderId: "D1",
      prompt: "수비 D1이 따라와요. 계획을 유지할까요, 수정할까요?",
      transitions: [
        { fromStateId: "st-03-up-passed", toCellId: "c3r1", nextStateId: "st-03-up-reveal" },
        { fromStateId: "st-03-down-passed", toCellId: "c3r3", nextStateId: "st-03-down-reveal" },
      ],
    },
    sequenceStepsById: {},
  },
};
