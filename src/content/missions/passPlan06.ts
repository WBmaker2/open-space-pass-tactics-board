import type { PassMissionRecord } from "../../domain/types";
import {
  attack,
  defend,
  EV_LANE_NO_DEFENDER,
  EV_MOVE_AWAY,
  EV_MOVE_OPEN_LANE,
  EV_SUPPORT_NEXT,
  lane,
  state,
} from "../missionBuilders";

export const passPlan06: PassMissionRecord = {
  id: "pass-plan-06",
  states: [
    state(
      "st-06-start",
      [
        attack("A1", 1, 2, true),
        attack("A2", 4, 1),
        attack("A3", 4, 3),
        attack("A4", 2, 4),
        defend("D1", 3, 2),
        defend("D2", 4, 2),
      ],
      [lane("lane-a1-a2", "A1", "A2", ["D1"]), lane("lane-a1-a3", "A1", "A3", ["D2"])],
    ),
    state(
      "st-06-left",
      [
        attack("A1", 1, 2, true),
        attack("A2", 5, 1),
        attack("A3", 4, 3),
        attack("A4", 2, 4),
        defend("D1", 3, 2),
        defend("D2", 4, 2),
      ],
      [lane("lane-a1-a2", "A1", "A2", []), lane("lane-a1-a3", "A1", "A3", ["D2"])],
    ),
    state(
      "st-06-right",
      [
        attack("A1", 1, 2, true),
        attack("A2", 4, 1),
        attack("A3", 5, 3),
        attack("A4", 2, 4),
        defend("D1", 3, 2),
        defend("D2", 4, 2),
      ],
      [lane("lane-a1-a2", "A1", "A2", ["D1"]), lane("lane-a1-a3", "A1", "A3", [])],
    ),
    state(
      "st-06-left-passed",
      [
        attack("A1", 1, 2),
        attack("A2", 5, 1, true),
        attack("A3", 4, 3),
        attack("A4", 2, 4),
        defend("D1", 3, 2),
        defend("D2", 4, 2),
      ],
      [lane("lane-a1-a2", "A1", "A2", []), lane("lane-a1-a3", "A1", "A3", ["D2"])],
    ),
    state(
      "st-06-right-passed",
      [
        attack("A1", 1, 2),
        attack("A2", 4, 1),
        attack("A3", 5, 3, true),
        attack("A4", 2, 4),
        defend("D1", 3, 2),
        defend("D2", 4, 2),
      ],
      [lane("lane-a1-a2", "A1", "A2", ["D1"]), lane("lane-a1-a3", "A1", "A3", [])],
    ),
    state("st-06-left-support", [
      attack("A1", 2, 2),
      attack("A2", 5, 1, true),
      attack("A3", 4, 3),
      attack("A4", 2, 4),
      defend("D1", 3, 2),
      defend("D2", 4, 2),
    ], [lane("lane-a2-a1", "A2", "A1", [])]),
    state("st-06-right-support", [
      attack("A1", 2, 2),
      attack("A2", 4, 1),
      attack("A3", 5, 3, true),
      attack("A4", 2, 4),
      defend("D1", 3, 2),
      defend("D2", 4, 2),
    ], [lane("lane-a3-a1", "A3", "A1", [])]),
  ],
  openLaneIds: ["lane-a1-a2", "lane-a1-a3", "lane-a2-a1", "lane-a3-a1"],
  approvedSupportCellIds: ["c5r1", "c5r3", "c2r2"],
  acceptedSequenceIds: ["seq-left", "seq-right"],
  sourceNote:
    "계획서 4.1 pass-plan-06 fixture. seq-left={A2→c5r1, A1→A2, A1→c2r2}와 seq-right={A3→c5r3, A1→A3, A1→c2r2}만 승인한다.",
  reviewStatus: "pending",
  misconceptionGuard:
    "순서가 계획이에요. 받을 사람 이동 → 패스 → 지원이 한 세트로 이어져요.",
  flow: {
    title: "미션 6 · 이동·패스·지원 계획",
    intro: "4대2 상황에서 세 동작을 순서대로 계획해요.",
    steps: ["OBSERVE", "MOVE", "PASS", "SUPPORT"],
    firstStateId: "st-06-start",
    observe: { prompt: "공을 가진 사람을 찾아 눌러요.", ballHolderPlayerId: "A1" },
    move: {
      prompt: "먼저 받을 사람 한 명을 측면 빈 공간으로 옮겨요. 누구를 어디로 옮길까요?",
      transitions: [
        { fromStateId: "st-06-start", playerId: "A2", toCellId: "c5r1", nextStateId: "st-06-left" },
        { fromStateId: "st-06-start", playerId: "A3", toCellId: "c5r3", nextStateId: "st-06-right" },
      ],
      evidenceOptions: [EV_MOVE_OPEN_LANE, EV_MOVE_AWAY],
    },
    pass: {
      prompt: "이동이 끝났어요. 이제 열린 패스 길로 공을 보내고, 막힌 길을 막은 수비도 찾아요.",
      transitions: [
        { fromStateId: "st-06-left", laneId: "lane-a1-a2", nextStateId: "st-06-left-passed" },
        { fromStateId: "st-06-right", laneId: "lane-a1-a3", nextStateId: "st-06-right-passed" },
      ],
      evidenceOptions: [EV_LANE_NO_DEFENDER],
    },
    support: {
      prompt: "마지막으로 패스를 보낸 A1이 한 칸 움직여 팀의 다음 패스를 도와요. 어디로 갈까요?",
      transitions: [
        { fromStateId: "st-06-left-passed", playerId: "A1", toCellId: "c2r2", nextStateId: "st-06-left-support" },
        { fromStateId: "st-06-right-passed", playerId: "A1", toCellId: "c2r2", nextStateId: "st-06-right-support" },
      ],
      evidenceOptions: [EV_SUPPORT_NEXT],
    },
    sequenceStepsById: {
      "seq-left": [
        { kind: "move", playerId: "A2", toCellId: "c5r1" },
        { kind: "pass", laneId: "lane-a1-a2" },
        { kind: "support", playerId: "A1", toCellId: "c2r2" },
      ],
      "seq-right": [
        { kind: "move", playerId: "A3", toCellId: "c5r3" },
        { kind: "pass", laneId: "lane-a1-a3" },
        { kind: "support", playerId: "A1", toCellId: "c2r2" },
      ],
    },
  },
};
