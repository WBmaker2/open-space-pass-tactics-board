import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { validateMissions } from "./validateContent";
import type { PassMissionRecord } from "../domain/types";

type DeepWritable<T> = T extends readonly (infer R)[]
  ? DeepWritable<R>[]
  : T extends object
    ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
    : T;

function draftMissions(modify: (draft: DeepWritable<PassMissionRecord>[]) => void): DeepWritable<PassMissionRecord>[] {
  const draft = structuredClone(missions) as unknown as DeepWritable<PassMissionRecord>[];
  modify(draft);
  return draft;
}

function expectContentError(draft: DeepWritable<PassMissionRecord>[], messagePart: RegExp | string) {
  let message = "";
  try {
    validateMissions(draft);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  expect(message, `검증이 실패해야 한다: ${String(messagePart)}`).not.toBe("");
  expect(message).toMatch(messagePart);
}

describe("콘텐츠 검증기", () => {
  it("실제 검수된 6개 미션은 검증을 통과한다", () => {
    expect(() => validateMissions(missions)).not.toThrow();
  });

  it("미션 개수가 6개가 아니면 실패한다", () => {
    expectContentError(draftMissions((draft) => void draft.pop()), /6개/);
  });

  it("미션 ID가 중복되면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        draft[1].id = draft[0].id;
      }),
      /중복/,
    );
  });

  it("sourceNote가 비어 있으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        draft[0].sourceNote = "  ";
      }),
      /sourceNote/,
    );
  });

  it("misconceptionGuard가 비어 있으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        draft[2].misconceptionGuard = "";
      }),
      /misconceptionGuard/,
    );
  });

  it("reviewStatus가 허용되지 않은 값이면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[0].reviewStatus as string) = "draft";
      }),
      /reviewStatus/,
    );
  });

  it("같은 state 안에서 선수 좌표가 겹치면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const state = draft[0].states[0];
        const a3 = state.players.find((player) => player.id === "A3");
        if (a3) (a3.cell as { column: number; row: number }).column = 1;
        if (a3) (a3.cell as { column: number; row: number }).row = 2;
      }),
      /겹친다/,
    );
  });

  it("공을 가진 선수가 두 명이면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        draft[0].states[0].players.find((player) => player.id === "A2")!.hasBall = true;
      }),
      /공을 가진/,
    );
  });

  it("공을 가진 선수가 없으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        draft[0].states[0].players.find((player) => player.id === "A1")!.hasBall = false;
      }),
      /공을 가진/,
    );
  });

  it("격자를 벗어난 좌표가 있으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const player = draft[0].states[0].players[0];
        (player.cell as { column: number }).column = 9;
      }),
      /격자/,
    );
  });

  it("lane이 존재하지 않는 선수를 참조하면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[0].states[0].lanes[0].fromPlayerId as string) = "A9";
      }),
      /lane/,
    );
  });

  it("lane의 nextSupportCellIds가 격자 밖이면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[0].states[0].lanes[0].nextSupportCellIds as string[]) = ["c9r9"];
      }),
      /지원 칸/,
    );
  });

  it("openLaneIds가 어떤 state에서도 열려 있지 않으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[0].openLaneIds as string[]) = ["lane-a1-a3"];
      }),
      /열려 있/,
    );
  });

  it("flow 전이가 존재하지 않는 state를 참조하면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[2].flow.move!.transitions[0].nextStateId as string) = "st-없음";
      }),
      /state/,
    );
  });

  it("이동 전이에서 옮긴 선수만 자리가 바뀌지 않으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const move = draft[2].flow.move!;
        const down = move.transitions.find((t) => t.toCellId === "c4r3")!;
        (down.nextStateId as string) = "st-03-up";
      }),
      /일치/,
    );
  });

  it("패스 전이 뒤 공이 받을 사람에게 없으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const pass = draft[0].flow.pass!;
        (pass.transitions[0].nextStateId as string) = "st-01-start";
      }),
      /공/,
    );
  });

  it("수비 공개 전이에서 수비가 새 칸에 없으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const reveal = draft[0].flow.reveal!;
        (reveal.transitions[0].nextStateId as string) = "st-01-passed";
      }),
      /수비/,
    );
  });

  it("한 칸(대각선 포함) 이상 떨어진 이동은 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const move = draft[2].flow.move!;
        const up = move.transitions.find((t) => t.toCellId === "c4r1")!;
        const upState = draft[2].states.find((state) => state.id === up.nextStateId)!;
        const a2 = upState.players.find((player) => player.id === "A2")!;
        (a2.cell as { column: number }).column = 6;
        (a2.cell as { row: number }).row = 4;
      }),
      /한 칸/,
    );
  });

  it("승인 시퀀스가 flow의 sequenceStepsById에 없으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const mission = draft[5];
        (mission.acceptedSequenceIds as string[]) = ["seq-left", "seq-없음"];
      }),
      /sequence/,
    );
  });

  it("승인 시퀀스의 패스가 그 state에서 열려 있지 않으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        const mission = draft[5];
        (mission.flow.sequenceStepsById["seq-left"][1] as { laneId: string }).laneId = "lane-a1-a3";
      }),
      /sequence/,
    );
  });

  it("flow 단계에 INTRO나 REPORT가 섞이면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[0].flow.steps as string[]) = ["OBSERVE", "REPORT"];
      }),
      /단계/,
    );
  });

  it("흐름이 없는 승인 지원 칸이 있으면 실패한다", () => {
    expectContentError(
      draftMissions((draft) => {
        (draft[0].approvedSupportCellIds as string[]) = ["c2r1", "c2r3", "c5r5"];
      }),
      /승인 지원 칸/,
    );
  });
});
